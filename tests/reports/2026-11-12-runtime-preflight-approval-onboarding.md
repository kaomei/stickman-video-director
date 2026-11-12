# Runtime preflight, approval stability and first-use verification

Local implementation against `7af3957`, 2026-11-12. No source assets, legacy A1–A5 production contract or package-lock versions changed. No commit, remote publication, external media generation or user-project approval was performed.

## Changes and evidence

- Doctor keeps its existing dependency/key/network fields, adds optional Python/Pillow/Whisper/PyTorch/cache diagnostics, and explicitly leaves external image, narration and caption-alignment capabilities unverified. Missing optional Python does not block B's local pipeline.
- `doctor --smoke` rendered a one-second temporary B1 clip through the real renderer: H.264 video, AAC audio, SRT/VTT, drawn captions, procedural SFX/ambience and successful decode. Owned temporary files are removed on success/failure. It proves this local diagnostic, not production quality or actual speech alignment.
- A fresh review found that the first implementation could orphan FFmpeg after killing the rendering CLI. A real hanging encoder test failed against that implementation, then passed with process-tree termination and process-close handling. The final review found no remaining substantive issue. Windows taskkill was not exercised on this macOS host.
- JSON object-key reversal and reserved top-level metadata additions/edits now reuse the actual approved preview and unchanged approval file. Actual text/timing/layout, layer-array order, unknown settings, voice/media and preview tampering remain approval-sensitive. Engine hashes remain bound, so pre-update approvals require a fresh current preview/review.
- The shared welcome template decreased from 1773 to 385 visible characters (including Markdown/whitespace, excluding link destinations). Detailed selected-route guidance and catalog-language routing remain available. Nine README installation prompts now request the short welcome rather than a full two-mode tutorial.

## Final checks

| Check | Result |
|---|---|
| `npm test` from the Skill directory | 207 passed, 0 failed/skipped |
| Doctor behavior tests (included above) | 6 passed, including real render/failure/timeout cleanup |
| Python reference test discovery | 20 passed |
| `bash tests/verify-readmes.sh` | Passed: first-use, common B rules, localized README/catalog/packaging checks |
| `python3 tests/verify-ab-preservation.py` | Passed: protected A contract retained |
| `python3 tests/verify-a6-guidance.py` and bundled A6 reference preflight | Passed |
| A6 offline finishing test | Passed: exact text/timing, positional highlight, AAC preservation, SRT/decode and no overwrite |
| Real `doctor --smoke` | Passed; optional model/alignment and external services remained missing/unverified |
| `git diff --check` | Passed |

Project JS dependencies were installed with the existing lockfile. A6 finishing verification used Pillow 11.3.0 in `/private/tmp/stickman-python-20261112`, installed from the official PyPI wheel after verifying its PyPI SHA-256; system Python was not modified. Doctor also passed with that interpreter selected explicitly, reporting A6 as still unverified pending project-specific media/fonts.

These are local offline/runtime and instruction-integrity results. The scenario matrix was updated, and fresh review checked guidance boundaries; this is not a live Hermes installation/conversation run, provider-authentication/quota test, actual TTS alignment, aesthetic review or user acceptance of a film. No Whisper/PyTorch/model download was performed.
