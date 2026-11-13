import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createCanvas} from '@napi-rs/canvas';
import {ROOT, FFMPEG, run, save, loadProject, probe} from '../scripts/autopilot-core.mjs';
import {BRIAN} from '../scripts/b4-runtime.mjs';
import {B4_HOOK, B4_PORTRAIT, makeB4Opening} from '../scripts/b4-opening.mjs';
import {painter} from '../scripts/autopilot-render.mjs';
import {checkB4OpeningPaint, checkB4OpeningFile} from '../scripts/b4-opening-visual-check.mjs';
import {planB4Typography, checkB4TypographyPaint} from '../scripts/b4-typography-review.mjs';

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b4-native-portrait-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  run(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=3', '-y', path.join(dir, 'tone.wav')]);
  const art = (file, change, landscape = false) => {
    const c = createCanvas(landscape ? 640 : 360, landscape ? 360 : 640), ctx = c.getContext('2d');
    ctx.scale(c.width / 1280, c.width / 1280);
    ctx.fillStyle = '#0c151b'; ctx.fillRect(0, 0, 1280, 1280 * c.height / c.width);
    ctx.fillStyle = '#43545c'; ctx.fillRect(150, 1080, 980, 920);
    ctx.fillStyle = '#0b1018'; ctx.fillRect(190, 1120, 900, 800);
    ctx.fillStyle = '#b4bab5'; ctx.beginPath(); ctx.arc(470, 1470, 140, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = change ? '#ba4b3f' : '#24313b'; ctx.fillRect(800, 1180, 220, 650);
    fs.writeFileSync(path.join(dir, file), c.toBuffer('image/png'));
  };
  art('before.png', false); art('after.png', true);
  const recipe = {setup: 'WHAT IF YOU SAW', payoff: 'DEATH COMING?', payoffLines: ['DEATH', 'COMING?'],
    before: 'before.png', after: 'after.png', meaning: 'Synthetic lower-window local threat reveal, not aesthetic acceptance', width: 360, height: 640};
  const hook = makeB4Opening(recipe), project = {version: 1, style: 'B4', width: 360, height: 640, fps: 15,
    voice: {path: 'tone.wav', ...BRIAN}, captions: [{start: 0, end: 3, text: 'Synthetic timing fixture.'}],
    opening: hook.opening, shots: [hook.shot], ambience: [{path: 'tone.wav', start: 0, end: 3, gain: .02}], sfx: [], dialogue: [], audio_cuts: []};
  const after = hook.shot.layers.find(layer => layer.id === hook.opening.picture.after), change = after.from, reveal = B4_HOOK.reveal_seconds;
  project.picture_motion = {author_id: 'synthetic-portrait-fixture-author', shots: [{shot: 0, kind: 'state_reveal',
    intent: 'Synthetic lower-window threat reveal; no aesthetic acceptance is asserted', before: 'Window contains no visible red threat', after: 'Local red threat is visible',
    layer_ids: [hook.opening.picture.before, hook.opening.picture.after], region: hook.opening.picture.region,
    times: {before: Math.floor((change - .1) * project.fps) / project.fps,
      mid: Math.round((change + reveal / 2) * project.fps) / project.fps,
      after: Math.ceil((change + reveal + .05) * project.fps) / project.fps,
      hold: Math.floor(Math.min(hook.shot.end - .08, change + reveal + .4) * project.fps) / project.fps}}]};
  const file = path.join(dir, 'project.json'), write = () => save(file, project); write();
  const paints = async () => { const p = loadProject(file); return {p, draw: await painter(p), picture: await painter(p, {pictureOnly: true})}; };
  const check = async () => { const {p, ...painters} = await paints(); return checkB4OpeningPaint(p, painters); };
  return {dir, file, project, recipe, art, write, paints, check, layer: id => project.shots[0].layers.find(l => l.id === id)};
}

test('B4 selects native portrait poster while leaving the landscape preset geometry unchanged', t => {
  const f = fixture(t), landscape = makeB4Opening({...f.recipe, width: 1280, height: 720});
  assert.equal(landscape.opening.preset, B4_HOOK.id);
  assert.deepEqual(landscape.shot.layers.find(l => l.id === 'hook-shadow'), {id: 'hook-shadow', type: 'shadow', x: 0, y: 0, w: 760, h: 720});
  assert.equal(landscape.shot.layers.find(l => l.id === 'hook-setup').x, 60);
  assert.equal(landscape.shot.layers.find(l => l.id === 'hook-payoff').size, 96);
  assert.equal(f.project.opening.preset, B4_PORTRAIT.id);
  assert.equal(f.layer('hook-before').h, 1280 * 640 / 360);
  assert.equal(f.layer('hook-shadow').direction, 'down');
  assert.equal(f.layer('hook-setup').x + f.layer('hook-setup').w / 2, 640);
  assert.deepEqual(f.layer('hook-payoff').lineSizes, [242, 162]);
  assert.equal(f.layer('hook-payoff').text, 'DEATH\nCOMING?');
  assert.ok(f.project.opening.picture.region.y > f.layer('hook-shadow').h);
  const plan = planB4Typography(loadProject(f.file));
  assert.ok(plan.moments[0].region.w > 1000, 'portrait typography registry covers both sides of the poster, not the landscape left block');
  assert.match(plan.moments[0].treatment, /Anton/);
  assert.throws(() => makeB4Opening({...f.recipe, payoffLines: ['DEATH', 'GOING?']}), /preserve approved copy/);
});

test('B4 portrait keeps the hand-drawn accent after a speech-aligned nondefault payoff', async t => {
  const f = fixture(t), hook = makeB4Opening({...f.recipe, payoffAt: .65});
  f.project.opening = hook.opening; f.project.shots = [hook.shot]; f.write();
  assert.equal(f.layer('hook-payoff').from, .65);
  assert.equal(f.layer('hook-underline').from, .75);
  const report = await f.check();
  assert.equal(report.status, 'paint_diagnostic_pass');
  assert.ok(report.times.mark_start >= f.layer('hook-payoff').from);
  f.layer('hook-underline').from = .4; f.layer('hook-underline').keys = [{t:.4,progress:0},{t:.68,progress:1}]; f.write();
  assert.throws(() => loadProject(f.file), /after the payoff/);
});

test('B4 portrait rejects landscape geometry, missing motion, missing local art change, squeeze and unsafe placement', t => {
  const f = fixture(t), original = structuredClone(f.project);
  for (const [mutate, pattern] of [
    [() => { f.project.opening.preset = B4_HOOK.id; }, /native portrait/],
    [() => { f.layer('hook-setup').x = 60; f.layer('hook-setup').w = 550; }, /centered/],
    [() => { f.project.opening.picture.region.y = 200; }, /lower subject/],
    [() => { f.layer('hook-payoff').keys = []; }, /visible emphasis/],
    [() => { f.layer('hook-after').keys = []; }, /local reveal/],
    [() => { f.layer('hook-payoff').keys[0].scaleY = 1; }, /no squeeze/],
    [() => { f.layer('hook-payoff').x = -30; }, /safe margins/],
    [() => { f.layer('hook-after').path = 'before.png'; }, /artwork is identical/],
    [() => { f.layer('hook-underline').keys = []; }, /emphasis line/],
  ]) {
    Object.assign(f.project, structuredClone(original)); mutate(); f.write();
    assert.throws(() => loadProject(f.file), pattern);
  }
});

test('B4 portrait measures actual glyph/shadow bounds and refuses mismatched landscape art and uncovered fonts', async t => {
  const f = fixture(t), original = structuredClone(f.project);
  f.layer('hook-setup').text = 'THIS APPROVED SEMANTIC LINE CANNOT FIT THIS POSTER'; f.write();
  await assert.rejects(f.paints, /measured title\/shadow bounds/);
  Object.assign(f.project, structuredClone(original)); f.layer('hook-payoff').text = 'DEATH\n不要出警'; f.write();
  await assert.rejects(f.paints, /lacks glyphs/);
  Object.assign(f.project, structuredClone(original)); f.write();
  f.art('before.png', false, true);
  await assert.rejects(f.paints, /native matching portrait artwork/);
});

test('B4 native portrait paint and encoded frames retain the poster settle, drawn line and lower story reveal', async t => {
  const f = fixture(t), {p, draw, picture} = await f.paints();
  const paint = await checkB4OpeningPaint(p, {draw, picture});
  assert.equal(paint.status, 'paint_diagnostic_pass');
  assert.ok(paint.accent_ink.mean > .01);
  assert.equal(checkB4TypographyPaint(p, {draw}).status, 'paint_diagnostic_pass');
  const sequence = path.join(f.dir, 'frame-%02d.png'), output = path.join(f.dir, 'portrait.mp4');
  for (let i = 0; i < 45; i++) fs.writeFileSync(sequence.replace('%02d', String(i).padStart(2, '0')), draw(i / 15).toBuffer('image/png'));
  run(FFMPEG, ['-v', 'error', '-framerate', '15', '-i', sequence, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-y', output]);
  const encoded = await checkB4OpeningFile(p, output, {draw, picture});
  assert.equal(encoded.status, 'diagnostic_pass');
  assert.equal(encoded.preset, B4_PORTRAIT.id);
  assert.ok(encoded.samples.some(s => s.phase === 'mark_mid'));
  assert.match(encoded.human_review, /required/);
  if (process.env.B4_PORTRAIT_TEST_CAPTURE_DIR) {
    const target = path.resolve(process.env.B4_PORTRAIT_TEST_CAPTURE_DIR); fs.mkdirSync(target, {recursive: true});
    fs.writeFileSync(path.join(target, 'synthetic-painter-frame.png'), draw(.86).toBuffer('image/png'));
    fs.copyFileSync(output, path.join(target, 'synthetic-painter-encoded.mp4'));
    save(path.join(target, 'synthetic-diagnostics.json'), {paint, encoded, note:'Synthetic runtime fixture only; no story/aesthetic acceptance is established.'});
  }
  const frozenLine = structuredClone(p); frozenLine.shots[0].layers.find(l => l.id === 'hook-underline').keys = [];
  const wrongDraw = await painter(frozenLine), wrongSequence = path.join(f.dir, 'wrong-%02d.png'), wrongOutput = path.join(f.dir, 'frozen-line.mp4');
  for (let i = 0; i < 45; i++) fs.writeFileSync(wrongSequence.replace('%02d', String(i).padStart(2, '0')), wrongDraw(i / 15).toBuffer('image/png'));
  run(FFMPEG, ['-v', 'error', '-framerate', '15', '-i', wrongSequence, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-y', wrongOutput]);
  await assert.rejects(() => checkB4OpeningFile(p, wrongOutput, {draw, picture}), /portrait emphasis line/);
});

test('B4 native portrait CLI preview completes rawvideo encoding and full current-media typography diagnostics', t => {
  const f = fixture(t);
  f.project.typography = {author_id:'synthetic-portrait-cli-author'}; f.write();
  // This exercises the shipped rawvideo -> H.264 -> typography evidence path,
  // including the different full-frame and diagnostic thumbnail resolutions.
  const result = spawnSync(process.execPath, [path.join(ROOT,'scripts/autopilot.mjs'),'preview',f.file,'--seconds','3'], {encoding:'utf8',timeout:120000});
  assert.equal(result.status,0,result.stderr);
  const report = JSON.parse(fs.readFileSync(path.join(f.dir,'output/preview-report.json')));
  assert.equal(report.frames,45);
  assert.equal(report.opening_visual.status,'diagnostic_pass');
  assert.equal(report.opening_visual.preset,B4_PORTRAIT.id);
  assert.equal(report.typography.status,'pending_independent_review');
  assert.equal(report.picture_motion.status,'pending_independent_review');
  assert.equal(report.picture_motion.diagnostic_status,'technical_only');
  assert.equal(report.picture_motion.delivery_ready,false);
  assert.equal(report.visual_acceptance,'pending_independent_review');
  assert.equal(report.delivery_ready,false);
  assert.ok(fs.existsSync(report.typography.template_file));
  const video = probe(report.output).streams.find(s=>s.codec_type==='video');
  assert.equal(video.width,360); assert.equal(video.height,640);
  const contact = fs.readFileSync(path.join(f.dir,'output/preview-contact-sheet.png'));
  assert.equal(contact.readUInt32BE(16),960);
  assert.equal(contact.readUInt32BE(20),3*Math.round(320*640/360),'portrait contact-sheet cells preserve native aspect ratio');
});
