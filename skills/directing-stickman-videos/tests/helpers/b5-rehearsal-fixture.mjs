import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {deflateSync} from 'node:zlib';

// Engineering fixtures only. These real PNG files and deliberately synthetic
// review declarations establish no actual viewing or creative/user approval.
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) {value ^= byte; for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (0xedb88320 & -(value & 1));}
  return (value ^ 0xffffffff) >>> 0;
}
function chunk(type, bytes) {
  const name = Buffer.from(type), size = Buffer.alloc(4), checksum = Buffer.alloc(4);
  size.writeUInt32BE(bytes.length); checksum.writeUInt32BE(crc32(Buffer.concat([name, bytes])));
  return Buffer.concat([size, name, bytes, checksum]);
}
function png(file, offset = 0) {
  const width = 32, height = 18, header = Buffer.alloc(13), scanlines = Buffer.alloc((width * 3 + 1) * height);
  header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const dark = x >= 3 + offset && x < 9 + offset && y >= 6 && y < 12, p = y * (width * 3 + 1) + 1 + x * 3;
    scanlines.fill(dark ? 24 : 236, p, p + 3);
  }
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', deflateSync(scanlines)), chunk('IEND', Buffer.alloc(0))]));
}
export function writeSyntheticB5RelayRehearsal({dir, study, actionIds, resources = study.resources}) {
  const scene = path.join(dir, 'scene'); fs.mkdirSync(scene, {recursive: true});
  for (const name of ['visual-plan.json', 'preview-plan.json']) if (!fs.existsSync(path.join(scene, name)))
    write(path.join(scene, name), {schema: 1, author_id: study.author_id, actions: actionIds.map(id => ({id})), synthetic_contract_fixture: true});
  const imagesDir = path.join(dir, 'synthetic-rehearsal-images'); fs.mkdirSync(imagesDir, {recursive: true});
  const boardPath = path.join(imagesDir, 'board.png'); png(boardPath, 10);
  const board = {id: 'board', path: boardPath, sha256: sha(boardPath)};
  const images = actionIds.map((action_id, i) => {
    const file = path.join(imagesDir, 'event-' + i + '.png'); png(file, (i * 5) % 18);
    return {id: 'synthetic-event-' + i, action_id, path: file, sha256: sha(file)};
  });
  const rehearsal = {schema: 1, status: 'pass', project: fs.realpathSync(dir), author_id: study.author_id,
    reference_study_sha256: '', visual_plan_sha256: '', preview_plan_sha256: '', storyboard: {board, images},
    reviewer: {id: 'synthetic-independent-rehearsal-test-reviewer', independent: true, viewed_images: true,
      method: 'Synthetic contract declarations only; no actual independent viewing or creative approval occurred.'},
    image_first_reading: {reviewer_id: 'synthetic-independent-rehearsal-test-reviewer', recorded_before_intent: true,
      images: images.map(image => ({image_id: image.id, subject: 'Synthetic dark square', relation: 'Square against light field',
        visible_action: 'Synthetic displaced square states only; no semantic animation judgment', alternate_readings: [], status: 'pass'}))},
    target_comparison: {source_sha256: resources.find(r => r.id === 'mei-event-relay').sha256,
      observations: [{at: .7, detail: 'Synthetic comparison field for protocol tests only; no actual approved-film viewing is asserted.'}]},
    sequence_observations: [{detail: 'Synthetic board-binding check only; these tiny square patterns do not establish creative relay quality.', evidence_ids: ['board', ...images.map(i => i.id)]}],
    events: images.map(image => ({action_id: image.action_id, status: 'pass', observations: [{detail: 'Synthetic event-image provenance check only; no actual aesthetic review or acceptance.', evidence_ids: [image.id]}]})),
    blocking_issues: []};
  const file = path.join(dir, 'relay-rehearsal.json');
  const refreshBindings = () => {
    rehearsal.reference_study_sha256 = sha(path.join(dir, 'reference-study.json'));
    rehearsal.visual_plan_sha256 = sha(path.join(scene, 'visual-plan.json'));
    rehearsal.preview_plan_sha256 = sha(path.join(scene, 'preview-plan.json'));
    write(file, rehearsal);
  };
  refreshBindings();
  return {file, rehearsal, board, images, refreshBindings};
}
