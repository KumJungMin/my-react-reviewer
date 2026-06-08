# Commit and Agreement Rules

Use this reference when the orchestrator coordinates multiple skills, creates multiple commits, or needs to explain work units to the user before editing.

The canonical design confirmation gate, 300-line batch target, and commit message contract live in `shared-work-principles.md`. This file adds work-unit examples and agreement checks only.

## Work Unit Design

A work unit should be something a reviewer can understand in isolation:

- one feature skeleton or contract
- one page or component section extraction
- one hook/core logic change
- one design-system API adjustment
- one focused test addition
- one final review fix batch

Avoid mixing unrelated concerns such as API naming, UI layout, validation policy, and test rewrite in the same work unit unless the diff is small and inseparable.

## Commit Message Examples

Use the canonical commit message contract from `shared-work-principles.md`. These examples show good purpose and direction wording for common React work units.

```text
Add service intro page sections

Purpose:
- Make the page structure reviewable by separating semantic sections.

Direction:
- Keep ServiceIntroPage as the assembly layer and move section JSX behind prop-based components.

Validation:
- pnpm test --filter service
```

For refactors:

```text
Extract verification code validation core

Purpose:
- Move business validation out of the React hook so it can be tested without rendering.

Direction:
- Keep the hook responsible for orchestration and delegate policy checks to pure functions.

Validation:
- pnpm test VerificationCodeInputPage
```

For review fixes:

```text
Address page layering review findings

Purpose:
- Resolve reviewer findings that affect maintainability without changing behavior.

Direction:
- Remove local render helper clustering and keep event wiring at the page boundary.

Validation:
- pnpm test ServiceIntroPage
```

## Agreement Checklist

Before editing, the implementation list should make these points visible:

- Which skill controls each work unit.
- Which files are expected to change.
- Which behavior is intentionally preserved.
- Which behavior is intentionally changed.
- Which checks will prove the work.
- Which items are deferred or explicitly out of scope.

If the user request, repository pattern, and skill rule disagree, do not silently choose. State the conflict and the chosen resolution in one sentence before editing.

## Per-Unit Gate

Before each commit, apply the canonical gate from `shared-work-principles.md` and also confirm:

1. Staged files match the current work unit.
2. The diff is understandable as one reviewer-visible change.
3. The validation result is recorded in the commit body.

After each commit, continue to the next implementation list item unless the command failed or the user asked to pause between commits.
