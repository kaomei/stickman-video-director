import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {recordB5AuthoringStart, createB5PlanCheckpoint, validateB5PlanCheckpoint, b5PreviewTargets,
  verifyB5PreviewReadiness, candidateB5Plan} from '../scripts/b5-preview-gate.mjs';
import {createB5ReferenceStudy} from '../scripts/b5-reference-study.mjs';
import {writeSyntheticB5RelayRehearsal} from './helpers/b5-rehearsal-fixture.mjs';
import {writeSyntheticB5PngReview} from './helpers/b5-png-review-fixture.mjs';
import {initB5} from '../scripts/character-explainer.mjs';

// Synthetic protocol fixtures only. The generated square/tone has NOT received
// real creative, human, audio or user approval. Filled reports test schema only.
const root = fileURLToPath(new URL('..', import.meta.url)), cli = path.join(root, 'scripts/character-explainer.mjs');
const require = createRequire(import.meta.url), sharp = require('sharp');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, v) => fs.writeFileSync(f, JSON.stringify(v, null, 2) + '\n');
const run = args => spawnSync(process.execPath, [cli, ...args], {encoding: 'utf8', maxBuffer: 2e6});
const phases = ['before', 'anticipation', 'contact', 'consequence', 'delayed_response', 'recovery'];
async function fixture(t, portrait = false, neutralEntry = false) {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'b5-preview-test-')));
  t.after(() => fs.rmSync(tmp, {recursive: true, force: true}));
  const dir = path.join(tmp, 'project'), scene = path.join(dir, 'scene');
  if (neutralEntry) initB5(dir); else fs.mkdirSync(scene, {recursive: true});
  const c = {width: portrait ? 90 : 160, height: portrait ? 160 : 90, fps: 12, duration: 2};
  write(path.join(dir, 'project.json'), {style: 'B5', renderer: 'character-explainer-code-v1'});
  write(path.join(scene, 'config.json'), c);
  await sharp({create: {width: 32, height: 32, channels: 3, background: 'white'}}).png().toFile(path.join(scene, 'presenter.png'));
  for (const name of ['Instrument-Sans-1.ttf', 'Anton-0.ttf']) fs.copyFileSync(path.join(root, 'assets/b5/example/assets/fonts', name), path.join(scene, name));
  const mixed = spawnSync(process.env.FFMPEG || 'ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-c:a', 'pcm_s16le', path.join(scene, 'mix.wav')], {encoding: 'utf8'});
  assert.equal(mixed.status, 0, mixed.stderr);
  const lock = name => ({path: name, sha256: sha(path.join(scene, name))});
  const renderer = change => `const picture=t=>Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="${c.width}" height="${c.height}"><rect width="100%" height="100%" fill="#eee8df"/><rect x="'+(10+${change ? 20 : 0}*t)+'" y="35" width="8" height="30" fill="#202020"/></svg>');module.exports={frame:picture,qualityFrame:picture,productionAssets:${JSON.stringify([lock('presenter.png')])}};`;
  if (!neutralEntry) {
    fs.writeFileSync(path.join(scene, 'renderer.cjs'), renderer(false));
    recordB5AuthoringStart(dir); // Synthetic equivalent of init's unmodified scaffold receipt.
  }
  const transcript = {language: 'en', words: [{text: 'Calm', start: .1, end: .8}, {text: 'rest.', start: .9, end: 1.8}]};
  write(path.join(scene, 'word-timings.json'), transcript);
  const stage = portrait ? [0, 30, 70, 120] : [0, 25, 95, 65];
  const visual = {schema: 1, author_id: 'synthetic-author', transcript: lock('word-timings.json'), stage_region: stage,
    actions: [{id: 'move', start: 0, end: 2, actor_region: portrait ? [5, 35, 60, 110] : [15, 30, 65, 55], intent: 'Synthetic moving square for protocol tests only.',
      phases: Object.fromEntries(phases.map((key, i) => [key, [0, .25, .5, .75, 1, 1.8][i]]))}],
    captions: {language: 'en', region: portrait ? [20, 0, 70, 30] : [100, 0, 60, 35], groups: [{id: 'words', start: .1, end: 1.8,
      units: [{text: 'Calm', start: .1, end: .8, emphasis: true, word_indices: [0]}, {text: 'rest.', start: .9, end: 1.8, emphasis: false, word_indices: [1]}]}]}};
  write(path.join(scene, 'visual-plan.json'), visual);
  fs.writeFileSync(path.join(scene, 'action-cards.md'), 'Synthetic action planning fixture; no artistic approval is represented.');
  const targets = b5PreviewTargets();
  const previewPlan = {schema: 1, author_id: visual.author_id, speech: lock('mix.wav'), action_cards: lock('action-cards.md'),
    actions: [{id: 'move', ...Object.fromEntries(['before_state', 'anticipation', 'force', 'contact', 'consequence', 'secondary_motion', 'recovery', 'arms_task', 'composition', 'richness', 'hold_exit'].map(key => [key, 'Synthetic ' + key + ' plan fixture, not creative approval.']))}],
    target_study: targets.map(target => ({id: target.id, source_sha256: target.source_sha256, observations: [{at: 0, detail: 'Synthetic target-study field, not actual baseline viewing.'}], transfer_to_this_story: 'Synthetic declared transfer, not actual direction or approval.'}))};
  const previewPlanFile = path.join(scene, 'preview-plan.json'); write(previewPlanFile, previewPlan);
  write(path.join(scene, 'production.json'), {
    presenter: {kind: 'original_simple', ...lock('presenter.png'), identity_anchor: 'Synthetic identity fixture', style_anchor: 'Synthetic style fixture', static_approval: 'Engineering fixture only; no human approval', source: {type: 'original_code', references: []}},
    captions: {preset: 'b5-instrument-anton-v1', font: lock('Instrument-Sans-1.ttf'), title_font: lock('Anton-0.ttf'), semantic_review: 'Synthetic caption fixture; not actual review'},
    sound: [{kind: 'ambience', start: 0, end: 2, reason: 'Synthetic tone fixture', ...lock('mix.wav'), rights: 'Locally synthesized test tone'}], sound_review: 'Synthetic signal fixture only; not actual listening', mix: lock('mix.wav'),
    motion: [{start: 0, end: 2, role: 'actor', reason: 'Synthetic square shifts locally', region: portrait ? [0, 30, 70, 100] : [0, 25, 95, 65]}]
  });
  const project = {dir, c}, checkpointDir = path.join(tmp, 'checkpoint');
  const studyDir = path.join(tmp, 'reference-study'); fs.mkdirSync(studyDir);
  const studyResult = createB5ReferenceStudy(project, studyDir), study = read(studyResult.study);
  study.status = 'observed'; study.author_id = visual.author_id; study.viewing_mode = 'decoded_frames'; study.listening_performed = false;
  for (const beat of study.observations) for (const key of ['lead_visual', 'visual_change', 'timing', 'handoff'])
    beat[key] = 'Synthetic reference-study ' + key + ' fixture; no actual observation or creative approval is represented.';
  study.current_story_sequence = visual.actions.map(action => ({action_id: action.id,
    ...Object.fromEntries(['lead_visual', 'representation', 'change_from_previous', 'handoff', 'hold_reason', 'referent', 'preserved_identity_cues', 'visible_information_gain'].map(key => [key, 'Synthetic current-story ' + key + ' fixture, not creative direction.']))}));
  study.transfer_to_this_story = 'Synthetic declared transfer used only to test admission and provenance; no actual viewing or artistic approval.';
  write(studyResult.study, study);
  const rehearsal = writeSyntheticB5RelayRehearsal({dir, study, actionIds: visual.actions.map(action => action.id)});
  const create = () => {fs.mkdirSync(checkpointDir); return createB5PlanCheckpoint(project, checkpointDir);};
  const implement = () => fs.writeFileSync(path.join(scene, 'renderer.cjs'), renderer(true));
  return {tmp, dir, scene, c, project, targets, previewPlan, previewPlanFile, visual, checkpointDir, create, implement, study, studyResult, rehearsal};
}
async function candidateFixture(t, portrait = false, visualEvent = false) {
  const f = await fixture(t, portrait); if (visualEvent) makeVisualEvent(f); f.create(); f.implement();
  const framesDir = path.join(f.tmp, 'frames'), candidateDir = path.join(f.tmp, 'candidate'), evidenceDir = path.join(f.tmp, 'evidence'), reviewFile = path.join(f.tmp, 'preview-review.json');
  const frameRun = run(['frames', f.dir, '--output', framesDir, '--all', '--trusted-code', '--plan-lock', f.checkpointDir]);
  assert.equal(frameRun.status, 0, frameRun.stderr);
  const pngReview = await writeSyntheticB5PngReview({...f.project, framesDir});
  for (const args of [
    ['encode', f.dir, '--frames-dir', framesDir, '--audio', path.join(f.scene, 'mix.wav'), '--output', candidateDir, ...pngReview.cliArgs],
    ['review-pack', f.dir, '--candidate-dir', candidateDir, '--output', evidenceDir]
  ]) {const r = run(args); assert.equal(r.status, 0, r.stderr);}
  const candidate = read(path.join(candidateDir, 'candidate.json')), ledger = read(path.join(evidenceDir, 'evidence.json'));
  const args = {...f.project, candidateDir, evidenceDir, reviewFile, projectFingerprint: candidate.project_fingerprint};
  return {...f, framesDir, candidateDir, evidenceDir, reviewFile, candidate, ledger, args};
}
function makeVisualEvent(f) {
  f.visual.actions[0] = {id: 'move', kind: 'visual', start: 0, end: 2, event_region: f.visual.stage_region,
    intent: 'Synthetic graphic change fixture only, not creative approval.',
    movement: 'Synthetic pattern traverses its region and expands into the next arrangement.',
    visual_change: {before: 'A compact pattern at the entrance.', after: 'An expanded pattern at the exit.'},
    visual_phases: [{label: 'before', at: 0}, {label: 'after', at: 1.8}]};
  f.previewPlan.actions[0] = {id: 'move', kind: 'visual', before_state: 'Synthetic compact graphic before entry.',
    visual_change: 'Synthetic graphic crosses and expands into a new arrangement.', composition: 'Synthetic stage-local emphasis.',
    richness: 'Synthetic meaning-led change, not a creative approval.', hold_exit: 'Synthetic final graphic yields to the next event.'};
  write(path.join(f.scene, 'visual-plan.json'), f.visual); write(f.previewPlanFile, f.previewPlan);
  f.rehearsal.refreshBindings();
}

