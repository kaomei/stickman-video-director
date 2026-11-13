// These are synthetic protocol records over a tiny derivative of bundled media.
// They do not represent actual independent viewing or sample-quality approval.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {referenceInputs,planBStyleReference,buildBStyleReferenceEvidence,verifyBStyleReferenceReview} from '../scripts/b-style-reference-review.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),FFMPEG=process.env.FFMPEG||'ffmpeg';
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const write=(f,x)=>fs.writeFileSync(f,JSON.stringify(x,null,2)+'\n');
function media(args) {const r=spawnSync(FFMPEG,['-v','error',...args]);assert.equal(r.status,0,String(r.stderr));}
function project(style='B1') {
  return {style,width:160,height:90,fps:30,duration:.8,rangeEnd:.8,shots:[{id:'first',start:0,end:.4,layers:[]},{id:'second',start:.4,end:.8,layers:[]}],captions:[{start:0,end:.8,text:'Synthetic protocol fixture only.'}],reference_review:{author_id:'synthetic-author',capability:{mode:'sample_target',environment:'Local ffmpeg derivative used only for protocol regression; no aesthetic claim.',limitations:[]}}};
}
async function fixture(t,style='B1',mutate=()=>{}) {
  const dir=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'b-style-reference-test-')));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const file=path.join(dir,'video.mp4'),out=path.join(dir,'evidence'),reviewFile=path.join(dir,'review.json');fs.mkdirSync(out);
  const source=path.join(ROOT,'assets/b1/approved-2026-10-23.mp4');
  const r=spawnSync(FFMPEG,['-v','error','-ss','4','-i',source,'-t','0.8','-vf','scale=160:90','-r','30','-frames:v','24','-map','0:v:0','-map','0:a:0','-c:v','libx264','-threads:v','1','-pix_fmt','yuv420p','-c:a','aac','-threads:a','1','-y',file]);assert.equal(r.status,0,String(r.stderr));
  const p=project(style);mutate(p);
  const args={file,out,projectFingerprint:'synthetic-fixture-fingerprint',ffmpeg:FFMPEG};
  const ledger=await buildBStyleReferenceEvidence(p,args);
  return {p,dir,file,out,reviewFile,args,ledger};
}
function review(f) {
  const r=read(f.ledger.template_file),refs=f.ledger.references,video=refs.find(x=>x.kind==='video'),audible=refs.find(x=>x.has_audio),detail='Synthetic protocol record only; actual aesthetic viewing is not asserted.';
  r.reviewer={id:'synthetic-independent-reviewer',kind:'agent',method:'Synthetic engineering fixture, not real viewing or aesthetic acceptance.',independent:true};
  r.full_playback={status:'pass',viewed_ranges:[{start:0,end:f.ledger.scope.end}],observations:[{time:0,detail,evidence_ids:['source-video']}]};
  r.baseline_comparisons=refs.filter(x=>x.required_comparison).map(ref=>({reference_id:ref.id,start:0,end:.1,observations:[{time:0,detail,evidence_ids:[ref.id]}]}));
  for(const item of r.shots) {
    const s=f.ledger.plan.shots.find(x=>x.id===item.id);
    for(const [k,c] of Object.entries(item.checks)) Object.assign(c,{status:'pass',observations:[{time:s.start,detail,evidence_ids:[s.id+'-continuous']}],comparisons:[{reference_id:(k==='sound'?audible:video).id,start:0,end:.1,detail}]});
  }
  write(f.reviewFile,r);return r;
}
const verify=f=>verifyBStyleReferenceReview(f.p,{file:f.file,evidenceDir:f.out,reviewFile:f.reviewFile,projectFingerprint:f.args.projectFingerprint,ffmpeg:FFMPEG});
function setReview(f,fn) {const r=review(f);fn(r);write(f.reviewFile,r);}

test('portable references verify their manifest locks; plans cover the entire submitted range without requiring a renderer',()=>{
  for(const style of ['B1','B3']) {
    const inputs=referenceInputs(style);assert.ok(inputs.length>=6);assert.ok(inputs.every(f=>path.isAbsolute(f)&&fs.statSync(f).isFile()));
    const p=project(style),plan=planBStyleReference(p);assert.equal(plan.shots.length,2);assert.equal(plan.shots.at(-1).end_frame,24);
    p.shots[1].start=.5;assert.throws(()=>planBStyleReference(p),/gap or overlap/);
    p.shots[1].start=.4;p.shots[1].end=.7;assert.throws(()=>planBStyleReference(p),/tail/);
  }
  const p=project();delete p.reference_review;assert.equal(planBStyleReference(p).capability.mode,'sample_target');assert.equal(planBStyleReference(p).author_id,null);
  assert.deepEqual(referenceInputs('B4'),[]);assert.equal(planBStyleReference({style:'B4'}),null);
});

for(const style of ['B1','B3'])test(`${style} produces unknown review, bound full-shot evidence and protocol-only positive acceptance`,async t=>{
  const f=await fixture(t,style),template=read(f.ledger.template_file);
  assert.equal(f.ledger.status,'pending_independent_review');assert.equal(f.ledger.artifacts.length,8);
  assert.equal(template.full_playback.status,'unknown');assert.deepEqual(template.full_playback.viewed_ranges,[]);
  assert.ok(template.shots.every(s=>Object.values(s.checks).every(c=>c.status==='unknown'&&c.observations.length===0&&c.comparisons.length===0)));
  fs.copyFileSync(f.ledger.template_file,f.reviewFile);await assert.rejects(()=>verify(f),/independent reviewer|pending|unknown/);
  review(f);const a=await verify(f);assert.equal(a.status,'sample_target_review_passed');assert.equal(a.equivalence,'available_samples_reviewed');assert.equal(a.user_acceptance,'not_inferred');assert.equal(a.output_sha256,hash(f.file));
  if(style==='B3') {
    setReview(f,r=>r.baseline_comparisons.pop());await assert.rejects(()=>verify(f),/required available reference/);
    setReview(f,r=>{r.shots[0].checks.sound.comparisons[0]={reference_id:'b3-accepted-dog-motion',start:0,end:.1,detail:'Synthetic deliberate attempt to compare audio to a silent excerpt.'};});await assert.rejects(()=>verify(f),/audible reference/);
  }
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

test('limited capability records disclose unmet fidelity without waiving captions, timing or sound',async t=>{
  const f=await fixture(t,'B3',p=>{p.reference_review.capability={mode:'limited',environment:'Synthetic local-only fixture with no anatomy rigging tool.',limitations:[{capability:'Layered character rigging',observed:'Synthetic probe has no editable limb assets or rig controls.',impact:'The complex supported step cannot reach the available sample acting quality.'}]};});
  setReview(f,r=>{r.shots[0].checks.semantic_action.status='unmet';});
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

test('stale project, plan, source and rewritten artifact manifests cannot be laundered into acceptance',async t=>{
  const f=await fixture(t);review(f);
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
