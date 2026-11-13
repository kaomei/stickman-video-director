# B6 painted puppet runtime v1

`b6_puppet.py` uses Pillow, NumPy and OpenCV. Import the installed copy through the production engine's `c.puppet_runtime`. It contains no role-name branches, network calls, model calls or scene-specific repairs.

## Character package

`load_character(package_dir)` reads `package.json` with schema `b6-puppet/1`. New version-2 projects require package `binding_version: 2`; legacy packages remain readable for legacy projects. Every view defines:

- `sprites.body` and `sprites.head`: separate transparent RGBA assets, each with relative `path`, verified `sha256`, and explicit affine 3×3 `image_to_local` matrix. Package paths cannot escape the character directory. Optional `sprites.heads` maps expression names to the same verified asset format. All expressions remain in the same geometry view, so changing expression does not reset limb continuity. `head_anchor` is the fitted local neck point; if omitted it defaults to the transformed bottom-center of the default head. An explicit anchor must remain near that fitted neck.
- Exactly `arms.left` and `arms.right`, using anatomical IDs. Each needs `socket`, unit-direction `exit_normal`, `exit_center`, actual `outlet_segment` (two local points), `lengths` (two fixed planar lengths), `pole` ±1, `upper_angle_range_deg`, `elbow_bend_range_deg`, finite `max_ik_offset`, `ink_width`, `hand_radius`, and `cuff` asset. The cuff is the actual painted sleeve cap's alpha, not a whole-garment silhouette; its own asset hash and matrix are required.
- Five authored angle pairs in every arm's `poses`: `rest`, `reach`, `offer`, `receive`, `retract`. Angles are degrees with screen y down; upper is absolute from +x; forearm angle is `upper - pole*bend`. Rest should be nearly straight. `layer` is explicit `front` or `back`.
- Each binding-version-2 view requires `neck_attachment`, for example `{"mount_polygon":[[-10,-295],[18,-295],[18,-292],[-10,-292]],"min_overlap_fraction":0.70,"min_overlap_thickness":2.0}`. Fit the convex band to the actual painted neck, not the sprite rectangle or a convenient point in the torso. The band must have area ≥8 local square units and ≥95% main opaque body-paint coverage. Its declared overlap fraction cannot be below 0.5; continuous thickness cannot be below 2 local units. Calibrate stronger values against the actual art and complete nod/expression sweep. Refit existing painted heads to the body rather than drawing a generic filler neck.
- Optional per-arm `action_envelopes` constrain only named existing actions, for example `{"reach":{"upper_angle_range_deg":[-10,85]}}`. Each interval must fit the arm's physical joint range. Optional `forbid_elbow_above_root_when_wrist_below_root: true` rejects that hanging-hand silhouette only for the declared action. These are calibrated performance constraints, not a universal ban on raised elbows; genuine raised reaches need their own appropriate authored action poses/envelope.
- Optional per-arm `ink_path: {"mode":"continuous","sag":12}` draws one continuous pressure-varying stroke from the fitted sleeve root to the exact wrist. Omit it to retain the legacy visible two-bone path. `sag` is a constant actor-local downward offset at the curve midpoint, finite and between zero and one quarter of total control-bone length; zero draws a single straight stroke. This is a drawing style, not permission to change hand targets or fixed reach.
- Exactly `legs.left` and `legs.right`: `hip`, `ankle`, `ink_width`, `foot_size`; these are straight static stance legs. Optional `foot_asset` uses the standard verified RGBA format, with `image_to_local` relative to the ankle. An arm can likewise declare `hand_asset`, relative to its wrist, to preserve the painted hand. Walking requires another authored stance/view/foot-contact system; this version does not claim to solve gait.
- `ink_color` as a CSS hexadecimal color.

Optional arm limits: `visibility_min` maps `upper`, `forearm`, `hand` to readable fractions (each ≥0.1); `min_screen_segment_px` defaults to 4; `max_joint_step_ratio` defaults to 0.5. Visibility is measured after every sprite, sleeve, paper, other actor and declared foreground has actually composited. Reducing these values to conceal a defect is not a fitting workflow.

Missing fitting data, art-hash drift, non-RGBA sprites, empty cuff masks, invalid joint ranges and missing poses are rejected. A cuff must stay local to its socket (maximum extent 1.1× upper bone), overlap the actual painted body alpha by at least 98%, and contain its declared socket; a whole-garment alpha is rejected. The loaded character exposes `views`, `fingerprint`, `package_path`, `character_id`, and `art_hashes`. Loaded package arrays and nested maps are read-only, so a scene cannot accidentally refit a sleeve or leg for all future frames.

