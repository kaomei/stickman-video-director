import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOT, hashFile, mediaPath} from '../scripts/autopilot-core.mjs';
import {painter} from '../scripts/autopilot-render.mjs';
import {planBStylePortrait, bStyleCaptionLayout} from '../scripts/b-style-portrait.mjs';
import {checkBStylePortraitPaint} from '../scripts/b-style-portrait-paint.mjs';
import {prepareBStyleQuality, checkBStyleMotionPaint} from '../scripts/b-style-quality.mjs';

// Engineering fixtures use the real bundled font and artwork. They establish
// layout and raster bounds only, never sample equivalence or visual approval.
function fixture(style = 'B1') {
  return {version: 1, style, base: ROOT, width: 320, height: 568, fps: 12,
    duration: 2, rangeEnd: 2, grid: false, television: {enabled: false},
    captions: [{start: 0, end: 2, text: 'A clear next step.'}],
    shots: [{id: 'native-opening', start: 0, end: 2,
      portrait: {intent: 'Center the visible idea prop above a separate readable caption band.',
        regions: [{id: 'idea-region', role: 'prop', layer_ids: ['idea'],
          region: {x: 300, y: 400, w: 600, h: 700},
          intent: 'Keep the entire story prop visible within the native phone stage.'}]},
      layers: [{id: 'idea', type: 'image', path: '@b1/idea-bulb-crayon.png',
        x: 400, y: 500, w: 280}]}]};
}
const shot = p => p.shots[0];
const pixels = (draw, p, options) => new Uint8Array(draw(.5, options).getContext('2d').getImageData(0, 0, p.width, p.height).data);

for (const [style, portraitSize, landscapeSize] of [['B1', 64, 34], ['B2', 72, 40], ['B3', 64, 34]]) {
  test(`${style} selects readable native portrait typography and preserves landscape defaults`, () => {
    const p = fixture(style), plan = planBStylePortrait(p), caption = bStyleCaptionLayout(p);
    assert.equal(plan.preset, 'b123-native-portrait-v1');
    assert.equal(caption.font_size, portraitSize);
    assert.deepEqual(plan.caption, caption);
    assert.ok(caption.font_size * p.width / plan.design_width >= 16,
      'The default must be at least 16 CSS px at a 320px viewing width');
    assert.ok(caption.y < plan.safe_area.y + plan.safe_area.h);
    p.width = 640; p.height = 360; delete shot(p).portrait;
    assert.equal(planBStylePortrait(p), null);
    assert.equal(bStyleCaptionLayout(p).font_size, landscapeSize);
  });

  test(`${style} cannot use legacy 34px portrait captions even with a typography approval record`, async () => {
    const p = fixture(style); p.captionSize = 34;
    p.caption_override = {reason: 'Synthetic override regression only, not a real approval.',
      user_approval: 'Synthetic engineering approval record; no creative approval is claimed.'};
    assert.throws(() => planBStylePortrait(p), /caption size.*at least 16px/);
    assert.throws(() => bStyleCaptionLayout(p), /caption size.*at least 16px/);
    await assert.rejects(painter(p), /caption size.*at least 16px/);
  });

  test(`${style} paints visible caption ink and its full treatment inside the phone safe area`, async () => {
    const p = fixture(style), plan = planBStylePortrait(p), draw = await painter(p);
    const full = pixels(draw, p), withoutCaption = pixels(draw, p, {omitIds: ['caption-0']});
    const scale = p.width / plan.design_width, safe = plan.safe_area;
    const bounds = {x0: p.width, y0: p.height, x1: -1, y1: -1};
    let changed = 0, ink = 0;
    for (let y = 0; y < p.height; y++) for (let x = 0; x < p.width; x++) {
      const i = (y * p.width + x) * 4;
      if (!full.subarray(i, i + 4).some((v, channel) => Math.abs(v - withoutCaption[i + channel]) > 3)) continue;
      changed++; bounds.x0 = Math.min(bounds.x0, x); bounds.x1 = Math.max(bounds.x1, x);
      bounds.y0 = Math.min(bounds.y0, y); bounds.y1 = Math.max(bounds.y1, y);
      const rgb = full.subarray(i, i + 3);
      if (style === 'B3' ? rgb.every(v => v > 200) : rgb.every(v => v < 100)) ink++;
    }
    assert.ok(changed > 50, 'The rendered frame must contain a real caption contribution');
    assert.ok(ink > 20, 'A visible paper tile or outline alone cannot satisfy the text-ink check');
    assert.ok(bounds.x0 >= Math.floor(safe.x * scale), JSON.stringify(bounds));
    assert.ok(bounds.y0 >= Math.floor(safe.y * scale), JSON.stringify(bounds));
    assert.ok(bounds.x1 < Math.ceil((safe.x + safe.w) * scale), JSON.stringify(bounds));
    assert.ok(bounds.y1 < Math.ceil((safe.y + safe.h) * scale), JSON.stringify(bounds));
  });

  test(`${style} rejects a long portrait cue instead of squeezing it into one line`, async () => {
    const p = fixture(style);
    p.captions[0].text = 'The important next step must remain clearly readable on a phone. '.repeat(3);
    const draw = await painter(p);
    assert.throws(() => draw(.5), /at most one line.*semantic boundary/);
  });
}

