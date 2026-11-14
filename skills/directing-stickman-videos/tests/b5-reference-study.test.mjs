import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {createB5ReferenceStudy, validateB5ReferenceStudy, requiredB5FirstUseResources, validateB5RelayRehearsal} from '../scripts/b5-reference-study.mjs';
import {writeSyntheticB5RelayRehearsal} from './helpers/b5-rehearsal-fixture.mjs';

// Synthetic contract/provenance fixtures only. Filled declarations below are
// deliberately test-only and represent no real viewing, direction or approval.
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const actionIds = ['entry', 'explanation'];
function fixture(t) {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'b5-reference-test-')));
  t.after(() => fs.rmSync(tmp, {recursive: true, force: true}));
  const dir = path.join(tmp, 'project'), out = path.join(tmp, 'study-evidence');
  fs.mkdirSync(dir); fs.mkdirSync(out);
  const result = createB5ReferenceStudy({dir}, out);
  return {tmp, dir, out, result, study: read(result.study), manifest: read(result.evidence)};
}
function observed(f, {rehearsal = true} = {}) {
  const study = structuredClone(f.study);
  study.status = 'observed'; study.author_id = 'synthetic-test-author';
  study.viewing_mode = 'decoded_frames'; study.listening_performed = false;
  for (const beat of study.observations) for (const key of ['lead_visual', 'visual_change', 'timing', 'handoff'])
    beat[key] = 'Synthetic observed ' + key + ' field for contract tests only; no actual reference viewing is asserted.';
  const semanticRead = {
    entry: {
      referent: 'Synthetic contract fixture: the first diagram refers to one black square moving from the left edge toward the center.',
      preserved_identity_cues: 'Synthetic contract fixture: four equal edges, black fill and the complete square silhouette identify the same test shape throughout the move.',
      visible_information_gain: 'Synthetic contract fixture: the square changes position while its outline remains visible, exposing the start-to-center displacement.'
    },
    explanation: {
      referent: 'Synthetic contract fixture: the second diagram refers to the same square and the displacement established by the entry row.',
      preserved_identity_cues: 'Synthetic contract fixture: paired complete black square silhouettes retain the source shape and distinguish the start and end positions.',
      visible_information_gain: 'Synthetic contract fixture: a paired position diagram exposes both locations together so displacement can be compared; this is a schema fixture, not an observed film.'
    }
  };
  study.current_story_sequence = actionIds.map(action_id => ({action_id,
    ...Object.fromEntries(['lead_visual', 'representation', 'change_from_previous', 'handoff', 'hold_reason'].map(key => [key, 'Synthetic story ' + key + ' field only; no actual creative direction.'])),
    ...semanticRead[action_id]}));
  study.transfer_to_this_story = 'Synthetic test-only transfer declaration; this is not actual viewing, listening or artistic approval.';
  write(f.result.study, study);
  if (rehearsal) f.rehearsal = writeSyntheticB5RelayRehearsal({dir: f.dir, study, actionIds});
  return study;
}

