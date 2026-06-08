---
name: react-ai-reviewer
description: "Use for final review or review-driven improvement of React, TSX, JSX, hooks, component tests, or nearby frontend code in Codex or VS Code Codex. This skill preserves the original multi-reviewer React review flow with reviewer selection, prompts, contexts, and final-review merging guidance. For new business feature implementation use skills/business-feature-builder; for raw Figma-to-code use skills/create-component-from-figma; for design-system hardening or packages/design-system updates use skills/gds-generator."
---

# React AI Reviewer

Use this skill when the user wants a structured React review workflow instead of an ad hoc coding reply.

Use this as the final review step after `create-component-from-figma`, `business-feature-builder`, or `gds-generator` has produced changes.

For design-system component generation, public API design, HeroUI-style component/hook splitting, or substantial changes under `packages/design-system`, use `skills/gds-generator` instead. This reviewer may review existing design-system code, but it should not be the primary workflow for generating or refactoring GDS components.

For business feature implementation, page logic, form flows, async orchestration, UI/business separation, or test generation from requirements, use `skills/business-feature-builder` instead. This reviewer may review those changes after implementation, but it should not be the primary workflow for building them.

For raw Figma/screenshot/mockup-to-code requests, use `skills/create-component-from-figma` instead. This reviewer may review the generated result afterward.

This skill keeps the original reviewer system under `references/reviewer-system/`:

- reviewer registry: `references/reviewer-system/reviewers.config.json`
- reviewer prompts: `references/reviewer-system/prompts/`
- reviewer contexts and rules: `references/reviewer-system/contexts/`
- supporting docs: `references/reviewer-system/docs/`
- deterministic brief generator: `scripts/prepare-codex-review.mjs`
- deterministic AST preflight analyzer: `scripts/analyze-react-ast.mjs`

Internal React Quality Lens is bundled as a project-owned reviewer:

- reviewer id: `react-quality-lens`
- prompt: `references/reviewer-system/prompts/react-quality-lens.md`
- context: `references/reviewer-system/contexts/react-quality-rules.md`
- rules: `references/reviewer-system/contexts/react-quality-rules.json`

Use it for general React quality, maintainability, state/effect cleanup, rendering performance, accessibility, type-safety, and testability checks. It is an internal markdown-based lens, not an external doctor/scanner integration.

Handler and callback naming has a dedicated reviewer context:

- reviewer id: `handler-naming`
- prompt: `references/reviewer-system/prompts/09-handler-naming.md`
- context: `references/reviewer-system/contexts/handler-naming/compressed.md`
- rules: `references/reviewer-system/contexts/handler-naming/rules.json`

Load it when the review involves callback prop APIs, local event handlers, DOM event adapters, controlled state callbacks, or naming changes around `on*`, `handle*`, and business action functions.

Design-system public API naming and alias policy is part of the handler naming lens:

- Boolean state props use `is*` or `has*`: prefer `isInvalid`, `isDisabled`, `isLoading`, `isRounded`, `hasNotification`, and `hasHomeIndicator` over vague names such as `hasError` or `invalid`.
- Controlled value changes use `onValueChange(value, event?)`. Keep native `onChange(event)` only when consumers need the DOM event.
- Controlled open/visibility state uses `open`, `defaultOpen`, and `onOpenChange(open)`. `onClose` may remain as a close-request convenience API when the component already exposes it.
- Horizontal slots use `startContent` and `endContent`; vertical slots use `topContent` and `bottomContent`. Treat `left`, `right`, `prefix`, `suffix`, `topAccessory`, and `bottomAccessory` as legacy aliases for new public APIs.
- Styling choices use `variant` first, with specific names such as `color`, `tone`, or `size` only when they describe a different concept. Avoid new `type`, `designType`, or `buttonStyle` props for styling variants.
- Compatibility aliases may stay during migration, but the canonical prop must win when both are provided. New examples, docs, tests, and public usage should use only canonical names.

Page and design-system layering has a dedicated reviewer context:

- reviewer id: `page-layering`
- prompt: `references/reviewer-system/prompts/10-page-layering.md`
- context: `references/reviewer-system/contexts/page-layering/compressed.md`
- rules: `references/reviewer-system/contexts/page-layering/rules.json`

