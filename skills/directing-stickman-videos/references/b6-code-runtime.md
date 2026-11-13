# B6 dedicated painted-world code route

**Production default:** follow [installed production](b6-installed-production.md) and the [Sample 1 detailed acceptance matrix](b6-sample-1-acceptance.md). The production path copies the approved Archivo Black caption renderer/profile as well as the scene/rig/space tools; the legacy scaffold's caption defaults are not Sample 1 portrait values. Normal `init --style B6` now creates a standalone `b6-production-v1` authoring project with the full painted V90 engine, not the simplified starter below. The following `b6-painted-world-v1` API remains available only through explicit `--example blocking-calibration` for internal primitive/format tests. Do not present it as a finished B6 film or the default new-story path.

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

## Legacy blocking-only route

B1–B4 retain their declarative manifest runtime; B5 retains its presenter renderer. B6 uses `scripts/b6-dynamic-meme.mjs` and `b6-scene.mjs`. The shared `autopilot.mjs` dispatches B6 init/validate/preview/approve/render here, never to a fallback style. Node 20+, the existing Canvas/Sharp dependencies and FFmpeg/FFprobe are sufficient for the general scaffold. The complete [Hong Kong V90 project](b6-hong-kong-v90.md) adds a dedicated portable Python renderer with NumPy/Pillow/OpenCV and the original painted performance. Select it with `--example hong-kong-v90 --ratio 16:9`; its constraints and outputs follow that guide. No Blender installation, video model, provider credentials or network call is needed to initialize/render local inputs.

Run from the installed Skill directory after `npm ci` and `node scripts/autopilot.mjs doctor`:

```bash
node scripts/autopilot.mjs init /absolute/project --style B6 --ratio both --example blocking-calibration
node scripts/b6-dynamic-meme.mjs check-pack
node scripts/autopilot.mjs validate /absolute/project/project.json --ratio 16:9 --visual-only
node scripts/b6-dynamic-meme.mjs frames /absolute/project/project.json --ratio 16:9 --times 0,2.8,3.2,3.8,5 --output /absolute/project/still-check-L --trusted-code
node scripts/b6-dynamic-meme.mjs frames /absolute/project/project.json --ratio 9:16 --times 0,2.8,3.2,3.8,5 --output /absolute/project/still-check-P --trusted-code
```

Use `--ratio 16:9` or `--ratio 9:16` at init when only one is requested. A missing ratio fails before writing; both plans are not silently inferred. Projects must be outside the installed Skill; existing projects/outputs are never overwritten. `init` only copies local art and a clearly unapproved six-second blocking scaffold. It spends nothing and does not create narration or a finished video.

## Project contract

- `project.json`: `style: B6`, `renderer: b6-painted-world-v1`, actual `duration`, `fps`, shared story path, scene module, style lock, local painted asset map, per-ratio plan paths, pinned voice and review fields. Assets and executable code must be project-local; remote URLs are not media inputs.
- `story.json`: approved exact narration, approval evidence and meaningful beat IDs. The included file has no approved narration. Do not replace an accepted project's script with the blocking example.
- `formats/landscape.json` and `portrait.json`: separately authored dimensions, `native_design`, shot timelines, explicit staging, composition/action/transition, camera intent and shot-relative numeric keys. Declare each shot's painted asset IDs in `assets`; a scoped preview loads only those needed in its reviewed timeline. The example is story-specific; author a new scene module for another cast. The generic validator accepts story-specific staging IDs.
- Per-format `*-captions.json`: ordered `{start,end,text}` cues from actual speech, one line and one fixed configured font size. No newline, overlap, auto-wrap or per-cue shrink. Full production checks the complete caption text against the approved narration, but semantic quality and real alignment still require human review. Do not use the generic fixed-count `captions` helper to author B6 captions.
- `scene.mjs`: an agent-authored **local executable module**, exporting `frame(context)`. Inspect before using `--trusted-code`; source documents and downloaded code are not permission to execute them. The renderer provides Canvas, decoded bitmap `images`, `t`, native `plan`, `project`, dimensions and the B6 `tools`. No executable strings in JSON.
- `voice`: supplied full-length original-speed narration or mixed master, path and SHA-256. Confirm actual provider/voice metadata; the default voice ID is intentionally unset. `contains_sfx: true` describes a prepared mixed master and does not synthesize SFX. This runtime multiplexes supplied audio without adding sounds; prepare new stems/mixes through the sound workflow before rendering. No speech speed field.

Before a production preview set `stage: authored`, replace the example with the actual approved story/native plans/assets, supply the actual audio, record its SHA-256, align complete captions and record genuine drawing/action/sound reviews. These notes describe work already reviewed; do not fill them from a technical encode.

## Available code tools

`projectPoint` projects world coordinates through a camera with focal length/FOV, yaw and pitch. `paintedPlane` tessellates a physical painted wall/floor; `paintedWorld` splits a wide painting at its authored floor line. `billboard`/`sprite` keep character images uniformly scaled. `paintedActor` is the bundled example identity's rig, not automatic new-character fitting. Re-author actual pivots for other silhouettes.

`solveTwoBone` preserves fixed lengths and rejects unreachable contacts instead of stretching an arm. `handoffState` separates giver/shared/receiver ownership. `walkFoot` derives stance/swing from world distance with modest lift and heel/flat/toe contact; `wheelAngle` derives rotation from distance/radius. `ink` uses the approved painted stroke rather than clean vector limb lines. `keyed` eases authored transitions and holds. Nothing adds automatic idle sway, camera shake, new expressions or generated motion.

