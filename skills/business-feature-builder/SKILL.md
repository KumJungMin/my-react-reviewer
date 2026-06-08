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
4. For page-level work, apply the Page Assembly Structure rules before adding local `render*` helpers.
5. Implement the TODO bodies after the skeleton is in place. Do not stop at skeleton unless the user explicitly asks for scaffolding only.
6. Split UI by role, rerender boundary, performance, and readability. Avoid meaningless over-splitting.
7. Generate or update tests from the requirements. Cover normal flow, validation, failure/error, loading/disabled states, and meaningful edge cases.
8. Run relevant validation and report exact commands and results.

## Page Assembly Structure

For page or route-level features, keep the page as an assembly layer:

- `{PageName}Page.tsx`: receive props if any, call `use{PageName}Page`, wire the view model, and compose sections.
- `use{PageName}Page.ts`: own page state, handlers, effects, async orchestration, validation flow, navigation, and commands.
- Page section components: semantic UI regions that receive only the props and events they need.
- `.core.ts` or `.utils.ts`: mapping, formatting, validation, predicates, reducers, and policy that do not need React runtime state.

Always mark decomposition candidates before implementation when a page has two or more local `render*` helpers or page-specific sub-render functions such as `ServiceIntro*`. `serviceIntroPage`-style pages with multiple `renderGuide`, `renderCTA`, `ServiceIntroHeader`, or similar helpers should not keep growing as one local render cluster without an explicit reason.

Split a page section into a component when at least one condition is true:

- It is a semantic UI region such as header, hero, guide, card, list, FAQ, CTA, modal trigger, footer, empty state, or error state.
- It can have its own `interface Props` that describes only the data and events it needs.
- It can work from `props` without directly reading page-level `use{PageName}Page` state or mutating page-local variables.
- It is reused or likely to be reused in two or more places.
- A render helper grows past roughly 30-40 lines, accumulates multiple branches, or becomes hard to scan in review.
- The page/component body grows past roughly 200 lines of JSX or mixes UI assembly, style decisions, data mapping, and event wiring enough to obscure the main page flow.
- It would be useful as a separate test or review unit.

Keep a section local when it is still tightly coupled to page-only state, closures, or one-off conditional markup and extracting it would hide simple logic behind indirection.

Default placement:

- Prefer `apps/service/src/presentation/page/<PageName>/components/` for page-specific section components when the repository uses page-local component folders.
- Otherwise keep section files under the `<PageName>` folder next to the page, hook, styles, and tests.
- Do not move a page section into shared components unless there is real cross-page reuse or an explicit team convention.

Example:

```tsx
function ServiceIntroPage() {
  const vm = useServiceIntroPage();

  const renderHero = () => <section>{/* hero UI */}</section>;
  const renderGuideCards = () => <section>{/* guide cards */}</section>;
  const renderCTA = () => <footer>{/* CTA */}</footer>;

  return (
    <PageContainer>
      {renderHero()}
      {renderGuideCards()}
      {renderCTA()}
    </PageContainer>
  );
}
```

```tsx
export function ServiceIntroPage() {
  const vm = useServiceIntroPage();

  return (
    <PageContainer>
      <ServiceIntroHero title={vm.title} description={vm.description} />
      <ServiceIntroGuideCards items={vm.guideItems} />
      <ServiceIntroCTA label={vm.ctaLabel} onStart={vm.handleStart} />
    </PageContainer>
  );
}

interface ServiceIntroCTAProps {
  label: string;
  onStart: () => void;
}

function ServiceIntroCTA({ label, onStart }: ServiceIntroCTAProps) {
  return (
    <footer>
      <button type="button" onClick={onStart}>
        {label}
      </button>
    </footer>
  );
}
```

When extracting sections, pass primitive values, stable data shapes, and event callbacks. Do not let extracted components import or call `use{PageName}Page` directly.

## Core Rules

- Prefer cohesive modules with low coupling over one large component.
- Keep UI control logic separate from business logic. UI files may wire props and render states, but business decisions should live in hooks or pure modules.
- Use hooks for React runtime concerns, not for pure calculations.
- Extract top-level presentational components when JSX sections have clear roles or rerender boundaries.
- Avoid defining React components inside React components.
- Do not add new local `render*` helpers to large page files before evaluating page section extraction.
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
