"""V57: one approved painted actor, distance-driven gait, flat wide set camera.

No model calls. Original V51 paint is never narrowed or cross-faded. The
approved V41 sole-pivot matrix is retained in full, and the V45 shot grammar
is a truck, shared action, contact detail, then a held reaction.
"""
from pathlib import Path
from functools import lru_cache
from types import SimpleNamespace
import ast, importlib.util, math
import cv2
import numpy as np
from PIL import Image, ImageDraw

W=Path(__file__).resolve().parent; ROOT=W.parents[1]
SRC=ROOT/'work/hk-1990s-motion-v52/assets'
OLD=ROOT/'work/hk-1990s-limbs-v56/assets'
WIDTH,HEIGHT,FPS,DURATION=1280,720,30,10.
spec=importlib.util.spec_from_file_location('hk57character',W/'character.py')
character=importlib.util.module_from_spec(spec);spec.loader.exec_module(character)
GEOMETRY=[]; CAMERA_LOG=[]

def T(x,y):return np.array([[1.,0,x],[0,1.,y],[0,0,1.]])
def S(x,y=None):return np.diag([x,x if y is None else y,1.])
def R(d):
 q=math.radians(d);return np.array([[math.cos(q),-math.sin(q),0],[math.sin(q),math.cos(q),0],[0,0,1.]])
def pt(M,p):
 q=M@np.array([*p,1.]);return q[:2]/q[2]
def ease(a,b,t):
 q=np.clip((t-a)/(b-a),0,1);return q*q*(3-2*q)
def mix(a,b,k):return np.asarray(a)*(1-k)+np.asarray(b)*k
def keys(t,seq):
 if t<=seq[0][0]:return np.asarray(seq[0][1:],float)
 for a,b in zip(seq,seq[1:]):
  if t<b[0]:return mix(a[1:],b[1:],ease(a[0],b[0],t))
 return np.asarray(seq[-1][1:],float)
def blit(c,a,M):
 h,w=a.shape[:2];co=M@np.array([[0,w,w,0],[0,0,h,h],[1,1,1,1.]])
 co=co[:2]/co[2:];ch,cw=c.shape[:2]
 x0=max(0,int(np.floor(co[0].min()))-2);x1=min(cw,int(np.ceil(co[0].max()))+2)
 y0=max(0,int(np.floor(co[1].min()))-2);y1=min(ch,int(np.ceil(co[1].max()))+2)
 if x1<=x0 or y1<=y0:return
 p=cv2.warpPerspective(a,T(-x0,-y0)@M,(x1-x0,y1-y0),flags=cv2.INTER_LINEAR)
 c[y0:y1,x0:x1]=p[:,:,:3]+c[y0:y1,x0:x1]*(1-np.clip(p[:,:,3:4],0,1))
def rgba(im):
 a=np.asarray(im.convert('RGBA'),np.float32)/255;a[:,:,:3]*=a[:,:,3:4];return a
@lru_cache(None)
def asset(name):
 if name=='ink-stroke':p=ROOT/'work/eiffel-preview-20s/space-camera-v29/layers/ink-stroke.png'
 else:p=(OLD if name in ['owner-body'] else SRC)/(name+'.png')
 return rgba(Image.open(p))
def source_functions(path,names,namespace):
 text=path.read_text();tree=ast.parse(text)
 for node in tree.body:
  if isinstance(node,ast.FunctionDef) and node.name in names:
   exec(compile(ast.get_source_segment(text,node),str(path),'exec'),namespace)
source_functions(ROOT/'work/eiffel-preview-20s/space-camera-v29/animate.py',{'line'},globals())
m=SimpleNamespace(ease=ease);STANCE=.65
source_functions(ROOT/'work/eiffel-emotion-full-v41/animate.py',{'gait_solution'},globals())

def put(c,a,xy,M,angle=0,scale=1,anchor=(.5,.5)):
 if isinstance(a,str):a=asset(a)
 h,w=a.shape[:2];blit(c,a,M@T(*xy)@R(angle)@S(scale)@T(-w*anchor[0],-h*anchor[1]))
