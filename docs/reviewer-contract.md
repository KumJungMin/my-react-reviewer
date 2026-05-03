# Reviewer Contract

이 문서는 모든 reviewer prompt와 final reviewer가 지켜야 하는 출력 계약을 정리한다.

## Source-Based Reviewer

각 source-based reviewer는 같은 PR diff와 repository context를 독립적으로 받는다.

반드시 지킬 규칙:

- 다른 reviewer 결과를 가정하지 않는다.
- 자신의 source basis에 맞는 문제만 찾는다.
- diff 또는 repository context에 근거 없는 finding을 만들지 않는다.
- finding이 없으면 억지로 만들지 않고 `noIssueNotes`에 확인 범위를 적는다.
- 모든 finding에는 구체적인 `sourceBasis`를 남긴다.
- 일반론 대신 어떤 변경/런타임/유지보수 상황에서 문제가 되는지 설명한다.

## Final Reviewer

final reviewer만 여러 reviewer result를 함께 본다.

역할:

- 같은 원인의 finding을 병합한다.
- severity를 실제 사용자 영향과 merge risk 기준으로 재조정한다.
- diff 근거가 약한 finding을 제거하거나 참고 수준으로 낮춘다.
- source trace를 유지한다.
- 최종 한국어 Markdown을 생성한다.

## Severity

- `blocker`: Hook 규칙 위반, build/runtime failure, 심각한 security/data loss처럼 merge를 막아야 하는 문제.
- `high`: 사용자-visible bug, stale data, 잘못된 state/effect, 큰 성능 지연, 중요한 테스트 공백.
- `medium`: 즉시 장애 가능성은 낮지만 변경 비용이나 회귀 위험이 분명한 문제.
- `low`: 개선 가치가 있으나 영향이 좁고 우선순위가 낮은 문제.
- `info`: 참고할 만하지만 현재 PR에서 요구하기 어려운 제안.

## Noise Control

- React 공식 correctness가 아닌 아키텍처/클린코드/성능 제안은 구체적인 변경 비용이나 사용자 영향이 있을 때만 medium 이상으로 둔다.
- `useMemo`, `useCallback`, 디자인 패턴, 폴더 재구성은 기본적으로 낮은 우선순위다.
- 작은 PR에 Bulletproof React 구조를 강요하지 않는다.
- Clean Code 리뷰어는 패턴 이름보다 실제 결합도, 응집도, 변경 비용을 우선 설명한다.
