# B6 native code tools and legacy diagnostics

**Production:** use [installed production](b6-installed-production.md), the [Sample 1 detailed acceptance matrix](b6-sample-1-acceptance.md) and the executable [puppet API](b6-puppet-api.md). The strict quality standard remains Sample 1 portrait Eiffel V44 and all 35 subchecks. Default `init --style B6` creates an unimplemented `b6-production-v1` project with the mature engine and approved Archivo Black caption profile. The agent must author the requested story, art, calibrated actions, original-speed sound and native composition, then review actual playback. Initialization or re-encoding an old test is not the deliverable.

## Portable production space helper

Default production init copies `b6_space.py` next to `scene.py`; import it normally from the standalone project. Use it when authoring spatial motion, alongside the V90 paint/rig/compositor. Coordinates are x right, y down, z away; standing feet can sit on y=0.

```python
from b6_space import Camera, camera_move, depth_order, trace_sample

base = Camera(width=1280, height=720, focal=900, y=-220, principal_y=290)
camera = camera_move(base, t, 0.3, 1.4, x=180, z=120)
actor_foot = (300, 0, 1100)
actor_transform = camera.billboard_matrix(actor_foot, units_per_pixel=0.8)
# Apply this uniform transform to the painted actor AND all solved limb/contact points.
wall_hit = camera.ray_plane((screen_x, screen_y), axis=2, value=2400)
ground_hit = camera.wall_ground((screen_x, screen_y), wall_z=2400, ground_y=0)
order = depth_order(camera, [('actor', actor_foot), ('pillar', (460, 0, 650))])
trace = trace_sample(t, camera, {'actor': actor_foot, 'pillar': (460, 0, 650)})
```

`ray_plane` / `wall_ground` provide inverse coordinates for sampling authored wall/ground art; they do not generate or inpaint textures. `billboard_matrix` keeps heads, torsos and limbs uniformly scaled. `depth_order` sorts independent anchored objects far-to-near; split intersecting table/hand/prop surfaces into explicit masks instead of sorting a whole actor over furniture. Keep actor travel independent of camera travel. `camera_move` eases departure/landing; chain deliberate paths for a tracked shot rather than resetting velocity at each cut. The trace records actual projections for inspection, not a motion-quality score.

`python3 /absolute/project/b6_space.py demo /absolute/diagnostic-output` writes a geometric diagnostic with near/far parallax and foreground crossing. It verifies the helper's operation, not finished B6 artwork, performance or source fidelity. Review actual encoded story footage under [motion execution/review](b6-motion-review.md).

## Retired blocking renderer: diagnostic use only

`b6-painted-world-v1` exists only for explicit `--example blocking-calibration` primitive/format tests. It is never a route to a finished film. The renderer intrinsically refuses `approve` and `render`; `stage: authored`, ordinary reviews, fabricated approvals or deletion of fixture fields cannot change that. Every generated frame/preview is visibly labelled diagnostic and its report always has `technical_fixture: true`, `purpose: diagnostic`, `delivery_ready: false`.

From the installed Skill after dependency setup, only when a diagnostic is intended:

```bash
node scripts/autopilot.mjs init /absolute/blocking-diagnostic --style B6 --ratio both --example blocking-calibration
node scripts/b6-dynamic-meme.mjs check-pack
node scripts/autopilot.mjs validate /absolute/blocking-diagnostic --ratio 16:9 --visual-only
node scripts/b6-dynamic-meme.mjs frames /absolute/blocking-diagnostic --ratio 16:9 --times 0,2.8,3.2,3.8,5 --output /absolute/blocking-diagnostic/still-check-L --trusted-code
node scripts/b6-dynamic-meme.mjs frames /absolute/blocking-diagnostic --ratio 9:16 --times 0,2.8,3.2,3.8,5 --output /absolute/blocking-diagnostic/still-check-P --trusted-code
```

Projects/outputs must be fresh and outside the installed Skill. Inspect local executable modules before `--trusted-code`. Structural stills do not need audio. A diagnostic codec preview may supply full original-speed local audio/hash, matching semantic captions and genuine diagnostic notes, but never becomes finished production. Those old caption defaults are not Sample 1 portrait caption values. No command spends credits, uploads, commits or publishes.

To make a new story, initialize a **different fresh directory without `--example`** and follow the production workflow. Do not migrate the scaffold's old paintings/story into it. Production checks bundled media by content hash, including renamed copies and registered character-package assets, and checks actual scene reads. The reference movie is compare-only. Using it as a reference to create new paintings is permitted; pasting it or its old test layers into the film is not.

During production scene import and rendering, external common media, known protected bytes and formats decoded by the installed Pillow are rejected even when renamed or extensionless. Read/write handles to local protected content are checked too. Installed Python dependencies and trusted runner encoding remain available; prepare story media as declared local inputs before rendering.

## Available code tools

`projectPoint` projects world coordinates through a camera with focal length/FOV, yaw and pitch. `paintedPlane` tessellates a physical painted wall/floor; `paintedWorld` splits a wide painting at its authored floor line. `billboard`/`sprite` keep character images uniformly scaled. `paintedActor` is the bundled example identity's rig, not automatic new-character fitting. Re-author actual pivots for other silhouettes.

`solveTwoBone` preserves fixed lengths and rejects unreachable contacts instead of stretching an arm. `handoffState` separates giver/shared/receiver ownership. `walkFoot` derives stance/swing from world distance with modest lift and heel/flat/toe contact; `wheelAngle` derives rotation from distance/radius. `ink` uses the approved painted stroke rather than clean vector limb lines. `keyed` eases authored transitions and holds. Nothing adds automatic idle sway, camera shake, new expressions or generated motion.

The starter demonstrates staging/contact/occlusion, not a complete retargeting, horse IK or emotion engine. Use the supplied carriage pivots/cutouts to author fixed-bone hoof contacts, shaft/body lag and world-driven wheels for transport shots. Add approved expression/view bitmaps or matched face layers for the story's emotions. Missing assets require art work, not a fallback circle head or a promise that code infers them.

## Explicit unchanged reproduction

The complete [Hong Kong V90 project](b6-hong-kong-v90.md) is retained unchanged for the user's explicitly requested **named reproduction**, selected with `--example hong-kong-v90 --ratio 16:9`. Its report declares `purpose: example-reproduction`. It can verify installation and reproduce the historical performance, but cannot establish new-story quality. The smaller `b6_production_example.py` and `b6_character_example.py` helpers are labelled example/diagnostic demonstrations only; they are not shortcuts to new-film approval.

Keep per-view sleeve/neck/hip/sole binding, ownership/contact, straight-leg support, occlusion and actual-pixel checks from the production guides. Reuse only an appropriately approved production identity/action in its compatible scope; the old scaffold identity and numeric lengths do not qualify by being installed. Missing artwork or fitting needs actual work, not an alternate vector or old-clip fallback.
