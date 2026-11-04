#!/usr/bin/env python3
"""Offline A6 resource/prompt preflight. No provider calls or aesthetic verdict."""
import argparse
import hashlib
import json
import re
import struct
import sys
from pathlib import Path, PurePosixPath


class CheckError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise CheckError(message)


def read_json(path):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise CheckError("Cannot read JSON {}: {}".format(path, exc)) from exc


def local_file(root, relative):
    require(isinstance(relative, str) and bool(relative.strip()), "Missing relative file path")
    rel = PurePosixPath(relative)
    require(not rel.is_absolute() and ".." not in rel.parts and "\\" not in relative
            and ":" not in relative, "Unsafe relative path: " + relative)
    base = Path(root).resolve()
    target = (base / relative).resolve()
    require(base in target.parents and target.is_file(), "Missing/unsafe resource: " + relative)
    return target


def image_info(path):
    """Read PNG/JPEG dimensions without optional libraries; not a full decode."""
    try:
        data = Path(path).read_bytes()
    except OSError as exc:
        raise CheckError("Unreadable image: " + str(path)) from exc
    if data[:8] == b"\x89PNG\r\n\x1a\n" and len(data) >= 33:
        require(data[8:16] == b"\x00\x00\x00\rIHDR", "Invalid PNG header: " + str(path))
        size = struct.unpack(">II", data[16:24])
    elif data[:2] == b"\xff\xd8":
        size = None
        index = 2
        sof = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
        while index < len(data):
            require(data[index] == 0xFF, "Invalid JPEG marker: " + str(path))
            while index < len(data) and data[index] == 0xFF:
                index += 1
            require(index < len(data), "Truncated JPEG: " + str(path))
            marker = data[index]
            index += 1
            if marker in {0xD9, 0xDA}:
                break
            if marker in {0x01, *range(0xD0, 0xD8)}:
                continue
            require(index + 2 <= len(data), "Truncated JPEG segment: " + str(path))
            length = int.from_bytes(data[index:index + 2], "big")
            require(length >= 2 and index + length <= len(data), "Invalid JPEG length: " + str(path))
            if marker in sof:
                require(length >= 8, "Invalid JPEG size: " + str(path))
                height, width = struct.unpack(">HH", data[index + 3:index + 7])
                size = (width, height)
                break
            index += length
        require(size is not None, "No JPEG dimensions: " + str(path))
    else:
        raise CheckError("Not a readable PNG/JPEG header: " + str(path))
    require(min(size) > 0, "Invalid image dimensions: " + str(path))
    return size, hashlib.sha256(data).hexdigest()


def validate_pack(root):
    manifest = read_json(local_file(root, "assets/a6/reference-manifest.json"))
    require(isinstance(manifest, dict) and manifest.get("schema") == "a6-reference-pack-v1",
            "Unsupported A6 manifest")
    assets = manifest.get("assets")
    require(isinstance(assets, list) and len(assets) >= 1, "No A6 reference assets")
    found = {}
    paths = set()
    for asset in assets:
        require(isinstance(asset, dict), "Invalid reference asset")
        key = asset.get("id")
        require(isinstance(key, str) and key and key not in found, "Missing/duplicate asset ID")
        path = asset.get("path")
        require(isinstance(path, str) and path.startswith("assets/a6/"), "A6 asset outside assets/a6")
        require(path not in paths, "Duplicate A6 asset path")
        size, digest = image_info(local_file(root, path))
        require(digest == asset.get("sha256"), "SHA-256 mismatch: " + path)
        require(list(size) == [asset.get("width"), asset.get("height")], "Dimension mismatch: " + path)
        require(isinstance(asset.get("uses"), list) and "style" in asset["uses"], "Missing style use: " + key)
        for field in ("provenance", "acceptance"):
            require(isinstance(asset.get(field), str) and asset[field].strip(), "Missing " + field + ": " + key)
        found[key] = asset
        paths.add(path)
    return found


PLACEHOLDER = re.compile(
    r"\[[^\]\n]*(?:style|cast|world|character|scene)[ _-]*lock[^\]\n]*\]"
    r"|\{\{[^}\n]+\}\}|\$\{[^}\n]+\}"
    r"|<\s*(?:style|cast|world|character|scene|insert|prompt)\b[^>]*>"
    r"|\b(?:TBD|TODO|same\s+as\s+(?:above|before)|same\s+character|use\s+(?:the\s+)?previous\s+prompt)\b",
    re.IGNORECASE,
)
FIELDS = ("style", "cast", "world", "composition", "constraints")


def full_text(value, label):
    require(isinstance(value, str) and bool(value.strip()), "Empty prompt field: " + label)
    match = PLACEHOLDER.search(value)
    require(match is None, "Unexpanded placeholder in " + label + ": " + (match.group(0) if match else ""))


def validate_plan(root, plan_path, project_root=None):
    assets = validate_pack(root)
    plan = read_json(plan_path)
    require(isinstance(plan, dict) and plan.get("schema") == "a6-reference-plan-v1", "Unsupported plan schema")
    images = plan.get("images")
    require(isinstance(images, list) and len(images) > 0, "No planned images")
    base = Path(project_root) if project_root else Path(plan_path).resolve().parent
    ids = set()
    expanded = []
    for item in images:
        require(isinstance(item, dict), "Invalid planned image")
        key = item.get("id")
        require(isinstance(key, str) and key.strip() and key not in ids, "Missing/duplicate image ID")
        ids.add(key)
        require(item.get("purpose") in {"character_reference", "environment_reference", "shot_first_frame"},
                "Invalid image purpose: " + key)
        prompt = item.get("image_prompt")
        require(isinstance(prompt, dict), "Missing complete image_prompt: " + key)
        for field in FIELDS:
            full_text(prompt.get(field), key + "." + field)
        if "motion_prompt" in item:
            full_text(item["motion_prompt"], key + ".motion_prompt")
        refs = item.get("reference_inputs")
        require(isinstance(refs, list) and len(refs) > 0, "No reference inputs: " + key)
        for ref in refs:
            require(isinstance(ref, dict) and ref.get("role") in {"style", "identity", "first_frame"},
                    "Missing/invalid reference role: " + key)
            if ref.get("source") == "package":
                require(ref.get("asset_id") in assets, "Unknown package reference: " + key)
                require(ref["role"] != "first_frame", "Package example is not a new-story first frame: " + key)
                require(ref["role"] != "identity" or plan.get("reuse_sample_identity") is True,
                        "Sample identity was not explicitly chosen: " + key)
            elif ref.get("source") == "project":
                _, digest = image_info(local_file(base, ref.get("path")))
                if "sha256" in ref:
                    require(digest == ref["sha256"], "Project reference hash mismatch: " + key)
            else:
                raise CheckError("Invalid reference source: " + key)
        expanded.append((key, "\n".join(prompt[field].strip() for field in FIELDS)))
    return expanded


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--plan", type=Path)
    parser.add_argument("--project-root", type=Path)
    parser.add_argument("--show-prompts", action="store_true")
    args = parser.parse_args()
    try:
        assets = validate_pack(args.root)
        expanded = validate_plan(args.root, args.plan, args.project_root) if args.plan else []
        print("PASS: {} A6 reference files; {} image prompts checked.".format(len(assets), len(expanded)))
        if args.show_prompts:
            for key, prompt in expanded:
                print("\n" + key + "\n" + prompt)
        print("Offline integrity/structure only; visual quality, tool attachments and generation not verified.")
        return 0
    except (CheckError, OSError) as exc:
        print("FAIL: " + str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
