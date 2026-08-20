import type { InlineToken } from './types.js';

/**
 * 行内标记解析：加粗 **x**、斜体 *x*、行内代码 `x`、链接 [t](url)、
 * 删除线 ~~x~~、图片 ![alt](url)、引用标记 [N]。
 *
 * 采用单趟正则扫描，按优先级从左到右匹配，文本间隙作为 text token。
 * 注意：链接/加粗等内部不再递归嵌套解析（v1 简化）。
 * 引用标记 [N]（纯数字）置于链接组之后，避免吞掉 [1](url) 形式的链接。
 */
const INLINE_RE =
  /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\[[^\]\n]+\]\([^ \n]+\))|(\[\d+\])|(~~[^~\n]+~~)|(!\[[^\]\n]*\]\([^ \n]+\))|(\*[^*\n]+\*)|(\$[^$\n]+\$)/g;

export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let last = 0;
  INLINE_RE.lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = INLINE_RE.exec(text))) {
    if (m.index > last) {
      tokens.push({ type: 'text', value: text.slice(last, m.index) });
    }
    const full = m[0];
    if (m[1]) {
      tokens.push({ type: 'code', value: m[1].slice(1, -1) });
    } else if (m[2]) {
      tokens.push({ type: 'strong', value: m[2].slice(2, -2) });
    } else if (m[3]) {
      const lm = /^\[([^\]]+)\]\(([^ \n]+)\)$/.exec(m[3])!;
      tokens.push({ type: 'link', text: lm[1], href: lm[2] });
    } else if (m[4]) {
      tokens.push({ type: 'cite', id: m[4].slice(1, -1) });
    } else if (m[5]) {
      tokens.push({ type: 'del', value: m[5].slice(2, -2) });
    } else if (m[6]) {
      const im = /^!\[([^\]]*)\]\(([^ \n]+)\)$/.exec(m[6])!;
      tokens.push({ type: 'image', alt: im[1], src: im[2] });
    } else if (m[7]) {
      tokens.push({ type: 'em', value: m[7].slice(1, -1) });
    } else if (m[8]) {
      tokens.push({ type: 'math', value: m[8].slice(1, -1), display: false });
    }
    last = m.index + full.length;
  }

  if (last < text.length) {
    tokens.push({ type: 'text', value: text.slice(last) });
  }
  return tokens;
}
