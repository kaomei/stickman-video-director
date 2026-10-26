"""
StickVerse drawing kit.

Small, dependency-light helpers (Pillow only) used to generate the brand pack:
logo, channel art, watermark, end screen, thumbnails and Shorts covers.

Everything is drawn at 2x and downsampled, so edges stay clean.

Run the generators:
    python tools/make_brand_assets.py
    python tools/make_thumbnails.py

Requires: pillow
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / "brand" / "fonts"

ANTON = FONT_DIR / "Anton-Regular.ttf"
BEBAS = FONT_DIR / "BebasNeue-Regular.ttf"
ARCHIVO = FONT_DIR / "ArchivoBlack-Regular.ttf"
NOTO = FONT_DIR / "NotoSans.ttf"
CAVEAT = FONT_DIR / "Caveat.ttf"

# ---------------------------------------------------------------- palette
INK = (10, 10, 14)          # near-black background
INK_2 = (18, 18, 25)
WHITE = (255, 255, 255)
BONE = (246, 241, 228)      # warm paper
RED = (255, 45, 45)         # the "danger / hook" accent
GOLD = (255, 196, 61)       # highlight accent
CYAN = (64, 224, 255)       # tech accent
GREEN = (60, 220, 140)
GREY = (150, 152, 165)

SS = 2  # supersample factor


# ---------------------------------------------------------------- basics
def canvas(w: int, h: int, color=(0, 0, 0, 0), ss: int = SS) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGBA", (w * ss, h * ss), color)
    return img, ImageDraw.Draw(img)


def finish(img: Image.Image, w: int, h: int, ss: int = SS) -> Image.Image:
    return img.resize((w, h), Image.LANCZOS)


def _rgba(color, alpha=None):
    if len(color) == 4:
        return color
    if alpha is None:
        return (*color, 255)
    return (*color, alpha)


def font(path: Path | str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), int(size))


def measure(draw, text, fnt, tracking: int = 0) -> tuple[float, float]:
    if not text:
        return 0.0, 0.0
    if tracking == 0:
        l, t, r, b = draw.textbbox((0, 0), text, font=fnt)
        return r - l, b - t
    w = 0.0
    h = 0.0
    for ch in text:
        l, t, r, b = draw.textbbox((0, 0), ch, font=fnt)
        w += (r - l) + tracking
        h = max(h, b - t)
    return w - tracking, h


def text(draw, xy, s, fnt, fill, anchor="la", tracking: int = 0, stroke=0,
         stroke_fill=None, alpha=255):
    fill = _rgba(fill, alpha)
    if stroke and stroke_fill:
        stroke_fill = _rgba(stroke_fill, alpha)
    if tracking == 0:
        draw.text(xy, s, font=fnt, fill=fill, anchor=anchor,
                  stroke_width=stroke, stroke_fill=stroke_fill)
        return
    # manual tracking (Pillow has no letter-spacing)
    total_w, _ = measure(draw, s, fnt, tracking)
    x, y = xy
    if anchor[0] == "m":
        x -= total_w / 2
    elif anchor[0] == "r":
        x -= total_w
    for ch in s:
        draw.text((x, y), ch, font=fnt, fill=fill, anchor="l" + anchor[1],
                  stroke_width=stroke, stroke_fill=stroke_fill)
        l, t, r, b = draw.textbbox((0, 0), ch, font=fnt)
        x += (r - l) + tracking


def text_shadow(base: Image.Image, xy, s, fnt, fill, *, anchor="la", tracking=0,
                shadow=(0, 0, 0, 190), offset=(8, 10), blur=14, stroke=0,
                stroke_fill=None, alpha=255):
    """Draw text with a soft drop shadow on an RGBA image."""
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    text(d, (xy[0] + offset[0], xy[1] + offset[1]), s, fnt, shadow, anchor=anchor,
         tracking=tracking, stroke=stroke, stroke_fill=shadow)
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(layer)

    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    text(d, xy, s, fnt, fill, anchor=anchor, tracking=tracking, stroke=stroke,
         stroke_fill=stroke_fill, alpha=alpha)
    base.alpha_composite(layer)


# ---------------------------------------------------------------- gradients
def radial_glow(img: Image.Image, center, radius, color, alpha=255, blend="screen"):
    """Soft radial light. Works on RGBA images."""
    w, h = img.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    steps = 40
    for i in range(steps, 0, -1):
        t = i / steps
        r = radius * t
        a = int(alpha * (1 - t) ** 2.0)
        d.ellipse([center[0] - r, center[1] - r, center[0] + r, center[1] + r],
                  fill=(*color, a))
    layer = layer.filter(ImageFilter.GaussianBlur(radius * 0.06))
    if blend == "screen":
        img.alpha_composite(layer)
    else:
        img.alpha_composite(layer)
    return img


def vignette(img: Image.Image, strength=170, color=(0, 0, 0)) -> Image.Image:
    """Darken the edges with a smooth radial falloff."""
    w, h = img.size
    mask = Image.radial_gradient("L").resize((w, h), Image.BICUBIC)
    mask = mask.point(lambda v: int((v / 255) ** 1.7 * strength))
    shade = Image.new("RGBA", (w, h), (*color, 255))
    shade.putalpha(mask)
    img.alpha_composite(shade)
    return img


def paper_texture(size, base=BONE, seed=7, dots=9000, grain=7):
    """Warm paper card with subtle specks + soft fibre lines."""
    rnd = random.Random(seed)
    w, h = size
    img = Image.new("RGBA", (w, h), (*base, 255))
    d = ImageDraw.Draw(img)
    for _ in range(dots):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h)
        v = rnd.randint(-14, 6)
        c = (max(0, min(255, base[0] + v)), max(0, min(255, base[1] + v)),
             max(0, min(255, base[2] + v)), rnd.randint(16, 46))
        r = rnd.uniform(0.5, 2.2)
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)
    for _ in range(70):
        x = rnd.uniform(0, w)
        y0 = rnd.uniform(0, h)
        d.line([(x, y0), (x + rnd.uniform(-30, 30), y0 + rnd.uniform(60, 260))],
               fill=(120, 100, 80, rnd.randint(4, 10)), width=1)
    noise = Image.effect_noise((w, h), grain).convert("L").point(lambda v: int(v * 0.16))
    img = Image.composite(Image.new("RGBA", (w, h), (255, 255, 255, 255)), img,
                          noise.point(lambda v: 255 - v))
    return img


def stripes(size, color, spacing=64, width=14, angle=-32, alpha=26):
    w, h = size
    layer = Image.new("RGBA", (w * 2, h * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    diag = math.hypot(w * 2, h * 2)
    steps = int(diag // spacing) + 2
    for i in range(-steps, steps):
        x = i * spacing
        d.line([(x, -h), (x + diag * math.tan(math.radians(angle)), h * 2)],
               fill=(*color, alpha), width=width)
    layer = layer.rotate(0, resample=Image.BICUBIC)
    layer = layer.resize((w, h), Image.LANCZOS)
    return layer


def noise_overlay(img: Image.Image, amount=10, seed=3):
    w, h = img.size
    noise = Image.effect_noise((w, h), amount).convert("L")
    grey = Image.new("RGBA", (w, h), (128, 128, 128, 255))
    grey.putalpha(noise.point(lambda v: int(abs(v - 128) * 0.35)))
    img.alpha_composite(grey)
    return img


# ---------------------------------------------------------------- stick figure
# Poses are given in "figure units": x = 0 is the body centre line, y = 0 is the
# top of the head and y = 1 the soles of the feet. All poses are 4 limbs.
POSES = {
    # right hand at the temple, elbow out, left arm hanging. "think / brain" hooks
    "think": {
        "head": (0.00, 0.115),
        "neck": (0.00, 0.245),
        "hip": (0.00, 0.560),
        "shoulder_l": (-0.075, 0.270), "elbow_l": (-0.190, 0.400), "hand_l": (-0.155, 0.530),
        "shoulder_r": (0.075, 0.270), "elbow_r": (0.255, 0.330), "hand_r": (0.100, 0.150),
        "knee_l": (-0.120, 0.760), "foot_l": (-0.155, 0.985),
        "knee_r": (0.135, 0.755), "foot_r": (0.195, 0.985),
    },
    # both palms forward, leaning into something heavy
    "push": {
        "head": (0.02, 0.115),
        "neck": (0.04, 0.250),
        "hip": (-0.140, 0.560),
        "shoulder_l": (0.02, 0.280), "elbow_l": (0.190, 0.300), "hand_l": (0.345, 0.318),
        "shoulder_r": (0.11, 0.290), "elbow_r": (0.265, 0.345), "hand_r": (0.392, 0.372),
        "knee_l": (-0.275, 0.790), "foot_l": (-0.335, 0.985),
        "knee_r": (-0.215, 0.740), "foot_r": (0.010, 0.955),
    },
    # one arm straight up (pointing / lightbulb moment)
    "point_up": {
        "head": (0.00, 0.115),
        "neck": (0.00, 0.245),
        "hip": (0.00, 0.560),
        "shoulder_l": (-0.075, 0.270), "elbow_l": (-0.215, 0.390), "hand_l": (-0.250, 0.520),
        "shoulder_r": (0.075, 0.270), "elbow_r": (0.205, 0.160), "hand_r": (0.150, 0.020),
        "knee_l": (-0.120, 0.760), "foot_l": (-0.160, 0.985),
        "knee_r": (0.140, 0.760), "foot_r": (0.190, 0.985),
    },
    # standing, arms slightly away from body, palms open to viewer
    "open": {
        "head": (0.00, 0.115),
        "neck": (0.00, 0.245),
        "hip": (0.00, 0.560),
        "shoulder_l": (-0.075, 0.270), "elbow_l": (-0.235, 0.355), "hand_l": (-0.315, 0.445),
        "shoulder_r": (0.075, 0.270), "elbow_r": (0.240, 0.350), "hand_r": (0.330, 0.440),
        "knee_l": (-0.130, 0.760), "foot_l": (-0.185, 0.985),
        "knee_r": (0.135, 0.760), "foot_r": (0.195, 0.985),
    },
    # seated on a ledge / bed edge, legs dangling, one arm propping up the head
    "sit": {
        "head": (0.02, 0.105),
        "neck": (0.02, 0.235),
        "hip": (-0.020, 0.470),
        "shoulder_l": (-0.055, 0.260), "elbow_l": (-0.190, 0.380), "hand_l": (-0.120, 0.480),
        "shoulder_r": (0.100, 0.255), "elbow_r": (0.215, 0.235), "hand_r": (0.085, 0.145),
        "knee_l": (-0.020, 0.720), "foot_l": (0.020, 0.930),
        "knee_r": (0.150, 0.705), "foot_r": (0.190, 0.925),
    },
    # arms crossed, chin up. Good for "you vs the problem"
    "crossed": {
        "head": (-0.01, 0.115),
        "neck": (-0.01, 0.245),
        "hip": (-0.01, 0.560),
        "shoulder_l": (-0.085, 0.270), "elbow_l": (-0.245, 0.365), "hand_l": (0.085, 0.395),
        "shoulder_r": (0.070, 0.270), "elbow_r": (0.240, 0.350), "hand_r": (-0.075, 0.415),
        "knee_l": (-0.125, 0.760), "foot_l": (-0.175, 0.985),
        "knee_r": (0.130, 0.760), "foot_r": (0.180, 0.985),
    },
}


def _pt(origin, height, p):
    return (origin[0] + p[0] * height, origin[1] + p[1] * height)


def _stroke(draw, pts, width, fill):
    fill = _rgba(fill)
    draw.line(pts, fill=fill, width=int(round(width)), joint="curve")
    r = width / 2
    for p in (pts[0], pts[-1]):
        draw.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=fill)
    # rounded joint caps at every vertex
    for p in pts[1:-1]:
        draw.ellipse([p[0] - r, p[0] * 0 - r + p[1], p[0] + r, p[1] + r], fill=fill)


def draw_stickman(img, origin, height, pose="open", color=WHITE, stroke=None,
                  head_fill=None, jitter=0.0, seed=1, alpha=255, band=None):
    """Draw a clean stick figure. origin = (x, y) of the top of the head.

    head_fill: None keeps the classic hollow head; pass a colour for a filled head.
    jitter: small random offsets to fake a hand-drawn line (B1 style).
    band: accent colour for the signature wristband on the left arm (brand device).
    """
    ss = 1  # pose coordinates are already in output pixel space
    p = POSES[pose]
    rnd = random.Random(seed)

    def j(pt):
        if not jitter:
            return pt
        return (pt[0] + rnd.uniform(-jitter, jitter) * height,
                pt[1] + rnd.uniform(-jitter, jitter) * height)

    def P(name):
        return j(_pt(origin, height, p[name]))

    stroke = stroke if stroke is not None else max(3, height * 0.026)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    col = _rgba(color, alpha)

    for arm in ("l", "r"):
        _stroke(d, [P(f"shoulder_{arm}"), P(f"elbow_{arm}"), P(f"hand_{arm}")], stroke, col)
    for leg in ("l", "r"):
        _stroke(d, [P("hip"), P(f"knee_{leg}"), P(f"foot_{leg}")], stroke, col)
    _stroke(d, [P("neck"), P("hip")], stroke, col)

    hx, hy = P("head")
    hr = 0.115 * height
    if head_fill:
        d.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=_rgba(head_fill, alpha))
    d.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], outline=col,
              width=int(round(stroke)))

    # palms: small dots read better than bare line ends at thumbnail size
    for arm in ("l", "r"):
        hxp, hyp = P(f"hand_{arm}")
        pr = stroke * 0.62
        d.ellipse([hxp - pr, hyp - pr, hxp + pr, hyp + pr], fill=col)

    img.alpha_composite(layer)

    # signature: a short accent band on the left wrist
    if band is not None:
        ex, ey = P("elbow_l")
        hx2, hy2 = P("hand_l")
        t0, t1 = 0.70, 0.86
        p0 = (ex + (hx2 - ex) * t0, ey + (hy2 - ey) * t0)
        p1 = (ex + (hx2 - ex) * t1, ey + (hy2 - ey) * t1)
        bl = Image.new("RGBA", img.size, (0, 0, 0, 0))
        bd = ImageDraw.Draw(bl)
        bd.line([p0, p1], fill=_rgba(band, alpha), width=int(round(stroke * 1.55)))
        r = stroke * 0.78
        for pp in (p0, p1):
            bd.ellipse([pp[0] - r, pp[1] - r, pp[0] + r, pp[1] + r], fill=_rgba(band, alpha))
        img.alpha_composite(bl)

    return {k: P(k) for k in p}


def glow_shape(img, draw_fn, blur=26, color=GOLD, alpha=170, passes=2):
    """Draw something on a layer, blur it, and screen it under a crisp copy."""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(layer))
    for _ in range(passes):
        b = layer.filter(ImageFilter.GaussianBlur(blur))
        img.alpha_composite(b)
    return layer


def bulb(img, center, radius, color=GOLD, core=(255, 245, 200), stroke=0):
    """Glowing idea bulb: soft halo + glass bulb + base + rays."""
    def halo(d):
        d.ellipse([center[0] - radius * 2.1, center[1] - radius * 2.1,
                   center[0] + radius * 2.1, center[1] + radius * 2.1],
                  fill=(*color, 80))

    glow_shape(img, halo, blur=radius * 0.5, color=color, alpha=110)

    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = center
    r = radius
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, 255))
    d.ellipse([cx - r * 0.55, cy - r * 0.6, cx + r * 0.25, cy + r * 0.15],
              fill=(*core, 190))
    d.rounded_rectangle([cx - r * 0.36, cy + r * 0.86, cx + r * 0.36, cy + r * 1.20],
                        radius=r * 0.12, fill=(225, 225, 230, 255))
    for i in range(3):
        d.line([(cx - r * 0.3, cy + r * (1.30 + i * 0.16)),
                (cx + r * 0.3, cy + r * (1.30 + i * 0.16))],
               fill=(235, 235, 240, 235), width=max(3, int(r * 0.09)))
    img.alpha_composite(layer)
    # rays
    rays = Image.new("RGBA", img.size, (0, 0, 0, 0))
    rd = ImageDraw.Draw(rays)
    for ang in range(0, 360, 45):
        a = math.radians(ang)
        r0, r1 = r * 1.45, r * 2.0
        rd.line([(cx + math.cos(a) * r0, cy + math.sin(a) * r0),
                 (cx + math.cos(a) * r1, cy + math.sin(a) * r1)],
                fill=(*color, 150), width=max(3, int(r * 0.11)))
    rays = rays.filter(ImageFilter.GaussianBlur(r * 0.05))
    img.alpha_composite(rays)


# ---------------------------------------------------------------- brand mark
def brand_mark(img, center, size, color=WHITE, accent=RED, ring=True, alpha=255):
    """StickVerse mark: stick figure inside a ring with an accent orbital arc."""
    cx, cy = center
    s = size
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    col = _rgba(color, alpha)
    acc = _rgba(accent, alpha)
    r = s * 0.46
    lw = max(2, int(s * 0.036))

    if ring:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=lw)
        # accent arc sweeping the top-right, plus a moon dot where it ends
        d.arc([cx - r, cy - r, cx + r, cy + r], start=-64, end=32, fill=acc, width=lw)
        a = math.radians(-64)
        mx, my = cx + math.cos(a) * r, cy + math.sin(a) * r
        mr = max(3, s * 0.045)
        d.ellipse([mx - mr, my - mr, mx + mr, my + mr], fill=acc)

    img.alpha_composite(layer)

    # figure inside the circle
    h = s * 0.50
    origin = (cx, cy - h * 0.47)
    draw_stickman(img, origin, h, pose="open", color=color,
                  stroke=max(3, s * 0.034), alpha=alpha)
    return img


# ---------------------------------------------------------------- helpers used by thumbnails
def badge(draw, xy, label, fnt, fill=RED, fg=WHITE, pad=(26, 14), radius=10, tracking=2):
    w, h = measure(draw, label, fnt, tracking)
    x, y = xy
    draw.rounded_rectangle([x, y, x + w + pad[0] * 2, y + h + pad[1] * 2],
                           radius=radius, fill=_rgba(fill))
    text(draw, (x + pad[0], y + pad[1] - h * 0.06), label, fnt, fg, tracking=tracking)


def arrow(draw, start, end, color=RED, width=10, head=34):
    ang = math.atan2(end[1] - start[1], end[0] - start[0])
    draw.line([start, end], fill=_rgba(color), width=width)
    for s in (-1, 1):
        a = ang + s * math.radians(150)
        draw.line([end, (end[0] + math.cos(a) * head, end[1] + math.sin(a) * head)],
                  fill=_rgba(color), width=width)
    r = width / 2
    draw.ellipse([start[0] - r, start[1] - r, start[0] + r, start[1] + r], fill=_rgba(color))


def save_png(img: Image.Image, path: Path, w=None, h=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    out = img
    if w and h:
        out = out.resize((w, h), Image.LANCZOS)
    out.save(path, optimize=True)
    print(f"  wrote {path.relative_to(ROOT)}  ({out.width}x{out.height})")


def save_jpg(img: Image.Image, path: Path, quality=90):
    path.parent.mkdir(parents=True, exist_ok=True)
    rgb = Image.new("RGB", img.size, (0, 0, 0))
    rgb.paste(img, mask=img.split()[-1])
    rgb.save(path, quality=quality, subsampling=0, optimize=True)
    print(f"  wrote {path.relative_to(ROOT)}  ({img.width}x{img.height})")
