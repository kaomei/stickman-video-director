"""Measured V44 caption geometry and real raster/codec contract, no aesthetic score."""
from pathlib import Path
import hashlib
import importlib.util
import json
import shutil
import subprocess
import tempfile
import unittest
from PIL import Image
from b6_test_fonts import reference_arial_black

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('b6_caption_test_helper', ROOT / 'scripts/b6_caption.py')
captions = importlib.util.module_from_spec(spec)
spec.loader.exec_module(captions)


class CaptionContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix='b6-caption-native-')
        cls.base = Path(cls.tmp.name)
        font = cls.base / captions.FONT_FILE
        font.parent.mkdir(parents=True)
        cls.native_font = reference_arial_black(captions.FONT_SHA256)
        if cls.native_font is not None:
            shutil.copyfile(cls.native_font, font)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def require_native_font(self):
        if self.native_font is None:
            self.skipTest('Exact V44 Arial Black unavailable locally; B6_FONT_DIR may supply it. Open fallback is not pixel equivalent.')

    def test_measured_portrait_profile_and_rejected_legacy_variants(self):
        profile = captions.default_profile('9:16', 720, 1280)
        self.assertEqual((profile['font_size'], profile['stroke'], profile['baseline'], profile['band'], profile['side']),
                         (47, 4, 914, [864, 951], 44))
        self.assertEqual(captions.validate_profile(profile, '9:16', 720, 1280), profile)
        for key, value in [('font_size', 42), ('font_size', 60), ('stroke', 5), ('bottom', 180), ('anchor', 'mm'),
                           ('fill', '#fffdf8'), ('stroke_fill', '#251e23'), ('supersampling', 1), ('resample', 'bicubic'),
                           ('baseline', 1100), ('pop', True), ('autoshrink', True)]:
            with self.subTest(key=key, value=value):
                altered = {**profile, key: value}
                with self.assertRaisesRegex(ValueError, 'caption|Caption'):
                    captions.validate_profile(altered, '9:16', 720, 1280)

    def test_six_primary_phrases_keep_measured_baseline_and_descender_bounds(self):
        self.require_native_font()
        # Independently compared pixel-for-pixel with the V44 source rasterizer.
        # These observed bounds include Lanczos fringes, not guessed font metrics.
        measured = {'This man': [237, 874, 481, 921], 'the Eiffel Tower.': [142, 873, 577, 921],
                    'got suspicious,': [160, 874, 558, 931], 'Victor Lustig': [187, 874, 530, 931],
                    'In 1925,': [254, 873, 467, 930], 'too embarrassed': [138, 874, 580, 921]}
        renderer = captions.CaptionRenderer(self.base, '9:16', 720, 1280, captions.default_profile('9:16', 720, 1280))
        for text, bounds in measured.items():
            with self.subTest(text=text):
                layer, actual = renderer.raster(text)
                self.assertEqual(actual, bounds)
                self.assertEqual(layer.mode, 'RGBA')
                self.assertEqual(layer.size, (720, 1280))
        with self.assertRaisesRegex(ValueError, 'semantic break'):
            renderer.raster('This deliberately overlong sentence cannot fit into a fixed-size semantic caption line.')
        self.assertEqual(renderer.profile['font_size'], 47)

    def test_landscape_requires_native_authoring_and_does_not_inherit_portrait_coordinates(self):
        profile = captions.default_profile('16:9', 1280, 720)
        with self.assertRaisesRegex(ValueError, 'native_layout_reason'):
            captions.validate_profile(profile, '16:9', 1280, 720)
        profile['native_layout_reason'] = 'Independent native framing tested below the prop contacts.'
        self.assertEqual(captions.validate_profile(profile, '16:9', 1280, 720)['baseline'], 620)
        altered = {**profile, 'baseline': 914, 'band': [864, 951]}
        with self.assertRaisesRegex(ValueError, 'outside the frame'):
            captions.validate_profile(altered, '16:9', 1280, 720)

    def test_open_fallback_cannot_satisfy_reference_font_gate(self):
        # This gate test must run even on machines without the licensed font.
        with tempfile.TemporaryDirectory(prefix='b6-caption-fallback-') as directory:
            base = Path(directory)
            target = base / captions.FONT_FILE
            target.parent.mkdir(parents=True)
            shutil.copyfile(ROOT / 'assets/fonts/Nunito.ttf', target)
            self.assertNotEqual(hashlib.sha256(target.read_bytes()).hexdigest(), captions.FONT_SHA256)
            with self.assertRaisesRegex(ValueError, 'font identity differs'):
                captions.validate_profile(captions.default_profile('9:16', 720, 1280), '9:16', 720, 1280, base)

    def test_font_profile_lock_cannot_be_replaced_by_fallback_identity(self):
        profile = captions.default_profile('9:16', 720, 1280)
        for key, value in [('font_family', 'Nunito'), ('font_file', 'fallback.ttf'), ('font_sha256', '0' * 64)]:
            with self.subTest(key=key), self.assertRaisesRegex(ValueError, 'differs from primary contract'):
                captions.validate_profile({**profile, key: value}, '9:16', 720, 1280)

    def test_native_caption_survives_encode_decode_at_the_same_band(self):
        self.require_native_font()
        renderer = captions.CaptionRenderer(self.base, '9:16', 720, 1280, captions.default_profile('9:16', 720, 1280))
        picture = Image.new('RGB', (720, 1280), (84, 92, 100))
        bounds = renderer.draw(picture, 'Victor Lustig')
        image, movie, decoded = (self.base / name for name in ['caption.png', 'caption.mp4', 'decoded.png'])
        picture.save(image)
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-loop', '1', '-i', str(image), '-t', '0.1',
                        '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', str(movie)], check=True)
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', str(movie), '-frames:v', '1', str(decoded)], check=True)
        import numpy as np
        pixels = np.asarray(Image.open(decoded).convert('RGB'))
        # White caption interiors after lossy encode are still in the observed V44 band.
        ys, xs = np.where(pixels.min(axis=2) > 225)
        self.assertTrue(len(xs) > 100)
        self.assertGreaterEqual(int(ys.min()), 864)
        self.assertLessEqual(int(ys.max()), 951)
        self.assertLess(int(ys.mean()), 960)
        self.assertEqual(bounds, [187, 874, 530, 931])
        self.assertEqual(hashlib.sha256((self.base / captions.FONT_FILE).read_bytes()).hexdigest(), captions.FONT_SHA256)


