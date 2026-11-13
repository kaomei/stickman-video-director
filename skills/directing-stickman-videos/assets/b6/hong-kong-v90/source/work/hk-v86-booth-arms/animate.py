"""Seated arm repair only. Reuse locked V85 footage outside booth shots.

Arm lengths are defined for exposed short-sleeve limbs, rather than the old
standing rig's 88/82 lengths with a flattened elbow. Table contacts are
reachable by construction. Upper arms are behind the painted shirt and
occluded by the table; foreground forearms are drawn once on the tabletop.
"""
from pathlib import Path
import importlib.util,json,math
from functools import lru_cache
import numpy as np
from PIL import Image,ImageDraw,ImageFont
W=Path(__file__).resolve().parent;ROOT=W.parents[1]
s=importlib.util.spec_from_file_location('v86_locked_v78',ROOT/'work/hk-v78-arm-clarity/animate.py')
locked=importlib.util.module_from_spec(s);s.loader.exec_module(locked)
m=locked.m;b=m.b;b.cv2.setNumThreads(2)
T,R,S,pt,ease,mix,keys=b.T,b.R,b.S,b.pt,b.ease,b.mix,b.keys
m.TL['captions']=json.loads((ROOT/'work/hk-v80-native-rate/captions.json').read_text())
LENGTHS=(55.,54.)

def chain(sh,wr,pole):
    sh=np.asarray(sh,float);wr=np.asarray(wr,float);delta=wr-sh;d=float(np.linalg.norm(delta));a,z=LENGTHS
    assert abs(a-z)+.1<d<a+z-.1,('seated arm overreach',d,wr.tolist())
    u=delta/d;along=(a*a-z*z+d*d)/(2*d);height=math.sqrt(max(0,a*a-along*along))
    el=sh+along*u+pole*height*np.array([-u[1],u[0]])
    return np.array([sh,el,wr])

def paint_segment(c,a,z,B,far=False):
    b.line(c,a,z,B,width=.24 if far else .30,curve=.6 if far else -.6)

def actor(c,C,kind,root,scale,wrists,t,emotion=0,headangle=0,mirror=False,pose='neutral',speak=False,lean=0):
    M=C@T(*root)@S(-scale if mirror else scale,scale)
    B=M@T(15,-90)@R(lean)@T(-15,90)
    local=[pt(np.linalg.inv(B),pt(C,p)) for p in wrists]
    arms=[chain((-44,-221),local[0],1),chain((59,-221),local[1],1)]
    # Both sleeve origins lie underneath the original painted sleeve hem.
    # Far arm sits behind the body/table. Near upper arm also sits behind
    # the torso; only the contact forearm comes forward over the tabletop.
    b.paint_arm(c,arms[0],B,True);b.hand(c,arms[0][2],B)
    paint_segment(c,*arms[1][:2],B)
    if kind=='flower':
        b.blit(c,b.character.body(),B@T(-78,-280))
        blink=sum(float(ease(a,a+.045,t)*(1-ease(a+.10,a+.17,t))) for a in [7.60,13.25,15.54,19.16])
        h=b.character.head(emotion=emotion,blink=blink)
        H=B@T(-5,-278)@R(headangle)@T(5,278)@T(-137,-437);b.blit(c,h,H)
    else:
        b.blit(c,m.strong('strong-body'),B@T(-65,-280)@S(.40))
        n='strong-speak' if speak else ('strong-tight' if pose=='tight' else 'strong-head')
        if 17.30<t<17.43:n='strong-tight-blink' if pose=='tight' else 'strong-head-blink'
        H=B@T(-5,-278)@R(headangle)@T(5,278)@T(-104,-467)@S(.31);b.blit(c,m.strong(n),H)
    for side,ch in enumerate(arms):
        m.ARMS.append({'actor':kind,'side':side,'local_reach':float(np.linalg.norm(ch[2]-ch[0])),
          'upper_length':float(np.linalg.norm(ch[1]-ch[0])),'forearm_length':float(np.linalg.norm(ch[2]-ch[1])),
          'local_chain':ch.tolist(),'shoulder':pt(B,ch[0]).tolist(),'elbow':pt(B,ch[1]).tolist(),
          'wrist':pt(B,ch[2]).tolist(),'target':pt(C,wrists[side]).tolist(),
          'grip_error':float(np.linalg.norm(pt(B,ch[2])-pt(C,wrists[side]))),
          'pole':1,'occlusion':'upper behind sleeve/table; near forearm above tabletop'})
    return B,arms

