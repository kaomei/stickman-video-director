"""V90 shared arm bindings. All source paint, cameras and captions retained."""
from pathlib import Path
import importlib.util,json,math,sys
import numpy as np
from PIL import Image,ImageDraw,ImageFont
W=Path(__file__).resolve().parent;ROOT=W.parents[1]
sys.path.insert(0,str(W))
import rig
s=importlib.util.spec_from_file_location('v90_locked_v89',ROOT/'work/hk-v89-counter-opening/animate.py')
a=importlib.util.module_from_spec(s);s.loader.exec_module(a)
m=a.m;b=a.b;v59=a.v59;v60=a.v60;v65=m.v75.v65;v64=v65.base
v87=a.a.a
T,R,S,pt,ease,keys=b.T,b.R,b.S,b.pt,b.ease,b.keys
b.cv2.setNumThreads(2)

def make(kind,side,wr,B,**kw):
    return rig.solve(rig.BINDINGS[kind],side,wr,B,**kw)

def actor(c,C,kind,root,scale,wrists,t,emotion=0,headangle=0,mirror=False,
          pose='neutral',speak=False,standing=False,lean=0):
    M=C@T(*root)@S(-scale if mirror else scale,scale)
    B=M@T(15,-90)@R(lean)@T(-15,90)
    if standing:m.feet(c,M,kind)
    wrists=[np.asarray(p,float).copy() for p in wrists]
    if kind=='friend' and standing:
        wrists[0][0]=744.
        gesture=np.clip((wrists[1][0]-882.)/63.,0.,1.)
        wrists[1][0]=913.+32.*gesture
    local=[pt(np.linalg.inv(B),pt(C,p)) for p in wrists]
    if kind=='flower' and standing:local[0]=np.array([-94.,-112.])
    arms=[]
    for side,wr in enumerate(local):
        pole=1 if side==0 or (standing and kind=='flower') or (not standing and kind=='friend') else -1
        elbow=None
        if not standing and side==1:
            if kind=='flower':
                ew=m.motion(t,[(6.6,(957,599)),(14.18,(957,599)),(14.43,(960,618)),
                    (14.65,(956,620)),(15.44,(956,620)),(15.81,(957,599)),(20,(957,599))])
            else:
                # Elbow leads below the sleeve, then a short forearm lies
                # on the table. A stable bend replaces the old right angle.
                sw=pt(np.linalg.inv(C)@B,rig.BINDINGS[kind].pins[side])
                ew=np.array([sw[0]+max(18.,.40*(wrists[side][0]-sw[0])),
                             min(wrists[side][1]+1.,631.)])
            elbow=pt(np.linalg.inv(B),pt(C,ew))
        arms.append(make(kind,side,wr,B,pole=pole,
                         bow=6.5 if side==0 else 14.,elbow=elbow,
                         context='arcade' if standing else 'booth'))
    rig.paint(c,arms[0],B,b,far=True);rig.hand(c,arms[0],B,b)
    # Same passes for both actors, all shots: sleeve always covers its pin.
    # Near chain is composed once with its painted garment matte later.
    if kind=='flower':
        b.blit(c,b.character.body(),B@T(-78,-280))
        blink=sum(float(ease(x,x+.045,t)*(1-ease(x+.10,x+.17,t))) for x in [7.60,13.25,15.54,19.16])
        H=B@T(-5,-278)@R(headangle)@T(5,278)@T(-137,-437)
        b.blit(c,b.character.head(emotion=emotion,blink=blink),H)
    else:
        b.blit(c,m.strong('strong-body'),B@T(-65,-280)@S(.4))
        n='strong-speak' if speak else ('strong-tight' if pose=='tight' else 'strong-head')
        if 17.30<t<17.43:n='strong-tight-blink' if pose=='tight' else 'strong-head-blink'
        H=B@T(-5,-278)@R(headangle)@T(5,278)@T(-104,-467)@S(.31)
        b.blit(c,m.strong(n),H)
    m.ARMS.extend(rig.RECORDS[-2:])
    return B,arms

def overlay(c,B,arms):
    foreground_chain(c,arms[1],B);rig.hand(c,arms[1],B,b)

def foreground_chain(c,ch,B):
    kind=ch.binding.character
    if kind=='flower':garment=b.character.body();G=B@T(-78,-280)
    elif kind=='friend':garment=m.strong('strong-body');G=B@T(-65,-280)@S(.4)
    else:
        garment=v60.garment();x,y=v60.BODY_ORIGIN;G=B@T(x-1351,y-816)
    rig.foreground(c,ch,B,b,garment,G)

def arcade_overlay(c,C,kind,B,arms):overlay(c,B,arms)

