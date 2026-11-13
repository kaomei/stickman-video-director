import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {PUBLIC_CAPTION_FONT,checkPublicCaptionFont,provisionPublicCaptionFont,provisionFonts} from '../scripts/b6-fonts.mjs';
import {initProduction} from '../scripts/b6-production.mjs';
import {initHK,checkHKPack} from '../scripts/b6-hong-kong.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function fixture(fn) { const temp=fs.mkdtempSync(path.join(os.tmpdir(),'b6-font-test-')); try { fn(temp); } finally { fs.rmSync(temp,{recursive:true,force:true}); } }

test('B6 fonts use explicit local files under old aliases with honest provenance and no overwrite',()=>fixture(temp=>{
  const fontDir=path.join(temp,'local-fonts'),project=path.join(temp,'project');fs.mkdirSync(fontDir);
  for(const name of ['Arial.ttf','Arial Black.ttf','Courier New Bold.ttf'])fs.copyFileSync(path.join(ROOT,'assets/fonts/NotoSans.ttf'),path.join(fontDir,name));
  const result=provisionFonts(project,ROOT,{fontDir,systemDirs:[path.join(temp,'missing')]});
  assert.equal(result.provenance.has_open_fallback,false);
  assert(result.provenance.fonts.every(row=>row.kind==='system-local'&&row.source.startsWith(fontDir)));
  assert.equal(Object.keys(result.hashes).length,4);
  assert(result.provenance.fonts.every(row=>!('license_path' in row)&&!('license_sha256' in row)));
  assert(!fs.existsSync(path.join(project,'source/fonts/OFL-NotoSans.txt')));
  assert(!fs.existsSync(path.join(project,'source/fonts/OFL-Nunito.txt')));
  for(const name of ['Arial.ttf','ArialBlack.ttf','CourierNewBold.ttf'])assert(fs.existsSync(path.join(project,'source/fonts',name)));
  assert.throws(()=>provisionFonts(project,ROOT,{fontDir,systemDirs:[]}),/will not overwrite/);
}));

test('missing system fonts initialize via explicit open fallbacks and all font hashes are guarded',()=>fixture(temp=>{
  const project=path.join(temp,'project');
  initHK(project,'16:9',{fontDir:path.join(temp,'none'),systemDirs:[path.join(temp,'missing')]});
  const prov=JSON.parse(fs.readFileSync(path.join(project,'font-provenance.json')));
  assert.equal(prov.has_open_fallback,true);assert.equal(prov.reference_pixel_equivalence,'not_verified');
  assert(prov.fonts.every(row=>row.kind==='open-fallback'));
  assert.deepEqual(prov.fonts.map(row=>row.fallback_font),['NotoSans.ttf','Nunito.ttf','NotoSans.ttf']);
  assert.equal(checkHKPack(project).files,91);
  const manifest=JSON.parse(fs.readFileSync(path.join(project,'manifest.json')));
  for(const [fallback,license] of [['NotoSans.ttf','OFL-NotoSans.txt'],['Nunito.ttf','OFL-Nunito.txt']]){
    const rel='source/fonts/'+license,source=fs.readFileSync(path.join(ROOT,'assets/fonts',license));
    assert(fs.readFileSync(path.join(project,rel)).equals(source));
    assert.equal(manifest.files[rel],crypto.createHash('sha256').update(source).digest('hex'));
    for(const row of prov.fonts.filter(row=>row.fallback_font===fallback)){
      assert.equal(row.license_path,rel);assert.equal(row.license_sha256,manifest.files[rel]);
    }
  }
  assert.equal(Object.keys(manifest.files).filter(rel=>rel.startsWith('source/fonts/OFL-')).length,2);
  fs.appendFileSync(path.join(project,'source/fonts/ArialBlack.ttf'),'tamper');
  assert.throws(()=>checkHKPack(project),/fingerprint mismatch/);
}));

test('mixed local and fallback fonts copy only each used family license once',()=>fixture(temp=>{
  for(const [caseName,names,expected] of [
    ['nunito-only',['Arial.ttf','Courier New Bold.ttf'],'OFL-Nunito.txt'],
    ['noto-only',['Arial Black.ttf'],'OFL-NotoSans.txt'],
  ]){
    const fontDir=path.join(temp,caseName+'-local'),project=path.join(temp,caseName);fs.mkdirSync(fontDir);
    for(const name of names)fs.copyFileSync(path.join(ROOT,'assets/fonts/NotoSans.ttf'),path.join(fontDir,name));
    const result=provisionFonts(project,ROOT,{fontDir,systemDirs:[]});
    assert.equal(Object.keys(result.hashes).length,5);
    assert.deepEqual(Object.keys(result.hashes).filter(rel=>rel.includes('/OFL-')),['source/fonts/'+expected]);
    assert(fs.readFileSync(path.join(project,'source/fonts',expected)).equals(fs.readFileSync(path.join(ROOT,'assets/fonts',expected))));
  }
}));

