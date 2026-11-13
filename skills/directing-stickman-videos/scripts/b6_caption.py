"""Portable B6 caption rasterizer. Portrait measurements come from Eiffel V44.

Landscape coordinates are an independent authoring proposal, not a portrait crop.
Typography validation is mechanical; semantic timing and readability still need AV review.
"""
from pathlib import Path
import hashlib
import math

FONT_SHA256 = '7d7db3ad96a31373c1437c6ab14266f6605495544c8e663558b047521174c42e'
FONT_FILE = 'engine/source/fonts/ArialBlack.ttf'
ARCHIVO_FONT_SHA256 = 'dd9a89a019b4849f66ab75455fe7bdf931311042cbb0f0f97acc061539703180'
ARCHIVO_FONT_FILE = 'fonts/ArchivoBlack.ttf'
FONT_VARIANTS = {
    'arial-black': dict(font_family='Arial Black', font_file=FONT_FILE, font_sha256=FONT_SHA256,
                        portrait_profile='eiffel-v44-portrait-v1', landscape_profile='b6-landscape-native-v1'),
    'archivo-black': dict(font_family='Archivo Black', font_file=ARCHIVO_FONT_FILE, font_sha256=ARCHIVO_FONT_SHA256,
                          portrait_profile='eiffel-v44-portrait-archivo-black-v1',
                          landscape_profile='b6-landscape-native-archivo-black-v1'),
}
COMMON = dict(font_family='Arial Black', font_file=FONT_FILE, font_sha256=FONT_SHA256,
              fill='#ffffff', stroke_fill='#171319', supersampling=3, resample='lanczos',
              anchor='ms', switch='hard_cut', autoshrink=False, pop=False)


def require(ok, message):
    if not ok:
        raise ValueError(message)


def default_profile(ratio, width, height, font_variant='arial-black'):
    require(font_variant in FONT_VARIANTS, 'Unknown B6 caption font variant')
    font = FONT_VARIANTS[font_variant]
    require(ratio in ('9:16', '16:9'), 'Choose a native B6 caption ratio')
    rw, rh = map(int, ratio.split(':'))
    require(width > 0 and height > 0 and abs(width / height - rw / rh) < .001,
            'Caption profile needs native dimensions')
    portrait = ratio == '9:16'
    scale = width / (720 if portrait else 1280)
    values = {'font_size': 47, 'stroke': 4, 'side': 44,
              'baseline': 914 if portrait else 620,
              'band': [864, 951] if portrait else [568, 664]}
    scaled = {key: ([round(x * scale) for x in value] if isinstance(value, list) else round(value * scale))
              for key, value in values.items()}
    result = dict(COMMON, font_family=font['font_family'], font_file=font['font_file'],
                  font_sha256=font['font_sha256'],
                  profile=font['portrait_profile' if portrait else 'landscape_profile'],
                  native_design=ratio, **scaled)
    if not portrait:
        result['native_layout_reason'] = ''
    return result


