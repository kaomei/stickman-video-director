import test from 'node:test';
import assert from 'node:assert/strict';
import {planB3Semantics} from '../scripts/b3-semantic-motion.mjs';
import {keyState} from '../scripts/b3-graphics.mjs';

const motion = {role: 'information', reason: 'Synthetic local relationship reveal; not story acceptance.'};
function fixture() {
  const source = {id: 'source', type: 'rect', x: 100, y: 250, w: 60, h: 60};
  const target = {id: 'target', type: 'rect', x: 500, y: 250, w: 60, h: 60};
  const arrow = {id: 'relation', type: 'arrow', x: 160, y: 280, w: 340, motion,
    keys: [{t: .2, progress: 0}, {t: 1.5, progress: 1}]};
  const event = {id: 'link-revealed', cue_index: 0, kind: 'relationship', layer_ids: ['relation'], start: .2, end: 1.8,
    before: 'The two example objects are not connected.', after: 'A complete directed relationship connects the objects.', purpose: 'Reveal the scripted dependency from the source object to the target object.'};
  const graphic = {id: 'relation', role: 'connector', event_id: 'link-revealed', directed: true,
    relation: 'The source example supplies the target example.', source: {layer_id: 'source', x: 60, y: 30}, target: {layer_id: 'target', x: 0, y: 30}};
  const p = {style: 'B3', width: 640, height: 360, fps: 12, duration: 3, rangeEnd: 3,
    captions: [{start: 0, end: 3, text: 'The source supplies the target.'}],
    shots: [{start: 0, end: 3, layers: [source, target, arrow], b3_semantics: {events: [event], graphics: [graphic]}}]};
  return {p, source, target, arrow, event, graphic};
}
const plan = f => planB3Semantics(f.p, {required: true});
const first = f => plan(f).shots[0];

test('B3 candidate missing plans remain pending; strict acceptance requires all submitted shots', () => {
  assert.equal(planB3Semantics({style: 'B2'}), null);
  const f = fixture(); delete f.p.shots[0].b3_semantics;
  assert.equal(planB3Semantics(f.p).status, 'missing_plan');
  assert.throws(() => plan(f), /every submitted B3 shot.*missing shot-0/);
  f.p.shots[0].layers = [{id: 'still', type: 'rect', x: 100, y: 100, w: 60, h: 60}];
  f.p.shots[0].b3_semantics = {events: [], graphics: []};
  assert.equal(plan(f).status, 'planned_not_reviewed', 'Short static beats remain subject to the separate 2.5s inactivity gate');
});

test('B3 progressive relationship has source/target declarations and bounded eligible windows', () => {
  const f = fixture(), result = plan(f), s = result.shots[0];
  assert.equal(result.status, 'planned_not_reviewed');
  assert.deepEqual(s.eligible_motion_ids, ['relation']);
  assert.deepEqual(s.animated_layer_ids, ['relation']);
  assert.ok(s.eligible_motion_windows.every(window => window.id === 'relation' && window.start >= f.event.start && window.end <= f.event.end && window.event_id === f.event.id));
  assert.equal(s.graphics[0].geometry.complete_geometry_observed, true);
  assert.equal(s.graphics[0].review_start, 0);
  assert.equal(s.graphics[0].review_end, 3);
  assert.ok(s.graphics[0].completed_start > .2 && s.graphics[0].completed_start <= 1.5);
  assert.ok(keyState(f.arrow, s.graphics[0].completed_start).progress > .95);
  assert.equal(s.graphics[0].completed_start, s.graphics[0].geometry.completed_start);
  assert.deepEqual(s.graphics[0].source, f.graphic.source);
  assert.equal(s.graphics[0].directed, true);
  assert.match(result.limits.join(' '), /not semantic|not a semantic|not semantic or actual-MP4/);
});

test('B3 graphic review bounds include its own and all ancestor visibility windows', () => {
  const f = fixture(); f.arrow.from = .5; f.arrow.to = 2;
  f.p.shots[0].layers = [{id: 'visible-parent', type: 'group', from: .4, to: 2.2, children: [f.source, f.target, f.arrow]}];
  const graphic = first(f).graphics[0];
  assert.equal(graphic.review_start, .5); assert.equal(graphic.review_end, 2);
  assert.ok(graphic.completed_start >= graphic.review_start && graphic.completed_start < graphic.review_end);
});

