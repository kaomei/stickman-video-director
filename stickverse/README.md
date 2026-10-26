# StickVerse — complete channel kit

Everything you need to launch **StickVerse**, a faceless AI-stickman channel: the artwork,
the setup steps, the production pipeline, the growth playbook and the money maths.

Built for the `stickman-video-director` repo in this folder. The skill in
`skills/directing-stickman-videos/` does the actual video generation; this folder is the
channel layer around it.

> **Start here if you only have 10 minutes:** read
> [`docs/10-upload-checklist.md`](docs/10-upload-checklist.md), upload the 5 brand files to
> your channel, and read the first two pages of [`docs/07-90-day-plan.md`](docs/07-90-day-plan.md).

---

## 1. What's in the box

```
stickverse/
├── brand/                      Channel artwork, ready to upload
│   ├── options/                        THREE banner + profile looks (start at preview-banners.png)
│   ├── final/                          the recommended pair, upload these two files and you're done
│   ├── banner-2560x1440.png            channel banner (safe-area tested)
│   ├── banner-safe-guide.png           same banner with the crop zones drawn on
│   ├── banner-mobile-crop-1546x423.png what phones actually show
│   ├── profile-800.png                 profile picture
│   ├── watermark-150.png               video watermark (transparent)
│   ├── endscreen-1920x1080.png         end-screen background with reserved zones
│   ├── brand-guide.png                 one-page identity sheet (mark, poses, palette, type, rules)
│   ├── about-section.md                channel description, paste-ready (3 versions)
│   └── fonts/                          Anton, Bebas Neue, Archivo Black, Caveat, Noto Sans (OFL)
│
├── thumbnails/                 1280x720 thumbnails + 1080x1920 Shorts covers
│   ├── 01-your-brain-lies-to-you.jpg
│   ├── 02-same-loop-same-year.jpg
│   ├── 03-one-man-vs-an-empire.jpg
│   ├── 04-3am-again.jpg
│   ├── 05-they-pay-you-less.jpg
│   ├── 06-you-vs-you-in-1-year.jpg
│   ├── contact-sheet.png               all six side by side
│   ├── ab-test/                        3 variants of one video for YouTube's Test & Compare
│   ├── mobile-check/                   how they look at feed size (256 px)
│   └── shorts/shorts-cover-01..02.png
│
├── docs/
│   ├── 01-channel-setup.md             account, handle, branding, AdSense, YPP
│   ├── 02-thumbnails-and-brand.md      thumbnail system + CTR rules + specs
│   ├── 03-production-workflow.md       the repeatable AI pipeline (with this repo)
│   ├── 04-growth-and-reach.md          how the algorithm actually decides
│   ├── 05-monetization-and-money.md    realistic numbers + 5 income streams
│   ├── 06-policy-safe-automation.md    the rule that kills AI channels, and how to pass it
│   ├── 07-90-day-plan.md               week-by-week plan to 1,000 subs
│   ├── 08-tools-and-costs.md           stack options, prices, what to skip
│   ├── 09-templates-and-copy.md        titles, descriptions, tags, posts
│   └── 10-upload-checklist.md          one-page pre-publish checklist
│
├── topics/
│   ├── 60-video-ideas.csv              four pillars, hooks, titles, thumbnail text
│   ├── 12-week-calendar.csv            which video goes out on which day
│   └── ep01-script.md                  a full, shootable 8.5-minute script for video #1
│
├── data/
│   └── revenue-model.csv               12-month view/watch-hour/revenue projection
│
├── prompts/
│   └── stickverse-visual-style.md      locked visual bible + copy-paste generation prompts
│
│
└── tools/
    ├── sticklib.py                     drawing kit (stick figures, glows, type)
    ├── make_brand_assets.py            regenerates every brand file
    ├── make_thumbnails.py              regenerates every thumbnail
    └── make_extras.py                  brand guide sheet + A/B thumbnail variants
```

## 2. Regenerate or reword any image

The images are drawn from code, so nothing is locked to one slogan. Change the text in
`tools/make_thumbnails.py` and re-run:

```bash
python -m venv .venv && .venv/bin/pip install pillow
cd stickverse/tools
../.venv/bin/python make_brand_assets.py     # banner, avatar, watermark, end screen
../.venv/bin/python make_thumbnails.py       # 6 thumbnails + 2 Shorts covers
../.venv/bin/python make_extras.py           # brand guide + A/B variants
```

No design software needed. If you prefer a GUI, import the PNGs into Canva/Photopea and
edit on top — the fonts are in `brand/fonts/` (all OFL licensed, safe to use commercially).

## 3. The 60-second summary of the strategy

| Decision | Why |
|---|---|
| **Long-form is the money. Shorts are the reach.** | India Shorts RPM is a fraction of long-form RPM. Shorts bring subscribers; 8–12 minute stories bring watch hours. |
| **Niche: psychology + money + true stories, told in stickman.** | High retention formats, decent RPM, and a visual style nobody else owns consistently. |
| **Ship 1 long-form + 4–5 Shorts every week.** | Enough volume to learn, low enough to keep quality. Mass-upload is a demonetisation trigger. |
| **Every video = original script + recurring characters.** | This is what keeps you inside the "inauthentic content" policy while using AI. |
| **Aim for 1,000 subs + 4,000 watch hours before 1 Feb 2027.** | That is the last date the 4,000-hour bar exists. After it, new channels need **8,000** hours. |

Read [`docs/05-monetization-and-money.md`](docs/05-monetization-and-money.md) for the full
timeline and [`docs/06-policy-safe-automation.md`](docs/06-policy-safe-automation.md) before
you automate anything.

---

*Facts checked October 2026 against YouTube Help, the YouTube Creators blog and current
RPM reporting. YouTube changes rules often — re-check the two links in
[`docs/01-channel-setup.md`](docs/01-channel-setup.md#official-links) before making a
business decision.*
