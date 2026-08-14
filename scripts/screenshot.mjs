#!/usr/bin/env node
/**
 * 渲染 HTML 并截取整页长图（复用系统 Chrome/Edge，无需额外下载内核）。
 * 用法: node scripts/screenshot.mjs <input.html> [output.png] [viewportWidth=800]
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const [input, output = 'screenshot.png', widthArg = '800'] = process.argv.slice(2);
if (!input) {
  console.error('用法: node scripts/screenshot.mjs <input.html> [output.png] [viewportWidth=800]');
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
  console.error('未找到 Chrome/Edge，请安装或手动指定 executablePath。');
  process.exit(1);
}

const content = readFileSync(resolve(input), 'utf8');
const width = parseInt(widthArg, 10) || 800;

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb'],
  defaultViewport: { width, height: 1000, deviceScaleFactor: 2 },
});

try {
  const page = await browser.newPage();
  // 用 <meta charset> 包裹片段，避免 file:// 下中文乱码
  await page.setContent(
    '<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#ffffff;}</style>' + content,
    { waitUntil: 'load' },
  );
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: output, fullPage: true });
  console.log(`saved: ${output}`);
} finally {
  await browser.close();
}
