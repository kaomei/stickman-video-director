#!/usr/bin/env python3
"""Portable B8 compositor for authored, whole drawn cels.

This module never generates artwork or articulates limbs. Coordinates are design
pixels. Layer x/y locate its normalized anchor; rotation is in radians. Camera
start/end are [screen translation x, screen translation y, uniform zoom], with
translation and zoom attenuated by layer depth. Key times are shot-relative.
State cels and material overlays must be registered on the same source canvas.
The renderer is deterministic from (plan, assets, absolute time).
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from collections import OrderedDict
from functools import partial

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

# Also support importlib-based callers that load this file without putting the
# scripts directory on sys.path, including direct file imports in tests.
_caption_spec = importlib.util.spec_from_file_location("_b8_captions", Path(__file__).with_name("b8_captions.py"))
_caption_support = importlib.util.module_from_spec(_caption_spec)
_caption_spec.loader.exec_module(_caption_support)


def _finite(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def _unit_pair(value):
    return isinstance(value, list) and len(value) == 2 and all(_finite(n) and 0 <= n <= 1 for n in value)


def _lookup(mapping, key):
    return mapping.get(key) if isinstance(key, str) else None


def _file(base, value):
    if not isinstance(value, str) or not value or "://" in value:
        raise ValueError("asset path must be a relative local file")
    p = Path(value)
    if p.is_absolute():
        raise ValueError("asset path must be relative for portable projects")
    root = Path(base).resolve()
    resolved = (root / p).resolve()
    if not resolved.is_relative_to(root):
        raise ValueError("asset path escapes project directory")
    if not resolved.is_file():
        raise ValueError(f"asset file missing: {value}")
    return resolved


def _caption_font(plan, base):
    style = plan["caption_style"]
    location = _file(base, style.get("font"))
    if hashlib.sha256(location.read_bytes()).hexdigest() != style.get("font_sha256"):
        raise ValueError("caption font SHA-256 mismatch")
    index = style.get("font_index", 0)
    if not isinstance(index, int) or isinstance(index, bool) or index < 0:
        raise ValueError("caption font_index must be a nonnegative integer")
    return ImageFont.truetype(str(location), style["size"], index=index)


def _caption_errors(plan, base):
    errors = []
    captions = plan.get("captions", [])
    if not isinstance(captions, list):
        return ["captions must be an array"]
    if not captions:
        return errors
    style = plan.get("caption_style")
    if not isinstance(style, dict):
        return ["nonempty captions require a caption_style with portable font"]
    for field, default in (("color", [255, 255, 255]), ("stroke_color", [30, 20, 15])):
        value = style.get(field, default)
        if not isinstance(value, list) or len(value) != 3 or not all(isinstance(n, int) and not isinstance(n, bool) and 0 <= n <= 255 for n in value):
            errors.append(f"caption_style {field} must be [R,G,B] integers")
    size, stroke = style.get("size"), style.get("stroke_width", 1)
    if not isinstance(size, int) or isinstance(size, bool) or size < 8:
        errors.append("caption_style size must be an integer >=8")
    if not isinstance(stroke, int) or isinstance(stroke, bool) or not 0 <= stroke <= 10:
        errors.append("caption_style stroke_width must be an integer in 0..10")
    width, height = plan.get("width"), plan.get("height")
    if not _finite(width) or not _finite(height) or width <= 0 or height <= 0:
        return errors + ["caption bounds require valid frame dimensions"]
    max_width, y = style.get("max_width", width * 0.9), style.get("y", height - 30)
    if not _finite(max_width) or not 0 < max_width <= width:
        errors.append("caption_style max_width outside frame")
    if not _finite(y) or not 0 <= y <= height:
        errors.append("caption_style baseline y outside frame")
    font = None
    try:
        font = _caption_font(plan, base)
    except (KeyError, TypeError, ValueError, OSError) as exc:
        errors.append(f"caption font: {exc}")
    previous = 0
    for cue_index, cue in enumerate(captions, 1):
        label = f"caption cue {cue_index}"
        if not isinstance(cue, dict):
            errors.append(f"{label} must be an object")
            continue
        start, end = cue.get("start"), cue.get("end")
        if not _finite(start) or not _finite(end) or not _finite(plan.get("duration")) or not 0 <= start < end <= plan["duration"] or start < previous - 1e-9:
            errors.append(f"{label}: caption cues must be ordered, nonoverlapping and inside duration")
        else:
            previous = end
        text = cue.get("text")
        text_errors = _caption_support.caption_text_errors(text)
        if text_errors:
            errors.extend(f"{label}: {error}" for error in text_errors)
            continue
        if font:
            try:
                _caption_support.assert_font_coverage(_file(base, style.get("font")), text, font_index=style.get("font_index", 0))
            except (ValueError, OSError) as exc:
                errors.append(f"{label}: {exc}")
            if _finite(max_width) and isinstance(stroke, int) and not isinstance(stroke, bool) and 0 <= stroke <= 10 and _finite(y):
                try:
                    left, top, right, bottom = font.getbbox(text, anchor="ms", stroke_width=stroke)
                    if right - left > max_width:
                        errors.append(f"{label}: caption exceeds max_width; regroup by meaning/actual pause, never shrink")
                    # Account for asymmetric bearings as well as width. The
                    # configured max_width is the centered horizontal safe area.
                    if left < -max_width / 2 or right > max_width / 2:
                        errors.append(f"{label}: caption glyph bounds outside centered max_width safe area")
                    if width / 2 + left < 0 or width / 2 + right > width or y + top < 0 or y + bottom > height:
                        errors.append(f"{label}: caption glyph bounds outside frame")
                except (ValueError, OSError) as exc:
                    errors.append(f"{label}: cannot measure caption glyph bounds: {exc}")
    return errors


def validate_plan(plan, base):
    """Return structural/media-integrity errors; never an aesthetic pass."""
    errors = []
    if not isinstance(plan, dict) or plan.get("schema_version") != 1 or plan.get("style") != "B8":
        return ["expected schema_version 1, style B8 scene plan"]
    for field in ("width", "height"):
        n = plan.get(field)
        if not isinstance(n, int) or isinstance(n, bool) or not 16 <= n <= 8192:
            errors.append(f"{field} must be an integer between 16 and 8192")
    for field in ("fps", "duration"):
        if not _finite(plan.get(field)) or plan[field] <= 0:
            errors.append(f"{field} must be positive and finite")
    if _finite(plan.get("fps")) and plan["fps"] > 120:
        errors.append("fps must not exceed 120")
    assets = plan.get("assets")
    if not isinstance(assets, dict) or not assets:
        return errors + ["assets must be a nonempty map"]
    sizes = {}
    for ident, record in assets.items():
        label = f"asset {ident}"
        if not isinstance(ident, str) or not ident or not isinstance(record, dict):
            errors.append(f"{label}: invalid asset entry")
            continue
        if record.get("kind") not in {"background", "cel", "prop", "mask"}:
            errors.append(f"{label}: invalid kind")
        if record.get("kind") == "cel" and record.get("whole_pose") is not True:
            errors.append(f"{label}: drawn cel requires whole_pose true")
        if record.get("kind") == "cel" and not record.get("character_id"):
            errors.append(f"{label}: character_id required")
        try:
            location = _file(base, record.get("path"))
            digest = hashlib.sha256(location.read_bytes()).hexdigest()
            if record.get("sha256") != digest:
                errors.append(f"{label}: SHA-256 mismatch")
            with Image.open(location) as image:
                image.load()
                sizes[ident] = image.size
        except (ValueError, OSError, Image.DecompressionBombError) as exc:
            errors.append(f"{label}: {exc}")
    shots = plan.get("shots")
    if not isinstance(shots, list) or not shots:
        return errors + ["shots must be nonempty"]
    cursor, shot_ids = 0, set()
    for shot in shots:
        if not isinstance(shot, dict):
            errors.append("shot must be an object")
            continue
        sid = shot.get("id")
        if not isinstance(sid, str) or not sid or sid in shot_ids:
            errors.append("missing or duplicate shot id")
        if isinstance(sid, str):
            shot_ids.add(sid)
        label = f"shot {sid}"
        start, end = shot.get("start"), shot.get("end")
        if not _finite(start) or not _finite(end) or end <= start or abs(start - cursor) > 1e-6:
            errors.append(f"{label}: shots must cover timeline in order without gaps/overlap")
            continue
        cursor, duration = end, end - start
        for field in ("scene", "framing", "information_change"):
            if not isinstance(shot.get(field), str) or not shot[field].strip():
                errors.append(f"{label}: {field} required")
        camera = shot.get("camera", {})
        if not isinstance(camera, dict):
            errors.append(f"{label}: camera must be an object")
            camera = {}
        for key in ("start", "end"):
            v = camera.get(key, [0, 0, 1])
            if not isinstance(v, list) or len(v) != 3 or not all(_finite(n) for n in v) or v[2] <= 0:
                errors.append(f"{label}: camera {key} needs [x,y,positive zoom]")
        stop = camera.get("stop_at", duration)
        if not _finite(stop) or not 0 <= stop <= duration:
            errors.append(f"{label}: camera stop_at outside shot")
        elif stop == 0 and camera.get("start", [0, 0, 1]) != camera.get("end", camera.get("start", [0, 0, 1])):
            errors.append(f"{label}: zero camera stop requires a fixed camera")
        layers = shot.get("layers")
        if not isinstance(layers, list) or len(layers) < 2:
            errors.append(f"{label}: at least two independent drawn layers required; flat-image push/pan is insufficient")
            continue
        ids, picture_assets, local_action = set(), set(), False
        for layer in layers:
            if not isinstance(layer, dict):
                errors.append(f"{label}: layer must be an object")
                continue
            lid = layer.get("id")
            if not isinstance(lid, str) or not lid or lid in ids:
                errors.append(f"{label}: missing or duplicate layer id")
            if isinstance(lid, str):
                ids.add(lid)
            ll = f"{label} layer {lid}"
            asset = _lookup(assets, layer.get("asset"))
            if not isinstance(asset, dict):
                errors.append(f"{ll}: unknown asset")
                continue
            if asset.get("kind") == "mask":
                errors.append(f"{ll}: mask cannot be a visible picture layer")
            else:
                picture_assets.add(layer["asset"])
            for forbidden in ("scaleX", "scaleY", "joints", "bones", "ik", "stretch", "height"):
                if forbidden in layer:
                    errors.append(f"{ll}: {forbidden} unsupported; preserve whole drawn pose and aspect")
            for field in ("x", "y", "width"):
                if not _finite(layer.get(field)) or field == "width" and layer[field] <= 0:
                    errors.append(f"{ll}: finite {field} required; width must be positive")
            for field, default in (("depth", 1), ("z", 0), ("rotation", 0), ("scale", 1), ("opacity", 1)):
                value = layer.get(field, default)
                if not _finite(value) or field in {"depth", "opacity"} and not 0 <= value <= 1 or field == "scale" and value <= 0:
                    errors.append(f"{ll}: invalid {field}")
            if not _unit_pair(layer.get("anchor", [0.5, 0.5])):
                errors.append(f"{ll}: anchor must be normalized [x,y]")
            keys = layer.get("keyframes", [])
            previous, effective = -1, {}
            if not isinstance(keys, list):
                errors.append(f"{ll}: keyframes must be an array")
                keys = []
            for key in keys:
                if not isinstance(key, dict):
                    errors.append(f"{ll}: invalid keyframe")
                    continue
                kt = key.get("time")
                if not _finite(kt) or not 0 <= kt <= duration or kt <= previous:
                    errors.append(f"{ll}: keyframe times must strictly increase inside shot")
                else:
                    previous = kt
                for field, value in key.items():
                    if field not in {"time", "x", "y", "rotation", "scale", "opacity"}:
                        errors.append(f"{ll}: unsupported keyframe property {field}")
                    elif not _finite(value) or field == "scale" and value <= 0 or field == "opacity" and not 0 <= value <= 1:
                        errors.append(f"{ll}: invalid keyframe {field}")
                    elif field != "time":
                        initial = effective.get(field, layer.get(field, 1 if field in {"scale", "opacity"} else 0))
                        if _finite(kt) and kt > 0 and field != "opacity" and abs(value - initial) > 1e-8:
                            local_action = local_action or asset.get("kind") in {"cel", "prop"}
                        effective[field] = value
            states = layer.get("states", [])
            if not isinstance(states, list):
                errors.append(f"{ll}: states must be an array")
                states = []
            previous = -1
            for state in states:
                if not isinstance(state, dict):
                    errors.append(f"{ll}: invalid state")
                    continue
                at = state.get("at")
                other = _lookup(assets, state.get("asset"))
                if not _finite(at) or not 0 <= at <= duration or at <= previous:
                    errors.append(f"{ll}: state times must strictly increase inside shot")
                else:
                    previous = at
                if not isinstance(other, dict):
                    errors.append(f"{ll}: unknown state asset")
                elif other.get("kind") != asset.get("kind") or other.get("character_id") != asset.get("character_id") or sizes.get(state["asset"]) != sizes.get(layer["asset"]):
                    errors.append(f"{ll}: state must preserve registered canvas, kind and character identity")
                if _finite(at) and at > 0 and state.get("asset") != layer["asset"]:
                    local_action = local_action or asset.get("kind") in {"cel", "prop"}
            material = layer.get("material")
            if material is not None:
                if not isinstance(material, dict):
                    errors.append(f"{ll}: material must be an object")
                    continue
                ms, me = material.get("start"), material.get("end")
                if not _finite(ms) or not _finite(me) or not 0 <= ms < me <= duration:
                    errors.append(f"{ll}: material interval must fit shot")
                if not _unit_pair(material.get("origin")):
                    errors.append(f"{ll}: material needs normalized contact origin")
                for field in ("asset", "mask"):
                    aid = material.get(field)
                    if not isinstance(aid, str) or aid not in assets or sizes.get(aid) != sizes.get(layer["asset"]):
                        errors.append(f"{ll}: material {field} must use registered source canvas")
                if (_lookup(assets, material.get("mask")) or {}).get("kind") != "mask":
                    errors.append(f"{ll}: material mask asset must have kind mask")
                if (_lookup(assets, material.get("asset")) or {}).get("character_id") != asset.get("character_id"):
                    errors.append(f"{ll}: material must preserve character identity")
                local_action = local_action or asset.get("kind") in {"cel", "prop"}
        if len(picture_assets) < 2:
            errors.append(f"{label}: independent picture assets required")
        # Duration is not a choreography quota: still reactions and purposeful
        # reveals can be valid. Record the authored reason so a later reviewer
        # can assess it; this declaration itself earns no visual-quality pass.
        if not local_action and not any(isinstance(shot.get(field), str) and shot[field].strip()
                                        for field in ("hold_reason", "information_progression")):
            errors.append(f"{label}: no local picture change; record hold_reason or information_progression for actual review")
    if _finite(plan.get("duration")) and abs(cursor - plan["duration"]) > 1e-6:
        errors.append("shots must cover complete duration")
    errors.extend(_caption_errors(plan, base))
    return errors


def _smooth(p):
    p = max(0.0, min(1.0, p))
    return p * p * (3.0 - 2.0 * p)


def _at(layer, t):
    result = {key: layer.get(key, default) for key, default in (("x", 0), ("y", 0), ("rotation", 0), ("scale", 1), ("opacity", 1))}
    for field in result:
        points = [(0, result[field])]
        for key in layer.get("keyframes", []):
            if field in key:
                if key["time"] == 0:
                    points[0] = (0, key[field])
                else:
                    points.append((key["time"], key[field]))
        if t >= points[-1][0]:
            result[field] = points[-1][1]
        else:
            for (a, x), (b, y) in zip(points, points[1:]):
                if a <= t < b:
                    result[field] = x + (y - x) * _smooth((t - a) / (b - a))
                    break
    return result


def _image(plan, base, ident, *, mask=False):
    with Image.open(_file(base, plan["assets"][ident]["path"])) as source:
        if not mask:
            return source.convert("RGBA")
        luminance = source.convert("L")
        if "A" in source.getbands():
            return ImageChops.multiply(luminance, source.getchannel("A"))
        return luminance


def _asset_loader(plan, base, *, budget=64 * 1024 * 1024):
    cache = OrderedDict()
    used = 0

    def load(ident, *, mask=False):
        nonlocal used
        key = (ident, mask)
        if key in cache:
            cache.move_to_end(key)
            return cache[key][0]
        image = _image(plan, base, ident, mask=mask)
        size = image.width * image.height * len(image.getbands())
        if size > budget:
            return image
        while used + size > budget:
            _, (_, evicted_size) = cache.popitem(last=False)
            used -= evicted_size
        cache[key] = (image, size)
        used += size
        return image

    return load


def _material(plan, base, layer, image, t, *, load_image=None):
    m = layer.get("material")
    if not m or t <= m["start"]:
        return image
    load_image = load_image or partial(_image, plan, base)
    overlay = load_image(m["asset"])
    mask = load_image(m["mask"], mask=True)
    p = (t - m["start"]) / (m["end"] - m["start"])
    if p < 1:
        w, h = image.size
        ox, oy = m["origin"][0] * w, m["origin"][1] * h
        reach = max(math.hypot(x - ox, y - oy) for x, y in ((0, 0), (w, 0), (0, h), (w, h)))
        radius = _smooth(p) * reach
        spread = Image.new("L", image.size)
        ImageDraw.Draw(spread).ellipse((ox - radius, oy - radius, ox + radius, oy + radius), fill=255)
        spread = spread.filter(ImageFilter.GaussianBlur(max(0.5, min(w, h) * 0.006)))
        mask = ImageChops.multiply(mask, spread)
    mask = ImageChops.multiply(mask, overlay.getchannel("A"))
    return Image.composite(overlay, image, mask)


def render_frame(plan, base, t, *, load_image=None, caption_font=None):
    """Render one absolute time; caller validates once before a sequence."""
    if not _finite(t) or not 0 <= t <= plan["duration"]:
        raise ValueError("frame time outside plan")
    t = min(t, math.nextafter(float(plan["duration"]), -math.inf))
    shot = next((s for s in plan["shots"] if s["start"] <= t < s["end"]), None)
    if shot is None:
        raise ValueError("no shot covers frame")
    local = t - shot["start"]
    load_image = load_image or partial(_image, plan, base)
    width, height = plan["width"], plan["height"]
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 255))
    camera = shot.get("camera", {})
    start = camera.get("start", [0, 0, 1])
    end = camera.get("end", start)
    stop = camera.get("stop_at", shot["end"] - shot["start"])
    p = _smooth(local / stop) if stop else 0
    tx, ty, zoom = [a + (b - a) * p for a, b in zip(start, end)]
    for layer in sorted(shot["layers"], key=lambda l: l.get("z", 0)):
        ident = layer["asset"]
        for state in layer.get("states", []):
            if local >= state["at"]:
                ident = state["asset"]
        image = _material(plan, base, layer, load_image(ident), local, load_image=load_image)
        v = _at(layer, local)
        if v["opacity"] <= 0:
            continue
        if v["opacity"] < 1:
            # The decoded image may be shared by later frames.
            image = image.copy()
            image.putalpha(image.getchannel("A").point(lambda n: round(n * v["opacity"])))
        depth = layer.get("depth", 1)
        z = 1 + (zoom - 1) * depth
        cx = width / 2 + (v["x"] - width / 2) * z + tx * depth
        cy = height / 2 + (v["y"] - height / 2) * z + ty * depth
        scale = layer["width"] / image.width * v["scale"] * z
        co, si = math.cos(v["rotation"]) / scale, math.sin(v["rotation"]) / scale
        ax, ay = layer.get("anchor", [0.5, 0.5])
        matrix = (co, si, image.width * ax - co * cx - si * cy,
                  -si, co, image.height * ay + si * cx - co * cy)
        transformed = image.transform(canvas.size, Image.Transform.AFFINE, matrix, Image.Resampling.BICUBIC)
        canvas.alpha_composite(transformed)
    for cue in plan.get("captions", []):
        if cue["start"] <= t < cue["end"]:
            style = plan["caption_style"]
            ImageDraw.Draw(canvas).text((width / 2, style.get("y", height - 30)), cue["text"],
                                       font=caption_font or _caption_font(plan, base), anchor="ms",
                                       fill=tuple(style.get("color", [255, 255, 255])),
                                       stroke_width=style.get("stroke_width", 1),
                                       stroke_fill=tuple(style.get("stroke_color", [30, 20, 15])))
            break
    return canvas


def render(planfile, output, start=0, end=None, width=None, height=None, fps=None, ffmpeg=None):
    """Encode silent scene frames; root workflow muxes preserved approved audio."""
    planfile, output = Path(planfile).resolve(), Path(output).resolve()
    plan = json.loads(planfile.read_text())
    errors = validate_plan(plan, planfile.parent)
    if errors:
        raise ValueError("invalid B8 scene plan: " + "; ".join(errors))
    end = plan["duration"] if end is None else end
    fps = plan["fps"] if fps is None else fps
    width, height = width or plan["width"], height or plan["height"]
    if not all(_finite(n) for n in (start, end, fps)) or not 0 <= start < end <= plan["duration"] or not 0 < fps <= 120:
        raise ValueError("invalid render interval/fps")
    if not isinstance(width, int) or not isinstance(height, int) or min(width, height) < 16 or width % 2 or height % 2:
        raise ValueError("encoded dimensions must be positive even integers >=16")
    if abs(width / height - plan["width"] / plan["height"]) > 1e-6:
        raise ValueError("render size must preserve authored aspect ratio")
    if output.exists():
        raise FileExistsError("render output exists; choose a new version")
    executable = ffmpeg or os.environ.get("FFMPEG") or shutil.which("ffmpeg")
    if not executable:
        raise RuntimeError("ffmpeg not found; configure FFMPEG")
    frames = math.ceil((end - start) * fps - 1e-9)
    load_image = _asset_loader(plan, planfile.parent)
    caption_font = _caption_font(plan, planfile.parent) if plan.get("captions") else None
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="b8-encode-", dir=output.parent) as temporary:
        pending, log = Path(temporary) / "scene.mp4", Path(temporary) / "ffmpeg.log"
        command = [executable, "-hide_banner", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{width}x{height}", "-r", str(fps), "-i", "pipe:0", "-an", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-y", str(pending)]
        with log.open("wb") as err:
            process = subprocess.Popen(command, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=err)
            try:
                for i in range(frames):
                    image = render_frame(plan, planfile.parent, start + i / fps,
                                         load_image=load_image, caption_font=caption_font)
                    if image.size != (width, height):
                        image = image.resize((width, height), Image.Resampling.LANCZOS)
                    process.stdin.write(image.convert("RGB").tobytes())
                process.stdin.close()
                if process.wait() != 0:
                    raise RuntimeError("ffmpeg failed: " + log.read_text()[-4000:])
            except BaseException:
                if process.poll() is None:
                    process.kill()
                process.wait()
                raise
        if output.exists():
            raise FileExistsError("render output appeared during encoding; will not overwrite")
        # Atomic exclusive destination creation also protects concurrent producers.
        with output.open("xb") as destination, pending.open("rb") as source:
            shutil.copyfileobj(source, destination)
    return {"output": str(output), "frames": frames, "fps": fps, "start": start, "end": end,
            "width": width, "height": height, "status": "technical_only", "visual_acceptance": "pending", "audio": "silent_scene_only"}
