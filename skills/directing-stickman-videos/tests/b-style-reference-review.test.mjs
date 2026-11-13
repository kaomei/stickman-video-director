// These are synthetic protocol records over a tiny derivative of bundled media.
// They do not represent actual independent viewing or sample-quality approval.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {referenceInputs,planBStyleReference,buildBStyleReferenceEvidence,verifyBStyleReferenceReview} from '../scripts/b-style-reference-review.mjs';
import {fillSyntheticB3Review} from './helpers/reference-review.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),FFMPEG=process.env.FFMPEG||'ffmpeg';
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const write=(f,x)=>fs.writeFileSync(f,JSON.stringify(x,null,2)+'\n');
function media(args) {const r=spawnSync(FFMPEG,['-v','error',...args]);assert.equal(r.status,0,String(r.stderr));}
function project(style='B1') {
  return {style,width:160,height:90,fps:30,duration:.8,rangeEnd:.8,shots:[{id:'first',start:0,end:.4,layers:[]},{id:'second',start:.4,end:.8,layers:[]}].map(s=>({...s,...(style==='B3'?{b3_semantics:{events:[],graphics:[]}}:{})})),captions:[{start:0,end:.8,text:'Synthetic protocol fixture only.'}],reference_review:{author_id:'synthetic-author',capability:{mode:'sample_target',environment:'Local ffmpeg derivative used only for protocol regression; no aesthetic claim.',limitations:[]}}};
}
function portraitProject(p) {
  Object.assign(p,{width:360,height:640});
  for(const [i,s] of p.shots.entries()) {
    const id='synthetic-prop-'+i;
    s.layers=[{id,type:'image',path:'@b1/idea-bulb-crayon.png',x:300,y:500,w:120,h:160}];
    s.portrait={intent:'Synthetic native portrait places the complete prop inside the phone stage.',regions:[{id:'synthetic-region-'+i,role:'prop',layer_ids:[id],region:{x:280,y:480,w:160,h:200},intent:'Synthetic region includes the complete test prop without overlap.'}]};
  }
}
async function fixture(t,style='B1',mutate=()=>{}) {
  const dir=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'b-style-reference-test-')));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const file=path.join(dir,'video.mp4'),out=path.join(dir,'evidence'),reviewFile=path.join(dir,'review.json');fs.mkdirSync(out);
  const source=path.join(ROOT,'assets/b1/approved-2026-10-23.mp4');
  const p=project(style);mutate(p);
  const r=spawnSync(FFMPEG,['-v','error','-ss','4','-i',source,'-t','0.8','-vf',`scale=${p.width}:${p.height}`,'-r','30','-frames:v','24','-map','0:v:0','-map','0:a:0','-c:v','libx264','-threads:v','1','-pix_fmt','yuv420p','-c:a','aac','-threads:a','1','-y',file]);assert.equal(r.status,0,String(r.stderr));
  const args={file,out,projectFingerprint:'synthetic-fixture-fingerprint',ffmpeg:FFMPEG};
  const ledger=await buildBStyleReferenceEvidence(p,args);
  return {p,dir,file,out,reviewFile,args,ledger};
}
function review(f) {
  const r=read(f.ledger.template_file),refs=f.ledger.references,video=refs.find(x=>x.kind==='video'),audible=refs.find(x=>x.has_audio),detail='Synthetic protocol record only; actual aesthetic viewing is not asserted.';
  r.reviewer={id:'synthetic-independent-reviewer',kind:'agent',method:'Synthetic engineering fixture, not real viewing or aesthetic acceptance.',independent:true};
  r.full_playback={status:'pass',viewed_ranges:[{start:0,end:f.ledger.scope.end}],observations:[{time:0,detail,evidence_ids:['source-video']}]};
  if(f.ledger.plan.portrait)r.portrait_viewing={status:'pass',display_width:360,display_height:640,playback_speed:1,platform:'YouTube Shorts portrait player; synthetic protocol fixture, no actual interface review.',real_device:{checked:false,limitation:'Synthetic protocol fixture only; no physical phone or live platform inspected.'},viewed_ranges:[{start:0,end:f.ledger.scope.end}],observations:['caption_readability','scene_legibility','action_contact','platform_occlusion'].map(aspect=>({aspect,time:0,detail,evidence_ids:['source-video']}))};
  r.baseline_comparisons=refs.filter(x=>x.required_comparison).map(ref=>({reference_id:ref.id,start:0,end:.1,observations:[{time:0,detail,evidence_ids:[ref.id]}]}));
  for(const item of r.shots) {
    const s=f.ledger.plan.shots.find(x=>x.id===item.id);
    for(const [k,c] of Object.entries(item.checks)) Object.assign(c,{status:'pass',observations:[{time:s.start,detail,evidence_ids:[s.id+'-continuous']}],comparisons:[{reference_id:(k==='sound'?audible:video).id,start:0,end:.1,detail}]});
    for(const c of Object.values(item.portrait_checks||{}))Object.assign(c,{status:'pass',observations:[{time:s.start,detail,evidence_ids:[s.id+'-continuous']}]});
  }
  fillSyntheticB3Review(r,f.ledger.plan);
  write(f.reviewFile,r);return r;
}
const verify=f=>verifyBStyleReferenceReview(f.p,{file:f.file,evidenceDir:f.out,reviewFile:f.reviewFile,projectFingerprint:f.args.projectFingerprint,ffmpeg:FFMPEG});
function setReview(f,fn) {const r=review(f);fn(r);write(f.reviewFile,r);}
function connectorProject(p) {
  p.shots[0].layers=[
    {id:'source',type:'rect',x:50,y:50,w:80,h:60},
    {id:'target',type:'rect',x:300,y:50,w:80,h:60},
    {id:'link',type:'arrow',x:130,y:80,w:170,from:.05,keys:[{t:.05,progress:0},{t:.2,progress:1}],motion:{role:'information',reason:'Synthetic connector protocol, not a visual explanation.'}},
  ];
  p.shots[0].b3_semantics={events:[{id:'route',cue_index:0,kind:'relationship',layer_ids:['link'],start:.05,end:.2,before:'Synthetic objects have no displayed route.',after:'Synthetic source connects to the declared target.',purpose:'Synthetic relational review fixture, not an aesthetic approval.'}],graphics:[{id:'link',role:'connector',event_id:'route',source:{layer_id:'source',x:80,y:30},target:{layer_id:'target',x:0,y:30},relation:'Synthetic source sends a test route to the target.',directed:true}]};
}

