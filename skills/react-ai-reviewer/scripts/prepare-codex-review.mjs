import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillRootDir = path.resolve(__dirname, "..");
let repoRootDir = process.cwd();
const reviewerSystemRootDir = path.join(skillRootDir, "references", "reviewer-system");

const DEFAULT_CONTEXT_FILE_CHARS = 8_000;
const DEFAULT_CONTEXT_TOTAL_CHARS = 30_000;
const MIN_CONTEXT_FILE_BUDGET = 500;
const REVIEWABLE_SOURCE_FILE_PATTERN = /\.(tsx|ts|jsx|js)$/;
const RELEVANT_CONFIG_FILE_PATTERN =
  /(^|\/)(package\.json|tsconfig\.json|eslint\.config\..*|\.eslintrc.*|vite\.config\..*|next\.config\..*)$/;

const CONTEXT_FILE_CANDIDATES = [
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
  { path: ".react-ai-reviewer/prompt-feedback.md", maxChars: 8_000 },
];

function parseArgs(argv) {
  const flags = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token?.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      flags.set(key, true);
      continue;
    }

    flags.set(key, next);
    index += 1;
  }

  return flags;
}

function getStringFlag(flags, key) {
  const value = flags.get(key);
  return typeof value === "string" ? value : null;
}

function resolveWorkspacePath(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(repoRootDir, filePath);
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeText(filePath, content) {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, content, "utf8");
}

function asJson(value) {
  return JSON.stringify(value, null, 2);
}

function truncateMiddle(text, maxChars) {
  if (text.length <= maxChars) return text;

  const headLength = Math.floor(maxChars * 0.65);
  const tailLength = Math.max(0, maxChars - headLength - 120);
  const omitted = text.length - headLength - tailLength;

  return [
    text.slice(0, headLength),
    `\n\n...[TRUNCATED ${omitted} chars FROM MIDDLE]...\n\n`,
    text.slice(text.length - tailLength),
  ].join("");
}

function toDisplayPath(filePath) {
  const relativePath = path.relative(repoRootDir, filePath) || ".";
  return relativePath.startsWith("..") ? filePath : relativePath;
}

function isReviewableFilePath(filePath) {
  return (
    !filePath.includes("node_modules/") &&
    !filePath.endsWith(".snap") &&
    !filePath.endsWith(".lock") &&
    (REVIEWABLE_SOURCE_FILE_PATTERN.test(filePath) || RELEVANT_CONFIG_FILE_PATTERN.test(filePath))
  );
}

function extractChangedFilesFromDiff(diff) {
  const changedFiles = new Set();

  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith("FILE: ")) {
      const filePath = line.slice("FILE: ".length).trim();
      if (filePath.length > 0 && isReviewableFilePath(filePath)) {
        changedFiles.add(filePath);
      }
      continue;
    }

    if (line.startsWith("+++ b/")) {
      const filePath = line.slice("+++ b/".length).trim();
      if (filePath.length > 0 && isReviewableFilePath(filePath)) {
        changedFiles.add(filePath);
      }
    }
  }

  return Array.from(changedFiles);
}

function collectRepositoryContext(rootDir = repoRootDir) {
  let remainingChars = DEFAULT_CONTEXT_TOTAL_CHARS;
  const files = [];

  for (const candidate of CONTEXT_FILE_CANDIDATES) {
    if (remainingChars < MIN_CONTEXT_FILE_BUDGET) break;

    const absolutePath = path.join(rootDir, candidate.path);
    if (!fs.existsSync(absolutePath)) continue;
    if (!fs.statSync(absolutePath).isFile()) continue;

    const rawContent = fs.readFileSync(absolutePath, "utf8");
    const fileBudget = Math.min(candidate.maxChars ?? DEFAULT_CONTEXT_FILE_CHARS, remainingChars);
    const content = truncateMiddle(rawContent, fileBudget);

    files.push({ path: candidate.path, content });
    remainingChars -= content.length;
  }

  return files;
}

