# Omni Flash Production Prompt Contract

Use this contract only after explicit approval of the current Phase A. Refer to `references/style-catalog.md` for full style specifications and prompt blueprints. Apply `voice-continuity.md` to every style; visual-style overrides never replace its complete video-level voice profile.

Style 3 (Prehistoric Hand-Drawn / Dark Comedy): read `prehistoric-dark-comedy.md` and apply its override rules. Repeat the full approved cast descriptions for all visible roles, white filled heads, expressive cartoon faces, hair/clothing, earthy setting and layout in every prompt. Do not apply generic face/hair/texture bans or idle bans to its deliberate reaction beats. Use story-appropriate music instead of mandatory piano. Explicitly identify intended time jumps; otherwise match adjacent states. Technical output specs are targets, not guarantees of interface capabilities.

Style 4 (Cozy Storytelling / 治愈故事风): read `cozy-storytelling.md`. Repeat full character and voice anchors, but give each segment its approved new setting. Describe each scene opening as a recognizable new location, then connect action/prop/screen direction or a named time cut. Do not repeat one global room layout, inherit Style 1's no-face/filled-body bans, or require hand-drawn/paper aesthetics. Keep movable-object appearance separate from initial positions and timed state changes.

Style 6 (History Stickman): read `history-stickman.md` and apply its override rules. Repeat the verbatim drawing-style anchor, the era palette and setting, and the full approved cast cards for all visible roles in every prompt. Describe background crowds as uniform repeated ranks and keep named characters few. Do not apply generic face/hair/costume bans or idle bans to its deliberate reaction beats. Use era-appropriate music instead of mandatory piano, keep violence non-graphic, and forbid text on shields and banners. Explicitly identify intended time jumps; otherwise match adjacent states.

## Production package order

Deliver these sections in order:

1. Global continuity block
2. N standalone English prompts (where N = target duration / 10; default 6 clips for 60s)
3. Stitching guide
4. Voice and music continuity note

## Global continuity block

State the chosen aspect ratio (`16:9` or `9:16`), target duration, selected visual style (Style 1 Classic, Style 2A Studio Tech, Style 2B Cinematic Story, Style 3 Prehistoric, Style 4 Cozy Storytelling, or Style 6 History Stickman with its era pack), character anchor design, palette or environment definition, narrator identity, audio arc, and continuity strategy. Treat this block as a review summary; each prompt still repeats all critical locks.

## Standalone prompt order

Write every prompt in this order:

1. Output specification: approximately ten seconds, chosen aspect ratio (`16:9` or `9:16`), 720p target, 24 FPS, synchronized audio
2. Environment and background definition:
   - For Style 1 Light: flat, uniform, digitally pure-white canvas with no shading or 3D depth
   - For Style 1 Dark: flat, uniform, pitch-black canvas with pure white line art
   - For Style 2A (Studio Tech): modern bright white studio space with subtle light-gray perspective grid lines on the floor plane, high-key lighting, clean white negative space, sleek glowing cyan/blue glass elements
   - For Style 2B (Cinematic Story): rich full-color cinematic environment with volumetric lighting and depth of field
   - For Style 4 (Cozy Storytelling): full-color 2D cartoon environment and a segment-specific setting, with varied wide/close/moving shots; new segment means an intentional scene change unless otherwise approved
3. Character lock:
   - For Style 1: repeat the concise frozen character anchor from `style-catalog.md`, including the chosen polarity and expression setting; no "same character" shortcuts, numeric anatomy recipes, skeleton/rig definitions or pen paths. Keep the circular head hollow, proportions and line weight stable, and only the current pose of each of the two arms and two legs. A raised arm replaces its old lowered line. Keep accents on props/graphics, never recolor the figure. Do not let action or camera wording redefine the drawing; preserve rich motion and effects separately.
   - For Style 2 (Modern Beanie Zeke):
     - First clip: `A minimalist 2D animated stick figure wearing a bright red beanie (smooth knit, no pom-pom) and a yellow t-shirt, with simple black stick limbs and shorts. Simple black lines, vibrant colors, smooth 2D animation style.`
     - Subsequent clips: `The same minimalist 2D animated stick figure in a bright red beanie and yellow shirt... Simple black lines, vibrant colors, smooth 2D animation style.`
   - For Style 4: repeat its full frozen character anchor from `cozy-storytelling.md`, including white head/torso fill, dark limbs and simple facial marks. Location and expression changes do not redesign the character.
