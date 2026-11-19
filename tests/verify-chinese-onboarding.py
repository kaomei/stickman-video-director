#!/usr/bin/env python3
"""Protect the approved Chinese A/B layout, working links and B1 showcase."""
from pathlib import Path
import hashlib
import re
import struct

root = Path(__file__).resolve().parents[1]
cn = (root / "README.zh-CN.md").read_text()
assert (root / "README.md").read_bytes() == (root / "README.en.md").read_bytes()
assert "# 🎬 Stickman Video Director" in cn
assert "[**🇨🇳 简中**](README.zh-CN.md)" in cn
assert "[🇰🇷 한국어](README.ko.md) · [🇫🇷 FR](README.fr.md)" in cn, "French follows Korean in the shared navigation"
assert (root / "README.fr.md").is_file(), "French navigation must open a complete README"
hero_copy = cn.split("</div>", 1)[0]
assert "**用全自动火柴人动画，规模化量产你的无人出镜频道。**" in hero_copy
assert "几分钟内，通过 14 款实操验证的画风把原始文案变成高完播率动画视频 —— 镜头调度、旁白配音与音效设计一键配齐。" in hero_copy
assert "**告别繁琐动效手搓，不交每月几十刀的软件订阅税。日更内容，轻松无压力。**" in hero_copy
assert "画风持续更新，适用于" not in hero_copy, "Keep the removed niche sentence out of the hero"
assert "*⭐ 欢迎点亮 Star，第一时间解锁最新画风与功能更新！*" in hero_copy
assert "**每一颗 Star，都为下一次更新添一把火！**" in cn
assert "100% 免费、开源的工作室" in cn
assert "我是烤妹儿" not in cn, "Keep the follow CTA focused on reader value, not self-introduction"
readable_cn = re.sub(r'<[^>]+>|\]\([^)]+\)|https?://[^\s<>)"]+', "", cn.replace("# 🎬 Stickman Video Director\n", "", 1))
outside_faq = cn.split('<a id="faq"></a>', 1)[0] + cn.split('<!-- readme:contribute -->', 1)[1]
readable_outside_faq = re.sub(r'<[^>]+>|\]\([^)]+\)|https?://[^\s<>)"]+', "", outside_faq.replace("# 🎬 Stickman Video Director\n", "", 1))
assert not re.search(r"\b(?:Director|Autopilot)\b", readable_outside_faq, re.I), "Use the approved engine names; preserve the project title, technical paths and anchors"
assert "自动成片" not in readable_cn, "Do not restore the retired mode-B label"
assert not re.search(r"(?<!AI )助手|(?<=[\u4e00-\u9fff])AI 助手", readable_cn), "Use AI 助手 consistently, with spaces between English and Chinese"
assert "### A · Model Engine" in cn
assert "### B · Code Engine" in cn

sections = ("## 🎬 两种视频制作模式", "## 🧭 开始使用", "## 🎨 A 模式画风一览",
            "## 🤖 B 模式画风一览", "## ❓ 常见问题解答 (FAQ)", "## ⭐ 迈向 20,000 Stars 与创作者生态",
            "## 🔮 计划中的画风", "## 💬 社区与投稿", "## 📄 许可证")
assert [cn.index(s) for s in sections] == sorted(cn.index(s) for s in sections)
assert "## 接下来做什么" not in cn, "Keep the removed next-steps heading out of the footer"
assert "## Star 增长曲线" not in cn, "Use a reader-focused footer heading; retain the chart itself"
footer = cn.split("## ⭐ 迈向 20,000 Stars 与创作者生态", 1)[1].split("## 📄 许可证", 1)[0]
footer_items = ("**每一颗 Star", "- [x] **1,000 Stars**", "- [x] **3,000 Stars**",
                "- [x] **6,000 Stars**", "- [ ] **🔥 10,000 Stars**", "- [ ] **20,000 Stars**",
                '<div align="center">', '<a id="whats-next"></a>', "## 🔮 计划中的画风",
                "## 💬 社区与投稿", "🔔 **在 X 上关注")
