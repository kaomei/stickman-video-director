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

test('B5 requires continuous quiet bed coverage, causal sound notes and default typography without an override', async t => {
  const f = await fixture(t), original = structuredClone(f.q);
  f.q.sound = []; f.save(); assert.throws(f.validate,/sound ledger/);
  Object.assign(f.q,structuredClone(original)); f.q.sound[0].kind = 'dialogue'; f.save(); assert.throws(f.validate,/background gaps/);
  Object.assign(f.q,structuredClone(original)); f.q.sound[0].end = 1; f.save(); assert.throws(f.validate,/background gaps/);
  f.q.sound.push({kind:'quiet',start:1,end:4,reason:'Deliberate test pause'}); f.save(); assert.equal(f.validate().mode,'new_story');
  f.q.sound[1].reason = ''; f.save(); assert.throws(f.validate,/cue\/time\/reason/);
  Object.assign(f.q,structuredClone(original)); f.q.captions.preset='generic-default'; f.save(); assert.throws(f.validate,/Instrument Sans\/Anton/);
  Object.assign(f.q,structuredClone(original)); f.q.captions.font=f.lock('Anton-0.ttf'); f.save(); assert.throws(f.validate,/font changed/);
});

test('B5 permits an explicit user font/effect treatment without a second approval prompt', async t => {
  const f = await fixture(t), before = f.validate().manifest_sha256;
  f.q.captions.preset = 'fixture-user-editorial';
  f.q.captions.font = f.lock('Anton-0.ttf');
  f.q.captions.title_font = f.lock('Instrument-Sans-1.ttf');
  f.q.captions.override = {kind:'user_choice', reason:'Fixture requests a different font/effect', user_approval:'Synthetic user request fixture, not actual creative approval', treatment:'Anton captions, Instrument Sans titles, red emphasis; maintain readable safe bounds'};
  f.save();
  const evidence = f.validate();
  assert.equal(evidence.captions.override.kind,'user_choice');
  assert.equal(evidence.captions.preset,'fixture-user-editorial');
  assert.equal(evidence.captions.font_sha256,f.lock('Anton-0.ttf').sha256);
  assert.notEqual(evidence.manifest_sha256,before);
  await checkB5Motion(evidence,f.render,sharp);
});

test('B5 language fallback changes font assets but does not silently choose another design preset', async t => {
  const f = await fixture(t);
  fs.copyFileSync(path.join(root,'assets/fonts/NotoSans.ttf'),path.join(f.scene,'localized.ttf'));
  f.q.captions.font = f.lock('localized.ttf');
  f.q.captions.title_font = f.lock('localized.ttf');
  f.q.captions.override = {kind:'language_fallback', language:'tr', reason:'Synthetic localization fixture, not glyph-coverage certification', treatment:'Use the supplied localized font; preserve headline/caption hierarchy and semantic layout'};
  f.save();
  assert.equal(f.validate().captions.override.language,'tr');
  f.q.captions.preset = 'unrequested-design'; f.save();
  assert.throws(f.validate,/Instrument Sans\/Anton/);
});

