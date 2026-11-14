# B5 first preview: default execution

Use this route for an ordinary requested B5 preview, including a 10-second first-install preview. Keep the approved effect standard; keep the acceptance work proportional to the preview.

## Read the actual reference once

Before composing this story:

- Read the [latest approved filled Mei example](b5-mei-filled-example.md).
- Watch its [exact approved relay film](../assets/b5/local-baselines/mei-event-relay/approved-sample.mp4), then read its [stage source and Mei rig](../examples/b5-mei-event-relay/README.md).
- Read the [verified original Mei prompt](b5-mei-original-prompt.md) and use the [Mei scene template](b5-mei-scene-template.md).
- Use [CrazyMei + Spider](b5-accepted-baselines.md) as the drawing/action quality standard in both 16:9 and 9:16; apply the [directing structure](b5-crazymei-directing-structure.md) and [motion contract](b5-left-stage-motion.md).

These are effect references, not footage to copy into the new story. Note the relevant mechanisms briefly in the current scene plan; a separate structured reference-study report is not required for a normal preview. Existing actual reference observations may be reused within the same production.

## Make the requested candidate

1. Preserve the user's words, requested duration/native ratio, accepted identity and existing approved narration. Do not regenerate audio or assets without need or expand paid authorization.
2. Fill the current-script scene plan using **Voiceover / On-Screen Text / multi-step Animation Action / SFX**. Let one meaningful lead visual hand off to the next. Avoid a long acted tableau with added arrows or jitter. Preserve ordinary figure proportions; use physical phases for actual physical actions rather than inventing a collision for each beat. Choose the ending from the current meaning, not unused seconds: continue the supported action/result or next semantic handoff. A comparison needs a real explanatory purpose; never append a side-by-side recap or summary just to fill the requested duration. Keep the approved speech at its original speed.
3. Initialize an external project. [Draw the needed objects, visible states and key contact poses before tweening](b5-left-stage-motion.md#draw-needed-states-before-tweening), then author the native layout and stage actions, align semantic captions to the actual speech, and complete the production manifest/mix. This is part of ordinary authoring, not a separate asset-library project or approval stage. Default init copies the [executable B5 art kit](b5-art-kit.md) into `scene/runtime/b5-art-kit.cjs`; the neutral stage imports it. Reuse its source contours, complete poses, safe-fit and endpoint handoff functions instead of redrawing those mechanics. Add only drawings the current meaning needs. The neutral stage contains no story choreography. The historical scaffold is inspection-only.
4. Run technical validation, render the authored frames, then encode an **internal candidate**. Rendering and encoding do not establish visual quality or user approval.

```sh
node scripts/character-explainer.mjs validate /absolute/project
node scripts/character-explainer.mjs frames /absolute/project --all --trusted-code --output /absolute/new-frames
node scripts/character-explainer.mjs encode /absolute/project --frames-dir /absolute/new-frames --audio /absolute/approved-mix.wav --output /absolute/new-candidate
```

Inspect local scene code before executing `--trusted-code`. Keep output directories fresh and outside the project. Keep normal asset/font/audio/frame integrity checks; no pre-encode blind PNG evidence is required by this default route.

## Review the actual candidate once

Watch the actual encoded preview at normal speed with sound. In that one pass check:

- **Effect:** successive meaningful lead visuals, visible information/action changes and clean handoffs, including a semantically motivated ending; the requested richness and pace match the approved Mei relay rather than a static scene with decoration or a filler recap.
- **Drawing and contact:** stable source proportions, natural limbs/hands, readable ownership/support, clean silhouettes and safe native framing; no accidental deformation or clipped principal action.
- **Speech and captions:** original approved voice/mix, audible speech, semantic grouping and actual timing, complete correct words, readable reveal/hold/replacement and safe placement.

Use a compact note recording the actual file/version, what was watched/heard, observed issues and any remaining limitation. A second reviewer is optional unless the user explicitly requests independent review. Do not generate per-event clips, a 63-image pack, sealed readings or multiple report layers merely to document this pass.

If a defect is observed, repair that defect and recheck its affected interval plus the necessary neighboring handoff/caption transition. Render only affected frames when the renderer and frame-ledger workflow can safely preserve the unchanged ones; otherwise render a fresh sequence, but do not restart unrelated review. Rewatch the complete short candidate only when a global change makes that necessary.

Critical deformation, unclear action meaning/contact, missing speech or broken captions require repair. Cosmetic uncertainty does not justify an open-ended redesign. Do not repeatedly run cold-start tests while the user is waiting for their preview; skill regression testing is separate work.

## Deliver with truthful scope

Return the requested preview and its verified containing-folder link after the actual check and necessary repairs. Record the user’s response separately; a technical command or reviewer never supplies user approval.

If actual continuous playback or listening is unavailable, state precisely what was checked and what remains unverified. The requested preview may still be returned with that limitation; do not call it effect-matched, audiovisually passed or formally accepted. Do not replace unavailable playback with repeated whole-image audits.

## Optional strict QA

Use [formal visual acceptance](b5-visual-acceptance.md) when explicitly requested or when a stated delivery contract needs independent, evidence-bound acceptance. Its reference-study, storyboard rehearsal/plan-lock, neutral PNG first-read/seal/contextual checks, per-event clips, `preview-ready` and `accept` receipts are **not prerequisites for the default preview**. Supplying strict PNG review arguments to `encode` opts into that gate; an internal candidate still needs actual playback review.

Strict local repair may reuse individually passed unchanged evidence through `--png-revision`; never turn an earlier fail/unknown into an inherited pass. Keep strict receipts honest and do not claim the entire cold-start chain passed from a local check.
