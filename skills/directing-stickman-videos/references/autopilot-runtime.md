# Autopilot runtime

Run from this installed Skill's directory. No second Skill or repository is needed.

```bash
npm ci
node scripts/autopilot.mjs doctor
node scripts/autopilot.mjs init /absolute/path/my-video
```

Install Node 20+ and FFmpeg/FFprobe using your platform's normal installer. Optional `FFMPEG`, `FFPROBE`, and `AUTOPILOT_FONT` environment variables select executables/font files; no macOS/Homebrew paths are hardcoded. The bundled Caveat font covers Latin; choose a suitable CJK/Arabic/etc font for those languages. The CLI fails on unavailable dependencies rather than silently generating a mute/placeholder film.

## Manifest v1

The bundled runtime accepts `style: B1`, `B2`, `B3` and `B4`. B1 keeps its white grid and original caption treatment. B2 uses warm paper without a grid and dark captions on an ivory paper label (40 design-unit default text). Select B2 explicitly and author its own colored scene/prop/character image layers; the B1 `pose` atlas is rejected in B2. The JSON excerpt below remains a B1 example, not a B2 art template. See [B2](b2-colorful-handdrawn.md) for its independent production defaults.

[B3 Retro TV Style](b3-television.md) is explicitly selected with `style: B3`. It uses a dark field, story-specific white/gray artwork, clean white uppercase semantic captions and an optional restrained television finish. Gemini Bodi is the showcase voice, not a required provider or voice. Its layered artwork is described below; it does not reuse the B1 pose atlas or B2 paper-caption design.

All media paths are relative to `project.json` (or absolute local paths); `@b1/…` addresses bundled original B1 assets. Remote URLs and executable expressions are not accepted. Output is a separate project-local `output/` directory. Keep user/source files outside it.

```json
{
  "version": 1,
  "style": "B1",
  "width": 1280, "height": 720, "fps": 30,
  "voice": {"path": "narration.wav", "lead": 0.15, "tail": 0.35},
  "captions": [{"start": 0.3, "end": 2.5, "text": "Your spoken phrase."}],
  "shots": [{
    "start": 0, "end": 3,
    "layers": [
      {"type": "text", "text": "YOUR IDEA.", "x": 90, "y": 150, "size": 58, "bold": true},
      {"type": "pose", "pose": 1, "x": 710, "y": 20, "w": 450},
      {"type": "image", "id": "bulb", "motion": {"role": "prop", "reason": "The idea bulb rises into the character's attention"},
       "path": "@b1/idea-bulb-crayon.png", "x": 150, "y": 270, "w": 160,
       "keys": [{"t": 0, "x": 130, "alpha": 0}, {"t": 1, "x": 190, "alpha": 1}]}
    ]
  }],
  "sfx": [{"time": 0.3, "kind": "pop", "gain": 0.025}],
  "ambience": [{"path": "quiet-room.wav", "start": 0, "end": 3, "gain": 0.04}]
}
```

This is an excerpt, not a complete valid film: full-film shots must cover the actual voice length plus lead/tail **without gaps/overlap**. A scoped preview needs coverage and available media only through its requested end; later shots may be unproduced or absent. Narration and timed subtitles are required for both preview and full film. Use `probe` to get actual duration. Captions use the final video time including lead. `voice.speed` is not accepted: keep the original rate. Optional `voice.contains_sfx: true` marks an already mixed master; do not add duplicate effects. Optional `music: {path, gain}` adds a licensed track, looping it under the narration; gain must be 0–0.2. The default is no background music, not a forced piano track.

