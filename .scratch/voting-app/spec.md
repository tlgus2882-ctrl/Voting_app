# Spec: 투표 웹앱 (Poll / Vote / Result)

Status: ready-for-agent

용어는 루트의 `CONTEXT.md`를 따른다 (Poll, Question, Option, Vote, Result, Operator, Voter). "투표"라는 단어는 모호하므로 코드·UI 식별자에서 쓰지 않는다. 단, UI 문구에서 사용자에게 보이는 한국어 "투표"는 허용한다.

## Problem Statement

Operator는 질문 하나를 올려 여러 사람의 선택을 빠르게 모으고 싶다. 지금은 그런 도구가 없어서, 메신저 등으로 답을 받으면 중복 응답이 섞이고 집계를 손으로 해야 한다. Voter 입장에서는 가입 없이 링크만 열어 바로 고르고, 다른 사람들이 어떻게 골랐는지 확인하고 싶다.

## Solution

Vercel에 배포되고 Neon Postgres를 쓰는 Next.js 웹앱.

- Operator는 공유 비밀번호로 로그인해 Poll(Question + Option 2~10개)을 올리고 지운다.
- Voter는 로그인 없이 Poll 목록에서 Poll을 골라 Option 하나에 Vote를 남긴다. 한 브라우저는 한 Poll에 한 번만 Vote할 수 있고, Vote는 바꿀 수 없다.
- Voter는 Vote를 남긴 뒤에만 그 Poll의 Result(표 수·퍼센트·막대)를 본다. Operator는 항상 본다.

## User Stories

### Voter — 목록

1. As a Voter, I want to see a list of all Polls on the home page, so that I can pick one to vote in.
2. As a Voter, I want the Poll list ordered newest first, so that the most recent Poll is easy to find.
3. As a Voter, I want each Poll in the list to show only its Question, so that I am not influenced by vote counts before voting.
4. As a Voter, I want Polls I already voted in to be marked "투표 완료" in the list, so that I know which ones are left.
5. As a Voter, I want a friendly empty state when there are no Polls, so that I understand the app is working but nothing is posted yet.

### Voter — Vote

6. As a Voter, I want to open a Poll via its own URL, so that someone can share a direct link with me.
7. As a Voter, I want to see the Question and all Options in the order the Operator entered them, so that the presentation is neutral.
8. As a Voter, I want to select exactly one Option and submit, so that my choice is recorded.
9. As a Voter, I want the submit action to be disabled until I pick an Option, so that I cannot submit an empty Vote.
10. As a Voter, I want to be taken straight to the Result after my Vote is recorded, so that I see the outcome immediately.
11. As a Voter, I want to be unable to vote a second time in the same Poll from the same browser, so that the Result stays roughly one-person-one-vote.
12. As a Voter, I want to see the Result instead of the Options when I revisit a Poll I already voted in, so that I don't hit a confusing error.
13. As a Voter, I want my Vote to be final, so that nobody (including me) can change results after seeing them.
14. As a Voter, I want a clear "삭제된 투표 주제입니다" notice and to be sent back to the list if the Poll was deleted while I had it open, so that I understand why my Vote didn't go through.
15. As a Voter, I want a not-found page when I open a URL for a Poll that doesn't exist, so that broken links are obvious.
16. As a Voter, I want to be unable to see a Poll's Result before I vote in it, so that I choose independently.

### Voter — Result

17. As a Voter, I want the Result to show each Option's vote count, percentage, and a proportional bar, so that I can compare at a glance.
18. As a Voter, I want the Result to show the total number of Votes, so that I can judge how representative it is.
19. As a Voter, I want the Option I chose to be highlighted in the Result, so that I can find my own choice.
20. As a Voter, I want Options in the Result listed in their original order, so that the layout is stable.
21. As a Voter, I want the Result to update when I refresh the page, so that I can check back for newer Votes.
22. As a Voter, I want percentages that handle zero Votes gracefully (0%, no division errors), so that a fresh Poll still renders.

### Operator — 로그인

23. As an Operator, I want to sign in with a single password, so that only I can manage Polls.
24. As an Operator, I want an error message when the password is wrong, so that I know to retry.
25. As an Operator, I want to stay signed in for 7 days, so that I don't retype the password every visit.
26. As an Operator, I want a sign-out button, so that I can end my session on a shared computer.
27. As an Operator, I want operator pages to redirect to the sign-in page when I'm not signed in, so that nobody else can reach them.

### Operator — Poll 관리

