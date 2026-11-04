#!/usr/bin/env node
// Read-only exported-opening diagnostic. Thresholds are heuristics, not hearing tests.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const db = energy => energy > 0 ? 10 * Math.log10(energy) : -160;
export function analyzeOpening(samples, sampleRate = 16000) {
  if (!samples.length || !Number.isFinite(sampleRate) || sampleRate <= 0) throw new Error('Empty or invalid audio');
  const size = Math.round(sampleRate * .02);
  const windows = [];
  for (let start = 0; start < samples.length; start += size) {
    const end = Math.min(samples.length, start + size);
    let energy = 0;
    for (let i = start; i < end; i++) {
      if (!Number.isFinite(samples[i])) throw new Error('Non-finite audio sample');
      energy += samples[i] ** 2;
    }
    windows.push({start: start / sampleRate, end: end / sampleRate, rms_dbfs: db(energy / (end - start))});
  }
  // At least 40 ms, so a token single-sample click cannot satisfy the onset gate.
  let onset = null;
  for (let i = 0; i < windows.length - 1; i++) {
    if (windows[i].rms_dbfs >= -36 && windows[i + 1].rms_dbfs >= -36) { onset = windows[i].start; break; }
  }
  let run = null;
  const lulls = [];
  for (const w of windows) {
    if (w.rms_dbfs < -44) {
      if (run === null) run = w.start;
    } else if (run !== null) {
      lulls.push({start: run, end: w.start, duration: w.start - run}); run = null;
    }
  }
  if (run !== null) {
    const end = samples.length / sampleRate;
    lulls.push({start: run, end, duration: end - run});
  }
  const flagged = lulls.filter(gap => gap.duration > .600001);
  const findings = [];
  if (onset === null || onset > .100001) findings.push('delayed_or_missing_perceptible_onset');
  if (flagged.length) findings.push('near_silent_opening_gap');
  return {status: findings.length ? 'needs_review' : 'diagnostic_pass',
    first_perceptible_onset_seconds: onset, longest_quiet_gap_seconds: Math.max(0, ...lulls.map(g => g.duration)),
    flagged_gaps: flagged, findings, analyzed_seconds: samples.length / sampleRate,
    thresholds: {window_ms: 20, sustained_onset_ms: 40, onset_deadline_ms: 100, onset_rms_dbfs: -36,
      quiet_rms_dbfs: -44, quiet_gap_ms: 600},
    physical_listening: 'not performed', human_acceptance: 'not implied'};
}

export function checkOpeningFile(filename, ffmpeg = 'ffmpeg') {
  const file = fs.realpathSync(filename);
  if (!fs.statSync(file).isFile()) throw new Error('Input is not a file');
  const result = spawnSync(ffmpeg, ['-v', 'error', '-i', file, '-t', '3', '-vn',
    '-af', 'highpass=f=250,lowpass=f=5000', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
  {encoding: null, maxBuffer: 2 * 1024 * 1024, timeout: 30000});
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr.toString().slice(-1500));
  if (!result.stdout.length || result.stdout.length % 4) throw new Error('No decodable audio');
  const samples = new Float32Array(result.stdout.length / 4);
  for (let i = 0; i < samples.length; i++) samples[i] = result.stdout.readFloatLE(i * 4);
  const hash = crypto.createHash('sha256');
  const fd = fs.openSync(file, 'r');
  try {
    const buf = Buffer.alloc(1024 * 1024);
    let count;
    while ((count = fs.readSync(fd, buf)) > 0) hash.update(buf.subarray(0, count));
  } finally { fs.closeSync(fd); }
  return {schema: 'b4-opening-audio-diagnostic-v1', file, sha256: hash.digest('hex'),
    filter: 'mono, highpass 250 Hz, lowpass 5000 Hz; not a physical phone test', ...analyzeOpening(samples)};
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: node scripts/b4-opening-audio-check.mjs final.mp4');
    const result = checkOpeningFile(process.argv[2]);
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'diagnostic_pass') process.exitCode = 2;
  } catch (error) {
    console.error(`Opening audio check failed: ${error.message}`); process.exitCode = 1;
  }
}
