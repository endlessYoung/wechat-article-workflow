---
name: wechat-article-workflow
description: 公众号文章工作流：把 Markdown/大纲排版为可粘贴公众号后台的多主题内联样式 HTML，并支持 OCR 读图、图床上传与一键复制发布。不改写内容事实。
version: 0.1.0
trigger: 用户要求"排版公众号文章 / 生成公众号 HTML / 公众号视图排版 / 输出可粘贴公众号后台的富文本 / 公众号多主题排版"
---

# 公众号文章工作流 Skill

## 1. 定位与输入输出

- **输入**：Markdown 原文，或结构化文章大纲（标题 + 要点）。
- **输出**：可直接粘贴到微信公众号后台编辑器的**内联样式 HTML 片段**。
- **边界**：你负责**视图层排版**（字号/行高/间距/颜色/卡片视觉），**不负责内容写作风格**；不改变原文事实与观点，不新增原文没有的内容，不破坏代码、链接、数据。

## 2. 调用方式（三选一）

1. **模块模式（推荐）**：`import { format } from 'wechat-article-workflow'`，对 `format(source, { theme })` 的返回值取 `.html` 交给用户粘贴。
2. **CLI 模式**：`wechat-format input.md -o out.html [--theme minimal] [--json]`，机械转换交给引擎。
3. **手册模式**：直接按本文档流程，用下方「组件语法」与主题规范手写 HTML。

引擎返回 `{ html, theme, stats, warnings }`；`warnings` 需转达用户（如「图片需上传素材库」）。

## 3. 支持的组件语法（Markdown）

| 组件 | 语法 | 说明 |
| --- | --- | --- |
| 标题 | `#` / `##` / `###` | 仅三层；H4+ 自动降级为 H3 视觉并告警 |
| 段落 | 空行分隔 | 统一行高 1.75、段间距、字号 15px |
| 加粗/斜体/删除线 | `**x**` / `*x*` / `~~x~~` | 行内样式 |
| 行内代码 | `` `x` `` | 浅底 + 等宽字体 |
| 链接 | `[文字](url)` | 主题强调色 + 下划线 |
| 图片 | `![alt](url)` | 需上传公众号素材库（粘贴后外链可能失效） |
| 引用块 | `> 文字` | 左侧强调线 + 略灰文字 |
| 代码块 | ```` ```lang ```` | 浅底卡片 + 语言标签 + Kotlin 语法高亮，长行自动折行 |
| 无序列表 | `-` / `*` / `+` | 支持缩进嵌套 |
| 有序列表 | `1.` / `2.` | 支持缩进嵌套 |
| 分割线 | `---` 或 `***` | 居中短细线 |
| 数学公式 | `$...$` / `$$...$$` | 行内斜体 / 居中块级；LaTeX 命令转 Unicode（→/⟶ 等），`\text{}` 直立 |
| 提示卡 | `::: kind [标题]` … `:::` | `tip`/`note`/`warning`/`important`（别名：hint/info/warn/danger/star） |
| 引用标记 | `[1]` `[2]` | 上标数字，可跳转文末对应条目 |
| 参考文献 | `::: references` … `:::` | 编号列表，条目含标题/来源/日期/链接 |

提示卡示例：

```markdown
::: warning 注意
公众号会剥离 `<style>` 与外链 CSS，所有样式必须内联。
:::
```

主题引用示例（文内 `[N]` 标记 + 文末列表）：

```markdown
该结论已有研究支撑[1]，另有补充证据[2]。

::: references
[1]: Teaching Claude Why | Anthropic Research | 2025-06 | https://www.anthropic.com/research/teaching-claude-why
[2]: Reward Hacking in LLMs | arXiv | 2024-10 | https://arxiv.org/abs/2406.10162
:::
```

引用条目格式：`[N]: 标题 | 来源 | 日期 | 链接`（`|` 为字段分隔，`标题` 必填，其余可空）；也支持 `1. …` / `- …` 自动编号。文内标记与条目编号双向对应（正文上标 `N` ↔ 文末 `#ref-N`）。

## 4. 主题

- 内置主题：
  - `minimal`（极简白）：留白充足、单一青绿强调色、正文 15px/1.75；
  - `anthropic`（暖白研究 · Anthropic 风）：暖白象牙底、陶土强调色、无衬线标题 + 衬线正文、上标脚注。
- 列出主题：`wechat-format --list-themes`；切换：`--theme anthropic`。
- 自定义主题：实现 `Theme` 对象后 `registerTheme()`，参考 `docs/theme-guide.md`。
- 多主题切换不改变组件结构，只替换视觉规则（样式与逻辑分离）。

## 5. 输出自检清单

- [ ] 输出为 HTML 片段（非整篇文档），全部样式内联在 `style="..."` 中
- [ ] 标题不超过 3 层；段落行高 1.75、段间距统一
- [ ] 代码块在 `<section>` 卡片内、`white-space:pre-wrap` 防溢出；内容已 HTML 转义
- [ ] 提示卡四类语义正确，图标 + 标题 + 正文结构一致
- [ ] 未破坏原文链接、代码、数据；图片已提示上传素材库
- [ ] `warnings` 已转达用户

## 6. 与 Harness / Plugin 对接

- 工具契约：`interface/tool-contract.md`
- 选项 Schema：`interface/options.schema.json`
- 插件清单示例：`interface/plugin-manifest.example.json`
- 集成与扩展设计：`docs/architecture.md`
