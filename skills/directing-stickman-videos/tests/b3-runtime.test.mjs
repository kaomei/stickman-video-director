import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT, FFMPEG, run, save, loadProject, hashFile} from '../scripts/autopilot-core.mjs';
import {painter, render} from '../scripts/autopilot-render.mjs';
import {validateB3} from '../scripts/b3-graphics.mjs';

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stickman-b3-test-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  run(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=310:duration=0.85', '-y', path.join(dir, 'voice.wav')]);
  const project = {version: 1, style: 'B3', width: 640, height: 360, fps: 12,
    television: {enabled: false}, voice: {path: 'voice.wav'},
    ambience: [{path: 'voice.wav', start: 0, end: .85, gain: .01}], // Offline synthetic bed only.
    captions: [{start: 0.1, end: 0.75, text: 'A local interaction.'}],
    shots: [{start: 0, end: 0.85, layers: [
      {type: 'group', x: 100, y: 100, alpha: 0.5, children: [
        {type: 'rect', w: 80, h: 80, fill: '#ffffff', keys: [{t: 0, x: 0}, {t: 0.4, x: 100}]},
        {type: 'ellipse', x: 240, y: 0, w: 80, h: 80, fill: '#b8bcc1'}]},
      {type: 'path', x: 500, y: 200, fill: 'none', stroke: '#ffffff', lineWidth: 8,
        commands: [['M', 0, 0], ['Q', 60, -80, 120, 0], ['C', 130, 20, 150, 20, 160, 0]]}
    ]}], sfx: [{time: 0.2, kind: 'tap', gain: 0.02}]};
  const file = path.join(dir, 'project.json'); save(file, project);
  return {dir, project, file};
}
const pixel = (canvas, x, y) => [...canvas.getContext('2d').getImageData(x, y, 1, 1).data];

test('B3 draws independent group-local motion, inherited alpha and foreground occlusion', async t => {
  const f = fixture(t); let draw = await painter(loadProject(f.file));
  assert.deepEqual(pixel(draw(0), 5, 5), [17, 19, 22, 255]);
  const first = pixel(draw(0), 60, 60);
  assert.ok(first[0] > 120 && first[0] < 150, 'Parent alpha must be inherited, not overwritten');
  assert.deepEqual(pixel(draw(0.4), 60, 60), [17, 19, 22, 255]);
  assert.deepEqual(pixel(draw(0.4), 110, 60), first, 'Child moves in its own group coordinates');
  f.project.shots[0].layers.push({type: 'rect', x: 200, y: 100, w: 80, h: 80, fill: '#303236'});
  save(f.file, f.project); draw = await painter(loadProject(f.file));
  assert.deepEqual(pixel(draw(0.4), 110, 60), [48, 50, 54, 255], 'Later foreground layer hides the moving subject');
});

test('B3 pivots/scales without stretching the untouched subject', async t => {
  const f = fixture(t);
  f.project.shots[0].layers = [{type: 'group', x: 200, y: 120, pivotX: 40, pivotY: 40, angle: Math.PI,
    children: [{type: 'rect', w: 40, h: 40, fill: '#ffffff'}]}];
  save(f.file, f.project); const draw = await painter(loadProject(f.file));
  assert.deepEqual(pixel(draw(0), 130, 90), [255, 255, 255, 255]);
  assert.deepEqual(pixel(draw(0), 110, 70), [17, 19, 22, 255]);
});

test('B3 treatment changes the scene but leaves clean caption pixels unchanged', async t => {
  const f = fixture(t); f.project.shots[0].layers.push({type: 'rect', x: 400, y: 200, w: 100, h: 100, fill: '#ffffff'});
  save(f.file, f.project); const clean = await painter(loadProject(f.file));
  const a = Buffer.from(clean(0.3).data());
  f.project.television = {enabled: true, intensity: 0.8}; save(f.file, f.project);
  const treated = await painter(loadProject(f.file)); const b = Buffer.from(treated(0.3).data());
  assert.notDeepEqual(a, b);
  let ink = 0;
  for (let y = 319; y < 341; y++) for (let x = 170; x < 470; x++) {
    const i = (y * 640 + x) * 4;
    if (a[i] === 244 && a[i + 1] === 245) { ink++; assert.deepEqual(b.subarray(i, i + 4), a.subarray(i, i + 4)); }
  }
  assert.ok(ink > 50, 'White caption ink is composited after television treatment');
});

