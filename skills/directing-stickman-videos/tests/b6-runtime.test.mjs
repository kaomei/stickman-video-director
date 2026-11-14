import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT, FFMPEG, probe} from '../scripts/autopilot-core.mjs';
import {STYLES} from '../scripts/autopilot-core.mjs';
import {initB6, loadB6, runB6, checkPack, checkApproval, sha} from '../scripts/b6-dynamic-meme.mjs';
import * as tools from '../scripts/b6-scene.mjs';
import {frame} from '../assets/b6/starter/scene.mjs';

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'b6-runtime-'));
after(()=>fs.rmSync(tmp,{recursive:true,force:true}));
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const save=(f,v)=>fs.writeFileSync(f,JSON.stringify(v,null,2)+'\n');
const edit=(f,fn)=>{const v=read(f);fn(v);save(f,v);};
const run=(...args)=>spawnSync(process.execPath,[path.join(ROOT,'scripts/autopilot.mjs'),...args],{encoding:'utf8'});
const project=name=>{const dir=path.join(tmp,name);initB6(dir,'both','blocking-calibration');return dir;};

test('B6 pack retains fingerprinted painted sources and explicit creative-review status',()=>{
  const q=checkPack();assert.equal(q.ok,true);assert(q.files>=39);
  assert.match(q.note,/not creative approval/);
});

test('shared init selects a dedicated B6 renderer and requires a native format',()=>{
  const missing=path.join(tmp,'missing-ratio');
  assert.throws(()=>initB6(missing),/requires --ratio/);assert(!fs.existsSync(missing));
  const dir=path.join(tmp,'shared');const r=run('init',dir,'--style','B6','--ratio','both','--example','blocking-calibration');
  assert.equal(r.status,0,r.stderr);
  assert.equal(read(path.join(dir,'project.json')).renderer,'b6-painted-world-v1');
  assert.equal(read(path.join(dir,'project.json')).purpose,'diagnostic');
  assert.equal(read(path.join(dir,'project.json')).technical_fixture,true);
  assert(!STYLES.includes('B6'),'B6 must not become a generic B1–B4 alias');
  assert.throws(()=>initB6(dir,'both'),/exists/);
  assert.throws(()=>initB6(path.join(ROOT,'b6-should-not-write'),'both'),/outside/);
  const validate=run('validate',dir,'--ratio','16:9','--visual-only');
  assert.equal(validate.status,0,validate.stderr);assert.equal(JSON.parse(validate.stdout).ratio,'16:9');
});

test('landscape and portrait have independent composition, timing, staging and cameras',()=>{
  const dir=project('native'),l=loadB6(dir,'16:9',{visualOnly:true}),p=loadB6(dir,'9:16',{visualOnly:true});
  assert.deepEqual([l.plan.width,l.plan.height],[1280,720]);assert.deepEqual([p.plan.width,p.plan.height],[720,1280]);
  assert.notDeepEqual(l.plan.shots.map(s=>s.end),p.plan.shots.map(s=>s.end));
  assert.notDeepEqual(l.plan.shots[0].staging,p.plan.shots[0].staging);
  assert.notDeepEqual(l.plan.shots[0].camera,p.plan.shots[0].camera);
  assert.throws(()=>loadB6(dir,'both',{visualOnly:true}),/exactly one/);
  edit(path.join(dir,'formats/portrait.json'),v=>{v.native_design='16:9';});
  assert.throws(()=>loadB6(dir,'9:16',{visualOnly:true}),/Native storyboard/);
  assert.doesNotThrow(()=>loadB6(dir,'16:9',{visualOnly:true}));
});

