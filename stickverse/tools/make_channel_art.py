"""StickVerse channel art — three banner concepts and three profile-picture concepts.

Layout rule: every banner is composed inside YouTube's phone-safe box
(1546 x 423, centred on a 2560 x 1440 canvas). Anything outside it is decoration that
only shows on TV / desktop. That guarantees the channel name is never cropped.

Run:  python make_channel_art.py
"""

from __future__ import annotations

import math
import random

from PIL import Image, ImageDraw, ImageFilter

from sticklib import (ANTON, BEBAS, CAVEAT, CYAN, GOLD, INK, NOTO, RED, ROOT, WHITE, bulb,
                      draw_stickman, finish, font, glow_shape, measure, noise_overlay,
                      radial_glow, save_png, stripes, text, text_shadow, vignette)

OUT = ROOT / "brand" / "options"
BW, BH = 2560, 1440
SX0, SY0, SX1, SY1 = 507, 508, 2053, 932          # safe box (1546 x 423)
SW, SH = SX1 - SX0, SY1 - SY0
AV = 800


# ------------------------------------------------------------------ utilities
def star_field(img, n=420, seed=5, alpha=170, scale=1.0):
    rnd = random.Random(seed)
    w, h = img.size
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _ in range(n):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h)
        r = rnd.uniform(0.9, 3.4) * scale
        a = int(rnd.uniform(0.12, 1.0) * alpha)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, a))
        if rnd.random() < 0.05:
            L = r * 6
            d.line([(x - L, y), (x + L, y)], fill=(255, 255, 255, a // 3), width=max(1, int(r / 1.8)))
            d.line([(x, y - L), (x, y + L)], fill=(255, 255, 255, a // 3), width=max(1, int(r / 1.8)))
    img.alpha_composite(layer)


def soft_blob(img, center, radius, color, alpha=90, blur=None):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius],
              fill=(*color, alpha))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur or radius * 0.55)))


def orbit_ellipses(img, center, radii, color=(255, 255, 255), alpha=26, width=2):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for r in radii:
        d.ellipse([center[0] - r, center[1] - r * 0.40, center[0] + r, center[1] + r * 0.40],
                  outline=(*color, alpha), width=width)
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(1.2)))


def paper_bg(w, h, base=(250, 246, 236)):
    img = Image.new("RGBA", (w, h), (*base, 255))
    rnd = random.Random(11)
    d = ImageDraw.Draw(img)
    for _ in range(int(w * h / 1400)):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h)
        v = rnd.randint(-7, 2)
        r = rnd.uniform(0.5, 1.5)
        d.ellipse([x - r, y - r, x + r, y + r],
                  fill=(base[0] + v, base[1] + v, base[2] + v, rnd.randint(6, 15)))
    step = int(w * 0.0125)
    g = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    for x in range(0, w, step):
        gd.line([(x, 0), (x, h)], fill=(76, 90, 105, 14), width=1)
    for y in range(0, h, step):
        gd.line([(0, y), (w, y)], fill=(76, 90, 105, 14), width=1)
    img.alpha_composite(g)
    return img


def wordmark_width(size, tracking_pct=0.045):
    f = font(ANTON, size)
    d = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    return measure(d, "STICKVERSE", f, int(size * tracking_pct))[0]


def draw_wordmark(img, xy, size, color=WHITE, tracking_pct=0.045, glow=None):
    f = font(ANTON, size)
    tr = int(size * tracking_pct)
    if glow:
        text_shadow(img, xy, "STICKVERSE", f, color, tracking=tr, shadow=(0, 0, 0, 170),
                    offset=(0, size * 0.06), blur=size * 0.20)
    else:
        d = ImageDraw.Draw(img)
        text(d, xy, "STICKVERSE", f, color, tracking=tr)


