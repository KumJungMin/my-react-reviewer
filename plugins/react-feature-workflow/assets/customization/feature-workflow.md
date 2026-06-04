# 기능 워크플로우 정책

이 파일은 `$react-feature-builder`의 동작을 팀 규칙에 맞게 조정할 때 사용합니다.

## 필수 입력

- 기능 목표:
- 인수 조건:
- 대상 route 또는 기능 영역:
- 허용 작업 범위:
- 검증 명령:

## 선택 입력

- Figma URL 또는 node-id:
- 스크린샷 또는 mockup:
- analytics 요구사항:
- 접근성 요구사항:
- rollout 또는 feature flag 요구사항:

## 단계 순서

기본 순서:

1. 요구사항 분석
2. 디자인/Figma 분석
3. 아키텍처 설계
4. 구현
5. 컨벤션 검사
6. 코드 리뷰
7. 테스트 생성
8. 검증

팀에서 다른 순서를 사용한다면 이 섹션에 정의합니다.

## 산출물 규칙

큰 기능 작업에서는 아래 파일을 생성합니다.

- `.requirements/feature-brief.md`
- `.requirements/architecture-plan.md`
- `.requirements/test-plan.md`

## 생략 규칙

- 디자인 분석을 생략하는 조건:
- 테스트 생성을 생략하는 조건:
- 검증을 생략하는 조건:

## 검증 명령

- test:
- typecheck:
- lint:
- build:
