# Operation Notes

## MVP 운영 방식

- PR 전체 댓글 1개를 생성하거나 업데이트한다.
- 같은 PR에서 재실행되면 `<!-- react-ai-reviewer -->` 마커가 있는 기존 댓글을 업데이트한다.
- inline review comment는 구현하지 않았다. 초기 MVP에서는 line mapping 오류와 리뷰 노이즈를 줄이기 위해 전체 댓글이 더 안전하다.
- PR 댓글에 `/ai-review`를 한 줄로 남기면 수동 재리뷰를 실행한다.
- 수동 재리뷰는 `OWNER`, `MEMBER`, `COLLABORATOR` 권한 사용자의 PR 댓글에서만 허용한다.
- GitHub Actions `workflow_dispatch`에서 `pr_number`를 입력해 운영자가 강제 실행할 수 있다.

## 보안 메모

GitHub Actions workflow는 `pull_request_target`과 `issue_comment`를 사용하되, `github.event.pull_request.base.sha` 또는 기본 브랜치의 코드를 checkout한다. 즉, 리뷰 봇 코드는 PR 브랜치가 아니라 base branch의 신뢰된 코드에서 실행된다.

공개 저장소의 fork PR에서도 secret이 노출되지 않도록 PR 코드를 checkout하거나 실행하지 않는다. 리뷰 입력은 GitHub API의 PR file patch와 정적 repository context로 제한한다.

토큰 낭비를 줄이기 위해 workflow와 Node entrypoint 양쪽에서 실행 조건을 확인한다. draft PR은 자동 리뷰하지 않고, 댓글 첫 줄이 허용된 명령이 아니거나 권한 없는 사용자의 댓글이면 OpenAI 설정과 diff 수집 전에 종료한다. 리뷰 대상 React/TypeScript/config diff가 없으면 결과 댓글만 업데이트하고 모델을 호출하지 않는다.

## Repository Context

리뷰 대상 프로젝트는 `.react-ai-reviewer/context.md` 또는 `.react-ai-reviewer/review-policy.md` 같은 짧은 지식 파일을 제공할 수 있다. 이 파일들은 diff만으로 알 수 없는 framework, state, architecture, testing 정책을 모델에 전달한다.

context 수집은 allowlist 기반이다. `docs/**/*.md` 전체를 읽지 않고, `src/context.ts`에 등록된 지도 파일만 읽는다. 전체 context 길이는 `MAX_CONTEXT_CHARS`로 제한하며 기본값은 `30000`이다.

## 대형 PR 한계

GitHub REST API의 pull request files 응답에 포함된 `patch`는 매우 큰 diff에서 일부 제한될 수 있다. 이 프로젝트는 MVP로서 `MAX_DIFF_CHARS`만 제공한다. 대형 PR을 정교하게 리뷰하려면 파일 단위 chunking, AST 기반 context loader, inline line mapping을 추가하는 것이 좋다.

## 추천 고도화

1. changed file 주변 원본 코드 context 주입
2. 파일 단위 chunking과 reviewer별 diff 분배
3. ESLint/TypeScript/test 실행 결과 주입
4. inline comment line mapping
5. reviewer별 결과 캐시
6. 팀별 reviewer preset
7. false positive feedback loop
