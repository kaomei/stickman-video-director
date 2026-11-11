# B5 new-story asset and production gate

This is part of the existing B5 route, not a new Skill, image provider or generation permission. Reuse accepted identity and speech first. Never edit a locked example to satisfy a new project's checks.

## Image-first identity, any Agent

For a **new real person or complex character/IP presenter**, use the current Agent's available image tool/model or an accepted supplied PNG/JPEG/WebP. Codex's built-in image tool is one route, not a requirement. Inspect the host's actual tools; do not assume another Agent has Codex tools, reuse a Gemini endpoint with another key, or invent a successful generation. If no image tool is available, help configure the user's chosen route or import a supplied image and pause that step. Do not silently substitute SVG/Canvas primitives, a generic cartoon head or a code-drawn look-alike.

Keep identity anchors separate from B5 style anchors. A provider-neutral prompt should specify:

- Identity: subject and distinctive face/hair/accessories, based on authorized identity references; do not use a generic smiling face as a proxy for likeness.
- Style: recognizable abstract cartoon head, clean dark contours, simple stick body, warm-paper/ink composition and restrained red accents; not a photoreal talking head. Use the actual B5 reference as a style anchor when the tool supports reference images.
- Deliverable: clean isolated head/body components at adequate native resolution, neutral readable pose and matching proportions, no added text or account mark; plan separable eyes/mouth/expression regions for local animation without stretching the whole face.
- Inspect the generated image for likeness, anatomy, style, cutout edges and intended crop. Approve the **actual static result**, not the prompt. Record deficiencies and get direction instead of declaring a mismatched face accepted.

Apply the same identity/style prompt through whichever tool the user has. Translate only supported parameters, preserve references and approved words, and keep cost/privacy/upload authorization separate. Prompt constraints improve repeatability but do not guarantee equivalent model outputs. User-supplied or already accepted raster art needs no new generation. Simple **original geometric** characters may use code/SVG; that exception does not cover recognizable real people or complex IP. The left anonymous-stickman stage remains code-animated in every route.

Compile this provider-neutral prompt with the actual identity/style references and approved brief; do not send unresolved placeholders or assume a tool supports reference images:

```text
Create a B5 animated-host asset of [subject]. Use [identity reference] only for
recognizable identity cues: [specific face, hair, silhouette and accessories].
Use [B5 style reference] only for visual treatment: a recognizable abstract
cartoon head, clean dark ink contours, restrained shading, and simple stick-body
proportions. Do not copy the reference character's identity or watermark.
Deliver [approved crop, dimensions and background] for a bottom-right presenter,
with a neutral readable pose and clean cutout edges. Keep eyes, brows and mouth
clear for later local expression animation. No added captions or account marks.
Do not replace the subject with a generic cartoon face or photoreal talking head.
```

Adapt background and component delivery to the actual model's supported outputs. If references cannot be supplied, disclose that limitation and review likeness before proceeding; a prompt alone is not acceptance.

Preserve the exact bundled accepted Spider-Man SVG through `approved_reuse`, its locked hash and actual approval origin; this narrow existing-identity exception cannot authorize a new code portrait. Other previously accepted code artwork may be exported unchanged to a raster instead of redesigned.

## Project evidence

Any adaptation of the historical example needs `scene/production.json`. The byte-identical complete historical `scene/` alone is exempt so its approved source/media stays unchanged. Adding a file, changing the topic, face, script or timing ends that exemption.

Use these fields with real local files and evidence, not copied approval text:

```text
presenter:
  kind: real_person | complex_character | original_simple
  path, sha256: scene-relative accepted asset and SHA-256
  identity_anchor, style_anchor: actual visual requirements
  static_approval: actual scoped review/approval and its origin
  source:
    type: image_tool | user_supplied | approved_reuse | original_code
    tool, model, prompt: required for image_tool; actual route and final prompt
    origin: required for approved_reuse
    references: [{role: identity | style, path, sha256}]
captions:
  preset: b5-instrument-anton-v1
  font: {path, sha256}       # bundled Instrument-Sans-1.ttf by default
  title_font: {path, sha256} # bundled Anton-0.ttf by default
  semantic_review: actual words, semantic grouping and voice-timing review
  override:                 # optional; omit when using the defaults
    kind: user_choice | language_fallback
    reason, treatment: actual scope and implemented font/effect/layout treatment
    user_approval: actual user request and its origin # required for user_choice
    language: target language                       # required for language_fallback
sound:
  [{kind: ambience | sfx | dialogue | quiet, start, end, reason,
    path, sha256, rights}]  # quiet omits file/rights, explains the quiet beat
sound_review: actual listening review; do not claim unheard playback
mix: {path, sha256}         # reviewed final mix, not dry narration
motion:
  [{start, end, role: actor | prop | information, reason,
    region: [left, top, width, height]}]
```

