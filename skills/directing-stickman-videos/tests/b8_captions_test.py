"""Portable cmap coverage tests; these are not visual or timing approvals."""
import importlib.util
from pathlib import Path
import struct
import tempfile
import unittest

from PIL import ImageFont

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("b8_captions", ROOT / "scripts/b8_captions.py")
captions = importlib.util.module_from_spec(spec)
spec.loader.exec_module(captions)


def cmap_table(subtable, platform=3, encoding=None):
    fmt = struct.unpack_from(">H", subtable)[0]
    encoding = (10 if fmt in {10, 12, 13} else 1) if encoding is None else encoding
    return struct.pack(">HHHHI", 0, 1, platform, encoding, 12) + subtable


def groups(groups, fmt=12):
    return struct.pack(">HHIII", fmt, 0, 16 + 12 * len(groups), 0, len(groups)) + b"".join(struct.pack(">III", *group) for group in groups)


def font_bytes(subtable, *, base=0, signature=b"\x00\x01\x00\x00", glyph_count=1024):
    cmap = cmap_table(subtable)
    maxp = struct.pack(">IH", 0x00005000, glyph_count)
    directory_size = 12 + 2 * 16
    return (signature + struct.pack(">HHHH", 2, 0, 0, 0)
            + struct.pack(">4sIII", b"cmap", 0, base + directory_size, len(cmap))
            + struct.pack(">4sIII", b"maxp", 0, base + directory_size + len(cmap), len(maxp))
            + cmap + maxp)


class CaptionCoverageTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="b8-caption-font-test-")
        self.addCleanup(self.temp.cleanup)
        self.font = Path(self.temp.name) / "fixture.ttf"

    def write_font(self, subtable, **kwargs):
        self.font.write_bytes(font_bytes(subtable, **kwargs))
        return self.font

    def test_shipped_font_is_readable_and_english_is_covered_but_chinese_is_not(self):
        font = ROOT / "assets/fonts/NotoSans.ttf"
        self.assertGreater(ImageFont.truetype(str(font), 24).getlength("A fallen leaf."), 0)
        captions.assert_font_coverage(font, "A fallen leaf. Élan — naïve 1\u00a0000; A\u2009leaf.")
        self.assertEqual(captions.font_missing_glyphs(font, "中中文中"), ["中", "文"])
        with self.assertRaisesRegex(ValueError, r"'中' \(U\+4E2D\).*'文' \(U\+6587\)"):
            captions.assert_font_coverage(font, "中文")

    def test_format4_range_offsets_delta_and_notdef_are_distinguished(self):
        # A uses idDelta. B/C use glyphIdArray [2, 0] with delta +1;
        # the zero (.notdef) for C must remain zero after applying the delta.
        subtable = (struct.pack(">7H", 4, 44, 0, 6, 0, 0, 0)
                    + struct.pack(">3H", 65, 67, 0xFFFF) + struct.pack(">H", 0)
                    + struct.pack(">3H", 65, 66, 0xFFFF)
                    + struct.pack(">3H", (1 - 65) & 0xFFFF, 1, 1)
                    + struct.pack(">3H", 0, 4, 0) + struct.pack(">2H", 2, 0))
        font = self.write_font(subtable)
        self.assertEqual(captions.font_missing_glyphs(font, "ABCD"), ["C", "D"])
        broken = bytearray(subtable)
        struct.pack_into(">H", broken, 36, 0xFFFE)
        self.write_font(bytes(broken))
        with self.assertRaisesRegex(ValueError, "truncated"):
            captions.font_missing_glyphs(font, "B")

    def test_full_unicode_and_otf_cmap_maps_supplementary_characters(self):
        font = self.write_font(groups([(65, 65, 1), (0x1F600, 0x1F600, 2)]), signature=b"OTTO")
        self.assertEqual(captions.font_missing_glyphs(font, "A😀汉"), ["汉"])
        self.write_font(groups([(65, 67, 2)], fmt=13))
        self.assertEqual(captions.font_missing_glyphs(font, "ABCD"), ["D"])

    def test_legacy_unicode_trimmed_cmaps(self):
        glyphs = bytearray(256)
        glyphs[65] = 1
        fixtures = [(struct.pack(">3H", 0, 262, 0) + bytes(glyphs), "AB", ["B"]),
                    (struct.pack(">5H3H", 6, 16, 0, 65, 3, 1, 0, 2), "ABC", ["B"]),
                    (struct.pack(">HHIIII2H", 10, 0, 24, 0, 0x1F600, 2, 2, 0), "😀😁", ["😁"])]
        for subtable, text, missing in fixtures:
            with self.subTest(format=struct.unpack_from(">H", subtable)[0]):
                self.assertEqual(captions.font_missing_glyphs(self.write_font(subtable), text), missing)

    def test_ttc_face_selection_and_wrong_indexes_fail_clearly(self):
        first = font_bytes(groups([(65, 65, 1)]), base=20)
        second_offset = 20 + len(first)
        second = font_bytes(groups([(0x4E2D, 0x4E2D, 1)]), base=second_offset)
        self.font.write_bytes(struct.pack(">4sIIII", b"ttcf", 0x00010000, 2, 20, second_offset) + first + second)
        self.assertEqual(captions.font_missing_glyphs(self.font, "A中"), ["中"])
        self.assertEqual(captions.font_missing_glyphs(self.font, "A中", font_index=1), ["A"])
        with self.assertRaisesRegex(ValueError, "outside 2 faces"):
            captions.font_missing_glyphs(self.font, "A", font_index=2)
        self.write_font(groups([(65, 65, 1)]))
        for index in (1, -1, True, "0"):
            with self.subTest(index=index), self.assertRaisesRegex(ValueError, "font_index"):
                captions.font_missing_glyphs(self.font, "A", font_index=index)

    def test_changed_file_at_same_path_does_not_reuse_coverage(self):
        self.write_font(groups([(65, 65, 1)]))
        self.assertEqual(captions.font_missing_glyphs(self.font, "AB"), ["B"])
        self.write_font(groups([(66, 66, 1)]))
        self.assertEqual(captions.font_missing_glyphs(self.font, "AB"), ["A"])

    def test_truncated_unsupported_and_invalid_glyph_mapping_fail_closed(self):
        for data in (b"", b"wOF2" + bytes(8), font_bytes(struct.pack(">3H", 2, 6, 0)),
                     font_bytes(groups([(65, 65, 5)]), glyph_count=2),
                     font_bytes(groups([(65, 65, 1)]))[:-2]):
            self.font.write_bytes(data)
            with self.subTest(length=len(data)), self.assertRaises(ValueError):
                captions.font_missing_glyphs(self.font, "A")

    def test_spaces_marks_and_format_controls_do_not_hide_missing_visible_glyphs(self):
        font = ROOT / "assets/fonts/NotoSans.ttf"
        text = "A\u00a0B\u2009e\u0301\u200d"
        self.assertEqual(captions.caption_text_errors(text), [])
        self.assertEqual(captions.font_missing_glyphs(font, text), [])
        self.assertEqual(captions.font_missing_glyphs(font, "A\ufe0f\u200d中"), ["中"])
        for text in ("", " \u00a0", "\u200d\ufe0f", "A\tB", "A\nB", "A\u2028B", "A\x00B", "A\ud800B"):
            with self.subTest(text=repr(text)):
                self.assertTrue(captions.caption_text_errors(text))


if __name__ == "__main__":
    unittest.main()
