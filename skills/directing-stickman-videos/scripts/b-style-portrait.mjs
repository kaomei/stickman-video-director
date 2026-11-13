// B1–B3 native portrait layout. Pure planning data; never visual acceptance.
const STYLES = ['B1', 'B2', 'B3'];
const LANDSCAPE_CAPTIONS = {B1: 34, B2: 40, B3: 34};
export const PORTRAIT_CAPTIONS = Object.freeze({B1: 64, B2: 72, B3: 64});
export const PORTRAIT_PRESET = 'b123-native-portrait-v1';
const DEFAULT_SAFE = Object.freeze({left: .06, right: .12, top: .08, bottom: .18});
const fail = message => { throw Error('B1–B3 portrait: ' + message); };
const need = (value, message) => { if (!value) fail(message); };
const concrete = value => typeof value === 'string' && value.trim().length >= 12;
const id = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,95}$/.test(value);
export const isBStylePortrait = p => STYLES.includes(p.style) && p.height > p.width;
function* tree(layers, ancestors = []) {
  for (const layer of layers || []) {
    yield {layer, ancestors};
    if (layer.type === 'group') yield* tree(layer.children, [...ancestors, layer]);
  }
}
function layout(p) {
  const height = 1280 * p.height / p.width;
  const custom = p.portrait?.safe_area;
  if (custom !== undefined) need(custom && !Array.isArray(custom) && typeof custom === 'object' && Object.keys(custom).every(k => k in DEFAULT_SAFE), 'safe_area supports left/right/top/bottom fractions only');
  const margins = {...DEFAULT_SAFE, ...custom};
  // Conservative project defaults/floors, not a platform specification. Actual
  // app chrome and story-specific composition still require phone playback.
  for (const [key, floor] of Object.entries({left: .04, right: .08, top: .04, bottom: .12}))
    need(Number.isFinite(margins[key]) && margins[key] >= floor && margins[key] <= .3, `safe_area.${key} must be a fraction between ${floor} and 0.3`);
  need(margins.left + margins.right <= .5 && margins.top + margins.bottom <= .5, 'safe_area leaves too little readable stage');
  const safe = {x: 1280 * margins.left, y: height * margins.top, w: 1280 * (1 - margins.left - margins.right), h: height * (1 - margins.top - margins.bottom)};
  const size = p.captionSize ?? PORTRAIT_CAPTIONS[p.style];
  need(Number.isFinite(size) && size >= 64 && size <= 96, 'caption size must remain at least 16px at a 320px viewing width (64–96 on the design plane)');
  const paddingX = p.style === 'B2' ? 24 : 8;
  const y = safe.y + safe.h - (size * .75 + 16);
  const top = y - size * .5 - 18;
  return {height, safe, caption: {font_size: size, x: safe.x + safe.w / 2, y, max_width: safe.w - paddingX * 2, band_top: top - 48, padding_x: paddingX, box_height: size + 36}};
}
export function bStyleCaptionLayout(p) {
  if (isBStylePortrait(p)) return layout(p).caption;
  const height = 1280 * p.height / p.width;
  return {font_size: p.captionSize ?? LANDSCAPE_CAPTIONS[p.style] ?? 34, x: 640, y: height - 60, max_width: 1120, band_top: height - 110, padding_x: 22, box_height: 66};
}
export function planBStylePortrait(p) {
  if (!isBStylePortrait(p)) return null;
  need(p.portrait === undefined || (p.portrait && typeof p.portrait === 'object' && !Array.isArray(p.portrait) && Object.keys(p.portrait).every(k => k === 'safe_area')), 'portrait supports safe_area only; native composition belongs to each shot.portrait');
  const {height, safe, caption} = layout(p);
  const shotIds = new Set();
  const shots = (p.shots || []).map((shot, index) => {
    const sid = shot.id || `shot-${index}`;
    need(id(sid) && !shotIds.has(sid), 'each shot needs a distinct safe id'); shotIds.add(sid);
    const native = shot.portrait;
    need(native && concrete(native.intent), `${sid} needs shot.portrait.intent describing its native framing and important action`);
    need(Array.isArray(native.regions) && native.regions.length > 0, `${sid} needs native important regions; changing width/height alone is insufficient`);
    const entries = [...tree(shot.layers)], byId = new Map();
    for (const entry of entries) {
      need(id(entry.layer.id) && !byId.has(entry.layer.id), `${sid} portrait layers need distinct safe ids for visibility evidence`);
      byId.set(entry.layer.id, entry);
    }
    const background = native.background_ids ?? [];
    need(Array.isArray(background) && new Set(background).size === background.length && background.every(k => byId.has(k)), `${sid} background_ids must name distinct actual scene-background layers`);
    const isBackground = entry => [entry.layer, ...entry.ancestors].some(l => background.includes(l.id));
    // A static leaf still participates in its principal-motion ancestor's
    // action. Exempting that leaf must not remove the moving actor's actual
    // ink from the native-region/visibility check.
    need(entries.filter(isBackground).every(e => ![e.layer, ...e.ancestors].some(l => l.motion)), `${sid} a principal motion layer cannot be exempted as background`);
    const covered = new Set(), regionIds = new Set();
    const regions = native.regions.map(item => {
      need(id(item?.id) && !regionIds.has(item.id), `${sid} important regions need distinct safe ids`); regionIds.add(item.id);
      need(['actor', 'prop', 'information', 'contact'].includes(item.role) && concrete(item.intent), `${sid}/${item.id} needs its actual role and observed story intent`);
      need(Array.isArray(item.layer_ids) && item.layer_ids.length > 0 && new Set(item.layer_ids).size === item.layer_ids.length && item.layer_ids.every(k => byId.has(k) && !isBackground(byId.get(k))), `${sid}/${item.id} must reference actual non-background layers`);
      for (const entry of entries) if (item.layer_ids.some(k => entry.layer.id === k || entry.ancestors.some(l => l.id === k))) covered.add(entry.layer.id);
      const r = item.region;
      need(r && ['x', 'y', 'w', 'h'].every(k => Number.isFinite(r[k])) && r.w > 0 && r.h > 0, `${sid}/${item.id} needs a finite positive design-plane rectangle`);
      need(r.x >= safe.x && r.y >= safe.y && r.x + r.w <= safe.x + safe.w + 1e-6 && r.y + r.h <= Math.min(safe.y + safe.h, caption.band_top - 24) + 1e-6, `${sid}/${item.id} must fit the portrait safe stage above the caption band`);
      return {id: item.id, role: item.role, layer_ids: [...item.layer_ids], region: {x: r.x, y: r.y, w: r.w, h: r.h}, intent: item.intent};
    });
    for (const entry of entries) {
      if (isBackground(entry)) continue;
      if (entry.layer.type !== 'group' || entry.layer.motion) need(covered.has(entry.layer.id), `${sid} important layer ${entry.layer.id} is not covered by a native region; only actual scene backgrounds may be exempted`);
    }
    return {id: sid, intent: native.intent, background_ids: [...background], regions};
  });
  need(shots.length > 0, 'native portrait needs shots');
  return {preset: PORTRAIT_PRESET, design_width: 1280, design_height: height, safe_area: safe, caption, shots};
}
