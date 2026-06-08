#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const DEFAULT_COMPONENTS_ROOT = "packages/design-system/src/components";
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const STYLE_FILE_PATTERN = /(\.css\.ts|\.css\.tsx|\.css\.js)$/;
const TEST_FILE_PATTERN = /\.(test|spec)\.(ts|tsx|js|jsx)$/;
const FORBIDDEN_STYLE_IMPORTS = [
  "tailwind",
  "styled-components",
  "@emotion",
  "emotion",
  ".module.css",
  ".scss",
  ".sass",
];
const LEGACY_OR_WEAK_PROPS = new Map([
  ["disabled", "prefer isDisabled for public state props unless preserving native DOM passthrough"],
  ["loading", "prefer isLoading as canonical public API; keep loading only as a migration alias"],
  ["invalid", "prefer isInvalid"],
  ["hasError", "prefer isInvalid when the state is validation failure"],
  ["left", "prefer startContent"],
  ["right", "prefer endContent"],
  ["prefix", "prefer startContent"],
  ["suffix", "prefer endContent"],
  ["topAccessory", "prefer topContent"],
  ["bottomAccessory", "prefer bottomContent"],
  ["designType", "prefer variant"],
  ["buttonStyle", "prefer variant"],
]);

function printHelp() {
  console.log(`GDS component preflight

Usage:
  node skills/gds-generator/scripts/analyze-gds-component.mjs --target packages/design-system/src/components/button
  node skills/gds-generator/scripts/analyze-gds-component.mjs --repo . --target packages/design-system/src/components

Options:
  --repo <path>       Repository root. Defaults to current working directory.
  --target <path>     Component folder or components root. Defaults to ${DEFAULT_COMPONENTS_ROOT}.
  --out-json <path>   JSON output. Defaults to .gds-generator/component-analysis.json.
  --out-md <path>     Markdown output. Defaults to .gds-generator/component-analysis.md.
  --help              Show this help.

The script emits deterministic structure and naming signals, not final design-system review findings.`);
}

function parseArgs(argv) {
  const flags = new Map();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = argv[index + 1];
    flags.set(key, !next || next.startsWith("--") ? true : next);
    if (flags.get(key) !== true) index += 1;
  }

  return flags;
}

function getStringFlag(flags, key) {
  const value = flags.get(key);
  return typeof value === "string" ? value : null;
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

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function isSourceFile(filePath) {
  return SOURCE_EXTENSIONS.has(path.extname(filePath));
}

function listFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(dirPath, entry.name));
}

function listComponentFolders(targetPath) {
  if (!fs.existsSync(targetPath)) return [];
  const stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) return [];

  const files = listFiles(targetPath);
  const looksLikeComponentFolder = files.some((filePath) => /(?:^|\/)[A-Z][\w-]*\.tsx$/.test(filePath)) || files.some((filePath) => path.basename(filePath) === "index.ts");
  if (looksLikeComponentFolder) return [targetPath];

  return fs
    .readdirSync(targetPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(targetPath, entry.name))
    .filter((folderPath) => listFiles(folderPath).some((filePath) => isSourceFile(filePath)));
}

