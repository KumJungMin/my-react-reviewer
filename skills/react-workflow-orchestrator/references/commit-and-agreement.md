# Commit and Agreement Rules

Use this reference when the orchestrator coordinates multiple skills, creates multiple commits, or needs to explain work units to the user before editing.

Also apply `shared-work-principles.md` for the global design confirmation gate, 300-line batch target, and commit message contract.

## Work Unit Design

A work unit should be something a reviewer can understand in isolation:

- one feature skeleton or contract
- one page or component section extraction
- one hook/core logic change
- one design-system API adjustment
- one focused test addition
- one final review fix batch

Avoid mixing unrelated concerns such as API naming, UI layout, validation policy, and test rewrite in the same work unit unless the diff is small and inseparable.

## 300-Line Commit Target

Use changed lines from `git diff --shortstat` or `git diff --numstat` as the practical signal.

- Normal target: about 300 changed lines.
- Healthy band: 150-400 changed lines.
- Smaller commits are fine for risk reduction, public API changes, review fixes, or isolated tests.
- Larger commits are acceptable only for mechanical moves, generated snapshots, lockfile churn, or one atomic refactor that would be less clear if split.

When a work unit grows too large, split in this order:

1. contracts, types, exports, and empty skeleton
2. pure core or utility behavior
3. hook/state/effect orchestration
4. UI composition and style wiring
5. tests
6. review fixes and cleanup

## Commit Message Template

Use an imperative subject that describes the change, then include purpose and direction in the body.

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

Before each commit:

1. Inspect `git status --short`.
2. Inspect staged files and confirm they match the work unit.
3. Check changed-line size with `git diff --shortstat --staged`.
4. Run the narrow validation command when feasible.
5. Commit with the message template.

After each commit, continue to the next implementation list item unless the command failed or the user asked to pause between commits.
