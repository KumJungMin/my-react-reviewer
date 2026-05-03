import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { FinalReviewSchema, ReviewerResultSchema, type FinalReview, type ReviewerResult } from "./schemas.js";
import type { ReviewerDefinition } from "./reviewers.js";
import { loadFinalReviewerPrompt, loadPrompt } from "./reviewers.js";
import { asJson } from "./text.js";

export type ReviewInput = {
  diff: string;
  repositoryContext: string;
};

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({ apiKey });
}

export async function runSingleReviewer(params: {
  client: OpenAI;
  model: string;
  reviewer: ReviewerDefinition;
  input: ReviewInput;
}): Promise<ReviewerResult> {
  const { client, model, reviewer, input } = params;
  const prompt = loadPrompt(reviewer.promptFile);

  const response = await client.responses.parse({
    model,
    store: false,
    input: [
      {
        role: "system",
        content: [
          prompt,
          "",
          "# 공통 출력 규칙",
          "- 반드시 지정된 JSON Schema를 따른다.",
          "- finding이 없으면 findings는 빈 배열로 둔다.",
          "- diff에 근거가 없는 추측성 지적은 만들지 않는다.",
          "- 모든 설명은 한국어로 작성한다.",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "다음 PR diff와 repository context를 리뷰해라.",
          "",
          `리뷰어: ${reviewer.title}`,
          `근거 자료: ${reviewer.sourceBasis}`,
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
  const prompt = loadFinalReviewerPrompt();

  const response = await client.responses.parse({
    model,
    store: false,
    input: [
      {
        role: "system",
        content: [
          prompt,
          "",
          "# 공통 출력 규칙",
          "- 반드시 지정된 JSON Schema를 따른다.",
          "- finalMarkdown은 한국어 Markdown으로 작성한다.",
          "- finalMarkdown 첫 줄 또는 초반에 반드시 '<!-- react-ai-reviewer -->' 마커를 포함한다.",
          "- 최종 리뷰는 사람이 바로 PR에서 읽고 수정할 수 있게 구체적으로 작성한다.",
        ].join("\n"),
      },
      {
        role: "user",
        content: asJson({
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
