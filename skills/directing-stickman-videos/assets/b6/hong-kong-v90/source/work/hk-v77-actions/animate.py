"""V76: V68 paint/rig, wide arcade memory, cafe booth and matched return.

Only the arcade still was generated (built-in imagegen). All motion, CRT,
contacts, camera, captions and cut timing are deterministic local code.
"""
from pathlib import Path
from functools import lru_cache
import importlib.util,json,math
import numpy as np
from PIL import Image,ImageDraw,ImageFont
W=Path(__file__).resolve().parent;ROOT=W.parents[1]
sp=importlib.util.spec_from_file_location('v76base',ROOT/'work/hk-v68-extension-v75/animate.py')
v75=importlib.util.module_from_spec(sp);sp.loader.exec_module(v75)
v68=v75.v68;b=v68.b;cv2=b.cv2
T,R,S,pt,ease,mix,keys=b.T,b.R,b.S,b.pt,b.ease,b.mix,b.keys
WIDTH,HEIGHT,FPS,DURATION=1280,720,30,20.
SOURCE_W=ROOT/'work/hk-v76-multiscene'
TL=json.loads((W/'timeline.json').read_text());LOG={};ARMS=[]
OLD=ROOT/'work/hk-empty-gun-preview-v71/assets'
FONT=str(ROOT/'fonts/ArialBlack.ttf')

@lru_cache(None)
def old(n):return b.rgba(Image.open(OLD/(n+'.png')))

@lru_cache(None)
def strong(n):
    im=Image.open(OLD/(n+'.png')).convert('RGBA')
    return b.rgba(im.crop((330,640,672,1109) if n=='strong-body' else (182,39,804,656)))

@lru_cache(None)
def arcade_layers():
    im=Image.open(SOURCE_W/'assets/arcade-wide.png').convert('RGB');rgb=np.asarray(im)
    h,w=rgb.shape[:2];assert w>=1900 and h>=800,(w,h)
    # Original painted cabinet becomes a rigid foreground layer. Inpaint is
    # only exposed in narrow parallax margins; its paint is unchanged.
    p=np.int32([(1223,488),(1277,449),(1317,257),(1310,238),(1328,160),
                (1626,74),(1722,109),(1747,180),(1747,725),(1711,754),
                (1548,784),(1256,700),(1249,553),(1225,535)])
    mask=np.zeros((h,w),np.uint8);cv2.fillPoly(mask,[p],255)
    clean=cv2.inpaint(rgb,cv2.dilate(mask,np.ones((13,13),np.uint8)),7,cv2.INPAINT_TELEA)
    a=mask.astype(np.float32)/255
    fore=np.dstack([rgb.astype(np.float32)/255*a[:,:,None],a])
    back=b.rgba(Image.fromarray(clean));return back,fore

def arm(c,actor,side,sh,wr,M):
    sh=np.asarray(sh,float);wr=np.asarray(wr,float)
    d=float(np.linalg.norm(wr-sh));assert d<169,(actor,side,d,wr.tolist())
    ch=b.arm_chain(sh,wr,far=bool(side==0))
    b.paint_arm(c,ch,M,side==0);b.hand(c,ch[2],M)
    ARMS.append({'actor':actor,'side':side,'local_reach':d,
                 'shoulder':pt(M,ch[0]).tolist(),'elbow':pt(M,ch[1]).tolist(),
                 'wrist':pt(M,ch[2]).tolist(),'target':pt(M,wr).tolist(),
                 'grip_error':float(np.linalg.norm(pt(M,ch[2])-pt(M,wr)))})

def feet(c,M,kind='flower'):
    for i in range(2):
        hip=(-1 if i==0 else 34,-90);ank=(-18 if i==0 else 42,-10.4)
        b.line(c,hip,ank,M,width=.24 if i==0 else .30,curve=.35)
        a=b.asset('street-shoe-a' if i==0 else 'street-shoe-b')
        if i==0:a=np.ascontiguousarray(a[:,::-1])
        h,w=a.shape[:2];b.blit(c,a,M@T(-18 if i==0 else 42,0)@T(-14.3,-15.6)@S(44.85/w,15.6/h))

