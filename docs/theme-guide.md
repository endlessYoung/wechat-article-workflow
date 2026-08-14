# 主题编写指南

主题是「一套视觉规范」的完整描述。新增一套风格，只需实现一个 `Theme` 对象。

## 1. 契约总览

参见 `src/themes/types.ts`。要点：

- `Style` 是 `Record<string, string | number | undefined>`，**camelCase 键**（如 `fontSize`、`backgroundColor`），会被自动转为 `font-size`、`background-color`。
- `base` 与 `colors` 是「全局令牌」，供主题作者与未来自动化派生使用；渲染器当前主要读取组件字段。
- `article` 是整篇包裹容器样式（如暖白纸张底、阅读列宽、内边距）；空对象 `{}` 表示不包裹。内置 `anthropic` 主题演示了其用法。
- 每种组件都有独立字段；未使用的值可用 `undefined` 或省略（序列化时会过滤）。

## 2. 最小示例

```ts
import { registerTheme } from 'wechat-article-workflow';
import type { Theme } from 'wechat-article-workflow';

const brand: Theme = {
  id: 'brand',
  name: '品牌蓝',
  description: '示例主题',
  base: { fontFamily: 'inherit', fontSize: '15px', lineHeight: 1.75, color: '#333' },
  colors: {
    text: '#333', heading: '#111', muted: '#999', link: '#2563eb',
    accent: '#2563eb', border: '#e5e7eb', surface: '#f6f7f9',
  },
  h1: { fontSize: '22px', fontWeight: '700', color: '#111', margin: '0 0 0.7em' },
  h2: { fontSize: '19px', fontWeight: '700', color: '#111', margin: '1.5em 0 0.6em', borderLeft: '4px solid #2563eb', paddingLeft: '12px' },
  h3: { fontSize: '16px', fontWeight: '700', color: '#111', margin: '1.3em 0 0.5em' },
  paragraph: { fontSize: '15px', lineHeight: '1.75', color: '#333', margin: '0 0 1.1em' },
  strong: { fontWeight: '700', color: '#111' },
  em: { fontStyle: 'italic' },
  link: { color: '#2563eb', textDecoration: 'underline' },
  inlineCode: { fontFamily: 'monospace', fontSize: '0.88em', color: '#c0341d', backgroundColor: '#f2f3f5', padding: '2px 5px', borderRadius: '4px' },
  blockquote: { margin: '1.3em 0', padding: '0 0 0 14px', borderLeft: '4px solid #2563eb', color: '#5a6069' },
  image: { display: 'block', maxWidth: '100%', borderRadius: '6px' },
  codeBlock: {
    wrapper: { backgroundColor: '#f6f8fa', border: '1px solid #eaecef', borderRadius: '8px', padding: '14px 16px', margin: '1.2em 0' },
    lang: { fontSize: '12px', color: '#999', margin: '0 0 8px', fontFamily: 'monospace' },
    pre: { margin: '0', whiteSpace: 'pre-wrap', wordBreak: 'break-all', overflowX: 'auto', lineHeight: '1.6', fontFamily: 'monospace', fontSize: '13px', color: '#24292f' },
    code: { fontFamily: 'monospace', fontSize: '13px' },
  },
  list: {
    ul: { margin: '0 0 1.2em', paddingLeft: '1.6em', listStyleType: 'disc', color: '#333' },
    ol: { margin: '0 0 1.2em', paddingLeft: '1.6em', listStyleType: 'decimal', color: '#333' },
    li: { margin: '0.35em 0', lineHeight: '1.75' },
  },
  divider: {
    wrapper: { textAlign: 'center', margin: '1.8em 0' },
    line: { display: 'inline-block', width: '72px', height: '1px', backgroundColor: '#e5e7eb' },
  },
  cite: { fontSize: '0.75em', color: '#2563eb', fontWeight: '600', margin: '0 1px' },
  citeLink: { color: '#2563eb', textDecoration: 'none' },
  references: {
    label: '参考文献',
    wrapper: { margin: '2.2em 0 0', padding: '16px 0 0', borderTop: '1px solid #e5e7eb' },
    title: { fontSize: '14px', fontWeight: '700', color: '#111', margin: '0 0 12px' },
    list: { margin: '0', paddingLeft: '0', listStyleType: 'none' },
    item: { margin: '0 0 10px', lineHeight: '1.6', fontSize: '13px', color: '#5a6069' },
    index: { color: '#999', fontSize: '0.85em', marginRight: '6px', fontWeight: '600' },
    refTitle: { color: '#333', fontWeight: '600' },
    meta: { color: '#999' },
    link: { color: '#2563eb', textDecoration: 'none', fontSize: '12px', wordBreak: 'break-all' },
  },
  callout: {
    tip:     { label: '提示', icon: '💡', wrapper: { backgroundColor: '#eef7f5', borderLeft: '3px solid #0f766e', borderRadius: '6px', padding: '12px 16px', margin: '1.2em 0' }, title: { margin: '0 0 4px', fontWeight: '700', color: '#0f766e' }, content: { margin: '0', lineHeight: '1.7' } },
    note:    { label: '说明', icon: '📌', wrapper: { backgroundColor: '#eef4ff', borderLeft: '3px solid #2563eb', borderRadius: '6px', padding: '12px 16px', margin: '1.2em 0' }, title: { margin: '0 0 4px', fontWeight: '700', color: '#2563eb' }, content: { margin: '0', lineHeight: '1.7' } },
    warning: { label: '注意', icon: '⚠️', wrapper: { backgroundColor: '#fef7ec', borderLeft: '3px solid #d97706', borderRadius: '6px', padding: '12px 16px', margin: '1.2em 0' }, title: { margin: '0 0 4px', fontWeight: '700', color: '#d97706' }, content: { margin: '0', lineHeight: '1.7' } },
    important: { label: '重点', icon: '⭐', wrapper: { backgroundColor: '#fdf0f0', borderLeft: '3px solid #dc2626', borderRadius: '6px', padding: '12px 16px', margin: '1.2em 0' }, title: { margin: '0 0 4px', fontWeight: '700', color: '#dc2626' }, content: { margin: '0', lineHeight: '1.7' } },
  },
};

registerTheme(brand);
```

## 3. 关键约定

1. **key 用 camelCase**：`backgroundColor`、`fontSize`、`paddingLeft`。数值可传 `number`（如 `lineHeight: 1.75`）。
2. **内联样式限制**：公众号编辑器只保留内联 `style`，避免依赖 `display:grid`、`position:fixed`、`@media`、CSS 变量等（部分会被过滤或表现异常）。优先 `margin/padding/背景/边框/字号/行高/颜色`。
3. **容器用 `<section>`**：卡片与代码块由渲染器输出为 `<section>`，主题只需给样式。
4. **提示卡四类**：`tip / note / warning / important` 必须齐全（渲染器按 `CalloutKind` 索引）。
5. **主题引用字段**：`cite`（文内上标）、`citeLink`（上标锚点）、`references`（文末列表：`label/title/list/item/index/refTitle/meta/link`）需齐全。
6. **标题层级**：只提供 `h1/h2/h3`；H4+ 自动降级到 `h3` 视觉。
7. **兼容性自检**：改完主题后跑 `npm run demo` 查看 `examples/sample-output.html`，并粘贴到公众号后台「草稿 → 预览」验证。

## 4. 注册与使用

```ts
import { registerTheme, format } from 'wechat-article-workflow';
import { brand } from './brand.js';

registerTheme(brand);
format(md, { theme: 'brand' }); // 或直接 format(md, { theme: brand })
```
