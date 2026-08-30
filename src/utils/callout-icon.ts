/**
 * 提示卡标题图标。
 *
 * 公众号会剥外链 CSS 与 @font-face，不能用 Font Awesome 网页字体。
 * 用 Lucide 线型 SVG（data URI + img），描边色跟随标题色。
 */

import { escapeHtml } from './escape.js';

const LUCIDE: Record<string, string> = {
  lightbulb:
    '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  warning:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4.17 21h15.66a2 2 0 0 0 1.9-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
};

function svgMarkup(paths: string, color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function toDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function titleColor(cs: { title: { color?: string } }): string {
  const c = String(cs.title.color ?? '#0f766e');
  return /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : '#0f766e';
}

/** 内置 Lucide 名渲染为 img；其它值（自定义 emoji）当普通文字。 */
export function renderCalloutIcon(icon: string, cs: { title: { color?: string } }): string {
  const paths = LUCIDE[icon];
  if (!paths) return icon ? `${escapeHtml(icon)} ` : '';
  const src = toDataUri(svgMarkup(paths, titleColor(cs)));
  return `<img src="${src}" width="16" height="16" alt="" style="display:inline-block;width:16px;height:16px;vertical-align:-2.5px;margin-right:6px;border:0;outline:none"/>`;
}
