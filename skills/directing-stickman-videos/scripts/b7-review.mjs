// Evidence protocol, not an automatic aesthetic or listening judge.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const EPS=.0001;
const CHECKS=['reference_match','principal_motion','geometry_contact','continuity_story','captions_semantics_sync','sound_mix_rights','ending'];
const fail=s=>{throw Error('B7 review: '+s);};
const need=(v,s)=>{if(!v)fail(s);};
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const sha=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const save=(f,d)=>fs.writeFileSync(f,JSON.stringify(d,null,2)+'\n');
const ident=x=>nonempty(x)&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/.test(x);
function file(p){const f=path.resolve(p);need(fs.existsSync(f)&&fs.statSync(f).isFile(),'missing file '+f);return fs.realpathSync(f);}
function run(exe,args){const r=spawnSync(exe,args,{encoding:'utf8',maxBuffer:16*1024*1024});need(!r.error&&r.status===0,exe+' failed: '+(r.error?.message||r.stderr?.slice(-1200)));return r.stdout;}
function probe(f){const p=JSON.parse(run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',f])),v=p.streams.find(s=>s.codec_type==='video');need(v,'final media has no video');const [n,d]=String(v.avg_frame_rate).split('/').map(Number),duration=Number(v.duration??p.format.duration);need(duration>0&&Number.isFinite(n/d),'invalid actual media timing');return {duration,fps:n/d,width:v.width,height:v.height,audio:p.streams.some(s=>s.codec_type==='audio')};}
function interval(a,start,end,label){need(Array.isArray(a)&&a.length===2&&a.every(Number.isFinite)&&a[0]>=start-EPS&&a[1]>a[0]&&a[1]<=end+EPS,label+' is outside its scope');return a;}
function complete(ranges,duration,label){let end=0;need(Array.isArray(ranges)&&ranges.length,label+' needs actual covered ranges');for(const r of [...ranges].sort((a,b)=>a[0]-b[0])){interval(r,0,duration,label);need(r[0]<=end+EPS,label+' omits part of the film');end=Math.max(end,r[1]);}need(end>=duration-EPS,label+' omits the end of the film');}
const normalized=s=>s.normalize('NFKC').replace(/[\p{P}\p{Z}\s]/gu,'').toLocaleLowerCase();
function referenceFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?referenceFiles(path.join(dir,e.name)):[file(path.join(dir,e.name))]).sort();}

// These are measured production declarations in final-output pixels. Rectangle
// arithmetic does not establish rendered glyphs, pixel-grid fidelity or whether
// the producer identified every narratively necessary action correctly.
function portraitBounds(b,media,label){need(b&&['left','top','right','bottom'].every(k=>Number.isFinite(b[k]))&&b.left>=-EPS&&b.top>=-EPS&&b.right>b.left&&b.bottom>b.top&&b.right<=media.width+EPS&&b.bottom<=media.height+EPS,label+' needs an in-frame measured left/top/right/bottom rectangle in output pixels');return b;}
function portraitLayout(p,media,beatIds){
  const l=p.portrait_layout;
  need(l?.native_recomposition===true&&nonempty(l.recomposition_evidence),'9:16 needs native portrait recomposition and concrete recomposition_evidence; cropping a landscape film is not a portrait layout');
  need(Number.isInteger(l.logical_canvas?.width)&&l.logical_canvas.width>0&&Number.isInteger(l.logical_canvas?.height)&&l.logical_canvas.height>0&&Number.isInteger(l.integer_scale)&&l.integer_scale>=1&&l.logical_canvas.width*l.integer_scale===media.width&&l.logical_canvas.height*l.integer_scale===media.height&&l.resampling==='nearest-neighbor','9:16 pixel layout needs logical_canvas, an exact integer_scale to the probed output and nearest-neighbor resampling');
  const safe=portraitBounds(l.caption_safe_area,media,'portrait caption_safe_area'),m=l.caption_measurement;
  need(nonempty(m?.font)&&nonempty(m?.method)&&m.includes_shadow===true,'9:16 caption_measurement must identify the actual project font and measurement method, including every caption shadow');
  need(Array.isArray(l.required_action_regions)&&l.required_action_regions.length,'9:16 needs declared required_action_regions for every beat');
  for(const r of l.required_action_regions){need(beatIds.has(r?.beat_id),'portrait action region has an unknown beat_id');portraitBounds(r.bounds,media,'required action region '+r.beat_id);}
  for(const id of beatIds)need(l.required_action_regions.some(r=>r.beat_id===id),'portrait action regions omit beat '+id);
  return {safe,regions:l.required_action_regions,integer_scale:l.integer_scale};
}
function portraitCaption(c,p,media,layout){
  need(c.drawn_width<=.65*media.width+EPS,'portrait caption '+c.id+' exceeds 65% of the actual video width, including shadow');
  need(c.safe_width<=.65*media.width+EPS,'portrait caption '+c.id+' recorded safe_width exceeds 65% of the actual video width');
  need(c.line_count===1,'portrait caption '+c.id+' needs a measured single-line line_count');
  const b=portraitBounds(c.bounds,media,'portrait caption '+c.id),s=layout.safe;
  need(Math.abs(b.right-b.left-c.drawn_width)<=EPS,'portrait caption '+c.id+' drawn_width differs from its measured left/right bounds');
  need(b.left>=.175*media.width-EPS&&b.right<=.825*media.width+EPS,'portrait caption '+c.id+' needs at least 17.5% measured whitespace on both left and right');
  need(Math.abs((b.left+b.right)/2-media.width/2)<=layout.integer_scale/2+EPS,'portrait caption '+c.id+' must be centered within half a logical pixel');
  need(b.left>=s.left-EPS&&b.right<=s.right+EPS&&b.top>=s.top-EPS&&b.bottom<=s.bottom+EPS&&c.safe_width<=s.right-s.left+EPS,'portrait caption '+c.id+' is outside its declared caption safe area');
  for(const r of layout.regions){const beat=p.beats.find(x=>x.id===r.beat_id);if(c.start>=beat.end-EPS||c.end<=beat.start+EPS)continue;need(!(b.left<r.bounds.right-EPS&&b.right>r.bounds.left+EPS&&b.top<r.bounds.bottom-EPS&&b.bottom>r.bounds.top+EPS),'portrait caption '+c.id+' overlaps a declared required action in beat '+beat.id);}
}

