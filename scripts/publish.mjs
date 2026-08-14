#!/usr/bin/env node
/**
 * 把 HTML 中的本地图片上传到 GitHub 图床（经 jsDelivr 加速），
 * 生成「可发布版」与「一键复制版」HTML，直接粘贴到公众号。
 *
 * 用法:
 *   node scripts/publish.mjs <article.html> [--repo owner/repo] [--slug folder]
 *
 * 环境变量:
 *   GITHUB_TOKEN   可选；未设置时自动读取 `gh auth token`
 *   WECHAT_IMG_REPO   图床仓库，默认 endlessYoung/wechat-blog-images
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { execSync } from 'node:child_process';

const argv = process.argv.slice(2);
const input = argv[0];
let repo = process.env.WECHAT_IMG_REPO || 'endlessYoung/wechat-blog-images';
let slug = '';
let token = process.env.GITHUB_TOKEN || '';
for (let i = 1; i < argv.length; i++) {
  if (argv[i] === '--repo') repo = argv[++i];
  else if (argv[i] === '--slug') slug = argv[++i];
  else if (argv[i] === '--token') token = argv[++i];
}
if (!input) {
  console.error('用法: node scripts/publish.mjs <article.html> [--repo owner/repo] [--slug folder]');
  process.exit(1);
}
if (!token) {
  try {
    token = execSync('gh auth token', { encoding: 'utf8' }).trim();
  } catch {
    /* ignore */
  }
}
if (!token) {
  console.error('未获取到 GitHub token：请先 `gh auth login` 或设置 GITHUB_TOKEN。');
  process.exit(1);
}

const [owner, repoName] = repo.split('/');
const htmlPath = resolve(input);
const base = dirname(htmlPath);
const stem = basename(htmlPath).replace(/\.html?$/, '');
if (!slug) {
  slug = stem.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'article';
}

let html = readFileSync(htmlPath, 'utf8');
// 匹配相对路径图片（排除 data: / http(s): / 根路径）
const re = /src="((?!data:|https?:|\/\/|\/)[^"]+\.(?:png|jpe?g|webp|gif))"/gi;
const unique = [...new Set([...html.matchAll(re)].map((m) => m[1]))];

const authHeaders = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };

for (let i = 0; i < unique.length; i++) {
  const local = unique[i];
  const p = join(base, local);
  if (!existsSync(p)) {
    console.warn(`skip（文件不存在）: ${local}`);
    continue;
  }
  const ext = (local.split('.').pop() || 'png').toLowerCase();
  const name = `${String(i + 1).padStart(2, '0')}-${basename(local)}`;
  const apiPath = `${slug}/${name}`;
  const content = readFileSync(p).toString('base64');

  // 已存在则更新，否则新建
  let sha = '';
  const getRes = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/contents/${apiPath}`,
    { headers: authHeaders },
  );
  if (getRes.ok) sha = (await getRes.json()).sha;

  const body = { message: `upload ${name}`, content };
  if (sha) body.sha = sha;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/contents/${apiPath}`,
    {
      method: 'PUT',
      headers: { ...authHeaders, 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  if (res.ok) {
    const publicUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repoName}@main/${apiPath}`;
    html = html.split(`src="${local}"`).join(`src="${publicUrl}"`);
    console.log(`✓ ${local} -> ${name}`);
  } else {
    const text = await res.text();
    console.error(`✗ 上传失败 ${local}: ${res.status} ${text.slice(0, 160)}`);
  }
}

const publishPath = join(base, `${stem}-publish.html`);
writeFileSync(publishPath, html, 'utf8');

const copyPage = `<!doctype html>
<meta charset="utf-8">
<title>一键复制到公众号</title>
<style>
  body{margin:0;background:#e9e9e6;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif}
  #bar{position:sticky;top:0;z-index:10;padding:12px 16px;background:#fff;border-bottom:1px solid #e0e0e0;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.06)}
  #bar button{font-size:16px;padding:11px 28px;border:none;border-radius:6px;background:#07c160;color:#fff;cursor:pointer}
  #bar button:active{opacity:.8}
  #hint{display:inline-block;margin-left:12px;color:#576b95;font-size:14px}
  #wrap{max-width:660px;margin:20px auto;padding:0 10px}
  #content{box-shadow:0 2px 14px rgba(0,0,0,.10)}
</style>
<div id="bar"><button onclick="copyRich()">📋 一键复制到公众号</button><span id="hint"></span></div>
<div id="wrap"><div id="content">${html}</div></div>
<script>
function copyRich(){var el=document.getElementById('content');var r=document.createRange();r.selectNodeContents(el);var s=window.getSelection();s.removeAllRanges();s.addRange(r);var ok=false;try{ok=document.execCommand('copy')}catch(e){}s.removeAllRanges();document.getElementById('hint').textContent=ok?'✅ 已复制！去公众号编辑器 Ctrl+V 粘贴（图片自动加载）':'❌ 复制失败，请手动 Ctrl+A → Ctrl+C'}
</script>`;

const copyPath = join(base, `${stem}-copy.html`);
writeFileSync(copyPath, copyPage, 'utf8');

console.log(`\n生成: ${publishPath}`);
console.log(`生成: ${copyPath}`);
console.log('一键复制：双击打开 -copy.html，点按钮，粘贴到公众号编辑器。');
