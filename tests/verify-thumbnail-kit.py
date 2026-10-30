#!/usr/bin/env python3
"""Check localized publishing-kit structure and shared Skill wiring, not model behavior."""
from pathlib import Path
import re
import struct

root = Path(__file__).resolve().parents[1]
source = (root / "README.en.md").read_text()
assert source == (root / "README.md").read_text()
start, end = "<!-- thumbnail-publishing-kit:start -->", "<!-- thumbnail-publishing-kit:end -->"
assert source.count(start) == source.count(end) == 1
kit = source.split(start, 1)[1].split(end, 1)[0]
assert "## 🖼️ High-CTR Thumbnail & Publishing Kit" in kit
assert source.index('<a id="b2"></a>') < source.index(start) < source.index('<a id="faq"></a>')
assert "[Publishing Kit](#thumbnail-publishing-kit)" not in source
assert "[FAQ](#faq) · [Roadmap](#road-to-10000-stars--creator-ecosystem)" in source
assert '**Your video is only as good as the click.**' in kit
assert 'both **Director and Autopilot Mode**' in kit
assert '*All thumbnail concepts are designed around proven YouTube packaging psychology:' in kit
assert '### What the kit delivers:' in kit
assert re.findall(r'^- \*\*([^*]+)\*\*:', kit, re.M) == [
    'Thumbnail Image', '5 High-CTR Title Variants',
    'YouTube Studio Description & SEO', 'Pinned Comment Hook', 'Pre-Publish Checklist',
]
assert '### How to trigger it:' in kit
assert 'After you confirm the final video' in kit
assert 'No need to copy a prompt.' in kit
assert '''```text
Generate the Thumbnail & Publishing Kit for this video:
- 1 landscape 16:9 thumbnail image matching the approved art style
- 5 YouTube title options
- A description, relevant tags, and verified timestamps if available
- 1 engagement question for the pinned comment
- A pre-publish checklist with any pending checks clearly marked
```''' in kit
assert 'An early request based on an approved script produces drafts' in kit
assert 'nothing is uploaded or published automatically.' in kit
assert 'Content-ID clearance and monetization eligibility are not guaranteed.' in kit
assert 'Copy the image prompts' not in source
assert 'docs/thumbnail-image-prompts.md' not in source
image_paths = [f"assets/readme/thumbnails/{slug}.jpg" for slug in (
    "no-camera", "first-job", "a5-samurai-taxes",
    "a1-you-vs-you", "a2-busy-vs-better", "a4-3am-again",
)]
image_urls = [
    "https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@"
    "ae1685ba812f9686463f319fe6f0d4eb7d581433/" + image_path
    for image_path in image_paths
]
assert re.findall(r'<img src="([^"]+)"', kit) == image_urls
assert re.findall(r'<a href="([^"]+\.jpg)"', kit) == image_paths
assert len(re.findall(r'<img[^>]+alt="[^"]+"', kit)) == 6
assert kit.count('<tr>') == kit.count('</tr>') == 4
assert kit.count('<table width="100%">') == kit.count('</table>') == 2
assert not re.search(r'<th\b', kit)
for image_path in image_paths:
    data = (root / image_path).read_bytes()
    assert data.startswith(b'\xff\xd8') and data.endswith(b'\xff\xd9'), image_path
    assert len(data) < 2_000_000, image_path
    # Walk JPEG markers to obtain the dimensions from a Start-of-Frame segment.
    offset = 2
    dimensions = None
    while offset < len(data):
        assert data[offset] == 0xFF, image_path
        while data[offset] == 0xFF:
            offset += 1
        marker = data[offset]
        offset += 1
        length = struct.unpack('>H', data[offset:offset + 2])[0]
        if marker in (0xC0, 0xC1, 0xC2):
            height, width = struct.unpack('>HH', data[offset + 3:offset + 7])
            dimensions = (width, height)
            break
        offset += length
    assert dimensions == (1280, 720), (image_path, dimensions)

