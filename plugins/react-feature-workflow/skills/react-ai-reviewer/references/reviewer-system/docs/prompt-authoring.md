# Prompt Authoring

이 저장소에서 reviewer를 추가하거나 강화할 때는 prompt와 context의 책임을 분리해야 한다.

## Separation Rule

- `prompts/*.md`
  - reviewer 역할
  - review perspective
  - 응답 방식
  - severity 판단 방식
  - 무엇을 무시할지
  - 코멘트를 어떻게 표현할지
- `contexts/*/source.md`
  - 사람이 보는 출처 요약
- `contexts/*/compressed.md`
  - reviewer가 참고할 압축 source knowledge
- `contexts/*/rules.json`
  - focus, ignore, severity hint, editor rule

긴 source material은 prompt에 반복해서 넣지 말고 `compressed.md`로 옮긴다.

## Authority Order

1. React 공식 문서와 공식 ESLint 규칙
2. React Core 팀 및 핵심 기여자의 해석 자료
3. Toss, Vercel, Kent C. Dodds, Testing Library, Bulletproof React 등 실무 권위 자료
4. 일반 설계 원칙과 리팩터링 자료

낮은 우선순위 자료가 React 공식 correctness와 충돌하면 React 공식 기준을 따른다.

## Session Phase Rule

모든 reviewer prompt는 다음 두 단계를 전제로 해야 한다.

1. 리뷰 단계: 개선 포인트를 설명하고 사용자가 무엇을 반영할지 고를 수 있게 돕는다.
2. 반영 단계: 사용자가 선택한 항목만 수정한다.

prompt가 첫 단계에서 바로 리팩터링을 지시하면 안 된다.

## Prompt Structure

각 reviewer prompt는 가능하면 다음 구조를 유지한다.

- 역할
- 응답 방식
- 무시할 것
- 판단 규칙

좋은 prompt는 다음을 포함한다.

- reviewer가 봐야 할 문제의 경계
- severity를 언제 올리고 언제 낮출지
- 추상적 조언 대신 실행 가능한 대안
- 다른 reviewer의 책임과 구분되는 범위
- "설명 먼저, 수정은 요청 후" 원칙
- 각 포인트에 담아야 할 최소 정보: 파일, 이유, 영향, 수정 방향, 확신도
- final reviewer가 사용자에게 실제 review basis와 reviewer lens를 드러내는 방식
- React나 framework가 꼭 필요하지 않은 로직은 가능한 한 순수 `.ts`로 둘 수 있는지 검토하되, 실질적 이득이 있을 때만 제안한다는 기준

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

## Feedback Loop

리뷰 품질을 높이려면 사용자 피드백을 prompt 개선으로 연결해야 한다.

예:

- 리뷰가 너무 장황했다면 final reviewer prompt에서 출력 밀도를 낮춘다.
- Hooks 지적이 약했다면 `react-hooks-eslint` prompt와 rules를 강화한다.
- 테스트 리뷰가 PR 범위를 너무 벗어났다면 `kent-testing` prompt의 ignore 규칙을 조정한다.
- 사용자가 "어떤 reviewer 관점이 각 섹션에 반영됐는지 모르겠다"고 하면 final reviewer prompt에 review basis, reviewer lenses used, section focus를 더 분명히 드러내도록 반영한다.
- 사용자가 "로직은 순수 `.ts`로 두고 React는 얇은 래퍼로 남겨 달라"는 선호를 반복하면 `maintainability`와 `clean-code-design` prompt에 그 원칙을 추가하되, final reviewer에는 과잉 분리 제안을 걸러내는 규칙도 함께 넣는다.

피드백을 다음 위치 중 하나에 남긴다.

- 해당 reviewer의 `prompts/*.md`
- `docs/prompt-authoring.md`
- 대상 프로젝트의 `.react-ai-reviewer/prompt-feedback.md`

## Adding A Reviewer

1. `prompts/NN-name.md`를 만든다.
2. `contexts/name/source.md`, `compressed.md`, `rules.json`을 만든다.
3. `reviewers.config.json`에 id, path, order, trigger를 등록한다.
4. 필요하면 `prompts/99-final-reviewer.md` 또는 `contexts/final-reviewer/*`를 조정한다.
5. `README.md`와 관련 docs를 업데이트한다.
6. `pnpm --filter react-ai-reviewer typecheck`와 `git diff --check`를 실행한다.
