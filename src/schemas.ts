import { z } from "zod";

export const SeveritySchema = z.enum(["blocker", "high", "medium", "low", "info"]);

export const CategorySchema = z.enum([
  "react-correctness",
  "hooks",
  "effect",
  "state",
  "data-flow",
  "maintainability",
  "abstraction",
  "performance",
  "testing",
  "architecture",
  "design",
  "accessibility",
  "security",
]);

export const FindingSchema = z.object({
  id: z.string().describe("Stable identifier such as react-official-001."),
  reviewer: z.string().describe("Reviewer name that produced or owns this finding."),
  sourceBasis: z.string().describe("Authority source or principle behind the finding."),
  severity: SeveritySchema,
  category: CategorySchema,
  file: z.string().nullable().describe("File path when known, otherwise null."),
  lineStart: z.number().int().positive().nullable().describe("Start line when known, otherwise null."),
  lineEnd: z.number().int().positive().nullable().describe("End line when known, otherwise null."),
  title: z.string(),
  problem: z.string(),
  evidence: z.string().describe("Concrete evidence from the diff or repository context."),
  recommendation: z.string(),
  examplePatch: z.string().nullable().describe("Small suggested patch, or null if not applicable."),
  confidence: z.enum(["high", "medium", "low"]),
});

export const ReviewerResultSchema = z.object({
  reviewer: z.string(),
  summary: z.string(),
  findings: z.array(FindingSchema),
  noIssueNotes: z.array(z.string()),
});

export const SourceSummarySchema = z.object({
  reviewer: z.string(),
  summary: z.string(),
  findingCount: z.number().int().nonnegative(),
});

export const FinalReviewSchema = z.object({
  oneLineConclusion: z.string(),
  mustFix: z.array(FindingSchema),
  shouldFix: z.array(FindingSchema),
  suggestions: z.array(FindingSchema),
  sourceSummaries: z.array(SourceSummarySchema),
  finalMarkdown: z.string().describe("Final Korean Markdown review body. Must include the marker comment."),
});

export type Severity = z.infer<typeof SeveritySchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Finding = z.infer<typeof FindingSchema>;
export type ReviewerResult = z.infer<typeof ReviewerResultSchema>;
export type FinalReview = z.infer<typeof FinalReviewSchema>;
