import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const B4_HOOK = Object.freeze({id: 'b4-hook-v1', family: 'B4Hook', weight: 900,
  font_sha256: 'e67d3588b1bcf9879f814de3696f44d52153a573bf8e41d3be37837e9295ec82',
  setup: '#fff3df', payoff: '#ee695b', outline: '#21212c', shadow: '#11121c',
  line_height: 1.15, settle_scale: 1.035, settle_seconds: .2, reveal_seconds: .3});

// B4's opening is authored from approved copy and coherent story-art states.
// This helper never invents a line, recasts a voice, or generates paid media.
export function makeB4Opening({setup, payoff, before, after, meaning, width = 1280, height = 720, duration = 3, region}) {
  if ([setup, payoff, before, after, meaning].some(v => typeof v !== 'string' || !v.trim())) throw new Error('Approved setup, payoff, before/after paths and story meaning are required');
  if (!Number.isFinite(duration) || duration < 1.3 || duration > 3 || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error('Opening helper requires valid dimensions and a 1.3–3s opening');
  const h = 1280 * height / width;
  const payoffAt = Math.min(.65, duration * .28), changeAt = Math.min(1.05, duration * .4, duration - .8);
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
export function planB4Opening(p, {mediaPath, hashFile}) {
  if (p.style !== 'B4') return null;
  const o = p.opening;
  if (o?.user_override !== undefined) {
    if (typeof o.user_override !== 'string' || !o.user_override.trim()) fail('user_override must record a specific, explicit user-approved visual exception');
    return {status: 'user_exception', reason: o.user_override, human_review: 'required; this is not a diagnostic pass'};
  }
  if (o?.version !== 1 || !o.picture) fail('required choreography is missing; use makeB4Opening with approved setup/payoff and story-supported before/after art');
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
  if (shadow.type !== 'shadow' || !stable(shadow) || from(shadow) !== 0 || to(shadow) < end ||
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
