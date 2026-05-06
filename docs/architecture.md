# Architecture

React AI Reviewer는 diff를 여러 권위 기준으로 독립 리뷰하되, 실행 전 selector가 관련 있는 리뷰어만 고르는 구조다.

```text
PR diff / local diff
  -> changed file parsing
  -> reviewer selection
  -> prompt/context/rules load
  -> source-based reviewers
  -> normalized reviewer JSON
  -> final reviewer editor
  -> markdown result
  -> PR comment upsert / local output
```

## Module Responsibilities

- `src/review.ts`: CLI entrypoint. diff 로드, reviewer selection, source reviewer 실행, final reviewer 실행, 결과 파일 작성, PR 댓글 게시를 담당한다.
- `src/diff.ts`: local diff에서 changed file을 추출하고 reviewable file 판정을 담당한다.
- `src/github.ts`: GitHub event 해석, PR file patch 수집, reviewable changed file 목록 구성, PR 댓글 upsert를 담당한다.
- `src/context.ts`: 리뷰 대상 프로젝트의 정적 repository context를 allowlist 기반으로 수집한다.
- `src/reviewers.ts`: `reviewers.config.json` 로드, reviewer asset 로드, selector, fallback reviewer 정책을 담당한다.
- `src/openaiReview.ts`: OpenAI Responses API structured output 호출과 reviewer/final reviewer 입력 구성을 담당한다.
- `src/schemas.ts`: normalized reviewer result와 final review result schema를 정의한다.
- `reviewers.config.json`: reviewer 메타데이터, order, enabled, trigger, fallback 구성을 담는다.
- `prompts/*.md`: reviewer 역할, 출력 방식, severity 기준, ignore 규칙을 담는다.
- `contexts/*/compressed.md`: 모델에 주입할 압축 source knowledge를 담는다.
- `contexts/*/rules.json`: focus, ignore, severity hint를 담는다.
- `contexts/*/source.md`: 사람이 보는 source 요약을 담는다.

## Execution Rules

- source-based reviewer는 서로의 결과를 보지 않는다.
- reviewer selection은 file pattern과 diff keyword로만 동작한다.
- `final-reviewer`만 여러 reviewer result를 함께 본다.
- final reviewer는 dedupe, severity adjustment, low-confidence pruning, Markdown generation만 담당한다.
- diff 또는 repository context에 근거가 없는 comment는 source reviewer 단계와 final reviewer 단계 모두에서 제거 대상이다.
- reviewable diff가 없으면 OpenAI를 호출하지 않는다.

## Selection Rules

- disabled reviewer는 실행하지 않는다.
- file pattern 또는 keyword가 매치되면 reviewer를 선택한다.
- 자동 선택 결과가 비면 fallback으로 `react-official`, `clean-code-design`, `final-reviewer`를 실행한다.
- `--reviewers` 또는 `REVIEWERS`를 주면 지정 reviewer만 실행하되 `final-reviewer`는 자동으로 포함한다.

## Output Artifacts

- `.react-ai-reviewer/reviewer-selection.json`: changed files와 선택된 reviewer id를 기록한다.
- `.react-ai-reviewer/raw-reviewer-results.json`: source reviewer normalized JSON 결과를 저장한다.
- `.react-ai-reviewer/final-review.json`: final reviewer structured output을 저장한다.
- `.react-ai-reviewer/result.md`: 최종 GitHub-friendly Markdown을 저장한다.

## Context Collection

`src/context.ts`는 다음 종류의 파일만 읽는다.

- package, TypeScript, ESLint, Vite, Next config
- app entrypoint 일부
- `AGENTS.md`, `ARCHITECTURE.md`
- `docs/index.md`, `docs/architecture.md`, `docs/reviewer-contract.md`, `docs/prompt-authoring.md`, `docs/security.md`, `docs/target-project-context.md`
- target project용 `docs/FRONTEND.md`, `docs/QUALITY.md`, `docs/SECURITY.md`
- target project용 `.react-ai-reviewer/context.md`, `.react-ai-reviewer/review-policy.md`

후보 파일을 늘릴 때는 토큰 비용과 stale 문서 위험을 같이 고려한다.
