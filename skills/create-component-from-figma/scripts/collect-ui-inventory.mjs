#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const SOURCE_PATTERN = /\.(ts|tsx|js|jsx)$/;
const STYLE_PATTERN = /(\.css\.ts|\.css\.tsx|\.css|\.scss|\.sass)$/;
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "coverage", ".turbo"]);
const DEFAULT_SEARCH_ROOTS = [
  "components",
  "src/components",
  "components/ui",
  "src/components/ui",
  "packages/design-system/src/components",
  "packages/ui/src",
  "src/shared",
  "shared",
  "app",
  "src/app",
  "features",
  "src/features",
];
const TOKEN_PATH_HINTS = ["token", "theme", "vars", "variable", "color", "spacing", "typography", "radius", "shadow"];

function printHelp() {
  console.log(`UI inventory collector

Usage:
  node skills/create-component-from-figma/scripts/collect-ui-inventory.mjs --repo .
  node skills/create-component-from-figma/scripts/collect-ui-inventory.mjs --repo . --target src/features/profile

Options:
  --repo <path>       Repository root. Defaults to current working directory.
  --target <path>     Optional target feature/component path for nearby context. Can be repeated.
  --root <path>       Additional search root. Can be repeated.
  --out-json <path>   JSON output. Defaults to .create-component-from-figma/ui-inventory.json.
  --out-md <path>     Markdown output. Defaults to .create-component-from-figma/ui-inventory.md.
  --help              Show this help.

The script emits deterministic repository reuse inventory, not design interpretation.`);
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

function walkFiles(rootPath, files) {
  if (!fs.existsSync(rootPath)) return;
  const stat = fs.statSync(rootPath);
  if (stat.isFile()) {
    if (!isSkipped(rootPath) && (SOURCE_PATTERN.test(rootPath) || STYLE_PATTERN.test(rootPath))) files.push(rootPath);
    return;
  }

  if (!stat.isDirectory() || isSkipped(rootPath)) return;

  for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
    walkFiles(path.join(rootPath, entry.name), files);
  }
}

function collectFiles(repoRoot, roots) {
  const files = [];
  for (const root of roots) {
    walkFiles(resolveRepoPath(repoRoot, root), files);
  }
  return Array.from(new Set(files.map((filePath) => path.resolve(filePath)))).sort();
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractExports(content) {
  const exports = [];
  for (const match of content.matchAll(/export\s+(?:const|function|class|interface|type)\s+([A-Z][\w]*)/g)) {
    exports.push(match[1]);
  }
  for (const match of content.matchAll(/export\s*\{\s*([^}]+)\s*\}/g)) {
    for (const item of match[1].split(",")) {
      const name = item.trim().split(/\s+as\s+/).at(-1)?.trim();
      if (name && /^[A-Z]/.test(name)) exports.push(name);
    }
  }
  return exports;
}