function syntheticReview(f) {
  const review = read(path.join(f.evidenceDir, 'preview-review-template.json'));
  review.reviewer = {id: 'synthetic-independent-reviewer', kind: 'agent', independent: true, method: 'Synthetic schema fixture only; no actual watching, listening or aesthetic approval.'};
  const obs = id => [{at: .5, detail: 'Synthetic engineering observation; not actual visual, human or user approval.', evidence_ids: [id]}];
  for (const [key, id] of [['silent_stage', 'full-stage-silent'], ['complete_mix', 'source-video']]) review.full_playback[key] = {status: 'pass', observations: obs(id), viewed_ranges: [{start: 0, end: 2}]};
  for (const action of review.actions) for (const key of Object.keys(action.checks)) action.checks[key] = {status: 'pass', observations: obs('action-' + action.id + '-continuous')};
  review.baseline_comparisons = f.targets.map(target => ({id: target.id, source_path: target.source_path, source_sha256: target.source_sha256, observations: obs('source-video')}));
  review.blocking_issues = []; write(f.reviewFile, review); return review;
}
function syntheticFormalReview(f) {
  const review = read(path.join(f.evidenceDir, 'review-template.json'));
  review.reviewer = {id: 'synthetic-formal-reviewer', kind: 'agent', independent: true, method: 'Synthetic formal schema fixture, not actual viewing or artistic approval.'};
  const obs = id => [{at: .5, detail: 'Synthetic engineering observation only, no actual watching, listening or user approval.', evidence_ids: [id]}];
  for (const [key, id] of [['silent_stage', 'full-stage-silent'], ['complete_mix', 'source-video'], ['captions_with_audio', 'full-captions-audio']])
    review.full_playback[key] = {status: 'pass', observations: obs(id), viewed_ranges: [{start: 0, end: 2}]};
  for (const [items, prefix] of [[review.actions, 'action'], [review.captions, 'caption']]) for (const item of items)
    for (const key of Object.keys(item.checks)) item.checks[key] = {status: 'pass', observations: obs(prefix + '-' + item.id + '-continuous')};
  review.baseline_comparisons = f.targets.map(target => ({id: target.id, source_path: target.source_path, source_sha256: target.source_sha256, observations: obs('source-video')}));
  review.blocking_issues = [];
  const file = path.join(f.tmp, 'full-review.json'); write(file, review); return file;
}

