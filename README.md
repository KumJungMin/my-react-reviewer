# Codex Skills Guide

이 저장소에는 Codex에서 바로 사용할 수 있는 다섯 개의 커스텀 스킬이 들어 있습니다.

- `react-feature-builder`
- `create-component-from-figma`
- `team-convention-checker`
- `react-ai-reviewer`
- `test-code-generator`

## 폴더 구조

```text
skills/
  react-feature-builder/
  react-ai-reviewer/
  create-component-from-figma/
  team-convention-checker/
  test-code-generator/
```

각 폴더는 독립적인 Codex skill이며, `SKILL.md`가 실제 동작 규칙을 담고 있습니다.

## Codex에 스킬 추가하기

로컬에서 바로 개발하면서 쓰려면 `~/.codex/skills` 아래에 심볼릭 링크로 연결하는 방식이 가장 편합니다.

```bash
mkdir -p ~/.codex/skills
ln -s /path/to/my-react-reviewer/skills/react-feature-builder ~/.codex/skills/react-feature-builder
ln -s /path/to/my-react-reviewer/skills/react-ai-reviewer ~/.codex/skills/react-ai-reviewer
ln -s /path/to/my-react-reviewer/skills/create-component-from-figma ~/.codex/skills/create-component-from-figma
ln -s /path/to/my-react-reviewer/skills/team-convention-checker ~/.codex/skills/team-convention-checker
ln -s /path/to/my-react-reviewer/skills/test-code-generator ~/.codex/skills/test-code-generator
```

예시:

```bash
mkdir -p ~/.codex/skills
ln -s /Users/gjm/my-react-reviewer/skills/react-feature-builder ~/.codex/skills/react-feature-builder
ln -s /Users/gjm/my-react-reviewer/skills/react-ai-reviewer ~/.codex/skills/react-ai-reviewer
ln -s /Users/gjm/my-react-reviewer/skills/create-component-from-figma ~/.codex/skills/create-component-from-figma
ln -s /Users/gjm/my-react-reviewer/skills/team-convention-checker ~/.codex/skills/team-convention-checker
ln -s /Users/gjm/my-react-reviewer/skills/test-code-generator ~/.codex/skills/test-code-generator
```

추가한 뒤에는 Codex를 재시작해야 새 스킬을 인식합니다.

복사 방식으로 넣고 싶다면 심볼릭 링크 대신 아래처럼 복사해도 됩니다.

```bash
cp -R /path/to/my-react-reviewer/skills/react-feature-builder ~/.codex/skills/
cp -R /path/to/my-react-reviewer/skills/react-ai-reviewer ~/.codex/skills/
cp -R /path/to/my-react-reviewer/skills/create-component-from-figma ~/.codex/skills/
cp -R /path/to/my-react-reviewer/skills/team-convention-checker ~/.codex/skills/
cp -R /path/to/my-react-reviewer/skills/test-code-generator ~/.codex/skills/
```

## 스킬 호출 방식

가장 확실한 방법은 프롬프트에 스킬 이름을 직접 넣는 것입니다.

- `$react-ai-reviewer`
- `$create-component-from-figma`
- `$react-feature-builder`
- `$team-convention-checker`
- `$test-code-generator`

예:

```text
Use $react-ai-reviewer to review src/features/cart/CartPanel.tsx
```

```text
Use $create-component-from-figma to implement this component from the attached Figma URL
```

```text
Use $react-feature-builder to build this feature from requirements through verification
```

자연어로 요청해도 트리거될 수 있지만, 원하는 스킬을 확실히 쓰게 하려면 `$스킬명`을 명시하는 편이 안전합니다.

## 전체 개발 플로우

`react-feature-builder`는 전체 워크플로우를 관리하는 오케스트레이터입니다.

```text
Requirement Analysis
↓
Figma Analysis
↓
Architecture Design
↓
Implementation
↓
Team Convention Check
↓
React Review
↓
Test Generation
↓
Verification
```

단일 작업만 필요하면 하위 스킬을 직접 호출하고, 요구사항부터 검증까지 한 번에 진행하려면 `react-feature-builder`를 호출합니다.

## Codex Automations

Codex 앱의 Automations에 반복 가능한 지시문으로 등록하려면 [automations/README.md](automations/README.md)를 사용합니다.

