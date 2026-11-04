---
name: directing-stickman-videos
description: "Turn topics, requirements, articles or scripts into stickman videos. Director mode creates approved storyboards and standalone video prompts; Autopilot mode produces narrated, captioned illustration-and-micro-animation videos through configured generation tools and a local renderer. Also guide installation handoff, first use and setup of this specific Skill."
---

# Directing Stickman Videos

## Two modes, one Skill

Keep the existing installation/name. Honor known choices; ask one short question if the requested deliverable is ambiguous. Before planning, read [mode execution boundaries](references/mode-execution-boundaries.md), then the selected route:

- **A · Director / A1–A5:** approved proposals and standalone video prompts. A1 maps to Style 1 light/dark, A2 to Style 2/2A/2B, A3–A5 to Styles 3–5. Follow the unchanged contract below.
- **A6 · Amber Noir:** read [A6](references/amber-noir.md) when selected, before planning; bypass the A1–A5 contract below. It owns reference-guided execution, Gemini Puck narration and finishing.
- **B · Autopilot:** read [Autopilot](references/autopilot.md), then B1 [Minimal Line Art](references/b1-minimal-handdrawn.md), B2 [Colorful Hand-Drawn](references/b2-colorful-handdrawn.md), or B3 [Retro TV](references/b3-television.md). A finished local video includes narration, semantic captions, illustrations, meaningful motion and SFX. Inspect B3's bundled implementation examples before authoring; original-video excerpts are not redistributed. Disclose missing private-original comparison rather than treating accepted examples as the style authority.
- **B4 · Survival Thriller:** read [B4](references/b4-survival-storytelling.md), [audio direction](references/b4-audio-direction.md), [opening direction](references/b4-opening-direction.md) and [production check](references/b4-repeatability-check.md). Preserve the white-glove reference lock; limb animation is not a completion requirement. Apply the first-three-second visual escalation gate and, for horror, the story-led horror visibility gate. Use fixed Brian, first-frame sound/early narration, a subtle continuous bed and causal SFX. Select B4 in the shared installed runtime. No silent title pad, automatic narrator substitution or alias to another style.

A and B share installation, not production contracts. The rules from **A · Director** to the end apply only to A1–A5, not to A6 or any B style. Each B owns its visuals, captions, voice, pacing and SFX; never default to B1 or import A's setup, ten-second clips, approval or visible-text rules. Preserve unrelated styles when revising one route.

B supports topics, promotion briefs, posts, articles and scripts. English narration is default; explicit language/voice choices prevail. Use the selected native named TTS voice without added voice/style descriptions by default; B4 permits story-motivated secondary-role acting, not automatic narrator tuning. Read the required [story-led sound system](references/autopilot-sound-system.md). Never automatically revoice accepted media.

