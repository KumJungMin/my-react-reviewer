import fs from "node:fs";
import { Octokit } from "@octokit/rest";
import { truncateMiddle } from "./text.js";

export type PullRequestContext = {
  owner: string;
  repo: string;
  pullNumber: number;
};

export type PullRequestDiffResult = {
  diff: string;
  fileCount: number;
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value.trim();
}

export function createOctokit(): Octokit {
  return new Octokit({ auth: requiredEnv("GITHUB_TOKEN") });
}

export function getPullRequestContextFromEnv(): PullRequestContext {
  const eventPath = requiredEnv("GITHUB_EVENT_PATH");
  const repository = requiredEnv("GITHUB_REPOSITORY");
  const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  const pullNumber = event.pull_request?.number;

  if (!pullNumber) {
    throw new Error("This command must run on a GitHub pull_request event, or use --diff for local mode.");
  }

  const [owner, repo] = repository.split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid GITHUB_REPOSITORY value: ${repository}`);
  }

  return { owner, repo, pullNumber };
}

export async function fetchPullRequestDiff(params: {
  octokit: Octokit;
  context: PullRequestContext;
  maxChars: number;
}): Promise<PullRequestDiffResult> {
  const { octokit, context, maxChars } = params;

  const files = await octokit.paginate(octokit.pulls.listFiles, {
    owner: context.owner,
    repo: context.repo,
    pull_number: context.pullNumber,
    per_page: 100,
  });

  const reviewableFiles = files.filter((file) => {
    const isReviewableExtension = /\.(tsx|ts|jsx|js)$/.test(file.filename);
    const isRelevantConfig = /(^|\/)(package\.json|tsconfig\.json|eslint\.config\..*|\.eslintrc.*|vite\.config\..*|next\.config\..*)$/.test(
      file.filename,
    );
    const isIgnored =
      file.filename.includes("node_modules/") ||
      file.filename.endsWith(".snap") ||
      file.filename.endsWith(".lock") ||
      file.status === "removed";

    return !isIgnored && Boolean(file.patch) && (isReviewableExtension || isRelevantConfig);
  });

  const diff = reviewableFiles
    .map((file) => {
      return [
        `FILE: ${file.filename}`,
        `STATUS: ${file.status}`,
        `ADDITIONS: ${file.additions}`,
        `DELETIONS: ${file.deletions}`,
        "PATCH:",
        file.patch,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return {
    diff: truncateMiddle(diff, maxChars),
    fileCount: reviewableFiles.length,
  };
}

export async function upsertPullRequestComment(params: {
  octokit: Octokit;
  context: PullRequestContext;
  body: string;
  marker: string;
}): Promise<void> {
  const { octokit, context, body, marker } = params;

  const comments = await octokit.paginate(octokit.issues.listComments, {
    owner: context.owner,
    repo: context.repo,
    issue_number: context.pullNumber,
    per_page: 100,
  });

  const existingComment = comments
    .slice()
    .reverse()
    .find((comment) => comment.body?.includes(marker));

  if (existingComment) {
    await octokit.issues.updateComment({
      owner: context.owner,
      repo: context.repo,
      comment_id: existingComment.id,
      body,
    });
    return;
  }

  await octokit.issues.createComment({
    owner: context.owner,
    repo: context.repo,
    issue_number: context.pullNumber,
    body,
  });
}
