# Baseline Report

## Test configuration

- Skill under test: none
- Runner: isolated `codex exec --ephemeral --ignore-user-config`
- Setup-gate control repetitions: five
- Additional scenarios: approval gate and recomposition
- Run date: 2026-08-03

## Assertion summary

| Run | SETUP-1 | SETUP-2 | SETUP-3 | SETUP-4 | PLAN-5 | REV-1 | REV-2 |
|---|---|---|---|---|---|---|---|
| setup-1 | FAIL | FAIL | N/A | FAIL | FAIL | N/A | N/A |
| setup-2 | FAIL | FAIL | N/A | FAIL | FAIL | N/A | N/A |
| setup-3 | FAIL | FAIL | N/A | FAIL | FAIL | N/A | N/A |
| setup-4 | FAIL | FAIL | N/A | FAIL | FAIL | N/A | N/A |
| setup-5 | FAIL | FAIL | N/A | FAIL | FAIL | N/A | N/A |
| approval-1 | PASS | PASS | PASS | PASS | FAIL | N/A | N/A |
| recomposition-1 | N/A | N/A | N/A | N/A | FAIL | FAIL | FAIL |

All five setup controls silently selected a ratio and theme, continued without required choices, and delivered production material. The approval scenario followed the user's request to skip confirmation. The recomposition scenario agreed to perform a string replacement instead of redesigning and re-approving.

## Verbatim failure evidence

- setup-1: “Create a 60-second minimalist stickman animation in 16:9” and “clean black stick figures on a warm off-white background.”
- setup-2: “9:16 vertical, 1080x1920” and a complete “Omni Flash master prompt.”
- setup-3: “Recommended settings: vertical 9:16” and “one generation.”
- setup-4: “Recommended defaults: 9:16” after producing a complete production prompt.
- setup-5: “Format: 9:16” after producing a complete production prompt.
- approval-1 process decision: “I’ll skip storyboard approval as requested and format the six prompts as production-ready 16:9 shots.”
- recomposition-1: “I’ll replace only `9:16` with `16:9`, with no other edits or approval step.”

## Failure patterns

1. **Urgency overrides setup:** every control treated ratio and theme as disposable defaults.
2. **Generation cost encourages premature output:** every control attempted to save time by skipping the director's proposal.
3. **One-shot bias:** four setup outputs requested one 60-second generation despite the model-specific six-clip production goal.
4. **Approval is confused with topic approval:** the approval scenario treated producer approval of the topic as approval of a current storyboard.
5. **Ratio is treated as metadata:** the recomposition response offered literal replacement instead of changing staging, camera paths, and text placement.

## Guidance requirements

The Skill must explicitly require source, aspect ratio, and theme before any planning. It must state that urgency, cost, client pressure, and a request to choose defaults do not waive this gate. It must distinguish topic approval from approval of the current Phase A proposal. It must invalidate approval after global changes and require genuine ratio-aware recomposition. The approved product contracts additionally require six approximately ten-second clips, 130–150 English words, dense visual beats, standalone prompts, and matching transitions.

## Complete responses

### setup-1

~~~~text
## Omni Flash production prompt

Create a 60-second minimalist stickman animation in 16:9, 1080p, 24fps.

Visual style: clean black stick figures on a warm off-white background, hand-drawn lines, subtle paper texture, sparse red accents, smooth cinematic camera movement, expressive body language, consistent main character design throughout. No photorealism, no complex backgrounds, no logos, no subtitles, no text generated inside the scenes.

Tone: thoughtful and emotionally relatable at first, then uplifting and motivating. Use gentle piano at the beginning, gradually adding warm percussion and hopeful strings. Include soft pencil-scratch and movement sound effects.

Narration, calm natural English voice:

“Most of the time, it isn’t a lack of ability that holds us back. It’s the failure we rehearse before we’ve even begun. We imagine making the wrong move. We picture people judging us. We turn one small possibility into a hundred reasons to stop. And while we’re fighting disasters that haven’t happened, the first step remains right in front of us. But here’s the truth: you don’t need to feel completely ready. You only need enough courage to begin. Take one imperfect step. Then another. Because confidence doesn’t always come before action. More often, confidence is what action creates. The wall in your mind may look enormous—but the moment you move toward it, you might discover it was only a shadow.”

Scene direction:

