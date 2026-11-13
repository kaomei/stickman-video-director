import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {initB6,runB6} from '../scripts/b6-dynamic-meme.mjs';
import {checkHKPack} from '../scripts/b6-hong-kong.mjs';

test('V90 example copies a complete independent project and rejects damaged inputs',async()=>{
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'b6-v90-test-')),dir=path.join(temp,'new-project');
  try {
    assert.throws(()=>initB6(dir,'9:16','hong-kong-v90'),/native 16:9/);
    assert.equal(fs.existsSync(dir),false);
    initB6(dir,'16:9','hong-kong-v90');assert.equal(checkHKPack(dir).files,89);
    assert(fs.existsSync(path.join(dir,'font-provenance.json')));
    const valid=await runB6('validate',[dir,'--ratio','16:9']);assert.equal(valid.valid,true);
    assert.throws(()=>initB6(dir,'16:9','hong-kong-v90'),/exists/);
    await assert.rejects(()=>runB6('preview',[dir,'--seconds','.1','--output','outputs/untrusted']),/trusted-code/);
    fs.appendFileSync(path.join(dir,'captions.json'),' ');
    assert.throws(()=>checkHKPack(dir),/fingerprint mismatch/);
  } finally {fs.rmSync(temp,{recursive:true,force:true});}
});
