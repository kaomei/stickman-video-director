"""V63: discrete, newly drawn painted surprise poses on the intact head.

No face texture deformation, feature image scaling or pose cross-dissolve.
The three take drawings change eye/mouth shapes with pressure-varied marks.
Scene/actor/contact/camera code is retained from V60.
"""
from pathlib import Path
from functools import lru_cache
import importlib.util
import numpy as np
from PIL import Image,ImageDraw

W=Path(__file__).resolve().parent;ROOT=W.parents[1]
spec=importlib.util.spec_from_file_location('hk60posed',ROOT/'work/hk-1990s-arm-fix-v60/animate.py')
base=importlib.util.module_from_spec(spec);spec.loader.exec_module(base)
b=base.b;character=b.character
WIDTH,HEIGHT,FPS,DURATION=base.WIDTH,base.HEIGHT,base.FPS,base.DURATION
GEOMETRY,CAMERA_LOG,CONTACTS=base.GEOMETRY,base.CAMERA_LOG,base.CONTACTS
old_head=character.head
SS=4;SIZE=character.HEAD_SIZE;BIG=(SIZE[0]*SS,SIZE[1]*SS)

@lru_cache(None)
def skin():
    src=character.asset('street-head');clean=character._clean('all')
    # Protect the side fringe and head edge from the old broad cleanup masks.
    mask=Image.new('L',SIZE)
    ImageDraw.Draw(mask).polygon([(80,56),(84,46),(92,38),(103,32),(116,29),
        (132,29),(145,32),(154,37),(160,45),(164,57),(168,68),
        (172,78),(181,88),(184,108),(178,128),(166,141),(151,150),
        (131,154),(108,155),(85,149),(65,139),(50,127),(43,113),
        (56,103),(65,94),(74,82),(78,68)],fill=255)
    allowed=np.asarray(mask,np.float32)/255.
    return src+(clean-src)*allowed[:,:,None],allowed

# Each shape below is an authored drawing, not a transformed source feature.
POSES={
 1:{'brows': [[(81,58),(95,54),(112,56)],[(126,48),(139,39),(153,43)]],
    'eyes': [([(83,75),(96,67),(110,66),(122,70)],[(122,70),(119,84),(109,91),(97,90),(87,84),(83,75)]),
             ([(133,65),(144,58),(156,57),(166,61)],[(166,61),(165,73),(157,81),(146,80),(137,74),(133,65)])],
    'mouth':[(108,116),(122,112),(138,106),(152,105),(153,115),(145,125),(132,130),(119,128),(111,122),(108,116)],
    'teeth':[(113,116),(129,111),(147,108),(144,115),(130,121),(117,122)],
    'pupils':[(110,79,4.0,6.1),(157,70,3.5,5.8)]},
 2:{'brows': [[(82,53),(96,48),(114,51)],[(127,44),(139,35),(153,39)]],
    'eyes': [([(95,77),(99,67),(106,63),(115,65),(122,76)],[(122,76),(120,87),(112,94),(103,92),(96,84),(95,77)]),
             ([(145,68),(147,58),(154,54),(162,56),(167,67)],[(167,67),(165,77),(158,83),(150,81),(145,73),(145,68)])],
    'mouth':[(120,108),(126,104),(136,104),(143,108),(147,117),(147,126),(140,133),(129,135),(121,131),(117,124),(118,115),(120,108)],
    'teeth':[(123,107),(132,106),(138,108),(136,112),(128,111),(123,110)],
    'pupils':[(110,78,3.2,5.1),(157,69,2.8,4.8)]},
 3:{'brows': [[(82,54),(96,49),(114,52)],[(127,45),(139,36),(153,40)]],
    'eyes': [([(96,77),(100,68),(107,64),(115,66),(121,76)],[(121,76),(120,86),(112,93),(104,91),(97,84),(96,77)]),
             ([(145,68),(148,59),(154,55),(161,57),(167,67)],[(167,67),(165,76),(158,82),(151,80),(146,73),(145,68)])],
    'mouth':[(121,109),(128,105),(137,106),(143,110),(146,118),(145,126),(138,132),(128,132),(121,127),(119,120),(120,113),(121,109)],
    'teeth':[(124,108),(132,108),(137,110),(135,113),(129,112),(124,111)],
    'pupils':[(110,78,3.4,5.2),(157,69,3.0,4.9)]}
}