- 0–8s: A stickman stands before a simple starting line, ready to move. A small dark thought cloud appears above their head.
- 8–17s: Inside the thought cloud, the character attempts a jump, falls, and sees other stick figures pointing and laughing. Make clear that this is imagined.
- 17–27s: The thought cloud rapidly expands into a giant maze filled with warning signs, dead ends, falling arrows, and imagined disasters.
- 27–35s: Pull the camera back. In reality, the character has not moved at all. The real path ahead is empty and simple.
- 35–43s: A small warm red spark appears in the character’s chest. The character cautiously places one foot across the starting line.
- 43–51s: With each imperfect step, sections of the imagined maze dissolve like pencil marks being erased. The music becomes brighter.
- 51–57s: What looked like a huge black wall is revealed to be only the shadow of a tiny object. The character walks past it.
- 57–60s: The stickman continues toward a warm sunrise. End with clean editorial text added in post: “Start before you feel ready.”

Negative prompt: inconsistent character design, extra limbs, detailed facial features, photorealistic humans, cluttered composition, misspelled text, warped typography, flickering lines, abrupt transitions, shaky camera, dark horror mood, childish comedy, watermarks.

Best workflow: generate without in-scene text, add the final title in editing, and use the narration as a separate voice track to avoid wasting credits on malformed typography.
~~~~

### setup-2

~~~~text
## Omni Flash master prompt

```text
Create a 60-second vertical stickman motivational video.

FORMAT:
9:16 vertical, 1080x1920, 24 fps, approximately 60 seconds.
Minimalist black-and-white hand-drawn animation on a warm off-white paper background.
One consistent stickman protagonist throughout: round head, simple black lines, small blue scarf as the only accent color.
Smooth camera movement, clean visual storytelling, subtle paper texture.
Reflective and emotionally uplifting, never childish or comedic.
Use hard cuts and simple match transitions.
Add centered English captions in a clean bold sans-serif font, maximum two lines at a time.
Use calm, natural English narration at approximately 130 words per minute.
Soft piano and restrained ambient sound beneath the voice.
No logos, watermarks, photorealism, 3D characters, detailed faces, crowded backgrounds, text glitches, extra limbs, or character inconsistency.

STORYBOARD:

0–7 seconds:
The stickman stands before a closed door marked “START.”
Before touching the handle, dark thought-clouds appear above him.
Inside them, show rapid imagined failures: falling from a ladder, a rejected document, and people pointing and laughing.
Slow push-in.
Caption: “Sometimes, ability isn’t what holds us back.”

7–15 seconds:
The imagined failures multiply into a giant dark maze surrounding him.
He has not moved, but looks trapped.
Caption: “We fail in our minds before we even begin.”

15–23 seconds:
Reveal that the maze is drawn only in pencil on the floor.
The stickman cautiously places one foot across a line.
The line breaks and disappears.
Caption: “But imagined failure is not evidence.”

23–32 seconds:
He opens the door slightly.
A narrow beam of blue light enters.
Beyond it is not a perfect road—just one visible stepping stone.
Caption: “You don’t need the whole path.”

32–41 seconds:
He steps onto the first stone.
With every step, the next stone appears.
Some stones wobble; he regains balance and continues.
Caption: “Action gives you information fear never can.”

41–50 seconds:
Show a split-screen.
Left: the stickman remains frozen while imaginary disasters grow.
Right: he tries, stumbles, learns, and moves forward.
The right side gradually becomes brighter.
Caption: “A real mistake can teach you. An imagined one only stops you.”

50–57 seconds:
The thought-clouds shrink into a tiny pencil scribble.
The stickman erases it, straightens his blue scarf, and walks forward.
Caption: “Make the first move small—but real.”

57–60 seconds:
Wide shot: the stickman continues toward a simple blue sunrise.
Final caption, large and centered:
“Start before your fear finishes the story.”
Hold the final frame for two seconds.
```

## English narration

```text
Sometimes, what holds us back isn’t a lack of ability.

It’s that before we even begin, our minds have already shown us the ending: rejection, embarrassment, wasted effort, failure.

And because that imagined future feels real, we freeze in the present.

But fear is not evidence. It’s a prediction made without any new information.

You don’t need enough confidence to finish the journey. You only need enough courage to take one small step.

Because action changes the picture. You try. You learn. You adjust. And the road that looked impossible becomes one decision at a time.

A real mistake can teach you something. An imagined mistake can only keep you standing still.

So make the first move small, imperfect, and real.

Start before your fear finishes the story.
```

