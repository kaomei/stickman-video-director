import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const CLI = path.join(ROOT, 'scripts/autopilot.mjs');
const STYLES = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'];
const RATIOS = ['16:9', '9:16'];
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const save = (file, value) => {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, JSON.stringify(value) + '\n');
};
function temporary(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b-style-workflow-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  return dir;
}
function cli(cwd, ...args) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd, encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024,
    env: {...process.env, PYTHONDONTWRITEBYTECODE: '1'}
  });
}
function success(result) {
  assert.equal(result.status, 0, result.error?.message || result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}
function rejected(result, reason) {
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, reason);
}
function tree(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? tree(file).map(name => entry.name + '/' + name) : [entry.name + ':' + hash(file)];
  });
}
function unverified(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (['quality_verified', 'delivery_ready', 'approved'].includes(key)) assert.notEqual(child, true);
    if (key === 'status') assert.ok(!['pass', 'passed', 'approved', 'accepted'].includes(child), `Unexpected completed quality claim: ${child}`);
    unverified(child);
  }
}
function command(workflow, id) {
  const found = workflow.commands.filter(item => item.id === id);
  assert.equal(found.length, 1, `Expected one ${id} command`);
  return found[0].argv;
}
const option = (argv, name) => argv[argv.indexOf(name) + 1];
function assertTemplateRoutes(workflow, projectDir = '<NEW_PROJECT_DIR>') {
  const items = workflow.templates.items;
  if (['B1', 'B2', 'B3'].includes(workflow.style)) {
    assert.deepEqual(items.map(item => [item.phase, item.track, item.path, item.created_by, item.initial_status]),
      ['preview', 'film'].map(phase => [phase, 'reference-effects', path.join(projectDir, 'output', `${phase}-reference/review-template.json`), phase === 'preview' ? 'preview' : 'render', 'unknown']));
    assert.ok(command(workflow, 'approve-preview').includes('--visual-review'));
    assert.equal(command(workflow, 'accept-film')[2], 'accept-visual');
  } else if (workflow.style === 'B4') {
    assert.deepEqual(items.map(item => [item.phase, item.track, item.path, item.created_by, item.initial_status]),
      ['preview', 'film'].flatMap(phase => ['picture', 'typography'].map(track => [phase, track, path.join(projectDir, 'output', `${phase}-${track}/review-template.json`), phase === 'preview' ? 'preview' : 'render', 'unknown'])));
    const approve = command(workflow, 'approve-preview');
    assert.ok(approve.includes('--picture-review') && approve.includes('--text-review'));
    assert.equal(command(workflow, 'accept-film-picture')[2], 'accept-picture');
    assert.equal(command(workflow, 'accept-film-text')[2], 'accept-text');
    assert.ok(command(workflow, 'planning-ledger').includes('--planning'));
    assert.ok(!command(workflow, 'production-ledger').includes('--planning'));
  } else if (workflow.style === 'B5') {
    assert.deepEqual(items.map(item => [item.phase, item.track, item.path, item.created_by, item.initial_status]),
      [['candidate', 'visual', path.join('<NEW_EVIDENCE_DIR>', 'review-template.json'), 'review-pack', 'unknown']]);
    for (const [id, action] of [['validate', 'validate'], ['frames', 'frames'], ['encode-candidate', 'encode'], ['review-pack', 'review-pack'], ['accept-candidate', 'accept']]) {
      const argv = command(workflow, id);
      assert.equal(argv[1], path.join(ROOT, 'scripts/character-explainer.mjs'));
      assert.equal(argv[2], action);
    }
    assert.ok(!workflow.commands.some(item => ['approve-preview', 'render-film'].includes(item.id)));
    assert.ok(!command(workflow, 'init').includes('--ratio'), 'B5 init cannot silently claim native ratio conversion');
  } else {
    assert.deepEqual(items.map(item => [item.phase, item.track, item.path, item.created_by, item.initial_status]), [
      ['preview', 'motion-35-subchecks', path.join(projectDir, 'outputs/review-01/motion-review.json'), 'review-pack', 'pending'],
      ['film', 'motion-35-subchecks', path.join(projectDir, 'outputs/film-review-01/motion-review.json'), 'film-review-pack', 'pending']
    ]);
    for (const id of ['preview', 'review-pack', 'check-preview-review', 'approve-preview', 'render-film', 'film-review-pack', 'check-film-review']) {
      const argv = command(workflow, id);
      assert.equal(argv[1], path.join(projectDir, 'run.py'));
      assert.equal(option(argv, '--ratio'), workflow.ratio);
    }
    assert.equal(command(workflow, 'check-film-review')[2], 'check-review');
    assert.equal(option(command(workflow, 'check-film-review'), '--review'), 'outputs/film-review-01/motion-review.json');
  }
  for (const item of items) {
    assert.ok(workflow.commands.some(step => step.id === item.created_by || (item.created_by === 'render' && step.id === 'render-film')));
    assert.ok(!fs.existsSync(item.path), 'A read-only guide must not create the candidate-specific template');
    assert.ok(!item.path.startsWith(path.join(ROOT, 'assets')), 'Historical assets are not current review templates');
  }
}

