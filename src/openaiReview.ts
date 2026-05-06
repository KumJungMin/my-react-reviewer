import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { FinalReviewSchema, ReviewerResultSchema, type FinalReview, type ReviewerResult } from "./schemas.js";
import { getFinalReviewer, loadReviewerAssets, type ReviewerConfig } from "./reviewers.js";
import { asJson } from "./text.js";

export type ReviewInput = {
  diff: string;
  changedFiles: string[];
  repositoryContext: string;
};

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}

export async function runSingleReviewer(params: {
  client: OpenAI;
  model: string;
  reviewer: ReviewerConfig;
  input: ReviewInput;
}): Promise<ReviewerResult> {
  const { client, model, reviewer, input } = params;
  const assets = loadReviewerAssets(reviewer);

  const response = await client.responses.parse({
    model,
    store: false,
    input: [
      {
        role: "system",
        content: [
          assets.prompt,
          "",
          "# 공통 출력 규칙",
          "- 반드시 지정된 JSON Schema를 따른다.",
          "- 의미 있는 이슈가 없으면 comments는 빈 배열로 둔다.",
          "- `reviewerId`와 각 comment의 `sourceReviewerId`는 반드시 현재 리뷰어 id와 동일하게 채운다.",
          "- confidence는 0부터 1 사이 숫자로 작성한다.",
          "- diff 또는 제공된 context에 근거가 없는 추측성 지적은 만들지 않는다.",
          "- 모든 설명은 한국어로 작성한다.",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "다음 압축 컨텍스트, 규칙, repository context, PR diff를 근거로 리뷰해라.",
          "",
          "# Reviewer",
          asJson({
            reviewerId: reviewer.id,
            title: reviewer.title,
            sourceBasis: reviewer.sourceBasis,
          }),
          "",
          "# Reviewer compressed context",
          assets.context,
          "",
          "# Reviewer rules",
          assets.rules,
          "",
          "# Changed files",
          input.changedFiles.length > 0 ? input.changedFiles.join("\n") : "(none)",
          "",
          "# Repository context",
          input.repositoryContext,
          "",
          "# PR diff",
          input.diff,
        ].join("\n"),
      },
    ],
    text: {
      format: zodTextFormat(ReviewerResultSchema, reviewer.id),
    },
  });

  if (!response.output_parsed) {
    throw new Error(`No parsed output from reviewer: ${reviewer.id}`);
  }

  return response.output_parsed;
}

export async function runFinalReviewer(params: {
  client: OpenAI;
  model: string;
  input: ReviewInput;
  reviewerResults: ReviewerResult[];
}): Promise<FinalReview> {
  const { client, model, input, reviewerResults } = params;
  const finalReviewer = getFinalReviewer();
  const assets = loadReviewerAssets(finalReviewer);

  const response = await client.responses.parse({
    model,
    store: false,
    input: [
      {
        role: "system",
        content: [
          assets.prompt,
          "",
          "# Final reviewer compressed context",
          assets.context,
          "",
          "# Final reviewer rules",
          assets.rules,
          "",
          "# 공통 출력 규칙",
          "- 반드시 지정된 JSON Schema를 따른다.",
          "- finalMarkdown은 한국어 Markdown으로 작성한다.",
          "- finalMarkdown 첫 줄 또는 초반에 반드시 '<!-- react-ai-reviewer -->' 마커를 포함한다.",
          "- 최종 리뷰는 사람이 바로 PR에서 읽고 수정할 수 있게 구체적으로 작성한다.",
          "- 과장된 severity, diff 근거가 약한 comment, confidence가 낮은 comment는 줄이거나 제거한다.",
        ].join("\n"),
      },
      {
        role: "user",
        content: asJson({
          changedFiles: input.changedFiles,
          repositoryContext: input.repositoryContext,
          diff: input.diff,
          reviewerResults,
        }),
      },
    ],
    text: {
      format: zodTextFormat(FinalReviewSchema, "final_react_review"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("No parsed output from final reviewer.");
  }

  return response.output_parsed;
}
