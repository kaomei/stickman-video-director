# A7 · Four-block prompt contract

Read [production](rubber-hose.md) and [acceptance](a7-acceptance.md). The authoritative strings are [approved-prompt-lock.json](../assets/a7/approved-prompt-lock.json). Copy Blocks 1 and 2 exactly into every standalone prompt. The “about 2 pixels wide at 360p” wording describes relative thinness; output resolution is a separate setting. Do not change it to a thick filled spine at 720p.

## Block 1 — fixed character

```text
ONE original stickman, drawn as a literal thin-line stick figure. Flat paper-white circular face, two black oval eyes, tiny brows and mouth, exactly two short curved black hair tufts. Head outline directly touches a short black neck. Neck, vertical spine, two arms and two legs are each a SINGLE uniform fine ink stroke, like a pen-drawn stick diagram, about 2 pixels wide at 360p. Background remains visible immediately beside both edges of the narrow spine, even between the shoulders. Two small white outlined hands and two short black curved feet. All joints visibly connected; head size and line width remain constant during bending. Bare line body; no clothing, tie, black filled chest, triangular neck shape or rounded torso.
```

## Block 2 — fixed drawing and palette

```text
An original early hand-inked theatrical cartoon with a fine-line stickman and an exquisitely HAND-DRAWN 1930s background painting. A subdued colored palette: dusty sage-gray green, pearl-gray plaster, muted gray-taupe, pale ivory furnishings and tiny faded brick-red details. Not pure monochrome, not sepia. The face and hands are flat clean neutral WHITE with no yellow tint. Every room object is defined first by a confident visible black pen outline, with small hand-drawn seams, hinges, joints and irregular edges. Color inside those contours is laid in as flat matte paint shapes with delicate visible brush texture, soft stippling and sparse hatch strokes. Use a few broad, simple painted tone regions for depth, not smooth shading wrapped around furniture. Uniform diffuse stage illumination: lamps remain OFF, walls and work surfaces have even tones; no lit pools, glints, bloom, window glow or directional cast-light effects. Period craftsmanship and fine architectural drawing provide richness, while shapes remain clear and quiet around the stickman. Distinct 2D ink-and-paint cartoon scenery, no CGI, 3D renders, ambient occlusion, smooth bevels, plastic, photoreal material, airbrushed gradients, film border, heavy scratches or existing cartoon character.
```

## Block 3 — variable scene with a shared drawing standard

Keep this block compact: name the period location, choose a few essential inked construction details and flat painted areas, then establish the main prop and clear acting space. The frozen drawing block already carries the full style; a new location does not require another long verbatim anchor paragraph. Match the drawing method, not just its colors. Keep the actor readable and do not import the reference kitchen's set or opening shot.

This is the **exact scene block from the user-accepted post-office test**:

```text
A small 1930s post office: a finely inked timber service counter, pigeonhole mail shelves, frosted window and scuffed floorboards. A dusty sage-gray and pale ivory stage with quiet painted wear and clear space around the hero. One small parcel tied with string and a mechanical pan scale establish the task. The reference kitchen is not a location in this film.
```

## Block 4 — variable timed action and camera

Write a causal performance with anticipation, action, consequence and reaction, using purposeful framing. State the important grips, releases, foot contacts and prop states; keep head/neck/limb connections and the narrow spine stable. Timing follows the actual requested duration and readable action. Four beats were useful in these ten-second tests, not a required shot quota.

This is the **exact action block from the same accepted test**:

```text
0-2.5s medium side view: the hero walks two clear planted steps to the counter, carrying one small parcel in both hands, then places it on the scale and visibly releases it. 2.5-5s cut closer: the scale pan sinks much farther than he expects; he leans down, peers, raises his eyebrows, then tries to lift the surprisingly heavy parcel. 5-7.5s medium-wide view: he braces both feet and pulls with both hands, stretching elastically while his connected trunk stays a fine ink line; the parcel suddenly comes free, making him take two quick backward balancing steps. 7.5-10s closer reaction: he regains his balance, hugs the parcel carefully and gives the camera an exhausted, embarrassed little smile. The counter, scale and parcel stay coherent. Each beat has anticipation, action and a readable reaction. Keep the fine two hair tufts, head-neck connection and bare thin body throughout; no clothing or filled torso.
```

## Accepted expanded examples

- [Post office: exact submitted prompt](../assets/a7/validated-prompts/post-office.txt)
- [Seaside pier: exact submitted prompt](../assets/a7/validated-prompts/seaside-pier.txt)
- [Settings, prompt hashes and review scope](../assets/a7/validated-workflow.json)

Both examples contain the same short production introduction and exact frozen Blocks 1/2, then their own Blocks 3/4. They were tested with an existing kitchen image as **reference material**, not as a first frame, and accepted by the user. They are reference examples, not required plots or pre-cleared soundtracks. Do not copy their ten-second/720p/16:9 introduction unchanged if the new brief requests other settings. Lyrics are not required.

For a new prompt, retain Blocks 1/2 exactly, change the scene/action and adjust the introduction/settings to the approved brief. Review all four blocks for contradictions, impossible contacts, overloaded beats, yellow faces, filled torsos, smooth shading or dramatic lighting. If a prompt limit prevents the complete fixed blocks, resolve the tool limitation rather than silently dropping them.

For Director prompt-only delivery, supply all four fully expanded blocks, output settings, intended text/audio and the reference image with its input role; no unresolved placeholders or “same character/style as above”. For execution, follow the [reference-input procedure](rubber-hose.md#bundled-references-and-actual-model-inputs), record the actual image/input identity and exact submitted text, and stay within the user's existing generation/upload/download permissions. A new still or low-resolution test is not compulsory before using this successful direct-video route.
