# GDS Review And Refactor Checklist

Load this reference when reviewing generated code, refactoring an existing component, or preparing final quality checks.

## Refactoring Steps

1. Identify JSX structure.
2. Identify behavior, state, and event logic.
3. Identify style variants.
4. Identify reusable slots.
5. Identify public API and compatibility aliases.
6. Move rendering to `Component.tsx`.
7. Move behavior to `useComponent.ts` only when behavior is non-trivial.
8. Move pure calculations to `component-core.ts`.
9. Move styling to `component.css.ts`.
10. Move public types to `Component.types.ts`.
11. Export only public APIs from `index.ts` and the package root.

## Component Design Rules

- Start simple. Do not create unnecessary hooks, contexts, reducers, services, or mappers for presentational components.
- Split a hook when behavior grows: controlled/uncontrolled state, keyboard/pointer interaction, focus management, accessibility attributes, context merging, event handler composition, prop getters, or derived state with multiple inputs.
- Split styles when variant combinations grow: `variant x size x color x radius x state`.
- Prefer `data-*` attributes for runtime state styling: `data-disabled`, `data-loading`, `data-pressed`, `data-selected`, `data-expanded`.
- Use explicit slots for multiple visual parts.
- Use an internal ownerState-like object for multi-prop state; never expose ownerState publicly.
- Keep public props semantic. Avoid leaking implementation details such as `buttonRootClass`, `innerSpanClass`, `loadingWrapperRef`, or `internalVariantKey`.
- Use semantic/component tokens over raw values.
- Use context only when multiple components share state or configuration.

## Review Checklist

```txt
[ ] Is Component.tsx mostly rendering-only?
[ ] Are behavior and derived state moved to useComponent.ts when needed?
[ ] Is the component simple enough, or over-engineered?
[ ] Are styles written with Vanilla Extract?
[ ] Are variants handled with styleVariants or recipe only when useful?
[ ] Are runtime states represented with data attributes and native attributes where appropriate?
[ ] Are slots clearly named and located?
[ ] Are public types separated?
[ ] Is index.ts exporting only public API?
[ ] Is context used only when multiple components share state?
[ ] Are design tokens used instead of hardcoded colors?
[ ] Are class/slot contracts stable when external override is supported?
[ ] Are legacy aliases documented and canonical props preferred?
[ ] Are style-guide viewer docs/examples updated when public API changed?
```

## Constraints

- Use React + TypeScript.
- Use Vanilla Extract with repository token conventions.
- Do not use Tailwind CSS, styled-components, emotion, CSS Modules, or large inline style objects.
- Do not put complex behavior directly inside component render files.
- Do not create context unless it is actually needed.
- Do not create hooks for purely presentational components unless logic is expected to grow.
- Prefer explicit slot names, semantic public props, data attributes for runtime states, and design tokens over raw values.

## Output Format

When asked to design, create, or refactor a component, report:

1. Suggested folder structure
2. Public API and compatibility notes
3. Responsibility split
4. Implementation summary or code changes
5. Style/token decisions
6. Extension points
7. Trade-offs or simplifications
8. Validation results

For review-only work, lead with findings ordered by severity, then open questions, then a brief summary.
