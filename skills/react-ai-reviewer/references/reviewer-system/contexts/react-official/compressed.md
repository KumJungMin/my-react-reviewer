# React 공식 문서 압축 컨텍스트

- 렌더는 순수해야 한다. render 중 side effect, 외부 mutation, non-idempotent 값 사용은 correctness 위험이다.
- Hook은 React가 호출하는 컴포넌트나 custom Hook의 top level에서만 안전하다.
- Effect는 외부 시스템 동기화만 담당한다. derived state, event 처리, dependency 숨기기 용도면 구조 문제다.
- state는 최소 source of truth만 저장하고 나머지는 렌더에서 계산하는 쪽이 안전하다.
- snapshot/closure 때문에 이전 state에 의존하는 async callback과 연속 업데이트는 stale data 위험이 있다.