test('reference extraction binds the latest example, original prompt, approved film and approval without inventing observation', t => {
  const f = fixture(t), resources = requiredB5FirstUseResources();
  assert.deepEqual(resources.map(r => r.id), ['filled-mei-example', 'verified-original-prompt', 'mei-event-relay', 'relay-user-approval', 'actual-relay-source-guide', 'actual-relay-source', 'actual-relay-rig']);
  for (const resource of resources) {assert(path.isAbsolute(resource.path)); assert.equal(sha(resource.path), resource.sha256);}
  const approval = read(resources.find(r => r.id === 'relay-user-approval').path);
  assert.equal(approval.approved_video_sha256, resources.find(r => r.id === 'mei-event-relay').sha256);
  assert.deepEqual(f.result.required_first_use, resources);
  assert.equal(f.result.status, 'extracted_not_observed');
  assert.equal(f.manifest.status, 'extracted_not_observed');
  assert.equal(f.manifest.project, f.dir); assert.equal(f.manifest.samples.length, 12);
  for (const artifact of [...f.manifest.samples, f.manifest.board])
    assert.equal(sha(path.join(f.out, artifact.name)), artifact.sha256);
  assert.equal(f.study.status, 'not_observed'); assert.equal(f.study.viewing_mode, 'unobserved');
  assert.equal(f.study.listening_performed, false); assert.equal(f.study.author_id, '');
  assert.equal(f.study.current_story_sequence.length, 0);
  const rehearsal = read(path.join(f.dir, 'relay-rehearsal.json'));
  assert.equal(rehearsal.status, 'not_reviewed'); assert.equal(rehearsal.author_id, '');
  assert.deepEqual(rehearsal.first_read_dispositions, []);
  for (const beat of f.study.observations) for (const key of ['lead_visual', 'visual_change', 'timing', 'handoff']) assert.equal(beat[key], '');
  assert.throws(() => validateB5ReferenceStudy(f.dir, actionIds), /complete reference-study/);
  assert.throws(() => createB5ReferenceStudy({dir: f.dir}, f.out), /already exists/);
});

test('reference admission rejects missing or blank study, wrong resources and unsupported observation claims', t => {
  const f = fixture(t), original = observed(f), saved = f.result.study + '.saved';
  fs.renameSync(f.result.study, saved);
  assert.throws(() => validateB5ReferenceStudy(f.dir, actionIds), /missing\/nonplain resource/);
  fs.renameSync(saved, f.result.study);
  const reject = (mutate, pattern) => {const study = structuredClone(original); mutate(study); write(f.result.study, study); assert.throws(() => validateB5ReferenceStudy(f.dir, actionIds), pattern);};
  reject(s => {s.observations[0].lead_visual = ' ';}, /needs observed lead_visual/);
  reject(s => {s.resources.find(r => r.id === 'mei-event-relay').sha256 = '0'.repeat(64);}, /resources changed or are missing/);
  reject(s => {s.resources = s.resources.filter(r => r.id !== 'filled-mei-example');}, /resources changed or are missing/);
  for (const id of ['actual-relay-source-guide', 'actual-relay-source', 'actual-relay-rig']) {
    reject(s => {s.resources = s.resources.filter(r => r.id !== id);}, /resources changed or are missing/);
    reject(s => {s.resources.find(r => r.id === id).sha256 = '0'.repeat(64);}, /resources changed or are missing/);
  }
  reject(s => {s.viewing_mode = 'extracted';}, /actual observation modality/);
  reject(s => {s.listening_performed = 'unknown';}, /actual observation modality/);
  reject(s => {s.observations[0].at = .123456;}, /no actual extracted sample/);
  reject(s => {s.observations.pop();}, /six actual worked-example beats/);
  reject(s => {s.current_story_sequence.reverse();}, /every current action in order/);
  reject(s => {s.current_story_sequence[0].handoff = '';}, /entry needs handoff/);
  for (const key of ['referent', 'preserved_identity_cues', 'visible_information_gain']) {
    reject(s => {delete s.current_story_sequence[0][key];}, new RegExp('entry needs ' + key));
    reject(s => {s.current_story_sequence[0][key] = ' ';}, new RegExp('entry needs ' + key));
  }
  reject(s => {s.transfer_to_this_story = '';}, /concrete choices/);
  write(f.result.study, original);
  const result = validateB5ReferenceStudy(f.dir, actionIds);
  assert.equal(result.reference_study_sha256, sha(f.result.study));
  assert.equal(result.reference_evidence_sha256, sha(f.result.evidence));
  assert.equal(result.relay_rehearsal_sha256, sha(f.rehearsal.file));
  assert.deepEqual(result.first_use_resources, requiredB5FirstUseResources());
  assert.equal(read(f.result.study).listening_performed, false, 'admission must not upgrade a declared modality');
});

