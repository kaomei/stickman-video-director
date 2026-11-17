# Director's Proposal Contract

Use this contract for Phase A under the [shared A workflow](mode-execution-boundaries.md#a-unified-workflow). Present a readable production proposal and obtain confirmation before writing model prompts; reuse a still-valid approved proposal rather than asking again. Do not require an upfront prompt-only/Agent route choice or a platform login to plan the film. Refer to `style-catalog.md` for style specifications.

Plan independent music, narration, native dialogue, SFX and ambience under the [A audio timeline contract](a-audio-timeline-and-review.md). Storyboard timing belongs to the final film; a picture trim does not automatically cut every sound role.

Style 3 (Prehistoric Hand-Drawn / Dark Comedy) is also supported. Before planning it, read `prehistoric-dark-comedy.md`; its cast-card, earthy palette, setup/escalation/payoff and reaction-pause rules override the generic five-stage, mandatory discussion-ending and device-count checks here. Include distinguishable cast cards and a location/prop continuity plan in Phase A. Treat the story as fictional analogy, not invented historical fact.

Style 4 (Cozy Storytelling / 治愈故事风) uses `cozy-storytelling.md`. In Phase A name a different recognizable main setting for each new planned segment by default, plus wide/close/moving shots inside it. Lock character design, important props and narration; scenery changes intentionally. Respect an explicit single-location request or approved callback. Do not call this style hand-drawn or require the same table/room across all segments.

Style 5 (Historical Cartoon / 历史卡通风) uses `historical-cartoon.md`. Include its era pack, complete cast cards, location/prop states, exact VO and shared `voice-continuity.md` profile in Phase A. Keep the drawing grammar while adapting clothing, architecture, palette and music to the era. Its narrative-short ending and physical-action pacing override generic discussion-ending and four-device requirements; reactions may pause deliberately. Separate historical facts from invented comic scenes.

## Rewrite the source

When narration is wanted, create natural narration in the approved language (English by default) that fits the approved voice, pauses and target duration. For English as an initial estimate only, 120–150 words per minute gives ~60–75 words for 30s and ~120–150 words for 60s; verify the actual spoken fit instead of enforcing a words-per-clip quota. Reserve time for physical actions, reaction pauses and music-only beats. Do not add speech to an approved silent film.

- Preserve the source's core claim, names, numbers, and factual meaning.
- Strengthen a weak opening with an immediate hook.
- Remove repetition and secondary branches from long sources.
- Expand short sources with a relevant example, progression, reframe, or callback.
- Prefer clear spoken English to literal translation.
- Simplify wording before increasing speaking speed.
- Do not invent research, statistics, quotations, product claims, or factual details.

Use the user's language for planning explanations. Keep the voiceover in its confirmed language and give a reference translation when helpful.

## Header contract

Present these items in order:

1. English title and reference-language title
2. Core message and opening hook
3. Chosen aspect ratio (`16:9` or `9:16`), target duration (without rounding to a fixed multiple), and selected visual style/theme
4. When narration is wanted, the complete video-level voice profile from `voice-continuity.md`, language and actual/estimated speaking duration, with external-master or native-speech routing; approved dialogue also records speakers, exact lines and mouth-bound source ranges. Otherwise record the approved no-speech choice
5. Up to three saturated accent colors (for Style 1) or visual palette/environment mood (for Style 2), named in ordinary language, and what each represents
6. Sound requirements (speech or no speech, subtitle language/style, BGM, SFX and ambience), independent master/cue plan, emotional turn, tone and narrative arc; for an MV, name the approved song/excerpt and use its timing as the edit master clock
7. Proposed per-clip timing and reference-image roles; note actual platform/model capabilities when known, or label them unverified handoff targets. Google Flow is the default Agent platform, not a prerequisite for approving the story

When speech is wanted, propose a source-appropriate coherent voice profile after required setup, not a compulsory universal baritone. Expand short preferences through `voice-continuity.md`. Keep that identity across the complete narration master or relevant native-speaking clips; only actual native-speech prompts repeat the full voice block. Separate emotional arc from stable vocal identity. Infer tone and palette from the source when unspecified.

## Narrative patterns: High-Completion 5-Stage Heartbeat Engine

To break through the 60%+ video completion rate threshold, structure every script through this emotional heartbeat progression:

1. **Stage 1: Golden Hook (黄金钩子)**
   - **Timing**: Flexible based on duration (in short 30s/60s videos, delivered rapidly within the first 2–5 seconds / `[0–3s]` of Clip 1; in 3–5min videos, establishes the premise across the first 5–15 seconds).
   - **Goal**: Ask an unexpected, counter-intuitive question or present a striking visual paradox that instantly creates an irresistible information gap. Never open with slow throat-clearing.
2. **Stage 2: Disrupting Assumptions (打破常识)**
   - **Goal**: Articulate the common belief or conventional wisdom that everyone assumes to be true, then shatter it in a single decisive sentence to create cognitive conflict and suspense.
3. **Stage 3: Unveiling Insider Secrets (拉出内幕)**
   - **Goal**: Pull back the curtain on a little-known technical mechanism, hidden friction, or systemic secret that keeps the audience captivated and curious.
4. **Stage 4: Ultimate Truth Revelation (真相揭秘)**
   - **Goal**: Deliver the underlying business logic, scientific mechanism, or human psychological truth with complete clarity. Give the audience the satisfying "aha!" breakthrough.
5. **Stage 5: Elevation & High-Engagement Discussion (升华互动)**
   - **Goal**: Crystallize the takeaway into a memorable punchline, and finish with a provocative, open-ended discussion question that compels viewers to take sides and debate in the comments.

### Clip allocation by narrative beats and supported duration

Choose segment lengths and action beats from the approved story, dialogue, music and transitions. Follow the [A production and review contract](a-production-and-review.md#generation-clips-and-edited-shots): generation clips are source assets, while edited shots are the portions retained on the final timeline. A source may contain several purposeful shots/actions; a shot may retain only its best usable range. Verify actual platform/model duration choices before submission; neither ten nor fifteen seconds is a compulsory length or a universal maximum.

A **25-second film** could retain `15 + 10` seconds, or `10 + 8 + 7` seconds, where supported and appropriate. It could also generate three ten-second assets and retain only `10 + 8 + 7` seconds. These examples assume straight joins; include any transition overlaps in the timeline calculation. Preserve 25 seconds rather than rounding the film to 30. Apply the relevant whole-story narrative structure across the film, not once per generated asset; short clips can carry one beat and longer clips can carry several connected beats.

## Storyboard contract

Produce ordered edited-shot rows with explicit final-timeline start/end times and source/trim/overlap mapping. Group these into N independently usable generation prompts; one prompt may cover multiple planned shots, so N is not necessarily the row count and never target duration / 10. Record the source generation duration separately from the retained range. The assembled runtime must match the approved film target. Keep prompt handoff possible even when tool settings have not yet been checked:

| Final time | Source / generated duration / retained range | Narrative purpose | Stick-figure scene | Motion, camera, and transition | VO if used (English by default) | Reference translation if needed | BGM / SFX |
|---|---|---|---|---|---|---|---|

Give each row a distinct narrative job and allocate speech by actual speaking time and approved pace, at semantic phrase/utterance boundaries. Prepare the complete narration independently and fit picture to it, rather than clipping speech into useful visual scraps. Map source-local native speech/SFX ranges to final times explicitly; preserve native mouth performance with its speech. Align any subtitles to actual final speech and semantic pauses, checking completeness and ordering rather than estimating from source duration.

## Visual-density recipe

Build connected physical events whose count and duration serve the story. Setup, action and consequence/reaction may span adjacent shots or source assets rather than repeating exactly three beats in every row. Assign explicit source-local action times and final-timeline shot times according to readable performance, speech pauses and music phrases. Longer clips must continue advancing the action with purposeful rhythm/framing changes; no idle padding to reach the model maximum.

Use at least four relevant devices across each generation prompt or coherent story segment where the selected style calls for this density, not in every short edited-shot row. Preserve style-specific exceptions and readable acting:

- expressive stick-figure action (running, jumping, touching glass, drawing lines)
- environmental transformation
- concrete visual metaphor
- diagram, arrow, or icon-only symbol
- particles, energy, fluid, explosion, or light
- camera push, pull, pan, orbit, shake, or tracking move
- foreground wipe or object crossing the lens
- match cut, shape morph, or motion-matched transition
- interaction with another figure or oversized object

Require a perceptible visual change every two to three seconds. Make every effect clarify or intensify the spoken idea; omit unrelated spectacle. Avoid abstract liquid morphing.

## Palette and text

Keep the background and stick figure monochrome according to the selected theme (for Style 1), or use high-key studio grid / cinematic lighting (for Style 2). Use no more than three saturated accent colors across the video. Assign semantic meaning such as anxiety, danger, energy, discovery, or success.

Name colors only with ordinary descriptive language. Do not use hexadecimal, RGB, HSL, Pantone, or other technical color notation anywhere in the proposal or production prompts.

Default the generated video to no visible words, letters, numbers, captions, subtitles, interface copy, or technical annotations. Make message bubbles, content cards, meters, clocks, and notifications icon-only. After the storyboard, optionally list concise two-to-five-word English overlays for post-production, including their target clips and safe placement; never carry those overlays into the video-generation prompts.

## Composition by aspect ratio

- `16:9`: use left-center-right staging, lateral tracking, horizontal match cuts, and deliberate negative space. Reserve clean space for optional post-production overlays when useful.
- `9:16`: use foreground/background depth, vertical reveals, stacked motion, foreground passes, and interface-safe overlay space.

Changing ratio requires new staging, camera paths, transition geometry, and overlay-safe negative space. Changing theme or style requires updated color balance and contrast checks.

## Continuity

End each row with a visible interface that the next row inherits: a pose, moving object, filled frame, travel direction, shape, or camera motion. Name both sides of every connection in the proposal. For Style 4, an approved location cut or time jump may replace literal background matching: state what continues (character, prop, direction or story action) and what changes (place/time). Do not spend all N clips at the same desk unless explicitly requested.

## Confirmation ending

End Phase A by asking the user to:

- approve the current proposal and receive its N standalone video prompts with stitching and reference/settings guidance;
- revise a named scene or narration passage; or
- change a global setting such as aspect ratio, duration, style, theme, palette, voice, or tone.

Do not include final model prompts before proposal approval. A material story/style/ratio/duration/voice change requires approval of the revised affected plan; retain still-valid choices and approvals. After prompt delivery, offer optional built-in-browser help with a representative trial at the chosen model’s lowest supported available resolution. Only run it if authorized; a user may instead self-generate with the prompt package. If the trial is accepted and full production is wanted, confirm final resolution, total credit cap including repairs, and scope before continuously finishing the film. Reuse existing authorization rather than asking again at every clip.

## Phase A checks

- Source, aspect ratio (`16:9` or `9:16`), duration, and style/theme are known.
- Script strictly implements the 5-Stage High-Completion Heartbeat Engine.
- Final clip ends with a provocative, comment-driving discussion prompt.
- Approved narration fits the available speaking time at its frozen pace, with natural pauses and action-only beats; any silent-video choice is respected.
- Edited-shot rows have distinct narrative purposes and actual timings, with source/trim/overlap mapping to N generation prompts and an assembled runtime matching the target; duration is not rounded to a fixed clip multiple.
- Each generation prompt covers its planned connected action beats with actual timing, at least four relevant visual devices unless the selected style overrides this count, approved sound requirements and planned joins. Do not impose three beats per edited shot.
- Visual change occurs approximately every two to three seconds.
- No more than three saturated accent colors are used (for Style 1) or clean palette rules followed (for Style 2).
- No technical color notation is present.
- Any proposed text is clearly separated as a post-production overlay and absent from generated scenes.
- Every adjacent pair has a named continuity connection.
- The ending returns to the central message and CTA.
- No unsupported factual detail was added.
- When speech is wanted, one complete voice profile is proposed for the whole video, independent of visual style; scene-specific audio notes do not contradict it. Any approved multiple speakers have separate stable profiles and explicit line assignments.
- The proposal gate approves the story, style, ratio, timing and sound plan; it does not authorize paid trials or unrestricted full production. Prompt-only delivery needs no service login.