All paths are local and relative to `scene/`, with no symlinks or path escape. Reference lists may be empty only when none were actually supplied. Do not fabricate source, rights or approval entries. Store private API keys outside the manifest. Sound cues use final-video seconds and name the causal action; cover the timeline with quiet ambience and any explicitly motivated quiet beats, use discrete event SFX rather than a loud loop, and record deliberate quiet rather than omitting sound design. Review voice intelligibility and the encoded mix; no forced voice vendor. See [sound QA](b5-sound-qa.md).

### Font, text-effect and language customization

By default, keep the B5 Instrument Sans caption/Anton headline hierarchy, upper-right semantic block, approved emphasis/color/placement and at most three lines. An **explicit user typography request takes priority**: record it in `captions.override` with `kind: user_choice`, its actual origin in `user_approval`, and the chosen treatment; use a descriptive `preset` for the resulting design. The clear request itself is authorization for that scoped change, not a reason to ask the same question again. Do not invent a user request to excuse an Agent's unrequested restyle.

For a requested language whose glyphs the default fonts do not cover, use `kind: language_fallback`, record the target `language`, reason and adapted treatment, and retain `preset: b5-instrument-anton-v1` as the design hierarchy. Select a licensed, script-capable font without silently choosing another design. Both routes still require local font files and exact SHA-256 values; font or treatment changes invalidate old frame evidence. They do not waive semantic captions, safe bounds, identity, sound, local motion or review gates.

Implement the change in the actual renderer and rebuild glyph tiles for the actual script, rather than changing metadata alone or keeping the example's words. Inspect punctuation, diacritics or CJK glyphs as applicable, clipping, emphasis, readable spacing, semantic groups and actual voice timing in encoded playback. Preserve accepted earlier project versions. This gate locks the declared files and records review; it cannot certify glyph coverage, typography or semantics from pixels automatically.

Motion intervals must bound actual local actor/prop/information progress, with no principal-picture inactivity above 2.5 seconds. Exclude subtitles, title entrances, camera drift, global noise, arbitrary jitter and large full-frame regions. Follow the [left-stage causal action cards](b5-left-stage-motion.md), including contact, consequence, recovery and SFX timing; a moving mouth alone does not rescue a static explaining stage.

## Renderer and commands

Inspect project code before `--trusted-code`. A new renderer exports:

- `frame(t)`: normal frame, as before.
- `qualityFrame(t)`: the **same picture-rendering path**, with caption/title overlays, global camera transforms and noise disabled. Never fake a separate animation solely for the checker.
- `productionAssets`: `[{path, sha256}]` declaring the accepted presenter image actually used by that rendering path. Do not list an unused image while drawing another face.

```sh
node scripts/character-explainer.mjs validate /absolute/project
node scripts/character-explainer.mjs frames /absolute/project --output /absolute/new-frames --all --trusted-code
node scripts/character-explainer.mjs encode /absolute/project --frames-dir /absolute/new-frames --audio /absolute/project/scene/final-mix.wav --output /absolute/new-delivery --approval-note 'Actual current user approval only'
```

`validate` checks the manifest, asset/font fingerprints and timeline. `frames` also decodes the presenter raster and samples local picture-region pixel change, then records evidence with input/frame hashes. `encode` rejects stale project/frame evidence and a different final mix. Outputs are non-overwriting and projects stay outside the installed Skill. No command generates assets, pays a provider, mixes audio or grants approval.

These are accidental-regression safeguards, not a sandbox against dishonest trusted code: metadata cannot authenticate generation, prove that a declared image was displayed, recognize a celebrity, certify rights, or judge action quality. Sampled pixel change cannot prove continuous motion, final occlusion or causality. Inspect opening/body/ending encoded playback and actual sound; report missing listening or human review honestly. Never bypass a failed gate with invented approval or a fake provider label.
