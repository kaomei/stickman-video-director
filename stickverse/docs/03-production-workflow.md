# 03 · The production workflow

Goal: **one 8-minute video + five Shorts per week**, produced in about 12 focused hours, with
the same quality every time.

The good news: the repo you are sitting in already contains a working stickman video skill.
You do not need to build a pipeline. You need to choose one of its two modes and run it on a
schedule.

---

## 0 · The two modes in this repo

| | **A · Director** | **B · Autopilot** |
|---|---|---|
| What you get | Storyboard, timed narration, and copy-paste video-generation prompts | A finished narrated, captioned MP4 rendered locally |
| Where the video is made | External generator (Google Flow/Veo, Kling, Hailuo, Runway…), then edited in CapCut/Resolve | Your machine, from a JSON manifest + your images/audio |
| Best for | Cinematic 8–12 min stories with movement, camera, drama | Explainer / whiteboard-style videos at volume, guaranteed captions, zero per-clip cost |
| Effort per video | Long (generate + fix + edit each 10 s clip) | Front-loaded (write manifest, author art, then render) |
| Cost | Generator credits | Nearly zero after setup |
| Requires | A generation tool + an editor | Node 20+, FFmpeg, the skill's npm deps, optional Gemini API key for image/voice |

**Recommended for StickVerse:** Mode B for the weekly explainer (psychology/money), Mode A
for the "true story" long-form that needs cinematic shots. Shorts come from either — a Short
is just the strongest 30 seconds of a script, re-cut to 9:16.

Read the skill itself before running it:
`skills/directing-stickman-videos/SKILL.md`, plus
`references/autopilot.md`, `references/autopilot-runtime.md`,
`references/b1-minimal-handdrawn.md`, `references/autopilot-production-qa.md`.

---

## 1 · The weekly loop

| Day | Work | Time |
|---|---|---|
| Mon | Pick topic, write the script (see §2), lock the title | 90 min |
| Mon | Generate voiceover, listen once, fix pronunciation | 30 min |
| Tue | Build/collect art for the shots | 3 h |
| Wed | Compose + render, fix timing, QC watch-through | 3 h |
| Thu | Thumbnail from this kit + title + description + tags | 45 min |
| Fri | **Publish the long-form** (18:00 IST) | 15 min |
| Sat–Wed | Cut 4–5 Shorts from the long-form + 1 standalone | 2 h total |
| Sun | Review the week's analytics, write next week's topics | 45 min |

If that is too much, halve it: **one long-form every two weeks, 3 Shorts a week.** Consistency
beats volume, and a channel that uploads 4 good videos a month for a year beats one that
uploads 30 in January and stops in March.

---

## 2 · Scripting: the only part that cannot be automated away

This is also the part that keeps you monetisable (see `06-policy-safe-automation.md`).

