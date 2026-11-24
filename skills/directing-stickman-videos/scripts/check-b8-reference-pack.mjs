#!/usr/bin/env node
// File/reference integrity only; no automated aesthetic, animation or listening approval.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export function checkReferencePack(manifestPath) {
  const failures = [];
  const verifiedFiles = [];
  try {
    const manifestFile = manifestPath instanceof URL ? fileURLToPath(manifestPath) : manifestPath;
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    if (manifest.schema_version !== 1 || manifest.style !== 'B8' ||
      manifest.reference_scope !== 'visual_baseline') failures.push('Expected B8 visual-baseline schema 1');
    if (!manifest.user_visual_feedback?.quote || !manifest.user_visual_feedback?.scope)
      failures.push('Missing scoped visual feedback');
    const base = fs.realpathSync(path.dirname(manifestFile));
    const files = Array.isArray(manifest.files) ? manifest.files : [];
    const roles = new Set(files.map(file => file.role));
    for (const role of ['motion_reference', 'character_style_board', 'shot_language_board', 'contact_sequence_board'])
      if (!roles.has(role)) failures.push(`Missing reference role: ${role}`);
    const seen = new Set();
    for (const file of files) {
      if (typeof file.path !== 'string' || !file.path || path.isAbsolute(file.path)) {
        failures.push('Reference paths must be nonempty and relative'); continue;
      }
      if (seen.has(file.path)) failures.push(`Duplicate reference path: ${file.path}`);
      seen.add(file.path);
      const target = fs.realpathSync(path.resolve(base, file.path));
      const relative = path.relative(base, target);
      if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
        failures.push(`Reference escapes pack: ${file.path}`); continue;
      }
      if (!fs.statSync(target).isFile()) { failures.push(`Not a file: ${file.path}`); continue; }
      const actual = crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
      if (!/^[a-f0-9]{64}$/.test(file.sha256 ?? '') || actual !== file.sha256)
        failures.push(`SHA-256 mismatch: ${file.path}`);
      else verifiedFiles.push(file.path);
    }
  } catch (error) { failures.push(error.message); }
  return {ok: failures.length === 0, verifiedFiles, failures,
    scope: 'Reference file integrity only; inspect actual images and motion separately.'};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--manifest')) {
    console.error('Usage: node scripts/check-b8-reference-pack.mjs [--manifest reference-manifest.json]');
    process.exit(2);
  }
  const file = args[1] ?? fileURLToPath(new URL('../assets/b8/approved-midas-r3-v1/reference-manifest.json', import.meta.url));
  const result = checkReferencePack(path.resolve(file));
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}
