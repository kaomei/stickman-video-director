import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {validateB5Production, checkB5Motion} from '../scripts/b5-production-quality.mjs';

const require = createRequire(import.meta.url), sharp = require('sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pack = path.join(root, 'assets/b5'), cli = path.join(root, 'scripts/character-explainer.mjs');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const svg = t => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#eee8df"/><rect x="${20 + 12*t}" y="35" width="24" height="40" fill="#202020"/></svg>`);
const run = args => spawnSync(process.execPath, [cli, ...args], {encoding:'utf8', maxBuffer:2e6});
async function fixture(t) {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'b5-quality-')));
  t.after(() => fs.rmSync(tmp, {recursive:true, force:true}));
  const dir = path.join(tmp, 'project'), scene = path.join(dir, 'scene');
  fs.mkdirSync(scene, {recursive:true});
  const c = {width:320, height:180, fps:12, duration:4};
  write(path.join(dir, 'project.json'), {style:'B5', renderer:'character-explainer-code-v1'});
  write(path.join(scene, 'config.json'), c);
  await sharp(svg(0)).png().toFile(path.join(scene, 'presenter.png'));
  for (const f of ['Instrument-Sans-1.ttf', 'Anton-0.ttf']) fs.copyFileSync(path.join(pack, 'example/assets/fonts', f), path.join(scene, f));
  const mixed = spawnSync(process.env.FFMPEG || 'ffmpeg', ['-v','error','-f','lavfi','-i','sine=frequency=440:duration=4','-c:a','pcm_s16le',path.join(scene,'mix.wav')], {encoding:'utf8'});
  assert.equal(mixed.status, 0, mixed.stderr);
  const lock = name => ({path:name, sha256:sha(path.join(scene, name))});
  const q = {
    presenter:{kind:'real_person', ...lock('presenter.png'), identity_anchor:'Synthetic test identity, not celebrity likeness', style_anchor:'Synthetic B5 gate fixture, not creative acceptance', static_approval:'Engineering fixture only; no human/creative approval claimed', source:{type:'image_tool', tool:'other-agent-image-tool', model:'user-selected-model', prompt:'Synthetic recorded fixture; no real generation occurred', references:[]}},
    captions:{preset:'b5-instrument-anton-v1', font:lock('Instrument-Sans-1.ttf'), title_font:lock('Anton-0.ttf'), semantic_review:'Synthetic engineering fixture only; no real caption review claimed'},
    sound:[{kind:'ambience', start:0, end:4, reason:'Synthetic coverage fixture', ...lock('mix.wav'), rights:'Locally synthesized test tone'}],
    sound_review:'Engineering fixture only; no physical listening claimed', mix:lock('mix.wav'),
    motion:[{start:0, end:4, role:'prop', reason:'Test square shifts locally', region:[10,20,100,100]}]
  };
  const save = () => write(path.join(scene, 'production.json'), q);
  save();
  const render = {qualityFrame:svg, frame:svg, productionAssets:[lock('presenter.png')]};
  return {tmp,dir,scene,c,q,save,lock,render,validate:() => validateB5Production({dir,c},pack)};
}

test('only the byte-identical historical example bypasses the new-story manifest', async t => {
  const f = await fixture(t);
  fs.rmSync(f.scene, {recursive:true}); fs.cpSync(path.join(pack,'example'),f.scene,{recursive:true});
  assert.equal(f.validate().mode, 'exact_approved_legacy');
  fs.appendFileSync(path.join(f.scene,'renderer.cjs'), '\n// changed story\n');
  assert.throws(f.validate, /new stories require scene\/production.json/);
});

test('B5 accepts provider-neutral generated or supplied rasters without a Codex requirement', async t => {
  const f = await fixture(t);
  assert.equal(f.validate().presenter.source, 'image_tool');
  await checkB5Motion(f.validate(), f.render, sharp);
  for (const type of ['user_supplied','approved_reuse']) {
    f.q.presenter.source = {type, origin:'Accepted project asset; fixture only', references:[]}; f.save();
    assert.equal(f.validate().presenter.source, type);
  }
});

test('B5 rejects missing approval, fake provider metadata, changed hashes and new code likenesses', async t => {
  const f = await fixture(t), original = structuredClone(f.q);
  for (const key of ['identity_anchor','style_anchor','static_approval']) {
    f.q.presenter[key] = ''; f.save(); assert.throws(f.validate, /anchor|approval/);
    Object.assign(f.q, structuredClone(original));
  }
  for (const key of ['tool','model','prompt']) {
    f.q.presenter.source[key] = ''; f.save(); assert.throws(f.validate, /tool\/model/);
    Object.assign(f.q, structuredClone(original));
  }
  f.q.presenter.source.type = 'original_code'; f.save(); assert.throws(f.validate, /not SVG\/Canvas/);
  Object.assign(f.q, structuredClone(original));
  f.q.presenter.sha256 = '0'.repeat(64); f.save(); assert.throws(f.validate, /hash changed/);
  fs.writeFileSync(path.join(f.scene,'code-face.svg'),svg(0));
  Object.assign(f.q, structuredClone(original)); Object.assign(f.q.presenter,f.lock('code-face.svg')); f.save();
  assert.throws(f.validate, /not SVG\/Canvas/);
  f.q.presenter.source = {type:'approved_reuse',origin:'Not the bundled accepted rig',references:[]}; f.save();
  assert.throws(f.validate, /not SVG\/Canvas/);
  f.q.presenter.kind = 'original_simple'; f.q.presenter.source.type = 'original_code'; f.save();
  assert.equal(f.validate().presenter.kind, 'original_simple');
});

