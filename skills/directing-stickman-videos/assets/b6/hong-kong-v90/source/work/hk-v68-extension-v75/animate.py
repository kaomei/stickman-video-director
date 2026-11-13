"""V68 source pictures + 12.4s contact-driven extension. No model calls.

The approved source cutouts, V60 sleeve mattes, V63 drawn face poses, V64
kitchen, V65 patrons and V68 opener are reused. New cameras are uniform
similarities; no anisotropic actor or background stretch is introduced.
"""
from pathlib import Path
from functools import lru_cache
import importlib.util, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W=Path(__file__).resolve().parent; ROOT=W.parents[1]
spec=importlib.util.spec_from_file_location('v75_v68',ROOT/'work/hk-1990s-taxi-v68/animate.py')
v68=importlib.util.module_from_spec(spec);spec.loader.exec_module(v68)
v65=v68.base.base;v64=v65.base;v63=v64.base;v60=v63.base;v59=v60.m
b=v68.b;cv2=b.cv2
T,R,S,pt,ease,mix,keys=b.T,b.R,b.S,b.pt,b.ease,b.mix,b.keys
WIDTH,HEIGHT,FPS,DURATION=1280,720,30,20.
LOG={};ARMS=[]
SOURCE=ROOT/'outputs/hk-1990s-taxi-v68/Hong-Kong-1990s-V68-Grounded-Taxi.mp4'
TIMELINE=json.loads((W/'timeline.json').read_text())
FONT=str(ROOT/'fonts/ArialBlack.ttf')

def bill_pose(t):
    return keys(t,[(7.6,1115,577,-10),(8.9,1115,577,-10),
                   (9.18,1110,572,-7),(10.9,1110,572,-7),
                   (11.18,1105,577,-11),(11.66,1162,548,2),
                   (14.7,1162,548,2),(15.22,1157,552,-1),
                   (16.45,1157,552,-1),(17.18,1115,581,-12),
                   (17.45,1117,577,-10),(20,1117,577,-10)])

def paper_matrix(t):
    x,y,a=bill_pose(t);return T(x,y)@R(a)@T(-46.5,-54.5)

@lru_cache(None)
def receipt(total=20):
    # Same painted paper, new legible ink. Perspective remains in prop space.
    original=b.asset('receipt'); ss=5
    a=np.clip(cv2.resize(original,(original.shape[1]*ss,original.shape[0]*ss),interpolation=cv2.INTER_CUBIC),0,1)
    im=Image.new('RGBA',(64*ss,86*ss));d=ImageDraw.Draw(im)
    raw=np.uint8(np.clip(original[:,:,:3]/np.maximum(original[:,:,3:4],1e-6),0,1)*255)
    tile=Image.fromarray(raw[75:88,43:60]).resize(im.size,Image.Resampling.BICUBIC)
    tile=Image.blend(tile,Image.new('RGB',tile.size,(252,219,163)),.55).convert('RGBA')
    im.alpha_composite(tile);d=ImageDraw.Draw(im)
    mono=str(ROOT/'fonts/CourierNewBold.ttf')
    f=ImageFont.truetype(mono,round(6.4*ss));title=ImageFont.truetype(mono,round(7.4*ss))
    col=(73,51,45,255)
    d.text((5*ss,5*ss),'RECEIPT',font=title,fill=col)
    lines=[(23,'TEA','5'),(37,'SERVICE','15'),(68,'TOTAL',str(total))]
    if total==25:lines.insert(2,(51,'EXPLAIN','5'))
    for y,left,right in lines:
        d.text((4*ss,y*ss),left,font=f,fill=col)
        d.text((59*ss,y*ss),right,font=f,fill=col,anchor='ra')
    d.line([(4*ss,60*ss),(59*ss,59*ss)],fill=col,width=ss)
    ov=b.rgba(im)
    H=cv2.getPerspectiveTransform(np.float32([(0,0),(64*ss,0),(64*ss,86*ss),(0,86*ss)]),
                                  np.float32([(13,24),(66,10),(83,89),(29,101)])*ss)
    p=cv2.warpPerspective(ov,H,(a.shape[1],a.shape[0]),flags=cv2.INTER_LINEAR)
    a[:,:,:3]=p[:,:,:3]+a[:,:,:3]*(1-p[:,:,3:4]);a[:,:,3]=np.maximum(a[:,:,3],p[:,:,3])
    return a