28. As an Operator, I want a form to enter a Question and 2–10 Options, so that I can post a Poll.
29. As an Operator, I want to add and remove Option fields in the form (minimum 2, maximum 10), so that I can post Polls of different sizes.
30. As an Operator, I want a validation error when the Question is empty or longer than 200 characters, so that Polls stay readable.
31. As an Operator, I want a validation error when any Option is empty or longer than 100 characters, so that Options stay readable.
32. As an Operator, I want a validation error when two Options are the same after trimming whitespace, so that Votes aren't split between identical Options.
33. As an Operator, I want leading/trailing whitespace trimmed from the Question and Options, so that stray spaces don't create near-duplicates.
34. As an Operator, I want the new Poll to appear at the top of the list right after posting, so that I can share it immediately.
35. As an Operator, I want to see the Result of any Poll without voting, so that I can monitor it.
36. As an Operator, I want to still be able to Vote from my own browser like any Voter, so that I can take part.
37. As an Operator, I want to delete a Poll, so that I can remove mistakes or finished Polls.
38. As an Operator, I want a confirmation dialog that says how many Votes will be deleted with the Poll, so that I don't delete by accident.
39. As an Operator, I want deletion to permanently remove the Poll and all its Votes, so that no orphaned data remains.
40. As an Operator, I want to fix a mistake by deleting and re-posting, since Polls cannot be edited, so that existing Votes never change meaning.

## Implementation Decisions

### Poll 모듈 (유일한 deep module / 테스트 seam)

모든 도메인 규칙을 하나의 Poll 모듈에 모은다. 페이지와 Server Action은 쿠키를 읽어 이 모듈을 호출하고 결과를 렌더링하는 얇은 층이다.

- 모듈은 최소한의 DB 인터페이스(파라미터 바인딩된 SQL 문자열을 실행하고 row 배열을 돌려주는 `query` 함수 하나)를 인자로 받는다. 운영에서는 `@neondatabase/serverless`로, 테스트에서는 PGlite로 이 인터페이스를 구현한다.
- 공개 연산 (이름은 구현 시 조정 가능, 의미는 고정):
  - **createPoll(question, options)** → 생성된 Poll 또는 검증 오류. 앞뒤 공백 제거 후 검증: Question 1~200자, Option 1~100자, Option 2~10개, Poll 내 Option 중복 불가. Poll과 Options는 원자적으로 저장한다.
  - **deletePoll(pollId)** → 삭제된 Vote 수 (없는 Poll이면 not-found).
  - **listPolls(voterId)** → 최신순 Poll 목록. 각 항목은 id, Question, 생성 시각, 이 Voter가 Vote했는지 여부. 표 수는 포함하지 않는다.
  - **getPoll(pollId, viewer)** → viewer는 `{ voterId, isOperator }`. Poll의 Question, 입력 순서의 Options, 이 Voter의 Vote 여부와 선택한 Option을 돌려준다. Result(Option별 표 수·퍼센트, 총 표 수)는 **viewer가 Vote했거나 Operator일 때만** 포함한다. 없는 Poll이면 not-found.
  - **castVote(pollId, optionId, voterId)** → 성공 / 이미 Vote함 / Poll 없음(삭제됨) / Option이 그 Poll에 속하지 않음.
- Result 공개 규칙은 모듈 안에서 강제한다. UI가 실수로 Result를 노출할 수 없도록, Result가 허용되지 않으면 반환값에 아예 포함하지 않는다.
- 퍼센트는 총 표 수가 0이면 모두 0이다. 반올림 방식은 정수 퍼센트면 충분하다 (합이 100이 아닐 수 있음을 허용).

### 스키마 (Neon Postgres)

- **polls**: id, question, created_at.
- **options**: id, poll_id (polls 삭제 시 cascade), text, position. (poll_id, text)에 unique 제약.
- **votes**: poll_id (cascade), option_id (cascade), voter_id, created_at. (poll_id, voter_id)를 primary key로 둬서 **중복 Vote를 DB 제약으로 막는다** (동시 요청 경쟁 상황 포함). option_id가 같은 poll_id에 속하는지는 모듈에서 검증한다.
- 스키마는 하나의 SQL 정의로 관리하고, 운영 DB에는 npm 스크립트로 적용하며, 테스트는 매 테스트마다 같은 정의를 PGlite에 적용한다.

### Voter 식별

- Voter ID는 처음 방문할 때 발급하는 무작위 UUID로, httpOnly 쿠키에 1년간 저장한다. 계정·IP는 쓰지 않는다. 시크릿 창 등으로 우회 가능한 것은 허용된 한계다.
- Operator의 브라우저도 같은 방식으로 Voter ID를 가진다.

