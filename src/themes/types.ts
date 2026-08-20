/**
 * 主题系统类型契约。
 *
 * 这是「样式规则与组件逻辑分离」的核心接口：渲染器只关心组件结构，
 * 所有视觉规则（颜色/字号/间距）都由 Theme 提供。
 * 新增一套视觉风格 = 实现一个 Theme 对象并 registerTheme()。
 */

/** CSS 样式对象：camelCase 键，值可为字符串或数字（如 lineHeight: 1.75）。 */
export type Style = Record<string, string | number | undefined>;

/** 提示卡种类。 */
export type CalloutKind = 'tip' | 'note' | 'warning' | 'important';

/** 提示卡（重点卡片/提示模块）的样式组。 */
export interface CalloutStyle {
  /** 卡片容器（section） */
  wrapper: Style;
  /** 标题行（含图标） */
  title: Style;
  /** 正文 */
  content: Style;
  /** 缺省标题文字（未显式给定标题时使用） */
  label: string;
  /** 图标（emoji，可为空字符串表示不用图标） */
  icon: string;
}

/** 代码块样式组。 */
export interface CodeBlockStyle {
  /** 外层容器（section） */
  wrapper: Style;
  /** 语言标签（可选行） */
  lang: Style;
  /** pre 元素 */
  pre: Style;
  /** code 元素 */
  code: Style;
}

/** 代码块语法高亮的 token 颜色（内联样式，公众号兼容）。 */
export interface SyntaxStyle {
  keyword: string;
  string: string;
  comment: string;
  number: string;
  annotation: string;
  type: string;
  function: string;
}

/** 表格样式组（GFM 表格 → 内联样式 <table>）。 */
export interface TableStyle {
  /** 外层容器（section，供横向滚动与间距） */
  wrapper: Style;
  /** <table> 元素 */
  table: Style;
  /** 表头单元格（th） */
  th: Style;
  /** 正文单元格（td） */
  td: Style;
  /** 斑马纹：偶数行单元格背景（公众号不支持 :nth-child，渲染时直接内联到单元格） */
  stripe: Style;
}

/** 主题引用（Citation / Reference）模块的样式组。 */
export interface ReferencesStyle {
  /** 引用区容器（section，顶部细线分隔） */
  wrapper: Style;
  /** 区标题（如「参考文献」） */
  title: Style;
  /** 区标题文字 */
  label: string;
  /** 条目列表（ol） */
  list: Style;
  /** 单条引用（li） */
  item: Style;
  /** 条目序号（上标数字） */
  index: Style;
  /** 引用标题 */
  refTitle: Style;
  /** 来源/日期元信息 */
  meta: Style;
  /** 来源链接 */
  link: Style;
}

export interface Theme {
  /** 主题唯一 id（CLI --theme 使用） */
  id: string;
  /** 人类可读名称 */
  name: string;
  /** 一句话说明 */
  description: string;

  /** 全局基准（供主题作者与未来自动化派生使用） */
  base: {
    fontFamily: string;
    fontSize: string;
    lineHeight: number;
    color: string;
  };

  /** 色彩令牌 */
  colors: {
    text: string;
    heading: string;
    muted: string;
    link: string;
    accent: string;
    border: string;
    surface: string;
  };

  /** 整篇正文的包裹容器样式（如暖白纸张底）；空对象表示不包裹 */
  article: Style;

  // —— 组件样式 ——
  h1: Style;
  h2: Style;
  h3: Style;
  paragraph: Style;
  strong: Style;
  em: Style;
  link: Style;
  inlineCode: Style;
  blockquote: Style;
  image: Style;
  /** 数学公式（行内 $...$ 与块级 $$...$$） */
  math: { inline: Style; block: Style };
  codeBlock: CodeBlockStyle;
  /** 代码块语法高亮配色 */
  syntax: SyntaxStyle;
  list: { ul: Style; ol: Style; li: Style };
  divider: { wrapper: Style; line: Style };
  table: TableStyle;
  callout: Record<CalloutKind, CalloutStyle>;
  /** 文内引用标记（sup） */
  cite: Style;
  /** 文内引用标记内的锚点链接 */
  citeLink: Style;
  /** 文末参考来源列表 */
  references: ReferencesStyle;
}
