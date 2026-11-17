# B7 · 像素剧场风 / Pixel Theater

Style module inside `directing-stickman-videos`, using a verified project-local code production workflow. It is not a separate Skill or a supported `project.json` style in the shared CLI. The package's reference approval and actual GitHub publication are separate states. Follow [Autopilot](autopilot.md), the [common production gates](autopilot-production-qa.md) and [story-led sound system](autopilot-sound-system.md). User choices override defaults; do not restyle accepted work silently.

## Authority and required visual inspection

Before drawing or animating, inspect these **original approved works**, not just this prose. The latest complete films carry the current acting, ending and sound benchmark; older silent excerpts remain useful for detailed identity/contact study:

- [Paths V6 — complete approved picture and sound](../assets/b7/approved-v6-v11/paths-v6-full.mp4), accepted 2026-11-12.
- [Fast Forward V11 — complete production/acceptance benchmark](../assets/b7/approved-v6-v11/fast-forward-v11-full.mp4), accepted 2026-11-11.
- [Reference usage and acceptance index](../assets/b7/approved-v6-v11/README.md) and [music attribution](../assets/b7/CREDITS.md). These are finished reference films, never substitute outputs or reusable narration/music assets for a new story.

For 9:16, also inspect the internal [Fast Forward portrait V3 — approved 10-second layout and short captions](../assets/b7/approved-portrait/fast-forward-portrait-v3-10s.mp4) and read the [native portrait contract](b7-native-portrait.md). The user accepted this exact preview's portrait composition and short-caption treatment on 2026-11-13. It is not a complete portrait story or evidence that its whole-film acting, sound and ending have been reviewed.

Historical detail references:

- [Character/occupation board](../assets/b7/professions-approved.png): fixed white-C identity, proportions and small accessories.
- [Accepted full-film board](../assets/b7/approved-film-board.png): composition, pixel vocabulary, object text and visual consequences.
- [Choices and noodle-shop performance](../assets/b7/choices-and-noodles.mp4): watch at real speed for staging, prop action and reaction.
- [Button and passing years](../assets/b7/button-and-years.mp4): contact, readable lettering and consequence.
- [Blue path and ocean payoff](../assets/b7/ocean-payoff.mp4): connected geometry, wave rhythm and a resolved ending.
- [Portable provenance manifest](../assets/b7/reference-manifest.json): fingerprints, approval versions, source ranges, attribution and explicit limitations. Historical excerpts are intentionally silent; complete V6/V11 references retain their accepted mixed sound. No separate voice/music assets or reusable soundtrack license is supplied.

Authority: explicit user decisions → approved white-C character identity → approved original B7 motion. A supplied third-party pixel-video reference can inform timing, anticipation, reactions and layered staging; do not copy its mascot/IP, soundtrack or entire shot sequence. Do not redistribute it without rights. The choice story, Brian recording, duration, timestamps and example music are **not** universal templates.

The user accepted **Fast Forward V11** on 2026-11-11 as the newer production/acceptance benchmark and **Paths V6** on 2026-11-12 as the revised original film: varied causal framing, fixed-geometry acting, an audible but speech-first whole-film sound design, and a small reflective typewriter ending. Their complete, unchanged reference films and attribution are bundled; no separate paid voice/music stems are supplied. Their provenance and acceptance dates are recorded in the manifest. Both remain **16:9 full-film** benchmarks. Portrait V3 separately establishes the accepted 9:16 layout and short-caption treatment for its exact 10 seconds; native recomposition and actual review are still required for a new portrait output. Apply the mechanisms below to new stories, not the references' exact rain scene, quote, shot order, gain settings or soundtrack. A fresh story still needs its own full-film review; do not promise automatic aesthetic equivalence from passing technical tests alone.

## Fixed drawing grammar

