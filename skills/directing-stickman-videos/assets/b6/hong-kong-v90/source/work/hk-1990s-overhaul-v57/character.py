"""V57 coherent V51 street actor, with code-painted expressions.

The head and shirt are the approved V51 cutouts. There is no manufactured
profile, head/body squeeze, or material dissolve. All arrays are float32,
premultiplied RGBA. A neutral head is the original decoded source exactly.
"""
from functools import lru_cache
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'work/hk-1990s-motion-v52/assets'
HEAD_SIZE = (208, 159)
BODY_SIZE = (153, 202)
# Anchors in the unscaled source images. Side 0 is the far/left sleeve.
SLEEVE_ANCHORS = ((34., 59.), (137., 59.))
HEAD_PIVOT = (132., 159.)
BODY_HIP = (78., 192.)
HEAD_TO_BODY = (59., 157.)  # body top left minus head top left
LEG_LENGTH = 80.
ARM_LENGTHS = (47., 48.)


@lru_cache(None)
def asset(name):
    """Return an original V52 cutout (cached; callers must not mutate it)."""
    ar = np.asarray(Image.open(SOURCE / (name + '.png')).convert('RGBA'),
                    np.float32) / 255.
    ar[:, :, :3] *= ar[:, :, 3:4]
    ar.setflags(write=False)
    return ar


def _skin_base(which='all'):
    """Remove facial ink locally, retaining source hair/edge/shading/alpha.

    Inpainting acts only inside small face polygons, never on the head
    silhouette or hair. Separate eyes-only mode preserves the exact painted
    brows and mouth for blinks/gaze changes.
    """
    src = asset('street-head')
    rgb = np.clip(src[:, :, :3] / np.maximum(src[:, :, 3:4], 1e-6), 0, 1)
    im = np.uint8(np.rint(rgb * 255))
    mask = Image.new('L', HEAD_SIZE)
    d = ImageDraw.Draw(mask)
    # These masks cover all old ink/shadow of the feature, not just a dark
    # threshold, which would leave a second ghost eyelid behind the new eye.
    d.polygon([(80,70),(123,61),(126,88),(111,99),(85,99),(76,93),(78,84)], fill=255)
    d.polygon([(128,64),(169,52),(173,78),(162,87),(139,85),(127,77)], fill=255)
    if which == 'all':
        d.polygon([(80,55),(115,51),(118,65),(80,72)], fill=255)
        d.polygon([(122,43),(141,35),(157,39),(163,49),(126,59)], fill=255)
        d.polygon([(94,115),(166,93),(174,99),(165,117),(144,130),
                   (119,134),(99,128),(93,122)], fill=255)
    ma = np.asarray(mask, np.uint8)
    # Normalized local paint fill samples only clean pastel skin. Blind
    # TELEA next to the swept fringe pulls dark hair into the cheek, so the
    # fill explicitly excludes hair/ink/background samples. Original source
    # remains exact outside these feature masks.
    valid=((ma==0)&(im[:,:,0]>185)&(im[:,:,1]>165)&(im[:,:,2]>160)&
           (src[:,:,3]>.95)).astype(np.float32)
    den=cv2.GaussianBlur(valid,(0,0),10)
    paint=cv2.GaussianBlur(rgb*valid[:,:,None],(0,0),10)/np.maximum(den[:,:,None],1e-6)
    paint=np.where((den>1e-5)[:,:,None],paint,np.array([.98,.89,.88]))
    coverage=ma.astype(np.float32)/255.
    fixed=rgb*(1-coverage[:,:,None])+paint*coverage[:,:,None]
    out = src.copy()
    out[:, :, :3] = fixed * out[:, :, 3:4]
    return out


@lru_cache(None)
def _clean(which):
    return _skin_base(which)


def _curve(points, steps=9):
    """Catmull-Rom sampled hand-authored stroke, not an ellipse primitive."""
    p = np.asarray(points, float)
    pp = np.concatenate([p[:1], p, p[-1:]])
    out = []
    for k in range(len(p)-1):
        a,b,c,d = pp[k:k+4]
        for t in np.linspace(0., 1., steps, endpoint=False):
            out.append(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+
                           (-a+3*b-3*c+d)*t*t*t))
    out.append(p[-1])
    return np.asarray(out)


def _mix(a, b, t):
    return np.asarray(a)*(1-t)+np.asarray(b)*t


