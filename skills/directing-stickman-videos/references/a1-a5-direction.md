# A1–A5 · Planning and prompt direction

Read only for A1–A5, together with the [unified A workflow](mode-execution-boundaries.md#a-unified-workflow) and [production and review contract](a-production-and-review.md). A6/A7 use their own style references. The shared workflow owns delivery stages, source-to-edit timing, actual model settings, execution records, test/production authorization and finishing; this reference retains A1–A5 story, drawing and voice direction.

## Core contract

Turn one source into a confirmed director's proposal and then independently usable prompts for the approved shot plan. Select clip lengths from story beats and the chosen model's actual supported settings; shot count is derived from the plan, not total duration divided by ten. Preserve the source's meaning and the style's emotional narrative direction. Deliver the prompts before offering optional browser-assisted testing and finished production under the unified A workflow.

## Setup gate

Require these before planning:

- source material
- aspect ratio: `16:9` or `9:16`
- target duration: retain the requested duration (e.g. `25s`, `30s`, `60s`, `3min`); if omitted, propose `60s` in Phase A. Generation clips may have different supported lengths and be trimmed in editing.
- sound needs: narration/dialogue language and voice when used, captions, music and SFX; reuse stated choices and selected-style defaults, and make them visible in the proposal. An explicit no-narration brief overrides narration defaults.
- visual style and theme:
  - `Style 1 (Classic Minimalist)`: light (white background, black figure) or dark (black background, white figure)
  - `Style 2 (Modern Beanie Zeke)`:
    - `Style 2A (Modern Studio Tech)`: pure white high-key studio, subtle light-gray perspective grid, floating cyan/blue glass UI
    - `Style 2B (Cinematic Story)`: full-color narrative environments, cinematic lighting & depth
  - `Style 3 (Prehistoric Hand-Drawn / Dark Comedy)`: expressive white filled heads, black stick limbs, animal-hide costumes and earthy prehistoric settings; story-specific casting
  - `Style 4 (Cozy Storytelling / 治愈故事风)`: expressive minimalist white-filled characters with dark stick limbs in full-color 2D cartoon environments; varied story locations and cinematic shot changes
  - `Style 5 (Historical Cartoon / 历史卡通风)`: white heads with connected short white necks, expressive faces, black stick limbs and compact fingerless palms, period dress and cel-shaded historical settings

If aspect ratio or visual style is missing, ask for all missing items in one concise message and stop. If duration is omitted, propose 60 seconds for confirmation. Preserve a supplied duration without rounding it to a ten-second multiple. If a user specifies only light or dark theme, default to Style 1. Never select an aspect ratio or style silently. Do not re-ask choices already supplied.

Urgency, generation cost, client pressure, and requests to "pick normal settings" do not waive this gate.

## Workflow

1. Read `storyboard-template.md`, `style-catalog.md` and `voice-continuity.md`. Structure the narrative using the **5-Stage High-Completion Heartbeat Engine** (Golden Hook → Disrupting Assumptions → Unveiling Insider Secrets → Ultimate Truth Revelation → Elevation & Interactive Discussion), with timing dynamically scaled to the target duration and the style-specific exceptions below. Produce Phase A in the user's language, with exact VO when used in the approved narration language (English by default) and a reference translation where helpful.
2. Request approval of the director's proposal if not already approved. Reuse equivalent current approval; do not repeat this gate or withhold prompts for a confirmed plan.
3. If the user materially changes ratio, final duration, style, theme, narration, narrative scene structure or global direction, revise and confirm the affected part of Phase A. Preserve valid approvals elsewhere. Regrouping source jobs, trimming footage or adjusting joins within the approved story/runtime does not by itself require a new whole-plan approval.
4. Only after approval of the current Phase A, read `omni-flash-prompt-contract.md` and produce Phase B.
5. Use `examples.md` only when a concrete end-to-end example would resolve ambiguity.
6. Deliver Phase B as independently usable prompts with reference-image roles and model/settings notes, then offer optional browser-assisted testing under the [unified A workflow](mode-execution-boundaries.md#a-unified-workflow). Prompt delivery is a complete stopping point; after test approval, confirmed final settings and execution scope, the same prompts become production inputs for continuous generation, repair and finishing.

Topic approval, schedule pressure, or approval of an older draft is not approval of the current Phase A.

## Output rules

For Style 1 Light and Dark, use the [A1 default prompt structure](a1-prompt-structure.md). Build visual changes from the figure’s actions and give the ending an active payoff or handoff. Choose timing and props to serve the action. The generic device-count and discussion-ending rules below do not apply to A1 visual action sequences.

For Style 3, read `prehistoric-dark-comedy.md` before planning. Its casting, story rhythm, palette and continuity rules override the generic no-idle, device-count and five-stage discussion-ending rules below. Use setup → escalation → ironic payoff for narrative shorts; do not force a discussion question into a visual punchline. This is a visual storytelling style, not a claim about actual prehistory.

For Style 4, read `cozy-storytelling.md` before planning and prompt assembly. Default each new planned narrative segment to a different recognizable story setting, unless the user explicitly requests one location or approves a deliberate return. Preserve characters, drawing grammar, important props, movement direction and narrator—not an identical table or background across the whole video. Name the location cuts and any time jumps in Phase A. This is full-color cartoon storytelling, not a hand-drawn/sketchbook mode and not a claim of photorealistic 3D backgrounds.

For Style 5, read `historical-cartoon.md` before planning and prompt assembly. Keep its drawing grammar fixed while changing the era pack. Confirm story-specific cast cards, setting, palette, props and exact narration in Phase A; repeat the full approved style and visible cast descriptions in every Phase B prompt. Its historical palette, music, physical-action pacing and story ending override generic three-color, mandatory-piano, device-count, no-idle and discussion-ending rules below. Apply the existing shared voice contract; do not apply this style's character rules to Styles 1–4.

- Structure every script using the 5-stage high-completion flow:
  1. **Golden Hook**: Instant curiosity trigger via a counter-intuitive question or visual paradox. Timing is flexible based on duration (e.g. within the first 2–5 seconds in short videos, up to 10–15s in long videos); never open with generic platitudes.
  2. **Disrupting Assumptions**: State what everyone thinks is true, then shatter it in one sentence to build cognitive conflict.
  3. **Unveiling Insider Secrets**: Pull back the curtain on hidden mechanics, counter-intuitive details, or the real obstacle.
  4. **Ultimate Truth Revelation**: Deliver the underlying business logic or human psychology truth with maximum cognitive payoff.
  5. **Elevation & High-Engagement Discussion**: Conclude with a memorable punchline and an irresistible discussion prompt that sparks debate in the comments.
- When narration is used, pace its complete approved wording to the final story timeline, natural speech and pauses; 20–25 English words in ten seconds is a starting guide, not a per-source quota. Prepare and verify the independent narration master before editing picture against it. Leave room for physical action and reactions; do not trim syllables or force sentences into scraps of visual takes. Do not add narration to an approved no-narration brief.
- Plan connected, readable physical actions and consequences across the edited sequence. Setup, action and reaction may span several shots or sources; do not force the same three beats into every source or trimmed shot. Longer sources must continue advancing the story, with meaningful visual changes about every two to three seconds and at least four relevant visual devices where the selected style calls for them. Preserve the style-specific exceptions below.
- Keep character proportions, line weight, style, and narrator consistent across all clips.
- For Style 1, freeze the concise character anchor from `style-catalog.md` and repeat it verbatim in every clip. Keep two arms and two legs, one current pose per limb, stable proportions and uniform medium line weight; a moving arm replaces its previous pose rather than adding another arm. Keep the figure monochrome and saturated accents on props/graphics. Do not replace the anchor with "same character", ellipses, numeric anatomy recipes, skeleton/path instructions or clip-specific appearance descriptions. Occasional simple line expressions are allowed; the head remains hollow. Keep rich actions and effects separate from character design. Treat generated consistency as a visual acceptance check, not a guarantee from repeated text.
- For Style 1, limit the video to three saturated accent colors named with ordinary descriptive words (e.g. vivid red, electric blue, warm gold). For light theme, enforce a flat, digitally pure-white canvas with no textures, gradients, or 3D depth.
- For Style 2 (Modern Beanie Zeke), enforce character consistency:
  - Every standalone clip repeats the complete anchor verbatim: `A minimalist 2D animated stick figure wearing a bright red beanie (smooth rounded knit, no pom-pom) and a yellow t-shirt, with simple black stick limbs and shorts. Simple black lines, vibrant colors, smooth 2D animation style.`
  - Do not replace the full anchor with "the same character", an ellipsis or a shortened continuation.
  - No detailed eyes, pupils, or photorealistic features (avoids bug-eye deformation).
- For Style 2A (Modern Studio Tech), enforce: `in a modern bright white studio space with subtle light-gray perspective grid lines on the floor plane. High-key studio lighting, clean white negative space, sleek glowing cyan and electric blue glass holographic UI elements.` Always include negative constraint: `STRICTLY MINIMALIST, NO CIRCUIT BOARD TEXTURES, NO SCI-FI WALL PANELS, NO CRACKED CONCRETE.`
- For Style 2B (Cinematic Story), specify full-color narrative setting and cinematic lighting while preserving the 2D animated stick-figure character design.
- For Style 4, freeze each approved character's complete anchor and repeat it in every clip where that role appears. Separate static design from first-frame positions, timed prop transfers and final states; changing scene does not reset prop ownership or the narrator. Read its reference for shot variety and visual acceptance checks.
- For all styles, avoid abstract liquid/shape morphing. Drive motion with concrete character actions (leaping, touching glass, drawing luminous lines, opening doors) with timed beats covering the chosen clip length; `[0–3s]`, `[3–7s]`, `[7–10s]` illustrate a ten-second clip only. Never leave the character idle unless the selected style permits a motivated reaction hold.
- For **all A1–A5 styles using narration**, apply `voice-continuity.md`: choose and freeze a complete video-level voice profile in Phase A. Default finished films to an independently prepared full narration master under the [A audio timeline contract](a-audio-timeline-and-review.md). Repeat the full frozen English voice block only in video prompts actually requesting native speech; external VO does not belong in every footage prompt. Different videos may choose different voices; a scene/style/character change must not recast the narrator. Keep voice identity separate from visual/music escalation. Use a continuous film-level score or deliberately arranged cues, not a claim that clip 1 music will regenerate identically.
- Keep narration off-screen and audio-only unless another arrangement was approved. For external VO, specify speech timing as an editing cue without asking the video model to speak. For actual native speech, quote the exact complete approved line, preserve its bound performance through trims and forbid altered or repeated words. Keep generated speech-bubble/dialogue-box/text bans separate from any requested post-production subtitles.
- Never place technical color notation (hex, RGB, Pantone) inside generation prompts.
- Default generated clips to no visible words, letters, numbers, or interface copy. Put optional two-to-five-word overlays in a separate post-production note.
- Match each retained edit out-point to the next retained in-point through action, an important prop, screen direction or a planned cut. Unused source openings and tails need not match the final edit. Style 4 uses deliberate scene changes or approved time jumps; it does not require the same background in adjacent shots.
- Do not invent unsupported facts, statistics, quotations, or product claims.

## Revision rules

Recompose rather than rename:

- `16:9`: stage action across left, center, and right; use lateral tracking and negative space.
- `9:16`: use depth, stacked motion, vertical reveals, and interface-safe placement.

Theme, ratio, duration, or style changes require a fresh visual balance check. A global change requires confirmation of the revised plan; a local repair within the approved direction does not reopen the entire storyboard.

## Final check

Apply the checklist in the loaded reference. Repair any failed condition before responding.
