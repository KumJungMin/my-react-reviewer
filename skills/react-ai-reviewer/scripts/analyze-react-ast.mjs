#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const DEFAULT_MAX_FILES = 200;
const DEFAULT_MAX_SIGNALS = 120;
const SOURCE_FILE_PATTERN = /\.(tsx|ts|jsx|js)$/;
const SKIP_PATH_PARTS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".turbo",
]);
const MUTATING_METHODS = new Set([
  "add",
  "clear",
  "copyWithin",
  "delete",
  "fill",
  "pop",
  "push",
  "reverse",
  "set",
  "shift",
  "sort",
  "splice",
  "unshift",
]);
const EXTERNAL_EFFECT_CALLS = new Set([
  "addEventListener",
  "fetch",
  "observe",
  "requestAnimationFrame",
  "setInterval",
  "setTimeout",
  "subscribe",
]);
const NON_INTERACTIVE_TAGS = new Set(["div", "span", "li", "p", "section", "article"]);
const POINTER_HANDLER_PROPS = new Set(["onClick", "onMouseDown", "onMouseUp", "onPointerDown", "onPointerUp"]);
const KEYBOARD_HANDLER_PROPS = new Set(["onKeyDown", "onKeyUp", "onKeyPress"]);

function printHelp() {
  console.log(`React AST preflight

Usage:
  node skills/react-ai-reviewer/scripts/analyze-react-ast.mjs --target src/components/Button.tsx
  node skills/react-ai-reviewer/scripts/analyze-react-ast.mjs --diff pr.diff

Options:
  --repo <path>                 Repository root. Defaults to current working directory.
  --target <path>               File or directory to analyze. Can be repeated.
  --diff <path>                 Unified diff; changed source files are analyzed.
  --out-json <path>             JSON output. Defaults to .react-ai-reviewer/ast-analysis.json.
  --out-md <path>               Markdown output. Defaults to .react-ai-reviewer/ast-analysis.md.
  --max-files <number>          Maximum source files to analyze. Defaults to ${DEFAULT_MAX_FILES}.
  --max-signals <number>        Maximum signals to include in markdown. Defaults to ${DEFAULT_MAX_SIGNALS}.
  --typescript-module <path>    Optional explicit path to a TypeScript module.
  --help                        Show this help.

The script uses the target repository's installed "typescript" package.
It emits deterministic syntax facts and signals, not a final code review.`);
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

function getNumberFlag(flags, key, fallback) {
  const raw = getStringFlag(flags, key);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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

function normalizeSlashes(filePath) {
  return filePath.split(path.sep).join("/");
}

function isSkippedPath(filePath) {
  const parts = normalizeSlashes(filePath).split("/");
  return parts.some((part) => SKIP_PATH_PARTS.has(part));
}

function isSourceFilePath(filePath) {
  const baseName = path.basename(filePath);
  return (
    SOURCE_FILE_PATTERN.test(filePath) &&
    !baseName.endsWith(".d.ts") &&
    !baseName.endsWith(".snap") &&
    !baseName.endsWith(".lock") &&
    !baseName.startsWith(".env") &&
    !isSkippedPath(filePath)
  );
}

function extractChangedFilesFromDiff(diff) {
  const changedFiles = new Set();

  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith("FILE: ")) {
      const filePath = line.slice("FILE: ".length).trim();
      if (isSourceFilePath(filePath)) changedFiles.add(filePath);
      continue;
    }

    if (line.startsWith("+++ b/")) {
      const filePath = line.slice("+++ b/".length).trim();
      if (isSourceFilePath(filePath)) changedFiles.add(filePath);
    }
  }

  return Array.from(changedFiles);
}

function walkSourceFiles(rootPath, files) {
  if (!fs.existsSync(rootPath)) return;
  const stat = fs.statSync(rootPath);

  if (stat.isFile()) {
    if (isSourceFilePath(rootPath)) files.push(rootPath);
    return;
  }

  if (!stat.isDirectory() || isSkippedPath(rootPath)) return;

  for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
    walkSourceFiles(path.join(rootPath, entry.name), files);
  }
}