export function validateB7Plan(p,media){
  need(p?.schema===1&&p.style==='B7'&&nonempty(p.author_id),'plan needs schema 1, B7 and author_id');
  need(typeof p.require_user_acceptance==='boolean','plan must explicitly state boolean require_user_acceptance from the project agreement');
  need(Number.isFinite(p.duration)&&Math.abs(p.duration-media.duration)<=1/media.fps+.02,'planned duration differs from actual final video');
  const portrait=Math.abs(media.width/media.height-9/16)<.01;
  need(portrait||Math.abs(media.width/media.height-16/9)<.01,'B7 supports verified 16:9 or native 9:16 layouts; other ratios need their own verified package');
  need(nonempty(p.narration),'plan needs the full approved narration text');
  need(Array.isArray(p.beats)&&p.beats.length,'plan has no story beats');
  const ids=new Set(),sfxids=new Set(),actions=[],holdExceptions=[];let end=0;
  for(const b of p.beats){
    need(ident(b.id)&&!ids.has(b.id),'beat ids must be unique');ids.add(b.id);
    interval([b.start,b.end],0,p.duration,'beat '+b.id);need(Math.abs(b.start-end)<=EPS,'beat timeline has a gap or overlap');end=b.end;
    need(nonempty(b.intent)&&nonempty(b.actor_object)&&nonempty(b.before)&&nonempty(b.after),'beat '+b.id+' needs intent, actor/object and before/after state');
    need(b.cue&&nonempty(b.cue.text),'beat '+b.id+' needs a spoken cue or explicit nonverbal cue');interval([b.cue.start,b.cue.end],b.start,b.end,'beat cue '+b.id);
    interval(b.anticipation,b.start,b.end,'anticipation '+b.id);interval(b.response,b.start,b.end,'response '+b.id);
    need(Number.isFinite(b.trigger)&&b.trigger>=b.anticipation[1]-EPS&&b.trigger<=b.response[0]+EPS&&Number.isFinite(b.settle)&&b.settle>=b.response[1]-EPS&&b.settle<=b.end+EPS,'beat '+b.id+' has response before trigger or invalid settling time');
    need(Array.isArray(b.principal_action)&&b.principal_action.length,'beat '+b.id+' needs actual principal-action intervals');
    for(const r of b.principal_action)actions.push(interval(r,b.start,b.end,'principal action '+b.id));
    need(Array.isArray(b.sfx),'beat '+b.id+' needs SFX cues or an intentional no-SFX reason');
    if(!b.sfx.length)need(nonempty(b.no_sfx_reason),'beat '+b.id+' missing intentional no-SFX reason');
    for(const s of b.sfx){need(ident(s.id)&&!sfxids.has(s.id)&&s.event_id===b.id&&nonempty(s.resource_id)&&nonempty(s.purpose)&&Number.isFinite(s.offset)&&Math.abs(s.time-(b.trigger+s.offset))<=EPS&&s.time>=b.start-EPS&&s.time<=b.end+EPS,'SFX must have a unique id, a resource, and derive its time from the same beat trigger with a purpose');sfxids.add(s.id);}
    if(b.reflective_hold){const h=b.reflective_hold;interval([h.start,h.end],b.start,b.end,'reflective ending hold');need(b===p.beats.at(-1)&&h.start>=b.settle-EPS&&Math.abs(h.end-p.duration)<=EPS&&h.end-h.start>=2-EPS&&h.end-h.start<=3+EPS&&nonempty(h.reason)&&h.approval&&h.approval.status==='approved'&&nonempty(h.approval.by)&&nonempty(h.approval.evidence),'only an explicitly justified approved terminal reflection may use the 2–3 second completed hold');holdExceptions.push([h.start,h.end]);}
  }
  need(Math.abs(end-p.duration)<=EPS,'beat timeline must cover the whole actual film');
  // Measure continuous principal inactivity across shot/beat boundaries.
  let activeEnd=0;
  for(const r of [...actions,...holdExceptions].sort((a,b)=>a[0]-b[0])){need(r[0]-activeEnd<=2.5+EPS,'principal inactivity exceeds 2.5 seconds across beat boundaries');activeEnd=Math.max(activeEnd,r[1]);}
  need(p.duration-activeEnd<=2.5+EPS,'principal inactivity exceeds 2.5 seconds at the film end');
  const layout=portrait?portraitLayout(p,media,ids):null;
  need(Array.isArray(p.captions)&&p.captions.length,'caption timing/text ledger is missing');
  let captionEnd=0;const cids=new Set();
  for(const c of p.captions){need(ident(c.id)&&!cids.has(c.id)&&nonempty(c.text)&&!/[\r\n]/.test(c.text),'captions need unique ids and exactly one semantic line');cids.add(c.id);interval([c.start,c.end],0,p.duration,'caption '+c.id);need(c.start>=captionEnd-EPS,'caption times overlap or are out of order');captionEnd=c.end;need(Number.isFinite(c.drawn_width)&&Number.isFinite(c.safe_width)&&c.drawn_width>0&&c.drawn_width<=c.safe_width,'caption '+c.id+' exceeds its recorded safe width');if(layout)portraitCaption(c,p,media,layout);}
  need(normalized(p.captions.map(c=>c.text).join(' '))===normalized(p.narration),'captions omit, reorder or duplicate approved narration');
  need(Array.isArray(p.assets)&&Array.isArray(p.audio_resources),'plan needs assets and audio-resource provenance lists');
  const aids=new Set();for(const a of p.assets){need(ident(a.id)&&!aids.has(a.id)&&nonempty(a.path)&&nonempty(a.role),'invalid or duplicate asset id');aids.add(a.id);}
  const audioids=new Set();for(const a of p.audio_resources){need(ident(a.id)&&!audioids.has(a.id)&&['speech','music','sfx','ambience'].includes(a.kind)&&nonempty(a.provenance)&&(!a.asset_id||aids.has(a.asset_id)),'audio resources need unique ids, valid asset references and provenance');audioids.add(a.id);}
  const allids=[...ids,...cids,...aids,...audioids];need(!allids.includes('final-video')&&new Set(allids).size===allids.length,'beat, caption, asset and audio ids must be unambiguous across the whole plan');
  for(const b of p.beats)for(const s of b.sfx)need(p.audio_resources.some(a=>a.id===s.resource_id&&a.kind==='sfx'),'SFX resource is missing from the sound/rights ledger: '+s.id);
  for(const h of holdExceptions)need(p.captions.at(-1).end<=h[0]+EPS,'completed reflection hold must follow the final spoken caption');
  need(media.audio?p.audio_resources.length>0:nonempty(p.intentional_silence_reason),'declare actual sound resources or intentional silence');
  need(media.audio||p.audio_resources.length===0,'declared used sound resources are absent from the final encoded video');
  return {beat_ids:[...ids],caption_ids:[...cids],audio_ids:[...audioids]};
}

