"""V87: readable sleeve-to-hand silhouettes, not just wrist reach.

Flower's idle arm must be outside its shirt. The mirrored seated elbow uses
its own anatomical side; the near forearm must remain visible left of the
sugar pot. Retain source paint, expressions, controls, cameras and captions.
Arm depth changes explain projection shortening; 3D bones stay fixed.
"""
from pathlib import Path
import importlib.util, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W=Path(__file__).resolve().parent;ROOT=W.parents[1]
s=importlib.util.spec_from_file_location('v87_base',ROOT/'work/hk-v86-booth-arms/animate.py')
a=importlib.util.module_from_spec(s);s.loader.exec_module(a)
m=a.m;b=a.b
T,R,S,pt,ease,keys=a.T,a.R,a.S,a.pt,a.ease,a.keys
old_seated=a.actor;old_seated_overlay=a.overlay
old_standing=m.actor;old_standing_overlay=m.overlay_arm
old_controls=m.control_action

class FlowerArms(list):
    pass

def projected_chain(sh,wr,pole,bow):
    """Orthographic projection of a fixed 78/76 two-bone arm.

    A small signed elbow pole in the image keeps the idle contour simple;
    the remaining elbow excursion is in depth, not fabricated 2D stretching.
    """
    sh=np.asarray(sh,float);wr=np.asarray(wr,float);d=float(np.linalg.norm(wr-sh))
    upper,fore=78.,76.
    assert 2.1<d<153.9,('overreach',d)
    u=(wr-sh)/d;along=(upper**2-fore**2+d*d)/(2*d)
    height=math.sqrt(upper**2-along**2);side=min(bow,height*.8)
    el=sh+along*u+pole*side*np.array([-u[1],u[0]])
    depth=math.sqrt(max(0,height**2-side**2))
    return np.array([sh,el,wr]),np.array([[*sh,0],[*el,depth],[*wr,0]])

def silhouette_fraction(ch):
    body=b.character.body();pts=np.concatenate([np.linspace(x,y,60) for x,y in zip(ch,ch[1:])])
    ij=np.rint(pts+[78,280]).astype(int);valid=(ij[:,0]>=0)&(ij[:,0]<body.shape[1])&(ij[:,1]>=0)&(ij[:,1]<body.shape[0])
    covered=np.zeros(len(pts),bool);covered[valid]=body[ij[valid,1],ij[valid,0],3]>.45
    return float(np.mean(~covered))

