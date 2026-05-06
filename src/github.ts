import fs from "node:fs";
import { Octokit } from "@octokit/rest";
import { isReviewableFilePath } from "./diff.js";
import { truncateMiddle } from "./text.js";

export type PullRequestContext = {
  owner: string;
  repo: string;
  pullNumber: number;
};

export type PullRequestDiffResult = {
  diff: string;
  fileCount: number;
  changedFiles: string[];
};

export type ReviewRunDecision = {
  shouldRun: boolean;
  reason: string;
};

const REVIEW_COMMANDS = ["/ai-review"];
const TRUSTED_COMMENT_AUTHOR_ASSOCIATIONS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value.trim();
}

function readGitHubEvent(): Record<string, any> {
  const eventPath = requiredEnv("GITHUB_EVENT_PATH");
  return JSON.parse(fs.readFileSync(eventPath, "utf8"));
}

function parsePullNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function hasReviewCommand(body: unknown): boolean {
  if (typeof body !== "string") return false;
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .some((line) => REVIEW_COMMANDS.some((command) => line === command || line.startsWith(`${command} `)));
}

function isTrustedCommentAuthorAssociation(value: unknown): boolean {
  return typeof value === "string" && TRUSTED_COMMENT_AUTHOR_ASSOCIATIONS.has(value);
}

export function createOctokit(): Octokit {
  return new Octokit({ auth: requiredEnv("GITHUB_TOKEN") });
}

export function shouldRunGitHubReviewFromEnv(): ReviewRunDecision {
  if (!process.env.GITHUB_EVENT_PATH) {
    return { shouldRun: true, reason: "Non-GitHub environment." };
  }

  const eventName = process.env.GITHUB_EVENT_NAME ?? "";
  const event = readGitHubEvent();

  if (eventName === "pull_request" || eventName === "pull_request_target") {
    if (event.pull_request?.draft === true) {
      return { shouldRun: false, reason: "Skipping draft pull request until ready_for_review or manual command." };
    }

    return { shouldRun: true, reason: `Running for ${eventName}.` };
  }

  if (eventName === "issue_comment") {
    if (!event.issue?.pull_request) {
      return { shouldRun: false, reason: "Skipping issue comment because it is not on a pull request." };
    }

    if (!hasReviewCommand(event.comment?.body)) {
      return { shouldRun: false, reason: `Skipping comment without ${REVIEW_COMMANDS[0]} command.` };
    }

    if (!isTrustedCommentAuthorAssociation(event.comment?.author_association)) {
      return { shouldRun: false, reason: "Skipping review command from an untrusted commenter." };
    }

    return { shouldRun: true, reason: "Running for trusted pull request review command." };
  }

  if (eventName === "workflow_dispatch") {
    const pullNumber = parsePullNumber(event.inputs?.pr_number);
    if (!pullNumber) {
      return { shouldRun: false, reason: "Skipping workflow_dispatch because pr_number is missing or invalid." };
    }

    return { shouldRun: true, reason: "Running for manual workflow_dispatch." };
  }

  return { shouldRun: false, reason: `Skipping unsupported GitHub event: ${eventName || "unknown"}.` };
}

export function getPullRequestContextFromEnv(): PullRequestContext {
  const repository = requiredEnv("GITHUB_REPOSITORY");
  const event = readGitHubEvent();
  const pullNumber =
    parsePullNumber(event.pull_request?.number) ??
    (event.issue?.pull_request ? parsePullNumber(event.issue?.number) : null) ??
    parsePullNumber(event.inputs?.pr_number);

  if (!pullNumber) {
    throw new Error("This command must run on a GitHub pull_request, issue_comment, or workflow_dispatch event, or use --diff for local mode.");
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

  const reviewableFiles = files.filter(
    (file) => file.status !== "removed" && Boolean(file.patch) && isReviewableFilePath(file.filename),
  );

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
    changedFiles: reviewableFiles.map((file) => file.filename),
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
