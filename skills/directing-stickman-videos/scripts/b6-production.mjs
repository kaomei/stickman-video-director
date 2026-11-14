import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {initHK} from './b6-hong-kong.mjs';
import {checkPublicCaptionFont,provisionPublicCaptionFont} from './b6-fonts.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const opt=(a,k,d)=>a.includes(k)?a[a.indexOf(k)+1]:d;
const save=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');

export function initProduction(dir,ratio,fontOptions) {
  if(!['16:9','9:16','both'].includes(ratio))throw new Error('B6 requires --ratio 16:9, 9:16 or both before storyboarding');
  dir=path.resolve(dir);
  if(fs.existsSync(dir))throw new Error('Project exists; will not overwrite');
  let ancestor=path.dirname(dir);while(!fs.existsSync(ancestor))ancestor=path.dirname(ancestor);
  const real=fs.realpathSync(ancestor);
  if(real===ROOT||real.startsWith(ROOT+path.sep))throw new Error('Create projects outside the installed Skill');
  checkPublicCaptionFont(ROOT);
  // Copy the complete, tested paint/rig/compositor, never the six-second blocking renderer.
  initHK(path.join(dir,'engine'),'16:9',fontOptions);
  const publicFont=provisionPublicCaptionFont(dir,ROOT);
  fs.copyFileSync(path.join(ROOT,'scripts/b6_production.py'),path.join(dir,'run.py'));
  fs.copyFileSync(path.join(ROOT,'scripts/b6_motion_review.py'),path.join(dir,'motion_review.py'));
  fs.copyFileSync(path.join(ROOT,'scripts/b6_space.py'),path.join(dir,'b6_space.py'));
  fs.copyFileSync(path.join(ROOT,'scripts/b6_caption.py'),path.join(dir,'caption_renderer.py'));
  fs.copyFileSync(path.join(ROOT,'scripts/b6_puppet.py'),path.join(dir,'b6_puppet.py'));
  fs.copyFileSync(path.join(ROOT,'scripts/b6_asset_roles.py'),path.join(dir,'b6_asset_roles.py'));
  fs.copyFileSync(path.join(ROOT,'assets/b6/production/scene.py'),path.join(dir,'scene.py'));
  fs.mkdirSync(path.join(dir,'reference'));
  const standard=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/b6/style-standard.json'),'utf8'));
  const ref=standard.reference.path;
  fs.copyFileSync(path.join(ROOT,'assets/b6',ref),path.join(dir,ref));
  if(crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,ref))).digest('hex')!==standard.reference.sha256)throw new Error('B6 primary portrait reference fingerprint mismatch');
  save(path.join(dir,'quality-target.json'),standard);
  fs.mkdirSync(path.join(dir,'formats'));
  const formats={};
  for(const r of ratio==='both'?['16:9','9:16']:[ratio]) {
    const name=r==='16:9'?'landscape':'portrait';formats[r]=`formats/${name}.json`;
    const caption=structuredClone(standard.public_caption_profiles[publicFont.variant][r]);
    if(r==='16:9')caption.native_layout_reason='';
    save(path.join(dir,formats[r]),{ratio:r,native_design:r,width:r==='16:9'?1280:720,height:r==='16:9'?720:1280,shots:[],cast_inventory:[],caption});
  }
  save(path.join(dir,'captions.json'),[]);
  fs.mkdirSync(path.join(dir,'characters'));
  save(path.join(dir,'characters.json'),{schema:'b6-character-registry/1',actors:[],rigid_cast:[]});
  save(path.join(dir,'story.json'),{narration:'',beats:[],status:'awaiting_story_authoring'});
  save(path.join(dir,'project.json'),{version:2,style:'B6',renderer:'b6-production-v1',purpose:'production',stage:'needs_authoring',duration:null,fps:30,scene:'scene.py',story:'story.json',captions:'captions.json',formats,voice:null,bindings:null,character_system:{schema:'b6-character-system/1',registry:'characters.json'},quality_target:'quality-target.json',caption_font_variant:publicFont.variant,inputs:['motion_review.py','b6_space.py','caption_renderer.py','b6_puppet.py','b6_asset_roles.py',...publicFont.inputs],review:{status:'pending',art:null,acting:null,sound:null}});
  return {project:path.join(dir,'project.json'),renderer:'b6-production-v1',formats:Object.keys(formats),caption_font_variant:publicFont.variant,stage:'Agent must author the requested story, native scene code, paintings, calibrated actions and sound before preview; no placeholder video or approval created',workflow:'references/b6-installed-production.md',engine:'Complete portable V90 engine retained for implementation reference and explicit example reproduction; bundled media cannot be new-story production layers. New stories use per-view puppets and project-local painted worlds. New-story captions use the explicit bundled Archivo Black profile in fonts/; Sample 1 Arial Black remains the separate original reference profile.'};
}

export function runProduction(command,args) {
  let base=path.resolve(args[0]);if(fs.statSync(base).isFile())base=path.dirname(base);
  const cmd=[path.join(base,'run.py'),command,base];
  for(const name of ['--ratio','--start','--seconds','--output','--report','--review','--note'])if(args.includes(name))cmd.push(name,opt(args,name));
  if(args.includes('--trusted-code'))cmd.push('--trusted-code');
  const r=spawnSync(opt(args,'--python',process.env.B6_PYTHON||'python3'),cmd,{encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},maxBuffer:4*1024*1024});
  if(r.error)throw r.error;
  if(r.status!==0)throw new Error(r.stderr||r.stdout||'B6 production failed');
  const last=r.stdout.lastIndexOf('\nRESULT ');
  return JSON.parse(last>=0?r.stdout.slice(last+8):r.stdout);
}