test('first planning checkpoint rejects absent plans, changed scaffold code and missing init origin', async t => {
  const f = await fixture(t);
  fs.renameSync(f.previewPlanFile, f.previewPlanFile + '.saved'); fs.mkdirSync(f.checkpointDir);
  assert.throws(() => createB5PlanCheckpoint(f.project, f.checkpointDir), /pre-authoring preview plan/);
  fs.renameSync(f.previewPlanFile + '.saved', f.previewPlanFile);
  f.implement(); assert.throws(() => createB5PlanCheckpoint(f.project, f.checkpointDir), /retrospectively lock/);
  fs.rmSync(path.join(f.dir, '.b5-authoring-start.json'));
  assert.throws(() => createB5PlanCheckpoint(f.project, f.checkpointDir), /old authored projects remain internal-only/);
});

test('neutral default init can lock a current-story plan before stage authoring while an untouched starter cannot render an old story', async t => {
  const f = await fixture(t, false, true), stageFile = path.join(f.scene, 'stage.cjs');
  assert.equal(fs.readFileSync(stageFile, 'utf8'), fs.readFileSync(path.join(root, 'examples/b5-mei-event-relay/new-story-stage.cjs'), 'utf8'));
  assert.throws(() => require(stageFile).scene(0), /new-story stage has not been authored/);
  const checkpoint = f.create(), locked = read(checkpoint.path);
  assert.deepEqual(locked.implementation_before, read(path.join(f.dir, '.b5-authoring-start.json')).implementation);
  assert.deepEqual(locked.first_use_resources.map(r => r.id).slice(-3), ['actual-relay-source-guide', 'actual-relay-source', 'actual-relay-rig']);
  assert.throws(() => validateB5PlanCheckpoint(f.project, f.checkpointDir), /no implementation change/);
  fs.writeFileSync(stageFile, "// Synthetic current-story implementation for admission tests only.\nconst scene=t=>'<rect x=\"'+(10+t*20)+'\" y=\"35\" width=\"8\" height=\"30\" fill=\"#202020\"/>';module.exports={scene,draw:scene};\n");
  assert.doesNotThrow(() => validateB5PlanCheckpoint(f.project, f.checkpointDir));
  delete require.cache[require.resolve(stageFile)];
  assert.notEqual(require(stageFile).scene(0), require(stageFile).scene(1));
  assert.equal(fs.existsSync(path.join(f.dir, 'preview-ready.json')), false);
});

