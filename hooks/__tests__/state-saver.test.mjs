// hooks/__tests__/state-saver.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatNotepadEntry } from '../state-saver.mjs';

test('활성 파이프라인 엔트리 생성', () => {
  const pipeline = {
    active: true,
    stage: 'execute',
    taskPath: 'tasks/2025-04-15-user-auth',
    verified: false,
  };
  const entry = formatNotepadEntry(pipeline, '2025-04-15T10:30:00.000Z');
  assert.ok(entry.includes('execute'));
  assert.ok(entry.includes('tasks/2025-04-15-user-auth'));
  assert.ok(entry.includes('아니오'));
});

test('검증완료 파이프라인 엔트리', () => {
  const pipeline = { active: true, stage: 'verify', taskPath: 'tasks/test', verified: true };
  const entry = formatNotepadEntry(pipeline, '2025-04-15T10:30:00.000Z');
  assert.ok(entry.includes('예'));
});
