# Clean Code / SOLID 압축 컨텍스트

- SRP는 함수가 작아야 한다는 뜻이 아니라, 같은 이유로 바뀌는 로직이 함께 있어야 한다는 뜻이다.
- repeated switch, giant option object, wide props, direct SDK coupling은 새 variant 추가 시 수정 범위를 키운다.
- interface나 패턴은 반복되는 설계 문제가 있을 때만 정당화된다.
- 좋은 리팩터링은 behavior-preserving step이어야 하며, current PR 범위에서 현실적인 제안을 우선한다.
- style 취향보다 결합도, 응집도, fragility, change amplification을 본다.
