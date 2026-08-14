# 与 DeepSeek Harness / Plugin 体系对接设计

> 目标：让 `wechat-formatting-skill` 能被 **DeepSeek Harness（DSH）或其他 Agent 宿主** 以三种方式消费，且互不排斥。

## 1. 三种对接模式

```
┌──────────────────────────────────────────────────────────────┐
│                        Agent 宿主                             │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ A. Skill 手册 │  │ B. Tool 工具  │  │ C. 模块 / 插件     │  │
│  │  (读 SKILL.md) │  │ (wechat_format)│  │ (JS import / 插件)│  │
│  └──────┬───────┘  └──────┬───────┘  └─────────┬──────────┘  │
└─────────┼─────────────────┼────────────────────┼─────────────┘
          │                 │                    │
   ┌──────▼──────┐   ┌──────▼───────┐    ┌───────▼────────┐
   │ rules/      │   │ bin/wechat-  │    │ src/index.js   │
   │ templates/  │   │ format.js    │    │ (format API)   │
   └─────────────┘   └──────────────┘    └────────────────┘
```

- **A. Skill 手册模式**：宿主把本目录挂载为技能目录。Agent 读取 `SKILL.md`，按六步流程产出排版文本。适用于 LLM 原生、需要创作性加工的调用。
- **B. 工具模式**：宿主把 `wechat_format` 注册为可调用工具（CLI 子进程），输入 `{ source, options }`，拿到 `{ text, stats, warnings }`。适用于确定性转换、批量处理、作为 Agent 工作流中的一步。
- **C. 模块/插件模式**：Node/TS 环境直接 `import { format } from '...'`；或按 `interface/plugin-manifest.example.json` 把本包注册为宿主插件。

## 2. 契约与 Schema（单一事实来源）

| 事实来源 | 内容 |
| --- | --- |
| `interface/options.schema.json` | 输入选项 JSON Schema（draft-07） |
| `interface/tool-contract.md` | 工具输入/输出/错误/幂等契约 |
| `src/options.js` | 选项默认值（代码侧，与 schema 同步） |
| `src/templates.js` | 模板句数据（与 `templates/*.md` 同步） |

改动选项或模板时，需同步更新对应文件；`test/engine.test.js` 会在格式化示例时校验默认值一致性（对 `examples/expected-output.md` 做快照比对）。

## 3. 在 DSH 中注册的推荐步骤（示意）

1. 将本仓库放入宿主可访问的路径，例如作为 skill 目录或插件目录。
2. 若走工具模式：以 `plugin-manifest.example.json` 为模板注册工具 `wechat_format`；
   - handler 指向 `node bin/wechat-format.js --json`；
   - 入参校验用 `options.schema.json`；
   - 提示词中给出 `invokeHint`（见 manifest）。
3. 若走手册模式：把 `SKILL.md` 注册为技能，触发词见其 frontmatter `trigger`。
4. 建议在 Agent 提示词中说明：**引擎不做创作**，过渡句/钩子/结尾需 Agent 按 `rules/04-tone.md` 与 `templates/` 补写，之后对照自检清单。

## 4. 扩展点（后续迭代入口）

| 扩展需求 | 改哪里 |
| --- | --- |
| 新增排版规则 | `src/rules/` 新增原子规则文件 → 在 `engine.js` 挂接 → 在 `rules/` 写文档 → 补测试 |
| 新增文案模板 | `templates/*.md` 增加条目 → 如需引擎可替换，同步 `src/templates.js` |
| 新增选项 | `src/options.js` + `interface/options.schema.json` + CLI 参数解析 + 测试 |
| 新增输出格式（如富文本/HTML） | `engine.js` 增加渲染器，保持 `format()` 返回结构不变 |
| 对接其他宿主（如 MCP） | 按 `tool-contract.md` 实现 transport 适配层，契约不变 |

## 5. 版本与兼容

- 引擎版本见 `meta.version`；输出文本由（输入, 选项, 版本）决定。
- 破坏性变更（默认值、输出格式）遵循 semver：主版本升级时在 CHANGELOG 中说明。
- 快照测试（`examples/expected-output.md`）即回归防线：任何默认行为变化都会在 `npm test` 中暴露。
