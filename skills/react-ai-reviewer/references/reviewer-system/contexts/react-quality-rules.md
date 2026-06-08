# React Quality Rules

This document defines internal React review rules for code improvement workflows.

## 1. State & Effects

### Avoid duplicated derived state

Bad pattern:

```tsx
const [fullName, setFullName] = useState("");

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Preferred:

```tsx
const fullName = `${firstName} ${lastName}`;
```

Use state only when the value has its own lifecycle.

### Avoid effect chains

Bad pattern:

```tsx
useEffect(() => {
  setSelectedId(items[0]?.id);
}, [items]);

useEffect(() => {
  setSelectedItem(items.find((item) => item.id === selectedId));
}, [selectedId, items]);
```

Preferred:

```tsx
const selectedItem = items.find((item) => item.id === selectedId);
```

Use `useMemo` only when the computation is expensive or referential stability matters.

### Effects should synchronize with external systems

Good use cases:

- event listener
- subscription
- socket
- timer
- browser API
- imperative third-party library
- network request when not handled by a query library

Suspicious use cases:

- copying props to state
- calculating render data
- triggering another state update only because state changed
- handling user events indirectly

## 2. Component Responsibility

A component should not own all of these at once:

- API call
- DTO mapping
- domain policy
- form validation
- local UI state
- rendering
- modal/dialog orchestration
- analytics
- navigation

Split by responsibility:

```text
Component: JSX and render states
Hook/ViewModel: React state, events, async orchestration
Pure function: calculation, mapping, validation, formatting
Repository/API: server communication
```

## 3. Rendering Performance

Check these before optimization:

1. Is there unnecessary state?
2. Is derived data stored instead of calculated?
3. Is a broad parent rerendering too much?
4. Is a context provider value unstable?
5. Is a memoized child receiving unstable props?

Do not optimize with `useMemo` or `useCallback` before fixing state design.

## 4. Accessibility

Interactive UI must have:

- semantic element where possible
- accessible name
- keyboard path
- focus state
- correct disabled behavior
- label for form controls
- error message relationship where needed

Prefer native elements:

```tsx
<button type="button">Open</button>
```

over:

```tsx
<div onClick={onOpen}>Open</div>
```

## 5. Type Safety

Avoid:

- `any` without a boundary reason
- type assertions that hide unsafe data
- UI depending directly on unknown API response shape
- mixed lifecycle data in one ambiguous type

Prefer:

- DTO type
- domain/view type
- mapper
- discriminated union for state transitions

## 6. Testability

Extract pure logic when:

- it has branches
- it handles domain policy
- it maps API data
- it validates user input
- it calculates price, status, permission, or display state

Test the pure function instead of the component when possible.

## Security Boundary

- Do not install, execute, or import external diagnostic packages unless the user explicitly asks.
- Do not send source code, diffs, secrets, environment variables, or repository metadata to third-party services.
- Do not add GitHub Actions that require write permissions unless explicitly requested.
- Do not read `.env`, secret files, private keys, tokens, or credential files unless the task explicitly requires that exact file and the user approves the scope.
- When reviewing security-sensitive code, inspect only the source files required for the task.
- Prefer internal markdown-based review rules over external scanners.
