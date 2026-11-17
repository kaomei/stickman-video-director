#!/usr/bin/env python3
"""Style 5 routing and source-anchor regression; not a provider quality score."""
from pathlib import Path
import hashlib
import re

root = Path(__file__).resolve().parents[1]
skill = root / "skills/directing-stickman-videos"
ref = (skill / "references/historical-cartoon.md").read_text()
anchor = ref.split("```text\n", 1)[1].split("```", 1)[0]
# Exact CHARACTER/FACE/PALMS/EXPOSED LIMBS from the owner-selected prompt.
# Fingerprint verifies source preservation, not reliable generated anatomy.
assert hashlib.sha256(anchor.encode()).hexdigest() == "f7f8161688c3c17a4379eaf5e4d64d7c0888f7e4b94ef59b7beb3dcafc785a8e"
for token in (
    "https://github.com/leksautomate", "/pull/41",
    "repeat its **full description**", "two visible non-color differences",
    "no style-specific character-count cap", "voice-continuity.md",
    "default when no other voice is requested", "opening/action/ending states",
    "Backgrounds are full-color", "do not rewrite Styles 1–4",
    "black mitten-palm design with integrated thumb lobe and wrist-to-sleeve attachment",
    "not sleeves or footwear", "Grips, releases and gestures may change pose",
    "This clarification is A5-only",
    "compact black mitten palms and continuous wrist attachment during walking, grips, releases and empty-hand gestures",
    "no individual fingers, finger separations, white fills or gloves",
    "contact or overlap between the palm and the prop",
    "without spreading fingers",
    "NO INDIVIDUAL FINGERS, NO FINGER SEPARATIONS, NO WHITE HANDS OR GLOVES",
    "not frozen poses or permanently clenched fists",
    "Earlier round-tip or exposed-neck tests do not validate this revised silhouette",
    "short, sturdy white neck", "one continuous filled silhouette",
    "about one tenth of the head diameter", "roughly four head-heights tall",
    "character-specific eyebrows, nose and mouth", "18% of head diameter long and 10% wide",
    "stickman animated video", "smaller than half an eye's height",
    "On A5 selection", "front/side/back", "every clip in a supporting tool",
    "Users can knowingly choose text-only", "not evidence of reliable text-only generation",
    "rather than offering that advice only when asked", "only list specific reference files when the user actually supplies them",
    "generate their own front/side/back", "This is advice only",
    "do not supply or automatically generate reference images",
    "This connection rule is A5-only",
    "continuous white jaw–short-neck–garment connection and any beard/collar overlap",
    "A background-colored gap fails",
    "The owner reference defines the target, not cross-clip stability",
    "not overall stability passes",
):
    assert token in ref, token
for obsolete in (
    "Small white-filled, black-outlined cartoon hands attach naturally",
    "Hands are small simplified white-filled shapes",
    "small white-filled black-outlined hands connected at the wrists",
    "with minimal finger strokes or curved grips",
    "A few short finger strokes can indicate an open hand",
    "A short thin black neck line connects the base of each head to the neckline",
    "with the same thin black line treatment as the exposed limbs",
    "A short white-filled, black-outlined neck smoothly connects the base of each head to the neckline",
    "Show a clearly visible short white neck",
    "one-eighth of the head diameter",
    "must not conceal the entire white connection",
    "Do not use a black stick neck, fuse the head into the shoulders or lengthen the neck",
    "mark the neck check failed or unverified rather than passed",
    "The head joins the clothed body naturally at the neckline; no separately visible neck is required.",
    "Hands are small solid black round or oval tips",
    "NO THUMBS",
    "The base of the head may meet or overlap the garment neckline directly",
    "a short collar connection or fully concealed neck is acceptable",
    "No separate neck is exposed", "no nose, and thin black stick limbs",
    "The lower edge of the white round head physically touches",
    "about 1.5-2 wrist-stroke widths", "Keep palm length below one sixth",
    "Reference images remain optional when requested and supported",
):
    assert obsolete not in ref, f"Obsolete A5 anatomy instruction: {obsolete}"
for filename in (
    "SKILL.md", "references/style-catalog.md",
    "references/storyboard-template.md", "references/omni-flash-prompt-contract.md",
):
    assert "historical-cartoon.md" in (skill / filename).read_text(), filename

for filename in (
    "references/a1-a5-direction.md", "references/style-catalog.md", "references/omni-flash-prompt-contract.md",
):
    text = (skill / filename).read_text()
    a5_line = next(line for line in text.splitlines() if "Style 5" in line)
    if filename == "references/a1-a5-direction.md":
        assert "compact fingerless palms" in a5_line, filename
        assert "connected short white necks" in a5_line, filename
    else:
        assert "small solid black mitten-shaped palms continuous with the wrists" in a5_line, filename
        assert "one subtle integrated thumb lobe, no individual fingers, finger separations, white fills or gloves" in a5_line, filename
        assert "connected short white necks" in a5_line, filename
    assert "white-filled black-outlined cartoon hands" not in a5_line, filename

# Freeze the original visual grammar and voice anchors while allowing the
# shared workflow/timing/audio orchestration around them to evolve.
baseline = {
    "prehistoric-dark-comedy.md": "2400be588156a9ca4c600ca4e0ccca7695429521c7242b82d92821d3f0ae8969",
    "cozy-storytelling.md": "32cbec9f8e2cc232da74017c916af41d60d38c0b3b47aec133030e78500a8901",
    "voice-continuity.md": "1767a3eb3853603f1a2fc38c4cb7d2f1590e636e8ef3b26ffe8ce4e7391f19fa",
}
for filename, fingerprint in baseline.items():
    text = (skill / "references" / filename).read_text()
    if filename == "prehistoric-dark-comedy.md":
        frozen = text.split("## Story and timing", 1)[0]
    else:
        blocks = re.findall(r"```[^\n]*\n(.*?)```", text, re.S)
        assert blocks, filename
        frozen = "\n".join(blocks)
    assert hashlib.sha256(frozen.encode()).hexdigest() == fingerprint, filename
print("Style 5 source anchor, routing and preserved specialist visual/voice anchors passed.")
