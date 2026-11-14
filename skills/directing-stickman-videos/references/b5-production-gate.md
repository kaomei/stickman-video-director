# B5 new-story asset and production gate

## Default preview and optional strict QA

For normal requested previews, follow the [first-preview workflow](b5-first-preview.md): author/render/encode an internal candidate, inspect actual normal-speed playback with sound once, and repair only observed defects. The asset, typography, timeline and integrity requirements below still apply. Independent storyboard rehearsal, plan-lock, blind PNG/seal/contextual rounds and per-event evidence clips belong to the optional [strict formal protocol](b5-visual-acceptance.md), not the default preview.

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

Any adaptation of the historical example needs `scene/production.json`. The byte-identical complete historical `scene/` alone is exempt from this technical manifest so its approved source/media stays unchanged. Adding a file, changing the topic, face, script or timing ends that exemption. This exception does **not** transfer the historical composite's visual acceptance to a newly encoded film. Every new candidate needs actual review: use the [default single-pass preview workflow](b5-first-preview.md), or the [optional formal independent protocol](b5-visual-acceptance.md) when strict acceptance is required.

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
holds:                      # optional readable result holds; not motion
  [{start, end, event_id, reason, next_change}]
```

All paths are local and relative to `scene/`, with no symlinks or path escape. Reference lists may be empty only when none were actually supplied. Do not fabricate source, rights or approval entries. Store private API keys outside the manifest. Sound cues use final-video seconds and name the causal action; cover the timeline with quiet ambience and any explicitly motivated quiet beats, use discrete event SFX rather than a loud loop, and record deliberate quiet rather than omitting sound design. Review voice intelligibility and the encoded mix; no forced voice vendor. See [sound QA](b5-sound-qa.md).

These technical fields are necessary context, not a visual verdict. A nonempty motion `reason`, `semantic_review`, `sound_review` or approval note cannot replace watching and hearing the actual candidate. For a default preview, use one actual playback review and a compact issue/scope note. Use the separate [formal visual protocol](b5-visual-acceptance.md) only when strict, evidence-bound acceptance is required.

### Font, text-effect and language customization

By default, keep the B5 Instrument Sans caption/Anton headline hierarchy, upper-right semantic block, approved emphasis/color/placement and at most three lines. An **explicit user typography request takes priority**: record it in `captions.override` with `kind: user_choice`, its actual origin in `user_approval`, and the chosen treatment; use a descriptive `preset` for the resulting design. The clear request itself is authorization for that scoped change, not a reason to ask the same question again. Do not invent a user request to excuse an Agent's unrequested restyle.

For a requested language whose glyphs the default fonts do not cover, use `kind: language_fallback`, record the target `language`, reason and adapted treatment, and retain `preset: b5-instrument-anton-v1` as the design hierarchy. Select a licensed, script-capable font without silently choosing another design. Both routes still require local font files and exact SHA-256 values; font or treatment changes invalidate old frame evidence. They do not waive semantic captions, safe bounds, identity, sound, local motion or review gates.

Implement the change in the actual renderer and rebuild glyph tiles for the actual script, rather than changing metadata alone or keeping the example's words. All languages require semantic-unit progressive reveal, meaningful emphasis and a readable hold tied to the actual voice. Group at actual pauses and complete semantic dependencies, preserving modifiers, verb–object relationships and phrasal verbs. Never clear an unresolved preposition or subordinate introducer before its necessary continuation; use a meaningful line/reveal break within the group or a genuine semantic break, not fixed words, characters or seconds. Changing only the font, keeping the whole sentence static or applying a generic effect detached from speech fails. During the actual candidate review, check caption reveal/settled states and adjacent group replacements against the approved speech; inspect a suspect boundary frame only as needed. Masked `qualityFrame` images and semantic-review prose cannot establish caption readability. Inspect punctuation, CJK glyphs, joining/bidirectional order, combining marks or other relevant shaping, clipping, spacing and timing in encoded playback. Do not fragment a shaped word, grapheme, phrase or number–unit pair to imitate English word animation. Preserve accepted earlier project versions. Technical file/pixel checks cannot certify these properties; check every caption group in actual playback, using the [strict independent gate](b5-visual-acceptance.md#every-caption-group-must-pass-in-every-language) only for formal acceptance.

Motion intervals must bound actual local actor/prop/information progress. Unexplained principal-picture inactivity over 2.5 seconds fails the technical gate; a deliberate readable result hold must be recorded separately through the `holds` field above, not disguised as a motion interval or filled with jitter. Each hold requires finite `start`/`end`, an `event_id` from the valid `scene/visual-plan.json`, a concrete reading purpose in `reason`, and the actual handoff/next change in `next_change`. Its interval must fit within that event. A hold is not a separate unchanged visual event; the owning event still needs distinct before/after states. At least one real `motion` interval remains required and is checked independently. Motion and valid holds together cover the timeline; a hold declaration does not prove its readability or pacing, which must be reviewed in continuous playback.

Exclude subtitle-only updates, camera drift and global noise from stage progress. A meaningful word/graph transformation may be the principal visual event, while a redundant title entrance is not. Follow the [Mei scene structure](b5-crazymei-directing-structure.md) and [event cards](b5-left-stage-motion.md); add force/contact/consequence/recovery and source-aligned SFX only for actual physical actions. Check anatomy and task/rest poses wherever figures appear. Technical sampling is not a visual verdict.

## Renderer and commands

Inspect project code before `--trusted-code`. A new renderer exports:

- `frame(t)`: the normal frame.
- `qualityFrame(t)`: the same picture-rendering path with caption/title overlays, global camera transforms and noise disabled; never fake a separate checker-only animation.
- `productionAssets`: `[{path, sha256}]` declaring the accepted presenter image actually used by that rendering path; do not list an unused image while drawing another face.

Use the [default first-preview commands](b5-first-preview.md#make-the-requested-candidate): `validate`, `frames --all --trusted-code`, then `encode` with the approved mix. `validate` checks the production manifest, asset/font fingerprints and timeline. `frames` checks the presenter raster and local picture-region change, then records input/frame hashes. `encode` rejects stale frame/project evidence or a different mix, fully decodes the result, and creates an internal candidate with review pending. None of these commands certifies visual quality or user acceptance. Optional `--approval-note` records truthful provenance only.

Review that actual candidate once at normal speed with sound; inspect suspect frames and repair affected intervals as needed. Deliver the requested preview with the containing-folder link and truthful QA scope. Preserve accepted versions and do not infer user approval.

For explicit strict QA, use `reference-study`, `plan-lock`, the PNG first-read/seal/contextual or incremental-revision path, `review-pack`, `preview-ready` and `accept` under the [formal protocol](b5-visual-acceptance.md). Strict PNG arguments opt `encode` into their exact-current-evidence gate; a direct strict wrapper must run the corresponding `png-review-check` immediately before FFmpeg. Only the strict protocol creates formal evidence-bound review receipts. Do not require these receipts for an ordinary preview.

Technical checks are accidental-regression safeguards, not proof of generation provenance, likeness, rights, action meaning or reviewer honesty. Actual viewing/listening scope must remain truthful. Outputs stay outside the installed Skill; no command grants new paid calls, asset generation, user approval or publication authority.