**Structure for an 8-minute video** (adapts the skill's five-stage arc):

| Time | Beat | Job |
|---|---|---|
| 0:00–0:20 | **Hook** | A concrete, counter-intuitive claim. No "hey guys". |
| 0:20–1:00 | **Stakes** | Why this matters to *the viewer's* next 12 months. |
| 1:00–3:00 | **The obvious answer** | State what everyone believes. Make it feel right. |
| 3:00–5:00 | **The turn** | Break it with evidence, a story, or a mechanism. |
| 5:00–7:00 | **The mechanism** | Show how it actually works, step by step. |
| 7:00–8:00 | **Payoff + loop back** | Answer the hook, then hand them a question to argue about. |

Rules that measurably improve retention:

- **20 words per 10 seconds** of narration (≈150 wpm). The skill enforces this scale.
- **One idea per sentence.** If a sentence has a comma and a "but", split it.
- **A visual change every 2–3 seconds** — a new prop, a new pose, a zoom, a card.
- **Write the visual in the script.** `[figure walks into a wall, looks at camera]` — your
  future self is the editor and will not remember the idea.
- **Read it out loud.** Anything you stumble on, rewrite. TTS stumbles too.
- **Never invent statistics.** "Studies show" without a source is a strike risk and a
  comment-section execution. Use one real source per claim, put it on screen, link it in the
  description.

Prompt you can reuse with any AI assistant:

```text
You are writing for StickVerse, a faceless stickman explainer channel.
Audience: 18-30, global, mobile-first, short attention, likes being told the truth.
Topic: [TOPIC]
Write an 8-minute script (approx 1,200 words) in this shape:
hook (20s) -> stakes (40s) -> the obvious answer (2min) -> the turn (2min) ->
the mechanism (2min) -> payoff + a question for the comments (1min).
Rules: second person, max 18 words per sentence, one idea per line,
a concrete visual in [brackets] every 2-3 lines, no invented statistics,
no "in today's video", no "hey guys", no listicle countdowns.
Narrator voice: calm, slightly amused, never hyped.
```

Then **edit it yourself for 10 minutes**. Add one opinion only you would have. That single
paragraph is what separates you from the mass-upload channels that keep getting removed.

---

## 3 · Mode B, step by step (the weekly explainer)

### First-time setup (once)

```bash
cd skills/directing-stickman-videos
npm ci
node scripts/autopilot.mjs doctor        # checks node, ffmpeg, ffprobe, canvas, fonts
```

`doctor` prints a JSON report. Everything must be `true`. Install Node 20+, FFmpeg/FFprobe
through your normal package manager if not.

Environment variables (never paste keys into chat or commit them):

```bash
export GEMINI_API_KEY="..."     # only if you use the Gemini adapters
export FFMPEG=/path/to/ffmpeg   # optional
export FFPROBE=/path/to/ffprobe # optional
export AUTOPILOT_FONT=/path/to/font.ttf
```

### Per video

```bash
# 1. scaffold a project OUTSIDE the skill folder
node scripts/autopilot.mjs init /home/you/StickVerse/projects/ep07-why-3am

# 2. put narration.txt (exact spoken words) in the project, then synthesise voice
node scripts/gemini-media.mjs speech --text narration.txt --output narration.wav \
  --model YOUR_TTS_MODEL --voice Bodi --allow-network

# 3. align captions (local Whisper, or your own word timings)
python scripts/align_captions.py narration.wav --output words.json --language en
node scripts/autopilot.mjs captions words.json captions.json --lead 0.15

# 4. author shots in project.json (see references/autopilot-runtime.md)

# 5. check the first 20 seconds
node scripts/autopilot.mjs validate /abs/project/project.json --seconds 20
node scripts/autopilot.mjs preview  /abs/project/project.json

# 6. after YOU have watched and approved the sample
node scripts/autopilot.mjs approve /abs/project/project.json --note "approved sample"
node scripts/autopilot.mjs render  /abs/project/project.json
```

The renderer writes the MP4, SRT/VTT captions, a contact sheet and a verification report, and
caches each shot so an interrupted render resumes instead of restarting.

**Do not skip the sample gate.** The skill is deliberately built so a human approves 20 seconds
before a full render. That gate is also your quality control — most "AI channel" failures are
someone rendering 40 minutes without watching 20 seconds.

### What the manifest looks like

A shot is a start/end plus layers. Layers can be `text`, `image`, `pose`, `line`, `arrow`,
`underline`, with keyframes for local motion:

```json
{
  "start": 0, "end": 3,
  "layers": [
    {"type": "text", "text": "3AM. AGAIN.", "x": 90, "y": 150, "size": 64, "bold": true},
    {"type": "pose", "pose": 1, "x": 710, "y": 20, "w": 450},
    {"type": "image", "path": "@b1/idea-bulb-crayon.png", "x": 150, "y": 270, "w": 160,
     "keys": [{"t": 0, "x": 130, "alpha": 0}, {"t": 0.3, "x": 150, "alpha": 1}]}
  ]
}
```

Rules that save hours: design on a 1280-unit-wide canvas, keep the bottom 110 units clear for
captions, and never stretch characters — recompose portrait scenes instead of resizing a
landscape one.

---

## 4 · Mode A, step by step (the cinematic true story)

1. Give the skill: source material, aspect ratio (`16:9` long-form / `9:16` Shorts), duration
   in multiples of 10 s, and a style code (A1 light/dark, A2 modern, A3 prehistoric,
   A4 cozy, A5 historical).
2. Get the **director's proposal**: narration, timed beats, shot list, voice profile. Approve
   or change it — changes invalidate the proposal.
3. Get the **prompt package**: one self-contained prompt per ~10 s clip.
4. Generate the clips in your video tool. **Attach the same character reference image to every
   clip** — consistency across clips is the #1 visual failure of AI stickman videos.
5. Assemble in CapCut / DaVinci Resolve / Premiere: cut on the narration beats, add the
   licensed music bed at −22 LUFS under the voice, add 3–5 second sound effects.

Practical notes:

- Generate 2 versions of any clip with a face or hands. Pick the clean one. Delete the rest.
- Keep a `character/` folder with 3 approved reference images (front, side, action) and reuse
  them forever. Your stickman is your IP.
- Reject any clip where the figure gains a third limb, a broken neck, or drifts off-model.
- Never let the generator write on-screen text. Add all text in the editor — that is where
  captions become legible and brand-consistent.

---

## 5 · Shorts: the cheapest reach you will ever get

Cutting Shorts is not a separate production. From each long-form:

1. Find the 3–5 strongest 25–40 second passages (the "turn" and the payoff usually).
2. Re-frame to 9:16 — pick the crop that keeps the character's head in the upper third.
3. **Re-record the hook for the Short.** The first 1.5 seconds decide everything; write a new
   opening line, do not reuse the mid-video sentence.
4. Burn in captions, big, centred, 2–4 words per line.
5. End on a question or an unresolved image. Loop it if you can — a Short that loops gets a
   second watch counted.
6. Title = the hook, not a label. `Why 3AM feels like your only free time` beats `Night habits`.
7. Post 1 per day at a consistent hour (19:00–21:00 IST is a reasonable starting guess; your
   own audience data overrides it).

Add one **standalone** Short per week that has nothing to do with the long-form. That is your
discovery bet — it can travel far outside your subscriber base.

---

## 6 · Quality control before export

- [ ] Watch the whole video at 1×, on a phone, with the sound on
- [ ] First 5 seconds: is there a reason to keep watching *before* any intro?
- [ ] Every claim has a visual or a source
- [ ] No text is inside the bottom 12% (progress bar / UI)
- [ ] Captions are accurate, especially names and numbers
- [ ] Audio: voice −16 LUFS, music at least 15 dB under the voice, no clipping
- [ ] No stretched characters, no third limbs, no melting faces
- [ ] End screen 20 s with two video slots + subscribe
- [ ] Pinned comment ready with a question

---

## 7 · Files and naming

One folder per video, one naming convention, forever:

```
StickVerse/projects/ep07-why-3am/
├── 01-script.md
├── 02-narration.txt
├── 03-narration.wav
├── 04-captions.srt
├── project.json
├── art/            (character refs, props, backgrounds)
├── output/         (mp4, srt, contact sheet, report)
└── published/      (final thumbnail + upload metadata)
```

Name the final file `stickverse-ep07-why-3am-1080p.mp4`. When you are 60 videos in, you will
not remember "final_final_v3".

---

**Next:** [`04-growth-and-reach.md`](04-growth-and-reach.md) — what actually gets you seen.
