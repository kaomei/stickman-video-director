# Editorial continuity implementation plan

> **For agentic workers:** Use superpowers:executing-plans inline with a final fresh review.

**Goal:** Improve the user-identified abrupt cut, caption and SFX transitions in the local B runtime.

**Architecture:** Correct frame ownership, support bounded authored picture dissolves, bridge tiny unfinished-phrase caption gaps and guard audio edges while retaining intentional hard cuts.

**Tech Stack:** Existing Node ESM, canvas, FFmpeg/FFprobe; no new dependency.

**Spec:** `docs/superpowers/specs/2026-11-12-motion-fluidity-design.md`

## Task 1: Reproduce and scope

- [x] Preserve previous uncommitted implementation and obtain the user's symptom clarification.
- [x] Add failing tests for stale boundary frames, picture-only dissolves, cache dependencies/validation, caption gaps and actual SFX edge samples.
- [x] Record a pre-change engineering preview at 30fps using the original runtime.

## Task 2: Implement continuity

- [x] Correct frame ownership and verify encoded count/rate; retain requested timing and original voice.
- [x] Add bounded, explicitly motivated dissolves with current captions and proper preceding-shot cache dependencies.
- [x] Bridge tiny unfinished-phrase caption gaps; retain sentence/real pauses and actual word onsets.
- [x] Add bounded SFX/file-clip edge guards; preserve explicit hard edges and full-program preview fade timing.
- [x] Run targeted regressions and produce the matching post-change diagnostic.

## Task 3: Verification and delivery

- [x] Document the supported manifest fields and editorial quality gates.
- [x] Run complete JS, relevant document/asset checks, doctor smoke and a fresh review; fix substantive findings.
- [x] Inspect the diagnostic frames, validate timestamps/source preservation and report concrete evidence plus user-film acceptance limits.

## Progress

User clarified cuts/captions/SFX, so unimplemented continuous-motion tests were replaced with editorial tests before changing any interpolation code. The old runtime failed real cache/color, transition, caption-gap and nonzero SFX-onset regressions. Caption punctuation with a closing quote also failed before its bounded parsing fix. Targeted editorial checks pass. Uncommitted previous work and all canonical assets remain intact. No commits, paid/provider calls or automatic rerender of user projects.

Final verification: 219/219 JS tests, README/A-preservation/A6 checks, real doctor smoke, 20 Python tests and A6 offline finishing passed. Fresh review's tolerance/rounding/preview-envelope findings were reproduced RED and fixed; the nonchronological-start regression was also observed RED before validation was tightened. Independent follow-up passed all reproductions and found no remaining actionable issue. Before/after diagnostics each have 120 frames at 30fps; the eight-second combined preview has 240 frames, decode passed, and an encoded blend frame was visually inspected. Evidence and scope limits: `tests/reports/2026-11-12-editing-continuity.md`.
