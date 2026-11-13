// New B5 stories: source/approval evidence and render checks, not likeness certification.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const text = x => typeof x === 'string' && x.trim().length > 0;
const need = (ok, why) => { if (!ok) throw Error('B5 production: ' + why); };
function files(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => {
    const f = path.join(dir, e.name);
    need(!e.isSymbolicLink(), 'symlinks are not accepted');
    return e.isDirectory() ? files(f) : [f];
  });
}
function lockedFile(scene, item) {
  need(item && text(item.path) && !path.isAbsolute(item.path), 'record a scene-relative asset path');
  const f = path.resolve(scene, item.path);
  need(f.startsWith(scene + path.sep) && fs.existsSync(f) && fs.statSync(f).isFile(), 'missing/local-only asset: ' + item.path);
  need(fs.realpathSync(f) === f, 'asset path must not traverse a symlink');
  need(sha(f) === item.sha256, 'asset hash changed: ' + item.path);
  return f;
}
function exactLegacy(scene, pack) {
  const expected = read(path.join(pack, 'baseline-lock.json')).files.filter(f => f.path.startsWith('example/'));
  // Convert native separators only for manifest comparison; keep filesystem paths native.
  const actual = files(scene).map(f => path.relative(scene, f).split(path.sep).join('/')).sort();
  return JSON.stringify(actual) === JSON.stringify(expected.map(f => f.path.slice(8)).sort()) &&
    expected.every(f => sha(path.join(scene, f.path.slice(8))) === f.sha256);
}
export function validateB5Production({dir, c}, pack) {
  const scene = path.join(dir, 'scene');
  // This exact approved historical SVG is not permission to code-draw new real people.
  if (exactLegacy(scene, pack)) return {mode: 'exact_approved_legacy', limits: 'Unmodified historical sample only; not new-story acceptance'};
  const manifest = path.join(scene, 'production.json');
  need(fs.existsSync(manifest), 'new stories require scene/production.json; never silently replace a real-person/complex-character image with a code face');
  const q = read(manifest), a = q.presenter;
  need(a && ['real_person', 'complex_character', 'original_simple'].includes(a.kind), 'declare presenter kind');
  const file = lockedFile(scene, a);
  need(text(a.identity_anchor) && text(a.style_anchor), 'separate identity and B5 style anchors');
  need(text(a.static_approval), 'obtain actual static likeness/style approval before animation; do not invent approval');
  const s = a.source;
  need(s && ['image_tool', 'user_supplied', 'approved_reuse', 'original_code'].includes(s.type), 'record actual presenter source');
  // Preserve the one approved bundled code-native identity, never new celebrity code faces.
  const approvedRigReuse = a.kind === 'complex_character' && s.type === 'approved_reuse' &&
    sha(file) === sha(path.join(pack, 'example/assets/rig/spider-approved.svg'));
  if (a.kind !== 'original_simple') {
    const b = fs.readFileSync(file);
    const raster = b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ||
      (b[0] === 255 && b[1] === 216 && b[2] === 255) ||
      (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP');
    need(approvedRigReuse || (raster && s.type !== 'original_code'), 'new real-person/complex-character presenter must be supplied/generated raster artwork, not SVG/Canvas/code-drawn face');
  }
  if (s.type === 'image_tool') need(text(s.tool) && text(s.model) && text(s.prompt), 'record actual available image tool/model and final prompt; no Codex-only requirement');
  if (s.type === 'approved_reuse') need(text(s.origin), 'record the accepted asset origin');
  need(Array.isArray(s.references), 'record identity/style references (empty only if none were actually supplied)');
  for (const ref of s.references) { need(['identity', 'style'].includes(ref.role), 'label reference role'); lockedFile(scene, ref); }
  const captions = q.captions;
  need(text(captions?.semantic_review), 'review semantic, voice-aligned caption groups even with a typography override');
  const override = captions.override;
  if (override !== undefined) {
    need(override && ['user_choice', 'language_fallback'].includes(override.kind) && text(override.reason), 'caption override needs a scoped kind and reason');
    if (override.kind === 'user_choice') {
      need(text(override.user_approval) && text(override.treatment), 'record the actual user typography request/origin and chosen treatment; do not invent approval');
    } else {
      need(text(override.language) && text(override.treatment), 'language font fallback needs the target language and adapted treatment');
    }
  }
  const userChoice = override?.kind === 'user_choice';
  need(userChoice ? text(captions.preset) : captions.preset === 'b5-instrument-anton-v1', 'retain B5 Instrument Sans/Anton treatment unless the user explicitly requests another preset');
  for (const [key, name] of [['font', 'Instrument-Sans-1.ttf'], ['title_font', 'Anton-0.ttf']]) {
    const f = lockedFile(scene, captions[key]);
    if (!override) need(sha(f) === sha(path.join(pack, 'example/assets/fonts', name)), 'fixed B5 font changed without an explicit typography choice or language fallback: ' + key);
  }
  need(Array.isArray(q.sound) && q.sound.length, 'record a story-specific sound ledger, including motivated quiet beats');
  for (const cue of q.sound) {
    need(Number.isFinite(cue.start) && Number.isFinite(cue.end) && cue.start >= 0 && cue.end > cue.start && cue.end <= c.duration && text(cue.reason), 'invalid sound cue/time/reason');
    need(['ambience', 'sfx', 'dialogue', 'quiet'].includes(cue.kind), 'declare sound cue kind');
    if (cue.kind !== 'quiet') { lockedFile(scene, cue); need(text(cue.rights), 'record sound source/rights'); }
  }
  let bedEnd = 0;
  for (const cue of q.sound.filter(c => ['ambience', 'quiet'].includes(c.kind)).sort((a,b) => a.start-b.start)) {
    need(cue.start <= bedEnd + .05, 'cover background gaps with quiet ambience or an explicitly motivated quiet beat');
    bedEnd = Math.max(bedEnd, cue.end);
  }
  need(bedEnd >= c.duration - .05, 'cover background gaps with quiet ambience or an explicitly motivated quiet beat');
  need(text(q.sound_review), 'record actual listening review separately from encoding');
  lockedFile(scene, q.mix);
  const intervals = q.motion;
  need(Array.isArray(intervals), 'record local motion intervals, not caption entrances or global camera drift');
  let end = 0;
  for (const m of [...intervals].sort((a,b) => a.start - b.start)) {
    need(Number.isFinite(m.start) && Number.isFinite(m.end) && m.start >= 0 && m.end > m.start && m.end <= c.duration && text(m.reason), 'invalid local motion interval/reason');
    need(['actor', 'prop', 'information'].includes(m.role), 'local motion needs actor/prop/information role');
    const r = m.region;
    need(Array.isArray(r) && r.length === 4 && r.every(Number.isInteger) && r[0] >= 0 && r[1] >= 0 && r[2] > 0 && r[3] > 0 && r[0]+r[2] <= c.width && r[1]+r[3] <= c.height && r[2]*r[3] < c.width*c.height*.6, 'bound motion to a local picture region, excluding captions/global framing');
    need(m.start - end <= 2.500001, 'principal picture inactive for over 2.5 seconds'); end = Math.max(end, m.end);
  }
  need(c.duration - end <= 2.500001, 'principal picture inactive for over 2.5 seconds');
  return {mode: 'new_story', manifest_sha256: sha(manifest), mix_sha256: q.mix.sha256, presenter: {path: a.path, file, sha256: a.sha256, source: s.type, kind: a.kind, approvedRigReuse},
    captions: {preset: captions.preset, font_sha256: captions.font.sha256, title_font_sha256: captions.title_font.sha256, override: override || null}, motion: intervals,
    limits: 'Metadata and sampled pixel checks are not likeness, semantic-caption, final visibility, licensing or listening certification; review actual playback'};
}
export async function checkB5Motion(evidence, renderer, sharp) {
  if (evidence.mode === 'exact_approved_legacy') return evidence;
  if (evidence.presenter.kind !== 'original_simple' && !evidence.presenter.approvedRigReuse) {
    // Header bytes alone are not a decodable generated/supplied asset.
    const meta = await sharp(evidence.presenter.file).metadata();
    need(['png', 'jpeg', 'webp'].includes(meta.format) && meta.width >= 16 && meta.height >= 16, 'presenter must be a decodable raster at usable dimensions');
    await sharp(evidence.presenter.file).raw().toBuffer();
  }
  need(typeof renderer.qualityFrame === 'function', 'renderer must export qualityFrame(t): the same scene/frame path with captions, titles and global camera/noise disabled');
  need(Array.isArray(renderer.productionAssets) && renderer.productionAssets.some(a => a.path === evidence.presenter.path && a.sha256 === evidence.presenter.sha256), 'renderer must declare the actual locked presenter image in productionAssets; do not substitute another face');
  const samples = [];
  for (const m of evidence.motion) {
    const [left,top,width,height] = m.region, at = u => m.start + (m.end-m.start)*u;
    const pixels = async t => sharp(renderer.qualityFrame(t)).extract({left,top,width,height}).removeAlpha().raw().toBuffer();
    const a = await pixels(at(.1)), b = await pixels(at(.9)); let changed = 0;
    for (let i=0;i<a.length;i+=3) if (Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]))>12) changed++;
    need(changed >= 8, 'local motion has no visible pixel change: ' + m.reason);
    samples.push({...m, changed_pixels: changed});
  }
  return {...evidence, motion_samples: samples};
}