test('B3 legacy candidates cannot be approved without semantic plans',async t=>{
  const f=await fixture(t,'B3',p=>p.shots.forEach(s=>delete s.b3_semantics));
  assert.equal(f.ledger.plan.b3_semantics.status,'missing_plan');
  review(f);await assert.rejects(()=>verify(f),/B3 semantics:.*plan|b3_semantics/);
});

test('B3 needs complete event and graphic observations, including actual targets and direction',async t=>{
  const f=await fixture(t,'B3',connectorProject),template=read(f.ledger.template_file);
  const pending=template.shots[0].b3_semantics;
  assert.equal(pending.events[0].status,'unknown');assert.equal(pending.graphics[0].status,'unknown');
  review(f);assert.equal((await verify(f)).status,'sample_target_review_passed');
  const cases=[
    [r=>delete r.shots[0].b3_semantics,/per-event and per-graphic/],
    [r=>r.shots[0].b3_semantics.events=[],/every declared event and graphic/],
    [r=>r.shots[0].b3_semantics.graphics.push(r.shots[0].b3_semantics.graphics[0]),/exactly once/],
    [r=>r.shots[0].b3_semantics.events[0].status='unmet',/semantic correctness/],
    [r=>r.shots[0].b3_semantics.events[0].spoken_meaning='OK',/spoken meaning/],
    [r=>r.shots[0].b3_semantics.events[0].contribution='',/deletion-test/],
    [r=>r.shots[0].b3_semantics.events[0].observations.splice(1,1),/before\/during\/after/],
    [r=>r.shots[0].b3_semantics.events[0].observations[0].time=.3,/actual event timing/],
    [r=>r.shots[0].b3_semantics.events[0].observations[0].evidence_ids=['shot-0-mid'],/continuous/],
    [r=>r.shots[0].b3_semantics.graphics[0].role='decoration',/correct-classification/],
    [r=>r.shots[0].b3_semantics.graphics[0].status='unmet',/no capability waiver/],
    [r=>r.shots[0].b3_semantics.graphics[0].use='Good',/observed use/],
    [r=>r.shots[0].b3_semantics.graphics[0].observed_target_id='source',/source\/target differs/],
    [r=>r.shots[0].b3_semantics.graphics[0].observed_direction='target_to_source',/correct direction/],
    [r=>r.shots[0].b3_semantics.graphics[0].observed_relation='',/observed relation/],
    [r=>r.shots[0].b3_semantics.graphics[0].observations[0].time=0,/visible review interval/],
    [r=>r.shots[0].b3_semantics.graphics[0].observations[0].time=.06,/complete visible relationship/],
  ];
  for(const [change,error] of cases){setReview(f,change);await assert.rejects(()=>verify(f),error);}
});

test('B3 limited capability cannot waive graphic inventory, event purpose or correct targeting',async t=>{
  const f=await fixture(t,'B3',p=>{connectorProject(p);p.reference_review.capability={mode:'limited',environment:'Synthetic test of a declared limited environment, not a production quality claim.',limitations:[{capability:'Editable artwork rendering',observed:'Synthetic derivative is flattened test media.',impact:'Detailed silhouette fidelity is unassessed by this protocol fixture.'}]};});
  setReview(f,r=>r.shots[0].checks.silhouette_design.status='unmet');assert.equal((await verify(f)).status,'best_effort_limited');
  for(const change of [r=>r.shots[0].checks.graphic_inventory.status='unmet',r=>r.shots[0].b3_semantics.events[0].status='unmet',r=>r.shots[0].b3_semantics.graphics[0].observed_target_id='unrelated']){
    setReview(f,change);await assert.rejects(()=>verify(f),/limited|semantic correctness|source\/target differs/);
  }
});

