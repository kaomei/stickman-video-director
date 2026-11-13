"""Six-second local puppet/contact fixture. No model generation or film approval.

The scene owns timing and staging. Anatomy, visibility, ink and contacts are
owned by the installed runtime and the per-view character packages.
"""
from pathlib import Path
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

_CACHE={}
CAM=np.array([[1.35,0.,-278.],[0.,1.35,-225.],[0.,0.,1.]])
def screen(p):return (CAM@np.r_[p,1])[:2]
def smooth(v):
    v=float(np.clip(v,0,1));return v*v*(3-2*v)
def mix(a,b,u):return np.asarray(a)*(1-u)+np.asarray(b)*u

def setup(c):
    runtime=c.puppet_runtime
    background=Image.open(c.base/'art/hotel-panorama.png').convert('RGB')
    # Native landscape composition: wide painted lobby with clear floor and
    # separated shoulders; no anisotropic camera or character scaling.
    factor=720/background.height
    background=background.resize((round(background.width*factor),720),Image.Resampling.LANCZOS)
    background=background.crop((250,0,1530,720)).convert('RGBA')
    shadow=Image.new('RGBA',background.size);draw=ImageDraw.Draw(shadow)
    for x in (520,850): draw.ellipse((x-58,648,x+61,670),fill=(58,40,29,53))
    background=Image.alpha_composite(background,shadow.filter(ImageFilter.GaussianBlur(7)))
    table=Image.open(c.base/'art/table.png').convert('RGBA')
    table.thumbnail((250,192),Image.Resampling.LANCZOS)
    background.alpha_composite(table,(562,510))
    events=[
      dict(t0=0,t1=1.4,state='release',holders=[],paper_start=[665,515,0]),
      dict(t0=1.4,t1=2.5,state='owner',holders=[dict(actor_id='keeper',arm='right',grip=[0,.5])],paper_start=[665,515,0],paper_end=[680,500,0]),
      dict(t0=2.5,t1=3.05,state='owner',holders=[dict(actor_id='keeper',arm='right',grip=[0,.5])],paper_start=[680,500,0]),
      dict(t0=3.05,t1=3.55,state='shared',holders=[dict(actor_id='keeper',arm='right',grip=[0,.5]),dict(actor_id='runner',arm='left',grip=[1,.5])],paper_start=[680,500,0]),
      dict(t0=3.55,t1=4.3,state='owner',holders=[dict(actor_id='runner',arm='left',grip=[1,.5])],paper_start=[680,500,0],paper_end=[690,505,-5]),
      dict(t0=4.3,t1=6.001,state='owner',holders=[dict(actor_id='runner',arm='left',grip=[1,.5])],paper_start=[690,505,-5])
    ]
    for event in events:
        for name in ('paper_start','paper_end'):
            if name in event:
                x,y,a=event[name];q=screen([x,y]);event[name]=[float(q[0]),float(q[1]),a]
    inv=np.linalg.inv(CAM)
    background=background.transform((1280,720),Image.Transform.AFFINE,tuple(inv[:2].flatten()),resample=Image.Resampling.BICUBIC)
    return dict(runtime=runtime,background=background,timeline=runtime.ContactTimeline(events,paper_size=(62*1.35,76*1.35)),
      paper_art=Image.open(c.base/'art/letter.png').convert('RGBA'),
      keeper=runtime.Puppet(c.character_packages['keeper'],'front','keeper'),
      runner=runtime.Puppet(c.character_packages['runner'],'three_quarter','runner'))

def placement(x,y):return np.array([[1.,0,x],[0,1.,y],[0,0,1.]])
def rest_target(runtime,character,view,side,mat):
    arm=character.views[view].arms[side]
    p=runtime.forward_kinematics(arm,runtime.PoseLibrary.sample(arm,'rest',1))[2]
    return (mat@np.r_[p,1])[:2]

def frame(t,c):
    key=(str(c.base),c.fingerprint)
    if key not in _CACHE:_CACHE[key]=setup(c)
    s=_CACHE[key];r=s['runtime'];i=round(t*30)
    # A brief authored three-pose turn, rather than distorting one front sprite.
    view='front' if t<.30 else ('three_quarter' if t<.50 else 'side')
    giver=s['keeper'];giver.set_view(view,allow_cut=True)
    recipient=s['runner'];gm=CAM@placement(520,660);rm=CAM@placement(850,660)
    paper=s['timeline'].sample(t)
    g_rest=rest_target(r,giver.character,view,'right',gm)
    receive_rest=rest_target(r,recipient.character,'three_quarter','left',rm)
    targets_g={};targets_r={}
    # Reach to a static, real prop before ownership begins. The same timeline
    # supplies BOTH the rendered paper transform and its owner hand target.
    if .85<=t<1.4:
        targets_g['right']=mix(g_rest,screen([634,515]),smooth((t-.85)/.55)).tolist()
    elif 'keeper' in paper.targets: targets_g.update(paper.targets['keeper'])
    elif 3.55<=t<4.4:
        targets_g['right']=mix(screen([649,500]),g_rest,smooth((t-3.55)/.85)).tolist()
    if 2.5<=t<3.05:
        targets_r['left']=mix(receive_rest,screen([711,500]),smooth((t-2.5)/.55)).tolist()
    elif 'runner' in paper.targets:targets_r.update(paper.targets['runner'])
    gaction='reach' if targets_g else 'rest'
    raction='reach' if targets_r else 'rest'
    gphase=smooth((t-.85)/.55) if .85<=t<1.4 else (1-smooth((t-3.55)/.85) if 3.55<=t<4.4 else 1)
    rphase=smooth((t-2.5)/.55) if 2.5<=t<3.05 else 1
    ga=giver.pose(action=gaction,phase=gphase,placement=gm,wrist_targets=targets_g,
      arm_actions={'left':{'action':'rest','phase':1}},frame_index=i)
    ra=recipient.pose(action=raction,phase=rphase,placement=rm,wrist_targets=targets_r,
      arm_actions={'right':{'action':'rest','phase':1}},frame_index=i)
    result=r.render_scene((1280,720),actors=[ga,ra],paper=paper,
      background=s['background'],frame_index=i,paper_art=s['paper_art'])
    return result
