import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT, FFMPEG, run, save, loadProject, hashFile, probe} from '../scripts/autopilot-core.mjs';
import {BRIAN, appendB4Audio} from '../scripts/b4-runtime.mjs';
import {painter} from '../scripts/autopilot-render.mjs';

const cli = path.join(ROOT, 'scripts/autopilot.mjs');
const command = args => spawnSync(process.execPath, [cli, ...args], {encoding: 'utf8', timeout: 120000});
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b4-runtime-test-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  // Tones identify timing/mixing independently of any paid service or human voice.
  for (const [name, frequency, duration] of [['voice', 440, 3.2], ['bed', 880, 3.2], ['effect', 1320, 1], ['role', 1760, 1]])
    run(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', `sine=frequency=${frequency}:duration=${duration}`, '-y', path.join(dir, `${name}.wav`)]);
  fs.copyFileSync(path.join(ROOT, 'assets/b4/reference-01-motor-room.png'), path.join(dir, 'scene.png'));
  const project = {version: 1, style: 'B4', width: 640, height: 360, fps: 15,
    voice: {path: 'voice.wav', ...BRIAN},
    captions: [{start: 0, end: 1.55, text: 'The door was locked.'}, {start: 1.6, end: 3.2, text: 'Then the handle moved.'}],
    shots: [{start: 0, end: 1.6, layers: [
      {type: 'image', path: 'scene.png', x: 0, y: 0, w: 1280},
      {type: 'shadow', x: 0, y: 0, w: 760, h: 610},
      {type: 'text', text: 'WOULD YOU', x: 80, y: 100, size: 70},
      {type: 'text', text: 'OPEN IT?', x: 80, y: 210, size: 90, from: .5}],
    }, {start: 1.6, end: 3.2, layers: [
      {type: 'image', path: 'scene.png', x: -250, y: -100, w: 1600,
        keys: [{t: 0, x: -250}, {t: 1, x: -230}]}]}],
    ambience: [{path: 'bed.wav', start: 0, end: 3.2, gain: .1, fadeOut: .5}],
    dialogue: [{path: 'role.wav', time: .6, gain: .4, role: 'frightened caller'}],
    sfx: [{kind: 'file', path: 'effect.wav', time: 1.8, gain: .3, duration: .7}], audio_cuts: []};
  const file = path.join(dir, 'project.json');
  const write = () => save(file, project);
  write();
  return {dir, file, project, write};
}
const report = (f, kind = 'preview') => JSON.parse(fs.readFileSync(path.join(f.dir, 'output', `${kind}-report.json`)));
function spectrum(filename, start, duration, frequency) {
  const decoded = spawnSync(FFMPEG, ['-v', 'error', '-i', filename, '-ss', String(start), '-t', String(duration),
    '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], {maxBuffer: 2 * 1024 * 1024});
  assert.equal(decoded.status, 0, decoded.stderr.toString());
  let real = 0, imaginary = 0; const count = decoded.stdout.length / 4;
  for (let i = 0; i < count; i++) {
    const value = decoded.stdout.readFloatLE(i * 4), phase = 2 * Math.PI * frequency * i / 48000;
    real += value * Math.cos(phase); imaginary += value * Math.sin(phase);
  }
  return Math.hypot(real, imaginary) * 2 / count;
}

test('B4 CLI initializes an external project with Brian and separate production tracks', t => {
  const parent = fs.mkdtempSync(path.join(os.tmpdir(), 'b4-init-test-'));
  t.after(() => fs.rmSync(parent, {recursive: true, force: true}));
  const dir = path.join(parent, 'story');
  const r = command(['init', dir, '--style', 'B4']);
  assert.equal(r.status, 0, r.stderr);
  const p = JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8'));
  assert.equal(p.style, 'B4');
  assert.deepEqual(p.voice, {path: 'narration.wav', lead: 0, tail: 0, ...BRIAN});
  for (const key of ['ambience', 'dialogue', 'audio_cuts', 'sfx']) assert.deepEqual(p[key], []);
  assert.equal(p.television, undefined);
  assert.notEqual(command(['init', dir, '--style', 'B4']).status, 0);
});

test('B4 validates independent native-rate audio assets and preserves their fingerprints', t => {
  const f = fixture(t), p = loadProject(f.file);
  assert.equal(p.style, 'B4'); assert.equal(p.voiceDuration, 3.2);
  assert.equal(p.ambience.length, 1); assert.equal(p.dialogue.length, 1); assert.equal(p.sfx.length, 1);
  for (const name of ['voice', 'bed', 'effect', 'role']) {
    const source = fs.realpathSync(path.join(f.dir, name + '.wav'));
    assert.ok(p.inputs.some(i => i.path === source && i.sha256 === hashFile(source)));
  }
  assert.equal(p.inputs.filter(i => /reference-\d\d-/.test(i.path)).length, 5);
  const before = p.fingerprint;
  f.project.sfx[0].gain = .2; f.write(); assert.notEqual(loadProject(f.file).fingerprint, before);
});

test('B4 requires Brian unless explicitly recast and rejects rate/pitch fields', t => {
  const f = fixture(t);
  f.project.voice.id = 'another-voice'; f.write(); assert.throws(() => loadProject(f.file), /Brian identity/);
  f.project.voice.name = 'Explicit chosen voice'; f.project.voice.user_override = 'Synthetic recasting test'; f.write();
  assert.equal(loadProject(f.file).voice.id, 'another-voice');
  f.project.voice.speed = 1.1; f.write(); assert.throws(() => loadProject(f.file), /speech speed/);
  delete f.project.voice.speed;
  f.project.sfx[0].speed = 1.1; f.write(); assert.throws(() => loadProject(f.file), /native source rate/);
});

test('B4 rejects long unapproved shots, silent lead pads, bed gaps and doubled mixed masters', t => {
  const f = fixture(t), original = structuredClone(f.project);
  f.project.shots = [{...f.project.shots[0], end: 3.2}]; f.write();
  assert.throws(() => loadProject(f.file), /at most 3 seconds/);
  Object.assign(f.project.shots[0], {kind: 'exceptional_hold', reason: 'Synthetic test only', user_approval: 'Synthetic fixture approval'}); f.write();
  assert.equal(loadProject(f.file).shots.length, 1);
  Object.assign(f.project, structuredClone(original)); f.project.voice.lead = .2;
  f.project.shots.at(-1).end += .2; f.write(); assert.throws(() => loadProject(f.file), /silent title pad/);
  Object.assign(f.project, structuredClone(original)); f.project.ambience[0].start = .3; f.write();
  assert.throws(() => loadProject(f.file), /uncovered gap/);
  f.project.audio_cuts = [{start: 0, end: .3, reason: 'Synthetic motivated cut', return_trigger: 'Door opens'}]; f.write();
  assert.equal(loadProject(f.file).audio_cuts.length, 1);
  f.project.voice.contains_sfx = true; f.write(); assert.throws(() => loadProject(f.file), /duplicate/);
  f.project.sfx = []; f.project.dialogue = []; f.project.ambience = []; f.project.audio_cuts = []; f.write();
  assert.equal(loadProject(f.file).voice.contains_sfx, true);
});

test('B4 fields and artwork cannot leak into B1–B3', t => {
  const f = fixture(t);
  for (const style of ['B1', 'B2', 'B3']) {
    f.project.style = style; f.write(); assert.throws(() => loadProject(f.file), /belong to B4 only/);
  }
});

test('B4 preview keeps full-program fade timing and skips unproduced future media', t => {
  const f = fixture(t);
  f.project.dialogue[0].time = 1.7; f.project.dialogue[0].path = 'not-produced.wav'; f.write();
  assert.throws(() => loadProject(f.file), /not-produced/);
  const p = loadProject(f.file, {seconds: 1.2});
  assert.deepEqual(p.dialogue, []); assert.deepEqual(p.sfx, []);
  const args = [], filters = [], voices = [], backgrounds = [];
  appendB4Audio(p, args, filters, voices, backgrounds, 2);
  assert.ok(filters.some(s => s.includes('afade=t=out:st=2.7:d=0.5')));
  assert.ok(!filters.some(s => /atempo|rubberband|asetrate/.test(s)));
  assert.equal(backgrounds.length, 1); assert.equal(voices.length, 0);
});

test('B4 paints half-shadow and staged whole text without B1 paper or B3 TV', async t => {
  const f = fixture(t), frame = await painter(loadProject(f.file));
  const a = frame(.2).toBuffer('image/png'), b = frame(.8).toBuffer('image/png');
  assert.notEqual(hashFile(path.join(f.dir, 'scene.png')), '');
  assert.notDeepEqual(a, b);
  f.project.captions[0].text = 'First line\nSecond line'; f.write();
  const invalid = await painter(loadProject(f.file)); assert.throws(() => invalid(.2), /one line/);
});

test('B4 CLI previews, approval-bound full rendering and cache reuse work with actual encoded tracks', t => {
  const f = fixture(t), voiceHash = hashFile(path.join(f.dir, 'voice.wav'));
  for (const args of [['validate', f.file], ['preview', f.file, '--seconds', '1.6']]) {
    const r = command(args); assert.equal(r.status, 0, r.stderr);
  }
  let r = command(['render', f.file]); assert.notEqual(r.status, 0); assert.match(r.stderr, /user-approved preview/);
  r = command(['approve', f.file, '--note', 'Synthetic automated test only, not a real user production approval']); assert.equal(r.status, 0, r.stderr);
  r = command(['render', f.file]); assert.equal(r.status, 0, r.stderr);
  const full = report(f, 'film');
  assert.equal(full.opening_audio.status, 'diagnostic_pass');
  assert.equal(full.original_voice_sha256, voiceHash); assert.equal(full.original_voice_duration, 3.2);
  assert.deepEqual(full.audio_tracks, {ambience: 1, dialogue: 1, file_sfx: 1, cuts: 0});
  assert.equal(probe(full.output).streams.filter(s => s.codec_type === 'audio').length, 1);
  assert.equal(full.cache_hits, 1);
  // Distinct tones survive at source pitch and arrive only at authored times.
  assert.ok(spectrum(full.output, .2, .2, 440) > .1);
  assert.ok(spectrum(full.output, .2, .2, 880) > .009);
  assert.ok(spectrum(full.output, .2, .2, 1760) < .001);
  assert.ok(spectrum(full.output, .8, .2, 1760) > .04);
  assert.ok(spectrum(full.output, 2, .2, 1320) > .03);
  f.project.ambience[0].gain = .05; f.write();
  r = command(['render', f.file, '--replace']); assert.notEqual(r.status, 0); assert.match(r.stderr, /Approval invalidated/);
});

test('B4 AUDIO CUT mutes background, music and effects but preserves narrator and role', t => {
  const f = fixture(t);
  f.project.sfx[0].time = .8; f.project.dialogue[0].time = .8;
  f.project.music = {path: 'effect.wav', gain: .1};
  f.project.audio_cuts = [{start: .9, end: 1.3, reason: 'Synthetic background dropout', return_trigger: 'Signal returns'}]; f.write();
  const r = command(['preview', f.file, '--seconds', '1.6']); assert.equal(r.status, 0, r.stderr);
  const output = report(f).output;
  assert.ok(spectrum(output, 1, .15, 440) > .1);
  assert.ok(spectrum(output, 1, .15, 1760) > .04);
  assert.ok(spectrum(output, 1, .15, 880) < .001);
  assert.ok(spectrum(output, 1, .15, 1320) < .001);
  assert.ok(spectrum(output, 1.4, .15, 880) > .009);
});

test('B4 encoded silent opening is flagged and cannot be approved without a motivated exception', t => {
  const f = fixture(t);
  run(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', '3.2', '-y', path.join(f.dir, 'voice.wav')]);
  f.project.ambience[0].gain = 0; f.project.dialogue = []; f.project.sfx = []; f.write();
  let r = command(['preview', f.file, '--seconds', '1.6']); assert.equal(r.status, 0, r.stderr);
  assert.equal(report(f).opening_audio.status, 'needs_review');
  r = command(['approve', f.file, '--note', 'Synthetic fixture']); assert.notEqual(r.status, 0); assert.match(r.stderr, /opening audio needs review/);
  f.project.opening_audio_override = 'Synthetic fixture: deliberate story-motivated silence'; f.write();
  r = command(['preview', f.file, '--seconds', '1.6', '--replace']); assert.equal(r.status, 0, r.stderr);
  r = command(['approve', f.file, '--note', 'Synthetic fixture exception']); assert.equal(r.status, 0, r.stderr);
});

test('B4 explicit source-silence trim repairs onset without changing rate or source', t => {
  const f = fixture(t);
  const source = path.join(f.dir, 'voice.wav');
  run(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2.9',
    '-af', 'adelay=300:all=1', '-y', source]);
  const originalHash = hashFile(source);
  f.project.ambience[0].gain = 0; f.project.dialogue = []; f.project.sfx = []; f.write();
  let r = command(['preview', f.file, '--seconds', '1.6']);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(report(f).opening_audio.status, 'needs_review');
  f.project.voice.trim_start = .28;
  f.project.shots.at(-1).end = 2.92; f.project.captions.at(-1).end = 2.92;
  f.project.ambience[0].end = 2.92; f.write();
  const p = loadProject(f.file);
  assert.ok(Math.abs(p.duration - 2.92) < .001);
  r = command(['preview', f.file, '--seconds', '1.6', '--replace']);
  assert.equal(r.status, 0, r.stderr);
  const fixed = report(f);
  assert.equal(fixed.opening_audio.status, 'diagnostic_pass');
  assert.ok(fixed.opening_audio.first_perceptible_onset_seconds <= .04);
  assert.equal(fixed.voice_trim_start_seconds, .28);
  assert.equal(fixed.original_voice_sha256, originalHash);
  assert.equal(hashFile(source), originalHash);
  assert.ok(spectrum(fixed.output, .2, .2, 440) > .1);
  f.project.voice.trim_start = -.1; f.write();
  assert.throws(() => loadProject(f.file), /voice trim_start/);
  f.project.voice.trim_start = 3.2; f.write();
  assert.throws(() => loadProject(f.file), /voice trim_start/);
  f.project.style = 'B1'; delete f.project.ambience; delete f.project.dialogue; delete f.project.audio_cuts;
  f.project.voice = {path: 'voice.wav', trim_start: .28}; f.write();
  assert.throws(() => loadProject(f.file), /Voice supports/);
});