test('B3 an event ending at the shot boundary has no actual encoded result frame',async t=>{
  const f=await fixture(t,'B3',p=>{connectorProject(p);p.shots[0].b3_semantics.events[0].end=.4;});
  review(f);await assert.rejects(()=>verify(f),/actual encoded result frame/);
});

test('portable references verify their manifest locks; plans cover the entire submitted range without requiring a renderer',()=>{
  for(const style of ['B1','B2','B3']) {
    const inputs=referenceInputs(style);assert.ok(inputs.length>=(style==='B2'?5:6));assert.ok(inputs.every(f=>path.isAbsolute(f)&&fs.statSync(f).isFile()));
    const p=project(style),plan=planBStyleReference(p);assert.equal(plan.shots.length,2);assert.equal(plan.shots.at(-1).end_frame,24);
    assert.ok(plan.reference_ids.every(id=>!id.includes('native-portrait')), 'Legacy landscape plans retain their original sample set');
    const portrait=project(style);portraitProject(portrait);
    const portraitInputs=referenceInputs(style,portrait), portraitPlan=planBStyleReference(portrait);
    assert.equal(portraitInputs.length, inputs.length+3, 'Portrait fingerprints bind the approved manifest, video and encoded poster');
    assert.ok(inputs.every(f=>portraitInputs.includes(f)), 'Original landscape sources remain available for style fidelity');
    for (const extension of ['json','mp4','jpg']) assert.ok(portraitInputs.includes(path.join(ROOT,'assets',style.toLowerCase(),'portrait-approved-2026-11-13.'+extension)));
    assert.ok(portraitPlan.reference_ids.includes(style.toLowerCase()+'-native-portrait-2026-11-13'));
    p.shots[1].start=.5;assert.throws(()=>planBStyleReference(p),/gap or overlap/);
    p.shots[1].start=.4;p.shots[1].end=.7;assert.throws(()=>planBStyleReference(p),/tail/);
  }
  const p=project();delete p.reference_review;assert.equal(planBStyleReference(p).capability.mode,'sample_target');assert.equal(planBStyleReference(p).author_id,null);
  assert.deepEqual(referenceInputs('B4'),[]);assert.equal(planBStyleReference({style:'B4'}),null);
});

for(const style of ['B1','B2','B3'])test(`${style} binds native portrait plans and starts phone/shot review unknown`,async t=>{
  const f=await fixture(t,style,portraitProject),template=read(f.ledger.template_file);
  assert.equal(f.ledger.plan.portrait.preset,'b123-native-portrait-v1');
  assert.equal(f.ledger.plan.portrait.shots.length,2);
  const portraitId=style.toLowerCase()+'-native-portrait-2026-11-13';
  const acceptedPortrait=f.ledger.references.find(r=>r.id===portraitId);
  assert.equal(acceptedPortrait.role,'approved_native_portrait_effect');assert.equal(acceptedPortrait.duration,10);
  assert.equal(acceptedPortrait.has_audio,true);assert.equal(acceptedPortrait.required_comparison,true);
  assert.ok(template.baseline_comparisons.some(c=>c.reference_id===portraitId));
  setReview(f,r=>r.baseline_comparisons=r.baseline_comparisons.filter(c=>c.reference_id!==portraitId));
  await assert.rejects(()=>verify(f),/required available reference/);
  assert.equal(template.portrait_viewing.status,'unknown');assert.equal(template.portrait_viewing.real_device.checked,null);
  assert.deepEqual(template.portrait_viewing.viewed_ranges,[]);assert.deepEqual(template.portrait_viewing.observations,[]);
  for(const s of template.shots) {
    assert.deepEqual(Object.keys(s.portrait_checks),['native_composition','caption_readability','action_visibility','platform_safe_area']);
    assert.ok(Object.values(s.portrait_checks).every(c=>c.status==='unknown'&&c.observations.length===0));
  }
  review(f);const accepted=await verify(f);assert.deepEqual(accepted.portrait_viewing,read(f.reviewFile).portrait_viewing);assert.equal(accepted.user_acceptance,'not_inferred');
  f.p.shots[0].portrait.intent='Synthetic changed native composition after evidence extraction.';
  await assert.rejects(()=>verify(f),/stale evidence/);
});

