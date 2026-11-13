// Evidence provenance and recorded review are gates, not an aesthetic oracle.
// No renderer or optional graphics package is imported by this module.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {planBStylePortrait, isBStylePortrait} from './b-style-portrait.mjs';
import {planB3Semantics} from './b3-semantic-motion.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EPS = 1e-7;
const CHECKS = {
  B1: ['drawing_character','semantic_acting','contact_continuity','composition_evidence','typography_captions','timing_pacing','sound'],
  B2: ['color_handdrawn_design','semantic_motion_states','contact_continuity','composition_progression','typography_captions','timing_pacing','sound'],
  B3: ['silhouette_design','semantic_action','graphic_inventory','contact_occlusion','composition_editing','television_finish','typography_captions','timing_pacing','sound'],
};
const BASIC = new Set(['typography_captions','timing_pacing','sound','graphic_inventory']);
const PORTRAIT_CHECKS = ['native_composition','caption_readability','action_visibility','platform_safe_area'];
const PORTRAIT_ASPECTS = ['caption_readability','scene_legibility','action_contact','platform_occlusion'];
const LIMITS = [
  'Hashes, decoded artifacts and complete coverage establish current-media provenance, not aesthetic equivalence.',
  'Reviewer identity, independence, actual viewing/listening and capability limitations are declarations, not authenticated facts.',
  'Independent agent review does not imply human approval or user acceptance.',
  'Sample-target review compares the available approved examples, not identical plots, voices, pixels or unavailable originals.',
  'B3 endpoint geometry and authored intentions are diagnostics. Each graphic and motion event still needs actual-MP4 independent review; wrong relationships and meaningless motion cannot receive a limited-capability waiver.',
];
const fail = message => { throw Error('B-style reference review: ' + message); };
const need = (condition, message) => { if (!condition) fail(message); };
const text = x => typeof x === 'string' && !!x.trim();
const generic = /^(?:pass|passed|ok|okay|good|fine|checked|done|n\/?a|unknown|none|通过|正常|已检查|合格|无|没有)[.!。！\s]*$/iu;
const concrete = x => text(x) && !generic.test(x.trim());
const digest = x => crypto.createHash('sha256').update(x).digest('hex');
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f,x) => fs.writeFileSync(f, JSON.stringify(x,null,2)+'\n');
function hash(f) {
  const h=crypto.createHash('sha256'), fd=fs.openSync(f,'r'), b=Buffer.alloc(1024*1024);
  try { let n; while ((n=fs.readSync(fd,b,0,b.length,null))) h.update(b.subarray(0,n)); } finally {fs.closeSync(fd);}
  return h.digest('hex');
}
function localFile(f) {
  need(text(f),'local file path is required'); const absolute=path.resolve(f);
  need(fs.existsSync(absolute) && fs.lstatSync(absolute).isFile() && fs.realpathSync(absolute)===absolute,'file missing or symlink: '+absolute);
  return absolute;
}
function localDir(f, fresh=false) {
  need(text(f),'local directory is required'); const absolute=path.resolve(f);
  need(fs.existsSync(absolute) && fs.lstatSync(absolute).isDirectory() && fs.realpathSync(absolute)===absolute,'directory missing or symlink: '+absolute);
  if(fresh) need(fs.readdirSync(absolute).length===0,'evidence output must be a fresh empty directory');
  return absolute;
}
function command(exe,args,maxBuffer=8*1024*1024) {
  const r=spawnSync(exe,args,{maxBuffer});
  need(!r.error&&r.status===0,'media command failed: '+(r.error?.message||String(r.stderr).slice(-1600)));
  return r.stdout;
}
function safeReference(base,relative) {
  need(text(relative)&&!path.isAbsolute(relative),'reference path must be relative to its manifest');
  const resolved=path.resolve(base,relative);
  need(resolved.startsWith(ROOT+path.sep),'reference escapes the installed Skill');return localFile(resolved);
}

