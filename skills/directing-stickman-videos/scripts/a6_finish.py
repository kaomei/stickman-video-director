#!/usr/bin/env python3
"""Local A6 packaging of clean edited picture and an approved synchronized mix.

No generation, speech synthesis, semantic segmentation or watermark insertion.
"""
import argparse
from datetime import datetime, timezone
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import re
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFont


def tokens(text):
    return re.findall(r"\w+(?:['’]\w+)*", text.upper().replace('’', "'"))


def sha(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def probe(path):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)
    ]))


def validate_sequence(items, duration, label):
    previous = 0.0
    for item in items:
        start, end = float(item['start']), float(item['end'])
        if not (math.isfinite(start) and math.isfinite(end)
                and 0 <= start < end <= duration + .05 and start >= previous - 1e-6):
            raise ValueError(f'{label}: invalid, overlapping or out-of-range times: {item}')
        previous = end


def prepare(config_path):
    config_path = Path(config_path).resolve()
    cfg = json.loads(config_path.read_text())
    def resolve(key, default=None):
        value = cfg.get(key, default)
        if not value:
            raise ValueError(f'Missing {key}')
        path = Path(value)
        path = path if path.is_absolute() else config_path.parent / path
        if not path.is_file():
            raise ValueError(f'{key} not available: {path}')
        return path.resolve()

    for tool in ('ffmpeg', 'ffprobe'):
        if not shutil.which(tool):
            raise ValueError(f'{tool} is required; no automatic install')
    picture, audio = resolve('picture'), resolve('audio')
    caption_font = resolve('caption_font', '/System/Library/Fonts/Supplemental/Impact.ttf')
    title_font = resolve('title_font', '/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf')
    vp, ap = probe(picture), probe(audio)
    video = next(s for s in vp['streams'] if s['codec_type'] == 'video')
    sound = next(s for s in ap['streams'] if s['codec_type'] == 'audio')
    fps = Fraction(video['avg_frame_rate'])
    if fps <= 0 or abs(float(fps) - float(Fraction(video['r_frame_rate']))) > .01:
        raise ValueError('Use a constant-frame-rate clean montage before packaging')
    w, h = int(video['width']), int(video['height'])
    if w % 2 or h % 2:
        raise ValueError('H.264 delivery requires even dimensions')
    duration = float(video.get('duration', vp['format']['duration']))
    if abs(float(sound.get('duration', ap['format']['duration'])) - duration) > .4:
        raise ValueError('Picture and approved mix differ by more than 0.4 seconds; synchronize first')
    cues, words = cfg['cues'], cfg['words']
    if not cues or not words or not tokens(cfg['script']):
        raise ValueError('Nonempty approved script, semantic cues and word alignment required')
    validate_sequence(cues, duration, 'cues')
    validate_sequence(words, duration, 'words')
    cue_tokens = [t for c in cues for t in tokens(c['text'])]
    aligned_tokens = [t for word in words for t in tokens(word['word'])]
    if not (tokens(cfg['script']) == cue_tokens == aligned_tokens):
        raise ValueError('Script/cue/alignment mismatch; correct ASR and numeral spellings first')
    if any(len(tokens(word['word'])) != 1 for word in words):
        raise ValueError('Each word-alignment entry must contain exactly one token')
    cursor = 0
    for cue in cues:
        length = len(tokens(cue['text']))
        cue['_words'] = words[cursor:cursor + length]
        cursor += length
        if not length or len(cue['text'].split('\n')) > 2:
            raise ValueError('Use one or two nonempty semantic lines per cue')
        if any(not line.strip() for line in cue['text'].split('\n')):
            raise ValueError('Empty caption line')
        if (cue['_words'][0]['start'] < cue['start'] - .12
                or cue['_words'][-1]['end'] > cue['end'] + .12):
            raise ValueError(f"Cue cuts off aligned speech: {cue['text']}")
    title = cfg['title']
    if (not isinstance(title, list) or not 1 <= len(title) <= 2
            or any(not isinstance(line, str) or not line.strip() or '\n' in line for line in title)):
        raise ValueError('title must contain one or two nonempty lines')
    return cfg, picture, audio, caption_font, title_font, w, h, fps, duration, sound


