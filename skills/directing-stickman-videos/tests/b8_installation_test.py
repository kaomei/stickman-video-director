"""B8 installation and narrated production regressions; synthetic inputs only."""
import json
import pathlib
import subprocess
import sys
import unittest
import wave
from unittest import mock

import b8_workflow_test as fixtures

flow = fixtures.flow
ROOT = fixtures.ROOT


class InstallationTest(unittest.TestCase):
    def setUp(self):
        fixture = fixtures.WorkflowTest()
        fixture.setUp()
        self.addCleanup(fixture.doCleanups)
        self.fixture = fixture
        self.base, self.plan = fixture.base, fixture.d

    def test_doctor_loads_default_font_and_reports_a_load_failure(self):
        healthy = flow.doctor()
        self.assertTrue(healthy['ok'], healthy)
        self.assertTrue(healthy['checks']['default_caption_font'])
        with mock.patch('PIL.ImageFont.truetype', side_effect=OSError('cannot load font')):
            failed = flow.doctor()
        self.assertFalse(failed['ok'])
        self.assertFalse(failed['checks']['default_caption_font'])
        self.assertFalse(failed['drawing_tool']['generation_called'])

    def test_master_only_requires_complete_captions_without_changing_original_audio(self):
        audio = self.base / 'assets' / 'original-master.wav'
        with wave.open(str(audio), 'wb') as stream:
            stream.setnchannels(1)
            stream.setsampwidth(2)
            stream.setframerate(8000)
            stream.writeframes(b'\0\0' * 16000)
        original = flow.sha(audio)
        self.plan['audio_master'] = {'path': 'assets/original-master.wav', 'sha256': original, 'speed': 1}
        self.assertIsNone(self.plan['narration'])
        errors = flow.validate(self.plan, self.base, True)['errors']
        self.assertTrue(any('audio-master-only' in error for error in errors), errors)
        self.plan['captions'] = [{'start': .1, 'end': 1.9, 'text': 'A warning.'}]
        result = flow.validate(self.plan, self.base, True)
        self.assertTrue(result['ok'], result['errors'])
        self.plan['captions'][0]['text'] = 'warning'
        self.assertTrue(any('complete approved script' in error for error in flow.validate(self.plan, self.base, True)['errors']))
        self.plan['captions'][0]['text'] = 'A warning.'
        self.plan['audio_master']['speed'] = 1.1
        self.assertTrue(any('speed 1' in error for error in flow.validate(self.plan, self.base, True)['errors']))
        self.assertEqual(flow.sha(audio), original)

    def test_b8_cli_dispatches_delivery_without_explicit_style(self):
        destination = self.base.parent / 'handoff'
        proc = subprocess.run(['node', str(ROOT / 'scripts' / 'autopilot.mjs'),
            'deliver', str(self.base), '--output', str(destination)],
            capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        result = json.loads(proc.stdout)
        self.assertEqual(pathlib.Path(result['folder']), destination.resolve())
        self.assertTrue(pathlib.Path(result['index']).is_file())
        self.assertEqual(result['review_status']['user_acceptance'], 'pending')
        self.assertTrue(pathlib.Path(result['runner']).is_file())
        self.assertEqual((destination / 'project' / 'project.json').read_bytes(),
                         (self.base / 'project.json').read_bytes())

    def test_moved_actual_runtime_encodes_and_delivers_preserving_pending_review(self):
        # Artificial coloured markers exercise the execution closure, never
        # anatomy, B8 visual quality, actual listening or real user acceptance.
        self.fixture.approve('proposal')
        self.fixture.approve('keyposes')
        sample = flow.render_project(self.fixture.p, self.plan,
            self.base / 'outputs' / 'synthetic-sample.mp4', 0, .2)
        self.fixture.review_fixture(sample['report'])
        flow.approve(self.fixture.p, self.plan, 'sample', sample['report'],
            'TEST ONLY synthetic sample and expansion', 0, .2, 2)
        original = (self.base / 'project.json').read_bytes()
        moved = self.base.parent / 'relocated'
        self.base.rename(moved)
        runner = moved / 'b8' / 'run.py'
        # Ignore PYTHONPATH while retaining the host's installed user packages.
        proc = subprocess.run([sys.executable, '-E', str(runner), 'render',
            '--output', 'outputs/moved-full.mp4'], cwd=moved.parent,
            capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        render = json.loads(proc.stdout)
        self.assertTrue(pathlib.Path(render['output']).is_file())
        self.assertEqual((moved / 'project.json').read_bytes(), original)
        bundle = moved.parent / 'moved-delivery'
        proc = subprocess.run([sys.executable, '-E', str(runner), 'deliver',
            '--output', str(bundle), '--film', 'outputs/moved-full.mp4',
            '--review', render['report']], cwd=moved.parent,
            capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        result = json.loads(proc.stdout)
        self.assertEqual(result['review_status']['user_acceptance'], 'pending')
        self.assertEqual((bundle / 'project' / 'project.json').read_bytes(), original)
        self.assertEqual(flow.sha(result['film']), flow.sha(render['output']))


if __name__ == '__main__':
    unittest.main()
