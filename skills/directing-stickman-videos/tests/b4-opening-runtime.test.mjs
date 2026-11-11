import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createCanvas} from '@napi-rs/canvas';
import {ROOT, FFMPEG, run, save, loadProject, hashFile} from '../scripts/autopilot-core.mjs';
import {BRIAN} from '../scripts/b4-runtime.mjs';
import {B4_HOOK, makeB4Opening} from '../scripts/b4-opening.mjs';
import {painter} from '../scripts/autopilot-render.mjs';
import {checkB4OpeningPaint, checkB4OpeningFile} from '../scripts/b4-opening-visual-check.mjs';

const command = args => spawnSync(process.execPath, [path.join(ROOT, 'scripts/autopilot.mjs'), ...args], {encoding: 'utf8', timeout: 120000});
test('B4 ships baked heavy glyphs, not a variable font silently rendered at its default weight', () => {
  const font = fs.readFileSync(path.join(ROOT, 'assets/fonts/Nunito.ttf'));
  const tables = new Map();
  for (let i = 0; i < font.readUInt16BE(4); i++) {
    const at = 12 + i * 16;
    tables.set(font.toString('ascii', at, at + 4), font.readUInt32BE(at + 8));
  }
  assert.equal(tables.has('fvar'), false, 'Static weight is required across canvas runtimes');
  assert.equal(font.readUInt16BE(tables.get('OS/2') + 4), 900);
  assert.equal(hashFile(path.join(ROOT, 'assets/fonts/Nunito.ttf')), B4_HOOK.font_sha256);
});
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b4-opening-gate-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  run(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=3', '-y', path.join(dir, 'tone.wav')]);
  const art = (file, {change = false, global = false, tiny = false, expression = false} = {}) => {
    const c = createCanvas(1280, 720), ctx = c.getContext('2d');
    ctx.fillStyle = global ? '#343e49' : '#101720'; ctx.fillRect(0, 0, 1280, 720);
    ctx.fillStyle = '#52606b'; ctx.fillRect(800, 100, 300, 440);
    ctx.fillStyle = '#1c232b'; ctx.fillRect(930, 130, 6, 370);
    if (change) { ctx.fillStyle = '#bf493b'; ctx.fillRect(900, 130, tiny ? 2 : 90, tiny ? 2 : 370); }
    if (expression) {
      ctx.fillStyle = '#e8e5de'; ctx.beginPath(); ctx.arc(960, 280, 110, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = '#15191d';
      for (const x of [920, 990]) { ctx.beginPath(); ctx.ellipse(x, 260, 12, change ? 30 : 8, 0, 0, 2 * Math.PI); ctx.fill(); }
      ctx.beginPath(); ctx.ellipse(958, 320, 24, change ? 40 : 8, 0, 0, 2 * Math.PI); ctx.fill();
    }
    fs.writeFileSync(path.join(dir, file), c.toBuffer('image/png'));
  };
  art('before.png'); art('after.png', {change: true});
  const hook = makeB4Opening({setup: 'WOULD YOU', payoff: 'OPEN IT?', before: 'before.png', after: 'after.png', meaning: 'Synthetic door opens; not a story-quality test'});
  const project = {version: 1, style: 'B4', width: 640, height: 360, fps: 15,
    voice: {path: 'tone.wav', ...BRIAN}, captions: [{start: 0, end: 3, text: 'Synthetic timing fixture.'}],
    opening: hook.opening, shots: [hook.shot], ambience: [{path: 'tone.wav', start: 0, end: 3, gain: .02}], sfx: [], dialogue: [], audio_cuts: []};
  const file = path.join(dir, 'project.json'), write = () => save(file, project); write();
  const check = async () => { const p = loadProject(file); return checkB4OpeningPaint(p, {draw: await painter(p), picture: await painter(p, {pictureOnly: true})}); };
  return {dir, file, project, write, art, check, layer: id => project.shots[0].layers.find(l => l.id === id)};
}

test('B4 rejects missing choreography, simultaneous title and missing emphasis', t => {
  const f = fixture(t), original = structuredClone(f.project);
  delete f.project.opening; f.write(); assert.throws(() => loadProject(f.file), /choreography is missing/);
  Object.assign(f.project, structuredClone(original)); f.layer('hook-payoff').from = 0; f.write();
  assert.throws(() => loadProject(f.file), /setup first/);
  Object.assign(f.project, structuredClone(original)); f.layer('hook-payoff').keys = []; f.write();
  assert.throws(() => loadProject(f.file), /visible emphasis/);
  Object.assign(f.project, structuredClone(original)); f.layer('hook-after').keys = []; f.write();
  assert.throws(() => loadProject(f.file), /animated local reveal/);
  Object.assign(f.project, structuredClone(original)); f.write();
  assert.throws(() => loadProject(f.file, {seconds: 1}), /complete opening/);
});

test('B4 locks rounded typography, colors, hierarchy and the whole-block settle', t => {
  const f = fixture(t), original = structuredClone(f.project);
  for (const mutate of [
    () => { f.project.opening.preset = 'default'; },
    () => { delete f.layer('hook-setup').b4Hook; },
    () => { f.layer('hook-payoff').fontFamily = 'Noto Sans'; },
    () => { f.layer('hook-payoff').color = '#ffffff'; },
    () => { f.layer('hook-payoff').size = 62; },
    () => { f.layer('hook-payoff').keys[0].scaleY = 1; },
    () => { f.layer('hook-setup').text = '死亡'; },
  ]) {
    Object.assign(f.project, structuredClone(original)); mutate(); f.write();
    assert.throws(() => loadProject(f.file), /fixed|bundled rounded|covered/);
  }
  Object.assign(f.project, structuredClone(original)); f.write();
  assert.ok(loadProject(f.file).inputs.some(i => i.sha256 === B4_HOOK.font_sha256 && i.path.endsWith('/Nunito.ttf')));
});

test('B4 rejects static renamed assets, camera drift, flash-only and offscreen states', t => {
  const f = fixture(t), original = structuredClone(f.project);
  fs.copyFileSync(path.join(f.dir, 'before.png'), path.join(f.dir, 'renamed.png'));
  f.layer('hook-after').path = 'renamed.png'; f.write(); assert.throws(() => loadProject(f.file), /artwork is identical/);
  Object.assign(f.project, structuredClone(original)); f.layer('hook-after').keys = [{t: 0, x: 0}, {t: 2, x: 40}]; f.write();
  assert.throws(() => loadProject(f.file), /pan\/shake\/flash/);
  Object.assign(f.project, structuredClone(original)); f.layer('hook-after').from = 2.8; f.layer('hook-before').to = 2.8; f.write();
  assert.throws(() => loadProject(f.file), /at least .5s hold/);
  Object.assign(f.project, structuredClone(original)); f.layer('hook-after').x = 5000; f.layer('hook-before').x = 5000; f.write();
  // Geometry alone can be authored offscreen, but the pixel test must reject it.
  return assert.rejects(f.check, /does not visibly change/);
});

test('B4 pixel gate rejects metadata-only, tiny, globally changed and hidden picture action', async t => {
  const f = fixture(t);
  f.art('after.png');
  // PNG metadata can differ without changing even one pixel.
  fs.appendFileSync(path.join(f.dir, 'after.png'), Buffer.from('different metadata'));
  f.write(); await assert.rejects(f.check, /does not visibly change/);
  f.art('after.png', {change: true, tiny: true}); await assert.rejects(f.check, /does not visibly change/);
  f.art('after.png', {change: true, global: true}); await assert.rejects(f.check, /not localized/);
  f.art('after.png', {change: true});
  f.project.shots[0].layers.push({type: 'image', path: 'before.png', x: 0, y: 0, w: 1280, h: 720}); f.write();
  await assert.rejects(f.check, /does not visibly change|obscured/);
});

test('B4 accepts visible, held environment or expression change without limbs', async t => {
  const f = fixture(t), initialHash = hashFile(path.join(f.dir, 'tone.wav'));
  assert.equal((await f.check()).status, 'paint_diagnostic_pass');
  f.art('before.png', {expression: true}); f.art('after.png', {expression: true, change: true});
  assert.equal((await f.check()).status, 'paint_diagnostic_pass');
  assert.equal(hashFile(path.join(f.dir, 'tone.wav')), initialHash);
});

test('B4 helper preserves exact approved copy and writes without overwriting', t => {
  const f = fixture(t), input = path.join(f.dir, 'recipe.json'), output = path.join(f.dir, 'layers.json');
  save(input, {setup: 'What if', payoff: 'you saw death coming?', before: 'before.png', after: 'after.png', meaning: 'Approved reveal'});
  const cmd = () => spawnSync(process.execPath, [path.join(ROOT, 'scripts/b4-opening.mjs'), input, output], {encoding: 'utf8'});
  assert.equal(cmd().status, 0);
  assert.equal(JSON.parse(fs.readFileSync(output)).shot.layers.find(l => l.id === 'hook-payoff').text, 'you saw death coming?');
  assert.notEqual(cmd().status, 0);
});

test('B4 encoded checks reject missing picture motion and wrong title timing, even with edited evidence', async t => {
  const f = fixture(t), p = loadProject(f.file), painters = {draw: await painter(p), picture: await painter(p, {pictureOnly: true})};
  const still = path.join(f.dir, 'static.mp4'), png = path.join(f.dir, 'still.png');
  fs.writeFileSync(png, painters.draw(.1).toBuffer('image/png'));
  run(FFMPEG, ['-v', 'error', '-loop', '1', '-i', png, '-i', path.join(f.dir, 'tone.wav'), '-t', '3', '-r', '15', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-y', still]);
  await assert.rejects(() => checkB4OpeningFile(p, still, painters), /exported .* frame/);
  const r = command(['preview', f.file, '--seconds', '3']); assert.equal(r.status, 0, r.stderr);
  const rp = path.join(f.dir, 'output/preview-report.json'), report = JSON.parse(fs.readFileSync(rp));
  assert.equal(report.opening_visual.status, 'diagnostic_pass');
  // Replace the MP4 and forge its report hash; approve must recheck actual frames.
  fs.copyFileSync(still, report.output); report.output_sha256 = hashFile(still); report.opening_visual.output_sha256 = report.output_sha256; save(rp, report);
  const approval = command(['approve', f.file, '--note', 'Synthetic negative fixture']);
  assert.notEqual(approval.status, 0); assert.match(approval.stderr, /exported .* frame/);
  // Wrong title timing while the picture states remain animated also fails.
  const wrong = structuredClone(p); wrong.shots[0].layers.find(l => l.id === 'hook-payoff').from = 0;
  const wrongDraw = await painter(wrong), samples = path.join(f.dir, 'wrong-%02d.png');
  for (let i = 0; i < 45; i++) fs.writeFileSync(samples.replace('%02d', String(i).padStart(2, '0')), wrongDraw(i / 15).toBuffer('image/png'));
  const mistimed = path.join(f.dir, 'mistimed.mp4');
  run(FFMPEG, ['-v', 'error', '-framerate', '15', '-i', samples, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-y', mistimed]);
  await assert.rejects(() => checkB4OpeningFile(p, mistimed, painters), /exported setup frame/);
  // Correct picture change and text timing, but stripped emphasis or a default
  // font in the exported pixels, must not be certified by valid source keys.
  for (const kind of ['frozen', 'default-font', 'static-switch']) {
    const altered = structuredClone(p);
    if (kind === 'static-switch') altered.shots[0].layers.find(l => l.id === 'hook-after').keys = [];
    for (const l of altered.shots[0].layers) if (l.b4Hook) {
      if (kind === 'frozen') l.keys = [];
      else if (kind === 'default-font') delete l.b4Hook;
    }
    const alteredDraw = await painter(altered), input = path.join(f.dir, `${kind}-%02d.png`), output = path.join(f.dir, `${kind}.mp4`);
    for (let i = 0; i < 45; i++) fs.writeFileSync(input.replace('%02d', String(i).padStart(2, '0')), alteredDraw(i / 15).toBuffer('image/png'));
    run(FFMPEG, ['-v', 'error', '-framerate', '15', '-i', input, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-y', output]);
    await assert.rejects(() => checkB4OpeningFile(p, output, painters), /exported .*frame|exported payoff settle|exported picture transition/);
  }
});

test('B4 checks actual title visibility/overflow and preserves native portrait proportions', async t => {
  const f = fixture(t), original = structuredClone(f.project);
  f.project.shots[0].layers.push({type: 'image', path: 'before.png', x: 0, y: 0, w: 650, h: 720}); f.write();
  await assert.rejects(f.check, /title\/emphasis/);
  Object.assign(f.project, structuredClone(original)); f.layer('hook-setup').text = 'THIS APPROVED GROUP IS MUCH TOO LONG TO FIT IN THE LEFT BLOCK'; f.write();
  await assert.rejects(f.check, /overlap or overflow/);
  Object.assign(f.project, structuredClone(original));
  const hook = makeB4Opening({setup: 'WOULD YOU', payoff: 'OPEN IT?', before: 'before.png', after: 'after.png', meaning: 'Synthetic portrait test', width: 360, height: 640, region: {x: 800, y: 900, w: 350, h: 500}});
  f.project.width = 360; f.project.height = 640; f.project.opening = hook.opening; f.project.shots = [hook.shot]; f.write();
  assert.equal((await f.check()).status, 'paint_diagnostic_pass');
});

test('B4 explicit visual exception is reported, not falsely certified as a motion pass', async t => {
  const f = fixture(t); f.project.opening = {user_override: 'Synthetic explicit user choice: static memorial opening'}; f.write();
  const report = await f.check();
  assert.equal(report.status, 'user_exception'); assert.match(report.reason, /static memorial/);
  // A visual exception never grants an audio exception.
  f.project.voice.lead = .3; f.project.shots[0].end = 3.3; f.project.shots[0].kind = 'exceptional_hold';
  f.project.shots[0].reason = 'Synthetic fixture'; f.project.shots[0].user_approval = 'Synthetic fixture'; f.write();
  assert.throws(() => loadProject(f.file), /silent title pad/);
});
