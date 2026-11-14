import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT, FFMPEG, run, save, json, hashFile, loadProject, sha} from '../scripts/autopilot-core.mjs';
import {writeSyntheticReferenceReview} from './helpers/reference-review.mjs';
import {canonicalJson} from '../scripts/canonical-json.mjs';
import {planBStyleReference} from '../scripts/b-style-reference-review.mjs';

// These tiny tones and borrowed fixture props test review control flow only.
// Passing a synthetic declaration here is never evidence of sample visual quality.
const cli = path.join(ROOT, 'scripts/autopilot.mjs');
const note = 'Synthetic integration fixture only; not real user approval or aesthetic acceptance.';
function command(...args) {
  return spawnSync(process.execPath, [cli, ...args], {encoding:'utf8', timeout:120000});
}
function passed(result) {
  assert.equal(result.status, 0, result.stderr || result.stdout);
  // Renders emit JSON progress lines before their final pretty-printed report.
  return JSON.parse(result.stdout.slice(result.stdout.lastIndexOf('\n{')+1));
}
function rejected(result, pattern) {
  assert.notEqual(result.status, 0, result.stdout);
  if (pattern) assert.match(result.stderr, pattern);
}
function fixture(t, style, mode = 'sample_target') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b-reference-cli-'));
  t.after(() => fs.rmSync(dir, {recursive:true, force:true}));
  run(FFMPEG, ['-v','error','-f','lavfi','-i','sine=frequency=310:duration=1.2','-y',path.join(dir,'voice.wav')]);
  const layer = id => ({id,type:'image',path:'@b1/idea-bulb-crayon.png',x:250,y:100,w:160,keys:[{t:0,x:250},{t:.5,x:350}]});
  const project = {version:1,style,width:640,height:360,fps:12,voice:{path:'voice.wav'},
    reference_review:{author_id:'synthetic-author',capability:{mode,environment:'Local synthetic CLI regression fixture',limitations:mode==='limited'?[{capability:'story-specific layered art',observed:'Fixture uses a supplied engineering prop, not production artwork.',impact:'Cannot establish comparable character acting or sample drawing quality.'}]:[]}},
    ...(style==='B3'?{television:{enabled:false}}:{}),
    captions:[{start:0,end:.6,text:'A synthetic opening.'},{start:.6,end:1.2,text:'A synthetic ending.'}],
    shots:[{start:0,end:.6,layers:[layer('opening-prop')]},{start:.6,end:1.2,layers:[layer('ending-prop')]}],
    ambience:[{path:'voice.wav',start:0,end:1.2,gain:.01}],sfx:[{time:.2,kind:'tap',gain:.01}]};
  if(style==='B3')for(const [i,s] of project.shots.entries()) {
    s.layers[0].motion={role:'prop',reason:'Synthetic prop displacement tests the semantic protocol only.'};
    s.layers[0].keys[0].t=.1; // Keep an actual encoded initial state in each short shot.
    s.b3_semantics={events:[{id:'move-'+i,cue_index:i,kind:'action',layer_ids:[s.layers[0].id],start:s.start+.1,end:s.start+.5,before:'Synthetic prop begins at its authored left position.',after:'Synthetic prop reaches its authored right position.',purpose:'Synthetic movement protocol, not an actual explanatory video.'}],graphics:[]};
  }
  const file = path.join(dir,'project.json'), write = () => save(file,project); write();
  return {dir,file,project,write,out:path.join(dir,'output')};
}
function reviewFor(f, which) {
  const dir = path.join(f.out,`${which}-reference`), evidence = json(path.join(dir,'evidence.json'));
  const file = writeSyntheticReferenceReview(f.dir,which), review = json(file);
  return {file,review,evidence,dir,write:()=>save(file,review)};
}

function reverseKeys(value) {
  if (Array.isArray(value)) return value.map(reverseKeys);
  return value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [key, reverseKeys(item)])) : value;
}

test('canonical JSON keeps every value and array order while normalizing object keys', () => {
  const value = JSON.parse('{"z":[{"second":2,"first":1},0],"__proto__":{"kept":true},"a":null}');
  assert.equal(canonicalJson(value),canonicalJson(reverseKeys(value)));
  assert.deepEqual(JSON.parse(canonicalJson(value)),value);
  const changed = structuredClone(value); changed.z.reverse();
  assert.notEqual(canonicalJson(value),canonicalJson(changed));
  changed.z = value.z; changed.extra = false;
  assert.notEqual(canonicalJson(value),canonicalJson(changed));
});