function toPascalCase(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function detectFiles(folderPath) {
  const files = listFiles(folderPath);
  const fileNames = new Set(files.map((filePath) => path.basename(filePath)));
  const folderName = path.basename(folderPath);
  const componentName = toPascalCase(folderName);
  const componentFile =
    files.find((filePath) => path.basename(filePath) === `${componentName}.tsx`) ??
    files.find((filePath) => /^[A-Z].*\.tsx$/.test(path.basename(filePath)));

  return {
    folderName,
    componentName,
    files,
    fileNames,
    componentFile,
    hookFiles: files.filter((filePath) => /^use[A-Z].*\.(ts|tsx)$/.test(path.basename(filePath))),
    contextFiles: files.filter((filePath) => /Context\.(ts|tsx)$/.test(path.basename(filePath))),
    typeFiles: files.filter((filePath) => /\.types\.(ts|tsx)$/.test(path.basename(filePath))),
    coreFiles: files.filter((filePath) => /-core\.(ts|tsx)$|\.core\.(ts|tsx)$/.test(path.basename(filePath))),
    classFiles: files.filter((filePath) => /Classes\.(ts|tsx)$|classes\.(ts|tsx)$/.test(path.basename(filePath))),
    styleFiles: files.filter((filePath) => STYLE_FILE_PATTERN.test(path.basename(filePath))),
    testFiles: files.filter((filePath) => TEST_FILE_PATTERN.test(path.basename(filePath))),
    indexFile: files.find((filePath) => path.basename(filePath) === "index.ts") ?? null,
  };
}

function extractProps(typeFiles) {
  const props = [];
  const exportedTypes = [];

  for (const filePath of typeFiles) {
    const content = readText(filePath);
    const exportMatches = content.matchAll(/export\s+(?:interface|type)\s+([A-Z]\w+)/g);
    for (const match of exportMatches) {
      exportedTypes.push({ file: filePath, name: match[1] });
    }

    const propMatches = content.matchAll(/^\s*(readonly\s+)?([A-Za-z_$][\w$]*)\??\s*:/gm);
    for (const match of propMatches) {
      props.push({ file: filePath, name: match[2] });
    }
  }

  return { props, exportedTypes };
}

function collectText(files) {
  return files
    .filter((filePath) => isSourceFile(filePath))
    .map((filePath) => ({ filePath, content: readText(filePath) }));
}

function addSignal(signals, signal) {
  signals.push(signal);
}

function analyzeComponent(repoRoot, folderPath) {
  const detected = detectFiles(folderPath);
  const sourceTexts = collectText(detected.files);
  const allSource = sourceTexts.map((item) => item.content).join("\n");
  const { props, exportedTypes } = extractProps(detected.typeFiles);
  const signals = [];

  if (!detected.componentFile) {
    addSignal(signals, {
      ruleId: "missing-component-file",
      category: "structure",
      detail: "No PascalCase Component.tsx file detected",
    });
  }

  if (detected.typeFiles.length === 0) {
    addSignal(signals, {
      ruleId: "missing-types-file",
      category: "structure",
      detail: "No Component.types.ts file detected for public props",
    });
  }

  if (detected.styleFiles.length === 0) {
    addSignal(signals, {
      ruleId: "missing-vanilla-extract-style",
      category: "style",
      detail: "No component.css.ts style file detected",
    });
  }

  if (!detected.indexFile) {
    addSignal(signals, {
      ruleId: "missing-index-export",
      category: "exports",
      detail: "No index.ts public boundary detected",
    });
  }

  const interactiveSignals = [
    "useState",
    "useReducer",
    "useEffect",
    "onClick",
    "onKeyDown",
    "onPointer",
    "onMouse",
    "aria-",
    "role=",
    "tabIndex",
    "open",
    "defaultOpen",
    "value",
    "defaultValue",
  ].filter((needle) => allSource.includes(needle));

  if (interactiveSignals.length > 0 && detected.hookFiles.length === 0) {
    addSignal(signals, {
      ruleId: "interactive-without-hook",
      category: "architecture",
      detail: `Interactive/runtime syntax found without useComponent hook: ${interactiveSignals.slice(0, 8).join(", ")}`,
    });
  }

  if (detected.contextFiles.length > 0 && !/(Provider|Group|Tabs|Accordion|Select|Radio|Menu|Combobox)/i.test(detected.componentName)) {
    addSignal(signals, {
      ruleId: "context-needs-confirmation",
      category: "architecture",
      detail: "Context file exists; verify that multiple coordinated components share state",
    });
  }

  for (const prop of props) {
    const note = LEGACY_OR_WEAK_PROPS.get(prop.name);
    if (note) {
      addSignal(signals, {
        ruleId: "public-prop-naming",
        category: "api",
        detail: `${prop.name}: ${note}`,
        file: toDisplayPath(repoRoot, prop.file),
      });
    }
  }

  if (props.some((prop) => prop.name === "open") && !props.some((prop) => prop.name === "onOpenChange")) {
    addSignal(signals, {
      ruleId: "controlled-open-missing-callback",
      category: "api",
      detail: "Public props include open but not onOpenChange",
    });
  }

  if (props.some((prop) => prop.name === "value") && !props.some((prop) => prop.name === "onValueChange")) {
    addSignal(signals, {
      ruleId: "controlled-value-missing-callback",
      category: "api",
      detail: "Public props include value but not onValueChange",
    });
  }

  for (const item of sourceTexts) {
    for (const forbidden of FORBIDDEN_STYLE_IMPORTS) {
      if (item.content.includes(forbidden)) {
        addSignal(signals, {
          ruleId: "forbidden-style-system",
          category: "style",
          detail: `Detected "${forbidden}" in ${toDisplayPath(repoRoot, item.filePath)}`,
        });
      }
    }
  }

  for (const styleFile of detected.styleFiles) {
    const content = readText(styleFile);
    if (!content.includes("@vanilla-extract/css") && !content.includes("@vanilla-extract/recipes")) {
      addSignal(signals, {
        ruleId: "style-file-missing-vanilla-extract-import",
        category: "style",
        detail: `${path.basename(styleFile)} does not import Vanilla Extract APIs`,
      });
    }

    if (/(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\()/.test(content)) {
      addSignal(signals, {
        ruleId: "raw-color-token-candidate",
        category: "style",
        detail: `${path.basename(styleFile)} contains raw color syntax; verify token usage`,
      });
    }
  }

  const slotNames = Array.from(allSource.matchAll(/data-slot["']?\s*[:=]\s*["']([^"']+)["']/g)).map((match) => match[1]);
  const dataStates = Array.from(allSource.matchAll(/data-([a-z][\w-]+)/g)).map((match) => match[1]);
  const indexExports = detected.indexFile
    ? readText(detected.indexFile)
        .split(/\r?\n/)
        .filter((line) => line.trim().startsWith("export "))
        .map((line) => line.trim())
    : [];

  if (detected.classFiles.length > 0 && slotNames.length === 0) {
    addSignal(signals, {
      ruleId: "class-contract-without-slots",
      category: "slots",
      detail: "Class contract file exists but no data-slot attributes were detected",
    });
  }

  return {
    folder: toDisplayPath(repoRoot, folderPath),
    componentName: detected.componentName,
    files: detected.files.map((filePath) => toDisplayPath(repoRoot, filePath)).sort(),
    structure: {
      componentFile: detected.componentFile ? toDisplayPath(repoRoot, detected.componentFile) : null,
      hookFiles: detected.hookFiles.map((filePath) => toDisplayPath(repoRoot, filePath)),
      contextFiles: detected.contextFiles.map((filePath) => toDisplayPath(repoRoot, filePath)),
      typeFiles: detected.typeFiles.map((filePath) => toDisplayPath(repoRoot, filePath)),
      coreFiles: detected.coreFiles.map((filePath) => toDisplayPath(repoRoot, filePath)),
      classFiles: detected.classFiles.map((filePath) => toDisplayPath(repoRoot, filePath)),
      styleFiles: detected.styleFiles.map((filePath) => toDisplayPath(repoRoot, filePath)),
      testFiles: detected.testFiles.map((filePath) => toDisplayPath(repoRoot, filePath)),
      indexFile: detected.indexFile ? toDisplayPath(repoRoot, detected.indexFile) : null,
    },
    publicApi: {
      exportedTypes: exportedTypes.map((item) => ({ ...item, file: toDisplayPath(repoRoot, item.file) })),
      props: props.map((item) => ({ ...item, file: toDisplayPath(repoRoot, item.file) })),
      indexExports,
    },
    facts: {
      interactiveSignals,
      slotNames: Array.from(new Set(slotNames)).sort(),
      dataStates: Array.from(new Set(dataStates)).sort(),
    },
    signals,
  };
}

function renderMarkdown(report) {
  const lines = [
    "# GDS Component Preflight",
    "",
    "This is deterministic structure and naming output. It is not a final design-system review.",
    "",
    "## Summary",
    "",
    `- target: \`${report.target}\``,
    `- components analyzed: ${report.components.length}`,
    `- signals: ${report.components.reduce((sum, component) => sum + component.signals.length, 0)}`,
    "",
  ];

  for (const component of report.components) {
    lines.push(`## ${component.componentName}`, "");
    lines.push(`- folder: \`${component.folder}\``);
    lines.push(`- files: ${component.files.length}`);
    lines.push(`- hooks: ${component.structure.hookFiles.length}`);
    lines.push(`- styles: ${component.structure.styleFiles.length}`);
    lines.push(`- tests: ${component.structure.testFiles.length}`);
    lines.push(`- slots: ${component.facts.slotNames.length > 0 ? component.facts.slotNames.map((slot) => `\`${slot}\``).join(", ") : "none detected"}`);
    lines.push(`- data states: ${component.facts.dataStates.length > 0 ? component.facts.dataStates.map((state) => `\`data-${state}\``).join(", ") : "none detected"}`);
    lines.push("");
    lines.push("### Signals");
    lines.push("");
    if (component.signals.length === 0) {
      lines.push("- No candidate signals found.");
    } else {
      for (const signal of component.signals) {
        const fileText = signal.file ? ` (${signal.file})` : "";
        lines.push(`- [${signal.category}/${signal.ruleId}] ${signal.detail}${fileText}`);
      }
    }
    lines.push("");
    lines.push("### Public Exports");
    lines.push("");
    if (component.publicApi.indexExports.length === 0) {
      lines.push("- No index.ts exports detected.");
    } else {
      for (const exportLine of component.publicApi.indexExports) {
        lines.push(`- \`${exportLine}\``);
      }
    }
    lines.push("");
  }

  lines.push("## AI Follow-Up Contract", "");
  lines.push("- Treat signals as candidate locations only.");
  lines.push("- Verify public API intent against source and docs/examples before proposing changes.");
  lines.push("- Prefer opening only the listed component files before reading neighboring packages.");
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
  const target = getStringFlag(flags, "target") ?? DEFAULT_COMPONENTS_ROOT;
  const targetPath = resolveRepoPath(repoRoot, target);
  const outJson = resolveRepoPath(repoRoot, getStringFlag(flags, "out-json") ?? ".gds-generator/component-analysis.json");
  const outMd = resolveRepoPath(repoRoot, getStringFlag(flags, "out-md") ?? ".gds-generator/component-analysis.md");

  const componentFolders = listComponentFolders(targetPath);
  const report = {
    version: 1,
    generatedAt: new Date().toISOString(),
    repoRoot,
    target,
    components: componentFolders.map((folderPath) => analyzeComponent(repoRoot, folderPath)),
  };

  writeText(outJson, `${JSON.stringify(report, null, 2)}\n`);
  writeText(outMd, `${renderMarkdown(report)}\n`);

  console.log(`Wrote GDS analysis JSON: ${toDisplayPath(repoRoot, outJson)}`);
  console.log(`Wrote GDS analysis Markdown: ${toDisplayPath(repoRoot, outMd)}`);
  console.log(`Analyzed ${report.components.length} component folders.`);
}

try {
  main();
} catch (error) {
  console.error("Failed to analyze GDS component.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
