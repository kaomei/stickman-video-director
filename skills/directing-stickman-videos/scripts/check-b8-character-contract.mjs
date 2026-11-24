#!/usr/bin/env node
// Integrity of recorded visual review, not an image recognizer or an aesthetic pass.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const text = value => typeof value === 'string' && value.trim().length > 0;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const SHA = /^[a-f0-9]{64}$/;
export const characterDigest = character => sha(JSON.stringify(character));

export function validateB8CharacterContract(filename) {
  const errors = [];
  const result = {ok: false, errors, scope: 'File integrity and recorded per-region visual review only; does not recognize colors, anatomy or wardrobe from pixels.'};
  let manifest, base;
  try {
    base = path.dirname(path.resolve(filename));
    manifest = JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (error) { errors.push(`Cannot read manifest: ${error.message}`); return result; }
  if (!object(manifest) || manifest.schema_version !== 1 || manifest.style !== 'B8') {
    errors.push('Expected an object with schema_version 1 and style B8'); return result;
  }
  const references = new Map(), characters = new Map(), assets = new Set();
  function file(record, label) {
    if (!object(record) || !text(record.path) || !SHA.test(record.sha256 ?? '')) {
      errors.push(`${label} needs path and SHA-256`); return;
    }
    try {
      const location = path.resolve(base, record.path);
      if (!fs.statSync(location).isFile()) throw new Error('not a regular file');
      if (sha(fs.readFileSync(location)) !== record.sha256) errors.push(`${label} SHA-256 mismatch`);
    } catch (error) { errors.push(`${label}: ${error.message}`); }
  }
  if (!Array.isArray(manifest.references) || !manifest.references.length) errors.push('references must be nonempty');
  else for (const ref of manifest.references) {
    file(ref, 'reference');
    if (!text(ref?.id) || references.has(ref.id)) errors.push('Missing/duplicate reference id');
    else references.set(ref.id, ref);
  }
  if (!Array.isArray(manifest.characters) || !manifest.characters.length) errors.push('characters must be nonempty');
  else for (const character of manifest.characters) {
    if (!object(character)) { errors.push('character must be an object'); continue; }
    if (!text(character.id) || characters.has(character.id)) errors.push('Missing/duplicate character id');
    else characters.set(character.id, character);
    if (!references.has(character.reference_id)) errors.push(`Unknown reference for ${character.id}`);
    if (!object(character.regions) || !Object.keys(character.regions).length) errors.push(`Empty region contract: ${character.id}`);
    else for (const [region, rule] of Object.entries(character.regions)) {
      for (const field of ['color', 'material', 'outline', 'connection']) {
        if (!text(rule?.[field])) errors.push(`${character.id}.${region}.${field} is required`);
      }
    }
  }
  if (!Array.isArray(manifest.assets) || !manifest.assets.length) errors.push('assets must be nonempty');
  else for (const asset of manifest.assets) {
    if (!object(asset)) { errors.push('asset must be an object'); continue; }
    file(asset, `asset ${asset.id}`);
    if (!text(asset.id) || assets.has(asset.id)) errors.push('Missing/duplicate asset id');
    assets.add(asset.id);
    const character = characters.get(asset.character_id);
    if (!character) { errors.push(`Unknown character for ${asset.id}`); continue; }
    if (!text(asset.pose)) errors.push(`Missing pose for ${asset.id}`);
    const visible = asset.visible_regions;
    if (!Array.isArray(visible) || !visible.length || new Set(visible).size !== visible.length) errors.push(`Invalid visible_regions for ${asset.id}`);
    else for (const region of visible) if (!Object.hasOwn(character.regions ?? {}, region)) errors.push(`Unknown region ${region} for ${asset.id}`);
    const review = asset.review;
    if (!object(review)) { errors.push(`Missing visual review for ${asset.id}`); continue; }
    if (review.status !== 'accepted') errors.push(`Visual review not accepted: ${asset.id}`);
    if (review.asset_sha256 !== asset.sha256 || review.contract_sha256 !== characterDigest(character)) errors.push(`Stale review: ${asset.id}`);
    if (!text(review.reviewer) || !text(review.evidence) || !text(review.notes) || !Number.isFinite(Date.parse(review.reviewed_at))) errors.push(`Incomplete review evidence: ${asset.id}`);
    if (Array.isArray(visible)) for (const region of visible) {
      if (review.regions?.[region] !== 'accepted') errors.push(`Region ${region} not accepted: ${asset.id}`);
    }
  }
  result.ok = errors.length === 0;
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length !== 2 || args[0] !== '--manifest') {
    console.error('Usage: node check-b8-character-contract.mjs --manifest character-contract.json');
    process.exitCode = 1;
  } else {
    const result = validateB8CharacterContract(args[1]);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 2;
  }
}