function referenceSet(style, project = {}) {
  need(CHECKS[style],'only B1, B2 and B3 have this reference gate');
  const manifests=[], refs=[];
  const manifest=relative=>{const f=localFile(path.join(ROOT,relative));manifests.push({path:f,sha256:hash(f)});return {data:read(f),base:path.dirname(f)};};
  const add=(base,item,extra)=>{
    const f=safeReference(base,item.path);
    need(/^[a-f0-9]{64}$/.test(item.sha256||'')&&hash(f)===item.sha256,'bundled reference hash mismatch: '+item.path);
    const r={id:extra.id,path:f,sha256:item.sha256,kind:extra.kind,role:extra.role,duration:extra.duration??null,has_audio:extra.has_audio??false,required_comparison:extra.required_comparison??false,limitations:extra.limitations||[]};
    need(text(r.id)&&!refs.some(x=>x.id===r.id),'duplicate/missing reference id');refs.push(r);
  };
  if(style==='B1') {
    const m=manifest('assets/b1/approved-baseline.json');
    need(m.data.schema==='b1-reference-evidence-v1'&&m.data.baseline_id==='b1-2026-10-23-ryan-v4','unexpected B1 baseline identity');
    const expected=[['approved-2026-10-23.mp4','b1-ryan-v4','video'],['approved-2026-10-23-contact-sheet.png','b1-ryan-contact-sheet','image'],['approved-2026-10-23-motion-sheet.png','b1-ryan-motion-sheet','image']];
    for(const [p,id,kind] of expected) {
      const item=m.data.evidence.find(e=>e.path===p);need(item,'missing B1 baseline evidence');
      add(m.base,item,{id,kind,role:'approved_baseline',duration:kind==='video'?item.duration_seconds:null,has_audio:kind==='video',required_comparison:kind==='video',limitations:kind==='image'?['Static sheet cannot demonstrate continuous motion, subtitle timing or listening.']:[]});
    }
    const full=manifest('assets/b1/approved-production-standard.json');
    need(full.data.schema==='b1-production-standard-v1'&&full.data.standard_id==='b1-2026-10-24-longform-v4','unexpected B1 long-form identity');
    const sheet=full.data.evidence.find(e=>e.path==='approved-2026-10-24-longform-contact-sheet.jpg');need(sheet,'missing B1 long-form sheet');
    add(full.base,sheet,{id:'b1-full-v4-contact-sheet',kind:'image',role:'approved_longform_sampled_sheet',limitations:['Full V4 film is not bundled. This sampled sheet cannot establish continuous long-form motion or audio.']});
  } else if(style==='B2') {
    const pub=manifest('assets/b2/public-showcase.json');
    need(pub.data.schema===1&&pub.data.style==='B2'&&pub.data.path_base==='manifest_directory','unexpected B2 public showcase manifest');
    need(Array.isArray(pub.data.evidence)&&pub.data.evidence.length===2,'both B2 public full samples must be locked');
    for(const id of ['b2-colorful-sleep','b2-colorful-phone-weather']) {
      const item=pub.data.evidence.find(e=>e.id===id);need(item?.kind==='video'&&item.role==='public_showcase'&&Number.isFinite(item.duration)&&item.duration>0,'missing B2 public full sample');
      add(pub.base,item,{id,kind:'video',role:'public_showcase',duration:item.duration,has_audio:true,required_comparison:true,limitations:[...(pub.data.limitations||[]),...(item.limitations||[])]});
    }
    const board=manifest('assets/b2/approved-style-board.json');
    need(board.data.board==='approved-style-board.jpg'&&board.data.source_sha256===refs.find(r=>r.id==='b2-colorful-phone-weather').sha256,'B2 sampled board must name the locked accepted phone/weather source');
    add(board.base,{path:board.data.board,sha256:board.data.board_sha256},{id:'b2-approved-style-board',kind:'image',role:'approved_style_board',limitations:['Sampled still board supports drawing, color and caption appearance only; it cannot demonstrate continuous action, timing or sound.']});
  } else {
    const m=manifest('assets/b3/reference-manifest.json');
    need(m.data.schema==='b3-public-reference-lock-v1'&&m.data.style==='B3','unexpected B3 reference manifest');
    for(const id of ['accepted-dog','accepted-chair']) {
      const item=m.data.supplements.find(e=>e.id===id);need(item?.motion,'missing B3 accepted implementation evidence');
      add(m.base,item,{id:'b3-'+id,kind:'image',role:'accepted_implementation',limitations:['Secondary implementation example; not a frame from the private original study video.']});
      add(m.base,item.motion,{id:'b3-'+id+'-motion',kind:'video',role:'accepted_implementation',duration:item.motion.duration_seconds,limitations:['Silent implementation excerpt; cannot establish sound or exact original-source fidelity.']});
    }
    for(const [i,item] of (m.data.boards||[]).entries()) add(m.base,item,{id:'b3-implementation-board-'+i,kind:'image',role:'browsing_board',limitations:['Labeled static browsing board, not a clean artwork or movement reference.']});
    {
      const pub=manifest('assets/b3/public-showcase.json');
      need(pub.data.schema===1&&pub.data.style==='B3'&&pub.data.path_base==='manifest_directory','unexpected B3 public showcase manifest');
      need(Array.isArray(pub.data.evidence)&&pub.data.evidence.length===2,'both B3 public full samples must be locked');
      for(const id of ['b3-tv-night-signal','b3-tv-dog']) {
        const item=pub.data.evidence.find(e=>e.id===id);need(item?.kind==='video'&&item.role==='public_showcase'&&Number.isFinite(item.duration)&&item.duration>0,'missing B3 public full sample');
        add(pub.base,item,{id,kind:'video',role:'public_showcase',duration:item.duration,has_audio:true,required_comparison:true,limitations:[...(pub.data.limitations||[]),...(item.limitations||[])]});
      }
    }
  }
  if (isBStylePortrait({...project, style})) {
    const key=style.toLowerCase(), baseline_id=key+'-native-portrait-2026-11-13';
    const m=manifest('assets/'+key+'/portrait-approved-2026-11-13.json');
    need(m.data.schema==='b123-approved-native-portrait-v1'&&m.data.style===style&&m.data.baseline_id===baseline_id,'unexpected approved native portrait identity');
    const video=m.data.video, poster=m.data.poster;
    need(video?.path==='portrait-approved-2026-11-13.mp4'&&video.duration===10&&video.width===720&&video.height===1280&&video.fps===30&&video.has_audio===true,'approved native portrait needs the exact ten-second 720x1280/30fps audible sample');
    need(m.data.user_acceptance?.status==='approved'&&concrete(m.data.user_acceptance.scope),'approved native portrait needs its exact-sample user acceptance scope');
    need(poster?.path==='portrait-approved-2026-11-13.jpg','approved native portrait poster is missing');
    const limitations=['User approval covers this exact ten-second effect sample, not unseen full films or future outputs.',...(m.data.limitations||[])];
    add(m.base,video,{id:baseline_id,kind:'video',role:'approved_native_portrait_effect',duration:video.duration,has_audio:true,required_comparison:true,limitations});
    add(m.base,poster,{id:baseline_id+'-poster',kind:'image',role:'approved_native_portrait_poster',limitations:['Static poster supports appearance only; it cannot replace continuous portrait playback.',...limitations]});
  }
  return {manifests,references:refs};
}

