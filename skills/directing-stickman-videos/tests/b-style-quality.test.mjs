import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT, FFMPEG, run, save, loadProject, hashFile} from '../scripts/autopilot-core.mjs';
import {painter, render} from '../scripts/autopilot-render.mjs';
import {CAPTION_PRESETS, checkBStyleMotionPaint} from '../scripts/b-style-quality.mjs';

function fixture(t, style) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b-quality-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  for (const [name, hz] of [['voice',440], ['bed',880], ['effect',1320], ['role',1760]])
    run(FFMPEG, ['-v','error','-f','lavfi','-i',`sine=frequency=${hz}:duration=4`,'-y',path.join(dir,name+'.wav')]);
  const project = {version:1,style,width:640,height:360,fps:12,grid:false,television:style==='B3'?{enabled:false}:undefined,
    voice:{path:'voice.wav'},captions:[{start:0,end:4,text:'One coherent phrase.'}],
    shots:[{start:0,end:4,layers:[{id:'prop',type:'image',path:'@b1/idea-bulb-crayon.png',x:300,y:100,w:180,
      motion:{role:'prop',reason:'Synthetic engineering prop moves; not creative acceptance'},keys:[{t:0,x:300},{t:4,x:500}]}]}],
    ambience:[{path:'bed.wav',start:0,end:4,gain:.1}],
    dialogue:[{path:'role.wav',time:.6,duration:.4,gain:.4,role:'synthetic role'}],
    sfx:[{kind:'file',path:'effect.wav',time:1.6,duration:1.2,gain:.4}],
    audio_cuts:[{start:2,end:2.5,reason:'Synthetic cut test',return_trigger:'Prop settles'}]};
  const file=path.join(dir,'project.json'), write=()=>save(file,project); write();
  return {dir,project,file,write};
}
function spectrum(file, start, hz) {
  const r=spawnSync(FFMPEG,['-v','error','-i',file,'-ss',String(start),'-t','0.15','-ac','1','-ar','48000','-f','f32le','-'],{maxBuffer:1e6});
  assert.equal(r.status,0,r.stderr.toString()); let re=0,im=0; const n=r.stdout.length/4;
  for(let i=0;i<n;i++){const v=r.stdout.readFloatLE(i*4),p=2*Math.PI*hz*i/48000;re+=v*Math.cos(p);im+=v*Math.sin(p)}
  return Math.hypot(re,im)*2/n;
}
for (const style of ['B1','B2','B3']) {
  test(`${style} rejects static/no-op/title/camera-only motion and off-style captions`, async t => {
    const f=fixture(t,style), original=structuredClone(f.project), layer=()=>f.project.shots[0].layers[0];
    const reset=()=>{Object.assign(f.project,structuredClone(original));};
    layer().keys=[]; f.write(); assert.throws(()=>loadProject(f.file),/inactive/);
    reset(); layer().keys[1].x=300; f.write(); assert.throws(()=>loadProject(f.file),/inactive/);
    reset(); layer().type='text'; layer().text='FAKE MOTION'; f.write(); assert.throws(()=>loadProject(f.file),/do not count/);
    reset(); layer().w=1280; f.write(); assert.throws(()=>loadProject(f.file),/full-frame/);
    reset(); layer().motion.camera=true; f.write(); assert.throws(()=>loadProject(f.file),/do not count/);
    reset(); f.project.captionFont=path.join(ROOT,'assets/fonts/Caveat.ttf'); f.write(); assert.throws(()=>loadProject(f.file),/caption preset/);
    f.project.caption_override={kind:'language_fallback',language:'zh-CN',reason:'Synthetic coverage check only; not production approval'};
    f.write(); assert.throws(()=>loadProject(f.file),/actual missing glyphs/);
    f.project.captions[0].text='不要出警'; f.write();
    // A real default-font gap permits the fallback request, but a replacement
    // lacking those glyphs must still fail before any pixels are rendered.
    assert.equal(loadProject(f.file).captionFont,f.project.captionFont);
    await assert.rejects(painter(loadProject(f.file)),/caption.*lacks glyphs/);
    f.project.captionSize=20;f.write();assert.throws(()=>loadProject(f.file),/caption preset/);
    f.project.captions[0].text='One coherent phrase.';
    delete f.project.captionFont;delete f.project.caption_override;f.project.captionSize=CAPTION_PRESETS[style];f.write();
    const p=loadProject(f.file),draw=await painter(p),e=await checkBStyleMotionPaint(p,draw);
    assert.ok(e.intervals[0].changed_pixels>=8);
  });
  test(`${style} rejects invisible/offscreen/fake-render movement`, async t => {
    const f=fixture(t,style),layer=f.project.shots[0].layers[0];
    layer.alpha=0;f.write();let p=loadProject(f.file);await assert.rejects(checkBStyleMotionPaint(p,await painter(p)),/pixel change/);
    layer.alpha=1;layer.y=-1000;f.write();p=loadProject(f.file);await assert.rejects(checkBStyleMotionPaint(p,await painter(p)),/pixel change/);
    layer.y=100;f.write();p=loadProject(f.file);
    await assert.rejects(checkBStyleMotionPaint(p,()=>({data:()=>Buffer.alloc(64)})),/pixel change/);
  });
  test(`${style} encodes file SFX, quiet bed, role and motivated cut without changing native voice`, async t => {
    const f=fixture(t,style),before=hashFile(path.join(f.dir,'voice.wav'));
    const report=await render(loadProject(f.file));
    assert.equal(report.full_decode,'pass');assert.equal(report.original_voice_sha256,before);
    assert.equal(hashFile(path.join(f.dir,'voice.wav')),before);
    assert.deepEqual(report.audio_tracks,{ambience:1,dialogue:1,file_sfx:1,cuts:1});
    assert.ok(report.local_motion.intervals[0].changed_pixels>=8);
    assert.ok(spectrum(report.output,.2,440)>.1);assert.ok(spectrum(report.output,.2,880)>.009);
    assert.ok(spectrum(report.output,.75,1760)>.04);assert.ok(spectrum(report.output,1.7,1320)>.04);
    assert.ok(spectrum(report.output,2.15,440)>.1);assert.ok(spectrum(report.output,2.15,880)<.001);
    assert.ok(spectrum(report.output,2.15,1320)<.001);
    f.project.voice.contains_sfx=true;f.write();assert.throws(()=>loadProject(f.file),/duplicate/);
    f.project.ambience=[];f.project.dialogue=[];f.project.sfx=[];f.project.audio_cuts=[];f.write();
    assert.equal(loadProject(f.file).voice.contains_sfx,true);
    f.project.voice.contains_sfx=false;f.write();assert.throws(()=>loadProject(f.file),/continuous ambience/);
  });
}
test('motion does not claim coverage outside its actual visibility or the preview range', t => {
  const f=fixture(t,'B1'),l=f.project.shots[0].layers[0];l.from=3;f.write();
  assert.throws(()=>loadProject(f.file),/inactive/);
  delete l.from;f.write();assert.doesNotThrow(()=>loadProject(f.file,{seconds:1}));
  l.id='';f.write();assert.throws(()=>loadProject(f.file),/unique layer id/);
});
