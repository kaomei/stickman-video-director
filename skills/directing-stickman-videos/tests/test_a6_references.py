"""Offline regression tests for the missing-reference/unexpanded-prompt defect."""
import copy
import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("a6_check", ROOT / "scripts/a6_reference_check.py")
check = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check)


class A6References(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="a6-reference-test-")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        shutil.copytree(ROOT / "assets/a6", self.root / "assets/a6")
        self.plan = check.read_json(ROOT / "tests/fixtures/a6-night-library.plan.json")
        self.plan_path = self.root / "plan.json"

    def save_plan(self):
        self.plan_path.write_text(json.dumps(self.plan), encoding="utf-8")
        return self.plan_path

    def update_manifest(self, edit):
        path = self.root / "assets/a6/reference-manifest.json"
        value = check.read_json(path)
        edit(value)
        path.write_text(json.dumps(value), encoding="utf-8")

    def fails_plan(self, pattern):
        with self.assertRaisesRegex(check.CheckError, pattern):
            check.validate_plan(self.root, self.save_plan())

    def test_bundled_references_are_real_and_have_provenance(self):
        self.assertEqual(len(check.validate_pack(ROOT)), 3)

    def test_both_unrelated_fixture_stories_pass(self):
        for name in ("night-library", "coastal-station"):
            prompts = check.validate_plan(ROOT, ROOT / ("tests/fixtures/a6-" + name + ".plan.json"))
            self.assertGreaterEqual(len(prompts), 2)
            for _, prompt in prompts:
                self.assertNotIn("[STYLE LOCK]", prompt)

    def test_new_stories_do_not_inherit_sample_wardrobe(self):
        for name, wardrobe in (("night-library", "teal"), ("coastal-station", "navy")):
            plan = check.read_json(ROOT / ("tests/fixtures/a6-" + name + ".plan.json"))
            cast = " ".join(i["image_prompt"]["cast"] for i in plan["images"]).lower()
            self.assertIn(wardrobe, cast)
            self.assertNotIn("orange", cast)
            self.assertNotIn("hoodie", cast)
            self.assertTrue(all(r["role"] == "style" for i in plan["images"] for r in i["reference_inputs"]))

    def test_missing_pack_blocks_original_failure(self):
        shutil.rmtree(self.root / "assets/a6")
        with self.assertRaises(check.CheckError):
            check.validate_pack(self.root)

    def test_deleted_image_blocks(self):
        (self.root / "assets/a6/apartment-style-example.png").unlink()
        with self.assertRaisesRegex(check.CheckError, "Missing"):
            check.validate_pack(self.root)

    def test_tampered_file_blocks(self):
        path = self.root / "assets/a6/cafe-face-and-light.jpg"
        path.write_bytes(path.read_bytes() + b"tampered")
        with self.assertRaisesRegex(check.CheckError, "SHA-256 mismatch"):
            check.validate_pack(self.root)

    def test_wrong_dimensions_block(self):
        self.update_manifest(lambda d: d["assets"][0].update(width=1))
        with self.assertRaisesRegex(check.CheckError, "Dimension mismatch"):
            check.validate_pack(self.root)

    def test_missing_provenance_blocks(self):
        self.update_manifest(lambda d: d["assets"][0].pop("provenance"))
        with self.assertRaisesRegex(check.CheckError, "Missing provenance"):
            check.validate_pack(self.root)

    def test_invalid_image_bytes_block(self):
        path = self.root / "fake.png"
        path.write_text("not an image")
        with self.assertRaisesRegex(check.CheckError, "PNG/JPEG"):
            check.image_info(path)

    def test_placeholder_variants_block(self):
        original = copy.deepcopy(self.plan)
        for token in ("[STYLE LOCK]", "[CAST_LOCK]", "[WORLD-LOCK]", "{{style}}", "${cast}",
                      "<insert style>", "same as above", "same character", "use previous prompt", "TBD"):
            with self.subTest(token=token):
                self.plan = copy.deepcopy(original)
                self.plan["images"][0]["image_prompt"]["style"] = token
                self.fails_plan("Unexpanded placeholder")

    def test_placeholder_in_motion_blocks(self):
        self.plan["images"][0]["motion_prompt"] = "Animate [CAST LOCK]"
        self.fails_plan("Unexpanded placeholder")

    def test_empty_prompt_section_blocks(self):
        for field in check.FIELDS:
            with self.subTest(field=field):
                saved = self.plan["images"][0]["image_prompt"].pop(field)
                self.fails_plan("Empty prompt field")
                self.plan["images"][0]["image_prompt"][field] = saved

    def test_missing_reference_input_blocks(self):
        self.plan["images"][0]["reference_inputs"] = []
        self.fails_plan("No reference inputs")

    def test_fabricated_package_asset_blocks(self):
        self.plan["images"][0]["reference_inputs"][0]["asset_id"] = "invented-upload-id"
        self.fails_plan("Unknown package reference")

    def test_sample_identity_requires_explicit_choice(self):
        self.plan["images"][0]["reference_inputs"][0]["role"] = "identity"
        self.fails_plan("not explicitly chosen")
        self.plan["reuse_sample_identity"] = True
        check.validate_plan(self.root, self.save_plan())

    def test_sample_image_not_automatic_story_first_frame(self):
        self.plan["images"][0]["reference_inputs"][0]["role"] = "first_frame"
        self.fails_plan("not a new-story first frame")

    def test_current_project_reference_must_exist(self):
        self.plan["images"][0]["reference_inputs"].append({
            "source": "project", "path": "missing-cast.png", "role": "identity"})
        self.fails_plan("Missing/unsafe resource")

    def test_actual_project_image_and_hash_pass(self):
        source = self.root / "assets/a6/apartment-style-example.png"
        shutil.copyfile(source, self.root / "cast.png")
        _, digest = check.image_info(source)
        self.plan["images"][0]["reference_inputs"].append({
            "source": "project", "path": "cast.png", "role": "identity", "sha256": digest})
        check.validate_plan(self.root, self.save_plan())
        self.plan["images"][0]["reference_inputs"][-1]["sha256"] = "0" * 64
        self.fails_plan("Project reference hash mismatch")

    def test_unsafe_and_symlink_paths_block(self):
        for path in ("../outside.png", "/tmp/absolute.png", "https://invalid/image.png", "C:\\file.png"):
            with self.subTest(path=path), self.assertRaises(check.CheckError):
                check.local_file(self.root, path)
        with tempfile.TemporaryDirectory(prefix="a6-outside-") as outside:
            external = Path(outside) / "secret.png"
            external.write_bytes(b"not image")
            (self.root / "escape.png").symlink_to(external)
            with self.assertRaises(check.CheckError):
                check.local_file(self.root, "escape.png")

    def test_duplicate_ids_and_empty_plan_block(self):
        self.plan["images"].append(copy.deepcopy(self.plan["images"][0]))
        self.fails_plan("duplicate image ID")
        self.plan["images"] = []
        self.fails_plan("No planned images")


if __name__ == "__main__":
    unittest.main()
