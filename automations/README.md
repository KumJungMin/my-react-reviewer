# Codex 자동화 템플릿

이 문서는 `react-feature-workflow` 플러그인의 스킬을 Codex Automations에서 반복 작업으로 사용할 때 붙여 넣을 수 있는 한글 지시문 템플릿입니다.

현재 파일은 런타임 설정 파일이 아니라 복사해서 쓰는 템플릿입니다. Codex 자동화 설정 화면에 필요한 지시문을 붙여 넣고, 아래 스킬을 함께 활성화하세요.

## 권장 자동화

전체 기능 개발에는 하나의 메인 자동화를 권장합니다.

- 자동화 이름: `React 기능 워크플로우 자동화`
- 기본 스킬: `$react-feature-builder`
- 보조 스킬: `$create-component-from-figma`, `$team-convention-checker`, `$react-ai-reviewer`, `$test-code-generator`

반복 작업의 범위가 좁을 때만 PR 준비 점검, Figma 인입, 테스트 보강 자동화를 따로 둡니다.

## 커스터마이징 파일

플러그인에는 커스터마이징 템플릿이 포함되어 있습니다.

```text
plugins/react-feature-workflow/assets/customization/
```

팀별 규칙을 적용하려면 필요한 템플릿을 대상 프로젝트의 아래 경로에 둡니다.

```text
.codex/react-feature-workflow/
```

스킬은 기본 규칙을 적용하기 전에 이 파일들을 먼저 읽습니다.

## React 기능 워크플로우 자동화

### 목적

Codex가 프론트엔드 기능 개발을 아래 순서대로 진행하도록 안내합니다.

```text
요구사항 분석
↓
디자인/Figma 분석
↓
아키텍처 설계
↓
구현
↓
팀 컨벤션 검사
↓
React 코드 리뷰
↓
테스트 생성
↓
검증
```

### 활성화할 스킬

- `$react-feature-builder`
- `$create-component-from-figma`
- `$team-convention-checker`
- `$react-ai-reviewer`
- `$test-code-generator`

### 자동화 지시문

```text
이 자동화는 React 기능을 요구사항부터 검증까지 진행하는 데 사용한다.

항상 아래 순서로 스킬을 사용한다.
1. $react-feature-builder로 요구사항 분석, 워크플로우 관리, 아키텍처 설계, 구현, 최종 보고를 수행한다.
2. Figma URL, node-id, 스크린샷, mockup, UI 설명이 있으면 $create-component-from-figma를 design-analysis 모드로 사용한다.
3. 구현 후 $team-convention-checker로 프로젝트별 팀 컨벤션만 검사한다.
4. 컨벤션 검사 후 $react-ai-reviewer로 React 코드 품질만 리뷰한다.
5. 리뷰 결과가 안정되면 $test-code-generator로 테스트를 생성하거나 보강한다.
6. 마지막에 $react-feature-builder로 검증과 최종 요약을 수행한다.

구현 전에 입력 체크리스트를 보여주고, 누락된 핵심 정보만 질문한다.

아래 산출물을 만들 수 있을 만큼 입력이 명확해지기 전에는 구현하지 않는다.
- .requirements/feature-brief.md
- .requirements/architecture-plan.md
- 테스트가 필요하면 .requirements/test-plan.md

디자인 소스가 없을 때만 디자인 분석을 건너뛴다.
사용자가 테스트를 작성하지 말라고 명시한 경우에만 테스트 생성을 건너뛴다.
사용자가 검증하지 말라고 명시했거나 실행 가능한 명령이 없을 때만 검증을 건너뛴다.

각 스킬의 책임을 지킨다.
- create-component-from-figma는 디자인 소스 분석과 UI 구현을 담당한다.
- team-convention-checker는 팀/프로젝트 컨벤션을 검사한다.
- react-ai-reviewer는 React 코드 품질을 리뷰한다.
- test-code-generator는 요구사항, 설계, 구현을 바탕으로 테스트를 작성한다.

각 단계마다 아래 정보를 보고한다.
- 현재 단계
- 사용 중인 스킬
- 사용한 입력
- 누락된 입력
- 생성된 산출물
- 다음 단계

최종 출력에는 아래 내용을 포함한다.
- 변경된 파일
- 생성 또는 업데이트된 산출물
- 컨벤션 검사 결과
- React 리뷰 결과
- 추가 또는 수정된 테스트
- 검증 명령과 결과
- 남은 리스크 또는 가정
```

## 입력 체크리스트

전체 워크플로우를 실행하기 전에 아래 정보를 확인합니다.

