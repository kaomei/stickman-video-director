<!-- readme:hero -->

<div align="center">

[**English**](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Português do Brasil](README.pt-BR.md)

# Stickman Video Director

### Turn any idea into a one-minute stickman video built to move.

One Codex Skill turns your copy into a confirmed English voiceover, a visual-first director's plan, and six production-ready Gemini Omni Flash prompts.

![Codex Skill](https://img.shields.io/badge/Codex-Skill-111827?style=flat-square)
![Gemini Omni Flash](https://img.shields.io/badge/Gemini-Omni%20Flash-6d28d9?style=flat-square)
![One-minute video](https://img.shields.io/badge/Video-≈60%20seconds-0066ff?style=flat-square)
![MIT License](https://img.shields.io/badge/License-MIT-16a34a?style=flat-square)

Built for visual explainers, motivational stories, educational shorts, and fast-moving essays on **YouTube Shorts, TikTok, Instagram Reels, and YouTube**.

</div>

<!-- readme:demos -->

## Two high-contrast styles. One visual language.

| Light theme | Dark theme |
|:---:|:---:|
| <!-- demo:light:start --><img src="assets/readme/light-theme-preview-placeholder.svg" alt="Light theme preview: white background with a black stick figure and saturated accents" width="600"><!-- demo:light:end --> | <!-- demo:dark:start --><img src="assets/readme/dark-theme-preview-placeholder.svg" alt="Dark theme preview: black background with a white stick figure and saturated accents" width="600"><!-- demo:dark:end --> |
| White canvas · black figure | Black canvas · white figure |

> The real light- and dark-theme clips are coming next. Star the repository if you want to follow the release—and help more creators discover the project.

## A script is not yet a video

A good idea can still become a flat animation: one character, one background, and ten seconds with nothing new to look at. Directing a full minute means shaping the hook, pacing the explanation, inventing relevant visual metaphors, moving the camera, connecting scenes, and protecting continuity across separate generations.

**Stickman Video Director does that production thinking before you spend generation credits.**

<!-- readme:advantages -->

## Why creators use this Skill

| Advantage | What it gives you |
|---|---|
| **Stronger story architecture** | Reworks raw material into a sharp opening, progressive explanation, and closing callback while preserving the central meaning. |
| **A real approval checkpoint** | Shows a readable six-scene director's proposal before producing final model prompts. Revise the story while changes are still cheap. |
| **Dense, relevant motion** | Plans three timed beats per clip, with visual metaphors, environment changes, camera movement, text moments, interactions, transitions, BGM, and SFX. |
| **Production locks** | Repeats character, line weight, palette, voice, dialogue, audio, transition, and negative constraints inside every standalone prompt. |
| **Format-aware direction** | Recomposes staging, camera paths, and text placement for `9:16`, `16:9`, or `1:1` instead of merely changing a ratio label. |
| **Controlled visual contrast** | Supports white-background/black-figure and black-background/white-figure systems, plus up to three saturated accent colors. |
| **Source fidelity** | Avoids inventing unsupported facts, statistics, quotations, or product claims. |

No API or MCP dependency is required. Install the Skill, invoke it, and work through the guided flow in conversation.

<!-- readme:platforms -->

## One idea, composed for the right screen

| Ratio | Best fit | Directional emphasis |
|---|---|---|
| `9:16` | YouTube Shorts, TikTok, Instagram Reels | Vertical depth, bold central silhouettes, stacked reveals, mobile-safe text |
| `16:9` | YouTube explainers, educational videos, visual essays | Wide staging, lateral camera travel, split-screen comparisons, generous negative space |
| `1:1` | Social feeds, compact product stories | Strong center composition, radial motion, readable edge margins |

<!-- readme:workflow -->

## Paste → Choose → Approve → Generate → Stitch

1. **Paste** copy, notes, an article, or simply a topic.
2. **Choose** `16:9`, `9:16`, or `1:1`, then select the light or dark theme.
3. **Approve** a detailed director's proposal with the English VO, reference translation, visuals, camera, transitions, BGM, and SFX.
4. **Generate** exactly six self-contained Gemini Omni Flash prompts after the current proposal is approved.
5. **Stitch** the six approximately ten-second clips into one coherent, one-minute video.

Change the ratio, theme, narration, scene structure, palette, voice, or tone at any point. The Skill returns to the proposal stage and asks for approval again.

<!-- readme:output -->

## What you receive

- A creator-ready English title, core message, hook, tone, palette, voice, and music direction
- Approximately **130–150 English words** of narration for about one minute
- Six visually distinct storyboard scenes with a change every two to three seconds
- Exact English dialogue plus a reference translation
- Six standalone Gemini Omni Flash prompts with timed beats and negative constraints
- Matched endings and openings for cleaner transitions between clips
- BGM, sound-effect, continuity, and final stitching guidance

<details>
<summary><strong>Example request</strong></summary>

```text
Use $directing-stickman-videos to turn this copy into a one-minute English stickman video:

Gravity bends space and time so strongly around a black hole that even light cannot escape.
```

The Skill first asks for the missing aspect ratio and theme. It then presents the six-scene director's proposal for confirmation before generating any final model prompt.

</details>

<!-- readme:install -->

## Install

Clone the repository:

```bash
git clone https://github.com/kaomei/stickman-video-director.git
cd stickman-video-director
```

Copy the installable Skill folder into your Codex skills directory:

```bash
cp -R skills/directing-stickman-videos "${CODEX_HOME:-$HOME/.codex}/skills/"
```

Restart Codex so the Skill appears in the available-skills list. Then invoke it and paste your source:

```text
$directing-stickman-videos
```

<!-- readme:reliability -->

## Built for iteration, honest about generation

- **Approval stays explicit.** Phase B cannot begin until you approve the current proposal.
- **Global changes trigger recomposition.** A new ratio or theme rebuilds the direction instead of applying a mechanical text replacement.
- **Prompts stay independent.** Each prompt repeats the critical locks needed to generate its clip on its own.
- **Meaning stays grounded.** The Skill may strengthen structure and delivery, but it does not add unsupported claims.
- **Audio can still vary.** Independent video generations may produce slight voice or music differences. For maximum consistency, keep synchronized SFX from each clip and add one continuous external VO and BGM track during assembly.

## Repository map

```text
skills/directing-stickman-videos/  Installable Skill
assets/readme/                     README preview media
tests/                             Behavioral scenarios and verification
docs/superpowers/specs/            Approved product designs
docs/superpowers/plans/            Implementation plans
```

<!-- readme:contribute -->

## Make it better

Ideas, examples, prompt improvements, and real-world generation notes are welcome. Open an issue or submit a pull request with a focused change and enough context to reproduce the result.

If this Skill helps you turn one unfinished idea into a video you can actually publish, **give the repository a star**. It helps the project reach the next creator looking for the same workflow.

## License

MIT
