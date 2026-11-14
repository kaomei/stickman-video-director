"""Story-independent B6 timing helpers; use the production-owned runtime instances.

These helpers interpolate a character's fitted poses, never refit anatomy or copy
sample performances. Puppet.pose/render_scene retain all geometry and alpha QA.
"""
from __future__ import annotations

from dataclasses import dataclass, replace
import math


def _finite(*values):
    if not all(isinstance(v, (int, float)) and math.isfinite(v) for v in values):
        raise ValueError('Finite numeric values required')


def _ease(value):
    value = min(1., max(0., value))
    return value * value * (3. - 2. * value)


@dataclass(frozen=True)
class ArmSegment:
    """An explicit phase interval in one existing fitted action, with end holds."""
    action: str
    start: float
    end: float
    phase_start: float = 0.
    phase_end: float = 1.

    def __post_init__(self):
        _finite(self.start, self.end, self.phase_start, self.phase_end)
        if self.end <= self.start:
            raise ValueError('Arm segment end must follow start')
        if not 0 <= min(self.phase_start, self.phase_end) <= max(self.phase_start, self.phase_end) <= 1:
            raise ValueError('Action phases must be in [0, 1]')

    def sample(self, t):
        _finite(t)
        # PoseLibrary already eases phase; a second smoothstep would over-hold.
        u = min(1., max(0., (t - self.start) / (self.end - self.start)))
        return {'action': self.action,
                'phase': self.phase_start + (self.phase_end - self.phase_start) * u}


class ArmTrack:
    """Continuous per-arm overrides accepted directly by Puppet.pose.

    Pass the exact c.puppet_runtime and a loaded view's ArmSpec. Segment joins
    must agree in the actual character's two authored control angles. The
    runtime still checks sleeve direction, action envelopes, corrections,
    temporal movement and final painted alpha in the submitted scene.
    """
    def __init__(self, runtime, arm, segments):
        self.runtime = runtime
        self.arm = arm
        self.segments = tuple(segments)
        if not self.segments:
            raise ValueError('Nonempty arm track required')
        previous = None
        for segment in self.segments:
            if not isinstance(segment, ArmSegment):
                raise ValueError('ArmSegment entries required')
            if segment.action not in runtime.ACTIONS:
                raise ValueError('Unknown fitted action: ' + str(segment.action))
            first = runtime.PoseLibrary.sample(arm, segment.action, segment.phase_start)
            last = runtime.PoseLibrary.sample(arm, segment.action, segment.phase_end)
            runtime.forward_kinematics(arm, first)
            runtime.forward_kinematics(arm, last)
            if previous is not None:
                if abs(previous.end - segment.start) > 1e-8:
                    raise ValueError('Arm track must have contiguous intervals')
                old = runtime.PoseLibrary.sample(arm, previous.action, previous.phase_end)
                if max(abs(float(a)-float(b)) for a, b in zip(old, first)) > 1e-6:
                    raise ValueError('Authored arm poses jump at segment boundary')
            previous = segment

    def sample(self, t):
        """Return action/phase only; before/after the track, hold its endpoint."""
        _finite(t)
        selected = next((s for s in self.segments if t < s.end), self.segments[-1])
        return selected.sample(t)


def _duration(value, name, allow_zero=False):
    _finite(value)
    valid = value >= 0 if allow_zero else value > 0
    if not valid:
        raise ValueError(name + ' duration must be ' + ('nonnegative' if allow_zero else 'positive'))


def _track(runtime, arm, start, steps):
    _finite(start)
    segments = []
    for action, duration, a, b in steps:
        _duration(duration, action, allow_zero=(a == b))
        if duration:
            segments.append(ArmSegment(action, start, start + duration, a, b))
            start += duration
    return ArmTrack(runtime, arm, segments)


def offer_track(runtime, arm, *, start, reach=.25, offer=.18, hold=.3, retract=.32):
    """Rest → reach → offer → readable hold → authored retract → rest.

    Use one track on the acting arm; the unused arm remains rest. Contact needs
    its own physically staged timeline and bounded wrist targets.
    """
    return _track(runtime, arm, start, [
        ('reach', reach, 0., 1.), ('offer', offer, 0., 1.),
        ('offer', hold, 1., 1.), ('retract', retract, 0., 1.),
    ])


def receive_track(runtime, arm, *, start, reach=.25, receive=.18, hold=.3, withdraw=.3):
    """Rest → reach → receive → hold → reverse receive/reach → rest.

    Reversing the fitted receive path avoids jumping into retract's offer
    starting pose. Keep an acquired prop on the same contact timeline during
    withdrawal; this helper alone does not release or move it.
    """
    _duration(withdraw, 'withdraw')
    return _track(runtime, arm, start, [
        ('reach', reach, 0., 1.), ('receive', receive, 0., 1.),
        ('receive', hold, 1., 1.), ('receive', withdraw/2, 1., 0.),
        ('reach', withdraw/2, 1., 0.),
    ])


