// Installed, read-only routing. This describes existing gates; it cannot pass them.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const common = ['autopilot.md', 'autopilot-production-qa.md', 'autopilot-sound-system.md', 'b-delivery-completeness.md'];
const definitions = {
  B1: {production: ['b1-minimal-handdrawn.md', 'b1-production-qa.md', 'autopilot-runtime.md'], acceptance: ['b1-b2-b3-reference-acceptance.md'], samples: ['assets/b1/approved-2026-10-23.mp4'], author: 'Author story-specific drawing, varied readable acting, contact, sequential semantic builds and handwritten hierarchy; the pose demo is not the production target.'},
  B2: {production: ['b2-colorful-handdrawn.md', 'autopilot-runtime.md'], acceptance: ['b1-b2-b3-reference-acceptance.md'], samples: ['assets/b2/public-showcases/b2-colorful-sleep.mp4', 'assets/b2/public-showcases/b2-colorful-phone-weather.mp4'], author: 'Author warm paper, irregular fine ink, muted colored settings, contextual reactions and meaningful prop/state progression; keep B2 caption labels and do not import B1 acting or B3 finish.'},
  B3: {production: ['b3-television.md', 'b3-semantic-motion.md', 'autopilot-runtime.md'], acceptance: ['b1-b2-b3-reference-acceptance.md'], samples: ['assets/b3/public-showcases/b3-tv-night-signal.mp4', 'assets/b3/public-showcases/b3-tv-dog.mp4'], author: 'Author rounded artwork and cue-linked purposeful events/graphics with before/process/after; inspect clean contact first, then television finish. Noise and global movement cannot supply semantic motion.'},
  B4: {production: ['b4-survival-storytelling.md', 'b4-asset-origin.md', 'b4-picture-animation.md', 'b4-audio-direction.md', 'b4-opening-direction.md', 'autopilot-runtime.md'], acceptance: ['b4-repeatability-check.md', 'b4-typography-acceptance.md', 'b4-picture-animation.md'], samples: ['assets/b4/public-showcases/b4-dispatch.mp4', 'assets/b4/public-showcases/b4-death-clock.mp4'], author: 'Read the complete white-glove style lock and five drawing anchors. Create new story artwork, opening, local picture-state changes, text motion, native-rate Brian audio unless overridden, sound and production ledger. Every principal picture state/shot stays within the existing three-second gate.'},
  B5: {production: ['b5-first-preview.md', 'b5-character-explainer.md', 'b5-accepted-baselines.md', 'b5-avatar-motion.md', 'b5-left-stage-motion.md', 'b5-production-gate.md', 'b5-sound-qa.md'], acceptance: ['b5-first-preview.md'], samples: ['assets/b5/local-baselines/mei-event-relay/approved-sample.mp4', 'assets/b5/approved-sample.mp4'], author: 'Start from the neutral new-story stage. Read/view the latest approved Mei filled example, sample and actual source/rig, original prompt and scene template once. Fill the current script plan, author native layout and production metadata using approved voice/timings, then render and encode an internal candidate. One actual-candidate audiovisual review is the default; strict evidence/plan-lock/blind PNG workflows are opt-in.'},
  B6: {production: ['b6-dynamic-meme.md', 'b6-installed-production.md', 'b6-art-direction.md', 'b6-character-binding.md', 'b6-puppet-api.md', 'b6-native-formats.md', 'b6-code-runtime.md'], acceptance: ['b6-sample-1-acceptance.md', 'b6-motion-review.md'], samples: ['assets/b6/reference/eiffel-portrait-v44.mp4', 'assets/b6/reference/hong-kong-v90-20s.mp4'], author: 'Author new painted characters and wide layered worlds, calibrate per-view cuff/head/neck/limb/prop contacts, test action at a fixed camera, then native camera. Preserve irregular ink, meme expressions, soft light and Sample 1 relative limb weight. Walking needs authored stance/view/foot-contact work; the helper does not generate gait.'}
};

