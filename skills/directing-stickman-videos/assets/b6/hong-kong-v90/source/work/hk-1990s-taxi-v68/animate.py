"""Road-projected taxi using the existing painted texture, with rolling wheels.

The exterior camera and pedestrians are V67; all interior frames are delegated
unchanged. Car geometry lives on one ground plane, rather than independent
screen-position and scale curves. This is local raster/geometry animation.
"""
from pathlib import Path
from functools import lru_cache
import importlib.util, math
import numpy as np
from PIL import Image

W=Path(__file__).resolve().parent; ROOT=W.parents[1]
spec=importlib.util.spec_from_file_location('hk67taxi',ROOT/'work/hk-1990s-environment-v67/animate.py')
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
b=base.b;cv2=b.cv2
WIDTH,HEIGHT,FPS,DURATION=1280,720,30,7.6
GEOMETRY,CAMERA_LOG,CONTACTS=base.GEOMETRY,base.CAMERA_LOG,base.CONTACTS
OPENING_LOG=base.OPENING_LOG
T,R,S,pt=b.T,b.R,b.S,b.pt
TAXI_LOG={}
VP=np.array([200.,550.]); FOCAL=820.; EYE=1.65
SPEED=1.45; START_Z=10.8; LANE_X=.35; WHEEL_R=.285

@lru_cache(None)
def face_texture(points):
    """Mask only the original painted plane before perspective mapping."""
    a=b.asset('taxi').copy();h,w=a.shape[:2]
    mask=np.zeros((h*4,w*4),np.uint8)
    cv2.fillConvexPoly(mask,np.int32(np.asarray(points)*4),255,cv2.LINE_AA)
    mask=cv2.resize(mask,(w,h),interpolation=cv2.INTER_AREA).astype(np.float32)/255
    return a*mask[:,:,None]

def project(points,t):
    p=np.asarray(points,dtype=float).copy()
    p[:,0]+=LANE_X;p[:,2]+=START_Z-SPEED*t
    return np.stack([VP[0]+FOCAL*p[:,0]/p[:,2],
                     VP[1]+FOCAL*(EYE-p[:,1])/p[:,2]],axis=1)

def face(c,C,t,src,world):
    dst=project(world,t)
    H=cv2.getPerspectiveTransform(np.float32(src),np.float32(dst))
    b.blit(c,face_texture(tuple(tuple(p) for p in src)),C@H)

def polygon(c,C,t,points,color,alpha=1):
    # Tiny wheel surfaces use a supersampled matte; no body or actor warping.
    dst=np.asarray([pt(C,p) for p in project(points,t)])
    lo=np.floor(dst.min(axis=0)-2).astype(int);hi=np.ceil(dst.max(axis=0)+2).astype(int)
    lo=np.maximum(lo,[0,0]);hi=np.minimum(hi,[WIDTH,HEIGHT])
    if np.any(hi<=lo):return
    ww,hh=hi-lo;mask=np.zeros((hh*3,ww*3),np.uint8)
    cv2.fillPoly(mask,[np.int32((dst-lo)*3)],255,cv2.LINE_AA)
    a=cv2.resize(mask,(ww,hh),interpolation=cv2.INTER_AREA).astype(np.float32)[:,:,None]/255*alpha
    roi=c[lo[1]:hi[1],lo[0]:hi[0]];roi[:]=roi*(1-a)+np.asarray(color)*a

def wheel(c,C,t,x,z):
    # Real axle and road distance determine roll. Tread is dark and subtle.
    theta=-SPEED*t/WHEEL_R
    angles=np.linspace(0,math.tau,41)
    # Cylinder tread has real width in a frontal view. A disk alone collapses
    # to a thin line when the car faces the lens.
    segments=[]
    for a,aa in zip(angles[:-1],angles[1:]):
        points=[(xx,WHEEL_R+WHEEL_R*math.cos(q),z+WHEEL_R*math.sin(q))
                for xx,q in [(x-.105,a),(x+.105,a),(x+.105,aa),(x-.105,aa)]]
        segments.append((np.mean([p[2] for p in points]),a,points))
    for _,a,points in sorted(segments,reverse=True):
        v=.16+.025*math.cos(a)+.012*math.sin(a*11+theta*9)
        polygon(c,C,t,points,[v+.015,v-.015,v])
    x-=.106
    ring=[(x,WHEEL_R+WHEEL_R*math.cos(q),z+WHEEL_R*math.sin(q)) for q in angles]
    polygon(c,C,t,ring,[.20,.15,.18])
    hub=[(x-.006,WHEEL_R+.12*math.cos(q),z+.12*math.sin(q)) for q in angles]
    polygon(c,C,t,hub,[.39,.30,.33])
    for q in [theta,theta+math.pi]:
        # Small rotating painted-sidewall mark, with no cartoon spokes.
        pts=[]
        for rad,a in [(.15,q-.10),(.23,q-.10),(.23,q+.10),(.15,q+.10)]:
            pts.append((x-.01,WHEEL_R+rad*math.cos(a),z+rad*math.sin(a)))
        polygon(c,C,t,pts,[.48,.37,.40],.65)

