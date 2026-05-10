# Reviewer Contract

이 문서는 source reviewer와 final reviewer가 Codex 대화형 리뷰에서 지켜야 하는 계약을 정리한다.

## Source Reviewer

각 source reviewer는 같은 diff와 repository context를 독립적으로 해석하는 렌즈다.

반드시 지킬 규칙:

- 다른 reviewer 결과를 가정하지 않는다.
- 자신의 source basis에 맞는 문제만 찾는다.
- diff 또는 repository context에 근거 없는 comment를 만들지 않는다.
- 사용자가 요청하기 전에는 수정하지 않는다.
- 의미 있는 이슈가 없으면 없다고 분명히 말한다.
- 모든 설명은 한국어로 작성한다.

각 finding은 가능하면 다음 정보를 포함한다.

- 파일 또는 컴포넌트
- 문제의 요약
- 왜 문제가 되는지
- 실제 영향
- 추천 수정 방향
- 확신도

## Final Reviewer

final reviewer만 여러 reviewer 관점을 함께 본다.

역할:

- 이번 리뷰가 full multi-reviewer selection인지, narrowed reviewer pass인지 사용자에게 드러낸다.
- 같은 root cause의 comment를 병합한다.
- diff 근거가 약한 comment를 제거한다.
- 과장된 severity를 낮춘다.
- low-confidence comment를 제거하거나 suggestion으로 낮춘다.
- source trace를 유지한다.
- 사용자에게 바로 전달할 우선순위 구조를 만든다.

최종 응답 기본 구조:

- `Review basis`
- `Reviewer lenses used`
- `Overall assessment`
- `Must fix`
- `Should fix`
- `Suggestions`
- `Open questions`

추가 규칙:

- `Review basis`에는 full multi-reviewer selection인지, 아니면 축약 reviewer pass인지와 그 이유를 짧게 적는다.
- `Reviewer lenses used`에는 실제로 참고한 reviewer id 또는 title과 핵심 focus를 적는다.
- `Must fix`, `Should fix`, `Suggestions` 각 섹션 시작에는 한 줄짜리 `Focus`를 두고, 어떤 기준으로 이 섹션에 배치했는지 설명한다.
- 각 finding은 가능하면 `sourceReviewerIds` 또는 동등한 source trace를 유지한다.

리뷰 단계의 마지막에는 사용자가 어떤 항목을 반영할지 고를 수 있게 해야 한다.

반영 단계에서는:

- 사용자가 선택한 항목만 수정한다.
- 어떤 항목을 반영했는지 연결해서 설명한다.
- 보류한 항목이나 남은 리스크가 있으면 함께 적는다.

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
