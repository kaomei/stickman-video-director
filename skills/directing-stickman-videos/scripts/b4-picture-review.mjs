// Pixel diagnostics establish current-media provenance and local change only.
// Story meaning, acting, contact, continuity and pacing need independent playback.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {assertB4StoryAsset} from './b4-asset-origin.mjs';

const require=createRequire(import.meta.url);
let runtime;
const canvasAPI=()=>runtime??=require('@napi-rs/canvas');
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PHASES=['before','mid','after','hold'];
const CHECKS=['semantic_motion','anatomy_contact','continuity','repetition_pacing','story_asset_origin'];
const KINDS=['local_action','state_reveal','environment','motivated_hold'];
const LIMITS=[
  'B4 shots have a hard three-second maximum, including motivated holds. Cuts, crops, captions and decorative motion do not establish a new principal-picture state; review continuous state duration across shot boundaries.',
  'Pixel diagnostics establish visible local picture change and current-media provenance, not meaningful acting or aesthetic quality.',
  'Real repetition, narrative causality, coherent anatomy/contact and long-form pacing require independent complete playback.',
  'Known reference bytes and close whole-image copies are blocked. story_asset_origin independently checks each visible scene against the current story, including crops/composites and old scene or character reuse; a clean hash check does not prove originality.',
  'Reviewer identity, independence, actual playback and judgment are declarations, not authenticated facts.',
  'This is picture-only review. Typography, captions, sound, reference matching and user acceptance remain separate gates.',
  'Tool or model limitations may be disclosed; they do not waive formal B4 requirements.'
];
const EPS=1e-7;
const fail=s=>{throw Error('B4 picture: '+s);};
const need=(v,s)=>{if(!v)fail(s);};
const text=x=>typeof x==='string'&&!!x.trim();
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const hash=f=>digest(fs.readFileSync(f));
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const write=(f,x)=>fs.writeFileSync(f,JSON.stringify(x,null,2)+'\n');
const safeId=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/.test(x);
function file(f) {
  const target=path.resolve(f);
  need(fs.existsSync(target)&&fs.statSync(target).isFile()&&fs.realpathSync(target)===target,'missing or symlink file: '+target);
  return target;
}
function command(exe,args,maxBuffer=128*1024*1024) {
  const r=spawnSync(exe,args,{maxBuffer});
  need(!r.error&&r.status===0,'media command failed: '+(r.error?.message||String(r.stderr).slice(-1600)));
  return r.stdout;
}
function* layers(items) {for(const l of items||[]){yield l;if(l.children)yield* layers(l.children);}}
function media(p,value) {
  need(text(value)&&!/^(?:[a-z]+:|\/\/)/i.test(value.replace(/^[A-Z]:[\\/]/i,'')),'picture resources must be local files');
  const bundled=value.startsWith('@b1/'),target=bundled?path.resolve(ROOT,'assets/b1',value.slice(4)):path.resolve(p.base||'.',value);
  need(!bundled||target.startsWith(path.join(ROOT,'assets/b1')+path.sep),'bundled image path escapes its directory');
  need(fs.existsSync(target)&&fs.statSync(target).isFile(),'missing picture resource: '+value);
  return fs.realpathSync(target);
}
function region(r,height) {
  need(r&&['x','y','w','h'].every(k=>Number.isFinite(r[k]))&&r.x>=0&&r.y>=0&&r.w>0&&r.h>0&&r.x+r.w<=1280+EPS&&r.y+r.h<=height+EPS,'picture region must lie inside the 1280-unit design plane');
  return {x:r.x,y:r.y,w:r.w,h:r.h};
}
const frameAt=(t,p)=>Math.ceil(t*p.fps-EPS);

