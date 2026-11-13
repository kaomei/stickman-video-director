import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createCanvas, loadImage} from '@napi-rs/canvas';
import {FFMPEG, hashFile, mediaPath} from './autopilot-core.mjs';
import {planB4Opening} from './b4-opening.mjs';

function pixels(canvas) {
  const c = createCanvas(320, Math.round(320 * canvas.height / canvas.width));
  c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
  return {data: c.getContext('2d').getImageData(0, 0, c.width, c.height).data, width: c.width, height: c.height};
}
function delta(a, b, region, inside = true) {
  let sum = 0, changed = 0, n = 0;
  for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) {
    const hit = !region || x >= region.x / 4 && x < (region.x + region.w) / 4 && y >= region.y / 4 && y < (region.y + region.h) / 4;
    if (region && hit !== inside) continue;
    const i = (y * a.width + x) * 4;
    const d = (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2])) / (3 * 255);
    sum += d; changed += d > .07 ? 1 : 0; n++;
  }
  return {mean: sum / Math.max(n, 1), changed_fraction: changed / Math.max(n, 1)};
}
const capture = (draw, t) => pixels(draw(t));
const fail = text => { throw new Error(`B4 opening visual: ${text}`); };

// The picture-only painter excludes all title/caption/shadow/line layers. This
// prevents subtitle swaps, flashes or an animated underline satisfying the gate.
export async function checkB4OpeningPaint(p, {draw, picture}) {
  const plan = planB4Opening(p, {hashFile, mediaPath});
  if (!plan || plan.status === 'user_exception') return plan;
  const {times: t, region} = plan;
  const before = capture(picture, t.before), after = capture(picture, t.after), hold = capture(picture, t.hold);
  const pictureChange = delta(before, after, region), heldChange = delta(before, hold, region);
  const outside = delta(before, after, region, false);
  if (pictureChange.mean < .012 || pictureChange.changed_fraction < .025 || heldChange.mean < .012 || heldChange.changed_fraction < .025) fail('principal picture does not visibly change and hold; missing, hidden, tiny or flash-only action');
  if (outside.mean > Math.max(.012, pictureChange.mean * .35)) fail('change is not localized to the authored subject/prop; check whole-image drift, lighting or mismatched art');
  const transition = capture(picture, t.transition);
  const transitionStart = delta(before, transition, region), transitionEnd = delta(after, transition, region);
  if (Math.min(transitionStart.mean, transitionEnd.mean) < pictureChange.mean * .12) fail('local reveal has no visible intermediate state; a static picture switch is not animated acting');
  // Verify the actual composite too: an opaque overlay must not hide the action.
  const compositeChange = delta(capture(draw, t.before), capture(draw, t.after), region);
  if (compositeChange.mean < pictureChange.mean * .55 || compositeChange.changed_fraction < .02) fail('principal picture action is obscured in the final composition');
  const titleInk = plan.title_regions.map(r => {
    const visible = capture(draw, t.hold), omitted = pixels(draw(t.hold, {omitIds: [r.id]}));
    const ink = delta(visible, omitted, r);
    if (ink.mean < .006 || ink.changed_fraction < .01) fail(`title/emphasis ${r.id} is hidden, illegible or not visibly painted`);
    return {id: r.id, ...ink};
  });
  const settle = delta(capture(draw, t.emphasis), pixels(draw(t.emphasis, {hookSettled: true})), plan.title_regions[1]);
  if (settle.mean < .0015 || settle.changed_fraction < .006) fail('fixed payoff settle is not visibly painted; a timed title alone is not emphasis');
  let accentInk;
  if (plan.underline_region) {
    const r = plan.underline_region, settled = capture(draw, t.mark_hold);
    accentInk = delta(settled, pixels(draw(t.mark_hold, {omitIds: [r.id]})), r);
    const first = capture(draw, t.mark_start), mid = capture(draw, t.mark_mid);
    if (accentInk.mean < .01 || accentInk.changed_fraction < .04 || delta(first, mid, r).mean < .005 || delta(mid, settled, r).mean < .005) fail('portrait emphasis line must be visibly hand-drawn and held, not metadata-only');
  }
  return {...plan, status: 'paint_diagnostic_pass', metrics: {picture_change: pictureChange, held_change: heldChange, outside_change: outside, composite_change: compositeChange, transition_from_before: transitionStart, transition_from_after: transitionEnd},
    title_ink: titleInk, settle_reference: settle, ...(accentInk ? {accent_ink: accentInk} : {}),
    human_review: 'required: copy meaning, fear/acting, readability, coherent art/anatomy and audio/visual sync are not established by pixel checks'};
}

