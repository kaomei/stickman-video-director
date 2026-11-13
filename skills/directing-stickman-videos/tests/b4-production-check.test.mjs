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
  const run = (options = {}) => {
    const ledger = path.join(root, 'ledger.json');
    fs.writeFileSync(ledger, JSON.stringify(data));
    return checkB4Production(ledger, options);
  };
  return {root, data, run, put};
}

test('portable evidence check reports B4 runtime support without claiming aesthetic acceptance', t => {
  const result = fixture(t).run();
  assert.equal(result.status, 'technical_only');
  assert.equal(result.typography_visual_acceptance, 'not_reviewed');
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
test('rejects a shot over three seconds and crop-only pseudo-cuts', t => {
  const f = fixture(t); f.data.shots[0].end_frame = 91; f.data.shots[1].start_frame = 91;
  assert.throws(() => f.run(), /exceeds 3 seconds/);
  f.data.shots[0].end_frame = 90; f.data.shots[1].start_frame = 90;
  f.data.shots[1].meaningful_view = 'door';
  assert.throws(() => f.run(), /exceeds 3 seconds/);
});
test('rejects missing shot coverage and an ordinary unapproved long hold', t => {
  const f = fixture(t); f.data.shots[1].start_frame = 91;
  assert.throws(() => f.run(), /gap, overlap/);
  f.data.shots = [{...f.data.shots[0], end_frame: 180, kind: 'exceptional_hold', reason: 'reading'}];
  assert.throws(() => f.run(), /exceeds 3 seconds/);
  f.data.shots[0].user_approval = 'User explicitly asked for six-second reading hold';
  assert.equal(f.run().status, 'technical_only');
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
