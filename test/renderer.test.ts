import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderBlocks } from '../src/core/renderer.js';
import { parseMarkdown } from '../src/core/parser.js';
import { minimal } from '../src/themes/minimal.js';
import { getTheme } from '../src/themes/registry.js';

test('标题渲染为带内联样式的 h 标签', () => {
  const html = renderBlocks(parseMarkdown('# 标题'), getTheme());
  assert.match(html, /^<h1 style="[^"]+">标题<\/h1>$/);
});

test('正文段落包含行高与字号内联样式', () => {
  const html = renderBlocks(parseMarkdown('正文'), minimal);
  assert.match(html, /<p style="[^"]*line-height:1\.75[^"]*">正文<\/p>/);
});

test('代码块用 section 包裹且内容被转义', () => {
  const html = renderBlocks(parseMarkdown('```html\n<div>x</div>\n```'), minimal);
  assert.match(html, /<section style="[^"]+">/);
  assert.match(html, /&lt;/);
  assert.match(html, />div</);
  assert.ok(!html.includes('<div>x</div>'));
  assert.doesNotMatch(html, /<!--/);
});

test('提示卡渲染图标与缺省标题', () => {
  const html = renderBlocks(parseMarkdown('::: tip\n内容\n:::'), minimal);
  assert.ok(html.includes('data:image/svg+xml'));
  assert.ok(html.includes('<img'));
  assert.ok(html.includes('%230f766e') || html.includes('#0f766e'));
  assert.ok(!html.includes('💡'));
  assert.ok(!html.includes('lightbulb 提示'));
  assert.ok(html.includes('提示'));
});

test('分割线渲染为居中的短细线', () => {
  const html = renderBlocks(parseMarkdown('---'), minimal);
  assert.match(html, /<section style="[^"]*text-align:center[^"]*"><span style="[^"]*"><\/span><\/section>/);
});

test('H4 降级为 H3 视觉（字号一致）', () => {
  const h3 = renderBlocks(parseMarkdown('### x'), minimal);
  const h4 = renderBlocks(parseMarkdown('#### x'), minimal);
  const fontSizeOf = (s: string) => (s.match(/font-size:([^;"']+)/) ?? [])[1];
  assert.equal(fontSizeOf(h4), fontSizeOf(h3));
});
