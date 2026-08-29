#!/usr/bin/env node
/**
 * 把 Markdown 里的围栏代码块渲染成主题风格卡片截图。
 * 公众号排版必须用 --all --replace：全部截图、写回 Markdown、不得删减代码。
 *
 * 用法:
 *   node --import tsx scripts/code-screenshot.mjs --md article.md --all --replace
 *   node --import tsx scripts/code-screenshot.mjs --md article.md [--out-dir images] [--replace] [--all]
 *
 * 默认只截过长块（任一行显示宽度 > 36，或行数 ≥ 7）。
 * 排版公众号 HTML 前必须加 --all，短 SQL / XML / 一行代码也不能留在文里。
 * 截图保留完整代码，不删减；卡片固定宽度、长行折行，避免出图被裁切。
 * 完整源码另存 images/src/。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { highlightCode } from '../src/utils/highlight.ts';

const ANTHROPIC_SYNTAX = {
  keyword: '#b25c3c',
  string: '#5c7a3a',
  comment: '#8a8a82',
  number: '#b0782d',
  annotation: '#a0506e',
  type: '#6a4f9e',
  function: '#2e6e8e',
};

const FENCE_RE = /^(`{3,})([^\n]*)\n([\s\S]*?)^`{3,}\s*$/gm;
const MAX_DISPLAY_COLS = 36;
const MIN_LINES = 7;

const argv = process.argv.slice(2);
let mdPath = '';
let outDir = '';
let replace = false;
let all = false;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--md') mdPath = argv[++i];
  else if (argv[i] === '--out-dir') outDir = argv[++i];
  else if (argv[i] === '--replace') replace = true;
  else if (argv[i] === '--all') all = true;
}
if (!mdPath) {
  console.error('用法: node --import tsx scripts/code-screenshot.mjs --md article.md [--out-dir images] [--replace] [--all]');
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
  console.error('未找到 Chrome/Edge。');
  process.exit(1);
}

function displayWidth(s) {
  let w = 0;
  for (const ch of s) w += ch.codePointAt(0) > 127 ? 2 : 1;
  return w;
}

function needsScreenshot(code) {
  const lines = code.replace(/\n$/, '').split('\n');
  const max = Math.max(0, ...lines.map(displayWidth));
  return max > MAX_DISPLAY_COLS || lines.length >= MIN_LINES;
}

function srcExt(lang) {
  const l = (lang || '').toLowerCase();
  if (l === 'kotlin' || l === 'kt' || l === 'kts') return '.kt';
  if (l === 'xml') return '.xml';
  if (l === 'java') return '.java';
  return '.txt';
}

function cardHtml(code, lang) {
  const highlighted = highlightCode(code.replace(/\n$/, ''), lang, ANTHROPIC_SYNTAX).replace(
    /style="color:([^;"]+)/g,
    'style="color:$1 !important',
  );
  const label = (lang || 'code').trim() || 'code';
  return `<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; background: #ffffff; }
  .card {
    display: block;
    box-sizing: border-box;
    width: 640px;
    background: #f0eee6;
    border: 1px solid #e8e6dc;
    border-radius: 8px;
    padding: 14px 16px 16px;
    overflow: visible;
  }
  .lang {
    font-size: 12px;
    color: #b0aea5;
    margin: 0 0 8px;
    font-family: ui-monospace, "Cascadia Code", "JetBrains Mono", Consolas, Menlo, monospace;
  }
  pre {
    margin: 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
    line-height: 1.65;
    font-family: ui-monospace, "Cascadia Code", "JetBrains Mono", Consolas, Menlo, monospace;
    font-size: 14px;
    color: #141413;
  }
  code {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    background: transparent;
  }
</style>
<div class="card" id="card">
  <p class="lang">${label}</p>
  <pre><code>${highlighted}</code></pre>
</div>`;
}

const absMd = resolve(mdPath);
let md = readFileSync(absMd, 'utf8');
const base = dirname(absMd);
const imgDir = resolve(base, outDir || 'images');
const srcDir = join(imgDir, 'src');
mkdirSync(srcDir, { recursive: true });

const fences = [];
md.replace(FENCE_RE, (full, _ticks, info, body) => {
  const lang = (info || '').trim().split(/\s+/)[0] || 'code';
  fences.push({ full, lang, code: body });
  return full;
});

const targets = fences
  .map((f, i) => ({ ...f, index: i }))
  .filter((f) => all || needsScreenshot(f.code));

if (targets.length === 0) {
  console.log('没有需要截图的代码块。');
  process.exit(0);
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb'],
  defaultViewport: { width: 900, height: 1200, deviceScaleFactor: 2 },
});

try {
  const page = await browser.newPage();
  let shotIndex = 0;
  for (const f of targets) {
    shotIndex += 1;
    const name = `code-${String(shotIndex).padStart(2, '0')}.png`;
    const pngPath = join(imgDir, name);
    const srcPath = join(srcDir, name.replace(/\.png$/, srcExt(f.lang)));
    writeFileSync(srcPath, f.code.replace(/\n$/, '') + '\n', 'utf8');

    await page.setContent(cardHtml(f.code, f.lang), { waitUntil: 'load' });
    const el = await page.$('#card');
    await el.screenshot({ path: pngPath, type: 'png' });
    console.log(`✓ ${name}  (${f.code.replace(/\n$/, '').split('\n').length} 行)`);

    if (replace) {
      const imgMd = `![${f.lang} 代码](images/${name})\n`;
      const at = md.indexOf(f.full);
      if (at === -1) {
        console.warn(`未在 Markdown 中定位代码块: ${name}`);
        continue;
      }
      md = md.slice(0, at) + imgMd + md.slice(at + f.full.length);
    }
  }
} finally {
  await browser.close();
}

if (replace) {
  writeFileSync(absMd, md, 'utf8');
  console.log(`已写回 ${absMd}`);
}
console.log(`共 ${targets.length} 张截图 → ${imgDir}`);
