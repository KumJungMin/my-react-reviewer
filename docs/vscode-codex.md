# VSCode + Codex Local Run

이 문서는 VSCode에서 Codex에게 React AI Reviewer를 로컬 실행시키고 싶을 때 읽히는 짧은 절차다.

## Preconditions

- dependencies가 설치되어 있어야 한다.
- `OPENAI_API_KEY`는 환경 변수로 준비한다.
- secret을 채팅, 문서, diff, 로그에 직접 붙여넣지 않는다.
- 로컬 실행은 PR 댓글을 올리지 않도록 항상 `--no-post`를 사용한다.

```bash
npm ci --ignore-scripts
export OPENAI_API_KEY="sk-..."
export OPENAI_MODEL="gpt-5.4"
```

VSCode가 이미 열려 있다면 integrated terminal에서 환경 변수를 설정해도 된다. 다만 VSCode process 환경에 key가 없으면 debug configuration은 key를 보지 못할 수 있다.

## Ask Codex

Codex에게 다음처럼 요청한다.

```text
AGENTS.md와 docs/vscode-codex.md를 읽고 React AI Reviewer를 로컬에서 실행해줘.

조건:
- OPENAI_API_KEY는 이미 환경 변수로 준비되어 있다고 가정해.
- secret 값은 출력하지 마.
- origin/main...HEAD 기준으로 pr.diff를 만들고 리뷰해줘.
- PR 댓글은 올리지 말고 --no-post로 실행해.
- 결과는 ai-review-result.md와 .react-ai-reviewer/ 아래 파일로 남겨줘.
- 실행 전 npm run typecheck를 돌리고, 실패하면 리뷰 실행 전에 멈춰서 원인을 알려줘.
```

working tree 변경만 보고 싶으면 다음 문장으로 바꾼다.

```text
origin/main...HEAD 대신 현재 working tree 기준으로 pr.diff를 만들어줘.
```

특정 reviewer만 실행하려면 다음 문장을 추가한다.

```text
reviewers는 react-official,react-hooks-eslint,toss만 실행해줘.
```

## Commands Codex Should Run

origin/main 기준:

```bash
npm run typecheck
git diff origin/main...HEAD > pr.diff
npm run ai-review -- --diff ./pr.diff --no-post --out ./ai-review-result.md
```

working tree 기준:

```bash
npm run typecheck
git diff > pr.diff
npm run ai-review -- --diff ./pr.diff --no-post --out ./ai-review-result.md
```

특정 reviewer만 실행:

```bash
npm run ai-review -- --diff ./pr.diff --no-post --out ./ai-review-result.md --reviewers react-official,react-hooks-eslint,toss
```


## Outputs

- `ai-review-result.md`
- `.react-ai-reviewer/result.md`
- `.react-ai-reviewer/raw-reviewer-results.json`
- `.react-ai-reviewer/final-review.json`

## Safety Notes

- 이 문서의 로컬 실행은 대상 코드를 별도로 실행하지 않고 diff 파일을 리뷰한다.
- `--no-post`가 빠지면 GitHub 환경 변수 구성에 따라 댓글 게시를 시도할 수 있으므로 로컬에서는 항상 포함한다.
- diff나 결과 파일에 민감 정보가 들어갈 수 있으면 커밋 전에 확인한다.
