// Evidence-gated B5 review. This validates provenance and recorded observations;
// it cannot certify that a reviewer watched, understood, or liked the film.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PHASES = ['before', 'anticipation', 'contact', 'consequence', 'delayed_response', 'recovery'];
const ACTION_CHECKS = ['causality', 'body_motion', 'arms_pose', 'contact', 'effects', 'recovery', 'pacing'];
const CAPTION_CHECKS = ['segmentation', 'reveal', 'emphasis', 'shaping', 'timing', 'readability'];
const LIMITS = [
  'Checks establish complete, current evidence and recorded independent observations, not automatic aesthetic approval.',
  'Reviewer identity, actual viewing, semantic judgment and independence are declared, not authenticated by this local CLI.',
  'Agent review is not human review or user acceptance. No user approval is inferred from encoding or this record.',
  'Pose telemetry, pixel change, passing geometry and document presence alone cannot pass visual review.'
];
const fail = message => { throw Error('B5 visual review: ' + message); };
const need = (condition, message) => { if (!condition) fail(message); };
const text = value => typeof value === 'string' && value.trim().length > 0;
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const digest = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const EPS = 1e-7;

function plainFile(file, label = 'file') {
  const resolved = path.resolve(file);
  need(fs.existsSync(resolved) && fs.statSync(resolved).isFile(), label + ' is missing: ' + resolved);
  need(fs.realpathSync(resolved) === resolved, label + ' must not traverse a symlink');
  return resolved;
}
function directory(dir, label) {
  const resolved = path.resolve(dir);
  need(fs.existsSync(resolved) && fs.statSync(resolved).isDirectory(), label + ' is missing');
  need(fs.realpathSync(resolved) === resolved, label + ' must not traverse a symlink');
  return resolved;
}
function inside(file, dir) { return file.startsWith(dir + path.sep); }
function command(exe, args, binary = false) {
  const result = spawnSync(exe, args, {encoding: binary ? undefined : 'utf8', maxBuffer: 64 * 1024 * 1024});
  need(!result.error && result.status === 0,
    'media command failed: ' + (result.error?.message || String(result.stderr || '').slice(-4000) || exe));
  return result.stdout;
}
function region(value, c, label, parent) {
  need(Array.isArray(value) && value.length === 4 && value.every(Number.isInteger), label + ' needs integer x,y,width,height');
  const [x, y, w, h] = value;
  need(x >= 0 && y >= 0 && w > 0 && h > 0 && x + w <= c.width && y + h <= c.height && w * h <= c.width * c.height * .6,
    label + ' must be inside the frame and at most 60% of it');
  if (parent) need(x >= parent[0] && y >= parent[1] && x + w <= parent[0] + parent[2] && y + h <= parent[1] + parent[3], label + ' must lie inside stage_region');
}
function interval(item, c, label) {
  need(Number.isFinite(item.start) && Number.isFinite(item.end) && item.start >= 0 && item.end > item.start && item.end <= c.duration + EPS,
    label + ' has invalid start/end');
}
function ids(items, label) {
  const seen = new Set();
  for (const item of items) {
    need(item && typeof item === 'object' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(item.id), label + ' requires safe nonempty ids');
    need(!seen.has(item.id), label + ' contains duplicate id ' + item.id); seen.add(item.id);
  }
}
function config(c) {
  need(c && ['width', 'height', 'fps'].every(k => Number.isInteger(c[k]) && c[k] > 0) && Number.isFinite(c.duration) && c.duration > 0,
    'invalid project config');
  return {width: c.width, height: c.height, fps: c.fps, duration: c.duration};
}
function transcriptFile(dir, plan) {
  const scene = path.resolve(dir, 'scene'), item = plan.transcript;
  need(item && text(item.path) && !path.isAbsolute(item.path) && /^[a-f0-9]{64}$/.test(item.sha256),
    'plan needs a locked scene-relative transcript path/sha256');
  const file = plainFile(path.resolve(scene, item.path), 'actual speech transcript');
  need(inside(file, scene) && hash(file) === item.sha256, 'speech transcript hash changed or escapes scene');
  return file;
}

