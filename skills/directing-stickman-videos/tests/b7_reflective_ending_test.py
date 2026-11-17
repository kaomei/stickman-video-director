"""Behavior, not string assertions: shared glyph/video/PCM trigger contract."""
import sys
import unittest
from fractions import Fraction
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'scripts'))
from b7_reflective_ending import EndingPlan, key_samples
from b7_pixel_primitives import text_size


class EndingBehavior(unittest.TestCase):
    def plan(self, **kw):
        args = dict(lines=("DON'T SKIP YOUR LIFE.", 'LIVE IT.'), start_frame=995)
        args.update(kw)
        return EndingPlan(**args)

    def test_frame_boundaries_and_monotonic_reveal(self):
        p = self.plan()
        self.assertEqual(p.state(994)[0], 0)
        self.assertEqual(p.state(995)[0], 1)
        self.assertEqual(p.state(996)[0], 1)
        self.assertEqual(p.state(997)[0], 2)
        self.assertEqual(p.state(p.complete_frame)[0], p.count)
        self.assertEqual(sorted(p.state(i)[0] for i in range(1200)), [p.state(i)[0] for i in range(1200)])

    def test_key_count_and_actual_visible_transition(self):
        p = self.plan()
        self.assertEqual(len(p.events()), 25)
        for event in p.events():
            i, f = event['glyph_index'], event['frame']
            self.assertLessEqual(p.state(f-1)[0], i)
            self.assertGreater(p.state(f)[0], i)
            self.assertFalse(event['glyph'].isspace())
            self.assertEqual(event['sample'], f*2000)

    def test_fractional_fps_has_no_accumulated_sample_drift(self):
        p = self.plan(fps=Fraction(132, 5))
        for e in p.events():
            self.assertLessEqual(abs(Fraction(e['sample'], 48000)-Fraction(e['frame'], 1)/p.fps), Fraction(1, 96000))

    def test_completed_pulse_is_gentle_and_never_creates_ticks(self):
        p = self.plan()
        self.assertTrue(all(.42 <= p.state(i)[1] <= 1 for i in range(p.complete_frame, p.complete_frame+200)))
        self.assertLess(p.state(p.complete_frame+14)[1], .5)
        self.assertEqual(max(e['frame'] for e in p.events()), p.complete_frame)

    def test_drawing_changes_only_quote_area_not_background(self):
        p = self.plan()
        base = Image.new('RGB', p.canvas, '#203040')
        self.assertEqual(p.draw(base, 0).tobytes(), base.tobytes())
        partial = p.draw(base, p.start_frame+6)
        complete = p.draw(base, p.complete_frame)
        self.assertNotEqual(partial.tobytes(), complete.tobytes())
        self.assertEqual(complete.crop((0,150,640,360)).tobytes(), base.crop((0,150,640,360)).tobytes())
        self.assertEqual(base.getpixel((320,65)), (32,48,64))

    def test_fixed_first_glyph_origin(self):
        p = self.plan()
        base = Image.new('RGB', p.canvas, '#203040')
        a, b = p.draw(base, p.start_frame), p.draw(base, p.start_frame+4)
        # First glyph stays centered on the full line, never recenters partial text.
        x = (p.canvas[0]-text_size(p.lines[0], p.font_scale)[0])//2
        w, h = text_size(p.lines[0][0], p.font_scale)
        box = (x, p.line_y[0], x+w, p.line_y[0]+h)
        self.assertNotEqual(a.crop(box).tobytes(), base.crop(box).tobytes())
        self.assertEqual(a.crop(box).tobytes(), b.crop(box).tobytes())

    def test_rejects_missing_glyph_oversize_or_fast_flash(self):
        for args in ({'lines': ('中',), 'line_y': (65,)}, {'lines': ('A'*80,), 'line_y': (65,)},
                     {'pulse_period': .1}, {'frames_per_character': 0}, {'font_scale': 1.5}):
            with self.assertRaises((ValueError, KeyError)):
                self.plan(**args)

    def test_key_is_repeatable_bounded_and_fades_out(self):
        a = key_samples(3)
        self.assertEqual(a, key_samples(3))
        self.assertNotEqual(a, key_samples(4))
        self.assertEqual(len(a), 2784)
        self.assertAlmostEqual(max(map(abs,a)), .1)
        self.assertEqual(a[0], 0)
        self.assertEqual(a[-1], 0)

    def test_story_text_is_not_fixed_to_fast_forward(self):
        p = self.plan(lines=('CHOOSE WHAT MATTERS.', 'THEN TAKE A STEP.'))
        self.assertNotIn('SKIP', ''.join(p.lines))
        self.assertEqual(len(p.events()), sum(not c.isspace() for c in ''.join(p.lines)))


if __name__ == '__main__':
    unittest.main()