The starter demonstrates staging/contact/occlusion, not a complete retargeting, horse IK or emotion engine. Use the supplied carriage pivots/cutouts to author fixed-bone hoof contacts, shaft/body lag and world-driven wheels for transport shots. Add approved expression/view bitmaps or matched face layers for the story's emotions. Missing assets require art work, not a fallback circle head or a promise that code infers them.

## Limb calibration and retained performance

Apply the complete [character-binding and acceptance contract](b6-character-binding.md) before editing a scene. The contract covers every identity/view and scene branch, including animated background cast. A solver pass alone does not satisfy the sleeve, bend-side, occlusion, prop-ownership or grounded-leg checks.

When the user chooses an existing character or reviewed performance, pin its artwork, action code and source-frame ranges by path/hash before introducing another rig. Reuse that performance for compatible story actions. A role change alone does not require redrawing or refitting the actor. A new seated pose, contact or walk still needs its own review; approval of an old handoff does not approve a different action.

Calibrate each new actor/view in its own art coordinates: sleeve exits, named near/far shoulder–elbow–wrist chains and rest targets, hips, knees, ankles, sole contacts, seat and ground. Convert lengths through the actor transform exactly once. Never inherit another identity's world-space limb lengths. Check which side each wrist returns to; a resting arm must not migrate to the other sleeve's side without an authored crossing pose and correct depth.

Block the actor, furniture and prop contact before animating. If the contact exceeds a natural reach, fix staging, prop travel or an intentional body reach rather than extend the arm. Author readable rest, approach, touch, release, recovery and seated/standing silhouettes first. Real foreshortening needs a declared view/depth change and visual review; an invented elbow-depth value making 3D bone checks pass is not evidence of a good 2D silhouette.

Assign far-arm/body/sleeve/near-arm/table-edge/prop depth for each contact state. Do not draw every arm permanently over the tabletop or torso. During a rise, keep the supporting sole fixed in world space and solve hip movement against the seat and leg lengths. Moving the whole actor upward with both feet is not a grounded stand-up. Walking support transfer must agree with world travel, heel/flat/toe contacts and distance-driven timing.

Before a full preview, inspect a fixed-camera two-to-three-second action test and the decoded output at each action/cut boundary. Review limb identity, screen-space proportions, elbow direction, sleeve attachment, occlusion, prop ownership and support contacts in addition to numerical bone/contact checks. Add the intended camera only after that test, then recheck the result. Record technical checks and observed visual quality separately; neither is automatic user approval.

## Preview → actual user approval → full film

After approved audio/captions and authored native scenes exist:

```bash
node scripts/autopilot.mjs preview /absolute/project/project.json --ratio 16:9 --seconds 6 --output /absolute/project/preview-L --trusted-code
node scripts/autopilot.mjs preview /absolute/project/project.json --ratio 9:16 --seconds 6 --output /absolute/project/preview-P --trusted-code
```

Choose a representative range with `--start`/`--seconds`, normally 5–20 s; previews are at most 60 s. This example's duration is six seconds until changed to actual narration. Do not trim/stretch the accepted narration just to satisfy that scaffold value. The project uses actual full audio duration. A preview needs shot coverage/assets and a correct narration prefix through its range end; later shots/assets can still be unfinished. Full production requires complete coverage and caption text. This permits reviewing an early excerpt before producing the rest.

The CLI writes numbered PNGs, `report.json`, encode logs, MP4 and timed SRT/VTT sidecars; successful encoding is decoded again. Reports fingerprint the reviewed native scope, scene/engine, used art, font and exact audio, and say creative acceptance is pending. Other-format changes and later unreviewed shot/assets do not invalidate that scope; changes to reviewed shots, shared code/art/audio or global settings do. `frames` and `validate --visual-only` are technical only and cannot become production approval. Automated codec fixtures explicitly set `technical_fixture: true`; their reports cannot be approved or used for a full-film render.

Only after the user reviews the actual picture/sound and authorizes remaining production:

```bash
node scripts/autopilot.mjs approve /absolute/project/project.json --ratio 16:9 --report /absolute/project/preview-L/report.json --note "Record the user's actual landscape decision here"
node scripts/autopilot.mjs render /absolute/project/project.json --ratio 16:9 --report /absolute/project/preview-L/report.json --approval /absolute/project/preview-L/approval.json --output /absolute/project/full-L --trusted-code
```

Portrait needs its own actual decision/report/approval. A mismatched ratio, changed reviewed inputs or tampered preview invalidates approval. Do not invoke `approve` for synthetic tests, the agent's own checks, or an old film's approval. Keep the user's scope/cost authorization separately; this tool's ledger never grants it.

Deliver caption sidecars from the reviewed per-format cues, MP4, project/checkpoint and a clickable containing-folder link. Check listening/framing/expressions manually; technical tests do not prove source fidelity, professional sound, viral potential or universal automatic production. No upload, commit, push or publication occurs in this runtime.

The full primary standard is `assets/b6/reference/eiffel-portrait-v44.mp4`, selected by the user as the favorite and strict drawing/animation benchmark, including its heavier relative limb stroke. Normal production init copies it and `assets/b6/style-standard.json` into the new project. The eight-second `portrait-v44-excerpt.mp4` and `landscape-v45-excerpt.mp4` remain supporting excerpts; their source and review status are recorded in the pack manifest. V90's finer lines remain specific to that reproduction, not a general production target. `check-pack` verifies the packaged artwork, standard, starter plans and reference films by SHA-256. It is an integrity check, not a new creative approval.