## Scene API

```python
runtime = c.puppet_runtime
keeper = runtime.Puppet(c.character_packages['keeper'], 'three_quarter', 'keeper')
pose = keeper.pose(
    action='offer', phase=0.8,
    placement=[[1, 0, 500], [0, 1, 660], [0, 0, 1]],
    wrist_targets={'right': [640, 500]},
    arm_actions={'left': {'action': 'rest', 'phase': 1}},
    head_variant=None,        # or a name verified in sprites.heads
    head_angle_deg=-5,          # rigid nod about the fitted neck
    frame_index=frame_index,
)
result = runtime.render_scene(
    (1280, 720), [pose],
    background=background_rgba,
    frame_index=frame_index,
)
runtime.validate_render_result(result, expected_actor_ids={'keeper'})
return result
```

`placement` and wrist targets use **final output pixels**. Compose the camera transform into placements and contact-paper coordinates before solving. Placement accepts only uniform similarity transforms, including rotations and reflections. Reflections transform both anatomical limbs without swapping their IDs. No nonuniform stretch or invisible Z-length compensation is permitted.

`Puppet.pose` interpolates authored FK angle pairs (`retract` returns from offer through the authored retract waypoint to rest), then applies bounded 2-bone planar IK only to requested contact hands. Targets outside fixed reach, authored joint ranges or finite correction radius are rejected. Elbow poles cannot flip. Consecutive frame joint jumps are rejected. Pass `allow_cut=True` only at a real cut. View changes require `set_view(view_id, allow_cut=True)`; this does not manufacture an in-between turn drawing.

For `ink_path.mode='continuous'`, the fixed two-bone chain is an internal reach/action control, not the painted arm. The real quadratic has root and wrist as endpoints and control point `midpoint(root,wrist) + [0,2*sag]`. Its sampled painted arclength must be at most 1.05 times total control reach, both semantic halves must remain readable at output scale, its initial tangent must emerge along the fitted cuff exit, and progress along the root-to-wrist chord must stay strictly forward. Excess sag on a short reach is rejected because it folds; reduce the package sag or restage that pose. Apparent shortening is permitted for this cartoon projection; there is no claim that its two semantic halves match anatomical bone lengths. No visible elbow corner is required.

The renderer rasterizes one coherent brush with shared pressure/pigment variation, then partitions its alpha at the actual curve midpoint into disjoint `upper`/`forearm` masks. Their union is the original full stroke, with no double-painted join. These IDs retain contact, visibility and prop-depth ownership; the `forearm` depth declaration applies to the latter half of the actual curve. Cuff, curve-half join, wrist/hand and prop contact are still audited from composited pixels. Keep this drawing mode stable across the shot rather than switching styles to hide a bad frame.

Every arm can override the global action/phase with `arm_actions`. A single offering hand must not raise the unused arm. Author that arm’s FK preparation/reach/offer phase before applying bounded contact IK; do not leave it at `rest` and compensate for a distant prop by widening `max_ik_offset`, joint ranges or bone lengths. Choose the prop target height to fit the authored control reach, torso and readable painted hand/prop silhouettes. In visible two-bone mode, a reachable high target can still produce a sharply peaked triangular elbow; restage the target or body rather than accepting it because IK passes. In continuous mode, judge the actual drawn curve rather than requiring its hidden control elbow to appear. When a target exceeds the approved envelope, change the pose or staging. Preserve the Puppet instance through consecutive frames so temporal checks run.

Optional `head_variant` chooses an asset owned by the current view. `head_angle_deg` is a rigid rotation about `view.head_anchor`, limited to ±20° and 7° between consecutive frames. An explicit `head_pivot` must equal the fitted anchor; head warping or arbitrary pivots are rejected. `set_view` is for actual geometry changes, not ordinary expressions.

The anchor is a rotation pivot, not evidence of attachment. For a declared neck mount, load checks every expression at neutral; each submitted nod/expression is checked again from the actual main opaque head/body components at 4× local sampling. Their overlap must meet the declared area fraction and continuous thickness across at least half the mount width. Stray detached paint dots cannot supply the connection. The compositor independently records contact from the actual output RGBA alpha; a fully cropped mount remains geometrically checked. A neutral pass cannot excuse a gap appearing during a nod.