test('first planning checkpoint requires observed current-story reference study by the plan author and binds it against later changes', async t => {
  const f = await fixture(t), original = structuredClone(f.study), saved = f.studyResult.study + '.saved';
  fs.mkdirSync(f.checkpointDir);
  fs.renameSync(f.studyResult.study, saved);
  assert.throws(() => createB5PlanCheckpoint(f.project, f.checkpointDir), /missing\/nonplain resource/);
  fs.renameSync(saved, f.studyResult.study);
  const reject = (mutate, pattern) => {const study = structuredClone(original); mutate(study); write(f.studyResult.study, study); assert.throws(() => createB5PlanCheckpoint(f.project, f.checkpointDir), pattern);};
  reject(s => {s.status = 'not_observed';}, /complete reference-study/);
  reject(s => {s.observations[0].handoff = '';}, /needs observed handoff/);
  reject(s => {s.resources[0].sha256 = '0'.repeat(64);}, /resources changed or are missing/);
  reject(s => {s.current_story_sequence[0].action_id = 'different-action';}, /every current action in order/);
  reject(s => {s.author_id = 'different-synthetic-author';}, /author/);
  write(f.studyResult.study, original);
  const checkpoint = createB5PlanCheckpoint(f.project, f.checkpointDir), locked = read(checkpoint.path);
  assert.equal(locked.reference_study_sha256, sha(f.studyResult.study));
  assert.equal(locked.reference_evidence_sha256, sha(f.studyResult.evidence));
  assert.equal(locked.relay_rehearsal_sha256, sha(f.rehearsal.file));
  assert.deepEqual(locked.first_use_resources, original.resources);
  f.implement(); assert.doesNotThrow(() => validateB5PlanCheckpoint(f.project, f.checkpointDir));
  original.transfer_to_this_story += ' Synthetic later edit.'; write(f.studyResult.study, original);
  f.rehearsal.refreshBindings();
  assert.throws(() => validateB5PlanCheckpoint(f.project, f.checkpointDir), /reference_study_sha256 changed/);
});

