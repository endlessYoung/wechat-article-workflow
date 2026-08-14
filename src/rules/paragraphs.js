/**
 * 段落规则：超长段落按句子边界拆分。
 * 规则依据：rules/02-structure.md（单段 ≤ 120-160 字）
 */

/**
 * 将超长段落按句子边界（。！？；）拆分为多段。
 * 单个句子本身超过阈值时不强行拆分（避免破坏句子）。
 * @param {string} text
 * @param {number} maxChars
 * @returns {string[]}
 */
export function splitLongParagraph(text, maxChars) {
  const normalized = String(text);
  if (normalized.length <= maxChars) return [normalized];

  const sentences = normalized.split(/(?<=[。！？；])/);
  const parts = [];
  let current = '';

  for (const sentence of sentences) {
    if (!sentence) continue;
    if (current && current.length + sentence.length > maxChars) {
      parts.push(current);
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current) parts.push(current);
  return parts.length > 0 ? parts : [normalized];
}
