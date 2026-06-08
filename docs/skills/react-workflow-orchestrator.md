# React Workflow Orchestrator

## 역할

설계 확인, 구현 리스트, 300 changed lines 내외의 batch, `Purpose`/`Direction`/`Validation` 커밋 메시지, 단계별 검증은 모든 스킬이 공통으로 따르는 작업 대원칙입니다.

`react-workflow-orchestrator`는 이 공통 원칙을 여러 React 스킬이 함께 쓰는 작업에서 하나의 합의된 workflow로 묶는 마스터 스킬입니다. 직접 모든 구현 판단을 대신하지 않고, 어떤 하위 스킬이 어떤 work unit을 맡을지 정하고, 순서, 커밋 경계, 검증, 최종 리뷰를 조율합니다.

## 마스터 스킬의 책임 범위

마스터 스킬의 핵심은 공통 대원칙을 새로 만드는 것이 아니라, 여러 하위 스킬이 함께 움직일 때 그 원칙이 빠지지 않게 조율하는 것입니다. 마스터 스킬은 "무엇을 어떤 순서로, 어떤 단위로, 어떤 검증과 커밋으로 진행할지"를 조정합니다. 하위 스킬은 각 영역의 전문 판단을 담당합니다.

| 구분 | 마스터 스킬이 하는 일 | 하위 스킬이 하는 일 |
| --- | --- | --- |
| 설계 | 전체 작업을 work unit으로 나누고 확인을 받습니다. | 각 work unit의 세부 구현 방식을 제안합니다. |
| 라우팅 | 필요한 스킬을 고르고 순서를 정합니다. | 자기 영역의 규칙과 reference를 적용합니다. |
| 커밋 | batch 크기, staged 범위, 메시지 형식을 제어합니다. | 변경 내용을 해당 책임에 맞게 만듭니다. |
| 검증 | work unit별 검증 계획과 최종 보고를 관리합니다. | 해당 영역에 맞는 test/typecheck/build를 실행합니다. |
| 충돌 해결 | 사용자 요구, repository 관례, 스킬 규칙이 충돌하면 방향을 정리합니다. | 자기 규칙이 왜 필요한지 근거를 제공합니다. |

## 언제 쓰나

- 하나의 요청에 Figma 해석, 기능 구현, 리팩터링, 테스트, 리뷰가 섞여 있을 때
- 사용자가 AI의 작업 단위와 커밋 단위를 먼저 이해해야 할 때
- 큰 변경을 300 changed lines 내외의 reviewable batch로 나누고 싶을 때
- 하위 스킬끼리 판단 기준이 충돌할 수 있을 때
- 마지막에 `react-ai-reviewer`로 검수까지 붙이고 싶을 때

작업이 작아 보여도 커밋 분리, 설계 확인, 최종 리뷰가 필요하면 마스터 스킬로 시작하는 편이 안전합니다.

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

## 구현 리스트 예시

```text
Implementation list
1. Feature skeleton: 요구사항을 page, hook, core 함수 시그니처로 나눕니다.
   Skill: business-feature-builder
   Files: apps/service/src/presentation/page/examplePage/**
   Commit: Add example page skeleton
   Validate: typecheck

2. UI sections: 큰 JSX 영역을 semantic section component로 분리합니다.
   Skill: business-feature-builder
   Files: apps/service/src/presentation/page/examplePage/components/**
   Commit: Extract example page sections
   Validate: page test

3. Final review: hooks, layering, testability를 리뷰합니다.
   Skill: react-ai-reviewer
   Files: current diff
   Commit: review fixes only if needed
   Validate: relevant test
```

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
