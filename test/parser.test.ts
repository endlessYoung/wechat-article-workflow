import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown } from '../src/core/parser.js';
import { parseInline } from '../src/core/inline.js';
import type { Block } from '../src/core/types.js';

test('解析标题 H1-H3', () => {
  const blocks = parseMarkdown('# 一\n\n## 二\n\n### 三\n');
  assert.deepEqual(
    blocks.map((b) => [b.type, (b as { level: number }).level]),
    [
      ['heading', 1],
      ['heading', 2],
      ['heading', 3],
    ],
  );
});

test('解析段落与软换行合并', () => {
  const blocks = parseMarkdown('第一行\n第二行\n\n下一段');
  assert.equal(blocks[0].type, 'paragraph');
  assert.equal((blocks[0] as { text: string }).text, '第一行 第二行');
  assert.equal(blocks.length, 2);
});

test('解析围栏代码块并保留语言', () => {
  const blocks = parseMarkdown('```ts\nconst a = 1;\n```\n');
  const code = blocks[0] as Extract<Block, { type: 'code' }>;
  assert.equal(code.type, 'code');
  assert.equal(code.lang, 'ts');
  assert.equal(code.code, 'const a = 1;');
});

test('解析引用块', () => {
  const blocks = parseMarkdown('> 引用一行\n> 引用二行\n');
  const q = blocks[0] as Extract<Block, { type: 'blockquote' }>;
  assert.equal(q.type, 'blockquote');
  assert.equal(q.text, '引用一行\n引用二行');
});

test('解析分割线', () => {
  const blocks = parseMarkdown('---\n');
  assert.equal(blocks[0].type, 'divider');
});

test('解析无序/有序列表', () => {
  const blocks = parseMarkdown('- a\n- b\n\n1. x\n2. y\n');
  assert.equal(blocks[0].type, 'list');
  assert.equal((blocks[0] as { ordered: boolean }).ordered, false);
  assert.equal((blocks[1] as { ordered: boolean }).ordered, true);
});

test('解析嵌套列表', () => {
  const blocks = parseMarkdown('- 外层\n  1. 内层一\n  2. 内层二\n');
  const list = blocks[0] as Extract<Block, { type: 'list' }>;
  assert.equal(list.items.length, 1);
  const child = list.items[0].children?.[0] as Extract<Block, { type: 'list' }>;
  assert.ok(child);
  assert.equal(child.type, 'list');
  assert.equal(child.ordered, true);
  assert.equal(child.items.length, 2);
});

test('解析提示卡容器', () => {
  const blocks = parseMarkdown('::: tip 标题\n内容\n:::\n');
  const c = blocks[0] as Extract<Block, { type: 'callout' }>;
  assert.equal(c.type, 'callout');
  assert.equal(c.kind, 'tip');
  assert.equal(c.title, '标题');
  assert.equal(c.content, '内容');
});

test('提示卡别名归一化', () => {
  const blocks = parseMarkdown('::: danger\n重要\n:::\n');
  const c = blocks[0] as Extract<Block, { type: 'callout' }>;
  assert.equal(c.kind, 'important');
});

test('行内解析：加粗/斜体/行内码/链接/删除线/图片', () => {
  const tokens = parseInline('**加粗** *斜体* `code` [链接](https://a.b) ~~删~~ ![alt](img.png)');
  assert.deepEqual(
    tokens.map((t) => t.type),
    ['strong', 'text', 'em', 'text', 'code', 'text', 'link', 'text', 'del', 'text', 'image'],
  );
  assert.equal((tokens[6] as { href: string }).href, 'https://a.b');
});
