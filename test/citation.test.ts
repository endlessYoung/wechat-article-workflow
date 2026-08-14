import { test } from 'node:test';
import assert from 'node:assert/strict';
import { format } from '../src/index.js';
import { parseInline } from '../src/core/inline.js';
import { parseMarkdown } from '../src/core/parser.js';
import type { Block } from '../src/core/types.js';

test('行内 [1] 解析为 cite token', () => {
  const tokens = parseInline('结论[1]与证据[2]。');
  assert.deepEqual(
    tokens.map((t) => t.type),
    ['text', 'cite', 'text', 'cite', 'text'],
  );
  assert.equal((tokens[1] as { id: string }).id, '1');
});

test('[1](url) 链接不被误判为引用', () => {
  const tokens = parseInline('见[1](https://a.b)');
  assert.deepEqual(
    tokens.map((t) => t.type),
    ['text', 'link'],
  );
});

test('解析 ::: references 容器（管道字段）', () => {
  const blocks = parseMarkdown(
    '::: references\n[1]: 标题A | 来源A | 2025-01 | https://a.b/c\n[2]: 标题B | 来源B\n:::',
  );
  const refs = blocks[0] as Extract<Block, { type: 'references' }>;
  assert.equal(refs.type, 'references');
  assert.equal(refs.entries.length, 2);
  assert.deepEqual(refs.entries[0], {
    id: '1',
    title: '标题A',
    source: '来源A',
    date: '2025-01',
    url: 'https://a.b/c',
  });
  assert.deepEqual(refs.entries[1], {
    id: '2',
    title: '标题B',
    source: '来源B',
    date: undefined,
    url: undefined,
  });
});

test('引用容器支持纯列表项自动编号', () => {
  const blocks = parseMarkdown('::: references\n- 标题X | 来源X\n- 标题Y | 来源Y\n:::');
  const refs = blocks[0] as Extract<Block, { type: 'references' }>;
  assert.deepEqual(
    refs.entries.map((e) => e.id),
    ['1', '2'],
  );
});

test('format 输出上标链接与参考文献区', () => {
  const { html } = format('结论[1]。\n\n::: references\n[1]: 标题 | 来源 | 2025 | https://a.b/c\n:::');
  assert.match(html, /<sup style="[^"]*"><a href="#ref-1"[^>]*>1<\/a><\/sup>/);
  assert.match(html, /<li id="ref-1"[^>]*>/);
  assert.ok(html.includes('参考文献'));
  assert.ok(html.includes('https://a.b/c'));
});

test('无对应条目的引用标记渲染为无链接上标并告警', () => {
  const { html, warnings } = format('结论[9]。');
  assert.match(html, /<sup style="[^"]*">9<\/sup>/);
  assert.ok(!html.includes('#ref-9'));
  assert.ok(warnings.some((w) => w.includes('[9]')));
});

test('统计 citations 与 references', () => {
  const { stats } = format('A[1] B[2]。\n\n::: references\n[1]: x\n[2]: y\n:::');
  assert.equal(stats.citations, 2);
  assert.equal(stats.references, 2);
});

test('参考文献标题被 HTML 转义', () => {
  const { html } = format('x\n\n::: references\n[1]: <script>alert(1)</script>\n:::');
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});
