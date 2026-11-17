# Style Catalog: Visual Styles & Prompt Formulas

This catalog defines the supported visual styles for `directing-stickman-videos`, including character DNA locks, environment specifications, motion pacing, and negative constraints.


Scope: the matrix and formulas below describe **A1–A5 only**. A6 uses [Amber Noir](amber-noir.md). A7 uses [Rubber Hose Animation](rubber-hose.md), its [frozen prompts](a7-prompt-contract.md) and [acceptance](a7-acceptance.md). Do not apply this matrix's general constraints or voice/pacing rules to A6/A7.

---

## 1. Style Matrix Overview

| Style Key | Style Name | Visual Theme | Best For | Character Design |
|---|---|---|---|---|
| **Style 1** | Classic Minimalist (Light / Dark) | Pure white or black canvas, monochrome lines, up to 3 saturated accent colors | High-density explainers, pure logic, mental models, fast-paced cognitive concepts | Hollow circle head, single-line body, no clothing, occasional simple line expressions |
| **Style 2A** | Modern Beanie - Studio Tech (极简科技风) | Pure white high-key studio, subtle light-gray perspective grid, glowing cyan/blue glass UI | Tech tutorials, AI tool breakdowns, career insights, methodology breakthroughs | Red beanie (no pom-pom), yellow t-shirt, black stick limbs, smooth 2D animation |
| **Style 2B** | Modern Beanie - Cinematic Story (彩色故事风) | Full-color narrative environments, cinematic lighting & depth (warm room, dusk, desert, summit) | Emotional storytelling, personal growth, motivational journeys, narrative hooks | Same red beanie & yellow t-shirt figure staged inside rich environmental lighting |
| **Style 3** | Prehistoric Hand-Drawn / Dark Comedy (史前手绘 / 黑色幽默) | Earthy prehistoric environments, warm fire accents, subtle paper texture | Satirical stories, visual analogies, ironic callbacks | White filled heads, expressive cartoon faces, black stick limbs, variable story-specific cast |
| **Style 4** | Cozy Storytelling (治愈故事风) | Full-color 2D cartoon locations, gentle atmospheric light, varied cinematic shots | Relatable life stories, emotional growth, educational storytelling | White filled round head and slim torso, dark stick limbs, simple expressive face |
| **Style 5** | Historical Cartoon (历史卡通风) | Full-color painterly historical settings, clean cel shading, era-specific wardrobe and props | History explainers, historical daily life, civilization stories and historical comedy | White filled round heads with connected short white necks, expressive individual faces, solid black oval eyes, thin black exposed limbs and small solid black mitten-shaped palms continuous with the wrists, one subtle integrated thumb lobe, no individual fingers, finger separations, white fills or gloves |

For Style 3 read `prehistoric-dark-comedy.md`. It overrides this catalog's generic motion and piano rules. Fix the drawing grammar across stories, not one universal face; fix each approved character within a story.

For Style 4 read `cozy-storytelling.md`. Treat locations as story beats, not one universal room. Its English display name is **Cozy Storytelling**; do not rename it Sketchbook Stories, hand-drawn, or prehistoric.

For Style 5 read `historical-cartoon.md`. Freeze the drawing grammar; change the era pack, not the character rendering system. Use its cast cards, historical palette and story-appropriate music together with `voice-continuity.md`.

---

## 2. Style 1: Classic Minimalist

### Polarity & Background
- **Light Theme**: Flat, uniform, digitally pure-white canvas. Strictly forbid gray tint, paper texture, gradients, shadows, lighting, bloom, fog, or 3D depth.
- **Dark Theme**: Flat, uniform, pitch-black canvas. Pure white line art with high-contrast accent colors.

### Character DNA

**Classic Dark — tested faceless base:**
```text
Use minimalist two-dimensional white line animation. Show the same consistent stick figure with a hollow circular head, no face, no eyes, no mouth, no hair, no clothing, no filled body, stable proportions, connected line limbs, and uniform medium line weight. Exactly two arms and two legs are visible per figure. Each limb appears only in its current pose: raising or lowering the right arm replaces that arm's previous line, never leaving a resting arm beneath an active arm. The figure stays white; accent colors affect only props and graphic effects.
```

**Classic Light — tested faceless base:**
```text
Use minimalist two-dimensional black line animation. Show the same consistent stick figure with a hollow circular head, no face, no eyes, no mouth, no hair, no clothing, no filled body, stable proportions, connected line limbs, and uniform medium line weight. Exactly two arms and two legs are visible per figure. Each limb appears only in its current pose: raising or lowering the right arm replaces that arm's previous line, never leaving a resting arm beneath an active arm. The figure stays black; accent colors affect only props and graphic effects.
```

