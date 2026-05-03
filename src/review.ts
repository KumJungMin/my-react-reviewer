import fs from "node:fs";
import path from "node:path";
import { parseArgs, getStringFlag } from "./cli.js";
import { getRuntimeConfig } from "./config.js";
import { collectRepositoryContext, formatRepositoryContext } from "./context.js";
import { createOctokit, fetchPullRequestDiff, getPullRequestContextFromEnv, upsertPullRequestComment } from "./github.js";
import { normalizeFinalMarkdown, noFilesMarkdown, REVIEW_COMMENT_MARKER } from "./markdown.js";
import { createOpenAIClient, runFinalReviewer, runSingleReviewer } from "./openaiReview.js";
import { selectReviewers } from "./reviewers.js";
import { asJson, truncateMiddle } from "./text.js";

function ensureParentDir(filePath: string): void {
  const parent = path.dirname(filePath);
  fs.mkdirSync(parent, { recursive: true });
}

function writeText(filePath: string, content: string): void {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, content, "utf8");
}

async function loadDiff(params: {
  flags: Map<string, string | boolean>;
  maxDiffChars: number;
}): Promise<{
  diff: string;
  fileCount: number;
  githubContext: ReturnType<typeof getPullRequestContextFromEnv> | null;
  octokit: ReturnType<typeof createOctokit> | null;
}> {
  const diffPath = getStringFlag(params.flags, "diff");

  if (diffPath) {
    const rawDiff = fs.readFileSync(diffPath, "utf8");
    return {
      diff: truncateMiddle(rawDiff, params.maxDiffChars),
      fileCount: rawDiff.trim().length > 0 ? 1 : 0,
      githubContext: null,
      octokit: null,
    };
  }

  const githubContext = getPullRequestContextFromEnv();
  const octokit = createOctokit();
  const { diff, fileCount } = await fetchPullRequestDiff({
    octokit,
    context: githubContext,
    maxChars: params.maxDiffChars,
  });

  return { diff, fileCount, githubContext, octokit };
}

async function main(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2));
  const config = getRuntimeConfig(flags);
  const reviewers = selectReviewers(config.selectedReviewerIds);

  const { diff, fileCount, githubContext, octokit } = await loadDiff({
    flags,
    maxDiffChars: config.maxDiffChars,
  });

  if (fileCount === 0 || diff.trim().length === 0) {
    const body = noFilesMarkdown();
    writeText(config.outputPath, body);

    if (config.postComment && githubContext && octokit) {
      await upsertPullRequestComment({
        octokit,
        context: githubContext,
        body,
        marker: REVIEW_COMMENT_MARKER,
      });
    }

    console.log(body);
    return;
  }

  const repositoryContext = formatRepositoryContext(collectRepositoryContext());
  const client = createOpenAIClient(config.openaiApiKey);
  const reviewInput = { diff, repositoryContext };
  const reviewerResults = [];

  console.log(`Running ${reviewers.length} source-based reviewer(s) with model ${config.openaiModel}...`);

  for (const reviewer of reviewers) {
    console.log(`- ${reviewer.id}: ${reviewer.title}`);
    const result = await runSingleReviewer({
      client,
      model: config.openaiModel,
      reviewer,
      input: reviewInput,
    });
    reviewerResults.push(result);
  }

  writeText(".react-ai-reviewer/raw-reviewer-results.json", asJson(reviewerResults));

  console.log("Running final reviewer...");
  const finalReview = await runFinalReviewer({
    client,
    model: config.openaiModel,
    input: reviewInput,
    reviewerResults,
  });

  const finalMarkdown = normalizeFinalMarkdown(finalReview);
  writeText(config.outputPath, finalMarkdown);
  writeText(".react-ai-reviewer/final-review.json", asJson(finalReview));

  if (config.postComment && githubContext && octokit) {
    await upsertPullRequestComment({
      octokit,
      context: githubContext,
      body: finalMarkdown,
      marker: REVIEW_COMMENT_MARKER,
    });
  }

  console.log(finalMarkdown);
}

main().catch((error: unknown) => {
  console.error("React AI review failed.");
  if (error instanceof Error) {
    console.error(error.message);
    if (error.stack) console.error(error.stack);
  } else {
    console.error(error);
  }
  process.exit(1);
});
