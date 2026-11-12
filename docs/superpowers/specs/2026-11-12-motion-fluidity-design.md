# Editorial continuity: cuts, captions and sound

The user requested smoother generated videos, then clarified the symptom as abrupt cuts, subtitles or sound-effect transitions. This scope replaces the initial motion-interpolation hypothesis. No interpolation algorithm or accepted B5 rig/asset is changed. Preserve all previous doctor/fingerprint/onboarding work and approval/asset checks.

## Implementation

- Correct cached shot frame ownership using ceil-based sample boundaries consistent with exact-time shot selection. Verify actual encoded frame count/rate rather than silently inserting/dropping frames.
- Add an authored incoming-shot `transition: {type: dissolve, duration, reason}`. Default cuts stay intact. Limit it to 1 frame–0.3 seconds and at most half either adjacent shot; reject a first-shot or unmotivated transition. Blend the preceding last actual picture frame with the incoming picture, then draw the current caption once. Keep local-motion diagnostics isolated so dissolves cannot substitute for acting. Bind the preceding shot/media to transition cache identity.
- When deriving phrase captions from actual words, bridge gaps up to 120ms only for an unfinished phrase. Never advance the next cue, erase sentence-ending pauses (including Chinese punctuation/closing quotes), distribute word timestamps or alter supplied captions automatically.
- Default file-backed clip edges to 3ms in/5ms out, capped to half the clip. Preserve explicit fades including zero, and schedule preview fade-out on the full clip envelope rather than the preview boundary. Apply bounded 2ms/5ms zero-ended envelopes to procedural SFX. Do not revoice, time-stretch or rewrite source files; authored ambience overlaps/fades and deliberate AUDIO CUT remain story decisions.
- Update editorial authoring guidance: use cuts for action/contrast; short dissolves only for intentional scene/time bridges, semantic captions without gratuitous per-cue fades, and planned audio continuity. No blanket dissolve or new approval gate.

## Acceptance

Real encoded cache regression at a non-grid cut; valid dissolve intermediate pixels and caption/seek stability; transition cache invalidation; SRT/VTT from valid caption timing; actual decoded anti-click edges and preserved explicit hard edges/preview timing/source hashes. Preserve existing B4 opening/style rules and preview approvals. Render a same-FPS before/after diagnostic with synthetic tones, not an accepted user film. Run full runtime/document/asset checks and fresh review; no live user-film/provider aesthetic acceptance is claimed.
