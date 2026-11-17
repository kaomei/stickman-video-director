"""B7 sample-derived drawing primitives, not a story renderer.

Python 3.9+ and Pillow 9.1+. No project-local imports, fonts, network or generation.
Coordinates are logical pixels; pose geometry stays floating-point until drawing.
Adapted from the user's approved white-C actor and bitmap type implementations.
"""

import argparse
import math
from pathlib import Path

from PIL import Image, ImageDraw

INK = "#080e1c"
LIMB_INK = "#0c101c"
CREAM = "#fff0cc"
TEAL = "#71c4c0"
WHITE = "#ffffff"
BAYER = ((0, 8, 2, 10), (12, 4, 14, 6), (3, 11, 1, 9), (15, 7, 13, 5))

# Exact accepted Latin bitmap alphabet. No operating-system font fallback.
GLYPHS = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["111", "010", "010", "010", "010", "010", "111"],
    "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
    "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["010", "110", "010", "010", "010", "010", "111"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
    "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
    ":": ["0", "1", "1", "0", "1", "1", "0"],
    "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
    " ": ["000", "000", "000", "000", "000", "000", "000"],
    "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
    "'": ["1", "1", "0", "0", "0", "0", "0"],
    "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
    ".": ["0", "0", "0", "0", "0", "0", "1"],
    ",": ["00", "00", "00", "00", "00", "01", "10"],
    "!": ["1", "1", "1", "1", "1", "0", "1"],
    "-": ["000", "000", "000", "111", "000", "000", "000"],
}


def _scale(value):
    if type(value) is not int or value < 1:
        raise ValueError("Pixel scale must be a positive integer")
    return value


def _text(value, glyphs):
    if not isinstance(value, str) or any(c in value for c in "\n\r\t"):
        raise ValueError("Pass one semantic subtitle line, not wrapping or tab characters")
    value = value.upper()
    for char in value:
        if char not in glyphs:
            raise ValueError(f"Missing bitmap glyph {char!r}; supply an explicit pixel font for this language")
        rows = glyphs[char]
        if not rows or not rows[0] or any(len(r) != len(rows[0]) or set(r) - {"0", "1"} for r in rows):
            raise ValueError(f"Invalid rectangular bitmap for {char!r}")
    return value


def text_size(value, scale=1, glyphs=None):
    glyphs = GLYPHS if glyphs is None else glyphs
    scale = _scale(scale)
    value = _text(value, glyphs)
    width = max(0, sum(len(glyphs[c][0]) + 1 for c in value) - 1)
    return width * scale, max((len(glyphs[c]) for c in value), default=0) * scale


def draw_label(draw, xy, value, color=CREAM, scale=1, shadow=True, glyphs=None):
    glyphs = GLYPHS if glyphs is None else glyphs
    scale = _scale(scale)
    value = _text(value, glyphs)
    x, y = map(round, xy)
    if shadow:
        draw_label(draw, (x + scale, y + scale), value, INK, scale, False, glyphs)
    for char in value:
        rows = glyphs[char]
        for yy, row in enumerate(rows):
            for xx, bit in enumerate(row):
                if bit == "1":
                    sx, sy = x + xx * scale, y + yy * scale
                    draw.rectangle((sx, sy, sx + scale - 1, sy + scale - 1), fill=color)
        x += (len(rows[0]) + 1) * scale


def draw_caption(image, value, y=165, margin=14, color=CREAM, scale=1, glyphs=None):
    """Default sample preset; fail on overflow, never split, wrap or shrink speech."""
    width, height = text_size(value, scale, glyphs)
    scale = _scale(scale)
    if type(margin) is not int or margin < 0 or type(y) is not int:
        raise ValueError("Caption margin/y must be logical integer pixels")
    if width + scale > image.width - 2 * margin:
        raise ValueError("Caption exceeds safe width: choose an earlier semantic speech boundary")
    if y < 0 or y + height + scale > image.height:
        raise ValueError("Caption and shadow exceed the canvas")
    x = (image.width - width - scale) // 2
    draw_label(ImageDraw.Draw(image), (x, y), value, color, scale, True, glyphs)
    return x, y, width + scale, height + scale


