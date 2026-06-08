# Codex Skills Guide

이 저장소에는 Codex에서 바로 사용할 수 있는 React/TypeScript 작업용 커스텀 스킬이 들어 있습니다.

- `business-feature-builder`
- `create-component-from-figma`
- `gds-generator`
- `react-ai-reviewer`
- `react-upgrade-workflow`

## 폴더 구조

```text
skills/
  business-feature-builder/
    SKILL.md
    references/
  create-component-from-figma/
    SKILL.md
    references/
  gds-generator/
    SKILL.md
    references/
  react-ai-reviewer/
    SKILL.md
    references/
    scripts/
  react-upgrade-workflow/
    SKILL.md
```

각 폴더는 독립적인 Codex skill이며, `SKILL.md`의 frontmatter가 스킬 이름과 트리거 조건을 정의합니다. 자세한 절차와 판단 기준은 각 스킬의 `SKILL.md`와 필요한 `references/` 파일에 들어 있습니다.

## Codex에 스킬 추가하기

로컬에서 바로 개발하면서 쓰려면 `~/.codex/skills` 아래에 심볼릭 링크로 연결하는 방식이 가장 편합니다.

```bash
mkdir -p ~/.codex/skills
ln -s /path/to/my-react-reviewer/skills/business-feature-builder ~/.codex/skills/business-feature-builder
ln -s /path/to/my-react-reviewer/skills/create-component-from-figma ~/.codex/skills/create-component-from-figma
ln -s /path/to/my-react-reviewer/skills/gds-generator ~/.codex/skills/gds-generator
ln -s /path/to/my-react-reviewer/skills/react-ai-reviewer ~/.codex/skills/react-ai-reviewer
ln -s /path/to/my-react-reviewer/skills/react-upgrade-workflow ~/.codex/skills/react-upgrade-workflow
```

예시:

```bash
mkdir -p ~/.codex/skills
ln -s /Users/gjm/my-react-reviewer/skills/business-feature-builder ~/.codex/skills/business-feature-builder
ln -s /Users/gjm/my-react-reviewer/skills/create-component-from-figma ~/.codex/skills/create-component-from-figma
ln -s /Users/gjm/my-react-reviewer/skills/gds-generator ~/.codex/skills/gds-generator
ln -s /Users/gjm/my-react-reviewer/skills/react-ai-reviewer ~/.codex/skills/react-ai-reviewer
ln -s /Users/gjm/my-react-reviewer/skills/react-upgrade-workflow ~/.codex/skills/react-upgrade-workflow
```

추가한 뒤에는 Codex를 재시작해야 새 스킬을 인식합니다.

복사 방식으로 넣고 싶다면 심볼릭 링크 대신 아래처럼 복사해도 됩니다.

```bash
cp -R /path/to/my-react-reviewer/skills/business-feature-builder ~/.codex/skills/
cp -R /path/to/my-react-reviewer/skills/create-component-from-figma ~/.codex/skills/
cp -R /path/to/my-react-reviewer/skills/gds-generator ~/.codex/skills/
cp -R /path/to/my-react-reviewer/skills/react-ai-reviewer ~/.codex/skills/
cp -R /path/to/my-react-reviewer/skills/react-upgrade-workflow ~/.codex/skills/
```

## 스킬 호출 방식

가장 확실한 방법은 프롬프트에 스킬 이름을 직접 넣는 것입니다.

- `$business-feature-builder`
- `$create-component-from-figma`
- `$gds-generator`
- `$react-ai-reviewer`
- `$react-upgrade-workflow`

자연어로 요청해도 트리거될 수 있지만, 원하는 스킬을 확실히 쓰게 하려면 `$스킬명`을 명시하는 편이 안전합니다.

## 스킬 선택 기준

상황별 기본 선택은 아래와 같습니다.

1. 비즈니스 요구사항, 사용할 컴포넌트, Figma 링크가 함께 있는 앱/페이지 기능 구현: `business-feature-builder`
2. Figma, screenshot, mockup, 텍스트 UI 설명을 React 컴포넌트로 옮기는 초기 구현: `create-component-from-figma`
3. `packages/design-system` 코드 수정, 디자인 시스템 컴포넌트 생성/리팩터링/강화: `gds-generator`
4. 구현 후 최종 리뷰, React/hooks/test 품질 점검, 리뷰 기반 수정: `react-ai-reviewer`
5. 기존 React 코드 고도화, hooks/effect/state cleanup, 책임 분리, 테스트 가능성 개선: `react-upgrade-workflow`

라우팅이 겹치면 더 구체적인 목적을 우선합니다. 예를 들어 비즈니스 요구사항과 Figma 링크가 함께 있으면 `create-component-from-figma`가 아니라 `business-feature-builder`를 기본 workflow로 쓰고, Figma 해석이 필요할 때만 보조적으로 `create-component-from-figma`를 참고합니다.

## `business-feature-builder`

React/TypeScript 비즈니스 기능 구현을 위한 기본 workflow입니다. 페이지 로직, form flow, 상태 있는 UI 동작, API/usecase orchestration, validation, navigation, 테스트를 함께 다룰 때 사용합니다.

