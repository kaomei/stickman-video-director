"""Existing B8 Midas 20s R3 trial. Painted complete cels, absolute-time states.
Preserves encoded 0–4.65 picture and original narration sample timing.
No articulated/IK limbs, no generated speech, no external generation APIs.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageFilter
from b8_portable import sha_file
import numpy as np, math,json,subprocess,argparse,importlib.util,datetime,os
ASSET=Path(__file__).resolve().parent.parent/'assets/b8/midas-replay-v1'
W,H,FPS=1280,720,60;START=279;TOTAL=1200;R=Image.Resampling
READS=set()
def readimg(p):
 p=Path(p);READS.add(str(p.resolve()));return Image.open(p).convert('RGBA')
def cel(n):return readimg(ASSET/'layers'/(n+'.png'))
CAPTIONS=[(0,3.6,'King Midas turned everything he touched into gold.'),(3.94,4.65,'A branch.'),(4.72,5.75,'A stone.'),(5.94,7.55,'He thought it was a blessing.'),(7.95,9.05,'Then came dinner.'),(9.25,10.4,'The bread hardened.'),(10.6,12.35,'The wine turned to metal.'),(12.62,14.85,'He had all the gold in the world...'),(14.92,17.05,'and nothing he could eat.')]
SHOTS=[(0,.7,'Garden establish'),(.7,2.1,'Fallen twig contact'),(2.1,3.6,'Discovery reaction'),(3.6,4.65,'Grounded golden branch'),(4.65,5.85,'Grounded stone contact'),(5.85,7.85,'Proud palace bust'),(7.85,9.2,'Banquet wide'),(9.2,10.05,'Bread contact on plate'),(10.05,10.6,'Worried reaction'),(10.6,12.6,'Lower-lip wine contact'),(12.6,13.65,'Cup landing / release / palm'),(13.65,14.85,'Whole table gold / recoil'),(14.85,17.1,'Doorway disappointment'),(17.1,20,'Exterior isolation')]
def ease(t,a,b):
 q=max(0.,min(1.,(t-a)/(b-a)));return q*q*(3-2*q)
def stamp(im,sprite,anchor,dest,scale=1,angle=0,opacity=1):
 # Rigid whole-cel transform; no bend, skinning, IK or line-drawn limb extension.
 if scale<=0 or opacity<=0:return
 box=sprite.getchannel('A').getbbox()
 if box is None:return
 c,s=math.cos(math.radians(angle)),math.sin(math.radians(angle));ax,ay=anchor;px,py=dest
 corners=[(box[0],box[1]),(box[2],box[1]),(box[0],box[3]),(box[2],box[3])]
 pts=[(px+scale*(c*(x-ax)-s*(y-ay)),py+scale*(s*(x-ax)+c*(y-ay)))for x,y in corners]
 l=max(0,math.floor(min(x for x,y in pts))-2);r=min(W,math.ceil(max(x for x,y in pts))+2);top=max(0,math.floor(min(y for x,y in pts))-2);b=min(H,math.ceil(max(y for x,y in pts))+2)
 if r<=l or b<=top:return
 dx,dy=px-l,py-top;m=(c/scale,s/scale,ax-(c*dx+s*dy)/scale,-s/scale,c/scale,ay+(s*dx-c*dy)/scale)
 tile=sprite.transform((r-l,b-top),Image.Transform.AFFINE,m,R.BICUBIC)
 if opacity<1:tile.putalpha(tile.getchannel('A').point(lambda v:round(v*opacity)))
 im.alpha_composite(tile,(l,top))
def camera(im,z=1,cx=640,cy=360):
 # Same world-to-screen transform for all layers in the composed scene.
 if z==1:return im
 return im.transform((W,H),Image.Transform.AFFINE,(1/z,0,cx-W/2/z,0,1/z,cy-H/2/z),R.BICUBIC)
def gold(img):
 a=np.array(img);lum=np.dot(a[:,:,:3],[.2126,.7152,.0722]);q=np.clip((lum-20)/190,0,1)**.55
 rgb=np.array([130,69,10])+q[:,:,None]*np.array([125,155,102]);rgb[lum<40]=a[:,:,:3][lum<40]*[1.12,.95,.62];a[:,:,:3]=np.clip(rgb,0,255).astype('uint8');return Image.fromarray(a)
def material(base,metal,p,origin,allowed=None):
 if p<=0:return base
 if p>=1 and allowed is None:return metal
 yy,xx=np.mgrid[:base.height,:base.width];dist=np.hypot(xx-origin[0],yy-origin[1]);mask=np.array(base.getchannel('A'))>32
 if allowed is not None:mask &= np.array(allowed)>16
 maximum=float(dist[mask].max());v=np.clip((maximum*p-dist+9)/18,0,1)
 if allowed is not None:v*=np.asarray(allowed)/255
 return Image.composite(metal,base,Image.fromarray(np.uint8(v*255)))
def shadow(im,center,rx,ry,opacity=60):
 lay=Image.new('RGBA',(W,H));d=ImageDraw.Draw(lay);x,y=center;d.ellipse((x-rx,y-ry,x+rx,y+ry),fill=(31,16,23,opacity));im.alpha_composite(lay.filter(ImageFilter.GaussianBlur(5)))
NAMES=['stone-hand','stone-normal','stone-gold-registered','bread-hand','bread-normal','bread-gold-registered','plate','worried-bust','grapes','wine-neutral','wine-surprise','wine-red-unit','wine-gold-unit','cup-gold','react-standing','table-grip','table-hover','table-palm','proud-bust','dejected-bust','dinner-standing','rear-standing','table-original','cup-red-original']
C={n:cel(n)for n in NAMES}
# Project the ceramic plane for the low-angle wide shot; characters stay rigid.
WIDE_PLATE=C['plate'].resize((431,112),R.LANCZOS)
BG={n:readimg(ASSET/'backgrounds'/(n+'.png')).resize((W,H),R.LANCZOS) for n in ['path','palace','hall','court']}
BREAD_BG=readimg(ASSET/'backgrounds/bread.png').resize((W,H),R.LANCZOS)
TABLE_BG=readimg(ASSET/'backgrounds/table.png').resize((W,H),R.LANCZOS)
TABLE_GOLD=gold(TABLE_BG);TABLE= C['table-original'];GTABLE=gold(TABLE)
# Food/ceramic stay untouched. Polygon matte follows visible silhouettes in clean plate.
WOOD=Image.new('L',(W,H),0);d=ImageDraw.Draw(WOOD);d.polygon([(0,307),(1070,299),(1279,392),(1279,719),(0,719)],fill=255)
d.polygon([(0,305),(12,290),(25,276),(43,260),(66,246),(103,233),(150,227),(198,230),(251,241),(291,265),(323,291),(335,313),(370,321),(416,337),(440,355),(438,380),(403,403),(350,421),(253,432),(171,435),(76,426),(0,410)],fill=0)
d.polygon([(0,389),(21,371),(40,386),(50,378),(56,406),(92,410),(121,401),(155,414),(168,434),(199,445),(226,465),(257,476),(279,491),(283,520),(260,550),(214,574),(145,589),(70,586),(0,568)],fill=0)
# Wine keeps the original cup, grip and forearm pixels. Only a registered liquid/crest matte changes.
RED=C['wine-red-unit'];a=np.array(RED);g=np.array(C['wine-gold-unit']);padded=Image.new('RGBA',RED.size);padded.alpha_composite(C['wine-gold-unit'],(0,0))
WINE_MASK=Image.new('L',RED.size,0);ImageDraw.Draw(WINE_MASK).polygon([(145,12),(185,10),(240,22),(278,31),(306,20),(326,27),(326,82),(278,88),(230,72),(180,51),(151,31)],fill=255)
# Generated gold surface is a fixed cel, not a re-simulated liquid.
FROZEN=Image.composite(padded,RED,WINE_MASK);FROZEN.putalpha(Image.fromarray(np.maximum(np.asarray(RED.getchannel('A')),np.minimum(np.asarray(padded.getchannel('A')),np.asarray(WINE_MASK)))))
# Reuse original cup, grip and forearm; only the newly drawn liquid is overlaid.
FLUID=RED.copy();FLUID.alpha_composite(cel('wine-flow-material'))
# Original doors from approved board act as near foreground; background is complete behind them.
DOOR_L=readimg(ASSET/'foreground/door-left.png');DOOR_R=readimg(ASSET/'foreground/door-right.png')
SHORT=None
def short():
 global SHORT
 if SHORT is None:
  helper=Path(__file__).with_name('_b8_midas_intro.py')
  spec=importlib.util.spec_from_file_location('_b8_midas_intro',helper)
  SHORT=importlib.util.module_from_spec(spec);spec.loader.exec_module(SHORT)
 return SHORT

def bread_scene(t):
 im=BREAD_BG.copy();stamp(im,C['plate'],(215,300),(600,592),1.25)
 stamp(im,material(C['bread-normal'],C['bread-gold-registered'],ease(t,9.38,9.84),(140,75)),(197,300),(600,565),1.05)
 stamp(im,C['grapes'],(185,305),(64,694),.88);stamp(im,C['cup-red-original'],(165,490),(1100,350),.56)
 down=ease(t,9.20,9.38);up=ease(t,9.79,10.04);pos=(540-10*(1-down)-18*up,330-88*(1-down)-133*up)
 stamp(im,C['bread-hand'],(292,277),pos,1.25)
 return im

def wide_table(t,metal=False,king=True):
 im=BG['hall'].copy();p=1 if metal else 0
 tbl=material(TABLE,GTABLE,p,(660,30));shadow(im,(540,615),330,24,65);stamp(im,tbl,(0,0),(140,353),.95)
 stamp(im,WIDE_PLATE,(215,110),(443,405),.36);stamp(im,C['bread-gold-registered'] if metal else C['bread-normal'],(197,300),(443,392),.25)
 stamp(im,C['grapes'],(185,305),(300,410),.25)
 cup=C['cup-gold'] if metal else C['cup-red-original'];stamp(im,cup,(cup.width/2,cup.height-2),(720,394),.30 if metal else .22)
 if king:
  if metal:
   p=ease(t,13.66,14.12);shadow(im,(1090,626),83,8,52);stamp(im,C['react-standing'],(145,490),(1080+9*p,630),.94,-1.2*p)
  else:
   p=ease(t,7.85,8.30);shadow(im,(265,630),59,8,55);stamp(im,C['dinner-standing'],(110,485),(265+3*p,631),.86,-.7*p)
 return im

def render_picture(t):
 if t<4.65:return short().render_picture(t)
 if t<5.85:
  im=BG['path'].copy();stone=material(C['stone-normal'],C['stone-gold-registered'],ease(t,4.98,5.40),(160,85));shadow(im,(690,610),294,22,70);stamp(im,stone,(309,184),(690,425),1.05)
  down=ease(t,4.65,4.98);up=ease(t,5.32,5.77);stamp(im,C['stone-hand'],(430,490),(485-12*(1-down)-50*up,321-104*(1-down)-230*up),.80)
  return im
 if t<7.85:
  p=ease(t,5.90,6.65);im=BG['palace'].copy();stamp(im,C['proud-bust'],(209,510),(555,745-7*p),1.35,.9*p);return im
 if t<9.20:
  im=wide_table(t);p=ease(t,7.85,8.36);stamp(im,DOOR_L,(0,0),(-5-29*p,0),720/DOOR_L.height);stamp(im,DOOR_R,(DOOR_R.width,0),(1285+25*p,0),720/DOOR_R.height);return im
 if t<10.05:return bread_scene(t)
 if t<10.6:
  p=ease(t,10.05,10.37);im=BG['hall'].copy();stamp(im,C['worried-bust'],(235,468),(845+5*p,737-8*p),1.46,-.9*p);return im
 if t<12.6:
  im=BG['hall'].copy();sip=ease(t,10.70,11.43);recoil=ease(t,11.56,11.96);settle=ease(t,12.05,12.42)
  head=C['wine-surprise'] if t>=11.52 else C['wine-neutral'];stamp(im,head,(0,0),(620+25*recoil-4*settle,8-8*recoil+3*settle),1.55,.1*settle)
  unit=material(FLUID,FROZEN,ease(t,11.43,11.67),(316,34),WINE_MASK)
  # Same rigid gripping unit throughout, right wine edge meets exact lower-lip anchor.
  stamp(im,unit,(316,34),(821-73*(1-sip)-35*recoil,423+41*(1-sip)+56*recoil),1.18)
  return im
 if t<13.65:
  p=ease(t,13.12,13.65);im=material(TABLE_BG,TABLE_GOLD,p,(1040,505),WOOD).copy();cup=C['cup-gold'];land=ease(t,12.60,12.72);cup_bottom=(760,505-23*(1-land));stamp(im,cup,(114,333),cup_bottom,1.07)
  if t<12.84:
   # Base lands at 12.72 and stays flush while fingers remain closed for 0.12s.
   stamp(im,C['table-grip'],(57,615),(760,400-23*(1-land)),1.15)
  elif t<13.03:
   q=ease(t,12.84,13.03);stamp(im,C['table-hover'],(90,617),(795+203*q,398+24*q),.94)
  else:
   q=ease(t,13.03,13.12);stamp(im,C['table-palm'],(82,659),(1035+5*q,444+61*q),.92)
  return im
 if t<14.85:return wide_table(t,True)
 if t<17.1:
  p=ease(t,14.95,15.78);im=wide_table(t,True,False);stamp(im,DOOR_L,(0,0),(-2,0),720/DOOR_L.height);stamp(im,C['dejected-bust'],(232,477),(928+3*p,748+12*p),1.45,1.15*p);return im
 im=BG['court'].copy();q=ease(t,17.1,19.30);settle=ease(t,17.22,18.02);shadow(im,(808,614),27,5,42);stamp(im,C['rear-standing'],(117,476),(808,615),.32,1.4*settle)
 return camera(im,1.085-.085*q)

def frame(t,captions=True):
 im=render_picture(t)
 if captions:caption_overlay(im,t)
 return im.convert('RGB')

def caption_overlay(im,t):
    text_index=next((i for i,(a,b,_) in enumerate(CAPTIONS) if a<=t<b),None)
    if text_index is None:return
    gradient=np.zeros((185,W,4),np.uint8);gradient[:,:,3]=np.linspace(0,190,185).astype('uint8')[:,None]
    im.alpha_composite(Image.fromarray(gradient),(0,H-185))
    for kind,color in [('stroke','#181a1c'),('fill','#f6eddf')]:
        mask=CAPTION_MASKS[(text_index,kind)]
        ImageDraw.Draw(im).bitmap((0,0),mask,fill=color)
CAPTION_MASKS={(i,kind):Image.open(ASSET/'captions'/f'{i:02d}-{kind}.png').convert('L') for i in range(len(CAPTIONS)) for kind in ('stroke','fill')}

DURATION_SECONDS=20.0

def render_frame(t,width=1280,height=720,captions=True):
 """Render the approved Midas sample at source time t, without regenerating art."""
 if not 0<=t<DURATION_SECONDS:raise ValueError('Source time must satisfy 0 <= t < 20.')
 if width<2 or height<2 or width*9!=height*16:raise ValueError('Midas replay requires a 16:9 size; new compositions need their own reviewed scene plan.')
 image=frame(t,captions)
 return image if (width,height)==(W,H) else image.resize((width,height),R.LANCZOS)

def _tool(name):
 import shutil
 value=os.environ.get(name.upper(),name)
 found=shutil.which(value)
 if found is None:raise RuntimeError(f'{name} is unavailable; add it to PATH or set {name.upper()}.')
 return found

def render_clip(output,start=0,end=20,width=1280,height=720,fps=60,audio=True,captions=True,overwrite=False):
 """Replay a source-time interval at 1x. The script never calls a generation service."""
 output=Path(output).expanduser().resolve()
 if output.suffix.lower()!='.mp4':raise ValueError('Video output must end in .mp4.')
 if output.exists() and not overwrite:raise FileExistsError(f'Output already exists: {output}. Use --overwrite explicitly.')
 if not (0<=start<end<=20):raise ValueError('Range must satisfy 0 <= start < end <= 20.')
 if not (isinstance(fps,int) and 1<=fps<=120):raise ValueError('FPS must be an integer from 1 to 120.')
 if width%2 or height%2:raise ValueError('H.264 output dimensions must be even.')
 count=round((end-start)*fps)
 if abs(count/fps-(end-start))>1e-7:raise ValueError('The selected source interval must contain a whole number of output frames.')
 render_frame(start,width,height,captions)
 ffmpeg=_tool('ffmpeg');ffprobe=_tool('ffprobe')
 output.parent.mkdir(parents=True,exist_ok=True)
 partial=output.with_name(output.stem+'.partial.mp4')
 if partial.exists():raise FileExistsError(f'Incomplete output already exists: {partial}; inspect it before retrying.')
 log_path=output.with_suffix('.encode.log')
 cmd=[ffmpeg,'-y','-v','warning','-f','rawvideo','-pix_fmt','rgb24','-s',f'{width}x{height}','-r',str(fps),'-i','-']
 if audio:cmd+=['-ss',f'{start:.9f}','-i',str(ASSET/'audio/master.wav'),'-map','0:v:0','-map','1:a:0']
 else:cmd+=['-an']
 cmd+=['-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p']
 if audio:cmd+=['-c:a','aac','-b:a','256k','-ar','48000']
 cmd+=['-t',f'{end-start:.9f}','-movflags','+faststart',str(partial)]
 with log_path.open('wb') as log:
  proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=log)
  try:
   for i in range(count):
    proc.stdin.write(render_frame(start+i/fps,width,height,captions).tobytes())
    if i%max(1,fps*2)==0:print(json.dumps({'rendered_frames':i+1,'total_frames':count,'source_time':round(start+i/fps,4)}),flush=True)
   proc.stdin.close();code=proc.wait()
   if code:raise RuntimeError(f'ffmpeg exited {code}; see {log_path}')
  finally:
   if proc.poll() is None:proc.terminate();proc.wait()
 probe=json.loads(subprocess.check_output([ffprobe,'-v','error','-show_format','-show_streams','-of','json',str(partial)]))
 partial.replace(output)
 report={'schema_version':1,'route':'B8','kind':'approved_midas_sample_replay','output':str(output),'sha256':sha_file(output),'source_interval':[start,end],'source_playback_rate':1,'fps':fps,'resolution':[width,height],'frames':count,'audio':'original existing master interval at 1x' if audio else 'none','captions':captions,'ffprobe':probe,'external_generation_calls':0,'new_story_visual_acceptance':'not_tested','original_reference_approval':'visual style only; independent listening acceptance not inferred','encode_log':str(log_path)}
 output.with_suffix('.replay-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 return report

def main():
 parser=argparse.ArgumentParser(description='Portable replay of the approved B8 Midas R3 sample; does not generate a new story.')
 parser.add_argument('--output',required=True,type=Path)
 parser.add_argument('--start',type=float,default=0)
 parser.add_argument('--end',type=float,default=20)
 parser.add_argument('--fps',type=int,default=60)
 parser.add_argument('--width',type=int,default=1280)
 parser.add_argument('--height',type=int,default=720)
 parser.add_argument('--frame',type=float,help='Write one source frame as PNG instead of encoding video.')
 parser.add_argument('--no-audio',action='store_true')
 parser.add_argument('--no-captions',action='store_true')
 parser.add_argument('--overwrite',action='store_true')
 args=parser.parse_args()
 try:
  if args.frame is not None:
   if args.output.suffix.lower()!='.png':raise ValueError('Single-frame output must end in .png.')
   if args.output.exists() and not args.overwrite:raise FileExistsError(f'Output already exists: {args.output}')
   args.output.parent.mkdir(parents=True,exist_ok=True)
   render_frame(args.frame,args.width,args.height,not args.no_captions).save(args.output)
   print(json.dumps({'output':str(args.output.resolve()),'source_time':args.frame}))
  else:
   report=render_clip(args.output,args.start,args.end,args.width,args.height,args.fps,not args.no_audio,not args.no_captions,args.overwrite)
   print(json.dumps({'output':report['output'],'sha256':report['sha256'],'source_interval':report['source_interval']}))
 except (ValueError,FileExistsError,RuntimeError) as exc:parser.error(str(exc))

if __name__=='__main__':main()
