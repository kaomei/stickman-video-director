// First-preview admission for B5 only. Local receipts prevent accidental
// post-hoc/stale promotion; they cannot authenticate authorship or honest viewing.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {validateVisualPlan, verifyB5PreviewReview, b5ActionKind, b5ActionChecks} from './b5-visual-review.mjs';
import {validateB5ReferenceStudy} from './b5-reference-study.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const START = '.b5-authoring-start.json';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', {flag: 'wx'});
const text = value => typeof value === 'string' && value.trim().length > 0;
const need = (value, message) => { if (!value) throw Error('B5 preview gate: ' + message); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const inside = (file, dir) => file === dir || file.startsWith(dir + path.sep);
export const B5_PREVIEW_LIMITS = [
  'Local receipts bind declared planning order and exact media; they are not tamper-proof or an authenticated timestamp service.',
  'The initial checkpoint requires unchanged init scaffold code; a later revision must chain to it. Existing authored work cannot acquire a first checkpoint retroactively.',
  'Reviewer identity, independence, actual viewing/listening and aesthetic judgment are declared, not authenticated by this CLI.',
  'Preview readiness is neither formal visual acceptance nor user acceptance. Internal candidates lacking this gate must not be presented as ready previews.'
];

function file(filePath, label) {
  const p = path.resolve(filePath);
  need(fs.existsSync(p) && fs.statSync(p).isFile() && fs.realpathSync(p) === p, label + ' missing or traverses a symlink');
  return p;
}
function local(dir, item, label) {
  need(item && text(item.path) && !path.isAbsolute(item.path) && /^[a-f0-9]{64}$/.test(item.sha256), label + ' needs scene-relative path/sha256');
  const p = file(path.resolve(dir, 'scene', item.path), label);
  need(inside(p, path.join(dir, 'scene')) && hash(p) === item.sha256, label + ' escaped scene or changed');
  return p;
}
function codeFiles(dir) {
  const walk = folder => fs.readdirSync(folder, {withFileTypes: true}).flatMap(e => {
    const p = path.join(folder, e.name);
    need(!e.isSymbolicLink(), 'project must not contain symlinks');
    return e.isDirectory() ? walk(p) : /\.(?:cjs|mjs|js)$/i.test(e.name) ? [{path: path.relative(dir, p), sha256: hash(p)}] : [];
  });
  return walk(dir).sort((a, b) => a.path.localeCompare(b.path));
}
function native(c) {
  need(c.width * 9 === c.height * 16 || c.width * 16 === c.height * 9,
    'preview admission requires a native 16:9 or 9:16 composition; both use the same checks');
  return {width: c.width, height: c.height, fps: c.fps, duration: c.duration};
}
export function b5PreviewTargets(root = ROOT) {
  return [
    {id: 'crazymei', folder: 'assets/b5/local-baselines/crazymei'},
    {id: 'spiderman', folder: 'assets/b5'},
    {id: 'mei-event-relay', folder: 'assets/b5/local-baselines/mei-event-relay', contractFile: 'user-approval.json'}
  ].map(({id, folder, contractFile = 'baseline-lock.json'}) => {
    const source_path = file(path.join(root, folder, 'approved-sample.mp4'), id + ' target video');
    const lock = file(path.join(root, folder, contractFile), id + ' target lock');
    const contract = read(lock), source_sha256 = hash(source_path);
    need(source_sha256 === (contract.video?.sha256 || contract.video_sha256 || contract.approved_video_sha256), id + ' target changed');
    const probe = spawnSync(process.env.FFPROBE || 'ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', source_path], {encoding: 'utf8', maxBuffer: 1024 * 1024});
    need(!probe.error && probe.status === 0, id + ' target duration unavailable');
    const duration_seconds = Number(JSON.parse(probe.stdout).format?.duration);
    need(Number.isFinite(duration_seconds) && duration_seconds > 0, id + ' target duration invalid');
    return {id, source_path, source_sha256, duration_seconds, lock_sha256: hash(lock)};
  });
}

