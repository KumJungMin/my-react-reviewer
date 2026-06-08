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

커밋 메시지의 기준은 `shared-work-principles.md`를 따릅니다. 아래는 자주 쓰는 React work unit에 맞춘 타입 필수 한국어 커밋 메시지 예시입니다.

```text
feat: 서비스 소개 페이지 섹션을 분리한다

목적:
- 의미 단위 섹션을 분리해 페이지 구조를 리뷰하기 쉽게 만든다.

방향:
- ServiceIntroPage는 조립 계층으로 유지하고 섹션 JSX는 props 기반 컴포넌트로 옮긴다.

검증:
- pnpm test --filter service
```

리팩터링 예시:

```text
refactor: 인증 코드 검증 로직을 core로 분리한다

목적:
- 비즈니스 검증을 React hook 밖으로 옮겨 렌더링 없이 테스트할 수 있게 한다.

방향:
- hook은 orchestration만 맡기고 정책 판단은 순수 함수로 위임한다.

검증:
- pnpm test VerificationCodeInputPage
```

리뷰 수정 예시:

```text
fix: 페이지 레이어링 리뷰 지적을 반영한다

목적:
- 동작을 바꾸지 않고 유지보수성에 영향을 주는 리뷰 지적을 해결한다.

방향:
- 로컬 render helper 군집을 줄이고 이벤트 연결은 페이지 경계에 유지한다.

검증:
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