def cam(t):
 # All actor projection matrices are uniform similarities, as in V45.
 if t<2.18:
  cx=700+310*ease(.05,1.92,t);return 'street',np.array([cx,560.,1.03])
 if t<4.20:
  u=t-2.18;return 'entry',np.array([845+160*ease(.08,1.73,u),540.,.92+.05*ease(.5,1.65,u)])
 if t<7.08:
  return 'shared',keys(t,[(4.20,1110,537,1.06),(4.65,1110,537,1.06),(5.43,1120,530,1.08),(6.20,1120,530,1.08),(7.079,1103,544,1.08)])
 if t<7.95:
  return 'contact',keys(t,[(7.08,1217,616,3.0),(7.36,1210,616,3.0),(7.94,1210,616,3.0)])
 return 'reaction',keys(t,[(7.95,830,450,1.64),(8.12,830,450,1.72),(8.32,830,450,1.70),(10,830,450,1.70)])
def camera_matrix(v):
 x,y,k=v;return T(640,360)@S(k)@T(-x,-y)

@lru_cache(None)
def room_plate():
 # The owner's original footprint is removed only to permit his small nod.
 # New actor uses the exact same source head and covers the repaired area.
 src=np.asarray(Image.open(SRC/'cafe-clean-generated.png').convert('RGB'))
 mask=np.zeros(src.shape[:2],np.uint8)
 cv2.ellipse(mask,(1351,380),(135,111),0,0,360,255,-1)
 cv2.fillPoly(mask,[np.int32([(1248,466),(1466,463),(1470,610),(1251,607)])],255)
 fixed=cv2.inpaint(src,mask,5,cv2.INPAINT_TELEA)
 return rgba(Image.fromarray(fixed))
@lru_cache(None)
def counter_plate():
 a=room_plate().copy();h,w=a.shape[:2];mask=np.zeros((h*2,w*2),np.uint8)
 p=[(980,535),(1120,542),(1300,575),(1460,585),(1670,620),(1670,941),(1050,941),(1010,860),(985,700),(972,601)]
 cv2.fillPoly(mask,[np.int32(p)*2],255,cv2.LINE_AA)
 al=cv2.resize(mask,(w,h),interpolation=cv2.INTER_AREA).astype(np.float32)/255
 a*=al[:,:,None];return a
@lru_cache(None)
def ink_hand():return asset('hero-hand')
def hand(c,p,C,owner=False):put(c,'owner-hand' if owner else 'hero-hand',p,C,scale=.67)
def shadow(c,C,xy,rx=62,ry=9,alpha=.18):
 p=pt(C,xy);k=np.linalg.norm(C[:2,0]);rx*=k;ry*=k
 x0=max(0,int(p[0]-rx*2));x1=min(WIDTH,int(p[0]+rx*2+1));y0=max(0,int(p[1]-ry*2));y1=min(HEIGHT,int(p[1]+ry*2+1))
 if x1<=x0 or y1<=y0:return
 yy,xx=np.mgrid[y0:y1,x0:x1];a=(np.exp(-2*((xx-p[0])/rx)**2-2*((yy-p[1])/ry)**2)*alpha)[:,:,None]
 c[y0:y1,x0:x1]=c[y0:y1,x0:x1]*(1-a)+np.array([.31,.24,.33])*a

def arrival_distance(u,speed=125,a=1.13,b=1.68):
 if u<=a:return max(0,u)*speed
 q=np.clip((u-a)/(b-a),0,1)
 return speed*(a+(b-a)*(q-q**3+.5*q**4))

def arm_chain(sh,wr,far=False):
 sh=np.asarray(sh,float);wr=np.asarray(wr,float);d=wr-sh;distance=np.linalg.norm(d)
 if distance>169:raise ValueError(('arm overreach',distance,sh,wr))
 u=d/max(.01,distance);along=(88**2-82**2+distance**2)/(2*max(.01,distance))
 # A fixed depth plane foreshortens the elbow in projected 2D, no pole flip.
 height=math.sqrt(max(0,88**2-along**2));off=min(25,height*.60)
 if distance>156:off=min(off,5.)
 el=sh+along*u+np.array([-u[1],u[0]])*off*(1 if not far else -1)
 return (sh,el,wr)
def paint_arm(c,chain,C,far=False):
 for a,b in zip(chain,chain[1:]):line(c,a,b,C,width=.24 if far else .30,curve=.6 if far else -.6)

