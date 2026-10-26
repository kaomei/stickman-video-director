"""Generate StickVerse thumbnails (1280x720) + Shorts covers (1080x1920).

Every design is drawn from code so it can be re-run with new wording.
Text is deliberately 2-3 short lines: it has to survive the YouTube mobile feed.

Layout grid (1280x720):
    left text column  x 0.05 - 0.46
    art column        x 0.50 - 0.95
    bottom-left logo bug, bottom strip kept quiet
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

from sticklib import (ANTON, ARCHIVO, BEBAS, BONE, CAVEAT, CYAN, GOLD, GREEN, GREY, INK,
                      INK_2, NOTO, RED, ROOT, WHITE, arrow, badge, brand_mark, bulb, canvas,
                      draw_stickman as _draw_stickman, finish, font, glow_shape, measure,
                      noise_overlay, radial_glow, save_jpg, save_png, stripes, text,
                      text_shadow, vignette)


def draw_stickman(img, origin, height, **kw):
    """Every StickVerse figure carries the red wristband."""
    kw.setdefault("band", RED)
    return _draw_stickman(img, origin, height, **kw)

THUMB = ROOT / "thumbnails"
SS = 2
TW, TH = 1280, 720


# ------------------------------------------------------------------ helpers
def stack(base, lines, x, y, size, fill=WHITE, tracking=None, leading=0.90,
          shadow=(0, 0, 0, 200), blur=None, stroke=0, stroke_fill=None):
    """Draw a tight multi-line headline. Returns the y of the baseline of the last line."""
    f = font(ANTON, size)
    tr = int(size * 0.02) if tracking is None else tracking
    lh = size * leading
    for i, line in enumerate(lines):
        text_shadow(base, (x, y + i * lh), line, f, fill, tracking=tr,
                    shadow=shadow, offset=(size * 0.05, size * 0.07),
                    blur=blur or size * 0.10, stroke=stroke, stroke_fill=stroke_fill)
    return y + (len(lines) - 1) * lh


def logo_bug(img, size=None, x=None, y=None, alpha=130):
    """mark + STICKVERSE wordmark, bottom-left, low contrast."""
    w, h = img.size
    size = size or w * 0.034
    x = w * 0.043 if x is None else x
    y = h * 0.845 if y is None else y
    mark = Image.new("RGBA", (int(size * 3), int(size * 3)), (0, 0, 0, 0))
    brand_mark(mark, (mark.width / 2, mark.height / 2), size, color=WHITE, accent=RED, alpha=alpha)
    img.alpha_composite(mark, (int(x), int(y)))
    d = ImageDraw.Draw(img)
    f = font(BEBAS, int(size * 0.82))
    text(d, (x + size * 1.35, y + size * 0.62), "STICKVERSE", f, (255, 255, 255, alpha),
         anchor="lm", tracking=int(size * 0.09))


def dark_bg(w, h, seed=1, glow=RED, glow_pos=(0.72, 0.45), glow_r=0.60,
            stars=70, colour=INK):
    img = Image.new("RGBA", (w, h), (*colour, 255))
    radial_glow(img, (w * glow_pos[0], h * glow_pos[1]), w * glow_r, glow, alpha=60)
    radial_glow(img, (w * (1 - glow_pos[0]) * 0.85, h * 0.88), w * 0.40, (60, 45, 130), alpha=38)
    img.alpha_composite(stripes((w, h), (255, 255, 255), spacing=int(w * 0.10),
                                width=max(2, int(w * 0.002)), alpha=7))
    rnd = random.Random(seed)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _ in range(stars):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h)
        r = rnd.uniform(0.8, 2.4) * (w / 1280)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, rnd.randint(25, 105)))
    img.alpha_composite(layer)
    return img


def shadow_ellipse(img, center, rx, ry, color=(0, 0, 0), alpha=150, blur=26):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([center[0] - rx, center[1] - ry, center[0] + rx, center[1] + ry],
              fill=(*color, alpha))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


def draw_frame(img, w, h):
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w - 1, h - 1], outline=(0, 0, 0), width=int(w * 0.004))


def mobile_test(img, name):
    small = img.resize((256, 144), Image.LANCZOS)
    save_jpg(small, THUMB / "mobile-check" / f"{name}-256px.jpg", quality=88)


def under_last(img, line, x, y_of_line, size, label, colour=GOLD, gap=0.10,
               script_size=0.048):
    """Put a script note under a headline line, using the real ink bottom."""
    w, h = img.size
    d = ImageDraw.Draw(img)
    ink_bottom = d.textbbox((0, 0), line, font=font(ANTON, size))[3]
    text(d, (x + w * 0.003, y_of_line + ink_bottom + size * gap), label,
         font(CAVEAT, int(w * script_size)), colour)
    return y_of_line + ink_bottom + size * gap


def kicker(d, x, y, label, w, colour=RED, fg=WHITE):
    f = font(BEBAS, int(w * 0.0275))
    badge(d, (x, y), label, f, fill=colour, fg=fg,
          pad=(int(w * 0.011), int(w * 0.0055)), radius=int(w * 0.0035), tracking=int(w * 0.0022))


# ------------------------------------------------------------------ 1. brain
def t1_brain():
    w, h = TW * SS, TH * SS
    img = dark_bg(w, h, seed=4, glow_pos=(0.72, 0.40), glow_r=0.62)
    d = ImageDraw.Draw(img)

    x = w * 0.055
    kicker(d, x, h * 0.095, "PSYCHOLOGY", w)
    size = int(w * 0.104)
    lines = ["YOUR BRAIN", "LIES TO", "YOU"]
    last = stack(img, lines, x, h * 0.205, size, fill=WHITE, leading=0.895)
    # accent rule tucked under the last line (measured, not guessed)
    d2 = ImageDraw.Draw(img)
    f_last = font(ANTON, size)
    ink_bottom = d2.textbbox((0, 0), lines[-1], font=f_last)[3]
    ry = last + ink_bottom + size * 0.07
    d2.rounded_rectangle([x + w * 0.004, ry, x + w * 0.255, ry + h * 0.013],
                         radius=int(h * 0.0065), fill=RED)

    # character, thinking
    fig_h = h * 0.62
    ox, oy = w * 0.705, h * 0.285
    head_top = oy
    head_c = (ox, oy + fig_h * 0.115)
    head_r = fig_h * 0.115
    shadow_ellipse(img, (ox, h * 0.915), w * 0.105, h * 0.026, alpha=170)
    draw_stickman(img, (ox, oy), fig_h, pose="think", color=WHITE, stroke=w * 0.0072,
                  head_fill=(14, 14, 20))

    # thought orb above the head
    cx, cy = ox - w * 0.010, head_top - h * 0.128
    r = w * 0.060
    glow_shape(img, lambda dd: dd.ellipse([cx - r, cy - r, cx + r, cy + r],
                                          fill=(*RED, 130)), blur=w * 0.030)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    # a thought bubble: three bumps over a rounded base
    for ang, off in [(-135, 0.55), (-90, 0.72), (-45, 0.55)]:
        a = math.radians(ang)
        bx = cx + math.cos(a) * r * 0.42
        by = cy + math.sin(a) * r * 0.30
        ld.ellipse([bx - r * 0.56, by - r * 0.56, bx + r * 0.56, by + r * 0.56],
                   fill=(255, 236, 240, 245))
    ld.ellipse([cx - r * 0.86, cy - r * 0.62, cx + r * 0.86, cy + r * 0.80],
               fill=(255, 236, 240, 245))
    img.alpha_composite(layer)
    d3 = ImageDraw.Draw(img)
    # lightning bolt = faulty wiring
    bolt = [(cx + r * 0.16, cy - r * 0.66), (cx - r * 0.34, cy + r * 0.10),
            (cx - r * 0.03, cy + r * 0.10), (cx - r * 0.20, cy + r * 0.72),
            (cx + r * 0.36, cy - r * 0.10), (cx + r * 0.04, cy - r * 0.10)]
    d3.polygon(bolt, fill=(232, 26, 40, 255))
    # trailing thought bubbles down to the head
    for i, t in enumerate([0.55, 0.80, 1.0]):
        px = head_c[0] - head_r * 0.25 - t * r * 0.55
        py = head_c[1] - head_r * 0.80 - t * r * 0.45
        rr = head_r * (0.20 - i * 0.045)
        d3.ellipse([px - rr, py - rr, px + rr, py + rr], fill=(255, 236, 240, 220))

    logo_bug(img)
    vignette(img, strength=175)
    out = finish(img, TW, TH, SS)
    save_jpg(out, THUMB / "01-your-brain-lies-to-you.jpg")
    mobile_test(out, "01")


# ------------------------------------------------------------------ 2. loop
def t2_loop():
    w, h = TW * SS, TH * SS
    img = Image.new("RGBA", (w, h), (250, 246, 236, 255))
    img.alpha_composite(noise_overlay(Image.new("RGBA", (w, h), (250, 246, 236, 255)), 5))
    d = ImageDraw.Draw(img)

    # ---- hand-drawn loop
    cx, cy = w * 0.725, h * 0.50
    pts = []
    turns, steps = 2.15, 300
    for i in range(steps):
        t = i / steps
        ang = t * turns * 2 * math.pi - math.pi * 0.5
        r = w * (0.085 + 0.108 * t)
        pts.append((cx + math.cos(ang) * r, cy + math.sin(ang) * r * 0.88))
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.line(pts, fill=(*RED, 255), width=int(w * 0.0105), joint="curve")
    img.alpha_composite(layer)
    arrow(ImageDraw.Draw(img), pts[-8], pts[-2], color=RED, width=int(w * 0.0105),
          head=int(w * 0.028))

    # character stuck in the middle of the loop
    fig_h = h * 0.235
    fx, fy = cx - fig_h * 0.02, cy - fig_h * 0.45
    draw_stickman(img, (fx, fy), fig_h, pose="crossed", color=INK, stroke=w * 0.0062,
                  head_fill=(255, 255, 255))

    # ---- text
    d2 = ImageDraw.Draw(img)
    x = w * 0.058
    kicker(d2, x, h * 0.105, "REAL TALK", w, colour=INK, fg=WHITE)
    size = int(w * 0.100)
    last = stack(img, ["SAME LOOP", "SAME YEAR"], x, h * 0.225, size, fill=INK,
                 shadow=(0, 0, 0, 45), blur=size * 0.08, leading=0.90)
    # strike through the second line only (measured ink box)
    f2 = font(ANTON, size)
    ink = d2.textbbox((0, 0), "SAME YEAR", font=f2)
    strike_y = last + (ink[1] + ink[3]) / 2
    d3 = ImageDraw.Draw(img)
    d3.line([(x - w * 0.008, strike_y + h * 0.014), (x + w * 0.372, strike_y - h * 0.010)],
            fill=RED, width=int(w * 0.012))
    under_last(img, "SAME YEAR", x, last, size, "+ nothing changes", colour=(35, 35, 45))
    arrow(d3, (x + w * 0.315, last + size * 1.08), (x + w * 0.245, last + size * 0.88),
          color=RED, width=int(w * 0.005), head=int(w * 0.020))

    logo_bug(img, alpha=95)
    vignette(img, strength=45, color=(120, 90, 60))
    out = finish(img, TW, TH, SS)
    save_jpg(out, THUMB / "02-same-loop-same-year.jpg")
    mobile_test(out, "02")


# ------------------------------------------------------------------ 3. one man vs empire
def t3_vs_empire():
    w, h = TW * SS, TH * SS
    img = Image.new("RGBA", (w, h), (13, 15, 24, 255))
    radial_glow(img, (w * 0.70, h * 0.42), w * 0.58, (255, 120, 40), alpha=62)
    img.alpha_composite(stripes((w, h), (255, 255, 255), spacing=int(w * 0.12),
                                width=int(w * 0.0018), alpha=6))

    sc = (w * 0.715, h * 0.415)
    sun = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sun)
    sd.ellipse([sc[0] - w * 0.145, sc[1] - w * 0.145, sc[0] + w * 0.145, sc[1] + w * 0.145],
               fill=(196, 40, 32, 255))
    img.alpha_composite(sun.filter(ImageFilter.GaussianBlur(w * 0.003)))

    d = ImageDraw.Draw(img)
    d.rectangle([0, h * 0.775, w, h], fill=(9, 10, 16, 255))
    d.line([(0, h * 0.775), (w, h * 0.775)], fill=(255, 255, 255, 45), width=int(w * 0.0018))

    # hero (left of sun) vs faceless army (far right)
    fig_h = h * 0.375
    shadow_ellipse(img, (w * 0.615, h * 0.780), w * 0.055, h * 0.014, alpha=200, blur=12)
    draw_stickman(img, (w * 0.612, h * 0.775 - fig_h * 0.985), fig_h, pose="crossed",
                  color=(255, 250, 240), stroke=w * 0.0062)
    for sx, sh in [(0.845, 0.235), (0.900, 0.205), (0.952, 0.225)]:
        draw_stickman(img, (w * sx, h * 0.775 - h * sh), h * sh, pose="open",
                      color=(96, 62, 62), stroke=w * 0.0062, alpha=235)

    x = w * 0.055
    kicker(d, x, h * 0.095, "HISTORY  \u00b7  TRUE STORY", w, colour=(196, 40, 32))
    size = int(w * 0.098)
    last = stack(img, ["ONE MAN", "VS AN", "EMPIRE"], x, h * 0.20, size,
                 fill=(255, 250, 240), leading=0.905)

    logo_bug(img)
    vignette(img, strength=155)
    out = finish(img, TW, TH, SS)
    save_jpg(out, THUMB / "03-one-man-vs-an-empire.jpg")
    mobile_test(out, "03")


# ------------------------------------------------------------------ 4. 3am
def t4_3am():
    w, h = TW * SS, TH * SS
    img = Image.new("RGBA", (w, h), (24, 19, 26, 255))
    radial_glow(img, (w * 0.80, h * 0.72), w * 0.55, (255, 168, 70), alpha=105)
    radial_glow(img, (w * 0.16, h * 0.16), w * 0.34, (70, 95, 165), alpha=42)

    d = ImageDraw.Draw(img)
    rnd = random.Random(3)
    for _ in range(46):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h * 0.62)
        r = rnd.uniform(1, 2.6)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, rnd.randint(18, 70)))

    # moon, top right
    mx, my = w * 0.865, h * 0.155
    glow_shape(img, lambda dd: dd.ellipse([mx - w * 0.075, my - w * 0.075,
                                           mx + w * 0.075, my + w * 0.075],
                                          fill=(180, 200, 255, 70)), blur=w * 0.045)
    d.ellipse([mx - w * 0.042, my - w * 0.042, mx + w * 0.042, my + w * 0.042],
              fill=(246, 240, 214, 255))
    d.ellipse([mx - w * 0.018, my - w * 0.026, mx + w * 0.006, my - w * 0.002],
              fill=(228, 222, 198, 255))
    d.ellipse([mx + w * 0.010, my + w * 0.008, mx + w * 0.030, my + w * 0.028],
              fill=(230, 224, 200, 255))

    # faint clock face behind the headline
    clk = Image.new("RGBA", img.size, (0, 0, 0, 0))
    cd = ImageDraw.Draw(clk)
    ccx, ccy, cr = w * 0.20, h * 0.48, w * 0.175
    cd.ellipse([ccx - cr, ccy - cr, ccx + cr, ccy + cr], outline=(255, 255, 255, 26),
               width=int(w * 0.0035))
    for i in range(12):
        a = math.radians(i * 30 - 90)
        r0, r1 = cr * (0.86 if i % 3 else 0.78), cr * 0.94
        cd.line([(ccx + math.cos(a) * r0, ccy + math.sin(a) * r0),
                 (ccx + math.cos(a) * r1, ccy + math.sin(a) * r1)],
                fill=(255, 255, 255, 34), width=int(w * 0.003))
    img.alpha_composite(clk)

    # desk
    desk_y = h * 0.705
    d.rectangle([0, desk_y, w, h], fill=(44, 30, 28, 255))
    d.rectangle([0, desk_y, w, desk_y + h * 0.016], fill=(70, 47, 41, 255))
    d.line([(0, desk_y), (w, desk_y)], fill=(136, 92, 66, 255), width=int(w * 0.0032))

    # phone face-up on the desk, screen lit
    ph_w, ph_h = w * 0.055, h * 0.155
    px0 = w * 0.838
    d.rounded_rectangle([px0, desk_y + h * 0.035, px0 + ph_w, desk_y + h * 0.035 + ph_h],
                        radius=int(w * 0.006), fill=(16, 16, 22, 255),
                        outline=(104, 104, 122, 255), width=int(w * 0.0028))
    d.rounded_rectangle([px0 + w * 0.006, desk_y + h * 0.045, px0 + ph_w - w * 0.006,
                         desk_y + h * 0.035 + ph_h - h * 0.010],
                        radius=int(w * 0.004), fill=(118, 190, 255, 120))

    # character sitting on the desk edge
    fig_h = h * 0.40
    hip_y = desk_y + h * 0.004
    oy = hip_y - 0.47 * fig_h
    ox = w * 0.665
    shadow_ellipse(img, (ox + w * 0.02, hip_y), w * 0.135, h * 0.020, alpha=150, blur=18)
    draw_stickman(img, (ox, oy), fig_h, pose="sit", color=(255, 250, 240), stroke=w * 0.0062)

    # headline, left
    d2 = ImageDraw.Draw(img)
    x = w * 0.055
    kicker(d2, x, h * 0.185, "SHORTS", w)
    f1 = int(w * 0.150)
    text_shadow(img, (x, h * 0.275), "3AM", font(ANTON, f1), WHITE, tracking=int(f1 * 0.02),
                shadow=(0, 0, 0, 200), offset=(6, 8), blur=18)
    f2 = int(w * 0.088)
    text_shadow(img, (x + w * 0.004, h * 0.275 + f1 * 0.90), "AGAIN.", font(ANTON, f2), GOLD,
                tracking=int(f2 * 0.02), shadow=(0, 0, 0, 200), offset=(4, 6), blur=12)
    text(d2, (x, h * 0.275 + f1 * 0.90 + f2 * 1.10), "still scrolling.", font(CAVEAT, int(w * 0.052)),
         (236, 220, 202, 235))

    logo_bug(img)
    vignette(img, strength=175)
    out = finish(img, TW, TH, SS)
    save_jpg(out, THUMB / "04-3am-again.jpg")
    mobile_test(out, "04")


# ------------------------------------------------------------------ 5. money
def t5_money():
    w, h = TW * SS, TH * SS
    img = Image.new("RGBA", (w, h), (10, 34, 24, 255))
    radial_glow(img, (w * 0.26, h * 0.42), w * 0.55, (40, 200, 120), alpha=72)
    img.alpha_composite(stripes((w, h), (255, 255, 255), spacing=int(w * 0.09),
                                width=int(w * 0.002), alpha=6))
    d = ImageDraw.Draw(img)

    # coin stack
    cx = w * 0.845
    for i, y in enumerate([0.815, 0.755, 0.695, 0.635, 0.575]):
        cy = h * y
        top = (255, 200, 70)
        side = (214, 152, 26)
        d.rounded_rectangle([cx - w * 0.082, cy, cx + w * 0.082, cy + h * 0.058],
                            radius=w * 0.012, fill=side)
        d.ellipse([cx - w * 0.082, cy - h * 0.026, cx + w * 0.082, cy + h * 0.026],
                  fill=top, outline=(116, 80, 12), width=int(w * 0.0032))
        d.ellipse([cx - w * 0.030, cy - h * 0.010, cx + w * 0.030, cy + h * 0.010],
                  outline=(150, 106, 18), width=int(w * 0.0028))

    # character shoving the stack
    fig_h = h * 0.50
    ox = w * 0.565
    oy = h * 0.755 - fig_h * 0.985
    shadow_ellipse(img, (ox + w * 0.05, h * 0.762), w * 0.150, h * 0.020, alpha=200, blur=16)
    shadow_ellipse(img, (cx, h * 0.815), w * 0.115, h * 0.016, alpha=180, blur=14)
    draw_stickman(img, (ox, oy), fig_h, pose="push", color=WHITE, stroke=w * 0.0065)

    x = w * 0.055
    kicker(d, x, h * 0.095, "MONEY", w, colour=(18, 148, 88))
    size = int(w * 0.094)
    last = stack(img, ["THEY PAY", "YOU LESS", "THAN THIS"], x, h * 0.195, size, fill=WHITE,
                 leading=0.905)
    under_last(img, "THAN THIS", x, last, size, "here's why", colour=GOLD, gap=0.16)

    logo_bug(img)
    vignette(img, strength=150)
    out = finish(img, TW, TH, SS)
    save_jpg(out, THUMB / "05-they-pay-you-less.jpg")
    mobile_test(out, "05")


# ------------------------------------------------------------------ 6. versus
def t6_versus():
    w, h = TW * SS, TH * SS
    img = Image.new("RGBA", (w, h), (250, 247, 240, 255))
    d = ImageDraw.Draw(img)
    d.polygon([(0, 0), (w * 0.55, 0), (w * 0.43, h), (0, h)], fill=(252, 250, 245, 255))
    d.polygon([(w * 0.55, 0), (w, 0), (w, h), (w * 0.43, h)], fill=(17, 17, 25, 255))
    d.line([(w * 0.55, 0), (w * 0.43, h)], fill=RED, width=int(w * 0.006))

    # left = now, slouched on the floor
    fig_h = h * 0.44
    draw_stickman(img, (w * 0.245, h * 0.40), fig_h, pose="sit", color=INK,
                  stroke=w * 0.0065, head_fill=(255, 255, 255))
    shadow_ellipse(img, (w * 0.245, h * 0.86), w * 0.10, h * 0.016, color=(90, 80, 70), alpha=90)

    # right = one year later
    fig_h2 = h * 0.50
    origin2 = (w * 0.755, h * 0.375)
    glow_shape(img, lambda dd: dd.ellipse([origin2[0] - w * 0.14, h * 0.62,
                                           origin2[0] + w * 0.14, h * 0.90],
                                          fill=(*GOLD, 45)), blur=w * 0.05)
    draw_stickman(img, origin2, fig_h2, pose="point_up", color=WHITE, stroke=w * 0.0065,
                  head_fill=(17, 17, 25))
    bulb(img, (origin2[0] + fig_h2 * 0.15, origin2[1] - fig_h2 * 0.145), w * 0.032)

    d2 = ImageDraw.Draw(img)
    f_you = font(ANTON, int(w * 0.115))
    text(d2, (w * 0.075, h * 0.085), "YOU", f_you, INK, tracking=int(w * 0.002))
    text(d2, (w * 0.082, h * 0.085 + int(w * 0.115) * 0.98), "today", font(CAVEAT, int(w * 0.052)),
         (70, 70, 80))
    text(d2, (w * 0.585, h * 0.085), "YOU", f_you, WHITE, tracking=int(w * 0.002))
    text(d2, (w * 0.592, h * 0.085 + int(w * 0.115) * 0.98), "+1 year",
         font(CAVEAT, int(w * 0.058)), GOLD)

    # small date stamps bottom corners
    f_s = font(BEBAS, int(w * 0.030))
    text(d2, (w * 0.075, h * 0.795), "DAY 0", f_s, (120, 118, 112), tracking=int(w * 0.002))
    text(d2, (w * 0.585, h * 0.795), "DAY 365", f_s, (255, 255, 255, 130), tracking=int(w * 0.002))

    logo_bug(img, alpha=100)
    vignette(img, strength=40, color=(120, 90, 60))
    out = finish(img, TW, TH, SS)
    save_jpg(out, THUMB / "06-you-vs-you-in-1-year.jpg")
    mobile_test(out, "06")


# ------------------------------------------------------------------ shorts covers
def shorts_cover(title_lines, badge_text, pose, fname, accent=RED, seed=5,
                 footnote="NEW STICKMAN STORY EVERY DAY"):
    w, h = 1080 * SS, 1920 * SS
    img = dark_bg(w, h, seed=seed, glow_pos=(0.5, 0.26), glow_r=0.80, stars=130)
    d = ImageDraw.Draw(img)

    x = w * 0.085
    kicker(d, x, h * 0.105, badge_text, w, colour=accent)
    size = int(w * 0.140)
    stack(img, title_lines, x, h * 0.175, size, fill=WHITE, leading=0.895,
          shadow=(0, 0, 0, 150), blur=size * 0.16)

    # character
    fig_h = h * 0.335
    ox = w * 0.50
    oy = h * 0.505
    shadow_ellipse(img, (ox, oy + fig_h * 0.99), w * 0.235, h * 0.018, alpha=160, blur=20)
    draw_stickman(img, (ox, oy), fig_h, pose=pose, color=WHITE, stroke=w * 0.0115,
                  head_fill=(15, 15, 22))
    bulb(img, (ox - fig_h * 0.20, oy - fig_h * 0.17), w * 0.042)

    # bottom strip, above the Shorts UI
    d2 = ImageDraw.Draw(img)
    d2.rounded_rectangle([x, h * 0.885, w - x, h * 0.930], radius=int(w * 0.018),
                         fill=(255, 255, 255, 20), outline=(255, 255, 255, 70),
                         width=int(w * 0.003))
    text(d2, (w * 0.5, h * 0.9075), footnote, font(BEBAS, int(w * 0.042)), WHITE, anchor="mm",
         tracking=int(w * 0.002))

    logo_bug(img, alpha=150)
    vignette(img, strength=185)
    out = finish(img, 1080, 1920, SS)
    save_png(out, THUMB / "shorts" / fname)
    return out


def contact_sheet(paths, name="contact-sheet.png"):
    cols, rows = 3, 2
    cw, ch = 640, 360
    pad = 28
    W = cols * cw + pad * (cols + 1)
    H = rows * ch + pad * (rows + 1)
    sheet = Image.new("RGB", (W, H), (16, 16, 20))
    for i, p in enumerate(paths):
        im = Image.open(p).convert("RGB").resize((cw, ch), Image.LANCZOS)
        r, c = divmod(i, cols)
        sheet.paste(im, (pad + c * (cw + pad), pad + r * (ch + pad)))
    out = THUMB / name
    sheet.save(out, optimize=True)
    print(f"  wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    print("StickVerse thumbnails")
    t1_brain()
    t2_loop()
    t3_vs_empire()
    t4_3am()
    t5_money()
    t6_versus()
    shorts_cover(["WHY YOUR", "BRAIN", "LIES"], "PSYCHOLOGY", "think",
                 "shorts-cover-01.png", seed=21)
    shorts_cover(["SAME", "LOOP", "EVERY DAY"], "REAL TALK", "sit",
                 "shorts-cover-02.png", accent=GOLD, seed=22)
    contact_sheet(sorted(THUMB.glob("0*.jpg")))
