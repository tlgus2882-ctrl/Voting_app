# 01: 기반 구축 + 빈 Poll 목록

Spec: `.scratch/voting-app/spec.md`

**What to build:** 방문자가 홈에 들어오면 실제 Neon DB에서 Poll 목록을 읽어 보여준다. 아직 Poll이 없으므로 "아직 올라온 투표 주제가 없습니다" 빈 상태가 보인다. 이 과정에서 이후 모든 티켓이 쓰는 기반(스키마, Poll 모듈의 DB 인터페이스, 테스트 환경)을 만든다.

- Poll 모듈은 최소 DB 인터페이스(파라미터 바인딩 SQL을 실행해 row 배열을 반환하는 `query` 하나)를 인자로 받는다. 운영은 `@neondatabase/serverless`, 테스트는 PGlite로 구현한다.
- 스키마(polls / options / votes, spec의 제약 포함)는 하나의 SQL 정의로 관리하고, npm 스크립트로 `DATABASE_URL`의 DB에 적용한다. 테스트는 같은 정의를 새 PGlite 인스턴스에 적용한다.
- `listPolls(voterId)`는 최신순으로 id·Question·생성 시각·Vote 여부를 반환한다 (표 수 미포함).
- Next.js 16 문서는 `node_modules/next/dist/docs/`를 참고한다.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Vitest + PGlite 테스트 환경이 `npm test`로 돌아간다
- [x] 스키마 적용 스크립트가 로컬 `DATABASE_URL`(Neon)에 테이블을 만든다 (여러 번 실행해도 안전)
- [x] 홈 화면이 Neon에서 Poll 목록을 읽고, 비어 있으면 빈 상태 문구를 보여준다
- [x] 테스트: Poll이 없으면 `listPolls`가 빈 배열을 반환한다
- [x] 테스트: 스키마에 직접 넣은 Poll들이 최신순으로, 표 수 없이 반환된다
