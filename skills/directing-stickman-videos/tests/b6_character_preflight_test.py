"""Early diagnostics preserve the real package/alpha/pose validation rules."""
from pathlib import Path
import importlib.util
import json
import shutil
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / filename)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


runtime = load('b6_preflight_test_runtime', 'b6_puppet.py')
preflight = load('b6_preflight_test_helper', 'b6_character_preflight.py')


class CharacterPreflight(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        shutil.copytree(ROOT / 'assets/b6/characters/kiosk_keeper', self.base / 'cast/keeper')
        self.project = {'version': 1, 'character_system': {'schema': 'b6-character-system/1', 'mode': 'painted-puppet', 'registry': 'characters.json'}}
        self.registry = {'schema': 'b6-character-registry/1', 'actors': [{'id': 'keeper', 'package': 'cast/keeper', 'views': ['front']}], 'rigid_cast': []}
        (self.base / 'project.json').write_text(json.dumps(self.project))
        self.write_registry()

    def write_registry(self):
        (self.base / 'characters.json').write_text(json.dumps(self.registry))

    def report(self, **kwargs):
        return preflight.preflight_project(self.base, runtime, **kwargs)

    def change_package(self, change):
        path = self.base / 'cast/keeper/package.json'
        doc = json.loads(path.read_text())
        change(doc)
        path.write_text(json.dumps(doc))

    def test_valid_import_has_actual_pixel_evidence_and_no_creative_pass(self):
        result = self.report(required_views={'keeper': ['front']})
        self.assertTrue(result['technical_pass'], result['errors'])
        view = result['actors'][0]['views'][0]
        self.assertEqual(view['pose_probes'], 25)
        self.assertEqual(view['baseline_alpha_render']['arm_records'], 2)
        self.assertEqual(view['baseline_alpha_render']['leg_records'], 2)
        self.assertEqual(len(view['baseline_alpha_render']['beauty_sha256']), 64)
        self.assertTrue(result['scene_and_final_review_required'])
        self.assertGreater(view['relative_arm_ink_width']['left'], 0)

    def test_planned_view_requires_registered_drawn_view(self):
        result = self.report(required_views={'keeper': ['back']})
        self.assertFalse(result['technical_pass'])
        self.assertIn('Planned view is not registered: back', result['errors'][0]['problem'])

    def test_unpainted_registered_view_rejected(self):
        self.registry['actors'][0]['views'].append('back')
        self.write_registry()
        result = self.report()
        self.assertFalse(result['technical_pass'])
        self.assertIn('no painted package definition: back', result['errors'][0]['problem'])

    def test_missing_planned_actor_is_not_silently_ignored(self):
        result = self.report(required_views={'visitor': ['front']})
        self.assertFalse(result['technical_pass'])
        self.assertEqual(result['errors'][0]['actor'], 'visitor')

    def test_art_hash_drift_is_not_relabelled_as_a_valid_import(self):
        body = self.base / 'cast/keeper/front/body.png'
        body.write_bytes(body.read_bytes() + b'changed')
        result = self.report()
        self.assertFalse(result['technical_pass'])
        self.assertIn('art hash mismatch', result['errors'][0]['problem'])

    def test_socket_outside_actual_cuff_paint_is_rejected(self):
        self.change_package(lambda doc: doc['views']['front']['arms']['left'].update(socket=[900, 900]))
        result = self.report()
        self.assertFalse(result['technical_pass'])
        self.assertIn('cuff', result['errors'][0]['problem'])

    def test_missing_neck_mount_cannot_pass_version_two(self):
        self.project['version'] = 2
        result = self.report(project=self.project)
        self.assertFalse(result['technical_pass'])
        self.assertIn('neck_attachment', result['errors'][0]['problem'])

    def test_broken_painted_neck_is_reported_by_runtime(self):
        def change(doc):
            doc['binding_version'] = 2
            for view in doc['views'].values():
                view['neck_attachment'] = {'mount_polygon': [[800,800],[820,800],[820,820],[800,820]], 'min_overlap_fraction': .7, 'min_overlap_thickness': 2}
        self.change_package(change)
        result = self.report()
        self.assertFalse(result['technical_pass'])
        self.assertIn('neck mount', result['errors'][0]['problem'])

    def test_continuous_single_stroke_is_permitted_without_forced_joint_drawing(self):
        def change(doc):
            for view in doc['views'].values():
                for arm in view['arms'].values():
                    arm['ink_path'] = {'mode': 'continuous', 'sag': 0}
        self.change_package(change)
        result = self.report()
        self.assertTrue(result['technical_pass'], result['errors'])
        self.assertEqual(result['actors'][0]['views'][0]['arm_ink_modes']['left'], 'continuous')

    def test_package_path_cannot_escape_project(self):
        self.registry['actors'][0]['package'] = '../outside'
        self.write_registry()
        result = self.report()
        self.assertFalse(result['technical_pass'])
        self.assertIn('escapes', result['errors'][0]['problem'])


if __name__ == '__main__':
    unittest.main()