function collectTargetFiles({ repoRoot, targetPaths, diffPath, maxFiles }) {
  const files = [];

  for (const targetPath of targetPaths) {
    walkSourceFiles(resolveRepoPath(repoRoot, targetPath), files);
  }

  if (diffPath) {
    const diff = fs.readFileSync(resolveRepoPath(repoRoot, diffPath), "utf8");
    for (const changedPath of extractChangedFilesFromDiff(diff)) {
      const absolutePath = resolveRepoPath(repoRoot, changedPath);
      if (fs.existsSync(absolutePath) && isSourceFilePath(absolutePath)) files.push(absolutePath);
    }
  }

  return Array.from(new Set(files.map((filePath) => path.resolve(filePath)))).slice(0, maxFiles);
}

function loadTypeScript(repoRoot, explicitModulePath) {
  if (explicitModulePath) {
    const requireFromScript = createRequire(import.meta.url);
    return requireFromScript(resolveRepoPath(repoRoot, explicitModulePath));
  }

  const candidateRoots = Array.from(new Set([repoRoot, process.cwd(), path.resolve(repoRoot, "..")]));
  const errors = [];

  for (const candidateRoot of candidateRoots) {
    try {
      const requireFromCandidate = createRequire(path.join(candidateRoot, "package.json"));
      return requireFromCandidate("typescript");
    } catch (error) {
      errors.push(`${candidateRoot}: ${error.message}`);
    }
  }

  throw new Error(
    [
      'Could not load "typescript" from the target repository.',
      "Run this inside a target project that already has TypeScript, or pass --typescript-module <path>.",
      "This script does not install packages or call external scanners.",
      "",
      "Tried:",
      ...errors.map((line) => `- ${line}`),
    ].join("\n"),
  );
}

function getScriptKind(ts, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".tsx") return ts.ScriptKind.TSX;
  if (ext === ".jsx") return ts.ScriptKind.JSX;
  if (ext === ".js") return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

function getLine(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function getEndLine(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
}

function textOf(sourceFile, node, maxLength = 120) {
  const raw = node.getText(sourceFile).replace(/\s+/g, " ").trim();
  return raw.length > maxLength ? `${raw.slice(0, maxLength - 3)}...` : raw;
}

function syntaxName(ts, kind) {
  return ts.SyntaxKind[kind] ?? String(kind);
}

function isFunctionLike(ts, node) {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node)
  );
}

function getFunctionName(ts, node) {
  if (node.name?.getText) return node.name.getText();
  const parent = node.parent;
  if (parent && ts.isVariableDeclaration(parent) && parent.name) return parent.name.getText();
  if (parent && ts.isPropertyAssignment(parent) && parent.name) return parent.name.getText();
  if (parent && ts.isExportAssignment(parent)) return "default";
  return "(anonymous)";
}

function isHookName(name) {
  return /^use[A-Z0-9]/.test(name);
}

function isComponentName(name) {
  return /^[A-Z]/.test(name);
}

function isJsxLikeExpression(ts, node) {
  if (!node) return false;
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) return true;
  if (ts.isParenthesizedExpression(node)) return isJsxLikeExpression(ts, node.expression);
  return false;
}

function getHookNameFromCall(ts, callExpression) {
  const expression = callExpression.expression;
  if (ts.isIdentifier(expression) && isHookName(expression.text)) return expression.text;
  if (ts.isPropertyAccessExpression(expression) && isHookName(expression.name.text)) return expression.name.text;
  return null;
}

function getCallName(ts, callExpression) {
  const expression = callExpression.expression;
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text;
  return null;
}

function getExpressionRootName(ts, expression) {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)) {
    return getExpressionRootName(ts, expression.expression);
  }
  if (ts.isParenthesizedExpression(expression)) return getExpressionRootName(ts, expression.expression);
  return null;
}

