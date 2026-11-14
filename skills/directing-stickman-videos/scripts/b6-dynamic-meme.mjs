#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {ROOT,FFMPEG,run,probe} from './autopilot-core.mjs';
import * as sceneTools from './b6-scene.mjs';
import {initHK,runHK,checkHKPack} from './b6-hong-kong.mjs';
import {initProduction,runProduction} from './b6-production.mjs';

const PACK=path.join(ROOT,'assets/b6'), RATIOS=['16:9','9:16'];
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
export const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const opt=(args,k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;
export function checkPack() {
  const manifest=read(path.join(PACK,'manifest.json')),records=[...manifest.assets,...(manifest.examples??[])];
  for(const a of records)if(sha(local(PACK,a.path))!==a.sha256)throw new Error(`B6 pack fingerprint mismatch: ${a.path}`);
  return {ok:true,files:records.length,hong_kong_v90:checkHKPack(),acceptance:manifest.acceptance,note:'File integrity only; not creative approval of a new story or ratio'};
}
function local(base,p) {
  if(typeof p!=='string'||!p||path.isAbsolute(p)||/^[a-z]+:/i.test(p)) throw new Error('Use project-relative local media paths');
  const resolved=path.resolve(base,p), real=fs.realpathSync(resolved);
  if(!real.startsWith(fs.realpathSync(base)+path.sep))throw new Error('Media and code must remain inside the project');
  return real;
}
export function initB6(dir,ratio,example) {
  if(example==='hong-kong-v90')return initHK(dir,ratio);
  if(!example)return initProduction(dir,ratio);
  if(example!=='blocking-calibration')throw new Error('Unknown B6 example: '+example);
  if(!RATIOS.includes(ratio)&&ratio!=='both')throw new Error('B6 requires --ratio 16:9, 9:16 or both before storyboarding');
  dir=path.resolve(dir);
  if(fs.existsSync(dir))throw new Error('Project exists; will not overwrite');
  if(dir===ROOT||dir.startsWith(ROOT+path.sep))throw new Error('Create projects outside the installed Skill');
  fs.mkdirSync(path.join(dir,'formats'),{recursive:true});
  fs.cpSync(path.join(PACK,'paint'),path.join(dir,'paint'),{recursive:true});
  fs.copyFileSync(path.join(PACK,'manifest.json'),path.join(dir,'style-lock.json'));
  fs.copyFileSync(path.join(PACK,'starter/scene.mjs'),path.join(dir,'scene.mjs'));
  fs.copyFileSync(path.join(PACK,'starter/story.json'),path.join(dir,'story.json'));
  const formats={};
  for(const r of ratio==='both'?RATIOS:[ratio]) {
    const name=r==='16:9'?'landscape':'portrait';
    fs.copyFileSync(path.join(PACK,`starter/${name}.json`),path.join(dir,`formats/${name}.json`));
    save(path.join(dir,`formats/${name}-captions.json`),[]);formats[r]=`formats/${name}.json`;
  }
  const assets=Object.fromEntries(read(path.join(PACK,'manifest.json')).assets.filter(a=>a.path.startsWith('paint/')&&a.path.endsWith('.png')).map(a=>[path.basename(a.path,'.png'),a.path]));
  save(path.join(dir,'project.json'),{version:1,style:'B6',renderer:'b6-painted-world-v1',purpose:'diagnostic',technical_fixture:true,stage:'scaffold',duration:6,fps:30,story:'story.json',scene:'scene.mjs',styleLock:'style-lock.json',voice:{provider:'ElevenLabs',name:'The Pharaoh 3 - Energetic, Lively & Cheerful',voice_id:null,path:null,sha256:null,contains_sfx:true},assets,formats,review:{drawing:null,acting:null,sound:null}});
  return {project:path.join(dir,'project.json'),formats:Object.keys(formats),purpose:'diagnostic',delivery_ready:false,stage:'Legacy blocking diagnostic only; approve/render are permanently disabled for this renderer. Use default init for a new production story.'};
}
const finite=(v,label)=>{if(!Number.isFinite(v))throw new Error(`Finite ${label} required`);};
const words=s=>s.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{Z}\s]/gu,'');
export function loadB6(input,ratio,{visualOnly=false,rangeEnd}={}) {
  if(!RATIOS.includes(ratio))throw new Error('Choose exactly one native --ratio 16:9 or 9:16 for validation/render/review');
  let file=path.resolve(input);if(fs.statSync(file).isDirectory())file=path.join(file,'project.json');
  const p=read(file),base=path.dirname(file),inputs=[];
  if(p.style!=='B6'||p.renderer!=='b6-painted-world-v1'||p.version!==1)throw new Error('B6 dedicated painted-world project required');
  finite(p.duration,'duration');if(p.duration<=0||!Number.isInteger(p.fps)||p.fps<1||p.fps>60)throw new Error('Invalid duration/fps');
  const scope=rangeEnd??p.duration;
  if(!Number.isFinite(scope)||scope<=0||scope>p.duration+.001)throw new Error('Invalid scoped timeline');
  if(!p.formats?.[ratio])throw new Error('This ratio has no separately authored native plan');
  const get=rel=>{const f=local(base,rel);inputs.push(f);return f;};
  const rawPlan=read(local(base,p.formats[ratio])),plan={...rawPlan,shots:rawPlan.shots?.filter(s=>s.start<scope)},story=read(get(p.story)),styleLock=read(get(p.styleLock)),scene=get(p.scene);
  if(styleLock.style!=='B6')throw new Error('B6 style lock required');
  if(plan.ratio!==ratio||plan.native_design!==ratio||plan.derived_from_video)throw new Error('Native storyboard/composition/camera required; no video crop/reframe alias');
  const [rw,rh]=ratio.split(':').map(Number);
  if(!Number.isInteger(plan.width)||!Number.isInteger(plan.height)||plan.width<64||plan.height<64||plan.width%2||plan.height%2||Math.abs(plan.width/plan.height-rw/rh)>.001)throw new Error('Native even output dimensions must match ratio');
  if(!plan.caption||![plan.caption.fontSize,plan.caption.stroke,plan.caption.side,plan.caption.bottom].every(n=>Number.isFinite(n)&&n>0))throw new Error('One fixed caption size and safe zone per ratio required');
  let end=0;
  if(!plan.shots?.length)throw new Error('Authored shots required');
  for(const s of plan.shots) {
    if(!s.id||!s.composition||!s.action||!s.transition||!s.camera?.intent)throw new Error('Each shot needs composition, action, camera intent and transition');
    if(!Number.isFinite(s.start)||!Number.isFinite(s.end)||Math.abs(s.start-end)>.001||s.end<=s.start)throw new Error('Shots must cover duration without gaps/overlap');
    const keys=s.camera.keys;
    if(!Array.isArray(keys)||keys.length<1||keys[0].t!==0||keys.at(-1).t>s.end-s.start+.001)throw new Error('Shot-relative camera keys required');
    let prev=-1;
    for(const k of keys) {
      for(const n of ['t','x','y','z','fov'])finite(k[n],`camera ${n}`);
      if(k.t<=prev||k.fov<20||k.fov>100)throw new Error('Camera keys must increase; FOV 20–100');prev=k.t;
      for(const n of ['yaw','pitch'])if(k[n]!==undefined)finite(k[n],`camera ${n}`);
    }
    if(s.end-s.start<.9&&!s.short_cut_reason)throw new Error('Review sub-0.9s cuts: record readability/motivation instead of an unexplained flash');
    if(!s.staging||!Object.keys(s.staging).length)throw new Error('Explicit story-specific per-shot staging required');
    for(const a of Object.values(s.staging))for(const n of ['x','y','z'])finite(a[n],`staging ${n}`);
    end=s.end;
  }
  if(end<scope-.001||end>p.duration+.001)throw new Error('Native plan must cover the requested timeline');
  const used=[...new Set(plan.shots.flatMap(s=>s.assets??[]))];
  if(!used.length||plan.shots.some(s=>!s.assets?.length))throw new Error('Declare painted asset IDs used by each shot for scoped previews');
  const assets=Object.fromEntries(used.map(k=>{if(!p.assets?.[k])throw new Error(`Missing declared painted asset ${k}`);return [k,get(p.assets[k])];}));
  if(!Object.keys(assets).length)throw new Error('Painted assets required; no vector placeholder fallback');
  const allCaptions=read(local(base,plan.captionFile));
  if(!Array.isArray(allCaptions))throw new Error('Caption array required');
  const captions=allCaptions.filter(c=>c.start<scope);
  let cueEnd=0;
  for(const c of captions) {
    if(typeof c.text!=='string'||!c.text.trim()||/[\r\n]/.test(c.text)||!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<cueEnd-.001||c.end<=c.start||c.end>p.duration+.001)throw new Error('Single-line semantic captions need ordered, non-overlapping voice times');
    cueEnd=c.end;
  }
  GlobalFonts.registerFromPath(path.join(ROOT,'assets/fonts/NotoSans.ttf'),'B6 Sans');
  const checkCtx=createCanvas(plan.width,plan.height).getContext('2d');
  if(plan.caption.side*2>=plan.width||plan.caption.bottom+plan.caption.fontSize>=plan.height)throw new Error('Caption safe zone does not fit canvas');
  for(const c of captions)sceneTools.caption(checkCtx,c,plan.caption,plan.width,plan.height);
  let audio=null;
  if(!visualOnly) {
    if(p.stage!=='authored'||!story.approval||!p.review?.drawing||!p.review?.acting||!p.review?.sound)throw new Error('Scaffold is not production-ready: record genuine story/art/action/sound review');
    const captionWords=words(captions.map(c=>c.text).join(' ')),narrationWords=words(story.narration??'');
    if(!captions.length||!narrationWords||(scope>=p.duration-.001?captionWords!==narrationWords:!narrationWords.startsWith(captionWords)))throw new Error('Captions must preserve approved narration in order; check semantic breaks against actual speech');
    if(p.voice?.speed!==undefined||p.voice?.rate!==undefined)throw new Error('Do not retime accepted speech');
    audio=get(p.voice?.path);
    if(p.voice.sha256!==sha(audio))throw new Error('Pin the actual approved audio SHA-256; do not revoice silently');
    const m=probe(audio),duration=Number(m.format?.duration);
    if(!m.streams?.some(s=>s.codec_type==='audio')||!Number.isFinite(duration)||Math.abs(duration-p.duration)>.12)throw new Error('Audio must contain the complete actual timeline at original speed');
  }
  for(const f of ['b6-dynamic-meme.mjs','b6-scene.mjs'])inputs.push(path.join(ROOT,'scripts',f));
  inputs.push(path.join(ROOT,'assets/fonts/NotoSans.ttf'));
  const fingerprints=[...new Set(inputs)].sort().map(f=>[path.relative(base,f).split(path.sep).join('/'),sha(f)]);
  const global={version:p.version,style:p.style,renderer:p.renderer,duration:p.duration,fps:p.fps,voice:p.voice,review:p.review,stage:p.stage,technical_fixture:Boolean(p.technical_fixture)};
  const fingerprint=crypto.createHash('sha256').update(JSON.stringify({ratio,visualOnly,scope,global,plan,captions,fingerprints})).digest('hex');
  return {...p,base,file,plan,story,scene,assets,captions,audio,ratio,inputs,fingerprint,visualOnly,rangeEnd:scope};
}
async function painter(p) {
  const images=Object.fromEntries(await Promise.all(Object.entries(p.assets).map(async([k,f])=>[k,await loadImage(f)])));
  GlobalFonts.registerFromPath(path.join(ROOT,'assets/fonts/NotoSans.ttf'),'B6 Sans');
  const mod=await import(pathToFileURL(p.scene).href+`?sha=${sha(p.scene)}`);
  if(typeof mod.frame!=='function')throw new Error('scene.mjs must export frame(context)');
  return async t=>{
    const canvas=createCanvas(p.plan.width,p.plan.height),ctx=canvas.getContext('2d');
    await mod.frame({canvas,ctx,t,plan:p.plan,project:p,images,tools:sceneTools,width:p.plan.width,height:p.plan.height});
    sceneTools.caption(ctx,p.captions.find(c=>c.start<=t&&t<c.end),p.plan.caption,p.plan.width,p.plan.height);
    // Intrinsic renderer label: deleting project flags cannot turn this into a deliverable.
    ctx.fillStyle='#392f2f';ctx.fillRect(0,0,canvas.width,Math.max(18,canvas.height*.035));
    ctx.fillStyle='#fff0c5';ctx.font=`bold ${Math.max(9,Math.round(canvas.height*.018))}px B6 Sans`;
    ctx.fillText('B6 DIAGNOSTIC - NOT A FINISHED STORY',7,Math.max(12,canvas.height*.024));
    return canvas;
  };
}
function output(base,requested) {
  if(!requested)throw new Error('Choose a new --output directory; existing outputs are never overwritten');
  const requestedPath=path.resolve(requested),b=fs.realpathSync(base);
  if(fs.existsSync(requestedPath))throw new Error('Use a new project-local output directory');
  // Existing ancestors may be symlinks; do not write through one into inputs/outside.
  let ancestor=path.dirname(requestedPath);while(!fs.existsSync(ancestor))ancestor=path.dirname(ancestor);
  const real=fs.realpathSync(ancestor),out=path.resolve(real,path.relative(ancestor,requestedPath));
  if(out===b||!out.startsWith(b+path.sep))throw new Error('Use a new project-local output directory; output escapes project');
  return out;
}
async function encode(args,log) {
  await new Promise((resolve,reject)=>{
    const fd=fs.openSync(log,'w'),child=spawn(FFMPEG,args,{stdio:['ignore','ignore',fd]});
    child.on('error',e=>{fs.closeSync(fd);reject(e);});child.on('exit',code=>{fs.closeSync(fd);code===0?resolve():reject(new Error(`FFmpeg failed (${code}); see ${log}`));});
  });
}
export function checkApproval(p,reportFile,approvalFile) {
  if(p.renderer==='b6-painted-world-v1')throw new Error('Legacy B6 diagnostic is technical-only: approve/render are disabled regardless of stage, fixture flags or review text');
  const report=read(reportFile),a=read(approvalFile);
  const reviewed=loadB6(p.file,p.ratio,{rangeEnd:report.range?.start+report.range?.seconds});
  if(p.technical_fixture||report.technical_fixture||report.kind!=='preview'||report.visual_only||report.ratio!==p.ratio||report.fingerprint!==reviewed.fingerprint||!fs.existsSync(report.video)||sha(report.video)!==report.video_sha256||a.fingerprint!==reviewed.fingerprint||a.ratio!==p.ratio||a.preview_sha256!==report.video_sha256||!a.note?.trim())throw new Error('Preview/user approval changed, is technical-only or belongs to another ratio; review this native version');
  return report;
}
export async function runB6(command,args) {
  const ratio=opt(args,'--ratio');
  if(command==='check-pack')return checkPack();
  if(command==='init')return initB6(args[0],ratio,opt(args,'--example'));
  if(command==='--help'||command==='help')return {commands:'check-pack; init DIR --ratio 16:9|9:16|both [--example hong-kong-v90|blocking-calibration]; validate PROJECT --ratio R; frames|preview PROJECT --ratio R --start 0 --seconds N --output outputs/new --trusted-code; review-pack PROJECT --ratio R --report FILE --output outputs/review; check-review PROJECT --ratio R --review FILE; approve PROJECT --ratio R --report FILE --review FILE --note TEXT; render PROJECT --ratio R --output outputs/full --trusted-code',production:'Default init creates b6-production-v1 with the complete painted engine and agent-authored native scenes; see references/b6-installed-production.md. Blocking calibration is never the production default.',v90:'Unchanged V90 reproduction is native 16:9; --full-qc checks 600 original frames. See references/b6-hong-kong-v90.md.',note:'Authored local code is executable; inspect it first. Init runs no generation. Both ratios have independent plans, previews and user approvals.'};
  if(!['validate','frames','preview','review-pack','check-review','approve','render'].includes(command))throw new Error('Unknown B6 command; use --help');
  if(args.includes('--visual-only')&&command!=='validate'&&command!=='frames')throw new Error('--visual-only is for structural validation/stills, never a finished preview or production');
  const visualOnly=command==='frames'||args.includes('--visual-only');
  let file=path.resolve(args[0]);if(fs.statSync(file).isDirectory())file=path.join(file,'project.json');
  if(read(file).renderer==='b6-production-v1')return runProduction(command,args);
  if(['review-pack','check-review'].includes(command))throw new Error('Motion review commands require the B6 production renderer');
  if(read(file).renderer==='b6-hk-v90-v1')return runHK(command,args);
  if(['approve','render'].includes(command)&&read(file).renderer==='b6-painted-world-v1')throw new Error('Legacy B6 diagnostic is technical-only: approve/render are disabled regardless of stage, fixture flags or review text');
  const duration=read(file).duration;
  const previewEnd=Number(opt(args,'--start',0))+Number(opt(args,'--seconds',Math.min(20,duration)));
  const approvalReport=command==='approve'&&opt(args,'--report')?read(opt(args,'--report')):null;
  const rangeEnd=command==='preview'?previewEnd:command==='validate'&&args.includes('--seconds')?previewEnd:approvalReport?approvalReport.range?.start+approvalReport.range?.seconds:undefined;
  const p=loadB6(file,ratio,{visualOnly,rangeEnd});
  if(command==='validate')return {valid:true,purpose:'diagnostic',delivery_ready:false,ratio,visual_only:visualOnly,fingerprint:p.fingerprint,checked_seconds:p.rangeEnd,shots:p.plan.shots.length,note:'Structural validation only; drawing, semantic timing, sound and native framing require actual review'};
  if(command==='approve') {
    const reportFile=opt(args,'--report'),note=opt(args,'--note','');
    if(!reportFile||!note.trim())throw new Error('Actual reviewed preview --report and genuine user approval --note required');
    const r=read(reportFile),approvalFile=path.join(path.dirname(path.resolve(reportFile)),'approval.json');
    if(fs.existsSync(approvalFile))throw new Error('Approval exists; will not overwrite');
    const a={ratio,fingerprint:p.fingerprint,preview_sha256:r.video_sha256,note,approved_at:new Date().toISOString()};
    // Check without creating any approval on a mismatch.
    if(p.technical_fixture||r.technical_fixture||r.kind!=='preview'||r.visual_only||r.ratio!==ratio||r.fingerprint!==p.fingerprint||!fs.existsSync(r.video)||sha(r.video)!==r.video_sha256)throw new Error('Preview changed, is technical-only or belongs to another ratio');
    save(approvalFile,a);return {approval:approvalFile};
  }
  if(!args.includes('--trusted-code'))throw new Error('Inspect project scene.mjs, then explicitly allow execution with --trusted-code');
  if(command==='render') {
    if(!opt(args,'--report')||!opt(args,'--approval'))throw new Error('Full production requires a reviewed preview and user approval for this ratio');
    checkApproval(p,opt(args,'--report'),opt(args,'--approval'));
  }
  const out=output(p.base,opt(args,'--output'));
  let start=Number(opt(args,'--start',0)),seconds=command==='render'?p.duration:Number(opt(args,'--seconds',Math.min(20,p.duration)));
  if(command==='render')start=0;
  if(!Number.isFinite(start)||!Number.isFinite(seconds)||start<0||seconds<=0||start+seconds>p.duration+.001||(command==='preview'&&seconds>60))throw new Error('Choose a valid timeline range; previews at most 60 seconds');
  const times=command==='frames'?String(opt(args,'--times','0')).split(',').map(Number):Array.from({length:Math.ceil(seconds*p.fps-1e-8)},(_,i)=>start+i/p.fps);
  if(!times.length||times.some(t=>!Number.isFinite(t)||t<0||t>=p.duration))throw new Error('Frame times must lie inside timeline');
  const draw=await painter(p); // load code/assets before creating output
  fs.mkdirSync(out,{recursive:true});
  const ledger=[];
  for(let i=0;i<times.length;i++) {
    const canvas=await draw(times[i]),f=path.join(out,`${String(i).padStart(6,'0')}.png`);
    fs.writeFileSync(f,canvas.toBuffer('image/png'));ledger.push({frame:i,time:times[i],sha256:sha(f)});
  }
  const report={version:1,style:'B6',kind:command,ratio,fingerprint:p.fingerprint,visual_only:visualOnly,technical_fixture:true,purpose:'diagnostic',delivery_ready:false,range:{start,seconds},frames:ledger,creative_acceptance:'diagnostic only; never a finished story'};
  save(path.join(out,'report.json'),report);
  if(command!=='frames') {
    const video=path.join(out,command==='preview'?'preview.mp4':'film.mp4');
    await encode(['-hide_banner','-nostdin','-n','-framerate',String(p.fps),'-i',path.join(out,'%06d.png'),'-ss',String(start),'-i',p.audio,'-map','0:v:0','-map','1:a:0','-t',String(seconds),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',video],path.join(out,'encode.log'));
    run(FFMPEG,['-v','error','-i',video,'-f','null','-']);
    const meta=probe(video),v=meta.streams.find(s=>s.codec_type==='video'),duration=Number(meta.format.duration);
    if(!v||v.width!==p.plan.width||v.height!==p.plan.height||Number(v.nb_frames)!==times.length||!meta.streams.some(s=>s.codec_type==='audio')||Math.abs(duration-seconds)>1/p.fps+.12)throw new Error('Encoded dimensions, frame count, audio or duration do not match the native timeline');
    report.video=video;report.video_sha256=sha(video);report.technical={decoded:true,width:v.width,height:v.height,duration,audio_speed:1};
    const cues=p.captions.filter(c=>c.end>start&&c.start<start+seconds).map(c=>({...c,start:Math.max(0,c.start-start),end:Math.min(seconds,c.end-start)}));
    const stamp=(t,vtt=false)=>{const ms=Math.round(t*1000),h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}${vtt?'.':','}${String(ms%1000).padStart(3,'0')}`;};
    fs.writeFileSync(path.join(out,'captions.srt'),cues.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${c.text}\n`).join('\n'));
    fs.writeFileSync(path.join(out,'captions.vtt'),'WEBVTT\n\n'+cues.map(c=>`${stamp(c.start,true)} --> ${stamp(c.end,true)}\n${c.text}\n`).join('\n'));
    save(path.join(out,'report.json'),report);
  }
  return {report:path.join(out,'report.json'),video:report.video,ratio,frames:ledger.length,creative_acceptance:report.creative_acceptance};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))runB6(process.argv[2],process.argv.slice(3)).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});