assert [footer.index(s) for s in footer_items] == sorted(footer.index(s) for s in footer_items), "Place roadmap before the unchanged chart, then styles, submissions and the X follow link"
mode_comparison = cn.split('<a id="creation-modes"></a>', 1)[1].split('<!-- project-sponsor:start -->', 1)[0]
comparison_table = re.search(r"<table>(.*?)</table>", mode_comparison, re.S).group(1)
comparison_rows = re.findall(r"<tr>(.*?)</tr>", comparison_table, re.S)
assert len(comparison_rows) == 7, "Keep one header and the approved six comparison dimensions"
comparison_cells = [re.findall(r"<(th|td)([^>]*)>(.*?)</\1>", row, re.S) for row in comparison_rows]
assert all(len(cells) == 3 for cells in comparison_cells), "Each comparison row has a label and two engines"
assert [re.sub(r"<[^>]+>", "", cell[2]) for cell in comparison_cells[0]] == [
    "", "A · Model Engine (模型引擎)", "B · Code Engine (代码引擎)"
], "Keep the top-left header empty and the two approved engine headings"
assert all(cell[0] == "th" for cell in comparison_cells[0])
assert [cells[0][2] for cells in comparison_cells[1:]] == [
    f"<strong>{label}</strong>" for label in ("原理", "特点", "适合", "使用", "产出", "成本")
], "Keep six approved concise comparison dimensions"
assert all('valign="middle"' in attrs for cells in comparison_cells for _, attrs, _ in cells), "Vertically center all 21 comparison cells"
assert all('align="center"' in attrs for _, attrs, _ in comparison_cells[0])
for cells in comparison_cells[1:]:
    assert all(tag == "td" for tag, _, _ in cells)
    assert 'align="center"' in cells[0][1]
    assert all('align="left"' in attrs for _, attrs, _ in cells[1:]), "Keep explanatory columns left-aligned"