def safe_lockup(img, word_size, kicker, sub, *, x=SX0 + 40, mid_y=(SY0 + SY1) / 2,
                word_color=WHITE, kicker_color=GOLD, sub_color=(210, 213, 226),
                rule_color=RED, font_kicker=BEBAS, kicker_size=None, sub_size=None,
                sub_font=NOTO, shadow=False):
    """Wordmark + rule + kicker + sub, vertically centred on mid_y, inside the safe box."""
    kicker_size = kicker_size or int(word_size * 0.30)
    sub_size = sub_size or int(word_size * 0.205)
    f_k = font(font_kicker, kicker_size)
    f_s = font(sub_font, sub_size)
    d = ImageDraw.Draw(img)

    # measure block
    tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    wt, wb = tmp.textbbox((0, 0), "STICKVERSE", font=font(ANTON, word_size))[2:]
    kt, kb = tmp.textbbox((0, 0), kicker, font=f_k)[2:]
    st, sb = tmp.textbbox((0, 0), sub, font=f_s)[2:]
    gap1 = int(word_size * 0.20)
    gap2 = int(sub_size * 0.55)
    block_h = wb + gap1 + kb + gap2 + sb

    y = mid_y - block_h / 2
    draw_wordmark(img, (x, y - wb * 0.0), word_size, word_color, glow=shadow)
    y2 = y + wb + gap1
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([x + 2, y2, x + 2 + word_size * 0.62, y2 + max(4, int(word_size * 0.045))],
                        radius=3, fill=rule_color)
    y3 = y2 + max(4, int(word_size * 0.045)) + gap2
    text(d, (x + 1, y3), kicker, f_k, kicker_color, tracking=int(kicker_size * 0.14))
    y4 = y3 + kb + int(sub_size * 0.30)
    text(d, (x + 1, y4), sub, f_s, sub_color)
    return wt, block_h, y + wb


def avatar_ring(img, center, r, color=WHITE, accent=RED, lw_ratio=0.045):
    cx, cy = center
    d = ImageDraw.Draw(img)
    lw = max(3, int(r * lw_ratio))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(*color, 255), width=lw)
    d.arc([cx - r, cy - r, cx + r, cy + r], start=-70, end=35, fill=(*accent, 255), width=lw)
    a = math.radians(-70)
    mx, my = cx + math.cos(a) * r, cy + math.sin(a) * r
    mr = lw * 1.2
    d.ellipse([mx - mr, my - mr, mx + mr, my + mr], fill=(*accent, 255))


# ===================================================================== BANNERS
def banner_a():
    """A · Deep Space — flagship. Bright planet + character on the right, type on the left."""
    W, H = BW, BH
    img = Image.new("RGBA", (W, H), (*INK, 255))
    w, h = img.size

    soft_blob(img, (w * 0.74, h * 0.48), w * 0.30, (255, 70, 60), alpha=120)
    soft_blob(img, (w * 0.80, h * 0.50), w * 0.17, (255, 130, 80), alpha=85)
    soft_blob(img, (w * 0.18, h * 0.55), w * 0.24, CYAN, alpha=22)
    soft_blob(img, (w * 0.48, h * 0.48), w * 0.30, (70, 45, 150), alpha=45)
    img.alpha_composite(stripes((w, h), (255, 255, 255), spacing=150, width=3, alpha=8))
    orbit_ellipses(img, (w * 0.755, h * 0.50), [w * 0.155, w * 0.225], alpha=30)
    star_field(img, n=420, seed=5, alpha=150)
    noise_overlay(img, amount=6)

    # character stands with feet on the safe box's bottom edge, inside the box horizontally
    feet_y = SY1 - 6
    fig_h = 300
    fig_cx = SX1 - 190
    draw_stickman(img, (fig_cx - fig_h * 0.02, feet_y - fig_h * 0.985), fig_h, pose="point_up",
                  color=WHITE, stroke=7.0, band=RED)
    bulb(img, (fig_cx + fig_h * 0.155, feet_y - fig_h * 0.985 - fig_h * 0.175), 30)

    # ground ellipse under the figure
    d = ImageDraw.Draw(img)
    d.ellipse([fig_cx - 150, feet_y - 12, fig_cx + 120, feet_y + 16], fill=(255, 60, 55, 60))
    img.alpha_composite(Image.new("RGBA", img.size, (0, 0, 0, 0)))

    safe_lockup(img, 176, "AI STICKMAN STORIES", "New Shorts daily  \u00b7  Deep dives every Friday",
                x=SX0 + 46, mid_y=(SY0 + SY1) / 2 - 6, shadow=True)

    vignette(img, strength=190)
    out = finish(img, W, H, 2)
    save_png(out, OUT / "banner-a-deep-space.png")
    return out