def hero(c,C,root,scale,travel,settle,t,target=None,emotion=0,nod=0,defer=False):
 M=C@T(*root)@S(scale)
 stride=54.;ws=.65
 phase=travel/scale*STANCE/(2*stride*ws)*math.tau+.28
 bob=-2.0*math.sin(phase)**2*(1-settle);B=M@T(0,bob)
 shadow(c,C,root,60*scale,8*scale)
 for k in [0,1]:
  g=gait_solution(phase,k,stride,1)
  foot=S(ws)@g['foot']@S(1/ws)
  # Keep the actual heel/toe pivot, including its rotational translation.
  rest=-18 if k==0 else 42
  v=pt(foot,(0,0));ang=g['angle']*(1-settle)
  if settle>0:
   # At brake onset the foot is sampled continuously, then settles to stance.
   foot=T(*(v*(1-settle)+np.array([rest,0])*settle))@R(ang)
  ankle=pt(foot,(0,-16*ws))
  hip=np.array([(-1 if k==0 else 34),-90+bob])
  line(c,hip,ankle,M,width=.24 if k==0 else .30,curve=.4)
  shoe=asset('street-shoe-a' if k==0 else 'street-shoe-b')
  if k==0:shoe=np.ascontiguousarray(shoe[:,::-1])
  h,w=shoe.shape[:2]
  blit(c,shoe,M@foot@T(-22*ws,-24*ws)@S(69*ws/w,24*ws/h))
 shoulders=[np.array([-44.,-221]),np.array([59.,-221])]
 arms=[]
 for side,sh in enumerate(shoulders):
  theta=math.radians(9)*math.cos(phase+side*math.pi-.22)*(1-settle)
  wr=sh+np.array([140*math.sin(theta),140*math.cos(theta)])
  if side==1 and target is not None:wr=pt(np.linalg.inv(B),target)
  arms.append(arm_chain(sh,wr,far=side==0))
 paint_arm(c,arms[0],B,True);hand(c,arms[0][2],B)
 blit(c,character.body(),B@T(-78,-280))
 if not defer:paint_arm(c,arms[1],B)
 blink=0.
 if t>8.4:blink=float(ease(8.78,8.84,t)*(1-ease(8.84,8.94,t)))
 a=character.head(emotion=round(emotion*40)/40,blink=round(blink*10)/10)
 # Neck rotation is small and occurs on the original head, never a yaw squeeze.
 blit(c,a,B@T(-5,-278)@R(nod)@T(5,278)@T(-137,-437))
 if not defer:hand(c,arms[1][2],B)
 for k,chain in enumerate(arms):GEOMETRY.append({'kind':'hero','side':k,'wrist':pt(B,chain[2]).tolist(),'shoulder':pt(B,chain[0]).tolist(),'distance':float(np.linalg.norm(chain[2]-chain[0]))})
 return B,arms

def owner(c,C,t,paper_grip=None):
 M=C@T(1351,816)
 put(c,'owner-body',(0,-274),M)
 put(c,'owner-head',(0,-438),M,angle=-1.8*ease(5.23,5.73,t)+1.0*ease(7.1,7.5,t))
 chains=[]
 for side,sh in enumerate([(-71,-294),(66,-294)]):
  sh=np.asarray(sh,float);home=np.array([1268.,571.]) if side==0 else np.array([1460.,565.])
  if side==0 and paper_grip is not None:wr=pt(np.linalg.inv(C),paper_grip)-np.array([1351,816])
  else:wr=home-np.array([1351,816])
  d=wr-sh;dist=np.linalg.norm(d);u=d/max(.01,dist)
  el=sh+d*.50+np.array([-u[1],u[0]])*min(24,dist*.18)
  chains.append((sh,el,wr))
 paint_arm(c,chains[1],M,True);hand(c,chains[1][2],M,True)
 return M,chains

@lru_cache(None)
def bag():
 # Reuse the registered bag-only matte authored in V56, not its actor rig.
 path=ROOT/'work/hk-1990s-limbs-v56/animate.py'
 ns={'asset':asset,'np':np,'cv2':cv2,'lru_cache':lru_cache}
 source_functions(path,{'bag'},ns);return ns['bag']()
def paper(t):
 return keys(t,[(2.18,1260,546,-8),(5.32,1260,546,-8),(5.52,1265,550,-10),(6.03,1184,518,3),(6.38,1174,518,3),(6.72,1174,518,3),(7.16,1116,570,-4),(7.92,1116,570,-4),(8.18,1115,579,-11),(10,1115,579,-11)])
def paper_matrix(t):
 x,y,a=paper(t);return T(x,y)@R(a)@T(-46.5,-54.5)
