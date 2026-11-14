// Pre-encode PNG provenance only. Local records cannot authenticate viewing,
// independence, prior knowledge or aesthetic judgment, or intercept raw ffmpeg.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {validateVisualPlan} from './b5-visual-review.mjs';
import {assertB5RevisionInvariants, buildB5RevisionRequirements, validateB5RevisionObservationCoverage} from './b5-png-revision.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sharp = createRequire(import.meta.url)('sharp');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const text = value => typeof value === 'string' && value.trim().length > 0;
const concrete = value => text(value) && !/^(?:pass|passed|fail|failed|unknown|unreviewed|pending|ok|okay|good|done|none|n\/?a|not reviewed|通过|失败|未知|不明|合格|正常|已检查|未检查|同上|无问题|\.\.\.)[\s.!。！]*$/iu.test(value.trim());
const need = (ok, message) => { if (!ok) throw Error('B5 PNG review: ' + message); };
const inside = (file, dir) => file === dir || file.startsWith(dir + path.sep);
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', {flag: 'wx'});
const limits = [
  'PNG review binds recorded observations to exact current files; it is not continuous playback or listening.',
  'Reviewer identity, actual viewing, independence and pre-intent knowledge are declarations, not authenticated facts.',
  'An image-first seal preserves completed observations, including unknown/fail readings; it does not approve their meaning. Phase 2 must address each such reading using its current image and existing nearest image neighbors. IDs and text do not automatically resolve ambiguity.',
  'The CLI protects its supported encode path only; naked ffmpeg bypasses it. Direct export wrappers must call png-review-check immediately before encoding.',
  'Use one writer while validating/encoding; hashes do not prevent concurrent changes after validation.',
  'This admission is not preview_ready, user acceptance or automatic aesthetic/semantic judgment.'
];
export const B5_PNG_CAPTION_CRITERION = 'Inspect actual semantic captions in the native full-composition PNGs, including adjacent cards in order: phrase and modifier continuity, complete intended meaning, readable layout and relation to the pictured action. Do not infer semantic quality from transcript word counts or plan text.';

