#!/usr/bin/env python3
"""Check onboarding wiring and package integrity, not model behavior."""
import hashlib
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
skill = root / "skills/directing-stickman-videos"
entry = (skill / "SKILL.md").read_text()
guide = skill / "references/getting-started.md"
guide_text = guide.read_text()

# The new shared entry must reach the guide in the installed package.
assert "(references/getting-started.md)" in entry and guide.is_file()
for source in (skill / "SKILL.md", guide):
    for target in re.findall(r"\]\(([^)]+\.md)(?:#[^)]*)?\)", source.read_text()):
        if not target.startswith(("https://", "http://")):
            assert (source.parent / target).is_file(), f"Broken reference: {source}: {target}"

# Normalize only the exact owner-directed A5 baseline summary; preserve every other
# Director byte and the original baseline digest.
legacy = "## A · Director\n" + entry.split("## A · Director\n", 1)[1]
original_a5 = "  - `Style 5 (Historical Cartoon / 历史卡通风)`: white-filled round heads, simple black oval eyes and thin black stick limbs in era-specific costume, with cel shading and full-color painterly historical settings"
revised_a5 = "  - `Style 5 (Historical Cartoon / 历史卡通风)`: white heads with connected short white necks, expressive faces, black stick limbs and compact fingerless palms, period dress and cel-shaded historical settings"
assert legacy.count(revised_a5) == 1, "Missing exact owner-directed A5 baseline summary"
legacy = legacy.replace(revised_a5, original_a5, 1)
assert hashlib.sha256(legacy.encode()).hexdigest() == "f710612be73c952fb130d891b0650388ec5ae89469cae95eda8e147eec18b73e"
# A6 adds only a selection-time reference router; legacy Director stays frozen.
assert len(entry.encode()) <= 15000, "Keep the new workflow detail in references"
frontmatter = entry.split("---\n", 2)[1]
name = re.search(r"^name: (.+)$", frontmatter, re.M).group(1)
description = json.loads(re.search(r"^description: (.+)$", frontmatter, re.M).group(1))
assert name == "directing-stickman-videos" and description

# The UI starter invokes that same Skill; it is not a new mode/package.
interface = dict(re.findall(r"^  (\w+): (.+)$", (skill / "agents/openai.yaml").read_text(), re.M))
assert f"${name}" in json.loads(interface["default_prompt"])
assert json.loads(interface["display_name"]) == "Stickman Video Director"
entries = [p for p in root.rglob("SKILL.md")
           if not {"node_modules", ".git"}.intersection(p.relative_to(root).parts)]
assert entries == [skill / "SKILL.md"], "Do not add a second discoverable Skill"
scripts = json.loads((skill / "package.json").read_text())["scripts"]
assert not {"preinstall", "install", "postinstall"}.intersection(scripts), "Welcome is not an install-time executable hook"

# Installation instructions ask the installing assistant to load the real entry.
cn = (root / "README.zh-CN.md").read_text()
catalog_base = "https://github.com/kaomei/stickman-video-director/blob/main/README.zh-CN.md"
public_links = set(re.findall(r"\]\((https://[^)]+)\)", guide.read_text()))
for catalog in ("a-styles", "b-styles"):
    assert f"{catalog_base}#{catalog}" in public_links, f"Missing public style catalog: {catalog}"
    assert f'<a id="{catalog}"></a>' in cn, f"Broken public style anchor: {catalog}"

# Localize the destination, not just the label; all published editions now have
# complete catalogs. This checks the instruction data, not live model behavior.
catalog_routing = guide_text.split("### Choose the public catalog language\n", 1)[1].split("Adapt this Chinese example", 1)[0]
catalog_rows = re.findall(r"^\| ([a-z]{2}) \| [^|]+ \| \[(README\.[^\]]+\.md)\]\((https://[^)]+)\) \|$", catalog_routing, re.M)
expected_catalogs = {"en": "README.en.md", "zh": "README.zh-CN.md", "ja": "README.ja.md",
                     "ko": "README.ko.md", "fr": "README.fr.md", "pt": "README.pt-BR.md",
                     "tr": "README.tr.md", "id": "README.id.md"}
