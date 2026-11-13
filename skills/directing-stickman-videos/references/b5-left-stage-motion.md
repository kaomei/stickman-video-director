# B5 left stage: causal slapstick, not prop slides

Read this before planning or coding any B5 story. It governs the **anonymous left-stage stickmen only**. The bottom-right presenter retains the approved identity, size, mouth/gesture system and audio; do not confuse presenter asset routing with left-stage animation. Follow [composition and rig safety](b5-avatar-motion.md), [sound](b5-sound-qa.md) and the [B5 production route](b5-character-explainer.md).

## What to learn from the reference

The source-led motion study uses the user-supplied CrazyMei reference, its directing instructions, original scene specification and editable choreography. Its distinctive mechanism is **a change in the actor's physical state**, not merely large objects, many events or fast easing. Learn this mechanism; do not transplant the account, presenter, narration, branded copy or every gag. Private reference footage is not bundled or licensed for redistribution by this instruction.

| Reference mechanism | Transferable direction | Insufficient substitute |
| --- | --- | --- |
| Falling weight → body becomes a pancake → hand sweeps it away → spring recovery | An object imposes a visible force; its consequence persists and drives the next action. | Board drops near an upright actor; both bounce independently. |
| Trip → cable winds around torso → blade contacts cable → released body somersaults | Establish a constraint, tighten it, then visibly release stored energy. | Rope icon, scissors icon and a smiling pose appear in sequence. |
| Battery drains → body loses height → ink puddle remains | Make a metaphor happen to the actor through readable intermediate states. | Battery percentage changes next to a sad but unchanged actor. |
| Swinging body → rope endpoint follows its hand → landing/recovery | Derive connected objects from the actor's actual transforms. | Animate a rope and hand separately until they happen to look close. |

The bundled Spider-Man film remains a proven B5 implementation example, not a ceiling on choreography quality. A newly generated story or passing geometry report is **not** an accepted motion baseline. If the original private video is unavailable, disclose that comparison gap; use the mechanisms above and bundled examples without pretending to have watched missing material.

## Action cards before code

Use the approved original-speed narration and actual word/phrase timing. Group by meaning; a long sentence may contain several action beats. Write a card for every main idea before rendering:

```text
beat_id / narration_span / actual_word_anchor / time_or_frame / fps
meaning: What idea must the viewer understand without labels?
before_state: Actor pose, weight, prop ownership and constraint.
anticipation: What loads, resists, approaches or winds up?
contact: Shared point/path, coordinate owner and force direction.
consequence: How the actor's silhouette, location or freedom changes.
secondary_motion: What trails, bends, rattles, catches up or falls next?
recovery: Recoil/overshoot/settle; final state feeds the next beat.
sound_event_id: Shared visual contact event, material and source transient.
hold_if_any: Duration, readable purpose and next change; not filler.
review_frames: Before / anticipation / contact / extreme / delayed response / recovery.
```

Keep a project-local cue ledger (for example `left-stage-beats.json`) with these fields or equivalent explicit information. Word anchors stay tied to the accepted voice; do not speed up, regenerate or recast narration to fit a stock gag. The ledger directs authoring; the [visual acceptance protocol](b5-visual-acceptance.md) additionally requires complete action coverage, evidence extracted from the final encoded candidate and independent actual-media review. A ledger or nonempty review string alone cannot pass it. The scaffold does not generate new choreography.

**Reject before code** if the card merely says “show a folder, scale in a photo, wiggle the actor, add a burst.” Replace it with a concrete action: an anonymous investigator pulls a stubborn folder, its contents suddenly give way, the body overbalances, sliding photos drag the gaze/body into the next setup. A news metaphor must remain visibly illustrative: no fabricated documents, quotations, dates, romantic acts or evidence. Don't imply that a real person performed the stickman's gag.

## Choreography and staging

Use **setup → anticipation → contact/constraint → exaggerated consequence → delayed secondary motion → recovery**. Not every minor beat needs all phases, but every main idea needs a readable causal chain and an unmistakably different before/after state.