Optional `ankle_targets={'left':[x,y], 'right':[x,y]}` keeps stance feet at final-pixel contact points while the torso makes a small lean. Each target is bounded to 25% of the authored leg length from the transformed stance ankle; actual straight shaft length must stay between 92% and 108% of the authored stance. The QA records actual local length and `planted_space='screen_target'`, and sets `fixed_length=None` for this bounded stance adjustment. It must not be described as exact fixed-length gait. Without a target, the leg retains its fixed actor-local stance length. The actual submitted targets are rechecked before rasterization.

## Single contact owner

```python
timeline = runtime.ContactTimeline([
    {'t0': 0, 't1': 1, 'state': 'owner',
     'holders': [{'actor_id': 'keeper', 'arm': 'right', 'grip': [0, .5]}],
     'paper_start': [680, 500, 0]},
    {'t0': 1, 't1': 2, 'state': 'shared',
     'holders': [{'actor_id': 'keeper', 'arm': 'right', 'grip': [0, .5]},
                 {'actor_id': 'runner', 'arm': 'left', 'grip': [1, .5]}],
     'paper_start': [680, 500, 0]},
    {'t0': 2, 't1': 3, 'state': 'owner',
     'holders': [{'actor_id': 'runner', 'arm': 'left', 'grip': [1, .5]}],
     'paper_start': [680, 500, 0], 'paper_end': [710, 510, -5]},
], paper_size=(80, 36))
contact = timeline.sample(t)
# Each Puppet uses wrist_targets=contact.targets.get(actor_id, {}).
result = runtime.render_scene(size, actor_frames, paper=contact,
    paper_art=painted_letter_rgba, background=background,
    frame_index=frame_index)
```

`owner` has one holder, `shared` has two distinct actor/arm holders, `release` has none. Intervals and paper endpoints must be continuous. Direct transfer between disjoint owners is rejected; include a shared interval. UV grips are in `[0,1]²`, relative to the one paper rectangle. `paper_start/end` are final-pixel `[center_x, center_y, angle_degrees]`. The timeline owns the paper and hand targets together; do not animate another paper or rewrite wrists separately.

Optional `paper_art` is an RGBA image, uniformly fit inside `paper_size`, with its actual warped alpha used for contact QA. Grips must lie on visible paper pixels; transparent padding is not a valid grip. Default paper remains a plain rectangle.

A shared hold uses one physical prop with two readable hand silhouettes. Put giver and recipient at nearby valid grip UVs instead of stacking both complete hands at one pixel. Bring the recipient along its pre-contact arc to its final UV before the shared interval starts. The giver’s first withdrawal pose begins at its last supported grip and follows a clear route past the actual prop alpha, rather than passing behind the paper and appearing detached. Inspect approach and release frames as well as the held pose; do not hide an erased forearm by lowering visibility thresholds.

## Multiple props and a projected contact plane

`transform_contact(contact, placement)` projects a sampled `ContactState` through one uniform camera similarity and independently recomputes its hand targets. This preserves one authored paper rectangle and grip UVs under a camera pan, scale or reflection. Nonuniform transforms are rejected.

For a code-authored tear or two simultaneously held props, use independent timelines and stable IDs:

```python
left = runtime.transform_contact(left_timeline.sample(t), camera_matrix)
right = runtime.transform_contact(right_timeline.sample(t), camera_matrix)
result = runtime.render_scene(size, actor_frames,
    props=[runtime.PropFrame('bill-left', left, left_painted_rgba),
           runtime.PropFrame('bill-right', right, right_painted_rgba)],
    background=background, frame_index=frame_index)
```

`props` and legacy `paper` cannot be supplied together. IDs must be unique. Each `PropFrame` owns its contact geometry and verified rendered art alpha. A single hand may hold two gathered pieces only when their independently projected grips coincide within 0.75 pixels; incompatible targets are rejected. Each prop emits its own identity, pose, holders, art hash and contact records. Direct `ContactState` values are also revalidated for state, holder count, UV range and uniform geometry before rendering; use `ContactTimeline` to retain ownership-transfer and event continuity checks. A topology change such as tearing needs an explicit scene event and independently authored piece timelines; the runtime does not infer a tear or manufacture its animation. For gathering torn pieces, finish their physical grip convergence before releasing the second supporting hand. Hold a readable shared interval at the gathered pose, then withdraw from the last supported position. Adjust the pieces’ pivots/angles/positions when their UV grips do not converge; overwriting one conflicting hand target or clamping an out-of-range UV is not a repair.

