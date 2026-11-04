#!/usr/bin/env node
// Resource integrity only: this cannot evaluate a generated picture's aesthetics.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const DEFAULT_ROOT = fileURLToPath(new URL('../', import.meta.url));
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

export function verifyB4StyleLock(skillRoot = DEFAULT_ROOT) {
  const root = fs.realpathSync(skillRoot);
  const base = path.join(root, 'assets/b4');
  const local = relative => {
    if (typeof relative !== 'string' || path.isAbsolute(relative)) throw new Error('B4 resource paths must be relative');
    const target = fs.realpathSync(path.resolve(base, relative));
    if (!target.startsWith(root + path.sep) || !fs.statSync(target).isFile()) throw new Error('B4 resource escapes installed Skill or is not a file');
    return target;
  };
  const manifestFile = local('approved-style.json');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  if (manifest.schema !== 'b4-style-lock-v3' || manifest.style !== 'B4' || !manifest.version || manifest.status !== 'published_white_glove_reference_pack') throw new Error('Invalid B4 style-lock manifest');
  const ids = ['motor-room', 'rooftop', 'driver', 'street', 'opposite-rooftop'];
  if (!Array.isArray(manifest.references) || manifest.references.length !== ids.length || ids.some(id => manifest.references.filter(item => item?.id === id).length !== 1) || new Set(manifest.references.map(item => item.path)).size !== ids.length) throw new Error('B4 requires all five distinct white-glove 40s-sample references');
  const check = (item, kind) => {
    const file = local(item?.path);
    const bytes = fs.readFileSync(file);
    if (!/^[a-f0-9]{64}$/.test(item.sha256) || sha256(bytes) !== item.sha256) throw new Error(`B4 ${kind} fingerprint mismatch; restore the approved resource`);
    if (kind === 'reference' && (bytes.length < 24 || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) || bytes.readUInt32BE(16) !== item.width || bytes.readUInt32BE(20) !== item.height)) throw new Error('B4 anchor PNG dimensions/signature mismatch');
    return {path: file, sha256: item.sha256};
  };
  const references = manifest.references.map(item => ({id: item.id, ...check(item, 'reference')}));
  const prompt = check(manifest.prompt, 'prompt');
  local(manifest.guide);
  local(manifest.common_qa);
  return {style: 'B4', version: manifest.version, resource_integrity: 'pass', references, prompt,
    cli_supported: manifest.runtime?.cli_supported === true,
    aesthetic_review: 'required; not performed by this check',
    sample_review: manifest.sample_review,
    generation: 'Inspect the five white-glove references; use scene-relevant bundled image(s) plus complete prompt, and inspect new output against the set before batching'};
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 2) throw new Error('Usage: node scripts/b4-style-lock.mjs');
    console.log(JSON.stringify(verifyB4StyleLock(), null, 2));
  } catch (error) {
    console.error(`B4 style lock failed: ${error.message}`);
    process.exitCode = 1;
  }
}
