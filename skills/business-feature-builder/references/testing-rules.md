# Business Feature Testing Rules

Load this reference when creating or updating tests for business features.

## Test Selection

Use the smallest test type that proves the behavior:

- Pure business rules, validation, mapping, and formatting: unit tests around `.core.ts` or `.utils.ts`
- Hook orchestration: hook tests only when the repository already has a pattern or component tests would be too indirect
- User-visible behavior: component/page tests with React Testing Library or the repository's existing test stack
- Cross-package packaging or route integration: build/typecheck plus targeted tests

Follow nearby test file names, imports, setup helpers, and mocking style.

## Coverage Targets

Derive tests from requirements. Consider:

- normal success flow
- required field validation
- invalid input and boundary values
- error/failure response
- loading state
- disabled state
- empty state
- permission or unavailable state
- retry/cancel behavior
- navigation or callback after success
- edge cases from domain rules

Do not test implementation details that should remain private.

## Test Structure

For pure logic:

```ts
describe('validateTransferInput', () => {
  it('returns valid for complete input', () => {
    // arrange
    // act
    // assert
  });

  it('returns an error for missing amount', () => {
    // arrange
    // act
    // assert
  });
});
```

For UI flow:

```tsx
it('submits after valid input and moves to success state', async () => {
  // render page/component with mocked dependency
  // fill fields
  // click submit
  // assert loading/disabled state if meaningful
  // await success UI or callback/navigation
});
```

## Mocking Rules

- Mock external APIs, navigation, timers, and storage boundaries.
- Do not mock pure functions under test.
- Prefer dependency injection when nearby code already follows it.
- Keep mocks close to the test and reset them between tests.

## Validation Reporting

Report:

- test files added or updated
- scenarios covered
- command run
- pass/fail result
- skipped cases and why

If tests cannot run due to environment or missing dependencies, say exactly what blocked them.