test('native validation rejects unexplained flashes and non-project asset escapes',()=>{
  const dir=project('boundaries'),f=path.join(dir,'formats/landscape.json'),original=read(f);
  edit(f,v=>{v.shots[0].end=.5;v.shots[0].camera.keys=[v.shots[0].camera.keys[0]];v.shots[1].start=.5;});
  assert.throws(()=>loadB6(dir,'16:9',{visualOnly:true}),/sub-0.9s/);save(f,original);
  const escape=path.join(tmp,'outside.png');fs.copyFileSync(path.join(dir,'paint/letter.png'),escape);
  fs.symlinkSync(escape,path.join(dir,'escape.png'));
  edit(path.join(dir,'project.json'),v=>{v.assets.letter='escape.png';});
  assert.throws(()=>loadB6(dir,'16:9',{visualOnly:true}),/inside the project/);
});

test('a scoped native preview excludes later assets and other-format edits from its fingerprint',()=>{
  const dir=project('scope'),f=path.join(dir,'formats/landscape.json');
  const options={visualOnly:true,rangeEnd:2};const before=loadB6(dir,'16:9',options).fingerprint;
  edit(f,v=>{v.shots[2].assets=['not-yet-produced'];v.shots[2].composition+=' Future scene not yet drawn.';});
  edit(path.join(dir,'formats/portrait.json'),v=>{v.shots[0].camera.keys[0].x=13;});
  assert.equal(loadB6(dir,'16:9',options).fingerprint,before);
  assert.throws(()=>loadB6(dir,'16:9',{visualOnly:true}),/Missing declared painted asset/);
  edit(f,v=>{v.shots[0].camera.keys[0].x+=10;});
  assert.notEqual(loadB6(dir,'16:9',options).fingerprint,before);
});

test('scaffolds cannot become production and executable scene code requires explicit trust',async()=>{
  const dir=project('trust'),out=path.join(dir,'denied');
  assert.throws(()=>loadB6(dir,'16:9'),/not production-ready/);
  await assert.rejects(runB6('frames',[dir,'--ratio','16:9','--output',out]),/trusted-code/);
  assert(!fs.existsSync(out));
});

test('painted actors keep uniform image scale and camera parallax follows world depth',()=>{
  const c={x:0,y:0,z:0,fov:45};
  const near=tools.projectPoint({x:0,y:0,z:1000},{...c,x:100},1280,720);
  const far=tools.projectPoint({x:0,y:0,z:2000},{...c,x:100},1280,720);
  assert(Math.abs((640-near.x)/(640-far.x)-2)<1e-10);
  assert.equal(tools.projectPoint({x:0,y:0,z:-10},c,1280,720),null);
  const ctx={save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(...a){this.args=a;}};
  tools.sprite(ctx,{width:200,height:300},50,50,100);
  assert.equal(ctx.args[3],100);assert.equal(ctx.args[4],150);
});

test('fixed bones, world-distance feet and wheels remain independent of screen camera movement',()=>{
  const root=[-37,-598],target=[140,-525],elbow=tools.solveTwoBone(root,target,170,170);
  assert(Math.abs(Math.hypot(elbow[0]-root[0],elbow[1]-root[1])-170)<1e-9);
  assert(Math.abs(Math.hypot(elbow[0]-target[0],elbow[1]-target[1])-170)<1e-9);
  assert.throws(()=>tools.solveTwoBone([0,0],[400,0],170,170),/Unreachable/);
  for(const distance of [0,5,20,40])assert(Math.abs(distance+tools.walkFoot(distance).x-55)<1e-9,'stance foot stays fixed in world');
  assert.equal(tools.walkFoot(0).contact,'heel');assert.equal(tools.walkFoot(40).contact,'flat');assert.equal(tools.walkFoot(90).contact,'toe');assert.equal(tools.walkFoot(130).contact,'swing');
  assert.equal(tools.wheelAngle(200,50),4);
  assert.deepEqual([2.9,3,3.3,3.6,3.7].map(t=>tools.handoffState(t,3,3.6)),['giver','both','both','both','receiver']);
});

