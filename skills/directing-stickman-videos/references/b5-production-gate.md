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

## Technical project evidence

Any adaptation of the historical example needs `scene/production.json`. The byte-identical complete historical `scene/` alone is exempt from this technical manifest so its approved source/media stays unchanged. Adding a file, changing the topic, face, script or timing ends that exemption. This exception does **not** transfer the historical composite's visual acceptance to a newly encoded film. Every new encode follows [candidate, evidence, independent review and accept](b5-visual-acceptance.md).

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

These technical fields are necessary context, not a visual verdict. A nonempty motion `reason`, `semantic_review`, `sound_review` or approval note cannot replace extracted action strips, continuous clips, complete playback and an independent review record. The separate [visual review plan and result](b5-visual-acceptance.md#review-record-and-binding) must cover every main action and every caption group, bind evidence to the final candidate, and block acceptance on any missing, unknown or failing item.

### Font, text-effect and language customization

By default, keep the B5 Instrument Sans caption/Anton headline hierarchy, upper-right semantic block, approved emphasis/color/placement and at most three lines. An **explicit user typography request takes priority**: record it in `captions.override` with `kind: user_choice`, its actual origin in `user_approval`, and the chosen treatment; use a descriptive `preset` for the resulting design. The clear request itself is authorization for that scoped change, not a reason to ask the same question again. Do not invent a user request to excuse an Agent's unrequested restyle.

For a requested language whose glyphs the default fonts do not cover, use `kind: language_fallback`, record the target `language`, reason and adapted treatment, and retain `preset: b5-instrument-anton-v1` as the design hierarchy. Select a licensed, script-capable font without silently choosing another design. Both routes still require local font files and exact SHA-256 values; font or treatment changes invalidate old frame evidence. They do not waive semantic captions, safe bounds, identity, sound, local motion or review gates.

Implement the change in the actual renderer and rebuild glyph tiles for the actual script, rather than changing metadata alone or keeping the example's words. All languages require semantic-unit progressive reveal, meaningful emphasis and a readable hold tied to the actual voice. Changing only the font, keeping the whole sentence static or applying a generic effect detached from speech fails. Inspect punctuation, CJK glyphs, joining/bidirectional order, combining marks or other relevant shaping, clipping, spacing and timing in encoded playback. Do not fragment a shaped word, grapheme, phrase or number–unit pair to imitate English word animation. Preserve accepted earlier project versions. Technical file/pixel checks cannot certify these properties; every caption group must pass the [independent visual gate](b5-visual-acceptance.md#every-caption-group-must-pass-in-every-language).

Motion intervals must bound actual local actor/prop/information progress, with no principal-picture inactivity above 2.5 seconds. Exclude subtitles, title entrances, camera drift, global noise, arbitrary jitter and large full-frame regions. Follow the [left-stage causal action cards](b5-left-stage-motion.md), including contact, consequence, recovery and SFX timing. Review each left actor's force, natural arm/hand task and recovery; a moving mouth, prop, text or burst cannot rescue a static actor with unmotivated raised arms. A passing sampled-pixel check is only a technical prerequisite.

## Renderer and commands

Inspect project code before `--trusted-code`. A new renderer exports:

- `frame(t)`: normal frame, as before.
- `qualityFrame(t)`: the **same picture-rendering path**, with caption/title overlays, global camera transforms and noise disabled. Never fake a separate animation solely for the checker.
- `productionAssets`: `[{path, sha256}]` declaring the accepted presenter image actually used by that rendering path. Do not list an unused image while drawing another face.

```sh
node scripts/character-explainer.mjs validate /absolute/project
node scripts/character-explainer.mjs frames /absolute/project --output /absolute/new-frames --all --trusted-code
node scripts/character-explainer.mjs encode /absolute/project --frames-dir /absolute/new-frames --audio /absolute/project/scene/final-mix.wav --output /absolute/new-candidate
node scripts/character-explainer.mjs review-pack /absolute/project --candidate-dir /absolute/new-candidate --output /absolute/new-evidence
# Independent actual-media review produces /absolute/review.json before accept.
node scripts/character-explainer.mjs accept /absolute/project --candidate-dir /absolute/new-candidate --evidence-dir /absolute/new-evidence --review /absolute/review.json --output /absolute/new-delivery
```

`validate` checks the technical manifest, asset/font fingerprints and timeline. `frames` also decodes the presenter raster and samples local picture-region pixel change, then records input/frame hashes. Neither command nor `check` establishes visual acceptance. `encode` rejects stale project/frame evidence and a different final mix, and writes `candidate.json` with `status: pending_visual_review`, never `delivery.json`. Optional `--approval-note` is truthful provenance only. `review-pack` extracts final-MP4 evidence; `accept` validates its binding and complete independent results before creating `delivery.json` with `status: visual_review_passed` and `user_acceptance: not_inferred`. Follow the [full protocol](b5-visual-acceptance.md); do not substitute text declarations for actual review. Outputs are non-overwriting and projects stay outside the installed Skill. No command generates assets, pays a provider, mixes audio or grants user approval.

These are accidental-regression safeguards, not a sandbox against dishonest trusted code: metadata cannot authenticate generation, prove that a declared image was displayed, recognize a celebrity, certify rights, judge action quality or authenticate a reviewer's honesty. Sampled pixel change cannot prove continuous motion, natural poses, final occlusion, caption animation or causality. Independent reviewers must inspect the real extracted media and complete encoded playback with sound. Report missing listening or review honestly and leave the candidate pending. Any relevant hash change invalidates its old binding; never bypass a failed gate with invented approval, copied observations or a fake provider label.
