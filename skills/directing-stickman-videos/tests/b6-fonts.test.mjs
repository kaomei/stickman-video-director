import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {provisionFonts} from '../scripts/b6-fonts.mjs';
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
  assert.equal(checkHKPack(project).files,89);
  fs.appendFileSync(path.join(project,'source/fonts/ArialBlack.ttf'),'tamper');
  assert.throws(()=>checkHKPack(project),/fingerprint mismatch/);
}));