assert len(catalog_rows) == len(expected_catalogs)
assert {language: filename for language, filename, _ in catalog_rows} == expected_catalogs
for language, filename, url in catalog_rows:
    assert url == f"https://github.com/kaomei/stickman-video-director/blob/main/{filename}", language
    readme = (root / filename).read_text()
    for catalog in ("a-styles", "b-styles"):
        assert f'<a id="{catalog}"></a>' in readme, (language, catalog)
for requirement in ("en-GB", "fr-CA", "pt-PT", "Do not use the host locale instead of a clear conversation language",
                    "An explicit request to view a particular README edition", "For an unsupported language",
                    "use `README.en.md`", "do not copy its destinations unchanged into other languages"):
    assert requirement in catalog_routing, requirement
for catalog in ("a-styles", "b-styles"):
    assert f"https://github.com/kaomei/stickman-video-director/blob/main/README.en.md#{catalog}" in public_links
assert "catalogs currently live in the Chinese README" not in guide_text
install = cn.split("```text\n", 1)[1].split("```", 1)[0]
assert "https://github.com/kaomei/stickman-video-director" in install
assert "已安装的 SKILL.md" in install
assert (root / "tests/scenarios/first-use-guidance.md").is_file()

# Chinese-facing welcome uses Chinese mode names, not internal routing labels.
welcome = guide_text.split("### 欢迎使用火柴人视频 Skill\n", 1)[1].split("### Adapt instead of replaying the README", 1)[0]
assert "#### A · 导演模式：" in welcome and "#### B · 全自动模式：" in welcome
assert not re.search(r"\b(?:Director|Autopilot)\b|自动成片", welcome)
assert "A 模式的旁白和声音设计沿用原有规则" in welcome
assert "稳定男声默认" not in welcome, "Do not misstate A's source-appropriate voice selection"

# Optional A references remain reachable without any additional Director changes.
reference_heading = "Optional A character references"
assert reference_heading in entry
a_reference = guide_text.split(f"### {reference_heading}\n", 1)[1].split("## B · Autopilot handoffs", 1)[0]
for requirement in ("not a new setup requirement", "front, side and back views",
                    "Reuse suitable user-approved references", "every generated clip",
                    "when the chosen tool supports reference images", "not a consistency guarantee",
                    "not replace, shorten or globally rewrite", "fixed character anchor"):
    assert requirement in a_reference, requirement
assert "按需确认人物三视图" in welcome and "三视图（正面、侧面、背面）" in welcome

# A5 recommends references proactively, while preserving a non-blocking text route.
assert "A5 proactive character guidance" in entry
a5_reference = guide_text.split("### A5 proactive character guidance\n", 1)[1].split("## B · Autopilot handoffs", 1)[0]
for requirement in ("before planning", "even if the user has not asked", "正面、侧面、背面",
                    "每段视频", "完整分镜提示词一起提交", "not a new mandatory setup",
                    "prefers text-only", "do not repeatedly ask", "Reuse suitable approved",
                    "additional image input", "not a replacement", "first-frame image",
                    "not claim guaranteed identity", "missing hair and disconnected heads"):
    assert requirement in a5_reference, requirement
for requirement in ("建议你先自行生成", "advice only", "Do not bundle or supply reference images",
                    "automatically generate them", "only when the user explicitly requests",
                    "name specific files only when actually supplied"):
    assert requirement in a5_reference, requirement

# Per-style defaults stay inside one installation; B1 is not all of B.
autopilot = (skill / "references/autopilot.md").read_text()
b1 = (skill / "references/b1-minimal-handdrawn.md").read_text()
priority = "explicit user choice → selected B-style default → B common fallback"
assert priority in autopilot and priority in guide.read_text()
assert "visuals, captions, voice, pacing and SFX" in entry
assert "caption font/size/placement" in autopilot
assert "B1 defaults, not requirements for other B styles" in b1
assert "Google Gemini **Bodi**" in b1 and "original **Sadaltager** recording" in b1
assert "without added style/direction instructions" in b1
print("First-use wiring, proactive A5 reference guidance and single-Skill identity passed; other Director bytes preserved.")
print("Independent B-style settings, defaults precedence and unchanged demo-voice policy passed.")
print("Eight-language catalog destinations, shared anchors and English fallback instruction checks passed.")
print("Static checks only; fresh-host conversational acceptance remains a separate test.")
