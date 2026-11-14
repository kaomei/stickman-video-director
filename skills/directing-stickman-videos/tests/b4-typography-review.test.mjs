// Synthetic engineering fixtures verify gate/provenance behavior only. They do
// not constitute a real independent aesthetic review or user approval.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createCanvas} from '@napi-rs/canvas';
import {planB4Typography,checkB4TypographyPaint,buildB4TypographyEvidence,verifyB4TypographyReview} from '../scripts/b4-typography-review.mjs';

const ffmpeg=process.env.FFMPEG||'ffmpeg',ffprobe=process.env.FFPROBE||'ffprobe';
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const write=(f,x)=>fs.writeFileSync(f,JSON.stringify(x,null,2)+'\n');
function run(args){const r=spawnSync(ffmpeg,['-v','error',...args],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);}
function project(){return {style:'B4',width:320,height:180,fps:12,duration:1.5,rangeEnd:1.5,fingerprint:'synthetic-engineering-fixture-v1',opening:{user_override:'Synthetic test only'},
  shots:[{id:'body-shot',start:0,end:1.5,layers:[{id:'body-title',type:'text',text:'A REAL CHANGE'}]}],captions:[{start:0,end:1.5,text:'A complete semantic cue.'}],
  typography:{author_id:'synthetic-author',moments:[{id:'body-moment',shot:'body-shot',layer_ids:['body-title'],region:{x:60,y:60,w:1100,h:430},times:{entry:0,mid:.25,settled:.5,hold:17/12},intent:'Synthetic visual change is explained by this title.',treatment:'Whole semantic block enters, settles, then holds.'}]}};}
function drawFixture(p,{staticBody=false,staticCaption=false,movingBackground=false,subtleSettle=false}={}) {
  const canvas=createCanvas(p.width,p.height),ctx=canvas.getContext('2d');
  return (t,{focusIds=[],omitIds=[]}={})=>{
    ctx.resetTransform();ctx.clearRect(0,0,320,180);ctx.fillStyle='#111316';ctx.fillRect(0,0,320,180);
    if(movingBackground&&!focusIds.length){ctx.fillStyle='#294760';ctx.fillRect(t*40,10,90,130);}
    const show=id=>!omitIds.includes(id)&&(!focusIds.length||focusIds.includes(id));
    if(show('body-title')){
      const x=subtleSettle?15:staticBody?20:t<.25?5+60*t:t<.5?20-(t-.25)*20:15;
      ctx.save();if(subtleSettle){const scale=staticBody?1:1+.035*(1-Math.min(1,t/.5));ctx.translate(130,70);ctx.scale(scale,scale);ctx.translate(-130,-70);}
      ctx.globalAlpha=staticBody||subtleSettle?1:Math.min(1,.4+t*2.4);ctx.font='bold 25px sans-serif';ctx.fillStyle='#f9ebd4';ctx.fillText('A REAL CHANGE',x+15,70);ctx.restore();
    }
    for(const [i,c] of p.captions.entries())if(t>=c.start&&t<c.end&&show('caption-'+i)){
      const q=staticCaption===true||staticCaption===i?1:Math.min(1,(t-c.start)/.16);ctx.globalAlpha=q;ctx.font='11px sans-serif';ctx.fillStyle='#f9f5ed';ctx.fillText(c.text,55,164+(1-q)*3);ctx.globalAlpha=1;
    }
    return canvas;
  };
}
function fixture(t,{portrait=false}={}){const dir=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'b4-typography-')));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));const p=project();if(portrait){p.height=568;p.captions=[];}const draw=drawFixture(p),source=path.join(dir,'video.mp4');
  const encode=(file,paint)=>{const prefix=path.join(dir,'frame-');for(let i=0;i<18;i++)fs.writeFileSync(prefix+String(i).padStart(2,'0')+'.png',paint(i/12).toBuffer('image/png'));run(['-framerate','12','-i',prefix+'%02d.png','-c:v','libx264','-crf','16','-pix_fmt','yuv420p','-y',file]);};
  encode(source,draw);const out=path.join(dir,'evidence');fs.mkdirSync(out);const reviewFile=path.join(dir,'review.json');return {dir,p,draw,source,out,reviewFile,encode,options:{file:source,draw,out,projectFingerprint:p.fingerprint,ffmpeg,ffprobe}};}
