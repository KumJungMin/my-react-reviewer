# Page / Design-System Layering Source Context

## Service Page Module

| File or folder | Responsibility | Good fit | Avoid |
| --- | --- | --- | --- |
| `{PageName}Page.tsx` | External page entry and View boundary | Receive page props, call `use{PageName}`, pass VM to View | Detailed state management, business rules, validation policy |
| `use{PageName}.ts` | Representative VM hook | Compose internal hooks, connect page props, call external callbacks, create view props | JSX, direct pure business rules |
| `{PageName}.utils.ts` | Page-local pure utilities | Pure functions without React API | React API, general utilities, external API-dependent functions |
| `hooks/` | Internal stateful screen hooks | Input field flow, agreement state, verification code, timer state | Shared pure functions, public exported types, View JSX |
| usecase package | Pure usecase layer when real feature/API policy exists | sanitize, validate, format, payload builder after API integration needs are clear | Add now without real API/usecase pressure |
| `{PageName}.types.ts` | Public/shared type boundary | Page props, submission type, shared VM type | Private hook-only type sprawl |
| `{PageName}.css.ts` | Visual representation | Layout, slot classes, vanilla-extract styles | Business state conditions, validation policy, usecase logic |
| `index.ts` | External export boundary | Page component and public type exports | Internal View/hook/utils exports |

## Design-System Component Module

- Component UI should stay reusable and framework-visible behavior should be expressed by props/events.
- Component-specific pure logic belongs in `{component}-core.ts`.
- Context providers and custom hooks should own React context, lifecycle, refs, timers, and event wiring only.
- Page/domain-specific names should not leak into generic design-system primitives. If a domain field is needed, build it from primitives as a separate component.
- Domain fields such as `AddressField` and `IdDocumentField` can remain part of the design-system public API when they clarify product intent. Keep shared primitives such as `TextField`, `SplitTextField`, and `SelectBox` generic.
- Component `index.ts` and the package root export should expose public components and public types only. Do not export internal views, hooks, utils, or core helpers unless they are intentionally public.
