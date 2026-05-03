import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type ReviewerDefinition = {
  id: string;
  title: string;
  sourceBasis: string;
  promptFile: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

export const reviewerDefinitions: ReviewerDefinition[] = [
  {
    id: "react-official",
    title: "React 공식 문서 리뷰어",
    sourceBasis:
      "React 공식 문서: Rules of React, Components and Hooks must be pure, Rules of Hooks, useEffect, You Might Not Need an Effect, state structure",
    promptFile: "01-react-official.md",
  },
  {
    id: "react-hooks-eslint",
    title: "React Hooks / ESLint 리뷰어",
    sourceBasis:
      "React 공식 eslint-plugin-react-hooks: rules-of-hooks, exhaustive-deps, immutability, set-state-in-render, purity",
    promptFile: "02-react-hooks-eslint.md",
  },
  {
    id: "dan-abramov",
    title: "Dan Abramov Resilient Components 리뷰어",
    sourceBasis:
      "Dan Abramov: Writing Resilient Components, useEffect synchronization 관점. React Core 기여자의 해석 자료로 사용한다.",
    promptFile: "03-dan-abramov.md",
  },
  {
    id: "toss",
    title: "Toss 유지보수성 리뷰어",
    sourceBasis:
      "Toss Frontend Fundamentals, Toss Tech, Toss SLASH: 수정하기 쉬운 코드, 응집도, 단일 책임, 추상화 레벨의 일관성",
    promptFile: "04-toss.md",
  },
  {
    id: "vercel-performance",
    title: "Vercel 성능 리뷰어",
    sourceBasis:
      "Vercel React Best Practices: async waterfall, bundle size, server/client data fetching, re-render optimization",
    promptFile: "05-vercel-performance.md",
  },
  {
    id: "kent-testing",
    title: "Kent C. Dodds 테스트 리뷰어",
    sourceBasis:
      "Kent C. Dodds, Testing Library: implementation details보다 사용자 행동 중심 테스트",
    promptFile: "06-kent-testing.md",
  },
  {
    id: "bulletproof-react",
    title: "Bulletproof React 아키텍처 리뷰어",
    sourceBasis:
      "Bulletproof React: feature boundary, API layer, shared module, production React architecture. 공식 React 규칙은 아니므로 맥락에 맞게 적용한다.",
    promptFile: "07-bulletproof-react.md",
  },
  {
    id: "clean-code-design",
    title: "Clean Code / SOLID 디자인 리뷰어",
    sourceBasis:
      "Robert C. Martin/Object Mentor SOLID 원칙, Martin Fowler Refactoring/code smells, Google Engineering Practices code health, GoF Design Patterns, cohesion/coupling 설계 원칙",
    promptFile: "08-clean-code-design.md",
  },
];

export function loadPrompt(promptFile: string): string {
  const filePath = path.join(projectRoot, "prompts", promptFile);
  return fs.readFileSync(filePath, "utf8");
}

export function loadFinalReviewerPrompt(): string {
  return loadPrompt("99-final-reviewer.md");
}

export function selectReviewers(selectedIds: string[] | null): ReviewerDefinition[] {
  if (!selectedIds || selectedIds.length === 0) return reviewerDefinitions;

  const unknownIds = selectedIds.filter(
    (id) => !reviewerDefinitions.some((reviewer) => reviewer.id === id),
  );

  if (unknownIds.length > 0) {
    throw new Error(`Unknown reviewer id(s): ${unknownIds.join(", ")}`);
  }

  return reviewerDefinitions.filter((reviewer) => selectedIds.includes(reviewer.id));
}
