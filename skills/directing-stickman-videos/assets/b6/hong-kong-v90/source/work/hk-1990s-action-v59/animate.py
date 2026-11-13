"""V59 contact-driven acting; the V58 fast entry and source paint are kept.

The feet stay planted. The torso pivots at the hips, the head follows late,
and both hand contacts are computed from the one moving prop transform.
No model calls, squash/stretch, texture noise, or looping body wobble.
"""
from pathlib import Path
import importlib.util,math
import numpy as np
from PIL import Image

W=Path(__file__).resolve().parent;ROOT=W.parents[1]
spec=importlib.util.spec_from_file_location('hk58source',ROOT/'work/hk-1990s-fast-entry-v58/animate.py')
previous=importlib.util.module_from_spec(spec);spec.loader.exec_module(previous)
b=previous.base
WIDTH,HEIGHT,FPS,DURATION=1280,720,30,7.
GEOMETRY=[];CAMERA_LOG=[];CONTACTS=[]
T,S,R,pt,ease,mix,keys=b.T,b.S,b.R,b.pt,b.ease,b.mix,b.keys
blit,put,line,hand,paint_arm=b.blit,b.put,b.line,b.hand,b.paint_arm

def bezier(a,c,d,z,u):
    return (1-u)**3*np.asarray(a)+3*(1-u)**2*u*np.asarray(c)+3*(1-u)*u*u*np.asarray(d)+u**3*np.asarray(z)

def bag_pose(t):
    if t<1.38:
        xy=mix((968.75,747.5),(963,754),ease(1.22,1.38,t))
    elif t<1.96:
        xy=bezier((963,754),(969,618),(1074,486),(1110,508),ease(1.38,1.96,t))
    else:xy=mix((1110,508),(1110,514),ease(1.96,2.04,t))
    angle=float(keys(t,[(1.2,-3),(1.38,-8),(1.63,-14),(1.90,-3),(2.04,0)] )[0])
    return np.r_[xy,angle]

def paper(t):
    return keys(t,[(1.2,1260,546,-8),(2.26,1260,546,-8),
                   (2.40,1269,551,-12),(2.94,1184,520,4),
                   (3.12,1174,518,3),(3.34,1174,518,3),
                   (3.70,1116,570,-5),(4.35,1116,570,-5),
                   (4.52,1118,565,-7),(4.68,1109,581,-13),
                   (4.96,1115,577,-10),(7,1115,577,-10)])

def paper_matrix(t):
    x,y,a=paper(t);return T(x,y)@R(a)@T(-46.5,-54.5)

def hero(c,C,t,target):
    M=C@T(885,895)@S(1.25)
    # A single weight shift for each task. No periodic sway.
    lean=float(keys(t,[(1.2,0),(1.38,-.6),(1.83,2.8),(2.06,3.1),
                       (2.40,.6),(2.67,1),(3.10,2.6),(3.35,2.6),
                       (3.76,.3),(4.35,.3),(4.51,1.0),(4.68,-3.4),
                       (5.02,-.85),(7,-.85)])[0])
    B=M@T(15,-90)@R(lean)@T(-15,90)
    b.shadow(c,C,(885,895),75,10)
    for k in [0,1]:
        hip=(-1 if k==0 else 34,-90)
        hip_on_ground=pt(np.linalg.inv(M)@B,hip)
        ankle=(-18 if k==0 else 42,-10.4)
        line(c,hip_on_ground,ankle,M,width=.24 if k==0 else .30,curve=.4)
        shoe=b.asset('street-shoe-a' if k==0 else 'street-shoe-b')
        if k==0:shoe=np.ascontiguousarray(shoe[:,::-1])
        h,w=shoe.shape[:2]
        blit(c,shoe,M@T(-18 if k==0 else 42,0)@T(-14.3,-15.6)@S(44.85/w,15.6/h))
    shoulders=[np.array([-44.,-221]),np.array([59.,-221])]
    offhand=keys(t,[(1.2,-44,-81),(1.90,-48,-83),(2.42,-44,-81),
                    (4.48,-44,-81),(4.69,-53,-100),(5.02,-49,-91),(7,-49,-91)])
    arms=[b.arm_chain(shoulders[0],offhand,far=True),
          b.arm_chain(shoulders[1],pt(np.linalg.inv(B),target))]
    paint_arm(c,arms[0],B,True);hand(c,arms[0][2],B)
    blit(c,b.character.body(),B@T(-78,-280))
    emotion=float(ease(4.52,4.69,t))
    blink=float(ease(2.31,2.37,t)*(1-ease(2.38,2.46,t)))
    if t>5.65:blink=float(ease(5.86,5.92,t)*(1-ease(5.93,6.04,t)))
    # Keep the original heavy meme eyelids between blinks and the surprise.
    # Tracking is conveyed by the head, without replacing the neutral eyes.
    gaze=0.
    headangle=float(keys(t,[(1.2,0),(1.52,1.7),(2.04,2.7),(2.37,.2),
                            (2.66,-1.2),(3.12,1.8),(3.79,3.5),(4.48,4.3),
                            (4.69,-5.2),(5.04,-1.8),(7,-1.8)])[0])
    H=B@T(-5,-278)@R(headangle-.45*lean)@T(5,278)@T(-137,-437)
    blit(c,b.character.head(emotion=emotion,blink=blink,gaze=gaze),H)
    for k,chain in enumerate(arms):
        GEOMETRY.append({'kind':'hero','side':k,'wrist':pt(B,chain[2]).tolist(),
                         'shoulder':pt(B,chain[0]).tolist(),
                         'distance':float(np.linalg.norm(chain[2]-chain[0])),
                         'torso_degrees':lean})
    return B,arms

