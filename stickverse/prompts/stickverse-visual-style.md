# StickVerse visual style bible

A locked style is what makes AI content look *authored* instead of generated. Paste the
relevant block into every image or video prompt, unchanged, and repeat the character description
verbatim in every shot. Never paraphrase it between clips.

---

## 1 · The character (the "Verse Kid")

> A minimalist 2D stick figure: smooth round hollow head outlined in pure white, a thin single
> torso line, two arms and two legs drawn as clean uniform strokes with rounded joints, and
> small round hand tips. No face, no clothes, no hair. **A small red wristband on the left
> wrist.** Flat vector look, uniform medium line weight, no shading, no texture.

Rules that keep it on-model:

- **Always two arms, two legs, one head.** If a generator adds a third limb, regenerate.
- **Hollow head, no facial features.** Expression comes from posture, not faces.
- **The wristband is the logo.** Do not remove it, do not recolour it, do not add a second one.
- **Same proportions** in every shot: the figure is roughly 4.5 heads tall.
- Keep a `character/` folder with 3 approved reference images and attach them to every
  generation. Text alone will not hold consistency across a 9-minute video.

---

## 2 · The three approved palettes

### A · Deep Space (default)
> Near-black charcoal background `#0A0A0E` with a subtle radial crimson glow behind the
> subject, faint diagonal light streaks, sparse white star specks. Character in pure white.
> A single accent colour per frame: **signal red `#FF2D2D`** for danger/psychology,
> **gold `#FFC43D`** for money/success, **cyan `#40E0FF`** for tech.

### B · Warm Paper (human moments)
> Warm off-white paper `#FAF6EC` with a barely visible fibre texture and a very faint grid.
> Character in near-black ink. Hand-drawn red marker arrows, imperfect circles, underlines.
> Accent colours limited to red, warm yellow, and ink navy.

### C · Story Night (true stories)
> Cinematic dusk: deep navy-to-charcoal gradient, one large flat sun/circle in a solid story
> colour (blood red, ochre, jade), long flat ground line, silhouetted crowd shapes for scale.
> Character in warm white. No gradients on the character itself.

Never mix two palettes inside one video. Pick one per video, state it in the project file.

---

## 3 · Composition rules

| Rule | Detail |
|---|---|
| Text zone | Left third (16:9) or top third (9:16) stays clear of the character |
| Character size | 45–65% of frame height for thumbnails, 35–55% for scene frames |
| Eye line | Character's head in the upper third |
| Negative space | At least 30% of the frame empty — this is what makes it read instantly |
| Depth | Use scale contrast (giant vs tiny) instead of perspective rendering |
| Motion | Concrete action per shot: pointing, pushing, crossing arms, sitting, walking |
| Prohibited | Photos, 3D renders, textures on the character, realistic faces, logos, on-screen text |

---

## 4 · Copy-paste prompt templates

### Thumbnail art (no text — add type in the editor)

```text
Flat 2D vector illustration for a YouTube thumbnail, 16:9.
A minimalist white stick figure with a hollow round head and a small red wristband on the
left wrist, [ACTION: e.g. pressing both hands against an invisible wall].
The figure occupies the right two thirds; the left third is empty near-black space.
Near-black charcoal background with a soft crimson radial glow behind the figure, sparse
white star specks.
Strictly flat: no shading, no texture, no 3D, no gradients on the character.
No text, no letters, no numbers, no watermark, no logos.
```

### Scene frame (video)

```text
[STYLE BLOCK — paste in full]
[CHARACTER BLOCK — paste in full]
Scene: [one concrete action, one location, one emotional beat]
Camera: [wide / medium / close], [static / slow push in]
Palette: [A / B / C]
No on-screen text. No speech bubbles. No additional characters unless described.
```

### Shorts frame (9:16)

```text
Same style and character as above, vertical 9:16 composition.
The figure sits in the lower half, head around 55% of frame height.
Top 30% is empty dark space reserved for a caption.
No text, no logos, no watermark.
```

---

## 5 · Consistency checklist (per video)

- [ ] Same character reference attached to every generation
- [ ] Wristband present in every frame where the left wrist is visible
- [ ] One palette for the whole video
- [ ] One accent colour per video (red OR gold OR cyan)
- [ ] No frame has a third limb, extra finger, or a distorted head
- [ ] Head size consistent across shots
- [ ] No on-screen text baked into generated frames
- [ ] Thumbnail uses the same character and palette as the video

---

## 6 · Voice (the other half of the style)

| Property | Decision |
|---|---|
| Accent | Neutral English, no strong regional accent — maximises global reach |
| Pace | 150 words per minute, deliberate pauses after the hook and before the payoff |
| Tone | Calm, slightly amused, never shouting, never "YouTuber voice" |
| Person | Second person for the viewer, first person for the narrator's opinion |
| One voice | Lock one voice ID forever. Never change it once you have 10 videos |

If a voice sounds like an advertisement, it is wrong. If it sounds like a friend explaining
something they find genuinely interesting, it is right.