def _render(emotion, blink, gaze):
    e, b, g = emotion, blink, gaze
    only_eyes = e == 0
    out = _clean('eyes' if only_eyes else 'all').copy()
    ss = 4
    overlay = Image.new('RGBA', (HEAD_SIZE[0]*ss, HEAD_SIZE[1]*ss))
    d = ImageDraw.Draw(overlay)
    ink = (72, 47, 49, 255)
    white = (255, 243, 237, 255)

    def path(p, width=3., fill=ink):
        q = _curve(p)
        # Pressure changes by a fraction of a pixel along a single path.
        for k in range(len(q)-1):
            w = width*(.91+.09*np.sin(k*.53+1.4))
            pts = [tuple(v*ss) for v in q[k:k+2]]
            d.line(pts, fill=fill, width=max(1,round(w*ss)))
        rr=width*.43*ss
        for x,y in [q[0],q[-1]]:
            x*=ss;y*=ss;d.ellipse((x-rr,y-rr,x+rr,y+rr), fill=fill)

    def poly(p, color):
        d.polygon([tuple(v*ss) for v in np.asarray(p)], fill=color)

    # The same 3/4 placement remains fixed through the reaction. Eye scale
    # and brow pose change, but the head silhouette/pigment never changes.
    for side in range(2):
        cx,cy = [(108.,79.),(156.,70.)][side]
        rx = 11.5 if side==0 else 9.5
        open_y = (5.8+7.1*e)*(1-b)+.35*b
        cx += 1.7*g
        upper=[(cx-rx,cy-1), (cx-5,cy-open_y), (cx+5,cy-open_y-.5), (cx+rx,cy-2)]
        lower=[(cx+rx,cy-2),(cx+7,cy+open_y*.8),(cx-3,cy+open_y),(cx-rx,cy-1)]
        if b < .88:
            shape=np.concatenate([_curve(upper),_curve(lower)])
            poly(shape,white)
            # Eccentric pupil, as in the original knowing meme expression.
            px=cx+3.5+1.6*g;py=cy+.1
            ry=max(.8,(4.9+.8*e)*(1-b))
            d.ellipse(((px-3.9)*ss,(py-ry)*ss,(px+3.9)*ss,(py+ry)*ss),fill=ink)
            path(lower,1.4)
        path(upper,3.1 if e<.5 else 2.5)

    if not only_eyes:
        # Raised, asymmetric brows; irregular sampled strokes stay within
        # the same painted forehead rather than redrawing the hair mass.
        left=_mix([(81,63),(94,60),(111,59)],[(83,53),(97,48),(112,50)],e)
        right=_mix([(126,51),(141,43),(153,45)],[(129,42),(143,35),(155,38)],e)
        path(left,3.9);path(right,3.9)
        # Smirk to startled O. A single continuous authored mouth contour
        # replaces the old feature; there is never a double mouth dissolve.
        neutral=[(100,120),(116,116),(134,110),(151,104),(164,99),
                 (153,115),(138,123),(119,125),(100,120)]
        startled=[(121,113),(123,105),(134,103),(142,107),(144,115),
                  (140,124),(131,128),(123,123),(121,113)]
        outline=_curve(_mix(neutral,startled,e))
        poly(outline,ink)
        if e < .7:
            teeth=_mix([(108,119),(133,112),(156,104),(149,113),(132,120),(115,122)],
                       [(126,111),(133,108),(139,111),(138,113),(131,114),(126,113)],e/.7)
            poly(teeth,white)
            if e<.35:
                path([(123,116),(125,122)],1.3)
                path([(141,110),(144,116)],1.3)
        elif e>.7:
            # A small uneven lower inner lip adds emotion without glossy
            # highlights or polished vector styling.
            path([(127,122),(132,123),(137,120)],1.2,(155,92,92,255))

    over=np.asarray(overlay.resize(HEAD_SIZE,Image.Resampling.LANCZOS),np.float32)/255.
    a=over[:,:,3:4]*out[:,:,3:4]
    out[:,:,:3]=over[:,:,:3]*a+out[:,:,:3]*(1-a)
    return out.astype(np.float32)


@lru_cache(512)
def _cached_head(e,b,g):
    return _render(e/40.,b/20.,g/20.)


def head(emotion=0, blink=0, gaze=0):
    """208x159 premultiplied RGBA; emotion 0=source, 1=surprise.

    blink: 0..1; gaze: -1..1. Returned arrays may be safely transformed by
    the caller. Keep the neutral source intact and return a fresh copy.
    """
    e=float(np.clip(emotion,0,1));b=float(np.clip(blink,0,1));g=float(np.clip(gaze,-1,1))
    if e==0 and b==0 and g==0:
        return asset('street-head').copy()
    return _cached_head(round(e*40),round(b*20),round(g*20)).copy()


def body():
    """The approved shirt/bag pigment, unchanged; no secondary endpoint."""
    return asset('street-body')
