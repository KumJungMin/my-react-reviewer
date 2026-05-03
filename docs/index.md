# Documentation Map

이 디렉터리는 긴 단일 매뉴얼이 아니라, 필요한 정보만 골라 열 수 있는 기록 시스템이다. `AGENTS.md`는 항상 읽는 짧은 지도이고, 이 파일은 세부 문서의 목차다.

## 핵심 문서

- `architecture.md`: 실행 흐름, 주요 모듈 책임, 변경 지점.
- `reviewer-contract.md`: 리뷰어 JSON 계약, severity, source trace, finding 생성 규칙.
- `prompt-authoring.md`: 프롬프트 작성/강화 규칙과 권위 자료 우선순위.
- `security.md`: GitHub Actions, PR diff, secret, fork PR 보안 정책.
- `operation.md`: 운영 방식, 수동 재리뷰, 토큰 낭비 방지 조건.
- `source-basis.md`: 리뷰 판단에 사용하는 권위 자료와 링크.
- `target-project-context.md`: 리뷰 대상 프로젝트가 제공하면 좋은 compact context 작성법.
- `vscode-codex.md`: VSCode에서 Codex에게 로컬 리뷰 실행을 맡기는 방법.

## 컨텍스트 원칙

- AGENTS.md는 백과사전이 아니라 지도다.
- 길고 자주 바뀌는 정책은 별도 문서에 둔다.
- 모델 입력에 들어가는 repository context는 `src/context.ts`의 allowlist와 `MAX_CONTEXT_CHARS` 예산을 따른다.
- target project 문서는 짧게 유지하고, 전체 스펙 대신 리뷰 판단에 필요한 제약만 적는다.
