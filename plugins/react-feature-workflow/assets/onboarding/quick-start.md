# React Development Skills

React 기능 구현, Figma 분석, 코드 리뷰, 테스트 생성 등을 위한 Skill 모음입니다.

기능 개발이 필요하다면 요구사항만 설명해도 됩니다. Skill이 적절한 단계를 거쳐 분석, 구현, 검증을 진행합니다.

---

## 개발 워크플로우

기능 구현은 일반적으로 다음 순서로 진행됩니다.

```text
요구사항 분석
↓
디자인/Figma 분석
↓
아키텍처 설계
↓
구현
↓
팀 컨벤션 검사
↓
React 코드 리뷰
↓
테스트 생성
↓
검증
```

---

## 기능 구현하기

새로운 기능을 만들고 싶다면 `$react-feature-builder`를 사용합니다.

예시:

```text
$react-feature-builder로 회원가입 기능을 구현해줘.

요구사항:
- 이메일 입력
- 비밀번호 입력
- 이메일 형식 검증
- 가입 API 호출
- 가입 성공 시 로그인 페이지 이동

대상:
src/features/auth
```

Figma가 있다면 함께 전달할 수 있습니다.

```text
$react-feature-builder로 회원가입 기능을 구현해줘.

Figma:
https://...

요구사항:
- 이메일 입력
- 비밀번호 입력
- 가입 버튼
```

특별히 범위를 지정하지 않으면 관련 파일만 최소 범위로 수정합니다.

---

## Figma 또는 스크린샷 분석하기

Figma, 스크린샷, 디자인 시안을 분석하거나 React 컴포넌트로 구현하고 싶다면 `$create-component-from-figma`를 사용합니다.

예시:

```text
$create-component-from-figma로 이 Figma를 분석해줘.
```

```text
$create-component-from-figma로 이 화면을 React 컴포넌트로 구현해줘.
```

```text
$create-component-from-figma로 이 스크린샷을 분석하고 컴포넌트 구조를 제안해줘.
```

가능한 작업:

* UI 구조 분석
* 컴포넌트 분리 제안
* 상태 정의
* 접근성 고려사항 도출
* React 컴포넌트 생성
* 디자인 토큰 추론

---

## 팀 컨벤션 검사하기

프로젝트 규칙 준수 여부를 확인하고 싶다면 `$team-convention-checker`를 사용합니다.

예시:

```text
$team-convention-checker로 현재 변경사항을 검사해줘.
```

```text
$team-convention-checker로 src/features/payment를 검사해줘.
```

```text
$team-convention-checker로 이 파일을 프로젝트 컨벤션 기준으로 수정해줘.
```

검사 대상 예시:

* 폴더 구조
* 파일명
* 네이밍 규칙
* Export 규칙
* Hook 규칙
* 상태 관리 방식
* 디자인 시스템 사용 여부
* 테스트 파일 위치

---

## React 코드 리뷰 받기

React 코드 품질을 검토하고 싶다면 `$react-ai-reviewer`를 사용합니다.

예시:

```text
$react-ai-reviewer로 현재 변경사항을 리뷰해줘.
```

```text
$react-ai-reviewer로 PaymentForm.tsx를 리뷰해줘.
```

```text
$react-ai-reviewer로 버그 가능성과 유지보수성을 중심으로 리뷰해줘.
```

주요 검토 항목:

* React Best Practice
* Hook 사용 방식
* 상태 관리
* 유지보수성
* 접근성
* 성능
* 테스트 가능성

---

## 테스트 생성하기

구현된 기능의 테스트를 만들고 싶다면 `$test-code-generator`를 사용합니다.

예시:

```text
$test-code-generator로 PaymentForm 테스트를 작성해줘.
```

```text
$test-code-generator로 현재 구현 기준 테스트를 생성해줘.
```

```text
$test-code-generator로 에러 상태와 입력 검증 케이스를 포함해서 테스트를 작성해줘.
```

생성 가능한 테스트:

* Unit Test
* Component Test
* Integration Test
* Loading 상태
* Empty 상태
* Error 상태
* Validation 테스트

---

## 고급 사용 예시

현재 변경사항만 대상으로 작업하기

```text
$react-ai-reviewer로 현재 diff만 리뷰해줘.

$team-convention-checker로 현재 diff만 검사해줘.
```

구현 후 검증까지 진행하기

```text
$react-feature-builder로 결제 페이지를 구현하고 lint, typecheck까지 수행해줘.
```

특정 디렉토리만 대상으로 작업하기

```text
$react-feature-builder로 src/features/payment 영역만 수정해줘.

$team-convention-checker로 src/features/payment만 검사해줘.
```

---

## 권장 사용 방법

대부분의 경우에는 아래처럼 자연어로 요청하면 됩니다.

```text
$react-feature-builder로 결제 정보 입력 화면을 구현해줘.

요구사항:
- 카드 번호 입력
- 만료일 입력
- CVC 입력
- 입력값 검증
- 결제 API 호출

디자인:
첨부한 Figma 참고

검증:
lint, typecheck
```

필요한 정보가 부족하면 Skill이 추가 정보를 요청하거나 현재 코드베이스를 분석하여 적절한 방향을 제안합니다.