def title_layer(title, w, h, font_path, emphasis_path):
    scale = min(w / 720, h / 1280)
    layer = Image.new('RGBA', (w, h))
    draw = ImageDraw.Draw(layer)
    x, y = round(w * 62 / 720), round(h * 88 / 1280)
    for index, text in enumerate(title):
        font = ImageFont.truetype(str(font_path if index == 0 else emphasis_path),
                                  max(1, round((35 if index == 0 else 46) * scale)))
        text = text.upper()
        if x + font.getlength(text) > w * .94:
            raise ValueError('Title too wide: rephrase or wrap within two lines before rendering')
        draw.text((x, y + round(index * 38 * scale)), text, font=font,
                  fill='white', stroke_width=max(1, round(2 * scale)), stroke_fill=(25, 15, 24))
    draw.rectangle((round(w * 45 / 720), y, round(w * 49 / 720),
                    y + round((94 if len(title) == 2 else 42) * scale)), fill='white')
    return layer


def caption_layer(text, active_index, w, h, font_path):
    scale = min(w / 720, h / 1280)
    height = round(h * 250 / 1280)
    lines = text.upper().split('\n')
    size = round(76 * scale)
    font = ImageFont.truetype(str(font_path), max(1, size))
    while max(font.getlength(line) for line in lines) > w * 618 / 720:
        size -= 1
        if size < max(1, round(52 * scale)):
            raise ValueError('Caption too wide; choose a better semantic break, not tiny text')
        font = ImageFont.truetype(str(font_path), size)
    layer = Image.new('RGBA', (w, height))
    draw = ImageDraw.Draw(layer)
    lineheight = font.size + round(12 * scale)
    first = (height - len(lines) * lineheight) / 2
    token_index = 0
    for j, line in enumerate(lines):
        x, y = (w - font.getlength(line)) / 2, first + j * lineheight
        draw.text((x + 4 * scale, y + 5 * scale), line, font=font, fill='black',
                  stroke_width=max(1, round(6 * scale)), stroke_fill='black')
        draw.text((x, y), line, font=font, fill=(255, 249, 235),
                  stroke_width=max(1, round(5 * scale)), stroke_fill='black')
        # Position, not spelling, distinguishes repeated words in the same cue.
        for match in re.finditer(r"\w+(?:['’]\w+)*", line):
            if token_index == active_index:
                draw.text((x + font.getlength(line[:match.start()]), y), match.group(),
                          font=font, fill=(255, 203, 74),
                          stroke_width=max(1, round(5 * scale)), stroke_fill='black')
            token_index += 1
    return layer


def stamp(t):
    ms = round(t * 1000)
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'


def audio_hash(path):
    # Stream to a digest; do not load the full encoded soundtrack into memory.
    proc = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(path), '-map', '0:a:0',
                             '-c', 'copy', '-f', 'adts', '-'], stdout=subprocess.PIPE)
    digest = hashlib.sha256()
    for chunk in iter(lambda: proc.stdout.read(1024 * 1024), b''):
        digest.update(chunk)
    if proc.wait():
        raise RuntimeError('Unable to hash AAC packets')
    return digest.hexdigest()


