import fs from "node:fs";
import path from "node:path";
import { truncateMiddle } from "./text.js";

const DEFAULT_CONTEXT_FILE_CHARS = 8_000;
const DEFAULT_CONTEXT_TOTAL_CHARS = 30_000;
const MIN_CONTEXT_FILE_BUDGET = 500;

type ContextFileCandidate = {
  path: string;
  maxChars?: number;
};

const CONTEXT_FILE_CANDIDATES: ContextFileCandidate[] = [
  { path: "package.json" },
  { path: "tsconfig.json" },
  { path: "eslint.config.js" },
  { path: "eslint.config.mjs" },
  { path: "eslint.config.cjs" },
  { path: "eslint.config.ts" },
  { path: ".eslintrc" },
  { path: ".eslintrc.json" },
  { path: ".eslintrc.js" },
  { path: "vite.config.ts" },
  { path: "vite.config.js" },
  { path: "next.config.js" },
  { path: "next.config.mjs" },
  { path: "next.config.ts" },
  { path: "src/app/layout.tsx", maxChars: 6_000 },
  { path: "src/pages/_app.tsx", maxChars: 6_000 },
  { path: "AGENTS.md", maxChars: 6_000 },
  { path: "ARCHITECTURE.md", maxChars: 8_000 },
  { path: "docs/index.md", maxChars: 5_000 },
  { path: "docs/architecture.md", maxChars: 8_000 },
  { path: "docs/reviewer-contract.md", maxChars: 8_000 },
  { path: "docs/prompt-authoring.md", maxChars: 8_000 },
  { path: "docs/security.md", maxChars: 8_000 },
  { path: "docs/target-project-context.md", maxChars: 8_000 },
  { path: "docs/FRONTEND.md", maxChars: 8_000 },
  { path: "docs/QUALITY.md", maxChars: 8_000 },
  { path: "docs/SECURITY.md", maxChars: 8_000 },
  { path: ".react-ai-reviewer/context.md", maxChars: 10_000 },
  { path: ".react-ai-reviewer/review-policy.md", maxChars: 10_000 },
];

export type RepositoryContextFile = {
  path: string;
  content: string;
};

export type RepositoryContext = {
  files: RepositoryContextFile[];
};

export type RepositoryContextOptions = {
  rootDir?: string;
  maxTotalChars?: number;
};

export function collectRepositoryContext(options: RepositoryContextOptions = {}): RepositoryContext {
  const rootDir = options.rootDir ?? process.cwd();
  let remainingChars = options.maxTotalChars ?? DEFAULT_CONTEXT_TOTAL_CHARS;
  const files: RepositoryContextFile[] = [];

  for (const candidate of CONTEXT_FILE_CANDIDATES) {
    if (remainingChars < MIN_CONTEXT_FILE_BUDGET) break;

    const absolutePath = path.join(rootDir, candidate.path);
    if (!fs.existsSync(absolutePath)) continue;
    const stat = fs.statSync(absolutePath);
    if (!stat.isFile()) continue;

    const rawContent = fs.readFileSync(absolutePath, "utf8");
    const fileBudget = Math.min(candidate.maxChars ?? DEFAULT_CONTEXT_FILE_CHARS, remainingChars);
    const content = truncateMiddle(rawContent, fileBudget);

    files.push({
      path: candidate.path,
      content,
    });

    remainingChars -= content.length;
  }

  return { files };
}

export function formatRepositoryContext(context: RepositoryContext): string {
  if (context.files.length === 0) {
    return "No repository context files were found.";
  }

  return context.files
    .map((file) => [`FILE: ${file.path}`, "```", file.content, "```"].join("\n"))
    .join("\n\n---\n\n");
}
