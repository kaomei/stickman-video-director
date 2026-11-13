import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {FFMPEG, hashFile, loadProject} from '../scripts/autopilot-core.mjs';
import {painter, render} from '../scripts/autopilot-render.mjs';
import {planBStylePortrait} from '../scripts/b-style-portrait.mjs';

// Tone and geometric artwork exercise encoded-pixel/cache provenance only.
// They are not speech, an actual phone review, sample equivalence or approval.
function tone(file) {
  const rate = 48000, bytes = Buffer.alloc(44 + rate * 2);
  bytes.write('RIFF'); bytes.writeUInt32LE(bytes.length - 8, 4);
  bytes.write('WAVEfmt ', 8); bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(rate, 24); bytes.writeUInt32LE(rate * 2, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36); bytes.writeUInt32LE(rate * 2, 40);
  for (let i = 0; i < rate; i++) bytes.writeInt16LE(Math.round(900 * Math.sin(2 * Math.PI * 220 * i / rate)), 44 + i * 2);
  fs.writeFileSync(file, bytes);
}
function decode(file, p) {
  const result = spawnSync(FFMPEG, ['-v', 'error', '-ss', '0.5', '-i', file,
    '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1'], {maxBuffer: 4 * p.width * p.height + 4096});
  assert.equal(result.status, 0, result.stderr?.toString());
  assert.equal(result.stdout.length, 4 * p.width * p.height);
  return result.stdout;
}
function captionCenter(data, p) {
  const plan = planBStylePortrait(p), scale = p.width / plan.design_width;
  let pixels = 0, weight = 0, sum = 0;
  for (let y = Math.ceil(plan.caption.band_top * scale); y < Math.floor((plan.safe_area.y + plan.safe_area.h) * scale); y++) {
    for (let x = 0; x < p.width; x++) {
      const i = (y * p.width + x) * 4;
      const ink = Math.max(0, Math.min(data[i], data[i + 1], data[i + 2]) - 60);
      if (!ink) continue;
      pixels++; weight += ink; sum += x * ink;
    }
  }
  assert.ok(pixels > 50, 'The actual encoded caption must contain visible text ink');
  return sum / weight;
}
async function freshCenter(p) {
  const draw = await painter(p);
  return captionCenter(Buffer.from(draw(.5).data()), p);
}

test('native portrait safe-area changes invalidate encoded shot cache and matching plans still reuse it', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b-portrait-cache-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  tone(path.join(dir, 'tone.wav'));
  const file = path.join(dir, 'project.json');
  const source = {version: 1, style: 'B3', width: 360, height: 640, fps: 12,
    voice: {path: 'tone.wav'}, television: {enabled: false},
    ambience: [{path: 'tone.wav', start: 0, end: 1, gain: .01, loop: false}],
    captions: [{start: 0, end: 1, text: 'A native clear caption.'}],
    shots: [{id: 'native-opening', start: 0, end: 1,
      portrait: {intent: 'Keep the complete geometric prop above its separate native caption band.',
        regions: [{id: 'prop-region', role: 'prop', layer_ids: ['prop'],
          region: {x: 250, y: 450, w: 400, h: 500},
          intent: 'The entire synthetic prop remains legible inside this native phone region.'}]},
      layers: [{id: 'prop', type: 'rect', x: 300, y: 500, w: 200, h: 300, fill: '#a9acae'}]}]};
  const write = () => fs.writeFileSync(file, JSON.stringify(source));
  write();
  const firstProject = loadProject(file), first = await render(firstProject, {full: true, replace: true});
  const firstHash = hashFile(first.output), firstCenter = captionCenter(decode(first.output, firstProject), firstProject);
  assert.equal(first.cache_hits, 0);
  assert.ok(Math.abs(firstCenter - await freshCenter(firstProject)) < 1.5);

  // Only this top-level configuration changes: the native shot and all its
  // declared important regions remain the same and fit both valid safe areas.
  source.portrait = {safe_area: {left: .08}};
  write();
  const nextProject = loadProject(file), next = await render(nextProject, {full: true, replace: true});
  const nextCenter = captionCenter(decode(next.output, nextProject), nextProject);
  assert.notEqual(nextProject.fingerprint, firstProject.fingerprint);
  assert.equal(next.cache_hits, 0, 'Changed caption placement must encode a new shot instead of reusing stale pixels');
  assert.notEqual(hashFile(next.output), firstHash);
  assert.ok(Math.abs(nextCenter - await freshCenter(nextProject)) < 1.5, 'Encoded caption placement must match the new native plan');
  const expectedShift = (planBStylePortrait(nextProject).caption.x - planBStylePortrait(firstProject).caption.x) * nextProject.width / 1280;
  assert.ok(Math.abs(nextCenter - firstCenter - expectedShift) < 1,
    `Encoded text must move with the safe-area-derived caption center: ${JSON.stringify({firstCenter, nextCenter, expectedShift})}`);

  const unchanged = await render(loadProject(file), {full: true, replace: true});
  assert.equal(unchanged.cache_hits, 1, 'An identical current native plan may reuse its verified encoded shot');
});
