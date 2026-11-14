#!/usr/bin/env node
// Evidence completeness, not an automatic judge of meaning, audibility or aesthetics.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const requireThat = (ok, message) => { if (!ok) throw Error(message); };
const text = value => typeof value === 'string' && value.trim().length > 0;
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const components = ['captions', 'sfx', 'music'];
const within = (item, duration) => Number.isFinite(item.start) && Number.isFinite(item.end) && item.start >= 0 && item.end > item.start && item.end <= duration + .01;

function boundFile(item, label) {
  requireThat(item && text(item.file) && path.isAbsolute(item.file), `${label}: absolute file required`);
  requireThat(fs.existsSync(item.file) && fs.statSync(item.file).isFile() && fs.statSync(item.file).size > 0, `${label}: real nonempty file required`);
  requireThat(item.sha256 === hash(item.file), `${label}: missing/stale SHA-256`);
  return item.file;
}
export function fileEvidence(file) { const full = path.resolve(file); return {file: full, sha256: hash(full)}; }
function inspectMedia(file) {
  const run = spawnSync(process.env.FFPROBE || 'ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file], {encoding: 'utf8'});
  requireThat(run.status === 0, 'FFprobe could not inspect the actual candidate');
  const result = JSON.parse(run.stdout), video = result.streams.find(s => s.codec_type === 'video');
  const duration = Number(result.format.duration);
  requireThat(video && result.streams.some(s => s.codec_type === 'audio') && duration > 0, 'Candidate must contain actual video and audio streams');
  return {duration, width: video.width, height: video.height};
}
function inspectAudioSource(file, label) {
  const run = spawnSync(process.env.FFPROBE || 'ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', file], {encoding: 'utf8'});
  requireThat(run.status === 0, `${label}: used source must be inspectable audio, not a placeholder/link file`);
  requireThat(JSON.parse(run.stdout).streams.some(stream => stream.codec_type === 'audio'), `${label}: used source has no audio stream`);
}
function covers(ranges, duration, label) {
  requireThat(Array.isArray(ranges) && ranges.length > 0, `${label}: full-scope original-speed review ranges required`);
  let end = 0;
  for (const range of [...ranges].sort((a, b) => a.start - b.start)) {
    requireThat(within(range, duration) && range.speed === 1 && text(range.observation), `${label}: invalid range, original speed or observation`);
    requireThat(range.start <= end + .01, `${label}: unreviewed interval`);
    end = Math.max(end, range.end);
  }
  requireThat(end >= duration - .01, `${label}: review misses the ending`);
}
// A scope label on the completeness report cannot turn an opaque/old file into
// a style pass. Read the original native review, its gate receipt and media
// ledger instead; the index only locates those different native formats.
function checkStyleAcceptance(report, info) {
  const index = read(boundFile(report.style_specific_acceptance.evidence, 'style-specific acceptance evidence'));
  const label = 'style-specific acceptance';
  requireThat(index.schema === 'b-style-acceptance-index/1' && index.verdict === 'pass', `${label}: checked native-report index required`);
  requireThat(index.style === report.style && index.ratio === report.ratio && index.output_sha256 === report.output.sha256, `${label}: inner index scope is stale`);
  const required = {B1: ['reference'], B2: ['reference'], B3: ['reference'], B4: ['picture', 'typography'], B5: ['visual'], B6: ['motion'], B7: ['pixel'], B8: ['greek'], B9: ['live-sketch']}[report.style];
  requireThat(Array.isArray(index.reports) && index.reports.length === required.length && new Set(index.reports.map(row => row.kind)).size === required.length && required.every(kind => index.reports.some(row => row.kind === kind)), `${label}: missing/duplicate native style gates`);
  const scope = range => requireThat(range && Math.abs(range.start) < .02 && Math.abs(range.end - info.duration) < .15, `${label}: native review omits current output scope`);
  const dimensions = meta => requireThat(meta && meta.width === info.width && meta.height === info.height, `${label}: native ratio/dimensions mismatch`);
  const current = digest => requireThat(digest === report.output.sha256, `${label}: native report belongs to another output`);
  const noIssues = (value, field) => requireThat(Array.isArray(value) && value.length === 0, `${label}: ${field} missing or unresolved`);
  const checks = value => {
    requireThat(value && typeof value === 'object' && Object.keys(value).length > 0, `${label}: native checks missing`);
    let checked = 0;
    const visit = node => {
      if (!node || typeof node !== 'object') return;
      if (Object.hasOwn(node, 'status')) { checked++; requireThat(['pass', 'accepted', 'not_applicable'].includes(node.status), `${label}: native check pending/failed`); }
      if (Object.hasOwn(node, 'verdict')) { checked++; requireThat(node.verdict === 'pass', `${label}: native verdict pending/failed`); }
      for (const child of Object.values(node)) if (child && typeof child === 'object') visit(child);
    };
    visit(value);
    requireThat(checked > 0, `${label}: native check verdicts missing`);
  };
  for (const entry of index.reports) {
    const load = key => read(boundFile(entry[key], `${label} ${entry.kind}/${key}`));
    const nativeReview = load('review');
    if (entry.kind === 'live-sketch') {
      requireThat(nativeReview.template_only === false && /^B9(?:\s|·|:|$)/.test(nativeReview.style || '') && nativeReview.status === 'ready_for_user_review', `${label}: B9 review is missing, a template or not passed`);
      requireThat(path.resolve(nativeReview.output_video || '') === report.output.file, `${label}: B9 output path mismatch`);
      current(nativeReview.output_sha256); dimensions({width: nativeReview.format?.output_size_pixels?.[0], height: nativeReview.format?.output_size_pixels?.[1]});
      requireThat(nativeReview.format?.aspect_ratio === report.ratio, `${label}: B9 native ratio mismatch`);
      scope({start: nativeReview.scope_seconds?.[0], end: nativeReview.scope_seconds?.[1]});
      const ids = ['drawing_process', 'narration_and_picture', 'composition_and_richness', 'character_and_pen_shape', 'contact_and_live_editing', 'technical_and_preservation'];
      requireThat(Array.isArray(nativeReview.checks) && nativeReview.checks.length === ids.length && ids.every(id => nativeReview.checks.filter(row => row.id === id && row.verdict === 'pass').length === 1), `${label}: B9 six-gate review missing/failed`);
      for (const key of ['format_layout_review', 'single_pen_review', 'editor_drag_review']) requireThat(nativeReview[key]?.verdict === 'pass', `${label}: B9 ${key} pending/failed`);
      requireThat(nativeReview.continuous_review?.normal_speed_playback_observed === true, `${label}: B9 normal-speed review missing`);
      covers((nativeReview.continuous_review.covered_intervals_seconds || []).map(range => ({start: range[0], end: range[1], speed: 1, observation: nativeReview.continuous_review.method})), info.duration, `${label} B9 playback`);
      noIssues(nativeReview.unresolved_limitations, 'B9 limitations');
      requireThat(Array.isArray(nativeReview.issues) && nativeReview.issues.every(issue => ['resolved', 'closed', 'fixed'].includes(issue.status)), `${label}: B9 open issues`);
      if (nativeReview.cross_format_review?.applicable === true) requireThat(nativeReview.cross_format_review.verdict === 'pass', `${label}: B9 cross-format review pending/failed`);
      continue;
    }
    let acceptance = load('acceptance');
    if (entry.acceptance_key !== undefined) {
      const key = {reference: 'reference_acceptance', picture: 'picture_acceptance', typography: 'typography_acceptance'}[entry.kind];
      requireThat(entry.acceptance_key === key && acceptance[key], `${label}: unsupported embedded preview receipt`);
      acceptance = acceptance[key];
    }
    if (entry.kind === 'motion') {
      const render = load('render_report');
      requireThat(acceptance.status === 'reviewer_passed_not_automatic_aesthetic_judgment' && acceptance.sha256 === entry.review.sha256, `${label}: B6 native check-review receipt missing/stale/failed`);
      requireThat(nativeReview.schema_version === 3 && nativeReview.ratio === report.ratio && nativeReview.report_sha256 === entry.render_report.sha256 && text(nativeReview.fingerprint) && nativeReview.fingerprint === render.fingerprint && render.ratio === report.ratio && render.technical_fixture === false && render.purpose === 'production' && render.technical_status === 'pass' && ['preview', 'render'].includes(render.kind), `${label}: B6 native render/review scope mismatch`);
      current(nativeReview.preview?.sha256); current(render.video_sha256);
      requireThat(nativeReview.review?.status === 'pass' && nativeReview.full_playback?.preview_sha256 === report.output.sha256 && nativeReview.full_playback.speed === 1, `${label}: B6 actual playback/review pending/failed`);
      requireThat(Math.abs(nativeReview.preview.end - nativeReview.preview.start - info.duration) < .15 && nativeReview.full_playback.start === nativeReview.preview.start && nativeReview.full_playback.end === nativeReview.preview.end, `${label}: B6 native scope mismatch`);
      requireThat(render.time_range?.start === nativeReview.preview.start && render.time_range?.end === nativeReview.preview.end, `${label}: B6 native render range mismatch`);
      checks(nativeReview.checks); checks(nativeReview.shots); checks(nativeReview.regressions?.length ? nativeReview.regressions : {status: 'pass'});
      noIssues(nativeReview.remaining_gaps, 'B6 remaining gaps');
      requireThat(!nativeReview.supplemental_audit?.known_confirmed_defect, `${label}: B6 confirmed defect`);
      continue;
    }
    if (entry.kind === 'greek') {
      requireThat(acceptance.ok === true && Array.isArray(acceptance.errors) && acceptance.errors.length === 0 && acceptance.review_manifest === entry.review.file, `${label}: B8 native review receipt missing/failed`);
      requireThat(['b8_encoded_sample', 'b8_encoded_film'].includes(nativeReview.kind), `${label}: B8 actual encoded report required`);
      dimensions(nativeReview.quality_review); requireThat(nativeReview.quality_review?.stage === (nativeReview.kind === 'b8_encoded_film' ? 'film' : 'sample'), `${label}: B8 native review stage mismatch`);
      requireThat(Array.isArray(nativeReview.artifacts) && nativeReview.artifacts.some(item => item.sha256 === report.output.sha256 && /\.(mp4|mov)$/i.test(item.path)), `${label}: B8 report has no current encoded output`);
      requireThat(Math.abs(nativeReview.range?.[1] - nativeReview.range?.[0] - info.duration) < .15, `${label}: B8 native scope mismatch`);
      const rows = nativeReview.quality_review.items, shots = Object.keys(nativeReview.shot_digests || {});
      requireThat(nativeReview.quality_review.version === 1 && shots.length > 0 && Array.isArray(rows) && rows.filter(row => row.check === 'cast_style' && row.shot_id === '__cast__').length === 1 && shots.every(id => ['composition', 'arm_direction', 'spatial_motion'].every(key => rows.filter(row => row.check === key && row.shot_id === id).length === 1)), `${label}: B8 native style checks missing`);
      for (const row of rows) {
        const maySkip = row.check === 'arm_direction' || (row.check === 'cast_style' && Array.isArray(row.character_ids) && row.character_ids.length === 0);
        requireThat(row.status === 'accepted' || (row.status === 'not_applicable' && maySkip), `${label}: B8 native check pending/failed`);
        requireThat(text(row.reviewer) && text(row.notes) && Array.isArray(row.evidence) && row.evidence.length > 0 && row.evidence.every(item => nativeReview.artifacts.some(artifact => artifact.path === item.path && artifact.sha256 === item.sha256)) && (row.check === 'cast_style' || row.evidence.some(item => item.sha256 === report.output.sha256 && /\.(mp4|mov)$/i.test(item.path))), `${label}: B8 native actual-output evidence missing`);
      }
      for (const key of ['visual_review', 'actual_listening', 'user_acceptance', 'approval']) requireThat(!['failed', 'fail', 'rejected', 'blocked'].includes(nativeReview[key]?.status || nativeReview[key]), `${label}: B8 ${key} failed`);
      requireThat(nativeReview.technical?.ok !== false && !['failed', 'fail', 'rejected', 'blocked'].includes(nativeReview.technical?.status), `${label}: B8 technical check failed`);
      continue;
    }
    const evidence = load('evidence');
    if (entry.kind === 'pixel') {
      requireThat(acceptance.review_sha256 === entry.review.sha256 && nativeReview.evidence_sha256 === entry.evidence.sha256, `${label}: B7 native hash chain is stale`);
      requireThat(acceptance.schema === 1 && evidence.schema === 1 && nativeReview.schema === 1 && acceptance.style === 'B7' && acceptance.technical_status === 'pass' && acceptance.creative_review_status === 'recorded_pass' && acceptance.delivery_ready === true && evidence.style === 'B7' && nativeReview.style === 'B7', `${label}: B7 native gate missing/failed`);
      current(acceptance.media_sha256); current(evidence.video?.sha256); dimensions(evidence.video);
      requireThat(nativeReview.full_playback?.status === 'pass' && nativeReview.full_listening?.status === 'pass', `${label}: B7 playback/listening pending/failed`);
      for (const key of ['full_playback', 'full_listening']) {
        const playback = nativeReview[key];
        requireThat(Array.isArray(playback.observations) && playback.observations.length > 0 && playback.observations.every(item => text(item.detail)), `${label}: B7 actual observations missing`);
        covers((playback.ranges || []).map(range => ({start: range[0], end: range[1], speed: playback.speed, observation: playback.observations[0].detail})), info.duration, `${label} B7 ${key}`);
      }
      checks(nativeReview.checks); continue;
    }
    requireThat(acceptance.evidence_sha256 === entry.evidence.sha256 && acceptance.review_sha256 === entry.review.sha256 && nativeReview.evidence_sha256 === entry.evidence.sha256, `${label}: native acceptance/evidence/review hash chain is stale`);
    current(acceptance.output_sha256);
    requireThat(acceptance.schema === 1 && evidence.schema === 1 && nativeReview.schema === 1, `${label}: native schema missing`);
    current(nativeReview.output_sha256 || nativeReview.video_sha256);
    noIssues(nativeReview.blocking_issues, 'native blocking issues');
    checks(nativeReview.full_playback);
    if (entry.kind === 'reference') {
      requireThat(acceptance.style === report.style && evidence.style === report.style && nativeReview.style === report.style && acceptance.status === 'sample_target_review_passed', `${label}: native reference review missing/failed/limited`);
      current(evidence.output_sha256); dimensions(evidence.metadata); scope(acceptance.scope); checks(nativeReview.shots);
    } else if (entry.kind === 'visual') {
      requireThat(acceptance.style === 'B5' && evidence.style === 'B5' && ['independent_visual_review_pass', 'visual_review_passed'].includes(acceptance.status), `${label}: B5 native visual review missing/failed`);
      requireThat(['silent_stage', 'complete_mix', 'captions_with_audio'].every(key => nativeReview.full_playback[key]?.status === 'pass'), `${label}: B5 native playback channel missing/failed`);
      current(evidence.source?.sha256); dimensions(evidence.config); requireThat(Math.abs(evidence.config.duration - info.duration) < .15, `${label}: B5 native scope mismatch`); checks(nativeReview.actions); checks(nativeReview.captions);
    } else {
      requireThat(acceptance.status === (entry.kind === 'picture' ? 'independent_picture_review_pass' : 'independent_visual_review_pass'), `${label}: B4 native ${entry.kind} review missing/failed`);
      current(evidence.output_sha256); dimensions(evidence.metadata); scope(acceptance.range || acceptance.scope);
      requireThat(entry.kind !== 'picture' || acceptance.scope === 'picture only', `${label}: B4 picture scope mismatch`);
      checks(nativeReview[entry.kind === 'picture' ? 'shots' : 'moments']);
    }
  }
}
export function createCompletenessTemplate({style, ratio, media}) {
  requireThat(/^B[1-9]$/.test(style), 'Choose B1–B9');
  requireThat(['16:9', '9:16'].includes(ratio), 'Choose one native ratio');
  const output = fileEvidence(media), info = inspectMedia(output.file);
  requireThat(Math.abs(info.width / info.height - (ratio === '16:9' ? 16 / 9 : 9 / 16)) < .025, 'Media dimensions do not match the selected ratio');
  return {
    schema_version: 1, style, ratio, delivery_classification: 'not_checked', output: {...output, ...info},
    reference: {file: '', sha256: '', study_observations: ''},
    approved_script: {file: '', sha256: ''},
    reviewer: {id: '', inspected_at: '', actual_picture_playback: false, actual_encoded_audio_listening: false},
    full_scope_review: {verdict: 'not_checked', ranges: []},
    components: Object.fromEntries(components.map(name => [name, {
      verdict: 'not_checked', plan: {file: '', sha256: ''}, items: [],
      all_planned_items_checked: false, rendered_in_candidate: false,
      encoded_review: {verdict: 'not_checked', observation: ''},
      user_override: null, ...(name === 'music' ? {intentional_silence: []} : {})
    }])),
    style_specific_acceptance: {verdict: 'not_checked', style: '', ratio: '', output_sha256: '', evidence: {file: '', sha256: ''}},
    unresolved_issues: [],
    note: 'All fields start unchecked. Populate only after actual playback/listening. This gate never substitutes for style-specific visual/motion/text/audio, rights or user-approval gates.'
  };
}

