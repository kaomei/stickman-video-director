import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createB5PngReviewPack, sealB5PngImageFirstRead, validateB5PngPreEncodeReview, b5PngProjectFingerprint} from '../scripts/b5-png-review-gate.mjs';
import {writeSyntheticB5PngReview, fillSyntheticPngFirstRead, fillSyntheticPngPhase2} from './helpers/b5-png-review-fixture.mjs';
import {validateB5Production} from '../scripts/b5-production-quality.mjs';

// These tests use real small PNGs and invented review records for schema checks.
// They never run a media encoder or create an MP4, or claim real visual approval.
const root = fileURLToPath(new URL('..', import.meta.url)), cli = path.join(root, 'scripts/character-explainer.mjs');
const sharp = createRequire(import.meta.url)('sharp');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
async function fixture(t, single = false) {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'b5-png-gate-')));
  t.after(() => fs.rmSync(tmp, {recursive: true, force: true}));
  const dir = path.join(tmp, 'project'), scene = path.join(dir, 'scene'), framesDir = path.join(tmp, 'frames');
  fs.mkdirSync(scene, {recursive: true}); fs.mkdirSync(framesDir);
  const c = {width: 160, height: 90, fps: 10, duration: 2};
  write(path.join(dir, 'project.json'), {style: 'B5', renderer: 'character-explainer-code-v1'}); write(path.join(scene, 'config.json'), c);
  const words = [{text: 'A', start: 0, end: .25}, {text: 'small', start: .3, end: .5}, {text: 'dog', start: .55, end: .8}, {text: 'rests.', start: 1, end: 1.8}];
  write(path.join(scene, 'word-timings.json'), {language: 'en', words});
  const action = (id, start, end) => ({id, kind: 'visual', start, end, event_region: [0, 30, 95, 60], intent: 'Synthetic declared intent for schema tests only.', movement: 'A synthetic square moves across the fixture.',
    visual_change: {before: 'Synthetic compact arrangement.', after: 'Synthetic expanded arrangement.'}, visual_phases: [{label: 'before', at: start}, {label: 'after', at: end - .1}]});
  const plan = {schema: 1, author_id: 'synthetic-author', transcript: {path: 'word-timings.json', sha256: hash(path.join(scene, 'word-timings.json'))}, stage_region: [0, 30, 95, 60],
    actions: single ? [action('only', 0, 2)] : [action('arrival', 0, 1), action('result', 1, 2)],
    captions: {language: 'en', region: [100, 0, 60, 35], groups: single ? [{id: 'whole', start: 0, end: 1.8, units: [{text: 'A small dog rests.', start: 0, end: 1.8, emphasis: true, word_indices: [0, 1, 2, 3]}]}] :
      [{id: 'subject', start: 0, end: .8, units: [{text: 'A small dog', start: 0, end: .8, emphasis: true, word_indices: [0, 1, 2]}]}, {id: 'predicate', start: 1, end: 1.8, units: [{text: 'rests.', start: 1, end: 1.8, emphasis: true, word_indices: [3]}]}]}};
  write(path.join(scene, 'visual-plan.json'), plan);
  for (let i = 0; i < 20; i++) await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="#eee8df"/><rect x="${i}" y="40" width="10" height="20" fill="#222"/><rect x="110" y="5" width="30" height="8" fill="red"/><circle cx="145" cy="65" r="10" fill="blue"/></svg>`)).png().toFile(path.join(framesDir, String(i).padStart(6, '0') + '.png'));
  fs.copyFileSync(path.join(framesDir, '000000.png'), path.join(scene, 'presenter.png')); fs.writeFileSync(path.join(scene, 'mix.wav'), 'Synthetic audio file; only an ffprobe stub reads it.');
  for (const name of ['Instrument-Sans-1.ttf', 'Anton-0.ttf']) fs.copyFileSync(path.join(root, 'assets/b5/example/assets/fonts', name), path.join(scene, name));
  const lock = name => ({path: name, sha256: hash(path.join(scene, name))});
  write(path.join(scene, 'production.json'), {presenter: {kind: 'original_simple', ...lock('presenter.png'), identity_anchor: 'Synthetic fixture', style_anchor: 'Synthetic fixture', static_approval: 'Synthetic record only, not approval', source: {type: 'original_code', references: []}},
    captions: {preset: 'b5-instrument-anton-v1', font: lock('Instrument-Sans-1.ttf'), title_font: lock('Anton-0.ttf'), semantic_review: 'Synthetic schema declaration, not caption review'},
    sound: [{kind: 'quiet', start: 0, end: 2, reason: 'Synthetic quiet coverage'}], sound_review: 'Synthetic record; no listening', mix: lock('mix.wav'), motion: [{start: 0, end: 2, role: 'prop', region: [0, 30, 95, 60], reason: 'Synthetic local movement'}]});
  const ledger = {style: 'B5', status: 'technical_frames', visual_acceptance: 'not_reviewed', project: dir, input_sha256: b5PngProjectFingerprint(dir), production: {manifest_sha256: hash(path.join(scene, 'production.json')), motion_samples: []}, plan_checkpoint: null,
    frames: Array.from({length: 20}, (_, i) => i), complete: true, config: c, files: Array.from({length: 20}, (_, i) => {const name = String(i).padStart(6, '0') + '.png'; return {name, sha256: hash(path.join(framesDir, name))};})};
  const ledgerFile = path.join(framesDir, 'frames.json'); write(ledgerFile, ledger);
  const f = {tmp, dir, scene, framesDir, c, plan, ledger, ledgerFile, refresh: () => {ledger.input_sha256 = b5PngProjectFingerprint(dir); write(ledgerFile, ledger);}};
  return f;
}
const reviewed = f => writeSyntheticB5PngReview(f);
function stubCommands(f) {
  const sentinel = path.join(f.tmp, 'encoder-called'), encoder = path.join(f.tmp, 'encoder-stub.cjs'), probe = path.join(f.tmp, 'probe-stub.cjs');
  fs.writeFileSync(encoder, '#!/usr/bin/env node\nrequire("node:fs").appendFileSync(' + JSON.stringify(sentinel) + ',"called\\n");process.stderr.write("MOCK_ENCODER_REACHED_NO_MEDIA_WRITTEN");process.exit(71);\n');
  fs.writeFileSync(probe, '#!/usr/bin/env node\nprocess.stdout.write(JSON.stringify({streams:[{codec_type:"audio"}],format:{duration:"2"}}));\n');
  fs.chmodSync(encoder, 0o755); fs.chmodSync(probe, 0o755);
  return {sentinel, env: {...process.env, FFMPEG: encoder, FFPROBE: probe}};
}
const run = (args, env = process.env) => spawnSync(process.execPath, [cli, ...args], {encoding: 'utf8', env, maxBuffer: 2e6});

test('pack keeps first read neutral; full PNGs and derived stage crops are exact and templates unknown', async t => {
  const f = await fixture(t), out = path.join(f.tmp, 'pack'); fs.mkdirSync(out);
  const pack = await createB5PngReviewPack({...f, out}), evidence = read(pack.evidence), initial = read(pack.image_first_template);
  assert.equal(initial.status, 'unknown'); assert.equal(initial.reviewer.id, ''); assert.equal(initial.recorded_before_intent, false);
  assert.equal(initial.completed, false);
  assert(initial.images.every(image => image.status === 'unknown' && image.subject === '' && image.visible_action === ''));
  assert(!JSON.stringify(initial).includes('arrival')); assert(!JSON.stringify(initial).includes('A small dog'));
  assert(!fs.existsSync(path.join(out, 'phase2-template.json')));
  assert(fs.readdirSync(pack.neutral_view).every(name => /^\d{6}\.png$|^image-first-template\.json$/.test(name)));
  for (const image of evidence.images) {
    assert.equal(hash(path.join(out, image.full_file)), hash(path.join(f.framesDir, image.source_name)));
    const meta = await sharp(path.join(out, image.neutral_file)).metadata(); assert.equal(meta.width, 95); assert.equal(meta.height, 60);
    const expected = await sharp(path.join(f.framesDir, image.source_name)).extract({left: 0, top: 30, width: 95, height: 60}).png().toBuffer();
    assert.equal(crypto.createHash('sha256').update(expected).digest('hex'), image.neutral_sha256);
  }
});

test('separate first-read receipt/snapshot and matching phase2 admit internal encode only, with variable event/card counts', async t => {
  for (const single of [false, true]) {
    const f = await fixture(t, single), review = await reviewed(f), receipt = read(review.seal.receipt), report = read(review.args.reviewFile);
    assert.equal(receipt.first_read.sha256, hash(review.args.firstReadFile)); assert.equal(receipt.snapshot.sha256, hash(receipt.snapshot.path));
    assert.equal(fs.statSync(review.seal.receipt).mode & 0o777, 0o444);
    assert.equal(report.actions.length, single ? 1 : 2); assert.equal(report.semantic_captions.adjacent_cards.length, single ? 0 : 1);
    const result = await validateB5PngPreEncodeReview(review.args); assert.equal(result.status, 'png_review_bound_for_internal_encode');
    assert.equal(result.phase2_review.sha256, hash(review.args.reviewFile)); assert(!('preview_ready' in result));
    assert(result.limits.some(line => line.includes('not continuous playback')));
  }
});

test('unperformed, incomplete or nonconcrete first reads cannot seal; contextual verdict remains unknown after seal', async t => {
  const f = await fixture(t), out = path.join(f.tmp, 'pack'); fs.mkdirSync(out);
  const pack = await createB5PngReviewPack({...f, out}), firstReadFile = path.join(f.tmp, 'reading.json'), sealDir = path.join(f.tmp, 'seal'); fs.mkdirSync(sealDir);
  const initial = read(pack.image_first_template);
  for (const mutate of [r => {Object.assign(r, initial);}, r => {r.completed = false;}, r => {delete r.completed;}, r => {r.status = 'unreviewed';}, r => {r.images[0].status = 'pending';},
    r => {r.images[0].subject = '';}, r => {r.images[0].relation = 'unknown';}, r => {r.images[0].visible_action = ' ';}, r => {r.images[0].alternate_readings = ['n/a'];},
    r => {r.recorded_before_intent = false;}, r => {r.reviewer.viewed_images = false;}, r => {r.reviewer.id = f.plan.author_id;}, r => {r.images[0].png_sha256 = '0'.repeat(64);}]) {
    const value = fillSyntheticPngFirstRead(initial); mutate(value); write(firstReadFile, value);
    await assert.rejects(sealB5PngImageFirstRead({...f, evidenceDir: out, firstReadFile, out: sealDir})); assert.equal(fs.readdirSync(sealDir).length, 0);
  }
  write(firstReadFile, fillSyntheticPngFirstRead(initial));
  const seal = await sealB5PngImageFirstRead({...f, evidenceDir: out, firstReadFile, out: sealDir});
  const report = read(seal.phase2_template); assert.equal(report.status, 'unknown'); assert.equal(report.full_composition.status, 'unknown');
  assert(report.semantic_captions.cards.every(card => card.status === 'unknown'));
  await assert.rejects(validateB5PngPreEncodeReview({...f, evidenceDir: out, firstReadFile, sealDir, reviewFile: seal.phase2_template}), /unknown/);
});

function uncertainSyntheticReading(reading) {
  // Synthetic records exercise uncertain/failed perception without asserting a
  // real transition judgment or a passing review of any production material.
  reading.status = 'unknown';
  for (const [i, status] of [[0, 'unknown'], [Math.floor(reading.images.length / 2), 'fail'], [reading.images.length - 1, 'unknown']]) {
    Object.assign(reading.images[i], {status,
      subject: 'Synthetic fixture reading: a partial dark shape is visible; its complete referent is uncertain from this sample.',
      relation: 'Synthetic fixture reading: this isolated sample does not establish a connection to a complete owner.',
      visible_action: 'Synthetic fixture reading: the visible fragment may be an entering or leaving state; no continuous motion is claimed.',
      alternate_readings: ['Synthetic fixture alternate reading: a moving edge rather than a complete subject.']});
  }
}

test('completed unknown/fail readings seal unchanged and need current plus nearest-neighbor contextual dispositions', async t => {
  const f = await fixture(t), review = await writeSyntheticB5PngReview(f, {firstReadTransform: uncertainSyntheticReading});
  const first = read(review.args.firstReadFile), evidence = read(review.pack.evidence), template = read(review.seal.phase2_template), original = read(review.args.reviewFile);
  assert.equal(first.completed, true); assert.equal(first.status, 'unknown');
  assert(first.images.some(image => image.status === 'fail'));
  assert.equal(hash(path.join(review.args.sealDir, 'image-first-reading.json')), hash(review.args.firstReadFile));
  const expected = first.images.flatMap((image, i) => image.status === 'pass' ? [] : [{image_id: image.image_id, initial_status: image.status,
    previous_image_id: evidence.images[i - 1]?.id || null, next_image_id: evidence.images[i + 1]?.id || null}]);
  assert.deepEqual(template.first_read_dispositions.map(({status, observations, ...binding}) => binding), expected);
  assert(template.first_read_dispositions.every(item => item.status === 'unknown' && item.observations.length === 0));
  assert.equal(expected[0].previous_image_id, null); assert.equal(expected.at(-1).next_image_id, null);
  assert(expected[1].previous_image_id && expected[1].next_image_id);
  await assert.rejects(validateB5PngPreEncodeReview({...review.args, reviewFile: review.seal.phase2_template}), /unknown/);
  assert.equal((await validateB5PngPreEncodeReview(review.args)).status, 'png_review_bound_for_internal_encode');
  const mutations = [
    r => {delete r.first_read_dispositions;},
    r => {r.first_read_dispositions.pop();},
    r => {r.first_read_dispositions.push(r.first_read_dispositions[0]);},
    r => {r.first_read_dispositions[0].initial_status = 'pass';},
    r => {r.first_read_dispositions[1].previous_image_id = expected[0].image_id;},
    r => {r.first_read_dispositions[1].next_image_id = null;},
    r => {r.first_read_dispositions[1].status = 'unknown';},
    r => {r.first_read_dispositions[1].status = 'fail';},
    r => {r.first_read_dispositions[1].observations = [];},
    r => {r.first_read_dispositions[1].observations[0].detail = 'pass';},
    r => {const item = r.first_read_dispositions[1]; item.observations[0].evidence_ids = [item.previous_image_id, item.next_image_id];},
    r => {const item = r.first_read_dispositions[1]; item.observations[0].evidence_ids = [item.previous_image_id, item.image_id];},
    r => {const item = r.first_read_dispositions[1]; item.observations[0].evidence_ids = [item.image_id, item.next_image_id];},
    r => {r.first_read_dispositions[1].observations[0].evidence_ids.push('nonexistent-context');},
    r => {r.blocking_issues = ['Synthetic unresolved dominant-shape/contact ambiguity remains; intent alone does not repair it.'];}
  ];
  for (const mutate of mutations) {
    const report = structuredClone(original); mutate(report); write(review.args.reviewFile, report);
    await assert.rejects(validateB5PngPreEncodeReview(review.args));
  }
  write(review.args.reviewFile, original); await validateB5PngPreEncodeReview(review.args);
  // Even a plausible correction after seeing intent must remain in phase 2,
  // rather than overwrite the sealed original perception.
  const rewritten = structuredClone(first); rewritten.images[0].status = 'pass'; rewritten.images[0].subject = 'Synthetic correction inserted after intent, which must not replace the original reading.';
  write(review.args.firstReadFile, rewritten);
  await assert.rejects(validateB5PngPreEncodeReview(review.args), /receipt/);
  fs.copyFileSync(path.join(review.args.sealDir, 'image-first-reading.json'), review.args.firstReadFile);
  await validateB5PngPreEncodeReview(review.args);
});

test('an uncertain-reading seal alone cannot start the encoder without completed contextual dispositions', async t => {
  const f = await fixture(t), review = await writeSyntheticB5PngReview(f, {firstReadTransform: uncertainSyntheticReading}), mock = stubCommands(f), output = path.join(f.tmp, 'candidate');
  const args = ['encode', f.dir, '--frames-dir', f.framesDir, '--audio', path.join(f.scene, 'mix.wav'), '--output', output, ...review.cliArgs];
  const original = read(review.args.reviewFile);
  for (const report of [read(review.seal.phase2_template), {...original, first_read_dispositions: []},
    {...original, first_read_dispositions: original.first_read_dispositions.map(item => ({...item, status: 'unknown'}))}]) {
    write(review.args.reviewFile, report);
    const result = run(args, mock.env); assert.notEqual(result.status, 0);
    assert(!fs.existsSync(output)); assert(!fs.existsSync(mock.sentinel), 'only the non-media stub could run, and it must not be reached');
  }
});

test('old render, changed unselected PNG/full ledger, and changed project cannot reuse prior first read', async t => {
  const f = await fixture(t), review = await reviewed(f), other = path.join(f.tmp, 'frames-v2'); fs.cpSync(f.framesDir, other, {recursive: true});
  await assert.rejects(validateB5PngPreEncodeReview({...review.args, framesDir: other}), /stale/);
  const evidence = read(review.pack.evidence), selected = new Set(evidence.images.map(image => image.frame_index));
  const index = f.ledger.frames.find(i => !selected.has(i)); assert.notEqual(index, undefined);
  const item = f.ledger.files[index]; await sharp({create: {width: 160, height: 90, channels: 3, background: 'black'}}).png().toFile(path.join(f.framesDir, item.name)); item.sha256 = hash(path.join(f.framesDir, item.name)); write(f.ledgerFile, f.ledger);
  await assert.rejects(validateB5PngPreEncodeReview(review.args), /stale/);
  fs.writeFileSync(path.join(f.scene, 'new-implementation.txt'), 'Synthetic revision');
  await assert.rejects(validateB5PngPreEncodeReview(review.args), /project changed/);
});

test('changed PNG without ledger update, changed neutral crop, and cropped full-composite substitution fail', async t => {
  const f = await fixture(t), review = await reviewed(f), evidence = read(review.pack.evidence), image = evidence.images[0];
  const neutral = path.join(review.args.evidenceDir, image.neutral_file), full = path.join(review.args.evidenceDir, image.full_file), source = path.join(f.framesDir, image.source_name);
  const neutralBytes = fs.readFileSync(neutral), fullBytes = fs.readFileSync(full), sourceBytes = fs.readFileSync(source);
  fs.writeFileSync(neutral, fullBytes); await assert.rejects(validateB5PngPreEncodeReview(review.args), /neutral crop/); fs.writeFileSync(neutral, neutralBytes);
  fs.writeFileSync(full, neutralBytes); await assert.rejects(validateB5PngPreEncodeReview(review.args), /full PNG/); fs.writeFileSync(full, fullBytes);
  fs.writeFileSync(source, neutralBytes); await assert.rejects(validateB5PngPreEncodeReview(review.args), /PNG hash/); fs.writeFileSync(source, sourceBytes);
  await validateB5PngPreEncodeReview(review.args);
});

test('sealed first read and phase2 cannot be mixed, edited, reidentified or replaced by refreshed hashes', async t => {
  const f = await fixture(t), review = await reviewed(f), original = read(review.args.reviewFile);
  fs.appendFileSync(review.args.firstReadFile, '\n'); await assert.rejects(validateB5PngPreEncodeReview(review.args), /receipt/);
  fs.copyFileSync(path.join(review.args.sealDir, 'image-first-reading.json'), review.args.firstReadFile);
  for (const mutate of [r => {r.first_read.sha256 = '0'.repeat(64);}, r => {r.image_first_receipt.sha256 = '0'.repeat(64);}, r => {r.reviewer.id = 'other-reviewer';}, r => {r.reviewer.id = f.plan.author_id;}, r => {r.binding.frame_ledger_sha256 = '0'.repeat(64);}, r => {r.actions[0].evidence_ids = r.actions[1].evidence_ids;}]) {
    const report = structuredClone(original); mutate(report); write(review.args.reviewFile, report); await assert.rejects(validateB5PngPreEncodeReview(review.args));
  }
  write(review.args.reviewFile, original);
  await assert.rejects(validateB5PngPreEncodeReview({...review.args, sealDir: path.join(f.tmp, 'missing-seal')}), /missing/);
});

test('actual full-composition semantic captions and both adjacent replacement sides are required; no word-count shortcut', async t => {
  const f = await fixture(t), review = await reviewed(f), original = read(review.args.reviewFile);
  for (const mutate of [r => {delete r.semantic_captions;}, r => {r.semantic_captions.cards[0].status = 'unknown';}, r => {r.semantic_captions.cards[0].status = 'fail';}, r => {r.full_composition.status = 'unknown';}, r => {r.semantic_captions.adjacent_cards = [];}, r => {r.semantic_captions.adjacent_cards[0].observations[0].evidence_ids = r.semantic_captions.cards[0].evidence_ids;}, r => {r.semantic_captions.cards[0].observations[0].evidence_ids = [r.semantic_captions.cards[0].evidence_ids[0]];}, r => {r.blocking_issues = ['Actual caption phrase broken across cards'];}]) {
    const report = structuredClone(original); mutate(report); write(review.args.reviewFile, report); await assert.rejects(validateB5PngPreEncodeReview(review.args));
  }
  write(review.args.reviewFile, original); await validateB5PngPreEncodeReview(review.args);
  // One-word predicate card is not rejected mechanically. The actual required
  // semantic judgment and adjacent-card evidence, rather than a token quota, gate it.
  assert.equal(f.plan.captions.groups[1].units[0].word_indices.length, 1);
});

test('diagnostic masks are explicit derived evidence, conceal overlapping captions and stay bound', async t => {
  const f = await fixture(t); f.plan.captions.region = [70, 30, 60, 35]; write(path.join(f.scene, 'visual-plan.json'), f.plan); f.refresh();
  const out = path.join(f.tmp, 'pack'); fs.mkdirSync(out);
  await assert.rejects(createB5PngReviewPack({...f, out}), /overlaps the blind stage crop/);
  const masks = path.join(f.tmp, 'masks.json'); write(masks, {schema: 1, masks: [{region: [70, 30, 25, 35], reason: 'Diagnostic concealment of external caption overlap; not original pixels.'}]});
  const pack = await createB5PngReviewPack({...f, out, diagnosticMasksFile: masks}), evidence = read(pack.evidence);
  assert.equal(evidence.diagnostic_masking.sha256, hash(masks)); assert.match(evidence.diagnostic_masking.treatment, /not authentic/);
  const firstReadFile = path.join(f.tmp, 'reading.json'), sealDir = path.join(f.tmp, 'seal'); fs.mkdirSync(sealDir); write(firstReadFile, fillSyntheticPngFirstRead(read(pack.image_first_template)));
  fs.appendFileSync(masks, '\n'); await assert.rejects(sealB5PngImageFirstRead({...f, evidenceDir: out, firstReadFile, out: sealDir}), /masking/);
});

test('CLI pack/seal/check works without encoding, refuses overwrites, and defaults to unknown', async t => {
  const f = await fixture(t), evidenceDir = path.join(f.tmp, 'cli-pack'), sealDir = path.join(f.tmp, 'cli-seal'), firstReadFile = path.join(f.tmp, 'reading.json'), reviewFile = path.join(f.tmp, 'phase2.json');
  let result = run(['png-review-pack', f.dir, '--frames-dir', f.framesDir, '--output', evidenceDir]); assert.equal(result.status, 0, result.stderr);
  const pack = JSON.parse(result.stdout); write(firstReadFile, fillSyntheticPngFirstRead(read(pack.image_first_template)));
  result = run(['png-first-read-seal', f.dir, '--frames-dir', f.framesDir, '--png-evidence', evidenceDir, '--image-first-read', firstReadFile, '--output', sealDir]); assert.equal(result.status, 0, result.stderr);
  const seal = JSON.parse(result.stdout); write(reviewFile, fillSyntheticPngPhase2(read(seal.phase2_template), read(pack.evidence)));
  result = run(['png-review-check', f.dir, '--frames-dir', f.framesDir, '--png-evidence', evidenceDir, '--image-first-read', firstReadFile, '--image-first-seal', sealDir, '--png-review', reviewFile]); assert.equal(result.status, 0, result.stderr); assert.equal(JSON.parse(result.stdout).status, 'png_review_bound_for_internal_encode');
  result = run(['png-review-pack', f.dir, '--frames-dir', f.framesDir, '--output', evidenceDir]); assert.notEqual(result.status, 0); assert.match(result.stderr, /overwrite/);
});

test('standard candidate reaches the non-media encoder stub while strict missing, unknown or stale review fails closed', async t => {
  const f = await fixture(t), mock = stubCommands(f), output = path.join(f.tmp, 'candidate'), standardArgs = ['encode', f.dir, '--frames-dir', f.framesDir, '--audio', path.join(f.scene, 'mix.wav'), '--output', output];
  let result = run(standardArgs, mock.env);
  assert.notEqual(result.status, 0); assert.match(result.stderr, /MOCK_ENCODER_REACHED_NO_MEDIA_WRITTEN/);
  assert.equal(fs.readFileSync(mock.sentinel, 'utf8'), 'called\n'); assert(!fs.existsSync(path.join(output, 'video.mp4')));
  fs.rmSync(output, {recursive: true, force: true}); fs.rmSync(mock.sentinel);
  const args = [...standardArgs, '--strict-review'];
  result = run(args, mock.env); assert.notEqual(result.status, 0); assert.match(result.stderr, /Strict review encode requires --png-evidence/); assert(!fs.existsSync(output)); assert(!fs.existsSync(mock.sentinel));
  const review = await reviewed(f), original = read(review.args.reviewFile);
  for (const mutate of [r => {r.status = 'unknown';}, r => {r.binding.frame_ledger_sha256 = '0'.repeat(64);}, r => {r.semantic_captions.adjacent_cards[0].status = 'fail';}]) {
    const report = structuredClone(original); mutate(report); write(review.args.reviewFile, report);
    result = run([...args, ...review.cliArgs], mock.env); assert.notEqual(result.status, 0); assert(!fs.existsSync(output)); assert(!fs.existsSync(mock.sentinel));
  }
  write(review.args.reviewFile, original); result = run([...args, ...review.cliArgs], mock.env);
  assert.notEqual(result.status, 0); assert.match(result.stderr, /MOCK_ENCODER_REACHED_NO_MEDIA_WRITTEN/); assert.equal(fs.readFileSync(mock.sentinel, 'utf8'), 'called\n'); assert(!fs.existsSync(path.join(output, 'video.mp4')));
});

test('exact historical assets remain a technical exception; new-story metadata cannot claim it', t => {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'b5-png-legacy-'))); t.after(() => fs.rmSync(tmp, {recursive: true, force: true}));
  const dir = path.join(tmp, 'historical'); fs.mkdirSync(dir); fs.cpSync(path.join(root, 'assets/b5/example'), path.join(dir, 'scene'), {recursive: true});
  const c = read(path.join(dir, 'scene/config.json')); assert.equal(validateB5Production({dir, c}, path.join(root, 'assets/b5')).mode, 'exact_approved_legacy');
  fs.appendFileSync(path.join(dir, 'scene/renderer.cjs'), '\n// synthetic new-story change\n');
  assert.throws(() => validateB5Production({dir, c}, path.join(root, 'assets/b5')), /new stories require/);
});