def hero(c,C,t,target):
    M=C@T(885,895)@S(1.25)
    lean=float(keys(t,[(1.2,0),(1.38,-.6),(1.83,2.8),(2.06,3.1),
        (2.40,.6),(2.67,1),(3.10,2.6),(3.35,2.6),(3.76,.3),(4.35,.3),
        (4.51,1.),(4.68,-3.4),(5.02,-.85),(7,-.85)])[0])
    B=M@T(15,-90)@R(lean)@T(-15,90)
    b.shadow(c,C,(885,895),75,10)
    for k in [0,1]:
        hip=(-1 if k==0 else 34,-90);hg=pt(np.linalg.inv(M)@B,hip)
        ankle=(-18 if k==0 else 42,-10.4)
        rig.record_leg("flower",k,hg,ankle,M)
        b.line(c,hg,ankle,M,width=.24 if k==0 else .30,curve=.4)
        shoe=b.asset('street-shoe-a' if k==0 else 'street-shoe-b')
        if k==0:shoe=np.ascontiguousarray(shoe[:,::-1])
        h,w=shoe.shape[:2]
        b.blit(c,shoe,M@T(-18 if k==0 else 42,0)@T(-14.3,-15.6)@S(44.85/w,15.6/h))
    offhand=keys(t,[(1.2,-94,-112),(4.48,-94,-112),(4.69,-98,-123),
                    (5.02,-96,-117),(7,-96,-117)])
    arms=[make('flower',0,offhand,B,pole=1,bow=6.5,context='counter'),
          make('flower',1,pt(np.linalg.inv(B),target),B,pole=1,bow=14.,context='counter')]
    rig.paint(c,arms[0],B,b,far=True);rig.hand(c,arms[0],B,b)
    b.blit(c,b.character.body(),B@T(-78,-280))
    emotion=float(ease(4.52,4.69,t))
    blink=float(ease(2.31,2.37,t)*(1-ease(2.38,2.46,t)))
    if t>5.65:blink=float(ease(5.86,5.92,t)*(1-ease(5.93,6.04,t)))
    headangle=float(keys(t,[(1.2,0),(1.52,1.7),(2.04,2.7),(2.37,.2),
        (2.66,-1.2),(3.12,1.8),(3.79,3.5),(4.48,4.3),(4.69,-5.2),
        (5.04,-1.8),(7,-1.8)])[0])
    H=B@T(-5,-278)@R(headangle-.45*lean)@T(5,278)@T(-137,-437)
    b.blit(c,b.character.head(emotion=emotion,blink=blink,gaze=0.),H)
    return B,arms

def owner(c,C,t,paper_grip):
    lean=float(keys(t,[(1.2,0),(2.26,0),(2.42,.65),(2.85,-2.),
                       (3.34,-2.),(3.68,-.3),(4.35,-.3),(7,-.3)])[0])
    B=C@T(1351,816)@T(0,-200)@R(lean)@T(0,200)
    arms=[]
    for side in [0,1]:
        sh=np.asarray(rig.BINDINGS['owner'].pins[side]);target=paper_grip if side==0 else pt(C,(1482.,570.))
        wr=pt(np.linalg.inv(B),target);delta=wr-sh;d=np.linalg.norm(delta)
        normal=np.array([-delta[1],delta[0]])/d
        el=sh+.52*delta+normal*min(9.,d*.14)*(1 if side==0 else -1)
        arms.append(make('owner',side,wr,B,pole=1 if side==0 else -1,elbow=el,context='counter'))
    rig.paint(c,arms[1],B,b,far=True);rig.hand(c,arms[1],B,b)
    x,y=v60.BODY_ORIGIN;b.blit(c,v60.garment(),B@T(x-1351,y-816))
    angle=float(keys(t,[(1.2,0),(2.24,0),(2.48,-2.6),(3.18,-1.2),(3.7,.5),(7,.5)])[0])
    b.put(c,'owner-head',(0,-438),B,angle=angle)
    return B,arms

def counter_foreground(c,ch,B,far=False):
    assert isinstance(ch,rig.ArmPose),'Legacy arm bypassed shared binding'
    foreground_chain(c,ch,B)

def background_chain(sh,wr,pole,lengths=(14.,14.)):
    # Source tiny sleeves/painted upper limbs are retained. Same solver,
    # per-character lengths and exact cup/lid/paper grip coordinates.
    lengths=tuple(map(float,lengths))
    if lengths==(14.,14.):kind='chef-right'
    elif lengths==(12.,12.):kind='chef-left'
    elif lengths==(28.,27.):kind='tea-guest'
    else:kind='reader-left' if pole==1 else 'reader-right'
    return make(kind,0,wr,np.eye(3),shoulder=sh,pole=pole,plane=True,context='counter-background')

# Replace every active entrance, including inherited module globals.
m.actor=actor;m.overlay_arm=arcade_overlay
v87.actor=actor;v87.overlay=overlay
v59.hero=hero;v59.owner=owner;v60.owner=owner;v59.paint_arm=counter_foreground
v64.chain=background_chain

def legacy_arm_disabled(*args,**kwargs):
    raise RuntimeError('Animated arm bypassed the V90 shared rig')
b.arm_chain=legacy_arm_disabled

def draw(t):
    rig.reset(round(t*30))
    return a.draw(t)

def preflight():
    ts=[2.4,2.8,3.3,3.8,4.3,4.6,5.2,6.2,6.6,6.9,7.05,7.2,7.4,8.6,
        9.05,9.5,10.3,10.67,10.8,11.5,12.4,13.2,14.4,14.7,15.8,16.8,18.2,19.5]
    board=Image.new('RGB',(1280,math.ceil(len(ts)/4)*210),'#f4e9df')
    d=ImageDraw.Draw(board);font=ImageFont.truetype(str(ROOT/'fonts/Arial.ttf'),17)
    rows=[]
    for i,t in enumerate(ts):
        im=draw(t);x=i%4*320;y=i//4*210;board.paste(im.resize((320,180)),(x,y+27))
        d.text((x+7,y+4),f'V90 {t:.2f}s',font=font,fill='#302824')
        rows.append({'time':t,'arms':rig.RECORDS.copy(),'camera':m.LOG.copy(),
                     'counter_camera':v59.CAMERA_LOG.copy()})
        if t in [2.8,4.3,6.6,7.05,7.4,9.5,10.8,14.7]:im.save(W/f'frame-{t:.2f}.png')
    board.save(W/'preflight.jpg',quality=97)
    (W/'preflight.json').write_text(json.dumps(rows,indent=2))
    print(json.dumps({'preflight':str(W/'preflight.jpg'),'frames':len(rows)}))
