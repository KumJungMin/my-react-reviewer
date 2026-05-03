# Source Basis

이 프로젝트는 React 코드 리뷰를 하나의 거대한 프롬프트로 처리하지 않고, 권위 있는 자료별 전문 리뷰어를 순차 실행한 뒤 최종 통합 리뷰어가 중복 제거와 심각도 조정을 수행하도록 설계했다.

## 출처 우선순위

1. React 공식 문서와 React 공식 ESLint 규칙
   - Rules of React
   - Components and Hooks must be pure
   - Rules of Hooks
   - useEffect
   - You Might Not Need an Effect
   - State as a Snapshot
   - Queueing a Series of State Updates
   - Separating Events from Effects
   - React calls Components and Hooks
   - eslint-plugin-react-hooks

2. React Core 팀 및 핵심 기여자의 해석 자료
   - Dan Abramov: Writing Resilient Components
   - Dan Abramov: useEffect synchronization 관점
   - Brian Vaughn: derived state anti-pattern

3. 국내외 실무 권위 자료
   - Toss Frontend Fundamentals
   - Toss Tech / Toss SLASH
   - Vercel React Best Practices
   - Kent C. Dodds / Testing Library
   - Bulletproof React

4. 일반 소프트웨어 설계 / 클린 코드 권위 자료
   - Robert C. Martin / Object Mentor: SRP, OCP, LSP, ISP, DIP
   - Martin Fowler: Refactoring, code smells, behavior-preserving refactoring
   - Google Engineering Practices: design, complexity, code health, over-engineering
   - GoF Design Patterns: 반복 설계 문제의 적용 조건과 trade-off
   - Microsoft Patterns in Practice: cohesion, coupling, Law of Demeter, Tell Don't Ask

5. 프로젝트별 명시적 요구사항
   - package.json
   - tsconfig.json
   - eslint config
   - Next/Vite config
   - PR diff

## 자료별 리뷰어

| 리뷰어 ID | 역할 |
|---|---|
| `react-official` | React 공식 문서 기준 correctness, purity, state, Effect 검토 |
| `react-hooks-eslint` | Hook 규칙, exhaustive-deps, stale closure, React Compiler 친화성 검토 |
| `dan-abramov` | 데이터 흐름, resilient components, stale props/state, singleton 가정 검토 |
| `toss` | 수정 용이성, 응집도, 단일 책임, 추상화 레벨 일관성 검토 |
| `vercel-performance` | async waterfall, bundle size, data fetching boundary, re-render 최적화 검토 |
| `kent-testing` | 구현 세부사항 테스트 여부, 사용자 행동 중심 테스트 검토 |
| `bulletproof-react` | feature boundary, API/domain/UI layer, architecture 확장성 검토 |
| `clean-code-design` | 디자인 패턴, 응집도/결합도, SOLID, code smell, 과설계 검토 |

## React / Hooks 자료 근거