/** Files returned here belong in the caller's content fingerprint. */
export function referenceInputs(style, project = {}) {
  if(!CHECKS[style])return [];
  const r=referenceSet(style,project);return [...new Set([...r.manifests,...r.references].map(x=>x.path))];
}

export function planBStyleReference(p) {
  if(!CHECKS[p.style])return null;
  need(Number.isFinite(p.duration)&&p.duration>0&&Number.isInteger(p.fps)&&p.fps>0&&Number.isInteger(p.width)&&p.width>0&&Number.isInteger(p.height)&&p.height>0,'invalid project dimensions/timing');
  const scope_end=p.rangeEnd??p.duration;
  need(Number.isFinite(scope_end)&&scope_end>0&&scope_end<=p.duration+EPS,'invalid submitted review range');
  const total=Math.ceil(scope_end*p.fps-EPS),shots=[]; let covered=0,frames=0;
  need(Array.isArray(p.shots)&&p.shots.length>0,'shots must cover the entire submitted video');
  for(const [index,s] of p.shots.entries()) {
    need(Number.isFinite(s.start)&&Number.isFinite(s.end)&&s.start>=0&&s.end>s.start,'invalid shot times');
    if(s.start>=scope_end)continue;
    const end=Math.min(s.end,scope_end);
    need(Math.abs(s.start-covered)<=.002,'shot coverage has a gap or overlap');
    const start_frame=frames,end_frame=Math.min(total,Math.ceil(end*p.fps-EPS));
    need(end_frame>start_frame,'every submitted shot must contain a final-video frame');
    const id='shot-'+index;
    shots.push({id,index,source_id:s.id??null,start:s.start,end,start_frame,end_frame,phases:{start:start_frame,mid:Math.floor((start_frame+end_frame-1)/2),end:end_frame-1},shot_sha256:digest(JSON.stringify(s))});
    covered=end;frames=end_frame;
  }
  need(Math.abs(covered-scope_end)<=.002&&frames===total,'shots omit the submitted video tail');
  const rr=p.reference_review;
  need(rr===undefined||(rr&&typeof rr==='object'&&!Array.isArray(rr)),'reference_review must be an object');
  const capability=rr?.capability??{mode:'sample_target',environment:null,limitations:[]};
  need(capability&&['sample_target','limited'].includes(capability.mode)&&Array.isArray(capability.limitations),'capability needs sample_target/limited mode and limitations array');
  const refs=referenceSet(p.style,p);
  const styleLimits={B1:['The complete approved Full V4 film is unavailable in this bundle; only sampled long-form compositions are comparable.'],B2:['The accepted B2 board contains sampled stills, not motion or sound evidence. Both bundled full public implementations are the available effect targets, not mandatory stories, characters or scene sequences.'],B3:['The primary private study video is not bundled; public implementations do not establish exact original-source replication.']};
  const portrait=planBStylePortrait(p);
  const b3_semantics=planB3Semantics(p);
  return {schema:1,style:p.style,author_id:rr?.author_id??null,capability,width:p.width,height:p.height,fps:p.fps,scope_start:0,scope_end,frame_count:total,shots,caption_sha256:digest(JSON.stringify(p.captions||[])),reference_ids:refs.references.map(r=>r.id),checks:CHECKS[p.style],...(portrait?{portrait}:{}),...(b3_semantics?{b3_semantics}:{}),limits:[...LIMITS,...styleLimits[p.style]]};
}

