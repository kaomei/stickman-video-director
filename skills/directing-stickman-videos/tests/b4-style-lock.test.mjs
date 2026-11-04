import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync, spawnSync} from 'node:child_process';
import {verifyB4StyleLock} from '../scripts/b4-style-lock.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const expectedReferences = [
  ['motor-room', 'reference-01-motor-room.png', '23a4dd6c5d1141bfddacd381525a1d96e82be81b070b2d63acbc58d7a8fe13fa'],
  ['rooftop', 'reference-02-rooftop.png', 'ad1cfb7b30d9e1aa44130760781dce91c29febf4e2688a8362b9b5443466ffeb'],
  ['driver', 'reference-03-driver.png', '364a80b28843e14b55addd3114aed9c113d91a56885d8cd25d46fc964a90fb9e'],
  ['street', 'reference-04-street.png', '5167ca2b1d904481feb0d6b8590c85c6a5e223dc8e9bca6943d6baf98dbff2d4'],
  ['opposite-rooftop', 'reference-05-opposite-rooftop.png', '80a33dd11c830525e475ef8d1ffb62c5fd47131b14af01edf59dd1137ff71769'],
];
const fixture = t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'b4-install-test-'));
  const installed = path.join(temporary, 'skills/directing-stickman-videos');
  fs.cpSync(root, installed, {recursive: true, filter: source => !source.split(path.sep).includes('node_modules')});
  t.after(() => fs.rmSync(temporary, {recursive: true, force: true}));
  return installed;
};
const manifestPath = installed => path.join(installed, 'assets/b4/approved-style.json');
const changeManifest = (installed, change) => {
  const file = manifestPath(installed);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  change(data);
  fs.writeFileSync(file, JSON.stringify(data));
};

test('B4 package carries all five revised white-glove artworks, prompt and honest readiness', () => {
  const result = verifyB4StyleLock();
  assert.equal(result.style, 'B4');
  assert.equal(result.version, '2026-10-31-v3-white-glove-40s');
  assert.deepEqual(result.references.map(item => [item.id, path.basename(item.path), item.sha256]), expectedReferences);
  assert.equal(result.resource_integrity, 'pass');
  assert.equal(result.cli_supported, true);
  assert.match(result.sample_review, /Historical white-glove remake snapshot/);
  assert.match(result.sample_review, /Public Dispatch and Death Clock examples were subsequently accepted/);
  const manifest = JSON.parse(fs.readFileSync(manifestPath(root), 'utf8'));
  assert.equal(manifest.status, 'published_white_glove_reference_pack');
  assert.equal(manifest.publication.accepted_showcases.length, 2);
  assert.match(manifest.publication.execution, /shared B4 manifest\/CLI/);
  for (const item of manifest.references) assert.deepEqual([item.width, item.height], [1672, 941]);
  assert.equal(fs.existsSync(path.join(root, 'assets/b4/approved-style.png')), false);
});

test('complete Skill folder works at a relocated install path without source workspace', t => {
  const installed = fixture(t);
  const output = execFileSync(process.execPath, [path.join(installed, 'scripts/b4-style-lock.mjs')], {cwd: os.tmpdir(), encoding: 'utf8'});
  const result = JSON.parse(output);
  assert.equal(result.resource_integrity, 'pass');
  assert.deepEqual(result.references.map(item => [item.id, path.basename(item.path), item.sha256]), expectedReferences);
  const installedRealPath = fs.realpathSync(installed);
  for (const item of result.references) assert.ok(item.path.startsWith(installedRealPath + path.sep));
  assert.ok(result.prompt.path.startsWith(installedRealPath + path.sep));
  assert.equal(result.cli_supported, true);
});

for (const [id, filename] of expectedReferences) {
  test(`missing ${id} fails instead of silently dropping a reference`, t => {
    const installed = fixture(t);
    fs.unlinkSync(path.join(installed, 'assets/b4', filename));
    assert.throws(() => verifyB4StyleLock(installed), /ENOENT/);
  });
  test(`changed ${id} fails even when the PNG remains readable`, t => {
    const installed = fixture(t);
    fs.appendFileSync(path.join(installed, 'assets/b4', filename), 'changed');
    assert.throws(() => verifyB4StyleLock(installed), /reference fingerprint mismatch/);
  });
}

test('missing or duplicated manifest members cannot replace the complete source set', t => {
  const installed = fixture(t);
  changeManifest(installed, data => { data.references[3] = data.references[0]; });
  assert.throws(() => verifyB4StyleLock(installed), /all five distinct/);
});

test('changed prompt fails so the visual contract cannot drift unnoticed', t => {
  const installed = fixture(t);
  fs.appendFileSync(path.join(installed, 'assets/b4/style-lock.txt'), '\nPhotorealistic 3D.');
  assert.throws(() => verifyB4StyleLock(installed), /prompt fingerprint mismatch/);
});

test('incorrect declared image dimensions fail', t => {
  const installed = fixture(t);
  changeManifest(installed, data => { data.references[2].width = 1920; });
  assert.throws(() => verifyB4StyleLock(installed), /dimensions\/signature mismatch/);
});

test('resource symlink cannot depend on assets outside the installed Skill', t => {
  const installed = fixture(t);
  const target = path.join(installed, 'assets/b4', expectedReferences[3][1]);
  fs.unlinkSync(target);
  fs.symlinkSync(path.join(root, 'assets/b4', expectedReferences[3][1]), target);
  assert.throws(() => verifyB4StyleLock(installed), /escapes installed Skill/);
});

test('another style cannot masquerade as the B4 manifest', t => {
  const installed = fixture(t);
  changeManifest(installed, data => { data.style = 'B3'; });
  assert.throws(() => verifyB4StyleLock(installed), /Invalid B4 style-lock manifest/);
});

test('B4 entrypoint and guide reach packaged resources through portable links', () => {
  const skill = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');
  const guideFile = path.join(root, 'references/b4-survival-storytelling.md');
  const guide = fs.readFileSync(guideFile, 'utf8');
  assert.ok(skill.includes('(references/b4-survival-storytelling.md)'));
  for (const [content, base] of [[guide, path.dirname(guideFile)], [fs.readFileSync(manifestPath(root), 'utf8'), path.dirname(manifestPath(root))]]) {
    assert.ok(!content.includes('/Users/') && !content.includes('/var/folders/'));
    for (const match of content.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
      assert.ok(!path.isAbsolute(match[1]));
      assert.ok(fs.statSync(path.resolve(base, match[1])).isFile());
    }
  }
});

test('relocated CLI initializes B4 with Brian and its independent audio buses', t => {
  const installed = fixture(t);
  const project = path.join(path.dirname(installed), 'b4-project');
  const result = spawnSync(process.execPath, [path.join(installed, 'scripts/autopilot.mjs'), 'init', project, '--style', 'B4'], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  const data = JSON.parse(fs.readFileSync(path.join(project, 'project.json'), 'utf8'));
  assert.equal(data.style, 'B4');
  assert.deepEqual(data.voice, {path: 'narration.wav', lead: 0, tail: 0, name: 'Brian', id: 'nPczCjzI2devNBz1zQrb'});
  for (const bus of ['ambience', 'dialogue', 'audio_cuts']) assert.deepEqual(data[bus], []);
  const duplicate = spawnSync(process.execPath, [path.join(installed, 'scripts/autopilot.mjs'), 'init', project, '--style', 'B4'], {encoding: 'utf8'});
  assert.notEqual(duplicate.status, 0);
  assert.match(duplicate.stderr, /will not overwrite/);
});
