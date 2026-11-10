# B5 avatar conversion and physical animation

## When to generate an image; when to code

This decision is for the **bottom-right presenter only**. First reuse an accepted identity before considering either new-asset route; the rendering medium is not the character's identity.

| Presenter situation | Asset route | Approval boundary |
| --- | --- | --- |
| Existing accepted raster head or code-native identity | Reuse the exact approved asset/rig. Keep the liked CrazyMei cartoon head as raster; reuse the accepted Spider-Man SVG rig. Do not regenerate or redraw for implementation convenience. | Preserve the accepted scope and fingerprints. A new topic or ratio does not reset identity approval. |
| New real person requiring recognizable abstraction, such as Jensen Huang, Jack Ma or Musk | Prefer built-in/native image generation. Identify the identity reference and B5 style reference separately. Keep distinctive silhouette, hair, eye/brow, face shape and key accessories while simplifying shading/anatomy. | Get static approval before rigging. Neither a realistic portrait nor a generic round face is an accepted substitute for a recognizable B5 abstraction. |
| New complex anime/cartoon/IP identity, whose recognition depends on specific facial, hair or costume details | Prefer native reference-guided image generation. Retain the identity cues the user likes; simplify into the B5 head-plus-simple-stick-body composition. **Cartoon does not mean SVG.** | Review static likeness and abstraction before motion; do not assume another character is approved because Spider-Man worked. |
| Simple original geometric character, such as an original robot, orange cat, alien or astronaut | SVG may be authored directly when silhouette and a few facial features carry the design. A simple new recognizable mask-like design may also be considered only if SVG faithfully preserves its essential identity. | Show the static design for approval; “easy to code” is not enough. Do not force a real person or complex IP into this route merely to avoid image generation. |

These are quality-based defaults, not unconditional provider or rights permissions. Public figures and fictional characters are not automatically forbidden, but claims, context, permissions and provider rules still apply. A requested route override must retain the recognition and approval gates; do not claim an unrecognizable experiment is successful.

### From approved identity to code animation

For either new-asset route: **static preview approval → lock assets and fingerprints → roughly five-second speaking test → story preview**. Record each stage separately; an approved still is not an approved rig, full film or publication. Use existing cost/voice permissions, not automatic paid auditions.

Code drives the accepted head's mouth, blinks, reactions and short, semantically motivated gestures. A raster head does not need conversion to SVG to be animated. Preserve the approved simple body; do not add realistic neck, clothing or torso detail just because the source is a real person. Separate usable layers where reliable. If a missing expression, view or mouth asset requires an image edit, make only a targeted reference-conditioned edit and check that the identity stayed fixed; never regenerate the whole identity for one mouth state. Don't promise universal automatic layer extraction or avatar rigging.

Save the selected route and reason, source/accepted assets, dimensions, layer map, approval stage and SHA-256. For generated assets also retain the exact prompt and the separate identity/style reference roles; for SVG retain the editable source. Do not present a screenshot or unapproved redraw as the accepted identity master.

If image generation fails or is blocked, report the observed limitation and a scoped next option. Never silently substitute a generic SVG face, a different paid service or repeated provider submissions. If SVG loses recognition, stop at the static gate and propose an image-based route; do not animate first and hope movement fixes the likeness. The rejected code-only real-person redraw experiments are not accepted identity references.

### Fixed left-stage boundary

**Left-stage actors are always anonymous stickmen**, animated with code (SVG/canvas or the existing rig), with story-specific props, gestures, force, camera, titles and captions. Presenter selection changes only the bottom-right identity: do not turn left actors into that celebrity/IP or replace their physical-comedy grammar with generated talking-head shots. Large objects and absurd consequences are welcome when the action is concrete and causal; preserve the composition, anatomy, sound and semantic-caption rules below.

## Reference composition (1920×1080)

- Paper `#EBE7E1`, ink `#1E1C1A`, red `#D7372C`, secondary gray `#858079`. Preserve natural negative space and purposeful variation, not uniform UI tags everywhere.
- Left stage approximately x=68–1180, with a starting ground reference near y=985, not a compulsory placement for every shot. Anonymous expressive stickmen, clear silhouettes and objects large enough to drive the scene. Keep main actions out of the presenter/caption zone.
- Presenter at approximately (1615,770), scale 0.84, head about 425 px / 22% of width. Show head plus shoulders/partial torso; neither head-only nor a giant full body. Do not return to the oversized 1.10-scale version. Keep stable head proportions.
- Presenter hands rest by default. Trigger a short, semantically motivated gesture at key words, then return to rest; no permanently raised hands or looped waving. Animate speaking even for a mask: readable stylized mouth, eyes, blinks and small reactions, not just bobbing the head.
- Anton editorial titles are measured in screen space, outside stage camera transforms; keep their full outlines/shadows inside safe bounds. Captions use Instrument Sans bold in the upper-right region x≈1270, width≈550, baseline size≈62. B5's approved presenter-caption composition allows **up to three semantic lines**; this scoped layout overrides the B1–B4 single-line rule, not the semantic segmentation/actual-voice alignment standard. Never mechanically group every N words.
- Section titles above the left actors are optional editorial emphasis, not narration subtitles. Assign their role and timing at the storyboard stage; do not mechanically repeat them every shot or use them to explain an action already visible. Keep voice-aligned captions separate. Do not add top-edge account watermarks, creator handles or local-test labels by default; user-requested branding is an explicit opt-in.

