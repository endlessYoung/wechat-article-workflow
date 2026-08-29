import { test } from 'node:test';
import assert from 'node:assert/strict';
import { displayUrl, isWechatAllowedHref } from '../src/utils/wechat-href.js';

test('页内锚点不允许（公众号会拦截非 mp 域名链接）', () => {
  assert.equal(isWechatAllowedHref('#ref-1'), false);
});

test('仅 mp.weixin.qq.com 的 http(s) 允许', () => {
  assert.equal(isWechatAllowedHref('https://mp.weixin.qq.com/s/abc'), true);
  assert.equal(isWechatAllowedHref('http://mp.weixin.qq.com/s/abc'), true);
  assert.equal(isWechatAllowedHref('https://github.com/google/perfetto'), false);
  assert.equal(isWechatAllowedHref('https://developer.android.com/x'), false);
  assert.equal(isWechatAllowedHref('https://mp.weixin.qq.com.evil.com/s'), false);
});

test('displayUrl 去掉协议与末尾斜杠', () => {
  assert.equal(displayUrl('https://a.b/c/'), 'a.b/c');
});