assert len(re.findall(r"<table>", mode_comparison)) == 1, "Use a single comparison table"
assert "手动出片" in comparison_cells[4][1][2] and "内置浏览器" in comparison_cells[4][1][2]
assert "分层动画" in mode_comparison and "插画轮播" not in mode_comparison, "Describe B as layered code animation, without restricting all B styles to B1"
assert "逐段提示词" in comparison_cells[5][1][2] and "完整视频文件" in comparison_cells[5][1][2]
assert "分层素材库（角色/场景/道具）+ 完整视频文件" == comparison_cells[5][2][2]
assert "一次安装，按需选择" not in cn, "Keep the removed mode-selection sentence out of the introduction"
quick_start_intro = cn.split('<a id="quick-start"></a>', 1)[1].split('<a id="director-start"></a>', 1)[0]
assert "<strong>想尽可能接近展示样片，建议优先使用 Codex、Claude Code 等编程能力较强的 AI 工具。</strong>" in quick_start_intro
assert "也可安装到其他具备文件读写与终端执行能力的 Agent" in quick_start_intro
assert "最终效果可能有所差异" in quick_start_intro
assert "把以下内容发送给你的 AI 助手：" in quick_start_intro
install = quick_start_intro.split("```text\n", 1)[1].split("```", 1)[0]
assert "帮我安装这个 Skill:" in install
assert "https://github.com/kaomei/stickman-video-director" in install
assert "安装成功后读取 SKILL.md" in install
assert "A3" not in install, "Keep the shared installation separate from the Director example"
assert max(map(len, install.splitlines())) <= 55, "Wrap installation instructions at readable phrase boundaries"
assert "之后每完成一个阶段" not in quick_start_intro, "Keep the removed progress explanation out of the README introduction"
assert "安装后，把下面这段发给 AI 助手，换成自己的话题即可：" not in cn
director_start = cn.split('<a id="director-start"></a>', 1)[1].split('<a id="autopilot-start"></a>', 1)[0]
director_example = director_start.split("```text\n", 1)[1].split("```", 1)[0]
assert director_example.startswith("使用模型引擎（A 模式），"), "Explicitly select Model Engine / A in the reusable example"
assert "填写话题、粘贴文案，或直接描述你的想法" in director_example
assert "人类的第一份工作是怎么来的" not in director_example, "Use a fill-in template rather than a hard-coded topic"
assert "也可以直接贴已有文案或文章" not in cn
assert "[查看画风一览 ↓]" not in cn, "Do not restore the removed per-mode shortcut links"
assert "[样片展厅](#style-gallery)" in cn, "Use one localized style shortcut landing at A then B"
navigation = next(line for line in cn.splitlines() if line.startswith("[快速上手](#quick-start)"))
assert navigation.endswith("[常见问题](#faq) · [路线图](#road-to-10000-stars--creator-ecosystem) · [交流社区](#community)"), "Community follows the roadmap shortcut"
assert "[最近更新]" not in navigation, "Keep the removed updates shortcut out of the navigation"
assert '<a id="recent-updates"></a>' not in cn, "Do not restore the removed updates anchor"
assert "## 最近更新" not in cn, "Do not restore the removed updates section"
assert "完整制作教程" not in navigation
assert "[X 详细教程](https://x.com/CrazyKaomei/status/2102311241046008268)" in director_start, "Keep the visual X walkthrough with step-by-step video demos in the Director instructions"
assert "## 使用小贴士" not in cn
faq = cn.split('<a id="faq"></a>', 1)[1].split('<!-- readme:contribute -->', 1)[0]
faq_questions = (
    "这真的是 100% 免费的吗？有没有隐藏收费？",
    "我该怎么保持角色的一致性？",
    "推荐用什么工具？必须用指定的生图模型吗？",
    "如果我手里没有写好的现成剧本，能直接做视频吗？",
    "它是如何确保视频具有高完播率、有梗且不枯燥的？",
    "生成的视频可以在 YouTube 和 TikTok 上开通收益变现吗？",
    "我需要懂编程或者拥有昂贵的高性能显卡吗？",
)
assert re.findall(r"^### Q(\d+)\. (.+)$", faq, re.M) == [
    (str(number), question) for number, question in enumerate(faq_questions, 1)
], "Keep the approved seven FAQ questions, order and visible heading format"
assert "<details" not in faq and "</details>" not in faq and "<summary" not in faq, "Do not collapse the FAQ answers"
faq_answers = re.split(r"^### Q\d+\. .+\n", faq, flags=re.M)[1:]
# These are supplied-copy checks, not factual verification of the draft's claims.
required_copy = (
    ("MIT 开源协议", "$30–$60", "没有任何订阅费", "按需支付官方 API 费用"),
    ("**B · Code Engine（代码引擎）**", "代码驱动", "人物素材图", "不同场景中复用", "**A · Model Engine（模型引擎）**", "火柴人角色参考图"),
    ("**A 模式推荐用 Google Flow 生成视频片段，B 模式推荐用 Codex 制作成片。**", "**生图模型可以自行选择。**", "Codex 内置生图工具", "无需另接生图 API", "Claude Code", "有声样片"),
    ("公众号长文", "前 3 秒爆款黄金钩子", "根据主题、目标时长和所选画风安排故事与分镜"),
    ("**视觉叙事心理学**", "**黄金 3 秒钩子**", "**爆款视觉隐喻**", "**卡点与节奏留白**", "Casually Explained"),
    ("搬运重复内容（Reused Content）", "高价值原创内容", "YouTube 创作者收益计划（YPP）", "TikTok 创作者基金"),
    ("不需要自己写代码", "高端显卡", "A 模式", "B 模式", "Agent", "在本地渲染", "但不是决定性因素"),
)
for number, (answer, phrases) in enumerate(zip(faq_answers, required_copy), 1):
    for phrase in phrases:
        assert phrase in answer, (number, phrase)
