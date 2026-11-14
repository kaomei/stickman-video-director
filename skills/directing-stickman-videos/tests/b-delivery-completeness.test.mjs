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
const source = path.join(root, 'self-created.wav'), script = path.join(root, 'script.txt'), rights = path.join(root, 'rights.txt'), authority = path.join(root, 'actual-user-instruction.txt');
ffmpeg(['-f', 'lavfi', '-i', 'sine=frequency=400:duration=1', source]);
fs.writeFileSync(script, 'Test narration.'); fs.writeFileSync(rights, 'Test-only author-owned fixture.'); fs.writeFileSync(authority, 'User explicitly asked for no music.');
let serial = 0;
// Native-schema fixtures exercise binding and recorded verdicts only. They are
// deliberately not claims that this synthetic one-second movie is a style sample.
function nativeProof(report, mutate = () => {}) {
  const {style, ratio, output} = report, range = {start: 0, end: output.duration};
  const pass = () => ({status: 'pass', observations: ['Test-only recorded observation.']});
  const full = () => ({...pass(), viewed_ranges: [range]});
  const record = (kind, acceptance, evidence, review, render_report) => ({kind, acceptance, evidence, review, render_report});
  const kinds = {B1: ['reference'], B2: ['reference'], B3: ['reference'], B4: ['picture', 'typography'], B5: ['visual'], B6: ['motion'], B7: ['pixel'], B8: ['greek'], B9: ['live-sketch']}[style];
  const reports = kinds.map(kind => {
    const acceptance = {schema: 1, output: output.file, output_sha256: output.sha256};
    const evidence = {schema: 1, output: output.file, output_sha256: output.sha256, metadata: {width: output.width, height: output.height}};
    const review = {schema: 1, output_sha256: output.sha256, full_playback: full(), blocking_issues: []};
    if (kind === 'reference') {
      Object.assign(acceptance, {style, status: 'sample_target_review_passed', scope: range});
      evidence.style = style; review.style = style; review.shots = [{id: 'shot-1', checks: {reference_match: pass()}}];
    } else if (kind === 'picture' || kind === 'typography') {
      Object.assign(acceptance, kind === 'picture' ? {status: 'independent_picture_review_pass', scope: 'picture only', range} : {status: 'independent_visual_review_pass', scope: range});
      review[kind === 'picture' ? 'shots' : 'moments'] = [{checks: {actual_picture: pass()}}];
    } else if (kind === 'visual') {
      Object.assign(acceptance, {style, status: 'independent_visual_review_pass'});
      Object.assign(evidence, {style, source: {path: output.file, sha256: output.sha256}, config: {width: output.width, height: output.height, duration: output.duration}});
      review.video_sha256 = output.sha256; delete review.output_sha256;
      review.full_playback = Object.fromEntries(['silent_stage', 'complete_mix', 'captions_with_audio'].map(key => [key, full()]));
      review.actions = [{checks: {arm_pose: pass()}}]; review.captions = [{checks: {actual_animation: pass()}}];
    } else if (kind === 'motion') {
      const fingerprint = 'native-project-test-fingerprint';
      return record(kind, {status: 'reviewer_passed_not_automatic_aesthetic_judgment'}, undefined,
        {schema_version: 3, ratio, fingerprint, preview: {path: output.file, sha256: output.sha256, ...range}, review: pass(), full_playback: {preview_sha256: output.sha256, ...range, speed: 1}, checks: {body_action: pass()}, shots: [pass()], regressions: [], remaining_gaps: [], supplemental_audit: {known_confirmed_defect: false}},
        {kind: 'render', technical_fixture: false, purpose: 'production', technical_status: 'pass', ratio, fingerprint, video: output.file, video_sha256: output.sha256, time_range: range});
    } else if (kind === 'pixel') {
      const playback = () => ({status: 'pass', speed: 1, ranges: [[0, output.duration]], observations: [{time: 0, detail: 'Test-only observation.', evidence_ids: ['beat-1']}]});
      return record(kind, {schema: 1, style, delivery_ready: true, technical_status: 'pass', creative_review_status: 'recorded_pass', media_sha256: output.sha256},
        {schema: 1, style, video: {...output}}, {schema: 1, style, full_playback: playback(), full_listening: playback(), checks: {reference_match: pass()}});
    } else if (kind === 'greek') {
      const artifact = {path: output.file, sha256: output.sha256};
      return record(kind, {ok: true, errors: []}, undefined,
        {kind: 'b8_encoded_film', range: [0, output.duration], shot_digests: {'shot-1': 'native-shot-fingerprint'}, artifacts: [artifact], technical: {ok: true}, quality_review: {version: 1, stage: 'film', width: output.width, height: output.height, items: ['cast_style', 'composition', 'arm_direction', 'spatial_motion'].map(check => ({check, shot_id: check === 'cast_style' ? '__cast__' : 'shot-1', character_ids: ['hero'], status: 'accepted', reviewer: 'test-fixture', notes: 'Test-only recorded native check.', evidence: [artifact]}))}, visual_review: 'recorded_pass', actual_listening: 'recorded_pass', user_acceptance: 'pending'});
    } else if (kind === 'live-sketch') {
      return record(kind, undefined, undefined,
        {template_only: false, style: 'B9 · 白板图解风 · Live Sketch', status: 'ready_for_user_review', output_video: output.file, output_sha256: output.sha256, scope_seconds: [0, output.duration], format: {aspect_ratio: ratio, output_size_pixels: [output.width, output.height]}, checks: ['drawing_process', 'narration_and_picture', 'composition_and_richness', 'character_and_pen_shape', 'contact_and_live_editing', 'technical_and_preservation'].map(id => ({id, verdict: 'pass', findings: ['Test-only recorded native check.']})), format_layout_review: {verdict: 'pass'}, single_pen_review: {verdict: 'pass'}, editor_drag_review: {verdict: 'pass'}, continuous_review: {method: 'Test-only normal-speed declaration.', normal_speed_playback_observed: true, covered_intervals_seconds: [[0, output.duration]]}, unresolved_limitations: [], issues: []});
    }
    return record(kind, acceptance, evidence, review);
  });
  const references = reports.map(native => {
    mutate(native.kind, native);
    const entry = {kind: native.kind};
    const write = key => { const file = path.join(root, `native-${serial++}-${key}.json`); save(file, native[key]); entry[key] = fileEvidence(file); };
    if (native.evidence) { write('evidence'); native.review.evidence_sha256 = entry.evidence.sha256; if (native.kind !== 'pixel') native.acceptance.evidence_sha256 = entry.evidence.sha256; }
    if (native.render_report) { write('render_report'); native.review.report_sha256 = entry.render_report.sha256; }
    write('review');
    if (native.acceptance) {
      if (native.kind === 'motion') native.acceptance.sha256 = entry.review.sha256;
      else if (native.kind === 'greek') native.acceptance.review_manifest = entry.review.file;
      else native.acceptance.review_sha256 = entry.review.sha256;
      write('acceptance');
    }
    return entry;
  });
  const index = path.join(root, `style-index-${serial++}.json`);
  save(index, {schema: 'b-style-acceptance-index/1', verdict: 'pass', style, ratio, output_sha256: output.sha256, reports: references});
  report.style_specific_acceptance = {verdict: 'pass', style, ratio, output_sha256: output.sha256, evidence: fileEvidence(index)};
}
function complete(style = 'B1', mutateNative) {
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
  nativeProof(report, mutateNative);
  return report;
}
function changePlan(report, name, fn) { const item = report.components[name]; const plan = JSON.parse(fs.readFileSync(item.plan.file)); fn(plan); save(item.plan.file, plan); item.plan = fileEvidence(item.plan.file); }
function changeIndex(report, fn) { const item = report.style_specific_acceptance.evidence; const index = JSON.parse(fs.readFileSync(item.file)); fn(index); save(item.file, index); report.style_specific_acceptance.evidence = fileEvidence(item.file); }

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

