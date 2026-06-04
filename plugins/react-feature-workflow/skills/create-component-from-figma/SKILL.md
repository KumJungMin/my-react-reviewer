---
name: create-component-from-figma
description: "Analyze Figma files, screenshots, mockups, and written UI descriptions, then translate them into production-ready React + TypeScript components styled with Vanilla Extract when implementation is requested. Use for design analysis, component candidate extraction, layout structure, design token inference, responsive behavior, accessibility considerations, and repository-aligned UI implementation."
---

# Create Component From Figma

Implement durable product code from design assets. Prioritize repository fit, semantics, accessibility, reusability, and maintainability before pixel fidelity.

## Language

All user-facing responses, questions, summaries, artifact prose, section headings, and guidance must be written in Korean by default. Keep code identifiers, file paths, commands, API names, and quoted source names in their original form. If another instruction names an English response section, translate that section heading into natural Korean when presenting it to the user.

This skill can be used in two ways:

- `design-analysis`: analyze the design and produce implementation guidance without editing code
- `implementation`: implement or refine production code from the design source

## Customization

Before applying defaults, read project-level design overrides when they exist:

- `.codex/react-feature-workflow/figma-design-policy.md`
- `.codex/design-policy.md`
- `docs/design-system.md`
- `docs/frontend-design.md`

Use project overrides for design token mapping, responsive rules, component boundary preferences, accessibility requirements, allowed primitives, styling rules, and validation commands.

If an override exists, mention it in the response and apply it before generic Figma implementation guidance.

## Inputs

Need at least one design source:

- Figma URL or node-id
- screenshot or mockup
- written component description

Also collect the minimum missing delivery context:

- target path or feature area
- expected interactivity or states
- scope boundary
- validation expectations

If those are missing, ask concise follow-up questions before editing.

## Workflow

1. Inspect existing `components/ui`, tokens, shared utilities, and nearby feature folders first.
2. If the user provided a Figma URL or node-id, use the available Figma implementation skill and tools to extract the design structure. Treat generated code as reference, not final output.
3. Infer component boundaries, layout, state model, responsive behavior, and accessibility requirements from the design plus repository conventions.
4. Choose the simplest architecture that fits the interaction complexity:
   - direct component for presentational UI
   - headless hook for non-trivial interaction logic
   - compound API only when multiple coordinated subparts genuinely need it
5. Implement with React + TypeScript and Vanilla Extract only. Reuse existing primitives, tokens, utilities, and patterns before introducing new abstractions.
6. Cover meaningful states and edge cases that are required by the component, even if the mockup shows only one state.
7. Run the relevant repository validation commands and report exact results.

In `design-analysis` mode, stop after step 3 and report:

- component candidates
- layout structure
- token and style implications
- responsive behavior
- accessibility considerations
- required and implied states
- implementation risks or assumptions

## Core Rules

- Prefer repository primitives and composition over new primitives.
- Prefer semantic HTML over wrapper-heavy markup.
- Prefer accessible behavior over screenshot fidelity when they conflict.
- Do not add external dependencies unless the repository already uses that pattern or the user explicitly asks.
- Do not add `"use client"` unless browser-only behavior requires it.
- Use Vanilla Extract `.css.ts` files for styling.
- Use nearest tokens and scale values rather than hardcoded mockup measurements.

## Required Response Shape

When implementing, structure the final response with these sections:

1. `Identified Components`
2. `Repository Reuse Plan`
3. `Architecture Strategy`
4. `Implementation`
5. `Accessibility and Edge Cases`
6. `Validation`
7. `Assumptions and Deviations`

When analyzing only, structure the response with:

1. `Design Source`
2. `Component Candidates`
3. `Layout and Responsive Rules`
4. `Token and Styling Implications`
5. `Accessibility and States`
6. `Implementation Notes`

## References

Read `references/implementation-contract.md` for the full implementation contract before making substantial UI changes. It contains the detailed priority order, architecture rules, accessibility requirements, styling constraints, validation rules, and definition of done.
