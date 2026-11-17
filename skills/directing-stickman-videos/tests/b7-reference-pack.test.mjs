import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

const skill = fileURLToPath(new URL('../', import.meta.url));
const pack = path.join(skill, 'assets/b7');
const manifest = JSON.parse(fs.readFileSync(path.join(pack, 'reference-manifest.json'), 'utf8'));
const media = [...manifest.images, ...manifest.motion, ...manifest.approved_media,
  manifest.portrait_layout_reference, ...manifest.portrait_evidence_images];

function inside(root, relative) {
  assert.equal(typeof relative, 'string');
  assert.ok(!path.isAbsolute(relative) && !relative.includes('://'));
  const resolved = path.resolve(root, relative);
  assert.ok(resolved.startsWith(path.resolve(root) + path.sep), `Escaping reference: ${relative}`);
  return resolved;
}

test('B7 records approved original evidence, without fixing its example voice or song as defaults', () => {
  assert.equal(manifest.style, 'B7');
  assert.equal(manifest.schema_version, 2);
  assert.equal(manifest.status, 'approved_reference_pack');
  assert.deepEqual(manifest.validated_formats, ['16:9']);
  assert.equal(manifest.reference_usage.finished_reference_only, true);
  assert.equal(manifest.reference_usage.not_new_story_output, true);
  assert.equal(manifest.reference_usage.no_reusable_voice_or_music_stems, true);
  assert.equal(manifest.source_film.sha256, '8581ffb74cadda06888a66431711052a6decb93bc3ca9711c1c144aded281dea');
  assert.deepEqual(manifest.source_film.logical_canvas, [320, 180]);
  assert.equal(manifest.example_not_default.narrator, 'Brian');
  assert.ok(manifest.example_not_default.music);
  assert.equal(manifest.images.length, 2);
  assert.equal(manifest.motion.length, 3);
  assert.equal(manifest.approved_media.length, 2);
  assert.ok(manifest.limitations.some(item => item.includes('No B7 manifest/CLI renderer')));
});

test('B7 media fingerprints and actual image dimensions match the portable manifest', () => {
  assert.equal(new Set(media.map(item => item.path)).size, media.length);
  for (const item of media) {
    const file = inside(pack, item.path);
    const bytes = fs.readFileSync(file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, item.path);
    if (file.endsWith('.png')) {
      assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
      assert.equal(bytes.readUInt32BE(16), item.width);
      assert.equal(bytes.readUInt32BE(20), item.height);
    }
  }
});

test('B7 ships the sample-derived primitives with explicit dependencies and capability boundaries', () => {
  const implementation = manifest.implementation;
  const script = path.resolve(pack, implementation.path);
  assert.ok(script.startsWith(skill));
  assert.equal(createHash('sha256').update(fs.readFileSync(script)).digest('hex'), implementation.sha256);
  assert.deepEqual(implementation.requirements, ['Python >=3.9', 'Pillow >=9.1']);
  assert.ok(implementation.not_included.includes('Walk-cycle timing'));
  assert.ok(implementation.not_included.includes('Shared story/audio event engine'));
  assert.ok(fs.statSync(path.resolve(pack, implementation.tests)).isFile());
});

test('B7 pixel and contact behavior tests pass without the original project', () => {
  const run = spawnSync('python3', [path.resolve(pack, manifest.implementation.tests)], {
    cwd: skill, encoding: 'utf8', env: {...process.env, PYTHONPATH: '', PYTHONDONTWRITEBYTECODE: '1'}, timeout: 60000,
  });
  assert.equal(run.status, 0, run.stderr || run.error?.message);
  assert.match(run.stderr, /Ran 28 tests/);
  assert.match(run.stderr, /OK/);
});

