import { z } from "zod";

export const ReviewSeveritySchema = z.enum(["critical", "high", "medium", "low"]);

export const ReviewCategorySchema = z.enum([
  "bug",
  "react",
  "hooks",
  "architecture",
  "performance",
  "test",
  "readability",
  "maintainability",
]);

export const ReviewCommentSchema = z.object({
  filePath: z.string().nullable().describe("Changed file path when grounded in the diff, otherwise null."),
  line: z.number().int().positive().nullable().describe("Single changed line number when grounded in the diff, otherwise null."),
  severity: ReviewSeveritySchema,
  category: ReviewCategorySchema,
  title: z.string(),
  reason: z.string(),
  suggestion: z.string(),
  confidence: z.number().min(0).max(1),
  sourceReviewerId: z.string(),
});

export const ReviewerResultSchema = z.object({
  reviewerId: z.string(),
  summary: z.string(),
  comments: z.array(ReviewCommentSchema),
});

export const FinalReviewCommentSchema = ReviewCommentSchema.omit({ sourceReviewerId: true }).extend({
  sourceReviewerIds: z.array(z.string()).min(1),
});

export const FinalReviewSchema = z.object({
  summary: z.string(),
  mustFix: z.array(FinalReviewCommentSchema),
  shouldFix: z.array(FinalReviewCommentSchema),
  suggestions: z.array(FinalReviewCommentSchema),
  finalMarkdown: z.string().describe("Final Korean Markdown review body. Must include the marker comment."),
});

export type ReviewSeverity = z.infer<typeof ReviewSeveritySchema>;
export type ReviewCategory = z.infer<typeof ReviewCategorySchema>;
export type ReviewComment = z.infer<typeof ReviewCommentSchema>;
export type FinalReviewComment = z.infer<typeof FinalReviewCommentSchema>;
export type ReviewerResult = z.infer<typeof ReviewerResultSchema>;
export type FinalReview = z.infer<typeof FinalReviewSchema>;