def actor(c,C,kind,root,scale,wrists,t,emotion=0,headangle=0,mirror=False,pose='neutral',speak=False,standing=False,lean=0):
    if kind!='flower':
        if standing:
            return old_standing(c,C,kind,root,scale,wrists,t,emotion=emotion,headangle=headangle,
                mirror=mirror,pose=pose,speak=speak,standing=True,lean=lean)
        return old_seated(c,C,kind,root,scale,wrists,t,emotion=emotion,headangle=headangle,
                mirror=mirror,pose=pose,speak=speak,lean=lean)
    M=C@T(*root)@S(-scale if mirror else scale,scale)
    B=M@T(15,-90)@R(lean)@T(-15,90)
    if standing:m.feet(c,M,kind)
    local=[pt(np.linalg.inv(B),pt(C,p)) for p in wrists]
    # Lower arm stays outside the far sleeve, rather than underneath the
    # shirt/bag. It is attached to the body, including the small body lean.
    if standing:local[0]=np.array([-94.,-112.])
    arms=FlowerArms();depths=[]
    for side,(sh,wr) in enumerate(zip([(-44,-221),(59,-221)],local)):
        pole=1 if side==0 or standing else -1
        bow=6.5 if side==0 else (18. if standing else 22.)
        chain,chain3=projected_chain(sh,wr,pole,bow)
        if side==1 and not standing:
            # Authored silhouette keys: the resting forearm is left of the
            # pot; for the raised gesture, elbow stays low and hand points
            # up. Do not let automatic IK turn that pose into a wing.
            ew=m.motion(t,[(6.6,(957,599)),(14.18,(957,599)),(14.43,(960,618)),
                (14.65,(956,620)),(15.44,(956,620)),(15.81,(957,599)),(20,(957,599))])
            el=pt(np.linalg.inv(B),pt(C,ew));chain=np.array([sh,el,wr])
            up2=float(np.linalg.norm(el-sh));fore2=float(np.linalg.norm(wr-el))
            assert up2<78 and fore2<76,('authored pose overreach',up2,fore2)
            ez=math.sqrt(78**2-up2**2);wz=ez-math.sqrt(76**2-fore2**2)
            chain3=np.array([[*sh,0],[*el,ez],[*wr,wz]])
        arms.append(chain);depths.append(chain3)
    b.paint_arm(c,arms[0],B,True);b.hand(c,arms[0][2],B)
    # Near upper arm passes under the sleeve; the forearm is composed later.
    if not standing:a.paint_segment(c,*arms[1][:2],B)
    b.blit(c,b.character.body(),B@T(-78,-280))
    blink=sum(float(ease(x,x+.045,t)*(1-ease(x+.10,x+.17,t))) for x in [7.60,13.25,15.54,19.16])
    H=B@T(-5,-278)@R(headangle)@T(5,278)@T(-137,-437)
    b.blit(c,b.character.head(emotion=emotion,blink=blink),H)
    for side,(chain,chain3) in enumerate(zip(arms,depths)):
        m.ARMS.append({'actor':kind,'side':side,'rig':'V87_projected_depth',
            'local_chain':chain.tolist(),'chain_3d':chain3.tolist(),
            'upper_3d':float(np.linalg.norm(chain3[1]-chain3[0])),
            'forearm_3d':float(np.linalg.norm(chain3[2]-chain3[1])),
            'shoulder':pt(B,chain[0]).tolist(),'elbow':pt(B,chain[1]).tolist(),
            'wrist':pt(B,chain[2]).tolist(),'target':pt(B,local[side]).tolist(),
            'grip_error':float(np.linalg.norm(pt(B,chain[2])-pt(B,local[side]))),
            'local_reach':float(np.linalg.norm(chain[2]-chain[0])),
            'outside_shirt_fraction':silhouette_fraction(chain),
            'pole':1 if side==0 or standing else -1,
            'idle_contour_outward':bool(side!=0 or (chain[0,0]>chain[1,0]>chain[2,0]))})
    return B,arms

def overlay(c,B,arms):
    if isinstance(arms,FlowerArms):
        a.paint_segment(c,arms[1][1],arms[1][2],B);b.hand(c,arms[1][2],B)
    else:old_seated_overlay(c,B,arms)

def arcade_overlay(c,C,kind,B,arms):
    if isinstance(arms,FlowerArms):
        b.paint_arm(c,arms[1],B);b.hand(c,arms[1][2],B)
    else:old_standing_overlay(c,C,kind,B,arms)

