import type { Block, InlineToken, ListItem, Reference } from './types.js';
import type { Theme, CalloutStyle, Style } from '../themes/types.js';
import { styleToString } from '../utils/css.js';
import { escapeHtml } from '../utils/escape.js';
import { renderMath } from '../utils/math.js';
import { highlightCode } from '../utils/highlight.js';
import { parseInline } from './inline.js';

/** 引用索引：编号 → 参考文献（用于文内标记跳转与孤儿引用判断）。 */
type RefIndex = Map<string, Reference>;

/**
 * 渲染器：Block[] → 公众号可粘贴的内联样式 HTML 片段。
 *
 * 兼容要点：
 * - 不使用 <style>/外链 CSS（公众号会剥离），全部内联 style；
 * - 卡片/代码块用 <section> 包裹（公众号编辑器保留最完整）；
 * - 代码块 white-space:pre-wrap + word-break 防移动端横向溢出；
 * - H4+ 统一降级为 H3 视觉（正文不建议超过三层标题）。
 */
export function renderBlocks(blocks: Block[], theme: Theme, refs: RefIndex = new Map()): string {
  return blocks.map((b) => renderBlock(b, theme, refs)).join('\n');
}

function renderInline(tokens: InlineToken[], theme: Theme, refs: RefIndex): string {
  return tokens
    .map((t) => {
      switch (t.type) {
        case 'text':
          return escapeHtml(t.value);
        case 'strong':
          return `<strong style="${styleToString(theme.strong)}">${renderInline(parseInline(t.value), theme, refs)}</strong>`;
        case 'em':
          return `<em style="${styleToString(theme.em)}">${renderInline(parseInline(t.value), theme, refs)}</em>`;
        case 'code':
          return `<code style="${styleToString(theme.inlineCode)}">${escapeHtml(t.value)}</code>`;
        case 'del':
          return `<del style="${styleToString({ color: theme.colors.muted })}">${escapeHtml(t.value)}</del>`;
        case 'link':
          return `<a href="${escapeHtml(t.href)}" style="${styleToString(theme.link)}">${escapeHtml(t.text)}</a>`;
        case 'image':
          return `<img src="${escapeHtml(t.src)}" alt="${escapeHtml(t.alt)}" style="${styleToString(theme.image)}" />`;
        case 'cite': {
          const n = escapeHtml(t.id);
          const sup = `<sup style="${styleToString(theme.cite)}">`;
          if (refs.has(t.id)) {
            return `${sup}<a href="#ref-${n}" style="${styleToString(theme.citeLink)}">${n}</a></sup>`;
          }
          return `${sup}${n}</sup>`;
        }
        case 'math':
          return `<span style="${styleToString(theme.math.inline)}">${renderMath(t.value)}</span>`;
        default:
          return '';
      }
    })
    .join('');
}

function renderBlock(b: Block, theme: Theme, refs: RefIndex): string {
  switch (b.type) {
    case 'heading': {
      const tag = `h${Math.min(b.level, 6)}`;
      return `<${tag} style="${styleToString(headingStyle(b.level, theme))}">${renderInline(parseInline(b.text), theme, refs)}</${tag}>`;
    }
    case 'paragraph':
      return `<p style="${styleToString(theme.paragraph)}">${renderInline(parseInline(b.text), theme, refs)}</p>`;
    case 'blockquote':
      return `<blockquote style="${styleToString(theme.blockquote)}">${renderInline(parseInline(b.text), theme, refs)}</blockquote>`;
    case 'code': {
      const cb = theme.codeBlock;
      const lang = b.lang ? `<p style="${styleToString(cb.lang)}">${escapeHtml(b.lang)}</p>` : '';
      return `<section style="${styleToString(cb.wrapper)}">${lang}<pre style="${styleToString(cb.pre)}"><code style="${styleToString(cb.code)}">${highlightCode(b.code, b.lang, theme.syntax)}</code></pre></section>`;
    }
    case 'divider':
      return `<section style="${styleToString(theme.divider.wrapper)}"><span style="${styleToString(theme.divider.line)}"></span></section>`;
    case 'table':
      return renderTable(b, theme, refs);
    case 'math':
      return `<p style="${styleToString(theme.math.block)}">${renderMath(b.value)}</p>`;
    case 'list':
      return renderList(b, theme, refs);
    case 'callout':
      return renderCallout(b, theme, refs);
    case 'references':
      return renderReferences(b.entries, theme);
    default:
      return '';
  }
}

