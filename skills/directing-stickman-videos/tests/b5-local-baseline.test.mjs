import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';

const require=createRequire(import.meta.url),root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=path.join(root,'assets/b5/local-baselines/jensen-v13'),scene=path.join(base,'scene');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const lock=read(path.join(base,'baseline-lock.json')),contract=read(path.join(base,'acceptance.json'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const list=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(path.join(d,e.name)):[path.join(d,e.name)]);
const manifestKey=(dir,file,api=path)=>api.relative(dir,file).split(api.sep).join('/');
function assertLocalEntry(entry,api=path){
  assert(!api.isAbsolute(entry));
  assert(!entry.split(api.sep).includes('..'));
  assert(!entry.replaceAll('\\','/').split('/').includes('..'));
}

test('B5 lock comparison uses manifest separators without rewriting POSIX filenames',()=>{
  for(const api of [path.posix,path.win32]){
    const dir=api.resolve('baseline');
    assert.equal(manifestKey(dir,api.join(dir,'scene','renderer.cjs'),api),'scene/renderer.cjs');
  }
  assert.equal(manifestKey('/baseline','/baseline/literal\\name.cjs',path.posix),'literal\\name.cjs');
});

test('B5 manifest entries retain native containment checks and reject mixed parent traversal',()=>{
  for(const api of [path.posix,path.win32]){
    assert.doesNotThrow(()=>assertLocalEntry('scene/assets/fonts/Anton-0.ttf',api));
    for(const entry of ['../escape','scene/../../escape','..\\escape','scene\\../escape','scene/..\\escape']){
      assert.throws(()=>assertLocalEntry(entry,api),entry);
    }
    assert.throws(()=>assertLocalEntry(api.resolve('absolute'),api));
  }
});

test('Jensen baseline has an exact closed lock, explicit B5 release approval and bounded rights claims',()=>{
  assert.equal(contract.publication_authorized,true);assert.equal(contract.public_rights_cleared,false);
  assert.match(contract.publication_approval,/2026-11-10/);
  assert.match(contract.rights_review_scope,/Finished editorial composite/);
  assert.equal(lock.video_sha256,'b46c272512277096d7cc3f85a435d52d4657887c68050b15ec555071fd8da387');
  const actual=list(base).map(p=>manifestKey(base,p)).filter(p=>p!=='baseline-lock.json').sort();
  assert.deepEqual(actual,lock.files.map(f=>f.path).sort());
  for(const f of lock.files){assertLocalEntry(f.path);assert.equal(sha(path.join(base,f.path)),f.sha256,f.path);}
  assert.equal(sha(path.join(base,'approved-sample.mp4')),lock.video_sha256);
});

test('portable scene has no parent-project paths, network or process execution',()=>{
  for(const p of list(scene).filter(p=>p.endsWith('.cjs'))){
    const s=fs.readFileSync(p,'utf8');
    assert(!/\/Users\/|jensen-news-|child_process|process\.env|fetch\(/.test(s),path.basename(p));
    for(const m of s.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)){
      const dep=path.resolve(path.dirname(p),m[1]);
      assert(dep.startsWith(scene+path.sep),m[1]);assert(fs.existsSync(dep),m[1]);
    }
  }
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'b5-jensen-local-'));
  try{
    const portable=path.join(tmp,'scene');fs.cpSync(scene,portable,{recursive:true});
    const local=require(path.join(scene,'renderer.cjs')),moved=require(path.join(portable,'renderer.cjs'));
    for(const t of [0,.8,6.9,9.6,15.5,26.8,33.5,44.8,59.9,63.5]){
      const a=local.frame(t),b=moved.frame(t);assert(a.equals(b),'portable output '+t);
      assert(a.equals(local.frame(t)),'deterministic seek '+t);
      assert(!/NaN|Infinity/.test(a.toString().replace(/data:[^"]+/g,'')),'finite SVG '+t);
    }
  }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});

test('all 1906 presenter states retain requested sadness with varied crying, not a frozen face',()=>{
  const {expression}=require(path.join(scene,'presenter-new.cjs'));
  const states=[];
  for(let n=0;n<contract.video.frames;n++){
    const e=expression(n/30);assert(e.frown>=contract.presenter.all_frame_frown_min,'frown frame '+n);
    assert(e.eyes<=contract.presenter.all_frame_eyes_max&&e.eyes>0,'eyes frame '+n);
    assert(Object.values(e).every(Number.isFinite));assert(e.cry>=0&&e.cry<=1);states.push(e);
  }
  assert(Math.max(...states.map(e=>e.cry))>.9);assert(Math.min(...states.map(e=>e.cry))<.05);
  assert(new Set(states.map(e=>e.frown.toFixed(3)+':'+e.tilt.toFixed(3))).size>300);
  assert.equal(contract.presenter.inherit_tears_or_sadness_in_new_stories,false);
});

test('full-timeline stage retains normal bone lengths and exact shared grips',t=>{
  const stage=require(path.join(scene,'stage-layout.cjs'));
  let maxBone=0,maxGrip=0,actors=0,grips=0;
  for(let n=0;n<contract.video.frames;n++){
    const time=n/30,svg=stage.draw(time,{title:()=>'',imageTile:()=>''});
    assert(!/NaN|Infinity/.test(svg),'stage frame '+n);
    for(const actor of stage.inspected(time)){
      actors++;
      for(const [i,chain] of [...actor.arms,...actor.legs].entries()){
        const lengths=i<2?[86,84]:[80,80];
        for(let k=0;k<2;k++)maxBone=Math.max(maxBone,Math.abs(Math.hypot(chain[k+1][0]-chain[k][0],chain[k+1][1]-chain[k][1])-lengths[k]));
      }
    }
    for(const c of stage.contacts()){grips++;maxGrip=Math.max(maxGrip,Math.hypot(c.hand_world[0]-c.prop_world[0],c.hand_world[1]-c.prop_world[1]));}
  }
  assert(actors>1906&&grips>100);assert(maxBone<1e-6);assert(maxGrip<1e-6);
  t.diagnostic(JSON.stringify({frames:1906,actors,grips,maxBoneError:maxBone,maxGripError:maxGrip}));
});

test('caption indices cover each spoken word once and untitled shots use fixed shot framing',()=>{
  const config=read(path.join(scene,'config.json')),words=read(path.join(scene,'word-timings.json')).words,groups=read(path.join(scene,'caption-groups.json'));
  assert.equal(config.account,'');assert.equal(config.width,1920);assert.equal(config.height,1080);
  assert(groups.every(g=>g.lines.length>=1&&g.lines.length<=3));
  assert.deepEqual(groups.flatMap(g=>g.lines.flat()),words.map((_,i)=>i));
  for(let i=0;i<words.length;i++){assert(words[i].end>words[i].start);if(i)assert(words[i].start>=words[i-1].end-1e-6);}
  const {layout}=require(path.join(scene,'stage-layout.cjs'));
  for(const [a,b] of [[4.1,6.9],[11,15.9],[31.1,34.8],[48.1,52.9]]){
    assert(layout(a).scale>1);assert.deepEqual(layout(a),layout(b),'fixed shot transform');
  }
  assert.equal(layout(25.5),null,'not every shot should be zoomed');
});

test('encoded local baseline retains accepted video metadata and exact V12 AAC',()=>{
  const video=path.join(base,'approved-sample.mp4');
  const probe=spawnSync(process.env.FFPROBE||'ffprobe',['-v','error','-show_streams','-of','json',video],{encoding:'utf8'});
  assert.equal(probe.status,0,probe.stderr);const v=JSON.parse(probe.stdout).streams.find(s=>s.codec_type==='video');
  assert.equal(v.width,1920);assert.equal(v.height,1080);assert.equal(+v.nb_frames,1906);assert.equal(v.r_frame_rate,'30/1');
  const audio=spawnSync(process.env.FFMPEG||'ffmpeg',['-v','error','-i',video,'-map','0:a:0','-c:a','copy','-f','adts','pipe:1'],{maxBuffer:16*1024*1024});
  assert.equal(audio.status,0,audio.stderr?.toString());
  assert.equal(crypto.createHash('sha256').update(audio.stdout).digest('hex'),contract.audio.adts_sha256);
});

test('sample specifics cannot become global B5 emotion, voice, identity route or publication permission',()=>{
  assert.equal(contract.audio.voice_is_global_b5_default,false);
  assert.equal(contract.audio.apply_repair_times_to_other_stories,false);
  assert.equal(contract.generalization.portrait_validated_by_this_baseline,false);
  assert.equal(contract.generalization.fixed_prop_sequence_or_facial_preset,false);
  assert.equal(contract.generalization.documentation_or_numeric_checks_are_creative_approval,false);
  const docs=fs.readFileSync(path.join(root,'references/b5-accepted-baselines.md'),'utf8');
  assert.match(docs,/cheerful new story must not inherit Jensen tears/);
  assert.match(docs,/left actors stay anonymous/);assert.match(docs,/not release authorization/);
  const route=fs.readFileSync(path.join(root,'references/b5-avatar-motion.md'),'utf8');
  assert.match(route,/When to generate an image[;,] when to code/i);
});