for (const style of ['B1','B2','B3']) test(`${style} approvals survive administrative/JSON formatting edits but retain all real input and review gates`, t => {
  const f = fixture(t,style);
  fs.copyFileSync(path.join(ROOT,'assets/b1/idea-bulb-crayon.png'),path.join(f.dir,'story-prop.png'));
  f.project.shots.forEach(s => {s.layers[0].path = 'story-prop.png';}); f.write();
  passed(command('preview',f.file,'--seconds','.6'));
  const sample = reviewFor(f,'preview');
  sample.review.full_playback.observations.push({time:.2,detail:'A second ordered synthetic observation; no actual viewing is claimed.',evidence_ids:['source-video']}); sample.write();
  passed(command('approve',f.file,'--note',note,'--visual-review',sample.file));
  const approvalFile = path.join(f.out,'approval.json'), approval = json(approvalFile);
  assert.equal(approval.visual_review_hash_schema,'canonical-json-v1');
  assert.equal(approval.visual_review_semantic_sha256,sha(canonicalJson(sample.review)));
  assert.equal(approval.visual_review_sha256,hashFile(sample.file),'Original bytes remain recorded for audit.');
  passed(command('render',f.file));
  const previewHash = hashFile(path.join(f.out,'preview.mp4')), filmHash = hashFile(path.join(f.out,'film.mp4'));
  const scoped = () => loadProject(f.file,{seconds:.6});
  const initial = scoped(), plan = planBStyleReference(initial);
  const cached = () => {
    assert.equal(passed(command('render',f.file)).reused,true,'No preview, approval or encoded output needs regeneration.');
    assert.equal(hashFile(path.join(f.out,'preview.mp4')),previewHash);
    assert.equal(hashFile(path.join(f.out,'film.mp4')),filmHash);
    assert.deepEqual(json(approvalFile),approval,'Formatting does not silently create another approval.');
  };
  f.project.metadata = {working_note:'A local administrative note.'}; f.write(); cached();
  f.project.metadata.working_note = 'A changed local note.'; f.write(); cached();
  save(f.file,reverseKeys(f.project));
  assert.equal(scoped().fingerprint,initial.fingerprint);
  assert.deepEqual(planBStyleReference(scoped()),plan,'Nested caption, capability and B3 plan hashes remain equivalent.');
  cached();
  fs.writeFileSync(sample.file,JSON.stringify(reverseKeys(sample.review))); cached();
  assert.notEqual(hashFile(sample.file),approval.visual_review_sha256);
  assert.equal(sha(canonicalJson(json(sample.file))),approval.visual_review_semantic_sha256);

  // Unknown metadata is not granted an administrative exemption.
  f.project.metadata.renderer_setting = 'must stay bound'; f.write();
  rejected(command('render',f.file),/Approval invalidated/i);
  delete f.project.metadata.renderer_setting; f.write();
  const change = (apply, undo) => {apply();f.write();rejected(command('render',f.file),/Approval invalidated|changed/i);undo();f.write();};
  change(() => {f.project.captions[0].text += ' Changed meaning.';}, () => {f.project.captions[0].text='A synthetic opening.';});
  change(() => {f.project.shots[0].layers[0].x += 1;}, () => {f.project.shots[0].layers[0].x -= 1;});
  change(() => {f.project.sfx[0].gain += .01;}, () => {f.project.sfx[0].gain -= .01;});
  const media = path.join(f.dir,'story-prop.png'), originalMedia = fs.readFileSync(media);
  fs.appendFileSync(media,'technical mutation');
  rejected(command('render',f.file),/Approval invalidated|changed/i); fs.writeFileSync(media,originalMedia);
  const audio = path.join(f.dir,'voice.wav'), originalAudio = fs.readFileSync(audio), changedAudio = Buffer.from(originalAudio);
  changedAudio[changedAudio.length-2] ^= 1; fs.writeFileSync(audio,changedAudio);
  rejected(command('render',f.file),/Approval invalidated|changed/i); fs.writeFileSync(audio,originalAudio);
  const reviewMutation = mutate => {const r=structuredClone(sample.review);mutate(r);save(sample.file,r);rejected(command('render',f.file),/review changed/i);};
  reviewMutation(r => {r.shots[0].checks.sound.status='fail';});
  reviewMutation(r => {r.evidence_sha256='0'.repeat(64);});
  reviewMutation(r => {r.reviewer.method += ' A different claimed method.';});
  reviewMutation(r => {r.baseline_comparisons.reverse();r.full_playback.observations.reverse();});
  sample.write();

  // A same-runtime byte-only approval remains strict; no missing semantic
  // snapshot can safely prove a reserialized legacy file was unchanged.
  const legacy = {...approval}; delete legacy.visual_review_hash_schema; delete legacy.visual_review_semantic_sha256;
  save(approvalFile,legacy); assert.equal(passed(command('render',f.file)).reused,true);
  fs.writeFileSync(sample.file,JSON.stringify(sample.review));
  rejected(command('render',f.file),/review changed/i);
  save(approvalFile,{...approval,visual_review_hash_schema:'unknown-v9'});
  rejected(command('render',f.file),/review changed/i);
  const incomplete={...approval};delete incomplete.visual_review_semantic_sha256;save(approvalFile,incomplete);
  rejected(command('render',f.file),/review changed/i);
  save(approvalFile,approval); cached();
});

