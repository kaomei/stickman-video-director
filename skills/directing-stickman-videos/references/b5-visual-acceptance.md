# B5 visual acceptance: candidate, evidence, independent review

This protocol applies to **every newly encoded B5 film and adaptation**, in every language and native aspect ratio. It strengthens the existing B5 route; it does not create another Skill or change B1–B4. Existing immutable, actually accepted baseline composites retain their historical acceptance. Reusing their assets or code does not transfer acceptance to a new encode.

## Separate technical success from visual acceptance

`check`, `validate` and `frames` establish only their stated technical checks. Hashes, fixed-length bones, a valid cue ledger, changing pixels and a successful encode cannot establish causal acting, natural arms or readable animated captions. Do not describe any of them as visual approval.

`encode` creates a candidate MP4 and `candidate.json` with status `pending_visual_review`; it does **not** create `delivery.json`. An optional `--approval-note` records a real request or approval origin, with its actual scope. It cannot approve unseen media, certify review or change candidate status. Never fabricate one to make a command run.

The route is **author → encode candidate → extract evidence → independent actual-media review → accept**. A film remains pending whenever review is missing, unavailable, inconclusive or failing. Technical quality, independent visual acceptance and final user acceptance are separate records. The user’s approval of a face, script, preview, budget or previous version must not be relabeled as approval of the final film.

## Plan complete coverage before extraction

Keep `scene/visual-plan.json` tied to the approved original-speed voice, actual word-timing transcript and exact native ratio. Use the supported schema below. It must cover:

- Every main left-stage action chain, with a stable ID, narration anchor, continuous interval and six actual phase positions: **before, anticipation, contact, extreme consequence, delayed response, recovery**. Include each actor participating in the chain, the force/contact, intended deformation, arm/hand purpose and any deliberate hold or retained end state. Action intervals together must cover the **entire candidate timeline**, with no gap larger than one project frame. Plan and review holds, openings, endings and transitions explicitly; choosing only successful clips is invalid coverage. A deliberate hold needs its visible purpose and next state, not invented movement.
- Every caption group, with its actual text, language, speech interval and language-appropriate semantic reveal units. Tie each unit to consecutive source-word indices in the locked actual-voice transcript. Across the complete plan, these indices must cover the source exactly once, in order, with no omitted, duplicate or reordered token. Define entrance, meaningful emphasis and readable hold within those intervals; verify their actual development in continuous playback, not from the sample labels alone. Headings are separate editorial elements.
- The full encoded film, so the reviewer can inspect all transitions, uncovered moments, overall pacing, composition, sound and continuity. Neither a contact sheet nor selected clips establish that the entire film was watched.

The technical production manifest’s motion `reason`, `semantic_review` and `sound_review` text remain useful context. They are **not** substitutes for review-plan coverage, extracted media files or recorded observations from actual playback.

## Build evidence from the final candidate

Run `review-pack` against the candidate directory. Extract from the **final encoded MP4**, not newly rendered substitute pictures, a separate checker animation or an earlier preview:

- For every main action: six phase frames and a continuous **silent left-stage crop**, including its lead-in and recovery. Watch the continuous interval at normal speed after inspecting the phases. The crop must contain every relevant actor, prop, force and extreme; a crop that hides a bad arm, contact or consequence is invalid evidence.
- For every caption group: before/reveal frames for each unit, peak/settle sample frames for marked emphasis, plus a continuous caption-region clip **with the candidate’s actual audio**. Inspect actual entrance, emphasis and readable hold throughout that clip; a sample named “peak” does not establish that the renderer produced one. A static glyph image proves neither animated reveal nor speech timing.
- The candidate itself for complete audiovisual playback. Local clips diagnose a beat; they do not replace full-film review.

Preserve `evidence.json`, exact candidate/project/plan/transcript/file hashes and command outputs. The ledger's `source-video` entry references the complete candidate path and hash; its generated full-stage silent and full-caption audio crops support complete playback. Artifact IDs and paths come from that ledger; do not invent them. Evidence from a source render is insufficient when the final MP4 differs. Do not edit extracted files, replace a clip with a better take or trim away a failing phase while retaining its old manifest.

Keep candidate, evidence, review and delivery files **outside the production project directory**. In particular, write the independent `review.json` outside the project: the project fingerprint includes its files, so adding a review report there would change the reviewed input. All command output directories must be fresh; preserve prior versions rather than overwriting them.

## Review record and binding

