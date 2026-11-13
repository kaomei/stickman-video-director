# B1–B3 · Native portrait composition and acceptance

Required for **B1, B2 and B3 when height exceeds width**, alongside the selected style and [reference-effect protocol](b1-b2-b3-reference-acceptance.md). Keep each style's drawing, acting, pacing, captions and sound. This contract repairs phone-size typography, native composition and review; it does not turn these styles into B4 poster openings or require caption micro-animation. Restrained, stable semantic captions remain appropriate.

The package includes three **user-approved 10-second native portrait effect references** (2026-11-13). These are internal Skill baselines, not additional README showcases:

| Style | Exact approved clip | Fingerprints and scope | What to preserve |
| --- | --- | --- | --- |
| B1 | [Native portrait, 10s](../assets/b1/portrait-approved-2026-11-13.mp4) | [Manifest](../assets/b1/portrait-approved-2026-11-13.json) | Slender fine-line Ryan artwork, near-white faint grid, handwritten hierarchy and semantic sequential reveals |
| B2 | [Native portrait, 10s](../assets/b2/portrait-approved-2026-11-13.mp4) | [Manifest](../assets/b2/portrait-approved-2026-11-13.json) | Original warm paper, irregular fine ink, colorful illustrated world and story-led small actions |
| B3 | [Native portrait, 10s](../assets/b3/portrait-approved-2026-11-13.mp4) | [Manifest](../assets/b3/portrait-approved-2026-11-13.json) | Original dark field, refined white/gray artwork, local action and restrained CRT finish |

The user's acceptance covers these exact clips and their effect, including the revised B1 sequential build. It does not approve unseen full films, future outputs, every platform interface or unperformed independent playback/listening. Keep that human acceptance separate from technical diagnostics and independent production review. The original landscape references remain valid style/source evidence; preserve their media and original-rate audio. A new engineering fixture, preset or successful export never inherits the samples' acceptance.

## Plan the phone composition before rendering

Use a 1280-unit-wide design plane with height `1280 × outputHeight / outputWidth` (about 2275.56 for 9:16). Uniform output scaling preserves proportions; merely changing width/height or shrinking an entire landscape scene does not create a native composition.

For each shot, state the portrait intent: what the eye reads first, where the principal action/contact fits, how a diagram or comparison is regrouped, and where captions can remain readable. Author vertical staging, viewpoint and local paths for this story. A closeup, stacked relationship or deeper scene is an option, not a compulsory template. Preserve the full meaningful action through anticipation, contact, result and settling, with enough room for hands, feet, props and essential text.

**B1 sequential staging is part of the approved effect.** Let the viewer follow the sentence's cause or information order: reveal the relevant heading, timeline/diagram parts, prop states or alternatives when their meaning arrives, then leave the result readable. The approved clip's timeline, cards, transfer arrow and final 1→2→3 build demonstrate this process alongside small head/hand/prop action. A portrait redesign that shows every element together and retains only a final wobble loses that process even if the final frame looks correct. Design the sequence for the new story; Ryan's plot, asset count and exact times are not a reusable storyboard. Do not stagger unrelated decoration to satisfy a count or erase the final settling time.

B2 and B3 keep their own motion and editing language. B2's contextual prop/information changes and restrained reactions must retain its warm illustrated world; B3's supported local action, progressive relationships and clean silhouettes must survive its television finish. A ratio change must not replace either with B1 line art, a generic poster, or stronger global effects. Review the complete semantic action, rather than requiring constant raised arms or continuous limb cycling.

For B3, also apply the [semantic-line and purposeful-motion contract](b3-semantic-motion.md): re-author each connector from its actual source to target after the portrait layout changes, preserve its meaning/direction and readable reveal order, and check the whole path at 1× phone size. Local-anchor geometry and safe boxes cannot prove that the intended object is identified correctly or that the final CRT/overlap/caption placement leaves the connection intelligible. Include every event/graphic and the complete visible inventory in independent review; do not reuse landscape review as portrait acceptance.

The `b123-native-portrait-v1` preset uses these **portrait-only** caption defaults:

| Style | Typeface and weight | Design size | At 320px display width | At 360px display width |
| --- | --- | --- | --- | --- |
| B1 | Project hand font; bundled OFL Caveat fallback, weight 600 | 64 | 16px | 18px |
| B2 | Bundled Noto Sans 500; dark ink, compact ivory label | 72 | 18px | 20.25px |
| B3 | Bundled Noto Sans 600; clean white, uppercase where applicable | 64 | 16px | 18px |

