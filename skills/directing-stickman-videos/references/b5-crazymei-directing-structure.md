# B5 — direct successive visual events with the Mei scene structure

Read for every new B5 story before choosing choreography. The [verified original Mei action prompt](b5-mei-original-prompt.md) is the source; the [fillable scene template](b5-mei-scene-template.md) transfers its structure. Both 16:9 and 9:16 use CrazyMei + Spider as quality targets. Keep the user's presenter, script, voice and approved assets separate from the reference's account and jokes.

## The macro structure comes first

The original prompt is **GOAL → Critical Animation Directives → scenes containing Voiceover / On-Screen Text / multi-step Animation Action / SFX**. It asks for high-energy slapstick instead of static slide cards. Its animation lists successively change the main visual:

| Original scene | Main visual handoffs |
| --- | --- |
| Hook | Quiet figure → huge avatar head rushing toward camera → airborne figure → landing and stars. |
| $50 | Falling anvil → pancake figure → giant hand sweeping it away → instant spring return → rising retention graph. |
| Subscriptions | Burning badges juggled → cable trip → wrapped figure → scissors cut → free pose. |
| Literal illustration | Paper sad face → giant X → body deflates → black puddle → flashing 1% battery. |
| Outro | Rope swing → huge downward arrow → free badge and sparkle burst. |

These are distinct visual events, transformations and replacements. A new main object, diagram, word or metaphor can take over the stage; a figure need not appear in every event. Preserve the meaning between events, not the same room, occupied task or physical constraint throughout the whole film. A continuous action is useful when a particular clause needs it; it is not the B5 default and cannot replace an event relay when that is the requested feel.

Start with the actual spoken meaning. Choose a sequence of specific visual verbs, such as rush in → squash → sweep away → spring up → draw/run along a rising curve. Do not copy that gag into every subject. For a different script, invent different but equally readable main-stage changes. Factual uncertainty and story sensitivity still govern what may be depicted. Visual metaphor must not manufacture evidence or make speculative motives certain.

## Fill the template before code

Copy [Mei scene template](b5-mei-scene-template.md) into the external production project and fill its four scene fields against actual speech timing. In Animation Action, list each main visual's entrance, decisive change, readable result and handoff/exit. State which visual leads next and what the transition means. A short preview may contain several events inside one scene. Match semantic changes rather than a fixed event-per-second quota.

On-Screen Text is editorial, optional when redundant, and separate from complete semantic captions. SFX describes an ordered event/material sequence; it is not permission for new paid sounds. Keep a quiet beat when the result needs to read. Do not fill every pause with shaking or confetti.

Before tweening, inspect a small storyboard of **main visual before → peak/result → next main visual**. If it is the same desk and figure across the whole row with small limb changes, revise the sequence when the brief calls for successive effects. Unrelated little icons around an idle figure also fail: the new event must change the stage's visual premise, scale, silhouette or interpretation.

Then make action cards and the visual/preview plans. Use `kind: physical` for force/contact acting and `kind: visual` for graphic reveals, transformations, replacements or emphasis. A planned readable hold belongs inside the event whose change it lets the viewer read; it is not a separate unchanged visual event. Physical phases refine a physical event; they must not force every idea into a bodily collision. See [action cards](b5-left-stage-motion.md#action-cards-before-code) and [schema](b5-visual-acceptance.md#review-record-and-binding).

## Timing from the actual source

The original prompt's 42-second plan was retimed to the approved 49.197-second voice. The bundled [16:9 choreography](../assets/b5/local-baselines/crazymei/choreography-source/16x9/hook.html) supplies implementation evidence, not a new acceptance claim:

| Actual source interval/event | Transfer the mechanism |
| --- | --- |
| Hook: head scale `.05 → .92` at `2.64–2.82s`; landing at `3.52s`. | Sudden large visual entrance, followed by a different silhouette and delayed aftermath. |
| Anvil: drift `6.16–6.8s`, fast drop `6.8–7.04s`, flatten in the next `.13s`. | Contrast a readable preparation with short decisive travel. |
| Flattened result held until about `10.8s`; hand sweep `11.08s`; spring `12.54s`; graph/run `14.08s`. | Let a result read, then hand the main visual to another event. Fast feel is not constant motion. |
| Trip `22.72s`, wrap `23.05s`, cut `25.62s`, FREE `25.9s`. | Offset related events; their starts and tails do not all share one pulse. |
| Paper/X `30.1s`, battery `36.06s`, 1% `37.04s`, deflate `37.92s`, puddle `38.6s`, stamp `39.64s`. | Switch the visual mechanism as the meaning changes; a purposeful hold can precede a compact cascade. |

The outer clock is linear, while each motion segment uses its own cubic-in/out, in-out or back curve. Do not smoothstep an entire scene or stretch every motion to fill its sentence. Use explicit piecewise endpoints, decisive travel and independently delayed tails. The [timing helper](../assets/b5/motion/tempo.cjs) interpolates values; it does not invent good staging.

## Physical implementation is event-local

For an actual impact, grip, load, flight or release, specify before/anticipation/contact/consequence/delayed response/recovery, shared world contacts and sound anchors. A drawer giving way needs retained grip until release. A graph drawing on needs a readable path and reveal; it does not need a fictional elbow or force. A wipe can clear the prior scene before a new metaphor takes over.

When a figure appears, lock the [actual Mei ordinary model](b5-avatar-motion.md#lock-the-anonymous-actor-model-before-new-choreography): head, trunk, limbs and stroke weight under uniform scale. Compare neutral/key poses at the same head diameter. Stage reachable contacts around it; never lengthen arms to reach a fixed desk. Bound intentional whole-body squash/melt separately from normal anatomy. Keep presenter and captions outside the stage camera.

The [V5 case](b5-v5-causal-workflow.md) remains an optional study of local contact ownership, timing and internal repair. Its continuous task and historical proportions are not the macro template or shape master.

## Verify the transfer in the actual film

For a default preview, review main visual handoffs, semantic triggers, scale changes, short decisive motion, readable results and staggered tails during the existing one normal-speed playback of the actual encoded film with sound. Compare both primary targets in that pass; a separate silent-stage playback/evidence round belongs to optional strict QA or investigation of an observed issue. A populated template, a verified original prompt or passing code tests cannot prove the new film has the desired effect. Preserve concrete failed intervals, repair them internally and keep missing checks pending under the [preview route](b5-first-preview.md).
