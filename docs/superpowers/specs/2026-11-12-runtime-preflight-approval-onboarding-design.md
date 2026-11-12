# Runtime preflight, approval stability and concise onboarding

The user authorized implementation of the three verified improvements in this conversation: strengthen doctor, remove approval invalidation caused by serialization/non-render metadata, then shorten first-use guidance. Preserve genuine sample/cost approvals and asset integrity checks.

## Approach

Extend the existing runtime rather than introduce a provider framework, replace Python, change B5's execution contract, or redistribute assets. Keep the existing doctor JSON fields compatible. The default check remains offline; an explicit `doctor --smoke` renders a temporary diagnostic clip through the production renderer and checks its audio/video, subtitle files and decode result. It never generates speech/images or approves a user project. Temporary work is removed on success/failure.

Report Python, Pillow, Whisper/PyTorch and cached base-model availability as optional diagnostics. Module/key presence is not verified generation/alignment capability. Image, narration and speech alignment remain unverified until their actual selected routes are checked; optional gaps do not fail the B renderer dependency check. A6 finishing still requires project-specific fonts and media review.

Canonicalize object-key ordering for B1–B4 project fingerprints while preserving arrays, exact text, timing, media/engine hashes and scoped preview content. Exclude only the reserved top-level `metadata` container, documented for non-render bookkeeping. Unknown fields remain conservatively fingerprinted. No approval migration/bypass: previews made with the previous engine must be reviewed again.

First use gives a brief capability summary, A1–A5/B deliverables, public style links and short copyable examples. A6 is explained after selection. Expand setup/workflow details only for the selected route, keep failures/actionable gaps visible, and continue complete briefs without replaying onboarding. Keep detailed stage guidance and existing language routing.

## Verification

- Doctor distinguishes dependency checks, real smoke success/failure, optional Python features and unverified external capabilities without network requests/secrets/model downloads.
- Reordering JSON keys and changing top-level metadata preserve a real approved sample; visual/text/timing/layer-order/voice/media changes, preview tampering and missing approvals still fail.
- First-use structure remains localized and portable, with concise examples and selected-route expansion; existing A contract and asset checks remain intact.
- Run the entire JS runtime suite, README/first-use checks, A6 Python tests and finish checks, plus a real offline doctor smoke. No live Hermes/provider run is claimed.