def upscale(image, scale):
    scale = _scale(scale)
    return image.resize((image.width * scale, image.height * scale), Image.Resampling.NEAREST)


def two_bone(root, tip, upper, lower, bend=1):
    """Fixed-length IK, solved before rasterization; reject impossible contacts."""
    if bend not in (-1, 1) or not all(math.isfinite(v) for v in (*root, *tip, upper, lower)):
        raise ValueError("Finite geometry and bend -1/+1 required")
    dx, dy = tip[0] - root[0], tip[1] - root[1]
    distance = math.hypot(dx, dy)
    if min(upper, lower) <= 0 or not abs(upper - lower) < distance < upper + lower:
        raise ValueError("Unreachable endpoint: move the body/object, never stretch a limb")
    along = (upper * upper - lower * lower + distance * distance) / (2 * distance)
    height = math.sqrt(max(0, upper * upper - along * along))
    ux, uy = dx / distance, dy / distance
    return root[0] + along * ux - bend * height * uy, root[1] + along * uy + bend * height * ux


HAND_POSES = {
    "idle": {"left": (-2, 14.4), "right": (2, 14.4)},
    "reach": {"left": (-3, 13.8), "right": (13.7, 3)},
    "shield": {"left": (-6, 11), "right": (8, -5)},
    "brace": {"left": (-9, 5), "right": (10, 3)},
    "map": {"left": (6, 10), "right": (12, 4)},
    "sad": {"left": (-2, 14.4), "right": (5, 12.5)},
    "point": {"left": (-3, 14), "right": (13, -3)},
}


def make_pose(hip, mode="idle", look=1, lean=0, feet=None, hand_offsets=None, knee_bends=None):
    """Pose primitive, not a walk loop. Supply planted/swing feet per story action.

    Feet are world coordinates; hand offsets are shoulder-local and mirrored by look.
    Accessories/props must follow the returned named anchors, not screen positions.
    Resting knees bend outward. A staged walk/crouch can explicitly set each bend;
    this function does not implement footfall timing or a walk cycle.
    """
    if look not in (-1, 1) or mode not in HAND_POSES:
        raise ValueError("Choose look -1/+1 and a supported pose")
    if not all(math.isfinite(v) for v in (*hip, lean)):
        raise ValueError("Finite hip and lean required")
    shoulder = (hip[0] + 12 * math.sin(lean), hip[1] - 12 * math.cos(lean))
    p = {"hip": tuple(hip), "shoulder": shoulder,
         "head": (shoulder[0] + 8 * math.sin(lean), shoulder[1] - 8 * math.cos(lean))}
    targets = dict(HAND_POSES[mode])
    if hand_offsets:
        if set(hand_offsets) - {"left", "right"}:
            raise ValueError("Unknown hand")
        targets.update(hand_offsets)
    foot_targets = {"left": (hip[0] - 2, hip[1] + 17.85), "right": (hip[0] + 2, hip[1] + 17.85)}
    if feet is not None:
        if set(feet) != {"left", "right"}:
            raise ValueError("Supply both planted/swing feet")
        foot_targets = feet
    if knee_bends is not None and (set(knee_bends) != {"left", "right"} or
                                   any(type(v) is not int or v not in (-1, 1) for v in knee_bends.values())):
        raise ValueError("Supply left/right knee bends as -1/+1")
    for side in ("left", "right"):
        p[side + "_foot"] = tuple(foot_targets[side])
        bend = (knee_bends[side] if knee_bends is not None else
                1 if p[side + "_foot"][0] < hip[0] else -1)
        p[side + "_knee"] = two_bone(p["hip"], p[side + "_foot"], 9, 9, bend)
        dx, dy = targets[side]
        p[side + "_hand"] = (shoulder[0] + dx * look, shoulder[1] + dy)
        p[side + "_elbow"] = two_bone(shoulder, p[side + "_hand"], 7.3, 7.3, -look if side == "right" else look)
    return p