### Operator 인증

- 비밀번호는 환경 변수 `OPERATOR_PASSWORD` 하나. DB에 Operator 테이블은 없다.
- 비교는 timing-safe로 한다.
- 로그인 성공 시 서명된 httpOnly 세션 쿠키를 7일 유효로 발급한다. 서명 키는 환경 변수 `OPERATOR_SESSION_SECRET`. 로그아웃은 쿠키 삭제.
- Poll 생성·삭제 Server Action과 Operator 페이지는 모두 세션을 확인하고, 없으면 로그인 페이지로 보낸다. `isOperator`는 이 세션 확인 결과로만 결정된다.

### 화면

- **홈 (Poll 목록)**: 최신순 Question 목록 + "투표 완료" 표시 + 빈 상태.
- **Poll 페이지 (Poll별 URL)**: Vote 전에는 Option 라디오 목록과 제출 버튼. Vote 후 또는 Operator에게는 Result(표 수·퍼센트·막대, 내 선택 강조, 총 표 수). 자동 갱신 없이 새로고침 시 최신화.
- **Operator 로그인 페이지**.
- **Operator 관리 페이지**: Poll 생성 폼(Option 필드 추가/삭제, 2~10개), Poll 목록과 각 Poll의 삭제 버튼(Vote 수를 보여주는 확인 창), 로그아웃 버튼.
- 삭제된 Poll에 Vote를 제출하면 "삭제된 투표 주제입니다" 안내와 함께 목록으로 이동.

### 배포

- Vercel. 환경 변수: `DATABASE_URL`, `OPERATOR_PASSWORD`, `OPERATOR_SESSION_SECRET`.

## Testing Decisions

- **좋은 테스트의 기준**: Poll 모듈의 공개 연산만 호출하고, 그 반환값(과 이후 다른 공개 연산의 결과)으로 동작을 검증한다. SQL 문, 테이블 구조, 내부 헬퍼는 직접 검사하지 않는다. 테스트 이름에는 `CONTEXT.md`의 용어를 쓴다.
- **테스트 대상**: Poll 모듈 하나. 도구는 Vitest, DB는 테스트마다 새로 만든 PGlite 인스턴스에 스키마를 적용해 사용한다.
- **다룰 동작 (최소)**:
  - createPoll 검증: Option 1개/11개 거부, 빈 Question 거부, 200자/100자 경계, 공백 제거 후 중복 Option 거부, 정상 생성 시 입력 순서 보존.
  - listPolls: 최신순, Vote 여부 표시, 표 수 미포함.
  - getPoll Result 공개 규칙: Vote 전 Voter에게는 Result 없음, Vote 후에는 있음, Operator는 Vote 없이도 있음.
  - castVote: 정상 Vote, 같은 Voter의 두 번째 Vote 거부(Vote 변경 불가), 다른 Poll의 Option 거부, 삭제된 Poll 거부.
  - Result 계산: 표 수·퍼센트·총 표 수, 표 0개일 때 0%.
  - deletePoll: 삭제된 Vote 수 반환, 이후 getPoll/listPolls에서 사라짐.
- **테스트하지 않는 것**: Next.js 페이지·Server Action·쿠키 처리(얇은 층), Operator 비밀번호/세션 서명. 이들은 수동 확인한다.
- **Prior art**: 현재 코드베이스에는 테스트가 없다. 이 spec이 Vitest 설정과 첫 테스트를 도입한다.

## Out of Scope

- Poll 수정, 수동/자동 마감, 마감 시각.
- 복수 선택, 순위 투표.
- Vote 변경·취소.
- Voter 계정/로그인, IP 기반 중복 방지, 봇·스팸 방어.
- 여러 Operator 계정, 비밀번호 재설정, 로그인 시도 횟수 제한.
- 실시간(자동 갱신) Result.
- 삭제된 Poll 복구(soft delete).
- 페이지네이션 (Poll 수가 적다고 가정).
- 브라우저 E2E 테스트.

## Further Notes

- 중복 Vote 방지가 쿠키 기반이라 의도적 조작에는 약하다. 간단한 웹앱이라는 범위에서 합의된 한계다.
- `.env.local`에 `DATABASE_URL`이 이미 있다. `OPERATOR_PASSWORD`, `OPERATOR_SESSION_SECRET`은 로컬과 Vercel 양쪽에 추가해야 한다.
- Next.js 16 / React 19 기반이다. 구현 전에 `node_modules/next/dist/docs/`의 해당 버전 문서를 확인한다 (Server Actions, cookies API 등 버전별 차이 가능).
