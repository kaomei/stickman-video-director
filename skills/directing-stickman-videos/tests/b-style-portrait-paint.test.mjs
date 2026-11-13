import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createCanvas} from '@napi-rs/canvas';
import {painter} from '../scripts/autopilot-render.mjs';
import {checkBStylePortraitPaint} from '../scripts/b-style-portrait-paint.mjs';

// Real painter pixels, deliberately synthetic artwork. No speech, reference
// equivalence, user approval, listening or final delivery is asserted here.
const rect = (id, x, y, w, h, fill = '#dedfdf') => ({id, type: 'rect', x, y, w, h, fill});
function fixture() {
  return {version: 1, style: 'B3', width: 360, height: 640, fps: 12, duration: 3, rangeEnd: 3,
    television: {enabled: false}, captions: [{start: 0, end: 3, text: 'A native portrait scene.'}],
    shots: [{id: 'native-opening', start: 0, end: 3,
      portrait: {intent: 'A native centered interaction with separate breathing room for the caption.',
        background_ids: ['room'], regions: [{id: 'interaction', role: 'contact', layer_ids: ['actor'],
          intent: 'Keep the complete head and reaching hand legible within the native stage.', region: {x: 120, y: 300, w: 900, h: 1000}}]},
      layers: [rect('room', 0, 0, 1280, 2280, '#111316'),
        {id: 'actor', type: 'group', x: 300, y: 500, children: [
          {id: 'head', type: 'ellipse', x: 0, y: 0, w: 150, h: 150, fill: '#dedfdf'},
          rect('body', 50, 140, 50, 340),
          {id: 'hand', type: 'rect', x: 100, y: 180, w: 220, h: 30, fill: '#dedfdf',
            keys: [{t: 0, angle: .3}, {t: 1.5, angle: -.15}, {t: 3, angle: .3}]}]}]}]};
}
const actor = p => p.shots[0].layers[1];
const check = async p => checkBStylePortraitPaint(p, await painter(p));

test('B3 native portrait checks actual leaf ink through parent transforms and preserves restrained TV finish', async () => {
  const p = fixture();
  for (const enabled of [false, true]) {
    p.television.enabled = enabled;
    const result = await check(p);
    assert.equal(result.status, 'bounded_diagnostic_pass');
    assert.deepEqual(result.shots[0].members.map(m => m.id), ['head', 'body', 'hand']);
    assert.ok(result.shots[0].members.every(m => m.observed_samples > 0 && m.minimum_composition_pixels > 0));
    assert.match(result.limits, /not every encoded frame/);
    assert.match(result.limits, /do not prove.*contact/);
  }
});

test('B1/B2 image ink uses the real asset aspect ratio when h is omitted', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b-portrait-paint-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  const canvas = createCanvas(80, 240), ctx = canvas.getContext('2d');
  ctx.fillStyle = '#bf9c51'; ctx.fillRect(0, 0, 80, 240);
  fs.writeFileSync(path.join(dir, 'tall.png'), canvas.toBuffer('image/png'));
  for (const style of ['B1', 'B2']) {
    const p = fixture(); p.style = style; p.base = dir; delete p.television;
    p.shots[0].layers = [{id: 'actor', type: 'image', path: 'tall.png', x: 300, y: 400, w: 180}];
    p.shots[0].portrait.background_ids = [];
    assert.equal((await check(p)).status, 'bounded_diagnostic_pass');
    p.shots[0].layers[0].y = 1000;
    // An assumed square would fit; the real 540-high image does not.
    await assert.rejects(check(p), /outside declared region/);
  }
});

test('landscape has no portrait check while width/height-only portrait conversion is rejected', async () => {
  const landscape = fixture(); landscape.width = 640; landscape.height = 360;
  assert.equal(await checkBStylePortraitPaint(landscape, () => { throw Error('must not paint'); }), null);
  const p = fixture(); delete p.shots[0].portrait;
  await assert.rejects(check(p), /needs shot.portrait.intent/);
});

test('a native declaration cannot hide a small landscape layout outside the declared native region', async () => {
  const p = fixture(); actor(p).y = 80;
  await assert.rejects(check(p), /outside.*(?:region|safe area)/);
});

