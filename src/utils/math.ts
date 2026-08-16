import { escapeHtml } from './escape.js';

/**
 * 把 LaTeX 数学片段转换为公众号可用的内联 HTML。
 *
 * 公众号编辑器会剥离 <script>/<style>/外链 CSS，无法运行时渲染 KaTeX/MathJax，
 * 因此这里把常见的 LaTeX 命令转成 Unicode 数学符号，并对 \text{…} 做直立回退
 * （父容器为斜体，中文/普通文本不应被斜体）。
 *
 * 面向技术文章常见公式（箭头、等号、关系符号等），不追求完整 LaTeX 语义；
 * 未知命令回退为去掉反斜杠的字面文本，保证可读性不被破坏。
 */
export function renderMath(latex: string): string {
  let s = escapeHtml(latex);

  // \text{…} → 直立文本（中文/普通词不应斜体）
  s = s.replace(/\\text\{([^{}]*)\}/g, '<span style="font-style:normal">$1</span>');

  // 常用命令 → Unicode（按「长命令优先」顺序，避免前缀误匹配）
  const commands: Array<[RegExp, string]> = [
    [/\\longrightarrow/g, '⟶'],
    [/\\longleftarrow/g, '⟵'],
    [/\\longleftrightarrow/g, '⟷'],
    [/\\leftrightarrow/g, '↔'],
    [/\\Leftrightarrow/g, '⇔'],
    [/\\rightarrow/g, '→'],
    [/\\leftarrow/g, '←'],
    [/\\Rightarrow/g, '⇒'],
    [/\\Leftarrow/g, '⇐'],
    [/\\geq/g, '≥'],
    [/\\leq/g, '≤'],
    [/\\neq/g, '≠'],
    [/\\approx/g, '≈'],
    [/\\equiv/g, '≡'],
    [/\\times/g, '×'],
    [/\\cdot/g, '·'],
    [/\\pm/g, '±'],
    [/\\mp/g, '∓'],
    [/\\infty/g, '∞'],
    [/\\partial/g, '∂'],
    [/\\nabla/g, '∇'],
    [/\\sum/g, '∑'],
    [/\\prod/g, '∏'],
    [/\\int/g, '∫'],
    [/\\forall/g, '∀'],
    [/\\exists/g, '∃'],
    [/\\in\b/g, '∈'],
    [/\\notin/g, '∉'],
    [/\\to\b/g, '→'],
    [/\\le\b/g, '≤'],
    [/\\ge\b/g, '≥'],
    [/\\dots/g, '…'],
    [/\\ldots/g, '…'],
    [/\\qquad/g, '    '],
    [/\\quad/g, '  '],
    [/\\,|\\;|\\ |\\!/g, ' '],
  ];
  for (const [re, to] of commands) {
    s = s.replace(re, to);
  }

  // 未知命令回退：去掉反斜杠，保留字面量
  s = s.replace(/\\([a-zA-Z]+)/g, '$1');

  // 移除剩余分组花括号（\frac 等结构未实现，去括号保可读）
  s = s.replace(/[{}]/g, '');
  return s;
}
