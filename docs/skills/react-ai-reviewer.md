# React AI Reviewer

## 역할

`react-ai-reviewer`는 React, TSX, JSX, hooks, component tests, 주변 frontend code를 구조적으로 리뷰하는 스킬입니다. 새 기능 구현의 primary workflow가 아니라 구현 후 final review 또는 review-driven fix에 사용합니다.

## 언제 쓰나

- 특정 파일, 폴더, diff를 리뷰하고 싶을 때
- hooks dependency, stale closure, effect synchronization을 점검할 때
- 유지보수성, 테스트 품질, 성능, 접근성, architecture 관점이 필요할 때
- 이전 리뷰 결과 중 선택한 항목만 반영할 때
- AI 토큰을 아끼기 위해 AST preflight로 후보 위치를 먼저 좁히고 싶을 때

## 요청 템플릿

### Review only

```text
$react-ai-reviewer로 [파일 또는 diff]를 리뷰해줘.

조건:
- 모드: review-only
- 우선순위: 버그, hooks, 유지보수성, 테스트
- 범위: [이 파일만 / 관련 최소 범위 / 현재 diff]
- 지금은 수정하지 마
- 검증: 없음
```

### Apply selected items

```text
$react-ai-reviewer로 방금 리뷰한 내용 중 [항목 번호]만 반영해줘.

조건:
- 모드: apply-selected-items
- 선택한 항목만 수정하고 다른 건 건드리지 마
- 비사소한 수정이면 먼저 수정 계획을 보여주고 확인받아줘
- 커밋은 300 changed lines 내외로 유지해줘
- 커밋 메시지에는 Purpose, Direction, Validation을 포함해줘
- 검증: [typecheck / test / lint]
```

## 실제 동작

1. review-only, apply-selected-items, direct-fix 중 모드를 정합니다.
2. diff 기반이면 AST preflight와 reviewer selection brief를 생성할 수 있습니다.
3. 선택된 reviewer lens를 기준으로 source를 읽습니다.
4. findings를 `Must fix`, `Should fix`, `Suggestions`, `Open questions`로 나눕니다.
5. review-only에서는 코드를 수정하지 않습니다.
6. 선택 항목 반영이나 direct-fix에서는 범위를 좁히고, 비사소하면 계획 확인 후 수정합니다.
7. 가능한 검증을 실행하고 결과를 보고합니다.

## 기대 효과

| Before | After |
| --- | --- |
| 리뷰가 일반적인 감상이나 스타일 취향에 머문다. | reviewer lens와 source basis가 명확한 findings가 나온다. |
| 전체 diff를 AI가 무작정 읽어 토큰이 많이 든다. | AST preflight로 후보 위치를 먼저 좁힌다. |
| 리뷰와 수정 범위가 섞인다. | review-only, selected fix, direct-fix 모드가 분리된다. |
| 중복되거나 과한 조언이 많다. | final reviewer lens로 우선순위와 중복을 정리한다. |

## 관련 파일

- `skills/react-ai-reviewer/SKILL.md`
- `skills/react-ai-reviewer/scripts/analyze-react-ast.mjs`
- `skills/react-ai-reviewer/scripts/prepare-codex-review.mjs`
- `skills/react-ai-reviewer/references/reviewer-system/reviewers.config.json`
- `skills/react-ai-reviewer/references/reviewer-system/prompts/`
- `skills/react-ai-reviewer/references/reviewer-system/contexts/`