def banner_b():
    """B · Warm Paper — light background, marker energy, ink character."""
    W, H = BW, BH
    img = paper_bg(W, H)
    w, h = img.size
    d = ImageDraw.Draw(img)

    # marker underline under the wordmark (drawn after the type, tapered ends)
    fig_h = 300
    feet_y = SY1 - 6
    fig_cx = SX1 - 185

    fig_h = 300
    feet_y = SY1 - 6
    fig_cx = SX1 - 185
    d = ImageDraw.Draw(img)
    d.line([(fig_cx - 190, feet_y + 2), (fig_cx + 175, feet_y + 2)], fill=(28, 28, 32, 235),
           width=9)
    draw_stickman(img, (fig_cx - fig_h * 0.02, feet_y - fig_h * 0.985), fig_h, pose="point_up",
                  color=INK, stroke=7.6, band=RED, jitter=0.0014, seed=12)
    bulb(img, (fig_cx + fig_h * 0.155, feet_y - fig_h * 0.985 - fig_h * 0.175), 30)

    wt, _, wbot = safe_lockup(img, 176, "AI STICKMAN STORIES",
                             "new Shorts daily  \u00b7  deep dives every Friday",
                             x=SX0 + 70, mid_y=(SY0 + SY1) / 2 - 14, word_color=INK,
                             kicker_color=(200, 30, 30), sub_color=(58, 56, 52),
                             rule_color=(250, 246, 236), sub_font=CAVEAT, sub_size=44)

    # hand-drawn arrow from the wordmark toward the character
    al = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ad = ImageDraw.Draw(al)
    ax0, ay0 = SX0 + 78 + wt * 1.005, wbot + 12
    ax1, ay1 = fig_cx - 110, wbot - 34
    ad.line([(ax0, ay0), (ax1, ay1)], fill=(226, 38, 38, 210), width=7)
    a = math.atan2(ay1 - ay0, ax1 - ax0)
    for sgn in (-1, 1):
        ad.line([(ax1, ay1), (ax1 + math.cos(a + sgn * math.radians(152)) * 34,
                              ay1 + math.sin(a + sgn * math.radians(152)) * 34)],
                fill=(226, 38, 38, 210), width=7)
    img.alpha_composite(al.filter(ImageFilter.GaussianBlur(0.8)))

    vignette(img, strength=45, color=(150, 110, 70))
    out = finish(img, W, H, 2)
    save_png(out, OUT / "banner-b-paper.png")
    return out


def banner_c():
    """C · Signal — hard diagonal split, red field, white figure."""
    W, H = BW, BH
    img = Image.new("RGBA", (W, H), (206, 32, 32, 255))
    w, h = img.size
    soft_blob(img, (w * 0.78, h * 0.30), w * 0.40, (255, 140, 80), alpha=80)

    # dark wedge behind the type, angled so it passes behind the safe box
    d = ImageDraw.Draw(img)
    d.polygon([(0, 0), (w * 0.630, 0), (w * 0.550, h), (0, h)], fill=(*INK, 255))
    d.line([(w * 0.630, 0), (w * 0.550, h)], fill=(255, 255, 255, 34), width=4)

    stars = Image.new("RGBA", img.size, (0, 0, 0, 0))
    star_field(stars, n=260, seed=8, alpha=110)
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon([(0, 0), (w * 0.630, 0), (w * 0.550, h), (0, h)], fill=255)
    stars.putalpha(Image.composite(stars.split()[-1], Image.new("L", img.size, 0), mask))
    img.alpha_composite(stars)

    # character, large, on the red side
    fig_h = 300
    feet_y = SY1 - 4
    fig_cx = SX1 - 165
    d = ImageDraw.Draw(img)
    d.ellipse([fig_cx - 150, feet_y - 6, fig_cx + 120, feet_y + 22], fill=(120, 10, 12, 90))
    draw_stickman(img, (fig_cx - fig_h * 0.02, feet_y - fig_h * 0.985), fig_h, pose="open",
                  color=WHITE, stroke=8.0, band=INK)
    bulb(img, (fig_cx + fig_h * 0.30, feet_y - fig_h * 0.93), 28)

    safe_lockup(img, 146, "AI STICKMAN STORIES", "New Shorts daily  \u00b7  Deep dives every Friday",
                x=SX0 + 60, mid_y=(SY0 + SY1) / 2 - 4, kicker_color=(255, 120, 110),
                sub_color=(200, 202, 216))

    vignette(img, strength=110)
    out = finish(img, W, H, 2)
    save_png(out, OUT / "banner-c-signal.png")
    return out


