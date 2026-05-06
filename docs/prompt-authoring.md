# Prompt Authoring

이 저장소에서 reviewer를 추가하거나 강화할 때는 prompt와 context의 책임을 분리해야 한다.

## Separation Rule

- `prompts/*.md`
  - reviewer 역할
  - review perspective
  - output format expectations
  - severity 판단 방식
  - 무엇을 무시할지
  - 코멘트를 어떻게 표현할지
- `contexts/*/source.md`
  - 사람이 보는 출처 요약
- `contexts/*/compressed.md`
  - 모델에 넣을 압축 source knowledge
- `contexts/*/rules.json`
  - focus, ignore, severity hint, editor rule

긴 source material은 prompt에 반복해서 넣지 말고 `compressed.md`로 옮긴다.

## Authority Order

1. React 공식 문서와 공식 ESLint 규칙
2. React Core 팀 및 핵심 기여자의 해석 자료
3. Toss, Vercel, Kent C. Dodds, Testing Library, Bulletproof React 등 실무 권위 자료
4. 일반 설계 원칙과 리팩터링 자료

낮은 우선순위 자료가 React 공식 correctness와 충돌하면 React 공식 기준을 따른다.

## Prompt Structure

각 reviewer prompt는 가능하면 다음 구조를 유지한다.

- 역할
- 출력 기준
- 무시할 것
- 판단 규칙

좋은 prompt는 다음을 포함한다.

- reviewer가 봐야 할 문제의 경계
- severity를 언제 올리고 언제 낮출지
- 추상적 조언 대신 실행 가능한 대안
- 다른 reviewer의 책임과 구분되는 범위

## Context Structure

`compressed.md`는 토큰을 아끼면서도 reviewer가 실제 판단에 필요한 멘탈모델을 제공해야 한다.

좋은 `rules.json` 예:

```json
{
  "focus": ["effect synchronization", "state source of truth"],
  "ignore": ["style-only comments"],
  "severityHints": {
    "high": ["clear user-visible bug"],
    "low": ["limited impact suggestion"]
  }
}
```

## Trigger Authoring

`reviewers.config.json`에서 각 reviewer는 trigger를 가진다.

- `filePatterns`: changed file path와 매치되는 glob
- `keywords`: diff 문자열에 포함되면 매치되는 키워드
- `excludeFilePatterns`: reviewer가 보면 안 되는 파일 패턴

원칙:

- 너무 넓은 trigger를 넣어 다시 "모든 reviewer 실행" 상태로 돌아가지 않는다.
- test-only reviewer는 test file pattern을 중심으로 잡는다.
- architecture reviewer는 폴더명보다 boundary가 드러나는 경로와 키워드를 우선한다.
- final reviewer는 trigger가 없고 항상 포함된다.

## Adding A Reviewer

1. `prompts/NN-name.md`를 만든다.
2. `contexts/name/source.md`, `compressed.md`, `rules.json`을 만든다.
3. `reviewers.config.json`에 id, path, order, trigger를 등록한다.
4. 필요하면 `src/schemas.ts` category enum을 확장한다.
5. 필요하면 `prompts/99-final-reviewer.md` 또는 `contexts/final-reviewer/*`를 조정한다.
6. `README.md`와 관련 docs를 업데이트한다.
7. `npm run typecheck`와 `git diff --check`를 실행한다.
