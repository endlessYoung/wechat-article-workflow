#!/usr/bin/env node
/**
 * 把 2.35:1 封面 HTML 导出为公众号可上传的 PNG + JPG。
 * 画布固定 2350×1000；JPG 供后台上传。
 *
 * 用法:
 *   node scripts/cover.mjs <cover.html>
 *   node scripts/cover.mjs <cover.html> -o cover.png
 */
import { existsSync } from 'node:fs';
import { dirname, join, parse, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const COVER_W = 2350;
const COVER_H = 1000;

const argv = process.argv.slice(2);
const input = argv[0];
let output = '';
for (let i = 1; i < argv.length; i++) {
  if (argv[i] === '-o' || argv[i] === '--output') output = argv[++i];
}
if (!input) {
  console.error('用法: node scripts/cover.mjs <cover.html> [-o cover.png]');
  process.exit(1);
}

const htmlPath = resolve(input);
if (!existsSync(htmlPath)) {
  console.error(`找不到文件: ${htmlPath}`);
  process.exit(1);
}

const dir = dirname(htmlPath);
const pngPath = resolve(output || join(dir, 'cover.png'));
const jpgPath = join(dirname(pngPath), `${parse(pngPath).name}.jpg`);

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

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-color-profile=srgb'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: COVER_W, height: COVER_H, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0', timeout: 60_000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({
    path: pngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: COVER_W, height: COVER_H },
  });
} finally {
  await browser.close();
}

await sharp(pngPath).jpeg({ quality: 90, mozjpeg: true }).toFile(jpgPath);
const meta = await sharp(pngPath).metadata();
if (meta.width !== COVER_W || meta.height !== COVER_H) {
  console.error(`比例不对：得到 ${meta.width}×${meta.height}，应为 ${COVER_W}×${COVER_H}`);
  process.exit(1);
}
console.log(`生成: ${pngPath}  (${COVER_W}×${COVER_H})`);
console.log(`生成: ${jpgPath}  （上传公众号后台用这一张）`);
