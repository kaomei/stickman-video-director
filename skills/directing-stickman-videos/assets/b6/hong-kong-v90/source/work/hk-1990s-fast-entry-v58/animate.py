"""V58: cut the walk, keep the registered prop action at native speed."""
from pathlib import Path
import importlib.util
import numpy as np
from PIL import Image

W=Path(__file__).resolve().parent
ROOT=W.parents[1]
spec=importlib.util.spec_from_file_location('hk57_base',ROOT/'work/hk-1990s-overhaul-v57/animate.py')
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
WIDTH,HEIGHT,FPS,DURATION=1280,720,30,7.0
STREET_END=.8
ACTION_START=1.2
GEOMETRY=base.GEOMETRY
CAMERA_LOG=base.CAMERA_LOG

def source_time(t):
    # Last 0.4s of the arrival, then the entire prop action unchanged.
    return 3.8+t-STREET_END if t<ACTION_START else 4.2+t-ACTION_START

def street(c,C,t,cx):
    b=base
    b.blit(c,b.asset('street-clean-generated'),C)
    b.put(c,'taxi',(250+48*t,700),C,scale=.85+.045*t,anchor=(.5,1))
    # The actor has already arrived. The camera reveals him, no walk loop.
    root=(1380,881);M=C@b.T(*root)@b.S(1.14)
    carry=b.pt(M,(67,-118))
    B,arms=b.hero(c,C,root,1.14,0,1,t,target=carry,defer=True)
    grip=b.pt(np.linalg.inv(C),carry)
    b.blit(c,b.bag(),C@b.T(*grip)@b.R(-3)@b.S(.85)@b.T(-21,-17))
    b.paint_arm(c,arms[1],B);b.hand(c,arms[1][2],B)
    F=C@b.T(-(cx-650)*.55,0)
    b.blit(c,b.asset('awning'),F)
    b.blit(c,b.asset('crates'),F@b.T(0,718))

def draw(t):
    b=base
    if t>=STREET_END:
        st=source_time(t)
        im=b.draw(st)
        for row in CAMERA_LOG:
            row['source_time']=row['time'];row['time']=t
        return im
    GEOMETRY.clear();CAMERA_LOG.clear()
    cx=650+360*b.ease(0,.67,t)
    v=np.array([cx,560.,1.03])
    C=b.camera_matrix(v)
    c=np.full((HEIGHT,WIDTH,3),[.96,.82,.68],np.float32)
    street(c,C,t,cx)
    glow=b.cv2.GaussianBlur(np.maximum(c-.84,0),(0,0),4.0)*.045
    CAMERA_LOG.append({'time':t,'shot':'street_reveal','cx_cy_scale':v.tolist(),
                       'actor_scale_anisotropy':1.0,'hero_walk_cycle':False})
    return Image.fromarray(np.uint8(np.clip(c+glow,0,1)*255))
