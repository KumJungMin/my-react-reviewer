# Page / Design-System Layering 압축 컨텍스트

- service page는 entry/View, VM hook, page-local hooks, pure utils, public/shared types, visual styles, index export boundary를 분리한다.
- `{PageName}Page.tsx`는 props 수신, `use{PageName}` 호출, View 렌더링에 집중한다. 세부 상태 관리와 business rule은 두지 않는다.
- `use{PageName}.ts`는 하위 hook 조합, page props 연결, external callback wiring, view props 생성을 담당한다. JSX와 순수 정책 직접 구현은 피한다.
- `hooks/`는 입력 필드, 약관 동의, 인증번호 검증, 타이머처럼 독립 stateful 화면 흐름을 둔다.
- `{PageName}.utils.ts`는 React API를 쓰지 않는 page 한정 순수 함수만 둔다. 범용 유틸, 외부 API 의존 함수, hook은 두지 않는다.
- usecase 별도 패키지는 현재 추가하지 않는다. 실제 기능 API 연결과 데이터 정책이 생기기 전에는 page-local utils 또는 component core를 사용한다.
- design-system component는 primitive UI와 domain-specific field를 분리한다. `AddressField`, `IdDocumentField` 같은 domain field는 product intent를 명확히 하면 public API로 유지할 수 있지만, shared primitive에 domain 정책을 섞지 않는다.
- provider/hook은 React context/lifecycle/event wiring만 맡고, 순수 큐/상태 전이/파생값 계산은 `.core.ts`로 뺀다.
- `.types.ts`는 public/shared type boundary, `.css.ts`는 시각 표현, `index.ts`와 root export는 외부 public API boundary로 유지한다.
