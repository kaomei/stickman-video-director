# B7 · Native portrait layout and short captions

Read this whenever making B7 in **9:16**, alongside the [B7 style contract](b7-pixel-theater.md) and [per-film review gate](b7-review.md). Keep the approved pixel character, causal acting and story-led sound. Portrait needs its own authored stage and caption segmentation before rendering.

## Approved reference and its scope

Inspect the internal [Fast Forward portrait V3 — 10 seconds](../assets/b7/approved-portrait/fast-forward-portrait-v3-10s.mp4). The user accepted this exact preview's native layout and short-caption treatment on **2026-11-13**. It is 1080×1920, 24 fps, 10.000 seconds; SHA-256:

`b0aa0e97c3b74dbccc79b8cde042efaf25e98e98273e78a55be7485524345a8b`

This is an internal production reference, not an additional README showcase. Its approval covers the shown portrait composition and short subtitles. Do not describe it as a complete portrait story, a new full-film watch/listen, or approval of a full story's acting, sound, reflective ending or platform safe areas. The complete 16:9 Paths V6 / Fast Forward V11 references retain their existing authority for story, motion and audiovisual finish. Every new portrait output still needs its own actual-MP4 review.

## Recompose the pixel stage

- The accepted reference uses a **180×320 logical canvas**, drawn on an integer pixel grid and enlarged **6× with nearest-neighbor** to 1080×1920. Another output size may use a suitable coherent grid and integer enlargement; preserve the approved pixel vocabulary rather than smooth, stretch or squash it.
- Reauthor the scene, actor positions, props and shot framing for the tall stage. Preserve white-C identity, line weight, head/body proportions, fixed bones and attached small accessories. The sample's bedroom, meeting and station are native arrangements, not crops of a landscape video.
- Place button and clock **one above the other** when that arrangement explains the same trigger and passing-time consequence. Reposition the actor and scene around the focal action. Retain the hand/cursor's exact contact with the control and a readable response; do not merely move a control while leaving its contact target behind.
- Preserve purposeful framing and action variety through a new story. Do not count a wide source cropped to 9:16, a landscape frame fitted into a tall background, stretched pixels or extra decorative idle movement as native recomposition.

The accepted 10 seconds is a layout reference. It does not waive the principal-action, geometry/contact or full-story review gates, nor require every future shot to copy its objects or positions.

## Hard subtitle width and type limits

Use **one line**, short semantic groups and deliberate side space automatically; the user should not have to ask for a shorter subtitle bar again.

| Check | Required result |
| --- | --- |
| Preferred length | Target roughly **60%** of the frame width; choose the spoken semantic group before measuring. |
| Maximum actual drawn width | **65%** of frame width, including glyph bearings and the complete shadow/outline. |
| Clear horizontal margins | At least **17.5% on each side**, measured to the drawn glyph/shadow bounds; total width alone does not prove both margins. |
| Horizontal centering | Center the drawn glyph/shadow box. Its center may differ from the frame center by at most **half one logical pixel**, or `integer_scale / 2` final pixels, to allow integer-grid rounding. |
| Type | Preserve the selected pixel font, glyph size, aspect and weight. Do not shrink, horizontally compress, drop the shadow or silently change font to make a long line pass. |
| Measurement | Measure the real rendered font, scale and language for every cue. Character count, word count and Latin-font estimates are insufficient. |

In V3, the maximum actual drawn width is **110/180 logical pixels (61.1%)**, including shadow; centered placement leaves **35 pixels on each side (19.4% each)**. At its final 6× output these are **660/1080 pixels**, with **210 pixels per side**. The 60% target and 65% hard cap provide deliberate natural side space; a centered line at the hard cap still leaves 17.5% per side. A 65% cap on the logical grid is 117 pixels; the sample renderer uses a conservative 116-pixel limit. Its 7-row pixel glyph size is unchanged from the preceding preview. These measurements explain the accepted result, not permission to fill every subtitle to the maximum. Store all gate `bounds`, `drawn_width` and `safe_width` values in **final output pixels**; logical measurements here only explain the reference construction.

Chinese and other languages obey the same width/margin limits. Use an appropriate licensed pixel font or explicit glyph map with full coverage, then measure its actual bearings, advance and shadow. Record a deliberate user font override. Missing glyphs, ordinary-font fallback or smaller text must not be silent fixes. If an indivisible name/phrase still cannot fit, resolve the project layout or a deliberate user choice and record the limitation; do not quietly break its core words.

## Fast changes follow the voice and meaning

Keep the original approved spoken text and recording. Segment by actual VO timing, pauses, clauses and readable idea groups, with shorter portrait groups where the speech allows them. Do not impose a fixed word count, mechanically split by duration, omit/repeat words or move the recording to fit subtitle cards. Check neighboring cards for continuity as well as each card alone.

