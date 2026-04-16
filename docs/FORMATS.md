# KHT Harness — 문서 형식 가이드라인

에이전트들이 문서 작성 시 참조하는 표준 형식.

---

## plan/design/

디자이너가 생성하는 HTML/CSS 퍼블리싱 결과물 폴더.

```
plan/design/
  index.html          ← 메인 또는 화면 목록
  {화면명}.html       ← 화면별 HTML
  style.css           ← 공통 스타일
  {화면명}.css        ← 화면별 스타일 (필요 시)
  assets/             ← 이미지, 아이콘 등
```

인증키 필요 영역 placeholder 규칙:
```html
<!-- [{서비스명} 영역] {API명} 연동 필요 -->
<!-- API 키 발급 후: {공식문서 URL} -->
<div class="{area-class}">
  <div class="{area-class}__placeholder">
    <span>{서비스명} 영역 ({API명} 연동 필요)</span>
  </div>
</div>
```

---

## plan/prd.md

```markdown
# PRD — {작업명}

**작성일:** yyyy-MM-dd
**작성자:** planner
**상태:** 초안 | 확정

## 목적
무엇을 왜 만드는가.

## 대상 사용자
누가 사용하는가.

## 핵심 요구사항
- 기능 요구사항 (반드시 구현)
- 비기능 요구사항 (성능, 보안 등)

## 범위
### In Scope
- 이번 작업에 포함

### Out of Scope
- 이번 작업에 미포함

## 성공 기준
어떤 상태면 완료인가.
```

---

## plan/features.md

```markdown
# 기능 리스트 — {작업명}

**작성일:** yyyy-MM-dd

| 기능 | 우선순위 | 설명 | 완료 |
|------|---------|------|------|
| 기능1 | P0 | 설명 | [ ] |
| 기능2 | P1 | 설명 | [ ] |

P0: 반드시 구현 / P1: 중요 / P2: 선택
```

---

## plan/adr.md

```markdown
# ADR — {작업명}

**작성일:** yyyy-MM-dd
**작성자:** planner (초안) / reviewer (검토 후 보완)

## 결정 {N}: {결정 제목}

**상태:** 제안 | 확정 | 폐기

**맥락**
왜 이 결정이 필요했는가.

**결정**
무엇을 선택했는가.

**고려한 대안**
- 대안 A — 거부 이유
- 대안 B — 거부 이유

**결과**
이 결정의 영향.
```

---

## plan/open-questions.md

```markdown
# 미결 질문 — {작업명}

**작성일:** yyyy-MM-dd

- [미결] 질문 내용 — 왜 중요한가
- [완료] 질문 내용 → 결정 내용 (decisions.md 참고)
- [제외] 질문 내용 → 이번 스코프 밖

상태 규칙:
- [미결]: 아직 답 없음
- [완료]: 답변 확정됨
- [제외]: 이번 작업 범위 밖으로 결정

verifier는 완료 전 [미결] 항목이 0개인지 확인한다.
```

---

## execution/log.md

```markdown
# 실행 로그 — {작업명}

## [{단계}] {HH:MM} — {에이전트명}
{이 단계에서 무엇을 했는가. 실제 커맨드 출력 포함.}
```

**시간({HH:MM}) 획득 규칙:**
`{HH:MM}` 값은 반드시 `date +%H:%M` bash 명령을 실행하여 실제 시스템 시간을 획득한다.
시스템 프롬프트의 currentDate 값(날짜만 포함, 시간 없음)을 해석하거나 시간을 추정하는 것은 금지된다.

에이전트별 단계명:
- planner → `[Plan]`
- designer → `[Design]`
- executor → `[Execute]`
- reviewer → `[Review]`
- verifier → `[Verify]`
- git-master → `[Commit]`

---

## execution/decisions.md

```markdown
# 결정 기록 — {작업명}

## {yyyy-MM-dd HH:MM} — {에이전트명}

**결정:** 무엇을 선택했는가
**이유:** 왜 이 결정을 했는가
**대안:** 고려했으나 거부한 것들
```

---

## execution/issues.md

```markdown
# 이슈 기록 — {작업명}

## 이슈 {N}: {제목}

**발견자:** {에이전트명}
**발견 시각:** {yyyy-MM-dd HH:MM}
**심각도:** 높음 | 보통 | 낮음

**현상**
무슨 문제가 있었는가.

**원인**
왜 발생했는가.

**해결**
어떻게 해결했는가.
```

---

## execution/learnings.md

```markdown
# 학습 기록 — {작업명}

**작성자:** git-master
**작성일:** yyyy-MM-dd

## 잘 된 것
- 다음에도 이렇게 하면 좋을 것들

## 개선점
- 다음에는 다르게 해야 할 것들

## 다음 작업에 쓸 인사이트
- 이 작업에서 발견한 재사용 가능한 패턴이나 지식
```