# ===================================================================== AVATARS
def avatar_a():
    S = AV
    img = Image.new("RGBA", (S * 4, S * 4), (*INK, 255))
    w = img.size[0]
    soft_blob(img, (w * 0.50, w * 0.38), w * 0.62, (76, 48, 160), alpha=120)
    soft_blob(img, (w * 0.50, w * 0.55), w * 0.40, RED, alpha=70)
    star_field(img, n=110, seed=21, alpha=120, scale=1.7)
    avatar_ring(img, (w / 2, w / 2), w * 0.400, color=WHITE, accent=RED, lw_ratio=0.050)
    hgt = w * 0.315
    draw_stickman(img, (w / 2, w / 2 - hgt * 0.49), hgt, pose="open", color=WHITE,
                  stroke=w * 0.031, band=RED)
    vignette(img, strength=150)
    out = finish(img, S, S, 4)
    save_png(out, OUT / "avatar-a-deep-space.png")
    return out


def avatar_b():
    S = AV
    img = paper_bg(S * 4, S * 4)
    w = img.size[0]
    d = ImageDraw.Draw(img)
    d.ellipse([w * 0.075, w * 0.075, w * 0.925, w * 0.925], fill=(214, 42, 42, 255))
    d.ellipse([w * 0.075, w * 0.075, w * 0.925, w * 0.925], outline=(28, 28, 32, 255),
              width=int(w * 0.022))
    hgt = w * 0.47
    draw_stickman(img, (w / 2, w / 2 - hgt * 0.52), hgt, pose="point_up", color=(255, 252, 244),
                  stroke=w * 0.040, band=(28, 28, 32))
    out = finish(img, S, S, 4)
    save_png(out, OUT / "avatar-b-paper.png")
    return out


def avatar_c():
    S = AV
    img = Image.new("RGBA", (S * 4, S * 4), (206, 32, 32, 255))
    w = img.size[0]
    soft_blob(img, (w * 0.34, w * 0.28), w * 0.60, (255, 155, 100), alpha=110)
    d = ImageDraw.Draw(img)
    d.ellipse([w * 0.055, w * 0.055, w * 0.945, w * 0.945], outline=(*INK, 235),
              width=int(w * 0.030))
    hgt = w * 0.50
    draw_stickman(img, (w / 2, w / 2 - hgt * 0.49), hgt, pose="think", color=WHITE,
                  stroke=w * 0.042, band=INK)
    bulb(img, (w * 0.685, w * 0.225), w * 0.062)
    vignette(img, strength=80)
    out = finish(img, S, S, 4)
    save_png(out, OUT / "avatar-c-signal.png")
    return out


# ===================================================================== PREVIEWS
def preview_banners(banners):
    """Full canvas beside the real phone view (safe-area crop)."""
    pad = 44
    full_w = 560
    band_w = 980
    row_h = 356
    W = pad * 3 + full_w + band_w
    H = pad + len(banners) * (row_h + 60)
    sheet = Image.new("RGB", (W, H), (14, 14, 18))
    d = ImageDraw.Draw(sheet)
    f_lbl, f_small = font(BEBAS, 34), font(NOTO, 18)
    for i, (name, im) in enumerate(banners):
        y = pad + i * (row_h + 60)
        text(d, (pad, y - 8), name.upper(), f_lbl, (240, 240, 245), tracking=3)
        yy = y + 40
        full = im.convert("RGB").resize((full_w, int(full_w * 9 / 16)), Image.LANCZOS)
        sheet.paste(full, (pad, yy))
        text(d, (pad, yy + full.height + 8), "full banner 2560 x 1440", f_small, (150, 152, 165))
        band = im.convert("RGB").crop((SX0, SY0, SX1, SY1))
        band = band.resize((band_w, int(band_w * SH / SW)), Image.LANCZOS)
        bx = pad * 2 + full_w
        sheet.paste(band, (bx, yy))
        text(d, (bx, yy + band.height + 8), "phone view 1546 x 423 (the only part that must work)",
             f_small, (150, 152, 165))
    sheet.save(OUT / "preview-banners.png", optimize=True)
    print(f"  wrote {(OUT / 'preview-banners.png').relative_to(ROOT)}")


