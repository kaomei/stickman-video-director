"""V65: staggered background tea sip and newspaper adjustment over V64."""
from pathlib import Path
from functools import lru_cache
import importlib.util,json,math
import numpy as np
from PIL import Image
W=Path(__file__).resolve().parent;ROOT=W.parents[1]
spec=importlib.util.spec_from_file_location('hk64patrons',ROOT/'work/hk-1990s-kitchen-motion-v64/animate.py')
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
b=base.b
WIDTH,HEIGHT,FPS,DURATION=base.WIDTH,base.HEIGHT,base.FPS,base.DURATION
GEOMETRY,CAMERA_LOG,CONTACTS=base.GEOMETRY,base.CAMERA_LOG,base.CONTACTS
KITCHEN_LOG=base.KITCHEN_LOG;PATRON_LOG={}
T,R,S,pt,ease,mix=b.T,b.R,b.S,b.pt,b.ease,b.mix
META=json.loads((W/'assets/layers.json').read_text());BOX=META['patrons_box']
old_room=b.room_plate;FRAME_T=0.
@lru_cache(None)
def asset(name):return b.rgba(Image.open(W/'assets'/(name+'.png')))
def sprite(c,name,M):
 x,y,_,_=META[name]['box'];b.blit(c,asset(name),M@T(x,y))
def chain(sh,wr,pole,lengths):return base.chain(sh,wr,pole,lengths)
def patrons(t):
 plate=old_room();x0,y0,x1,y1=BOX;C=T(-x0,-y0)
 c=asset('patrons-clean')[:,:,:3].copy()
 # A quiet paper reset precedes the sip; both gestures settle without looping.
 read=float(ease(4.72,5.26,t)*(1-ease(5.70,6.36,t)))
 P=T(431,519)@T(0,5.0*read)@R(-1.8*read)@T(-431,-519)
 pgrips=[pt(P,(382,524)),pt(P,(470,520))]
 reader=[]
 for sh,grip,pole in [((376,500),pgrips[0],1),((447,498),pgrips[1],-1)]:
  ch=chain(sh,grip,pole,(22.,22.));reader.append(ch)
  # Retain the painted source upper arms. Only the short wrist connection
  # follows the paper; no extra elbow is drawn over the existing shirt.
  origin=(377,523) if pole==1 else (469,515)
  b.line(c,origin,grip,C,width=.28,curve=.15)
 sprite(c,'newspaper',C@P)
 # Lift the cup rigidly. Its grip and rim remain on the same prop transform.
 hold=float(ease(1.03,1.39,t)*(1-ease(2.88,3.05,t)))
 lift=float(ease(1.41,1.91,t)*(1-ease(2.25,2.88,t)))
 Q=T(227,595)@T(44*lift,-54*lift)@R(-9*lift)@T(-227,-595)
 grip=pt(Q,(211,596));rest=np.asarray((248.,606.));hand=mix(rest,grip,hold)
 tea=chain((248,588),hand,-1,(28.,27.))
 for p,q in zip(tea,tea[1:]):b.line(c,p,q,C,width=.31,curve=.30)
 sprite(c,'tea-shirt',C)
 sprite(c,'tea-cup',C@Q)
 # A painted source hand keeps the cup contact identical throughout the sip.
 origin=np.asarray((382.,524.))
 sprite(c,'paper-left-hand',C@T(*hand)@S(.81)@T(*(-origin)))
 # Sleeve pixels cover the shoulder pin, and the original table covers rest hand.
 src=base.old_room()[y0:y1,x0:x1,:3]
 c[613-y0:]=src[613-y0:]
 plate[y0:y1,x0:x1,:3]=c
 PATRON_LOG.clear();PATRON_LOG.update(time=t,tea_lift=lift,tea_hold=hold,paper_adjust=read,
   tea_hand=hand.tolist(),tea_grip=grip.tolist(),tea_rim=pt(Q,(227,577)).tolist(),
   tea_lengths=[float(np.linalg.norm(q-p)) for p,q in zip(tea,tea[1:])],
   reader_lengths=[[float(np.linalg.norm(q-p)) for p,q in zip(a,a[1:])] for a in reader],
   reader_hand_grips=[p.tolist() for p in pgrips],source_faces_unchanged=True)
 return plate
def room_plate():return patrons(FRAME_T)
b.room_plate=room_plate
def draw(t):
 global FRAME_T
 FRAME_T=float(t);PATRON_LOG.clear()
 return base.draw(t)
