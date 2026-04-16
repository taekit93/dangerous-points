# KHT Harness — 에이전트 카탈로그

## 에이전트 목록

| 에이전트 | 모델 | 역할 | 생성 문서 |
|---------|------|------|----------|
| `planner` | opus | 요구사항 분석, 계획 수립 | plan/prd.md, features.md, adr.md(초안), open-questions.md |
| `designer` | sonnet | UI/UX 설계, 퍼블리싱 구현 | execution/log.md (append) |
| `executor` | sonnet | 코드 구현, 최소 diff | execution/log.md, decisions.md |
| `reviewer` | opus | 코드 품질·보안 리뷰 | plan/adr.md (보완), execution/log.md |
| `verifier` | sonnet | 빌드/테스트 증거 검증 | execution/issues.md, execution/log.md |
| `git-master` | sonnet | Conventional Commits 커밋 | execution/learnings.md, execution/log.md |

## 위임 규칙

**에이전트 위임:** 멀티파일 변경, 리팩토링, 디버깅, 리뷰, 계획, 리서치

**직접 처리:** 단순 파일 조회, 단일 커맨드, 간단한 질문 답변

**자기 승인 금지:** 작성자와 검토자는 항상 다른 에이전트

## 에이전트 선택 가이드

| 작업 유형 | 에이전트 |
|---------|---------|
| 기능 계획 수립 | planner |
| UI/화면 설계 | designer |
| 코드 구현 | executor |
| 코드 리뷰 | reviewer |
| 완료 검증 | verifier |
| 커밋 | git-master |