`scene/visual-plan.json` uses these fields. Times are final-video seconds; rectangles are `[left, top, width, height]` in the native frame. Use real values from the approved voice and candidate, never sample timestamps:

| Field | Required content |
| --- | --- |
| `schema`, `author_id` | `1` and the actual author identity, kept distinct from the independent reviewer. |
| `transcript` | `{path, sha256}` locking the actual word-timing source, with `path` relative to `scene/` (for example `word-timings.json`). Its `words` carry `text`/`screen` text and `start`/`end` times; keep the actual accepted narration. |
| `stage_region` | The left-stage review crop, including all relevant bodies, props, contact points and extremes. |
| `actions[]` | Unique `id`, `start`, `end`, `actor_region`, `intent`, and `phases`. Their intervals cover the entire film. |
| `actions[].phases` | Strictly increasing actual times for `before`, `anticipation`, `contact`, `consequence`, `delayed_response`, `recovery`, mapping to six distinct ordered final-video frames; `consequence` is the extreme frame. |
| `captions.language`, `captions.region` | Actual language/script context and the complete caption-region crop. |
| `captions.groups[]` | Unique `id`, `start`, `end`, and semantic `units`. Include every group in the film. |
| `captions.groups[].units[]` | `text`, `start`, `end`, `emphasis` (boolean), and `word_indices` for consecutive actual transcript tokens. The text must match those source tokens after NFC/whitespace normalization; all flattened indices must equal the complete source order exactly. Reveal start must match the first source word within one frame, and end must cover the final source word while remaining inside its group. |

The external `review.json` uses `schema: 1` and:

| Field | Required content |
| --- | --- |
| `reviewer` | Actual `id`, `kind` (`human` or `agent`), actual inspection `method`, `independent: true`. The reviewer ID must differ from `author_id`; distinct labels alone do not make a self-review independent. |
| `video_sha256`, `evidence_sha256` | Hashes of the actual candidate MP4 and exact `evidence.json` bytes. |
| `baseline_comparisons[]` | At least one actually inspected bundled baseline: `id` (`spiderman` or `jensen-v13`), `source_path`, `source_sha256`, and concrete `observations`. Record unavailable additional comparisons honestly. |
| `full_playback` | `silent_stage`, `complete_mix`, `captions_with_audio`, each with `status`, actual playback `observations` and `viewed_ranges: [{start, end}]`. Each item's merged viewed ranges must cover `0` through the candidate duration at project-frame precision; selected moments do not establish complete playback. |
| `actions[]` | Every planned action `id`, with `checks` for `causality`, `body_motion`, `arms_pose`, `contact`, `effects`, `recovery`, `pacing`. |
| `captions[]` | Every planned group `id`, with `checks` for `segmentation`, `reveal`, `emphasis`, `shaping`, `timing`, `readability`. |
| `blocking_issues` | Actual unresolved blockers. It must be empty to accept. |

Every result has `status` and `observations`; each observation has `at` (actual candidate seconds), `detail` (what was seen/heard) and `evidence_ids` (existing artifact IDs from `evidence.json`). Action/group observations must belong to their actual intervals. Every action criterion must include an observation referencing its `action-<id>-continuous` clip, and every caption criterion its `caption-<id>-continuous` clip; phase PNGs may provide additional evidence but cannot alone establish pacing, reveal or continuous behavior. Use the exact artifact IDs in the ledger. Pure status words such as “pass”, “ok”, “通过”, “正常” or “已检查” are rejected as observations; describe the actual visible/audible result, without padding to an arbitrary word count.

To prepare a review, initialize an unperformed action/caption check as `{"status":"unknown","observations":[]}` and each unperformed full-playback item as `{"status":"unknown","observations":[],"viewed_ranges":[]}`. Replace them only after real inspection; an empty or preset passing report cannot be accepted. Do not copy another film's timestamps, source hash, artifact IDs, viewed ranges or observations.

`review-pack` supplies `review-template.json` with unknown results and empty observations. Copy it to an external `review.json` for the independent reviewer to complete; do not edit the hashed evidence files or mistake the template's existence for a pass.

## Independent reviewer: observe, then decide

A human or a separate reviewing Agent must actually inspect the evidence, at least one bundled baseline composite and the complete encoded film. The authoring Agent, renderer, test output or a generated checklist cannot self-certify the result. Give the reviewer the real files, approved brief, action cards and language context. Reviewer identity/type and actual playback coverage must be recorded; an Agent must use available visual/audio capabilities rather than infer quality from code, metadata or filenames.

