import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {ROOT, FFMPEG} from '../scripts/autopilot-core.mjs';

const cli = path.join(ROOT, 'scripts/autopilot.mjs');
function doctor(args = [], env = {}) {
  const result = spawnSync(process.execPath, [cli, 'doctor', ...args], {
    env: {...process.env, GEMINI_API_KEY: '', ...env}, encoding: 'utf8', timeout: 60000,
  });
  assert.ifError(result.error);
  return {...result, report: JSON.parse(result.stdout)};
}
function temporary(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stickman-doctor-test-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  return dir;
}

test('dependency checks do not claim a render, provider or caption alignment was verified', () => {
  const {report} = doctor();
  assert.equal(report.capabilities?.local_composition.status, 'not_checked');
  for (const name of ['image_generation', 'narration', 'caption_alignment'])
    assert.equal(report.capabilities[name].status, 'not_verified', name);
  assert.equal(typeof report.optional.python.available, 'boolean');
  assert.equal(typeof report.optional.pillow.available, 'boolean');
  assert.equal(typeof report.optional.whisper.installed, 'boolean');
  assert.equal(typeof report.optional.whisper.torch_installed, 'boolean');
  assert.equal(typeof report.optional.whisper.base_model_cached, 'boolean');
  assert.equal(report.network_checked, false);
});

test('missing optional Python features do not block local B composition or expose secrets', t => {
  const dir = temporary(t), secret = 'doctor-test-value-must-never-be-printed';
  const result = doctor([], {AUTOPILOT_PYTHON: path.join(dir, 'missing-python'), GEMINI_API_KEY: secret, XDG_CACHE_HOME: dir});
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.report.optional?.python.available, false);
  assert.equal(result.report.optional.pillow.available, false);
  assert.equal(result.report.capabilities.a6_finishing.status, 'missing');
  assert.equal(result.report.capabilities.local_alignment.status, 'missing');
  assert.equal(result.report.gemini_key_present, true);
  assert.ok(!result.stdout.includes(secret));
  assert.deepEqual(fs.readdirSync(dir), []);
});

test('installed alignment modules and a cached file remain unverified and are not imported', t => {
  const python = ['python3', 'python'].find(exe => spawnSync(exe, ['-c', 'import sys; assert sys.version_info.major == 3']).status === 0);
  if (!python) { t.skip('Optional Python is unavailable'); return; }
  const dir = temporary(t), marker = path.join(dir, 'imported');
  for (const name of ['whisper', 'torch']) fs.writeFileSync(path.join(dir, `${name}.py`), `open(${JSON.stringify(marker)}, 'w').write('unexpected import')\nraise RuntimeError('must not import model runtime')\n`);
  fs.mkdirSync(path.join(dir, 'whisper'));
  const model = path.join(dir, 'whisper/base.pt'); fs.writeFileSync(model, 'not a verified model');
  const {report} = doctor([], {AUTOPILOT_PYTHON: python, PYTHONPATH: dir, XDG_CACHE_HOME: dir});
  assert.equal(report.optional.whisper.installed, true);
  assert.equal(report.optional.whisper.torch_installed, true);
  assert.equal(report.optional.whisper.base_model_cached, true);
  assert.equal(report.capabilities.local_alignment.status, 'not_verified');
  assert.equal(report.capabilities.caption_alignment.status, 'not_verified');
  assert.equal(fs.existsSync(marker), false);
  assert.equal(fs.readFileSync(model, 'utf8'), 'not a verified model');
});

test('smoke renders, mixes, captions and decodes a real offline clip without leaving files', t => {
  const dir = temporary(t);
  const result = doctor(['--smoke'], {TMPDIR: dir, TMP: dir, TEMP: dir});
  assert.equal(result.status, 0, result.stderr);
  const smoke = result.report.capabilities?.local_composition;
  assert.equal(smoke?.status, 'ready');
  assert.equal(smoke.video_codec, 'h264');
  assert.equal(smoke.audio_codec, 'aac');
  assert.deepEqual(smoke.subtitles, ['srt', 'vtt']);
  assert.equal(smoke.full_decode, 'pass');
  assert.ok(smoke.duration > .9 && smoke.duration < 1.2);
  assert.equal(result.report.network_checked, false);
  assert.equal(result.report.capabilities.caption_alignment.status, 'not_verified');
  assert.deepEqual(fs.readdirSync(dir).filter(name => name.startsWith('stickman-doctor-')), []);
});