test('reference admission rejects changed evidence, stale extracted frames and evidence from another project', t => {
  const f = fixture(t), study = observed(f);
  study.evidence.sha256 = '0'.repeat(64); write(f.result.study, study);
  assert.throws(() => validateB5ReferenceStudy(f.dir, actionIds), /extraction evidence changed/);
  study.evidence.sha256 = sha(f.result.evidence); write(f.result.study, study);
  const sample = path.join(f.out, f.manifest.samples[0].name), originalFrame = fs.readFileSync(sample);
  fs.writeFileSync(sample, 'Synthetic substituted frame bytes, not actual extracted reference evidence.');
  assert.throws(() => validateB5ReferenceStudy(f.dir, actionIds), /reference frame\/board changed/);
  fs.writeFileSync(sample, originalFrame);
  const manifest = structuredClone(f.manifest); manifest.project = path.join(f.tmp, 'different-project');
  write(f.result.evidence, manifest); study.evidence.sha256 = sha(f.result.evidence); write(f.result.study, study);
  assert.throws(() => validateB5ReferenceStudy(f.dir, actionIds), /another project\/resources/);
});

test('reference admission requires independent rehearsal and binds the exact study, plans, latest film and all event images', t => {
  const f = fixture(t), study = observed(f, {rehearsal: false}), file = path.join(f.dir, 'relay-rehearsal.json');
  assert.throws(() => validateB5ReferenceStudy(f.dir, actionIds), /(?:rehearsal|review)/);
  fs.rmSync(file);
  assert.throws(() => validateB5ReferenceStudy(f.dir, actionIds), /(?:missing|rehearsal)/);
  const fixtureReview = writeSyntheticB5RelayRehearsal({dir: f.dir, study, actionIds}), original = fixtureReview.rehearsal;
  const validate = () => validateB5RelayRehearsal(f.dir, study, actionIds, study.resources);
  assert.doesNotThrow(validate);
  const reject = mutate => {const review = structuredClone(original); mutate(review); write(file, review); assert.throws(validate);};
  reject(r => {r.status = 'not_reviewed';});
  reject(r => {r.status = 'unknown';});
  reject(r => {r.status = 'fail';});
  reject(r => {r.reviewer.id = study.author_id;});
  reject(r => {r.reviewer.independent = false;});
  reject(r => {r.reviewer.viewed_images = false;});
  reject(r => {delete r.image_first_reading;});
  reject(r => {r.image_first_reading.recorded_before_intent = false;});
  reject(r => {r.image_first_reading.reviewer_id = study.author_id;});
  reject(r => {r.image_first_reading.images.pop();});
  reject(r => {r.image_first_reading.images[0].image_id = 'unviewed-image';});
  reject(r => {r.image_first_reading.images[0].status = 'unknown';});
  reject(r => {r.image_first_reading.images[0].status = 'fail';});
  reject(r => {r.image_first_reading.images[0].subject = '';});
  reject(r => {r.image_first_reading.images[0].relation = '';});
  reject(r => {r.image_first_reading.images[0].visible_action = '';});
  reject(r => {delete r.image_first_reading.images[0].alternate_readings;});
  reject(r => {r.author_id = 'another-synthetic-author';});
  reject(r => {r.project = path.join(f.tmp, 'different-project');});
  for (const key of ['reference_study_sha256', 'visual_plan_sha256', 'preview_plan_sha256']) reject(r => {r[key] = '0'.repeat(64);});
  reject(r => {r.target_comparison.source_sha256 = '0'.repeat(64);});
  reject(r => {r.target_comparison.observations = [];});
  reject(r => {r.target_comparison.observations[0].detail = ' ';});
  reject(r => {r.target_comparison.observations[0].at = 100;});
  reject(r => {r.storyboard.images.pop();});
  reject(r => {r.storyboard.images[0].action_id = 'unplanned-action';});
  reject(r => {r.storyboard.images[0].id = r.storyboard.board.id;});
  reject(r => {r.storyboard.images[0].path = path.join(f.tmp, 'missing.png');});
  reject(r => {delete r.storyboard.images[0].sha256;});
  reject(r => {r.storyboard.images[0].sha256 = '0'.repeat(64);});
  reject(r => {r.sequence_observations[0].evidence_ids = [r.storyboard.images[0].id];});
  reject(r => {r.sequence_observations[0].evidence_ids.push('unknown-image');});
  reject(r => {r.events.pop();});
  reject(r => {r.events[0].status = 'unknown';});
  reject(r => {r.events[0].status = 'fail';});
  reject(r => {r.events[0].observations[0].evidence_ids = [r.storyboard.images[1].id];});
  reject(r => {r.events[0].observations[0].detail = '';});
  reject(r => {r.blocking_issues = ['Synthetic unresolved storyboard issue.'];});
  write(file, original);
  const image = original.storyboard.images[0], bytes = fs.readFileSync(image.path);
  fs.copyFileSync(original.storyboard.board.path, image.path);
  assert.throws(validate, /(?:image|hash|changed)/);
  fs.writeFileSync(image.path, bytes);
  assert.doesNotThrow(validate);
});

