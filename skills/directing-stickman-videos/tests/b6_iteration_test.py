"""Draft projection and conservative change-scope behavior."""
from dataclasses import FrozenInstanceError
from pathlib import Path
from types import SimpleNamespace
import hashlib
import importlib.util
import json
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'scripts' / file)
    result = importlib.util.module_from_spec(spec)
    sys.modules[name] = result
    spec.loader.exec_module(result)
    return result


iteration = load('b6_iteration_test_runtime', 'b6_iteration.py')
space = load('b6_iteration_test_space', 'b6_space.py')


def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()


def fingerprint(inputs):
    return digest(json.dumps(inputs, sort_keys=True))


class Viewport(unittest.TestCase):
    def test_native_and_draft_keep_same_world_and_camera_projection(self):
        native = space.Camera(720, 1280, 1700, x=34, y=-520, z=180, principal_y=240)
        for scale in (.5, .75, 1):
            view = iteration.RenderViewport.from_plan({'width': 720, 'height': 1280}, scale)
            camera = view.camera(native)
            self.assertEqual((camera.x, camera.y, camera.z, camera.near), (34, -520, 180, 1))
            for world in [(100, -350, 1300), (-180, 0, 1600)]:
                a, b = native.project(world), camera.project(world)
                self.assertAlmostEqual(b[0], a[0] * scale)
                self.assertAlmostEqual(b[1], a[1] * scale)
                self.assertEqual(b[2], a[2])
            self.assertEqual(view.native_size, (720, 1280))
            self.assertEqual(view.size, (int(720 * scale), int(1280 * scale)))
            self.assertEqual(view.pixel(4), 4 * scale)

    def test_screen_matrix_scales_screen_not_local_geometry(self):
        native = space.Camera(720, 1280, 1700, principal_y=240)
        matrix = native.billboard_matrix((70, 0, 1300), .65, 8)
        view = iteration.RenderViewport.from_plan({'width': 720, 'height': 1280}, .5)
        a = view.screen_matrix(matrix)
        b = view.camera(native).billboard_matrix((70, 0, 1300), .65, 8)
        for row_a, row_b in zip(a, b):
            for x, y in zip(row_a, row_b):
                self.assertAlmostEqual(x, y)
        with self.assertRaises(ValueError):
            view.camera(view.camera(native))

    def test_invalid_scaling_and_mutation_are_refused(self):
        for width, height, scale in [(720, 1280, .4), (722, 1280, .5), (720, 1282, .75), (True, 1280, 1)]:
            with self.assertRaises(ValueError):
                iteration.RenderViewport.from_plan({'width': width, 'height': height}, scale)
        view = iteration.RenderViewport.from_plan({'width': 720, 'height': 1280})
        with self.assertRaises(FrozenInstanceError):
            view.scale = .5


class Worklist(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.before = {'scene.py': digest('code'), 'art/a.png': digest('a'), 'art/b.png': digest('b')}
        self.context = SimpleNamespace(base=self.base, ratio='9:16', project={'duration': 10},
            inputs=dict(self.before), fingerprint=fingerprint(self.before),
            plan={'shots': [
                {'id': 'a', 'start': 0, 'end': 3, 'asset_inputs': ['art/a.png']},
                {'id': 'b', 'start': 3, 'end': 6, 'asset_inputs': ['art/b.png']},
                {'id': 'c', 'start': 6, 'end': 10, 'asset_inputs': ['art/a.png']}]})
        self.report = self.base / 'report.json'
        self.baseline = {'kind': 'preview', 'ratio': '9:16', 'inputs': self.before,
                         'fingerprint': fingerprint(self.before)}
        self.write()

    def write(self):
        self.report.write_text(json.dumps(self.baseline))

    def change(self, key, value):
        self.context.inputs[key] = digest(value)
        self.context.fingerprint = fingerprint(self.context.inputs)

    def plan(self):
        return iteration.iteration_plan(self.context, 'report.json')

    def test_raster_change_returns_declared_shots_with_cut_neighbors(self):
        self.change('art/b.png', 'new b')
        result = self.plan()
        self.assertEqual(result['scope'], 'declared_raster_dependencies')
        self.assertEqual(result['recommended_ranges'], [{'start': 3 - 2 / 30, 'end': 6 + 2 / 30}])
        self.assertFalse(result['inherited_review_credit'])
        self.assertTrue(result['final_native_preview_required'])
        self.assertFalse(result['delivery_ready'])

    def test_multiple_uses_and_touching_ranges_are_merged(self):
        self.change('art/a.png', 'new a')
        self.assertEqual(len(self.plan()['recommended_ranges']), 2)
        self.change('art/b.png', 'new b')
        self.assertEqual(self.plan()['recommended_ranges'], [{'start': 0., 'end': 10.}])

    def test_code_audio_captions_config_and_unscoped_art_require_full(self):
        for key in ('scene.py', 'audio.wav', 'captions.json', 'formats/portrait.json', 'unscoped.png'):
            with self.subTest(key=key):
                self.context.inputs = dict(self.before)
                self.change(key, 'changed')
                self.assertEqual(self.plan()['recommended_ranges'], [{'start': 0., 'end': 10.}])
                self.assertEqual(self.plan()['scope'], 'full')

    def test_no_change_does_not_infer_approval(self):
        result = self.plan()
        self.assertEqual(result['recommended_ranges'], [])
        self.assertFalse(result['inherited_review_credit'])
        self.assertIn('No new review', result['reason'])

    def test_legacy_baseline_without_inventory_is_conservative(self):
        del self.baseline['inputs']
        self.write()
        result = self.plan()
        self.assertEqual(result['recommended_ranges'], [{'start': 0., 'end': 10.}])
        self.assertIsNone(result['changed_inputs'])

    def test_stale_fingerprints_wrong_ratio_and_report_kind_rejected(self):
        for field, value in [('fingerprint', digest('wrong')), ('ratio', '16:9'), ('kind', 'iteration-plan')]:
            with self.subTest(field=field):
                old = self.baseline[field]
                self.baseline[field] = value
                self.write()
                with self.assertRaises(ValueError):
                    self.plan()
                self.baseline[field] = old
        self.write()
        self.context.fingerprint = digest('stale current')
        with self.assertRaises(ValueError):
            self.plan()

    def test_changed_baseline_media_and_escaping_paths_rejected(self):
        video = self.base / 'preview.mp4'
        video.write_bytes(b'original')
        self.baseline.update(video='preview.mp4', video_sha256=digest('original'))
        self.write()
        self.plan()
        video.write_bytes(b'replaced')
        with self.assertRaises(ValueError):
            self.plan()
        self.baseline.pop('video')
        self.baseline.pop('video_sha256')
        self.baseline['inputs'] = {'../escape.png': digest('bad')}
        self.baseline['fingerprint'] = fingerprint(self.baseline['inputs'])
        self.write()
        with self.assertRaises(ValueError):
            self.plan()
        with self.assertRaises(ValueError):
            iteration.iteration_plan(self.context, '../report.json')

    def test_draft_can_inform_worklist_but_cannot_earn_review_credit(self):
        self.baseline['kind'] = 'draft'
        self.write()
        self.change('art/b.png', 'new')
        result = self.plan()
        self.assertFalse(result['delivery_ready'])
        self.assertFalse(result['inherited_review_credit'])
        self.assertEqual(result['final_review_required'], 'all_35_subchecks_and_full_original_speed_av')


if __name__ == '__main__':
    unittest.main()
