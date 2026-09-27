# 04: Chart Type 선택 + 세로 막대

Spec: `.scratch/poll-deadline-charts/spec.md`

**What to build:** Operator는 Poll을 올릴 때 Chart Type으로 가로 막대(기본값) 또는 세로 막대를 고른다. Result는 그 모양으로 그려진다.

- **세로 막대**: Option마다 기둥 하나가 있고, 높이는 퍼센트에 비례한다. Option 텍스트, 표 수, 퍼센트를 라벨로 붙이고, 내 선택은 강조한다.
- **기존 Poll**: 가로 막대로 보인다.

구현 결정:
- polls에 chart_type(text, not null, 기본값 `horizontal-bar`, 허용 값 check 제약)을 멱등한 스키마 변경으로 추가한다. check 제약은 05에서 `donut`을 받을 수 있게 처음부터 세 값(`horizontal-bar`, `vertical-bar`, `donut`)을 허용한다. 다만 모듈 검증은 이 티켓에서는 막대 두 종류만 받는다.
- `createPoll` 입력에 Chart Type을 추가한다. 생략하면 가로 막대이고, 모르는 값은 `invalid-chart-type`으로 거부한다. `getPoll`은 Chart Type을 반환한다.
- Result 표시 컴포넌트가 Chart Type에 따라 모양을 고른다. 차트 라이브러리 없이 서버 렌더링 SVG/CSS로 그린다.

**Blocked by:** 01

**Status:** done

- [x] 테스트: Chart Type을 생략하면 가로 막대로 저장되고 `getPoll`이 그대로 반환한다
- [x] 테스트: 세로 막대로 올린 Poll은 `getPoll`에서 세로 막대를 반환한다
- [x] 테스트: 모르는 Chart Type은 `invalid-chart-type`으로 거부하고 아무것도 저장하지 않는다
- [x] 테스트: 막대 차트는 Option 10개를 허용한다
- [x] Operator 폼에 Chart Type 선택이 있고, 기본값은 가로 막대다
- [x] 세로 막대 Result가 Option 2개와 10개, 100자 Option, 모바일 폭, 다크 모드에서 겹치거나 넘치지 않는다
- [x] 표가 0개인 세로 막대가 깨지지 않는다
- [x] 기존(Chart Type이 없던) Poll이 가로 막대로 보인다
