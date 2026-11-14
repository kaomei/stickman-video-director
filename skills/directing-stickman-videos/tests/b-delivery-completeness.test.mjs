import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createCompletenessTemplate, checkCompleteness, fileEvidence} from '../scripts/b-delivery-completeness.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'b-completeness-'));
const save = (file, value) => fs.writeFileSync(file, JSON.stringify(value));
function ffmpeg(args) { const r = spawnSync(process.env.FFMPEG || 'ffmpeg', ['-v', 'error', ...args], {encoding: 'utf8'}); assert.equal(r.status, 0, r.stderr); }
const media = path.join(root, 'candidate.mp4'), silent = path.join(root, 'silent.mp4');
ffmpeg(['-f', 'lavfi', '-i', 'color=c=white:s=160x90:r=10:d=1', '-f', 'lavfi', '-i', 'sine=frequency=400:duration=1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', media]);
ffmpeg(['-f', 'lavfi', '-i', 'color=c=white:s=160x90:r=10:d=1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', silent]);
const source = path.join(root, 'self-created.wav'), script = path.join(root, 'script.txt'), rights = path.join(root, 'rights.txt'), styleGate = path.join(root, 'style-gate.json'), authority = path.join(root, 'actual-user-instruction.txt');
ffmpeg(['-f', 'lavfi', '-i', 'sine=frequency=400:duration=1', source]);
fs.writeFileSync(script, 'Test narration.'); fs.writeFileSync(rights, 'Test-only author-owned fixture.'); save(styleGate, {fixture: true}); fs.writeFileSync(authority, 'User explicitly asked for no music.');
let serial = 0;
function complete(style = 'B1') {
  const report = createCompletenessTemplate({style, ratio: '16:9', media});
  report.delivery_classification = 'final_delivery';
  report.reference = {...fileEvidence(media), study_observations: 'Test-only reference fixture, not a creative review.'};
  report.approved_script = fileEvidence(script);
  report.reviewer = {id: 'test-fixture-not-a-real-review', inspected_at: '2026-11-14T00:00:00Z', actual_picture_playback: true, actual_encoded_audio_listening: true};
  report.full_scope_review = {verdict: 'pass', ranges: [{start: 0, end: report.output.duration, speed: 1, observation: 'Fixture exercises declared full coverage only.'}]};
  for (const name of ['captions', 'sfx', 'music']) {
    const item = {id: `${name}-1`, start: 0, end: report.output.duration, purpose: 'Test-only semantic item', ...(name === 'captions' ? {text: 'Test narration.'} : {source: fileEvidence(source), license_evidence: fileEvidence(rights), rights_status: 'cleared_for_declared_use', declared_use: 'Local test fixture'})};
    const plan = path.join(root, `plan-${serial++}.json`); save(plan, {component: name, style, ratio: '16:9', output_sha256: report.output.sha256, items: [item]});
    Object.assign(report.components[name], {verdict: 'pass', plan: fileEvidence(plan), all_planned_items_checked: true, rendered_in_candidate: true, encoded_review: {verdict: 'pass', observation: 'Fixture declaration, not proof of actual quality.'}, items: [{id: item.id, verdict: 'pass', present_in_candidate: true, observation: 'Fixture checks report binding.'}]});
  }
  report.style_specific_acceptance = {verdict: 'pass', style, ratio: '16:9', output_sha256: report.output.sha256, evidence: fileEvidence(styleGate)};
  return report;
}
function changePlan(report, name, fn) { const item = report.components[name]; const plan = JSON.parse(fs.readFileSync(item.plan.file)); fn(plan); save(item.plan.file, plan); item.plan = fileEvidence(item.plan.file); }