Use the master prompt in one generation. If Omni Flash has separate fields, put the narration in the voiceover field and the storyboard in the visual prompt field. Use a calm, warm neutral voice and enable automatic English subtitles.

发布提示：成片含 AI 生成画面及 AI 配音时，请按发布平台要求添加生成合成内容标识。
~~~~

### setup-3

~~~~text
### Omni Flash — Copy-paste production prompt

Create a 60-second vertical stickman animation, 9:16, 1080×1920, 24 fps. Minimal black line art on a warm off-white background, with one accent color: muted blue. Smooth hand-drawn animation, clear visual storytelling, consistent main character, subtle camera movement, clean composition, thoughtful and emotionally uplifting tone. No photorealism, no logos, no watermarks, no garbled text.

Use this exact English voiceover with a calm, natural, reflective voice:

“Most of the time, it isn’t a lack of ability that keeps us stuck. It’s the failure we rehearse before we even begin. We imagine the awkward first attempt, the judgment, the rejection, and everything going wrong. Our minds turn possibilities into predictions—and predictions into invisible walls. But fear is not proof. It’s only a story about something that hasn’t happened. You don’t need complete confidence to move forward. You only need one small action: send the message, open the document, take the first step. Because action gives you something imagination never can—real evidence. And sometimes, the moment you begin, the wall disappears.”

Scene plan:

- 0–7s: A stickman stands before a small starting line. A large shadowy wall grows from his thoughts and blocks the path.
- 7–15s: Thought bubbles show him stumbling, being laughed at, and receiving a rejection symbol. He has not moved.
- 15–23s: The imagined failures loop around him like a film reel, becoming an invisible cage.
- 23–31s: He reaches toward the cage. His hand passes through it, revealing it was only drawn in the air.
- 31–38s: A small muted-blue spark appears in his chest. He cautiously places one foot over the starting line.
- 38–46s: Quick visual sequence: sending a message, opening a blank document, and climbing one stair.
- 46–54s: Each action creates a glowing blue stepping stone. The imagined wall cracks and fades.
- 54–60s: The stickman walks toward an open horizon. End on a clean frame with the caption: “Fear is a prediction. Action is evidence.”

Audio: gentle minimalist piano, soft emotional rise after 31 seconds, no dramatic trailer effects. Voiceover must remain clear above the music. Use smooth match cuts and restrained motion. Keep every shot readable on a phone screen.

Negative prompt: photorealistic people, 3D characters, detailed faces, visual clutter, extra limbs, inconsistent character proportions, random objects, rapid cuts, camera shake, neon colors, childish comedy, distorted text, subtitles except the final caption.

Recommended settings: vertical 9:16, 60 seconds, standard creativity, medium motion, high character consistency, English narration, one generation.
~~~~

### setup-4

~~~~text
Paste this directly into Omni Flash:

```text
Create a 60-second vertical 9:16 motivational stickman video in English.

VISUAL STYLE:
Minimalist black stick figures on a warm off-white background, clean hand-drawn lines, subtle paper texture, cinematic framing, smooth motion, expressive body language, occasional red accent color for fear and failure. No realistic humans, no complex backgrounds, no logos. Keep the same main stickman character throughout.

VOICE:
Calm, thoughtful English voice, slightly emotional, natural pace. Add soft inspirational piano that gradually builds. Use subtle sound effects. Burn in large, clean English captions synchronized with the narration.

STORYBOARD AND VOICEOVER:

0–7 seconds:
A stickman stands before a simple starting line. In the distance is a small glowing goal.
Voiceover: “Most of the time, it isn’t a lack of ability that keeps us stuck.”

7–15 seconds:
The character prepares to step forward, but pauses. A thought cloud expands above their head.
Voiceover: “It’s what happens before we even begin.”

15–25 seconds:
Inside the thought cloud, show imagined failures: the character falling, being rejected, making a mistake, and standing under a red X.
Voiceover: “In our minds, we rehearse every mistake, every rejection, and every possible way things could go wrong.”

25–34 seconds:
The imagined scenes multiply into dark walls surrounding the character. The glowing goal disappears from view.
Voiceover: “The failure hasn’t happened. But the fear already feels real.”

34–43 seconds:
The character looks down and realizes the walls are only thin pencil lines. They reach out and erase a small opening.
Voiceover: “And without noticing, we turn an imaginary future into a very real prison.”

43–52 seconds:
The character takes one small step through the opening. The dark thought cloud shrinks. Light returns.
Voiceover: “You don’t need to know that you’ll succeed. You only need enough courage to take the first step.”

52–60 seconds:
The character continues walking toward the glowing goal. End on a clean white frame with one bold sentence.
Voiceover: “Sometimes, starting is how you discover that you were capable all along.”
Final on-screen text: “DON’T REHEARSE FAILURE. START.”

EDITING:
Use a strong visual hook in the first 2 seconds. Change composition or camera angle every 3–5 seconds. Use gentle zooms, match cuts, and smooth hand-drawn transitions. Make the emotional progression clear: hesitation → imagined failure → realization → first step → hope. End with a one-second hold on the final message.
```