function plain(value, label, directory = false) {
  need(text(value), label + ' path required');
  const file = path.resolve(value);
  need(fs.existsSync(file) && (directory ? fs.statSync(file).isDirectory() : fs.statSync(file).isFile()), label + ' missing');
  need(fs.realpathSync(file) === file, label + ' must be a plain canonical path, not a symlink');
  return file;
}
function listing(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(dir, entry.name);
    need(!entry.isSymbolicLink(), 'project symlink not allowed');
    return entry.isDirectory() ? listing(file) : [file];
  });
}
export function b5PngProjectFingerprint(dir) {
  return crypto.createHash('sha256').update(listing(dir).sort().map(file => path.relative(dir, file) + ':' + hash(file)).join('\n')).digest('hex');
}
function outsideProject(file, dir, label) { need(!inside(file, dir), label + ' must be outside the project fingerprint'); }
function outputDirectory(out, inputs) {
  const folder = plain(out, 'fresh output', true);
  need(!inside(folder, ROOT) && fs.readdirSync(folder).length === 0, 'output must be empty and outside the installed skill');
  for (const input of inputs) need(!inside(folder, input) && !inside(input, folder), 'output overlaps an input');
  return folder;
}
function currentFrames({dir, c, framesDir}) {
  dir = plain(dir, 'project', true);
  const folder = plain(framesDir, 'frames directory', true), file = plain(path.join(folder, 'frames.json'), 'frame ledger');
  outsideProject(folder, dir, 'frames directory');
  const ledger = read(file), n = Math.round(c.duration * c.fps);
  need(ledger.style === 'B5' && ledger.project === dir && same(ledger.config, c), 'frame ledger belongs to another project/config');
  need(ledger.input_sha256 === b5PngProjectFingerprint(dir), 'project changed; render and review current PNGs again');
  const indexes = Array.from({length: n}, (_, i) => i), names = indexes.map(i => String(i).padStart(6, '0') + '.png');
  need(ledger.complete === true && same(ledger.frames, indexes) && Array.isArray(ledger.files) && same(ledger.files.map(f => f.name), names), 'complete ordered full frame ledger required');
  need(same(fs.readdirSync(folder).filter(name => name.endsWith('.png')).sort(), names), 'PNG file set differs from full frame ledger');
  for (const item of ledger.files) {
    const png = plain(path.join(folder, item.name), 'current PNG'), data = fs.readFileSync(png);
    need(hash(png) === item.sha256, 'current PNG hash changed: ' + item.name);
    need(data.length >= 24 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
      data.toString('ascii', 12, 16) === 'IHDR' && data.readUInt32BE(16) === c.width && data.readUInt32BE(20) === c.height,
    'evidence needs native full-composition PNG dimensions: ' + item.name);
  }
  const plan = validateVisualPlan({dir, c}), planFile = path.join(dir, 'scene/visual-plan.json');
  const previewPlan = path.join(dir, 'scene/preview-plan.json');
  if (ledger.plan_checkpoint) need(hash(plain(ledger.plan_checkpoint.path, 'plan checkpoint')) === ledger.plan_checkpoint.sha256, 'plan checkpoint changed');
  const binding = {project: dir, frames_dir: folder, frame_ledger_path: file, frame_ledger_sha256: hash(file),
    project_fingerprint: ledger.input_sha256, config: {width: c.width, height: c.height, fps: c.fps, duration: c.duration},
    config_sha256: hash(path.join(dir, 'scene/config.json')), plan_checkpoint: ledger.plan_checkpoint || null,
    visual_plan_sha256: hash(planFile), preview_plan_sha256: fs.existsSync(previewPlan) ? hash(plain(previewPlan, 'preview plan')) : null,
    transcript_sha256: plan.transcript.sha256};
  return {dir, c, folder, ledger, plan, binding, n};
}
function selection(current) {
  const {plan, c, n} = current, at = time => Math.max(0, Math.min(n - 1, Math.ceil(time * c.fps - 1e-7)));
  const actions = plan.actions.map(action => ({action_id: action.id, frames: (action.kind === 'visual' ? action.visual_phases.map(s => s.at) : Object.values(action.phases)).map(at)}));
  const cards = plan.captions.groups.map(group => ({card_id: group.id, frames: [...new Set(group.units.flatMap(unit => [at(unit.start), at(Math.max(unit.start, Math.min(unit.end - 1 / c.fps, unit.start + Math.max(1 / c.fps, (unit.end - unit.start) / 2)))), at(Math.max(unit.start, unit.end - 1 / c.fps))]))]}));
  const adjacent = cards.slice(1).map((card, i) => ({card_ids: [cards[i].card_id, card.card_id],
    frames: [Math.max(0, at(plan.captions.groups[i + 1].start) - 1), at(plan.captions.groups[i + 1].start), card.frames[Math.min(1, card.frames.length - 1)]]}));
  const frames = [...new Set([...actions, ...cards, ...adjacent].flatMap(item => item.frames))].sort((a, b) => a - b);
  const images = frames.map((index, i) => ({id: 'image-' + String(i + 1).padStart(6, '0'), full_file: 'full-composition/' + String(i + 1).padStart(6, '0') + '.png',
    neutral_file: 'neutral-view/' + String(i + 1).padStart(6, '0') + '.png', frame_index: index, source_name: current.ledger.files[index].name, sha256: current.ledger.files[index].sha256}));
  const ids = frames => [...new Set(frames)].map(index => images.find(image => image.frame_index === index).id);
  return {images, actions: actions.map(item => ({action_id: item.action_id, evidence_ids: ids(item.frames)})), cards: cards.map(item => ({card_id: item.card_id, evidence_ids: ids(item.frames)})),
    adjacent: adjacent.map(item => ({card_ids: item.card_ids, replacement_evidence_ids: ids(item.frames)}))};
}
function masking(current, file) {
  const [sx, sy, sw, sh] = current.plan.stage_region, [cx, cy, cw, ch] = current.plan.captions.region;
  const overlap = [Math.max(sx, cx), Math.max(sy, cy), Math.min(sx + sw, cx + cw), Math.min(sy + sh, cy + ch)];
  const hasCaptionOverlap = overlap[2] > overlap[0] && overlap[3] > overlap[1];
  if (!file) { need(!hasCaptionOverlap, 'external caption region overlaps the blind stage crop; supply explicit diagnostic masks'); return null; }
  const source = plain(file, 'diagnostic mask declaration');
  outsideProject(source, current.dir, 'diagnostic mask declaration');
  const declaration = read(source);
  need(declaration.schema === 1 && Array.isArray(declaration.masks) && declaration.masks.length > 0, 'diagnostic masks need schema:1 and nonempty masks');
  for (const mask of declaration.masks) {
    const r = mask.region;
    need(Array.isArray(r) && r.length === 4 && r.every(Number.isInteger) && r[0] >= sx && r[1] >= sy && r[2] > 0 && r[3] > 0 && r[0] + r[2] <= sx + sw && r[1] + r[3] <= sy + sh && text(mask.reason), 'diagnostic mask must have a reason and lie inside stage_region');
  }
  need(!hasCaptionOverlap || declaration.masks.some(({region: [x, y, w, h]}) => x <= overlap[0] && y <= overlap[1] && x + w >= overlap[2] && y + h >= overlap[3]), 'diagnostic mask must conceal the overlapping external caption region');
  return {path: source, sha256: hash(source), masks: declaration.masks.map(mask => ({region: mask.region, reason: mask.reason})),
    treatment: 'opaque diagnostic concealment, not authentic source pixels'};
}
async function neutralPng(current, descriptor, derivation) {
  const [left, top, width, height] = current.plan.stage_region;
  const pipeline = sharp(path.join(current.binding.frames_dir, descriptor.source_name)).extract({left, top, width, height});
  const masks = derivation?.masks || [];
  if (masks.length) pipeline.composite([{input: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '">' + masks.map(mask => {
    const [x, y, w, h] = mask.region;
    return '<rect x="' + (x - left) + '" y="' + (y - top) + '" width="' + w + '" height="' + h + '" fill="#eee8df"/>';
  }).join('') + '</svg>')}]);
  return pipeline.png().toBuffer();
}
const digest = data => crypto.createHash('sha256').update(data).digest('hex');
async function evidenceFor(args) {
  const current = currentFrames(args), folder = plain(args.evidenceDir, 'PNG evidence directory', true);
  outsideProject(folder, current.dir, 'PNG evidence');
  const file = plain(path.join(folder, 'evidence.json'), 'PNG evidence manifest'), evidence = read(file), expected = selection(current);
  need(evidence.schema === 1 && evidence.kind === 'b5-rendered-png-evidence' && evidence.status === 'unreviewed' && same(evidence.binding, current.binding), 'PNG evidence binding is stale for current frames directory/ledger/project');
  const derivation = evidence.diagnostic_masking === null ? null : masking(current, evidence.diagnostic_masking?.path);
  need(same(evidence.diagnostic_masking, derivation) && same(evidence.stage_region, current.plan.stage_region), 'diagnostic masking/crop declaration changed');
  const images = [];
  for (const descriptor of expected.images) {
    const neutral = await neutralPng(current, descriptor, derivation);
    images.push({...descriptor, crop: current.plan.stage_region, neutral_sha256: digest(neutral)});
  }
  need(same(evidence.images, images), 'PNG evidence IDs/source hashes/crop derivation differ from current declared images');
  for (const image of evidence.images) {
    need(hash(plain(path.join(folder, image.full_file), 'native full-composition PNG')) === image.sha256, 'full PNG changed or is not from current frame');
    need(hash(plain(path.join(folder, image.neutral_file), 'neutral stage crop')) === image.neutral_sha256, 'neutral crop changed or is not derived from the current frame');
  }
  return {...current, folder, evidence, expected, evidenceRef: {path: file, sha256: hash(file)}};
}
function reviewer(value, author) {
  need(value && text(value.id) && value.id !== author && ['agent', 'human'].includes(value.kind) && text(value.method) && value.independent === true && value.viewed_images === true,
    'actual independent reviewer distinct from author must declare viewed images and method');
}
function firstReadFor(current, firstReadFile) {
  const file = plain(firstReadFile, 'separately saved image-first read'); outsideProject(file, current.dir, 'image-first read');
  const reading = read(file);
  need(reading.schema === 1 && reading.kind === 'b5-png-image-first-read' && same(reading.binding, current.binding) && same(reading.evidence, current.evidenceRef), 'image-first read is missing/stale for exact current PNG evidence');
  reviewer(reading.reviewer, current.plan.author_id);
  need(reading.completed === true && ['pass', 'unknown', 'fail'].includes(reading.status) && reading.recorded_before_intent === true,
    'image-first read must be actually completed and saved before intent; an unperformed template cannot be sealed');
  need(Array.isArray(reading.images) && same(reading.images.map(image => image.image_id), current.evidence.images.map(image => image.id)), 'image-first IDs must cover exact current neutral PNGs in order');
  for (const [i, image] of reading.images.entries()) need(image.png_sha256 === current.evidence.images[i].neutral_sha256 && ['pass', 'unknown', 'fail'].includes(image.status) &&
    ['subject', 'relation', 'visible_action'].every(key => concrete(image[key])) && Array.isArray(image.alternate_readings) && image.alternate_readings.every(concrete),
  'image-first image needs completed concrete observations and a valid status bound to its actual PNG: ' + image.image_id);
  return {file, reading, ref: {path: file, sha256: hash(file)}};
}
function firstReadDispositions(current, reading) {
  return reading.images.flatMap((image, i) => image.status === 'pass' ? [] : [{image_id: image.image_id, initial_status: image.status,
    previous_image_id: current.evidence.images[i - 1]?.id || null, next_image_id: current.evidence.images[i + 1]?.id || null}]);
}
const unknown = () => ({status: 'unknown', observations: []});
const emptyReviewer = () => ({id: '', kind: 'agent', method: '', independent: false, viewed_images: false});

