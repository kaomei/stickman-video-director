# B1–B9 · Default captions, SFX and music completeness

Required automatically for every new B preview and full-film delivery, without a user reminder. Selecting a style selects its actual approved sample's drawing, motion, caption treatment and sound-design target; it does not select a generic B soundtrack or B4 text preset. Use this gate **alongside every original style/ratio/language gate**. A picture/text/geometry/encode pass alone is not finished-video acceptance.

## Default production contract

- **Captions:** include every spoken word in semantic, actual-voice-aligned cues with the selected style's approved font, hierarchy, line count, placement and animation behavior. Review the burned-in result, not only the sidecar. All languages need equivalent readability and style-appropriate effects. B1's sequential builds, B2's restrained paper label, B3's TV treatment, B4/B5's prescribed text animation, B6's approved portrait profile, B7's short pixel captions and B9's quiet handwritten subtitle treatment retain their own contracts. This rule does not invent a different B8 profile or animate every subtitle.
- **SFX:** automatically spot, source/create and mix meaningful contact, material, UI, transition and scene cues against actual story actions. Use each sample's restraint, energy and timing; count or constant activity is not the target. Preserve deliberate rests. Do not attach an effect to every cut or B9 pen stroke.
- **Background music:** automatically find and mix suitable music matching the selected style's reference mood, pacing and voice space. Follow [automatic sourcing, license verification and credits](music-sourcing-and-license.md) and the style's more specific approved/default track direction. A reference recording is not automatically licensed for reuse. Preserve B9's specified original-track/default-and-written-notice rule when that style is installed; unresolved rights remain unresolved. Keep music audible where planned and narration intelligible. Do not silently substitute an explicitly selected track.

An explicit user instruction can omit or alter a component; retain its actual text and source in the project. Motivated short silence belongs in the sound plan with its narrative reason and return/ending cue; it does not waive music for the entire film. Missing tools, unsuccessful sourcing, cost boundaries or unavailable listening are **incomplete/pending**, never omission waivers or passing acceptance. Continue authorized repairs and useful independent work; ask only for a genuinely required missing decision/authority. Do not add new spending, publication or approval requirements.

Do not replace accepted samples, regenerate approved voice or repaint unrelated assets for this rule update. For a local revision, review changed ranges and their joins under existing preservation rules; a new full-film completeness claim still needs valid whole-scope review evidence for that exact output. Existing historical samples do not acquire a new pass merely because this document changed.

## B5 ordinary requested previews

For B5's [default first-preview workflow](b5-first-preview.md), apply the caption, SFX, music and source/rights contract above within the **same single actual-candidate review**. Inspect the encoded preview once at normal speed with sound against the approved B5 standard; inspect suspect frames only as needed. Save a concise note identifying the actual candidate, review scope, component findings, repairs and any viewing/listening or rights limitations. Retain the existing approved script, caption/spotting inventories and actual source/rights records. Repair observed failures and recheck affected intervals and their neighbors.

An ordinary requested B5 preview does not require the formal completeness JSON/checker, independent native acceptance index, extra playback channels or another review round. Its workflow exposes the formal completeness commands under `preview_review.strict_qa.completeness_commands`; use them with the [native strict protocol](b5-visual-acceptance.md) only for explicitly selected strict QA or final-delivery acceptance. This exception changes the preview record, not the required visible/audible result: missing or unreviewed components and unresolved applicable rights remain disclosed and pending; no automatic pass, user approval or publication authority is created. Other styles and B5 final/strict checks retain the formal gate below.

## Actual-output gate

Outside the ordinary B5 preview exception above, after encoding each preview/final scope, make the Agent prepare and complete its own report; the user need not fill JSON:

```bash
node scripts/b-delivery-completeness.mjs init --style B1 --ratio 16:9 --media /absolute/output/candidate.mp4 --output /absolute/reviews/completeness.json
node scripts/b-delivery-completeness.mjs check /absolute/reviews/completeness.json
```

This accepts B1–B9 MP4s from either the bundled renderer or an external code project. Use the actual native ratio and one report per encoded output. Init fingerprints the file, probes real picture/audio streams and leaves all subjective fields `not_checked`; it never fills passing observations or invokes generation. Keep reviews/plans outside a fingerprinted production project when its own contract requires that.

Set `delivery_classification` to `local_preview` or `final_delivery`, matching the real handoff; a local preview never becomes a final/release-ready result from this check. Bind the actual selected-style reference and approved script by absolute `file` and `sha256`. Record the reviewer, real inspection date, actual picture playback and encoded-audio listening. `full_scope_review.ranges` must cover beginning through ending at `speed: 1`, with concrete observations, and its verdict must be `pass`. Honest missing playback remains unchecked. Still sheets, waveform measurements, export success and generated filenames cannot replace this inspection.

For each component, bind a real nonempty JSON `plan` with `file`/`sha256`. Its shape is:

```json
{
  "component": "captions",
  "style": "B1",
  "ratio": "16:9",
  "output_sha256": "ACTUAL_ENCODED_MP4_SHA256",
  "items": [{"id": "cue-001", "start": 0.2, "end": 1.8, "purpose": "Actual semantic role", "text": "Exact spoken phrase"}]
}
```

Use the finalized caption/spotting inventories, not an abbreviated illustrative cue list. `captions` items contain exact text; compare the complete sequence against the approved script and actual speech for omissions, repeats, order and semantic breaks. `sfx` and `music` items instead bind the **actually used** `source` and `license_evidence` files by `file`/`sha256`, with the actual `rights_status` (`cleared_for_declared_use` or `unresolved`) and real `declared_use`. An unresolved status may record actual media presence only in an honestly labeled, otherwise permitted local preview; this classification grants no right to obtain or use a track and cannot bypass the existing authorized-source/intended-use restrictions. Do not mix merely because permission is unclear; it retains `rights_status: unresolved`, `delivery_status: local_preview_not_final` and `release_ready: false` even when all media components are recorded present. Final delivery requires rights covering its actual use, and all independent rights gates remain mandatory. Generated/self-created sounds retain their actual provenance and applicable terms too. Reusing a source for multiple events is allowed; replacing a live source invalidates its fingerprint. License/attribution instructions and the actual handoff notice still follow the music workflow.

