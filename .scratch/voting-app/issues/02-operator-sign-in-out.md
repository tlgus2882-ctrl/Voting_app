# 02: Operator 로그인·로그아웃

Spec: `.scratch/voting-app/spec.md`

**What to build:** Operator가 로그인 페이지에서 비밀번호(`OPERATOR_PASSWORD`)를 입력하면 Operator 관리 페이지로 들어간다. 로그인은 7일간 유지되고, 관리 페이지의 로그아웃 버튼으로 끝낼 수 있다. 로그인하지 않은 사람이 관리 페이지에 가면 로그인 페이지로 이동한다. 관리 페이지는 아직 비어 있다 (Poll 기능은 03, 06).

- 비밀번호 비교는 timing-safe.
- 세션은 `OPERATOR_SESSION_SECRET`로 서명한 httpOnly 쿠키, 7일 유효.
- 세션 확인 로직은 이후 Server Action(03, 06)과 Result 공개 판단(05)에서 재사용할 수 있게 한 곳에 둔다.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] 올바른 비밀번호로 로그인하면 관리 페이지로 이동한다
- [x] 틀린 비밀번호면 오류 문구가 보이고 로그인되지 않는다
- [x] 로그인하지 않고 관리 페이지에 접근하면 로그인 페이지로 리다이렉트된다
- [x] 로그아웃하면 세션 쿠키가 지워지고 관리 페이지에 다시 접근할 수 없다
- [x] 위조·변조된 세션 쿠키는 거부된다
- [x] `.env.local` 예시(값 제외)나 README에 두 환경 변수가 안내된다
