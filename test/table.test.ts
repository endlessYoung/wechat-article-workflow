import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown } from '../src/core/parser.js';
import { renderBlocks } from '../src/core/renderer.js';
import { minimal } from '../src/themes/minimal.js';
import type { Block } from '../src/core/types.js';

const TABLE = `| 场景 | 用这个 |
|------|--------|
| 状态丢了无所谓 | \`remember\` |
| 丢了要重新操作 | \`rememberSaveable\` |
`;

test('解析 GFM 表格：表头、对齐、正文行', () => {
  const blocks = parseMarkdown(TABLE);
  const t = blocks[0] as Extract<Block, { type: 'table' }>;
  assert.equal(t.type, 'table');
  assert.deepEqual(t.headers, ['场景', '用这个']);
  assert.equal(t.rows.length, 2);
  assert.deepEqual(t.rows[0], ['状态丢了无所谓', '`remember`']);
  assert.deepEqual(t.rows[1], ['丢了要重新操作', '`rememberSaveable`']);
});

test('解析表格对齐标记（:---: 居中 / ---: 右对齐）', () => {
  const blocks = parseMarkdown('| a | b | c |\n|:--|:-:|--:|\n| x | y | z |\n');
  const t = blocks[0] as Extract<Block, { type: 'table' }>;
  assert.deepEqual(t.align, ['left', 'center', 'right']);
});

test('表格后紧跟标题不会被吞进表格', () => {
  const blocks = parseMarkdown(TABLE + '\n## 下一节\n');
  assert.equal(blocks[0].type, 'table');
  assert.equal(blocks[1].type, 'heading');
});

test('表格紧跟在段落后（无空行）也能被识别', () => {
  const blocks = parseMarkdown('这是引言。\n| a | b |\n|---|---|\n| x | y |\n');
  assert.equal(blocks[0].type, 'paragraph');
  assert.equal(blocks[1].type, 'table');
  const t = blocks[1] as Extract<Block, { type: 'table' }>;
  assert.deepEqual(t.headers, ['a', 'b']);
});

test('渲染表格为内联样式 table/th/td，偶数行带斑马纹', () => {
  const html = renderBlocks(parseMarkdown(TABLE), minimal);
  assert.match(html, /<table style="[^"]*border-collapse:collapse/);
  assert.ok(html.includes('<th style='));
  assert.ok(html.includes('<td style='));
  // 第二行（rIdx=1）为偶数行 → 应带斑马纹背景
  assert.match(html, /<tr><td style="[^"]*background-color:#fafbfc/);
});

test('表格单元格内行内标记被渲染（加粗/行内代码）', () => {
  const html = renderBlocks(parseMarkdown('| a | b |\n|---|---|\n| **加粗** | `code` |\n'), minimal);
  assert.ok(html.includes('<strong style='));
  assert.ok(html.includes('<code style='));
});