test('portrait review rejects missing phone context, incorrect viewing, omitted scope and unobserved platform/action',async t=>{
  const f=await fixture(t,'B1',portraitProject);
  const cases=[
    [r=>delete r.portrait_viewing,/portrait phone-size playback/],
    [r=>r.portrait_viewing.status='unknown',/portrait phone-size playback/],
    [r=>r.portrait_viewing.display_width=1080,/portrait phone-size playback/],
    [r=>r.portrait_viewing.display_width=319,/portrait phone-size playback/],
    [r=>r.portrait_viewing.display_height=600,/portrait phone-size playback/],
    [r=>r.portrait_viewing.playback_speed=2,/portrait phone-size playback/],
    [r=>r.portrait_viewing.platform='',/portrait phone-size playback/],
    [r=>r.portrait_viewing.platform='checked',/portrait phone-size playback/],
    [r=>delete r.portrait_viewing.real_device,/real device/],
    [r=>r.portrait_viewing.real_device.checked='false',/real device/],
    [r=>r.portrait_viewing.real_device.limitation='',/simulated-device limitation/],
    [r=>r.portrait_viewing.real_device.limitation='OK',/simulated-device limitation/],
    [r=>delete r.portrait_viewing.viewed_ranges,/whole submitted playback/],
    [r=>r.portrait_viewing.viewed_ranges=[{start:0,end:.4}],/tail/],
    [r=>r.portrait_viewing.viewed_ranges=[{start:.1,end:.8}],/cover the whole/],
    [r=>r.portrait_viewing.observations=[],/concrete timed/],
    [r=>r.portrait_viewing.observations[0].evidence_ids=['shot-0-mid'],/unrelated evidence/],
    [r=>r.portrait_viewing.observations[0].detail='Pass',/concrete detail/],
    [r=>r.portrait_viewing.observations[0].time=1,/in-range time/],
    [r=>delete r.portrait_viewing.observations[0].aspect,/must identify/],
    [r=>r.portrait_viewing.observations=r.portrait_viewing.observations.filter(o=>o.aspect!=='platform_occlusion'),/explicitly observe/],
    [r=>r.portrait_viewing.observations=r.portrait_viewing.observations.filter(o=>o.aspect!=='action_contact'),/explicitly observe/],
  ];
  for(const [change,error] of cases){setReview(f,change);await assert.rejects(()=>verify(f),error);}
});

test('every portrait shot requires four non-waivable criteria and its own continuous encoded evidence',async t=>{
  const f=await fixture(t,'B2',p=>{portraitProject(p);p.reference_review.capability={mode:'limited',environment:'Synthetic flattened source fixture used for protocol coverage, not a quality claim.',limitations:[{capability:'Editable layered prop action',observed:'Synthetic source is a flattened engineering derivative.',impact:'Sample-level prop articulation is deliberately unassessed in this protocol fixture.'}]};});
  setReview(f,r=>r.shots[0].checks.semantic_motion_states.status='unmet');assert.equal((await verify(f)).status,'best_effort_limited');
  for(const criterion of ['native_composition','caption_readability','action_visibility','platform_safe_area']) {
    for(const status of ['unknown','fail','unmet']) {
      setReview(f,r=>r.shots[0].portrait_checks[criterion].status=status);
      await assert.rejects(()=>verify(f),/limited mode cannot waive/);
    }
    setReview(f,r=>delete r.shots[0].portrait_checks[criterion]);await assert.rejects(()=>verify(f),/each portrait shot/);
  }
  const cases=[
    [r=>delete r.shots[1].portrait_checks,/each portrait shot/],
    [r=>r.shots[1].portrait_checks.extra={status:'pass',observations:[]},/each portrait shot/],
    [r=>r.shots[0].portrait_checks.action_visibility.observations=[],/concrete timed/],
    [r=>r.shots[0].portrait_checks.action_visibility.observations[0].detail='Fine',/concrete detail/],
    [r=>r.shots[0].portrait_checks.action_visibility.observations[0].time=.7,/in-range time/],
    [r=>r.shots[0].portrait_checks.action_visibility.observations[0].evidence_ids=['shot-1-continuous'],/unrelated evidence/],
    [r=>r.shots[0].portrait_checks.action_visibility.observations[0].evidence_ids=['shot-0-mid'],/continuous/],
    [r=>r.shots[0].portrait_checks.action_visibility.observations[0].evidence_ids=['source-video'],/continuous/],
  ];
  for(const [change,error] of cases){setReview(f,change);await assert.rejects(()=>verify(f),error);}
});