If a reaching or releasing forearm physically passes in front of a prop, declare the actual depth: `PropFrame('bill', contact, art, front_limb_parts=('giver:arm:right:forearm',))`. Only named existing `upper`/`forearm` parts are accepted. The compositor draws the part once after that prop, retaining the original later body/head/cuff/other-actor occlusion and the complete original stroke as its visibility denominator. It records the declaration in prop QA. Hands still render above props and the final foreground still occludes all parts. For a fan of adjacent pieces, declare the part on every prop in its contiguous depth group; a noncontiguous group is rejected. This changes real beauty and audited alpha before QA, rather than waiving contact or readability. Default parts remain behind the prop; do not use depth declarations to repair an incorrect approach or impossible body crossing.

Optional `foreground` must be accompanied by `foreground_occlusion_mask` exactly matching its alpha. The compositor updates actual final visible limb mattes. Explicit declaration does not excuse an unreadable limb.

## Returned evidence and acceptance

`RenderResult` contains `beauty` (final PIL RGBA), `limb_masks`, `part_masks`, `id_image` (uint32 stable IDs), and `qa`:

- `frame_index`, `errors`, `actors` (package fingerprint/view/art hashes).
- `arms` / `arm_records`, `legs` / `leg_records`, `contact_records`, `contact_errors` in actual output pixels.
- `neck_records`: painted mount coverage, head/body overlap fraction and area, span meeting continuous thickness, actual output overlap pixels, crop status and the rendered head/body alpha hashes.
- `arm_ids`, `leg_ids`, part/limb/beauty/ID SHA256 hashes.
- Actual sleeve-outlet contact, upper/forearm/hand visibility fractions, painted-path join connectivity, wrist/hand connectivity, straight-leg/foot connectivity, and independently projected prop-to-hand contact. Continuous arms additionally record `ink_path_local/screen`, `ink_arclength_local/screen`, actual `ink_join_screen`, and the full unoccluded ink hash. Their `nodes_role` is `internal_fixed_reach_controls`; `control_fixed_lengths` and `control_actual_planar_lengths` describe those controls. `fixed_lengths`, `actual_planar_lengths`, `elbow_connected` and `elbow_in_frame` are `None` for a continuous painted arm, so internal geometry cannot masquerade as painted segment evidence. Use `ink_halves_connected` and `ink_join_in_frame` for its real join.
- Camera viewport clipping is distinct from occlusion: visibility fractions compare the actual clipped unoccluded part alpha with final composited alpha. A fully offscreen part has fraction `None` and an explicit `viewport_clipped_parts` flag; connectivity is required when the actual painted endpoint/join center lies inside the canvas (`0 ≤ x < width`, `0 ≤ y < height`), without an expanded stroke-radius margin. Continuous mode uses its actual curve midpoint here, never its hidden control elbow. A socket just outside the edge must not be falsely required to show an invisible cuff connection; its visible entering arm portions still use the same visibility thresholds. Fully offscreen legs and prop grips are similarly explicit. A character or limb inside the viewport swallowed by a foreground or other art still fails the same visibility thresholds. Offscreen actors retain their geometry, limb IDs and cast identity; cropping cannot hide an invalid bone or fitted cuff.

`render_scene` rechecks the actual submitted ActorFrame geometry (finite coordinates, socket roots, fixed planar lengths, permitted joint angles, pole, cuff-exit direction, output size and bounded pose correction), even if scene code edited nodes after `Puppet.pose`. `validate_render_result(result, expected_actor_ids)` rejects non-RenderResult output, cast or limb inventory mismatch, prior QA errors, or altered beauty/masks/ID pixels after auditing. Add captions through the production caption stage, not by replacing `result.beauty` in scene code. Do not bypass visibility QA by returning a separate image.

A machine pass only permits visual review. Check actual painted end-pose silhouettes and stroke directions at native output scale, then watch the encoded action at normal playback speed. Include approach, handoff, tear and recovery: connected pixels and legal IK cannot establish natural movement or excuse a boxy visible elbow or folded curve. Also inspect sleeve exits, both hand silhouettes, grip ownership transitions, occlusion order and feet. Review with the selected primary sample at matched head size; never use a machine pass as evidence that style or performance has been approved.
