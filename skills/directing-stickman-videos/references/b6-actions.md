# B6 reusable actions and camera travel

Use `c.actions` from the installed production context. The helper is code and
timing only: it contains no character images, example story, sample performance
or video. Fit each new character package first, then reuse these action
interfaces instead of rewriting joint interpolation for every new story.

The helper preserves the existing [puppet API](b6-puppet-api.md) and all final
geometry/painted-alpha checks. It never changes bone lengths, sleeve sockets,
joint ranges, visibility minima or view assets. A continuous one-stroke arm
retains its package's `ink_path`; these timings do not require a visible elbow.

## One acting arm, continuous timing

Construct the tracks once in scene setup, using the **same runtime instance** as
the compositor:

```python
runtime = c.puppet_runtime
actor = runtime.Puppet(character, 'three_quarter', 'giver')
track = c.actions.offer_track(
    runtime, character.views['three_quarter'].arms['right'],
    start=1.2, reach=.25, offer=.18, hold=.35, retract=.32)

# Every consecutive frame uses this persistent Puppet instance.
frame = actor.pose(frame_index=index, placement=actor_matrix,
    arm_actions={'right': track.sample(t)},
    wrist_targets=contact.targets.get('giver', {}))
```

`offer_track` sequences rest → reach → offer → hold → retract → rest.
`receive_track` sequences rest → reach → receive → hold → reverse receive/reach
→ rest. Retract starts at the fitted **offer** pose; using it directly after an
unrelated receive pose would jump. The receiving preset retraces its fitted
path instead. Only the specified arm acts; leave the unused arm at rest.

Durations are adjustable starting points, not mandatory shot timing. A fast
gesture may fail the runtime's temporal limit; extend its timing or restage it.
Do not widen limits. A newly acquired prop must follow the receiving hand's
actual supported withdrawal, rather than remain parked while the arm retracts.

For a different performance, use
`ArmTrack(runtime, arm, [ArmSegment(action, start, end, phase_start, phase_end), ...])`.
Only the five fitted actions are supported. Intervals must be contiguous and
their actual angle endpoints must agree. Both endpoints hold outside the track.
The track returns only `{'action': ..., 'phase': ...}`; it cannot bypass
`Puppet.pose` or raster QA. It does not synthesize a turn or gait from one view.

## One prop and explicit ownership

```python
timeline = c.actions.handoff_timeline(runtime,
    start=1.4, shared_start=1.9, shared_end=2.15, end=2.7,
    giver={'actor_id': 'giver', 'arm': 'right', 'grip': [.18, .65]},
    recipient={'actor_id': 'recipient', 'arm': 'left', 'grip': [.78, .65]},
    paper_size=(84, 40), initial_pose=[20, -205, 0],
    shared_pose=[0, -205, 0], final_pose=[-20, -210, -3])
contact = runtime.transform_contact(timeline.sample(t), contact_plane_matrix)
```

Coordinates above illustrate the API, not approved staging. Choose them for
the new actors and actual opaque prop art. The builder uses the existing strict
`ContactTimeline`: giver alone → both distinct supporting hands → recipient
alone. The shared interval must have positive duration. The same prop rectangle
owns its pose, UV grips and every supporting hand target. Approach the recipient
grip before shared contact and begin giver withdrawal at the last supported
grip; neither is inferred by this ownership builder.

The runtime still rejects unreachable targets and excessive authored-pose IK
corrections. Move the actor/prop or adjust the fitted pose when necessary. The
actual prop alpha, sleeve exit and both hands must remain readable before,
during and after contact. One legal contact timeline cannot prove natural acting.

## A small reaction and a deliberate camera landing

`reaction_nod(t, start=..., attack=.10, settle=.22, angle=3)` returns a single
rigid head accent and a return to zero. Submit it as `head_angle_deg`; the
existing neck-overlap and temporal checks still apply. Select a painted
expression separately. It adds neither automatic body sway nor repeated shakes.

```python
landing = c.actions.camera_landing(base_camera,
    world_anchor=(220, -250, 1400), screen_anchor=(340, 510),
    z=210, focal=1800)
travel = c.actions.CameraTravel(c.space, base_camera,
    start=3.0, end=3.35,
    destination={key: getattr(landing, key) for key in ('x', 'y', 'z', 'focal')},
    purpose='Land on the buyer noticing the unexpected object')
camera = travel.sample(t)
```

`camera_landing` solves camera position for one explicit world subject and
screen destination. `CameraTravel` interpolates only camera coordinates, then
holds at its landing. Use lateral travel for a reveal, depth travel for a
reaction, and explicit cuts for different spaces. The purpose is planning
metadata; it is not a creative-pass flag. `travel.trace(t, anchors)` records
actual projected world anchors for local review.

Wide wall/ground artwork and separately placed foreground/midground/background
remain necessary. Project every visible anchor over the travel to catch near
plane intersections and missing art. Render character billboards with a uniform
similarity transform; never stretch the character to manufacture perspective.
Do not add travel, shakes or actor motion merely to fill an arbitrary quota.

## Verification boundary

The executable tests exercise continuous endpoints, fixed control lengths,
per-arm isolation, unreachable-target rejection, shared contact, projected
hand/prop coincidence, stable camera landings and depth parallax. These are
reusable implementation guarantees. They do **not** certify brushwork, natural
gesture, expression, camera richness or sample-matched quality. Review the
actual new encoded movement against the primary sample, keeping the existing
35-item quality standard and final audio/caption review.
