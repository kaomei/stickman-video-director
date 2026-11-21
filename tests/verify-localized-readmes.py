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
b3_boundaries = (root / "skills/directing-stickman-videos/references/mode-execution-boundaries.md").read_text()
assert "Follow its Bodi voice" not in b3_boundaries, "B3 sample voice must not become a provider requirement"
assert all(phrase in b3_boundaries for phrase in (
    "Preserve its television finish", "Bodi is the sample voice credit",
    "not a required service or voice", "the user's selected available voice route takes priority",
)), "B3 television finish and configurable voice boundary must remain explicit"
assert "# 🎬 Stickman Video Director" in source
english_hero = source.split("</div>", 1)[0]
assert "**Scale your faceless channel with automated stickman animations.**" in english_hero
english_intro = (
    '**Send your AI agent one message — get back a finished stickman video.**<br>\nScript, voiceover, captions & sound · 15 battle-tested styles · For Claude Code, Codex & more',
    '💬 One message → ✅ Approve script & preview → 🎬 Finished video',
    "**No After Effects. No $50/mo SaaS tax. Ship daily without burnout.**",
)
assert "\n\n".join(english_intro) in english_hero, "Approved English introduction and bold formatting"
assert "For your first video, see the [detailed tutorial on X](https://x.com/CrazyKaomei/status/2102311241046008268)." in source, "Approved first-video walkthrough copy and unchanged X thread link"

# User-approved hero copy; publication and integration use their actual style counts.
approved_localized_hero = {
    'zh-CN': ('**用全自动火柴人动画，规模化量产你的无人出镜频道。**',
        '**发一句话给 AI Agent，拿回一条完整的火柴人视频。**<br>\n脚本、配音、字幕与音效全包 · 15 款实操验证的画风 · 支持 Claude Code、Codex 等',
        '💬 发一句话 → ✅ 确认脚本和预览 → 🎬 拿到成片',
        '**告别繁琐动效手搓，不交每月几十刀的软件订阅税。日更内容，轻松无压力。**',
        '[快速上手](#quick-start) · [样片展厅](#style-gallery) · [常见问题](#faq) · [路线图](#road-to-10000-stars--creator-ecosystem) · [交流社区](#community)',
        '*⭐ 欢迎点亮 Star，第一时间解锁最新画风与功能更新！*'),
    'ja': ('**自動化された棒人間アニメーションで、顔出しなしチャンネルを規模化・量産へ。**',
        '**AIエージェントにひと言送るだけで、完成した棒人間動画が届く。**<br>\n台本・音声・字幕・効果音までおまかせ · 実戦検証済みの15画風 · Claude Code・Codex 対応',
        '💬 ひと言送る → ✅ 台本とプレビューを確認 → 🎬 完成動画',
        '**面倒な動画編集・アニメ付けは不要。月額50ドルのSaaS税もゼロ。毎日投稿を、もっと楽に。**',
        '[クイックスタート](#quick-start) · [ショーケース](#style-gallery) · [FAQ](#faq) · [ロードマップ](#road-to-10000-stars--creator-ecosystem) · [コミュニティ](#community)',
        '*⭐ 次のスタイル追加や新機能を見逃さないよう、ぜひ Star をお願いします！*'),
    'ko': ('**자동화된 스틱맨 애니메이션으로 얼굴 없는 유튜브 채널을 대량 양산하세요.**',
        '**AI 에이전트에게 메시지 한 줄만 보내면, 완성된 스틱맨 영상이 돌아옵니다.**<br>\n대본·내레이션·자막·사운드까지 한 번에 · 검증된 15가지 스타일 · Claude Code, Codex 등 지원',
        '💬 메시지 한 줄 → ✅ 대본과 미리보기 확인 → 🎬 완성 영상',
        '**복잡한 모션 그래픽 작업 불필요. 매달 50달러의 SaaS 구독료도 제로. 지치지 않고 매일 업로드.**',
        '[빠른 시작](#quick-start) · [쇼케이스](#style-gallery) · [FAQ](#faq) · [로드맵](#road-to-10000-stars--creator-ecosystem) · [커뮤니티](#community)',
        '*⭐ 저장소를 Star하고 다음 스타일 업데이트와 새로운 기능을 가장 먼저 확인하세요.*'),
    'pt-BR': ('**Escale sua rede de canais dark com animações automatizadas de boneco-palito.**',
        '**Mande uma mensagem para seu agente de IA e receba um vídeo de boneco-palito pronto.**<br>\nRoteiro, locução, legendas e som · 15 estilos testados · Para Claude Code, Codex e mais',
        '💬 Uma mensagem → ✅ Aprove o roteiro e a prévia → 🎬 Vídeo pronto',
        '**Chega de sofrer no After Effects. Sem taxa de US$ 50/mês em SaaS. Poste todo dia sem esgotamento.**',
        '[Início Rápido](#quick-start) · [Showcase](#style-gallery) · [FAQ](#faq) · [Roadmap](#road-to-10000-stars--creator-ecosystem) · [Comunidade](#community)',
        '*⭐ Deixe uma estrela no projeto para acompanhar os próximos estilos e novidades.*'),
    'fr': ("**Industrialisez votre réseau de chaînes sans visage grâce à l'animation automatisée.**",
        '**Un seul message à votre agent IA — et votre vidéo de bonshommes bâtons est prête.**<br>\nScript, voix off, sous-titres et son · 15 styles éprouvés · Pour Claude Code, Codex et plus',
        '💬 Un message → ✅ Validez le script et l’aperçu → 🎬 Vidéo terminée',
        '**Oubliez les galères sur After Effects. Fini la taxe SaaS à 50 $/mois. Publiez quotidiennement sans épuisement.**',
        '[Démarrage](#quick-start) · [Showcase](#style-gallery) · [FAQ](#faq) · [Roadmap](#road-to-10000-stars--creator-ecosystem) · [Communauté](#community)',
        '*⭐ Ajoutez une étoile au projet pour ne manquer aucun nouveau style ni mise à jour.*'),
    'tr': ('**Yüzsüz kanal ağınızı otomatik çöp adam animasyonlarıyla ölçeklendirin.**',
        '**Yapay zekâ ajanınıza tek bir mesaj gönderin, bitmiş çöp adam videonuzu alın.**<br>\nSenaryo, seslendirme, altyazı ve ses · Kanıtlanmış 15 stil · Claude Code, Codex ve dahası',
        '💬 Tek mesaj → ✅ Senaryoyu ve önizlemeyi onaylayın → 🎬 Hazır video',
        "**Karmaşık After Effects kurgularına son. Aylık 50$'lık SaaS vergisi yok. Tükenmeden her gün yayınlayın.**",
        '[Hızlı Başlangıç](#quick-start) · [Vitrin](#style-gallery) · [SSS](#faq) · [Yol Haritası](#road-to-10000-stars--creator-ecosystem) · [Topluluk](#community)',
        '*⭐ Yeni stil güncellemelerini ve özellikleri kaçırmamak için projeye Star verin.*'),
    'id': ('**Skalakan jaringan channel tanpa wajah Anda dengan animasi stickman otomatis.**',
        '**Kirim satu pesan ke agen AI Anda, dapatkan video stickman yang sudah jadi.**<br>\nNaskah, voiceover, subtitle & suara · 15 gaya teruji · Untuk Claude Code, Codex & lainnya',
        '💬 Satu pesan → ✅ Setujui naskah & pratinjau → 🎬 Video jadi',
        '**Tanpa ribet animasi After Effects. Tanpa pajak langganan SaaS $50/bulan. Upload tiap hari tanpa burnout.**',
        '[Panduan Cepat](#quick-start) · [Showcase](#style-gallery) · [FAQ](#faq) · [Roadmap](#road-to-10000-stars--creator-ecosystem) · [Komunitas](#community)',
        '*⭐ Berikan Star pada repositori ini untuk mendapatkan rilis gaya dan fitur terbaru.*'),
}

