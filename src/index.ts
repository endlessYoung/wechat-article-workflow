/**
 * wechat-formatting-skill 公共 API 出口。
 *
 * 三种调用方式：
 * 1. 模块：`import { format } from 'wechat-formatting-skill'`
 * 2. CLI：`wechat-format input.md -o out.html`
 * 3. Skill 手册：读取 SKILL.md 后由 Agent 执行
 */

export { format } from './core/format.js';
export type { FormatOptions, FormatResult, FormatStats } from './core/format.js';

export { parseMarkdown } from './core/parser.js';
export { parseInline } from './core/inline.js';
export { renderBlocks } from './core/renderer.js';

export { registerTheme, getTheme, listThemes, listThemeIds } from './themes/registry.js';
export { minimal } from './themes/minimal.js';
export { anthropic } from './themes/anthropic.js';

export type { Theme, Style, CalloutKind, CalloutStyle, CodeBlockStyle, ReferencesStyle } from './themes/types.js';
export type { Block, InlineToken, ListItem, Reference } from './core/types.js';
