# Architecture

React AI Reviewer는 PR diff를 여러 권위 기준으로 독립 리뷰한 뒤, 최종 리뷰어가 결과를 병합하는 구조다.

```text
PR diff / local diff
  -> repository context
  -> source-based reviewers
  -> final reviewer
  -> markdown result
  -> PR comment upsert / local output
```

## Module Responsibilities

- `src/review.ts`: CLI entrypoint. 실행 조건 확인, diff/context 수집, reviewer 순차 실행, 결과 파일 작성, PR 댓글 게시를 담당한다.
- `src/github.ts`: GitHub event 해석, PR 번호 추출, reviewable file patch 수집, PR 댓글 upsert를 담당한다.
- `src/context.ts`: 리뷰 대상 프로젝트의 정적 context를 allowlist 기반으로 수집한다.
- `src/config.ts`: 환경 변수와 CLI flag를 runtime config로 변환한다.
- `src/reviewers.ts`: reviewer id, title, source basis, prompt file 연결을 관리한다.
- `src/openaiReview.ts`: OpenAI Responses API 호출과 structured output parsing을 담당한다.
- `src/schemas.ts`: reviewer result와 final review result의 Zod schema를 정의한다.
- `src/markdown.ts`: 최종 Markdown marker와 no-diff fallback 문구를 관리한다.
- `prompts/*.md`: 각 권위 자료별 reviewer의 행동 기준이다.

## Execution Rules

- source-based reviewer는 서로의 결과를 보지 않는다.
- final reviewer만 중복 제거, severity 조정, source trace 병합을 수행한다.
- diff 또는 repository context에 근거 없는 finding은 제거한다.
- reviewable diff가 없으면 OpenAI를 호출하지 않는다.
- repository context는 allowlist와 `MAX_CONTEXT_CHARS`로 제한한다.

## Context Collection

`src/context.ts`는 다음 종류의 파일만 읽는다.

- package, TypeScript, ESLint, Vite, Next config
- app entrypoint 일부
- `AGENTS.md`, `ARCHITECTURE.md`
- `docs/index.md`, `docs/architecture.md`, `docs/reviewer-contract.md`, `docs/prompt-authoring.md`, `docs/security.md`, `docs/target-project-context.md`
- target project용 `docs/FRONTEND.md`, `docs/QUALITY.md`, `docs/SECURITY.md`
- target project용 `.react-ai-reviewer/context.md`, `.react-ai-reviewer/review-policy.md`

후보 파일을 늘릴 때는 토큰 비용과 stale 문서 위험을 같이 고려한다.
