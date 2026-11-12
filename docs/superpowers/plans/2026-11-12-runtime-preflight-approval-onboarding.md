# Runtime preflight, approval stability and onboarding implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this authorized plan inline, with a fresh final review. Steps use checkbox tracking.

**Goal:** Improve installation diagnostics and first use while preserving the identity of approved audiovisual content.

**Architecture:** Extend doctor with optional-feature diagnostics and a temporary production-renderer smoke check. Canonicalize fingerprint object ordering and exclude reserved non-render metadata; preserve all production approval and asset checks. Shorten the shared first-use welcome and align installation prompts where needed.

**Tech Stack:** Existing Node.js ESM runtime, Python 3 optional helpers, FFmpeg/FFprobe, canvas and Sharp.

**Spec:** `docs/superpowers/specs/2026-11-12-runtime-preflight-approval-onboarding-design.md` and the user's approved implementation request.

## Constraints

Local work in the existing isolated worktree. No commits, remote changes, paid/media-generation calls, asset replacement, approval bypass or B5 redesign. Existing `checks`, `gemini_key_present` and `network_checked` fields stay compatible. Optional modules never silently install/download. Keep A1–A5's production contract and B4 source hashes unchanged.

## Task 1: Doctor capability checks

- [x] Add failing tests for optional features, unverified providers/alignment, real smoke evidence, failure/exit behavior and cleanup.
- [x] Implement a focused doctor helper and CLI dispatch, keeping the default offline dependency check inexpensive.
- [x] Document `--smoke`, optional capability limits and user-facing reporting.
- [x] Run doctor tests and the existing provider diagnostic tests.

## Task 2: Stable approval fingerprints

- [x] Add failing behavioral tests using actual sample approval: object-key changes and top-level metadata keep approval; layer order and genuine timing/content changes do not.
- [x] Canonicalize fingerprint serialization and exclude only reserved top-level metadata; keep unknown-field, engine and media invalidation.
- [x] Document metadata scope and the one-time review required after engine updates.
- [x] Run runtime approval/cache/tamper tests.

## Task 3: Concise first-use guidance

- [x] Replace the long generic welcome with a brief, localized summary and selected-route expansion; distinguish dependencies from smoke/service/alignment evidence.
- [x] Align README installation prompts and first-use acceptance checks only where the new behavior requires it; preserve style catalogs and A production contract.
- [x] Run README, first-use and A/B preservation checks.

## Final verification and review

- [x] Run the complete `npm test`, README checks, A6 guidance/reference/finishing checks and Python test discovery.
- [x] Run actual `doctor --smoke`; inspect JSON capability states, A/V/subtitle/decode evidence and cleanup.
- [x] Have a fresh reviewer inspect the final diff for approval/integrity regressions; fix substantive findings and rerun affected/full checks as needed.
- [x] Inspect final diff/status and report evidence plus unverified live-host/provider limits.

## Progress

Plan created before code changes. Existing worktree is clean at `7af3957` (detached HEAD); no new checkout is needed. Implementation details are agent decisions within the user's approved scope. Tasks 1 and 3 share the diagnostic status contract; Task 2 does not change doctor or asset integrity contracts.

Task 1: RED observed missing capability fields against the old doctor. Dependencies initially failed sandbox DNS resolution, then installed successfully through approved npm execution using the existing lockfile. Doctor tests and provider diagnostics pass. Smoke cleanup checks only the doctor's owned temporary directories: macOS Python may create an unrelated `xcrun_db` under TMPDIR. Optional model/module presence is intentionally not a readiness claim.

Task 2: RED observed an existing approved preview being rejected after JSON key reversal. The regression now passes for nested key order and metadata additions/edits; focused actual-render, tail-cache, substantive-edit and preview-tamper checks all pass. Unknown settings and array ordering remain approval-sensitive. Only the reserved top-level metadata container is excluded, avoiding a broad field whitelist that could hide future rendering settings.

Task 3: RED observed the old welcome applying A's prompt-only deliverable too broadly. The shared welcome is now brief, with route-specific setup/reference detail retained below. All nine README installation prompts were narrowed because their direct request for a full two-mode tutorial otherwise overrides the new welcome policy. README, shared first-use, A/B preservation and A6 routing checks pass; the scenario matrix now covers dependency-versus-smoke, missing optional Python, audio-only TTS and A6 selection. Static checks are not represented as a live Hermes evaluation.

Final review: fixed the reviewer's P2 process-tree leak with RED→GREEN coverage using a real hanging encoder. A first test liveness probe using `ps` could hide sandbox permission failures; it was corrected to signal-zero checks (plus Linux zombie detection) before the meaningful RED run. The final full suite passed 207/207, Python 20/20, actual doctor smoke, README/A-preservation/A6 checks, and A6 real offline finishing. The reviewer rechecked the fix and reported no remaining substantive issue. Pillow was installed only in a temporary venv for optional A6 verification. Full evidence and unverified live-host/provider limits are in `tests/reports/2026-11-12-runtime-preflight-approval-onboarding.md`.