assert [len(re.findall(r"^- ", answer, re.M)) for answer in faq_answers] == [0, 0, 0, 0, 3, 0, 0], "Keep the approved FAQ paragraph/bullet structure"
assert all(len(answer.strip().split("\n\n")) == 2 for answer in faq_answers[1:3]), "Keep consistency and tool answers to two concise paragraphs"
assert faq.count("<!-- readme:platforms -->") == 1 and "<!-- readme:platforms -->" in faq_answers[0], "Keep the internal platform marker after Q1"
assert "Codex、Claude Code" in cn and "Google Flow" in cn
assert "给一个想法、一篇文章、网页链接或完整脚本，即可开始制作。" in mode_comparison
assert "两种模式均支持短视频与长篇内容" in mode_comparison
assert "`16:9` 横屏或 `9:16` 竖屏" in mode_comparison
assert "字幕、旁白配音、背景音乐和音效" in mode_comparison
assert "](#a-styles)" not in mode_comparison and "](#b-styles)" not in mode_comparison
assert "<strong>使用</strong>" in mode_comparison and "内置浏览器操作生成片段" in mode_comparison
assert "确认脚本和 20 秒有声样片后" in cn
autopilot_start = cn.split('<a id="autopilot-start"></a>', 1)[1].split('<a id="style-gallery"></a>', 1)[0]
autopilot_example = autopilot_start.split("```text\n", 1)[1].split("```", 1)[0]
assert autopilot_example.startswith("使用代码引擎（B 模式），"), "Explicitly select Code Engine / B in the reusable example"
for requirement in ("话题/文章", "有吸引力的火柴人视频", "粘贴长文、新闻、链接，或描述选题需求", "时长 8 分钟", "B1「极简线稿风」", "旁白、字幕和音效", "20 秒有声样片", "本地渲染", "交付完整视频"):
    assert requirement in autopilot_start, requirement
assert "Node.js" not in autopilot_start and "FFmpeg" not in autopilot_start
assert "开始前按所选方案配置" not in autopilot_start, "Let the installed AI assistant guide setup rather than prescribe a separate manual setup step"
autopilot_notes = autopilot_start.split("```", 2)[2].split("### Step 3", 1)[0]
for requirement in ("**出片流程：**", "确认脚本和 20 秒有声样片后", "在本地渲染整片并提供预览", "**局部微调：**", "只微调对应片段，保留已确认的部分"):
    assert requirement in autopilot_notes, requirement
assert len(re.findall(r"^- ", autopilot_notes, re.M)) == 2
for label in ("A1：经典黑白风", "A2：现代潮酷风", "A3：史前洞穴风",
              "A4：治愈故事风", "A5：历史卡通风", "A6：暖金暗影风", "A7：橡皮管动画风 · Rubber Hose Animation", "A8：待更新…", "B1：极简线稿风", "B2：彩色手绘风", "B3：复古电视风", "B4：求生短剧风", "B5：角色解说风", "B6：动感 Meme 风"):
    assert f"### {label}\n" in cn, label
hero = cn.split('<table width="100%">', 1)[1].split("</table>", 1)[0]
style_names = ("经典黑白风", "现代潮酷风", "史前洞穴风", "治愈故事风", "历史卡通风", "暖金暗影风", "橡皮管动画风")
b_style_names = [name for name in re.findall(r"^### B\d+：([^\n]+)$", cn, re.M)
                 if not name.startswith("待更新")]
assert re.findall(r"<strong>([^<]+)</strong><br>", hero) == [item for pair in zip(list(style_names), b_style_names + [None]) for item in pair if item is not None], "A1–A7 left, B1–B6 right, final right cell empty"
assert "<strong>极简线稿风</strong><br>" in hero, "Use the approved B1 preview in the sixth cell"
assert re.findall(r'<a href="#([^"]+)"><img', hero)[:4] == ["a1", "b1", "a2", "b2"], "Link the first four previews directly to their style details"
assert f"{len(style_names) + len(b_style_names)} 款实操验证的画风" in hero_copy
assert "img.shields.io/badge/Styles" not in hero_copy and "**14 种画风" not in cn
assert "种视觉方案" not in cn, "Count A+B styles once, not variants as a separate metric"
assert re.search(r'<a href="#b1"><img src="([^"]+/b1-minimal-handdrawn\.gif)"[^>]+width="90%"></a>', hero), "Use B1 example 1 in the top gallery and keep its detail-section link"
for number, name in enumerate(style_names, 1):
    detail_name = name + (" · Rubber Hose Animation" if number == 7 else "")
    assert f"### A{number}：{detail_name}\n" in cn, "Keep preview and detail names aligned"
