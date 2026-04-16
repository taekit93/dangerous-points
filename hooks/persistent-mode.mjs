// hooks/persistent-mode.mjs
import { readFileSync, existsSync } from 'node:fs';

export function countPendingQuestions(taskPath) {
  if (!taskPath) return 0;
  const oqPath = `${taskPath}/plan/open-questions.md`;
  if (!existsSync(oqPath)) return 0;
  const content = readFileSync(oqPath, 'utf8');
  return (content.match(/\[미결\]/g) || []).length;
}

export function shouldBlock(pipeline, pendingCount = 0) {
  if (!pipeline) return { block: false };
  if (!pipeline.active) return { block: false };

  // 머지 불가 상태: 테스트 실패 → 머지 시도 차단
  if (pipeline.mergeable === false) {
    return {
      block: true,
      reason: `테스트가 실패했습니다. worktree(${pipeline.worktreePath || '경로 미설정'})에서 테스트를 수정하고 통과시킨 후 머지하세요.`,
    };
  }

  if (pipeline.verified) return { block: false };

  // plan 단계: [미결] 항목이 있으면 차단
  if (pipeline.stage === 'plan' && pendingCount > 0) {
    return {
      block: true,
      reason: `계획 단계에서 미결 항목 ${pendingCount}개가 남아있습니다. open-questions.md의 모든 [미결] 항목을 해결한 후 진행하세요.`,
    };
  }

  // design 단계: 사용자 승인 없이 넘어가려 하면 차단
  if (pipeline.stage === 'design' && !pipeline.designApproved) {
    return {
      block: true,
      reason: `디자인 검토가 완료되지 않았습니다. 사용자에게 plan/design/ 결과물을 보여주고 피드백을 받은 후 진행하세요.`,
    };
  }

  return {
    block: true,
    reason: `파이프라인이 완료되지 않았습니다. 현재 단계: ${pipeline.stage}. verifier로 검증을 완료한 후 종료하세요.`,
  };
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('persistent-mode.mjs') ||
  process.argv[1].replace(/\\/g, '/').endsWith('persistent-mode.mjs')
);

if (isMain) {
  const pipelinePath = '.harness/pipeline.json';
  if (!existsSync(pipelinePath)) process.exit(0);

  let pipeline = null;
  try {
    pipeline = JSON.parse(readFileSync(pipelinePath, 'utf8'));
  } catch {
    process.exit(0);
  }

  const pendingCount = countPendingQuestions(pipeline.taskPath);
  const result = shouldBlock(pipeline, pendingCount);
  if (result.block) {
    process.stdout.write(JSON.stringify({ decision: 'block', reason: result.reason }));
  }
}
