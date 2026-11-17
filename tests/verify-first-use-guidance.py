#!/usr/bin/env python3
"""Check onboarding wiring and package integrity, not model behavior."""
import argparse
import json
import re
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--scope", choices=("integrated", "a", "published"), default="published",
                    help="Use a only for the A-only candidate; default checks the integrated repository.")
parser.add_argument("--repo", type=Path, help="Repository to inspect (defaults to this script's repository).")
args = parser.parse_args()
root = (args.repo or Path(__file__).resolve().parents[1]).resolve()
skill = root / "skills/directing-stickman-videos"
entry = (skill / "SKILL.md").read_text()
guide = skill / "references/getting-started.md"
guide_text = guide.read_text()


def section(text, heading):
    """Bound a Markdown section by its real heading, not a former mode name."""
    match = re.search(rf"^{re.escape(heading)}\s*$", text, re.M)
    assert match, f"Missing section: {heading}"
    level = len(heading) - len(heading.lstrip("#"))
    following = re.search(rf"^#{{1,{level}}} ", text[match.end():], re.M)
    end = match.end() + following.start() if following else len(text)
    return text[match.end():end]


# The entry must reach onboarding and the selected A production contracts in
# one install. Drawing/voice byte preservation is checked by the separate
# bounded contracts in verify-ab-preservation.py, not an obsolete whole-A hash.
assert "(references/getting-started.md)" in entry and guide.is_file()
direction = skill / "references/a1-a5-direction.md"
direction_text = direction.read_text()
boundaries = skill / "references/mode-execution-boundaries.md"
production = skill / "references/a-production-and-review.md"
a_routes = (direction, boundaries, production,
            skill / "references/amber-noir.md",
            skill / "references/rubber-hose.md",
            skill / "references/a7-prompt-contract.md",
            skill / "references/a7-acceptance.md")
for source in (skill / "SKILL.md", guide, *a_routes):
    assert source.is_file(), f"Missing installed A contract: {source}"
    for target in re.findall(r"\]\(([^)#]+\.(?:md|json))(?:#[^)]*)?\)", source.read_text()):
        if not target.startswith(("https://", "http://")):
            linked = source.parent / target
            assert linked.is_file(), f"Broken reference: {source}: {target}"
            if linked.suffix == ".json":
                json.loads(linked.read_text())

# Routing changes must not collapse A1–A7 into one style or import B's renderer.
for target in ("a1-a5-direction.md", "amber-noir.md", "rubber-hose.md",
               "a7-prompt-contract.md", "a7-acceptance.md"):
    assert f"(references/{target})" in entry, f"Missing A style route: {target}"
for source in (entry, guide_text, direction_text):
    assert "(references/mode-execution-boundaries.md#a-unified-workflow)" in source or \
        "(mode-execution-boundaries.md#a-unified-workflow)" in source
    assert "(references/a-production-and-review.md)" in source or \
        "(a-production-and-review.md)" in source
assert "## A unified workflow" in boundaries.read_text()
assert "A1 maps to Style 1 light/dark, A2 to Style 2/2A/2B, A3–A5 to Styles 3–5" in entry
assert "bypass the A1–A5 direction reference" in entry
assert "Bypass A1–A5 rules and B renderers" in entry
for style in ("Style 1 (Classic Minimalist)", "Style 2 (Modern Beanie Zeke)",
              "Style 2A (Modern Studio Tech)", "Style 2B (Cinematic Story)",
              "Style 3 (Prehistoric Hand-Drawn / Dark Comedy)",
              "Style 4 (Cozy Storytelling / 治愈故事风)"):
    assert style in direction_text, f"Missing A visual identity: {style}"
revised_a5 = "  - `Style 5 (Historical Cartoon / 历史卡通风)`: white heads with connected short white necks, expressive faces, black stick limbs and compact fingerless palms, period dress and cel-shaded historical settings"
assert direction_text.count(revised_a5) == 1, "Missing owner-directed A5 baseline summary"
for anchor in ("one current pose per limb", "a moving arm replaces its previous pose rather than adding another arm",
               "bright red beanie (smooth rounded knit, no pom-pom) and a yellow t-shirt"):
    assert anchor in direction_text, f"Missing A character anchor: {anchor}"
assert (root / "tests/verify-ab-preservation.py").is_file()
for target in ("assets/a7/reference-manifest.json", "assets/a7/validated-workflow.json"):
    assert f"({target})" in entry, f"Missing A7 approved material route: {target}"

# Detailed workflow remains in references so the installed entry stays compact.
assert len(entry.encode()) <= 20000, "Keep the new workflow detail in references"
assert "(references/mode-execution-boundaries.md)" in entry and boundaries.is_file()
assert "Before planning" in entry
assert "Published B choices are B1, B2, B3, B4, B5 and B6" in guide_text
assert "scripts/character-explainer.mjs" in guide_text
assert "B1–B4 use the bundled manifest runtime" in guide_text
assert "not an accepted `style: B4` CLI value" not in guide_text
assert "B4 and B5 remain local development only" not in guide_text
assert "Only B1 is currently available" not in guide_text
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
assert "安装成功后读取 SKILL.md" in install
assert (root / "tests/scenarios/first-use-guidance.md").is_file()

