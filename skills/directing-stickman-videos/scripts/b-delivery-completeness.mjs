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
  boundFile(report.style_specific_acceptance.evidence, 'style-specific acceptance evidence');
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