test('B3 a static relationship needs no invented motion event and supplies no principal motion', () => {
  const f = fixture(); delete f.arrow.motion; delete f.arrow.keys; delete f.graphic.event_id;
  f.p.shots[0].b3_semantics.events = [];
  const s = first(f); assert.deepEqual(s.events, []); assert.deepEqual(s.eligible_motion_ids, []); assert.deepEqual(s.animated_layer_ids, []);
  assert.equal(s.graphics[0].completed_start, 0);
  f.arrow.keys = [{t: 0, progress: 0}, {t: 1.5, progress: 1}];
  assert.throws(() => plan(f), /animated connector needs its own relationship event_id/);
  delete f.arrow.keys; f.arrow.motion = motion;
  assert.throws(() => plan(f), /animated connector needs its own relationship event_id/);
});

test('B3 undirected lines bind both ends; arrows cannot disguise or reverse their directed form', () => {
  const f = fixture(); f.arrow.type = 'line'; f.arrow.points = [[0, 0], [340, 0]]; f.graphic.directed = false;
  assert.deepEqual(first(f).eligible_motion_ids, ['relation']);
  f.graphic.target.x = 40; assert.throws(() => plan(f), /target endpoint/);
  const arrow = fixture(); arrow.graphic.directed = false; assert.throws(() => plan(arrow), /arrow must be a directed connector/);
  arrow.graphic.directed = true; arrow.graphic.role = 'artwork'; assert.throws(() => plan(arrow), /every arrow is a connector/);
  const reversed = fixture(); [reversed.graphic.source, reversed.graphic.target] = [reversed.graphic.target, reversed.graphic.source];
  assert.throws(() => plan(reversed), /source endpoint/);
});

test('B3 connector objects must exist and be distinct from the stroke and each other', () => {
  for (const mutate of [
    f => { f.graphic.target.layer_id = 'absent-target'; },
    f => { f.graphic.target.layer_id = f.graphic.source.layer_id; },
    f => { f.graphic.source.layer_id = 'relation'; },
  ]) {const f = fixture(); mutate(f); assert.throws(() => plan(f), /missing|distinct/);}
  const f = fixture(); f.p.shots[0].layers = [{id: 'object', type: 'group', children: [f.source, f.target]}, f.arrow];
  f.graphic.source = {layer_id: 'object', x: 160, y: 280};
  assert.throws(() => plan(f), /same nested object/);
});

test('B3 fixed geometry rejects wrong endpoints, arbitrary off-object anchors and configurable tolerances', () => {
  const wrongTip = fixture(); wrongTip.arrow.w = 300; assert.throws(() => plan(wrongTip), /target endpoint/);
  const wrongTail = fixture(); wrongTail.arrow.x = 200; assert.throws(() => plan(wrongTail), /source endpoint/);
  const fakeAnchor = fixture(); fakeAnchor.arrow.w = 300; fakeAnchor.graphic.target.x = -40;
  assert.throws(() => plan(fakeAnchor), /outside its object geometry/);
  fakeAnchor.graphic.tolerance = 1000; assert.throws(() => plan(fakeAnchor), /outside its object geometry/, 'Authored tolerance cannot waive the fixed guard');
  const image = fixture(); image.target.type = 'image'; delete image.target.h;
  assert.throws(() => plan(image), /explicit w\/h/);
});

test('B3 a moving target cannot leave a completed connector behind', () => {
  const f = fixture(); f.target.keys = [{t: 0, x: 500}, {t: 3, x: 600}];
  assert.throws(() => plan(f), /target endpoint.*drifts/);
  f.arrow.keys.push({t: 0, w: 340}, {t: 3, w: 440});
  // Key arrays are authored in increasing order in production projects.
  f.arrow.keys.sort((a, b) => a.t - b.t); f.event.layer_ids.push('target');
  assert.deepEqual(first(f).eligible_motion_ids, ['relation']);
});

test('B3 source/target parent matrices, rotation and scale match the painter', () => {
  const f = fixture(); f.p.shots[0].layers = [{id: 'scene-position', type: 'group', x: 30, y: 15, angle: .2, scaleX: 1.1, scaleY: 1.1, children: [f.source, f.target, f.arrow]}];
  assert.equal(first(f).graphics[0].geometry.complete_geometry_observed, true);
  f.p.shots[0].layers[0].children = [f.source, {id: 'moving-target-parent', type: 'group', keys: [{t: 0, x: 0}, {t: 3, x: 100}], children: [f.target]}, f.arrow];
  assert.throws(() => plan(f), /target endpoint.*drifts/);
});