test.after(() => fs.rmSync(root, {recursive: true, force: true}));
for (let n = 1; n <= 9; n++) test(`B${n} uses the same evidence gate without replacing its style gate`, () => {
  const report = complete(`B${n}`); assert.equal(checkCompleteness(report).completeness_review_status, 'recorded_pass'); report.style_specific_acceptance.verdict = 'not_checked'; assert.throws(() => checkCompleteness(report), /style-specific acceptance/);
});
test('generated report starts unchecked; no audio stream or wrong ratio is rejected', () => {
  const report = createCompletenessTemplate({style: 'B9', ratio: '16:9', media});
  assert.equal(report.components.music.verdict, 'not_checked'); assert.equal(report.reviewer.actual_encoded_audio_listening, false);
  assert.throws(() => checkCompleteness(report), /Declare/);
  assert.throws(() => createCompletenessTemplate({style: 'B9', ratio: '16:9', media: silent}), /audio streams/);
  assert.throws(() => createCompletenessTemplate({style: 'B9', ratio: '9:16', media}), /dimensions/);
});
test('missing music, sidecar-only captions and unrendered effects cannot pass', () => {
  for (const name of ['captions', 'sfx', 'music']) {
    const report = complete(); report.components[name].rendered_in_candidate = false; assert.throws(() => checkCompleteness(report), /not rendered/);
    delete report.components[name]; assert.throws(() => checkCompleteness(report), /missing required/);
  }
});
test('all actual planned IDs must be inspected, not an abbreviated review list', () => {
  const report = complete(); changePlan(report, 'captions', plan => plan.items.push({...plan.items[0], id: 'caption-2'})); assert.throws(() => checkCompleteness(report), /exactly once/);
});
test('stale output, source and plan fingerprints block reuse', () => {
  for (const mutate of [r => {r.output.sha256 = 'stale';}, r => {r.components.sfx.plan.sha256 = 'stale';}, r => changePlan(r, 'sfx', p => {p.items[0].source.sha256 = 'stale';}), r => changePlan(r, 'music', p => {p.output_sha256 = 'old-output';})]) {
    const report = complete(); mutate(report); assert.throws(() => checkCompleteness(report), /stale|another encoded/);
  }
});
test('a nonempty placeholder or video without audio cannot stand in for an actual used source', () => {
  for (const fakeSource of [script, silent]) {
    const report = complete(); changePlan(report, 'sfx', plan => {plan.items[0].source = fileEvidence(fakeSource);});
    assert.throws(() => checkCompleteness(report), /used source.*audio/);
  }
});
test('missing original-speed watching/listening or ending review blocks acceptance', () => {
  for (const mutate of [r => {r.reviewer.actual_encoded_audio_listening = false;}, r => {r.full_scope_review.ranges[0].speed = 2;}, r => {r.full_scope_review.ranges[0].end = .5;}]) {
    const report = complete(); mutate(report); assert.throws(() => checkCompleteness(report), /listening|original speed|ending/);
  }
});
test('whole-component omission requires bound actual explicit user instruction', () => {
  const report = complete(); report.components.music = {verdict: 'user_waived', items: [], user_override: {kind: 'story_silence', instruction: 'Agent decided it was fine.', evidence: fileEvidence(authority)}};
  assert.throws(() => checkCompleteness(report), /explicit user/);
  report.components.music.user_override.kind = 'explicit_user_instruction'; assert.equal(checkCompleteness(report).ok, true);
  report.components.music.user_override.evidence.sha256 = 'invented'; assert.throws(() => checkCompleteness(report), /stale/);
});
test('music must cover the scope or have timed narrative silence, not an unexplained token cue', () => {
  const report = complete(); changePlan(report, 'music', plan => {plan.items[0].end = .2;}); assert.throws(() => checkCompleteness(report), /ending/);
  report.components.music.intentional_silence = [{start: .2, end: report.output.duration, story_reason: 'Fixture records a motivated ending cut.', return_or_ending_cue: 'End of this fixture.'}]; assert.equal(checkCompleteness(report).ok, true);
  report.components.music.intentional_silence[0].story_reason = ''; assert.throws(() => checkCompleteness(report), /story reason/);
});
test('unresolved music rights can describe a local preview but cannot become a final or release-ready pass', () => {
  const report = complete('B9'); changePlan(report, 'music', p => {p.items[0].rights_status = 'unresolved';}); assert.throws(() => checkCompleteness(report), /rights block/);
  report.delivery_classification = 'local_preview'; const result = checkCompleteness(report); assert.equal(result.rights_status, 'unresolved'); assert.equal(result.delivery_status, 'local_preview_not_final'); assert.equal(result.release_ready, false);
});

test('style-specific evidence must bind the current style, ratio and encoded output', () => {
  for (const field of ['style', 'ratio', 'output_sha256']) { const report = complete(); report.style_specific_acceptance[field] = 'stale'; assert.throws(() => checkCompleteness(report), /another style\/ratio\/output/); }
});
