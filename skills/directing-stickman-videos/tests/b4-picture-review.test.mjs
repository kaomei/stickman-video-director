import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {planB4Picture,checkB4PicturePaint,buildB4PictureEvidence,verifyB4PictureReview} from '../scripts/b4-picture-review.mjs';
import {createCanvas} from '@napi-rs/canvas';
// Synthetic protocol regression fixtures; passing these tests is not visual approval of a real film.
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const save=(f,x)=>fs.writeFileSync(f,JSON.stringify(x,null,2)+'\n');
function fixture(t,{portrait=false}={}) {
  const dir=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'b4-picture-test-')));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const art=createCanvas(80,80),ctx=art.getContext('2d');ctx.fillStyle='#ee8e70';ctx.fillRect(0,0,80,80);fs.writeFileSync(path.join(dir,'image.png'),art.toBuffer('image/png'));
  const p={style:'B4',base:dir,fingerprint:'synthetic-project-v1',duration:1.6,rangeEnd:1.6,fps:10,width:320,height:portrait?568:180,shots:[{start:0,end:1.6,layers:[{id:'actor',type:'image',path:'image.png',x:160,y:200,w:120,h:120}]}],picture_motion:{author_id:'synthetic-author',shots:[{shot:0,kind:'local_action',intent:'The prop moves toward the door.',before:'Prop away from door.',after:'Prop reaches door.',layer_ids:['actor'],region:{x:140,y:180,w:480,h:180},times:{before:.1,mid:.5,after:.9,hold:1.3}}]}};
  const painter=({frozen=false,cut=false,hidden=false,captionOnly=false}={})=>(time,{focusIds=[],omitIds=[]}={})=>{
    const c=createCanvas(p.width,p.height),ctx=c.getContext('2d');ctx.scale(p.width/1280,p.width/1280);ctx.fillStyle='#111316';ctx.fillRect(0,0,1280,1280*p.height/p.width);
    if((!focusIds.length||focusIds.includes('actor'))&&!omitIds.includes('actor')) {
      let progress=Math.max(0,Math.min(1,(time-.1)/.8));if(frozen||captionOnly)progress=0;if(cut)progress=time<.7?0:1;
      ctx.fillStyle='#ee8e70';ctx.fillRect(160+progress*300,200,120,120);
    }
    if(!focusIds.length&&hidden){ctx.fillStyle='#111316';ctx.fillRect(140,180,480,180);}
    if(!focusIds.length&&captionOnly){ctx.fillStyle='#ffffff';ctx.fillRect(20+time*50,450,120,40);}
    return c;
  };
  const draw=painter(),picture=painter();
  const encode=(name,frame=draw)=>{
    const source=path.join(dir,name),frames=[];for(let i=0;i<p.duration*p.fps;i++)frames.push(Buffer.from(frame(i/p.fps).getContext('2d').getImageData(0,0,p.width,p.height).data));
    const r=spawnSync('ffmpeg',['-v','error','-f','rawvideo','-pixel_format','rgba','-video_size',`${p.width}x${p.height}`,'-framerate',String(p.fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-n',source],{input:Buffer.concat(frames),maxBuffer:8*1024*1024});assert.equal(r.status,0,String(r.stderr));return source;
  };
  return {dir,p,painter,draw,picture,encode};
}
test('non-B4 returns null through all four public interfaces',async()=>{
  const p={style:'B1'};assert.equal(planB4Picture(p),null);assert.equal(checkB4PicturePaint(p,{}),null);assert.equal(await buildB4PictureEvidence(p,{}),null);assert.equal(await verifyB4PictureReview(p,{}),null);
});
test('picture review enforces three-second shots including preview prefixes and hold claims',t=>{
  const f=fixture(t),p=structuredClone(f.p);
  p.duration=3;p.rangeEnd=3;p.shots[0].end=3;
  assert.equal(planB4Picture(p).shots.length,1);
  p.duration=3.1;p.rangeEnd=3.1;p.shots[0].end=3.1;
  assert.throws(()=>planB4Picture(p),/maximum 3 seconds/);
  p.rangeEnd=1.6;
  assert.throws(()=>planB4Picture(p),/maximum 3 seconds/);
  p.picture_motion.shots[0].kind='motivated_hold';
  p.picture_motion.shots[0].reason='Long reading time';
  p.shots[0].kind='exceptional_hold';p.shots[0].user_approval='Author claims an exception';
  assert.throws(()=>planB4Picture(p),/maximum 3 seconds/);
});
test('requires coverage, independent source image ids and complete preview beat',t=>{
  const f=fixture(t),p=structuredClone(f.p);p.picture_motion.shots=[];assert.throws(()=>planB4Picture(p),/missing/);
  p.picture_motion=structuredClone(f.p.picture_motion);p.picture_motion.shots[0].layer_ids=['caption-0'];assert.throws(()=>planB4Picture(p),/image layer/);
  p.picture_motion=structuredClone(f.p.picture_motion);p.rangeEnd=.8;assert.throws(()=>planB4Picture(p),/complete beat/);
  p.rangeEnd=1.6;p.picture_motion.shots[0].kind='motivated_hold';assert.throws(()=>planB4Picture(p),/all-hold/);
});
test('local image motion passes, static/caption-only/cut/occluded pictures fail',t=>{
  const f=fixture(t);assert.equal(checkB4PicturePaint(f.p,f).diagnostic_status,'technical_only');
  assert.throws(()=>checkB4PicturePaint(f.p,{draw:f.painter({captionOnly:true}),picture:f.painter({frozen:true})}),/state change/);
  assert.throws(()=>checkB4PicturePaint(f.p,{draw:f.painter({cut:true}),picture:f.painter({cut:true})}),/intermediate/);
  assert.throws(()=>checkB4PicturePaint(f.p,{draw:f.painter({hidden:true}),picture:f.picture}),/absent.*obscured|obscured/);
});
test('reuse compares resource content and holds require adjacent support',t=>{
  const f=fixture(t),p=structuredClone(f.p);p.duration=3.2;p.rangeEnd=3.2;p.shots.push({...structuredClone(p.shots[0]),start:1.6,end:3.2});
  const two={...structuredClone(p.picture_motion.shots[0]),shot:1,times:{before:1.7,mid:2.1,after:2.5,hold:2.9}};p.picture_motion.shots.push(two);
  assert.throws(()=>planB4Picture(p),/reuse_reason/);p.picture_motion.shots.forEach(s=>s.reuse_reason='Same prop continues toward the same door in this scene.');assert.equal(planB4Picture(p).shots.length,2);
  two.kind='motivated_hold';two.reason='Audience reads the reached-door result.';two.supports_shot=0;assert.equal(planB4Picture(p).shots[1].kind,'motivated_hold');
  two.supports_shot=3;assert.throws(()=>planB4Picture(p),/adjacent/);
});
test('whole-scene camera translation cannot substitute for a local story action',t=>{
  const f=fixture(t),p=f.p;p.shots[0].layers[0].w=1280;p.shots[0].layers[0].h=720;p.picture_motion.shots[0].region={x:0,y:0,w:1280,h:720};
  const camera=(time,{focusIds=[],omitIds=[]}={})=>{
    const c=createCanvas(p.width,p.height),ctx=c.getContext('2d');ctx.scale(p.width/1280,p.width/1280);ctx.fillStyle='#111316';ctx.fillRect(0,0,1280,720);
    if((!focusIds.length||focusIds.includes('actor'))&&!omitIds.includes('actor')) {
      ctx.translate(Math.max(0,Math.min(1,(time-.1)/.8))*40,0);ctx.fillStyle='#263b51';ctx.fillRect(0,0,1280,720);
      for(let y=0;y<8;y++)for(let x=0;x<12;x++){ctx.fillStyle=(x+y)%3?'#d88d70':'#82a1b6';ctx.fillRect(x*110,y*90,40+(x%4)*8,35+(y%3)*8);}
    }
    return c;
  };
  assert.throws(()=>checkB4PicturePaint(p,{draw:camera,picture:camera}),/whole-scene translation\/zoom/);
});
test('builds actual-media clips and unknown review stays blocked; independent complete review can pass only picture scope',async t=>{
  const f=fixture(t),source=f.encode('good.mp4'),out=path.join(f.dir,'evidence');fs.mkdirSync(out);
  const args={file:source,draw:f.draw,picture:f.picture,out,projectFingerprint:f.p.fingerprint};
  const ledger=await buildB4PictureEvidence(f.p,args);assert.equal(ledger.artifacts.length,5);assert.equal(ledger.scope,'picture only');assert.equal(ledger.delivery_ready,false);assert.equal(ledger.diagnostic.frames_checked,16);
  const reviewFile=path.join(f.dir,'review.json'),review=JSON.parse(fs.readFileSync(ledger.template_file,'utf8'));save(reviewFile,review);
  const verify=()=>verifyB4PictureReview(f.p,{...args,evidenceDir:out,reviewFile});
  await assert.rejects(verify,/independent reviewer/);
  review.reviewer={id:'independent-test-reviewer',kind:'agent',method:'Synthetic observations exercise validation only; no real aesthetic acceptance is asserted.',independent:true};save(reviewFile,review);
  await assert.rejects(verify,/playback.*pending/);
  review.full_playback={status:'pass',viewed_ranges:[{start:0,end:1.6}],observations:[{time:.5,detail:'Synthetic fixture prop moves continuously from left toward the right door; test observation only.',evidence_ids:['source-video']}]};
  for(const check of Object.values(review.shots[0].checks)){check.status='pass';check.observations=[{time:.5,detail:'Synthetic fixture prop crosses the middle position and holds the reached position; test observation only.',evidence_ids:['shot-0-continuous','shot-0-mid']}];}save(reviewFile,review);
  const origin=review.shots[0].checks.story_asset_origin;assert.ok(origin);
  delete review.shots[0].checks.story_asset_origin;save(reviewFile,review);await assert.rejects(verify,/story_asset_origin review/);
  review.shots[0].checks.story_asset_origin={...origin,status:'unknown'};save(reviewFile,review);await assert.rejects(verify,/story_asset_origin.*pending/);
  review.shots[0].checks.story_asset_origin=origin;save(reviewFile,review);
  const passed=await verify();assert.equal(passed.status,'independent_picture_review_pass');assert.equal(passed.scope,'picture only');assert.equal(passed.delivery_ready,false);
  const clip=path.join(out,'shot-0-continuous.mp4');fs.appendFileSync(clip,'tamper');await assert.rejects(verify,/artifact hash changed/);
  const changed=JSON.parse(fs.readFileSync(ledger.ledger_file));changed.artifacts.find(a=>a.id==='shot-0-continuous').sha256=sha(clip);save(ledger.ledger_file,changed);review.evidence_sha256=sha(ledger.ledger_file);save(reviewFile,review);
  await assert.rejects(verify,/not extracted from current actual output/);
});
test('actual MP4 cannot freeze or replace the authored picture action',async t=>{
  const f=fixture(t),source=f.encode('frozen.mp4',f.painter({frozen:true})),out=path.join(f.dir,'evidence');fs.mkdirSync(out);
  await assert.rejects(()=>buildB4PictureEvidence(f.p,{file:source,draw:f.draw,picture:f.picture,out,projectFingerprint:f.p.fingerprint}),/does not match|differs|loses its actual/);
});
test('high-resolution YUV420 chroma edges are compared in the same RGB resize domain as authored frames',async t=>{
  const f=fixture(t),p=f.p;p.width=1280;p.height=720;
  p.picture_motion.shots[0].region={x:750,y:130,w:500,h:460};
  const painter=({frozen=false}={})=>(time,{focusIds=[],omitIds=[]}={})=>{
    const c=createCanvas(p.width,p.height),ctx=c.getContext('2d');ctx.fillStyle='#171d21';ctx.fillRect(0,0,p.width,p.height);
    if((!focusIds.length||focusIds.includes('actor'))&&!omitIds.includes('actor')){
      // Dense colored ink at native resolution reproduces YUV/RGB resize-order
      // drift without shipping any story, reference image or generated fixture.
      const palette=['#bb392f','#071b21','#dcb86c'];ctx.fillStyle=palette[0];ctx.fillRect(760,140,480,440);
      for(let y=140;y<580;y+=14)for(let x=760;x<1240;x+=14){ctx.strokeStyle=palette[(Math.floor(x/14)+Math.floor(y/14))%3];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+14,y+14);ctx.stroke();}
      const q=frozen?0:Math.max(0,Math.min(1,(time-.1)/.8));ctx.fillStyle='#f0cfab';ctx.fillRect(790+q*250,320,120,120);
    }
    return c;
  };
  const draw=painter(),source=f.encode('colored-ink.mp4',draw),expected=createCanvas(320,180);expected.getContext('2d').drawImage(draw(0),0,0,320,180);
  const authored=expected.getContext('2d').getImageData(0,0,320,180).data;
  const old=spawnSync('ffmpeg',['-v','error','-i',source,'-frames:v','1','-vf','scale=320:180:flags=area','-pix_fmt','rgba','-f','rawvideo','pipe:1'],{maxBuffer:1024*1024});assert.equal(old.status,0,String(old.stderr));
  let changed=0,count=0;for(let y=35;y<145;y++)for(let x=190;x<310;x++){const i=(y*320+x)*4,d=(Math.abs(old.stdout[i]-authored[i])+Math.abs(old.stdout[i+1]-authored[i+1])+Math.abs(old.stdout[i+2]-authored[i+2]))/(3*255);changed+=d>.04;count++;}
  assert.ok(changed/count>.18,'fixture must reproduce the old local chroma-edge false rejection');
  const out=path.join(f.dir,'evidence');fs.mkdirSync(out);
  const args={file:source,draw,picture:draw,out,projectFingerprint:p.fingerprint};
  assert.equal((await buildB4PictureEvidence(p,args)).diagnostic.frames_checked,16);
  const frozen=f.encode('colored-ink-frozen.mp4',painter({frozen:true})),bad=path.join(f.dir,'bad');fs.mkdirSync(bad);
  await assert.rejects(()=>buildB4PictureEvidence(p,{...args,file:frozen,out:bad}),/does not match|differs|loses its actual/);
});
test('portrait acceptance requires phone-size 1x source-video observation and disclosed device limitation',async t=>{
  const f=fixture(t,{portrait:true}),source=f.encode('portrait.mp4'),out=path.join(f.dir,'evidence');fs.mkdirSync(out);
  const args={file:source,draw:f.draw,picture:f.picture,out,projectFingerprint:f.p.fingerprint};
  const ledger=await buildB4PictureEvidence(f.p,args),review=JSON.parse(fs.readFileSync(ledger.template_file,'utf8')),reviewFile=path.join(f.dir,'review.json');
  review.reviewer={id:'independent-portrait-fixture',kind:'agent',method:'Synthetic portrait schema test only.',independent:true};
  review.full_playback={status:'pass',viewed_ranges:[{start:0,end:1.6}],observations:[{time:.5,detail:'Synthetic prop traverses the declared region during the complete fixture.',evidence_ids:['source-video']}]};
  for(const c of Object.values(review.shots[0].checks)){c.status='pass';c.observations=[{time:.5,detail:'Synthetic local prop reaches the middle pose before holding the destination.',evidence_ids:['shot-0-continuous']}];}
  save(reviewFile,review);const verify=()=>verifyB4PictureReview(f.p,{...args,evidenceDir:out,reviewFile});
  await assert.rejects(verify,/portrait playback/);
  review.portrait_viewing={status:'pass',display_width:360,display_height:639,playback_speed:1,platform:'synthetic schema test',real_device:{checked:false,limitation:'Simulated 360px display record for validator testing only.'},observations:[{time:.5,detail:'Synthetic phone-size schema fixture records complete picture playback.',evidence_ids:['source-video']}]};save(reviewFile,review);
  assert.equal((await verify()).scope,'picture only');
  review.portrait_viewing.playback_speed=2;save(reviewFile,review);await assert.rejects(verify,/portrait playback/);
  review.portrait_viewing.playback_speed=1;review.reviewer.id=review.author_id;save(reviewFile,review);await assert.rejects(verify,/independent reviewer/);
  review.reviewer.id='independent-portrait-fixture';review.full_playback.viewed_ranges=[{start:0,end:.8},{start:1,end:1.6}];save(reviewFile,review);await assert.rejects(verify,/omit current review scope/);
  review.full_playback.viewed_ranges=[{start:0,end:1.6}];review.shots[0].checks.anatomy_contact.observations[0].evidence_ids=['shot-0-mid'];save(reviewFile,review);await assert.rejects(verify,/continuous clip/);
});


test('custom-render picture planning rejects renamed reference resources before picture evidence',t=>{
  const f=fixture(t),copy=path.join(f.dir,'claimed-new-art.png');
  fs.copyFileSync(new URL('../assets/b4/reference-04-street.png',import.meta.url),copy);
  f.p.shots[0].layers[0].path='claimed-new-art.png';f.p.picture_motion.shots[0].reuse_reason='Author claims permission';
  assert.throws(()=>planB4Picture(f.p),/B4 asset origin:.*style_reference street/);
});
test('actual source movie is origin checked by both evidence build and review verification',async t=>{
  const f=fixture(t),source=path.join(f.dir,'claimed-new-output.mp4'),out=path.join(f.dir,'evidence');fs.mkdirSync(out);
  fs.copyFileSync(new URL('../assets/b4/portrait-opening-approved.mp4',import.meta.url),source);
  const args={file:source,draw:f.draw,picture:f.picture,out,projectFingerprint:f.p.fingerprint};
  await assert.rejects(()=>buildB4PictureEvidence(f.p,args),/B4 asset origin:.*approved_showcase portrait-opening-video/);
  await assert.rejects(()=>verifyB4PictureReview(f.p,{...args,evidenceDir:out,reviewFile:path.join(f.dir,'not-needed.json')}),/B4 asset origin:.*approved_showcase portrait-opening-video/);
});
