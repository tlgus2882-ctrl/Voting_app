# 03: Operator가 Poll을 올린다

Spec: `.scratch/voting-app/spec.md`

**What to build:** 로그인한 Operator가 관리 페이지의 폼에 Question과 Option 2~10개를 입력해 Poll을 올린다. Option 입력칸은 추가·삭제할 수 있다(최소 2, 최대 10). 올리면 홈 목록 맨 위에 새 Poll의 Question이 보인다. 잘못된 입력은 폼에 오류로 표시된다.

- `createPoll(question, options)`: 앞뒤 공백 제거 후 검증 — Question 1~200자, Option 1~100자, Option 2~10개, Poll 내 Option 중복 불가. Poll과 Options를 원자적으로 저장하고, Option은 입력 순서(position)를 보존한다.
- 생성 Server Action은 Operator 세션을 확인한다 (02).

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [ ] 폼으로 Poll을 올리면 홈 목록 맨 위에 나타난다
- [ ] 로그인하지 않은 요청으로는 Poll을 만들 수 없다
- [ ] 테스트: Option 1개·11개 거부, 빈 Question 거부
- [ ] 테스트: Question 200자 허용·201자 거부, Option 100자 허용·101자 거부
- [ ] 테스트: 공백 제거 후 같은 Option 두 개면 거부
- [ ] 테스트: 정상 생성 시 Question·Option이 trim되고 입력 순서가 보존된다
- [ ] 테스트: 검증 실패 시 아무것도 저장되지 않는다
