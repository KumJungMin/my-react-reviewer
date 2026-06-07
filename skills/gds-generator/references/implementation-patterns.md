# GDS Implementation Patterns

Load this reference when implementing React code, hooks, prop getters, Vanilla Extract styles, class contracts, or exports.

## Thin Component Pattern

The component renders slots and applies prop getters returned by its hook:

```tsx
import { forwardRef } from 'react';
import { useButton } from './useButton';
import type { ButtonProps } from './Button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    Component,
    children,
    startContent,
    endContent,
    spinner,
    isLoading,
    getButtonProps,
    getStartContentProps,
    getEndContentProps,
    getSpinnerProps,
    getContentProps,
  } = useButton(props, ref);

  return (
    <Component {...getButtonProps()}>
      {startContent ? <span {...getStartContentProps()}>{startContent}</span> : null}
      {isLoading ? <span {...getSpinnerProps()}>{spinner}</span> : null}
      <span {...getContentProps()}>{children}</span>
      {endContent ? <span {...getEndContentProps()}>{endContent}</span> : null}
    </Component>
  );
});

Button.displayName = 'Button';
```

Keep complex state derivation, event orchestration, accessibility wiring, and style variant calculation out of this file.

## Hook And Prop Getter Pattern

The hook owns behavior and returns values needed by the renderer:

```tsx
import { cx } from '../../internal/cx';
import * as styles from './button.css';
import type { ButtonProps } from './Button.types';

export function useButton(props: ButtonProps, ref: React.Ref<HTMLButtonElement>) {
  const {
    children,
    className,
    disabled,
    isDisabled = false,
    isLoading = false,
    loading = false,
    startContent,
    endContent,
    spinner,
    type = 'button',
    onClick,
    variant = 'primary',
    size = 'md',
    radius = 'md',
    ...domProps
  } = props;

  const resolvedLoading = isLoading || loading;
  const resolvedDisabled = disabled || isDisabled || resolvedLoading;
  const ownerState = { variant, size, radius, isDisabled: resolvedDisabled, isLoading: resolvedLoading };

  const rootClassName = cx(
    styles.root,
    styles.variants[ownerState.variant],
    styles.sizes[ownerState.size],
    styles.radius[ownerState.radius],
    className
  );

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (resolvedDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  }

  const getButtonProps = () => ({
    ...domProps,
    ref,
    className: rootClassName,
    disabled: resolvedDisabled,
    'aria-busy': resolvedLoading || undefined,
    'data-disabled': resolvedDisabled ? '' : undefined,
    'data-loading': resolvedLoading ? '' : undefined,
    onClick: handleClick,
    type,
  });

  return {
    Component: 'button' as const,
    children,
    startContent,
    endContent,
    spinner,
    isLoading: resolvedLoading,
    isDisabled: resolvedDisabled,
    getButtonProps,
    getStartContentProps: () => ({ className: styles.startContent, 'data-slot': 'start-content' }),
    getEndContentProps: () => ({ className: styles.endContent, 'data-slot': 'end-content' }),
    getSpinnerProps: () => ({ className: styles.spinner, 'data-slot': 'spinner', 'aria-hidden': true }),
    getContentProps: () => ({ className: styles.content, 'data-slot': 'content' }),
  };
}
```

Adapt the getter names to actual DOM parts. A prop getter should merge user props, internal props, handlers, refs, accessibility attributes, `data-*` state attributes, and class names for that part.

## Vanilla Extract Pattern

Use `style`, `styleVariants`, or `recipe` from Vanilla Extract. Prefer existing token imports in the repository.

```ts
import { style, styleVariants } from '@vanilla-extract/css';

export const root = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 0,
  userSelect: 'none',
  whiteSpace: 'nowrap',
  selectors: {
    '&[data-disabled]': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
    '&[data-loading]': {
      pointerEvents: 'none',
    },
  },
});

export const variants = styleVariants({
  primary: {},
  secondary: {},
  subtle: {},
});

export const sizes = styleVariants({
  sm: {},
  md: {},
  lg: {},
});

export const startContent = style({ display: 'inline-flex' });
export const content = style({ display: 'inline-flex' });
export const endContent = style({ display: 'inline-flex' });
export const spinner = style({ display: 'inline-flex' });
```

Use `@vanilla-extract/recipes` only when variant combinations need recipe semantics. Do not introduce a recipe for a simple one-axis style map.

## Class Contract Pattern

Only add `componentClasses.ts` when external override targets or stable slot class keys are required:

```ts
import * as styles from './button.css';

export const buttonClasses = {
  root: styles.root,
  startContent: styles.startContent,
  content: styles.content,
  spinner: styles.spinner,
  endContent: styles.endContent,
};

export const buttonSlots = {
  root: 'root',
  startContent: 'startContent',
  content: 'content',
  spinner: 'spinner',
  endContent: 'endContent',
} as const;

export type ButtonClassKey = keyof typeof buttonClasses;
```

If the current component only needs internal styles, exporting from `component.css.ts` is enough.

## Types And Exports

Keep public prop types semantic and stable:

```ts
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonRadius = 'none' | 'md' | 'lg' | 'round';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  isDisabled?: boolean;
  isLoading?: boolean;
  loading?: boolean;
  startContent?: ReactNode;
  endContent?: ReactNode;
  spinner?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  radius?: ButtonRadius;
}
```

`index.ts` should export only intended public APIs:

```ts
export { Button } from './Button';
export type { ButtonProps, ButtonRadius, ButtonSize, ButtonVariant } from './Button.types';
```

Do not export internal hooks unless the design system intentionally supports hook-level composition.
