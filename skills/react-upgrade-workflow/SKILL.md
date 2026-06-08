---
name: react-upgrade-workflow
description: "Use when improving existing React/TypeScript code quality without adding major new business features. Focuses on state/effect cleanup, component responsibility split, pure logic extraction, rendering boundary improvement, accessibility, tests, and verification."
---

# React Upgrade Workflow

Use this skill when the user asks for:

- React code 고도화
- refactoring or maintainability improvement
- hooks cleanup
- `useEffect` cleanup
- state model cleanup
- component responsibility separation
- testability improvement
- rendering performance review
- accessibility or type-safety hardening in existing React code

## Shared Work Principles

Before non-trivial code-changing work, apply `../react-workflow-orchestrator/references/shared-work-principles.md` when available. This shared contract requires design confirmation before edits, reviewable batches around 300 changed lines, purpose/direction/validation commit messages, and per-unit validation.

Do not use this skill for:

- multi-skill workflow control, user-visible implementation lists, commit-sized batches, or purpose/direction commit messages: use `react-workflow-orchestrator`
- new business feature implementation: use `business-feature-builder`
- review-only requests: use `react-ai-reviewer`
- design-system component creation or hardening: use `gds-generator`
- Figma-based implementation: use `create-component-from-figma`

## Inputs

Use available context first. Ask only for missing critical information.

Required when possible:

- `target`: file, folder, component, hook, or diff
- `goal`: maintainability, performance, state/effect cleanup, architecture, testability, accessibility, or type safety
- `scope`: current file only, related files, current diff, or feature folder
- `verification`: typecheck, test, lint, build, or none

## Context Selection

For non-trivial diagnosis, load the internal React Quality Lens from `skills/react-ai-reviewer`:

- `skills/react-ai-reviewer/references/reviewer-system/prompts/react-quality-lens.md`
- `skills/react-ai-reviewer/references/reviewer-system/contexts/react-quality-rules.md`

Load only the specific rules needed for the target. For small edits, inspect nearby code first and keep the lens as a checklist.

## Preflight Script

For non-trivial state/effect/responsibility diagnosis, run the shared React AST preflight first when the target project has TypeScript installed:

```bash
node skills/react-ai-reviewer/scripts/analyze-react-ast.mjs --repo . --target src/features/example/Example.tsx
```

Read `.react-ai-reviewer/ast-analysis.md` before opening whole source files. Use its source windows and signals as candidate locations to verify, not as final conclusions.

## Workflow

### 1. Inspect

Read the target code and directly related files.

Identify:

- render responsibility
- local state
- derived state
- effects
- event handlers
- async orchestration
- API/data access
- mapping/formatting
- validation/policy
- external dependencies

### 2. Diagnose

Classify issues using React Quality Lens:

- correctness
- hooks/effects
- state model
- component responsibility
- rendering performance
- accessibility
- type safety
- testability

### 3. Prioritize

Use this priority:

1. behavior bug
2. unsafe state/effect
3. hard-to-test business logic
4. unclear responsibility
5. avoidable rerender
6. naming/readability

### 4. Plan

Before editing, create a minimal refactor plan. For non-trivial work, present this plan as the design and implementation list required by the shared work principles, then wait for explicit confirmation before editing.

The plan must state:

- what will change
- what will not change
- expected behavior preservation
- files likely to change
- verification commands

### 5. Refactor

After confirmation for non-trivial work, apply changes in small, safe steps.

Rules:

- preserve public behavior unless explicitly asked
- avoid broad folder restructuring
- avoid adding new libraries
- avoid speculative abstraction
- prefer pure function extraction for business rules
- prefer hook extraction for React runtime orchestration
- prefer component extraction for JSX composition
- do not introduce `useMemo` or `useCallback` without a concrete reason

### 6. Verify

Run the most relevant checks available:

- typecheck
- unit test
- lint
- build

If a command cannot be run, explain why.

### 7. Report

Final response must include:

- interpreted goal
- issues found
- changes made
- files changed
- behavior preserved or changed
- verification result
- remaining risks
- optional next steps

## Security Boundary

- Do not install, execute, or import external diagnostic packages unless the user explicitly asks.
- Do not send source code, diffs, secrets, environment variables, or repository metadata to third-party services.
- Do not add GitHub Actions that require write permissions unless explicitly requested.
- Do not read `.env`, secret files, private keys, tokens, or credential files unless the task explicitly requires that exact file and the user approves the scope.
- When reviewing security-sensitive code, inspect only the source files required for the task.
- Prefer internal markdown-based review rules over external scanners.