test('B3 target and its parents must stay visible even during an unfinished reveal', () => {
  const delayed = fixture(); delayed.target.from = 1;
  assert.throws(() => plan(delayed), /target object or ancestor is not visible/);
  const vanished = fixture(); vanished.target.to = 2;
  assert.throws(() => plan(vanished), /target object or ancestor is not visible/);
  const parent = fixture(); parent.p.shots[0].layers = [parent.source, {id: 'target-parent', type: 'group', to: 2, children: [parent.target]}, parent.arrow];
  assert.throws(() => plan(parent), /target object or ancestor is not visible/);
});

test('B3 native portrait catches retained landscape connector coordinates', () => {
  const f = fixture(); f.p.width = 360; f.p.height = 640; f.target.y = 870;
  assert.throws(() => plan(f), /target endpoint/);
  f.source.y = 870; f.arrow.y = 900;
  assert.equal(first(f).graphics[0].geometry.complete_geometry_observed, true);
});

test('B3 checks authored key instants between encoded frames as well as every frame', () => {
  const f = fixture(); f.p.fps = 1;
  f.target.keys = [{t: 0, x: 500}, {t: 1.71, x: 500}, {t: 1.72, x: 550}, {t: 1.73, x: 500}, {t: 3, x: 500}];
  assert.throws(() => plan(f), /target endpoint.*drifts/);
});

test('B3 semantic events need real changed keys, cue overlap and distinct states', () => {
  const mutations = [
    [f => { f.event.after = f.event.before; }, /distinct before\/after/],
    [f => { f.event.purpose = 'animation'; }, /concrete purpose/],
    [f => { f.event.cue_index = 9; }, /cue_index/],
    [f => { f.p.captions[0].end = .1; }, /does not intersect/],
    [f => { f.event.start = -.1; }, /in-shot event/],
    [f => { f.event.layer_ids = ['invented']; }, /actual layers/],
    [f => { delete f.arrow.motion; }, /motion-marked layer/],
    [f => { f.arrow.keys = [{t: .2, progress: .2}, {t: 1.5, progress: .2}]; }, /changed keys/],
    [f => { f.arrow.keys = [{t: .2, alpha: 0}, {t: 1.5, alpha: 1}]; }, /changed keys/],
  ];
  for (const [mutate, expected] of mutations) {const f = fixture(); mutate(f); assert.throws(() => plan(f), expected);}
});

test('B3 all visible standalone strokes and motion paths need a graphic role', () => {
  const f = fixture(); f.p.shots[0].b3_semantics.graphics = [];
  assert.throws(() => plan(f), /explicit.*classification/);
  const path = fixture(); path.p.shots[0].layers.push({id: 'unclassified-path', type: 'path', fill: 'none', stroke: '#fff', commands: [['M', 10, 10], ['L', 30, 30]], motion,
    keys: [{t: 0, x: 0}, {t: 2, x: 100}]});
  path.event.layer_ids.push('unclassified-path');
  assert.throws(() => plan(path), /unclassified-path.*classification/);
  delete path.p.shots[0].layers.at(-1).motion;
  assert.throws(() => plan(path), /unclassified-path.*classification/, 'Actual keyframed paths cannot evade graphic classification by dropping the marker');
});

function strokeFixture(role = 'decoration', kind = 'action') {
  const f = fixture(); f.arrow.type = 'line'; f.arrow.points = [[0, 0], [100, 0]];
  f.graphic = {id: 'relation', role}; f.p.shots[0].b3_semantics.graphics = [f.graphic]; f.event.kind = kind;
  return f;
}
test('B3 decorative/emphasis movement and non-information signal motion supply no principal animation', () => {
  for (const role of ['decoration', 'emphasis', 'signal']) {
    const f = strokeFixture(role); assert.deepEqual(first(f).eligible_motion_ids, []); assert.deepEqual(first(f).eligible_motion_windows, []);
  }
  const signal = strokeFixture('signal', 'signal_state');
  signal.event.before = 'No pulse is registered.'; signal.event.after = 'The first arrival is registered as a pulse.';
  assert.deepEqual(first(signal).eligible_motion_ids, ['relation']);
  const artwork = strokeFixture('artwork'); assert.deepEqual(first(artwork).eligible_motion_ids, ['relation'], 'A real character/prop outline remains allowed');
});

test('B3 a moving group of only decorative lines cannot launder them into an actor', () => {
  const f = strokeFixture(); delete f.arrow.motion; f.arrow.keys = [];
  const group = {id: 'decoration-wrapper', type: 'group', children: [f.arrow], motion, keys: [{t: 0, x: 0}, {t: 3, x: 100}]};
  f.p.shots[0].layers = [group]; f.event.layer_ids = ['decoration-wrapper'];
  assert.deepEqual(first(f).eligible_motion_ids, []);
});