- Stage the line of action and silhouette first. Decide what pushes, pulls, catches, blocks, carries or releases the actor. Use root translation/rotation, weight shifts, balance loss and pose changes; do not animate only hands, brows and prop scale.
- Props are acting partners. A large object should obstruct, weigh down, sweep, trap, stretch, topple, drag or release something. Size is relative to the actor, not a demand to fill the frame. One well-staged object can outperform ten popping icons.
- Make material behavior specific: paper bends under load, layers lag after contact and rebound in sequence; a heavy box resists before moving; a hinge rotates about its hinge; a mirror touch has approach, contact, recoil, inspection and a changed next attempt. No floating grip across a visible gap.
- At a reveal, change the visible premise, not only the heading. Something fails, gives way, flips, recoils or is reinterpreted, and the actor physically reacts. The ending of one chain should create the beginning of the next, rather than resetting to the same standing pose for each sentence.
- Vary the comic verbs across the film: catch/resist, compress/release, stumble/roll, wrap/escape, drain/collapse, swing/land are options, not a mandatory checklist. Do not reuse anvil → battery → scissors in every topic or perform every gag at maximum intensity.
- Use unequal timing: a legible wind-up, a fast contact, a larger follow-through and a brief settling beat. At 30 fps, roughly 5–9 frames of anticipation, 1–3 frames around contact and 6–15 frames of follow-through can be a starting experiment, not a uniform timing template. Scale to the actual action and speech; do not accelerate the whole timeline to fake energy.
- Alternate build-up, hit, consequence, pause and escalation. Flag a principal-stage plateau longer than about one second for review. A deliberate held weight, compressed body, trapped pose or comic stare may stay longer if its purpose and exit are explicit. Host mouth motion, subtitle highlighting, camera drift or a looping prop wiggle do not excuse an otherwise idle left stage. Do not turn this flag into compulsory cuts or random motion every second.
- Keep the cause and its result in a readable frame. A brief stage impact accent may support a hit; it does not replace it. Keep existing camera limits, typography outside camera transforms and meaningful negative space. Never use constant shake, an extra diagram, meaningless anxiety circles or repeated floating labels to manufacture activity.

### Arm and hand poses are part of the action gate

This requirement applies to **left anonymous actors**, independently of the presenter's rest/keyword gestures. Plan what each hand is doing before, during and after every main action. Use a supported resting pose when a hand has no task. Reach, resist, lift, catch or protect with a readable entry, shoulder/body response and recovery or handoff to the next task. Vary the line of action and elbow angles with the force; do not pin both arms overhead, reuse a stock wave or keep rigid symmetrical arms through unrelated beats.

A sustained raised pose can be correct while visibly hanging, holding weight, resisting or trapped. Name that constraint and inspect its continuous interval; a written reason cannot excuse an unsupported picture. Return or transition the arms when the force ends. Review normal bone lengths, plausible bends, one hand per task and actual grips throughout the clip. FX, moving props, mouth motion and captions cannot rescue an actor whose arm pose remains mechanically frozen. Do not add idle flailing just to pass a movement threshold.

## Normal rig versus comic deformation

Separate the **normal rig** from an **explicit comic deformation layer**:

1. Normal motion uses one current pose per limb, fixed segment lengths, plausible elbow direction, reachable IK targets and grounded feet. Walk/run requires changing support, not sliding a stationary stance. Airborne motion has a takeoff, arc and landing.
2. Deformation is a named, bounded action with an entry, extreme, follow-through and recovery (or a deliberately retained end state). Whole-body flattening, stretch, spin or melting is allowed when caused by the scene and semantically useful. An arbitrarily lengthened arm, duplicate limb, drifting joint or broken neck is not slapstick.
3. Apply deformation in a consistent local body space around the contact/pivot. Head and face participate when the entire silhouette flattens; do not automatically inverse-scale them back to a normal round head and erase the joke. Keep expressions readable at the extreme, with no accidental distortion of the separate presenter.
4. Bound grips and attached props to the **evaluated world transform**, including root rotation/deformation; use the same point for hand, rope end or held-object handle. A physically released object becomes independent only after the release event. Choose front/back limb order intentionally.
5. Record each intended exception to normal geometry in the action card. Keep normal-bone checks, and review deformation separately; never disable anatomy checks globally or excuse accidental spikes as comedy. Restore the normal rig cleanly unless the story deliberately ends in the transformed state.

The source's pancake (approximately 2.35× width / 0.12× height) and later collapse into a puddle demonstrate a large state change, **not universal numeric presets**. B5 does not require that amount of deformation, and some beats work through relocation, entanglement or balance alone. The test is a readable physical consequence, not matching a squash percentage.

## Shared event, sound and deterministic code

