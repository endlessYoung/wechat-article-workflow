import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fixPunctuation,
  addCjkSpacing,
  removeSpaceBeforeFullwidth,
  applyTextRules,
} from '../src/rules/text.js';

test('fixPunctuation: 中文语境标点全角化', () => {
  assert.equal(fixPunctuation('你好,世界.'), '你好，世界。');
  assert.equal(fixPunctuation('你吃饭了吗?我吃了!'), '你吃饭了吗？我吃了！');
  assert.equal(fixPunctuation('时间: 现在; 地点: 这里'), '时间： 现在； 地点： 这里');
  assert.equal(fixPunctuation('括号(中文)测试'), '括号（中文）测试');
});

test('fixPunctuation: 保留版本号/小数/URL 类内容', () => {
  assert.equal(fixPunctuation('v1.2.0 已发布'), 'v1.2.0 已发布');
  assert.equal(fixPunctuation('数值 3.5 倍'), '数值 3.5 倍');
  assert.equal(fixPunctuation('效率提升1%.'), '效率提升1%。');
  assert.equal(fixPunctuation('README.md 文件'), 'README.md 文件');
});

test('fixPunctuation: 省略号统一', () => {
  assert.equal(fixPunctuation('然后...就没有然后了'), '然后……就没有然后了');
  assert.equal(fixPunctuation('等等。。。'), '等等……');
});

test('addCjkSpacing: 中文与英文/数字/百分号加空格', () => {
  assert.equal(addCjkSpacing('每天进步1%'), '每天进步 1%');
  assert.equal(addCjkSpacing('使用Python实现'), '使用 Python 实现');
  assert.equal(addCjkSpacing('第3章'), '第 3 章');
  assert.equal(addCjkSpacing('提升50%'), '提升 50%');
});

test('removeSpaceBeforeFullwidth: 去掉全角标点前的空格', () => {
  assert.equal(removeSpaceBeforeFullwidth('你好 ，世界'), '你好，世界');
  assert.equal(removeSpaceBeforeFullwidth('你好。 '), '你好。 ');
});

test('applyTextRules: 行内代码与 URL 不被规则误伤', () => {
  assert.equal(
    applyTextRules('使用 `a,b,c` 分隔,保留原样。'),
    '使用 `a,b,c` 分隔，保留原样。',
  );
  assert.equal(
    applyTextRules('详见:http://example.com/a?b=1,见链接。'),
    '详见：http://example.com/a?b=1，见链接。',
  );
  assert.equal(applyTextRules('中文`code`混合'), '中文`code`混合');
});

test('applyTextRules: 可关闭标点/空格规则', () => {
  assert.equal(
    applyTextRules('你好,world.', { fullWidthPunctuation: false, cjkSpacing: false }),
    '你好,world.',
  );
});