# Chinese-facing welcome uses the approved bilingual names, not retired labels.
welcome = guide_text.split("### 欢迎使用火柴人视频 Skill\n", 1)[1].split("### Adapt instead of replaying the README", 1)[0]
assert "#### A · Model Engine（模型引擎）：" in welcome
if args.scope in ("a", "published"):
    # A-only overlays retain the released B welcome verbatim. Do not require an
    # unrelated B naming migration merely to verify the authorized A workflow.
    assert any(heading in welcome for heading in (
        "#### B · Code Engine（代码引擎）：",
        "#### B · 全自动模式：确认样片后，自动做完整视频"))
    active_welcome = welcome.split("#### B", 1)[0]
else:
    assert "#### B · Code Engine（代码引擎）：" in welcome
    active_welcome = welcome
assert not re.search(r"\b(?:Director|Autopilot)\b|自动成片", active_welcome)
assert "A 模式的旁白和声音设计沿用原有规则" in welcome
assert "稳定男声默认" not in welcome, "Do not misstate A's source-appropriate voice selection"

# The unified A handoff distinguishes source generation from the final edit,
# protects prompt-only use, and keeps tests/paid production within authorization.
a_handoff = section(guide_text, "## A · Model Engine（模型引擎） handoffs")
stages = re.findall(r"^\| (Brief|Proposal|Prompt package|Optional trial|Full production) \|", a_handoff, re.M)
assert stages == ["Brief", "Proposal", "Prompt package", "Optional trial", "Full production"]
for requirement in ("All A1–A7 styles follow", "sample lyrics remain optional",
                    "Do not ask users to choose a delivery route upfront",
                    "Do not round it to a fixed clip multiple",
                    "topic approval is not storyboard approval",
                    "complete independent source-generation prompts",
                    "One source can supply several edited shots",
                    "valid complete handoff for self-generation",
                    "do not silently spend credits or require login to receive prompts",
                    "Google Flow in the built-in browser", "actual selected model",
                    "lowest supported available resolution", "estimated consumption",
                    "run only within its authorization", "Show the actual preview",
                    "do not make every scene repeat a still-frame and low-resolution test gate",
                    "total credit cap including repairs", "Reuse valid existing approvals",
                    "deliver the video, local preview and folder", "No per-shot reminders",
                    "preserving the requested final runtime", "project checkpoint",
                    "Limit ineffective retries", "inspect actual acting/camera/sound",
                    "repair only affected ranges and joins",
                    "Explicitly user-confirmed samples are reusable baselines"):
    assert requirement in a_handoff, f"Missing A onboarding boundary: {requirement}"

# Optional A references remain reachable without changing fixed style anchors.
reference_heading = "Optional A character references"
assert reference_heading in entry
a_reference = section(guide_text, f"### {reference_heading}")
for requirement in ("not a new setup requirement", "front, side and back views",
                    "Reuse suitable user-approved references", "every generated clip",
                    "when the chosen tool supports reference images", "not a consistency guarantee",
                    "not replace, shorten or globally rewrite", "fixed character anchor"):
    assert requirement in a_reference, requirement
assert "三视图（正面、侧面、背面）" in welcome
assert "已有确认的角色参考图可直接复用" in welcome and "不需要定制时可跳过" in welcome

# A5 recommends references proactively, while preserving a non-blocking text route.
assert "A5 proactive character guidance" in entry
a5_reference = section(guide_text, "### A5 proactive character guidance")
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
priority = "explicit user choice → selected B-style contract → available configured route"
assert priority in autopilot and priority in guide.read_text()
assert "visuals, captions, voice, pacing and SFX" in entry
assert "caption font/size/placement" in autopilot
assert "B1 is separate from all A-style generation prompts and other B styles" in b1
assert "Google Gemini **Bodi**" in b1 and "Google Gemini **Sadaltager**" in b1
assert "Voice reference only" in b1 and "rather than requiring Gemini" in b1
assert "native rate and default treatment" in b1
assert "showcase voices are references, not mandatory providers or voices" in guide_text
print("Unified A onboarding, A1–A7 style routes, reference/package integrity and single-Skill identity passed.")
print("Prompt-only delivery, authorized Flow trial, runtime/edit mapping, recovery and scoped repair guidance passed.")
print("Optional A references and proactive, non-blocking A5 guidance passed; visual/voice byte protection remains in verify-ab-preservation.py.")
print("Independent B-style settings, defaults precedence and unchanged demo-voice policy passed.")
print("Eight-language catalog destinations, shared anchors and English fallback instruction checks passed.")
print("Static checks only; fresh-host conversational acceptance remains a separate test.")
