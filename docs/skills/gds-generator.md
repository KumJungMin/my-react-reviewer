# GDS Generator

## 역할

`gds-generator`는 design-system component를 생성, 리팩터링, 강화하는 스킬입니다. `packages/design-system` 아래의 public API, slots, accessibility, interaction state, Vanilla Extract style, docs/examples, tests, exports를 함께 다룹니다.

## 언제 쓰나

- Figma-generated UI를 design-system-quality component로 강화할 때
- `packages/design-system/src/components/**`를 수정할 때
- public prop naming, alias/deprecation, slot contract를 정리해야 할 때
- `useComponent`, `component-core.ts`, `component.css.ts`, docs/examples/tests가 필요한 때
- package export까지 같이 정리해야 할 때

## 요청 템플릿

```text
$gds-generator로 [컴포넌트 이름]을 개선해줘.

대상:
- packages/design-system/src/components/[component-name]

목표:
- public prop naming 정리
- accessibility 보완
- loading/disabled/invalid 상태 정리
- style-guide 예제 업데이트
- 테스트 추가

작업 방식:
- 먼저 public API, slot 구조, style/docs/test 변경 계획을 보여주고 확인받아줘
- 커밋은 API, 구현, docs/tests처럼 reviewable batch로 나눠줘
- 커밋 메시지에는 Purpose, Direction, Validation을 포함해줘

검증:
- design-system build
- 관련 component test
- style-guide build 또는 typecheck
```

## 실제 동작

1. 작업이 generation, refactor, review, docs, API design 중 무엇인지 분류합니다.
2. 필요한 reference만 읽습니다.
3. 근처 design-system component와 package export를 확인합니다.
4. public props와 slot 구조를 먼저 설계합니다.
5. 비사소한 작업이면 설계와 구현 리스트를 먼저 제시합니다.
6. rendering은 얇게 유지하고 behavior, core logic, style contract를 분리합니다.
7. docs/examples/tests/exports를 필요한 만큼 갱신합니다.
8. build, typecheck, test 등 관련 검증을 실행합니다.

## 기대 효과

| Before | After |
| --- | --- |
| 컴포넌트 API가 화면 구현에 끌려간다. | semantic public API와 slot contract가 먼저 정리된다. |
| 상태별 접근성과 class contract가 불명확하다. | disabled, invalid, loading, slot 상태가 일관되게 표현된다. |
| 구현만 바뀌고 docs/examples가 뒤처진다. | public behavior 변경 시 문서와 예제가 함께 갱신된다. |
| package export 누락이 뒤늦게 발견된다. | exports와 style-guide 연결까지 작업 범위에 포함된다. |

## 관련 파일

- `skills/gds-generator/SKILL.md`
- `skills/gds-generator/references/architecture.md`
- `skills/gds-generator/references/implementation-patterns.md`
- `skills/gds-generator/references/review-checklist.md`
- `skills/gds-generator/scripts/analyze-gds-component.mjs`
