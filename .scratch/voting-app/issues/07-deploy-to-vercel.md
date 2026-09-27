# 07: Vercel 배포

Spec: `.scratch/voting-app/spec.md`

**What to build:** 앱이 Vercel에 배포되어 공개 URL에서 전체 흐름이 동작한다. Vercel·Neon 계정 작업이 필요해 사람이 수행한다.

**Blocked by:** 01, 02, 03, 04, 05, 06

**Status:** ready-for-human

- [ ] GitHub 저장소를 Vercel 프로젝트에 연결한다
- [ ] Vercel 환경 변수 `DATABASE_URL`, `OPERATOR_PASSWORD`, `OPERATOR_SESSION_SECRET`을 등록한다 (세션 시크릿은 충분히 긴 무작위 값)
- [ ] 운영 Neon DB에 스키마 적용 스크립트를 실행한다
- [ ] 배포 URL에서 수동 확인: Operator 로그인 → Poll 올리기 → 다른 브라우저로 Vote → Result 확인 → 중복 Vote 차단 → Poll 삭제