export async function createB5PngReviewPack(args) {
  const current = currentFrames(args), expected = selection(current);
  const derivation = masking(current, args.diagnosticMasksFile);
  const out = outputDirectory(args.out, [current.dir, current.folder]);
  fs.mkdirSync(path.join(out, 'full-composition')); fs.mkdirSync(path.join(out, 'neutral-view'));
  const images = [];
  for (const descriptor of expected.images) {
    const source = path.join(current.folder, descriptor.source_name), target = path.join(out, descriptor.full_file);
    fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
    need(hash(target) === descriptor.sha256, 'PNG changed while creating evidence');
    const neutral = await neutralPng(current, descriptor, derivation);
    fs.writeFileSync(path.join(out, descriptor.neutral_file), neutral, {flag: 'wx'});
    images.push({...descriptor, crop: current.plan.stage_region, neutral_sha256: digest(neutral)});
  }
  need(same(currentFrames(args).binding, current.binding), 'frames changed while creating evidence');
  const file = path.join(out, 'evidence.json');
  write(file, {schema: 1, kind: 'b5-rendered-png-evidence', status: 'unreviewed', binding: current.binding, stage_region: current.plan.stage_region, diagnostic_masking: derivation, images, limits});
  const template = path.join(out, 'neutral-view/image-first-template.json');
  write(template, {schema: 1, kind: 'b5-png-image-first-read', status: 'unknown', completed: false, binding: current.binding,
    evidence: {path: file, sha256: hash(file)}, reviewer: emptyReviewer(), recorded_before_intent: false,
    images: images.map(image => ({image_id: image.id, png_sha256: image.neutral_sha256, status: 'unknown', subject: '', relation: '', visible_action: '', alternate_readings: []})),
    viewing_scope: 'Only this neutral-view directory before sealing. Stage crops may contain explicitly declared opaque diagnostic concealment; they are not the full composites.', limits});
  return {status: 'unreviewed', evidence: file, neutral_view: path.join(out, 'neutral-view'), image_first_template: template, images: images.length,
    next: 'A fresh actual reviewer sees ONLY neutral-view PNGs and its image-first template, not full-composition, plans, external captions/presenter or prior passes. Save completed concrete observations separately, including unknown/fail readings; only then mark completed true and seal before revealing intent. Sealing records the reading, not semantic approval.', limits};
}

