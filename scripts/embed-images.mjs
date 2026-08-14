#!/usr/bin/env node
/**
 * 把 HTML 中引用的本地图片内嵌为 base64（自动压缩 + 统一宽度），生成自包含文件。
 * 用法: node scripts/embed-images.mjs <input.html> [output.html] [targetWidth=1080]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import sharp from 'sharp';

const [input, output, widthArg = '1080'] = process.argv.slice(2);
if (!input) {
  console.error('用法: node scripts/embed-images.mjs <input.html> [output.html] [targetWidth=1080]');
  process.exit(1);
}

const htmlPath = resolve(input);
const outPath = output ? resolve(output) : htmlPath.replace(/\.html?$/, '-inline.html');
const targetW = parseInt(widthArg, 10) || 1080;
const base = dirname(htmlPath);

let html = readFileSync(htmlPath, 'utf8');
// 匹配相对路径图片（排除 data: / http(s): / 根路径）
const re = /src="((?!data:|https?:|\/\/|\/)[^"]+\.(?:png|jpe?g|webp|gif))"/gi;
const matches = [...html.matchAll(re)];

for (const m of matches) {
  const f = m[1];
  try {
    const buf = readFileSync(join(base, f));
    const img = sharp(buf);
    const meta = await img.metadata();
    const pipeline = meta.width > targetW ? img.resize({ width: targetW, withoutEnlargement: true }) : img;
    const out = await pipeline.png({ compressionLevel: 9, palette: true, effort: 10 }).toBuffer();
    html = html.split(`src="${f}"`).join(`src="data:image/png;base64,${out.toString('base64')}"`);
    console.log(`embedded: ${f}`);
  } catch {
    console.warn(`skip（未找到）: ${f}`);
  }
}

writeFileSync(outPath, html, 'utf8');
console.log(`saved: ${outPath} (${Math.round(html.length / 1024)} KB)`);
