# Behavior Grouping Rules

Group by how the user experiences the feature, not by source document order or file location.

## Unit Shape

Each behavior unit should have:

- actor: who performs or receives the behavior
- trigger: what starts the behavior
- context/state: what must already be true
- action: what the user or system does
- outcome: what visibly or observably changes
- dependencies: data, permission, API, navigation, or external service needs

## Grouping Heuristics

- Put requirements together when they share the same actor, trigger, and outcome.
- Split requirements when they have different validation rules, error paths, permissions, async dependencies, or navigation outcomes.
- Split setup and completion when the user can stop between them or when different state must be persisted.
- Keep system-only side effects attached to the user behavior that causes them.
- Mark cross-cutting requirements such as analytics, logging, accessibility, and localization as acceptance criteria unless they change the user flow.

## Coverage Checks

- Every original requirement should map to at least one behavior unit.
- A behavior unit with no requirement source should be labeled as an assumption.
- Conflicting requirements should be called out before implementation slicing.
- Duplicates should be merged only when the observable behavior is truly the same.
