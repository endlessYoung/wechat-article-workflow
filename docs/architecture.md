# 架构与扩展设计

## 1. 设计目标

把「公众号视图层排版」拆成一条**确定性、可测试、可扩展**的流水线：

```
Markdown  ──parse──▶  Block[]  ──render──▶  内联样式 HTML 片段
                          ▲
                          │ 读取视觉规则
                       Theme（主题契约）
```

- **解析与渲染解耦**：`parseMarkdown` 只识别结构；`renderBlocks` 只做「组件 → 标签 + 内联样式」的映射。
- **样式与逻辑分离**：所有视觉决策（颜色/字号/间距/圆角）收敛进 `Theme`，渲染器不含任何硬编码颜色。
- **公众号兼容优先**：输出纯内联 `style`，卡片/代码块用 `<section>` 包裹，规避编辑器剥离 `<style>`/外链 CSS。

## 2. 目录职责

| 路径 | 职责 |
| --- | --- |
| `src/core/types.ts` | Block / InlineToken 结构定义 |
| `src/core/parser.ts` | 块级解析（标题/段落/引用/代码/列表/分割线/提示卡） |
| `src/core/inline.ts` | 行内解析（加粗/斜体/行内码/链接/删除线/图片） |
| `src/core/renderer.ts` | Block → HTML（唯一读取 Theme 视觉规则的地方） |
| `src/core/format.ts` | 编排入口 + 统计 + 告警 |
| `src/themes/types.ts` | Theme / Style 契约 |
| `src/themes/minimal.ts` | 默认主题 |
| `src/themes/registry.ts` | 主题注册与查找 |
| `src/index.ts` | 公共 API |
| `src/cli.ts` | CLI 入口 |

## 3. 扩展点

### 3.1 新增视觉风格（多主题）

1. 新建 `src/themes/<id>.ts`，实现 `Theme` 对象；
2. 在 `registry.ts` 或调用侧 `registerTheme(myTheme)`；
3. CLI `--theme <id>` 或 API `format(md, { theme: '<id>' })` 使用。

内置 `minimal` 与 `anthropic` 即两个主题实例；`anthropic` 演示了 `article` 整篇包裹（暖白纸张底 + 640px 阅读列宽）与「无衬线标题 + 衬线正文」的搭配。

详见 `docs/theme-guide.md`。

### 3.2 新增排版组件

1. 在 `src/core/types.ts` 增加 Block 变体；
2. 在 `src/core/parser.ts` 识别其语法；
3. 在 `src/core/renderer.ts` 的 `renderBlock` 增加分支（从 `theme` 读取样式）；
4. 在 `src/themes/types.ts` + `minimal.ts` 补充对应样式字段。

主题引用（Citation）模块即按此模式落地：`[N]` 行内标记 → `references` 块 → `renderReferences` 渲染；文内标记与文末条目通过「编号 → 条目」索引（`Map<string, Reference>`）双向对应。

### 3.3 与 Agent / Harness / Plugin 对接

- **模块模式**：`import { format } from 'wechat-article-workflow'`；
- **CLI 模式**：`wechat-format`（`--json` 输出结构化结果）；
- **Skill 手册模式**：Agent 读取 `SKILL.md` 后按流程产出；
- **插件模式**：`interface/plugin-manifest.example.json` 定义工具清单，`interface/tool-contract.md` 定义契约。

## 4. 公众号兼容性要点

- 仅使用内联 `style`（公众号编辑器会移除 `<style>` 与 `<link>`）；
- 容器用 `<section>`（在公众号富文本中保留最完整）；
- 代码块 `white-space: pre-wrap; word-break: break-all;` 防移动端横向溢出；
- 标题不超过 3 层（H4+ 降级为 H3 视觉并在 `warnings` 提示）；
- 图片需先上传公众号素材库（外链在粘贴后可能失效），工具会在 `warnings` 提示；
- 引用上标用 `<sup>`、文末条目带 `id="ref-N"` 供锚点跳转；公众号粘贴后可能剥离 `id`/锚点，跳转在部分环境失效（不影响内容展示）。

## 5. 未来方向

- 语法高亮（代码块）
- 表格渲染（WeChat 表格样式特殊，需专项处理）
- 更多内置主题（暗色、品牌色、手账风等）
- 主题热加载 / 外部主题包
- 与 markdown-it / remark 生态的适配器