export function validateVisualPlan({dir, c}) {
  config(c);
  const plan = read(plainFile(path.join(dir, 'scene/visual-plan.json'), 'visual plan'));
  need(plan.schema === 1 && text(plan.author_id), 'visual plan needs schema:1 and actual author_id');
  const transcript = read(transcriptFile(dir, plan));
  need(Array.isArray(transcript.words) && transcript.words.length > 0, 'actual speech transcript needs timed words');
  let wordEnd = 0;
  for (const word of transcript.words) {
    interval(word, c, 'transcript word');
    need(text(word.screen ?? word.text) && word.start >= wordEnd - EPS, 'transcript words must be complete, ordered and nonoverlapping');
    wordEnd = word.end;
  }
  region(plan.stage_region, c, 'stage_region');
  need(Array.isArray(plan.actions) && plan.actions.length > 0, 'visual plan needs story-specific actions');
  ids(plan.actions, 'actions');
  for (const action of plan.actions) {
    interval(action, c, 'action ' + action.id);
    region(action.actor_region, c, 'actor_region ' + action.id, plan.stage_region);
    need(text(action.intent), 'action ' + action.id + ' needs its explanatory intent and before/after change');
    need(action.phases && typeof action.phases === 'object', 'action ' + action.id + ' needs six physical phases');
    let prior = -Infinity, priorFrame = -1;
    for (const phase of PHASES) {
      const at = action.phases[phase];
      need(Number.isFinite(at) && at >= action.start - EPS && at <= action.end + EPS && at > prior,
        'action ' + action.id + ' phase times must be ordered inside the action');
      const sampledFrame = Math.max(0, Math.min(Math.round(c.duration * c.fps) - 1, Math.ceil(at * c.fps - EPS)));
      need(sampledFrame > priorFrame, 'action ' + action.id + ' phases must use six distinct ordered final-video frames');
      priorFrame = sampledFrame;
      prior = at;
    }
  }
  let covered = 0;
  for (const action of [...plan.actions].sort((a, b) => a.start - b.start)) {
    need(action.start <= covered + 1 / c.fps + EPS, 'actions must cover the full film; record deliberate holds/transitions as actions');
    covered = Math.max(covered, action.end);
  }
  need(covered >= c.duration - 1 / c.fps - EPS, 'actions omit the end of the film');
  const captions = plan.captions;
  need(captions && text(captions.language), 'captions need their actual language');
  need(!transcript.language || transcript.language === captions.language, 'caption language must match the actual speech transcript');
  region(captions.region, c, 'caption region');
  need(Array.isArray(captions.groups) && captions.groups.length > 0, 'captions need semantic groups');
  ids(captions.groups, 'caption groups');
  let previousEnd = -Infinity;
  const coveredWords = [];
  const normalize = value => value.replace(/[\s\p{White_Space}]/gu, '').normalize('NFC');
  for (const group of captions.groups) {
    interval(group, c, 'caption group ' + group.id);
    need(group.start >= previousEnd - EPS, 'caption groups must be ordered without overlaps'); previousEnd = group.end;
    need(Array.isArray(group.units) && group.units.length > 0, 'caption group ' + group.id + ' needs semantic units');
    let previousStart = -Infinity;
    for (const unit of group.units) {
      interval(unit, c, 'caption unit');
      need(text(unit.text) && !/[\u0000\ud800-\udfff]/u.test(unit.text), 'caption unit needs valid complete Unicode text');
      need(typeof unit.emphasis === 'boolean', 'caption unit needs an explicit emphasis boolean');
      need(unit.start >= group.start - EPS && unit.end <= group.end + EPS && unit.start > previousStart,
        'caption units must progressively start inside their semantic group'); previousStart = unit.start;
      need(Array.isArray(unit.word_indices) && unit.word_indices.length > 0 && unit.word_indices.every(i => Number.isInteger(i) && i >= 0 && i < transcript.words.length),
        'each caption unit must reference actual transcript word_indices');
      coveredWords.push(...unit.word_indices);
      const source = unit.word_indices.map(i => transcript.words[i]);
      need(normalize(unit.text) === normalize(source.map(w => w.screen ?? w.text).join('')),
        'caption unit text must preserve its actual transcript words and punctuation');
      need(Math.abs(unit.start - source[0].start) <= 1 / c.fps + EPS && unit.end >= source.at(-1).end - EPS,
        'caption unit must follow its actual speech timing');
    }
    need(Math.abs(group.units[0].start - group.start) <= 1 / c.fps + EPS && group.units.at(-1).end >= group.end - 1 / c.fps - EPS,
      'caption unit times must cover their group');
    need(group.units.some(u => u.emphasis), 'each caption group needs motivated keyword emphasis');
    // Grapheme integrity catches split combining marks/emoji. Word/phrase and
    // contextual-script shaping still require the recorded semantic review.
    const combined = group.units.map(u => u.text).join('');
    const boundaries = new Set([...new Intl.Segmenter(undefined, {granularity: 'grapheme'}).segment(combined)].map(s => s.index));
    let offset = 0;
    for (const unit of group.units) { need(boundaries.has(offset), 'caption units must not split a grapheme/shaping cluster'); offset += unit.text.length; }
  }
  need(same(coveredWords, transcript.words.map((_, i) => i)), 'captions must cover all transcript words exactly once in order');
  return plan;
}

