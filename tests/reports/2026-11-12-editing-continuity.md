# Editorial continuity verification

2026-11-12 local follow-up. The user clarified that the perceived lack of smoothness concerns cuts, captions and SFX transitions. Existing doctor/canonical-fingerprint/onboarding work is retained; no assets, interpolation presets, B5 rigs or native narration files were replaced.

## Implemented and verified

- B1–B4 incoming shots support an explicit, motivated short picture dissolve. Default hard cuts remain; first-shot, unknown, oversized or unmotivated transitions fail validation. Captions are drawn once after picture blending; local-motion diagnostics do not credit a dissolve as acting. The transition cache includes the preceding shot and its image bytes.
- Frame ownership follows incoming shot starts. Tolerated submillisecond joins have no duplicated/dropped frame: tiny gaps hold the preceding last state, including explicit layer visibility end. Backward shot start order is rejected. Original source times and voice speed are not normalized or changed.
- Concat uses differences of rounded absolute frame boundaries in microseconds, avoiding both inaccurate MP4 duration estimates and per-clip rounding accumulation. Actual encoded count/rate are checked. Stress regression encodes 180 one-frame clips and verifies every timestamp; independent review additionally verified 200 segments at 24/30fps.
- Generated phrase captions bridge at most 120ms of an unfinished phrase without advancing the next cue. Sentence punctuation (including Chinese and closing quotes) and real pauses remain; supplied captions are not automatically retimed.
- Default file-backed audio edges use bounded 3ms/5ms fades; explicit fades including zero take precedence. Procedural cues have bounded 2ms/5ms edges and independent deterministic noise seeds. Full cue envelopes are retained across a preview cutoff, producing a byte-identical preview/full PCM prefix even when later cues occur first in the authored array. Source audio hashes and native narration speed remain preserved.

## Test evidence

Each newly fixed failure was observed before its correction. Fresh review found join-tolerance, microsecond-accumulation and preview-tail cases; all received regressions and were fixed. A remaining nonchronological-start case was reproduced and rejected by validation. Final review found no remaining actionable issue in scope.

| Check | Result |
|---|---|
| Complete `npm test` | 219 passed, 0 failed/skipped |
| New editorial regression cases, included above | 12 passed |
| README/common B guidance/A preservation/A6 routing | Passed |
| Real `doctor --smoke` | Passed |
| A6 offline finishing regression | Passed in the previously created temporary Pillow environment |
| Python reference tests | 20 passed |
| `git diff --check` | Passed |

## Diagnostic media

Directory: `/Users/Zhuanz/.codex/visualizations/2026/11/12/01a1ce74-315c-7403-aac0-7d9ae0ea53ec/editing-continuity/`.

The before version uses the original renderer/core/audio code from `7af3957`; the after version uses the edited runtime. Both have matching staging, synthetic source audio, four-second duration and 120 frames at 30fps. `comparison.mp4` is exactly eight seconds/240 frames: first before, then after. FFprobe/decode and hashes are recorded in `verification.json`. An encoded transition frame was visually inspected for aligned figure/picture blending and crisp current captions. The scene bridge deliberately changes the setting/prop; it is not proof that arbitrary faces/poses should be dissolved.

This is an engineering preview with synthetic tones, not a user's accepted film or an actual speech/alignment sample. Physical speaker/headphone listening, fresh Hermes execution and the user's film-specific editorial/aesthetic acceptance remain unverified. Existing films require a new render and the usual scoped sample review; no paid generation, automatic publication, approval bypass, commit or remote installation was performed.
