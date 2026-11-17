import test, {before,after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildB7Evidence,checkB7Review,validateB7Plan} from '../scripts/b7-review.mjs';

// Synthetic media/claims test the protocol, never the quality of an accepted film.
let tmp,master;
const write=(f,v)=>fs.writeFileSync(f,JSON.stringify(v,null,2)+'\n');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const meta={duration:1,fps:10,width:160,height:90,audio:true};
const script=fileURLToPath(new URL('../scripts/b7-review.mjs',import.meta.url));
before(()=>{
  tmp=fs.mkdtempSync(path.join(os.tmpdir(),'b7-review-test-'));master=path.join(tmp,'synthetic.mp4');
  const r=spawnSync('ffmpeg',['-v','error','-nostdin','-f','lavfi','-i','testsrc2=size=160x90:rate=10:duration=1','-f','lavfi','-i','sine=frequency=220:sample_rate=48000:duration=1','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest',master],{encoding:'utf8'});
  assert.equal(r.status,0,r.error?.message||r.stderr);
});
after(()=>fs.rmSync(tmp,{recursive:true,force:true}));
function plan(){return {schema:1,style:'B7',author_id:'synthetic-test',duration:1,require_user_acceptance:false,narration:'A hand presses. A lamp glows.',beats:[
  {id:'press',start:0,end:.5,intent:'Press the switch',actor_object:'Hand/switch',before:'Off',after:'Switch pressed',cue:{text:'A hand presses.',start:.01,end:.49},anticipation:[0,.05],trigger:.1,response:[.1,.3],settle:.4,principal_action:[[.01,.45]],sfx:[],no_sfx_reason:'Synthetic protocol fixture has no contact Foley'},
  {id:'light',start:.5,end:1,intent:'Show the consequence',actor_object:'Actor/lamp',before:'Lamp dark',after:'Lamp lit and actor reacts',cue:{text:'A lamp glows.',start:.51,end:.99},anticipation:[.5,.55],trigger:.6,response:[.6,.8],settle:.9,principal_action:[[.51,.95]],sfx:[],no_sfx_reason:'Synthetic protocol fixture has no contact Foley'}
],captions:[{id:'c1',start:.01,end:.49,text:'A hand presses.',drawn_width:90,safe_width:140},{id:'c2',start:.51,end:.99,text:'A lamp glows.',drawn_width:85,safe_width:140}],assets:[{id:'renderer',path:'scene.txt',role:'Synthetic source fixture'}],audio_resources:[{id:'tone',kind:'ambience',provenance:'Self-made sine test signal; no actual speech/performance claim'}]};}
function fixture(edit){const dir=fs.mkdtempSync(path.join(tmp,'case-')),video=path.join(dir,'final.mp4'),planFile=path.join(dir,'plan.json'),referenceManifest=path.join(dir,'reference/reference-manifest.json');fs.mkdirSync(path.dirname(referenceManifest));fs.copyFileSync(master,video);fs.writeFileSync(path.join(dir,'scene.txt'),'synthetic production input');fs.writeFileSync(path.join(dir,'reference/board.txt'),'synthetic reference identity');write(referenceManifest,{schema_version:1,style:'B7',pack_version:'test-only-v1'});const p=plan();edit?.(p);write(planFile,p);const q=buildB7Evidence({video,plan:planFile,out:path.join(dir,'qa'),referenceManifest});return {dir,video,planFile,referenceManifest,evidence:q.evidence_file,review:q.review_file,result:q};}
function recordedPass(f){const e=read(f.evidence),r=read(f.review);r.reviewer={id:'synthetic-test-only',method:'Protocol fixture, not a quality review',independent:false,limitations:'No aesthetic, real narration, human listening or production approval is claimed.'};const observation={time:.2,detail:'Synthetic test assertion only; this is not a real media-quality finding.',evidence_ids:['final-video',...e.coverage.beat_ids,...e.coverage.caption_ids,...e.coverage.audio_ids]};for(const k of ['full_playback','full_listening'])r[k]={status:'pass',speed:1,ranges:[[0,1]],observations:[observation]};for(const k of Object.keys(r.checks))r.checks[k]={status:'pass',observations:[observation]};r.audio_rights=r.audio_rights.map(a=>({...a,status:'cleared',source:'Locally generated sine fixture',license_or_permission:'Self-authored protocol test',attribution:'Not required: self-authored',reason:'No third-party recording'}));write(f.review,r);return r;}
function changeReview(f,edit){const r=read(f.review);edit(r);write(f.review,r);}

