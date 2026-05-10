---
name: react-ai-reviewer
description: "Use when the user wants to review or improve React, TSX, JSX, hooks, component tests, or nearby frontend code in Codex or VS Code Codex. This skill preserves the original multi-reviewer React review flow with reviewer selection, prompts, contexts, and final-review merging guidance. Supports three modes: review-only, apply-selected-review-items, and direct-fix. If key inputs are missing, ask concise follow-up questions for the mode, target, priorities, scope boundary, and verification method."
---

# React AI Reviewer

Use this skill when the user wants a structured React review workflow instead of an ad hoc coding reply.

This skill keeps the original reviewer system under `references/reviewer-system/`:

- reviewer registry: `references/reviewer-system/reviewers.config.json`
- reviewer prompts: `references/reviewer-system/prompts/`
- reviewer contexts and rules: `references/reviewer-system/contexts/`
- supporting docs: `references/reviewer-system/docs/`
- deterministic brief generator: `scripts/prepare-codex-review.mjs`

## Modes

Choose one of these three modes:

1. `review-only`
2. `apply-selected-items`
3. `direct-fix`

If the user did not choose a mode, ask:

```text
어떤 방식으로 진행할까요?
1. 리뷰만
2. 리뷰 후 선택 항목만 반영
3. 바로 수정
```

## Required Slots

Collect only the missing critical slots.

- `target`: file path, folder, or diff scope
- `priorities`: bug, hooks, performance, maintainability, test, architecture
- `scope`: this file only, directly related code only, or the current diff
- `verification`: typecheck, test, lint, or no verification

If the user gives only a file path, ask:

```text
[파일 경로] 기준으로 진행하겠습니다.
모드, 우선순위, 검증 방식을 같이 알려주세요.
- 모드: 리뷰만 / 선택 항목만 반영 / 바로 수정
- 우선순위: 버그 / hooks / 성능 / 유지보수성 / 테스트 / 아키텍처
- 검증: typecheck / test / lint / 없음
```

## Original Reviewer Flow

When the user wants a diff-based review, preserve the original stages:

1. load diff
2. extract changed files
3. select matching reviewers from `reviewers.config.json`
4. load selected reviewer prompts, compressed contexts, and rules
5. produce a Codex review brief
6. review first, edit only after the user selects items

Use the deterministic script when that flow helps:

```bash
node skills/react-ai-reviewer/scripts/prepare-codex-review.mjs --diff pr.diff
```

Optional reviewer override:

```bash
node skills/react-ai-reviewer/scripts/prepare-codex-review.mjs --diff pr.diff --reviewers react-official,react-hooks-eslint,maintainability
```

The script writes:

- `.react-ai-reviewer/codex-review.md`
- `.react-ai-reviewer/reviewer-selection.json`

After generating the brief, read:

- `skills/react-ai-reviewer/SKILL.md`
- `.react-ai-reviewer/codex-review.md`
- `skills/react-ai-reviewer/references/reviewer-system/docs/reviewer-contract.md`
- `skills/react-ai-reviewer/references/reviewer-system/docs/prompt-authoring.md`

Open additional reviewer prompts or contexts only when they are selected.

If the request is a quick single-file review without a diff, use only the minimum relevant reviewer prompts or contexts instead of pretending the full selection flow ran. In that case, say explicitly that this was a narrowed reviewer pass, not the full diff-based multi-reviewer selection.

## Review-Only Workflow

- Read the target code and the minimum related context needed for correct review.
- If the task is diff-based and reviewer selection matters, run `prepare-codex-review.mjs` first.
- Do not edit code.
- Structure the response as:
  - `Review basis`
  - `Reviewer lenses used`
  - `Must fix`
  - `Should fix`
  - `Suggestions`
  - `Open questions`
- In `Review basis`, say whether this review used the full selected-reviewer flow or a narrowed subset review, and why.
- In `Reviewer lenses used`, list the actual reviewer prompts or contexts that informed the review and what each one mainly checked.
- Before each of `Must fix`, `Should fix`, and `Suggestions`, add one short `Focus:` line that explains which judgment criteria dominated that section.
- For each point include:
  - file or component
  - issue summary
  - impact
  - suggested fix direction
  - confidence
