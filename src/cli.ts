#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { format } from './index.js';
import { listThemes } from './themes/registry.js';

const VERSION = '0.1.0';

const HELP = `公众号视图层排版 Skill —— 将 Markdown / 大纲转换为可直接粘贴公众号后台的内联样式 HTML

用法:
  wechat-format [input.md] [选项]

输入:
  input.md              待排版的 Markdown 文件
  -                     从标准输入读取（省略输入文件时同样从 stdin 读取）

选项:
  -o, --output <file>   将结果写入文件（默认输出到 stdout）
  --theme <id>          使用指定主题（默认 minimal；--list-themes 查看全部）
  --json                以 JSON 输出 { html, theme, stats, warnings }
  --list-themes         列出可用主题
  -v, --version         显示版本号
  -h, --help            显示本帮助

示例:
  wechat-format article.md -o article.html
  wechat-format article.md --theme minimal --json
  cat article.md | wechat-format > article.html
`;

interface CliArgs {
  help?: boolean;
  version?: boolean;
  listThemes?: boolean;
  json?: boolean;
  theme?: string;
  output?: string;
  stdin?: boolean;
  input?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '-h':
      case '--help':
        args.help = true;
        break;
      case '-v':
      case '-V':
      case '--version':
        args.version = true;
        break;
      case '--list-themes':
        args.listThemes = true;
        break;
      case '--json':
        args.json = true;
        break;
      case '-o':
      case '--output':
        args.output = argv[++i];
        break;
      case '--theme':
        args.theme = argv[++i];
        break;
      case '-':
        args.stdin = true;
        break;
      default:
        if (!a.startsWith('-')) positional.push(a);
    }
  }
  if (positional.length > 0) args.input = positional[0];
  return args;
}

function main(argv: string[]): number {
  const args = parseArgs(argv);

  if (args.help) {
    process.stdout.write(HELP);
    return 0;
  }
  if (args.version) {
    process.stdout.write(`wechat-format ${VERSION}\n`);
    return 0;
  }
  if (args.listThemes) {
    const lines = listThemes().map((t) => `${t.id}\t${t.name}\t${t.description}`);
    process.stdout.write(lines.join('\n') + '\n');
    return 0;
  }

  let source: string;
  try {
    source = args.input && !args.stdin ? readFileSync(resolve(args.input), 'utf8') : readFileSync(0, 'utf8');
  } catch (err) {
    process.stderr.write(`读取输入失败: ${(err as Error).message}\n`);
    return 1;
  }

  let result;
  try {
    result = format(source, { theme: args.theme ?? 'minimal' });
  } catch (err) {
    process.stderr.write(`排版失败: ${(err as Error).message}\n`);
    return 1;
  }

  const out = args.json ? JSON.stringify(result, null, 2) : result.html;

  if (args.output) {
    try {
      writeFileSync(resolve(args.output), out, 'utf8');
      process.stderr.write(`已写入 ${args.output}（主题 ${result.theme}，共 ${result.stats.totalBlocks} 个块）\n`);
    } catch (err) {
      process.stderr.write(`写入失败: ${(err as Error).message}\n`);
      return 1;
    }
  } else {
    process.stdout.write(out + '\n');
  }

  for (const w of result.warnings) {
    process.stderr.write(`⚠ ${w}\n`);
  }
  return 0;
}

process.exitCode = main(process.argv.slice(2));
