import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

// Documentation/provenance regression only. This does not score animation,
// establish actual viewing/listening, or turn a populated template into a pass.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const motion = read('references/b5-left-stage-motion.md');
const contract = read('references/b5-character-explainer.md');
const original = read('references/b5-mei-original-prompt.md');
const template = read('references/b5-mei-scene-template.md');
const directing = read('references/b5-crazymei-directing-structure.md');

test('new B5 routes reach the original prompt and fillable scene structure before authoring', () => {
  for (const file of ['SKILL.md', 'references/b5-character-explainer.md', 'references/b5-first-preview.md', 'references/b5-crazymei-directing-structure.md']) {
    const source = read(file);
    for (const target of ['b5-mei-original-prompt.md', 'b5-mei-scene-template.md'])
      assert.match(source, new RegExp('\\]\\((?:references/)?' + target.replaceAll('.', '\\.') + '\\)'), file + ' -> ' + target);
  }
  for (const file of ['SKILL.md', 'references/b5-character-explainer.md', 'references/b5-avatar-motion.md', 'references/b5-sound-qa.md'])
    assert.match(read(file), /\]\((?:references\/)?b5-left-stage-motion\.md(?:#[a-z-]+)?\)/, file);
  assert.match(motion, /anonymous left stage/);
  assert.match(motion, /approved bottom-right presenter, narration and captions separate/);
  assert.match(contract, /Left-stage planning gate/);
});

test('the archived original preserves the complete verified body and all five four-field scenes', () => {
  const start = original.indexOf('Optimize and re-render the Autopilot Mode video.');
  assert(start >= 0, 'the historical original body must remain available');
  const body = original.slice(start).replace(/\r\n/g, '\n').trim();
  assert.equal(crypto.createHash('sha256').update(body).digest('hex'), 'd9401c823ea4b915948eda6af2a29a3ea082aaaa97591c324879d0145747b3f3');
  assert.match(original, /01a18fe9-ff38-7690-bf54-df4c33d9e36f/);
  assert.match(original, /42-second plan/);
  assert.match(original, /49\.197 seconds/);
  const scenes = body.split(/\nScene \d+: /).slice(1);
  assert.equal(scenes.length, 5);
  for (const scene of scenes) {
    let prior = -1;
    for (const field of ['- Voiceover:', '- On-Screen Text:', '- Animation Action:', '- SFX:']) {
      const at = scene.indexOf(field);
      assert(at > prior, 'each original scene retains ordered field ' + field);
      prior = at;
    }
  }
  assert.match(original, /six-phase physics checklist was a later implementation aid/);
});

test('the reusable template starts with macro event handoffs and actual semantic voice anchors', () => {
  for (const section of ['GOAL', 'CRITICAL ANIMATION DIRECTIVES', 'OPTIMIZED SCENE BREAKDOWN', 'Voiceover:', 'On-Screen Text:', 'Animation Action:', 'SFX:'])
    assert(template.includes(section), section);
  assert.match(template, /not another historical user message/);
  assert.match(template, /actual voice-aligned start–end/);
  assert.match(template, /MAIN VISUAL A/);
  assert.match(template, /MAIN VISUAL B/);
  assert.match(template, /takes over by/);
  assert.match(template, /exit\/handoff/);
  assert.match(template, /no fixed count\/quota/);
  assert.match(template, /do not make every beat a figure acting in the same room/);
  assert.match(directing, /Preserve the meaning between events, not the same room, occupied task or physical constraint/);
  assert.match(directing, /figure need not appear in every event/);
});

test('event cards separate visual change from event-local physical contact instead of forcing every idea into body mechanics', () => {
  for (const field of ['before_state', 'visual_change', 'composition', 'timing', 'richness', 'hold_exit', 'sound_event'])
    assert.match(motion, new RegExp('\\b' + field + '\\b'), field);
  assert.match(motion, /kind \(physical or visual\)/);
  assert.match(motion, /For a \*\*physical event\*\*, add before\/anticipation\/contact\/consequence\/delayed response\/recovery/);
  assert.match(motion, /For a \*\*visual event\*\*, add meaningful before\/after states and ordered real sample positions/);
  assert.match(motion, /does not need invented force, contact or arms/);
  assert.match(motion, /actual bodily collision still needs physical review/);
  assert.match(motion, /entrance → decisive change → readable result → transition\/next event/);
  assert.match(motion, /setup → anticipation → contact\/constraint → exaggerated consequence → delayed secondary motion → recovery/);
  assert.match(motion, /Props and graphics must act, transform, clear or reinterpret the picture/);
  assert.match(motion, /Unrelated tiny icons, generic bursts, perpetual shaking and more event IDs do not establish richness/);
  assert.match(motion, /Reject a requested event relay that became[^.]*a noun collage/);
  assert.match(contract, /Technical render\/IK\/pixel checks cannot approve the animation/);
});

test('the normal reference model, bounded comic deformation and evaluated contacts remain required where figures appear', () => {
  assert.match(motion, /head\/trunk\/limb proportions and stroke weight under uniform scale/);
  assert.match(motion, /Separate a named, bounded comic deformation from the normal rig/);
  assert.match(motion, /instead of inverse-scaling away the joke/);
  assert.match(motion, /evaluated world transforms/);
  assert.match(motion, /Do not globally waive anatomy/);
  assert.match(motion, /examples, not universal presets/);
  assert.match(motion, /A graphic-only event need not add a figure/);
});

test('V5 is an optional local study and cannot impose a continuous occupied task on the new-story route', () => {
  const v5 = read('references/b5-v5-causal-workflow.md'), first = read('references/b5-first-preview.md');
  assert.match(v5, /Use this optional worked case/);
  assert.match(v5, /must not become the whole-film default/);
  assert.match(first, /Let one meaningful lead visual hand off to the next/);
  assert.match(first, /physical phases for actual physical actions rather than inventing a collision for each beat/);
  assert.match(directing, /continuous task and historical proportions are not the macro template or shape master/);
  assert.doesNotMatch(first, /occupied task, retained constraint, changed attempt and internal repair loop are part of first-use execution/);
  assert.doesNotMatch(v5, /Read for every new B5 story/);
});

test('default review keeps actual candidate playback, optional strict evidence and truthful pending states', () => {
  assert.match(motion, /review the actual encoded candidate once at normal speed with sound/);
  assert.match(motion, /actual before\/change\/result samples/);
  assert.match(motion, /physical anatomy\/contacts where present/);
  assert.match(motion, /Separate silent event clips, independent repeated review and bound evidence records are part of.*optional strict acceptance/);
  assert.match(motion, /Missing playback\/listening stays pending/);
  assert.match(motion, /do not prove a new film matches the targets or that a user has accepted it/);
  assert.match(motion, /Reject a requested event relay that became[^.]*minor limb movements/);
});

test('sound shares actual anchors and preserves media authorization and factual boundaries', () => {
  assert.match(motion, /stable IDs used by picture and sound/);
  assert.match(motion, /source-transient offset/);
  assert.match(motion, /within one project frame/);
  assert.match(motion, /visual reveal.*instead of inventing a collision/);
  assert.match(motion, /Keep factual meaning and uncertainty intact/);
  assert.match(motion, /not permission to assert a motive or invent acts, evidence, documents or quotations/);
  assert.match(motion, /Reuse approved media under existing cost authorization/);
  assert.match(template, /do not infer\s+new voice, paid generation, music or publication permission/);
  assert.match(motion, /each requested ratio natively/);
});

test('links from the event route, source and reusable template resolve inside the installed Skill', () => {
  const from = path.join(root, 'references');
  for (const source of [motion, original, template, directing]) for (const match of source.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z]+:\/\//i.test(target)) continue;
    const resolved = path.resolve(from, target);
    assert(resolved.startsWith(root + path.sep), 'link escapes Skill: ' + target);
    assert(fs.existsSync(resolved), 'missing link: ' + target);
  }
});

test('untitled framing remains shot-specific and preserves presenter, captions and approved audio', () => {
  const framing = read('references/b5-avatar-motion.md');
  assert.match(framing, /titled and untitled shots separately/);
  assert.match(framing, /actor-and-prop group/);
  assert.match(framing, /fixed, shot-specific camera framing/);
  assert.match(framing, /Do not use per-frame bounding-box auto-zoom/);
  assert.match(framing, /must not resize the presenter, move captions, retime choreography or change the accepted audio/);
  assert.match(framing, /each native ratio/);
  assert.match(motion, /Compose titled and untitled shots separately/);
});