function baselines() {
  return [
    {id: 'spiderman', source_path: path.join(ROOT, 'assets/b5/approved-sample.mp4'), lock: path.join(ROOT, 'assets/b5/baseline-lock.json')},
    {id: 'jensen-v13', source_path: path.join(ROOT, 'assets/b5/local-baselines/jensen-v13/approved-sample.mp4'), lock: path.join(ROOT, 'assets/b5/local-baselines/jensen-v13/baseline-lock.json')}
  ].map(({id, source_path, lock}) => {
    plainFile(source_path, 'accepted baseline'); plainFile(lock, 'baseline lock');
    const contract = read(lock), source_sha256 = hash(source_path);
    need(source_sha256 === (contract.video?.sha256 || contract.video_sha256), 'accepted baseline changed: ' + id);
    return {id, source_path, source_sha256, lock_sha256: hash(lock)};
  });
}

function candidate({dir, c, candidateDir, projectFingerprint, ffprobe}) {
  const project = directory(dir, 'project'), folder = directory(candidateDir, 'candidate directory');
  need(!inside(folder, project) && folder !== project, 'candidate directory must be outside the project');
  const file = plainFile(path.join(folder, 'candidate.json'), 'candidate record'), record = read(file);
  need(record.schema === 1 && record.style === 'B5' && record.status === 'pending_visual_review', 'a pending B5 candidate record is required');
  need(text(projectFingerprint) && record.project_fingerprint === projectFingerprint, 'candidate project fingerprint is stale');
  need(record.full_decode === 'pass', 'candidate needs a completed technical decode');
  const video = plainFile(path.join(folder, 'video.mp4'), 'candidate video');
  need(path.isAbsolute(record.output) && record.output === video, 'candidate output must be its real candidateDir/video.mp4');
  need(record.output_sha256 === hash(video), 'candidate video hash changed; review is stale');
  const metadata = JSON.parse(command(ffprobe, ['-v', 'error', '-count_frames', '-show_entries',
    'format=duration,start_time:stream=codec_type,width,height,r_frame_rate,avg_frame_rate,nb_read_frames,start_time', '-of', 'json', video]));
  const stream = metadata.streams.find(s => s.codec_type === 'video');
  const rate = value => { const [a, b = 1] = String(value).split('/').map(Number); return a / b; };
  need(stream && stream.width === c.width && stream.height === c.height && Math.abs(rate(stream.avg_frame_rate) - c.fps) < EPS && Math.abs(rate(stream.r_frame_rate) - c.fps) < EPS,
    'final video dimensions/fps do not match the project');
  need(Number(stream.nb_read_frames) === Math.round(c.duration * c.fps) && Math.abs(Number(metadata.format.duration) - c.duration) <= 1 / c.fps + .01 && Math.abs(Number(stream.start_time || 0)) <= 1 / c.fps,
    'final video frame count/duration/start time does not match the project');
  need(metadata.streams.some(s => s.codec_type === 'audio'), 'final video requires its complete audio mix');
  return {file, record, video, folder, metadata, candidate_sha256: hash(file), video_sha256: hash(video)};
}