test('B5 preserves only the exact approved code-native Spider-Man identity exception', async t => {
  const f = await fixture(t);
  fs.copyFileSync(path.join(pack,'example/assets/rig/spider-approved.svg'),path.join(f.scene,'accepted.svg'));
  Object.assign(f.q.presenter,f.lock('accepted.svg'),{kind:'complex_character',source:{type:'approved_reuse',origin:'Exact existing bundled identity; engineering reuse',references:[]}}); f.save();
  const evidence = f.validate(); assert.equal(evidence.presenter.approvedRigReuse,true);
  await checkB5Motion(evidence,{...f.render,productionAssets:[f.lock('accepted.svg')]},sharp);
  fs.appendFileSync(path.join(f.scene,'accepted.svg'),'\n'); Object.assign(f.q.presenter,f.lock('accepted.svg')); f.save();
  assert.throws(f.validate,/not SVG\/Canvas/);
});

test('B5 requires continuous quiet bed coverage, causal sound notes and fixed typography', async t => {
  const f = await fixture(t), original = structuredClone(f.q);
  f.q.sound = []; f.save(); assert.throws(f.validate,/sound ledger/);
  Object.assign(f.q,structuredClone(original)); f.q.sound[0].kind = 'dialogue'; f.save(); assert.throws(f.validate,/background gaps/);
  Object.assign(f.q,structuredClone(original)); f.q.sound[0].end = 1; f.save(); assert.throws(f.validate,/background gaps/);
  f.q.sound.push({kind:'quiet',start:1,end:4,reason:'Deliberate test pause'}); f.save(); assert.equal(f.validate().mode,'new_story');
  f.q.sound[1].reason = ''; f.save(); assert.throws(f.validate,/cue\/time\/reason/);
  Object.assign(f.q,structuredClone(original)); f.q.captions.preset='generic-default'; f.save(); assert.throws(f.validate,/Instrument Sans\/Anton/);
  Object.assign(f.q,structuredClone(original)); f.q.captions.font=f.lock('Anton-0.ttf'); f.save(); assert.throws(f.validate,/font changed/);
});

test('B5 rejects static/fake raster/missing render-path evidence and samples real local pixels', async t => {
  const f = await fixture(t), q = f.validate();
  await assert.rejects(checkB5Motion(q,{...f.render,qualityFrame:undefined},sharp),/qualityFrame/);
  await assert.rejects(checkB5Motion(q,{...f.render,productionAssets:[]},sharp),/actual locked presenter/);
  await assert.rejects(checkB5Motion(q,{...f.render,qualityFrame:()=>svg(0)},sharp),/no visible pixel change/);
  const result = await checkB5Motion(q,f.render,sharp); assert(result.motion_samples[0].changed_pixels>8);
  f.q.motion=[]; f.save(); assert.throws(f.validate,/inactive/);
  f.q.motion=[{start:0,end:4,role:'caption',reason:'Not local picture',region:[10,20,100,100]}]; f.save(); assert.throws(f.validate,/actor\/prop\/information/);
  f.q.motion[0].role='prop'; f.q.motion[0].region=[0,0,320,180]; f.save(); assert.throws(f.validate,/local picture region/);
  fs.writeFileSync(path.join(f.scene,'fake.png'),Buffer.from([137,80,78,71,13,10,26,10]));
  Object.assign(f.q.presenter,f.lock('fake.png')); f.q.motion=[{start:0,end:4,role:'prop',reason:'Test motion',region:[10,20,100,100]}]; f.save();
  await assert.rejects(checkB5Motion(f.validate(),{...f.render,productionAssets:[f.lock('fake.png')]},sharp),/corrupt|invalid|pngload|header|input/i);
});

test('B5 new-story frames/encode enforce current evidence and reviewed mix without paid calls', async t => {
  const f = await fixture(t);
  fs.writeFileSync(path.join(f.scene,'renderer.cjs'),`const fs=require('node:fs');module.exports={productionAssets:${JSON.stringify([f.lock('presenter.png')])},frame:${svg.toString()},qualityFrame:${svg.toString()}};`);
  let r=run(['validate',f.dir]); assert.equal(r.status,0,r.stderr);
  const frameDir=path.join(f.tmp,'frames');
  r=run(['frames',f.dir,'--output',frameDir,'--all']); assert.notEqual(r.status,0); assert.match(r.stderr,/trusted-code/);
  r=run(['frames',f.dir,'--output',frameDir,'--all','--trusted-code']); assert.equal(r.status,0,r.stderr);
  const ledger=JSON.parse(fs.readFileSync(path.join(frameDir,'frames.json'))); assert.equal(ledger.frames.length,48); assert(ledger.production.motion_samples[0].changed_pixels>8);
  const args=['encode',f.dir,'--frames-dir',frameDir,'--audio',path.join(f.scene,'mix.wav'),'--output',path.join(f.tmp,'delivery'),'--approval-note','Synthetic engineering encode only; not user creative approval'];
  r=run(args); assert.equal(r.status,0,r.stderr);
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.tmp,'delivery/delivery.json'))).full_decode,'pass');
  fs.copyFileSync(path.join(f.scene,'mix.wav'),path.join(f.tmp,'other.wav')); fs.appendFileSync(path.join(f.tmp,'other.wav'),'different bytes');
  const wrong=[...args]; wrong[wrong.indexOf('--audio')+1]=path.join(f.tmp,'other.wav'); wrong[wrong.indexOf('--output')+1]=path.join(f.tmp,'wrong');
  r=run(wrong); assert.notEqual(r.status,0); assert.match(r.stderr,/reviewed final mix/);
  fs.appendFileSync(path.join(f.scene,'renderer.cjs'),'\n// stale\n');
  r=run(args); assert.notEqual(r.status,0); assert.match(r.stderr,/Project changed/);
});
