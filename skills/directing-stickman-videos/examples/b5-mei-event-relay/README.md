# Approved Mei event-relay stage source

This is the actual left-stage code snapshot associated with the approved 11.37-second phone/coffee relay film, SHA256 `de2d3b0e22ddebb213d9b58cb787479ad5c53f96f87b80d17542c6bcf894aa9b`. Read it beside the [exact approved film](../../assets/b5/local-baselines/mei-event-relay/approved-sample.mp4) and [filled scene example](../../references/b5-mei-filled-example.md). It demonstrates execution of the relay grammar; its phone, coffee, words, timings and landscape coordinates belong to this example and must be reauthored for a new topic or ratio.

`stage.cjs` and `mei-reference-rig.cjs` are unchanged copies, not newly invented example choreography. Their SHA256/byte counts match the original source fingerprints in `source-frame-ledger.json`. All 341 existing source PNGs matched that ledger; 12 fresh full-composite rasterizations using the original renderer/environment also matched their original PNG hashes. `provenance.json` binds those records to the matching approved MP4 and existing approval record. This is a locally verified source/receipt chain; no fresh byte-identical MP4 rebuild is claimed.

## Read the mechanism in the code

- `opening` gives the large phone the stage. It moves in, then lights and receives a timed alert burst; the visible state has changed.
- `look` briefly brings in the ordinary actor, then clears that body before independent large eyes take over. `eyePair()` keeps eye contours, pupils and their direction toward the phone; those visible features make the explanatory graphic readable without stretching an ordinary body.
- `reach` replaces the previous composition with a desk slice and dominant hand close-up. `hand()` joins distinct fingers and a palm through a narrower wrist into the long forearm/sleeve-side contour. `cup()` retains its elliptical rim and handle through tipping and enlargement. The cup moves only after fingertip contact; the actual shapes carry the event.
- `spill` clears the desk and carries the same cup into an enlarged consequence. The splash becomes the next main visual, with an entry, expansion and readable result.
- `timeline` replaces the physical context with before/after comparison, a rewind cue and a directional arrow. The graphic performs the explanation; ordinary people do not have to keep acting in the background.
- `chain` stages the phone, eyes, hand and spill one after another, then connects and underlines the sequence. Context yields to the next dominant object instead of accumulating around an idle central actor.

Each function has its own active time window, local easing/keyframes and explicit clearing or handoff. Windows overlap to transfer attention; they do not keep the same desk/actor on stage for the whole narration. Details follow the main action and result. The ordinary actor uses the uniform Mei rig (`headRadius:60`, arm `86+84`, leg `80+80`, body stroke `18`); graphic hand/eye close-ups are separate objects, not stretched ordinary limbs. Timing includes purposeful reading holds and is not a rule to move every second.

For a new shot that still represents a close-up of the same body, prefer a consistent transform or crop of its established drawing components and pose geometry. Retain the minimum connections that actually read as anatomy—such as shoulder/neck, palm/wrist or a bent joint. An isolated thick right angle or triangular support can read as furniture; a red circle, heading or small whole-person inset cannot repair that main silhouette. Let semantic clarity decide the crop: keep whatever body context the action needs, without requiring the whole figure to remain in every shot. See the [filled example's picture-reading notes](../../references/b5-mei-filled-example.md#what-the-pictures-preserve-and-reveal) for how recognizable cues support a change of leading visual.

## Run the source study

From the Skill root, with Node and no extra package dependencies:

```sh
node examples/b5-mei-event-relay/verify-example.cjs
node examples/b5-mei-event-relay/render-frame.cjs 5.2 work/mei-stage.svg
```

Create the output directory first if it does not exist. The render wrapper writes the actual source stage onto a flat 1920×1080 paper-color SVG; it does not reproduce the film's textured paper, captions, Kaomei, audio or full compositor. It accepts source times `0` through `340/30`. The module API remains `require('./stage.cjs').scene(t)` with `events` and `NORMAL` exports.

The exact film's recorded user approval concerns its visual relay direction. It does not certify a cold start, a new script, independent normal-speed audiovisual review, publishing permission or success from merely copying this file. New work still needs its own source-based event plan and actual continuous review. Reuse the way dominant visuals enter, change, yield and hand off; design the objects and semantic sequence for the new narration.

`new-story-stage.cjs` is a separate neutral authoring starter for new projects. It supplies `scene(t)` (`draw` compatibility alias) and small composition/tween/transform helpers, with no preselected subject, actor, gag, setting, event quota or type mix. Its unimplemented scene throws an explicit authoring error until the current story is written; it cannot quietly render a copied Spider scene or claim an empty stage is finished. The original approved `stage.cjs` and rig above remain unchanged and are mandatory mechanism reading, not automatic choreography to copy.
