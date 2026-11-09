# B5 avatar conversion and physical animation

## When to generate an image; when to code

1. **Existing accepted cartoon/avatar:** retain its identity head (including liked anime/cartoon forms such as CrazyMei). Layer/animate it with code. Do not redraw it into a generic face or regenerate it merely to simplify implementation.
2. **New real person needing recognizable abstraction:** use native image generation with the identity reference and the B5 style reference identified separately. Keep the few distinctive silhouette, hair, eye/brow, face-shape and accessory cues; simplify shading and anatomy. Avoid both photographic detail and a generic round face that loses recognition. Get static approval before rigging. Popular or public figures are not automatically forbidden, but claims, context, permissions and provider rules still apply.
3. **Already accepted code-native identity:** reuse the approved rig, such as the bundled Spider-Man. Do not regenerate it unnecessarily.
4. **Anonymous left-stage actors, props, gestures, physics, camera, titles and captions:** code them. New missing views/expressions may need a targeted reference-conditioned image edit; do not regenerate the whole identity for one mouth state.

Never silently replace failed image generation with an unapproved generic SVG face or a different paid service. Save the accepted image, exact prompt, reference roles, dimensions, layer map and SHA-256. If automatic layer extraction is unreliable, disclose the constraint and obtain a targeted asset; don't promise a universal avatar auto-rigger. The latest code-only real-person redraw experiments were not accepted identity references.

## Reference composition (1920×1080)

- Paper `#EBE7E1`, ink `#1E1C1A`, red `#D7372C`, secondary gray `#858079`. Preserve natural negative space and purposeful variation, not uniform UI tags everywhere.
- Left stage approximately x=68–1180, ground near y=985. Anonymous expressive stickmen, clear silhouettes and objects large enough to drive the scene. Keep main actions out of the presenter/caption zone.
- Presenter at approximately (1615,770), scale 0.84, head about 425 px / 22% of width. Show head plus shoulders/partial torso; neither head-only nor a giant full body. Do not return to the oversized 1.10-scale version. Keep stable head proportions.
- Presenter hands rest by default. Trigger a short, semantically motivated gesture at key words, then return to rest; no permanently raised hands or looped waving. Animate speaking even for a mask: readable stylized mouth, eyes, blinks and small reactions, not just bobbing the head.
- Anton editorial titles are measured in screen space, outside stage camera transforms; keep their full outlines/shadows inside safe bounds. Captions use Instrument Sans bold in the upper-right region x≈1270, width≈550, baseline size≈62. B5's approved presenter-caption composition allows **up to three semantic lines**; this scoped layout overrides the B1–B4 single-line rule, not the semantic segmentation/actual-voice alignment standard. Never mechanically group every N words.

## Motion is the idea, not decorative activity

Author **anticipation → contact → force transfer → exaggerated result → rebound/reaction**. Use nonuniform acceleration, holds, squash/recoil and delayed secondary motion. A paper stack must compress on contact, its layers lag/rebound, and the actor must respond to that weight; a box resists before moving. Use oversized props and absurd physical consequences, not lots of unrelated symbols. Allow comic pauses, but don't leave the principal picture inactive longer than the common B gate.

At transitions, transform the visible premise through a clear physical action: for example, a title gets struck through as the actor's posture changes. In a mirror sequence use approach → touch → recoil → inspect → retouch → hands to self. Reflections must match contact and facing; don't substitute an idle mirror prop.

Maintain one current pose per limb, fixed bone lengths, plausible elbow direction, reachable targets and grounded feet. The sample's two-segment arms are 86/84 units with reach clamped below 170; use IK or an equivalent contact solver. Parent whole-body squash intentionally rather than independently stretching hands/arms. Grip and object contact share the same coordinate source.

Use brief stage impact accents (<0.2 seconds) and motivated pushes (typically ≤6.5%, rare ≤10%), not incessant shaking or speed for its own sake. Avoid identical keyframes/easing for every object.

**No meaningless anxiety bubbles, background circles, orbital lines or internal curved diagrams.** Express unease with shrugged/contracted shoulders, hunching, hands drawn inward, a small retreat or curled posture. Real ropes, mirrors and brief force/action lines are allowed when the audience can see what physically causes them. Keep other approved picture/audio untouched during a local repair.
