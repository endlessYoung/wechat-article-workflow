import { test } from 'node:test';
import assert from 'node:assert/strict';
import { format } from '../src/index.js';

const SAMPLE = `# 标题

正文段落，包含 **加粗** 与 [链接](https://a.b)。

> 引用

\`\`\`js
const x = 1;
\`\`\`

- 项目一
- 项目二

---

::: tip 提示
内容
:::
`;

test('format 返回 html / theme / stats / warnings', () => {
  const result = format(SAMPLE);
  assert.equal(typeof result.html, 'string');
  assert.equal(result.theme, 'minimal');
  assert.equal(result.stats.headings, 1);
  assert.equal(result.stats.paragraphs, 1);
  assert.equal(result.stats.blockquotes, 1);
  assert.equal(result.stats.codeBlocks, 1);
  assert.equal(result.stats.lists, 1);
  assert.equal(result.stats.listItems, 2);
  assert.equal(result.stats.dividers, 1);
  assert.equal(result.stats.callouts, 1);
  assert.equal(result.stats.totalBlocks, 7);
  assert.deepEqual(result.warnings, []);
});

test('空输入返回空 html 与告警', () => {
  const result = format('');
  assert.equal(result.html, '');
  assert.ok(result.warnings.some((w) => w.includes('为空')));
});

test('H4 触发告警', () => {
  const result = format('#### 深层标题');
  assert.ok(result.warnings.some((w) => w.includes('H4')));
});

test('图片触发告警', () => {
  const result = format('![alt](https://a.b/x.png)');
  assert.equal(result.stats.images, 1);
  assert.ok(result.warnings.some((w) => w.includes('图片')));
});

test('未知主题抛错', () => {
  assert.throws(() => format('x', { theme: 'not-exist' }), /未知主题/);
});
