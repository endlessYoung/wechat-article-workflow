/**
 * 列表规则：无序符号统一为 "- "，有序保留序号并规范间距。
 * 规则依据：rules/03-blocks.md
 */

import { applyTextRules } from './text.js';

const UNORDERED_RE = /^(\s*)[-*+]\s+(.*)$/;
const ORDERED_RE = /^(\s*)(\d{1,4})[.)]\s+(.*)$/;

/**
 * 规范化一行列表内容（对内容部分应用文本规则）。
 * @param {string} line
 * @param {object} [opts]
 * @returns {string}
 */
export function normalizeListLine(line, opts = {}) {
  const u = UNORDERED_RE.exec(line);
  if (u) {
    const content = opts.normalizeBullets === false ? u[2] : applyTextRules(u[2], opts);
    const marker = opts.normalizeBullets === false ? line.match(/^\s*[-*+]/)[0] : '-';
    return `${u[1]}${marker} ${content}`;
  }
  const o = ORDERED_RE.exec(line);
  if (o) {
    return `${o[1]}${o[2]}. ${applyTextRules(o[3], opts)}`;
  }
  // 缩进续行：作为普通文本处理
  return applyTextRules(line, opts);
}
