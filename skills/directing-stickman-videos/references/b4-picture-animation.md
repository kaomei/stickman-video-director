# B4 · Required story-led picture animation

Read with the [drawing lock](b4-survival-storytelling.md), [opening](b4-opening-direction.md), [typography](b4-typography-acceptance.md) and [runtime](autopilot-runtime.md#b4-production-tracks). This contract covers the opening, body and ending in either ratio. Local picture progression and local text animation are separate requirements; neither can borrow the other's pass. Apply this workflow automatically when making B4, without waiting for “add animation,” “use GIF” or another tool-specific reminder.

## Author before generating

For every shot, record the narrative intent, concrete **before → visible intermediate action/reveal → after → readable hold**, relevant subject/prop, screen region, layers/assets and actual voice/event times. Preserve script facts and reveal order. Plan the next shot's entry state, prop ownership, direction, cast identity and lighting. A plan is production input, not proof of animation. Every opening, body and ending shot must last **at most three seconds**. The same unchanged principal-picture state also cannot remain for more than three seconds across adjacent shots: a new crop, subtitle, micro-zoom, decorative effect or renamed shot does not restart that clock. Develop the subject through a real action or consequential prop/environment/information state change; retain meaningful animation inside the limit, rather than filling it with endpoint stills.

Choose the simplest treatment that communicates the event while retaining the drawing:

- **`local_action`:** separate background, character/prop and any foreground occluder. Draw contact key poses and needed transition poses for reaching, holding, switching or exchanging; preserve attached wrists, arm length, grip and pelvis/leg topology through the transition. Do not rotate a detached glove or morph unrelated whole bodies.
- **`state_reveal`:** use coherent matching-frame states or layered reveal art for a story-supported discovery/reaction. Preserve unchanged geometry, animate a local reveal and show a visible intermediate frame, then hold the consequence. Avoid doubled eyes/limbs. A hard cut between endpoint stills is insufficient.
- **`environment`:** animate a consequential environmental/prop change, such as a door opening enough to expose the scripted threat or a light failing to reveal its consequence. A substantive display/diagram state can count when it advances the story. Arbitrary rain, grain, glow, flicker and empty idle loops do not.
- **`motivated_hold`:** retain a well-drawn pose for tension, reading or reaction. Record the reason and an adjacent non-hold `supports_shot` whose visible action establishes or resolves it. Keep the hold and its shot within three seconds, including unchanged-state dwell across cuts. A short ordinary hold needs no extra user approval; it is not a long-shot exemption. Author-declared `exceptional_hold` or `user_approval` cannot waive the limit. The whole film cannot consist of holds.

No limb rig, walk cycle or lip sync is compulsory. A meaningful prop/environment reveal can satisfy picture progression while the figure remains still. Camera framing and sound can support it; camera-only push/pull, subtitle changes and decorative GIF loops cannot replace it. Match the principal picture's scale and visibility to normal playback; tiny, hidden or offscreen changes fail.

## Execute locally and validate the hardest beat first

1. **Inspect real capabilities.** In a capable code-production environment such as Codex or Claude Code, use the available local renderer and layered assets to make the animation. A missing AI-video endpoint is not a reason to stop at stills/prompts when local composition works. Check dependencies and an actual short render before declaring a limitation; tool/model names alone do not establish capability.
2. **Prove the hardest planned beat.** Reuse approved art/audio where valid. Render the most demanding contact action, state reveal or native portrait composition with before/intermediate/after/hold, and inspect its encoded clip. If another planned shot uses a different timing/hold pattern, validate that shot too within the three-second maximum; a short pilot alone does not establish sustained pacing. Simplify staging or repair only failed layers/poses before generating remaining assets. Do not produce a whole film of untested interactions first.
3. **Make the authorized representative preview.** Include genuine body-picture progression as well as the hook, refined animated text, semantic captions and retained native-rate audio. Place event/actual-pause beats within shots of at most three seconds; preserve coherent action and readable results without arbitrary flash cuts. A preview prefix cannot hide an overlong source shot: validate the complete planned shot, and include its complete action and result rather than manufacturing a pass from incomplete evidence.
4. **Finish in bounded chronological batches after the normal production authorization.** Keep a compact checkpoint and reuse valid assets, audio and cached shots. At each boundary check the outgoing/incoming state and distant repetitions. Once all shots exist, review the complete final MP4 continuously and inspect every shot's evidence. Do not lower later sections to static slides after an attractive opening.

This workflow does not authorize extra paid generation, a new provider, revoicing accepted recordings or remaking accepted films. Existing sample/cost/scope authorization still governs. Repair failed ranges only. If a real test shows an unresolved capability limit, record the failing operation and evidence, disclose exactly what is missing, and offer a limited result within scope. It remains unreviewed/limited, never a B4 sample-equivalent pass; no fabricated exception or ready-made passing review. Only a new, explicit user instruction changing the timing scope can establish a different requested treatment; record and follow that exact scope separately rather than infer it from a hold, an opening override or general approval.

## Runtime picture plan

Declare `picture_motion: {author_id, shots: [...]}` in `project.json`. Cover each actual shot exactly once, using its **zero-based index**. Each entry needs `kind`, `intent`, nonempty `before`/`after`, actual image `layer_ids`, `region: {x,y,w,h}` on the **1280-wide design plane**, and `times: {before,mid,after,hold}` in **absolute video seconds**. Layer key times remain **shot-relative**. Times must be distinct encoded phases within that shot; leave at least 0.16 seconds and two frames from `after` to `hold`. They locate evidence; they do not create motion. A `motivated_hold` additionally needs `reason` and adjacent non-hold `supports_shot`; it remains subject to the three-second shot and unchanged-state limits. Put `reuse_reason` on each affected entry when image content is shared across shots, even under renamed files; semantic repetition still needs review.

For example, after a three-second helper-generated opening, the following **body-shot excerpt** lasts three seconds (3–6 seconds on the video timeline). `body-before.png` and `body-after.png` must be actual coherent art that differs locally where the scripted trace emerges; identical files or an unrelated whole-scene dissolve fail. Merge this shot after the opening, preserving the project's narration, captions, tracks and other required declarations:

```json
{
  "start": 3, "end": 6,
  "layers": [
    {"id": "body-before", "type": "image", "path": "art/body-before.png", "x": 0, "y": 0, "w": 1280, "h": 720},
    {"id": "body-after", "type": "image", "path": "art/body-after.png", "x": 0, "y": 0, "w": 1280, "h": 720,
     "from": 0.8, "keys": [{"t": 0.8, "alpha": 0}, {"t": 1.2, "alpha": 1}]}
  ]
}
```

For that two-shot example, the picture declaration is:

```json
{
  "picture_motion": {
    "author_id": "actual-production-author",
    "shots": [
      {"shot": 0, "kind": "state_reveal", "intent": "The opening's scripted trace becomes visible",
       "before": "The trace is concealed", "after": "The trace can be recognized",
       "layer_ids": ["hook-before", "hook-after"], "region": {"x": 680, "y": 60, "w": 540, "h": 480},
       "times": {"before": 1, "mid": 1.2, "after": 1.4, "hold": 1.8}},
      {"shot": 1, "kind": "state_reveal", "intent": "The next scripted trace resolves in the doorway",
       "before": "No trace is visible beside the door", "after": "The trace is visible beside the door",
       "layer_ids": ["body-before", "body-after"], "region": {"x": 680, "y": 100, "w": 380, "h": 420},
       "times": {"before": 3.7, "mid": 4, "after": 4.3, "hold": 4.7}}
    ]
  }
}
```

These are schema examples, not approved story content or a complete project. Use the real author, story, layer IDs, visible region and actual animation times. The opening times above match the default three-second helper example; another opening must use its own choreography. Recompose the region and art for portrait; this landscape geometry does not validate 9:16. Keep text/captions outside the picture evidence region where possible and review actual occlusion.

## Encoded evidence and independent picture review

`validate` checks the declared picture plan and actual painted local changes. `preview`/`render` then create `output/preview-picture/` or `output/film-picture/`: hash-bound `evidence.json`, unknown `review-template.json`, before/mid/after/hold PNGs and a continuous MP4 clip for **every submitted shot**. Evidence comes from the actual encoded preview/film, not the source stills. Inspect each whole shot, not only selected phase frames. The diagnostics can reject missing, hard-switched or invisible motion; they cannot determine whether an action is meaningful, a threat frightening or a hold well judged.

The [asset-origin boundary](b4-asset-origin.md) blocks known reference copies in both shared-runtime and custom-renderer resource plans; it does not establish creative originality.

A real independent human or agent, different from `picture_motion.author_id`, must inspect the evidence and actual source MP4. Work from the generated unknown template and preserve its hashes/coverage. A new reviewer name on the author's own uninspected verdict is not independent review. Record every shot's five criteria with timed `observations: [{time, detail, evidence_ids}]`; each criterion references that shot's `shot-N-continuous` clip. Include phase frames where useful. Status words or source-code/keyframe descriptions alone are not observations.

| Criterion | Inspect in the encoded shot and return when |
| --- | --- |
| `semantic_motion` | The declared local before/intermediate/after/result advances this beat and is perceptible. Return static endpoints, camera-only movement, unrelated loops, decorative changes or hidden action. For a motivated hold, inspect its purpose and the actual adjacent supporting beat. |
| `anatomy_contact` | Drawing identity, full arm/leg topology, attached hands, grip, occlusion and prop paths remain coherent, including intermediate frames. Return detached/stretching limbs, doubled features or a clean endpoint hiding a broken transition. |
| `continuity` | Cast, location, direction, prop/state ownership, reveal order and the next-shot connection make sense. Return unexplained resets, spoilers, teleporting objects or batch-boundary mismatches. |
| `repetition_pacing` | Every complete shot and each unchanged principal-picture state lasts at most three seconds, with action/actual-voice timing and a readable result. Check state dwell across cuts as well as chronological/distant reuse. Return an overlong shot, a shortened preview concealing one, crops/subtitle updates/micro-zooms/decoration that falsely reset the clock, repeated empty loops, rushed cuts or prolonged filler. |
| `story_asset_origin` | Compare the actual visible cast, place, props and action with this authorized story. Return a bundled reference/showcase, old test scene, unrelated character or copied location used as new output, including crops/composites that the conservative whole-image detector cannot recognize. Timed observations identify the current-story content; asset hashes/provenance/reuse_reason alone do not establish it. |

`full_playback.viewed_ranges` must cover the complete submitted scope and its concrete observations reference `source-video`. Review the beginning, body, ending and cross-section reuse in one continuous run; a contact sheet cannot establish long-film stability. Portrait additionally requires actual **1× playback at 320–480 logical display pixels wide**, preserving aspect ratio, with the generated `portrait_viewing` record and timed observations. Record the player/platform, target display and any unavailable physical-device check honestly; a full-resolution still or landscape preview cannot supply it.

Unknown/missing/failed criteria, blocking issues, incomplete full-playback coverage or stale artifacts keep picture acceptance pending. Correct affected shots, regenerate their current evidence and review again. Fingerprints establish which files were reviewed; recorded identities and observations do not authenticate that somebody actually watched.

After genuine independent **picture and text** reviews and actual user sample approval:

```bash
node scripts/autopilot.mjs approve /absolute/project/project.json --note "actual user approval" --picture-review /absolute/project/picture-review.json --text-review /absolute/project/text-review.json
node scripts/autopilot.mjs render /absolute/project/project.json
```

The render rechecks both bound preview reviews; neither flag grants user authorization. Review the complete final MP4 anew for both tracks, then run:

```bash
node scripts/autopilot.mjs accept-picture /absolute/project/project.json --review /absolute/project/film-picture-review.json
node scripts/autopilot.mjs accept-text /absolute/project/project.json --review /absolute/project/film-text-review.json
```

`accept-picture` records only independent picture acceptance in `output/film-picture-acceptance.json`; `accept-text` records only typography acceptance. Picture acceptance retains `delivery_ready: false`; audio, remaining QA and actual user acceptance are separate. A successful encode, ledger check or text review cannot grant picture acceptance.

## Custom renderers and production ledger

A custom/code renderer must expose its real draw/picture-isolation adapter and the same per-shot declaration to `scripts/b4-picture-review.mjs` (`planB4Picture`, `checkB4PicturePaint`, `buildB4PictureEvidence`, `verifyB4PictureReview`), using its actual final MP4, project fingerprint and FFmpeg/FFprobe. Both callbacks take absolute video seconds and return synchronous same-size Canvas objects: `draw(t, {omitIds, focusIds})` paints the real composition, completely removing `omitIds`; `picture(t, {focusIds, principalMotionOnly: true, freezeAncestorsAt})` isolates the selected real image layers with text/captions/lines/shadows removed. Keep selected layers' ancestor transforms, but freeze ancestor local time at `freezeAncestorsAt` while each selected layer continues at `t`. An absent focus ID (the diagnostic uses `__b4_picture_empty__`) must paint an empty picture background, not the whole scene. Preserve the separate draw/text-registry adapter for typography. Extract and independently review both actual-MP4 evidence sets; no alternate manifest or successful local encode bypasses either gate. If adapter/evidence is unavailable, report that acceptance remains unreviewed.

The [portable production ledger](b4-repeatability-check.md) records asset provenance, timeline, audio and each shot's planned animation file/state events. Its frame-based `shots[].picture_motion` evidence schema is distinct from this runtime declaration; keep their asset, shot and timing references consistent. The ledger is read-only technical evidence and never renders or certifies a visually acceptable film.
