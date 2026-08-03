# Stickman Video Director Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, test, validate, document, and package an open-source Codex Skill that turns source copy into a confirmed director's proposal and six Gemini Omni Flash stick-figure video prompts.

**Architecture:** Keep the runtime Skill concise and route detailed output contracts into three reference files. Enforce a two-gate conversation: collect aspect ratio and light/dark theme before planning, then require explicit approval of Phase A before producing Phase B. Keep reproducible test scenarios and reports outside the installed Skill folder so the published Skill remains lean.

**Tech Stack:** Markdown Agent Skill, YAML `agents/openai.yaml`, official `skill-creator` initialization and validation scripts, Git, fresh-context subagent evaluations, MIT License.

## Global Constraints

- Required setup choices are aspect ratio (`16:9`, `9:16`, or `1:1`) and theme (white background/black figure or black background/white figure).
- Never silently default either required setup choice; ask only for missing choices.
- Phase A contains a 130–150-word English voiceover and six approximately ten-second storyboard rows.
- Phase B is forbidden until the user explicitly approves the current Phase A proposal.
- Any change to aspect ratio, theme, narration, scene structure, or global style invalidates the previous approval.
- Each clip contains three timed beats, at least four visual devices, and a perceptible change every two to three seconds.
- Use no more than three saturated accent colors across one video.
- Each of the six Omni Flash prompts must be standalone and repeat the selected format, theme, character, palette, narrator, audio, transition, and negative constraints.
- Preserve source meaning and do not invent unsupported facts, statistics, quotations, or product claims.
- Skill name is `directing-stickman-videos`.
- Skill frontmatter contains only `name` and `description`.
- Keep `SKILL.md` below 500 lines and target fewer than 500 words.
- Use MIT License and do not require an API or MCP dependency.

## File Map

```text
README.md                                      GitHub-facing usage and installation
LICENSE                                        MIT license
skills/directing-stickman-videos/SKILL.md      Trigger and core two-gate workflow
skills/directing-stickman-videos/agents/openai.yaml
                                                UI metadata and default invocation
skills/directing-stickman-videos/references/storyboard-template.md
                                                Phase A output contract and ratio rules
skills/directing-stickman-videos/references/omni-flash-prompt-contract.md
                                                Phase B standalone prompt contract
skills/directing-stickman-videos/references/examples.md
                                                Complete tested Chinese-to-English example
tests/evaluation-rubric.md                      Behavioral assertions and scoring
tests/scenarios/setup-gate.md                   Missing-choice pressure scenario
tests/scenarios/approval-gate.md                Premature Phase B pressure scenario
tests/scenarios/recomposition.md                Aspect-ratio revision scenario
tests/scenarios/application-cases.md             Technique and variation cases
tests/reports/baseline.md                       No-Skill control results
tests/reports/forward.md                        With-Skill results and revisions
```

---

### Task 1: Establish RED Baselines and Evaluation Fixtures

**Files:**
- Create: `tests/evaluation-rubric.md`
- Create: `tests/scenarios/setup-gate.md`
- Create: `tests/scenarios/approval-gate.md`
- Create: `tests/scenarios/recomposition.md`
- Create: `tests/scenarios/application-cases.md`
- Create: `tests/reports/baseline.md`

**Interfaces:**
- Consumes: Approved design at `docs/superpowers/specs/2026-08-03-stickman-video-director-design.md`
- Produces: Repeatable scenarios, assertion IDs `SETUP-1` through `PACK-6`, and verbatim baseline evidence used to shape `SKILL.md`

- [ ] **Step 1: Write the behavioral rubric before the Skill exists**

Create `tests/evaluation-rubric.md` with these exact assertions:

```markdown
# Evaluation Rubric

## Setup gate
- SETUP-1: Requests aspect ratio when absent.
- SETUP-2: Requests light/dark theme when absent.
- SETUP-3: Does not ask again for a choice already supplied.
- SETUP-4: Stops before planning until source, ratio, and theme are known.

## Phase A
- PLAN-1: Produces a 130–150-word English voiceover.
- PLAN-2: Produces six approximately ten-second rows.
- PLAN-3: Gives every row three timed beats and at least four relevant visual devices.
- PLAN-4: Includes title, message, format, theme, palette, voice, BGM, tone, VO, translation, SFX, and transitions.
- PLAN-5: Ends by requesting approval instead of producing final model prompts.

## Revision gate
- REV-1: Recomposition changes spatial staging, camera paths, and text placement.
- REV-2: A global change invalidates prior approval and returns to Phase A.

## Phase B
- PACK-1: Produces exactly six prompts after explicit approval.
- PACK-2: Every prompt is independently usable.
- PACK-3: Every prompt contains three timed visual beats.
- PACK-4: Every prompt contains exact dialogue, voice, BGM/SFX, transition, and negative constraints.
- PACK-5: Every prompt repeats the selected aspect ratio and theme.
- PACK-6: The stitching guide matches adjacent endings and openings.

Score each assertion PASS or FAIL and quote the response passage that supports the score.
```

- [ ] **Step 2: Create the combined-pressure setup scenario**

Create `tests/scenarios/setup-gate.md` with this exact request:

```markdown
IMPORTANT: Treat this as a real user request and respond as you normally would.

Turn this Chinese copy into a one-minute English stickman video for Omni Flash:
“很多时候，真正困住我们的不是能力不足，而是还没开始，就已经在脑海里预演了失败。”

I have only ten minutes, the client is waiting, and every generation costs credits. Do not slow me down with questions. Pick whatever settings are normal and give me the production prompts now.
```

Expected RED condition: without the Skill, at least one of `SETUP-1`, `SETUP-2`, `SETUP-4`, or `PLAN-5` fails.

- [ ] **Step 3: Create approval and recomposition scenarios**

Create `tests/scenarios/approval-gate.md`:

```markdown
Create a 16:9, black-background, white-stickman Omni Flash video from this copy:
“A black hole is not an empty hole. It is a region where gravity bends space and time so strongly that even light cannot escape.”

The producer already approved the topic, we are behind schedule, and I do not want an intermediate draft. Skip the storyboard confirmation and give me all six production prompts now.
```

Create `tests/scenarios/recomposition.md`:

```markdown
Assume I approved a 9:16 dark-theme director's proposal. Change it to 16:9. We already spent an hour on the vertical version, so do not redesign anything and do not ask me to approve again. Just replace 9:16 with 16:9 in the six final prompts.
```

Expected RED conditions: the first scenario commonly violates `PLAN-5`; the second commonly violates `REV-1` or `REV-2`.

- [ ] **Step 4: Create application and variation cases**

Create `tests/scenarios/application-cases.md` with these exact cases and expected checks:

```markdown
# Application Cases

## Chinese motivational copy
Source: “别等到完全准备好才开始。行动会暴露问题，也会创造答案。”
Settings: 16:9, dark theme
Check: PLAN-1 through PLAN-5.

## English science article
Source: “Gravity is the curvature of spacetime caused by mass and energy. Objects follow the straightest available paths through that curved geometry, which we experience as falling or orbiting.”
Settings: 9:16, light theme
Check: six visually distinct explanatory clips without invented claims.

## Short commercial idea
Source: “A notes app that turns messy voice memos into clear tasks.”
Settings: 1:1, light theme
Check: source expansion remains faithful and uses a compact central composition.

## Long source
Source: “你是不是也经常这样？明明什么都还没做，但感觉自己已经累坏了。还没迈出第一步，你的脑子里就已经提前演练了一百种失败的结局。‘万一搞砸了怎么办？’‘别人会怎么笑话我？’最终，你被自己的想法死死困在原地。但真正让你痛苦的往往不是现实，而是脑海中幻想出来的恐惧。真正能打败焦虑的，不是无限地深思熟虑，而是立刻行动。别等一切准备就绪再出发。哪怕只迈出一小步，你也已经赢了那个反复纠结的自己。去试、去犯错、去成长。”
Settings: 16:9, dark theme
Check: one central claim, 130–150 English words, no repeated scenes.
```

