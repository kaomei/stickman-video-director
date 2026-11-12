import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {ROOT, FFMPEG, FFPROBE, hashFile, save} from './autopilot-core.mjs';
import {B4_HOOK} from './b4-opening.mjs';

function execute(exe, args, label) {
  return new Promise((resolve, reject) => {
    const grouped = process.platform !== 'win32';
    const child = spawn(exe, args, {detached: grouped, stdio: ['ignore', 'pipe', 'ignore']});
    let output = '', failure;
    const terminate = () => {
      if (!child.pid) return;
      if (grouped) {
        try { process.kill(-child.pid, 'SIGKILL'); }
        catch (e) { if (e.code !== 'ESRCH') { failure = `cleanup ${e.code}`; child.kill('SIGKILL'); } }
      } else {
        spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {stdio: 'ignore', timeout: 5000, killSignal: 'SIGKILL'});
        child.kill('SIGKILL');
      }
    };
    const timer = setTimeout(() => { failure = 'ETIMEDOUT'; terminate(); }, 30000);
    child.stdout?.on('data', chunk => {
      output += chunk;
      if (output.length > 1024 * 1024) { failure = 'output limit'; terminate(); }
    });
    child.on('error', e => { failure = e.code; });
    child.on('close', code => {
      clearTimeout(timer);
      if (failure || code !== 0) terminate();
      // Wait for process/stdio closure; never echo arbitrary executable output.
      if (failure || code !== 0) reject(Error(`${label} failed (${failure ?? code})`));
      else resolve(output);
    });
  });
}
function optionalFeatures() {
  const script = `import importlib.util, json, sys
def installed(name):
    return importlib.util.find_spec(name) is not None
try:
    from PIL import Image, ImageDraw, ImageFont
    pillow = True
except Exception:
    pillow = False
print(json.dumps(dict(version=sys.version.split()[0], major=sys.version_info.major, pillow=pillow, whisper=installed('whisper'), torch=installed('torch'))))`;
  let python;
  for (const exe of process.env.AUTOPILOT_PYTHON ? [process.env.AUTOPILOT_PYTHON] : ['python3', 'python']) {
    const result = spawnSync(exe, ['-c', script], {encoding: 'utf8', timeout: 5000, killSignal: 'SIGKILL', maxBuffer: 16384});
    if (result.error || result.status !== 0) continue;
    try { const data = JSON.parse(result.stdout); if (data.major === 3) { python = data; break; } } catch {}
  }
  const model = path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache'), 'whisper/base.pt');
  return {
    python: {available: Boolean(python), ...(python ? {version: python.version} : {})},
    pillow: {available: python?.pillow === true},
    whisper: {installed: python?.whisper === true, torch_installed: python?.torch === true, base_model_cached: fs.existsSync(model) && fs.statSync(model).isFile()},
  };
}
async function smoke() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stickman-doctor-'));
  try {
    await execute(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=310:duration=1', '-y', path.join(dir, 'voice.wav')], 'Diagnostic audio');
    const project = path.join(dir, 'project.json');
    save(project, {version: 1, style: 'B1', width: 640, height: 360, fps: 12,
      voice: {path: 'voice.wav'}, captions: [{start: .1, end: .9, text: 'Offline check.'}],
      shots: [{start: 0, end: 1, layers: [
        {type: 'text', text: 'OFFLINE CHECK', x: 80, y: 110, size: 54},
        {type: 'image', path: '@b1/idea-bulb-crayon.png', x: 400, y: 270, w: 180, keys: [{t: 0, x: 400}, {t: .8, x: 460}]},
      ]}], ambience: [{path: 'voice.wav', start: 0, end: 1, gain: .01}], sfx: [{time: .25, kind: 'tap', gain: .02}],
    });
    await execute(process.execPath, [path.join(ROOT, 'scripts/autopilot.mjs'), 'preview', project, '--seconds', '1'], 'Diagnostic render');
    const output = path.join(dir, 'output'), report = JSON.parse(fs.readFileSync(path.join(output, 'preview-report.json'), 'utf8'));
    const media = JSON.parse(await execute(FFPROBE, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', path.join(output, 'preview.mp4')], 'Diagnostic probe'));
    const video = media.streams.find(s => s.codec_type === 'video'), audio = media.streams.find(s => s.codec_type === 'audio');
    if (video?.codec_name !== 'h264' || audio?.codec_name !== 'aac' || video.width !== 640 || video.height !== 360 || report.full_decode !== 'pass') throw Error('Diagnostic media verification failed');
    for (const ext of ['srt', 'vtt']) if (!fs.readFileSync(path.join(output, `preview.${ext}`), 'utf8').includes('Offline check.')) throw Error('Diagnostic subtitles failed');
    return {status: 'ready', scope: 'B1 local diagnostic only; not style acceptance, speech alignment or external generation', duration: Number(media.format.duration), video_codec: video.codec_name, audio_codec: audio.codec_name, subtitles: ['srt', 'vtt'], full_decode: 'pass'};
  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
}

export async function doctor({runSmoke = false} = {}) {
  const checks = {node: Number(process.versions.node.split('.')[0]) >= 20};
  for (const [name, exe] of [['ffmpeg', FFMPEG], ['ffprobe', FFPROBE]]) try { await execute(exe, ['-version'], name); checks[name] = true; } catch { checks[name] = false; }
  try { await import('@napi-rs/canvas'); checks.canvas = true; } catch { checks.canvas = false; }
  try { await import('sharp'); checks.sharp = true; } catch { checks.sharp = false; }
  checks.fonts = ['Caveat.ttf', 'NotoSans.ttf', 'Nunito.ttf'].every(f => { const file = path.join(ROOT, 'assets/fonts', f); return fs.existsSync(file) && fs.statSync(file).size > 10000; });
  const hook = path.join(ROOT, 'assets/fonts/Nunito.ttf');
  checks.b4_hook_font = fs.existsSync(hook) && hashFile(hook) === B4_HOOK.font_sha256;
  const optional = optionalFeatures(), local = {status: Object.values(checks).every(Boolean) ? 'not_checked' : 'blocked'};
  if (runSmoke) {
    checks.local_smoke = false;
    if (local.status !== 'blocked') try { Object.assign(local, await smoke()); checks.local_smoke = true; }
    catch (e) { Object.assign(local, {status: 'failed', error: e.message}); }
  }
  return {checks, optional, capabilities: {
    local_composition: local,
    a6_finishing: {status: optional.python.available && optional.pillow.available ? 'not_verified' : 'missing', note: 'Requires Python/Pillow, project-specific fonts and synchronized media; run the A6 finishing preflight'},
    local_alignment: {status: optional.whisper.installed && optional.whisper.torch_installed && optional.whisper.base_model_cached ? 'not_verified' : 'missing', note: 'Module/model presence does not verify alignment; no import of Whisper/PyTorch or model download performed'},
    image_generation: {status: 'not_verified', note: 'Inspect actual host tools and the selected service'},
    narration: {status: 'not_verified', note: 'Verify the selected provider/model/voice and access'},
    caption_alignment: {status: 'not_verified', note: 'Verify actual TTS word timestamps, supplied alignment or a selected aligner'},
  }, gemini_key_present: Boolean(process.env.GEMINI_API_KEY), network_checked: false, note: 'Key presence is not quota/billing verification'};
}
