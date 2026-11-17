#!/usr/bin/env python3
"""Freeze approved A drawing, character, voice and historical example content.

The 2026-11-16 unified workflow intentionally replaces the old timing, model,
delivery and permission instructions. Whole workflow/file hashes would reject
those authorized changes. These hashes instead come from explicitly bounded
visual/voice blocks in the pre-migration snapshot, not the rewritten workflow.
This checks instruction preservation, not generated visual/audio quality.
"""
import argparse
import hashlib
import re
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--scope", choices=("integrated", "a", "published"), default="published",
                    help="Package scope (visual/history preservation is identical in both scopes).")
parser.add_argument("--repo", type=Path, help="Repository to inspect (defaults to this script's repository).")
args = parser.parse_args()
root = (args.repo or Path(__file__).resolve().parents[1]).resolve()
skill = root / "skills/directing-stickman-videos"
references = skill / "references"


def section(text, heading):
    """Include one named heading through the next same/higher-level heading."""
    matches = list(re.finditer(r"^" + re.escape(heading) + r"\n", text, re.M))
    assert len(matches) == 1, f"Expected one section: {heading}"
    start = matches[0].start()
    remainder = text[matches[0].end():]
    level = len(heading) - len(heading.lstrip("#"))
    following = re.search(r"^#{1," + str(level) + r"} ", remainder, re.M)
    end = matches[0].end() + following.start() if following else len(text)
    return text[start:end]


def bounded(text, start, end):
    """Use exact content markers where a section also contains revised timing."""
    assert text.count(start) == 1 and text.count(end) == 1, (start, end)
    begin, finish = text.index(start), text.index(end)
    assert begin < finish, f"Reordered preservation boundaries: {start}"
    return text[begin:finish]


def frozen(label, text, digest):
    assert hashlib.sha256(text.encode()).hexdigest() == digest, f"Approved A content changed: {label}"


# Fixed visual/cast sections and reusable voice choice copied verbatim from the
# before snapshot. Authorized timing/audio assembly changes are tested by the
# workflow regression, not pinned to superseded whole-document fingerprints.
sections = {
    "style-catalog.md": {
        "## 2. Style 1: Classic Minimalist": "37d6137eac3272550250426f450034a57aa771d45c68c848c023600dc436a999",
        "### Character DNA Anchors (Anti-Deformation Lock)": "27debae2e35b933a21f5b31ea035e886bd9ed06ce557091d32bf2e0089211c94",
        "### Sub-Style 2B: Cinematic Story (彩色故事风)": "c7ebb1ab9d9a7eddc2e9e0aeccea0bca9bb804ff0d16a0212061d9123fe1d1ae",
        "## 5. Style 5: Historical Cartoon (历史卡通风)": "6a5b3f6dfdd4470a89b57ce165fcf802c5e6f34eb879fef073fc0680305a2239",
    },
    "prehistoric-dark-comedy.md": {
        "## Fixed style, variable cast": "7a0aeeac78e9ed4c74d4b0079a807a17224ea818f0bab23b3225047c6394f0f6",
        "## Translate topics into concrete prehistoric situations": "f570da375ad2459478650202df6626a3b067009544e9ab2425005323ec7c0848",
    },
    "cozy-storytelling.md": {
        "## Visual identity": "d0fa60f01debc1bc735544814a42583bf5aee50dcd069f34640f32a6460bea84",
        "## Character design belongs to the story": "f69eb784589e503ae0179a8b294b049e73db45915b12d5d07778dfd6da7e6c72",
        "## Separate design, position and state": "07ad1e9bada2209d4f37ebaf0a057258105716ab651f2beb5ac8478f6d8ab04a",
    },
    "voice-continuity.md": {
        "## Choose once in Phase A": "036f5bb87323ddac80280d1b675230790609aa02b1b61c313c86c5b1b4c1064a",
    },
    "omni-flash-prompt-contract.md": {
        "## Style language": "7a771e39c6985806a500c18436653cb849f66b7500a12c3dc610caa932c72b57",
        "## Palette notation": "38cfac4161f1296b66cd058a0e2b16c8051b08cea2855d33c15a207db26cacf4",
    },
    "examples.md": {
        "## English VO transcript": "69570c72fec98962f64cadf1874731cec4f753d06cc6fd5cbf9e83e4ee0b3beb",
    },
}
for name, headings in sections.items():
    text = (references / name).read_text()
    for heading, digest in headings.items():
        frozen(f"{name}: {heading}", section(text, heading), digest)