export function checkCompleteness(report) {
  requireThat(report.schema_version === 1 && /^B[1-9]$/.test(report.style), 'Unsupported schema/style');
  requireThat(['local_preview', 'final_delivery'].includes(report.delivery_classification), 'Declare local_preview or final_delivery scope');
  let unresolvedRights = false;
  const inspectedSources = new Set();
  requireThat(['16:9', '9:16'].includes(report.ratio), 'One native ratio required');
  const output = boundFile(report.output, 'output'), info = inspectMedia(output);
  requireThat(Math.abs(info.duration - report.output.duration) < .02 && info.width === report.output.width && info.height === report.output.height, 'Output metadata changed');
  requireThat(Math.abs(info.width / info.height - (report.ratio === '16:9' ? 16 / 9 : 9 / 16)) < .025, 'Wrong output ratio');
  boundFile(report.reference, 'reference');
  requireThat(text(report.reference.study_observations), 'Actual selected-style sample study required');
  boundFile(report.approved_script, 'approved_script');
  const reviewer = report.reviewer;
  requireThat(text(reviewer?.id) && text(reviewer.inspected_at) && Number.isFinite(Date.parse(reviewer.inspected_at)) && reviewer.actual_picture_playback === true && reviewer.actual_encoded_audio_listening === true, 'Real picture playback and encoded-audio listening must be recorded');
  requireThat(report.full_scope_review?.verdict === 'pass', 'Full-scope review not passed');
  covers(report.full_scope_review.ranges, info.duration, 'full_scope_review');
  for (const name of components) {
    const entry = report.components?.[name];
    requireThat(entry, `${name}: missing required component`);
    if (entry.verdict === 'user_waived') {
      requireThat(entry.user_override?.kind === 'explicit_user_instruction' && text(entry.user_override.instruction), `${name}: only an explicit user instruction can waive this component`);
      boundFile(entry.user_override.evidence, `${name} user instruction`);
      requireThat(!entry.items?.length, `${name}: a waived component cannot hide used assets`);
      continue;
    }
    requireThat(entry.verdict === 'pass' && entry.all_planned_items_checked === true && entry.rendered_in_candidate === true, `${name}: missing, unchecked or not rendered in candidate`);
    requireThat(entry.user_override === null || entry.user_override === undefined, `${name}: unexpected override on passed component`);
    const planFile = boundFile(entry.plan, `${name} plan`), plan = read(planFile);
    requireThat(plan.component === name && plan.style === report.style && plan.ratio === report.ratio, `${name}: plan scope mismatch`);
    requireThat(plan.output_sha256 === report.output.sha256, `${name}: plan belongs to another encoded candidate`);
    requireThat(Array.isArray(plan.items) && plan.items.length > 0, `${name}: nonempty final cue/track plan required`);
    const ids = plan.items.map(item => item.id);
    requireThat(ids.every(text) && new Set(ids).size === ids.length, `${name}: unique planned item IDs required`);
    requireThat(Array.isArray(entry.items) && entry.items.length === ids.length && new Set(entry.items.map(item => item.id)).size === ids.length && entry.items.every(item => ids.includes(item.id)), `${name}: every planned item must be reviewed exactly once`);
    requireThat(entry.encoded_review?.verdict === 'pass' && text(entry.encoded_review.observation), `${name}: encoded-output review missing`);
    for (const item of plan.items) {
      requireThat(within(item, info.duration) && text(item.purpose), `${name}/${item.id}: invalid timing or semantic purpose`);
      if (name === 'captions') requireThat(text(item.text), `captions/${item.id}: exact semantic text required`);
      else {
        const source = boundFile(item.source, `${name}/${item.id} used source`);
        if (!inspectedSources.has(source)) { inspectAudioSource(source, `${name}/${item.id}`); inspectedSources.add(source); }
        boundFile(item.license_evidence, `${name}/${item.id} rights evidence`);
        requireThat(['cleared_for_declared_use', 'unresolved'].includes(item.rights_status) && text(item.declared_use), `${name}/${item.id}: actual use and rights status required`);
        if (item.rights_status === 'unresolved') unresolvedRights = true;
      }
      const observation = entry.items.find(row => row.id === item.id);
      requireThat(observation.verdict === 'pass' && observation.present_in_candidate === true && text(observation.observation), `${name}/${item.id}: final encoded presence/quality not reviewed`);
    }
    if (name === 'music') {
      const silence = entry.intentional_silence;
      requireThat(Array.isArray(silence), 'music: explicit silence inventory required');
      for (const interval of silence) requireThat(within(interval, info.duration) && text(interval.story_reason) && text(interval.return_or_ending_cue), 'music: silence needs story reason and return/ending cue');
      const intervals = [...plan.items, ...silence].map(item => ({...item, speed: 1, observation: item.purpose || item.story_reason}));
      covers(intervals, info.duration, 'music plus intentional silence');
    }
  }
  requireThat(report.style_specific_acceptance?.verdict === 'pass', 'Original style-specific acceptance remains required');
  requireThat(report.style_specific_acceptance.style === report.style && report.style_specific_acceptance.ratio === report.ratio && report.style_specific_acceptance.output_sha256 === report.output.sha256, 'Style-specific acceptance is stale or belongs to another style/ratio/output');
  checkStyleAcceptance(report, info);
  requireThat(Array.isArray(report.unresolved_issues) && report.unresolved_issues.length === 0, 'Unresolved omissions/findings block delivery acceptance');
  requireThat(!unresolvedRights || report.delivery_classification === 'local_preview', 'Unresolved applicable rights block final-delivery acceptance');
  return {ok: true, style: report.style, ratio: report.ratio, output_sha256: report.output.sha256, completeness_review_status: 'recorded_pass', rights_status: unresolvedRights ? 'unresolved' : 'recorded_cleared_for_declared_use', delivery_status: report.delivery_classification === 'local_preview' ? 'local_preview_not_final' : 'recorded_complete_pending_separate_required_gates', release_ready: false, style_and_aesthetic_certification: 'Not automated: original style gates and truthful actual-media review remain required', publication_authorized: false};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, ...args] = process.argv.slice(2), option = flag => args[args.indexOf(flag) + 1];
    if (command === 'init') {
      for (const flag of ['--style', '--ratio', '--media', '--output']) requireThat(args.includes(flag) && text(option(flag)), `Missing ${flag}`);
      const out = path.resolve(option('--output'));
      requireThat(!fs.existsSync(out), 'Will not overwrite a review');
      const template = createCompletenessTemplate({style: option('--style'), ratio: option('--ratio'), media: option('--media')});
      fs.mkdirSync(path.dirname(out), {recursive: true}); fs.writeFileSync(out, JSON.stringify(template, null, 2) + '\n');
      console.log(JSON.stringify({template: out, status: 'not_checked'}));
    } else if (command === 'check' && args[0]) console.log(JSON.stringify(checkCompleteness(read(path.resolve(args[0]))), null, 2));
    else throw Error('Usage: init --style B1..B9 --ratio 16:9|9:16 --media FILE --output FILE | check REVIEW_JSON');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