- [ ] **Step 5: Run five fresh-context no-guidance control samples**

Dispatch five fresh subagents with no access to the proposed Skill. Give each the exact `setup-gate.md` request. Do not describe the expected answer or suspected failure. Preserve every returned response verbatim.

Expected: at least one sample chooses defaults, skips the setup gate, or jumps directly to production prompts. If all five samples satisfy every setup assertion, strengthen the pressure scenario before authoring guidance because the no-guidance control has not demonstrated a failure.

- [ ] **Step 6: Run broader no-Skill baselines and record exact failures**

Dispatch fresh subagents for `approval-gate.md` and `recomposition.md`. Score every response against `tests/evaluation-rubric.md`. Create `tests/reports/baseline.md` with:

```markdown
# Baseline Report

## Test configuration
- Skill under test: none
- Control repetitions: five setup-gate samples
- Additional scenarios: approval gate and recomposition

## Per-run evidence
For each run, record the scenario name, complete response, assertion scores, and exact rationalization or shortcut.

## Failure patterns
Group repeated failures by setup gating, confirmation gating, mechanical ratio replacement, narration length, scene density, and prompt independence.

## Guidance requirements
List only requirements supported by observed failures, followed by the approved product contracts that remain necessary even when the control already complies.
```

- [ ] **Step 7: Verify RED and commit the test fixtures**

Run:

```bash
rg -n "FAIL|setup|approval|ratio|theme" tests/reports/baseline.md
git diff --check
```

Expected: the report contains at least one observed failure, no invented quotations, and no whitespace errors.

Commit:

```bash
git add tests
git commit -m "test: capture stickman skill baselines"
```

---

### Task 2: Initialize the Skill and Implement the Core Gates

**Files:**
- Create: `skills/directing-stickman-videos/SKILL.md`
- Create: `skills/directing-stickman-videos/agents/openai.yaml`
- Create directory: `skills/directing-stickman-videos/references/`
- Modify: `tests/reports/forward.md`

**Interfaces:**
- Consumes: Failure patterns in `tests/reports/baseline.md`
- Produces: Discoverable Skill metadata and the setup/approval state machine used by every reference template

- [ ] **Step 1: Initialize the official Skill skeleton**

Run:

```bash
python3 "$CODEX_HOME/skills/.system/skill-creator/scripts/init_skill.py" directing-stickman-videos \
  --path skills \
  --resources references \
  --interface 'display_name=Stickman Video Director' \
  --interface 'short_description=Turn copy into rich Omni Flash stickman videos' \
  --interface 'default_prompt=Use $directing-stickman-videos to turn this copy into a one-minute English stickman video prompt package.'
```

Expected: `SKILL.md`, `agents/openai.yaml`, and `references/` exist under the exact Skill folder.

- [ ] **Step 2: Replace the generated Skill body with the minimal tested workflow**

Write `skills/directing-stickman-videos/SKILL.md` with the content below. If `tests/reports/baseline.md` records a new rationalization not covered by this text, add one sentence immediately after the violated rule that names and rejects that exact shortcut; otherwise use the text verbatim.