test('B7 accepted V11 ending ships executable shared glyph/audio timing, not only prose', () => {
  const entry = manifest.ending_implementation;
  const script = path.resolve(pack, entry.path);
  assert.ok(script.startsWith(skill));
  assert.equal(createHash('sha256').update(fs.readFileSync(script)).digest('hex'), entry.sha256);
  assert.equal(manifest.accepted_benchmark.sha256, '5aa572a5efc3855ec0455523664c0c23bd5e9d8a6337c04ed53869c40e50ae90');
  assert.equal(manifest.accepted_benchmark.media_bundled, true);
  assert.equal(manifest.accepted_paths.sha256, 'ef34ef602d97502ae295b91d282afe5eea3f69c4ee88855832c7a11e7bb482d8');
  const run = spawnSync('python3', [path.resolve(pack, entry.tests)], {
    cwd: skill, encoding: 'utf8', env: {...process.env, PYTHONPATH: '', PYTHONDONTWRITEBYTECODE: '1'}, timeout: 60000,
  });
  assert.equal(run.status, 0, run.stderr || run.error?.message);
  assert.match(run.stderr, /Ran 9 tests/);
  assert.match(run.stderr, /OK/);
});

test('B7 historical motion excerpts decode, keep source-range timing, and remain silent', () => {
  for (const item of manifest.motion) {
    const file = inside(pack, item.path);
    const probe = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], {encoding: 'utf8'});
    assert.equal(probe.status, 0, probe.stderr || probe.error?.message);
    const info = JSON.parse(probe.stdout);
    assert.equal(info.streams.length, 1);
    const video = info.streams[0];
    assert.equal(video.codec_type, 'video');
    assert.equal(video.width, item.width);
    assert.equal(video.height, item.height);
    assert.equal(video.r_frame_rate, item.frame_rate);
    assert.equal(item.audio, false);
    assert.ok(Math.abs(Number(info.format.duration) - item.duration_seconds) < 0.01);
    assert.ok(Math.abs(item.duration_seconds - (item.source_end_seconds - item.source_start_seconds)) < 0.05);
    const decode = spawnSync('ffmpeg', ['-v', 'error', '-nostdin', '-i', file, '-f', 'null', '-'], {encoding: 'utf8'});
    assert.equal(decode.status, 0, decode.stderr || decode.error?.message);
    assert.equal(decode.stderr, '');
  }
});

test('B7 complete accepted V6/V11 references retain actual picture, audio and source identity', () => {
  const accepted = [manifest.accepted_paths, manifest.accepted_benchmark];
  for (const item of manifest.approved_media) {
    const recorded = accepted.find(entry => entry.path === item.path);
    assert.ok(recorded, item.path);
    assert.equal(item.sha256, recorded.sha256);
    assert.equal(item.source_sha256, item.sha256, 'Complete films must retain accepted source bytes');
    assert.equal(item.accepted_date, recorded.accepted_date);
    assert.equal(item.credit, recorded.credit);
    assert.equal(item.source_range_seconds[0], 0);
    assert.ok(Math.abs(item.source_range_seconds[1] - item.duration_seconds) < 0.01);
    assert.ok(fs.statSync(inside(pack, item.credit)).isFile());
    const file = inside(pack, item.path);
    const probe = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], {
      encoding: 'utf8', timeout: 60000,
    });
    assert.equal(probe.status, 0, probe.stderr || probe.error?.message);
    const info = JSON.parse(probe.stdout);
    const video = info.streams.filter(stream => stream.codec_type === 'video');
    const audio = info.streams.filter(stream => stream.codec_type === 'audio');
    assert.equal(video.length, 1);
    assert.equal(audio.length, 1, 'Latest complete benchmarks must retain their accepted mixed sound');
    assert.equal(item.audio, true);
    assert.equal(video[0].width, item.width);
    assert.equal(video[0].height, item.height);
    assert.equal(video[0].r_frame_rate, item.frame_rate);
    assert.equal(video[0].width / video[0].height, 16 / 9);
    assert.ok(Math.abs(Number(info.format.duration) - item.duration_seconds) < 0.01);
    // Preserve variable-rate input during decoding; forcing a fractional-rate CFR null output
    // can create duplicate output DTS although the accepted source decodes correctly.
    const decode = spawnSync('ffmpeg', ['-v', 'error', '-xerror', '-nostdin', '-i', file, '-fps_mode', 'vfr', '-f', 'null', '-'], {
      encoding: 'utf8', timeout: 60000,
    });
    assert.equal(decode.status, 0, decode.stderr || decode.error?.message);
    assert.equal(decode.stderr, '');
  }
});

