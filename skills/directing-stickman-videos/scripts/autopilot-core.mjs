import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FFMPEG = process.env.FFMPEG || 'ffmpeg';
export const FFPROBE = process.env.FFPROBE || 'ffprobe';
export const sha = value => crypto.createHash('sha256').update(value).digest('hex');
export const hashFile = file => sha(fs.readFileSync(file));
export const json = file => JSON.parse(fs.readFileSync(file, 'utf8'));
export function save(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(tmp, file);
}
export function run(exe, args) {
  const result = spawnSync(exe, args, {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
  if (result.error || result.status !== 0) throw new Error(`${path.basename(exe)} failed: ${result.error?.message || result.stderr?.slice(-2400)}`);
  return result.stdout;
}
export function probe(file) {
  return JSON.parse(run(FFPROBE, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file]));
}
export function mediaPath(base, file) {
  if (typeof file !== 'string' || !file || /^(?:[a-z]+:|\/\/)/i.test(file.replace(/^[A-Z]:[\\/]/i, ''))) throw new Error('Media must be a local path');
  const bundled = file.startsWith('@b1/');
  const target = bundled ? path.resolve(ROOT, 'assets/b1', file.slice(4)) : path.resolve(base, file);
  if (bundled && !target.startsWith(path.join(ROOT, 'assets/b1') + path.sep)) throw new Error('Bundled path escapes asset directory');
  if (!fs.statSync(target).isFile()) throw new Error(`Missing file: ${file}`);
  return fs.realpathSync(target);
}
const number = (x, name, min = 0, max = Infinity) => {
  if (!Number.isFinite(x) || x < min || x > max) throw new Error(`Invalid ${name}`);
  return x;
};
export function fontPaths(project) {
  return {
    hand: project.font ? mediaPath(project.base, project.font) : process.env.AUTOPILOT_FONT ? mediaPath(project.base, process.env.AUTOPILOT_FONT) : path.join(ROOT, 'assets/fonts/Caveat.ttf'),
    caption: project.captionFont ? mediaPath(project.base, project.captionFont) : path.join(ROOT, 'assets/fonts/NotoSans.ttf'),
  };
}
export function designPlane(project) {
  // One uniform scale keeps round heads and lettering undistorted in portrait.
  return {width: 1280, height: 1280 * project.height / project.width};
}
export function loadProject(file, {seconds} = {}) {
  file = fs.realpathSync(path.resolve(file));
  const p = json(file), base = path.dirname(file);
  if (p.version !== 1 || !['B1', 'B2'].includes(p.style)) throw new Error('Expected version 1 and style B1 or B2');
  number(p.width, 'width', 256, 3840); number(p.height, 'height', 256, 3840); number(p.fps, 'fps', 12, 60);
  if (![p.width, p.height, p.fps].every(Number.isInteger) || p.width % 2 || p.height % 2) throw new Error('Even integer dimensions and integer fps required');
  if (!p.voice || Object.keys(p.voice).some(k => !['path', 'lead', 'tail', 'contains_sfx'].includes(k))) throw new Error('Voice supports path/lead/tail/contains_sfx only; speech speed cannot be changed');
  const voicePath = mediaPath(base, p.voice.path), audio = probe(voicePath);
  if (!audio.streams.some(s => s.codec_type === 'audio')) throw new Error('Narration has no audio stream');
  const voiceDuration = Number(audio.format.duration);
  number(voiceDuration, 'voice duration', 0.01, 86400);
  const lead = p.voice.lead ?? 0, tail = p.voice.tail ?? 0;
  number(lead, 'lead', 0, 5); number(tail, 'tail', 0, 5);
  const duration = voiceDuration + lead + tail;
  if (seconds !== undefined) number(seconds, 'preview length', 0.001, 60);
  const rangeEnd = Math.min(duration, seconds ?? duration);
  const scoped = seconds !== undefined;
  if (p.captionSize !== undefined) number(p.captionSize, 'caption size', 20, 64);
  if (!Array.isArray(p.shots) || !p.shots.length) throw new Error('Shots required');
  const shots = scoped ? p.shots.filter(s => s.start < rangeEnd).map(s => ({...s, layers: Array.isArray(s.layers) ? s.layers.filter(l => s.start + (l.from ?? 0) < rangeEnd) : s.layers})) : p.shots;
  if (!shots.length) throw new Error('Shots required in the preview range');
  let end = 0;
  const assets = new Set([voicePath]);
  const types = new Set(['image', 'pose', 'text', 'line', 'arrow', 'underline']);
  for (const [i, shot] of shots.entries()) {
    number(shot.start, 'shot start'); number(shot.end, 'shot end');
    if (Math.abs(shot.start - end) > 0.002 || shot.end <= shot.start) throw new Error(`Shot ${i}: gap/overlap or nonpositive duration`);
    end = shot.end;
    if (!Array.isArray(shot.layers) || !shot.layers.length) throw new Error(`Shot ${i} has no layers`);
    for (const l of shot.layers) {
      if (!types.has(l.type)) throw new Error(`Unknown layer ${l.type}`);
      for (const k of ['x', 'y', 'w', 'h', 'size', 'angle', 'alpha', 'progress', 'lineWidth']) if (l[k] !== undefined) number(l[k], k, -10000, 10000);
      if (l.w !== undefined && l.w <= 0 || l.size !== undefined && l.size <= 0) throw new Error('Layer dimensions must be positive');
      if (l.type === 'image') { const f = mediaPath(base, l.path); if (!/\.(png|jpe?g)$/i.test(f)) throw new Error('Only PNG/JPEG image layers'); assets.add(f); }
      if (l.type === 'pose') { if (p.style !== 'B1') throw new Error('B1 pose atlas cannot be used in another style; author story-specific image layers'); number(l.pose, 'pose', 0, 2); if (!Number.isInteger(l.pose)) throw new Error('Integer pose index required'); assets.add(mediaPath(base, '@b1/character-pose-sheet-v6.png')); }
      if (l.type === 'text' && (typeof l.text !== 'string' || !l.text.trim() || l.text.length > 400)) throw new Error('Text layer must be 1–400 characters');
      if (l.type === 'line' && (!Array.isArray(l.points) || l.points.length < 2 || l.points.some(pt => !Array.isArray(pt) || pt.length !== 2 || pt.some(n => !Number.isFinite(n))))) throw new Error('Line requires finite [x,y] points');
      const span = shot.end - shot.start;
      number(l.from ?? 0, 'layer from', 0, span); number(l.to ?? span, 'layer to', l.from ?? 0, span);
      let previous = -1;
      for (const key of l.keys || []) {
        number(key.t, 'key time', 0, span);
        if (key.t <= previous) throw new Error('Key times must increase');
        previous = key.t;
        for (const k of Object.keys(key)) {
          if (!['t', 'x', 'y', 'w', 'angle', 'alpha', 'progress'].includes(k)) throw new Error(`Unsupported keyframe property: ${k}`);
          number(key[k], k, -10000, 10000);
          if (k === 'w' && key[k] <= 0 || ['alpha', 'progress'].includes(k) && (key[k] < 0 || key[k] > 1)) throw new Error('Invalid size/opacity/progress keyframe');
        }
      }
    }
  }
  if (scoped ? end < rangeEnd - 0.002 : Math.abs(end - duration) > 0.06) throw new Error(`Shots end at ${end}; ${scoped ? 'preview range' : 'voice+lead+tail'} ends at ${rangeEnd.toFixed(3)}`);
  let cueEnd = 0;
  if (!Array.isArray(p.captions) || !p.captions.length) throw new Error('Timed captions required');
  const captions = scoped ? p.captions.filter(c => c.start < rangeEnd) : p.captions;
  if (!captions.length) throw new Error('Timed captions required in the preview range');
  for (const cue of captions) {
    number(cue.start, 'caption start', cueEnd, duration); number(cue.end, 'caption end', cue.start + 0.01, duration);
    if (typeof cue.text !== 'string' || !cue.text.trim() || cue.text.length > 240) throw new Error('Invalid caption text');
    cueEnd = cue.end;
  }
  const sfx = scoped ? (p.sfx || []).filter(s => s.time < rangeEnd) : p.sfx || [];
  if (p.voice.contains_sfx && sfx.length) throw new Error('Already mixed voice must not receive duplicate SFX');
  for (const s of sfx) { number(s.time, 'SFX time', 0, duration); number(s.gain, 'SFX gain', 0, 0.3); if (!['tap', 'paper', 'pop', 'chime', 'jingle'].includes(s.kind)) throw new Error('Unknown SFX'); }
  if (p.music) { assets.add(mediaPath(base, p.music.path)); number(p.music.gain, 'music gain', 0, 0.2); }
  const timeline = {...p, shots, captions, sfx};
  const project = {...timeline, file, base, voicePath, voiceDuration, lead, tail, duration, rangeEnd};
  for (const f of Object.values(fontPaths(project))) { if (!fs.existsSync(f)) throw new Error(`Missing font: ${f}`); assets.add(f); }
  const inputs = [...assets].sort().map(f => ({path: f, sha256: hashFile(f)}));
  const engine = ['autopilot-core.mjs', 'autopilot-render.mjs'].map(f => hashFile(path.join(ROOT, 'scripts', f)));
  return {...project, inputs, fingerprint: sha(JSON.stringify({project: timeline, rangeEnd, inputs, engine}))};
}
export function outputDir(p) {
  const output = path.join(p.base, 'output');
  if (fs.existsSync(output) && (fs.lstatSync(output).isSymbolicLink() || !fs.statSync(output).isDirectory())) throw new Error('Output must be a real project-local directory');
  fs.mkdirSync(output, {recursive: true});
  function inspect(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (entry.isSymbolicLink()) throw new Error('Renderer-owned output must not contain symlinks');
      if (entry.isDirectory()) inspect(path.join(dir, entry.name));
    }
  }
  inspect(output);
  // Never allow an input file to be inside a renderer-owned output directory.
  if (p.inputs.some(i => i.path.startsWith(fs.realpathSync(output) + path.sep))) throw new Error('Input assets cannot live in output/');
  return output;
}
export function groupWords(data, lead = 0) {
  number(lead, 'caption lead', 0, 5);
  if (!Array.isArray(data.words) || !data.words.length) throw new Error('Aligned words required');
  const cues = []; let words = [], start, end = 0;
  function flush() { if (words.length) cues.push({start: start + lead, end: end + lead, text: words.join(' ').replace(/\s+([,.!?;:])/g, '$1')}); words = []; }
  for (const w of data.words) {
    number(w.start, 'word start', end); number(w.end, 'word end', w.start + 0.001);
    if (typeof w.word !== 'string' || !w.word.trim()) throw new Error('Empty word');
    if (words.length && (w.start - end > 0.4 || words.length >= 8 || w.end - start > 3.5 || [...words, w.word].join(' ').length > 58)) flush();
    if (!words.length) start = w.start;
    words.push(w.word.trim()); end = w.end;
    if (/[.!?]$/.test(w.word)) flush();
  }
  flush(); return cues;
}
