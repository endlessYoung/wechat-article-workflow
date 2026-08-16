#!/usr/bin/env node
/**
 * 验证 -copy.html 的一键复制按钮：存在 → 点击 → execCommand('copy') 返回 true
 * → 读回剪贴板确认是带内联样式的 text/html 且含正文内容。
 * 同时校验：数学公式已渲染（无残留 LaTeX）、代码块 $ 未被吞、正文无缺失。
 *
 * 用法: node scripts/verify-copy.mjs <copy.html>
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, pathToFileURL } from 'node:url';
import { resolve as resolvePath } from 'node:path';
import puppeteer from 'puppeteer-core';

const input = process.argv[2];
if (!input) {
  console.error('用法: node scripts/verify-copy.mjs <copy.html>');
  process.exit(1);
}

const executablePath = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => existsSync(p));

if (!executablePath) {
  console.error('未找到 Chrome/Edge，无法验证。');
  process.exit(1);
}

const filePath = resolvePath(input);
const fileUrl = pathToFileURL(filePath).href;

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb'],
});

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
};

try {
  const page = await browser.newPage();
  await browser.defaultBrowserContext().overridePermissions('file://', ['clipboard-read', 'clipboard-write']);

  await page.goto(fileUrl, { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 800));

  // 1. 按钮存在
  const btnText = await page.evaluate(() => {
    const b = document.querySelector('#bar button');
    return b ? b.textContent.trim() : null;
  });
  check('一键复制按钮存在', !!btnText && btnText.includes('一键复制'), btnText ?? '');

  // 2. 正文内容完整
  const bodyText = await page.evaluate(() => document.body.innerText);
  check('正文包含标题', bodyText.includes('Jetpack Compose 实战精讲'));
  check('正文包含核心公式 UI = f(State)', bodyText.includes('UI = f(State)'));

  // 3. 数学已渲染（无残留 LaTeX）
  const rawLatex = await page.evaluate(() => ({
    rightarrow: document.body.innerHTML.includes('\\rightarrow'),
    textCmd: /\\text[^\w]/.test(document.body.innerHTML),
    dollar: /\$\$/.test(document.getElementById('content').innerHTML),
  }));
  check('无残留 LaTeX 命令', !rawLatex.rightarrow && !rawLatex.textCmd && !rawLatex.dollar, JSON.stringify(rawLatex));

  // 4. 代码块 $ 未被吞
  check('代码块 \$name/\$count 保留', bodyText.includes('Hello $name') && bodyText.includes('次数：$count'));

  // 5. 点击按钮并校验 hint
  await page.click('#bar button');
  await new Promise((r) => setTimeout(r, 500));
  const hint = await page.evaluate(() => document.getElementById('hint').textContent);
  check('点击后提示「已复制」', hint.includes('已复制'), hint);

  // 6. 读回剪贴板，确认 text/html 且含内联样式 + 正文
  let clipTypes = [];
  let htmlContent = '';
  let copyOk = false;
  try {
    const clip = await page.evaluate(async () => {
      const items = await navigator.clipboard.read();
      const out = {};
      for (const item of items) {
        for (const type of item.types) {
          out[type] = await (await item.getType(type)).text();
        }
      }
      return out;
    });
    clipTypes = Object.keys(clip);
    htmlContent = clip['text/html'] || '';
    const hasInlineStyle = /style="/.test(htmlContent);
    const hasBody = htmlContent.includes('Jetpack Compose 实战精讲');
    const hasMath = htmlContent.includes('UI = f(State)');
    copyOk = hasInlineStyle && hasBody;
    check('剪贴板为 text/html 且含内联样式', hasInlineStyle, `types=[${clipTypes.join(', ')}]`);
    check('剪贴板 HTML 含正文', hasBody);
    check('剪贴板 HTML 含已渲染公式', hasMath);
  } catch (e) {
    check('读回剪贴板（clipboard.read）', false, String(e.message).slice(0, 120));
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${failed.length === 0 ? '全部通过' : `${failed.length} 项失败`}（共 ${results.length} 项）`);
process.exit(failed.length === 0 ? 0 : 1);
