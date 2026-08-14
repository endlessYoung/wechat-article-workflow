import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { format, formatToText } from '../src/engine.js';

const root = fileURLToPath(new URL('..', import.meta.url));

function readExample(name) {
  return readFileSync(`${root}examples/${name}`, 'utf8');
}

test('engine: 示例输入 → 预期输出（快照）', () => {
  const input = readExample('input.md');
  const expected = readExample('expected-output.md');
  assert.equal(formatToText(input), expected);
});

test('engine: 返回结构与统计', () => {
  const { text, stats, warnings, meta } = format('# 标题\n\n正文\n\n```js\nx\n```');
  assert.equal(typeof text, 'string');
  assert.equal(stats.headings.h1, 1);
  assert.equal(stats.paragraphs, 1);
  assert.equal(stats.codeBlocks, 1);
  assert.deepEqual(warnings, []);
  assert.equal(meta.engine, 'wechat-formatting-skill');
});

test('engine: 相邻标题警告', () => {
  const { warnings } = format('## 甲\n\n## 乙');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /相邻标题/);
});

test('engine: 超长段落警告（默认不拆分）', () => {
  const longPara = '好。'.repeat(120); // 240 字
  const { warnings } = format(`# 标题\n\n${longPara}`);
  assert.ok(warnings.some((w) => w.includes('段落过长')));
});

test('engine: splitLongParagraphs 按句子拆分', () => {
  const longPara =
    '这是第一句话。这是第二句话。这是第三句话。这是第四句话。这是第五句话。这是第六句话。这是第七句话。这是第八句话。';
  const { text, stats } = format(longPara, {
    splitLongParagraphs: true,
    maxParagraphChars: 40,
  });
  assert.ok(stats.longParagraphs >= 1);
  assert.ok(text.split('\n\n').length >= 2);
});

test('engine: 占位符替换', () => {
  const { text, stats } = format('# 标题\n\n{{transition}}\n\n正文');
  assert.equal(stats.transitions, 1);
  assert.ok(text.includes('理解了背景'));
});

test('engine: insertTransitions 在章节无正文时插入', () => {
  const { text, stats } = format('# 标题\n\n## 甲\n\n## 乙', {
    insertTransitions: true,
  });
  assert.equal(stats.transitions, 1);
  assert.ok(text.includes('## 甲') === false || text.split('## 甲')[0].includes('理解了背景'));
});

test('engine: numberHeadings 只编号章节层级', () => {
  const { text } = format('# 文章标题\n\n## 第一节\n\n正文\n\n## 第二节\n\n正文', {
    numberHeadings: true,
  });
  assert.ok(text.includes('# 文章标题'));
  assert.ok(text.includes('## 01 | 第一节'));
  assert.ok(text.includes('## 02 | 第二节'));
});

test('engine: 代码块内容原样保留', () => {
  const { text } = format('# 标题\n\n```py\nprint("a,b,c")\n```');
  assert.ok(text.includes('print("a,b,c")'));
  assert.ok(!text.includes('，'));
});

test('engine: 引用样式 plain 与 markdown', () => {
  const src = '# 标题\n\n> 引用内容';
  assert.ok(format(src, { quoteStyle: 'plain' }).text.includes('「引用内容」'));
  assert.ok(format(src, { quoteStyle: 'markdown' }).text.includes('> 引用内容'));
});

test('engine: 幂等性（二次排版结果一致）', () => {
  const src = readExample('input.md');
  const once = formatToText(src);
  const twice = formatToText(once);
  assert.equal(once, twice);
});