function extractImports(content) {
  const imports = [];
  for (const match of content.matchAll(/import\s+(?:[^'"]+\s+from\s+)?["']([^"']+)["']/g)) {
    imports.push(match[1]);
  }
  return imports;
}

function classifyFile(repoRoot, filePath) {
  const displayPath = toDisplayPath(repoRoot, filePath);
  const normalized = displayPath.split(path.sep).join("/");
  const content = readText(filePath);
  const exports = SOURCE_PATTERN.test(filePath) ? extractExports(content) : [];
  const imports = SOURCE_PATTERN.test(filePath) ? extractImports(content) : [];
  const isTokenFile = TOKEN_PATH_HINTS.some((hint) => normalized.toLowerCase().includes(hint));
  const isStyleFile = STYLE_PATTERN.test(filePath);
  const isVanillaExtract = content.includes("@vanilla-extract/css") || content.includes("@vanilla-extract/recipes");
  const isPrimitivePath = /(^|\/)(components\/ui|src\/components\/ui|packages\/design-system\/src\/components|packages\/ui\/src)(\/|$)/.test(
    normalized,
  );

  return {
    path: displayPath,
    exports,
    imports,
    facts: {
      isPrimitivePath,
      isTokenFile,
      isStyleFile,
      isVanillaExtract,
      hasForwardRef: content.includes("forwardRef"),
      hasRecipe: content.includes("recipe(") || content.includes("@vanilla-extract/recipes"),
      hasStyleVariants: content.includes("styleVariants("),
      hasDataSlot: content.includes("data-slot"),
      hasAria: content.includes("aria-"),
      hasUseClient: content.includes('"use client"') || content.includes("'use client'"),
    },
  };
}

function summarizeImportFrequencies(files) {
  const counts = new Map();
  for (const file of files) {
    for (const moduleName of file.imports) {
      if (!/(components|design-system|ui|tokens|theme|styles|vanilla-extract)/i.test(moduleName)) continue;
      counts.set(moduleName, (counts.get(moduleName) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 80)
    .map(([moduleName, count]) => ({ module: moduleName, count }));
}

function findNearbyFiles(repoRoot, targets) {
  const nearbyFiles = [];

  for (const target of targets) {
    const absoluteTarget = resolveRepoPath(repoRoot, target);
    const baseDir = fs.existsSync(absoluteTarget) && fs.statSync(absoluteTarget).isDirectory() ? absoluteTarget : path.dirname(absoluteTarget);
    if (!fs.existsSync(baseDir)) continue;

    const files = [];
    walkFiles(baseDir, files);
    nearbyFiles.push(
      ...files.slice(0, 120).map((filePath) => ({
        path: toDisplayPath(repoRoot, filePath),
      })),
    );
  }

  return Array.from(new Map(nearbyFiles.map((item) => [item.path, item])).values());
}

function collectPackageScripts(repoRoot) {
  const packagePath = path.join(repoRoot, "package.json");
  if (!fs.existsSync(packagePath)) return {};

  try {
    const parsed = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    return parsed.scripts ?? {};
  } catch {
    return {};
  }
}

function buildReport(repoRoot, roots, targets) {
  const files = collectFiles(repoRoot, roots).map((filePath) => classifyFile(repoRoot, filePath));
  const primitiveFiles = files.filter((file) => file.facts.isPrimitivePath && file.exports.length > 0);
  const tokenFiles = files.filter((file) => file.facts.isTokenFile || (file.facts.isStyleFile && /token|theme|vars/i.test(file.path)));
  const vanillaExtractFiles = files.filter((file) => file.facts.isVanillaExtract);
  const componentExports = primitiveFiles
    .flatMap((file) => file.exports.map((name) => ({ name, file: file.path })))
    .sort((left, right) => left.name.localeCompare(right.name) || left.file.localeCompare(right.file));

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    repoRoot,
    roots,
    targets,
    totals: {
      files: files.length,
      primitiveFiles: primitiveFiles.length,
      tokenFiles: tokenFiles.length,
      vanillaExtractFiles: vanillaExtractFiles.length,
      componentExports: componentExports.length,
    },
    componentExports,
    tokenFiles: tokenFiles.map((file) => file.path).sort().slice(0, 120),
    vanillaExtractPatterns: vanillaExtractFiles
      .map((file) => ({
        path: file.path,
        hasRecipe: file.facts.hasRecipe,
        hasStyleVariants: file.facts.hasStyleVariants,
        hasDataSlot: file.facts.hasDataSlot,
      }))
      .slice(0, 120),
    importFrequencies: summarizeImportFrequencies(files),
    nearbyFiles: findNearbyFiles(repoRoot, targets),
    scripts: collectPackageScripts(repoRoot),
  };
}

function renderMarkdown(report) {
  const lines = [
    "# UI Inventory Preflight",
    "",
    "This is deterministic repository reuse inventory. It is not design interpretation.",
    "",
    "## Summary",
    "",
    `- roots: ${report.roots.map((root) => `\`${root}\``).join(", ")}`,
    `- targets: ${report.targets.length > 0 ? report.targets.map((target) => `\`${target}\``).join(", ") : "none"}`,
    `- files scanned: ${report.totals.files}`,
    `- primitive files: ${report.totals.primitiveFiles}`,
    `- token files: ${report.totals.tokenFiles}`,
    `- Vanilla Extract files: ${report.totals.vanillaExtractFiles}`,
    `- component exports: ${report.totals.componentExports}`,
    "",
    "## Component Export Candidates",
    "",
  ];

  if (report.componentExports.length === 0) {
    lines.push("- No primitive/component exports detected.");
  } else {
    for (const item of report.componentExports.slice(0, 120)) {
      lines.push(`- \`${item.name}\` from \`${item.file}\``);
    }
  }
  lines.push("");

  lines.push("## Token And Theme Files", "");
  if (report.tokenFiles.length === 0) {
    lines.push("- No token/theme files detected.");
  } else {
    for (const filePath of report.tokenFiles) lines.push(`- \`${filePath}\``);
  }
  lines.push("");

  lines.push("## Vanilla Extract Patterns", "");
  if (report.vanillaExtractPatterns.length === 0) {
    lines.push("- No Vanilla Extract files detected.");
  } else {
    for (const item of report.vanillaExtractPatterns.slice(0, 80)) {
      const facts = [
        item.hasRecipe ? "recipe" : null,
        item.hasStyleVariants ? "styleVariants" : null,
        item.hasDataSlot ? "data-slot" : null,
      ]
        .filter(Boolean)
        .join(", ");
      lines.push(`- \`${item.path}\`${facts ? `: ${facts}` : ""}`);
    }
  }
  lines.push("");

  lines.push("## Frequent UI Imports", "");
  if (report.importFrequencies.length === 0) {
    lines.push("- No UI-related import frequencies detected.");
  } else {
    for (const item of report.importFrequencies.slice(0, 40)) {
      lines.push(`- \`${item.module}\`: ${item.count}`);
    }
  }
  lines.push("");

  lines.push("## Nearby Target Files", "");
  if (report.nearbyFiles.length === 0) {
    lines.push("- No target-specific nearby files requested or detected.");
  } else {
    for (const item of report.nearbyFiles.slice(0, 80)) {
      lines.push(`- \`${item.path}\``);
    }
  }
  lines.push("");

  lines.push("## Validation Script Candidates", "");
  const scriptNames = Object.keys(report.scripts).filter((name) => /lint|typecheck|test|build/.test(name));
  if (scriptNames.length === 0) {
    lines.push("- No package.json lint/typecheck/test/build scripts detected.");
  } else {
    for (const name of scriptNames) lines.push(`- \`npm run ${name}\``);
  }
  lines.push("");

  lines.push("## AI Follow-Up Contract", "");
  lines.push("- Prefer reusing listed primitives and token files before creating new abstractions.");
  lines.push("- Open the closest matching component exports before writing new component code.");
  lines.push("- Treat screenshot/Figma interpretation separately from this repository inventory.");
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
  const roots = Array.from(new Set([...DEFAULT_SEARCH_ROOTS, ...getStringFlags(flags, "root")]));
  const outJson = resolveRepoPath(repoRoot, getStringFlag(flags, "out-json") ?? ".create-component-from-figma/ui-inventory.json");
  const outMd = resolveRepoPath(repoRoot, getStringFlag(flags, "out-md") ?? ".create-component-from-figma/ui-inventory.md");
  const report = buildReport(repoRoot, roots, targets);

  writeText(outJson, `${JSON.stringify(report, null, 2)}\n`);
  writeText(outMd, `${renderMarkdown(report)}\n`);

  console.log(`Wrote UI inventory JSON: ${toDisplayPath(repoRoot, outJson)}`);
  console.log(`Wrote UI inventory Markdown: ${toDisplayPath(repoRoot, outMd)}`);
  console.log(`Scanned ${report.totals.files} files and found ${report.totals.componentExports} component exports.`);
}

try {
  main();
} catch (error) {
  console.error("Failed to collect UI inventory.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
