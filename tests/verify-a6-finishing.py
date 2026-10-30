#!/usr/bin/env python3
"""Offline renderer behavior checks with disposable synthetic media; no API calls."""
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
path = root / 'skills/directing-stickman-videos/scripts/a6_finish.py'
spec = importlib.util.spec_from_file_location('a6_finish', path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

with tempfile.TemporaryDirectory(prefix='a6-finish-test-') as name:
    tmp = Path(name)
    subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i',
                    'color=c=0x382638:s=360x640:r=24:d=2', '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', str(tmp / 'picture.mp4')], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i',
                    'sine=frequency=440:duration=2', '-c:a', 'aac',
                    str(tmp / 'mix.m4a')], check=True)
    cfg = {'picture': 'picture.mp4', 'audio': 'mix.m4a', 'script': 'Go go now.',
           'title': ['WHAT IF', 'TIME STOPPED?'],
           'cues': [{'start': 0, 'end': 2, 'text': 'GO GO NOW.'}],
           'words': [{'start': 0, 'end': .5, 'word': 'Go'},
                     {'start': .5, 'end': 1, 'word': 'go'},
                     {'start': 1, 'end': 1.7, 'word': 'now.'}]}
    config = tmp / 'config.json'
    config.write_text(json.dumps(cfg))
    assert module.render(config, validate_only=True)['validated']
    for field in ('words', 'cues'):
        invalid = copy.deepcopy(cfg)
        invalid[field][0]['end'] = -1
        config.write_text(json.dumps(invalid))
        try:
            module.render(config, validate_only=True)
        except ValueError:
            pass
        else:
            raise AssertionError(f'Invalid {field} accepted')
    invalid = copy.deepcopy(cfg)
    invalid['script'] = 'Missing words.'
    config.write_text(json.dumps(invalid))
    try:
        module.render(config, validate_only=True)
    except ValueError:
        pass
    else:
        raise AssertionError('Missing narration accepted')
    config.write_text(json.dumps(cfg))
    # Repeated GO must highlight one positional token, not both occurrences.
    font = Path('/System/Library/Fonts/Supplemental/Impact.ttf')
    first = module.caption_layer('GO GO NOW.', 0, 360, 640, font)
    second = module.caption_layer('GO GO NOW.', 1, 360, 640, font)
    amber1 = {x for x in range(360) for y in range(first.height)
              if first.getpixel((x, y))[:3] == (255, 203, 74)}
    amber2 = {x for x in range(360) for y in range(second.height)
              if second.getpixel((x, y))[:3] == (255, 203, 74)}
    assert amber1 and amber2 and max(amber1) < min(amber2)
    result = module.render(config, tmp / 'final')
    manifest = json.loads((tmp / 'final/manifest.json').read_text())
    assert result['decode_pass'] and result['audio_packets_copied']
    assert manifest['creator_watermark'] is False and manifest['generation_calls'] == 0
    assert 'GO GO NOW.' in (tmp / 'final/captions.srt').read_text()
    try:
        module.render(config, tmp / 'final')
    except ValueError:
        pass
    else:
        raise AssertionError('Existing output directory overwritten')
print('A6 offline renderer: exact text/timing guards, positional highlight, no watermark,')
print('AAC preservation, decode, SRT and no-overwrite behavior PASS. No generation calls.')