export function planB4Picture(p) {
  if(p.style!=='B4')return null;
  need(Number.isFinite(p.duration)&&p.duration>0&&Number.isInteger(p.fps)&&p.fps>0&&p.width>0&&p.height>0,'invalid project dimensions/timing');
  const end=p.rangeEnd??p.duration,height=1280*p.height/p.width;
  need(end>0&&end<=p.duration+EPS,'invalid review scope');
  const spec=p.picture_motion;
  need(spec&&text(spec.author_id)&&Array.isArray(spec.shots),'every B4 project needs picture_motion.author_id and a per-shot picture motion plan');
  need(Array.isArray(p.shots)&&p.shots.length,'project needs actual shots');
  const seen=new Set();
  for(const m of spec.shots){need(Number.isInteger(m.shot)&&m.shot>=0&&!seen.has(m.shot),'picture_motion shots need unique 0-based indices');seen.add(m.shot);need(m.shot<p.shots.length,'picture plan references an unknown shot');}
  const visible=p.shots.map((s,shot)=>({s,shot})).filter(({s})=>s.start<end),shots=[];
  for(const {s,shot} of visible) {
    const m=spec.shots.find(x=>x.shot===shot),label='shot '+shot;
    need(Number.isFinite(s.start)&&Number.isFinite(s.end)&&s.end>s.start&&s.end-s.start<=3.000001,label+' exceeds the maximum 3 seconds; action, hold and author approval fields cannot waive the limit');
    need(m,label+' is missing; opening and every body shot require picture evidence');
    need(KINDS.includes(m.kind)&&text(m.intent)&&text(m.before)&&text(m.after),label+' needs kind, story intent and concrete before/after states');
    const ls=[...layers(s.layers)],images=ls.filter(l=>l.type==='image'&&s.start+(l.from||0)<end&&s.start+(l.from||0)<s.end&&(l.to===undefined||s.start+l.to>s.start));
    need(Array.isArray(m.layer_ids)&&m.layer_ids.length&&new Set(m.layer_ids).size===m.layer_ids.length&&m.layer_ids.every(id=>safeId(id)&&images.filter(l=>l.id===id).length===1),label+' must identify actual unique image layer ids; text, lines, overlays and camera groups cannot supply picture motion');
    need(m.times&&PHASES.every(k=>Number.isFinite(m.times[k])),label+' needs before/mid/after/hold times in absolute project seconds');
    const times=Object.fromEntries(PHASES.map(k=>[k,m.times[k]]));
    if(s.end>end+EPS&&times.hold>=end-EPS)fail(label+' picture beat extends beyond this prefix preview; choose a preview endpoint that includes the complete beat and readable hold');
    need(times.before>=s.start-EPS&&times.before<times.mid&&times.mid<times.after&&times.after<times.hold&&times.hold<Math.min(s.end,end),label+' phases must be ordered within the visible shot, including a readable final hold');
    const indices=Object.fromEntries(PHASES.map(k=>[k,frameAt(times[k],p)])),last=Math.ceil(Math.min(s.end,end)*p.fps-EPS);
    need(indices.before<indices.mid&&indices.mid<indices.after&&indices.after<indices.hold&&indices.hold<last,label+' requires distinct actual final-video phase frames');
    need((indices.hold-indices.after)/p.fps>=Math.max(.16,2/p.fps)-EPS,label+' needs at least 0.16 seconds/two frames of readable hold after the state change');
    need(m.layer_ids.every(id=>{const l=images.find(l=>l.id===id);return PHASES.some(k=>indices[k]/p.fps>=s.start+(l.from||0)-EPS&&indices[k]/p.fps<Math.min(s.end,s.start+(l.to??Infinity)));}),label+' declares an image never visible in its phase frames');
    const resources=images.map(l=>{const f=media(p,l.path),origin=assertB4StoryAsset(f);return {id:l.id,path:f,sha256:hash(f),asset_role:origin.role};});
    const full_scene_ids=m.layer_ids.filter(id=>{const l=images.find(l=>l.id===id);return (l.w??200)>=1100&&(l.h??height)>=height*.8;});
    shots.push({shot,id:'shot-'+shot,kind:m.kind,intent:m.intent,before:m.before,after:m.after,layer_ids:[...m.layer_ids],region:region(m.region,height),times,frame_indices:indices,clip_start_frame:frameAt(s.start,p),clip_end_frame:last,resources,full_scene_ids,
      ...(text(m.reason)?{reason:m.reason}:{}),...(m.supports_shot!==undefined?{supports_shot:m.supports_shot}:{}),...(text(m.reuse_reason)?{reuse_reason:m.reuse_reason}:{})});
  }
  need(shots.some(s=>s.kind!=='motivated_hold'),'an all-hold film/prefix has no animated story event; include a complete non-hold beat');
  for(const s of shots) {
    if(s.kind==='motivated_hold')need(text(s.reason)&&Number.isInteger(s.supports_shot)&&Math.abs(s.supports_shot-s.shot)===1&&shots.some(other=>other.shot===s.supports_shot&&other.kind!=='motivated_hold'),'shot '+s.shot+' motivated_hold needs a concrete reason and an adjacent visible non-hold supports_shot; select a preview endpoint including that complete supporting beat');
    const reused=shots.filter(other=>other.shot!==s.shot&&other.resources.some(r=>s.resources.some(x=>x.sha256===r.sha256))).map(x=>x.shot);
    if(reused.length){need(text(s.reuse_reason),'shot '+s.shot+' reuses image content across shots and needs reuse_reason; renamed files do not create new art');s.reused_with=reused;}
  }
  return {schema:1,status:'planned',scope:'picture only',delivery_ready:false,author_id:spec.author_id,width:p.width,height:p.height,fps:p.fps,scope_start:0,scope_end:end,shots,...(p.height>p.width?{viewing_profile:'portrait-phone'}:{}),limits:LIMITS};
}

