# B3 · Semantic lines and purposeful motion

Required for new B3 shot planning and independent review in **both 16:9 and 9:16**, alongside [B3 design and motion](b3-television.md) and [reference-effect acceptance](b1-b2-b3-reference-acceptance.md). Plan these decisions without waiting for a reminder to animate. This contract adds no fixed number of actions and does not require every layer to move. Preserve B3's restrained drawing/CRT language and the common 2.5-second principal-picture inactivity gate; it changes no other style's timing or motion rules.

## Plan from the spoken idea

For each shot, author `b3_semantics: {events, graphics}` before production. Use the actual aligned semantic caption cues and approved narration. Each credited event must show an idea, action, relation or information-state change needed by that sentence, with a visible process and a readable result. Use a short clean test of the hardest connector/contact/state transition before applying the television treatment. Reuse valid assets and audio; repair only affected shots.

`events` contains:

- `id`: stable event ID; `cue_index`: zero-based index in the project's actual `captions` array, including when inspecting a preview scope.
- `kind`: `action`, `state_change`, `relationship` or `signal_state`; `layer_ids`: the actual layers carrying the visible change.
- `start`, `end`: **absolute video seconds**, within the shot and aligned to the relevant spoken idea. Layer `keys`/`from`/`to` remain **shot-relative**.
- `before`, `after`: concrete, different visible states; `purpose`: what the event helps the viewer understand. Effective authored key changes must support the event. Every layer declaring `motion` needs event support; a nonempty reason or moving pixels alone is insufficient.

Include genuinely animated picture layers in event coverage even when their author omitted the `motion` marker. Moving image/shape/group keys cannot disappear from the semantic inventory through that omission. Titles, shadows, camera movement and honestly classified non-story finish retain their separate roles and do not supply principal-motion credit; registering an event alone does not grant that credit.

Apply the **deletion test** during review: if removing the motion loses no current information, causality, action or relevant emotional change, classify it as decoration rather than principal-picture motion. An unrelated wiggle, breathing loop, line scribble or repeated circle cannot fill the inactivity window. A calm pose is valid when meaningful prop, relationship or information progression carries the beat; do not force a gesture on each word or invent unsupported plot events.

## Classify marks and bind connections

`graphics` inventories every `arrow`, `line`, `underline`, and every `path` that declares `motion` or has effective animation keys, using the layer's `id`. Assign its actual `role`:

| Role | Use and motion credit |
| --- | --- |
| `connector` | A relation between two actual objects. Needs the object/anchor fields below; a dynamic connector also needs its supporting relationship `event_id`. A fully static relation earns no motion credit. |
| `emphasis` | A highlight, underline or attention mark. May support hierarchy; does not count as principal-picture motion. |
| `signal` | A trace or signal display. Only a supported `signal_state` event conveying actual new information may count. Ordinary ambient CRT scan/noise remains legal finish and does not count as semantic action. |
| `artwork` | Story artwork such as a contour or a limb. Credit only a supported actual action/state change, not movement added to satisfy a detector. |
| `decoration` | Nonessential visual texture/accent. Does not count as principal-picture motion. |

Decorative keys may remain for finish without a principal `motion` declaration. Remove false motion credit rather than inventing a semantic event for an underline, pulse or ambient trace.

Every `arrow` is a directed connector: `role: "connector"`, `directed: true`. Every connector declares a concrete `relation`, `directed: true|false`, and `source`/`target` each containing `{layer_id, x, y}`. The coordinates identify **object-local anchors**, not copied screen coordinates. Use actual visible objects, not the connector itself or an unrelated title. A plain relationship may use an undirected `line`; do not imply causality with an arrowhead when the narration only establishes association.

A connector declaring `motion` or carrying effective animation must bind `event_id` to its own supported `relationship` event. A fully static, useful relationship arrow/line without a `motion` declaration may omit `event_id`; it still requires correct anchors/relation, graphic inventory and actual-film review, and earns **zero principal-motion credit**. Do not add a reveal or force an event merely to register a short static relation. The common 2.5-second inactivity gate continues to apply to the overall principal picture.

Author the connector's real geometry to agree with those anchors, including nested group transforms. At its completed state, it must begin at the source and finish at the target in the declared direction. Keep the path attached as either object moves, rebind after an object is replaced, and re-author it when a 9:16 layout changes their positions. A partial draw can travel toward the target; the readable completed relation must arrive there. Remove obsolete connections before they point at an old or absent object. Avoid ambiguous branching, unexplained crossings and paths through faces, important details or captions; a necessary graph intersection must remain intelligible.

Use only animation the renderer actually supports: `arrow`/`line` support progressive drawing; a `path` is drawn completely and its `progress` keys do not create a draw-on. Its complete endpoints must stay correctly bound throughout its visible interval.

Classify structural outlines and normal signal styling honestly rather than relabeling arbitrary moving lines as actors or information. Unregistered marks cannot silently disappear from the review inventory. No connector is required when the idea is clearer without one.

## Minimal planning example

This **shot excerpt** illustrates the transmission relation in the caption “The sensor sends a signal to the alarm.” Suppose it is cue 0 from 0–3 seconds in the project. The two rectangles stand for schematic nodes; a production shot still needs clear object identification and refined artwork. The source's right-center and target's left-center are local anchors. This is schema/geometry illustration, not a complete film, approved art or evidence of successful playback review.