These are engineering starting sizes and minimum readability safeguards, not an aesthetic acceptance claim. **The approved B1 portrait uses the macOS Chalkboard font (renderer alias `Hand`) for scene text and 64-unit captions.** B1 portrait therefore uses the existing hand-font slot for captions: the supplied `project.font`, configured `AUTOPILOT_FONT`, or bundled Caveat. An explicit `captionFont` takes precedence; a restyle still needs the normal genuine `caption_override` approval. Preserve the accepted handwritten treatment when continuing that project; do not silently render Noto and claim the exact approved appearance. Apple system font files are not redistributed. The bundled OFL Caveat is a licensed handwritten fallback candidate, not a pixel-identical or pre-approved substitute: inspect its glyphs, widths, hierarchy, fit and actual phone-size output before calling it comparable. For another script, select a licensed font with the required glyph coverage and equivalent handwritten/readable hierarchy. Keep the original accepted clip unchanged; a fallback's licensing or successful load does not establish visual acceptance. A genuinely user-approved portrait caption override remains within **64–96 design units** (16–24px at a 320px display width); a language fallback alone does not authorize a size change. The B2 label uses proportionate padding and a readable shape. Higher export resolution alone does not improve type displayed at the same phone width. Do not squeeze letters or shrink long speech to fit: regroup it into successive semantic cues at actual spoken boundaries, retaining complete phrases and reading time. A necessary language fallback must cover the actual script and retain the ratio-specific size and equivalent hierarchy. Scene headings use their own authored hierarchy and glyph coverage.

Landscape remains B1/B2/B3 **34/40/34** design units with its existing treatment. Do not retroactively restyle accepted landscape projects or infer portrait approval from them.

## Declare safe space and every focal region

Default safe-area fractions are **left .06, right .12, top .08, bottom .18** of the native stage. They reserve space for likely phone interface overlap; they are an engineering starting point, not an official guarantee for any platform, account, device or current interface. Record and check the actual target platform. A project may supply its own `portrait.safe_area`; omitted sides retain defaults. Allowed fraction ranges are left .04–.30, right .08–.30, top .04–.30 and bottom .12–.30, with each opposing pair totaling no more than .50. These are engineering guardrails, not platform-certified margins. Custom placement must retain readable type, meaningful visible action and the review requirements. Redesign space before reducing readability or claiming an interface cannot overlap it.

Use a project-level `portrait` configuration for safe-area customization, and register a native descriptor on **every** shot:

```json
{
  "portrait": {
    "safe_area": {"left": 0.06, "right": 0.12, "top": 0.08, "bottom": 0.18}
  },
  "shots": [{
    "portrait": {
      "intent": "The focal action sits below the heading; its complete prop path remains visible above the separate caption band.",
      "background_ids": ["scene-background"],
      "regions": [{
        "id": "focal-action-region",
        "role": "prop",
        "layer_ids": ["focal-prop"],
        "region": {"x": 200, "y": 500, "w": 750, "h": 1100},
        "intent": "Frame the prop and its complete local movement, including the held result."
      }]
    }
  }]
}
```

This is a descriptor excerpt, not a complete project, approved wording or reusable scene layout. Use concrete story-specific intent and actual measured regions. Coordinates are design-plane units. Region roles are `actor`, `prop`, `information` or `contact`. A contact region should contain the relevant interacting body/prop parts, not just a decorative nearby box. Regions must remain inside the computed picture-safe bounds, with their bottom no lower than `caption.band_top - 24`. The preset centers captions at the safe rectangle's bottom minus `font_size × .75 + 16`; `band_top` is that center minus `font_size × .5 + 18 + 48`. These margins separate picture action from the caption footprint, including the B2 label.

Every layer, including groups and backgrounds, needs a stable distinct ID. Use 1–96 ASCII letters, numbers, underscores or hyphens, starting with a letter or number; shot and region IDs follow the same form. Every rendered leaf other than an explicitly registered scene background needs coverage by a region's `layer_ids`. A registered group can cover its descendants; every motion-bearing layer must also be covered. `background_ids` is optional and may exclude only genuine scene background artwork. Actors, props, diagrams, important text and their motion cannot be relabeled background to avoid checks. Scene background artwork may fill the native frame; meaningful subjects, text and complete action paths belong inside the registered safe regions.

