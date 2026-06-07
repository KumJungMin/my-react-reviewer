# GDS Component Architecture

Load this reference when designing or changing a design-system component's architecture, public API, slots, context, ownerState, or class contract.

## Responsibility Split

Use this target shape, adapted to the repository's existing naming:

```txt
packages/design-system/src/components/component-name/
├─ Component.tsx
├─ useComponent.ts              # only for interactive or behavior-heavy components
├─ ComponentContext.tsx         # only for compound/group state
├─ Component.types.ts
├─ component-core.ts            # pure calculations and policy
├─ component.css.ts             # Vanilla Extract styles
├─ componentClasses.ts          # only when stable external slot/class contract is needed
├─ Component.test.tsx           # when a matching test pattern exists or behavior is non-trivial
└─ index.ts
```

Current GDS folders are kebab-case and use files such as `Button.tsx`, `Button.types.ts`, `button-core.ts`, `button.css.ts`, and `index.ts`. Preserve that style unless a task explicitly asks for a different convention.

## File Responsibilities

- `Component.tsx`: JSX structure, slot placement, `forwardRef`, minimal rendering decisions, and applying returned prop getters.
- `useComponent.ts`: props normalization, state derivation, context merging, event handler composition, accessibility behavior, prop getters, and mapping ownerState to class names.
- `component.css.ts`: Vanilla Extract `style`, `styleVariants`, `recipe`, compound variants, slot styles, and `data-*` state selectors.
- `componentClasses.ts`: stable slot/class contract for external override targets. Do not add it for every component; add it when slots must be externally addressable or tests/docs need stable class keys.
- `Component.types.ts`: public prop types and exported aliases. Internal hook props can live here when they are small and useful.
- `ComponentContext.tsx`: group or compound component shared state. Do not create context for values used by only one component.
- `index.ts`: public API boundary. Export only intended public components, types, and stable class/slot contracts.

## Public API Rules

- Boolean state props use `is*` or `has*`: `isDisabled`, `isInvalid`, `isLoading`, `isRounded`, `hasNotification`.
- Controlled value changes use `onValueChange(value, event?)`; keep native `onChange(event)` only when consumers need the DOM event.
- Controlled open state uses `open`, `defaultOpen`, and `onOpenChange(open)`.
- Horizontal slots use `startContent` and `endContent`; vertical slots use `topContent` and `bottomContent`.
- Styling uses `variant` first. Use `color`, `tone`, `size`, `surface`, or `radius` only when they describe separate concepts.
- Legacy aliases may remain for migration, but canonical props win when both are passed. New examples and docs should use only canonical names.
- Domain fields such as `AddressField` and `IdDocumentField` may be public GDS APIs when they clarify product intent. Keep shared primitives generic.

## When To Split

Start simple. Static display components may only need `Component.tsx`, `Component.types.ts`, `component.css.ts`, and `index.ts`.

Create `useComponent.ts` when the component has controlled/uncontrolled state, keyboard or pointer interaction, focus management, accessibility attributes, context merging, event handler composition, prop getters, or derived state with multiple inputs.

Create `component-core.ts` when logic is pure policy, formatting, normalization, or predicates that do not need React runtime behavior.

Create `ComponentContext.tsx` only for coordinated components such as ButtonGroup/Button, Tabs/Tab/TabPanel, RadioGroup/Radio, Accordion/AccordionItem, Select/SelectTrigger/SelectList/SelectItem.

## Slot And Owner State Model

When a component has multiple visual parts, name slots explicitly:

```txt
Button: root, startContent, content, spinner, endContent
Input: root, label, inputWrapper, input, clearButton, helperText, errorMessage
Modal: overlay, wrapper, content, header, body, footer, closeButton
```

Each meaningful slot should have a clear JSX location, a style entry, and a class contract only if external override is expected.

Use an internal ownerState-like object when style or behavior depends on several props:

```ts
const ownerState = {
  variant,
  color,
  size,
  radius,
  isDisabled,
  isLoading,
};
```

Use ownerState to calculate recipe variants, derive `data-*` attributes, compose classes, and keep prop getters consistent. Do not expose ownerState as public API.

## Styling Architecture

Use semantic/component design tokens before raw values. Component styles should depend on tokens from the repository's token system, not literal colors.

Use `recipe` from `@vanilla-extract/recipes` when variants multiply across dimensions such as `variant x size x color x radius x state`. Use simpler `style` or `styleVariants` when the component does not need recipe complexity.