for (const style of STYLES) for (const ratio of RATIOS) {
  test(`workflow ${style} ${ratio} works from an unrelated directory without writing or claiming approval`, t => {
    const dir = temporary(t);
    fs.writeFileSync(path.join(dir, 'keep.txt'), 'unchanged user file');
    const before = tree(dir);
    const workflow = success(cli(dir, 'workflow', '--style', style, '--ratio', ratio));
    assert.equal(workflow.schema, 'b-style-installed-workflow/1');
    assert.equal(workflow.read_only, true);
    assert.equal(workflow.status, 'guide_only');
    assert.equal(workflow.quality_verified, false);
    assert.equal(workflow.style, style);
    assert.equal(workflow.ratio, ratio);
    unverified(workflow);
    for (const file of [workflow.guide, ...workflow.production.documents, ...workflow.acceptance.documents, ...workflow.references.map(item => item.path)]) {
      assert.ok(path.isAbsolute(file) && file.startsWith(ROOT));
      assert.ok(fs.statSync(file).isFile(), `Missing installed resource ${file}`);
    }
    const mainDoc = {B1: 'b1-minimal-handdrawn.md', B2: 'b2-colorful-handdrawn.md', B3: 'b3-television.md', B4: 'b4-survival-storytelling.md', B5: 'b5-character-explainer.md', B6: 'b6-dynamic-meme.md'}[style];
    assert.ok(workflow.production.documents.includes(path.join(ROOT, 'references', mainDoc)));
    const init = command(workflow, 'init');
    assert.equal(option(init, '--style'), style);
    if (style !== 'B5') assert.equal(option(init, '--ratio'), ratio);
    if (ratio === '9:16' && ['B1', 'B2', 'B3'].includes(style)) {
      assert.ok(workflow.production.documents.some(file => file.endsWith('b1-b2-b3-native-portrait.md')));
      assert.ok(workflow.references.some(item => item.path.endsWith('portrait-approved-2026-11-13.mp4')));
    }
    if (style === 'B6') assert.equal(workflow.references.find(item => item.role === 'strict-primary-style-and-animation').path, path.join(ROOT, 'assets/b6/reference/eiffel-portrait-v44.mp4'));
    assertTemplateRoutes(workflow);
    assert.deepEqual(tree(dir), before);
  });
}

test('workflow rejects unknown styles and ratios, including a combined native format', t => {
  const dir = temporary(t);
  for (const args of [[], ['--style', 'B0'], ['--style', 'B7'], ['--style', 'b6']]) {
    rejected(cli(dir, 'workflow', ...args), /requires --style B1/);
  }
  for (const style of STYLES) for (const ratio of ['both', '1:1', 'landscape']) {
    rejected(cli(dir, 'workflow', '--style', style, '--ratio', ratio), /one native --ratio/);
  }
  assert.deepEqual(tree(dir), []);
});