test('initial unknown or fail stays unchanged and needs a separate passing image-bound contextual disposition', t => {
  const f = fixture(t), study = observed(f), file = f.rehearsal.file;
  const review = structuredClone(f.rehearsal.rehearsal), images = review.image_first_reading.images;
  images[0].status = 'unknown'; images[1].status = 'fail';
  review.first_read_dispositions = images.map((image, index) => ({
    image_id: image.image_id, initial_status: image.status,
    previous_image_id: images[index - 1]?.image_id ?? null,
    next_image_id: images[index + 1]?.image_id ?? null,
    status: 'pass', observations: [{
      detail: 'Synthetic contract fixture only: separate contextual judgment citing current, board and neighbor bytes; no real visual approval.',
      evidence_ids: [image.image_id, review.storyboard.board.id, images[1 - index].image_id]
    }]
  }));
  write(file, review);
  const before = sha(file), originalReading = JSON.stringify(review.image_first_reading);
  const validate = () => validateB5RelayRehearsal(f.dir, study, actionIds, study.resources);
  assert.doesNotThrow(validate);
  assert.equal(sha(file), before, 'validation must not rewrite the saved initial or final record');
  assert.equal(JSON.stringify(read(file).image_first_reading), originalReading);
  assert.deepEqual(read(file).image_first_reading.images.map(i => i.status), ['unknown', 'fail']);
  const reject = mutate => {const changed = structuredClone(review); mutate(changed); write(file, changed); assert.throws(validate);};
  reject(r => {delete r.first_read_dispositions;});
  reject(r => {r.first_read_dispositions.pop();});
  reject(r => {r.first_read_dispositions.reverse();});
  reject(r => {r.first_read_dispositions[0].image_id = 'unviewed-image';});
  reject(r => {r.first_read_dispositions[0].initial_status = 'pass';});
  reject(r => {r.first_read_dispositions[0].previous_image_id = images[1].image_id;});
  reject(r => {r.first_read_dispositions[0].next_image_id = null;});
  reject(r => {r.first_read_dispositions[1].next_image_id = images[0].image_id;});
  for (const status of ['unknown', 'fail']) reject(r => {r.first_read_dispositions[0].status = status;});
  reject(r => {r.first_read_dispositions[0].observations = [];});
  reject(r => {r.first_read_dispositions[0].observations[0].detail = ' ';});
  reject(r => {r.first_read_dispositions[0].observations[0].evidence_ids.push('unviewed-image');});
  for (const id of review.first_read_dispositions[0].observations[0].evidence_ids)
    reject(r => {r.first_read_dispositions[0].observations[0].evidence_ids = r.first_read_dispositions[0].observations[0].evidence_ids.filter(i => i !== id);});
  reject(r => {r.image_first_reading.images[0].status = 'pass';});
  reject(r => {r.status = 'unknown';});
  reject(r => {r.events[0].status = 'fail';});
  reject(r => {r.blocking_issues = ['Synthetic actual unresolved ownership ambiguity must block.'];});
  write(file, review); assert.doesNotThrow(validate);
});
