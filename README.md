# Stickman Video Director

Turn source copy into a confirmed one-minute English stickman-video plan and six rich Gemini Omni Flash prompts.

## What it produces

- Required aspect-ratio and light/dark theme setup
- A detailed director's proposal for confirmation
- Approximately 130–150 words of English narration
- Six visually dense, transition-linked prompts
- Light and dark monochrome themes with saturated accents
- BGM, sound-effect, continuity, and stitching guidance

The Skill keeps the user experience simple while planning three visual beats and at least four relevant motion devices inside every approximately ten-second clip.

## Install

Clone the repository:

```bash
git clone https://github.com/kaomei/stickman-video-director.git
cd stickman-video-director
```

Copy the installable Skill folder into the Codex skills directory:

```bash
cp -R skills/directing-stickman-videos "${CODEX_HOME:-$HOME/.codex}/skills/"
```

Restart Codex after installation so the Skill appears in the available-skills list.

## Use

Invoke `$directing-stickman-videos` and paste source copy. The Skill first asks for:

1. Aspect ratio: `16:9`, `9:16`, or `1:1`
2. Theme: white background with black figures, or black background with white figures

Example:

```text
Use $directing-stickman-videos to turn this copy into a one-minute English stickman video:

Gravity bends space and time so strongly around a black hole that even light cannot escape.
```

## Workflow

1. Supply copy, notes, an article, or a topic.
2. Choose ratio and theme.
3. Review the Phase A director's proposal.
4. Approve it or request revisions.
5. Receive six standalone Phase B prompts.
6. Generate the six clips and stitch them in order.

Changing ratio, theme, narration, scene structure, or global style returns the workflow to Phase A for another confirmation. A `16:9` revision receives a new horizontal composition rather than a mechanical ratio replacement.

## Why six clips?

At the time this Skill was authored, the [official Gemini Omni Flash model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-omni-flash) listed 3–10 second output videos. The Skill therefore plans a one-minute story as six connected generations. Each prompt repeats the character, palette, voice, audio, transition, and negative constraints so it remains independently usable.

## Audio continuity

Independent video generations may vary slightly in voice and music. Reuse a voice reference when available. For maximum consistency, retain each clip's synchronized sound effects and add one continuous external voiceover and BGM track during assembly.

## Repository structure

```text
skills/directing-stickman-videos/  Installable Skill
tests/                             Behavioral scenarios and reports
docs/superpowers/specs/            Approved design
docs/superpowers/plans/            Implementation plan
```

## License

MIT