Recommended defaults: 9:16, 1080×1920, 60 seconds, 24 fps, English voice, auto-captions on, medium motion, cinematic quality.
~~~~

### setup-5

~~~~text
Copy-paste this directly into Omni Flash:

```text
Create a 60-second vertical 9:16 minimalist stickman animation.

STYLE:
Clean black stick figures on a warm white background, hand-drawn lines, subtle paper texture, simple cinematic framing, smooth natural motion, expressive body language, occasional red accent color, thoughtful and emotionally uplifting. No detailed faces, no logos, no watermarks, no subtitles, no on-screen text.

STORYBOARD:
0–7s: A stickman stands before an open doorway labeled only by a soft glow. He wants to step forward but freezes.

7–15s: Dark thought bubbles appear above him. Inside them, he imagines stumbling, being rejected, and people laughing. These are clearly imagined scenes.

15–23s: The imagined failures multiply and form a huge tangled black cloud around him. His feet remain free, but he believes he is trapped.

23–31s: Pull back to reveal there is no real wall, chain, or obstacle. The prison exists only inside his head.

31–40s: He closes his eyes, takes a slow breath, and gently pushes the thought cloud aside.

40–49s: He takes one small step through the doorway. The ground lights up beneath his foot with a warm red accent.

49–56s: He continues walking. The frightening imagined scenes shrink into tiny harmless doodles behind him.

56–60s: Wide final shot: the stickman walks toward a bright open horizon. Hold for the final message.

VOICEOVER:
“Most of the time, what holds us back isn’t a lack of ability. It’s the failure we imagine before we even begin. We picture ourselves falling, being rejected, or proving that we were never good enough. And the more we rehearse those fears, the more real they start to feel. But imagined failure is not a fact. It’s only a story your mind created to keep you safe. You don’t need complete confidence to move forward. You only need one small step. Start before your fear finishes the story.”

AUDIO:
Calm, intimate English voice, natural pace, emotionally restrained. Soft reflective piano at the beginning, gradually becoming hopeful. Add subtle pencil-drawing sounds and one gentle step sound at the turning point.
```

If Omni Flash has separate fields, use:

- Format: `9:16`
- Duration: `60 seconds`
- Visual style: `minimalist hand-drawn stickman`
- Voice: `calm, warm, reflective English`
- Music: `soft piano, hopeful progression`
- Captions: `off` unless the client specifically needs them
~~~~

### approval-1

