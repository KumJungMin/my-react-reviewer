# React AI Reviewer

권위 있는 React 자료를 기준으로 PR diff를 리뷰하는 GitHub Actions 기반 AI 코드 리뷰 봇입니다.

이 템플릿은 다음 구조로 동작합니다.

```text
PR diff / local diff
  ↓
React 공식 문서 리뷰어
  ↓
React Hooks / ESLint 리뷰어
  ↓
Dan Abramov Resilient Components 리뷰어
  ↓
Toss 유지보수성 리뷰어
  ↓
Vercel 성능 리뷰어
  ↓
Kent C. Dodds 테스트 리뷰어
  ↓
Bulletproof React 아키텍처 리뷰어
  ↓
Clean Code / SOLID 디자인 리뷰어
  ↓
Final Reviewer: 중복 제거 + 심각도 조정 + 최종 Markdown 생성
```

## 포함된 기능

- GitHub PR diff 자동 수집
- 자료별 전문 리뷰어 순차 실행
- OpenAI Responses API + Structured Outputs 기반 JSON 결과 생성
- 최종 통합 리뷰 Markdown 생성
- PR 댓글 생성 또는 기존 리뷰 댓글 업데이트
- 로컬 diff 리뷰 모드
- PR 댓글 명령 기반 수동 재리뷰
- 대상 프로젝트 지식 파일 기반 repository context 주입
- 결과 artifact 저장

## 자료별 리뷰어

| 순서 | 리뷰어 ID | 기준 |
|---:|---|---|
| 1 | `react-official` | React 공식 문서: purity, hooks, state, Effect |
| 2 | `react-hooks-eslint` | eslint-plugin-react-hooks, exhaustive-deps, stale closure |
| 3 | `dan-abramov` | 데이터 흐름, resilient components, singleton 가정 금지 |
| 4 | `toss` | 수정하기 쉬운 코드, 응집도, 단일 책임, 추상화 |
| 5 | `vercel-performance` | async waterfall, bundle size, data fetching, re-render |
| 6 | `kent-testing` | 사용자 행동 중심 테스트, 구현 세부사항 테스트 금지 |
| 7 | `bulletproof-react` | feature boundary, API/domain/UI layer, architecture |
| 8 | `clean-code-design` | 디자인 패턴, 응집도/결합도, SOLID, code smell |

자세한 기준은 `prompts/`와 `docs/source-basis.md`에 있습니다.

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

특정 리뷰어만 실행할 수도 있습니다.

```bash
npm run ai-review -- --diff ./pr.diff --no-post --reviewers react-official,react-hooks-eslint,toss
```

## VSCode에서 실행

VSCode 안의 Codex에게 실행을 맡기려면 다음처럼 요청합니다.

```text
AGENTS.md와 docs/vscode-codex.md를 읽고 React AI Reviewer를 로컬에서 실행해줘.
OPENAI_API_KEY는 이미 환경 변수로 준비되어 있다고 가정하고, secret 값은 출력하지 마.
origin/main...HEAD 기준으로 pr.diff를 만든 뒤 --no-post로 리뷰를 실행해줘.
실행 전 npm run typecheck를 먼저 돌리고, 결과는 ai-review-result.md에 남겨줘.
```

자세한 Codex용 절차와 변형 명령은 `docs/vscode-codex.md`에 있습니다.

## GitHub Actions 설정

1. 이 프로젝트 파일들을 리뷰 대상 저장소 루트에 복사합니다.
2. GitHub repository secret에 `OPENAI_API_KEY`를 추가합니다.
3. GitHub repository variable에 `OPENAI_MODEL`을 추가합니다.
   - 예: `gpt-5.4`
   - 조직에서 접근 가능한 Responses API 호환 모델을 사용하세요.
4. PR을 열면 `.github/workflows/react-ai-review.yml`이 실행됩니다.

## 수동 재리뷰

PR conversation에 다음 댓글을 작성하면 같은 PR diff를 다시 리뷰합니다.

```md
/ai-review
```

수동 재리뷰는 `OWNER`, `MEMBER`, `COLLABORATOR` 권한 사용자의 PR 댓글에서만 실행됩니다. 코드에 트리거용 주석을 남기지 않아도 되므로, 변경 코드가 없거나 리뷰를 한 번 더 받고 싶을 때 사용할 수 있습니다.

