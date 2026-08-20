import type { Block, ListItem, Reference, TableAlign } from './types.js';
import type { CalloutKind } from '../themes/types.js';

/**
 * Markdown 块级解析：把纯文本拆成 Block[]。
 *
 * 支持的块：标题(1-6)、段落、引用、围栏代码块、有序/无序列表(含嵌套)、
 * 分割线、以及自定义的 `:::` 提示卡容器。
 * 这是「视图层排版」的第一段：只做结构识别，不做样式决策。
 */

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const DIVIDER_RE = /^(-{3,}|\*{3,}|_{3,})\s*$/;
const LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const FENCE_OPEN_RE = /^(`{3,}|~{3,})/;
const CALLOUT_OPEN_RE = /^:::\s*([a-zA-Z][a-zA-Z0-9_-]*)\s*(.*)$/;
/** 引用容器的别名。 */
const REFERENCES_KINDS = new Set(['references', 'refs', 'bibliography', 'citations']);
/** 引用条目：[N]: 标题 | 来源 | 日期 | 链接 */
const REF_ENTRY_RE = /^\[([^\]]+)\]:\s*(.*)$/;

/** 提示卡别名归一化：支持 tip/hint、note/info、warning/warn、important/danger/star。 */
const CALLOUT_KINDS: Record<string, CalloutKind> = {
  tip: 'tip',
  hint: 'tip',
  note: 'note',
  info: 'note',
  warning: 'warning',
  warn: 'warning',
  important: 'important',
  danger: 'important',
  star: 'important',
};

function normalizeCalloutKind(raw: string): CalloutKind {
  return CALLOUT_KINDS[raw.toLowerCase()] ?? 'note';
}

/** 判断一行是否是某个块的开头（用于段落/列表的终止）。 */
function isBlockStart(lines: string[], i: number): boolean {
  const t = lines[i].trim();
  return (
    HEADING_RE.test(t) ||
    DIVIDER_RE.test(t) ||
    LIST_RE.test(t) ||
    /^>\s?/.test(t) ||
    FENCE_OPEN_RE.test(t) ||
    /^\$\$/.test(t) ||
    /^:::\s*/.test(t) ||
    (t.includes('|') && isTableHeaderAt(lines, i))
  );
}

export function parseMarkdown(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  const n = lines.length;

  while (i < n) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      i++;
      continue;
    }

    // 围栏代码块
    const fence = FENCE_OPEN_RE.exec(trimmed);
    if (fence) {
      const marker = fence[1][0];
      const lang = trimmed.slice(fence[1].length).trim();
      const closeRe = new RegExp('^' + (marker === '`' ? '`{3,}' : '~{3,}') + '\\s*$');
      const codeLines: string[] = [];
      i++;
      while (i < n && !closeRe.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // 跳过闭合围栏
      blocks.push({ type: 'code', lang, code: codeLines.join('\n') });
      continue;
    }

    // 容器 ::: kind [标题] ... :::（引用容器与提示卡容器）
    const callout = CALLOUT_OPEN_RE.exec(trimmed);
    if (callout) {
      const kindRaw = callout[1].toLowerCase();
      if (REFERENCES_KINDS.has(kindRaw)) {
        i++;
        const startLine = i;
        while (i < n && lines[i].trim() !== ':::') i++;
        blocks.push({ type: 'references', entries: parseReferences(lines, startLine, i) });
        i++; // 跳过 :::
        continue;
      }
      const kind = normalizeCalloutKind(callout[1]);
      const title = callout[2].trim() || undefined;
      const inner: string[] = [];
      i++;
      while (i < n && lines[i].trim() !== ':::') {
        inner.push(lines[i]);
        i++;
      }
      i++; // 跳过 :::
      blocks.push({ type: 'callout', kind, title, content: inner.join('\n').trim() });
      continue;
    }

    // 标题
    const h = HEADING_RE.exec(trimmed);
    if (h) {
      blocks.push({ type: 'heading', level: h[1].length, text: h[2].trim() });
      i++;
      continue;
    }

    // 块级数学公式 $$...$$（单行）
    const blockMath = /^\$\$(.+?)\$\$$/.exec(trimmed);
    if (blockMath) {
      blocks.push({ type: 'math', value: blockMath[1].trim(), display: true });
      i++;
      continue;
    }

    // 分割线
    if (DIVIDER_RE.test(trimmed)) {
      blocks.push({ type: 'divider' });
      i++;
      continue;
    }

    // 引用块
    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (i < n && /^>\s?/.test(lines[i].trim())) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join('\n') });
      continue;
    }

    // 列表（含嵌套）
    if (LIST_RE.test(line)) {
      const parsed = parseList(lines, i);
      blocks.push(parsed.list);
      i = parsed.next;
      continue;
    }

    // 表格（GFM：表头行 + 分隔行）
    if (line.includes('|') && isTableHeaderAt(lines, i)) {
      const parsed = parseTable(lines, i);
      blocks.push(parsed.table);
      i = parsed.next;
      continue;
    }

    // 段落：收集到空行或下一个块开头
    const paraLines: string[] = [line];
    i++;
    while (i < n && lines[i].trim() !== '' && !isBlockStart(lines, i)) {
      paraLines.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
  }

  return blocks;
}

/**
 * 解析引用容器内的条目。
 * 支持 `[N]: 标题 | 来源 | 日期 | 链接`（显式编号），
 * 也支持 `1. …` / `- …` 纯列表项（按出现顺序自动编号）。
 */
function parseReferences(lines: string[], start: number, end: number): Reference[] {
  const entries: Reference[] = [];
  let autoIndex = 0;
  for (let i = start; i < end; i++) {
    const t = lines[i].trim();
    if (t === '') continue;
    autoIndex++;

    const m = REF_ENTRY_RE.exec(t);
    let id: string;
    let rest: string;
    if (m) {
      id = m[1].trim();
      rest = m[2];
    } else {
      const li = LIST_RE.exec(t);
      rest = li ? li[3] : t;
      id = String(autoIndex);
    }

    const parts = rest.split('|').map((s) => s.trim());
    entries.push({
      id,
      title: parts[0] ?? '',
      source: parts[1] || undefined,
      date: parts[2] || undefined,
      url: parts[3] || undefined,
    });
  }
  return entries;
}

/** 判断列表标记是否为有序（1. / 1) 等）。 */
function isOrdered(marker: string): boolean {
  return /\d/.test(marker);
}

/** 解析列表（含按缩进嵌套的子列表）。 */
function parseList(lines: string[], start: number, indent = -1): { list: Block; next: number } {
  const first = LIST_RE.exec(lines[start])!;
  if (indent < 0) indent = first[1].length;
  const ordered = isOrdered(first[2]);
  const items: ListItem[] = [];
  let i = start;

  while (i < lines.length) {
    const raw = lines[i];
    if (raw.trim() === '') {
      // 列表内空行：下一行仍是「同类型 + 同级/更深」列表项则继续，否则结束
      if (i + 1 < lines.length) {
        const next = LIST_RE.exec(lines[i + 1]);
        if (next && next[1].length >= indent && isOrdered(next[2]) === ordered) {
          i++;
          continue;
        }
      }
      break;
    }

    const m = LIST_RE.exec(raw);
    if (!m) break;
    const itemIndent = m[1].length;
    if (itemIndent < indent) break; // 回到外层列表
    if (itemIndent === indent && isOrdered(m[2]) !== ordered) break; // 类型切换 → 结束本列表

    if (itemIndent > indent) {
      // 更深缩进 → 作为上一项的子列表
      if (items.length === 0) break;
      const nested = parseList(lines, i, itemIndent);
      const last = items[items.length - 1];
      (last.children ??= []).push(nested.list);
      i = nested.next;
      continue;
    }

    // 同级项：收集延续行
    const textLines: string[] = [m[3]];
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !LIST_RE.test(lines[i]) && !isBlockStart(lines, i)) {
      textLines.push(lines[i].trim());
      i++;
    }
    items.push({ text: textLines.join(' ') });
  }

  return { list: { type: 'list', ordered, items }, next: i };
}

/** 把一行表格内容按 `|` 拆成单元格（去除首尾可选竖线）。 */
function splitTableRow(line: string): string[] {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|')) t = t.slice(0, -1);
  return t.split('|').map((s) => s.trim());
}

/** 判断一行是否为 GFM 表格分隔行（如 `--- | :---: | ---:`）。 */
function isTableSeparator(line: string): boolean {
  const cells = splitTableRow(line);
  return cells.length >= 2 && cells.every((c) => /^:?-+:?$/.test(c.trim()));
}

/** 判断 lines[i] 是否是表格开头：i 为表头行且下一行是分隔行。 */
function isTableHeaderAt(lines: string[], i: number): boolean {
  if (i + 1 >= lines.length) return false;
  const header = splitTableRow(lines[i]);
  if (header.length < 2) return false;
  return isTableSeparator(lines[i + 1]);
}

/** 从分隔单元格解析列对齐（`:---:` 居中 / `---:` 右 / `:---` 左）。 */
function parseTableAlign(cell: string): TableAlign {
  const c = cell.trim();
  const left = c.startsWith(':');
  const right = c.endsWith(':');
  if (left && right) return 'center';
  if (right) return 'right';
  if (left) return 'left';
  return undefined;
}

/** 解析 GFM 表格：表头 + 分隔行 + 若干正文行。 */
function parseTable(lines: string[], start: number): { table: Block; next: number } {
  const headers = splitTableRow(lines[start]);
  const align = splitTableRow(lines[start + 1]).map(parseTableAlign);
  const nCols = headers.length;
  const rows: string[][] = [];
  let i = start + 2;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') break;
    if (!line.includes('|')) break;
    const cells = splitTableRow(line);
    // 跳过软换行产生的孤立结尾竖线（空单元格行）
    if (cells.every((c) => c === '')) {
      i++;
      continue;
    }
    // 单元格数对齐表头：不足补空、多余截断
    while (cells.length < nCols) cells.push('');
    rows.push(cells.slice(0, nCols));
    i++;
  }

  return { table: { type: 'table', headers, align, rows }, next: i };
}