const portraitMeta={...meta,width:1080,height:1920,fps:24};
function portraitPlan(){
  const p=plan();
  p.portrait_layout={native_recomposition:true,recomposition_evidence:'Synthetic declaration of separately composed portrait staging, not a media-quality claim.',logical_canvas:{width:180,height:320},integer_scale:6,resampling:'nearest-neighbor',caption_safe_area:{left:120,top:1450,right:960,bottom:1830},caption_measurement:{font:'Synthetic fixture font declaration; no real glyph inspection claimed.',method:'Per-caption actual-font glyph/bitmap bounds including shadow, expressed in output pixels.',includes_shadow:true},required_action_regions:p.beats.map(b=>({beat_id:b.id,bounds:{left:120,top:120,right:960,bottom:1380}}))};
  p.captions=p.captions.map((c,i)=>({...c,drawn_width:i?510:660,safe_width:702,line_count:1,bounds:{left:i?285:210,right:i?795:870,top:1590,bottom:1662}}));
  return p;
}

test('9:16 accepts measured captions within 65% of probed width; earlier 81% strips fail',()=>{
  const p=portraitPlan();assert.doesNotThrow(()=>validateB7Plan(p,portraitMeta));
  const c=p.captions[0];c.drawn_width=portraitMeta.width*.65;c.bounds={...c.bounds,left:189,right:891};
  assert.doesNotThrow(()=>validateB7Plan(p,portraitMeta),'The inclusive 65% boundary remains usable');
  c.drawn_width=portraitMeta.width*.81;c.safe_width=1000;c.bounds={...c.bounds,left:102.6,right:977.4};
  assert.throws(()=>validateB7Plan(p,portraitMeta),/65% of the actual video width/);
});
test('portrait caption width is a measured language-independent limit, not a word-count rule',()=>{
  const p=portraitPlan();p.captions[0].text='你按下快进按钮。';p.captions[1].text='灯亮了。';p.narration='你按下快进按钮。灯亮了。';
  assert.doesNotThrow(()=>validateB7Plan(p,portraitMeta));
  p.captions[0].drawn_width=703;p.captions[0].safe_width=703;p.captions[0].bounds.left=188.5;p.captions[0].bounds.right=891.5;
  assert.throws(()=>validateB7Plan(p,portraitMeta),/65%/);
});
test('portrait safe_width cannot expand beyond 65% even inside a full-width declared safe area',()=>{
  const p=portraitPlan();p.portrait_layout.caption_safe_area={left:0,top:1450,right:1080,bottom:1830};
  assert.doesNotThrow(()=>validateB7Plan(p,portraitMeta),'The centered 660px measured caption is within the 702px limit');
  p.captions[0].safe_width=1000;
  assert.throws(()=>validateB7Plan(p,portraitMeta),/recorded safe_width exceeds 65%/);
});
test('portrait captions retain both side margins and stay centered on the logical pixel grid',()=>{
  const edge=portraitPlan();edge.portrait_layout.caption_safe_area={left:0,top:1450,right:1080,bottom:1830};
  edge.captions[0].drawn_width=100;edge.captions[0].bounds={left:10,right:110,top:1590,bottom:1662};
  assert.throws(()=>validateB7Plan(edge,portraitMeta),/17.5% measured whitespace/,'Narrow width does not excuse a caption against the frame edge');
  const biased=portraitPlan();biased.captions[0].drawn_width=100;biased.captions[0].bounds={left:300,right:400,top:1590,bottom:1662};
  assert.throws(()=>validateB7Plan(biased,portraitMeta),/centered within half a logical pixel/,'Both safe margins alone do not establish centering');
  const rounded=portraitPlan();rounded.captions[0].bounds.left+=3;rounded.captions[0].bounds.right+=3;
  assert.doesNotThrow(()=>validateB7Plan(rounded,portraitMeta),'A half-logical-pixel rounding offset is allowed at 6x scaling');
  rounded.captions[0].bounds.left+=.001;rounded.captions[0].bounds.right+=.001;
  assert.throws(()=>validateB7Plan(rounded,portraitMeta),/centered within half a logical pixel/);
});
test('portrait detection uses actual media dimensions and preserves legacy 16:9 plans',()=>{
  const p=plan();p.width=90;p.height=160;p.portrait_layout={native_recomposition:false};
  p.captions[0].drawn_width=145;p.captions[0].safe_width=150;
  assert.doesNotThrow(()=>validateB7Plan(p,meta),'Landscape keeps its existing recorded-safe-width rule');
  const q=plan();q.width=1920;q.height=1080;
  assert.throws(()=>validateB7Plan(q,portraitMeta),/native portrait recomposition/,'Landscape claims cannot hide actual portrait dimensions');
  assert.throws(()=>validateB7Plan(plan(),{...meta,width:100,height:100}),/16:9 or native 9:16/);
});
test('portrait layout declares native recomposition, actual-font measurement and exact pixel scaling',()=>{
  const changes=[
    [p=>delete p.portrait_layout,/native portrait recomposition/],
    [p=>p.portrait_layout.native_recomposition=false,/native portrait recomposition/],
    [p=>p.portrait_layout.recomposition_evidence='',/recomposition_evidence/],
    [p=>p.portrait_layout.integer_scale=5.5,/exact integer_scale/],
    [p=>p.portrait_layout.logical_canvas.width=181,/exact integer_scale/],
    [p=>p.portrait_layout.resampling='bilinear',/nearest-neighbor/],
    [p=>p.portrait_layout.caption_measurement.font='',/actual project font/],
    [p=>p.portrait_layout.caption_measurement.method='',/measurement method/],
    [p=>p.portrait_layout.caption_measurement.includes_shadow=false,/including every caption shadow/],
  ];
  for(const [change,error] of changes){const p=portraitPlan();change(p);assert.throws(()=>validateB7Plan(p,portraitMeta),error);}
  assert.throws(()=>validateB7Plan(portraitPlan(),{...portraitMeta,width:540,height:960}),/exact integer_scale/,'Output dimensions are checked against actual probed dimensions');
});
test('portrait caption bounds prove only recorded geometry and must stay in the declared safe area',()=>{
  const changes=[
    [p=>delete p.captions[0].bounds,/measured left\/top\/right\/bottom/],
    [p=>p.captions[0].line_count=2,/single-line line_count/],
    [p=>p.captions[0].bounds.left=200,/drawn_width differs/],
    [p=>{p.captions[0].bounds.top=1430;p.captions[0].bounds.bottom=1502;},/outside its declared caption safe area/],
    [p=>{p.portrait_layout.caption_safe_area.left=200;p.portrait_layout.caption_safe_area.right=880;},/outside its declared caption safe area/],
    [p=>p.portrait_layout.caption_safe_area.bottom=2000,/in-frame measured/],
  ];
  for(const [change,error] of changes){const p=portraitPlan();change(p);assert.throws(()=>validateB7Plan(p,portraitMeta),error);}
});
test('portrait captions cannot cover declared necessary actions during overlapping beats',()=>{
  const p=portraitPlan();p.portrait_layout.required_action_regions[0].bounds.bottom=1600;
  assert.throws(()=>validateB7Plan(p,portraitMeta),/overlaps a declared required action in beat press/);
  const missing=portraitPlan();missing.portrait_layout.required_action_regions.pop();
  assert.throws(()=>validateB7Plan(missing,portraitMeta),/action regions omit beat light/);
  const unknown=portraitPlan();unknown.portrait_layout.required_action_regions[0].beat_id='invented';
  assert.throws(()=>validateB7Plan(unknown,portraitMeta),/unknown beat_id/);
  const separate=portraitPlan();separate.portrait_layout.required_action_regions[1].bounds={...separate.captions[0].bounds};
  // Move the later caption vertically within the safe area: the earlier caption's
  // rectangle overlaps only a later beat, so it cannot occlude that action.
  separate.captions[1].drawn_width=50;separate.captions[1].bounds={left:515,top:1740,right:565,bottom:1812};
  assert.doesNotThrow(()=>validateB7Plan(separate,portraitMeta));
});

