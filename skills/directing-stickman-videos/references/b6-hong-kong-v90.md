# B6 · V90 editable reproduction project

Use this route only when the user explicitly requests the unchanged Hong Kong V90 example reproduction, or when checking that named installation fixture. Its wrapper reports `purpose: example-reproduction` and `new_story: false`; it is not evidence that a new user story has been produced. It preserves V90's painted backgrounds, textured character layers, facial art, thin limbs, ambient cast, taxi, original camera code, The Pharaoh 3 mixed master and authored semantic caption cues. It is a complete 20-second editable **16:9** project, not a preview movie pasted into a renderer. It does not call an image/video/audio model.

**Reference priority:** this is Sample 2 and a secondary binding/engineering example. The strict primary B6 visual/performance standard is Sample 1, the Eiffel portrait V44; B6 works best in 9:16. V90's preserved fine limbs are correct for an unchanged reproduction of this historical clip, but do not define the limb weight for a new B6 production. New cast and scenes must match Sample 1 portrait's relative ink weight, brushwork, light, meme acting and motion language while recalibrating geometry. Keep the locked V90 source intact when using this reproduction route.

## Initialize and reproduce in a new directory

From the installed Skill directory:

```bash
node scripts/autopilot.mjs init /absolute/new-hk-project --style B6 --ratio 16:9 --example hong-kong-v90
node scripts/autopilot.mjs validate /absolute/new-hk-project
node scripts/autopilot.mjs preview /absolute/new-hk-project --trusted-code --full-qc --start 6.6 --seconds 9.933333333333334 --output outputs/test-01
```

The project is independently executable after copying; the installed Skill and historical work folders are not needed:

```bash
cd /absolute/new-hk-project
python3 run.py validate .
python3 run.py preview . --trusted-code --full-qc --start 6.6 --seconds 9.933333333333334 --output outputs/test-01
```

Dependencies: Python 3.9+, NumPy, Pillow, OpenCV and FFmpeg. The tested versions are pinned in `requirements.txt`; use an existing matching environment or a project virtual environment. No automatic installation, network access or paid call occurs. B6’s public default caption font is the user-approved bundled Archivo Black, retaining the existing size, placement, outline and switching. No local Arial installation is needed for a new B6 film. For historical V90 typography reproduction, initialization can resolve user-installed original faces from `B6_FONT_DIR` or standard local font folders; `font-provenance.json` records the actual selection and hashes. Proprietary system font files are not redistributed. The original local-font route is optional and does not change the new-story Archivo Black default. V90 has no reviewed portrait version: `--ratio 9:16`/`both` fails rather than cropping or stretching the wide staging. Use the separate native-format workflow to author one.

`init` copies only manifest-listed files. Existing project and output directories are never overwritten. Inspect source before `--trusted-code`; executable source is trusted local production code, not a sandbox. `validate` checks files without importing animation code. No command uploads, publishes, commits or pushes.

## What is editable

- `source/work/hk-v90-unified-arms/animate.py` is the active all-character binding/paint compositor; `rig.py` is the single solver. Its inherited authored modules are bundled under `source/work/`; no older project directory is consulted. Only the used paint/gait/bag primitives are retained from unrelated Eiffel/history modules.
- `source/work/**/assets/` and the other manifest-listed PNGs contain the 48 original painted layers, including wide rooms, sleeves/hands, heads and face layers. Do not substitute clean vectors, simplified heads or plastic highlights.
- `character-bindings.json` supplies the eight identity/background profiles, shoulder pins, fixed bone lengths, 17 context/side pose envelopes, per-frame limb inventory and straight-leg/sole constraints. The runtime loads these values into the shared solver. It is calibrated to this specific performance, not automatic fitting of a new character.
- `scene-plan.json` indexes staging, actions and frame ranges. Actual keyframes, camera paths, uniform character transforms, parallax, occlusion and facial changes live in the bundled Python scene code. Editing the index alone does not change motion.
- `audio/master.m4a` retains the original AAC stream. Voice speed is 1. The excerpt cuts the same master at the selected time; it does not time-stretch speech. `captions.json` and the renderer's matching caption data retain original semantic cues, fixed size, timing and text.
- `source-provenance.json` records original relative paths/hashes and extraction adaptations. The public `manifest.json` pins 85 source/media files; initialization additionally pins the selected project font files and their provenance. After intentional edits, review the affected performance and update the lock deliberately; do not auto-refresh a damaged pack to conceal drift.

## Checks and review

`--full-qc` draws all 600 original frames while encoding only the selected preview. It rejects missing/duplicate/swapped arms, invalid dimensions, overreach, nonfinite coordinates, reversed bend sides outside approved poses, 2D silhouette drift, fixed-bone drift, foot sliding, nonuniform actor scale and failed independent prop contacts. It retains a per-frame `limb-frames.jsonl`, raw frame hashes, PNG samples, contact sheet, local resource audit and report.

Orthographic depth permits the inherited painted projection; its fixed-length calculation alone cannot demonstrate a natural silhouette. Approved 2D pose envelopes and coverage are additional checks, not a universal anatomy model. Whole painted street figures are rigid sprites; seated legs and the counter-owner's lower body are legitimately occluded. Do not fabricate invisible limbs or claim these exceptions are walking IK.

Inspect decoded action/cut boundaries and sleeve/arm/table occlusion visually. Compare the new-directory render with V90 and listen to the excerpt. A passing report explicitly leaves visual/user acceptance pending. Do not extend a different pose or identity based only on this reconstruction.

The explicit unchanged 20-second **example reproduction** can be exported after genuine user review of that actual new-directory preview:

```bash
node scripts/autopilot.mjs approve /absolute/new-hk-project --report outputs/test-01/report.json --note "Record the user's actual decision"
node scripts/autopilot.mjs render /absolute/new-hk-project --trusted-code --output outputs/full-01
```

Never run `approve` for the agent's own tests or an old V90 approval. It checks the current manifest, reviewed MP4 hash and note. Changing any pinned input invalidates that record. Deliver the MP4, editable project, QC report and a clickable containing-folder link; keep publication separate from local reproduction.