GitHub Actions 화면에서 `workflow_dispatch`로 `pr_number`를 입력해 강제 실행할 수도 있습니다.

## 대상 프로젝트 지식 파일

리뷰 대상 프로젝트에 짧은 지식 파일을 두면 diff만으로 알 수 없는 제약을 리뷰에 반영할 수 있습니다.

가장 추천하는 파일은 다음입니다.

```text
.react-ai-reviewer/context.md
```

예:

```md
# React AI Reviewer Context

## Framework
- Next.js App Router를 사용한다.
- Server Component를 기본으로 두고 interaction이 필요한 경우만 Client Component를 사용한다.

## State
- 서버 상태는 TanStack Query를 사용한다.
- form draft state는 local state로 둔다.
- 전역 UI state는 Zustand를 사용한다.

## Architecture
- `features/*`는 feature-private 코드를 가진다.
- `shared/*`는 feature에 의존하면 안 된다.

## Testing
- 사용자 행동 중심 테스트를 우선한다.
- 내부 hook state 직접 검증은 피한다.
```

지원되는 context 파일과 작성법은 `docs/target-project-context.md`에 정리되어 있습니다. repository context 전체 길이는 `MAX_CONTEXT_CHARS`로 제한됩니다.

## GitHub Actions 보안 설계

workflow는 `pull_request_target`과 `issue_comment`에서 실행되지만, PR branch가 아니라 base branch의 신뢰된 리뷰어 코드를 checkout합니다.

```yaml
ref: ${{ github.event.pull_request.base.sha }}
```

따라서 PR 작성자가 리뷰 봇 코드를 바꾸더라도, 해당 PR 실행에서는 바뀐 봇 코드가 실행되지 않습니다.

리뷰 대상 diff는 GitHub API의 PR file patch에서만 읽으며 PR 코드를 실행하지 않습니다.

초기 MVP에서는 inline comment 대신 PR 전체 댓글을 사용합니다. GitHub diff line mapping 오류와 중복 코멘트를 줄이기 위한 선택입니다.

## 환경 변수

| 이름 | 필수 | 기본값 | 설명 |
|---|---:|---|---|
| `OPENAI_API_KEY` | 예 | 없음 | OpenAI API Key |
| `OPENAI_MODEL` | 아니오 | `gpt-5.4` | Responses API 호환 모델 |
| `GITHUB_TOKEN` | GitHub 모드에서 예 | 자동 제공 | PR 댓글 작성용 GitHub token |
| `GITHUB_REPOSITORY` | GitHub 모드에서 예 | 자동 제공 | `owner/repo` |
| `GITHUB_EVENT_PATH` | GitHub 모드에서 예 | 자동 제공 | PR event JSON 경로 |
| `POST_COMMENT` | 아니오 | `true` | PR 댓글 게시 여부 |
| `MAX_DIFF_CHARS` | 아니오 | `120000` | 모델에 전달할 diff 최대 문자 수 |
| `MAX_CONTEXT_CHARS` | 아니오 | `30000` | 모델에 전달할 repository context 최대 문자 수 |
| `REVIEWERS` | 아니오 | 전체 | 실행할 리뷰어 ID comma-separated list |

## 결과 파일

실행 후 다음 파일이 생성됩니다.

```text
.react-ai-reviewer/result.md
.react-ai-reviewer/raw-reviewer-results.json
.react-ai-reviewer/final-review.json
```

GitHub Actions에서는 위 파일들이 artifact로 업로드됩니다.

## 한계

- 매우 큰 PR은 diff가 잘릴 수 있습니다.
- 실제 ESLint/TypeScript 실행 결과는 아직 자동 주입하지 않습니다.
- inline review comment는 아직 구현하지 않았습니다.
- AI 리뷰는 사람이 하는 최종 리뷰를 대체하지 않고, 놓치기 쉬운 이슈를 보조적으로 찾는 용도로 사용하는 것이 안전합니다.

## 권장 고도화

1. changed file 주변 원본 코드 context 주입
2. 파일 단위 chunking과 reviewer별 diff 분배
3. ESLint/TypeScript/test 실행 결과 주입
4. inline comment line mapping
5. reviewer별 결과 캐시
6. 팀별 prompt preset
