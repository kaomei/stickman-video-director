# Changelog

[🇺🇸 English](CHANGELOG.md) · [🇨🇳 简体中文](CHANGELOG.zh-CN.md)

> This is the English translation of [`CHANGELOG.zh-CN.md`](CHANGELOG.zh-CN.md). If the two differ, the Chinese version is authoritative.
>
> Older entries keep the mode names used at the time: **A · Director** is now **A · Model Engine**, and **B · Autopilot** is now **B · Code Engine**.

## 2026-11-15 — A7 Rubber Hose Animation and separate A/B showcases (v2026.11.15.1)

- Added A7 "Rubber Hose Animation" to Director mode. It locks a thin-line stickman with two curled hair tufts, retro 2D painted scenery and fixed prompts, and ships with reference stills plus production and acceptance standards.
- Kept the two approved landscape showcase clips; showcase 2 now starts at second 2 of the original file. Its lyrics belong to that showcase only and are not a default A7 requirement.
- Documented the approved workflow of generating video directly from the kitchen reference material, plus re-tests in two new scenes (a post office and a seaside pier). Clarified the difference between a material reference and a first frame. Generation costs and model choice still follow Director mode's authorization flow.
- The README in all nine languages now introduces A7 with its showcase. The top gallery lists A1–A7 on the left and B1–B6 on the right, leaving the last right-hand cell empty, and the style count is now 13. Other published styles and body text are unchanged.
- B7–B10 remain unpublished locally and are not part of this release.

## 2026-11-13 — B3/B4 animation and acceptance hardening (v2026.11.13.3)

- B3 lines, arrows and underlines must declare their purpose and the object they are bound to, and the target, direction, follow relationship and actual visible interval are checked. Animation must serve the current story; CRT effects, decorative flicker and ineffective path parameters do not count as meaningful action.
- B4 now plans story-related local animation proactively during shot-by-shot planning, and text effects and picture animation are accepted separately, in Chinese and other languages. No complete shot, and no unchanged principal picture state across shots, may last longer than 3 seconds; crops, subtitle changes and decorative changes do not reset the timer.
- Samples and full films must be bound to the actually exported MP4, the current plan and asset fingerprints, with an independent reviewer recording each result. When evidence is missing, the status stays pending; passing technical checks cannot be claimed as meeting the visual standard.
- Added regression checks for semantic action, picture animation and acceptance bypasses. 352 source tests and 68 targeted tests on the installed version pass; these results verify the rules and implementation, not visual approval of new films.
- This release adds no media assets, does not change the README showcase, and includes no B6–B8 development work.

## 2026-11-13 — B1–B3 native portrait samples and acceptance

- Added three user-approved 10-second portrait videos to the Skill as official internal quality references, keeping the original files and source fingerprints. The README showcase is unchanged.
- B1 keeps its thin hand-drawn lines, paper texture and handwritten text, with explicit semantic step-by-step reveals and local micro-animation. B2 keeps its colorful hand-drawn look, and B3 keeps white lines on black with a TV texture. Switching to portrait does not change the style.
- Portrait projects add per-shot native composition, readable captions, visibility of the main action and safe-area checks. Reference acceptance is bound to the final portrait cut, and full films must be re-reviewed at original speed at phone viewing size.
- Technical diagnostics, independent review and user confirmation are recorded separately. Approval of the three samples does not make future films pass automatically; where a tool has genuine limits, the unmet items are stated clearly.

## 2026-11-11 — B-series production constraints and B4 opening fixes

- B4 fixes its opening font, text grouping and key effects, and validates early narration and actual local animation. Still-image switches, camera push-ins and text entrances no longer pass as picture micro-animation.
- B1, B2 and B3 each lock a caption preset and add local-action and continuity checks. The shared sound workflow supports low-volume ambient beds, separate dialogue, file-based sound effects and motivated silence.
- New B5 stories must record evidence of the actual assets, captions, action and sound. Real people or complex characters use an image-generation tool available to the current agent or an approved supplied image, instead of silently falling back to code-drawn heads. Without such a tool, configure one or import assets first.
- Voice services are configured according to the user's choice; voices in the examples are source references only. B4's approved default voice, Brian, is unchanged. All eight languages now describe the models and actions consistently, and the verified Gemini voice sources for the examples are filled in.
- The local source and an isolated installation each pass 163 runtime tests. This shows the technical checks run; it does not mean every model's output will automatically reach the same aesthetic quality. No new paid generation; B6 and later are out of scope.

## 2026-11-04 — B4 Survival Thriller and multilingual experience update

