/**
 * 引用规则：支持「」包裹（公众号纯文本友好）与 markdown "> " 两种样式。
 * 规则依据：rules/03-blocks.md
 */

/**
 * 渲染引用块。
 * @param {string[]} lines 原始引用行（含 "> " 前缀）
 * @param {'plain'|'markdown'} style
 * @returns {string}
 */
export function renderQuote(lines, style = 'plain') {
  const text = lines.map((l) => l.replace(/^>\s?/, '')).join('\n');
  if (style === 'markdown') {
    return lines.map((l) => `> ${l.replace(/^>\s?/, '')}`).join('\n');
  }
  return `「${text}」`;
}
