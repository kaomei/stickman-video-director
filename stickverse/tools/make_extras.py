"""Extra brand material.

1. brand/brand-guide.png  -- one-page identity sheet (logo, palette, type, rules)
2. thumbnails/ab-test/    -- three thumbnail variants of the same video, for Test & Compare
"""

from __future__ import annotations

import math

from PIL import Image, ImageDraw, ImageFilter

from sticklib import (ANTON, ARCHIVO, BEBAS, BONE, CAVEAT, CYAN, GOLD, GREEN, GREY, INK, INK_2,
                      NOTO, RED, ROOT, WHITE, arrow, badge, brand_mark, bulb, draw_stickman,
                      finish, font, glow_shape, measure, radial_glow, save_jpg, save_png,
                      stripes, text, text_shadow, vignette)
from make_thumbnails import THUMB, TH, TW, SS, dark_bg, kicker, logo_bug, stack, under_last

BRAND = ROOT / "brand"


# ---------------------------------------------------------------------------
def brand_guide():
    W, H = 1920, 2400
    img = Image.new("RGBA", (W, H), (12, 12, 16, 255))
    radial_glow(img, (W * 0.18, H * 0.08), W * 0.5, (60, 40, 110), alpha=45)
    d = ImageDraw.Draw(img)
    pad = W * 0.06

    # header
    brand_mark(img, (pad + 44, 90), 88, color=WHITE, accent=RED)
    d = ImageDraw.Draw(img)
    text(d, (pad + 112, 52), "STICKVERSE", font(ANTON, 74), WHITE, tracking=5)
    text(d, (pad + 114, 148), "BRAND GUIDE  ·  v1  ·  October 2026", font(BEBAS, 34), GREY,
         tracking=3)

    def section(y, label):
        d.line([(pad, y), (W - pad, y)], fill=(255, 255, 255, 40), width=2)
        text(d, (pad, y + 24), label.upper(), font(BEBAS, 36), RED, tracking=6)
        return y + 86

    # --- logo
    y = section(300, "01  The mark")
    d.rounded_rectangle([pad, y, pad + 300, y + 300], radius=18, fill=(255, 255, 255, 10))
    brand_mark(img, (pad + 150, y + 150), 230, color=WHITE, accent=RED)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([pad + 340, y, pad + 640, y + 300], radius=18, fill=(246, 241, 228, 255))
    d = ImageDraw.Draw(img)
    brand_mark(img, (pad + 490, y + 150), 230, color=INK, accent=RED)
    d = ImageDraw.Draw(img)
    text(d, (pad + 700, y + 30), "Primary lockup: white figure, red orbital arc.", font(NOTO, 30),
         (215, 216, 226))
    text(d, (pad + 700, y + 86), "Dark backgrounds only for the primary mark.", font(NOTO, 30),
         (215, 216, 226))
    text(d, (pad + 700, y + 142), "Never: outline the ring in red, add eyes, rotate, or", font(NOTO, 30),
         (215, 216, 226))
    text(d, (pad + 700, y + 198), "place it on a busy photograph.", font(NOTO, 30), (215, 216, 226))

    # --- character
    y = section(680, "02  The character")
    d.rounded_rectangle([pad, y, W - pad, y + 420], radius=18, fill=(255, 255, 255, 8))
    poses = [("open", "OPEN"), ("think", "THINK"), ("push", "PUSH"),
             ("point_up", "POINT UP"), ("sit", "SIT"), ("crossed", "CROSSED")]
    slot = (W - pad * 2) / len(poses)
    for i, (pose, label) in enumerate(poses):
        cx = pad + slot * (i + 0.5)
        draw_stickman(img, (cx, y + 40), 265, pose=pose, color=WHITE, stroke=6.5, band=RED)
        text(ImageDraw.Draw(img), (cx, y + 320), label, font(BEBAS, 28), GREY, anchor="ma",
             tracking=3)
    text(d, (pad + 10, y + 372), "Red wristband on the left wrist in every frame. Hollow head, "
         "no face, 4.5 heads tall.", font(NOTO, 28), (200, 202, 214))

    # --- palette
    y = section(1230, "03  Palette")
    swatches = [("INK", "#0A0A0E", INK), ("PAPER", "#FAF6EC", (250, 246, 236)),
                ("SIGNAL RED", "#FF2D2D", RED), ("GOLD", "#FFC43D", GOLD),
                ("CYAN", "#40E0FF", CYAN), ("MONEY", "#3CDC8C", (60, 220, 140))]
    sw = (W - pad * 2) / len(swatches)
    for i, (name, hexv, col) in enumerate(swatches):
        x0 = pad + sw * i
        d.rounded_rectangle([x0, y, x0 + sw - 18, y + 150], radius=14, fill=(*col, 255),
                            outline=(255, 255, 255, 40), width=2)
        text(d, (x0, y + 172), name, font(BEBAS, 30), WHITE, tracking=3)
        text(d, (x0, y + 208), hexv, font(NOTO, 24), GREY)

    d2 = ImageDraw.Draw(img)
    text(d2, (pad, y + 262), "One accent colour per frame. Red = threat / psychology. Gold = money / "
         "win. Cyan = tech.", font(NOTO, 28), (200, 202, 214))

    # --- type
    y = section(1600, "04  Typography")
    text(d, (pad, y), "ANTON", font(ANTON, 96), WHITE, tracking=2)
    text(d, (pad + 420, y + 26), "Thumbnails + video headlines. All caps, tracking +2%.",
         font(NOTO, 28), (200, 202, 214))
    text(d, (pad, y + 130), "BEBAS NEUE", font(BEBAS, 74), WHITE, tracking=3)
    text(d, (pad + 420, y + 168), "Labels, kickers, stats, schedule lines.", font(NOTO, 28),
         (200, 202, 214))
    text(d, (pad, y + 236), "Caveat — the human footnote", font(CAVEAT, 66), GOLD)
    text(d, (pad + 760, y + 258), "One script note per thumbnail, never more.", font(NOTO, 28),
         (200, 202, 214))
    text(d, (pad, y + 336), "Noto Sans — body, captions, descriptions", font(NOTO, 40),
         (235, 235, 240))

    # --- rules
    y = section(2060, "05  Thumbnail rules")
    rules = [
        "Left third = text. Right two thirds = character.",
        "6 words maximum. Two lines maximum, 0.9 leading.",
        "One idea per thumbnail. If it needs 'and', delete half.",
        "Must read at 320 x 180 px on a phone.",
        "No text in the bottom-right corner (duration stamp).",
        "Logo bug bottom-left, ~30% opacity, 15% of frame max.",
    ]
    for i, r in enumerate(rules):
        yy = y + i * 40
        d.ellipse([pad, yy + 12, pad + 12, yy + 24], fill=RED)
        text(d, (pad + 34, yy), r, font(NOTO, 30), (222, 224, 232))

    vignette(img, strength=120)
    out = finish(img, W, H, 1)
    save_png(out, BRAND / "brand-guide.png")