export async function sealB5PngImageFirstRead(args) {
  const current = await evidenceFor(args), first = firstReadFor(current, args.firstReadFile);
  const out = outputDirectory(args.out, [current.dir, current.binding.frames_dir, current.folder, first.file]);
  const snapshot = path.join(out, 'image-first-reading.json');
  fs.copyFileSync(first.file, snapshot, fs.constants.COPYFILE_EXCL); fs.chmodSync(snapshot, 0o444);
  need(hash(snapshot) === first.ref.sha256, 'first read changed while sealing');
  const receiptFile = path.join(out, 'image-first-receipt.json');
  const receipt = {schema: 1, kind: 'b5-png-image-first-seal', status: 'sealed_before_intent', sealed_at: new Date().toISOString(),
    binding: current.binding, evidence: current.evidenceRef, first_read: first.ref, snapshot: {path: snapshot, sha256: hash(snapshot)},
    reviewer: first.reading.reviewer, images: current.evidence.images.map(image => ({id: image.id, sha256: image.sha256, neutral_sha256: image.neutral_sha256})), limits};
  write(receiptFile, receipt); fs.chmodSync(receiptFile, 0o444);
  write(path.join(out, 'phase2-template.json'), {schema: 1, kind: 'b5-png-phase2-review', status: 'unknown', binding: current.binding,
    evidence: current.evidenceRef, first_read: first.ref, image_first_receipt: {path: receiptFile, sha256: hash(receiptFile)}, reviewer: emptyReviewer(),
    first_read_dispositions: firstReadDispositions(current, first.reading).map(item => ({...item, ...unknown()})),
    actions: current.expected.actions.map(item => ({...item, ...unknown()})), full_composition: unknown(),
    semantic_captions: {criterion: B5_PNG_CAPTION_CRITERION, cards: current.expected.cards.map(item => ({...item, ...unknown()})),
      adjacent_cards: current.expected.adjacent.map(item => ({...item, ...unknown()}))},
    blocking_issues: ['Not reviewed. After this initial read is saved/sealed, reveal current plans and inspect actual full PNGs. Address each original unknown/fail using the current image and its mapped existing nearest neighbors; intent, labels or an earlier wide view alone do not resolve the picture. Unresolved referent/contact ambiguity remains a blocker.'], limits});
  return {status: 'sealed_before_intent', receipt: receiptFile, receipt_sha256: hash(receiptFile), phase2_template: path.join(out, 'phase2-template.json'),
    next: 'Initial observations are sealed unchanged, including any unknown/fail reading. Reveal current intent/plans to the same reviewer and save a separate actual phase-2 report, with evidence-based disposition of each such reading. This seal alone does not permit encode.', limits};
}
function observations(value, allowed, label, requiredSets = []) {
  need(value && value.status === 'pass' && Array.isArray(value.observations) && value.observations.length > 0, label + ' missing/unknown/failed');
  const seen = new Set();
  for (const item of value.observations) {
    need(concrete(item.detail) &&
      Array.isArray(item.evidence_ids) && item.evidence_ids.length > 0 && new Set(item.evidence_ids).size === item.evidence_ids.length && item.evidence_ids.every(id => allowed.includes(id)), label + ' needs concrete observations citing its actual full PNG IDs');
    item.evidence_ids.forEach(id => seen.add(id));
  }
  for (const set of requiredSets) need(set.some(id => seen.has(id)), label + ' must cite every required actual full-composition PNG state/adjacent side');
}

