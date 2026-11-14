"""Agent-authored native B6 scene, intentionally unimplemented.

New cast/actions use context.puppet_runtime and context.character_packages.
Fit per-view painted packages in characters.json; scene.frame returns the
compositor's actual final RenderResult, including all occluders. A separate
numeric skeleton beside an unchecked image is insufficient. See
references/b6-puppet-api.md and scripts/b6_character_example.py.

Use project-local b6_space for world/ground projection and depth parallax.
Keep camera and actor paths separate; uniform character transforms only.
Use context.viewport.camera(native_camera) and context.viewport.size for all
output projections/layers, preserving world coordinates. Then implement
draft_frame(t, context) using that same renderer for full-timing low-res
iteration. The runtime never silently renders native then downscales.
See references/b6-fast-iteration.md; context.actions supplies validated
continuous action building blocks (references/b6-actions.md).
Design portrait and landscape independently. Lock quality-target.json and
review actual decoded playback; a limb pass never certifies film quality.
"""

def frame(t, context):
    raise NotImplementedError('Author the requested native scene, packages and actions before rendering.')
