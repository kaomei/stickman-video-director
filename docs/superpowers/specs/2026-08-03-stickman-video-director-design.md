# Stickman Video Director Skill Design

Date: 2026-08-03
Status: Approved conversational design, pending written-spec review

## Objective

Create an open-source Codex Skill that turns a user's source copy into a production package for an approximately one-minute English stick-figure video made with Gemini Omni Flash.

The result must feel visually dense despite its minimalist line-art style. It must support both black-on-white and white-on-black themes, allow saturated accent colors, and produce six independently usable prompts for approximately ten-second clips.

The Skill does not call the video model or edit the generated clips. It plans the video, obtains user approval, and produces the complete prompt package.

## User Experience

### 1. Trigger and required setup

Use the Skill when a user supplies copy, notes, an article, or a topic and asks for a stick-figure explainer, motivational short, kinetic line-animation video, or Omni Flash prompt package.

Before planning the video, determine whether these two required choices are known:

1. Aspect ratio: `16:9`, `9:16`, or `1:1`
2. Theme:
   - light: white background with black stick figures
   - dark: black background with white stick figures

If either choice is missing, ask for all missing choices in one concise setup message. Do not silently select defaults. Do not repeat a question whose answer is already present in the user's request.

If the source material is also missing, request it in the same setup message. Once source, aspect ratio, and theme are known, proceed without additional mandatory questions.

Optional preferences include voice, tone, accent colors, and intended platform. When absent, infer tone and accent colors from the content and use a bright, energetic adult female narrator speaking natural American English.

### 2. Phase A: director's proposal

Rewrite the source into an English voiceover of approximately 130–150 words. The rewrite may strengthen the opening hook, compress weak or repetitive material, add a clear progression, and create a closing callback or call to action. Preserve the source's core claim, names, numbers, and factual meaning.

Present a director's proposal before writing the final model prompts. The proposal contains:

- English title and a reference title in the user's language
- core message and opening hook
- selected aspect ratio and theme
- narrator, speaking pace, total word count, and estimated duration
- three-color accent palette with semantic roles
- BGM recommendation and emotional transition point
- overall tone and narrative arc
- a six-row storyboard covering approximately ten seconds per row

The storyboard columns are:

| Time | Narrative purpose | Stick-figure scene | Motion, camera, and transition | English VO | Reference translation | BGM / SFX |
|---|---|---|---|---|---|---|

Each scene description must specify the character's continuous action, at least three timed visual beats, relevant visual metaphors, accent-color usage, camera movement, sound cues, and a transition connection to the next clip.

End Phase A with a clear confirmation gate. Offer the user three actions: approve production prompts, revise a named scene, or change global settings such as aspect ratio or theme.

### 3. Revision behavior

When the user changes aspect ratio, recompose the storyboard and later prompts for that canvas. Do not mechanically replace the ratio string.

- For `16:9`, use left-center-right composition, horizontal tracking, lateral transitions, and intentional negative space.
- For `9:16`, use foreground-background depth, vertical reveals, stacked motion, and safe placement for short-form interfaces.
- For `1:1`, keep the central action compact and avoid relying on extreme horizontal or vertical travel.

When the user changes theme, invert the background and base line-art colors while preserving accent-color semantics and sufficient contrast.

Any change to aspect ratio, theme, narration, scene structure, or global style invalidates the previous approval. Regenerate the affected Phase A content and request approval again. Do not produce Phase B until the user explicitly approves the current director's proposal.

### 4. Phase B: Omni Flash production package

After approval, output:

1. Global visual, character, palette, voice, and audio continuity rules
2. Six independent English prompts, each targeting approximately ten seconds
3. A stitching guide describing the six transition connections
4. A practical continuity note for voice and BGM across independent generations

Every individual prompt must be self-contained because it is sent to the model in a separate generation. Repeat the critical character, style, palette, narrator, and negative constraints inside every prompt.

## Narrative Structure

Use this default one-minute progression unless the source strongly suggests another structure:

`strong hook → audience recognition → escalation → reframe → decisive action → payoff and CTA`

Allocate approximately 18–25 spoken words per clip. Adjust sentence boundaries to create natural delivery rather than forcing identical word counts. If the voiceover is too long, simplify wording before increasing speaking speed.

For educational or scientific topics, replace the motivational arc with:

`surprising hook → setup → mechanism → consequence → practical meaning → memorable takeaway`

Do not invent research, statistics, quotations, product claims, or factual details absent from the source. When an essential claim appears questionable, preserve it neutrally or flag it for user review rather than strengthening it.

## Visual Richness Contract

Each ten-second clip contains three internal beats:

- `0–3 seconds`: establish or inherit the visual premise
- `3–7 seconds`: transform or escalate the metaphor
- `7–10 seconds`: deliver a climax and create the next transition

Require a perceptible visual change at least every two to three seconds. Each clip uses at least four of these devices:

- expressive stick-figure action
- environmental transformation
- concrete visual metaphor
- diagram, arrow, symbol, or brief keyword
- particles, energy, fluid, explosion, or light effect
- camera push, pull, pan, orbit, shake, or tracking move
- foreground wipe or object passing the lens
- match cut, shape morph, or motion-matched transition
- interaction with another figure or oversized object

Visual events must reinforce the spoken idea. Do not add arbitrary spectacle merely to increase activity.