def actor(c,C,kind,root,scale,wrists,t,emotion=0,headangle=0,mirror=False,pose='neutral',speak=False,standing=False,lean=0):
    M=C@T(*root)@S(-scale if mirror else scale,scale)
    B=M@T(15,-90)@R(lean)@T(-15,90)
    if standing:feet(c,M,kind)
    local=[pt(np.linalg.inv(B),pt(C,p)) for p in wrists]
    arm(c,kind,0,(-44,-221),local[0],B)
    if kind=='flower':
        b.blit(c,b.character.body(),B@T(-78,-280))
        blink=sum(float(ease(a,a+.045,t)*(1-ease(a+.10,a+.17,t))) for a in [7.60,13.25,15.54,19.16])
        h=b.character.head(emotion=emotion,blink=blink)
        H=B@T(-5,-278)@R(headangle)@T(5,278)@T(-137,-437)
        b.blit(c,h,H)
    else:
        b.blit(c,strong('strong-body'),B@T(-65,-280)@S(.40))
        n='strong-speak' if speak else ('strong-tight' if pose=='tight' else 'strong-head')
        if 17.30<t<17.43:n='strong-tight-blink' if pose=='tight' else 'strong-head-blink'
        H=B@T(-5,-278)@R(headangle)@T(5,278)@T(-104,-467)@S(.31)
        b.blit(c,strong(n),H)
    return B,local

def overlay_arm(c,C,kind,B,local):arm(c,kind,1,(59,-221),local[1],B)

def room(c,C,t):
    b.blit(c,old('room-clean'),C)
    read=float(ease(6.6,7.0,t)*(1-ease(8.1,8.5,t)))
    P=T(129,506)@T(0,-3*read)@R(-1.1*read)@T(-129,-506)
    b.blit(c,old('patron-paper'),C@P)
    sip=float(ease(14.1,14.8,t)*(1-ease(16.0,16.6,t)))
    Q=T(358,451)@T(-2*sip,-3*sip)@R(-3*sip)@T(-358,-451)
    b.blit(c,old('patron-cup'),C@Q)
    # Same small independent kitchen life as the accepted cafe standard.
    # This is a different source room from V64; retain its painted steam
    # instead of calling the kitchen-local raster routine in world space.

def booth_camera(t):
    if t<8.15:return 'cafe-table-reveal',keys(t,[(6.6,755,490,.98),(7.35,821,491,.98),(8.15,836,492,.98)])
    if t<9:return 'bun-match-out',keys(t,[(8.15,835,632,2.35),(9,839,632,2.35)])
    if t<16.65:return 'cafe-return-two-shot',keys(t,[(13.7,842,491,1.03),(14.0,861,486,1.03),(16.65,878,486,1.03)])
    if t<18.30:return 'friend-reaction',keys(t,[(16.65,535,415,1.82),(16.87,535,415,1.86),(17.10,536,416,1.83),(18.3,543,416,1.83)])
    return 'cafe-final-truck',keys(t,[(18.3,828,500,.98),(19.6,875,501,.98),(20,882,501,.98)])

def motion(t, points):
    return np.asarray(keys(t,[(a,*p) for a,p in points]),float)

def plate_action(t):
    # Nothing moves before hand contact. Quick drive, short braking settle.
    q=float(keys(t,[(6.6,0),(7.04,0),(7.40,1),(7.51,.982),(7.61,1),(20,1)])[0])
    plate=np.array([705+135*q,655.])
    home=np.array([640.,629.]);edge=plate+(-72,0)
    if t<7.04:
        wrist=motion(t,[(6.6,home),(6.78,(624,621)),(6.91,(630,639)),(7.04,edge)])
    elif t<=7.68:wrist=edge.copy()
    elif t<8.16:wrist=motion(t,[(7.68,edge),(7.82,(758,631)),(8.02,(670,617)),(8.16,home)])
    else:wrist=home.copy()
    if t>=18.65:
        # Last refusal: one restrained nudge, followed by a held pose.
        q=float(ease(18.76,19.02,t));plate[0]-=15*q
        if t<18.76:wrist=mix(home,plate+(-72,0),ease(18.65,18.76,t))
        elif t<=19.11:wrist=plate+(-72,0)
        else:wrist=motion(t,[(19.11,plate+(-72,0)),(19.28,(747,630)),(19.55,home)])
    return plate,wrist