권장 방식은 하나의 `React Feature Workflow Automation`에서 아래 순서로 스킬을 쓰게 하는 것입니다.

1. `react-feature-builder`
2. `create-component-from-figma`
3. `team-convention-checker`
4. `react-ai-reviewer`
5. `test-code-generator`
6. `react-feature-builder` 최종 검증

자동화 템플릿에는 단계별 입력 체크리스트와 스킬별 필수 입력 정보가 포함되어 있습니다.

## Codex Plugin

이 스킬 묶음은 하나의 플러그인으로도 패키징되어 있습니다.

```text
plugins/react-feature-workflow/
  .codex-plugin/plugin.json
  skills/
  assets/automation-templates/
  assets/customization/
```

플러그인 안에는 5개 스킬, 자동화 템플릿, 커스터마이징 템플릿이 함께 들어 있습니다.

새 채팅에서 간단한 사용법을 보여주고 싶다면 [quick start guide](plugins/react-feature-workflow/assets/onboarding/quick-start.md)를 사용합니다. `react-feature-builder`는 첫 사용 시 한글 quick guide를 먼저 보여주도록 설정되어 있습니다.

`가이드`라고 요청하면 한글 quick guide를 보여주고, `가이드`와 구체적인 작업을 함께 요청하면 가이드를 먼저 보여준 뒤 작업을 이어갑니다.

사용자가 팀 규칙이나 입력 요구사항을 바꾸고 싶다면 [customization templates](plugins/react-feature-workflow/assets/customization/README.md)를 기준으로 대상 프로젝트에 아래 파일을 만들면 됩니다.

```text
.codex/react-feature-workflow/
  feature-workflow.md
  input-checklist.md
  team-conventions.md
  figma-design-policy.md
  react-review-policy.md
  test-policy.md
```

스킬은 현재 요청의 명시 지시를 가장 우선하고, 그다음 위 override 파일을 읽은 뒤 기본 규칙을 적용합니다.

## `react-feature-builder`

요구사항 분석부터 구현, 리뷰, 테스트, 검증까지 전체 기능 개발 흐름을 관리하는 스킬입니다.

### 언제 쓰면 좋은가

- 티켓이나 요구사항을 기반으로 기능을 끝까지 구현하고 싶을 때
- Figma 분석, 설계, 구현, 검증을 단계별로 강제하고 싶을 때
- 여러 스킬을 직접 호출하지 않고 하나의 워크플로우로 진행하고 싶을 때

### 산출물

큰 기능 작업에서는 다음 파일을 생성하거나 업데이트합니다.

- `.requirements/feature-brief.md`
- `.requirements/architecture-plan.md`
- `.requirements/test-plan.md`

### 기본 사용 패턴

```text
$react-feature-builder로 아래 요구사항을 구현해줘.

요구사항:
- 장바구니 요약 컴포넌트 추가
- 쿠폰 적용 전/후 금액 표시
- 로딩, 빈 상태, 오류 상태 필요

디자인:
- Figma URL: https://www.figma.com/design/...

조건:
- 대상 경로: src/features/cart
- 범위: 관련된 최소 파일만
- 검증: test, typecheck
```

## `react-ai-reviewer`

React, TSX, JSX, hooks, 테스트 코드의 코드 품질 리뷰와 개선 작업을 위한 스킬입니다.

팀 컨벤션 전체 검사는 담당하지 않습니다. 폴더 구조, 파일 위치, export 방식, 디자인 시스템 사용 규칙처럼 프로젝트 규칙 자체를 확인하려면 `team-convention-checker`를 사용합니다.

### 언제 쓰면 좋은가

- 특정 React 파일을 리뷰하고 싶을 때
- 현재 diff를 여러 reviewer 관점으로 점검하고 싶을 때
- 리뷰 결과 중 일부만 선택해서 반영하고 싶을 때
- 리뷰 없이 바로 수정까지 진행하고 싶을 때

### 지원 모드

- `review-only`: 리뷰만 수행
- `apply-selected-items`: 리뷰한 항목 중 선택한 것만 반영
- `direct-fix`: 바로 수정

### 기본 사용 패턴

#### 1. 리뷰만

