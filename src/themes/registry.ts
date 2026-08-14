import type { Theme } from './types.js';
import { minimal } from './minimal.js';
import { anthropic } from './anthropic.js';

/** 主题注册表：id → Theme */
const registry = new Map<string, Theme>();

/** 注册（或覆盖）一个主题。 */
export function registerTheme(theme: Theme): void {
  registry.set(theme.id, theme);
}

/**
 * 按 id 或主题对象获取主题。
 * 省略时返回默认主题 minimal；传入 Theme 对象则直接使用（支持运行时自定义主题）。
 */
export function getTheme(idOrTheme?: string | Theme): Theme {
  if (idOrTheme && typeof idOrTheme === 'object') return idOrTheme;
  const id = idOrTheme ?? 'minimal';
  const theme = registry.get(id);
  if (!theme) {
    throw new Error(`未知主题 "${id}"。可用主题: ${listThemeIds().join(', ') || '(空)'}`);
  }
  return theme;
}

/** 列出全部已注册主题（按注册顺序）。 */
export function listThemes(): Theme[] {
  return [...registry.values()];
}

/** 列出全部主题 id。 */
export function listThemeIds(): string[] {
  return [...registry.keys()];
}

// 注册内置主题
registerTheme(minimal);
registerTheme(anthropic);
