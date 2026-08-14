/**
 * 公共 API 出口。
 *
 * 用法：
 *   import { format, formatToText, parseBlocks } from './src/index.js';
 *   const { text, stats, warnings } = format(source, { numberHeadings: true });
 */

export { format, formatToText } from './engine.js';
export { parseBlocks } from './blocks.js';
export {
  DEFAULT_OPTIONS,
  resolveOptions,
  getDefaultOptions,
} from './options.js';
export { HOOKS, TRANSITIONS, ENDINGS, PLACEHOLDER_RE } from './templates.js';