- White **thin-line** stick body and limbs, round white head, simple black facial features. Keep the approved head/body ratio, line weight, limb lengths and pixel grid. Not a solid white human model or a B4 character.
- Every character has **1–2 small, meaningful garments/accessories**, chosen from occupation, setting and script. Preserve the visible stick silhouette; attach accessories to their actual body part throughout motion. Approved examples: chef hat + small apron; doctor forehead mirror + small medical bag; courier cap + satchel. The oversized U-shaped stethoscope was rejected.
- Draw scenes, actors, accessories, typography and animation **with code**. Do not use image/video generation models to replace this look. A supplied approved bitmap may be reused as reference, not falsely described as newly code-generated.
- Use a low-resolution logical canvas, integer-aligned drawing and nearest-neighbor integer upscaling. The accepted 16:9 example is 320×180 enlarged 6× to 1920×1080; the approved portrait reference is natively recomposed at 180×320 and enlarged 6× to 1080×1920. Preserve the same pixel identity, bone geometry and accessories while arranging the stage for its ratio. Avoid smooth vector edges, blurred resampling, smeared pixel rotations and inconsistent pixel sizes.
- Use restrained pixel dithering, coherent shadows and scene-specific palettes. Different locations/emotional states may have different colors while actors remain identifiable. Do not import B3 CRT/scanlines, B4 white gloves or compulsory horror. This style supports game-like choices/resources, light or dark comedy, occupational stories and emotional fables.

### Sample-derived implementation defaults

Use the bundled [pixel drawing primitives](../scripts/b7_pixel_primitives.py), rather than recreating the actor or choosing an ordinary bold font by eye. These defaults make the approved grammar executable; they are not a complete story renderer:

| Component | Approved baseline, measured in logical pixels |
| --- | --- |
| Type | The bundled variable-width **7-row bitmap alphabet**, 1-pixel inter-character gap, diagonal shadow offset `(1, 1)` at scale 1. Cream `#fff0cc`; restrained teal `#71c4c0` emphasis. No OS-font fallback. |
| Body | White 1-pixel limb core; right-offset 1-pixel shadow `#0c101c`; far limbs `#c7cbd2`. Head outer radius 5 / white inner radius 4; head outline and lettering shadow `#080e1c`. |
| Geometry | Torso 12; shoulder-to-head anchor 8; each leg segment 9; each arm segment 7.3. Solve continuous geometry before rounding to the drawing grid. |
| Caption | In the 320×180 landscape benchmark, baseline top `y=165`, single line, total drawn width including shadow ≤292. For 9:16 use the [portrait contract](b7-native-portrait.md): target about 60% width, hard maximum 65% including shadow and at least 17.5% on each side. Keep the selected type size; do not stretch this frame or shrink the glyphs to fit. |
| Rest/contact | Resting feet near hip `x±2`, ground 17.85 below hip; knees slightly outward. Moving/leaning poses keep bone lengths fixed and use explicit world-space foot and object-contact targets. |

User-selected fonts, wording, Chinese/other languages and colors remain allowed. Record the override and test its glyph coverage, contrast, grid and safe area. The bundled Latin alphabet is **not** a complete multilingual font: supply a suitable licensed pixel font or explicit glyph map when needed. Missing characters must produce a visible error, not be dropped, replaced with boxes, or silently rendered in Noto Sans. A requested non-pixel treatment is a deliberate user override, not a reason to block their project.

Python 3.9+ and Pillow 9.1+ are required for these primitives. A calibration still can be generated with `python3 scripts/b7_pixel_primitives.py --calibration /absolute/project/qa/b7-calibration.png` from the Skill directory. It checks type and bare-body drawing, **not** story quality. `make_pose` supports named anchors and fixed-length IK, but does not supply walk timing, accessories, scenery, speech, music or a universal B7 CLI. Implement those project-locally and compare against the approved moving excerpts. Never leave an import pointing to the original author's other project.

## Story and animation contract

Build a visible goal → escalating obstacle/consequence → payoff or changed state. Preserve approved wording. Translate abstract ideas into understandable objects and state changes without inventing contradictory plot events.