def booth(t):
    name,v=m.booth_camera(t);C=b.camera_matrix(v)
    c=np.full((720,1280,3),[.96,.82,.68],np.float32);m.room(c,C,t)
    plate,push=a.plate_action(t)
    fangle=float(keys(t,[(6.6,-.8),(6.90,1.5),(7.14,1.5),(7.53,-1.2),(7.90,-.4),
        (13.7,-.4),(16.65,-.4),(16.82,2.8),(17.08,2.8),(17.34,.2),(18.3,.2),(18.78,-1.3),(19.3,.1),(20,.1)])[0])
    lean=float(keys(t,[(6.6,0),(6.9,-.6),(7.4,-1.65),(7.63,-1.4),(8.08,0),(20,0)])[0])
    B,A=actor(c,C,'friend',(555,815),1.15,[(482,671),push],t,headangle=fangle,lean=lean,
        pose='tight' if t>=16.65 else 'neutral',speak=7.07<=t<7.85 or 18.4<=t<19.1)
    refuse=float(ease(14.24,14.43,t)*(1-ease(15.49,15.81,t)))
    # A visible forearm to the left of the pot, not an isolated hand dot.
    wr=m.motion(t,[(6.6,(943,650)),(13.7,(943,650)),(14.18,(943,650)),
        (14.43,(945,601)),(14.65,(940,594)),(15.44,(940,594)),(15.81,(943,650)),(20,(943,650))])
    angle=float(keys(t,[(6.6,0),(7.16,0),(7.45,2.3),(7.77,2.3),(8.12,-.7),
        (13.7,-.7),(14.15,-.7),(14.34,-2.4),(15.43,-2.4),(15.81,-.7),(20,-.7)])[0])
    Q,QA=actor(c,C,'flower',(1073,806),1.15,[(1149,645),wr],t,
        emotion=.28 if t>=13.7 else 0,headangle=angle,mirror=True,lean=-.65*refuse)
    b.blit(c,m.old('table-front'),C);b.shadow(c,C,plate+(0,4),81,10,.12)
    p=m.old('plate');h,w=p.shape[:2];b.blit(c,p,C@T(*plate)@S(.44)@T(-w/2,-h/2))
    inertia=float(keys(t,[(6.6,0),(7.04,0),(7.24,-2),(7.4,-1),(7.51,1.5),(7.65,0),(20,0)])[0])
    bun=plate+(inertia,-23);p=m.old('bun-whole');h,w=p.shape[:2]
    b.blit(c,p,C@T(*bun)@R(inertia*.45)@S(.36)@T(-w/2,-h/2))
    overlay(c,B,A);overlay(c,Q,QA)
    b.hand(c,A[0][2],B);b.hand(c,QA[0][2],Q)
    b.blit(c,a.foreground_pot(),C@T(966,565))
    F=C@T(-(v[0]-820)*.20,0);b.blit(c,m.old('near-counter'),F)
    contact=7.04<=t<=7.20
    m.LOG.update(shot=name,location='cafe-booth',camera=v.tolist(),bun=bun.tolist(),plate=plate.tolist(),
        bun_state='whole and untouched',contacts=m.ARMS.copy(),
        prop_contact_error=float(np.linalg.norm(push-(plate+a.CONTACT))) if contact else None,
        action='plate-contact' if contact else 'reach-or-release')
    return c

def control_action(t):
    J,button,press,wr,contact,prop=old_controls(t)
    if 10.55<t<10.80:
        # Keep both actual contacts, but lower the airborne waypoint so
        # changing controls never straightens the arm beyond its reach.
        knob=pt(J,(1298,439))
        wr=m.motion(t,[(10.55,knob),(10.66,(1321,433)),(10.80,(1341,474))])
    return J,button,press,wr,contact,prop

m.actor=actor;m.overlay_arm=arcade_overlay;m.booth=booth;m.control_action=control_action

def draw(t):return a.locked.draw(t)

def preflight():
    ts=[6.6,7.04,7.4,8.7,9.0,9.5,10.3,10.8,11.3,12.3,12.9,13.4,14.2,14.7,15.8,19.2]
    board=Image.new('RGB',(1280,4*266),'#f4e9df');d=ImageDraw.Draw(board);font=ImageFont.truetype(str(ROOT/'fonts/Arial.ttf'),17);rows=[]
    for i,t in enumerate(ts):
        im=draw(t);x=i%4*320;y=i//4*266;board.paste(im.resize((320,180)),(x,y+24));d.text((x+6,y+3),f'V87 {t:.2f}s',font=font,fill='#302824');rows.append({'time':t,**m.LOG.copy()})
        if t in [7.4,9.5,10.8,14.7]:im.save(W/f'frame-{t:.2f}.png')
    board.save(W/'preflight.jpg',quality=96);(W/'preflight.json').write_text(json.dumps(rows,indent=2))
    print(json.dumps({'preflight':str(W/'preflight.jpg'),'frames':len(ts)}))
