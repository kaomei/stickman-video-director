"""Environment leads the scene; the protagonist first appears inside the cafe.

Original painted pedestrian limbs rotate as rigid layers. A wide painted set
receives a lateral camera move; no scene or actor is stretched. V65 interior
acting, face, props and background clocks remain intact with a 0.6s offset.
"""
from pathlib import Path
from functools import lru_cache
import importlib.util,json,math
import numpy as np
from PIL import Image
W=Path(__file__).resolve().parent;ROOT=W.parents[1]
spec=importlib.util.spec_from_file_location('hk65environment',ROOT/'work/hk-1990s-patrons-v65/animate.py')
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
b=base.b
WIDTH,HEIGHT,FPS,DURATION=1280,720,30,7.6
GEOMETRY,CAMERA_LOG,CONTACTS=base.GEOMETRY,base.CAMERA_LOG,base.CONTACTS
KITCHEN_LOG,PATRON_LOG=base.KITCHEN_LOG,base.PATRON_LOG
T,R,S,pt,ease,mix=b.T,b.R,b.S,b.pt,b.ease,b.mix
CUT=1.8;OFFSET=.6;OPENING_LOG={}
LAYERS=json.loads((W/'assets/layers.json').read_text())

@lru_cache(None)
def asset(name):return b.rgba(Image.open(W/'assets'/(name+'.png')))

def source_layer(c,name,M):
 x,y,_,_=LAYERS[name]['box'];b.blit(c,asset(name),M@T(x,y))

def walker(c,C,name,t):
 # Source-paint rigid legs, a restrained straight-leg stride and a depth path.
 # Every section uses uniform scale; knees never reverse or stretch.
 if name=='briefcase':
  hip=np.array([49.,649.]);root=hip+np.array([30*t,-20*t]);scale=1-.043*t
  phase=math.tau*(1.12*t+.12);pivots=[(39,650),(60,650)];amp=6.
 else:
  hip=np.array([400.,654.]);root=hip+np.array([-17*t,-10*t]);scale=1-.026*t
  phase=math.tau*(1.32*t+.57);pivots=[(391,653),(411,653)];amp=8.
 M=C@T(*root)@S(scale)@T(*(-hip))
 b.shadow(c,C,pt(T(*root)@S(scale)@T(*(-hip)),(hip[0],725 if name=='briefcase' else 686)),
          22*scale,3.2*scale,.12)
 for i,side in enumerate(['left','right']):
  pivot=pivots[i];angle=amp*math.sin(phase+i*math.pi)
  source_layer(c,name+'-'+side,M@T(*pivot)@R(angle)@T(-pivot[0],-pivot[1]))
 source_layer(c,name+'-upper',M@T(0,-.55*math.sin(phase)**2))
 return {'name':name,'root_world':root.tolist(),'uniform_scale':float(scale),
         'leg_angles_deg':[float(amp*math.sin(phase)),float(-amp*math.sin(phase))]}

def street(c,C,t,cx):
 b.blit(c,asset('street-separated'),C)
 actors=[walker(c,C,'briefcase',t),walker(c,C,'coral',t)]
 # A frontal three-quarter taxi follows the road's depth, then clears the
 # foreground. Perspective comes from its own position/scale, not scene warp.
 q=t/1.40;x=250+455*q;y=710+475*q*q;scale=.58+1.30*q
 if y-(124*scale)<1000:
  b.shadow(c,C,(x,y-1),65*scale,7*scale,.19)
  b.put(c,'taxi',(x,y+.65*math.sin(19*t)),C,angle=.35*math.sin(8*t),
        scale=scale,anchor=(.5,1))
 # Painted foreground layers move faster than the architecture.
 F=C@T(-(cx-635)*.42,0)
 b.blit(c,b.asset('awning'),F@T(-100,0))
 b.blit(c,b.asset('crates'),F@T(-270,718))
 return actors,{'position_world':[x,y],'uniform_scale':scale}

def draw(t):
 OPENING_LOG.clear()
 if t>=CUT:
  source_t=t-OFFSET;source_frame=round(source_t*FPS)
  if abs(source_t-source_frame/FPS)<1e-7:source_t=source_frame/FPS
  return base.draw(source_t)
 GEOMETRY.clear();CAMERA_LOG.clear();CONTACTS.clear();b.GEOMETRY.clear()
 KITCHEN_LOG.clear();PATRON_LOG.clear()
 c=np.full((HEIGHT,WIDTH,3),[.96,.82,.68],np.float32)
 u=ease(.16,1.48,t);v=np.array([635+409*u,560+15*u,1.03])
 C=b.camera_matrix(v);actors,taxi=street(c,C,t,v[0])
 glow=b.cv2.GaussianBlur(np.maximum(c-.84,0),(0,0),4.)*.045
 CAMERA_LOG.append({'time':float(t),'shot':'environment_to_cafe','cx_cy_scale':v.tolist(),
                    'actor_scale_anisotropy':1.0})
 # This is a geographical handoff: cafe exterior owner -> interior owner.
 OPENING_LOG.update(time=float(t),protagonist_visible=False,actors=actors,taxi=taxi,
   destination_owner_eye=pt(C,(1427,511)).tolist(),camera_settled=bool(t>=1.48),
   source_bounds=[float(v[0]-640/v[2]),float(v[1]-360/v[2]),
                  float(v[0]+640/v[2]),float(v[1]+360/v[2])])
 return Image.fromarray(np.uint8(np.clip(c+glow,0,1)*255))
