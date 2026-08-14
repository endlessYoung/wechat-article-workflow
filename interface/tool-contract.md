# wechat_format 工具契约

> 本文定义 `wechat_format` 作为 **Agent Harness / Plugin 工具**时的调用契约。
> 实现方式不限：CLI 进程、JS 模块、HTTP 服务均可，只要遵循同一份输入/输出 Schema。

## 1. 工具元信息

| 字段 | 值 |
| --- | --- |
| tool name | `wechat_format` |
| 语义 | 将 Markdown 原文或大纲排版为符合公众号阅读习惯的文本 |
| 幂等性 | **幂等**：同一输入 + 同一选项，输出完全一致（纯确定性转换） |
| 副作用 | 无（不写网络、不改文件，除非显式 `-o`） |
| 超时建议 | 输入 ≤ 50KB 时，CLI 模式建议超时 10s |

## 2. 输入（JSON）

```json
{
  "source": "# 标题\n\n正文……",
  "options": {
    "numberHeadings": true,
    "quoteStyle": "plain",
    "maxParagraphChars": 160
  }
}
```

- `source`（必填）：Markdown 原文或结构化大纲，字符串。
- `options`（可选）：见 `options.schema.json`；缺省项使用默认值。
- 其余字段一律忽略（`additionalProperties: false`）。

## 3. 输出（JSON）

```json
{
  "text": "排版后的最终文本……",
  "stats": {
    "paragraphs": 12,
    "headings": { "h1": 1, "h2": 3, "h3": 2, "other": 0 },
    "lists": 2,
    "listItems": 5,
    "codeBlocks": 1,
    "quotes": 1,
    "dividers": 2,
    "transitions": 0,
    "longParagraphs": 0,
    "chars": 1200,
    "cjkChars": 980
  },
  "warnings": ["相邻标题：……"],
  "meta": {
    "engine": "wechat-formatting-skill",
    "version": "0.1.0",
    "options": { "numberHeadings": true, "quoteStyle": "plain" }
  }
}
```

| 字段 | 说明 |
| --- | --- |
| `text` | 最终文本，可直接复制到公众号后台；末尾含一个换行 |
| `stats` | 排版统计（段落/标题/列表/代码块/引用/分隔线/过渡/字数） |
| `warnings` | 非致命问题列表（相邻标题、超长段落、未闭合代码围栏等）；Agent 应据此做后续加工 |
| `meta` | 引擎信息与生效选项（便于审计与复现） |

## 4. 错误契约

工具层错误统一返回：

```json
{
  "error": {
    "code": "INPUT_READ_FAILED | SCHEMA_INVALID | UNKNOWN",
    "message": "人类可读的错误说明"
  }
}
```

- `SCHEMA_INVALID`：`source` 缺失或非字符串、`options` 非法。
- 排版本身**不会失败**：任何字符串都可被排版；语法不完整的内容只会产生 warnings，不会抛错。

## 5. 调用方式

### 5.1 CLI（推荐给 Harness 注册为子进程工具）

```bash
# 输出 JSON（含 text/stats/warnings）
node bin/wechat-format.js input.md --json

# 纯文本 + 统计打到 stderr
node bin/wechat-format.js input.md

# CI 校验：有警告则退出码 1
node bin/wechat-format.js input.md --check
```

### 5.2 JS 模块（推荐给 Node/TS 环境内联调用）

```js
import { format } from './src/index.js';
const { text, stats, warnings } = format(source, options);
```

### 5.3 HTTP（预留）

约定 `POST /format`，body 为第 2 节 JSON，响应为第 3 节 JSON；错误码 `400 SCHEMA_INVALID`、`500 UNKNOWN`。

## 6. 使用建议（给调用方 Agent）

1. 先跑一次引擎拿机械结果与 `warnings`；
2. 依据 `SKILL.md` 第 4-5 节与 `rules/`、`templates/`，手工补开头钩子、章节过渡句、结尾 CTA；
3. 对照 `SKILL.md` 第 6 节自检清单复核后再交付。
