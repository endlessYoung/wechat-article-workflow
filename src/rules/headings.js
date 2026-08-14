/**
 * 标题规则：标记规范化、编号样式统一、可选自动编号。
 * 规则依据：rules/02-structure.md
 */

import { applyTextRules } from './text.js';

/**
 * 规范化一行标题文本。
 * @param {string} text        标题文本（不含 #）
 * @param {number} level       标题层级 1-6
 * @param {number} topLevel    顶层层级（存在 H1 时为 1，否则为 2）
 * @param {object} counters    各层级计数器 { 1: n, 2: n, ... }
 * @param {object} opts        选项
 * @returns {string} 规范后的完整标题行（含 #）
 */
export function normalizeHeading(text, level, topLevel, counters = {}, opts = {}) {
  let t = String(text).trim();
  if (!t) return `${'#'.repeat(level)} `;

  t = applyTextRules(t, opts);

  // 统一 "01|xxx" / "01 | xxx" 的编号写法为 "01 | xxx"
  t = t.replace(/^(\d{1,3})\s*[|｜]\s*/, '$1 | ');

  const alreadyNumbered = /^\d{1,3}\s*[|｜]/.test(t);
  counters[level] = (counters[level] || 0) + 1;

  if (opts.numberHeadings && level === topLevel && !alreadyNumbered) {
    const n = String(counters[level]).padStart(opts.headingNumberZeroPad ?? 2, '0');
    t = `${n} | ${t}`;
  }

  return `${'#'.repeat(level)} ${t}`;
}
