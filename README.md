<div align="center">

# wechat-article-workflow

**An end-to-end workflow for WeChat Official Account articles: format Markdown into paste-ready, inline-styled HTML, host images, and publish with one click.**

A composable, multi-theme typesetting skill that can be invoked by agents (DeepSeek Harness & others), by CLI, or as a library.

[中文文档](./README.zh-CN.md) · [Skill Manual](./SKILL.md) · [Architecture](./docs/architecture.md) · [Theme Guide](./docs/theme-guide.md)

![License: MIT](https://img.shields.io/badge/license-MIT-green)
![Node: >=18](https://img.shields.io/badge/node-%3E%3D18-blue)
![Zero runtime deps](https://img.shields.io/badge/dependencies-0_runtime-orange)

</div>

---

## What it solves

WeChat's editor strips `<style>` tags and external CSS, so rich content must carry **inline styles** to render correctly. This project turns plain Markdown (or a structured outline) into a self-contained HTML fragment you can paste directly into the WeChat editor — with consistent, professional typography out of the box.

It solves the **view-layer typesetting** problem (fonts, spacing, color, component visuals) — *not* content writing. It never rewrites your facts, links, or code.

## Features

- **8 core components** — H1/H2/H3, paragraphs, blockquotes, code blocks, ordered/unordered lists (incl. nesting), dividers, tables, and callout cards (`::: tip|note|warning|important`).
- **Citation module** — inline superscript `[1]` markers + a footnote-style reference list (`::: references`).
- **WeChat-safe output** — no `<style>`/external CSS; cards & code blocks wrapped in `<section>`; `white-space: pre-wrap` prevents mobile overflow.
- **Style & logic separated** — all visual rules live in a `Theme` contract; the renderer has zero hard-coded colors. Add a look = write one `Theme` object + `registerTheme()`.
- **Built-in themes** — `minimal` (clean modern) and `anthropic` (warm ivory paper, serif body — inspired by Anthropic's research pages).
- **Agent-native** — library API + CLI + SKILL.md manual + `wechat_format` tool contract, ready for DeepSeek Harness / plugins.
- **Zero runtime dependencies** — a self-contained Markdown parser, Node >= 18.

## Quick start

```bash
npm install        # install devDependencies
npm run build      # compile TS → dist/

node dist/cli.js examples/sample.md -o out.html                    # format (minimal theme)
node dist/cli.js examples/sample.md -o out.html --theme anthropic  # switch theme
node dist/cli.js --list-themes                                     # list themes
node dist/cli.js examples/sample.md --json                         # html + stats + warnings

npm test           # run the test suite
npm run demo       # regenerate examples/sample-output.html
```

### As a library

```ts
import { format, registerTheme, listThemes } from 'wechat-article-workflow';

const { html, theme, stats, warnings } = format('# Title\n\nBody…', { theme: 'anthropic' });
console.log(html); // paste-ready fragment
```

## Supported Markdown

| Component | Syntax |
| --- | --- |
| Headings | `#` `##` `###` |
| Paragraph / bold / italic / strikethrough | blank lines / `**x**` / `*x*` / `~~x~~` |
| Inline code / link / image | `` `x` `` / `[text](url)` / `![alt](url)` |
| Blockquote | `> text` |
| Code block | ```` ```lang ```` |
| Ordered / unordered lists | `1.` / `-` `*` `+` (nested via indent) |
| Divider | `---` or `***` |
| Table | GFM table (header row + separator row; column alignment + zebra striping) |
| Callout card | `::: tip\|note\|warning\|important [title]` … `:::` |
| Citation marker | `[1]` `[2]` (superscript, links to `#ref-N`) |
| References | `::: references` … `:::` (`[N]: title \| source \| date \| url`) |

See `examples/sample.md` and `examples/sample-output.html`.

## Themes

| id | name | style |
| --- | --- | --- |
| `minimal` | 极简白 | clean modern, single teal accent, 15px / 1.75 |
| `anthropic` | 暖白研究 | warm ivory paper, clay accent, sans headings + serif body |

Add a theme in minutes — see `docs/theme-guide.md`.

## Project structure

```
wechat-article-workflow/
├── SKILL.md                 # agent-facing skill manual
├── README.md / README.zh-CN.md
├── src/
│   ├── index.ts             # public API
│   ├── cli.ts               # CLI (wechat-format)
│   ├── core/                # parser / inline / renderer / format
│   ├── themes/              # types.ts / minimal.ts / anthropic.ts / registry.ts
│   └── utils/               # css / escape
├── scripts/                 # content-production utilities (screenshot / cover / embed / ocr)
├── interface/               # tool contract / options schema / plugin manifest
├── docs/                    # architecture.md / theme-guide.md
├── examples/                # sample.md + generated HTML
└── test/                    # node:test
```

## Agent & tool integration

- **Library** — `import { format } from 'wechat-article-workflow'`
- **CLI** — `wechat-format input.md -o out.html --theme minimal --json`
- **Skill manual** — an agent reads `SKILL.md` and follows the workflow
- **Tool** — `wechat_format` contract in `interface/tool-contract.md`

## Content-production workflow

The repo ships utility scripts that turn raw material into a finished, publishable article:

```bash
# 1) OCR screenshots/text material (when the model has no vision)
npm run ocr -- path/to/images/

# 2) Format the article into inline-styled HTML
node dist/cli.js article.md -o article.html --theme anthropic

# 3) Upload local images to your GitHub image host + generate a one-click copy page
npm run publish -- article.html --slug article-01
#    -> article-publish.html  (public image URLs)
#    -> article-copy.html     (one-click copy to WeChat)

# 4) WeChat cover at 2.35:1 (full procedure in SKILL.md §5)
#    Copy scripts/templates/cover.html into the article folder, edit copy, then:
npm run cover -- path/to/cover.html
#    -> cover.png / cover.jpg (upload the jpg)
```

Then open `article-copy.html`, click **“📋 一键复制到公众号”**, and paste (Ctrl+V) into the WeChat editor — images are fetched from jsDelivr automatically.

> `npm run publish` uploads images to a GitHub repo (`WECHAT_IMG_REPO`, default `endlessYoung/wechat-blog-images`) and rewrites `src` to `cdn.jsdelivr.net` URLs. It reads the token from `GITHUB_TOKEN` or `gh auth token`.
>
> Optional: `npm run embed -- article.html article-inline.html` (self-contained base64 preview), `npm run screenshot -- article-inline.html article-preview.png` (full-page long screenshot), and `npm run cover -- path/to/cover.html` (2.35:1 cover export; procedure in [SKILL.md](./SKILL.md#5-公众号封面2351)).

## Development

```bash
npm install
npm run build       # tsc
npm test            # node:test (tsx)
npm run typecheck   # tsc --noEmit
```

## Roadmap

- [x] Syntax highlighting for code blocks
- [x] Table rendering (WeChat tables need special handling)
- [ ] More built-in themes (dark, brand, etc.)
- [ ] External theme packages / hot-reload
- [ ] markdown-it / remark adapter

## License

[MIT](./LICENSE)