test('limb bindings reject malformed geometry and preserve authored elbow sides through a reach',()=>{
  for(const bend of [0,2,-2,NaN,Infinity])
    assert.throws(()=>tools.solveTwoBone([0,0],[100,50],100,80,bend),/authored side/);
  for(const root of [[NaN,0],[0,Infinity],[0],null])
    assert.throws(()=>tools.solveTwoBone(root,[100,50],100,80),/Finite limb/);
  for(const length of [0,-1,NaN,Infinity])
    assert.throws(()=>tools.solveTwoBone([0,0],[100,50],length,80),/positive fixed lengths/);
  assert.throws(()=>tools.solveTwoBone([0,0],[NaN,50],100,80),/Finite limb/);
  for(const bend of [-1,1])for(let i=0;i<120;i++) {
    const angle=i*Math.PI/60,root=[31,-48],distance=35+i;
    const target=[root[0]+Math.cos(angle)*distance,root[1]+Math.sin(angle)*distance];
    const elbow=tools.solveTwoBone(root,target,100,80,bend);
    assert(Math.abs(Math.hypot(elbow[0]-root[0],elbow[1]-root[1])-100)<1e-9);
    assert(Math.abs(Math.hypot(elbow[0]-target[0],elbow[1]-target[1])-80)<1e-9);
    const cross=(target[0]-root[0])*(elbow[1]-root[1])-(target[1]-root[1])*(elbow[0]-root[0]);
    assert.equal(Math.sign(cross),bend);
  }
});

test('the example letter and both wrists share exact contact coordinates in each native layout',()=>{
  for(const name of ['landscape','portrait']) {
    const plan=read(path.join(ROOT,`assets/b6/starter/${name}.json`));
    for(let i=0;i<180;i++) {
      const t=i/30,actors=[];let paper;
      const capture={...tools,paintedWorld(){},paintedActor(ctx,images,a){actors.push(a);},billboard(ctx,image,p){if(image==='letter')paper=p;}};
      frame({ctx:{fillRect(){}},t,plan,images:{letter:'letter'},tools:capture,width:plan.width,height:plan.height});
      for(const a of actors) {
        const shoulders=a.kind==='buyer'?[[-120,-535],[53,-535]]:a.view==='side'?[[-72,-606],[40,-606]]:[[-37,-598],[133,-623]];
        for(let arm=0;arm<2;arm++)assert.doesNotThrow(()=>tools.solveTwoBone(shoulders[arm],a.wrists[arm],170,170));
      }
      if(t>=3&&t<=3.6) {
        const h=actors.find(a=>a.kind==='hero'),b=actors.find(a=>a.kind==='buyer');
        assert(Math.abs(h.x+h.wrists[1][0]-(paper.x-40))<1e-8);
        assert(Math.abs(b.x+b.wrists[0][0]-(paper.x+40))<1e-8);
        assert.equal(h.y-h.wrists[1][1],paper.y);assert.equal(b.y-b.wrists[0][1],paper.y);
      }
    }
  }
});