for (const style of STYLES.slice(0, 4)) for (const ratio of RATIOS) {
  test(`${style} init authors an empty native ${ratio} scaffold and never passes it as a completed film`, t => {
    const dir = temporary(t), projectDir = path.join(dir, 'new story');
    const initialized = success(cli(dir, 'init', projectDir, '--style', style, '--ratio', ratio));
    unverified(initialized);
    assert.match(initialized.stage, /scaffold/i);
    assert.equal(initialized.project, path.join(projectDir, 'project.json'));
    const project = read(initialized.project);
    assert.equal(project.style, style);
    assert.deepEqual([project.width, project.height], ratio === '9:16' ? [720, 1280] : [1280, 720]);
    assert.deepEqual(project.shots, []);
    assert.deepEqual(project.captions, []);
    assert.ok(!fs.existsSync(path.join(projectDir, project.voice.path)));
    if (style === 'B4') assert.equal(project.opening.preset, ratio === '9:16' ? 'b4-portrait-poster-v1' : 'b4-hook-v1');
    assert.equal(initialized.next_workflow.commands.length, 1);
    const hint = initialized.next_workflow.commands[0];
    assert.equal(hint[0], process.execPath);
    assert.equal(hint[1], CLI);
    assert.equal(option(hint, '--ratio'), ratio);
    success(cli(dir, ...hint.slice(2)));
    const before = tree(projectDir);
    const workflow = success(cli(dir, 'workflow', '--style', style, '--ratio', ratio, '--project', initialized.project));
    assertTemplateRoutes(workflow, projectDir);
    unverified(workflow);
    assert.deepEqual(tree(projectDir), before);
    rejected(cli(dir, 'validate', initialized.project, '--seconds', '5'), /ENOENT|Missing file/);
    assert.deepEqual(tree(projectDir), before, 'Missing narration must fail before rendering or creating approval');
  });
}

test('native init rejects combined B1–B4 formats and unsupported B5 ratio conversion before creating files', t => {
  const dir = temporary(t);
  for (const style of STYLES.slice(0, 4)) for (const ratio of ['both', '1:1']) {
    const output = path.join(dir, style + '-' + ratio.replace(':', '-'));
    rejected(cli(dir, 'init', output, '--style', style, '--ratio', ratio), /requires --ratio 16:9 or 9:16/);
    assert.ok(!fs.existsSync(output));
  }
  for (const ratio of [...RATIOS, 'both']) {
    const output = path.join(dir, 'B5-' + ratio.replace(':', '-'));
    rejected(cli(dir, 'init', output, '--style', 'B5', '--ratio', ratio), /B5 init has no ratio conversion/);
    assert.ok(!fs.existsSync(output));
  }
});

for (const style of STYLES) {
  test(`${style} project-scoped workflow checks the actual style and native format without modifying it`, t => {
    const dir = temporary(t), projectDir = path.join(dir, 'project');
    const project = {style, width: 1280, height: 720, formats: {'16:9': 'formats/landscape.json'}};
    const file = path.join(projectDir, 'project.json');
    save(file, project);
    if (style === 'B5') save(path.join(projectDir, 'scene/config.json'), {width: 1920, height: 1080});
    const before = tree(dir);
    for (const selected of [projectDir, file]) {
      const workflow = success(cli(dir, 'workflow', '--style', style, '--ratio', '16:9', '--project', selected));
      assertTemplateRoutes(workflow, projectDir);
      assert.equal(command(workflow, 'init')[3], projectDir);
      unverified(workflow);
    }
    rejected(cli(dir, 'workflow', '--style', style === 'B1' ? 'B2' : 'B1', '--ratio', '16:9', '--project', projectDir), /does not match project.style/);
    rejected(cli(dir, 'workflow', '--style', style, '--ratio', '9:16', '--project', projectDir), style === 'B6' ? /no separately authored plan/ : /ratio does not match/);
    assert.deepEqual(tree(dir), before);
  });
}