Load it when the review or fix involves `apps/service/src/presentation/page/**`, `packages/design-system/src/components/**`, page VM hooks, `.utils.ts`, `.core.ts`, provider/context hooks, or responsibility separation between UI, stateful orchestration, and pure logic. Do not propose a separate usecase package unless the user explicitly asks for it or real feature API integration creates that layer.

For `packages/design-system`, domain fields such as `AddressField` and `IdDocumentField` are allowed to remain public design-system APIs when they clarify product intent. Keep shared primitives (`TextField`, `SplitTextField`, `SelectBox`) generic, and expose only public components/types from component `index.ts` or the root package export.

## Internal React Quality Review

When reviewing React code, apply the internal React Quality Lens unless the user explicitly asks for only a different named reviewer perspective.

Use this lens to check:

- correctness
- hooks and effects
- state model
- component responsibility
- rendering performance
- accessibility
- type safety
- testability

Do not depend on external scanners or third-party diagnostic packages. The review must be based on source code, diff context, repository conventions, and internal rules.

Classify findings into:

- Must fix
- Should fix
- Suggestions
- Open questions

Avoid noisy advice:

- Do not recommend `useMemo` or `useCallback` by default.
- Do not recommend folder restructuring without clear maintenance benefit.
- Do not split components only because they are long.
- Do not suggest generic tests without specifying behavior.

## Security Boundary

- Do not install, execute, or import external diagnostic packages unless the user explicitly asks.
- Do not send source code, diffs, secrets, environment variables, or repository metadata to third-party services.
- Do not add GitHub Actions that require write permissions unless explicitly requested.
- Do not read `.env`, secret files, private keys, tokens, or credential files unless the task explicitly requires that exact file and the user approves the scope.
- When reviewing security-sensitive code, inspect only the source files required for the task.
- Prefer internal markdown-based review rules over external scanners.

## AST Preflight

Use AST preflight when the user wants token-saving review, diff-based review, hook/effect diagnosis, or "doctor-style" narrowing before AI reasoning.

The AST preflight is deterministic. It produces syntax facts and candidate signals only; it is not a final review and must not be treated as proof of a bug.

It checks for:

- hook call placement and effect dependency/cleanup signals
- `useState` declarations, setter calls inside effects, and direct state mutation syntax
- JSX accessibility signals such as non-interactive click handlers, missing `button type`, missing `img alt`, and `dangerouslySetInnerHTML`
- context provider inline value syntax
- presentation-layer imports from API/repository/service/domain-like modules
- component/hook/function metrics such as lines, hook count, effect count, JSX count, and branch count

The script loads the target repository's installed `typescript` package. Do not install packages just to run it unless the user explicitly asks. If `typescript` is unavailable, skip AST preflight and say so.

For a diff-based review, run AST preflight before generating the Codex review brief:

```bash
node skills/react-ai-reviewer/scripts/analyze-react-ast.mjs --repo . --diff pr.diff
node skills/react-ai-reviewer/scripts/prepare-codex-review.mjs --repo . --diff pr.diff --ast-analysis .react-ai-reviewer/ast-analysis.md
```

For a single file or folder:

```bash
node skills/react-ai-reviewer/scripts/analyze-react-ast.mjs --repo . --target src/features/cart/CartPanel.tsx
```

When using AST preflight:

- Read `.react-ai-reviewer/ast-analysis.md` before opening whole source files.
- Open only the reported file and nearby line windows first.
- Verify semantics before promoting any AST signal to `Must fix` or `Should fix`.
- Use the JSON output only when the markdown summary is insufficient.

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
2. run AST preflight when available and useful
3. extract changed files
4. select matching reviewers from `reviewers.config.json`
5. load selected reviewer prompts, compressed contexts, and rules
6. produce a Codex review brief
7. review first, edit only after the user selects items

Use the deterministic script when that flow helps:

```bash
node skills/react-ai-reviewer/scripts/prepare-codex-review.mjs --diff pr.diff
```

Optional reviewer override:

```bash
node skills/react-ai-reviewer/scripts/prepare-codex-review.mjs --diff pr.diff --reviewers react-official,react-hooks-eslint,maintainability
```

Handler naming focused override:

```bash
node skills/react-ai-reviewer/scripts/prepare-codex-review.mjs --diff pr.diff --reviewers handler-naming,maintainability
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

- Use direct-fix only for review-driven fixes, explicitly selected review findings, or small corrective edits after a review pass.
- Do not use direct-fix as the primary workflow for raw Figma-to-code work, business feature implementation, or design-system hardening.
- Start with a short implementation plan.
- Edit the minimum necessary files.
- Keep the work tightly scoped to the user's stated goals.
- If JSX decomposition is requested or clearly needed, apply it only when it improves readability or responsibility boundaries under the JSX decomposition rules below.
- If the user still wants the original reviewer perspectives, generate the brief first and use the selected reviewer prompts as guidance before editing.
- After changes, explain what changed and what was verified.

## Default Priorities

If the user does not specify priorities, use:

- React files: bug, hooks, maintainability
- test files: test, bug
- data fetching or async changes: bug, performance

For deeper guidance, use the selected reviewer prompts and contexts under `references/reviewer-system/`.

If the user explicitly asks about handler or callback naming, include `handler-naming` even when it would not be selected by the deterministic diff matcher.

If the user explicitly asks about design-system API naming, HeroUI/MUI-style props, alias/deprecation policy, or public component API ergonomics, include both `handler-naming` and `page-layering`.

If the user explicitly asks about page structure, design-system level, UI/logic separation, VM hooks, or usecase boundaries, include `page-layering` even when it would not be selected by the deterministic diff matcher.

If the user explicitly asks for React code 고도화, 리팩토링, useEffect/state cleanup, testability improvement, or a "doctor-style" diagnosis without external tools, include `react-quality-lens` even when the deterministic matcher would not select it.

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
- JSX decomposition is conditional, not automatic. Split JSX only when there is a clear semantic boundary such as `Header`, `Content`, `Footer`, `Hero`, `Guide`, `Actions`, or `CTA`, or when a page/component body mixes orchestration state, event wiring, translation/data mapping, and large visual sections enough to obscure the main flow.
- When JSX decomposition is justified, prefer top-level presentational components in the same file for meaningful visual sections. Keep the container/page component focused on state, event handlers, translation/data mapping, and section composition. Pass primitive values, callbacks, or stable data shapes into the presentational sections.
- Avoid defining component functions inside another component. If the extracted unit should be rendered as `<Section />`, declare it at module scope so React sees a stable component type and local state below it is not accidentally reset.
- Use local `const` JSX or a `render*` helper only for small one-off templates that are tightly coupled to the surrounding closure and do not deserve a React component boundary. If the helper grows into a semantic section, promote it to a top-level presentational component.
- Do not add `memo`, `useMemo`, or `useCallback` solely because JSX was split. Memoization needs a concrete reason such as expensive calculation, memoized children that benefit from stable props, or profiler-observed re-render cost.
- For slot/template props such as `contents`, `left`, `right`, `header`, or `footer`, extract JSX only when inline conditional rendering, a11y labels, or styling decisions obscure the main structure. Use nearest-scope local `const` by default, module-level helper for reused/branchy pure builders, and module-level `const` only for static values. Leave short obvious JSX inline; do not add memoization for this readability refactor.
- Dataize repeated JSX with `map` only when the structure is homogeneous, the data shape is clearer than duplicated JSX, stable semantic keys exist, and there are usually 3+ items or likely growth. Avoid for simple two-button navigation, utility-key rows, or divergent handlers/content; do not add memoization solely for mapped templates.
- Do not push a folder reorganization unless the change clearly causes maintenance cost now.
- Do not blur review-only and edit modes.
- Use the final reviewer lens to reduce noise and merge overlapping findings.
- If there is no meaningful issue, say so directly.
- Prefer extracting framework-agnostic logic into pure `.ts` when that logic does not need React runtime concerns.
- Prefer React components and hooks to stay as thin wrappers around state, lifecycle, DOM, context, and event wiring when pure `.ts` logic can own calculation, mapping, validation, or policy decisions.
- Do not suggest extraction for its own sake. Only recommend it when it clearly reduces change impact, improves testability, or sharpens responsibility boundaries.
- For handler naming, do not raise style-only nits. Only flag names when they blur API contracts, hide whether a function is a DOM event adapter vs. domain action, or make future interaction changes harder.
- Prefer `on*` for external callback props, `handle*` for component-local event adapters, `on[State]Change` for controlled state callbacks, and business verbs without `handle` for domain/usecase actions.
- For design-system public APIs, prefer canonical HeroUI-style names (`isInvalid`, `onValueChange`, `startContent`, `endContent`, `variant`) and allow legacy aliases only as migration shims where canonical props take precedence.
