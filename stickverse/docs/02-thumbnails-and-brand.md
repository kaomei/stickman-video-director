# 02 · Thumbnails and the brand system

A thumbnail has one job: **win the click from someone who was not looking for you.**
On mobile it is roughly 320 × 180 px — half the width of a phone. If your idea does not read
at that size, it does not exist.

This folder gives you six finished thumbnails and the drawing kit to make more in the same
style.

---

## 1. The six starters

| File | Title it's built for | Pillar | Why it works |
|---|---|---|---|
| `01-your-brain-lies-to-you.jpg` | *Your Brain Lies To You* | Psychology | Red voice inside the stickman's head = threat + curiosity. Text is 3 words per line. |
| `02-same-loop-same-year.jpg` | *Same Loop, Same Year* | Human moments | Paper background breaks the feed pattern. Strike-through = a claim being rejected. |
| `03-one-man-vs-an-empire.jpg` | *One Man vs an Empire* | True stories | Scale contrast: tiny hero, red sun, faceless crowd. Story thumbnails live on size difference. |
| `04-3am-again.jpg` | *3AM Again* | Human moments | Instant recognition for anyone who doomscrolls at night. Clock face is texture, not decoration. |
| `05-they-pay-you-less.jpg` | *They Pay You Less Than This* | Money | Green + gold + coins = money before you read a word. |
| `06-you-vs-you-in-1-year.jpg` | *You vs You in 1 Year* | Motivation | Split screen, before/after, no reading required. |

Each also has a 256 px copy in `thumbnails/mobile-check/`. That is the real test.

`thumbnails/ab-test/` holds three variants of video #1 (different pose, different accent colour)
ready to drop into Studio's Test & Compare. They are the same idea, deliberately different — a
good A/B test changes one big thing, not the shadow.`

**Pick a cover, not all six.** Rotating five different styles teaches you nothing. Stay on the
dark + red-accent look for the first 20 videos, because that is what makes a feed recognise
you.

---

## 2. House rules (these are what make the set feel like one channel)

1. **Left third = text, right two thirds = character.** Eye reads left to right; the art sells
   the emotion on the right.
2. **Maximum 4 words per line, maximum 2 lines.** 6 words total is the ceiling.
3. **Anton, all caps, tight leading (0.9), tiny letter-spacing.** Never more than two font
   families in a thumbnail.
4. **One accent colour per thumbnail** — red for danger/psychology, gold for money/success,
   cyan for tech.
5. **White or near-white headline with a soft shadow.** Text on a busy photo needs a shadow;
   text on flat dark needs nothing.
6. **One idea.** If you can describe the thumbnail in a sentence with "and", delete a half.
7. **Faces beat objects.** A stickman with a hollow head turned away from the viewer creates a
   "what is happening" itch. Use it.
8. **No more than 15% of the frame for the logo bug**, bottom-left, ~30% opacity. People do not
   click logos; they click tension.
9. **Do not repeat the title word-for-word.** The thumbnail should complete the title, not echo
   it. Title: *"The 3AM habit that is quietly stealing your 20s"* → Thumbnail: **3AM AGAIN.**
10. **Keep the bottom-right corner clean.** The duration stamp and progress bar live there.

---

## 3. Technical spec (do not skip)

| Property | Value |
|---|---|
| Size | **1280 × 720** (16:9). Minimum width 640. |
| File | JPG or PNG, **under 2 MB** (mobile limit) |
| Colour | sRGB |
| Text safe margin | ≥ 40 px from every edge |
| Contrast | headline must survive a 5× downscale |
| Shorts cover | **1080 × 1920**, and the top ~15% / bottom ~20% get covered by Shorts UI |

YouTube may upscale a 720p thumbnail on TV, so start at 1280×720 and export at quality 90 —
do not export a 4K canvas down to 720p and then re-compress it twice.

**Shorts covers:** you now get a custom cover on the Shorts shelf, but YouTube does **not**
support A/B testing for Shorts. Pick one, make it match your long-form system, and move on.

---

## 4. Testing: what to do with `Test & Compare`

Available in YouTube Studio on **desktop**, for long-form videos, on channels with **advanced
features** enabled. It is not available for Shorts, scheduled lives or Premieres.

How to use it well:

1. Upload **up to 3** thumbnails (or titles, or both).
2. YouTube shows them to real viewers and picks the version with the **highest watch time** —
   not the highest CTR. A clickbait thumbnail that gets clicks and instant exits loses.
3. Give it up to **2 weeks**; it needs impression volume to declare a winner.
4. Test **big differences**, not shade changes: different character pose, different background,
   text vs no text. Similar variants take forever and often return "Performed Same".
5. If the result is inconclusive, the **first** thumbnail you uploaded wins by default — so
   upload your favourite first.
6. Never change the thumbnail mid-test; it cancels the test.

**Before you have access**, run your own version: publish, wait 48 hours, look at
*Reach → impressions → CTR*. Below 3% on a new channel = the packaging is the problem, not
the algorithm. Swap the thumbnail once, wait 48 hours, compare.

Benchmarks for a new channel (first 20 videos):

| Metric | Weak | Fine | Strong |
|---|---|---|---|
| Long-form CTR | < 3% | 4–6% | 8%+ |
| Average view duration | < 30% | 40–50% | 60%+ |
| Shorts "viewed vs swiped away" | < 50% | 60–70% | 80%+ |
| Shorts average view % | < 60% | 70–90% | 100%+ (looped) |

---

## 5. Making new thumbnails in this style

### Option A — change the code (fastest, consistent)

Edit `tools/make_thumbnails.py`:

```python
def t7_your_version():
    w, h = TW * SS, TH * SS
    img = dark_bg(w, h, seed=12, glow_pos=(0.70, 0.45))
    d = ImageDraw.Draw(img)
    x = w * 0.055
    kicker(d, x, h * 0.095, "PSYCHOLOGY", w)             # eyebrow
    size = int(w * 0.104)
    last = stack(img, ["LINE ONE", "LINE TWO"],          # 1-2 short lines
                 x, h * 0.205, size, fill=WHITE, leading=0.895)
    under_last(img, "LINE TWO", x, last, size, "the bit that hooks")  # optional script note
    draw_stickman(img, (w * 0.71, h * 0.28), h * 0.62, pose="think", color=WHITE,
                  stroke=w * 0.0072, head_fill=(14, 14, 20))
    logo_bug(img)
    out = finish(img, TW, TH, SS)
    save_jpg(out, THUMB / "07-your-version.jpg")
