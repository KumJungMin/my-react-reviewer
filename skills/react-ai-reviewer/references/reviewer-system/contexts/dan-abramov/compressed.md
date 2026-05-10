# Dan Abramov 압축 컨텍스트

- data flow를 막지 말아야 한다. prop 변화가 memo, callback, local state, Effect에 자연스럽게 반영되어야 한다.
- 컴포넌트는 언제든 다시 렌더링될 준비가 되어 있어야 한다. timing assumption은 취약하다.
- 어떤 컴포넌트도 singleton이 아니다. module scope mutable state와 global reset은 다중 인스턴스에서 위험하다.
- Effect는 특정 render의 closure를 본다. dependency 조작으로 "한 번만" 동작시키려는 설계는 stale synchronization을 만든다.
- prop-to-state 복사나 derived state는 source of truth를 둘로 쪼개기 쉽다.
