# B1–B6 · Installed production workflow

Use this guide when starting a B-style story after installation or resuming a project without its old chat. The goal is a new film that meets the selected style's actual reference effect. These are routes within one installed Skill. Shared production requirements do not make their artwork, animation, captions, sound or review schemas interchangeable.

## Find the selected style's three entries

From the installed Skill directory, run:

```bash
node scripts/autopilot.mjs workflow --style B1 --ratio 9:16
```

Choose the requested `B1`–`B6` and `16:9` or `9:16`. For an existing project, add `--project /absolute/project`. This read-only command returns installed absolute paths and command arguments for **production standards**, **acceptance standards** and **the real review-template workflow**. It does not create a film, generate a passing review, call a provider or certify quality. A template path may be an expected output until the current candidate is encoded and its evidence extracted.

Explain the selected route and any evidenced capability gap in the user's language. Read only the relevant style and ratio references below, together with [Autopilot](autopilot.md), the [common production QA](autopilot-production-qa.md) and [sound system](autopilot-sound-system.md). Inspect real available tools; `doctor` checks local dependencies, not service access or successful generation.

| Style | Production and actual reference | Acceptance route |
| --- | --- | --- |
| B1 | [Minimal hand-drawn](b1-minimal-handdrawn.md), [B1 production QA](b1-production-qa.md); play Ryan V4, not the three-pose runtime demo | [B1–B3 reference-effect protocol](b1-b2-b3-reference-acceptance.md), with B1's own criteria |
| B2 | [Colorful hand-drawn](b2-colorful-handdrawn.md); play both portable sleep and phone/weather films | [Reference-effect protocol](b1-b2-b3-reference-acceptance.md), with B2's own criteria |
| B3 | [Retro TV](b3-television.md), [semantic action and graphic inventory](b3-semantic-motion.md); play both portable night-signal and dog films | [Reference-effect protocol](b1-b2-b3-reference-acceptance.md), including itemized event/graphic review |
| B4 | [Survival storytelling](b4-survival-storytelling.md), [asset origin](b4-asset-origin.md), [opening](b4-opening-direction.md), [audio](b4-audio-direction.md), [production ledger](b4-repeatability-check.md); inspect the five drawing anchors and play both installed full showcases | Separate [picture](b4-picture-animation.md) and [typography](b4-typography-acceptance.md) reviews |
| B5 | [Character explainer](b5-character-explainer.md), [production manifest](b5-production-gate.md), [presenter](b5-avatar-motion.md), [left-stage action](b5-left-stage-motion.md), [sound](b5-sound-qa.md); inspect both [accepted baselines](b5-accepted-baselines.md) | [B5 independent visual protocol](b5-visual-acceptance.md), covering every action, caption group and complete film |
| B6 | [Installed painted-world production](b6-installed-production.md); Sample 1 portrait V44 is primary, V90 is secondary engineering evidence | [Motion review](b6-motion-review.md) and [35-item primary-standard matrix](b6-sample-1-acceptance.md) |

B4's five installed scene references and style prompt remain the drawing authority; its portrait-opening clip establishes that opening's effect. The complete motion/audio references are installed at `assets/b4/public-showcases/b4-dispatch.mp4` and `assets/b4/public-showcases/b4-death-clock.mp4`, with the original showcase hashes verified by the workflow index. Compare their actual playback rather than claiming whole-film motion/audio comparison from stills. Reference films, old tests and historical scaffolds are comparison or implementation evidence, not substitutes for a newly requested story. Preserve legitimate approved identities/audio and author the new story's actual actions and scenes.

## Author the story before generating review evidence

1. Resolve the story, audience, selected style, native ratio, language and agreed scope. Record approved words, actual tools, rights/cost boundaries and checkpoint. Play the selected available reference with sound and note the drawing, action/contact, editing, caption and audio mechanisms needed for this story.
2. Establish or reuse approved original-speed narration. Align words to the actual recording, group captions by meaning and real pauses, then plan scene states, difficult contacts, reactions and sound anchors. Calibrate a representative new-story still and the hardest action before batching the remaining work. A prompt, drawing sheet or runnable example does not establish animation quality.
3. Initialize an external project and author its own artwork/layers, poses, actions, native composition and mix. B1–B4 use the [manifest runtime](autopilot-runtime.md); B5 uses trusted local scene code; B6 uses its dedicated painted-world runtime. Keep projects and generated review/delivery outputs out of the installed Skill.

