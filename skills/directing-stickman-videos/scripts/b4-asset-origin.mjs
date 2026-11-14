// Trusted style/example assets may guide new artwork, never impersonate it.
// This rejects known bytes and close whole-image copies; it is not a universal
// plagiarism detector. Crops, composites and substantially edited copies still
// require the independent per-shot story_asset_origin playback review.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {verifyB4StyleLock} from './b4-style-lock.mjs';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const profiles=new Map();
const PNG=Buffer.from([137,80,78,71,13,10,26,10]);
const imageBytes=b=>b.subarray(0,8).equals(PNG)||(b[0]===255&&b[1]===216&&b[2]===255);
const extraAssets=[
  {id:'portrait-opening-poster',name:'portrait-opening-approved.jpg',role:'approved_showcase',sha256:'2e05e219c39f7408669d8fdbfb72848850b37ec02e91c3abed82593acd3d6abe'},
  {id:'portrait-opening-video',name:'portrait-opening-approved.mp4',role:'approved_showcase',sha256:'b1d78c6287d693b23fbe624002419ee17b9ec75d5849e0a34f010b6a0620a540'}
];
function catalog(skillRoot) {
  const root=fs.realpathSync(skillRoot||ROOT),lock=verifyB4StyleLock(root);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/b4/approved-style.json'),'utf8'));
  const items=lock.references.map(r=>({...r,role:'style_reference'}));
  for(const asset of extraAssets) {
    const file=path.join(root,'assets/b4',asset.name);
    if(!fs.existsSync(file)||sha(fs.readFileSync(file))!==asset.sha256)throw Error('B4 asset origin: approved showcase resource missing or changed: '+asset.id);
    items.push({...asset,path:file});
  }
  // Repository README videos need not be included in an installed Skill, but
  // their exact known bytes remain examples rather than new-story outputs.
  for(const item of manifest.publication?.accepted_showcases||[])if(/^[a-f0-9]{64}$/.test(item.sha256))items.push({id:item.title||item.name||item.repository_path,role:'approved_showcase',sha256:item.sha256});
  return items;
}
function profile(file,sha256) {
  if(profiles.has(sha256))return profiles.get(sha256);
  const result=spawnSync(process.env.FFMPEG||'ffmpeg',['-nostdin','-v','error','-i',file,'-frames:v','1','-vf','scale=64:64:flags=area','-f','rawvideo','-pix_fmt','rgb24','pipe:1'],{maxBuffer:64*64*3+4096,timeout:15000});
  if(result.error||result.status!==0||result.stdout.length!==64*64*3)throw Error('B4 asset origin: cannot decode image for reference-copy check: '+(result.error?.message||String(result.stderr).slice(-500)));
  if(profiles.size>=128)profiles.delete(profiles.keys().next().value);
  profiles.set(sha256,result.stdout);return result.stdout;
}
function meanError(a,b){let sum=0;for(let i=0;i<a.length;i++)sum+=Math.abs(a[i]-b[i]);return sum/a.length;}

export function assertB4StoryAsset(file,{skillRoot}={}) {
  const target=fs.realpathSync(file),bytes=fs.readFileSync(target),sha256=sha(bytes),known=catalog(skillRoot);
  const reject=(asset,match)=>{throw Error('B4 asset origin: '+path.basename(target)+' is '+asset.role+' '+asset.id+' ('+match+'); bundled reference/showcase material cannot be a new-story image or finished output. Create story-specific artwork; rename, provenance and reuse_reason do not grant an exception.');};
  const exact=known.find(item=>item.sha256===sha256);
  if(exact)reject(exact,'exact content match');
  let compared=0;
  if(imageBytes(bytes)) {
    const current=profile(target,sha256);
    for(const asset of known)if(asset.path&&imageBytes(fs.readFileSync(asset.path))) {
      const error=meanError(current,profile(asset.path,asset.sha256));compared++;
      // Tight whole-image comparison catches ordinary resize/JPEG conversion
      // without rejecting a fresh scene merely for sharing the approved style.
      if(error<=7)reject(asset,'close whole-image copy; RGB mean error '+error.toFixed(2));
    }
  }
  return {role:'story_candidate',sha256,known_reference_match:false,whole_image_comparisons:compared,
    visual_acceptance:'not established; independent story_asset_origin and existing quality reviews remain required'};
}
