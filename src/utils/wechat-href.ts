/**
 * 公众号正文只允许 mp.weixin.qq.com 的 http(s) 链接。
 * 其它域名、页内锚点（#ref-1）都必须渲染成纯文本 / 非 <a>，
 * 否则后台会提示「请勿插入非 mp.weixin.qq.com 域名的链接」。
 */
export function isWechatAllowedHref(href: string): boolean {
  const h = (href || '').trim();
  if (!h) return false;
  if (!/^https?:\/\//i.test(h)) return false;
  try {
    const host = new URL(h).hostname.toLowerCase();
    return host === 'mp.weixin.qq.com' || host.endsWith('.mp.weixin.qq.com');
  } catch {
    return false;
  }
}

/** 展示用：去掉协议与末尾斜杠。 */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}
