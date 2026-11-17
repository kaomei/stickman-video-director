# Style 4 — Cozy Storytelling / 治愈故事风

## Visual identity

Expressive minimalist characters in full-color 2D cartoon story environments. White filled round heads and slim white torsos contrast with dark stick limbs; the background carries color, atmosphere, gentle light and depth. Use clear cartoon contours and cinematic framing, not crude hand drawing, sketchbook borders, paper overlays or photorealistic/3D human characters. Do not inherit Style 1's hollow-head/no-face/no-filled-body bans or Style 3's animal-hide/cave defaults.

“Cozy” describes visual warmth, not a requirement that every script be cheerful. Preserve the user's meaning and the hook → conflict → insight → callback progression. Anxiety, science, education and serious life topics can use the same style. Settings and colors follow the topic, not a mandatory cafe, smartphone or pastel palette.

## Character design belongs to the story

Start with one protagonist for a simple explainer. Additional cast members must be explicitly planned, described and assigned to clips; do not spawn background commuters or clones. Freeze the complete design for each recurring role and repeat it verbatim wherever it appears. Different stories may choose other approved casts, but scene changes within one story do not recast them.

Default anchor, when the approved cast matches the samples:

```text
One minimalist 2D cartoon protagonist with a white filled circular head, two small dark oval eyes, simple eyebrow strokes and a short curved mouth. The torso is a slim closed tapered shape with solid white fill inside its dark outline. Both arms and both legs are dark single-line strokes with constant medium weight; hands are small dark rounded shapes and feet are short dark rounded strokes. No hair or clothing accessories. Keep the same head-to-body proportions, white head and torso fill, and outline weight in every shot. Exactly two arms and two legs exist; a moving limb replaces its previous pose rather than leaving another limb behind. Expressions change only the simple facial marks, never the head shape or character design.
```

Keep action, camera scale and props outside this design block. A close-up enlarges the entire character in the image; compare proportions, not raw pixel head size. Do not force covered limbs to show through tables, bedding or foreground objects. Temporary occlusion is not permission to add a replacement arm. Effects stay on props or detached graphics, not duplicated limb trails.

## New segment, new story setting

For a multi-clip video, default each new planned narrative segment to another recognizable main setting; choose its duration through the shared A workflow and actual model capabilities. Establish it immediately, then vary wide views, action close-ups, tracking and foreground passes inside the segment. Three clips at the same table with different zoom levels do not satisfy this default.

Possible story route: office interruption → commute pressure → outdoor break. This is an example, not a reusable compulsory plot. Re-block for 9:16 with vertical depth and reveals instead of reusing a horizontal layout. Respect an explicit single-location request or an approved return/callback.

Phase A names each location, its narrative purpose, and what connects the cut: character/prop identity, same travel direction, movement, a motivated foreground wipe, or an intentional time jump. Continuity means the story and characters continue, not that every desk, wall or window must be copied. Keep geometry stable within a continuous shot; new locations may have different scenery and furniture.

## Separate design, position and state

Use four distinct scopes in every standalone prompt:

1. Static design: character appearance; this clip's location and fixed furniture.
2. Movable prop identity: count, shape, color and relevant faces; no permanent initial placement.
3. First frame and timed transfers: who holds each prop, where it starts, what moves and which old location becomes empty.
4. Final state: what remains visible and which changes persist; do not restore initial placements after a departure or cut.

Do not put “the bag rests on the floor” into a global immutable room definition if the character later takes it away. Apply the same ownership rule to cups, pens, tools or other topic-specific props. Record object contact with its support: a lamp base touches the table; a resting cup stays on the surface; a held device touches the hand.

When an object has different visible sides, define them conditionally. For example, a phone front has a plain screen; a screen-down phone shows its unlit back, not a permanently visible colored screen. This is an optional phone adapter, not a required object in every story.

Graphical alerts or metaphors belong only to their approved timed beats. Use simple icon geometry rather than text-bearing cards. Do not place anxiety graphics into a shared global environment block and thereby recreate them in a calm final scene. Keep scenes free of captions, technical labels, color codes and random interface writing; add subtitles in post-production.

## Motion and audio

Use concrete actions, related effects and purposeful shot changes about every two to three seconds, with enough time to complete each handoff. Avoid liquid furniture transformations and too many simultaneous actions. A short sip, hesitation or reaction is useful; do not make the entire clip an idle talking pose. Warm daylight, moving leaves, passing trains and location-specific details can enrich the image without redesigning the character.

Apply `voice-continuity.md` and the [A audio timeline contract](a-audio-timeline-and-review.md). Freeze the approved voice identity for the whole narration master; repeat its full block only in prompts actually generating native speech. External VO does not belong in every footage prompt. A new place, mood or character cannot recast the narrator. Keep emotions in visuals/music, and environmental acoustics in independent ambience/SFX rather than changing dry narration into station/cafe reverb. Use a continuous story-appropriate score or deliberate musical cues; matching prompt wording does not guarantee a seamless regenerated soundtrack. The style is not limited to one male voice.

## Delivery and acceptance

The skill outputs the confirmed proposal and standalone prompt package. Flow operation, paid retries, downloading and publication still require user authorization. Preserve baseline samples and use bounded, issue-specific retests.

Before publishing a result or calling it consistent, check:

- Open each approved new narrative setting clearly, unless a single-location request/callback was approved. A technical split into source-generation jobs does not require another location or a repeated establishing shot.
- Character count/design, head/torso fill, proportions and current limb poses remain coherent at reaches, lifts, turns and walking steps.
- Prop ownership and visible faces match the action; no simultaneous hand/background copies or end-state resets.
- Movement direction and narrative meaning connect the cuts; time jumps are named. Different furniture after an intentional location cut is not itself a failure.
- Wipes land at actual usable frames, not necessarily the last generated frame; provide a candidate trim point rather than claiming seamless assembly without checking.
- No white card border, unwanted written labels, unintended people, or pressure graphics leaking into the calm ending.
- Actual audio is compared by listening. Repeated voice text and screenshots are not audio certification.

The 2026-10-14 Flow samples support the location-change approach and show the intended visual style. They are not a guarantee of frame-perfect anatomy, prop state or voice matching; detailed scoped observations live in repository `tests/reports/style-4.md`, not as marketing claims in the README.
