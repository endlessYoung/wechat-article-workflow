---
name: wechat-article-workflow
description: 公众号文章工作流：把 Markdown/大纲排版为可粘贴公众号后台的多主题内联样式 HTML，并支持代码块转图片、OCR 读图、图床上传、2.35:1 封面绘制与一键复制发布。不改写内容事实。
version: 0.1.0
trigger: 用户要求"排版公众号文章 / 生成公众号 HTML / 公众号视图排版 / 输出可粘贴公众号后台的富文本 / 公众号多主题排版 / 代码块转图片 / 生成公众号封面 / 2.35:1 封面 / 手机录屏转 GIF / 设备演示动图"
---

# 公众号文章工作流 Skill

## 1. 定位与输入输出

- **输入**：Markdown 原文，或结构化文章大纲（标题 + 要点）；可选：封面需求（默认 2.35:1）。
- **输出**：可直接粘贴到微信公众号后台编辑器的**内联样式 HTML 片段**；若用户要封面，另输出文章目录下的 `cover.jpg`（2350×1000）。
- **边界**：你负责**视图层排版**（字号/行高/间距/颜色/卡片视觉），**不负责内容写作风格**；不改变原文事实与观点，不新增原文没有的内容，不破坏代码、数据。外链 URL 必须保留为可见文本，但**不得**输出非 `mp.weixin.qq.com` 的 `<a href>`（公众号会拦截）。

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
| 链接 | `[文字](url)` | 仅 `mp.weixin.qq.com` 可点；其它域名渲染为纯文本 URL |
| 图片 | `![alt](url)` | 需上传公众号素材库（粘贴后外链可能失效） |
| 引用块 | `> 文字` | 左侧强调线 + 略灰文字 |
| 代码块 | ```` ```lang ```` | **排版前必须先转成图片**（见 §5）。HTML 里不得残留围栏代码块。行内 `` `x` `` 仍走文字样式 |
| 无序列表 | `-` / `*` / `+` | 支持缩进嵌套 |
| 有序列表 | `1.` / `2.` | 支持缩进嵌套 |
| 分割线 | `---` 或 `***` | 居中短细线 |
| 表格 | GFM 表格（表头行 + 分隔行） | 表头 + 列对齐（居中/右对齐）+ 斑马纹，内联样式公众号兼容 |
| 数学公式 | `$...$` / `$$...$$` | 行内斜体 / 居中块级；LaTeX 命令转 Unicode（→/⟶ 等），`\text{}` 直立 |
| 提示卡 | `::: kind [标题]` … `:::` | `tip`/`note`/`warning`/`important`（别名：hint/info/warn/danger/star） |
| 引用标记 | `[1]` `[2]` | 上标数字；正文**不**输出 `<a href="#ref-N">`（公众号会拦截非 mp 域名链接） |
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

引用条目格式：`[N]: 标题 | 来源 | 日期 | 链接`（`|` 为字段分隔，`标题` 必填，其余可空）；也支持 `1. …` / `- …` 自动编号。文内上标 `N` 与文末条目编号对应，但正文不输出跳转链接。

公众号后台会拦截非 `mp.weixin.qq.com` 的 `<a href>`（含 `#ref-N` 页内锚点）。引擎把其它域名改成纯文本 URL；文内引用上标只保留 `<sup>`。参考文献列表保留 URL 文本。

## 4. 主题

- 内置主题：
  - `minimal`（极简白）：留白充足、单一青绿强调色、正文 15px/1.75；
  - `anthropic`（暖白研究 · Anthropic 风）：暖白象牙底、陶土强调色、无衬线标题 + 衬线正文、上标脚注。
- 列出主题：`wechat-format --list-themes`；切换：`--theme anthropic`。
- 自定义主题：实现 `Theme` 对象后 `registerTheme()`，参考 `docs/theme-guide.md`。
- 多主题切换不改变组件结构，只替换视觉规则（样式与逻辑分离）。

## 5. 代码块转图片（强制）

生成公众号 HTML、一键复制页、或用户说「把代码块转成图片」时，**必须先完成本节，再排版**。

### 硬约束（零例外）

- Markdown 里每一块围栏代码（` ``` `）都要变成卡片截图，写回正文。短代码、SQL、XML、只有一两行的，也要转。
- **禁止**以「太短不用转」「HTML 会折行」「先出 HTML 再补图」「只截过长的」为由跳过。
- **禁止删减、省略、折叠代码**。长行在卡片里折行，不得裁掉后半截；完整源码另存 `images/src/`。
- 行内代码 `` `x` `` 保持文字，不要截图。
- 转完后必须检查：正文里不再出现围栏代码块。还剩 ` ``` ` 就不能去跑 `wechat-format`。

### 流程

1. `node --import tsx scripts/code-screenshot.mjs --md <文章目录>/article.md --all --replace`  
   或 `npm run code-shot -- --md <文章目录>/article.md --all --replace`。
2. 对照 `images/src/` 与截图：行数、关键字、字符串必须齐全。
3. 再执行 `wechat-format` / 图床发布。代码图会随其它图片一起上传。

改过代码块后必须重跑第 1 步，不要沿用旧 `code-0N.png`。

