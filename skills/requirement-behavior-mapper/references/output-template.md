# Output Template

Use this structure for normal requirement mapping. Keep it concise and adapt labels to the user's language.

The first sections are for the user to understand the scenario. The `Codex Skill Handoff` block is for the next implementation skill to consume.

## Requirement Summary

Write this in user-friendly language:

- What will happen:
- What the user will see:
- What is already decided:
- What still needs confirmation:
- Out of scope:

## User Behavior Units

Use plain product language. Mention IDs only for traceability.

| Unit | User scenario | Related requirements | User-visible result |
| --- | --- | --- | --- |
| B1 |  |  |  |

## Requirement Coverage

Explain coverage in a way a user can verify. Avoid implementation details unless needed.

| Requirement | Where it appears | User-friendly note |
| --- | --- | --- |
| R1 | B1 |  |

## Missing Or Risky Considerations

| Area | Consideration | Why it matters | Suggested handling |
| --- | --- | --- | --- |
| Validation |  |  |  |

## 구현 전 확인 및 답변

List only questions that require a user decision before implementation. Use the same question IDs in `codex_handoff.blocking_questions`.

If there are implementation-blocking or product-decision questions, make this section copy-ready:

```text
답변:
1. Q1. <question>
   - 답:
2. Q2. <question>
   - 답:

위 질문에 대한 답변을 반영해서 Codex Skill Handoff를 만들어줘.

질문에 답변하지 않고 현재 가정으로 진행할 거라면 구현 요청 템플릿을 만들어줘.
```

If no user decision is required before implementation, write:

```text
답변:
- 구현 전 필수로 답변할 질문 없음

구현 요청 템플릿을 만들어줘.
```

## 구현 Slice

Write this in Korean and keep it user-readable. Detailed dependencies, validation, and commit boundaries belong in `Codex Skill Handoff`.

| 구현 단위 | 관련 동작 | 구현할 내용 | 나누는 이유 |
| --- | --- | --- | --- |
| S1 | B1 |  |  |

## Recommended Next Step

State whether to continue with `business-feature-builder`, ask product questions first, or reduce scope.

## Codex Skill Handoff

Always include this block before the user answer template. Keep it compact and stable so another Codex skill can continue from it.

이 정보를 구현 시 `<next_skill>`에게 전달하면 요구사항 구현이 용이합니다.

```yaml
codex_handoff:
  next_skill: business-feature-builder
  status: needs_answers
  handoff_note: "이 정보를 구현 시 business-feature-builder에게 전달하면 요구사항 구현이 용이합니다."
  goal: ""
  scope:
    in:
      - ""
    out:
      - ""
  requirements:
    - id: R1
      text: ""
  behavior_units:
    - id: B1
      requirements: [R1]
      trigger: ""
      state: ""
      outcome: ""
  implementation_slices:
    - id: S1
      behavior_units: [B1]
      purpose: ""
      dependencies:
        - ""
      validation:
        - ""
  assumptions:
    confirmed:
      - ""
    inferred:
      - ""
  blocking_questions:
    - id: Q1
      blocks: [S1]
      question: ""
  recommended_commit_boundaries:
    - id: C1
      slices: [S1]
      message_hint: ""
      includes:
        - ""
      validation:
        - ""
```

Use `status: ready_for_implementation` only when no blocking questions remain. Use `status: needs_answers` when user decisions are required. Use `status: reduce_scope` when the requested scope is too broad or internally conflicting.

## Next Skill Request Template

Do not include the next-skill request template by default. If the user explicitly asks for it, or asks to continue into implementation, read `references/next-skill-request-template.md` and append that copy-ready prompt after `Codex Skill Handoff`.
