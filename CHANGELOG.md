# Changelog

[🇺🇸 English](CHANGELOG.md) · [🇨🇳 简体中文](CHANGELOG.zh-CN.md)

> This is the English translation of [`CHANGELOG.zh-CN.md`](CHANGELOG.zh-CN.md). If the two differ, the Chinese version is authoritative.
>
> Older entries keep the mode names used at the time: **A · Director** is now **A · Model Engine**, and **B · Autopilot** is now **B · Code Engine**.

## 2026-11-21 — A8 Studio Ghibli Style (v2026.11.21)

- Added A8 to the Model Engine, with production guidance, standalone prompts, and reference frames from the approved Flow clips.
- Documented text-to-video for new scenes, frame handoffs for continuous shots, and checks for character integrity, motion, and visual consistency.
- Published two showcase clips in the approved order: Mountain Workshop first, Coastal Courier second. Updated nine README files across eight languages, bringing the public gallery to 15 styles.

## 2026-11-18 — Code Engine rendering performance (v2026.11.18)

- B1–B4 load artwork only for the active shot and write generated sound effects in chunks, reducing peak memory.
- B1–B7 hash large media files in chunks. B4 and B5 avoid retaining or reading full images where lighter checks suffice, and B6's Python tools stream additional media checks.
- Targeted benchmarks showed lower peak memory, and tested output frames and audio matched the previous implementation. Overall render time still depends on the project and tools.
- Covers the public B1–B7 styles; existing style presets and samples are unchanged.

## 2026-11-17 — Unified Model Engine workflow and B7 Pixel Theater (v2026.11.17)

- Unified A1–A7 production: approve the storyboard → standalone prompts → optional low-resolution trial → confirm final resolution and credit budget → continuous production.
- Flexible generation lengths and separate editing shots; narration, music and sound effects each have their own timeline, with action and camera continuity checks.
- Released B7 "Pixel Theater": approved examples, portrait layout and short-caption guidance, packaged code helpers and acceptance gates.
- All nine README files, covering eight languages, were updated for B7, bringing the public styles to **14**. The release added music attribution. Later that day, the README showcase images were fixed, the music-credit line was removed from the READMEs, and sample 2’s voiceover and typewriter ending were highlighted.
- B8–B10 are not included; existing approved styles and samples are preserved.

## 2026-11-16 — README refresh: Model Engine and Code Engine (v2026.11.16.1, v2026.11.16.2)