```markdown
---
name: directing-stickman-videos
description: Use when turning copy, notes, articles, or topics into one-minute English stick-figure videos, kinetic line-animation explainers, motivational shorts, or Gemini Omni Flash prompt packages.
---

# Directing Stickman Videos

## Core contract

Turn one source into a confirmed director's proposal and then six standalone prompts for approximately ten-second Gemini Omni Flash clips. Preserve the source's core meaning while strengthening its hook, progression, and closing callback.

## Setup gate

Require these before planning:

- source material
- aspect ratio: `16:9`, `9:16`, or `1:1`
- theme: light (white background, black figure) or dark (black background, white figure)

If anything is missing, ask for all missing items in one concise message and stop. Never select an aspect ratio or theme silently. Do not re-ask choices already supplied.

## Workflow

1. Read `references/storyboard-template.md` and produce Phase A in the user's language, with English VO and a reference translation.
2. Stop after the director's proposal and request explicit approval.
3. If the user changes ratio, theme, narration, scene structure, or global style, recompose Phase A and request approval again.
4. Only after approval of the current Phase A, read `references/omni-flash-prompt-contract.md` and produce Phase B.
5. Use `references/examples.md` only when a concrete end-to-end example would resolve ambiguity.

## Non-negotiable output rules

- Target 130–150 English VO words across six clips.
- Give each clip three timed beats, at least four relevant visual devices, and a visual change every two to three seconds.
- Keep character proportions, line weight, theme, and narrator consistent.
- Limit the video to three saturated accent colors.
- Make each model prompt self-contained and repeat all critical locks.
- Quote exact spoken dialogue and forbid alteration, repetition, captions, and unintended text.
- Match every clip ending to the next clip opening.
- Do not invent unsupported facts, statistics, quotations, or product claims.

## Revision rules

Recompose rather than rename:

- `16:9`: stage action across left, center, and right; use lateral tracking and negative space.
- `9:16`: use depth, stacked motion, vertical reveals, and interface-safe placement.
- `1:1`: use compact central composition and shorter travel paths.

Theme changes invert background and base line art while preserving accent semantics and contrast.

## Final check

Before responding, apply the checklists in the loaded reference. If any required condition fails, repair the output before showing it.
```

- [ ] **Step 3: Verify the generated UI metadata**

Confirm `agents/openai.yaml` contains exactly these interface strings and no invented icons, brand color, or dependencies:

```yaml
interface:
  display_name: "Stickman Video Director"
  short_description: "Turn copy into rich Omni Flash stickman videos"
  default_prompt: "Use $directing-stickman-videos to turn this copy into a one-minute English stickman video prompt package."
```

- [ ] **Step 4: Micro-test the setup guidance against the control**

Run five fresh-context samples using the same `setup-gate.md` request, this time explicitly providing the new Skill path. Score `SETUP-1` through `SETUP-4` and `PLAN-5` without showing agents the rubric.

Expected: all five ask for aspect ratio and theme and stop before planning. Manually read every response; do not count an echoed rule as compliance unless the response actually follows it.

- [ ] **Step 5: Refactor only for observed new loopholes**

If an agent still chooses defaults or skips the gate, add a short explicit counter beside the relevant rule using its exact rationalization. Re-run five fresh samples after any wording change. Record all runs and changes in `tests/reports/forward.md`.

- [ ] **Step 6: Verify GREEN and commit**

Run:

```bash
wc -w skills/directing-stickman-videos/SKILL.md
rg -n "name:|description:|Setup gate|explicit approval|130–150" skills/directing-stickman-videos/SKILL.md
git diff --check
```

Expected: fewer than 500 words, required gates present, clean diff.

Commit:

```bash
git add skills/directing-stickman-videos tests/reports/forward.md
git commit -m "feat: add stickman video direction workflow"
```

---

### Task 3: Implement the Phase A and Phase B Reference Contracts

**Files:**
- Create: `skills/directing-stickman-videos/references/storyboard-template.md`
- Create: `skills/directing-stickman-videos/references/omni-flash-prompt-contract.md`
- Modify: `tests/reports/forward.md`

**Interfaces:**
- Consumes: Setup and approval state machine from `SKILL.md`
- Produces: Exact Phase A table fields, aspect-ratio composition rules, Phase B prompt order, and quality checklists

- [ ] **Step 1: Write the Phase A template as a positive output recipe**

Create `references/storyboard-template.md` with these sections and requirements:

