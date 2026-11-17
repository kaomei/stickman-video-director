# B7 · Per-film evidence and review gate

Use this for a **new B7 film or a changed final film**, after reading [the style contract](b7-pixel-theater.md). This gate binds a review to actual media, catches incomplete records and blocks delivery while picture/sound review is pending or needs repair. It does not judge animation, semantics, listening quality or rights automatically.

## Agent workflow

1. Build a project-local `b7-plan.json` from the actual approved speech and the renderer's event timeline. Picture and Foley consume the same trigger IDs/times. Include **all used production inputs** in `assets`: renderer/source, images, fonts, voice, music, Foley, sidecar captions and relevant configuration. Do not use an interval marked “moving” as a substitute for developing real acting.
2. Encode the agreed final film; preserve already approved picture/voice/assets. From the Skill directory, run:

   ```sh
   node scripts/b7-review.mjs init --video /absolute/project/final.mp4 --plan /absolute/project/b7-plan.json --out /absolute/project/qa/b7-final-v1
   ```

   `evidence` is an alias of `init`. Node, FFmpeg and FFprobe must be available. An optional `--reference-manifest /absolute/reference/reference-manifest.json` supports a relocated B7 pack. The output directory must be new/empty: preserve old review records.
3. Read `evidence.json`; inspect the contact/reaction frame strips saved by the project. **Watch and listen to the entire encoded film at normal 1× playback**, including distant beats, caption transitions and the ending. A source film deliberately sped up during editing is still reviewed at 1× final playback. Compare real motion to the approved moving references, and inspect suspect frames. Fill `review.json` from the observed result; never batch-fill `pass` because technical tests passed. If any actual check cannot be performed, leave it pending and state the limitation.
4. Fix failed material within the authorized scope; update the event plan when timing/state changes. Any changed final video, declared asset, plan or reference invalidates its old record. Run `init` into a **new** directory and review the current encoded result; prior observations can guide reinspection but cannot be claimed as a fresh full-film watch/listen.
5. Run:

   ```sh
   node scripts/b7-review.mjs check --evidence /absolute/project/qa/b7-final-v1/evidence.json --review /absolute/project/qa/b7-final-v1/review.json
   ```

   Exit 0 and `delivery_ready: true` mean the current files and required **recorded** review are complete. A nonzero exit blocks a claim of completion. Keep the evidence/review with delivery and the project checkpoint. Deliver the video and its verified containing-folder link. Publication/installation are separate authorizations.

This is an agent execution gate, not a requirement to ask the user to approve every story. `require_user_acceptance` follows the actual project agreement. If true, exact-media user acceptance is required. If false, completed creative review may proceed with user acceptance pending/not requested; a user rejection or repair request always blocks. Never infer acceptance from silence or a technical pass.

## Native portrait scope and hard checks

For B7 9:16, read the [native portrait and short-caption contract](b7-native-portrait.md) and inspect its approved internal 10-second V3 reference. It establishes that clip's native layout and short-caption treatment; it does not certify a full portrait story's acting, sound, reflective ending or platform-safe placement.

- Recompose scene, actors, controls and framing on a portrait pixel grid while preserving the approved character identity and fixed geometry. The reference uses 180×320 logical pixels, integer nearest-neighbor 6× enlargement and vertically stacked button/clock; cropping a landscape render does not satisfy the contract.
- Every subtitle stays on one line. Target about 60% of frame width; the **actual drawn glyph-and-shadow bounds must be no wider than 65%, with at least 17.5% clear width at each side**. Center that drawn box with error at most half a logical pixel (`integer_scale / 2` final pixels), allowing integer-grid rounding. Record actual bounds/margins for every cue and language, using its real font and scale. Keep the selected glyph size and shape; semantic resegmentation is the remedy for overflow, not squeezed or smaller type. The reference's maximum is 110/180 logical pixels, leaving 35 per side: **660/1080 final pixels, with 210 per side**.
- Align short semantic groups to the unchanged actual recording. Keep core phrases such as `fast-forward button` intact. The approved opening is `You were born with a` at 0–0.94 s, then `fast-forward button` at 0.94–1.92 s; this deliberate light-word carryover avoids a long bar without flashing `with a` on its own. Do not generalize this into fixed word-count cuts, arbitrary fragment flashes or delayed VO.
- Inspect actual encoded transitions and phone-size readability. The sample's band `y=257–277` and glyph top `y=264` on its 180×320 canvas are reference coordinates, not universal platform safe areas. Check current project/platform overlays separately, including shadows and control labels through contact frames.

