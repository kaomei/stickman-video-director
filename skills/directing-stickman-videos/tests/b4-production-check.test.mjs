import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {checkB4Production} from '../scripts/b4-production-check.mjs';

const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const prompt = fs.readFileSync(new URL('../assets/b4/style-lock.txt', import.meta.url), 'utf8');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'b4-evidence-test-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const put = (name, bytes) => { fs.writeFileSync(path.join(root, name), bytes); return hash(bytes); };
  // Synthetic bytes exercise evidence validation, not media quality or playback.
  const mediaHash = put('media.bin', 'synthetic test media');
  const promptHash = put('prompt.txt', `${prompt}\nA new underground parking scene.`);
  const scriptHash = put('script.txt', 'The lock moved, but nobody was outside.');
  const data = {schema: 'b4-production-ledger-v1', style: 'B4', fresh_test: true,
    style_lock_version: '2026-10-31-v3-white-glove-40s', fps: 30, duration_frames: 180,
    script: {file: 'script.txt', sha256: scriptHash, authorization: 'Synthetic fixture only: user supplied exact production script'},
    voice: {name: 'Brian', id: 'nPczCjzI2devNBz1zQrb', file: 'media.bin', sha256: mediaHash, input_script_sha256: scriptHash},
    opening: {left_half_shadow: true, question_groups: ['WOULD YOU', 'OPEN IT?'], group_start_frames: [0, 15], remainder_entrance: 'together'},
    assets: [{id: 'new-a', file: 'media.bin', sha256: mediaHash, provenance: 'new_generated', references: ['motor-room'], prompt_file: 'prompt.txt', prompt_sha256: promptHash}],
    shots: [{start_frame: 0, end_frame: 90, asset_id: 'new-a', meaningful_view: 'door', beat: 'sealed door'},
      {start_frame: 90, end_frame: 180, asset_id: 'new-a', meaningful_view: 'lock-state', beat: 'bolt retracts'}],
    ambience: [{start_frame: 0, end_frame: 180, file: 'media.bin', sha256: mediaHash, role: 'subtle_bed'}], audio_cuts: [],
    critical_sfx: [{id: 'bolt', file: 'media.bin', sha256: mediaHash, trigger: 'bolt retracts', perspective: 'close metal latch', rights_status: 'cleared', review: 'pass'}]};
  const planMotion = (index, overrides = {}) => {
    const shot = data.shots[index];
    const planFile = `motion-${index}.json`;
    const plan = {schema: 'b4-picture-motion-plan-v1', asset_id: shot.asset_id,
      start_frame: shot.start_frame, end_frame: shot.end_frame,
      events: [{subject: 'lock.bolt', property: 'translateX', from: 0, to: 16,
        start_frame: shot.start_frame, end_frame: shot.end_frame}]};
    shot.picture_motion = {kind: 'local_action', intent: 'The bolt moves before the door opens',
      before: 'Bolt extended', after: 'Bolt retracted', start_frame: shot.start_frame, end_frame: shot.end_frame,
      motion_plan_file: planFile, motion_plan_sha256: put(planFile, JSON.stringify(plan)), ...overrides};
    return plan;
  };
  planMotion(0); planMotion(1);
  const run = (options = {}) => {
    const ledger = path.join(root, 'ledger.json');
    fs.writeFileSync(ledger, JSON.stringify(data));
    return checkB4Production(ledger, options);
  };
  return {root, data, run, put, planMotion};
}

