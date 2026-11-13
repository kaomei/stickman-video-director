import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {ROOT, loadProject} from '../scripts/autopilot-core.mjs';
import {walkLayers} from '../scripts/b3-graphics.mjs';

// Free local tone and a bundled prop exercise project loading and prefix
// boundaries only. They do not establish story quality or visual approval.
function tone(file) {
  const rate = 16000, samples = 3 * rate, bytes = Buffer.alloc(44 + samples * 2);
  bytes.write('RIFF'); bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write('WAVEfmt ', 8); bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(rate, 24); bytes.writeUInt32LE(rate * 2, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36); bytes.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) bytes.writeInt16LE(Math.round(900 * Math.sin(2 * Math.PI * 310 * i / rate)), 44 + i * 2);
  fs.writeFileSync(file, bytes);
}

function fixture(t, style, {groupReference = false} = {}) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'b-portrait-scope-')));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  tone(path.join(dir, 'tone.wav'));
  fs.copyFileSync(path.join(ROOT, 'assets/b1/idea-bulb-crayon.png'), path.join(dir, 'future-prop.png'));
  const initial = {id: 'early-actor', type: 'image', path: '@b1/idea-bulb-crayon.png', x: 300, y: 500, w: 200,
    motion: {role: 'prop', reason: 'Local prop movement exercises the complete three-second fixture.'},
    keys: [{t: 0, x: 300}, {t: 3, x: 400}]};
  const late = {id: 'late-prop', type: 'image', path: 'future-prop.png', from: 1.5, x: 700, y: 1000, w: 150};
  const background = {id: 'future-background', type: 'image', path: '@b1/idea-bulb-crayon.png', from: 1.5, x: 100, y: 300, w: 100};
  const members = style === 'B3' ? [{id: 'native-group', type: 'group', children: [initial, late]}] : [initial, late];
  const regions = [
    {id: 'shared-region', role: 'prop', layer_ids: groupReference ? ['native-group'] : ['early-actor', 'late-prop'],
      region: {x: 200, y: 400, w: 750, h: 1100},
      intent: 'Keep the early prop and its later counterpart in one native tall composition.'},
    {id: 'future-only-region', role: 'prop', layer_ids: ['late-prop'],
      region: {x: 650, y: 950, w: 300, h: 550},
      intent: 'Reserve the lower stage for the prop that enters after the requested prefix.'},
  ];
  const project = {version: 1, style, width: 360, height: 640, fps: 12,
    voice: {path: 'tone.wav'}, captions: [{start: 0, end: 1.5, text: 'Before the reveal.'}, {start: 1.5, end: 3, text: 'The prop appears.'}],
    ambience: [{path: 'tone.wav', start: 0, end: 3, gain: .01}], sfx: [],
    shots: [{id: 'native-opening', start: 0, end: 3, layers: [...members, background],
      portrait: {intent: 'Frame the props vertically with an independent readable caption band.', background_ids: ['future-background'], regions}}]};
  const file = path.join(dir, 'project.json');
  const write = () => fs.writeFileSync(file, JSON.stringify(project));
  write();
  return {dir, file, project, late, write};
}

const ids = project => [...walkLayers(project.shots[0].layers)].map(layer => layer.id);
const hasFutureProp = (inputs, dir, api = path) => inputs.some(input => input.path === api.join(dir, 'future-prop.png'));

test('Portrait future-input assertion detects present and absent files on Windows and POSIX', () => {
  for (const [api, dir] of [[path.win32, 'C:\\project'], [path.posix, '/project']]) {
    const expected = api.join(dir, 'future-prop.png');
    assert.equal(hasFutureProp([], dir, api), false);
    assert.equal(hasFutureProp([{path: api.join(dir, 'early-prop.png')}], dir, api), false);
    assert.equal(hasFutureProp([{path: expected}], dir, api), true);
    assert.equal(hasFutureProp([{path: api.join(dir, 'other', 'future-prop.png')}], dir, api), false);
  }
});

for (const [name, style, options] of [
  ['B1 flat', 'B1', {}],
  ['B3 nested child references', 'B3', {}],
  ['B3 group reference', 'B3', {groupReference: true}],
]) {
  test(`${name}: one-second loading scopes future layers, region members and backgrounds together`, t => {
    const f = fixture(t, style, options), original = fs.readFileSync(f.file, 'utf8');
    const prefix = loadProject(f.file, {seconds: 1}), shot = prefix.shots[0];
    assert.equal(prefix.rangeEnd, 1);
    assert.deepEqual(ids(prefix), style === 'B3' ? ['native-group', 'early-actor'] : ['early-actor']);
    assert.deepEqual(shot.portrait.background_ids, []);
    assert.deepEqual(shot.portrait.regions.map(region => region.id), ['shared-region'], 'A future-only region must disappear from the prefix');
    assert.deepEqual(shot.portrait.regions[0].layer_ids, options.groupReference ? ['native-group'] : ['early-actor']);
    assert.ok(!hasFutureProp(prefix.inputs, f.dir), 'Prefix loading must not read the future-only image');
    const full = loadProject(f.file);
    assert.equal(full.rangeEnd, 3);
    assert.ok(ids(full).includes('late-prop'));
    assert.ok(ids(full).includes('future-background'));
    assert.deepEqual(full.shots[0].portrait, f.project.shots[0].portrait, 'Full loading must preserve every authored region and member');
    assert.ok(hasFutureProp(full.inputs, f.dir));
    assert.equal(fs.readFileSync(f.file, 'utf8'), original, 'Scoped loading must leave the authored source unchanged');
  });
}

for (const style of ['B1', 'B3']) {
  test(`${style}: missing future artwork permits the prefix but rejects the complete project`, t => {
    const f = fixture(t, style);
    fs.unlinkSync(path.join(f.dir, 'future-prop.png'));
    assert.doesNotThrow(() => loadProject(f.file, {seconds: 1}));
    assert.throws(() => loadProject(f.file), error => error.code === 'ENOENT' && /future-prop\.png/.test(error.message));
  });

  for (const typo of ['shared-member', 'future-only-member', 'background']) {
    test(`${style}: an unknown ${typo} ID is rejected rather than hidden by prefix scoping`, t => {
      const f = fixture(t, style), native = f.project.shots[0].portrait;
      if (typo === 'shared-member') native.regions[0].layer_ids.push('late-propp');
      else if (typo === 'future-only-member') native.regions[1].layer_ids = ['late-propp'];
      else native.background_ids.push('future-backgrounnd');
      f.write();
      const message = typo === 'background' ? /background_ids must name distinct actual scene-background layers/ : /must reference actual non-background layers/;
      assert.throws(() => loadProject(f.file, {seconds: 1}), message);
      assert.throws(() => loadProject(f.file), message);
    });
  }
}
