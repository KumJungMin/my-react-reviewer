# Reviewer Contract

이 문서는 source-based reviewer와 final reviewer가 지켜야 하는 출력 계약을 정리한다.

## Source-Based Reviewer

각 source-based reviewer는 같은 PR diff와 repository context를 독립적으로 받는다.

반드시 지킬 규칙:

- 다른 reviewer 결과를 가정하지 않는다.
- 자신의 source basis에 맞는 문제만 찾는다.
- diff 또는 repository context에 근거 없는 comment를 만들지 않는다.
- comment가 없으면 `comments`를 빈 배열로 둔다.
- `reviewerId`와 각 comment의 `sourceReviewerId`는 현재 reviewer id와 같아야 한다.
- `confidence`는 0부터 1 사이 숫자로 작성한다.
- 모든 설명은 한국어로 작성한다.

## Normalized Source Output

```ts
type ReviewSeverity = "critical" | "high" | "medium" | "low";

type ReviewComment = {
  filePath: string | null;
  line: number | null;
  severity: ReviewSeverity;
  category:
    | "bug"
    | "react"
    | "hooks"
    | "architecture"
    | "performance"
    | "test"
    | "readability"
    | "maintainability";
  title: string;
  reason: string;
  suggestion: string;
  confidence: number;
  sourceReviewerId: string;
};

type ReviewerResult = {
  reviewerId: string;
  summary: string;
  comments: ReviewComment[];
};
```

## Final Reviewer

final reviewer만 여러 reviewer result를 함께 본다.

역할:

- 같은 root cause의 comment를 병합한다.
- diff 근거가 약한 comment를 제거한다.
- 과장된 severity를 낮춘다.
- low-confidence comment를 제거하거나 suggestion으로 낮춘다.
- source trace를 유지한다.
- 최종 한국어 Markdown을 생성한다.

## Final Output

```ts
type FinalReviewComment = Omit<ReviewComment, "sourceReviewerId"> & {
  sourceReviewerIds: string[];
};

type FinalReview = {
  summary: string;
  mustFix: FinalReviewComment[];
  shouldFix: FinalReviewComment[];
  suggestions: FinalReviewComment[];
  finalMarkdown: string;
};
```

## Severity

- `critical`: merge를 막아야 하는 correctness 문제. 예: Hook 규칙 위반, 명백한 runtime breakage.
- `high`: 사용자-visible bug, stale data, 중요한 테스트 공백, 구조적 성능 병목이 명확한 경우.
- `medium`: 즉시 장애는 아니지만 회귀 위험이나 변경 비용이 분명한 경우.
- `low`: 개선 가치는 있으나 영향이 좁거나 근거가 제한적인 경우.

## Noise Control

- architecture, clean code, 성능 제안은 실제 영향이나 변경 비용이 설명될 때만 남긴다.
- `useMemo`, `useCallback`, 디자인 패턴, 폴더 재구성은 기본적으로 낮은 우선순위다.
- 작은 PR에 Bulletproof React 구조를 강요하지 않는다.
- 낮은 확신도의 comment는 final reviewer가 제거하거나 low로 내린다.
- critical/high 이슈가 없으면 final reviewer가 억지로 만들지 않는다.