```text
Use $react-ai-reviewer to review src/features/cart/CartPanel.tsx

조건:
- 모드: review-only
- 우선순위: bug, hooks, maintainability
- 범위: this file only
- 검증: 없음
```

한국어로 요청하면 더 자연스럽게 쓸 수 있습니다.

```text
$react-ai-reviewer로 src/features/cart/CartPanel.tsx를 리뷰해줘.

조건:
- 모드: 리뷰만
- 우선순위: 버그, hooks, 유지보수성
- 범위: 이 파일만
- 검증: 없음
```

#### 2. 리뷰 후 선택 항목만 반영

```text
$react-ai-reviewer로 방금 리뷰한 내용 중 1번, 3번만 반영해줘.

조건:
- 모드: apply-selected-items
- 범위는 추가하지 말고 선택한 항목만 수정
- 검증: typecheck
```

#### 3. 바로 수정

```text
$react-ai-reviewer로 src/features/cart/CartPanel.tsx를 수정해줘.

목표:
- 불필요한 useEffect 제거
- stale closure 가능성 제거
- 테스트가 깨지지 않게 유지

조건:
- 모드: direct-fix
- 범위: 관련된 최소 범위만
- 검증: test
```

### 이 스킬이 보는 관점

`react-ai-reviewer`는 하나의 단일 프롬프트가 아니라 여러 reviewer 렌즈를 조합하는 구조입니다. 대표적으로 아래 관점을 사용합니다.

- `react-official`: React 공식 문서 기준 correctness
- `react-hooks-eslint`: Hook 규칙, dependency, stale closure
- `dan-abramov`: resilient components, effect 동기화 관점
- `maintainability`: 변경 비용, 응집도, 책임 분리
- `vercel-performance`: React/Next 성능 관점
- `kent-testing`: 사용자 행동 중심 테스트 관점
- `bulletproof-react`: feature boundary, 아키텍처 관점
- `clean-code-design`: SOLID, coupling/cohesion 관점
- `final-reviewer`: 중복 의견 병합 및 우선순위 정리

### 언제 특히 잘 맞는가

- PR diff 리뷰
- hooks 로직 검토
- `useEffect` / 의존성 배열 문제 점검
- 테스트 품질 점검
- 구조는 유지하면서 최소 범위 수정

<br/><br/>

## `create-component-from-figma`

Figma URL, node-id, screenshot, mockup, 텍스트 설명을 바탕으로 디자인을 분석하거나 React 컴포넌트를 구현하는 스킬입니다.

### 언제 쓰면 좋은가

- Figma 디자인을 실제 컴포넌트로 옮기고 싶을 때
- 구현 전에 컴포넌트 후보, 레이아웃, 토큰, 반응형 규칙을 분석하고 싶을 때
- screenshot 기반으로 기존 디자인 시스템에 맞는 UI를 만들고 싶을 때
- 새 컴포넌트를 만들되 현재 저장소 패턴에 맞춰 구현하고 싶을 때

### 이 스킬이 기대하는 입력

아래 중 최소 하나는 있어야 합니다.

- Figma URL 또는 node-id
- screenshot / mockup
- 텍스트로 된 UI 설명

가능하면 함께 주면 좋은 정보:

- 구현할 대상 경로
- 인터랙션 / 상태 요구사항
- 작업 범위
- 검증 방식

### 기본 사용 패턴

#### 1. 디자인 분석만

```text
$create-component-from-figma로 이 Figma를 구현 전에 분석해줘.

조건:
- 모드: design-analysis
- 확인 항목: 컴포넌트 후보, 레이아웃, 토큰, 반응형 규칙, 접근성, 필요한 상태
- 지금은 코드 수정하지 마
```

#### 2. Figma URL로 구현

```text
Use $create-component-from-figma to implement this component.

Inputs:
- Figma URL: https://www.figma.com/design/...
- Target path: src/features/cart/components/CartSummary.tsx
- Scope: related minimum files only
- Validation: test
```

#### 3. 스크린샷 기반 구현

```text
$create-component-from-figma로 첨부한 화면을 기준으로 컴포넌트를 만들어줘.

조건:
- 대상 경로: src/components/profile/ProfileCard.tsx
- 필요한 상태: default, hover, loading
- 범위: 관련된 최소 파일만
- 검증: typecheck
```

