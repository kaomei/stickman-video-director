#!/usr/bin/env python3
"""Check eight-language parity against the approved Chinese A/B layout.

Wording is localized, not required to be a literal translation. These checks
protect navigation, structure, examples, pinned media and setup boundaries.
"""
from pathlib import Path
import re
import sys

root = Path(__file__).resolve().parents[1]
cn = (root / "README.zh-CN.md").read_text()
source = (root / "README.md").read_text()
navigation = (
    ("en", "🇺🇸 EN"), ("zh-CN", "🇨🇳 简中"), ("ja", "🇯🇵 日本語"),
    ("ko", "🇰🇷 한국어"), ("fr", "🇫🇷 FR"), ("pt-BR", "🇧🇷 PT-BR"),
    ("tr", "🇹🇷 TR"), ("id", "🇮🇩 ID"),
)
expected_files = {"README.md", *(f"README.{locale}.md" for locale, _ in navigation)}
assert {p.name for p in root.glob("README*.md")} == expected_files
assert source == (root / "README.en.md").read_text(), "Default homepage must match English"
assert "# 🎬 Stickman Video Director" in source
english_hero = source.split("</div>", 1)[0]
assert "**Turn any script into viral, multi-style animated stickman videos for Faceless YouTube Channels. Fully open-source.**" in english_hero
for phrase in ("a topic, an article, or a link", "visuals, voiceover, captions, sound effects, and subtle animation",
               "complete stickman video", "distinctive YouTube channel without ever appearing on camera",
               "open-source collection", "continually updated", "science and knowledge explainers",
               "psychology and motivation", "education and awareness", "uplifting stories", "trending stories"):
    assert phrase in english_hero, phrase

def images(text):
    return re.findall(r'<img\b[^>]*\bsrc="([^"]+)"', text)

def anchors(text):
    return re.findall(r'<a id="([^"]+)"></a>', text)

def section(text, start, end):
    return text.split(f'<a id="{start}"></a>', 1)[1].split(end, 1)[0]

expected_images = images(cn)
assert len(expected_images) == 19 and len(set(expected_images)) == 14
pinned = "https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@"
for url in expected_images:
    if "/previews/" in url:
        assert re.match(re.escape(pinned) + r"[a-f0-9]{40}/assets/readme/previews/[^/]+\.gif$", url)
        assert (root / "assets/readme/previews" / url.rsplit("/", 1)[1]).is_file(), url
expected_anchors = anchors(cn)
assert len(expected_anchors) == len(set(expected_anchors))
expected_videos = (
    "assets/readme/b1-minimal-handdrawn.mp4",
    "skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4",
)
for video in expected_videos:
    assert (root / video).is_file(), video
