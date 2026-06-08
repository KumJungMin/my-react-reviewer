# React Upgrade Workflow

## 역할

`react-upgrade-workflow`는 기존 React/TypeScript 코드를 동작 보존 전제로 고도화하는 스킬입니다. 새 기능 구현보다 state/effect cleanup, 책임 분리, pure logic extraction, rendering boundary, 접근성, 타입 안정성, 테스트 가능성 개선에 초점을 둡니다.

## 언제 쓰나

- `useEffect` 오남용이나 stale state 위험을 정리할 때
- derived state를 줄이고 계산을 명확히 하고 싶을 때
- 컴포넌트가 API 호출, mapping, validation, rendering을 과하게 함께 들고 있을 때
- hook 내부의 pure business logic을 `.ts` 함수로 분리하고 싶을 때
- 무분별한 `useMemo`/`useCallback` 없이 렌더링 구조를 개선하고 싶을 때

## 요청 템플릿

```text
$react-upgrade-workflow로 [파일/폴더]를 고도화해줘.

목표:
- useEffect 오남용 제거
- derived state 정리
- 순수 로직 분리
- 테스트 가능성 개선

조건:
- 동작 변경 금지
- 관련 최소 파일만 수정
- useMemo/useCallback은 근거가 있을 때만 사용
- 먼저 refactor plan과 구현 리스트를 보여주고 확인받아줘
- 커밋은 300 changed lines 내외로 유지해줘
- 커밋 메시지에는 Purpose, Direction, Validation을 포함해줘

검증:
- [typecheck / test / lint]
```

## 실제 동작

1. 대상 코드와 직접 관련 파일을 읽습니다.
2. render responsibility, local state, derived state, effects, event handlers, async orchestration, mapping, validation을 분류합니다.
3. React Quality Lens 기준으로 문제를 진단합니다.
4. behavior bug, unsafe state/effect, hard-to-test logic, unclear responsibility 순으로 우선순위를 잡습니다.
5. 비사소한 작업이면 refactor plan과 구현 리스트를 제시하고 확인을 기다립니다.
6. 동작 보존을 전제로 pure function, hook, component boundary를 필요한 만큼만 분리합니다.
7. typecheck, unit test, lint, build 중 가능한 검증을 실행합니다.

## 기대 효과

| Before | After |
| --- | --- |
| effect가 데이터 동기화와 계산을 섞어서 예측하기 어렵다. | effect는 runtime 동기화만 맡고 계산은 pure logic으로 이동한다. |
| 컴포넌트가 상태, validation, mapping, rendering을 모두 처리한다. | hook, pure function, presentational component 책임이 나뉜다. |
| 리팩터링 중 동작 변경 위험이 크다. | plan 단계에서 preserved behavior와 changed behavior를 먼저 확인한다. |
| 성능 최적화가 근거 없이 들어간다. | `useMemo`/`useCallback`은 구체적 이유가 있을 때만 사용한다. |

## 관련 파일

- `skills/react-upgrade-workflow/SKILL.md`
- `skills/react-ai-reviewer/references/reviewer-system/prompts/react-quality-lens.md`
- `skills/react-ai-reviewer/references/reviewer-system/contexts/react-quality-rules.md`
- `skills/react-ai-reviewer/scripts/analyze-react-ast.mjs`