assert "史前黑色幽默" not in cn and "史前手绘 / 黑色幽默" not in cn
assert "采用风格 A3「史前洞穴风」" in director_example
assert "人物三视图" not in director_start, "Do not add mandatory character sheets to quick-start"
assert "三视图（正面、侧面、背面）" not in director_start, "Do not move the removed FAQ's detailed guidance into the quick-start"
director_examples = re.findall(r"```text\n(.*?)```", director_start, re.S)
assert len(director_examples) == 1, "Keep one unified A prompt template"
assert "**出片流程：**" in director_start and "低分辨率试片" in director_start
assert "**推荐平台：**" in director_start and "Google Flow" in director_start
assert len(re.findall(r"^- ", director_start, re.M)) == 2
quick = cn.split('<a id="quick-start"></a>', 1)[1].split('<a id="style-gallery"></a>', 1)[0]
assert len(re.findall(r"^### Step [123]", quick, re.M)) == 3
assert not re.search(r"^### Step 4|^---\s*$", quick, re.M)
assert "安装超时？" not in quick
for anchor, end, requirements in (
    ("a-styles", "a1", ("基于 [Google Flow](https://flow.google.com/) 制作", "<strong>交由 Agent 自动出片前，请确认账号已登录且有可用额度。</strong>", "按 A1、A2、A3…更新")),
    ("b-styles", "b1", ("样片均由 Codex 制作", "<strong><code>gpt-image-2</code></strong>", "代码驱动分层动画", "在本地渲染成片", "<strong>请确认其具备文件读写与终端执行能力，且所需工具已配置完成。</strong>", "按 B1、B2、B3…更新")),
):
    intro = cn.split(f'<a id="{anchor}"></a>', 1)[1].split(f'<a id="{end}"></a>', 1)[0]
    for requirement in requirements:
        assert requirement in intro, (anchor, requirement)
for variant in ("A1.1", "A1.2", "A2.1", "A2.2"):
    assert variant in cn, variant

assert '<a id="storyboard-example"></a>' not in cn, "Do not restore the removed storyboard example"
assert "看看一个 30 秒故事的完整分镜" not in cn

assert cn.count("<details>") == cn.count("</details>")
assert cn.count('<div align="center">') == cn.count("</div>")
assert cn.count("<table") == cn.count("</table>")
assert len(re.findall(r"<td(?:\s|>)", cn)) == cn.count("</td>")
ids = re.findall(r'<a id="([^"]+)"></a>', cn)
assert len(ids) == len(set(ids)), "Duplicate explicit anchors"
for anchor in re.findall(r'\]\(#([^)]+)\)|href="#([^"]+)"', cn):
    assert next(part for part in anchor if part) in ids, anchor
for link in re.findall(r"\]\(([^)]+)\)", cn):
    if "://" not in link and not link.startswith("#"):
        assert (root / link.split("#")[0]).is_file(), link

previews = sorted(set(re.findall(r'src="(?:https://cdn\.jsdelivr\.net/gh/kaomei/stickman-video-director@[0-9a-f]{40}/)?(assets/readme/previews/[^" ]+\.gif)"', cn)))
assert len(previews) == 29, "Keep the 27 published previews and append the approved B7 pair"
assert "assets/readme/previews/b5-character-explainer.gif" in previews
assert "assets/readme/previews/b5-character-explainer-crazymei.gif" in previews
assert "assets/readme/previews/b6-dynamic-meme-eiffel-16x9.gif" in previews
assert "assets/readme/previews/b6-dynamic-meme-hong-kong-v90-20s.gif" in previews
for name in ("b4-dispatch", "b4-death-clock"):
    assert f"assets/readme/previews/{name}.gif" in previews
for a6_name in ("flow", "mcp"):
    assert f"assets/readme/previews/style-6-amber-noir-{a6_name}.gif" in previews
for preview in previews:
    file = root / preview
    header = file.read_bytes()[:10]
    assert header[:6] in (b"GIF87a", b"GIF89a")
    width, height = struct.unpack("<HH", header[6:10])
    assert width <= 640 and height <= 360
    # Preserve the approved A7 GIFs (4.42 MB / 4.02 MB); older preview budgets stay unchanged.
    a7_previews = {"assets/readme/previews/style-7-rubber-hose.gif", "assets/readme/previews/style-7-rubber-hose-2.gif"}
    assert file.stat().st_size < (5_000_000 if preview in a7_previews else 4_000_000)
