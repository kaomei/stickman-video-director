#!/usr/bin/env node
// Offline selection and portable export. This checks evidence presence, not legal judgment or listening quality.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const DEFAULT_LIBRARY = fileURLToPath(new URL('../assets/b-audio-library', import.meta.url));
const KINDS = new Set(['sfx', 'transition', 'stinger', 'music']);
const SHA256 = /^[a-f0-9]{64}$/i;
const hash = data => createHash('sha256').update(data).digest('hex');
const fail = message => { throw new Error(message); };
const textField = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) fail(`${label} must be a nonempty string`);
  return value;
};
function inside(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}
export function portablePath(value) {
  textField(value, 'Asset/evidence path');
  const normalized = value.replaceAll('\\', '/');
  if (/^[a-z][a-z0-9+.-]*:/i.test(normalized) || normalized.startsWith('/') || normalized.includes('\0') || normalized.split('/').some(part => !part || part === '.' || part === '..')) fail(`Unsafe relative path: ${value}`);
  // Reject Windows device/alternate-stream names even when validating on macOS/Linux.
  if (normalized.split('/').some(part => /[<>:"|?*\x00-\x1f]/.test(part) || /[. ]$/.test(part) || /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(part))) fail(`Not a portable relative path: ${value}`);
  return normalized;
}
function localFile(root, relative) {
  const portable = portablePath(relative);
  const target = path.resolve(root, ...portable.split('/'));
  if (!inside(root, target)) fail(`Path escapes library: ${relative}`);
  let stat;
  try { stat = fs.statSync(target); } catch { fail(`Missing library file: ${portable}`); }
  if (!stat.isFile()) fail(`Not a regular library file: ${portable}`);
  if (!inside(fs.realpathSync(root), fs.realpathSync(target))) fail(`Symlink escapes library: ${portable}`);
  return {path: portable, target, bytes: stat.size};
}
export function loadLibrary(library = DEFAULT_LIBRARY) {
  const input = path.resolve(library);
  const catalogPath = fs.existsSync(input) && fs.statSync(input).isDirectory() ? path.join(input, 'catalog.json') : input;
  const root = path.dirname(catalogPath);
  let raw, catalog;
  try {
    if (!inside(fs.realpathSync(root), fs.realpathSync(catalogPath))) fail('Catalog symlink escapes library');
    raw = fs.readFileSync(catalogPath); catalog = JSON.parse(raw);
  } catch (error) { fail(`Cannot read audio catalog ${catalogPath}: ${error.message}`); }
  if (catalog.schema_version !== 1 || !Array.isArray(catalog.assets) || !Array.isArray(catalog.sources)) fail('Expected catalog schema_version 1 with assets and sources arrays');
  const seen = new Set();
  for (const asset of catalog.assets) {
    textField(asset.id, 'Asset ID');
    if (!/^[a-z0-9][a-z0-9._-]*$/i.test(asset.id) || seen.has(asset.id)) fail(`Invalid or duplicate asset ID: ${asset.id}`);
    seen.add(asset.id);
    if (!KINDS.has(asset.kind)) fail(`Unknown audio kind for ${asset.id}`);
  }
  const sources = new Map();
  for (const source of catalog.sources) {
    textField(source.id, 'Source ID');
    if (sources.has(source.id)) fail(`Duplicate source ID: ${source.id}`);
    sources.set(source.id, source);
  }
  const evidenceFiles = new Map();
  if (catalog.evidence_files !== undefined) {
    if (!Array.isArray(catalog.evidence_files)) fail('evidence_files must be an array');
    for (const file of catalog.evidence_files) {
      const relative = portablePath(file.path);
      if (!SHA256.test(file.sha256 || '') || evidenceFiles.has(relative)) fail(`Invalid or duplicate evidence hash: ${relative}`);
      evidenceFiles.set(relative, file.sha256.toLowerCase());
    }
  }
  return {root, catalogPath, catalog, sources, evidenceFiles, catalogSha256: hash(raw)};
}
export function selectAssets(library, {kind, category, tag, query = '', limit} = {}) {
  if (kind && !KINDS.has(kind)) fail(`Unknown kind: ${kind}`);
  if (limit !== undefined && (!Number.isInteger(Number(limit)) || Number(limit) < 0)) fail('--limit must be a nonnegative integer');
  const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return library.catalog.assets.filter(asset => {
    const haystack = [asset.id, asset.title, asset.kind, asset.category, asset.author, ...(asset.tags || [])].join(' ').toLocaleLowerCase();
    return (!kind || asset.kind === kind) && (!category || asset.category === category) && (!tag || (asset.tags || []).includes(tag)) && terms.every(term => haystack.includes(term));
  }).slice(0, limit === undefined ? undefined : Number(limit));
}
// Profiles select candidates, not mandatory cues or pre-approved aesthetic matches.
export function recommendAssets(library, {style, beat, limit = 3} = {}) {
  textField(style, 'recommend --style');
  textField(beat, 'recommend --beat');
  style = style.toUpperCase();
  if (!/^B[1-9]$/.test(style)) fail('recommend --style must be B1 through B9');
  if (!Number.isInteger(Number(limit)) || Number(limit) < 1) fail('recommend --limit must be a positive integer');
  limit = Number(limit);
  const profiles = library.catalog.selection_profiles || {};
  if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles)) fail('selection_profiles must be an object keyed by style then beat');
  const exact = profiles[style] || {};
  const shared = profiles['*'] || {};
  const available = [...new Set([...Object.keys(exact), ...Object.keys(shared)])].sort();
  const origin = Object.hasOwn(exact, beat) ? style : Object.hasOwn(shared, beat) ? '*' : null;
  const base = {style, beat, limit_per_layer: limit, profile_origin: origin, available_beats: available, note: 'Candidates are optional. Select only sounds caused by this scene; audition and mix with the actual approved voice. This is not listening or final approval.'};
  if (!origin) return {...base, status: 'no_profile', intent: null, notes: [], music: null, sfx: null, gaps: [`No configured profile for ${style}/${beat}. Choose an available beat or use search.`]};
  const profile = profiles[origin][beat];
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) fail(`Invalid selection profile ${origin}/${beat}`);
  const lower = values => values.map(value => value.toLocaleLowerCase());
  const gaps = [];
  function layer(name) {
    const selector = profile[name];
    if (selector === null) return {status: 'not_requested', total_matches: 0, candidates: []};
    if (selector === undefined) {
      gaps.push(`${name}: the selected profile does not configure this layer; no default was guessed.`);
      return {status: 'not_configured', total_matches: 0, candidates: []};
    }
    if (!selector || typeof selector !== 'object' || Array.isArray(selector)) fail(`Invalid ${name} selector in ${origin}/${beat}`);
    const criteria = ['tags_any', 'tags_all', 'roles_any', 'categories'];
    for (const [key, values] of Object.entries(selector)) {
      if (!criteria.includes(key) || !Array.isArray(values) || values.some(value => typeof value !== 'string' || !value.trim())) fail(`Invalid selector ${name}.${key} in ${origin}/${beat}`);
    }
    if (!criteria.some(key => selector[key]?.length)) {
      gaps.push(`${name}: profile has no actual selection criteria; no generic fallback was inserted.`);
      return {status: 'no_match', total_matches: 0, candidates: []};
    }
    const unavailable = [];
    const candidates = library.catalog.assets.flatMap(asset => {
      if (name === 'music' ? asset.kind !== 'music' : asset.kind === 'music') return [];
      const tags = Array.isArray(asset.tags) ? asset.tags.filter(value => typeof value === 'string') : [];
      const roles = Array.isArray(asset.roles) ? asset.roles.filter(value => typeof value === 'string') : [];
      const hints = Array.isArray(asset.style_hints) ? asset.style_hints.filter(value => typeof value === 'string') : [];
      const tagSet = new Set(lower(tags)), roleSet = new Set(lower(roles));
      const matchedTagsAny = (selector.tags_any || []).filter(value => tagSet.has(value.toLocaleLowerCase()));
      const matchedTagsAll = (selector.tags_all || []).filter(value => tagSet.has(value.toLocaleLowerCase()));
      const matchedRoles = (selector.roles_any || []).filter(value => roleSet.has(value.toLocaleLowerCase()));
      const matchedCategories = (selector.categories || []).filter(value => value.toLocaleLowerCase() === String(asset.category).toLocaleLowerCase());
      if (selector.tags_any?.length && !matchedTagsAny.length || selector.tags_all?.length && matchedTagsAll.length !== selector.tags_all.length || selector.roles_any?.length && !matchedRoles.length || selector.categories?.length && !matchedCategories.length) return [];
      let checked;
      try { checked = checkedAsset(library, asset); }
      catch (error) { unavailable.push({id: asset.id, reason: error.message}); return []; }
      const matchingTags = [...new Set([...matchedTagsAny, ...matchedTagsAll])];
      const styleHint = lower(hints).includes(style.toLocaleLowerCase());
      const why = [matchingTags.length ? `Matches profile tag(s): ${matchingTags.join(', ')}` : null, matchedRoles.length ? `Matches profile role(s): ${matchedRoles.join(', ')}` : null, matchedCategories.length ? `Matches profile category: ${matchedCategories.join(', ')}` : null, styleHint ? `Catalog marks this recording as suitable for ${style}` : null].filter(Boolean);
      return [{id: asset.id, title: asset.title, kind: asset.kind, category: asset.category, tags, roles, style_hints: hints, path: checked.asset.path, duration: asset.duration, license_id: asset.license?.id, attribution_required: asset.license?.attribution_required, why, score: matchingTags.length * 2 + matchedRoles.length * 4 + matchedCategories.length + (styleHint ? 2 : 0)}];
    }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
    if (unavailable.length) gaps.push(`${name}: ${unavailable.length} matching catalog recording(s) failed file/license checks and were omitted.`);
    if (!candidates.length) gaps.push(`${name}: no usable recording matches the configured ${origin}/${beat} criteria; do not claim this layer is covered.`);
    return {status: candidates.length ? 'candidates' : 'no_match', criteria: selector, total_matches: candidates.length, unavailable_assets: unavailable, candidates: candidates.slice(0, limit)};
  }
  const music = layer('music'), sfx = layer('sfx');
  const someMatches = music.total_matches + sfx.total_matches > 0;
  const status = gaps.length ? someMatches ? 'partial' : 'no_match' : someMatches ? 'candidates' : 'not_requested';
  return {...base, status, intent: profile.intent || null, notes: Array.isArray(profile.notes) ? profile.notes : [], music, sfx, gaps};
}
function checkedAsset(library, asset) {
  for (const field of ['title', 'category', 'author', 'source_id', 'source_url', 'verified_at']) textField(asset[field], `${asset.id}.${field}`);
  if (!Array.isArray(asset.tags) || asset.tags.some(tag => typeof tag !== 'string')) fail(`${asset.id}: tags must be an array of strings`);
  if (!Array.isArray(asset.modifications)) fail(`${asset.id}: modifications must be an array`);
  if (!SHA256.test(asset.sha256 || '') || !SHA256.test(asset.original_sha256 || '')) fail(`${asset.id}: invalid SHA-256`);
  if (!(asset.duration > 0) || !Number.isFinite(asset.duration) || !Number.isInteger(asset.sample_rate) || asset.sample_rate <= 0 || !Number.isInteger(asset.channels) || asset.channels <= 0) fail(`${asset.id}: invalid audio metadata`);
  const license = asset.license;
  if (!license || !license.id || !license.url || license.commercial_use !== true || license.redistribution !== true || license.modifications_allowed !== true || typeof license.attribution_required !== 'boolean') fail(`${asset.id}: missing or unsuitable license permissions`);
  if (!Array.isArray(license.evidence_paths) || !license.evidence_paths.length) fail(`${asset.id}: missing license evidence`);
  if (license.attribution_required) textField(license.attribution, `${asset.id}: required attribution`);
  const source = library.sources.get(asset.source_id);
  if (!source || source.license_id !== license.id || !source.title || !source.author || !source.source_url || !source.download_url || !Array.isArray(source.evidence_paths) || !source.evidence_paths.length) fail(`${asset.id}: missing or inconsistent source/license evidence`);
  const audio = localFile(library.root, asset.path);
  const actual = hash(fs.readFileSync(audio.target));
  if (actual !== asset.sha256.toLowerCase()) fail(`${asset.id}: audio hash mismatch`);
  const evidence = [...new Set([...license.evidence_paths, ...source.evidence_paths].map(portablePath))].map(file => localFile(library.root, file));
  for (const file of evidence) {
    if (!file.bytes) fail(`${asset.id}: empty evidence file ${file.path}`);
    if (library.catalog.evidence_files !== undefined && !library.evidenceFiles.has(file.path)) fail(`${asset.id}: evidence hash record missing: ${file.path}`);
    if (library.evidenceFiles.has(file.path) && hash(fs.readFileSync(file.target)) !== library.evidenceFiles.get(file.path)) fail(`${asset.id}: evidence hash mismatch: ${file.path}`);
  }
  return {asset: {...asset, path: audio.path, license: {...license, evidence_paths: license.evidence_paths.map(portablePath)}}, source: {...source, evidence_paths: source.evidence_paths.map(portablePath)}, audio, evidence};
}
function runTool(command, args, label) {
  const result = spawnSync(command, args, {encoding: 'utf8', timeout: 45000, maxBuffer: 2 * 1024 * 1024, windowsHide: true});
  if (result.error || result.status !== 0) fail(`${label} failed (${command}): ${result.error?.message || result.stderr?.trim() || `exit ${result.status}`}`);
  return result.stdout;
}
export function verifyLibrary(library, {probe = false, ffmpeg = 'ffmpeg', ffprobe = 'ffprobe'} = {}) {
  if (probe) {
    runTool(ffprobe, ['-version'], 'ffprobe availability');
    runTool(ffmpeg, ['-version'], 'ffmpeg availability');
  }
  for (const [relative, sha256] of library.evidenceFiles) {
    const file = localFile(library.root, relative);
    if (hash(fs.readFileSync(file.target)) !== sha256) fail(`Evidence hash mismatch: ${relative}`);
  }
  const checked = library.catalog.assets.map(asset => checkedAsset(library, asset));
  const soundAssets = checked.filter(item => item.asset.kind === 'sfx' || item.asset.kind === 'transition');
  const uniqueAudio = new Set(soundAssets.map(item => item.asset.sha256.toLowerCase()));
  const uniqueOriginals = new Set(soundAssets.map(item => item.asset.original_sha256.toLowerCase()));
  const sounds = Math.min(uniqueAudio.size, uniqueOriginals.size);
  const music = checked.filter(item => item.asset.kind === 'music').length;
  if (sounds < 200) fail(`Library needs at least 200 distinct non-music/non-stinger sounds; found ${sounds}`);
  if (!music) fail('Library needs at least one music asset');
  if (probe) for (const item of checked) {
    let result;
    try { result = JSON.parse(runTool(ffprobe, ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=codec_type,sample_rate,channels:format=duration', '-of', 'json', item.audio.target], `Audio probe ${item.asset.id}`)); } catch (error) { fail(`Audio probe ${item.asset.id}: ${error.message}`); }
    const stream = result.streams?.[0];
    const duration = Number(result.format?.duration);
    if (!stream || Number(stream.sample_rate) !== item.asset.sample_rate || Number(stream.channels) !== item.asset.channels || !Number.isFinite(duration) || Math.abs(duration - item.asset.duration) > Math.max(.1, item.asset.duration * .02)) fail(`Audio metadata mismatch: ${item.asset.id}`);
    runTool(ffmpeg, ['-v', 'error', '-xerror', '-nostdin', '-i', item.audio.target, '-map', '0:a:0', '-f', 'null', '-'], `Audio decode ${item.asset.id}`);
  }
  return {status: 'pass', assets: checked.length, distinct_sounds: sounds, music, bytes: checked.reduce((sum, item) => sum + item.audio.bytes, 0), decoding: probe ? 'passed' : 'not_requested', listening: 'not_performed'};
}
function safeDestination(out, relative) {
  const target = path.join(out, ...portablePath(relative).split('/'));
  if (!inside(out, target)) fail(`Export path escapes directory: ${relative}`);
  let current = target;
  while (inside(out, current)) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) fail(`Export destination contains a symlink: ${current}`);
    if (current === out) break;
    current = path.dirname(current);
  }
  return target;
}
function realOutputPath(out) {
  // The final project directory may not exist yet. Resolve its closest existing
  // ancestor so a parent alias cannot redirect an independent export into the library.
  let ancestor = out;
  const missing = [];
  while (true) {
    try { fs.lstatSync(ancestor); break; }
    catch (error) {
      if (error.code !== 'ENOENT' || path.dirname(ancestor) === ancestor) throw error;
      missing.unshift(path.basename(ancestor));
      ancestor = path.dirname(ancestor);
    }
  }
  return path.join(fs.realpathSync(ancestor), ...missing);
}
export function exportAssets(library, ids, output) {
  if (!Array.isArray(ids) || !ids.length || ids.some(id => !id)) fail('export requires --ids with comma-separated asset IDs');
  textField(output, 'Export --out directory');
  const unique = [...new Set(ids)];
  const selected = unique.map(id => {
    const asset = library.catalog.assets.find(item => item.id === id);
    if (!asset) fail(`Unknown audio asset: ${id}`);
    return checkedAsset(library, asset);
  });
  const out = path.resolve(output);
  // Ensure output is an independent project copy rather than editing installed assets.
  const realRoot = fs.realpathSync(library.root), realOut = realOutputPath(out);
  if (inside(library.root, out) || inside(out, library.root) || inside(realRoot, realOut) || inside(realOut, realRoot)) fail('Export directory must be separate from the installed audio library');
  const files = new Map();
  function include(relative, bytes, role) {
    const normalized = portablePath(relative);
    if (files.has(normalized) && hash(files.get(normalized).bytes) !== hash(bytes)) fail(`Conflicting export paths: ${normalized}`);
    if (!files.has(normalized)) files.set(normalized, {bytes, role});
  }
  for (const item of selected) {
    include(item.audio.path, fs.readFileSync(item.audio.target), 'audio');
    for (const evidence of item.evidence) include(evidence.path, fs.readFileSync(evidence.target), 'license_evidence');
  }
  const sources = [...new Map(selected.map(item => [item.source.id, item.source])).values()];
  const credits = ['# Selected audio credits', '', 'Only the following selected recordings are included in this project.', '', ...selected.flatMap(({asset}) => [`## ${asset.title} (${asset.id})`, '', `Creator: ${asset.author}`, `Source: ${asset.source_url}`, `License: ${asset.license.id} — ${asset.license.url}`, asset.license.attribution_required ? `Required credit: ${asset.license.attribution}` : 'Attribution is not required by the recorded license.', ...(asset.modifications.length ? [`Modifications: ${asset.modifications.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('; ')}`] : []), ''])].join('\n');
  include('CREDITS.md', Buffer.from(credits), 'credits');
  const manifest = {schema_version: 1, purpose: 'project_selected_audio', catalog_sha256: library.catalogSha256, assets: selected.map(item => item.asset), sources, evidence_files: [...files.entries()].filter(([, file]) => file.role === 'license_evidence').map(([relative, file]) => ({path: relative, sha256: hash(file.bytes)})), required_credits_path: 'CREDITS.md', files: [...files.entries()].map(([relative, file]) => ({path: relative, sha256: hash(file.bytes), bytes: file.bytes.length, role: file.role}))};
  include('audio-selection.json', Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`), 'manifest');
  // Check every destination before writing any file. Identical re-exports are idempotent.
  for (const [relative, file] of files) {
    const target = safeDestination(out, relative);
    if (fs.existsSync(target) && (!fs.statSync(target).isFile() || hash(fs.readFileSync(target)) !== hash(file.bytes))) fail(`Refusing to overwrite different existing file: ${target}`);
  }
  for (const [relative, file] of files) {
    const target = safeDestination(out, relative);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    if (!fs.existsSync(target)) fs.writeFileSync(target, file.bytes, {flag: 'wx'});
  }
  return {status: 'exported', out, selected: selected.map(item => item.asset.id), manifest: path.join(out, 'audio-selection.json'), credits: path.join(out, 'CREDITS.md'), audio_bytes: selected.reduce((sum, item) => sum + item.audio.bytes, 0)};
}
const HELP = `Offline B-mode audio library\n\n  node scripts/audio-library.mjs list [--kind sfx|transition|stinger|music] [--category NAME] [--tag TAG] [--limit N]\n  node scripts/audio-library.mjs search WORDS [same filters]\n  node scripts/audio-library.mjs show ID\n  node scripts/audio-library.mjs recommend --style B6 --beat prop-handoff [--limit N]\n  node scripts/audio-library.mjs export --ids ID,ID --out PROJECT_AUDIO_DIRECTORY\n  node scripts/audio-library.mjs verify [--probe] [--ffmpeg PATH] [--ffprobe PATH]\n\nCommon recommendation beats: opening, reaction, prop-handoff, walk, transition, tension, warm, diagram, ambience, action, ending.\nRecommendations use catalog profiles; music/SFX candidates are optional and gaps are reported.\nAll commands accept --library DIRECTORY_OR_CATALOG and --json. Selection/export work offline.\nverify checks recorded evidence and hashes; --probe additionally requires ffprobe AND ffmpeg.\nNeither command performs physical listening, replaces approved audio, or approves publishing.\n`;
export function main(argv = process.argv.slice(2)) {
  const options = {}, positionals = [];
  const flags = new Set(['json', 'probe', 'help']);
  const valueOptions = new Set(['library', 'kind', 'category', 'tag', 'limit', 'ids', 'out', 'ffmpeg', 'ffprobe', 'style', 'beat']);
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) { positionals.push(argv[i]); continue; }
    const key = argv[i].slice(2);
    if (flags.has(key)) options[key] = true;
    else if (valueOptions.has(key) && argv[i + 1] && !argv[i + 1].startsWith('--')) options[key] = argv[++i];
    else fail(`Unknown option or missing value: --${key}`);
  }
  const [command = 'help', ...rest] = positionals;
  if (command === 'help' || options.help) { process.stdout.write(HELP); return; }
  if (!['list', 'search', 'show', 'export', 'verify', 'recommend'].includes(command)) fail(`Unknown command: ${command}`);
  const allowed = {list: ['kind', 'category', 'tag', 'limit'], search: ['kind', 'category', 'tag', 'limit'], show: [], recommend: ['style', 'beat', 'limit'], export: ['ids', 'out'], verify: ['probe', 'ffmpeg', 'ffprobe']}[command];
  for (const key of Object.keys(options)) if (!['library', 'json', ...allowed].includes(key)) fail(`--${key} is not valid for ${command}`);
  const library = loadLibrary(options.library);
  let result;
  if (command === 'list' || command === 'search') {
    if (command === 'list' && rest.length) fail('list takes filters, not positional arguments');
    result = selectAssets(library, {...options, query: command === 'search' ? rest.join(' ') : ''});
    if (!options.json) {
      process.stdout.write(`${result.map(asset => `${asset.id}\t${asset.kind}\t${asset.category}\t${asset.title}`).join('\n')}${result.length ? '\n' : ''}`);
      return;
    }
  } else if (command === 'show') {
    if (rest.length !== 1) fail('show requires exactly one asset ID');
    const asset = library.catalog.assets.find(item => item.id === rest[0]);
    if (!asset) fail(`Unknown audio asset: ${rest[0]}`);
    result = checkedAsset(library, asset).asset;
  } else if (command === 'recommend') {
    if (rest.length) fail('recommend takes --style, --beat and optional --limit');
    result = recommendAssets(library, options);
  } else if (command === 'export') {
    if (rest.length) fail('export takes --ids and --out only');
    result = exportAssets(library, options.ids?.split(',').map(value => value.trim()), options.out);
  } else {
    if (rest.length) fail('verify takes no positional arguments');
    result = verifyLibrary(library, options);
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch (error) { process.stderr.write(`audio-library: ${error.message}\n`); process.exitCode = 1; }
}
