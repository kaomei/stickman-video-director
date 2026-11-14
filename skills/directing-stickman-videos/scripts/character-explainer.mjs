#!/usr/bin/env node
// B5 code-authored route. No network, generation, paid calls or automatic rigging.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {validateB5Production, checkB5Motion} from './b5-production-quality.mjs';
import {validateVisualPlan, buildB5ReviewPack, verifyB5VisualAcceptance} from './b5-visual-review.mjs';
import {recordB5AuthoringStart, createB5PlanCheckpoint, validateB5PlanCheckpoint, writeB5PreviewTemplate, verifyB5PreviewReadiness, verifyB5PreviewReceipt} from './b5-preview-gate.mjs';
import {requiredB5FirstUseResources, createB5ReferenceStudy} from './b5-reference-study.mjs';
import {createB5PngReviewPack, sealB5PngImageFirstRead, validateB5PngPreEncodeReview, createB5PngRevisionReviewPack} from './b5-png-review-gate.mjs';
const require=createRequire(import.meta.url);
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PACK=path.join(ROOT,'assets/b5');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const command=(exe,args)=>{const r=spawnSync(exe,args,{encoding:'utf8',maxBuffer:8e6});if(r.status!==0)throw Error(r.stderr||`${exe} failed`);return r.stdout};
const ffmpeg=process.env.FFMPEG||'ffmpeg',ffprobe=process.env.FFPROBE||'ffprobe';
const probe=f=>JSON.parse(command(ffprobe,['-v','error','-show_entries','format=duration:stream=codec_type,width,height,r_frame_rate,nb_frames','-of','json',f]));
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const f=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('Symlink not allowed: '+f);return e.isDirectory()?files(f):[f]})}
function fingerprint(dir){return crypto.createHash('sha256').update(files(dir).sort().map(f=>path.relative(dir,f)+':'+hash(f)).join('\n')).digest('hex')}
function outside(dir){const p=path.resolve(dir);if(p===ROOT||p.startsWith(ROOT+path.sep))throw Error('Project/output must be outside installed Skill');return p}
function fresh(dir,inputs=[]){const requested=outside(dir),p=outside(path.join(fs.realpathSync(path.dirname(requested)),path.basename(requested)));if(fs.existsSync(p))throw Error('Output already exists; refusing overwrite');for(const i of inputs){const real=fs.realpathSync(i);if(p===real||p.startsWith(real+path.sep)||real.startsWith(p+path.sep))throw Error('Output overlaps input');}fs.mkdirSync(p);return p}
function config(project){const dir=outside(fs.realpathSync(project)),p=read(path.join(dir,'project.json')),c=read(path.join(dir,'scene/config.json'));assert.equal(p.style,'B5');assert.equal(p.renderer,'character-explainer-code-v1');for(const k of ['width','height','fps','duration'])assert(Number.isFinite(c[k])&&c[k]>0,k);assert(Number.isInteger(c.width)&&Number.isInteger(c.height)&&c.width<=3840&&c.height<=3840);assert(Number.isInteger(c.fps)&&c.fps<=60&&c.duration<=3600&&c.duration*c.fps>=1);return {dir,p,c,n:Math.round(c.duration*c.fps)}}
export function initB5(project,{referenceScaffold=false}={}){
 const out=fresh(project);
 fs.cpSync(path.join(PACK,'example'),path.join(out,'scene'),{recursive:true});
 // New stories carry the portable kit; historical inspection keeps its closed lock exact.
 const artKit=referenceScaffold?null:path.join(out,'scene/runtime/b5-art-kit.cjs');
 if(artKit){
  fs.mkdirSync(path.dirname(artKit),{recursive:true});
  fs.copyFileSync(path.join(ROOT,'scripts/b5-art-kit.cjs'),artKit);
 }
 // Shared compositor/assets are reusable; a historical actor scene is not a new story.
 if(!referenceScaffold)fs.copyFileSync(path.join(ROOT,'examples/b5-mei-event-relay/new-story-stage.cjs'),path.join(out,'scene/stage.cjs'));
 const required_first_use=requiredB5FirstUseResources(ROOT);
 fs.copyFileSync(referenceScaffold?path.join(PACK,'approved-sample.mp4'):required_first_use.find(r=>r.id==='mei-event-relay').path,path.join(out,'approved-reference.mp4'));
 fs.writeFileSync(path.join(out,'required-b5-reading.json'),JSON.stringify({status:'required_not_observed',resources:required_first_use},null,2)+'\n');
 const template=fs.readFileSync(path.join(ROOT,'references/b5-mei-scene-template.md'),'utf8').match(/```text\n([\s\S]*?)\n```/);
 assert(template,'Bundled Mei scene template is missing');
 const meiPlan=path.join(out,'mei-scene-plan.md');
 fs.writeFileSync(meiPlan,'# Fill the Mei scene plan before implementation\n\nThis is an unfilled planning template, not an approved storyboard or accepted movie. Replace placeholders using the current approved script and actual voice timing. Plan successive main visuals; apply contact mechanics only where physical actions appear.\n\n```text\n'+template[1]+'\n```\n');
 fs.writeFileSync(path.join(out,'project.json'),JSON.stringify({version:1,style:'B5',renderer:'character-explainer-code-v1',stage:referenceScaffold?'historical Spider reference scaffold; inspection only':'neutral new-story stage; author current script from the Mei scene plan',scaffold_type:referenceScaffold?'historical_reference':'neutral_new_story',reference:'approved-reference.mp4',entry:'scene/renderer.cjs',art_kit:referenceScaffold?null:'scene/runtime/b5-art-kit.cjs'},null,2)+'\n');
 recordB5AuthoringStart(out);
 return {project:path.join(out,'project.json'),art_kit:artKit,art_kit_guide:path.join(ROOT,'references/b5-art-kit.md'),mei_scene_plan:meiPlan,mei_original_prompt:path.join(ROOT,'references/b5-mei-original-prompt.md'),required_first_use,reference_study_next:'Read/view the required latest sample, filled example and approved stage source/rig once, then fill the current Mei scene plan. reference-study is optional structured evidence for strict QA; extraction does not certify viewing',route:'scripts/character-explainer.mjs',scaffold_type:referenceScaffold?'historical_reference':'neutral_new_story',stage:(referenceScaffold?'Historical sample inspection only. ':'Neutral starter includes portable artwork, whole poses and relay helpers; it intentionally renders no story until authored. ')+ 'First read/view all required_first_use resources, fill the Mei Voiceover / On-Screen Text / multi-step Animation Action / SFX scene plan, then author, validate, render and encode an internal candidate. Review the actual candidate once before delivery; plan-lock and blind PNG evidence are optional strict QA, not the default preview path; no effect acceptance yet'};
}
export function checkBaseline(){
 const lock=read(path.join(PACK,'baseline-lock.json'));
 for(const f of lock.files){const target=path.resolve(PACK,f.path);assert(target.startsWith(PACK+path.sep));assert(!fs.lstatSync(target).isSymbolicLink());assert.equal(hash(target),f.sha256,f.path)}
 const video=path.join(PACK,lock.video.path);assert.equal(hash(video),lock.video.sha256);
 const meta=probe(video),v=meta.streams.find(s=>s.codec_type==='video');assert.equal(v.width,1920);assert.equal(v.height,1080);assert.equal(v.r_frame_rate,'30/1');assert.equal(+v.nb_frames,684);assert.equal(+meta.format.duration,22.8);
 const ah=command(ffmpeg,['-v','error','-i',video,'-map','0:a:0','-c','copy','-f','hash','-hash','sha256','pipe:1']).trim().replace(/^SHA256=/,'');assert.equal(ah,lock.video.audio_packets_sha256);
 const scene=path.join(PACK,'example'),words=read(path.join(scene,'word-timings.json')).words,groups=read(path.join(scene,'caption-groups.json'));
 assert.deepEqual(groups.flatMap(g=>g.lines.flat()),words.map((_,i)=>i));for(const g of groups){assert(g.lines.length<=3);assert(g.lines.flat().includes(g.key))}for(let i=0;i<words.length;i++){assert(words[i].start<words[i].end);if(i)assert(words[i].start>=words[i-1].end-.0001)}assert.equal(read(path.join(scene,'speech-levels.json')).length,684);
 const stage=require(path.join(scene,'stage.cjs'));let arms=0,maxError=0;for(let f=0;f<684;f++)for(const actor of stage.inspect(f/30))for(const arm of [actor.la,actor.ra]){for(const [i,len] of [[0,86],[1,84]]){const e=Math.abs(Math.hypot(arm[i+1][0]-arm[i][0],arm[i+1][1]-arm[i][1])-len);maxError=Math.max(maxError,e);assert(e<1e-8,'Fixed bone at '+f)}arms++}
 assert(!files(PACK).some(f=>/\.(wav|mp3|aac)$/i.test(f)));
 return {ok:true,baseline:'B5 Character Explainer / approved V13',files:lock.files.length,video_sha256:hash(video),audio_packets_sha256:ah,duration:22.8,caption_words:words.length,geometry_frames:684,arms_checked:arms,max_arm_length_error:maxError,limits:['sample integrity and geometry only; not new-avatar/new-topic creative acceptance','no physical headphone/speaker listening claimed']};
}
async function main(){
 const [action,...args]=process.argv.slice(2),opt=(k,d)=>args.includes(k)?args[args.indexOf(k)+1]:d;
   if(action==='--help'||!action){console.log("B5 Character Explainer\nDefault requested-preview workflow:\ninit DIR [--reference-scaffold: historical inspection only] (copies scene/runtime/b5-art-kit.cjs)\nvalidate PROJECT_DIR\nframes PROJECT_DIR --output NEW_DIR (--frames 0,55,... | --all) --trusted-code [--plan-lock CHECKPOINT_DIR]\nencode PROJECT_DIR --frames-dir DIR --audio APPROVED_MIX --output NEW_DIR [--approval-note ACTUAL_EXISTING_CONTEXT]\nRead the latest approved Mei example, actual sample and source/rig, and fill the Mei scene plan before implementation. Encode creates an internal candidate, not an accepted preview. Review the actual candidate once at normal speed with sound; inspect suspect frames as needed and repair only observed failures. Record the real scope/limitations. Keep shape/contact, successive lead visuals and semantic captions at the approved standard. No mandatory blind storyboard, plan-lock, PNG seal or formal review JSON for an ordinary requested preview.\nOptional strict QA (see references/b5-visual-acceptance.md):\nreference-study PROJECT_DIR --output NEW_DIR\nplan-lock PROJECT_DIR --output NEW_DIR [--previous PRIOR_CHECKPOINT_DIR]\npng-review-pack PROJECT_DIR --frames-dir DIR --output NEW_DIR [--diagnostic-masks MASK_JSON]\npng-first-read-seal PROJECT_DIR --frames-dir DIR --png-evidence PACK_DIR --image-first-read ACTUAL_READ_JSON --output NEW_DIR\npng-review-check PROJECT_DIR --frames-dir DIR --png-evidence PACK_DIR (--image-first-read ACTUAL_READ_JSON --image-first-seal SEAL_DIR --png-review ACTUAL_PHASE2_JSON | --png-revision REVISION_JSON)\npng-revision-review-pack PROJECT_DIR --frames-dir DIR --png-evidence PACK_DIR --previous-evidence PRIOR_PACK --previous-first-read PRIOR_READ_JSON --previous-seal PRIOR_SEAL_DIR --previous-review PRIOR_PHASE2_JSON --output NEW_DIR\nencode PROJECT_DIR --frames-dir DIR --audio APPROVED_MIX --output NEW_DIR --strict-review --png-evidence PACK_DIR (--image-first-read ACTUAL_READ_JSON --image-first-seal SEAL_DIR --png-review ACTUAL_PHASE2_JSON | --png-revision REVISION_JSON)\nreview-pack PROJECT_DIR --candidate-dir DIR --output NEW_DIR\npreview-ready PROJECT_DIR --candidate-dir DIR --evidence-dir DIR --review ACTUAL_PREVIEW_REVIEW_JSON --output NEW_DIR\naccept PROJECT_DIR --candidate-dir DIR --evidence-dir DIR --review ACTUAL_FULL_REVIEW_JSON --preview-ready READY_DIR --output NEW_DIR\nSupplying --strict-review or any PNG review flag selects the strict pre-encode gate; missing evidence fails rather than silently falling back. Local strict revisions retain actual prior findings and review affected dependencies, never inherit fail/unknown as pass. Formal commands remain separate from user acceptance. check reports installed technical resources only.");return}
 if(action==='init'){console.log(JSON.stringify(initB5(args[0],{referenceScaffold:args.includes('--reference-scaffold')})));return}
 if(action==='check'){console.log(JSON.stringify(checkBaseline(),null,2));return}
 if(action==='validate'){console.log(JSON.stringify({...validateB5Production(config(args[0]),PACK),status:'technical_only',visual_acceptance:'not_reviewed'},null,2));return}
 if(action==='reference-study'){
  const project=config(args[0]),out=fresh(opt('--output'),[project.dir]);
  console.log(JSON.stringify(createB5ReferenceStudy(project,out)));return
 }
 if(action==='plan-lock'){
  const project=config(args[0]),out=fresh(opt('--output'),[project.dir]);
  const checkpoint=createB5PlanCheckpoint(project,out,{previous:opt('--previous')});
  console.log(JSON.stringify({checkpoint,status:'pre_authoring_plan_locked',visual_acceptance:'not_reviewed'}));return
 }
 if(action==='frames'){
  if(!args.includes('--trusted-code'))throw Error('Inspect local scene code first, then explicitly pass --trusted-code');
  const project=config(args[0]),{dir,c,n}=project,quality=validateB5Production(project,PACK);const indexes=args.includes('--all')?Array.from({length:n},(_,i)=>i):(opt('--frames','').split(',').filter(Boolean).map(Number));assert(indexes.length>0&&new Set(indexes).size===indexes.length,'Choose unique frame indices');assert(indexes.every(f=>Number.isInteger(f)&&f>=0&&f<n),'Invalid frame index');
  const plan_checkpoint=opt('--plan-lock')?validateB5PlanCheckpoint(project,opt('--plan-lock')):null;
  const before=fingerprint(dir),sharp=require('sharp'),renderer=require(path.join(dir,'scene/renderer.cjs'));
  const production=await checkB5Motion(quality,renderer,sharp);
  const out=fresh(opt('--output'),[dir]);
  for(const f of indexes)await sharp(renderer.frame(f/c.fps)).png().toFile(path.join(out,String(f).padStart(6,'0')+'.png'));assert.equal(fingerprint(dir),before,'Project changed during render');
  fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify({style:'B5',status:'technical_frames',visual_acceptance:'not_reviewed',project:dir,input_sha256:before,production,plan_checkpoint,frames:indexes,complete:indexes.length===n,config:c,files:indexes.map(f=>{const name=String(f).padStart(6,'0')+'.png';return {name,sha256:hash(path.join(out,name))}})},null,2)+'\n');console.log(JSON.stringify({output:out,frames:indexes.length,complete:indexes.length===n,status:'technical_frames',visual_acceptance:'not_reviewed',preview_eligibility:'actual_candidate_review_required'}));return
 }
 if(['png-review-pack','png-first-read-seal','png-review-check','png-revision-review-pack'].includes(action)){
  const project=config(args[0]),framesDir=opt('--frames-dir');assert(framesDir,'--frames-dir required');
  const pngArgs={...project,framesDir,evidenceDir:opt('--png-evidence'),firstReadFile:opt('--image-first-read'),sealDir:opt('--image-first-seal'),reviewFile:opt('--png-review'),revisionFile:opt('--png-revision')};
  let result;
  if(action==='png-review-pack')result=await createB5PngReviewPack({...pngArgs,out:fresh(opt('--output'),[project.dir,framesDir]),diagnosticMasksFile:opt('--diagnostic-masks')});
  else if(action==='png-revision-review-pack')result=await createB5PngRevisionReviewPack({...pngArgs,out:fresh(opt('--output'),[project.dir,framesDir]),previousEvidenceDir:opt('--previous-evidence'),previousFirstReadFile:opt('--previous-first-read'),previousSealDir:opt('--previous-seal'),previousReviewFile:opt('--previous-review')});
  else if(action==='png-first-read-seal')result=await sealB5PngImageFirstRead({...pngArgs,out:fresh(opt('--output'),[project.dir,framesDir])});
  else result=await validateB5PngPreEncodeReview(pngArgs);
  console.log(JSON.stringify(result));return
 }
 if(action==='encode'){
  const {dir,c,n}=config(args[0]),frameDir=path.resolve(opt('--frames-dir')),ledger=read(path.join(frameDir,'frames.json')),audio=fs.realpathSync(opt('--audio')),note=opt('--approval-note','').trim();assert.equal(ledger.project,dir);assert.equal(ledger.input_sha256,fingerprint(dir),'Project changed; review/render frames again');assert(ledger.complete&&ledger.frames.length===n,'Full sequence required');assert.deepEqual([...ledger.frames].sort((a,b)=>a-b),Array.from({length:n},(_,i)=>i));assert.equal(ledger.files.length,n);
  assert.deepEqual(ledger.files.map(f=>f.name).sort(),Array.from({length:n},(_,i)=>String(i).padStart(6,'0')+'.png'));for(const f of ledger.files){const target=path.join(frameDir,f.name);assert(!fs.lstatSync(target).isSymbolicLink());assert.equal(hash(target),f.sha256)}const meta=probe(audio);assert(meta.streams.some(s=>s.codec_type==='audio'),'Audio stream required');assert(Math.abs(+meta.format.duration-c.duration)<.25,'Final mix duration must match approved scene timing');
  const quality=validateB5Production({dir,c},PACK);if(quality.mode==='new_story'){assert.equal(ledger.production?.manifest_sha256,quality.manifest_sha256,'Production checks missing/stale; render frames again');assert(Array.isArray(ledger.production?.motion_samples),'Picture motion evidence missing');assert.equal(hash(audio),quality.mix_sha256,'Encode the reviewed final mix, not a different audio file');}
  const plan_checkpoint=ledger.plan_checkpoint?validateB5PlanCheckpoint({dir,c},path.dirname(ledger.plan_checkpoint.path)):null;
  if(plan_checkpoint)assert.deepEqual(plan_checkpoint,ledger.plan_checkpoint,'Frame planning checkpoint changed');
  const strict_review=args.includes('--strict-review')||['--png-evidence','--image-first-read','--image-first-seal','--png-review','--png-revision'].some(flag=>args.includes(flag));
  let png_review=null;
  if(quality.mode==='new_story'&&strict_review){
   for(const flag of (opt('--png-revision')?['--png-evidence']:['--png-evidence','--image-first-read','--image-first-seal','--png-review']))assert(opt(flag),'Strict review encode requires '+flag+'; complete the selected strict PNG review or omit strict flags for a standard internal candidate');
   png_review=await validateB5PngPreEncodeReview({dir,c,framesDir:frameDir,evidenceDir:opt('--png-evidence'),firstReadFile:opt('--image-first-read'),sealDir:opt('--image-first-seal'),reviewFile:opt('--png-review'),revisionFile:opt('--png-revision')});
  }
  const out=fresh(opt('--output'),[dir,frameDir,audio]),mp4=path.join(out,'video.mp4');command(ffmpeg,['-v','error','-nostdin','-n','-framerate',String(c.fps),'-i',path.join(frameDir,'%06d.png'),'-i',audio,'-map','0:v:0','-map','1:a:0','-t',String(c.duration),'-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',mp4]);command(ffmpeg,['-v','error','-i',mp4,'-f','null','-']);
  assert.equal(fingerprint(dir),ledger.input_sha256,'Project changed during encode');
  fs.writeFileSync(path.join(out,'candidate.json'),JSON.stringify({schema:1,style:'B5',status:'pending_visual_review',visual_acceptance:'not_reviewed',review_mode:strict_review?'strict':'standard_preview',preview_eligibility:'actual_candidate_review_required',plan_checkpoint,png_review,output:mp4,output_sha256:hash(mp4),audio_input_sha256:hash(audio),project_fingerprint:ledger.input_sha256,frame_ledger_path:path.join(frameDir,'frames.json'),frame_ledger_sha256:hash(path.join(frameDir,'frames.json')),approval_context:note||null,metadata:probe(mp4),full_decode:'pass',creative_review:'required; encoding is not creative acceptance or preview readiness'},null,2)+'\n');console.log(JSON.stringify({output:mp4,folder:out,full_decode:'pass',status:'pending_visual_review',visual_acceptance:'not_reviewed',preview_eligibility:'actual_candidate_review_required'}));return
 }
 if(action==='review-pack'){
  const project=config(args[0]),candidateDir=fs.realpathSync(opt('--candidate-dir'));
  validateVisualPlan(project);
  const before=fingerprint(project.dir),out=fresh(opt('--output'),[project.dir,candidateDir]);
  await buildB5ReviewPack({...project,candidateDir,out,projectFingerprint:before,ffmpeg,ffprobe});
  if(read(path.join(candidateDir,'candidate.json')).plan_checkpoint)writeB5PreviewTemplate(project,candidateDir,out);
  assert.equal(fingerprint(project.dir),before,'Project changed while extracting review evidence');
  console.log(JSON.stringify({output:out,evidence:path.join(out,'evidence.json'),status:'pending_visual_review',visual_acceptance:'not_reviewed'}));return
 }
 if(action==='preview-ready'){
  const project=config(args[0]),candidateDir=fs.realpathSync(opt('--candidate-dir')),evidenceDir=fs.realpathSync(opt('--evidence-dir')),reviewFile=fs.realpathSync(opt('--review'));
  const before=fingerprint(project.dir),candidateDigest=hash(path.join(candidateDir,'candidate.json'));
  const result=verifyB5PreviewReadiness({...project,candidateDir,evidenceDir,reviewFile,projectFingerprint:before,ffmpeg,ffprobe});
  assert.equal(fingerprint(project.dir),before,'Project changed during preview pre-review');
  assert.equal(hash(path.join(candidateDir,'candidate.json')),candidateDigest,'Candidate changed during preview pre-review');
  const out=fresh(opt('--output'),[project.dir,candidateDir,evidenceDir,reviewFile]);
  fs.writeFileSync(path.join(out,'preview-ready.json'),JSON.stringify({...result,review:reviewFile,evidence:path.join(evidenceDir,'evidence.json')},null,2)+'\n');
  console.log(JSON.stringify({output:result.output,folder:out,status:'preview_ready',formal_visual_acceptance:'not_inferred',user_acceptance:'not_inferred'}));return
 }
 if(action==='accept'){
  const project=config(args[0]),candidateDir=fs.realpathSync(opt('--candidate-dir')),evidenceDir=fs.realpathSync(opt('--evidence-dir')),reviewFile=fs.realpathSync(opt('--review'));
  const before=fingerprint(project.dir),evidenceDigest=fingerprint(evidenceDir),reviewDigest=hash(reviewFile),candidateDigest=hash(path.join(candidateDir,'candidate.json'));
  const acceptance=await verifyB5VisualAcceptance({...project,candidateDir,evidenceDir,reviewFile,projectFingerprint:before,ffmpeg,ffprobe});
  assert(opt('--preview-ready'),'A current --preview-ready receipt is required before external delivery');
  const preview=verifyB5PreviewReceipt({...project,candidateDir,evidenceDir,projectFingerprint:before,ffmpeg,ffprobe},opt('--preview-ready'));
  assert.equal(fingerprint(project.dir),before,'Project changed during visual acceptance');
  const out=fresh(opt('--output'),[project.dir,candidateDir,evidenceDir,reviewFile]);
  const candidate=read(path.join(candidateDir,'candidate.json')),mp4=path.join(out,'video.mp4');
  fs.copyFileSync(candidate.output,mp4);assert.equal(hash(mp4),candidate.output_sha256,'Candidate changed during delivery');
  files(evidenceDir);fs.cpSync(evidenceDir,path.join(out,'review-evidence'),{recursive:true});
  fs.copyFileSync(reviewFile,path.join(out,'visual-review.json'));
  assert.equal(fingerprint(path.join(out,'review-evidence')),evidenceDigest,'Evidence changed during delivery');
  assert.equal(hash(path.join(out,'visual-review.json')),reviewDigest,'Review changed during delivery');
  assert.equal(hash(path.join(candidateDir,'candidate.json')),candidateDigest,'Candidate record changed during delivery');
  assert.equal(fingerprint(project.dir),before,'Project changed during delivery');
  const delivery={...acceptance,style:'B5',status:'visual_review_passed',output:mp4,output_sha256:hash(mp4),project_fingerprint:before,evidence:path.join(out,'review-evidence/evidence.json'),review:path.join(out,'visual-review.json'),preview_readiness:preview,user_acceptance:'not_inferred'};
  fs.writeFileSync(path.join(out,'delivery.json'),JSON.stringify(delivery,null,2)+'\n');
  console.log(JSON.stringify({output:mp4,folder:out,status:'visual_review_passed',user_acceptance:delivery.user_acceptance}));return
 }
 throw Error('Unknown B5 command; use --help');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e.message);process.exitCode=1});