test('plan lock rejects post-lock rehearsal edits and changed or rehashed storyboard images', async t => {
  const f = await fixture(t); f.create(); f.implement();
  const original = read(f.rehearsal.file), image = original.storyboard.images[0], imageBytes = fs.readFileSync(image.path);
  const changed = structuredClone(original);
  changed.sequence_observations[0].detail += ' Synthetic later review edit.'; write(f.rehearsal.file, changed);
  assert.throws(() => validateB5PlanCheckpoint(f.project, f.checkpointDir), /relay_rehearsal_sha256 changed/);
  write(f.rehearsal.file, original);
  fs.copyFileSync(original.storyboard.board.path, image.path);
  assert.throws(() => validateB5PlanCheckpoint(f.project, f.checkpointDir), /(?:image|hash|changed)/);
  const rehashed = structuredClone(original); rehashed.storyboard.images[0].sha256 = sha(image.path); write(f.rehearsal.file, rehashed);
  assert.throws(() => validateB5PlanCheckpoint(f.project, f.checkpointDir), /relay_rehearsal_sha256 changed/);
  fs.writeFileSync(image.path, imageBytes); write(f.rehearsal.file, original);
  assert.doesNotThrow(() => validateB5PlanCheckpoint(f.project, f.checkpointDir));
});

test('visual planning uses declared visual change rather than fictional force/contact and preserves physical requirements', async t => {
  const f = await fixture(t); const physical = structuredClone(f.previewPlan.actions[0]);
  delete f.previewPlan.actions[0].contact; write(f.previewPlanFile, f.previewPlan); fs.mkdirSync(f.checkpointDir);
  assert.throws(() => createB5PlanCheckpoint(f.project, f.checkpointDir), /needs concrete contact/);
  f.previewPlan.actions[0] = physical; makeVisualEvent(f);
  const original = structuredClone(f.previewPlan.actions[0]);
  delete f.previewPlan.actions[0].visual_change; write(f.previewPlanFile, f.previewPlan);
  assert.throws(() => createB5PlanCheckpoint(f.project, f.checkpointDir), /needs concrete visual_change/);
  f.previewPlan.actions[0] = {...original, kind: 'physical'}; write(f.previewPlanFile, f.previewPlan);
  assert.throws(() => createB5PlanCheckpoint(f.project, f.checkpointDir), /kind must match/);
  f.previewPlan.actions[0] = original; write(f.previewPlanFile, f.previewPlan);
  assert.doesNotThrow(() => createB5PlanCheckpoint(f.project, f.checkpointDir));
});

