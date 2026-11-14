// Current-media diagnostics and recorded independent review are separate gates.
// Reviewer identity, actual viewing and aesthetic judgment remain declarations.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {portraitHook, hookHeight} from './b4-opening.mjs';

const require=createRequire(import.meta.url);
let canvasRuntime;
const canvasAPI=()=>canvasRuntime??=require('@napi-rs/canvas');

const PHASES = ['entry', 'mid', 'settled', 'hold'];
const CHECKS = ['story_fit', 'hierarchy', 'material_finish', 'micro_animation', 'readability', 'timing'];
const LIMITS = ['Pixel diagnostics establish local change and current-media provenance, not aesthetic quality.',
  'Reviewer identity, independence, actual playback and judgment are declared, not authenticated.',
  'Image-embedded text must be declared; this gate does not certify that undeclared text was detected.',
  'Image-layer pixel change does not itself prove embedded glyph motion; the reviewer must inspect the glyphs.',
  'Environment marking classification is reviewed, not authenticated; titles, rules and warnings retain principal-text requirements.',
  'Independent agent review is not human or user acceptance; user acceptance is not inferred.'];
const fail = s => { throw Error('B4 typography: ' + s); };
const need = (v, s) => { if (!v) fail(s); };
const text = x => typeof x === 'string' && !!x.trim();
const digest = x => crypto.createHash('sha256').update(x).digest('hex');
const hash = f => digest(fs.readFileSync(f));
const json = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, x) => fs.writeFileSync(f, JSON.stringify(x, null, 2) + '\n');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const EPS = 1e-7;
const safeId = x => typeof x === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/.test(x);
function file(f) {
  const r = path.resolve(f);
  need(fs.existsSync(r) && fs.statSync(r).isFile() && fs.realpathSync(r) === r, 'file missing or symlink: ' + r);
  return r;
}
function command(exe, args, maxBuffer = 128 * 1024 * 1024) {
  const r = spawnSync(exe, args, {maxBuffer});
  need(!r.error && r.status === 0, 'media command failed: ' + (r.error?.message || String(r.stderr).slice(-1800)));
  return r.stdout;
}
function* layers(items) { for (const l of items || []) { yield l; if (l.children) yield* layers(l.children); } }
function frameAt(t, p) { return Math.min(Math.ceil(p.scope_end * p.fps - EPS) - 1, Math.max(0, Math.ceil(t * p.fps - EPS))); }
function region(r, h) {
  need(r && ['x', 'y', 'w', 'h'].every(k => Number.isFinite(r[k])) && r.x >= 0 && r.y >= 0 && r.w > 0 && r.h > 0 && r.x + r.w <= 1280 + EPS && r.y + r.h <= h + EPS, 'region must lie inside the 1280-unit design plane');
  return {x:r.x, y:r.y, w:r.w, h:r.h};
}
function resolveShot(p, value) {
  need(Number.isInteger(value)||text(value),'moment shot must be an explicit id or 0-based index');
  const i = Number.isInteger(value) ? value : p.shots.findIndex(s => s.id === value);
  need(i >= 0 && i < p.shots.length, 'moment shot must identify a current shot (id or 0-based index)'); return i;
}

