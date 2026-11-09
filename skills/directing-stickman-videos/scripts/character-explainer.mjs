#!/usr/bin/env node
// B5 code-authored route. No network, generation, paid calls or automatic rigging.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
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
export function initB5(project){const out=fresh(project);fs.cpSync(path.join(PACK,'example'),path.join(out,'scene'),{recursive:true});fs.copyFileSync(path.join(PACK,'approved-sample.mp4'),path.join(out,'approved-reference.mp4'));fs.writeFileSync(path.join(out,'project.json'),JSON.stringify({version:1,style:'B5',renderer:'character-explainer-code-v1',stage:'approved sample scaffold; reauthor for a new story',reference:'approved-reference.mp4',entry:'scene/renderer.cjs'},null,2)+'\n');return {project:path.join(out,'project.json'),route:'scripts/character-explainer.mjs',stage:'sample-specific code scaffold, not a generated new story'}}
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
 if(action==='--help'||!action){console.log('B5 Character Explainer\ninit DIR\ncheck\nframes PROJECT_DIR --output NEW_DIR (--frames 0,55,... | --all) --trusted-code\nencode PROJECT_DIR --frames-dir DIR --audio APPROVED_MIX --output NEW_DIR --approval-note ACTUAL_USER_APPROVAL\nNo arbitrary avatar auto-rigging, mixing or generation.');return}
 if(action==='init'){console.log(JSON.stringify(initB5(args[0])));return}
 if(action==='check'){console.log(JSON.stringify(checkBaseline(),null,2));return}
 if(action==='frames'){
  if(!args.includes('--trusted-code'))throw Error('Inspect local scene code first, then explicitly pass --trusted-code');
  const {dir,c,n}=config(args[0]);const indexes=args.includes('--all')?Array.from({length:n},(_,i)=>i):(opt('--frames','').split(',').filter(Boolean).map(Number));assert(indexes.length>0&&new Set(indexes).size===indexes.length,'Choose unique frame indices');assert(indexes.every(f=>Number.isInteger(f)&&f>=0&&f<n),'Invalid frame index');
  const out=fresh(opt('--output'),[dir]),before=fingerprint(dir),sharp=require('sharp'),renderer=require(path.join(dir,'scene/renderer.cjs'));
  for(const f of indexes)await sharp(renderer.frame(f/c.fps)).png().toFile(path.join(out,String(f).padStart(6,'0')+'.png'));assert.equal(fingerprint(dir),before,'Project changed during render');
  fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify({style:'B5',project:dir,input_sha256:before,frames:indexes,complete:indexes.length===n,config:c,files:indexes.map(f=>{const name=String(f).padStart(6,'0')+'.png';return {name,sha256:hash(path.join(out,name))}})},null,2)+'\n');console.log(JSON.stringify({output:out,frames:indexes.length,complete:indexes.length===n}));return
 }
 if(action==='encode'){
  const {dir,c,n}=config(args[0]),frameDir=path.resolve(opt('--frames-dir')),ledger=read(path.join(frameDir,'frames.json')),audio=fs.realpathSync(opt('--audio')),note=opt('--approval-note','').trim();assert(note,'Record genuine current user approval; never manufacture it');assert.equal(ledger.project,dir);assert.equal(ledger.input_sha256,fingerprint(dir),'Project changed; review/render frames again');assert(ledger.complete&&ledger.frames.length===n,'Full sequence required');assert.deepEqual([...ledger.frames].sort((a,b)=>a-b),Array.from({length:n},(_,i)=>i));assert.equal(ledger.files.length,n);
  assert.deepEqual(ledger.files.map(f=>f.name).sort(),Array.from({length:n},(_,i)=>String(i).padStart(6,'0')+'.png'));for(const f of ledger.files){const target=path.join(frameDir,f.name);assert(!fs.lstatSync(target).isSymbolicLink());assert.equal(hash(target),f.sha256)}const meta=probe(audio);assert(meta.streams.some(s=>s.codec_type==='audio'),'Audio stream required');assert(Math.abs(+meta.format.duration-c.duration)<.25,'Final mix duration must match approved scene timing');
  const out=fresh(opt('--output'),[dir,frameDir,audio]),mp4=path.join(out,'video.mp4');command(ffmpeg,['-v','error','-nostdin','-n','-framerate',String(c.fps),'-i',path.join(frameDir,'%06d.png'),'-i',audio,'-map','0:v:0','-map','1:a:0','-t',String(c.duration),'-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',mp4]);command(ffmpeg,['-v','error','-i',mp4,'-f','null','-']);
  fs.writeFileSync(path.join(out,'delivery.json'),JSON.stringify({style:'B5',output:mp4,output_sha256:hash(mp4),audio_input_sha256:hash(audio),project_fingerprint:ledger.input_sha256,approval_note:note,metadata:probe(mp4),full_decode:'pass',creative_review:'required; encoding is not creative acceptance'},null,2)+'\n');console.log(JSON.stringify({output:mp4,folder:out,full_decode:'pass'}));return
 }
 throw Error('Unknown B5 command; use --help');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e.message);process.exitCode=1});
