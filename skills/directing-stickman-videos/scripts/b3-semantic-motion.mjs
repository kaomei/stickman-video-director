// B3 production declarations and connector geometry are diagnostics, not a
// semantic, visible-ink or encoded-MP4 acceptance oracle.
import {keyState} from './b3-graphics.mjs';
import {bStyleGeometryAt, bStyleTransformPoint} from './b-style-motion-geometry.mjs';

const EPS = 1e-7, ANCHOR_TOLERANCE = 16;
const EVENT_KINDS = new Set(['action', 'state_change', 'relationship', 'signal_state']);
const GRAPHIC_ROLES = new Set(['connector', 'emphasis', 'signal', 'artwork', 'decoration']);
const DELTAS = {x: 2, y: 2, angle: .02, progress: .02, scaleX: .02, scaleY: .02, w: 2};
const GENERIC = /^(?:pass|passed|ok|okay|good|fine|checked|done|n\/?a|unknown|none|animate|animation|motion|move|movement|effect|decoration|通过|正常|已检查|合格|无|没有|动画|运动|移动|动效|装饰|让画面动起来)[.!。！\s]*$/iu;
const LIMITS = [
  'Production declarations and finite geometric/keyframe checks are not semantic or actual-MP4 acceptance.',
  'A connector anchor inside an authored artwork box does not establish the correct real-world object, visible raster ink, alpha visibility after compositing, occlusion, or a truthful relationship.',
  'Every encoded frame plus authored key/visibility boundaries is checked; source/target alignment uses a fixed 16-design-unit tolerance. Bounds for paths/groups are conservative, and images used as connector objects require explicit width and height.',
  'Decoration, emphasis, captions, camera movement and television finish cannot supply principal-picture animation. Signal motion is eligible only within a declared signal_state event with changed information.',
  'Actual before/intermediate/after/result, useful motion, correct targets, causal meaning, readability and final visibility still require independent continuous MP4 review.',
];
const fail = message => { throw Error('B3 semantics: ' + message); };
const need = (condition, message) => { if (!condition) fail(message); };
const text = value => typeof value === 'string' && !!value.trim();
const concrete = value => text(value) && !GENERIC.test(value.trim());
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const distinct = items => Array.isArray(items) && new Set(items).size === items.length;
const clone = value => JSON.parse(JSON.stringify(value));

