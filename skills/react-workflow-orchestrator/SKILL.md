---
name: react-workflow-orchestrator
description: "Use when a React/TypeScript task spans multiple existing skills or should be run as one controlled workflow with a user-visible implementation list, skill routing, requirement behavior mapping, commit-sized batches around 300 changed lines, commit messages that require a type and Korean summary/body, validation gates, and final review coordination. Coordinates requirement-behavior-mapper, business-feature-builder, create-component-from-figma, gds-generator, react-upgrade-workflow, and react-ai-reviewer without replacing their domain rules."
---

# React Workflow Orchestrator

Use this skill as the master controller for multi-step React work. It decides which specialized skill should own each step, keeps the user-facing work units clear, and prevents one large unreviewable change.

Do not use this skill for a narrow one-skill request that does not need batching, commits, or cross-skill agreement. Route directly to the specific skill instead.

## Controlled Skills

- `requirement-behavior-mapper`: pre-implementation requirement grouping, missing-case discovery, implementation/commit slicing guidance.
- `business-feature-builder`: business feature implementation, page logic, forms, validation, navigation, tests.
- `create-component-from-figma`: Figma, screenshot, mockup, or written UI to initial React component code.
- `gds-generator`: design-system component architecture, public API, Vanilla Extract styling, docs, tests, exports.
- `react-upgrade-workflow`: existing React code refactor, state/effect cleanup, responsibility split, testability.
- `react-ai-reviewer`: final review, review-only analysis, or review-driven corrective fixes.

## Required Flow

1. Classify the request and select the minimal set of controlled skills.
2. If the task starts from a requirement list, use `requirement-behavior-mapper` to group user behaviors, expose gaps, and propose implementation or commit slices before implementation planning.
3. Run deterministic preflight scripts before broad source reading when a relevant script exists.
4. Produce a design and implementation list before major edits, then wait for explicit user confirmation for non-trivial work.
5. Execute one work unit at a time under the batch and commit rules in `references/shared-work-principles.md`.
6. Validate each work unit with the narrowest useful checks.
7. Use `react-ai-reviewer` for final review when the task changes React behavior, hooks, page structure, design-system API, or tests.
8. Finish with the implementation list status, commits created, validation results, and any remaining risks.

## Shared Principles

Load `references/shared-work-principles.md` before non-trivial code-changing work. It is the shared contract for design confirmation, reviewable 300-line batches, commit messages that require a type and Korean summary/body, and per-unit validation across all React skills.

## Implementation List

Before editing, post a concise implementation list as an update. For non-trivial work, wait for explicit confirmation before editing unless the user explicitly says to skip confirmation.

Each item must include:

- work unit name
- purpose
- controlling skill
- likely files or folders
- expected commit boundary
- validation command or reason validation is unavailable

Use this shape:

```text
Implementation list
1. <work unit>: <purpose>
   Skill: <skill>
   Files: <likely paths>
   Commit: <expected commit purpose>
   Validate: <command>
```

Keep the list understandable to a non-agent reader. Avoid internal reasoning and avoid listing speculative files that are unlikely to change.

## Agreement Rules

The orchestrator owns the shared agreement across skills:

- User requirements and explicit constraints win over skill defaults.
- Repository conventions win over generic React preferences.
- Specialized skill rules win inside their domain.
- The orchestrator wins on sequencing, commit boundaries, validation gates, and final reporting.
- When two skills conflict, state the concrete conflict and choose the option that preserves behavior, keeps public API stable, and minimizes blast radius.

Load `references/commit-and-agreement.md` when the task involves commits, more than one work unit, multiple skills, or unclear sequencing.

## Commit Discipline

When committing is requested or implied, follow the canonical batch and commit message contract in `references/shared-work-principles.md`.

Use `references/commit-and-agreement.md` for work-unit examples, agreement checklist, and per-unit commit gate details.

## Reporting

Final response should be short and concrete:

- implementation list status
- commit hashes and subjects, if commits were created
- validation commands and results
- notable risks or follow-up work

Do not repeat every file diff. Mention only files that explain the outcome.
