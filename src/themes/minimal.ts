import type { Theme } from './types.js';

/**
 * 默认主题「极简白」。
 *
 * 设计取向：干净、现代、留白充足；单一强调色（青绿 #0f766e）；
 * 正文 15px / 行高 1.75；标题通过「底部细线 + 左侧强调条」建立层级。
 * 全部使用公众号编辑器可靠支持的 CSS 属性（内联样式）。
 */

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif';
const MONO =
  '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, "Courier New", monospace';

export const minimal: Theme = {
  id: 'minimal',
  name: '极简白',
  description: '干净现代的极简风格：留白充足、单一强调色、克制配色，适合技术/知识类文章。',

  base: {
    fontFamily: FONT_FAMILY,
    fontSize: '15px',
    lineHeight: 1.75,
    color: '#3b3b3b',
  },

  colors: {
    text: '#3b3b3b',
    heading: '#1a1a1a',
    muted: '#8a919b',
    link: '#0f766e',
    accent: '#0f766e',
    border: '#e7e9ee',
    surface: '#f6f7f9',
  },

  article: {},

  h1: {
    fontSize: '22px',
    fontWeight: '700',
    lineHeight: '1.4',
    color: '#1a1a1a',
    margin: '0 0 0.7em',
    paddingBottom: '0.35em',
    borderBottom: '1px solid #e7e9ee',
  },
  h2: {
    fontSize: '19px',
    fontWeight: '700',
    lineHeight: '1.45',
    color: '#1a1a1a',
    margin: '1.5em 0 0.6em',
    paddingLeft: '12px',
    borderLeft: '4px solid #0f766e',
  },
  h3: {
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '1.5',
    color: '#1a1a1a',
    margin: '1.3em 0 0.5em',
  },

  paragraph: {
    fontSize: '15px',
    lineHeight: '1.75',
    color: '#3b3b3b',
    margin: '0 0 1.1em',
    letterSpacing: '0.3px',
  },

  strong: { fontWeight: '700', color: '#1a1a1a' },
  em: { fontStyle: 'italic' },
  link: { color: '#0f766e', textDecoration: 'underline' },

  inlineCode: {
    fontFamily: MONO,
    fontSize: '0.88em',
    color: '#c0341d',
    backgroundColor: '#f2f3f5',
    padding: '2px 5px',
    borderRadius: '4px',
  },

  blockquote: {
    margin: '1.3em 0',
    padding: '0 0 0 14px',
    borderLeft: '4px solid #0f766e',
    color: '#5a6069',
    lineHeight: '1.7',
  },

  image: {
    display: 'block',
    maxWidth: '100%',
    borderRadius: '6px',
    margin: '1.2em auto',
  },

  math: {
    inline: {
      fontFamily: FONT_FAMILY,
      fontStyle: 'italic',
      color: '#3b3b3b',
    },
    block: {
      fontFamily: FONT_FAMILY,
      fontStyle: 'italic',
      fontSize: '17px',
      lineHeight: '1.7',
      textAlign: 'center',
      color: '#3b3b3b',
      margin: '1.4em 0',
    },
  },

  codeBlock: {
    wrapper: {
      backgroundColor: '#f6f8fa',
      border: '1px solid #eaecef',
      borderRadius: '8px',
      padding: '14px 16px',
      margin: '1.2em 0',
    },
    lang: {
      fontSize: '12px',
      color: '#8a919b',
      margin: '0 0 8px',
      fontFamily: MONO,
    },
    pre: {
      margin: '0',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      overflowX: 'auto',
      lineHeight: '1.6',
      fontFamily: MONO,
      fontSize: '13px',
      color: '#24292f',
    },
    code: { fontFamily: MONO, fontSize: '13px' },
  },

  syntax: {
    keyword: '#0f766e',
    string: '#2f855a',
    comment: '#8a919b',
    number: '#b45309',
    annotation: '#7c3aed',
    type: '#0e7490',
    function: '#1d4ed8',
  },

  list: {
    ul: {
      margin: '0 0 1.2em',
      paddingLeft: '1.6em',
      listStyleType: 'disc',
      color: '#3b3b3b',
    },
    ol: {
      margin: '0 0 1.2em',
      paddingLeft: '1.6em',
      listStyleType: 'decimal',
      color: '#3b3b3b',
    },
    li: {
      margin: '0.35em 0',
      lineHeight: '1.75',
      paddingLeft: '0.3em',
      fontSize: '15px',
    },
  },

  divider: {
    wrapper: { textAlign: 'center', margin: '1.8em 0', lineHeight: '1' },
    line: { display: 'inline-block', width: '72px', height: '1px', backgroundColor: '#d9dce1' },
  },

  table: {
    wrapper: { margin: '1.2em 0', overflowX: 'auto' },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px',
      lineHeight: '1.6',
      border: '1px solid #e7e9ee',
      backgroundColor: '#ffffff',
    },
    th: {
      fontWeight: '700',
      color: '#1a1a1a',
      backgroundColor: '#f6f7f9',
      padding: '10px 12px',
      borderRight: '1px solid #e7e9ee',
      borderBottom: '1px solid #e7e9ee',
      textAlign: 'left',
    },
    td: {
      color: '#3b3b3b',
      padding: '10px 12px',
      borderRight: '1px solid #e7e9ee',
      borderBottom: '1px solid #e7e9ee',
      wordBreak: 'break-word',
      verticalAlign: 'top',
    },
    stripe: { backgroundColor: '#fafbfc' },
  },

  // —— 主题引用（Citation / Reference）模块 ——
  cite: {
    fontSize: '0.75em',
    color: '#0f766e',
    fontWeight: '600',
    margin: '0 1px',
    lineHeight: '1',
  },
  citeLink: {
    color: '#0f766e',
    textDecoration: 'none',
  },
  references: {
    label: '参考文献',
    wrapper: {
      margin: '2.2em 0 0',
      padding: '16px 0 0',
      borderTop: '1px solid #e7e9ee',
    },
    title: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#1a1a1a',
      margin: '0 0 12px',
      letterSpacing: '0.5px',
    },
    list: {
      margin: '0',
      paddingLeft: '0',
      listStyleType: 'none',
    },
    item: {
      margin: '0 0 10px',
      lineHeight: '1.6',
      fontSize: '13px',
      color: '#5a6069',
    },
    index: {
      color: '#8a919b',
      fontSize: '0.85em',
      marginRight: '6px',
      fontWeight: '600',
    },
    refTitle: {
      color: '#3b3b3b',
      fontWeight: '600',
    },
    meta: {
      color: '#8a919b',
    },
    link: {
      color: '#0f766e',
      textDecoration: 'none',
      fontSize: '12px',
      wordBreak: 'break-all',
    },
  },

  callout: {
    tip: {
      label: '提示',
      icon: '💡',
      wrapper: {
        backgroundColor: '#eef7f5',
        borderLeft: '3px solid #0f766e',
        borderRadius: '6px',
        padding: '12px 16px',
        margin: '1.2em 0',
      },
      title: { margin: '0 0 4px', fontWeight: '700', color: '#0f766e', fontSize: '15px' },
      content: { margin: '0', lineHeight: '1.7', color: '#3b3b3b' },
    },
    note: {
      label: '说明',
      icon: '📌',
      wrapper: {
        backgroundColor: '#eef4ff',
        borderLeft: '3px solid #2563eb',
        borderRadius: '6px',
        padding: '12px 16px',
        margin: '1.2em 0',
      },
      title: { margin: '0 0 4px', fontWeight: '700', color: '#2563eb', fontSize: '15px' },
      content: { margin: '0', lineHeight: '1.7', color: '#3b3b3b' },
    },
    warning: {
      label: '注意',
      icon: '⚠️',
      wrapper: {
        backgroundColor: '#fef7ec',
        borderLeft: '3px solid #d97706',
        borderRadius: '6px',
        padding: '12px 16px',
        margin: '1.2em 0',
      },
      title: { margin: '0 0 4px', fontWeight: '700', color: '#d97706', fontSize: '15px' },
      content: { margin: '0', lineHeight: '1.7', color: '#3b3b3b' },
    },
    important: {
      label: '重点',
      icon: '⭐',
      wrapper: {
        backgroundColor: '#fdf0f0',
        borderLeft: '3px solid #dc2626',
        borderRadius: '6px',
        padding: '12px 16px',
        margin: '1.2em 0',
      },
      title: { margin: '0 0 4px', fontWeight: '700', color: '#dc2626', fontSize: '15px' },
      content: { margin: '0', lineHeight: '1.7', color: '#3b3b3b' },
    },
  },
};
