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
assert "**将任何脚本变成适合不露脸 YouTube 频道的多画风爆款火柴人动画视频。完全开源。**" in hero_copy
assert "从一个话题、一篇文章或一份脚本开始，自动编排画面、配音、字幕与音效，制作可直接发布的火柴人视频。" in hero_copy
assert "**⚡ 100% 免费开源。无需出镜，无需每月 $50 的订阅，几分钟就能完成，不必等上几天。**" in hero_copy
assert "画风持续更新，适用于 **科学科普、暗黑心理学、科技寓言、热门奇闻与故事类频道。**" in hero_copy
assert "为项目点个 Star，及时关注下一批画风和新功能解锁。" in cn
assert "**每一颗 Star，都为下一次更新添一把火！**" in cn
assert "100% 免费、开源的工作室" in cn
assert "我是烤妹儿" not in cn, "Keep the follow CTA focused on reader value, not self-introduction"
readable_cn = re.sub(r'<[^>]+>|\]\([^)]+\)|https?://[^\s<>)"]+', "", cn.replace("# 🎬 Stickman Video Director\n", "", 1))
outside_faq = cn.split('<a id="faq"></a>', 1)[0] + cn.split('<!-- readme:contribute -->', 1)[1]
readable_outside_faq = re.sub(r'<[^>]+>|\]\([^)]+\)|https?://[^\s<>)"]+', "", outside_faq.replace("# 🎬 Stickman Video Director\n", "", 1))
assert not re.search(r"\b(?:Director|Autopilot)\b", readable_outside_faq, re.I), "Use Chinese mode names outside the user-supplied bilingual FAQ; preserve technical paths and anchors"
assert "自动成片" not in readable_cn, "Use 全自动模式 consistently for mode B"
assert not re.search(r"(?<!AI )助手|(?<=[\u4e00-\u9fff])AI 助手", readable_cn), "Use AI 助手 consistently, with spaces between English and Chinese"
assert "### A · 导演模式：逐段生成分镜提示词" in cn
assert "### B · 全自动模式：一句话生成长片" in cn

sections = ("## 🎬 两种视频制作模式", "## 🧭 开始使用", "## 🎨 A · 导演模式画风一览",
            "## 🤖 B · 全自动模式画风一览", "## ❓ 常见问题解答 (FAQ)", "## ⭐ 迈向 10,000 Stars 与创作者生态",
            "## 🔮 计划中的画风", "## 💬 社区与投稿", "## 📄 许可证")
assert [cn.index(s) for s in sections] == sorted(cn.index(s) for s in sections)
assert "## 接下来做什么" not in cn, "Keep the removed next-steps heading out of the footer"
assert "## Star 增长曲线" not in cn, "Use a reader-focused footer heading; retain the chart itself"
footer = cn.split("## ⭐ 迈向 10,000 Stars 与创作者生态", 1)[1].split("## 📄 许可证", 1)[0]
footer_items = ("**每一颗 Star", "- [x] **1,000 Stars**", "- [ ] **10,000 Stars**",
                '<div align="center">', '<a id="whats-next"></a>', "## 🔮 计划中的画风",
                "## 💬 社区与投稿", "🔔 *在 X 上关注")
