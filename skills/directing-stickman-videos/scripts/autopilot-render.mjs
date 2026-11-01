import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createCanvas, loadImage, GlobalFonts} from '@napi-rs/canvas';
import {ROOT, FFMPEG, sha, hashFile, save, probe, run, mediaPath, fontPaths, outputDir, designPlane, loadProject} from './autopilot-core.mjs';

const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export function keyState(l, t) {
  const out = {...l};
  for (const prop of ['x', 'y', 'w', 'angle', 'alpha', 'progress']) {
    const keys = (l.keys || []).filter(k => k[prop] !== undefined);
    if (!keys.length) continue;
    if (t <= keys[0].t) out[prop] = keys[0][prop];
    else if (t >= keys.at(-1).t) out[prop] = keys.at(-1)[prop];
    else { const i = keys.findIndex(k => k.t > t), a = keys[i - 1], b = keys[i]; out[prop] = a[prop] + (b[prop] - a[prop]) * ease((t - a.t) / (b.t - a.t)); }
  }
  return out;
}
function wrap(ctx, text, maxWidth) {
  const parts = /\s/.test(text) ? text.split(/\s+/) : [...text];
  const separator = /\s/.test(text) ? ' ' : '';
  const lines = []; let line = '';
  for (const part of parts) {
    const next = line ? line + separator + part : part;
    if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = part; }
    else line = next;
    if (ctx.measureText(line).width > maxWidth) throw new Error('Text token too wide; shorten it or reduce size');
  }
  if (line) lines.push(line);
  return lines;
}
export async function painter(p) {
  const fonts = fontPaths(p);
  const plane = designPlane(p), captionBand = plane.height - 110;
  if (!GlobalFonts.registerFromPath(fonts.hand, 'B1Hand') || !GlobalFonts.registerFromPath(fonts.caption, 'B1Caption')) throw new Error('Font registration failed');
  const canvas = createCanvas(p.width, p.height), ctx = canvas.getContext('2d');
  const images = new Map();
  for (const s of p.shots) for (const l of s.layers) if (['image', 'pose'].includes(l.type)) {
    const f = mediaPath(p.base, l.type === 'pose' ? '@b1/character-pose-sheet-v6.png' : l.path);
    if (!images.has(f)) images.set(f, await loadImage(f));
  }
  function stroke(points, width, color, progress = 1) {
    const lengths = points.slice(1).map((pt, i) => Math.hypot(pt[0] - points[i][0], pt[1] - points[i][1]));
    let left = lengths.reduce((a, b) => a + b, 0) * clamp(progress);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(...points[0]);
    for (let i = 0; i < lengths.length && left > 0; i++) { const f = Math.min(1, left / Math.max(0.001, lengths[i])); ctx.lineTo(points[i][0] + (points[i + 1][0] - points[i][0]) * f, points[i][1] + (points[i + 1][1] - points[i][1]) * f); left -= lengths[i]; }
    ctx.stroke();
  }
  return function frame(t) {
    ctx.resetTransform(); ctx.clearRect(0, 0, p.width, p.height); ctx.scale(p.width / plane.width, p.width / plane.width);
    ctx.fillStyle = p.style === 'B2' ? '#f4f0e5' : '#FDFDFC'; ctx.fillRect(0, 0, plane.width, plane.height);
    if (p.style === 'B1' && p.grid !== false) {
      ctx.beginPath(); ctx.strokeStyle = 'rgba(76,90,105,.036)'; ctx.lineWidth = 0.8;
      for (let x = 32.5; x < plane.width; x += 64) { ctx.moveTo(x, 0); ctx.lineTo(x, captionBand - 1); }
      for (let y = 16.5; y < captionBand; y += 64) { ctx.moveTo(0, y); ctx.lineTo(plane.width, y); } ctx.stroke();
    }
    const shot = p.shots.find(s => t >= s.start && t < s.end) || p.shots.at(-1);
    for (const layer of shot.layers) {
      const dt = t - shot.start;
      if (dt < (layer.from || 0) || dt >= (layer.to ?? Infinity)) continue;
      const l = keyState(layer, dt), x = l.x || 0, y = l.y || 0, w = l.w || 200;
      ctx.save(); ctx.globalAlpha = clamp(l.alpha ?? 1); ctx.translate(x, y); ctx.rotate(l.angle || 0);
      if (l.type === 'image') {
        const img = images.get(mediaPath(p.base, l.path)), h = l.h || w * img.height / img.width;
        const scale = Math.min(w / img.width, h / img.height);
        ctx.drawImage(img, (w - img.width * scale) / 2, (h - img.height * scale) / 2, img.width * scale, img.height * scale);
      } else if (l.type === 'pose') {
        const img = images.get(mediaPath(p.base, '@b1/character-pose-sheet-v6.png')), sw = img.width / 3;
        ctx.drawImage(img, l.pose * sw, 0, sw, img.height, 0, 0, w, w * img.height / sw);
      } else if (l.type === 'text') {
        const size = l.size || 52; ctx.font = `${l.bold ? 700 : 400} ${size}px B1Hand`; ctx.fillStyle = l.color || '#191916'; ctx.textBaseline = 'top';
        const lines = wrap(ctx, l.text, l.w || 1080 - x);
        lines.forEach((s, i) => ctx.fillText(s, 0, i * size * 1.15));
      } else {
        let points = l.points;
        if (l.type === 'underline') points = [[0, 1], [w * 0.25, -1], [w * 0.55, 2], [w, -2]];
        if (l.type === 'arrow') points = Array.from({length: 30}, (_, i) => [w * i / 29, -26 * Math.sin(i / 29 * Math.PI)]);
        stroke(points, l.lineWidth || (l.type === 'underline' ? 6 : 3), l.color || '#191916', l.progress ?? 1);
        if (l.type === 'arrow' && (l.progress ?? 1) > 0.95) stroke([[w - 17, -12], [w, 0], [w - 19, 12]], 3, l.color || '#191916');
      }
      ctx.restore();
    }
    const cue = p.captions.find(c => t >= c.start && t < c.end);
    if (cue) {
      ctx.font = `${p.style === 'B2' ? 500 : 600} ${p.captionSize || (p.style === 'B2' ? 40 : 34)}px B1Caption`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lines = wrap(ctx, cue.text, 1120);
      if (lines.length > 2) throw new Error('Caption exceeds two lines; split the timed cue');
      const cy = plane.height - (lines.length === 1 ? 60 : 82);
      if (p.style === 'B2') {
        const width = Math.max(...lines.map(s => ctx.measureText(s).width));
        ctx.fillStyle = 'rgba(249,246,235,.94)'; ctx.beginPath(); ctx.roundRect(640 - width / 2 - 22, cy - 33, width + 44, 66 + (lines.length - 1) * 43, 9); ctx.fill();
        lines.forEach((s, i) => { ctx.fillStyle = '#38382f'; ctx.fillText(s, 640, cy + i * 43); });
      } else lines.forEach((s, i) => { const y = cy + i * 43; ctx.strokeStyle = '#FDFDFC'; ctx.lineWidth = 7; ctx.strokeText(s, 640, y); ctx.fillStyle = '#20231F'; ctx.fillText(s, 640, y); });
      ctx.textAlign = 'left';
    }
    return canvas;
  };
}
async function encode(p, frame, start, frames, target) {
  const child = spawn(FFMPEG, ['-v', 'error', '-y', '-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', `${p.width}x${p.height}`, '-framerate', String(p.fps), '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-pix_fmt', 'yuv420p', target], {stdio: ['pipe', 'ignore', 'pipe']});
  let error = ''; child.stderr.on('data', b => { error = (error + b).slice(-2400); });
  child.stdin.on('error', () => {});
  const completion = new Promise((resolve, reject) => { child.on('error', reject); child.on('close', code => code === 0 ? resolve() : reject(new Error(`Encode failed: ${error}`))); });
  completion.catch(() => {});
  try {
    for (let i = 0; i < frames; i++) { const data = frame((start + i) / p.fps).data(); if (!child.stdin.write(data)) await Promise.race([once(child.stdin, 'drain'), completion.then(() => { throw new Error('Encoder closed early'); })]); }
    child.stdin.end(); await completion;
  } catch (e) { child.kill(); await completion.catch(() => {}); throw e; }
}
function makeSfx(p, file, duration) {
  const rate = 48000, n = Math.ceil(duration * rate), samples = new Float32Array(n);
  let seed = 8731; const noise = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
  for (const s of p.sfx || []) {
    const len = s.kind === 'jingle' ? 0.52 : s.kind === 'chime' ? 0.55 : s.kind === 'paper' ? 0.22 : 0.12;
    for (let i = 0; i < len * rate; i++) {
      const index = Math.round(s.time * rate) + i; if (index >= n) break;
      const t = i / rate, env = Math.exp(-t * (s.kind === 'chime' ? 8 : 25));
      let value = s.kind === 'paper' ? noise() : s.kind === 'tap' ? noise() * 0.6 + Math.sin(t * 2 * Math.PI * 170) * 0.4 : Math.sin(2 * Math.PI * (s.kind === 'chime' ? 880 : 500 - 900 * t) * t);
      if (s.kind === 'jingle') {
        // Three irregular metallic contacts: an original key-ring Foley accent.
        value = 0;
        for (const [delay, f] of [[0, 2460], [0.085, 3110], [0.21, 2080]]) {
          const q = t - delay;
          if (q >= 0) value += (Math.sin(2 * Math.PI * f * q) * 0.55 + Math.sin(2 * Math.PI * f * 1.73 * q) * 0.25 + Math.sin(2 * Math.PI * f * 2.31 * q) * 0.12) * Math.exp(-q * 18);
        }
      }
      samples[index] += value * (s.kind === 'jingle' ? 1 : env) * s.gain;
    }
  }
  const bytes = Buffer.alloc(44 + n * 2); bytes.write('RIFF'); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8); bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22); bytes.writeUInt32LE(rate, 24); bytes.writeUInt32LE(rate * 2, 28); bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34); bytes.write('data', 36); bytes.writeUInt32LE(n * 2, 40);
  samples.forEach((s, i) => bytes.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), 44 + i * 2)); fs.writeFileSync(file, bytes);
}
function stamp(seconds, vtt = false) {
  const ms = Math.round(seconds * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}${vtt ? '.' : ','}${String(ms % 1000).padStart(3, '0')}`;
}
export async function render(p, {full = false, seconds = 20, replace = false} = {}) {
  // A preview never loads media or paints frames belonging only to the unfinished tail.
  if (!full) p = loadProject(p.file, {seconds});
  const out = outputDir(p), lock = path.join(out, 'render.lock');
  if (fs.existsSync(lock)) {
    const prior = JSON.parse(fs.readFileSync(lock, 'utf8'));
    try { process.kill(prior.pid, 0); throw new Error('Another renderer is running'); }
    catch (e) { if (e.code !== 'ESRCH') throw e; fs.unlinkSync(lock); }
  }
  const fd = fs.openSync(lock, 'wx'); fs.writeFileSync(fd, JSON.stringify({pid: process.pid})); fs.closeSync(fd);
  const kind = full ? 'film' : 'preview', target = path.join(out, `${kind}.mp4`), reportPath = path.join(out, `${kind}-report.json`);
  const duration = Math.min(p.duration, full ? p.duration : seconds), count = Math.ceil(duration * p.fps - 1e-6);
  const done = value => save(path.join(out, 'checkpoint.json'), {stage: value, kind, fingerprint: p.fingerprint, pid: process.pid, updated_at: new Date().toISOString()});
  try {
    if (fs.existsSync(target) && !replace) {
      if (fs.existsSync(reportPath)) { const previous = JSON.parse(fs.readFileSync(reportPath)); if (previous.fingerprint === p.fingerprint && previous.frames === count && previous.output_sha256 === hashFile(target)) return {...previous, reused: true}; }
      throw new Error('Output exists with different/unverified contents; pass --replace to replace renderer-owned output');
    }
    const cache = path.join(out, 'cache'); fs.mkdirSync(cache, {recursive: true});
    const frame = await painter(p), clips = []; let reused = 0;
    const rendererHash = hashFile(path.join(ROOT, 'scripts/autopilot-render.mjs'));
    for (const [i, shot] of p.shots.entries()) {
      const first = Math.round(shot.start * p.fps), last = Math.min(count, i === p.shots.length - 1 ? count : Math.round(shot.end * p.fps)); if (last <= first) continue;
      const files = new Set(Object.values(fontPaths(p)));
      for (const layer of shot.layers) {
        if (layer.type === 'image') files.add(mediaPath(p.base, layer.path));
        if (layer.type === 'pose') files.add(mediaPath(p.base, '@b1/character-pose-sheet-v6.png'));
      }
      const key = sha(JSON.stringify({shot, first, last, style: p.style, width: p.width, height: p.height, fps: p.fps, captions: p.captions.filter(c => c.end > first / p.fps && c.start < last / p.fps), captionSize: p.captionSize, grid: p.grid, inputs: p.inputs.filter(f => files.has(f.path)), rendererHash}));
      const clip = path.join(cache, `${key}.mp4`); let valid = false;
      if (fs.existsSync(clip)) try { const info = probe(clip); valid = Number(info.streams[0].nb_frames) === last - first; } catch {}
      if (valid) reused++; else { done(`rendering shot ${i + 1}/${p.shots.length}`); const tmp = path.join(cache, `${key}.partial.mp4`); await encode(p, frame, first, last - first, tmp); fs.renameSync(tmp, clip); }
      clips.push(clip); process.stdout.write(JSON.stringify({shot: i + 1, total: p.shots.length, cache_hit: valid}) + '\n');
    }
    done('assembling original-speed voice, captions and SFX');
    const list = path.join(cache, 'concat.txt'); fs.writeFileSync(list, clips.map(f => `file '${path.basename(f)}'`).join('\n') + '\n');
    const args = ['-v', 'error', '-y', '-f', 'concat', '-safe', '1', '-i', list, '-i', p.voicePath];
    const filters = [`[1:a]adelay=${Math.round(p.lead * 1000)}:all=1,apad,atrim=0:${count / p.fps}[voice]`], mixes = ['[voice]']; let idx = 2;
    if (p.sfx?.length) { const f = path.join(cache, 'sfx.wav'); makeSfx(p, f, count / p.fps); args.push('-i', f); mixes.push(`[${idx++}:a]`); }
    if (p.music) { args.push('-stream_loop', '-1', '-i', mediaPath(p.base, p.music.path)); filters.push(`[${idx++}:a]volume=${p.music.gain}[music]`); mixes.push('[music]'); }
    filters.push(`${mixes.join('')}amix=inputs=${mixes.length}:normalize=0:duration=first,alimiter=limit=0.97:level=false:latency=true[a]`);
    const partial = path.join(out, `${kind}.partial.mp4`);
    args.push('-filter_complex', filters.join(';'), '-map', '0:v:0', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(count / p.fps), '-movflags', '+faststart', partial);
    run(FFMPEG, args); run(FFMPEG, ['-v', 'error', '-i', partial, '-f', 'null', '-']); fs.renameSync(partial, target);
    const cues = p.captions.filter(c => c.start < duration).map(c => ({...c, end: Math.min(c.end, duration)}));
    fs.writeFileSync(path.join(out, `${kind}.srt`), cues.map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`).join('\n'));
    fs.writeFileSync(path.join(out, `${kind}.vtt`), 'WEBVTT\n\n' + cues.map(c => `${stamp(c.start, true)} --> ${stamp(c.end, true)}\n${c.text}\n`).join('\n'));
    const sheet = createCanvas(960, 540), sc = sheet.getContext('2d');
    for (let i = 0; i < 9; i++) sc.drawImage(frame(Math.min(duration - 1 / p.fps, (i + 0.5) * duration / 9)), (i % 3) * 320, Math.floor(i / 3) * 180, 320, 180);
    fs.writeFileSync(path.join(out, `${kind}-contact-sheet.png`), sheet.toBuffer('image/png'));
    const info = probe(target), report = {fingerprint: p.fingerprint, preview_seconds: full ? null : duration, output: target, output_sha256: hashFile(target), original_voice_sha256: hashFile(p.voicePath), original_voice_duration: p.voiceDuration, voice_rate: 'unchanged; leading/trailing padding only', frames: count, duration: Number(info.format.duration), cache_hits: reused, shot_count: clips.length, full_decode: 'pass', caption_count: cues.length, human_review: 'required; technical checks are not acceptance', inputs: p.inputs};
    save(reportPath, report); done('complete'); return report;
  } catch (e) { done(`failed: ${e.message}`); throw e; }
  finally { fs.unlinkSync(lock); }
}
