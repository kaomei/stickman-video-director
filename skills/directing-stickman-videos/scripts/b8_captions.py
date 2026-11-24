"""B8 caption character checks without a platform font database or FontTools.

Read the font that will actually ship with the project. TTF/OTF Unicode cmap
formats 0, 4, 6, 10, 12 and 13 are supported, including a selected TTC face.
This checks character coverage, not shaping, legibility or semantic timing.
It never substitutes a font, edits text, shrinks type or creates line breaks.
"""
from __future__ import annotations

from bisect import bisect_left
from functools import lru_cache
from pathlib import Path
import struct
import unicodedata


def _describe(char):
    return f"{char!r} (U+{ord(char):04X})"


def _invisible_format(char):
    value = ord(char)
    # Joiners, bidi controls and variation selectors are shaping instructions,
    # rather than visible glyphs. Combining marks still require font coverage.
    return unicodedata.category(char) == "Cf" or 0xFE00 <= value <= 0xFE0F or 0xE0100 <= value <= 0xE01EF


def caption_text_errors(text):
    """Reject hidden/control-only cues and line/control characters; keep text intact."""
    if not isinstance(text, str):
        return ["caption cue needs one nonempty semantic line"]
    invalid = list(dict.fromkeys(char for char in text if unicodedata.category(char) in {"Cc", "Cs", "Zl", "Zp"}))
    errors = []
    if invalid:
        errors.append("caption cue must be one semantic line without control characters: " + ", ".join(map(_describe, invalid)))
    if not any(not char.isspace() and not _invisible_format(char) for char in text):
        errors.append("caption cue needs one nonempty semantic line")
    return errors


