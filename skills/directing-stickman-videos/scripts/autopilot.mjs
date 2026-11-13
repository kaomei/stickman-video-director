#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT, STYLES, FFMPEG, FFPROBE, run, probe, loadProject, outputDir, save, json, hashFile, groupWords} from './autopilot-core.mjs';
import {BRIAN} from './b4-runtime.mjs';
import {B4_HOOK} from './b4-opening.mjs';
import {initB5} from './character-explainer.mjs';

const [command, ...args] = process.argv.slice(2);
const option = (flag, fallback) => args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback;
async function main() {
  if (command === 'doctor') {
    const checks = {node: Number(process.versions.node.split('.')[0]) >= 20};
    for (const [name, exe] of [['ffmpeg', FFMPEG], ['ffprobe', FFPROBE]]) try { run(exe, ['-version']); checks[name] = true; } catch { checks[name] = false; }
    try { await import('@napi-rs/canvas'); checks.canvas = true; } catch { checks.canvas = false; }
    try { await import('sharp'); checks.sharp = true; } catch { checks.sharp = false; }
    checks.fonts = ['Caveat.ttf', 'NotoSans.ttf', 'Nunito.ttf'].every(f => { const file = path.join(ROOT, 'assets/fonts', f); return fs.existsSync(file) && fs.statSync(file).size > 10000; });
    checks.b4_hook_font = fs.existsSync(path.join(ROOT, 'assets/fonts/Nunito.ttf')) && hashFile(path.join(ROOT, 'assets/fonts/Nunito.ttf')) === B4_HOOK.font_sha256;
    if (option('--style') === 'B6') {
      const r = spawnSync(option('--python', process.env.B6_PYTHON || 'python3'), ['-c', 'import sys,numpy,PIL,cv2; assert sys.version_info >= (3,9); print("ok")'], {encoding: 'utf8'});
      checks.b6_python_paint_dependencies = r.status === 0;
      const {checkPublicCaptionFont} = await import('./b6-fonts.mjs');
      try { checks.b6_public_caption_font = checkPublicCaptionFont(ROOT).ok; } catch { checks.b6_public_caption_font = false; }
      const {checkPack} = await import('./b6-dynamic-meme.mjs');
      try { checks.b6_complete_pack = checkPack().ok; } catch { checks.b6_complete_pack = false; }
    }
    console.log(JSON.stringify({checks, gemini_key_present: Boolean(process.env.GEMINI_API_KEY), network_checked: false, note: 'Key presence is not quota/billing verification'}, null, 2));
    if (Object.values(checks).some(v => !v)) process.exitCode = 1;
  } else if (command === 'probe') console.log(JSON.stringify(probe(path.resolve(args[0])), null, 2));
  else if (command === 'init') {
    if (!args[0]) throw new Error('Project directory required');
    const style = option('--style', 'B1');
    if (style === 'B6') { const {initB6} = await import('./b6-dynamic-meme.mjs'); console.log(JSON.stringify(initB6(args[0], option('--ratio'), option('--example')))); return; }
    if (style === 'B5') { console.log(JSON.stringify(initB5(args[0]))); return; }
    if (!STYLES.includes(style)) throw new Error('Choose style B1, B2, B3, B4, B5 or B6');
    const dir = path.resolve(args[0]); if (fs.existsSync(dir)) throw new Error('Project directory already exists; will not overwrite');
    if (dir.startsWith(ROOT + path.sep)) throw new Error('Create projects outside the installed Skill');
    fs.mkdirSync(dir, {recursive: true});
    save(path.join(dir, 'project.json'), {version: 1, style, width: 1280, height: 720, fps: 30, voice: {path: 'narration.wav', lead: 0, tail: 0, ...(style === 'B4' ? BRIAN : {})}, captions: [], shots: [], sfx: [], ...(['B1', 'B2', 'B3'].includes(style) ? {reference_review: {author_id: '', capability: {mode: 'sample_target', environment: '', limitations: []}}} : {}), ...(style === 'B3' ? {television: {enabled: true, intensity: 0.45}} : {}), ...(style === 'B4' ? {ambience: [], dialogue: [], audio_cuts: [], picture_motion: {author_id: '', shots: []}, opening: {version: 1, preset: B4_HOOK.id, shadow: '', setup: '', payoff: '', picture: {before: '', after: '', meaning: '', region: {}}}} : {})});
    console.log(JSON.stringify({project: path.join(dir, 'project.json'), stage: 'scaffold; add approved narration, aligned captions and authored scenes before rendering'}));
  } else if (command === 'captions') {
    if (!args[0] || !args[1]) throw new Error('Aligned word input and output file required');
    if (fs.existsSync(args[1])) throw new Error('Caption output exists; will not overwrite');
    save(args[1], groupWords(json(args[0]), Number(option('--lead', 0))));
    console.log(JSON.stringify({output: path.resolve(args[1])}));
  } else if (['validate', 'preview', 'approve', 'render', 'accept-text', 'accept-picture', 'accept-visual', 'review-pack', 'check-review'].includes(command)) {
    const possibleProject = args[0] && path.resolve(args[0]);
    const possibleB6 = possibleProject && (fs.statSync(possibleProject).isDirectory() ? path.join(possibleProject, 'project.json') : possibleProject);
    if (possibleB6 && json(possibleB6).style === 'B6') { const {runB6} = await import('./b6-dynamic-meme.mjs'); console.log(JSON.stringify(await runB6(command, args), null, 2)); return; }
    if (['review-pack', 'check-review'].includes(command)) throw new Error('Motion review commands currently apply to the B6 production renderer only');
    if (args[0] && json(path.resolve(args[0])).style === 'B5') throw new Error('B5 uses the code-authored route: node scripts/character-explainer.mjs --help; not the B1–B4 manifest renderer');
    const scoped = command === 'preview' || command === 'validate' && args.includes('--seconds');
    const seconds = scoped ? Number(option('--seconds', 20)) : undefined;
    if (scoped && (!Number.isFinite(seconds) || seconds <= 0 || seconds > 60)) throw new Error('Preview length must be greater than 0 and at most 60 seconds');
    let p;
    if (command !== 'approve') p = loadProject(args[0], scoped ? {seconds} : {});
    if (command === 'validate') {
      const {painter} = await import('./autopilot-render.mjs'); const draw = await painter(p);
      for (const cue of p.captions) draw(Math.min(p.rangeEnd - 0.001, (cue.start + cue.end) / 2));
      const opening_visual = p.style === 'B4' ? await (await import('./b4-opening-visual-check.mjs')).checkB4OpeningPaint(p, {draw, picture: await painter(p, {pictureOnly: true})}) : undefined;
      const typography = p.style === 'B4' ? await (await import('./b4-typography-review.mjs')).checkB4TypographyPaint(p, {draw}) : undefined;
      const picture_motion = p.style === 'B4' ? await (await import('./b4-picture-review.mjs')).checkB4PicturePaint(p, {draw, picture: await painter(p, {pictureOnly: true})}) : undefined;
      const portrait = await (await import('./b-style-portrait-paint.mjs')).checkBStylePortraitPaint(p, draw);
      const b3_semantics = p.style === 'B3' ? (await import('./b3-semantic-motion.mjs')).planB3Semantics(p) : undefined;
      console.log(JSON.stringify({typography, ...(picture_motion ? {picture_motion} : {}), ...(portrait ? {portrait} : {}), ...(b3_semantics ? {b3_semantics} : {}), valid: true, ...(['B1', 'B2', 'B3', 'B4'].includes(p.style) ? {status: 'technical_only', visual_acceptance: 'not_reviewed', delivery_ready: false} : {}), fingerprint: p.fingerprint, duration: p.duration, checked_seconds: p.rangeEnd, shots: p.shots.length, ...(opening_visual ? {opening_visual} : {})})); return;
    }
    const base = p?.base ?? path.dirname(fs.realpathSync(path.resolve(args[0])));
    const out = outputDir(p ?? {base, inputs: []}), approvalPath = path.join(out, 'approval.json'), reportPath = path.join(out, 'preview-report.json');
    if (command === 'accept-visual') {
      if (!['B1', 'B2', 'B3'].includes(p.style)) throw new Error('accept-visual is the B1/B2/B3 sample-effect review gate');
      if (!option('--review')) throw new Error('accept-visual requires --review REVIEW_JSON');
      const reviewFile = fs.realpathSync(path.resolve(option('--review'))), filmReport = json(path.join(out, 'film-report.json'));
      if (filmReport.fingerprint !== p.fingerprint || filmReport.output !== path.join(out, 'film.mp4') || hashFile(filmReport.output) !== filmReport.output_sha256) throw new Error('Film changed; render current reference evidence again');
      const acceptance = await (await import('./b-style-reference-review.mjs')).verifyBStyleReferenceReview(p, {file: filmReport.output, evidenceDir: path.join(out, 'film-reference'), reviewFile, projectFingerprint: p.fingerprint, ffmpeg: FFMPEG, ffprobe: FFPROBE});
      const acceptedPath = path.join(out, 'film-reference-acceptance.json'); save(acceptedPath, acceptance);
      console.log(JSON.stringify({reference_acceptance: acceptedPath, ...acceptance})); return;
    }
    if (command === 'accept-text') {
      if (p.style !== 'B4') throw new Error('accept-text is the B4 typography review gate');
      if (!option('--review')) throw new Error('accept-text requires --review REVIEW_JSON');
      const reviewFile = fs.realpathSync(path.resolve(option('--review')));
      const filmReport = json(path.join(out, 'film-report.json'));
      if (filmReport.fingerprint !== p.fingerprint || filmReport.output !== path.join(out, 'film.mp4') || hashFile(filmReport.output) !== filmReport.output_sha256) throw new Error('Film changed; render current evidence again');
      const {painter} = await import('./autopilot-render.mjs');
      const acceptance = await (await import('./b4-typography-review.mjs')).verifyB4TypographyReview(p, {file: filmReport.output, draw: await painter(p), evidenceDir: path.join(out, 'film-typography'), reviewFile, projectFingerprint: p.fingerprint, ffmpeg: FFMPEG, ffprobe: FFPROBE});
      const acceptedPath = path.join(out, 'film-typography-acceptance.json'); save(acceptedPath, acceptance);
      console.log(JSON.stringify({typography_acceptance: acceptedPath, scope: 'typography only; other visual/audio and user acceptance remain required'})); return;
    }
    if (command === 'accept-picture') {
      if (p.style !== 'B4') throw new Error('accept-picture is the B4 picture animation review gate');
      if (!option('--review')) throw new Error('accept-picture requires --review REVIEW_JSON');
      const reviewFile = fs.realpathSync(path.resolve(option('--review'))), filmReport = json(path.join(out, 'film-report.json'));
      if (filmReport.fingerprint !== p.fingerprint || filmReport.output !== path.join(out, 'film.mp4') || hashFile(filmReport.output) !== filmReport.output_sha256) throw new Error('Film changed; render current picture evidence again');
      const {painter} = await import('./autopilot-render.mjs');
      const acceptance = await (await import('./b4-picture-review.mjs')).verifyB4PictureReview(p, {file: filmReport.output, draw: await painter(p), picture: await painter(p, {pictureOnly: true}), evidenceDir: path.join(out, 'film-picture'), reviewFile, projectFingerprint: p.fingerprint, ffmpeg: FFMPEG, ffprobe: FFPROBE});
      const acceptedPath = path.join(out, 'film-picture-acceptance.json'); save(acceptedPath, acceptance);
      console.log(JSON.stringify({picture_acceptance: acceptedPath, ...acceptance})); return;
    }
    let report, reviewed, textAcceptance, textReviewFile, pictureAcceptance, pictureReviewFile, referenceAcceptance, visualReviewFile;
    if (command === 'approve' || command === 'render') {
      if (command === 'render' && (!fs.existsSync(approvalPath) || !fs.existsSync(reportPath))) throw new Error('Full production requires user-approved preview');
      if (!fs.existsSync(reportPath)) throw new Error('Render and review a preview first');
      report = json(reportPath);
      const error = command === 'render' ? 'Approval invalidated; preview and user approval required again' : 'Preview changed; render/review it again';
      if (!Number.isFinite(report.preview_seconds) || report.preview_seconds <= 0 || report.preview_seconds > 60) throw new Error(error);
      reviewed = loadProject(args[0], {seconds: report.preview_seconds});
      outputDir(reviewed);
      if (report.fingerprint !== reviewed.fingerprint || report.output !== path.join(out, 'preview.mp4') || !fs.existsSync(report.output) || hashFile(report.output) !== report.output_sha256) throw new Error(error);
      if (['B1', 'B2', 'B3'].includes(reviewed.style)) {
        visualReviewFile = command === 'approve' ? option('--visual-review') : json(approvalPath).visual_review_file;
        if (!visualReviewFile) throw new Error('B1/B2/B3 preview requires independent sample-effect review: approve --visual-review REVIEW_JSON');
        visualReviewFile = fs.realpathSync(path.resolve(visualReviewFile));
        if (command === 'render' && hashFile(visualReviewFile) !== json(approvalPath).visual_review_sha256) throw new Error('Sample-effect review changed; review and approve current preview again');
        referenceAcceptance = await (await import('./b-style-reference-review.mjs')).verifyBStyleReferenceReview(reviewed, {file: report.output, evidenceDir: path.join(out, 'preview-reference'), reviewFile: visualReviewFile, projectFingerprint: reviewed.fingerprint, ffmpeg: FFMPEG, ffprobe: FFPROBE});
      }
      if (reviewed.style === 'B4' && report.opening_audio?.status !== 'diagnostic_pass' &&
        !(typeof reviewed.opening_audio_override === 'string' && reviewed.opening_audio_override.trim())) throw new Error('B4 opening audio needs review; repair it or record a story-motivated opening_audio_override before approval');
      if (reviewed.style === 'B4') {
        if (report.opening_visual?.output_sha256 !== report.output_sha256 || !['diagnostic_pass', 'user_exception'].includes(report.opening_visual?.status)) throw new Error('B4 opening visual evidence missing; render and review the current preview again');
        const {painter} = await import('./autopilot-render.mjs');
        // Recheck the actual MP4; an edited report must not waive the gate.
        await (await import('./b4-opening-visual-check.mjs')).checkB4OpeningFile(reviewed, report.output, {draw: await painter(reviewed), picture: await painter(reviewed, {pictureOnly: true})});
        textReviewFile = command === 'approve' ? option('--text-review') : json(approvalPath).text_review_file;
        if (!textReviewFile) throw new Error('B4 preview requires independent typography review: approve --text-review REVIEW_JSON');
        textReviewFile = fs.realpathSync(path.resolve(textReviewFile));
        if (command === 'render' && hashFile(textReviewFile) !== json(approvalPath).text_review_sha256) throw new Error('Typography review changed; review and approve current preview again');
        textAcceptance = await (await import('./b4-typography-review.mjs')).verifyB4TypographyReview(reviewed, {file: report.output, draw: await painter(reviewed), evidenceDir: path.join(out, 'preview-typography'), reviewFile: textReviewFile, projectFingerprint: reviewed.fingerprint, ffmpeg: FFMPEG, ffprobe: FFPROBE});
        pictureReviewFile = command === 'approve' ? option('--picture-review') : json(approvalPath).picture_review_file;
        if (!pictureReviewFile) throw new Error('B4 preview requires independent picture animation review: approve --picture-review REVIEW_JSON');
        pictureReviewFile = fs.realpathSync(path.resolve(pictureReviewFile));
        if (command === 'render' && hashFile(pictureReviewFile) !== json(approvalPath).picture_review_sha256) throw new Error('Picture animation review changed; review and approve current preview again');
        pictureAcceptance = await (await import('./b4-picture-review.mjs')).verifyB4PictureReview(reviewed, {file: report.output, draw: await painter(reviewed), picture: await painter(reviewed, {pictureOnly: true}), evidenceDir: path.join(out, 'preview-picture'), reviewFile: pictureReviewFile, projectFingerprint: reviewed.fingerprint, ffmpeg: FFMPEG, ffprobe: FFPROBE});
      }
    }
    if (command === 'approve') {
      const note = option('--note', ''); if (!note.trim()) throw new Error('A note recording genuine user approval is required');
      save(approvalPath, {...(referenceAcceptance ? {visual_review_file: visualReviewFile, visual_review_sha256: hashFile(visualReviewFile), reference_acceptance: referenceAcceptance} : {}), ...(textAcceptance ? {text_review_file: textReviewFile, text_review_sha256: hashFile(textReviewFile), typography_acceptance: textAcceptance} : {}), ...(pictureAcceptance ? {picture_review_file: pictureReviewFile, picture_review_sha256: hashFile(pictureReviewFile), picture_acceptance: pictureAcceptance} : {}), preview_fingerprint: reviewed.fingerprint, preview_seconds: report.preview_seconds, preview_sha256: report.output_sha256, note, approved_at: new Date().toISOString()});
      console.log(JSON.stringify({approval: approvalPath})); return;
    }
    if (command === 'render') {
      const a = json(approvalPath);
      if (a.preview_fingerprint !== reviewed.fingerprint || a.preview_seconds !== report.preview_seconds || a.preview_sha256 !== report.output_sha256) throw new Error('Approval invalidated; preview and user approval required again');
    }
    const {render} = await import('./autopilot-render.mjs'); console.log(JSON.stringify(await render(p, {full: command === 'render', seconds, replace: args.includes('--replace')}), null, 2));
  } else throw new Error('Commands: doctor | probe FILE | init DIR | review-pack B6_PROJECT --ratio R --report FILE --output outputs/review | check-review B6_PROJECT --ratio R --review FILE | captions WORDS OUTPUT [--lead N] | validate PROJECT [--seconds N] | preview PROJECT [--seconds N] [--replace] | approve PROJECT --note TEXT [--visual-review REVIEW_JSON] [--text-review REVIEW_JSON] [--picture-review REVIEW_JSON] | render PROJECT [--replace] | accept-text PROJECT --review REVIEW_JSON | accept-picture PROJECT --review REVIEW_JSON | accept-visual PROJECT --review REVIEW_JSON');
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
