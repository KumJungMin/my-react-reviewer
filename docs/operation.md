# Operation Notes

## MVP 운영 방식

- PR 전체 댓글 1개를 생성하거나 업데이트한다.
- 같은 PR에서 재실행되면 `<!-- react-ai-reviewer -->` 마커가 있는 기존 댓글을 업데이트한다.
- inline review comment는 구현하지 않았다. 초기 MVP에서는 line mapping 오류와 리뷰 노이즈를 줄이기 위해 전체 댓글이 더 안전하다.

## 보안 메모

GitHub Actions workflow는 `github.event.pull_request.base.sha`를 checkout한다. 즉, 리뷰 봇 코드는 PR 브랜치가 아니라 base branch의 신뢰된 코드에서 실행된다.

공개 저장소의 fork PR에서는 secret이 전달되지 않을 수 있다. 공개 저장소에서 `pull_request_target`을 쓰고 싶다면, PR 코드를 checkout하거나 실행하지 않도록 별도 보안 검토가 필요하다.

## 대형 PR 한계

GitHub REST API의 pull request files 응답에 포함된 `patch`는 매우 큰 diff에서 일부 제한될 수 있다. 이 프로젝트는 MVP로서 `MAX_DIFF_CHARS`만 제공한다. 대형 PR을 정교하게 리뷰하려면 파일 단위 chunking, AST 기반 context loader, inline line mapping을 추가하는 것이 좋다.

## 추천 고도화

1. PR size별 chunking
2. ESLint/TypeScript 실제 실행 결과 주입
3. changed file 주변 원본 코드 context 주입
4. inline comment line mapping
5. `/ai-review` 명령 기반 재실행
6. 팀별 reviewer preset
7. false positive feedback loop
