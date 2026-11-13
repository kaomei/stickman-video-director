// Shared B1–B3 production checks. These establish evidence, not creative acceptance.
import path from 'node:path';
import {walkLayers} from './b3-graphics.mjs';
import {isSceneScaleMotion} from './b-style-motion-geometry.mjs';
import {requireB4Glyphs} from './b4-font-coverage.mjs';
import {planBStylePortrait, bStyleCaptionLayout, isBStylePortrait} from './b-style-portrait.mjs';
import {planB3Semantics} from './b3-semantic-motion.mjs';

export const CAPTION_PRESETS = Object.freeze({B1: 34, B2: 40, B3: 34});
const text = x => typeof x === 'string' && x.trim().length > 0;
const MAX_INACTIVE = 2.5, SAMPLE_STEP = .25;
function* layerTree(layers, ancestors = []) {
  for (const layer of layers) {
    yield {layer, ancestors};
    if (layer.type === 'group') yield* layerTree(layer.children, [...ancestors, layer]);
  }
}
// The accepted B1 portrait uses the same handwritten family for scene labels
// and captions. Caveat is a licensed portable candidate, not an assertion that
// future output matches the approved sample's supplied Chalkboard/Hand font.
export function defaultBStyleCaptionFont(p, {root, mediaPath}) {
  if (p.style === 'B1' && isBStylePortrait(p))
    return p.font ? mediaPath(p.base, p.font) : process.env.AUTOPILOT_FONT ? mediaPath(p.base, process.env.AUTOPILOT_FONT) : path.join(root, 'assets/fonts/Caveat.ttf');
  return path.join(root, 'assets/fonts/NotoSans.ttf');
}
export function prepareBStyleQuality(p, {root, hashFile, mediaPath}) {
  if (!(p.style in CAPTION_PRESETS)) return [];
  planBStylePortrait(p);
  const b3=planB3Semantics(p);
  const presetSize = bStyleCaptionLayout({...p, captionSize: undefined}).font_size;
  const override = p.caption_override;
  const defaultFont = defaultBStyleCaptionFont(p, {root, mediaPath});
  const defaultTreatment = p.style === 'B1' && isBStylePortrait(p) ? 'selected handwritten portrait font' : 'bundled Noto Sans';
  const changedFont = p.captionFont && hashFile(mediaPath(p.base, p.captionFont)) !== hashFile(defaultFont);
  const changedSize = p.captionSize !== undefined && p.captionSize !== presetSize;
  if ((changedFont || changedSize) && !(text(override?.reason) && text(override?.user_approval))) {
    // A scoped script/language fallback may replace glyph coverage, not restyle the video.
    if (!(changedFont && !changedSize && override?.kind === 'language_fallback' && text(override.language) && text(override.reason)))
      throw Error(`${p.style} caption preset invalidated: use the ${defaultTreatment}/${presetSize} treatment or record caption_override reason and actual user_approval`);
    const renderedText = p.captions.map(c => p.style === 'B3' ? c.text.toUpperCase() : c.text).join(' ');
    let needsCoverage = false;
    try { requireB4Glyphs(defaultFont, renderedText, 'default caption', p.style); }
    catch (error) { if (!error.message.includes('selected font lacks glyphs')) throw error; needsCoverage = true; }
    if (!needsCoverage) throw Error(`${p.style} caption preset invalidated: language_fallback requires actual missing glyphs in the current caption scope; restyling needs actual user_approval`);
  }
  let intervals = []; const ids = new Set();
  for (const shot of p.shots) for (const {layer, ancestors} of layerTree(shot.layers)) {
    if (layer.id) { if (ids.has(layer.id)) throw Error('Motion diagnostics require unique layer ids across the project'); ids.add(layer.id); }
    if (!layer.motion) continue;
    if (!text(layer.id) || !['actor', 'prop', 'information'].includes(layer.motion.role) || !text(layer.motion.reason)) throw Error('Local motion requires a unique layer id, role and story reason');
    if (['text', 'shadow'].includes(layer.type) || layer.motion.camera === true) throw Error('Captions, title entrances, shadows and camera movement do not count as principal-picture micro-animation');
    // Inspect the artwork subtree and inherited transforms, not the container's
    // often absent width. Wrapping a scene in a group must not turn a pan into acting.
    const span = Math.min(shot.end, p.rangeEnd) - shot.start;
    const times = new Set([0, span, ...[...ancestors, ...walkLayers([layer])].flatMap(l => (l.keys || []).map(k => k.t))]);
    for (let t = 0; t < span; t += SAMPLE_STEP) times.add(t);
    if (isSceneScaleMotion(layer, ancestors, [...times].filter(t => t >= 0 && t <= span), {width:1280,height:1280*p.height/p.width}))
      throw Error('A full-frame image or scene-scale group transform does not count as local micro-animation; declare a smaller actor/prop instead');
    for (const [prop, delta] of [['x', 2], ['y', 2], ['angle', .02], ['progress', .02], ['scaleX', .02], ['scaleY', .02], ['w', 2]]) {
      const keys = (layer.keys || []).filter(k => k[prop] !== undefined);
      for (let i = 1; i < keys.length; i++) {
        const a = keys[i - 1], b = keys[i];
        const start = Math.max(shot.start + a.t, shot.start + (layer.from ?? 0), ...ancestors.map(l => shot.start + (l.from ?? 0)));
        const end = Math.min(shot.start + b.t, shot.start + (layer.to ?? shot.end - shot.start), p.rangeEnd, ...ancestors.map(l => shot.start + (l.to ?? shot.end - shot.start)));
        if (end > start && Math.abs(b[prop] - a[prop]) >= delta) intervals.push({id: layer.id, start, end, reason: layer.motion.reason});
      }
    }
  }
  if(b3) {
    const plannedIds=new Set(p.shots.filter(s=>s.b3_semantics).flatMap(s=>[...walkLayers(s.layers||[])].map(l=>l.id)));
    const windows=b3.shots.flatMap(s=>s.eligible_motion_windows||[]);
    intervals=intervals.flatMap(i=>!plannedIds.has(i.id)?[i]:windows.filter(w=>w.id===i.id).map(w=>({...i,start:Math.max(i.start,w.start),end:Math.min(i.end,w.end)})).filter(w=>w.end>w.start));
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
  const intervals = p.motion_intervals || [], evidence = new Map(), windows = [];
  if (!intervals.length) return {intervals:[],windows:[]}; // A <=2.5s static beat is already scoped by validation.
  // A 0.25s sampling margin makes the rolling windows conservative: a >2.5s
  // blank stretch contains an entire 2.25s check window. Do not credit a whole
  // minute merely because its endpoint differs by two design pixels.
  const size = Math.min(p.rangeEnd, MAX_INACTIVE - SAMPLE_STEP), starts = new Set([0, Math.max(0,p.rangeEnd-size)]);
  for (let start = SAMPLE_STEP; start + size < p.rangeEnd; start += SAMPLE_STEP) starts.add(start);
  for (const start of [...starts].sort((a,b)=>a-b)) {
    const end = Math.min(p.rangeEnd,start+size); let best = null;
    for (const interval of intervals) {
      const a = Math.max(start,interval.start), b = Math.min(end,interval.end);
      if (b-a < .00001) continue;
      const epsilon = Math.min(1e-5,(b-a)/10);
      const options = {focusIds:[interval.id],principalMotionOnly:true,freezeAncestorsAt:a+epsilon};
      const first = Buffer.from(draw(a+epsilon,options).data()); let changed = 0;
      for (const t of [(a+b)/2,b-epsilon]) {
        const last = draw(t,options).data(); let n = 0;
        for (let i=0;i<first.length;i+=4) if (Math.max(Math.abs(first[i]-last[i]),Math.abs(first[i+1]-last[i+1]),Math.abs(first[i+2]-last[i+2]))>12) n++;
        changed = Math.max(changed,n);
      }
      const key = `${interval.id}:${interval.start}:${interval.end}`, prior = evidence.get(key);
      evidence.set(key,{...interval,changed_pixels:Math.max(prior?.changed_pixels??0,changed)});
      if (!best || changed>best.changed_pixels) best = {start,end,id:interval.id,changed_pixels:changed};
      if (changed>=8) break; // One genuine principal-picture action can carry a window.
    }
    if (!best || best.changed_pixels<8) throw Error(`${p.style} principal picture inactive: no isolated-layer pixel change in bounded window ${start.toFixed(2)}–${end.toFixed(2)}s; check visibility, local keyframes and asset content, not camera/title motion`);
    windows.push(best);
  }
  return {intervals:[...evidence.values()],windows,sample_step:SAMPLE_STEP,max_window:size,
    limits:'Bounded isolated-layer pixel change, with text/shadows excluded and ancestors frozen; geometry is conservative. Causal action, final visibility/occlusion, semantic captions and sound still require playback review'};
}