```text
기능 입력 체크리스트

요구사항:
- 기능 목표:
- 인수 조건:
- 사용자 흐름:
- 필요한 상태:
- 검증 규칙:
- 예외 케이스:
- 제외 범위:

대상:
- 기능 영역:
- route 또는 page:
- 컴포넌트 경로:
- 관련 파일:

디자인:
- Figma URL 또는 node-id:
- 스크린샷 또는 mockup:
- UI 설명:
- 반응형 요구사항:

범위:
- 신규 기능 또는 기존 기능 수정:
- 수정 가능한 파일:
- 제외할 파일:

테스트:
- unit test 필요 여부:
- component test 필요 여부:
- integration test 필요 여부:
- 검증할 상태:

검증:
- test 명령:
- typecheck 명령:
- lint 명령:
- build 명령:
```

## 스킬별 입력 표

| 스킬 | 필수 입력 | 선택 입력 | 출력 |
|---|---|---|---|
| `$react-feature-builder` | 요구사항, 대상, 범위, 검증 방식 | 디자인 소스, 인수 조건, 제약사항 | 워크플로우 계획, `.requirements` 산출물, 최종 요약 |
| `$create-component-from-figma` | Figma URL, node-id, 스크린샷, mockup, UI 설명 중 하나 | 대상 경로, 기대 상태, 반응형 규칙, 검증 방식 | 디자인 분석 또는 UI 구현 |
| `$team-convention-checker` | 대상, 모드, 범위 | 명시 컨벤션 문서, 집중 검사 항목 | 컨벤션 위반, 수정 방향, 선택적 자동 수정 |
| `$react-ai-reviewer` | 대상, 모드, 우선순위, 범위 | reviewer override, 검증 명령 | React 코드 품질 finding 또는 범위 제한 수정 |
| `$test-code-generator` | 대상, 동작 기준, 테스트 범위, 검증 방식 | feature brief, architecture plan, 상태 목록 | unit/component/integration 테스트와 요약 |

## 작은 자동화 템플릿

### PR 준비 점검 자동화

브랜치나 PR을 최종 점검할 때 사용합니다.

```text
이 자동화는 현재 브랜치가 리뷰 준비 상태인지 확인하는 데 사용한다.

스킬은 아래 순서로 사용한다.
1. $team-convention-checker를 check-only 모드와 current diff 범위로 사용한다.
2. $react-ai-reviewer를 review-only 모드로 사용하고 bug, hooks, maintainability, performance, accessibility, testability를 우선한다.
3. 의미 있는 테스트 공백이 발견될 때만 $test-code-generator를 사용한다.

누락된 입력을 질문한다.
- 대상 브랜치 또는 diff 범위
- 검증 명령
- 테스트 추가 가능 여부

출력:
- 컨벤션 위반
- React 리뷰 finding
- 누락된 테스트
- 실행한 명령
- 권장 다음 작업
```

### Figma 인입 자동화

새 디자인을 구현 준비 상태로 만들 때 사용합니다.

```text
이 자동화는 Figma 디자인 또는 스크린샷을 구현 가능한 가이드로 바꾸는 데 사용한다.

스킬은 아래 순서로 사용한다.
1. $create-component-from-figma를 design-analysis 모드로 사용한다.
2. $react-feature-builder로 요구사항 분석과 아키텍처 설계까지만 수행한다.

누락된 입력을 질문한다.
- Figma URL, node-id, 스크린샷, mockup, UI 설명 중 하나
- 대상 기능 영역
- 기대 상태
- 반응형 요구사항
- 작업 범위

출력:
- 컴포넌트 후보
- 레이아웃과 반응형 규칙
- 토큰과 스타일 영향
- 접근성 고려사항
- 필요한 상태
- .requirements/feature-brief.md
- .requirements/architecture-plan.md
```

### 테스트 공백 보강 자동화

구현은 있지만 테스트가 부족할 때 사용합니다.

```text
이 자동화는 의미 있는 프론트엔드 테스트 공백을 찾고 보강하는 데 사용한다.

스킬은 아래 순서로 사용한다.
1. $react-ai-reviewer를 review-only 모드로 사용하고 testability, bug, accessibility를 우선한다.
2. 선택된 테스트 공백에 대해 $test-code-generator를 사용한다.

누락된 입력을 질문한다.
- 대상 파일 또는 기능 폴더
- 동작 기준 또는 인수 조건
- 테스트 범위
- 검증 명령

출력:
- 테스트 공백
- 추가 또는 수정된 테스트
- 검증 결과
- 남은 미검증 리스크
```