function snapshot(canvas,width=320) {
  const {createCanvas}=canvasAPI(),c=createCanvas(width,Math.round(width*canvas.height/canvas.width));
  c.getContext('2d').drawImage(canvas,0,0,c.width,c.height);
  return {width:c.width,height:c.height,data:c.getContext('2d').getImageData(0,0,c.width,c.height).data};
}
function diff(a,b,r,inside=true) {
  need(a.width===b.width&&a.height===b.height,'painter frame dimensions changed');
  let sum=0,changed=0,n=0;
  for(let y=0;y<a.height;y++)for(let x=0;x<a.width;x++) {
    const hit=!r||x>=r.x/1280*a.width&&x<(r.x+r.w)/1280*a.width&&y>=r.y/1280*a.width&&y<(r.y+r.h)/1280*a.width;
    if(r&&hit!==inside)continue;
    const i=(y*a.width+x)*4,d=(Math.abs(a.data[i]-b.data[i])+Math.abs(a.data[i+1]-b.data[i+1])+Math.abs(a.data[i+2]-b.data[i+2]))/(3*255);
    sum+=d;if(d>.04)changed++;n++;
  }
  return {mean:sum/Math.max(1,n),fraction:changed/Math.max(1,n)};
}
function contribution(full,omitted) {
  const data=new Float32Array(full.data.length);for(let i=0;i<data.length;i++)data[i]=full.data[i]-omitted.data[i];
  return {...full,data};
}
// A full-scene image merely translated or zoomed is a camera move. Search a
// small global registration to reject that mechanical substitute for acting.
function registration(a,b) {
  const width=a.width,height=a.height,border=Math.max(4,Math.ceil(width*.05)),error=(dx,dy,scale)=>{
    let sum=0,n=0;
    for(let y=border;y<height-border;y+=2)for(let x=border;x<width-border;x+=2) {
      const sx=Math.round((x-width/2-dx)/scale+width/2),sy=Math.round((y-height/2-dy)/scale+height/2);
      if(sx<0||sy<0||sx>=width||sy>=height)continue;
      const i=(y*width+x)*4,j=(sy*width+sx)*4;
      for(let k=0;k<3;k++){sum+=Math.abs(b.data[i+k]-a.data[j+k])/255;n++;}
    }
    return sum/Math.max(1,n);
  };
  const original=error(0,0,1);let best=original,transform={dx:0,dy:0,scale:1};
  const radius=Math.ceil(width*.035);
  for(const scale of [.96,.98,1,1.02,1.04])for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++) {
    if(dx===0&&dy===0&&scale===1)continue;const candidate=error(dx,dy,scale);
    if(candidate<best){best=candidate;transform={dx,dy,scale};}
  }
  return {original,best,ratio:best/Math.max(original,EPS),transform};
}