For B1–B4, `init --ratio 9:16` sets an empty native-sized manifest; it does not redesign a landscape scene. Author each shot's framing and action for that ratio. B1–B3 portrait additionally requires the [native portrait contract](b1-b2-b3-native-portrait.md). B4 portrait requires its native poster/picture treatment and phone-size review on both tracks. Use separate B1–B4 projects for two ratios. B5 requires a native `scene/config.json` and scene/presenter/caption layout; its historical scaffold and accepted baselines are landscape, and `init --ratio` is not a conversion route. B6 has [separate native plans](b6-native-formats.md). Reuse accepted audio rather than regenerating it for a ratio change.

## Produce, inspect and accept the actual media

| Style | Encode and extract the current candidate | Real generated review entry |
| --- | --- | --- |
| B1–B3 | `autopilot.mjs preview` / `render` automatically extract reference evidence | Project `output/preview-reference/review-template.json` / `output/film-reference/review-template.json` |
| B4 | `autopilot.mjs preview` / `render` automatically extract **both** tracks | Project `output/preview-picture/review-template.json` and `output/preview-typography/review-template.json`; final-film equivalents use `film-picture` and `film-typography` |
| B5 | `character-explainer.mjs frames → encode → review-pack` | `review-template.json` in the chosen fresh external evidence directory |
| B6 | Dedicated `preview → review-pack` | `motion-review.json` and `index.html` in the chosen review directory; see the [exact commands](b6-motion-review.md#runtime-evidence-contract) |

The command names above are route summaries; use the `workflow` command's argument arrays and linked contracts for executable commands. Generic `autopilot review-pack` is not the B1–B5 evidence generator. B5 does not use generic `autopilot preview/approve/render`; its [dedicated commands](b5-character-explainer.md#installed-execution) encode the authored scope and accept its independently reviewed candidate. B5 `init/check` concerns a historical scaffold; a new script requires new timing, glyphs, stage choreography, final audio, `scene/production.json` and `scene/visual-plan.json`.

Produce a representative preview with real narration, semantic captions, difficult actions and scene transitions. An independent human or reviewing Agent then inspects the exact encoded MP4, current extracted evidence and applicable actual references. B6 uses an independent reviewer when available/permitted; otherwise record the actual inspector and limitation under its motion-review contract, leaving unviewed effects pending. Complete the generated **unknown/pending** template truthfully; preserve its identifiers, hashes and complete coverage. Use concrete observations from real playback, not preset passing text. Passing JSON checks establishes evidence freshness/completeness, not automatic aesthetic judgment. Review source/story causality and the complete sound mix too; B4's picture/text passes do not certify those other tracks.

B6's full-duration authored metadata, plans, captions and original-speed audio must exist before even a short production preview; this is not B1–B4's scoped-input loader. Changes to its fingerprinted inputs invalidate approval. Its fixed-camera character fitting uses the actual Puppet API and painted result, not a separate automatic character-approval command. Walking requires authored stance/view/foot-contact work. After full `render`, inspect `outputs/film-01/preview.mp4` and build/check that report's final review pack; the filename and technical report do not imply creative acceptance.

Repair confirmed gaps and repeat authorized local rendering/review. Keep missing, unknown or failing results pending. B1–B3 retain their documented disclosed limited-result route only for observed capability limits; that result is not sample-equivalent. Continue useful independent work where possible. Additional charges, uploads or publication retain their actual authorization boundaries.

After independent sample review, use the user's **actual existing sample approval and remaining-production authorization**; do not invent it or ask again when already supplied. B1–B3 `approve` requires its current `--visual-review`; B4 requires both current `--picture-review` and `--text-review`. B5/B6 keep their own approval and acceptance records. Technical checks and a reviewer's pass do not supply the user's decision.

Then complete the authorized full film and extract fresh full-scope evidence. The opening's review does not cover the body or ending. Independently review that final media and record acceptance through B1–B3 `accept-visual`, B4 **both** `accept-picture` and `accept-text`, B5 `accept`, or B6's dedicated final review gate. Preserve the original reference media and previous valid versions. Deliver the film with verified output-folder link, applicable subtitle sidecars, project/checkpoint and truthful review/user-acceptance state. A completed production or review never grants public-upload or GitHub publication authority.

## Default component completeness, B1–B9

Before calling a preview or final film complete, run the [actual-output captions/SFX/music gate](b-delivery-completeness.md) in addition to the selected style’s original acceptance. This separate gate also accepts B7–B9 external-code MP4s without pretending that the B1–B6 renderer supports their project schemas. Automatically include the sample-directed caption treatment, meaningful effects and suitable background music; only explicit user omissions or documented short story silence apply. An individual style pass is not complete-delivery acceptance.
