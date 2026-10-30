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
english_intro = (
    "Start with a topic, an article, or a script. Automatically orchestrate visuals, voiceovers, captions, and sound effects into a production-ready stickman video.",
    "**⚡ 100% Free & Open-Source. No camera, no $50/mo subscriptions, and ready in minutes, not days.**",
    "Continually updated visual styles for **science explainers, dark psychology, tech parables, viral lore, and storytelling channels.**",
)
assert "\n\n".join(english_intro) in english_hero, "Approved English introduction and bold formatting"
assert "For your first video, follow the [visual production walkthrough on X](https://x.com/CrazyKaomei/status/2102311241046008268) (Thread with step-by-step video demos)." in source, "Approved first-video walkthrough copy and unchanged X thread link"

def images(text):
    return re.findall(r'<img\b[^>]*\bsrc="([^"]+)"', text)

def anchors(text):
    return re.findall(r'<a id="([^"]+)"></a>', text)

def section(text, start, end):
    return text.split(f'<a id="{start}"></a>', 1)[1].split(end, 1)[0]

expected_images = images(cn)
assert len(expected_images) == 28 and len(set(expected_images)) == 22
pinned = "https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@"
local_a6_previews = {
    "assets/readme/previews/style-6-amber-noir-mcp.gif",
    "assets/readme/previews/style-6-amber-noir-flow.gif",
}
for url in expected_images:
    if "/previews/" in url:
        assert url in local_a6_previews or re.match(re.escape(pinned) + r"[a-f0-9]{40}/assets/readme/previews/[^/]+\.gif$", url)
        assert (root / "assets/readme/previews" / url.rsplit("/", 1)[1]).is_file(), url
expected_anchors = anchors(cn)
assert len(expected_anchors) == len(set(expected_anchors))
expected_videos = (
    "assets/readme/b1-minimal-handdrawn.mp4",
    "skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4",
)
for video in expected_videos:
    assert (root / video).is_file(), video
a6_videos = (
    "assets/readme/style-6-amber-noir-mcp.mp4",
    "assets/readme/style-6-amber-noir-flow.mp4",
)
for video in a6_videos:
    assert (root / video).is_file(), video