```

Then call `t7_your_version()` in `__main__` and rerun. Poses available:
`think`, `push`, `point_up`, `open`, `sit`, `crossed`.

### Option B — design in Canva / Photopea

1. New file 1280×720.
2. Import a PNG from `thumbnails/` and paint over the old headline with the matching background
   colour — or start from the flat background recipe below.
3. Type in **Anton** (installed from `brand/fonts/Anton-Regular.ttf`) at 110–140 px, line
   height 90%.
4. Export JPG, quality 90, check the file is under 2 MB.

Brand colours to reuse:

| Role | Hex |
|---|---|
| Ink (background) | `#0A0A0E` |
| Paper (light variant) | `#FAF6EC` |
| Accent red | `#FF2D2D` |
| Gold | `#FFC43D` |
| Cyan | `#40E0FF` |
| Money green | `#0C2419` bg / `#3CDC8C` accent |

### Option C — AI image generation

Use it for *art only*, never for text (AI text is where thumbnails die). Prompt pattern:

> flat 2D vector illustration, minimalist white stick figure on near-black background, single
> red accent, empty space on the left third for text, no text, no letters, no watermark,
> 16:9 — [describe the action]

Then drop the generated art into the code/Canva layout and add real type. The visual bible in
`prompts/stickverse-visual-style.md` keeps AI output on-brand.

---

## 6. Packaging formula (thumbnail + title together)

The pair should create a **gap** the viewer needs closed:

| Pattern | Title | Thumbnail text |
|---|---|---|
| Fear + mechanism | *Your brain deletes most of today (here's why)* | **YOUR BRAIN LIES** |
| Loop + escape | *Why every year feels the same* | **SAME LOOP** |
| Underdog + stakes | *The man who refused an empire* | **ONE MAN VS AN EMPIRE** |
| Relatable + shame | *The 3AM habit quietly eating your 20s* | **3AM AGAIN** |
| Money + unfairness | *Why your work is paid less than it's worth* | **THEY PAY YOU LESS** |
| Identity + time | *What 1 year of 1% better actually looks like* | **YOU vs YOU** |

Keep a swipe file. When a thumbnail in your feed stops your thumb, screenshot it and write one
line about **why**. That file becomes your unfair advantage in about six weeks.

---

## 7. Brand kit reference

| Element | Rule |
|---|---|
| Wordmark | `STICKVERSE` in Anton, tracking +5.5%. Never lowercase. |
| Mark | Stick figure inside a ring, red arc sweeping the top-right. Files: `brand/profile-800.png`, `brand/watermark-150.png`. |
| Character signature | **Every stickman wears a small red wristband on the left wrist.** It is visible at thumbnail size, it survives AI regeneration better than a face, and it makes a screenshot instantly attributable to you. `draw_stickman(..., band=RED)` in `tools/sticklib.py`. |
| Tagline | *AI-made stickman stories that stay with you.* (banner, About, video outro) |
| Schedule line | *New Shorts daily · Deep dives every Friday* — change if your real cadence differs, lying here costs trust |
| Voice | Second person, short sentences, one idea per line, no hype words ("insane", "you won't believe") |
| Music | One lo-fi/cinematic bed under narration, −22 to −18 LUFS relative to voice |
| Outro | 20 s end screen, character waving, two video slots + subscribe |

---

**Next:** [`03-production-workflow.md`](03-production-workflow.md) — turning an idea into a
finished video without burning your week.
