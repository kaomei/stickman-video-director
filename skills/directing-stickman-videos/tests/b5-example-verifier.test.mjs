import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('bundled relay verifier resolves the portable starter kit from another working directory', t => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const example = path.join(root, 'examples/b5-mei-event-relay');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'b5-example-verify-'));
  t.after(() => fs.rmSync(tmp, {recursive: true, force: true}));
  const before = fs.readdirSync(example).sort();
  const result = spawnSync(process.execPath, [path.join(example, 'verify-example.cjs')], {cwd: tmp, encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).status, 'integrity_and_timeline_smoke_pass');
  assert.deepEqual(fs.readdirSync(example).sort(), before, 'verification cannot create runtime files in the packaged example');
});
