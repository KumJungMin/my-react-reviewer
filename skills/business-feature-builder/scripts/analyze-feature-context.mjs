#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const SOURCE_PATTERN = /\.(ts|tsx|js|jsx)$/;
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "coverage", ".turbo"]);
const ROLE_PATTERNS = [
  ["test", /\.(test|spec)\.(ts|tsx|js|jsx)$|__tests__/],
  ["style", /(\.css\.ts|\.css\.tsx|\.css|\.scss|\.sass)$/],
  ["core", /(\.core\.(ts|tsx|js|jsx)|-core\.(ts|tsx|js|jsx))$/],
  ["utils", /(\.utils?\.(ts|tsx|js|jsx)|\/utils?\/)/],
  ["hook", /(^|\/)use[A-Z][\w]*(\.(ts|tsx|js|jsx))$/],
  ["page", /Page\.(tsx|jsx)$|(^|\/)page\.(tsx|jsx)$/],
  ["component", /\.(tsx|jsx)$/],
];
const RESPONSIBILITY_NEEDLES = {
  reactState: ["useState", "useReducer", "useRef", "useEffect"],
  async: ["fetch(", "await ", ".then(", "mutate(", "query(", "useQuery", "useMutation"],
  navigation: ["navigate(", "router.", "useNavigate", "useRouter", "history.", "redirect("],
  validation: ["validate", "validation", "isValid", "invalid", "required", "schema", "zod", "yup"],
  mapping: ["map", "mapper", "toDto", "fromDto", "format", "parse", "transform", "normalize"],
  policy: ["canSubmit", "can", "should", "policy", "permission", "limit", "eligib"],
  analytics: ["analytics", "track(", "logEvent", "sendEvent"],
  api: ["api/", "apis/", "repository", "repositories", "service", "services", "usecase", "useCase"],
  ui: ["<", "className", "aria-", "role=", "data-"],
};

function printHelp() {
  console.log(`Business feature context preflight

Usage:
  node skills/business-feature-builder/scripts/analyze-feature-context.mjs --target apps/service/src/presentation/page/memberTerminationPage
  node skills/business-feature-builder/scripts/analyze-feature-context.mjs --repo . --diff pr.diff

Options:
  --repo <path>       Repository root. Defaults to current working directory.
  --target <path>     Feature file or folder. Can be repeated.
  --diff <path>       Unified diff; changed source files are included.
  --out-json <path>   JSON output. Defaults to .business-feature-builder/feature-context.json.
  --out-md <path>     Markdown output. Defaults to .business-feature-builder/feature-context.md.
  --help              Show this help.

The script emits deterministic feature context and responsibility signals, not an implementation plan.`);
}

function parseArgs(argv) {
  const flags = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[index + 1];
    const value = !next || next.startsWith("--") ? true : next;
    const previous = flags.get(key);

    if (previous === undefined) {
      flags.set(key, value);
    } else if (Array.isArray(previous)) {
      previous.push(value);
    } else {
      flags.set(key, [previous, value]);
    }

    if (value !== true) index += 1;
  }

  return flags;
}

function getStringFlag(flags, key) {
  const value = flags.get(key);
  if (Array.isArray(value)) return typeof value.at(-1) === "string" ? value.at(-1) : null;
  return typeof value === "string" ? value : null;
}

function getStringFlags(flags, key) {
  const value = flags.get(key);
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string");
  return typeof value === "string" ? [value] : [];
}

function resolveRepoPath(repoRoot, filePath) {
  return path.isAbsolute(filePath) ? path.resolve(filePath) : path.resolve(repoRoot, filePath);
}

function toDisplayPath(repoRoot, filePath) {
  const relativePath = path.relative(repoRoot, filePath);
  return relativePath && !relativePath.startsWith("..") ? relativePath : filePath;
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeText(filePath, content) {
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, content, "utf8");
}

function isSkipped(filePath) {
  return filePath.split(path.sep).some((part) => SKIP_DIRS.has(part));
}

function isSourceFile(filePath) {
  return SOURCE_PATTERN.test(filePath) && !filePath.endsWith(".d.ts") && !isSkipped(filePath);
}

function walkFiles(targetPath, files) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.statSync(targetPath);

  if (stat.isFile()) {
    if (isSourceFile(targetPath)) files.push(targetPath);
    return;
  }

  if (!stat.isDirectory() || isSkipped(targetPath)) return;

  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    walkFiles(path.join(targetPath, entry.name), files);
  }
}

function extractChangedFilesFromDiff(diff) {
  const changedFiles = new Set();

  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith("FILE: ")) {
      const filePath = line.slice("FILE: ".length).trim();
      if (isSourceFile(filePath)) changedFiles.add(filePath);
      continue;
    }

    if (line.startsWith("+++ b/")) {
      const filePath = line.slice("+++ b/".length).trim();
      if (isSourceFile(filePath)) changedFiles.add(filePath);
    }
  }

  return Array.from(changedFiles);
}