## 6. 公众号封面（2.35:1）

用户要求封面 / cover / 2.35:1 时执行本节。成品放在**该篇文章目录**：`cover-bg.png`、`cover.html`、`cover.png`、`cover.jpg`。上传后台用 `cover.jpg`。

### 约束

- 画布固定 **2350×1000**（精确 2.35:1）。公众号推荐 900×383，高分辨率导出后由后台缩放。
- **中文必须用 HTML 叠字**，禁止让绘图模型在图里直接写字（易乱码、缺字）。
- 主标题 ≤ 8 个汉字、字号约 128px，保证订阅号列表缩略图（约 350px 宽）仍可读；长标题拆成「短主标题 + 副标题」。
- 文案安全区：距左/上下约 6–8%，标题落在左 1/3；右侧留给背景光效。
- 不要放系列序号（如 `04`），除非用户明确要求。
- 背景题材要对应文章论点，不要套与正文无关的通用科技图。

### 绘制流程

1. **无字背景**：用图像模型生成 16:9 抽象背景，提示词必须含 `no text, no letters, no watermark, no logo`。左侧约 1/3 留暗部负空间；右侧用与文章相关的视觉隐喻（例如「五条并发光带」对应五个场景）。保存为文章目录 `cover-bg.png`。
2. **叠字 HTML**：复制 [`scripts/templates/cover.html`](scripts/templates/cover.html) 到文章目录，与 `cover-bg.png` 放一起。只改 eyebrow / `h1` / `.sub` 三处文案；确认 `<img class="bg" src="cover-bg.png">`。字体：主标题 Noto Sans SC 900（回退微软雅黑），眉题 IBM Plex Mono。左侧渐变遮罩不可删，否则白字会糊进背景。
3. **导出**：`node scripts/cover.mjs <文章目录>/cover.html` → 同目录 `cover.png` + `cover.jpg`。脚本会校验尺寸必须是 2350×1000。
4. **自检**：中文无缺字；缩略想象仍能读主标题；无水印、无期号。把 `cover.jpg` 路径交给用户，在公众号后台选 2.35:1 封面图上传。

改文案后必须重新跑第 3 步，不要只改 HTML 不导出。

## 7. 设备录屏 GIF（Android 真机演示动图）

用户要求把 App 交互 / 手机操作过程做成动图放进文章时执行本节。依赖：`adb`、`ffmpeg`（Windows 下若不在 PATH，可设 `ADB_PATH` / `FFMPEG_PATH` 环境变量）。

### 约束

- 公众号素材库 GIF 上限 **10MB**；正文动图建议宽度 360–540px、帧率 10–15fps，一般控制在 2–5MB。
- 录制时长单次 ≤ 180s（`screenrecord` 系统限制）；更长的操作分段录或加速（`setpts`）。
- 演示前清理状态栏（通知、调试图标），App 用沉浸式布局，避免无关 UI 入镜。
- GIF 无法像图片一样粘贴 HTML 引用，**必须走素材库上传**；Markdown 里照常写 `![alt](images/xxx.gif)` 占位。

### 录制流程

1. **准备演示**：确认设备已连接（`adb devices`），打开目标 App 到起始页面。
2. **录制**：`node scripts/device-gif.mjs <文章目录>/images/<name>.gif --duration 15 --width 420 --fps 12`。启动前有 3s 倒计时；期间用 `adb shell input tap/swipe` 驱动交互（自动化场景可后台并行发指令）。脚本完成 `screenrecord` → 拉取 → palette 两遍法转 GIF。
3. **自检**：文件 < 10MB；时长、内容覆盖预期操作；`--keep-mp4` 可保留原始视频供二次剪辑。
4. **入文**：在文章对应位置加 `![演示](images/<name>.gif)`，排版时提醒用户该 GIF 需上传素材库。

## 8. 输出自检清单

- [ ] 输出为 HTML 片段（非整篇文档），全部样式内联在 `style="..."` 中
- [ ] 标题不超过 3 层；段落行高 1.75、段间距统一
- [ ] 围栏代码块已全部转成图片（`--all --replace`）；正文无残留 ` ``` `；截图未删减代码；完整源码在 `images/src/`
- [ ] 行内代码仍是文字；表格渲染为 `<table>/<th>/<td>` 内联样式，无残留 Markdown 分隔行
- [ ] 提示卡四类语义正确，图标 + 标题 + 正文结构一致
- [ ] 未破坏原文代码、数据；正文无 `<a href>`（含 `#ref-N`）；参考文献 URL 以纯文本保留
- [ ] 图片已提示上传素材库；`warnings` 已转达用户
- [ ] 若生成了封面：`cover.jpg` 为 2350×1000、中文来自 HTML 叠字、无期号（除非用户要求）
- [ ] 若生成了设备 GIF：文件 < 10MB、宽度 360–540px、已提醒需上传素材库

## 9. 与 Harness / Plugin 对接

- 工具契约：`interface/tool-contract.md`
- 选项 Schema：`interface/options.schema.json`
- 插件清单示例：`interface/plugin-manifest.example.json`
- 集成与扩展设计：`docs/architecture.md`
