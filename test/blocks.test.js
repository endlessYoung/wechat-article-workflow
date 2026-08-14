import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseBlocks } from '../src/blocks.js';

test('parseBlocks: 基本块识别', () => {
  const blocks = parseBlocks('# 标题\n\n正文段落\n\n## 小节');
  assert.deepEqual(
    blocks.map((b) => b.type),
    ['heading', 'paragraph', 'heading'],
  );
  assert.equal(blocks[0].level, 1);
  assert.equal(blocks[0].text, '标题');
  assert.equal(blocks[2].level, 2);
});

test('parseBlocks: 代码围栏保护（含内部空行）', () => {
  const src = '```js\nconst a = 1;\n\nconst b = 2;\n```\n\n后面正文';
  const blocks = parseBlocks(src);
  assert.equal(blocks[0].type, 'code');
  assert.equal(blocks[0].lang, 'js');
  assert.equal(blocks[0].closed, true);
  assert.ok(blocks[0].text.includes('\n\n'));
  assert.equal(blocks[1].type, 'paragraph');
});

test('parseBlocks: 未闭合围栏标记', () => {
  const blocks = parseBlocks('```py\nprint(1)');
  assert.equal(blocks[0].type, 'code');
  assert.equal(blocks[0].closed, false);
});

test('parseBlocks: 分隔线识别', () => {
  for (const line of ['---', '***', '___']) {
    const blocks = parseBlocks(`${line}`);
    assert.equal(blocks[0].type, 'hr', `应识别 ${line}`);
  }
});

test('parseBlocks: 引用块（含空行分隔续接）', () => {
  const blocks = parseBlocks('> 第一行\n> 第二行\n\n> 第三行');
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, 'quote');
  assert.equal(blocks[0].lines.length, 3);
});

test('parseBlocks: 列表与缩进续行', () => {
  const blocks = parseBlocks('- 项目一\n- 项目二\n  续行说明\n\n1. 步骤一\n2. 步骤二');
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].type, 'list');
  assert.equal(blocks[0].ordered, false);
  assert.equal(blocks[0].lines.length, 3);
  assert.equal(blocks[1].type, 'list');
  assert.equal(blocks[1].ordered, true);
});

test('parseBlocks: 标题紧凑写法 #标题 也识别', () => {
  const blocks = parseBlocks('#标题');
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[0].level, 1);
  assert.equal(blocks[0].text, '标题');
});