export function checkB4PicturePaint(p,{draw,picture}) {
  const plan=planB4Picture(p);if(!plan)return null;
  need(typeof draw==='function'&&typeof picture==='function','full and picture-only painters are required');
  const metrics=[];
  for(const s of plan.shots) {
    const t=k=>s.frame_indices[k]/p.fps,opts={focusIds:s.layer_ids,principalMotionOnly:true,freezeAncestorsAt:t('before')};
    const states=Object.fromEntries(PHASES.map(k=>[k,snapshot(picture(t(k),opts))]));
    const empty=snapshot(picture(t('after'),{focusIds:['__b4_picture_empty__'],principalMotionOnly:true}));
    const full=Object.fromEntries(PHASES.map(k=>[k,snapshot(draw(t(k)))]));
    const visible=Object.fromEntries(PHASES.map(k=>[k,contribution(full[k],snapshot(draw(t(k),{omitIds:s.layer_ids})))]));
    const members=s.layer_ids.map(id=>{
      const phases=PHASES.map(k=>{
        const isolated=diff(snapshot(picture(t(k),{...opts,focusIds:[id]})),empty,s.region),ink=diff(full[k],snapshot(draw(t(k),{omitIds:[id]})),s.region);
        return {phase:k,isolated,visible:ink};
      });
      // Matching before/after scene images may differ only at the door/face.
      // The new layer contributes that local patch, not its entire background.
      need(phases.some(x=>x.isolated.mean>.001&&x.isolated.fraction>.003&&x.visible.mean>.001&&x.visible.fraction>.003),'shot '+s.shot+' image '+id+' is absent, outside its region or obscured');
      return {id,phases};
    });
    const result={shot:s.shot,kind:s.kind,members};
    if(s.kind!=='motivated_hold') {
      const change=diff(states.before,states.after,s.region),held=diff(states.before,states.hold,s.region),outside=diff(states.before,states.after,s.region,false),mid_from_before=diff(states.before,states.mid,s.region),mid_from_after=diff(states.after,states.mid,s.region);
      need(change.mean>=.006&&change.fraction>=.012&&held.mean>=.006&&held.fraction>=.012,'shot '+s.shot+' needs a visible local image state change and retained readable hold; subtitle motion, tiny motion and flashes cannot supply it');
      need(outside.mean<=Math.max(.009,change.mean*.4),'shot '+s.shot+' change is not localized to its declared subject/prop/environment region; whole-image drift cannot supply it');
      need(Math.min(mid_from_before.mean,mid_from_after.mean)>=Math.max(.0008,change.mean*.12),'shot '+s.shot+' has no visible intermediate picture state; hard switching static images is not animated action');
      const composite=diff(visible.before,visible.after,s.region),composite_hold=diff(visible.before,visible.hold,s.region);
      need(composite.mean>=change.mean*.45&&composite.fraction>=change.fraction*.35&&composite_hold.mean>=held.mean*.45,'shot '+s.shot+' local image motion is obscured in the final composition; moving text/overlays cannot supply it');
      const first=s.frame_indices.before,last=s.frame_indices.after,indices=[...new Set(Array.from({length:7},(_,i)=>Math.round(first+(last-first)*i/6)))];
      const series=indices.map(i=>snapshot(picture(i/p.fps,opts))),steps=series.slice(1).map((x,i)=>diff(series[i],x,s.region));
      need(steps.filter(d=>d.mean>=Math.max(.0004,change.mean*.04)).length>=2&&Math.max(...steps.map(x=>x.mean))<=Math.max(change.mean*.8,.003),'shot '+s.shot+' needs a continuous local transition, not a one-frame static cut');
      let global_registration;
      if(s.full_scene_ids.length){global_registration=registration(snapshot(picture(t('before'),opts),160),snapshot(picture(t('after'),opts),160));need(global_registration.original<.004||global_registration.ratio>.32,'shot '+s.shot+' motion is explained by whole-scene translation/zoom; add a local story action');}
      Object.assign(result,{change,held,outside,mid_from_before,mid_from_after,composite,composite_hold,transition_samples:indices,steps,...(global_registration?{global_registration}:{})});
    }
    metrics.push(result);
  }
  return {status:'paint_diagnostic_pass',diagnostic_status:'technical_only',review_status:'pending_independent_review',scope:'picture only',delivery_ready:false,plan,metrics,limits:LIMITS};
}

