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

- For product, domain, project, team, or feature-specific context, read `references/context.md` when it contains relevant notes. Treat unfilled placeholder sections as absent.
- For normal mapping output, read `references/output-template.md`.
- For a copy-ready prompt to pass the handoff to the next implementation skill, read `references/next-skill-request-template.md` only when the user explicitly asks for a next-skill request template or asks to continue into implementation.
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

- Lead with a user-friendly scenario summary and behavior map, not generic commentary.
- Write `Requirement Summary`, `User Behavior Units`, and `Requirement Coverage` for a product/user reader. Avoid implementation jargon there unless the original requirement uses it.
- Write `Implementation Slices` in Korean with user-friendly labels such as `구현 단위`, `관련 동작`, `구현할 내용`, and `나누는 이유`.
- Keep implementation-oriented details such as dependencies, validation, and recommended commit boundaries inside `Codex Skill Handoff`.
- Keep each behavior unit small enough to become an implementation unit.
- Use requirement IDs when available so coverage is auditable.
- Separate confirmed requirements from inferred assumptions.
- Include a `Codex Skill Handoff` block in a stable fenced `yaml` shape so `business-feature-builder` or `react-workflow-orchestrator` can continue without reinterpreting tables.
- Include a `Next Skill Request Template` only when the user explicitly requests it or asks to continue into implementation. Use `references/next-skill-request-template.md` then.
- In the handoff block, keep IDs stable across requirements, behavior units, implementation slices, questions, and recommended commit boundaries.
- Mark whether the mapped requirements are `ready_for_implementation`, `needs_answers`, or `reduce_scope`.
- Before the handoff YAML, state: "이 정보를 구현 시 `<next_skill>`에게 전달하면 요구사항 구현이 용이합니다."
- Combine implementation questions and the copy-ready answer template into one section named `구현 전 확인 및 답변`.
- If there are no required user decisions, write `구현 전 필수로 답변할 질문 없음` in that section and include `구현 요청 템플릿을 만들어줘.`
- Do not edit files or run implementation commands unless the user explicitly asks to continue into implementation.

## Handoff to Implementation

When handing off to `business-feature-builder`, include:

- ordered behavior units
- implementation slices and dependencies
- file responsibility hints
- validation expectations per slice
- unresolved questions and chosen assumptions
- a `Codex Skill Handoff` block that can be pasted directly into the next skill request
- if requested, a `Next Skill Request Template` that already includes the right next-skill invocation, expected inputs, work style, validation expectations, and the `codex_handoff`