- [React - Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure): render purity, idempotency, side effects outside render, immutability
- [React - React calls Components and Hooks](https://react.dev/reference/rules/react-calls-components-and-hooks): component direct call 금지, Hook을 값처럼 전달하거나 동적으로 조합하지 않는 모델
- [React - Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks): Hook top-level 호출 규칙과 React `use` 예외
- [React - useEffect](https://react.dev/reference/react/useEffect): external system synchronization, cleanup, dependency troubleshooting
- [React - You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect): unnecessary Effect 제거, derived state와 event handler 분리
- [React - Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies): dependency는 코드와 일치해야 하며, 제거하려면 코드를 구조적으로 바꿔야 함
- [React - Separating Events from Effects](https://react.dev/learn/separating-events-from-effects): event handler는 non-reactive interaction logic, Effect는 reactive synchronization logic
- [React - useEffectEvent](https://react.dev/reference/react/useEffectEvent): Effect 내부의 non-reactive event 분리, dependency 회피 수단으로 쓰면 안 됨
- [React - Thinking in React](https://react.dev/learn/thinking-in-react): 최소한의 완전한 state 표현, state 위치, inverse data flow
- [React - State as a Snapshot](https://react.dev/learn/state-as-a-snapshot): render별 props/state/event handler snapshot, setter 이후 현재 render 값은 즉시 바뀌지 않음
- [React - Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates): state update queue, batching, functional updater
- [React - Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure): related/contradictory/redundant/duplicated/nested state 기준
- [React - Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state): tree position과 key에 따른 state 보존/초기화
- [React - eslint-plugin-react-hooks](https://react.dev/reference/eslint-plugin-react-hooks): recommended lint rules, React Compiler diagnostics
- [React - exhaustive-deps](https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-deps): stale closure와 dependency 구조 개선
- [React - rules-of-hooks lint](https://react.dev/reference/eslint-plugin-react-hooks/lints/rules-of-hooks): Hook 호출 순서와 `use` hook 예외

## React 해석 / 유지보수성 자료 근거

- [Dan Abramov - Writing Resilient Components](https://overreacted.io/writing-resilient-components/): data flow, render resilience, singleton assumption, local state isolation
- [Dan Abramov - A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/): render별 closure, stale value, synchronization mental model
- [Brian Vaughn - You Probably Don't Need Derived State](https://legacy.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html): controlled/uncontrolled source of truth 혼합, props mirroring anti-pattern
- [Toss Frontend Fundamentals - Four Principles of Writing Good Code](https://frontend-fundamentals.com/code-quality/en/code/): readability, predictability, cohesion, coupling
- [Toss Tech - 선언적인 코드 작성하기](https://toss.tech/article/frontend-declarative-code): 선언적 코드와 추상화 레벨, 수정하기 쉬운 코드
- [Toss Frontend Fundamentals - Separating Code That Doesn't Run Together](https://frontend-fundamentals.com/code-quality/en/code/examples/submit-button.html): 동시에 실행되지 않는 코드 분리
- [Toss Frontend Fundamentals - Keeping Files That Are Modified Together in the Same Directory](https://frontend-fundamentals.com/code-quality/en/code/examples/code-directory.html): 함께 수정되는 파일 배치
- [Toss Frontend Fundamentals - Managing Responsibilities Individually](https://frontend-fundamentals.com/code-quality/en/code/examples/use-page-state-coupling.html): 책임 분리와 결합도 축소

## 성능 / 테스트 / 아키텍처 자료 근거

- [Vercel - Introducing React Best Practices](https://vercel.com/blog/introducing-react-best-practices): waterfall, bundle size, server/client fetching, re-render 우선순위
- [Next.js - Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data): Server Components, Client Components, streaming, parallel/sequential data fetching
- [Next.js - Caching](https://nextjs.org/docs/app/deep-dive/caching): request memoization, Data Cache, Router Cache
- [Testing Library - Guiding Principles](https://testing-library.com/docs/guiding-principles/): 사용자 사용 방식과 닮은 테스트
- [Testing Library - About Queries](https://testing-library.com/docs/queries/about/): query priority, `getByRole`, `getByLabelText`, `getByTestId`
- [Testing Library - user-event](https://testing-library.com/docs/user-event/intro/): 실제 사용자 interaction에 가까운 이벤트
- [Kent C. Dodds - Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details): implementation detail test의 false positive/false negative 위험
- [Bulletproof React](https://github.com/alan2207/bulletproof-react): production-ready React application architecture principles
- [Bulletproof React - Project Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md): feature-based modules, shared/features/app dependency direction

## 클린 코드 / 설계 자료 근거

- [Object Mentor - Object Oriented Design Principles](https://objectmentor.com/mentoring/OOPrinciples): SRP, OCP, LSP, ISP, DIP 등 Robert C. Martin 계열 설계 원칙
- [Martin Fowler - Refactoring](https://martinfowler.com/books/refactoring.html): behavior-preserving refactoring, code smells, 변경 용이성
- [Google Engineering Practices - What to look for in a code review](https://google.github.io/eng-practices/review/reviewer/looking-for.html): design, complexity, tests, naming, context, code health
- [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610): GoF 디자인 패턴의 적용 조건과 trade-off
- [Microsoft Learn - Cohesion And Coupling](https://learn.microsoft.com/en-us/archive/msdn-magazine/2008/october/patterns-in-practice-cohesion-and-coupling): cohesion, coupling, Law of Demeter, Tell Don't Ask

## 중요한 정정

Dan Abramov는 React 생태계의 핵심 기여자이자 React Core 팀 출신 인물로 다루지만, React 창시자로 표기하지 않는다. React 창시자 기준은 Jordan Walke를 별도 축으로 둔다.
