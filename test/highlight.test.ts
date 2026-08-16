import { test } from 'node:test';
import assert from 'node:assert/strict';
import { format } from '../src/index.js';

test('Kotlin 代码块关键字/字符串/注释/注解被着色', () => {
  const md = '```kotlin\nval title = "Hello"\n// comment\n@Composable fun A() {}\n```';
  const { html } = format(md, { theme: 'anthropic' });
  assert.match(html, /color:#b25c3c/); // keyword
  assert.match(html, /color:#5c7a3a/); // string
  assert.match(html, /color:#8a8a82/); // comment
  assert.match(html, /color:#a0506e/); // annotation
});

test('高亮内容仍被 HTML 转义', () => {
  const md = '```kotlin\nval ok = a < b && c > d\n```';
  const { html } = format(md, { theme: 'anthropic' });
  assert.match(html, /&lt;/);
  assert.match(html, /&amp;&amp;/);
  assert.match(html, /&gt;/);
});

test('非 Kotlin 代码块不高亮（纯转义）', () => {
  const md = '```\n登录失败 -> 显示错误\n```';
  const { html } = format(md, { theme: 'anthropic' });
  assert.doesNotMatch(html, /<span style="color:/);
  assert.match(html, /登录失败/);
});

test('字符串内的 $name 插值整体按字符串着色，不拆开', () => {
  const md = '```kotlin\nText("次数：$count")\n```';
  const { html } = format(md, { theme: 'anthropic' });
  assert.match(html, /color:#5c7a3a/);
  assert.match(html, /次数：\$count/);
});