test('B3 validates bounded declarative artwork and rejects cross-style leakage', t => {
  const f = fixture(t); assert.equal(loadProject(f.file).style, 'B3');
  for (const layer of [
    {type: 'path', commands: [['M', 0, 0], ['eval', 'process.exit()']]},
    {type: 'path', commands: [['M', 0, 0], ['C', 2, 3]]},
    {type: 'rect', w: 0, h: 80}, {type: 'ellipse', w: 20, h: 20, scaleX: -1},
    {type: 'rect', w: 10, h: 20, fill: 'url(https://example.com)'},
    {type: 'rect', w: 10, h: 20, fill: '#abcde'},
    {type: 'group', children: []}, {type: 'ellipse', w: 10, h: 20, alpha: 2}
  ]) assert.throws(() => validateB3([layer]));
  let nested = {type: 'ellipse', w: 10, h: 10};
  for (let i = 0; i < 10; i++) nested = {type: 'group', children: [nested]};
  assert.throws(() => validateB3([nested]), /nesting/);
  for (const style of ['B1', 'B2']) {
    f.project.style = style; f.project.television = {enabled: false}; save(f.file, f.project); assert.throws(() => loadProject(f.file), /Television finish/);
    delete f.project.television; save(f.file, f.project); assert.throws(() => loadProject(f.file), /Unknown layer/);
  }
});

test('B3 nested future images do not block preview, but do block full validation', async t => {
  const f = fixture(t);
  f.project.shots[0].layers[0].children.push({type: 'image', path: 'unfinished.png', from: 0.5, w: 100});
  save(f.file, f.project);
  assert.equal(loadProject(f.file, {seconds: 0.4}).shots[0].layers[0].children.length, 2);
  assert.throws(() => loadProject(f.file), /unfinished.png/);
  const result = await render(loadProject(f.file, {seconds: 0.4}), {seconds: 0.4});
  assert.equal(result.full_decode, 'pass');
});

test('B3 nested media and finish changes invalidate cache; original audio remains intact', async t => {
  const f = fixture(t); const image = path.join(f.dir, 'nested.png');
  fs.copyFileSync(path.join(ROOT, 'assets/b1/calendar-crayon.png'), image);
  f.project.shots[0].layers[0].children.push({type: 'image', path: 'nested.png', x: 500, w: 100});
  save(f.file, f.project); const voice = hashFile(path.join(f.dir, 'voice.wav'));
  const first = await render(loadProject(f.file));
  assert.equal((await render(loadProject(f.file), {replace: true})).cache_hits, 1);
  fs.copyFileSync(path.join(ROOT, 'assets/b1/idea-bulb-crayon.png'), image);
  assert.equal((await render(loadProject(f.file), {replace: true})).cache_hits, 0);
  f.project.television = {enabled: true, intensity: 0.4}; save(f.file, f.project);
  const finish = await render(loadProject(f.file), {replace: true});
  assert.equal(finish.cache_hits, 0); assert.notEqual(finish.output_sha256, first.output_sha256);
  assert.equal(finish.original_voice_sha256, voice); assert.equal(hashFile(path.join(f.dir, 'voice.wav')), voice);
});

test('B3 CLI creates an explicit non-overwriting B3 scaffold', t => {
  const f = fixture(t), destination = path.join(f.dir, 'new-project');
  const cmd = () => spawnSync(process.execPath, [path.join(ROOT, 'scripts/autopilot.mjs'), 'init', destination, '--style', 'B3'], {encoding: 'utf8'});
  const result = cmd(); assert.equal(result.status, 0, result.stderr);
  const scaffold = JSON.parse(fs.readFileSync(path.join(destination, 'project.json')));
  assert.equal(scaffold.style, 'B3'); assert.equal(scaffold.television.enabled, true);
  assert.notEqual(cmd().status, 0); assert.deepEqual(JSON.parse(fs.readFileSync(path.join(destination, 'project.json'))), scaffold);
});