test('an executable answering version but unable to encode fails smoke and still cleans up', t => {
  const dir = temporary(t), tmp = path.join(dir, 'tmp'); fs.mkdirSync(tmp);
  const limited = path.join(dir, 'limited-ffmpeg');
  fs.writeFileSync(limited, `#!${process.execPath}\nprocess.exit(process.argv.includes('-version') ? 0 : 1);\n`, {mode: 0o755});
  const result = doctor(['--smoke'], {FFMPEG: limited, TMPDIR: tmp, TMP: tmp, TEMP: tmp});
  assert.equal(result.report.checks.ffmpeg, true);
  assert.notEqual(result.status, 0);
  assert.equal(result.report.capabilities?.local_composition.status, 'failed');
  assert.match(result.report.capabilities.local_composition.error, /failed/i);
  assert.deepEqual(fs.readdirSync(tmp).filter(name => name.startsWith('stickman-doctor-')), []);
});

test('a timed-out smoke stops its renderer descendants before removing its temporary project', {skip: process.platform === 'win32'}, async t => {
  const dir = temporary(t), tmp = path.join(dir, 'tmp'); fs.mkdirSync(tmp);
  const marker = path.join(dir, 'worker.pid'), shim = path.join(dir, 'hanging-ffmpeg'), preload = path.join(dir, 'deadline.mjs');
  let worker;
  t.after(() => { if (worker) try { process.kill(worker, 'SIGKILL'); } catch {} });
  fs.writeFileSync(shim, `#!${process.execPath}\nconst fs=require('node:fs'),cp=require('node:child_process'),args=process.argv.slice(2);\nif(args.includes('-version')||args.includes('lavfi'))process.exit(cp.spawnSync(${JSON.stringify(FFMPEG)},args,{stdio:'ignore'}).status??1);\nfs.writeFileSync(${JSON.stringify(marker)},String(process.pid));setInterval(()=>{},1000);\n`, {mode: 0o755});
  // Shorten the diagnostic deadline, retaining real subprocesses and OS signals.
  fs.writeFileSync(preload, `import cp from 'node:child_process';import {syncBuiltinESMExports} from 'node:module';\nconst original=cp.spawnSync;cp.spawnSync=(exe,args,options)=>original(exe,args,args?.includes('preview')?{...options,timeout:2000}:options);syncBuiltinESMExports();\nconst timer=globalThis.setTimeout;globalThis.setTimeout=(fn,ms,...args)=>timer(fn,ms===30000?2000:ms,...args);\n`);
  const result = doctor(['--smoke'], {FFMPEG: shim, TMPDIR: tmp, TMP: tmp, TEMP: tmp, NODE_OPTIONS: `--import ${pathToFileURL(preload).href}`});
  assert.equal(fs.existsSync(marker), true, 'The real encoding worker must have started');
  worker = Number(fs.readFileSync(marker, 'utf8'));
  assert.ok(Number.isInteger(worker) && worker > 1);
  assert.notEqual(result.status, 0);
  assert.equal(result.report.capabilities.local_composition.status, 'failed');
  const running = () => {
    try { process.kill(worker, 0); }
    catch (e) { if (e.code === 'ESRCH') return false; throw e; }
    if (process.platform === 'linux') {
      try { if (/\) Z /.test(fs.readFileSync(`/proc/${worker}/stat`, 'utf8'))) return false; }
      catch (e) { if (e.code === 'ENOENT') return false; throw e; }
    }
    return true;
  };
  for (let i = 0; i < 50 && running(); i++) await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(running(), false, 'A failed diagnostic must not leave its FFmpeg worker running');
  assert.deepEqual(fs.readdirSync(tmp).filter(name => name.startsWith('stickman-doctor-')), []);
});
