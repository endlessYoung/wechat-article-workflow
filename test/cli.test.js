import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const cli = join(root, 'bin', 'wechat-format.js');
const run = (args) =>
  execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

test('cli: 排版文件输出文本', () => {
  const out = run([join(root, 'examples', 'input.md')]);
  assert.ok(out.includes('你有没有过这样的时刻：'));
  assert.ok(out.includes('每天进步 1%'));
});

test('cli: --json 输出结构化结果', () => {
  const out = run(['--json', join(root, 'examples', 'input.md')]);
  const parsed = JSON.parse(out);
  assert.equal(typeof parsed.text, 'string');
  assert.ok(Array.isArray(parsed.warnings));
  assert.equal(parsed.stats.headings.h1, 1);
});

test('cli: -o 写入文件', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wcf-'));
  try {
    const outFile = join(dir, 'out.md');
    run(['-o', outFile, join(root, 'examples', 'input.md')]);
    const content = readFileSync(outFile, 'utf8');
    assert.ok(content.includes('01 | 习惯的复利效应'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('cli: --check 在有警告时退出码非 0', () => {
  const dir = mkdtempSync(join(tmpdir(), 'wcf-'));
  try {
    const bad = join(dir, 'bad.md');
    writeFileSync(bad, '## 甲\n\n## 乙', 'utf8');
    let exited = false;
    try {
      run(['--check', bad]);
    } catch (err) {
      exited = err.status !== 0;
    }
    assert.equal(exited, true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('cli: 选项透传（--number-headings）', () => {
  const out = run(['--number-headings', join(root, 'examples', 'input.md')]);
  assert.ok(out.includes('## 01 | 习惯的复利效应'));
});