function loadReviewerCatalog() {
  const catalogPath = path.join(reviewerSystemRootDir, "reviewers.config.json");
  const parsed = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

  if (!Array.isArray(parsed.fallbackReviewerIds) || parsed.fallbackReviewerIds.length === 0) {
    throw new Error("Invalid reviewers.config.json: fallbackReviewerIds must be a non-empty array.");
  }

  if (!Array.isArray(parsed.reviewers)) {
    throw new Error("Invalid reviewers.config.json: reviewers must be an array.");
  }

  const reviewerIds = new Set(parsed.reviewers.map((reviewer) => reviewer.id));
  for (const fallbackReviewerId of parsed.fallbackReviewerIds) {
    if (!reviewerIds.has(fallbackReviewerId)) {
      throw new Error(`Unknown fallback reviewer id: ${fallbackReviewerId}`);
    }
  }

  return parsed;
}

function toRegexSource(pattern) {
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

function matchesGlob(filePath, pattern) {
  return new RegExp(`^${toRegexSource(pattern)}$`).test(filePath);
}

function sortReviewers(reviewers) {
  return reviewers.slice().sort((left, right) => left.order - right.order);
}

function uniqueReviewers(reviewers) {
  return Array.from(new Map(reviewers.map((reviewer) => [reviewer.id, reviewer])).values());
}

function isExcludedFile(reviewer, filePath) {
  return (reviewer.excludeFilePatterns ?? []).some((pattern) => matchesGlob(filePath, pattern));
}

function reviewerHasEligibleChangedFile(reviewer, changedFiles) {
  return changedFiles.some((filePath) => !isExcludedFile(reviewer, filePath));
}

function reviewerMatchesChangedFiles(reviewer, changedFiles) {
  const filePatterns = reviewer.triggers?.filePatterns ?? [];
  if (filePatterns.length === 0) return false;

  return changedFiles.some((filePath) => {
    if (isExcludedFile(reviewer, filePath)) return false;
    return filePatterns.some((pattern) => matchesGlob(filePath, pattern));
  });
}

function reviewerMatchesDiffKeywords(reviewer, lowerCaseDiff) {
  const keywords = reviewer.triggers?.keywords ?? [];
  if (keywords.length === 0) return false;
  return keywords.some((keyword) => lowerCaseDiff.includes(String(keyword).toLowerCase()));
}

function getFinalReviewer(reviewers) {
  const finalReviewer = reviewers.find((reviewer) => reviewer.type === "final");
  if (!finalReviewer) {
    throw new Error("Missing final reviewer configuration.");
  }

  return finalReviewer;
}

function getReviewerById(id, reviewers) {
  const reviewer = reviewers.find((candidate) => candidate.id === id);
  if (!reviewer) {
    throw new Error(`Unknown reviewer id: ${id}`);
  }

  return reviewer;
}

function selectReviewers({ diff, changedFiles, reviewers, fallbackReviewerIds }) {
  const enabledReviewers = sortReviewers(reviewers.filter((reviewer) => reviewer.enabled));
  const finalReviewer = getFinalReviewer(enabledReviewers);
  const sourceReviewers = enabledReviewers.filter((reviewer) => reviewer.type === "source");
  const lowerCaseDiff = diff.toLowerCase();

  const matchedReviewers = sourceReviewers.filter(
    (reviewer) =>
      reviewerMatchesChangedFiles(reviewer, changedFiles) ||
      (reviewerHasEligibleChangedFile(reviewer, changedFiles) && reviewerMatchesDiffKeywords(reviewer, lowerCaseDiff)),
  );

  const selectedSourceReviewers =
    matchedReviewers.length > 0
      ? matchedReviewers
      : fallbackReviewerIds
          .map((id) => getReviewerById(id, enabledReviewers))
          .filter((reviewer) => reviewer.enabled && reviewer.type === "source");

  return uniqueReviewers([...selectedSourceReviewers, finalReviewer]).sort((left, right) => left.order - right.order);
}

function selectReviewersByIds(selectedIds, reviewers) {
  const selectedReviewers = selectedIds.map((id) => getReviewerById(id, reviewers)).filter((reviewer) => reviewer.enabled);
  return uniqueReviewers([...selectedReviewers, getFinalReviewer(reviewers)]).sort((left, right) => left.order - right.order);
}

function renderReviewBrief({ diffPath, astAnalysisPath, changedFiles, selectedReviewers, contextFilePaths }) {
  const reviewerLines = selectedReviewers.map((reviewer) =>
    [
      `- \`${reviewer.id}\` - ${reviewer.title}`,
      `  - source basis: ${reviewer.sourceBasis}`,
      `  - prompt: \`skills/react-ai-reviewer/references/reviewer-system/${reviewer.promptPath}\``,
      `  - context: \`skills/react-ai-reviewer/references/reviewer-system/${reviewer.contextPath}\``,
      `  - rules: \`skills/react-ai-reviewer/references/reviewer-system/${reviewer.rulesPath}\``,
    ].join("\n"),
  );

  const changedFileLines =
    changedFiles.length > 0 ? changedFiles.map((filePath) => `- \`${filePath}\``).join("\n") : "- reviewable changed files not found";

  const contextLines =
    contextFilePaths.length > 0
      ? contextFilePaths.map((filePath) => `- \`${filePath}\``).join("\n")
      : "- no allowlisted project context files were found";

  const astAnalysisLines = astAnalysisPath
    ? [
        `- AST preflight report: \`${toDisplayPath(astAnalysisPath)}\``,
        "- Treat AST signals as deterministic candidate locations, not final review findings.",
        "- Read this report before opening whole changed files so source inspection can stay line-focused.",
      ].join("\n")
    : "- no AST preflight report provided";

  return [
    "# React AI Reviewer Codex Brief",
    "",
    "이 문서는 원래 `react-ai-reviewer`의 reviewer selection, prompt, context, final-review 흐름을 Codex skill에서 그대로 쓰기 위한 세션 브리프다.",
    "",
    "## Session Rules",
    "",
    "1. 먼저 코드와 주변 문맥을 읽고 개선 포인트만 설명한다. 사용자가 요청하기 전에는 코드를 수정하지 않는다.",
    "2. 리뷰 응답은 먼저 `Review basis`, `Reviewer lenses used`를 밝힌 뒤 `Must fix`, `Should fix`, `Suggestions`, `Open questions` 순서로 정리한다.",
    "3. `Review basis`에는 full multi-reviewer selection인지, narrowed reviewer pass인지와 그 이유를 적는다.",
    "4. `Reviewer lenses used`에는 실제로 참고한 reviewer와 핵심 focus를 적는다.",
    "5. `Must fix`, `Should fix`, `Suggestions` 각 섹션 시작에는 한 줄짜리 `Focus`를 두고 어떤 판단 기준이 중심이었는지 적는다.",
    "6. 각 포인트에는 파일 또는 컴포넌트, 문제의 근거, 실제 영향, 추천 수정 방향, 확신도, source trace를 포함한다.",
    "7. 사용자가 특정 포인트 반영을 요청하면 그 항목만 수정하고 검증 결과를 함께 설명한다.",
    "8. reviewer 간 중복은 final-reviewer 관점으로 병합하고 잡음을 줄인다.",
    "",
    "## Read First",
    "",
    "- `skills/react-ai-reviewer/SKILL.md`",
    "- `skills/react-ai-reviewer/references/reviewer-system/docs/reviewer-contract.md`",
    "- `skills/react-ai-reviewer/references/reviewer-system/docs/prompt-authoring.md`",
    "- `skills/react-ai-reviewer/references/reviewer-system/docs/source-basis.md`",
    "",
    "## Current Diff",
    "",
    `- diff file: \`${toDisplayPath(diffPath)}\``,
    changedFileLines,
    "",
    "## AST Preflight",
    "",
    astAnalysisLines,
    "",
    "## Selected Review Lenses",
    "",
    reviewerLines.join("\n"),
    "",
    "## Project Context Files",
    "",
    contextLines,
    "",
    "## Expected Review Flow",
    "",
    "1. AST preflight report가 있으면 먼저 읽고 candidate line만 source로 검증한다.",
    "2. 선택된 reviewer prompt, compressed context, rules를 읽는다.",
    "3. 바로 수정하지 말고 단계별 리뷰를 먼저 작성한다.",
    "4. 사용자가 반영할 항목을 고르면 그 범위만 수정한다.",
    "5. 수정 후에는 무엇을 반영했고 무엇을 보류했는지 요약한다.",
    "6. 필요하면 `.react-ai-reviewer/prompt-feedback.md`에 다음 세션 개선 포인트를 남긴다.",
    "",
    "## Recommended Response Shape",
    "",
    "### Review basis",
    "- 이번 리뷰가 full multi-reviewer selection인지, 아니면 narrowed reviewer pass인지와 이유를 적는다.",
    "",
    "### Reviewer lenses used",
    "- 실제로 참고한 reviewer와 각 reviewer가 중점적으로 본 영역을 적는다.",
    "",
    "### Overall assessment",
    "- 이번 변경에서 가장 중요한 위험 또는 장점을 한두 문장으로 요약한다.",
    "",
    "### Must fix",
    "- Focus: 이 섹션에서 우선 본 기준을 한 줄로 적는다.",
    "- merge 전에 반영해야 하는 항목만 적는다.",
    "",
    "### Should fix",
    "- Focus: 이 섹션에서 우선 본 기준을 한 줄로 적는다.",
    "- 회귀 방지나 유지보수성을 위해 빠르게 반영할 가치가 있는 항목을 적는다.",
    "",
    "### Suggestions",
    "- Focus: 이 섹션에서 우선 본 기준을 한 줄로 적는다.",
    "- 지금 PR 범위를 크게 벗어나지 않는 선택적 개선을 적는다.",
    "",
    "### Open questions",
    "- diff만으로 확신할 수 없는 가정이나 확인이 필요한 지점을 적는다.",
    "",
  ].join("\n");
}

function main() {
  const flags = parseArgs(process.argv.slice(2));
  const repoRootRaw = getStringFlag(flags, "repo");
  if (repoRootRaw) {
    repoRootDir = path.resolve(repoRootRaw);
  }

  const diffFlag = getStringFlag(flags, "diff");

  if (!diffFlag) {
    throw new Error("Missing --diff. Generate a diff file first and pass it to prepare-codex-review.");
  }

  const reviewersRaw = getStringFlag(flags, "reviewers");
  const astAnalysisRaw = getStringFlag(flags, "ast-analysis");
  const diffPath = resolveWorkspacePath(diffFlag);
  const astAnalysisPath = astAnalysisRaw ? resolveWorkspacePath(astAnalysisRaw) : null;
  const outputPath =
    typeof flags.get("out") === "string"
      ? resolveWorkspacePath(flags.get("out"))
      : resolveWorkspacePath(".react-ai-reviewer/codex-review.md");
  const selectedReviewerIds = reviewersRaw
    ? reviewersRaw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : null;

  const diff = fs.readFileSync(diffPath, "utf8");
  if (astAnalysisPath && !fs.existsSync(astAnalysisPath)) {
    throw new Error(`AST analysis file not found: ${astAnalysisPath}`);
  }

  const changedFiles = extractChangedFilesFromDiff(diff);
  const contextFilePaths = collectRepositoryContext(repoRootDir).map((file) => file.path);
  const reviewerCatalog = loadReviewerCatalog();
  const allReviewers = sortReviewers(reviewerCatalog.reviewers);
  const selectedReviewers = selectedReviewerIds
    ? selectReviewersByIds(selectedReviewerIds, allReviewers)
    : selectReviewers({
        diff,
        changedFiles,
        reviewers: allReviewers,
        fallbackReviewerIds: reviewerCatalog.fallbackReviewerIds,
      });

  writeText(
    resolveWorkspacePath(".react-ai-reviewer/reviewer-selection.json"),
    asJson({
      changedFiles,
      selectedReviewerIds: selectedReviewers.map((reviewer) => reviewer.id),
      contextFilePaths,
      astAnalysisPath: astAnalysisPath ? toDisplayPath(astAnalysisPath) : null,
    }),
  );

  writeText(
    outputPath,
    renderReviewBrief({
      diffPath,
      astAnalysisPath,
      changedFiles,
      selectedReviewers,
      contextFilePaths,
    }),
  );

  console.log(`Prepared Codex review brief: ${toDisplayPath(outputPath)}`);
}

try {
  main();
} catch (error) {
  console.error("Failed to prepare Codex review brief.");
  if (error instanceof Error) {
    console.error(error.message);
    if (error.stack) console.error(error.stack);
  } else {
    console.error(error);
  }
  process.exit(1);
}
