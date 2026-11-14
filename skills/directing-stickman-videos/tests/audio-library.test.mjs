import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {loadLibrary, selectAssets, exportAssets, verifyLibrary, portablePath, recommendAssets} from '../scripts/audio-library.mjs';

const cli = fileURLToPath(new URL('../scripts/audio-library.mjs', import.meta.url));
const digest = data => createHash('sha256').update(data).digest('hex');
test('bundled source snapshots contain no website access tokens', () => {
  const root = fileURLToPath(new URL('../assets/b-audio-library/', import.meta.url));
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));
  for (const item of catalog.evidence_files) {
    const content = fs.readFileSync(path.join(root, item.path), 'utf8');
    assert.doesNotMatch(content, /\b(?:sk|pk)\.eyJ[A-Za-z0-9_.-]+/, item.path);
    assert.doesNotMatch(content, /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|AKIA[0-9A-Z]{16})\b/, item.path);
  }
});
function wav(seed) {
  const size = 200, header = Buffer.alloc(44), audio = Buffer.alloc(size * 2);
  header.write('RIFF'); header.writeUInt32LE(36 + audio.length, 4); header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(8000, 24); header.writeUInt32LE(16000, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(audio.length, 40);
  for (let i = 0; i < size; i++) audio.writeInt16LE(Math.round(1000 * Math.sin(i * (seed + 1) / 37)), i * 2);
  return Buffer.concat([header, audio]);
}
function fixture(t, sounds = 2) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'B audio 测试 '));
  t.after(() => fs.rmSync(base, {recursive: true, force: true}));
  const root = path.join(base, 'library 原始');
  fs.mkdirSync(path.join(root, 'audio'), {recursive: true});
  fs.mkdirSync(path.join(root, 'licenses'));
  fs.mkdirSync(path.join(root, 'evidence'));
  fs.writeFileSync(path.join(root, 'licenses', 'CC-BY-4.0.txt'), 'Fixture license text: attribution required.');
  fs.writeFileSync(path.join(root, 'evidence', 'source.md'), 'Fixture official source evidence with redistribution terms.');
  const catalog = {schema_version: 1, assets: [], sources: [{id: 'fixture-source', title: 'Fixture source', author: 'Test Author', source_url: 'https://example.invalid/source', download_url: 'https://example.invalid/source.zip', license_id: 'CC-BY-4.0', evidence_paths: ['evidence/source.md']}]};
  for (let i = 0; i <= sounds; i++) {
    const bytes = wav(i), id = i === sounds ? 'calm-music' : `sound-${i}`;
    const file = `audio/${id}.wav`;
    fs.writeFileSync(path.join(root, file), bytes);
    catalog.assets.push({id, title: i === sounds ? 'Calm backdrop' : `Paper sound ${i}`, kind: i === sounds ? 'music' : i % 2 ? 'transition' : 'sfx', category: i === sounds ? 'calm' : 'paper', tags: i % 2 ? ['short'] : ['short', 'soft'], author: 'Test Author', source_id: 'fixture-source', source_url: 'https://example.invalid/source', path: file, sha256: digest(bytes), original_sha256: digest(bytes), duration: .025, sample_rate: 8000, channels: 1, license: {id: 'CC-BY-4.0', url: 'https://creativecommons.org/licenses/by/4.0/', evidence_paths: ['licenses/CC-BY-4.0.txt'], attribution_required: true, attribution: 'Test Author — Fixture source, CC BY 4.0', commercial_use: true, redistribution: true, modifications_allowed: true}, modifications: [], verified_at: '2026-11-14'});
  }
  const save = () => fs.writeFileSync(path.join(root, 'catalog.json'), JSON.stringify(catalog, null, 2));
  save();
  return {base, root, catalog, save, out: path.join(base, 'project 新目录', 'audio library')};
}
function run(f, args, options = {}) {
  const result = spawnSync(process.execPath, [cli, ...args, '--library', f.root], {encoding: 'utf8', ...options});
  return {...result, json: result.status === 0 && result.stdout.startsWith('{') || result.status === 0 && result.stdout.startsWith('[') ? JSON.parse(result.stdout) : null};
}

