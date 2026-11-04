#!/usr/bin/env python3
"""Static B common-quality routing/scope checks, not audiovisual acceptance."""
import json
import re
from pathlib import Path

repo = Path(__file__).resolve().parents[1]
skill = repo / "skills/directing-stickman-videos"
refs = skill / "references"
entry = (skill / "SKILL.md").read_text()
autopilot = (refs / "autopilot.md").read_text()
common_path = refs / "autopilot-production-qa.md"
common = common_path.read_text()
b1 = (refs / "b1-minimal-handdrawn.md").read_text()
supplement = (refs / "b1-production-qa.md").read_text()
manifest = json.loads((skill / "assets/b1/approved-production-standard.json").read_text())

# Every B invocation reaches the common gate through its required mode reference.
assert "(references/autopilot.md)" in entry.split("## A · Director", 1)[0]
assert "(autopilot-production-qa.md)" in autopilot
assert "(autopilot-production-qa.md#whole-film-delivery-gate)" in autopilot
assert "before shot planning, sample review and full-film delivery" in autopilot
assert "Style defaults customize expression, not waive this common quality floor" in autopilot
assert "**every B style**" in common and "A does not inherit it" in common

# Protect the explicit quality subjects and the non-shortcut boundaries.
for heading in (
    "Plan from meaning and actual narration",
    "First 30 seconds: picture, sound and copy together",
    "Meaningful motion, not filler",
    "Clear screenshots and content-matched graphics",
    "Natural captions and semantic sound",
    "Whole-film delivery gate",
):
    assert f"## {heading}" in common, f"Missing common gate: {heading}"
for boundary in (
    "propose any needed hook rewrite for approval",
    "approximately 20-second sample gate remains unchanged",
    "principal-picture inactivity longer than 2.5 seconds",
    "not a maximum shot length",
    "Subtitle turnover, whole-frame zoom/pan/fade",
    "Do not repeat compositions to fill time",
    "final encoded frame",
    "actual entity/action",
    "Review every cue boundary against meaning and actual speech pauses",
    "semantic subtitles with at most one visible line at a time",
    "Preserve all spoken words and order",
    "noun phrases, verbs with necessary objects",
    "numbers/units and phrasal verbs",
    "rather than a second line or mechanically smaller/squeezed type",
    "neighboring cues for broken meaning",
    "each cue starts at its own first aligned spoken word",
    "same detail standard throughout the entire film",
    "excluding the subtitle band",
    "validator does not automatically enforce these creative gates",
    "no new paid calls",
):
    assert boundary in common, f"Missing boundary: {boundary}"

# Shared quality is not a B1 voice/background/caption preset or B2 implementation.
for b1_setting in ("Bodi", "Sadaltager", "34px", "#FDFDFC", "60–70%"):
    assert b1_setting not in common, f"B1-specific setting leaked: {b1_setting}"
assert "(autopilot-production-qa.md)" in b1 and "(autopilot-production-qa.md)" in supplement
assert "B1-only visual/audio defaults and accepted examples" in supplement
assert "common quality gates still apply to every B production" in supplement
assert manifest["common_checklist"] == "../../references/autopilot-production-qa.md"
assert "not the independently shared B" in manifest["scope"]["not_inherited_scope"]
runtime = (refs / "autopilot-runtime.md").read_text()
b2 = (refs / "b2-colorful-handdrawn.md").read_text()
assert "accepts `style: B1`, `B2`, `B3` and `B4`" in runtime
assert "## B4 production tracks" in runtime
assert "(b2-colorful-handdrawn.md)" in autopilot
assert "independent local illustration-and-micro-animation style" in b2
assert "Fola" in b2 and "ivory paper label" in b2
assert "B1 `pose` atlas is rejected in B2" in runtime
assert "`style: B3`" in runtime and "## B3 layered artwork" in runtime
b3 = (refs / "b3-television.md").read_text()
assert "(b3-television.md)" in autopilot and "(references/b3-television.md)" in entry
assert "unit tests" in b3.lower() and "not animation quality or acceptance" in b3
assert "currently accepts B1/B2 only" not in b3

# New links stay portable and inside the single installed Skill.
for source in (common_path, refs / "autopilot.md", refs / "b1-production-qa.md", refs / "b2-colorful-handdrawn.md", refs / "b3-television.md"):
    assert "/Users/" not in source.read_text()
    for link in re.findall(r"\]\(([^)]+)\)", source.read_text()):
        if "://" in link:
            continue
        target = (source.parent / link.split("#", 1)[0]).resolve()
        assert target.is_relative_to(skill.resolve()) and target.is_file(), f"Broken/escaping link: {link}"
cases = (repo / "tests/scenarios/b-common-production-quality.md").read_text()
for case_id in ("B-COMMON-01", "B-COMMON-02", "B-COMMON-03", "B-COMMON-04",
                "B-COMMON-05", "B-COMMON-06", "B-COMMON-07", "B-COMMON-08"):
    assert case_id in cases
print("B common gates: required routing, quality boundaries, portable links and independent style settings passed.")
print("Static integrity only: planning decisions and actual picture/sound require separate review; B1/B2 runtime behavior is tested separately.")