def validate_profile(profile, ratio, width, height, base=None):
    require(isinstance(profile, dict), 'Explicit native caption profile required')
    # Only the two explicitly named, independently fingerprinted implementations
    # are accepted. An arbitrary family/path/SHA cannot opt into a weaker gate.
    variant = next((name for name, font in FONT_VARIANTS.items()
                    if profile.get('profile') in (font['portrait_profile'], font['landscape_profile'])), None)
    require(variant is not None, 'Unknown B6 caption profile; choose a locked named font variant')
    expected = default_profile(ratio, width, height, variant)
    require('bottom' not in profile, 'Legacy caption bottom/mm positioning is not the V44 baseline contract')
    fixed = set(expected) - ({'native_layout_reason', 'font_size', 'stroke', 'side', 'baseline', 'band'} if ratio == '16:9' else set())
    for key in fixed:
        require(profile.get(key) == expected[key], 'B6 caption profile differs from primary contract: ' + key)
    if ratio == '16:9':
        require(isinstance(profile.get('native_layout_reason'), str) and profile['native_layout_reason'].strip(),
                'Landscape captions require a separately authored native_layout_reason; defaults are not approved')
        for key in ('font_size', 'stroke', 'side', 'baseline'):
            value = profile.get(key)
            require(isinstance(value, int) and not isinstance(value, bool) and value >= (1 if key in ('font_size', 'stroke') else 0),
                    'Invalid native landscape caption geometry: ' + key)
        band = profile.get('band')
        require(isinstance(band, list) and len(band) == 2 and all(isinstance(v, int) for v in band)
                and 0 <= band[0] < profile['baseline'] <= band[1] < height,
                'Native landscape caption band/baseline is outside the frame')
        require(profile['side'] * 2 < width and profile['font_size'] < height,
                'Native landscape caption safe zone is outside the frame')
    if base is not None:
        base = Path(base).resolve()
        font = (base / profile['font_file']).resolve()
        require(font.is_relative_to(base) and font.is_file(), 'Project-local ' + expected['font_family'] + ' font missing')
        require(hashlib.sha256(font.read_bytes()).hexdigest() == expected['font_sha256'],
                'B6 caption font identity differs from locked ' + expected['font_family'])
    return dict(profile)


class CaptionRenderer:
    """Fixed-size baseline text; paint at 3x and downsample only the transparent ink."""
    def __init__(self, base, ratio, width, height, profile):
        from PIL import ImageFont
        self.base = Path(base)
        self.width, self.height = width, height
        self.profile = validate_profile(profile, ratio, width, height, base)
        self.scale = self.profile['supersampling']
        self.font = ImageFont.truetype(str(self.base / self.profile['font_file']), self.profile['font_size'] * self.scale)
        self.cache = {}

    def raster(self, text):
        from PIL import Image, ImageDraw
        require(isinstance(text, str) and text.strip() and '\n' not in text,
                'One semantic caption line required')
        if text in self.cache:
            return self.cache[text]
        scale = self.scale
        layer = Image.new('RGBA', (self.width * scale, self.height * scale), (0, 0, 0, 0))
        draw = ImageDraw.Draw(layer)
        pos = (self.width * scale / 2, self.profile['baseline'] * scale)
        box = draw.textbbox(pos, text, font=self.font, anchor='ms', stroke_width=self.profile['stroke'] * scale)
        side = self.profile['side'] * scale
        band = self.profile['band']
        require(box[0] >= side and box[2] <= self.width * scale - side,
                'Caption exceeds fixed-size safe zone; choose a semantic break, never auto-shrink')
        require(box[1] >= band[0] * scale and box[3] <= band[1] * scale,
                'Caption exceeds native baseline band; inspect the semantic line and glyphs')
        draw.text(pos, text, font=self.font, anchor='ms', fill=self.profile['fill'],
                  stroke_width=self.profile['stroke'] * scale, stroke_fill=self.profile['stroke_fill'])
        layer = layer.resize((self.width, self.height), Image.Resampling.LANCZOS)
        # This is a measured raster box, including the Lanczos fringe, not a visual score.
        bounds = list(layer.getchannel('A').getbbox())
        result = (layer, bounds)
        self.cache[text] = result
        return result

    def draw(self, image, text):
        require(image.size == (self.width, self.height), 'Caption render needs the actual native frame')
        layer, bounds = self.raster(text)
        image.paste(layer, (0, 0), layer)
        return bounds


def contract(profile, renderer_path, font_path, cues_sha256, observations):
    return dict(profile=dict(profile), renderer_sha256=hashlib.sha256(Path(renderer_path).read_bytes()).hexdigest(),
                font_sha256=hashlib.sha256(Path(font_path).read_bytes()).hexdigest(),
                cues_sha256=cues_sha256, observed_cues=observations,
                limitation='Configuration, font identity and measured caption raster only; decoded pixels, semantic speech timing and AV readability still require review.')
