"""V78: black-coat arm silhouette repair over locked V77 acting/camera.

The V77 default elbow pole bent both of this coat's arms into its torso.
Keep the original strokes, sleeve anchors, contacts and acting; move resting
hands outside the painted coat and bend elbows out into negative space.
"""
from pathlib import Path
import importlib.util
import numpy as np

W = Path(__file__).resolve().parent
ROOT = W.parents[1]
sp = importlib.util.spec_from_file_location('v78_source_v77', W.parent/'hk-v77-actions/animate.py')
m = importlib.util.module_from_spec(sp)
sp.loader.exec_module(m)
b = m.b
cv2 = m.cv2
LOG = m.LOG
ARMS = m.ARMS
original_actor = m.actor
original_arm = m.arm

def arm(c, actor, side, sh, wr, M):
    if actor != 'friend':
        return original_arm(c, actor, side, sh, wr, M)
    sh = np.asarray(sh, float)
    wr = np.asarray(wr, float)
    d = float(np.linalg.norm(wr-sh))
    assert d < 169, (actor, side, d)
    # Coat-specific pole: far arm bends left, near arm bends right.
    ch = b.arm_chain(sh, wr, far=bool(side == 1))
    # A shallow bend reads as a relaxed stick arm. Keep the wrist/contact
    # fixed rather than flaring the resting elbow into a hands-on-hips pose.
    axis = (wr-sh)/max(d, .01)
    projected = sh + axis*np.dot(ch[1]-sh, axis)
    ch = (ch[0], projected + (ch[1]-projected)*.68, ch[2])
    b.paint_arm(c, ch, M, side == 0)
    b.hand(c, ch[2], M)
    # Audit silhouette visibility against the actual painted coat alpha.
    coat = m.strong('strong-body')
    samples = np.concatenate([np.linspace(a, z, 40) for a, z in zip(ch, ch[1:])])
    uv = (samples + (65., 280.))/.4
    ij = np.rint(uv).astype(int)
    inside = (ij[:, 0] >= 0) & (ij[:, 0] < coat.shape[1]) & (ij[:, 1] >= 0) & (ij[:, 1] < coat.shape[0])
    covered = np.zeros(len(ij), dtype=bool)
    covered[inside] = coat[ij[inside, 1], ij[inside, 0], 3] > .5
    ARMS.append({'actor': actor, 'side': side, 'local_reach': d,
                 'shoulder': b.pt(M, ch[0]).tolist(), 'elbow': b.pt(M, ch[1]).tolist(),
                 'wrist': b.pt(M, ch[2]).tolist(), 'target': b.pt(M, wr).tolist(),
                 'grip_error': float(np.linalg.norm(b.pt(M, ch[2])-b.pt(M, wr))),
                 'centerline_fraction_outside_coat': float(np.mean(~covered)),
                 'elbow_pole': 'outward_coat_silhouette'})

def actor(c, C, kind, root, scale, wrists, t, **kwargs):
    if kind == 'friend':
        wrists = [np.asarray(w, float).copy() for w in wrists]
        if kwargs.get('standing', False):
            # Keep the same gesture timing/peak. Only its hidden resting hand
            # shifts outside the coat; no movement is added to the torso/head.
            wrists[0][0] = 744.
            gesture = np.clip((wrists[1][0]-882.)/(945.-882.), 0., 1.)
            wrists[1][0] = 913. + (945.-913.) * gesture
        else:
            wrists[0][0] = 478.
    return original_actor(c, C, kind, root, scale, wrists, t, **kwargs)

m.arm = arm
m.actor = actor

def draw(t):
    return m.draw(t)

def __getattr__(name):
    return getattr(m, name)
