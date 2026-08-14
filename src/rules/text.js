/**
 * 文本级规则：标点全角化、中文与西文/数字间距、行内代码与 URL 保护。
 * 规则依据：rules/01-typography.md
 */

const CJK_RE = /[\u3400-\u9fff\uf900-\ufaff]/;
const isCJK = (ch) => !!ch && CJK_RE.test(ch);
const isLatinDigit = (ch) => !!ch && /[A-Za-z0-9]/.test(ch);

/** 行内保护：把行内代码与 URL 替换为哨兵，避免被标点/空格规则误伤。 */
const TOKEN_START = '\u0001';
const TOKEN_END = '\u0002';

export function protect(text) {
  const tokens = [];
  let out = text.replace(/`[^`\n]+`/g, (m) => {
    tokens.push(m);
    return TOKEN_START + (tokens.length - 1) + TOKEN_END;
  });
  // URL：保护主体，尾随的标点留在原文中等待后续规则处理
  out = out.replace(/https?:\/\/[^\s)）】》"'，。；：！？、,;!\u3400-\u9fff\uf900-\ufaff]+/g, (m) => {
    const parts = /^(.+?)([,.!?;:，。！？；：]*)$/.exec(m);
    tokens.push(parts[1]);
    return TOKEN_START + (tokens.length - 1) + TOKEN_END + parts[2];
  });
  return { text: out, tokens };
}

export function restore(text, tokens) {
  return text.replace(
    new RegExp(TOKEN_START + '(\\d+)' + TOKEN_END, 'g'),
    (_, i) => tokens[Number(i)],
  );
}

/**
 * 标点全角化：仅在中英文混排的中文语境转换；代码、URL、版本号、小数保持半角。
 * - , . ? ! : ; ( ) → ，。？！：；（）（按语境）
 * - 。{3,} 与 ... 统一为 ……
 */
export function fixPunctuation(text) {
  // 半角三点省略号先统一为 ……（避免被逐字符循环拆散）
  let t = String(text).replace(/\.{3,}/g, '……');
  let out = '';
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    const prev = t[i - 1];
    const next = t[i + 1];
    const prevCJK = isCJK(prev);
    const nextCJK = isCJK(next);

    let rep = ch;
    if (ch === ',') rep = prevCJK || nextCJK ? '，' : ch;
    else if (ch === '?') rep = prevCJK || nextCJK ? '？' : ch;
    else if (ch === '!') rep = prevCJK || nextCJK ? '！' : ch;
    else if (ch === ':') rep = prevCJK || nextCJK ? '：' : ch;
    else if (ch === ';') rep = prevCJK || nextCJK ? '；' : ch;
    else if (ch === '(') rep = prevCJK || nextCJK ? '（' : ch;
    else if (ch === ')') rep = prevCJK || nextCJK ? '）' : ch;
    else if (ch === '.') {
      // 句号：前/后都不是拉丁数字，且位于句子边界（后接中文/空白/结尾，或前接中文）
      const prevToken = isLatinDigit(prev);
      const nextToken = isLatinDigit(next);
      const atBoundary =
        next === undefined || /\s/.test(next) || isCJK(next) || isCJK(prev);
      if (!prevToken && !nextToken && atBoundary) rep = '。';
    }
    out += rep;
  }
  return out.replace(/。{2,}/g, '……');
}

/** 移除全角标点前的多余空格：如 "你好 ，" → "你好，" */
export function removeSpaceBeforeFullwidth(text) {
  return text.replace(/\s+([，。？！：；、）】」』])/g, '$1');
}

/** 中文与西文/数字/百分号之间插入半角空格。 */
export function addCjkSpacing(text) {
  return text
    .replace(/([\u3400-\u9fff\uf900-\ufaff])([A-Za-z0-9])/g, '$1 $2')
    .replace(/([A-Za-z0-9])([\u3400-\u9fff\uf900-\ufaff])/g, '$1 $2')
    .replace(/([\u3400-\u9fff\uf900-\ufaff])([%‰])/g, '$1 $2')
    .replace(/([%‰])([\u3400-\u9fff\uf900-\ufaff])/g, '$1 $2');
}

/**
 * 对一段文本应用全部文本级规则（保护 → 标点 → 空格 → 还原）。
 * @param {string} text
 * @param {object} [opts] 见 options.js
 * @returns {string}
 */
export function applyTextRules(text, opts = {}) {
  const { text: protectedText, tokens } = protect(String(text));
  let t = protectedText;
  if (opts.fullWidthPunctuation !== false) t = fixPunctuation(t);
  t = removeSpaceBeforeFullwidth(t);
  if (opts.cjkSpacing !== false) t = addCjkSpacing(t);
  return restore(t, tokens);
}
