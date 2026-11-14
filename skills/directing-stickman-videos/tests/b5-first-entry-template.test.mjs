import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// Portable first-entry integration only; no film quality or viewing claim.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
test('B5 init from another working directory materializes the real portable Mei plan without granting acceptance',()=>{
 const tmp=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'b5-mei-entry-')));
 try {
  const project=path.join(tmp,'project');
  const result=spawnSync(process.execPath,[path.join(root,'scripts/character-explainer.mjs'),'init',project],{cwd:tmp,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const receipt=JSON.parse(result.stdout);
  assert.equal(receipt.mei_scene_plan,path.join(project,'mei-scene-plan.md'));
  assert(fs.existsSync(receipt.mei_original_prompt));
  assert.deepEqual(receipt.required_first_use.map(r=>r.id),['filled-mei-example','verified-original-prompt','mei-event-relay','relay-user-approval','actual-relay-source-guide','actual-relay-source','actual-relay-rig']);
  for(const resource of receipt.required_first_use){assert(path.isAbsolute(resource.path));assert.equal(sha(resource.path),resource.sha256);}
  for(const [id,name] of [['actual-relay-source-guide','README.md'],['actual-relay-source','stage.cjs'],['actual-relay-rig','mei-reference-rig.cjs']])
   assert.equal(receipt.required_first_use.find(r=>r.id===id).path,path.join(root,'examples/b5-mei-event-relay',name));
  assert.equal(sha(path.join(project,'approved-reference.mp4')),receipt.required_first_use.find(r=>r.id==='mei-event-relay').sha256);
  const required=JSON.parse(fs.readFileSync(path.join(project,'required-b5-reading.json'),'utf8'));
  assert.equal(required.status,'required_not_observed');assert.deepEqual(required.resources,receipt.required_first_use);
  assert.match(receipt.reference_study_next,/Read\/view the required latest sample/);
  assert.match(receipt.reference_study_next,/reference-study is optional structured evidence for strict QA/);
  const bundled=fs.readFileSync(path.join(root,'references/b5-mei-scene-template.md'),'utf8').match(/```text\n([\s\S]*?)\n```/)[1];
  const plan=fs.readFileSync(receipt.mei_scene_plan,'utf8');
  assert(plan.includes(bundled));
  assert.match(plan,/unfilled planning template/);
  assert.match(receipt.stage,/fill the Mei Voiceover/);
  assert.equal(fs.existsSync(path.join(project,'preview-ready.json')),false);
  assert.equal(fs.existsSync(path.join(project,'acceptance.json')),false);
  assert.equal(fs.existsSync(path.join(project,'reference-study.json')),false);
  assert.equal(fs.existsSync(path.join(project,'relay-rehearsal.json')),false);
  assert.equal(receipt.scaffold_type,'neutral_new_story');
  assert.equal(fs.readFileSync(path.join(project,'scene/stage.cjs'),'utf8'),fs.readFileSync(path.join(root,'examples/b5-mei-event-relay/new-story-stage.cjs'),'utf8'));
  assert.notEqual(sha(path.join(project,'scene/stage.cjs')),sha(path.join(root,'assets/b5/example/stage.cjs')));
  assert.equal(fs.readFileSync(path.join(project,'scene/renderer.cjs'),'utf8'),fs.readFileSync(path.join(root,'assets/b5/example/renderer.cjs'),'utf8'));
  const historicalProject=path.join(tmp,'historical-reference');
  const historical=spawnSync(process.execPath,[path.join(root,'scripts/character-explainer.mjs'),'init',historicalProject,'--reference-scaffold'],{cwd:tmp,encoding:'utf8'});
  assert.equal(historical.status,0,historical.stderr);assert.equal(JSON.parse(historical.stdout).scaffold_type,'historical_reference');
  assert.equal(sha(path.join(historicalProject,'scene/stage.cjs')),sha(path.join(root,'assets/b5/example/stage.cjs')));
  assert.equal(fs.existsSync(path.join(historicalProject,'preview-ready.json')),false);
  const study=spawnSync(process.execPath,[path.join(root,'scripts/character-explainer.mjs'),'reference-study',project,'--output',path.join(tmp,'reference-evidence')],{cwd:tmp,encoding:'utf8'});
  assert.equal(study.status,0,study.stderr);
  const extracted=JSON.parse(study.stdout),pending=JSON.parse(fs.readFileSync(extracted.study,'utf8'));
  assert.equal(extracted.status,'extracted_not_observed');assert.equal(pending.status,'not_observed');
  for(const field of ['referent','preserved_identity_cues','visible_information_gain']) assert(extracted.next.includes(field),'first-use study handoff must disclose required '+field);
  assert.match(extracted.next,/image-first/);assert.match(extracted.next,/Declarations do not prove/);
  const rehearsal=JSON.parse(fs.readFileSync(extracted.rehearsal,'utf8'));
  assert.equal(extracted.rehearsal,path.join(project,'relay-rehearsal.json'));
  assert.equal(rehearsal.status,'not_reviewed');assert.equal(rehearsal.author_id,'');
  assert.deepEqual(rehearsal.reviewer,{id:'',independent:false,viewed_images:false});
  assert.deepEqual(rehearsal.image_first_reading,{reviewer_id:'',recorded_before_intent:false,images:[]});
  for(const field of ['reference_study_sha256','visual_plan_sha256','preview_plan_sha256']) assert.equal(rehearsal[field],'');
  assert.equal(rehearsal.storyboard.board,null);assert.deepEqual(rehearsal.storyboard.images,[]);
  assert.deepEqual(rehearsal.events,[]);assert.deepEqual(rehearsal.sequence_observations,[]);
  assert.match(extracted.next,/actual independent whole-storyboard/);
  assert.equal(pending.viewing_mode,'unobserved');assert.equal(pending.listening_performed,false);
  assert(fs.existsSync(extracted.board));assert.equal(fs.existsSync(path.join(project,'preview-ready.json')),false);
  assert.equal(fs.readFileSync(path.join(project,'scene/renderer.cjs'),'utf8'),fs.readFileSync(path.join(root,'assets/b5/example/renderer.cjs'),'utf8'));
  assert.equal(fs.readFileSync(path.join(project,'scene/stage.cjs'),'utf8'),fs.readFileSync(path.join(root,'examples/b5-mei-event-relay/new-story-stage.cjs'),'utf8'));
 } finally {fs.rmSync(tmp,{recursive:true,force:true});}
});