In each component's report:

- Set `verdict: "pass"`, `all_planned_items_checked: true` and `rendered_in_candidate: true` only after confirming the component in this MP4. Source files on disk, a sidecar caption, a recommended download link or an unused audio stem are insufficient.
- Review **every** plan ID exactly once in `items`, each with `verdict: "pass"`, `present_in_candidate: true` and a concrete actual-output `observation`. Inspect text fit/effects; listen to SFX causality/sync and musical presence, transitions and voice balance. Set `encoded_review` to a truthful pass with the overall observation.
- For music, enumerate any unscored intervals in `intentional_silence` as `{start, end, story_reason, return_or_ending_cue}`. Music plus these deliberate intervals must cover the scope. A tiny token cue plus arbitrary silence is a creative failure even if the inventory is mechanically complete.
- Only an actual explicit user omission uses `verdict: "user_waived"`, with no used items and `user_override: {kind: "explicit_user_instruction", instruction: "Actual user words", evidence: {file, sha256}}`. Save real conversation/project authorization evidence; a model-authored preference is not user authority. This does not waive unrelated component, style, rights or user-approval requirements.

Bind the current original style-specific acceptance evidence in `style_specific_acceptance` and retain its independent real checks. That record must carry this exact `style`, `ratio` and `output_sha256`; extract/verify them against the original current-media review records, rather than relabeling old evidence. Preserve a scope index when the original style produces several independent reports. Leave `unresolved_issues` empty only when all findings are repaired. A failed/missing component, missing/unknown review, stale output or source fingerprint, uncovered interval blocks this gate. Unresolved applicable rights block final-delivery acceptance; local-preview component completeness does not clear public/commercial/repository distribution rights. A disclosed limited-toolchain/draft delivery must retain its incomplete status and cannot be called complete or sample-equivalent.

The Agent creates `style_specific_acceptance.evidence` as a fingerprinted JSON index; the user does not fill it. The checker reads the original native report contents, verdicts, media scope and hash links rather than trusting the outer label or an opaque evidence file:

```json
{
  "schema": "b-style-acceptance-index/1", "verdict": "pass",
  "style": "B1", "ratio": "16:9", "output_sha256": "ACTUAL_ENCODED_MP4_SHA256",
  "reports": [{
    "kind": "reference",
    "acceptance": {"file": "/absolute/native-acceptance.json", "sha256": "ACTUAL_FILE_SHA256"},
    "evidence": {"file": "/absolute/evidence.json", "sha256": "ACTUAL_FILE_SHA256"},
    "review": {"file": "/absolute/completed-review.json", "sha256": "ACTUAL_FILE_SHA256"}
  }]
}
```

Use the existing native gate outputs without converting them into a generic passing checklist:

| Style | Required `reports[].kind` and original records |
| --- | --- |
| B1–B3 | `reference`: native reference acceptance, evidence ledger and completed review. A limited/best-effort receipt does not pass. For a receipt embedded in preview approval JSON, set `acceptance_key: "reference_acceptance"`. |
| B4 | **Both** `picture` and `typography`, each with its own acceptance, evidence and review. Picture acceptance keeps `scope: "picture only"` plus its native `range`; typography keeps its native time `scope`. Embedded preview keys are `picture_acceptance` and `typography_acceptance`. |
| B5 strict QA/final acceptance | `visual`: native acceptance/delivery JSON, evidence ledger and independent review, including all three full-playback channels. Both actual native statuses `independent_visual_review_pass` and `visual_review_passed` are supported. Agent review does not infer user approval or require the user to fill a new form. |
| B6 | `motion`: native `check-review` receipt and completed motion `review`, plus a fingerprinted `render_report`; the review's output, ratio, render fingerprint and full playback must match the current production encode. |
| B7 | `pixel`: native acceptance, evidence ledger and completed review, using its existing `media_sha256`, creative-review, playback and listening fields. |
| B8 | `greek`: native `review-report` receipt as `acceptance` and the actual encoded sample/film report as `review`; its current MP4 artifact, dimensions and every shot's recorded visual rows must pass. |
| B9 | `live-sketch`: the completed original six-gate report as `review`, including its format, single-pen, editor-drag and continuous-playback records. Record `output_sha256` in that actual report together with `output_video`, `scope_seconds` and `format`; an old report missing the digest is not current evidence. |

Every indexed file uses absolute `file` and its actual `sha256`. Missing records, unknown kinds, stale inner movie hashes, wrong native dimensions/ratio or failed/pending native criteria block this check even if the index and outer labels say pass. This index locates existing style gates; it neither manufactures their receipt nor replaces their full validators, rights checks or separate user decisions. B7–B9 support here does not publish those pending styles.

## What a passing check means

The checker verifies current files, scope, candidate and used-source audio stream existence, cue inventories and recorded review completeness. A text/link placeholder cannot stand in for an actual used audio source. Its result is **`recorded_pass`**, not automatic proof that a person/Agent truly listened, that music is perceptually audible, that every cue matches the story, or that a rights claim is correct. The reviewer must inspect the actual media and actual rights evidence honestly. Fabricating a detailed report remains a failure; technical acceptance cannot override missing or poor actual effects. All style-specific creative/technical gates, user approvals and publication boundaries remain separate and mandatory.