// Called only by init after copying the immutable scaffold, before new authoring.
export function recordB5AuthoringStart(dir) {
  const implementation = codeFiles(dir);
  need(implementation.length > 0, 'init scaffold has no implementation');
  const receipt = {schema: 1, style: 'B5', status: 'scaffold_initialized', project: fs.realpathSync(dir),
    created_at: new Date().toISOString(), implementation, limits: B5_PREVIEW_LIMITS};
  write(path.join(dir, START), receipt);
  return receipt;
}
function inputs({dir, c}, root) {
  native(c);
  const visual = validateVisualPlan({dir, c}), visualFile = file(path.join(dir, 'scene/visual-plan.json'), 'visual plan');
  const planFile = file(path.join(dir, 'scene/preview-plan.json'), 'pre-authoring preview plan'), plan = read(planFile);
  need(plan.schema === 1 && plan.author_id === visual.author_id, 'preview plan must identify the actual visual-plan author');
  local(dir, plan.speech, 'approved dry speech');
  local(dir, plan.action_cards, 'action cards');
  const fields = ['before_state', 'anticipation', 'force', 'contact', 'consequence', 'secondary_motion', 'recovery', 'arms_task', 'composition', 'richness', 'hold_exit'];
  need(Array.isArray(plan.actions) && same(plan.actions.map(a => a.id), visual.actions.map(a => a.id)),
    'preview plan must cover every visual-plan action in order');
  for (const [index, action] of plan.actions.entries()) {
    const kind = b5ActionKind(action);
    need(kind === b5ActionKind(visual.actions[index]), action.id + ' kind must match its visual-plan action');
    const required = kind === 'visual' ? ['before_state', 'visual_change', 'composition', 'richness', 'hold_exit'] : fields;
    for (const key of required) need(text(action[key]), action.id + ' needs concrete ' + key);
  }
  const targets = b5PreviewTargets(root);
  need(Array.isArray(plan.target_study) && same(plan.target_study.map(t => t.id).sort(), targets.map(t => t.id).sort()),
    'planning must study CrazyMei, Spider and the latest approved Mei event-relay targets');
  for (const target of targets) {
    const study = plan.target_study.find(t => t.id === target.id);
    need(study.source_sha256 === target.source_sha256 && text(study.transfer_to_this_story) &&
      Array.isArray(study.observations) && study.observations.length > 0 && study.observations.every(o => Number.isFinite(o.at) && o.at >= 0 && o.at < target.duration_seconds && text(o.detail)),
      target.id + ' study needs actual timed observations and story-specific transfer');
  }
  const referenceStudy = validateB5ReferenceStudy(dir, visual.actions.map(a => a.id), root);
  need(read(path.join(dir, 'reference-study.json')).author_id === plan.author_id, 'reference study must identify the actual plan author');
  return {plan, visual, targets, ...referenceStudy, config: native(c), preview_plan_sha256: hash(planFile), visual_plan_sha256: hash(visualFile),
    transcript_sha256: visual.transcript.sha256, speech: plan.speech, action_cards: plan.action_cards};
}
function checkpointFile(p) { return file(path.join(p, 'checkpoint.json'), 'pre-authoring checkpoint'); }
function start(dir) {
  const startFile = file(path.join(dir, START), 'init authoring receipt (old authored projects remain internal-only)');
  const receipt = read(startFile);
  need(receipt.schema === 1 && receipt.style === 'B5' && receipt.status === 'scaffold_initialized' && receipt.project === dir &&
    Array.isArray(receipt.implementation) && receipt.implementation.length > 0, 'invalid init authoring receipt');
  return {receipt, sha256: hash(startFile)};
}
function checkpoint(project, checkpointDir, root, current = true, seen = new Set()) {
  const p = checkpointFile(checkpointDir), value = read(p), {dir, c} = project;
  need(!inside(p, dir), 'checkpoint must be outside project');
  need(!seen.has(p), 'checkpoint revision chain is cyclic'); seen.add(p);
  need(value.schema === 1 && value.style === 'B5' && value.status === 'pre_authoring_plan_locked' && value.project === dir &&
    same(value.config, native(c)), 'invalid/stale checkpoint project or native config');
  const origin = start(dir);
  need(value.init_receipt_sha256 === origin.sha256, 'init authoring receipt changed');
  if (value.previous) {
    const parent = checkpoint(project, value.previous.path, root, false, seen);
    need(parent.sha256 === value.previous.sha256 && Date.parse(value.created_at) >= Date.parse(parent.value.created_at), 'checkpoint revision chain changed');
  } else need(same(value.implementation_before, origin.receipt.implementation), 'first checkpoint did not precede implementation authoring');
  need(same(value.targets, b5PreviewTargets(root)), 'checkpoint target references changed');
  if (current) {
    const now = inputs(project, root);
    for (const key of ['preview_plan_sha256', 'visual_plan_sha256', 'transcript_sha256', 'config', 'speech', 'action_cards', 'reference_study_sha256', 'reference_evidence_sha256', 'first_use_resources', 'relay_rehearsal_sha256'])
      need(same(value[key], now[key]), key + ' changed; lock a planning revision before the next implementation edit');
  }
  return {path: p, sha256: hash(p), value};
}
export function createB5PlanCheckpoint(project, checkpointDir, {root = ROOT, previous} = {}) {
  const {dir} = project, now = inputs(project, root), origin = start(dir), implementation_before = codeFiles(dir);
  const prior = previous ? checkpoint(project, previous, root, false) : null;
  if (!prior) need(same(implementation_before, origin.receipt.implementation),
    'implementation already changed: cannot retrospectively lock a first plan; existing work remains an internal candidate');
  const output = fs.realpathSync(checkpointDir);
  need(!inside(output, dir) && !inside(dir, output) && fs.readdirSync(output).length === 0, 'checkpoint output must be fresh and outside project');
  const value = {schema: 1, style: 'B5', status: 'pre_authoring_plan_locked', project: dir, created_at: new Date().toISOString(),
    init_receipt_sha256: origin.sha256, implementation_before, previous: prior ? {path: path.dirname(prior.path), sha256: prior.sha256} : null,
    ...Object.fromEntries(['config', 'preview_plan_sha256', 'visual_plan_sha256', 'transcript_sha256', 'speech', 'action_cards', 'targets', 'reference_study_sha256', 'reference_evidence_sha256', 'first_use_resources', 'relay_rehearsal_sha256'].map(k => [k, now[k]])),
    author_id: now.plan.author_id, limits: B5_PREVIEW_LIMITS};
  write(path.join(output, 'checkpoint.json'), value);
  return {path: path.join(output, 'checkpoint.json'), sha256: hash(path.join(output, 'checkpoint.json'))};
}
export function validateB5PlanCheckpoint(project, checkpointDir, {root = ROOT, requireImplementation = true} = {}) {
  const result = checkpoint(project, checkpointDir, root);
  if (requireImplementation) need(!same(codeFiles(project.dir), result.value.implementation_before),
    'no implementation change after planning checkpoint; do not attach a plan retrospectively');
  return {path: result.path, sha256: result.sha256};
}
export function candidateB5Plan(project, candidateDir, {root = ROOT} = {}) {
  const candidateFile = file(path.join(candidateDir, 'candidate.json'), 'candidate'), candidate = read(candidateFile);
  need(candidate.plan_checkpoint, 'candidate has no pre-authoring plan: internal use only');
  const plan = validateB5PlanCheckpoint(project, path.dirname(candidate.plan_checkpoint.path), {root});
  need(same(plan, candidate.plan_checkpoint), 'candidate planning checkpoint changed');
  const frameFile = file(candidate.frame_ledger_path, 'original frame ledger'), ledger = read(frameFile);
  need(hash(frameFile) === candidate.frame_ledger_sha256 && same(ledger.plan_checkpoint, plan),
    'frame ledger did not bind this plan before encode; no post-hoc promotion');
  return plan;
}
export function writeB5PreviewTemplate(project, candidateDir, evidenceDir, options = {}) {
  const plan = candidateB5Plan(project, candidateDir, options), ledger = read(path.join(evidenceDir, 'evidence.json'));
  const unknown = () => ({status: 'unknown', observations: []});
  const value = {schema: 1, reviewer: {id: '', kind: 'agent', method: '', independent: false},
    plan_checkpoint_sha256: plan.sha256, video_sha256: ledger.source.sha256, evidence_sha256: hash(path.join(evidenceDir, 'evidence.json')),
    baseline_comparisons: [], full_playback: Object.fromEntries(['silent_stage', 'complete_mix'].map(key => [key, {...unknown(), viewed_ranges: []}])),
    actions: validateVisualPlan(project).actions.map(a => ({id: a.id, checks: Object.fromEntries(b5ActionChecks(a, {preview: true}).map(k => [k, unknown()]))})),
    blocking_issues: ['Not pre-reviewed. A separate agent or human must actually inspect continuous candidate evidence and all three target references, including the latest approved Mei event-relay.'], limits: B5_PREVIEW_LIMITS};
  write(path.join(evidenceDir, 'preview-review-template.json'), value);
  return value;
}
export function verifyB5PreviewReadiness(args, {root = ROOT} = {}) {
  const plan = candidateB5Plan(args, args.candidateDir, {root});
  const targets = b5PreviewTargets(root);
  const result = verifyB5PreviewReview(args, {checkpoint_sha256: plan.sha256, targets});
  return {...result, plan_checkpoint: plan, limits: [...result.limits, ...B5_PREVIEW_LIMITS]};
}
export function verifyB5PreviewReceipt(args, receiptDir, options = {}) {
  const receipt = read(file(path.join(receiptDir, 'preview-ready.json'), 'preview-ready receipt'));
  need(receipt.status === 'preview_ready' && text(receipt.review), 'preview-ready receipt is missing or not ready');
  const result = verifyB5PreviewReadiness({...args, reviewFile: receipt.review}, options);
  for (const key of ['output_sha256', 'candidate_sha256', 'project_fingerprint', 'plan_sha256', 'evidence_sha256', 'review_sha256', 'plan_checkpoint'])
    need(same(receipt[key], result[key]), 'preview-ready receipt is stale: ' + key);
  return result;
}
