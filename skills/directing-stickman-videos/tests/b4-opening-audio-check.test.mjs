import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {analyzeOpening, checkOpeningFile} from '../scripts/b4-opening-audio-check.mjs';
const rate = 16000;
function tone(start = 0, end = 3, amplitude = .1, hz = 650) {
  return Float32Array.from({length: rate * 3}, (_, i) => i / rate >= start && i / rate < end
    ? amplitude * Math.sin(2 * Math.PI * hz * i / rate) : 0);
}
test('immediate sustained content passes; not an aesthetic claim', () => {
  const result = analyzeOpening(tone());
  assert.equal(result.status, 'diagnostic_pass');
  assert.equal(result.physical_listening, 'not performed');
});
test('two-second silent intro fails', () => {
  assert.ok(analyzeOpening(tone(2)).findings.includes('delayed_or_missing_perceptible_onset'));
});
test('token hit then empty gap fails even though onset is prompt', () => {
  const audio = tone(0, .2);
  audio.set(tone(2.6).subarray(rate * 2.6), rate * 2.6);
  const result = analyzeOpening(audio);
  assert.equal(result.first_perceptible_onset_seconds, 0);
  assert.ok(result.findings.includes('near_silent_opening_gap'));
});
test('inaudible bed and isolated click do not pass', () => {
  assert.equal(analyzeOpening(tone(0, 3, .001)).status, 'needs_review');
  const click = new Float32Array(rate * 3); click[0] = .9;
  assert.equal(analyzeOpening(click).first_perceptible_onset_seconds, null);
});
test('short deliberate pause is not a two-second-empty-intro failure', () => {
  const audio = tone(); audio.fill(0, rate, rate * 1.3);
  assert.equal(analyzeOpening(audio).status, 'diagnostic_pass');
});
test('decoder checks file audio and rejects sub-only opening; paths need no shell quoting', t => {
  const available = spawnSync('ffmpeg', ['-version'], {stdio: 'ignore'});
  if (available.status !== 0) return t.skip('ffmpeg unavailable');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b4-opening-audio-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  function wav(name, audio) {
    const pcm = Buffer.alloc(audio.length * 2);
    for (let i = 0; i < audio.length; i++) pcm.writeInt16LE(Math.round(audio[i] * 32767), i * 2);
    const header = Buffer.alloc(44);
    header.write('RIFF'); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVEfmt ', 8);
    header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
    header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 2, 28);
    header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36);
    header.writeUInt32LE(pcm.length, 40);
    const file = path.join(dir, name); fs.writeFileSync(file, Buffer.concat([header, pcm])); return file;
  }
  assert.equal(checkOpeningFile(wav('speech band.wav', tone())).status, 'diagnostic_pass');
  assert.equal(checkOpeningFile(wav('sub only.wav', tone(0, 3, .2, 45))).status, 'needs_review');
  assert.equal(checkOpeningFile(wav('silent lead.wav', tone(2))).status, 'needs_review');
  assert.throws(() => checkOpeningFile(path.join(dir, 'missing.wav')));
});