4. Palette and accent roles (expressed only with ordinary color names, no hex or technical codes)
5. Composition strategy for the chosen ratio (`16:9` or `9:16`)
6. First-frame state inherited from the previous clip
7. `[0–3s]`, `[3–7s]`, and `[7–10s]` visual beats tied to spoken ideas
8. Exact audio-only English dialogue in quotation marks (strictly no speech bubbles or dialogue boxes)
9. Complete frozen English voice block from `voice-continuity.md`, verbatim in every clip: identity/age, accent, timbre, register, resonance, texture, delivery, pace and recording treatment; no "same narrator" shortcuts or clip-specific recasting
10. BGM, synchronized SFX, and voice-first mixing (subsequent clips mandate seamless BGM continuity from clip 1)
11. Final-frame transition state inherited by the next clip
12. Negative constraints (including style-specific clutter/deformation bans)

Make each prompt self-contained and usable without any external context. Keep every standalone prompt under 3,600 characters (count the finished text, including anchor, cast cards, voice block, music and negatives); shorten beats, cast cards and SFX lists before touching the frozen voice block, drawing anchor or negatives.

## Style language

Use this wording to request density without character drift:

> rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency

Avoid `rapid style changes`, which can invite model changes to drawing style, line weight, or character design.

## Timed visual sequence & motion dynamics

Translate the approved storyboard row into three connected physical events:

- `[0–3s]`: establish or inherit the visual premise.
- `[3–7s]`: transform, escalate, or explain the metaphor through character action.
- `[7–10s]`: deliver a climax and create the next transition.

### Anti-Stutter & Anti-Lag Guidelines:
- Do not use abstract liquid or object shape morphing (e.g., stairs melting into a clock), as these cause diffusion latent jitter and frame drops.
- Drive motion with concrete character actions (leaping, touching glass, drawing luminous lines, opening heavy doors).
- Ensure continuous character engagement; never leave the character standing idle or staring at the camera for multiple seconds.

## Dialogue and visual text

Quote the approved English VO exactly once as audio-only dialogue:
```text
Audio voiceover only, strictly no speech bubbles, no dialogue boxes.
```
Instruct the model not to add, omit, paraphrase, repeat, reorder, caption, subtitle, or visually transcribe words.

Default every generated clip to no visible words, letters, numbers, captions, subtitles, interface copy, palette labels, production annotations, logos, or watermarks. Require icon-only message bubbles, content cards, clocks, meters, and notifications. Put optional approved phrases in a separate post-production overlay list outside the prompts.

## Palette notation

Use ordinary descriptive color names such as vivid red, electric blue, or warm gold. Never put hexadecimal, RGB, HSL, Pantone, or other technical color notation in a generation prompt. Models may reproduce prominent notation literally as unwanted interface text.

## Audio continuity contract

Use the shared contract in `voice-continuity.md` for Style 1 Light/Dark, Style 2A, Style 2B, Style 3, Style 4 and Style 6. Choose voices per video, not per clip. Every standalone prompt carries its own full voice and music instructions:

1. **Narrator Lock**: Resolve one complete approved profile, then repeat its frozen English block verbatim across all N prompts. Use the accepted male block or build another coherent profile; do not force all videos into one voice. "Same narrator" and "continue the voice from clip 1" alone are insufficient. Separate voice identity/delivery/recording treatment from the emotional and musical arc; no scene-specific timbre changes or switches into character dialogue unless explicitly approved.
2. **BGM Lock**:
   - Clip 1 establishes the musical theme.
   - Clips 2–N explicitly instruct the model: `Audio: Voiceover seamlessly continues the identical quiet, thoughtful piano and subtle soft ambient synth from clip 1, maintaining identical tempo, instrumentation, and optimistic narrative momentum. Synchronized crisp SFX on physical actions.`

