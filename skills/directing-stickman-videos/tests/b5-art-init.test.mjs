import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {initB5,ROOT} from '../scripts/character-explainer.mjs';
const require=createRequire(import.meta.url);
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const temporary=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'b5-art-init-')));
test.after(()=>fs.rmSync(temporary,{recursive:true,force:true}));

test('default init supplies exact portable drawing/pose implementation and preserves a neutral stage',()=>{
 const project=path.join(temporary,'new-story'),receipt=initB5(project);
 const kit=path.join(project,'scene/runtime/b5-art-kit.cjs');
 assert.equal(receipt.art_kit,kit);
 assert.equal(sha(kit),sha(path.join(ROOT,'scripts/b5-art-kit.cjs')));
 assert.equal(JSON.parse(fs.readFileSync(path.join(project,'project.json'))).art_kit,'scene/runtime/b5-art-kit.cjs');
 assert.equal(receipt.scaffold_type,'neutral_new_story');
 const stage=require(path.join(project,'scene/stage.cjs'));
 assert.equal(stage.art,require(kit));
 assert.throws(()=>stage.scene(0),/new-story stage has not been authored/);
 const before=sha(path.join(project,'scene/stage.cjs'));
 assert.throws(()=>initB5(project),/exists/);
 assert.equal(sha(path.join(project,'scene/stage.cjs')),before,'failed overwrite cannot change the authored file');
 const artwork=stage.art.drawings.phone();
 assert.equal(typeof artwork.svg,'string');
 assert(artwork.svg.length>100);
 assert(artwork.bounds && artwork.anchors);
 const moved=path.join(temporary,'relocated');
 fs.renameSync(project,moved);
 const relocated=require(path.join(moved,'scene/stage.cjs'));
 assert.deepEqual(relocated.art.drawings.phone(),artwork,'whole drawing remains identical without an installed-Skill path');
 assert.throws(()=>relocated.draw(0),/new-story stage has not been authored/);
});

test('historical inspection retains its exact closed scaffold without an unused kit',()=>{
 const project=path.join(temporary,'historical'),receipt=initB5(project,{referenceScaffold:true});
 assert.equal(receipt.scaffold_type,'historical_reference');
 assert.equal(sha(path.join(project,'scene/stage.cjs')),sha(path.join(ROOT,'assets/b5/example/stage.cjs')));
 assert.equal(sha(path.join(project,'approved-reference.mp4')),sha(path.join(ROOT,'assets/b5/approved-sample.mp4')));
 assert.equal(receipt.art_kit,null);
 assert.equal(JSON.parse(fs.readFileSync(path.join(project,'project.json'))).art_kit,null);
 assert(!fs.existsSync(path.join(project,'scene/runtime')));
 const scene=require(path.join(project,'scene/stage.cjs'));
 assert.equal(typeof scene.draw,'function');
 assert(Array.isArray(scene.events));
});
