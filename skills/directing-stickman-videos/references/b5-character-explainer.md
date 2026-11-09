# B5 · 角色解说风 / Character Explainer

**Turn your favorite avatar into a stickman star.** Former local B6 / Animated Meme is now B5. This is a route in the existing Skill, not another installation. Select it explicitly; do not alias it to B1 or B4.

## Input and output

Accept a topic/script and a chosen or uploaded presenter. Produce a recognizable abstract cartoon head on a simple stick body, speaking at bottom right; the left stage tells the idea through energetic anonymous stickmen, oversized objects and causal physical comedy. Warm paper, dark ink, restrained red accents, large editorial titles and voice-aligned captions form one composition. This is not a realistic talking-head treatment or an abstract motion-graphics template.

Read [avatar and motion direction](b5-avatar-motion.md), [sound and acceptance](b5-sound-qa.md), the [common B sound system](autopilot-sound-system.md) and the bundled [provenance](../assets/b5/CREDITS.md) before production. Inspect the complete [approved sample](../assets/b5/approved-sample.mp4), then the [true-frame contact sheet](../assets/b5/reference/contact-sheet.jpg) and code, not only thumbnails. These assets are implementation references, not authorization to reuse a character, person's likeness, voice or account mark in any context.

## Proven capability and boundaries

- Proven baseline: the user-approved 22.8-second, 1920×1080, 30 fps Spider-Man example, with the exact accepted encoded audio. It demonstrates the layout, motion, caption and sound treatment—not a guarantee of recognition or quality for every new avatar/topic.
- The installed B5 code example and frame renderer are self-contained. The agent must author new scenes, prop interactions, timing, semantic caption groups, mouth envelope and an authorized final audio mix for each new script. The helper does not generate scripts, rig arbitrary uploaded images or buy voice/SFX services.
- This baseline is landscape 16:9. A 9:16 version needs native re-layout of stage, captions and presenter, plus a fresh preview; do not crop or squeeze the landscape output and claim a validated vertical template.
- New identity: first approve a static head/body conversion, then a roughly five-second speaking test, then the story preview. Existing approved identity and audio are reused unchanged. Static approval alone is not approval of a whole new film.

## Installed execution

From the installed Skill directory, run `npm ci` and `node scripts/autopilot.mjs doctor`. B5 additionally uses Sharp. FFmpeg/FFprobe and Node 20+ are required. Project files always live outside the installed Skill.

```sh
node scripts/autopilot.mjs init /absolute/new-project --style B5
node scripts/character-explainer.mjs check
node scripts/character-explainer.mjs frames /absolute/new-project --output /absolute/new-frame-check --frames 0,55,128,226,390,580 --trusted-code
```

`init` copies a sample-specific authored code project, its identity rig, original glyph tiles, mouth envelope, timings, reference composite and fonts. It is a **reference scaffold**, not a finished new-topic video. `check` verifies the installed baseline hashes, video/audio packets, caption word coverage and fixed-length arm geometry across every frame. `frames` executes local project code only with explicit `--trusted-code`; inspect it before granting that flag. It refuses existing output directories and records input fingerprints.

For a new story, replace the sample account mark, script/timings/glyph tiles, scenes, identity and sound plan as required. The bundled glyph atlas contains only this sample's words; rebuild tiles for new text rather than substituting blank or overflowing text. Recompute `speech-levels.json` from the approved **dry speech**, not BGM/SFX; its amplitude/word-onset mouth animation is a heuristic, not phoneme-accurate lip sync. Adapt expressions/gestures without stretching the accepted face.

After the user reviews the current preview and authorizes the full film, render all frames with `--all`, then encode with the same helper:

```sh
node scripts/character-explainer.mjs frames /absolute/new-project --output /absolute/new-full-frames --all --trusted-code
node scripts/character-explainer.mjs encode /absolute/new-project --frames-dir /absolute/new-full-frames --audio /absolute/approved-final-mix.wav --output /absolute/new-delivery --approval-note 'Record the actual user approval here'
```

The encode step verifies that frames still match the project's files and length, refuses overwrites and checks audio duration. It does not mix audio or manufacture approval. Review the encoded film's picture, captions, sound, delivery metadata and actual listening; a successful command alone is not creative acceptance. Use `--help` for exact commands. Generic `autopilot preview/render` is deliberately not used for this code-authored route.

Deliver the MP4, preview and verified absolute project/delivery folder link, with a short QA record, current approval, source/rights ledger and checkpoint. Never publish the user's project, portrait or private audio without separate authorization.