function checkLinks(document, boundary) {
  const content = fs.readFileSync(document, 'utf8');
  assert.ok(!content.includes('/Users/'), document);
  for (const [, link] of content.matchAll(/\]\(([^)]+)\)/g)) {
    if (link.includes('://')) continue;
    const target = path.resolve(path.dirname(document), link.split('#')[0]);
    assert.ok(target.startsWith(path.resolve(boundary) + path.sep), link);
    assert.ok(fs.statSync(target).isFile(), link);
  }
}

test('B7 attribution and reference indexes retain portable links and recorded fingerprints', () => {
  assert.equal(manifest.text_assets.length, 8);
  const credits = fs.readFileSync(inside(pack, manifest.reference_usage.attribution), 'utf8');
  assert.match(credits, /Eric Skiff/);
  assert.match(credits, /Kevin MacLeod/);
  assert.match(credits, /https:\/\/ericskiff\.com\/music\//);
  assert.match(credits, /https:\/\/incompetech\.com\/music\/royalty-free\/index\.html\?isrc=USUAN1100787/);
  assert.match(credits, /https:\/\/creativecommons\.org\/licenses\/by\/4\.0\//);
  for (const item of manifest.text_assets) {
    const file = inside(pack, item.path);
    assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'), item.sha256, item.path);
    if (file.endsWith('.md')) checkLinks(file, skill);
  }
  assert.ok(fs.statSync(inside(pack, manifest.reference_usage.reference_index)).isFile());
});

test('B7 accepted portrait is the exact ten-second v3 layout, with separate full-film acceptance', () => {
  const item = manifest.portrait_layout_reference;
  assert.equal(item.sha256, 'b0aa0e97c3b74dbccc79b8cde042efaf25e98e98273e78a55be7485524345a8b');
  assert.equal(item.full_portrait_film_approved, false);
  assert.deepEqual(manifest.validated_formats, ['16:9']);
  const record = JSON.parse(fs.readFileSync(inside(pack, item.record), 'utf8'));
  assert.equal(record.sha256, item.sha256);
  assert.equal(record.accepted_date, '2026-11-13');
  assert.equal(record.full_portrait_film_approved, false);
  assert.equal(record.width, record.logical_canvas[0] * record.integer_scale);
  assert.equal(record.height, record.logical_canvas[1] * record.integer_scale);
  assert.equal(record.resampling, 'nearest-neighbor');
  const file = inside(pack, item.path);
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], {encoding: 'utf8'});
  assert.equal(probe.status, 0, probe.stderr || probe.error?.message);
  const info = JSON.parse(probe.stdout);
  const video = info.streams.find(s => s.codec_type === 'video');
  assert.equal(video.width, 1080);
  assert.equal(video.height, 1920);
  assert.equal(video.r_frame_rate, '24/1');
  assert.ok(info.streams.some(s => s.codec_type === 'audio'));
  assert.equal(Number(info.format.duration), 10);
  const decode = spawnSync('ffmpeg', ['-v', 'error', '-xerror', '-nostdin', '-i', file, '-f', 'null', '-'], {encoding: 'utf8', timeout: 60000});
  assert.equal(decode.status, 0, decode.stderr || decode.error?.message);
  assert.equal(decode.stderr, '');
});