for (const style of ['B1','B2','B3']) test(`${style} CLI keeps technical output pending and binds both sample and whole-film reviews`, t => {
  const f = fixture(t,style);
  const validation = passed(command('validate',f.file,'--seconds','.6'));
  assert.equal(validation.status,'technical_only');
  assert.equal(validation.visual_acceptance,'not_reviewed');
  assert.equal(validation.delivery_ready,false);
  const preview = passed(command('preview',f.file,'--seconds','.6'));
  assert.equal(preview.delivery_ready,false);
  assert.equal(preview.reference_review.status,'pending_independent_review');
  assert.ok(fs.existsSync(path.join(f.out,'preview-reference/evidence.json')));
  assert.ok(fs.existsSync(path.join(f.out,'preview-reference/review-template.json')));
  const reportFile = path.join(f.out,'preview-report.json'), originalReport = fs.readFileSync(reportFile);
  const forgedReport = json(reportFile);
  forgedReport.visual_acceptance = 'sample_target_review_passed';
  forgedReport.delivery_ready = true;
  forgedReport.reference_review.status = 'sample_target_review_passed';
  save(reportFile,forgedReport);
  const cached = passed(command('preview',f.file,'--seconds','.6'));
  assert.equal(cached.reused,true);
  assert.equal(cached.delivery_ready,false,'A cached technical report cannot acquire acceptance by editing its status fields.');
  assert.equal(cached.visual_acceptance,'pending_independent_review');
  assert.equal(cached.reference_review.status,'pending_independent_review');
  fs.writeFileSync(reportFile,originalReport);
  rejected(command('approve',f.file,'--note',note),/visual-review|independent/i);
  rejected(command('approve',f.file,'--note',note,'--visual-review',path.join(f.out,'preview-reference/review-template.json')),/unknown|review|independent/i);

  const sample = reviewFor(f,'preview');
  if (style === 'B2') {
    assert.deepEqual(sample.evidence.references.filter(r => r.required_comparison).map(r => r.id).sort(), ['b2-colorful-phone-weather','b2-colorful-sleep']);
    const omittedReference = sample.review.baseline_comparisons.pop(); sample.write();
    rejected(command('approve',f.file,'--note',note,'--visual-review',sample.file),/required.*reference|comparison.*missing/i);
    sample.review.baseline_comparisons.push(omittedReference); sample.write();
  }
  sample.review.reviewer.id = f.project.reference_review.author_id; sample.write();
  rejected(command('approve',f.file,'--note',note,'--visual-review',sample.file),/independent|author/i);
  sample.review.reviewer.id = 'synthetic-independent-reviewer'; sample.write();
  rejected(command('approve',f.file,'--visual-review',sample.file),/note|genuine user approval/i);
  passed(command('approve',f.file,'--note',note,'--visual-review',sample.file));
  const approval = json(path.join(f.out,'approval.json'));
  assert.equal(approval.visual_review_sha256,hashFile(sample.file));
  assert.equal(approval.reference_acceptance.user_acceptance,'not_inferred');

  const originalReview = fs.readFileSync(sample.file);
  sample.review.reviewer.method += ' Changed after approval.'; sample.write();
  rejected(command('render',f.file),/review changed|approve.*again/i);
  fs.writeFileSync(sample.file,originalReview);
  const png = fs.readdirSync(sample.dir).find(name => name.endsWith('.png'));
  assert.ok(png,'Review must retain decoded frame evidence.');
  const image = path.join(sample.dir,png), originalImage = fs.readFileSync(image);
  fs.appendFileSync(image,'synthetic tamper');
  rejected(command('render',f.file),/artifact|evidence|changed|hash|source/i);
  fs.writeFileSync(image,originalImage);

  const film = passed(command('render',f.file));
  assert.equal(film.delivery_ready,false);
  assert.equal(film.reference_review.status,'pending_independent_review');
  rejected(command('accept-visual',f.file,'--review',sample.file),/hash|changed|current|video|evidence/i);
  const full = reviewFor(f,'film');
  assert.equal(full.review.shots.length,2,'The full-film gate includes the body/ending omitted from the sample.');
  const tail = full.review.shots.pop(); full.write();
  rejected(command('accept-visual',f.file,'--review',full.file),/shot|coverage|complete/i);
  full.review.shots.push(tail); full.write();
  const accepted = passed(command('accept-visual',f.file,'--review',full.file));
  assert.equal(accepted.status,'sample_target_review_passed');
  assert.equal(accepted.equivalence,'available_samples_reviewed');
  assert.equal(accepted.user_acceptance,'not_inferred');
  assert.equal(json(path.join(f.out,'film-reference-acceptance.json')).output_sha256,hashFile(path.join(f.out,'film.mp4')));
  const originalFilm = fs.readFileSync(path.join(f.out,'film.mp4'));
  fs.appendFileSync(path.join(f.out,'film.mp4'),'synthetic stale film');
  rejected(command('accept-visual',f.file,'--review',full.file),/Film changed|current reference evidence/i);
  fs.writeFileSync(path.join(f.out,'film.mp4'),originalFilm);
  f.project.shots[1].layers[0].x += 10; f.write();
  rejected(command('accept-visual',f.file,'--review',full.file),/Film changed|current reference evidence/i);
});