def booth(t):
    name,v=booth_camera(t);C=b.camera_matrix(v)
    c=np.full((HEIGHT,WIDTH,3),[.96,.82,.68],np.float32);room(c,C,t)
    plate,push=plate_action(t)
    fangle=float(keys(t,[(6.6,-.8),(6.90,1.5),(7.14,1.5),(7.53,-1.2),(7.90,-.4),
        (13.7,-.4),(16.65,-.4),(16.82,2.8),(17.08,2.8),(17.34,.2),(18.3,.2),(18.78,-1.3),(19.3,.1),(20,.1)])[0])
    lean=float(keys(t,[(6.6,0),(6.9,-.6),(7.4,-1.65),(7.63,-1.4),(8.08,0),(20,0)])[0])
    B,L=actor(c,C,'friend',(555,815),1.15,[(510,635),push],t,headangle=fangle,lean=lean,
              pose='tight' if t>=16.65 else 'neutral',speak=7.07<=t<7.85 or 18.4<=t<19.1)
    # Refusal starts with the eyes/head, then a small open-hand beat and settle.
    refuse=float(ease(14.24,14.43,t)*(1-ease(15.49,15.81,t)))
    wr=motion(t,[(6.6,(1000,631)),(13.7,(1000,631)),(14.18,(1000,631)),
        (14.43,(972,601)),(14.65,(963,594)),(15.44,(963,594)),(15.81,(1000,631)),(20,(1000,631))])
    angle=float(keys(t,[(6.6,0),(7.16,0),(7.45,2.3),(7.77,2.3),(8.12,-.7),
        (13.7,-.7),(14.15,-.7),(14.34,-2.4),(15.43,-2.4),(15.81,-.7),(20,-.7)])[0])
    Q,QL=actor(c,C,'flower',(1073,806),1.15,[(1122,634),wr],t,
               emotion=.28 if t>=13.7 else 0,headangle=angle,mirror=True,lean=-.65*refuse)
    b.blit(c,old('table-front'),C)
    b.shadow(c,C,plate+(0,4),81,10,.12)
    a=old('plate');h,w=a.shape[:2];b.blit(c,a,C@T(*plate)@S(.44)@T(-w/2,-h/2))
    inertia=float(keys(t,[(6.6,0),(7.04,0),(7.24,-2),(7.4,-1),(7.51,1.5),(7.65,0),(20,0)])[0])
    bun=plate+(inertia,-23);a=old('bun-whole');h,w=a.shape[:2]
    b.blit(c,a,C@T(*bun)@R(inertia*.45)@S(.36)@T(-w/2,-h/2))
    overlay_arm(c,C,'friend',B,L);overlay_arm(c,C,'flower',Q,QL)
    F=C@T(-(v[0]-820)*.20,0);b.blit(c,old('near-counter'),F)
    contact=(7.04<=t<=7.68) or (18.76<=t<=19.11)
    LOG.update(shot=name,location='cafe-booth',camera=v.tolist(),bun=bun.tolist(),
               plate=plate.tolist(),bun_state='whole and untouched',contacts=ARMS.copy(),
               prop_contact_error=float(np.linalg.norm(push-(plate+(-72,0)))) if contact else None,
               action='plate-contact' if contact else 'reach-or-release')
    return c

def game_screen(t):
    im=Image.new('RGB',(360,268),(35,55,62));d=ImageDraw.Draw(im)
    d.rectangle((15,18,344,26),fill=(84,137,121))
    d.rectangle((19,20,150,24),fill=(215,173,88));d.rectangle((218,20,255 if t<11.9 else 223,24),fill=(208,98,84))
    # Simple original pixel fighters, moving only within the CRT surface.
    for j,x in enumerate([100+10*math.sin(t*4),253-15*math.sin(t*3)]):
        x=round(x);y=174-8*abs(math.sin(t*5+j));col=(205,155,82) if j==0 else (118,159,164)
        d.rectangle((x-10,y-55,x+10,y-35),fill=col);d.rectangle((x-16,y-34,x+16,y+6),fill=col)
        d.rectangle((x-19,y+8,x-4,y+32),fill=col);d.rectangle((x+5,y+8,x+20,y+32),fill=col)
        attack=max(float(ease(a,a+.05,t)*(1-ease(a+.12,a+.21,t))) for a in [10.83,11.13]) if j==0 else 0
        d.rectangle((x+11,y-24,x+30+round(35*attack),y-14),fill=col)
    d.line((12,221,347,221),fill=(90,116,109),width=3)
    if t>=11.9:
        d.rectangle((24,68,338,153),fill=(35,48,55))
        f=ImageFont.truetype(FONT,30);d.text((180,110),'GAME OVER',font=f,fill=(245,212,128),anchor='mm')
    for y in range(2,268,4):d.line((0,y,359,y),fill=(31,46,51),width=1)
    return b.rgba(im)