assert [footer.index(s) for s in footer_items] == sorted(footer.index(s) for s in footer_items), "Place roadmap before the unchanged chart, then styles, submissions and the X follow link"
mode_comparison = cn.split('<a id="creation-modes"></a>', 1)[1].split('<a id="quick-start"></a>', 1)[0]
mode_rows = [line for line in mode_comparison.splitlines() if line.startswith("|")]
assert not any(row.startswith(("| **操作** |", "| **用途** |")) for row in mode_rows), "Keep the comparison concise without the removed operation and use-case rows"
assert mode_rows[0] == '|  | <div align="center">A · 导演模式</div> | <div align="center">B · 全自动模式</div> |', "Center only the mode headings"
assert mode_rows[1] == "|:---:|:---|:---|", "Keep explanatory columns left-aligned"
assert mode_rows[-1] == '| **开始** | <div align="center"><a href="#director-start">使用导演模式</a></div> | <div align="center"><a href="#autopilot-start">使用全自动模式</a></div> |', "Center the two start links"
assert all('align="center"' not in row for row in mode_rows[2:-1]), "Do not center the explanatory body text"
assert "插画分镜＋微动画" in mode_comparison and "插画轮播" not in mode_comparison, "Describe B as illustrated scenes rather than a slideshow; do not impose B1's drawing style on every B style"
assert "一次安装，按需选择" not in cn, "Keep the removed mode-selection sentence out of the introduction"
quick_start_intro = cn.split('<a id="quick-start"></a>', 1)[1].split('<a id="director-start"></a>', 1)[0]
assert "兼容 Claude Code、Codex、Cursor、Antigravity，或任何具备文件和终端访问能力的智能体环境。" in quick_start_intro
assert "把以下内容发送给你的 AI 助手：" in quick_start_intro
install = quick_start_intro.split("```text\n", 1)[1].split("```", 1)[0]
assert "帮我安装这个 Skill：" in install
assert "https://github.com/kaomei/stickman-video-director" in install
assert "已安装的 SKILL.md" in install
assert "A3" not in install, "Keep the shared installation separate from the Director example"
assert max(map(len, install.splitlines())) <= 55, "Wrap installation instructions at readable phrase boundaries"
assert "之后每完成一个阶段" not in quick_start_intro, "Keep the removed progress explanation out of the README introduction"
assert "安装后，把下面这段发给 AI 助手，换成自己的话题即可：" in cn
director_start = cn.split('<a id="director-start"></a>', 1)[1].split('<a id="autopilot-start"></a>', 1)[0]
director_example = director_start.split("```text\n", 1)[1].split("```", 1)[0]
assert director_example.startswith("使用导演模式/A模式，"), "Explicitly select mode A in the reusable Director example"
assert "填写话题、粘贴文案，也可以直接描述需求" in director_example
assert "人类的第一份工作是怎么来的" not in director_example, "Use a fill-in template rather than a hard-coded topic"
assert "也可以直接贴已有文案或文章" not in cn
assert "[查看画风一览 ↓]" not in cn, "Do not restore the removed per-mode shortcut links"
assert "[导演模式画风](#a-styles) · [全自动模式画风](#b-styles)" in cn, "Keep the localized top style navigation"
navigation = next(line for line in cn.splitlines() if line.startswith("[开始使用](#quick-start)"))
assert navigation.endswith("[常见问题](#faq) · [路线图](#road-to-10000-stars--creator-ecosystem)"), "FAQ followed by the approved roadmap shortcut"
assert "[最近更新]" not in navigation, "Keep the removed updates shortcut out of the navigation"
assert '<a id="recent-updates"></a>' not in cn, "Do not restore the removed updates anchor"
assert "## 最近更新" not in cn, "Do not restore the removed updates section"
assert "完整制作教程" not in navigation
assert "[X 上的可视化制作教程](https://x.com/CrazyKaomei/status/2102311241046008268)（含分步视频演示的串帖）" in director_start, "Keep the visual X walkthrough with step-by-step video demos in the Director instructions"
assert "## 使用小贴士" not in cn
faq = cn.split('<a id="faq"></a>', 1)[1].split('<!-- readme:contribute -->', 1)[0]
faq_questions = (
    "这真的是 100% 免费的吗？有没有隐藏收费？",
    "生成的视频可以在 YouTube 和 TikTok 上开通收益变现吗？",
    "我需要懂编程或者拥有昂贵的高性能显卡吗？",
    "如果我手里没有写好的现成剧本，能直接做视频吗？",
    "我应该如何选择“分镜导演模式”与“全自动模式”？",
    "它是如何确保视频具有高完播率、有梗且不枯燥的？",
    "支持哪些 AI 助手和剪辑软件？",
    "如果成片里某个单独镜头我不满意，必须全片推倒重做吗？",
)
assert re.findall(r"^### Q(\d+)\. (.+)$", faq, re.M) == [
    (str(number), question) for number, question in enumerate(faq_questions, 1)
], "Keep the supplied Chinese Q1-Q8 wording, order and visible heading format"
assert "<details" not in faq and "</details>" not in faq and "<summary" not in faq, "Do not collapse the FAQ answers"
faq_answers = re.split(r"^### Q\d+\. .+\n", faq, flags=re.M)[1:]
# These are supplied-copy checks, not factual verification of the draft's claims.
required_copy = (
    ("MIT 开源协议", "$30–$60", "没有任何订阅费", "按需支付官方 API 费用"),
    ("搬运重复内容（Reused Content）", "高价值原创内容", "YouTube 创作者收益计划（YPP）", "TikTok 创作者基金"),
    ("专业独立显卡", "**分镜导演模式（Director Mode）**", "**全自动模式（Autopilot Mode）**", "云端 API 或轻量级渲染"),
    ("公众号长文", "前 3 秒爆款黄金钩子", "6 幕式标准分镜"),
    ("**选择分镜导演模式（Director Mode）**", "**选择全自动模式（Autopilot Mode）**", "生成字幕并合成完整成片"),
    ("**视觉叙事心理学**", "**黄金 3 秒钩子**", "**爆款视觉隐喻**", "**卡点与节奏留白**", "Casually Explained"),
    ("**支持环境**", "**视频模型**", "**剪辑软件**", "Antigravity", "DaVinci Resolve"),
    ("6 幕式模块化架构", "第 1、2、4、5、6 镜头的音频和素材完全保留", "节省 80% 的返工剪辑时间"),
)
for number, (answer, phrases) in enumerate(zip(faq_answers, required_copy), 1):
    for phrase in phrases:
        assert phrase in answer, (number, phrase)