function syntheticReview(f){const r=read(path.join(f.out,'review-template.json'));r.reviewer={id:'synthetic-independent-agent',kind:'agent',method:'Synthetic protocol fixture; no actual aesthetic or user review',independent:true};
  r.full_playback={status:'pass',viewed_ranges:[{start:0,end:1.5}],observations:[{time:.5,detail:'Synthetic source-view record for protocol testing only.',evidence_ids:['source-video']}]};
  const plan=planB4Typography(f.p);for(const m of r.moments)for(const c of Object.values(m.checks)){c.status='pass';c.observations=[{time:plan.moments.find(x=>x.id===m.id).times.mid,detail:'Synthetic recorded observation at the local entrance and settle; no aesthetic claim.',evidence_ids:[m.id+'-continuous']}];}
  write(f.reviewFile,r);return r;}
const verify=f=>verifyB4TypographyReview(f.p,{...f.options,evidenceDir:f.out,reviewFile:f.reviewFile});

test('registry covers body text and every complete timed caption; missing body plans and omissions fail',()=>{
  const p=project(),plan=planB4Typography(p);assert.deepEqual(plan.moments.map(m=>m.id),['body-moment','caption-0']);assert.equal(plan.captions[0].text,p.captions[0].text);
  delete p.typography;assert.throws(()=>planB4Typography(p),/body text requires explicit/);
  const q=project();q.shots[0].layers.push({id:'forgotten-title',type:'text',text:'Unreviewed'});assert.throws(()=>planB4Typography(q),/covered exactly once/);
  const r=project();r.typography.caption_groups=[];assert.throws(()=>planB4Typography(r),/every actual cue/);
  const s=project();s.typography.moments[0].times.mid=.001;s.typography.moments[0].times.settled=.002;assert.throws(()=>planB4Typography(s),/three distinct/);
  const missingShot=project();delete missingShot.shots[0].id;delete missingShot.typography.moments[0].shot;assert.throws(()=>planB4Typography(missingShot),/explicit id/);
  const image=project();image.shots[0].layers.push({id:'embedded',type:'image',path:'unused.png'});image.typography.image_text=[{shot:0,layer_id:'embedded',text:'Embedded text'}];assert.throws(()=>planB4Typography(image),/covered exactly once/);
});

test('text-isolated diagnostics reject static body, static captions and background motion as substitutes',()=>{
  const p=project();assert.equal(checkB4TypographyPaint(p,{draw:drawFixture(p)}).status,'paint_diagnostic_pass');
  assert.throws(()=>checkB4TypographyPaint(p,{draw:drawFixture(p,{staticBody:true})}),/body-moment.*micro-animation/);
  assert.throws(()=>checkB4TypographyPaint(p,{draw:drawFixture(p,{staticBody:true,movingBackground:true})}),/body-moment.*micro-animation/);
  assert.throws(()=>checkB4TypographyPaint(p,{draw:drawFixture(p,{staticCaption:true})}),/caption-0.*micro-animation/);
});

test('grouping cannot borrow an earlier title or first animated cue to hide future static text',()=>{
  const p=project();p.shots[0].layers.push({id:'future-title',type:'text',text:'Late title',from:.75});p.typography.moments[0].layer_ids.push('future-title');assert.throws(()=>planB4Typography(p),/actually be visible/);
  const hidden=project();hidden.shots[0].layers.push({id:'hidden-title',type:'text',text:'Invisible grouped member',alpha:0});hidden.typography.moments[0].layer_ids.push('hidden-title');assert.throws(()=>checkB4TypographyPaint(hidden,{draw:drawFixture(hidden)}),/grouped text member hidden-title.*actually be visible/);
  const q=project();q.shots[0].layers[0].id='caption-0';q.typography.moments[0].layer_ids=['caption-0'];assert.throws(()=>planB4Typography(q),/reserved caption-N/);
  const r=project();r.typography.moments[0].times.hold=.6;const m=planB4Typography(r).moments[0];assert.equal(m.clip_start_frame,0);assert.equal(m.clip_end_frame,18,'continuous evidence covers full visible lifetime, beyond selected phases');
  const c=project();c.captions=[{start:0,end:.75,text:'First semantic cue.'},{start:.75,end:1.5,text:'Second semantic cue.'}];c.typography.caption_groups=[{id:'combined-captions',cue_indices:[0,1],region:{x:60,y:602,w:1160,h:118},times:{entry:0,mid:1/12,settled:2/12,hold:.5},intent:'Synthetic combined review grouping.',treatment:'Every actual cue still has its own restrained entrance.'}];
  const plan=planB4Typography(c);assert.equal(plan.caption_diagnostics.length,2);assert.equal(plan.moments.find(m=>m.id==='combined-captions').clip_end_frame,18);assert.throws(()=>checkB4TypographyPaint(c,{draw:drawFixture(c,{staticCaption:1})}),/caption-1.*micro-animation/);
});