function isConditionalOrLoop(ts, node) {
  if (
    ts.isIfStatement(node) ||
    ts.isSwitchStatement(node) ||
    ts.isCaseClause(node) ||
    ts.isDefaultClause(node) ||
    ts.isForStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isForOfStatement(node) ||
    ts.isWhileStatement(node) ||
    ts.isDoStatement(node) ||
    ts.isConditionalExpression(node)
  ) {
    return true;
  }

  return (
    ts.isBinaryExpression(node) &&
    [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(
      node.operatorToken.kind,
    )
  );
}

function isInsideConditionalOrLoop(ts, ancestors, boundaryNode) {
  for (let index = ancestors.length - 1; index >= 0; index -= 1) {
    const ancestor = ancestors[index];
    if (ancestor === boundaryNode) return false;
    if (isConditionalOrLoop(ts, ancestor)) return true;
  }

  return false;
}

function getBindingNameText(ts, bindingName) {
  if (!bindingName) return null;
  if (ts.isIdentifier(bindingName)) return bindingName.text;
  return bindingName.getText();
}

function recordStateHook(ts, sourceFile, callExpression, functionInfo, fileState) {
  const parent = callExpression.parent;
  if (!parent || !ts.isVariableDeclaration(parent) || !ts.isArrayBindingPattern(parent.name)) return;

  const [stateElement, setterElement] = parent.name.elements;
  const stateName = stateElement && ts.isBindingElement(stateElement) ? getBindingNameText(ts, stateElement.name) : null;
  const setterName = setterElement && ts.isBindingElement(setterElement) ? getBindingNameText(ts, setterElement.name) : null;
  const stateRecord = {
    line: getLine(sourceFile, parent),
    state: stateName,
    setter: setterName,
    initializer: callExpression.arguments[0] ? textOf(sourceFile, callExpression.arguments[0], 80) : null,
  };

  functionInfo.state.push(stateRecord);
  if (stateName) fileState.stateNames.add(stateName);
  if (setterName) fileState.setterNames.set(setterName, stateName ?? setterName);
}

function hasCleanupReturn(ts, node) {
  let hasCleanup = false;

  function visit(child) {
    if (
      ts.isReturnStatement(child) &&
      child.expression &&
      (ts.isArrowFunction(child.expression) || ts.isFunctionExpression(child.expression))
    ) {
      hasCleanup = true;
    }

    if (!hasCleanup) ts.forEachChild(child, visit);
  }

  visit(node);
  return hasCleanup;
}

function analyzeEffectCallback(ts, sourceFile, callback, setterNames) {
  const result = {
    hasAwait: false,
    hasCleanup: hasCleanupReturn(ts, callback),
    hasAbortController: false,
    setterCalls: [],
    externalCalls: [],
  };

  if (callback.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword)) {
    result.hasAwait = true;
  }

  function visit(node) {
    if (ts.isAwaitExpression(node)) {
      result.hasAwait = true;
    }

    if (ts.isNewExpression(node) && node.expression.getText(sourceFile) === "AbortController") {
      result.hasAbortController = true;
    }

    if (ts.isCallExpression(node)) {
      const callName = getCallName(ts, node);
      if (callName && setterNames.has(callName)) {
        result.setterCalls.push({ line: getLine(sourceFile, node), name: callName });
      }

      if (callName && EXTERNAL_EFFECT_CALLS.has(callName)) {
        result.externalCalls.push({ line: getLine(sourceFile, node), name: callName });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(callback);
  return result;
}

function getDependencySummary(ts, sourceFile, callExpression) {
  const dependencyArgument = callExpression.arguments[1];
  if (!dependencyArgument) return { kind: "missing", values: [] };
  if (!ts.isArrayLiteralExpression(dependencyArgument)) {
    return { kind: "non-array", values: [textOf(sourceFile, dependencyArgument, 80)] };
  }

  return {
    kind: "array",
    values: dependencyArgument.elements.map((element) => textOf(sourceFile, element, 80)),
  };
}

function addSignal(fileAnalysis, sourceFile, node, signal) {
  fileAnalysis.signals.push({
    ruleId: signal.ruleId,
    category: signal.category,
    line: getLine(sourceFile, node),
    functionName: signal.functionName ?? null,
    detail: signal.detail,
    evidence: signal.evidence ?? null,
  });
}

function analyzeEffectCall(ts, sourceFile, callExpression, hookName, functionInfo, fileState, fileAnalysis) {
  const callback = callExpression.arguments[0];
  const dependencySummary = getDependencySummary(ts, sourceFile, callExpression);
  const effectRecord = {
    line: getLine(sourceFile, callExpression),
    hook: hookName,
    deps: dependencySummary,
    hasCleanup: false,
    setterCalls: [],
    externalCalls: [],
  };

  if (callback && isFunctionLike(ts, callback)) {
    const callbackFacts = analyzeEffectCallback(ts, sourceFile, callback, fileState.setterNames);
    effectRecord.hasCleanup = callbackFacts.hasCleanup;
    effectRecord.setterCalls = callbackFacts.setterCalls;
    effectRecord.externalCalls = callbackFacts.externalCalls;

    if (callbackFacts.setterCalls.length > 0) {
      addSignal(fileAnalysis, sourceFile, callExpression, {
        ruleId: "effect-set-state",
        category: "hooks",
        functionName: functionInfo.name,
        detail: `${hookName} calls state setters: ${callbackFacts.setterCalls.map((call) => call.name).join(", ")}`,
        evidence: `deps=${dependencySummary.kind === "array" ? `[${dependencySummary.values.join(", ")}]` : dependencySummary.kind}`,
      });
    }

    const cleanupSensitiveCalls = callbackFacts.externalCalls.filter((call) => call.name !== "fetch");
    if (cleanupSensitiveCalls.length > 0 && !callbackFacts.hasCleanup) {
      addSignal(fileAnalysis, sourceFile, callExpression, {
        ruleId: "effect-external-no-cleanup",
        category: "hooks",
        functionName: functionInfo.name,
        detail: `${hookName} uses external sync APIs without a cleanup return: ${cleanupSensitiveCalls
          .map((call) => call.name)
          .join(", ")}`,
      });
    }

    const hasAsyncWork =
      callbackFacts.hasAwait || callbackFacts.externalCalls.some((call) => call.name === "fetch") || callbackFacts.setterCalls.length > 0;
    if (hasAsyncWork && !callbackFacts.hasCleanup && !callbackFacts.hasAbortController) {
      addSignal(fileAnalysis, sourceFile, callExpression, {
        ruleId: "effect-async-no-cancel-signal",
        category: "hooks",
        functionName: functionInfo.name,
        detail: `${hookName} has async or stateful work without visible cleanup/cancellation syntax`,
      });
    }
  }

  if (dependencySummary.kind === "missing") {
    addSignal(fileAnalysis, sourceFile, callExpression, {
      ruleId: "effect-missing-deps",
      category: "hooks",
      functionName: functionInfo.name,
      detail: `${hookName} has no dependency argument`,
    });
  }

  functionInfo.effects.push(effectRecord);
}

function getJsxTagName(ts, jsxName) {
  if (ts.isIdentifier(jsxName)) return jsxName.text;
  if (ts.isJsxNamespacedName(jsxName)) return `${jsxName.namespace.text}:${jsxName.name.text}`;
  if (ts.isPropertyAccessExpression(jsxName)) return `${getJsxTagName(ts, jsxName.expression)}.${jsxName.name.text}`;
  return jsxName.getText();
}

function getJsxAttributes(ts, node) {
  const attributes = new Map();

  for (const property of node.attributes.properties) {
    if (ts.isJsxAttribute(property)) {
      attributes.set(property.name.text, property);
    }
  }

  return attributes;
}

function analyzeJsxNode(ts, sourceFile, node, functionInfo, fileAnalysis) {
  const tagName = getJsxTagName(ts, node.tagName);
  const lowerTagName = tagName.toLowerCase();
  const attributes = getJsxAttributes(ts, node);

  functionInfo.jsxElements += 1;

  if (attributes.has("dangerouslySetInnerHTML")) {
    addSignal(fileAnalysis, sourceFile, node, {
      ruleId: "dangerously-set-inner-html",
      category: "security",
      functionName: functionInfo.name,
      detail: `${tagName} uses dangerouslySetInnerHTML`,
    });
  }

  const hasPointerHandler = Array.from(POINTER_HANDLER_PROPS).some((prop) => attributes.has(prop));
  const hasKeyboardHandler = Array.from(KEYBOARD_HANDLER_PROPS).some((prop) => attributes.has(prop));

  if (
    NON_INTERACTIVE_TAGS.has(lowerTagName) &&
    hasPointerHandler &&
    !hasKeyboardHandler &&
    !attributes.has("role") &&
    !attributes.has("tabIndex")
  ) {
    addSignal(fileAnalysis, sourceFile, node, {
      ruleId: "non-interactive-jsx-handler",
      category: "accessibility",
      functionName: functionInfo.name,
      detail: `${tagName} has pointer/click handler syntax without keyboard/role/tabIndex syntax`,
    });
  }

  if (lowerTagName === "button" && !attributes.has("type")) {
    addSignal(fileAnalysis, sourceFile, node, {
      ruleId: "button-missing-type",
      category: "accessibility",
      functionName: functionInfo.name,
      detail: "button has no explicit type attribute",
    });
  }

  if (lowerTagName === "img" && !attributes.has("alt")) {
    addSignal(fileAnalysis, sourceFile, node, {
      ruleId: "img-missing-alt",
      category: "accessibility",
      functionName: functionInfo.name,
      detail: "img has no alt attribute",
    });
  }

  const providerValue = tagName.endsWith(".Provider") ? attributes.get("value") : null;
  const providerExpression =
    providerValue?.initializer && ts.isJsxExpression(providerValue.initializer) ? providerValue.initializer.expression : null;

  if (
    providerExpression &&
    (ts.isObjectLiteralExpression(providerExpression) ||
      ts.isArrayLiteralExpression(providerExpression) ||
      ts.isArrowFunction(providerExpression) ||
      ts.isFunctionExpression(providerExpression))
  ) {
    addSignal(fileAnalysis, sourceFile, node, {
      ruleId: "provider-inline-value",
      category: "performance",
      functionName: functionInfo.name,
      detail: `${tagName} receives an inline ${syntaxName(ts, providerExpression.kind)} value`,
      evidence: textOf(sourceFile, providerExpression, 100),
    });
  }
}

function importLooksLayerSensitive(moduleName) {
  return /(^|\/)(api|apis|repository|repositories|service|services|domain|usecase|usecases)(\/|$)/.test(moduleName);
}

function fileLooksPresentationLayer(filePath) {
  return /(^|\/)(components|presentation|pages|app|features)(\/|$)/.test(normalizeSlashes(filePath));
}

function analyzeImport(ts, sourceFile, node, fileAnalysis, filePath) {
  const moduleName = node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : null;
  if (!moduleName) return;

  fileAnalysis.imports.push({
    line: getLine(sourceFile, node),
    module: moduleName,
  });

  if (fileLooksPresentationLayer(filePath) && importLooksLayerSensitive(moduleName)) {
    addSignal(fileAnalysis, sourceFile, node, {
      ruleId: "presentation-layer-sensitive-import",
      category: "layering",
      functionName: null,
      detail: `presentation-like file imports "${moduleName}"`,
    });
  }
}

function analyzeMutation(ts, sourceFile, node, currentFunction, fileState, fileAnalysis) {
  const operatorKind = ts.isBinaryExpression(node) ? node.operatorToken.kind : null;
  const assignmentOperators = new Set([
    ts.SyntaxKind.EqualsToken,
    ts.SyntaxKind.PlusEqualsToken,
    ts.SyntaxKind.MinusEqualsToken,
    ts.SyntaxKind.AsteriskEqualsToken,
    ts.SyntaxKind.SlashEqualsToken,
    ts.SyntaxKind.PercentEqualsToken,
  ]);

  if (ts.isBinaryExpression(node) && assignmentOperators.has(operatorKind)) {
    const rootName = getExpressionRootName(ts, node.left);
    if (rootName && fileState.stateNames.has(rootName) && rootName !== node.left.getText(sourceFile)) {
      addSignal(fileAnalysis, sourceFile, node, {
        ruleId: "state-direct-mutation",
        category: "state",
        functionName: currentFunction?.name,
        detail: `assignment mutates property/index of state "${rootName}"`,
        evidence: textOf(sourceFile, node, 100),
      });
    }
  }

  if ((ts.isPostfixUnaryExpression(node) || ts.isPrefixUnaryExpression(node)) && node.operand) {
    const rootName = getExpressionRootName(ts, node.operand);
    if (rootName && fileState.stateNames.has(rootName) && rootName !== node.operand.getText(sourceFile)) {
      addSignal(fileAnalysis, sourceFile, node, {
        ruleId: "state-direct-mutation",
        category: "state",
        functionName: currentFunction?.name,
        detail: `update mutates property/index of state "${rootName}"`,
        evidence: textOf(sourceFile, node, 100),
      });
    }
  }

  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
    const rootName = getExpressionRootName(ts, node.expression.expression);
    const methodName = node.expression.name.text;
    if (rootName && fileState.stateNames.has(rootName) && MUTATING_METHODS.has(methodName)) {
      addSignal(fileAnalysis, sourceFile, node, {
        ruleId: "state-mutating-method",
        category: "state",
        functionName: currentFunction?.name,
        detail: `state "${rootName}" calls mutating method "${methodName}"`,
        evidence: textOf(sourceFile, node, 100),
      });
    }
  }
}

function createFunctionInfo(sourceFile, node, name) {
  return {
    name,
    line: getLine(sourceFile, node),
    lines: getEndLine(sourceFile, node) - getLine(sourceFile, node) + 1,
    isComponent: false,
    isHook: isHookName(name),
    hookCalls: [],
    state: [],
    effects: [],
    jsxElements: 0,
    branchCount: 0,
    returnsJsx: false,
  };
}

function shouldKeepFunctionInfo(info) {
  return (
    info.name !== "(anonymous)" ||
    info.isComponent ||
    info.isHook ||
    info.hookCalls.length > 0 ||
    info.effects.length > 0 ||
    info.jsxElements > 0
  );
}

function analyzeFile(ts, repoRoot, filePath) {
  const sourceText = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, getScriptKind(ts, filePath));
  const fileAnalysis = {
    path: toDisplayPath(repoRoot, filePath),
    lines: sourceText.split(/\r?\n/).length,
    imports: [],
    functions: [],
    signals: [],
    parseDiagnostics: sourceFile.parseDiagnostics.map((diagnostic) => ({
      line: diagnostic.start === undefined ? null : sourceFile.getLineAndCharacterOfPosition(diagnostic.start).line + 1,
      code: diagnostic.code,
      message: String(diagnostic.messageText),
    })),
  };
  const fileState = {
    stateNames: new Set(),
    setterNames: new Map(),
  };
  const functionStack = [];

  for (const diagnostic of fileAnalysis.parseDiagnostics) {
    fileAnalysis.signals.push({
      ruleId: "parse-diagnostic",
      category: "syntax",
      line: diagnostic.line,
      functionName: null,
      detail: `TypeScript parse diagnostic ${diagnostic.code}: ${diagnostic.message}`,
      evidence: null,
    });
  }

  function getCurrentFunctionInfo() {
    return functionStack.at(-1)?.info ?? null;
  }

  function visit(node, ancestors = []) {
    if (isFunctionLike(ts, node)) {
      const functionInfo = createFunctionInfo(sourceFile, node, getFunctionName(ts, node));
      functionStack.push({ node, info: functionInfo });
      ts.forEachChild(node, (child) => visit(child, [...ancestors, node]));
      functionStack.pop();

      functionInfo.isComponent =
        isComponentName(functionInfo.name) || functionInfo.returnsJsx || functionInfo.jsxElements > 0;

      if (shouldKeepFunctionInfo(functionInfo)) {
        fileAnalysis.functions.push(functionInfo);
      }

      return;
    }

    const currentFunctionInfo = getCurrentFunctionInfo();

    if (ts.isImportDeclaration(node)) {
      analyzeImport(ts, sourceFile, node, fileAnalysis, filePath);
    }

    if (currentFunctionInfo && ts.isReturnStatement(node) && isJsxLikeExpression(ts, node.expression)) {
      currentFunctionInfo.returnsJsx = true;
    }

    if (currentFunctionInfo && isConditionalOrLoop(ts, node)) {
      currentFunctionInfo.branchCount += 1;
    }

    if (
      currentFunctionInfo &&
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
    ) {
      analyzeJsxNode(ts, sourceFile, node, currentFunctionInfo, fileAnalysis);
    }

    if (currentFunctionInfo && ts.isJsxFragment(node)) {
      currentFunctionInfo.jsxElements += 1;
    }

    if (currentFunctionInfo && ts.isCallExpression(node)) {
      const hookName = getHookNameFromCall(ts, node);

      if (hookName) {
        const hookRecord = {
          line: getLine(sourceFile, node),
          name: hookName,
          insideConditional: isInsideConditionalOrLoop(ts, ancestors, functionStack.at(-1)?.node),
        };
        currentFunctionInfo.hookCalls.push(hookRecord);

        const allowedHookHost = isHookName(currentFunctionInfo.name) || isComponentName(currentFunctionInfo.name);
        if (!allowedHookHost) {
          addSignal(fileAnalysis, sourceFile, node, {
            ruleId: "hook-in-non-react-function",
            category: "hooks",
            functionName: currentFunctionInfo.name,
            detail: `${hookName} is called inside "${currentFunctionInfo.name}", which is not syntactically a component or hook name`,
          });
        }

        if (hookRecord.insideConditional) {
          addSignal(fileAnalysis, sourceFile, node, {
            ruleId: "hook-conditional",
            category: "hooks",
            functionName: currentFunctionInfo.name,
            detail: `${hookName} is syntactically nested under conditional/control-flow syntax`,
          });
        }

        if (hookName === "useState") {
          recordStateHook(ts, sourceFile, node, currentFunctionInfo, fileState);
        }

        if (["useEffect", "useLayoutEffect", "useInsertionEffect"].includes(hookName)) {
          analyzeEffectCall(ts, sourceFile, node, hookName, currentFunctionInfo, fileState, fileAnalysis);
        }
      }
    }

    if (currentFunctionInfo) {
      analyzeMutation(ts, sourceFile, node, currentFunctionInfo, fileState, fileAnalysis);
    }

    ts.forEachChild(node, (child) => visit(child, [...ancestors, node]));
  }

  visit(sourceFile, []);
  fileAnalysis.functions.sort((left, right) => left.line - right.line);
  return fileAnalysis;
}

function buildTotals(files) {
  const allFunctions = files.flatMap((file) => file.functions);
  const allSignals = files.flatMap((file) => file.signals);

  return {
    files: files.length,
    lines: files.reduce((sum, file) => sum + file.lines, 0),
    functions: allFunctions.length,
    components: allFunctions.filter((item) => item.isComponent).length,
    hooks: allFunctions.filter((item) => item.isHook).length,
    hookCalls: allFunctions.reduce((sum, item) => sum + item.hookCalls.length, 0),
    effects: allFunctions.reduce((sum, item) => sum + item.effects.length, 0),
    stateHooks: allFunctions.reduce((sum, item) => sum + item.state.length, 0),
    signals: allSignals.length,
  };
}

function buildReport({ repoRoot, source, files }) {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    repoRoot,
    source,
    totals: buildTotals(files),
    files,
  };
}

