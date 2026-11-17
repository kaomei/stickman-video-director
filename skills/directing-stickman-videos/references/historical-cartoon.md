# Style 5 — Historical Cartoon / 历史卡通风

Historical explainers, daily life, civilization stories and comic historical shorts, using expressive stick figures in colorful historical worlds.

On A5 selection, read **A5 proactive character guidance** in [first-use guidance](getting-started.md). Remind users to generate their own front/side/back character views and attach their confirmed references with the complete prompt for every clip in a supporting tool. This is advice only: do not supply or automatically generate reference images, or make them a delivery gate. Additional reference work needs an explicit user request. Users can knowingly choose text-only; references help but do not guarantee consistency.

Visual concept and Roman era-pack contribution: [Lawal Ridwan / @leksautomate](https://github.com/leksautomate), via [History Stickman](https://github.com/kaomei/stickman-video-director/pull/41). Adapted to this project's Style 5 with owner-directed cross-era trials. The contributor's PR numbering is not the published style number.

## Fixed drawing grammar

Repeat this anchor verbatim in every standalone prompt:

```text
CHARACTER: A 2D cartoon man with a round white head and a short, sturdy white neck growing naturally from his clothed shoulders and supporting his jaw. The white head and neck form one continuous filled silhouette. The lower jaw flows directly into the short white neck; the bottom of that neck enters the tunic neckline. The visible connection is white, with black outlines only along its two sides. Keep this white connection visible during walking, turns, tilts and camera cuts. Use balanced adult stickman proportions rather than a big-headed chibi: the complete standing figure is roughly four head-heights tall, the round head is visibly narrower than the clothed shoulder span, the torso is slightly longer than the head, and the thin black legs provide a natural lower-body length. The exposed neck is short, about one tenth of the head diameter tall. Thin black arms and legs, exactly two of each. Polished 2D cel-shaded historical cartoon, clean thick black outlines, softly shaded period clothing, and sunlit painterly surroundings.
FACE: An appealing, expressive storybook-cartoon face on the round white head. Two solid black vertical oval eyes; character-specific eyebrows, nose and mouth defined in the cast card, not a universal template face. Subtle cheek shading gives the face warmth without realistic skin texture. Expressions react to the action while the eye shape, nose shape, face proportions and identity remain unchanged. Hair and facial hair, when present in the cast, have a few clearly shaped locks and soft cel shading, not flat featureless patches. Keep this readable cartoon richness, not a blank symbolic face, photorealism or detailed irises.
PALMS: Each thin black wrist ends in one compact, solid black rounded oval palm with a subtle integrated thumb bump. Use the same palm-to-head proportion in both hands and all shots: total palm silhouette about 18% of head diameter long and 10% wide, including the thumb bump. It is visibly wider than the wrist, neither a wrist-tip dot nor an enlarged glove. No separate fingers, finger lines or white fill. The empty indicating gesture keeps this compact silhouette; change the arm angle instead of spreading or enlarging the palm.
EXPOSED LIMBS: Every uncovered arm, forearm, wrist and shin is one slender solid black stroke. Face and short neck use white fill; the limbs use solid black strokes. Preserve the character proportions and costume colors throughout.
```

Keep white head fill, head/body proportions, outline weight and black stick limbs fixed within a story. Open eyes are simple solid black ovals without iris/pupil detail; a blink or closed-eye expression does not redesign the eyes. Cloth, leather and metal can have soft shading and small highlights. Backgrounds are full-color painted landscapes or architecture, not empty white canvases, paper textures, ink wash, photorealistic people or glossy 3D characters. Approved night/interior lighting changes illumination, not drawing grammar. Costume may cover limbs without changing their underlying black line design.

Use this owner-selected baseline rather than stacking earlier experimental anatomy recipes. Resolve character gender/age and garment wording once in Phase A when the story requires a different cast; freeze the resulting full anchor across clips. Preserve the continuous white jaw–short-neck–garment connection in every view, not direct head-to-collar contact or a floating head. Do not treat a background-colored gap or an exposed chest panel as a neck. Hair, beard and collar may overlap but must not conceal a detached head. Keep the approved compact neck and adult proportions; do not copy one reference character's hair or costume to unrelated eras. This connection rule is A5-only. The baseline is a design target, not evidence of reliable text-only generation.

Freeze an individual face, not one national template: choose era-appropriate hair, eyebrows and expressions for the particular role without implying everyone from that country looks alike. A nose can be one short shallow black curve on the white face, smaller than half an eye's height; keep it flat, not a projecting bridge or skin-colored blob. Expressions can change with the story while identity stays fixed. If the cast calls for hair, name it explicitly and check that it is actually visible; a bald output fails that cast even when the prompt mentions hair.

The thin-black-limb rule includes exposed arm and leg segments, not sleeves or footwear. Hands use the owner's rounded black palm silhouette: a compact mitten-shaped palm visibly wider than the wrist, with one small rounded side thumb lobe and one undivided rounded finger mass. This is a single solid silhouette, not an anatomical hand, a tiny circular end cap or a white glove. No individual fingers, branching digit strokes, finger separations, digit lines or nails. Each palm attaches continuously to its thin black wrist. Show a grip through contact or overlap between the palm and the prop, supported by the arm pose; show release by moving the palm away. An empty raised hand retains this same compact silhouette without spreading fingers. Sleeves retain the approved fabric silhouette and color. Grips, releases and gestures may change pose, but keep hand scale and shape consistent across shots; avoid oversized black fists or glove-like blobs. Fixed hand design means consistent rendering, not frozen poses or permanently clenched fists. This clarification is A5-only; it does not change any A1–A4 or B-style anatomy rules.

## Phase A: era and cast

Use the existing proposal and approval workflow. Include a compact era pack:

- **Era/place:** period, region and the story's factual premise.
- **Roles/wardrobe:** each visible role's silhouette, clothing and recognizable accessory.
- **Settings:** story locations, architectural landmarks, screen direction and planned time cuts.
- **Palette:** four to six ordinary color names and their roles.
- **Props/symbols:** tools, weapons, furniture and icon-only emblems, with ownership and counts.
- **Music:** era-appropriate instruments and one coherent score direction.
- **Facts:** distinguish supported history from illustrative scenes or fictional jokes; do not invent quotations, statistics or historical events.

For a different era, draft and confirm a new pack rather than borrowing Roman armor or symbols. Adapt Egyptian, Chinese, Japanese or other clothing and buildings while preserving the drawing grammar. Do not make one Roman soldier a universal cast for all stories.

For each recurring role, write a complete story-specific cast card: role/age range, head/body proportions, continuous white jaw–short-neck–garment connection and any beard/collar overlap, face and eye shape, hair/beard or explicit absence, headwear, clothing layers and silhouette, limb treatment, black mitten-palm design with integrated thumb lobe and wrist-to-sleeve attachment, footwear and distinguishing accessory. Give recurring roles at least two visible non-color differences. Resolve concrete features instead of writing only “a soldier” or “a princess.” Freeze each approved card and repeat its **full description** in every standalone prompt where the role appears; never substitute “same character,” an ellipsis or a name alone. A crowd can use one uniform group description, with named foreground characters separately identified.

Keep appearance separate from action: a spade's shape belongs in its prop description; who holds it, in which hand, and whether it touches the ground belong in opening/action/ending states. Do not make all props permanently held or all characters permanently front-facing merely to prevent drift.

### Roman era pack

- **Place:** Roman Republic/Empire, Mediterranean roads, camps, towns and countryside; specify the period needed by the topic.
- **Soldier:** bronze-gold helmet with black horsehair crest, grey chainmail, red tunic, brown segmented leather skirt, thin black exposed limbs, small solid black mitten-shaped palms continuously attached to the wrists, one subtle integrated thumb lobe, no individual fingers, finger separations, white fills or gloves, and a short sword. Include a red shield with a gold icon only when the scene needs it. Officers can use a distinct crest or cape, frozen in their own cast cards.
- **Civilian:** cream tunic or toga with a story-specific accessory; approve the complete card rather than treating all civilians as soldiers without helmets.
- **Settings:** green hills, cypress trees, dusty roads, wooden palisades and camp ditches; Forum, harbor or market architecture when relevant.
- **Palette:** Roman red, bronze gold, steel grey, grass green, sky blue, earthy tan.
- **Music:** restrained drums, brass and strings for epic scenes; light plucked strings and woodwinds for daily life or comic scenes. No mandatory piano.
- **Treatment:** costume is simplified illustration, not evidence for an exact historical uniform. Preserve the factual narration while using fictional individual characters to illustrate it.

## Phase B: standalone clips

Each prompt contains:

1. Approved duration/ratio and technical targets. Explicitly call it a `stickman animated video`, not just an `animated video`; use the actual supported resolution rather than claiming a requested target was delivered.
2. Full drawing-style anchor, era palette and segment setting.
3. Full cast cards for every visible recurring role, plus relevant prop designs/counts.
4. Opening layout, held items, hand/owner and screen direction.
5. Connected physical beats, camera purpose and ending state with source-local start/end times inside the actual chosen generated duration. Map the usable retained range(s) to the final edited shots; choose beat count and timing from the action, speech/music phrases and intended cuts, not fixed windows or a mandatory ten-second source. A longer source must keep advancing the story.
6. Intended sound role; only native-speech prompts add the exact complete approved line and frozen voice block from `voice-continuity.md`. External VO uses an independent full narration master.
7. Era-appropriate continuous score or arranged cues, timed SFX and voice-first mix on the final timeline under the [A audio contract](a-audio-timeline-and-review.md), not concatenated clip music.
8. Compatible negatives.

Use the existing accepted male profile by default when no other voice is requested. Honor female, older, youthful or other voice choices by resolving a complete profile through `voice-continuity.md`, then freezing it across the whole video. Cast gender or a change of era never recasts the off-screen narrator. Keep voice identity separate from music and visual emotion.

Use the five-stage engine for explainers where useful; narrative shorts can use setup → escalation → payoff without forcing a discussion question. Prefer a few readable physical actions over four unrelated effects. A deliberate reaction pause is valid. Wide establishing shots, lateral tracking, medium actions and close reactions should serve the narration. Maintain screen direction and describe a planned time jump explicitly when adjacent states do not directly match.

Keep one current pose per limb. Give prop transfers a clear release, travel and receiving state; do not spawn duplicate tools or transform one item into another. Use the smallest cast the story needs. Describe background groups as uniform ranks, not many competing named roles.

Preserve complete approved style/cast blocks and, only where native speech is requested, full relevant voice blocks; there is no style-specific character-count cap. Remove conflicting or redundant wording rather than stripping identity details. If an interface rejects the length, report its actual limit before changing approved content.

```text
NO VISIBLE TEXT, LETTERS, NUMBERS, SUBTITLES, LOGOS OR WATERMARKS (blank paper or abstract brush strokes only), NO SPEECH BUBBLES, NO BLOOD OR GORE, NO PHOTOREALISTIC FACES, NO 3D CGI, NO PAPER TEXTURE, NO EXTRA LIMBS, NO FUSED OR DUPLICATE HEADS, NO COSTUME CHANGES, NO EXTRA CHARACTERS, NO INDIVIDUAL FINGERS, NO FINGER SEPARATIONS, NO WHITE HANDS OR GLOVES, NO FLOATING HEAD, NO BACKGROUND GAP BETWEEN HEAD AND NECKLINE.
```

Keep negatives compatible with the approved cast: do not ban expressive faces, the chosen nose, historical clothing or chosen hair/beards. Proactively remind users about self-generated references as above, rather than offering that advice only when asked. Keep the full prompt intact; only list specific reference files when the user actually supplies them. Never claim an attachment was submitted unless it actually was.

## Review

At the intended delivery size, check the actual continuous white jaw–short-neck–garment connection, including walking, turns, tilts and camera cuts. A background-colored gap fails even if an earlier prompt or review called the connection natural. Check neck length against the approved reference, not a long white neck or chest panel. Preserve approved head shape and proportions. The owner reference defines the target, not cross-clip stability.

Before delivery, compare repeated style/cast blocks, relevant native-speech voice blocks and all adjacent prop states. Verify the independent narration/music cue plan and complete final-file listening under the A audio contract. When generation is authorized, inspect actual footage for head fill, eye design, costume silhouette, limbs, compact black mitten palms and continuous wrist attachment during walking, grips, releases and empty-hand gestures, prop counts and action joins; listen separately for narrator consistency. Check that palms have one subtle rounded thumb lobe, without separate fingers, white fill or gloves, and do not grow into large fists. Record prompt compliance separately from observed output, and state sampling coverage rather than claiming frame-by-frame certification. Earlier round-tip or exposed-neck tests do not validate this revised silhouette; retain their failures as historical observations, not overall stability passes. Localize changes to Style 5; do not rewrite Styles 1–4.
