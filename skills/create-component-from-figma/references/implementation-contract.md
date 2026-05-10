# Create Component From Figma Contract

## Purpose

Use this repository workflow to translate design assets such as screenshots, mockups, Figma frames, and written descriptions into production-ready React components.

The goal is not pixel cloning. The goal is to produce code that is:

- aligned with the existing design system
- semantically correct
- accessible
- reusable
- maintainable
- ready for production review

Prioritize durable product code over superficial visual mimicry.

## Priority Order

When instructions or constraints conflict, follow this order:

1. Explicit task instructions and product requirements
2. Correctness, accessibility, and safety
3. Existing repository primitives, tokens, utilities, and conventions
4. Semantic HTML and maintainable architecture
5. Visual fidelity to screenshots or mockups

If a mockup conflicts with accessibility, semantic correctness, or repository constraints, preserve the higher-priority requirement and document the deviation.

## Output Stack

- Framework: React + TypeScript with strict typing
- Styling: Vanilla Extract only, using `.css.ts` files
- Dependency rule: Reuse existing `components/ui` primitives, tokens, and utilities first
- Do not add external dependencies unless explicitly requested or absolutely necessary for parity with existing repository patterns

## Repository Discovery

Before implementing:

1. Inspect existing `components/ui`, tokens, shared utilities, and nearby feature folders.
2. Search for similar interaction patterns already present in the repository.
3. Match the local file structure, naming conventions, typing style, and test style.
4. Reuse existing primitives and utilities before creating new abstractions.
5. Create a new primitive only when composition of existing primitives is clearly insufficient.

Do not introduce a parallel design system or duplicate an existing primitive with a different API.

## Design Interpretation Rules

Treat screenshots and mockups as visual references, not literal pixel maps.

- Written instructions override the screenshot when they conflict.
- Infer structure before implementation:
  - component boundaries
  - layout direction
  - spacing rhythm
  - typography hierarchy
  - interactive affordances
  - visible and implied states
  - slot regions
  - responsive behavior where visible or strongly implied
- Prefer semantic HTML over non-semantic wrappers.
- Do not replace meaningful text with images or encode text in background images.
- Do not invent features, states, or data requirements that are unsupported by the design, description, or repository conventions.
- Where a state is not shown but is required for a complete component such as hover, focus, disabled, loading, empty, or error, infer it from repository and design-system patterns, then document the assumption.

Use the nearest design token or existing scale value rather than hardcoding screenshot measurements.

## Architecture Rules

Choose the simplest architecture that satisfies the component’s actual complexity.

### Keep Simple Components Simple

For purely presentational or low-complexity UI:

- use a small, direct component
- avoid unnecessary context
- avoid unnecessary hooks
- avoid premature abstraction

### Headless Pattern

Use a headless custom hook such as `useComponent` when:

- interaction logic is non-trivial
- keyboard behavior must follow an APG pattern
- controlled and uncontrolled support is required
- prop-getter style APIs meaningfully reduce duplication
- the same logic may back multiple UI presentations

Headless hooks should contain logic, state transitions, derived interaction props, and accessibility wiring. Keep rendering concerns outside the hook.

### Compound Component Pattern

Use compound components when:

- multiple subparts must share state or context
- consumers need flexible layout composition
- the component naturally decomposes into parts such as `Root`, `Trigger`, `Content`, `Item`, `Label`, or `Description`

Do not use a compound API for a component that is simpler as a single unit.

### Composition Over Prop Explosion

Prefer composition, slots, and clear subcomponents over large monolithic prop surfaces.

Avoid boolean-prop accumulation. Prefer explicit variants or discriminated unions when multiple modes exist.

## Component API and State Rules

- Prefer narrow, explicit props over broad configuration objects.
- Reuse existing repository naming patterns for controlled and uncontrolled APIs:
  - `value` / `defaultValue` / `onValueChange`
  - `open` / `defaultOpen` / `onOpenChange`
- Avoid derived state when values can be computed from props or current state.
- Avoid unnecessary `useEffect`. Do not mirror props into state without a clear reason.
- Forward refs for interactive or focusable elements when integration or accessibility benefits from it.
- Colocate helpers and mappers unless there is clear multi-call-site reuse.
- Promote helpers to shared utilities only after clear evidence of reuse.
- Keep state and logic as close as practical to the component that owns them.

Always consider and design for:

- empty
- loading
- error
- disabled
- readOnly
- invalid
- selected or active
- async pending states where relevant

## Accessibility and Standards

Accessibility is a core requirement, not a finishing pass.

### Foundational Rules

- Prefer native HTML semantics first.
- Use ARIA only when native elements cannot express the needed behavior.
- Follow the relevant W3C WAI-ARIA Authoring Practices pattern for composite widgets.
- Ensure accessible name, role, state, and value are correct.
- Ensure full keyboard operability with logical tab order.

### WCAG-Oriented Requirements

Meet WCAG 2.2 AA where applicable:

- Text contrast: minimum 4.5:1, or 3:1 for large text
- Non-text UI component boundaries and focus indicators: minimum 3:1
- Visible focus indication
- No information conveyed by color alone
- Keyboard access without pointer dependence

### Dialog / Sheet / Popover Expectations

For modal or modal-like surfaces:

- move focus intentionally on open
- trap focus when the pattern requires it
- restore focus appropriately on close
- support Escape dismissal where appropriate
- prevent inaccessible background interaction where required by the pattern

### Dynamic Feedback

For meaningful dynamic state changes:

- use `aria-live` or an appropriate status pattern intentionally
- avoid overly noisy announcements
- use `aria-busy` where appropriate during async loading

### Touch and Motion

- Aim for touch targets of at least 44x44 CSS px as a strong product best practice when space allows.
- Respect `prefers-reduced-motion`.
- Do not make motion the sole carrier of meaning.

### Decorative Content

- Decorative icons and images should be hidden from assistive technology.
- Informative icons must have an accessible label or supporting text.

## Styling Rules

- Use Vanilla Extract only.
- Use design tokens for color, spacing, typography, radii, shadow, motion, and z-index whenever available.
- Avoid magic numbers. If one is unavoidable, keep it minimal and document why.
- Use structured variants or recipes instead of scattered conditional class logic.
- Implement consistent states:
  - default
  - hover
  - focus-visible
  - active
  - disabled
  - loading
  - selected
  - invalid
- Match the repository’s responsive strategy and breakpoints.
- Prefer logical CSS properties when the codebase uses them.
- Do not embed meaningful content in CSS backgrounds.

## Content and Reusability Rules

- Treat screenshot copy as example content unless the task clearly defines it as fixed product copy.
- Do not hardcode volatile product content into reusable primitives.
- Prefer `children`, slots, or explicit props for variable content.
- Do not over-generalize on first use. Build for the current use case while leaving reasonable extension paths.

## Performance and Implementation Discipline

- Prefer simple render paths and predictable state flow.
- Avoid unnecessary memoization; use it only when it clearly improves correctness or performance.
- Avoid unnecessary re-renders caused by unstable inline object or function contracts where repository patterns already solve this.
- Keep client-side boundaries as small as possible.

Do not add `"use client"` by default. Add it only when interactivity or browser-only APIs require it, and state the reason in the response.

## Naming and File Conventions

- Follow existing repository naming, folder structure, export style, and file colocation patterns.
- Keep related files close together:
  - component
  - hook
  - styles
  - tests
  - stories, if the repository uses them
- Use predictable names for parts and variants.
- Avoid vague names such as `data`, `info`, `helper`, or `utils` when a more specific name is available.

## Required Response Format

Every implementation response should include:

1. `Identified Components`
   - The component boundary and role
   - Which parts are presentational vs interactive
2. `Repository Reuse Plan`
   - Existing primitives, tokens, utilities, and patterns being reused
   - Why new abstractions were or were not introduced
3. `Architecture Strategy`
   - Whether the component is simple, headless, compound, or a combination
   - Controlled or uncontrolled decisions
   - Key state and interaction decisions
4. `Implementation`
   - React component code
   - `.css.ts` styling
   - Any supporting hook or context code
5. `Accessibility and Edge Cases`
   - Semantic choices
   - Keyboard behavior
   - Screen-reader behavior
   - Empty, loading, error, and disabled handling
6. `Validation`
   - Exact commands run
   - Pass or fail status
   - Whether failures were pre-existing or introduced
7. `Assumptions and Deviations`
   - Inferred states not shown in the design
   - Any accessibility-driven or system-driven deviations from the mockup
   - Any repository constraints that affected the result

## Validation Rules

Run the repository’s available validation commands relevant to the change, typically including:

- lint
- typecheck
- test

If a script is missing, say so explicitly.

If a validation step fails, distinguish between:

- a failure introduced by the new implementation
- a pre-existing repository failure

Prefer behavior-focused tests for interactive components over snapshot-only tests.
Where the repository already has accessibility testing patterns, follow them.

## Do Not

Do not:

- trade accessibility for visual similarity
- hardcode screenshot pixels into brittle layouts
- mix non-trivial business or interaction logic directly into presentational rendering when separation improves clarity
- introduce new dependencies without clear justification
- add `"use client"` without need
- create a new primitive when existing primitives can be composed
- use ARIA that conflicts with or redundantly duplicates native semantics
- over-abstract simple components
- use one-off implementations where a repository-standard pattern already exists
- ignore empty, loading, error, disabled, or keyboard states for interactive UI

## Definition of Done

The task is complete only when all of the following are true:

- The implementation satisfies both the visual reference and the written requirements
- Existing repository primitives, tokens, and utilities were reused wherever practical
- The architecture is no more complex than necessary
- Semantic HTML and accessibility requirements are satisfied
- Keyboard interactions match the relevant component pattern
- Styling uses Vanilla Extract and design tokens correctly
- Required component states and edge cases are covered
- Validation commands were run and results were reported
- Assumptions and deviations were explicitly documented