- Released the B4 Survival Thriller workflow inside the same Skill: five locked style references, complete prompts, Brian as the default narrator, sound and early narration in the first frame, grouped opening text, visual escalation in the first three seconds, story cuts of at most three seconds, a continuous low-volume atmosphere and story-driven sound effects.
- B4 is wired into the installed package's shared production entry point, supporting `init --style B4` plus validation, samples, confirmation, full export and per-shot caching. Added separate checks for the ambient bed, character dialogue, file sound effects, story silences and the opening sound.
- Published the approved "911" and "death countdown" showcases. All eight languages now share the ten style introductions, titles, sources, narration credits, Codex recommendation and seven FAQ items; the default README matches the English one.
- Fixed A6's installable reference images and reference-prompt workflow, keeping the existing A1–A5 and B1–B3 routes. B5 and other experiments are not part of this release; no new paid generation.

## 2026-10-23 — B1 finalized with its own production rules

- Fixed the approved 21-second "Bodi" sample with sound as the B1 "Minimal Line Art" standard, and updated the Chinese top and detail previews. The previous sample is kept; the second example is still pending an update.
- Clarified slim proportions; exaggerated, varied expressions; actions and props designed for the content; a near-white, very faint grid; local micro-animation and restrained sound effects. Visuals follow the narration at original speed, and captions are always present.
- New B1 projects default to Google Gemini's native "Bodi" voice without extra voice descriptions; a user's own configuration takes priority. Each B style maintains its own voice, captions and pacing and does not inherit rules from A or from other B styles.
- Fixed B-mode sample range validation, approval fingerprints and per-shot caching. Full films must still pass full validation and sample confirmation. The verified A1–A5 rules are unchanged; other language introductions are not yet updated.

## 2026-10-23 — Autopilot automatic production and B1 Minimal Line Art

- Still the same repository and the same `directing-stickman-videos` Skill: A · Director produces storyboards and video prompts, while B · Autopilot chains asset generation, voiceover, captions, local animation, sound effects and local compositing.
- Added installable local runtime scripts, configuration notes, an optional Gemini adapter and offline examples. Visuals are arranged around the actual voiceover, with full-film production after sample approval, shot caching and resume after interruption.
- Released B1 "Minimal Line Art" with the approved original-speed "Sadaltager" sample with sound. A second showcase sample has not been added yet.
- Kept the repeatedly approved Chinese README and A/B style structure; other language introductions are not yet updated, and the A-series prompts and reference rules are unchanged.

Existing users only need to update the same Skill. Autopilot requires Node.js 20+, FFmpeg, and working image-generation and voiceover tools; the first run checks the configuration. See the [runtime guide](skills/directing-stickman-videos/references/autopilot-runtime.md).

## 2026-10-20 — Style 5: Historical Cartoon

- Added the Historical Cartoon style: round white heads, black oval eyes and thin-line limbs, paired with period costumes and colorful painted scenery.
- Added period setting, character cards, prop states and a complete voice description to the Style 5 storyboard workflow; the verified prompts for Styles 1–4 are unchanged.
- Updated all language introductions with two showcases, Edo-period Japan and ancient Egypt; the Japan showcase is also the top preview.
- Thanks to [Lawal Ridwan / @leksautomate](https://github.com/leksautomate) for contributing the style, prompts and the Japan showcase.

Users who want Style 5 need to update the Skill. [Test record](tests/reports/style-5.md).

## 2026-10-15 — Chinese README and onboarding experience

- The Chinese README shows four major styles, six visual variants and eight showcases, with each style's description placed before its showcase.
- The install section keeps only a one-sentence install request and the GitHub link; terminal steps, tool-specific commands and install troubleshooting were removed.
- To get started, users only provide a topic or source text; the Skill guides them through aspect ratio, style and the director's proposal. Users don't need to pre-fill parameters or rewrite the workflow instructions.
- Merged duplicate descriptions of features, outputs and the production workflow, and removed the long examples from the README. Landscape and portrait tips are grouped under the usage tips.
- Created lightweight GIF previews for the Chinese page, keeping the original GIFs, MP4s and the other language pages.
- Merged the style requests and showcase submissions into one section; added Star History and the MIT license note.

This is a showcase and documentation update; installed users don't need to reinstall. The Skill rules are unchanged.

## 2026-10-14 — Style 4: Cozy Storytelling

- Added the Cozy Storytelling style, combining minimal characters with colorful 2D scenes.
- Clarified the rules for proactively changing scenes in new clips while keeping characters and important props continuous.
- Released two user-selected showcases: a subway commute and an open-air café.

Users who want Style 4 need to update the Skill. [Test record](tests/reports/style-4.md).

## 2026-10-13 — Style 1 character description

- Returned to a concise stickman appearance description and added a constraint that replaces the current pose.
- Kept occasional simple facial expressions, based on user feedback.

Users who installed before this change can update the Skill. [Test record](tests/reports/classic-character.md#2026-10-13--concise-current-pose-revision).

## 2026-10-12 — Voice consistency and Prehistoric style examples

- All styles share a complete voice description, and every segment of the same video repeats the same voice settings; different videos can still use different voices.
- Added a prehistoric story and a fan example for Style 3.

Users on older versions who need these rules can update the Skill. [Voice test record](tests/reports/shared-voice.md) · [Style 3 record](tests/reports/style-3.md).