def overlay(c,B,arms):
    ch=arms[1];paint_segment(c,ch[1],ch[2],B);b.hand(c,ch[2],B)

CONTACT=np.array([-68.,-10.])
def plate_x(t):
    # C1 continuous acceleration under the hand, then a friction-like coast.
    if t<=7.04:return 705.
    if t<7.20:
        u=(t-7.04)/.16
        return 705.+55.*(-2*u**3+3*u*u)+(.16*550.)*(u**3-u*u)
    if t<7.40:
        u=(t-7.20)/.20
        return 760.*(2*u**3-3*u*u+1)+(.20*550.)*(u**3-2*u*u+u)+840.*(-2*u**3+3*u*u)
    return float(keys(t,[(7.4,840),(7.51,837.57),(7.61,840),(20,840)])[0])

def plate_action(t):
    plate=np.array([plate_x(t),655.]);home=np.array([690.,627.]);edge=plate+CONTACT
    if t<7.04:
        wrist=m.motion(t,[(6.6,home),(6.78,(672,620)),(6.91,(650,627)),(7.04,edge)])
    elif t<=7.20:wrist=edge.copy()
    elif t<7.70:
        wrist=m.motion(t,[(7.20,(692,645)),(7.28,(706,625)),(7.48,(700,617)),(7.70,home)])
    else:wrist=home.copy()
    if t>=18.65:
        # The closing beat is an empty-hand gesture. Do not remotely bind a
        # resting hand to the now distant plate (or move the plate unaided).
        wrist=m.motion(t,[(18.65,home),(18.88,(700,614)),(19.05,(700,614)),(19.55,home),(20,home)])
    return plate,wrist

@lru_cache(None)
def foreground_pot():
    # The sugar pot belongs in front of the resting forearm. Restore the
    # exact original paint with a silhouette matte, not a rectangular patch.
    x0,y0,x1,y1=966,565,1024,638
    ar=m.old('room-clean')[y0:y1,x0:x1].copy();h,w=ar.shape[:2]
    points=np.array([(989,585),(991,582),(990,579),(991,577),(994,576),(997,577),
      (999,580),(998,583),(998,586),(1006,587),(1016,591),(1018,595),
      (1020,599),(1020,605),(1018,608),(1018,627),(1014,631),(1002,633),
      (984,632),(975,628),(974,607),(970,604),(970,599),(973,597),(974,591),(982,587)],float)
    mask=np.zeros((h*4,w*4),np.uint8)
    b.cv2.fillPoly(mask,[np.rint((points-[x0,y0])*4).astype(np.int32)],255,b.cv2.LINE_AA)
    alpha=b.cv2.resize(mask,(w,h),interpolation=b.cv2.INTER_AREA).astype(np.float32)/255.
    ar*=alpha[:,:,None]
    return ar

