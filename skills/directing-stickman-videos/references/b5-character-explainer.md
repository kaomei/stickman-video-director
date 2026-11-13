# B5 · 角色解说风 / Character Explainer

**Turn your favorite avatar into a stickman star.** Former local B6 / Animated Meme is now B5. This is a route in the existing Skill, not another installation. Select it explicitly; do not alias it to B1 or B4.

## Input and output

Accept a topic/script and a chosen or uploaded presenter. Produce a recognizable abstract cartoon head on a simple stick body, speaking at bottom right; the left stage tells the idea through energetic anonymous stickmen, oversized objects and causal physical comedy. Warm paper, dark ink, restrained red accents, large editorial titles and voice-aligned captions form one composition. This is not a realistic talking-head treatment or an abstract motion-graphics template.

**Keep the two roles separate.** The [image/SVG decision](b5-avatar-motion.md#when-to-generate-an-image-when-to-code) applies only to the bottom-right presenter: reuse accepted assets first; new real people or complex anime/cartoon/IP identities require the current Agent's available image tool or accepted supplied raster art, while simple original geometric characters may use SVG. Codex is not required. With no image tool, configure/import an image instead of substituting a code-drawn face. Both new routes require static approval before a speaking test. The left stage always uses anonymous code-animated stickmen; choosing a presenter does not recast those actors.

Read [avatar and motion direction](b5-avatar-motion.md), the mandatory [left-stage action contract](b5-left-stage-motion.md), [visual acceptance protocol](b5-visual-acceptance.md), [sound and acceptance](b5-sound-qa.md), the [common B sound system](autopilot-sound-system.md) and the bundled [provenance](../assets/b5/CREDITS.md) before production. Inspect the complete [approved sample](../assets/b5/approved-sample.mp4), then the [true-frame contact sheet](../assets/b5/reference/contact-sheet.jpg) and code, not only thumbnails. These assets are implementation references, not authorization to reuse a character, person's likeness, voice or account mark in any context.

The B5 source also includes the user-approved [Jensen V13 long-form baseline](b5-accepted-baselines.md): exact 63.53s composite, full-frame references, portable scene code and acceptance fixtures. Inspect both baselines before authoring. The latest long-form baseline extends the short Spider-Man example; it does not replace its immutable media or turn this story's crying into a global preset. The owner separately authorized this B5 publication on 2026-11-10; that approval does not authorize publication of future user projects.

## Left-stage planning gate

Before coding a new story, write the [action cards](b5-left-stage-motion.md#action-cards-before-code) against the actual approved voice timing. For every main idea, name the actor's before/after state, the force or constraint, contact, exaggerated consequence, recovery and shared SFX anchor. Reject a plan consisting of noun illustration, prop entrances, caption updates and a mostly standing actor. Increasing prop count, camera shake or event count does not repair that plan. Use story-specific physical metaphors, not the same anvil/battery gags for every topic; factual stories must not acquire invented evidence or events.

The reference scaffold is not an automatic choreography engine. A new script needs new action chains, staged root/body motion, natural task-driven arm poses and reviewed motion strips plus continuous playback, not just replacement text and props. Static raised arms across unrelated beats, unsupported reaches and repeated generic bursts fail. Technical render/IK/pixel checks cannot approve the animation. Every new encode stays pending until evidence-backed independent review passes; do not promote it to an accepted motion baseline without the user's actual review.

## Proven capability and boundaries

- Proven local landscape baselines: the user-approved 22.8-second Spider-Man example and 63.53-second Jensen V13, both 1920×1080 at 30 fps with their exact accepted encoded audio. They demonstrate layout, motion, caption and sound treatment—not a guarantee of recognition or quality for every new avatar/topic. Use the [baseline matrix and review gates](b5-accepted-baselines.md), not a memorized prop sequence.
- The installed B5 code example and frame renderer are self-contained. The agent must author new scenes, prop interactions, timing, semantic caption groups, mouth envelope and an authorized final audio mix for each new script. The helper does not generate scripts, rig arbitrary uploaded images or buy voice/SFX services.
- B5 must support native landscape 16:9 and portrait 9:16, including a requested pair, under the [common dual-format gate](autopilot-production-qa.md#native-landscape-and-portrait). The currently validated baseline is landscape only; native portrait remains a required pending acceptance item. A 9:16 version needs native re-layout of stage, captions and presenter plus a fresh preview; do not crop or squeeze the landscape output and claim a validated vertical template. Preserve accepted identity and original-speed narration rather than generating them again just for a ratio change.
- New identity: select and record its image/SVG route, first approve the static head/body design, lock the accepted assets, then make a roughly five-second speaking test, then the story preview. Existing approved identity and audio are reused unchanged. Static approval alone is not approval of a whole new film or permission for paid generation/publication.

## Installed execution

From the installed Skill directory, run `npm ci` and `node scripts/autopilot.mjs doctor`. B5 additionally uses Sharp. FFmpeg/FFprobe and Node 20+ are required. Project files always live outside the installed Skill.

```sh
node scripts/autopilot.mjs init /absolute/new-project --style B5
node scripts/character-explainer.mjs check
node scripts/character-explainer.mjs validate /absolute/new-project
node scripts/character-explainer.mjs frames /absolute/new-project --output /absolute/new-frame-check --frames 0,55,128,226,390,580 --trusted-code
```

`init` copies a sample-specific authored code project, its identity rig, original glyph tiles, mouth envelope, timings, reference composite and fonts. It is a **reference scaffold**, not a finished new-topic video. `check` verifies the installed baseline hashes, video/audio packets, caption word coverage and fixed-length arm geometry across every frame. `frames` executes local project code only with explicit `--trusted-code`; inspect it before granting that flag. It refuses existing output directories and records input fingerprints.

Those existing helpers still initialize/check the Spider-Man scaffold, not a Jensen story generator. Validate the additional local baseline with `node --test tests/b5-local-baseline.test.mjs`. Its self-contained `scene/` can be copied to an external project for an authorized adaptation; never edit the locked baseline in place. Neither passing test suite replaces story-specific choreography, listening or user review.

For a new story, replace the sample script/timings/glyph tiles, scenes, identity and sound plan as required, and provide the [production manifest](b5-production-gate.md). Only the byte-identical historical scene bypasses that new-story gate. **No account watermark or test label by default**: leave `account` empty. Add branding only when the user explicitly requests their own mark; never copy a reference creator's handle. The immutable approved media may show historical example branding, which is not a style requirement. The bundled glyph atlas contains only this sample's words; rebuild tiles for new text rather than substituting blank or overflowing text. Recompute `speech-levels.json` from the approved **dry speech**, not BGM/SFX; its amplitude/word-onset mouth animation is a heuristic, not phoneme-accurate lip sync. Adapt expressions/gestures without stretching the accepted face.

Fonts, text effects and the video language are customizable: record an explicit user choice or a necessary language font fallback with the [scoped typography override](b5-production-gate.md#font-text-effect-and-language-customization), update the actual renderer/glyph tiles, and review the result. **Every language needs animated semantic captions**: actual-voice progressive reveal, meaningful emphasis and a readable hold, with language-correct shaping. Static whole sentences, mechanically split characters/words and a font-only substitution do not satisfy this gate. Inspect every caption group's entrance/emphasis/hold and continuous audio-aligned playback under the [visual protocol](b5-visual-acceptance.md#every-caption-group-must-pass-in-every-language). Keep the default treatment otherwise; an override does not waive sound, local-picture motion or visual acceptance.

Sample voice credits are not requirements: the Spider-Man example uses **The Pharaoh 3** through the owner's selected service; the Jensen example uses **The Pharaoh 3** through **AI33**; Crazy Mei B5.2 uses **Claire**. Do not infer an unrecorded provider from a voice name. Use the user's selected available route, help configure it if needed, and preserve accepted audio. These credits do not authorize paid generation or force another Agent to use the same platform.

When production of the current film is authorized, render all frames with `--all`, then encode a **candidate**, extract its review evidence and accept only after independent actual-media review:

```sh
node scripts/character-explainer.mjs frames /absolute/new-project --output /absolute/new-full-frames --all --trusted-code
node scripts/character-explainer.mjs encode /absolute/new-project --frames-dir /absolute/new-full-frames --audio /absolute/approved-final-mix.wav --output /absolute/new-candidate
node scripts/character-explainer.mjs review-pack /absolute/new-project --candidate-dir /absolute/new-candidate --output /absolute/new-review-evidence
# A separate reviewer now inspects the extracted evidence AND complete candidate,
# then writes an honest review.json; never generate preset passing observations.
node scripts/character-explainer.mjs accept /absolute/new-project --candidate-dir /absolute/new-candidate --evidence-dir /absolute/new-review-evidence --review /absolute/review.json --output /absolute/new-delivery
```

`encode` verifies frame/project fingerprints and audio duration, then writes the MP4 and `candidate.json` with `status: pending_visual_review`; it does **not** write `delivery.json`. Its optional `--approval-note` is only truthful provenance for an actual request/approval, never a visual pass. `review-pack` extracts six phase frames and a silent left-stage continuous clip for every main action, plus each caption unit's before/reveal frames, emphasis peak/settle samples and each group's continuous caption-region clip with audio, from that exact MP4. The reviewer checks actual entrance/emphasis/hold in playback; sample names cannot certify the animation. The complete film also needs actual playback and listening. A separate human or Agent records observed results using the [review schema](b5-visual-acceptance.md#review-record-and-binding).

`accept` requires complete evidence, matching candidate/project/plan/transcript/review hashes, observed passing results for every action and caption group, at least one actual bundled-baseline comparison, full-film review and no blocking issues. Action intervals cover the entire film; semantic reveal units cover every source word exactly once and in actual-voice timing. Missing, unknown or failing results keep the candidate pending. Only a passing `accept` creates `delivery.json` with `status: visual_review_passed` and `user_acceptance: not_inferred`. Keep candidate/evidence/review/delivery files outside the project so they cannot alter its fingerprint; `review.json` is external too. Record the final user's actual response separately; prior face/script/preview approval does not imply it. Changes invalidate the old evidence and review. Commands refuse output overwrites; no command mixes audio or manufactures approval. Use `--help` for exact commands. Generic `autopilot preview/render` is deliberately not used for this code-authored route.

Deliver an accepted MP4 with its preview and verified absolute project/delivery folder link, short QA record, independent review status, actual user-acceptance state, source/rights ledger and checkpoint. A pending candidate may be shared for review only when clearly labeled pending with its missing/failing checks; do not call it accepted delivery. Never publish the user's project, portrait or private audio without separate authorization.
