import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {ROOT,initB5,checkBaseline} from '../scripts/character-explainer.mjs';
const require=createRequire(import.meta.url),sharp=require('sharp');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'b5-test-'));
const run=(script,...args)=>spawnSync(process.execPath,[path.join(ROOT,'scripts',script),...args],{encoding:'utf8'});
test('B5 baseline preserves the approved full film, encoded audio, captions and all-frame arm geometry',()=>{const q=checkBaseline();assert.equal(q.ok,true);assert.equal(q.duration,22.8);assert.equal(q.geometry_frames,684)});
test('B5 installs a self-contained external scaffold and refuses overwrites',()=>{const p=path.join(tmp,'project');initB5(p);assert.equal(JSON.parse(fs.readFileSync(path.join(p,'project.json'))).style,'B5');assert.throws(()=>initB5(p),/exists/);assert.throws(()=>initB5(path.join(ROOT,'should-not-write')),/outside/);assert(!fs.existsSync(path.join(ROOT,'should-not-write')))});
test('shared init selects B5 without aliasing it to the manifest renderer',()=>{const p=path.join(tmp,'shared');const r=run('autopilot.mjs','init',p,'--style','B5');assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(fs.readFileSync(path.join(p,'project.json'))).renderer,'character-explainer-code-v1');const render=run('autopilot.mjs','render',path.join(p,'project.json'));assert.notEqual(render.status,0);assert.match(render.stderr,/code-authored route/)});
test('local scene code requires explicit trust and creates no output on denial',()=>{const out=path.join(tmp,'untrusted');const r=run('character-explainer.mjs','frames',path.join(tmp,'project'),'--output',out,'--frames','0');assert.notEqual(r.status,0);assert.match(r.stderr,/trusted-code/);assert(!fs.existsSync(out))});
test('selected frames differ from approved source only by removing historical account branding',async()=>{
 const out=path.join(tmp,'frames'),r=run('character-explainer.mjs','frames',path.join(tmp,'project'),'--output',out,'--frames','0,128,390,580','--trusted-code');assert.equal(r.status,0,r.stderr);
 const paper=fs.readFileSync(path.join(ROOT,'assets/b5/example/assets/paper.png')).toString('base64');
 // The historical tile has transparent padding overlapping the title area.
 // Repair only pixels touched by its ink, never the whole image rectangle.
 const clean=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="#EBE7E1"/><image width="1920" height="1080" href="data:image/png;base64,${paper}" opacity=".48"/></svg>`)).ensureAlpha().raw().toBuffer();
 const mark=await sharp(path.join(ROOT,'assets/b5/example/assets/type/76f97013f418fb21ec.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(const f of [0,128,390,580]){
  const actual=await sharp(path.join(out,String(f).padStart(6,'0')+'.png')).ensureAlpha().raw().toBuffer();
  const expected=await sharp(path.join(ROOT,'assets/b5/reference',String(f).padStart(4,'0')+'.png')).ensureAlpha().raw().toBuffer();
  for(let y=0;y<mark.info.height;y++)for(let x=0;x<mark.info.width;x++)if(mark.data[(y*mark.info.width+x)*4+3]){
   const i=((y+46)*1920+x+96)*4;clean.copy(expected,i,i,i+4);
  }
  assert(actual.equals(expected),'frame '+f+' must preserve every non-branding pixel');
 }
 assert.equal(JSON.parse(fs.readFileSync(path.join(out,'frames.json'))).complete,false);
});
test('new B5 scaffolds have no account watermark or creator-handle tile by default',()=>{
 const scene=path.join(tmp,'project/scene'),config=JSON.parse(fs.readFileSync(path.join(scene,'config.json'))),atlas=JSON.parse(fs.readFileSync(path.join(scene,'font-atlas.json')));
 assert.equal(config.account,'');assert(!Object.keys(atlas).some(k=>k.includes('@')));
 const contract=fs.readFileSync(path.join(ROOT,'references/b5-character-explainer.md'),'utf8');
 assert.match(contract,/No account watermark or test label by default/);assert.match(contract,/only when the user explicitly requests/);
 const cfg=require(path.join(scene,'config.json')),renderer=require(path.join(scene,'renderer.cjs'));
 delete cfg.account;assert.doesNotThrow(()=>renderer.frame(0));
});
test('B5 rejects incomplete frame sequences before encoding and does not overwrite output',()=>{const out=path.join(tmp,'delivery');const r=run('character-explainer.mjs','encode',path.join(tmp,'project'),'--frames-dir',path.join(tmp,'frames'),'--audio',path.join(ROOT,'assets/b5/approved-sample.mp4'),'--output',out,'--approval-note','Technical negative fixture only');assert.notEqual(r.status,0);assert.match(r.stderr,/Full sequence required/);assert(!fs.existsSync(out))});
test('B5 contract scopes multi-line captions, recognition approval and no abstract anxiety circles',()=>{const motion=fs.readFileSync(path.join(ROOT,'references/b5-avatar-motion.md'),'utf8'),contract=fs.readFileSync(path.join(ROOT,'references/b5-character-explainer.md'),'utf8');assert.match(motion,/up to three semantic lines/);assert.match(motion,/No meaningless anxiety bubbles/);assert.match(motion,/static approval before rigging/);assert.match(contract,/not phoneme-accurate/);assert.match(contract,/not a finished new-topic video/)});
test('B5 encoder completes a tiny technical round-trip without re-rendering the approved film',async()=>{
 const crypto=await import('node:crypto'),sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
 const project=path.join(tmp,'encode-fixture');initB5(project);
 const cfg={width:320,height:180,fps:2,duration:1};fs.writeFileSync(path.join(project,'scene/config.json'),JSON.stringify(cfg));
 const listing=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const f=path.join(d,e.name);return e.isDirectory()?listing(f):[f]});
 const fingerprint=crypto.createHash('sha256').update(listing(project).sort().map(f=>path.relative(project,f)+':'+sha(f)).join('\n')).digest('hex');
 const frames=path.join(tmp,'encode-frames');fs.mkdirSync(frames);
 for(const i of [0,1])await sharp({create:{width:320,height:180,channels:3,background:i?'white':'black'}}).png().toFile(path.join(frames,String(i).padStart(6,'0')+'.png'));
 fs.writeFileSync(path.join(frames,'frames.json'),JSON.stringify({style:'B5',project:fs.realpathSync(project),input_sha256:fingerprint,frames:[0,1],complete:true,config:cfg,files:[0,1].map(i=>{const name=String(i).padStart(6,'0')+'.png';return {name,sha256:sha(path.join(frames,name))}})}));
 const audio=path.join(tmp,'technical-silence.wav');const synth=spawnSync(process.env.FFMPEG||'ffmpeg',['-v','error','-f','lavfi','-i','anullsrc=r=48000:cl=stereo','-t','1',audio],{encoding:'utf8'});assert.equal(synth.status,0,synth.stderr);
 const output=path.join(tmp,'encoded');const args=['encode',project,'--frames-dir',frames,'--audio',audio,'--output',output];
 const denied=run('character-explainer.mjs',...args);assert.notEqual(denied.status,0);assert.match(denied.stderr,/genuine current user approval/);assert(!fs.existsSync(output));
 const r=run('character-explainer.mjs',...args,'--approval-note','Technical fixture within the authorized B5 release validation; not approval of a new creative film.');assert.equal(r.status,0,r.stderr);
 const delivery=JSON.parse(fs.readFileSync(path.join(output,'delivery.json')));assert.equal(delivery.full_decode,'pass');assert.equal(delivery.output_sha256,sha(path.join(output,'video.mp4')));const video=delivery.metadata.streams.find(s=>s.codec_type==='video');assert.equal(video.width,320);assert.equal(video.height,180);assert.equal(+video.nb_frames,2);
});
