# React Workflow Orchestrator

## 역할

`react-workflow-orchestrator`는 여러 React 스킬을 하나의 합의된 workflow로 묶는 마스터 스킬입니다. 직접 모든 구현 판단을 대신하지 않고, 어떤 하위 스킬이 어떤 work unit을 맡을지 정하고, 설계 확인, 커밋 단위, 검증, 최종 리뷰를 제어합니다.

## 언제 쓰나

- 하나의 요청에 Figma 해석, 기능 구현, 리팩터링, 테스트, 리뷰가 섞여 있을 때
- 사용자가 AI의 작업 단위와 커밋 단위를 먼저 이해해야 할 때
- 큰 변경을 300 changed lines 내외의 reviewable batch로 나누고 싶을 때
- 하위 스킬끼리 판단 기준이 충돌할 수 있을 때
- 마지막에 `react-ai-reviewer`로 검수까지 붙이고 싶을 때

## 요청 템플릿

```text
$react-workflow-orchestrator로 [작업 이름]을 진행해줘.

목표:
- [비즈니스/기술 목표]

대상:
- [Figma URL / screenshot / 파일 / 폴더 / 현재 diff]

조건:
- 먼저 설계와 구현 리스트를 보여주고 확인받아줘
- 각 work unit의 담당 스킬을 명시해줘
- 커밋은 300 changed lines 내외로 나눠줘
- 커밋 메시지에는 Purpose, Direction, Validation을 포함해줘
- 마지막에 react-ai-reviewer로 리뷰해줘

검증:
- [typecheck / test / lint / build]
```

## 실제 동작

1. 요청을 읽고 필요한 하위 스킬을 고릅니다.
2. 가능한 경우 AST/preflight 스크립트로 먼저 후보 정보를 수집합니다.
3. 구현 리스트를 만듭니다.
4. 사용자가 확인하면 work unit별로 구현합니다.
5. 각 work unit마다 좁은 검증을 실행합니다.
6. 커밋이 필요한 경우 목적 단위로 나누고 상세 커밋 메시지를 작성합니다.
7. 변경이 React 동작, hooks, page 구조, design-system API, 테스트에 영향을 주면 `react-ai-reviewer`로 final review를 붙입니다.

## 기대 효과

| Before | After |
| --- | --- |
| 큰 요청이 한 번에 구현되어 리뷰하기 어렵다. | 작업이 work unit과 커밋 단위로 쪼개져 리뷰하기 쉽다. |
| 어떤 스킬이 어떤 판단을 했는지 알기 어렵다. | 구현 리스트에서 담당 스킬과 파일 범위가 보인다. |
| 커밋 메시지가 단순 변경 요약에 그친다. | `Purpose`, `Direction`, `Validation`으로 의도가 남는다. |
| 리뷰가 마지막에 빠지기 쉽다. | final review가 workflow에 포함된다. |

## 관련 파일

- `skills/react-workflow-orchestrator/SKILL.md`
- `skills/react-workflow-orchestrator/references/shared-work-principles.md`
- `skills/react-workflow-orchestrator/references/commit-and-agreement.md`