test('B7 portrait captions reproduce measured shadow bounds at the original bitmap font size', () => {
  const item = manifest.portrait_layout_reference;
  const ledger = inside(pack, item.captions);
  // Measure actual drawn pixels through the bundled renderer, rather than trusting
  // a recorded width or a word-count heuristic. This verifies this exact reference,
  // not narration alignment or visual approval of a future story.
  const script = `import json,sys\nfrom PIL import Image\nsys.path.insert(0,sys.argv[1])\nfrom b7_pixel_primitives import draw_caption\np=json.load(open(sys.argv[2]))\nprevious=0\nfor c in p['cues']:\n assert c['start'] >= previous and c['end'] > c['start'] and c['end'] <= 10\n previous=c['end']\n image=Image.new('RGB',(180,320))\n box=draw_caption(image,c['text'],y=264,margin=32)\n mask=image.getbbox()\n assert mask == (box[0],box[1],box[0]+box[2],box[1]+box[3])\n assert box[2] == c['drawn_width'] and box[2] <= .65*180\n assert box[0] == c['left_margin'] and 180-mask[2] == c['right_margin']\n assert c['bounds'] == dict(zip(('left','top','right','bottom'),mask))\nassert max(c['drawn_width'] for c in p['cues']) == 110\nassert p['cues'][1]['text'] == 'fast-forward button'\nprint(len(p['cues']))\n`;
  const run = spawnSync('python3', ['-c', script, path.join(skill, 'scripts'), ledger], {
    encoding: 'utf8', env: {...process.env, PYTHONDONTWRITEBYTECODE: '1'}, timeout: 60000,
  });
  assert.equal(run.status, 0, run.stderr || run.error?.message);
  assert.equal(run.stdout.trim(), '11');
});

test('B7 guide and evidence remain usable after relocation without another chat or Desktop source', t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'b7-reference-relocation-'));
  t.after(() => fs.rmSync(temporary, {recursive: true, force: true}));
  const movedPack = path.join(temporary, 'assets/b7');
  fs.cpSync(pack, movedPack, {recursive: true});
  fs.cpSync(path.join(skill, 'references'), path.join(temporary, 'references'), {recursive: true});
  for (const relative of [manifest.implementation.path, manifest.implementation.tests,
      manifest.ending_implementation.path, manifest.ending_implementation.tests]) {
    const target = path.resolve(movedPack, relative);
    assert.ok(target.startsWith(temporary + path.sep));
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.copyFileSync(path.resolve(pack, relative), target);
  }
  for (const item of media) assert.ok(fs.statSync(inside(movedPack, item.path)).isFile());
  const guide = path.resolve(movedPack, manifest.guide);
  assert.ok(guide.startsWith(temporary + path.sep));
  checkLinks(guide, temporary);
  for (const item of manifest.text_assets) {
    const file = inside(movedPack, item.path);
    assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'), item.sha256);
    if (file.endsWith('.md')) checkLinks(file, temporary);
  }
  const env = {...process.env, PYTHONPATH: '', PYTHONDONTWRITEBYTECODE: '1'};
  const calibration = path.join(temporary, 'calibration.png');
  const run = spawnSync('python3', [path.resolve(movedPack, manifest.implementation.path), '--calibration', calibration], {
    cwd: temporary, encoding: 'utf8', env, timeout: 60000,
  });
  assert.equal(run.status, 0, run.stderr || run.error?.message);
  const png = fs.readFileSync(calibration);
  assert.equal(png.readUInt32BE(16), 960);
  assert.equal(png.readUInt32BE(20), 540);
  const behavior = spawnSync('python3', [path.resolve(movedPack, manifest.implementation.tests)], {
    cwd: temporary, encoding: 'utf8', env, timeout: 60000,
  });
  assert.equal(behavior.status, 0, behavior.stderr || behavior.error?.message);
  assert.match(behavior.stderr, /Ran 28 tests/);
  const ending = spawnSync('python3', [path.resolve(movedPack, manifest.ending_implementation.tests)], {
    cwd: temporary, encoding: 'utf8', env, timeout: 60000,
  });
  assert.equal(ending.status, 0, ending.stderr || ending.error?.message);
  assert.match(ending.stderr, /Ran 9 tests/);
});
