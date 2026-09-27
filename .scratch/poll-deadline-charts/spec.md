# Spec: Poll 마감(Deadline), Result 그래프(Chart Type), 제작자 표시

Status: ready-for-agent

기존 spec: `.scratch/voting-app/spec.md` (구현 완료). 이 spec은 그 위에 얹는 변경이다. 용어는 루트 `CONTEXT.md`를 따른다. 이번에 추가된 용어: **Deadline**, **Closed**, **Chart Type**.

## Problem Statement

Operator는 Poll을 올린 뒤 언제까지 Vote를 받을지 정할 방법이 없다. 그래서 Poll이 삭제될 때까지 끝없이 열려 있고, 결과가 확정된 시점이 없다. 또 모든 Result가 같은 가로 막대 모양이라, Poll 성격에 맞게 보여줄 수 없다. 마지막으로, 앱 화면 어디에도 누가 만들었는지 표시되지 않는다.

## Solution

- Operator는 Poll을 올릴 때 **Deadline**(선택)을 정할 수 있다. Deadline이 지나면 Poll은 **Closed**가 되어 더 이상 Vote를 받지 않고, 그때부터는 Vote하지 않은 사람도 누구나 Result를 볼 수 있다. Deadline은 올린 뒤 바꿀 수 없다.
- Operator는 Poll을 올릴 때 **Chart Type**(가로 막대 / 세로 막대 / 도넛)을 고른다. Result는 그 모양으로 그려진다. 도넛은 Option이 5개 이하인 Poll에서만 고를 수 있다.
- 모든 페이지 하단에 "제작: 박시현"이 표시된다.

## User Stories

### Operator — Deadline 설정

1. As an Operator, I want to optionally set a Deadline when posting a Poll, so that Votes stop at a time I choose.
2. As an Operator, I want to leave the Deadline empty, so that a Poll stays open until I delete it, as before.
3. As an Operator, I want to enter the Deadline as a date and a time to the minute in Korean time (KST), so that it matches the clock my Voters use.
4. As an Operator, I want a validation error when the Deadline is not in the future, so that I don't post a Poll that is Closed from the start.
5. As an Operator, I want the Deadline to be fixed once the Poll is posted, so that Voters can trust the announced time.
6. As an Operator, I want to see each Poll's Deadline (or "마감됨") in my management list, so that I know which Polls are still running.
7. As an Operator, I want to still delete a Closed Poll, so that I can clean up finished Polls.

### Voter — Deadline

8. As a Voter, I want to see when a Poll closes (e.g. "10월 3일 (금) 18:00 마감") on the Poll page, so that I know how long I have to Vote.
9. As a Voter, I want Polls without a Deadline to show no closing time, so that the page isn't cluttered.
10. As a Voter, I want a Closed Poll to show "마감됨" instead of the Vote form, so that I don't try to Vote in vain.
11. As a Voter, I want to see the Result of a Closed Poll even if I never voted, so that I can learn the outcome.
12. As a Voter, I want a "마감됨" badge on Closed Polls in the home list, so that I can tell open Polls from finished ones at a glance.
13. As a Voter, I want the home list to stay newest first regardless of Deadline, so that the order is predictable.
14. As a Voter, I want a clear "마감된 투표 주제입니다" notice if I submit a Vote from a page I opened before the Deadline passed, so that I understand why my Vote wasn't counted.
15. As a Voter, I want my Vote accepted right up until the Deadline, so that I'm not cut off early.
16. As a Voter, I want a Vote submitted at or after the Deadline to be rejected even if my page still showed the form, so that the Deadline is enforced fairly.
17. As a Voter who already voted, I want to keep seeing the Result after the Poll is Closed, with my choice still highlighted, so that nothing changes for me.

### Operator — Chart Type

18. As an Operator, I want to choose a Chart Type (가로 막대, 세로 막대, 도넛) when posting a Poll, so that the Result is shown in a fitting way.
19. As an Operator, I want 가로 막대 selected by default, so that I can post quickly without thinking about charts.
20. As an Operator, I want a validation error if I choose 도넛 with more than 5 Options, so that the donut stays readable.
21. As an Operator, I want the Chart Type to be fixed once the Poll is posted, consistent with Polls never being edited.

### Everyone — Result 그래프

22. As a viewer of a Result, I want a 가로 막대 chart to show each Option's votes, percentage and a proportional horizontal bar, in entered order, so that I can compare Options (existing behaviour).
23. As a viewer of a Result, I want a 세로 막대 chart with one column per Option, its height proportional to its share, labelled with the Option text, votes and percentage, so that I can compare Options side by side.
24. As a viewer of a Result, I want a 도넛 chart with one colored segment per Option, the total Votes in the center, and a legend listing each Option's color, votes and percentage, so that I can see each Option's share of the whole.
25. As a Voter, I want my own choice highlighted in every Chart Type, so that I can find it.
26. As a viewer of a Result, I want a Poll with zero Votes to render cleanly in every Chart Type (for the 도넛, an empty ring with "아직 표가 없습니다"), so that fresh Polls don't look broken.
27. As a viewer of a Result, I want long Option texts to stay readable in the 세로 막대 chart (wrapped or truncated with the full text available), so that labels don't overlap.
28. As a viewer on a phone, I want every Chart Type to fit the screen width without horizontal scrolling, so that I can read it on mobile.
29. As a viewer in dark mode, I want charts readable in both light and dark themes, so that colors don't disappear.
30. As a viewer, I want Polls posted before this change to show as 가로 막대, so that existing Polls keep working.

