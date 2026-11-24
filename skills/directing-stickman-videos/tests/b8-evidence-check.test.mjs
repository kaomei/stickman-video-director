import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {validateB8Evidence} from '../scripts/check-b8-evidence.mjs';

const hash = value => crypto.createHash('sha256').update(value).digest('hex');
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b8-evidence-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  fs.writeFileSync(path.join(dir, 'film.bin'), 'synthetic test media, not a playable/aesthetic proof');
  fs.writeFileSync(path.join(dir, 'scene.py'), 'synthetic source');
  const media = {path: 'film.bin', sha256: hash(fs.readFileSync(path.join(dir, 'film.bin')))};
  const manifest = {schema_version: 1, style: 'B8', duration_s: 4, fps: 30, media,
    sources: [{path: 'scene.py', sha256: hash('synthetic source')}],
    shots: [{id: 's1', start: 0, end: 2}, {id: 's2', start: 2, end: 4}].map(shot => ({...shot,
      intent: 'Reveal the choice', camera: 'Finite push then hold', performance: 'Gaze changes',
      secondary: 'Cloud clears the goal', continuity: 'Feet remain planted',
      sound: 'Quiet score beneath dialogue', reference: 'approved direction'})),
    captions: {script_text: 'What would you choose? A kingdom without dawn.',
      cues: [{start: 0, end: 1.5, text: 'WHAT would you choose…'}, {start: 2, end: 3.8, text: 'A kingdom without dawn.'}]}};
  const qa = {schema_version: 1, checked_media_sha256: media.sha256,
    checks: {actual_project_probe: true, encoded_fullspan_check: true},
    acceptance: {visual: 'pending', listening: 'pending', user: 'pending'}};
  const manifestPath = path.join(dir, 'manifest.json'), qaPath = path.join(dir, 'qa.json');
  function save({bind = true} = {}) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    if (bind) qa.manifest_sha256 = hash(fs.readFileSync(manifestPath));
    fs.writeFileSync(qaPath, JSON.stringify(qa, null, 2));
  }
  save();
  return {dir, manifest, qa, manifestPath, qaPath, save,
    check: options => validateB8Evidence(manifestPath, qaPath, options)};
}

test('fresh whole-film evidence passes only as technical integrity, not acceptance', t => {
  const f = fixture(t), result = f.check();
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.technicalOnly, true);
  assert.equal(result.acceptance.user, 'pending');
  assert.match(result.scope, /not creative or listening acceptance/);
});
test('changed source invalidates prior QA even if saved booleans remain true', t => {
  const f = fixture(t);
  fs.appendFileSync(path.join(f.dir, 'scene.py'), '\nchanged dependency');
  assert.match(f.check().errors.join('\n'), /sources\[0\] SHA-256 mismatch/);
});
test('changed encoded media cannot reuse prior QA', t => {
  const f = fixture(t);
  fs.appendFileSync(path.join(f.dir, 'film.bin'), 'changed encoded bytes');
  assert.match(f.check().errors.join('\n'), /media SHA-256 mismatch/);
  assert.match(f.check().errors.join('\n'), /not bound to the current encoded media/);
});
test('editing a manifest without re-running bound QA makes it stale', t => {
  const f = fixture(t);
  f.manifest.shots[0].intent = 'A changed creative plan'; f.save({bind: false});
  assert.match(f.check().errors.join('\n'), /QA is stale/);
});
test('every current shot requires all seven direction fields', t => {
  const f = fixture(t);
  delete f.manifest.shots[1].secondary; f.save();
  assert.match(f.check().errors.join('\n'), /shots\[1\].secondary is required/);
});
for (const start of [1.9, 2.1]) test(`shot gap/overlap at ${start} is rejected`, t => {
  const f = fixture(t); f.manifest.shots[1].start = start; f.save();
  assert.match(f.check().errors.join('\n'), /coverage gap\/overlap/);
});
test('a ledger that ends early is not whole-film evidence', t => {
  const f = fixture(t); f.manifest.shots[1].end = 3.9; f.save();
  assert.match(f.check().errors.join('\n'), /must end at duration_s/);
});
test('omitted opening caption cannot hide behind a matching body-caption list', t => {
  const f = fixture(t); f.manifest.captions.cues.shift(); f.save();
  assert.match(f.check().errors.join('\n'), /does not exactly cover the spoken script/);
});
test('caption truncation and overlap are rejected', t => {
  const f = fixture(t);
  f.manifest.captions.cues[1] = {start: 1.4, end: 3.8, text: 'A kingdom without'}; f.save();
  assert.match(f.check().errors.join('\n'), /overlaps or is out of order/);
  assert.match(f.check().errors.join('\n'), /does not exactly cover the spoken script/);
});
test('missing/duplicate dependencies and non-boolean QA checks fail', t => {
  const f = fixture(t);
  f.manifest.sources.push({...f.manifest.sources[0]}, {path: 'missing.png', sha256: hash('none')});
  f.qa.checks.actual_project_probe = 'true'; f.save();
  const errors = f.check().errors.join('\n');
  assert.match(errors, /duplicates/); assert.match(errors, /cannot be checked/); assert.match(errors, /strictly true/);
});
test('pending acceptance blocks an acceptance-required gate; accepted records can pass', t => {
  const f = fixture(t);
  assert.equal(f.check({requireAcceptance: true}).ok, false);
  f.qa.acceptance = {visual: 'accepted', listening: 'accepted', user: 'accepted'}; f.save();
  assert.equal(f.check({requireAcceptance: true}).ok, true);
  assert.equal(f.check({requireAcceptance: true}).technicalOnly, false);
});
test('missing/malformed documents return errors instead of throwing', t => {
  const f = fixture(t);
  assert.equal(validateB8Evidence(path.join(f.dir, 'missing.json'), f.qaPath).ok, false);
  fs.writeFileSync(f.qaPath, '{not json');
  assert.equal(f.check().ok, false);
  fs.writeFileSync(f.qaPath, 'null');
  assert.equal(f.check().ok, false);
});
test('CLI reports a technical pass and returns nonzero for missing acceptance', t => {
  const f = fixture(t);
  const cli = fileURLToPath(new URL('../scripts/check-b8-evidence.mjs', import.meta.url));
  const args = [cli, '--manifest', f.manifestPath, '--qa', f.qaPath];
  const pass = spawnSync(process.execPath, args, {encoding: 'utf8'});
  assert.equal(pass.status, 0, pass.stderr); assert.equal(JSON.parse(pass.stdout).technicalOnly, true);
  assert.equal(spawnSync(process.execPath, [...args, '--require-acceptance']).status, 2);
  assert.equal(spawnSync(process.execPath, [cli, '--bogus']).status, 1);
});