#### 4. 텍스트 설명만으로 구현

```text
$create-component-from-figma를 사용해서 다음 컴포넌트를 구현해줘.

설명:
- 제목, 설명, CTA 버튼이 있는 프로모션 카드
- 모바일에서는 세로 정렬, 데스크탑에서는 가로 정렬
- dismiss 버튼 필요

조건:
- 스타일은 현재 저장소 패턴 재사용
- React + TypeScript + Vanilla Extract 기준으로 구현
- 검증: lint
```

### 이 스킬의 구현 원칙

- 현재 저장소의 `components/ui`, 토큰, 유틸리티를 먼저 재사용
- 시맨틱 HTML 우선
- 접근성 우선
- mockup 픽셀 복제보다 유지보수 가능한 제품 코드 우선
- 스타일은 `Vanilla Extract` 기준

### 언제 특히 잘 맞는가

- 기존 디자인 시스템이 있는 React 저장소
- 새 UI를 빠르게 코드로 옮겨야 하는 작업
- 디자인 의도는 유지하되 저장소 규칙에 맞춰 구현해야 하는 작업

## `team-convention-checker`

코드 품질이 아니라 팀 규칙 준수 여부를 검증하는 스킬입니다.

### 언제 쓰면 좋은가

- 파일 위치나 폴더 구조가 팀 규칙에 맞는지 확인하고 싶을 때
- export 방식, hook 위치, 테스트 위치를 점검하고 싶을 때
- 디자인 시스템 사용 규칙이나 상태 관리 규칙 위반 여부를 확인하고 싶을 때

### 검사 항목

- 폴더 구조
- 파일명
- 네이밍
- export 방식
- hook 규칙
- 상태 관리 규칙
- 디자인 시스템 사용 여부
- 테스트 위치

### 기본 사용 패턴

```text
$team-convention-checker로 src/features/cart 변경분을 검사해줘.

조건:
- 모드: check-only
- 범위: 현재 diff
- 확인 항목: 폴더 구조, export 방식, hook 위치, 테스트 위치
```

수정까지 원하면:

```text
$team-convention-checker로 src/features/cart 변경분의 컨벤션 위반을 수정해줘.

조건:
- 모드: fix-conventions
- 범위: 관련된 최소 파일만
- 검증: lint, typecheck
```

## `test-code-generator`

구현된 기능에 대한 테스트 코드를 생성하거나 보강하는 스킬입니다.

### 언제 쓰면 좋은가

- 기능 구현 후 테스트가 누락되었을 때
- happy path 외의 상태를 함께 검증하고 싶을 때
- 기존 테스트 스타일을 유지하면서 테스트를 추가하고 싶을 때

### 생성 대상

- unit test
- component test
- integration test

### 기본 사용 패턴

```text
$test-code-generator로 src/features/cart 구현에 대한 테스트를 작성해줘.

조건:
- 기준: .requirements/feature-brief.md, .requirements/architecture-plan.md
- 범위: component test 중심
- 상태: 정상, 로딩, 빈 상태, 오류, 쿠폰 입력 검증
- 검증: test
```

## 추천 사용 순서

상황별로는 아래 순서가 가장 실용적입니다.

1. 전체 기능 개발이면 `react-feature-builder`
2. 디자인 분석이나 UI 구현만 필요하면 `create-component-from-figma`
3. 팀 규칙 준수 여부만 확인하려면 `team-convention-checker`
4. React 코드 품질 점검이 필요하면 `react-ai-reviewer`
5. 테스트 작성이나 보강이 필요하면 `test-code-generator`
6. Figma 기반 기능을 끝까지 진행하려면 `react-feature-builder` 안에서 하위 스킬을 순서대로 사용

## 참고 파일

- [react-ai-reviewer SKILL](skills/react-ai-reviewer/SKILL.md)
- [create-component-from-figma SKILL](skills/create-component-from-figma/SKILL.md)
- [react-feature-builder SKILL](skills/react-feature-builder/SKILL.md)
- [team-convention-checker SKILL](skills/team-convention-checker/SKILL.md)
- [test-code-generator SKILL](skills/test-code-generator/SKILL.md)