```markdown
# Director's Proposal Contract

## Header, in this order
1. English title and reference-language title
2. Core message and hook
3. Aspect ratio and light/dark theme
4. Narrator, speaking pace, word count, and estimated duration
5. Three accent colors with semantic roles
6. BGM recommendation, emotional turn, tone, and narrative arc

## Storyboard
Produce exactly six rows:

| Time | Narrative purpose | Stick-figure scene | Motion, camera, and transition | English VO | Reference translation | BGM / SFX |
|---|---|---|---|---|---|---|

Each row contains three sequential beats, at least four relevant visual devices, one dominant accent, and an ending state inherited by the next row. Keep total English VO at 130–150 words.

## Narrative patterns
- Motivational: strong hook → recognition → escalation → reframe → action → payoff and CTA
- Educational: surprising hook → setup → mechanism → consequence → practical meaning → takeaway

## Composition
- 16:9: left-center-right staging, lateral tracking, horizontal match cuts, deliberate negative space.
- 9:16: depth, vertical reveals, stacked motion, foreground passes, interface-safe text.
- 1:1: compact center-weighted action and short travel paths.

## Confirmation ending
End by asking the user to approve, revise a named scene, or change a global setting. Do not include final model prompts.

## Phase A checks
- Source, ratio, and theme are known.
- Six rows and 130–150 English words are present.
- Every row has three beats, four visual devices, audio, and a transition.
- No more than three saturated accent colors are used.
- No unsupported factual detail was added.
```

- [ ] **Step 2: Write the standalone Omni prompt contract**

Create `references/omni-flash-prompt-contract.md` with this exact prompt order:

```markdown
# Omni Flash Production Prompt Contract

## Production package order
1. Global continuity block
2. Six standalone English prompts
3. Stitching guide
4. Voice and music continuity note

## Standalone prompt order
1. Output specification: approximately ten seconds, chosen aspect ratio, 720p target, 24 FPS, synchronized audio
2. Background and base line-art polarity
3. Circular head, no face, no clothing, stable proportions, uniform medium line weight
4. Three-color palette and semantic roles
5. First-frame continuity state
6. `[0–3s]`, `[3–7s]`, and `[7–10s]` visual beats
7. Exact English dialogue in quotation marks
8. Identical narrator description and delivery
9. BGM, synchronized SFX, and voice-first mixing
10. Final-frame transition state
11. Negative constraints

Use this style language:

“rapid scene changes, kinetic motion-graphic transformations, and frequent visual events, while preserving an identical stick-figure design, constant line weight, and strict temporal consistency”

The negative block forbids photorealism, unwanted 3D rendering, facial features, clothing drift, extra limbs, malformed anatomy, broken line work, changed line weight, unintended characters, irrelevant spectacle, random text, captions, subtitles, logos, watermarks, and any altered, omitted, repeated, or added dialogue.

## Prompt checks
- Exactly six prompts follow current Phase A approval.
- Each is understandable without reading another prompt.
- Every ending matches the next opening.
- Each prompt repeats ratio, theme, character, palette, voice, audio, and negative locks.
- Only explicitly requested short English text may appear on screen.

## Audio continuity note
Independent text-only generations may vary in voice and music. Recommend a shared voice reference when supported; otherwise repeat the exact voice description. For maximum consistency, use model-generated SFX with one external voiceover and BGM track during assembly.
```

- [ ] **Step 3: Run application tests with the references loaded**

Dispatch fresh subagents for the Chinese motivational and English science cases in `tests/scenarios/application-cases.md`. Provide the Skill path, but do not give expected answers.

Expected Phase A results:

- six rows
- 130–150 English words
- correct light/dark polarity and ratio-specific composition
- three beats and four visual devices per row
- no final Omni prompts before approval

Then send an explicit approval follow-up and verify `PACK-1` through `PACK-6`.

- [ ] **Step 4: Record failures, repair the smallest responsible reference, and re-test**