def owner(c,C,t,paper_grip):
    lean=float(keys(t,[(1.2,0),(2.26,0),(2.42,.65),(2.85,-2.0),
                       (3.34,-2.0),(3.68,-.3),(4.35,-.3),(7,-.3)])[0])
    M=C@T(1351,816);B=M@T(0,-200)@R(lean)@T(0,200)
    put(c,'owner-body',(0,-274),B)
    angle=float(keys(t,[(1.2,0),(2.24,0),(2.48,-2.6),(3.18,-1.2),(3.7,.5),(7,.5)])[0])
    put(c,'owner-head',(0,-438),B,angle=angle)
    chains=[]
    for side,sh in enumerate([(-71,-294),(66,-294)]):
        home=paper_grip if side==0 else pt(C,(1460.,565.))
        wr=pt(np.linalg.inv(B),home)
        chain=b.arm_chain(sh,wr,far=side==1);chains.append(chain)
        GEOMETRY.append({'kind':'owner','side':side,'wrist':pt(B,wr).tolist(),
                         'shoulder':pt(B,sh).tolist(),
                         'distance':float(np.linalg.norm(np.asarray(wr)-sh))})
    paint_arm(c,chains[1],B,True);hand(c,chains[1][2],B,True)
    return B,chains

def cam(t):
    if t<3.08:
        return 'shared',keys(t,[(1.2,1047,537,1.08),(1.37,1047,537,1.08),
                               (2.04,1071,523,1.11),(2.30,1071,523,1.11),
                               (2.98,1080,521,1.12),(3.079,1080,521,1.12)])
    if t<4.35:
        return 'contact',keys(t,[(3.08,1192,585,2.70),(3.30,1192,585,2.70),
                                (3.79,1145,612,2.70),(4.349,1145,612,2.70)])
    return 'reaction',keys(t,[(4.35,840,450,1.62),(4.68,824,441,1.74),
                             (4.94,826,442,1.71),(7,826,442,1.71)])

def interior(c,C,t):
    blit(c,b.room_plate(),C)
    P=paper_matrix(t);receiver=pt(P,(8,89));giver=pt(P,(80,85))
    release=float(ease(3.35,3.52,t))
    ownerhome=(1268.,571.)
    # Release follows a secured receiver grip, then a small elbow-led retreat.
    ownergrip=mix(giver,ownerhome,release)
    OM,OA=owner(c,C,t,pt(C,ownergrip))
    bp=bag_pose(t);grip=bp[:2]
    if t<=2.08:right=grip
    elif t<2.42:
        right=bezier((1110,514),(1089,493),(1059,522),(1061,561),ease(2.08,2.42,t))
    elif t<2.63:right=np.array([1061.,561.])
    elif t<3.12:
        right=bezier((1061,561),(1055,501),(1125,502),receiver,ease(2.63,3.12,t))
    else:right=receiver
    HB,HA=hero(c,C,t,pt(C,right))
    blit(c,b.counter_plate(),C)
    paint_arm(c,OA[0],OM)
    # Contact shadow develops as the bag reaches the counter plane.
    if t>=1.83:b.shadow(c,C,(1110,611),46,5,.12*float(ease(1.83,2.04,t)))
    blit(c,b.bag(),C@T(*grip)@R(bp[2])@S(.85)@T(-21,-17))
    blit(c,b.asset('receipt'),C@P)
    paint_arm(c,HA[1],HB);hand(c,HA[1][2],HB)
    hand(c,OA[0][2],OM,True)
    CONTACTS.append({'time':t,'bag_handle':pt(C,grip).tolist(),
                     'hero_wrist':pt(HB,HA[1][2]).tolist(),
                     'receiver_grip':pt(C,receiver).tolist(),
                     'owner_wrist':pt(OM,OA[0][2]).tolist(),
                     'giver_grip':pt(C,giver).tolist(),
                     'hero_holds_bag':t<=2.08,'hero_holds_paper':t>=3.12,
                     'owner_holds_paper':t<=3.35,'owner_release':release})

def draw(t):
    GEOMETRY.clear();CAMERA_LOG.clear();CONTACTS.clear()
    if t<1.2:
        im=previous.draw(t)
        GEOMETRY.extend(previous.GEOMETRY.copy());CAMERA_LOG.extend(previous.CAMERA_LOG.copy())
        return im
    name,v=cam(t);C=b.camera_matrix(v)
    c=np.full((HEIGHT,WIDTH,3),[.96,.82,.68],np.float32)
    interior(c,C,t)
    glow=b.cv2.GaussianBlur(np.maximum(c-.84,0),(0,0),4.)*.045
    CAMERA_LOG.append({'time':t,'shot':name,'cx_cy_scale':v.tolist(),'actor_scale_anisotropy':1.0})
    return Image.fromarray(np.uint8(np.clip(c+glow,0,1)*255))
