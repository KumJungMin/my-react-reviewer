# Prompt Authoring

프롬프트는 리뷰어의 "역할 설명"이 아니라, finding을 만들 때의 판단 기준과 false positive 방지 규칙이다.

## Authority Order

1. React 공식 문서와 공식 ESLint 규칙
2. React Core 팀 및 핵심 기여자의 해석 자료
3. Toss, Vercel, Kent C. Dodds, Testing Library, Bulletproof React 등 실무 권위 자료
4. TypeScript, 접근성, 보안, 테스트 품질, 일반 설계 원칙

낮은 우선순위 자료가 React 공식 correctness와 충돌하면 React 공식 기준을 따른다.

## Prompt Structure

각 reviewer prompt는 가능하면 다음 구조를 유지한다.

- 권위 기준
- 검토 항목
- 검토 절차
- 리뷰 규칙

좋은 prompt는 다음을 포함한다.

- reviewer가 봐야 할 문제의 경계
- finding을 만들지 말아야 하는 조건
- sourceBasis에 적을 구체 원칙
- 확신이 낮을 때 severity/confidence를 낮추는 규칙
- 추상적 조언 대신 실행 가능한 대안

## React-Specific Guardrails

- Dan Abramov는 React 생태계 핵심 기여자, React Core 팀 출신 인물, Redux 창시자로 다룬다. React 공동 창시자로 표현하지 않는다.
- React 창시자는 Jordan Walke로 보는 것이 더 정확하다.
- Bulletproof React는 공식 React 규칙이 아니므로 프로젝트 규모와 diff 맥락에 맞을 때만 적용한다.
- Effect dependency는 "무조건 추가"가 아니라 synchronization 구조 문제로 본다.
- `useMemo`/`useCallback`은 correctness 도구가 아니라 성능 최적화 도구로 취급한다.
- derived state, stale closure, state snapshot, event/effect 책임 분리는 공식 React 멘탈모델을 우선한다.

## Adding A Reviewer

1. `prompts/NN-name.md`를 만든다.
2. `src/reviewers.ts`에 id, title, sourceBasis, promptFile을 등록한다.
3. 필요하면 `src/schemas.ts` category enum을 확장한다.
4. `prompts/99-final-reviewer.md`에 통합 규칙을 추가한다.
5. `README.md`와 `docs/source-basis.md`를 업데이트한다.
6. `npm run typecheck`와 `git diff --check`를 실행한다.