export function buildB7Evidence({video,plan,out,referenceManifest=path.join(ROOT,'assets/b7/reference-manifest.json')}){
  video=file(video);plan=file(plan);referenceManifest=file(referenceManifest);out=path.resolve(out);
  const media=probe(video),p=read(plan),coverage=validateB7Plan(p,media);
  need(!fs.existsSync(out)||fs.readdirSync(out).length===0,'evidence output must be new/empty; never overwrite an earlier review');fs.mkdirSync(out,{recursive:true});
  run('ffmpeg',['-v','error','-xerror','-nostdin','-i',video,'-fps_mode','vfr','-f','null','-']);
  const snap=f=>({path:f,sha256:sha(f)}),assets=p.assets.map(a=>({...a,...snap(file(path.resolve(path.dirname(plan),a.path)))}));
  const references=referenceFiles(path.dirname(referenceManifest)).map(snap),manifest=read(referenceManifest),version=manifest.version??manifest.pack_version??manifest.status;
  need(manifest.style==='B7'&&nonempty(version),'reference manifest needs B7 and a version/pack_version/status');
  const evidence={schema:1,style:'B7',created_at:new Date().toISOString(),scope:'current final media and declared production assets',video:{...snap(video),...media},plan:snap(plan),reference:{...snap(referenceManifest),version},reference_files:references,assets,coverage,technical:{status:'pass',full_decode:'pass',meaning:'Decode, chronology, coverage, caption/layout declarations and integrity only; no visual quality or listening approval.'},limits:['Principal action and review observations are declarations, not computer-vision findings.','Portrait font measurements, caption/action bounds, native layout and pixel scaling are production declarations; arithmetic checks do not prove actual glyph pixels, absence of occlusion, semantic completeness or nearest-neighbor rendering.','Reviewer identity, actual playback, listening and rights are recorded claims, not authenticated facts.','A technical pass never sets creative review or user acceptance to pass.']};
  const evidenceFile=path.join(out,'evidence.json');save(evidenceFile,evidence);
  const pending=()=>({status:'pending',observations:[]});
  const review={schema:1,style:'B7',evidence_sha256:sha(evidenceFile),reviewer:{id:'',method:'',independent:false,limitations:''},full_playback:{...pending(),speed:1,ranges:[]},full_listening:{...pending(),speed:1,ranges:[]},checks:Object.fromEntries(CHECKS.map(k=>[k,pending()])),audio_rights:p.audio_resources.map(a=>({id:a.id,status:'pending',source:'',license_or_permission:'',attribution:'',reason:''})),user_acceptance:{status:'pending',required:p.require_user_acceptance===true,by:'',evidence:'',media_sha256:sha(video)}};
  save(path.join(out,'review.json'),review);
  return {evidence_file:evidenceFile,review_file:path.join(out,'review.json'),technical_status:'pass',delivery_ready:false};
}

