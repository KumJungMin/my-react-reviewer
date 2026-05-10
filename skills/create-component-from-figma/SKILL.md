---
name: create-component-from-figma
description: "Translate Figma files, screenshots, mockups, and written UI descriptions into production-ready React + TypeScript components styled with Vanilla Extract and aligned to the current repository's design system. Use when Codex needs to inspect existing UI primitives, tokens, utilities, and nearby feature patterns before implementing or refining a component from a Figma URL, node-id, screenshot, or mockup."
---

# Create Component From Figma

Implement durable product code from design assets. Prioritize repository fit, semantics, accessibility, reusability, and maintainability before pixel fidelity.

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

## References

Read `references/implementation-contract.md` for the full implementation contract before making substantial UI changes. It contains the detailed priority order, architecture rules, accessibility requirements, styling constraints, validation rules, and definition of done.