def images(text):
    return re.findall(r'<img\b[^>]*\bsrc="([^"]+)"', text)

def anchors(text):
    return re.findall(r'<a id="([^"]+)"></a>', text)

def section(text, start, end):
    return text.split(f'<a id="{start}"></a>', 1)[1].split(end, 1)[0]

def verify_next_style_teasers(text, name, gallery_styles, label):
    """Each series ends with one localized teaser after its published cards."""
    card_ids = ["a5" if style == "style-5" else style for style in gallery_styles]
    for series in ("A", "B"):
        published = sorted(int(style[1:]) for style in card_ids if style[0] == series.lower())
        assert published == list(range(1, len(published) + 1)), (name, series, "published cards are sequential")
        next_number = len(published) + 1
        entries = list(re.finditer(rf"^### {series}(\d+)\s*[:：]\s*(.+)$", text, re.M))
        assert [int(entry[1]) for entry in entries] == list(range(1, next_number + 1)), (name, series, "retain and advance the next-style teaser")
        assert [entry[2] for entry in entries].count(label) == 1 and entries[-1][2] == label, (name, series, "one localized Coming Soon teaser at the end")
        assert f'<a id="{series.lower()}{next_number}"></a>' in text, (name, series, "next-style teaser anchor")
        teaser = re.split(r"^#{1,3} ", text[entries[-1].end():], maxsplit=1, flags=re.M)[0]
        assert teaser.strip() and not images(teaser) and ".mp4" not in teaser, (name, series, "teaser is not a published sample")
        assert teaser.count("](#road-to-10000-stars--creator-ecosystem)") == 1, (name, series, "retain the teaser roadmap link")
        visible_teaser = re.sub(r"\]\([^)]*\)", "]", teaser)
        assert not re.search(r"\b\d[\d,.\s]*\s*Stars?\b", visible_teaser, re.I), (name, series, "next-style teaser has no numeric Star unlock promise")

