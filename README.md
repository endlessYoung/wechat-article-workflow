# wechat-formatting-skill

> 公众号文章排版 Skill：把 **Markdown 原文 / 结构化大纲** 排版成符合**微信公众号阅读习惯**的最终文本，可直接复制到公众号后台使用；可被 DeepSeek Harness 或其他 Agent 作为 **Skill / Tool** 调用。

---

## 一、它解决什么问题

公众号文章的核心读者在手机端：**碎片时间、扫读、易疲劳**。因此排版不只是"好看"，而是影响完读率的工程问题。本项目把一套经过验证的公众号排版规范沉淀为：

1. **规则集（rules/）** —— 标点、间距、标题层级、段落节奏、代码/引用/列表、语气与过渡，全部抽离成可维护的 Markdown 规则文档；
2. **模板库（templates/）** —— 开头钩子、章节过渡句、结尾 CTA、块引导语，供 Agent 创作时参考或直接选用；
3. **参考引擎（src/ + bin/）** —— 零依赖 Node 实现，自动完成机械性排版（全角标点、中英文空格、标题编号、段落拆分、分隔线统一等），输出可直接粘贴的文本；
4. **对接契约（interface/ + docs/）** —— 定义 `wechat_format` 工具契约与 Harness/Plugin 集成方式。

> 分工原则：**机械规则交给引擎，创意文案交给 Agent**。引擎不做"创作"，只做确定性、可测试的转换；引导语、过渡句等需要理解语境的产出，由 Agent 依据 rules/ 与 templates/ 完成。

## 二、快速开始

```bash
# 无需安装依赖（零依赖，Node >= 18）

# 1) 查看 CLI 帮助
node bin/wechat-format.js --help

# 2) 排版一个文件，输出到终端
node bin/wechat-format.js examples/input.md

# 3) 输出到文件 + 打印统计与警告
node bin/wechat-format.js examples/input.md -o out.md --number-headings

# 4) 生成示例的预期输出（用于演示与测试）
npm run demo

# 5) 运行测试
npm test
```

作为 **JS 模块** 调用：

```js
import { format } from './src/index.js';

const { text, stats, warnings } = format(source, {
  numberHeadings: true,      // 给顶层标题编号：01 | xxx
  splitLongParagraphs: true, // 拆分超长段落
  quoteStyle: 'plain',       // 引用转「」样式（默认）
});
console.log(text);
```

作为 **Agent Skill** 使用：直接把本目录挂载为 Agent 的技能目录，Agent 先读 `SKILL.md`，按其中流程与规则索引执行；或把 `bin/wechat-format.js` 注册为 Harness 的 `wechat_format` 工具（见 `docs/harness-integration.md`）。

## 三、项目结构

```
wechat-formatting-skill/
├── SKILL.md                    # Agent 调用入口：输入/输出契约、处理流程、规则与模板索引
├── README.md                   # 本文档
├── package.json                # 元信息、脚本、bin 注册（零依赖）
├── LICENSE / .gitignore
├── rules/                      # ★ 排版规则（核心资产，抽离维护）
│   ├── 00-overview.md          #   排版总则与五原则
│   ├── 01-typography.md        #   标点、中英文空格、数字、强调
│   ├── 02-structure.md         #   标题层级、段落节奏、留白
│   ├── 03-blocks.md            #   代码块、引用、列表、分隔线
│   └── 04-tone.md              #   引导文案、过渡句、情绪节奏
├── templates/                  # ★ 文案模板（Agent 创作素材库）
│   ├── hooks.md                #   开头钩子模板
│   ├── transitions.md          #   章节过渡句模板
│   ├── endings.md              #   结尾与 CTA 模板
│   └── block-intros.md         #   列表/引用/代码引导语模板
├── src/                        # 参考引擎（零依赖 Node ESM）
│   ├── index.js                #   公共 API 出口
│   ├── engine.js               #   排版流水线（分块 → 逐块套规则 → 统计/告警 → 拼装）
│   ├── blocks.js               #   Markdown 块级解析（含代码围栏保护）
│   ├── options.js              #   选项定义、默认值、解析（与 interface/options.schema.json 同步）
│   ├── templates.js            #   过渡句/钩子/结尾模板数据（与 templates/*.md 同步）
│   └── rules/                  #   原子规则，可独立测试与扩展
│       ├── text.js             #     标点全角化、中英文空格、行内代码/URL 保护
│       ├── headings.js         #     标题标记规范化与编号
│       ├── lists.js            #     列表符号统一
│       ├── paragraphs.js       #     超长段落拆分
│       ├── dividers.js         #     分隔线统一
│       └── quotes.js           #     引用样式（「」/ markdown）
├── bin/
│   └── wechat-format.js        # CLI 入口
├── interface/                  # ★ Agent Harness / Plugin 对接契约
│   ├── tool-contract.md        #   wechat_format 工具契约（输入/输出 Schema、错误、幂等）
│   ├── plugin-manifest.example.json
│   └── options.schema.json     #   选项 JSON Schema（draft-07）
├── docs/
│   └── harness-integration.md  # 与 DeepSeek Harness / Plugin 体系对接设计
├── examples/
│   ├── input.md                # 待排版样例（故意含"不规范"输入）
│   └── expected-output.md      # 引擎生成的预期输出（npm run demo 重新生成）
└── test/                       # node:test 测试
    ├── blocks.test.js
    ├── punctuation.test.js
    ├── headings.test.js
    ├── engine.test.js
    └── cli.test.js
```

## 四、规则与模板索引

| 关注点 | 规则文档 | 模板 |
| --- | --- | --- |
| 标点、空格、强调 | `rules/01-typography.md` | — |
| 标题层级、段落节奏 | `rules/02-structure.md` | — |
| 代码/引用/列表/分隔线 | `rules/03-blocks.md` | `templates/block-intros.md` |
| 开头钩子 | `rules/04-tone.md` | `templates/hooks.md` |
| 章节过渡 | `rules/04-tone.md` | `templates/transitions.md` |
| 结尾与 CTA | `rules/04-tone.md` | `templates/endings.md` |

## 五、与 Agent Harness 对接

- **Skill 手册模式**：Agent 读取 `SKILL.md` 后按流程产出排版文本（适合 LLM 原生调用）。
- **工具模式**：把 `wechat_format` 注册进 Harness（CLI 或 JS 模块），输入 JSON `{ source, options }`，输出 `{ text, stats, warnings }`。
- **插件模式**：`interface/plugin-manifest.example.json` 提供了插件清单示例；详见 `interface/tool-contract.md` 与 `docs/harness-integration.md`。

## 六、Roadmap

- [ ] 图片占位与 alt 文案规则
- [ ] 公众号后台富文本（含内联样式）输出模式
- [ ] 更多标题风格（「一、二、三」式、序号+emoji 式）
- [ ] 与主流 Markdown 解析器（如 markdown-it）的格式兼容测试
- [ ] 输出 HTML 片段供粘贴（保留加粗/颜色）

## 七、License

MIT
