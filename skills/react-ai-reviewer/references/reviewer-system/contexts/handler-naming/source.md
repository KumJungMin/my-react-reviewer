# Handler / Callback Naming Source Context

## 기준

React 문서와 주요 React 라이브러리 관례를 기준으로 함수 이름의 레이어를 구분한다.

1. 외부에서 받는 이벤트 props: `onSubmit`, `onClose`, `onOpenChange`, `onRowSelectionChange`, `onSelectedItemChange`
2. 컴포넌트 내부에서 이벤트를 처리하는 함수: `handleSubmit`, `handleCloseClick`, `handleInputChange`, `handleConfirmPress`
3. 실제 비즈니스/usecase 동작: `submitOrder`, `closeDialog`, `requestVerificationCode`, `verifyAccount`, `selectAccount`

## Props Callback

컴포넌트 props는 외부에 노출되는 이벤트 계약이다. `handleSubmit` 같은 이름을 prop으로 노출하기보다 `onSubmit`, `onCancel`, `onAccountSelect`, `onVerificationComplete`처럼 `on*`을 쓴다.

DOM 이벤트를 그대로 노출하는 낮은 수준 컴포넌트라면 `onClick`, `onChange`가 자연스럽다. 앱 의미가 있는 컴포넌트라면 `onPlayMovie`, `onUploadImage`, `onAccountSelect`처럼 의미 중심 이름을 선호한다. 이렇게 하면 click에서 keyboard shortcut, native callback, auto submit으로 상호작용 방식이 바뀌어도 외부 API를 덜 흔든다.

## Controlled State Callback

외부에서 상태를 제어하는 패턴은 `state + onStateChange` 형태를 쓴다.

- `open + onOpenChange`
- `value + onValueChange`
- `checked + onCheckedChange`
- `rowSelection + onRowSelectionChange`
- `selectedItem + onSelectedItemChange`

`onClose`는 "닫힘 요청"이고 `onOpenChange`는 "open 상태 변경"이다. 닫기만 알리면 `onClose`, 열림과 닫힘을 모두 외부 상태로 제어하면 `onOpenChange`가 맞다.

`onSelect`는 선택 이벤트이고 `onSelectedItemChange`는 선택 상태 변경이다. 선택값을 controlled로 관리한다면 후자를 선호한다.

## Design-System Public API

design-system component API는 call site에서 의미와 목적이 보여야 한다. 새 public API는 HeroUI/MUI식 의미 중심 이름을 우선한다.

- Boolean state props는 `isInvalid`, `isDisabled`, `isLoading`, `isRounded`, `hasNotification`, `hasHomeIndicator`처럼 읽히는 이름을 쓴다. `hasError`와 `invalid`는 migration alias로만 둔다.
- 값 변경은 `onValueChange(value, event?)`를 쓴다. DOM event 자체가 필요한 consumer를 위해 native `onChange(event)`는 별도 escape hatch로 유지할 수 있다.
- open/visibility 제어는 `open`, `defaultOpen`, `onOpenChange(open)`를 쓴다. `onClose`는 닫힘 요청만 알리는 convenience callback일 때 유지한다.
- Horizontal slot은 `startContent/endContent`, vertical slot은 `topContent/bottomContent`를 쓴다. `left/right`, `prefix/suffix`, `topAccessory/bottomAccessory`는 legacy alias로만 둔다.
- Styling choice는 `variant`를 우선한다. `color`, `tone`, `size`처럼 다른 개념을 설명하는 이름은 허용하지만, 새 styling API에 `type`, `designType`, `buttonStyle`을 쓰지 않는다.
- Compound component는 call site에서 `List.Item`, `Tabs.Panel`, `Select.Option` 같은 `{Main}.{Compound}` 형식을 선호한다. `ListItem` 같은 별도 public export는 subcomponent가 main component 밖에서도 독립적으로 의미 있을 때만 허용한다.
- Compound subcomponent 구현 파일은 `compounds/ListItem.tsx`처럼 둘 수 있지만, docs, examples, public usage는 `List.Item` 형식을 우선한다.
- Compatibility alias가 필요한 migration에서는 canonical prop이 alias보다 우선해야 한다. 새 docs, examples, tests, public usage는 canonical 이름만 사용한다.

## Internal Event Adapter

컴포넌트 내부에서 이벤트 객체를 받거나 UI side effect를 처리하는 함수는 `handle*`을 쓴다.

- `handleSubmit`
- `handleInputChange`
- `handleCloseClick`
- `handleDeleteClick`
- `handleConfirmPress`

이 함수는 보통 `event.preventDefault()`, input value 읽기, local state 갱신, focus/scroll/toast 같은 UI side effect, props callback 호출을 담당한다.

버튼이 여러 개면 `handleClick`은 모호하다. `handleDeleteClick`, `handleRetryClick`, `handleCancelClick`처럼 대상과 이벤트를 함께 적는다.

## Domain / Usecase Action

이벤트에 종속되지 않는 실제 동작은 `handle`을 붙이지 않는다.

- `verifyAccount`
- `requestVerificationCode`
- `submitRemittance`
- `navigateToCompletion`
- `selectAccount`

이 함수는 클릭으로 호출될 수도 있고, Enter 키, 자동 재시도, native bridge callback으로 호출될 수도 있다. UI 이벤트 어댑터와 domain action을 분리하면 상호작용 방식이 바뀔 때 이벤트 어댑터만 교체하면 된다.

## Practical Review Rule

최종 기준은 다음 한 문장이다.

외부 API는 `on*`, 내부 이벤트 어댑터는 `handle*`, 실제 동작은 비즈니스 동사로 이름 짓는다.

단, 네이밍만을 위한 리뷰 코멘트는 피한다. 이름이 public API 계약을 흐리거나, DOM 이벤트에 과하게 묶거나, 이벤트 어댑터와 domain action의 책임을 섞을 때만 finding으로 남긴다.