test('list/search apply kind, category, tag and limit without network or npm', t => {
  const f = fixture(t);
  const result = run(f, ['list', '--kind', 'sfx', '--category', 'paper', '--tag', 'soft', '--limit', '1', '--json']);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.json.map(asset => asset.id), ['sound-0']);
  assert.deepEqual(run(f, ['search', 'calm', 'backdrop', '--json']).json.map(asset => asset.id), ['calm-music']);
  assert.equal(selectAssets(loadLibrary(f.root), {limit: 0}).length, 0);
  assert.match(run(f, ['list', '--limit', '-1']).stderr, /nonnegative/);
  assert.match(run(f, ['list', '--kind', 'unknown']).stderr, /Unknown kind/);
  assert.match(run(f, ['list', '--probe']).stderr, /not valid/);
});

test('export copies only selected audio, source evidence, license and actual credits with portable hashes', t => {
  const f = fixture(t);
  const result = run(f, ['export', '--ids', 'sound-0,calm-music,sound-0', '--out', f.out, '--json']);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.json.selected, ['sound-0', 'calm-music']);
  const manifest = JSON.parse(fs.readFileSync(result.json.manifest));
  assert.deepEqual(manifest.assets.map(asset => asset.id), ['sound-0', 'calm-music']);
  assert.equal(fs.existsSync(path.join(f.out, 'audio/sound-1.wav')), false);
  assert.ok(fs.readFileSync(path.join(f.out, 'CREDITS.md'), 'utf8').includes('Required credit: Test Author'));
  assert.ok(fs.readFileSync(path.join(f.out, 'licenses/CC-BY-4.0.txt'), 'utf8').includes('attribution'));
  assert.ok(fs.existsSync(path.join(f.out, 'evidence/source.md')));
  for (const file of manifest.files) {
    assert.ok(!path.isAbsolute(file.path));
    assert.equal(digest(fs.readFileSync(path.join(f.out, file.path))), file.sha256);
  }
  assert.equal(run(f, ['export', '--ids', 'sound-0,calm-music', '--out', f.out]).status, 0, 'identical export can be resumed');
  // The selected project is standalone after the installed library is removed.
  fs.renameSync(f.root, `${f.root}-removed`);
  for (const file of manifest.files) assert.ok(fs.existsSync(path.join(f.out, file.path)));
});

test('show exposes item-specific license and rejects unknown IDs', t => {
  const f = fixture(t);
  const result = run(f, ['show', 'sound-0']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.json.license.attribution_required, true);
  assert.match(run(f, ['show', 'missing']).stderr, /Unknown audio asset/);
});

test('export refuses corrupted audio, missing evidence and unusable licenses before copying', t => {
  const f = fixture(t);
  fs.appendFileSync(path.join(f.root, 'audio/sound-0.wav'), 'broken');
  assert.throws(() => exportAssets(loadLibrary(f.root), ['sound-0'], f.out), /hash mismatch/);
  assert.equal(fs.existsSync(f.out), false);
  fs.writeFileSync(path.join(f.root, 'audio/sound-0.wav'), wav(0));
  fs.rmSync(path.join(f.root, 'evidence/source.md'));
  assert.throws(() => exportAssets(loadLibrary(f.root), ['sound-0'], f.out), /Missing library file/);
  fs.writeFileSync(path.join(f.root, 'evidence/source.md'), 'evidence');
  f.catalog.assets[0].license.redistribution = false; f.save();
  assert.throws(() => exportAssets(loadLibrary(f.root), ['sound-0'], f.out), /license permissions/);
  assert.equal(fs.existsSync(f.out), false);
});