- Include source trace or reviewer lens for each point when the review used more than one reviewer perspective.
- Follow the selected reviewer prompts and contexts rather than inventing a new review framework.
- Prefer concrete issues over style nits.
- Avoid speculative rewrites and large architectural demands on small diffs.

## Apply-Selected-Items Workflow

- Assume there was a prior review.
- If the selected items are ambiguous, ask which item numbers or titles to apply.
- Edit only the requested items.
- Do not expand the scope on your own.
- After changes, explain:
  - which requested items were applied
  - which files changed
  - what verification ran
  - any remaining risks or intentionally skipped findings

## Direct-Fix Workflow

- Start with a short implementation plan.
- Edit the minimum necessary files.
- Keep the work tightly scoped to the user's stated goals.
- If the user still wants the original reviewer perspectives, generate the brief first and use the selected reviewer prompts as guidance before editing.
- After changes, explain what changed and what was verified.

## Default Priorities

If the user does not specify priorities, use:

- React files: bug, hooks, maintainability
- test files: test, bug
- data fetching or async changes: bug, performance

For deeper guidance, use the selected reviewer prompts and contexts under `references/reviewer-system/`.

## Command Patterns

Treat these as the three supported command templates:

### 1. Review Only

```text
[파일 경로 또는 리뷰 범위]를 단계적으로 리뷰해줘.

조건:
- 지금은 수정하지 마.
- Must fix / Should fix / Suggestions / Open questions 순서로 정리해.
- full multi-reviewer인지, 아니면 어떤 reviewer subset으로 본 건지도 먼저 밝혀줘.
- 선택된 reviewer와 각 섹션의 중점도 같이 알려줘.
- 각 포인트에 파일, 이유, 영향, 수정 방향, 확신도를 포함해.
- 우선순위는 [버그 / hooks / 성능 / 유지보수성 / 테스트 / 아키텍처] 위주로 봐줘.
- 범위는 [이 파일만 / 이 파일과 직접 관련된 부분까지만 / 현재 diff 전체]로 제한해줘.
```

### 2. Apply Selected Items

```text
방금 리뷰한 내용 중 [반영할 항목 번호 또는 제목]만 반영해줘.

조건:
- 선택한 항목만 수정하고 다른 건 건드리지 마.
- 수정한 파일과 반영한 포인트를 연결해서 설명해.
- 보류한 항목이 있으면 그대로 두고 새 범위는 추가하지 마.
- 가능하면 [typecheck / test / lint / 관련 검증 없음] 중 가능한 검증을 실행해 결과를 알려줘.
```

### 3. Direct Fix

```text
[파일 경로 또는 수정 범위]를 수정해줘.

목표:
- [수정 목표 1]
- [수정 목표 2]
- [수정 목표 3]

작업 방식:
- 먼저 어떤 점을 바꿀지 짧게 설명해.
- 그다음 바로 수정 진행해.
- 범위는 [이 파일만 / 관련된 최소 범위만 / 내가 지정한 범위만]으로 제한해.
- 수정 후 [typecheck / test / lint / 관련 검증 없음] 결과를 알려줘.
- 추가로 보이는 개선점이 있어도 지금 목표와 직접 관련된 것만 반영해.
```

## Noise Control

- Do not recommend `useMemo` or `useCallback` by default.
- Do not push a folder reorganization unless the change clearly causes maintenance cost now.
- Do not blur review-only and edit modes.
- Use the final reviewer lens to reduce noise and merge overlapping findings.
- If there is no meaningful issue, say so directly.
- Prefer extracting framework-agnostic logic into pure `.ts` when that logic does not need React runtime concerns.
- Prefer React components and hooks to stay as thin wrappers around state, lifecycle, DOM, context, and event wiring when pure `.ts` logic can own calculation, mapping, validation, or policy decisions.
- Do not suggest extraction for its own sake. Only recommend it when it clearly reduces change impact, improves testability, or sharpens responsibility boundaries.
