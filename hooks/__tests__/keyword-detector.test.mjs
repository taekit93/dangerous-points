// hooks/__tests__/keyword-detector.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectPipelineKeyword, detectSkillKeyword } from '../keyword-detector.mjs';

test('plan: 키워드 감지', () => {
  assert.equal(detectPipelineKeyword('plan: user-auth 만들어줘'), 'planner');
});

test('계획: 키워드 감지 (한국어)', () => {
  assert.equal(detectPipelineKeyword('계획: user-auth'), 'planner');
});

test('design: 키워드 감지', () => {
  assert.equal(detectPipelineKeyword('design: 로그인 화면'), 'designer');
});

test('디자인: 키워드 감지 (한국어)', () => {
  assert.equal(detectPipelineKeyword('디자인: 로그인 화면'), 'designer');
});

test('autopilot: 키워드 감지', () => {
  assert.equal(detectPipelineKeyword('autopilot: 전체 기능 만들어줘'), 'autopilot');
});

test('키워드 없으면 null 반환 (훅에서는 planner로 폴백됨)', () => {
  assert.equal(detectPipelineKeyword('그냥 일반적인 질문이야'), null);
});

test('brainstorm 스킬 키워드 감지', () => {
  assert.equal(detectSkillKeyword('brainstorm 해줘'), 'brainstorming');
});

test('기획 스킬 키워드 감지 (한국어)', () => {
  assert.equal(detectSkillKeyword('기획 도와줘'), 'brainstorming');
});

test('debug 스킬 키워드 감지', () => {
  assert.equal(detectSkillKeyword('debug 해줘'), 'systematic-debugging');
});

test('스킬 키워드 없으면 null 반환', () => {
  assert.equal(detectSkillKeyword('일반 질문'), null);
});