test('visual preview emits change/readability/effects criteria and rejects a declared failed change', async t => {
  const f = await candidateFixture(t, false, true);
  const pending = read(path.join(f.evidenceDir, 'preview-review-template.json'));
  assert(pending.blocking_issues.length > 0);
  for (const check of Object.values(pending.actions[0].checks)) {
    assert.equal(check.status, 'unknown'); assert.deepEqual(check.observations, []);
  }
  write(f.reviewFile, pending);
  assert.throws(() => verifyB5PreviewReadiness(f.args), /independent reviewer/);
  const review = syntheticReview(f);
  assert.deepEqual(Object.keys(review.actions[0].checks), ['meaningful_change', 'composition', 'richness', 'effects', 'readability', 'pacing']);
  assert.equal(review.actions[0].checks.contact, undefined);
  assert.equal(review.actions[0].checks.natural_limbs, undefined);
  assert.equal(verifyB5PreviewReadiness(f.args).status, 'preview_ready');
  review.actions[0].checks.meaningful_change.status = 'fail'; write(f.reviewFile, review);
  assert.throws(() => verifyB5PreviewReadiness(f.args), /meaningful_change.*failed/);
});

test('plan lock binds every action, all required targets, voice and exact plan, with a chained revision before further implementation', async t => {
  const f = await fixture(t); const plan = f.create();
  assert.throws(() => validateB5PlanCheckpoint(f.project, f.checkpointDir), /no implementation change/);
  f.implement(); assert.equal(validateB5PlanCheckpoint(f.project, f.checkpointDir).sha256, plan.sha256);
  const originalTime = f.previewPlan.target_study[0].observations[0].at;
  f.previewPlan.target_study[0].observations[0].at = f.targets[0].duration_seconds; write(f.previewPlanFile, f.previewPlan);
  assert.throws(() => validateB5PlanCheckpoint(f.project, f.checkpointDir), /study needs actual timed observations/);
  f.previewPlan.target_study[0].observations[0].at = originalTime; write(f.previewPlanFile, f.previewPlan);
  f.previewPlan.actions[0].richness += ' Revised before next edit.'; write(f.previewPlanFile, f.previewPlan);
  f.rehearsal.refreshBindings();
  assert.throws(() => validateB5PlanCheckpoint(f.project, f.checkpointDir), /preview_plan_sha256 changed/);
  const revision = path.join(f.tmp, 'revision'); fs.mkdirSync(revision);
  createB5PlanCheckpoint(f.project, revision, {previous: f.checkpointDir});
  assert.throws(() => validateB5PlanCheckpoint(f.project, revision), /no implementation change/);
  fs.appendFileSync(path.join(f.scene, 'renderer.cjs'), '\n// Synthetic implementation revision after the plan checkpoint.\n');
  assert.doesNotThrow(() => validateB5PlanCheckpoint(f.project, revision));
  f.previewPlan.target_study.pop(); write(f.previewPlanFile, f.previewPlan);
  assert.throws(() => validateB5PlanCheckpoint(f.project, revision), /(?:all|required|latest|Mei|relay|targets)/);
});

for (const portrait of [false, true]) test(`native ${portrait ? '9:16' : '16:9'} uses the same continuous candidate preview checks`, async t => {
  const f = await candidateFixture(t, portrait), review = syntheticReview(f);
  const result = verifyB5PreviewReadiness(f.args);
  assert.equal(result.status, 'preview_ready'); assert.equal(result.user_acceptance, 'not_inferred');
  assert.deepEqual(Object.keys(review.actions[0].checks), ['causality', 'natural_limbs', 'composition', 'richness', 'pacing']);
  assert.deepEqual(result.baseline_sources.map(t => t.id), ['crazymei', 'spiderman', 'mei-event-relay']);
  assert(result.limits.some(s => /not authenticated/.test(s)));
});

test('preview fails closed on unknown, failed, still-only, incomplete playback, weak or incomplete-target reports', async t => {
  const f = await candidateFixture(t), original = syntheticReview(f);
  const reject = (mutate, pattern) => {const review = structuredClone(original); mutate(review); write(f.reviewFile, review); assert.throws(() => verifyB5PreviewReadiness(f.args), pattern);};
  reject(r => {r.actions[0].checks.richness.status = 'unknown';}, /richness.*failed/);
  reject(r => {r.actions[0].checks.natural_limbs.status = 'fail';}, /natural_limbs.*failed/);
  reject(r => {r.actions[0].checks.causality.observations[0].evidence_ids = ['action-move-contact'];}, /continuous playback/);
  reject(r => {r.full_playback.silent_stage.viewed_ranges = [{start: 0, end: 1}];}, /omit the ending/);
  reject(r => {r.full_playback.complete_mix.status = 'unknown';}, /complete_mix.*failed/);
  reject(r => {r.baseline_comparisons = r.baseline_comparisons.filter(b => b.id !== 'mei-event-relay');}, /(?:required|latest|relay|target comparisons)/);
  reject(r => {r.actions[0].checks.composition.observations[0].detail = 'pass';}, /specific detail/);
  reject(r => {r.reviewer.id = 'synthetic-author';}, /independent reviewer/);
  reject(r => {r.blocking_issues = ['Synthetic unresolved defect'];}, /blocking issues/);
});

