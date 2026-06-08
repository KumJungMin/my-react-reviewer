# React Quality Lens

Use this internal reviewer lens when reviewing React/TypeScript code for correctness, maintainability, state/effect safety, rendering performance, accessibility, type safety, and testability.

This lens does not depend on external scanners, npm packages, GitHub Actions, or third-party diagnostic tools. It is a reasoning checklist for Codex-based review and refactoring.

## Review Priority

Review issues in this order:

1. Correctness
2. Hooks and effects
3. State model
4. Component responsibility
5. Rendering performance
6. Accessibility
7. Type safety
8. Testability
9. Naming and readability

## Output Severity

Classify findings into:

- Must fix: likely bug, broken behavior, unsafe state/effect, accessibility blocker, or type unsafety that can break runtime
- Should fix: maintainability issue, testability issue, avoidable rerender risk, or unclear responsibility boundary
- Suggestions: naming, minor extraction, optional abstraction, or future improvement with clear benefit
- Open questions: cannot decide without product, data, or domain context

## Must Fix Criteria

Flag as Must fix when:

- React hooks are called conditionally or inside loops/nested functions.
- State objects or arrays are mutated directly.
- Derived state can become stale because it duplicates props, query data, or another state.
- `useEffect` creates chained state updates without a clear synchronization purpose.
- An async effect can update state after unmount without cleanup or cancellation.
- A timer, subscription, event listener, observer, or socket has no cleanup.
- Hydration-sensitive values render directly in SSR paths, such as `Date.now()`, `Math.random()`, or locale-dependent values.
- Interactive elements are built with non-interactive tags without keyboard support.
- User-provided HTML is rendered without a clear sanitization boundary.

## Should Fix Criteria

Flag as Should fix when:

- A component owns too many responsibilities at once: rendering, data fetching, validation, mapping, formatting, domain policy, async orchestration, analytics, or navigation.
- A hook contains pure business logic that can be extracted into a testable `.ts` function.
- Multiple `useState` values represent one state transition model and are frequently updated together.
- A memoized child receives unstable object, array, or function props that defeat memoization.
- A context provider value is recreated too broadly and can trigger unnecessary subtree rerenders.
- Form validation timing harms UX, such as showing errors while the user is still typing.
- API DTO shape leaks deeply into UI components.
- Presentation components import API, repository, or domain policy directly.

## Suggestions Criteria

Suggest only when the benefit is clear:

- Extract calculation, formatting, mapping, validation, and policy into pure functions.
- Split components by responsibility, not by file length alone.
- Replace scattered booleans with a reducer or state machine only when state transitions are hard to follow.
- Add focused tests for extracted pure logic.
- Improve event handler naming when intent is unclear.
- Improve type names when data lifecycle is ambiguous.

## Noise Control

Do not over-review.

- Do not recommend `useMemo` or `useCallback` by default.
- Do not flag inline handlers unless they break memoization, readability, or testability.
- Do not recommend folder restructuring unless the current boundary causes real maintenance cost.
- Do not demand abstraction for one-off code.
- Do not split files only because they are long.
- Do not suggest generic tests without naming the behavior to test.
- Do not rewrite working business logic unless there is a clear risk or improvement.
- Prefer small, behavior-preserving improvements.

## Review Style

For each finding, include:

- severity
- file or function
- problem
- why it matters
- suggested fix
- expected impact

Prefer this shape:

```md
### Must fix

#### 1. Direct state mutation in `updateItems`

- Problem:
- Why it matters:
- Suggested fix:
- Expected impact:
```
