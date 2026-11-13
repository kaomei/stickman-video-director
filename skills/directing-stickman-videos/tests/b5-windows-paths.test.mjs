import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pack = path.join(root, 'assets/b5');
const script = path.join(root, 'scripts/b5-production-quality.mjs');
const validatorSource = fs.readFileSync(script, 'utf8');
const lock = JSON.parse(fs.readFileSync(path.join(pack, 'baseline-lock.json'), 'utf8'));

// Execute the shipped validator, rather than a copy of its path/hash decision.
// The filesystem adapter reads real locked assets; only path semantics and failure
// scenarios are simulated. This runs on every host and is not a Windows host test.
function validatorFor(api, scenario = 'intact') {
  const anchor = api === path.win32 ? 'C:\\b5-path-test' : '/b5-path-test';
  const project = api.join(anchor, 'project'), scene = api.join(project, 'scene');
  const virtualPack = api.join(anchor, 'pack');
  function localFile(file) {
    for (const [virtual, actual] of [[scene, path.join(pack, 'example')], [virtualPack, pack]]) {
      if (file === virtual || file.startsWith(virtual + api.sep)) {
        return path.join(actual, ...api.relative(virtual, file).split(api.sep));
      }
    }
    throw Error('Unexpected filesystem access: ' + file);
  }
  const fixtureFs = {
    readFileSync(file, encoding) {
      let bytes = fs.readFileSync(localFile(file));
      if (scenario === 'changed' && file === api.join(scene, 'renderer.cjs')) {
        bytes = Buffer.concat([bytes, Buffer.from('\n// modified story fixture\n')]);
      }
      return encoding ? bytes.toString(encoding) : bytes;
    },
    existsSync(file) { return fs.existsSync(localFile(file)); },
    readdirSync(dir, options) {
      let entries = fs.readdirSync(localFile(dir), options);
      if (dir === scene) {
        if (scenario === 'missing') entries = entries.filter(e => e.name !== 'renderer.cjs');
        if (scenario === 'extra') entries.push({
          name: 'unexpected.txt', isDirectory: () => false, isSymbolicLink: () => false
        });
        if (scenario === 'symlink') entries = entries.map(e => e.name === 'renderer.cjs' ? {
          name: e.name, isDirectory: () => false, isSymbolicLink: () => true
        } : e);
      }
      return entries;
    }
  };
  const context = {fs: fixtureFs, path: api, crypto, Buffer};
  const code = validatorSource.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
  vm.runInNewContext(code + '\nglobalThis.validate = validateB5Production;', context, {filename: script});
  return () => context.validate({dir: project, c: {}}, virtualPack);
}

test('B5 path fixtures use the unchanged closed historical lock', () => {
  const expected = lock.files.filter(f => f.path.startsWith('example/'));
  assert.equal(expected.length, 81);
  assert.equal(fs.existsSync(path.join(pack, 'example/production.json')), false);
  for (const item of expected) {
    const bytes = fs.readFileSync(path.join(pack, item.path));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.sha256, item.path);
  }
});

for (const [label, api] of [['Windows', path.win32], ['POSIX', path.posix]]) {
  test(`B5 ${label} paths recognize the unmodified historical example`, () => {
    assert.equal(validatorFor(api)().mode, 'exact_approved_legacy');
  });
  for (const scenario of ['changed', 'missing', 'extra']) {
    test(`B5 ${label} paths keep ${scenario} examples behind the new-story gate`, () => {
      assert.throws(validatorFor(api, scenario), /new stories require scene\/production.json/);
    });
  }
  test(`B5 ${label} paths still reject symlinks before comparing the lock`, () => {
    assert.throws(validatorFor(api, 'symlink'), /symlinks are not accepted/);
  });
}