@lru_cache(None)
def cabinet_rig():
    back,cab=arcade_layers();cab=cab.copy()
    # Lift the original painted stick and yellow cap out of their own image.
    # Only the exposed paint under those props is repaired; no vector redraw.
    rgb=np.uint8(np.clip(cab[:,:,:3],0,1)*255)
    mask=np.zeros(rgb.shape[:2],np.uint8)
    poly=np.int32([(1291,421),(1304,421),(1314,429),(1315,442),(1308,451),
                   (1303,452),(1304,473),(1295,473),(1293,452),(1284,449),(1280,441),(1282,429)])
    cv2.fillPoly(mask,[poly],255)
    capmask=np.zeros_like(mask);cv2.ellipse(capmask,(1341,477),(12,10),-10,0,360,255,-1)
    combined=cv2.bitwise_or(mask,capmask)
    repaired=cv2.inpaint(rgb,cv2.dilate(combined,np.ones((3,3),np.uint8)),3,cv2.INPAINT_TELEA)
    sel=combined>0;cab[sel,:3]=repaired[sel].astype(np.float32)/255
    def cut(m,box):
        x0,y0,x1,y1=box;alpha=m[y0:y1,x0:x1].astype(np.float32)/255
        alpha=cv2.GaussianBlur(alpha,(3,3),.45)
        return np.dstack([rgb[y0:y1,x0:x1].astype(np.float32)/255*alpha[:,:,None],alpha])
    return back,cab,cut(mask,(1276,417,1319,478)),cut(capmask,(1326,463,1357,491))

def control_action(t):
    angle=float(keys(t,[(9,0),(9.65,0),(9.84,-12),(10.04,-12),(10.15,9),
        (10.30,9),(10.43,-7),(10.55,0),(20,0)])[0])
    J=T(1299,472)@R(angle)@T(-1299,-472)
    knob=pt(J,(1298,439))
    press=max(float(ease(a,a+.045,t)*(1-ease(a+.10,a+.17,t))) for a in [10.83,11.13])
    button=np.array([1341.,474.+3.2*press])
    if t<=10.55:wrist=knob.copy();contact=True;prop='joystick'
    elif t<10.80:
        wrist=motion(t,[(10.55,knob),(10.66,(1321,424)),(10.80,(1341,474))]);contact=False;prop='reach-button'
    elif t<11.41:wrist=button.copy();contact=True;prop='button'
    elif t<11.65:
        wrist=motion(t,[(11.41,button),(11.52,(1320,451)),(11.65,(1303,491))]);contact=False;prop='release'
    elif t<12.22:wrist=np.array([1303.,491.]);contact=False;prop='freeze'
    else:wrist=motion(t,[(12.22,(1303,491)),(12.40,(1240,558)),(12.55,(1228,555)),(20,(1228,555))]);contact=False;prop='drop'
    return J,button,press,wrist,contact,prop