export async function validateB5PngPreEncodeReview(args) {
  if (args.revisionFile) return validateB5PngRevisionReview(args);
  const current = await evidenceFor(args), first = firstReadFor(current, args.firstReadFile);
  const sealDir = plain(args.sealDir, 'image-first seal directory', true); outsideProject(sealDir, current.dir, 'seal');
  const sealFile = plain(path.join(sealDir, 'image-first-receipt.json'), 'image-first receipt'), seal = read(sealFile);
  need(seal.schema === 1 && seal.kind === 'b5-png-image-first-seal' && seal.status === 'sealed_before_intent' &&
    same(seal.binding, current.binding) && same(seal.evidence, current.evidenceRef) && same(seal.first_read, first.ref) && same(seal.reviewer, first.reading.reviewer) &&
    same(seal.images, current.evidence.images.map(image => ({id: image.id, sha256: image.sha256, neutral_sha256: image.neutral_sha256}))), 'image-first receipt is stale or bound to a different reading/PNG set');
  const snapshot = plain(path.join(sealDir, 'image-first-reading.json'), 'sealed first-read snapshot');
  need(same(seal.snapshot, {path: snapshot, sha256: hash(snapshot)}) && hash(snapshot) === first.ref.sha256, 'sealed first-read file fingerprint changed');
  const reportFile = plain(args.reviewFile, 'separate phase-2 PNG review'); outsideProject(reportFile, current.dir, 'phase-2 review');
  need(reportFile !== first.file && reportFile !== snapshot && reportFile !== sealFile, 'phase-2 review must be a separate saved report');
  const report = read(reportFile);
  need(report.schema === 1 && report.kind === 'b5-png-phase2-review' && report.status === 'pass' && same(report.binding, current.binding) &&
    same(report.evidence, current.evidenceRef) && same(report.first_read, first.ref) && same(report.image_first_receipt, {path: sealFile, sha256: hash(sealFile)}), 'phase-2 review missing/unknown/failed or bound to stale PNGs/read/receipt');
  reviewer(report.reviewer, current.plan.author_id);
  need(report.reviewer.id === first.reading.reviewer.id, 'phase-2 reviewer must be the actual sealed image-first reviewer');
  need(Array.isArray(report.blocking_issues) && report.blocking_issues.length === 0, 'phase-2 has unresolved blocking issues');
  const dispositions = firstReadDispositions(current, first.reading);
  need(Array.isArray(report.first_read_dispositions) && same(report.first_read_dispositions.map(({image_id, initial_status, previous_image_id, next_image_id}) =>
    ({image_id, initial_status, previous_image_id, next_image_id})), dispositions), 'phase-2 must preserve every original unknown/fail image and its actual nearest neighbor map');
  for (const item of report.first_read_dispositions) {
    const context = [item.previous_image_id, item.image_id, item.next_image_id].filter(id => id !== null);
    observations(item, context, 'first-read disposition/' + item.image_id, context.map(id => [id]));
  }
  need(Array.isArray(report.actions) && same(report.actions.map(action => action.action_id), current.expected.actions.map(action => action.action_id)), 'phase-2 must review every current action in order');
  for (const [i, item] of report.actions.entries()) {
    need(same(item.evidence_ids, current.expected.actions[i].evidence_ids), 'action PNG map changed');
    observations(item, current.expected.actions[i].evidence_ids, 'rendered meaning/' + item.action_id);
  }
  observations(report.full_composition, current.evidence.images.map(image => image.id), 'full composition');
  const captions = report.semantic_captions, cards = current.expected.cards;
  need(captions && captions.criterion === B5_PNG_CAPTION_CRITERION && Array.isArray(captions.cards) && same(captions.cards.map(card => card.card_id), cards.map(card => card.card_id)), 'actual full-composition semantic caption review required for every current card');
  for (const [i, item] of captions.cards.entries()) {
    need(same(item.evidence_ids, cards[i].evidence_ids), 'caption PNG map changed');
    observations(item, cards[i].evidence_ids, 'semantic captions/' + item.card_id, cards[i].evidence_ids.map(id => [id]));
  }
  const pairs = cards.slice(1).map((card, i) => [cards[i].card_id, card.card_id]);
  need(Array.isArray(captions.adjacent_cards) && same(captions.adjacent_cards.map(item => item.card_ids), pairs), 'semantic review must cover every adjacent caption-card relationship');
  for (const [i, item] of captions.adjacent_cards.entries()) {
    const replacement = current.expected.adjacent[i].replacement_evidence_ids;
    need(same(item.replacement_evidence_ids, replacement), 'adjacent replacement PNG map changed');
    observations(item, [...new Set([...cards[i].evidence_ids, ...cards[i + 1].evidence_ids, ...replacement])], 'adjacent caption cards/' + item.card_ids.join('/'),
      [cards[i].evidence_ids, cards[i + 1].evidence_ids, ...replacement.map(id => [id])]);
  }
  return {schema: 1, status: 'png_review_bound_for_internal_encode', binding: current.binding, evidence: current.evidenceRef,
    first_read: first.ref, image_first_receipt: {path: sealFile, sha256: hash(sealFile)}, phase2_review: {path: reportFile, sha256: hash(reportFile)},
    reviewer: report.reviewer, image_ids: current.evidence.images.map(image => image.id), limits};
}

