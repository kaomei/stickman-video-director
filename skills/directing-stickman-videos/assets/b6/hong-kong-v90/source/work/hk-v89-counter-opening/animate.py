"""V89: owner sleeve pins and compositing, over the unchanged V88 production.

Preserve original paint, head performance, camera, props, captions and audio.
The owner alone receives a hem-attached arm silhouette and correct layer order.
"""
from pathlib import Path
import importlib.util, json
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W=Path(__file__).resolve().parent; ROOT=W.parents[1]
s=importlib.util.spec_from_file_location('v89_locked_v88',ROOT/'work/hk-v88-ending-camera/animate.py')
a=importlib.util.module_from_spec(s);s.loader.exec_module(a)
m=a.m; b=a.b; v60=m.v75.v60; v59=m.v75.v59
T,R,pt,keys=a.T,a.R,a.pt,a.keys
GEOMETRY=[]

class OwnerChain(tuple):
    """Tag only the owner's chain at the inherited foreground-arm pass."""

old_foreground_arm=v59.paint_arm
def foreground_arm(c,chain,C,far=False):
    if isinstance(chain,OwnerChain):
        # The upper arm is already underneath the intact painted sleeve.
        # Only the reaching forearm crosses the counter's top plane.
        b.paint_arm(c,chain[1:],C,far)
    else:
        old_foreground_arm(c,chain,C,far)

def owner(c,C,t,paper_grip):
    lean=float(keys(t,[(1.2,0),(2.26,0),(2.42,.65),(2.85,-2.),
                       (3.34,-2.),(3.68,-.3),(4.35,-.3),(7,-.3)])[0])
    B=C@T(1351,816)@T(0,-200)@R(lean)@T(0,200)
    chains=[]
    # Pins sit on the actual outer sleeve hems, not inside the apron.
    for side,sh in enumerate([(-46.,-302.),(96.,-307.)]):
        sh=np.asarray(sh)
        target=paper_grip if side==0 else pt(C,(1482.,570.))
        wr=pt(np.linalg.inv(B),target);d=wr-sh;dist=np.linalg.norm(d)
        normal=np.array([-d[1],d[0]])/max(.01,dist)
        # Left elbow bends away from the apron to the left; right to the right.
        offset=min(9.,dist*.14)
        el=sh+.52*d+normal*offset*(1 if side==0 else -1)
        chain=OwnerChain((sh,el,wr));chains.append(chain)
        GEOMETRY.append({'kind':'owner','side':side,'time':t,
            'shoulder':pt(B,sh).tolist(),'elbow':pt(B,el).tolist(),
            'wrist':pt(B,wr).tolist(),'local_chain':[p.tolist() for p in chain],
            'grip_error':float(np.linalg.norm(pt(B,wr)-target)),
            'elbow_outward':bool(el[0]<sh[0] if side==0 else el[0]>sh[0])})
    # Natural sleeve coverage: roots below cloth, then face and sleeve paint.
    b.paint_arm(c,chains[0][:2],B)
    b.paint_arm(c,chains[1],B,True)
    v60.owner_hand(c,chains[1][2],B)
    x,y=v60.BODY_ORIGIN
    b.blit(c,v60.garment(),B@T(x-1351,y-816))
    angle=float(keys(t,[(1.2,0),(2.24,0),(2.48,-2.6),(3.18,-1.2),(3.7,.5),(7,.5)])[0])
    b.put(c,'owner-head',(0,-438),B,angle=angle)
    return B,chains

v59.owner=owner;v60.owner=owner
v59.paint_arm=foreground_arm

def draw(t):
    GEOMETRY.clear()
    # V88's visible cut is frame 72. Avoid a floating-point subtraction
    # selecting the preceding street pose at exactly 2.4 - 0.6 seconds.
    if 72/30<=t<73/30:t=float(np.nextafter(t,np.inf))
    return a.draw(t)

def preflight():
    ts=[2.4,2.5,2.9,3.3,3.66,3.9,4.1,4.3,4.6,4.9,5.3,6.2]
    board=Image.new('RGB',(1280,3*212),'#f4e9df');d=ImageDraw.Draw(board)
    f=ImageFont.truetype(str(ROOT/'fonts/Arial.ttf'),17);rows=[]
    for i,t in enumerate(ts):
        im=draw(t);x=i%4*320;y=i//4*212
        board.paste(im.resize((320,180)),(x,y+28))
        d.text((x+6,y+4),f'V89 {t:.2f}s',font=f,fill='#302824')
        rows.append({'time':t,'owner':GEOMETRY.copy()})
        if t in [2.5,3.3,3.9,4.3]:im.save(W/f'after-{t:.2f}.png')
    board.save(W/'preflight.jpg',quality=97)
    (W/'preflight.json').write_text(json.dumps(rows,indent=2))
    print(json.dumps({'preflight':str(W/'preflight.jpg'),'owner_poses':sum(len(r['owner']) for r in rows)}))
