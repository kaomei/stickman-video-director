import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const B4_HOOK = Object.freeze({id: 'b4-hook-v1', family: 'B4Hook', weight: 900,
  font_sha256: 'e67d3588b1bcf9879f814de3696f44d52153a573bf8e41d3be37837e9295ec82',
  setup: '#fff3df', payoff: '#ee695b', outline: '#21212c', shadow: '#11121c',
  line_height: 1.15, settle_scale: 1.035, settle_seconds: .2, reveal_seconds: .3});
export const B4_PORTRAIT = Object.freeze({id: 'b4-portrait-poster-v1', family: 'B4Cinematic', weight: 400,
  font_sha256: 'fd9301f2837c99df2be07cc7f0be66e9470f5354d8fcf1606027c67fcd637a53',
  setup: '#f9edd3', payoff: '#ea6f5b', secondary: '#f9edd3', shadow: '#04090e', line_gap: 10});
export const portraitHook = p => p.opening?.preset === B4_PORTRAIT.id;
export const hookFamily = (p, l) => portraitHook(p) && l.b4Hook === 'payoff' ? B4_PORTRAIT.family : B4_HOOK.family;
export const hookWeight = (p, l) => portraitHook(p) && l.b4Hook === 'payoff' ? B4_PORTRAIT.weight : B4_HOOK.weight;
export const hookRows = l => l.text.split('\n');
export const hookHeight = l => l.lineSizes ? l.lineSizes.reduce((a, b) => a + b, 0) + (l.lineSizes.length - 1) * B4_PORTRAIT.line_gap : l.size * B4_HOOK.line_height;

function makePortrait({setup, payoff, payoffLines, lineSizes, before, after, meaning, h, duration, region, changeAt, payoffAt = .3}) {
  const rows = payoffLines ?? payoff.split('\n');
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 2 || rows.some(s => typeof s !== 'string' || !s.trim() || /[\r\n]/.test(s)) ||
    rows.join(' ').replace(/\s+/g, ' ').trim() !== payoff.replace(/\s+/g, ' ').trim()) throw new Error('Portrait payoffLines must preserve approved copy as one or two explicit semantic lines; do not mechanically split words');
  const sizes = lineSizes ?? (rows.length === 2 ? [242, 162] : [242]);
  if (!Array.isArray(sizes) || sizes.length !== rows.length || sizes.some(s => !Number.isFinite(s) || s < 100 || s > 260)) throw new Error('Portrait lineSizes need one readable 100–260 unit size for each approved semantic line');
  const y = h * .1625, blockHeight = sizes.reduce((a, b) => a + b, 0) + (rows.length - 1) * B4_PORTRAIT.line_gap;
  if (!Number.isFinite(payoffAt) || payoffAt < .25 || payoffAt > Math.min(.65, duration - .65)) throw new Error('Portrait payoffAt must follow approved speech within .25–.65s and leave at least .65s to read');
  const underlineAt = payoffAt + .1, underlineY = Math.max(h * .3715, y + blockHeight + 26);
  return {opening: {version: 1, preset: B4_PORTRAIT.id, shadow: 'hook-shadow', setup: 'hook-setup', payoff: 'hook-payoff', underline: 'hook-underline',
    picture: {before: 'hook-before', after: 'hook-after', meaning, region: region ?? {x: 80, y: h * .43, w: 1120, h: h * .44}}},
    shot: {start: 0, end: duration, layers: [
      {id: 'hook-before', type: 'image', path: before, x: 0, y: 0, w: 1280, h},
      {id: 'hook-after', type: 'image', path: after, x: 0, y: 0, w: 1280, h, from: changeAt,
        keys: [{t: changeAt, alpha: 0}, {t: changeAt + B4_HOOK.reveal_seconds, alpha: 1}]},
      {id: 'hook-shadow', type: 'shadow', direction: 'down', x: 0, y: 0, w: 1280, h: h * .40},
      {id: 'hook-setup', type: 'text', b4Hook: 'setup', text: setup, x: 96, y: h * .102, w: 1088, size: 74, bold: true, align: 'center', color: B4_PORTRAIT.setup},
      {id: 'hook-payoff', type: 'text', b4Hook: 'payoff', text: rows.join('\n'), lineSizes: sizes, lineColors: rows.map((_, i) => i ? B4_PORTRAIT.secondary : B4_PORTRAIT.payoff), x: 128, y, w: 1024, size: sizes[0], bold: true, align: 'center', color: B4_PORTRAIT.payoff, from: payoffAt,
        pivotX: 512, pivotY: blockHeight / 2,
        keys: [{t: payoffAt, scaleX: B4_HOOK.settle_scale, scaleY: B4_HOOK.settle_scale}, {t: payoffAt + B4_HOOK.settle_seconds, scaleX: 1, scaleY: 1}]},
      {id: 'hook-underline', type: 'underline', x: 498, y: underlineY, w: 284, lineWidth: 5, color: B4_PORTRAIT.payoff, from: underlineAt,
        keys: [{t: underlineAt, progress: 0}, {t: underlineAt + .28, progress: 1}]},
    ]}};
}