test('B3 static character outline remains legal with no invented animation event', () => {
  const f = strokeFixture('artwork'); delete f.arrow.motion; f.arrow.keys = [];
  f.p.shots[0].b3_semantics.events = [];
  assert.deepEqual(first(f).events, []); assert.deepEqual(first(f).eligible_motion_ids, []);
});

test('B3 unmarked image/shape motion and fades cannot disappear from the event inventory', () => {
  for (const keys of [[{t: 0, x: 700}, {t: 3, x: 800}], [{t: 0, alpha: 0}, {t: 3, alpha: 1}]]) {
    const f = fixture(); f.p.shots[0].layers.push({id: 'unmarked-actor', type: 'rect', x: 700, y: 100, w: 50, h: 50, keys});
    assert.throws(() => plan(f), /animated picture layer unmarked-actor needs an event/);
    f.event.layer_ids.push('unmarked-actor'); assert.ok(first(f).animated_layer_ids.includes('unmarked-actor'));
  }
});

test('B3 explicit non-principal signal/title keyframes remain outside principal animation', () => {
  const f = fixture(); f.p.shots[0].layers.push({id: 'idle-scan', type: 'line', x: 700, y: 100, points: [[0, 0], [50, 20]], keys: [{t: 0, x: 700}, {t: 3, x: 800}]},
    {id: 'title', type: 'text', text: 'EXAMPLE', keys: [{t: 0, x: 0}, {t: 3, x: 30}]});
  f.p.shots[0].b3_semantics.graphics.push({id: 'idle-scan', role: 'signal'});
  assert.deepEqual(first(f).eligible_motion_ids, ['relation']);
});

test('B3 preview scope retains incomplete-event disclosure and ignores unproduced future branches', () => {
  const f = fixture(); f.p.rangeEnd = .6;
  f.p.shots[0].b3_semantics.events.push({id: 'future-event', start: 2, end: 2.8, layer_ids: ['not-produced-yet']});
  f.p.shots[0].b3_semantics.graphics.push({id: 'not-produced-yet', role: 'artwork'});
  const s = first(f); assert.equal(s.events.length, 1); assert.equal(s.events[0].complete, false); assert.equal(s.events[0].reviewed_end, .6);
  assert.ok(s.eligible_motion_windows.every(window => window.end <= .6));
  f.p.rangeEnd = 3; assert.throws(() => plan(f), /concrete purpose|actual layer/);
});

test('B3 supplied valid shots remain available when a later submitted shot lacks its plan', () => {
  const f = fixture(); f.p.duration = f.p.rangeEnd = 6;
  f.p.shots.push({start: 3, end: 6, layers: [{id: 'late', type: 'rect', w: 20, h: 20}]});
  const result = planB3Semantics(f.p); assert.equal(result.status, 'missing_plan'); assert.deepEqual(result.missing_shots, ['shot-1']); assert.equal(result.shots.length, 1);
  assert.throws(() => plan(f), /missing shot-1/);
  f.p.rangeEnd = 3; assert.equal(plan(f).status, 'planned_not_reviewed');
});

test('B3 a complete relationship cannot finish with a permanently partial connector', () => {
  const f = fixture(); f.arrow.keys.at(-1).progress = .8;
  assert.throws(() => plan(f), /no complete drawn connector\/result/);
});

test('B3 paths are fully painted regardless of progress and cannot claim a progress-only animation', () => {
  const f = fixture(); f.arrow.type = 'path'; f.arrow.commands = [['M', 0, 0], ['L', 300, 0]]; f.arrow.progress = .1;
  delete f.arrow.motion; delete f.arrow.keys; delete f.graphic.event_id; f.p.shots[0].b3_semantics.events = [];
  assert.throws(() => plan(f), /target endpoint/, 'A path is already drawn in full even with progress below one');
  f.arrow.commands.at(-1)[1] = 340;
  assert.equal(first(f).graphics[0].completed_start, 0);
  f.arrow.motion = motion; f.arrow.keys = [{t: .2, progress: 0}, {t: 1.5, progress: 1}];
  f.graphic.event_id = f.event.id; f.p.shots[0].b3_semantics.events = [f.event];
  assert.throws(() => plan(f), /actual visible motion-marked layer with changed keys/, 'Unsupported path.progress keys do not produce visible drawing');
});
