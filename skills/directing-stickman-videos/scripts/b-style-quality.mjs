// Shared B1–B3 production checks. These establish evidence, not creative acceptance.
import path from 'node:path';
import {walkLayers} from './b3-graphics.mjs';

export const CAPTION_PRESETS = Object.freeze({B1: 34, B2: 40, B3: 34});
const text = x => typeof x === 'string' && x.trim().length > 0;
export function prepareBStyleQuality(p, {root, hashFile, mediaPath}) {
  if (!(p.style in CAPTION_PRESETS)) return [];
  const override = p.caption_override;
  const changedFont = p.captionFont && hashFile(mediaPath(p.base, p.captionFont)) !== hashFile(path.join(root, 'assets/fonts/NotoSans.ttf'));
  const changedSize = p.captionSize !== undefined && p.captionSize !== CAPTION_PRESETS[p.style];
  if ((changedFont || changedSize) && !(text(override?.reason) && text(override?.user_approval))) {
    // A scoped script/language fallback may replace glyph coverage, not restyle the video.
    if (!(changedFont && !changedSize && override?.kind === 'language_fallback' && text(override.language) && text(override.reason)))
      throw Error(`${p.style} caption preset invalidated: use the bundled Noto Sans/${CAPTION_PRESETS[p.style]} treatment or record caption_override reason and actual user_approval`);
  }
  const intervals = [], ids = new Set();
  for (const shot of p.shots) for (const layer of walkLayers(shot.layers)) {
    if (layer.id) { if (ids.has(layer.id)) throw Error('Motion diagnostics require unique layer ids across the project'); ids.add(layer.id); }
    if (!layer.motion) continue;
    if (!text(layer.id) || !['actor', 'prop', 'information'].includes(layer.motion.role) || !text(layer.motion.reason)) throw Error('Local motion requires a unique layer id, role and story reason');
    if (['text', 'shadow'].includes(layer.type) || layer.motion.camera === true) throw Error('Captions, title entrances, shadows and camera movement do not count as principal-picture micro-animation');
    // A background-scale transform is not local acting. Declare the smaller actor/prop instead.
    if ((layer.w ?? 0) >= 1152 && layer.type === 'image') throw Error('A full-frame image transform does not count as local micro-animation');
    for (const [prop, delta] of [['x', 2], ['y', 2], ['angle', .02], ['progress', .02], ['scaleX', .02], ['scaleY', .02], ['w', 2]]) {
      const keys = (layer.keys || []).filter(k => k[prop] !== undefined);
      for (let i = 1; i < keys.length; i++) {
        const a = keys[i - 1], b = keys[i];
        const start = Math.max(shot.start + a.t, shot.start + (layer.from ?? 0));
        const end = Math.min(shot.start + b.t, shot.start + (layer.to ?? shot.end - shot.start), p.rangeEnd);
        if (end > start && Math.abs(b[prop] - a[prop]) >= delta) intervals.push({id: layer.id, start, end, reason: layer.motion.reason});
      }
    }
  }
  let end = 0;
  for (const item of [...intervals].sort((a, b) => a.start - b.start)) {
    if (item.start - end > 2.500001) throw Error(`${p.style} principal picture inactive for over 2.5s; cuts and caption changes do not count as motion`);
    end = Math.max(end, item.end);
  }
  if (p.rangeEnd - end > 2.500001) throw Error(`${p.style} principal picture inactive for over 2.5s; add story-led local motion, not no-op keys or global zoom`);
  return intervals.filter((v, i, all) => all.findIndex(a => a.id === v.id && a.start === v.start && a.end === v.end) === i);
}

export async function checkBStyleMotionPaint(p, draw) {
  const evidence = [];
  for (const interval of p.motion_intervals || []) {
    const span = interval.end - interval.start;
    const a = Buffer.from(draw(interval.start + span * .1, {focusIds: [interval.id]}).data());
    const b = draw(interval.start + span * .9, {focusIds: [interval.id]}).data();
    let changed = 0;
    for (let i = 0; i < a.length; i += 4) if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 12) changed++;
    if (changed < 8) throw Error(`${p.style} local motion ${interval.id} produced no isolated-layer pixel change; check visibility, keyframes and asset content`);
    evidence.push({...interval, changed_pixels: changed});
  }
  return {intervals: evidence, limits: 'Isolated-layer pixel change only; causal action, final visibility, semantic captions and sound still require playback review'};
}
