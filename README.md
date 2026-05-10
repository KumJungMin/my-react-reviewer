# Codex Skills Guide

이 저장소에는 Codex에서 바로 사용할 수 있는 두 개의 커스텀 스킬이 들어 있습니다.

- `react-ai-reviewer`
- `create-component-from-figma`

## 폴더 구조

```text
skills/
  react-ai-reviewer/
  create-component-from-figma/
```

각 폴더는 독립적인 Codex skill이며, `SKILL.md`가 실제 동작 규칙을 담고 있습니다.

## Codex에 스킬 추가하기

로컬에서 바로 개발하면서 쓰려면 `~/.codex/skills` 아래에 심볼릭 링크로 연결하는 방식이 가장 편합니다.

```bash
mkdir -p ~/.codex/skills
ln -s /path/to/my-react-reviewer/skills/react-ai-reviewer ~/.codex/skills/react-ai-reviewer
ln -s /path/to/my-react-reviewer/skills/create-component-from-figma ~/.codex/skills/create-component-from-figma
```

예시:

```bash
mkdir -p ~/.codex/skills
ln -s /Users/gjm/my-react-reviewer/skills/react-ai-reviewer ~/.codex/skills/react-ai-reviewer
ln -s /Users/gjm/my-react-reviewer/skills/create-component-from-figma ~/.codex/skills/create-component-from-figma
```

추가한 뒤에는 Codex를 재시작해야 새 스킬을 인식합니다.

복사 방식으로 넣고 싶다면 심볼릭 링크 대신 아래처럼 복사해도 됩니다.

```bash
cp -R /path/to/my-react-reviewer/skills/react-ai-reviewer ~/.codex/skills/
cp -R /path/to/my-react-reviewer/skills/create-component-from-figma ~/.codex/skills/
```

## 스킬 호출 방식

가장 확실한 방법은 프롬프트에 스킬 이름을 직접 넣는 것입니다.

- `$react-ai-reviewer`
- `$create-component-from-figma`

예:

```text
Use $react-ai-reviewer to review src/features/cart/CartPanel.tsx
```

```text
Use $create-component-from-figma to implement this component from the attached Figma URL
```

자연어로 요청해도 트리거될 수 있지만, 원하는 스킬을 확실히 쓰게 하려면 `$스킬명`을 명시하는 편이 안전합니다.

## `react-ai-reviewer`

React, TSX, JSX, hooks, 테스트 코드 리뷰와 개선 작업을 위한 스킬입니다.

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

Figma URL, node-id, screenshot, mockup, 텍스트 설명을 바탕으로 React 컴포넌트를 구현하는 스킬입니다.

### 언제 쓰면 좋은가

- Figma 디자인을 실제 컴포넌트로 옮기고 싶을 때
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

#### 1. Figma URL로 구현

```text
Use $create-component-from-figma to implement this component.

Inputs:
- Figma URL: https://www.figma.com/design/...
- Target path: src/features/cart/components/CartSummary.tsx
- Scope: related minimum files only
- Validation: test
```

#### 2. 스크린샷 기반 구현

```text
$create-component-from-figma로 첨부한 화면을 기준으로 컴포넌트를 만들어줘.

조건:
- 대상 경로: src/components/profile/ProfileCard.tsx
- 필요한 상태: default, hover, loading
- 범위: 관련된 최소 파일만
- 검증: typecheck
```

#### 3. 텍스트 설명만으로 구현

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

## 추천 사용 순서

상황별로는 아래 순서가 가장 실용적입니다.

1. React 코드 품질 점검이 먼저면 `react-ai-reviewer`
2. 새 UI 구현이 먼저면 `create-component-from-figma`
3. Figma로 구현한 뒤 코드 품질까지 점검하려면 `create-component-from-figma` 후 `react-ai-reviewer`

## 참고 파일

- [react-ai-reviewer SKILL](skills/react-ai-reviewer/SKILL.md)
- [create-component-from-figma SKILL](skills/create-component-from-figma/SKILL.md)