// B4's opening is authored from approved copy and coherent story-art states.
// This helper never invents a line, recasts a voice, or generates paid media.
export function makeB4Opening({setup, payoff, payoffLines, lineSizes, payoffAt: approvedPayoffAt, before, after, meaning, width = 1280, height = 720, duration = 3, region}) {
  if ([setup, payoff, before, after, meaning].some(v => typeof v !== 'string' || !v.trim())) throw new Error('Approved setup, payoff, before/after paths and story meaning are required');
  if (!Number.isFinite(duration) || duration < 1.3 || duration > 3 || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error('Opening helper requires valid dimensions and a 1.3–3s opening');
  const h = 1280 * height / width;
  const payoffAt = Math.min(.65, duration * .28), changeAt = Math.min(1.05, duration * .4, duration - .8);
  if (height > width) return makePortrait({setup, payoff, payoffLines, lineSizes, before, after, meaning, h, duration, region, changeAt, payoffAt: approvedPayoffAt});
  return {
    opening: {
      version: 1, preset: B4_HOOK.id, shadow: 'hook-shadow', setup: 'hook-setup', payoff: 'hook-payoff',
      picture: {before: 'hook-before', after: 'hook-after', meaning,
        region: region ?? {x: 680, y: h * .08, w: 540, h: Math.min(h * .7, h - 130 - h * .08)}},
    },
    shot: {start: 0, end: duration, layers: [
      {id: 'hook-before', type: 'image', path: before, x: 0, y: 0, w: 1280, h},
      {id: 'hook-after', type: 'image', path: after, x: 0, y: 0, w: 1280, h, from: changeAt,
        keys: [{t: changeAt, alpha: 0}, {t: changeAt + B4_HOOK.reveal_seconds, alpha: 1}]},
      {id: 'hook-shadow', type: 'shadow', x: 0, y: 0, w: 760, h},
      {id: 'hook-setup', type: 'text', b4Hook: 'setup', text: setup, x: 60, y: h * .2, w: 550, size: 62, bold: true, color: B4_HOOK.setup},
      {id: 'hook-payoff', type: 'text', b4Hook: 'payoff', text: payoff, x: 60, y: h * .2 + 180, w: 550, size: 96, bold: true, color: B4_HOOK.payoff, from: payoffAt,
        pivotX: 275, pivotY: 96 * B4_HOOK.line_height,
        keys: [{t: payoffAt, scaleX: B4_HOOK.settle_scale, scaleY: B4_HOOK.settle_scale}, {t: payoffAt + B4_HOOK.settle_seconds, scaleX: 1, scaleY: 1}]},
    ]},
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 4) throw new Error('Usage: node scripts/b4-opening.mjs approved-opening.json opening-layers.json');
    const recipe = makeB4Opening(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
    fs.writeFileSync(process.argv[3], JSON.stringify(recipe, null, 2) + '\n', {flag: 'wx'});
    console.log(JSON.stringify({output: path.resolve(process.argv[3]), stage: 'authored layers; merge opening and first shot into project, then validate and review'}));
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}

const fail = text => { throw new Error(`B4 opening: ${text}`); };
const finite = (v, lo, hi) => Number.isFinite(v) && v >= lo && v <= hi;
const stable = l => !(l.keys?.length) && (l.alpha ?? 1) === 1 && (l.angle ?? 0) === 0 && (l.scaleX ?? 1) === 1 && (l.scaleY ?? 1) === 1;
function planB4PortraitOpening(p, {mediaPath, hashFile}) {
  const o = p.opening, h = 1280 * p.height / p.width, shot = p.shots[0], span = shot.end - shot.start, end = Math.min(span, 3);
  if (p.height <= p.width || o.preset !== B4_PORTRAIT.id) fail('native portrait requires b4-portrait-poster-v1; never reuse landscape left-text/right-picture geometry');
  if (p.rangeEnd + .001 < end) fail(`preview must include the complete opening (${end.toFixed(2)} seconds)`);
  const ids = [o.shadow, o.setup, o.payoff, o.picture.before, o.picture.after, o.underline];
  if (ids.some(id => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length) fail('six unique portrait opening layer IDs are required');
  const get = id => { const found = shot.layers.filter(l => l.id === id); if (found.length !== 1) fail(`opening layer ${id} must occur exactly once`); return found[0]; };
  const [shadow, setup, payoff, before, after, underline] = ids.map(get);
  const from = l => l.from ?? 0, to = l => l.to ?? span;
  const exactKeys = (l, keys) => Array.isArray(l.keys) && l.keys.length === keys.length && l.keys.every((k, i) => Object.keys(k).length === Object.keys(keys[i]).length && Object.entries(keys[i]).every(([f, v]) => k[f] === v));
  if (shadow.type !== 'shadow' || shadow.direction !== 'down' || !stable(shadow) || from(shadow) !== 0 || to(shadow) < end ||
    shadow.x !== 0 || shadow.y !== 0 || shadow.w !== 1280 || !finite(shadow.h, h * .37, h * .42)) fail('portrait needs dark top breathing space fading downward, not a left half-shadow');
  for (const [l, role] of [[setup, 'setup'], [payoff, 'payoff']]) {
    if (l.type !== 'text' || l.b4Hook !== role || !stable({...l, keys: []}) || !l.bold || l.align !== 'center' ||
      !finite(l.x, 64, 200) || !finite(l.w, 880, 1152) || l.x + l.w > 1216 || Math.abs(l.x + l.w / 2 - 640) > .01 || to(l) < end ||
      l.font !== undefined || l.fontFamily !== undefined || l.fontWeight !== undefined) fail('portrait setup/payoff must be centered, proportionate semantic title blocks inside safe margins');
  }
  if (!finite(setup.size, 52, 90) || !finite(setup.y, h * .08, h * .12) || setup.color !== B4_PORTRAIT.setup || /[\r\n]/.test(setup.text) || setup.lineSizes || setup.lineColors || setup.keys?.length) fail('portrait setup requires one centered warm-white rounded line above the poster payoff');
  const rows = hookRows(payoff), sizes = payoff.lineSizes, colors = payoff.lineColors;
  if (rows.length < 1 || rows.length > 2 || rows.some(s => !s.trim()) || !Array.isArray(sizes) || sizes.length !== rows.length || sizes.some(s => !finite(s, 100, 260)) || sizes[0] < setup.size * 1.8 ||
    payoff.size !== sizes[0] || (rows.length === 2 && (sizes[1] > sizes[0] * .85 || sizes[1] < sizes[0] * .55)) ||
    !Array.isArray(colors) || colors.length !== rows.length || colors.some((c, i) => c !== (i ? B4_PORTRAIT.secondary : B4_PORTRAIT.payoff)) ||
    payoff.color !== B4_PORTRAIT.payoff || !finite(payoff.y, h * .15, h * .18) || payoff.y + hookHeight(payoff) > shadow.h - 30) fail('portrait payoff requires one or two explicit semantic Anton lines, coral emphasis, smaller cream continuation and top-area clearance');
  if (from(setup) !== 0 || !finite(from(payoff), .25, Math.min(.65, end - .65))) fail('show portrait setup first, then all semantic payoff lines together with a readable hold');
  if (payoff.pivotX !== payoff.w / 2 || payoff.pivotY !== hookHeight(payoff) / 2 || !exactKeys(payoff, [
    {t: from(payoff), scaleX: B4_HOOK.settle_scale, scaleY: B4_HOOK.settle_scale},
    {t: from(payoff) + B4_HOOK.settle_seconds, scaleX: 1, scaleY: 1},
  ])) fail('portrait visible emphasis requires one whole-payoff uniform 1.035→1 scale-settle over .2s; no squeeze or line staggering');
  const underlineAt = from(payoff) + .1;
  if (underline.type !== 'underline' || underline.x !== 498 || underline.w !== 284 || underline.color !== B4_PORTRAIT.payoff || underline.lineWidth !== 5 ||
    !stable({...underline, keys: []}) || !finite(underline.y, payoff.y + hookHeight(payoff) + 20, shadow.h - 8) || to(underline) < end ||
    from(underline) !== underlineAt || !exactKeys(underline, [{t: underlineAt, progress: 0}, {t: underlineAt + .28, progress: 1}])) fail('portrait requires a short hand-drawn coral emphasis line, visibly drawn after the payoff');
  if (before.type !== 'image' || after.type !== 'image' || !stable(before) || !stable({...after, keys: []}) ||
    !exactKeys(after, [{t: from(after), alpha: 0}, {t: from(after) + B4_HOOK.reveal_seconds, alpha: 1}]) ||
    [before, after].some(l => l.x !== 0 || l.y !== 0 || l.w !== 1280 || l.h !== h || to(l) < end) || from(before) !== 0 ||
    !finite(from(after), .4, end - B4_HOOK.reveal_seconds - .5)) fail('portrait needs coherent native-frame art states and a .3s local reveal with at least .5s hold; landscape rectangles, pans and flashes do not qualify');
  if (hashFile(mediaPath(p.base, before.path)) === hashFile(mediaPath(p.base, after.path))) fail('before/after artwork is identical, even if filenames differ');
  if (typeof o.picture.meaning !== 'string' || !o.picture.meaning.trim()) fail('describe the story-supported picture change');
  const r = o.picture.region;
  if (!r || !finite(r.x, 40, 1120) || !finite(r.y, shadow.h + 24, h - 280) || !finite(r.w, 80, 1200) || !finite(r.h, 80, h * .55) ||
    r.x + r.w > 1240 || r.y + r.h > h - 130) fail('portrait picture-change region must preserve the lower subject/prop below the title area and above captions');
  const index = l => shot.layers.indexOf(l);
  if (index(before) > index(shadow) || index(after) > index(shadow) || [setup, payoff, underline].some(l => index(shadow) > index(l))) fail('put native portrait story art behind the top shadow and typography');
  const snap = t => Math.round(t * p.fps) / p.fps, change = from(after), payoffTime = from(payoff);
  return {status: 'planned', preset: B4_PORTRAIT.id, layout: 'portrait-poster', region: r, meaning: o.picture.meaning,
    font_sha256: B4_HOOK.font_sha256, payoff_font_sha256: B4_PORTRAIT.font_sha256,
    times: {setup: snap(Math.min(.16, payoffTime / 2)), emphasis: Math.ceil(payoffTime * p.fps) / p.fps, payoff: snap(payoffTime + .3),
      before: Math.floor((change - .1) * p.fps) / p.fps, transition: snap(change + B4_HOOK.reveal_seconds / 2),
      after: Math.ceil((change + B4_HOOK.reveal_seconds + .05) * p.fps) / p.fps, hold: Math.floor(Math.min(end - .08, change + B4_HOOK.reveal_seconds + .4) * p.fps) / p.fps,
      mark_start: Math.floor(underlineAt * p.fps) / p.fps, mark_mid: snap(underlineAt + .14), mark_hold: Math.ceil((underlineAt + .32) * p.fps) / p.fps},
    end, layer_ids: ids,
    title_regions: [{id: setup.id, x: setup.x - 18, y: setup.y - 18, w: setup.w + 36, h: setup.size * 1.3 + 36},
      {id: payoff.id, x: payoff.x - 24, y: payoff.y - 24, w: payoff.w + 48, h: hookHeight(payoff) + 60}],
    underline_region: {id: underline.id, x: underline.x - 8, y: underline.y - 8, w: underline.w + 16, h: 20}};
}
export function planB4Opening(p, {mediaPath, hashFile}) {
  if (p.style !== 'B4') return null;
  const o = p.opening;
  if (o?.user_override !== undefined) {
    if (typeof o.user_override !== 'string' || !o.user_override.trim()) fail('user_override must record a specific, explicit user-approved visual exception');
    return {status: 'user_exception', reason: o.user_override, human_review: 'required; this is not a diagnostic pass'};
  }
  if (o?.version !== 1 || !o.picture) fail('required choreography is missing; use makeB4Opening with approved setup/payoff and story-supported before/after art');
  if (p.height > p.width || o.preset === B4_PORTRAIT.id) return planB4PortraitOpening(p, {mediaPath, hashFile});
  if (o.preset !== B4_HOOK.id) fail(`fixed typography preset ${B4_HOOK.id} is required; default captions or arbitrary font sizes are not the hook style`);
  const shot = p.shots[0], span = shot.end - shot.start, end = Math.min(span, 3), h = 1280 * p.height / p.width;
  if (p.rangeEnd + .001 < end) fail(`preview must include the complete opening (${end.toFixed(2)} seconds)`);
  const ids = [o.shadow, o.setup, o.payoff, o.picture.before, o.picture.after];
  if (ids.some(id => typeof id !== 'string' || !id) || new Set(ids).size !== ids.length) fail('five unique opening layer IDs are required');
  const get = id => {
    const found = shot.layers.filter(l => l.id === id);
    if (found.length !== 1) fail(`opening layer ${id} must occur exactly once in the first shot`);
    return found[0];
  };
  const [shadow, setup, payoff, before, after] = ids.map(get);
  const from = l => l.from ?? 0, to = l => l.to ?? span;
  if (shadow.type !== 'shadow' || ![undefined, 'right'].includes(shadow.direction) || !stable(shadow) || from(shadow) !== 0 || to(shadow) < end ||
    Math.abs(shadow.x ?? 0) > 1 || Math.abs(shadow.y ?? 0) > 1 || !finite(shadow.w, 640, 850) || shadow.h < h - 110) fail('use a visible left half-shadow throughout the opening');
  for (const l of [setup, payoff]) {
    if (l.type !== 'text' || !stable({...l, keys: []}) || !l.bold || !finite(l.size, 40, 160) || !finite(l.x, 28, 100) ||
      !finite(l.y, 24, h - 180) || !finite(l.w, 160, 600) || l.x + l.w > 650 || to(l) < end) fail('setup/payoff must be readable, stable left-side semantic text blocks');
    const role = l === setup ? 'setup' : 'payoff';
    if (l.b4Hook !== role || l.color !== B4_HOOK[role] || l.font !== undefined || l.fontFamily !== undefined || l.fontWeight !== undefined) fail('fixed typography requires the bundled rounded face, warm-white setup and coral payoff; no silent default-font substitution');
    if (!/^[\u0020-\u024f\u0300-\u036f\u0400-\u052f\u1e00-\u1eff\u2000-\u206f]+$/u.test(l.text)) fail('hook script is not covered by the bundled rounded font; obtain an explicit localized-font treatment instead of silent fallback');
  }
  if (from(setup) !== 0 || !finite(from(payoff), .25, Math.min(1.8, end - .65))) fail('show setup first, then the whole payoff together; leave at least .65s to read');
  const expectedKeys = [{t: from(payoff), scaleX: B4_HOOK.settle_scale, scaleY: B4_HOOK.settle_scale}, {t: from(payoff) + B4_HOOK.settle_seconds, scaleX: 1, scaleY: 1}];
  const fixedKeys = Array.isArray(payoff.keys) && payoff.keys.length === 2 && payoff.keys.every((k, i) => Object.keys(k).length === 3 && Object.entries(expectedKeys[i]).every(([field, value]) => k[field] === value));
  if (setup.keys?.length || payoff.size < setup.size * 1.25 || payoff.size > setup.size * 1.8 ||
    payoff.pivotX !== payoff.w / 2 || payoff.pivotY !== payoff.size * B4_HOOK.line_height ||
    !fixedKeys) fail('fixed visible emphasis requires whole-payoff uniform 1.035→1 scale-settle over .2s, not font-size changes or a self-declared flag');
  const revealKeys = [{t: from(after), alpha: 0}, {t: from(after) + B4_HOOK.reveal_seconds, alpha: 1}];
  const fixedReveal = Array.isArray(after.keys) && after.keys.length === 2 && after.keys.every((k, i) => Object.keys(k).length === 2 && Object.entries(revealKeys[i]).every(([field, value]) => k[field] === value));
  if (before.type !== 'image' || after.type !== 'image' || !stable(before) || !stable({...after, keys: []}) || !fixedReveal ||
    ['x', 'y', 'w', 'h'].some(k => before[k] !== after[k]) || from(before) !== 0 ||
    to(before) < end || to(after) < end || !finite(from(after), .4, end - B4_HOOK.reveal_seconds - .5)) fail('use two coherent, matching-frame art states with a .3s animated local reveal and at least .5s hold; a static switch, pan/shake/flash alone is not picture action');
  if (hashFile(mediaPath(p.base, before.path)) === hashFile(mediaPath(p.base, after.path))) fail('before/after artwork is identical, even if filenames differ');
  if (typeof o.picture.meaning !== 'string' || !o.picture.meaning.trim()) fail('describe the story-supported picture change, not a generic effect');
  const r = o.picture.region;
  if (!r || !finite(r.x, 640, 1180) || !finite(r.y, 0, h - 160) || !finite(r.w, 80, 640) || !finite(r.h, 80, h - 110) ||
    r.x + r.w > 1280 || r.y + r.h > h - 110) fail('picture region must frame the changed subject/prop on the right, outside captions');
  const index = l => shot.layers.indexOf(l);
  if (index(before) > index(shadow) || index(after) > index(shadow) || index(shadow) > index(setup) || index(shadow) > index(payoff)) fail('put coherent picture states behind the half-shadow and title');
  const snap = t => Math.round(t * p.fps) / p.fps;
  const change = from(after), payoffTime = from(payoff);
  return {status: 'planned', region: r, meaning: o.picture.meaning,
    preset: B4_HOOK.id, font_sha256: B4_HOOK.font_sha256,
    times: {setup: snap(Math.min(.16, payoffTime / 2)), emphasis: Math.ceil(payoffTime * p.fps) / p.fps,
      payoff: snap(payoffTime + .3),
      before: Math.floor((change - .1) * p.fps) / p.fps,
      transition: snap(change + B4_HOOK.reveal_seconds / 2),
      after: Math.ceil((change + B4_HOOK.reveal_seconds + .05) * p.fps) / p.fps,
      hold: Math.floor(Math.min(end - .08, change + B4_HOOK.reveal_seconds + .4) * p.fps) / p.fps},
    end, layer_ids: ids,
    title_regions: [
      {id: setup.id, x: setup.x, y: setup.y, w: setup.w, h: payoff.y - setup.y},
      {id: payoff.id, x: payoff.x - 12, y: payoff.y - 12, w: payoff.w + 24, h: Math.min(payoff.size * 2 * B4_HOOK.line_height + 30, h - 110 - payoff.y)},
    ]};
}