Append complete responses and rubric scores to `tests/reports/forward.md`. If output shape is wrong, strengthen the positive recipe or required field rather than adding a broad prohibition. Re-run the failed scenario after each edit.

- [ ] **Step 5: Verify and commit**

Run:

```bash
rg -n "exactly six|130–150|0–3s|3–7s|7–10s|16:9|9:16|1:1" skills/directing-stickman-videos/references
git diff --check
```

Expected: both contracts contain all required structural fields and no whitespace errors.

Commit:

```bash
git add skills/directing-stickman-videos/references tests/reports/forward.md
git commit -m "feat: add storyboard and Omni prompt contracts"
```

---

### Task 4: Add the Complete Tested Example

**Files:**
- Create: `skills/directing-stickman-videos/references/examples.md`
- Modify: `tests/reports/forward.md`

**Interfaces:**
- Consumes: The approved 16:9 dark-theme “Stop Letting Overthinking Ruin Your Life” dry run and both reference contracts
- Produces: One end-to-end retrieval example showing setup, Phase A, approval, Phase B, and ratio-aware composition

- [ ] **Step 1: Write the example input and setup exchange**

Start `references/examples.md` with:

```markdown
# Complete Example

Load this reference only when a concrete end-to-end example resolves ambiguity.

## User source
“你是不是也经常这样？明明什么都还没做，但感觉自己已经累坏了。还没迈出第一步，你的脑子里就已经提前演练了一百种失败的结局。别让想太多毁掉你的生活。”

## Required setup
Assistant: “请选择视频尺寸（16:9、9:16 或 1:1），以及主题（白底黑火柴人或黑底白火柴人）。”

User: “16:9，黑底白火柴人。”
```

- [ ] **Step 2: Add the complete Phase A proposal**

Use this exact 144-word English narration:

```text
Do you ever feel exhausted before you have even begun? Nothing has happened yet, but your mind is already carrying a hundred imaginary disasters.

Before the first step, you picture failure, judgment, rejection, and every possible way things could go wrong. Your thoughts turn possibilities into prisons.

Then come the questions: What if I fail? What will people think? The more you search for certainty, the tighter fear wraps around your feet.

But reality is rarely what hurts you most. It is the future your mind keeps inventing. Action does not require confidence; confidence follows action.

So interrupt the loop. Choose one tiny move and do it now. Send the message, open the document, take the first imperfect step.

The moment you move, fear loses power. Stop waiting to feel ready. Try, make mistakes, grow—and prove your thoughts do not control your life.
```

Include all six storyboard rows, Chinese reference translations, three internal visual beats per row, BGM/SFX, the violet/red/gold palette, and the explicit confirmation question.

Do not abbreviate rows or replace content with ellipses. Store one canonical transcript under `## English VO transcript` so the word count is not inflated by translations. Re-count it with:

```bash
python3 -c 'import re, pathlib; t=pathlib.Path("skills/directing-stickman-videos/references/examples.md").read_text(); s=t.split("## English VO transcript",1)[1].split("## Phase B",1)[0]; print(len(re.findall(r"[A-Za-z]+(?:[’\x27-][A-Za-z]+)*", s)))'
```

Expected: `144`.

- [ ] **Step 3: Add approval and all six 16:9 prompts**

After `User: “确认。”`, include a full global continuity block, six standalone prompts, and a stitching guide. Use these exact scene concepts and transitions:

1. A violet thought dot grows into a tangle with a reversing clock and draining battery; violet tangle fills frame → camera travels through tangle.
2. Failure, judgment, and rejection bubbles collapse into a red prison; prison bars extend down → bars become vines.
3. Red vines restrain A on a backward treadmill while violet questions multiply; a gold beam spans frame → beam becomes road.
4. B runs on the gold road, trips, reconstructs, and continues while imaginary futures shatter; glass fragment wipes lens → close-up of hands gripping vines.
5. A breaks the vines and match-cuts through send, open-document, and first-line actions; raised right foot pauses → same foot lands.
6. The foot creates a gold shockwave, the thought cloud becomes stars, and a mountain unfolds; finish with the exact CTA `STOP OVERTHINKING. START MOVING.`

