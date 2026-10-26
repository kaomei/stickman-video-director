"""Generate the StickVerse channel brand pack (banner, avatar, watermark, end screen)."""

from __future__ import annotations

import math
import random

from PIL import Image, ImageDraw, ImageFilter

from sticklib import (ANTON, ARCHIVO, BEBAS, BONE, CAVEAT, CYAN, GOLD, GREEN, GREY, INK,
                      INK_2, NOTO, RED, ROOT, WHITE, badge, brand_mark, bulb, canvas,
                      draw_stickman, finish, font, glow_shape, measure, noise_overlay,
                      radial_glow, save_png, stripes, text, text_shadow, vignette)

OUT = ROOT / "brand"
SS = 2


def fit_font(draw, s, path, target_w, tracking=0, lo=20, hi=600):
    while lo < hi:
        mid = (lo + hi + 1) // 2
        f = font(path, mid)
        w, _ = measure(draw, s, f, tracking)
        if w <= target_w:
            lo = mid
        else:
            hi = mid - 1
    return font(path, lo)


def star_field(img, n=280, seed=11, alpha=150):
    rnd = random.Random(seed)
    w, h = img.size
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _ in range(n):
        x, y = rnd.uniform(0, w), rnd.uniform(0, h)
        r = rnd.uniform(1.0, 3.4) * (w / 2560)
        a = int(rnd.uniform(0.15, 1.0) * alpha)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, a))
        if rnd.random() < 0.06:  # sparkle cross
            L = r * 5
            d.line([(x - L, y), (x + L, y)], fill=(255, 255, 255, a // 2), width=max(1, int(r / 1.6)))
            d.line([(x, y - L), (x, y + L)], fill=(255, 255, 255, a // 2), width=max(1, int(r / 1.6)))
    img.alpha_composite(layer)


def orbit_rings(img, center, radii, color=(255, 255, 255), alpha=22):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for r in radii:
        d.ellipse([center[0] - r, center[1] - r * 0.42, center[0] + r, center[1] + r * 0.42],
                  outline=(*color, alpha), width=max(2, int(r * 0.006)))
    img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(1.5)))


# ---------------------------------------------------------------------------
def make_lockup(mark_size=170, title_size=132, tag_size=36, sub_size=46,
                color=WHITE, accent=RED, title="STICKVERSE",
                tagline="AI-made stickman stories that stay with you.",
                sub="NEW SHORTS DAILY   \u00b7   DEEP DIVES EVERY FRIDAY",
                pad=24) -> Image.Image:
    """Brand lockup on a transparent bg, cropped to its real ink bounds."""
    W, H = 2600, 900
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    f_title = font(ANTON, title_size)
    f_tag = font(NOTO, tag_size)
    f_sub = font(BEBAS, sub_size)
    tracking = int(title_size * 0.055)

    def metrics(s, f, tr=0):
        if tr:
            w, h = measure(d, s, f, tr)
            return w, h, 0
        tb = d.textbbox((0, 0), s, font=f, anchor="la")
        return tb[2] - tb[0], tb[3], tb[1]

    tw, title_h, title_top = metrics(title, f_title, tracking)
    tag_w, tag_h, _ = metrics(tagline, f_tag)
    sub_w, sub_h, _ = metrics(sub, f_sub, 3)

    gap1 = title_size * 0.26
    rule_h = max(5, int(title_size * 0.055))
    gap2 = title_size * 0.20
    gap3 = title_size * 0.07
    block_h = title_h + gap1 + rule_h + gap2 + tag_h + gap3 + sub_h

    tx = mark_size * 1.10 + 42          # clear of the mark's ring
    top = (H - block_h) / 2
    mark_cx = pad + mark_size / 2
    brand_mark(img, (mark_cx, H / 2), mark_size, color=color, accent=accent)

    y = top
    text(d, (tx, y - title_top), title, f_title, color, tracking=tracking)
    y += title_h + gap1
    d.rounded_rectangle([tx + 4, y, tx + 4 + title_size * 0.92, y + rule_h], radius=rule_h / 2, fill=accent)
    y += rule_h + gap2
    text(d, (tx + 2, y), tagline, f_tag, (206, 209, 222))
    y += tag_h + gap3
    if sub:
        text(d, (tx + 2, y), sub, f_sub, GOLD, tracking=3)

    bbox = img.getbbox()
    return img.crop(bbox)


def make_banner():
    W, H = 2560, 1440
    img, d = canvas(W, H, (*INK, 255), ss=SS)
    w, h = img.size

    # deep-space wash
    radial_glow(img, (w * 0.78, h * 0.46), w * 0.46, RED, alpha=70)
    radial_glow(img, (w * 0.20, h * 0.52), w * 0.34, CYAN, alpha=26)
    radial_glow(img, (w * 0.52, h * 0.50), w * 0.30, (40, 30, 90), alpha=70)
    img.alpha_composite(stripes((w, h), (255, 255, 255), spacing=150, width=3, alpha=10))
    orbit_rings(img, (w * 0.685, h * 0.50), [w * 0.20, w * 0.30, w * 0.41], alpha=24)
    star_field(img, n=420, seed=5)
    noise_overlay(img, amount=8)

    # planet the character stands on (right, outside the mobile safe area)
    px, py = w * 0.882, h * 0.800
    pr = w * 0.098
    glow_shape(img, lambda dd: dd.ellipse([px - pr * 1.05, py - pr * 0.30, px + pr * 1.05, py + pr * 0.30],
                                          fill=(*RED, 90)), blur=40)
    planet = Image.new("RGBA", img.size, (0, 0, 0, 0))
    pd = ImageDraw.Draw(planet)
    pd.ellipse([px - pr, py - pr * 0.30, px + pr, py + pr * 0.30], fill=(24, 24, 34, 255))
    pd.ellipse([px - pr, py - pr * 0.30, px + pr, py + pr * 0.30], outline=(*RED, 220),
               width=int(w * 0.002))
    img.alpha_composite(planet)

    # character standing on the planet
    fig_h = h * 0.40
    origin = (px - fig_h * 0.03, py - pr * 0.26 - fig_h)
    draw_stickman(img, origin, fig_h, pose="point_up", color=WHITE, stroke=w * 0.0075)
    bulb(img, (origin[0] + fig_h * 0.16, origin[1] - fig_h * 0.16), fig_h * 0.075)

    # ---- safe area: 1546 x 423, centred  ->  x 507..2053, y 508..932
    lock = make_lockup(mark_size=int(w * 0.072), title_size=int(w * 0.055),
                       tag_size=int(w * 0.0145), sub_size=int(w * 0.019))
    lock_zone_x0, lock_zone_x1 = w * 0.198, w * 0.745   # keep clear of the character
    lx = int(lock_zone_x0 + ((lock_zone_x1 - lock_zone_x0) - lock.width) / 2)
    ly = int((h - lock.height) / 2)
    img.alpha_composite(lock, (lx, ly))

    vignette(img, strength=190)
    out = finish(img, W, H, SS)
    save_png(out, OUT / "banner-2560x1440.png")
    return out


def make_banner_guide(banner):
    """Same banner with the device crops + safe zone marked (a helper, not for upload)."""
    img = banner.copy().convert("RGBA")
    W, H = img.size
    d = ImageDraw.Draw(img)
    sx, sy, sw, sh = (W - 1546) // 2, (H - 423) // 2, 1546, 423
    d.rectangle([sx, sy, sx + sw, sy + sh], outline=(0, 255, 150, 255), width=6)
    d.rectangle([0, sy, W, sy + sh], outline=(255, 255, 255, 120), width=3)
    f = font(NOTO, 26)
    for label, y, col in [("MOBILE / EVERY DEVICE  ·  1546 x 423", sy - 44, (0, 255, 150, 255)),
                          ("DESKTOP BAND  ·  2560 x 423", sy + sh + 16, (255, 255, 255, 190))]:
        tw, _ = measure(d, label, f)
        x = (W - tw) / 2
        d.rounded_rectangle([x - 18, y - 8, x + tw + 18, y + 38], radius=8, fill=(0, 0, 0, 170))
        text(d, (x, y), label, f, col)
    save_png(img, OUT / "banner-safe-guide.png")
    # what most phones actually show
    crop = banner.crop((sx, sy, sx + sw, sy + sh))
    save_png(crop, OUT / "banner-mobile-crop-1546x423.png")


def make_avatar():
    S = 800
    img, d = canvas(S, S, (*INK, 255), ss=4)
    w, h = img.size
    radial_glow(img, (w * 0.5, h * 0.42), w * 0.62, (60, 40, 120), alpha=120)
    radial_glow(img, (w * 0.5, h * 0.5), w * 0.30, RED, alpha=40)
    star_field(img, n=70, seed=21, alpha=90)
    brand_mark(img, (w * 0.5, h * 0.5), w * 0.78, color=WHITE, accent=RED)
    vignette(img, strength=150)
    save_png(finish(img, S, S, 4), OUT / "profile-800.png")


def make_watermark():
    S = 150
    img, d = canvas(S, S, (0, 0, 0, 0), ss=6)
    w = img.size[0]
    brand_mark(img, (w / 2, w / 2), w * 0.86, color=WHITE, accent=RED)
    save_png(finish(img, S, S, 6), OUT / "watermark-150.png")


def make_endscreen():
    W, H = 1920, 1080
    img, d = canvas(W, H, (*INK, 255), ss=2)
    w, h = img.size
    radial_glow(img, (w * 0.72, h * 0.5), w * 0.55, (45, 30, 95), alpha=110)
    radial_glow(img, (w * 0.20, h * 0.55), w * 0.30, RED, alpha=26)
    star_field(img, n=160, seed=33, alpha=80)
    orbit_rings(img, (w * 0.72, h * 0.5), [w * 0.18, w * 0.27], alpha=18)

    brand_mark(img, (w * 0.072, h * 0.105), w * 0.040, color=WHITE, accent=RED)
    d2 = ImageDraw.Draw(img)
    text(d2, (w * 0.100, h * 0.070), "STICKVERSE", font(ANTON, int(w * 0.028)), WHITE,
         tracking=int(w * 0.0015))
    text(d2, (w * 0.101, h * 0.114), "KEEP THE STORY GOING", font(BEBAS, int(w * 0.0145)), GOLD,
         tracking=int(w * 0.001))

    # reserved pick-up zones: YouTube draws the actual video / subscribe elements here
    f_dash = font(NOTO, int(w * 0.0105))
    zones = [("VIDEO ELEMENT", w * 0.505, h * 0.235, w * 0.445, h * 0.245),
             ("SUBSCRIBE / PLAYLIST", w * 0.505, h * 0.525, w * 0.445, h * 0.245)]
    for label, x, y, zw, zh in zones:
        d2.rounded_rectangle([x, y, x + zw, y + zh], radius=18, outline=(255, 255, 255, 55), width=4)
        tw, th = measure(d2, label, f_dash)
        text(d2, (x + zw / 2, y + zh / 2), label, f_dash, (255, 255, 255, 70), anchor="mm")

    # character waving in the empty left third
    draw_stickman(img, (w * 0.19, h * 0.44), h * 0.32, pose="open", color=WHITE, stroke=w * 0.0055)
    bulb(img, (w * 0.255, h * 0.415), w * 0.019)

    vignette(img, strength=170)
    save_png(finish(img, W, H, 2), OUT / "endscreen-1920x1080.png")


def make_logo_pngs():
    for name, size in [("logo-mark-1024.png", 1024), ("logo-mark-512.png", 512)]:
        img, d = canvas(size, size, (0, 0, 0, 0), ss=2)
        brand_mark(img, (size, size), size * 0.86, color=WHITE, accent=RED)
        # brand_mark expects centre -> rebuild at proper centre
        img, d = canvas(size, size, (0, 0, 0, 0), ss=2)
        brand_mark(img, (size, size), size * 0.86, color=WHITE, accent=RED)
        save_png(finish(img, size, size, 2), OUT / name)


if __name__ == "__main__":
    print("StickVerse brand pack")
    banner = make_banner()
    make_banner_guide(banner)
    make_avatar()
    make_watermark()
    make_endscreen()
    print("done")