class Paint:
    def __init__(self):
        self.im=Image.new('RGBA',BIG);self.d=ImageDraw.Draw(self.im)
    def fill(self,points,color,curve=True):
        q=character._curve(points,9) if curve else np.asarray(points,float)
        self.d.polygon([tuple(p*SS) for p in q],fill=color)
    def stroke(self,points,width=3.8,color=(77,53,53,255),seed=0):
        q=character._curve(points,10)
        for k in range(len(q)-1):
            # Fixed pressure changes follow the painted mark. No temporal
            # random jitter or uniform double contour around the feature.
            u=k/max(1,len(q)-2)
            pressure=.88+.11*np.sin(k*.43+seed)+.05*np.sin(k*1.17+.7*seed)
            taper=.79+.21*min(1,u*7,(1-u)*8)
            w=width*pressure*taper
            col=tuple(int(np.clip(v+2*np.sin(k*.24+seed),0,255)) for v in color[:3])+(color[3],)
            self.d.line([tuple(v*SS) for v in q[k:k+2]],fill=col,width=max(1,round(w*SS)))
            if k%3==0:
                x,y=q[k]*SS;r=w*.39*SS
                self.d.ellipse((x-r,y-r,x+r,y+r),fill=col)
    def eye(self,upper,lower,pupil,side):
        lower=[upper[-1]]+lower[1:-1]+[upper[0]]
        boundary=np.concatenate([character._curve(upper),character._curve(lower)])
        mask=Image.new('L',BIG);ImageDraw.Draw(mask).polygon([tuple(v*SS) for v in boundary],fill=255)
        eye=Paint();eye.fill(boundary,(255,245,237,255),curve=False)
        cx,cy,rx,ry=pupil
        p=[(cx-rx*.7,cy-ry),(cx+rx*.45,cy-ry*.93),(cx+rx,cy-ry*.35),
           (cx+rx*.8,cy+ry*.65),(cx,cy+ry),(cx-rx*.85,cy+ry*.4),(cx-rx*.7,cy-ry)]
        eye.fill(p,(70,48,49,255))
        self.im.alpha_composite(Image.composite(eye.im,Image.new('RGBA',BIG),mask))
        self.d=ImageDraw.Draw(self.im)
        self.stroke(lower,2.05,(91,63,62,255),seed=side+2)
        self.stroke(upper,3.3,(76,52,52,255),seed=side+4)

@lru_cache(16)
def pose(number,blink_state=0):
    out,allowed=skin();out=out.copy();p=POSES[number];paint=Paint()
    for side,brow in enumerate(p['brows']):paint.stroke(brow,4.6,seed=side+7)
    for side,((upper,lower),pupil) in enumerate(zip(p['eyes'],p['pupils'])):
        if blink_state==2:
            closed=[(96,82),(105,85),(114,83),(122,79)] if side==0 else [(146,74),(153,76),(161,73),(167,70)]
            paint.stroke(closed,3.8,seed=side+12)
        else:
            if blink_state==1:
                upper=[(96,80),(102,76),(114,75),(121,78)] if side==0 else [(145,71),(152,68),(160,68),(166,70)]
            paint.eye(upper,lower,pupil,side)
    paint.fill(p['mouth'],(72,49,50,255))
    paint.stroke(p['mouth'],1.9,(80,54,54,255),seed=16)
    if number==1:
        paint.fill(p['teeth'],(255,241,226,255),curve=False)
        paint.stroke([(128,113),(130,120)],1.2,seed=9)
        paint.stroke([(140,110),(141,117)],1.15,seed=11)
    else:
        paint.stroke([(127,128),(134,129),(139,126)],1.5,(147,88,85,255),seed=18)
    over=np.asarray(paint.im.resize(SIZE,Image.Resampling.LANCZOS),np.float32)/255.
    # A tiny stationary pigment variation within new dark paint, derived
    # from the existing source. No global noise, blur or color change.
    src=character.asset('street-head');grain=(src[:,:,:3].mean(axis=2)-.75)*.012
    over[:,:,:3]=np.clip(over[:,:,:3]+grain[:,:,None],0,1)
    a=over[:,:,3:4]*out[:,:,3:4]*allowed[:,:,None]
    out[:,:,:3]=over[:,:,:3]*a+out[:,:,:3]*(1-a)
    return out.astype(np.float32)

def head(emotion=0,blink=0,gaze=0):
    # Pose cuts rather than transforming source teeth/eyes through a morph.
    # Neutral and pre-reaction footage retain the exact approved source.
    e=float(emotion)
    if e<.1:return character.asset('street-head').copy()
    number=1 if e<.4 else 2 if e<.9 else 3
    bs=2 if blink>.65 else 1 if blink>.18 else 0
    return pose(number,bs).copy()

character.head=head
def draw(t):return base.draw(t)
