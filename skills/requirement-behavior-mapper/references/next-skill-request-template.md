# Next Skill Request Template

Use this only when the user explicitly asks for a next-skill request template or asks to continue into implementation.

If `codex_handoff.status` is `ready_for_implementation`, provide a copy-ready prompt for the next skill.

If `codex_handoff.status` is `needs_answers`, mark the prompt as `답변 반영 후 사용` and keep the user answer template as the final section.

````text
$business-feature-builder로 아래 codex_handoff를 기반으로 [페이지/기능 이름]을 구현해줘.

입력:
- Figma URL: [URL 또는 없음]
- 사용할 컴포넌트: [Button, SelectBox, Checkbox 등]
- 대상 경로: [apps/service/src/presentation/page/...]

작업 방식:
- 먼저 codex_handoff를 요구사항, 동작 단위, 구현 slice, 커밋 경계로 해석해줘
- 구현 전 설계와 구현 리스트를 보여주고 확인 전에는 수정하지 마
- 페이지는 Page assembly + usePage hook + core/utils 기준으로 나눠줘
- codex_handoff.recommended_commit_boundaries를 우선 커밋 경계로 사용해줘
- 커밋 메시지는 `<type>: <한글 요약>` 형식으로 쓰고 본문에는 `목적`, `방향`, `검증`을 한국어로 포함해줘

검증:
- [관련 page test]
- [typecheck]

```yaml
<paste codex_handoff here>
```
````