Layers: `image` (local PNG/JPEG, contain-fit within optional `h`), `pose` (B1 only: original three-pose atlas, indices 0–2), `text`, `line` (`points` array), `arrow`, `underline`. Design coordinates are 1280 units wide and `1280 × outputHeight / outputWidth` high (720 for 16:9; about 2275.56 for 9:16), uniformly scaled without stretching characters. Recompose portrait scenes explicitly; changing output dimensions alone does not design a vertical composition. Keep the bottom 110 design units clear for captions. Use `from`/`to` (shot-relative seconds) for selective visibility. `keys` are increasing shot-relative timestamps with optional numeric `x`, `y`, `w`, `angle` (radians), `alpha` and `progress`; values interpolate with smoothstep. For genuine local motion use separate layers or authored pose sprites. Images do not gain inferred limb motion automatically. Text `w` is its maximum width; B1–B4 subtitles allow at most one visible line. Explicit line breaks or width-induced wrapping fail validation/rendering: regroup into successive meaning/actual-pause based cues, without clipping or automatic shrinking. B5 uses its separate presenter-caption route with up to three semantic lines. The runtime enforces fit, not semantic quality; review the [common caption gate](autopilot-production-qa.md#natural-captions-and-semantic-sound). All styles are included in shot-cache identity so switching style cannot reuse another style's frames.

## B3 layered artwork

`init DIR --style B3` creates a non-overwriting B3 scaffold. B3 additionally accepts these declarative layers; no JavaScript, SVG markup, URLs or executable expressions:

- `path`: `commands` are numeric arrays beginning with `M`; supported commands are `M x y`, `L x y`, `Q cx cy x y`, `C c1x c1y c2x c2y x y`, and `Z`. Choose `fill`/`stroke` colors or `none`, and a positive `lineWidth`. Use curves for rounded limbs/pets rather than dense angular connector scaffolds. Paths do not interpolate or draw themselves; use separate pose layers with `from`/`to`, and `line.progress` for progressive connectors.
- `rect` / `ellipse`: positive `w`, `h`, optional rounded-rectangle `radius`, `fill` and `stroke`.
- `group`: a nonempty `children` array in back-to-front drawing order. Local `x`/`y` position the group; `pivotX`/`pivotY` define a local rotation/scale anchor. Optional positive `scaleX`/`scaleY` work on any B3 layer and in its keys. Keep joints attached; use keyframed rotation for bounded head/ear/hand movement. Parent alpha multiplies child alpha. A foreground layer after the group can occlude it.

All child `from`/`to` and key times remain **relative to the shot**, not to the parent group's appearance time. Nested media that first appear after a preview's end are not required until that range is rendered. Cache keys include nested media, B3 graphics code and television settings.

An illustrative **layer excerpt**, not a complete film or a reusable character:

```json
{"type":"group","x":500,"y":180,"children":[
  {"type":"rect","x":0,"y":120,"w":140,"h":110,"radius":14,"fill":"#858990"},
  {"type":"group","pivotX":70,"pivotY":110,"keys":[{"t":0,"angle":0},{"t":0.6,"angle":0.12}],"children":[
    {"type":"ellipse","x":25,"y":20,"w":90,"h":90,"fill":"#e7e9eb"}
  ]}
]}
```

Top-level `television: {enabled: true, intensity: 0.45}` enables soft bloom, subtle scanlines and vignette once after scene composition, **before clean captions**. Intensity ranges from 0 to 1; set `enabled: false` for clean interaction checks. This treatment belongs only to B3. Meaningful object/scene action, varied compositions and faithful contact still require authored decisions and encoded playback review; treatment cannot rescue a static illustration.

## B1–B4 caption and motion checks

Use bundled Noto Sans: B1 weight 600/34 design units, B2 weight 500/40 on the ivory label, B3 weight 600/34 uppercase. Baseline is design-plane height minus 60. Do not substitute a generic font or change size silently. A scoped script/language fallback may declare `caption_override: {kind: "language_fallback", language, reason}` for missing glyphs; a restyle requires its reason and genuine `user_approval`. B4 retains its independent fixed opening preset below. B5 uses its separate Instrument Sans/Anton runtime, not this subtitle treatment.

B1–B3 local actor/prop/information layers need a project-unique `id` and `motion: {role, reason}` plus effective keys. Over 2.5 seconds without principal-picture motion fails. No-op keys, caption/title entrances, shadow effects or a full-frame camera move do not count, including scene-scale group wrappers and inherited scaling. A local actor group remains supported. The render checks rolling isolated-layer pixel windows with a conservative 0.25s timing margin, excluding text/shadows and freezing ancestor transforms; a tiny drift across a long key span cannot satisfy the whole span. Geometry uses conservative artwork bounds (supply image `h` for its actual aspect). Reports record window evidence, not proof of contact, final visibility/occlusion or meaningful acting. Review encoded playback with the shot ledger; do not add arbitrary motion to game the test.

## Shared B1–B4 production tracks

`init DIR --style B4` uses the same validate/preview/approve/render pipeline. It sets the verified Brian name/ID, zero title padding, and separate `ambience`, `dialogue` and `audio_cuts` arrays. Supply story-specific image layers rather than the B1 atlas; B4 has no B1 grid/paper or B3 television treatment. The bundled reference lock is checked when loading a B4 project.

The local track arrays below also work in B1/B2/B3. Keep one subtle continuous environmental bed (or explicit motivated cuts), add SFX at actual story actions, and preserve dialogue clarity. A looping bell, repeated pop or loud drone is not a suitable neutral bed. B1/B2/B3 accept the user's chosen voice/provider; Brian identity, opening lead/trim exceptions and opening diagnostics below are B4-only.

- `voice`: local narration at its original rate, with `name: Brian`, `id: nPczCjzI2devNBz1zQrb`. Verify the source voice before recording; metadata cannot authenticate a recording. An explicitly chosen alternative needs a nonblank `user_override`. A lead above 0.1 seconds needs a story-motivated `opening_audio_override`, never a default silent title. If the source recording has verified leading silence, explicitly set `trim_start` in seconds (default 0, at most 5); retain a short pre-speech margin and never cut a breath or consonant. This is a nondestructive edit, not a speed change: the source hash remains unchanged and the export report records the trim. Author captions, shots and track intervals against the shortened video timeline; never auto-trim accepted media or lower the opening-check thresholds.
- `ambience`: `[{path, start, end, gain, offset?, loop?, fadeIn?, fadeOut?}]`. Gains are 0–0.2; looping defaults to true. Cover the timeline with a subtle bed, except deliberate cuts. A zero-gain track may remain muted but does not count as bed coverage; positive gain alone does not prove source audibility or mix intelligibility.
- `dialogue`: `[{path, time, gain, role?, offset?, duration?, fadeIn?, fadeOut?}]` for independent secondary-role recordings. Gains are 0–1. Preserve the natural performance; no speed/pitch fields.
- `sfx`: add `{kind: "file", path, time, gain, offset?, duration?, fadeIn?, fadeOut?}` for local, rights-cleared physical/story effects, at the native rate. Gains are 0–1. Procedural kinds remain available but are not substitutes for convincing story-critical sounds.
- `audio_cuts`: `[{start, end, reason, return_trigger}]` mutes ambience, music and SFX in that interval, preserving narration and role dialogue. Record why the cut exists and what restores sound.
- A premixed `voice.contains_sfx: true` master must not receive extra ambience, dialogue, SFX, music or cuts. Use either independent tracks or the accepted mixed master, not both.

B4 adds a `shadow` layer with positive `w`/`h` for the left-side feathered half-shadow and the fixed opening interface below. Animate separate story assets when needed; the renderer cannot infer a frightened face or a new threat from a still. Narrative shots are at most 3 seconds; an exceptional hold needs `kind: exceptional_hold`, `reason` and genuine scoped `user_approval`. Meaningful shot changes and creative motion are also reviewed through the [production ledger](b4-repeatability-check.md).

Exports include an encoded opening-audio diagnostic. Approval is blocked on a flagged opening unless it is repaired or has a recorded story-motivated exception. Check actual playback and early **narration**, not just a token sound at frame zero. Technical passes do not certify acting, horror, semantic captions or sound quality.

### B4 fixed opening

`b4-hook-v1` is a rendering preset, not a prose suggestion: bundled Nunito 900, warm-white setup, larger coral payoff, fixed dark outline/offset shadow, left half-shadow and a whole-payoff uniform 1.035→1 scale-settle over 0.2 seconds. Font integrity is checked; no silent default-font substitution. See the [font source/license and script coverage](../assets/fonts/README.md). The current default interface requires two coherent matching-frame picture states with a 0.3-second animated local expression/prop/environment reveal on the right, then at least 0.5 seconds of readable hold. The base remains visible while the changed state uses explicit alpha 0→1 keys; matching unchanged pixels keep the body and scene stable. Both an intermediate painted frame and its encoded MP4 equivalent must retain the animation. No limb rig is required. A hard switch between stills, different filenames, camera drift/shake, a global flash, tiny/offscreen changes or title-only animation do not pass. Avoid doubled facial features: choose a coherent local emergence/prop reveal rather than dissolving unrelated poses.

Create an external `approved-opening.json` from already approved words and actual project assets, for example:

```json
{
  "setup": "WOULD YOU",
  "payoff": "OPEN IT?",
  "before": "art/opening-before.png",
  "after": "art/opening-after.png",
  "meaning": "Record this story's actual prop, expression or environment change",
  "width": 1280,
  "height": 720,
  "duration": 3,
  "region": {"x": 680, "y": 60, "w": 540, "h": 480}
}
```

This is an interface example, **not** approved copy or reusable story art. Paths resolve relative to the video project. `region` uses the runtime's 1280-wide design plane and must frame the actual changed subject outside the caption area. Use the target native ratio and coherent composition; do not stretch a landscape still to portrait. The helper does not generate media, rewrite a script or spend credits:

```bash
node scripts/b4-opening.mjs /absolute/project/approved-opening.json /absolute/project/opening-layers.json
```

Merge the returned `opening` descriptor and `shot` as the video's first shot, preserving later shots, narration and captions. The output is non-overwriting. Set the payoff's `from` and the two key times together to match the approved spoken phrase, leaving the full payoff readable; keep its fixed scale values/duration. Set the picture's `from` and two alpha-key times together (0→1 over 0.3 seconds), retaining the base through the shot, and choose the review region for the actual action. Each text group must fit at most two semantic lines without overlap. Rechoose semantic line breaks or layout within the preset before changing approved words; do not silently rewrite them to fit.

`validate` paints the opening and tests title visibility/settle plus localized held picture change, rather than counting keys. `preview` and `render` then decode six phase frames from the actual MP4 and compare them to that authored composition. Outputs include `preview-opening-visual.json`, `preview-opening-contact-sheet.png` (or `final-…`) and `opening_visual` in the export report. `approve` rechecks the current encoded MP4, not just a self-declared `pass` or file hash. Review playback, contact sheet and body/contact details for actual meaning, acting, fear, reading order and sync; pixel checks do not prove these qualities.

Only a genuine explicit user choice may set `opening.user_override` with the scoped reason, for a different typography, deliberate static treatment or unsupported-script localization. It is reported as `user_exception`, never a diagnostic pass. Do not fabricate an override to bypass missing artwork or a failed test. Audio, other production rules and human review still apply. Another renderer must preserve the approved treatment and provide actual encoded evidence; abandoning the shared runtime is not permission to replace the preset with a generic title.

## Commands

- `doctor`: dependency/font/key presence only; no network and no key values.
- `probe FILE`: duration and media streams.
- `init DIR`: create a non-overwriting project scaffold; it is not production-ready until voice, captions and shots are filled.
- `validate PROJECT [--seconds N]`: check real files, audio duration, shot coverage, cue timing, layers and SFX. Default is the complete film; `--seconds 20` checks only the sample range.
- `captions WORDS.json OUTPUT.json`: convert `{words:[{start,end,word}]}` into readable timed phrases. `--lead 0.15` adds initial video offset. Requires actual aligned word timestamps.
- `preview PROJECT [--seconds 20]`: check/render only the sample range, with caption sidecars/contact sheet/report and shot cache. Missing later-shot media does not block it. Existing outputs are not overwritten unless `--replace` is explicit.
- `approve PROJECT --note "…"`: record a genuine user sample/full-production approval, binding the reviewed sample and its production settings rather than unfinished later shots.
- `render PROJECT`: validate all full-film media/timing, verify the scoped sample approval, then resume full local composition. Later-shot completion does not itself require re-approving an unchanged sample.

`scripts/align_captions.py AUDIO --output WORDS.json` uses optional `openai-whisper` and an already cached `base` model. Set `--model NAME`, `--language en`, `--device cpu` as appropriate. `--allow-model-download` explicitly permits model download; otherwise it stops if absent. Do not install or download multi-GB models automatically. Already supplied aligned captions need no Whisper dependency.

## Optional Gemini API adapters

The renderer consumes compatible local audio and image files; it is not tied to the service that generated them. Follow [selected-provider execution](autopilot.md#selected-provider-execution) for another service. `doctor`'s `gemini_key_present` is informational for the Gemini route, not a requirement for all providers or proof of generation readiness. Do not repurpose `gemini-media.mjs` with another provider's key/base URL; use a suitable tool or project-local adapter instead.

Browser/native generation tools can be used instead. The bundled Gemini adapter requires `GEMINI_API_KEY` in the environment, the chosen model ID and explicit network authorization. Its commands make **one request, no automatic retries**, do not print keys/provider response bodies, and use only Google's fixed HTTPS endpoint. Failures/timeouts are recorded; inspect service history before trying again. Model access/quota is not validated by key presence. Private reference upload is opt-in through explicit `--reference` paths.

```bash
node scripts/gemini-media.mjs speech --text narration.txt --output narration.wav \
  --model YOUR_AVAILABLE_TTS_MODEL --voice Bodi --allow-network
node scripts/gemini-media.mjs image --prompt scene-prompt.txt --output scene.png \
  --model YOUR_AVAILABLE_IMAGE_MODEL --reference character.png --allow-network
```

The speech text file contains only the exact approved spoken words. Use the selected named voice without extra voice/style instructions; `--direction` is not supported. Verify that the selected TTS model offers the chosen voice before generation. The Bodi command is an optional adapter example, not a B1/B2/B3/B5 requirement. Help configure the user's chosen route if needed; never automatically replace accepted speech. Image output is saved from the provider's native image payload, not recreated from base64 text. No default image model is assumed. API calls may be billed; the flags are not a substitute for user authorization. No API-backed request is needed for the included offline example or packaging tests.

## Recovery and verification

The original procedural SFX kinds are `tap`, `paper`, `pop`, `chime` and `jingle` (a short metallic key-ring accent). Choose by action, not by style or caption turnover.

Each shot is cached by its content, its own visual assets, overlapping captions, fonts, renderer version and timing—not every image in the film. Cache hits are probed before reuse. After interruption rerun the same command; do not delete the cache or resynthesize audio. `output/checkpoint.json` records the active stage and shot count. A project-local lock prevents simultaneous rendering. A stale lock is removed only when its recorded process is no longer running.

Reports contain input/output SHA-256, original voice duration/rate policy, actual frames, codec/ratio, caption checks, full decode result and cached-shot reuse. Preview reports also record the reviewed range. They do not certify human listening, factual accuracy or user acceptance. Changing the reviewed sample's content/assets/captions/SFX, the narration track or global production settings invalidates approval; adding or revising only later shots does not. The whole narration file is fingerprinted conservatively, so replacing or extending it requires review even if the opening sounds unchanged. Changes to the approved script, creative scope or billable work still need the relevant authorization; a matching fingerprint is not new permission. Old reports without a scoped range require a fresh preview/review, not an inferred approval.
