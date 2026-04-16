// hooks/keyword-detector.mjs
import { readFileSync } from 'node:fs';

const PIPELINE_KEYWORDS = new Map([
  ['autopilot:', 'autopilot'],
  ['plan:', 'planner'],
  ['계획:', 'planner'],
  ['design:', 'designer'],
  ['디자인:', 'designer'],
  ['execute:', 'executor'],
  ['구현:', 'executor'],
  ['review:', 'reviewer'],
  ['리뷰:', 'reviewer'],
  ['verify:', 'verifier'],
  ['검증:', 'verifier'],
  ['commit:', 'git-master'],
  ['커밋:', 'git-master'],
]);

const SKILL_KEYWORDS = new Map([
  ['brainstorm', 'brainstorming'],
  ['기획', 'brainstorming'],
  ['debug', 'systematic-debugging'],
  ['디버그', 'systematic-debugging'],
  ['tdd', 'test-driven-development'],
  ['테스트먼저', 'test-driven-development'],
  ['plan it', 'writing-plans'],
  ['계획써줘', 'writing-plans'],
  ['코드리뷰', 'requesting-code-review'],
]);

export function detectPipelineKeyword(prompt) {
  const lower = prompt.toLowerCase();
  for (const [keyword, agent] of PIPELINE_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) return agent;
  }
  return null;
}

export function detectSkillKeyword(prompt) {
  const lower = prompt.toLowerCase();
  for (const [keyword, skill] of SKILL_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) return skill;
  }
  return null;
}

function formatPipelineMessage(agent) {
  if (agent === 'autopilot') {
    return '[KEYWORD: autopilot] 전체 파이프라인을 자동 실행하세요. plan → execute → review → verify → commit 순서로 진행하세요.';
  }
  return `[KEYWORD: ${agent}] ${agent} 에이전트를 호출하세요. 작업 완료 후 execution/log.md에 기록하세요.`;
}

function formatSkillMessage(skill) {
  return `[SKILL: ${skill}] skills/${skill}/SKILL.md 를 Read 후 지시에 따르세요.`;
}

// 훅으로 실행될 때만 stdin 읽기
const isMain = process.argv[1] && (
  process.argv[1].endsWith('keyword-detector.mjs') ||
  process.argv[1].replace(/\\/g, '/').endsWith('keyword-detector.mjs')
);

if (isMain) {
  let raw;
  try {
    raw = readFileSync('/dev/stdin', 'utf8');
  } catch {
    // Windows fallback: read from process.stdin asynchronously
    const chunks = [];
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) chunks.push(chunk);
    raw = chunks.join('');
  }

  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }

  const prompt = input.prompt || '';
  const messages = [];

  const agent = detectPipelineKeyword(prompt);
  if (agent) {
    // 명시적 파이프라인 키워드가 있으면 해당 에이전트로
    messages.push(formatPipelineMessage(agent));
  } else {
    // 키워드 없어도 항상 planner부터 시작
    messages.push('[ENTRY] 모든 요청은 planner 에이전트부터 시작합니다. planner를 호출하여 작업성 여부를 판단하세요. 작업성이면 tasks/ 문서를 생성하고, 비작업성이면 직접 답변합니다.');
  }

  const skill = detectSkillKeyword(prompt);
  if (skill) messages.push(formatSkillMessage(skill));

  process.stdout.write(messages.join('\n'));
}
