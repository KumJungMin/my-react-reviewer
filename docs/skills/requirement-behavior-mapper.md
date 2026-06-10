# Requirement Behavior Mapper

## 역할

`requirement-behavior-mapper`는 요구사항 리스트를 구현 전에 유저 동작 단위로 정리하는 planning 스킬입니다. 코드 수정은 하지 않고, 누락된 상태, 예외, 권한, validation, loading/error case와 구현 전 질문을 드러냅니다.

## 언제 쓰나

- 요구사항이 길거나 여러 흐름이 섞여 있을 때
- 사용자 행동 단위로 그룹핑한 뒤 구현 단위를 잡고 싶을 때
- 구현 전에 누락된 상태, 예외, 권한, validation, loading/error case를 확인하고 싶을 때
- 기능 단위나 커밋 단위로 나눌 기준이 필요할 때
- 바로 구현하지 않고 기획 질문과 리스크를 먼저 정리하고 싶을 때

## 요청 템플릿

```text
$requirement-behavior-mapper로 아래 요구사항을 유저 동작 단위로 정리해줘.

요구사항:
- [R1]
- [R2]
- [R3]

출력:
- 요구사항 요약
- 유저 동작 단위
- 누락/위험 고려사항
- 구현 전 질문
- 구현 slice와 추천 커밋 경계
```

## 실제 동작

1. 요구사항의 ID, 라벨, 범위를 보존하면서 의미를 정규화합니다.
2. actor, trigger, state, action, outcome 기준으로 유저 동작 단위를 만듭니다.
3. 각 요구사항이 어떤 동작 단위에 매핑되는지 coverage를 확인합니다.
4. 중복, 충돌, hidden dependency, orphan requirement를 표시합니다.
5. 상태, 예외, 권한, validation, loading, empty, error, navigation, data consistency 관점에서 누락을 찾습니다.
6. 구현 slice와 추천 커밋 경계를 제안합니다.
7. 다음 단계가 `business-feature-builder` 구현인지, 제품 질문 정리인지, scope 축소인지 제안합니다.

## 기대 효과

| Before | After |
| --- | --- |
| 요구사항이 문서 순서대로만 나열되어 구현 순서가 모호하다. | 사용자 행동 단위와 구현 slice가 분리된다. |
| 구현 중에 validation, error, permission case가 뒤늦게 나온다. | 코드 수정 전에 누락/위험 항목이 드러난다. |
| 커밋 단위가 파일 기준으로 갈라진다. | 행동 단위와 검증 가능성 기준으로 커밋 경계를 잡는다. |

## 관련 파일

- `skills/requirement-behavior-mapper/SKILL.md`
- `skills/requirement-behavior-mapper/references/context.md`
- `skills/requirement-behavior-mapper/references/behavior-grouping-rules.md`
- `skills/requirement-behavior-mapper/references/requirement-risk-checklist.md`
- `skills/requirement-behavior-mapper/references/output-template.md`