for(const style of ['B1','B2','B3'])test(`${style} produces unknown review, bound full-shot evidence and protocol-only positive acceptance`,async t=>{
  const f=await fixture(t,style),template=read(f.ledger.template_file);
  assert.equal(f.ledger.status,'pending_independent_review');assert.equal(f.ledger.artifacts.length,8);
  assert.equal(template.full_playback.status,'unknown');assert.deepEqual(template.full_playback.viewed_ranges,[]);
  assert.equal('portrait' in f.ledger.plan,false);assert.equal('portrait_viewing' in template,false);assert.ok(template.shots.every(s=>!('portrait_checks' in s)));
  assert.ok(template.shots.every(s=>Object.values(s.checks).every(c=>c.status==='unknown'&&c.observations.length===0&&c.comparisons.length===0)));
  fs.copyFileSync(f.ledger.template_file,f.reviewFile);await assert.rejects(()=>verify(f),/independent reviewer|pending|unknown/);
  review(f);const a=await verify(f);assert.equal(a.status,'sample_target_review_passed');assert.equal(a.equivalence,'available_samples_reviewed');assert.equal(a.user_acceptance,'not_inferred');assert.equal(a.output_sha256,hash(f.file));
  if(style==='B2'||style==='B3') {
    setReview(f,r=>r.baseline_comparisons.pop());await assert.rejects(()=>verify(f),/required available reference/);
  }
  if(style==='B3') {
    setReview(f,r=>{r.shots[0].checks.sound.comparisons[0]={reference_id:'b3-accepted-dog-motion',start:0,end:.1,detail:'Synthetic deliberate attempt to compare audio to a silent excerpt.'};});await assert.rejects(()=>verify(f),/audible reference/);
  }
});

test('B2 has its own criteria; a sampled board cannot stand in for motion, staging or sound',async t=>{
  const f=await fixture(t,'B2');
  assert.deepEqual(f.ledger.plan.checks,['color_handdrawn_design','semantic_motion_states','contact_continuity','composition_progression','typography_captions','timing_pacing','sound']);
  assert.deepEqual(f.ledger.references.filter(r=>r.required_comparison).map(r=>r.id),['b2-colorful-sleep','b2-colorful-phone-weather']);
  const board=f.ledger.references.find(r=>r.id==='b2-approved-style-board');assert.equal(board.kind,'image');assert.equal(board.has_audio,false);assert.equal(board.required_comparison,false);
  const still={reference_id:board.id,start:null,end:null,detail:'Synthetic protocol comparison to the sampled appearance board; no motion or listening claim.'};
  setReview(f,r=>r.shots[0].checks.color_handdrawn_design.comparisons=[still]);assert.equal((await verify(f)).status,'sample_target_review_passed');
  for(const k of ['semantic_motion_states','contact_continuity','composition_progression']) {
    setReview(f,r=>r.shots[0].checks[k].comparisons=[still]);await assert.rejects(()=>verify(f),/requires a video reference/);
  }
  setReview(f,r=>r.shots[0].checks.sound.comparisons=[still]);await assert.rejects(()=>verify(f),/audible reference/);
  setReview(f,r=>{r.shots[0].checks.semantic_motion_states.status='unmet';});await assert.rejects(()=>verify(f),/not eligible/);
  setReview(f,r=>{delete r.shots[0].checks.color_handdrawn_design;r.shots[0].checks.television_finish={status:'pass',observations:[],comparisons:[]};});await assert.rejects(()=>verify(f),/every style-specific/);
});

test('a portable B2 installation requires both full sources and verifies the board identity and media locks',async t=>{
  const dir=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'b2-reference-package-test-')));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const scripts=path.join(dir,'scripts'),assets=path.join(dir,'assets','b2');fs.mkdirSync(scripts,{recursive:true});fs.mkdirSync(path.dirname(assets),{recursive:true});
  const moduleFile=path.join(scripts,'b-style-reference-review.mjs');
  for(const file of ['b-style-reference-review.mjs','b-style-portrait.mjs','b3-semantic-motion.mjs','b-style-motion-geometry.mjs','b3-graphics.mjs'])fs.copyFileSync(path.join(ROOT,'scripts',file),path.join(scripts,file));
  fs.cpSync(path.join(ROOT,'assets/b2'),assets,{recursive:true});
  const portable=await import(pathToFileURL(moduleFile).href),pubFile=path.join(assets,'public-showcase.json'),boardFile=path.join(assets,'approved-style-board.json'),originalPub=fs.readFileSync(pubFile),originalBoard=fs.readFileSync(boardFile);
  assert.equal(portable.referenceInputs('B2').length,5);
  fs.unlinkSync(pubFile);assert.throws(()=>portable.referenceInputs('B2'),/file missing/);fs.writeFileSync(pubFile,originalPub);
  let pub=read(pubFile);pub.evidence.pop();write(pubFile,pub);assert.throws(()=>portable.referenceInputs('B2'),/both B2 public full samples/);fs.writeFileSync(pubFile,originalPub);
  pub=read(pubFile);pub.evidence[1].id='invented-replacement';write(pubFile,pub);assert.throws(()=>portable.referenceInputs('B2'),/missing B2 public full sample/);fs.writeFileSync(pubFile,originalPub);
  let board=read(boardFile);board.source_sha256='0'.repeat(64);write(boardFile,board);assert.throws(()=>portable.referenceInputs('B2'),/locked accepted phone/);fs.writeFileSync(boardFile,originalBoard);
  const boardMedia=path.join(assets,'approved-style-board.jpg');fs.appendFileSync(boardMedia,'deliberate stale board');assert.throws(()=>portable.referenceInputs('B2'),/reference hash mismatch/);fs.copyFileSync(path.join(ROOT,'assets/b2/approved-style-board.jpg'),boardMedia);
  pub=read(pubFile);pub.evidence[0].path='../../../escape.mp4';write(pubFile,pub);assert.throws(()=>portable.referenceInputs('B2'),/escapes the installed/);fs.writeFileSync(pubFile,originalPub);
  fs.appendFileSync(path.join(assets,read(pubFile).evidence[0].path),'deliberate stale full sample');assert.throws(()=>portable.referenceInputs('B2'),/reference hash mismatch/);
});

