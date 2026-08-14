#!/usr/bin/env node
/**
 * wechat-format CLI
 *
 * 用法：
 *   node bin/wechat-format.js <input.md> [选项]
 *   node bin/wechat-format.js examples/input.md -o out.md --number-headings
 *
 * 选项：
 *   -o, --output <file>       结果写入文件（否则输出到 stdout）
 *   --divider <s>             分隔线字符串（默认 ---）
 *   --quote-style <s>         引用样式 plain | markdown（默认 plain）
 *   --number-headings         顶层标题自动编号（01 | xxx）
 *   --split-long-paragraphs   按句子边界拆分超长段落
 *   --max-paragraph-chars <n> 段落拆分阈值（默认 160）
 *   --insert-transitions      顶层章节无正文时自动插入过渡句
 *   --no-cjk-spacing          关闭中英文空格
 *   --no-full-width           关闭标点全角化
 *   --json                    以 JSON 输出 { text, stats, warnings }
 *   --check                   有警告时以退出码 1 结束（用于 CI）
 *   -h, --help                帮助
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { format } from '../src/index.js';

const HELP = `wechat-format — 公众号文章排版引擎（wechat-formatting-skill）

用法:
  node bin/wechat-format.js <input.md> [选项]

选项:
  -o, --output <file>       结果写入文件（默认输出到 stdout）
  --divider <s>             分隔线字符串（默认 "---"）
  --quote-style <s>         引用样式: plain | markdown（默认 plain）
  --number-headings         顶层标题自动编号（01 | xxx）
  --split-long-paragraphs   按句子边界拆分超长段落
  --max-paragraph-chars <n> 段落拆分阈值（默认 160）
  --insert-transitions      顶层章节无正文时自动插入过渡句
  --no-cjk-spacing          关闭中英文空格
  --no-full-width           关闭标点全角化
  --json                    以 JSON 输出 { text, stats, warnings }
  --check                   有警告时以退出码 1 结束
  -h, --help                显示帮助

示例:
  node bin/wechat-format.js examples/input.md
  node bin/wechat-format.js examples/input.md -o out.md --number-headings --json
`;

function parseArgs(argv) {
  const parsed = {
    input: null,
    output: null,
    options: {},
    json: false,
    check: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '-h':
      case '--help':
        parsed.help = true;
        break;
      case '-o':
      case '--output':
        parsed.output = next();
        break;
      case '--json':
        parsed.json = true;
        break;
      case '--check':
        parsed.check = true;
        break;
      case '--divider':
        parsed.options.divider = next();
        break;
      case '--quote-style':
        parsed.options.quoteStyle = next();
        break;
      case '--max-paragraph-chars':
        parsed.options.maxParagraphChars = Number(next());
        break;
      case '--number-headings':
        parsed.options.numberHeadings = true;
        break;
      case '--split-long-paragraphs':
        parsed.options.splitLongParagraphs = true;
        break;
      case '--insert-transitions':
        parsed.options.insertTransitions = true;
        break;
      case '--no-cjk-spacing':
        parsed.options.cjkSpacing = false;
        break;
      case '--no-full-width':
        parsed.options.fullWidthPunctuation = false;
        break;
      default:
        if (a.startsWith('-')) {
          process.stderr.write(`未知参数: ${a}\n`);
          process.exit(2);
        }
        parsed.input = a;
    }
  }
  return parsed;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  const input = args.input || 'examples/input.md';
  let source;
  try {
    source = readFileSync(input, 'utf8');
  } catch (err) {
    process.stderr.write(`无法读取输入文件 ${input}: ${err.message}\n`);
    process.exit(2);
  }

  const { text, stats, warnings } = format(source, args.options);

  if (args.json) {
    process.stdout.write(JSON.stringify({ text, stats, warnings }, null, 2) + '\n');
  } else {
    process.stdout.write(text);
  }

  if (args.output) {
    try {
      writeFileSync(args.output, text, 'utf8');
    } catch (err) {
      process.stderr.write(`无法写入输出文件 ${args.output}: ${err.message}\n`);
      process.exit(2);
    }
  }

  const h = stats.headings;
  process.stderr.write(
    `[wechat-format] ${stats.paragraphs} 段 / H1:${h.h1} H2:${h.h2} H3:${h.h3} ` +
      `/ 代码块:${stats.codeBlocks} 引用:${stats.quotes} 列表:${stats.lists} ` +
      `分隔线:${stats.dividers} 过渡:${stats.transitions} / 字符:${stats.chars}\n`,
  );
  if (warnings.length) {
    process.stderr.write(`[wechat-format] ${warnings.length} 条警告:\n`);
    for (const w of warnings) process.stderr.write(`  - ${w}\n`);
  }

  if (args.check && warnings.length > 0) process.exit(1);
}

main();
