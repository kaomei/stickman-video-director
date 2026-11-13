"""V88: four motivated ending views over unchanged V87 paint/limb rigs.

No image, video, or audio model calls. Only the 15-20s visual treatment changes.
"""
from pathlib import Path
import importlib.util, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W=Path(__file__).resolve().parent;ROOT=W.parents[1]
s=importlib.util.spec_from_file_location('v88_locked_v87',ROOT/'work/hk-v87-arm-readability/animate.py')
a=importlib.util.module_from_spec(s);s.loader.exec_module(a)
m=a.m;b=a.b;T,R,S,pt,keys,ease=a.T,a.R,a.S,a.pt,a.keys,a.ease
old_camera=m.booth_camera
BUN_START=497/30;EGO_START=536/30;ARCADE_START=562/30

def booth_camera(t):
    if t<15:return old_camera(t)
    if t<BUN_START:
        return 'refusal-medium',keys(t,[(15,1115,474,1.60),(15.30,1118,475,1.60),(BUN_START,1137,477,1.60)])
    if t<EGO_START:
        return 'cold-bun-insert',keys(t,[(BUN_START,842,620,2.18),(17.0,843,620,2.18),(EGO_START,850,620,2.18)])
    return 'ego-deadpan',keys(t,[(EGO_START,535,415,1.83),(ARCADE_START,544,416,1.83)])

def arcade_rematch(t):
    # Reuse the V87 control transfer / two presses at their native speed.
    # The established set is seen from a wider camera, not stretched.
    local=10.60+(t-ARCADE_START)
    v=keys(t,[(ARCADE_START,1075,435,1.08),(18.90,1076,435,1.08),(19.68,1118,435,1.08),(20,1124,435,1.08)])
    C=b.camera_matrix(v);F=C@T(-(v[0]-1100)*.10,0)
    c=np.full((720,1280,3),[.96,.82,.68],np.float32)
    back,cab,stick,cap=m.cabinet_rig();b.blit(c,back,C)
    J,button,press,wr,contact,prop=m.control_action(local)
    angle=float(keys(local,[(9,0),(10.3,-1.2),(11.6,-1.2),(11.96,-1.2),
        (12.18,2.),(12.36,2.),(12.60,-1),(12.89,-3.5),(13.13,-3.5),(13.7,-2)])[0])
    lean=float(keys(local,[(9,0),(9.75,-.6),(10.8,-1.4),(11.5,-1.4),
        (12.12,-1.4),(12.36,.7),(12.63,0),(13.7,0)])[0])
    B,L=m.actor(c,F,'flower',(1120,795),1.15,[(1085,660),wr],local,
        headangle=angle,emotion=0,lean=lean,standing=True)
    gesture=float(ease(10.56,10.75,local)*(1-ease(11.25,11.52,local)))
    fw=m.mix((882,662),(945,540),gesture)
    Q,QL=m.actor(c,F,'friend',(825,790),1.15,[(769,662),fw],local,
        headangle=-1.6*gesture,speak=10.6<=local<11.65,standing=True)
    b.blit(c,cab,F)
    src=np.float32([(0,0),(360,0),(360,268),(0,268)])
    dst=np.float32([(1383,281),(1597,258),(1570,428),(1364,407)])
    H=b.cv2.getPerspectiveTransform(src,dst);b.blit(c,m.game_screen(local),F@H)
    b.blit(c,stick,F@J@T(1276,417));b.blit(c,cap,F@T(1326,463+3.2*press))
    m.overlay_arm(c,F,'flower',B,L);m.overlay_arm(c,F,'friend',Q,QL)
    target=pt(J,(1298,439)) if prop=='joystick' else button
    m.LOG.update(time=t,source_time=local,shot='arcade-rematch-truck',location='arcade',camera=v.tolist(),
        contacts=m.ARMS.copy(),action=prop,game_over=False,
        prop_contact_error=float(np.linalg.norm(wr-target)) if contact else None,
        cabinet_parallax_world=-(v[0]-1100)*.10)
    return c

m.booth_camera=booth_camera

def draw(t):
    if t<ARCADE_START:return a.draw(t)
    m.ARMS.clear();m.LOG.clear();m.LOG.update(time=t)
    c=arcade_rematch(t)
    glow=b.cv2.GaussianBlur(np.maximum(c-.84,0),(0,0),4)*.045
    im=Image.fromarray(np.uint8(np.clip(c+glow,0,1)*255))
    return m.caption(im,t)

def preflight():
    ts=[14.9667,15.,15.4,16.5,BUN_START,17.1,17.8333,EGO_START,18.3,18.7,ARCADE_START,19.1,19.5,19.9667]
    board=Image.new('RGB',(1280,4*266),'#f4e9df');d=ImageDraw.Draw(board)
    f=ImageFont.truetype(str(ROOT/'fonts/Arial.ttf'),16);rows=[]
    for i,t in enumerate(ts):
        im=draw(t);x=i%4*320;y=i//4*266;board.paste(im.resize((320,180)),(x,y+25))
        d.text((x+5,y+3),f'{t:.3f}s / {m.LOG["shot"]}',font=f,fill='#302824');rows.append({'time':t,**m.LOG.copy()})
        if t in [15.4,17.1,18.3,19.5]:im.save(W/f'frame-{t:.2f}.png')
    board.save(W/'preflight.jpg',quality=97);(W/'preflight.json').write_text(json.dumps(rows,indent=2))
    print(json.dumps({'preflight':str(W/'preflight.jpg'),'frames':len(ts)}))