async function decodedFrame(file, time) {
  const r = spawnSync(FFMPEG, ['-v', 'error', '-ss', String(time), '-i', file, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', 'pipe:1'], {maxBuffer: 32 * 1024 * 1024});
  if (r.error || r.status !== 0 || !r.stdout?.length) fail(`cannot decode exported opening frame at ${time}s`);
  const img = await loadImage(r.stdout), c = createCanvas(img.width, img.height);
  c.getContext('2d').drawImage(img, 0, 0); return c;
}

export async function checkB4OpeningFile(p, file, painters, {contactSheet} = {}) {
  const report = await checkB4OpeningPaint(p, painters);
  if (!report || report.status === 'user_exception') return {...report, output_sha256: hashFile(file)};
  const sampleHeight = Math.round(320 * p.height / p.width);
  const samples = [], sheet = createCanvas(960, sampleHeight * Math.ceil(Object.keys(report.times).length / 3)), ctx = sheet.getContext('2d');
  for (const [i, [phase, t]] of Object.entries(report.times).entries()) {
    const actual = await decodedFrame(file, t), expected = capture(painters.draw, t), got = pixels(actual);
    const difference = delta(expected, got), regional = delta(expected, got, report.region);
    if (difference.mean > .025 || difference.changed_fraction > .06 || regional.mean > .025 || regional.changed_fraction > .06) fail(`exported ${phase} frame does not match authored timing/art; render and review the current opening again`);
    const title = report.title_regions.map((r, j) => {
      const d = delta(expected, got, r), ink = report.title_ink[j];
      if (d.mean > Math.max(.003, ink.mean * .25) || d.changed_fraction > Math.max(.01, ink.changed_fraction * .35)) fail(`exported ${phase} frame has missing or mistimed title/emphasis; render and review the current opening again`);
      return {id: r.id, ...d};
    });
    if (report.underline_region) {
      const r = report.underline_region, d = delta(expected, got, r), ink = report.accent_ink;
      const omitted = pixels(painters.draw(t, {omitIds: [r.id]})), visibleInk = delta(expected, omitted, r);
      // A thin coral line loses more chroma detail than large glyphs in 4:2:0.
      // Bound codec error and separately require the export to match the
      // actual line better than the composition with that line removed.
      if (d.mean > Math.max(.003, ink.mean * .45) || d.changed_fraction > Math.max(.01, ink.changed_fraction * .55) ||
        visibleInk.mean > .01 && d.mean >= delta(omitted, got, r).mean * .65) fail(`exported ${phase} frame has missing or mistimed portrait emphasis line`);
      if (phase === 'mark_mid') {
        const endpoints = [report.times.mark_start, report.times.mark_hold].map(at => delta(capture(painters.draw, at), got, r).mean);
        if (d.mean >= Math.min(...endpoints) * .75) fail('exported portrait emphasis line is frozen or switched, not visibly drawn');
      }
    }
    if (phase === 'emphasis') {
      const frozen = pixels(painters.draw(t, {hookSettled: true}));
      const animatedError = delta(expected, got, report.title_regions[1]);
      const frozenError = delta(frozen, got, report.title_regions[1]);
      if (animatedError.mean >= frozenError.mean * .75) fail('exported payoff settle is missing or frozen; a configuration keyframe is not evidence of rendered motion');
    }
    if (phase === 'transition') {
      const animatedError = delta(expected, got, report.region);
      const endpointErrors = [report.times.before, report.times.after].map(time => delta(capture(painters.draw, time), got, report.region).mean);
      if (animatedError.mean >= Math.min(...endpointErrors) * .75) fail('exported picture transition is missing or frozen; static state switches are not micro-animation');
    }
    ctx.drawImage(actual, i % 3 * 320, Math.floor(i / 3) * sampleHeight, 320, sampleHeight);
    samples.push({phase, time: t, difference, regional, title});
  }
  if (contactSheet) fs.writeFileSync(contactSheet, sheet.toBuffer('image/png'));
  return {...report, status: 'diagnostic_pass', output_sha256: hashFile(file), samples, ...(contactSheet ? {contact_sheet: contactSheet} : {})};
}
