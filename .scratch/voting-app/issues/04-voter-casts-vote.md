# 04: Voter가 Vote를 남긴다

Spec: `.scratch/voting-app/spec.md`

**What to build:** Voter가 홈 목록에서 Poll을 누르면 Poll별 URL의 페이지로 가서 Question과 Option들(입력 순서)을 본다. Option 하나를 골라 제출하면 Vote가 기록되고, 이후 그 Poll을 다시 열면 Option 대신 "투표 완료" 상태가 보인다 (Result 화면은 05). 홈 목록에도 해당 Poll에 "투표 완료"가 표시된다. 같은 브라우저에서는 다시 Vote할 수 없다.

- 첫 방문 시 무작위 UUID Voter ID를 httpOnly 쿠키(1년)로 발급한다. Operator 브라우저도 동일하다.
- `castVote(pollId, optionId, voterId)`: 성공 / 이미 Vote함 / Poll 없음 / 다른 Poll의 Option 을 구분해 반환한다. 중복 방지는 votes의 (poll_id, voter_id) 제약에 기댄다.
- `getPoll(pollId, viewer)`의 기본형: Question, 입력 순서 Options, 이 Voter의 Vote 여부·선택 Option. Result는 아직 포함하지 않는다 (05에서 추가).
- Option을 고르기 전에는 제출 버튼이 비활성화된다.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Poll 페이지에서 Option을 골라 제출하면 Vote가 기록되고 "투표 완료" 상태가 보인다
- [ ] 같은 브라우저로 다시 열면 Option 선택 UI가 나오지 않는다
- [ ] 홈 목록에서 Vote한 Poll에 "투표 완료"가 표시된다
- [ ] 없는 Poll의 URL은 not-found 페이지를 보여준다
- [ ] 테스트: 정상 Vote 후 `getPoll`/`listPolls`가 Vote 여부와 선택 Option을 반영한다
- [ ] 테스트: 같은 Voter의 두 번째 Vote는 거부되고 기존 Vote는 바뀌지 않는다
- [ ] 테스트: 다른 Poll의 Option으로 Vote하면 거부된다
- [ ] 테스트: 서로 다른 Voter는 같은 Poll에 각각 Vote할 수 있다