test('fully off-frame, partially clipped and unsafe principal actions are rejected', async () => {
  for (const [x, error] of [[1500, /no observable ink/], [1200, /frame edge/], [950, /outside.*(?:safe area|region)/]]) {
    const p = fixture(); actor(p).x = x;
    await assert.rejects(check(p), error);
  }
  const transformed = fixture(); actor(transformed).x = 700; actor(transformed).scaleX = 2;
  await assert.rejects(check(transformed), /(?:outside|frame edge)/);
});

test('expanding a declared group catches one completely occluded or never-visible key member', async () => {
  const p = fixture();
  actor(p).children.push(rect('head-cover', -10, -10, 180, 180, '#44484b'));
  await assert.rejects(check(p), /layer head.*completely hidden/);
  const invisible = fixture(); actor(invisible).children[2].alpha = 0;
  await assert.rejects(check(invisible), /layer hand never becomes observable/);
});

test('natural partial occlusion retains a nonzero actual composition contribution', async () => {
  const p = fixture(); actor(p).children.push(rect('partial-cover', -10, -10, 80, 180, '#44484b'));
  const result = await check(p);
  assert.ok(result.shots[0].members.find(m => m.id === 'head').minimum_composition_pixels > 0);
});

function crossingHand() {
  const p = fixture(), children = actor(p).children;
  children[1] = rect('body', 50, 140, 200, 340);
  children[2] = {...rect('hand', -50, 220, 60, 30),
    keys: [{t: 0, x: -50}, {t: 1, x: 100}, {t: 2, x: 100}, {t: 3, x: 300}]};
  return p;
}

test('a same-color hand may briefly cross the body while bounded occlusion evidence remains explicit', async () => {
  const result = await check(crossingHand());
  const hand = result.shots[0].members.find(m => m.id === 'hand');
  assert.ok(hand.observed_samples > 0);
  assert.ok(hand.occluded_samples > 0);
  assert.equal(hand.eligible_samples, hand.observed_samples + hand.occluded_samples);
  assert.equal(hand.minimum_composition_pixels, 0);
  assert.ok(hand.first_visible < 1 && hand.last_visible > 2);
  assert.ok(hand.occlusion_intervals.some(interval => interval.start <= 1 && interval.end >= 2 && interval.sample_count > 1));
  assert.equal(hand.occlusion_intervals.reduce((sum, interval) => sum + interval.sample_count, 0), hand.occluded_samples);
  assert.match(result.limits, /sample times, not verified continuous or exact occlusion boundaries/);
  assert.match(result.limits, /do not prove.*natural acting/);
});

test('a member hidden throughout the submitted prefix cannot borrow later full-film visibility', async () => {
  const p = crossingHand(); p.rangeEnd = 1;
  actor(p).children[2].keys[0].x = 100;
  await assert.rejects(check(p), /layer hand.*completely hidden/);
  p.rangeEnd = 3;
  assert.ok((await check(p)).shots[0].members.find(m => m.id === 'hand').observed_samples > 0);
});

test('real fades and visibility windows are allowed but a fully transparent member never passes', async () => {
  const p = fixture(); actor(p).from = .5; actor(p).to = 2.75;
  actor(p).keys = [{t: 0, alpha: 0}, {t: .5, alpha: 0}, {t: .8, alpha: 1}, {t: 2.5, alpha: 1}, {t: 2.75, alpha: 0}];
  const result = await check(p);
  assert.ok(result.shots[0].members.every(m => m.first_visible > .5 && m.last_visible < 2.75));
  actor(p).keys = []; actor(p).alpha = 0;
  await assert.rejects(check(p), /never becomes observable/);
});

test('a future member is deferred in an opening prefix and must become visible in the full range', async () => {
  const p = fixture(); actor(p).from = 2; actor(p).x = 1500; p.rangeEnd = 1;
  const prefix = await check(p);
  assert.ok(prefix.shots[0].members.every(m => m.observed_samples === 0 && /after the submitted prefix/.test(m.deferred)));
  p.rangeEnd = 3;
  await assert.rejects(check(p), /no observable ink/);
});

test('keyframe-time excursions between quarter-second samples cannot evade the bounded check', async () => {
  const p = fixture();
  actor(p).keys = [{t: 0, x: 300}, {t: .13, x: -500}, {t: .14, x: 300}, {t: 3, x: 300}];
  await assert.rejects(check(p), /(?:no observable ink|frame edge|outside)/);
});
