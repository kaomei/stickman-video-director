import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {validateVisualPlan, buildB5ReviewPack, verifyB5VisualAcceptance} from '../scripts/b5-visual-review.mjs';

// These are synthetic provenance/contract tests. No real creative review,
// human viewing, listening or user acceptance is represented by this fixture.
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const ffmpeg = process.env.FFMPEG || 'ffmpeg', ffprobe = process.env.FFPROBE || 'ffprobe';
const keys = ['before', 'anticipation', 'contact', 'consequence', 'delayed_response', 'recovery'];
const cli = fileURLToPath(new URL('../scripts/character-explainer.mjs', import.meta.url));
function fixture(t) {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'b5-visual-test-')));
  t.after(() => fs.rmSync(tmp, {recursive: true, force: true}));
  const dir = path.join(tmp, 'project'), scene = path.join(dir, 'scene'), candidateDir = path.join(tmp, 'candidate'), out = path.join(tmp, 'evidence');
  for (const folder of [scene, candidateDir, out]) fs.mkdirSync(folder, {recursive: true});
  const c = {width: 160, height: 90, fps: 12, duration: 2}, projectFingerprint = 'a'.repeat(64);
  const transcript = {language: 'zh-CN', words: [{text: '测试', start: 0, end: .8}, {text: '动作', start: .9, end: 1.8}]};
  const transcriptPath = path.join(scene, 'word-timings.json'); write(transcriptPath, transcript);
  const plan = {schema: 1, author_id: 'synthetic-fixture-author', transcript: {path: 'word-timings.json', sha256: sha(transcriptPath)},
    stage_region: [0, 25, 95, 65], actions: [{id: 'move', start: 0, end: 2, actor_region: [15, 30, 65, 55],
      intent: 'Synthetic moving pattern used only for provenance tests; no creative acceptance asserted.',
      phases: Object.fromEntries(keys.map((key, i) => [key, [0, .25, .5, .75, 1, 1.75][i]]))}],
    captions: {language: 'zh-CN', region: [100, 0, 60, 35], groups: [{id: 'words', start: 0, end: 1.8,
      units: [{text: '测试', start: 0, end: .8, emphasis: true, word_indices: [0]}, {text: '动作', start: .9, end: 1.8, emphasis: false, word_indices: [1]}]}]}};
  const planFile = path.join(scene, 'visual-plan.json'); write(planFile, plan);
  const video = path.join(candidateDir, 'video.mp4');
  const encoded = spawnSync(ffmpeg, ['-v', 'error', '-nostdin', '-f', 'lavfi', '-i', 'testsrc2=size=160x90:rate=12:duration=2',
    '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-c:v', 'libx264', '-threads:v', '1', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-t', '2', video], {encoding: 'utf8'});
  assert.equal(encoded.status, 0, encoded.stderr);
  const candidateFile = path.join(candidateDir, 'candidate.json');
  write(candidateFile, {schema: 1, style: 'B5', status: 'pending_visual_review', output: video, output_sha256: sha(video), project_fingerprint: projectFingerprint, full_decode: 'pass', metadata: {synthetic: true}});
  const reviewFile = path.join(tmp, 'review.json');
  const args = {dir, c, candidateDir, out, evidenceDir: out, reviewFile, projectFingerprint, ffmpeg, ffprobe};
  return {tmp, dir, scene, c, plan, planFile, transcript, transcriptPath, video, candidateFile, candidateDir, out, reviewFile, args,
    savePlan: () => write(planFile, plan), saveTranscript: () => {write(transcriptPath, transcript); plan.transcript.sha256 = sha(transcriptPath); write(planFile, plan);}};
}
function syntheticReview(f, ledger) {
  const review = read(path.join(f.out, 'review-template.json'));
  review.reviewer = {id: 'synthetic-independent-fixture', kind: 'agent', independent: true,
    method: 'Synthetic schema/provenance test only. No actual visual review, listening or baseline viewing occurred.'};
  const observation = (id, at = .5) => [{at, detail: 'Synthetic engineering fixture observation; no aesthetic, human or user approval is asserted.', evidence_ids: [id]}];
  for (const [name, id] of [['silent_stage', 'full-stage-silent'], ['complete_mix', 'source-video'], ['captions_with_audio', 'full-captions-audio']])
    review.full_playback[name] = {status: 'pass', observations: observation(id), viewed_ranges: [{start: 0, end: 2}]};
  for (const [items, prefix] of [[review.actions, 'action'], [review.captions, 'caption']]) for (const item of items)
    for (const key of Object.keys(item.checks)) item.checks[key] = {status: 'pass', observations: observation(prefix + '-' + item.id + '-continuous')};
  const baseline = ledger.baseline_sources[0];
  review.baseline_comparisons = [{id: baseline.id, source_path: baseline.source_path, source_sha256: baseline.source_sha256,
    observations: observation('source-video')}];
  review.blocking_issues = [];
  write(f.reviewFile, review);
  return review;
}

test('visual plan locks actual transcript, semantic-unit order, progressive timing and full-film action coverage', t => {
  const f = fixture(t), original = structuredClone(f.plan);
  assert.equal(validateVisualPlan(f.args).captions.language, 'zh-CN');
  const reject = (mutate, message) => { Object.assign(f.plan, structuredClone(original)); mutate(f.plan); f.savePlan(); assert.throws(() => validateVisualPlan(f.args), message); };
  reject(p => {p.actions[0].end = 1; p.actions[0].phases = Object.fromEntries(keys.map((k, i) => [k, i / 6]));}, /omit the end/);
  reject(p => {p.actions[0].start = .5; p.actions[0].phases = Object.fromEntries(keys.map((k, i) => [k, .5 + i * .25]));}, /cover the full film/);
  reject(p => {p.captions.groups[0].units.pop(); p.captions.groups[0].end = .8;}, /all transcript words/);
  reject(p => {p.captions.groups[0].units[0].text = '错误';}, /preserve.*transcript/);
  reject(p => {p.captions.groups[0].units[1].start = 0;}, /progressively/);
  reject(p => {p.captions.groups[0].units[0].emphasis = false;}, /keyword emphasis/);
  reject(p => {p.captions.language = 'en';}, /language/);
  reject(p => {p.actions[0].phases = Object.fromEntries(keys.map((k, i) => [k, i * .001]));}, /six distinct ordered/);
  reject(p => {p.transcript.sha256 = '0'.repeat(64);}, /transcript hash/);
  Object.assign(f.plan, structuredClone(original)); f.savePlan();
  f.transcript.words[1].start = .7; f.saveTranscript();
  assert.throws(() => validateVisualPlan(f.args), /nonoverlapping/);
});

test('caption plan cannot split a Unicode grapheme even if source word indices are complete', t => {
  const f = fixture(t);
  f.transcript.words[0].text = 'e'; f.transcript.words[1].text = '\u0301';
  f.plan.captions.groups[0].units[0].text = 'e'; f.plan.captions.groups[0].units[1].text = '\u0301';
  f.saveTranscript();
  assert.throws(() => validateVisualPlan(f.args), /grapheme\/shaping cluster/);
});

test('all caption languages share transcript, semantic-unit and emphasis gates; shaping still needs visual review', t => {
  const f = fixture(t);
  for (const [language, words, display] of [
    ['zh-CN', ['展示', '动作'], ['展示', '动作']],
    ['en', ['Show', 'motion.'], ['Show', 'motion.']],
    ['ar', ['حركة', 'واضحة'], ['حركة', 'واضحة']],
    ['fr', ['cafe\u0301', 'anime\u0301'], ['café', 'animé']],
    ['ja', ['動きを', '見せる'], ['動きを', '見せる']]
  ]) {
    f.transcript.language = language; f.plan.captions.language = language;
    for (const [i, word] of words.entries()) {f.transcript.words[i].text = word; f.plan.captions.groups[0].units[i].text = display[i];}
    f.saveTranscript();
    assert.equal(validateVisualPlan(f.args).captions.language, language);
  }
  f.plan.captions.groups[0].units[0].emphasis = false; f.savePlan();
  assert.throws(() => validateVisualPlan(f.args), /keyword emphasis/);
  f.plan.captions.groups[0].units[0].emphasis = true;
  f.plan.captions.groups[0].units[1].text = '省略した'; f.savePlan();
  assert.throws(() => validateVisualPlan(f.args), /preserve.*transcript/);
  f.plan.captions.groups[0].units.pop(); f.plan.captions.groups[0].end = .8; f.savePlan();
  assert.throws(() => validateVisualPlan(f.args), /all transcript words/);
});

test('review pack samples the final encoded movie and creates only an unknown, blocked review template', async t => {
  const f = fixture(t), ledger = await buildB5ReviewPack(f.args);
  assert.equal(ledger.source.sha256, sha(f.video));
  assert.equal(ledger.transcript_sha256, sha(f.transcriptPath));
  assert.equal(ledger.artifacts.filter(a => a.kind === 'clip').length, 4);
  assert.equal(ledger.artifacts.filter(a => a.scope === 'action' && a.kind === 'frame').length, 6);
  assert(ledger.artifacts.some(a => a.phase === 'emphasis-peak'));
  assert(ledger.artifacts.some(a => a.phase === 'emphasis-settle'));
  const template = read(path.join(f.out, 'review-template.json'));
  assert.equal(template.reviewer.independent, false);
  assert(template.blocking_issues.length);
  for (const item of Object.values(template.full_playback)) {assert.equal(item.status, 'unknown'); assert.deepEqual(item.viewed_ranges, []); assert.deepEqual(item.observations, []);}
  for (const item of [...template.actions, ...template.captions]) for (const check of Object.values(item.checks)) {assert.equal(check.status, 'unknown'); assert.deepEqual(check.observations, []);}
  write(f.reviewFile, template);
  assert.throws(() => verifyB5VisualAcceptance(f.args), /independent reviewer/);
});

test('synthetic acceptance contract rejects failed arms/captions, empty passes, stale inputs and invented independence', async t => {
  const f = fixture(t), ledger = await buildB5ReviewPack(f.args), review = syntheticReview(f, ledger);
  const result = verifyB5VisualAcceptance(f.args);
  assert.equal(result.status, 'independent_visual_review_pass');
  assert.equal(result.user_acceptance, 'not_inferred');
  assert(result.limits.some(s => /not authenticated/.test(s)));
  const original = structuredClone(review);
  const reject = (mutate, message) => {Object.assign(review, structuredClone(original)); mutate(review); write(f.reviewFile, review); assert.throws(() => verifyB5VisualAcceptance(f.args), message);};
  reject(r => {r.reviewer.id = f.plan.author_id;}, /independent reviewer/);
  reject(r => {r.actions[0].checks.arms_pose.status = 'fail';}, /arms_pose.*failed/);
  reject(r => {r.captions[0].checks.reveal.status = 'unknown';}, /reveal.*failed/);
  reject(r => {r.actions[0].checks.pacing.observations = [];}, /timed observations/);
  reject(r => {r.actions[0].checks.pacing.observations[0].detail = 'pass';}, /specific detail/);
  reject(r => {r.actions[0].checks.arms_pose.observations[0] = {at: .5, detail: 'Synthetic pose still, deliberately omitting continuous evidence.', evidence_ids: ['action-move-contact']};}, /continuous playback/);
  reject(r => {r.captions = [];}, /cover every planned id/);
  reject(r => {r.full_playback.complete_mix.viewed_ranges = [{start: 0, end: 1}];}, /omit the ending/);
  reject(r => {r.baseline_comparisons[0].source_sha256 = '0'.repeat(64);}, /locked source/);
  reject(r => {r.video_sha256 = '0'.repeat(64);}, /exact current final video/);
  Object.assign(review, structuredClone(original)); write(f.reviewFile, review);
  assert.throws(() => verifyB5VisualAcceptance({...f.args, projectFingerprint: 'b'.repeat(64)}), /fingerprint is stale/);
  f.plan.actions[0].intent += ' Changed action intent.'; f.savePlan();
  assert.throws(() => verifyB5VisualAcceptance(f.args), /plan evidence is stale/);
});

test('rehashing a substituted clip/frame or deleting planned evidence cannot forge final-video provenance', async t => {
  const f = fixture(t), ledger = await buildB5ReviewPack(f.args), review = syntheticReview(f, ledger);
  const evidenceFile = path.join(f.out, 'evidence.json'), originalLedger = structuredClone(ledger);
  const persist = () => {write(evidenceFile, ledger); review.evidence_sha256 = sha(evidenceFile); write(f.reviewFile, review);};
  const clip = ledger.artifacts.find(a => a.kind === 'clip'), clipFile = path.join(f.out, clip.file), clipBytes = fs.readFileSync(clipFile);
  fs.copyFileSync(f.video, clipFile); clip.sha256 = sha(clipFile); persist();
  assert.throws(() => verifyB5VisualAcceptance(f.args), /clip was not extracted/);
  fs.writeFileSync(clipFile, clipBytes); Object.assign(ledger, structuredClone(originalLedger)); persist();
  const frame = ledger.artifacts.find(a => a.kind === 'frame'), frameFile = path.join(f.out, frame.file), frameBytes = fs.readFileSync(frameFile);
  fs.writeFileSync(frameFile, 'Forged frame artifact, not decoded from the final composite.'); frame.sha256 = sha(frameFile); persist();
  assert.throws(() => verifyB5VisualAcceptance(f.args), /frame was not extracted/);
  fs.writeFileSync(frameFile, frameBytes); Object.assign(ledger, structuredClone(originalLedger)); persist();
  ledger.artifacts.pop(); persist();
  assert.throws(() => verifyB5VisualAcceptance(f.args), /artifact set is incomplete/);
  Object.assign(ledger, structuredClone(originalLedger)); ledger.artifacts[0].crop[0] = 1; persist();
  assert.throws(() => verifyB5VisualAcceptance(f.args), /descriptors do not match/);
});

test('candidate media metadata, location, symlinks and post-review hash changes fail closed', async t => {
  const f = fixture(t), candidate = read(f.candidateFile);
  candidate.output = path.join(f.tmp, 'another.mp4'); write(f.candidateFile, candidate);
  await assert.rejects(buildB5ReviewPack(f.args), /real candidateDir\/video.mp4/);
  candidate.output = f.video; write(f.candidateFile, candidate);
  await assert.rejects(buildB5ReviewPack({...f.args, c: {...f.c, fps: 13}}), /dimensions\/fps/);
  const ledger = await buildB5ReviewPack(f.args); syntheticReview(f, ledger);
  const innerReview = path.join(f.scene, 'review.json'); fs.copyFileSync(f.reviewFile, innerReview);
  assert.throws(() => verifyB5VisualAcceptance({...f.args, reviewFile: innerReview}), /outside the project/);
  fs.rmSync(innerReview);
  fs.appendFileSync(f.video, 'changed bytes');
  assert.throws(() => verifyB5VisualAcceptance(f.args), /video hash changed/);
  const realVideo = path.join(f.tmp, 'real.mp4'); fs.renameSync(f.video, realVideo); fs.symlinkSync(realVideo, f.video);
  await assert.rejects(buildB5ReviewPack(f.args), /symlink/);
});

test('CLI review-pack and accept distinguish pending candidates from evidence-bound deliveries (synthetic protocol only)', t => {
  const f = fixture(t);
  write(path.join(f.dir, 'project.json'), {style: 'B5', renderer: 'character-explainer-code-v1'});
  write(path.join(f.scene, 'config.json'), f.c);
  const files = dir => fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => {const file = path.join(dir, e.name); return e.isDirectory() ? files(file) : [file];});
  const projectFingerprint = crypto.createHash('sha256').update(files(f.dir).sort().map(file => path.relative(f.dir, file) + ':' + sha(file)).join('\n')).digest('hex');
  const candidate = read(f.candidateFile); candidate.project_fingerprint = projectFingerprint; write(f.candidateFile, candidate);
  fs.rmdirSync(f.out); // CLI creates a fresh output directory itself.
  const run = args => spawnSync(process.execPath, [cli, ...args], {encoding: 'utf8', maxBuffer: 2e6});
  let result = run(['review-pack', f.dir, '--candidate-dir', f.candidateDir, '--output', f.out]);
  assert.equal(result.status, 0, result.stderr);
  const ledger = read(path.join(f.out, 'evidence.json'));
  assert.equal(ledger.project_fingerprint, projectFingerprint);
  fs.copyFileSync(path.join(f.out, 'review-template.json'), f.reviewFile);
  const deliveryDir = path.join(f.tmp, 'delivery');
  const accept = ['accept', f.dir, '--candidate-dir', f.candidateDir, '--evidence-dir', f.out, '--review', f.reviewFile, '--output', deliveryDir];
  result = run(accept);
  assert.notEqual(result.status, 0); assert.match(result.stderr, /independent reviewer/);
  assert.equal(fs.existsSync(deliveryDir), false, 'an unknown review cannot create a delivery');
  syntheticReview(f, ledger); // Structural test data; no real aesthetic review claimed.
  result = run(accept);
  assert.equal(result.status, 0, result.stderr);
  const delivery = read(path.join(deliveryDir, 'delivery.json'));
  assert.equal(delivery.status, 'visual_review_passed');
  assert.equal(delivery.user_acceptance, 'not_inferred');
  assert.equal(sha(path.join(deliveryDir, 'video.mp4')), sha(f.video));
  assert.equal(sha(path.join(deliveryDir, 'visual-review.json')), sha(f.reviewFile));
  assert.equal(sha(path.join(deliveryDir, 'review-evidence/evidence.json')), sha(path.join(f.out, 'evidence.json')));
  for (const artifact of ledger.artifacts) assert.equal(sha(path.join(deliveryDir, 'review-evidence', artifact.file)), artifact.sha256);
});
