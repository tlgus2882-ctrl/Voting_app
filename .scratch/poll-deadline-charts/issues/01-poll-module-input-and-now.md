# 01: Prefactor — Poll 모듈이 입력 객체와 "지금 시각"을 받도록 변경

Spec: `.scratch/poll-deadline-charts/spec.md`

**What to build:** 사용자에게 보이는 동작은 바뀌지 않는다. 이후 티켓(03 Deadline, 04·05 Chart Type)이 서로 시그니처를 고치며 충돌하지 않도록 Poll 모듈의 공개 연산 모양을 먼저 바꾼다.

- `createPoll`은 위치 인자(Question, Options) 대신 입력 객체 하나를 받는다. 지금은 Question과 Options만 담고, 03·04가 필드를 추가한다.
- `createPoll`, `getPoll`, `listPolls`, `castVote`는 현재 시각(`now`)을 인자로 받는다. 아직 이 값을 쓰는 규칙은 없다.
- 페이지와 Server Action은 요청 시점의 현재 시각을 넘긴다.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] 네 연산의 새 시그니처가 적용되고 모든 호출부가 바뀌었다
- [x] 기존 테스트가 새 시그니처로 바뀌었고, 검증하는 동작은 그대로이며 모두 통과한다
- [x] 타입 검사, ESLint, 운영 빌드가 통과한다
- [x] 개발 서버에서 Poll 올리기, Vote, Result 보기, 삭제가 이전과 똑같이 동작한다
