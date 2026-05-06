# Repository Map

This repository is a GitHub Actions based React PR review bot. Treat this file as a map, not as a full manual. Open the linked docs only when the task needs that detail.

## Non-Negotiables

- Reviewer prompts must stay independent. Each source-based reviewer reviews the same diff without seeing other reviewer results.
- Only the final reviewer merges, deduplicates, adjusts severity, removes unsupported findings, and writes the final Korean Markdown review.
- Do not run pull request code. The bot reads GitHub PR file patches and static repository context only.
- Do not log secrets, tokens, or raw diff unnecessarily.
- OpenAI calls must use the Responses API structured output path and `store: false`.
- `OPENAI_API_KEY` must be read only from the environment.
- Dan Abramov must not be described as a React co-founder.
- Bulletproof React and Clean Code guidance are contextual architecture aids, not official React rules.

## Where To Look

- `README.md`: user-facing setup, local run, GitHub Actions usage.
- `docs/index.md`: documentation map.
- `docs/architecture.md`: runtime flow and module responsibilities.
- `docs/reviewer-contract.md`: reviewer output contract, severity, source trace rules.
- `docs/prompt-authoring.md`: how to add or strengthen reviewer prompts.
- `docs/security.md`: GitHub Actions, fork PR, secret, and token handling policy.
- `docs/source-basis.md`: authority hierarchy and source links.
- `docs/target-project-context.md`: how target projects should provide compact repo knowledge.
- `docs/vscode-codex.md`: how Codex should run local reviews from VSCode.
- `reviewers.config.json`: reviewer registry, order, triggers, fallback set.
- `prompts/`: source-specific reviewer instructions.
- `contexts/`: reviewer source summaries, compressed context, and rules.
- `src/reviewers.ts`: reviewer config loading, asset loading, and selection logic.
- `src/schemas.ts`: structured output schemas.
- `src/openaiReview.ts`: OpenAI Responses API integration.
- `src/review.ts`: main execution flow.
- `src/github.ts`: PR diff loading and PR comment upsert.
- `src/context.ts`: static repository context collection.

## Common Changes

- Add a reviewer: create `prompts/NN-name.md`, add `contexts/name/*`, register it in `reviewers.config.json`, update docs and final reviewer prompt if needed.
- Change review output shape: update `src/schemas.ts`, `src/openaiReview.ts`, `src/markdown.ts`, and final reviewer prompt together.
- Change trigger behavior: update `reviewers.config.json`, `src/reviewers.ts` if selector logic changes, `README.md`, and `docs/operation.md`.
- Change context collection: update `src/context.ts` and `docs/target-project-context.md`.

## Verification

- Run `npm run typecheck`.
- Run `git diff --check`.
- For trigger or no-diff behavior, smoke-test with an empty diff and `--no-post`.