test('export never overwrites a different existing file and preflights all outputs', t => {
  const f = fixture(t);
  fs.mkdirSync(path.join(f.out, 'audio'), {recursive: true});
  fs.writeFileSync(path.join(f.out, 'audio/calm-music.wav'), 'user recording');
  assert.throws(() => exportAssets(loadLibrary(f.root), ['sound-0', 'calm-music'], f.out), /Refusing to overwrite/);
  assert.equal(fs.existsSync(path.join(f.out, 'audio/sound-0.wav')), false);
  assert.equal(fs.readFileSync(path.join(f.out, 'audio/calm-music.wav'), 'utf8'), 'user recording');
});

test('relative Windows separators work while absolute, traversal and device paths are rejected', t => {
  const f = fixture(t);
  f.catalog.assets[0].path = 'audio\\sound-0.wav';
  f.catalog.assets[0].license.evidence_paths = ['licenses\\CC-BY-4.0.txt'];
  f.catalog.sources[0].evidence_paths = ['evidence\\source.md']; f.save();
  exportAssets(loadLibrary(f.root), ['sound-0'], f.out);
  const manifest = JSON.parse(fs.readFileSync(path.join(f.out, 'audio-selection.json')));
  assert.equal(manifest.assets[0].path, 'audio/sound-0.wav');
  for (const unsafe of ['../outside.wav', 'audio/../../outside', '/tmp/a', 'C:\\a.wav', '\\\\server\\a.wav', 'https://example.invalid/a', 'audio/NUL.wav', 'audio/foo.wav:stream', 'audio/foo.']) assert.throws(() => portablePath(unsafe), /path/i, unsafe);
  assert.throws(() => exportAssets(loadLibrary(f.root), ['sound-0'], path.join(f.root, 'output')), /separate/);
});

test('library and export symlink escapes are rejected', t => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.base, 'outside.wav'), wav(0));
  fs.rmSync(path.join(f.root, 'audio/sound-0.wav'));
  try { fs.symlinkSync(path.join(f.base, 'outside.wav'), path.join(f.root, 'audio/sound-0.wav')); } catch (error) { if (error.code === 'EPERM') return t.skip('symlink not permitted on this Windows host'); throw error; }
  assert.throws(() => exportAssets(loadLibrary(f.root), ['sound-0'], f.out), /Symlink escapes/);
  fs.rmSync(path.join(f.root, 'audio/sound-0.wav')); fs.writeFileSync(path.join(f.root, 'audio/sound-0.wav'), wav(0));
  const other = path.join(f.base, 'other'); fs.mkdirSync(other);
  fs.mkdirSync(f.out, {recursive: true}); fs.symlinkSync(other, path.join(f.out, 'audio'), 'dir');
  assert.throws(() => exportAssets(loadLibrary(f.root), ['sound-0'], f.out), /destination contains a symlink/);
  assert.deepEqual(fs.readdirSync(other), []);
});

test('export resolves parent aliases before checking library separation without rejecting independent projects', t => {
  const f = fixture(t);
  const alias = path.join(f.base, 'parent alias');
  try { fs.symlinkSync(f.root, alias, 'dir'); }
  catch (error) { if (error.code === 'EPERM') return t.skip('symlink not permitted on this Windows host'); throw error; }
  assert.throws(() => exportAssets(loadLibrary(f.root), ['sound-0'], path.join(alias, 'new project', 'audio')), /separate/);
  assert.equal(fs.existsSync(path.join(f.root, 'new project')), false, 'rejection writes nothing inside installed assets');
  fs.rmSync(alias);
  fs.symlinkSync(f.base, alias, 'dir');
  assert.throws(() => exportAssets(loadLibrary(f.root), ['sound-0'], alias), /separate/, 'a resolved library parent is not a separate output');
  const output = path.join(alias, 'independent project', 'nested', 'audio');
  assert.equal(exportAssets(loadLibrary(f.root), ['sound-0'], output).status, 'exported');
  assert.equal(digest(fs.readFileSync(path.join(output, 'audio/sound-0.wav'))), f.catalog.assets[0].sha256);
  assert.equal(exportAssets(loadLibrary(f.root), ['sound-0'], output).status, 'exported', 'existing valid alias-based output remains idempotent');
  // On macOS os.tmpdir() uses the normal /var -> /private/var system alias.
  assert.equal(exportAssets(loadLibrary(f.root), ['sound-1'], path.join(f.base, 'normal temporary project')).status, 'exported');
});