function headingStyle(level: number, theme: Theme): Style {
  if (level === 1) return theme.h1;
  if (level === 2) return theme.h2;
  return theme.h3; // H3 及更深层级统一使用 H3 视觉
}

function renderList(b: Extract<Block, { type: 'list' }>, theme: Theme, refs: RefIndex): string {
  const tag = b.ordered ? 'ol' : 'ul';
  const listStyle = b.ordered ? theme.list.ol : theme.list.ul;
  const items = b.items.map((item) => renderListItem(item, theme, refs)).join('\n');
  return `<${tag} style="${styleToString(listStyle)}">\n${items}\n</${tag}>`;
}

function renderListItem(item: ListItem, theme: Theme, refs: RefIndex): string {
  const inner = renderInline(parseInline(item.text), theme, refs);
  const children = item.children?.length
    ? '\n' + item.children.map((c) => renderBlock(c, theme, refs)).join('\n')
    : '';
  return `<li style="${styleToString(theme.list.li)}">${inner}${children}</li>`;
}

function renderTable(b: Extract<Block, { type: 'table' }>, theme: Theme, refs: RefIndex): string {
  const ts = theme.table;
  const alignText = (a?: string) => (a === 'center' || a === 'right' ? a : 'left');
  const thead = `<thead><tr>${b.headers
    .map(
      (h, idx) =>
        `<th style="${styleToString({ ...ts.th, textAlign: alignText(b.align[idx]) })}">${renderInline(
          parseInline(h),
          theme,
          refs,
        )}</th>`,
    )
    .join('')}</tr></thead>`;
  const tbody = `<tbody>${b.rows
    .map(
      (row, rIdx) => {
        const stripe = rIdx % 2 === 1 ? ts.stripe : {};
        return `<tr>${row
          .map(
            (cell, cIdx) =>
              `<td style="${styleToString({
                ...ts.td,
                ...stripe,
                textAlign: alignText(b.align[cIdx]),
              })}">${renderInline(parseInline(cell), theme, refs)}</td>`,
          )
          .join('')}</tr>`;
      },
    )
    .join('')}</tbody>`;
  return `<section style="${styleToString(ts.wrapper)}"><table style="${styleToString(ts.table)}">${thead}${tbody}</table></section>`;
}

function renderCallout(b: Extract<Block, { type: 'callout' }>, theme: Theme, refs: RefIndex): string {
  const cs: CalloutStyle = theme.callout[b.kind];
  const label = cs.icon ? `${cs.icon} ${b.title ?? cs.label}` : (b.title ?? cs.label);
  const title = `<p style="${styleToString(cs.title)}">${renderInline(parseInline(label), theme, refs)}</p>`;
  const content = `<p style="${styleToString(cs.content)}">${renderInline(parseInline(b.content), theme, refs)}</p>`;
  return `<section style="${styleToString(cs.wrapper)}">${title}${content}</section>`;
}

/** 渲染文末参考来源列表。 */
function renderReferences(entries: Reference[], theme: Theme): string {
  const rs = theme.references;
  const head = `<p style="${styleToString(rs.title)}">${escapeHtml(rs.label)}</p>`;
  const items = entries
    .map((e) => {
      const parts: string[] = [];
      parts.push(`<span style="${styleToString(rs.refTitle)}">${escapeHtml(e.title)}</span>`);

      const meta: string[] = [];
      if (e.source) meta.push(escapeHtml(e.source));
      if (e.date) meta.push(escapeHtml(e.date));
      if (meta.length) parts.push(`<span style="${styleToString(rs.meta)}"> — ${meta.join(', ')}</span>`);

      if (e.url) {
        parts.push(`<a href="${escapeHtml(e.url)}" style="${styleToString(rs.link)}">${escapeHtml(displayUrl(e.url))}</a>`);
      }

      return `<li id="ref-${escapeHtml(e.id)}" style="${styleToString(rs.item)}"><sup style="${styleToString(rs.index)}">${escapeHtml(e.id)}</sup> ${parts.join(' ')}</li>`;
    })
    .join('\n');

  return `<section style="${styleToString(rs.wrapper)}">${head}<ol style="${styleToString(rs.list)}">\n${items}\n</ol></section>`;
}

/** 展示用链接文本：去掉协议与末尾斜杠，更简洁。 */
function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
