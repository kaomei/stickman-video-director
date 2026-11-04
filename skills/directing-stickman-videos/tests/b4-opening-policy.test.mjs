// Instruction coverage only; not a test of dramatic or perceptual quality.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const opening = read('references/b4-opening-direction.md');

test('B4 entrypoint and drawing contract route to opening direction', () => {
  for (const file of ['SKILL.md', 'references/b4-survival-storytelling.md']) {
    assert.ok(read(file).includes('b4-opening-direction.md'), file);
  }
});

test('opening is story-led, distinct, acted and not a universal horror preset', () => {
  for (const text of ['first three seconds and first ten seconds', 'not permission to rewrite', 'distinct opening artwork', 'later climax still', 'For non-horror B4', 'shoulder–elbow–wrist', 'flash inserts', 'substantive information development']) {
    assert.ok(opening.includes(text), text);
  }
});

test('typography uses dramatic functions, readable semantics and bounded optional treatments', () => {
  for (const text of ['Separate synchronized subtitles', 'translucent/frosted layer', 'semantic units', 'duplicate full subtitle', 'not a mandatory death-note graphic', 'Do not fabricate an in-world note']) {
    assert.ok(opening.includes(text), text);
  }
});

test('opening escalation gives setup/payoff hierarchy and a real picture-state change without forcing limbs', () => {
  for (const text of ['First-three-second visual escalation gate', 'whole lower block together',
    'Do not mechanically choose the first two words', 'never delay narration',
    'one clear emphasis', 'readable principal-picture change', 'no compulsory limb animation',
    'subjective/editorial', 'not a mandatory reaper', 'actual encoded first three seconds',
    'creative acceptance as pending']) {
    assert.ok(opening.includes(text), text);
  }
  assert.ok(read('SKILL.md').includes('first-three-second visual escalation gate'));
});

test('sound uses minimum motivated layers with honest local acceptance', () => {
  for (const text of ['No default ringtone', 'Three functional layers do not need to run at once', 'redundant hiss', 'Brian remains the fixed narrator', 'full encoded mix', 'Static policy tests', 'physical listening/device checks as pending', 'no automatic gallery replacement']) {
    assert.ok(opening.includes(text), text);
  }
  assert.doesNotMatch(opening, /\/Users\/|full-v15|exactly at 9 seconds/);
});

test('held-pose B4 is explicitly valid and does not weaken other styles or require a skeletal rig', () => {
  const guide = read('references/b4-survival-storytelling.md');
  const qa = read('references/autopilot-production-qa.md');
  for (const text of ['Well-drawn held poses are a valid B4 baseline', 'Do not require limb animation',
    'inferior skeletal rig', 'deliberate-hold exception', 'This exception does not change A or B1–B3']) {
    assert.ok(guide.includes(text), text);
  }
  assert.ok(opening.includes('no compulsory limb animation'));
  assert.ok(qa.includes('For B4 apply its deliberate-hold exception'));
  assert.ok(read('SKILL.md').includes('limb animation is not a completion requirement'));
});

test('B4 uses pictured facts instead of redundant labels, but retains useful structural text', () => {
  for (const text of ['Show facts; do not label every fact', 'routine floating words',
    'clock, watch or readable phone/computer display close-up', 'structural titles',
    'connection/disconnection states', 'Separate synchronized subtitles']) {
    assert.ok(opening.includes(text), text);
  }
});

test('all opening reference links resolve inside the portable Skill', () => {
  for (const match of opening.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
    assert.ok(fs.statSync(fileURLToPath(new URL(match[1], new URL('references/', root)))).isFile());
  }
});

test('horror visibility gate is reachable, genre-scoped and preserves identity, reveal order and held poses', () => {
  const guide = read('references/b4-survival-storytelling.md');
  assert.ok(read('SKILL.md').includes('story-led horror visibility gate'));
  assert.ok(opening.includes('b4-survival-storytelling.md#story-led-horror-visibility-gate'));
  for (const text of ['## Story-led horror visibility gate', 'For **B4 horror stories**',
    'across the opening, body and ending', 'Other genres follow their own stakes',
    'Name the visible evidence before generation', 'Separate cast identity from menace',
    'friendly person waving', 'scripted threatening figure', 'intentional double or mimic',
    'limb motion is not required', 'Preserve the script\'s reveal order',
    'sound muted and subtitles/labels disregarded', 'Static instruction tests do not certify']) {
    assert.ok(guide.includes(text), text);
  }
});

test('B4 pose/state review covers the common pelvis, seated legs and intermediate encoded transition', () => {
  // Instruction coverage only. These strings do not assess a generated anatomy.
  const guide = read('references/b4-survival-storytelling.md');
  for (const text of ['common pelvis', 'two distinct legs', 'thighs, knees and lower legs',
    'scene-specific pose brief', 'complete unchanged style prompt',
    'full illustration', 'encoded body crop', 'doubled eyes, mouths or limbs',
    'intermediate encoded frame', 'not a demand for limb animation']) {
    assert.ok(guide.includes(text), text);
  }
  assert.ok(opening.includes('intermediate encoded frame'));
  assert.ok(opening.includes('common pelvis/two-leg fork'));
});
