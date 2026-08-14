/**
 * 选项定义与默认值。
 * 与 interface/options.schema.json 保持同步（schema 是该文件的 JSON 描述）。
 */

export const DEFAULT_OPTIONS = Object.freeze({
  /** 中文与西文/数字之间插入半角空格（代码、URL 内部除外） */
  cjkSpacing: true,
  /** 中文语境下将半角标点转为全角 */
  fullWidthPunctuation: true,
  /** 统一无序列表符号为 "- " */
  normalizeBullets: true,
  /** 分隔线统一为的字符串 */
  divider: '---',
  /** 引用样式：plain = 「」包裹（公众号纯文本友好）；markdown = 保留 "> " 前缀 */
  quoteStyle: 'plain',
  /** 是否给顶层标题编号（01 | xxx）；已自带编号的标题跳过 */
  numberHeadings: false,
  /** 编号补零位数 */
  headingNumberZeroPad: 2,
  /** 是否按句子边界拆分超长段落 */
  splitLongParagraphs: false,
  /** 段落拆分阈值（字符数） */
  maxParagraphChars: 160,
  /** 块之间的空行数 */
  blankLineBetweenBlocks: 1,
  /** 在顶层章节开头无正文时自动插入过渡句（需结合上下文由 Agent 改写，默认关） */
  insertTransitions: false,
  /** 去除行尾空白 */
  trimTrailingWhitespace: true,
});

const QUOTE_STYLES = new Set(['plain', 'markdown']);

/**
 * 合并用户选项与默认值，并做基本校验。
 * @param {object} [overrides]
 * @returns {object}
 */
export function resolveOptions(overrides = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...(overrides || {}) };
  if (typeof opts.divider !== 'string' || opts.divider.trim() === '') {
    opts.divider = '---';
  }
  if (!QUOTE_STYLES.has(opts.quoteStyle)) opts.quoteStyle = 'plain';
  opts.maxParagraphChars = Math.max(40, Number(opts.maxParagraphChars) || 160);
  opts.headingNumberZeroPad = Math.min(
    4,
    Math.max(1, Number(opts.headingNumberZeroPad) || 2),
  );
  opts.blankLineBetweenBlocks = Math.min(
    3,
    Math.max(0, Number(opts.blankLineBetweenBlocks) || 1),
  );
  return opts;
}

/** 供外部读取默认值的只读副本（避免误改）。 */
export function getDefaultOptions() {
  return { ...DEFAULT_OPTIONS };
}
