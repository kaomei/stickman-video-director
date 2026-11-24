import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {checkReferencePack} from '../scripts/check-b8-reference-pack.mjs';

function fixture(t) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'b8-baseline-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const roles=['motion_reference','character_style_board','shot_language_board','contact_sequence_board'];
  const files=roles.map((role,index)=>{
    const name=`${index}.ref`, bytes=Buffer.from(`fixture ${role}`);
    fs.writeFileSync(path.join(dir,name),bytes);
    return {role,path:name,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
  });
  const manifest={schema_version:1,style:'B8',reference_scope:'visual_baseline',
    user_visual_feedback:{quote:'approved visual effect',scope:'this reference only'},files};
  const file=path.join(dir,'reference-manifest.json');
  const save=()=>fs.writeFileSync(file,JSON.stringify(manifest));
  save(); return {dir,file,manifest,save};
}
test('valid complete reference pack passes file integrity only',t=>{
  const f=fixture(t),r=checkReferencePack(f.file);
  assert.equal(r.ok,true); assert.equal(r.verifiedFiles.length,4);
  assert.match(r.scope,/integrity only/);
});
test('missing and altered references block use',t=>{
  const f=fixture(t);
  fs.writeFileSync(path.join(f.dir,'0.ref'),'changed');
  assert.equal(checkReferencePack(f.file).ok,false);
  fs.unlinkSync(path.join(f.dir,'0.ref'));
  assert.equal(checkReferencePack(f.file).ok,false);
});
test('incomplete roles and unrelated approval cannot pass',t=>{
  const f=fixture(t); f.manifest.files.pop(); delete f.manifest.user_visual_feedback.scope; f.save();
  const r=checkReferencePack(f.file); assert.equal(r.ok,false);
  assert.ok(r.failures.some(x=>x.includes('contact_sequence_board')));
  assert.ok(r.failures.some(x=>x.includes('feedback')));
});
test('relative traversal and symlink escapes are rejected',t=>{
  const f=fixture(t); const outside=path.join(f.dir,'..',path.basename(f.dir)+'.external');
  fs.writeFileSync(outside,'outside'); t.after(()=>fs.rmSync(outside,{force:true}));
  f.manifest.files[0].path='../'+path.basename(outside); f.save();
  assert.ok(checkReferencePack(f.file).failures.some(x=>x.includes('escapes pack')));
  fs.symlinkSync(outside,path.join(f.dir,'escape'));
  f.manifest.files[0].path='escape'; f.save();
  assert.ok(checkReferencePack(f.file).failures.some(x=>x.includes('escapes pack')));
});
test('bundled accepted B8 reference files have their recorded fingerprints',()=>{
  const r=checkReferencePack(new URL('../assets/b8/approved-midas-r3-v1/reference-manifest.json',import.meta.url));
  assert.equal(r.ok,true,JSON.stringify(r.failures));
});
