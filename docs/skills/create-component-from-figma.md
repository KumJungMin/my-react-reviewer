# Create Component From Figma

## 역할

`create-component-from-figma`는 Figma, screenshot, mockup, 텍스트 UI 설명을 React + TypeScript + Vanilla Extract 코드로 옮기는 초기 구현 스킬입니다. 픽셀 복제보다 repository에 맞는 제품 코드, 접근성, 재사용 가능성을 우선합니다.

## 언제 쓰나

- Figma 디자인을 실제 React 컴포넌트로 구현할 때
- screenshot이나 mockup을 기준으로 UI를 만들 때
- 기존 design token, primitive, Vanilla Extract 패턴을 재사용해야 할 때
- 아직 design-system 수준의 public API hardening까지는 필요 없을 때

## 요청 템플릿

```text
$create-component-from-figma로 [컴포넌트 이름]을 만들어줘.

디자인:
- Figma URL 또는 screenshot: [URL/첨부]

조건:
- 대상 경로: [src/components/... 또는 src/features/...]
- 필요한 상태: default, hover, loading, disabled, error
- 상호작용: [클릭, 입력, 선택 등]
- 범위: 관련 최소 파일만
- 먼저 컴포넌트 경계, 재사용할 primitive, 스타일 파일 계획을 보여주고 확인받아줘
- 커밋은 300 changed lines 내외로 유지해줘
- 커밋 메시지에는 Purpose, Direction, Validation을 포함해줘

검증:
- [typecheck / storybook build / 관련 테스트]
```

## 실제 동작

1. 기존 UI primitive, token, utility, feature folder 패턴을 찾습니다.
2. Figma나 screenshot에서 layout, component boundary, 상태, 접근성 요구를 추론합니다.
3. 비사소한 작업이면 설계와 구현 리스트를 먼저 제시합니다.
4. 가장 단순한 구조를 고릅니다.
5. React + TypeScript + Vanilla Extract로 구현합니다.
6. mockup에 없는 의미 있는 상태도 필요한 경우 함께 처리합니다.
7. typecheck나 관련 검증을 실행합니다.

## 기대 효과

| Before | After |
| --- | --- |
| Figma 코드가 repository 패턴과 맞지 않는다. | 기존 primitive와 token을 재사용한 코드가 된다. |
| UI가 screenshot만 맞고 접근성이 빠진다. | semantic HTML과 상태별 접근성을 함께 고려한다. |
| 새 primitive가 불필요하게 늘어난다. | 먼저 inventory를 보고 기존 구성요소를 재사용한다. |
| design-system hardening과 초기 구현이 섞인다. | 초기 구현은 이 스킬, hardening은 `gds-generator`로 분리된다. |

## 관련 파일

- `skills/create-component-from-figma/SKILL.md`
- `skills/create-component-from-figma/references/implementation-contract.md`
- `skills/create-component-from-figma/scripts/collect-ui-inventory.mjs`
