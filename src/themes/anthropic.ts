import type { Theme } from './types.js';

/**
 * 主题「暖白研究（Anthropic 风）」。
 *
 * 致敬 Anthropic 研究页（teaching-claude-why）的 UI 风格：
 * - 暖白象牙底 #faf9f5、陶土强调色 #d97757（Clay）、近黑正文 #141413；
 * - 无衬线标题（近似 Styrene）+ 衬线正文（近似 Tiempos Text）；
 * - 整篇以象牙「纸张」卡片呈现，阅读列宽 640px 居中、标题居中；
 * - 脚注/引用上标用衬线 + agate 灰 #b0aea5。
 *
 * 全部使用公众号编辑器可靠支持的内联样式属性。
 */

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
const SERIF =
  'Georgia, "Times New Roman", "Songti SC", "Noto Serif SC", "Source Han Serif SC", "SimSun", serif';
const MONO = '"JetBrains Mono", "SF Mono", "SFMono-Regular", Consolas, Menlo, "Courier New", monospace';

export const anthropic: Theme = {
  id: 'anthropic',
  name: '暖白研究（Anthropic 风）',
  description: '致敬 Anthropic 研究页：暖白象牙底、陶土强调色、无衬线标题 + 衬线正文、宽留白与上标脚注。',

  base: {
    fontFamily: SANS,
    fontSize: '16px',
    lineHeight: 1.85,
    color: '#141413',
  },

  colors: {
    text: '#141413',
    heading: '#141413',
    muted: '#7c7c74',
    link: '#b25c3c',
    accent: '#d97757',
    border: '#e8e6dc',
    surface: '#f0eee6',
  },

  article: {
    backgroundColor: '#faf9f5',
    padding: '32px 20px',
    maxWidth: '640px',
    margin: '0 auto',
    borderRadius: '6px',
  },

  h1: {
    fontFamily: SANS,
    fontSize: '28px',
    fontWeight: '700',
    lineHeight: '1.3',
    color: '#141413',
    margin: '0 0 0.8em',
    textAlign: 'center',
    letterSpacing: '0.2px',
  },
  h2: {
    fontFamily: SANS,
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '1.35',
    color: '#141413',
    margin: '1.8em 0 0.6em',
    letterSpacing: '0.2px',
  },
  h3: {
    fontFamily: SANS,
    fontSize: '17px',
    fontWeight: '600',
    lineHeight: '1.4',
    color: '#141413',
    margin: '1.5em 0 0.5em',
  },

  paragraph: {
    fontFamily: SERIF,
    fontSize: '16px',
    lineHeight: '1.85',
    color: '#141413',
    margin: '0 0 1.3em',
    letterSpacing: '0.3px',
  },

  strong: { fontWeight: '700', color: '#141413' },
  em: { fontStyle: 'italic' },
  link: { color: '#b25c3c', textDecoration: 'underline' },

  inlineCode: {
    fontFamily: MONO,
    fontSize: '0.85em',
    color: '#9a4a2e',
    backgroundColor: '#f0eee6',
    padding: '2px 6px',
    borderRadius: '5px',
  },

  blockquote: {
    fontFamily: SERIF,
    fontSize: '16px',
    lineHeight: '1.75',
    color: '#44443e',
    margin: '1.5em 0',
    padding: '4px 0 4px 18px',
    borderLeft: '3px solid #d97757',
  },

  image: {
    display: 'block',
    maxWidth: '100%',
    borderRadius: '8px',
    margin: '1.4em auto',
  },

  math: {
    inline: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      color: '#141413',
    },
    block: {
      fontFamily: SERIF,
      fontStyle: 'italic',
      fontSize: '18px',
      lineHeight: '1.7',
      textAlign: 'center',
      color: '#141413',
      margin: '1.6em 0',
    },
  },

  codeBlock: {
    wrapper: {
      backgroundColor: '#f0eee6',
      border: '1px solid #e8e6dc',
      borderRadius: '8px',
      padding: '14px 16px',
      margin: '1.4em 0',
    },
    lang: {
      fontSize: '12px',
      color: '#b0aea5',
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
      color: '#141413',
    },
    code: { fontFamily: MONO, fontSize: '13px' },
  },

  syntax: {
    keyword: '#b25c3c',
    string: '#5c7a3a',
    comment: '#8a8a82',
    number: '#b0782d',
    annotation: '#a0506e',
    type: '#6a4f9e',
    function: '#2e6e8e',
  },

  list: {
    ul: {
      fontFamily: SERIF,
      margin: '0 0 1.3em',
      paddingLeft: '1.6em',
      listStyleType: 'disc',
      color: '#141413',
    },
    ol: {
      fontFamily: SERIF,
      margin: '0 0 1.3em',
      paddingLeft: '1.6em',
      listStyleType: 'decimal',
      color: '#141413',
    },
    li: {
      margin: '0.4em 0',
      lineHeight: '1.8',
      paddingLeft: '0.3em',
      fontSize: '16px',
    },
  },

  divider: {
    wrapper: { textAlign: 'center', margin: '2em 0', lineHeight: '1' },
    line: { display: 'inline-block', width: '80px', height: '1px', backgroundColor: '#e8e6dc' },
  },

  cite: {
    fontFamily: SERIF,
    fontSize: '0.72em',
    color: '#d97757',
    fontWeight: '600',
    margin: '0 1px',
    lineHeight: '1',
  },
  citeLink: { color: '#d97757', textDecoration: 'none' },

  references: {
    label: '参考文献',
    wrapper: {
      margin: '2.4em 0 0',
      padding: '18px 0 0',
      borderTop: '1px solid #e8e6dc',
    },
    title: {
      fontFamily: SANS,
      fontSize: '14px',
      fontWeight: '600',
      color: '#141413',
      margin: '0 0 12px',
      letterSpacing: '0.5px',
    },
    list: { margin: '0', paddingLeft: '0', listStyleType: 'none' },
    item: {
      margin: '0 0 10px',
      lineHeight: '1.65',
      fontSize: '13px',
      color: '#7c7c74',
      fontFamily: SERIF,
    },
    index: { color: '#b0aea5', fontSize: '0.85em', marginRight: '6px', fontWeight: '600' },
    refTitle: { color: '#141413', fontWeight: '600' },
    meta: { color: '#b0aea5' },
    link: { color: '#b25c3c', textDecoration: 'none', fontSize: '12px', wordBreak: 'break-all' },
  },

  callout: {
    tip: {
      label: '提示',
      icon: '💡',
      wrapper: {
        backgroundColor: '#f0eee6',
        borderLeft: '3px solid #d97757',
        borderRadius: '6px',
        padding: '12px 16px',
        margin: '1.4em 0',
      },
      title: { fontFamily: SANS, margin: '0 0 4px', fontWeight: '600', color: '#b25c3c', fontSize: '15px' },
      content: { fontFamily: SERIF, margin: '0', lineHeight: '1.75', color: '#141413' },
    },
    note: {
      label: '说明',
      icon: '📌',
      wrapper: {
        backgroundColor: '#f0eee6',
        borderLeft: '3px solid #7c7c74',
        borderRadius: '6px',
        padding: '12px 16px',
        margin: '1.4em 0',
      },
      title: { fontFamily: SANS, margin: '0 0 4px', fontWeight: '600', color: '#7c7c74', fontSize: '15px' },
      content: { fontFamily: SERIF, margin: '0', lineHeight: '1.75', color: '#141413' },
    },
    warning: {
      label: '注意',
      icon: '⚠️',
      wrapper: {
        backgroundColor: '#fcf6f0',
        borderLeft: '3px solid #d47f2a',
        borderRadius: '6px',
        padding: '12px 16px',
        margin: '1.4em 0',
      },
      title: { fontFamily: SANS, margin: '0 0 4px', fontWeight: '600', color: '#b5531f', fontSize: '15px' },
      content: { fontFamily: SERIF, margin: '0', lineHeight: '1.75', color: '#141413' },
    },
    important: {
      label: '重点',
      icon: '⭐',
      wrapper: {
        backgroundColor: '#f9ede9',
        borderLeft: '3px solid #b25c3c',
        borderRadius: '6px',
        padding: '12px 16px',
        margin: '1.4em 0',
      },
      title: { fontFamily: SANS, margin: '0 0 4px', fontWeight: '600', color: '#b25c3c', fontSize: '15px' },
      content: { fontFamily: SERIF, margin: '0', lineHeight: '1.75', color: '#141413' },
    },
  },
};
