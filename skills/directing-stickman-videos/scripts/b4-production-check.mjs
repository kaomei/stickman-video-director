#!/usr/bin/env node
// Evidence/timing checks only. This neither renders B4 nor certifies aesthetics/listening.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {verifyB4StyleLock} from './b4-style-lock.mjs';

const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const requireThat = (condition, message) => { if (!condition) throw new Error(message); };

export function checkB4Production(ledgerFile, {planning = false, skillRoot} = {}) {
  const filename = fs.realpathSync(ledgerFile);
  const root = path.dirname(filename);
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const lock = verifyB4StyleLock(skillRoot);
  const pending = [];
  const file = (relative, expected, label, optional = false) => {
    requireThat(nonempty(relative) && !path.isAbsolute(relative), `${label}: use a project-relative file`);
    const target = path.resolve(root, relative);
    requireThat(target.startsWith(root + path.sep), `${label}: path escapes project`);
    if (!fs.existsSync(target) && planning && optional) {
      pending.push(`${label}: media not generated`);
      return null;
    }
    const real = fs.realpathSync(target);
    requireThat(real.startsWith(root + path.sep) && fs.statSync(real).isFile(), `${label}: unsafe path or not a file`);
    const bytes = fs.readFileSync(real);
    if (expected !== undefined || !optional) {
      requireThat(typeof expected === 'string' && /^[a-f0-9]{64}$/.test(expected) && digest(bytes) === expected,
        `${label}: fingerprint missing or changed`);
    } else if (!planning) {
      throw new Error(`${label}: fingerprint required`);
    }
    return bytes;
  };
  requireThat(data.schema === 'b4-production-ledger-v1' && data.style === 'B4', 'Expected B4 production ledger v1');
  requireThat(Number.isFinite(data.fps) && data.fps > 0 && data.fps <= 120, 'Invalid fps');
  requireThat(Number.isSafeInteger(data.duration_frames) && data.duration_frames > 0, 'Invalid duration_frames');
  const duration = data.duration_frames;
  const interval = (item, label) => {
    requireThat(Number.isSafeInteger(item?.start_frame) && Number.isSafeInteger(item?.end_frame) &&
      item.start_frame >= 0 && item.end_frame > item.start_frame && item.end_frame <= duration, `${label}: invalid interval`);
  };
  const script = data.script;
  requireThat(script && nonempty(script.authorization), 'Missing script authorization; credit approval alone is not script approval');
  const scriptBytes = file(script.file, script.sha256, 'script');
  requireThat(nonempty(scriptBytes.toString('utf8')), 'Script must contain nonblank authorized narration');
  const voice = data.voice;
  requireThat(voice && ((voice.name === 'Brian' && voice.id === 'nPczCjzI2devNBz1zQrb') ||
    (nonempty(voice.user_override) && nonempty(voice.name) && nonempty(voice.id))), 'Narrator is not verified Brian or an explicit user override');
  requireThat(voice.input_script_sha256 === script.sha256, 'Voice input script fingerprint does not match the authorized script');
  file(voice.file, voice.sha256, 'voice', true);
  const opening = data.opening;
  requireThat(opening && (nonempty(opening.user_override) || (opening.left_half_shadow === true &&
    Array.isArray(opening.question_groups) && opening.question_groups.length === 2 && opening.question_groups.every(nonempty) &&
    Array.isArray(opening.group_start_frames) && opening.group_start_frames.length === 2 &&
    opening.group_start_frames.every(Number.isSafeInteger) && opening.group_start_frames[0] === 0 &&
    opening.group_start_frames[1] > 0 && opening.group_start_frames[1] < Math.min(3 * data.fps, duration) &&
    opening.remainder_entrance === 'together')), 'Opening must preserve half-shadow and semantic grouped question entrance');
  const canonicalPrompt = fs.readFileSync(lock.prompt.path, 'utf8').trim();
  const ids = new Set(lock.references.map(item => item.id));
  requireThat(data.style_lock_version === lock.version, 'Missing or stale canonical style-lock version');
  requireThat(Array.isArray(data.assets) && data.assets.length > 0, 'Missing assets');
  const assets = new Map();
  for (const asset of data.assets) {
    requireThat(nonempty(asset.id) && !assets.has(asset.id), 'Duplicate or missing asset ID');
    assets.set(asset.id, asset);
    requireThat(['new_generated', 'project_owned'].includes(asset.provenance), `${asset.id}: invalid provenance`);
    requireThat(!data.fresh_test || asset.provenance === 'new_generated', `${asset.id}: fresh test must not reuse old film art`);
    requireThat(Array.isArray(asset.references) && asset.references.length > 0 && asset.references.every(id => ids.has(id)),
      `${asset.id}: missing or unknown canonical reference`);
    const prompt = file(asset.prompt_file, asset.prompt_sha256, `${asset.id} prompt`);
    requireThat(prompt.toString('utf8').includes(canonicalPrompt), `${asset.id}: complete canonical style prompt absent`);
    file(asset.file, asset.sha256, asset.id, true);
  }
  requireThat(Array.isArray(data.shots) && data.shots.length > 0, 'Missing shots');
  let cursor = 0, held = 0, previousView;
  for (const [index, shot] of data.shots.entries()) {
    interval(shot, `shot ${index}`);
    requireThat(shot.start_frame === cursor, `shot ${index}: gap, overlap or wrong order`);
    requireThat(assets.has(shot.asset_id) && nonempty(shot.meaningful_view) && nonempty(shot.beat), `shot ${index}: missing asset/view/beat`);
    held = shot.meaningful_view === previousView ? held + shot.end_frame - shot.start_frame : shot.end_frame - shot.start_frame;
    const approvedHold = shot.kind === 'exceptional_hold' && nonempty(shot.user_approval) && nonempty(shot.reason);
    requireThat(held <= 3 * data.fps || approvedHold, `shot ${index}: unchanged meaningful view exceeds 3 seconds`);
    cursor = shot.end_frame;
    previousView = shot.meaningful_view;
  }
  requireThat(cursor === duration, 'Shots do not cover full programme');
  requireThat(Array.isArray(data.ambience) && Array.isArray(data.audio_cuts), 'Missing ambience/audio_cuts');
  const coverage = [];
  for (const bed of data.ambience) {
    interval(bed, 'ambience');
    requireThat(bed.role === 'subtle_bed', 'Ambience must be a subtle bed, not a continuous alarm');
    file(bed.file, bed.sha256, 'ambience', true);
    coverage.push(bed);
  }
  for (const cut of data.audio_cuts) {
    interval(cut, 'audio cut');
    requireThat(nonempty(cut.reason) && nonempty(cut.return_trigger), 'Audio cut needs reason and return trigger');
    coverage.push(cut);
  }
  coverage.sort((a, b) => a.start_frame - b.start_frame);
  let covered = 0;
  for (const item of coverage) {
    requireThat(item.start_frame <= covered, 'Unplanned ambience gap');
    covered = Math.max(covered, item.end_frame);
  }
  requireThat(covered === duration, 'Bed/cut coverage does not cover full programme');
  requireThat(Array.isArray(data.critical_sfx), 'Missing critical_sfx');
  requireThat(data.critical_sfx.length > 0 || nonempty(data.no_critical_sfx_reason), 'Explain absence of critical SFX');
  const cueIds = new Set();
  for (const cue of data.critical_sfx) {
    requireThat(nonempty(cue.id) && !cueIds.has(cue.id) && nonempty(cue.trigger) && nonempty(cue.perspective), 'Invalid or duplicate critical cue');
    cueIds.add(cue.id);
    requireThat(cue.rights_status === 'cleared' || (planning && cue.rights_status === 'pending'), `${cue.id}: rights not cleared`);
    requireThat(cue.review === 'pass' || (planning && cue.review === 'pending'), `${cue.id}: source/full-mix review incomplete`);
    if (cue.rights_status !== 'cleared' || cue.review !== 'pass') pending.push(`${cue.id}: rights/review pending`);
    file(cue.file, cue.sha256, cue.id, true);
  }
  return {schema: 'b4-production-check-v1', mode: planning ? 'planning_only' : 'evidence_check',
    status: 'pass', renderer_support: lock.cli_supported, duration_seconds: duration / data.fps,
    asset_count: assets.size, shot_count: data.shots.length, pending,
    aesthetic_review: 'not performed', physical_listening: 'not performed',
    human_acceptance: 'not implied', provenance: 'self-reported; verify provider/source records separately'};
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const planning = args.includes('--planning');
    const positional = args.filter(arg => arg !== '--planning');
    requireThat(positional.length === 1 && !positional[0].startsWith('--'), 'Usage: node scripts/b4-production-check.mjs ledger.json [--planning]');
    console.log(JSON.stringify(checkB4Production(positional[0], {planning}), null, 2));
  } catch (error) {
    console.error(`B4 production check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
