import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const skill = fileURLToPath(new URL('../', import.meta.url));
const pack = path.join(skill, 'assets/b3');
const manifest = JSON.parse(fs.readFileSync(path.join(pack, 'reference-manifest.json'), 'utf8'));
const media = [...manifest.references, ...manifest.motion, ...manifest.boards,
  ...manifest.supplements.flatMap(item => [item, item.motion])];

function inside(root, relative) {
  assert.equal(typeof relative, 'string');
  assert.ok(!path.isAbsolute(relative) && !relative.includes('://'));
  const resolved = path.resolve(root, relative);
  assert.ok(resolved.startsWith(path.resolve(root) + path.sep), `Escaping reference: ${relative}`);
  return resolved;
}

test('B3 keeps original-video authority separate from accepted implementations', () => {
  assert.equal(manifest.style, 'B3');
  assert.equal(manifest.status, 'public_implementation_reference_pack');
  assert.deepEqual(manifest.authority_order,
    ['explicit_user_choices', 'primary_original_reference', 'secondary_accepted_implementation']);
  assert.equal(manifest.source.filename, '电视风.mp4');
  assert.equal(manifest.source.sha256, '4bdb5d828dac75bc1e4b3dc50bf099d732ac10f86c92b585f488f434e6db355d');
  assert.equal(manifest.source.bundled, false);
  assert.deepEqual(manifest.references, []);
  assert.deepEqual(manifest.motion, []);
  assert.ok(manifest.supplements.length);
  assert.ok(!fs.readdirSync(pack).some(f => /^source-|^motion-/.test(f)), 'Uncleared original media stay private');
  for (const item of [...manifest.references, ...manifest.motion]) {
    assert.equal(item.authority, 'primary_original_reference');
    const start = item.source_time_seconds ?? item.source_start_seconds;
    assert.ok(start >= 0 && (item.source_end_seconds ?? start) < manifest.source.duration_seconds);
  }
  for (const item of manifest.supplements) {
    assert.equal(item.authority, 'secondary_accepted_implementation');
    assert.notEqual(item.source_sha256, manifest.source.sha256);
  }
});

test('B3 all bundled media match their provenance fingerprints', () => {
  assert.equal(new Set(media.map(item => item.path)).size, media.length);
  for (const item of media) {
    const file = inside(pack, item.path);
    assert.ok(fs.statSync(file).isFile());
    assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'), item.sha256, item.path);
    assert.ok(item.width > 0 && item.height > 0);
  }
});

test('B3 motion studies retain timing and dimensions, decode fully, and contain no borrowed soundtrack', () => {
  for (const item of [...manifest.motion, ...manifest.supplements.map(entry => entry.motion)]) {
    const file = inside(pack, item.path);
    const probe = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], {encoding: 'utf8'});
    assert.equal(probe.status, 0, probe.stderr || probe.error?.message);
    const info = JSON.parse(probe.stdout);
    assert.equal(info.streams.length, 1);
    assert.equal(info.streams[0].codec_type, 'video');
    assert.equal(info.streams[0].width, item.width);
    assert.equal(info.streams[0].height, item.height);
    assert.equal(info.streams[0].r_frame_rate, item.frame_rate);
    assert.ok(Math.abs(Number(info.format.duration) - item.duration_seconds) < 0.04);
    assert.ok(Math.abs(item.duration_seconds - (item.source_end_seconds - item.source_start_seconds)) < 0.04);
    const decode = spawnSync('ffmpeg', ['-v', 'error', '-nostdin', '-i', file, '-f', 'null', '-'], {encoding: 'utf8'});
    assert.equal(decode.status, 0, decode.stderr || decode.error?.message);
    assert.equal(decode.stderr, '');
  }
});

test('B3 reference pack and guide remain usable after relocation without the Desktop source', t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'b3-reference-relocation-'));
  t.after(() => fs.rmSync(temporary, {recursive: true, force: true}));
  const movedPack = path.join(temporary, 'assets/b3');
  fs.cpSync(pack, movedPack, {recursive: true});
  fs.cpSync(path.join(skill, 'references'), path.join(temporary, 'references'), {recursive: true});
  for (const item of media) assert.ok(fs.statSync(inside(movedPack, item.path)).isFile());
  const guide = path.resolve(movedPack, manifest.guide);
  assert.ok(guide.startsWith(temporary + path.sep));
  assert.ok(fs.statSync(guide).isFile());
  const text = fs.readFileSync(guide, 'utf8');
  assert.ok(!text.includes('/Users/'));
  for (const [, link] of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (link.includes('://')) continue;
    const target = path.resolve(path.dirname(guide), link.split('#')[0]);
    assert.ok(target.startsWith(temporary + path.sep));
    assert.ok(fs.statSync(target).isFile(), link);
  }
});