function observations(xs,known,duration,label){need(Array.isArray(xs)&&xs.length,label+' needs concrete observations');for(const o of xs){need(Number.isFinite(o.time)&&o.time>=0&&o.time<=duration+EPS&&nonempty(o.detail)&&Array.isArray(o.evidence_ids)&&o.evidence_ids.length&&o.evidence_ids.every(id=>known.has(id)),label+' observation needs a time, concrete detail and existing evidence ids');}}
export function checkB7Review({evidence,review}){
  evidence=file(evidence);review=file(review);const e=read(evidence),r=read(review);
  need(e.schema===1&&e.style==='B7'&&r.schema===1&&r.style==='B7','unsupported evidence/review schema');
  need(r.evidence_sha256===sha(evidence),'review is stale: evidence record changed');
  for(const a of [e.video,e.plan,e.reference,...e.reference_files,...e.assets])need(sha(file(a.path))===a.sha256,'review is stale: video, plan, reference or asset changed: '+a.path);
  const actual=probe(e.video.path),p=read(e.plan.path),coverage=validateB7Plan(p,actual);
  for(const k of ['duration','fps','width','height','audio'])need(actual[k]===e.video[k],'evidence media metadata differs from the actual final video');
  const assets=p.assets.map(a=>({...a,path:file(path.resolve(path.dirname(e.plan.path),a.path))}));
  need(assets.length===e.assets.length&&assets.every((a,i)=>Object.entries(a).every(([k,v])=>JSON.stringify(e.assets[i][k])===JSON.stringify(v))),'evidence omits or changes a declared production asset');
  need(JSON.stringify(coverage)===JSON.stringify(e.coverage),'evidence coverage no longer matches the current plan');
  const currentReferences=referenceFiles(path.dirname(e.reference.path));need(JSON.stringify(currentReferences)===JSON.stringify(e.reference_files.map(a=>a.path)),'review is stale: reference files added or removed');
  need(e.technical.status==='pass'&&e.technical.full_decode==='pass','technical review is not passed');
  run('ffmpeg',['-v','error','-xerror','-nostdin','-i',e.video.path,'-fps_mode','vfr','-f','null','-']);
  need(nonempty(r.reviewer?.id)&&nonempty(r.reviewer.method)&&typeof r.reviewer.independent==='boolean','actual reviewer identity/method/independence declaration is missing');
  const ids=new Set(['final-video',...coverage.beat_ids,...coverage.caption_ids,...coverage.audio_ids,...e.assets.map(a=>a.id)]);
  for(const [key,label] of [['full_playback','full-speed whole-film playback'],['full_listening','full-speed whole-film listening']]){
    const v=r[key];
    if(!actual.audio&&key==='full_listening'){need(v?.status==='not_applicable'&&nonempty(v.reason),'silent film listening exemption needs a reason');continue;}
    need(v?.status==='pass'&&v.speed===1,label+' remains pending/needs_repair or is not 1x');complete(v.ranges,p.duration,label);observations(v.observations,ids,p.duration,label);
  }
  for(const k of CHECKS){const c=r.checks?.[k];need(c?.status==='pass','creative check '+k+' remains pending/needs_repair');observations(c.observations,ids,p.duration,k);if(['reference_match','principal_motion','geometry_contact','continuity_story'].includes(k)){for(const id of coverage.beat_ids)need(c.observations.some(o=>o.evidence_ids.includes(id)),'creative check '+k+' omits beat '+id);}}
  for(const id of coverage.caption_ids)need(r.checks.captions_semantics_sync.observations.some(o=>o.evidence_ids.includes(id)),'caption semantic review omits '+id);
  need(Array.isArray(r.audio_rights)&&r.audio_rights.length===coverage.audio_ids.length,'audio rights records are missing or duplicated');
  for(const id of coverage.audio_ids){const matches=r.audio_rights.filter(a=>a.id===id);need(matches.length===1,'missing or duplicate rights record '+id);const a=matches[0];need(a.status==='cleared'&&nonempty(a.source)&&nonempty(a.license_or_permission)&&nonempty(a.attribution)&&nonempty(a.reason),'audio rights remain uncleared for '+id);}
  const u=r.user_acceptance;need(u&&u.media_sha256===e.video.sha256,'user acceptance must bind this exact media');
  need(['pending','not_requested','accepted','rejected','needs_repair'].includes(u.status),'unknown user acceptance state');
  need(!['rejected','needs_repair'].includes(u.status),'user has rejected this media or requested repairs');
  if(p.require_user_acceptance===true)need(u.status==='accepted'&&nonempty(u.by)&&nonempty(u.evidence),'project requires user acceptance of the exact media');
  if(u.status==='accepted')need(nonempty(u.by)&&nonempty(u.evidence),'accepted user state needs actual historical/current confirmation evidence');
  return {schema:1,style:'B7',delivery_ready:true,technical_status:'pass',creative_review_status:'recorded_pass',user_acceptance:u.status,user_acceptance_required:p.require_user_acceptance===true,media_sha256:e.video.sha256,review_sha256:sha(review),limits:e.limits};
}

function cli(){const [command,...args]=process.argv.slice(2),opts={};for(let i=0;i<args.length;i+=2){need(args[i]?.startsWith('--')&&args[i+1]&&!args[i+1].startsWith('--'),'use --name value options');opts[args[i].slice(2)]=args[i+1];}if(['init','evidence'].includes(command)){for(const k of ['video','plan','out'])need(nonempty(opts[k]),'missing --'+k);console.log(JSON.stringify(buildB7Evidence({video:opts.video,plan:opts.plan,out:opts.out,referenceManifest:opts['reference-manifest']}),null,2));}else if(command==='check'){need(opts.evidence&&opts.review,'check needs --evidence and --review');console.log(JSON.stringify(checkB7Review(opts),null,2));}else{need(!command||['help','--help'].includes(command),'unknown command '+command);console.log('B7 evidence gate\n  node scripts/b7-review.mjs init --video FINAL.mp4 --plan b7-plan.json --out NEW_QA_DIR\n  node scripts/b7-review.mjs check --evidence NEW_QA_DIR/evidence.json --review NEW_QA_DIR/review.json\nSee references/b7-review.md. No publication, rendering or paid calls.');}}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{cli();}catch(e){console.error(e.message);process.exitCode=1;}}
