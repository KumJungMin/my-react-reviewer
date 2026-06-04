---
name: react-feature-builder
description: "Use when the user wants Codex to build a React feature end to end from requirements, ticket text, Figma, screenshot, or product brief. Orchestrates requirement analysis, design/Figma analysis, architecture planning, implementation, team convention check, React code review, test generation, and verification. Produces .requirements/feature-brief.md, .requirements/architecture-plan.md, and .requirements/test-plan.md when useful."
---

# React Feature Builder

Use this skill when the user wants a full frontend development workflow, not just isolated UI generation or code review.

## Language

All user-facing responses, questions, summaries, artifact prose, section headings, and guidance must be written in Korean by default. Keep code identifiers, file paths, commands, API names, and quoted source names in their original form. If another instruction names an English response section, translate that section heading into natural Korean when presenting it to the user.

## Quick Guide Trigger

Show the Korean quick guide in these cases:

- If the user's request contains `가이드`, show the quick guide first.
- If the request is only asking for a guide or usage help, stop after the quick guide.
- If the request contains `가이드` plus a concrete task, show the quick guide first, then continue with the workflow.
- If this skill is used for the first time in a conversation and the user did not say `가이드`, show the quick guide before doing anything else.

After the quick guide, continue only when the user already provided enough task input. Otherwise ask only for missing critical inputs.

Output this Markdown guide:

````markdown
# React Development Skills

React 기능 구현, Figma 분석, 코드 리뷰, 테스트 생성 등을 위한 Skill 모음입니다.

기능 개발이 필요하다면 요구사항만 설명해도 됩니다. Skill이 적절한 단계를 거쳐 분석, 구현, 검증을 진행합니다.

---

## 개발 워크플로우

기능 구현은 일반적으로 다음 순서로 진행됩니다.

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

---

## 기능 구현하기

새로운 기능을 만들고 싶다면 `$react-feature-builder`를 사용합니다.

예시:

```text
$react-feature-builder로 회원가입 기능을 구현해줘.

요구사항:
- 이메일 입력
- 비밀번호 입력
- 이메일 형식 검증
- 가입 API 호출
- 가입 성공 시 로그인 페이지 이동

대상:
src/features/auth
```

Figma가 있다면 함께 전달할 수 있습니다.

```text
$react-feature-builder로 회원가입 기능을 구현해줘.

Figma:
https://...

요구사항:
- 이메일 입력
- 비밀번호 입력
- 가입 버튼
```

특별히 범위를 지정하지 않으면 관련 파일만 최소 범위로 수정합니다.

---

## Figma 또는 스크린샷 분석하기

Figma, 스크린샷, 디자인 시안을 분석하거나 React 컴포넌트로 구현하고 싶다면 `$create-component-from-figma`를 사용합니다.

예시:

```text
$create-component-from-figma로 이 Figma를 분석해줘.
```

```text
$create-component-from-figma로 이 화면을 React 컴포넌트로 구현해줘.
```

```text
$create-component-from-figma로 이 스크린샷을 분석하고 컴포넌트 구조를 제안해줘.
```

가능한 작업:

* UI 구조 분석
* 컴포넌트 분리 제안
* 상태 정의
* 접근성 고려사항 도출
* React 컴포넌트 생성
* 디자인 토큰 추론

---

## 팀 컨벤션 검사하기

프로젝트 규칙 준수 여부를 확인하고 싶다면 `$team-convention-checker`를 사용합니다.

예시:

```text
$team-convention-checker로 현재 변경사항을 검사해줘.
```

```text
$team-convention-checker로 src/features/payment를 검사해줘.
```

```text
$team-convention-checker로 이 파일을 프로젝트 컨벤션 기준으로 수정해줘.
```

검사 대상 예시:

* 폴더 구조
* 파일명
* 네이밍 규칙
* Export 규칙
* Hook 규칙
* 상태 관리 방식
* 디자인 시스템 사용 여부
* 테스트 파일 위치

---

## React 코드 리뷰 받기

React 코드 품질을 검토하고 싶다면 `$react-ai-reviewer`를 사용합니다.

예시:

```text
$react-ai-reviewer로 현재 변경사항을 리뷰해줘.
```

```text
$react-ai-reviewer로 PaymentForm.tsx를 리뷰해줘.
```

```text
$react-ai-reviewer로 버그 가능성과 유지보수성을 중심으로 리뷰해줘.
```

주요 검토 항목:

* React Best Practice
* Hook 사용 방식
* 상태 관리
* 유지보수성
* 접근성
* 성능
* 테스트 가능성

---

## 테스트 생성하기

구현된 기능의 테스트를 만들고 싶다면 `$test-code-generator`를 사용합니다.

예시:

```text
$test-code-generator로 PaymentForm 테스트를 작성해줘.
```

```text
$test-code-generator로 현재 구현 기준 테스트를 생성해줘.
```

```text
$test-code-generator로 에러 상태와 입력 검증 케이스를 포함해서 테스트를 작성해줘.
```

생성 가능한 테스트:

* Unit Test
* Component Test
* Integration Test
* Loading 상태
* Empty 상태
* Error 상태
* Validation 테스트

---

## 고급 사용 예시

현재 변경사항만 대상으로 작업하기

```text
$react-ai-reviewer로 현재 diff만 리뷰해줘.

$team-convention-checker로 현재 diff만 검사해줘.
```

