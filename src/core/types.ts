import type { CalloutKind } from '../themes/types.js';

/** 行内 token。 */
export type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'em'; value: string }
  | { type: 'code'; value: string }
  | { type: 'del'; value: string }
  | { type: 'link'; text: string; href: string }
  | { type: 'image'; alt: string; src: string }
  | { type: 'cite'; id: string }
  | { type: 'math'; value: string; display: boolean };

/** 列表项（children 用于嵌套列表）。 */
export interface ListItem {
  text: string;
  children?: Block[];
}

/** 一条参考文献（主题引用模块的数据模型）。 */
export interface Reference {
  /** 编号（对应文内 [N] 标记） */
  id: string;
  /** 标题（必填） */
  title: string;
  /** 来源（出版物/机构名等，可选） */
  source?: string;
  /** 日期（可选） */
  date?: string;
  /** 链接（可选） */
  url?: string;
}

/** 块级 AST。 */
export type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'code'; lang: string; code: string }
  | { type: 'list'; ordered: boolean; items: ListItem[] }
  | { type: 'divider' }
  | { type: 'math'; value: string; display: boolean }
  | { type: 'callout'; kind: CalloutKind; title?: string; content: string }
  | { type: 'references'; entries: Reference[] };