export function planB4Typography(p) {
  if (p.style !== 'B4') return null;
  need(Number.isFinite(p.duration) && Number.isInteger(p.fps) && p.fps > 0 && p.width > 0 && p.height > 0, 'invalid project dimensions/timing');
  const scope_end = p.rangeEnd ?? p.duration, h = 1280 * p.height / p.width;
  need(scope_end > 0 && scope_end <= p.duration + EPS, 'invalid review scope');
  const context = {scope_end, fps:p.fps}, registry = [], seen = new Set();
  for (const [shot, s] of p.shots.entries()) for (const l of layers(s.layers)) {
    if (l.type !== 'text' || s.start + (l.from || 0) >= scope_end) continue;
    need(safeId(l.id) && !/^caption-\d+$/.test(l.id) && !seen.has(l.id), 'every known text layer needs a globally unique stable id outside reserved caption-N ids'); seen.add(l.id);
    registry.push({id:l.id, shot, kind:'text', text:l.text, start:s.start + (l.from || 0), end:Math.min(s.end, s.start + (l.to ?? Infinity), scope_end)});
  }
  const typography = p.typography;
  if (typography) need(text(typography.author_id), 'explicit typography plan needs actual author_id');
  for (const item of typography?.image_text || []) {
    const shot = resolveShot(p, item.shot), candidates = [...layers(p.shots[shot].layers)];
    need(item.role === undefined || ['principal','environment_marking'].includes(item.role), 'image_text role must be principal or environment_marking');
    if (item.role === 'environment_marking') {
      const ids=item.layer_ids ?? [item.layer_id], selected=Array.isArray(ids)?ids.map(id=>candidates.find(l=>l.id===id)):[];
      need(safeId(item.id)&&!seen.has(item.id)&&!/^caption-\d+$/.test(item.id)&&text(item.text)&&text(item.classification_reason),'environment_marking needs a unique id, exact text and physical-marking classification_reason');
      need(selected.length>0&&new Set(ids).size===ids.length&&selected.every(l=>l?.type==='image'&&safeId(l.id)),'environment_marking must identify its actual image layer(s)');
      need(item.times&&PHASES.every(k=>Number.isFinite(item.times[k])),'environment_marking needs all four actual evidence phase times');
      const start=Math.min(...selected.map(l=>p.shots[shot].start+(l.from||0))),end=Math.min(p.shots[shot].end,Math.max(...selected.map(l=>p.shots[shot].start+(l.to??Infinity))),scope_end);
      if(start>=scope_end)continue;
      const resources=selected.map(l=>{const source=file(path.resolve(p.base||'.',l.path));return {id:l.id,path:source,sha256:hash(source)};});
      seen.add(item.id);registry.push({id:item.id,shot,kind:'environment_marking',text:item.text,start,end,source_layer_ids:ids,classification_reason:item.classification_reason,region:region(item.region,h),times:item.times,resources});continue;
    }
    const l = candidates.find(l => l.id === item.layer_id);
    need(l?.type === 'image' && safeId(l.id) && !/^caption-\d+$/.test(l.id) && !seen.has(l.id) && text(item.text), 'image_text must declare a unique actual image layer and its principal text');
    const start=p.shots[shot].start+(l.from||0);if(start>=scope_end)continue;
    seen.add(l.id); registry.push({id:l.id, shot, kind:'image_text', text:item.text, start, end:Math.min(p.shots[shot].end,p.shots[shot].start+(l.to??Infinity),scope_end)});
  }
  const principalRegistry=registry.filter(l=>l.kind!=='environment_marking');
  const moments = [], assigned = [],caption_diagnostics=[];
  const add = (m, kind, allowed, bounds, sources=registry,diagnosticOnly=false) => {
    need(safeId(m.id) && ![...moments,...caption_diagnostics].some(x => x.id === m.id), 'moments need globally unique safe ids');
    need(Array.isArray(m.layer_ids) && m.layer_ids.length && new Set(m.layer_ids).size === m.layer_ids.length && m.layer_ids.every(id => allowed.includes(id)), 'moment ' + m.id + ' has unknown/duplicate text ids');
    need(text(m.intent) && text(m.treatment), 'moment ' + m.id + ' needs story intent and typography treatment');
    need(m.times && PHASES.every(k => Number.isFinite(m.times[k])), 'moment needs four phase times');
    const times = Object.fromEntries(PHASES.map(k => [k, m.times[k]])), indices = PHASES.map(k => frameAt(times[k], context));
    need(times.entry >= bounds[0] - EPS && times.entry < times.mid && times.mid < times.settled && times.settled <= times.hold && times.hold < bounds[1] + EPS && times.hold < scope_end, 'moment times must be ordered within visible source/review range');
    need(indices[0] < indices[1] && indices[1] < indices[2] && indices[2] <= indices[3], 'entry, mid and settled require three distinct final-video frames');
    const selected=m.layer_ids.map(id=>sources.find(s=>s.id===id));need(selected.every(Boolean),'moment source registry is incomplete');
    if(kind!=='caption')need(selected.every(s=>s.start<=indices[1]/p.fps+EPS&&s.end>indices[2]/p.fps+EPS),'every grouped text member must actually be visible in its mid/settled phases; future text needs its own moment');
    const clip_start_frame=Math.max(0,Math.min(indices[0],...selected.map(s=>Math.ceil(s.start*p.fps-EPS)))),clip_end_frame=Math.max(indices[3]+1,...selected.map(s=>Math.ceil(s.end*p.fps-EPS)));
    assigned.push(...m.layer_ids);(diagnosticOnly?caption_diagnostics:moments).push({id:m.id,kind,shot:m.shot ?? null,layer_ids:[...m.layer_ids],region:region(m.region,h),times,frame_indices:Object.fromEntries(PHASES.map((k,i)=>[k,indices[i]])),clip_start_frame,clip_end_frame,intent:m.intent,treatment:m.treatment});
  };
  if (!typography?.moments) {
    const o = p.opening, setup = registry.find(l => l.id === o?.setup), payoff = registry.find(l => l.id === o?.payoff);
    need(principalRegistry.every(l => [setup?.id,payoff?.id].includes(l.id)), 'body text requires explicit typography.moments; opening-only diagnostics cannot cover it');
    if (setup && payoff) {
      const s = p.shots[0], ls = [...layers(s.layers)], a = ls.find(l=>l.id===setup.id), b=ls.find(l=>l.id===payoff.id);
      const end = Math.min(s.end,scope_end), mid = frameAt(payoff.start,context)/p.fps, settled = frameAt(payoff.start+.2,context)/p.fps;
      const portrait = portraitHook(p), top = Math.max(0,a.y-24);
      const hookRegion = portrait ? {x:64,y:top,w:1152,h:b.y+hookHeight(b)+50-top} : {x:Math.max(0,Math.min(a.x,b.x)-18),y:Math.max(0,a.y-18),w:Math.min(650,1280)-Math.max(0,Math.min(a.x,b.x)-18),h:Math.min(h-110,b.y+b.size*2.3+30)-Math.max(0,a.y-18)};
      add({id:'opening-hook',shot:0,layer_ids:[a.id,b.id],region:hookRegion,
        times:{entry:Math.min(mid-1/p.fps,Math.ceil(.12*p.fps)/p.fps),mid,settled,hold:(Math.ceil(end*p.fps)-1)/p.fps},intent:'Read the approved setup, then the whole payoff as one story hook.',treatment:portrait ? 'Native portrait poster: centered Nunito setup; explicit Anton semantic lines, coral/cream depth and one uniform whole-block settle above unobscured story art.' : 'Fixed rounded warm-white setup, coral payoff, whole-block settle and readable hold.'},'hook',registry.map(l=>l.id),[s.start,end]);
    }
  } else {
    need(Array.isArray(typography.moments), 'typography.moments must be an array');
    for (const m of typography.moments) {
      if (m.times?.entry >= scope_end) continue;
      const shot = resolveShot(p,m.shot), s=p.shots[shot], known=principalRegistry.filter(l=>l.shot===shot);
      add({...m,shot},'text',known.map(l=>l.id),[s.start,Math.min(s.end,scope_end)]);
    }
  }
  for(const e of registry.filter(l=>l.kind==='environment_marking')) {
    add({id:e.id,shot:e.shot,layer_ids:[e.id],region:e.region,times:e.times,intent:'Inspect the physical scene marking: '+e.text,treatment:'Stable marking attached to its real scene object; classification and all six checks require independent actual-MP4 review.'},'environment_marking',[e.id],[e.start,e.end],[e]);
    Object.assign(moments.at(-1),{layer_ids:e.source_layer_ids,registry_ids:[e.id],text:e.text,classification_reason:e.classification_reason,resources:e.resources});
  }
  need(same([...assigned].sort(),registry.map(l=>l.id).sort()), 'known principal text must be covered exactly once; omitted/duplicate text is not reviewable');
  const cues = (p.captions || []).map((c,i)=>({id:'caption-'+i,index:i,text:c.text,start:c.start,end:Math.min(c.end,scope_end)}));
  const captionGroups = typography?.caption_groups;
  if (captionGroups) {
    need(Array.isArray(captionGroups), 'caption_groups must be an array'); const covered=[];
    for (const g of captionGroups) {
      if (g.times?.entry >= scope_end) continue;
      need(!/^caption-\d+$/.test(g.id)&&Array.isArray(g.cue_indices) && g.cue_indices.length && g.cue_indices.every((i,n,a)=>Number.isInteger(i)&&cues[i]&&(n===0||i>a[n-1])), 'caption group needs ordered actual cue_indices and an id outside reserved caption-N ids');
      covered.push(...g.cue_indices); const selected=g.cue_indices.map(i=>cues[i]);
      add({...g,layer_ids:selected.map(c=>c.id)},'caption',cues.map(c=>c.id),[selected[0].start,selected.at(-1).end],cues);
    }
    need(same(covered.slice().sort((a,b)=>a-b),cues.map(c=>c.index)), 'caption groups must cover every actual cue exactly once');
  }
  for (const c of cues) {
    const a=Math.max(0,Math.ceil(c.start*p.fps-EPS)), z=Math.ceil(c.end*p.fps-EPS)-1, settled=Math.min(z,a+Math.max(2,Math.ceil(.16*p.fps)));
    add({id:c.id,layer_ids:[c.id],region:{x:60,y:Math.max(0,h-118),w:1160,h:Math.min(h,118)},times:{entry:a/p.fps,mid:(a+1)/p.fps,settled:settled/p.fps,hold:z/p.fps},intent:'Read the complete timed semantic cue: '+c.text,treatment:'Restrained whole-cue alpha/lift entrance, followed by a stable readable hold.'},'caption',[c.id],[c.start,c.end],cues,!!captionGroups);
  }
  return {schema:1,status:'planned',author_id:typography?.author_id ?? null,width:p.width,height:p.height,fps:p.fps,scope_start:0,scope_end,registry,captions:cues,moments,caption_diagnostics,...(p.height>p.width?{viewing_profile:'portrait-phone'}:{}),limits:LIMITS};
}

