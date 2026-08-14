<div align="center">

# wechat-article-workflow

**公众号文章工作流：把 Markdown 排版成可粘贴到公众号后台的内联样式 HTML，图床托管 + 一键复制发布。**

可被 Agent（DeepSeek Harness 等）、CLI 或作为库调用的多主题排版 Skill。

[English](./README.md) · [Skill 手册](./SKILL.md) · [架构设计](./docs/architecture.md) · [主题指南](./docs/theme-guide.md) · [实践复盘](./docs/how-it-was-built.md)

![License: MIT](https://img.shields.io/badge/license-MIT-green)
![Node: >=18](https://img.shields.io/badge/node-%3E%3D18-blue)
![零运行时依赖](https://img.shields.io/badge/dependencies-0_runtime-orange)

</div>

---

## 解决什么问题

微信公众号编辑器会剥离 `<style>` 和外链 CSS，富文本必须带上**内联样式**才能正常显示。本项目把 Markdown 原文（或结构化大纲）转换成一份自带内联样式、可直接粘贴进公众号后台的 HTML 片段，开箱即得统一、专业的排版。

它解决的是「**视图层排版**」问题（字号、行高、间距、颜色、组件视觉），**不负责内容写作**——不会改写你的事实、链接或代码。

## 特性

- **7 类核心组件**——H1/H2/H3、正文段落、引用块、代码块、有序/无序列表（含嵌套）、分割线、提示卡（`::: tip|note|warning|important`）。
- **主题引用模块**——文内上标 `[1]` 标记 + 文末参考文献列表（`::: references`）。
- **公众号兼容**——无 `<style>`/外链 CSS；卡片与代码块用 `<section>` 包裹；代码块 `white-space: pre-wrap` 防移动端横向溢出。
- **样式与逻辑分离**——所有视觉规则收敛进 `Theme` 契约，渲染器零硬编码；新增一套风格 = 写一个 `Theme` 对象 + `registerTheme()`。
- **内置两套主题**——`minimal`（极简白）与 `anthropic`（暖白研究，致敬 Anthropic 研究页）。
- **Agent 原生**——库 API + CLI + SKILL.md 手册 + `wechat_format` 工具契约，可对接 DeepSeek Harness / 插件。
- **零运行时依赖**——自研 Markdown 解析器，Node >= 18。

## 快速开始

```bash
npm install        # 安装开发依赖
npm run build      # 编译 TS → dist/

node dist/cli.js examples/sample.md -o out.html                    # 排版（minimal 主题）
node dist/cli.js examples/sample.md -o out.html --theme anthropic  # 切换主题
node dist/cli.js --list-themes                                     # 列出主题
node dist/cli.js examples/sample.md --json                         # 输出 html + stats + warnings

npm test           # 运行测试
npm run demo       # 重新生成示例输出
```

### 作为库调用

```ts
import { format, registerTheme, listThemes } from 'wechat-article-workflow';

const { html, theme, stats, warnings } = format('# 标题\n\n正文……', { theme: 'anthropic' });
console.log(html); // 可直接粘贴的 HTML 片段
```

## 支持的 Markdown 语法

| 组件 | 语法 |
| --- | --- |
| 标题 | `#` `##` `###` |
| 段落 / 加粗 / 斜体 / 删除线 | 空行 / `**x**` / `*x*` / `~~x~~` |
| 行内代码 / 链接 / 图片 | `` `x` `` / `[文字](url)` / `![alt](url)` |
| 引用块 | `> 文字` |
| 代码块 | ```` ```lang ```` |
| 有序 / 无序列表 | `1.` / `-` `*` `+`（缩进嵌套） |
| 分割线 | `---` 或 `***` |
| 提示卡 | `::: tip\|note\|warning\|important [标题]` … `:::` |
| 引用标记 | `[1]` `[2]`（上标，跳转 `#ref-N`） |
| 参考文献 | `::: references` … `:::`（`[N]: 标题 \| 来源 \| 日期 \| 链接`） |

完整示例见 `examples/sample.md` 与 `examples/sample-output.html`。

## 主题

| id | 名称 | 风格 |
| --- | --- | --- |
| `minimal` | 极简白 | 干净现代、单一青绿强调色、正文 15px/1.75 |
| `anthropic` | 暖白研究 | 暖白象牙底、陶土强调色、无衬线标题 + 衬线正文 |

几分钟就能新增一套主题——见 `docs/theme-guide.md`。

## 项目结构

```
wechat-article-workflow/
├── SKILL.md                 # Agent 调用手册
├── README.md / README.zh-CN.md
├── src/
│   ├── index.ts             # 公共 API
│   ├── cli.ts               # CLI（wechat-format）
│   ├── core/                # parser / inline / renderer / format
│   ├── themes/              # types.ts / minimal.ts / anthropic.ts / registry.ts
│   └── utils/               # css / escape
├── scripts/                 # 内容生产工具（截图 / 内嵌图片 / OCR）
├── interface/               # 工具契约 / options schema / 插件清单
├── docs/                    # architecture.md / theme-guide.md
├── examples/                # sample.md + 生成的 HTML
└── test/                    # node:test
```

## Agent / 工具对接

- **库**——`import { format } from 'wechat-article-workflow'`
- **CLI**——`wechat-format input.md -o out.html --theme minimal --json`
- **Skill 手册**——Agent 读取 `SKILL.md` 按流程执行
- **工具**——`wechat_format` 契约见 `interface/tool-contract.md`

## 内容生产工作流

仓库自带工具脚本，把素材整理成一篇可直接发布的文章：

```bash
# 1) OCR 识别截图/文字素材（当模型没有视觉能力时）
npm run ocr -- path/to/images/

# 2) 排版成内联样式 HTML
node dist/cli.js article.md -o article.html --theme anthropic

# 3) 把本地图片上传到你的 GitHub 图床，并生成一键复制页面
npm run publish -- article.html --slug article-01
#    -> article-publish.html   （公网图片地址）
#    -> article-copy.html      （一键复制到公众号）
```

然后双击打开 `article-copy.html`，点「📋 一键复制到公众号」，到公众号编辑器 Ctrl+V 粘贴——图片会自动从 jsDelivr 加载。

> `npm run publish` 会把图片上传到 GitHub 仓库（`WECHAT_IMG_REPO`，默认 `endlessYoung/wechat-blog-images`），并把 `src` 替换为 `cdn.jsdelivr.net` 地址；token 从 `GITHUB_TOKEN` 或 `gh auth token` 读取。
>
> 可选：`npm run embed -- article.html article-inline.html`（生成 base64 自包含预览）与 `npm run screenshot -- article-inline.html article-preview.png`（整页长截图）。

## 开发

```bash
npm install
npm run build       # tsc
npm test            # node:test（tsx）
npm run typecheck   # tsc --noEmit
```

## Roadmap

- [ ] 代码块语法高亮
- [ ] 表格渲染（公众号表格需特殊处理）
- [ ] 更多内置主题（暗色、品牌色等）
- [ ] 外部主题包 / 热加载
- [ ] markdown-it / remark 适配器

## License

[MIT](./LICENSE)
