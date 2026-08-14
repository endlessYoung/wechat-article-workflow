/**
 * 分隔线规则：全文统一为一种分隔线。
 * 规则依据：rules/03-blocks.md
 */

/**
 * 将任意 markdown 分隔线（--- / *** / ___）统一为配置的分隔符。
 * @param {string} _line 原始分隔线（不参与内容，仅用于语义标记）
 * @param {string} divider 统一后的分隔符，如 "---" 或 "✦ ✦ ✦"
 * @returns {string}
 */
export function normalizeDivider(_line, divider) {
  return divider;
}