shared_links = (
    "https://github.com/kaomei/stickman-video-director",
    "https://telegram.me/CrazyKaomei",
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
    is_english = name in ("README.md", "README.en.md")
    assert len(hero_blocks) == 8, (name, "three localized introduction paragraphs")
    assert hero_blocks[2] == "# 🎬 Stickman Video Director", (name, "shared product title")
    subtitle = hero_blocks[3]
    assert subtitle.startswith("**") and subtitle.endswith("**"), (name, "bold subtitle")
    assert "🎬" not in subtitle and "YouTube" in subtitle, (name, "localized script-to-video subtitle for faceless YouTube channels")
    if is_english:
        assert tuple(hero_blocks[5:]) == english_intro, (name, "approved English introduction")
    else:
        assert hero_blocks[6].startswith("**⚡ ") and hero_blocks[6].endswith("**"), (name, "bold free/open-source introduction")
        assert "50" in hero_blocks[6] and "**" in hero_blocks[7], (name, "pricing comparison and emphasized topic niches")
    active = "en" if name == "README.md" else name[7:-3]
    expected_nav = " · ".join(
        f"[{'**' + label + '**' if locale == active else label}](README.{locale}.md)"
        for locale, label in navigation
    )
    assert expected_nav in text, (name, "navigation order and active language")
    assert text.count("[**") == 1, (name, "one active language")
    assert "FR（待同步）" not in text
    assert images(text) == expected_images, (name, "pinned images and order")
    localized_anchors = expected_anchors.copy()
    assert anchors(text) == localized_anchors, (name, "shared anchors and section order")
    h2_headings = re.findall(r"^## (.+)$", text, re.M)
    heading_icons = ("🎬", "🧭", "🎨", "🤖", "🖼️", "❓", "⭐", "🔮", "💬", "📄")
    assert len(h2_headings) == len(heading_icons), (name, "ten peer sections including the publishing kit")
    assert all(heading.startswith(icon + " ") for heading, icon in zip(h2_headings, heading_icons)), (name, "one consistent semantic icon per H2")
    assert '<a id="road-to-10000-stars--creator-ecosystem"></a>' in text, (name, "preserve the published roadmap deep link")
    for link in shared_links:
        assert link in text, (name, link)
    tutorial = next(line for line in text.splitlines() if "https://x.com/CrazyKaomei/status/2102311241046008268" in line)
    assert re.search(r"\[[^\]]*X[^\]]*\]\(https://x\.com/CrazyKaomei/status/2102311241046008268\)", tutorial), (name, "walkthrough explicitly identifies X in the link text")
    ecosystem = text.split("<!-- readme:contribute -->", 1)[1]
    ecosystem_sections = re.split(r"^## ", ecosystem, flags=re.M)
    assert len(ecosystem_sections) == 5, (name, "roadmap, planned styles, community, license use H2")
    roadmap, planned, community = ecosystem_sections[1:4]
    assert not re.search(r"^(?:### |---\s*$)", ecosystem, re.M), (name, "consistent section headings, no extra thick rules")
    assert planned.startswith("🔮 ") and community.startswith("💬 "), (name, "semantic icons match peer section headings")
    milestones = re.findall(r"^- \[([x ])\] \*\*(?:🔥 )?([0-9,]+) Stars\*\*", roadmap, re.M)
    assert milestones == [("x", "1,000"), ("x", "3,000"), (" ", "5,000"), (" ", "7,500"), (" ", "10,000")], (name, "approved milestone states")
    assert len(re.findall(r"^  - ", roadmap, re.M)) == 4, (name, "four nested milestone deliverables")
    mode_names = ("导演模式", "全自动模式") if name == "README.zh-CN.md" else ("Director", "AutoPilot")
    for token in (*mode_names, "5–10", "1,000", "200", "YouTube Shorts", "TikTok", "Content", "Web Studio"):
        assert token in roadmap, (name, "roadmap deliverable", token)
    assert "api.star-history.com/svg" in roadmap, (name, "chart after roadmap and before styles")
    assert '<a id="whats-next"></a>' in roadmap, (name, "retained navigation anchor before planned styles")
    assert len(re.findall(r"^- \*\*.*?\*\* — ", planned, re.M)) == 6, (name, "six planned visual styles")
    for token in ("OverSimplified", "Alan", "Reddit"):
        assert token in planned, (name, "style reference", token)
    assert len(re.findall(r"^- \*\*", community, re.M)) == 2, (name, "style requests and creator submissions")
    assert "Telegram" in community and "**[@CrazyKaomei](https://telegram.me/CrazyKaomei)**" in community, (name, "Telegram contact")
    assert "README" in community and "YouTube" in community, (name, "creator showcase destinations")
    assert "https://github.com/kaomei/stickman-video-director/issues" not in community, (name, "Do not require a GitHub Issue for feedback")
    assert re.search(r"^🔔 \*.*\*\*\[@CrazyKaomei\]\(https://x\.com/CrazyKaomei\)\*\*.*\*$", community, re.M), (name, "italic X follow line with bold profile link")
    assert "recent-updates" not in text, (name, "removed updates section")
    assert not re.search(r"monixin888|2109651037850325112", text, re.I), name
    assert not re.search(r"guaranteed (viral|views|income)|/Users/|eva2050|240669650", text, re.I), name
    assert not any(old in text for old in ("git clone", "$skill-installer", "$directing-stickman-videos")), name
    assert text.count('<div align="center">') == text.count("</div>"), name
    for tag in ("table", "tr", "td", "th"):
        assert len(re.findall(rf"<{tag}(?:\s|>)", text)) == text.count(f"</{tag}>"), (name, tag)
    hero = text.split('<table width="100%">', 1)[1].split("</table>", 1)[0]
    rows = re.findall(r"<tr>(.*?)</tr>", hero, re.S)
    gallery_styles = re.findall(r'href="#([^"]+)"><img', hero)
    assert gallery_styles == ["a1", "a2", "a3", "a4", "style-5", "b1", "a6"], name
    # Owner rule: two columns, odd last card left + Coming Soon right;
    # even card counts fill the grid without a placeholder. No spanning rows.
    assert len(rows) == (len(gallery_styles) + 1) // 2, name
    assert all(row.count('<td width="50%"') == 2 for row in rows), name
    assert "colspan" not in hero and "rowspan" not in hero, name
    cells = re.findall(r"<td\b[^>]*>(.*?)</td>", hero, re.S)
    placeholders = [cell for cell in cells if "<img" not in cell]
    assert len(placeholders) == len(gallery_styles) % 2, (name, "placeholder only for odd gallery count")
    if placeholders:
        assert placeholders == [cells[-1]] and "<img" in cells[-2], name
        assert re.search(r'<a href="#a7"><strong>[^<]+</strong></a>', cells[-1]), name
    assert text.count('width="90%"') == 7 and text.count('width="360"') == 14, name
    # French typography separates a heading label from its colon with a space.
    style_ids = re.findall(r"^### ([AB]\d+)\s*[:：]", text, re.M)
    assert style_ids == ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2"], (name, "published styles plus sequential teasers")
    a6 = section(text, "a6", '<a id="a7"></a>')
    assert len(re.findall(r"^- \*\*", a6, re.M)) == 3, (name, "A6 localized style, use cases and selection guidance")
    assert re.findall(r'<a href="([^"]+\.mp4)">', a6) == list(a6_videos), name
    assert all(provider in a6 for provider in ("Renoise MCP", "Google Flow", "20", "8")), name
    assert "Tested Flow workflow:" not in text and "Click either GIF" not in text, name
    assert "Veo 3.1 Fast" not in a6, (name, "operational model guidance stays in Skill")
    assert "Omni" not in a6, (name, "A6 does not inherit the legacy model")
    assert re.search(r"\*\*7[^\n]+9[^\n]+\*\*", text), (name, "seven styles and nine visual options")
    teaser_descriptions = []
    for next_id, end in (("a7", '<a id="b-styles"></a>'), ("b2", '<a id="faq"></a>')):
        placeholder = section(text, next_id, end)
        assert placeholder.count("](#road-to-10000-stars--creator-ecosystem)") == 1 and "5,000" in placeholder, (name, next_id, "one roadmap CTA per series")
        teaser_descriptions.append(placeholder.strip().split("\n\n")[1])
    assert teaser_descriptions[0] != teaser_descriptions[1], (name, "Director and Autopilot teasers must describe distinct workflows")
    assert text.count("](#road-to-10000-stars--creator-ecosystem)") == 3, (name, "two style-unlock links plus roadmap navigation")
    if is_english:
        teasers = {
            "A": "New specialized director styles are currently in training. [Star the project](#road-to-10000-stars--creator-ecosystem) to unlock them at 5,000 Stars!",
            "B": "New Autopilot styles and procedural animations are currently in training. [Star the project](#road-to-10000-stars--creator-ecosystem) to unlock them at 5,000 Stars!",
        }
        for series, teaser in teasers.items():
            assert text.count(teaser) == 1, (name, series, "one approved workflow-specific roadmap CTA")
            entries = re.findall(rf"^### ({series}(\d+)): (.+)$", text, re.M)
            assert [int(number) for _, number, _ in entries] == list(range(1, len(entries) + 1)), (name, series, "sequential styles")
            assert [title for _, _, title in entries].count("Coming soon…") == 1, (name, series, "one next-style placeholder")
            next_id, _, title = entries[-1]
            assert title == "Coming soon…", (name, series, "placeholder follows the latest released style")
            assert f"### {next_id}: Coming soon…\n\n{teaser}" in text, (name, series, "approved placeholder copy")
    for variant in ("A1.1", "A1.2", "A2.1", "A2.2"):
        assert variant in text, (name, variant)
    faq = section(text, "faq", "<!-- readme:contribute -->")
    assert re.findall(r"^### Q(\d+)\.", faq, re.M) == [str(i) for i in range(1, 9)], name
    assert all(tag not in faq for tag in ("<details", "<summary")), (name, "visible Q1-Q8")
    if is_english:
        assert "## ❓ Frequently Asked Questions\n" in faq
        questions = (
            "Is this really 100% free? Are there any hidden fees?",
            "Can I monetize these videos on YouTube and TikTok?",
            "Do I need programming skills or an expensive GPU?",
            "Can I make a video without an existing script?",
            "When should I choose Director Mode vs. Autopilot Mode?",
            "How does the AI ensure the video has high viewer retention and isn't boring?",
            "What AI assistants and video editors are supported?",
            "What if I dislike one specific scene—do I have to re-render the whole video?",
        )
        assert re.findall(r"^### Q\d+\. (.+)$", faq, re.M) == list(questions), (name, "approved English FAQ order")
        faq_answers = re.split(r"^### Q\d+\. .+\n", faq, flags=re.M)[1:]
        # Copy checks preserve the supplied draft; they do not substantiate its marketing claims.
        required_copy = (
            ("$30–$60/month", "zero subscription fees", "third-party API usage"),
            ("completely original", "YouTube Partner Program (YPP)"),
            ("RTX", "**Director Mode**", "**Autopilot Mode**", "cloud APIs or procedural rendering"),
            ("shower thought", "3-second hook", "tight 6-scene narrative arc"),
            ("**Choose Director Mode**", "**Choose Autopilot Mode**", "finished video file"),
            ("**visual storytelling psychology**", "**The 3-Second Hook**", "**Visual Metaphors**", "**Pacing & Comic Pauses**"),
            ("**AI Environments**", "**Video Generators**", "**Video Editors**", "Antigravity", "DaVinci Resolve"),
            ("modular 6-scene architecture", "Scenes 1, 2, 4, 5, and 6 remain untouched", "80% of editing time"),
        )
        for number, (answer, phrases) in enumerate(zip(faq_answers, required_copy), 1):
            for phrase in phrases:
                assert phrase in answer, (name, number, phrase)
        assert [len(re.findall(r"^- ", answer, re.M)) for answer in faq_answers] == [0, 0, 2, 0, 2, 3, 3, 0], (name, "approved FAQ list formatting")
    faq_answers = re.split(r"^### Q\d+\. .+\n", faq, flags=re.M)[1:]
    assert [len(re.findall(r"^- ", answer, re.M)) for answer in faq_answers] == [0, 0, 2, 0, 2, 3, 3, 0], (name, "localized FAQ bullet parity")
    for answer, tokens in zip(faq_answers, (("MIT", "API"), ("YouTube", "YPP"), ("Codex", "Claude Code", "Cursor"), ("3", "6"), ("Director Mode", "Autopilot Mode"), ("SFX", "Casually Explained"), ("Antigravity", "Google Flow", "DaVinci Resolve"), ("80", "6"))):
        assert all(token in answer for token in tokens), (name, "localized FAQ topic parity", tokens)
    assert "MIT" in faq and "API" in faq and "YouTube" in faq and "Codex" in faq and "Claude Code" in faq, name
    code = re.findall(r"```text\n(.*?)```", text, re.S)
    assert len(code) == 4, (name, "installation, A example, B example, publishing kit")
    assert shared_links[0] in code[0] and "SKILL.md" in code[0], name
    assert all(token in code[1] for token in ("A3", "30", "16:9")), name
    assert all(token in code[2] for token in ("B1", "5", "10", "20", "16:9", "YouTube")), name
    assert "B1" not in code[0] and "A3" not in code[0], name
    modes = section(text, "creation-modes", '<a id="quick-start"></a>')
    setup = modes.rsplit("\n|", 1)[1].split("\n\n", 1)[1]
    assert all(ratio in setup for ratio in ("9:16", "16:9", "1:1")), (name, "customizable aspect ratios")
    assert len(re.findall(r"^- \*\*", setup, re.M)) == 2 and not re.search(r"^>", setup, re.M), (name, "unquoted two-item setup note")
    assert all(agent in setup for agent in ("Claude Code", "OpenAI Codex", "Cursor")), (name, "Autopilot environment boundary")
    quick_intro = section(text, "quick-start", "```text")
    assert all(agent in quick_intro for agent in ("Claude Code", "Codex", "Cursor", "Antigravity")), (name, "compatible environments")
    if is_english:
        approved_mode_intro = (
            '<div align="center">\n\n'
            '**7 styles · 9 visual options · Tested examples · Free and open source**\n\n'
            '⭐ **Star the project to catch the next style drop and feature unlocks.**\n\n'
            '[Get started](#quick-start) · [Director Styles](#a-styles) · [Autopilot Styles](#b-styles) · [FAQ](#faq) · [Roadmap](#road-to-10000-stars--creator-ecosystem)\n\n'
            '</div>\n\n'
            '<a id="creation-modes"></a>\n\n'
            '## 🎬 Two ways to make your video\n\n'
            '**Want control over every shot? Choose A · Director Mode. Want a finished video without assembling scenes yourself? Choose B · Autopilot Mode.** One project, two workflows.\n'
        )
        assert approved_mode_intro in text, (name, "approved centered CTA, navigation and bold workflow introduction")
        approved_setup_copy = (
            'Both workflows can start with a raw topic, a web link, or a full script. Customize your aspect ratio (9:16, 16:9, 1:1), narration language, and voiceover freely. The lengths above are recommendations, not hard limits.\n\n'
            '💡 **Quick Setup Note**:\n\n'
            '- **Director Mode** works anywhere in standard conversational AI windows.\n'
            '- **Autopilot Mode** runs inside AI coding agents with file/terminal access (like **Claude Code, OpenAI Codex, or Cursor**) to automatically handle end-to-end rendering and file delivery.'
        )
        assert modes.rstrip().endswith(approved_setup_copy), (name, "approved workflow customization and unquoted setup list")
    assert all(token in modes for token in ("Codex", "Claude Code", "Google Flow", "10")), name
    b1 = section(text, "b1", '<a id="b2"></a>')
    assert "Bodi" in b1
    assert re.findall(r'<a href="([^"]+\.mp4)">', b1) == list(expected_videos), name
    assert "3min" not in b1, "Keep the long promotional video out of the short-case gallery"
    # Resolve both Markdown and HTML links; language labels need not match.
    links = re.findall(r"\]\(([^)]+)\)", text) + re.findall(r'href="([^"]+)"', text)
    known_ids = set(localized_anchors)
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
