// Instruction-contract regression checks, not TTS, SFX or listening-quality tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const policy = read('references/b4-audio-direction.md');

test('B4 entrypoint, style, shared voice and QA routes reach the audio contract', () => {
  for (const rel of ['SKILL.md', 'references/b4-survival-storytelling.md', 'references/autopilot.md', 'references/autopilot-sound-system.md', 'references/autopilot-production-qa.md']) {
    assert.ok(read(rel).includes('b4-audio-direction.md'), rel);
  }
});

test('B4 locks verified Brian identity and observed native settings without silent fallback', () => {
  for (const text of ['Brian — Deep, Resonant and Comforting', 'nPczCjzI2devNBz1zQrb', 'eleven_multilingual_v2', 'speed **1.00**', 'empty style/direction fields', 'never silently substitute', 'Explicit user choices take precedence']) {
    assert.ok(policy.includes(text), text);
  }
  assert.match(policy, /unavailable, unauthenticated or out of quota/);
  assert.match(policy, /no paid call, purchase, subscription or publication/);
});

test('secondary dialogue automation is scoped, researched and never forced narration splitting', () => {
  for (const text of ['Cast only real roles', 'actually use', 'Google Search', 'not forced splits', 'Keep exact spoken text separate', 'does not authorize automatic Brian tuning', 'without asking the user to choose every role or manually download each file']) {
    assert.ok(policy.includes(text), text);
  }
  assert.match(policy, /do not blindly regenerate audio/);
  assert.match(policy, /existing account, cost, rights and sample\/full-film approval gates/i);
});

test('wrong scared acting is repaired at source, not with pitch, gain or a fixed filter', () => {
  for (const text of ['Approve the dry source before processing', 'use whisper only when the story calls for it', 'lowering pitch, volume or bandwidth', 'EQ cannot repair the performance', 'Do not use one fixed telephone bandpass', 'repair/regenerate only the failed lines']) {
    assert.ok(policy.includes(text), text);
  }
  assert.match(policy, /Keep source rate\/pitch unless specifically authorized/);
});

test('critical SFX are verified in the encoded mix with physical identity before layers', () => {
  for (const text of ['Story events must be audible, not just listed', 'encoded full mix with speech active', 'start at native rate', 'slowed/pitched duplicate', 'replayed debris tails', 'distinct missing function', 'not repeated explosions']) {
    assert.ok(policy.includes(text), text);
  }
  assert.match(policy, /does not replace a glass effect/);
});

test('sound contract generalizes beyond frightened caller and horror hook', () => {
  for (const text of ['not automatically Tavi', 'not three always-on tracks', 'Remove redundant', 'Intentional AUDIO CUT', 'not a mandatory ringtone', 'into every B4 story', 'other B styles retain their voice defaults and A is unchanged']) {
    assert.ok(policy.includes(text), text);
  }
  // This contract must not embed the Dispatch repair recipe or private sources.
  assert.doesNotMatch(policy, /170.?6500|330.?3400|41\.30|24\.0.?37\.2|\/Users\/|\/var\/folders\//);
});

test('acceptance retains source/stems, marks listening limits and delivers complete film', () => {
  for (const text of ['untouched originals', 'Keep secondary voices out of FX', 'not proof of good acting', 'leave unavailable checks pending', 'Fix failed regions', 'complete requested film', 'verified local folder shortcut']) {
    assert.ok(policy.includes(text), text);
  }
  assert.match(policy, /never claim that meters or static tests heard the film/);
  assert.match(policy, /do not automatically regenerate accepted media/i);
});

test('optional ending choices preserve the reveal, Brian and both alternatives without fake branching', () => {
  for (const text of ['not a mandatory B4 outro', "story's last line", 'short Brian question', 'readable hold',
    'not clickable branching', 'do not simulate a user selection', 'Both alternatives', 'Duck effects under words',
    'A deliberate silent beat is allowed', 'regenerate only the addendum']) {
    assert.ok(policy.includes(text), text);
  }
  assert.match(policy, /Do not force Dispatch's/);
});

test('first-frame gate rejects habitual silence without making every opening a loud hit', () => {
  for (const text of ['first picture frame', 'Do not automatically reserve two seconds',
    'sub-bass that disappears on small speakers', 'purposeful nonverbal opening',
    'actual exported file', 'recorded story reason', 'not universal audibility laws',
    'b4-opening-audio-check.mjs', 'no mandatory loud hit']) assert.ok(policy.includes(text), text);
  assert.ok(read('references/b4-opening-direction.md').includes('first-frame-audio-gate'));
  assert.ok(read('references/b4-repeatability-check.md').includes('b4-opening-audio-check.mjs'));
});

test('audio reference is portable with resolvable relative links after relocation', t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'b4-audio-contract-'));
  t.after(() => fs.rmSync(temporary, {recursive: true, force: true}));
  const references = path.join(temporary, 'references');
  fs.cpSync(path.join(root, 'references'), references, {recursive: true});
  const moved = fs.readFileSync(path.join(references, 'b4-audio-direction.md'), 'utf8');
  assert.equal(moved, policy);
  for (const match of moved.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
    if (/^https?:/.test(match[1])) continue;
    assert.equal(path.isAbsolute(match[1]), false);
    assert.ok(fs.statSync(path.resolve(references, match[1])).isFile());
  }
});