test('full verification counts unique sounds separately from music and stingers', t => {
  const f = fixture(t, 200);
  const result = verifyLibrary(loadLibrary(f.root));
  assert.equal(result.distinct_sounds, 200);
  assert.equal(result.music, 1);
  assert.equal(result.decoding, 'not_requested');
  assert.equal(result.listening, 'not_performed');
  f.catalog.assets[1].kind = 'stinger'; f.save();
  assert.throws(() => verifyLibrary(loadLibrary(f.root)), /at least 200/);
  f.catalog.assets[1].kind = 'transition';
  f.catalog.assets.at(-1).kind = 'sfx'; f.save();
  assert.throws(() => verifyLibrary(loadLibrary(f.root)), /at least one music/);
});

test('transcodes or duplicated file entries cannot inflate unique sound count', t => {
  const f = fixture(t, 200);
  fs.writeFileSync(path.join(f.root, f.catalog.assets[1].path), wav(0));
  f.catalog.assets[1].sha256 = f.catalog.assets[0].sha256; f.save();
  assert.throws(() => verifyLibrary(loadLibrary(f.root)), /found 199/);
});

test('--probe explicitly fails when ffprobe is unavailable instead of claiming decode success', t => {
  const f = fixture(t, 200);
  const result = run(f, ['verify', '--probe', '--ffprobe', path.join(f.base, 'missing-ffprobe')]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ffprobe availability failed/);
});

test('actual probe/decode rejects a hash-consistent malformed audio file', t => {
  if (spawnSync('ffmpeg', ['-version'], {stdio: 'ignore'}).status !== 0 || spawnSync('ffprobe', ['-version'], {stdio: 'ignore'}).status !== 0) return t.skip('ffmpeg/ffprobe unavailable');
  const f = fixture(t, 200);
  const broken = Buffer.from('not an audio file');
  fs.writeFileSync(path.join(f.root, 'audio/sound-0.wav'), broken);
  f.catalog.assets[0].sha256 = digest(broken); f.save();
  assert.throws(() => verifyLibrary(loadLibrary(f.root), {probe: true}), /Audio probe/);
});

test('unused broken recordings do not block selection of valid custom project sounds', t => {
  const f = fixture(t);
  fs.rmSync(path.join(f.root, 'audio/sound-1.wav'));
  assert.equal(exportAssets(loadLibrary(f.root), ['sound-0'], f.out).selected[0], 'sound-0');
  assert.throws(() => verifyLibrary(loadLibrary(f.root)), /Missing library file/);
});