For each beat, record the spoken cue, focal action, anticipation, contact/trigger, object response, character reaction, settling time and next state. Richness comes from **causality and staging**, not adding random particles or moving everything at once:

1. Establish the relevant object/choice and give the viewer a clear focal point.
2. Animate a readable performance: reach, hesitate, offer, turn, recoil, press, look or refuse.
3. Let the object/environment respond to that action, then show a short reaction/payoff. Secondary motion follows the same force or event with purposeful offsets.

Examples from the accepted story: a shop deletion interrupts a noodle action; coastal objects share one void's pull; a button depresses under the hand and years flip while the feet remain in place. Reuse the **mechanism**, not these props or event times in every story.

- Apply the common ≤2.5-second principal-inactivity gate. A developing action can sustain a shot; do not force hard cuts every 2.5 seconds. Subtitle changes, background particles and whole-frame zoom alone do not count as principal action.
- Keep action variety and detail through the body and ending, not just the hook. Combine purposeful pose/expression changes, props, framing and environmental responses; reject an illustrated slideshow with a camera wiggle. Allow anticipation and payoff to read rather than merely increasing cut count.
- Design a purposeful framing progression: establish context, isolate an important control/prop in close-up, show its trigger, then return to the consequence/reaction. A cursor can click a close-up control when motivated by the visual metaphor, with acceleration/status changes beside it. Never make a floating control crush the actor, stretch limbs to reach it, or recycle one wide shot when a new viewpoint would explain the event better. Vary staging and shot scale before inventing more body motion.
- Walk in a clear profile with alternating legs, believable contact and stable planted feet; do not slide front-facing legs sideways like a crab. A stopped actor may turn front. Keep elbows/wrists attached, accessories anchored and held props in contact; no duplicate limbs, implausible arm extension or unexplained teleports.
- For simultaneous choices, use distinct recognizable objects with clear **A/B/C** labels or restrained individual emphasis. Do not build several crude stair/path diagrams under them. Keep only one dominant movement/emphasis at a time.
- Draw physically meaningful connected details. Wave crests/foam belong to the water body and shoreline, with consistent advance/retreat and phase; reject floating loops, shells or arbitrary symbols masquerading as waves. Inspect both normal playback and suspect frames.
- Use localized motion and restrained secondary events to make a living scene, without cluttering the main action. Do not substitute endless decorative idle loops for storytelling.

### Required project evidence, before an approval request

Keep one project-local event ledger with unique IDs. Each event records `id`, actual speech cue/time, actor/object, anticipation interval, trigger/contact time, response/reaction interval, settled state and any SFX cue/asset (or an intentional no-SFX reason). The picture renderer and sound spotting derive contact times from **the same event**, rather than independently guessing a press, footfall or break. Consequences cannot precede their trigger unless the story explicitly calls for it.

Also record principal-action intervals by shot, caption text/time/width, font or language overrides, asset rights and the geometry/contact checks. Store a small QA frame strip around important contact/reaction boundaries **and review the motion at real speed**. A changed screenshot or keyframe count alone is not evidence of acting. Every story beat needs its own staged action/state evidence; an intentionally quiet hold needs an explicit reason, not a blanket exception for the entire narration.

Before calling a sample complete, verify:

- The first spoken beat already has meaningful character/prop/state development; no static opening hidden behind captions or camera drift. Action need not be frantic, nor should it jump ahead of the narration.
- Each intended press/grip has hand-to-object contact; feet remain fixed in world space while planted, with alternating swing/stance for travel and a legible travel direction. Plot bone/contact errors and inspect transitions; testing fixed-length limbs alone does not certify a natural walk.
- Emotional turns have readable expression/pose changes and a consequence/reaction. Ambient loops, a blinking cursor or particles do not satisfy this on their own.
- Sound events follow pictured material/contact; a quiet continuous bed is story-appropriate, not a loud repeated effect. An intentional audio cut specifies which layers stop, why and when they return. No accidental silent opening while a voice is scheduled.

## Typography, objects and captions