expected_images = images(cn)
assert len(expected_images) == 55 and len(set(expected_images)) == 41
pinned = "https://cdn.jsdelivr.net/gh/kaomei/stickman-video-director@"
b6_previews = [
    pinned + "7d611fb27f103aebc38a656d29edc1b1181cbd62/assets/readme/previews/" + filename
    for filename in ("b6-dynamic-meme-eiffel-16x9.gif", "b6-dynamic-meme-hong-kong-v90-20s.gif")
]
local_previews = {
    "assets/readme/previews/b7-pixel-theater.gif",
    "assets/readme/previews/b7-fast-forward-excerpt.gif",
    "assets/readme/previews/style-7-rubber-hose.gif",
    "assets/readme/previews/style-7-rubber-hose-2.gif",
    "assets/readme/previews/style-6-amber-noir-mcp.gif",
    "assets/readme/previews/style-6-amber-noir-flow.gif",
    "assets/readme/previews/b2-colorful-sleep.gif",
    "assets/readme/previews/b2-colorful-phone-weather.gif",
    "assets/readme/previews/b3-tv-dog.gif",
    "assets/readme/previews/b3-tv-night-signal.gif",
    "assets/readme/previews/b4-dispatch.gif",
    "assets/readme/previews/b4-death-clock.gif",
}
for url in expected_images:
    if "/previews/" in url:
        assert url in local_previews or re.match(re.escape(pinned) + r"[a-f0-9]{40}/assets/readme/previews/[^/]+\.gif$", url)
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
    "https://x.com/AveryRunsAI",
    "https://flow.google.com/",
    "https://telegram.me/stickmanskill",
    "https://renoise.ai/mcp?utm_source=crazykaomei-aini-202610&amp;utm_medium=xcom",
)
selected = sys.argv[1:] or sorted(expected_files)
assert all(name in expected_files for name in selected), selected
for name in selected:
    path = root / name
    text = path.read_text()
    top = text.split("</div>", 1)[0]
    hero_blocks = [block.strip() for block in top.split("\n\n") if block.strip()]
    is_english = name in ("README.md", "README.en.md")
    assert len(hero_blocks) == 10, (name, "localized hero, flow, navigation and Star CTA")
    assert hero_blocks[2] == "# 🎬 Stickman Video Director", (name, "shared product title")
    subtitle = hero_blocks[3]
    assert subtitle.startswith("**") and subtitle.endswith("**"), (name, "bold subtitle")
    assert "🎬" not in subtitle, (name, "concise localized subtitle")
    if is_english:
        assert tuple(hero_blocks[5:8]) == english_intro, (name, "approved English introduction")
        assert hero_blocks[8] == '[Quickstart](#quick-start) · [Showcase](#style-gallery) · [FAQ](#faq) · [Roadmap](#road-to-10000-stars--creator-ecosystem) · [Community](#community)', (name, "approved English navigation labels")
    else:
        locale = name[7:-3]
        assert tuple(hero_blocks[index] for index in (3, 5, 6, 7, 8, 9)) == approved_localized_hero[locale], (name, "exact approved localized hero copy")
    assert "15" in hero_blocks[5], (name, "actual published style count in introduction")
    assert hero_blocks[9].startswith(("⭐ *", "*⭐ ")) and hero_blocks[9].endswith("*"), (name, "italic Star CTA")
    assert "Styles-" not in top and "img.shields.io/badge/Styles" not in top, (name, "removed Styles badge")
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
    assert "20,000 Stars" in roadmap.splitlines()[0], (name, "current 20,000-Star roadmap heading")
    milestones = re.findall(r"^- \[([x ])\] \*\*(?:🔥 )?([0-9,]+) Stars\*\*", roadmap, re.M)
    assert milestones == [("x", "1,000"), ("x", "3,000"), ("x", "6,000"), (" ", "10,000"), (" ", "20,000")], (name, "approved milestone states")
    assert "- [ ] **🔥 10,000 Stars**" in roadmap, (name, "current highlighted 10,000-Star milestone")
    milestone_blocks = re.split(r"(?=^- \[[x ]\] \*\*)", roadmap, flags=re.M)[1:]
    assert [len(re.findall(r"^  - ", block, re.M)) for block in milestone_blocks] == [0, 0, 0, 2, 3], (name, "two 10,000-Star and three 20,000-Star deliverables")
    mode_names = ("模型引擎", "代码引擎") if active == "zh-CN" else ("Model Engine", "Code Engine")
    for token in mode_names:
        assert token in roadmap, (name, "roadmap deliverable", token)
    for token in ("1,000", "774", "31", "85"):
        assert token in milestone_blocks[3], (name, "10,000-Star deliverable", token)
    shared_deliverables = re.findall(r"^  - (.+)$", milestone_blocks[3], re.M)
    assert all(mode in shared_deliverables[0] for mode in ("A", "B")), (name, "script prompts shared by A and B")
    assert "B" in shared_deliverables[1], (name, "SFX and sound transitions scoped to B")
    assert "](skills/directing-stickman-videos/references/b-audio-library.md)" in shared_deliverables[1], (name, "bundled sound library guide")
    assert not re.match(r"\[[xX ]\]\s", shared_deliverables[1]), (name, "no redundant nested sound-library checkbox")
    assert "Content" not in shared_deliverables[1], (name, "no unconditional Content ID guarantee")
    studio_name = "Stickman AI 视频工作台" if name == "README.zh-CN.md" else "Stickman AI Studio"
    autopilot_name = "频道自动驾驶" if name == "README.zh-CN.md" else "Channel Autopilot"
    assert autopilot_name in milestone_blocks[4], (name, "20,000-Star batch production deliverable")
    assert studio_name in milestone_blocks[4], (name, "20,000-Star studio deliverable")
    assert "api.star-history.com/svg" in roadmap, (name, "chart after roadmap and before styles")
    assert '<a id="whats-next"></a>' in roadmap, (name, "retained navigation anchor before planned styles")
    assert len(re.findall(r"^- \*\*.*?\*\* — ", planned, re.M)) == 6, (name, "six planned visual styles")
    for token in ("OverSimplified", "Alan", "Reddit"):
        assert token in planned, (name, "style reference", token)
    assert len(re.findall(r"^- \*\*", community, re.M)) == 2, (name, "style requests and creator submissions")
    assert re.search(r"\[[^\]]*Telegram[^\]]*\]\(https://telegram\.me/stickmanskill\)", community), (name, "official Telegram group, not personal contact")
    assert "https://telegram.me/CrazyKaomei" not in community, (name, "personal contact belongs in project support")
    invitations = {
        "en": "Got a style idea or want to get featured? Join our [Telegram Community](https://telegram.me/stickmanskill):",
        "zh-CN": "想推荐画风，或让你的频道获得展示？欢迎加入[官方 Telegram 交流群](https://telegram.me/stickmanskill)。",
        "ja": "スタイルのアイデアや、作品紹介のご希望はありますか？[Telegram コミュニティ](https://telegram.me/stickmanskill)にご参加ください：",
        "ko": "스타일 아이디어가 있거나 작품을 소개하고 싶으신가요? [Telegram 커뮤니티](https://telegram.me/stickmanskill)에 참여하세요:",
        "fr": "Une idée de style ou envie d’être mis à l’honneur ? Rejoignez notre [communauté Telegram](https://telegram.me/stickmanskill) :",
        "pt-BR": "Tem uma ideia de estilo ou quer ganhar destaque? Entre na nossa [comunidade do Telegram](https://telegram.me/stickmanskill):",
        "tr": "Bir stil fikriniz mi var veya öne çıkmak mı istiyorsunuz? [Telegram topluluğumuza](https://telegram.me/stickmanskill) katılın:",
        "id": "Punya ide gaya atau ingin ditampilkan? Bergabunglah dengan [komunitas Telegram kami](https://telegram.me/stickmanskill):",
    }
    assert invitations[active] in community, (name, "preserved style/showcase lead and localized group invitation")
    assert "README" in community and "YouTube" in community, (name, "creator showcase destinations")
    assert "https://github.com/kaomei/stickman-video-director/issues" not in community, (name, "Do not require a GitHub Issue for feedback")
    assert re.search(r"^🔔 \*\*.*\[@AveryRunsAI\]\(https://x\.com/AveryRunsAI\).*\*\*$", community, re.M), (name, "bold X follow line")
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
    assert gallery_styles == ['a1', 'b1', 'a2', 'b2', 'a3', 'b3', 'a4', 'b4', 'style-5', 'b5', 'a6', 'b6', 'a7', 'b7', 'a8'], name
    # Owner rule: A1–A8 left, B1–B7 right; final B cell stays empty. No spanning rows.
    assert len(rows) == (len(gallery_styles) + 1) // 2, name
    assert all(row.count('<td width="50%"') == 2 for row in rows), name
    assert "colspan" not in hero and "rowspan" not in hero, name
    cells = re.findall(r"<td\b[^>]*>(.*?)</td>", hero, re.S)
    placeholders = [cell for cell in cells if "<img" not in cell]
    assert len(placeholders) == len(gallery_styles) % 2, (name, "placeholder only for odd gallery count")
    if placeholders:
        assert placeholders == [cells[-1]] and "<img" in cells[-2], name
        assert not cells[-1].strip(), (name, "last B cell is empty")
    assert text.count('width="90%"') == 15 and text.count('width="360"') == 30, name
    # French typography separates a heading label from its colon with a space.
    style_ids = re.findall(r"^### ([AB]\d+)\s*[:：]", text, re.M)
    card_ids = ["a5" if style == "style-5" else style for style in gallery_styles]
    expected_style_ids = [
        f"{series}{number}"
        for series in ("A", "B")
        for number in range(1, sum(style.startswith(series.lower()) for style in card_ids) + 2)
    ]
    assert style_ids == expected_style_ids, (name, "published style catalog plus one next-style teaser per series")
    teaser_labels = {"en": "Coming soon…", "zh-CN": "待更新…", "ja": "近日公開…", "ko": "곧 공개…", "fr": "Bientôt disponible…", "pt-BR": "Em breve…", "tr": "Yakında…", "id": "Segera hadir…"}
    verify_next_style_teasers(text, name, gallery_styles, teaser_labels[active])
    a7 = section(text, "a7", '<a id="a8"></a>')
    assert len(re.findall(r"^- \*\*", a7, re.M)) == 2, (name, "A7 highlights and use cases")
    a7_videos = ["assets/readme/style-7-rubber-hose.mp4", "assets/readme/style-7-rubber-hose-2.mp4"]
    assert re.findall(r'<a href="([^"]+\.mp4)">', a7) == a7_videos, (name, "A7 approved showcase pair")
    assert all((root / video).is_file() for video in a7_videos), (name, "A7 videos exist")
    a6 = section(text, "a6", '<a id="a7"></a>')
    assert len(re.findall(r"^- \*\*", a6, re.M)) == 2, (name, "A6 advantages and use cases")
    assert re.findall(r'<a href="([^"]+\.mp4)">', a6) == list(a6_videos), name
    assert all(provider in a6 for provider in ("Renoise MCP", "Google Flow", "Tim", "@IfverseTales")), name
    assert "Tested Flow workflow:" not in text and "Click either GIF" not in text, name
    assert "Veo 3.1 Fast" not in a6, (name, "operational model guidance stays in Skill")
    assert "Omni" not in a6, (name, "A6 does not inherit the legacy model")
    assert "15" in hero_blocks[5], (name, "fifteen published A+B visual styles")
    a8 = section(text, "a8", '<a id="a9"></a>')
    assert len(re.findall(r"^- \*\*", a8, re.M)) == 2, (name, "A8 highlights and use cases")
    a8_videos = ["assets/readme/style-8-graphic-novel-2.mp4", "assets/readme/style-8-graphic-novel.mp4"]
    assert re.findall(r'<a href="([^"]+\.mp4)">', a8) == a8_videos, (name, "A8 approved showcase pair")
    assert all((root / video).is_file() for video in a8_videos), (name, "A8 videos exist")
    a8_previews = images(a8)
    a8_preview_pattern = re.escape(pinned) + r"([a-f0-9]{40})/assets/readme/previews/"
    assert len(a8_previews) == len(a8_videos), (name, "A8 has two sample previews")
    pins = set()
    for preview, video in zip(a8_previews, a8_videos):
        gif = re.escape(Path(video).with_suffix(".gif").name)
        match = re.fullmatch(a8_preview_pattern + gif, preview)
        assert match, (name, "A8 sample preview uses immutable CDN", preview)
        pins.add(match[1])
    assert len(pins) == 1, (name, "A8 previews use the same Git revision")
    assert images(hero)[gallery_styles.index("a8")] == a8_previews[1], (name, "A8 homepage uses the sea messenger preview")
    placeholder = section(text, "a9", '<a id="b-styles"></a>')
    assert placeholder.count("](#road-to-10000-stars--creator-ecosystem)") == 1, (name, "A9 roadmap CTA retained")
    assert text.count("](#road-to-10000-stars--creator-ecosystem)") == 3, (name, "A9 and B8 update links plus roadmap navigation")
    b2 = section(text, "b2", '<!-- b3:section:start -->')
    assert len(re.findall(r"^- \*\*", b2, re.M)) == 2, (name, "B2 advantages and use cases")
    assert re.findall(r'<a href="([^"]+\.mp4)">', b2) == ["assets/readme/b2-colorful-sleep.mp4", "assets/readme/b2-colorful-phone-weather.mp4"], (name, "approved B2 pair in requested order")
    assert b2.count('<th width="50%"') == 2 and b2.count('width="360"') == 2, (name, "paired B2 gallery")
    assert "Fola" in b2, (name, "B2 narrator credit")
    assert "Renoise" not in b2 and not re.search(r"^Click a GIF", text, re.M), (name, "no unnecessary helper copy")
    for video in re.findall(r'<a href="([^"]+\.mp4)">', b2):
        assert (root / video).is_file(), (name, video)
    b3 = section(text, "b3", '<!-- b3:section:end -->')
    assert len(re.findall(r"^- \*\*", b3, re.M)) == 2, (name, "B3 advantages and use cases")
    assert re.findall(r'<a href="([^"]+\.mp4)">', b3) == ["assets/readme/b3-tv-night-signal.mp4", "assets/readme/b3-tv-dog.mp4"], (name, "user-selected Desktop B3.1 then B33.2")
    assert b3.count('<th width="50%"') == 2 and b3.count('width="360"') == 2, (name, "paired B3 gallery")
    assert "Bodi" in b3, (name, "B3 narrator credit")
    assert all(token not in b3 for token in ("Renoise", "Fola", "Click a GIF", "@CrazyKaomei")), (name, "no unrelated dependencies, voice, helper copy or watermark")
    for video in re.findall(r'<a href="([^"]+\.mp4)">', b3):
        assert (root / video).is_file(), (name, video)
    b4 = section(text, "b4", '<!-- b4:section:end -->')
    assert re.findall(r'<a href="([^"]+\.mp4)">', b4) == ["assets/readme/b4-dispatch.mp4", "assets/readme/b4-death-clock.mp4"], name
    assert all(token in b4 for token in ("Brian", "@BeanieSurvives")), (name, "B4 identity, voice and reference")
    assert len(re.findall(r"^- \*\*", b4, re.M)) == 3, (name, "B4 visuals, sound and use cases")
    b5 = section(text, "b5", '<!-- b5:section:end -->')
    assert re.findall(r'<a href="([^"]+\.mp4)">', b5) == ["assets/readme/b5-character-explainer.mp4", "assets/readme/b5-character-explainer-crazymei.mp4"], name
    assert len(re.findall(r"^- \*\*", b5, re.M)) == 3, name
    assert all(token in b5 for token in ("The Pharaoh 3", "Claire", "Crazy Mei")), name
    assert b5.count('<th width="50%"') == 2 and b5.count('width="360"') == 2, name
    host_terms = {"en": "Animated presenter", "zh-CN": "动画主讲", "ja": "アニメの語り手", "ko": "애니메이션 진행자", "fr": "Présentateur animé", "pt-BR": "Apresentador animado", "tr": "Animasyonlu sunucu", "id": "Pembawa acara animasi"}
    rights_terms = {"en": "Using a well-known character requires permission", "zh-CN": "使用知名角色需获得授权", "ja": "有名なキャラクターを使う場合は許諾が必要", "ko": "유명 캐릭터를 사용하려면 허가가 필요", "fr": "l’utilisation de personnages connus nécessite une autorisation", "pt-BR": "o uso de personagens conhecidos exige autorização", "tr": "tanınmış karakterleri kullanmak için izin gerekir", "id": "penggunaan karakter terkenal memerlukan izin"}
    assert host_terms[active] in b5, (name, "localized animated host caption")
    introduction = b5.split('<table', 1)[0]
    assert rights_terms[active] in introduction, (name, "inline localized rights reminder")
    assert '<a href=' not in introduction and '](' not in introduction, (name, "rights reminder is plain text")
    assert not any(old in b5 for old in ("Turn your favorite avatar into a stickman star.", "CREDITS.md", "22.8", "49.2", "Character-led")), name
    for video in re.findall(r'<a href="([^"]+\.mp4)">', b5):
        assert (root / video).is_file(), (name, video)
    assert "Character Explainer Style" not in text, name
    b6 = section(text, "b6", '<!-- b6:section:end -->')
    b6_videos = ["assets/readme/b6-dynamic-meme-eiffel-16x9.mp4", "assets/readme/b6-dynamic-meme-hong-kong-v90-20s.mp4"]
    assert re.findall(r'<a href="([^"]+\.mp4)">', b6) == b6_videos, (name, "approved B6 landscape pair")
    assert b6.count('<th width="50%"') == 2 and b6.count('width="360"') == 2, (name, "paired B6 gallery")
    assert len(re.findall(r"^- \*\*", b6, re.M)) == 3, (name, "B6 visuals, motion and use cases")
    # The approved gallery uses story titles instead of duration/ratio labels.
    sample_titles = {
        "en": ["Example 1: The Man Who Sold the Eiffel Tower", "Example 2: 1990s Hong Kong · Buns and Arcades"],
        "zh-CN": ["样片 1：卖掉埃菲尔铁塔的人", "样片 2：90 年代香港 · 菠萝包与街机"],
        "ja": ["作例1：エッフェル塔を売った男", "作例2：90年代の香港 · パイナップルパンとゲームセンター"],
        "ko": ["예시 1: 에펠탑을 판 남자", "예시 2: 1990년대 홍콩 · 파인애플번과 오락실"],
        "fr": ["Exemple 1 : L’homme qui a vendu la tour Eiffel", "Exemple 2 : Hong Kong des années 1990 · Brioches et arcade"],
        "pt-BR": ["Exemplo 1: O homem que vendeu a Torre Eiffel", "Exemplo 2: Hong Kong dos anos 1990 · Pães e fliperamas"],
        "tr": ["Örnek 1: Eyfel Kulesi’ni satan adam", "Örnek 2: 1990’lar Hong Kong’u · Çörek ve atari"],
        "id": ["Contoh 1: Pria yang menjual Menara Eiffel", "Contoh 2: Hong Kong 1990-an · Roti dan arkade"],
    }
    assert re.findall(r'<th\b[^>]*>(.*?)</th>', b6) == sample_titles[active], (name, "localized B6 sample titles")
    assert re.findall(r'<img\b[^>]*\balt="([^"]+)"', b6) == sample_titles[active], (name, "localized B6 sample alt text")
    # The portrait preference now lives in the visuals bullet, with approved localized wording.
    portrait_terms = {
        "en": "with better results in portrait",
        "zh-CN": "竖屏效果更好",
        "ja": "縦型でよりよい仕上がりに",
        "ko": "세로형에서 효과가 더 좋습니다",
        "fr": "pour un meilleur rendu en format vertical",
        "pt-BR": "com melhor resultado no formato vertical",
        "tr": "dikey formatta daha iyi sonuç verir",
        "id": "hasilnya lebih baik dalam format vertikal",
    }
    assert portrait_terms[active] in b6, (name, "localized portrait preference")
    assert images(hero)[gallery_styles.index("b6")] == b6_previews[0], (name, "B6 homepage preview uses immutable CDN")
    assert images(b6) == b6_previews, (name, "B6 sample previews use immutable CDN")
    for video in b6_videos:
        assert (root / video).is_file(), (name, video)
    if is_english:
        teasers = {
            "A": "New Model Engine styles are in preparation. [Star the project](#road-to-10000-stars--creator-ecosystem) to follow future updates.",
            "B": "New Code Engine styles and procedural animations are in preparation. [Star the project](#road-to-10000-stars--creator-ecosystem) to follow future updates.",
        }
        for series, teaser in teasers.items():
            assert text.count(teaser) == 1, (name, series, "one approved workflow-specific roadmap CTA")
            entries = re.findall(rf"^### ({series}(\d+)): (.+)$", text, re.M)
            assert [int(number) for _, number, _ in entries] == list(range(1, len(entries) + 1)), (name, series, "sequential styles")
            assert [title for _, _, title in entries].count("Coming soon…") == 1, (name, series, "one next-style placeholder")
            next_id, _, title = entries[-1]
            assert title == "Coming soon…", (name, series, "placeholder follows the latest released style")
            assert f"### {next_id}: Coming soon…\n\n{teaser}" in text, (name, series, "approved placeholder copy")
        assert re.findall(r"^### (B\d+): (.+)$", text, re.M) == [("B1", "Minimal Line Art"), ("B2", "Colorful Hand-Drawn"), ("B3", "Retro TV"), ("B4", "Survival Thriller"), ("B5", "Avatar Explainer"), ("B6", "Meme Story Animation"), ("B7", "Pixel Theater"), ("B8", "Coming soon…")], (name, "approved B style names plus the next-style teaser")
        assert "<strong>Retro TV</strong><br>" in hero and "Retro TV Style" not in text, (name, "concise English B3 name in gallery and section")
    for variant in ("A1.1", "A1.2", "A2.1", "A2.2"):
        assert variant in text, (name, variant)
    faq = section(text, "faq", "<!-- readme:contribute -->")
    assert re.findall(r"^### Q(\d+)\.", faq, re.M) == [str(i) for i in range(1, 8)], name
    assert all(tag not in faq for tag in ("<details", "<summary")), (name, "visible Q1-Q7")
    if is_english:
        assert "## ❓ Frequently Asked Questions\n" in faq
        questions = (
            "Is this really 100% free? Are there any hidden fees?",
            "How do I maintain character consistency?",
            "What tools do you recommend? Do I need a specific image generation model?",
            "Can I make a video without an existing script?",
            "How does the AI ensure the video has high viewer retention and isn't boring?",
            "Can I monetize these videos on YouTube and TikTok?",
            "Do I need programming skills or an expensive GPU?",
        )
        assert re.findall(r"^### Q\d+\. (.+)$", faq, re.M) == list(questions), (name, "approved English FAQ order")
        faq_answers = re.split(r"^### Q\d+\. .+\n", faq, flags=re.M)[1:]
        # Copy checks preserve the supplied draft; they do not substantiate its marketing claims.
        required_copy = (
            ("$30–$60/month", "zero subscription fees", "third-party API usage"),
            ("code-driven", "image assets", "reference image"),
            ("Codex’s built-in image generation tool", "no separate image generation API", "short sample with audio"),
            ("shower thought", "3-second hook", "story and shots", "topic, target length, and chosen style"),
            ("**visual storytelling psychology**", "**The 3-Second Hook**", "**Visual Metaphors**", "**Pacing & Comic Pauses**"),
            ("reused-content policy", "YouTube Partner Program (YPP)", "decided by each platform"),
            ("GPU", "online video platforms", "renders locally", "performance", "isn’t the deciding factor"),
        )
        for number, (answer, phrases) in enumerate(zip(faq_answers, required_copy), 1):
            for phrase in phrases:
                assert phrase in answer, (name, number, phrase)
        assert [len(re.findall(r"^- ", answer, re.M)) for answer in faq_answers] == [0, 0, 0, 0, 3, 0, 0], (name, "approved FAQ list formatting")
    faq_answers = re.split(r"^### Q\d+\. .+\n", faq, flags=re.M)[1:]
    assert [len(re.findall(r"^- ", answer, re.M)) for answer in faq_answers] == [0, 0, 0, 0, 3, 0, 0], (name, "localized FAQ bullet parity")
    image_model_choice = {
        "en": "**You can choose your own image generation model.**",
        "zh-CN": "**生图模型可以自行选择。**",
        "ja": "**画像生成モデルは自由に選べます。**",
        "ko": "**이미지 생성 모델은 자유롭게 선택할 수 있습니다.**",
        "fr": "**Vous pouvez choisir votre modèle de génération d’images.**",
        "pt-BR": "**Você pode escolher o modelo de geração de imagens.**",
        "tr": "**Görsel üretim modelini kendiniz seçebilirsiniz.**",
        "id": "**Anda bebas memilih model pembuat gambar.**",
    }
    assert image_model_choice[active] in faq_answers[2], (name, "localized image model choice")
    for style_id, next_marker, voice in (("b1", '<a id="b2"></a>', "Bodi"), ("b2", '<a id="b3"></a>', "Fola"), ("b3", '<!-- b3:section:end -->', "Bodi")):
        style_section = section(text, style_id, next_marker)
        assert re.search(r'<td align="center">Google Gemini · [^<]*' + voice, style_section), (name, style_id, "verified sample platform and voice")
    story_plan_copy = {
        "en": ("story and shots", "topic", "target length", "chosen style"),
        "zh-CN": ("故事与分镜", "主题", "目标时长", "所选画风"),
        "ja": ("物語とカット", "題材", "目標の長さ", "選んだスタイル"),
        "ko": ("이야기와 장면", "주제", "목표 길이", "선택한 스타일"),
        "fr": ("récit et les plans", "sujet", "durée visée", "style choisi"),
        "pt-BR": ("história e os planos", "tema", "duração desejada", "estilo escolhido"),
        "tr": ("hikâyeyi ve çekimleri", "konuya", "hedef süreye", "seçilen stile"),
        "id": ("cerita dan pengambilan gambar", "topik", "durasi target", "gaya pilihan"),
    }
    assert all(token in faq_answers[3] for token in story_plan_copy[active]), (name, "story and shot structure scales with topic, length and style")
    assert not re.search(r"6(?:[- ]scene| 幕|シーン|개 장면| scènes| cenas| sahne| adegan)", faq_answers[3]), (name, "no fixed six-scene FAQ promise")
    for answer, tokens in zip(faq_answers, (("MIT", "API"), ("B", "A"), ("Google Flow", "Codex", "Claude Code", "API"), ("3",), ("SFX", "Casually Explained"), ("YouTube", "YPP"), ("A", "B", "Agent"))):
        assert all(token in answer or (token == "Agent" and any(term in answer for term in ("agent", "ajan", "agen", "エージェント", "에이전트"))) for token in tokens), (name, "localized FAQ topic parity", tokens)
    assert "MIT" in faq and "API" in faq and "YouTube" in faq and "Codex" in faq, name
    code = re.findall(r"```text\n(.*?)```", text, re.S)
    assert len(code) == 5, (name, "installation, A example, B example and two publishing-kit prompts")
    assert shared_links[0] in code[0] and "SKILL.md" in code[0], name
    assert all(token in code[1] for token in ("A3", "30", "16:9")), name
    assert all(token in code[2] for token in ("B1", "8", "20", "16:9")), (name, "approved B script and sample request")
    assert "B1" not in code[0] and "A3" not in code[0], name
    modes = section(text, "creation-modes", '<a id="quick-start"></a>')
    assert text.count('<!-- project-sponsor:start -->') == text.count('<!-- project-sponsor:end -->') == 1, name
    partner_block = text.split('<!-- project-sponsor:start -->', 1)[1].split('<!-- project-sponsor:end -->', 1)[0]
    headings = {"en": "API Partners", "zh-CN": "API 合作伙伴", "ja": "API パートナー", "ko": "API 파트너", "fr": "Partenaires API", "pt-BR": "Parceiros de API", "tr": "API İş Ortakları", "id": "Mitra API"}
    assert f'#### {headings[active]}' in partner_block, (name, "localized partner heading")
    assert re.search(r'^#### [^\n]+ · \[[^\]]+ ↗\]\(https://telegram\.me/CrazyKaomei\)$', partner_block, re.M), (name, "project support links to personal Telegram")
    assert partner_block.count('<tr>') == 3 and len(re.findall(r'<td\b', partner_block)) == 6, name
    assert partner_block.index('sponsor-sjolt') < partner_block.index('sponsor-apimart') < partner_block.index('sponsor-renoise'), name
    assert re.findall(r'href="([^"]+)"', partner_block) == ['https://sjolt.ai/', 'https://sjolt.ai/', 'https://go.apimart.ai/tw-stickman-video-director', 'https://go.apimart.ai/tw-stickman-video-director', 'https://renoise.ai/mcp?utm_source=crazykaomei-aini-202610&amp;utm_medium=xcom', 'https://renoise.ai/mcp?utm_source=crazykaomei-aini-202610&amp;utm_medium=xcom'], (name, "exact logo and CTA destinations")
    # GitHub rewrites relative images to its raw-file host, which failed to load
    # in the published README. Match the existing immutable CDN/Camo image path.
    partner_images = images(partner_block)
    assert len(partner_images) == 3, (name, "one image per API partner")
    for url, asset in zip(partner_images, ("sjolt.png", "apimart.png", "renoise.png")):
        assert re.fullmatch(re.escape(pinned) + r"[a-f0-9]{40}/assets/sponsors/" + re.escape(asset), url), (name, "commit-pinned partner image", url)
        assert (root / "assets/sponsors" / asset).is_file(), (name, asset)
    renoise_row = re.findall(r'<tr>(.*?)</tr>', partner_block, re.S)[2]
    assert renoise_row.count('<p>') == 2, (name, "two-paragraph Renoise introduction")
    # Preserve the approved supplied copy; these checks do not substantiate its marketing claims.
    renoise_copy = re.search(r'<td>(.*?)</td>', renoise_row, re.S).group(1)
    assert all(token in renoise_copy for token in ("iOS", "MCP", "Claude", "ChatGPT", "Codex")), (name, "localized Renoise coverage")
    assert "Android" in renoise_copy or "安卓" in renoise_copy, (name, "Renoise Android app coverage")
    assert all(token not in renoise_copy for token in ("40", "24", "Seedance", "Kling", "Wan", "GPT Image")), (name, "superseded Renoise model-count and rollout claims removed")
    b5_second_images = [url for url in images(text) if url.endswith("/b5-character-explainer-crazymei.gif")]
    assert len(b5_second_images) == 1 and all(url.startswith(pinned) for url in b5_second_images), (name, "pin B5 second preview")
    assert 'Thanks to' not in partner_block and '感谢' not in partner_block, name
    assert text.index('<!-- project-sponsor:start -->') > text.index('<a id="creation-modes"></a>'), name
    assert text.index('<!-- project-sponsor:end -->') < text.index('<a id="quick-start"></a>'), name
    modes_before_partners = modes.split('<!-- project-sponsor:start -->', 1)[0]
    comparisons = re.findall(r"<table>(.*?)</table>", modes_before_partners, re.S)
    assert len(comparisons) == 1, (name, "one HTML engine comparison table")
    comparison = comparisons[0]
    comparison_rows = re.findall(r"<tr>(.*?)</tr>", comparison, re.S)
    assert len(comparison_rows) == 7, (name, "header and six comparison rows")
    cells = [re.findall(r"<(th|td)\b([^>]*)>(.*?)</\1>", row, re.S) for row in comparison_rows]
    assert all(len(row) == 3 for row in cells), (name, "three comparison columns")
    assert all('valign="middle"' in attrs for row in cells for _, attrs, _ in row), (name, "all twenty-one cells vertically centered")
    assert [tag for tag, _, _ in cells[0]] == ["th"] * 3, (name, "comparison headers")
    assert not re.sub(r"<[^>]+>", "", cells[0][0][2]).strip(), (name, "blank top-left header")
    assert "A · Model Engine" in cells[0][1][2] and "B · Code Engine" in cells[0][2][2], (name, "new engine names")
    assert all('align="center"' in row[0][1] for row in cells), (name, "centered row labels")
    assert all(tag == "td" and 'align="left"' in attrs for row in cells[1:] for tag, attrs, _ in row[1:]), (name, "left-aligned comparison text")
    row_labels = [re.sub(r"<[^>]+>", "", row[0][2]).strip() for row in cells[1:]]
    assert len(set(row_labels)) == 6 and all(row_labels), (name, "six distinct comparison dimensions")
    if is_english:
        assert row_labels == ["Concept", "Features", "Best for", "Workflow", "Output", "Cost"], (name, "approved English dimensions")
    if active == "zh-CN":
        assert row_labels == ["原理", "特点", "适合", "使用", "产出", "成本"], (name, "approved two-character Chinese dimensions")
    assert all(token in cells[3][2][2] for token in ("Codex", "Claude Code")), (name, "B suitable coding-agent resources")
    assert "20" in cells[4][2][2], (name, "B workflow retains sample approval")
    assert all("•" not in row[1][2] for row in cells[1:]), (name, "concise comparison cells")
    assert '](#' not in comparison, (name, "no redundant navigation row inside comparison")
    shortcut_line = next(line for line in text.splitlines() if '](#style-gallery)' in line)
    assert re.findall(r'\]\((#[^)]+)\)', shortcut_line) == ['#quick-start', '#style-gallery', '#faq', '#road-to-10000-stars--creator-ecosystem', '#community'], (name, "single styles shortcut and community after roadmap")
    assert text.index('<a id="style-gallery"></a>') < text.index('<a id="a-styles"></a>') < text.index('<a id="b-styles"></a>'), (name, "gallery lands at A before B")
    assert text.index('<a id="community"></a>') < text.index('## 💬 '), (name, "community shortcut lands at footer heading")
    setup = modes_before_partners.split("</table>", 1)[1]
    assert all(ratio in setup for ratio in ("9:16", "16:9")), (name, "landscape and portrait support")
    assert re.findall(r'\]\((#[^)]+)\)', setup) == [], (name, "plain style guidance below the table")
    assert not re.search(r"^>", setup, re.M), (name, "unquoted setup copy")
    quick_intro = section(text, "quick-start", "```text")
    assert all(agent in quick_intro for agent in ("Claude Code", "Codex")), (name, "recommended capable agents")
    assert "<strong>" in quick_intro and "</strong>" in quick_intro, (name, "bold tool recommendation")
    if is_english:
        approved_mode_intro = (
            '<a id="creation-modes"></a>\n\n'
            '## 🎬 Two video creation modes: Model Engine vs Code Engine\n\n'
            "**One stickman director, two ways to create your visuals**: A uses video models to generate continuous shots; B uses code to animate layered assets. With the right tools, an AI agent can take either approach through to a finished video, following the selected style’s specifications.\n"
        )
        assert approved_mode_intro in text, (name, "approved centered CTA, navigation and bold workflow introduction")
        approved_setup_copy = (
            "Start with an idea, an article, a web link, or a complete script. Both modes support short videos and longer content. Choose `16:9` landscape or `9:16` portrait for your publishing platform, and configure captions, voiceover, background music, and sound effects to suit your needs and the selected style.\n\n"
            "Still deciding on a style? Below, you’ll find detailed descriptions, suggested topics, and more sample videos for each style."
        )
        assert modes_before_partners.rstrip().endswith(approved_setup_copy), (name, "approved input, length, ratio, audio and linked style guidance")
    assert all(token in modes for token in ("Codex", "Claude Code", "Model Engine", "Code Engine")), name
    a_agent = section(text, "director-start", '<a id="autopilot-start"></a>')
    assert "Google Flow" in a_agent and code[1] in a_agent, (name, "A unified prompt and platform recommendation")
    assert len(re.findall(r"```text\n(.*?)```", a_agent, re.S)) == 1, (name, "one A prompt template")
    quick = section(text, "quick-start", '<a id="style-gallery"></a>')
    assert len(re.findall(r"^### Step [123]", quick, re.M)) == 3, (name, "three quick-start steps")
    assert not re.search(r"^### Step 4|^---\s*$", quick, re.M), (name, "no removed Step 4 or step separators")
    a_intro = section(text, "a-styles", '<a id="a1"></a>')
    b_intro = section(text, "b-styles", '<a id="b1"></a>')
    assert "Model Engine" in a_intro or active == "zh-CN", (name, "A engine overview")
    assert "Google Flow" in a_intro and "<strong>" in a_intro, (name, "A showcase source and emphasized account setup")
    assert "Code Engine" in b_intro or active == "zh-CN", (name, "B engine overview")
    assert all(token in b_intro for token in ("Codex", "<strong><code>gpt-image-2</code></strong>")), (name, "B showcase production source and configured image model")
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
    print(f"{name}: navigation, A/B structure, 7 FAQs, media, links and examples passed.")

print("Eight languages share the approved A/B layout; French follows Korean.")

