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
assert "给一个话题、一篇文章或链接，自动制作画面、旁白、字幕、音效与微动画，交付完整火柴人视频。**不出镜，也能做出有辨识度的 YouTube 频道。**" in hero_copy
assert "汇总全网热门的火柴人画风，持续更新与开源——适用于 **知识科普、心理励志、教育宣传、情感治愈、流行故事等多赛道。**" in hero_copy
assert "本系列持续更新，欢迎点个 Star，更多热门画风陆续上线。" in cn
assert "想做不露脸的 YouTube 频道，探索内容变现？" in cn
assert "获取不出镜 YouTube 视频的自动化工作流与实用工具" in cn
assert "我是烤妹儿" not in cn, "Keep the follow CTA focused on reader value, not self-introduction"
readable_cn = re.sub(r'<[^>]+>|\]\([^)]+\)|https?://[^\s<>)"]+', "", cn.replace("# 🎬 Stickman Video Director\n", "", 1))
assert not re.search(r"\b(?:Director|Autopilot)\b", readable_cn, re.I), "Use Chinese mode names throughout the Chinese README; preserve technical paths and anchors"
assert "自动成片" not in readable_cn, "Use 全自动模式 consistently for mode B"
assert not re.search(r"(?<!AI )助手|(?<=[\u4e00-\u9fff])AI 助手", readable_cn), "Use AI 助手 consistently, with spaces between English and Chinese"
assert "### A · 导演模式：逐段生成分镜提示词" in cn
assert "### B · 全自动模式：一句话生成长片" in cn

sections = ("## 两种视频制作模式", "## 开始使用", "## A · 导演模式画风一览",
            "## B · 全自动模式画风一览", "## 常见问题", "## 更多画风，更多创作可能", "## 许可证")
assert [cn.index(s) for s in sections] == sorted(cn.index(s) for s in sections)
assert "## 接下来做什么" not in cn, "Keep the removed next-steps heading out of the footer"
assert "## Star 增长曲线" not in cn, "Use a reader-focused footer heading; retain the chart itself"
footer = cn.split("## 更多画风，更多创作可能", 1)[1].split("## 许可证", 1)[0]
footer_items = ("⭐ **想做不露脸的 YouTube 频道", "🔔 **关注", '<a id="whats-next"></a>',
                "🎨 **更多画风（计划中）**：", "💬 **建议与投稿**：", '<div align="center">')
assert [footer.index(s) for s in footer_items] == sorted(footer.index(s) for s in footer_items), "Place icon-led contribution paragraphs after the follow CTA and before the Star chart"
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
assert "并给出可以直接照着说的示例。" in quick_start_intro
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
assert "[A 画风](#a-styles) · [B 画风](#b-styles)" in cn, "Keep the top style navigation"
navigation = next(line for line in cn.splitlines() if line.startswith("[开始使用](#quick-start)"))
assert navigation.endswith("[常见问题](#faq)"), "Replace only the tutorial shortcut with the FAQ anchor"
assert "[最近更新]" not in navigation, "Keep the removed updates shortcut out of the navigation"
assert '<a id="recent-updates"></a>' not in cn, "Do not restore the removed updates anchor"
assert "## 最近更新" not in cn, "Do not restore the removed updates section"
assert "完整制作教程" not in navigation
assert "[完整制作教程](https://x.com/CrazyKaomei/status/2102311241046008268)" in cn, "Keep the tutorial in the Director instructions"
assert "## 使用小贴士" not in cn
faq = cn.split('<a id="faq"></a>', 1)[1].split('<!-- readme:contribute -->', 1)[0]
faq_questions = (
    "没有脚本，也能做视频吗？",
    "导演模式的画风可以做成全自动吗？为什么要有导演模式？",
    "导演模式生成的人物不一致怎么办？",
    "一定要用 Codex 吗？",
    "怎么把文章或参考内容，变成更有吸引力的视频？",
    "使用需要付费吗？",
    "画面或配音不满意，需要全部重做吗？",
    "做出来的视频可以发 YouTube、用于商业项目吗？",
)
assert re.findall(r"^### Q(\d+)\. (.+)$", faq, re.M) == [
    (str(number), question) for number, question in enumerate(faq_questions, 1)
], "Keep Q1-Q8 visible, with generation costs near the front and the removed FAQs absent"
assert "<details" not in faq and "</details>" not in faq and "<summary" not in faq, "Do not collapse the FAQ answers"
for requirement in ("目标观众、发布平台和期望时长",
                    "不一定包含它的 API 调用额度",
                    "复用已经确认的配音和素材",
                    "第三方图片、音乐、音效及配音服务", "以平台审核为准"):
    assert requirement in faq, requirement
assert "安装好了，接下来做什么？" not in faq, "Remove the redundant post-install FAQ, not the actual onboarding"
assert "不会画画、不会做动画，也能用吗？" not in faq
assert "可以自定义画幅、语言和配音吗？" not in faq
character_faq = faq.split("### Q3.", 1)[1].split("### Q4.", 1)[0]
for requirement in ("符合所选画风的火柴人", "三视图（正面、侧面、背面）",
                    "已有确认的角色参考图可直接复用", "不需要定制时也可跳过",
                    "每段视频时都附上已确认的角色图", "不替代原有分镜提示词",
                    "不改变所选画风的规则", "最终仍需检查各段人物是否一致"):
    assert requirement in character_faq, requirement
engagement_faq = faq.split("### Q5.", 1)[1].split("### Q6.", 1)[0]
for requirement in ("想吸引谁、重点讲什么", "希望观众看完后做什么",
                    "开场钩子、叙事推进和结尾引导", "节奏、表达方式或故事结构",
                    "保留自己的观点与表达", "历史、商业和科学的事实，发布前仍需核查"):
    assert requirement in engagement_faq, requirement
cost_faq = faq.split("### Q2. 导演模式的画风可以做成全自动吗？为什么要有导演模式？", 1)[1].split("### Q3.", 1)[0]
for requirement in ("视频生成和试错成本", "一轮完整生成", "几十美元左右",
                    "逐段生成、检查和手动剪辑", "制作流程相对独立",
                    "让 AI 助手采用喜欢的 A 系列画风", "结合 B 系列的制作流程",
                    "自行 DIY", "掌控每个镜头", "再决定是否继续"):
    assert requirement in cost_faq, requirement
assert "100 美元" not in cost_faq and "还不能直接切换" not in cost_faq
assert len(cost_faq.strip().split("\n\n")) == 2, "Keep the approved concise two-paragraph answer"
assert "**10 分钟及以上**" in cn and "连续故事短剧" in cn
assert "Codex、Claude Code" in cn and "Google Flow" in cn
assert "A、B 画风独立编号、分别展示，不共用画面" in cn
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
              "A4：治愈故事风", "A5：历史卡通风", "B1：极简手绘风", "B2：待更新…"):
    assert f"### {label}\n" in cn, label
hero = cn.split('<table width="100%">', 1)[1].split("</table>", 1)[0]
style_names = ("经典黑白风", "现代潮酷风", "史前洞穴风", "治愈故事风", "历史卡通风")
b_style_names = [name for name in re.findall(r"^### B\d+：([^\n]+)$", cn, re.M)
                 if not name.startswith("待更新")]
assert re.findall(r"<strong>([^<]+)</strong><br>", hero) == list(style_names) + b_style_names, "Sync every published B style into the top preview grid, using its style name without A/B prefixes"
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
assert len(previews) == 13, "Keep all existing lightweight A previews and both B1 short previews"
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
