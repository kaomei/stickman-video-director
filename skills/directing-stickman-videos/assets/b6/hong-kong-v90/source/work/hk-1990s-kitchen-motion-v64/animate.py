"""V64: independent kitchen acting and advecting steam behind V63 actors."""
from pathlib import Path
from functools import lru_cache
import importlib.util,json,math
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
W=Path(__file__).resolve().parent;ROOT=W.parents[1]
spec=importlib.util.spec_from_file_location('hk63kitchen',ROOT/'work/hk-1990s-surprise-pose-v63/animate.py')
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
b=base.b
WIDTH,HEIGHT,FPS,DURATION=base.WIDTH,base.HEIGHT,base.FPS,base.DURATION
GEOMETRY,CAMERA_LOG,CONTACTS=base.GEOMETRY,base.CAMERA_LOG,base.CONTACTS
T,R,S,pt,ease,mix=b.T,b.R,b.S,b.pt,b.ease,b.mix
META=json.loads((W/'assets/layers.json').read_text());BOX=META['kitchen_box']
old_room=b.room_plate;FRAME_T=0.;KITCHEN_LOG={}

@lru_cache(None)
def asset(name):return b.rgba(Image.open(W/'assets'/(name+'.png')))
def sprite(c,name,M):
    x,y,_,_=META[name]['box'];b.blit(c,asset(name),M@T(x,y))
def chain(sh,wr,pole,lengths=(14.,14.)):
    sh=np.asarray(sh,float);wr=np.asarray(wr,float);v=wr-sh;d=np.linalg.norm(v)
    l1,l2=lengths
    assert d<l1+l2-.05,('chef overreach',d)
    u=v/max(.01,d);a=(l1*l1-l2*l2+d*d)/(2*max(.01,d))
    el=sh+a*u+np.array([-u[1],u[0]])*math.sqrt(max(0,l1*l1-a*a))*pole
    return [sh,el,wr]

def steam(c,t,open_amount):
    # A broad translucent painted wisp advects upward from a fixed base.
    ss=3;im=Image.new('RGBA',(170*ss,170*ss));d=ImageDraw.Draw(im)
    left=[];right=[]
    for j in range(80):
        h=j*1.38;z=h/110
        wave=math.sin(h*.105-t*2.1)
        x=682-BOX[0]-17*z+(2+5.5*z)*wave
        y=411-BOX[1]-h
        width=(2+5.4*math.sin(math.pi*z)**.75)*(1+.10*math.sin(h*.27))
        left.append(((x-width/2)*ss,y*ss));right.append(((x+width/2)*ss,y*ss))
    d.polygon(left+right[::-1],fill=(252,226,198,round(78+13*open_amount)))
    # Fade the upper end, leaving no hard cap or popping particles.
    a=np.asarray(im).copy();yy=np.arange(a.shape[0])[:,None]/ss
    fade=np.clip((yy-1)/21,0,1)*np.clip((127-yy)/17,0,1)
    a[:,:,3]=np.uint8(a[:,:,3]*fade)
    im=Image.fromarray(a).filter(ImageFilter.GaussianBlur(.60*ss)).resize((170,170),Image.Resampling.LANCZOS)
    a=b.rgba(im);b.blit(c,a,np.eye(3))

def kitchen(t):
    plate=old_room().copy();x0,y0,x1,y1=BOX
    c=asset('kitchen-clean')[:,:,:3].copy();C=T(-x0,-y0)
    phase=(t+.35)%4.15
    reach=float(ease(.18,.83,phase)*(1-ease(2.75,3.35,phase)))
    lift=float(ease(.94,1.36,phase)*(1-ease(2.05,2.61,phase)))
    # A purposeful lean reaches the lid. No periodic torso rocking.
    B=T(617,456)@R(.9*reach)@T(-617,-456)
    L=T(683,413)@T(0,-3.5*lift)@R(-5.5*lift)@T(-683,-413)
    grip=pt(L,(667,411))
    right=mix(pt(B,(648,437)),grip,reach)
    wipe=math.sin(math.pi*float(ease(0,.9,phase)))*2.5*(1-reach)
    left=pt(B,(569+wipe,437))
    ra=chain(pt(B,(646,417)),right,1)
    la=chain(pt(B,(582,419)),left,1,(12.,12.))
    for nodes in [la,ra]:
        for p,q in zip(nodes,nodes[1:]):b.line(c,p,q,C,width=.32,curve=.30)
    sprite(c,'chef-body',C@B)
    # Small delayed head turn follows the inspection, retaining original paint.
    head_turn=3.1*float(ease(.65,1.20,phase)*(1-ease(2.50,3.08,phase)))
    H=B@T(617,387)@R(head_turn)@T(-617,-387)
    sprite(c,'chef-head',C@H)
    steam(c,t,lift)
    sprite(c,'pot-lid',C@L)
    for name,pos,origin in [('chef-left-hand',left,(569,437)),('chef-right-hand',right,(647,437))]:
        sprite(c,name,C@T(*(pos-np.asarray(origin))))
    # Original painted counter masks the actor's lower apron consistently.
    original=old_room()[459:464,x0:x1,:3]
    c[459-y0:464-y0]=original
    plate[y0:y1,x0:x1,:3]=c
    KITCHEN_LOG.clear();KITCHEN_LOG.update(time=t,phase=phase,lid_open=lift,
        head_degrees=head_turn,right_hand=right.tolist(),lid_grip=grip.tolist(),
        arm_lengths=[[float(np.linalg.norm(q-p)) for p,q in zip(a,a[1:])] for a in [la,ra]],
        face_unchanged=True)
    return plate

def room_plate():return kitchen(FRAME_T)
b.room_plate=room_plate
def draw(t):
    global FRAME_T
    FRAME_T=float(t);KITCHEN_LOG.clear()
    return base.draw(t)