function* tree(layers, ancestors = []) {
  for (const layer of layers || []) {
    yield {layer, ancestors};
    if (layer.type === 'group') yield* tree(layer.children, [...ancestors, layer]);
  }
}
function visible(entry, relative, {ink = false} = {}) {
  return [...entry.ancestors, entry.layer].every(layer => {
    const state = keyState(layer, relative);
    return relative >= (layer.from ?? 0) - EPS && relative < (layer.to ?? Infinity) &&
      (state.alpha ?? 1) > 0 && (!ink || !['arrow', 'line', 'underline'].includes(layer.type) || (state.progress ?? 1) > 0);
  });
}
function timesFor(shot, end, fps, entries) {
  const duration = end - shot.start, times = new Set([0, Math.max(0, duration - EPS)]);
  for (let frame = Math.ceil(shot.start * fps - EPS); frame / fps < end - EPS; frame++)
    if (frame / fps >= shot.start - EPS) times.add(Math.max(0, frame / fps - shot.start));
  for (const {layer, ancestors} of entries) for (const item of [...ancestors, layer]) {
    for (const time of [...(item.keys || []).map(key => key.t), item.from, item.to]) {
      if (!Number.isFinite(time)) continue;
      for (const candidate of [time - EPS, time, time + EPS]) if (candidate >= 0 && candidate < duration - EPS / 2) times.add(candidate);
    }
  }
  return [...times].sort((a, b) => a - b);
}
function changes(entry, shot, start, end, {includeAlpha = false} = {}) {
  const intervals = [];
  for (const [property, delta] of Object.entries(includeAlpha ? {...DELTAS, alpha: .02} : DELTAS)) {
    // The painter reveals only these stroke types. Arbitrary path commands are
    // painted in full, and path/line/group width does not alter their geometry.
    if (property === 'progress' && !['arrow', 'line', 'underline'].includes(entry.layer.type)) continue;
    if (property === 'w' && ['path', 'line', 'group'].includes(entry.layer.type)) continue;
    const keys = (entry.layer.keys || []).filter(key => Number.isFinite(key[property]));
    for (let index = 1; index < keys.length; index++) {
      const from = Math.max(start, shot.start + keys[index - 1].t, ...[...entry.ancestors, entry.layer].map(layer => shot.start + (layer.from ?? 0)));
      const to = Math.min(end, shot.start + keys[index].t, ...[...entry.ancestors, entry.layer].map(layer => shot.start + (layer.to ?? Infinity)));
      if (to <= from + EPS || !visible(entry, (from + to) / 2 - shot.start)) continue;
      const a = keyState(entry.layer, from - shot.start)[property], b = keyState(entry.layer, to - shot.start)[property];
      if (Number.isFinite(a) && Number.isFinite(b) && Math.abs(b - a) + EPS >= delta) intervals.push({start: from, end: to});
    }
  }
  return intervals.filter((item, index, all) => all.findIndex(other => Math.abs(item.start - other.start) < EPS && Math.abs(item.end - other.end) < EPS) === index);
}
function contains(event, entry) {
  return event.layer_ids.some(id => id === entry.layer.id || entry.ancestors.some(layer => layer.id === id));
}
function realDimensions(entry, label) {
  for (const {layer} of tree([entry.layer])) if (layer.type === 'image')
    need(Number.isFinite(layer.w) && layer.w > 0 && Number.isFinite(layer.h) && layer.h > 0,
      label + ' image connector objects require explicit w/h; an assumed square is not actual image geometry');
}
function anchorAt(anchor, entry, relative, plane, label) {
  need(visible(entry, relative), label + ' object or ancestor is not visible');
  const geometry = bStyleGeometryAt(entry.layer, entry.ancestors, relative), box = geometry.local_bounds;
  need(box && [box.minX, box.minY, box.maxX, box.maxY].every(Number.isFinite), label + ' needs actual drawable geometry; use a group with a real shape for text labels');
  const point = bStyleTransformPoint([anchor.x, anchor.y], geometry.matrix);
  const clamped = bStyleTransformPoint([Math.max(box.minX, Math.min(box.maxX, anchor.x)), Math.max(box.minY, Math.min(box.maxY, anchor.y))], geometry.matrix);
  need(Math.hypot(point[0] - clamped[0], point[1] - clamped[1]) <= ANCHOR_TOLERANCE + EPS,
    label + ' anchor lies outside its object geometry; arbitrary world coordinates are not object anchors');
  need(point[0] >= -ANCHOR_TOLERANCE && point[0] <= plane.width + ANCHOR_TOLERANCE && point[1] >= -ANCHOR_TOLERANCE && point[1] <= plane.height + ANCHOR_TOLERANCE,
    label + ' anchor is outside the current landscape/portrait design plane');
  return point;
}
function endpoints(layer) {
  const w = layer.w || 200;
  if (layer.type === 'arrow') return [[0, 0], [w, 0]];
  if (layer.type === 'line') {
    need(Array.isArray(layer.points) && layer.points.length >= 2, 'connector line requires its actual points');
    return [layer.points[0], layer.points.at(-1)];
  }
  if (layer.type === 'path') {
    const commands = layer.commands || [], first = commands[0], last = [...commands].reverse().find(command => ['L', 'Q', 'C'].includes(command[0]));
    need(first?.[0] === 'M' && last && !commands.some(command => command[0] === 'Z'), 'connector path must be an open path with start/end geometry');
    return [first.slice(1, 3), last.slice(-2)];
  }
  fail('connectors must use an arrow, line or open path');
}
function validateConnector(graphic, entry, byId, events, shot, end, times, plane) {
  const label = `shot connector ${graphic.id}`;
  need(typeof graphic.directed === 'boolean' && (entry.layer.type !== 'arrow' || graphic.directed === true), label + ' arrow must be a directed connector; a directed:false declaration cannot reverse or disguise it');
  const event = events.find(item => item.id === graphic.event_id);
  const animated = !!entry.layer.motion || changes(entry, shot, shot.start, end, {includeAlpha: true}).length > 0;
  // A short still may communicate an existing relationship without inventing a
  // draw-on or wiggle. Only animated connectors require a motion event; a still
  // contributes no eligible motion and remains subject to the inactivity gate.
  if (animated || graphic.event_id !== undefined)
    need(event?.kind === 'relationship' && contains(event, entry), label + ' animated connector needs its own relationship event_id covering the connector layer');
  need(concrete(graphic.relation), label + ' needs the actual relation it communicates');
  const anchors = [graphic.source, graphic.target];
  need(anchors.every(anchor => object(anchor) && text(anchor.layer_id) && Number.isFinite(anchor.x) && Number.isFinite(anchor.y)), label + ' source/target need object layer_id and finite local x/y anchors');
  need(graphic.source.layer_id !== graphic.target.layer_id && anchors.every(anchor => anchor.layer_id !== entry.layer.id), label + ' source/target must be distinct actual objects, not the connector itself');
  const objects = anchors.map(anchor => byId.get(anchor.layer_id));
  need(objects.every(Boolean), label + ' source/target object is missing');
  need(!objects[0].ancestors.includes(objects[1].layer) && !objects[1].ancestors.includes(objects[0].layer), label + ' source/target cannot be the same nested object');
  for (const objectEntry of objects) realDimensions(objectEntry, label);
  let drawn = false, completed = false, completedStart = null;
  for (const relative of times) {
    if (!visible(entry, relative, {ink: true})) continue;
    drawn = true;
    const state = keyState(entry.layer, relative), geometry = bStyleGeometryAt(entry.layer, entry.ancestors, relative), local = endpoints(state);
    const source = anchorAt(graphic.source, objects[0], relative, plane, label + ' source');
    const target = anchorAt(graphic.target, objects[1], relative, plane, label + ' target');
    const tail = bStyleTransformPoint(local[0], geometry.matrix), tip = bStyleTransformPoint(local[1], geometry.matrix);
    need(Math.hypot(tail[0] - source[0], tail[1] - source[1]) <= ANCHOR_TOLERANCE + EPS,
      label + ' source endpoint drifts away from its object anchor');
    // The arrowhead is already drawn at full width once progress exceeds .95.
    // Lines/paths are complete when the whole stroke is present.
    if (state.type === 'path' || (state.type === 'arrow' ? (state.progress ?? 1) > .95 : (state.progress ?? 1) >= 1 - EPS)) {
      if (completedStart === null) completedStart = shot.start + relative;
      if (!event || (shot.start + relative >= event.start - EPS && shot.start + relative <= event.reviewed_end + EPS)) completed = true;
      need(Math.hypot(tip[0] - target[0], tip[1] - target[1]) <= ANCHOR_TOLERANCE + EPS,
        label + ' target endpoint is misdirected or drifts after the connector is drawn');
    }
  }
  if (drawn && (!event || event.complete)) need(completed, label + ' relationship event has no complete drawn connector/result; a permanent partial stroke is not target evidence');
  return {drawn, complete_geometry_observed: completed, completed_start: completedStart, checked_samples: times.length};
}
function countsAsPrincipal(entry, event, graphics) {
  if (['text', 'shadow'].includes(entry.layer.type) || entry.layer.motion?.camera === true) return false;
  const excluded = item => {
    const role = graphics.get(item.id)?.role;
    return role === 'emphasis' || role === 'decoration' || (role === 'signal' && event.kind !== 'signal_state');
  };
  if ([...entry.ancestors, entry.layer].some(excluded)) return false;
  // A wrapper of only decorative strokes/titles cannot launder decoration into
  // an actor. A real artwork descendant is sufficient; actual ink is checked
  // later by the existing isolated-paint and final-MP4 gates.
  if (entry.layer.type === 'group') return [...tree(entry.layer.children, [...entry.ancestors, entry.layer])].some(item =>
    item.layer.type !== 'group' && !['text', 'shadow'].includes(item.layer.type) && ![...item.ancestors, item.layer].some(excluded));
  return true;
}

