# 公众号排版 Skill 使用示例

这是一段**正文段落**，用于演示视图层排版效果。正文默认 *15px*、行高 `1.75`，段间距克制、留白充足。你可以在这里使用 [链接](https://example.com)、~~删除线~~ 以及行内代码 `npm run build` 等行内样式。

## 二级标题：标题层级

二级标题使用左侧强调条区分层级；正文建议不超过三层标题，保持阅读节奏。

### 三级标题：正文节

三级标题更轻量，用于小节划分。下面演示其余组件。

## 引用与代码

> 引用块用于转述观点或引出背景：左侧细强调线、文字略灰，克制而不抢戏。

代码块自带浅底卡片与语言标签，长行会自动折行，避免手机端横向滚动：

```ts
export function format(markdown: string, options?: FormatOptions): FormatResult {
  const theme = getTheme(options?.theme);
  const blocks = parseMarkdown(markdown);
  return { html: renderBlocks(blocks, theme), theme: theme.id };
}
```

## 列表

无序列表：

- 排版规则与组件逻辑分离
- 主题可插拔，新增风格无需改渲染器
- 输出纯内联样式，适配公众号编辑器

有序列表：

1. 解析 Markdown 结构
2. 套用主题视觉规范
3. 生成可粘贴的 HTML 片段

嵌套列表：

- 第一阶段
  1. 完成项目结构
  2. 实现默认主题
- 第二阶段
  - 新增多套视觉风格
  - 语法高亮

## 提示卡

::: tip 小技巧
提示卡用 `:::` 容器书写，支持四种语义：tip / note / warning / important。
:::

::: warning
注意：公众号会剥离 `<style>` 与外部 CSS，因此所有样式必须内联。
:::

::: important
重点内容：图片需先上传公众号素材库，粘贴后的外链图片可能失效。
:::

## 主题引用

文中提出结论后可用上标数字标记来源[1]，也可在句末补充多个证据[2]。

::: references
[1]: Teaching Claude Why | Anthropic Research | 2025-06 | https://www.anthropic.com/research/teaching-claude-why
[2]: Reward Hacking in LLMs | arXiv | 2024-10 | https://arxiv.org/abs/2406.10162
:::

---

这是分割线之后的一段收尾文字。

![示例图片](https://example.com/demo.png)
