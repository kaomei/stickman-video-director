"""Portable B7 reflective-ending timing, bitmap lettering and keyed Foley.

Python 3.9+, Pillow 9.1+. No music, voice, scenery or universal story renderer.
Use one EndingPlan for both rendered frames and PCM insertion times. All times
are rational frame/sample coordinates, including non-integer output rates.
"""
from dataclasses import dataclass
from fractions import Fraction
import math
import random

from PIL import Image, ImageDraw
from b7_pixel_primitives import CREAM, TEAL, draw_label, text_size


@dataclass(frozen=True)
class EndingPlan:
    lines: tuple
    start_frame: int
    fps: Fraction = Fraction(24, 1)
    frames_per_character: int = 2
    canvas: tuple = (640, 360)
    font_scale: int = 3
    line_y: tuple = (65, 100)
    margin: int = 42
    pulse_period: float = 1.2
    minimum_opacity: float = .42

    def __post_init__(self):
        if not self.lines or len(self.lines) != len(self.line_y):
            raise ValueError('Each nonempty line needs its own y coordinate')
        if any(not isinstance(s, str) or not s.strip() for s in self.lines):
            raise ValueError('Empty quote line')
        if not isinstance(self.start_frame, int) or self.start_frame < 0:
            raise ValueError('start_frame must be a nonnegative integer')
        if not isinstance(self.frames_per_character, int) or self.frames_per_character < 1:
            raise ValueError('frames_per_character must be a positive integer')
        if not isinstance(self.font_scale, int) or self.font_scale < 1:
            raise ValueError('Pixel scale must be a positive integer')
        if self.fps <= 0 or self.pulse_period < 1 or not 0 < self.minimum_opacity <= 1:
            raise ValueError('Invalid rate or unsafe pulse; use at most one gentle cycle/sec')
        for line, y in zip(self.lines, self.line_y):
            w, h = text_size(line, self.font_scale)  # Missing glyph is an error.
            x = (self.canvas[0] - w) // 2
            if x < self.margin or x+w+self.font_scale > self.canvas[0]-self.margin:
                raise ValueError('Quote overflows horizontal safe area; rewrite/recompose')
            if y < self.margin or y+h+self.font_scale > self.canvas[1]-self.margin:
                raise ValueError('Quote overflows vertical safe area')

    @property
    def count(self):
        return sum(map(len, self.lines))

    @property
    def complete_frame(self):
        return self.start_frame+(self.count-1)*self.frames_per_character

    def state(self, frame):
        shown = min(self.count, max(0, 1+(frame-self.start_frame)//self.frames_per_character))
        opacity = 1.
        if shown == self.count:
            elapsed = float(Fraction(frame-self.complete_frame, 1)/self.fps)
            opacity = self.minimum_opacity+(1-self.minimum_opacity)*(1+math.cos(2*math.pi*elapsed/self.pulse_period))/2
        return shown, opacity

    def events(self, sample_rate=48000):
        """One tick per new non-space glyph, none for spaces or completed pulse."""
        if sample_rate < 8000:
            raise ValueError('Invalid sample rate')
        result = []
        for index, char in enumerate(''.join(self.lines)):
            if char.isspace():
                continue
            frame = self.start_frame+index*self.frames_per_character
            result.append({'id': 'ending-key-%02d' % index, 'glyph_index': index,
                           'glyph': char, 'frame': frame,
                           'sample': round(Fraction(frame*sample_rate, 1)/self.fps)})
        return result

    def draw(self, image, frame, colors=(CREAM, TEAL)):
        """Return a new RGB image. Full-line origins stay fixed while typing."""
        if image.size != self.canvas:
            raise ValueError('Ending canvas mismatch; use integer nearest-neighbor scale')
        shown, opacity = self.state(frame)
        if not shown:
            return image.copy()
        layer = image.convert('RGB').copy()
        d = ImageDraw.Draw(layer)
        remaining = shown
        for j, (line, y) in enumerate(zip(self.lines, self.line_y)):
            width, height = text_size(line, self.font_scale)
            x = (self.canvas[0]-width)//2
            partial = line[:max(0, remaining)]
            draw_label(d, (x, y), partial, colors[j % len(colors)], self.font_scale)
            if 0 < remaining <= len(line) and shown < self.count:
                cursor = x+text_size(partial, self.font_scale)[0]+self.font_scale
                d.rectangle((cursor, y, cursor+self.font_scale-1, y+height-1), fill=colors[-1])
            remaining -= len(line)
        return Image.blend(image.convert('RGB'), layer, opacity)


def key_samples(index, sample_rate=48000, peak=.10):
    """58ms deterministic, softened mechanical key; mix only at plan.events().

    Peak is source-level, NOT a loudness guarantee. Calibrate against the music
    and actual encode. No impulse on every word and no loop under the final hold.
    """
    if sample_rate < 8000 or not 0 < peak <= .5:
        raise ValueError('Invalid rate or key peak')
    rng = random.Random(7130+index)
    n = round(.058*sample_rate)
    raw = [rng.uniform(-1, 1) for _ in range(n)]
    # Sub-ms low-pass smoothing avoids a sharp digital impulse.
    smoothed = [sum(raw[max(0, i-4):min(n, i+5)])/len(raw[max(0, i-4):min(n, i+5)]) for i in range(n)]
    samples = []
    for i, noise in enumerate(smoothed):
        t = i/sample_rate
        attack = min(1., t/.0007)
        down = math.exp(-t/.009)*attack
        up = math.exp(-max(0., t-.023)/.006)*.35 if t >= .023 else 0.
        tone = math.sin(2*math.pi*(650+index % 4*23)*t)
        fade = min(1., (n-1-i)/(sample_rate*.004))
        samples.append((.75*noise+.22*tone)*(down+up)*max(0., fade))
    norm = max(map(abs, samples))
    return [v*peak/norm for v in samples]
