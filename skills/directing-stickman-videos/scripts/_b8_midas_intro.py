"""Scoped R3 0–4.65s test. Intact painted cels; no skeleton, IK or limb stretch."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import numpy as np
import math,json,hashlib,subprocess,argparse,heapq,datetime

ASSET=Path(__file__).resolve().parent.parent/'assets/b8/midas-replay-v1'
W,H,FPS,N=1280,720,60,279
R=Image.Resampling
CAPTIONS=[{'in':0,'out':3.6,'text':'King Midas turned everything he touched into gold.'},{'in':3.94,'out':4.65,'text':'A branch.'}]
SHOTS=[{'in':0,'out':.7,'description':'Garden establish, gaze at the detached fallen twig; intact character inclines slightly.'},{'in':.7,'out':2.1,'description':'Oblique close-up: approach, pad contact, connected gold spread, hand withdrawal. Twig remains on stone.'},{'in':2.1,'out':3.6,'description':'Independent head/shoulder reaction: surprise, recover, pleased expression.'},{'in':3.6,'out':4.65,'description':'Same whole golden twig remains in place. A finite metallic reflection resolves.'}]

def ease(t,a,b):
 q=np.clip((t-a)/(b-a),0,1);return float(q*q*(3-2*q))
def load(n):return Image.open(ASSET/'intro'/n).convert('RGBA')
GREEN=load('twig-green.png');GOLD=load('twig-gold.png');HAND=load('hand-forearm.png')
STAND=load('standing.png');SURPRISE=load('surprised-bust.png');PLEASED=load('pleased-bust.png')
GARDEN=Image.open(ASSET/'backgrounds/garden.png').convert('RGBA').resize((W,H),R.LANCZOS)
PATH=Image.open(ASSET/'backgrounds/path.png').convert('RGBA').resize((W,H),R.LANCZOS)
BRANCH_XY=(386,160);BRANCH_SCALE=680/GREEN.width
CONTACT_LOCAL=(451,72);CONTACT_SCREEN=tuple(BRANCH_XY[i]+CONTACT_LOCAL[i]*BRANCH_SCALE for i in range(2))
GOLD_SEED=(445,64)
HAND_TIP=(26,260);HAND_SCALE=1.12

def stamp(im,cel,anchor,at,scale=1,angle=0):
 # Complete artwork transformed rigidly. No control point or bone deformation.
 theta=math.radians(angle);c=math.cos(theta);s=math.sin(theta)
 ax,ay=anchor;px,py=at
 a=c/scale;b=s/scale;d=-s/scale;e=c/scale
 box=cel.transform((W,H),Image.Transform.AFFINE,(a,b,ax-a*px-b*py,d,e,ay-d*px-e*py),resample=R.BICUBIC)
 im.alpha_composite(box)

def transformed_bg(bg,zoom=1,dx=0,dy=0):
 if zoom==1 and dx==0 and dy==0:return bg.copy()
 return bg.transform((W,H),Image.Transform.AFFINE,(1/zoom,0,W/2-W/2/zoom+dx,0,1/zoom,H/2-H/2/zoom+dy),R.BICUBIC)

def geodesic_mask():
 mask=np.asarray(GREEN.getchannel('A'))>90;h,w=mask.shape
 x,y=GOLD_SEED
 if not mask[y,x]:
  ys,xs=np.where(mask);i=np.argmin((xs-x)**2+(ys-y)**2);x,y=int(xs[i]),int(ys[i])
 dist=np.full((h,w),np.inf,np.float32);dist[y,x]=0;q=[(0.,y,x)]
 edges=[(dy,dx,math.hypot(dx,dy))for dy in [-1,0,1]for dx in [-1,0,1]if dx or dy]
 while q:
  n,yy,xx=heapq.heappop(q)
  if n>dist[yy,xx]+.0001:continue
  for dy,dx,c in edges:
   ny,nx=yy+dy,xx+dx
   if 0<=ny<h and 0<=nx<w and mask[ny,nx] and n+c<dist[ny,nx]:
    dist[ny,nx]=n+c;heapq.heappush(q,(float(dist[ny,nx]),ny,nx))
 finite=np.isfinite(dist)
 # Alpha fringe follows nearest reachable painted point, never the ground.
 from scipy.ndimage import distance_transform_edt
 nearest=distance_transform_edt(~finite,return_distances=False,return_indices=True)
 dist=dist[tuple(nearest)];return dist,float(dist[mask].max()),(x,y)
DIST,MAX_DIST,CONTACT_SEED=geodesic_mask()

def twig(p):
 if p<=0:return GREEN
 if p>=1:return GOLD
 reveal=np.clip((MAX_DIST*p-DIST+8)/16,0,1)
 a=np.asarray(GOLD).copy();a[:,:,3]=(a[:,:,3].astype(float)*reveal).astype('uint8')
 cel=GREEN.copy();cel.alpha_composite(Image.fromarray(a));return cel

def ground_shadow(im,cel,xy,scale,opacity=.24):
 a=cel.getchannel('A').resize((round(cel.width*scale),round(cel.height*scale)),R.LANCZOS)
 shadow=Image.new('RGBA',a.size,(42,23,25,0));shadow.putalpha(a.point(lambda x:round(x*opacity)).filter(ImageFilter.GaussianBlur(5)))
 im.alpha_composite(shadow,(round(xy[0]+5),round(xy[1]+8)))

def contact_hand(t):
 down=ease(t,.72,1.05);up=ease(t,1.70,2.08)
 return (CONTACT_SCREEN[0]+4+43*(1-down)+52*up,CONTACT_SCREEN[1]-8-86*(1-down)-132*up)

def render_picture(t):
 if t<.7:
  p=ease(t,0,.45);im=transformed_bg(GARDEN,1.008,3*(1-p),0)
  # Figure and twig are independent of the garden plate; tiny whole-body inclination, fixed feet.
  twig_scale=166/GREEN.width;pos=(493,574)
  ground_shadow(im,GREEN,pos,twig_scale,.22);stamp(im,GREEN,(0,0),pos,twig_scale)
  sh=Image.new('RGBA',(W,H));d=ImageDraw.Draw(sh);d.ellipse((756,600,1003,615),fill=(43,22,26,65));im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(5)))
  stamp(im,STAND,(220,765),(805,612),.50,-1.15*p)
  return im
 if t<2.1:
  im=PATH.copy();ground_shadow(im,GREEN,BRANCH_XY,BRANCH_SCALE)
  p=ease(t,1.05,1.64);cel=twig(p);stamp(im,cel,(0,0),BRANCH_XY,BRANCH_SCALE)
  # Gold follows connected leaf/stem pixels from the actual fingertip; no transmission to stone.
  stamp(im,HAND,HAND_TIP,contact_hand(t),HAND_SCALE)
  return im
 if t<3.6:
  u=t-2.1;p=ease(u,0,.36);recover=ease(u,.36,.66);smile=ease(u,.64,1.15)
  im=transformed_bg(GARDEN,1.035,4*(1-p),-3)
  # Prepainted expression change is a cel replacement during the head settle, no face morph.
  cel=SURPRISE if u<.72 else PLEASED
  x=850-9*p+6*recover;y=735-11*p+9*recover
  angle=-1.1*p+1.1*recover+1.0*smile
  stamp(im,cel,(275,680),(x,y),1.06,angle)
  return im
 im=PATH.copy();ground_shadow(im,GOLD,BRANCH_XY,BRANCH_SCALE)
 cel=GOLD.copy()
 # A single restrained specular sweep on gold only, never a second transformation.
 q=ease(t,3.72,4.25)
 if 0<q<1:
  a=np.asarray(cel).copy();yy,xx=np.mgrid[:cel.height,:cel.width]
  stripe=np.exp(-((xx+yy*.32-(-100+q*950))/24)**2)*.23*math.sin(math.pi*q)
  alpha=np.asarray(cel.getchannel('A'))/255
  for c,col in enumerate((255,242,182)):a[:,:,c]=np.clip(a[:,:,c]*(1-stripe)+col*stripe,0,255)
  cel=Image.fromarray(a)
 stamp(im,cel,(0,0),BRANCH_XY,BRANCH_SCALE)
 return im

