'use strict';
// Integrity/timeline smoke test. This does not certify aesthetics or viewing.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const root = __dirname, read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const p = read(path.join(root, 'provenance.json'));
const ledgerFile = path.join(root, 'source-frame-ledger.json'), ledger = read(ledgerFile);
assert.equal(sha(ledgerFile), p.original_receipts['source-frame-ledger.json'].sha256);
assert.equal(ledger.count, 341); assert.equal(ledger.fps, 30);
assert.equal(ledger.source_unchanged_during_render, true);
for (const [name, lock] of Object.entries(p.source_files)) {
  const file = path.join(root, name);
  assert.equal(sha(file), lock.sha256, name + ' source hash changed');
  assert.equal(fs.statSync(file).size, lock.bytes, name + ' source size changed');
  assert.equal(lock.sha256, ledger.source_fingerprints[lock.original_render_receipt_key]);
}
const film = path.resolve(root, p.approved_film.path), approvalFile = path.resolve(root, p.existing_approval_record.path);
assert.equal(sha(film), p.approved_film.sha256, 'approved film changed');
assert.equal(sha(approvalFile), p.existing_approval_record.sha256, 'existing approval record changed');
assert.equal(read(approvalFile).approved_video_sha256, p.approved_film.sha256);
const recheckFile = path.join(root, p.local_reverification.path), recheck = read(recheckFile);
assert.equal(sha(recheckFile), p.local_reverification.sha256);
assert.equal(recheck.all_341_original_frame_files_match_ledger, true);
assert.equal(recheck.samples.length, 12);
for (const sample of recheck.samples) {
  assert.equal(sample.equal, true);
  assert.equal(sample.actual_sha256, sample.expected_sha256);
  assert.equal(sample.expected_sha256, ledger.frames[sample.frame].sha256);
}
const stage = require('./stage.cjs'), study = require('./render-frame.cjs'), distinct = new Set();
for (let i = 0; i < 341; i++) {
  const t = i / 30, a = stage.scene(t);
  assert.equal(a, stage.scene(t), 'nondeterministic stage time ' + t);
  assert(!/NaN|Infinity/.test(a), 'nonfinite stage time ' + t);
  assert(study.frame(t).startsWith('<svg ')); distinct.add(a);
}
assert(distinct.size > 1, 'stage source cannot be a single static frame');
assert.throws(() => study.frame(-1)); assert.throws(() => study.frame(12));
// The starter is a project template: init installs its runtime beside it.
// Recreate that portable layout without adding generated files to this example.
const temporary = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'b5-starter-verify-'));
let starter;
try {
  fs.mkdirSync(path.join(temporary, 'runtime'));
  fs.copyFileSync(path.join(root, 'new-story-stage.cjs'), path.join(temporary, 'stage.cjs'));
  fs.copyFileSync(path.resolve(root, '../../scripts/b5-art-kit.cjs'), path.join(temporary, 'runtime/b5-art-kit.cjs'));
  starter = require(path.join(temporary, 'stage.cjs'));
} finally {
  fs.rmSync(temporary, {recursive: true, force: true});
}
assert.throws(() => starter.scene(0), /has not been authored/);
assert.equal(starter.draw, starter.scene);
assert.equal(starter.tween(1,0,2,10,20), 15);
assert.equal(starter.tween(-1,0,2,10,20), 10);
assert.equal(starter.tween(3,0,2,10,20), 20);
assert.equal(starter.compose('a',[false,'b',null]), 'ab');
assert.throws(() => starter.transform('',{scale:0}), /Invalid/);
console.log(JSON.stringify({status:'integrity_and_timeline_smoke_pass', source_files:2, source_timeline_frames:341,
  recorded_original_PNGs_checked:341, recorded_fresh_full_composite_PNGs_exact:12, approved_film_sha256:p.approved_film.sha256,
  limits:'Reads original receipt/reverification hashes and evaluates the bundled stage. Does not rerender the full film, replay audio, certify event richness, or infer new user acceptance.'},null,2));
