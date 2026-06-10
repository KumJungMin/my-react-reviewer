# React Skills Beginner Guide

이 문서는 `my-react-reviewer`의 React/TypeScript 스킬을 처음 쓰는 사람을 위한 안내서입니다. 각 스킬의 역할, 바로 복사해서 쓸 수 있는 요청 템플릿, 실제 동작 방식, 기대 효과를 한곳에서 볼 수 있게 정리했습니다.

## 먼저 알아야 할 원칙

모든 스킬은 `react-workflow-orchestrator/references/shared-work-principles.md`의 공통 원칙을 공유합니다.

- 비사소한 코드 변경은 먼저 설계와 구현 리스트를 보여주고 확인을 받은 뒤 진행합니다.
- 작업 단위와 커밋은 약 300 changed lines 내외의 reviewable batch로 나눕니다.
- 커밋 메시지는 타입을 필수로 포함하고, 요약과 본문은 한국어로 작성합니다.
- 검증은 각 work unit마다 가능한 가장 좁은 명령으로 실행합니다.

## 마스터 스킬이란

아래 대원칙은 모든 스킬이 공통으로 따르는 작업 원칙입니다. `react-workflow-orchestrator`는 이 공통 원칙을 여러 스킬이 함께 쓰는 작업에서 조율하는 마스터 스킬입니다. 직접 모든 코드를 구현하는 스킬이라기보다, 작업을 이해 가능한 단위로 나누고 각 단위에 맞는 하위 스킬을 배정합니다.

모든 스킬이 공유하는 대원칙:

- 작업 전 설계와 구현 리스트 만들기
- 커밋을 300 changed lines 내외의 reviewable batch로 나누기
- 커밋 메시지를 `<type>: <한글 요약>` 형식으로 쓰고 본문에 `목적`, `방향`, `검증` 남기기
- 각 단계별 검증 실행하기

마스터 스킬이 추가로 총괄하는 것:

- 어떤 스킬이 어떤 work unit을 맡을지 정하기
- 여러 work unit의 순서와 커밋 경계 조정하기
- 마지막 review 연결하기
- 하위 스킬 규칙이 충돌할 때 하나의 방향으로 합의하기

마스터 스킬이 직접 대신하지 않는 것:

- 요구사항 유저 동작 그룹핑과 사전 리스크 정리는 `requirement-behavior-mapper`가 맡습니다.
- Figma 해석 세부 판단은 `create-component-from-figma`가 맡습니다.
- 비즈니스 기능 구현 세부 판단은 `business-feature-builder`가 맡습니다.
- design-system API와 slot 구조 판단은 `gds-generator`가 맡습니다.
- 기존 코드 refactor 판단은 `react-upgrade-workflow`가 맡습니다.
- 코드 품질 리뷰 판단은 `react-ai-reviewer`가 맡습니다.

헷갈리면 먼저 `react-workflow-orchestrator`를 쓰면 됩니다. 작업이 충분히 작다면 마스터 스킬이 하위 스킬 하나만 쓰는 흐름으로 정리해줍니다.

## 어떤 스킬을 써야 하나

| 상황 | 먼저 쓸 스킬 | 이유 |
| --- | --- | --- |
| 여러 스킬, 여러 커밋, 최종 리뷰가 필요한 큰 작업 | `react-workflow-orchestrator` | 전체 순서와 합의를 제어합니다. |
| 요구사항 리스트를 구현 전 사용자 행동 단위로 정리 | `requirement-behavior-mapper` | 누락된 상태, 예외, 권한, validation, loading/error case를 드러냅니다. |
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
- 커밋 메시지는 `<type>: <한글 요약>` 형식으로 쓰고 본문에는 `목적`, `방향`, `검증`을 한국어로 포함해줘
- 마지막에 react-ai-reviewer로 리뷰해줘
```

작은 단일 작업은 하위 스킬을 직접 호출해도 됩니다. 그래도 비사소한 변경이면 설계 확인, 커밋 크기, 검증 조건을 요청에 포함하는 편이 좋습니다.

## 스킬별 상세 문서

- [React Workflow Orchestrator](react-workflow-orchestrator.md)
- [Requirement Behavior Mapper](requirement-behavior-mapper.md)
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
- 커밋 메시지는 `<type>: <한글 요약>` 형식으로 쓰고 본문에는 `목적`, `방향`, `검증`을 한국어로 포함해줘

검증:
- [typecheck / test / lint / build / 없음]
```
