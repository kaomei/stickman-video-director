import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {ROOT, FFMPEG, run, save, loadProject, groupWords, hashFile, probe, designPlane, fontPaths} from '../scripts/autopilot-core.mjs';
import {keyState, render, painter} from '../scripts/autopilot-render.mjs';
import {writeSyntheticReferenceReview} from './helpers/reference-review.mjs';

const cli = path.join(ROOT, 'scripts/autopilot.mjs');
const command = args => spawnSync(process.execPath, [cli, ...args], {encoding: 'utf8', timeout: 120000});
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stickman-runtime-test-'));
  // Each test owns this exact temporary directory, never a user project.
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  run(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=310:duration=0.85', '-y', path.join(dir, 'voice.wav')]);
  const project = {version: 1, style: 'B1', width: 640, height: 360, fps: 12, voice: {path: 'voice.wav'}, captions: [{start: 0.1, end: 0.7, text: 'Offline test.'}], shots: [{start: 0, end: 0.4, layers: [{type: 'text', text: 'A GOOD IDEA', x: 80, y: 110, size: 60, bold: true}, {type: 'image', path: '@b1/idea-bulb-crayon.png', x: 400, y: 280, w: 180, keys: [{t: 0, x: 400}, {t: 0.3, x: 450}]}]}, {start: 0.4, end: 0.85, layers: [{type: 'pose', pose: 1, x: 650, y: 40, w: 400}, {type: 'text', text: 'BECOMES A VIDEO.', x: 60, y: 200, w: 550, size: 54}]}], sfx: [{time: 0.2, kind: 'tap', gain: 0.02}]};
  // Synthetic low-level bed for offline plumbing only, not a production sound choice.
  project.reference_review = {author_id: 'synthetic-runtime-author', capability: {mode: 'sample_target', environment: 'Local synthetic regression fixture', limitations: []}};
  project.ambience = [{path: 'voice.wav', start: 0, end: .85, gain: .01}];
  const file = path.join(dir, 'project.json'); save(file, project);
  return {dir, project, file};
}
test('doctor checks local dependencies without network or revealing keys', () => {
  const r = command(['doctor']); assert.equal(r.status, 0, r.stderr); const data = JSON.parse(r.stdout); assert.equal(data.network_checked, false); assert.ok(data.checks.fonts);
});
test('aligned words are grouped without invented word timings', () => {
  const words = {words: [{start: 0.2, end: 0.5, word: 'Hello'}, {start: 0.6, end: 1, word: 'world.'}, {start: 1.7, end: 2, word: 'Next.'}]};
  assert.deepEqual(groupWords(words, 0.1), [{start: 0.30000000000000004, end: 1.1, text: 'Hello world.'}, {start: 1.8, end: 2.1, text: 'Next.'}]);
  assert.throws(() => groupWords({words: [{start: 1, end: 0.5, word: 'bad'}]}));
});
test('keyframes interpolate locally and hold before/after endpoints', () => {
  const l = {keys: [{t: 0, x: 10}, {t: 1, x: 30}]}; assert.equal(keyState(l, 0.5).x, 20); assert.equal(keyState(l, 2).x, 30);
});
test('B2 has paper captions/no B1 grid and rejects the B1 character atlas', async t => {
  const f = fixture(t); f.project.style = 'B2'; f.project.grid = true;
  save(f.file, f.project); assert.throws(() => loadProject(f.file), /B1 pose atlas/);
  f.project.shots[1].layers = [{type: 'text', text: 'NEW STORY', x: 80, y: 110}];
  save(f.file, f.project); const p = loadProject(f.file), draw = await painter(p);
  const pixels = draw(0.2).getContext('2d');
  const pixel = (x,y) => [...pixels.getImageData(x,y,1,1).data];
  assert.deepEqual(pixel(5,5), [244,240,229,255]);
  // B1 grid columns/rows must not leak into the B2 background, even with grid:true.
  assert.deepEqual(pixel(16,35), pixel(17,35));
  assert.deepEqual(pixel(16,35), pixel(5,5));
  const band = pixel(320,319);
  assert.ok(band[0] > 246 && band[1] > 242, 'Ivory paper label must be visible behind dark text');
  const region = pixels.getImageData(245,320,150,22).data;
  assert.ok(region.some((v,i) => i%4===0 && v<100), 'Caption must contain dark ink');
});
test('B2 style switch invalidates B1 shot caches and retains the original voice', async t => {
  const f = fixture(t);
  f.project.shots.forEach(s => s.layers = [{type:'text',text:'LOCAL STORY',x:100,y:160}]);
  save(f.file,f.project); const before = hashFile(path.join(f.dir,'voice.wav'));
  const b1 = await render(loadProject(f.file));
  f.project.style='B2'; f.project.sfx.push({time:.3,kind:'jingle',gain:.02});save(f.file,f.project);
  const b2 = await render(loadProject(f.file),{replace:true});
  assert.equal(b2.cache_hits,0);assert.notEqual(b1.output_sha256,b2.output_sha256);
  assert.equal(b2.original_voice_sha256,before);assert.equal(hashFile(path.join(f.dir,'voice.wav')),before);
  assert.equal(b2.frames,b1.frames);assert.equal(b2.full_decode,'pass');
});
test('portrait uses a taller design plane without stretching local shapes', async t => {
  const f = fixture(t); f.project.width = 360; f.project.height = 640; f.project.grid = false;
  f.project.shots[0].layers = [{id: 'square', type: 'line', points: [[0, 0], [200, 0], [200, 200], [0, 200], [0, 0]], x: 100, y: 200, lineWidth: 4}];
  save(f.file, f.project); assert.throws(() => loadProject(f.file, {seconds: .4}), /shot.portrait.intent/);
  f.project.shots[0].portrait = {intent: 'A complete square remains inside the native phone stage without stretching.', regions: [{id: 'square-region', role: 'information', layer_ids: ['square'], region: {x: 90, y: 190, w: 220, h: 220}, intent: 'Keep all four equal sides visible so uniform output scaling can be measured.'}]};
  save(f.file, f.project); const p = loadProject(f.file, {seconds: .4}), plane = designPlane(p);
  assert.equal(plane.width, 1280); assert.ok(plane.height > 2200);
  const draw = await painter(p), pixels = draw(0.02).getContext('2d').getImageData(0, 0, 360, 640).data;
  let x0 = 360, y0 = 640, x1 = 0, y1 = 0;
  for (let y = 0; y < 180; y++) for (let x = 0; x < 160; x++) if (pixels[(y * 360 + x) * 4] < 100) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  assert.ok(x1 > x0); assert.ok(Math.abs((x1 - x0) - (y1 - y0)) <= 1, 'A square must stay square in portrait');
});
test('B1 portrait reuses the selected handwritten font while landscape and B2/B3 keep their caption families', async t => {
  const f=fixture(t),noto=path.join(ROOT,'assets/fonts/NotoSans.ttf'),caveat=path.join(ROOT,'assets/fonts/Caveat.ttf');
  const portrait={...f.project,width:360,height:640,base:f.dir};
  assert.equal(fontPaths(portrait).caption,fontPaths(portrait).hand);
  if(!process.env.AUTOPILOT_FONT)assert.equal(fontPaths(portrait).caption,caveat);
  portrait.font=noto;assert.equal(fontPaths(portrait).caption,noto,'A supplied handwritten/scene font carries through to B1 portrait captions');
  portrait.captionFont=caveat;assert.equal(fontPaths(portrait).caption,caveat,'Explicit captionFont retains precedence');
  delete portrait.captionFont;
  for(const style of ['B2','B3'])assert.equal(fontPaths({...portrait,style,font:caveat}).caption,noto);
  assert.equal(fontPaths({...portrait,width:640,height:360,font:caveat}).caption,noto,'B1 landscape preset remains unchanged');
  Object.assign(f.project,{width:360,height:640,font:caveat});
  f.project.shots[0].layers=[{id:'native-line',type:'line',points:[[0,0],[100,0]],x:300,y:500}];
  f.project.shots[0].portrait={intent:'Keep the synthetic short line visible in the native portrait stage.',regions:[{id:'native-line-region',role:'information',layer_ids:['native-line'],region:{x:280,y:480,w:140,h:50},intent:'Keep the entire synthetic line above the portrait caption band.'}]};
  save(f.file,f.project);const p=loadProject(f.file,{seconds:.4});
  for(const extension of ['json','mp4','jpg'])assert.ok(p.inputs.some(i=>i.path===path.join(ROOT,'assets/b1/portrait-approved-2026-11-13.'+extension)),'Native approved portrait assets enter the render fingerprint');
  assert.equal(fontPaths(p).caption,caveat);assert.doesNotThrow(()=>fontPaths(p));
  f.project.captionFont=noto;save(f.file,f.project);assert.throws(()=>loadProject(f.file,{seconds:.4}),/selected handwritten portrait font/);
  f.project.caption_override={reason:'Synthetic explicit typography override regression; not an aesthetic claim.',user_approval:'Synthetic protocol approval only, not actual user acceptance.'};save(f.file,f.project);
  assert.equal(fontPaths(loadProject(f.file,{seconds:.4})).caption,noto);
});
test('validation rejects speech stretching, external paths and timeline gaps', t => {
  const f = fixture(t); assert.ok(loadProject(f.file).voiceDuration > 0.8);
  f.project.voice.speed = 0.7; save(f.file, f.project); assert.throws(() => loadProject(f.file), /speech speed/); delete f.project.voice.speed;
  f.project.voice.path = 'https://example.com/voice.wav'; save(f.file, f.project); assert.throws(() => loadProject(f.file), /local path/); f.project.voice.path = 'voice.wav';
  f.project.shots[1].start = 0.45; save(f.file, f.project); assert.throws(() => loadProject(f.file), /gap\/overlap/);
});
test('render is resumable, produces captioned A/V and requires exact preview approval', async t => {
  const f = fixture(t), source = hashFile(path.join(f.dir, 'voice.wav'));
  let r = command(['render', f.file]); assert.notEqual(r.status, 0); assert.match(r.stderr, /user-approved/);
  const p = loadProject(f.file), first = await render(p), second = await render(p, {replace: true});
  assert.equal(second.cache_hits, 2); assert.equal(first.frames, Math.ceil(0.85 * 12)); assert.equal(hashFile(path.join(f.dir, 'voice.wav')), source);
  const info = probe(first.output); assert.ok(info.streams.some(s => s.codec_type === 'audio')); assert.ok(info.streams.some(s => s.codec_type === 'video')); assert.equal(Number(info.streams.find(s => s.codec_type === 'video').nb_frames), first.frames);
  assert.ok(fs.existsSync(path.join(f.dir, 'output/preview.srt'))); assert.ok(fs.existsSync(path.join(f.dir, 'output/preview-contact-sheet.png')));
  const reportFile = path.join(f.dir, 'output/preview-report.json');
  save(reportFile, {...second, delivery_ready: true, visual_acceptance: 'forged_pass', reference_review: {...second.reference_review, status: 'forged_pass'}});
  const cached = await render(p), persisted = JSON.parse(fs.readFileSync(reportFile));
  assert.equal(cached.reused, true); assert.equal(persisted.delivery_ready, false); assert.equal(persisted.visual_acceptance, 'pending_independent_review'); assert.equal(persisted.reference_review.status, 'pending_independent_review');
  r = command(['approve', f.file, '--visual-review', writeSyntheticReferenceReview(f.dir), '--note', 'Synthetic engineering fixture approval only; not a real user video']); assert.equal(r.status, 0, r.stderr);
  r = command(['render', f.file]); assert.equal(r.status, 0, r.stderr);
  f.project.shots[0].layers[0].text = 'CHANGED'; save(f.file, f.project);
  r = command(['render', f.file]); assert.notEqual(r.status, 0); assert.match(r.stderr, /invalidated/);
});
test('caption overflow fails rather than silently clipping', async t => {
  const f = fixture(t); f.project.captions[0].text = 'A very long caption phrase. '.repeat(8); save(f.file, f.project);
  const r = command(['validate', f.file]); assert.notEqual(r.status, 0); assert.match(r.stderr, /one line/);
});
test('B1/B2/B3 reject uncovered caption and scene glyphs before an OS font fallback can hide the change', async t => {
  const f = fixture(t);
  f.project.shots.forEach(s => s.layers = [{type:'text',text:'LOCAL SCENE',x:80,y:110}]);
  for (const style of ['B1','B2','B3']) {
    f.project.style = style;
    f.project.captions[0].text = '不要出警'; save(f.file,f.project);
    await assert.rejects(painter(loadProject(f.file)), new RegExp(`${style} caption.*lacks glyphs`));
    f.project.captions[0].text = 'A readable phrase.';
    f.project.shots[0].layers[0].text = '不要出警'; save(f.file,f.project);
    await assert.rejects(painter(loadProject(f.file)), new RegExp(`${style} text.*lacks glyphs`));
    f.project.shots[0].layers[0].text = 'LOCAL SCENE';
  }
});
test('B captions reject two-line wrapping and explicit breaks across styles', async t => {
  const f = fixture(t);
  f.project.shots.forEach(s => s.layers = [{type: 'text', text: 'LOCAL SCENE', x: 80, y: 110}]);
  for (const style of ['B1', 'B2', 'B3']) {
    f.project.style = style;
    f.project.captions[0].text = 'One coherent phrase.';
    save(f.file, f.project);
    const draw = await painter(loadProject(f.file));
    assert.doesNotThrow(() => draw(0.2));
    for (const text of ['ONE CHOICE LEADS TO ANOTHER '.repeat(3), 'First line\nSecond line']) {
      f.project.captions[0].text = text;
      save(f.file, f.project);
      const invalid = await painter(loadProject(f.file));
      assert.throws(() => invalid(0.2), /one line/, `${style} must reject multi-line subtitles`);
    }
  }
});
test('B accepts independent timing/scene text but requires narration and subtitles', t => {
  const f = fixture(t); f.project.grid = true;
  f.project.shots[0].layers = [{type: 'text', text: 'VISIBLE WORDS', x: 80, y: 110, size: 60, color: '#192123'}];
  save(f.file, f.project);
  assert.equal(loadProject(f.file).duration, 0.85);
  const original = structuredClone(f.project);
  delete f.project.voice; save(f.file, f.project); assert.throws(() => loadProject(f.file), /Voice supports/);
  f.project = structuredClone(original); f.project.captions = []; save(f.file, f.project); assert.throws(() => loadProject(f.file), /Timed captions required/);
});
test('sample validation/rendering/approval do not require unproduced later media', t => {
  const f = fixture(t);
  f.project.shots[1].layers = [{type: 'image', path: 'later.png', x: 80, y: 110, w: 100}];
  save(f.file, f.project);
  let r = command(['validate', f.file, '--seconds', '0.4']); assert.equal(r.status, 0, r.stderr);
  r = command(['preview', f.file, '--seconds', '0.4']); assert.equal(r.status, 0, r.stderr);
  r = command(['approve', f.file, '--visual-review', writeSyntheticReferenceReview(f.dir), '--note', 'Synthetic test approval only; not user production.']); assert.equal(r.status, 0, r.stderr);
  r = command(['render', f.file]); assert.notEqual(r.status, 0); assert.match(r.stderr, /later\.png/);
  fs.copyFileSync(path.join(ROOT, 'assets/b1/calendar-crayon.png'), path.join(f.dir, 'later.png'));
  r = command(['render', f.file]); assert.equal(r.status, 0, r.stderr);
  const report = JSON.parse(fs.readFileSync(path.join(f.dir, 'output/film-report.json')));
  assert.equal(report.cache_hits, 1, 'Completed tail must reuse the unchanged first shot');
});
test('sample can precede unplanned later shots, while full coverage stays mandatory', t => {
  const f = fixture(t); f.project.shots.pop(); save(f.file, f.project);
  assert.equal(loadProject(f.file, {seconds: 0.4}).shots.length, 1);
  assert.throws(() => loadProject(f.file), /Shots end/);
  assert.throws(() => loadProject(f.file, {seconds: 0.6}), /preview range/);
  f.project.captions = [{start: 0.5, end: 0.7, text: 'Too late.'}]; save(f.file, f.project);
  assert.throws(() => loadProject(f.file, {seconds: 0.4}), /Timed captions required in the preview range/);
});
test('a layer appearing only after the sample does not need its media yet', t => {
  const f = fixture(t);
  f.project.shots = [{start: 0, end: 0.85, layers: [{type: 'text', text: 'OPENING', x: 80, y: 110, size: 60}, {type: 'image', path: 'later.png', from: 0.5, x: 80, y: 110, w: 100}]}];
  save(f.file, f.project);
  let r = command(['preview', f.file, '--seconds', '0.4']); assert.equal(r.status, 0, r.stderr);
  f.project.shots[0].layers[1].from = 0.3; save(f.file, f.project);
  r = command(['preview', f.file, '--seconds', '0.4', '--replace']); assert.notEqual(r.status, 0); assert.match(r.stderr, /later\.png/);
});
test('tail edits preserve sample approval and invalidate only dependent shot caches', t => {
  const f = fixture(t), later = path.join(f.dir, 'later.png');
  fs.copyFileSync(path.join(ROOT, 'assets/b1/calendar-crayon.png'), later);
  f.project.captions = [{start: 0.05, end: 0.3, text: 'Opening.'}, {start: 0.5, end: 0.8, text: 'Later.'}];
  f.project.shots[1].layers = [{type: 'image', path: 'later.png', x: 80, y: 110, w: 100}];
  save(f.file, f.project);
  let r = command(['preview', f.file, '--seconds', '0.4']); assert.equal(r.status, 0, r.stderr);
  r = command(['approve', f.file, '--visual-review', writeSyntheticReferenceReview(f.dir), '--note', 'Synthetic test approval only; not user production.']); assert.equal(r.status, 0, r.stderr);
  r = command(['render', f.file]); assert.equal(r.status, 0, r.stderr);
  const sample = hashFile(path.join(f.dir, 'output/preview.mp4'));
  const approval = hashFile(path.join(f.dir, 'output/approval.json'));
  fs.copyFileSync(path.join(ROOT, 'assets/b1/idea-bulb-crayon.png'), later);
  f.project.captions[1].text = 'Revised later.';
  f.project.shots[1].layers[0].x = 100;
  f.project.sfx.push({time: 0.6, kind: 'pop', gain: 0.02});
  save(f.file, f.project);
  r = command(['preview', f.file, '--seconds', '0.4']); assert.equal(r.status, 0, r.stderr); assert.equal(JSON.parse(r.stdout).reused, true);
  r = command(['render', f.file, '--replace']); assert.equal(r.status, 0, r.stderr);
  const report = JSON.parse(fs.readFileSync(path.join(f.dir, 'output/film-report.json')));
  assert.equal(report.cache_hits, 1);
  assert.equal(hashFile(path.join(f.dir, 'output/preview.mp4')), sample);
  assert.equal(hashFile(path.join(f.dir, 'output/approval.json')), approval);
});
test('reviewed content and global settings still invalidate sample approval', t => {
  const f = fixture(t);
  let r = command(['preview', f.file, '--seconds', '0.4']); assert.equal(r.status, 0, r.stderr);
  r = command(['approve', f.file, '--visual-review', writeSyntheticReferenceReview(f.dir), '--note', 'Synthetic test approval only; not user production.']); assert.equal(r.status, 0, r.stderr);
  const original = structuredClone(f.project);
  for (const mutate of [p => p.shots[0].layers[0].text = 'CHANGED', p => p.grid = false, p => p.captionSize = 40, p => p.captions[0].text = 'Changed.', p => p.sfx[0].gain = 0.03, p => p.width = 800]) {
    const changed = structuredClone(original); mutate(changed);
    if (changed.captionSize) changed.caption_override = {reason: 'Synthetic approval fingerprint test', user_approval: 'Engineering fixture only, not a creative approval'};
    save(f.file, changed);
    r = command(['render', f.file]); assert.notEqual(r.status, 0); assert.match(r.stderr, /invalidated/);
  }
  save(f.file, original);
  run(FFMPEG, ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=720:duration=0.85', '-y', path.join(f.dir, 'voice.wav')]);
  r = command(['render', f.file]); assert.notEqual(r.status, 0); assert.match(r.stderr, /invalidated/);
});
test('approval verifies actual preview bytes and never infers approval of legacy reports', t => {
  const f = fixture(t);
  let r = command(['preview', f.file, '--seconds', '0.4']); assert.equal(r.status, 0, r.stderr);
  const reportFile = path.join(f.dir, 'output/preview-report.json'), report = JSON.parse(fs.readFileSync(reportFile));
  const old = {...report}; delete old.preview_seconds; save(reportFile, old);
  r = command(['approve', f.file, '--note', 'Synthetic test only']); assert.notEqual(r.status, 0); assert.match(r.stderr, /Preview changed/);
  save(reportFile, report); fs.appendFileSync(report.output, 'synthetic tamper');
  r = command(['approve', f.file, '--note', 'Synthetic test only']); assert.notEqual(r.status, 0); assert.match(r.stderr, /Preview changed/);
});
test('output symlink cannot redirect writes to another directory', async t => {
  const f = fixture(t); fs.symlinkSync(os.tmpdir(), path.join(f.dir, 'output'), 'dir'); await assert.rejects(render(loadProject(f.file)), /real project-local/);
});
test('nested cache symlink cannot redirect renderer-owned writes', async t => {
  const f = fixture(t), external = path.join(f.dir, 'keep');
  fs.mkdirSync(external); fs.mkdirSync(path.join(f.dir, 'output'));
  fs.writeFileSync(path.join(external, 'sentinel'), 'unchanged');
  fs.symlinkSync(external, path.join(f.dir, 'output/cache'), 'dir');
  await assert.rejects(render(loadProject(f.file)), /must not contain symlinks/);
  assert.equal(fs.readFileSync(path.join(external, 'sentinel'), 'utf8'), 'unchanged');
  assert.deepEqual(fs.readdirSync(external), ['sentinel']);
});
test('media adapter cannot generate without network opt-in', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/gemini-media.mjs'), 'speech'], {encoding: 'utf8'}); assert.notEqual(r.status, 0); assert.match(r.stderr, /Network disabled/);
});
test('media adapter rejects extra speech direction before credentials or network', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/gemini-media.mjs'), 'speech', '--direction', 'old-voice-direction.txt', '--allow-network'], {encoding: 'utf8', env: {...process.env, GEMINI_API_KEY: ''}});
  assert.notEqual(r.status, 0); assert.match(r.stderr, /selected named voice.*remove --direction/);
});
test('media adapter sends only exact narration and the selected named voice', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stickman-speech-request-test-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  const text = 'Write. Edit. Publish. Refresh.', file = path.join(dir, 'narration.txt');
  fs.writeFileSync(file, text);
  const adapter = path.join(ROOT, 'scripts/gemini-media.mjs');
  const argv = [process.execPath, adapter, 'speech', '--text', file, '--output', path.join(dir, 'narration.wav'), '--model', 'offline-tts', '--voice', 'Bodi', '--allow-network'];
  const runner = `
    import assert from 'node:assert/strict';
    process.argv = ${JSON.stringify(argv)};
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/offline-tts:generateContent');
      assert.deepEqual(JSON.parse(options.body), {
        contents: [{role: 'user', parts: [{text: ${JSON.stringify(text)}}]}],
        generationConfig: {responseModalities: ['AUDIO'], speechConfig: {voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Bodi'}}}}
      });
      return {ok: false, status: 418};
    };
    await import(${JSON.stringify(pathToFileURL(adapter).href)});
  `;
  const r = spawnSync(process.execPath, ['--input-type=module', '--eval', runner], {encoding: 'utf8', env: {...process.env, GEMINI_API_KEY: 'offline-test-only-not-a-real-key'}, timeout: 10000});
  assert.equal(r.status, 1); assert.match(r.stderr, /Provider HTTP 418/);
  assert.ok(!fs.existsSync(path.join(dir, 'narration.wav')));
});
