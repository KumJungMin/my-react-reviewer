# Target Project Context

리뷰 품질을 높이려면 대상 프로젝트가 짧은 지식 파일을 제공하는 것이 좋다. 목적은 Codex에게 전체 문서를 먹이는 것이 아니라, diff만으로 알 수 없는 제약을 작게 전달하는 것이다.

## Recommended File

가장 추천하는 위치는 다음 파일이다.

```text
.react-ai-reviewer/context.md
```

이 파일은 리뷰 대상 프로젝트 루트에 둔다. 길이는 100~200줄 이하를 권장한다.

## Template

```md
# React AI Reviewer Context

## Product
- 이 앱이 해결하는 핵심 문제:
- 특히 중요한 사용자 흐름:

## Framework
- Next.js App Router / Vite / Remix 등:
- Server Component / Client Component 기본 정책:
- data fetching 위치:

## State
- 서버 상태:
- form draft state:
- 전역 UI state:
- URL state:

## Architecture
- 주요 폴더 경계:
- feature-private 코드 규칙:
- shared module 규칙:
- import alias 규칙:

## Testing
- test runner:
- 사용자 행동 중심 테스트 정책:
- 반드시 테스트가 필요한 변경:

## Performance
- 성능에 민감한 화면:
- bundle size 주의 영역:
- data fetching waterfall을 피해야 하는 영역:

## Accessibility
- 접근성 기준:
- 디자인 시스템 component 사용 규칙:

## Review Preferences
- 리뷰에서 강하게 봐야 할 것:
- 과하게 지적하지 말아야 할 것:
```

## Optional Policy File

팀별 리뷰 정책은 별도 파일로 분리할 수 있다.

```text
.react-ai-reviewer/review-policy.md
```

예:

```md
# Review Policy

- 작은 UI PR에는 아키텍처 재구성을 요구하지 않는다.
- 새 custom Hook은 테스트 또는 사용 예시가 있어야 한다.
- Zustand store는 feature boundary 밖에서 직접 mutate하지 않는다.
- Next.js route handler 변경은 auth/error handling을 함께 확인한다.
```

## Optional Prompt Feedback File

세션별 피드백을 다음 파일에 누적할 수 있다.

```text
.react-ai-reviewer/prompt-feedback.md
```

예:

```md
# Prompt Feedback

- Hooks 관련 지적은 지금보다 한 단계 더 엄격하게 본다.
- 테스트 제안은 실제 사용자 흐름과 직접 연결될 때만 남긴다.
- 설명은 짧게 유지하되 수정 방향은 더 구체적으로 적는다.
```

## Other Supported Map Files

`src/context.ts`는 다음 파일도 자동으로 읽는다.

- `AGENTS.md`
- `ARCHITECTURE.md`
- `docs/index.md`
- `docs/FRONTEND.md`
- `docs/QUALITY.md`
- `docs/SECURITY.md`

이 파일들은 target project에도 둘 수 있다. 단, 긴 매뉴얼보다 짧은 지도 형태가 좋다.

## Writing Rules

- 현재 사실만 적는다.
- "가능하면", "추후" 같은 희망사항은 review policy와 분리한다.
- 오래된 규칙은 삭제한다.
- 코드 예시는 최소화한다.
- 문서 하나에 모든 내용을 넣지 말고, `context.md`는 지도 역할로 유지한다.