test('scoped image-text registry excludes future from, respects layer to, and rejects unknown shots',()=>{
  const p=project();p.duration=3;p.shots[0].end=3;p.shots[0].layers.push({id:'future-image',type:'image',from:2,to:2.5},{id:'current-image',type:'image',from:0,to:.75});
  p.typography.image_text=[{shot:0,layer_id:'future-image',text:'Future embedded title'},{shot:0,layer_id:'current-image',text:'Current embedded title'}];
  p.typography.moments[0].layer_ids.push('current-image');const plan=planB4Typography(p);assert.deepEqual(plan.registry.filter(x=>x.kind==='image_text').map(x=>[x.id,x.end]),[['current-image',.75]]);
  p.typography.image_text.push({shot:'misspelled-shot',layer_id:'unknown',text:'Unknown embedded title'});assert.throws(()=>planB4Typography(p),/current shot/);
});

test('actual MP4 must preserve micro-animation even when authored paint and forged diagnostics look valid',async t=>{
  const f=fixture(t);f.encode(f.source,drawFixture(f.p,{staticBody:true}));await assert.rejects(()=>buildB4TypographyEvidence(f.p,f.options),/exported.*frame|actual local micro-animation/);
});

test('phase-specific source proof rejects stripping a subtle 1.035 settle below broad codec tolerances',async t=>{
  const f=fixture(t),draw=drawFixture(f.p,{subtleSettle:true});assert.equal(checkB4TypographyPaint(f.p,{draw}).status,'paint_diagnostic_pass');
  f.encode(f.source,drawFixture(f.p,{subtleSettle:true,staticBody:true}));await assert.rejects(()=>buildB4TypographyEvidence(f.p,{...f.options,draw}),/actual local micro-animation/);
});

test('evidence starts pending with unknown checks; independent record is separate and complete',async t=>{
  const f=fixture(t),ledger=await buildB4TypographyEvidence(f.p,f.options);assert.equal(ledger.status,'pending_independent_review');assert.equal(ledger.diagnostic.frames_checked,18);assert.equal(ledger.artifacts.length,10);
  const template=read(ledger.template_file);assert.equal(template.full_playback.status,'unknown');assert.deepEqual(template.full_playback.viewed_ranges,[]);assert.equal(template.reviewer.independent,false);assert.ok(template.moments.every(m=>Object.values(m.checks).every(c=>c.status==='unknown'&&c.observations.length===0)));
  write(f.reviewFile,template);await assert.rejects(()=>verify(f),/independent reviewer|pending\/failed/);
  const r=syntheticReview(f);const accepted=await verify(f);assert.equal(accepted.status,'independent_visual_review_pass');assert.equal(accepted.user_acceptance,'not_inferred');assert.match(accepted.limits.join(' '),/not authenticated/);
  r.moments[0].checks.material_finish.status='fail';write(f.reviewFile,r);await assert.rejects(()=>verify(f),/material_finish.*pending\/failed/);
  r.moments[0].checks.material_finish.status='pass';r.moments[0].checks.readability.observations=[];write(f.reviewFile,r);await assert.rejects(()=>verify(f),/specific timed observations/);
  r.moments[0].checks.readability.observations=[{time:.25,detail:'pass',evidence_ids:['body-moment-continuous']}];write(f.reviewFile,r);await assert.rejects(()=>verify(f),/not a pass label/);
  r.moments[0].checks.readability.observations=[{time:.25,detail:'Synthetic details still require continuous evidence.',evidence_ids:['body-moment-mid']}];write(f.reviewFile,r);await assert.rejects(()=>verify(f),/continuous clip/);
});

