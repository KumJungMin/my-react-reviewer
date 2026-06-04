# React Hooks / ESLint 압축 컨텍스트

- Hook 호출 순서는 렌더마다 안정적이어야 한다.
- dependency array는 실행 빈도 조절 장치가 아니라 Effect가 읽는 reactive value와의 동기화 계약이다.
- lint disable이나 빈 dependency array는 stale closure를 숨길 수 있다.
- dependency를 추가하면 루프가 생기는 경우, 대개 Effect 구조가 잘못 모델링된 것이다.
- Compiler 관점에서도 impure render, bad refs, broken memoization은 최적화보다 correctness 문제를 먼저 만든다.
