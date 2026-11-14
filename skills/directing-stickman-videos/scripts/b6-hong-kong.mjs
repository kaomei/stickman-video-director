import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {provisionFonts, verifyProvisionedFontLicenses} from './b6-fonts.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PACK=path.join(ROOT,'assets/b6/hong-kong-v90');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const opt=(a,k,d)=>a.includes(k)?a[a.indexOf(k)+1]:d;
function local(base,rel) {
  if(typeof rel!=='string'||!rel||path.isAbsolute(rel))throw new Error('Project-relative file required');
  const real=fs.realpathSync(path.resolve(base,rel));
  if(!real.startsWith(fs.realpathSync(base)+path.sep))throw new Error('Project file escaped package');
  return real;
}
export function checkHKPack(base=PACK) {
  const m=read(path.join(base,'manifest.json'));
  for(const [rel,digest] of Object.entries(m.files))if(sha(local(base,rel))!==digest)throw new Error('V90 fingerprint mismatch: '+rel);
  if(fs.existsSync(path.join(base,'font-provenance.json')) || Object.keys(m.files).some(rel=>rel==='font-provenance.json'||rel.startsWith('source/fonts/'))) verifyProvisionedFontLicenses(base,m.files);
  return {ok:true,files:Object.keys(m.files).length,fingerprint:sha(path.join(base,'manifest.json'))};
}
export function initHK(dir,ratio,fontOptions) {
  if(ratio!=='16:9')throw new Error('The V90 example has a native 16:9 plan; author and review a separate portrait plan');
  dir=path.resolve(dir);
  if(fs.existsSync(dir))throw new Error('Project exists; will not overwrite');
  let ancestor=path.dirname(dir);while(!fs.existsSync(ancestor))ancestor=path.dirname(ancestor);
  const real=fs.realpathSync(ancestor);
  if(real===ROOT||real.startsWith(ROOT+path.sep))throw new Error('Create projects outside the installed Skill');
  checkHKPack();fs.mkdirSync(dir,{recursive:true});
  for(const rel of [...Object.keys(read(path.join(PACK,'manifest.json')).files),'manifest.json']) {
    const dest=path.join(dir,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(local(PACK,rel),dest);
  }
  const fonts=provisionFonts(dir,ROOT,fontOptions);
  const manifest=read(path.join(dir,'manifest.json'));
  Object.assign(manifest.files,fonts.hashes);
  fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  return {project:path.join(dir,'project.json'),example:'hong-kong-v90',purpose:'example-reproduction',new_story:false,native_ratio:ratio,stage:'Complete editable source copied; no generation, rendering or user approval inferred',standalone:'python3 run.py validate .; python3 run.py preview . --trusted-code --full-qc'};
}
export function runHK(command,args) {
  let base=path.resolve(args[0]);if(fs.statSync(base).isFile())base=path.dirname(base);
  const checked=checkHKPack(base);
  if(opt(args,'--ratio','16:9')!=='16:9')throw new Error('V90 requires native --ratio 16:9');
  if(command==='approve') {
    const note=opt(args,'--note',''),rel=opt(args,'--report','');
    if(!note.trim()||!rel)throw new Error('Genuine user approval --note and project-relative --report are required');
    const report=read(local(base,rel));
    const preview=path.relative(base,report.output),file=local(base,preview);
    if(report.fingerprint!==checked.fingerprint||sha(file)!==report.output_sha256)throw new Error('Reviewed source or preview changed');
    const target=path.join(base,'approval.json');if(fs.existsSync(target))throw new Error('Approval exists; will not overwrite');
    fs.writeFileSync(target,JSON.stringify({fingerprint:checked.fingerprint,preview,preview_sha256:report.output_sha256,note,approved_at:new Date().toISOString()},null,2)+'\n');
    return {approval:target};
  }
  if(!['validate','frames','preview','render'].includes(command))throw new Error('Unknown V90 command');
  const cmd=[local(base,'run.py'),command,base];
  for(const name of ['--start','--seconds','--output'])if(args.includes(name))cmd.push(name,opt(args,name));
  for(const name of ['--trusted-code','--full-qc'])if(args.includes(name))cmd.push(name);
  const r=spawnSync(opt(args,'--python',process.env.B6_PYTHON||'python3'),cmd,{encoding:'utf8',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1'},maxBuffer:4*1024*1024});
  if(r.error)throw r.error;
  if(r.status!==0)throw new Error(r.stderr||r.stdout||'V90 renderer failed');
  if(command==='validate')return JSON.parse(r.stdout);
  const reportPath=path.join(base,opt(args,'--output','outputs/reproduction'),'report.json');
  const report={...read(reportPath),purpose:'example-reproduction',new_story:false,example:'hong-kong-v90',note:'Explicit unchanged V90 reproduction; not evidence of a new-story production.'};
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');return report;
}
