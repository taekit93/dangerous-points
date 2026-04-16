# Getting Started — KHT Harness

## 요구사항

- Claude Code (설치 필요)
- Node.js 18+

## 새 프로젝트에 적용하기

이 시스템을 새 프로젝트에 복사해서 사용하려면:

1. 아래 파일/폴더를 대상 프로젝트에 복사:
   - `CLAUDE.md`
   - `.claude/agents/`
   - `.claude/settings.json`
   - `hooks/`
   - `skills/`
   - `docs/FORMATS.md`

2. Claude Code 재시작 (훅 등록 적용)

3. 동작 확인:
   - `plan: 테스트` 입력
   - system-reminder에 `[KEYWORD: planner] planner 에이전트를 호출하세요.` 주입 확인

## 새 작업 시작

1. 사용자가 `plan: {작업명}` 입력
2. keyword-detector 훅이 planner 에이전트 자동 주입
3. planner가 `tasks/{yyyy-MM-dd}-{작업명}/plan/` 문서 생성
4. 사용자 확인 후 파이프라인 진행

## 매직 키워드

| 키워드 | 동작 |
|--------|------|
| `plan:` / `계획:` | planner 에이전트 호출 |
| `design:` / `디자인:` | designer 에이전트 호출 |
| `execute:` / `구현:` | executor 에이전트 호출 |
| `review:` / `리뷰:` | reviewer 에이전트 호출 |
| `verify:` / `검증:` | verifier 에이전트 호출 |
| `commit:` / `커밋:` | git-master 에이전트 호출 |
| `autopilot:` | 전체 파이프라인 자동 실행 |
| `brainstorm` / `기획` | brainstorming 스킬 로딩 |
| `debug` / `디버그` | systematic-debugging 스킬 로딩 |
| `tdd` / `테스트먼저` | test-driven-development 스킬 로딩 |

## 스킬 수동 호출

키워드로 자동 감지되지 않는 경우:
```
skills/brainstorming/SKILL.md 읽고 따라줘
```

## 작업 후 문서 확인

`tasks/` 폴더에서 작업별 문서 확인:
- `plan/open-questions.md` — [미결] 항목이 0개여야 완료
- `execution/log.md` — 모든 파이프라인 단계 기록 확인
- `execution/learnings.md` — 인사이트 기록 확인