function collectFiles(repoRoot, targets, diffPath) {
  const files = [];

  for (const target of targets) {
    walkFiles(resolveRepoPath(repoRoot, target), files);
  }

  if (diffPath) {
    const diff = fs.readFileSync(resolveRepoPath(repoRoot, diffPath), "utf8");
    for (const changedPath of extractChangedFilesFromDiff(diff)) {
      const absolutePath = resolveRepoPath(repoRoot, changedPath);
      if (fs.existsSync(absolutePath) && isSourceFile(absolutePath)) files.push(absolutePath);
    }
  }

  return Array.from(new Set(files.map((filePath) => path.resolve(filePath)))).sort();
}

function classifyRole(filePath) {
  const normalized = filePath.split(path.sep).join("/");
  for (const [role, pattern] of ROLE_PATTERNS) {
    if (pattern.test(normalized)) return role;
  }
  return "source";
}

function countNeedles(content, needles) {
  return needles.reduce((count, needle) => count + (content.includes(needle) ? 1 : 0), 0);
}

function collectFacts(content) {
  const facts = {};
  for (const [key, needles] of Object.entries(RESPONSIBILITY_NEEDLES)) {
    facts[key] = countNeedles(content, needles);
  }
  return facts;
}

function extractImports(content) {
  const imports = [];
  const importMatches = content.matchAll(/import\s+(?:[^'"]+\s+from\s+)?["']([^"']+)["']/g);
  for (const match of importMatches) imports.push(match[1]);
  return imports;
}

function addSignal(signals, signal) {
  signals.push(signal);
}

function analyzeFile(repoRoot, filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const role = classifyRole(filePath);
  const facts = collectFacts(content);
  const signals = [];

  if (role === "component" || role === "page") {
    if (facts.async > 0 || facts.api > 0) {
      addSignal(signals, {
        ruleId: "ui-file-has-async-or-api",
        category: "separation",
        detail: "UI/page file contains API or async orchestration syntax; verify it belongs in a hook/usecase boundary",
      });
    }

    if (facts.validation > 0 || facts.mapping > 0 || facts.policy > 0) {
      addSignal(signals, {
        ruleId: "ui-file-has-business-logic",
        category: "separation",
        detail: "UI/page file contains validation, mapping, formatting, or policy syntax; consider .core.ts extraction",
      });
    }
  }

  if ((role === "core" || role === "utils") && facts.reactState > 0) {
    addSignal(signals, {
      ruleId: "pure-file-imports-react-runtime",
      category: "separation",
      detail: "Core/utils-like file contains React runtime hook syntax",
    });
  }

  if (role === "hook" && facts.ui > 0 && /<[\w.]+/.test(content)) {
    addSignal(signals, {
      ruleId: "hook-contains-jsx",
      category: "separation",
      detail: "Hook-like file appears to contain JSX; verify render responsibility stays in component/page files",
    });
  }

  return {
    path: toDisplayPath(repoRoot, filePath),
    role,
    lines: content.split(/\r?\n/).length,
    imports: extractImports(content),
    facts,
    signals,
  };
}

function groupByRole(files) {
  return files.reduce((groups, file) => {
    groups[file.role] ??= [];
    groups[file.role].push(file.path);
    return groups;
  }, {});
}

function findNearbyPatterns(repoRoot, targets) {
  const patterns = [];

  for (const target of targets) {
    const absoluteTarget = resolveRepoPath(repoRoot, target);
    const baseDir = fs.existsSync(absoluteTarget) && fs.statSync(absoluteTarget).isDirectory() ? absoluteTarget : path.dirname(absoluteTarget);
    const parentDir = path.dirname(baseDir);
    if (!fs.existsSync(parentDir)) continue;

    const siblings = fs
      .readdirSync(parentDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && path.join(parentDir, entry.name) !== baseDir)
      .slice(0, 20)
      .map((entry) => {
        const folderPath = path.join(parentDir, entry.name);
        return {
          folder: toDisplayPath(repoRoot, folderPath),
          files: fs
            .readdirSync(folderPath, { withFileTypes: true })
            .filter((file) => file.isFile())
            .map((file) => file.name)
            .filter((fileName) => SOURCE_PATTERN.test(fileName))
            .sort(),
        };
      })
      .filter((item) => item.files.length > 0);

    patterns.push(...siblings);
  }

  return patterns;
}

function readPackageScripts(repoRoot) {
  const packagePath = path.join(repoRoot, "package.json");
  if (!fs.existsSync(packagePath)) return {};

  try {
    const parsed = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    return parsed.scripts ?? {};
  } catch {
    return {};
  }
}

function suggestValidation(scripts, files) {
  const suggestions = [];
  const scriptNames = Object.keys(scripts);

  for (const candidate of ["typecheck", "test", "lint", "build"]) {
    if (scriptNames.includes(candidate)) suggestions.push(`npm run ${candidate}`);
  }

  if (files.some((file) => file.role === "test") && scriptNames.includes("test")) {
    suggestions.unshift("npm run test");
  }

  return Array.from(new Set(suggestions));
}

function deriveTestGaps(files) {
  const hasTests = files.some((file) => file.role === "test");
  const hasCore = files.some((file) => file.role === "core" || file.role === "utils");
  const hasValidation = files.some((file) => file.facts.validation > 0);
  const hasAsync = files.some((file) => file.facts.async > 0 || file.facts.api > 0);
  const gaps = [];

  if (!hasTests) gaps.push("No nearby test file detected for this target set.");
  if (hasCore && !hasTests) gaps.push("Pure core/utils logic exists or is expected, but no direct test file was detected.");
  if (hasValidation && !hasTests) gaps.push("Validation syntax detected; add required/invalid/boundary case tests if behavior changes.");
  if (hasAsync && !hasTests) gaps.push("Async/API orchestration syntax detected; add loading/error/success coverage if behavior changes.");

  return gaps;
}

function renderMarkdown(report) {
  const lines = [
    "# Business Feature Context Preflight",
    "",
    "This is deterministic repository context. It is not an implementation plan.",
    "",
    "## Summary",
    "",
    `- targets: ${report.targets.length > 0 ? report.targets.map((target) => `\`${target}\``).join(", ") : "none"}`,
    `- diff: ${report.diff ? `\`${report.diff}\`` : "none"}`,
    `- files: ${report.files.length}`,
    `- signals: ${report.files.reduce((sum, file) => sum + file.signals.length, 0)}`,
    "",
    "## Files By Role",
    "",
  ];

  for (const [role, roleFiles] of Object.entries(report.filesByRole).sort()) {
    lines.push(`### ${role}`, "");
    for (const filePath of roleFiles) lines.push(`- \`${filePath}\``);
    lines.push("");
  }

  lines.push("## Responsibility Signals", "");
  const signals = report.files.flatMap((file) => file.signals.map((signal) => ({ ...signal, file: file.path })));
  if (signals.length === 0) {
    lines.push("- No candidate responsibility signals found.");
  } else {
    for (const signal of signals) {
      lines.push(`- ${signal.file} [${signal.category}/${signal.ruleId}]: ${signal.detail}`);
    }
  }
  lines.push("");

  lines.push("## Test Gaps", "");
  if (report.testGaps.length === 0) {
    lines.push("- No deterministic test gap detected.");
  } else {
    for (const gap of report.testGaps) lines.push(`- ${gap}`);
  }
  lines.push("");

  lines.push("## Nearby Folder Patterns", "");
  if (report.nearbyPatterns.length === 0) {
    lines.push("- No sibling feature folders detected.");
  } else {
    for (const pattern of report.nearbyPatterns.slice(0, 20)) {
      lines.push(`- \`${pattern.folder}\`: ${pattern.files.map((fileName) => `\`${fileName}\``).join(", ")}`);
    }
  }
  lines.push("");

  lines.push("## Validation Candidates", "");
  if (report.validationCandidates.length === 0) {
    lines.push("- No package.json validation scripts detected.");
  } else {
    for (const command of report.validationCandidates) lines.push(`- \`${command}\``);
  }
  lines.push("");

  lines.push("## AI Follow-Up Contract", "");
  lines.push("- Use this to choose the smallest source files and references to open.");
  lines.push("- Verify behavior and product requirements before creating skeletons or tests.");
  lines.push("- Treat signals as candidate responsibility boundaries, not mandatory refactors.");
  lines.push("");

  return lines.join("\n");
}

function main() {
  const flags = parseArgs(process.argv.slice(2));
  if (flags.has("help")) {
    printHelp();
    return;
  }

  const repoRoot = path.resolve(getStringFlag(flags, "repo") ?? process.cwd());
  const targets = getStringFlags(flags, "target");
  const diff = getStringFlag(flags, "diff");
  const outJson = resolveRepoPath(repoRoot, getStringFlag(flags, "out-json") ?? ".business-feature-builder/feature-context.json");
  const outMd = resolveRepoPath(repoRoot, getStringFlag(flags, "out-md") ?? ".business-feature-builder/feature-context.md");

  if (targets.length === 0 && !diff) {
    throw new Error("Provide at least one --target or --diff.");
  }

  const files = collectFiles(repoRoot, targets, diff).map((filePath) => analyzeFile(repoRoot, filePath));
  const scripts = readPackageScripts(repoRoot);
  const report = {
    version: 1,
    generatedAt: new Date().toISOString(),
    repoRoot,
    targets,
    diff,
    files,
    filesByRole: groupByRole(files),
    nearbyPatterns: findNearbyPatterns(repoRoot, targets),
    testGaps: deriveTestGaps(files),
    validationCandidates: suggestValidation(scripts, files),
  };

  writeText(outJson, `${JSON.stringify(report, null, 2)}\n`);
  writeText(outMd, `${renderMarkdown(report)}\n`);

  console.log(`Wrote feature context JSON: ${toDisplayPath(repoRoot, outJson)}`);
  console.log(`Wrote feature context Markdown: ${toDisplayPath(repoRoot, outMd)}`);
  console.log(`Analyzed ${report.files.length} source files.`);
}

try {
  main();
} catch (error) {
  console.error("Failed to analyze feature context.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
