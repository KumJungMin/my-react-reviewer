import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const ReviewerTriggerSchema = z.object({
  filePatterns: z.array(z.string()),
  keywords: z.array(z.string()),
});

const ReviewerConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  sourceBasis: z.string(),
  promptPath: z.string(),
  contextPath: z.string(),
  rulesPath: z.string(),
  order: z.number().int(),
  enabled: z.boolean(),
  type: z.enum(["source", "final"]),
  excludeFilePatterns: z.array(z.string()).default([]),
  triggers: ReviewerTriggerSchema,
});

const ReviewerCatalogSchema = z.object({
  fallbackReviewerIds: z.array(z.string()).min(1),
  reviewers: z.array(ReviewerConfigSchema),
});

export type ReviewerConfig = z.infer<typeof ReviewerConfigSchema>;
export type ReviewerCatalog = z.infer<typeof ReviewerCatalogSchema>;
export type ReviewerAssets = {
  prompt: string;
  context: string;
  rules: string;
};

export type SelectReviewersInput = {
  diff: string;
  changedFiles: string[];
  reviewers: ReviewerConfig[];
  fallbackReviewerIds?: string[];
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function readTextFile(relativePath: string): string {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function loadReviewerCatalog(): ReviewerCatalog {
  const parsed = ReviewerCatalogSchema.parse(JSON.parse(readTextFile("reviewers.config.json")));
  const reviewerIds = new Set(parsed.reviewers.map((reviewer) => reviewer.id));

  for (const fallbackReviewerId of parsed.fallbackReviewerIds) {
    if (!reviewerIds.has(fallbackReviewerId)) {
      throw new Error(`Unknown fallback reviewer id: ${fallbackReviewerId}`);
    }
  }

  return parsed;
}

const reviewerCatalog = loadReviewerCatalog();

function toRegexSource(pattern: string): string {
  const doubleStarDirPlaceholder = "__DOUBLE_STAR_DIR__";
  const doubleStarPlaceholder = "__DOUBLE_STAR__";
  const singleStarPlaceholder = "__SINGLE_STAR__";
  const questionPlaceholder = "__QUESTION__";

  return pattern
    .replace(/\*\*\//g, doubleStarDirPlaceholder)
    .replace(/\*\*/g, doubleStarPlaceholder)
    .replace(/\*/g, singleStarPlaceholder)
    .replace(/\?/g, questionPlaceholder)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replaceAll(doubleStarDirPlaceholder, "(?:.*/)?")
    .replaceAll(doubleStarPlaceholder, ".*")
    .replaceAll(singleStarPlaceholder, "[^/]*")
    .replaceAll(questionPlaceholder, "[^/]");
}

function matchesGlob(filePath: string, pattern: string): boolean {
  return new RegExp(`^${toRegexSource(pattern)}$`).test(filePath);
}

function isExcludedFile(reviewer: ReviewerConfig, filePath: string): boolean {
  return reviewer.excludeFilePatterns.some((pattern) => matchesGlob(filePath, pattern));
}

function reviewerHasEligibleChangedFile(reviewer: ReviewerConfig, changedFiles: string[]): boolean {
  return changedFiles.some((filePath) => !isExcludedFile(reviewer, filePath));
}

function reviewerMatchesChangedFiles(reviewer: ReviewerConfig, changedFiles: string[]): boolean {
  if (reviewer.triggers.filePatterns.length === 0) return false;

  return changedFiles.some((filePath) => {
    if (isExcludedFile(reviewer, filePath)) return false;
    return reviewer.triggers.filePatterns.some((pattern) => matchesGlob(filePath, pattern));
  });
}

function reviewerMatchesDiffKeywords(reviewer: ReviewerConfig, lowerCaseDiff: string): boolean {
  if (reviewer.triggers.keywords.length === 0) return false;
  return reviewer.triggers.keywords.some((keyword) => lowerCaseDiff.includes(keyword.toLowerCase()));
}

function sortReviewers(reviewers: ReviewerConfig[]): ReviewerConfig[] {
  return reviewers.slice().sort((left, right) => left.order - right.order);
}

function uniqueReviewers(reviewers: ReviewerConfig[]): ReviewerConfig[] {
  return Array.from(new Map(reviewers.map((reviewer) => [reviewer.id, reviewer])).values());
}

export function getReviewerCatalog(): ReviewerCatalog {
  return reviewerCatalog;
}

export function getAllReviewers(): ReviewerConfig[] {
  return sortReviewers(reviewerCatalog.reviewers);
}

export function getFinalReviewer(reviewers: ReviewerConfig[] = getAllReviewers()): ReviewerConfig {
  const finalReviewer = reviewers.find((reviewer) => reviewer.type === "final");
  if (!finalReviewer) {
    throw new Error("Missing final reviewer configuration.");
  }

  return finalReviewer;
}

export function getSourceReviewers(reviewers: ReviewerConfig[] = getAllReviewers()): ReviewerConfig[] {
  return reviewers.filter((reviewer) => reviewer.type === "source");
}

export function getReviewerById(id: string, reviewers: ReviewerConfig[] = getAllReviewers()): ReviewerConfig {
  const reviewer = reviewers.find((candidate) => candidate.id === id);
  if (!reviewer) {
    throw new Error(`Unknown reviewer id: ${id}`);
  }

  return reviewer;
}

export function loadReviewerAssets(reviewer: ReviewerConfig): ReviewerAssets {
  return {
    prompt: readTextFile(reviewer.promptPath),
    context: readTextFile(reviewer.contextPath),
    rules: readTextFile(reviewer.rulesPath),
  };
}

export function selectReviewers(input: SelectReviewersInput): ReviewerConfig[] {
  const reviewers = sortReviewers(input.reviewers.filter((reviewer) => reviewer.enabled));
  const finalReviewer = getFinalReviewer(reviewers);
  const sourceReviewers = getSourceReviewers(reviewers);
  const lowerCaseDiff = input.diff.toLowerCase();

  const matchedReviewers = sourceReviewers.filter(
    (reviewer) =>
      reviewerMatchesChangedFiles(reviewer, input.changedFiles) ||
      (reviewerHasEligibleChangedFile(reviewer, input.changedFiles) &&
        reviewerMatchesDiffKeywords(reviewer, lowerCaseDiff)),
  );

  const fallbackReviewerIds = input.fallbackReviewerIds ?? reviewerCatalog.fallbackReviewerIds;
  const selectedSourceReviewers =
    matchedReviewers.length > 0
      ? matchedReviewers
      : fallbackReviewerIds
          .map((id) => getReviewerById(id, reviewers))
          .filter((reviewer) => reviewer.enabled && reviewer.type === "source");

  return uniqueReviewers([...selectedSourceReviewers, finalReviewer]).sort((left, right) => left.order - right.order);
}

export function selectReviewersByIds(selectedIds: string[], reviewers: ReviewerConfig[] = getAllReviewers()): ReviewerConfig[] {
  const selectedReviewers = selectedIds.map((id) => getReviewerById(id, reviewers)).filter((reviewer) => reviewer.enabled);
  return uniqueReviewers([...selectedReviewers, getFinalReviewer(reviewers)]).sort(
    (left, right) => left.order - right.order,
  );
}