def circle_paste(sheet, im, box, size):
    av = im.convert("RGB").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size * 4 - 1, size * 4 - 1], fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    sheet.paste(av, (box[0], box[1]), mask)


def preview_avatars(avatars):
    pad = 40
    col = 470
    W = pad + col * len(avatars)
    H = 620
    sheet = Image.new("RGB", (W, H), (14, 14, 18))
    d = ImageDraw.Draw(sheet)
    f_lbl, f_small = font(BEBAS, 30), font(NOTO, 16)
    for i, (name, im) in enumerate(avatars):
        x = pad + i * col
        big = im.convert("RGB").resize((300, 300), Image.LANCZOS)
        circle_paste(sheet, im, (x, 20), 300)
        text(d, (x, 336), name.upper(), f_lbl, (240, 240, 245), tracking=2)
        # how it looks small, on a dark card
        d.rounded_rectangle([x, 384, x + 420, 500], radius=10, fill=(26, 26, 32))
        for j, s in enumerate([96, 56, 32]):
            circle_paste(sheet, im, (x + 24 + j * 120, 384 + (116 - s) // 2), s)
        text(d, (x + 24, 516), "96 px      56 px      32 px", f_small, (140, 142, 155))
        text(d, (x + 24, 548), "channel page / comments / feed", f_small, (110, 112, 125))
    sheet.save(OUT / "preview-avatars.png", optimize=True)
    print(f"  wrote {(OUT / 'preview-avatars.png').relative_to(ROOT)}")


def channel_mockup(banner, avatar, name, tag, slug="x"):
    W, banner_w = 1600, 1480
    b = banner.convert("RGB")
    bh = int(b.height * banner_w / b.width)
    b = b.resize((banner_w, bh), Image.LANCZOS)
    H = bh + 300
    sheet = Image.new("RGB", (W, H), (15, 15, 15))
    sheet.paste(b, (60, 40))

    av_s = 200
    ax, ay = 120, 40 + bh - av_s + 34
    d = ImageDraw.Draw(sheet)
    d.ellipse([ax - 9, ay - 9, ax + av_s + 9, ay + av_s + 9], fill=(15, 15, 15))
    circle_paste(sheet, avatar, (ax, ay), av_s)

    d = ImageDraw.Draw(sheet)
    text(d, (ax + av_s + 36, ay + 24), name, font(ANTON, 54), (245, 245, 245), tracking=1)
    text(d, (ax + av_s + 38, ay + 94), tag, font(NOTO, 22), (150, 150, 155))
    text(d, (ax + av_s + 38, ay + 130), "AI stickman stories that stay with you.",
         font(NOTO, 21), (118, 118, 124))
    pw, ph = 152, 44
    px, py = W - 60 - pw - 30, ay + 38
    d.rounded_rectangle([px, py, px + pw, py + ph], radius=22, fill=(245, 245, 245))
    text(d, (px + pw / 2, py + ph / 2), "Subscribe", font(NOTO, 21), (20, 20, 20), anchor="mm")
    out = OUT / f"channel-mockup-{slug}.png"
    sheet.save(out, optimize=True)
    print(f"  wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    print("Channel art options")
    ba, bb, bc = banner_a(), banner_b(), banner_c()
    aa, ab, ac = avatar_a(), avatar_b(), avatar_c()
    preview_banners([("A · Deep space", ba), ("B · Warm paper", bb), ("C · Signal split", bc)])
    preview_avatars([("A · Deep space", aa), ("B · Paper", ab), ("C · Signal red", ac)])
    tag = "@stickverse · 1.2K subscribers · 34 videos"
    channel_mockup(ba, aa, "StickVerse", tag, "a")
    channel_mockup(bb, ab, "StickVerse", tag, "b")
    channel_mockup(bc, ac, "StickVerse", tag, "c")