### Title-aware framing

Plan **titled and untitled shots separately**. An untitled shot must not retain an unused title-sized blank area above tiny actors at the bottom. Enlarge and raise the **actor-and-prop group** or deliberately recompose its staging so the main action reads at normal playback size. Do not add filler headings, symbols or extra props to hide a composition problem; meaningful negative space still serves the action.

Use a fixed, shot-specific camera framing selected from the setup, contact, extreme and recovery poses. Keep uniform scale, shared grip/contact relationships and the visible cause-and-result chain; never lengthen limbs or enlarge the head alone to fill the frame. Do not use per-frame bounding-box auto-zoom, which causes unintended breathing and drift. A new framing is distinct from a small animated camera accent: compose first, then apply the existing restrained motion limits.

Keep stage artwork, ground, screen-space titles, captions and presenter in separate layers. A left-stage framing repair must not resize the presenter, move captions, retime choreography or change the accepted audio. Check all action extremes for cropping and collisions in each native ratio, including the first and last frames of each reframed interval. Review both the full layout and the left-stage crop; a large empty upper half with a small bottom-strip action is a failed untitled composition unless explicitly motivated.

## Motion is the idea, not decorative activity

Read and apply the mandatory [left-stage action contract](b5-left-stage-motion.md) before authoring. This section fixes composition and rig safety; that contract fixes choreography and its evidence. The left stage is a physical-comedy scene, not a sequence of illustrated information cards.

Author **anticipation → contact → force transfer → exaggerated result → rebound/reaction**. Use nonuniform acceleration, holds, squash/recoil and delayed secondary motion. A paper stack must compress on contact, its layers lag/rebound, and the actor must respond to that weight; a box resists before moving. Use oversized props and absurd physical consequences, not lots of unrelated symbols. Allow comic pauses, but don't leave the principal picture inactive longer than the common B gate.

At transitions, transform the visible premise through a clear physical action: for example, a title gets struck through as the actor's posture changes. In a mirror sequence use approach → touch → recoil → inspect → retouch → hands to self. Reflections must match contact and facing; don't substitute an idle mirror prop.

Maintain one current pose per limb, fixed bone lengths, plausible elbow direction, reachable targets and grounded feet in the normal rig. The sample's two-segment arms are 86/84 units with reach clamped below 170; use IK or an equivalent contact solver. Grip and object contact share the same coordinate source. Use a separate, explicitly timed whole-body deformation layer for intentional comic flattening, stretching or melting; this is not permission for accidental long arms or broken joints. Include its entry, extreme and recovery states in QA. Do not inverse-scale the head to cancel a deliberately flattened whole-body silhouette. See [normal rig versus comic deformation](b5-left-stage-motion.md#normal-rig-versus-comic-deformation).

Use brief stage impact accents (<0.2 seconds) and motivated pushes (typically ≤6.5%, rare ≤10%), not incessant shaking or speed for its own sake. Avoid identical keyframes/easing for every object.

**No meaningless anxiety bubbles, background circles, orbital lines or internal curved diagrams.** Express unease with shrugged/contracted shoulders, hunching, hands drawn inward, a small retreat or curled posture. Real ropes, mirrors and brief force/action lines are allowed when the audience can see what physically causes them. Keep other approved picture/audio untouched during a local repair.

## Continuous presenter acting, without losing identity

Use the [accepted local baselines](b5-accepted-baselines.md) to judge acting in motion. Lock the approved head, hair/glasses and body silhouette; animate mouth, brows, lids, gaze, small head tilts and motivated gestures independently. For an accepted raster face, mask only the intended feature region using matching skin, retain the head boundary and glasses, and render one current eyelid/pupil/mouth per feature. Reject ghost pupils, doubled lids, exposed mask edges, rubber jaws and face-wide rescaling. Speech aperture must not inadvertently turn a frown into a smile. Use dry-speech levels plus word timing, not music peaks, and don't claim phoneme-accurate sync.

Author a story-level emotional baseline with beat-specific variation and smooth transitions; inspect opening, middle, pauses, transitions and ending, not just the strongest expression. Do not reset automatically to a happy stock host between keyframes or hold one unchanged face throughout. A character requested as miserable throughout must stay miserable while speaking, with crying peaks and recoveries rather than an identical looping tear gag. **That instruction belongs only to the Jensen fixture, not all B5 presenters**: a cheerful or neutral story requires its own appropriate emotional baseline, without inherited sadness or tears. Cartoon tears are visible acting, not permission to add sobs or regenerate accepted audio.

Default hands rest; gestures occur at relevant words and return to rest. A facial-only revision must preserve the accepted body, stage, captions and encoded audio. Carry out a sampled head-boundary/nonface comparison before accepting that scope claim.