def handoff_timeline(runtime, *, start, shared_start, shared_end, end,
                     giver, recipient, paper_size, initial_pose, shared_pose,
                     final_pose, color='#ced0a4'):
    """One prop, owner → shared → recipient, through the strict runtime API.

    Holder dictionaries contain actor_id, anatomical arm and a visible art UV
    grip. Poses are [center_x, center_y, angle_deg] in one authored contact plane.
    Project the returned state once with runtime.transform_contact when needed.
    """
    _finite(start, shared_start, shared_end, end)
    if not start < shared_start < shared_end < end:
        raise ValueError('Handoff needs positive giver/shared/recipient intervals')
    if (giver.get('actor_id'), giver.get('arm')) == (recipient.get('actor_id'), recipient.get('arm')):
        raise ValueError('Handoff requires distinct supporting hands')
    return runtime.ContactTimeline([
        {'t0': start, 't1': shared_start, 'state': 'owner', 'holders': [dict(giver)],
         'paper_start': initial_pose, 'paper_end': shared_pose},
        {'t0': shared_start, 't1': shared_end, 'state': 'shared',
         'holders': [dict(giver), dict(recipient)], 'paper_start': shared_pose},
        {'t0': shared_end, 't1': end, 'state': 'owner', 'holders': [dict(recipient)],
         'paper_start': shared_pose, 'paper_end': final_pose},
    ], paper_size=paper_size, color=color)


def reaction_nod(t, *, start, attack=.10, settle=.22, angle=3.):
    """One rigid head accent and return, not a repeated full-body oscillation.

    It does not select an expression or certify neck paint overlap. Submit the
    result as head_angle_deg to Puppet.pose, whose existing ±20°/neck QA applies.
    """
    _finite(t, start, angle)
    _duration(attack, 'attack'); _duration(settle, 'settle')
    if abs(angle) > 20:
        raise ValueError('Reaction angle exceeds the runtime head limit')
    if t <= start or t >= start + attack + settle:
        return 0.
    if t <= start + attack:
        return angle * _ease((t-start)/attack)
    return angle * (1. - _ease((t-start-attack)/settle))


def camera_landing(camera, world_anchor, screen_anchor, *, z=None, focal=None):
    """Solve a camera landing that frames one explicit world point on screen.

    This changes camera coordinates only. Painted actors use billboard_matrix;
    the scene still needs a wide wall/ground and separately placed depth layers.
    """
    if len(world_anchor) != 3 or len(screen_anchor) != 2:
        raise ValueError('World xyz and screen xy anchors required')
    _finite(*world_anchor, *screen_anchor)
    new = replace(camera, z=camera.z if z is None else z,
                  focal=camera.focal if focal is None else focal)
    depth = world_anchor[2] - new.z
    if depth < new.near:
        raise ValueError('Camera landing crosses the subject near plane')
    x = world_anchor[0] - (screen_anchor[0]-new.width/2)*depth/new.focal
    y = world_anchor[1] - (screen_anchor[1]-new.principal_y)*depth/new.focal
    return replace(new, x=x, y=y)


class CameraTravel:
    """A deliberate travel followed by a stable hold, using c.space cameras.

    Construct separately for each authored shot. A cut is an explicit shot
    boundary, not interpolation between unrelated spaces. The purpose string is
    traceable planning information, not evidence of creative acceptance.
    """
    def __init__(self, space, camera, *, start, end, destination, purpose):
        _finite(start, end)
        if end <= start or not isinstance(purpose, str) or not purpose.strip():
            raise ValueError('Positive camera interval and narrative purpose required')
        if not isinstance(destination, dict) or not destination:
            raise ValueError('Explicit destination coordinates required')
        if not set(destination) <= {'x', 'y', 'z', 'focal', 'principal_y'}:
            raise ValueError('Unknown camera coordinate')
        _finite(*destination.values())
        self.space = space; self.camera = camera
        self.start = start; self.end = end
        self.destination = dict(destination); self.purpose = purpose.strip()
        # Validate the exact final Camera immediately, rather than mid-render.
        self.sample(end)

    def sample(self, t):
        _finite(t)
        return self.space.camera_move(self.camera, t, self.start, self.end, **self.destination)

    def trace(self, t, anchors):
        return {**self.space.trace_sample(t, self.sample(t), anchors), 'purpose': self.purpose}
