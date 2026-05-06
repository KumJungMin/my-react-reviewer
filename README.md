# React AI Reviewer

권위 자료별 리뷰어를 독립적으로 실행하고, 최종 리뷰어가 편집하는 GitHub Actions 기반 React AI 코드 리뷰 봇입니다.

현재 파이프라인은 "모든 리뷰어를 무조건 실행"하는 구조가 아니라, diff와 changed files를 보고 관련 있는 리뷰어만 고르는 context-aware multi-reviewer pipeline입니다.

```text
PR diff / local diff
  ↓
changed file parsing
  ↓
rule-based reviewer selection
  ↓
selected reviewer prompt + compressed context load
  ↓
selected source-based reviewers
  ↓
normalized JSON results
  ↓
final reviewer editor
  ↓
GitHub-friendly Markdown review
```

## 왜 prompt와 context를 분리하나

- `prompts/*.md`는 리뷰어의 역할, 출력 방식, severity 판단, 무시할 것, 코멘트 말투를 정의합니다.
- `contexts/*/compressed.md`는 모델에 주입할 압축 지식을 담습니다.
- `contexts/*/rules.json`은 focus, ignore, severity hint 같은 실행 규칙을 담습니다.
- `contexts/*/source.md`는 사람이 보는 출처 요약입니다.

이 분리 덕분에 prompt는 짧고 안정적으로 유지하고, 자료 요약과 trigger 규칙은 점진적으로 확장할 수 있습니다.

## 리뷰어 선택 흐름

선택기는 `reviewers.config.json`에 정의된 규칙으로 동작합니다.

- disabled reviewer는 건너뜁니다.
- changed file path와 `filePatterns`를 비교합니다.
- diff 문자열과 `keywords`를 비교합니다.
- 매치된 리뷰어만 order 순으로 실행합니다.
- `final-reviewer`는 항상 포함됩니다.
- 특화 리뷰어가 하나도 안 맞으면 fallback으로 `react-official`, `clean-code-design`, `final-reviewer`를 실행합니다.

예시:

- `useEffect` 변경: `react-official`, `react-hooks-eslint`, `dan-abramov`, `final-reviewer`
- 테스트 파일 변경: `kent-testing`, `clean-code-design`, `final-reviewer`
- feature/shared 경계 변경: `bulletproof-react`, `toss`, `clean-code-design`, `final-reviewer`
- fetch/waterfall 변경: `react-official`, `vercel-performance`, `toss`, `final-reviewer`

## 포함된 리뷰어

| 순서 | 리뷰어 ID | 관점 | 주요 트리거 예시 |
|---:|---|---|---|
| 10 | `react-official` | React correctness, purity, Effect, state | `.tsx/.jsx`, `useEffect`, `useState`, derived state |
| 20 | `react-hooks-eslint` | Hook 규칙, deps, stale closure | Hook 호출, `exhaustive-deps`, `eslint-disable` |
| 30 | `dan-abramov` | resilient components, data flow | `useEffect`, cleanup, singleton assumption |
| 40 | `toss` | 수정하기 쉬운 코드, 응집도 | components/hooks/services, validation, mapping |
| 50 | `vercel-performance` | waterfall, fetch placement, rerender | `await`, `Promise.all`, `fetch`, `Suspense` |
| 60 | `kent-testing` | user-centered tests | `*.test.*`, `screen`, `userEvent`, `waitFor` |
| 70 | `bulletproof-react` | feature/layer boundary | `app/`, `features/`, `shared/`, `api/` |
| 80 | `clean-code-design` | SOLID, coupling, refactoring smells | hooks/services/utils, `switch`, `adapter`, `factory` |
| 90 | `final-reviewer` | dedupe, severity edit, Markdown output | 항상 실행 |

자세한 설정은 [reviewers.config.json](/Users/gjm/my-react-reviewer/reviewers.config.json)과 [`contexts/`](/Users/gjm/my-react-reviewer/contexts) 아래에 있습니다.

## 설치

```bash
npm ci --ignore-scripts
```

## 로컬 실행

먼저 diff 파일을 만듭니다.

```bash
git diff origin/main...HEAD > pr.diff
```

환경 변수를 설정합니다.

```bash
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-5.4"
export POST_COMMENT="false"
```

리뷰를 실행합니다.

```bash
npm run ai-review -- --diff ./pr.diff --no-post --out ./ai-review-result.md
```

특정 리뷰어만 강제로 실행할 수도 있습니다. 이 경우에도 `final-reviewer`는 자동으로 포함됩니다.

```bash
npm run ai-review -- --diff ./pr.diff --no-post --reviewers react-official,react-hooks-eslint,toss
```

## GitHub Actions 사용