function requireRatio(ratio) {
  if (!['16:9', '9:16'].includes(ratio)) throw Error('Choose one native --ratio 16:9 or 9:16; design/review both formats separately');
}
function existing(relative) {
  const file = path.join(ROOT, relative);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw Error('Installed workflow resource missing: ' + relative);
  return file;
}
const docs = names => names.map(name => existing('references/' + name));
const step = (id, argv, condition) => ({id, argv, ...(condition ? {condition} : {})});

export function workflowHint(style, ratio) {
  const ratios = ratio === 'both' ? ['16:9', '9:16'] : [ratio || '16:9'];
  return {guide: existing('references/b-style-installed-workflow.md'), commands: ratios.map(r => [process.execPath, path.join(ROOT, 'scripts/autopilot.mjs'), 'workflow', '--style', style, '--ratio', r]), note: 'Read the selected production/acceptance references and author the new story before rendering. This is not an effect or approval result.'};
}

export function installedWorkflow({style, ratio = '16:9', project} = {}) {
  if (!Object.hasOwn(definitions, style)) throw Error('workflow requires --style B1, B2, B3, B4, B5 or B6');
  requireRatio(ratio);
  if (style === 'B4') checkB4InstalledSamples();
  let projectDir = '<NEW_PROJECT_DIR>';
  if (project) {
    const resolved = path.resolve(project);
    const file = fs.statSync(resolved).isDirectory() ? path.join(resolved, 'project.json') : resolved;
    const actual = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (actual.style !== style) throw Error('Selected workflow does not match project.style');
    if (['B1', 'B2', 'B3', 'B4'].includes(style) && (actual.width > actual.height ? '16:9' : '9:16') !== ratio) throw Error('Selected workflow ratio does not match native project dimensions');
    if (style === 'B6' && !actual.formats?.[ratio]) throw Error('B6 project has no separately authored plan for this ratio');
    if (style === 'B5') {
      const config = JSON.parse(fs.readFileSync(path.join(path.dirname(file), 'scene/config.json'), 'utf8'));
      if ((config.width > config.height ? '16:9' : '9:16') !== ratio) throw Error('Selected B5 workflow ratio does not match scene/config.json; author the native scene before preview');
    }
    projectDir = path.dirname(file);
  }
  const def = definitions[style], auto = [process.execPath, existing('scripts/autopilot.mjs')];
  const projectFile = path.join(projectDir, 'project.json');
  const at = (...parts) => path.join(projectDir, ...parts);
  const cmd = (action, ...args) => [...auto, action, projectFile, ...args];
  const review = name => path.join('<EXTERNAL_REVIEWS_DIR>', name);
  const templates = [], commands = [];
  commands.push(step('doctor', [...auto, 'doctor', '--style', style], 'Verify local dependencies; provider access, quota and paid generation need their own actual checks/authorization.'));
  const reviewCondition = 'Only after an independent reviewer inspects the current encoded media, full original-speed sound and actual reference playback; pending/failing observations require repair and fresh evidence.';
  const approvalCondition = 'Only with genuine user approval of this exact preview and authorization for the remaining production. Never copy this placeholder as an approval note.';
  if (['B1', 'B2', 'B3', 'B4'].includes(style)) {
    commands.push(step('init', [...auto, 'init', projectDir, '--style', style, '--ratio', ratio], 'Fresh external directory only; then author the script, assets, semantic captions, original-rate audio and native shots.'));
    if (style === 'B4') {
      commands.push(step('drawing-lock', [process.execPath, existing('scripts/b4-style-lock.mjs')]));
      commands.push(step('opening', [process.execPath, existing('scripts/b4-opening.mjs'), at('approved-opening.json'), at('opening-layers.json')], 'Author the actual opening input and merge the helper output into project.json; this helper does not author the body.'));
      commands.push(step('planning-ledger', [process.execPath, existing('scripts/b4-production-check.mjs'), at('b4-ledger.json'), '--planning'], 'Author the story-specific ledger. Planning mode cannot establish the final mix or sound review.'));
    }
    commands.push(step('validate-preview', cmd('validate', '--seconds', '<PREVIEW_SECONDS>')));
    commands.push(step('preview', cmd('preview', '--seconds', '<PREVIEW_SECONDS>'), 'Finish a representative range, normally about 20 seconds or the full opening when shorter; include the hard action, picture/text transitions and sound.'));
    if (style === 'B4') {
      for (const phase of ['preview', 'film']) for (const track of ['picture', 'typography']) templates.push({phase, track, path: at('output', `${phase}-${track}`, 'review-template.json'), created_by: phase === 'preview' ? 'preview' : 'render', initial_status: 'unknown'});
      commands.push(step('preview-audio', [process.execPath, existing('scripts/b4-opening-audio-check.mjs'), at('output/preview.mp4')]));
      commands.push(step('approve-preview', cmd('approve', '--text-review', review('b4-preview-text.json'), '--picture-review', review('b4-preview-picture.json'), '--note', '<ACTUAL_USER_APPROVAL_CONTEXT>'), reviewCondition + ' ' + approvalCondition));
    } else {
      for (const phase of ['preview', 'film']) templates.push({phase, track: 'reference-effects', path: at('output', `${phase}-reference`, 'review-template.json'), created_by: phase === 'preview' ? 'preview' : 'render', initial_status: 'unknown'});
      commands.push(step('approve-preview', cmd('approve', '--visual-review', review('preview-review.json'), '--note', '<ACTUAL_USER_APPROVAL_CONTEXT>'), reviewCondition + ' ' + approvalCondition));
    }
    commands.push(step('render-film', cmd('render'), 'After current preview review and genuine user authorization; complete later shots at the same quality.'));
    if (style === 'B4') {
      commands.push(step('film-audio', [process.execPath, existing('scripts/b4-opening-audio-check.mjs'), at('output/film.mp4')]));
      commands.push(step('production-ledger', [process.execPath, existing('scripts/b4-production-check.mjs'), at('b4-ledger.json')], 'Complete real final-mix/critical-SFX evidence and sound review; do not substitute --planning for the final check.'));
      commands.push(step('accept-film-text', cmd('accept-text', '--review', review('b4-film-text.json')), reviewCondition));
      commands.push(step('accept-film-picture', cmd('accept-picture', '--review', review('b4-film-picture.json')), reviewCondition));
    } else commands.push(step('accept-film', cmd('accept-visual', '--review', review('film-review.json')), reviewCondition));
  } else if (style === 'B5') {
    const b5 = [process.execPath, existing('scripts/character-explainer.mjs')];
    commands.push(step('init', [...auto, 'init', projectDir, '--style', style], 'Neutral new-story stage. Read/view the latest approved Mei filled example, actual sample, source/rig and original prompt; fill the Mei scene plan. Set scene/config.json and layout for the requested native ratio. Historical --reference-scaffold is inspection only.'));
    commands.push(step('validate', [...b5, 'validate', projectDir], 'Author the current script, Mei visual relay, production.json, identity, timing and approved mix. Structured reference-study, independent storyboard rehearsal and plan-lock are optional strict QA.'));
    commands.push(step('frames', [...b5, 'frames', projectDir, '--all', '--output', '<NEW_FRAMES_DIR>', '--trusted-code'], 'Inspect authored local code before executing. Use fresh external output directories. Do not produce a mandatory blind PNG review pack for an ordinary requested preview.'));
    commands.push(step('encode-candidate', [...b5, 'encode', projectDir, '--frames-dir', '<NEW_FRAMES_DIR>', '--audio', '<APPROVED_FINAL_MIX>', '--output', '<NEW_CANDIDATE_DIR>'], 'Encode an internal candidate, then perform the single actual-candidate review described in preview_review. Encoding is not visual acceptance.'));
  } else {
    const py = ['<PYTHON_EXECUTABLE>', at('run.py')], run = (action, ...args) => [...py, action, projectDir, '--ratio', ratio, ...args];
    const b6Review = 'Inspect the actual current preview and primary reference at original speed with sound, all cast/contacts and all 35 subchecks. Use an independent reviewer when available/permitted; otherwise record the actual inspector and limitation. Unviewed or failing effects remain pending and block a matched-quality claim.';
    commands.push(step('init', [...auto, 'init', projectDir, '--style', style, '--ratio', ratio], 'Fresh production authoring project, not a copied calibration/test/example.'));
    commands.push(step('validate', cmd('validate', '--ratio', ratio), 'Complete authored metadata, full-duration native plans/captions and original-speed mix first, even for a shorter preview.'));
    commands.push(step('preview', run('preview', '--trusted-code', '--seconds', '<PREVIEW_SECONDS>', '--output', 'outputs/preview-01'), 'Inspect scene.py first. Calibrate actual art/contacts at a fixed camera before testing the planned camera.'));
    commands.push(step('review-pack', run('review-pack', '--report', 'outputs/preview-01/report.json', '--output', 'outputs/review-01')));
    templates.push({phase: 'preview', track: 'motion-35-subchecks', path: at('outputs/review-01/motion-review.json'), created_by: 'review-pack', initial_status: 'pending'});
    commands.push(step('check-preview-review', run('check-review', '--report', 'outputs/preview-01/report.json', '--review', 'outputs/review-01/motion-review.json'), b6Review));
    commands.push(step('approve-preview', run('approve', '--report', 'outputs/preview-01/report.json', '--review', 'outputs/review-01/motion-review.json', '--note', '<ACTUAL_USER_APPROVAL_CONTEXT>'), approvalCondition));
    commands.push(step('render-film', run('render', '--trusted-code', '--output', 'outputs/film-01')));
    commands.push(step('film-review-pack', run('review-pack', '--report', 'outputs/film-01/report.json', '--output', 'outputs/film-review-01')));
    templates.push({phase: 'film', track: 'motion-35-subchecks', path: at('outputs/film-review-01/motion-review.json'), created_by: 'film-review-pack', initial_status: 'pending'});
    commands.push(step('check-film-review', run('check-review', '--report', 'outputs/film-01/report.json', '--review', 'outputs/film-review-01/motion-review.json'), b6Review));
  }
  const completenessCommands = [
    step('init-delivery-completeness', [process.execPath, existing('scripts/b-delivery-completeness.mjs'), 'init', '--style', style, '--ratio', ratio, '--media', '<CURRENT_ENCODED_MP4>', '--output', '<NEW_COMPLETENESS_REVIEW_JSON>'], 'Every preview and final scope: prepare after encoding; all fields remain unchecked until actual selected-sample comparison, picture playback and encoded-audio listening.'),
    step('check-delivery-completeness', [process.execPath, existing('scripts/b-delivery-completeness.mjs'), 'check', '<COMPLETED_COMPLETENESS_REVIEW_JSON>'], 'Mandatory alongside original style gates before claiming complete delivery; default captions, meaningful SFX and music must actually be present. Missing tools/review/source rights remain incomplete.')
  ];
  // B5's ordinary requested preview records completeness in its one actual-candidate
  // review. Formal native-evidence/completeness JSON is reserved for strict QA/final.
  if (style !== 'B5') commands.push(...completenessCommands);
  const samplePaths = [...def.samples];
  if (ratio === '9:16' && ['B1', 'B2', 'B3'].includes(style)) samplePaths.push(`assets/${style.toLowerCase()}/portrait-approved-2026-11-13.mp4`);
  if (ratio === '9:16' && style === 'B4') samplePaths.push('assets/b4/portrait-opening-approved.mp4');
  const result = {
    schema: 'b-style-installed-workflow/1', read_only: true, style, ratio,
    status: 'guide_only', quality_verified: false, guide: existing('references/b-style-installed-workflow.md'),
    production: {documents: docs([...common, ...def.production, ...(ratio === '9:16' && ['B1', 'B2', 'B3'].includes(style) ? ['b1-b2-b3-native-portrait.md'] : [])]), authoring: def.author},
    acceptance: {documents: docs(def.acceptance), rule: 'Compare actual encoded playback with the selected approved references. Technical checks, independent creative review and genuine user acceptance remain separate. Repair observed failures within existing authorization; a missing tool/review stays disclosed and pending, never a fabricated pass.'},
    references: samplePaths.map(relative => ({path: existing(relative), role: style === 'B6' ? relative.includes('v44') ? 'strict-primary-style-and-animation' : 'secondary-binding-engineering' : 'approved-effect-comparison', usage: 'Compare at original speed with sound; not new-story production footage or an asset bank.'})),
    templates: {rule: style === 'B5' ? 'Ordinary preview: a concise actual-review note is sufficient; no generated QA JSON is required. Strict formal evidence templates remain opt-in.' : 'Generated only from the current encoded candidate. Use these real schemas, not a generic static template. Agents complete actual observations; users need not fill JSON. Rebuild stale evidence after bound input/media changes.', items: templates},
    commands,
    ...(style === 'B5' ? {
      preview_review: {
        mode: 'standard_preview',
        scope: 'One normal-speed review of the actual requested candidate with sound: compare successive lead-visual handoffs, richness, figure proportions/contact, captions and audio with the approved standard. Inspect suspect frames only as needed.',
        repair: 'Repair observed failures locally, then check the affected interval and its neighbors. Reuse unchanged reviewed material. Do not restart full blind review or create strict JSON merely to deliver a requested preview.',
        record: 'Save a short truthful note identifying the candidate, observed issues/fixes and actual review scope. If continuous playback/listening is unavailable, disclose it and return the requested preview for user review without claiming a matched-quality pass; do not substitute repeated full image-review loops.',
        completeness: 'Use this same review to inspect complete semantic captions, meaningful SFX and background music against the selected B5 sample. Retain the existing script, spotting and actual source/rights records; include findings, fixes and listening limits in the concise candidate note. No extra review round or completeness JSON is required for an ordinary requested preview. Missing or unresolved elements remain disclosed and pending.',
        strict_qa: {opt_in: true, completeness_commands: completenessCommands, guide: existing('references/b5-visual-acceptance.md'), selector: 'encode --strict-review (PNG review flags also select strict mode)', note: 'Formal plan-lock, independent blind PNG/seal/contextual evidence and per-event review packs remain available for explicit full QA or targeted diagnosis.'}
      }
    } : {}),
    delivery: ['Whole-film playback with original-speed sound; semantic captions cover actual speech in order; inspect all cast/contact/cut boundaries.', 'Preserve the original approved showcase. Deliver the requested new story plus containing-folder link, sidecars, source/checkpoint and truthful QA scope.', 'No command here creates user approval, extra budget, paid calls, uploads or publication authority.'],
    limitations: style === 'B5' ? ['Review the requested preview before extending to a full film when the user asked for a preview first. Update affected output when inputs change; formal evidence invalidation applies only to the selected strict workflow. There is no generic B5 approve/render command.', 'Outputs/reviews belong outside the project; adding them changes its fingerprint. No default repeat cold start, independent blind audit or publication is implied.'] : style === 'B6' ? ['The full project is fingerprinted; later authored input/plan/audio changes invalidate its approval. Each ratio needs its own current preview/review/approval.', 'The primary Sample 1 remains portrait V44 even for native landscape. All 35 subchecks, original-speed AV and final visible character evidence are required.', 'Select the Python interpreter verified by doctor (B6_PYTHON/venv). The full film is outputs/film-01/preview.mp4; its technical report remains pending until the final actual-media review.'] : ['The initialized empty manifest does not author native compositions or media. Preview and full film have different evidence/review records.']
  };
  return result;
}

export function checkB4InstalledSamples() {
  const manifest = JSON.parse(fs.readFileSync(existing('assets/b4/approved-style.json'), 'utf8'));
  for (const item of manifest.publication.accepted_showcases) {
    const file = existing('assets/b4/public-showcases/' + path.basename(item.repository_path));
    if (crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') !== item.sha256) throw Error('B4 installed effect sample changed: ' + file);
  }
  return true;
}