shared_links = (
    "https://github.com/kaomei/stickman-video-director",
    "https://t.me/CrazyKaomei",
    "https://github.com/kaomei/stickman-video-director/blob/main/LICENSE",
    "https://github.com/leksautomate",
    "https://x.com/CrazyKaomei/status/2102311241046008268",
    "https://x.com/CrazyKaomei",
    "https://flow.google.com/",
)
selected = sys.argv[1:] or sorted(expected_files)
assert all(name in expected_files for name in selected), selected
for name in selected:
    path = root / name
    text = path.read_text()
    top = text.split("</div>", 1)[0]
    hero_blocks = [block.strip() for block in top.split("\n\n") if block.strip()]
    assert len(hero_blocks) == 7, (name, "title, subtitle, badges and exactly two introduction paragraphs")
    assert hero_blocks[2] == "# 🎬 Stickman Video Director", (name, "shared product title")
    subtitle = hero_blocks[3]
    assert subtitle.startswith("**") and subtitle.endswith("**"), (name, "bold subtitle")
    assert "🎬" not in subtitle and "YouTube" in subtitle, (name, "localized script-to-video subtitle for faceless YouTube channels")
    assert "YouTube" in hero_blocks[5], (name, "faceless-channel value in first introduction paragraph")
    active = "en" if name == "README.md" else name[7:-3]
    expected_nav = " · ".join(
        f"[{'**' + label + '**' if locale == active else label}](README.{locale}.md)"
        for locale, label in navigation
    )
    assert expected_nav in text, (name, "navigation order and active language")
    assert text.count("[**") == 1, (name, "one active language")
    assert "FR（待同步）" not in text
    assert images(text) == expected_images, (name, "pinned images and order")
    assert anchors(text) == expected_anchors, (name, "shared anchors and section order")
    for link in shared_links:
        assert link in text, (name, link)
    feedback = next(line for line in text.splitlines() if line.startswith("💬 **"))
    assert "Telegram" in feedback and "[@CrazyKaomei](https://t.me/CrazyKaomei)" in feedback, (name, "Telegram feedback contact")
    assert "https://github.com/kaomei/stickman-video-director/issues" not in feedback, (name, "Do not require a GitHub Issue for feedback")
    assert "recent-updates" not in text, (name, "removed updates section")
    assert not re.search(r"monixin888|2109651037850325112", text, re.I), name
    assert not re.search(r"guaranteed (viral|views|income)|/Users/|eva2050|240669650", text, re.I), name
    assert not any(old in text for old in ("git clone", "$skill-installer", "$directing-stickman-videos")), name
    assert text.count('<div align="center">') == text.count("</div>"), name
    for tag in ("table", "tr", "td", "th"):
        assert len(re.findall(rf"<{tag}(?:\s|>)", text)) == text.count(f"</{tag}>"), (name, tag)
    hero = text.split('<table width="100%">', 1)[1].split("</table>", 1)[0]
    rows = re.findall(r"<tr>(.*?)</tr>", hero, re.S)
    assert len(rows) == 3 and all(row.count('<td width="50%"') == 2 for row in rows), name
    assert re.findall(r'href="#([^"]+)"><img', hero) == ["a1", "a2", "a3", "a4", "style-5", "b1"], name
    assert text.count('width="90%"') == 6 and text.count('width="360"') == 12, name
    # French typography separates a heading label from its colon with a space.
    style_ids = re.findall(r"^### (A[1-5]|B[12])\s*[:：]", text, re.M)
    assert style_ids == ["A1", "A2", "A3", "A4", "A5", "B1", "B2"], name
    for variant in ("A1.1", "A1.2", "A2.1", "A2.2"):
        assert variant in text, (name, variant)
    faq = section(text, "faq", "<!-- readme:contribute -->")
    assert re.findall(r"^### Q(\d+)\.", faq, re.M) == [str(i) for i in range(1, 9)], name
    assert all(tag not in faq for tag in ("<details", "<summary")), (name, "visible Q1-Q8")
    character_faq = faq.split("### Q3.", 1)[1].split("### Q4.", 1)[0]
    engagement_faq = faq.split("### Q5.", 1)[1].split("### Q6.", 1)[0]
    for answer, label in ((character_faq, "character consistency"),
                          (engagement_faq, "engaging article adaptation")):
        assert len(answer.split("\n", 1)[1].strip().split("\n\n")) == 2, (name, label)
    cost_faq = faq.split("### Q2.", 1)[1].split("### Q3.", 1)[0]
    assert "100" not in cost_faq, (name, "Use the revised tens-of-dollars estimate, not US$100")
    cost_answer = cost_faq.split("\n", 1)[1].strip()
    assert len(cost_answer.split("\n\n")) == 2, (name, "Concise DIY and cost answer")
    if name in ("README.md", "README.en.md"):
        assert "Can Director Mode styles be fully automated? Why keep Director Mode?" in cost_faq
        for phrase in ("one complete generation pass", "**tens of US dollars**",
                       "your preferred A-series style", "B-series workflow", "DIY adaptation",
                       "generation and review scene by scene", "manual editing",
                       "control of every shot", "decide whether to continue"):
            assert phrase in cost_faq, (name, phrase)
        assert "I have installed it. What do I do next?" not in faq
        assert "How do I keep characters consistent in Director Mode?" in character_faq
        for phrase in ("front, side, and back views", "skip this optional step",
                       "attach the approved character image to every clip you generate",
                       "do not replace those prompts or change the selected style's rules"):
            assert phrase in character_faq, (name, phrase)
        assert "How do I turn an article or reference into a more engaging video?" in engagement_faq
        for phrase in ("who you want to reach", "what you want viewers to do afterward",
                       "opening hook, narrative progression, and call to action",
                       "your own perspective and wording", "claims before publishing"):
            assert phrase in engagement_faq, (name, phrase)
    assert "MIT" in faq and "API" in faq and "YouTube" in faq and "Codex" in faq and "Claude Code" in faq, name
    code = re.findall(r"```text\n(.*?)```", text, re.S)
    assert len(code) == 3, (name, "installation, A example, B example")
    assert shared_links[0] in code[0] and "SKILL.md" in code[0], name
    assert all(token in code[1] for token in ("A3", "30", "16:9")), name
    assert all(token in code[2] for token in ("B1", "5", "10", "20", "16:9", "YouTube")), name
    assert "B1" not in code[0] and "A3" not in code[0], name
    modes = section(text, "creation-modes", '<a id="quick-start"></a>')
    assert all(token in modes for token in ("Codex", "Claude Code", "Google Flow", "10")), name
    b1 = section(text, "b1", '<a id="b2"></a>')
    assert "Bodi" in b1
    assert re.findall(r'<a href="([^"]+\.mp4)">', b1) == list(expected_videos), name
    assert "3min" not in b1, "Keep the long promotional video out of the short-case gallery"
    # Resolve both Markdown and HTML links; language labels need not match.
    links = re.findall(r"\]\(([^)]+)\)", text) + re.findall(r'href="([^"]+)"', text)
    known_ids = set(expected_anchors)
    for link in links:
        if link.startswith("#"):
            assert link[1:] in known_ids, (name, "missing anchor", link)
        elif "://" not in link:
            target, _, fragment = link.partition("#")
            assert (root / target).is_file(), (name, "missing file", link)
            if fragment and target.endswith(".md"):
                assert fragment in anchors((root / target).read_text()), (name, link)
    alts = re.findall(r'<img\b[^>]*\balt="([^"]*)"', text)
    assert len(alts) == len(expected_images) and all(alt.strip() for alt in alts), name
    assert "api.star-history.com/svg" in text
    print(f"{name}: navigation, A/B structure, 8 FAQs, media, links and examples passed.")

print("Eight languages share the approved A/B layout; French follows Korean.")