def camera(t):
    if t<9.35:
        return 'owner-price',keys(t,[(7.6,1310,433,1.78),(8.08,1315,430,1.81),(9.35,1315,429,1.81)])
    if t<11.15:
        return 'bill-breakdown',keys(t,[(9.35,1111,579,4.65),(9.62,1110,576,4.74),(11.15,1110,574,4.74)])
    if t<13.25:
        return 'customer-question',keys(t,[(11.15,1073,535,1.12),(11.8,1084,526,1.12),(13.25,1086,526,1.12)])
    if t<15.45:
        return 'owner-explains',keys(t,[(13.25,1310,440,1.78),(13.68,1314,437,1.80),(15.45,1314,437,1.80)])
    if t<17.15:
        p=bill_pose(t);return 'new-charge',np.array([p[0]+1,p[1]+1,4.65])
    if t<18.8:
        return 'customer-take',keys(t,[(17.15,823,441,1.70),(17.3,820,440,1.75),(17.54,826,442,1.71),(18.8,830,442,1.71)])
    return 'wide-cafe-payoff',keys(t,[(18.8,913,535,.90),(19.8,860,519,.86),(20,860,519,.86)])

def hero(c,C,t,target):
    M=C@T(885,895)@S(1.25)
    lean=float(keys(t,[(7.6,-.85),(10.95,-.85),(11.18,-1.1),(11.7,2.1),
                        (14.9,2.1),(16.5,2.1),(17.2,-3.0),(17.54,-.85),(20,-.85)])[0])
    B=M@T(15,-90)@R(lean)@T(-15,90)
    b.shadow(c,C,(885,895),75,10)
    for k in [0,1]:
        hip=(-1 if k==0 else 34,-90);hp=pt(np.linalg.inv(M)@B,hip)
        ankle=(-18 if k==0 else 42,-10.4)
        b.line(c,hp,ankle,M,width=.24 if k==0 else .30,curve=.4)
        shoe=b.asset('street-shoe-a' if k==0 else 'street-shoe-b')
        if k==0:shoe=np.ascontiguousarray(shoe[:,::-1])
        h,w=shoe.shape[:2]
        b.blit(c,shoe,M@T(-18 if k==0 else 42,0)@T(-14.3,-15.6)@S(44.85/w,15.6/h))
    off=keys(t,[(7.6,-49,-91),(11.05,-49,-91),(11.65,-66,-118),
                 (12.9,-66,-118),(13.6,-49,-91),(20,-49,-91)])
    arms=[b.arm_chain((-44,-221),off,far=True),b.arm_chain((59,-221),pt(np.linalg.inv(B),target))]
    b.paint_arm(c,arms[0],B,True);b.hand(c,arms[0][2],B)
    b.blit(c,b.character.body(),B@T(-78,-280))
    # Authored V63 drawing changes; the hair/head silhouette is unchanged.
    emotion=1. if t<10.99 or t>=17.08 else (.28 if t<13.25 else 0.)
    blink=float(ease(12.82,12.88,t)*(1-ease(12.91,13.02,t)))
    angle=float(keys(t,[(7.6,-1.8),(10.95,-1.8),(11.6,3.2),(12.65,3.2),
                        (13.3,.3),(16.8,.3),(17.22,-5.2),(17.53,-1.8),(20,-1.8)])[0])
    H=B@T(-5,-278)@R(angle-.45*lean)@T(5,278)@T(-137,-437)
    b.blit(c,b.character.head(emotion=emotion,blink=blink),H)
    for k,ch in enumerate(arms):
        ARMS.append({'actor':'customer','side':k,'shoulder':pt(B,ch[0]).tolist(),
                     'elbow':pt(B,ch[1]).tolist(),'wrist':pt(B,ch[2]).tolist(),
                     'distance_local':float(np.linalg.norm(ch[2]-ch[0]))})
    return B,arms