### Everyone — 제작자 표시

31. As a visitor, I want to see "제작: 박시현" at the bottom of every page, so that I know who made the app.

## Implementation Decisions

### Poll 모듈 (기존 seam 유지)

모든 새 규칙은 기존 Poll 모듈에 둔다. 마감 판정을 테스트할 수 있도록 **시간에 따라 결과가 달라지는 연산은 현재 시각(`now`)을 인자로 받는다**. 페이지와 Server Action은 요청 시점의 현재 시각을 넘긴다. 모듈 내부에서 현재 시각이나 DB의 `now()`를 읽어 마감 여부를 판정하지 않는다.

- **createPoll**: 입력이 늘어나므로 위치 인자 대신 하나의 입력 객체(Question, Options, Deadline 또는 없음, Chart Type)와 `now`를 받는다. 기존 검증에 더해:
  - Deadline이 있으면 `now`보다 이후여야 한다 → 새 오류 `deadline-not-in-future`.
  - Chart Type은 정해진 세 값 중 하나여야 한다 → 새 오류 `invalid-chart-type`.
  - 도넛은 Option 5개 이하일 때만 가능 → 새 오류 `too-many-options-for-donut`.
- **getPoll(pollId, viewer, now)**: 반환값에 Deadline(없으면 null), `closed` 여부, Chart Type을 추가한다. Result 공개 조건을 **viewer가 Vote했거나, Operator이거나, Poll이 Closed**로 넓힌다.
- **listPolls(viewer, now)**: 각 항목에 `closed` 여부를 추가한다. 순서는 최신순 그대로.
- **castVote(pollId, optionId, voterId, now)**: 새 결과 `poll-closed`. 마감 판정은 Vote 삽입과 같은 SQL 문 안에서 한다. 판정과 삽입 사이에 Deadline이 지나는 경쟁 상황을 피하기 위해서다. Deadline 시각과 같거나 그 이후면 Closed다 (Deadline 정각의 Vote는 거부).
- **Closed**의 정의는 "Deadline이 있고 `now >= Deadline`" 하나로, 모듈 안 한 곳에서만 계산한다.
- Chart Type 값: `horizontal-bar`, `vertical-bar`, `donut`. 도넛 Option 상한(5)은 기존 제한값 상수들과 함께 둔다. 이 상수들은 클라이언트 폼에서도 쓴다.

### 스키마

- polls에 **deadline**(timestamptz, null 허용)과 **chart_type**(text, not null, 기본값 `horizontal-bar`, 세 값 중 하나만 허용하는 check 제약)을 추가한다.
- 기존 스키마 정의 파일에 멱등(여러 번 실행해도 안전)한 추가 구문으로 넣어, 기존 `db:migrate` 스크립트로 운영 DB에 적용한다. 기존 Poll은 deadline이 null이 되어 "마감 없음, 가로 막대"가 된다.

### 시간대

- Operator 폼은 날짜와 시각을 분 단위로 입력받는다 (타임존 정보 없는 로컬 날짜·시각).
- 서버는 이 값을 **항상 KST(+09:00)로 해석**해 절대 시각으로 저장한다. Vercel 서버의 시간대는 UTC이므로 서버 로컬 시간대에 기대지 않는다.
- 화면 표시는 KST로 형식화한다: "10월 3일 (금) 18:00 마감". 남은 시간("3시간 남음")은 표시하지 않는다.

### Server Action / 화면

- **Operator 폼**: Deadline 입력(선택)과 Chart Type 선택(기본 가로 막대)을 추가한다. Option이 5개를 넘으면 도넛 선택지를 비활성화하고, 서버 검증도 유지한다. 새 오류 코드별 한국어 문구를 추가한다.
- **Vote Server Action**: `poll-closed`면 Poll 페이지로 돌아가 "마감된 투표 주제입니다" 안내를 보여준다. Closed Poll의 Result가 공개되므로, 삭제된 경우처럼 홈으로 보내지 않고 해당 Poll에 머문다.
- **Poll 페이지**: Deadline이 있으면 "… 마감"을, Closed면 "마감됨"을 표시한다. Closed Poll에는 Vote 폼을 보여주지 않는다. Result가 있으면 Poll의 Chart Type으로 그린다.
- **홈 목록과 관리 목록**: Closed Poll에 "마감됨" 배지를 단다. 관리 목록에는 열린 Poll의 Deadline도 표시한다.
- **푸터**: 공통 레이아웃에 "제작: 박시현".

