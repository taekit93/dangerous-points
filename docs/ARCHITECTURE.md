# KHT Harness — 아키텍처

## 개요

Claude Code 위에서 동작하는 훅 강제형 에이전트 오케스트레이션 시스템.
4개 레이어가 유기적으로 동작한다.

```
① CLAUDE.md          — 오케스트레이션 규칙, 에이전트 카탈로그, 스킬 로딩 지시
② .claude/agents/    — 6개 전문 에이전트 정의
③ hooks/             — 파이프라인 강제 스크립트 (Node.js ESM)
④ skills/            — 자급자족 스킬 (Superpowers 복사본)
```

## 실행 흐름

```
사용자 입력
  → keyword-detector 훅 (UserPromptSubmit)
  → [KEYWORD] 또는 [SKILL] system-reminder 주입
  → Claude가 해당 에이전트 호출
  → 에이전트 작업 수행 + tasks/ 문서 업데이트
  → persistent-mode 훅 (Stop) — 미검증 시 중단 차단
```

## 파이프라인

**일반 개발:** Plan → Execute → Review → Verify → Commit

**UI 포함:**   Plan → Design → Execute → Review → Verify → Commit

## 훅 스크립트

| 파일 | 이벤트 | 역할 |
|------|--------|------|
| `hooks/keyword-detector.mjs` | UserPromptSubmit | 키워드 감지 → 에이전트/스킬 주입 |
| `hooks/persistent-mode.mjs` | Stop | 파이프라인 미완료 시 중단 차단 |
| `hooks/state-saver.mjs` | PreCompact | 컨텍스트 압축 전 상태 보존 |

## 런타임 상태

```
.harness/              (gitignore — 임시 런타임)
  pipeline.json        현재 파이프라인 단계
  notepad.md           컨텍스트 압축 복구 메모
```

## 문서 구조

```
docs/                  시스템 문서
tasks/
  {yyyy-MM-dd}-{name}/
    plan/              prd, features, adr, open-questions
    execution/         log, decisions, issues, learnings
```