test('evidence fingerprints are verified, selected proof hashes travel, and unreferenced proof is checked by verify', t => {
  const f = fixture(t, 200);
  const paths = ['licenses/CC-BY-4.0.txt', 'evidence/source.md'];
  f.catalog.evidence_files = paths.map(relative => ({path: relative, sha256: digest(fs.readFileSync(path.join(f.root, relative)))}));
  f.save();
  assert.equal(verifyLibrary(loadLibrary(f.root)).status, 'pass');
  exportAssets(loadLibrary(f.root), ['sound-0'], f.out);
  const manifest = JSON.parse(fs.readFileSync(path.join(f.out, 'audio-selection.json')));
  assert.equal(manifest.evidence_files.length, 2);
  for (const proof of manifest.evidence_files) assert.equal(digest(fs.readFileSync(path.join(f.out, proof.path))), proof.sha256);
  fs.appendFileSync(path.join(f.root, 'licenses/CC-BY-4.0.txt'), ' altered');
  assert.throws(() => exportAssets(loadLibrary(f.root), ['sound-0'], path.join(f.base, 'second')), /evidence hash mismatch/i);
  fs.writeFileSync(path.join(f.root, 'licenses/CC-BY-4.0.txt'), 'Fixture license text: attribution required.');
  fs.writeFileSync(path.join(f.root, 'evidence/extra.txt'), 'extra proof');
  f.catalog.evidence_files.push({path: 'evidence/extra.txt', sha256: '0'.repeat(64)}); f.save();
  assert.throws(() => verifyLibrary(loadLibrary(f.root)), /Evidence hash mismatch: evidence\/extra.txt/);
});

test('declared evidence inventory must cover every selected license and source proof', t => {
  const f = fixture(t);
  f.catalog.evidence_files = []; f.save();
  assert.throws(() => exportAssets(loadLibrary(f.root), ['sound-0'], f.out), /evidence hash record missing/);
});

test('catalog itself cannot be an external symlink', t => {
  const f = fixture(t);
  const outside = path.join(f.base, 'outside-catalog.json');
  fs.copyFileSync(path.join(f.root, 'catalog.json'), outside); fs.rmSync(path.join(f.root, 'catalog.json'));
  try { fs.symlinkSync(outside, path.join(f.root, 'catalog.json')); } catch (error) { if (error.code === 'EPERM') return t.skip('symlink not permitted on this Windows host'); throw error; }
  assert.throws(() => loadLibrary(f.root), /Catalog symlink escapes library/);
});


test('recommend is driven by catalog tags/roles, honors per-layer limits, and explains real matches', t => {
  const f = fixture(t, 5);
  f.catalog.assets.at(-1).tags = ['warm', 'calm'];
  f.catalog.assets[0].roles = ['prop-handoff']; f.catalog.assets[0].style_hints = ['B6'];
  f.catalog.assets[2].roles = ['prop-handoff'];
  f.catalog.selection_profiles = {B6: {'prop-handoff': {intent: 'Offer a paper prop with readable contact.', notes: ['Use one motivated cue, not every candidate.'], music: {tags_any: ['warm']}, sfx: {tags_any: ['soft'], tags_all: ['short'], roles_any: ['prop-handoff'], categories: ['paper']}}}};
  f.save();
  const result = run(f, ['recommend', '--style', 'b6', '--beat', 'prop-handoff', '--limit', '1']);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.json.status, 'candidates');
  assert.equal(result.json.profile_origin, 'B6');
  assert.equal(result.json.music.candidates[0].id, 'calm-music');
  assert.deepEqual(result.json.sfx.candidates.map(asset => asset.id), ['sound-0']);
  assert.equal(result.json.sfx.total_matches, 2);
  assert.ok(result.json.sfx.candidates[0].why.some(reason => reason.includes('soft')));
  assert.ok(result.json.sfx.candidates[0].why.some(reason => reason.includes('prop-handoff')));
  assert.ok(result.json.sfx.candidates[0].why.some(reason => reason.includes('B6')));
});

test('exact profile wins without importing shared music; only absent beats fall back to shared configuration', t => {
  const f = fixture(t);
  f.catalog.selection_profiles = {'*': {reaction: {music: {tags_any: ['short']}, sfx: {tags_any: ['short']}}, walk: {music: null, sfx: {tags_any: ['short']}}}, B6: {reaction: {intent: 'Quiet reaction.', music: null, sfx: {tags_any: ['soft']}}}};
  f.save();
  const exact = recommendAssets(loadLibrary(f.root), {style: 'B6', beat: 'reaction'});
  assert.equal(exact.music.status, 'not_requested');
  assert.equal(exact.profile_origin, 'B6');
  const shared = recommendAssets(loadLibrary(f.root), {style: 'B6', beat: 'walk'});
  assert.equal(shared.profile_origin, '*');
  assert.equal(shared.sfx.total_matches, 2);
});