### 언제 쓰면 좋은가

- 요구사항 기반으로 앱/페이지 기능을 구현해야 할 때
- 사용할 컴포넌트와 Figma 링크가 함께 주어진 기능 작업일 때
- UI와 비즈니스 로직을 분리하면서 hook, core/utils, 테스트까지 구성해야 할 때
- skeleton-first 방식으로 함수, handler, hook, component signature를 먼저 잡고 구현해야 할 때

### 기본 사용 패턴

```text
$business-feature-builder로 회원 탈퇴 페이지 기능을 구현해줘.

요구사항:
- 탈퇴 사유 선택
- 약관 동의 체크
- 제출 전 validation
- 제출 성공 시 완료 페이지로 이동

입력:
- Figma URL: https://www.figma.com/design/...
- 사용할 컴포넌트: SelectBox, Checkbox, Button
- 대상 경로: apps/service/src/presentation/page/memberTerminationPage
- 검증: test
```

### 구현 원칙

- `{Component}.tsx`는 JSX, layout, presentational composition 중심으로 유지
- `use{Component}.tsx`는 React state, handler, lifecycle, navigation, async orchestration 담당
- `.core.ts` 또는 `.utils.ts`는 validation, mapping, formatting 같은 pure logic 담당
- 테스트는 normal flow, validation, error/failure, loading/disabled, 의미 있는 edge case를 포함

## `create-component-from-figma`

Figma URL, node-id, screenshot, mockup, 텍스트 UI 설명을 바탕으로 React + TypeScript + Vanilla Extract 컴포넌트를 초기 구현하는 스킬입니다.

### 언제 쓰면 좋은가

- 디자인 자산을 실제 React 컴포넌트로 옮기고 싶을 때
- screenshot 기반으로 기존 디자인 시스템에 맞는 UI를 만들고 싶을 때
- 새 컴포넌트를 만들되 현재 저장소 패턴에 맞춰 구현하고 싶을 때

### 기본 사용 패턴

```text
$create-component-from-figma로 첨부한 화면을 기준으로 컴포넌트를 만들어줘.

조건:
- 대상 경로: src/components/profile/ProfileCard.tsx
- 필요한 상태: default, hover, loading
- 범위: 관련된 최소 파일만
- 검증: typecheck
```

### 구현 원칙

- 기존 primitives, tokens, utilities, feature folder 패턴을 먼저 재사용
- semantic HTML과 접근성을 우선
- mockup의 픽셀 복제보다 유지보수 가능한 제품 코드 우선
- 스타일은 Vanilla Extract `.css.ts` 기준
- business feature 전체 구현이나 design-system hardening은 각각 `business-feature-builder`, `gds-generator`로 라우팅

## `gds-generator`

디자인 시스템 컴포넌트 생성, 리팩터링, 강화, 문서/예제/테스트/exports 업데이트를 위한 스킬입니다. 특히 `packages/design-system` 아래 작업의 기본 workflow입니다.

### 언제 쓰면 좋은가

- Figma-generated UI를 design-system-quality 컴포넌트로 강화할 때
- `packages/design-system/src/components/**` 코드를 수정할 때
- public API, slot/class contract, ownerState-style internal state, accessibility, interaction state를 설계해야 할 때
- Vanilla Extract recipe, `useComponent` hook, `component-core.ts`, style-guide docs/examples, 테스트까지 정리해야 할 때

### 기본 사용 패턴

```text
$gds-generator로 packages/design-system/src/components/text-field를 개선해줘.

목표:
- public prop naming 정리
- invalid/loading/disabled 상태 접근성 보완
- style-guide 예제 업데이트
- 테스트 추가

검증:
- design-system build
- 관련 테스트
```

### 구현 원칙

- React + TypeScript + Vanilla Extract 사용
- public props는 `isDisabled`, `isInvalid`, `isLoading`, `startContent`, `endContent`, `variant`, `color`, `size`, `radius`처럼 semantic naming 우선
- 복잡하거나 interactive한 컴포넌트는 rendering, behavior hook, pure core logic을 분리
- package exports와 style-guide viewer docs/examples를 함께 확인

## `react-ai-reviewer`

React, TSX, JSX, hooks, component tests, 주변 frontend code를 구조적으로 리뷰하거나 리뷰 결과를 기반으로 개선하는 스킬입니다. 새 기능 구현의 기본 workflow가 아니라 구현 후 final review 단계로 쓰는 것이 기본입니다.

### 언제 쓰면 좋은가

- 특정 React 파일이나 현재 diff를 리뷰하고 싶을 때
- hooks dependency, stale closure, effect 동기화 문제를 점검하고 싶을 때
- 유지보수성, 테스트 품질, 성능, architecture 관점의 리뷰가 필요할 때
- 이전 리뷰 결과 중 선택한 항목만 반영하거나 작은 corrective fix를 하고 싶을 때

### 지원 모드