// Revision is a separate admission path. Never rewrite an initial reading/seal,
// and never pretend an unknown previous overall verdict was a full pass.
function revisionRef(ref, current, label) {
  need(ref && text(ref.sha256), label + ' needs its recorded path + SHA');
  const file = plain(ref.path, label); outsideProject(file, current.dir, label);
  need(hash(file) === ref.sha256, label + ' SHA changed');
  return {file, value: read(file), ref: {path: file, sha256: ref.sha256}};
}
const fileRef = file => ({path: path.resolve(file), sha256: hash(file)});
async function previousRevisionEvidence(current, previous) {
  const parent = revisionRef(previous.evidence, current, 'previous evidence'), old = parent.value;
  need(old.schema === 1 && old.kind === 'b5-rendered-png-evidence' && old.status === 'unreviewed', 'previous actual PNG evidence required');
  assertB5RevisionInvariants(old.binding, current.binding);
  need(same(old.stage_region, current.evidence.stage_region) && same(old.diagnostic_masking, current.evidence.diagnostic_masking), 'layout/crop/masking changed; perform a new full review');
  const folder = plain(old.binding.frames_dir, 'previous frames', true), ledgerFile = plain(old.binding.frame_ledger_path, 'previous frame ledger');
  need(ledgerFile === path.join(folder, 'frames.json') && hash(ledgerFile) === old.binding.frame_ledger_sha256, 'previous frame ledger SHA changed');
  const ledger = read(ledgerFile);
  need(ledger.style === 'B5' && ledger.complete === true && ledger.project === old.binding.project && ledger.input_sha256 === old.binding.project_fingerprint &&
    same(ledger.config, current.ledger.config) && same(ledger.frames, current.ledger.frames) &&
    same(ledger.files.map(f => f.name), current.ledger.files.map(f => f.name)), 'previous full frame ledger invalid');
  need(same(fs.readdirSync(folder).filter(name => name.endsWith('.png')).sort(), ledger.files.map(f => f.name)), 'previous full PNG set changed');
  for (const item of ledger.files) need(hash(plain(path.join(folder, item.name), 'previous PNG')) === item.sha256, 'previous PNG changed: ' + item.name);
  const historic = {...current, dir: old.binding.project, folder: path.dirname(parent.file), ledger, binding: old.binding, evidence: old, evidenceRef: parent.ref};
  historic.expected = selection(historic);
  const descriptors = [];
  for (const descriptor of historic.expected.images) {
    const neutral = await neutralPng(historic, descriptor, old.diagnostic_masking);
    descriptors.push({...descriptor, crop: current.plan.stage_region, neutral_sha256: digest(neutral)});
  }
  need(same(old.images, descriptors), 'previous evidence selection/crop derivation changed');
  for (const image of old.images) {
    need(hash(plain(path.join(historic.folder, image.full_file), 'previous full PNG')) === image.sha256 &&
      hash(plain(path.join(historic.folder, image.neutral_file), 'previous neutral PNG')) === image.neutral_sha256, 'previous evidence PNG changed');
  }
  const firstRef = revisionRef(previous.first_read, current, 'previous first read'), first = firstReadFor(historic, firstRef.file);
  const sealRef = revisionRef(previous.seal, current, 'previous seal'), seal = sealRef.value;
  need(seal.schema === 1 && seal.kind === 'b5-png-image-first-seal' && seal.status === 'sealed_before_intent' &&
    same(seal.binding, old.binding) && same(seal.evidence, parent.ref) && same(seal.first_read, first.ref) && same(seal.reviewer, first.reading.reviewer) &&
    same(seal.images, old.images.map(image => ({id: image.id, sha256: image.sha256, neutral_sha256: image.neutral_sha256}))), 'previous seal is not the actual image-first seal');
  const snapshot = revisionRef(seal.snapshot, current, 'previous sealed snapshot');
  need(snapshot.ref.sha256 === first.ref.sha256, 'previous sealed first reading changed');
  const reviewRef = revisionRef(previous.review, current, 'previous phase2 review'), report = reviewRef.value;
  need(report.schema === 1 && report.kind === 'b5-png-phase2-review' && ['pass', 'unknown', 'fail'].includes(report.status) &&
    same(report.binding, old.binding) && same(report.evidence, parent.ref) && same(report.first_read, first.ref) && same(report.image_first_receipt, sealRef.ref), 'previous phase2 provenance invalid');
  reviewer(report.reviewer, current.plan.author_id);
  need(report.reviewer.id === first.reading.reviewer.id && Array.isArray(report.blocking_issues), 'previous actual reviewer/blocker record missing');
  return {...historic, report, first: first.reading};
}
function revisionGroups(current, previous) {
  const images = current.evidence.images, all = images.map(i => i.id), groups = [], byId = id => images.find(i => i.id === id);
  const neighbors = ids => [...new Set(ids.flatMap(id => {const i = all.indexOf(id); return [all[i - 1], id, all[i + 1]].filter(Boolean);}))];
  function add(key, source, ids, start = null, end = null, requiredSets = []) {
    need(source && ['pass', 'unknown', 'fail'].includes(source.status), 'previous item missing: ' + key);
    // Preserve useful wider observations for every group, including caption
    // pairs. They must still cite actual images in the immutable parent pack.
    const cited = source.observations?.flatMap(o => o.evidence_ids || []) || [];
    need(cited.every(id => all.includes(id)), 'previous item cites a nonexistent PNG: ' + key);
    const allowed = [...new Set([...ids, ...cited])];
    if (source.status === 'pass') observations(source, allowed, 'previous ' + key, requiredSets);
    else need(Array.isArray(source.observations) && source.observations.length > 0 && source.observations.every(o => concrete(o.detail) && Array.isArray(o.evidence_ids) && o.evidence_ids.length && o.evidence_ids.every(id => allowed.includes(id))), 'previous uncertain item needs actual concrete context: ' + key);
    const core = neighbors(ids), dependencies = [...new Set([...core, ...cited])];
    // Wider cited PNGs are discrete dependencies, not a request to review every
    // frame between them. Only the original action/card span is continuous.
    groups.push({key, source, dependencies, start_frame: start ?? Math.min(...core.map(id => byId(id).frame_index)),
      end_frame: end ?? Math.max(...core.map(id => byId(id).frame_index))});
  }
  const report = previous.report, expected = current.expected;
  need(Array.isArray(report.actions) && same(report.actions.map(a => a.action_id), expected.actions.map(a => a.action_id)), 'previous action map missing');
  expected.actions.forEach((action, i) => {
    need(same(report.actions[i].evidence_ids, action.evidence_ids), 'previous action PNG mapping changed');
    const plan = current.plan.actions[i];
    add('action/' + action.action_id, report.actions[i], action.evidence_ids, Math.floor(plan.start * current.c.fps), Math.ceil(plan.end * current.c.fps) - 1);
  });
  const dispositions = firstReadDispositions(previous, previous.first);
  need(Array.isArray(report.first_read_dispositions) && same(report.first_read_dispositions.map(({image_id, initial_status, previous_image_id, next_image_id}) =>
    ({image_id, initial_status, previous_image_id, next_image_id})), dispositions), 'previous uncertain reading map changed');
  report.first_read_dispositions.forEach(item => {
    const nearest = [item.previous_image_id, item.image_id, item.next_image_id].filter(Boolean);
    const cited = item.observations?.flatMap(o => o.evidence_ids || []) || [];
    need(cited.every(id => all.includes(id)), 'previous disposition cites a nonexistent PNG');
    // Real dispositions may cite useful wider context as well as the required
    // nearest neighbors. Preserve those exact dependencies, not the whole span.
    const ids = [...new Set([...nearest, ...cited])];
    add('first_read/' + item.image_id, item, ids, current.n, -1, nearest.map(id => [id]));
    groups.at(-1).dependencies = ids;
  });
  add('full_composition', report.full_composition, all);
  const captions = report.semantic_captions;
  need(captions?.criterion === B5_PNG_CAPTION_CRITERION && Array.isArray(captions.cards) && same(captions.cards.map(c => c.card_id), expected.cards.map(c => c.card_id)), 'previous semantic caption criteria/cards changed');
  expected.cards.forEach((card, i) => {
    need(same(captions.cards[i].evidence_ids, card.evidence_ids), 'previous caption PNG mapping changed');
    const plan = current.plan.captions.groups[i];
    add('caption/' + card.card_id, captions.cards[i], card.evidence_ids, Math.floor(plan.start * current.c.fps), Math.ceil(plan.end * current.c.fps) - 1, card.evidence_ids.map(id => [id]));
  });
  need(Array.isArray(captions.adjacent_cards) && same(captions.adjacent_cards.map(c => c.card_ids), expected.adjacent.map(c => c.card_ids)), 'previous adjacent caption mapping changed');
  expected.adjacent.forEach((pair, i) => {
    const source = captions.adjacent_cards[i], ids = [...new Set([...expected.cards[i].evidence_ids, ...expected.cards[i + 1].evidence_ids, ...pair.replacement_evidence_ids])];
    need(same(source.replacement_evidence_ids, pair.replacement_evidence_ids), 'previous replacement evidence changed');
    add('adjacent/' + pair.card_ids.join('/'), source, ids, null, null,
      [expected.cards[i].evidence_ids, expected.cards[i + 1].evidence_ids, ...pair.replacement_evidence_ids.map(id => [id])]);
  });
  return groups;
}
async function revisionContext(args, previousRefs) {
  const current = await evidenceFor(args), previous = await previousRevisionEvidence(current, previousRefs), groups = revisionGroups(current, previous);
  const requirements = buildB5RevisionRequirements({previousImages: previous.evidence.images, images: current.evidence.images,
    previousFiles: previous.ledger.files, files: current.ledger.files, groups});
  return {current, context: {schema: 1, kind: 'b5-png-revision-context', binding: current.binding, evidence: current.evidenceRef,
    previous: previousRefs, previous_overall_status: previous.report.status, previous_reviewer_id: previous.report.reviewer.id,
    previous_blocking_issues: previous.report.blocking_issues, current_frame_ledger: {path: current.binding.frame_ledger_path, sha256: current.binding.frame_ledger_sha256},
    images: current.evidence.images.map(({id, frame_index, sha256}) => ({id, frame_index, sha256})), requirements,
    limits: [...limits, 'Reuse proves exact PNG/plan/timing/text/crop dependencies only. Old evidence did not record arbitrary source/layout file hashes; unchanged layout and local-pose-only scope additionally require the actual reviewer declaration.']}};
}
export async function createB5PngRevisionReviewPack(args) {
  const refs = {evidence: fileRef(path.join(args.previousEvidenceDir, 'evidence.json')), first_read: fileRef(args.previousFirstReadFile),
    seal: fileRef(path.join(args.previousSealDir, 'image-first-receipt.json')), review: fileRef(args.previousReviewFile)};
  const {current, context} = await revisionContext(args, refs), out = outputDirectory(args.out, [current.dir, current.binding.frames_dir, current.folder]);
  const file = path.join(out, 'revision-context.json'); write(file, context);
  const template = path.join(out, 'revision-review-template.json');
  write(template, {schema: 1, kind: 'b5-png-revision-review', context: fileRef(file), actual_review: {path: '', sha256: ''},
    reviewer: {id: context.previous_reviewer_id, kind: 'agent', independent: false, viewed_images: false, method: ''},
    scope: {script_timing_plan_layout_crop_unchanged: false, prior_blocking_issues_resolved: false, critical_anatomy_support_action_captions_resolved: false,
      non_blocking_details_do_not_change_meaning: false, detail: ''}});
  return {status: 'incremental_context_prepared_not_reviewed', context: file, review_template: template,
    previous_overall_status: context.previous_overall_status, changed_frame_ranges: context.requirements.changed_frame_ranges,
    required_current_view_ids: context.requirements.required_current_view_ids,
    next: 'Keep canonical actual delta observations unchanged. The same reviewer supplies one short confirmation linking them by SHA; no repeated blind read or manual item table.', limits: context.limits};
}
export async function validateB5PngRevisionReview(args) {
  const current = await evidenceFor(args), reportFile = plain(args.revisionFile, 'revision review'); outsideProject(reportFile, current.dir, 'revision review');
  const report = read(reportFile);
  need(report.schema === 1 && report.kind === 'b5-png-revision-review', 'explicit revision review wrapper required');
  const contextRef = revisionRef(report.context, current, 'revision context'), stored = contextRef.value;
  const {context} = await revisionContext(args, stored.previous);
  need(same(stored, context), 'revision context is stale; recompute current context');
  const actual = revisionRef(report.actual_review, current, 'canonical actual delta review');
  const coverage = validateB5RevisionObservationCoverage({...context, actual_review_sha256: actual.ref.sha256}, actual.value, report, current.plan.author_id);
  return {schema: 1, status: 'png_revision_review_bound_for_internal_encode', binding: current.binding, evidence: current.evidenceRef,
    previous: context.previous, previous_overall_status: context.previous_overall_status, revision_context: contextRef.ref,
    revision_review: {path: reportFile, sha256: hash(reportFile)}, actual_delta_review: actual.ref, ...coverage,
    limits: [...context.limits, 'This is an explicit local revision admission, not a claim that the old full gate or original cold end-to-end chain passed.']};
}
