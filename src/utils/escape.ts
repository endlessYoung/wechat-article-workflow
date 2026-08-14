/**
 * HTML 转义：同时适用于文本节点与双引号属性值。
 * 处理 & < > "，防止原文内容破坏标签结构。
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
