/**
 * 排版引擎：分块 → 逐块应用规则 → 统计/告警 → 拼装输出。
 * 只做确定性转换，不进行创作性改写（创作由 Agent 依据 rules/ 与 templates/ 完成）。
 */

import { parseBlocks } from './blocks.js';
import { resolveOptions } from './options.js';
import { applyTextRules } from './rules/text.js';
import { normalizeHeading } from './rules/headings.js';
import { normalizeListLine } from './rules/lists.js';
import { normalizeDivider } from './rules/dividers.js';
import { renderQuote } from './rules/quotes.js';
import { splitLongParagraph } from './rules/paragraphs.js';
import { PLACEHOLDER_RE, resolvePlaceholder } from './templates.js';

function emptyStats() {
  return {
    paragraphs: 0,
    headings: { h1: 0, h2: 0, h3: 0, other: 0 },
    lists: 0,
    listItems: 0,
    codeBlocks: 0,
    quotes: 0,
    dividers: 0,
    transitions: 0,
    longParagraphs: 0,
    chars: 0,
    cjkChars: 0,
  };
}

function truncate(text, n) {
  const flat = text.replace(/\s+/g, ' ');
  return flat.length > n ? `${flat.slice(0, n)}…` : flat;
}

/**
 * 排版主入口。
 * @param {string} source Markdown 原文或大纲
 * @param {object} [options] 见 options.js / interface/options.schema.json
 * @returns {{ text: string, stats: object, warnings: string[], meta: object }}
 */
export function format(source, options = {}) {
  const opts = resolveOptions(options);
  const blocks = parseBlocks(source);
  const warnings = [];
  const stats = emptyStats();

  // 章节层级：仅一个 H1 时视为文章标题，章节层级取 H2；否则取存在的最低层级
  const headingBlocks = blocks.filter((b) => b.type === 'heading');
  const h1Count = headingBlocks.filter((b) => b.level === 1).length;
  const sectionLevel =
    h1Count === 1
      ? 2
      : headingBlocks.length > 0
        ? Math.min(...headingBlocks.map((b) => b.level))
        : 2;
  const counters = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  // 相邻标题检查（中间没有正文，读者会"断片"）
  for (let idx = 0; idx < blocks.length - 1; idx++) {
    const a = blocks[idx];
    const b = blocks[idx + 1];
    if (a.type === 'heading' && b.type === 'heading') {
      warnings.push(`相邻标题：“${a.text}”与“${b.text}”之间没有正文`);
    }
  }

  const out = [];
  let placeholderIndex = 0;

  for (let idx = 0; idx < blocks.length; idx++) {
    const block = blocks[idx];

    switch (block.type) {
      case 'code': {
        out.push(block.text);
        stats.codeBlocks++;
        if (!block.closed) {
          warnings.push(`存在未闭合的代码围栏（语言：${block.lang || '未标注'}）`);
        }
        break;
      }

      case 'heading': {
        const level = block.level;
        stats.headings[level > 3 ? 'other' : `h${level}`]++;
        if (!block.text) warnings.push('存在空标题（# 后无内容）');

        // 顶层章节开头无正文时，可选自动插入过渡句
        if (opts.insertTransitions && level === sectionLevel) {
          const next = blocks[idx + 1];
          if (next && next.type !== 'paragraph') {
            out.push(resolvePlaceholder('transition', placeholderIndex++));
            stats.transitions++;
          }
        }

        out.push(normalizeHeading(block.text, level, sectionLevel, counters, opts));
        break;
      }

      case 'hr': {
        out.push(normalizeDivider(block.line || '', opts.divider));
        stats.dividers++;
        break;
      }

      case 'quote': {
        const rendered = renderQuote(block.lines, opts.quoteStyle);
        out.push(applyTextRules(rendered, opts));
        stats.quotes++;
        break;
      }

      case 'list': {
        const lines = block.lines.map((l) => normalizeListLine(l, opts));
        out.push(lines.join('\n'));
        stats.lists++;
        stats.listItems += block.lines.filter((l) => !/^\s{2,}/.test(l)).length;
        break;
      }

      case 'paragraph': {
        const trimmed = block.text.trim();

        // 显式占位符 {{transition}} / {{hook}} / {{ending}}
        const ph = PLACEHOLDER_RE.exec(trimmed);
        if (ph) {
          out.push(resolvePlaceholder(ph[1], placeholderIndex++));
          stats.transitions++;
          break;
        }

        const fixed = applyTextRules(block.text, opts);
        const parts = opts.splitLongParagraphs
          ? splitLongParagraph(fixed, opts.maxParagraphChars)
          : [fixed];

        if (parts.length > 1) stats.longParagraphs++;

        for (const part of parts) {
          if (part.length > opts.maxParagraphChars) {
            warnings.push(
              `段落过长（${part.length} 字）：${truncate(part, 30)}`,
            );
          }
          out.push(part);
        }
        stats.paragraphs += parts.length;
        break;
      }

      default:
        break;
    }
  }

  const text = renderText(out, opts);
  stats.chars = text.length;
  stats.cjkChars = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length;

  return {
    text,
    stats,
    warnings,
    meta: {
      engine: 'wechat-formatting-skill',
      version: '0.1.0',
      options: { ...opts },
    },
  };
}

/** 拼装输出文本：块间空行、行尾清理、收敛多余空行。 */
function renderText(blocks, opts) {
  const gap = '\n'.repeat(1 + (opts.blankLineBetweenBlocks || 1));
  let text = blocks.join(gap);

  if (opts.trimTrailingWhitespace !== false) {
    text = text
      .split('\n')
      .map((l) => l.replace(/\s+$/, ''))
      .join('\n');
  }
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.replace(/^\n+|\n+$/g, '') + '\n';
}

/** 便捷函数：只返回文本。 */
export function formatToText(source, options = {}) {
  return format(source, options).text;
}