The runtime checks declared coverage, bounds and painted visibility/action. Each intent must describe the actual native decision (at least 12 characters); it is not a placeholder approval statement. Metadata alone cannot establish a good composition or physical contact. Inspect the actual encoded frame and continuous shot, including paths between keyframes, cropping, overlap and final visibility. Intentional framing must not clip the information that makes an action intelligible. In B3, inspect the difficult interaction cleanly before applying the television finish; scanlines and bloom cannot substitute for visible action.

The bounded paint diagnostic checks isolated artwork against its declared region and safe bounds at sampled key/visibility times and 0.25s intervals. It also checks whether each member contributes distinguishable pixels to the full composition. A hand passing across a same-color body or briefly behind a prop may naturally lose that contribution; temporary complete overlap is recorded as sampled occlusion rather than rejected automatically. Do not invent `alpha`, `from` or `to` changes to conceal natural overlap from the diagnostic. A member that never has a distinguishable full-composition contribution in its submitted visible scope still fails; a future-only member in a prefix remains unverified. Sampling is not an every-frame guarantee. Neither an occlusion record nor one visible sample proves that a key gesture, grip, contact or result is readable. The independent phone-size continuous-action review must judge those moments and reject any overlap that hides the information needed to understand the action; diagnostic success cannot supply an aesthetic pass.

## Review the actual encoded video at phone size

The generated reference plan includes a `portrait` object only for portrait projects. It binds the corresponding accepted video (`b1-native-portrait-2026-11-13`, `b2-native-portrait-2026-11-13` or `b3-native-portrait-2026-11-13`) as a required comparison alongside the existing source/style references; play the actual clip and compare the relevant mechanism. Its independent review template adds **`review.portrait_viewing`** and every shot's **`portrait_checks`**. Templates start `unknown`; do not fill passes from manifest metadata, rendered files, the historical user's acceptance or this preset.

The same independent reviewer must actually watch the complete submitted encoded scope at **1× speed** in a **320–480px-wide** phone-size viewport, preserving the native aspect ratio (`display_height` matches that ratio within 1px). A real phone or a faithful desktop simulation is acceptable; record which was used. A full-size desktop frame, zoomed crop or contact sheet is insufficient for phone readability or continuous action review.

`portrait_viewing` must record:

- `status: "pass"` only after inspection; actual `display_width`, corresponding `display_height`, `playback_speed: 1` and a concrete target `platform`.
- `real_device: {checked, limitation}`. `checked` is a real boolean; when false, explain the simulation/device limitation rather than claiming a real-device test. Recheck the real target platform before claiming its interface is clear.
- `viewed_ranges: [{start, end}]` covering the entire encoded scope with no omitted opening, body or tail.
- Concrete timed `observations` citing `source-video`, with an `aspect` for each of `caption_readability`, `scene_legibility`, `action_contact` and `platform_occlusion`. Record what remains readable, what actually moves/touches and where the platform could cover it. “Pass” and file names are not observations.

Each `review.shots[]` also requires all four **`portrait_checks`**: `native_composition`, `caption_readability`, `action_visibility`, `platform_safe_area`. Each must pass with in-shot timed observations citing that shot's own continuous audible evidence clip. Check every caption in its actual scene, not just an attractive opening. A simulated phone check must disclose that limitation in the actual review; it cannot prove every real-device or interface state.

These portrait requirements remain mandatory in both `sample_target` and `limited` capability modes. Tool limits do not waive readable captions, meaningful visible action or safe-area review. The normal style checks, reference comparisons, actual mix listening and real user approval remain separate. The CLI verifies the current files, scope, coverage and record structure; it cannot authenticate the honesty of playback or automatically judge aesthetic equivalence.

## Revision and handoff

If a phone-size check fails, repair the affected layout, semantic grouping, glyph font, region or local action and render fresh evidence for that scope. Preserve valid audio/artwork and unrelated accepted shots. Regroup speech before shrinking type; recompose staging before concealing an essential action behind captions or interface controls.

Keep technical diagnostics, independent style/portrait review and the user's acceptance distinct. Until actual review passes, report the export as a candidate with outstanding findings. The approved internal clips establish bounded effect references, not a pass for a new output. An updated contract or synthetic test grants no generation, installation, public sync or Release authority.