test('candidate cannot attach a missing or different checkpoint after its frame ledger was made', async t => {
  const f = await candidateFixture(t); syntheticReview(f);
  const candidateFile = path.join(f.candidateDir, 'candidate.json'), original = read(candidateFile);
  const without = structuredClone(original); delete without.plan_checkpoint; write(candidateFile, without);
  assert.throws(() => candidateB5Plan(f.project, f.candidateDir), /internal use only/);
  write(candidateFile, original);
  const ledgerFile = original.frame_ledger_path, ledger = read(ledgerFile); delete ledger.plan_checkpoint; write(ledgerFile, ledger);
  // Even if a trusted caller rehashes the ledger, it never had the earlier lock.
  original.frame_ledger_sha256 = sha(ledgerFile); write(candidateFile, original);
  assert.throws(() => candidateB5Plan(f.project, f.candidateDir), /no post-hoc promotion/);
});

test('CLI creates no ready output for unknown reports; formal delivery needs both bound review gates', async t => {
  const f = await candidateFixture(t), readyDir = path.join(f.tmp, 'ready');
  fs.copyFileSync(path.join(f.evidenceDir, 'preview-review-template.json'), f.reviewFile);
  const command = ['preview-ready', f.dir, '--candidate-dir', f.candidateDir, '--evidence-dir', f.evidenceDir, '--review', f.reviewFile, '--output', readyDir];
  let result = run(command); assert.notEqual(result.status, 0); assert(!fs.existsSync(readyDir));
  syntheticReview(f); result = run(command); assert.equal(result.status, 0, result.stderr);
  const receipt = read(path.join(readyDir, 'preview-ready.json'));
  assert.equal(receipt.status, 'preview_ready'); assert.equal(receipt.user_acceptance, 'not_inferred');
  assert(!fs.existsSync(path.join(readyDir, 'delivery.json')));
  result = run(command); assert.notEqual(result.status, 0); assert.match(result.stderr, /refusing overwrite/);
  const fullReview = syntheticFormalReview(f), deliveryDir = path.join(f.tmp, 'delivery');
  const accept = ['accept', f.dir, '--candidate-dir', f.candidateDir, '--evidence-dir', f.evidenceDir, '--review', fullReview, '--preview-ready', readyDir, '--output', deliveryDir];
  const originalPreview = read(f.reviewFile);
  originalPreview.actions[0].checks.richness.status = 'unknown'; write(f.reviewFile, originalPreview);
  result = run(accept); assert.notEqual(result.status, 0); assert.match(result.stderr, /richness.*failed/);
  assert(!fs.existsSync(deliveryDir), 'a stale ready receipt is reverified before delivery');
  syntheticReview(f); result = run(accept); assert.equal(result.status, 0, result.stderr);
  const delivery = read(path.join(deliveryDir, 'delivery.json'));
  assert.equal(delivery.status, 'visual_review_passed'); assert.equal(delivery.user_acceptance, 'not_inferred');
  assert.equal(delivery.preview_readiness.status, 'preview_ready');
  assert.equal(sha(path.join(deliveryDir, 'video.mp4')), sha(path.join(f.candidateDir, 'video.mp4')));
  assert.equal(sha(path.join(deliveryDir, 'visual-review.json')), sha(fullReview));
  for (const artifact of f.ledger.artifacts) assert.equal(sha(path.join(deliveryDir, 'review-evidence', artifact.file)), artifact.sha256);
});