- Renamed the README modes to **A · Model Engine** and **B · Code Engine**, with a comparison table explaining usage, outputs and cost.
- Added a three-step getting-started guide and explained A's unified workflow: approve the storyboard, receive standalone prompts, optionally test through a browser, then confirm resolution and credit budget before full production.
- Refreshed tool guidance, style introductions, FAQ and community copy; removed the style-count badge in favor of the released count in public copy.
- In v2026.11.16.1, replaced A3's first showcase and animated preview with the approved October 12 sample, and added B6's inspiration credit for [@RicksClips3000](https://www.youtube.com/@RicksClips3000).
- Synchronized the README updates across languages. The v2026.11.16.2 follow-up updated README copy and documentation checks. Skill production rules stayed unchanged in both versions.

## 2026-11-15 — A7 Rubber Hose Animation and separate A/B showcases (v2026.11.15.1)

- Added A7 "Rubber Hose Animation" to Director mode. It locks a thin-line stickman with two curled hair tufts, retro 2D painted scenery and fixed prompts, and ships with reference stills plus production and acceptance standards.
- Kept the two approved landscape showcase clips; showcase 2 now starts at second 2 of the original file. Its lyrics belong to that showcase only and are not a default A7 requirement.
- Documented the approved workflow of generating video directly from the kitchen reference material, plus re-tests in two new scenes (a post office and a seaside pier). Clarified the difference between a material reference and a first frame. Generation costs and model choice still follow Director mode's authorization flow.
- All nine README files, covering eight languages, now introduce A7 with its showcase. The top gallery lists A1–A7 on the left and B1–B6 on the right, leaving the last right-hand cell empty, and the style count is now 13. Other published styles and body text are unchanged.
- B7–B10 remain unpublished locally and are not part of this release.

## 2026-11-14 — B-mode sound library, B5/B6 defaults and fixes (v2026.11.14 – v2026.11.14.7)

- Bundled a B-mode sound library: 774 sound effects/transitions, 31 full background music tracks and 85 short musical stingers. Search, audition and export offline by style and story action, with item-specific source, license evidence and required credits.
- B1–B6 now include style-appropriate captions, meaningful sound effects and suitable background music by default, automatically sourcing audio, verifying rights, mixing and preparing attribution. Missing or unmixed components block complete acceptance; explicit user omissions and story-motivated silence are preserved.
- B5 defaults to the approved Mei graphic relay workflow: each new project copies the approved artwork, complete poses, whole cartoon-animal states and motion-handoff kit. Ordinary previews need one review of the actual candidate; strict acceptance is opt-in or used for final acceptance.
- B6 added character preflight, reusable action/camera helpers and lower-resolution 30fps drafts; drafts rendered about 3.5× faster in a local benchmark. Final rendering and all acceptance checks are still required.
- Fixes: B4/B6 guard against delivering bundled reference art or historical test performances as new stories; B6 Windows resource paths; B1–B6 installed production workflow and native-format routing; less approval friction without weaker review gates.
- Approved samples and style standards are unchanged; B7–B9 were not yet published.

## 2026-11-13 — Maintenance: cross-platform checks and B6 project fixes (v2026.11.13.5)

- Restored the original A rule checks and aligned the "coming soon" and Stars wording across all nine READMEs.
- Completed B4's picture-review parameters and command examples; fixed B5's Windows path comparison.
- B6 exported projects now include the OFL license for the fallback font, and B6 source verification covers the caption and motion-review entry points.
- Samples, styles, voices and caption effects are unchanged.

## 2026-11-13 — B6 Dynamic Meme Animation released (v2026.11.13.4)

- B6 is now a complete installable production workflow, with an editable project and character, scene, caption and review tools for new stories; the complete Hong Kong V90 project is included as a reference.
- Portrait (9:16) works best. The portrait Eiffel Tower Sample 1 is the primary acceptance standard, with 35 independent checks; landscape and portrait need separately authored plans.
- Stronger character binding: continuous-ink arms, sleeve attachment and head/neck continuity.
- Captions default to the user-approved Archivo Black font, keeping the established size, placement, outline and phrase switching.
- All nine READMEs add the B6 animated gallery card, two examples and portrait guidance. Only B6 is released; B7/B8 are not included.

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

## 2026-11-13 — B4 portrait opening and phone-size acceptance (v2026.11.13.1)

- The B4 portrait opening uses the user-approved layout: a poster title on top and the story picture below, keeping the cream-white and coral hierarchy, the settle-in of the whole block and the short accent-line micro-animation.
- The opening template is chosen automatically by aspect ratio; Chinese and other languages must use fonts that cover their script and fit the story's style.
- A review record of the actual exported video, watched at phone size and normal speed, is required. Missing reviews, failed readability or missing glyphs cannot pass, and cached previews stay pending.

## 2026-11-13 — B1–B5 sample-effect acceptance upgrade (v2026.11.13)

- Passing technical checks no longer counts as visual acceptance.
- B1, B2, B3: the actual sample and complete film are independently reviewed against the bundled reference films. Capable environments, including Codex and Claude Code, must target comparable results; genuine tool limits are recorded honestly.
- B4: the opening, main typography and captions are reviewed in every language for type design, hierarchy, emphasis and perceptible micro-animation.
- B5: the causal left-stage action, natural arm poses and semantic caption animation are reviewed in every language.
- Fixed the separators between neighboring styles in all nine READMEs.

## 2026-11-11 — B5 font customization and B-style validation fixes (v2026.11.11.1, v2026.11.11.2)

- B5 keeps its approved typography by default, while allowing explicit user font and text-effect choices, or a font that supports another language's script.
- B1–B3 check local picture motion in overlapping windows; whole-camera moves and tiny long-span drift no longer substitute for meaningful local animation.
- Muted ambience no longer counts as a continuous sound bed; motivated cuts and premixed masters are still supported.
- The FAQ is synchronized across eight languages and no longer promises a fixed six-scene structure.

## 2026-11-11 — B-series production constraints and B4 opening fixes

- B4 fixes its opening font, text grouping and key effects, and validates early narration and actual local animation. Still-image switches, camera push-ins and text entrances no longer pass as picture micro-animation.
- B1, B2 and B3 each lock a caption preset and add local-action and continuity checks. The shared sound workflow supports low-volume ambient beds, separate dialogue, file-based sound effects and motivated silence.
- New B5 stories must record evidence of the actual assets, captions, action and sound. Real people or complex characters use an image-generation tool available to the current agent or an approved supplied image, instead of silently falling back to code-drawn heads. Without such a tool, configure one or import assets first.
- Voice services are configured according to the user's choice; voices in the examples are source references only. B4's approved default voice, Brian, is unchanged. All eight languages now describe the models and actions consistently, and the verified Gemini voice sources for the examples are filled in.
- The local source and an isolated installation each pass 163 runtime tests. This shows the technical checks run; it does not mean every model's output will automatically reach the same aesthetic quality. No new paid generation; B6 and later are out of scope.

## 2026-11-10 — B5 motion and acting standard, project page update (v2026.11.10, v2026.11.10-b5)

- B5 adds the approved 63.53-second Jensen V13 full reference film, keeping the earlier Spider-Man reference.
- Requires story-led physical action chains (contact, force, secondary motion) and varied silhouettes, instead of repeating the same pose beside popping props.
- Clarifies when the bottom-right presenter uses image generation versus SVG; action sound effects sit clearly above low background music; no default account watermark.
- Project page: added Renoise as the third API partner, project support and official community links, and simpler navigation.

## 2026-11-09 — B5 Character Explainer and voice/image provider routing (v2026.11.9, v2026.11.9-b5)

- Released B5 "Character Explainer": an avatar host with expressive stickman scenes, oversized-prop physical comedy, semantic captions and action-synced sound, with the approved full Spider-Man example and a portable code scaffold.
- A new recognizable character is first generated from reference images, and a still plus a short voice test are approved before making the story.
- B mode follows the user's chosen image and voice providers: when no adapter is bundled, the agent inspects and adapts instead of replacing the provider or giving up, and never reuses Gemini-specific credentials or endpoints for another service.
- All eight README languages add the B5 introduction and two examples (including Crazy Mei), an API partners table (SJolt, APIMart), and fixed image loading.

Install or update: `npx skills add kaomei/stickman-video-director --skill directing-stickman-videos`

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
