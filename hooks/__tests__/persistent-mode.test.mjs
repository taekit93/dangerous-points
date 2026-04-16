// hooks/__tests__/persistent-mode.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldBlock } from '../persistent-mode.mjs';

test('active + 미검증 → blockStop', () => {
  const pipeline = { active: true, stage: 'execute', verified: false };
  const result = shouldBlock(pipeline, 0);
  assert.equal(result.block, true);
  assert.ok(result.reason.includes('execute'));
});

test('active + 검증완료 → 허용', () => {
  const pipeline = { active: true, stage: 'verify', verified: true };
  const result = shouldBlock(pipeline, 0);
  assert.equal(result.block, false);
});

test('비활성 → 허용', () => {
  const pipeline = { active: false, stage: 'done', verified: false };
  const result = shouldBlock(pipeline, 0);
  assert.equal(result.block, false);
});

test('pipeline null → 허용', () => {
  const result = shouldBlock(null, 0);
  assert.equal(result.block, false);
});

test('plan 단계 + 미결 항목 있음 → blockStop', () => {
  const pipeline = { active: true, stage: 'plan', verified: false };
  const result = shouldBlock(pipeline, 2);
  assert.equal(result.block, true);
  assert.ok(result.reason.includes('미결 항목 2개'));
});

test('plan 단계 + 미결 항목 없음 → 허용 안 함 (파이프라인 미완료)', () => {
  const pipeline = { active: true, stage: 'plan', verified: false };
  const result = shouldBlock(pipeline, 0);
  assert.equal(result.block, true);
  assert.ok(result.reason.includes('plan'));
});

test('design 단계 + 미승인 → blockStop', () => {
  const pipeline = { active: true, stage: 'design', verified: false, designApproved: false };
  const result = shouldBlock(pipeline, 0);
  assert.equal(result.block, true);
  assert.ok(result.reason.includes('디자인 검토'));
});

test('design 단계 + 승인 완료 → 파이프라인 미완료로 차단', () => {
  const pipeline = { active: true, stage: 'design', verified: false, designApproved: true };
  const result = shouldBlock(pipeline, 0);
  assert.equal(result.block, true);
  assert.ok(result.reason.includes('design'));
});

test('mergeable false → 머지 차단', () => {
  const pipeline = { active: true, stage: 'verify', verified: false, mergeable: false, worktreePath: '.worktrees/test' };
  const result = shouldBlock(pipeline, 0);
  assert.equal(result.block, true);
  assert.ok(result.reason.includes('테스트가 실패'));
});

test('mergeable false + verified true → 여전히 차단 (테스트 실패가 우선)', () => {
  const pipeline = { active: true, stage: 'verify', verified: true, mergeable: false };
  const result = shouldBlock(pipeline, 0);
  assert.equal(result.block, true);
});
