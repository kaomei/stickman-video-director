# A1–A5 Production Prompt Contract

Use this contract only after explicit approval of the current Phase A. Follow the [shared A workflow](mode-execution-boundaries.md#a-unified-workflow): deliver the standalone prompt package first, then offer optional Agent generation. A prompt-only delivery needs no browser, login or generation expenditure. Read the [A production and review contract](a-production-and-review.md) for generated-source versus edited-shot timing, fixed reference use, progress records, bounded retries and actual-output acceptance. Refer to `style-catalog.md` for full style specifications and prompt blueprints. Apply `voice-continuity.md` to the approved video-level voice identity, and the [independent A audio timeline contract](a-audio-timeline-and-review.md) to assembly. For narrated finished films, default to an independent complete narration master; repeat a voice block in video prompts only for explicitly approved native speech. Preserve an approved no-speech choice.

The filename is retained for compatibility; it does not select a model. Record the actual chosen platform/model and supported settings when known. For prompt-only handoff, label unverified settings as targets. Do not assume Omni Flash, a universal clip length, 720p or a selectable frame rate. An authorized representative trial uses the selected model’s lowest available supported resolution; final resolution and total credit cap, including repairs, are confirmed before continuous full production. Reuse valid prior approvals.

Style 3 (Prehistoric Hand-Drawn / Dark Comedy): read `prehistoric-dark-comedy.md` and apply its override rules. Repeat the full approved cast descriptions for all visible roles, white filled heads, expressive cartoon faces, hair/clothing, earthy setting and layout in every prompt. Do not apply generic face/hair/texture bans or idle bans to its deliberate reaction beats. Use story-appropriate music instead of mandatory piano. Explicitly identify intended time jumps; otherwise match adjacent states. Technical output specs are targets, not guarantees of interface capabilities.

Style 4 (Cozy Storytelling / 治愈故事风): read `cozy-storytelling.md`. Repeat the full character anchor, with the approved setting for each narrative scene; add the full approved voice block only when requesting native speech. Keep an external narrator's profile in its separate synthesis plan. Make a planned location change recognizable, then connect action/prop/screen direction or a named time cut. A technical generation split does not require a new setting or another establishing shot. Do not repeat one global room layout, inherit Style 1's no-face/filled-body bans, or require hand-drawn/paper aesthetics. Keep movable-object appearance separate from initial positions and timed state changes.

Style 5 (Historical Cartoon / 历史卡通风): read `historical-cartoon.md` for its standalone prompt order and overrides. Repeat the full frozen drawing anchor, visible cast cards and approved era pack in every clip; add the complete `voice-continuity.md` voice block only to explicitly approved native-speech prompts. Keep connected short white necks, expressive individual faces, solid oval eyes, thin black exposed limbs and small solid black mitten-shaped palms continuous with the wrists, one subtle integrated thumb lobe, no individual fingers, finger separations, white fills or gloves, with historical costume and colored painterly scenery. Do not inherit Style 1's hollow-head/no-face/no-clothes contract or generic piano, three-color, four-device and no-idle requirements. Follow its era score, physical beats and planned cuts; do not shorten approved anchors to meet an arbitrary character budget.

## Production package order

Deliver these sections in order:

1. Global continuity block
2. N standalone English generation prompts, grouped from the approved edited-shot plan with source durations and retained ranges; one source may supply several edited shots. Choose N from the story rhythm and actual selected model’s supported clip lengths, not the storyboard-row count or a duration / 10 formula
3. Stitching guide
4. Voice and music continuity note
5. Reference-image roles, proposed platform/model settings, and an optional next-step offer: self-generation or an authorized low-resolution representative trial, followed by separate final-resolution/total-budget confirmation if full production is wanted

## Global continuity block

State the chosen aspect ratio (`16:9` or `9:16`), target duration, selected visual style (Style 1 Classic, Style 2A Studio Tech, Style 2B Cinematic Story, Style 3 Prehistoric, Style 4 Cozy Storytelling, or Style 5 Historical Cartoon), character anchor design, palette or environment definition, narrator identity when used, audio arc, and continuity strategy. Treat this block as a review summary; each prompt still repeats all critical locks.

## Standalone prompt order

Write every prompt in this order:

1. Output specification: source ID, approved generated duration, retained range(s) mapped to the final edited timeline, and chosen aspect ratio (`16:9` or `9:16`); state supported resolution/audio/frame-rate settings only when verified, keeping trial and final output settings distinct. If a desired runtime differs from the tool’s available duration, name the generated duration and planned trim instead of rounding the whole film
2. Environment and background definition:
   - For Style 1 Light: flat, uniform, digitally pure-white canvas with no shading or 3D depth
   - For Style 1 Dark: flat, uniform, pitch-black canvas with pure white line art
   - For Style 2A (Studio Tech): modern bright white studio space with subtle light-gray perspective grid lines on the floor plane, high-key lighting, clean white negative space, sleek glowing cyan/blue glass elements
   - For Style 2B (Cinematic Story): rich full-color cinematic environment with volumetric lighting and depth of field
   - For Style 4 (Cozy Storytelling): full-color 2D cartoon environment and a narrative-scene-specific setting, with varied wide/close/moving shots; follow approved scene changes rather than forcing a location change at every generation boundary
3. Character lock:
   - For Style 1: repeat the concise frozen character anchor from `style-catalog.md`, including the chosen polarity and expression setting; no "same character" shortcuts, numeric anatomy recipes, skeleton/rig definitions or pen paths. Keep the circular head hollow, proportions and line weight stable, and only the current pose of each of the two arms and two legs. A raised arm replaces its old lowered line. Keep accents on props/graphics, never recolor the figure. Do not let action or camera wording redefine the drawing; preserve rich motion and effects separately.
   - For Style 2 (Modern Beanie Zeke):
     - Every clip: `A minimalist 2D animated stick figure wearing a bright red beanie (smooth rounded knit, no pom-pom) and a yellow t-shirt, with simple black stick limbs and shorts. Simple black lines, vibrant colors, smooth 2D animation style.` Repeat the full anchor; never replace it with an ellipsis or a previous-clip reference.
   - For Style 4: repeat its full frozen character anchor from `cozy-storytelling.md`, including white head/torso fill, dark limbs and simple facial marks. Location and expression changes do not redesign the character.
4. Palette and accent roles (expressed only with ordinary color names, no hex or technical codes)
5. Composition strategy for the chosen ratio (`16:9` or `9:16`)
6. Source-opening state and intended retained in-point state; at a continuous edit, the retained in-point inherits the preceding retained out-point's pose, prop and screen direction. Any generated lead-in is separate from the edited opening
7. Connected visual action beats with actual source-local start/end times, tied to the story and any spoken/music phrases; choose their number from the performance, not a fixed three-beat template. Include the edited-shot mapping and intended retained ranges when a generated asset supplies several shots or only part is used
8. Approved sound role: external narration/music, explicitly approved native speech, or no speech. For external-master footage, request no generated speech or BGM as appropriate, retaining only desired native Foley/ambience when supported; spoken timing cues do not ask the model to narrate. Inspect returned audio rather than assuming silence or isolated stems
9. Only for native-speech generation: exact complete approved audio-only line in its approved language (English by default), correct speaker and complete frozen English voice block from `voice-continuity.md`, verbatim in every relevant prompt. Include identity/age, accent, timbre, register, resonance, texture, delivery, pace and recording treatment; no "same narrator" shortcuts or clip-specific recasting. External VO wording/profile belongs in its independent synthesis plan, not in video generation prompts
10. Desired synchronized Foley/ambience cues and their source-local times; outside the generation prompt, map them to the retained edit and record the independent full-film BGM/VO tracks, deliberate musical transitions and mix priorities. Do not ask later source clips to continue clip 1's generated music
11. Intended retained out-point and transition state inherited by the next edited shot; unused generated tails do not define the final cut
12. Negative constraints (including style-specific clutter/deformation bans)

Make each prompt self-contained and usable without any external context.

## Style language

Use this wording to request density without character drift:

> rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency

Avoid `rapid style changes`, which can invite model changes to drawing style, line weight, or character design.

## Timed visual sequence & motion dynamics

Translate the approved storyboard into connected physical events with explicit source-local timestamps. Setup, action and consequence/reaction can span adjacent edited shots; a short source may carry one event, while a longer source may contain several motivated shots/actions. Allocate timing by actual duration, readable action, speech pauses and music phrases, following the [shared generation/edit contract](a-production-and-review.md#generation-clips-and-edited-shots). Do not impose fixed three-beat windows, equate each source with one edit shot, or stretch one picture to fill the model maximum. Preserve the requested final runtime after trims and joins.

### Anti-Stutter & Anti-Lag Guidelines:
- Do not use abstract liquid or object shape morphing (e.g., stairs melting into a clock), as these cause diffusion latent jitter and frame drops.
- Drive motion with concrete character actions (leaping, touching glass, drawing luminous lines, opening heavy doors).
- Ensure continuous character engagement; never leave the character standing idle or staring at the camera for multiple seconds.

## Dialogue and visual text

Only when native speech is explicitly approved, quote the exact complete line once in its confirmed language, with the correct speaker and its full frozen voice block, as audio-only dialogue:
```text
Audio voiceover only, strictly no speech bubbles, no dialogue boxes.
```
In that native-speech branch, instruct the model not to add, omit, paraphrase, repeat, reorder, caption, subtitle, or visually transcribe words. Preserve native speech and any visible mouth performance together through trims. For external narration, keep the approved complete script/profile in the independent narration plan and request no generated speech; do not copy the VO text into video prompts.

Default every generated clip to no visible words, letters, numbers, captions, subtitles, interface copy, palette labels, production annotations, logos, or watermarks. Require icon-only message bubbles, content cards, clocks, meters, and notifications. Put optional approved phrases in a separate post-production overlay list outside the prompts. This generated-footage restriction does not remove requested final subtitles: include their wording, semantic phrase breaks, timing and style in the assembly handoff, and add/check them during authorized finishing.

## Palette notation

Use ordinary descriptive color names such as vivid red, electric blue, or warm gold. Never put hexadecimal, RGB, HSL, Pantone, or other technical color notation in a generation prompt. Models may reproduce prominent notation literally as unwanted interface text.

## Audio continuity contract

Apply `a-audio-timeline-and-review.md` to every A1–A5 style, including Historical Cartoon. Choose voices and the sound arc per video, not per generated clip. Record intentionally absent roles; no-speech projects stay unvoiced. Keep each video prompt self-contained for its actual sound role, while supplying a separate final-timeline audio handoff:

1. **Independent narration master (default for narrated finished films)**: Resolve the complete approved voice/language under `voice-continuity.md`, prepare the full narration independently, and edit picture against its actual speech timings. Tool-limited chunks join at semantic pauses before assembly. Preserve complete wording, identity and natural flow; do not inject its VO text or voice block into external-VO footage prompts. Do not change a selected voice or provider without the relevant authorization.
2. **Independent music master**: Use a continuous full-film BGM track or deliberately arranged cues with coherent musical transitions, selected for the approved story and style. Place it independently of picture cuts; never concatenate separately generated clip music or assume a prompt makes those tracks continuous. No universal piano/synth recipe applies. For a song-led project, the approved song/excerpt is the master clock.
3. **Explicit native-speech alternative**: Only when approved and actually requested from the video model, repeat the exact complete line and frozen voice block in each relevant standalone prompt, per speaker. Keep native speech and visible mouth performance bound; retain or repair that synchronized utterance as a unit. A narrator identity lock is necessary prompt compliance, not proof of audible matching or music continuity. Never swap or mute part of a lip-bound line and claim it survived unchanged.
4. **Foley, SFX and ambience**: Map clean usable source effects to the actual retained contacts, or rebuild them on independent final tracks. Inspect whether the returned audio is clean or flattened; a no-music prompt does not guarantee isolation. Avoid doubled effects, clipped tails and accidental ambience restarts. Handle mixed tracks and final listening under the shared audio contract.

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
- altered, omitted, repeated, reordered, or added dialogue in approved native speech; unrequested generated speech or BGM in external-master footage
- speech bubbles, comic dialog balloons, or visual text boxes
- **For Style 2A specifically**: `strictly minimalist studio aesthetic, no circuit board textures, no sci-fi wall panels, no spaceship corridors, no cracked concrete, no grunge textures`
- **For Style 2B specifically**: `no photorealistic human skin, no 3D humanoid CGI models, no chaotic line glitches`

## Stitching guide

List edited shots in final timeline order and identify their source clips and retained in–out ranges. For every cut, connect the actual retained out-point and next retained in-point through action/prop/direction, or state the approved location/time change. Unused source openings and tails are not cut boundaries. Style 4 changes scenery intentionally rather than requiring identical backgrounds. Include any trim, short audio crossfade, or match-cut note needed for assembly; inspect actual retained joins rather than assuming requested wipes landed at the usable cut.

## Audio continuity note

Supply the complete audio inventory and cue map from `a-audio-timeline-and-review.md`, including actual source/retained ranges, final cue times, master-track identities and keep/mute/replace decisions. Picture edits must not cut the narration or restart music by default.

1. For external narration/music, verify the complete independent masters and actual returned source audio. Preserve accepted picture and unchanged approved sound by fingerprint; repair only the affected scope. Do not regenerate picture to replace off-screen VO.
2. For explicitly approved native speech, compare the full frozen voice blocks and exact complete lines, then listen for actual identity, wording and joins. An authorized targeted voice repair retains visual instructions/settings and respects the retry cap. Keep lip-bound utterances intact. Historical native-audio examples in `voice-continuity.md` are sample-specific evidence, not the default sound pipeline or a continuity guarantee.
3. Actually listen to a new or changed complete final encoded mix at normal speed with picture for sync, checking every assembled join, speech, music, effects and tail. Record technical checks, listening, picture review and user acceptance separately; missing listening capability is `not_checked`. Explicit acceptance of an unchanged sample remains valid and requires no duplicate external analysis.

## Phase B checks

- The user approved the current Phase A.
- Exactly N standalone generation prompts map to the approved edited-shot rows; one source can supply several shots or a trimmed range. Their planned trims and joins produce the approved film duration; each clip’s requested duration and settings match the selected tool’s verified capabilities or are clearly marked unverified handoff targets.
- Each prompt repeats ratio (`16:9` or `9:16`), style/theme, character, palette, approved sound role, transition and negative locks. Full voice blocks and exact speech lines appear only in relevant approved native-speech prompts.
- Style 1 prompts repeat one identical full character block and contain no contradictory appearance instructions. Simple-expression allowance agrees with the negative constraints. Generated consistency is checked separately from prompt compliance.
- Each prompt has its planned connected action beats timed within the actual source duration and mapped to the intended edit, and at least four relevant visual devices unless the chosen style overrides that device count. Longer sources keep advancing the story; narration fits the approved steady pace without forced speed-up.
- Every retained out-point connects to the next retained in-point through a planned action/prop/direction or an approved location/time cut; inspect those actual edit points, not only source-file edges. Style 4 follows its approved location plan without forcing a new room at technical generation splits.
- Approved native dialogue exactly matches its complete line and speaker assignment, is explicitly audio-only and is never displayed visually; its mouth/performance binding survives the retained edit.
- External narration uses its complete independent approved master; footage prompts request no generated speech/BGM as appropriate and contain no injected VO text or narrator block. Music uses an independent full-film master or deliberately arranged coherent cues; neither role is rebuilt by concatenating generated clip mixes.
- Standalone prompts contain no hexadecimal, RGB, HSL, Pantone, or other technical color notation.
- Style 2 prompts repeat the identical complete verified character anchor without an ellipsis or previous-clip reference, plus the correct sound role and anti-clutter negative constraints.
- All approved native-speech prompts repeat an identical complete voice block per video (or per approved recurring speaker); no unresolved profile fields, abbreviated voice references or contradictory per-scene vocal directions remain. External-VO prompts do not require a video-model voice block. Actual audio acceptance is recorded separately from prompt compliance.
- Generated scenes contain no visible writing; requested final subtitles and optional overlay phrases are listed separately for post-production.
- Prompt delivery is a valid endpoint. No test or paid generation starts without its authorization; full Agent production continues only within the confirmed final resolution, total credit cap and execution scope, using the shared A workflow.