Keep names, numbers/units, short phrasal verbs and essential noun/verb groups intact. In particular, preserve **`fast-forward button`** as one core noun phrase. For this opening the user chose short captions and side space, accepting the light lead-in on the preceding card:

| Actual encoded time | Accepted text |
| --- | --- |
| 0.00–0.94 s | `You were born with a` |
| 0.94–1.92 s | `fast-forward button` |
| 1.92–2.36 s | `floating` |
| 2.36–3.30 s | `above your head.` |

This deliberate carryover preserves all original words and the complete noun core while avoiding a wide `with a fast-forward button` bar. Do not flash `with a` alone for about 0.3 seconds or make every light preposition/article its own card. Do not generalize the example into a rule that every caption must end at the same grammatical position: choose the least disruptive spoken boundary that satisfies the current layout and reading time. Check actual onset/offset and leave enough reading time; “fast changes” does not justify fragment flicker or subtitles lagging behind the voice.

## Vertical placement and platform overlays

The reference reserves a high-contrast bottom band at logical **y=257–277**, with glyph top **y=264** on the 180×320 canvas. Those coordinates are a composition example, not a universal platform-safe placement. Independently inspect the intended platform's controls/captions, bottom navigation, avatar and other overlays at phone size. Move/recompose the band when required while preserving the width, type and meaning rules. Keep scene action, controls and important labels readable during motion and contact, not just in one still.

## Evidence before claiming completion

For every portrait plan, include the following `portrait_layout` structure. `logical_canvas` describes construction; every rectangle and caption width is in **final encoded output pixels**, not logical pixels. Bounds use `left`, `top`, `right`, `bottom`. Set values from actual project measurements rather than copying this placeholder:

```json
{
  "portrait_layout": {
    "native_recomposition": true,
    "recomposition_evidence": "Project source/layout-board path and concrete native staging changes",
    "logical_canvas": {"width": 180, "height": 320},
    "integer_scale": 6,
    "resampling": "nearest-neighbor",
    "caption_safe_area": {"left": 189, "top": 1542, "right": 891, "bottom": 1668},
    "caption_measurement": {
      "font": "Actual font/glyph-map identifier and scale",
      "method": "Actual rendered glyph-and-shadow bounds measurement",
      "includes_shadow": true
    },
    "required_action_regions": [
      {"beat_id": "actual-beat-id", "bounds": {"left": 300, "top": 600, "right": 780, "bottom": 1450}}
    ]
  }
}
```

Record concrete `recomposition_evidence` identifying the project source/layout board and native staging changes. The logical canvas multiplied by `integer_scale` must equal the actual probed output size on both axes. Cover **every beat ID** in `required_action_regions`, with the region needed to understand that beat's real action/control/response. Every caption entry also requires `line_count: 1` and `bounds` covering its actual rendered glyphs **and shadow**. During any time overlap, its box must not intersect that beat's required action region. Record further timed regions in project QA if a changing shot needs them; a convenient small declared region cannot replace inspection of the actual action. The example safe band is not proof of platform-safe placement, and these numeric action bounds are schema illustrations, not measurements of the approved clip.

For every caption, save text, actual VO-aligned start/end, font/language/scale, rendered glyph-and-shadow `bounds`, `drawn_width`, `safe_width`, frame width and left/right clear margins, all in final output pixels. Check ordered nonoverlapping times, complete original wording, the ≤65% / ≥17.5% limits, centering error ≤`integer_scale / 2`, safe-area containment and time-overlapping action-region clearance mechanically where possible. Centering error is `abs((left + right) / 2 - frame_width / 2)`, measured on the complete drawn box. Inspect actual burned-in frames around transitions and replay at normal 1× speed to judge meaning, sync and small-view readability. A width declaration, contact sheet or no-wrap result alone is insufficient. These portrait fields are not new required fields for an unchanged 16:9 plan.

The reference manifest keeps `validated_formats: ["16:9"]` for the approved **complete-film** benchmarks; its separate `portrait_layout_reference` records this exact 10-second scope. Preserve that distinction when describing readiness or approval.

Review the **new encoded MP4** against both the portrait composition reference and the complete-film B7 motion/sound benchmarks. Full-story completion still requires the whole action/contact/state ledger, real-speed picture review, actual listening, rights and ending checks in the [B7 gate](b7-review.md). Keep unavailable review pending and report its limit honestly. Reuse approved picture/voice/assets by fingerprint for local subtitle edits; do not regenerate unrelated material or infer approval of a new output from the reference's scoped acceptance.
