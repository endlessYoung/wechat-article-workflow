# wechat_format 工具契约

> 面向 Agent / Harness / Plugin 的工具化对接。与 `src/index.ts` 的 `format()` 一一对应。

## 1. 工具标识

- **名称**：`wechat_format`
- **语义**：把 Markdown 原文或结构化大纲排版为**可直接粘贴公众号后台的内联样式 HTML 片段**（视图层排版，不改写内容事实）。
- **纯函数**：无副作用；相同输入 + 相同 options 得到相同输出。

## 2. 输入

```jsonc
{
  "source": "string（Markdown 原文或结构化大纲）",
  "options": {
    "theme": "string | Theme 对象（可选，默认 'minimal'）"
  }
}
```

- `source`：必填。支持标准 Markdown + 本 Skill 的提示卡扩展语法（见 SKILL.md §3）。
- `options`：可选。JSON Schema 见 `interface/options.schema.json`。

## 3. 输出

```jsonc
{
  "html": "string（内联样式 HTML 片段，可直接粘贴）",
  "theme": "string（实际使用的主题 id）",
  "stats": {
    "headings": 0, "paragraphs": 0, "blockquotes": 0, "codeBlocks": 0,
    "lists": 0, "listItems": 0, "dividers": 0, "callouts": 0,
    "images": 0, "totalBlocks": 0
  },
  "warnings": ["string（兼容性/使用提示，非致命）"]
}
```

## 4. 错误约定

| 情形 | 行为 |
| --- | --- |
| 未知主题 id | 抛错，message 含可用主题列表（`listThemes()`） |
| 空输入 | 不抛错，返回空 `html` 且 `warnings` 含「输入内容为空」 |
| 输入非字符串 | 抛 TypeError |

## 5. 幂等性

`format()` 只做确定性转换：不引入随机数、时间戳或外部状态；重复调用结果稳定。

## 6. 三种对接形态

1. **模块**：`import { format } from 'wechat-article-workflow'`
2. **CLI**：`wechat-format input.md -o out.html --theme minimal`
3. **插件**：见 `interface/plugin-manifest.example.json` 与 `docs/harness-integration.md`
