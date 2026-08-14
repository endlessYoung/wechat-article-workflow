import { test } from 'node:test';
import assert from 'node:assert/strict';
import { format, getTheme, listThemeIds } from '../src/index.js';

test('anthropic 主题已注册', () => {
  assert.ok(listThemeIds().includes('anthropic'));
  assert.equal(getTheme('anthropic').id, 'anthropic');
});

test('anthropic 主题输出暖白纸张包裹 + 衬线正文', () => {
  const { html } = format('正文段落。', { theme: 'anthropic' });
  assert.ok(html.includes('background-color:#faf9f5'), '应包含象牙底');
  assert.ok(html.includes('font-family:Georgia'), '正文应为衬线');
  assert.ok(html.startsWith('<section style='), '应包裹整篇 section');
});

test('anthropic 引用上标为陶土色并链接到条目', () => {
  const { html } = format('结论[1]。\n\n::: references\n[1]: 标题 | 来源\n:::', { theme: 'anthropic' });
  assert.ok(html.includes('color:#d97757'));
  assert.ok(html.includes('href="#ref-1"'));
});

test('minimal 主题不包裹 article', () => {
  const { html } = format('正文', { theme: 'minimal' });
  assert.ok(!html.startsWith('<section'), 'minimal 不应有整篇包裹');
  assert.ok(html.startsWith('<p style='));
});

test('含引号的字体名被正确转义，不破坏 style 属性', () => {
  const { html } = format('正文', { theme: 'anthropic' });
  assert.ok(html.includes('&quot;Times New Roman&quot;'));
});
