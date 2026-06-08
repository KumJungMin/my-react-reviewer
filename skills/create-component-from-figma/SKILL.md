---
name: create-component-from-figma
description: "Translate Figma files, screenshots, mockups, and written UI descriptions into initial production-ready React + TypeScript components styled with Vanilla Extract and aligned to the current repository's design system. Use primarily when the user provides a Figma link, node-id, screenshot, or mockup and asks to code the UI. If the request combines business requirements, prescribed components, and a Figma link, use skills/business-feature-builder as the primary workflow. If the request is to harden or update existing design-system code, use skills/gds-generator."
---

# Create Component From Figma

Implement durable product code from design assets. Prioritize repository fit, semantics, accessibility, reusability, and maintainability before pixel fidelity.

## Routing

- If the user asks for a multi-skill workflow, user-visible implementation list, commit-sized batches, or purpose/direction commit messages, use `skills/react-workflow-orchestrator` as the primary workflow and this skill as a controlled substep.
- Use this skill as the primary workflow for Figma/screenshot/mockup-to-code requests.
- If the user provides business requirements plus components to use plus a Figma link, use `skills/business-feature-builder` as the primary workflow and use this skill only for design interpretation.
- If the user asks to refine, harden, or update generated code into a design-system-quality component, use `skills/gds-generator`.
- If the user asks for final review, use `skills/react-ai-reviewer`.

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

## Preflight Script

Before implementing substantial Figma/screenshot-to-code work, collect reusable repository UI inventory:

```bash
node skills/create-component-from-figma/scripts/collect-ui-inventory.mjs --repo . --target src/features/example
```

Read `.create-component-from-figma/ui-inventory.md` before creating new primitives. It lists component exports, token/theme files, Vanilla Extract patterns, frequent UI imports, nearby files, and validation script candidates.

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