test('real encodes preserve input audio, native dimensions and timed caption sidecars; test fixtures cannot be approved',async()=>{
  const dir=project('codec'),pf=path.join(dir,'project.json'),audio=path.join(dir,'technical-silence.wav');
  const synth=spawnSync(FFMPEG,['-v','error','-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t','6',audio],{encoding:'utf8'});
  assert.equal(synth.status,0,synth.stderr);const audioHash=sha(audio);
  // Explicit synthetic technical fixture, never a story/art/user approval.
  edit(pf,v=>{v.fps=4;v.stage='authored';v.technical_fixture=true;v.voice.path='technical-silence.wav';v.voice.sha256=audioHash;v.review={drawing:'Technical fixture only',acting:'Technical fixture only',sound:'Synthetic silence, technical only'};});
  edit(path.join(dir,'story.json'),v=>{v.narration='Technical codec fixture.';v.approval='Synthetic test fixture only; not user creative approval';});
  for(const [name,width,height] of [['landscape',320,180],['portrait',180,320]]) {
    edit(path.join(dir,`formats/${name}.json`),v=>{const scale=width/v.width;v.width=width;v.height=height;for(const k of Object.keys(v.caption))v.caption[k]*=scale;});
    save(path.join(dir,`formats/${name}-captions.json`),[{start:0,end:2,text:'Technical'},{start:2,end:4,text:'codec'},{start:4,end:6,text:'fixture.'}]);
  }
  assert.doesNotThrow(()=>loadB6(dir,'16:9'));
  const cf=path.join(dir,'formats/landscape-captions.json'),cues=read(cf);
  for(const bad of [[{start:0,end:6,text:'Technical\ncodec fixture.'}],[{start:0,end:4,text:'Technical'},{start:3,end:6,text:'codec fixture.'}],[{start:0,end:6,text:'Wrong narration.'}],[{start:0,end:6,text:'This is far too long to fit this single caption line without any per-cue shrinking.'}]]) {
    save(cf,bad);assert.throws(()=>loadB6(dir,'16:9'),/caption|Caption|captions/);
  }
  save(cf,cues);edit(pf,v=>{v.voice.speed=1.1;});assert.throws(()=>loadB6(dir,'16:9'),/retime/);edit(pf,v=>{delete v.voice.speed;v.voice.sha256='bad';});assert.throws(()=>loadB6(dir,'16:9'),/SHA-256/);edit(pf,v=>{v.voice.sha256=audioHash;});
  for(const ratio of ['16:9','9:16']) {
    const out=path.join(dir,ratio==='16:9'?'preview-L':'preview-P');
    const result=await runB6('preview',[dir,'--ratio',ratio,'--start','2','--seconds','2','--output',out,'--trusted-code']);
    const report=read(result.report),video=probe(result.video).streams.find(s=>s.codec_type==='video');
    assert.equal(report.technical_fixture,true);assert.equal(report.purpose,'diagnostic');assert.equal(report.delivery_ready,false);
    assert.equal(report.technical.decoded,true);assert.equal(report.technical.audio_speed,1);
    assert.deepEqual([video.width,video.height],ratio==='16:9'?[320,180]:[180,320]);
    assert.equal(+video.nb_frames,8);assert(Math.abs(report.technical.duration-2)<.15);
    assert.equal(sha(result.video),report.video_sha256);assert.equal(sha(audio),audioHash);
    assert.equal(fs.readFileSync(path.join(out,'captions.srt'),'utf8'),'1\n00:00:00,000 --> 00:00:02,000\ncodec\n');
    assert.match(fs.readFileSync(path.join(out,'captions.vtt'),'utf8'),/00:00:00\.000 --> 00:00:02\.000/);
    // Removing every editable marker/relabeling stage and reviews must not upgrade a legacy renderer.
    edit(pf,v=>{delete v.technical_fixture;delete v.purpose;v.stage='authored';v.review={drawing:'Reviewed',acting:'Reviewed',sound:'Reviewed'};});
    await assert.rejects(runB6('approve',[dir,'--ratio',ratio,'--report',result.report,'--note','Technical test must remain unapproved']),/technical-only/);
    assert(!fs.existsSync(path.join(out,'approval.json')));
    await assert.rejects(runB6('preview',[dir,'--ratio',ratio,'--seconds','2','--output',out,'--trusted-code']),/new project-local/);
  }
  // A forged old-style report/approval does not bypass the renderer boundary either.
  const fakeReport=path.join(dir,'forged-report.json'),fakeApproval=path.join(dir,'forged-approval.json');
  save(fakeReport,{kind:'preview',technical_fixture:false});save(fakeApproval,{note:'Reviewed'});
  assert.throws(()=>checkApproval(loadB6(dir,'16:9'),fakeReport,fakeApproval),/technical-only/);
  const denied=path.join(dir,'full-denied');
  await assert.rejects(runB6('render',[dir,'--ratio','16:9','--output',denied,'--trusted-code']),/technical-only/);assert(!fs.existsSync(denied));
});