test('unknown, failed, blank, unrelated, incomplete and non-independent records cannot pass',async t=>{
  const f=await fixture(t);
  const cases=[
    [r=>r.reviewer.id=f.p.reference_review.author_id,/independent/],
    [r=>r.reviewer.independent=false,/independent/],
    [r=>r.shots[0].checks.semantic_acting.status='fail',/unknown, failed/],
    [r=>r.shots[0].checks.semantic_acting.status='unknown',/unknown, failed/],
    [r=>r.shots[0].checks.semantic_acting.status='unmet',/unknown, failed/],
    [r=>r.shots[0].checks.semantic_acting.observations=[],/concrete timed/],
    [r=>r.shots[0].checks.semantic_acting.observations[0].detail='通过',/concrete detail/],
    [r=>r.shots[0].checks.semantic_acting.observations[0].evidence_ids=['shot-1-continuous'],/unrelated evidence/],
    [r=>r.shots[0].checks.semantic_acting.observations[0].evidence_ids=['shot-0-mid'],/continuous/],
    [r=>r.shots[0].checks.semantic_acting.observations[0].time=.7,/in-range time/],
    [r=>delete r.shots[0].checks.contact_continuity,/every style-specific/],
    [r=>r.shots.pop(),/every submitted shot/],
    [r=>r.shots.push(r.shots[0]),/every submitted shot/],
    [r=>r.full_playback.viewed_ranges=[{start:0,end:.4}],/tail/],
    [r=>r.full_playback.observations[0].evidence_ids=['shot-0-mid'],/continuous/],
    [r=>r.baseline_comparisons=[],/reference playback/],
    [r=>r.baseline_comparisons[0].end=0,/interval/],
    [r=>r.shots[0].checks.semantic_acting.comparisons[0].reference_id='invented-reference',/available reference/],
    [r=>r.shots[0].checks.semantic_acting.comparisons[0].end=999,/video interval/],
    [r=>r.blocking_issues=['A hand never touches the object'],/blocking/],
    [r=>r.capability.mode='limited',/capability, video/],
  ];
  for(const [change,error] of cases){setReview(f,change);await assert.rejects(()=>verify(f),error);}
  setReview(f,r=>{const c=r.shots[0].checks.semantic_acting.comparisons[0];c.reference_id='b1-ryan-contact-sheet';c.start=null;c.end=null;});await assert.rejects(()=>verify(f),/requires a video reference/);
  setReview(f,r=>{r.shots[0].checks.sound.comparisons[0]={reference_id:'b1-ryan-contact-sheet',start:null,end:null,detail:'Synthetic sound comparison to an inaudible sheet is deliberately invalid.'};});await assert.rejects(()=>verify(f),/audible reference/);
});

for(const style of ['B2','B3'])test(`${style} limited capability records disclose unmet fidelity without waiving captions, timing or sound`,async t=>{
  const f=await fixture(t,style,p=>{p.reference_review.capability={mode:'limited',environment:'Synthetic local-only fixture with no editable prop animation controls.',limitations:[{capability:'Layered prop-state animation',observed:'Synthetic probe exposes a flattened prop with no editable state controls.',impact:'The intended prop-state progression cannot reach the available sample quality.'}]};});
  setReview(f,r=>{r.shots[0].checks[style==='B2'?'semantic_motion_states':'semantic_action'].status='unmet';});
  const a=await verify(f);assert.equal(a.status,'best_effort_limited');assert.equal(a.equivalence,'not_sample_equivalent');assert.equal(a.unmet_effect_criteria.length,1);assert.equal(a.user_acceptance,'not_inferred');
  for(const k of ['typography_captions','timing_pacing','sound']) {setReview(f,r=>r.shots[0].checks[k].status='unmet');await assert.rejects(()=>verify(f),/not eligible/);}
  f.p.reference_review.capability.limitations=[];await assert.rejects(()=>verify(f),/observed capability limitations/);
  f.p.reference_review.capability.limitations=[{capability:'Other AI',observed:'ok',impact:'good'}];await assert.rejects(()=>verify(f),/observed test\/result/);
});

