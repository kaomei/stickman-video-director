#!/usr/bin/env python3
"""Check A6 reference routing and provenance text; no live/media behavior claim."""
from pathlib import Path
import importlib.util
import re

root = Path(__file__).resolve().parents[1]
skill = root / "skills/directing-stickman-videos"
entry = (skill / "SKILL.md").read_text()
guide = (skill / "references/getting-started.md").read_text()
reference = skill / "references/amber-noir.md"
a6 = reference.read_text()

assert "(references/amber-noir.md)" in entry
assert "when selected, before planning" in entry
assert "bypass the A1–A5 contract below" in entry
assert "apply only to A1–A5, not to A6 or any B style" in entry
assert "(amber-noir.md)" in guide
welcome = guide.split("### 欢迎使用火柴人视频 Skill\n", 1)[1].split(
    "### Adapt instead of replaying the README", 1
)[0]
assert "Renoise" not in welcome and "Veo 3.1 Fast" not in welcome

for text in (
    "Explain only after selection",
    "Google Flow · Veo 3.1 Fast · 720p · up to 8 seconds per clip",
    "historical test provenance",
    "Route 1 · Flow browser (recommended)",
    "Route 2 · Renoise MCP (explicit choice)",
    "not permission to submit a generation",
    "not a proven mouth-stability fix",
    "independent Gemini Puck narration",
    "a6-finishing.md",
    "large uppercase outlined captions",
    "No creator watermark by default",
    "https://renoise.ai/mcp?utm_source=crazykaomei-aini-202610&utm_medium=xcom",
    "login-only Flow project URL is not a usable public media reference",
    "MCP installation alone is not proof",
    "do not split mechanically by word count",
    "at least four clips", "at least eight",
    "Do not repaint, mask, replace the mouth",
    "Do not promise that every Codex/Claude environment has browser control",
    "No upload/publication follows automatically",
):
    assert text in a6, text
assert not re.search(r"/Users/|/home/|70847984-|task:366834", a6)
contract = skill / "references/a6-reference-prompts.md"
for document in (reference, contract, skill / "assets/a6/SOURCE-NOTES.md"):
    content = document.read_text()
    assert not re.search(r"/Users/|/home/", content), document
    for target in re.findall(r"\]\(([^)]+)\)", content):
        if not target.startswith(("https://", "http://", "#")):
            assert (document.parent / target.split("#", 1)[0]).is_file(), target
for required in ("reference-manifest.json", "a6-reference-prompts.md", "a6_reference_check.py",
                 "Before claiming that references are missing", "not a visual-quality verdict"):
    assert required in a6, required
spec = importlib.util.spec_from_file_location("a6_reference_check", skill / "scripts/a6_reference_check.py")
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)
assert len(checker.validate_pack(skill)) >= 3
for fixture in ("night-library", "coastal-station"):
    checker.validate_plan(skill, skill / ("tests/fixtures/a6-" + fixture + ".plan.json"))
for readme in root.glob("README*.md"):
    assert "Route 2 · Renoise MCP (explicit choice)" not in readme.read_text()
    assert "utm_source=crazykaomei-aini-202610" not in readme.read_text()

finishing = (skill / "references/a6-finishing.md").read_text()
for text in ("Gemini TTS · Puck", "curious, exploratory", "ALL CAPS",
             "pure white", "No `@CrazyKaomei`", "a6_finish.py",
             "not a command to reprocess approved audio"):
    assert text in finishing, text
assert (skill / "scripts/a6_finish.py").is_file()

print("A6 routing, Flow provenance, separate finishing, bundled references and expanded prompt fixtures: PASS")
print("Static instruction checks only; no browser, paid generation or fresh media test performed.")