Record concrete observations per action and caption group, including where in the evidence they were observed. Mark a criterion `pass` only after observing it. Use `fail` for a visible defect and `unknown` for an unavailable, ambiguous or unperformed check. Record open issues and unavailable source comparisons honestly. An `unknown`, `fail`, missing item, blocking issue or incomplete full-film playback prevents acceptance. Never paste preset “all pass” wording or copy another version’s review.

### Every main action must pass

- **Causality and state change:** setup, anticipation, contact/constraint, consequence, delayed response and recovery read as one chain. The actor’s body, balance, location, silhouette or freedom visibly changes. Prop entrance, a tiny body pulse and a generic burst fail even when pixels move.
- **Force, contact and effects:** weight and direction are legible; hand/prop/ground contacts agree; material responses and secondary motion follow the contact. Effects support that force and consequence. Floating grip, teleportation, uniform prop bounces, unexplained shake or effects covering missing acting fail.
- **Natural arms and hands:** review the anonymous left actors as well as the presenter. A left actor must not keep both arms raised, pinned to one elbow angle or repeating the same wave throughout unrelated beats. Each raised/reaching/held pose needs a visible task, support or force and a credible entry, follow-through and exit. Hands return to a motivated rest or the next task; a sustained hanging, resisting or trapped pose may persist only while its constraint remains legible. Review shoulder/body participation, bend direction, reach and hand ownership throughout the clip. Arbitrary long arms, duplicate limbs, sliding shoulders and unmotivated rigid symmetry fail. Normal stillness is allowed; random motion is not a repair.
- **Recovery and staging:** intentional squash/stretch has clean entry, extreme and recovery or a story-justified retained state. All extremes, actor sizes, titles, captions and presenter remain legible and uncropped. A long hold must serve the scene and lead to a changed next state.

### Every caption group must pass, in every language

- **Semantic rhythm:** group at meaning and actual speech pauses, preserving phrases, names, modifiers and number–unit relationships. Do not split by a fixed character/word count or force every language into English space-delimited tokens.
- **Progressive reveal:** reveal semantic units in the actual voice rhythm, with visible entrance and development. A complete static sentence throughout the group, arbitrary per-character flashing or one reused bounce detached from speech fails the animation gate.
- **Meaningful emphasis and hold:** the key word or phrase receives a readable, motivated emphasis; the viewer can see it develop and then settle. Keep enough hold to read the thought. Constant popping, equal emphasis on everything, abrupt disappearance and effect-driven obstruction fail.
- **Language shaping:** use the actual script and a licensed font with the required glyphs. Inspect CJK glyphs and punctuation, Arabic joining and bidirectional order, combining marks/diacritics or other relevant shaping. Reveal complete shaped semantic units; do not fragment a grapheme, joined word, proper name or number–unit pair to imitate a reference effect. Missing glyph boxes, separated marks, wrong reading order and substituted example words fail.
- **Timing and readability:** match the approved audio, including pauses and transitions; no omitted, duplicated, reordered or overlapping words. Inspect every entrance/emphasis/hold for safe bounds, contrast, scale, unobscured text and B5’s maximum three semantic lines. Typography overrides and language fallback preserve these requirements.

The reviewer must also check the complete encoded film with sound: presenter identity and acting, narration continuity, material SFX at contacts, speech intelligibility, native-ratio composition and transitions. Record actual listening; waveform analysis or metadata cannot substitute for it.

## Accept or return for local repair

Run `accept` only with the candidate, its extracted evidence directory and the completed independent review. The command must reject mismatched fingerprints, altered/missing evidence, incomplete coverage, any non-pass criterion and unresolved blocking issues. Only then does it create `delivery.json` with `status: visual_review_passed` and `user_acceptance: not_inferred`, bound to the exact reviewed bytes and report. A technical command cannot authenticate a reviewer’s honesty; truthful actual-media review remains mandatory.

Any change to the candidate, relevant project input, review plan, evidence or review invalidates the old acceptance binding. Repair the failed interval or language treatment within the user’s scope, reuse unaffected approved assets/audio, encode a new candidate and rebuild/review the affected evidence plus the resulting full film. Do not mark an old report current by renaming a file or copying its approval text.

If a reviewer cannot watch or hear the required material, leave the candidate pending and state the missing check. A successful `accept` records independent visual acceptance; record the final user’s real response separately when it exists. Do not claim the user has accepted an unseen film. Deliver the MP4/preview together with its verified absolute folder link, review status and remaining gaps; publishing still requires its own authorization.
