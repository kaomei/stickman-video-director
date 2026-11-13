# Autopilot runtime

Run from this installed Skill's directory. No second Skill or repository is needed.

```bash
npm ci
node scripts/autopilot.mjs doctor
node scripts/autopilot.mjs init /absolute/path/my-video
```

Install Node 20+ and FFmpeg/FFprobe using your platform's normal installer. Optional `FFMPEG`, `FFPROBE`, and `AUTOPILOT_FONT` environment variables select executables/font files; no macOS/Homebrew paths are hardcoded. The bundled Caveat font covers Latin; choose a suitable CJK/Arabic/etc font for those languages. The CLI fails on unavailable dependencies rather than silently generating a mute/placeholder film.

## B6 native painted-world route

[B6's installed production workflow](b6-installed-production.md) owns the [dedicated code runtime](b6-code-runtime.md); the B1–B4 manifest v1 examples below do not apply. Run `node scripts/autopilot.mjs doctor --style B6`, then `init DIR --style B6 --ratio 16:9|9:16|both`. Default initialization copies the complete portable V90 painted engine plus the shared puppet/space/caption/review modules and exact Sample 1 portrait reference into a new authoring project. It creates separate native plan slots, not generated media or a completed film. The agent continues with story-specific art, calibrated bindings, action and sound. `--example hong-kong-v90` selects the unchanged engineering replay; `--example blocking-calibration` is only a technical scaffold.

Shared `validate/preview/review-pack/check-review/approve/render` commands dispatch B6 projects to `b6-dynamic-meme.mjs` before the generic renderer. Use its dedicated schema and inspected local scene code with `--trusted-code`. B6 preserves pinned original-speed audio and one fixed-size semantic caption line. Portrait works best; Sample 1 portrait V44 is the strict primary style/motion/limb-weight standard. Each requested ratio needs its own authored composition/camera and actual [35-item review](b6-sample-1-acceptance.md), with repairs and re-review for pending/failing findings. Do not add B6 to the B1–B4 manifest style list or substitute B5. Initialization and technical validation are not creative acceptance.

## Manifest v1

For B1/B2/B3, the mandatory [reference-effect acceptance protocol](b1-b2-b3-reference-acceptance.md) governs actual sample and full-film quality, independent review and capability-limited handoff. The mechanisms below do not reproduce the public samples automatically. Set project `reference_review.author_id` and `reference_review.capability` truthfully; complete toolchains target comparable effects, while observed limitations remain explicit and cannot earn that pass. Inspect B1's actual baseline and the portable B2/B3 full public samples; sampled boards and B3's legacy silent detail clips support only the evidence they actually contain.

The bundled runtime accepts `style: B1`, `B2`, `B3` and `B4`. B1 keeps its white grid and original caption treatment. B2 uses warm paper without a grid and dark captions on an ivory paper label (40 design-unit landscape text, 72 in portrait). Select B2 explicitly and author its own colored scene/prop/character image layers; the B1 `pose` atlas is rejected in B2. The JSON excerpt below remains a B1 example, not a B2 art template. See [B2](b2-colorful-handdrawn.md) for its independent production defaults.

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

Layers: `image` (local PNG/JPEG, contain-fit within optional `h`), `pose` (B1 only: original three-pose atlas, indices 0–2), `text`, `line` (`points` array), `arrow`, `underline`. Design coordinates are 1280 units wide and `1280 × outputHeight / outputWidth` high (720 for 16:9; about 2275.56 for 9:16), uniformly scaled without stretching characters. Recompose portrait scenes explicitly; changing output dimensions alone does not design a vertical composition. For landscape B1–B3, keep the bottom 110 design units clear for captions. For B1–B3 portrait, use the [native portrait contract](b1-b2-b3-native-portrait.md): its ratio-specific type, declared safe area and separate caption band replace the landscape bottom-edge placement. Register each shot's native focal regions and scene-only background exclusions; a width/height change alone is insufficient. Use `from`/`to` (shot-relative seconds) for selective visibility. `keys` are increasing shot-relative timestamps with optional numeric `x`, `y`, `w`, `angle` (radians), `alpha` and `progress`; values interpolate with smoothstep. For genuine local motion use separate layers or authored pose sprites. Images do not gain inferred limb motion automatically. Text `w` is its maximum width; B1–B4 subtitles allow at most one visible line. Explicit line breaks or width-induced wrapping fail validation/rendering: regroup into successive meaning/actual-pause based cues, without clipping or automatic shrinking. B5 uses its separate presenter-caption route with up to three semantic lines. The runtime enforces fit, not semantic quality; review the [common caption gate](autopilot-production-qa.md#natural-captions-and-semantic-sound). All styles are included in shot-cache identity so switching style cannot reuse another style's frames.

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

For new B3 production, author each `shot.b3_semantics: {events, graphics}` under the [semantic-motion schema and example](b3-semantic-motion.md) before rendering. `events` bind actual caption cue indices, absolute event times, changing visible states, effective motion layers and explanatory purpose; layer keys remain shot-relative. `graphics` classifies every arrow/line/underline and motion-bearing path. Arrows are directed connectors; every connector binds actual source/target layer IDs, object-local anchors and relation. Dynamic connectors require a supporting `relationship` event; a fully static useful connector may omit `event_id`, still requires graphic review and earns no principal-motion credit. `planB3Semantics` checks declared coverage/scope/key changes and anchor geometry, not the truth of the relation, final MP4 visibility or meaningfulness. Emphasis/decoration cannot fill principal-motion gaps; a signal counts only when a supported `signal_state` event conveys actual new information, not ambient CRT texture. A legacy project without this plan may render a pending candidate, but acceptance requires the plan and itemized independent actual-MP4 event/graphic/inventory review. Maintain the common 2.5-second inactivity gate and B3's existing visual language.

## B1–B4 caption and motion checks

Landscape presets use bundled Noto Sans: B1 600/34 design units, B2 500/40 on the ivory label and B3 600/34 uppercase, with baseline at design-plane height minus 60. **B1–B3 portrait** instead uses `b123-native-portrait-v1`: B1/B3 64 design units, B2 72 with a proportionately sized label, inside the declared safe area and separate caption band. B1 portrait captions inherit the existing hand-font slot (`font`, configured `AUTOPILOT_FONT`, then bundled OFL Caveat); explicit `captionFont` wins under the normal restyle rules. The approved B1 portrait uses Chalkboard/`Hand`; Apple font files are not redistributed, and Caveat is a portable candidate requiring actual visual review rather than an approved exact substitute. B2/B3 retain their Noto treatment. See [native portrait configuration and review](b1-b2-b3-native-portrait.md). A scoped script/language fallback may declare `caption_override: {kind: "language_fallback", language, reason}` only for actual glyphs missing from the selected style/ratio default font and retains the ratio-specific size; other restyling needs its reason and genuine `user_approval`. Long cues must be regrouped at semantic/actual-pause boundaries, never squeezed or shrunk to pass. B4 keeps its independent opening/body treatment below; B5 keeps its separate Instrument Sans/Anton route.

B1–B3 local actor/prop/information layers need a project-unique `id` and `motion: {role, reason}` plus effective keys. Over 2.5 seconds without principal-picture motion fails. No-op keys, caption/title entrances, shadow effects or a full-frame camera move do not count, including scene-scale group wrappers and inherited scaling. A local actor group remains supported. The render checks rolling isolated-layer pixel windows with a conservative 0.25s timing margin, excluding text/shadows and freezing ancestor transforms; a tiny drift across a long key span cannot satisfy the whole span. Geometry uses conservative artwork bounds (supply image `h` for its actual aspect). Reports record window evidence, not proof of contact, final visibility/occlusion or meaningful acting. Review encoded playback with the shot ledger; do not add arbitrary motion to game the test.

<a id="b4-production-tracks"></a>

## Shared B1–B4 production tracks

`init DIR --style B4` uses the same validate/preview/approve/render pipeline. It sets the verified Brian name/ID, zero title padding, and separate `ambience`, `dialogue` and `audio_cuts` arrays. Supply story-specific image layers rather than the B1 atlas; B4 has no B1 grid/paper or B3 television treatment. The bundled reference lock is checked when loading a B4 project.

The local track arrays below also work in B1/B2/B3. Keep one subtle continuous environmental bed (or explicit motivated cuts), add SFX at actual story actions, and preserve dialogue clarity. A looping bell, repeated pop or loud drone is not a suitable neutral bed. B1/B2/B3 accept the user's chosen voice/provider; Brian identity, opening lead/trim exceptions and opening diagnostics below are B4-only.

- `voice`: local narration at its original rate, with `name: Brian`, `id: nPczCjzI2devNBz1zQrb`. Verify the source voice before recording; metadata cannot authenticate a recording. An explicitly chosen alternative needs a nonblank `user_override`. A lead above 0.1 seconds needs a story-motivated `opening_audio_override`, never a default silent title. If the source recording has verified leading silence, explicitly set `trim_start` in seconds (default 0, at most 5); retain a short pre-speech margin and never cut a breath or consonant. This is a nondestructive edit, not a speed change: the source hash remains unchanged and the export report records the trim. Author captions, shots and track intervals against the shortened video timeline; never auto-trim accepted media or lower the opening-check thresholds.
- `ambience`: `[{path, start, end, gain, offset?, loop?, fadeIn?, fadeOut?}]`. Gains are 0–0.2; looping defaults to true. Cover the timeline with a subtle bed, except deliberate cuts. A zero-gain track may remain muted but does not count as bed coverage; positive gain alone does not prove source audibility or mix intelligibility.
- `dialogue`: `[{path, time, gain, role?, offset?, duration?, fadeIn?, fadeOut?}]` for independent secondary-role recordings. Gains are 0–1. Preserve the natural performance; no speed/pitch fields.
- `sfx`: add `{kind: "file", path, time, gain, offset?, duration?, fadeIn?, fadeOut?}` for local, rights-cleared physical/story effects, at the native rate. Gains are 0–1. Procedural kinds remain available but are not substitutes for convincing story-critical sounds.
- `audio_cuts`: `[{start, end, reason, return_trigger}]` mutes ambience, music and SFX in that interval, preserving narration and role dialogue. Record why the cut exists and what restores sound.
- A premixed `voice.contains_sfx: true` master must not receive extra ambience, dialogue, SFX, music or cuts. Use either independent tracks or the accepted mixed master, not both.

B4 adds a `shadow` layer with positive `w`/`h` for the landscape half-shadow or portrait upper title field, and the fixed opening interface below. Follow the mandatory [picture-animation contract](b4-picture-animation.md): declare `picture_motion.author_id` and exactly one `picture_motion.shots` entry per shot, including opening/body/ending. Each entry identifies the actual local image layers, region, intent, before/after states and absolute `before/mid/after/hold` evidence times; author their effective shot-relative keys and coherent intermediate art. `motivated_hold` needs a reason and adjacent non-hold `supports_shot`; other kinds are `local_action`, `state_reveal` and `environment`. The renderer cannot infer a frightened face, contact pose or new threat from a still. Every complete opening/body/ending shot must last at most three seconds, even when a preview renders only its prefix; fit events, actual voice pauses and result/reading time within that limit. Unchanged principal-picture state dwell across cuts also cannot exceed three seconds: crops, subtitle updates, micro-zooms and decoration do not reset it. A motivated hold is a short pause within these limits, never an `exceptional_hold` or author-approved long-shot bypass. Preserve the first-three-second hook too. Camera-only pushes, caption changes and decorative loops cannot supply required picture progression; no limb rig is compulsory. The [production ledger](b4-repeatability-check.md) records frame-based plan/file evidence separately and is not visual acceptance.

Exports include an encoded opening-audio diagnostic. Approval is blocked on a flagged opening unless it is repaired or has a recorded story-motivated exception. Check actual playback and early **narration**, not just a token sound at frame zero. Technical passes do not certify acting, horror, semantic captions or sound quality.

### B4 fixed opening

Read the [B4 typography acceptance contract](b4-typography-acceptance.md) for story-adapted opening/rule/warning/choice design, all-language semantic captions and independent actual-MP4 review. The defaults are `b4-hook-v1` for landscape and `b4-portrait-poster-v1` for portrait. Reuse an existing explicit story-adaptation instruction; do not ask for a duplicate confirmation. A localized design must preserve correct script shaping and equivalent hierarchy/finish, rather than force every language into one English font. Painted checks remain diagnostics, not visual acceptance.

The landscape `b4-hook-v1` is a rendering preset, not a prose suggestion: bundled Nunito 900, warm-white setup, larger coral payoff, fixed dark outline/offset shadow, left half-shadow and a whole-payoff uniform 1.035→1 scale-settle over 0.2 seconds. Font integrity is checked; no silent default-font substitution. See the [font source/license and script coverage](../assets/fonts/README.md). Both presets require two coherent matching-frame picture states with a 0.3-second animated local expression/prop/environment reveal in the story picture, then at least 0.5 seconds of readable hold. The base remains visible while the changed state uses explicit alpha 0→1 keys; matching unchanged pixels keep the body and scene stable. Both an intermediate painted frame and its encoded MP4 equivalent must retain the animation. No limb rig is required. A hard switch between stills, different filenames, camera drift/shake, a global flash, tiny/offscreen changes or title-only animation do not pass. Avoid doubled facial features: choose a coherent local emergence/prop reveal rather than dissolving unrelated poses.

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

For portrait, the same helper selects `b4-portrait-poster-v1` when `height > width`: rounded setup above a condensed poster payoff, cream/coral hierarchy, controlled depth and a short emphasis line; the principal picture occupies the lower field. Follow the [selected native portrait reference](b4-opening-direction.md#native-portrait-opening). Author two semantic payoff lines explicitly when appropriate; both lines remain one animated block. For example:

```json
{
  "setup": "WHAT IF YOU SAW",
  "payoff": "DEATH COMING?",
  "payoffLines": ["DEATH", "COMING?"],
  "lineSizes": [242, 162],
  "payoffAt": 0.3,
  "before": "art/portrait-before.png",
  "after": "art/portrait-after.png",
  "meaning": "Record the actual lower-picture threat or prop reveal",
  "width": 1080,
  "height": 1920,
  "duration": 3,
  "region": {"x": 320, "y": 960, "w": 640, "h": 540}
}
```

These are interface examples, **not** approved copy or reusable story art. Paths resolve relative to the video project. `region` and line sizes use the runtime's 1280-wide design plane and must frame the actual changed subject outside the title and caption areas. `payoffLines` must preserve the complete payoff text; do not mechanically split words or compress glyphs. Use the target native ratio and coherent composition; the portrait preset requires matching native portrait picture states and does not stretch a landscape still. The helper does not generate media, rewrite a script or spend credits:

```bash
node scripts/b4-opening.mjs /absolute/project/approved-opening.json /absolute/project/opening-layers.json
```

Merge the returned `opening` descriptor and `shot` as the video's first shot, preserving later shots, narration and captions. Register that shot's `hook-before`/`hook-after` image layers in `picture_motion` with the actual reveal region/times, then cover every later shot too; the opening helper alone does not author the body's animation plan. The output is non-overwriting. For portrait, set `payoffAt` against the approved spoken phrase; the helper moves the emphasis line after it. When editing layers, move the payoff's `from` and both key times together, and the underline's `from`/keys with it (start 0.1 seconds after payoff, draw over 0.28 seconds). Leave the full payoff readable and keep its fixed scale values/duration. Set the picture's `from` and two alpha-key times together (0→1 over 0.3 seconds), retaining the base through the shot, and choose the review region for the actual action. Each text group must fit at most two semantic lines without overlap. Rechoose semantic line breaks or layout within the preset before changing approved words; do not silently rewrite them to fit.

`validate` paints the opening and tests title visibility/settle plus localized held picture change, rather than counting keys. `preview` and `render` then decode phase frames from the actual MP4 and compare them to that authored composition. Outputs include `preview-opening-visual.json`, `preview-opening-contact-sheet.png` (or `final-…`) and `opening_visual` in the export report. `approve` rechecks the current encoded MP4, not just a self-declared `pass` or file hash. Review playback, contact sheet and body/contact details for actual meaning, acting, fear, reading order and sync; pixel checks do not prove these qualities. For portrait, also watch the complete encoded opening at approximately 360×640: natural letter shapes, breathing space, full-word reading, visible picture evidence and the whole-payoff settle must remain convincing at phone size. Use the existing independent text-review criteria; technical success does not supply a creative pass.

The separate [B4 text review](b4-typography-acceptance.md#register-the-complete-authored-text) covers the opening, all registered body/image text and every semantic caption. `preview`/`render` save encoded phase frames, local clips, `evidence.json` and an unknown `review-template.json` under `output/preview-typography/` or `output/film-typography/`. See the linked contract for author/registry fields, all-language shaping, six review criteria and evidence limits.

The independent [B4 picture review](b4-picture-animation.md#encoded-evidence-and-independent-picture-review) additionally covers every actual shot, complete source playback and cross-section continuity/repetition. `preview`/`render` save before/mid/after/hold frames, whole-shot continuous clips, `evidence.json` and an unknown `review-template.json` under `output/preview-picture/` or `output/film-picture/`. B4 `approve` requires **both** `--picture-review PICTURE_JSON` and `--text-review TEXT_JSON` from real independent reviewers of those tracks. `render` rechecks both bound preview reviews. After new full-film reviews, run `accept-picture` and `accept-text` separately. Neither record implies the other's pass, audio acceptance or whole-film/user acceptance. Portrait picture and text reviews both require normal-speed phone-size source playback, not just valid coordinates.

Only a genuine explicit user choice may set `opening.user_override` with the scoped reason, for a different typography, deliberate static treatment or unsupported-script localization. An already authorized story/language adaptation supplies that scope without another approval request. It is reported as `user_exception`, never a default-preset diagnostic pass, and still requires the [typography design and encoded acceptance](b4-typography-acceptance.md). Do not fabricate an override to bypass missing artwork or a failed test. Audio, body-picture progression and independent review still apply. A deliberately static exception remains explicitly scoped and cannot be reported as a default B4 animation pass. An opening override or approval field does not waive the three-second shot/state limits; only a new, explicit user instruction changing the requested timing scope establishes that separate scope, never an inferred or self-approved long hold. Another renderer must preserve the approved treatment and connect its actual MP4 through both common draw/picture-isolation and draw/text-registry evidence adapters; either unadapted track remains unreviewed. Abandoning the shared runtime is not permission to replace the preset with a generic title, omit picture animation or bypass acceptance.

## Commands

- `doctor`: dependency/font/key presence only; no network and no key values.
- `probe FILE`: duration and media streams.
- `init DIR`: create a non-overwriting project scaffold; it is not production-ready until voice, captions and shots are filled.
- `validate PROJECT [--seconds N]`: check real files, audio duration, shot coverage, cue timing, layers and SFX. Default is the complete film; `--seconds 20` checks only the sample range.
- `captions WORDS.json OUTPUT.json`: convert `{words:[{start,end,word}]}` into readable timed phrases. `--lead 0.15` adds initial video offset. Requires actual aligned word timestamps.
- `preview PROJECT [--seconds 20]`: check/render only the sample range, with caption sidecars/contact sheet/report and shot cache. Missing later-shot media does not block it. Existing outputs are not overwritten unless `--replace` is explicit.
- `approve PROJECT --note "…" [--visual-review REVIEW_JSON] [--text-review TEXT_JSON] [--picture-review PICTURE_JSON]`: record a genuine user sample/full-production approval, binding the reviewed sample and its production settings rather than unfinished later shots. B1/B2/B3 require independent actual-MP4 `--visual-review` under the [reference-effect protocol](b1-b2-b3-reference-acceptance.md#runtime-evidence-and-commands); B4 requires both independent picture and text reviews. Review flags do not invent user approval.
- `render PROJECT`: validate all full-film media/timing, verify the scoped sample approval, then resume full local composition. Later-shot completion does not itself require re-approving an unchanged sample.
- `accept-text PROJECT --review FILE`: B4 only; verify the complete film's current encoded typography evidence and independent review, then save `output/film-typography-acceptance.json`. Other picture/audio gates and real user acceptance remain separate.
- `accept-picture PROJECT --review FILE`: B4 only; verify the complete film's current encoded per-shot picture evidence, complete source playback and independent review, then save `output/film-picture-acceptance.json`. Text, audio and real user acceptance remain separate; picture acceptance retains `delivery_ready: false`.
- `accept-visual PROJECT --review FILE`: B1/B2/B3 only; verify the complete film's current encoded reference evidence and independent review, then save `output/film-reference-acceptance.json`. `sample_target_review_passed` records review against available samples; `best_effort_limited` remains explicitly `not_sample_equivalent`. Both leave actual user acceptance separate.

B1/B2/B3 `preview`/`render` produce `output/preview-reference/` or `output/film-reference/` with a hash-bound ledger, unknown review template, start/mid/end frames and a complete audible clip for every submitted shot. A successful render remains pending independent reference review. See the shared protocol for exact criteria, full-playback coverage, capability disclosures and sample/full-film review commands; do not prefill passes from technical diagnostics.

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
