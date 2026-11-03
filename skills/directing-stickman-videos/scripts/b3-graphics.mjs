// Declarative B3 artwork only: no source-code evaluation or SVG/URL loading.
export function* walkLayers(layers) {
  for (const layer of layers) {
    yield layer;
    if (layer.type === 'group') yield* walkLayers(layer.children);
  }
}
const arity = {M: 2, L: 2, Q: 4, C: 6, Z: 0};
// Preview validation must not require media belonging only to an unfinished
// nested branch. Child visibility is still relative to the shot, not the group.
export function visibleLayers(layers, shotStart, end) {
  return layers.filter(l => shotStart + (l.from ?? 0) < end).map(l => l.type === 'group'
    ? {...l, children: visibleLayers(l.children, shotStart, end)} : l)
    .filter(l => l.type !== 'group' || l.children.length);
}
const finite = (v, label, min = -10000, max = 10000) => {
  if (!Number.isFinite(v) || v < min || v > max) throw new Error(`Invalid B3 ${label}`);
};
export function validateB3(layers, television) {
  let count = 0;
  function visit(list, depth) {
    if (!Array.isArray(list) || !list.length || depth > 8) throw new Error('B3 groups need children; maximum nesting is 8');
    for (const l of list) {
      if (++count > 2000 || !l || typeof l !== 'object') throw new Error('Invalid B3 layer tree');
      for (const k of ['pivotX', 'pivotY', 'radius']) if (l[k] !== undefined) finite(l[k], k, k === 'radius' ? 0 : -10000);
      for (const k of ['scaleX', 'scaleY']) if (l[k] !== undefined) finite(l[k], k, 0.001, 100);
      for (const k of ['fill', 'stroke', 'color']) if (l[k] !== undefined && (typeof l[k] !== 'string' || !/^(?:#(?:[a-f\d]{3}|[a-f\d]{4}|[a-f\d]{6}|[a-f\d]{8})|rgba?\([\d\s.,%]+\)|[a-z]{1,20})$/i.test(l[k]))) throw new Error('Invalid B3 color');
      for (const k of ['alpha', 'progress']) if (l[k] !== undefined) finite(l[k], k, 0, 1);
      if (l.lineWidth !== undefined) finite(l.lineWidth, 'line width', 0.001, 200);
      if (l.type === 'group') visit(l.children, depth + 1);
      else if (l.children !== undefined) throw new Error('Only B3 group layers have children');
      if (l.type === 'path') {
        if (!Array.isArray(l.commands) || !l.commands.length || l.commands.length > 1000 || l.commands[0]?.[0] !== 'M') throw new Error('B3 path needs numeric commands beginning with M');
        for (const c of l.commands) if (!Array.isArray(c) || !Object.hasOwn(arity, c[0]) || c.length !== arity[c[0]] + 1 || c.slice(1).some(n => !Number.isFinite(n) || Math.abs(n) > 10000)) throw new Error('Invalid B3 path command');
      }
      if (['rect', 'ellipse'].includes(l.type)) { finite(l.w, 'shape width', 0.001); finite(l.h, 'shape height', 0.001); }
    }
  }
  visit(layers, 0);
  if (television !== undefined) {
    if (!television || typeof television !== 'object' || Array.isArray(television) || Object.keys(television).some(k => !['enabled', 'intensity'].includes(k))) throw new Error('B3 television supports enabled/intensity only');
    if (television.enabled !== undefined && typeof television.enabled !== 'boolean') throw new Error('B3 television enabled must be boolean');
    if (television.intensity !== undefined) finite(television.intensity, 'television intensity', 0, 1);
  }
}
export function drawB3Shape(ctx, l) {
  ctx.beginPath();
  if (l.type === 'path') for (const [op, ...v] of l.commands) {
    if (op === 'M') ctx.moveTo(...v);
    if (op === 'L') ctx.lineTo(...v);
    if (op === 'Q') ctx.quadraticCurveTo(...v);
    if (op === 'C') ctx.bezierCurveTo(...v);
    if (op === 'Z') ctx.closePath();
  }
  else if (l.type === 'rect') ctx.roundRect(0, 0, l.w, l.h, Math.min(l.radius ?? 0, l.w / 2, l.h / 2));
  else ctx.ellipse(l.w / 2, l.h / 2, l.w / 2, l.h / 2, 0, 0, Math.PI * 2);
  if (l.fill !== 'none') { ctx.fillStyle = l.fill || '#dedfdf'; ctx.fill(); }
  if (l.stroke && l.stroke !== 'none') { ctx.strokeStyle = l.stroke; ctx.lineWidth = l.lineWidth ?? 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(); }
}
export function televisionFinish(ctx, source, width, height, intensity = 0.45) {
  if (!intensity) return;
  ctx.save(); ctx.resetTransform();
  // A soft secondary image, subtle scanlines and vignette; no random full-screen
  // glitches. Applied once to the scene, before clean captions are composited.
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.14 * intensity;
  ctx.filter = `blur(${Math.max(0.4, width / 640)}px)`; ctx.drawImage(source, 0, 0);
  ctx.filter = 'none'; ctx.globalAlpha = 0.045 * intensity; ctx.drawImage(source, Math.max(1, width / 1280), 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = `rgba(0,0,0,${0.12 * intensity})`;
  for (let y = 0; y < height; y += Math.max(3, Math.round(height / 240))) ctx.fillRect(0, y, width, 1);
  const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.7);
  vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, `rgba(0,0,0,${0.3 * intensity})`);
  ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height); ctx.restore();
}
