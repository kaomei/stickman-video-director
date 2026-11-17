#!/usr/bin/env python3
"""Check active A1–A7 workflow migration without rewriting historical samples.

Static instruction checks are not fresh generated-video or live-agent tests.
Use --scope a for the public-baseline A-only pending package; default scope
checks the integrated local source, including its separately pending B styles.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--scope', choices=('integrated', 'a', 'published'), default='published')
parser.add_argument('--repo', type=Path, help='Repository to inspect (default: this repository)')
args = parser.parse_args()
root = (args.repo or Path(__file__).resolve().parents[1]).resolve()
skill = root / 'skills/directing-stickman-videos'
refs = skill / 'references'


def read(name):
    return (refs / name).read_text()


def require(text, terms, label):
    for term in terms:
        assert term in text, f'{label}: missing {term!r}'


entry = (skill / 'SKILL.md').read_text()
routes = ('a1-a5-direction.md', 'amber-noir.md', 'rubber-hose.md',
          'a7-prompt-contract.md', 'a7-acceptance.md',
          'mode-execution-boundaries.md', 'a-production-and-review.md',
          'a-audio-timeline-and-review.md')
require(entry, routes, 'A1–A7 installed entry routes')
direction = read('a1-a5-direction.md')
for style in range(1, 6):
    assert f'Style {style}' in direction, f'A{style} route missing'
for name in ('a1-a5-direction.md', 'amber-noir.md', 'rubber-hose.md'):
    require(read(name), ('mode-execution-boundaries.md#a-unified-workflow',
                         'a-production-and-review.md'), f'{name} shared route')
require(read('amber-noir.md'), ('a6-finishing.md',), 'A6 finishing route')
require(read('rubber-hose.md'), ('a7-prompt-contract.md', 'a7-acceptance.md'), 'A7 routes')

workflow = read('mode-execution-boundaries.md').split('## A unified workflow', 1)[1]
require(workflow, ('independently usable shot prompts', 'lowest', 'resolution',
                   'budget', 'retries', 'Google Flow', 'checkpoint',
                   'not_checked'), 'Unified A approvals/execution')
production = read('a-production-and-review.md')
require(production, ('no fixed 8-, 10- or 15-second segment rule',
                     'no whole-ten-second or fixed-multiple requirement',
                     'source-local', 'retained', 'final',
                     'entry', 'return', 'normal speed',
                     'two', 'local'), 'A variable runtime/edit continuity')
audio = read('a-audio-timeline-and-review.md')
require(audio, ('narration master', 'music', 'native', 'semantic',
                'actual final encoded file', 'normal', 'not_checked'),
        'A independent audio/final listening')

omni = read('omni-flash-prompt-contract.md')
require(omni, ('Independent narration master (default for narrated finished films)',
               'Independent music master', 'Explicit native-speech alternative',
               'For external-master footage, request no generated speech or BGM',
               'Only for native-speech generation:',
               'Do not ask later source clips to continue clip 1'),
        'Active Omni sound roles')
# Scan only the active prompt contract. Historical sample prompts and the
# scoped reusable native-voice example deliberately retain their original text.
obsolete_audio = (
    r'every prompt must include the narrator voice block',
    r'external voiceover is only a fallback',
    r'continue the BGM from Clip 1',
    r'preserve the same background music across all clips',
    r'subsequent clips mandate seamless BGM continuity from clip 1',
    r'Every standalone prompt carries its own full voice and music instructions',
    r'Clips 2[–-]N explicitly instruct the model',
    r'prompt-first correction is insufficient',
)
for policy in obsolete_audio:
    assert not re.search(policy, omni, re.I), f'Old active Omni audio policy: {policy}'

anchor = ('A minimalist 2D animated stick figure wearing a bright red beanie '
          '(smooth rounded knit, no pom-pom) and a yellow t-shirt, with simple '
          'black stick limbs and shorts. Simple black lines, vibrant colors, '
          'smooth 2D animation style.')
catalog = read('style-catalog.md')
for label, text in (('catalog', catalog), ('direction', direction), ('Omni', omni)):
    require(text, (anchor,), f'A2 full identity in {label}')
require(catalog, ('Every Clip Character Anchor:',), 'A2 every-clip rule')
assert 'Subsequent Clip' not in catalog, 'A2 must not offer shortened later-clip anchors'
assert 'Repeat the full anchor' in omni, 'A2 every prompt must be independently usable'

a5 = read('historical-cartoon.md')
require(a5, ('source-local start/end times', 'actual chosen generated duration',
             'not fixed windows', 'not', 'mandatory ten-second source'), 'A5 actual timing')
assert not all(re.search(pattern, a5) for pattern in (
    r'0\s*[–-]\s*3\s*s', r'3\s*[–-]\s*7\s*s', r'7\s*[–-]\s*10\s*s'
)), 'A5 restored fixed 0–3/3–7/7–10 windows'
require(read('a6-finishing.md'), ('Independent narration', 'Puck',
                                  'a-audio-timeline-and-review.md'), 'A6 audio')
for name in ('a7-prompt-contract.md', 'a7-acceptance.md'):
    require(read(name), ('a-audio-timeline-and-review.md',), f'{name} shared audio')

# A-only scope is a different approved baseline, not an exemption for B edits.
# Freeze every B reference in that baseline; unrelated B welcome naming may
# remain released wording. Pending B7–B10 stay outside the A-only entry.
fixture = json.loads((Path(__file__).parent / 'fixtures/a-mode-b-boundary.json').read_text())
expected = fixture['scopes'][args.scope]
actual_names = sorted(p.name for p in refs.iterdir() if p.is_file()
                      and (p.name.startswith('b') or p.name.startswith('autopilot')))
assert actual_names == sorted(expected['files']), f'{args.scope}: B reference inventory changed'
for name, digest in expected['files'].items():
    assert hashlib.sha256((refs / name).read_bytes()).hexdigest() == digest, f'B scope boundary changed: {name}'
guide = read('getting-started.md')
welcome = guide.split('### 欢迎使用火柴人视频 Skill\n', 1)[1].split('### Adapt instead of replaying the README', 1)[0]
b_welcome = '#### B' + welcome.split('#### B', 1)[1]
assert hashlib.sha256(b_welcome.encode()).hexdigest() == expected['b_welcome_sha256'], 'B scope boundary changed: welcome'
if args.scope == 'a':
    assert not re.search(r'references/b(?:7|8|9|10)[-/.]', entry), 'Unpublished B route leaked into A-only entry'

print(f'[{args.scope}] A1–A7 routes, variable source/edit timing, complete A2 identity, independent audio and B boundary passed.')
print('Static policy checks only; historical approved media are preserved, not regenerated or re-audited.')

if args.scope == "published":
    assert not re.search(r"references/b(?:8|9|10)[-/.]", entry), "Unreleased B styles leaked"
