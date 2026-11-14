# B6 faster local iteration

Use this workflow while authoring a new B6 story. Reuse calibrated compatible character/action modules; create the requested story art. The strict Sample 1 V44 standard, all 35 final subchecks and original-speed sound remain unchanged. A draft or change worklist grants no creative pass or user approval.

## Catch movement mistakes before a native encode

Run [character import preflight](b6-character-preflight.md) after fitting, before new paid narration or full encoding. Reuse compatible [action timing helpers](b6-actions.md). Once the scene and audio timeline are authored, make a full-time, full-30fps draft to inspect action, spatial staging, attention and camera landings. Preserve accepted voice/cue inputs. Reduce spatial resolution, not the number of frames or the playback speed.

```bash
node scripts/autopilot.mjs preflight /absolute/new-story --ratio 9:16
python3 /absolute/new-story/run.py draft /absolute/new-story --ratio 9:16 --trusted-code --draft-scale 0.5 --output outputs/draft-01
```

The scene must explicitly implement `draft_frame(t, context)` to draw at the draft size. Keep `frame(t, context)` as the original native path. Both return the final trusted puppet `RenderResult`, including actual foreground occlusion and visible-alpha evidence. The renderer still checks limbs, contacts and neck/cuff connection; if the smaller image cannot satisfy readable-pixel checks, use `--draft-scale 0.75` or a native preview. Do not reduce the final thresholds.

`context.viewport` is the immutable `RenderViewport` from the installed `b6_iteration.py`. Its `size`, `width`, `height` and `pixel(value)` provide output coordinates. `viewport.camera(native_camera)` scales output dimensions, focal length and principal screen Y together, preserving world XYZ and near plane. `viewport.screen_matrix(native_matrix)` scales a native matrix's screen result. Use one projection route per object, not both. Scale every canvas, sampling grid, foreground mask and screen-space draw consistently; do not stretch an already painted body or move world anchors to fit the draft.

```python
def draft_frame(t, context):
    view = context.viewport
    cam = view.camera(native_camera(t))
    # Shared draw_scene must use view.size for every canvas/grid and project
    # actor, prop and contact coordinates with this same camera.
    return draw_scene(t, context, camera=cam, size=view.size)
```

If a scene has not implemented this hook, author the adapter or run the existing native preview. Merely resizing a native frame before encoding saves encoding bandwidth but does not avoid native scene painting or mask work. Draft reports and footage are explicitly labelled; they cannot serve as formal review/approval evidence.

## Repair the affected action first

```bash
python3 /absolute/new-story/run.py plan-iteration /absolute/new-story --ratio 9:16 --report outputs/preview-01/report.json
python3 /absolute/new-story/run.py preview /absolute/new-story --ratio 9:16 --trusted-code --start 5 --seconds 2.5 --output outputs/contact-fix-02
```

`plan-iteration` compares the baseline report's input SHA inventory to the current one. Older reports without the inventory produce a conservative whole-timeline recommendation. Code, audio, captions, plans, bindings and shared configuration changes also recommend the whole current timeline. The worklist never copies prior pass labels or waives the new source fingerprint.

For raster-only repairs, native plan shots may optionally declare `asset_inputs: ["assets/counter.png", "characters/hero/view/head.png"]`. Complete declarations allow the worklist to recommend affected shots plus neighboring cut frames first. Unscoped changed art falls back to the entire timeline. A declaration describes author intent, not proof that other shots are unchanged; review shared assets and dependencies accordingly.

After repairing the actual defect, encode one current full native preview and complete the existing [motion review](b6-motion-review.md), [35-item primary matrix](b6-sample-1-acceptance.md), actual original-speed AV inspection and genuine user decision. Keep rejected versions and open findings. Reusing an unchanged reference or voice avoids unnecessary generation; it does not certify a new movie.

## Measure the improvement

On the same project and machine, record elapsed validation/load, scene/visible-alpha work, encoding and review-pack construction separately. Compare the same complete duration and frame count at native size versus an adapted draft; also measure one affected-range preview. Keep resolution, FPS, audio speed, report kind, source fingerprint and machine timings with the result. A quicker encoder or a shorter repair range is not evidence that total new-story authoring will finish within a fixed time.