- `review-only`: 리뷰만 수행
- `apply-selected-items`: 리뷰한 항목 중 선택한 것만 반영
- `direct-fix`: 리뷰 기반의 작은 수정 수행

### AST preflight

AI가 전체 diff를 먼저 읽기 전에, 로컬 AST 분석으로 hook/effect/state/JSX/accessibility/layering 후보 위치를 압축할 수 있습니다. 이 단계는 AI 판단이 아니라 deterministic syntax signal입니다.

```bash
node skills/react-ai-reviewer/scripts/analyze-react-ast.mjs --repo . --diff pr.diff
node skills/react-ai-reviewer/scripts/prepare-codex-review.mjs --repo . --diff pr.diff --ast-analysis .react-ai-reviewer/ast-analysis.md
```

대상 프로젝트에 이미 설치된 `typescript` 패키지를 사용합니다. 패키지를 설치하거나 외부 scanner를 호출하지 않습니다.

### 기본 사용 패턴

```text
$react-ai-reviewer로 src/features/cart/CartPanel.tsx를 리뷰해줘.

조건:
- 모드: review-only
- 우선순위: 버그, hooks, 유지보수성
- 범위: 이 파일만
- 검증: 없음
```

```text
$react-ai-reviewer로 방금 리뷰한 내용 중 1번, 3번만 반영해줘.

조건:
- 모드: apply-selected-items
- 범위: 선택한 항목만
- 검증: typecheck
```

### 주요 reviewer 렌즈

- `react-official`: React 공식 문서 기준 correctness
- `react-hooks-eslint`: Hook 규칙, dependency, stale closure
- `dan-abramov`: resilient components, effect synchronization
- `maintainability`: 변경 비용, 응집도, 책임 분리
- `vercel-performance`: React/Next 성능
- `kent-testing`: 사용자 행동 중심 테스트
- `bulletproof-react`: feature boundary, architecture
- `clean-code-design`: SOLID, coupling/cohesion
- `handler-naming`: `on*`, `handle*`, callback prop API naming
- `page-layering`: page VM hook, `.core.ts`, `.utils.ts`, UI/state/pure logic layering
- `react-quality-lens`: 내부 React Quality Lens. 외부 doctor 도구 없이 correctness, hooks/effects, state model, responsibility, performance, accessibility, type safety, testability를 함께 점검
- `final-reviewer`: 중복 의견 병합 및 우선순위 정리

## `react-upgrade-workflow`

기존 React/TypeScript 코드를 동작 보존 전제로 고도화하는 스킬입니다. 새 기능 구현보다는 state/effect cleanup, responsibility split, pure logic extraction, rendering boundary, 접근성, 타입 안정성, 테스트 가능성 개선에 초점을 둡니다.

### 언제 쓰면 좋은가

- `useEffect` 오남용이나 derived state를 정리하고 싶을 때
- 컴포넌트가 API 호출, mapping, validation, rendering을 과하게 함께 들고 있을 때
- hook 안의 pure business logic을 테스트 가능한 `.ts` 함수로 빼고 싶을 때
- 리렌더링 위험을 점검하되 무분별한 `useMemo`/`useCallback`은 피하고 싶을 때
- 외부 doctor/npm package 없이 내부 React Quality Lens 기준으로 개선하고 싶을 때

### 기본 사용 패턴

```text
$react-upgrade-workflow로 src/features/payment/components/PaymentForm.tsx를 고도화해줘.

목표:
- useEffect 오남용 제거
- derived state 정리
- 순수 로직 분리
- 테스트 가능성 개선

조건:
- 동작 변경 금지
- 관련 최소 파일만 수정
- useMemo/useCallback은 근거가 있을 때만 사용
- 수정 후 typecheck/test/lint 중 가능한 검증 실행
```

## 추천 workflow

새 기능을 만드는 경우:

1. `business-feature-builder`로 요구사항, skeleton, 책임 분리, 구현, 테스트를 진행
2. Figma 해석이 필요한 부분은 `create-component-from-figma`를 보조적으로 활용
3. 구현 후 `react-ai-reviewer`로 final review

기존 코드 고도화 작업인 경우:

1. `react-upgrade-workflow`로 상태/effect/책임 분리/테스트 가능성 개선
2. 필요하면 `react-ai-reviewer`의 `react-quality-lens` 기준으로 최종 리뷰

디자인 시스템 작업인 경우:

1. `create-component-from-figma`로 초기 UI를 코드화
2. `gds-generator`로 public API, accessibility, slot contract, docs/examples, tests를 강화
3. 필요하면 `react-ai-reviewer`로 최종 코드 리뷰

## 참고 파일

- [business-feature-builder SKILL](skills/business-feature-builder/SKILL.md)
- [create-component-from-figma SKILL](skills/create-component-from-figma/SKILL.md)
- [gds-generator SKILL](skills/gds-generator/SKILL.md)
- [react-ai-reviewer SKILL](skills/react-ai-reviewer/SKILL.md)
- [react-upgrade-workflow SKILL](skills/react-upgrade-workflow/SKILL.md)
