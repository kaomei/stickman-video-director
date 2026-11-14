// Synthetic scope/fingerprint checks only; no visual or user approval is inferred.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {FFMPEG, run, save, loadProject} from '../scripts/autopilot-core.mjs';
import {BRIAN} from '../scripts/b4-runtime.mjs';
import {planB4Typography} from '../scripts/b4-typography-review.mjs';
import {createCanvas} from '@napi-rs/canvas';

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b4-typography-scope-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  run(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=6', '-y', path.join(dir, 'voice.wav')]);
  fs.writeFileSync(path.join(dir, 'current.png'), createCanvas(64, 64).toBuffer('image/png'));
  const moment = (id, shot, layer_ids, start, end) => ({id, shot, layer_ids,
    region: {x: 50, y: 50, w: 1100, h: 450}, times: {entry: start, mid: start + .25, settled: start + .5, hold: end - .1},
    intent: 'Synthetic scope check', treatment: 'Synthetic local text treatment'});
  const p = {version: 1, style: 'B4', width: 640, height: 360, fps: 15,
    voice: {path: 'voice.wav', contains_sfx: true, ...BRIAN},
    opening: {user_override: 'Synthetic scope test only; no actual creative approval'},
    shots: [{id: 'current-shot', start: 0, end: 3, layers: [
      {id: 'current-title', type: 'text', text: 'CURRENT'},
      {id: 'current-image', type: 'image', path: 'current.png', x: 800, y: 100, w: 200, keys: [{t: 0, x: 800}, {t: .5, x: 900}]},
      {id: 'late-title', type: 'text', text: 'LATER', from: 2},
      {id: 'late-board', type: 'image', path: 'unproduced-board.png', from: 2}]},
    {id: 'future-shot', start: 3, end: 6, layers: [
      {id: 'future-title', type: 'text', text: 'FUTURE'},
      {id: 'future-board', type: 'image', path: 'unproduced-future.png'}]}],
    captions: [{start: 0, end: 1.5, text: 'Current complete cue.'}, {start: 1.5, end: 3, text: 'Later cue.'}, {start: 3, end: 6, text: 'Future cue.'}],
    picture_motion: {author_id: 'synthetic-author', shots: [
      {shot: 0, kind: 'local_action', intent: 'Synthetic scope plan.', before: 'Prop at the left.', after: 'Prop at the right.', layer_ids: ['current-image'], region: {x: 780, y: 80, w: 350, h: 250}, times: {before: 0, mid: .25, after: .5, hold: 1.4}},
      {shot: 1, kind: 'state_reveal', intent: 'Future scope plan.', before: 'First future state.', after: 'Second future state.', layer_ids: ['future-board'], region: {x: 100, y: 100, w: 900, h: 450}, times: {before: 3, mid: 3.25, after: 3.5, hold: 4}}]},
    typography: {author_id: 'synthetic-author',
      moments: [moment('current', 0, ['current-title'], 0, 1.5), moment('late', 0, ['late-title', 'late-board'], 2, 3), moment('future', 'future-shot', ['future-title', 'future-board'], 3, 6)],
      image_text: [{shot: 0, layer_id: 'late-board', text: 'LATER BOARD'}, {shot: 'future-shot', layer_id: 'future-board', text: 'FUTURE BOARD'}],
      caption_groups: [0, 1, 2].map(i => ({...moment('cue-group-' + i, 0, [], [0, 1.5, 3][i], [1.5, 3, 6][i]), cue_indices: [i]}))}};
  const file = path.join(dir, 'project.json'), write = () => save(file, p); write();
  return {p, file, write};
}

test('B4 preview fingerprints scope future text plans and unproduced image text by actual source timing', t => {
  const f = fixture(t), first = loadProject(f.file, {seconds: 1.5});
  assert.equal(first.picture_motion.shots.length, 1);
  assert.deepEqual(first.typography.moments.map(m => m.id), ['current']);
  assert.deepEqual(first.typography.image_text, []);
  assert.deepEqual(first.typography.caption_groups.map(g => g.id), ['cue-group-0']);
  f.p.shots[0].layers.find(l => l.id === 'late-title').text = 'Revised later title';
  f.p.shots[0].layers.find(l => l.id === 'late-board').path = 'changed-unproduced-board.png';
  f.p.shots[1].layers[0].text = 'Revised future title';
  for (const m of f.p.typography.moments.slice(1)) m.treatment = 'Revised future treatment';
  for (const image of f.p.typography.image_text) image.text = 'REVISED FUTURE BOARD';
  for (const group of f.p.typography.caption_groups.slice(1)) group.treatment = 'Revised future caption treatment';
  f.write();
  assert.equal(loadProject(f.file, {seconds: 1.5}).fingerprint, first.fingerprint);
  assert.throws(() => loadProject(f.file), /changed-unproduced-board/);
  f.p.typography.moments[0].treatment = 'Changed current treatment'; f.write();
  assert.notEqual(loadProject(f.file, {seconds: 1.5}).fingerprint, first.fingerprint);
  f.p.typography.moments[0].treatment = first.typography.moments[0].treatment;
  f.p.typography.author_id = 'changed-author'; f.write();
  assert.notEqual(loadProject(f.file, {seconds: 1.5}).fingerprint, first.fingerprint);
});

test('B4 preview does not silently discard misspelled current image-text references', t => {
  const f = fixture(t);
  f.p.typography.image_text.push({shot: 'misspelled-current-shot', layer_id: 'missing-board', text: 'Must remain invalid'}); f.write();
  assert.throws(() => loadProject(f.file, {seconds: 1.5}), /current shot/);
});

test('B4 preview retains current physical marking coverage, scopes known future states, and still rejects unknown sources', t => {
  const f=fixture(t),marking={id:'machine-number',shot:0,layer_ids:['current-image','late-board'],role:'environment_marking',text:'7',
    classification_reason:'Physical machine identifier, separate from any title, rule or warning.',
    region:{x:780,y:80,w:350,h:250},times:{entry:0,mid:.25,settled:.5,hold:1.4}};
  f.p.typography.image_text.push(marking,{...marking,id:'future-machine-number',layer_ids:['late-board']});f.write();
  const preview=loadProject(f.file,{seconds:1.5});
  assert.deepEqual(preview.typography.image_text.map(x=>[x.id,x.layer_ids]),[['machine-number',['current-image']]]);
  assert.equal(planB4Typography(preview).registry.find(x=>x.id==='machine-number').kind,'environment_marking');
  const old=preview.fingerprint;marking.text='8';f.write();
  assert.notEqual(loadProject(f.file,{seconds:1.5}).fingerprint,old,'current marking text remains fingerprint-bound');
  marking.layer_ids.push('misspelled-image');f.write();
  assert.throws(()=>loadProject(f.file,{seconds:1.5}),/actual image layer/);
});