Choose the theme, then freeze its full anchor and repeat it verbatim in every clip. Do not expand it into numeric ratios, skeleton/rig definitions, pen paths, separate hand/foot shapes or body-volume descriptions. Keep pose, movement, props and camera in the timed sequence, not in competing character definitions. The current-pose rule applies to every limb; if the approved story uses a left-arm lead action, adjust the handedness once before freezing, never clip by clip. Preserve energetic actions and rich effects; draw motion trails on props or detached graphics, not as additional limb poses.

Occasional simple line expressions are allowed by default. Before freezing either base anchor, replace only "no face, no eyes, no mouth," with "occasional simple line expressions, no detailed facial features," and keep the prompt's negative constraints compatible with that choice. If the user explicitly requests a faceless character, keep the base unchanged. Expressions never change head fill, head outline, body structure or proportions; no detailed eyes, pupils or realistic facial rendering.

2026-10-13 Flow retest: Omni 1.1 Flash, 16:9, 720p, independent 10s clips for a paper-airplane/perfectionism story. The final Dark base was used in three clips plus two repeated high-risk clips; the Light base was used in two clips. Browser-sampled action frames did not show extra limbs or sudden head enlargement in these final samples. Hand/foot endpoints and cross-clip line weight can still vary; this is not frame-by-frame certification or a guarantee for future generations. The expression-enabled and left-handed variants were not separately tested. Detailed scope and asset IDs are in `tests/reports/classic-character.md` at repository level. Prop continuity and audio were not accepted by this character-only check.

### Palette Contract
- Maximum of three saturated accent colors named with ordinary words (e.g., vivid red, electric blue, warm gold).
- No technical color notations (hex, RGB, Pantone).

---

## 3. Style 2: Modern Beanie Zeke

### Character DNA Anchors (Anti-Deformation Lock)

To prevent character drift, bug-eye deformations, or clothing loss across clips, repeat this complete frozen character anchor verbatim in every independently usable generation prompt, including later clips and both Style 2 variants:

**Every Clip Character Anchor:**
```text
A minimalist 2D animated stick figure wearing a bright red beanie (smooth rounded knit, no pom-pom) and a yellow t-shirt, with simple black stick limbs and shorts. Simple black lines, vibrant colors, smooth 2D animation style.
```

Never shorten it to "the same character", an ellipsis or a previous-clip reference. The clip count follows the approved story and selected model's supported durations; there is no fixed Clips 2–6 sequence. Scene, action and camera instructions stay separate from this character identity.

**Deformation Prevention Rules:**
- **No Realistic Facial Features**: Hollow circular head or minimal dot eyes only. Never request detailed pupils, irises, or photorealistic facial contours (which trigger alien bug-eyes).
- **No Pom-Poms**: Specify smooth rounded beanie top to prevent erratic pom-poms or winter tassels.
- **Always Include Both Beanie and T-shirt**: Omitting the shirt results in naked stick bodies; omitting the beanie results in standard Style 1 characters.

---

### Sub-Style 2A: Modern Studio Tech (极简科技风)

**In Plain Language**: Apple 发布会式极简科技风。纯白亮面高光空间 + 极淡浅灰透视地砖网格 + 悬浮青蓝半透明玻璃 UI/微光质感。

#### Environment Specification
```text
in a modern bright white studio space with subtle light-gray perspective grid lines on the floor plane. High-key studio lighting, clean white negative space, sleek glowing cyan and electric blue glass holographic UI elements.
```

#### Mandatory Negative Constraints (Anti-Clutter)
Without explicit negative constraints, diffusion models tend to generate motherboard circuitry, spaceship corridors, and cracked concrete. **Always append this negative clause in 2A prompts:**
```text
Negative constraints: strictly minimalist studio aesthetic, no circuit board textures, no sci-fi wall panels, no spaceship corridors, no cracked concrete, no grunge textures, no photorealistic human skin, no speech bubbles, no dialogue text boxes.
```

#### Motion Dynamics (Anti-Stutter & Anti-Lag)
- **Do not use abstract liquid/morphing transformations** (e.g., stairs melting into a clock), which trigger latent flicker and stuttering.
- **Use physical, character-driven interactions**:
  - Leaping and bumping an invisible glass ceiling with a comedic bounce.
  - Tapping a sneaker onto the floor grid to emit an expanding cyan ripple wave.
  - Pulling out a glowing light-pen to draw a crisp luminous line bridge across an abyss.
  - Touching a sleek floating glass panel to reveal an icon-only illuminated lock.
  - Pushing open a heavy minimalist vault door to step forward into bright horizon light.
- **Pacing**: Time connected setup, escalation and payoff actions across the approved edit, with source lengths and retained ranges chosen for the story and selected model. A source can supply several shots; short shots need not repeat an entire three-beat arc. Never let the character stand idle or stare at the camera for multiple seconds.

---

### Sub-Style 2B: Cinematic Story (彩色故事风)

**In Plain Language**: Pixar 故事短片风。全彩沉浸式场景（暖光台灯卧室、黄昏窗前、荒野公路、云端山顶）+ 电影叙事光影。