test('stale output/plan and rehashed substitute clips or omitted evidence cannot be accepted',async t=>{
  const f=fixture(t);await buildB4TypographyEvidence(f.p,f.options);syntheticReview(f);const ledgerFile=path.join(f.out,'evidence.json'),originalLedger=fs.readFileSync(ledgerFile),originalClip=fs.readFileSync(path.join(f.out,'body-moment-continuous.mp4'));
  f.p.typography.moments[0].intent='Changed after extraction';await assert.rejects(()=>verify(f),/stale evidence/);f.p.typography.moments[0].intent=project().typography.moments[0].intent;
  fs.appendFileSync(f.source,Buffer.from('changed output'));await assert.rejects(()=>verify(f),/stale evidence/);f.encode(f.source,f.draw);
  let ledger=read(ledgerFile),r=syntheticReview(f);const clip=ledger.artifacts.find(a=>a.id==='body-moment-continuous');fs.copyFileSync(path.join(f.out,'caption-0-continuous.mp4'),path.join(f.out,clip.file));clip.sha256=hash(path.join(f.out,clip.file));write(ledgerFile,ledger);r.evidence_sha256=hash(ledgerFile);write(f.reviewFile,r);await assert.rejects(()=>verify(f),/not from current actual output/);
  fs.writeFileSync(ledgerFile,originalLedger);fs.writeFileSync(path.join(f.out,'body-moment-continuous.mp4'),originalClip);ledger=read(ledgerFile);ledger.artifacts.pop();write(ledgerFile,ledger);r.evidence_sha256=hash(ledgerFile);write(f.reviewFile,r);await assert.rejects(()=>verify(f),/missing\/extra evidence/);
});

test('independence, actual author and complete source playback are required, never user approval',async t=>{
  const f=fixture(t);await buildB4TypographyEvidence(f.p,f.options);let r=syntheticReview(f);r.reviewer.id=f.p.typography.author_id;write(f.reviewFile,r);await assert.rejects(()=>verify(f),/distinct from actual author/);
  r=syntheticReview(f);r.full_playback.viewed_ranges=[{start:0,end:.75}];write(f.reviewFile,r);await assert.rejects(()=>verify(f),/omits current review tail/);
  delete f.p.typography.author_id;assert.throws(()=>planB4Typography(f.p),/actual author_id/);
});

