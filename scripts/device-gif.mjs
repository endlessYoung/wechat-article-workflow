#!/usr/bin/env node
/**
 * Android 设备录屏并转为公众号可用的 GIF。
 * 依赖：adb（PATH 或 ANDROID_HOME/platform-tools）、ffmpeg（PATH 或 FFMPEG_PATH）。
 *
 * 用法:
 *   node scripts/device-gif.mjs <output.gif> [options]
 *
 * 选项:
 *   --duration <s>      录制秒数（默认 10，上限 180，screenrecord 限制）
 *   --bitrate <rate>    screenrecord 码率（默认 8000000）
 *   --width <px>        GIF 宽度（默认 480，公众号正文建议 360-540）
 *   --fps <n>           GIF 帧率（默认 15）
 *   --keep-mp4          保留中间 mp4（与 gif 同名）
 *   --serial <id>       adb 设备序列号（多设备时必填）
 *
 * 录制开始前有 1s 倒计时，方便切到目标页面；Ctrl+C 可提前结束（会正常收尾转 GIF）。
 * 产物：output.gif（palette 优化，循环播放）。
 */
import { execFileSync, execFile } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
if (!argv.length || argv[0] === '-h' || argv[0] === '--help') {
    console.log('用法: node scripts/device-gif.mjs <output.gif> [--duration 10] [--width 480] [--fps 15] [--serial <id>] [--keep-mp4]');
    process.exit(argv.length ? 0 : 1);
}

const output = resolve(argv[0]);
const opt = {};
for (let i = 1; i < argv.length; i += 2) {
    const k = argv[i]?.replace(/^--/, '');
    const v = argv[i + 1];
    if (!k || v === undefined) { console.error(`参数错误: ${argv[i]}`); process.exit(1); }
    opt[k] = v;
}
const duration = Math.min(parseInt(opt.duration || '10', 10), 180);
const width = parseInt(opt.width || '480', 10);
const fps = parseInt(opt.fps || '15', 10);
const bitrate = opt.bitrate || '8000000';

function findTool(name, envVar, extraPaths = []) {
    if (process.env[envVar] && existsSync(process.env[envVar])) return process.env[envVar];
    try { return execFileSync('where', [name], { encoding: 'utf8' }).split(/\r?\n/)[0].trim(); } catch { /* fallthrough */ }
    const hit = extraPaths.find((p) => existsSync(p));
    if (hit) return hit;
    console.error(`未找到 ${name}，请安装或设置 ${envVar} 环境变量。`);
    process.exit(1);
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const adb = findTool('adb.exe', 'ADB_PATH', [
    'D:\\Android\\sdk\\platform-tools\\adb.exe',
    join(process.env.LOCALAPPDATA || '', 'Android\\Sdk\\platform-tools\\adb.exe'),
    '/opt/homebrew/bin/adb', '/usr/local/bin/adb',
]);
const ffmpeg = findTool('ffmpeg.exe', 'FFMPEG_PATH', ['D:\\ffmpeg\\ffmpeg-master-latest-win64-gpl-shared\\bin\\ffmpeg.exe']);

const serialArgs = opt.serial ? ['-s', opt.serial] : [];
const run = (file, args, opts = {}) => execFileSync(file, args, { stdio: 'inherit', ...opts });
const remote = '/data/local/tmp/wag_device_gif.mp4';
const mp4 = output.replace(/\.gif$/i, '') + '.mp4';

// 设备检查
const devices = execFileSync(adb, [...serialArgs, 'devices'], { encoding: 'utf8' });
if (!/\tdevice\b/.test(devices)) { console.error('没有可用的 adb 设备。'); process.exit(1); }

// 倒计时
for (let s = 3; s > 0; s--) { console.log(`${s}s 后开始录制…（切到目标页面）`); await new Promise((r) => setTimeout(r, 1000)); }

// 录制：Ctrl+C 提前结束时也要完成拉取与转换
let recording;
try {
    recording = execFile(adb, [...serialArgs, 'shell', 'screenrecord', '--bit-rate', bitrate, '--time-limit', String(duration), remote]);
    await new Promise((resolveDone) => { recording.on('exit', resolveDone); });
} finally {
    try { recording?.kill(); } catch { /* 已退出 */ }
}

// 拉取 + 清理远端
run(adb, [...serialArgs, 'pull', remote.startsWith('/') ? remote.replace(/^\//, '//') : remote, mp4]);
try { run(adb, [...serialArgs, 'shell', 'rm', '-f', remote]); } catch { /* 忽略 */ }

// 两遍法生成 palette 优化的循环 GIF
const filter = `fps=${fps},scale=${width}:-1:flags=lanczos`;
const palettePng = mp4.replace(/\.mp4$/, '.palette.png');
run(ffmpeg, ['-y', '-i', mp4, '-vf', `${filter},palettegen=stats_mode=diff`, palettePng], { stdio: 'ignore' });
run(ffmpeg, ['-y', '-i', mp4, '-i', palettePng, '-lavfi', `${filter} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`, '-loop', '0', output], { stdio: 'ignore' });
unlinkSync(palettePng);
if (!opt['keep-mp4'] && existsSync(mp4)) unlinkSync(mp4);

console.log(`完成: ${output}`);