function probeSource(p,source,ffprobe) {
  const m=JSON.parse(command(ffprobe,['-v','error','-show_streams','-show_format','-of','json',source])),v=m.streams.find(s=>s.codec_type==='video'),[n,d]=String(v?.avg_frame_rate).split('/').map(Number);
  need(v?.width===p.width&&v?.height===p.height&&Math.abs(n/d-p.fps)<1e-6,'actual output dimensions/fps do not match project');
  need(Math.abs(Number(v.duration??m.format.duration)-(p.rangeEnd??p.duration))<=1/p.fps+.01&&Math.abs(Number(v.start_time??0))<.01,'actual output duration/start does not match submitted scope');
  return {width:v.width,height:v.height,fps:p.fps,duration:Number(v.duration??m.format.duration)};
}
async function checkFile(p,source,draw,picture,ffmpeg) {
  const diagnostic=checkB4PicturePaint(p,{draw,picture}),plan=diagnostic.plan,{createCanvas,loadImage}=canvasAPI();
  // Decode to RGB before resizing, then use the same Canvas sampler as the
  // authored frame (also used by typography review). YUV-first scaling or a
  // different resize kernel can misclassify dense colored ink as render drift.
  // Keep raw decode chunks bounded to 32 MiB; all scope frames still compare.
  const width=Math.min(320,p.width),n=Math.ceil(plan.scope_end*p.fps-EPS),bytes=p.width*p.height*4,chunkSize=Math.max(1,Math.min(p.fps*5,Math.floor(32*1024*1024/bytes)));
  const decoded=createCanvas(p.width,p.height),ctx=decoded.getContext('2d'),pixels=ctx.createImageData(p.width,p.height);let max_mean=0;
  for(let start=0;start<n;start+=chunkSize) {
    const count=Math.min(chunkSize,n-start),raw=command(ffmpeg,['-v','error','-ss',String(start/p.fps),'-i',source,'-map','0:v:0','-frames:v',String(count),'-pix_fmt','rgba','-f','rawvideo','pipe:1'],count*bytes+1024*1024);
    need(raw.length===count*bytes,'actual output must contain every frame in the submitted scope');
    for(let j=0;j<count;j++) {
      pixels.data.set(raw.subarray(j*bytes,(j+1)*bytes));ctx.putImageData(pixels,0,0);
      const i=start+j,actual=snapshot(decoded,width),expected=snapshot(draw(i/p.fps),width),d=diff(actual,expected);
      need(d.mean<=.03&&d.fraction<=.09,'exported frame '+i+' does not match current authored composition');max_mean=Math.max(max_mean,d.mean);
      const s=plan.shots.find(s=>i>=s.clip_start_frame&&i<s.clip_end_frame);
      if(s){const local=diff(actual,expected,s.region);need(local.mean<=.04&&local.fraction<=.18,'exported picture frame '+i+' differs in shot '+s.shot);}
    }
  }
  const phase_matches=[];
  // Substitute only the selected picture difference over the current composed
  // background. Codec tolerance must not permit freezing a subtle local action.
  for(const s of plan.shots.filter(s=>s.kind!=='motivated_hold'))for(const [phase,next] of [['before','mid'],['mid','after'],['hold','before']]) {
    const t=s.frame_indices[phase]/p.fps,otherT=s.frame_indices[next]/p.fps,opts={focusIds:s.layer_ids,principalMotionOnly:true,freezeAncestorsAt:s.frame_indices.before/p.fps};
    const actual=snapshot(await loadImage(command(ffmpeg,['-v','error','-ss',String(t),'-i',source,'-frames:v','1','-c:v','png','-threads:v','1','-f','image2pipe','pipe:1']))),authored=snapshot(draw(t)),isolated=snapshot(picture(t,opts)),other=snapshot(picture(otherT,opts));
    let currentError=0,alternativeError=0,count=0;
    const r=s.region,x0=Math.floor(r.x/4),y0=Math.floor(r.y/4),x1=Math.min(actual.width,Math.ceil((r.x+r.w)/4)),y1=Math.min(actual.height,Math.ceil((r.y+r.h)/4));
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++) {
      const i=(y*actual.width+x)*4,change=(Math.abs(isolated.data[i]-other.data[i])+Math.abs(isolated.data[i+1]-other.data[i+1])+Math.abs(isolated.data[i+2]-other.data[i+2]))/(3*255);
      if(change<.045)continue;
      for(let k=0;k<3;k++){const expected=authored.data[i+k],alternative=Math.max(0,Math.min(255,expected+other.data[i+k]-isolated.data[i+k]));currentError+=Math.abs(actual.data[i+k]-expected)/255;alternativeError+=Math.abs(actual.data[i+k]-alternative)/255;count++;}
    }
    need(count>0&&currentError/count<alternativeError/count*.8,'exported picture shot '+s.shot+' '+phase+' loses its actual local action; render and review the current complete beat');
    phase_matches.push({shot:s.shot,phase,current_error:currentError/count,alternative_error:alternativeError/count});
  }
  return {status:'file_diagnostic_pass',diagnostic_status:'technical_only',scope:'picture only',delivery_ready:false,frames_checked:n,max_mean,paint:diagnostic.metrics,phase_matches};
}
function crop(s,p) {
  const scale=p.width/1280,x=Math.floor(s.region.x*scale),y=Math.floor(s.region.y*scale);
  return [x,y,Math.min(p.width-x,Math.ceil(s.region.w*scale)),Math.min(p.height-y,Math.ceil(s.region.h*scale))];
}
function descriptors(plan,p) {
  return plan.shots.flatMap(s=>[...PHASES.map(phase=>({id:s.id+'-'+phase,shot:s.shot,type:'png',phase,frame_index:s.frame_indices[phase],crop:crop(s,p),file:s.id+'-'+phase+'.png'})),{id:s.id+'-continuous',shot:s.shot,type:'clip',start_frame:s.clip_start_frame,end_frame:s.clip_end_frame,crop:[0,0,p.width,p.height],audio:'source_if_present',file:s.id+'-continuous.mp4'}]);
}
function extract(source,a,p,ffmpeg,target) {
  const [x,y,w,h]=a.crop,filter=`format=rgb24,crop=${w}:${h}:${x}:${y}:exact=1`;
  if(a.type==='png') {
    const bytes=command(ffmpeg,['-v','error','-ss',String(a.frame_index/p.fps),'-i',source,'-map','0:v:0','-vf',filter,'-frames:v','1','-c:v','png','-threads:v','1','-pix_fmt','rgb24','-f','image2pipe','pipe:1']);if(target)fs.writeFileSync(target,bytes);return digest(bytes);
  }
  command(ffmpeg,['-v','error','-ss',String(a.start_frame/p.fps),'-i',source,'-map','0:v:0','-vf',filter+',pad=ceil(iw/2)*2:ceil(ih/2)*2,format=yuv420p','-frames:v',String(a.end_frame-a.start_frame),'-t',String((a.end_frame-a.start_frame)/p.fps),'-r',String(p.fps),'-map','0:a:0?','-c:a','aac','-b:a','128k','-threads:a','1','-flags:a','+bitexact','-c:v','libx264','-preset','fast','-crf','23','-threads:v','1','-flags:v','+bitexact','-map_metadata','-1','-movflags','+faststart','-n',target]);
  return hash(target);
}
function binding(p,fingerprint) {
  const value=fingerprint??p.fingerprint;need(text(value)&&(!p.fingerprint||p.fingerprint===value),'current project fingerprint is required and must match project');return value;
}
function template(plan,output_sha256,evidence_sha256,artifacts) {
  return {schema:1,scope:'picture only',delivery_ready:false,author_id:plan.author_id,reviewer:{id:'',kind:'agent',method:'',independent:false},output_sha256,evidence_sha256,
    full_playback:{status:'unknown',viewed_ranges:[],observations:[]},
    ...(plan.viewing_profile==='portrait-phone'?{portrait_viewing:{status:'unknown',display_width:null,display_height:null,playback_speed:null,platform:'',real_device:{checked:null,limitation:''},observations:[]}}:{}),
    shots:plan.shots.map(s=>({shot:s.shot,checks:Object.fromEntries(CHECKS.map(k=>[k,{status:'unknown',observations:[]}]))})),blocking_issues:[],evidence_ids:['source-video',...artifacts.map(a=>a.id)],limits:LIMITS};
}
export async function buildB4PictureEvidence(p,{file:source,draw,picture,out,projectFingerprint,ffmpeg=process.env.FFMPEG||'ffmpeg',ffprobe=process.env.FFPROBE||'ffprobe'}) {
  const plan=planB4Picture(p);if(!plan)return null;
  source=file(source);assertB4StoryAsset(source);const output_sha256=hash(source),project_fingerprint=binding(p,projectFingerprint);
  need(fs.existsSync(out)&&fs.statSync(out).isDirectory()&&fs.realpathSync(path.resolve(out))===path.resolve(out)&&fs.readdirSync(out).length===0,'evidence output must be a fresh empty real directory');
  const metadata=probeSource(p,source,ffprobe),diagnostic=await checkFile(p,source,draw,picture,ffmpeg),artifacts=[];
  for(const a of descriptors(plan,p))artifacts.push({...a,sha256:extract(source,a,p,ffmpeg,path.join(out,a.file))});
  need(hash(source)===output_sha256&&digest(JSON.stringify(planB4Picture(p)))===digest(JSON.stringify(plan)),'source, resources or plan changed during evidence build');
  const ledger_file=path.resolve(out,'evidence.json'),template_file=path.resolve(out,'review-template.json');
  const ledger={schema:1,status:'pending_independent_review',diagnostic_status:'technical_only',scope:'picture only',delivery_ready:false,output:source,output_sha256,project_fingerprint,plan_sha256:digest(JSON.stringify(plan)),range:{start:0,end:plan.scope_end},metadata,plan,diagnostic,artifacts,evidence_dir:path.resolve(out),ledger_file,template_file,limits:LIMITS};
  write(ledger_file,ledger);write(template_file,template(plan,output_sha256,hash(ledger_file),artifacts));return ledger;
}
function observations(items,{range,artifacts,continuous,full=false}) {
  need(Array.isArray(items)&&items.length>0,'each check needs concrete timed observations');let hasContinuous=false;
  for(const o of items) {
    need(Number.isFinite(o.time)&&o.time>=range[0]-EPS&&o.time<range[1]+EPS&&text(o.detail)&&!/^(pass|passed|ok|okay|good|fine|checked|done|通过|正常|已检查|合格)[.!。！\s]*$/iu.test(o.detail.trim()),'observation needs a concrete time and detail, not a pass label');
    need(Array.isArray(o.evidence_ids)&&o.evidence_ids.length>0&&o.evidence_ids.every(id=>artifacts.has(id)),'observation must reference actual current evidence ids');
    if(o.evidence_ids.includes(continuous))hasContinuous=true;
  }
  need(hasContinuous,full?'full playback observations must reference source-video':'every shot check must reference that shot\'s continuous clip');
}
export async function verifyB4PictureReview(p,{file:source,draw,picture,evidenceDir,reviewFile,projectFingerprint,ffmpeg=process.env.FFMPEG||'ffmpeg',ffprobe=process.env.FFPROBE||'ffprobe'}) {
  const plan=planB4Picture(p);if(!plan)return null;
  source=file(source);assertB4StoryAsset(source);reviewFile=file(reviewFile);const review_sha256=hash(reviewFile),ledgerFile=file(path.join(evidenceDir,'evidence.json')),evidence_sha256=hash(ledgerFile),ledger=read(ledgerFile),review=read(reviewFile),output_sha256=hash(source),project_fingerprint=binding(p,projectFingerprint),plan_sha256=digest(JSON.stringify(plan));
  need(ledger.schema===1&&ledger.status==='pending_independent_review'&&ledger.scope==='picture only'&&ledger.delivery_ready===false&&ledger.output===source&&ledger.output_sha256===output_sha256&&ledger.project_fingerprint===project_fingerprint&&ledger.plan_sha256===plan_sha256&&same(ledger.plan,plan),'stale evidence/output/project/plan/resource binding');
  need(same(ledger.range,{start:0,end:plan.scope_end})&&same(ledger.metadata,probeSource(p,source,ffprobe)),'stale media metadata/scope');
  const expected=descriptors(plan,p);need(Array.isArray(ledger.artifacts)&&ledger.artifacts.length===expected.length,'missing/extra evidence artifacts');
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'b4-picture-verify-'));
  try {
    for(let i=0;i<expected.length;i++) {
      const a=ledger.artifacts[i],{sha256,...descriptor}=a;need(same(descriptor,expected[i]),'artifact descriptors do not match complete current picture plan');
      const f=file(path.join(evidenceDir,a.file));need(hash(f)===sha256,'evidence artifact hash changed: '+a.id);
      need(extract(source,expected[i],p,ffmpeg,a.type==='clip'?path.join(tmp,a.file):undefined)===sha256,'evidence artifact is not extracted from current actual output: '+a.id);
    }
    await checkFile(p,source,draw,picture,ffmpeg);
  }finally{fs.rmSync(tmp,{recursive:true,force:true});}
  need(review.schema===1&&review.scope==='picture only'&&review.delivery_ready===false&&review.author_id===plan.author_id&&review.output_sha256===output_sha256&&review.evidence_sha256===evidence_sha256,'review has stale/missing current output/evidence/author binding');
  const reviewer=review.reviewer;need(reviewer&&text(reviewer.id)&&reviewer.id!==plan.author_id&&['human','agent'].includes(reviewer.kind)&&text(reviewer.method)&&reviewer.independent===true,'review requires an independent reviewer distinct from the actual author');
  need(Array.isArray(review.blocking_issues)&&review.blocking_issues.length===0,'blocking picture issues remain');
  const full=review.full_playback;need(full?.status==='pass'&&Array.isArray(full.viewed_ranges)&&full.viewed_ranges.length,'complete picture playback is pending/failed');
  let covered=0;
  for(const r of [...full.viewed_ranges].sort((a,b)=>a.start-b.start)){need(Number.isFinite(r.start)&&Number.isFinite(r.end)&&r.start>=0&&r.end>r.start&&r.end<=plan.scope_end+EPS&&r.start<=covered+EPS,'playback ranges omit current review scope');covered=Math.max(covered,r.end);}
  need(covered>=plan.scope_end-EPS,'complete playback omits current review tail');
  const artifacts=new Set(ledger.artifacts.map(a=>a.id));artifacts.add('source-video');
  observations(full.observations,{range:[0,plan.scope_end],artifacts,continuous:'source-video',full:true});
  if(plan.viewing_profile==='portrait-phone') {
    const v=review.portrait_viewing;
    need(v?.status==='pass'&&Number.isFinite(v.display_width)&&v.display_width>=320&&v.display_width<=480&&Number.isFinite(v.display_height)&&v.display_height>v.display_width&&Math.abs((v.display_width/v.display_height)/(p.width/p.height)-1)<=.03&&v.playback_speed===1&&text(v.platform),'portrait playback must record an actual 320–480px-wide, aspect-preserved display at 1x and target platform');
    need(typeof v.real_device?.checked==='boolean'&&(v.real_device.checked||text(v.real_device.limitation)),'record real-device viewing or disclose the simulated-device limitation');
    observations(v.observations,{range:[0,plan.scope_end],artifacts,continuous:'source-video',full:true});
  }
  need(Array.isArray(review.shots)&&same(review.shots.map(s=>s.shot).sort((a,b)=>a-b),plan.shots.map(s=>s.shot).sort((a,b)=>a-b)),'independent review must cover every picture shot exactly once');
  for(const s of plan.shots) {
    const item=review.shots.find(x=>x.shot===s.shot);need(item.checks&&same(Object.keys(item.checks).sort(),CHECKS.slice().sort()),'every shot requires semantic_motion, anatomy_contact, continuity, repetition_pacing and story_asset_origin review');
    const local=new Set(ledger.artifacts.filter(a=>a.shot===s.shot).map(a=>a.id));local.add('source-video');
    for(const k of CHECKS){const c=item.checks[k];need(c?.status==='pass','shot '+s.shot+' '+k+' is pending/failed');observations(c.observations,{range:[s.clip_start_frame/p.fps,s.clip_end_frame/p.fps],artifacts:local,continuous:s.id+'-continuous'});}
  }
  need(hash(source)===output_sha256&&hash(ledgerFile)===evidence_sha256&&hash(reviewFile)===review_sha256&&digest(JSON.stringify(planB4Picture(p)))===plan_sha256,'media/evidence/review/plan/resources changed during acceptance');
  return {schema:1,status:'independent_picture_review_pass',scope:'picture only',delivery_ready:false,range:ledger.range,output:source,output_sha256,project_fingerprint,plan_sha256,evidence_sha256,review_sha256,reviewer,...(plan.viewing_profile==='portrait-phone'?{portrait_viewing:review.portrait_viewing}:{}),user_acceptance:'not_inferred',limits:LIMITS};
}