- Use crisp pixel typography that shares the scene's grid. Keep functional object text readable at intended small playback size, not just at 1080p. A pale/white `CONTINUE` on a dark blue-gray button cap is the accepted contrast example; the particular button/color is not mandatory in every story. Keep shadows, hands, calendar pages and highlights off essential letters during their reading interval.
- Show important actions and states in the picture rather than adding redundant labels to every object. Necessary choice letters, signs and controls are valid. Captions carry speech; avoid duplicating the same line in a bubble and subtitle.
- **At most one subtitle line**, segmented by meaning and actual voice pauses. Preserve phrases, names, verbs/necessary objects and word order. Split at a new semantic boundary when too wide; do not use fixed word-count chunks, automatic wrapping or squeezed microtype.
- In 9:16, apply the [approved short-caption treatment](b7-native-portrait.md) automatically: measure every language's actual rendered font plus shadow, target about 60% frame width and reject a line over 65% or either side margin under 17.5%. Center the drawn box within half a logical pixel, allowing integer-grid rounding. Use short, readable speech-aligned groups rather than a long subtitle bar. Keep `fast-forward button` intact; the approved opening places its light lead-in in `You were born with a`, followed by `fast-forward button`. Do not make `with a` flash alone or delay the recording to fit captions.
- Reserve a high-contrast safe band and validate the burned-in result, sidecars and small-view legibility. Pixel captions must match the art but remain readable; dithering/background action must not compete with them.

## Voice and tempo

Resolve voice by explicit user choice → style default → common fallback. **B7 has no fixed narrator yet**; Brian was accepted for this story, not mandated for every B7 story. Use the selected native voice without extra performance/style descriptions by default. Reuse approved complete recordings by fingerprint; do not regenerate them to solve a picture issue.

Use multiple voices only for actual story roles, not to arbitrarily split one narrator. When new casting is needed, follow the common requirement to **Google-search** suitable voices for the genre/role and relevant popular timbres, verify provider/voice availability and audition actual output. Search recommendations are not proof of a voice's suitability or permission for paid generation. Keep B4's fixed Brian/secondary-role tuning scoped to B4.

Build the timeline from actual speech and pauses. The accepted example used an explicitly requested **1.1× whole-film speed-up**: pitch-preserving audio plus synchronized picture, captions, SFX and music timings. Treat its brisk feel as a benchmark, not an automatic rate applied to every new recording. Any retime needs project authorization, synchronized affected layers and a new timing/legibility check; do not add unsupported CLI `voice.speed`.

## Story-adaptive BGM and causal SFX

**Select and arrange BGM automatically for each story, not a fixed song.** The accepted game's `Underclocked (underunderclocked mix)` is only an example. Do not bundle it as a required resource, silently reuse it in future stories or claim it is currently trending.

Before selection, record a short music brief: genre/tone, pace, emotional turns, role relative to speech, sparse/busy sections and intentional rests. Use recognizable game/chiptune music when its mood and arrangement fit; pixel visuals do not require relentless 8-bit music. A comic choice story, a quiet fable and a threat scene need different scores. If popularity is requested, search current evidence (Google where requested), distinguish verified popularity from a stylistic suggestion, and never imply a famous game OST is free to reuse.