Give each important action a stable event ID used by picture and sound, for example `folder_release_02`. Record its actual narration anchor, contact time/frame, world contact point, material, force direction, actor before/after state, secondary-motion delay and recovery endpoint. Let that event drive any justified camera accent and SFX spotting, not independent approximate timestamps. Use actual source transient offset so contact lands within one frame at the project frame rate.

Preparation/air, contact, material tail and recovery sounds follow the different action phases. A paper release is not the same sound as a box impact. Leave room for the voice and selected accents; a generic whoosh/boom on every prop is not reference-level Foley. Reuse approved media and respect the existing cost and sound rules.

The renderer must be seekable and deterministic: evaluate pose/props from the requested project time/frame and shared event data, not wall-clock time, unseeded random state or accumulated playback. Separate actor rig, deformation, prop dynamics, stage camera, titles/captions and presenter layers so a local motion repair cannot accidentally resize the host or change the voice. Keep each requested aspect ratio native and review its staging independently.

## Reusable directing prompt

This is a distilled production instruction, not a verbatim recovered chat prompt. Adapt the bracketed inputs to the current story:

> Direct the anonymous left-stage stickmen as a causal slapstick scene for [approved script + word timing + ratio]. Keep the approved bottom-right presenter and narration unchanged. First produce action cards, then author deterministic code. Translate each main idea into setup, anticipation, physical contact/constraint, a conspicuous whole-body consequence, delayed material motion and recovery. Use story-specific oversized objects as forces, not decorative noun illustrations. Let an action's final state seed the next action. Vary timing, silhouette, force and comic verbs. Use a normal fixed-length rig plus explicitly bounded deformation where justified. Anchor grips, prop dynamics, SFX and restrained camera accents to shared contact events. Keep titles readable, captions semantic and the source's factual meaning intact. Reject prop-pop-plus-idle-actor scenes. Review before/contact/extreme/recovery strips and silent left-stage playback before judging the full mix. Do not regenerate approved assets, spend credits or publish without the applicable user authorization.

## Review gate, not just a successful render

Save the action cards and code/input records in the user's project. Keep candidate, extracted evidence, independent review and delivery directories outside that project so they do not change its input fingerprint. Follow the mandatory [candidate → evidence → independent review → accept protocol](b5-visual-acceptance.md). `encode` is pending, not accepted delivery. Use `review-pack` to extract the left-stage evidence from the final candidate MP4; review it **without sound, captions or presenter distraction**, then watch the complete encoded film with sound. Source-render isolation may help diagnose a problem, but it does not replace final-candidate evidence. Do not remake unaffected media just for an audit.

For each main chain, inspect a motion strip containing before, anticipation, contact, extreme consequence, delayed response and recovery; then watch the continuous interval with lead-in/out. A whole-film contact sheet only locates scenes. Check:

- Can a viewer name what acted on the figure and what changed? Does a reveal change the actor/premise rather than only its label?
- Are anticipation, fast contact, delayed response and recovery visibly different? No identical pulse easing across all props, teleporting exits or fades standing in for physical action.
- Do shared hand/prop/ground coordinates coincide? Are weight, silhouette, occlusion and normal/deformed rig states intentional and legible? Are the extreme and recovery clean?
- Does each arm have a visible task, support or natural rest? Are raised poses motivated through their full duration, with plausible shoulders, elbows, grips and recovery? Do unrelated beats avoid the same rigid overhead pose or repeated wave?
- Is a long hold purposeful? Does the next beat develop the state rather than repeat it? Is intensity varied rather than exhausting?
- Does title-aware framing fit both titled and untitled shots? Without a heading, is the actor-and-prop group large and high enough to read, rather than leaving an unused title area above a tiny bottom-strip action? Inspect setup/contact/extreme/recovery and interval boundaries for cropping; keep presenter and captions independent of the stage camera.
- With sound restored, does the correct material transient coincide with contact, and do consequential/recovery sounds remain audible under voice and music? A waveform alone is not listening evidence.
- Are accepted presenter, voice, unrelated shots and other styles untouched by a local fix? Is the requested ratio natively composed?

Fail any main chain that is just **prop entrance + small actor pulse + generic burst**, even when it has many cue events, valid IK, new headings and a successful render. Every main chain must have observed passing results; missing evidence, an unknown result or a blocking defect keeps the candidate pending. Repair the failed interval only, then bind new evidence and review to the resulting candidate. Record unavailable comparison/listening checks and pending user review honestly. Documentation/link tests prove the contract is present; **they do not prove a new video matches CrazyMei**. An updated Skill does not retroactively improve an existing preview.