# ---------------------------------------------------------------------------
def ab_variant(tag, lines, pose, accent, badge_text="PSYCHOLOGY", head_fill=(14, 14, 20)):
    w, h = TW * SS, TH * SS
    img = dark_bg(w, h, seed=7, glow=accent, glow_pos=(0.70, 0.42), glow_r=0.62)
    d = ImageDraw.Draw(img)

    x = w * 0.055
    kicker(d, x, h * 0.095, badge_text, w, colour=accent if accent != GOLD else (196, 140, 20))
    size = int(w * 0.104)
    stack(img, lines, x, h * 0.205, size, fill=WHITE, leading=0.895)

    draw_stickman(img, (w * 0.705, h * 0.285), h * 0.62, pose=pose, color=WHITE,
                  stroke=w * 0.0072, head_fill=head_fill)
    bulb(img, (w * 0.705 + w * 0.075, h * 0.285 - h * 0.055), w * 0.045)

    logo_bug(img)
    vignette(img, strength=175)
    out = finish(img, TW, TH, SS)
    save_jpg(out, THUMB / "ab-test" / f"{tag}.jpg")
    return out


def ab_sheet(paths):
    cols = len(paths)
    cw, ch = 520, 293
    pad = 24
    W = cols * cw + pad * (cols + 1)
    H = ch + pad * 2 + 46
    sheet = Image.new("RGB", (W, H), (16, 16, 20))
    d = ImageDraw.Draw(sheet)
    for i, p in enumerate(paths):
        im = Image.open(p).convert("RGB").resize((cw, ch), Image.LANCZOS)
        x = pad + i * (cw + pad)
        sheet.paste(im, (x, pad))
        label = ["A · pose + bulb", "B · arms crossed", "C · point up"][i]
        text(d, (x + 6, pad + ch + 12), label, font(BEBAS, 26), (210, 210, 220), tracking=2)
    out = THUMB / "ab-test" / "ab-trio.png"
    sheet.save(out, optimize=True)
    print(f"  wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    print("Extras")
    brand_guide()
    ab_variant("a-think", ["YOUR BRAIN", "LIES TO", "YOU"], "think", RED)
    ab_variant("b-crossed", ["YOUR BRAIN", "LIES TO", "YOU"], "crossed", GOLD)
    ab_variant("c-point", ["YOUR BRAIN", "LIES TO", "YOU"], "point_up", CYAN)
    ab_sheet([THUMB / "ab-test" / "a-think.jpg", THUMB / "ab-test" / "b-crossed.jpg",
              THUMB / "ab-test" / "c-point.jpg"])