test('B5 init remains a historical scaffold with a dedicated unverified production workflow', t => {
  const dir = temporary(t), projectDir = path.join(dir, 'new-B5');
  const initialized = success(cli(dir, 'init', projectDir, '--style', 'B5'));
  const project = read(initialized.project);
  assert.equal(project.style, 'B5');
  assert.equal(project.renderer, 'character-explainer-code-v1');
  assert.match(initialized.stage, /not a generated new story/);
  unverified(initialized);
  const hint = initialized.next_workflow.commands;
  assert.equal(hint.length, 1);
  assert.equal(option(hint[0], '--ratio'), '16:9');
  const before = tree(projectDir);
  const workflow = success(cli(dir, 'workflow', '--style', 'B5', '--ratio', '16:9', '--project', projectDir));
  assertTemplateRoutes(workflow, projectDir);
  assert.deepEqual(tree(projectDir), before);
  assert.ok(!fs.existsSync(path.join(projectDir, 'output')));
});

test('B6 init preserves separate native plans for both formats and leaves authoring/review pending', t => {
  const dir = temporary(t), projectDir = path.join(dir, 'new-B6');
  const initialized = success(cli(dir, 'init', projectDir, '--style', 'B6', '--ratio', 'both'));
  const project = read(initialized.project);
  assert.equal(project.renderer, 'b6-production-v1');
  assert.equal(project.purpose, 'production');
  assert.equal(project.stage, 'needs_authoring');
  assert.equal(project.review.status, 'pending');
  assert.equal(project.voice, null);
  assert.deepEqual(Object.keys(project.formats).sort(), [...RATIOS].sort());
  assert.equal(initialized.next_workflow.commands.length, 2);
  assert.deepEqual(initialized.next_workflow.commands.map(argv => option(argv, '--ratio')), RATIOS);
  unverified(initialized);
  unverified(project);
  for (const ratio of RATIOS) {
    const plan = read(path.join(projectDir, project.formats[ratio]));
    assert.equal(plan.native_design, ratio);
    assert.deepEqual([plan.width, plan.height], ratio === '9:16' ? [720, 1280] : [1280, 720]);
    assert.deepEqual(plan.shots, []);
    const workflow = success(cli(dir, 'workflow', '--style', 'B6', '--ratio', ratio, '--project', projectDir));
    assertTemplateRoutes(workflow, projectDir);
    unverified(workflow);
  }
  assert.ok(!fs.existsSync(path.join(projectDir, 'outputs')), 'No candidate, evidence or approval has been produced');
});

test('installed B4 effect samples retain the original manifest hashes and are comparison references', t => {
  const dir = temporary(t);
  const originals = {
    'b4-dispatch.mp4': '9f69521a561d2bd51cee972c33ab7ce9f5238ac680cd573139a870ef8434da2b',
    'b4-death-clock.mp4': 'd63dbf0036c1f9bfea757c32136143f0b7998afec45579591c7cfe2541bfaddf'
  };
  const manifest = read(path.join(ROOT, 'assets/b4/approved-style.json'));
  const entries = manifest.publication.accepted_showcases;
  assert.equal(entries.length, Object.keys(originals).length);
  const workflow = success(cli(dir, 'workflow', '--style', 'B4', '--ratio', '16:9'));
  for (const entry of entries) {
    const name = path.basename(entry.repository_path);
    assert.equal(entry.sha256, originals[name], 'The accepted source manifest must not be replaced by a new test');
    const installed = path.join(ROOT, 'assets/b4/public-showcases', name);
    assert.equal(hash(installed), entry.sha256);
    const reference = workflow.references.find(item => item.path === installed);
    assert.equal(reference?.role, 'approved-effect-comparison');
    assert.match(reference.usage, /not new-story production footage/);
  }
  assert.deepEqual(tree(dir), []);
});
