---
name: directing-stickman-videos
description: Use when turning copy, notes, articles, or topics into one-minute English stick-figure videos, kinetic line-animation explainers, motivational shorts, or Gemini Omni Flash prompt packages.
---

# Directing Stickman Videos

## Core contract

Turn one source into a confirmed director's proposal and then six standalone prompts for approximately ten-second Gemini Omni Flash clips. Preserve the source's meaning while strengthening its hook, progression, and closing callback.

## Setup gate

Require these before planning:

- source material
- aspect ratio: `16:9`, `9:16`, or `1:1`
- theme: light (white background, black figure) or dark (black background, white figure)

If anything is missing, ask for all missing items in one concise message and stop. Never select an aspect ratio or theme silently. Do not re-ask choices already supplied.

Urgency, generation cost, client pressure, and requests to "pick normal settings" do not waive this gate.

## Workflow

1. Read `references/storyboard-template.md` and produce Phase A in the user's language, with English VO and a reference translation.
2. Stop after the director's proposal and request explicit approval.
3. If the user changes ratio, theme, narration, scene structure, or global style, recompose Phase A and request approval again.
4. Only after approval of the current Phase A, read `references/omni-flash-prompt-contract.md` and produce Phase B.
5. Use `references/examples.md` only when a concrete end-to-end example would resolve ambiguity.

Topic approval, schedule pressure, or approval of an older draft is not approval of the current Phase A.

## Output rules

- Target 130–150 English VO words across six clips.
- Give each clip three timed beats, at least four relevant visual devices, and a visual change every two to three seconds.
- Keep character proportions, line weight, theme, and narrator consistent.
- Limit the video to three saturated accent colors. Name them only with ordinary descriptive words such as vivid red, electric blue, or warm gold.
- Never place hexadecimal, RGB, HSL, Pantone, or other technical color notation inside a model prompt. Treat palette choices as visual art direction, never visible content.
- For the light theme, request a flat, uniform, digitally pure-white canvas and forbid gray or off-white tint, texture, gradients, shadows, lighting, bloom, fog, and three-dimensional background depth. Do not express the white as a color code.
- Make each model prompt self-contained and repeat all critical locks.
- Treat narration as audio-only. Quote exact dialogue and forbid alteration, repetition, captions, subtitles, or visual transcription.
- Default generated clips to no visible words, letters, numbers, interface copy, or technical annotations. Make cards and notifications icon-only. Put any optional two-to-five-word overlay in a separate post-production note, never inside the generation prompt.
- Match every clip ending to the next clip opening.
- Do not invent unsupported facts, statistics, quotations, or product claims.

## Revision rules

Recompose rather than rename:

- `16:9`: stage action across left, center, and right; use lateral tracking and negative space.
- `9:16`: use depth, stacked motion, vertical reveals, and interface-safe placement.
- `1:1`: use compact central composition and shorter travel paths.

Theme changes invert background and base line art while preserving accent semantics and contrast. A global change invalidates prior approval.

## Final check

Apply the checklist in the loaded reference. Repair any failed condition before responding.