function binding(p,fingerprint) {
  const f=fingerprint??p.fingerprint;
  need(text(f)&&(!p.fingerprint||p.fingerprint===f),'current matching project fingerprint is required');return f;
}
function currentInputs(p) {
  const inputs=(p.inputs||[]).map(i=>{
    const f=localFile(i.path),sha256=hash(f);need(sha256===i.sha256,'current project input changed: '+f);return {path:f,sha256};
  });
  // The caller fingerprints the submitted range. Future-shot edits must not
  // invalidate an accepted opening; only pin the project path across stages.
  return {file:p.file?localFile(p.file):null,inputs};
}
const projectFileHash=p=>p.file?hash(p.file):null;
function probe(p,source,ffprobe) {
  const info=JSON.parse(command(ffprobe,['-v','error','-show_streams','-show_format','-of','json',source]));
  const v=info.streams.find(s=>s.codec_type==='video'),audio=info.streams.filter(s=>s.codec_type==='audio');
  const rate=x=>{const [n,d]=String(x).split('/').map(Number);return n/d;};
  const fps=rate(v?.r_frame_rate),scope=p.rangeEnd??p.duration,duration=Number(v?.duration??info.format.duration),expected=Math.ceil(scope*p.fps-EPS);
  need(v?.width===p.width&&v?.height===p.height&&Math.abs(fps-p.fps)<1e-6,'actual video dimensions/fps differ from the current project');
  need(Number.isFinite(duration)&&Math.abs(duration-scope)<=1/p.fps+.01&&Math.abs(Number(v.start_time??0))<.01,'actual video timing differs from the submitted scope');
  need(audio.length>0,'final B1/B2/B3 video must retain actual narration/mix audio');
  let frames=Number(v.nb_frames);
  if(!Number.isInteger(frames)) {
    const counted=JSON.parse(command(ffprobe,['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=nb_read_frames','-of','json',source]));frames=Number(counted.streams?.[0]?.nb_read_frames);
  }
  need(frames===expected,'actual video frame count differs from the submitted range');
  // Concat/mux rounding can alter avg_frame_rate without altering frame cadence.
  // Decode bounded intervals and validate the actual presentation timestamps.
  const timestamps=[];let max_step_error=0;
  for(let start=0;start<duration;start+=10) {
    // Decode beyond the logical boundary so reordered B-frames are released;
    // only retain this chunk's presentation interval, avoiding duplicates.
    const end=Math.min(duration+.01,start+10),readEnd=Math.min(duration+.01,end+2),csv=String(command(ffprobe,['-v','error','-select_streams','v:0','-read_intervals',start+'%'+readEnd,'-show_entries','frame=best_effort_timestamp_time','-of','csv=p=0',source]));
    for(const line of csv.split('\n')) {
      const first=line.split(',')[0].trim();if(!first)continue;const t=Number(first);
      need(Number.isFinite(t),'actual video has an invalid frame timestamp');
      if(t<start-EPS||t>=end-EPS)continue;
      if(timestamps.length) {
        const delta=t-timestamps.at(-1),error=Math.abs(delta-1/p.fps);max_step_error=Math.max(max_step_error,error);
        need(delta>0&&error<=.0021,'actual video frame cadence differs from the current fps');
      } else need(Math.abs(t)<=.0021,'actual video frames do not start at the submitted origin');
      timestamps.push(t);
    }
  }
  need(timestamps.length===expected&&Math.abs(duration-timestamps.at(-1)-1/p.fps)<=.0021,'actual decoded frame count or final cadence differs from the current fps');
  return {metadata:{width:v.width,height:v.height,fps,average_fps:rate(v.avg_frame_rate),duration,frames,frame_timing_sha256:digest(JSON.stringify(timestamps)),max_step_error,video_codec:v.codec_name,audio:audio.map(a=>({codec:a.codec_name,sample_rate:Number(a.sample_rate),channels:a.channels}))},timestamps};
}
function descriptors(plan,timing) {
  return plan.shots.flatMap(s=>[
    ...Object.entries(s.phases).map(([phase,frame_index])=>({id:s.id+'-'+phase,shot:s.id,type:'png',phase,frame_index,source_time:timing.timestamps[frame_index],crop:[0,0,plan.width,plan.height],file:s.id+'-'+phase+'.png'})),
    {id:s.id+'-continuous',shot:s.id,type:'clip',start_frame:s.start_frame,end_frame:s.end_frame,source_start:timing.timestamps[s.start_frame],source_end:timing.timestamps[s.end_frame]??timing.metadata.duration,crop:[0,0,plan.width,plan.height],audio:'source',file:s.id+'-continuous.mp4'},
  ]);
}
function extract(source,a,plan,ffmpeg,target) {
  if(a.type==='png') {
    const bytes=command(ffmpeg,['-v','error','-ss',String(Math.max(0,a.source_time-.000001)),'-i',source,'-map','0:v:0','-frames:v','1','-c:v','png','-threads:v','1','-pix_fmt','rgb24','-f','image2pipe','pipe:1'],128*1024*1024);
    if(target)fs.writeFileSync(target,bytes);return digest(bytes);
  }
  command(ffmpeg,['-v','error','-ss',String(Math.max(0,a.source_start-.000001)),'-i',source,'-map','0:v:0','-map','0:a:0','-frames:v',String(a.end_frame-a.start_frame),'-t',String(a.source_end-a.source_start),'-r',String(plan.fps),'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2,format=yuv420p','-c:v','libx264','-preset','fast','-crf','23','-threads:v','1','-flags:v','+bitexact','-c:a','aac','-b:a','128k','-threads:a','1','-flags:a','+bitexact','-map_metadata','-1','-movflags','+faststart','-n',target]);return hash(target);
}
function b3ReviewTemplate(shot) {
  return {
    events:(shot?.events||[]).map(e=>({id:e.id,status:'unknown',spoken_meaning:'',contribution:'',observations:[]})),
    graphics:(shot?.graphics||[]).map(g=>({id:g.id,role:g.role,status:'unknown',use:'',
      ...(g.role==='connector'?{observed_source_id:'',observed_target_id:'',observed_relation:'',observed_direction:''}:{}),observations:[]})),
  };
}
function template(plan,video_sha256,evidence_sha256,references) {
  return {schema:1,style:plan.style,author_id:plan.author_id,capability:plan.capability,reviewer:{id:'',kind:'agent',method:'',independent:false},video_sha256,evidence_sha256,
    full_playback:{status:'unknown',viewed_ranges:[],observations:[]},baseline_comparisons:references.filter(r=>r.required_comparison).map(r=>({reference_id:r.id,start:null,end:null,observations:[]})),
    ...(plan.portrait?{portrait_viewing:{status:'unknown',display_width:null,display_height:null,playback_speed:null,platform:'',real_device:{checked:null,limitation:''},viewed_ranges:[],observations:[]}}:{}),
    shots:plan.shots.map(s=>({id:s.id,checks:Object.fromEntries(plan.checks.map(k=>[k,{status:'unknown',observations:[],comparisons:[]}])) ,
      ...(plan.b3_semantics?{b3_semantics:b3ReviewTemplate(plan.b3_semantics.shots.find(x=>x.id===s.id))}:{}),
      ...(plan.portrait?{portrait_checks:Object.fromEntries(PORTRAIT_CHECKS.map(k=>[k,{status:'unknown',observations:[]}]))}:{})})),blocking_issues:[],limits:plan.limits};
}

