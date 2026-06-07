# Business Logic Separation Rules

Load this reference when deciding where logic should live or when decomposing UI.

## Module Boundaries

`{Component}.tsx` should own:

- JSX structure and layout
- presentational child composition
- mapping hook state/actions into props
- simple conditional rendering for view states
- accessibility labels tied directly to markup

`use{Component}.tsx` should own:

- React state and derived state
- event handlers and UI control handlers
- async orchestration
- API or usecase invocation
- navigation and lifecycle effects
- validation flow and submit flow
- loading, disabled, error, and success state

`.core.ts` should own:

- pure business rules
- validation policies
- state-independent calculations
- data mapping and formatting
- predicates and reducers that do not need React

`.utils.ts` should own:

- generic helpers reusable outside the feature
- formatting or conversion helpers with no feature policy

Prefer `.core.ts` for feature-specific business decisions and `.utils.ts` for generic utilities.

## Cohesion And Coupling

Split when a function or component has more than one reason to change:

- UI layout changes
- business policy changes
- API orchestration changes
- validation changes
- formatting/mapping changes

Keep together when splitting would hide simple logic behind indirection. A two-line presentational fragment does not need a new component unless it has a real role boundary.

## UI Decomposition

Do not build one large JSX block. Extract top-level presentational components when there are clear semantic regions:

- header, guide, content, form, list, summary, footer, CTA, error state, empty state
- repeated homogeneous item rows
- expensive or frequently rerendering sections
- sections with independent accessibility or interaction responsibilities

Do not define React components inside another React component. Use module-scope presentational components for stable component identity.

Prefer local JSX constants only for small one-off fragments that are tightly coupled to the parent and do not deserve a component boundary.

## Performance And Rerendering

- Split components to reduce rerender blast radius when a section depends on frequently changing state.
- Pass only the state and callbacks each child needs.
- Avoid object/array props that are recreated each render unless they are trivial or local.
- Do not add `memo`, `useMemo`, or `useCallback` by default.
- Use memoization only for expensive computation, memoized children that benefit from stable props, or verified rerender pressure.

## Handler And Naming Rules

- External callback props: `on*`
- Local DOM event adapters: `handle*`
- Business actions/usecase functions: business verb names without `handle`
- Controlled state callbacks: `on[State]Change`
- Validation functions: `validate*`
- Mapping functions: `map*`, `to*`, or `from*`
- Predicate functions: `is*`, `has*`, `can*`, or `should*`

## Skeleton Examples

```ts
export function canSubmitTransfer(state: TransferFormState): boolean {
  // TODO: Return whether current form state passes required fields and domain blocking conditions.
}
```

```tsx
function TransferFormSection(props: TransferFormSectionProps) {
  // TODO: Render only transfer input controls and delegate events through props.
}
```

```tsx
export function useTransferPage() {
  // TODO: Coordinate form state, validation, submit request, loading/error state, and success navigation.
}
```
