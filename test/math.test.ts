import { test } from 'node:test';
import assert from 'node:assert/strict';
import { format } from '../src/index.js';

test('行内数学 $...$ 渲染为斜体并转换箭头', () => {
  const md = '状态变化 $\\rightarrow$ 寻找 View';
  const { html } = format(md, { theme: 'anthropic' });
  assert.match(html, /font-style:italic/);
  assert.match(html, /→/);
  assert.doesNotMatch(html, /\\rightarrow/);
});

test('块级数学 $$...$$ 居中渲染', () => {
  const md = '核心公式：\n\n$$UI = f(State)$$';
  const { html } = format(md, { theme: 'anthropic' });
  assert.match(html, /text-align:center/);
  assert.match(html, /UI = f\(State\)/);
  assert.doesNotMatch(html, /\$\$/);
});

test('\\text{中文} 直立回退，不被斜体，长箭头转换', () => {
  const md = '$$\\text{View 命令式思维} \\longrightarrow \\text{状态驱动思维}$$';
  const { html } = format(md, { theme: 'anthropic' });
  assert.match(html, /font-style:normal/);
  assert.match(html, /⟶/);
  assert.match(html, /命令式思维/);
  assert.doesNotMatch(html, /\\longrightarrow/);
});

test('代码块与行内代码中的 $ 不被当作数学', () => {
  const md = '```kotlin\nText("Hello $name")\n```\n\n`Text("次数：$count")`';
  const { html } = format(md, { theme: 'anthropic' });
  assert.match(html, /Hello \$name/);
  assert.match(html, /次数：\$count/);
  assert.doesNotMatch(html, /font-style:italic/);
});

test('加粗内的数学 $...$ 也能被渲染', () => {
  const md = '闭环：**State Change $\\rightarrow$ Recomposition $\\rightarrow$ UI Update**。';
  const { html } = format(md, { theme: 'anthropic' });
  assert.match(html, /<strong/);
  assert.match(html, /→/);
  assert.doesNotMatch(html, /\\rightarrow/);
});
