import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHeading } from '../src/rules/headings.js';

test('normalizeHeading: 标记与编号写法规范化', () => {
  assert.equal(normalizeHeading('习惯的复利效应', 2, 2, {}, {}), '## 习惯的复利效应');
  assert.equal(normalizeHeading('01|习惯的复利效应', 2, 2, {}, {}), '## 01 | 习惯的复利效应');
  assert.equal(normalizeHeading('01｜习惯', 2, 2, {}, {}), '## 01 | 习惯');
});

test('normalizeHeading: 文本规则生效（全角冒号）', () => {
  assert.equal(normalizeHeading('结尾:从今天开始', 2, 2, {}, {}), '## 结尾：从今天开始');
});

test('normalizeHeading: 自动编号', () => {
  const counters = { 1: 0, 2: 0 };
  const opts = { numberHeadings: true, headingNumberZeroPad: 2 };
  assert.equal(normalizeHeading('第一节', 2, 2, counters, opts), '## 01 | 第一节');
  assert.equal(normalizeHeading('第二节', 2, 2, counters, opts), '## 02 | 第二节');
});

test('normalizeHeading: 已编号标题跳过自动编号', () => {
  const counters = { 2: 0 };
  const opts = { numberHeadings: true };
  assert.equal(normalizeHeading('03 | 已有编号', 2, 2, counters, opts), '## 03 | 已有编号');
});

test('normalizeHeading: 只给章节层级编号', () => {
  const counters = { 1: 0, 2: 0 };
  const opts = { numberHeadings: true };
  // H1 为标题，章节层级为 2，H1 不编号
  assert.equal(normalizeHeading('文章标题', 1, 2, counters, opts), '# 文章标题');
  assert.equal(normalizeHeading('小节', 2, 2, counters, opts), '## 01 | 小节');
});