test('missing author may render evidence but cannot accept; actual media metadata and directory safety are enforced',async t=>{
  const f=await fixture(t,'B1',p=>delete p.reference_review);review(f);
  await assert.rejects(()=>verify(f),/actual reference_review.author_id/);
  await assert.rejects(()=>buildBStyleReferenceEvidence(f.p,{...f.args}),/fresh empty/);
  const out=path.join(f.dir,'wrong');fs.mkdirSync(out);const p=project();p.width=320;
  await assert.rejects(()=>buildBStyleReferenceEvidence(p,{...f.args,out}),/dimensions\/fps/);
  p.width=160;p.fps=24;await assert.rejects(()=>buildBStyleReferenceEvidence(p,{...f.args,out}),/dimensions\/fps/);p.fps=30;
  const linked=path.join(f.dir,'linked.mp4');fs.symlinkSync(f.file,linked);
  await assert.rejects(()=>buildBStyleReferenceEvidence(project(),{...f.args,file:linked,out}),/symlink/);
  p.width=160;p.fingerprint='a different current fingerprint';await assert.rejects(()=>buildBStyleReferenceEvidence(p,{...f.args,out}),/matching project fingerprint/);
});

for(const style of ['B1','B2'])test(`${style} stale project, plan, source and rewritten artifact manifests cannot be laundered into acceptance`,async t=>{
  const f=await fixture(t,style);review(f);
  await assert.rejects(()=>verifyBStyleReferenceReview(f.p,{file:f.file,evidenceDir:f.out,reviewFile:f.reviewFile,projectFingerprint:'new project fingerprint'}),/stale evidence/);
  f.p.captions[0].text='Changed after extraction';await assert.rejects(()=>verify(f),/stale evidence/);f.p.captions[0].text='Synthetic protocol fixture only.';
  const ledgerFile=f.ledger.ledger_file,originalLedger=fs.readFileSync(ledgerFile),originalReview=fs.readFileSync(f.reviewFile);
  function rebind(ledger) {write(ledgerFile,ledger);const r=read(f.reviewFile);r.evidence_sha256=hash(ledgerFile);write(f.reviewFile,r);}
  let l=read(ledgerFile);l.artifacts=l.artifacts.filter(a=>a.shot!=='shot-1');rebind(l);await assert.rejects(()=>verify(f),/missing or extra/);
  fs.writeFileSync(ledgerFile,originalLedger);fs.writeFileSync(f.reviewFile,originalReview);
  l=read(ledgerFile);l.artifacts[0].frame_index=5;rebind(l);await assert.rejects(()=>verify(f),/descriptors/);
  fs.writeFileSync(ledgerFile,originalLedger);fs.writeFileSync(f.reviewFile,originalReview);
  l=read(ledgerFile);const png=l.artifacts.find(a=>a.id==='shot-0-start'),other=l.artifacts.find(a=>a.id==='shot-1-end'),pngFile=path.join(f.out,png.file),originalPng=fs.readFileSync(pngFile);fs.copyFileSync(path.join(f.out,other.file),pngFile);png.sha256=hash(pngFile);rebind(l);await assert.rejects(()=>verify(f),/not extracted from the current actual video/);
  fs.writeFileSync(pngFile,originalPng);fs.writeFileSync(ledgerFile,originalLedger);fs.writeFileSync(f.reviewFile,originalReview);
  l=read(ledgerFile);const clip=l.artifacts.find(a=>a.id==='shot-0-continuous'),otherClip=l.artifacts.find(a=>a.id==='shot-1-continuous');fs.copyFileSync(path.join(f.out,otherClip.file),path.join(f.out,clip.file));clip.sha256=hash(path.join(f.out,clip.file));rebind(l);await assert.rejects(()=>verify(f),/not extracted from the current actual video/);
  fs.appendFileSync(f.file,'stale trailing payload');await assert.rejects(()=>verify(f),/stale evidence/);
});

test('submitted input hashes stay bound while future-only project-file edits preserve the scoped contract',async t=>{
  let projectFile,inputFile;
  const f=await fixture(t,'B1',p=>{
    // fixture supplies no base; files are assigned below before rebuilding.
  });
  projectFile=path.join(f.dir,'project.json');inputFile=path.join(f.dir,'input.txt');write(projectFile,{future:'original'});fs.writeFileSync(inputFile,'current submitted input');
  f.p.file=projectFile;f.p.inputs=[{path:inputFile,sha256:hash(inputFile)}];
  fs.rmSync(f.out,{recursive:true});fs.mkdirSync(f.out);f.ledger=await buildBStyleReferenceEvidence(f.p,f.args);review(f);
  write(projectFile,{future:'edited without changing the caller scoped fingerprint'});assert.equal((await verify(f)).status,'sample_target_review_passed');
  fs.writeFileSync(inputFile,'changed submitted input');await assert.rejects(()=>verify(f),/current project input changed/);
});