test('a portrait needs authored framing and coverage of every important layer', () => {
  const missing = fixture(); delete shot(missing).portrait;
  assert.throws(() => planBStylePortrait(missing), /needs shot.portrait.intent/);
  const uncovered = fixture();
  shot(uncovered).layers.push({id: 'second-prop', type: 'image', path: '@b1/idea-bulb-crayon.png', x: 700, y: 700, w: 100});
  assert.throws(() => planBStylePortrait(uncovered), /important layer second-prop is not covered/);
});

test('native regions cannot exceed the phone safe stage or overlap the caption band', () => {
  for (const region of [{x: 0, y: 400, w: 600, h: 700}, {x: 300, y: 1600, w: 600, h: 300}]) {
    const p = fixture(); shot(p).portrait.regions[0].region = region;
    assert.throws(() => planBStylePortrait(p), /must fit the portrait safe stage above the caption band/);
  }
});

test('a background exemption cannot conceal a principal motion layer or its moving descendant', () => {
  for (const nested of [false, true]) {
    const p = fixture(), moving = {id: 'moving', type: 'image', path: '@b1/idea-bulb-crayon.png', x: 100, y: 100, w: 100,
      motion: {role: 'prop', reason: 'Synthetic moving prop cannot be exempted as a scene background.'},
      keys: [{t: 0, x: 100}, {t: 2, x: 200}]};
    shot(p).layers.push(nested ? {id: 'room', type: 'group', children: [moving]} : moving);
    shot(p).portrait.background_ids = [nested ? 'room' : 'moving'];
    assert.throws(() => planBStylePortrait(p), /principal motion layer cannot be exempted as background/);
  }
});

test('a background exemption cannot conceal a static descendant of a principal-motion ancestor', () => {
  for (const nested of [false, true]) {
    const p = fixture('B3'), idea = shot(p).layers[0];
    const child = nested ? {id: 'inner', type: 'group', children: [idea]} : idea;
    shot(p).layers = [{id: 'moving-actor', type: 'group', children: [child],
      motion: {role: 'actor', reason: 'The complete nested actor participates in this local movement.'},
      keys: [{t: 0, x: 0}, {t: 2, x: 100}]}];
    shot(p).portrait.regions[0].layer_ids = ['moving-actor'];
    shot(p).portrait.background_ids = [nested ? 'inner' : 'idea'];
    assert.throws(() => planBStylePortrait(p), /principal motion layer cannot be exempted as background/);
  }
});

test('a background-child declaration cannot bypass actual unsafe actor ink while a held prop supplies motion', async () => {
  const p = fixture('B3'); p.duration = p.rangeEnd = 3; p.captions[0].end = 3;
  shot(p).end = 3;
  shot(p).layers = [{id: 'actor-group', type: 'group', x: 100, y: 500,
    motion: {role: 'actor', reason: 'The actor crosses while moving a held prop.'},
    keys: [{t: 0, x: 100}, {t: 3, x: 200}],
    children: [
      {id: 'actor-body', type: 'rect', x: 0, y: -480, w: 80, h: 200, fill: '#eee'},
      {id: 'held-prop', type: 'rect', x: 300, y: 200, w: 100, h: 100, fill: '#eee'},
    ]}];
  shot(p).portrait.regions = [{id: 'action', role: 'actor', layer_ids: ['actor-group'],
    region: {x: 200, y: 650, w: 500, h: 500},
    intent: 'The complete actor and held prop must fit within the native action region.'}];
  p.motion_intervals = prepareBStyleQuality(p, {root: ROOT, hashFile, mediaPath});
  const draw = await painter(p);
  assert.ok((await checkBStyleMotionPaint(p, draw)).windows.length > 0,
    'The held prop supplies genuine motion, so the native ink check must independently catch the unsafe actor');
  await assert.rejects(checkBStylePortraitPaint(p, draw), /layer actor-body.*outside.*safe area/);

  // Before the fix this declaration hid the unsafe actor from the portrait
  // diagnostic while the real motion checker and remaining prop both passed.
  shot(p).portrait.background_ids = ['actor-body'];
  assert.throws(() => planBStylePortrait(p), /principal motion layer cannot be exempted as background/);
  await assert.rejects(checkBStylePortraitPaint(p, draw), /principal motion layer cannot be exempted as background/);
});

test('a legitimate static background group remains exempt beside a principal actor', () => {
  const p = fixture('B3');
  shot(p).layers.push({id: 'room', type: 'group', children: [
    {id: 'wall', type: 'rect', x: 0, y: 0, w: 1280, h: 2280, fill: '#111316'},
  ]});
  shot(p).portrait.background_ids = ['room'];
  const plan = planBStylePortrait(p);
  assert.deepEqual(plan.shots[0].background_ids, ['room']);
  assert.deepEqual(plan.shots[0].regions[0].layer_ids, ['idea']);
});

test('declaring a nested group covers its real descendants', () => {
  const p = fixture(), idea = shot(p).layers[0];
  shot(p).layers = [{id: 'outer', type: 'group', x: 100, y: 100,
    children: [{id: 'inner', type: 'group', children: [idea]}]}];
  shot(p).portrait.regions[0].layer_ids = ['outer'];
  const plan = planBStylePortrait(p);
  assert.deepEqual(plan.shots[0].regions[0].layer_ids, ['outer']);
  assert.equal(plan.shots[0].regions[0].role, 'prop');
});