# Preserve the complete 2A scene/negative/physical-motion material, stopping at
# the exact Pacing bullet whose fixed ten-second requirement was superseded.
catalog = (references / "style-catalog.md").read_text()
frozen("2A scene, negatives and physical motion", bounded(
    catalog, "### Sub-Style 2A: Modern Studio Tech (极简科技风)\n", "- **Pacing**:"),
    "05d1ac8483eaea78af60b0603b8ea92f034e0fec6d93835493bc05ed42747f74")

# The entry's A1–A5 content moved into a reference. Freeze its surviving anatomy,
# palette, scene/continuity instructions and full Zeke identity independently of
# the new setup/workflow prose and the relocated relative reference path.
direction = (references / "a1-a5-direction.md").read_text()
frozen("A1 anatomy and palette moved from entry", bounded(
    direction, "Keep two arms and two legs,", "- For Style 2 (Modern Beanie Zeke)"),
    "eb2fd7c44a1c03d120c57bf8d76e58376c0e9c14fa67972b0de0e4570041d040")
frozen("A2 scenes and A4 continuity moved from entry", bounded(
    direction, "- For Style 2A (Modern Studio Tech),", "- For all styles, avoid abstract liquid/shape morphing."),
    "f5dbb5c088b48f1f4fa1bc6d6be5df781ba2638788c86d9ec3b57bba0753fe30")
anchors = re.findall(r"`(A minimalist 2D animated stick figure wearing a bright red beanie[^`]+)`", direction)
assert len(anchors) == 1, "Keep one complete, unshortened Zeke identity anchor"
frozen("Zeke full identity anchor moved from entry", anchors[0],
       "891af6912a5711304943476efd1cb6c5187e5be4415f29512dbeb147d696ba78")

# All nine historical example prompt/continuity blocks stay byte-identical,
# including their sample-specific models, ten-second beats, voice and dialogue.
# Introductory text now labels those settings as historical examples.
examples = (references / "examples.md").read_text()
blocks = re.findall(r"^```text\n.*?^```\n?", examples, re.M | re.S)
assert len(blocks) == 9, "Do not omit or add historical example prompt blocks"
frozen("nine historical example text blocks", "\n".join(blocks),
       "fa9452093ef87a829171d1f8a128c072957d7f4e78eb6f438019bb816814059b")

# A5's source-local timing and independent audio are intentionally migrated.
# Its approved rich-face, short-white-neck, contact-mitten drawing and era/cast
# sections retain the published fingerprints; historical sample prompts above
# retain their exact old timings, voices and dialogue as historical evidence.
a5 = (references / "historical-cartoon.md").read_text()
for heading, digest in {
    "## Fixed drawing grammar": "00a5e8a6f5a1d8c7cb37ce7454a52f48a30fac164af64e44d4958138d8a98c59",
    "## Phase A: era and cast": "8393b9afe9ac504a2765bb88a9dd70df948aa810e7de946d182027e4e1c07db5",
}.items():
    frozen(f"A5: {heading}", section(a5, heading), digest)

# Freeze Omni's visual negatives independently of its one authorized audio
# bullet: speech may now be native only when explicitly selected. A narrowly
# removed audio bullet must not hide changes to anatomy, scene or text locks.
omni = (references / "omni-flash-prompt-contract.md").read_text()
visual_negatives, removed = re.subn(
    r"^- altered, omitted, repeated, reordered, or added dialogue[^\n]*\n",
    "", section(omni, "## Negative contract"), flags=re.M)
assert removed == 1, "Keep one explicit native/external speech negative contract"
frozen("Omni visual negatives excluding migrated speech policy", visual_negatives,
       "abdc979a7e5aa8afd5e49c5f76f134e9db8d53ce56e8ae3b9cceb46dac6f1450")

# Native voice examples remain usable verbatim, with historical/native scope.
# Do not confuse retaining an example with requiring it in external-VO footage.
native_voice = """```text
One off-screen adult male narrator throughout. General American accent, warm clean baritone, medium-low pitch, gentle chest resonance, no raspiness or breathiness. Calm conversational delivery, restrained pitch variation, steady speaking pace, and close, dry studio sound. Keep the same vocal timbre, register, accent, pace, and recording quality throughout. Emotional progression belongs to the visuals and music; do not change the narrator's voice or switch to character dialogue.
```"""
voice = (references / "voice-continuity.md").read_text()
assert native_voice in catalog and native_voice in voice, "Preserve the reusable complete native voice example"
assert "a-audio-timeline-and-review.md" in catalog and "not the current assembly instructions" in catalog
print(f"[{args.scope}] Frozen A1–A5 drawing, character, native voice examples and historical samples preserved.")
print("Authorized timing/audio policy changes are covered by verify-a-mode-workflow.py; no live quality guarantee is implied.")
