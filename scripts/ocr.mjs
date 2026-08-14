#!/usr/bin/env node
/**
 * OCR 识别图片/目录中的文字（用于无视觉模型时读取截图素材）。
 * 首次运行会下载对应语言的 traineddata。
 * 用法: node scripts/ocr.mjs <image.png|目录> [langs=chi_sim+eng]
 */
import { createWorker } from 'tesseract.js';
import { readdir, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const [target, langs = 'chi_sim+eng'] = process.argv.slice(2);
if (!target) {
  console.error('用法: node scripts/ocr.mjs <image.png|目录> [langs=chi_sim+eng]');
  process.exit(1);
}

const p = resolve(target);
const isDir = (await stat(p)).isDirectory();
const files = isDir
  ? (await readdir(p)).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f)).sort()
  : [p];

const worker = await createWorker(langs);
for (const f of files) {
  const full = isDir ? join(p, f) : f;
  const { data } = await worker.recognize(full);
  console.log(`\n===== ${f} =====`);
  console.log((data.text || '').trim());
}
await worker.terminate();