function renderMarkdown(report, maxSignals) {
  const signals = report.files.flatMap((file) =>
    file.signals.map((signal) => ({
      ...signal,
      file: file.path,
    })),
  );
  const functions = report.files
    .flatMap((file) =>
      file.functions.map((item) => ({
        ...item,
        file: file.path,
      })),
    )
    .sort((left, right) => right.lines - left.lines || right.hookCalls.length - left.hookCalls.length)
    .slice(0, 80);
  const signalLines =
    signals.length > 0
      ? signals.slice(0, maxSignals).map((signal) => {
          const functionText = signal.functionName ? ` ${signal.functionName}` : "";
          const evidenceText = signal.evidence ? ` Evidence: ${signal.evidence}` : "";
          return `- ${signal.file}:${signal.line ?? "?"} [${signal.category}/${signal.ruleId}]${functionText}: ${signal.detail}.${evidenceText}`;
        })
      : ["- No AST signals found."];
  const functionLines =
    functions.length > 0
      ? functions.map((item) => {
          const roles = [item.isComponent ? "component" : null, item.isHook ? "hook" : null].filter(Boolean).join(", ");
          const roleText = roles ? ` ${roles};` : "";
          return `- ${item.file}:${item.line} ${item.name}:${roleText} ${item.lines} lines, hooks=${item.hookCalls.length}, effects=${item.effects.length}, state=${item.state.length}, jsx=${item.jsxElements}, branches=${item.branchCount}`;
        })
      : ["- No function/component records found."];

  return [
    "# React AST Preflight",
    "",
    "This is deterministic TypeScript AST output. It is not a final code review and does not use AI judgment.",
    "",
    "## Source",
    "",
    `- repo: \`${report.repoRoot}\``,
    `- target: ${report.source.targets.length > 0 ? report.source.targets.map((item) => `\`${item}\``).join(", ") : "none"}`,
    `- diff: ${report.source.diff ? `\`${report.source.diff}\`` : "none"}`,
    "",
    "## Summary",
    "",
    `- files: ${report.totals.files}`,
    `- lines: ${report.totals.lines}`,
    `- functions: ${report.totals.functions}`,
    `- components: ${report.totals.components}`,
    `- hooks: ${report.totals.hooks}`,
    `- hook calls: ${report.totals.hookCalls}`,
    `- effects: ${report.totals.effects}`,
    `- useState calls: ${report.totals.stateHooks}`,
    `- AST signals: ${report.totals.signals}`,
    "",
    "## AST Signals",
    "",
    ...signalLines,
    signals.length > maxSignals ? `- ... ${signals.length - maxSignals} more signals omitted from markdown; see JSON.` : null,
    "",
    "## Component And Hook Index",
    "",
    ...functionLines,
    "",
    "## AI Follow-Up Contract",
    "",
    "- Treat these as syntax facts and candidate review locations.",
    "- Verify semantics from source before turning a signal into a Must fix or Should fix.",
    "- Prefer opening the reported file and nearby line window instead of reading entire changed files first.",
    "- Do not repeat generic React advice when AST signals already narrow the question.",
    "",
  ]
    .filter((line) => line !== null)
    .join("\n");
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
  const maxFiles = getNumberFlag(flags, "max-files", DEFAULT_MAX_FILES);
  const maxSignals = getNumberFlag(flags, "max-signals", DEFAULT_MAX_SIGNALS);
  const outJson = resolveRepoPath(repoRoot, getStringFlag(flags, "out-json") ?? ".react-ai-reviewer/ast-analysis.json");
  const outMd = resolveRepoPath(repoRoot, getStringFlag(flags, "out-md") ?? ".react-ai-reviewer/ast-analysis.md");

  if (targets.length === 0 && !diff) {
    throw new Error("Provide at least one --target or --diff.");
  }

  const ts = loadTypeScript(repoRoot, getStringFlag(flags, "typescript-module"));
  const files = collectTargetFiles({
    repoRoot,
    targetPaths: targets,
    diffPath: diff,
    maxFiles,
  });
  const analyses = files.map((filePath) => analyzeFile(ts, repoRoot, filePath));
  const report = buildReport({
    repoRoot,
    source: {
      targets,
      diff,
      maxFiles,
    },
    files: analyses,
  });

  writeText(outJson, `${JSON.stringify(report, null, 2)}\n`);
  writeText(outMd, `${renderMarkdown(report, maxSignals)}\n`);

  console.log(`Wrote AST preflight JSON: ${toDisplayPath(repoRoot, outJson)}`);
  console.log(`Wrote AST preflight Markdown: ${toDisplayPath(repoRoot, outMd)}`);
  console.log(`Analyzed ${report.totals.files} files and found ${report.totals.signals} AST signals.`);
}

try {
  main();
} catch (error) {
  console.error("Failed to analyze React AST.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
