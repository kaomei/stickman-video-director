import {keyState} from './b3-graphics.mjs';

const identity = [1, 0, 0, 1, 0, 0];
// Canvas affine matrices: compose parent * local, including the authored pivot.
function multiply(a, b) {
  return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
}
function transform(l) {
  const c = Math.cos(l.angle || 0), s = Math.sin(l.angle || 0);
  const sx = l.scaleX ?? 1, sy = l.scaleY ?? 1, px = l.pivotX || 0, py = l.pivotY || 0;
  const a = c * sx, b = s * sx, d = c * sy, e = -s * sy;
  return [a, b, e, d, (l.x || 0) + px - a * px - e * py, (l.y || 0) + py - b * px - d * py];
}
function active(l, time) {
  return time >= (l.from ?? 0) && time < (l.to ?? Infinity) && (l.alpha ?? 1) > 0;
}
function bounds(points, padding = 0) {
  const eligible = points.filter(p => Array.isArray(p) && p.length >= 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]));
  if (!eligible.length) return null;
  return {minX: Math.min(...eligible.map(p => p[0])) - padding, maxX: Math.max(...eligible.map(p => p[0])) + padding,
    minY: Math.min(...eligible.map(p => p[1])) - padding, maxY: Math.max(...eligible.map(p => p[1])) + padding};
}
function union(a, b) {
  if (!a) return b;
  if (!b) return a;
  return {minX: Math.min(a.minX, b.minX), maxX: Math.max(a.maxX, b.maxX), minY: Math.min(a.minY, b.minY), maxY: Math.max(a.maxY, b.maxY)};
}
function transformed(box, matrix) {
  if (!box) return null;
  return bounds([[box.minX, box.minY], [box.maxX, box.minY], [box.maxX, box.maxY], [box.minX, box.maxY]]
    .map(([x, y]) => [matrix[0] * x + matrix[2] * y + matrix[4], matrix[1] * x + matrix[3] * y + matrix[5]]));
}
function revealedPoints(points, progress) {
  const amount = Math.max(0, Math.min(1, progress));
  if (!points?.length || amount <= 0) return [];
  if (amount >= 1) return points;
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let left = lengths.reduce((a, b) => a + b, 0) * amount;
  const result = [points[0]];
  for (let i = 0; i < lengths.length && left > 0; i++) {
    const fraction = Math.min(1, left / Math.max(.001, lengths[i]));
    result.push([points[i][0] + (points[i + 1][0] - points[i][0]) * fraction, points[i][1] + (points[i + 1][1] - points[i][1]) * fraction]);
    left -= lengths[i];
  }
  return result;
}
function localBounds(l) {
  const w = l.w || 200;
  if (['image', 'pose', 'rect', 'ellipse'].includes(l.type)) {
    if (['rect', 'ellipse'].includes(l.type) && l.fill === 'none' && (!l.stroke || l.stroke === 'none')) return null;
    const padding = ['rect', 'ellipse'].includes(l.type) && l.stroke && l.stroke !== 'none' ? (l.lineWidth ?? 3) / 2 : 0;
    return bounds([[0, 0], [w, l.h || w]], padding);
  }
  if (l.type === 'path') {
    if (l.fill === 'none' && (!l.stroke || l.stroke === 'none')) return null;
    const points = [];
    for (const command of l.commands || []) for (let i = 1; i + 1 < command.length; i += 2) points.push([command[i], command[i + 1]]);
    // Quadratic/cubic curves stay inside their endpoint/control-point hull.
    return bounds(points, l.stroke && l.stroke !== 'none' ? (l.lineWidth ?? 3) / 2 : 0);
  }
  let points;
  if (l.type === 'line') points = l.points;
  else if (l.type === 'underline') points = [[0, 1], [w * .25, -1], [w * .55, 2], [w, -2]];
  else if (l.type === 'arrow') points = Array.from({length: 30}, (_, i) => [w * i / 29, -26 * Math.sin(i / 29 * Math.PI)]);
  else return null; // Titles, captions, shadow overlays and unknown types are not principal artwork.
  const progress = l.progress ?? 1;
  let box = bounds(revealedPoints(points, progress), (l.lineWidth || (l.type === 'underline' ? 6 : 3)) / 2);
  if (l.type === 'arrow' && progress > .95) box = union(box, bounds([[w - 17, -12], [w, 0], [w - 19, 12]], 1.5));
  return box;
}
function artworkBounds(layer, parent, time) {
  const l = keyState(layer, time);
  if (!active(l, time)) return null;
  const matrix = multiply(parent, transform(l));
  if (l.type === 'group') return (l.children || []).reduce((box, child) => union(box, artworkBounds(child, matrix, time)), null);
  return transformed(localBounds(l), matrix);
}

// Ancestors are ordered outermost -> immediate parent; times are shot-relative.
// This conservative geometry guard rejects scene-scale transforms, including a
// group of individually small elements spanning the frame. It does not certify
// visible pixels or acting: image whitespace/aspect ratio is unknown (missing h
// uses w), path/ellipse boxes may overestimate ink, and off-canvas bounds are not
// clipped. Isolated paint checks and final playback review remain necessary.
export function isSceneScaleMotion(layer, ancestors, times, plane = {width: 1280, height: 720}) {
  if (!(Number.isFinite(plane.width) && plane.width > 0)) return false;
  return (times || []).some(time => {
    if (!Number.isFinite(time)) return false;
    let matrix = identity;
    for (const ancestor of ancestors || []) {
      const l = keyState(ancestor, time);
      if (!active(l, time)) return false;
      matrix = multiply(matrix, transform(l));
    }
    const box = artworkBounds(layer, matrix, time);
    return !!box && box.maxX - box.minX >= plane.width * .9;
  });
}

// Read-only geometry for B3 connector diagnostics. This deliberately exposes the
// same transforms as the painter without changing the scene-scale motion gate.
// Bounds describe authored artwork boxes, not decoded image ink or occlusion.
export function bStyleGeometryAt(layer, ancestors = [], time = 0) {
  let matrix = identity, visible = true;
  for (const item of [...ancestors, layer]) {
    const state = keyState(item, time);
    visible = visible && active(state, time);
    matrix = multiply(matrix, transform(state));
  }
  const state = keyState(layer, time);
  const local = layer.type === 'group'
    ? (layer.children || []).reduce((box, child) => union(box, artworkBounds(child, identity, time)), null)
    : localBounds(state);
  return {matrix, visible, local_bounds: visible ? local : null};
}

export function bStyleTransformPoint([x, y], matrix) {
  return [matrix[0] * x + matrix[2] * y + matrix[4], matrix[1] * x + matrix[3] * y + matrix[5]];
}