test('caption evidence retains source audio and deterministic provenance verification',async t=>{
  const f=fixture(t),withAudio=path.join(f.dir,'with-audio.mp4');run(['-i',f.source,'-f','lavfi','-i','sine=frequency=440:duration=1.5','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-shortest','-y',withAudio]);fs.renameSync(withAudio,f.source);
  const ledger=await buildB4TypographyEvidence(f.p,f.options),clip=ledger.artifacts.find(a=>a.id==='caption-0-continuous');assert.equal(clip.audio,'source_if_present');
  const r=spawnSync(ffprobe,['-v','error','-show_streams','-of','json',path.join(f.out,clip.file)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.ok(JSON.parse(r.stdout).streams.some(s=>s.codec_type==='audio'));
  syntheticReview(f);assert.equal((await verify(f)).status,'independent_visual_review_pass');
});

test('portrait acceptance requires phone-size normal-speed source playback with honest device limits, including custom renderers',async t=>{
  const f=fixture(t,{portrait:true}),ledger=await buildB4TypographyEvidence(f.p,f.options),template=read(ledger.template_file);
  assert.equal(template.portrait_viewing.status,'unknown');
  assert.equal(template.portrait_viewing.real_device.checked,null);
  let r=syntheticReview(f);await assert.rejects(()=>verify(f),/portrait phone-size playback/);
  r.portrait_viewing={status:'pass',display_width:360,display_height:639,playback_speed:1,platform:'Synthetic desktop portrait player; no real viewing claim',real_device:{checked:false,limitation:'Synthetic fixture only; no physical device inspected.'},observations:[{time:.5,detail:'Synthetic phone-size source observation for schema testing; no aesthetic judgment.',evidence_ids:['source-video']}]};
  const valid=structuredClone(r);
  for(const [mutate,pattern] of [
    [x=>{delete x.portrait_viewing;},/portrait phone-size playback/],
    [x=>{x.portrait_viewing.display_width=1080;},/portrait phone-size playback/],
    [x=>{x.portrait_viewing.display_height=360;},/portrait phone-size playback/],
    [x=>{x.portrait_viewing.playback_speed=2;},/portrait phone-size playback/],
    [x=>{x.portrait_viewing.platform='';},/portrait phone-size playback/],
    [x=>{x.portrait_viewing.real_device.limitation='';},/simulated-device limitation/],
    [x=>{x.portrait_viewing.observations[0].evidence_ids=['body-moment-mid'];},/reference source-video/],
  ]) {r=structuredClone(valid);mutate(r);write(f.reviewFile,r);await assert.rejects(()=>verify(f),pattern);}
  write(f.reviewFile,valid);const accepted=await verify(f);
  assert.equal(accepted.status,'independent_visual_review_pass');
  assert.deepEqual(accepted.portrait_viewing,valid.portrait_viewing);
  assert.equal(accepted.user_acceptance,'not_inferred');
  assert.match(accepted.limits.join(' '),/declared, not authenticated/);
});

test('physical environment digits retain complete coverage, four-phase visibility and all six independent checks',async t=>{
  const f=fixture(t),p=f.p;p.base=f.dir;
  const mark=createCanvas(40,50),ctx=mark.getContext('2d');ctx.fillStyle='#814332';ctx.fillRect(0,0,40,50);ctx.fillStyle='#fff1d4';ctx.font='bold 32px sans-serif';ctx.fillText('7',9,38);fs.writeFileSync(path.join(f.dir,'physical-number.png'),mark.toBuffer('image/png'));
  p.shots[0].layers.push({id:'machine-panel',type:'image',path:'physical-number.png'});
  const entry={id:'machine-number',shot:0,layer_id:'machine-panel',text:'7',role:'environment_marking',classification_reason:'The digit is printed on a fixed metal machine panel as its physical identifier, not a title, rule, warning or instruction.',region:{x:1040,y:190,w:180,h:220},times:{entry:0,mid:.25,settled:.5,hold:17/12}};
  p.typography.image_text=[entry];
  const base=drawFixture(p),draw=(time,o={})=>{const c=base(time,o);if(!(o.omitIds||[]).includes('machine-panel')&&(!(o.focusIds||[]).length||o.focusIds.includes('machine-panel')))c.getContext('2d').drawImage(mark,265,50);return c;};f.draw=draw;f.options.draw=draw;
  const defaultPrincipal=structuredClone(p);delete defaultPrincipal.typography.image_text[0].role;assert.throws(()=>planB4Typography(defaultPrincipal),/covered exactly once/);
  const absentTimes=structuredClone(p);delete absentTimes.typography.image_text[0].times;assert.throws(()=>planB4Typography(absentTimes),/four actual evidence phase/);
  const absentReason=structuredClone(p);delete absentReason.typography.image_text[0].classification_reason;assert.throws(()=>planB4Typography(absentReason),/classification_reason/);
  const paint=checkB4TypographyPaint(p,{draw}),physical=paint.metrics.find(m=>m.id===entry.id);assert.equal(physical.phases.length,4);assert.equal(physical.classification_status,'pending_independent_review');
  const hidden=(time,o={})=>draw(time,time<.25?{...o,omitIds:[...(o.omitIds||[]),'machine-panel']}:o);assert.throws(()=>checkB4TypographyPaint(p,{draw:hidden}),/visible and unobscured in all four phases/);
  f.encode(f.source,draw);await buildB4TypographyEvidence(p,f.options);
  const ledger=read(path.join(f.out,'evidence.json'));assert.equal(ledger.artifacts.filter(a=>a.moment===entry.id).length,5);
  const review=syntheticReview(f);await assert.rejects(()=>verify(f),/classification is pending/);
  const item=review.moments.find(m=>m.id===entry.id);assert.deepEqual(Object.keys(item.checks).sort(),['hierarchy','material_finish','micro_animation','readability','story_fit','timing']);
  item.environment_classification={status:'pass',is_physical_marking:true,is_title_or_rule_or_warning:true,observations:[{time:.5,detail:'Synthetic reviewer identifies this as a warning; the environment role must be rejected.',evidence_ids:[entry.id+'-continuous']}]};write(f.reviewFile,review);await assert.rejects(()=>verify(f),/principal titles, rules and warnings/);
  item.environment_classification.is_title_or_rule_or_warning=false;item.environment_classification.observations[0].detail='Synthetic fixture digit remains printed on its physical machine panel across all phases; protocol-only classification.';write(f.reviewFile,review);
  item.checks.micro_animation.status='unknown';write(f.reviewFile,review);await assert.rejects(()=>verify(f),/micro_animation is pending/);
  item.checks.micro_animation.status='pass';write(f.reviewFile,review);assert.equal((await verify(f)).status,'independent_visual_review_pass');
  fs.appendFileSync(path.join(f.dir,'physical-number.png'),'changed');await assert.rejects(()=>verify(f),/stale evidence\/output\/project\/plan binding/);
});