export async function buildBStyleReferenceEvidence(p,{file:source,out,projectFingerprint,ffmpeg=process.env.FFMPEG||'ffmpeg',ffprobe=process.env.FFPROBE||'ffprobe'}) {
  const plan=planBStyleReference(p);need(plan,'B1/B2/B3 project required');
  source=localFile(source);out=localDir(out,true);
  const output_sha256=hash(source),project_fingerprint=binding(p,projectFingerprint),project_inputs=currentInputs(p),project_file_sha256=projectFileHash(p),references=referenceSet(p.style,p),timing=probe(p,source,ffprobe),metadata=timing.metadata,artifacts=[];
  command(ffmpeg,['-v','error','-xerror','-i',source,'-map','0:v:0','-map','0:a:0','-f','null','-']);
  for(const a of descriptors(plan,timing))artifacts.push({...a,sha256:extract(source,a,plan,ffmpeg,path.join(out,a.file))});
  need(hash(source)===output_sha256&&projectFileHash(p)===project_file_sha256&&same(currentInputs(p),project_inputs)&&same(planBStyleReference(p),plan)&&same(referenceSet(p.style,p),references),'source, project inputs/plan or reference changed during evidence build');
  const ledger_file=path.join(out,'evidence.json'),template_file=path.join(out,'review-template.json');
  const ledger={schema:1,status:'pending_independent_review',style:plan.style,output:source,output_sha256,project_fingerprint,project_inputs,plan_sha256:digest(JSON.stringify(plan)),scope:{start:0,end:plan.scope_end},metadata,plan,references:references.references,reference_manifests:references.manifests,artifacts,evidence_dir:out,ledger_file,template_file,limits:plan.limits};
  write(ledger_file,ledger);write(template_file,template(plan,output_sha256,hash(ledger_file),references.references));return ledger;
}