### 그래프 렌더링

- 차트 라이브러리를 쓰지 않는다. 서버 컴포넌트에서 SVG와 CSS로 그린다 (클라이언트 번들 증가 없음).
- Result 표시 컴포넌트가 Chart Type에 따라 세 가지 모양 중 하나를 고른다. 세 모양 모두 같은 Result 데이터(Option별 표 수, 퍼센트, 총 표 수, 내 선택)를 입력으로 받는다.
- 도넛 색상: Option 최대 5개이므로 라이트·다크 모드 모두에서 구분되는 5색 고정 팔레트. 색만으로 구분하지 않도록 범례에 Option 텍스트, 표 수, 퍼센트를 함께 적는다.
- 내 선택 강조: 막대는 기존처럼 진한 색과 "내 선택" 표시, 도넛은 범례에 "내 선택" 표시.
- 접근성: 각 그래프에 텍스트 대안을 둔다 (범례 또는 목록이 스크린 리더로 읽힘).

## Testing Decisions

- **좋은 테스트의 기준**: 기존과 같다. Poll 모듈의 공개 연산만 호출하고, 반환값과 이후 공개 연산의 결과로 검증한다. 시간은 테스트가 고정된 `now`를 넘겨 제어한다 (가짜 타이머나 시스템 시계 조작 없음). 테스트 이름에는 `CONTEXT.md` 용어를 쓴다 (Deadline, Closed, Chart Type).
- **테스트 대상**: Poll 모듈 하나 (Vitest + PGlite, 기존 테스트 파일에 추가).
- **다룰 동작 (최소)**:
  - createPoll: Deadline 없이 생성 가능. `now`보다 이후 Deadline 허용. `now`와 같거나 이전인 Deadline 거부. 잘못된 Chart Type 거부. 도넛에 Option 5개 허용, 6개 거부. 막대는 Option 10개 허용. Chart Type을 생략하면 가로 막대.
  - getPoll/listPolls: Deadline 전에는 `closed=false`, Deadline 시각과 그 이후에는 `closed=true`. Deadline 없는 Poll은 항상 열림. Chart Type과 Deadline을 반환.
  - castVote: Deadline 직전(1ms 전) Vote 허용, Deadline 정각과 이후 Vote는 `poll-closed`로 거부되고 기록되지 않음.
  - Result 공개: Vote하지 않은 Voter에게 열린 Poll의 Result는 없음(기존), Closed Poll의 Result는 있음.
  - 기존 테스트는 새 시그니처에 맞게 고치되, 검증하는 동작은 바꾸지 않는다.
- **테스트하지 않는 것**: 그래프 SVG 모양, 폼 UI, KST 입력값 해석과 표시 형식, 푸터. 이것들은 개발 서버에서 직접 확인한다. KST 해석은 Server Action 쪽 코드이므로 수동 확인 목록에 반드시 넣는다 (예: "18:00"으로 올리면 한국 시간 18:00에 마감).
- **Prior art**: 기존 Poll 모듈 테스트 파일. 테스트마다 새 PGlite 인스턴스를 쓰고, Poll 생성을 돕는 헬퍼가 있다.

## Out of Scope

- Deadline 수정, 연장, 단축, "지금 마감" 버튼.
- 원형(파이) 차트, 그 밖의 Chart Type. 보는 사람이 차트 종류를 바꾸는 기능.
- Chart Type을 Option 개수로 자동 선택하는 기능.
- 남은 시간 표시, 자동 갱신, 카운트다운.
- 마감 알림 (이메일, 푸시 등).
- 차트 라이브러리 도입, 툴팁, 애니메이션.
- Voter 이름 입력이나 기명 투표 ("자기 이름 적기"는 제작자 표시로 합의됨).
- 목록 정렬을 Deadline 기준으로 바꾸기.

## Further Notes

- `CONTEXT.md`가 이번에 바뀌었다. Poll은 "마감되지 않는다"에서 "Deadline이 지나면 Closed"로, Result 공개 조건에 "Poll이 Closed" 추가, 용어 Deadline·Closed·Chart Type 신설.
- 스키마 변경은 운영 DB에도 적용해야 한다. 아직 배포 전이면 배포 티켓의 스키마 적용 단계에서 함께 처리된다.
- 지난 코드 리뷰에서 나온 후속 항목(`listPolls`가 Operator에게 표 수를 주는 것을 기존 spec에 반영, 삭제 확인 창 문구 "Vote N개"를 "N표"로 통일 등)은 이 spec의 범위가 아니다. 하지만 같은 파일을 건드리므로 함께 처리하면 편하다.
- Next.js 16 기반이다. 구현 전에 `node_modules/next/dist/docs/`를 확인한다.