const diagnosticMoments=plan=>[...plan.moments,...plan.caption_diagnostics];

function snapshot(canvas, width=320) {
  const {createCanvas}=canvasAPI();
  const c=createCanvas(width,Math.round(width*canvas.height/canvas.width)); c.getContext('2d').drawImage(canvas,0,0,c.width,c.height);
  return {width:c.width,height:c.height,data:c.getContext('2d').getImageData(0,0,c.width,c.height).data};
}
function diff(a,b,r) {
  const x=Math.max(0,Math.floor(r.x/1280*a.width)),y=Math.max(0,Math.floor(r.y/1280*a.width)),w=Math.max(1,Math.min(a.width-x,Math.ceil(r.w/1280*a.width))),h=Math.max(1,Math.min(a.height-y,Math.ceil(r.h/1280*a.width)));
  let sum=0,changed=0;
  for(let j=y;j<y+h;j++) for(let i=x;i<x+w;i++) {const n=(j*a.width+i)*4,d=(Math.abs(a.data[n]-b.data[n])+Math.abs(a.data[n+1]-b.data[n+1])+Math.abs(a.data[n+2]-b.data[n+2]))/(3*255);sum+=d;if(d>.035)changed++;}
  return {mean:sum/(w*h),fraction:changed/(w*h)};
}
export function checkB4TypographyPaint(p,{draw}) {
  const plan=planB4Typography(p); if(!plan)return null;
  need(typeof draw==='function','authored painter is required'); const metrics=[];
  for(const m of diagnosticMoments(plan)) {
    const at=k=>m.frame_indices[k]/p.fps;
    const frames=Object.fromEntries(PHASES.map(k=>[k,snapshot(draw(at(k),{focusIds:m.layer_ids}))]));
    const without=snapshot(draw(at('settled'),{focusIds:['__b4_typography_empty__']}));
    const ink=diff(frames.settled,without,m.region),entry_mid=diff(frames.entry,frames.mid,m.region),mid_settled=diff(frames.mid,frames.settled,m.region);
    need(ink.mean>.0008 && ink.fraction>.002,'moment '+m.id+' has no visible isolated text in its declared region');
    if(m.kind==='environment_marking') {
      const phases=[];
      for(const phase of PHASES){const isolated=frames[phase],empty=snapshot(draw(at(phase),{focusIds:['__b4_typography_empty__']})),glyph=diff(isolated,empty,m.region),composed=snapshot(draw(at(phase))),removed=snapshot(draw(at(phase),{omitIds:m.layer_ids})),visibility=diff(composed,removed,m.region);
        need(glyph.mean>.0008&&glyph.fraction>.002&&visibility.mean>=glyph.mean*.25&&visibility.fraction>=glyph.fraction*.2,'environment marking '+m.id+' must be visible and unobscured in all four phases');phases.push({phase,ink:glyph,visible:visibility});}
      metrics.push({id:m.id,kind:m.kind,phases,classification_status:'pending_independent_review',micro_animation:'independent review must confirm a stable physical marking, not title/rule/warning'});continue;
    }
    for(const [name,d] of Object.entries({entry_mid,mid_settled})) need(d.mean>=Math.max(.00012,ink.mean*.008)&&d.fraction>=.0005,'moment '+m.id+' needs actual local text micro-animation ('+name+'); background motion cannot supply it');
    const full=snapshot(draw(at('settled'))),omit=snapshot(draw(at('settled'),{omitIds:m.layer_ids})),visible=diff(full,omit,m.region);
    need(visible.mean>=ink.mean*.25 && visible.fraction>=ink.fraction*.2,'moment '+m.id+' is obscured in the actual composition');
    const members=[];
    if(m.kind!=='caption')for(const id of m.layer_ids) {
      const individual=snapshot(draw(at('settled'),{focusIds:[id]})),memberInk=diff(individual,without,m.region),memberVisible=diff(full,snapshot(draw(at('settled'),{omitIds:[id]})),m.region);
      need(memberInk.mean>.0008&&memberInk.fraction>.002&&memberVisible.mean>=memberInk.mean*.25&&memberVisible.fraction>=memberInk.fraction*.2,'grouped text member '+id+' must actually be visible, inside its region and unobscured');
      members.push({id,ink:memberInk,visible:memberVisible});
    }
    metrics.push({id:m.id,ink,entry_mid,mid_settled,visible,members});
  }
  return {status:'paint_diagnostic_pass',plan,metrics,limits:LIMITS};
}