def booth(t):
    name,v=m.booth_camera(t);C=b.camera_matrix(v)
    c=np.full((720,1280,3),[.96,.82,.68],np.float32);m.room(c,C,t)
    plate,push=plate_action(t)
    fangle=float(keys(t,[(6.6,-.8),(6.90,1.5),(7.14,1.5),(7.53,-1.2),(7.90,-.4),
        (13.7,-.4),(16.65,-.4),(16.82,2.8),(17.08,2.8),(17.34,.2),(18.3,.2),(18.78,-1.3),(19.3,.1),(20,.1)])[0])
    lean=float(keys(t,[(6.6,0),(6.9,-.6),(7.4,-1.65),(7.63,-1.4),(8.08,0),(20,0)])[0])
    B,A=actor(c,C,'friend',(555,815),1.15,[(482,671),push],t,headangle=fangle,lean=lean,
              pose='tight' if t>=16.65 else 'neutral',speak=7.07<=t<7.85 or 18.4<=t<19.1)
    refuse=float(ease(14.24,14.43,t)*(1-ease(15.49,15.81,t)))
    wr=m.motion(t,[(6.6,(963,634)),(13.7,(963,634)),(14.18,(963,634)),
        (14.43,(945,601)),(14.65,(940,594)),(15.44,(940,594)),(15.81,(963,634)),(20,(963,634))])
    angle=float(keys(t,[(6.6,0),(7.16,0),(7.45,2.3),(7.77,2.3),(8.12,-.7),
        (13.7,-.7),(14.15,-.7),(14.34,-2.4),(15.43,-2.4),(15.81,-.7),(20,-.7)])[0])
    Q,QA=actor(c,C,'flower',(1073,806),1.15,[(1136,672),wr],t,
               emotion=.28 if t>=13.7 else 0,headangle=angle,mirror=True,lean=-.65*refuse)
    b.blit(c,m.old('table-front'),C)
    b.shadow(c,C,plate+(0,4),81,10,.12)
    a=m.old('plate');h,w=a.shape[:2];b.blit(c,a,C@T(*plate)@S(.44)@T(-w/2,-h/2))
    inertia=float(keys(t,[(6.6,0),(7.04,0),(7.24,-2),(7.4,-1),(7.51,1.5),(7.65,0),(20,0)])[0])
    bun=plate+(inertia,-23);a=m.old('bun-whole');h,w=a.shape[:2]
    b.blit(c,a,C@T(*bun)@R(inertia*.45)@S(.36)@T(-w/2,-h/2))
    overlay(c,B,A);overlay(c,Q,QA)
    # Far hands curl around the outer table corners, in front of the edge.
    # Their upper arms stay behind the tabletop and painted torso.
    b.hand(c,A[0][2],B);b.hand(c,QA[0][2],Q)
    b.blit(c,foreground_pot(),C@T(966,565))
    F=C@T(-(v[0]-820)*.20,0);b.blit(c,m.old('near-counter'),F)
    contact=7.04<=t<=7.20
    m.LOG.update(shot=name,location='cafe-booth',camera=v.tolist(),bun=bun.tolist(),plate=plate.tolist(),
      bun_state='whole and untouched',contacts=m.ARMS.copy(),
      prop_contact_error=float(np.linalg.norm(push-(plate+CONTACT))) if contact else None,
      action='plate-contact' if contact else 'reach-or-release',fixed_bone_lengths=list(LENGTHS))
    return c
m.booth=booth

def draw(t):return locked.draw(t)

def preflight():
    times=[6.6,6.85,7.04,7.2,7.4,7.68,7.82,8.08,14.2,14.65,15.8,18.7,19.0,19.55]
    board=Image.new('RGB',(1280,math.ceil(len(times)/3)*266),'#f4e9df');d=ImageDraw.Draw(board)
    f=ImageFont.truetype(str(ROOT/'fonts/Arial.ttf'),18);rows=[]
    for j,t in enumerate(times):
        im=draw(t);rows.append({'time':t,**m.LOG.copy()});x=j%3*426;y=j//3*266
        board.paste(im.resize((426,240)),(x,y+26));d.text((x+8,y+4),f'V86 {t:.2f}s',font=f,fill='#332b29')
        if t in [7.04,7.4,14.65]:im.save(W/f'frame-{t:.2f}.png')
    board.save(W/'preflight.jpg',quality=95)
    (W/'preflight.json').write_text(json.dumps(rows,indent=2))
    print(json.dumps({'preflight':str(W/'preflight.jpg'),'frames':len(rows)}))