function expectedArtifacts(plan, c) {
  const n = Math.round(c.duration * c.fps), artifacts = [];
  const frame = (id, scope, scope_id, crop, at, extra = {}) => {
    const frame_index = Math.max(0, Math.min(n - 1, Math.ceil(at * c.fps - EPS)));
    artifacts.push({id, kind: 'frame', scope, scope_id, file: id + '.png', crop, frame_index, at: frame_index / c.fps, ...extra});
  };
  const clip = (id, scope, scope_id, crop, start, end, audio) => {
    const start_frame = Math.max(0, Math.min(n - 1, Math.floor(start * c.fps + EPS))), end_frame = Math.max(start_frame + 1, Math.min(n, Math.ceil(end * c.fps - EPS)));
    artifacts.push({id, kind: 'clip', scope, scope_id, file: id + '.mp4', crop, start_frame, frame_count: end_frame - start_frame, audio});
  };
  clip('full-stage-silent', 'full_playback', 'silent_stage', plan.stage_region, 0, c.duration, false);
  clip('full-captions-audio', 'full_playback', 'captions_with_audio', plan.captions.region, 0, c.duration, true);
  for (const action of plan.actions) {
    for (const phase of PHASES) frame('action-' + action.id + '-' + phase, 'action', action.id, action.actor_region, action.phases[phase], {phase});
    clip('action-' + action.id + '-continuous', 'action', action.id, plan.stage_region, action.start, action.end, false);
  }
  for (const group of plan.captions.groups) {
    for (const [i, unit] of group.units.entries()) {
      const id = 'caption-' + group.id + '-unit-' + i;
      frame(id + '-before', 'caption', group.id, plan.captions.region, Math.max(0, unit.start - 1 / c.fps), {unit: i, phase: 'before'});
      frame(id + '-reveal', 'caption', group.id, plan.captions.region, unit.start, {unit: i, phase: 'reveal'});
      if (unit.emphasis) for (const [phase, delta] of [['emphasis-peak', .1], ['emphasis-settle', .24]])
        frame(id + '-' + phase, 'caption', group.id, plan.captions.region, Math.min(group.end - 1 / c.fps, unit.start + delta), {unit: i, phase});
    }
    clip('caption-' + group.id + '-continuous', 'caption', group.id, plan.captions.region, group.start, group.end, true);
  }
  return artifacts;
}

function extractFrame(ffmpeg, video, artifact, c) {
  return command(ffmpeg, ['-v', 'error', '-nostdin', '-ss', String(artifact.frame_index / c.fps), '-i', video,
    '-map', '0:v:0', '-vf', 'format=rgb24,crop=' + artifact.crop.slice(2).concat(artifact.crop.slice(0, 2)).join(':') + ':exact=1',
    '-frames:v', '1', '-c:v', 'png', '-threads:v', '1', '-pix_fmt', 'rgb24', '-f', 'image2pipe', 'pipe:1'], true);
}
function extractClip(ffmpeg, video, artifact, c, output) {
  const [x, y, w, h] = artifact.crop, start = artifact.start_frame / c.fps, duration = artifact.frame_count / c.fps;
  const args = ['-v', 'error', '-nostdin', '-ss', String(start), '-i', video, '-map', '0:v:0'];
  if (artifact.audio) args.push('-map', '0:a:0');
  // Convert before an odd-coordinate crop: subsampled YUV crop/pad can expose
  // undefined edge chroma and produce different encodes from identical inputs.
  args.push('-vf', `format=rgb24,crop=${w}:${h}:${x}:${y}:exact=1,pad=ceil(iw/2)*2:ceil(ih/2)*2,format=yuv420p`, '-frames:v', String(artifact.frame_count), '-t', String(duration),
    '-r', String(c.fps), '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-threads:v', '1', '-flags:v', '+bitexact');
  if (artifact.audio) args.push('-c:a', 'aac', '-b:a', '128k', '-threads:a', '1', '-flags:a', '+bitexact'); else args.push('-an');
  args.push('-map_metadata', '-1', '-movflags', '+faststart', '-n', output);
  command(ffmpeg, args);
}