function probeSource(p,source,ffprobe) {
  const m=JSON.parse(command(ffprobe,['-v','error','-show_streams','-show_format','-of','json',source]));const v=m.streams.find(s=>s.codec_type==='video');
  const [n,d]=String(v?.avg_frame_rate).split('/').map(Number);
  need(v?.width===p.width&&v?.height===p.height&&Math.abs(n/d-p.fps)<1e-6,'actual output dimensions/fps do not match project');
  need(Math.abs(Number(v.duration??m.format.duration)-(p.rangeEnd??p.duration))<=1/p.fps+.01 && Math.abs(Number(v.start_time??0))<.01,'actual output duration/start does not match current scope');
  return {width:v.width,height:v.height,fps:p.fps,duration:Number(v.duration??m.format.duration)};
}
async function checkFile(p,source,draw,ffmpeg) {
  const {loadImage,createCanvas}=canvasAPI();
  const diagnostic=checkB4TypographyPaint(p,{draw}),plan=diagnostic.plan,width=Math.min(160,Math.max(1,Math.round(160*p.width/p.height))),height=Math.round(width*p.height/p.width),n=Math.ceil(plan.scope_end*p.fps-EPS);
  // Decode native pixels, then downsample both sides with the same Canvas
  // kernel. Mixing FFmpeg bilinear with Canvas filtering falsely flags dense
  // portrait glyph edges; changing the tolerance would hide real differences.
  const sourceFrameBytes=p.width*p.height*4,chunkSize=Math.max(1,Math.min(p.fps*5,Math.floor(32*1024*1024/sourceFrameBytes)));
  const decoded=createCanvas(p.width,p.height),decodedContext=decoded.getContext('2d'),decodedPixels=decodedContext.createImageData(p.width,p.height);
  let max_mean=0;
  for(let start=0;start<n;start+=chunkSize) {
    const count=Math.min(chunkSize,n-start),raw=command(ffmpeg,['-v','error','-ss',String(start/p.fps),'-i',source,'-map','0:v:0','-frames:v',String(count),'-pix_fmt','rgba','-f','rawvideo','pipe:1'],count*sourceFrameBytes+1024*1024);
    need(raw.length===count*sourceFrameBytes,'actual output must contain every current final-video frame');
    for(let j=0;j<count;j++) {
    decodedPixels.data.set(raw.subarray(j*sourceFrameBytes,(j+1)*sourceFrameBytes));decodedContext.putImageData(decodedPixels,0,0);
    const i=start+j,actual=snapshot(decoded,width),authored=snapshot(draw(i/p.fps),width),d=diff(actual,authored,{x:0,y:0,w:1280,h:1280*p.height/p.width});
    need(d.mean<=.03&&d.fraction<=.09,'exported frame '+i+' does not match current authored composition');max_mean=Math.max(max_mean,d.mean);
    for(const m of diagnosticMoments(plan)) if(i>=m.clip_start_frame&&i<m.clip_end_frame) {
      const local=diff(actual,authored,m.region);need(local.mean<=.04&&local.fraction<=.18,'exported typography frame '+i+' differs for '+m.id);
    }
    }
  }
  // A broad codec tolerance alone would allow stripping a subtle settle. Test
  // the glyph pixels that distinguish each phase from its next authored phase.
  // The alternative keeps the current background and substitutes only the
  // isolated typography difference, so a moving picture cannot supply proof.
  const phase_matches=[];
  for(const m of diagnosticMoments(plan).filter(m=>m.kind!=='environment_marking')) for(const [phase,next] of [['entry','mid'],['mid','settled']]) {
    const t=m.frame_indices[phase]/p.fps,actualImage=await loadImage(command(ffmpeg,['-v','error','-ss',String(t),'-i',source,'-frames:v','1','-c:v','png','-threads:v','1','-f','image2pipe','pipe:1']));
    const actual=snapshot(actualImage),authored=snapshot(draw(t)),isolated=snapshot(draw(t,{focusIds:m.layer_ids})),other=snapshot(draw(m.frame_indices[next]/p.fps,{focusIds:m.layer_ids}));
    let currentError=0,alternativeError=0,count=0;
    const r=m.region,x0=Math.floor(r.x/4),y0=Math.floor(r.y/4),x1=Math.min(actual.width,Math.ceil((r.x+r.w)/4)),y1=Math.min(actual.height,Math.ceil((r.y+r.h)/4));
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++) {
      const at=(y*actual.width+x)*4,change=(Math.abs(isolated.data[at]-other.data[at])+Math.abs(isolated.data[at+1]-other.data[at+1])+Math.abs(isolated.data[at+2]-other.data[at+2]))/(3*255);
      if(change<.045)continue;
      for(let k=0;k<3;k++){const expected=authored.data[at+k],alternative=Math.max(0,Math.min(255,expected+other.data[at+k]-isolated.data[at+k]));currentError+=Math.abs(actual.data[at+k]-expected)/255;alternativeError+=Math.abs(actual.data[at+k]-alternative)/255;count++;}
    }
    need(count>0&&currentError/count<alternativeError/count*.8,'exported typography '+m.id+' '+phase+' does not retain its actual local micro-animation');
    phase_matches.push({id:m.id,phase,current_error:currentError/count,alternative_error:alternativeError/count});
  }
  return {status:'file_diagnostic_pass',frames_checked:n,max_mean,paint:diagnostic.metrics,phase_matches};
}
function crop(m,p) {
  const scale=p.width/1280,x=Math.floor(m.region.x*scale),y=Math.floor(m.region.y*scale);
  return [x,y,Math.min(p.width-x,Math.ceil(m.region.w*scale)),Math.min(p.height-y,Math.ceil(m.region.h*scale))];
}
function descriptors(plan,p) {
  return diagnosticMoments(plan).flatMap(m=>[...PHASES.map(phase=>({id:m.id+'-'+phase,moment:m.id,type:'png',phase,frame_index:m.frame_indices[phase],crop:crop(m,p),file:m.id+'-'+phase+'.png'})),{id:m.id+'-continuous',moment:m.id,type:'clip',start_frame:m.clip_start_frame,end_frame:m.clip_end_frame,crop:crop(m,p),audio:m.kind==='caption'?'source_if_present':'none',file:m.id+'-continuous.mp4'}]);
}
function extract(source,a,p,ffmpeg,target) {
  const [x,y,w,h]=a.crop,filter=`format=rgb24,crop=${w}:${h}:${x}:${y}:exact=1`;
  if(a.type==='png') {
    const bytes=command(ffmpeg,['-v','error','-ss',String(a.frame_index/p.fps),'-i',source,'-map','0:v:0','-vf',filter,'-frames:v','1','-c:v','png','-threads:v','1','-pix_fmt','rgb24','-f','image2pipe','pipe:1']);if(target)fs.writeFileSync(target,bytes);return digest(bytes);
  }
  const audio=a.audio==='source_if_present'?['-map','0:a:0?','-c:a','aac','-b:a','128k','-threads:a','1','-flags:a','+bitexact']:['-an'];
  command(ffmpeg,['-v','error','-ss',String(a.start_frame/p.fps),'-i',source,'-map','0:v:0','-vf',filter+',pad=ceil(iw/2)*2:ceil(ih/2)*2,format=yuv420p','-frames:v',String(a.end_frame-a.start_frame),'-t',String((a.end_frame-a.start_frame)/p.fps),'-r',String(p.fps),...audio,'-c:v','libx264','-preset','fast','-crf','23','-threads:v','1','-flags:v','+bitexact','-map_metadata','-1','-movflags','+faststart','-n',target]);return hash(target);
}
function binding(p,projectFingerprint) {
  const fingerprint=projectFingerprint??p.fingerprint;
  need(text(fingerprint) && (!p.fingerprint||p.fingerprint===fingerprint),'current project fingerprint is required and must match project');return fingerprint;
}
function template(plan,output_sha256,evidence_sha256,artifacts) {
  return {schema:1,author_id:plan.author_id,reviewer:{id:'',kind:'agent',method:'',independent:false},output_sha256,evidence_sha256,
    full_playback:{status:'unknown',viewed_ranges:[],observations:[]},
    ...(plan.viewing_profile==='portrait-phone'?{portrait_viewing:{status:'unknown',display_width:null,display_height:null,playback_speed:null,platform:'',real_device:{checked:null,limitation:''},observations:[]}}:{}),
    moments:plan.moments.map(m=>({id:m.id,...(m.kind==='environment_marking'?{environment_classification:{status:'unknown',text:m.text,classification_reason:m.classification_reason,is_physical_marking:null,is_title_or_rule_or_warning:null,observations:[]}}:{}),checks:Object.fromEntries(CHECKS.map(k=>[k,{status:'unknown',observations:[]}]))})),blocking_issues:[],evidence_ids:artifacts.map(a=>a.id),limits:LIMITS};
}
export async function buildB4TypographyEvidence(p,{file:source,draw,out,projectFingerprint,ffmpeg=process.env.FFMPEG||'ffmpeg',ffprobe=process.env.FFPROBE||'ffprobe'}) {
  source=file(source);const output_sha256=hash(source),project_fingerprint=binding(p,projectFingerprint),plan=planB4Typography(p);need(plan,'B4 project required');
  need(fs.existsSync(out)&&fs.statSync(out).isDirectory()&&fs.realpathSync(path.resolve(out))===path.resolve(out)&&fs.readdirSync(out).length===0,'evidence output must be a fresh empty real directory');
  const metadata=probeSource(p,source,ffprobe),diagnostic=await checkFile(p,source,draw,ffmpeg),artifacts=[];
  for(const a of descriptors(plan,p))artifacts.push({...a,sha256:extract(source,a,p,ffmpeg,path.join(out,a.file))});
  need(hash(source)===output_sha256&&digest(JSON.stringify(planB4Typography(p)))===digest(JSON.stringify(plan)),'source or plan changed during evidence build');
  const ledger_file=path.resolve(out,'evidence.json'),template_file=path.resolve(out,'review-template.json');
  const ledger={schema:1,status:'pending_independent_review',output:source,output_sha256,project_fingerprint,plan_sha256:digest(JSON.stringify(plan)),scope:{start:0,end:plan.scope_end},metadata,diagnostic,artifacts,evidence_dir:path.resolve(out),ledger_file,template_file,limits:LIMITS};
  write(ledger_file,ledger);write(template_file,template(plan,output_sha256,hash(ledger_file),artifacts));return ledger;
}
function observations(items,{scope,artifacts,continuous,full=false}) {
  need(Array.isArray(items)&&items.length>0,'each check needs specific timed observations');
  let hasContinuous=false;
  for(const o of items) {
    need(Number.isFinite(o.time)&&o.time>=scope[0]-EPS&&o.time<=scope[1]+EPS&&text(o.detail)&&!/^(pass|passed|ok|okay|good|fine|checked|done|通过|正常|已检查|合格)[.!。！\s]*$/iu.test(o.detail.trim()),'observation needs a concrete time and detail, not a pass label');
    need(Array.isArray(o.evidence_ids)&&o.evidence_ids.length>0&&o.evidence_ids.every(id=>artifacts.has(id)),'observation must reference actual evidence ids');
    if(o.evidence_ids.includes(continuous))hasContinuous=true;
  }
  need(hasContinuous,full?'full playback observations must reference source-video':'each check must reference its actual continuous clip');
}
export async function verifyB4TypographyReview(p,{file:source,draw,evidenceDir,reviewFile,projectFingerprint,ffmpeg=process.env.FFMPEG||'ffmpeg',ffprobe=process.env.FFPROBE||'ffprobe'}) {
  source=file(source);reviewFile=file(reviewFile);const review_sha256=hash(reviewFile),ledgerFile=file(path.join(evidenceDir,'evidence.json')),evidence_sha256=hash(ledgerFile),ledger=json(ledgerFile),review=json(reviewFile),plan=planB4Typography(p),output_sha256=hash(source),project_fingerprint=binding(p,projectFingerprint),plan_sha256=digest(JSON.stringify(plan));
  need(text(plan.author_id),'acceptance needs actual typography.author_id; legacy diagnostics alone cannot approve');
  need(ledger.schema===1&&ledger.status==='pending_independent_review'&&ledger.output===source&&ledger.output_sha256===output_sha256&&ledger.project_fingerprint===project_fingerprint&&ledger.plan_sha256===plan_sha256,'stale evidence/output/project/plan binding');
  need(same(ledger.scope,{start:0,end:plan.scope_end})&&same(ledger.metadata,probeSource(p,source,ffprobe)),'stale media metadata/scope');
  const expected=descriptors(plan,p);need(Array.isArray(ledger.artifacts)&&ledger.artifacts.length===expected.length,'missing/extra evidence artifacts');
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'b4-typography-verify-'));
  try {
    for(let i=0;i<expected.length;i++) {
      const a=ledger.artifacts[i],{sha256,...descriptor}=a;need(same(descriptor,expected[i]),'artifact descriptors do not match complete current plan');
      const f=file(path.join(evidenceDir,a.file));need(hash(f)===sha256,'evidence artifact hash changed');
      need(extract(source,expected[i],p,ffmpeg,a.type==='clip'?path.join(tmp,a.file):undefined)===sha256,'evidence artifact is not from current actual output: '+a.id);
    }
    await checkFile(p,source,draw,ffmpeg);
  } finally {fs.rmSync(tmp,{recursive:true,force:true});}
  need(review.schema===1&&review.author_id===plan.author_id&&review.output_sha256===output_sha256&&review.evidence_sha256===evidence_sha256,'review has stale/missing current output/evidence/author binding');
  const reviewer=review.reviewer;need(reviewer&&text(reviewer.id)&&reviewer.id!==plan.author_id&&['human','agent'].includes(reviewer.kind)&&text(reviewer.method)&&reviewer.independent===true,'review needs a declared independent reviewer distinct from actual author');
  need(Array.isArray(review.blocking_issues)&&review.blocking_issues.length===0,'blocking visual issues remain');
  const full=review.full_playback;need(full?.status==='pass'&&Array.isArray(full.viewed_ranges)&&full.viewed_ranges.length,'complete playback is pending/failed');
  let covered=0;for(const r of [...full.viewed_ranges].sort((a,b)=>a.start-b.start)){need(Number.isFinite(r.start)&&Number.isFinite(r.end)&&r.start>=0&&r.end>r.start&&r.end<=plan.scope_end+EPS&&r.start<=covered+EPS,'playback ranges omit current review scope');covered=Math.max(covered,r.end);}need(covered>=plan.scope_end-EPS,'complete playback omits current review tail');
  const artifacts=new Set(ledger.artifacts.map(a=>a.id));artifacts.add('source-video');observations(full.observations,{scope:[0,plan.scope_end],artifacts,continuous:'source-video',full:true});
  if(plan.viewing_profile==='portrait-phone') {
    const v=review.portrait_viewing;
    need(v?.status==='pass'&&Number.isFinite(v.display_width)&&v.display_width>=320&&v.display_width<=480&&Number.isFinite(v.display_height)&&v.display_height>v.display_width&&Math.abs((v.display_width/v.display_height)/(p.width/p.height)-1)<=.03&&v.playback_speed===1&&text(v.platform),'portrait phone-size playback record is pending/invalid; declare the actual 320–480px-wide portrait display, preserved aspect, normal speed and target platform');
    need(typeof v.real_device?.checked==='boolean'&&(v.real_device.checked||text(v.real_device.limitation)),'portrait playback must record whether a real device was checked and disclose any simulated-device limitation');
    observations(v.observations,{scope:[0,plan.scope_end],artifacts,continuous:'source-video',full:true});
  }
  need(Array.isArray(review.moments)&&same(review.moments.map(m=>m.id).sort(),plan.moments.map(m=>m.id).sort()),'review must cover every principal typography moment exactly once');
  for(const m of plan.moments) {
    const item=review.moments.find(x=>x.id===m.id);need(item.checks&&same(Object.keys(item.checks).sort(),CHECKS.slice().sort()),'moment requires all six independent review checks');
    const local=new Set(ledger.artifacts.filter(a=>a.moment===m.id).map(a=>a.id));local.add('source-video');
    if(m.kind==='environment_marking') {
      const c=item.environment_classification;
      need(c?.status==='pass'&&c.is_physical_marking===true&&c.is_title_or_rule_or_warning===false,'environment marking '+m.id+' classification is pending/failed; principal titles, rules and warnings cannot use this role');
      observations(c.observations,{scope:[m.clip_start_frame/p.fps,m.clip_end_frame/p.fps],artifacts:local,continuous:m.id+'-continuous'});
    }
    for(const k of CHECKS){const c=item.checks[k];need(c?.status==='pass','moment '+m.id+' '+k+' is pending/failed');observations(c.observations,{scope:[m.clip_start_frame/p.fps,m.clip_end_frame/p.fps],artifacts:local,continuous:m.id+'-continuous'});}
  }
  need(hash(source)===output_sha256&&hash(ledgerFile)===evidence_sha256&&hash(reviewFile)===review_sha256&&digest(JSON.stringify(planB4Typography(p)))===plan_sha256,'media/evidence/review/plan changed during acceptance');
  return {schema:1,status:'independent_visual_review_pass',output:source,output_sha256,project_fingerprint,plan_sha256,evidence_sha256,review_sha256,scope:ledger.scope,reviewer,...(plan.viewing_profile==='portrait-phone'?{portrait_viewing:review.portrait_viewing}:{}),user_acceptance:'not_inferred',limits:LIMITS};
}
