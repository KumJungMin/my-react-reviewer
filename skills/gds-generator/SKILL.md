---
name: gds-generator
description: "Use when hardening Figma-generated UI code into design-system-quality components, updating existing packages/design-system code, or creating/refactoring/reviewing/extending design-system components that need public API design, accessibility, interaction state, Vanilla Extract styling, slot/class contracts, ownerState-style internal state, core logic extraction, useComponent hooks, component docs, examples, tests, or exports. For raw Figma-to-code requests use skills/create-component-from-figma first; for business feature implementation use skills/business-feature-builder."
---

# GDS Generator

Use this skill for design-system component generation and meaningful design-system component refactors under `packages/design-system`.

If the user writes `gda-generator`, treat it as `gds-generator` unless they clearly mean a different skill.

## Routing

- Use this skill when code from `create-component-from-figma` needs design-system hardening, API cleanup, component architecture, docs/examples, tests, or package exports.
- Use this skill when updating existing `packages/design-system` code.
- If the request is only "turn this Figma link into code", use `skills/create-component-from-figma` first.
- If the request includes business requirements, prescribed components, and a Figma link for an app/page feature, use `skills/business-feature-builder` as the primary workflow.
- If the request is final review, use `skills/react-ai-reviewer`.

## Context Selection

Do not load every reference by default. Choose the smallest useful context:

- For new component architecture, public API design, slot structure, ownerState, context decisions, or class contract decisions, read `references/architecture.md`.
- For actual implementation with React, hooks, prop getters, Vanilla Extract recipes, class contracts, or exports, read `references/implementation-patterns.md`.
- For reviewing, refactoring, or checking generated code quality, read `references/review-checklist.md`.
- For simple presentational components, start from this file and nearby repository examples. Read references only if the component grows beyond static rendering.
- For tasks involving style-guide docs/examples, inspect `apps/style-guide-viewer/src/component-docs` and load implementation patterns only if docs need new public API examples.

Always inspect nearby `packages/design-system/src/components/**` code before editing. Prefer the repository's current kebab-case component folders, `Component.tsx`, `Component.types.ts`, `component-core.ts`, `component.css.ts`, and `index.ts` conventions unless the requested change explicitly asks for a new convention.

## Preflight Script

For component hardening, API cleanup, or review/refactor work, run deterministic GDS preflight before reading many files:

```bash
node skills/gds-generator/scripts/analyze-gds-component.mjs --repo . --target packages/design-system/src/components/button
```

Use `.gds-generator/component-analysis.md` to inspect folder shape, public exports, prop naming candidates, Vanilla Extract usage, slot/data-state facts, and architecture signals. Treat signals as candidates, not final review findings.

## Operating Principles

- Use React + TypeScript.
- Use Vanilla Extract. Do not use styled-components, emotion, Tailwind CSS, CSS Modules, or large inline style objects unless explicitly requested.
- Keep `Component.tsx` thin. It should mostly assemble JSX, slots, children, and prop getters.
- Move behavior, state derivation, event composition, accessibility attributes, and class assembly into `useComponent.ts` when the component is interactive or complex.
- Keep pure normalization and policy in `component-core.ts` when it can be tested without React rendering.
- Use Material UI-style slot, ownerState-like internal state, and stable class/slot contract concepts without copying MUI's runtime styling model.
- Use HeroUI's Button as the mental model for button-like components: `useButton()` returns `Component`, `children`, `spinner`, `startContent`, `endContent`, `getButtonProps()`, and slot getter props; `Button.tsx` renders those pieces.
- Reuse existing repository utilities first. Do not add React Aria, ripple, classnames, or theme dependencies just because a reference library uses them.

## Workflow

1. Identify whether the task is generation, refactor, review, style docs, or API design.
2. Load only the reference contexts needed for that task.
3. Inspect nearby GDS components and package exports.
4. Design public props before editing. Prefer semantic props: `isDisabled`, `isInvalid`, `isLoading`, `startContent`, `endContent`, `variant`, `color`, `size`, `radius`.
5. Decide the minimal architecture. Do not create hooks, context, class-contract files, or recipes unless their responsibility is real.
6. Implement with thin rendering, separated behavior, token-based Vanilla Extract styles, explicit slots, and public-only exports.
7. Update style-guide viewer docs/examples when public component behavior or props change.
8. Add or update focused tests when a matching test pattern exists or the behavior is non-trivial.
9. Run relevant validation, usually `npm run build -w @org/gds`, plus typecheck/build commands for changed docs/examples.

## Final Response

When making changes, summarize:

- API shape and any alias/deprecation decisions
- architecture split used and why
- reference contexts loaded
- files changed
- validation commands and results
- remaining risks or intentionally skipped states