export function planB3Semantics(p, {required = false} = {}) {
  if (p.style !== 'B3') return null;
  const scopeEnd = p.rangeEnd ?? p.duration ?? p.shots?.at(-1)?.end;
  need(Number.isFinite(scopeEnd) && scopeEnd > 0 && Number.isFinite(p.fps) && p.fps > 0 && Number.isFinite(p.width) && p.width > 0 && Number.isFinite(p.height) && p.height > 0, 'valid scope, fps and dimensions are required');
  need(Array.isArray(p.shots), 'shots are required');
  const plane = {width: 1280, height: 1280 * p.height / p.width}, shots = [], missing_shots = [];
  for (const [index, shot] of p.shots.entries()) {
    if (shot.start >= scopeEnd) continue;
    const id = 'shot-' + index, end = Math.min(scopeEnd, shot.end), partial = end < shot.end - EPS, raw = shot.b3_semantics;
    need(Number.isFinite(shot.start) && Number.isFinite(shot.end) && end > shot.start, id + ' has invalid times');
    if (raw === undefined) {missing_shots.push(id); continue;}
    need(object(raw) && Array.isArray(raw.events) && Array.isArray(raw.graphics), id + ' b3_semantics needs events and graphics arrays');
    const entries = [...tree(shot.layers)], byId = new Map();
    for (const entry of entries) if (entry.layer.id !== undefined) {
      need(text(entry.layer.id) && !byId.has(entry.layer.id), id + ' layer ids must be unique'); byId.set(entry.layer.id, entry);
    }
    const times = timesFor(shot, end, p.fps, entries), relevant = entry => times.some(time => visible(entry, time, {ink: true}));
    const eventIds = new Set(), events = [];
    for (const event of raw.events) {
      need(object(event) && text(event.id) && !eventIds.has(event.id), id + ' event ids must be distinct'); eventIds.add(event.id);
      need(Number.isFinite(event.start) && Number.isFinite(event.end) && event.start >= shot.start - EPS && event.end > event.start && event.end <= shot.end + EPS, id + '/' + event.id + ' needs an absolute in-shot event interval');
      if (event.start >= scopeEnd - EPS) continue; // Future media/branches need not exist for a prefix.
      need(EVENT_KINDS.has(event.kind) && concrete(event.purpose) && text(event.before) && text(event.after) && event.before.trim() !== event.after.trim(), id + '/' + event.id + ' needs a concrete purpose and distinct before/after states');
      need(Number.isInteger(event.cue_index) && event.cue_index >= 0 && event.cue_index < (p.captions || []).length, id + '/' + event.id + ' cue_index is missing or invalid');
      const cue = p.captions[event.cue_index], reviewedEnd = Math.min(end, event.end);
      need(cue.start < reviewedEnd - EPS && cue.end > event.start + EPS, id + '/' + event.id + ' narration/caption cue does not intersect its event');
      need(distinct(event.layer_ids) && event.layer_ids.length > 0 && event.layer_ids.every(layerId => byId.has(layerId)), id + '/' + event.id + ' layer_ids must name distinct actual layers');
      const motionEntries = entries.filter(entry => entry.layer.motion && contains(event, entry));
      need(motionEntries.some(entry => changes(entry, shot, event.start, reviewedEnd).length), id + '/' + event.id + ' needs an actual visible motion-marked layer with changed keys inside the event, not just a written reason');
      events.push({...clone(event), reviewed_end: reviewedEnd, complete: event.end <= end + EPS});
    }
    const graphics = [], byGraphic = new Map();
    for (const graphic of raw.graphics) {
      need(object(graphic) && text(graphic.id) && !byGraphic.has(graphic.id), id + ' graphic ids must be distinct');
      const entry = byId.get(graphic.id);
      // Prefix layer filtering can omit not-yet-visible branches. Actual current
      // strokes still require declarations below, so this cannot hide a line.
      if (!entry && partial) continue;
      need(entry && GRAPHIC_ROLES.has(graphic.role), id + '/' + graphic.id + ' graphic needs an actual layer and a supported role');
      need(entry.layer.type !== 'arrow' || graphic.role === 'connector', id + '/' + graphic.id + ' every arrow is a connector; artwork/decoration cannot disguise it');
      byGraphic.set(graphic.id, graphic);
      if (!relevant(entry)) continue;
      const item = clone(graphic);
      const lineage = [...entry.ancestors, entry.layer];
      item.review_start = shot.start + Math.max(0, ...lineage.map(layer => layer.from ?? 0));
      item.review_end = Math.min(end, ...lineage.map(layer => shot.start + (layer.to ?? Infinity)));
      if (graphic.role === 'connector') {
        item.geometry = validateConnector(graphic, entry, byId, events, shot, end, times, plane);
        item.completed_start = item.geometry.completed_start;
      }
      graphics.push(item);
    }
    const animated_layer_ids = [];
    for (const entry of entries.filter(relevant)) {
      if (['arrow', 'line', 'underline'].includes(entry.layer.type) || (entry.layer.type === 'path' && (entry.layer.motion || changes(entry, shot, shot.start, end, {includeAlpha: true}).length)))
        need(byGraphic.has(entry.layer.id), id + ' graphic ' + (entry.layer.id || '(missing id)') + ' needs explicit connector/emphasis/signal/artwork/decoration classification');
      if (entry.layer.motion) need(events.some(event => contains(event, entry)) || raw.events.some(event => event.start >= scopeEnd - EPS && Array.isArray(event.layer_ids) && contains(event, entry)), id + ' motion layer ' + (entry.layer.id || '(missing id)') + ' is not covered by an event');
      // Unmarked image/shape keyframes must not disappear from the semantic
      // inventory merely by omitting `motion`. Titles and declared non-story
      // finish are reviewed separately and cannot supply principal animation.
      const role = byGraphic.get(entry.layer.id)?.role;
      const exempt = ['text', 'shadow'].includes(entry.layer.type) || entry.layer.motion?.camera === true ||
        [entry.layer, ...entry.ancestors].some(layer => ['emphasis', 'decoration'].includes(byGraphic.get(layer.id)?.role)) ||
        (role === 'signal' && !events.some(event => event.kind === 'signal_state' && contains(event, entry))) ||
        (entry.layer.type === 'group' && !countsAsPrincipal(entry, {kind: 'action'}, byGraphic));
      if (!exempt && changes(entry, shot, shot.start, end, {includeAlpha: true}).length) {
        need(text(entry.layer.id) && events.some(event => contains(event, entry)), id + ' animated picture layer ' + (entry.layer.id || '(missing id)') + ' needs an event even without a motion marker');
        animated_layer_ids.push(entry.layer.id);
      }
    }
    const eligible_motion_windows = [];
    for (const event of events) for (const entry of entries) {
      if (!entry.layer.motion || !contains(event, entry) || !countsAsPrincipal(entry, event, byGraphic)) continue;
      for (const interval of changes(entry, shot, event.start, event.reviewed_end)) eligible_motion_windows.push({id: entry.layer.id, ...interval, event_id: event.id});
    }
    shots.push({id, index, events, graphics, animated_layer_ids, eligible_motion_ids: [...new Set(eligible_motion_windows.map(item => item.id))], eligible_motion_windows});
  }
  if (required) need(missing_shots.length === 0, 'every submitted B3 shot requires shot.b3_semantics before acceptance; missing ' + missing_shots.join(', '));
  return {schema: 1, status: missing_shots.length ? 'missing_plan' : 'planned_not_reviewed', scope_end: scopeEnd, shots, missing_shots, limits: [...LIMITS]};
}