```json
{
  "start": 0, "end": 3,
  "layers": [
    {"type":"rect","id":"sensor","x":160,"y":200,"w":160,"h":100,"fill":"#858990"},
    {"type":"rect","id":"alarm","x":700,"y":200,"w":160,"h":100,"fill":"#e7e9eb"},
    {"type":"arrow","id":"signal-flow","x":320,"y":250,"w":380,"from":0.4,"to":3,
      "motion":{"role":"information","reason":"Reveal the stated sensor-to-alarm signal route"},
      "keys":[{"t":0.4,"progress":0},{"t":1.2,"progress":1}]}
  ],
  "b3_semantics": {
    "events":[{"id":"send-signal","cue_index":0,"kind":"relationship","layer_ids":["signal-flow"],
      "start":0.4,"end":1.2,"before":"No signal route is visible between the two nodes",
      "after":"A completed arrow shows the signal route from sensor to alarm",
      "purpose":"Explain which object sends the signal and which receives it"}],
    "graphics":[{"id":"signal-flow","role":"connector","event_id":"send-signal",
      "source":{"layer_id":"sensor","x":160,"y":50},
      "target":{"layer_id":"alarm","x":0,"y":50},
      "relation":"sensor sends signal to alarm","directed":true}]
  }
}
```

## Technical checks and actual-film acceptance

The `planB3Semantics` helper checks declared coverage, cue/event scope, effective keys and connector/anchor geometry. An old project without a plan may still produce an explicitly pending technical candidate so valid media can be inspected and repaired; it cannot pass B3 acceptance. New production must author the plan proactively. A custom project-local renderer must preserve this contract and provide equivalent evidence; changing the rendering route does not waive semantic review.

Geometry establishes only that the declared endpoints agree with the declared objects/anchors. It cannot identify the correct story object, prove the relation is true, see all final-MP4 occlusion, or judge whether motion helps the explanation. Pixel change, a completed ledger and a review template are not acceptance.

The independent reviewer must watch every submitted continuous audible shot at normal speed and inspect the actual final MP4, not infer motion from stills or fill passes from plans. In addition to the existing B3 style checks, review **every declared event and graphic**, and verify the visible inventory is complete:

- **Event:** cite its own continuous clip and times; explain the actual caption/voice meaning, visible before → process → after, why deleting the animation would lose relevant meaning, and whether the result remains readable. Reject no-op states, unsupported reactions, unrelated cycles and movement whose only purpose is detector coverage.
- **Graphic:** cite its own clip and times; identify the visible source/target, relation and direction, appearance order, completed endpoints and whether it follows object motion/replacement. Inspect the complete path, crossings, caption/subject interference and actual 9:16 placement where requested. For nonconnectors, confirm the declared role and whether it is being improperly credited as principal action.
- **Inventory:** compare the rendered shot with the plan. Missing/unregistered visible semantic marks, relabeled decoration, an omitted event or an incorrect target cannot be passed because the declared subset looked correct.

Use the generated `review.shots[].b3_semantics` record, whose `events` and `graphics` arrays cover each corresponding planned ID **exactly once**. The template starts unknown; fill the following only from actual inspection:

| Record | Required observed fields |
| --- | --- |
| `events[]` | `id`, `status`, `spoken_meaning`, `contribution`, `observations`. Explain the actual spoken idea and the deletion-test contribution; do not copy the author's intent as an observation. |
| `events[].observations[]` | `phase: "before"\|"during"\|"after"`, absolute `time`, concrete `detail`, `evidence_ids`. Cite the shot's own audible continuous clip, such as `"shot-0-continuous"`, for **every phase**. Include all three phases: before at or before event start, during within its interval, after at or after event end, all inside the submitted shot. |
| `graphics[]` | `id`, matching `role`, `status`, concrete `use`, and timed `observations: [{time, detail, evidence_ids}]` citing its actual continuous clip. Observe the graphic within its plan's `review_start`–`review_end` interval, when it is actually visible. For a connector, include a continuous-clip observation at or after `geometry.completed_start`, while the completed relation is still visible; an invisible time or an unfinished stroke cannot prove correct pointing. The itemized uses form the graphic-purpose inventory, including fully static connectors and marks that are deliberately not principal action. |
| Connector extras | `observed_source_id`, `observed_target_id`, `observed_relation`, `observed_direction: "source_to_target"\|"undirected"`. Identify the actual visible objects and meaning first, then check agreement with the declared source/target and direction. |

Event observations must fall within actual encoded frames of that shot. The exclusive shot/video endpoint is not a frame: finish the event early enough to retain an actual result frame, then independently judge whether the result remains readable. A prefix that cuts off the action or its result stays pending until extended.

A semantic review requires each event and graphic `status: "pass"`; the `observations` evidence key is `evidence_ids`. Watch the event through completion and readable result. A preview prefix cut off before the planned event ends cannot be accepted by reviewing only its available beginning; extend that submitted scope to include the complete action and result. A list of matching IDs or three isolated frames cannot establish continuous action, useful contribution, correct targets or a complete visible inventory.

Record concrete findings per item. Unknown, failed or incorrectly directed/meaningless items block acceptance, even in `limited` capability mode. Genuine tool limits may prevent sample-level aesthetic equivalence; they do not excuse false relations, random pointing or filler animation. Review the clean hardest interaction before the final CRT pass and confirm the final treatment preserves the meaning. Keep independent semantic findings, technical diagnostics and actual user approval separate.
