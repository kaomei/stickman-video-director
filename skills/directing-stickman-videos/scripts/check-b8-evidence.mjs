#!/usr/bin/env node
// Read-only evidence integrity gate; not a B8 renderer or an aesthetic/listening test.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const DIRECTION_FIELDS = ['intent', 'camera', 'performance', 'secondary', 'continuity', 'sound', 'reference'];
const ACCEPTANCE_FIELDS = ['visual', 'listening', 'user'];
const SHA256 = /^[a-f0-9]{64}$/i;
const EPSILON = 1e-6;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const positive = value => Number.isFinite(value) && value > 0;
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const words = value => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function fileDigest(filename) {
  if (!fs.statSync(filename).isFile()) throw new Error('not a regular file');
  const hash = crypto.createHash('sha256');
  const fd = fs.openSync(filename, 'r');
  try {
    const buffer = Buffer.alloc(1024 * 1024);
    let count;
    while ((count = fs.readSync(fd, buffer)) > 0) hash.update(buffer.subarray(0, count));
  } finally { fs.closeSync(fd); }
  return hash.digest('hex');
}

export function validateB8Evidence(manifestPath, qaPath, {requireAcceptance = false} = {}) {
  const errors = [];
  const result = {ok: false, errors, technicalOnly: !requireAcceptance,
    scope: 'Listed-input integrity and recorded QA gates only; not creative or listening acceptance. The project audit must discover the full transitive dependency closure.',
    acceptance: null, manifest_sha256: null, checked_media_sha256: null};
  let manifest, qa, base;
  try {
    const manifestFile = path.resolve(manifestPath);
    const manifestBytes = fs.readFileSync(manifestFile);
    result.manifest_sha256 = digest(manifestBytes);
    manifest = JSON.parse(manifestBytes.toString('utf8'));
    qa = JSON.parse(fs.readFileSync(path.resolve(qaPath), 'utf8'));
    base = path.dirname(manifestFile);
  } catch (error) {
    errors.push(`Cannot read evidence documents: ${error.message}`);
    return result;
  }
  if (!object(manifest) || !object(qa)) {
    errors.push('Manifest and QA must be JSON objects');
    return result;
  }
  if (manifest.schema_version !== 1 || manifest.style !== 'B8') errors.push('Expected schema_version 1 and style B8');
  if (!positive(manifest.duration_s) || !positive(manifest.fps)) errors.push('duration_s and fps must be positive finite numbers');
  const seen = new Set();
  function checkFile(record, label) {
    if (!object(record) || !nonempty(record.path) || !SHA256.test(record.sha256 ?? '')) {
      errors.push(`${label} must have a path and SHA-256`); return null;
    }
    try {
      const filename = fs.realpathSync(path.resolve(base, record.path));
      if (seen.has(filename)) errors.push(`${label} duplicates another media/source path`);
      seen.add(filename);
      const actual = fileDigest(filename);
      if (actual !== record.sha256.toLowerCase()) errors.push(`${label} SHA-256 mismatch: ${record.path}`);
      return actual;
    } catch (error) {
      errors.push(`${label} cannot be checked: ${record.path}: ${error.message}`); return null;
    }
  }
  result.checked_media_sha256 = checkFile(manifest.media, 'media');
  if (!Array.isArray(manifest.sources) || manifest.sources.length === 0) errors.push('sources must be a nonempty dependency inventory');
  else manifest.sources.forEach((source, index) => checkFile(source, `sources[${index}]`));

  if (!Array.isArray(manifest.shots) || manifest.shots.length === 0) errors.push('shots must be a nonempty whole-film ledger');
  else {
    const ids = new Set();
    let previousEnd = 0;
    manifest.shots.forEach((shot, index) => {
      if (!object(shot)) { errors.push(`shots[${index}] must be an object`); return; }
      if (!(nonempty(shot.id) || Number.isFinite(shot.id)) || ids.has(shot.id)) errors.push(`shots[${index}] has a missing/duplicate id`);
      ids.add(shot.id);
      for (const field of DIRECTION_FIELDS) if (!nonempty(shot[field])) errors.push(`shots[${index}].${field} is required`);
      if (!Number.isFinite(shot.start) || !Number.isFinite(shot.end) || shot.start < 0 || shot.end <= shot.start || shot.end > manifest.duration_s + EPSILON) {
        errors.push(`shots[${index}] has invalid bounds`);
      }
      if (!Number.isFinite(shot.start) || Math.abs(shot.start - previousEnd) > EPSILON) errors.push(`shots[${index}] creates a coverage gap/overlap`);
      previousEnd = shot.end;
    });
    if (!Number.isFinite(previousEnd) || Math.abs(previousEnd - manifest.duration_s) > EPSILON) errors.push('Shot ledger must end at duration_s');
  }

  const captions = manifest.captions;
  if (!object(captions) || !nonempty(captions.script_text) || !Array.isArray(captions.cues) || captions.cues.length === 0) {
    errors.push('captions require script_text and nonempty cues covering the spoken script');
  } else {
    let previousEnd = 0;
    captions.cues.forEach((cue, index) => {
      if (!object(cue)) { errors.push(`captions.cues[${index}] must be an object`); return; }
      if (!nonempty(cue.text)) errors.push(`captions.cues[${index}].text is required`);
      if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < 0 || cue.end <= cue.start || cue.end > manifest.duration_s + EPSILON) errors.push(`captions.cues[${index}] has invalid bounds`);
      if (!Number.isFinite(cue.start) || cue.start < previousEnd - EPSILON) errors.push(`captions.cues[${index}] overlaps or is out of order`);
      previousEnd = cue.end;
    });
    const text = captions.cues.filter(object).map(cue => typeof cue.text === 'string' ? cue.text : '').join(' ');
    if (!words(captions.script_text) || words(text) !== words(captions.script_text)) errors.push('Caption text does not exactly cover the spoken script after punctuation/case normalization');
  }

  if (qa.schema_version !== 1) errors.push('QA must use schema_version 1');
  if (qa.manifest_sha256 !== result.manifest_sha256) errors.push('QA is stale or not bound to this exact manifest');
  if (!result.checked_media_sha256 || qa.checked_media_sha256 !== result.checked_media_sha256) errors.push('QA is not bound to the current encoded media');
  if (!object(qa.checks) || Object.keys(qa.checks).length === 0 || Object.values(qa.checks).some(value => value !== true)) errors.push('QA checks must be nonempty and all strictly true');
  result.acceptance = object(qa.acceptance) ? qa.acceptance : null;
  for (const field of ACCEPTANCE_FIELDS) {
    const status = qa.acceptance?.[field];
    if (!['pending', 'accepted', 'rejected'].includes(status)) errors.push(`QA acceptance.${field} must be pending, accepted or rejected`);
    else if (requireAcceptance && status !== 'accepted') errors.push(`QA acceptance.${field} is not accepted`);
  }
  result.ok = errors.length === 0;
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const options = {};
  let malformed = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--require-acceptance') options.requireAcceptance = true;
    else if (['--manifest', '--qa'].includes(args[i]) && args[i + 1] && !args[i + 1].startsWith('--')) options[args[i].slice(2)] = args[++i];
    else malformed = true;
  }
  if (malformed || !options.manifest || !options.qa) {
    console.error('Usage: node check-b8-evidence.mjs --manifest manifest.json --qa qa.json [--require-acceptance]');
    process.exitCode = 1;
  } else {
    const result = validateB8Evidence(options.manifest, options.qa, options);
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 2;
  }
}
