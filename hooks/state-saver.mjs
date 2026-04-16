// hooks/state-saver.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

export function formatNotepadEntry(pipeline, isoTimestamp) {
  return [
    ``,
    `## 컨텍스트 저장 — ${isoTimestamp}`,
    `- 현재 단계: ${pipeline.stage}`,
    `- 작업 경로: ${pipeline.taskPath || '없음'}`,
    `- 검증 완료: ${pipeline.verified ? '예' : '아니오'}`,
    ``,
  ].join('\n');
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('state-saver.mjs') ||
  process.argv[1].replace(/\\/g, '/').endsWith('state-saver.mjs')
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

  if (!pipeline?.active) process.exit(0);

  mkdirSync('.harness', { recursive: true });
  const existing = existsSync('.harness/notepad.md')
    ? readFileSync('.harness/notepad.md', 'utf8')
    : '';
  const entry = formatNotepadEntry(pipeline, new Date().toISOString());
  writeFileSync('.harness/notepad.md', existing + entry);
}
