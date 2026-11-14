# B5 worked example: an interrupted reader

This is a **silent, stage-only mechanism example**, extracted from the locally produced V5 dog-lap revision. It is a concrete ten-second case, not a universal B5 template or a promise that a new script will succeed on its first render. The original user has not accepted V5 as the final visual standard.

The example keeps the anonymously drawn reader, dog, book, chair and causal animation. It omits the private Kaomei presenter, paid narration, speech-driven mouth, captions and Foley. It does not replace B5’s CrazyMei + Spider reference standard or the new-story authoring and independent review workflow. Portrait layout is not included or validated.

## Run

From the Skill root, install its pinned dependencies once:

```sh
npm ci
node examples/b5-causal-interruption/verify.cjs
node examples/b5-causal-interruption/render-demo.cjs --output /tmp/b5-causal-interruption/demo.mp4
```

Requires Node >=20, the Skill’s pinned Sharp dependency, and `ffmpeg` / `ffprobe` on PATH. No network, browser, model account, font installation or paid call is used during verification or rendering. Run from any working directory by replacing the script path with its location. The script refuses to overwrite a video or place generated video inside this source example. The MP4 is 1920×1080, 30fps, 300 frames, ten seconds and **has no audio stream**. A technical probe/hash report is written beside it.

## What to study

Read [action-cards.md](action-cards.md) and then `pose`, `bookPoint`, `dogPoint`, `cameraForTime` and `events` in [stage.cjs](stage.cjs). Preparation, a short fast action and slower readable consequence use unequal durations. Contact is computed from shared targets rather than separate drifting drawings. The opening impact propagates to the body, chair, paper and bookmark at staggered delays. A later chin contact occupies the reading hand: a failed attempt to lift the still-held book causes the other hand to put it aside before petting. The scene retains this changed state.

The BEFORE and AFTER cuts are explicit framing changes. Those cuts and the title animations are not counted as character action. At the opening recoil peak, paper intentionally crosses the face. See the actual image sequence before deciding whether that occlusion works for your story.

## Replace the story

Keep the mechanism, not the dog gag. For a new script, identify an occupied task, a motivating interruption, what physically contacts what, and the changed situation that drives the next action. Write new action cards **before** implementation; specify support, ownership, extreme poses, phase times, paths, different easing, delayed materials and result holds. Use that story’s actors, props and purpose. Do not carry over the dog, lap, book, camera cuts, fixed event times or ten-second duration by default.

Bind a new story’s actual approved narration and semantic caption groups through the main B5 workflow. Author a native layout for its ratio, an independently approved presenter, and story-specific sound. Adapt time to the voice; do not stretch approved audio to this case’s clock. `renderer.cjs` is deliberately a stripped silent wrapper, not a drop-in replacement for the B5 production renderer, production metadata or preview gate.

## Provenance and limits

[source-manifest.json](source-manifest.json) records the exact source and SHA-256 of every included runtime asset. `stage.cjs` is the V5 authored code, unchanged. Paper is byte-identical to the already bundled B5 example paper. The five raster title masks were rendered in the V5 project from the already bundled Anton font; its SIL Open Font License is preserved in `assets/Anton-OFL.txt`. No other external imagery or private presenter identity is distributed here. The source code remains under the surrounding Skill’s distribution terms; this case adds no broader asset license.

[verification.json](verification.json) records the actual local run. Dense geometry, source fingerprints, output probing and any keyframe views are bounded technical or still-image checks. They do not prove continuous visual quality, anatomy, pacing, reference equivalence, audio quality or acceptance by the user. No complete playback or listening pass is claimed. The environment props are contextual drawing; their presence is not evidence of richer animation.