assert [len(re.findall(r"^- ", answer, re.M)) for answer in faq_answers] == [0, 0, 2, 0, 2, 3, 3, 0], "Keep the supplied FAQ bullet structure"
assert faq.count("<!-- readme:platforms -->") == 1 and "<!-- readme:platforms -->" in faq_answers[3], "Keep the internal platform marker between Q4 and Q5"
assert "**10 分钟及以上**" in cn and "连续故事短剧" in cn
assert "Codex、Claude Code" in cn and "Google Flow" in cn
assert "两种工作流都可以从一个初步话题、一个网页链接或一份完整脚本开始。" in mode_comparison
assert "画幅（9:16、16:9、1:1）、旁白语言与配音均可自由选择。" in mode_comparison
assert "💡 **快速配置说明**：" in mode_comparison and not re.search(r"^>", mode_comparison, re.M)
assert "给出话题或需求，直接拿成片" in mode_comparison
assert "给出话题、内容或需求 → 确认视频脚本 → 确认 20 秒有声样片 → 自动制作整片 → 拿到完整视频" in cn
autopilot_start = cn.split('<a id="autopilot-start"></a>', 1)[1].split('<a id="style-gallery"></a>', 1)[0]
autopilot_example = autopilot_start.split("```text\n", 1)[1].split("```", 1)[0]
assert autopilot_example.startswith("使用全自动模式/B模式，"), "Explicitly select mode B in the reusable Autopilot example"
for requirement in ("话题、文章、帖子、新闻或具体需求", "做成在 YouTube 上有吸引力的视频", "粘贴内容或链接，也可以直接描述宣传需求", "需求：5～10 分钟", "B1「极简手绘风」", "旁白、字幕和音效", "20 秒有声样片", "画面跟随配音节奏", "交付完整视频文件"):
    assert requirement in autopilot_start, requirement
assert "Node.js" not in autopilot_start and "FFmpeg" not in autopilot_start
assert "开始前按所选方案配置" not in autopilot_start, "Let the installed AI assistant guide setup rather than prescribe a separate manual setup step"
autopilot_notes = autopilot_start.split("**流程：", 1)[1].split("**", 1)[1]
for requirement in ("AI 助手会根据内容设计分镜", "配好字幕和音效", "按配音节奏合成为完整视频",
                    "你主要负责确认脚本和样片", "首次使用会先检查所需配置",
                    "只调整对应片段，保留已经确认的部分"):
    assert requirement in autopilot_notes, requirement
for label in ("A1：经典黑白风", "A2：现代潮酷风", "A3：史前洞穴风",
              "A4：治愈故事风", "A5：历史卡通风", "A6：暖金暗影风", "A7：待更新…", "B1：极简手绘风", "B2：待更新…"):
    assert f"### {label}\n" in cn, label
hero = cn.split('<table width="100%">', 1)[1].split("</table>", 1)[0]
style_names = ("经典黑白风", "现代潮酷风", "史前洞穴风", "治愈故事风", "历史卡通风", "暖金暗影风")
b_style_names = [name for name in re.findall(r"^### B\d+：([^\n]+)$", cn, re.M)
                 if not name.startswith("待更新")]