def render(config_path, output_dir=None, validate_only=False):
    (cfg, picture, audio, capfont, titlefont, w, h, fps, duration, sound) = prepare(config_path)
    title = title_layer(cfg['title'], w, h, titlefont, capfont)
    # Validate typography for every cue before starting expensive local work.
    for cue in cfg['cues']:
        caption_layer(cue['text'], -1, w, h, capfont)
    if validate_only:
        return {'validated': True, 'width': w, 'height': h, 'fps': str(fps), 'duration': duration}
    if not output_dir:
        raise ValueError('--output-dir required unless --validate-only')
    out = Path(output_dir).resolve()
    if out.exists() and any(out.iterdir()):
        raise ValueError('Output directory must be new or empty; existing work is preserved')
    out.mkdir(parents=True, exist_ok=True)
    frames = round(duration * float(fps))
    proof_indices = sorted({min(frames - 1, round(frames * f)) for f in (.04, .23, .57, .87)})
    proofs, cache = [], {}
    with (out / 'render.log').open('w') as log:
        decoder = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(picture), '-an',
                                    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                                   stdout=subprocess.PIPE, stderr=log)
        encoder = subprocess.Popen(['ffmpeg', '-v', 'warning', '-f', 'rawvideo', '-pix_fmt',
                                    'rgb24', '-s', f'{w}x{h}', '-r', str(fps), '-i', '-',
                                    '-an', '-c:v', 'libx264', '-crf', '18', '-preset', 'fast',
                                    '-pix_fmt', 'yuv420p', str(out / 'picture-captioned.mp4')],
                                   stdin=subprocess.PIPE, stderr=log)
        try:
            cue_index = 0
            for n in range(frames):
                raw = decoder.stdout.read(w * h * 3)
                if len(raw) != w * h * 3:
                    raise RuntimeError(f'Source ended at frame {n}, expected {frames}')
                frame = Image.frombytes('RGB', (w, h), raw)
                frame.paste(title, mask=title.getchannel('A'))
                while (cue_index < len(cfg['cues'])
                       and n >= round(cfg['cues'][cue_index]['end'] * float(fps))):
                    cue_index += 1
                    cache.clear()
                if cue_index < len(cfg['cues']):
                    cue = cfg['cues'][cue_index]
                    if n >= round(cue['start'] * float(fps)):
                        active = -1
                        for index, word in enumerate(cue['_words']):
                            if word['start'] <= n / float(fps):
                                active = index
                        if active not in cache:
                            cache[active] = caption_layer(cue['text'], active, w, h, capfont)
                        layer = cache[active]
                        age = (n / float(fps) - cue['start']) * 24
                        pop = (.92, 1.04, 1.01)[max(0, int(age))] if age < 3 else 1
                        if pop != 1:
                            layer = layer.resize((round(w * pop), round(layer.height * pop)),
                                                 Image.Resampling.LANCZOS)
                        y = round(h * 965 / 1280 + (h * 250 / 1280 - layer.height) / 2)
                        frame.paste(layer, ((w - layer.width) // 2, y), layer.getchannel('A'))
                if n in proof_indices:
                    path = out / f'proof-{n:06}.jpg'
                    frame.save(path, quality=94)
                    proofs.append(path)
                encoder.stdin.write(frame.tobytes())
                if n % max(1, round(float(fps) * 5)) == 0:
                    print(f'Packaging {n}/{frames}', flush=True)
            encoder.stdin.close()
            if decoder.wait() or encoder.wait():
                raise RuntimeError('Render failed; inspect render.log')
        finally:
            for proc in (decoder, encoder):
                if proc.poll() is None:
                    proc.terminate()
                    proc.wait()
        final = out / 'a6-final.mp4'
        copy_audio = sound['codec_name'] == 'aac'
        cmd = ['ffmpeg', '-v', 'warning', '-i', str(out / 'picture-captioned.mp4'),
               '-i', str(audio), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy']
        cmd += ['-c:a', 'copy'] if copy_audio else ['-c:a', 'aac', '-b:a', '192k']
        subprocess.run(cmd + ['-movflags', '+faststart', str(final)], check=True, stderr=log)
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(final), '-f', 'null', '-'], check=True)
    (out / 'captions.srt').write_text('\n\n'.join(
        f"{i+1}\n{stamp(c['start'])} --> {stamp(c['end'])}\n{c['text'].upper()}"
        for i, c in enumerate(cfg['cues'])) + '\n')
    sheet = Image.new('RGB', (720, 1280), '#151117')
    for i, path in enumerate(proofs):
        tile = Image.open(path).convert('RGB')
        tile.thumbnail((360, 640))
        sheet.paste(tile, ((i % 2) * 360, (i // 2) * 640))
    sheet.save(out / 'contact.jpg', quality=93)
    packet_hash = audio_hash(final)
    if copy_audio and packet_hash != audio_hash(audio):
        raise RuntimeError('Approved AAC packet preservation check failed')
    report = {
        'updated_at': datetime.now(timezone.utc).isoformat(),
        'status': 'technical_pass_pending_visual_listening_review',
        'final': str(final), 'sha256': sha(final), 'decode_pass': True,
        'audio_packets_copied': copy_audio, 'audio_adts_sha256': packet_hash,
        'creator_watermark': False, 'generation_calls': 0, 'probe': probe(final),
        'sources': {key: {'path': str(path), 'sha256': sha(path)} for key, path in
                    [('config', Path(config_path)), ('picture', picture), ('audio', audio),
                     ('caption_font', capfont), ('title_font', titlefont)]},
        'checks_remaining': ['semantic segmentation', 'speech alignment/listening',
                             'mobile readability/safe zones', 'source motion/continuity'],
    }
    (out / 'manifest.json').write_text(json.dumps(report, indent=2))
    return {key: report[key] for key in ('final', 'sha256', 'decode_pass', 'audio_packets_copied')}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', required=True)
    parser.add_argument('--output-dir')
    parser.add_argument('--validate-only', action='store_true')
    args = parser.parse_args()
    try:
        print(json.dumps(render(args.config, args.output_dir, args.validate_only), indent=2))
    except (ValueError, KeyError, StopIteration, subprocess.CalledProcessError) as exc:
        parser.exit(1, f'A6 finishing failed: {exc}\n')
