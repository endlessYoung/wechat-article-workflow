import { test } from 'node:test';
import assert from 'node:assert/strict';
import { format } from '../src/index.js';
import { highlightCode } from '../src/utils/highlight.js';

const SYNTAX = {
  keyword: '#b25c3c',
  string: '#5c7a3a',
  comment: '#8a8a82',
  number: '#b0782d',
  annotation: '#a0506e',
  type: '#6a4f9e',
  function: '#2e6e8e',
};

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

test('XML 注释必须转义，不能当成 HTML 注释输出', () => {
  const xml = '<!-- 根布局 -->\n<ConstraintLayout android:layout_height="wrap_content">';
  const html = highlightCode(xml, 'xml', SYNTAX);
  assert.doesNotMatch(html, /<!--/);
  assert.match(html, /&lt;!--/);
  assert.match(html, /--&gt;/);
  assert.match(html, /color:#8a8a82/);
  assert.match(html, /color:#b25c3c/);
  assert.match(html, /color:#2e6e8e/);
  assert.match(html, /color:#5c7a3a/);
});

test('XML 标签、属性、字符串和行内注释都能着色', () => {
  const xml = `<LinearLayout android:orientation="vertical">
            <include layout="@layout/item_row" />   <!-- 条目行 -->
</LinearLayout>`;
  const html = highlightCode(xml, 'xml', SYNTAX);
  assert.match(html, /color:#b25c3c">LinearLayout/);
  assert.match(html, /color:#b25c3c">include/);
  assert.match(html, /android:orientation/);
  assert.match(html, /vertical/);
  assert.match(html, /条目行/);
  assert.doesNotMatch(html, /<!-- 条目行 -->/);
  assert.match(html, /color:#8a8a82/);
  assert.match(html, /color:#2e6e8e/);
  assert.match(html, /color:#5c7a3a/);
});

test('字符串内的 $name 插值整体按字符串着色，不拆开', () => {
  const md = '```kotlin\nText("次数：$count")\n```';
  const { html } = format(md, { theme: 'anthropic' });
  assert.match(html, /color:#5c7a3a/);
  assert.match(html, /次数：\$count/);
});