Keep the base background and stick figure strictly monochrome. Use no more than three saturated accent colors across the full video, generally assigning one dominant accent to each clip. Accent colors represent concepts such as danger, anxiety, energy, discovery, or success.

On-screen text is optional and limited to two to five English words per appearance. State the exact intended text and prohibit all unintended text.

## Character and Style Consistency

Lock these characteristics across every clip:

- circular head
- no facial features, hair, or clothing unless requested
- stable head-to-body ratio
- stable arm and leg length
- uniform medium line weight
- fixed foreground/background polarity from the selected theme
- emotion communicated through pose, timing, and motion

Use this distinction in prompt language:

> rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency

Avoid the ambiguous phrase `rapid style changes`, which may cause the model to change the drawing style or character design.

## Individual Prompt Contract

Write each prompt in this order:

1. Output specification: duration, aspect ratio, resolution target, and synchronized audio
2. Visual style and selected light/dark theme
3. Character lock and position in the selected composition
4. Allowed accent palette and its semantic meaning
5. Continuity description for the first frame
6. Three-part timed visual sequence
7. Exact English voiceover in quotation marks
8. Narrator identity, delivery, and speaking constraint
9. BGM and synchronized sound effects
10. Final-frame transition interface
11. Negative constraints

The negative constraints cover photorealism, unwanted 3D rendering, facial drift, clothing changes, extra limbs, malformed anatomy, broken or changing line weight, unintended characters, unrelated effects, random text, captions, subtitles, logos, watermarks, and altered or repeated dialogue.

## Audio Continuity

Text-only independent generations cannot guarantee identical voice timbre or music. Explain this limitation without blocking production.

Recommend, in order:

1. Reuse the same voice or audio reference when the interface supports it.
2. Repeat the identical narrator specification in every prompt.
3. For maximum consistency, generate visuals and synchronized SFX, then add one continuous external English voiceover and BGM track during assembly.

Specify an emotional BGM arc in Phase A. In Phase B, either keep the requested music description consistent across adjacent clips or recommend one continuous external track to avoid audible seams.

## Error Handling

- Short source: add a hook, example, progression, and closing callback without changing the central idea.
- Long source: select one central claim and remove secondary branches.
- Non-English source: write planning explanations in the user's language, produce English VO, and include a reference translation.
- Missing aspect ratio or theme: pause and ask only for the missing required choice.
- Excessive VO length: simplify wording and re-count before presenting Phase A.
- Sparse scene: add a content-relevant metaphor, interaction, or transformation.
- Overloaded scene: reduce simultaneous events while retaining the three timed beats.
- Aspect-ratio revision: recompose spatial action, camera paths, and text placement.
- Theme revision: invert monochrome polarity and recheck accent contrast.

## Quality Gates

Before presenting Phase A, verify:

- source, aspect ratio, and theme are known
- English VO is approximately 130–150 words
- estimated duration is approximately 55–65 seconds
- six clips have distinct narrative functions
- each clip contains at least three timed beats and four visual devices
- visual changes occur approximately every two to three seconds
- the palette uses no more than three saturated accent colors
- every adjacent pair has a transition connection
- the ending returns to the central message
- no unsupported facts were added

Before presenting Phase B, verify:

- the user explicitly approved Phase A
- there are exactly six standalone prompts
- every prompt contains the selected aspect ratio and theme
- every prompt repeats the character and voice locks
- every prompt includes exact dialogue, audio guidance, transition state, and negative constraints
- the stitching guide matches all six prompt endings and openings

## Open-Source Package

The repository structure is:

```text
stickman-video-director/
├── README.md
├── LICENSE
└── skills/
    └── directing-stickman-videos/
        ├── SKILL.md
        ├── agents/
        │   └── openai.yaml
        └── references/
            ├── storyboard-template.md
            ├── omni-flash-prompt-contract.md
            └── examples.md
```

Use the MIT License. Keep the Skill body concise and place detailed templates, model-specific prompt contracts, and the full tested example in references.

## Validation Strategy

Use test-driven Skill development. First run representative requests without the new Skill and record baseline failures such as skipped setup questions, static scenes, excessive narration, inconsistent character definitions, or premature production prompts. Then create the minimal Skill guidance and run the same scenarios with it enabled.

Test at least these scenarios:

1. Chinese motivational copy with missing aspect ratio and theme
2. English science article using `16:9` and the dark theme
3. Very short commercial idea using `9:16` and the light theme
4. Long source that must be condensed to one central claim
5. User approves Phase A, then changes only the aspect ratio
6. User requests Phase B before supplying a required setup choice

Success requires correct setup gating, explicit Phase A approval, a 130–150-word English voiceover, six visually dense clips, theme and aspect-ratio compliance, standalone Omni prompts, and matching transitions.

## Non-Goals

- Calling Gemini Omni Flash or another video-generation API
- Rendering, downloading, or editing video clips
- Producing more than one minute by default
- Creating complex illustrated human characters
- Guaranteeing identical native voices across independent generations without a voice reference

## Acceptance Criteria

The design is complete when a user can provide source material, choose aspect ratio and light/dark theme, approve a readable director's proposal, and receive six detailed Omni Flash prompts that form a coherent one-minute English-narrated stick-figure video with dense, relevant visual activity.
