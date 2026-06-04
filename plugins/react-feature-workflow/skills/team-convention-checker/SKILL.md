---
name: team-convention-checker
description: "Use when the user wants to verify or fix project-specific frontend team conventions, including folder structure, file placement, filenames, naming rules, export style, hook boundaries, state-management rules, design-system usage, and test location. This skill checks team rules, not general React code quality."
---

# Team Convention Checker

Use this skill for project or team rule compliance. It is separate from general code-quality review.

## Language

All user-facing responses, questions, summaries, artifact prose, section headings, and guidance must be written in Korean by default. Keep code identifiers, file paths, commands, API names, and quoted source names in their original form. If another instruction names an English response section, translate that section heading into natural Korean when presenting it to the user.

## Responsibility

Check conventions for:

- folder structure
- file location
- filenames
- naming
- export style
- hook boundaries
- state-management rules
- design-system usage
- test location

Do not turn this into a React best-practice review. Use `react-ai-reviewer` for correctness, hooks, performance, accessibility, maintainability, and testability.

## Customization

Before inferring conventions, read project-level overrides when they exist:

- `.codex/react-feature-workflow/team-conventions.md`
- `.codex/team-conventions.md`
- `docs/team-conventions.md`
- `docs/frontend-conventions.md`
- `AGENTS.md`

Apply convention sources in this order:

1. Explicit user instruction
2. Project override files above
3. Repository documentation
4. Tooling config
5. Nearby implementation patterns
6. Broader repository patterns

If project overrides define required checks, naming rules, folder rules, export rules, hook rules, state-management rules, design-system rules, or test-location rules, use those instead of generic defaults.

If an override is incomplete, apply it for covered areas and infer only the missing areas from repository context.

## Required Inputs

Collect only missing critical information:

- `target`: file, folder, diff, or feature area
- `mode`: check-only or fix-conventions
- `scope`: this file only, directly related files, or current diff
- `conventionSources`: explicit docs if provided, otherwise infer from repository context

Default to `check-only` when the user does not explicitly ask for fixes.

## Convention Sources

Prefer convention evidence in this order:

1. Explicit user instruction
2. Project override files under `.codex/react-feature-workflow/`
3. Repository instructions such as `AGENTS.md`, `README.md`, `docs/**`, or local architecture docs
4. Tooling config such as `package.json`, `tsconfig*`, eslint config, test config, build config
5. Existing nearby implementation patterns
6. Broader repository patterns

When a rule is inferred rather than documented, label it as inferred.

## Workflow

1. Inspect target files and directly related files.
2. Discover documented, configured, and inferred convention sources.
3. Classify each finding as documented, configured, or inferred.
4. Report convention violations with location, reason, and fix direction.
5. In `fix-conventions` mode, edit only clear convention violations within scope.
6. Run relevant validation if requested or if fixes were applied.

## Output Shape

Use this structure:

```text
Convention Check Result

Checked scope:
Convention sources:

Violations:
- Item:
  Location:
  Rule basis:
  Reason:
  Fix:
  Auto-fixable:

No violation:

Assumptions:
Verification:
```

If there are no violations, say so directly and list any residual uncertainty.

## Fix Rules

- Fix only conventions, not unrelated quality issues.
- Do not reorganize folders unless the convention evidence is strong.
- Do not rename public APIs without checking call sites.
- Do not change runtime behavior unless required by the convention fix.
- Keep inferred-rule fixes conservative.

## Example Prompt

```text
$team-convention-checker로 src/features/cart 변경분을 검사해줘.

조건:
- 모드: check-only
- 범위: 현재 diff
- 확인 항목: 폴더 구조, export 방식, hook 위치, 테스트 위치
```
