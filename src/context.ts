import fs from "node:fs";
import path from "node:path";
import { truncateMiddle } from "./text.js";

const CONTEXT_FILE_CANDIDATES = [
  "package.json",
  "tsconfig.json",
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  ".eslintrc",
  ".eslintrc.json",
  ".eslintrc.js",
  "vite.config.ts",
  "vite.config.js",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "src/app/layout.tsx",
  "src/pages/_app.tsx",
];

export type RepositoryContextFile = {
  path: string;
  content: string;
};

export type RepositoryContext = {
  files: RepositoryContextFile[];
};

export function collectRepositoryContext(rootDir = process.cwd()): RepositoryContext {
  const files: RepositoryContextFile[] = [];

  for (const relativePath of CONTEXT_FILE_CANDIDATES) {
    const absolutePath = path.join(rootDir, relativePath);
    if (!fs.existsSync(absolutePath)) continue;
    const stat = fs.statSync(absolutePath);
    if (!stat.isFile()) continue;

    const content = fs.readFileSync(absolutePath, "utf8");
    files.push({
      path: relativePath,
      content: truncateMiddle(content, 8_000),
    });
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