@lru_cache(None)
def ground_shadow():
    yy,xx=np.mgrid[0:96,0:192]
    al=np.exp(-2.5*((xx-96)/78)**2-2.5*((yy-48)/35)**2)*.34
    a=np.empty((96,192,4),np.float32);a[:,:,:3]=np.array([.29,.22,.31])*al[:,:,None];a[:,:,3]=al
    return a

def taxi(c,C,t):
    # Shadow and wheels share exactly the same world transform and ground.
    dst=project([(-1.10,0,-2.0),(1.10,0,-2.0),(1.10,0,2.0),(-1.10,0,2.0)],t)
    H=cv2.getPerspectiveTransform(np.float32([[0,0],[192,0],[192,96],[0,96]]),np.float32(dst))
    b.blit(c,ground_shadow(),C@H)
    for z in [1.13,-1.18]:
        wheel(c,C,t,.91,z)
        wheel(c,C,t,-.91,z)
    # Back-to-front textured planes: source pixels supply every car-body mark.
    face(c,C,t,[(13,49),(43,59),(44,104),(4,86)],
         [(-.90,.90,1.9),(-.90,.90,-1.9),(-.90,.32,-1.9),(-.90,.32,1.9)])
    face(c,C,t,[(22,25),(42,23),(43,49),(13,47)],
         [(-.69,1.45,.95),(-.69,1.45,.10),(-.83,1.0,-.65),(-.83,1.0,1.5)])
    face(c,C,t,[(60,14),(104,14),(123,23),(40,23)],
         [(-.69,1.45,.95),(.69,1.45,.95),(.69,1.45,.10),(-.69,1.45,.10)])
    face(c,C,t,[(43,22),(121,23),(137,48),(45,49)],
         [(-.69,1.45,.10),(.69,1.45,.10),(.83,1.0,-.65),(-.83,1.0,-.65)])
    face(c,C,t,[(43,50),(137,48),(157,58),(43,60)],
         [(-.83,1.0,-.65),(.83,1.0,-.65),(.90,.90,-1.9),(-.90,.90,-1.9)])
    face(c,C,t,[(43,60),(157,58),(158,103),(44,106)],
         [(-.90,.90,-1.9),(.90,.90,-1.9),(.90,.32,-1.9),(-.90,.32,-1.9)])
    face(c,C,t,[(63,0),(95,0),(99,13),(61,13)],
         [(-.24,1.68,.20),(.24,1.68,.20),(.29,1.45,.20),(-.29,1.45,.20)])
    center=project([(0,0,0)],t)[0]
    contact=project([(-.91,0,-1.18),(.91,0,-1.18),(-.91,0,1.13),(.91,0,1.13)],t)
    TAXI_LOG.clear();TAXI_LOG.update(time=float(t),center_world_m=[LANE_X,0,START_Z-SPEED*t],
        velocity_m_s=[0,0,-SPEED],road_projection={'vanishing_point':VP.tolist(),'focal':FOCAL,'eye_height':EYE},
        ground_contact_projected=contact.tolist(),wheel_roll_radians=float(-SPEED*t/WHEEL_R),
        position_world=center.tolist(),uniform_scale=float(FOCAL/(START_Z-SPEED*t)/95),body_wobble_degrees=0.)
    return TAXI_LOG.copy()

def street(c,C,t,cx):
    b.blit(c,base.asset('street-separated'),C)
    actors=[base.walker(c,C,'briefcase',t),base.walker(c,C,'coral',t)]
    car=taxi(c,C,t)
    foreground=C@T(-(cx-635)*.42,0)
    b.blit(c,b.asset('awning'),foreground@T(-100,0))
    b.blit(c,b.asset('crates'),foreground@T(-270,718))
    return actors,car

base.street=street
def draw(t):return base.draw(t)