export async function buildB5ReviewPack({dir, c, candidateDir, out, projectFingerprint, ffmpeg = 'ffmpeg', ffprobe = 'ffprobe'}) {
  const plan = validateVisualPlan({dir, c}), source = candidate({dir, c, candidateDir, projectFingerprint, ffprobe});
  const output = directory(out, 'evidence output');
  need(!inside(output, path.resolve(dir)) && output !== path.resolve(dir) && !inside(output, source.folder) && output !== source.folder,
    'evidence output must be outside project and candidate directories');
  need(fs.readdirSync(output).length === 0, 'evidence output must be empty');
  const baseline_sources = baselines(), planFile = path.join(dir, 'scene/visual-plan.json'), plan_sha256 = hash(planFile);
  const artifacts = [];
  for (const descriptor of expectedArtifacts(plan, c)) {
    const file = path.join(output, descriptor.file);
    if (descriptor.kind === 'frame') fs.writeFileSync(file, extractFrame(ffmpeg, source.video, descriptor, c));
    else extractClip(ffmpeg, source.video, descriptor, c, file);
    artifacts.push({...descriptor, source_sha256: source.video_sha256, sha256: hash(file)});
  }
  need(hash(source.video) === source.video_sha256 && hash(source.file) === source.candidate_sha256 && hash(planFile) === plan_sha256,
    'candidate or visual plan changed while extracting evidence');
  const ledger = {schema: 1, style: 'B5', status: 'pending_independent_visual_review',
    candidate_sha256: source.candidate_sha256, project_fingerprint: projectFingerprint, plan_sha256,
    transcript_sha256: plan.transcript.sha256,
    config: config(c), source: {id: 'source-video', path: source.video, sha256: source.video_sha256},
    baseline_sources, artifacts, limits: LIMITS};
  write(path.join(output, 'evidence.json'), ledger);
  const unknown = () => ({status: 'unknown', observations: []});
  const checks = names => Object.fromEntries(names.map(name => [name, unknown()]));
  write(path.join(output, 'review-template.json'), {
    schema: 1, reviewer: {id: '', kind: 'agent', method: '', independent: false},
    video_sha256: source.video_sha256, evidence_sha256: hash(path.join(output, 'evidence.json')),
    baseline_comparisons: [], full_playback: Object.fromEntries(['silent_stage', 'complete_mix', 'captions_with_audio'].map(key => [key, {...unknown(), viewed_ranges: []}])),
    actions: plan.actions.map(a => ({id: a.id, checks: checks(ACTION_CHECKS)})),
    captions: plan.captions.groups.map(g => ({id: g.id, checks: checks(CAPTION_CHECKS)})),
    blocking_issues: ['Not reviewed. Copy this template outside the project, inspect the actual evidence and final composite, and record truthful independent observations.']
  });
  return ledger;
}

function observations(value, label, interval, allowedIds, artifactMap, needsReference = true) {
  need(Array.isArray(value) && value.length > 0, label + ' needs actual timed observations, not an empty pass checklist');
  for (const observation of value) {
    need(observation && Number.isFinite(observation.at) && observation.at >= interval[0] - EPS && observation.at <= interval[1] + EPS && text(observation.detail) &&
      !/^(?:pass|passed|ok|okay|good|done|n\/?a|通过|合格|正常|已检查|同上|无问题)[\s.!。！]*$/iu.test(observation.detail.trim()),
      label + ' needs specific detail and an in-range time');
    need(Array.isArray(observation.evidence_ids) && observation.evidence_ids.length > 0 && new Set(observation.evidence_ids).size === observation.evidence_ids.length,
      label + ' needs actual evidence ids');
    for (const id of observation.evidence_ids) need(artifactMap.has(id) && (!needsReference || allowedIds.has(id)), label + ' references missing or unrelated evidence ' + id);
    need(observation.evidence_ids.some(id => { const span = artifactMap.get(id).observed_span; return span && observation.at >= span[0] - EPS && observation.at <= span[1] + EPS; }),
      label + ' observation time must match its actual referenced evidence');
  }
}
function checked(value, label, interval, allowedIds, artifactMap) {
  need(value && value.status === 'pass', label + ' is missing, unknown or failed');
  observations(value.observations, label, interval, allowedIds, artifactMap);
}
function reviewGroups(actual, expected, checks, label, artifactMap) {
  need(Array.isArray(actual) && actual.length === expected.length && new Set(actual.map(x => x.id)).size === actual.length,
    label + ' review must cover every planned id exactly once');
  for (const item of expected) {
    const review = actual.find(x => x.id === item.id);
    need(review && review.checks && same(Object.keys(review.checks).sort(), [...checks].sort()), label + ' ' + item.id + ' needs all required checks');
    const allowed = new Set([...artifactMap.values()].filter(a => a.scope === label && a.scope_id === item.id).map(a => a.id));
    for (const check of checks) {
      checked(review.checks[check], label + ' ' + item.id + '/' + check, [item.start, item.end], allowed, artifactMap);
      need(review.checks[check].observations.some(o => o.evidence_ids.includes(label + '-' + item.id + '-continuous')),
        label + ' ' + item.id + '/' + check + ' must reference continuous playback, not only a still');
    }
  }
}

