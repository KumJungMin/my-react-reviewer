# React 기능 워크플로우 커스터마이징

이 폴더의 템플릿은 대상 프로젝트의 아래 경로에 복사해서 사용합니다.

```text
.codex/react-feature-workflow/
```

스킬은 이 프로젝트별 파일을 기본 규칙보다 먼저 읽습니다.

권장 파일:

```text
.codex/react-feature-workflow/
  feature-workflow.md
  input-checklist.md
  team-conventions.md
  figma-design-policy.md
  react-review-policy.md
  test-policy.md
```

우선순위:

1. 현재 요청의 명시 지시
2. `.codex/react-feature-workflow/` 아래 프로젝트 override 파일
3. 저장소 문서와 tooling config
4. 주변 구현 패턴
5. 스킬 기본값

플러그인 자체를 수정하지 않고 팀별 프론트엔드 프로세스에 맞추고 싶을 때 이 파일들을 사용합니다.