class _Cmap:
    def __init__(self, data, font_index):
        self.data = data
        if not isinstance(font_index, int) or isinstance(font_index, bool) or font_index < 0:
            raise ValueError("caption font_index must be a nonnegative integer")
        self._slice(0, 4)
        face = 0
        if data[:4] == b"ttcf":
            self._slice(0, 12)
            if self._u32(4) not in {0x00010000, 0x00020000}:
                raise ValueError("unsupported TTC version; use a standalone TTF/OTF")
            count = self._u32(8)
            self._slice(12, 4 * count)
            if font_index >= count:
                raise ValueError(f"TTC font_index {font_index} outside {count} faces")
            face = self._u32(12 + 4 * font_index)
        elif font_index:
            raise ValueError("font_index must be 0 for a standalone TTF/OTF")
        self._slice(face, 12)
        if data[face:face + 4] not in {b"\x00\x01\x00\x00", b"OTTO"}:
            raise ValueError("unsupported caption font container; use sfnt TTF/OTF or TTC (not WOFF/WOFF2)")
        count = self._u16(face + 4)
        self._slice(face + 12, 16 * count)
        tables = {}
        for index in range(count):
            record = face + 12 + 16 * index
            tag = data[record:record + 4]
            offset, length = self._u32(record + 8), self._u32(record + 12)
            self._slice(offset, length)
            if tag in tables:
                raise ValueError("invalid caption font: duplicate sfnt table")
            tables[tag] = (offset, length)
        if b"cmap" not in tables or b"maxp" not in tables:
            raise ValueError("caption font requires Unicode cmap and maxp tables")
        maxp, maxp_length = tables[b"maxp"]
        self._slice(maxp, 6, maxp + maxp_length)
        self.num_glyphs = self._u16(maxp + 4)
        if not self.num_glyphs:
            raise ValueError("invalid caption font: no glyphs")
        cmap, cmap_length = tables[b"cmap"]
        limit = cmap + cmap_length
        self._slice(cmap, 4, limit)
        if self._u16(cmap) != 0:
            raise ValueError("unsupported Unicode cmap version")
        count = self._u16(cmap + 2)
        self._slice(cmap + 4, count * 8, limit)
        candidates, unsupported = [], set()
        for index in range(count):
            record = cmap + 4 + index * 8
            platform, encoding = self._u16(record), self._u16(record + 2)
            if not (platform == 0 and encoding != 5 or platform == 3 and encoding in {1, 10}):
                continue
            offset = cmap + self._u32(record + 4)
            self._slice(offset, 2, limit)
            fmt = self._u16(offset)
            if fmt not in {0, 4, 6, 10, 12, 13}:
                unsupported.add(fmt)
                continue
            # Prefer a full-repertoire cmap, then Windows Unicode mappings.
            # Do not union incompatible charmaps: the selected face must cover
            # every required character in one Unicode charmap.
            score = (fmt in {10, 12, 13}, platform == 3 and encoding == 10,
                     platform == 3 and encoding == 1, fmt in {4, 12}, index)
            candidates.append((score, offset, fmt))
        if not candidates:
            detail = ", ".join(map(str, sorted(unsupported))) or "none"
            raise ValueError(f"caption font has no supported Unicode cmap (found formats: {detail}; supported: 0/4/6/10/12/13)")
        _, self.offset, self.fmt = max(candidates)
        offset, fmt = self.offset, self.fmt
        self._slice(offset, 8 if fmt < 8 else 16, limit)
        length = self._u16(offset + 2) if fmt < 8 else self._u32(offset + 4)
        self.end = offset + length
        self._slice(offset, length, limit)
        if fmt == 4:
            count = self._u16(offset + 6)
            if not count or count % 2:
                raise ValueError("invalid caption font cmap format 4 segment count")
            count //= 2
            self._slice(offset, 16 + count * 8, self.end)
            self.ends = [self._u16(offset + 14 + index * 2) for index in range(count)]
            self.starts = [self._u16(offset + 16 + count * 2 + index * 2) for index in range(count)]
            self.delta = offset + 16 + count * 4
            self.ranges = offset + 16 + count * 6
            self.glyph_array = self.ranges + 2 * count
            if any(start > end or index and start <= self.ends[index - 1]
                   for index, (start, end) in enumerate(zip(self.starts, self.ends))):
                raise ValueError("invalid caption font cmap format 4 segments")
        elif fmt in {12, 13}:
            count = self._u32(offset + 12)
            self._slice(offset + 16, count * 12, self.end)
            self.groups = [struct.unpack_from(">III", data, offset + 16 + index * 12) for index in range(count)]
            self.ends = [group[1] for group in self.groups]
            if any(start > end or end > 0x10FFFF or index and start <= self.ends[index - 1]
                   for index, (start, end, _) in enumerate(self.groups)):
                raise ValueError("invalid caption font cmap groups")
        elif fmt == 0:
            self._slice(offset, 262, self.end)
        else:
            header = 10 if fmt == 6 else 20
            self._slice(offset, header, self.end)
            self.first = self._u16(offset + 6) if fmt == 6 else self._u32(offset + 12)
            self.count = self._u16(offset + 8) if fmt == 6 else self._u32(offset + 16)
            if self.first + self.count > (0x10000 if fmt == 6 else 0x110000):
                raise ValueError("invalid caption font cmap character range")
            self.glyphs = offset + header
            self._slice(self.glyphs, self.count * 2, self.end)

    def _slice(self, offset, length, limit=None):
        limit = len(self.data) if limit is None else min(limit, len(self.data))
        if offset < 0 or length < 0 or offset > limit or length > limit - offset:
            raise ValueError("invalid/truncated caption font table")

    def _u16(self, offset):
        self._slice(offset, 2)
        return struct.unpack_from(">H", self.data, offset)[0]

    def _u32(self, offset):
        self._slice(offset, 4)
        return struct.unpack_from(">I", self.data, offset)[0]

    def glyph(self, codepoint):
        gid = 0
        offset, fmt = self.offset, self.fmt
        if fmt == 4 and codepoint <= 0xFFFF:
            index = bisect_left(self.ends, codepoint)
            if index < len(self.ends) and self.starts[index] <= codepoint:
                delta = self._u16(self.delta + 2 * index)
                entry = self.ranges + 2 * index
                distance = self._u16(entry)
                if distance:
                    address = entry + distance + 2 * (codepoint - self.starts[index])
                    if distance % 2 or address < self.glyph_array:
                        raise ValueError("invalid caption font cmap glyph array offset")
                    self._slice(address, 2, self.end)
                    gid = self._u16(address)
                    if gid:
                        gid = (gid + delta) & 0xFFFF
                else:
                    gid = (codepoint + delta) & 0xFFFF
        elif fmt in {12, 13}:
            index = bisect_left(self.ends, codepoint)
            if index < len(self.groups):
                start, end, first_gid = self.groups[index]
                if start <= codepoint <= end:
                    gid = first_gid if fmt == 13 else first_gid + codepoint - start
        elif fmt == 0 and codepoint < 256:
            gid = self.data[offset + 6 + codepoint]
        elif fmt in {6, 10} and self.first <= codepoint < self.first + self.count:
            gid = self._u16(self.glyphs + (codepoint - self.first) * 2)
        if gid >= self.num_glyphs:
            raise ValueError(f"invalid caption font cmap: U+{codepoint:04X} maps outside maxp glyph count")
        return gid


@lru_cache(maxsize=4)
def _cmap(data, font_index):
    return _Cmap(data, font_index)


def font_missing_glyphs(font_path, text, *, font_index=0):
    """Return unique missing characters in source order; malformed fonts raise.

    Font bytes form the cache key, so replacing a file at the same path cannot
    reuse stale coverage. Whitespace requires real coverage; invisible shaping
    instructions do not. Call caption_text_errors separately for control policy.
    """
    if not isinstance(text, str):
        raise ValueError("caption text must be a string")
    cmap = _cmap(Path(font_path).read_bytes(), font_index)
    return [char for char in dict.fromkeys(text) if not _invisible_format(char) and not cmap.glyph(ord(char))]


def assert_font_coverage(font_path, text, *, font_index=0):
    """Raise ValueError with characters/codepoints instead of accepting tofu."""
    missing = font_missing_glyphs(font_path, text, font_index=font_index)
    if missing:
        raise ValueError("caption font missing glyphs: " + ", ".join(map(_describe, missing)))
