# Business Feature Builder

## 역할

`business-feature-builder`는 요구사항 기반 React/TypeScript 비즈니스 기능을 구현하는 스킬입니다. 페이지 로직, form flow, validation, navigation, async orchestration, 테스트를 함께 다룹니다.

요구사항 리스트를 작은 구현 단위로 쪼갠 뒤 실제 코드 변경까지 이어갈 때도 이 스킬을 씁니다. 구현 전 기획/누락 분석만 필요하면 `requirement-behavior-mapper`를 먼저 씁니다.

## 언제 쓰나

- 앱/페이지 기능을 새로 구현해야 할 때
- 요구사항 리스트를 작은 구현 단위로 나눠 skeleton-first로 구현해야 할 때
- 요구사항, 사용할 컴포넌트, Figma 링크가 함께 있을 때
- UI와 비즈니스 로직을 분리해야 할 때
- `{PageName}Page.tsx`, `use{PageName}Page`, `.core.ts`, `.utils.ts`, tests 구조가 필요한 때
- 페이지가 커져서 semantic section component로 분리해야 할 때

## 요청 템플릿

```text
$business-feature-builder로 [페이지/기능 이름]을 구현해줘.

요구사항:
- [사용자 행동 1]
- [validation 규칙]
- [성공/실패/로딩 상태]
- [navigation 또는 side effect]

입력:
- Figma URL: [URL]
- 사용할 컴포넌트: [Button, SelectBox, Checkbox 등]
- 대상 경로: [apps/service/src/presentation/page/...]

작업 방식:
- 먼저 설계와 구현 리스트를 보여주고 확인 전에는 수정하지 마
- 페이지는 Page assembly + usePage hook + core/utils 기준으로 나눠줘
- 커밋은 300 changed lines 내외의 work unit으로 나눠줘
- 커밋 메시지는 `<type>: <한글 요약>` 형식으로 쓰고 본문에는 `목적`, `방향`, `검증`을 한국어로 포함해줘

검증:
- [관련 page test]
- [typecheck]
```

## 실제 동작

1. 요구사항에서 입력, 출력, 상태, side effect, edge case를 뽑습니다.
2. 요구사항 리스트 구현이면 요약, 유저 동작 단위, 구현 단위, 파일 책임, 단위별 검증, 추천 커밋 경계를 먼저 만듭니다.
3. 비사소한 작업이면 설계와 구현 리스트를 먼저 제시합니다.
4. skeleton-first로 component, hook, handler, core function signature를 잡습니다.
5. React runtime concern은 hook으로, 순수 정책/validation/mapping은 `.core.ts`나 `.utils.ts`로 분리합니다.
6. 페이지 JSX는 semantic section으로 나눌 수 있는지 확인합니다.
7. normal, validation, error, loading, disabled, edge case 테스트를 추가하거나 갱신합니다.
8. 관련 검증을 실행하고 결과를 보고합니다.

## 기대 효과

| Before | After |
| --- | --- |
| 페이지 하나가 JSX, 상태, API, validation을 모두 들고 있다. | Page는 조립, hook은 orchestration, core/utils는 순수 로직을 맡는다. |
| `render*` helper가 늘어나 페이지 흐름이 안 보인다. | semantic section component로 분리되어 리뷰 단위가 선명하다. |
| 요구사항 누락이 구현 후에 발견된다. | skeleton과 구현 리스트 단계에서 edge case를 먼저 드러낸다. |
| 테스트가 happy path만 커버한다. | validation, failure, loading, disabled 상태가 함께 검증된다. |

## 관련 파일

- `skills/business-feature-builder/SKILL.md`
- `skills/business-feature-builder/references/workflow.md`
- `skills/business-feature-builder/references/separation-rules.md`
- `skills/business-feature-builder/references/testing-rules.md`
- `skills/business-feature-builder/scripts/analyze-feature-context.mjs`
