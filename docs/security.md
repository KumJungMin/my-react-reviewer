# Security

이 봇은 PR 코드를 실행하지 않고 diff와 정적 context만 읽는 것을 기본 보안 경계로 둔다.

## GitHub Actions

- workflow는 `pull_request_target`, `issue_comment`, `workflow_dispatch`를 지원한다.
- 리뷰어 코드는 PR branch가 아니라 base branch 또는 default branch의 trusted code를 checkout한다.
- `persist-credentials: false`를 사용한다.
- 초기 MVP는 inline comment가 아니라 PR conversation 댓글 하나만 upsert한다.

## Manual Trigger

PR 댓글 수동 실행은 다음 조건을 모두 만족해야 한다.

- comment가 PR에 달려 있다.
- comment가 허용 명령으로 시작한다.
- 작성자의 `author_association`이 `OWNER`, `MEMBER`, `COLLABORATOR` 중 하나다.

지원 명령:

```md
/ai-review
```

## Secret Handling

- `OPENAI_API_KEY`는 환경 변수에서만 읽는다.
- diff 원문, API key, GitHub token을 로그로 남기지 않는다.
- reviewable diff가 없으면 OpenAI client를 만들지 않는다.
- 권한 없는 댓글이나 명령 없는 댓글은 OpenAI 설정 전에 종료한다.

## PR Code Handling

- PR branch 코드를 checkout하지 않는다.
- PR 코드의 install/test/build를 실행하지 않는다.
- 리뷰 입력은 GitHub API의 PR file patch와 allowlist 기반 repository context로 제한한다.

추후 ESLint/TypeScript/test 결과를 주입하려면 fork PR과 untrusted code execution 정책을 별도 설계해야 한다.