function observations(items,{scope,ids,continuous}) {
  need(Array.isArray(items)&&items.length>0,'each review check needs concrete timed observations');let linked=false;
  for(const o of items) {
    need(Number.isFinite(o.time)&&o.time>=scope[0]-EPS&&o.time<=scope[1]+EPS&&concrete(o.detail),'observation needs an in-range time and concrete detail, not a status word');
    need(Array.isArray(o.evidence_ids)&&o.evidence_ids.length>0&&o.evidence_ids.every(id=>ids.has(id)),'observation references absent or unrelated evidence');
    if(o.evidence_ids.includes(continuous))linked=true;
  }
  need(linked,'review must cite its actual continuous clip/source');
}
function b3SemanticReview(item,shot,semantic,ids,fps) {
  const r=item.b3_semantics;
  need(r&&Array.isArray(r.events)&&Array.isArray(r.graphics),'B3 each shot needs per-event and per-graphic actual-video review');
  const matches=(items,expected)=>same(items.map(x=>x?.id).sort(),expected.map(x=>x.id).sort());
  need(matches(r.events,semantic.events)&&matches(r.graphics,semantic.graphics),'B3 review must cover every declared event and graphic exactly once');
  const continuous=shot.id+'-continuous',scope=[Math.max(shot.start,shot.start_frame/fps),(shot.end_frame-1)/fps];
  for(const e of semantic.events) {
    const c=r.events.find(x=>x.id===e.id);
    need(e.complete!==false&&e.end<=scope[1]+EPS,'B3 preview cuts off a planned event/result; include its complete action and an actual encoded result frame');
    need(c.status==='pass','B3 event '+e.id+' is pending/failed; capability limits cannot waive semantic correctness');
    need(concrete(c.spoken_meaning)&&concrete(c.contribution),'B3 event '+e.id+' needs observed spoken meaning and a concrete deletion-test contribution');
    observations(c.observations,{scope,ids,continuous});
    for(const phase of ['before','during','after']) {
      const phaseItems=c.observations.filter(o=>o.phase===phase);
      need(phaseItems.length>0,'B3 event '+e.id+' needs actual before/during/after observations');
      for(const o of phaseItems) {
        need(o.evidence_ids.includes(continuous),'B3 event phases must cite the actual continuous clip');
        need(phase==='before'?o.time<=e.start+EPS:phase==='after'?o.time>=e.end-EPS:o.time>=e.start-EPS&&o.time<=e.end+EPS,'B3 event observation phase does not match its actual event timing');
      }
    }
    need(c.observations.every(o=>['before','during','after'].includes(o.phase)),'B3 event observation phase must be before, during or after');
  }
  for(const g of semantic.graphics) {
    const c=r.graphics.find(x=>x.id===g.id);
    need(c.role===g.role&&c.status==='pass'&&concrete(c.use),'B3 graphic '+g.id+' needs an observed use and a passed correct-classification/targeting review; no capability waiver');
    observations(c.observations,{scope,ids,continuous});
    need(c.observations.every(o=>o.time>=g.review_start-EPS&&o.time<g.review_end),'B3 graphic observation must fall inside its actual visible review interval');
    if(g.role==='connector') {
      need(c.observed_source_id===g.source.layer_id&&c.observed_target_id===g.target.layer_id,'B3 observed connector source/target differs from the declared relationship');
      need(concrete(c.observed_relation)&&c.observed_direction===(g.directed?'source_to_target':'undirected'),'B3 connector needs its observed relation and correct direction');
      need(Number.isFinite(g.geometry.completed_start)&&c.observations.some(o=>o.time>=g.geometry.completed_start-EPS&&o.evidence_ids.includes(continuous)),'B3 connector review needs its actual complete visible relationship, not only a partial stroke');
    }
  }
}
function comparison(c,refs,{sound=false}={}) {
  const ref=refs.find(r=>r.id===c?.reference_id);need(ref,'comparison must name actual available reference media');
  need(concrete(c.detail),'comparison needs a concrete observed difference or correspondence');
  if(ref.kind==='video')need(Number.isFinite(c.start)&&Number.isFinite(c.end)&&c.start>=0&&c.end>c.start&&c.end<=ref.duration+EPS,'comparison needs a valid nonempty reference video interval');
  else need(c.start===null&&c.end===null,'static reference comparison must not claim a motion interval');
  if(sound)need(ref.kind==='video'&&ref.has_audio,'sound comparison requires an actually audible reference');
  return ref;
}
function playback(full,plan,ids) {
  need(full?.status==='pass'&&Array.isArray(full.viewed_ranges)&&full.viewed_ranges.length>0,'whole submitted playback remains pending or failed');let covered=0;
  for(const r of [...full.viewed_ranges].sort((a,b)=>a.start-b.start)) {
    need(Number.isFinite(r.start)&&Number.isFinite(r.end)&&r.start>=0&&r.end>r.start&&r.end<=plan.scope_end+EPS&&r.start<=covered+EPS,'playback ranges must cover the whole submitted video');covered=Math.max(covered,r.end);
  }
  need(covered>=plan.scope_end-EPS,'playback ranges omit the submitted tail');
  observations(full.observations,{scope:[0,plan.scope_end],ids,continuous:'source-video'});
}
function portraitPlayback(viewing,plan) {
  need(viewing?.status==='pass'&&Number.isFinite(viewing.display_width)&&viewing.display_width>=320&&viewing.display_width<=480&&Number.isFinite(viewing.display_height)&&viewing.display_height>viewing.display_width&&Math.abs(viewing.display_height-viewing.display_width*plan.height/plan.width)<=1&&viewing.playback_speed===1&&concrete(viewing.platform),'portrait phone-size playback record is pending/invalid; record the actual 320–480px-wide display, preserved aspect, normal speed and concrete target platform');
  need(typeof viewing.real_device?.checked==='boolean'&&(viewing.real_device.checked||concrete(viewing.real_device.limitation)),'portrait playback must record whether a real device was checked and disclose a concrete simulated-device limitation');
  // A phone-size observation of a still or unrelated clip cannot stand in for
  // complete playback of the encoded source at the recorded viewing size.
  playback(viewing,plan,new Set(['source-video']));
  const aspects=new Set();
  for(const observation of viewing.observations) {
    need(PORTRAIT_ASPECTS.includes(observation.aspect),'portrait phone-size observation must identify caption_readability, scene_legibility, action_contact or platform_occlusion');
    aspects.add(observation.aspect);
  }
  need(PORTRAIT_ASPECTS.every(aspect=>aspects.has(aspect)),'portrait phone-size playback must explicitly observe captions, scene legibility, action/contact and target-platform occlusion');
}
function capability(plan) {
  need(text(plan.author_id),'acceptance requires the actual reference_review.author_id');
  const c=plan.capability;need(concrete(c.environment),'acceptance requires the actual production environment');
  if(c.mode==='limited') {
    need(c.limitations.length>0,'limited mode requires observed capability limitations, not an assistant brand');
    const brandOnly=/^(?:other ai|another ai|codex|claude(?: code)?|cursor|antigravity|其他ai|其它ai|别的ai|其他模型)[.!。！\s]*$/iu;
    for(const l of c.limitations)need(concrete(l?.capability)&&concrete(l?.observed)&&concrete(l?.impact)&&![l.capability,l.observed,l.impact].some(x=>brandOnly.test(x.trim())),'each capability limitation needs a concrete capability, observed test/result and effect impact; a host brand alone is insufficient');
  } else need(c.limitations.length===0,'sample_target cannot conceal declared capability limitations; use limited mode');
}