#### Environment Specification
```text
in a rich full-color cinematic environment [describe setting: e.g., a dimly lit cozy bedroom with warm lamplight / a vast open desert highway under a glowing dusk sky / a dramatic mountain ridge above rolling golden clouds]. Cinematic volumetric lighting, soft depth of field, atmospheric narrative mood.
```

#### Character & Style Consistency
- The character remains the same minimalist 2D stick figure in red beanie and yellow shirt.
- Maintain smooth 2D vector animation aesthetics for the character even within a textured, atmospheric background.

#### Negative Constraints
```text
Negative constraints: no photorealistic human skin or faces, no 3D humanoid CGI uncanny valley models, no chaotic line glitches, no speech bubbles, no dialogue text boxes.
```

---

## 4. Style 4: Cozy Storytelling (治愈故事风)

Minimalist expressive characters inside colorful cartoon worlds: an office, a metro platform, a street-side cafe, a park or another story-appropriate setting. Use close action inserts, wide establishing views, lateral tracking and motivated location cuts. Warmth belongs to the visual treatment; preserve the source's conflict and meaning rather than making every topic cheerful.

Each new planned narrative segment normally establishes a different location; its duration follows the approved plan and selected model's capabilities. Keep the character, important props, screen direction and full voice profile consistent, while deliberately changing scenery. A new camera angle on the same desk is not a substitute for a new story location. Single-location requests and approved callbacks remain valid exceptions.

Use the full character anchor, prop-state rules and acceptance checklist in `cozy-storytelling.md`; do not inherit Style 1's hollow-head/no-face/no-filled-body bans or Style 3's crude sketch/animal-hide rules.

---

## 5. Style 5: Historical Cartoon (历史卡通风)

Expressive stick-figure characters in historical costume, staged in colorful painted landscapes and architecture. Use wide establishing views, readable character actions, reaction close-ups and motivated cuts. Design the cast for the story: a Roman soldier, an Edo-period student or an Egyptian temple attendant need different wardrobe and props, not different drawing grammar.

Use `historical-cartoon.md` for the full style anchor, era-pack template, cast cards and prompt assembly. Visual concept and Roman era-pack contribution: [@leksautomate](https://github.com/leksautomate).

---

## 6. Universal Audio Continuity Contract

For **narrated A1–A5 projects**, including Styles 3 and 4, apply `voice-continuity.md` and the [independent A audio timeline contract](a-audio-timeline-and-review.md). Default finished narration to a verified full-film external master in the approved voice; use continuous film-level music or deliberately arranged cues. Repeat full voice anchors only in prompts actually generating native speech. Footage intended for external VO must not request that narration from the video model. An approved no-narration brief needs no narrator.

### Historical native-audio voice example
```text
One off-screen adult male narrator throughout. General American accent, warm clean baritone, medium-low pitch, gentle chest resonance, no raspiness or breathiness. Calm conversational delivery, restrained pitch variation, steady speaking pace, and close, dry studio sound. Keep the same vocal timbre, register, accent, pace, and recording quality throughout. Emotional progression belongs to the visuals and music; do not change the narrator's voice or switch to character dialogue.
```
This is the historically user-accepted male native-audio example, not a compulsory voice. Resolve other approved profiles through `voice-continuity.md`; repeat the full block only in relevant native-speech prompts. External narration keeps its profile in a separate synthesis plan. Keep narration off-screen and voice-first unless approved otherwise. The Style 2A Hope listening acceptance is specific to that sample; other profiles/styles remain untested for audio matching.

### Historical native-audio music examples

The following old clip-level examples document a prior prompting approach. They are **not the current assembly instructions** and do not establish identical regenerated music. A finished film uses the independent continuous music master/cue plan above; do not concatenate these mixed clip soundtracks at picture cuts.
- **Clip 1**:
  ```text
  Audio: Voiceover clearly audible over quiet, thoughtful piano and subtle soft ambient synth, building gentle optimistic momentum.
  ```
- **Clips 2–6**:
  ```text
  Audio: Voiceover seamlessly continues the identical quiet, thoughtful piano and subtle soft ambient synth from clip 1, maintaining identical tempo, instrumentation, and optimistic narrative momentum. Synchronized crisp SFX on physical actions.
  ```

---

## 7. Story-led Visual Beat Pacing Template

Every generation prompt needs explicit timed story actions appropriate to its actual source duration and intended retained ranges. Use the [production and review contract](a-production-and-review.md) to map source-local times to the final edit. Replace the time fields below with real values; add or remove beat rows to match the performance rather than imposing a three-beat quota:

```text
Timed Synchronized Visual Beats:
Generated source duration: [verified supported duration]
Retained source range(s) → final edited time(s): [actual in/out mapping]
- [source start–end] (approved VO/audio cue, if any): [connected action / motivated framing / visible result]
- [source start–end] (approved VO/audio cue, if any): [next story event / reaction / continuity into the next retained shot]
```