test('init decodes real media and leaves creative/user decisions pending',()=>{
  const f=fixture(),e=read(f.evidence),r=read(f.review);
  assert.equal(f.result.technical_status,'pass');assert.equal(f.result.delivery_ready,false);
  assert.equal(e.video.sha256,sha(f.video));assert.equal(e.video.duration,1);assert.equal(e.video.audio,true);assert.equal(e.reference.version,'test-only-v1');
  assert.equal(r.user_acceptance.status,'pending');assert.ok(Object.values(r.checks).every(v=>v.status==='pending'));
  assert.throws(()=>checkB7Review(f),/reviewer identity/);
});
test('complete recorded review passes without inventing optional user acceptance',()=>{
  const f=fixture();recordedPass(f);const result=checkB7Review(f);
  assert.equal(result.delivery_ready,true);assert.equal(result.creative_review_status,'recorded_pass');assert.equal(result.user_acceptance,'pending');assert.equal(result.user_acceptance_required,false);assert.ok(result.limits.some(s=>s.includes('not authenticated')));
});
test('technical pass cannot promote an unreviewed creative result',()=>{
  const f=fixture();recordedPass(f);changeReview(f,r=>r.checks.principal_motion={status:'pending',observations:[]});
  assert.equal(read(f.evidence).technical.status,'pass');assert.throws(()=>checkB7Review(f),/principal_motion remains pending/);
});
test('a pass label with empty observations does not count as inspection',()=>{
  const f=fixture();recordedPass(f);changeReview(f,r=>r.checks.geometry_contact.observations=[]);
  assert.throws(()=>checkB7Review(f),/geometry_contact needs concrete observations/);
});
test('a distant beat cannot disappear from the creative evidence',()=>{
  const f=fixture();recordedPass(f);changeReview(f,r=>r.checks.principal_motion.observations[0].evidence_ids=['press']);
  assert.throws(()=>checkB7Review(f),/omits beat light/);
});
test('every semantic caption needs observed evidence, not just full text equality',()=>{
  const f=fixture();recordedPass(f);changeReview(f,r=>r.checks.captions_semantics_sync.observations[0].evidence_ids=['c1']);
  assert.throws(()=>checkB7Review(f),/caption semantic review omits c2/);
});
test('partial or accelerated review cannot claim a whole-film normal-speed watch',()=>{
  const f=fixture();recordedPass(f);changeReview(f,r=>r.full_playback.ranges=[[0,.4],[.6,1]]);
  assert.throws(()=>checkB7Review(f),/omits part/);
  recordedPass(f);changeReview(f,r=>r.full_listening.speed=2);assert.throws(()=>checkB7Review(f),/not 1x/);
});
test('a changed video invalidates previously recorded approval',()=>{
  const f=fixture();recordedPass(f);fs.appendFileSync(f.video,Buffer.from('changed'));
  assert.throws(()=>checkB7Review(f),/stale: video, plan, reference or asset changed/);
});
test('changed production inputs and a changed reference invalidate review',()=>{
  const f=fixture();recordedPass(f);fs.appendFileSync(path.join(f.dir,'scene.txt'),'changed');assert.throws(()=>checkB7Review(f),/asset changed/);
  const g=fixture();recordedPass(g);fs.writeFileSync(path.join(g.dir,'reference/new-board.txt'),'new reference');assert.throws(()=>checkB7Review(g),/reference files added or removed/);
  const h=fixture();recordedPass(h);fs.writeFileSync(path.join(h.dir,'reference/board.txt'),'changed');assert.throws(()=>checkB7Review(h),/asset changed/);
});
test('a plan change invalidates old reviews and init never overwrites them',()=>{
  const f=fixture();recordedPass(f);const p=read(f.planFile);p.beats[0].intent='Changed';write(f.planFile,p);assert.throws(()=>checkB7Review(f),/stale/);
  assert.throws(()=>buildB7Evidence({video:f.video,plan:f.planFile,out:path.dirname(f.evidence),referenceManifest:f.referenceManifest}),/new\/empty/);
});
test('missing beats and mismatched/overlapping captions are rejected before review',()=>{
  const p=plan();p.beats.pop();assert.throws(()=>validateB7Plan(p,meta),/whole actual film/);
  const c=plan();c.captions[1].text='A wrong ending.';assert.throws(()=>validateB7Plan(c,meta),/omit, reorder or duplicate/);
  const d=plan();d.captions[1].start=.4;assert.throws(()=>validateB7Plan(d,meta),/overlap/);
  const w=plan();w.captions[0].drawn_width=150;assert.throws(()=>validateB7Plan(w,meta),/safe width/);
});
test('contact consequences and Foley must share a real event trigger/resource',()=>{
  const p=plan();p.beats[0].response=[.08,.3];assert.throws(()=>validateB7Plan(p,meta),/response before trigger/);
  const s=plan();s.beats[0].sfx=[{id:'click',event_id:'press',resource_id:'foley',purpose:'Contact',offset:0,time:.2}];assert.throws(()=>validateB7Plan(s,meta),/derive its time/);
  s.beats[0].sfx[0].time=.1;assert.throws(()=>validateB7Plan(s,meta),/SFX resource is missing/);
});
test('cutting to another beat does not reset the 2.5 second principal inactivity timer',()=>{
  const p=plan();p.duration=6;p.beats[0].end=3;p.beats[0].principal_action=[[0,.1]];p.beats[1]={...p.beats[1],start:3,end:6,cue:{text:'A lamp glows.',start:3,end:5.9},anticipation:[3,3.1],trigger:3.2,response:[3.2,3.8],settle:4,principal_action:[[3.2,6]]};p.captions[1]={...p.captions[1],start:3,end:5.9};
  assert.throws(()=>validateB7Plan(p,{...meta,duration:6}),/inactivity exceeds 2.5 seconds across beat/);
});
test('2–3 second completed ending hold is narrow, terminal and explicitly approved',()=>{
  const p=plan();p.duration=4;p.beats=p.beats.slice(0,1);const b=p.beats[0];b.end=4;b.principal_action=[[0,1.2]];b.reflective_hold={start:1.2,end:4,reason:'Approved intentional quiet ending',approval:{status:'approved',by:'fixture approving party',evidence:'Synthetic test-only decision'}};
  assert.doesNotThrow(()=>validateB7Plan(p,{...meta,duration:4}));
  const noApproval=structuredClone(p);noApproval.beats[0].reflective_hold.approval.evidence='';assert.throws(()=>validateB7Plan(noApproval,{...meta,duration:4}),/explicitly justified approved terminal/);
  const noReason=structuredClone(p);noReason.beats[0].reflective_hold.reason='';assert.throws(()=>validateB7Plan(noReason,{...meta,duration:4}),/explicitly justified approved terminal/);
  delete b.reflective_hold;assert.throws(()=>validateB7Plan(p,{...meta,duration:4}),/inactivity exceeds 2.5 seconds at the film end/);
});
test('uncleared or duplicate audio rights block delivery after creative review',()=>{
  const f=fixture();recordedPass(f);changeReview(f,r=>r.audio_rights[0].status='pending');assert.throws(()=>checkB7Review(f),/rights remain uncleared/);
  recordedPass(f);changeReview(f,r=>r.audio_rights.push({...r.audio_rights[0]}));assert.throws(()=>checkB7Review(f),/missing or duplicated/);
});
test('user approval is required only when agreed, and rejection always blocks',()=>{
  const f=fixture(p=>p.require_user_acceptance=true);recordedPass(f);assert.throws(()=>checkB7Review(f),/project requires user acceptance/);
  changeReview(f,r=>r.user_acceptance={...r.user_acceptance,status:'accepted',by:'Historical fixture user',evidence:'Synthetic test-only confirmation of this exact hash'});assert.equal(checkB7Review(f).user_acceptance,'accepted');
  const g=fixture();recordedPass(g);changeReview(g,r=>r.user_acceptance.status='needs_repair');assert.throws(()=>checkB7Review(g),/user has rejected this media or requested repairs/);
});
test('editing evidence cannot silently remove an asset or invent probed duration',()=>{
  const f=fixture();recordedPass(f);const e=read(f.evidence);e.assets=[];write(f.evidence,e);changeReview(f,r=>r.evidence_sha256=sha(f.evidence));assert.throws(()=>checkB7Review(f),/omits or changes a declared production asset/);
  const g=fixture();recordedPass(g);const x=read(g.evidence);x.video.duration=99;write(g.evidence,x);changeReview(g,r=>r.evidence_sha256=sha(g.evidence));assert.throws(()=>checkB7Review(g),/metadata differs/);
});
test('the installed-style CLI works from another cwd and returns failing exit codes',()=>{
  const f=fixture(),out=path.join(f.dir,'cli-qa');
  const init=spawnSync(process.execPath,[script,'evidence','--video',f.video,'--plan',f.planFile,'--out',out,'--reference-manifest',f.referenceManifest],{cwd:os.tmpdir(),encoding:'utf8'});assert.equal(init.status,0,init.stderr);assert.equal(JSON.parse(init.stdout).delivery_ready,false);
  const pending=spawnSync(process.execPath,[script,'check','--evidence',f.evidence,'--review',f.review],{cwd:os.tmpdir(),encoding:'utf8'});assert.equal(pending.status,1);assert.match(pending.stderr,/reviewer identity/);
  recordedPass(f);const ready=spawnSync(process.execPath,[script,'check','--evidence',f.evidence,'--review',f.review],{cwd:os.tmpdir(),encoding:'utf8'});assert.equal(ready.status,0,ready.stderr);assert.equal(JSON.parse(ready.stdout).delivery_ready,true);
  const unknown=spawnSync(process.execPath,[script,'chekc'],{encoding:'utf8'});assert.equal(unknown.status,1);
});
test('ambiguous ids, nonboolean approval policy and absent used sound cannot pass init',()=>{
  const p=plan();p.require_user_acceptance='true';assert.throws(()=>validateB7Plan(p,meta),/boolean require_user_acceptance/);
  const q=plan();q.captions[0].id='press';assert.throws(()=>validateB7Plan(q,meta),/unambiguous/);
  const s=plan();s.intentional_silence_reason='Intentional';assert.throws(()=>validateB7Plan(s,{...meta,audio:false}),/sound resources are absent/);
});