export async function verifyBStyleReferenceReview(p,{file:source,evidenceDir,reviewFile,projectFingerprint,ffmpeg=process.env.FFMPEG||'ffmpeg',ffprobe=process.env.FFPROBE||'ffprobe'}) {
  const plan=planBStyleReference(p);need(plan,'B1/B2/B3 project required');capability(plan);
  if(p.style==='B3')planB3Semantics(p,{required:true});
  source=localFile(source);evidenceDir=localDir(evidenceDir);reviewFile=localFile(reviewFile);
  const ledgerFile=localFile(path.join(evidenceDir,'evidence.json')),evidence_sha256=hash(ledgerFile),review_sha256=hash(reviewFile),ledger=read(ledgerFile),review=read(reviewFile),output_sha256=hash(source),project_fingerprint=binding(p,projectFingerprint),project_inputs=currentInputs(p),project_file_sha256=projectFileHash(p),plan_sha256=digest(JSON.stringify(plan)),references=referenceSet(p.style,p);
  need(ledger.schema===1&&ledger.status==='pending_independent_review'&&ledger.style===p.style&&ledger.output===source&&ledger.output_sha256===output_sha256&&ledger.project_fingerprint===project_fingerprint&&ledger.plan_sha256===plan_sha256&&same(ledger.plan,plan),'stale evidence, current video, project or plan binding');
  const timing=probe(p,source,ffprobe);
  need(same(ledger.scope,{start:0,end:plan.scope_end})&&same(ledger.project_inputs,project_inputs)&&same(ledger.metadata,timing.metadata)&&same(ledger.references,references.references)&&same(ledger.reference_manifests,references.manifests),'stale scope, project inputs, metadata or bundled reference binding');
  const expected=descriptors(plan,timing);need(Array.isArray(ledger.artifacts)&&ledger.artifacts.length===expected.length,'missing or extra shot evidence artifacts');
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'b-style-reference-verify-'));
  try {
    for(const [i,a] of ledger.artifacts.entries()) {
      const {sha256,...descriptor}=a;need(same(descriptor,expected[i]),'evidence descriptors must match every current shot/phase');
      const artifact=localFile(path.join(evidenceDir,a.file));need(hash(artifact)===sha256,'evidence artifact hash changed');
      need(extract(source,expected[i],plan,ffmpeg,a.type==='clip'?path.join(tmp,a.file):undefined)===sha256,'evidence is not extracted from the current actual video: '+a.id);
    }
  } finally {fs.rmSync(tmp,{recursive:true,force:true});}
  need(review.schema===1&&review.style===p.style&&review.author_id===plan.author_id&&same(review.capability,plan.capability)&&review.video_sha256===output_sha256&&review.evidence_sha256===evidence_sha256,'review has stale or missing author, capability, video or evidence binding');
  const reviewer=review.reviewer;need(reviewer&&text(reviewer.id)&&reviewer.id!==plan.author_id&&['human','agent'].includes(reviewer.kind)&&reviewer.independent===true&&concrete(reviewer.method),'a declared independent reviewer distinct from the author is required');
  need(Array.isArray(review.blocking_issues)&&review.blocking_issues.length===0,'blocking quality issues remain');
  const ids=new Set(ledger.artifacts.map(a=>a.id));ids.add('source-video');playback(review.full_playback,plan,ids);
  if(plan.portrait)portraitPlayback(review.portrait_viewing,plan);
  need(Array.isArray(review.baseline_comparisons)&&review.baseline_comparisons.length>0,'actual reference playback comparisons are required');
  const compared=new Set();
  for(const c of review.baseline_comparisons) {
    const ref=references.references.find(r=>r.id===c.reference_id);need(ref?.kind==='video','baseline playback must reference actual reference videos');
    need(Number.isFinite(c.start)&&Number.isFinite(c.end)&&c.start>=0&&c.end>c.start&&c.end<=ref.duration+EPS,'baseline playback interval is invalid');
    observations(c.observations,{scope:[c.start,c.end],ids:new Set([ref.id]),continuous:ref.id});compared.add(ref.id);
  }
  need(references.references.filter(r=>r.required_comparison).every(r=>compared.has(r.id)),'required available reference video comparisons are missing');
  need(Array.isArray(review.shots)&&same(review.shots.map(s=>s.id).sort(),plan.shots.map(s=>s.id).sort()),'review must cover every submitted shot exactly once');
  const unmet=[];
  for(const s of plan.shots) {
    const item=review.shots.find(x=>x.id===s.id);need(item?.checks&&same(Object.keys(item.checks).sort(),plan.checks.slice().sort()),'each shot needs every style-specific review criterion');
    const local=new Set(ledger.artifacts.filter(a=>a.shot===s.id).map(a=>a.id));local.add('source-video');
    if(plan.b3_semantics)b3SemanticReview(item,s,plan.b3_semantics.shots.find(x=>x.id===s.id),local,plan.fps);
    if(plan.portrait) {
      need(item.portrait_checks&&same(Object.keys(item.portrait_checks).sort(),PORTRAIT_CHECKS.slice().sort()),'each portrait shot needs native_composition, caption_readability, action_visibility and platform_safe_area review');
      for(const k of PORTRAIT_CHECKS) {
        const c=item.portrait_checks[k];
        need(c?.status==='pass','portrait shot '+s.id+' '+k+' is pending/failed; limited mode cannot waive portrait readability, action or safe-area checks');
        observations(c.observations,{scope:[s.start,s.end],ids:local,continuous:s.id+'-continuous'});
      }
    }
    for(const k of plan.checks) {
      const c=item.checks[k],effect=!BASIC.has(k),limited=plan.capability.mode==='limited'&&effect;
      need(c&&(c.status==='pass'||(limited&&c.status==='unmet')),'shot '+s.id+' '+k+' is unknown, failed or not eligible for a limited exception');
      observations(c.observations,{scope:[s.start,s.end],ids:local,continuous:s.id+'-continuous'});
      if(effect||k==='sound') {
        need(Array.isArray(c.comparisons)&&c.comparisons.length>0,'shot '+s.id+' '+k+' requires a concrete reference comparison');
        for(const cc of c.comparisons)comparison(cc,references.references,{sound:k==='sound'});
        if(['semantic_acting','semantic_motion_states','contact_continuity','composition_progression','semantic_action','contact_occlusion','composition_editing','television_finish'].includes(k))need(c.comparisons.some(cc=>references.references.find(r=>r.id===cc.reference_id)?.kind==='video'),'motion/contact/editing comparison requires a video reference, not just a still');
      }
      if(c.status==='unmet')unmet.push({shot:s.id,criterion:k,observations:c.observations,comparisons:c.comparisons});
    }
  }
  need(hash(source)===output_sha256&&hash(ledgerFile)===evidence_sha256&&hash(reviewFile)===review_sha256&&projectFileHash(p)===project_file_sha256&&same(currentInputs(p),project_inputs)&&same(planBStyleReference(p),plan)&&same(referenceSet(p.style,p),references),'video, evidence, review, project inputs/plan or references changed during acceptance');
  const limited=plan.capability.mode==='limited';
  return {schema:1,status:limited?'best_effort_limited':'sample_target_review_passed',equivalence:limited?'not_sample_equivalent':'available_samples_reviewed',style:p.style,output:source,output_sha256,project_fingerprint,plan_sha256,evidence_sha256,review_sha256,scope:ledger.scope,capability:plan.capability,reviewer,...(plan.portrait?{portrait_viewing:review.portrait_viewing}:{}),unmet_effect_criteria:unmet,user_acceptance:'not_inferred',limits:plan.limits};
}
