# KHT Harness — 에이전트 오케스트레이션

Claude Code 위에서 동작하는 훅 강제형 멀티에이전트 시스템.

<entry_point>
모든 요청은 예외 없이 planner 에이전트부터 시작한다.
직접 응답하거나 다른 에이전트를 먼저 호출하는 것은 금지된다.

planner는 요청을 분석하여 두 가지 중 하나로 처리한다:
- 코드 작업, 기능 구현, 수정, 설계 등 → tasks/ 문서 생성 후 파이프라인 진행
- 질문, 설명 요청, 정보 조회 등 → tasks/ 생성 없이 planner가 직접 답변
</entry_point>

<user_input_policy>
사용자 응답이 필요한 경우 반드시 AskUserQuestion 툴을 사용한다.
텍스트로 질문을 출력한 뒤 스스로 답을 내리고 진행하는 것은 금지된다.
AskUserQuestion은 사용자가 실제로 응답할 때까지 실행을 멈추므로
사용자가 응답하기 전까지 어떤 에이전트도 다음 단계로 넘어갈 수 없다.
</user_input_policy>

<operating_principles>
- 전문 작업은 해당 에이전트에 위임하라.
- 증거 없이 완료를 주장하지 마라. 항상 실제 커맨드 출력을 첨부하라.
- 최소 diff 원칙 — 요청 범위를 벗어난 코드는 건드리지 마라.
- 문서 작성 시 docs/FORMATS.md를 Read 후 형식을 따르라.
</operating_principles>

<delegation_rules>
위임 대상: 멀티파일 변경, 리팩토링, 디버깅, 리뷰, 계획, 리서치, UI 구현
직접 처리: 단순 파일 조회, 단일 커맨드, 간단한 질문 답변
자기 승인 금지: 작성자와 검토자는 항상 다른 에이전트
</delegation_rules>

<model_routing>
opus: planner, reviewer (아키텍처·분석·리뷰)
sonnet: designer, executor, verifier, git-master (구현·검증·커밋)
</model_routing>

<agent_catalog>
에이전트 정의: .claude/agents/*.md 참고

planner (opus): 요구사항 분석, 계획 수립, tasks/ 문서 생성
designer (sonnet): UI/UX 설계, 퍼블리싱 구현, 프레임워크 자동 감지
executor (sonnet): 코드 구현, 최소 diff, 빌드·테스트 검증
reviewer (opus): 코드 품질·보안 리뷰
verifier (sonnet): 빌드/테스트/린트 통과 확인, 증거 수집
git-master (sonnet): Conventional Commits 형식 커밋, 결정 트레일러
</agent_catalog>

<pipeline>
일반 개발: Plan → Execute → Review → Verify → Commit
UI 포함:   Plan → Design → Execute → Review → Verify → Commit

designer는 선택적 — keyword-detector 훅이 UI 키워드 감지 시 또는
planner가 pipeline.json에 "includeDesign": true 기록 시 삽입.
</pipeline>

<skills>
스킬 호출: skills/{name}/SKILL.md 를 Read 후 지시에 따른다.

brainstorm/기획 작업         → skills/brainstorming/SKILL.md
계획 수립/writing plans      → skills/writing-plans/SKILL.md
debug/디버깅                 → skills/systematic-debugging/SKILL.md
완료 전 검증                 → skills/verification-before-completion/SKILL.md
계획 실행                    → skills/executing-plans/SKILL.md
tdd/테스트먼저               → skills/test-driven-development/SKILL.md
코드리뷰 요청                → skills/requesting-code-review/SKILL.md
코드리뷰 수신                → skills/receiving-code-review/SKILL.md
병렬 에이전트                → skills/dispatching-parallel-agents/SKILL.md
브랜치 완료                  → skills/finishing-a-development-branch/SKILL.md
</skills>

<verification>
완료 전 반드시 확인:
- 빌드 통과 (실제 커맨드 출력 첨부)
- 테스트 통과 (실제 커맨드 출력 첨부)
- open-questions.md의 [미결] 항목 0개
- execution/log.md에 모든 단계 기록됨
</verification>

<state>
런타임 상태: .harness/pipeline.json (훅이 관리, 수동 수정 금지)
컨텍스트 메모: .harness/notepad.md (state-saver 훅이 관리)
작업 문서: tasks/{yyyy-MM-dd}-{작업명}/plan/ + execution/
</state>

<document_formats>
모든 문서 작성 시 docs/FORMATS.md를 Read 후 형식을 따르라.
</document_formats>