- Verify **each asset's** permitted use, attribution, commercial/platform restrictions and source; record title, artist, source URL, license/date and file hash. “Free,” “royalty-free” and “popular” are not interchangeable. If no suitable cleared asset is available, explain the gap rather than downloading an unauthorized soundtrack or adding a paid call/subscription without permission.
- Keep music **audible but behind intelligible speech**. Set its level from the actual voice and musical density, automate ducking and section gains, and avoid narration masking. The earlier Paths V5 bed was very restrained; do not preserve that low level as a required target. V11's later accepted balance uses section/event gains and an audible post-voice lift, not a global master-volume increase. No example's meter reading or source fader value is a universal loudness target.
- Arrange entrances, sparse sections, transitions and returns around the story. Planned silence or a music-only drop can make a disappearance, hesitation or payoff readable; specify which layers stop and their return cue. Do not loop a noisy bed unchanged through the whole film or require every layer to sound at once.
- Keep causal SFX separate from music: appropriate material, weight, distance and timing for contact, break-up, suction, shutdown, doors, button presses, paper or water. Vary by the actual action; no pop/whoosh on every word, constant alarm or random game bleeps. Foley must support the pictured event, not compensate for a missing one.
- Preserve clean narration, baseline/VO-SFX and music stems. When changing BGM, replace only the music layer; do not stack a second score over an already mixed master or unnecessarily regenerate picture/voice/SFX. Keep music rights/credit alongside delivery, not burned over essential art.
- Check joins, masking, peaks, loudness, mono and small-speaker translation in the **encoded** mix. State platform targets only when actually specified. Meters and band-limited simulations do not prove listening quality; record real playback/listening and unavailable checks honestly, with user review where needed.

## Reflective ending — required default unless the user overrides it

1. Resolve the story in its own location, then add **one short, earned reflection**, not a generic motivational slogan. Do not copy the fast-forward quote into unrelated stories. No comment/share CTA and no extra quote narration by default. Wait until the final spoken line has finished; keep the original voice unchanged.
2. Use the same crisp bitmap lettering at a modest size, with clear hierarchy and safe margins. Reveal it character by character like a pixel typewriter; keep each full line's origin fixed, rather than recentering the growing substring. In the 1920×1080 V11 benchmark the overlay works at 640×360, font scale 3, then nearest-neighbor 3×. Recompose other ratios. Keep the completed reflection readable for roughly **2–3 seconds**.
3. After typing, continue a **gentle opacity pulse** (V11: 42–100%, 1.2-second period); no fast full-screen flashing. Typing ticks happen only on newly revealed non-space glyphs, **not** on spaces, every pulse, or during the completed hold. Picture and Foley must consume one shared frame/sample event plan, including fractional output rates.
4. Keep the final scene alive with a meaningful small gesture or look, anchored feet and fixed bones, plus setting-appropriate motion. A purposeful palm/head change can support reflection; no limb morphing, random bobbing or mandatory walking. A user-requested still ending overrides this default.
5. Let cleared, fitting music support the gap after speech and the reflection, with an audible but restrained lift and a clean ending fade. Keep contextual ambience (ocean, rain, room tone, etc.) controlled below it. Music and ambience are selected per story: the sample's piano/rain are not mandatory assets.

Use the bundled [ending timing/lettering/Foley helper](../scripts/b7_reflective_ending.py) and [behavior tests](../tests/b7_reflective_ending_test.py). `EndingPlan` owns glyph visibility and exact key PCM insertion samples; `key_samples` supplies deterministic softened mechanical ticks. Feed it project-specific lines, actual frame rate, speech-end start frame and layout. It supplies neither scenery nor music and does not replace the whole-film action ledger. Copy the primitives and helper into the project for a self-contained renderer; never import the author's original project.

## Production path

1. Resolve known script, ratio, audience, voice and authorization; do not re-ask accepted choices. Read the boards **and moving excerpts** above. For 9:16, read the native portrait contract and inspect its 10-second reference before arranging the stage or segmenting captions.
2. Create a project-local beat/state ledger and deterministic code renderer, with fixed actor proportions, reusable props, explicit layer/contact/state changes and an audio/caption timeline. Start with the bundled primitives; the accepted implementation used Python/Pillow + FFmpeg. Check dependencies and run the calibration/tests before work. This reference pack does **not** provide a universal B7 rendering engine or enable `style: B7` in the shared Autopilot CLI.
3. Use the full approved voice to align semantic captions and story events. Prepare the sound/music spotting and rights record before mixing. Never substitute a 20-second preview for a requested full film.
4. If the user requested a sample, render its agreed duration; do not invent a 20-second cutoff or start a queued script while only maintaining this Skill. Review motion at speed, principal-action gaps, UI/caption contrast, pixel consistency and actual audio. User approval permits only the agreed continuation/scope, not unrelated paid work or publication.
5. Complete the remaining story to the same standard, inspect transitions and callbacks, then export full MP4, captions, stems, timeline, credit/rights, QA and checkpoint. Keep the project self-contained; no dependency on another chat, ephemeral CDN URL or the original Desktop reference.

