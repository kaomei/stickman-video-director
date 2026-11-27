"""Render the bundled chat charts from the style list and thumbnails with Pillow."""

import argparse
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


def wrap(draw, paragraph, font, width):
    # Keep Latin words together while allowing line breaks between CJK characters.
    tokens = re.findall(r"[\x00-\x7f]+?(?:\s+|(?=[^\x00-\x7f]|$))|[^\x00-\x7f]", paragraph)
    lines = [""]
    for token in tokens:
        candidate = lines[-1] + token
        if lines[-1] and draw.textlength(candidate, font=font) > width:
            lines.append(token.lstrip())
        else:
            lines[-1] = candidate
    return "\n".join(line.rstrip() for line in lines)


def render(rows, language, regular_font, bold_font, destination):
    width, header, divider = 940, 50, 194
    ink, muted, border = "#1f2328", "#404953", "#d0d7de"
    x = divider + 20
    fit_label = "适合题材  " if language == "zh-CN" else "Good for  "
    measure = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    layout = []
    for style, name, blurb, topics in rows:
        lines = []
        for paragraph in (blurb, fit_label + topics):
            wrapped = wrap(measure, paragraph, regular_font, width - x - 20)
            _, y0, _, y1 = measure.multiline_textbbox((0, 0), wrapped, font=regular_font, spacing=4)
            lines.append((wrapped, y0, y1 - y0))
        content_height = 36 + lines[0][2] + lines[1][2]
        layout.append((f"{style}  {name}", lines, content_height, max(116, content_height + 28)))

    height = header + sum(row[-1] for row in layout) + 1
    chart = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(chart)
    draw.rectangle((0, 0, width, header), fill="#f0f3f6")
    headings = ("预览", "画风") if language == "zh-CN" else ("Preview", "Style")
    for label_x, label in zip((16, x), headings):
        draw.text((label_x, header // 2), label, font=bold_font, fill=ink, anchor="lm")

    top = header
    for index, (title, lines, content_height, row_height) in enumerate(layout):
        if index % 2:
            draw.rectangle((0, top, width, top + row_height), fill="#f6f8fa")
        draw.line((0, top, width, top), fill=border)
        style = rows[index][0].lower()
        with Image.open(destination.parent / f"{style}.jpg") as source:
            preview = ImageOps.fit(source.convert("RGB"), (162, 91), Image.Resampling.LANCZOS)
        chart.paste(preview, (16, top + (row_height - preview.height) // 2))
        title_y = top + (row_height - content_height) // 2
        draw.text((x, title_y), title, font=bold_font, fill=ink, anchor="lt")
        line_y = title_y + 30
        for (line, offset, line_height), color in zip(lines, (muted, ink)):
            draw.multiline_text((x, line_y - offset), line, font=regular_font, fill=color, spacing=4)
            line_y += line_height + 6
        top += row_height

    draw.line((divider, 0, divider, height), fill=border)
    draw.rectangle((0, 0, width - 1, height - 1), outline=border)
    chart.save(destination, quality=91, optimize=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--regular-font", required=True, help="A font file supporting English and Simplified Chinese")
    parser.add_argument("--bold-font", required=True, help="A bold font file supporting English and Simplified Chinese")
    args = parser.parse_args()
    regular_font = ImageFont.truetype(args.regular_font, 23)
    bold_font = ImageFont.truetype(args.bold_font, 25)
    skill = Path(__file__).resolve().parents[1] / "skills/directing-stickman-videos"
    picker = (skill / "references/style-selection.md").read_text(encoding="utf-8")
    choices = re.findall(r"^\| ([AB]\d+)" + r" \| ([^|]+)" * 6 + r" \|$", picker, re.M)
    if not choices:
        raise ValueError("No style rows found in style-selection.md")
    for engine in ("A", "B"):
        items = [row for row in choices if row[0].startswith(engine)]
        for language, title, description, topics in (("en", 1, 3, 5), ("zh-CN", 2, 4, 6)):
            rows = [(row[0], row[title].strip(), row[description].strip(), row[topics].strip()) for row in items]
            destination = skill / "assets/style-previews" / f"{engine.lower()}.{language}.jpg"
            render(rows, language, regular_font, bold_font, destination)


if __name__ == "__main__":
    main()