Use the [portrait plan structure](b7-native-portrait.md#evidence-before-claiming-completion): `portrait_layout` requires `native_recomposition: true`, concrete `recomposition_evidence`, `logical_canvas: {width, height}`, `integer_scale`, `resampling: "nearest-neighbor"`, `caption_safe_area: {left, top, right, bottom}`, `caption_measurement: {font, method, includes_shadow: true}` and `required_action_regions: [{beat_id, bounds: {left, top, right, bottom}}]`. Canvas dimensions times the integer scale must equal the actual output size. Cover every beat with its essential action region; every caption requires `line_count: 1` and its own glyph-and-shadow `bounds`. Time-overlapping subtitle boxes must not cover required action regions. All rectangle coordinates, `drawn_width` and `safe_width` use **final output pixels**. These portrait fields are not additional requirements for 16:9 plans.

Store measured bounds and any font/language override with the plan or linked QA evidence. A declared `drawn_width`/`safe_width`, a static strip or a technical pass does not establish semantic timing or actual readability. Review all of the new encoded film before claiming whole-film completion. The manifest's `validated_formats: ["16:9"]` refers to complete-film benchmarks; its separate `portrait_layout_reference` preserves the 10-second portrait approval scope.

## Plan schema (version 1)

Times are seconds on the **final encoded timeline**. Durations come from FFprobe. The approved pack contains 16:9 complete-film benchmarks and a separately accepted 9:16 10-second layout/short-caption reference. Neither replaces authored recomposition and actual review of a new ratio/output.

Top-level fields:

| Field | Required content |
| --- | --- |
| `schema`, `style`, `author_id` | `1`, `"B7"`, actual author/agent identifier |
| `duration` | Actual video duration, within one frame plus 20 ms |
| `require_user_acceptance` | Boolean from the project agreement, normally `false` unless acceptance was required |
| `narration` | Full approved spoken text; preserve the chosen voice/wording |
| `beats` | Ordered, unique story events covering the complete timeline, without gaps or overlap |
| `captions` | Ordered semantic caption ledger matching narration in full |
| `portrait_layout` | Required for 9:16 only; native composition/grid/scale, measured caption safe area/font and essential action regions covering every beat, as specified above |
| `assets` | All production inputs as `{ "id": "renderer", "path": "render.py", "role": "picture renderer" }`; paths relative to the plan or absolute |
| `audio_resources` | Every speech/music/SFX/ambience resource with `id`, `kind`, `provenance` and optional `asset_id` linking a listed file |
| `intentional_silence_reason` | Only when the final film intentionally contains no audio stream |

IDs must be unique across beats, captions, assets and audio resources; `final-video` is reserved. Use distinct IDs such as `voice-file` for a file and `narrator` for its audio resource.

Each beat contains:

```json
{
  "id": "lamp-on",
  "start": 0,
  "end": 3,
  "intent": "Make the decision and its consequence readable",
  "actor_object": "C's right hand and the wall switch",
  "before": "Lamp off; hand relaxed beside body",
  "after": "Lamp on; hand withdrawn; C reacts to the light",
  "cue": {"text": "The approved spoken phrase", "start": 0.1, "end": 2.7},
  "anticipation": [0.2, 0.8],
  "trigger": 1.0,
  "response": [1.0, 2.4],
  "settle": 2.6,
  "principal_action": [[0.2, 1.2], [1.35, 2.6]],
  "sfx": [{"id": "switch-click", "event_id": "lamp-on", "resource_id": "click-foley", "offset": 0, "time": 1.0, "purpose": "Contact of hand with switch"}]
}
```

This illustrates fields, not a mandatory shot, duration, prop or motion recipe. `response` includes the object consequence and character reaction; record their actual subevents in project geometry/QA evidence. A nonverbal beat still has an explicit cue and time. Anticipation precedes trigger, response follows it and settling follows response. If an event intentionally has no sound, use `"sfx": []` plus a concrete `no_sfx_reason`. Each SFX resource must also appear as `kind: "sfx"` in `audio_resources` and have its own cleared rights record.

`principal_action` must contain actual meaningful actor/prop/state development. The gate measures continuous inactivity **across all beat/cut boundaries**, from film start to end: maximum 2.5 seconds. A caption change, camera drift, ambient particle, idle blink or arbitrary tiny movement cannot be declared principal acting to evade the rule. The creative reviewer must reject such declarations even when the interval arithmetic passes. Inspect every beat, rather than only the opening.

Only the final completed reflection may declare this exception inside its last beat:

```json
"reflective_hold": {
  "start": 47,
  "end": 49.8,
  "reason": "User-approved intentional quiet completed reflection; no story action is being deferred",
  "approval": {"status": "approved", "by": "actual approving party", "evidence": "Exact decision/record and its location"}
}
```

It must be terminal, 2–3 seconds, after settling and the final spoken caption. It does not exempt earlier static shots. Without a real explicit approval, continue a meaningful small final gesture/setting response under the default 2.5-second gate; do not fabricate approval to use the exception.

Each caption is `{ "id": "c1", "start": 0.1, "end": 2.7, "text": "The approved spoken phrase", "drawn_width": 238, "safe_width": 284 }`. These example widths illustrate a landscape ledger, not portrait limits. Measure width using the actual font/grid/layout; exactly one line, safe width and ordered nonoverlapping times are mechanically checked. For 9:16, include shadow in `drawn_width` and required `bounds: {left, top, right, bottom}`, set `safe_width` no higher than 65% of the encoded frame width, and record measured left/right clear margins of at least 17.5% each. Portrait bounds and widths are all in **final output pixels**; the box must remain inside `caption_safe_area` and clear any required action region whose beat overlaps its time. All caption text must match narration in order (ignoring punctuation/spacing/case). **Semantic boundaries, voice sync, reading time, correct glyphs, object text occlusion and small-view legibility still need actual review.** A width value is a declaration, not a pixel measurement by this script.

## Review schema and evidence boundary

`init` creates every creative check as **pending** and user acceptance as pending. It never sets them to pass. It saves SHA-256 for actual video, plan, all declared assets, the reference manifest and **every file in that reference directory**, plus probed duration/geometry/FPS/audio and a successful full media decode. The manifest's version/pack version/status and hash identify the reference revision; adding/removing a reference file also invalidates the record. Keep QA output outside the reference directory.

Fill the generated review fields:

- `reviewer`: actual `id`, how the film was inspected in `method`, boolean `independent` (declare honestly; a second agent is useful but not universally required), and `limitations`. Unavailable human listening cannot be replaced by loudness meters. If the available agent/tool cannot perform actual full-speed audiovisual review, keep those gates pending and report the concrete missing review.
- `full_playback` and `full_listening`: `status: "pass"`, `speed: 1`, actual `ranges` covering `[0, duration]`, plus timed observations. A genuinely audio-free film uses `full_listening.status: "not_applicable"` with a reason; it still needs a sound/intentional-silence review. No “pass” based solely on thumbnails, frame differences, waveform/ffprobe or source-file checks.
- Every `checks` entry below needs `status: "pass"` and observations. Pending/needs-repair checks fail. Each observation is `{ "time": 1.0, "detail": "Specific observed result at this event", "evidence_ids": ["lamp-on"] }`; IDs must exist in the current plan (`final-video`, beat, caption, audio-resource or asset IDs). Save contact strips/plots in the project and cite their paths in the relevant observation.
- `audio_rights`: exactly one cleared entry per audio resource: `id`, `status: "cleared"`, `source`, `license_or_permission`, `attribution`, `reason`. Include title/artist/source URL, license/date, allowed platforms/commercial restrictions and file association where relevant. For self-made audio, state that basis and `attribution: "Not required: self-authored"` rather than leaving fields blank. A familiar game OST is not cleared by popularity or by appearing in an old sample.
- `user_acceptance`: binds the final `media_sha256`. `accepted` needs actual `by` and confirmation `evidence`; otherwise use `pending` or `not_requested` according to the project. `rejected`/`needs_repair` block delivery whether or not user approval was initially required. Editing this field does not authenticate a user decision.

| Creative check | Required observed evidence |
| --- | --- |
| `reference_match` | **Every beat:** approved white-C identity/accessories, crisp pixel grid, coherent palette/proportions and comparable staged motion; no slide-show substitution |
| `principal_motion` | **Every beat:** meaningful development from the first spoken beat, readable anticipation/contact/consequence/reaction/settle, variety through the body/ending, and no false action intervals |
| `geometry_contact` | **Every beat:** hands/props attached at contact, fixed bones and planted feet, readable travel/swing/stance, no sliding, stretched arms, loose accessories or unexplained teleports; inspect transition frames |
| `continuity_story` | **Every beat:** cue-to-picture causality, before/after state continuity, motivated framing, physically connected details (water/particles included), clear choices and payoff |
| `captions_semantics_sync` | **Every caption ID:** actual voice/meaning boundaries, complete text, one-line fit and small-view readability; portrait measured glyph/shadow width ≤65%, each side margin ≥17.5%, centered within half a logical pixel, unchanged type size and project/platform-safe band; important object labels remain legible through motion/contact |
| `sound_mix_rights` | Encoded whole-film actual listening: voice intelligibility, story-fitting audible BGM behind speech, causal SFX using shared triggers, rests/transitions, no unintended silence/clipping; every rights entry cleared |
| `ending` | Earned reflection after speech; fixed-origin pixel typing and gentle pulse, new-glyph-only ticks; completed read time, restrained live scene/fixed geometry, fitting cleared music/ambience and clean fade, or the user's explicit override |

The script rejects missing per-beat/semantic-caption evidence, uncovered playback ranges, non-1× review, uncleared rights and stale media/assets. It does **not** authenticate reviewer identity, actual watching/listening, rights claims or aesthetic judgments. A detailed false claim can still be false. Report `creative_review_status: "recorded_pass"` accurately; do not promise “automatically meets the sample” from this result.

## Historical approvals and repair

The bundled reference manifest's latest approved full films preserve their **existing exact hashes and historical user decisions**. They remain accepted examples; do not regenerate them or invent a fresh review/plan merely to make this gate green. An archival acceptance record may cite that actual historical decision for the same unchanged hash. It does not certify a new story or changed media.

The exact 10-second portrait V3 clip was subsequently accepted by the user for its native layout and shorter captions on 2026-11-13. Preserve that scoped decision with its exact media hash; a technical report created before this user decision may still say `pending`. Do not rewrite its scope as approval of a complete portrait film, fresh full-speed audiovisual review, a new story or its ending.

New projects always start pending. If output changes after review, keep the old evidence as history, run `init` again and record current observations; never refresh hashes inside an old acceptance record to carry its approval forward. This includes remixes, retimes, subtitle fixes and asset substitutions. Reuse unaffected approved source material; verify the newly encoded result and adjacent transitions, with whole-film 1× review recorded before claiming final readiness.

## Default audiovisual completeness

Selecting B7 automatically requires the [B1–B9 final delivery completeness gate](b-delivery-completeness.md) together with the existing B7 style/creative gates. Produce sample-directed captions, causal SFX and suitable background music by default, then verify each in the actual final MP4. Missing components, unchecked review or unavailable tools block a complete/pass claim. Sidecar captions, downloaded audio or successful encoding are insufficient. Keep the approved pixel font, native portrait short-caption rules, causal pixel Foley and reflective ending sound direction. Document explicit user exemptions and narrative local silence under the shared gate; production difficulty is not an exemption.

```sh
node scripts/b-delivery-completeness.mjs init --style B7 --ratio 16:9 --media /absolute/candidate.mp4 --output /absolute/completeness-review.json
node scripts/b-delivery-completeness.mjs check /absolute/completeness-review.json
```

Use the actual requested ratio and output path. New records start unchecked. The script verifies evidence completeness; truthful full-output watching/listening and the existing style acceptance remain necessary. Existing sample approvals and rights decisions retain their original scope.

## Current-output evidence and pending-release boundary

Use the current [shared completeness contract](b-delivery-completeness.md), including its `b-style-acceptance-index/1` lookup of the original B7 `pixel` acceptance, evidence ledger and completed review. Run the B7 native checker first, then the common checker. The common checker reads native verdicts, the inner movie digest, evidence/review digests and full 1× playback/listening coverage; a passing outer label or a copied old receipt is insufficient. All reports bind the same actual encoded MP4, native ratio and complete requested scope. A changed movie or production input invalidates the old chain; preserve the old record as history and inspect the current version honestly.

The installed audio library is available through the [B sound library](b-audio-library.md). Use its style/action recommendations, exported original files, permission evidence and required credits when they fit this story. Keep the approved pixel Foley, voice balance, reflective ending and sample-specific music direction; the library does not authorize replacing already approved audio during maintenance or reusing a sample soundtrack for a new use without checking its own terms.

Package integrity, successful installation, stream presence and actual creative review are separate results. `assets/b7/release-readiness.json` records the user's explicit publication authorization and reuse of the unchanged, hash-bound approved examples; it does not claim a fresh playback or listening review. Historical full-film decisions remain scoped to those unchanged films; portrait V3 remains a 10-second layout/short-caption reference, never approval of a complete portrait film. New or changed films require the current B7 and common-completeness gates with actual full-speed picture and final-audio review. Do not fabricate review evidence or repeat review of unchanged user-confirmed samples solely for publication. Local maintenance alone grants no publication authority.
