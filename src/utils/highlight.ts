import { escapeHtml } from './escape.js';
import type { SyntaxStyle } from '../themes/types.js';

/**
 * 把代码块内容按语言做「行内样式」语法高亮，兼容公众号（无 <style>/外链 CSS）。
 *
 * 采用单趟正则分词：注释 / 字符串 / 注解 / 关键字 / 数字 / 类型（大写标识符）/
 * 函数调用，逐 token 包一层 <span style="color:…">；不匹配的间隙做 HTML 转义后
 * 原样保留（含换行与缩进）。
 *
 * 支持 Kotlin 与 XML（含 html 别名）。XML 的 `<!-- -->` 必须转义成 `&lt;!-- --&gt;`，
 * 否则截图页/公众号会把注释当成真正的 HTML 注释吃掉。
 */

// 组索引：1 注释、2 字符串、3 注解、4 关键字、5 数字、6 类型、7 函数
const KOTLIN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*")|(@[A-Za-z_]\w*)|(\b(?:val|var|fun|class|object|interface|data|sealed|enum|typealias|companion|override|abstract|open|final|private|protected|internal|public|init|constructor|if|else|when|for|while|do|in|is|as|return|this|super|null|true|false|import|package|by|lazy|vararg|reified|inline|suspend|tailrec|operator|infix|lateinit|where|throw|try|catch|finally|continue|break)\b)|(\b\d+(?:\.\d+)?\b)|(\b[A-Z][A-Za-z0-9_]*\b)|(\b[a-z_][A-Za-z0-9_]*(?=\s*[({]))/g;

// 组索引：1 注释、2 字符串、3 开标签括号、4 标签名（按关键词着色）、5 标签结束符、6 属性名
const XML_RE =
  /(<!--[\s\S]*?-->)|("(?:[^"]*)")|(<\/?)([A-Za-z_][\w:.-]*)|(\/?>)|([A-Za-z_:][\w:.-]*(?=\s*=))/g;

const LANG_ALIAS: Record<string, string> = { kt: 'kotlin', kts: 'kotlin', html: 'xml' };

function colorSpan(text: string, color: string | undefined, italic = false): string {
  const t = escapeHtml(text);
  if (!color) return t;
  return `<span style="color:${color}${italic ? ';font-style:italic' : ''}">${t}</span>`;
}

function highlightByRegex(
  code: string,
  re: RegExp,
  paint: (m: RegExpExecArray) => { color?: string; italic?: boolean; html?: string },
): string {
  re.lastIndex = 0;
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m.index > last) out += escapeHtml(code.slice(last, m.index));
    const painted = paint(m);
    out += painted.html ?? colorSpan(m[0], painted.color, painted.italic);
    last = m.index + m[0].length;
  }
  if (last < code.length) out += escapeHtml(code.slice(last));
  return out;
}

export function highlightCode(code: string, lang: string, syntax: SyntaxStyle): string {
  const l = LANG_ALIAS[(lang || '').trim().toLowerCase()] ?? (lang || '').trim().toLowerCase();
  if (l === 'xml') {
    return highlightByRegex(code, XML_RE, (m) => {
      if (m[1]) return { color: syntax.comment, italic: true };
      if (m[2]) return { color: syntax.string };
      if (m[3] && m[4]) return { html: escapeHtml(m[3]) + colorSpan(m[4], syntax.keyword) };
      if (m[6]) return { color: syntax.function };
      return {};
    });
  }
  if (l !== 'kotlin') {
    return escapeHtml(code);
  }

  return highlightByRegex(code, KOTLIN_RE, (m) => {
    if (m[1]) return { color: syntax.comment, italic: true };
    if (m[2]) return { color: syntax.string };
    if (m[3]) return { color: syntax.annotation };
    if (m[4]) return { color: syntax.keyword };
    if (m[5]) return { color: syntax.number };
    if (m[6]) return { color: syntax.type };
    if (m[7]) return { color: syntax.function };
    return {};
  });
}