def arcade(t):
    if t<10.5:name='arcade-space-reveal';v=keys(t,[(9,805,423,.95),(9.4,860,423,.95),(10.3,1115,423,.95),(10.5,1120,423,.95)])
    elif t<11.9:name='arcade-controls';v=keys(t,[(10.5,1125,458,1.55),(11.9,1150,457,1.55)])
    elif t<12.8:name='arcade-game-over';v=keys(t,[(11.9,1457,345,2.8),(12.8,1456,346,2.8)])
    else:name='arcade-player-reaction';v=keys(t,[(12.8,1090,416,1.58),(13.03,1083,417,1.58),(13.7,1071,417,1.58)])
    C=b.camera_matrix(v);F=C@T(-(v[0]-1100)*.10,0)
    c=np.full((HEIGHT,WIDTH,3),[.96,.82,.68],np.float32)
    back,cab,stick,cap=cabinet_rig();b.blit(c,back,C)
    J,button,press,wr,contact,prop=control_action(t)
    react=float(ease(12.12,12.34,t))
    angle=float(keys(t,[(9,0),(10.3,-1.2),(11.6,-1.2),(11.96,-1.2),(12.18,2.0),
        (12.36,2.0),(12.60,-1),(12.89,-3.5),(13.13,-3.5),(13.7,-2)])[0])
    lean=float(keys(t,[(9,0),(9.75,-.6),(10.8,-1.4),(11.5,-1.4),(12.12,-1.4),(12.36,.7),(12.63,0),(13.7,0)])[0])
    B,L=actor(c,F,'flower',(1120,795),1.15,[(1085,660),wr],t,
               headangle=angle,emotion=.72 if react>.4 else 0,lean=lean,standing=True)
    gesture=float(ease(10.56,10.75,t)*(1-ease(11.25,11.52,t)))
    fw=mix((882,662),(945,540),gesture)
    Q,QL=actor(c,F,'friend',(825,790),1.15,[(769,662),fw],t,
                headangle=-1.6*gesture,speak=10.6<=t<11.65,standing=True)
    b.blit(c,cab,F)
    src=np.float32([(0,0),(360,0),(360,268),(0,268)])
    dst=np.float32([(1383,281),(1597,258),(1570,428),(1364,407)])
    H=cv2.getPerspectiveTransform(src,dst);b.blit(c,game_screen(t),F@H)
    b.blit(c,stick,F@J@T(1276,417))
    b.blit(c,cap,F@T(1326,463+3.2*press))
    overlay_arm(c,F,'flower',B,L);overlay_arm(c,F,'friend',Q,QL)
    target=pt(J,(1298,439)) if prop=='joystick' else button
    LOG.update(shot=name,location='arcade-memory',camera=v.tolist(),contacts=ARMS.copy(),
        cabinet_parallax_world=-(v[0]-1100)*.10,game_over=t>=11.9,action=prop,
        prop_contact_error=float(np.linalg.norm(wr-target)) if contact else None,
        control_angle=float(math.degrees(math.atan2(J[1,0],J[0,0]))),button_press=press)
    return c

def caption(im,t):
    d=ImageDraw.Draw(im);font=ImageFont.truetype(FONT,47)
    for start,end,txt in TL['captions']:
        if start<=t<end:
            # One stable size, semantic clauses, short fast changes without
            # random character popping or resizing the phrase.
            d.text((640,638),txt,font=font,anchor='mm',fill='#fffdf8',stroke_width=5,stroke_fill='#251e23')
    if 9<=t<10.5:
        f=ImageFont.truetype(FONT,25)
        d.rounded_rectangle((35,35,267,79),radius=5,fill='#352f32')
        d.text((151,57),'YEARS EARLIER',font=f,anchor='mm',fill='#ffe4ac')
    return im

def draw(t):
    ARMS.clear();LOG.clear();LOG.update(time=t,uniform_character_scale=True)
    if t<2.4:
        s=t*.75;im=v68.draw(s);LOG.update(shot='Hong-Kong-street',location='street',source_t=s)
    elif t<6.6:
        s=t-.6;im=v68.draw(s);LOG.update(shot='V68-counter-contact',location='cafe-counter',source_t=s)
    else:
        c=booth(t) if t<9 or t>=13.7 else arcade(t)
        glow=cv2.GaussianBlur(np.maximum(c-.84,0),(0,0),4)*.045
        im=Image.fromarray(np.uint8(np.clip(c+glow,0,1)*255))
    return caption(im,t)

def preflight():
    ts=[.1,1.2,2.8,4.2,5.8,6.8,7.6,8.7,9.1,10.2,10.8,11.5,12.3,13.6,14.2,15.7,17.2,19.4]
    board=Image.new('RGB',(1280,6*267),'#ece2d9');d=ImageDraw.Draw(board);rows=[]
    for j,t in enumerate(ts):
        im=draw(t);rows.append(LOG.copy());x=j%3*426;y=j//3*267
        board.paste(im.resize((426,240)),(x,y+27));d.text((x+8,y+7),f'{t:.2f}s {LOG["shot"]}',fill='#32272a')
    board.save(W/'preflight.jpg',quality=95)
    (W/'preflight.json').write_text(json.dumps(rows,indent=2))
    print(json.dumps({'preflight':str(W/'preflight.jpg'),'max_reach':max(a['local_reach'] for r in rows for a in r.get('contacts',[]))}))