test('missing music reports a gap and keeps useful SFX; no profile reports available beats without blocking list/export', t => {
  const f = fixture(t);
  f.catalog.selection_profiles = {B6: {tension: {music: {tags_any: ['nonexistent-mood']}, sfx: {tags_any: ['soft']}}}}; f.save();
  const partial = recommendAssets(loadLibrary(f.root), {style: 'B6', beat: 'tension'});
  assert.equal(partial.status, 'partial');
  assert.equal(partial.music.status, 'no_match');
  assert.equal(partial.music.candidates.length, 0);
  assert.equal(partial.sfx.candidates.length, 1);
  assert.ok(partial.gaps.some(gap => gap.startsWith('music:')));
  const missing = run(f, ['recommend', '--style', 'B6', '--beat', 'warm']);
  assert.equal(missing.status, 0);
  assert.equal(missing.json.status, 'no_profile');
  assert.deepEqual(missing.json.available_beats, ['tension']);
  assert.equal(run(f, ['list']).status, 0);
  assert.equal(run(f, ['export', '--ids', 'sound-0', '--out', f.out]).status, 0);
});

test('empty selectors and style hints alone never invent coverage; missing layers do not guess a score', t => {
  const f = fixture(t);
  f.catalog.assets[0].style_hints = ['B9'];
  f.catalog.selection_profiles = {B9: {diagram: {music: null, sfx: {}}, reaction: {sfx: {tags_any: ['not-present']}}}}; f.save();
  const empty = recommendAssets(loadLibrary(f.root), {style: 'B9', beat: 'diagram'});
  assert.equal(empty.status, 'no_match');
  assert.equal(empty.sfx.candidates.length, 0);
  const missing = recommendAssets(loadLibrary(f.root), {style: 'B9', beat: 'reaction'});
  assert.equal(missing.status, 'no_match');
  assert.equal(missing.music.status, 'not_configured');
  assert.ok(missing.gaps.some(gap => gap.includes('no default was guessed')));
});

test('recommend defaults to at most three per layer and validates requested style/limits', t => {
  const f = fixture(t, 8);
  f.catalog.selection_profiles = {B1: {diagram: {music: null, sfx: {tags_any: ['short']}}}}; f.save();
  assert.equal(recommendAssets(loadLibrary(f.root), {style: 'B1', beat: 'diagram'}).sfx.candidates.length, 3);
  assert.throws(() => recommendAssets(loadLibrary(f.root), {style: 'B0', beat: 'diagram'}), /B1 through B9/);
  assert.throws(() => recommendAssets(loadLibrary(f.root), {style: 'B1', beat: 'diagram', limit: 0}), /positive integer/);
  assert.equal(run(f, ['recommend', '--style', 'B1', '--beat', 'diagram', '--limit', '2']).json.sfx.candidates.length, 2);
  assert.equal(run(f, ['list', '--style', 'B1']).status, 1);
});


test('recommend omits an unavailable matched recording but retains other usable suggestions', t => {
  const f = fixture(t);
  f.catalog.selection_profiles = {B6: {reaction: {music: null, sfx: {tags_any: ['short']}}}}; f.save();
  fs.appendFileSync(path.join(f.root, 'audio/sound-0.wav'), 'broken');
  const result = recommendAssets(loadLibrary(f.root), {style: 'B6', beat: 'reaction'});
  assert.equal(result.status, 'partial');
  assert.deepEqual(result.sfx.candidates.map(asset => asset.id), ['sound-1']);
  assert.equal(result.sfx.unavailable_assets[0].id, 'sound-0');
  assert.match(result.sfx.unavailable_assets[0].reason, /hash mismatch/);
});