b1 = cn.split('<a id="b1"></a>', 1)[1].split('<a id="b2"></a>', 1)[0]
assert "点击动图，查看或下载有声样片。" not in cn, "Owner requested no repeated GIF-click helper copy"
assert re.search(r'src="([^"]+/b1-minimal-handdrawn\.gif)"', hero).group(1) == re.search(r'src="([^"]+/b1-minimal-handdrawn\.gif)"', b1).group(1), "Reuse the immutable B1 example 1 preview in the top gallery"
fields = ("- **视觉亮点**：", "- **适合内容**：")
assert all(b1.count(field) == 1 for field in fields), "Keep the approved concise style benefits"
assert "- **怎么选**：" not in b1, "Do not restore the removed repetitive selection copy"
assert [b1.index(field) for field in fields] == sorted(b1.index(field) for field in fields)
table = re.search(r'<table width="100%">(.*?)</table>', b1, re.S).group(1)
rows = re.findall(r"<tr>(.*?)</tr>", table, re.S)
assert len(rows) == 3, "Keep two B1 short cases with a heading, preview and caption row"
assert re.findall(r'<th width="50%" align="center">(.*?)</th>', rows[0]) == [
    "案例 1：不露脸做 YouTube", "案例 2：每天发内容，为什么依旧没人看？"
], "Use concise B1 case titles while preserving the original and later sample order"
cells = re.findall(r'<td width="50%" align="center">(.*?)</td>', rows[1], re.S)
assert len(cells) == 2, "Keep both preview columns equally sized and centered"
assert 'href="assets/readme/b1-minimal-handdrawn.mp4"' in cells[0] and "/b1-minimal-handdrawn.gif\"" in cells[0]
assert 'href="skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4"' in cells[1] and "/b1-minimal-handdrawn-2026-10-23.gif\"" in cells[1]
assert all('width="360"' in cell for cell in cells), "Match A's lightweight preview width"
assert len(re.findall(r'<td align="center">.*?</td>', rows[2])) == 2
assert "待更新" not in table, "Both short cases already exist"
assert re.findall(r'href="([^"]+\.mp4)"', b1) == [
    "assets/readme/b1-minimal-handdrawn.mp4", "skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4"
], "Show only the two approved short samples, not the new longform film"
assert "播放有声样片" not in b1 and "画风与制作说明" not in b1, "Do not restore the removed redundant link row"
assert re.search(r'<img src="https://cdn\.jsdelivr\.net/gh/kaomei/stickman-video-director@[0-9a-f]{40}/assets/readme/previews/b1-minimal-handdrawn-2026-10-23\.gif"[^>]+width="360">', b1), "Keep the immutable B1 preview route and match A's preview width"
assert 'href="skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4"' in b1, "Click the preview to view/download the approved sample with sound"
assert "点击查看或下载 Bodi 有声样片" in b1, "GitHub MP4 blob links must not promise inline playback"
current_sample = root / "skills/directing-stickman-videos/assets/b1/approved-2026-10-23.mp4"
assert hashlib.sha256(current_sample.read_bytes()).hexdigest() == "111c241a836a0c26b27df2cbff3ba5697b97460dbb873b68dd2f6eda2383b3fc", "Publish the accepted Ryan V4, not the runtime fixture"
sample = root / "assets/readme/b1-minimal-handdrawn.mp4"
assert hashlib.sha256(sample.read_bytes()).hexdigest() == "9d2a1789eec25ad3b825631ee3d1ea3cb7417aafb0a5c223ccce08434cedcc3a", "Restore the original V15 sample without regenerating it"
assert "https://github.com/leksautomate" in cn
assert "api.star-history.com/svg" in cn
license_targets = {"LICENSE", "https://github.com/kaomei/stickman-video-director/blob/main/LICENSE"}
assert any("MIT" in label and target in license_targets
           for label, target in re.findall(r"\[([^\]]+)\]\(([^)]+)\)", cn)), "Link the repository's MIT license"
print("Chinese A/B layout, approved narration/CTA, links, restored V15 case 1 and Ryan V4 case 2 passed.")