test('an opaque evidence file or a relabeled stale inner index cannot grant a style pass', () => {
  const opaque = complete(); save(opaque.style_specific_acceptance.evidence.file, {fixture: true}); opaque.style_specific_acceptance.evidence = fileEvidence(opaque.style_specific_acceptance.evidence.file);
  assert.throws(() => checkCompleteness(opaque), /native-report index/);
  for (const field of ['style', 'ratio', 'output_sha256']) {
    const report = complete(); changeIndex(report, index => {index[field] = 'stale';}); assert.throws(() => checkCompleteness(report), /inner index scope/);
  }
});
test('current outer labels cannot reuse another movie native report in any B route', () => {
  for (let n = 1; n <= 9; n++) {
    const report = complete(`B${n}`, (kind, native) => {
      if (kind === 'motion') native.review.preview.sha256 = 'old-movie';
      else if (kind === 'pixel') native.acceptance.media_sha256 = 'old-movie';
      else if (kind === 'greek') native.review.artifacts[0].sha256 = 'old-movie';
      else if (kind === 'live-sketch') native.review.output_sha256 = 'old-movie';
      else native.acceptance.output_sha256 = 'old-movie';
    });
    assert.throws(() => checkCompleteness(report), /another output|no current encoded output/, `B${n} accepted old native media`);
  }
});
test('current outer ratio cannot conceal the wrong native ratio or dimensions', () => {
  for (let n = 1; n <= 9; n++) {
    const report = complete(`B${n}`, (kind, native) => {
      if (kind === 'motion') native.review.ratio = '9:16';
      else if (kind === 'pixel') native.evidence.video.width = 90;
      else if (kind === 'greek') native.review.quality_review.width = 90;
      else if (kind === 'live-sketch') native.review.format.aspect_ratio = '9:16';
      else if (kind === 'visual') native.evidence.config.width = 90;
      else native.evidence.metadata.width = 90;
    });
    assert.throws(() => checkCompleteness(report), /ratio|dimensions|scope mismatch/, `B${n} accepted wrong native aspect`);
  }
});
test('a failed, limited or pending native acceptance cannot be promoted by a current index', () => {
  for (let n = 1; n <= 9; n++) {
    const report = complete(`B${n}`, (kind, native) => {
      if (kind === 'pixel') native.acceptance.creative_review_status = 'pending';
      else if (kind === 'greek') native.acceptance.ok = false;
      else if (kind === 'live-sketch') native.review.status = 'not_checked';
      else native.acceptance.status = kind === 'reference' ? 'best_effort_limited' : 'failed';
    });
    assert.throws(() => checkCompleteness(report), /missing.*failed|not passed/, `B${n} accepted failed native gate`);
  }
});
test('actual failed native review checks are rejected even with freshly consistent file hashes', () => {
  for (let n = 1; n <= 9; n++) {
    const report = complete(`B${n}`, (kind, native) => {
      if (kind === 'reference' || kind === 'picture') native.review.shots[0].checks = {observed: {status: 'failed'}};
      else if (kind === 'typography') native.review.moments[0].checks.actual_picture.status = 'failed';
      else if (kind === 'visual') native.review.full_playback.complete_mix.status = 'failed';
      else if (kind === 'motion') native.review.review.status = 'failed';
      else if (kind === 'pixel') native.review.checks.reference_match.status = 'failed';
      else if (kind === 'greek') native.review.quality_review.items[1].status = 'failed';
      else native.review.single_pen_review.verdict = 'failed';
    });
    assert.throws(() => checkCompleteness(report), /failed/, `B${n} accepted failed native review`);
  }
});
test('missing native checks, files and stale hash-chain links cannot count as review', () => {
  const unchecked = complete('B1', (_kind, native) => {native.review.shots = [{fixture: true}];});
  assert.throws(() => checkCompleteness(unchecked), /verdicts missing/);
  const missing = complete(); changeIndex(missing, index => {delete index.reports[0].review;});
  assert.throws(() => checkCompleteness(missing), /reference\/review.*file required/);
  const stale = complete(); changeIndex(stale, index => {
    const row = index.reports[0], review = JSON.parse(fs.readFileSync(row.review.file)); review.revision = 'changed after receipt'; save(row.review.file, review); row.review = fileEvidence(row.review.file);
  });
  assert.throws(() => checkCompleteness(stale), /hash chain is stale/);
});
test('B4 retains both independent picture and typography gates, including native picture-only range', () => {
  assert.equal(checkCompleteness(complete('B4')).ok, true);
  for (const kind of ['picture', 'typography']) {
    const report = complete('B4'); changeIndex(report, index => {index.reports = index.reports.filter(row => row.kind !== kind);});
    assert.throws(() => checkCompleteness(report), /missing\/duplicate native style gates/);
  }
  const report = complete('B4', (kind, native) => {if (kind === 'typography') native.review.moments[0].checks.actual_picture.status = 'not_checked';});
  assert.throws(() => checkCompleteness(report), /pending\/failed/);
});
test('native preview receipts may be read from their actual approval envelope keys', () => {
  for (const style of ['B1', 'B4']) {
    const report = complete(style); changeIndex(report, index => {
      for (const row of index.reports) {
        const key = {reference: 'reference_acceptance', picture: 'picture_acceptance', typography: 'typography_acceptance'}[row.kind];
        const acceptance = JSON.parse(fs.readFileSync(row.acceptance.file)); save(row.acceptance.file, {[key]: acceptance}); row.acceptance = fileEvidence(row.acceptance.file); row.acceptance_key = key;
      }
    });
    assert.equal(checkCompleteness(report).ok, true);
  }
});
test('B5 native review needs every playback channel rather than a failed complete mix', () => {
  const report = complete('B5', (_kind, native) => {native.review.full_playback.silent_stage.status = 'pending';});
  assert.throws(() => checkCompleteness(report), /pending\/failed/);
  const delivery = complete('B5', (_kind, native) => {native.acceptance.status = 'visual_review_passed';});
  assert.equal(checkCompleteness(delivery).ok, true);
  const missing = complete('B5', (_kind, native) => {delete native.review.full_playback.silent_stage;});
  assert.throws(() => checkCompleteness(missing), /channel missing\/failed/);
});
test('pending-style native coverage and B9 encoded hash remain actual inner requirements', () => {
  const pixel = complete('B7', (_kind, native) => {native.review.full_listening.ranges[0][1] = .5;});
  assert.throws(() => checkCompleteness(pixel), /ending/);
  const greek = complete('B8', (_kind, native) => {native.review.quality_review.items[1].status = 'not_applicable';});
  assert.throws(() => checkCompleteness(greek), /pending\/failed/);
  const sketch = complete('B9', (_kind, native) => {delete native.review.output_sha256;});
  assert.throws(() => checkCompleteness(sketch), /another output/);
});