test('portable evidence check reports B4 runtime support without claiming aesthetic acceptance', t => {
  const result = fixture(t).run();
  assert.equal(result.status, 'technical_only');
  assert.equal(result.typography_visual_acceptance, 'not_reviewed');
  assert.equal(result.picture_visual_acceptance, 'not_reviewed');
  assert.equal(result.delivery_ready, false);
  assert.equal(result.renderer_support, true);
  assert.equal(result.physical_listening, 'not performed');
});
test('CLI success reports only technical checks and never visual acceptance or delivery readiness', t => {
  const f = fixture(t); f.run();
  const cli = fileURLToPath(new URL('../scripts/b4-production-check.mjs', import.meta.url));
  for (const args of [[], ['--planning']]) {
    const run = spawnSync(process.execPath, [cli, path.join(f.root, 'ledger.json'), ...args], {encoding: 'utf8'});
    assert.equal(run.status, 0, run.stderr);
    const report = JSON.parse(run.stdout);
    assert.equal(report.status, 'technical_only');
    assert.equal(report.typography_visual_acceptance, 'not_reviewed');
    assert.equal(report.picture_visual_acceptance, 'not_reviewed');
    assert.equal(report.delivery_ready, false);
    assert.equal(report.human_acceptance, 'not implied');
  }
  f.data.voice.sha256 = '0'.repeat(64);
  assert.throws(() => f.run(), /fingerprint/);
  const invalid = spawnSync(process.execPath, [cli, path.join(f.root, 'ledger.json')], {encoding: 'utf8'});
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /fingerprint/);
});
test('requires a script and recorded authorization even when planning media', t => {
  const f = fixture(t); const script = f.data.script;
  delete f.data.script;
  assert.throws(() => f.run({planning: true}), /script authorization/);
  f.data.script = {...script, authorization: true};
  assert.throws(() => f.run(), /script authorization/);
  f.data.script.authorization = '';
  assert.throws(() => f.run(), /script authorization/);
});
test('rejects a blank authorized script and a script changed after recording its fingerprint', t => {
  const f = fixture(t);
  f.data.script.sha256 = f.put('script.txt', '  \n');
  assert.throws(() => f.run(), /nonblank authorized narration/);
  f.put('script.txt', 'A different line.');
  assert.throws(() => f.run(), /script: fingerprint/);
});
test('requires voice input to refer to the exact authorized script, including in planning', t => {
  const f = fixture(t); f.data.voice.input_script_sha256 = '0'.repeat(64);
  assert.throws(() => f.run({planning: true}), /Voice input script fingerprint/);
  f.data.voice.input_script_sha256 = f.data.script.sha256;
  assert.equal(f.run().status, 'technical_only');
});
test('rejects wrong Brian ID, accepts explicit user recasting without renaming it Brian', t => {
  const f = fixture(t); f.data.voice.id = 'other-id';
  assert.throws(() => f.run(), /verified Brian/);
  f.data.voice.name = 'User selected actor'; f.data.voice.user_override = 'User requested this actor';
  assert.equal(f.run().status, 'technical_only');
});
test('changing view labels on reused still art cannot substitute for picture motion evidence', t => {
  const f = fixture(t);
  for (const [index, shot] of f.data.shots.entries()) {
    delete shot.picture_motion;
    shot.meaningful_view = `different crop ${index}`;
  }
  assert.throws(() => f.run(), /picture_motion/);
  assert.throws(() => f.run({planning: true}), /picture_motion/);
  f.data.shots[0].picture_motion = {kind: 'local_action', intent: 'Door moves', before: 'Closed', after: 'Open', start_frame: 0, end_frame: 90};
  assert.throws(() => f.run({planning: true}), /fingerprinted motion file or concrete motion plan/);
});
test('enforces the hard three-second shot limit despite complete action plans or self-approved holds', t => {
  const f = fixture(t);
  f.data.shots[0].end_frame = 91; f.data.shots[1].start_frame = 91;
  f.planMotion(0); f.planMotion(1);
  assert.throws(() => f.run(), /hard 3-second shot limit/);
  assert.throws(() => f.run({planning: true}), /hard 3-second shot limit/);
  Object.assign(f.data.shots[0], {kind: 'exceptional_hold', reason: 'Author wants a longer beat', user_approval: 'Author claims approval'});
  assert.throws(() => f.run(), /hard 3-second shot limit/);
  f.data.shots[0].picture_motion = {kind: 'motivated_hold', intent: 'Read the rule', before: 'Rule visible', after: 'Rule visible',
    reason: 'The rule needs reading time', support_shots: [1]};
  assert.throws(() => f.run(), /hard 3-second shot limit/);
});
test('three-second shots can develop the same scene but cannot self-certify a cross-shot state reset', t => {
  const f = fixture(t);
  f.data.shots[1].meaningful_view = f.data.shots[0].meaningful_view;
  const next = f.planMotion(1, {before: 'Bolt retracted', after: 'Bolt withdrawn farther'});
  next.events[0].from = 16; next.events[0].to = 32;
  f.data.shots[1].picture_motion.motion_plan_sha256 = f.put('motion-1.json', JSON.stringify(next));
  const report = f.run();
  assert.equal(report.status, 'technical_only');
  assert.equal(report.delivery_ready, false);
  assert.equal(report.picture_visual_acceptance, 'not_reviewed');
  assert.equal(report.three_second_timing.maximum_seconds, 3);
  assert.equal(report.three_second_timing.per_shot, 'within_limit');
  assert.equal(report.three_second_timing.across_shot_state_resets, 'pending_independent_review');
  assert.equal(report.suspicious_repeated_assets.length, 1);
  assert.deepEqual(report.suspicious_repeated_assets[0].shot_indices, [0, 1]);
  assert.match(report.picture_motion_evidence, /semantic purpose and long-form stability not reviewed/);
});
test('rejects missing shot coverage and a hold without a reason or adjacent action support', t => {
  const f = fixture(t); f.data.shots[1].start_frame = 91;
  assert.throws(() => f.run(), /gap, overlap/);
  f.data.shots[1].start_frame = 90;
  const motion = f.data.shots[0].picture_motion = {kind: 'motivated_hold', intent: 'Let the viewer read the rule',
    before: 'Rule visible', after: 'Rule visible', support_shots: [1]};
  assert.throws(() => f.run(), /motivated_hold needs a story\/reading reason/);
  motion.reason = 'The visible rule must be read before the bolt moves';
  assert.equal(f.run().status, 'technical_only');
  motion.support_shots = [0];
  assert.throws(() => f.run(), /adjacent non-hold/);
  motion.support_shots = [2];
  assert.throws(() => f.run(), /adjacent non-hold/);
  f.data.duration_frames = 90; f.data.ambience[0].end_frame = 90;
  f.data.shots = [{...f.data.shots[0], end_frame: 90}];
  motion.support_shots = [];
  assert.throws(() => f.run(), /adjacent non-hold/);
});
test('rejects unchanged, mistimed, stale and unbound render-plan events', t => {
  const f = fixture(t);
  const plan = f.planMotion(0);
  const motion = f.data.shots[0].picture_motion;
  const save = () => { motion.motion_plan_sha256 = f.put(motion.motion_plan_file, JSON.stringify(plan)); };
  plan.events[0].to = plan.events[0].from; save();
  assert.throws(() => f.run(), /distinct from\/to/);
  plan.events[0].from = {x: 0, y: 1}; plan.events[0].to = {y: 1, x: 0}; save();
  assert.throws(() => f.run(), /distinct from\/to/);
  plan.events[0].from = 0; plan.events[0].to = 16;
  plan.events[0].end_frame = 91; save();
  assert.throws(() => f.run(), /in-range subject\/property change/);
  plan.events[0].end_frame = 90; plan.asset_id = 'another-asset'; save();
  assert.throws(() => f.run(), /bind its asset/);
  plan.asset_id = 'new-a'; plan.start_frame = 1; save();
  assert.throws(() => f.run(), /absolute frame interval/);
  plan.start_frame = 0; save();
  f.put(motion.motion_plan_file, JSON.stringify({...plan, events: []}));
  assert.throws(() => f.run(), /fingerprint/);
  save(); motion.before = motion.after;
  assert.throws(() => f.run(), /before\/after must describe a change/);
});
test('existing motion media is fingerprinted even when planning and is never claimed visually accepted', t => {
  const f = fixture(t); const motion = f.data.shots[0].picture_motion;
  delete motion.motion_plan_file; delete motion.motion_plan_sha256;
  motion.motion_file = 'motion.bin'; motion.motion_sha256 = f.put('motion.bin', 'synthetic motion bytes, not validated animation');
  assert.equal(f.run().picture_visual_acceptance, 'not_reviewed');
  delete motion.motion_sha256;
  assert.throws(() => f.run({planning: true}), /fingerprint required/);
  motion.motion_sha256 = f.put('motion.bin', '');
  assert.throws(() => f.run({planning: true}), /motion media is empty/);
});
test('planning needs an existing concrete plan when animation media has not been made', t => {
  const f = fixture(t); const motion = f.data.shots[0].picture_motion;
  motion.motion_file = 'not-yet-generated.mp4'; motion.motion_sha256 = '0'.repeat(64);
  const report = f.run({planning: true});
  assert.equal(report.mode, 'planning_only');
  assert.equal(report.delivery_ready, false);
  assert.equal(report.picture_visual_acceptance, 'not_reviewed');
  assert.deepEqual(report.pending, ['shot 0 motion media: media not generated']);
  delete motion.motion_plan_file; delete motion.motion_plan_sha256;
  assert.throws(() => f.run({planning: true}), /existing fingerprinted plan or media/);
});
test('duplicate art under different asset IDs is flagged for review without banning reuse', t => {
  const f = fixture(t);
  f.data.assets.push({...f.data.assets[0], id: 'same-art-new-id'});
  f.data.shots[1].asset_id = 'same-art-new-id';
  f.data.shots[1].meaningful_view = 'Tighter crop with new subtitle';
  f.data.shots[1].crop = {x: 100, y: 100, width: 200, height: 200};
  f.data.shots[1].subtitle = 'A changed subtitle';
  f.planMotion(1);
  const report = f.run();
  assert.equal(report.status, 'technical_only');
  assert.equal(report.suspicious_repeated_assets.length, 1);
  assert.deepEqual(report.suspicious_repeated_assets[0].asset_ids, ['new-a', 'same-art-new-id']);
  assert.equal(report.suspicious_repeated_assets[0].review_required, true);
  assert.equal(report.three_second_timing.across_shot_state_resets, 'pending_independent_review');
  assert.match(report.three_second_timing.reset_evidence, /labels, segmentation, crops and subtitle updates are not proof/);
  assert.equal(report.picture_visual_acceptance, 'not_reviewed');
  assert.equal(report.delivery_ready, false);
});
test('rejects word-staggered remainder, missing shadow and false blanket opening override', t => {
  const f = fixture(t); f.data.opening.remainder_entrance = 'word_by_word';
  assert.throws(() => f.run(), /Opening/);
  f.data.opening.remainder_entrance = 'together'; f.data.opening.left_half_shadow = false;
  f.data.opening.user_override = true;
  assert.throws(() => f.run(), /Opening/);
});
test('native portrait ledger records its real layout and refuses landscape half-shadow claims', t => {
  const f = fixture(t);
  f.data.width = 1080; f.data.height = 1920;
  assert.throws(() => f.run(), /Opening/);
  f.data.opening = {...f.data.opening, preset: 'b4-portrait-poster-v1', layout: 'portrait-poster', left_half_shadow: false,
    top_breathing_space: true, lower_picture_unobscured: true, native_portrait_art: true, whole_payoff_settle: true, short_emphasis_line: true};
  assert.equal(f.run().status, 'technical_only', 'recorded facts do not certify actual playback or aesthetics');
  for (const field of ['top_breathing_space', 'lower_picture_unobscured', 'native_portrait_art', 'whole_payoff_settle', 'short_emphasis_line']) {
    f.data.opening[field] = false; assert.throws(() => f.run(), /Opening/); f.data.opening[field] = true;
  }
  f.data.opening.left_half_shadow = true; assert.throws(() => f.run(), /Opening/);
  f.data.opening.left_half_shadow = false; f.data.width = '1080'; assert.throws(() => f.run(), /Opening/);
  f.data.height = 720; f.data.width = 1280;
  assert.throws(() => f.run(), /Opening/);
});
test('rejects stale references, abbreviated prompts and reused film art in a fresh test', t => {
  const f = fixture(t); f.data.assets[0].references = ['dispatch-office'];
  assert.throws(() => f.run(), /canonical reference/);
  f.data.assets[0].references = ['driver'];
  f.data.assets[0].prompt_sha256 = f.put('prompt.txt', 'same B4 style');
  assert.throws(() => f.run(), /complete canonical/);
  f.data.assets[0].prompt_sha256 = f.put('prompt.txt', prompt);
  f.data.assets[0].provenance = 'project_owned';
  assert.throws(() => f.run(), /reuse old film art/);
});
test('rejects changed fingerprints and project escape paths even in planning mode', t => {
  const f = fixture(t); f.data.voice.sha256 = '0'.repeat(64);
  assert.throws(() => f.run(), /fingerprint/);
  f.data.voice.file = '../elsewhere.wav';
  assert.throws(() => f.run({planning: true}), /escapes project/);
});
test('rejects undeclared ambience gap; allows motivated AUDIO CUT', t => {
  const f = fixture(t); f.data.ambience[0].end_frame = 120;
  assert.throws(() => f.run(), /coverage/);
  f.data.audio_cuts = [{start_frame: 120, end_frame: 180, reason: 'door closes', return_trigger: 'end of programme'}];
  assert.equal(f.run().status, 'technical_only');
});
test('rejects empty consequential SFX, uncleared rights and unreviewed critical effect', t => {
  const f = fixture(t); const cue = f.data.critical_sfx[0];
  f.data.critical_sfx = [];
  assert.throws(() => f.run(), /absence of critical/);
  f.data.critical_sfx = [cue]; cue.rights_status = 'pending';
  assert.throws(() => f.run(), /rights not cleared/);
  cue.rights_status = 'cleared'; cue.review = 'pending';
  assert.throws(() => f.run(), /review incomplete/);
});
test('planning allows missing generated media but cannot be reported as delivery evidence', t => {
  const f = fixture(t); f.data.voice.file = 'not-yet-generated.wav';
  f.data.critical_sfx[0].review = 'pending';
  const result = f.run({planning: true});
  assert.equal(result.mode, 'planning_only');
  assert.equal(result.status, 'technical_only');
  assert.equal(result.typography_visual_acceptance, 'not_reviewed');
  assert.equal(result.delivery_ready, false);
  assert.equal(result.pending.length, 2);
  assert.throws(() => f.run(), /ENOENT/);
});


test('B4 ledger cannot relabel copied reference bytes as new_generated or waive them in planning',t=>{
  const f=fixture(t),bytes=fs.readFileSync(new URL('../assets/b4/reference-04-street.png',import.meta.url));
  f.data.assets[0].file='new-art.png';f.data.assets[0].sha256=f.put('new-art.png',bytes);
  f.data.assets[0].reuse_reason='Author claims a fresh scene';
  for(const planning of [false,true])assert.throws(()=>f.run({planning}),/B4 asset origin:.*style_reference street/);
});
test('motion media cannot be a renamed approved showcase even with a separate valid motion plan',t=>{
  const f=fixture(t),bytes=fs.readFileSync(new URL('../assets/b4/portrait-opening-approved.mp4',import.meta.url));
  const motion=f.data.shots[0].picture_motion;
  motion.motion_file='new-motion.mp4';motion.motion_sha256=f.put(motion.motion_file,bytes);
  for(const planning of [false,true])assert.throws(()=>f.run({planning}),/B4 asset origin:.*approved_showcase portrait-opening-video/);
});
