---
name: test-code-generator
description: "Use when the user wants to generate, improve, or repair tests for implemented React or frontend features. Builds tests from feature briefs, architecture plans, implementation code, and existing repository test patterns. Covers normal, loading, empty, error, permission, network, and input-validation states where relevant."
---

# Test Code Generator

Use this skill to plan and write tests for implemented frontend behavior.

## Language

All user-facing responses, questions, summaries, artifact prose, section headings, and guidance must be written in Korean by default. Keep code identifiers, file paths, commands, API names, and quoted source names in their original form. If another instruction names an English response section, translate that section heading into natural Korean when presenting it to the user.

## Responsibility

Generate or improve:

- unit tests
- component tests
- integration tests

Use the feature brief, architecture plan, implementation code, and nearby test patterns as the basis.

Do not use this skill as a general code reviewer. Use `react-ai-reviewer` for code-quality review.

## Customization

Before planning tests, read project-level overrides when they exist:

- `.codex/react-feature-workflow/test-policy.md`
- `.codex/test-policy.md`
- `docs/test-policy.md`
- `docs/testing.md`

Use project overrides for test stack, required coverage states, naming style, mock boundaries, test locations, required utilities, and verification commands.

If an override conflicts with nearby established tests, follow explicit user instructions first, then the project override, then nearby test patterns.

## Required Inputs

Collect only missing critical information:

- `target`: implemented file, feature folder, or diff
- `behavior`: requirement, feature brief, or acceptance criteria
- `testScope`: unit, component, integration, or mixed
- `verification`: test command or no verification

If `.requirements/feature-brief.md` or `.requirements/architecture-plan.md` exists and is relevant, read it before writing tests.

## Workflow

1. Inspect the implementation and directly related files.
2. Discover the repository test stack from `package.json`, test config, and existing nearby tests.
3. Read nearby tests to match style, helpers, render utilities, mocks, and naming.
4. Derive a test plan before writing substantial tests.
5. Write focused tests for observable behavior.
6. Cover meaningful states and edge cases.
7. Run requested or relevant verification commands.
8. Report what was tested and what remains untested.

## Coverage Targets

Cover these when they are relevant to the feature:

- normal state
- loading state
- empty state
- error state
- permission error
- network error
- user input validation
- disabled or read-only state
- keyboard and accessibility behavior

Avoid testing implementation details unless the target is a pure function or internal helper whose contract is intentionally exported.

## Test Style Rules

- Prefer user-observable behavior.
- Prefer accessible queries such as role, label, text, and description.
- Prefer `userEvent` for interactions when the repository uses Testing Library.
- Mock external boundaries, not the component internals.
- Keep tests deterministic and scoped.
- Do not add broad snapshot tests unless the repository already relies on them for the same kind of component.
- Do not rewrite production code just to make tests easy unless the implementation has a real testability problem.

## `.requirements/test-plan.md`

When used inside `react-feature-builder`, create or update `.requirements/test-plan.md`.

For standalone requests, keep the test plan in the response unless the user asks for a file or the work is substantial.

## Final Response

Summarize:

- tests added or changed
- behavior covered
- verification command and result
- intentionally untested areas
- assumptions

## Example Prompt

```text
$test-code-generator로 src/features/cart 구현에 대한 테스트를 작성해줘.

조건:
- 기준: .requirements/feature-brief.md, .requirements/architecture-plan.md
- 범위: component test 중심
- 상태: 정상, 로딩, 빈 상태, 오류, 쿠폰 입력 검증
- 검증: test
```
