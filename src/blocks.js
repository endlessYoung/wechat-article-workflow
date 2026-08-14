/**
 * Markdown 块级解析：把源文本切成可独立处理的块。
 *
 * 块类型：
 * - code      代码块（围栏保护，内部原样保留）
 * - heading   标题（level 1-6）
 * - hr        分隔线
 * - quote     引用块（连续 "> " 行）
 * - list      列表（连续列表行 + 缩进续行）
 * - paragraph 普通段落（可含行内 markdown）
 */

const FENCE_RE = /^\s*(```+|~~~+)\s*([\w+#.-]*)\s*$/;
const HEADING_RE = /^(#{1,6})\s+(.+)$/;
const HEADING_TIGHT_RE = /^(#{1,6})([^\s].*)$/;
const HR_RE = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/;
const QUOTE_RE = /^>\s?/;
const UNORDERED_ITEM_RE = /^\s*[-*+]\s+/;
const ORDERED_ITEM_RE = /^\s*\d{1,4}[.)]\s+/;
const INDENTED_RE = /^\s{2,}/;

/** 判断一行是否为围栏结束行（与开始标记同字符、长度不小于开始标记）。 */
function isFenceClose(line, marker) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed[0] !== marker[0]) return false;
  return new RegExp(`^${marker[0]}{${marker.length},}\\s*$`).test(trimmed);
}

/**
 * 将源文本解析为块列表。
 * @param {string} source
 * @returns {Array<object>}
 */
export function parseBlocks(source) {
  const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];

  const push = (block) => {
    if (block && block.type !== 'blank') blocks.push(block);
  };

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (line === '') {
      i++;
      continue;
    }

    // ---- 代码块（围栏） ----
    const fence = FENCE_RE.exec(raw);
    if (fence) {
      const marker = fence[1];
      const lang = fence[2] || '';
      const buf = [raw];
      i++;
      let closed = false;
      while (i < lines.length) {
        const l = lines[i];
        buf.push(l);
        if (isFenceClose(l, marker)) {
          closed = true;
          i++;
          break;
        }
        i++;
      }
      push({ type: 'code', lang, text: buf.join('\n'), closed });
      continue;
    }

    // ---- 标题 ----
    const hm = HEADING_RE.exec(raw) || HEADING_TIGHT_RE.exec(raw);
    if (hm) {
      push({ type: 'heading', level: hm[1].length, text: (hm[2] || '').trim() });
      i++;
      continue;
    }

    // ---- 分隔线 ----
    if (HR_RE.test(line)) {
      push({ type: 'hr' });
      i++;
      continue;
    }

    // ---- 引用块：连续 "> " 行（允许中间空行） ----
    if (QUOTE_RE.test(line)) {
      const buf = [];
      while (i < lines.length) {
        const l = lines[i];
        const t = l.trim();
        if (t === '') {
          // 空行：仅当后面仍是引用行时继续合并
          if (i + 1 < lines.length && QUOTE_RE.test(lines[i + 1].trim())) {
            i++;
            continue;
          }
          break;
        }
        if (QUOTE_RE.test(t)) {
          buf.push(l);
          i++;
          continue;
        }
        break;
      }
      push({ type: 'quote', lines: buf });
      continue;
    }

    // ---- 列表：连续列表行 + 缩进续行 ----
    if (UNORDERED_ITEM_RE.test(line) || ORDERED_ITEM_RE.test(line)) {
      const ordered = ORDERED_ITEM_RE.test(line);
      const buf = [];
      while (i < lines.length) {
        const l = lines[i];
        if (l.trim() === '') break;
        if (UNORDERED_ITEM_RE.test(l.trim()) || ORDERED_ITEM_RE.test(l.trim())) {
          buf.push(l);
          i++;
          continue;
        }
        if (INDENTED_RE.test(l)) {
          buf.push(l); // 续行
          i++;
          continue;
        }
        break;
      }
      push({ type: 'list', ordered, lines: buf });
      continue;
    }

    // ---- 普通段落 ----
    {
      const buf = [raw];
      i++;
      while (i < lines.length) {
        const l = lines[i];
        if (l.trim() === '') break;
        if (
          /^(#{1,6})\s/.test(l) ||
          FENCE_RE.test(l) ||
          HR_RE.test(l.trim()) ||
          QUOTE_RE.test(l.trim()) ||
          UNORDERED_ITEM_RE.test(l.trim()) ||
          ORDERED_ITEM_RE.test(l.trim())
        ) {
          break;
        }
        buf.push(l);
        i++;
      }
      push({ type: 'paragraph', text: buf.join('\n') });
    }
  }

  return blocks;
}
