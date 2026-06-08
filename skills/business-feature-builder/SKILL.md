---
name: business-feature-builder
description: "Use when implementing React/TypeScript business features from requirements, including page logic, form flows, prescribed components, Figma-linked feature specs, stateful UI behavior, API/usecase orchestration, validation, navigation, and tests. This is the primary workflow when the user provides business requirements plus components to use plus a Figma link. Enforces skeleton-first implementation, UI/business separation, pure core/utils extraction, focused tests, and UI decomposition by role, rerender boundary, cohesion, and maintainability."
---

# Business Feature Builder

Use this skill for business feature implementation. Keep `react-ai-reviewer` review-only; use this skill when code must be created or changed.

Do not use this skill for design-system component architecture under `packages/design-system`; use `gds-generator` for that.

## Routing

- Use this skill as the primary workflow when the user provides business requirements, components to use, and a Figma link for an app/page feature.
- Use `skills/create-component-from-figma` only as supporting design interpretation when a Figma link is part of the business feature.
- Use `skills/gds-generator` instead when the target is `packages/design-system` or the task is hardening/updating design-system code.
- Use `skills/react-ai-reviewer` for final review after implementation.

## Context Selection

Do not load every reference by default. Choose the smallest useful context:

- For end-to-end feature implementation workflow, requirement shaping, skeleton-first edits, and final response shape, read `references/workflow.md`.
- For UI/business separation, hook boundaries, pure `.core.ts`/`.utils.ts` extraction, cohesion/coupling, and component decomposition, read `references/separation-rules.md`.
- For test generation, test scope, edge cases, mocks, and verification strategy, read `references/testing-rules.md`.
- For small single-function changes, start from this file and inspect nearby code. Load references only when separation or tests are non-trivial.
- For page work, inspect existing page folders with matching patterns, especially `{Page}.tsx`, `use{Page}.ts(x)`, `.core.ts`, `.utils.ts`, and nearby tests.

## Preflight Script

For non-trivial page or feature work, run deterministic context preflight before opening many files:

```bash
node skills/business-feature-builder/scripts/analyze-feature-context.mjs --repo . --target apps/service/src/presentation/page/examplePage
```

Use `.business-feature-builder/feature-context.md` to choose the smallest files and references to open. Treat responsibility signals as candidates, not mandatory refactors.

## Required Flow

1. Analyze requirements and identify inputs, outputs, state, side effects, and edge cases.
2. Create function, handler, hook, and component signatures before filling behavior. Add concise TODO comments inside the empty bodies describing what must be implemented.
3. Separate responsibilities before implementation:
   - `{Component}.tsx`: JSX, layout, presentational composition, and child components.
   - `use{Component}.tsx`: React state, event handlers, lifecycle, navigation, async orchestration, validation flow, derived state, and submit flow.
   - `.core.ts` or `.utils.ts`: pure calculations, mapping, validation, formatting, policy, and functions that do not need React.
4. Implement the TODO bodies after the skeleton is in place. Do not stop at skeleton unless the user explicitly asks for scaffolding only.
5. Split UI by role, rerender boundary, performance, and readability. Avoid meaningless over-splitting.
6. Generate or update tests from the requirements. Cover normal flow, validation, failure/error, loading/disabled states, and meaningful edge cases.
7. Run relevant validation and report exact commands and results.

## Core Rules

- Prefer cohesive modules with low coupling over one large component.
- Keep UI control logic separate from business logic. UI files may wire props and render states, but business decisions should live in hooks or pure modules.
- Use hooks for React runtime concerns, not for pure calculations.
- Extract top-level presentational components when JSX sections have clear roles or rerender boundaries.
- Avoid defining React components inside React components.
- Use `memo`, `useMemo`, and `useCallback` only when there is a concrete rerender or expensive-computation reason.
- Preserve existing repository conventions before inventing new folder structures.

## Final Response

When implementing, summarize:

- requirement interpretation and any assumptions
- skeleton/signature plan used
- responsibility split and files changed
- tests added or updated
- validation commands and results
- remaining risks or intentionally skipped cases
