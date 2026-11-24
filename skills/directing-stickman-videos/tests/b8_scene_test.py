"""Behavior tests for B8 drawn-cel composition, not aesthetic certification."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import random
import shutil
import tempfile
import unittest

from PIL import Image, ImageChops, ImageDraw

spec = importlib.util.spec_from_file_location("b8_scene", Path(__file__).resolve().parents[1] / "scripts/b8_scene.py")
scene = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scene)


class SceneTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="b8-scene-test-")
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.assets = {}
        self.asset("garden", Image.new("RGB", (160, 90), "#102030"), "background")
        self.asset("hand", Image.new("RGBA", (40, 30), "#d09070"), "cel", "king")
        self.asset("react", Image.new("RGBA", (40, 30), "#b06050"), "cel", "king")
        self.asset("leaf", Image.new("RGBA", (32, 24), "#208030"), "prop")
        self.asset("gold", Image.new("RGBA", (32, 24), "#f0c030"), "prop")
        self.asset("mask", Image.new("L", (32, 24), 255), "mask")
        self.plan = {"schema_version": 1, "style": "B8", "width": 160, "height": 90, "fps": 10, "duration": 4,
                     "assets": self.assets, "shots": [{"id": "touch", "start": 0, "end": 4, "scene": "garden", "framing": "contact detail",
                     "information_change": "leaf turns gold after contact", "camera": {"start": [0, 0, 1], "end": [6, 0, 1.05], "stop_at": 2},
                     "layers": [{"id": "world", "asset": "garden", "x": 80, "y": 45, "width": 160, "depth": 0.1, "z": 0},
                                {"id": "arm", "asset": "hand", "x": 120, "y": 42, "width": 40, "depth": 1, "z": 2,
                                 "keyframes": [{"time": 0, "x": 120}, {"time": 1, "x": 98}, {"time": 3, "x": 98}, {"time": 4, "x": 110}],
                                 "states": [{"at": 3, "asset": "react"}]},
                                {"id": "leaf", "asset": "leaf", "x": 65, "y": 45, "width": 32, "depth": 1, "z": 1,
                                 "keyframes": [{"time": 0, "rotation": 0}, {"time": 1, "rotation": -0.15}],
                                 "material": {"asset": "gold", "mask": "mask", "start": 1, "end": 2, "origin": [1, 0.5]}}]}]}

    def asset(self, ident, image, kind, character=None):
        file = self.base / f"{ident}.png"
        image.save(file)
        record = {"path": file.name, "sha256": hashlib.sha256(file.read_bytes()).hexdigest(), "kind": kind}
        if character:
            record.update(character_id=character, whole_pose=True)
        self.assets[ident] = record

    def test_plan_valid_and_stateless_frame_order(self):
        self.assertEqual(scene.validate_plan(self.plan, self.base), [])
        times = [0, 0.3, 0.9, 1.1, 1.5, 2, 2.9, 3, 3.8]
        expected = {t: scene.render_frame(self.plan, self.base, t).tobytes() for t in times}
        random.Random(42).shuffle(times)
        for t in times + list(reversed(times)):
            self.assertEqual(scene.render_frame(self.plan, self.base, t).tobytes(), expected[t])
        self.assertNotEqual(expected[0], expected[0.9])
        self.assertNotEqual(expected[1.1], expected[1.5])

    def test_material_begins_at_contact_origin_and_stays_masked(self):
        layer = self.plan["shots"][0]["layers"][2]
        neutral = scene._image(self.plan, self.base, "leaf")
        self.assertEqual(scene._material(self.plan, self.base, layer, neutral, 0.99).tobytes(), neutral.tobytes())
        halfway = scene._material(self.plan, self.base, layer, neutral, 1.3)
        self.assertNotEqual(halfway.getpixel((30, 12)), neutral.getpixel((30, 12)))
        self.assertEqual(halfway.getpixel((0, 12)), neutral.getpixel((0, 12)))
        complete = scene._material(self.plan, self.base, layer, neutral, 2)
        self.assertEqual(complete.tobytes(), scene._image(self.plan, self.base, "gold").tobytes())
        mask = Image.new("L", (32, 24))
        ImageDraw.Draw(mask).rectangle((16, 0, 31, 23), fill=255)
        self.asset("mask", mask, "mask")
        partial = scene._material(self.plan, self.base, layer, neutral, 2)
        self.assertEqual(partial.getpixel((0, 12)), neutral.getpixel((0, 12)))
        self.assertNotEqual(partial.getpixel((30, 12)), neutral.getpixel((30, 12)))

    def test_registered_whole_pose_swaps_preserve_identity(self):
        p = copy.deepcopy(self.plan)
        p["shots"][0]["camera"] = {"start": [0, 0, 1], "end": [0, 0, 1]}
        arm = p["shots"][0]["layers"][1]
        arm["keyframes"] = []
        before, after = scene.render_frame(p, self.base, 2.99), scene.render_frame(p, self.base, 3)
        self.assertEqual(before.getpixel((120, 42)), (208, 144, 112, 255))
        self.assertEqual(after.getpixel((120, 42)), (176, 96, 80, 255))
        p["assets"]["react"]["character_id"] = "other"
        self.assertIn("character identity", ";".join(scene.validate_plan(p, self.base)))
        p["assets"]["react"]["character_id"] = "king"
        Image.new("RGBA", (42, 30), "red").save(self.base / "react.png")
        p["assets"]["react"]["sha256"] = hashlib.sha256((self.base / "react.png").read_bytes()).hexdigest()
        self.assertIn("registered canvas", ";".join(scene.validate_plan(p, self.base)))

    def test_layers_move_independently_without_camera(self):
        p = copy.deepcopy(self.plan)
        p["shots"][0]["camera"] = {"start": [0, 0, 1], "end": [0, 0, 1]}
        first, later = scene.render_frame(p, self.base, 0), scene.render_frame(p, self.base, 0.8)
        # World is fixed while distinct actor and prop regions change.
        self.assertEqual(first.getpixel((5, 5)), later.getpixel((5, 5)))
        self.assertIsNotNone(ImageChops.difference(first.convert("RGB").crop((90, 25, 145, 60)), later.convert("RGB").crop((90, 25, 145, 60))).getbbox())
        self.assertIsNotNone(ImageChops.difference(first.convert("RGB").crop((45, 25, 82, 65)), later.convert("RGB").crop((45, 25, 82, 65))).getbbox())

    def test_integrity_missing_absolute_escape_and_external_path_fail(self):
        for bad in ("missing.png", "/tmp/hand.png", "../hand.png", "https://example.com/a.png"):
            p = copy.deepcopy(self.plan)
            p["assets"]["hand"]["path"] = bad
            self.assertTrue(scene.validate_plan(p, self.base))
        (self.base / "hand.png").write_bytes(b"changed")
        self.assertIn("SHA-256 mismatch", ";".join(scene.validate_plan(self.plan, self.base)))

    def test_rig_stretch_and_flat_camera_only_are_rejected(self):
        for field in ("scaleX", "scaleY", "height", "ik", "bones"):
            p = copy.deepcopy(self.plan)
            p["shots"][0]["layers"][1][field] = 2
            self.assertTrue(scene.validate_plan(p, self.base))
        p = copy.deepcopy(self.plan)
        p["shots"][0]["layers"] = [p["shots"][0]["layers"][0]]
        self.assertIn("flat-image", ";".join(scene.validate_plan(p, self.base)))
        p = copy.deepcopy(self.plan)
        for layer in p["shots"][0]["layers"]:
            for key in ("states", "keyframes", "material"):
                layer.pop(key, None)
        self.assertIn("hold_reason", ";".join(scene.validate_plan(p, self.base)))
        p["shots"][0]["hold_reason"] = "Let the king's reaction register before the cut."
        self.assertEqual(scene.validate_plan(p, self.base), [])
        p["shots"][0]["camera"] = {"start": [0, 0, 1], "end": [0, 0, 1]}
        self.assertEqual(scene.validate_plan(p, self.base), [])
        # Hold metadata permits technical rendering and cannot certify a useful
        # composition, visible acting, meaningful movement or accepted quality.
        first, last = scene.render_frame(p, self.base, 0), scene.render_frame(p, self.base, 3.9)
        self.assertEqual(first.tobytes(), last.tobytes())

    def test_no_gaps_bad_timing_and_invalid_aspect(self):
        for key, value in (("start", 0.2), ("end", 3)):
            p = copy.deepcopy(self.plan)
            p["shots"][0][key] = value
            self.assertTrue(scene.validate_plan(p, self.base))
        p = copy.deepcopy(self.plan)
        p["shots"][0]["layers"][1]["keyframes"][1]["time"] = 5
        self.assertTrue(scene.validate_plan(p, self.base))
        planfile = self.base / "plan.json"
        planfile.write_text(json.dumps(self.plan))
        with self.assertRaisesRegex(ValueError, "aspect ratio"):
            scene.render(planfile, self.base / "bad.mp4", width=90, height=160)

    def captions(self):
        source = Path(__file__).resolve().parents[1] / "assets/fonts/NotoSans.ttf"
        font = self.base / "caption.ttf"
        shutil.copyfile(source, font)
        self.plan["caption_style"] = {"font": font.name, "font_sha256": hashlib.sha256(font.read_bytes()).hexdigest(),
                                      "size": 14, "color": [255, 255, 255], "stroke_color": [0, 0, 0], "stroke_width": 1,
                                      "y": 82, "max_width": 144}
        self.plan["captions"] = [{"start": 0.5, "end": 1, "text": "A fallen leaf."}, {"start": 2, "end": 3, "text": "It turns gold."}]

    def test_caption_pixels_are_timed_and_font_is_portable(self):
        self.captions()
        self.assertEqual(scene.validate_plan(self.plan, self.base), [])
        p = copy.deepcopy(self.plan)
        p["captions"] = []
        for t in (0, 0.499, 1, 1.8, 3, 3.9):
            self.assertEqual(scene.render_frame(self.plan, self.base, t).tobytes(), scene.render_frame(p, self.base, t).tobytes())
        for t in (0.5, 0.9, 2, 2.9):
            actual = scene.render_frame(self.plan, self.base, t)
            plain = scene.render_frame(p, self.base, t)
            difference = ImageChops.difference(actual.convert("RGB"), plain.convert("RGB"))
            self.assertIsNotNone(difference.getbbox())
            self.assertGreater(difference.getbbox()[1], 60)
            self.assertGreater(sum(1 for pixel in actual.crop((5, 62, 155, 88)).getdata() if min(pixel[:3]) > 240), 15)

    def test_caption_font_hash_path_fit_and_semantic_timing_rejects(self):
        self.captions()
        for field, value in (("font", "/System/Library/Fonts/Times.ttc"), ("font", "missing.ttf"), ("font_sha256", "0" * 64), ("max_width", 12), ("y", 2)):
            p = copy.deepcopy(self.plan)
            p["caption_style"][field] = value
            self.assertTrue(scene.validate_plan(p, self.base), (field, value))
        for field, value in (("start", 0.9), ("end", 5), ("text", "Broken\nphrase"), ("text", "")):
            p = copy.deepcopy(self.plan)
            p["captions"][1][field] = value
            self.assertTrue(scene.validate_plan(p, self.base), (field, value))
        p = copy.deepcopy(self.plan)
        p["captions"][0]["text"] = "This very long caption cannot fit the chosen fixed-size line."
        self.assertIn("never shrink", ";".join(scene.validate_plan(p, self.base)))

    def test_missing_glyphs_block_production_with_characters_and_codepoints(self):
        self.captions()
        self.plan["captions"][0]["text"] = "中文"
        errors = ";".join(scene.validate_plan(self.plan, self.base))
        self.assertIn("caption cue 1", errors)
        self.assertIn("'中' (U+4E2D)", errors)
        self.assertIn("'文' (U+6587)", errors)
        planfile = self.base / "plan.json"
        planfile.write_text(json.dumps(self.plan))
        output = self.base / "must-not-render.mp4"
        with self.assertRaisesRegex(ValueError, "missing glyphs"):
            scene.render(planfile, output)
        self.assertFalse(output.exists())

    def test_caption_safety_counts_descenders_and_stroke_without_restyling(self):
        self.captions()
        for y in (3, 90):
            p = copy.deepcopy(self.plan)
            p["captions"][0]["text"] = "gold, joy."
            p["caption_style"].update(y=y, stroke_width=3)
            self.assertIn("glyph bounds outside frame", ";".join(scene.validate_plan(p, self.base)))
        p = copy.deepcopy(self.plan)
        p["caption_style"]["max_width"] = 60
        self.assertIn("never shrink", ";".join(scene.validate_plan(p, self.base)))
        self.assertEqual(self.plan["caption_style"]["size"], 14)

    def test_caption_timeline_boundaries_controls_and_original_text_are_preserved(self):
        self.captions()
        self.plan["captions"] = [{"start": 0, "end": 2, "text": "A\u00a0leaf."},
                                 {"start": 2, "end": 4, "text": "It turns gold."}]
        original = copy.deepcopy(self.plan)
        self.assertEqual(scene.validate_plan(self.plan, self.base), [])
        self.assertEqual(self.plan, original)
        for field, value in (("start", -0.1), ("start", 1.99), ("start", float("nan")),
                             ("end", float("inf")), ("end", True), ("end", 4.01),
                             ("text", "A\tleaf"), ("text", "A\u2028leaf"), ("text", "\u200d")):
            p = copy.deepcopy(self.plan)
            p["captions"][1][field] = value
            with self.subTest(field=field, value=repr(value)):
                self.assertTrue(scene.validate_plan(p, self.base))

    @unittest.skipUnless(shutil.which("ffmpeg"), "ffmpeg unavailable")
    def test_encoder_and_no_overwrite(self):
        planfile = self.base / "plan.json"
        planfile.write_text(json.dumps(self.plan))
        movie = self.base / "movie.mp4"
        report = scene.render(planfile, movie, start=0.5, end=1, fps=10)
        self.assertEqual(report["frames"], 5)
        self.assertGreater(movie.stat().st_size, 500)
        self.assertEqual(report["visual_acceptance"], "pending")
        with self.assertRaises(FileExistsError):
            scene.render(planfile, movie, start=0.5, end=1)


if __name__ == "__main__":
    unittest.main()
