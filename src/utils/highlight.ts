import { escapeHtml } from './escape.js';
import type { SyntaxStyle } from '../themes/types.js';

/**
 * 把代码块内容按语言做「行内样式」语法高亮，兼容公众号（无 <style>/外链 CSS）。
 *
 * 采用单趟正则分词：注释 / 字符串 / 注解 / 关键字 / 数字 / 类型（大写标识符）/
 * 函数调用，逐 token 包一层 <span style="color:…">；不匹配的间隙做 HTML 转义后
 * 原样保留（含换行与缩进）。目前重点支持 Kotlin；其余语言回退为纯文本（仅转义）。
 */

// 组索引：1 注释、2 字符串、3 注解、4 关键字、5 数字、6 类型、7 函数
const KOTLIN_RE =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*")|(@[A-Za-z_]\w*)|(\b(?:val|var|fun|class|object|interface|data|sealed|enum|typealias|companion|override|abstract|open|final|private|protected|internal|public|init|constructor|if|else|when|for|while|do|in|is|as|return|this|super|null|true|false|import|package|by|lazy|vararg|reified|inline|suspend|tailrec|operator|infix|lateinit|where|throw|try|catch|finally|continue|break)\b)|(\b\d+(?:\.\d+)?\b)|(\b[A-Z][A-Za-z0-9_]*\b)|(\b[a-z_][A-Za-z0-9_]*(?=\s*[({]))/g;

const LANG_ALIAS: Record<string, string> = { kt: 'kotlin', kts: 'kotlin' };

export function highlightCode(code: string, lang: string, syntax: SyntaxStyle): string {
  const l = LANG_ALIAS[(lang || '').trim().toLowerCase()] ?? (lang || '').trim().toLowerCase();
  if (l !== 'kotlin') {
    return escapeHtml(code);
  }

  const re = KOTLIN_RE;
  re.lastIndex = 0;
  let out = '';
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(code))) {
    if (m.index > last) out += escapeHtml(code.slice(last, m.index));

    const text = escapeHtml(m[0]);
    let color: string | undefined;
    let italic = false;
    if (m[1]) {
      color = syntax.comment;
      italic = true;
    } else if (m[2]) {
      color = syntax.string;
    } else if (m[3]) {
      color = syntax.annotation;
    } else if (m[4]) {
      color = syntax.keyword;
    } else if (m[5]) {
      color = syntax.number;
    } else if (m[6]) {
      color = syntax.type;
    } else if (m[7]) {
      color = syntax.function;
    }

    out += color
      ? `<span style="color:${color}${italic ? ';font-style:italic' : ''}">${text}</span>`
      : text;
    last = m.index + m[0].length;
  }

  if (last < code.length) out += escapeHtml(code.slice(last));
  return out;
}