class ArchivoCaptionContract(unittest.TestCase):
    """Public OFL profile is explicit; it does not impersonate original V44 ink."""
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix='b6-caption-archivo-')
        cls.base = Path(cls.tmp.name)
        target = cls.base / captions.ARCHIVO_FONT_FILE
        target.parent.mkdir(parents=True)
        shutil.copyfile(ROOT / 'assets/fonts/ArchivoBlack.ttf', target)

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_public_variant_keeps_geometry_paint_and_switch_contract(self):
        font_fields = {'profile', 'font_family', 'font_file', 'font_sha256'}
        for ratio, width, height in [('9:16', 720, 1280), ('9:16', 1080, 1920),
                                     ('16:9', 1280, 720), ('16:9', 1920, 1080)]:
            with self.subTest(ratio=ratio, width=width):
                original = captions.default_profile(ratio, width, height)
                public = captions.default_profile(ratio, width, height, font_variant='archivo-black')
                self.assertEqual({k: v for k, v in original.items() if k not in font_fields},
                                 {k: v for k, v in public.items() if k not in font_fields})
                self.assertEqual(public['font_family'], 'Archivo Black')
                self.assertEqual(public['font_file'], 'fonts/ArchivoBlack.ttf')
                self.assertEqual(public['font_sha256'], captions.ARCHIVO_FONT_SHA256)
                if ratio == '16:9':
                    with self.assertRaisesRegex(ValueError, 'native_layout_reason'):
                        captions.validate_profile(public, ratio, width, height, self.base)
                    public['native_layout_reason'] = 'Independently authored native public-font test.'
                self.assertEqual(captions.validate_profile(public, ratio, width, height, self.base), public)

    def test_three_actual_rasters_match_measured_reference_widths_at_same_size(self):
        # The long phrases use native landscape space; they are not squeezed into
        # the narrower portrait semantic-caption safe zone or horizontally scaled.
        profile = captions.default_profile('16:9', 1280, 720, 'archivo-black')
        profile['native_layout_reason'] = 'Same-size font comparison in native landscape safe space.'
        renderer = captions.CaptionRenderer(self.base, '16:9', 1280, 720, profile)
        measured = {'anyway.': (221, 48), 'He sold the Eiffel Tower.': (642, 48),
                    'He gave her two pieces.': (629, 58)}
        self.assertEqual((profile['font_size'], profile['stroke'], profile['baseline'], profile['band']),
                         (47, 4, 620, [568, 664]))
        for text, (width, height) in measured.items():
            with self.subTest(text=text):
                layer, bounds = renderer.raster(text)
                self.assertEqual((bounds[2]-bounds[0], bounds[3]-bounds[1]), (width, height))
                self.assertEqual(layer.size, (1280, 720))

    def test_unknown_or_mixed_named_profiles_and_false_font_identity_are_rejected(self):
        public = captions.default_profile('9:16', 720, 1280, 'archivo-black')
        original = captions.default_profile('9:16', 720, 1280)
        with self.assertRaisesRegex(ValueError, 'Unknown B6 caption font variant'):
            captions.default_profile('9:16', 720, 1280, 'unlocked-fallback')
        with self.assertRaisesRegex(ValueError, 'Unknown B6 caption profile'):
            captions.validate_profile({**public, 'profile': 'arbitrary-substitute-v1'}, '9:16', 720, 1280)
        for key in ('profile', 'font_family', 'font_file', 'font_sha256'):
            with self.subTest(key=key), self.assertRaisesRegex(ValueError, 'differs from primary contract'):
                captions.validate_profile({**public, key: original[key]}, '9:16', 720, 1280)
        target = self.base / captions.ARCHIVO_FONT_FILE
        data = target.read_bytes()
        try:
            shutil.copyfile(ROOT / 'assets/fonts/Nunito.ttf', target)
            with self.assertRaisesRegex(ValueError, 'font identity differs'):
                captions.validate_profile(public, '9:16', 720, 1280, self.base)
        finally:
            target.write_bytes(data)
        # Even the approved public font cannot silently enter the old profile.
        with tempfile.TemporaryDirectory(prefix='b6-caption-mislabeled-') as directory:
            base = Path(directory)
            target = base / captions.FONT_FILE
            target.parent.mkdir(parents=True)
            shutil.copyfile(self.base / captions.ARCHIVO_FONT_FILE, target)
            with self.assertRaisesRegex(ValueError, 'font identity differs'):
                captions.validate_profile(original, '9:16', 720, 1280, base)


if __name__ == '__main__':
    unittest.main()
