# Business Feature Workflow

Load this reference for end-to-end React/TypeScript feature implementation.

## Phase 1: Requirement Analysis

Before editing, identify:

- user-visible behavior
- required inputs and outputs
- local state and derived state
- async operations, API calls, usecase calls, or navigation
- validation and error cases
- loading, disabled, empty, permission, and edge states
- files likely affected by existing repository conventions

For requirement-list implementation, first produce the `Requirement Breakdown Mode` output from `SKILL.md`: requirement summary, user behavior units, implementation units, file responsibility split, validation per unit, and recommended commit boundary. Use that breakdown as the skeleton-first implementation order.

If requirements are ambiguous and a risky assumption would shape the implementation, ask a concise question. Otherwise make a conservative assumption and state it in the final response.

## Phase 2: Skeleton First

Create the planned signatures before filling logic. This makes the responsibility split explicit.

Use TODO comments inside empty bodies:

```ts
export function validateTransferInput(input: TransferInput): TransferValidationResult {
  // TODO: Validate required fields, numeric limits, and domain-specific account rules.
}
```

```tsx
export function useTransferPage() {
  // TODO: Own form state, validation flow, submit orchestration, loading/error state, and navigation.
}
```

```tsx
export function TransferPage() {
  // TODO: Render page layout and compose presentational sections from hook state/actions.
}
```

After skeleton creation, implement the TODO bodies in the same turn unless the user asked for scaffolding only.

## Phase 3: Implementation Order

1. Define public/internal types close to their owning module.
2. Implement pure `.core.ts` or `.utils.ts` functions first.
3. Implement `use{Component}.tsx` orchestration around the pure functions.
4. Implement `{Component}.tsx` rendering as a thin composition layer.
5. Extract presentational sections if the JSX becomes role-heavy or repeated.
6. Add tests for pure logic and UI flow.
7. Run relevant validation.

## Phase 4: Verification

Prefer targeted validation:

- Unit tests for `.core.ts` and `.utils.ts`
- Component/page tests for UI flow and user interactions
- Typecheck when public types, hooks, or component props changed
- Build only when the change affects packaging, route-level integration, or cross-package behavior

Report commands exactly, including failures and skipped validation.

## Final Response Shape

Use concise sections:

- `Implemented`
- `Split`
- `Tests`
- `Validation`
- `Notes`
