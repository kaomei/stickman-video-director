import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {validateB8CharacterContract, characterDigest} from '../scripts/check-b8-character-contract.mjs';
const hash = x => crypto.createHash('sha256').update(x).digest('hex');
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b8-character-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  fs.writeFileSync(path.join(dir, 'ref.bin'), 'synthetic reference');
  fs.writeFileSync(path.join(dir, 'pose.bin'), 'synthetic pose');
  const character = {id: 'king', reference_id: 'master', regions: {
    forearm: {color: 'dark brown', material: 'line limb', outline: 'brown ink', connection: 'elbow to white palm'},
    robe: {color: 'cream', material: 'cloth', outline: 'brown ink', connection: 'same gold hem and sleeve'}}};
  const asset = {id: 'reach', path: 'pose.bin', sha256: hash('synthetic pose'), character_id: 'king', pose: 'seated reach', visible_regions: ['forearm', 'robe']};
  asset.review = {status: 'accepted', asset_sha256: asset.sha256, contract_sha256: characterDigest(character),
    reviewer: 'synthetic fixture only', reviewed_at: '2026-11-12T09:00:00Z', evidence: 'fixture, not a visual proof',
    notes: 'Fixture tests integrity only', regions: {forearm: 'accepted', robe: 'accepted'}};
  const manifest = {schema_version: 1, style: 'B8', references: [{id: 'master', path: 'ref.bin', sha256: hash('synthetic reference')}], characters: [character], assets: [asset]};
  const filename = path.join(dir, 'manifest.json');
  const save = () => fs.writeFileSync(filename, JSON.stringify(manifest)); save();
  return {dir, filename, manifest, asset, character, save, check: () => validateB8CharacterContract(filename)};
}
test('fresh per-region review passes integrity only', t => {
  const f = fixture(t), result = f.check(); assert.equal(result.ok, true, result.errors.join('\n'));
  assert.match(result.scope, /does not recognize/);
});
test('mutating pose bytes invalidates accepted review', t => {
  const f = fixture(t); fs.appendFileSync(path.join(f.dir, 'pose.bin'), 'white arm introduced');
  assert.match(f.check().errors.join('\n'), /SHA-256 mismatch/);
});
test('changing region contract requires new visual review', t => {
  const f = fixture(t); f.character.regions.forearm.color = 'white'; f.save();
  assert.match(f.check().errors.join('\n'), /Stale review/);
});
for (const status of ['pending', 'rejected', true]) test(`review ${status} cannot pass`, t => {
  const f = fixture(t); f.asset.review.status = status; f.save(); assert.equal(f.check().ok, false);
});
test('one failed or unreviewed visible part blocks animation', t => {
  const f = fixture(t); f.asset.review.regions.forearm = 'rejected'; f.save();
  assert.match(f.check().errors.join('\n'), /forearm not accepted/);
  delete f.asset.review.regions.forearm; f.save(); assert.equal(f.check().ok, false);
});
test('unknown region, character, reference and missing contract fields fail', t => {
  const f = fixture(t); f.asset.visible_regions.push('glove'); f.character.reference_id = 'missing';
  delete f.character.regions.robe.connection; f.save(); assert.equal(f.check().ok, false);
  f.asset.character_id = 'other'; f.save(); assert.equal(f.check().ok, false);
});
test('missing files and duplicate ids fail closed', t => {
  const f = fixture(t); f.manifest.assets.push({...f.asset, path: 'missing'}); f.save();
  assert.equal(f.check().ok, false);
});
test('malformed inputs and CLI failures are bounded', t => {
  const f = fixture(t); fs.writeFileSync(f.filename, 'null'); assert.equal(f.check().ok, false);
  fs.writeFileSync(f.filename, '{'); assert.equal(f.check().ok, false);
  const cli = fileURLToPath(new URL('../scripts/check-b8-character-contract.mjs', import.meta.url));
  assert.equal(spawnSync(process.execPath, [cli, '--manifest', f.filename]).status, 2);
  assert.equal(spawnSync(process.execPath, [cli, '--bogus']).status, 1);
});