def anchored_points(pose, anchor, offsets):
    """Attach prop/accessory vertices to a body anchor; quantize only at drawing."""
    x, y = pose[anchor]
    return [(x + dx, y + dy) for dx, dy in offsets]


def _points(points):
    return [tuple(map(round, point)) for point in points]


def limb(draw, points, far=False):
    points = _points(points)
    draw.line([(x + 1, y) for x, y in points], fill=LIMB_INK, width=1)
    draw.line(points, fill="#c7cbd2" if far else WHITE, width=1)


def draw_actor(image, pose, look=1, expression="neutral", blink=False):
    """Bare calibration body. Story renderer adds 1–2 meaningful anchored accessories."""
    if look not in (-1, 1) or expression not in ("neutral", "happy", "shock", "sad"):
        raise ValueError("Unsupported face; implement an explicit pixel expression")
    d = ImageDraw.Draw(image)
    for side in ("right", "left"):
        limb(d, [pose["hip"], pose[side + "_knee"], pose[side + "_foot"]], side == "right")
        x, y = _points([pose[side + "_foot"]])[0]
        d.line((x - 2, y, x + 2, y), fill="#c7cbd1" if side == "right" else WHITE)
    limb(d, [pose["hip"], pose["shoulder"], (pose["head"][0], pose["head"][1] + 4)])
    for side in ("right", "left"):
        limb(d, [pose["shoulder"], pose[side + "_elbow"], pose[side + "_hand"]], side == "right")
    x, y = _points([pose["head"]])[0]
    d.ellipse((x - 5, y - 5, x + 5, y + 5), fill=INK)
    d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=WHITE)
    for ex in (-2, 2):
        d.line((x + ex - 1, y, x + ex + 1, y), fill=INK)
        if not blink:
            d.point((x + ex + look, y + 1), fill=INK)
    if expression == "shock":
        d.rectangle((x, y + 3, x + 1, y + 4), fill=INK)
    elif expression == "happy":
        d.line([(x - 2, y + 2), (x - 1, y + 3), (x + 1, y + 3), (x + 2, y + 2)], fill=INK)
    elif expression == "sad":
        # Raised inner brows and downturned mouth stay on the native pixel grid.
        d.line([(x - 3, y - 1), (x - 1, y - 2)], fill=INK)
        d.line([(x + 1, y - 2), (x + 3, y - 1)], fill=INK)
        d.line([(x - 2, y + 3), (x - 1, y + 2), (x + 1, y + 2), (x + 2, y + 3)], fill=INK)
    else:
        d.line((x - 1, y + 3, x + 2, y + 3), fill=INK)


def calibration():
    """Technical still only: font, body poses, grip and fixed-foot calibration."""
    image = Image.new("RGB", (320, 180), "#29223e")
    d = ImageDraw.Draw(image)
    draw_label(d, (14, 13), "B7: PIXEL / POSE CHECK")
    draw_label(d, (14, 30), "I'M HERE. A/B/C + 20!", TEAL)
    for index, (mode, face) in enumerate((("idle", "neutral"), ("reach", "shock"), ("shield", "happy"), ("sad", "neutral"))):
        p = make_pose((42 + 77 * index, 119), mode)
        draw_actor(image, p, expression=face)
        # Technical grip marker follows the actual wrist. Not an identity accessory.
        d.line(_points(anchored_points(p, "right_hand", [(0, 0), (7, -2)])), fill=TEAL)
        draw_label(d, (20 + 77 * index, 146), mode)
    draw_caption(image, "ONE GRID. NO FONT FALLBACK.")
    return image


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--calibration", type=Path, required=True, help="Technical PNG output, not a new-story video")
    args = parser.parse_args()
    args.calibration.parent.mkdir(parents=True, exist_ok=True)
    upscale(calibration(), 3).save(args.calibration)