## Negative contract

Forbid:

- photorealism and unwanted 3D humanoid rendering
- facial features (pupils, realistic eyes, lips) or hair unless approved
- extra limbs, malformed anatomy, disconnected lines, or changed proportions
- broken or changing line weight
- **For Style 1**: do not reject allowed occasional simple line expressions as character drift; filled heads, sudden head/body proportion changes, duplicated/retained limb poses, body silhouettes, separate hand/foot shapes and detached body lines remain failures. Inspect actual footage at reaches, releases, turns and walking poses, and compare clips. State the scope of inspection: sparse keyframes cannot prove the absence of brief errors.
- inverted theme polarity or unexplained colors
- unintended characters or irrelevant spectacle
- visible words, letters, numbers, technical color notation, palette labels, interface copy, captions, subtitles, logos, or watermarks
- altered, omitted, repeated, reordered, or added dialogue
- speech bubbles, comic dialog balloons, or visual text boxes
- **For Style 2A specifically**: `strictly minimalist studio aesthetic, no circuit board textures, no sci-fi wall panels, no spaceship corridors, no cracked concrete, no grunge textures`
- **For Style 2B specifically**: `no photorealistic human skin, no 3D humanoid CGI models, no chaotic line glitches`
- **For Style 6 specifically**: `no blood or gore, no photorealistic faces or skin, no glossy 3D CGI characters, no paper texture, no text or letters on shields or banners, no fused or duplicated heads in crowds, no changing costumes between shots`

## Stitching guide

List all N clips in order. For every cut, repeat the ending state and its continuing action/prop/direction, or state the approved location/time change. Style 4 changes scenery intentionally rather than requiring identical backgrounds. Include any trim, short audio crossfade, or match-cut note needed for assembly; inspect actual generated joins rather than assuming requested wipes landed on the last frame.

## Audio continuity note

Start with prompt-level consistency, rather than immediately routing voice drift to external dubbing:

1. Check that every prompt repeats the full frozen voice block and contains no conflicting voice directions. Compare actual audio by listening, not from screenshots.
2. If authorized, retest a voice-only change while holding visual instructions, dialogue, music and generation settings fixed. User-accepted improvement in the three-clip Style 2A Hope test supports this approach, not a guarantee for every profile or style.
3. Voice/audio references when supported, or one continuous external English VO/BGM track during assembly, remain optional further controls if exact matching is required or prompt-first correction is insufficient.

## Phase B checks

- The user approved the current Phase A.
- Exactly N standalone prompts are present (matching approved Phase A duration).
- Each prompt repeats ratio (`16:9` or `9:16`), style/theme, character, palette, voice, audio, transition, and negative locks.
- Style 1 prompts repeat one identical full character block and contain no contradictory appearance instructions. Simple-expression allowance agrees with the negative constraints. Generated consistency is checked separately from prompt compliance.
- Each prompt has all three timed beats and at least four relevant visual devices.
- Every ending connects to the next opening through a planned action/prop/direction or an approved location/time cut. Style 4 does not repeat one room unless requested.
- Dialogue exactly matches the approved narration.
- Dialogue is explicitly audio-only and is never displayed visually.
- Standalone prompts contain no hexadecimal, RGB, HSL, Pantone, or other technical color notation.
- Style 2 prompts feature the verified character anchor, BGM continuity lock, and anti-clutter negative constraints.
- All styles repeat an identical complete voice block per video (or per approved recurring speaker); no unresolved profile fields, abbreviated voice references or contradictory per-scene vocal directions remain. Actual audio acceptance is recorded separately from prompt compliance.
- Generated scenes contain no visible writing; optional overlay phrases are listed separately for post-production.
