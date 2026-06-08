# Handler Naming 압축 컨텍스트

- 외부 API로 받는 callback prop은 `on*`을 쓴다. 예: `onSubmit`, `onClose`, `onAccountSelect`, `onVerificationComplete`.
- controlled state callback은 `on[State]Change`를 쓴다. 예: `open + onOpenChange`, `value + onValueChange`, `selectedItem + onSelectedItemChange`.
- 컴포넌트 내부에서 DOM 이벤트나 UI 상호작용을 처리하는 어댑터는 `handle*`을 쓴다. 예: `handleSubmit`, `handleInputChange`, `handleCloseClick`.
- 여러 버튼이 있으면 `handleClick`보다 `handleDeleteClick`, `handleRetryClick`, `handleCancelClick`처럼 대상과 이벤트를 함께 드러낸다.
- 실제 domain/usecase action은 `handle`을 붙이지 말고 동작 동사로 이름 짓는다. 예: `verifyAccount`, `requestVerificationCode`, `submitRemittance`.
- `onClose`는 닫힘 요청 callback이고, `onOpenChange`는 open 상태 변경 callback이다. 상태 제어 여부에 따라 다르게 판단한다.
- `onSelect`는 선택 이벤트이고, `onSelectedItemChange`는 선택 상태 변경 callback이다.
- design-system public API는 HeroUI/MUI식 의미 중심 이름을 우선한다: `isInvalid`, `onValueChange`, `startContent/endContent`, `topContent/bottomContent`, `variant`.
- design-system compound component는 `List.Item`, `Tabs.Panel`, `Select.Option` 같은 namespace-style API를 선호한다. `ListItem` 같은 별도 public name은 subcomponent가 독립적으로 의미 있을 때만 허용한다.
- legacy alias(`hasError`, `invalid`, `left/right`, `prefix/suffix`, `topAccessory/bottomAccessory`, `type`, `designType`, `buttonStyle`)는 migration shim으로만 두고 canonical prop이 항상 우선해야 한다.
- 이름 지적은 스타일 취향이 아니라 레이어 책임, public API 계약, 미래 입력 방식 변경 비용에 영향이 있을 때만 남긴다.
