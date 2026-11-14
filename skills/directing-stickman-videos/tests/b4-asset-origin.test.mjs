import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {createCanvas} from '@napi-rs/canvas';
import {assertB4StoryAsset} from '../scripts/b4-asset-origin.mjs';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
function fixture(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'b4-origin-test-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
test('all five style anchors and approved opening remain inspectable but cannot become renamed story assets',t=>{
  const dir=fixture(t);
  for(const name of ['reference-01-motor-room.png','reference-02-rooftop.png','reference-03-driver.png','reference-04-street.png','reference-05-opposite-rooftop.png','portrait-opening-approved.jpg','portrait-opening-approved.mp4']) {
    const copy=path.join(dir,'fresh-story-'+name);fs.copyFileSync(path.join(ROOT,'assets/b4',name),copy);
    assert.throws(()=>assertB4StoryAsset(copy),/asset origin:.*(?:style_reference|approved_showcase).*exact content match/);
  }
});
test('JPEG conversion, resizing and a new filename do not license the reference as new story art',async t=>{
  const dir=fixture(t),copy=path.join(dir,'my-original-scene.jpg');
  await sharp(path.join(ROOT,'assets/b4/reference-04-street.png')).resize(418,235).jpeg({quality:72}).toFile(copy);
  assert.throws(()=>assertB4StoryAsset(copy),/close whole-image copy/);
});
test('a fresh story-specific image is a candidate, not automatically approved visual quality',t=>{
  const dir=fixture(t),file=path.join(dir,'new-platform-scene.png'),c=createCanvas(320,180),ctx=c.getContext('2d');
  ctx.fillStyle='#283747';ctx.fillRect(0,0,320,180);ctx.fillStyle='#ceaa75';ctx.fillRect(26,30,190,85);ctx.fillStyle='#618b81';ctx.fillRect(220,70,80,110);
  fs.writeFileSync(file,c.toBuffer('image/png'));
  const result=assertB4StoryAsset(file);assert.equal(result.role,'story_candidate');assert.equal(result.known_reference_match,false);assert.equal(result.whole_image_comparisons,6);assert.match(result.visual_acceptance,/not established/);
});
test('installed Skill location does not determine whether a copied reference is recognized',t=>{
  const dir=fixture(t),installed=path.join(dir,'installed'),copy=path.join(dir,'story.png');
  fs.cpSync(path.join(ROOT,'assets/b4'),path.join(installed,'assets/b4'),{recursive:true});
  fs.cpSync(path.join(ROOT,'references'),path.join(installed,'references'),{recursive:true});
  fs.copyFileSync(path.join(ROOT,'assets/b4/reference-04-street.png'),copy);
  assert.throws(()=>assertB4StoryAsset(copy,{skillRoot:installed}),/style_reference street/);
});
