# B4 · Reference assets and new-story outputs

The five approved white-glove illustrations remain the mandatory **drawing-style authority**. The approved opening and public sample videos remain **showcases**. Keep their files, prompts and quality criteria. Inspect them and submit scene-relevant anchors as generation references; do not substitute their finished scenes for the requested story.

## Asset roles

- `style_reference`: the five immutable canonical illustrations. Use to learn brushwork, character proportions, palette, lighting and composition. They are not ordinary shot layers for a new story.
- `approved_showcase`: the approved opening poster/video and recorded public examples. View them as quality and motion standards; their story, cast and finished footage are not new output.
- `story_candidate`: actual artwork made or legitimately supplied for the current script, cast and location. This computed classification only means no known whole-file/reference-copy match was found. It does not certify quality, rights or creative originality.

Create a fresh external project and a new script/cast/scene plan. Store submitted prompts and reference IDs separately from the resulting artwork. A reference ID in the production ledger records what guided generation; it never licenses putting the reference image itself in `assets[].file` or an image layer's `path`. `new_generated`, `project_owned`, a new filename, a new directory or a filled `reuse_reason` cannot override the content check. `reuse_reason` remains necessary when deliberately continuing genuine current-story artwork across shots.

The shared `validate`, `preview`, `approve` and `render` paths check visible image resources when loading their submitted scope. A clean short preview does not approve unseen body shots: full rendering checks its full scope again. The standalone production ledger, including `--planning` when files already exist, and custom-renderer picture-evidence plans apply the same check. Known reference/showcase bytes are rejected even after copying or renaming. A conservative normalized RGB comparison also rejects close whole-image conversions/resizes of the five illustrations and opening poster. PNG/JPEG comparison uses the installed FFmpeg dependency; inability to decode is an error, not a pass.

## Reviewing examples is not producing a new story

For learning or an explicit sample inspection, open the packaged reference/showcase directly and label it as existing sample material. Do not run it through the new-story pipeline or claim it is freshly generated. The production commands provide no `sample_reproduction`, author approval, provenance or reuse-reason exception. A future reproduction feature must have a separate, clearly labeled diagnostic output path that cannot satisfy new-story delivery gates.

## Independent encoded review

The existing independent picture review gains a mandatory fifth criterion, `story_asset_origin`. Watch every complete encoded shot against the authorized script and actual current cast/scene plan. Record timed observations: what current-story subject/action/location is visible, whether identities/props belong to this story, and whether an old example was reused or merely cropped/composited. Return old reference scenes, unrelated cast, unexplained copied locations and reference footage presented as new output. Preserve all four existing picture criteria, the full playback/phone-size requirements, separate text/audio/style checks and user approval requirements.

A byte/profile check is deliberately limited: substantial crops, overlays, composites and edited or unknown historical assets can evade it. It cannot authenticate provenance or independent watching. The new visual criterion closes that review gap; an automatically clean asset is still an unreviewed candidate. If any required criterion fails or is unknown, revise affected assets and encoded evidence before delivery. Never lower the approved drawing or animation standard to make the origin check pass.
