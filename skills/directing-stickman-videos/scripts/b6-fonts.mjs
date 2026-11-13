import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export const PUBLIC_CAPTION_FONT = Object.freeze({
  variant: 'archivo-black', family: 'Archivo Black',
  source: 'assets/fonts/ArchivoBlack.ttf', path: 'fonts/ArchivoBlack.ttf',
  sha256: 'dd9a89a019b4849f66ab75455fe7bdf931311042cbb0f0f97acc061539703180',
  licenseSource: 'assets/fonts/OFL-ArchivoBlack.txt', licensePath: 'fonts/OFL-ArchivoBlack.txt',
  licenseSha256: '4cafdbbd100af37a23805af09b7068e4daafb4516dc3d6d52436f4a9d7b4c0d3',
});

export function checkPublicCaptionFont(skillRoot) {
  for (const [rel, digest] of [[PUBLIC_CAPTION_FONT.source, PUBLIC_CAPTION_FONT.sha256],
                             [PUBLIC_CAPTION_FONT.licenseSource, PUBLIC_CAPTION_FONT.licenseSha256]]) {
    const file = path.join(skillRoot, rel);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error('B6 bundled Archivo Black font/license missing: ' + rel);
    if (sha(file) !== digest) throw new Error('B6 bundled Archivo Black font/license fingerprint mismatch: ' + rel);
  }
  return {ok: true, variant: PUBLIC_CAPTION_FONT.variant, sha256: PUBLIC_CAPTION_FONT.sha256,
          license_sha256: PUBLIC_CAPTION_FONT.licenseSha256};
}

export function provisionPublicCaptionFont(projectDir, skillRoot) {
  checkPublicCaptionFont(skillRoot);
  const base = path.resolve(projectDir);
  const inputs = [PUBLIC_CAPTION_FONT.path, PUBLIC_CAPTION_FONT.licensePath];
  for (const rel of inputs) if (fs.existsSync(path.join(base, rel))) throw new Error('B6 public font target exists; will not overwrite: ' + rel);
  fs.mkdirSync(path.join(base, 'fonts'), {recursive: true});
  for (const [source, dest] of [[PUBLIC_CAPTION_FONT.source, PUBLIC_CAPTION_FONT.path],
                              [PUBLIC_CAPTION_FONT.licenseSource, PUBLIC_CAPTION_FONT.licensePath]]) {
    fs.copyFileSync(path.join(skillRoot, source), path.join(base, dest));
  }
  return {variant: PUBLIC_CAPTION_FONT.variant, inputs};
}
const SPECS = [
  {target: 'Arial.ttf', names: ['Arial.ttf', 'arial.ttf'], fallback: 'NotoSans.ttf'},
  {target: 'ArialBlack.ttf', names: ['Arial Black.ttf', 'ArialBlack.ttf', 'ariblk.ttf'], fallback: 'Nunito.ttf'},
  {target: 'CourierNewBold.ttf', names: ['Courier New Bold.ttf', 'CourierNewBold.ttf', 'courbd.ttf'], fallback: 'NotoSans.ttf'},
];
export function standardFontDirs() {
  if (process.platform === 'darwin') return [path.join(os.homedir(), 'Library/Fonts'), '/Library/Fonts', '/System/Library/Fonts/Supplemental', '/System/Library/Fonts'];
  if (process.platform === 'win32') return [path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts'), path.join(os.homedir(), 'AppData/Local/Microsoft/Windows/Fonts')];
  return [path.join(os.homedir(), '.local/share/fonts'), path.join(os.homedir(), '.fonts'), '/usr/share/fonts/truetype/msttcorefonts', '/usr/share/fonts/truetype/msttcorefonts2', '/usr/share/fonts/truetype/microsoft'];
}
function findFont(dirs, names) {
  for (const dir of dirs) {
    let entries;
    try { entries = fs.readdirSync(dir); } catch { continue; }
    for (const name of names) {
      const actual = entries.find(n => n.toLowerCase() === name.toLowerCase());
      if (actual) { const file = path.join(dir, actual); if (fs.statSync(file).isFile()) return file; }
    }
  }
  return null;
}
// Only known standard directories and an explicit user font directory are read.
// Project-local copies are never added to the redistributable asset pack.
export function provisionFonts(projectDir, skillRoot, {fontDir = process.env.B6_FONT_DIR, systemDirs = standardFontDirs()} = {}) {
  const base = path.resolve(projectDir), dirs = [...(fontDir ? [path.resolve(fontDir)] : []), ...systemDirs];
  const records = SPECS.map(spec => {
    const local = findFont(dirs, spec.names);
    const source = local || path.join(skillRoot, 'assets/fonts', spec.fallback);
    if (!fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error('B6 bundled open font missing: ' + source);
    return {path: 'source/fonts/' + spec.target, source, kind: local ? 'system-local' : 'open-fallback', ...(local ? {} : {fallback_font: spec.fallback}), sha256: sha(source)};
  });
  const provenancePath = path.join(base, 'font-provenance.json');
  for (const rel of [...records.map(r => r.path), 'font-provenance.json']) if (fs.existsSync(path.join(base, rel))) throw new Error('B6 font target exists; will not overwrite: ' + rel);
  fs.mkdirSync(path.join(base, 'source/fonts'), {recursive: true});
  for (const row of records) fs.copyFileSync(row.source, path.join(base, row.path));
  const provenance = {schema: 'b6-font-provenance/1', fonts: records, has_open_fallback: records.some(r => r.kind === 'open-fallback'), reference_pixel_equivalence: 'not_verified', note: 'System fonts are copied only from this user machine into this project. Open fallbacks change typography and require native visual/caption review; they do not reproduce reference pixels.'};
  fs.writeFileSync(provenancePath, JSON.stringify(provenance, null, 2) + '\n');
  return {provenance, hashes: Object.fromEntries([...records.map(r => [r.path, r.sha256]), ['font-provenance.json', sha(provenancePath)]])};
}
