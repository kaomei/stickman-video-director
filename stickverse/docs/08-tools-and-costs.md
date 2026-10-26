# 08 · Tools, stack and costs

Principle: **the free stack can produce a monetisable channel.** Paid tools buy speed, not
quality. Add one only when you can name the bottleneck it fixes.

---

## 1 · The minimum viable stack (₹0)

| Job | Tool | Notes |
|---|---|---|
| Scripting | Any AI assistant + your own edit | The edit is non-negotiable |
| Voiceover | The skill's Gemini TTS adapter, or any free TTS tier | Keep one voice forever |
| Images | Generated prompts / free tiers / this repo's assets | Consistency beats realism |
| Assembly | **DaVinci Resolve** (free) or **CapCut** (free tier) | Resolve has no watermark |
| Captions | Local Whisper via `scripts/align_captions.py` | Free, private, accurate |
| Thumbnails | The kit in `thumbnails/` + the Python generator | No subscription needed |
| Music/SFX | **YouTube Audio Library** | Cleared for monetised use; keep a note |
| Scheduling | YouTube Studio scheduled publishing | Free |
| Analytics | YouTube Studio + the routine in doc 04 | Free |
| Storage | Local drive + one cloud backup | Scripts and project files are your proof |

**This stack is enough to reach YPP.** Do not let anyone tell you otherwise.

---

## 2 · The paid upgrades, in the order they are worth buying

| Priority | Tool type | Why it's worth it | Typical cost |
|---|---|---|---|
| 1 | **Video generation credits** (Google Flow/Veo, Kling, Hailuo, Runway) | This is where the visual quality gap is | $10–$30/mo |
| 2 | **TTS with a good voice** (ElevenLabs, etc.) | Voice is the single biggest "AI channel" tell | $5–$22/mo |
| 3 | **Editing upgrade** (CapCut Pro / Resolve Studio) | Removes watermarks, adds templates | $10–$30 one-off/mo |
| 4 | **Music licence** (Epidemic Sound, Artlist) | Content ID safety at scale | $10–$20/mo |
| 5 | **Research** (vidIQ / TubeBuddy) | Outlier topics, competitor data | $0–$20/mo |
| 6 | **Stock/AI image packs** | Fills gaps in a pinch | $10/mo |

Total if you take everything: **≈ ₹8,000–₹15,000/month**. If you are not yet earning ₹8,000
from the channel (or from freelance work), do not take it.

---

## 3 · What NOT to buy

- **"Done-for-you AI channel" packages.** They are template farms with your name on them. This
  is precisely what the January 2026 wave removed.
- **View/subscription services.** Account risk with zero upside.
- **Expensive thumbnail designers** before you know your CTR (you do not have the data yet).
- **Stock footage subscriptions** — your art is drawn, you do not need 4K clips.
- **Multiple AI video subscriptions at once.** Pick one, learn it, then judge.
- **A microphone.** You are faceless. Your voice is synthetic or recorded on a phone.

---

## 4 · The complete pipeline, with the tool at each step

```text
IDEA      → YouTube Studio inspiration tab, Reddit, search suggestions
SCRIPT    → AI draft + your rewrite (30 min minimum of human work)
VOICE     → Gemini TTS (skill adapter) or ElevenLabs
ART       → prompts from prompts/stickverse-visual-style.md, or the repo's B1 assets
MOTION    → Mode B: local renderer keyframes | Mode A: generated clips
CAPTIONS  → Whisper alignment → skill's captions command
MUSIC/SFX → YouTube Audio Library, ducked 15 dB under the voice
EDIT      → Resolve/CapCut: cut on narration beats, add end screen
QC        → the checklist in doc 03 §6
THUMBNAIL → this repo's kit, regenerated with new text
UPLOAD    → Studio: title, description, tags, chapters, playlist, end screen
SHORTS    → re-cut 9:16, new hook, burned-in captions
ANALYTICS → 48h check, Sunday review, monthly audit
```

Everything after SCRIPT can be automated. Everything up to and including SCRIPT must not be.

---

## 5 · Hardware

You need less than you think:

| Setup | Spec | Note |
|---|---|---|
| Minimum | Any laptop from the last 5 years, 8 GB RAM | 1080p renders fine, just slower |
| Comfortable | 16 GB RAM, any modern CPU, no GPU needed | GPU only matters for local AI models |
| Storage | 256 GB free + external drive | Video projects eat space fast |

If you use cloud generation (Flow, Kling, ElevenLabs), the local machine only assembles — a
₹35,000 laptop is enough.

---

## 6 · Time budget (be honest with yourself)

| Task | Per long-form | Per Short |
|---|---|---|
| Idea + script | 90 min | 15 min |
| Voice + captions | 30 min | 10 min |
| Art | 90–180 min | 20 min |
| Assembly + QC | 120 min | 20 min |
| Thumbnail + metadata | 45 min | 5 min |
| **Total** | **6–9 h** | **~1 h** |

At 2 long-form + 12 Shorts a week that is ~24 hours. If you have a full-time job, run
**1 long-form + 5 Shorts (≈14 h/week)** and accept slower growth. Burning out in week 6 is the
most common failure mode in this niche — more common than any policy issue.

---

## 7 · Free assets already in this repo

| Asset | Location | Use |
|---|---|---|
| Stickman drawing kit | `tools/sticklib.py` | Generate figures, glows, type in any image |
| Six thumbnails | `thumbnails/` | Ready to upload, or edit the script |
| Shorts covers | `thumbnails/shorts/` | 1080×1920 covers |
| Banner/avatar/watermark/end screen | `brand/` | Upload as-is |
| Fonts (OFL) | `brand/fonts/` | Commercial use allowed; keep the licence files |
| Visual style bible | `prompts/stickverse-visual-style.md` | Keeps AI art on-brand |
| Script/storyboard system | `skills/directing-stickman-videos/` | The full production skill |
| B1 example project | `skills/.../examples/b1/` | A runnable reference film |

---

**Next:** [`09-templates-and-copy.md`](09-templates-and-copy.md) — paste-ready text.