for (const [style, effect] of [['B2','color_handdrawn_design'],['B3','silhouette_design']]) test(`${style} limited capability remains an explicit non-equivalent result and cannot waive captions, pacing or sound`, t => {
  const f = fixture(t,style,'limited');
  const preview = passed(command('preview',f.file,'--seconds','.6'));
  assert.equal(preview.delivery_ready,false);
  const sample = reviewFor(f,'preview');
  sample.review.shots[0].checks[effect].status='unmet'; sample.write();
  passed(command('approve',f.file,'--note',note,'--visual-review',sample.file));
  passed(command('render',f.file));
  const full = reviewFor(f,'film');
  full.review.shots.forEach(s => {s.checks[effect].status='unmet';}); full.write();
  for (const key of ['typography_captions','timing_pacing','sound']) {
    full.review.shots[1].checks[key].status='unmet'; full.write();
    rejected(command('accept-visual',f.file,'--review',full.file),/pass|unmet|caption|timing|sound/i);
    full.review.shots[1].checks[key].status='pass';
  }
  full.write();
  const accepted = passed(command('accept-visual',f.file,'--review',full.file));
  assert.equal(accepted.status,'best_effort_limited');
  assert.equal(accepted.equivalence,'not_sample_equivalent');
  assert.equal(accepted.user_acceptance,'not_inferred');
});

test('B2 caption fallback cannot silently restyle covered text or waive actual glyph coverage', t => {
  const f = fixture(t,'B2');
  f.project.captionFont = path.join(ROOT,'assets/fonts/Caveat.ttf'); f.write();
  rejected(command('validate',f.file,'--seconds','.6'),/caption preset/i);
  f.project.caption_override = {kind:'language_fallback',language:'English',reason:'Synthetic necessity regression; the default font already covers these captions.'}; f.write();
  rejected(command('validate',f.file,'--seconds','.6'),/caption preset|missing|glyph|fallback/i);

  // A declared restyle approval tests the protocol branch only, not real consent.
  f.project.caption_override = {reason:'Synthetic explicit-restyle regression only.',user_approval:note}; f.write();
  assert.equal(passed(command('validate',f.file,'--seconds','.6')).delivery_ready,false);

  f.project.caption_override = {kind:'language_fallback',language:'zh-Hans',reason:'Synthetic missing-glyph fixture; this selected replacement is deliberately insufficient.'};
  f.project.captions[0].text = '不要出警'; f.write();
  rejected(command('validate',f.file,'--seconds','.6'),/B2 caption.*lacks glyphs/i);
  f.project.captionSize = 24; f.write();
  rejected(command('validate',f.file,'--seconds','.6'),/caption preset/i);
});

test('missing B1 author/capability information may render a candidate but cannot pass review', t => {
  const f = fixture(t,'B1');
  delete f.project.reference_review; f.write();
  assert.equal(passed(command('preview',f.file,'--seconds','.6')).delivery_ready,false);
  const sample = reviewFor(f,'preview');
  rejected(command('approve',f.file,'--note',note,'--visual-review',sample.file),/author|environment|capability/i);
});