test('B5 rejects unscoped typography bypasses and retains font, semantic, sound and motion gates', async t => {
  const f = await fixture(t), valid = {kind:'user_choice', reason:'Synthetic scoped test', user_approval:'Synthetic request fixture only', treatment:'Alternate fixture font'};
  for (const override of [null, {}, {kind:'anything',reason:'x'}, {...valid,reason:''}, {...valid,user_approval:''}, {...valid,treatment:''}, {kind:'language_fallback',reason:'x',treatment:'x'}, {kind:'language_fallback',reason:'x',language:'zh-CN'}]) {
    f.q.captions.override = override; f.save(); assert.throws(f.validate,/override|request|treatment|language/);
  }
  f.q.captions.override = valid; f.q.captions.font = f.lock('Anton-0.ttf'); f.save();
  assert.equal(f.validate().mode,'new_story');
  const original = structuredClone(f.q);
  f.q.captions.semantic_review=''; f.save(); assert.throws(f.validate,/semantic/);
  Object.assign(f.q,structuredClone(original)); f.q.captions.font.sha256='0'.repeat(64); f.save(); assert.throws(f.validate,/hash changed/);
  Object.assign(f.q,structuredClone(original)); f.q.captions.title_font.path='../outside.ttf'; f.save(); assert.throws(f.validate,/local-only/);
  Object.assign(f.q,structuredClone(original)); f.q.sound=[]; f.save(); assert.throws(f.validate,/sound ledger/);
  Object.assign(f.q,structuredClone(original)); f.q.motion=[]; f.save(); assert.throws(f.validate,/inactive/);
  Object.assign(f.q,structuredClone(original)); f.q.presenter.static_approval=''; f.save(); assert.throws(f.validate,/approval/);
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

test('B5 technical success with a static custom caption produces only a candidate, never a visual pass', async t => {
  const f = await fixture(t);
  fs.copyFileSync(path.join(root,'assets/fonts/NotoSans.ttf'),path.join(f.scene,'custom.ttf'));
  f.q.captions.font=f.lock('custom.ttf');
  f.q.captions.preset='fixture-user-noto';
  f.q.captions.override={kind:'user_choice',reason:'Synthetic end-to-end font customization test',user_approval:'Synthetic request fixture, not actual creative approval',treatment:'Noto Sans caption tile with red emphasis, original picture motion retained'};
  f.save();
  const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');
  assert(GlobalFonts.registerFromPath(path.join(f.scene,'custom.ttf'),'B5CustomFixture'));
  const tile=createCanvas(160,35),ctx=tile.getContext('2d');
  ctx.font='18px B5CustomFixture';ctx.fillStyle='#D7372C';ctx.fillText('Custom caption',1,24);
  fs.writeFileSync(path.join(f.scene,'caption.png'),tile.toBuffer('image/png'));
  fs.writeFileSync(path.join(f.scene,'renderer.cjs'),`const fs=require('node:fs'),path=require('node:path');const picture=${svg.toString()};const tile=fs.readFileSync(path.join(__dirname,'caption.png')).toString('base64');module.exports={productionAssets:${JSON.stringify([f.lock('presenter.png')])},frame:t=>Buffer.from(picture(t).toString().replace('</svg>','<image x="150" y="130" width="160" height="35" href="data:image/png;base64,'+tile+'"/></svg>')),qualityFrame:picture};`);
  let r=run(['validate',f.dir]); assert.equal(r.status,0,r.stderr);
  const frameDir=path.join(f.tmp,'frames');
  r=run(['frames',f.dir,'--output',frameDir,'--all']); assert.notEqual(r.status,0); assert.match(r.stderr,/trusted-code/);
  r=run(['frames',f.dir,'--output',frameDir,'--all','--trusted-code']); assert.equal(r.status,0,r.stderr);
  const ledger=JSON.parse(fs.readFileSync(path.join(frameDir,'frames.json'))); assert.equal(ledger.frames.length,48); assert(ledger.production.motion_samples[0].changed_pixels>8);
  assert.equal(ledger.production.captions.override.kind,'user_choice');
  assert.equal(ledger.production.captions.font_sha256,f.lock('custom.ttf').sha256);
  const printed=await sharp(path.join(frameDir,'000000.png')).extract({left:150,top:130,width:160,height:35}).removeAlpha().raw().toBuffer();
  let red=0;for(let i=0;i<printed.length;i+=3)if(printed[i]>130&&printed[i+1]<110&&printed[i+2]<110)red++;
  assert(red>20,'custom-font caption tile must appear in the rendered frame');
  const args=['encode',f.dir,'--frames-dir',frameDir,'--audio',path.join(f.scene,'mix.wav'),'--output',path.join(f.tmp,'candidate')];
  r=run(args); assert.equal(r.status,0,r.stderr);
  const candidate=JSON.parse(fs.readFileSync(path.join(f.tmp,'candidate/candidate.json')));
  assert.equal(candidate.full_decode,'pass');
  assert.equal(candidate.status,'pending_visual_review');
  assert.equal(candidate.visual_acceptance,'not_reviewed');
  assert.equal(JSON.parse(r.stdout).status,'pending_visual_review');
  assert(!fs.existsSync(path.join(f.tmp,'candidate/delivery.json')),'encoding must not create an accepted delivery');
  const evidence=path.join(f.tmp,'no-evidence');
  r=run(['review-pack',f.dir,'--candidate-dir',path.join(f.tmp,'candidate'),'--output',evidence]);
  assert.notEqual(r.status,0,'static caption engineering fixture cannot acquire a visual pass without a plan and actual review');
  assert.match(r.stderr,/visual-plan/);
  assert(!fs.existsSync(evidence));
  fs.copyFileSync(path.join(f.scene,'mix.wav'),path.join(f.tmp,'other.wav')); fs.appendFileSync(path.join(f.tmp,'other.wav'),'different bytes');
  const wrong=[...args]; wrong[wrong.indexOf('--audio')+1]=path.join(f.tmp,'other.wav'); wrong[wrong.indexOf('--output')+1]=path.join(f.tmp,'wrong');
  r=run(wrong); assert.notEqual(r.status,0); assert.match(r.stderr,/reviewed final mix/);
  fs.appendFileSync(path.join(f.scene,'renderer.cjs'),'\n// stale\n');
  r=run(args); assert.notEqual(r.status,0); assert.match(r.stderr,/Project changed/);
  fs.appendFileSync(path.join(f.scene,'custom.ttf'),'changed font');
  r=run(['validate',f.dir]); assert.notEqual(r.status,0); assert.match(r.stderr,/hash changed/);
});
