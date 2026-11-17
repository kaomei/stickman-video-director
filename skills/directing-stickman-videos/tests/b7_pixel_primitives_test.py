"""Offline technical tests for B7 sample-derived primitives.

Run directly with Python 3 and Pillow. These are not story, audio/listening, gait
timing or aesthetic acceptance tests. The primitives do not own an event timeline;
shared picture/SFX triggers still require tests in the actual story renderer.
"""

import hashlib
import importlib.util
import json
import math
from pathlib import Path
import unittest

from PIL import Image, ImageDraw


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "b7_pixel_primitives.py"
SPEC = importlib.util.spec_from_file_location("b7_pixel_primitives_under_test", SCRIPT)
P = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(P)

BACKGROUND = (43, 32, 60)
FOREGROUND = (239, 228, 192)
SHADOW = (8, 14, 28)
A_ROWS = ("01110", "10001", "10001", "11111", "10001", "10001", "10001")
I_ROWS = ("111", "010", "010", "010", "010", "010", "111")


def independent_label_pixels(size, xy, glyphs, scale, shadow):
    """Expected raster built without the implementation's size/drawing helpers."""
    result = Image.new("RGB", size, BACKGROUND)
    for offset, color in (((scale, scale), SHADOW), ((0, 0), FOREGROUND)) if shadow else (((0, 0), FOREGROUND),):
        x, y = xy[0] + offset[0], xy[1] + offset[1]
        for rows in glyphs:
            for row_index, row in enumerate(rows):
                for column, bit in enumerate(row):
                    if bit == "1":
                        for dy in range(scale):
                            for dx in range(scale):
                                result.putpixel((x + column * scale + dx,
                                                 y + row_index * scale + dy), color)
            x += (len(rows[0]) + 1) * scale
    return result


