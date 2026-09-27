# 05: Result 보기

Spec: `.scratch/voting-app/spec.md`

**What to build:** Vote를 마친 Voter는 곧바로 그 Poll의 Result를 본다: Option별 표 수, 정수 퍼센트, 비율 막대, 총 표 수, 내가 고른 Option 강조. Option은 입력 순서 그대로다. 새로고침하면 최신 값이 보인다. Vote하지 않은 Voter는 Result를 볼 수 없다. 로그인한 Operator는 Vote하지 않아도 모든 Poll의 Result를 본다 (Poll 페이지와 관리 페이지 모두).

- `getPoll(pollId, { voterId, isOperator })`가 Result를 **Vote했거나 Operator일 때만** 반환값에 포함한다. 허용되지 않으면 필드 자체가 없다.
- `isOperator`는 02의 세션 확인으로만 결정한다.
- 총 표 수 0이면 모든 퍼센트 0.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Vote 제출 직후 Result 화면으로 이어진다
- [ ] Result에 표 수·퍼센트·막대·총 표 수가 보이고 내 선택이 강조된다
- [ ] 로그인한 Operator는 Vote 없이 Result를 본다
- [ ] 테스트: Vote 전 Voter에게는 Result가 반환되지 않는다
- [ ] 테스트: Vote 후에는 Result가 반환되고 표 수·퍼센트·총 표 수가 맞다
- [ ] 테스트: Operator에게는 Vote 없이도 Result가 반환된다
- [ ] 테스트: 표 0개 Poll(Operator 조회)에서 퍼센트가 모두 0이다
