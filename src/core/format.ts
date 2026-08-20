import type { Block, Reference } from './types.js';
import type { Theme } from '../themes/types.js';
import { getTheme } from '../themes/registry.js';
import { styleToString } from '../utils/css.js';
import { parseMarkdown } from './parser.js';
import { parseInline } from './inline.js';
import { renderBlocks } from './renderer.js';

/** format() 的选项。 */
export interface FormatOptions {
  /** 主题 id（如 'minimal'）或自定义 Theme 对象；省略时用默认主题。 */
  theme?: string | Theme;
}

/** 排版统计。 */
export interface FormatStats {
  headings: number;
  paragraphs: number;
  blockquotes: number;
  codeBlocks: number;
  lists: number;
  listItems: number;
  dividers: number;
  tables: number;
  callouts: number;
  images: number;
  /** 文内引用标记 [N] 数量 */
  citations: number;
  /** 参考文献条目数量 */
  references: number;
  totalBlocks: number;
}

/** format() 的返回结果。 */
export interface FormatResult {
  /** 可直接粘贴公众号后台的内联样式 HTML 片段 */
  html: string;
  /** 实际使用的主题 id */
  theme: string;
  /** 块级统计 */
  stats: FormatStats;
  /** 兼容性/使用提示（非致命） */
  warnings: string[];
}

const IMAGE_RE = /!\[[^\]]*\]\([^)]+\)/g;

/** 提取块的可搜索文本（用于统计/告警）。 */
function blockText(b: Block): string {
  switch (b.type) {
    case 'heading':
    case 'paragraph':
    case 'blockquote':
      return b.text;
    case 'callout':
      return b.content;
    default:
      return '';
  }
}

/** 统计块内的文内引用标记 [N] 数量。 */
function countCitations(b: Block): number {
  const text = blockText(b);
  if (!text) return 0;
  return parseInline(text).filter((t) => t.type === 'cite').length;
}

/** 若主题定义了整篇包裹样式（如暖白纸张底），则包裹一层 section。 */
function wrapArticle(html: string, theme: Theme): string {
  const style = styleToString(theme.article);
  if (!style) return html;
  return `<section style="${style}">\n${html}\n</section>`;
}

/** 汇总全部参考文献条目为「编号 → 条目」索引。 */
function collectReferences(blocks: Block[]): Map<string, Reference> {
  const map = new Map<string, Reference>();
  for (const b of blocks) {
    if (b.type === 'references') {
      for (const e of b.entries) map.set(e.id, e);
    }
  }
  return map;
}

/**
 * 核心入口：Markdown → 内联样式 HTML。
 *
 * @example
 * const { html } = format('# 标题\n\n正文……[1]\n\n::: references\n[1]: 标题 | 来源 | 2025 | https://…\n:::', { theme: 'minimal' });
 */
export function format(markdown: string, options: FormatOptions = {}): FormatResult {
  const theme = getTheme(options.theme);
  const blocks = parseMarkdown(markdown);
  const refs = collectReferences(blocks);
  const html = wrapArticle(renderBlocks(blocks, theme, refs), theme);
  return {
    html,
    theme: theme.id,
    stats: computeStats(blocks),
    warnings: collectWarnings(blocks, refs),
  };
}

function computeStats(blocks: Block[]): FormatStats {
  const stats: FormatStats = {
    headings: 0,
    paragraphs: 0,
    blockquotes: 0,
    codeBlocks: 0,
    lists: 0,
    listItems: 0,
    dividers: 0,
    tables: 0,
    callouts: 0,
    images: 0,
    citations: 0,
    references: 0,
    totalBlocks: blocks.length,
  };

  for (const b of blocks) {
    switch (b.type) {
      case 'heading':
        stats.headings++;
        break;
      case 'paragraph':
        stats.paragraphs++;
        break;
      case 'blockquote':
        stats.blockquotes++;
        break;
      case 'code':
        stats.codeBlocks++;
        break;
      case 'list':
        stats.lists++;
        stats.listItems += b.items.length;
        break;
      case 'divider':
        stats.dividers++;
        break;
      case 'table':
        stats.tables++;
        break;
      case 'callout':
        stats.callouts++;
        break;
      case 'references':
        stats.references += b.entries.length;
        break;
    }
    stats.images += (blockText(b).match(IMAGE_RE) ?? []).length;
    stats.citations += countCitations(b);
  }

  return stats;
}

function collectWarnings(blocks: Block[], refs: Map<string, Reference>): string[] {
  const warnings: string[] = [];

  if (blocks.length === 0) {
    warnings.push('输入内容为空。');
  }
  if (blocks.some((b) => b.type === 'heading' && b.level > 3)) {
    warnings.push('检测到 H4 及以上标题：公众号正文建议不超过 3 层标题，已按 H3 视觉渲染。');
  }
  if (blocks.some((b) => IMAGE_RE.test(blockText(b)))) {
    warnings.push('检测到图片：请先将图片上传到公众号素材库，粘贴后的外链图片可能失效。');
  }

  // 孤儿引用：文内 [N] 无对应参考文献条目
  const cited = new Set<string>();
  for (const b of blocks) {
    const text = blockText(b);
    if (!text) continue;
    for (const t of parseInline(text)) {
      if (t.type === 'cite') cited.add(t.id);
    }
  }
  const orphans = [...cited].filter((id) => !refs.has(id));
  if (orphans.length) {
    warnings.push(`引用标记 [${orphans.join('], [')}] 缺少对应参考文献条目。`);
  }

  return warnings;
}