1. 이 프로젝트 파일들을 리뷰 대상 저장소 루트에 복사합니다.
2. GitHub secret에 `OPENAI_API_KEY`를 추가합니다.
3. 필요하면 GitHub variable에 `OPENAI_MODEL`을 설정합니다.
4. PR을 열거나 `/ai-review` 댓글을 달면 workflow가 실행됩니다.

workflow는 PR branch 코드를 실행하지 않고 base branch의 신뢰된 리뷰어 코드를 checkout합니다. PR 내용은 GitHub API의 file patch만 읽습니다.

## 수동 재리뷰

PR conversation에 다음 댓글을 남기면 다시 리뷰합니다.

```text
/ai-review
```

`OWNER`, `MEMBER`, `COLLABORATOR` 권한 사용자만 수동 트리거할 수 있습니다.

## 리뷰어 결과 형식

각 source-based reviewer는 최종 Markdown 전에 다음 구조로 정규화된 JSON을 반환합니다.

```ts
type ReviewSeverity = "critical" | "high" | "medium" | "low";

type ReviewComment = {
  filePath?: string | null;
  line?: number | null;
  severity: ReviewSeverity;
  category:
    | "bug"
    | "react"
    | "hooks"
    | "architecture"
    | "performance"
    | "test"
    | "readability"
    | "maintainability";
  title: string;
  reason: string;
  suggestion: string;
  confidence: number;
  sourceReviewerId: string;
};

type ReviewerResult = {
  reviewerId: string;
  summary: string;
  comments: ReviewComment[];
};
```

`final-reviewer`는 이 결과들을 받아 중복 제거, severity 재조정, low-confidence 제거, 최종 Markdown 생성을 담당합니다.

## 새 리뷰어 추가

1. `prompts/NN-name.md`를 만듭니다.
2. `contexts/name/source.md`, `compressed.md`, `rules.json`을 만듭니다.
3. `reviewers.config.json`에 reviewer metadata와 trigger를 등록합니다.
4. 필요하면 `src/schemas.ts` category를 확장합니다.
5. `README.md`와 관련 docs를 업데이트합니다.
6. `npm run typecheck`, `git diff --check`를 실행합니다.

## 대상 프로젝트 context 파일

diff만으로 알 수 없는 팀 규칙은 repository context로 넣을 수 있습니다.

추천 파일:

```text
.react-ai-reviewer/context.md
.react-ai-reviewer/review-policy.md
```

예:

```md
# React AI Reviewer Context

## Framework
- Next.js App Router를 사용한다.
- Server Component를 기본으로 두고 interaction이 필요한 경우만 Client Component를 사용한다.

## Architecture
- `features/*`는 feature-private 코드를 가진다.
- `shared/*`는 feature에 의존하면 안 된다.

## Testing
- 사용자 행동 중심 테스트를 우선한다.
```

지원되는 context 파일은 [`src/context.ts`](/Users/gjm/my-react-reviewer/src/context.ts) allowlist에 정의되어 있습니다.

## 환경 변수

| 이름 | 필수 | 기본값 | 설명 |
|---|---:|---|---|
| `OPENAI_API_KEY` | 예 | 없음 | OpenAI API Key |
| `OPENAI_MODEL` | 아니오 | `gpt-5.4` | Responses API 호환 모델 |
| `GITHUB_TOKEN` | GitHub 모드에서 예 | 자동 제공 | PR 댓글 작성용 token |
| `GITHUB_REPOSITORY` | GitHub 모드에서 예 | 자동 제공 | `owner/repo` |
| `GITHUB_EVENT_PATH` | GitHub 모드에서 예 | 자동 제공 | GitHub event JSON 경로 |
| `POST_COMMENT` | 아니오 | `true` | PR 댓글 게시 여부 |
| `MAX_DIFF_CHARS` | 아니오 | `120000` | 모델에 전달할 diff 최대 문자 수 |
| `MAX_CONTEXT_CHARS` | 아니오 | `30000` | repository context 최대 문자 수 |
| `REVIEWERS` | 아니오 | 자동 선택 | 수동 실행할 reviewer id 목록 |

## 결과 파일

실행 후 다음 파일이 생성됩니다.

```text
.react-ai-reviewer/reviewer-selection.json
.react-ai-reviewer/raw-reviewer-results.json
.react-ai-reviewer/final-review.json
.react-ai-reviewer/result.md
```

## 한계

- 매우 큰 PR은 diff가 잘릴 수 있습니다.
- selector는 현재 file pattern + keyword 기반의 단순 규칙입니다.
- reviewer 실행은 현재 순차 모델입니다. 다만 source-based reviewer들은 구조적으로 독립적입니다.
- AI 리뷰는 사람 리뷰를 대체하지 않고, 놓치기 쉬운 이슈를 보조적으로 찾는 용도로 쓰는 것이 안전합니다.
