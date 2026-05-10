# Bulletproof React 압축 컨텍스트

- shared 영역에는 앱 전역으로 쓰이는 코드만 있어야 하고 feature-specific 로직은 feature 안에 남아야 한다.
- feature 간 직접 의존보다 app/page/route 레이어에서 composition하는 쪽이 경계가 선명하다.
- API 호출, domain logic, UI component, state management 책임이 한 파일에 뭉치면 변경 비용이 커진다.
- Bulletproof React의 폴더명을 강요하지 말고, 현재 레포의 규칙 안에서 경계 침범만 본다.
- 작은 PR에는 과한 레이어 추가보다 경계 오염을 막는 최소 정리가 더 적절하다.