All B captions are semantic and single-line: preserve meaning, tight grammatical groups and actual speech pauses; split overlong cues into successive semantic units, not mechanical word counts or smaller type. Check encoded frames and sidecars under the [common caption gate](references/autopilot-production-qa.md#natural-captions-and-semantic-sound). A is unchanged.

## First use and next steps

Read [first-use and stage guidance](references/getting-started.md) after verified installation or on first invocation. Use the conversation/requested guidance language independently of video language or README edition. Reuse choices; do not replay welcome or add approvals. Follow **A5 proactive character guidance** and **Optional A character references** there without changing voice rules.

Read [optional finishing](references/thumbnail-publishing-kit.md) after final-video approval or a packaging request; offer once, never block delivery.

## A · Director

## Core contract

Turn one source into a confirmed director's proposal and then N standalone prompts for approximately ten-second Gemini Omni Flash clips (where N = target duration in seconds / 10; default 6 clips for 60 seconds). Preserve the source's meaning while structuring it through a high-completion 5-stage emotional narrative arc.

## Setup gate

Require these before planning:

- source material
- aspect ratio: `16:9` or `9:16`
- target duration: in multiples of 10 seconds (e.g. `30s`, `60s`, `90s`, `3min`, `5min`; default: `60s` / 6 clips if unspecified)
- visual style and theme:
  - `Style 1 (Classic Minimalist)`: light (white background, black figure) or dark (black background, white figure)
  - `Style 2 (Modern Beanie Zeke)`:
    - `Style 2A (Modern Studio Tech)`: pure white high-key studio, subtle light-gray perspective grid, floating cyan/blue glass UI
    - `Style 2B (Cinematic Story)`: full-color narrative environments, cinematic lighting & depth
  - `Style 3 (Prehistoric Hand-Drawn / Dark Comedy)`: expressive white filled heads, black stick limbs, animal-hide costumes and earthy prehistoric settings; story-specific casting
  - `Style 4 (Cozy Storytelling / 治愈故事风)`: expressive minimalist white-filled characters with dark stick limbs in full-color 2D cartoon environments; varied story locations and cinematic shot changes
  - `Style 5 (Historical Cartoon / 历史卡通风)`: white heads with connected short white necks, expressive faces, black stick limbs and compact fingerless palms, period dress and cel-shaded historical settings

If aspect ratio or visual style is missing, ask for all missing items in one concise message and stop. If duration is omitted, default to 60 seconds (6 clips). If a user provides a duration not divisible by 10, round to the nearest 10-second multiple. If a user specifies only light or dark theme, default to Style 1. Never select an aspect ratio or style silently. Do not re-ask choices already supplied.

Urgency, generation cost, client pressure, and requests to "pick normal settings" do not waive this gate.

## Workflow

1. Read `references/storyboard-template.md`, `references/style-catalog.md` and `references/voice-continuity.md`. Structure the narrative using the **5-Stage High-Completion Heartbeat Engine** (Golden Hook → Disrupting Assumptions → Unveiling Insider Secrets → Ultimate Truth Revelation → Elevation & Interactive Discussion), with timing dynamically scaled to the target duration. Produce Phase A in the user's language, with English VO and a reference translation.
2. Stop after the director's proposal and request explicit approval.
3. If the user changes ratio, duration, style, theme, narration, scene structure, or global direction, recompose Phase A and request approval again.
4. Only after approval of the current Phase A, read `references/omni-flash-prompt-contract.md` and produce Phase B.
5. Use `references/examples.md` only when a concrete end-to-end example would resolve ambiguity.

Topic approval, schedule pressure, or approval of an older draft is not approval of the current Phase A.

## Output rules

For Style 3, read `references/prehistoric-dark-comedy.md` before planning. Its casting, story rhythm, palette and continuity rules override the generic no-idle, device-count and five-stage discussion-ending rules below. Use setup → escalation → ironic payoff for narrative shorts; do not force a discussion question into a visual punchline. This is a visual storytelling style, not a claim about actual prehistory.

For Style 4, read `references/cozy-storytelling.md` before planning and prompt assembly. Default each new ten-second segment to a different recognizable story setting, unless the user explicitly requests one location or approves a deliberate return. Preserve characters, drawing grammar, important props, movement direction and narrator—not an identical table or background across the whole video. Name the location cuts and any time jumps in Phase A. This is full-color cartoon storytelling, not a hand-drawn/sketchbook mode and not a claim of photorealistic 3D backgrounds.

For Style 5, read `references/historical-cartoon.md` before planning and prompt assembly. Keep its drawing grammar fixed while changing the era pack. Confirm story-specific cast cards, setting, palette, props and exact narration in Phase A; repeat the full approved style and visible cast descriptions in every Phase B prompt. Its historical palette, music, physical-action pacing and story ending override generic three-color, mandatory-piano, device-count, no-idle and discussion-ending rules below. Apply the existing shared voice contract; do not apply this style's character rules to Styles 1–4.

- Structure every script using the 5-stage high-completion flow:
  1. **Golden Hook**: Instant curiosity trigger via a counter-intuitive question or visual paradox. Timing is flexible based on duration (e.g. within the first 2–5 seconds in short videos, up to 10–15s in long videos); never open with generic platitudes.
  2. **Disrupting Assumptions**: State what everyone thinks is true, then shatter it in one sentence to build cognitive conflict.
  3. **Unveiling Insider Secrets**: Pull back the curtain on hidden mechanics, counter-intuitive details, or the real obstacle.
  4. **Ultimate Truth Revelation**: Deliver the underlying business logic or human psychology truth with maximum cognitive payoff.
  5. **Elevation & High-Engagement Discussion**: Conclude with a memorable punchline and an irresistible discussion prompt that sparks debate in the comments.
- Scale English VO word count to approximately 20–25 words per 10-second clip across N clips (e.g. ~60–75 words for 30s / 3 clips, ~120–150 words for 60s / 6 clips, ~360–450 words for 3min / 18 clips, ~600–750 words for 5min / 30 clips).
- Give each clip three timed beats, at least four relevant visual devices, and a visual change every two to three seconds.
- Keep character proportions, line weight, style, and narrator consistent across all clips.
- For Style 1, freeze the concise character anchor from `references/style-catalog.md` and repeat it verbatim in every clip. Keep two arms and two legs, one current pose per limb, stable proportions and uniform medium line weight; a moving arm replaces its previous pose rather than adding another arm. Keep the figure monochrome and saturated accents on props/graphics. Do not replace the anchor with "same character", ellipses, numeric anatomy recipes, skeleton/path instructions or clip-specific appearance descriptions. Occasional simple line expressions are allowed; the head remains hollow. Keep rich actions and effects separate from character design. Treat generated consistency as a visual acceptance check, not a guarantee from repeated text.
- For Style 1, limit the video to three saturated accent colors named with ordinary descriptive words (e.g. vivid red, electric blue, warm gold). For light theme, enforce a flat, digitally pure-white canvas with no textures, gradients, or 3D depth.
- For Style 2 (Modern Beanie Zeke), enforce character consistency:
  - Clip 1: `A minimalist 2D animated stick figure wearing a bright red beanie (smooth knit, no pom-pom) and a yellow t-shirt, with simple black stick limbs and shorts. Simple black lines, vibrant colors, smooth 2D animation style.`
  - Clips 2–N: `The same minimalist 2D animated stick figure in a bright red beanie and yellow shirt... Simple black lines, vibrant colors, smooth 2D animation style.`
  - No detailed eyes, pupils, or photorealistic features (avoids bug-eye deformation).
- For Style 2A (Modern Studio Tech), enforce: `in a modern bright white studio space with subtle light-gray perspective grid lines on the floor plane. High-key studio lighting, clean white negative space, sleek glowing cyan and electric blue glass holographic UI elements.` Always include negative constraint: `STRICTLY MINIMALIST, NO CIRCUIT BOARD TEXTURES, NO SCI-FI WALL PANELS, NO CRACKED CONCRETE.`
- For Style 2B (Cinematic Story), specify full-color narrative setting and cinematic lighting while preserving the 2D animated stick-figure character design.
- For Style 4, freeze each approved character's complete anchor and repeat it in every clip where that role appears. Separate static design from first-frame positions, timed prop transfers and final states; changing scene does not reset prop ownership or the narrator. Read its reference for shot variety and visual acceptance checks.
- For all styles, avoid abstract liquid/shape morphing. Drive motion with concrete character actions (leaping, touching glass, drawing luminous lines, opening doors) with timed beats across `[0–3s]`, `[3–7s]`, and `[7–10s]`. Never leave the character idle.
- For **all styles**, apply `references/voice-continuity.md`: choose a complete video-level voice profile in Phase A, then repeat its full frozen English block verbatim in every clip. Different videos may choose different voices; a scene/style/character change must not recast the narrator. Lock timbre, register, accent, texture, delivery, pace and recording treatment, not just "same narrator". Keep emotional progression in visuals/music. Style-specific music rules never override this shared voice contract. Mandate BGM continuity from clip 1.
- Treat narration as audio-only (`Audio voiceover only, strictly no speech bubbles, no dialogue boxes`). Quote exact dialogue and forbid alteration, repetition, captions, subtitles, or visual transcription.
- Never place technical color notation (hex, RGB, Pantone) inside generation prompts.
- Default generated clips to no visible words, letters, numbers, or interface copy. Put optional two-to-five-word overlays in a separate post-production note.
- Match every clip ending to the next clip opening through action, an important prop, screen direction or a planned cut. Style 4 uses deliberate scene changes or approved time jumps; it does not require the same background in adjacent clips.
- Do not invent unsupported facts, statistics, quotations, or product claims.

## Revision rules

Recompose rather than rename:

- `16:9`: stage action across left, center, and right; use lateral tracking and negative space.
- `9:16`: use depth, stacked motion, vertical reveals, and interface-safe placement.

Theme, ratio, duration, or style changes require a fresh visual balance check. A global change invalidates prior approval.

## Final check

Apply the checklist in the loaded reference. Repair any failed condition before responding.
