import type { Style } from '../themes/types.js';
import { escapeHtml } from './escape.js';

/** camelCase → kebab-case（backgroundColor → background-color） */
export function camelToKebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * 将样式对象序列化为内联 style 字符串。
 * 过滤空值（undefined / null / ''）；并对值做 HTML 转义，
 * 确保含引号的字体名（如 "Segoe UI"）嵌入 style="…" 时不破坏属性。
 */
export function styleToString(style: Style): string {
  const raw = Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${camelToKebab(k)}:${v}`)
    .join(';');
  return escapeHtml(raw);
}