class BitmapTypographyTests(unittest.TestCase):
    def test_entire_approved_alphabet_fingerprint(self):
        # Independently derived from the accepted source's base map + additions,
        # not from a dynamically imported project outside this installed package.
        encoded = json.dumps(P.GLYPHS, sort_keys=True, separators=(",", ":")).encode()
        self.assertEqual(len(P.GLYPHS), 46)
        self.assertEqual(hashlib.sha256(encoded).hexdigest(),
                         "1d8b31a779607cdc12c0a709a16f63b565fd9073daccc68b285fd3b325f32068")

    def test_exact_representative_glyphs_and_seven_row_grid(self):
        self.assertEqual(tuple(P.GLYPHS["A"]), A_ROWS)
        self.assertEqual(tuple(P.GLYPHS["I"]), I_ROWS)
        self.assertEqual(P.GLYPHS["?"],
                         ["01110", "10001", "00001", "00010", "00100", "00000", "00100"])
        for character, rows in P.GLYPHS.items():
            with self.subTest(character=character):
                self.assertEqual(len(rows), 7)
                self.assertTrue(all(len(row) == len(rows[0]) for row in rows))
                self.assertTrue(all(set(row) <= {"0", "1"} for row in rows))

    def test_label_exact_foreground_and_shadow_grid(self):
        for scale in (1, 2, 3):
            for shadow in (False, True):
                with self.subTest(scale=scale, shadow=shadow):
                    actual = Image.new("RGB", (48, 36), BACKGROUND)
                    P.draw_label(ImageDraw.Draw(actual), (3, 4), "AI", FOREGROUND,
                                 scale=scale, shadow=shadow)
                    expected = independent_label_pixels(actual.size, (3, 4),
                                                        (A_ROWS, I_ROWS), scale, shadow)
                    self.assertEqual(actual.tobytes(), expected.tobytes())

    def test_variable_width_one_pixel_tracking_and_uppercase_preset(self):
        self.assertEqual(P.text_size("A I!"), (15, 7))
        self.assertEqual(P.text_size("A I!", scale=3), (45, 21))
        self.assertEqual(P.text_size("ai"), (9, 7))
        lower = Image.new("RGB", (24, 16), BACKGROUND)
        upper = lower.copy()
        P.draw_label(ImageDraw.Draw(lower), (0, 0), "ai")
        P.draw_label(ImageDraw.Draw(upper), (0, 0), "AI")
        self.assertEqual(lower.tobytes(), upper.tobytes())

    def test_empty_label_is_empty_and_has_zero_size(self):
        image = Image.new("RGB", (16, 16), BACKGROUND)
        before = image.tobytes()
        self.assertEqual(P.text_size(""), (0, 0))
        P.draw_label(ImageDraw.Draw(image), (2, 2), "")
        self.assertEqual(image.tobytes(), before)

    def test_multiline_tabs_and_non_text_are_explicitly_rejected(self):
        for value in ("FIRST\nSECOND", "FIRST\rSECOND", "FIRST\tSECOND", None, 7):
            with self.subTest(value=value):
                with self.assertRaisesRegex(ValueError, "one semantic subtitle line"):
                    P.text_size(value)

    def test_missing_glyph_is_actionable_not_a_silent_font_fallback(self):
        with self.assertRaisesRegex(ValueError, "Missing bitmap glyph.*你.*explicit pixel font"):
            P.text_size("你")
        image = Image.new("RGB", (20, 20), BACKGROUND)
        with self.assertRaisesRegex(ValueError, "Missing bitmap glyph"):
            P.draw_label(ImageDraw.Draw(image), (1, 1), "你")
        self.assertEqual(image.tobytes(), Image.new("RGB", image.size, BACKGROUND).tobytes())

    def test_explicit_custom_language_bitmap_and_user_letter_shape(self):
        rows = ("10101", "11111", "00100", "11111", "10101", "00100", "00100")
        custom = {"你": list(rows), "A": ["1", "0", "1"]}
        self.assertEqual(P.text_size("你", glyphs=custom), (5, 7))
        self.assertEqual(P.text_size("a", glyphs=custom), (1, 3))
        actual = Image.new("RGB", (20, 20), BACKGROUND)
        P.draw_label(ImageDraw.Draw(actual), (2, 3), "你", FOREGROUND, glyphs=custom)
        expected = independent_label_pixels(actual.size, (2, 3), (rows,), 1, True)
        self.assertEqual(actual.tobytes(), expected.tobytes())
        self.assertEqual(P.GLYPHS["A"], list(A_ROWS), "An override must not mutate the preset")

    def test_invalid_custom_bitmaps_are_explicitly_rejected(self):
        for rows in ([], [""], ["10", "1"], ["12"]):
            with self.subTest(rows=rows):
                with self.assertRaisesRegex(ValueError, "Invalid rectangular bitmap"):
                    P.text_size("A", glyphs={"A": rows})

    def test_caption_is_centered_single_line_inside_sample_safe_area(self):
        image = Image.new("RGB", (320, 180), BACKGROUND)
        bounds = P.draw_caption(image, "A I!")
        self.assertEqual(bounds, (152, 165, 16, 8))
        changed = [(x, y) for y in range(image.height) for x in range(image.width)
                   if image.getpixel((x, y)) != BACKGROUND]
        self.assertTrue(changed)
        self.assertTrue(all(14 <= x < 306 and 165 <= y < 173 for x, y in changed))

    def test_caption_overflow_fails_instead_of_wrapping_or_shrinking(self):
        image = Image.new("RGB", (320, 180), BACKGROUND)
        with self.assertRaisesRegex(ValueError, "earlier semantic speech boundary"):
            P.draw_caption(image, "W" * 50)
        with self.assertRaisesRegex(ValueError, "shadow exceed the canvas"):
            P.draw_caption(image, "A", y=173)
        with self.assertRaisesRegex(ValueError, "one semantic subtitle line"):
            P.draw_caption(image, "A\nI")

    def test_caption_can_use_explicit_native_layout_and_language(self):
        image = Image.new("RGB", (180, 320), BACKGROUND)
        bounds = P.draw_caption(image, "你", y=285, margin=12,
                                glyphs={"你": ["111", "101", "111"]})
        self.assertEqual(bounds, (88, 285, 4, 4))


