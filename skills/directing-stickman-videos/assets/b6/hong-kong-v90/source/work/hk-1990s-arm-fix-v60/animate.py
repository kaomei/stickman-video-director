"""Local owner sleeve/arm repair, preserving V59 shot/action timing."""
from pathlib import Path
from functools import lru_cache
import importlib.util,math
import numpy as np
from PIL import Image,ImageDraw,ImageFilter

W=Path(__file__).resolve().parent;ROOT=W.parents[1]
spec=importlib.util.spec_from_file_location('hk59base',ROOT/'work/hk-1990s-action-v59/animate.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
b=m.b
WIDTH,HEIGHT,FPS,DURATION=1280,720,30,7.
GEOMETRY=m.GEOMETRY;CAMERA_LOG=m.CAMERA_LOG;CONTACTS=m.CONTACTS
T,S,R,pt,ease,mix,keys=m.T,m.S,m.R,m.pt,m.ease,m.mix,m.keys
old_room=b.room_plate
SLEEVE_POINTS=[(1321,472),(1351,473),(1387,467),(1416,454),(1437,468),
               (1452,483),(1465,501),(1460,506),(1431,520),(1432,577),
               (1434,600),(1392,606),(1336,602),(1296,598),
               (1301,574),(1308,546),(1317,519),(1304,515),
               (1297,507),(1300,499),(1309,485)]
BODY_ORIGIN=(1292,450)

@lru_cache(None)
def garment_mask():
    # Only the matte changes: ink, sleeve cloth and pigment are exact source pixels.
    ss=4;mask=Image.new('L',(1670*ss,941*ss));d=ImageDraw.Draw(mask)
    d.polygon([(x*ss,y*ss) for x,y in SLEEVE_POINTS],fill=255)
    # Retain the full width of the source ink at the outside of the matte.
    mask=mask.filter(ImageFilter.MaxFilter(9))
    return np.asarray(mask.resize((1670,941),Image.Resampling.LANCZOS),np.float32)/255.

@lru_cache(None)
def garment():
    src=np.asarray(Image.open(b.SRC/'cafe-clean-generated.png').convert('RGB'),np.float32)/255.
    alpha=garment_mask();x,y=BODY_ORIGIN
    a=np.dstack([src*alpha[:,:,None],alpha])[y:612,x:1470].copy()
    raw=np.zeros_like(a);raw[:,:,:3]=a[:,:,:3]/np.maximum(a[:,:,3:4],1e-6);raw[:,:,3]=a[:,:,3]
    Image.fromarray(np.uint8(np.clip(raw,0,1)*255)).save(W/'assets/owner-original-garment.png')
    return a

@lru_cache(None)
def room_plate():
    src=b.rgba(Image.open(b.SRC/'cafe-clean-generated.png'))
    clean=old_room()
    head=b.asset('owner-head');h,w=head.shape[:2]
    H=T(1351-w/2,378-h/2)
    mask=b.cv2.warpPerspective(head[:,:,3],H,(1670,941))
    mask=np.maximum(mask,garment_mask())
    mask=b.cv2.dilate((mask>.02).astype(np.uint8),np.ones((3,3),np.uint8)).astype(np.float32)
    # Original clean tiles outside the true silhouette are restored, rather
    # than keeping the old broad inpaint smears beside the shoulder.
    return src*(1-mask[:,:,None])+clean*mask[:,:,None]

@lru_cache(None)
def counter_plate():
    a=room_plate().copy();h,w=a.shape[:2];mask=np.zeros((h*2,w*2),np.uint8)
    p=[(980,535),(1120,542),(1300,575),(1460,585),(1670,620),(1670,941),(1050,941),(1010,860),(985,700),(972,601)]
    b.cv2.fillPoly(mask,[np.int32(p)*2],255,b.cv2.LINE_AA)
    al=b.cv2.resize(mask,(w,h),interpolation=b.cv2.INTER_AREA).astype(np.float32)/255
    # The source apron already terminates at the painted counter edge. Keep
    # it intact, including a few pixels of room for the existing torso lean.
    hole=b.cv2.dilate((garment_mask()>.05).astype(np.uint8),np.ones((13,13),np.uint8)).astype(np.float32)
    return a*(al*(1-hole))[:,:,None]

def owner_hand(c,p,C):
    b.put(c,'owner-hand',p,C,scale=.49)

def owner(c,C,t,paper_grip):
    lean=float(keys(t,[(1.2,0),(2.26,0),(2.42,.65),(2.85,-2.0),
                       (3.34,-2.0),(3.68,-.3),(4.35,-.3),(7,-.3)])[0])
    M=C@T(1351,816);B=M@T(0,-200)@R(lean)@T(0,200)
    x,y=BODY_ORIGIN
    b.blit(c,garment(),B@T(x-1351,y-816))
    angle=float(keys(t,[(1.2,0),(2.24,0),(2.48,-2.6),(3.18,-1.2),(3.7,.5),(7,.5)])[0])
    b.put(c,'owner-head',(0,-438),B,angle=angle)
    chains=[]
    # Shoulder pins sit under the intact painted sleeve hems.
    for side,sh in enumerate([(-37,-305),(93,-305)]):
        sh=np.asarray(sh,float)
        home=paper_grip if side==0 else pt(C,(1460.,565.))
        wr=pt(np.linalg.inv(B),home);d=wr-sh;dist=np.linalg.norm(d)
        normal=np.array([-d[1],d[0]])/max(.01,dist)
        # Relaxed obtuse elbow; the old +25 offset made a sharp zigzag.
        el=sh+d*.53+normal*min(10.,dist*.12)*(-1 if side==0 else 1)
        chain=(sh,el,wr);chains.append(chain)
        GEOMETRY.append({'kind':'owner','side':side,'wrist':pt(B,wr).tolist(),
                         'shoulder':pt(B,sh).tolist(),'elbow':pt(B,el).tolist(),
                         'distance':float(dist)})
    b.paint_arm(c,chains[1],B,True);owner_hand(c,chains[1][2],B)
    return B,chains

def owner_legacy(c,C,t,paper_grip=None):
    return owner(c,C,max(1.2,t-3),paper_grip if paper_grip is not None else pt(C,(1268.,571.)))

old_hand=b.hand
def compatible_hand(c,p,C,owner=False):
    if owner:owner_hand(c,p,C)
    else:old_hand(c,p,C)

# Patch the imported module instance only; V59 source/output stay untouched.
m.owner=owner;b.owner=owner_legacy
b.room_plate=room_plate;b.counter_plate=counter_plate
b.hand=compatible_hand;m.hand=compatible_hand

def draw(t):return m.draw(t)