export function verifyB5VisualAcceptance({dir, c, candidateDir, evidenceDir, reviewFile, projectFingerprint, ffmpeg = 'ffmpeg', ffprobe = 'ffprobe'}) {
  const plan = validateVisualPlan({dir, c}), source = candidate({dir, c, candidateDir, projectFingerprint, ffprobe});
  const folder = directory(evidenceDir, 'evidence directory'), file = plainFile(path.join(folder, 'evidence.json'), 'evidence ledger');
  const reviewPath = plainFile(reviewFile, 'independent review');
  need(!inside(folder, path.resolve(dir)) && folder !== path.resolve(dir) && !inside(reviewPath, path.resolve(dir)),
    'evidence and review must be outside the project input fingerprint');
  const ledger = read(file), review = read(reviewPath), review_sha256 = hash(reviewPath), evidence_sha256 = hash(file), plan_sha256 = hash(path.join(dir, 'scene/visual-plan.json'));
  need(ledger.schema === 1 && ledger.style === 'B5' && ledger.status === 'pending_independent_visual_review', 'invalid evidence ledger');
  need(ledger.candidate_sha256 === source.candidate_sha256 && ledger.project_fingerprint === projectFingerprint && ledger.plan_sha256 === plan_sha256 && ledger.transcript_sha256 === plan.transcript.sha256 && same(ledger.config, config(c)),
    'candidate/project/plan evidence is stale');
  need(same(ledger.source, {id: 'source-video', path: source.video, sha256: source.video_sha256}), 'evidence is bound to a different final video');
  const baseline_sources = baselines();
  need(same(ledger.baseline_sources, baseline_sources), 'accepted baseline evidence changed');
  const expected = expectedArtifacts(plan, c);
  need(Array.isArray(ledger.artifacts) && ledger.artifacts.length === expected.length, 'evidence artifact set is incomplete');
  const artifactMap = new Map([['source-video', {id: 'source-video', kind: 'source', observed_span: [0, c.duration]}]]);
  const scratch = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'b5-review-source-'));
  try { for (const [i, descriptor] of expected.entries()) {
    const artifact = ledger.artifacts[i];
    need(artifact && same(Object.keys(artifact).sort(), [...Object.keys(descriptor), 'source_sha256', 'sha256'].sort()) && same(Object.fromEntries(Object.keys(descriptor).map(k => [k, artifact[k]])), descriptor) && artifact.source_sha256 === source.video_sha256,
      'evidence descriptors do not match every planned action/caption sample');
    need(!artifactMap.has(artifact.id), 'duplicate evidence id');
    const target = plainFile(path.join(folder, descriptor.file), 'evidence artifact');
    need(hash(target) === artifact.sha256, 'evidence artifact hash changed: ' + artifact.id);
    if (descriptor.kind === 'frame') need(digest(extractFrame(ffmpeg, source.video, descriptor, c)) === artifact.sha256,
      'frame was not extracted from this final video: ' + artifact.id);
    else {
      const extracted = path.join(scratch, descriptor.file);
      extractClip(ffmpeg, source.video, descriptor, c, extracted);
      need(hash(extracted) === artifact.sha256, 'clip was not extracted from this final video: ' + artifact.id);
    }
    const observed_span = descriptor.kind === 'frame' ? [Math.max(0, descriptor.at - 1 / c.fps), Math.min(c.duration, descriptor.at + 1 / c.fps)] :
      [descriptor.start_frame / c.fps, (descriptor.start_frame + descriptor.frame_count) / c.fps];
    artifactMap.set(artifact.id, {...artifact, observed_span});
  } } finally { fs.rmSync(scratch, {recursive: true, force: true}); }
  need(review.schema === 1 && review.video_sha256 === source.video_sha256 && review.evidence_sha256 === evidence_sha256,
    'review must bind the exact current final video and evidence ledger hashes');
  const reviewer = review.reviewer;
  need(reviewer && text(reviewer.id) && reviewer.id !== plan.author_id && ['agent', 'human'].includes(reviewer.kind) && text(reviewer.method) && reviewer.independent === true,
    'review must truthfully identify an independent reviewer different from author_id');
  need(Array.isArray(review.blocking_issues) && review.blocking_issues.length === 0, 'unresolved blocking issues prevent acceptance');
  const playback = review.full_playback;
  need(playback && same(Object.keys(playback).sort(), ['captions_with_audio', 'complete_mix', 'silent_stage']), 'complete playback review is required');
  for (const [key, id] of [['silent_stage', 'full-stage-silent'], ['complete_mix', 'source-video'], ['captions_with_audio', 'full-captions-audio']]) {
    checked(playback[key], 'full playback/' + key, [0, c.duration], new Set([id]), artifactMap);
    need(Array.isArray(playback[key].viewed_ranges) && playback[key].viewed_ranges.length > 0, 'full playback/' + key + ' needs recorded viewed_ranges');
    let end = 0;
    for (const span of [...playback[key].viewed_ranges].sort((a, b) => a.start - b.start)) {
      interval(span, c, 'viewed playback range');
      need(span.start <= end + 1 / c.fps + EPS, 'full playback/' + key + ' viewed ranges omit part of the film'); end = Math.max(end, span.end);
    }
    need(end >= c.duration - 1 / c.fps - EPS, 'full playback/' + key + ' viewed ranges omit the ending');
  }
  reviewGroups(review.actions, plan.actions, ACTION_CHECKS, 'action', artifactMap);
  reviewGroups(review.captions, plan.captions.groups, CAPTION_CHECKS, 'caption', artifactMap);
  need(Array.isArray(review.baseline_comparisons) && review.baseline_comparisons.length > 0, 'record at least one actual accepted-baseline comparison');
  const seen = new Set();
  for (const comparison of review.baseline_comparisons) {
    const baseline = baseline_sources.find(b => b.id === comparison.id);
    need(baseline && !seen.has(comparison.id) && comparison.source_path === baseline.source_path && comparison.source_sha256 === baseline.source_sha256,
      'baseline comparison must name the actual locked source and hash'); seen.add(comparison.id);
    observations(comparison.observations, 'baseline comparison', [0, c.duration], new Set(artifactMap.keys()), artifactMap);
  }
  command(ffmpeg, ['-v', 'error', '-nostdin', '-i', source.video, '-f', 'null', '-']);
  need(hash(source.video) === source.video_sha256 && hash(source.file) === source.candidate_sha256 && hash(file) === evidence_sha256 && hash(reviewPath) === review_sha256 && hash(path.join(dir, 'scene/visual-plan.json')) === plan_sha256 && hash(transcriptFile(dir, plan)) === plan.transcript.sha256,
    'candidate/evidence/plan changed during acceptance');
  return {schema: 1, style: 'B5', status: 'independent_visual_review_pass', user_acceptance: 'not_inferred',
    output: source.video, output_sha256: source.video_sha256, candidate_sha256: source.candidate_sha256,
    project_fingerprint: projectFingerprint, plan_sha256, evidence_sha256, review_sha256,
    reviewer, baseline_sources, actions_reviewed: plan.actions.length, caption_groups_reviewed: plan.captions.groups.length,
    full_decode: 'pass', limits: LIMITS};
}
