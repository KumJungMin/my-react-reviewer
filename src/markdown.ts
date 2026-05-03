import type { FinalReview } from "./schemas.js";

export const REVIEW_COMMENT_MARKER = "<!-- react-ai-reviewer -->";

export function normalizeFinalMarkdown(finalReview: FinalReview): string {
  const markdown = finalReview.finalMarkdown.trim();

  if (markdown.includes(REVIEW_COMMENT_MARKER)) {
    return markdown;
  }

  return `${REVIEW_COMMENT_MARKER}\n\n${markdown}`;
}

export function noFilesMarkdown(): string {
  return [
    REVIEW_COMMENT_MARKER,
    "",
    "## React AI Review",
    "",
    "리뷰할 React/TypeScript 변경 파일이 없습니다.",
  ].join("\n");
}
