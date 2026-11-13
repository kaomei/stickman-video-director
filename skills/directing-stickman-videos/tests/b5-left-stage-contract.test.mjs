import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Documentation regression checks only. These do not score a rendered animation.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const motion=read('references/b5-left-stage-motion.md');
const contract=read('references/b5-character-explainer.md');

test('B5 routes to left-stage choreography before authoring, separately from presenter routing',()=>{
 for(const f of ['SKILL.md','references/b5-character-explainer.md','references/b5-avatar-motion.md','references/b5-sound-qa.md']){
  assert.match(read(f),/\]\((?:references\/)?b5-left-stage-motion\.md(?:#[a-z-]+)?\)/,f);
 }
 assert.match(motion,/anonymous left-stage stickmen only/);
 assert.match(motion,/bottom-right presenter retains the approved identity/);
 assert.match(contract,/Left-stage planning gate/);
});

test('B5 requires an action card with actor consequences, not just prop entrances',()=>{
 for(const field of ['beat_id','narration_span','actual_word_anchor','before_state','anticipation','contact','consequence','secondary_motion','recovery','sound_event_id','hold_if_any','review_frames']){
  assert.match(motion,new RegExp('\\b'+field+'\\b'),field);
 }
 assert.match(motion,/setup → anticipation → contact\/constraint → exaggerated consequence → delayed secondary motion → recovery/);
 assert.match(motion,/prop entrance \+ small actor pulse \+ generic burst/);
 assert.match(contract,/Technical render\/IK(?:\/pixel)? checks cannot approve the animation/);
});

test('normal IK safety and bounded comic deformation coexist without becoming a loophole',()=>{
 assert.match(motion,/normal rig/);
 assert.match(motion,/explicit comic deformation layer/);
 assert.match(motion,/never disable anatomy checks globally/);
 assert.match(motion,/do not automatically inverse-scale/);
 assert.match(motion,/evaluated world transform/);
 assert.match(motion,/not universal numeric presets/);
 assert.match(motion,/not a mandatory checklist/);
 assert.match(motion,/Do not reuse anvil → battery → scissors in every topic/);
});

test('review requires phase strips, continuous context and silent left-stage inspection',()=>{
 assert.match(motion,/without sound, captions or presenter distraction/);
 assert.match(motion,/before, anticipation, contact, extreme consequence, delayed response and recovery/);
 assert.match(motion,/continuous interval with lead-in\/out/);
 assert.match(motion,/not compulsory cuts|not turn this flag into compulsory cuts/);
 assert.match(motion,/they do not prove a new video matches CrazyMei/);
 assert.match(motion,/does not retroactively improve an existing preview/);
});

test('motion and sound share a contact anchor without changing factual or approval boundaries',()=>{
 assert.match(motion,/stable event ID used by picture and sound/);
 assert.match(motion,/actual source transient offset/);
 assert.match(motion,/within one frame/);
 assert.match(motion,/no fabricated documents, quotations, dates, romantic acts or evidence/);
 assert.match(motion,/Do not regenerate approved assets, spend credits or publish without/);
 assert.match(motion,/each requested aspect ratio native/);
 assert.match(motion,/not a verbatim recovered chat prompt/);
});

test('all local links in the new motion reference resolve within the installed Skill',()=>{
 const from=path.join(root,'references');
 for(const match of motion.matchAll(/\]\(([^)]+)\)/g)){
  const target=match[1].split('#')[0];
  if(!target||/^[a-z]+:\/\//i.test(target))continue;
  const resolved=path.resolve(from,target);
  assert(resolved.startsWith(root+path.sep),'link escapes Skill: '+target);
  assert(fs.existsSync(resolved),'missing link: '+target);
 }
});

test('untitled composition uses shot-specific group framing without changing other layers',()=>{
 const framing=read('references/b5-avatar-motion.md');
 assert.match(framing,/titled and untitled shots separately/);
 assert.match(framing,/actor-and-prop group/);
 assert.match(framing,/fixed, shot-specific camera framing/);
 assert.match(framing,/Do not use per-frame bounding-box auto-zoom/);
 assert.match(framing,/must not resize the presenter, move captions, retime choreography or change the accepted audio/);
 assert.match(framing,/each native ratio/);
 assert.match(motion,/title-aware framing/);
});
