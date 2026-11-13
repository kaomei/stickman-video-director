// Bounded paint evidence for authored B1–B3 portrait layouts. This is not
// causal/contact/aesthetic acceptance or a substitute for actual film review.
import {planBStylePortrait} from './b-style-portrait.mjs';
import {keyState} from './b3-graphics.mjs';

const STEP = .25, DIFFERENCE = 3, EPS = 1e-7;
const fail = message => { throw Error('B portrait paint: ' + message); };
function indexLayers(layers, ancestors = [], out = new Map()) {
  for (const layer of layers || []) {
    out.set(layer.id, {layer, ancestors});
    if (layer.type === 'group') indexLayers(layer.children, [...ancestors, layer], out);
  }
  return out;
}
function leaves(layer) {
  return layer.type === 'group' ? (layer.children || []).flatMap(leaves) : [layer];
}
function expectedAt(entry, localTime, span) {
  let alpha = 1;
  for (const layer of [...entry.ancestors, entry.layer]) {
    const state = keyState(layer, localTime);
    if (localTime < (layer.from ?? 0) || localTime >= (layer.to ?? span)) return false;
    alpha *= Math.max(0, Math.min(1, state.alpha ?? 1));
  }
  // A genuinely transparent entrance/exit or an unrevealed line has no ink yet.
  // It must still become observable elsewhere in the submitted range.
  if (alpha <= .02) return false;
  const state = keyState(entry.layer, localTime);
  return !(['line', 'arrow', 'underline'].includes(state.type) && (state.progress ?? 1) <= .001);
}
function sampleTimes(shot, end, fps, indexed) {
  const span = end - shot.start, inset = Math.min(1 / fps / 4, span / 4);
  const times = new Set([shot.start + inset, end - inset]);
  for (let t = shot.start + STEP; t < end; t += STEP) times.add(t);
  for (const {layer} of indexed.values()) for (const t of [layer.from, layer.to, ...(layer.keys || []).map(k => k.t)]) {
    if (!Number.isFinite(t)) continue;
    for (const delta of [-1 / fps, 0, 1 / fps]) {
      const value = shot.start + t + delta;
      if (value >= shot.start && value < end) times.add(value);
    }
  }
  return [...times].sort((a, b) => a - b);
}
function pixels(draw, time, options, expected) {
  const data = Buffer.from(draw(time, options).data());
  if (data.length !== expected) fail('renderer returned unexpected pixel dimensions');
  return data;
}
function difference(a, b, width, height) {
  let count = 0, left = width, top = height, right = -1, bottom = -1;
  for (let y = 0, i = 0; y < height; y++) for (let x = 0; x < width; x++, i += 4) {
    if (Math.abs(a[i] - b[i]) <= DIFFERENCE && Math.abs(a[i + 1] - b[i + 1]) <= DIFFERENCE && Math.abs(a[i + 2] - b[i + 2]) <= DIFFERENCE) continue;
    count++; left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  return {count, bounds: count ? {x: left, y: top, w: right - left + 1, h: bottom - top + 1} : null};
}
function contains(region, box, scale) {
  // One raster pixel covers antialiasing/rounding at a declared design boundary.
  return box.x >= region.x * scale - 1 && box.y >= region.y * scale - 1 &&
    box.x + box.w <= (region.x + region.w) * scale + 1 && box.y + box.h <= (region.y + region.h) * scale + 1;
}
export async function checkBStylePortraitPaint(p, draw) {
  const plan = planBStylePortrait(p);
  if (!plan) return null;
  if (typeof draw !== 'function') fail('a painter is required');
  const scale = p.width / plan.design_width, size = p.width * p.height * 4, shots = [];
  const emptyId = '__portrait_empty_focus__';
  for (const [index, shotPlan] of plan.shots.entries()) {
    const shot = p.shots[index], end = Math.min(shot.end, p.rangeEnd ?? p.duration), span = shot.end - shot.start;
    const indexed = indexLayers(shot.layers);
    if (indexed.has(emptyId)) fail('reserved diagnostic layer id');
    const background = new Set();
    for (const id of shot.portrait?.background_ids || []) {
      const entry = indexed.get(id);
      if (entry) for (const layer of leaves(entry.layer)) background.add(layer.id);
    }
    const members = new Map();
    for (const region of shotPlan.regions) for (const id of region.layer_ids) {
      const entry = indexed.get(id);
      if (!entry) fail(`shot ${shotPlan.id} references missing layer ${id}`);
      for (const layer of leaves(entry.layer)) {
        if (background.has(layer.id)) continue;
        const member = members.get(layer.id) || {id: layer.id, entry: indexed.get(layer.id), regions: [], eligible_samples: 0, observed_samples: 0, occluded_samples: 0, occlusion_intervals: [], occlusionRun: null, first_visible: null, last_visible: null, minimum_composition_pixels: Infinity};
        member.regions.push(region); members.set(layer.id, member);
      }
    }
    const times = sampleTimes(shot, end, p.fps, indexed);
    for (const time of times) {
      const baseline = pixels(draw, time, {focusIds: [emptyId]}, size);
      const full = pixels(draw, time, {}, size);
      for (const member of members.values()) {
        const localTime = time - shot.start;
        if (!expectedAt(member.entry, localTime, span)) { member.occlusionRun = null; continue; }
        member.eligible_samples++;
        const isolated = difference(pixels(draw, time, {focusIds: [member.id]}, size), baseline, p.width, p.height);
        const at = `shot ${shotPlan.id} layer ${member.id} at ${time.toFixed(3)}s`;
        if (!isolated.count) fail(`${at} has no observable ink; check off-frame placement, opacity and actual asset content`);
        const b = isolated.bounds;
        // An output-clipped canvas cannot reveal how far artwork extends beyond
        // its edge. Important ink touching that edge must be reframed explicitly.
        if (b.x <= 0 || b.y <= 0 || b.x + b.w >= p.width || b.y + b.h >= p.height) fail(`${at} touches the frame edge; principal artwork may be clipped`);
        if (!contains(plan.safe_area, b, scale)) fail(`${at} extends outside the declared portrait safe area`);
        for (const region of member.regions) if (!contains(region.region, b, scale)) fail(`${at} extends outside declared region ${region.id}`);
        const contribution = difference(full, pixels(draw, time, {omitIds: [member.id]}, size), p.width, p.height);
        member.minimum_composition_pixels = Math.min(member.minimum_composition_pixels, contribution.count);
        // Same-color limbs can briefly become indistinguishable while crossing
        // the body. Retain that evidence without treating a temporary crossing
        // as a permanently absent principal member.
        if (!contribution.count) {
          member.occluded_samples++;
          if (!member.occlusionRun) {
            member.occlusionRun = {start: time, end: time, sample_count: 0};
            member.occlusion_intervals.push(member.occlusionRun);
          }
          member.occlusionRun.end = time; member.occlusionRun.sample_count++;
          continue;
        }
        member.occlusionRun = null;
        member.observed_samples++;
        member.first_visible ??= time; member.last_visible = time;
      }
    }
    for (const member of members.values()) if (!member.observed_samples) {
      // Future visibility cannot excuse a member that was already eligible but
      // made no actual contribution anywhere in the submitted scope.
      if (member.eligible_samples) fail(`shot ${shotPlan.id} layer ${member.id} is completely hidden in the full composition throughout all eligible samples in the submitted range`);
      const future = end < shot.end - EPS && sampleTimes(shot, shot.end, p.fps, indexed)
        .some(time => time >= end && expectedAt(member.entry, time - shot.start, span));
      if (future) member.deferred = 'authored visibility begins after the submitted prefix; full-film visibility remains unverified';
      else fail(`shot ${shotPlan.id} layer ${member.id} never becomes observable in the submitted range`);
    }
    shots.push({id: shotPlan.id, sample_count: times.length, samples: times, members: [...members.values()].map(({entry, regions, occlusionRun, ...member}) => ({...member, minimum_composition_pixels: Number.isFinite(member.minimum_composition_pixels) ? member.minimum_composition_pixels : null, regions: regions.map(r => r.id)}))});
  }
  return {status: 'bounded_diagnostic_pass', preset: plan.preset, sample_step: STEP,
    pixel_difference_threshold: DIFFERENCE, raster_boundary_tolerance_px: 1, transparent_alpha_threshold: .02, shots,
    limits: 'Bounded authored-key/visibility and 0.25s paint sampling, not every encoded frame. Occlusion intervals join consecutive occluded eligible samples; their start/end are sample times, not verified continuous or exact occlusion boundaries. Actual isolated ink fit and at least one nonzero full-composition contribution per eligible member do not prove readable partial occlusion, causal contact, natural acting or aesthetic/sample equivalence. Review the complete final video at its intended phone size and actual sound.'};
}
