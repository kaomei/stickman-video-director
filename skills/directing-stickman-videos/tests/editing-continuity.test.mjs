import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createCanvas} from '@napi-rs/canvas';
import {FFMPEG, FFPROBE, run, save, loadProject, hashFile, groupWords} from '../scripts/autopilot-core.mjs';
import {painter, render} from '../scripts/autopilot-render.mjs';
import {appendAudioTracks} from '../scripts/b4-runtime.mjs';

test('generated phrase captions bridge tiny gaps but preserve sentence and real-pause boundaries', () => {
  const words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten.'].map((word, i) => ({word, start: i * .12, end: i * .12 + .08}));
  const cues = groupWords({words});
  assert.equal(cues.length, 2);
  assert.equal(cues[0].end, cues[1].start, 'A tiny same-phrase gap should not blank a caption for one frame');
  assert.equal(cues[1].start, words[8].start, 'Never advance the next spoken phrase');
  for (const word of ['Hello.', '你好。', 'Really?\u201d']) {
    const separated = groupWords({words: [{word, start: 0, end: .1}, {word: 'Next.', start: .16, end: .3}]});
    assert.equal(separated.length, 2); assert.equal(separated[0].end, .1);
  }
  const pause = groupWords({words: [...words.slice(0, 8), {word: 'later', start: 1.4, end: 1.6}]});
  assert.equal(pause[0].end, words[7].end);
});

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stickman-fluidity-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  run(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=310:duration=2', '-y', path.join(dir, 'voice.wav')]);
  const project = {version: 1, style: 'B3', width: 640, height: 360, fps: 30, television: {enabled: false},
    voice: {path: 'voice.wav'}, ambience: [{path: 'voice.wav', start: 0, end: 2, gain: .01}],
    captions: [{start: .1, end: 1.9, text: 'Offline motion diagnostic.'}],
    shots: [{start: 0, end: .41, layers: [{type: 'rect', w: 1280, h: 720, fill: '#ffffff'}]},
      {start: .41, end: 2, layers: [{type: 'rect', w: 1280, h: 720, fill: '#0000f0'}]}], sfx: []};
  const file = path.join(dir, 'project.json'); save(file, project);
  return {dir, project, file};
}

