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

When creating commits, the commit type is required and the summary/body must be written in Korean.

Use this subject format:

```text
<type>: <한글 요약>
```

Allowed types:

- `feat`: 기능 추가 또는 사용자에게 보이는 기능 변경
- `fix`: 버그 수정
- `refactor`: 동작을 보존하는 구조 개선
- `docs`: 문서 변경
- `test`: 테스트 변경
- `chore`: 저장소 관리 작업
- `style`: 포맷팅 또는 스타일 전용 변경
- `perf`: 성능 개선
- `build`: 빌드, 의존성, 패키지 변경
- `ci`: CI 설정 변경

Commit bodies must use Korean section labels and Korean explanations. Commands, file paths, package names, and code identifiers may remain as literals.

```text
<type>: <한글 요약>

목적:
- <이 커밋이 필요한 이유>

방향:
- <변경을 어떤 방향으로 진행했는지>

검증:
- <실행한 명령, 또는 실행하지 못한 이유>
```

Before each commit:

1. Inspect `git status --short`.
2. Stage only files for the current work unit.
3. Check `git diff --shortstat --staged`.
4. Run the narrowest useful validation.
5. Commit with the message contract.

## Conflict Rule

When user instructions, repository conventions, and skill rules conflict, do not silently choose. State the conflict in one sentence, choose the option that preserves behavior and minimizes blast radius, then ask for confirmation if the choice affects architecture, public API, or commit boundaries.
