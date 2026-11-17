#!/usr/bin/env bash
set -euo pipefail
python3 - <<'PY'
from pathlib import Path
import re
root = Path('skills/directing-stickman-videos')
catalog = (root / 'references/style-catalog.md').read_text()
contract = (root / 'references/omni-flash-prompt-contract.md').read_text()
skill = (root / 'SKILL.md').read_text()
classic = catalog.split('## 2. Style 1: Classic Minimalist', 1)[1].split('## 3. Style 2:', 1)[0]
anchors = re.findall(r'```text\n(.*?)\n```', classic, re.S)
assert len(anchors) == 2, 'Both polarities need self-contained character anchors'
dark, light = anchors
assert light == dark.replace('white line animation', 'black line animation').replace('figure stays white', 'figure stays black'), 'Theme swap must preserve the same anatomy and current-pose rule'
for anchor in anchors:
    assert 'hollow circular head' in anchor
    assert 'stable proportions, connected line limbs, and uniform medium line weight' in anchor
    assert 'Exactly two arms and two legs' in anchor
    assert "replaces that arm's previous line" in anchor
    assert 'never leaving a resting arm beneath an active arm' in anchor
    assert 'accent colors affect only props and graphic effects' in anchor
    assert not re.search(r'\d|one sixth|skeleton|rig definition|pen path', anchor), 'Do not reintroduce unvalidated geometric recipes'
assert 'Occasional simple line expressions are allowed by default.' in catalog
assert 'replace only "no face, no eyes, no mouth,"' in catalog, 'Expression choice must not change anatomy'
assert 'expression-enabled and left-handed variants were not separately tested' in catalog
assert 'not frame-by-frame certification' in catalog
assert 'repeat the concise frozen character anchor' in contract
assert 'A raised arm replaces its old lowered line.' in contract
assert 'no facial features, no hair, no clothing, no filled body, stable proportions, uniform medium line weight' not in contract
direction = (root / 'references/a1-a5-direction.md').read_text()
assert 'a1-a5-direction.md' in skill
assert 'For Style 1, freeze the concise character anchor' in direction
assert not (root / 'references/continuity-lock.md').exists(), 'Unrelated draft continuity changes included'
print('Classic character instruction regression passed.')
PY