test('off-grid cuts cannot cache a stale frame from the preceding shot', async t => {
  const f = fixture(t), voice = hashFile(path.join(f.dir, 'voice.wav'));
  await render(loadProject(f.file));
  f.project.shots[0].layers[0].fill = '#f00000'; save(f.file, f.project);
  const report = await render(loadProject(f.file), {replace: true});
  assert.equal(report.cache_hits, 1, 'The unchanged following shot should still reuse its own frames');
  const frame = spawnSync(FFMPEG, ['-v', 'error', '-i', report.output, '-vf', 'select=eq(n\\,12)', '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], {maxBuffer: 2 * 1024 * 1024});
  assert.equal(frame.status, 0, frame.stderr.toString());
  const offset = (20 * 640 + 20) * 3, pixel = [...frame.stdout.subarray(offset, offset + 3)];
  assert.ok(pixel[0] > 200 && pixel[1] < 40 && pixel[2] < 40, `Frame at 0.4s belongs to the updated red shot, not a stale cached white frame: ${pixel}`);
  const timings = JSON.parse(run(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_frames', '-show_entries', 'frame=best_effort_timestamp_time', '-of', 'json', report.output])).frames.map(f => Number(f.best_effort_timestamp_time));
  assert.equal(timings.length, 60);
  for (let i = 0; i < timings.length; i++) assert.ok(Math.abs(timings[i] - i / 30) < .00001, 'Frame timestamps must stay uniform without changing playback speed');
  assert.equal(hashFile(path.join(f.dir, 'voice.wav')), voice);
});

test('an authored short dissolve blends pictures while keeping current captions crisp', async t => {
  const f = fixture(t);
  f.project.shots[1].transition = {type: 'dissolve', duration: .2, reason: 'Synthetic scene/time transition'};
  f.project.captions = [{start: 0, end: .41, text: 'Previous phrase.'}, {start: .41, end: 2, text: 'Current phrase.'}];
  save(f.file, f.project); const draw = await painter(loadProject(f.file));
  const frame = draw(.51), ctx = frame.getContext('2d'), pixel = [...ctx.getImageData(20, 20, 1, 1).data];
  assert.ok(pixel[0] > 100 && pixel[0] < 160 && pixel[2] > 230, `Expected a midpoint blend, got ${pixel}`);
  const caption = ctx.getImageData(150, 319, 340, 22).data;
  assert.ok(caption.some((v, i) => i % 4 === 0 && v === 244 && caption[i + 1] === 245), 'Current captions are drawn after picture blending');
  const settled = [...draw(.72).getContext('2d').getImageData(20, 20, 1, 1).data];
  assert.deepEqual(settled, [0, 0, 240, 255]);
});

test('dissolve cache also binds the preceding picture and its media', async t => {
  const f = fixture(t);
  const image = path.join(f.dir, 'previous.png'), canvas = createCanvas(64, 36), ctx = canvas.getContext('2d');
  const art = color => { ctx.fillStyle = color; ctx.fillRect(0, 0, 64, 36); fs.writeFileSync(image, canvas.toBuffer('image/png')); };
  art('#ffffff');
  f.project.shots[0].layers = [{type: 'image', path: 'previous.png', w: 1280, h: 720}];
  f.project.shots[1].transition = {type: 'dissolve', duration: .2, reason: 'Synthetic cache dependency test'}; save(f.file, f.project);
  await render(loadProject(f.file));
  art('#f00000');
  const report = await render(loadProject(f.file), {replace: true});
  assert.equal(report.cache_hits, 0, 'The dissolve uses both shots, so changing its preceding picture must invalidate it');
});

test('transition validation rejects first-shot, unmotivated or oversized blends', t => {
  const f = fixture(t);
  for (const transition of [{type: 'unknown', duration: .1, reason: 'x'}, {type: 'dissolve', duration: .6, reason: 'x'}, {type: 'dissolve', duration: .1}]) {
    f.project.shots[1].transition = transition; save(f.file, f.project);
    assert.throws(() => loadProject(f.file), /transition/i);
  }
  delete f.project.shots[1].transition;
  f.project.shots[0].transition = {type: 'dissolve', duration: .1, reason: 'Invalid initial blend'}; save(f.file, f.project);
  assert.throws(() => loadProject(f.file), /transition/i);
});

test('painting subtitles cannot shift scene text on later frames or random seeks', async t => {
  const f = fixture(t);
  f.project.shots[0].layers.push({type: 'text', text: 'FIXED TITLE', x: 240, y: 120, size: 64});
  f.project.shots[1].transition = {type: 'dissolve', duration: .2, reason: 'Synthetic seek regression'}; save(f.file, f.project);
  const draw = await painter(loadProject(f.file)), before = Buffer.from(draw(.05).data());
  draw(.2); draw(.51);
  assert.ok(before.equals(Buffer.from(draw(.05).data())), 'Subtitle center alignment must not leak into the next scene-text draw');
});

function effectSamples(p) {
  const args = [], filters = [], voices = [], backgrounds = [];
  appendAudioTracks({sfx: p.sfx, ambience: [], dialogue: []}, args, filters, voices, backgrounds, 0);
  const result = spawnSync(FFMPEG, ['-v', 'error', ...args, '-filter_complex', filters.join(';'), '-map', backgrounds[0], '-ar', '48000', '-ac', '1', '-f', 's16le', 'pipe:1']);
  assert.equal(result.status, 0, result.stderr.toString());
  return result.stdout;
}
test('default file effects soften discontinuous edges while preserving explicit cuts and preview timing', t => {
  const f = fixture(t), effect = path.join(f.dir, 'constant.wav');
  run(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', 'aevalsrc=0.5:sample_rate=48000:duration=0.2', '-y', effect]);
  const original = hashFile(effect);
  f.project.sfx = [{kind: 'file', path: 'constant.wav', time: 0, duration: .2, gain: .5}]; save(f.file, f.project);
  let samples = effectSamples(loadProject(f.file));
  assert.ok(Math.abs(samples.readInt16LE(0)) < 50, 'Abrupt nonzero source onset needs a tiny anti-click edge');
  assert.ok(Math.abs(samples.readInt16LE(samples.length - 2)) < 100);
  assert.ok(samples.readInt16LE(4800) > 7000, 'Keep the audible body of the source effect');
  samples = effectSamples(loadProject(f.file, {seconds: .15}));
  assert.ok(samples.readInt16LE(samples.length - 2) > 7000, 'A preview boundary must not fade earlier than full production');
  Object.assign(f.project.sfx[0], {fadeIn: 0, fadeOut: 0}); save(f.file, f.project);
  samples = effectSamples(loadProject(f.file));
  assert.ok(samples.readInt16LE(0) > 7000, 'Explicit instantaneous edges remain an authored choice');
  assert.equal(hashFile(effect), original, 'Do not rewrite accepted source audio');
});

test('procedural noise effects begin and end at zero without removing their audible body', async t => {
  const f = fixture(t); f.project.sfx = [{time: 0, kind: 'paper', gain: .1}]; save(f.file, f.project);
  await render(loadProject(f.file));
  const decoded = spawnSync(FFMPEG, ['-v', 'error', '-i', path.join(f.dir, 'output/cache/sfx.wav'), '-f', 's16le', '-ac', '1', 'pipe:1']);
  assert.equal(decoded.status, 0, decoded.stderr.toString());
  assert.equal(decoded.stdout.readInt16LE(0), 0);
  assert.equal(decoded.stdout.readInt16LE((Math.round(.22 * 48000) - 1) * 2), 0);
  assert.ok(Array.from({length: 200}, (_, i) => Math.abs(decoded.stdout.readInt16LE((480 + i) * 2))).some(v => v > 100));
});

test('tolerated submillisecond joins keep unique frame ownership without gaps or duplicates', async t => {
  const f = fixture(t);
  for (const [end, start] of [[.4001, .3999], [.3999, .4001]]) {
    f.project.shots[0].end = end; f.project.shots[0].layers[0].to = end;
    f.project.shots[1].start = start; save(f.file, f.project);
    const p = loadProject(f.file), report = await render(p, {replace: true});
    assert.equal(report.frames, 60);
    const draw = await painter(p), pixel = [...draw(.4).getContext('2d').getImageData(20, 20, 1, 1).data];
    assert.deepEqual(pixel, start < .4 ? [0, 0, 240, 255] : [255, 255, 255, 255]);
  }
});

test('tiny join tolerance cannot admit a timeline whose shot starts run backward', t => {
  const f = fixture(t), layers = f.project.shots[0].layers;
  f.project.shots = [{start: 0, end: .4009, layers}, {start: .4005, end: .401, layers}, {start: .3995, end: 2, layers}]; save(f.file, f.project);
  assert.throws(() => loadProject(f.file), /chronological|start order/i);
});

test('procedural effects have an identical preview/full prefix even across the preview end', async t => {
  const f = fixture(t);
  f.project.sfx = [{time: 1.2, kind: 'paper', gain: .1}, {time: .35, kind: 'paper', gain: .1}]; save(f.file, f.project);
  const samples = () => {
    const r = spawnSync(FFMPEG, ['-v', 'error', '-i', path.join(f.dir, 'output/cache/sfx.wav'), '-f', 's16le', '-ac', '1', 'pipe:1']);
    assert.equal(r.status, 0, r.stderr.toString()); return r.stdout;
  };
  await render(loadProject(f.file, {seconds: .4}), {seconds: .4}); const preview = samples();
  await render(loadProject(f.file), {replace: true}); const full = samples();
  assert.ok(preview.equals(full.subarray(0, preview.length)), 'The sample must not fade/noise-reseed a cue differently from the full mix');
});

test('many short clips retain exact CFR without accumulating rounded duration estimates', async t => {
  const f = fixture(t), count = 180;
  run(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=310:duration=6', '-y', path.join(f.dir, 'voice.wav')]);
  Object.assign(f.project, {width: 256, height: 256, captions: [{start: 0, end: 6, text: 'Frame timing test.'}], ambience: [{path: 'voice.wav', start: 0, end: 6, gain: .01}]});
  f.project.shots = Array.from({length: count}, (_, i) => ({start: i / 30, end: (i + 1) / 30, layers: [{
    id: `actor-${i}`, type: 'group', x: 100, y: 100, motion: {role: 'actor', reason: 'Synthetic frame-timing stress only'},
    keys: [{t: 0, x: 100}, {t: (i + 1) / 30 - i / 30, x: 120}], children: [{type: 'ellipse', w: 60, h: 60, fill: '#ffffff'}],
  }]}));
  save(f.file, f.project); const report = await render(loadProject(f.file));
  const data = JSON.parse(run(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_frames', '-show_entries', 'frame=best_effort_timestamp_time', '-of', 'json', report.output]));
  assert.equal(data.frames.length, count);
  for (let i = 0; i < count; i++) assert.ok(Math.abs(Number(data.frames[i].best_effort_timestamp_time) - i / 30) < .00001);
});