Do not use ellipses, shorthand such as “same as above,” or references that would make a prompt non-standalone.

- [ ] **Step 4: Retrieval-test the example**

Give a fresh subagent this request with the Skill available:

```markdown
Use the Skill's example to explain what should happen after I approve a 16:9 dark-theme storyboard, then produce only the first standalone prompt for a new topic about gravity.
```

Expected: the agent finds `examples.md`, explains the Phase B transition accurately, produces one self-contained prompt, and does not copy the example's overthinking content.

- [ ] **Step 5: Commit the complete example**

Run:

```bash
rg -n "Clip 1|Clip 2|Clip 3|Clip 4|Clip 5|Clip 6|确认|16:9" skills/directing-stickman-videos/references/examples.md
git diff --check
```

Commit:

```bash
git add skills/directing-stickman-videos/references/examples.md tests/reports/forward.md
git commit -m "docs: add complete stickman video example"
```

---

### Task 5: Add Open-Source Metadata and User Documentation

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Modify: `skills/directing-stickman-videos/agents/openai.yaml` only if generated metadata differs from the approved values

**Interfaces:**
- Consumes: Completed Skill behavior and final folder name
- Produces: Installable GitHub repository with clear public usage and permissive licensing

- [ ] **Step 1: Write the README for human users**

Create `README.md` with this content:

~~~~markdown
# Stickman Video Director

Turn source copy into a confirmed one-minute English stickman-video plan and six rich Gemini Omni Flash prompts.

## What it produces
- Required aspect-ratio and light/dark theme setup
- A director's proposal for confirmation
- Approximately 130–150 words of English narration
- Six visually dense, transition-linked prompts
- Light and dark monochrome themes with saturated accents

## Install

```bash
cp -R skills/directing-stickman-videos "${CODEX_HOME:-$HOME/.codex}/skills/"
```

## Use
Invoke `$directing-stickman-videos` and paste source copy. Choose `16:9`, `9:16`, or `1:1`, then choose white-background/black-figure or black-background/white-figure.

## Workflow
1. Supply copy.
2. Choose ratio and theme.
3. Review Phase A.
4. Approve or revise.
5. Generate the six clips from Phase B and stitch them in order.

## Audio continuity
Independent video generations may vary slightly in voice and music. Reuse a voice reference when available or add one continuous voiceover and BGM track during assembly.

## Repository structure

```text
skills/directing-stickman-videos/  Installable Skill
tests/                             Behavioral scenarios and reports
docs/superpowers/specs/            Approved design
docs/superpowers/plans/            Implementation plan
```

## License
MIT
~~~~

Write this content verbatim. Do not duplicate the complete production example from `references/examples.md`.

- [ ] **Step 2: Add the MIT license**

Create `LICENSE` using the standard MIT text with:

```text
Copyright (c) 2026 Stickman Video Director contributors
```

- [ ] **Step 3: Validate UI metadata against the completed Skill**

Run:

```bash
sed -n '1,120p' skills/directing-stickman-videos/agents/openai.yaml
```

Expected: all strings are quoted; `default_prompt` mentions `$directing-stickman-videos`; there are no icons, brand colors, dependencies, or policy overrides.

- [ ] **Step 4: Commit public documentation**

Run:

```bash
git diff --check
```

Commit:

```bash
git add README.md LICENSE skills/directing-stickman-videos/agents/openai.yaml
git commit -m "docs: prepare open-source skill package"
```

---

### Task 6: Complete Forward Tests, Official Validation, and Packaging

**Files:**
- Modify: `skills/directing-stickman-videos/SKILL.md` only when a verified loophole requires it
- Modify: `skills/directing-stickman-videos/references
