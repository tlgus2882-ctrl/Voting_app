# 03: Poll 마감 (Deadline / Closed)

Spec: `.scratch/poll-deadline-charts/spec.md`

**What to build:** Operator는 Poll을 올릴 때 Deadline을 선택적으로 정한다. 날짜와 시각을 분 단위로, 한국 시간 기준으로 입력하며, 현재 이후만 허용된다. Deadline이 지나면 Poll은 Closed가 된다.

- **Poll 페이지**: Deadline이 있으면 "10월 3일 (금) 18:00 마감"이 보이고, Closed면 "마감됨"이 보이며 Vote 폼이 사라진다.
- **Closed Poll의 Result**: Vote하지 않은 사람도 볼 수 있다.
- **마감 뒤의 Vote**: Deadline 이후(정각 포함)에 열어 둔 폼으로 Vote를 제출하면 기록되지 않는다. 대신 그 Poll 페이지에 "마감된 투표 주제입니다" 안내가 뜬다.
- **목록**: 홈 목록과 관리 목록에서 Closed Poll에 "마감됨" 배지가 붙는다. 관리 목록에는 열린 Poll의 Deadline도 보인다.

구현 결정:
- polls에 null 허용 deadline(timestamptz)을 멱등한 스키마 변경으로 추가하고, 로컬 DB에 `db:migrate`로 적용한다.
- Closed 판정("Deadline이 있고 now ≥ Deadline")은 Poll 모듈 한 곳에서만 계산한다.
- `castVote`는 마감 판정과 Vote 삽입을 한 SQL 문에서 수행하고, 새 결과 `poll-closed`를 반환한다.
- `getPoll`은 Deadline과 `closed`를 반환하고, Result 공개 조건에 "Closed"를 추가한다. `listPolls`는 `closed`를 반환한다.
- 폼의 로컬 날짜·시각은 서버에서 항상 +09:00으로 해석한다. 서버 시간대에 기대지 않는다. 표시도 KST로 형식화한다.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] 테스트: Deadline 없이 Poll을 올릴 수 있고, 항상 열려 있다
- [ ] 테스트: now 이후 Deadline은 허용하고, now와 같거나 이전인 Deadline은 `deadline-not-in-future`로 거부한다
- [ ] 테스트: Deadline 전에는 `closed=false`, 정각과 이후에는 `closed=true`다 (`getPoll`, `listPolls`)
- [ ] 테스트: Deadline 1ms 전 Vote는 허용하고, 정각과 이후 Vote는 `poll-closed`로 거부하며 기록하지 않는다
- [ ] 테스트: Vote하지 않은 Voter도 Closed Poll의 Result를 받고, 열린 Poll의 Result는 받지 않는다
- [ ] Operator 폼에 Deadline 입력(선택)이 있고, 과거 시각이면 한국어 오류가 보인다
- [ ] 수동 확인: "18:00"으로 올린 Poll이 한국 시간 18:00에 마감으로 표시된다 (서버 시간대와 무관)
- [ ] Poll 페이지, 홈 목록, 관리 목록에 마감 정보와 "마감됨"이 spec대로 보인다
- [ ] 마감 뒤에 열어 둔 폼으로 제출하면 Poll 페이지에 안내가 뜨고 Result가 보인다
