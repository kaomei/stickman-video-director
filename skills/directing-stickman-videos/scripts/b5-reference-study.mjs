// Extract first-use evidence. Extraction and declarations never certify viewing.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const need = (v, m) => { if (!v) throw Error('B5 reference study: ' + m); };
const text = v => typeof v === 'string' && v.trim().length > 0;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n', {flag: 'wx'});
function plain(p) { need(fs.existsSync(p) && fs.statSync(p).isFile() && fs.realpathSync(p) === p, 'missing/nonplain resource ' + p); return p; }
const resource = (root, id, rel) => { const p = plain(path.join(root, rel)); return {id, path: p, sha256: hash(p)}; };
export function requiredB5FirstUseResources(root = ROOT) {
  const resources = [
    resource(root, 'filled-mei-example', 'references/b5-mei-filled-example.md'),
    resource(root, 'verified-original-prompt', 'references/b5-mei-original-prompt.md'),
    resource(root, 'mei-event-relay', 'assets/b5/local-baselines/mei-event-relay/approved-sample.mp4'),
    resource(root, 'relay-user-approval', 'assets/b5/local-baselines/mei-event-relay/user-approval.json'),
    resource(root, 'actual-relay-source-guide', 'examples/b5-mei-event-relay/README.md'),
    resource(root, 'actual-relay-source', 'examples/b5-mei-event-relay/stage.cjs'),
    resource(root, 'actual-relay-rig', 'examples/b5-mei-event-relay/mei-reference-rig.cjs')
  ];
  need(read(resources[3].path).approved_video_sha256 === resources[2].sha256, 'latest approved relay differs from its user approval');
  return resources;
}
const BEATS = ['interruption', 'attention', 'contact', 'consequence', 'event-order', 'explanation'];
export function createB5ReferenceStudy({dir}, out, {root = ROOT} = {}) {
  const resources = requiredB5FirstUseResources(root), film = resources.find(r => r.id === 'mei-event-relay');
  need(!fs.existsSync(path.join(dir, 'reference-study.json')), 'study already exists; retain prior evidence instead of overwriting');
  const run = (cmd, args) => { const r = spawnSync(cmd, args, {encoding: 'utf8', maxBuffer: 2e6}); need(!r.error && r.status === 0, r.stderr || String(r.error || cmd + ' failed')); return r.stdout; };
  const meta = JSON.parse(run(process.env.FFPROBE || 'ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate:format=duration', '-of', 'json', film.path]));
  const [a, b] = meta.streams[0].r_frame_rate.split('/').map(Number), fps = a / b, duration = Number(meta.format.duration);
  const indexes = [.10, .70, 1.52, 2.15, 3.40, 4.50, 5.20, 6.50, 7.10, 8.40, 9.70, 10.80].map(t => Math.round(t * fps));
  need(Number.isFinite(fps) && fps > 0 && indexes.every(n => n / fps < duration), 'reference timing changed');
  const ffmpeg = process.env.FFMPEG || 'ffmpeg';
  run(ffmpeg, ['-v', 'error', '-nostdin', '-n', '-i', film.path, '-vf', 'select=' + indexes.map(n => `eq(n\\,${n})`).join('+') + ',scale=480:270', '-fps_mode', 'vfr', path.join(out, '%06d.png')]);
  run(ffmpeg, ['-v', 'error', '-nostdin', '-n', '-start_number', '1', '-i', path.join(out, '%06d.png'), '-vf', 'tile=4x3', '-frames:v', '1', path.join(out, 'reference-board.png')]);
  const samples = indexes.map((n, i) => { const name = String(i + 1).padStart(6, '0') + '.png'; return {at: n / fps, name, sha256: hash(plain(path.join(out, name)))}; });
  const manifest = {schema: 1, style: 'B5', status: 'extracted_not_observed', project: fs.realpathSync(dir), created_at: new Date().toISOString(), resources, duration, samples,
    board: {name: 'reference-board.png', sha256: hash(plain(path.join(out, 'reference-board.png')))}, limits: ['Decoded frames are not continuous playback or listening.', 'A local declaration cannot authenticate actual reading, viewing or aesthetic judgment.']};
  const manifestPath = path.join(out, 'reference-evidence.json'); write(manifestPath, manifest);
  const study = {schema: 1, status: 'not_observed', author_id: '', resources, evidence: {path: manifestPath, sha256: hash(manifestPath)},
    viewing_mode: 'unobserved', listening_performed: false,
    observations: BEATS.map((id, i) => ({id, at: samples[[1, 3, 4, 6, 8, 11][i]].at, lead_visual: '', visual_change: '', timing: '', handoff: ''})),
    current_story_sequence: [], transfer_to_this_story: ''};
  write(path.join(dir, 'reference-study.json'), study);
  const rehearsalPath = path.join(dir, 'relay-rehearsal.json');
  write(rehearsalPath, {schema: 1, status: 'not_reviewed', project: fs.realpathSync(dir), author_id: '',
    reference_study_sha256: '', visual_plan_sha256: '', preview_plan_sha256: '',
    storyboard: {board: null, images: []}, reviewer: {id: '', independent: false, viewed_images: false},
    image_first_reading: {reviewer_id: '', recorded_before_intent: false, images: []}, first_read_dispositions: [],
    target_comparison: {source_sha256: film.sha256, observations: []}, sequence_observations: [], events: [], blocking_issues: []});
  return {study: path.join(dir, 'reference-study.json'), rehearsal: rehearsalPath, evidence: manifestPath, board: path.join(out, 'reference-board.png'), required_first_use: resources, status: 'extracted_not_observed', next: 'Read the filled example, original prompt, and actual approved stage source/rig through its source guide; visually inspect actual reference evidence, then record honest observations and current-story main-visual transfer before plan-lock. Each current event needs referent, preserved_identity_cues and visible_information_gain as well as its change/handoff. Use neutral-numbered, unlabeled images for an image-first reviewer reading before sharing intended meanings or old passes; save that reading, then compare the plan and actual references. Declarations do not prove the pictured meaning. Obtain an actual independent whole-storyboard visual rehearsal against the approved relay; relay-rehearsal.json must remain not_reviewed until that reviewer has viewed the images. Extraction grants no viewing or acceptance.'};
}
export function validateB5RelayRehearsal(dir, study, actionIds, resources) {
  const p = plain(path.join(dir, 'relay-rehearsal.json')), r = read(p);
  need(r.schema === 1 && r.status === 'pass', 'independent storyboard relay rehearsal must be performed and passing before plan-lock');
  need(r.project === fs.realpathSync(dir) && r.author_id === study.author_id, 'rehearsal belongs to another project/author');
  for (const [key, rel] of [['reference_study_sha256', 'reference-study.json'], ['visual_plan_sha256', 'scene/visual-plan.json'], ['preview_plan_sha256', 'scene/preview-plan.json']])
    need(r[key] === hash(plain(path.join(dir, rel))), 'rehearsal ' + key + ' changed; review the actual revised storyboard/plan again');
  need(r.reviewer && text(r.reviewer.id) && r.reviewer.id !== study.author_id && r.reviewer.independent === true && r.reviewer.viewed_images === true,
    'rehearsal needs the actual distinct independent reviewer who viewed the storyboard images; never invent a reviewer');
  need(Array.isArray(r.blocking_issues) && r.blocking_issues.length === 0, 'rehearsal has open blocking issues');
  need(r.storyboard && r.storyboard.board && Array.isArray(r.storyboard.images) && same(r.storyboard.images.map(i => i.action_id), actionIds),
    'storyboard images must cover every current action in order');
  const images = [r.storyboard.board, ...r.storyboard.images], ids = images.map(i => i.id);
  need(ids.every(text) && new Set(ids).size === ids.length, 'storyboard image IDs must be unique');
  for (const i of images) {
    need(text(i.path) && path.isAbsolute(i.path), 'storyboard needs absolute actual image paths');
    const ip = plain(i.path), data = fs.readFileSync(ip);
    const image = data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      (data[0] === 255 && data[1] === 216 && data[2] === 255) ||
      (data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP');
    need(image && hash(ip) === i.sha256, 'storyboard image changed or is not PNG/JPEG/WebP');
  }
  const firstRead = r.image_first_reading;
  need(firstRead && firstRead.reviewer_id === r.reviewer.id && firstRead.recorded_before_intent === true,
    'image-first reading must be recorded by the actual reviewer before seeing the intended meaning or prior pass');
  need(Array.isArray(firstRead.images) && same(firstRead.images.map(i => i.image_id), r.storyboard.images.map(i => i.id)),
    'image-first reading must cover the actual neutral-numbered image for every event in order');
  for (const i of firstRead.images) {
    need(['pass', 'unknown', 'fail'].includes(i.status) && ['subject', 'relation', 'visible_action'].every(k => text(i[k])) &&
      Array.isArray(i.alternate_readings) && i.alternate_readings.every(text),
      i.image_id + ' image-first reading needs its original status and concrete actual observations');
  }
  const relay = resources.find(s => s.id === 'mei-event-relay'), comparison = r.target_comparison;
  const duration = read(plain(path.resolve(study.evidence.path))).duration;
  need(comparison && comparison.source_sha256 === relay.sha256 && Array.isArray(comparison.observations) && comparison.observations.length > 0 &&
    Number.isFinite(duration) && comparison.observations.every(o => Number.isFinite(o.at) && o.at >= 0 && o.at < duration && text(o.detail)),
    'rehearsal needs actual timed approved-relay image comparison');
  const observations = (list, allowed, label) => {
    need(Array.isArray(list) && list.length > 0 && list.every(o => text(o.detail) && Array.isArray(o.evidence_ids) && o.evidence_ids.length > 0 && o.evidence_ids.every(id => allowed.includes(id))),
      label + ' needs concrete observations citing actual storyboard image IDs');
  };
  // Initial observation is not approval. Keep it unchanged and resolve any
  // uncertainty in a separate, evidence-bound second-stage judgment.
  const expectedDispositions = firstRead.images.flatMap((i, index) => i.status === 'pass' ? [] : [{
    image_id: i.image_id, initial_status: i.status,
    previous_image_id: firstRead.images[index - 1]?.image_id ?? null,
    next_image_id: firstRead.images[index + 1]?.image_id ?? null
  }]);
  const dispositions = r.first_read_dispositions ?? [];
  need(Array.isArray(dispositions) && same(dispositions.map(d => ({
    image_id: d.image_id, initial_status: d.initial_status,
    previous_image_id: d.previous_image_id, next_image_id: d.next_image_id
  })), expectedDispositions), 'second-stage dispositions must preserve every nonpassing original image/status and its actual neighbor mapping');
  for (const d of dispositions) {
    need(d.status === 'pass', d.image_id + ' second-stage disposition remains unknown or failed');
    observations(d.observations, ids, d.image_id + ' second-stage disposition');
    const cited = d.observations.flatMap(o => o.evidence_ids);
    need([d.image_id, r.storyboard.board.id, d.previous_image_id, d.next_image_id].filter(Boolean).every(id => cited.includes(id)),
      d.image_id + ' disposition must cite the actual current image, overview board and available nearest neighbors');
  }
  observations(r.sequence_observations, ids, 'whole-sequence relay');
  need(r.sequence_observations.some(o => o.evidence_ids.includes(r.storyboard.board.id)), 'whole-sequence relay must cite the actual overview board');
  need(Array.isArray(r.events) && same(r.events.map(e => e.action_id), actionIds), 'rehearsal review must cover every current action in order');
  for (const e of r.events) {
    need(e.status === 'pass', e.action_id + ' rehearsal remains unknown or failed');
    observations(e.observations, r.storyboard.images.filter(i => i.action_id === e.action_id).map(i => i.id), e.action_id + ' rehearsal');
  }
  // This binds declarations and image bytes, not authenticated independence or aesthetic truth.
  return {relay_rehearsal_sha256: hash(p)};
}
export function validateB5ReferenceStudy(dir, actionIds, root = ROOT) {
  const p = plain(path.join(dir, 'reference-study.json')), study = read(p), resources = requiredB5FirstUseResources(root);
  need(study.schema === 1 && study.status === 'observed' && text(study.author_id), 'read/view latest worked example and film, then complete reference-study.json before plan-lock');
  need(same(study.resources, resources), 'required example/film resources changed or are missing');
  need(['decoded_frames', 'continuous_playback', 'both'].includes(study.viewing_mode) && typeof study.listening_performed === 'boolean', 'record actual observation modality without inferring playback/listening');
  const e = study.evidence; need(e && text(e.path), 'extraction evidence required');
  const ep = plain(path.resolve(e.path)), manifest = read(ep); need(hash(ep) === e.sha256, 'extraction evidence changed');
  need(manifest.project === fs.realpathSync(dir) && same(manifest.resources, resources) && manifest.status === 'extracted_not_observed', 'evidence belongs to another project/resources');
  for (const f of [...manifest.samples, manifest.board]) {
    need(typeof f.name === 'string' && path.basename(f.name) === f.name && hash(plain(path.join(path.dirname(ep), f.name))) === f.sha256, 'reference frame/board changed');
  }
  need(Array.isArray(study.observations) && same(study.observations.map(o => o.id), BEATS), 'study must cover the six actual worked-example beats');
  for (const o of study.observations) {
    need(manifest.samples.some(s => Math.abs(s.at - o.at) < .001), 'study time has no actual extracted sample');
    for (const k of ['lead_visual', 'visual_change', 'timing', 'handoff']) need(text(o[k]), o.id + ' needs observed ' + k);
  }
  need(text(study.transfer_to_this_story), 'current-script transfer needs concrete choices');
  need(Array.isArray(study.current_story_sequence) && same(study.current_story_sequence.map(s => s.action_id), actionIds), 'transfer sequence must cover every current action in order');
  for (const s of study.current_story_sequence) for (const k of ['lead_visual', 'representation', 'change_from_previous', 'handoff', 'hold_reason', 'referent', 'preserved_identity_cues', 'visible_information_gain']) need(text(s[k]), s.action_id + ' needs ' + k);
  return {reference_study_sha256: hash(p), reference_evidence_sha256: hash(ep), first_use_resources: resources,
    ...validateB5RelayRehearsal(dir, study, actionIds, resources)};
}