test('concat timestamp rounding retains actual frame evidence while true wrong fps is rejected',async t=>{
  const dir=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'b-style-concat-test-')));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const source=path.join(ROOT,'assets/b1/approved-2026-10-23.mp4'),parts=[];
  for(const [i,n] of [5,6].entries()) {
    const part=path.join(dir,'part-'+i+'.mp4');parts.push(part);
    media(['-ss',String(4+i*.4),'-i',source,'-an','-vf','scale=160:90','-r','12','-frames:v',String(n),'-c:v','libx264','-threads:v','1','-pix_fmt','yuv420p','-y',part]);
  }
  const list=path.join(dir,'concat.txt'),file=path.join(dir,'video.mp4'),out=path.join(dir,'evidence');fs.writeFileSync(list,parts.map(p=>`file '${p}'`).join('\n')+'\n');fs.mkdirSync(out);
  media(['-f','concat','-safe','0','-i',list,'-ss','4','-i',source,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-t',String(11/12),'-y',file]);
  const p=project();Object.assign(p,{fps:12,duration:.85,rangeEnd:.85,shots:[{start:0,end:.4},{start:.4,end:.85}]});
  const ledger=await buildBStyleReferenceEvidence(p,{file,out,projectFingerprint:'synthetic-concat-fingerprint'});
  assert.equal(ledger.metadata.fps,12);assert.equal(ledger.metadata.frames,11);assert.ok(ledger.metadata.max_step_error<=.0021);
  assert.ok(ledger.artifacts.filter(a=>a.type==='png').every(a=>Number.isFinite(a.source_time)));
  const f={p,file,out,ledger,reviewFile:path.join(dir,'review.json'),args:{projectFingerprint:'synthetic-concat-fingerprint'}};review(f);assert.equal((await verify(f)).status,'sample_target_review_passed');
});

test('bounded timestamp probing covers a complete available sample across ten-second boundaries',async t=>{
  const dir=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'b-style-long-probe-test-')));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const file=path.join(ROOT,'assets/b1/approved-2026-10-23.mp4'),out=path.join(dir,'evidence');fs.mkdirSync(out);
  const p=project();Object.assign(p,{width:1280,height:720,duration:21.3,rangeEnd:21.3,shots:[{start:0,end:21.3}]});
  const ledger=await buildBStyleReferenceEvidence(p,{file,out,projectFingerprint:'synthetic-long-probe-fingerprint'});
  assert.equal(ledger.metadata.frames,639);assert.equal(ledger.artifacts.find(a=>a.id==='shot-0-end').frame_index,638);assert.ok(ledger.metadata.max_step_error<.0021);
});

// A clean installed copy must enforce portrait locks independently of the
// original workspace, while leaving its legacy landscape call usable.
test('portable portrait references cannot be omitted, substituted or accepted through stale binding',async t=>{
  const dir=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'b2-portrait-reference-test-')));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const scripts=path.join(dir,'scripts'),assets=path.join(dir,'assets/b2');fs.mkdirSync(scripts,{recursive:true});fs.mkdirSync(path.dirname(assets),{recursive:true});
  for(const file of ['b-style-reference-review.mjs','b-style-portrait.mjs','b3-semantic-motion.mjs','b-style-motion-geometry.mjs','b3-graphics.mjs'])fs.copyFileSync(path.join(ROOT,'scripts',file),path.join(scripts,file));
  fs.cpSync(path.join(ROOT,'assets/b2'),assets,{recursive:true});
  const portable=await import(pathToFileURL(path.join(scripts,'b-style-reference-review.mjs')).href),manifest=path.join(assets,'portrait-approved-2026-11-13.json'),original=fs.readFileSync(manifest),p=project('B2');portraitProject(p);
  const inputs=portable.referenceInputs('B2',p),fingerprint=()=>inputs.map(f=>[f,hash(f)]);
  assert.equal(inputs.length,8);assert.equal(portable.referenceInputs('B2').length,5);
  const before=fingerprint();let data=read(manifest);data.limitations.push('Synthetic changed provenance annotation; not a real new user approval.');write(manifest,data);
  assert.notDeepEqual(fingerprint(),before,'Accepted-sample metadata participates in the current content fingerprint');fs.writeFileSync(manifest,original);
  fs.unlinkSync(manifest);assert.throws(()=>portable.referenceInputs('B2',p),/file missing/);assert.equal(portable.referenceInputs('B2').length,5);fs.writeFileSync(manifest,original);
  for(const change of [d=>d.style='B3',d=>d.baseline_id='invented-portrait']) {data=read(manifest);change(data);write(manifest,data);assert.throws(()=>portable.referenceInputs('B2',p),/portrait identity/);fs.writeFileSync(manifest,original);}
  data=read(manifest);data.video.duration=11;write(manifest,data);assert.throws(()=>portable.referenceInputs('B2',p),/exact ten-second/);fs.writeFileSync(manifest,original);
  data=read(manifest);data.user_acceptance.status='pending';write(manifest,data);assert.throws(()=>portable.referenceInputs('B2',p),/user acceptance scope/);fs.writeFileSync(manifest,original);
  for(const extension of ['jpg','mp4']) {
    const file=path.join(assets,'portrait-approved-2026-11-13.'+extension),content=fs.readFileSync(file);
    fs.appendFileSync(file,'deliberately stale portrait sample');assert.throws(()=>portable.referenceInputs('B2',p),/reference hash mismatch/);fs.writeFileSync(file,content);
  }
});