def interior(c,C,t):
 blit(c,room_plate(),C)
 u=t-2.18;dist=arrival_distance(u);end=arrival_distance(2.02)
 root=(885-end+dist,895);settle=float(ease(1.35,1.88,u))
 P=paper_matrix(t);receiver=pt(P,(8,89));giver=pt(P,(80,85))
 ownerhome=np.array([1268.,571.])
 release=float(ease(7.35,7.65,t))
 ownergrip=mix(giver,ownerhome,release)
 OM,OA=owner(c,C,t,pt(C,ownergrip))
 HM=C@T(*root)@S(1.25)
 # Carried bag hand is on a restrained pendulum until the actor has stopped.
 phase=dist/1.25*STANCE/(2*54*.65)*math.tau+.28
 carry=pt(HM,(67+4*math.sin(phase)*(1-settle),-118))
 b=keys(t,[(4.20,*pt(np.linalg.inv(C),carry),-3),(4.38,967,752,-5),(4.54,986,725,-9),(4.88,1078,541,-6),(5.10,1110,514,0),(10,1110,514,0)]) if t>=4.20 else np.r_[pt(np.linalg.inv(C),carry),-3]
 grip=b[:2]
 right=pt(C,grip)
 # Release the bag, retract once, then reach the same receiver contact point.
 if t>=5.18:
  release=mix(grip,(1082,542),ease(5.18,5.43,t));right=pt(C,release)
  reach=ease(5.43,6.38,t);control=pt(C,(1060,491))
  right=(1-reach)**2*right+2*(1-reach)*reach*control+reach**2*pt(C,receiver)
 if t>=6.38:right=pt(C,receiver)
 emotion=float(ease(8.00,8.20,t));nod=-2*ease(5.45,5.85,t)+2*ease(7.25,7.55,t)-4*emotion+2*ease(8.20,8.48,t)
 HB,HA=hero(c,C,root,1.25,dist,settle,t,target=right,emotion=emotion,nod=nod,defer=True)
 # The painted table is a depth layer, not an anisotropically reprojected card.
 blit(c,counter_plate(),C)
 paint_arm(c,OA[0],OM)
 if t>=4.88:shadow(c,C,(1110,611),46,5,.12)
 a=bag();blit(c,a,C@T(*grip)@R(b[2])@S(.85)@T(-21,-17))
 blit(c,asset('receipt'),C@P)
 paint_arm(c,HA[1],HB)
 hand(c,HA[1][2],HB)
 # Giver hand shares paper contact only until release. Never a second hand pass.
 hand(c,OA[0][2],OM,True)
 # A close foreground seat crosses faster than the room during the entry truck.
 if t<4.20:
  v=cam(t)[1];x=-(v[0]-845)*.50-40
  put(c,'near-booth',(x,950),C,scale=1.22,anchor=(0,1))

def street(c,C,t):
 blit(c,asset('street-clean-generated'),C)
 # An independently moving taxi behind the hero; depth is separate from camera.
 taxi=asset('taxi');put(c,taxi,(250+48*t,700),C,scale=.85+.045*t,anchor=(.5,1))
 dist=135*t
 root=(1120+dist,881);M=C@T(*root)@S(1.14)
 phase=dist/1.14*STANCE/(2*54*.65)*math.tau+.28
 carry=pt(M,(67+4*math.sin(phase),-118))
 B,arms=hero(c,C,root,1.14,dist,0,t,target=carry,defer=True)
 grip=pt(np.linalg.inv(C),carry)
 blit(c,bag(),C@T(*grip)@R(-3)@S(.85)@T(-21,-17))
 paint_arm(c,arms[1],B);hand(c,arms[1][2],B)
 cx=cam(t)[1][0]
 F=C@T(-(cx-700)*.55,0)
 blit(c,asset('awning'),F)
 blit(c,asset('crates'),F@T(0,718))

def draw(t):
 GEOMETRY.clear();CAMERA_LOG.clear();name,v=cam(t)
 if name=='shared':v[0]=min(v[0],1670-640/v[2]-8)
 C=camera_matrix(v)
 c=np.full((HEIGHT,WIDTH,3),[.96,.82,.68],np.float32)
 if t<2.18:street(c,C,t)
 else:interior(c,C,t)
 glow=cv2.GaussianBlur(np.maximum(c-.84,0),(0,0),4.0)*.045
 CAMERA_LOG.append({'time':t,'shot':name,'cx_cy_scale':v.tolist(),'actor_scale_anisotropy':1.0})
 return Image.fromarray(np.uint8(np.clip(c+glow,0,1)*255))