assert re.findall(r"<strong>([^<]+)</strong><br>", hero) == list(style_names[:5]) + b_style_names + list(style_names[5:]), "Preserve gallery order while adding A6 after the existing B1 card"
assert "<strong>极简手绘风</strong><br>" in hero, "Use the approved B1 preview in the sixth cell"
assert re.findall(r'<a href="#([^"]+)"><img', hero)[:4] == ["a1", "a2", "a3", "a4"], "Link the first four previews directly to their style details"
assert f"**{len(style_names) + len(b_style_names)} 大画风 · {len(style_names) + 2 + len(b_style_names)} 种视觉方案 · 实测样片 · 免费开源**" in cn
assert re.search(r'<a href="#b1"><img src="([^"]+/b1-minimal-handdrawn\.gif)"[^>]+width="90%"></a>', hero), "Use B1 example 1 in the top gallery and keep its detail-section link"
for number, name in enumerate(style_names, 1):
    assert f"### A{number}：{name}\n" in cn, "Keep preview and detail names aligned"
assert "史前黑色幽默" not in cn and "史前手绘 / 黑色幽默" not in cn
assert "采用 A3「史前洞穴风」" in director_example
assert "按需确认人物三视图" in director_start, "Keep character references optional for ordinary A use"
assert "三视图（正面、侧面、背面）" not in director_start, "Do not move the removed FAQ's detailed guidance into the quick-start"
for variant in ("A1.1", "A1.2", "A2.1", "A2.2"):
    assert variant in cn, variant

assert '<a id="storyboard-example"></a>' not in cn, "Do not restore the removed storyboard example"
assert "看看一个 30 秒故事的完整分镜" not in cn

assert cn.count("<details>") == cn.count("</details>")
assert cn.count('<div align="center">') == cn.count("</div>")
assert cn.count("<table") == cn.count("</table>")
assert cn.count("<td ") == cn.count("</td>")
ids = re.findall(r'<a id="([^"]+)"></a>', cn)
assert len(ids) == len(set(ids)), "Duplicate explicit anchors"
for anchor in re.findall(r'\]\(#([^)]+)\)|href="#([^"]+)"', cn):
    assert next(part for part in anchor if part) in ids, anchor
for link in re.findall(r"\]\(([^)]+)\)", cn):
    if "://" not in link and not link.startswith("#"):
        assert (root / link.split("#")[0]).is_file(), link

previews = sorted(set(re.findall(r'src="https://cdn\.jsdelivr\.net/gh/kaomei/stickman-video-director@[0-9a-f]{40}/(assets/readme/previews/[^" ]+\.gif)"', cn)))
assert len(previews) == 15, "Keep all existing lightweight A/B previews plus both pinned A6 previews"
for a6_name in ("flow", "mcp"):
    assert f"assets/readme/previews/style-6-amber-noir-{a6_name}.gif" in previews
for preview in previews:
    file = root / preview
    header = file.read_bytes()[:10]
    assert header[:6] in (b"GIF87a", b"GIF89a")
    width, height = struct.unpack("<HH", header[6:10])
    assert width <= 640 and height <= 360
    assert file.stat().st_size < 4_000_000
b1 = cn.split('<a id="b1"></a>', 1)[1].split('<a id="b2"></a>', 1)[0]
assert "点击动图，查看或下载有声样片。" in b1, "Make voiced samples discoverable without restoring a redundant link row"
assert re.search(r'src="([^"]+/b1-minimal-handdrawn\.gif)"', hero).group(1) == re.search(r'src="([^"]+/b1-minimal-handdrawn\.gif)"', b1).group(1), "Reuse the immutable B1 example 1 preview in the top gallery"
fields = ("- **画面特点**：", "- **适合内容**：", "- **怎么选**：")
assert all(b1.count(field) == 1 for field in fields), "Use the same introduction fields as A styles"
assert [b1.index(field) for field in fields] == sorted(b1.index(field) for field in fields)
table = re.search(r'<table width="100%">(.*?)</table>', b1, re.S).group(1)
rows = re.findall(r"<tr>(.*?)</tr>", table, re.S)
assert len(rows) == 3, "Keep two B1 short cases with a heading, preview and caption row"
assert re.findall(r'<th width="50%" align="center">(.*?)</th>', rows[0]) == [
    "案例 1：不露脸做 YouTube", "案例 2：为什么没人看？"
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
