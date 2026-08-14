import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTheme, registerTheme, listThemeIds, listThemes } from '../src/themes/registry.js';
import { minimal } from '../src/themes/minimal.js';
import type { Theme } from '../src/themes/types.js';

test('默认主题为 minimal', () => {
  assert.equal(getTheme().id, 'minimal');
});

test('按 id 获取主题', () => {
  assert.equal(getTheme('minimal'), minimal);
});

test('未知主题抛错并列出可用主题', () => {
  assert.throws(() => getTheme('nope'), /可用主题: minimal/);
});

test('注册自定义主题后可获取', () => {
  const custom: Theme = { ...minimal, id: 'custom', name: '自定义' };
  registerTheme(custom);
  assert.equal(getTheme('custom').id, 'custom');
  assert.ok(listThemeIds().includes('custom'));
  assert.ok(listThemes().some((t) => t.id === 'custom'));
});

test('传入主题对象直接使用', () => {
  const obj: Theme = { ...minimal, id: 'inline', name: '内联主题' };
  assert.equal(getTheme(obj).id, 'inline');
});
