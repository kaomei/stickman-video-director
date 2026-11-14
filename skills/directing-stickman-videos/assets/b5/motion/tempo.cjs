'use strict';

// Adapted from the original CrazyMei choreography val()/out()/io()/back().
// See ../local-baselines/crazymei/choreography-source/16x9/hook.html.
// Interpolation only: not a rig, renderer, contact solver or scene generator.
const clamp = q => Math.max(0, Math.min(1, q));
const curves = Object.freeze({
  linear: q => q,
  in: q => q ** 3,
  out: q => 1 - (1 - q) ** 3,
  inOut: q => q < .5 ? 4 * q ** 3 : 1 - (-2 * q + 2) ** 3 / 2,
  back: q => { const u = q - 1; return 1 + 3.2 * u ** 3 + 2.2 * u ** 2; },
});

// Each row is [relativeSeconds, value, incomingCurve?].
// Times must strictly increase; the first/last value is held outside the track.
// Evaluate at t - sharedEvent.tc; use different tracks/delays for each layer.
function sample(t, rows) {
  if (!Number.isFinite(t) || !Array.isArray(rows) || rows.length === 0)
    throw new TypeError('A finite time and at least one keyframe are required');
  for (let i = 0; i < rows.length; i++) {
    const [at, value, curve = 'linear'] = rows[i];
    if (!Number.isFinite(at) || !Number.isFinite(value) || !Object.hasOwn(curves, curve) ||
        (i > 0 && at <= rows[i - 1][0]))
      throw new TypeError('Use finite, strictly increasing keyframes and a known curve');
  }
  if (t <= rows[0][0]) return rows[0][1];
  for (let i = 1; i < rows.length; i++) {
    const [end, to, curve = 'linear'] = rows[i];
    if (t <= end) {
      const [start, from] = rows[i - 1];
      const q = curves[curve](clamp((t - start) / (end - start)));
      return from + (to - from) * q;
    }
  }
  return rows[rows.length - 1][1];
}
module.exports = { sample, curves };
