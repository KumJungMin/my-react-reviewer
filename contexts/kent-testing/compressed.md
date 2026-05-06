# Kent Testing 압축 컨텍스트

- 테스트는 사용자가 보는 결과와 상호작용을 검증해야 한다.
- 내부 state, CSS selector, test id 남용, 구조에 민감한 assertion은 brittle하다.
- 접근성 기반 query가 가능하면 role/label/text 중심으로 쓰는 편이 더 안정적이다.
- async UI는 `findBy*`나 `waitFor`로 실제 상태 변화를 기다려야 한다.
- mocking과 setup이 많을수록 구현 세부사항 결합 가능성이 크다.