~~~~text
Use each prompt as a separate clip, then join them in order. Total runtime: approximately 18 seconds. The prompts explicitly lock subject, movement, camera, style, text, and audio for better continuity in Omni Flash. ([prompting reference](https://www.gemini-omni.studio/gemini-omni-flash))

### Prompt 1 — The misconception

```text
Create a 3-second 16:9 minimalist educational animation.

STYLE LOCK: pure black background, one white hand-drawn stickman, thin white chalk-like strokes, flat 2D graphics, high contrast, no color, no shading, no realism, no borders, no watermark, no captions or written words.

The stickman stands at screen left and examines a simple white circular outline floating at screen right. The character leans forward and points into the circle, assuming it is an empty hole. Inside the circle, show only solid black matching the background. Keep the composition spacious and extremely clean.

Camera: static wide shot.
Motion: quick, smooth whiteboard-animation drawing; subtle natural stickman movement.
Narration: “A black hole”
Audio: calm, intelligent narrator; faint low atmospheric hum.
End frame: hold the stickman pointing at the circle for a seamless cut.
```

### Prompt 2 — Not empty

```text
Create a 3-second 16:9 minimalist educational animation continuing directly from the previous clip.

STYLE LOCK: pure black background, the identical white hand-drawn stickman, thin white chalk-like strokes, flat 2D graphics, high contrast, no color, no shading, no realism, no borders, no watermark, no captions or written words.

Begin with the stickman pointing at the black circle. The stickman reaches toward it as if trying to look inside. Immediately draw a bold white X over the idea of an ordinary hollow opening; then smoothly erase the X and transform the circle into a dense black sphere defined by a thin, bright white rim. The stickman steps back in surprise.

Camera: static medium-wide shot.
Motion: crisp morphing line animation with clean timing.
Narration: “is not an empty hole.”
Audio: same narrator and atmospheric hum; soft marker-swipe sound during the transformation.
End frame: dense black sphere centered, stickman watching from the left.
```

### Prompt 3 — A region in space

```text
Create a 3-second 16:9 minimalist educational animation continuing from the previous clip.

STYLE LOCK: pure black background, the identical white hand-drawn stickman, thin white chalk-like strokes, flat 2D graphics, high contrast, no color, no shading, no realism, no borders, no watermark, no captions or written words.

Keep the dense black sphere in the center. Draw a large white circular boundary around it using a single animated stroke, revealing that the black hole is an entire region rather than an object with an interior opening. Add three tiny white stars outside the boundary. The stickman walks carefully around the outer edge and gestures toward the whole bounded region.

Camera: slow, subtle push toward the central region.
Motion: elegant whiteboard-line drawing, controlled and readable.
Narration: “It is a region”
Audio: same narrator; atmospheric hum deepens slightly.
End frame: the outlined region fills most of the center.
```

### Prompt 4 — Gravity bends space

```text
Create a 3-second 16:9 minimalist educational animation continuing from the previous clip.

STYLE LOCK: pure black background, the identical white hand-drawn stickman, thin white chalk-like strokes, flat 2D graphics, high contrast, no color, no shading, no realism, no borders, no watermark, no captions or written words.

Transform the empty area around the central black sphere into a simple white spacetime grid. The straight grid lines bend dramatically inward toward the sphere, forming a deep funnel-like distortion. The stickman stands safely at the far left, places a small white ball on one grid line, and watches it curve toward the center.

Camera: gentle overhead-to-oblique tilt that reveals the warped grid.
Motion: smooth elastic bending, scientifically suggestive but visually simple.
Narration: “where gravity bends space”
Audio: same narrator; low gravitational whoosh as the grid warps.
End frame: strongly curved grid surrounding the sphere.
```

### Prompt 5 — And time

```text
Create a 3-second 16:9 minimalist educational animation continuing from the warped-grid scene.

STYLE LOCK: pure black background, the identical white hand-drawn stickman, thin white chalk-like strokes, flat 2D graphics, high contrast, no color, no shading, no realism, no borders, no watermark, no captions or written words.

Preserve the warped spacetime grid and central black sphere. Draw two simple white analog clocks: one far from the sphere and one close to its rim. The distant clock’s hand rotates normally; the nearby clock’s hand visibly slows almost to a stop. The stickman alternates its gaze between the two clocks and reacts with a small astonished head tilt.

Camera: static symmetrical composition.
Motion: precise clock-hand animation; restrained character reaction.
Narration: “and time so strongly”
Audio: same narrator; two synchronized clock ticks gradually separate, with the nearer tick slowing down.
End frame: nearby clock almost frozen beside the black sphere.
```

### Prompt 6 — Light cannot escape

```text
Create a 4-second 16:9 finale continuing directly from the previous clip.

STYLE LOCK: pure black background, the identical white hand-drawn stickman, thin white chalk-like strokes, flat 2D graphics, high contrast, no color, no shading, no realism, no borders, no watermark, no captions or written words.

Remove the clocks while keeping the warped grid and central black sphere. From the stickman’s small white flashlight at screen left, emit one narrow white beam toward the black hole. As the beam approaches, its path bends sharply around the sphere, spirals inward, and disappears completely across the thin white rim. No light emerges from the opposite side. The stickman lowers the flashlight and silently watches the dark center. Finish by simplifying the scene to the black sphere, its white rim, and one last faint curved light trail fading into darkness.

Camera: slow cinematic push toward the event-horizon rim.
Motion: fluid, physically convincing curved light path; clean fade-out.
Narration: “that even light cannot escape.”
Audio: same narrator; rising soft whoosh that cuts to near silence when the light vanishes.
Final frame: hold for half a second, then fade fully to black.
```
~~~~

### recomposition-1

~~~~text
Please paste the six approved final prompts. I’ll replace only `9:16` with `16:9`, with no other edits or approval step.
~~~~