test('fallback license preflight rejects a missing source or existing target before copying fonts',()=>fixture(temp=>{
  const fakeRoot=path.join(temp,'skill');fs.mkdirSync(path.join(fakeRoot,'assets/fonts'),{recursive:true});
  for(const name of ['NotoSans.ttf','Nunito.ttf','OFL-NotoSans.txt'])fs.copyFileSync(path.join(ROOT,'assets/fonts',name),path.join(fakeRoot,'assets/fonts',name));
  const missing=path.join(temp,'missing-license');
  assert.throws(()=>provisionFonts(missing,fakeRoot,{fontDir:path.join(temp,'none'),systemDirs:[]}),/license|OFL-Nunito/i);
  assert(!fs.existsSync(missing),'missing license cannot leave partially copied font artifacts');
  const collision=path.join(temp,'collision');fs.mkdirSync(path.join(collision,'source/fonts'),{recursive:true});
  const existing=path.join(collision,'source/fonts/OFL-Nunito.txt');fs.writeFileSync(existing,'existing user file');
  assert.throws(()=>provisionFonts(collision,ROOT,{fontDir:path.join(temp,'none'),systemDirs:[]}),/will not overwrite/);
  assert.equal(fs.readFileSync(existing,'utf8'),'existing user file');
  assert(!fs.existsSync(path.join(collision,'source/fonts/Arial.ttf')));
  assert(!fs.existsSync(path.join(collision,'font-provenance.json')));
}));

test('exported fallback licenses cannot be changed, deleted or omitted from the project manifest',()=>fixture(temp=>{
  const project=path.join(temp,'project');initHK(project,'16:9',{fontDir:path.join(temp,'none'),systemDirs:[]});
  const rel='source/fonts/OFL-NotoSans.txt',license=path.join(project,rel),original=fs.readFileSync(license);
  const manifest=path.join(project,'manifest.json'),oldManifest=fs.readFileSync(manifest);
  fs.appendFileSync(license,'tamper');assert.throws(()=>checkHKPack(project),/fingerprint mismatch|license/i);fs.writeFileSync(license,original);
  fs.unlinkSync(license);assert.throws(()=>checkHKPack(project),/ENOENT|missing|license/i);fs.writeFileSync(license,original);
  const data=JSON.parse(oldManifest);delete data.files[rel];fs.writeFileSync(manifest,JSON.stringify(data));
  assert.throws(()=>checkHKPack(project),/license|OFL-NotoSans/i);fs.writeFileSync(manifest,oldManifest);
  assert.equal(checkHKPack(project).files,91);
}));

test('new-story public font is the pinned open face with its license outside the frozen engine',()=>fixture(temp=>{
  const project=path.join(temp,'project');
  assert.equal(checkPublicCaptionFont(ROOT).ok,true);
  const result=provisionPublicCaptionFont(project,ROOT);
  assert.deepEqual(result.inputs,['fonts/ArchivoBlack.ttf','fonts/OFL-ArchivoBlack.txt']);
  assert.equal(result.variant,'archivo-black');
  assert.equal(fs.readFileSync(path.join(project,PUBLIC_CAPTION_FONT.path)).equals(fs.readFileSync(path.join(ROOT,PUBLIC_CAPTION_FONT.source))),true);
  assert(fs.readFileSync(path.join(project,PUBLIC_CAPTION_FONT.licensePath),'utf8').includes('SIL Open Font License'));
  assert(!fs.existsSync(path.join(project,'engine')));
  assert.throws(()=>provisionPublicCaptionFont(project,ROOT),/will not overwrite/);
}));

test('public font setup rejects missing or changed bundled bytes and license instead of selecting an arbitrary face',()=>fixture(temp=>{
  const fakeRoot=path.join(temp,'skill');fs.mkdirSync(path.join(fakeRoot,'assets/fonts'),{recursive:true});
  assert.throws(()=>checkPublicCaptionFont(fakeRoot),/font\/license missing/);
  for(const rel of [PUBLIC_CAPTION_FONT.source,PUBLIC_CAPTION_FONT.licenseSource])fs.copyFileSync(path.join(ROOT,rel),path.join(fakeRoot,rel));
  assert.equal(checkPublicCaptionFont(fakeRoot).ok,true);
  for(const rel of [PUBLIC_CAPTION_FONT.source,PUBLIC_CAPTION_FONT.licenseSource]){
    const p=path.join(fakeRoot,rel),original=fs.readFileSync(p);
    fs.appendFileSync(p,'tampered');
    assert.throws(()=>checkPublicCaptionFont(fakeRoot),/fingerprint mismatch/);
    fs.writeFileSync(p,original);
  }
}));

test('new stories select Archivo Black even when every legacy system face uses an open fallback',()=>fixture(temp=>{
  const project=path.join(temp,'project');
  initProduction(project,'9:16',{fontDir:path.join(temp,'no-local-faces'),systemDirs:[]});
  const p=JSON.parse(fs.readFileSync(path.join(project,'project.json')));
  const plan=JSON.parse(fs.readFileSync(path.join(project,p.formats['9:16'])));
  const provenance=JSON.parse(fs.readFileSync(path.join(project,'engine/font-provenance.json')));
  assert(provenance.fonts.every(row=>row.kind==='open-fallback'));
  assert.equal(plan.caption.font_file,'fonts/ArchivoBlack.ttf');
  assert.equal(plan.caption.font_family,'Archivo Black');
  assert.equal(checkHKPack(path.join(project,'engine')).files,91);
}));