구현 후 검증까지 진행하기

```text
$react-feature-builder로 결제 페이지를 구현하고 lint, typecheck까지 수행해줘.
```

특정 디렉토리만 대상으로 작업하기

```text
$react-feature-builder로 src/features/payment 영역만 수정해줘.

$team-convention-checker로 src/features/payment만 검사해줘.
```

---

## 권장 사용 방법

대부분의 경우에는 아래처럼 자연어로 요청하면 됩니다.

```text
$react-feature-builder로 결제 정보 입력 화면을 구현해줘.

요구사항:
- 카드 번호 입력
- 만료일 입력
- CVC 입력
- 입력값 검증
- 결제 API 호출

디자인:
첨부한 Figma 참고

검증:
lint, typecheck
```

필요한 정보가 부족하면 Skill이 추가 정보를 요청하거나 현재 코드베이스를 분석하여 적절한 방향을 제안합니다.
````

Do not repeat the guide later in the same conversation unless the user asks for `가이드` again.

This skill is an orchestrator. It coordinates specialized skills and repository work, but does not replace their responsibilities:

- `create-component-from-figma`: design/Figma analysis and UI implementation support
- `team-convention-checker`: team convention compliance
- `react-ai-reviewer`: React code quality review
- `test-code-generator`: test planning and test implementation

## Customization

Before applying defaults, look for project-level workflow overrides in this order:

1. Explicit user instructions in the current request
2. `.codex/react-feature-workflow/feature-workflow.md`
3. `.codex/react-feature-workflow/input-checklist.md`
4. `.codex/react-feature-workflow/team-conventions.md`
5. `.codex/react-feature-workflow/test-policy.md`
6. `.codex/react-feature-workflow/react-review-policy.md`
7. `.codex/react-feature-workflow/figma-design-policy.md`
8. This skill's defaults

If an override defines required inputs, stage order, artifact shape, validation commands, or skip rules, follow that project policy unless it conflicts with explicit user instructions.

When an override exists, mention which override files were used.

## Required Inputs

Collect only the missing critical information:

- `requirement`: feature request, ticket, acceptance criteria, or product brief
- `target`: feature area, route, component path, or expected output location
- `designSource`: Figma URL, node-id, screenshot, mockup, or none
- `scope`: new feature, existing feature update, component-only, or current diff
- `verification`: test, typecheck, lint, build, or no verification

If the request is too ambiguous to implement safely, ask concise follow-up questions before editing.

## Workflow

Follow this order unless the user explicitly narrows the scope:

1. Requirement Analysis
2. Design / Figma Analysis
3. Architecture Planning
4. Implementation
5. Convention Check
6. Code Review
7. Test Generation
8. Verification

## Artifacts

For substantial feature work, write these files and keep them updated:

- `.requirements/feature-brief.md`
- `.requirements/architecture-plan.md`
- `.requirements/test-plan.md`

Use `references/workflow-artifacts.md` for the expected artifact shape.

For very small changes, you may keep the brief in the response instead of writing files, but say that the workflow was condensed.

## Stage Rules

### 1. Requirement Analysis

Create or update `.requirements/feature-brief.md`.

Capture:

- user goal
- user flows
- required states
- user events
- validation rules
- edge cases
- non-goals
- acceptance criteria

Do not implement until the requirement is coherent enough to guide the work.

### 2. Design / Figma Analysis

If a design source exists, use `create-component-from-figma` as the design-analysis lens before implementation.

Extract:

- component candidates
- layout structure
- design token implications
- responsive behavior
- accessibility considerations
- visible and implied states

Treat generated Figma code as reference material, not final production code.

### 3. Architecture Planning

Create or update `.requirements/architecture-plan.md`.

Plan:

- component boundaries
- state ownership
- event and command flow
- data loading or mutation boundaries
- error handling
- accessibility requirements
- file changes
- verification commands

Prefer existing repository patterns and the smallest durable architecture that fits the requirement.

### 4. Implementation

Implement the plan with tight scope control.

Rules:

- inspect nearby code before editing
- reuse existing primitives, hooks, tokens, utilities, and test patterns
- keep UI, orchestration, and pure logic responsibilities separated
- avoid adding dependencies unless explicitly justified
- update the architecture plan if implementation reality changes

### 5. Convention Check

Use `team-convention-checker` for project convention compliance.

Check folder placement, filenames, export style, hook boundaries, state-management conventions, design-system usage, and test location.

Do not treat this stage as general code quality review.

### 6. Code Review

Use `react-ai-reviewer` for React code quality.

Focus on correctness, hooks, state, maintainability, accessibility, performance, and testability.

Do not duplicate the convention checker unless a convention violation also creates a concrete code-quality risk.

### 7. Test Generation

Use `test-code-generator` after implementation and review findings are stable.

Create or update `.requirements/test-plan.md` before writing substantial tests.

Cover meaningful states from the feature brief and architecture plan.

### 8. Verification

Run the relevant repository commands requested by the user or implied by the change.

Report exact commands and outcomes. If a command cannot run, explain why and what risk remains.

## Final Response

Summarize:

- artifacts created or updated
- implementation scope
- convention check outcome
- review outcome
- tests added or updated
- verification results
- remaining risks or assumptions

Keep the response concise and grounded in actual files changed.

## Example Prompt

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
