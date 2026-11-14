// Synthetic schema/provenance fixture only. No actual viewing, blind reading,
// caption judgment, listening, creative acceptance or user approval is claimed.
import fs from 'node:fs';
import path from 'node:path';
import {createB5PngReviewPack, sealB5PngImageFirstRead} from '../../scripts/b5-png-review-gate.mjs';
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
export const syntheticPngReviewer = {id: 'synthetic-png-schema-reviewer', kind: 'agent', independent: true, viewed_images: true,
  method: 'Synthetic test declaration only: no actual image viewing, blindness or semantic judgment occurred.'};
export function fillSyntheticPngFirstRead(template) {
  const value = structuredClone(template);
  value.status = 'pass'; value.completed = true; value.recorded_before_intent = true; value.reviewer = {...syntheticPngReviewer};
  for (const image of value.images) Object.assign(image, {status: 'pass', subject: 'Synthetic fixture subject; no real observation.',
    relation: 'Synthetic fixture relation, not an observed ownership judgment.', visible_action: 'Synthetic schema fixture state, not an actual reading.'});
  return value;
}
export function fillSyntheticPngPhase2(template, evidence) {
  const value = structuredClone(template), observation = ids => [{detail: 'Synthetic provenance-test observation only; no actual caption, composition or aesthetic review.', evidence_ids: [...new Set(ids)]}];
  value.status = 'pass'; value.reviewer = {...syntheticPngReviewer}; value.blocking_issues = [];
  for (const item of value.first_read_dispositions) Object.assign(item, {status: 'pass', observations: observation([
    item.previous_image_id, item.image_id, item.next_image_id].filter(id => id !== null))});
  for (const item of [...value.actions, ...value.semantic_captions.cards]) Object.assign(item, {status: 'pass', observations: observation(item.evidence_ids)});
  Object.assign(value.full_composition, {status: 'pass', observations: observation(evidence.images.map(image => image.id))});
  for (const [i, item] of value.semantic_captions.adjacent_cards.entries()) Object.assign(item, {status: 'pass', observations: observation([
    ...value.semantic_captions.cards[i].evidence_ids, ...value.semantic_captions.cards[i + 1].evidence_ids, ...item.replacement_evidence_ids])});
  return value;
}
export async function writeSyntheticB5PngReview({dir, c, framesDir, parentDir = path.dirname(framesDir)}, {firstReadTransform} = {}) {
  const evidenceDir = path.join(parentDir, 'png-review'), sealDir = path.join(parentDir, 'png-first-seal');
  fs.mkdirSync(evidenceDir); fs.mkdirSync(sealDir);
  const pack = await createB5PngReviewPack({dir, c, framesDir, out: evidenceDir});
  const firstReadFile = path.join(parentDir, 'png-first-read.json'), reviewFile = path.join(parentDir, 'png-phase2.json');
  const firstRead = fillSyntheticPngFirstRead(read(pack.image_first_template));
  if (firstReadTransform) firstReadTransform(firstRead);
  write(firstReadFile, firstRead);
  const seal = await sealB5PngImageFirstRead({dir, c, framesDir, evidenceDir, firstReadFile, out: sealDir});
  write(reviewFile, fillSyntheticPngPhase2(read(seal.phase2_template), read(pack.evidence)));
  return {args: {dir, c, framesDir, evidenceDir, firstReadFile, sealDir, reviewFile}, pack, seal,
    cliArgs: ['--png-evidence', evidenceDir, '--image-first-read', firstReadFile, '--image-first-seal', sealDir, '--png-review', reviewFile]};
}
