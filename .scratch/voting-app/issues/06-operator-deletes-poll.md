# 06: Operator가 Poll을 지운다

Spec: `.scratch/voting-app/spec.md`

**What to build:** 관리 페이지의 Poll 목록에서 Operator가 삭제 버튼을 누르면 "Vote N개도 함께 삭제됩니다" 확인 창이 뜬다. 확인하면 Poll과 그 Vote가 영구 삭제되어 홈 목록과 Poll URL에서 사라진다. Voter가 Poll 페이지를 열어 둔 사이 삭제되었다면, 제출 시 "삭제된 투표 주제입니다" 안내와 함께 홈 목록으로 이동한다.

- `deletePoll(pollId)`는 삭제된 Vote 수를 반환하고, 없는 Poll이면 not-found.
- 삭제 Server Action은 Operator 세션을 확인한다 (02).
- 확인 창의 Vote 수는 관리 페이지에서 Operator용 조회로 얻는다.

**Blocked by:** 04

**Status:** done

- [x] 관리 페이지의 각 Poll에 삭제 버튼이 있고, Vote 수를 담은 확인 창을 거쳐 삭제된다
- [x] 삭제된 Poll은 홈 목록에서 사라지고 그 URL은 not-found가 된다
- [x] 로그인하지 않은 요청으로는 삭제할 수 없다
- [x] 삭제된 Poll에 Vote를 제출하면 안내 문구와 함께 홈으로 이동한다
- [x] 테스트: `deletePoll`이 삭제된 Vote 수를 반환한다
- [x] 테스트: 삭제 후 `listPolls`·`getPoll`에서 사라지고 관련 Vote도 남지 않는다
- [x] 테스트: 삭제된 Poll에 대한 `castVote`는 Poll 없음으로 거부된다
