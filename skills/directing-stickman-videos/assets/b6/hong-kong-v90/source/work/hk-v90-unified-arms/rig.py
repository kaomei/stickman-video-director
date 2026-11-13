"""Shared two-bone arm binding for the HK short (local, painted 2.5D).

All deforming arms use solve(). Bone dimensions belong to the character,
never the camera or the shot. Orthographic depth permits foreshortening;
authored elbow controls specify a readable silhouette without moving grips.
Artwork, ink texture and painted hands are owned by the existing renderer.
"""
from dataclasses import dataclass
import math
import numpy as np

@dataclass(frozen=True)
class Binding:
    character: str
    pins: tuple
    lengths: tuple
    hand_style: str = 'hero'

BINDINGS = {
    'flower': Binding('flower', ((-44.,-221.),(59.,-221.)), (78.,76.)),
    'friend': Binding('friend', ((-49.,-224.),(59.,-221.)), (78.,76.)),
    'owner': Binding('owner', ((-46.,-302.),(96.,-307.)), (110.,105.), 'owner'),
    'chef-right': Binding('chef-right', (), (14.,14.)),
    'chef-left': Binding('chef-left', (), (12.,12.)),
    'reader-left': Binding('reader-left', (), (22.,22.)),
    'reader-right': Binding('reader-right', (), (22.,22.)),
    'tea-guest': Binding('tea-guest', (), (28.,27.)),
}
RECORDS=[]
LEGS=[]
FRAME=None

class ArmPose(list):
    def __init__(self, nodes, depth, binding, side, matrix):
        super().__init__(nodes)
        self.depth=np.asarray(depth,float)
        self.binding=binding
        self.side=side
        self.matrix=matrix

def point(M,p):
    q=M@np.r_[p,1.];return q[:2]/q[2]

def solve(binding, side, wrist, matrix, shoulder=None, pole=1,
          bow=10., elbow=None, plane=False, context=''):
    """Return the same pose type for foreground, background and counter arms.

    Preferred elbows are local pose controls. They must be reachable by
    both fixed bones; overreach raises instead of silently stretching.
    """
    assert side in (0,1), 'Invalid anatomical side'
    assert pole in (-1,1), 'Bend pole must be signed'
    assert np.isfinite(matrix).all() and np.asarray(matrix).shape==(3,3), 'Invalid actor matrix'
    assert np.isfinite(binding.lengths).all() and min(binding.lengths)>0, 'Invalid fixed bone lengths'
    assert np.isfinite(wrist).all() and (elbow is None or np.isfinite(elbow).all()), 'Invalid limb target'
    sh=np.asarray(binding.pins[side] if shoulder is None else shoulder,float)
    assert np.isfinite(sh).all(), 'Invalid shoulder pin'
    wr=np.asarray(wrist,float);a,z=binding.lengths
    delta=wr-sh;d=float(np.linalg.norm(delta))
    assert .01<d<a+z-1e-5,(binding.character,side,'overreach',d)
    u=delta/d;normal=np.array([-u[1],u[0]])
    along=(a*a-z*z+d*d)/(2*d)
    height=math.sqrt(max(0,a*a-along*along))
    if elbow is None:
        offset=height if plane else min(bow,.80*height)
        el=sh+along*u+pole*offset*normal
    else:
        el=np.asarray(elbow,float)
    up=float(np.linalg.norm(el-sh));fore=float(np.linalg.norm(wr-el))
    assert up<=a+1e-5 and fore<=z+1e-5,(binding.character,side,'elbow out of reach',up,fore)
    ez=math.sqrt(max(0,a*a-up*up))
    wz=ez-math.sqrt(max(0,z*z-fore*fore))
    xyz=np.array([[*sh,0.],[*el,ez],[*wr,wz]])
    ch=ArmPose([sh,el,wr],xyz,binding,side,matrix)
    upper=float(np.linalg.norm(xyz[1]-xyz[0]));lower=float(np.linalg.norm(xyz[2]-xyz[1]))
    assert abs(upper-a)<1e-5 and abs(lower-z)<1e-5
    RECORDS.append({'frame':FRAME,'actor':binding.character,'side':side,'context':context,
        'rig':'shared_two_bone_v90','local_chain':[p.tolist() for p in ch],
        'chain_3d':xyz.tolist(),'bone_lengths':[upper,lower],
        'shoulder':point(matrix,sh).tolist(),'elbow':point(matrix,el).tolist(),
        'wrist':point(matrix,wr).tolist(),'target':point(matrix,wr).tolist(),
        'grip_error':float(np.linalg.norm(point(matrix,ch[2])-point(matrix,wr))),
        'pole':pole,'signed_bend':float(np.cross(delta,el-sh)),
        'layer_contract':'upper under sleeve; forearm follows scene occlusion; hand at prop grip'})
    return ch

def paint(c, ch, matrix, backend, part='whole', far=False, width=None, curve=None):
    nodes=ch if part=='whole' else ch[:2] if part=='upper' else ch[1:]
    if width is None:backend.paint_arm(c,nodes,matrix,far)
    else:
        for p,q in zip(nodes,nodes[1:]):
            backend.line(c,p,q,matrix,width=width,curve=.3 if curve is None else curve)

def hand(c,ch,matrix,backend):
    # Source paint, original dimensions. Owner hand has a separate scale.
    if ch.binding.hand_style=='owner':
        backend.put(c,'owner-hand',ch[2],matrix,scale=.49)
    else:backend.hand(c,ch[2],matrix)

def foreground(c,ch,matrix,backend,garment,garment_matrix):
    """Connected reach over a table/deck, still underneath its sleeve.

    Clipping by the *painted garment* (not by a guessed rectangle) avoids
    both an ink line across the shirt and a detached elbow on the tabletop.
    Draw once: upper/forearm have no duplicated dark strokes.
    """
    before=c.copy()
    paint(c,ch,matrix,backend)
    alpha=backend.cv2.warpPerspective(garment[:,:,3],garment_matrix,
        (c.shape[1],c.shape[0]),flags=backend.cv2.INTER_LINEAR)[:,:,None]
    c[:]=c*(1-alpha)+before*alpha

def reset(frame):
    global FRAME
    FRAME=frame;RECORDS.clear();LEGS.clear()

def record_leg(actor,side,hip,ankle,matrix):
    scales=np.linalg.svd(np.asarray(matrix)[:2,:2],compute_uv=False)
    LEGS.append({'actor':actor,'side':side,'hip':np.asarray(hip).tolist(),
        'ankle':np.asarray(ankle).tolist(),'anisotropy':float(scales.max()/scales.min()),
        'screen_ankle':point(matrix,ankle).tolist(),'representation':'straight painted leg, planted shoe'})
