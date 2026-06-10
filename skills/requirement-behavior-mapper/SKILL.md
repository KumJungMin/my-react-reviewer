---
name: requirement-behavior-mapper
description: "Use when the user provides a requirements list and wants pre-implementation analysis: group requirements into user behavior units, identify missing state/exception/permission/validation/loading cases, propose questions before implementation, and suggest feature or commit slices. Use this before business-feature-builder when requirements need refinement before code changes."
---

# Requirement Behavior Mapper

Use this skill to turn a raw requirements list into behavior-centered implementation guidance. This is a planning and analysis skill, not a code-editing skill.

Mirror the user's language in the output unless the user requests otherwise.

## Routing

- Use this skill when the user asks to group requirements by user behavior, find missing cases, clarify product questions, or split requirements before implementation.
- If the user asks to implement immediately after mapping, use this skill first, then hand the mapped units to `skills/business-feature-builder`.
- If the user asks only for React code changes from already-clear requirements, use `skills/business-feature-builder` directly.
- If the request spans mapping, implementation, commits, validation gates, and final review, use `skills/react-workflow-orchestrator` as the controller.

## Context Selection

Load only what is needed:

- For normal mapping output, read `references/output-template.md`.
- For complex or mixed requirements, read `references/behavior-grouping-rules.md`.
- For gap and risk discovery, read `references/requirement-risk-checklist.md`.

## Workflow

1. Normalize the requirement list without changing meaning. Preserve requirement IDs, labels, and wording that affect scope.
2. Group requirements by user behavior: actor, trigger, goal, state transition, and observable outcome.
3. Map each requirement to one or more behavior units. Mark duplicates, conflicts, hidden dependencies, and orphan requirements.
4. Identify missing or underspecified cases: state, exception, permission, validation, loading, empty, error, navigation, data consistency, and telemetry where relevant.
5. Propose implementation or commit slices by behavior, not by UI file alone.
6. Ask concise questions only for decisions that would materially change implementation. Otherwise state conservative assumptions.
7. End with a recommended next step: continue to `business-feature-builder`, ask product questions, or reduce scope.

## Output Rules

- Lead with the behavior map, not generic commentary.
- Keep each behavior unit small enough to become an implementation unit.
- Use requirement IDs when available so coverage is auditable.
- Separate confirmed requirements from inferred assumptions.
- Do not edit files or run implementation commands unless the user explicitly asks to continue into implementation.

## Handoff to Implementation

When handing off to `business-feature-builder`, include:

- ordered behavior units
- implementation slices and dependencies
- file responsibility hints
- validation expectations per slice
- unresolved questions and chosen assumptions
