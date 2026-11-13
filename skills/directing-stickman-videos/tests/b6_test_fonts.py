"""Read only explicitly configured/standard local fonts for exact-reference tests.

No licensed font is bundled by this helper; an open substitute must never make
reference-pixel tests pass.
"""
from pathlib import Path
import hashlib
import os
import sys
import unittest


def standard_font_dirs():
    home = Path.home()
    if sys.platform == 'darwin':
        return [home / 'Library/Fonts', Path('/Library/Fonts'),
                Path('/System/Library/Fonts/Supplemental'), Path('/System/Library/Fonts')]
    if sys.platform == 'win32':
        return [Path(os.environ.get('WINDIR', r'C:\Windows')) / 'Fonts',
                home / 'AppData/Local/Microsoft/Windows/Fonts']
    return [home / '.local/share/fonts', home / '.fonts',
            Path('/usr/share/fonts/truetype/msttcorefonts'),
            Path('/usr/share/fonts/truetype/microsoft')]


def reference_arial_black(expected_sha, *, font_dir=None, system_dirs=None):
    """Return an exact hash match only; never recurse or search arbitrary paths."""
    configured = os.environ.get('B6_FONT_DIR') if font_dir is None else font_dir
    dirs = ([Path(configured)] if configured else []) + list(
        standard_font_dirs() if system_dirs is None else map(Path, system_dirs))
    names = {'arial black.ttf', 'arialblack.ttf', 'ariblk.ttf'}
    for directory in dirs:
        try:
            candidates = sorted(directory.iterdir())
        except OSError:
            continue
        for candidate in candidates:
            if candidate.name.lower() not in names:
                continue
            try:
                if candidate.is_file() and hashlib.sha256(candidate.read_bytes()).hexdigest() == expected_sha:
                    return candidate
            except OSError:
                continue
    return None


def require_reference_arial_black(expected_sha):
    font = reference_arial_black(expected_sha)
    if font is None:
        raise unittest.SkipTest('Exact V44 Arial Black is unavailable locally; set B6_FONT_DIR. '
                                'Open fallback is not a reference-pixel substitute.')
    return font