class PixelScaleTests(unittest.TestCase):
    def test_nearest_integer_upscale_repeats_exact_blocks_without_new_colors(self):
        source = Image.new("RGB", (3, 2))
        colors = [(2, 3, 7), (255, 255, 255), (12, 100, 150),
                  (250, 1, 99), (1, 7, 9), (200, 211, 222)]
        source.putdata(colors)
        for scale in (1, 2, 6):
            with self.subTest(scale=scale):
                output = P.upscale(source, scale)
                self.assertEqual(output.size, (3 * scale, 2 * scale))
                for y in range(output.height):
                    for x in range(output.width):
                        self.assertEqual(output.getpixel((x, y)),
                                         source.getpixel((x // scale, y // scale)))
                self.assertEqual(set(output.getdata()), set(colors))

    def test_fractional_zero_negative_and_boolean_scales_rejected(self):
        for scale in (0, -1, 1.5, True, "2"):
            with self.subTest(scale=scale):
                with self.assertRaisesRegex(ValueError, "positive integer"):
                    P.upscale(Image.new("RGB", (2, 2)), scale)
                with self.assertRaisesRegex(ValueError, "positive integer"):
                    P.text_size("A", scale=scale)


class WhiteCContactTests(unittest.TestCase):
    def assert_segment_length(self, a, b, expected):
        self.assertAlmostEqual(math.dist(a, b), expected, places=10)

    def assert_pose_lengths(self, pose):
        self.assert_segment_length(pose["hip"], pose["shoulder"], 12)
        self.assert_segment_length(pose["shoulder"], pose["head"], 8)
        for side in ("left", "right"):
            self.assert_segment_length(pose["hip"], pose[side + "_knee"], 9)
            self.assert_segment_length(pose[side + "_knee"], pose[side + "_foot"], 9)
            self.assert_segment_length(pose["shoulder"], pose[side + "_elbow"], 7.3)
            self.assert_segment_length(pose[side + "_elbow"], pose[side + "_hand"], 7.3)

    def test_analytic_ik_keeps_both_bones_exact_for_both_bends(self):
        for tip, upper, lower in (((12, 27), 7.3, 7.3), ((16, 25), 9, 9),
                                  ((17, 24), 6, 4)):
            for bend in (-1, 1):
                with self.subTest(tip=tip, upper=upper, lower=lower, bend=bend):
                    root = (10, 20)
                    joint = P.two_bone(root, tip, upper, lower, bend)
                    self.assert_segment_length(root, joint, upper)
                    self.assert_segment_length(joint, tip, lower)

    def test_unreachable_collapsed_and_nonfinite_ik_rejected(self):
        for tip in ((0, 0), (18, 0), (19, 0)):
            with self.subTest(tip=tip):
                with self.assertRaisesRegex(ValueError, "Unreachable endpoint"):
                    P.two_bone((0, 0), tip, 9, 9)
        with self.assertRaisesRegex(ValueError, "Unreachable endpoint"):
            P.two_bone((0, 0), (1, 0), 9, 7)
        with self.assertRaisesRegex(ValueError, "Unreachable endpoint"):
            P.two_bone((0, 0), (5, 0), 0, 7)
        for value in (math.inf, math.nan):
            with self.subTest(value=value):
                with self.assertRaisesRegex(ValueError, "Finite geometry"):
                    P.two_bone((0, 0), (value, 4), 9, 9)
        with self.assertRaisesRegex(ValueError, r"bend -1/\+1"):
            P.two_bone((0, 0), (5, 0), 9, 9, bend=0)

    def test_every_bundled_pose_preserves_white_c_geometry(self):
        for mode in ("idle", "reach", "shield", "brace", "map", "sad", "point"):
            for look in (-1, 1):
                for lean in (-0.1, 0, 0.1):
                    with self.subTest(mode=mode, look=look, lean=lean):
                        self.assert_pose_lengths(P.make_pose((50, 90), mode, look, lean))

    def test_idle_knees_bend_outward_independent_of_face_direction(self):
        forward = P.make_pose((100, 100), look=1)
        backward = P.make_pose((100, 100), look=-1)
        for pose in (forward, backward):
            left_midpoint = (pose["hip"][0] + pose["left_foot"][0]) / 2
            right_midpoint = (pose["hip"][0] + pose["right_foot"][0]) / 2
            self.assertLess(pose["left_knee"][0], left_midpoint)
            self.assertGreater(pose["right_knee"][0], right_midpoint)
        self.assertEqual(forward["left_knee"], backward["left_knee"])
        self.assertEqual(forward["right_knee"], backward["right_knee"])

    def test_explicit_knee_bends_control_each_leg_without_stretch(self):
        for bends in ({"left": 1, "right": 1}, {"left": -1, "right": -1},
                      {"left": -1, "right": 1}):
            with self.subTest(bends=bends):
                pose = P.make_pose((100, 100), knee_bends=bends)
                for side in ("left", "right"):
                    root, knee, foot = pose["hip"], pose[side + "_knee"], pose[side + "_foot"]
                    cross = ((foot[0] - root[0]) * (knee[1] - root[1])
                             - (foot[1] - root[1]) * (knee[0] - root[0]))
                    self.assertGreater(cross * bends[side], 0)
                self.assert_pose_lengths(pose)

    def test_invalid_explicit_knee_bends_are_rejected(self):
        for bends in ({"left": 1}, {"left": 1, "right": 0},
                      {"left": True, "right": -1},
                      {"left": 1, "right": -1, "third": 1}):
            with self.subTest(bends=bends):
                with self.assertRaises(ValueError):
                    P.make_pose((100, 100), knee_bends=bends)

    def test_exact_one_pixel_limb_with_separate_approved_ink_shadow(self):
        for far, expected_color in ((False, (255, 255, 255)), (True, (199, 203, 210))):
            with self.subTest(far=far):
                image = Image.new("RGB", (16, 16), BACKGROUND)
                P.limb(ImageDraw.Draw(image), [(5.2, 5.1), (5.2, 10.1)], far=far)
                expected = Image.new("RGB", image.size, BACKGROUND)
                for y in range(5, 11):
                    expected.putpixel((5, y), expected_color)
                    expected.putpixel((6, y), (12, 16, 28))
                self.assertEqual(image.tobytes(), expected.tobytes())

    def test_moving_body_keeps_supplied_support_feet_in_world_coordinates(self):
        feet = {"left": (98, 117), "right": (104, 117)}
        for hip in ((100, 100), (101, 100), (102, 99.5)):
            with self.subTest(hip=hip):
                pose = P.make_pose(hip, "reach", lean=0.08, feet=feet)
                self.assertEqual(pose["left_foot"], feet["left"])
                self.assertEqual(pose["right_foot"], feet["right"])
                self.assert_pose_lengths(pose)

    def test_story_supplied_alternating_swing_feet_do_not_move_support_foot(self):
        # This verifies the endpoint interface, not a generated/certified walk loop.
        for support, swing in (("left", "right"), ("right", "left")):
            support_point = (98, 117) if support == "left" else (102, 117)
            for swing_x, swing_y in ((100, 116), (102, 115), (104, 117)):
                feet = {support: support_point, swing: (swing_x, swing_y)}
                with self.subTest(support=support, swing_point=feet[swing]):
                    pose = P.make_pose((100, 100), feet=feet)
                    self.assertEqual(pose[support + "_foot"], support_point)
                    self.assertEqual(pose[swing + "_foot"], feet[swing])
                    self.assert_pose_lengths(pose)

    def test_contact_hand_hits_explicit_world_target_without_limb_stretch(self):
        for look in (-1, 1):
            with self.subTest(look=look):
                pose = P.make_pose((60, 90), "idle", look=look,
                                   hand_offsets={"right": (12, 3)})
                target = (60 + 12 * look, 81)
                self.assertEqual(pose["right_hand"], target)
                prop = P.anchored_points(pose, "right_hand", [(0, 0), (7, -2)])
                self.assertEqual(prop[0], target)
                self.assertEqual(prop[1], (target[0] + 7, target[1] - 2))
                self.assert_pose_lengths(pose)

    def test_prop_vertices_follow_actual_hand_translation_and_preserve_offsets(self):
        offsets = [(0, 0), (7, -2), (3.25, 4.5)]
        first = P.make_pose((60.25, 90.5), "reach", lean=0.06)
        second = P.make_pose((65.75, 92), "map", lean=-0.04)
        a = P.anchored_points(first, "right_hand", offsets)
        b = P.anchored_points(second, "right_hand", offsets)
        movement = tuple(second["right_hand"][i] - first["right_hand"][i] for i in (0, 1))
        for index, (dx, dy) in enumerate(offsets):
            self.assertAlmostEqual(a[index][0] - first["right_hand"][0], dx)
            self.assertAlmostEqual(a[index][1] - first["right_hand"][1], dy)
            self.assertAlmostEqual(b[index][0] - a[index][0], movement[0])
            self.assertAlmostEqual(b[index][1] - a[index][1], movement[1])

    def test_left_right_facing_mirrors_hand_targets_and_elbows(self):
        forward = P.make_pose((60, 90), "point", look=1)
        backward = P.make_pose((60, 90), "point", look=-1)
        for side in ("left", "right"):
            for joint in ("hand", "elbow"):
                a, b = forward[side + "_" + joint], backward[side + "_" + joint]
                self.assertAlmostEqual(a[0] + b[0], 120)
                self.assertAlmostEqual(a[1], b[1])
        self.assertGreater(forward["right_hand"][0], forward["shoulder"][0])
        self.assertLess(backward["right_hand"][0], backward["shoulder"][0])

    def test_unreachable_body_contact_and_invalid_pose_inputs_rejected(self):
        with self.assertRaisesRegex(ValueError, "Unreachable endpoint"):
            P.make_pose((50, 90), hand_offsets={"right": (30, 0)})
        with self.assertRaisesRegex(ValueError, "Unreachable endpoint"):
            P.make_pose((50, 90), feet={"left": (0, 0), "right": (52, 107)})
        with self.assertRaisesRegex(ValueError, "Supply both"):
            P.make_pose((50, 90), feet={"left": (48, 107)})
        with self.assertRaisesRegex(ValueError, "Unknown hand"):
            P.make_pose((50, 90), hand_offsets={"third": (1, 2)})
        with self.assertRaisesRegex(ValueError, r"look -1/\+1"):
            P.make_pose((50, 90), look=0)

    def test_calibration_head_and_face_render_on_the_same_pixel_grid(self):
        pose = P.make_pose((60, 90))
        positive = Image.new("RGB", (120, 120), BACKGROUND)
        negative = positive.copy()
        P.draw_actor(positive, pose, look=1)
        P.draw_actor(negative, pose, look=-1)
        hx, hy = map(round, pose["head"])
        self.assertEqual(positive.getpixel((hx + 5, hy)), SHADOW)
        self.assertEqual(positive.getpixel((hx + 4, hy)), (255, 255, 255))
        self.assertEqual(positive.getpixel((hx + 3, hy + 1)), SHADOW)
        self.assertEqual(negative.getpixel((hx + 1, hy + 1)), SHADOW)
        self.assertNotEqual(positive.tobytes(), negative.tobytes())


if __name__ == "__main__":
    unittest.main(verbosity=2)
