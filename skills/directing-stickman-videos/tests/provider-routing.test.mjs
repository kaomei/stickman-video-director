// Instruction contracts and offline diagnostics, not agent/provider integration evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => fs.readFileSync(new URL(file, new URL('../', import.meta.url)), 'utf8');
const common = read('references/autopilot.md');
const route = common.split('## Selected-provider execution\n')[1]?.split('\n## ')[0];
const runtime = read('references/autopilot-runtime.md');

test('B entry and setup reach one shared selected-provider execution route', () => {
  assert.ok(route, 'Missing shared execution route');
  for (const file of ['SKILL.md', 'references/getting-started.md', 'references/autopilot-runtime.md']) {
    assert.match(read(file), /autopilot\.md#selected-provider-execution/, file);
  }
  assert.match(common, /Follow \[selected-provider execution\]\(autopilot\.md#selected-provider-execution\) when access or integration is missing/);
  assert.doesNotMatch(common, /If unavailable, explain the gap and ask for a replacement/);
});

test('explicit choice wins without rewriting defaults or reopening accepted audio', () => {
  assert.match(common, /explicit user choice → selected B-style default → B common fallback/);
  assert.match(common, /Google Gemini \*\*Bodi\*\*/);
  assert.match(common, /original \*\*Sadaltager\*\* recording/);
  assert.match(route, /without changing the settings priority/);
  assert.match(route, /Keep the approved words, named voice, native rate, style and accepted media/);
  assert.match(route, /explicit voice override/);
  assert.match(route, /does not authorize recasting, tuning or regeneration/);
});

test('missing integration is neither a ban nor proof of working access', () => {
  assert.match(route, /missing bundled adapter is not a provider prohibition/);
  assert.match(route, /does not prove that integration or access already works/);
  assert.match(route, /missing integration from missing credentials/);
  assert.match(route, /unavailable model\/voice, quota or an observed network failure/);
  assert.match(route, /Do not require Gemini\/ElevenLabs credentials for another route/);
  assert.match(route, /model's name alone does not prove image-generation capability/);
});

test('integration gap gets a bounded project-local path, not a universal adapter claim', () => {
  assert.match(route, /current official documentation/);
  assert.match(route, /within scope and host permissions/);
  assert.match(route, /project-local adapter/);
  assert.match(route, /Do not modify the installed Skill or require an upstream adapter first/);
  assert.match(route, /API key alone is not an integration/);
  assert.match(route, /do not pass an arbitrary key\/base URL/);
  assert.match(route, /new authority, unavailable tooling or meaningful scope expansion/);
});

test('adapter output still uses local media and actual voice-led caption timing', () => {
  assert.match(route, /Feed local audio\/images into the existing manifest/);
  assert.match(route, /align captions to the actual returned audio/);
  assert.match(route, /selected style's quality gates/);
  assert.match(runtime, /renderer consumes compatible local audio and image files/);
});

test('credentials, upload scope, costs, retries and host permissions remain bounded', () => {
  for (const pattern of [
    /environment variables or authenticated connections/,
    /never request pasted secrets or log them/,
    /intended service endpoint and authorized data\/reference-upload scope/,
    /obtain authorization before billable generation or auditions, including test calls/,
    /No automatic paid retries/,
    /inspect uncertain job history\/artifacts before resubmitting/,
    /do not bypass a network restriction/,
  ]) assert.match(route, pattern);
});

test('blocker report must be evidenced and untested access is not called ready', () => {
  assert.match(route, /tool\/configuration checked/);
  assert.match(route, /sanitized error\/category/);
  assert.match(route, /Do not claim the sandbox or provider blocked a request without evidence/);
  assert.match(route, /not successful authentication, quota or generation checks/);
  assert.match(route, /not yet verified/);
});

test('blocked media work does not silently change providers or fake completion', () => {
  assert.match(route, /Continue independent source, script or asset-planning work/);
  assert.match(route, /If safe adaptation is impossible or the user prefers/);
  assert.match(route, /offer importing their media or choosing another service/);
  assert.match(route, /Do not automatically fall back to Gemini, ElevenLabs or OS TTS/);
  assert.match(route, /before checking available routes/);
  assert.match(route, /fabricate media, or call an unfinished film complete/);
});

test('Gemini-only adapter requirements are not generalized to every provider', () => {
  assert.match(runtime, /bundled Gemini adapter requires `GEMINI_API_KEY`/);
  assert.match(runtime, /not a requirement for all providers/);
  assert.match(runtime, /Do not repurpose `gemini-media\.mjs` with another provider's key\/base URL/);
});

test('actual offline doctor reports Gemini key presence without gating local readiness on it', () => {
  const results = [];
  for (const present of [false, true]) {
    const env = {...process.env};
    delete env.GEMINI_API_KEY;
    if (present) env.GEMINI_API_KEY = 'offline-fixture-not-a-real-key';
    const result = spawnSync(process.execPath, ['scripts/autopilot.mjs', 'doctor'], {
      cwd: root, env, encoding: 'utf8', timeout: 30000,
    });
    assert.ifError(result.error);
    const report = JSON.parse(result.stdout);
    assert.equal(report.gemini_key_present, present);
    assert.equal(report.network_checked, false);
    assert.ok(!Object.keys(report.checks).some(key => /key|provider|quota/i.test(key)));
    assert.equal(result.status, Object.values(report.checks).every(Boolean) ? 0 : 1);
    results.push(report.checks);
  }
  assert.deepEqual(results[0], results[1]);
});