def owner(c,C,t,point):
    nod=float(ease(7.75,7.95,t)*(1-ease(8.14,8.42,t)))
    explain=float(ease(13.34,13.75,t)*(1-ease(14.8,15.22,t)))
    lean=-.3-.6*explain
    B=C@T(1351,816)@T(0,-200)@R(lean)@T(0,200)
    b.blit(c,v60.garment(),B@T(1292-1351,450-816))
    b.put(c,'owner-head',(0,-438),B,angle=.5+2.1*nod-1.5*explain)
    arms=[]
    for side,sh in enumerate([(-37,-305),(93,-305)]):
        sh=np.asarray(sh,float)
        home=point if side==0 else np.asarray([1460.,565.])
        wr=pt(np.linalg.inv(B),pt(C,home));delta=wr-sh;dist=float(np.linalg.norm(delta))
        assert dist<169,('owner overreach',t,dist)
        norm=np.array([-delta[1],delta[0]])/max(.01,dist)
        elbow=sh+delta*.53+norm*min(10.,dist*.12)*(-1 if side==0 else 1)
        ch=(sh,elbow,wr);arms.append(ch)
        ARMS.append({'actor':'owner','side':side,'shoulder':pt(B,sh).tolist(),
                     'elbow':pt(B,elbow).tolist(),'wrist':pt(B,wr).tolist(),'distance_local':dist})
    b.paint_arm(c,arms[1],B,True);v60.owner_hand(c,arms[1][2],B)
    return B,arms

def room(t):
    v64.FRAME_T=t-.6
    # Quiet background action is staggered; never rock the principal actor.
    patron_clock=1.0+(t-7.6)*.45 if t<13.8 else 4.65+(t-13.8)*.33
    return v65.patrons(patron_clock)

def extension(t):
    ARMS.clear();name,v=camera(t);C=b.camera_matrix(v)
    c=np.full((HEIGHT,WIDTH,3),[.96,.82,.68],np.float32)
    b.blit(c,room(t),C)
    P=paper_matrix(t);receiver=pt(P,(8,89));other=pt(P,(80,85))
    point_amount=float(ease(13.35,13.85,t)*(1-ease(15.04,15.38,t)))
    tap=float(ease(15.6,16.02,t)*(1-ease(16.30,16.66,t)))
    # The owner points at the opposite edge; the customer never loses grip.
    ownerpoint=mix((1268,571),other,max(point_amount,tap))
    OM,OA=owner(c,C,t,ownerpoint)
    HM,HA=hero(c,C,t,pt(C,receiver))
    b.blit(c,b.counter_plate(),C)
    b.paint_arm(c,OA[0],OM)
    b.shadow(c,C,(1110,611),46,5,.12)
    b.blit(c,b.bag(),C@T(1110,514)@S(.85)@T(-21,-17))
    b.blit(c,receipt(25 if t>=16.25 else 20),C@P@S(1/5))
    b.paint_arm(c,HA[1],HM);b.hand(c,HA[1][2],HM)
    v60.owner_hand(c,OA[0][2],OM)
    glow=cv2.GaussianBlur(np.maximum(c-.84,0),(0,0),4.)*.045
    LOG.clear();LOG.update(time=t,shot=name,camera=v.tolist(),uniform_actor_scale=True,
                          customer_grip_error=float(np.linalg.norm(pt(HM,HA[1][2])-pt(C,receiver))),
                          owner_point_error=float(np.linalg.norm(pt(OM,OA[0][2])-pt(C,other))) if max(point_amount,tap)>.999 else None,
                          bill_total=25 if t>=16.25 else 20,arms=ARMS.copy(),
                          kitchen=v64.KITCHEN_LOG.copy(),patrons=v65.PATRON_LOG.copy())
    return Image.fromarray(np.uint8(np.clip(c+glow,0,1)*255))

@lru_cache(40)
def caption_sprite(text):
    f=ImageFont.truetype(FONT,47)
    bb=f.getbbox(text,stroke_width=5);w=bb[2]-bb[0]+36;h=bb[3]-bb[1]+28
    im=Image.new('RGBA',(w,h));d=ImageDraw.Draw(im)
    d.text((18-bb[0],12-bb[1]),text,font=f,fill='white',stroke_width=5,stroke_fill=(36,27,31,255))
    return im

def captions(im,t):
    for row in TIMELINE['dialogue']:
        if row['start']-.035<=t<row['end']+.14:
            sp=caption_sprite(row['caption']);x=(WIDTH-sp.width)//2;y=HEIGHT-112
            im=im.convert('RGBA');im.alpha_composite(sp,(x,y));return im.convert('RGB')
    return im