## Acceptance and recovery

Use the [B7 evidence/review gate](b7-review.md) before claiming a new film is ready. Initialize the record against the actual final encoded video, current plan, reference version and assets; then record technical checks separately from actual full-speed creative picture/sound review and any required user approval. Unreviewed or needs-repair findings cannot be promoted to a passing delivery by unit tests. Follow that gate's `init` / `check` commands; historical sample acceptance remains historical evidence, not a new review.

- Compare cast proportions and accessories to the character board; compare **real-time acting and reactions** to the motion excerpts, not still images alone. Assess new-story quality explicitly; an accepted example cannot guarantee future results.
- Inspect the entire film's causal action/state ledger, principal motion, contact and geometry; include distant sections and the ending. Check wave/particle details and labels at small playback size, not only overall pixel texture.
- Check every caption boundary against speech/meaning, single-line fit and sidecars. For portrait, record actual font/shadow bounds, the 65% width cap and both 17.5% side margins; inspect the chosen subtitle band against platform overlays separately. Check important object text through press/occlusion frames. Review actual encoded audio for speech priority, SFX causality, fitting music and fatigue.
- Inspect the **whole film** at real speed, including distant action beats and the reflective ending: camera variety must explain events, causal accents must be audible without masking Brian/selected voice, typing must have synchronized keys, completed text must hold/pulse without repeated ticks, and the final actor must not deform. Save per-story action/sound/ending evidence before claiming the benchmark is met.
- Record source/output hashes, accepted version, renderer/dependencies, current stage, running jobs, QA limits and next action. After interruption inspect existing artifacts/jobs first; reuse valid results. For local corrections rerender/remix only affected material and recheck adjacent transitions.
- The reference-pack tests check hashes, actual media decoding, historical silent excerpts, the latest complete mixed-sound references with attribution, and relocation. The [primitive behavior tests](../tests/b7_pixel_primitives_test.py) check the exact bitmap alphabet, pixel/shadow grid, integer scaling, caption overflow/missing glyphs, constant-length IK, world-space planted points and attached prop anchors. Ending behavior tests check actual glyph/PCM trigger alignment, fractional-rate timing, fixed text origins and pulse-without-ticks. They do **not** certify a walk cycle, a complete shared story/audio engine, aesthetics, semantic caption timing, voice performance, a fresh full-story render or human listening. Those remain project-specific approval gates.
- Deliver a verified absolute video **and containing folder link**. Keep queued work local; public README/gallery, repository release, installed-copy sync and external publication require their own authorization. Do not alter A or B1–B6 while maintaining this module.

## Default audiovisual completeness

Selecting B7 automatically requires the [B1–B9 final delivery completeness gate](b-delivery-completeness.md) together with the existing B7 style/creative gates. Produce sample-directed captions, causal SFX and suitable background music by default, then verify each in the actual final MP4. Missing components, unchecked review or unavailable tools block a complete/pass claim. Sidecar captions, downloaded audio or successful encoding are insufficient. Keep the approved pixel font, native portrait short-caption rules, causal pixel Foley and reflective ending sound direction. Document explicit user exemptions and narrative local silence under the shared gate; production difficulty is not an exemption.

```sh
node scripts/b-delivery-completeness.mjs init --style B7 --ratio 16:9 --media /absolute/candidate.mp4 --output /absolute/completeness-review.json
node scripts/b-delivery-completeness.mjs check /absolute/completeness-review.json
```

Use the actual requested ratio and output path. New records start unchecked. The script verifies evidence completeness; truthful full-output watching/listening and the existing style acceptance remain necessary. Existing sample approvals and rights decisions retain their original scope.
