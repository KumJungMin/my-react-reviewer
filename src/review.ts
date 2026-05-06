import fs from "node:fs";
import path from "node:path";
import { parseArgs, getStringFlag } from "./cli.js";
import { getRequiredOpenAIApiKey, getRuntimeConfig } from "./config.js";
import { collectRepositoryContext, formatRepositoryContext } from "./context.js";
import { extractChangedFilesFromDiff } from "./diff.js";
import {
  createOctokit,
  fetchPullRequestDiff,
  getPullRequestContextFromEnv,
  shouldRunGitHubReviewFromEnv,
  upsertPullRequestComment,
} from "./github.js";
import { normalizeFinalMarkdown, noFilesMarkdown, REVIEW_COMMENT_MARKER } from "./markdown.js";
import { createOpenAIClient, runFinalReviewer, runSingleReviewer } from "./openaiReview.js";
import { getAllReviewers, getSourceReviewers, selectReviewers, selectReviewersByIds } from "./reviewers.js";
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
  changedFiles: string[];
  githubContext: ReturnType<typeof getPullRequestContextFromEnv> | null;
  octokit: ReturnType<typeof createOctokit> | null;
}> {
  const diffPath = getStringFlag(params.flags, "diff");

  if (diffPath) {
    const rawDiff = fs.readFileSync(diffPath, "utf8");
    const changedFiles = extractChangedFilesFromDiff(rawDiff);
    return {
      diff: truncateMiddle(rawDiff, params.maxDiffChars),
      fileCount: changedFiles.length,
      changedFiles,
      githubContext: null,
      octokit: null,
    };
  }

  const githubContext = getPullRequestContextFromEnv();
  const octokit = createOctokit();
  const { diff, fileCount, changedFiles } = await fetchPullRequestDiff({
    octokit,
    context: githubContext,
    maxChars: params.maxDiffChars,
  });

  return { diff, fileCount, changedFiles, githubContext, octokit };
}

async function main(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2));
  const diffPath = getStringFlag(flags, "diff");

  if (!diffPath) {
    const runDecision = shouldRunGitHubReviewFromEnv();
    if (!runDecision.shouldRun) {
      console.log(runDecision.reason);
      return;
    }
  }

  const config = getRuntimeConfig(flags);

  const { diff, fileCount, changedFiles, githubContext, octokit } = await loadDiff({
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

  const repositoryContext = formatRepositoryContext(
    collectRepositoryContext({
      maxTotalChars: config.maxContextChars,
    }),
  );
  const allReviewers = getAllReviewers();
  const selectedReviewers = config.selectedReviewerIds
    ? selectReviewersByIds(config.selectedReviewerIds, allReviewers)
    : selectReviewers({
        diff,
        changedFiles,
        reviewers: allReviewers,
      });
  const sourceReviewers = getSourceReviewers(selectedReviewers);
  const client = createOpenAIClient(getRequiredOpenAIApiKey());
  const reviewInput = { diff, changedFiles, repositoryContext };
  const reviewerResults = [];

  writeText(
    ".react-ai-reviewer/reviewer-selection.json",
    asJson({
      changedFiles,
      selectedReviewerIds: selectedReviewers.map((reviewer) => reviewer.id),
    }),
  );

  console.log(`Running ${sourceReviewers.length} source-based reviewer(s) with model ${config.openaiModel}...`);

  for (const reviewer of sourceReviewers) {
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
