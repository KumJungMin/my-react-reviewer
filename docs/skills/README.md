# React Skills Beginner Guide

이 문서는 `my-react-reviewer`의 React/TypeScript 스킬을 처음 쓰는 사람을 위한 안내서입니다. 각 스킬의 역할, 바로 복사해서 쓸 수 있는 요청 템플릿, 실제 동작 방식, 기대 효과를 한곳에서 볼 수 있게 정리했습니다.

## 먼저 알아야 할 원칙

모든 스킬은 `react-workflow-orchestrator/references/shared-work-principles.md`의 공통 원칙을 공유합니다.

- 비사소한 코드 변경은 먼저 설계와 구현 리스트를 보여주고 확인을 받은 뒤 진행합니다.
- 작업 단위와 커밋은 약 300 changed lines 내외의 reviewable batch로 나눕니다.
- 커밋 메시지는 `Purpose`, `Direction`, `Validation`을 포함합니다.
- 검증은 각 work unit마다 가능한 가장 좁은 명령으로 실행합니다.

## 어떤 스킬을 써야 하나

| 상황 | 먼저 쓸 스킬 | 이유 |
| --- | --- | --- |
| 여러 스킬, 여러 커밋, 최종 리뷰가 필요한 큰 작업 | `react-workflow-orchestrator` | 전체 순서와 합의를 제어합니다. |
| 요구사항 기반 페이지/기능 구현 | `business-feature-builder` | 페이지 상태, validation, navigation, 테스트까지 묶어 구현합니다. |
| Figma/screenshot/mockup을 React 코드로 변환 | `create-component-from-figma` | 디자인을 repository 패턴에 맞는 초기 컴포넌트로 옮깁니다. |
| 디자인 시스템 컴포넌트 생성/강화 | `gds-generator` | public API, slots, accessibility, docs, exports까지 다룹니다. |
| 구현 후 코드 품질 리뷰 | `react-ai-reviewer` | React correctness, hooks, 테스트, 유지보수성을 리뷰합니다. |
| 기존 React 코드 고도화 | `react-upgrade-workflow` | 동작 보존 전제로 state/effect/책임 분리를 개선합니다. |

## 권장 사용 흐름

큰 작업은 항상 `react-workflow-orchestrator`에서 시작하는 것이 가장 안전합니다.

```text
$react-workflow-orchestrator로 이 작업을 진행해줘.

목표:
- [무엇을 만들거나 개선할지]

조건:
- 먼저 설계와 구현 리스트를 보여주고 확인받아줘
- 커밋은 300 changed lines 내외로 나눠줘
- 커밋 메시지에는 Purpose, Direction, Validation을 포함해줘
- 마지막에 react-ai-reviewer로 리뷰해줘
```

작은 단일 작업은 하위 스킬을 직접 호출해도 됩니다. 그래도 비사소한 변경이면 설계 확인, 커밋 크기, 검증 조건을 요청에 포함하는 편이 좋습니다.

## 스킬별 상세 문서

- [React Workflow Orchestrator](react-workflow-orchestrator.md)
- [Business Feature Builder](business-feature-builder.md)
- [Create Component From Figma](create-component-from-figma.md)
- [GDS Generator](gds-generator.md)
- [React AI Reviewer](react-ai-reviewer.md)
- [React Upgrade Workflow](react-upgrade-workflow.md)

## 초심자 체크리스트

작업을 요청하기 전에 아래만 채우면 대부분의 스킬이 안정적으로 동작합니다.

```text
목표:
- [원하는 결과]

대상:
- [파일, 폴더, Figma URL, screenshot, diff 중 하나]

범위:
- [이 파일만 / 관련 최소 범위 / feature folder 전체 / 현재 diff]

작업 방식:
- 먼저 설계와 구현 리스트를 보여주고 확인받아줘
- 커밋은 300 changed lines 내외로 나눠줘
- 커밋 메시지에는 Purpose, Direction, Validation을 포함해줘

검증:
- [typecheck / test / lint / build / 없음]
```