roadmap_labels = {
    'en': 'Roadmap', 'zh-CN': '路线图', 'ja': 'ロードマップ', 'ko': '로드맵',
    'fr': 'Feuille de route', 'pt-BR': 'Roteiro de evolução',
    'tr': 'Yol haritası', 'id': 'Peta jalan',
}
for locale, roadmap in roadmap_labels.items():
    filename = f'README.{locale}.md'
    text = (root / filename).read_text()
    assert text.count(start) == text.count(end) == 1, filename
    finishing_link = text.split('<a id="style-gallery"></a>', 1)[0]
    assert re.search(r'\]\(#thumbnail-publishing-kit\)', finishing_link), filename
    localized = text.split(start, 1)[1].split(end, 1)[0]
    assert text.index('<a id="b2"></a>') < text.index(start) < text.index('<a id="faq"></a>'), filename
    assert re.findall(r'<img src="([^"]+)"', localized) == image_urls, filename
    assert re.findall(r'<a href="([^"]+\.jpg)"', localized) == image_paths, filename
    assert len(re.findall(r'^- \*\*([^*]+)\*\*:', localized, re.M)) == 5, filename
    assert len(re.findall(r'^### ', localized, re.M)) == 2, filename
    assert localized.count('<table width="100%">') == localized.count('</table>') == 2, filename
    assert localized.count('<tr>') == localized.count('</tr>') == 4, filename
    assert len(re.findall(r'<td align="center">([^<]+)</td>', localized)) == 6, filename
    assert not re.search(r'<th\b', localized), filename
    prompt = re.findall(r'```text\n(.*?)```', localized, re.S)
    assert len(prompt) == 1 and len(re.findall(r'^- ', prompt[0], re.M)) == 5, filename
    assert all(token in prompt[0] for token in ('16:9', '1', '5', 'YouTube')), filename
    assert all(token in localized for token in ('YouTube Studio', 'SEO', 'Content-ID', 'TikTok')), filename
    nav = next(line for line in text.splitlines() if '](#quick-start)' in line and '](#faq)' in line)
    targets = re.findall(r'\]\((#[^)]+)\)', nav)
    assert targets == ['#quick-start', '#a-styles', '#b-styles', '#faq', '#road-to-10000-stars--creator-ecosystem'], (filename, targets)
    assert nav.endswith(f'[{roadmap}](#road-to-10000-stars--creator-ecosystem)'), filename
    if locale != 'en':
        assert 'Your video is only as good as the click.' not in localized, filename
        assert '### What the kit delivers:' not in localized, filename
        assert 'A simple question and one clear symbol.' not in localized, filename
    print(f'{filename}: localized kit, six shared images, five deliverables, trigger and FAQ → Roadmap navigation passed.')

# Shared routing must be included in the same installed Skill, not a new mode.
skill = root / 'skills/directing-stickman-videos'
entry = (skill / 'SKILL.md').read_text()
guide = (skill / 'references/getting-started.md').read_text()
autopilot = (skill / 'references/autopilot.md').read_text()
finishing = skill / 'references/thumbnail-publishing-kit.md'
assert '(references/thumbnail-publishing-kit.md)' in entry
assert '(thumbnail-publishing-kit.md)' in guide and '(thumbnail-publishing-kit.md)' in autopilot
assert finishing.is_file()
for document in (skill / 'SKILL.md', skill / 'references/getting-started.md',
                 skill / 'references/autopilot.md', finishing):
    for target in re.findall(r'\]\(([^)]+\.md)(?:#[^)]*)?\)', document.read_text()):
        if not target.startswith(('https://', 'http://')):
            assert (document.parent / target).is_file(), (document, target)
assert len(re.findall(r'^\d\. \*\*', finishing.read_text(), re.M)) == 5
print('Eight localized kits, six unchanged 1280x720 examples and shared optional finishing reference passed. Behavioral evaluation is separate; older unlinked proposal docs are not a publication dependency.')
