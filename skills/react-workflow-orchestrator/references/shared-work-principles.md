# Shared Work Principles

Use this reference from every React skill before non-trivial code-changing work.

These rules are the shared contract across:

- `react-workflow-orchestrator`
- `business-feature-builder`
- `create-component-from-figma`
- `gds-generator`
- `react-upgrade-workflow`
- `react-ai-reviewer`

## Design Confirmation Gate

For non-trivial implementation, refactor, review-fix, or test work, do not edit first. Present a concise design and implementation list, then wait for explicit user confirmation.

Non-trivial means any of these are true:

- multiple files are likely to change
- behavior, public API, routing, form flow, validation, page structure, or design-system contract may change
- commits are requested
- tests or snapshots will be added or rewritten
- more than one skill is involved
- the expected diff may approach a reviewable batch size

Trivial one-file fixes, typo-only edits, formatting-only edits, and direct answer requests may proceed without waiting, but the final response should say that the confirmation gate was not needed because the change was trivial.

The design confirmation should include:

- interpreted goal and assumptions
- implementation work units
- controlling skill for each unit
- likely files or folders
- behavior preserved and behavior changed
- validation command per unit
- expected commit boundary when commits are requested

## Reviewable Batch Size

Use roughly 300 changed lines as the default work-unit size for implementation and commits.

- Healthy band: 150-400 changed lines.
- Smaller batches are preferred for public API, behavior, migration, or review-fix changes.
- Larger batches are acceptable only for mechanical moves, generated files, lockfile churn, or an atomic change that would be less understandable if split.
- If a batch exceeds the healthy band, state why before committing or in the commit body.

Split large work in this order:

1. contracts, types, exports, and skeleton
2. pure core or utility behavior
3. hook, state, effect, and orchestration
4. UI composition and style wiring
5. tests
6. review fixes and cleanup

## Commit Message Contract

When creating commits, use an imperative subject and include purpose, direction, and validation.

```text
<imperative subject>

Purpose:
- <why this commit exists>

Direction:
- <how this moves the implementation forward>

Validation:
- <commands run, or not run with reason>
```

Before each commit:

1. Inspect `git status --short`.
2. Stage only files for the current work unit.
3. Check `git diff --shortstat --staged`.
4. Run the narrowest useful validation.
5. Commit with the message contract.

## Conflict Rule

When user instructions, repository conventions, and skill rules conflict, do not silently choose. State the conflict in one sentence, choose the option that preserves behavior and minimizes blast radius, then ask for confirmation if the choice affects architecture, public API, or commit boundaries.
