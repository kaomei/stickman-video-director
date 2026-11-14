"""Real B6 entry points reject edited helpers before executing their source."""
from pathlib import Path
from contextlib import contextmanager
from unittest.mock import patch
import hashlib
import importlib.util
import json
import os
import py_compile
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    loaded = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(loaded)
    return loaded


class HelperTrust(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix='b6-helper-trust-')
        cls.addClassCleanup(cls.tmp.cleanup)
        cls.base = Path(cls.tmp.name) / 'project'
        subprocess.run(['node', str(ROOT / 'scripts/autopilot.mjs'), 'init', str(cls.base),
                        '--style', 'B6', '--ratio', '16:9'], check=True, capture_output=True)
        subprocess.run([sys.executable, str(ROOT / 'scripts/b6_production_example.py'),
                        str(cls.base)], check=True, capture_output=True)
        cls.runtime = module('b6_helper_trust_runtime', cls.base / 'run.py')
        cls.originals = {name: (cls.base / name).read_bytes()
                         for name in ['caption_renderer.py', 'motion_review.py', 'b6_asset_roles.py']}

    def tearDown(self):
        for name, content in self.originals.items():
            (self.base / name).write_bytes(content)
        shutil.rmtree(self.base / '__pycache__', ignore_errors=True)

    def call(self, command, *args):
        return subprocess.run([sys.executable, str(self.base / 'run.py'), command,
                               str(self.base), '--ratio', '16:9', *args],
                              capture_output=True, text=True)

    @contextmanager
    def edited_helper(self, name):
        helper = self.base / name
        marker = Path(self.tmp.name) / (self.id().split('.')[-1] + '-' + name + '.marker')
        marker.unlink(missing_ok=True)
        helper.write_bytes(('from pathlib import Path\nPath(' + repr(str(marker)) +
                            ').touch()\n').encode() + self.originals[name])
        try:
            yield marker
        finally:
            helper.write_bytes(self.originals[name])

    def test_trusted_constants_match_installed_sources(self):
        self.assertEqual(self.runtime.TRUSTED_CAPTION_RUNTIME_SHA256,
                         hashlib.sha256(self.originals['caption_renderer.py']).hexdigest())
        self.assertEqual(self.runtime.TRUSTED_MOTION_REVIEW_SHA256,
                         hashlib.sha256(self.originals['motion_review.py']).hexdigest())
        self.assertEqual(self.runtime.TRUSTED_ASSET_ROLES_SHA256,
                         hashlib.sha256(self.originals['b6_asset_roles.py']).hexdigest())
        review = module('b6_helper_constant_review', self.base / 'motion_review.py')
        self.assertEqual(review.TRUSTED_CAPTION_RUNTIME_SHA256,
                         self.runtime.TRUSTED_CAPTION_RUNTIME_SHA256)

    def test_unmodified_new_directory_validates(self):
        result = self.call('validate')
        self.assertEqual(result.returncode, 0, result.stderr)
        data = json.loads(result.stdout.split('RESULT ', 1)[1])
        self.assertTrue(data['valid'])
        self.assertEqual(data['duration'], 7.5)

    def test_validate_rejects_edited_media_role_guard_without_execution(self):
        with self.edited_helper('b6_asset_roles.py') as marker:
            result=self.call('validate')
            self.assertNotEqual(result.returncode,0)
            self.assertIn('Untrusted asset-role runtime changed',result.stderr)
            self.assertFalse(marker.exists())

    def test_validate_rejects_edited_caption_without_execution(self):
        with self.edited_helper('caption_renderer.py') as marker:
            result = self.call('validate')
            self.assertNotEqual(result.returncode, 0)
            self.assertIn('Untrusted caption runtime changed', result.stderr)
            self.assertFalse(marker.exists())

    def test_all_review_entries_reject_edited_review_without_execution(self):
        with self.edited_helper('motion_review.py') as marker:
            # Only an invalid unit-test report: never accepted as a film or approval.
            context = self.runtime.load(self.base, '16:9')
            video = self.base / 'helper-gate-unit-fixture.bin'
            video.write_bytes(b'not a media preview; rejection-only contract fixture')
            report = self.base / 'helper-gate-unit-report.json'
            report.write_text(json.dumps({'kind': 'preview', 'technical_fixture': False,
                              'fingerprint': context.fingerprint, 'video': video.name,
                              'video_sha256': hashlib.sha256(video.read_bytes()).hexdigest(),
                              'ratio': '16:9'}))
            for command, args in [
                ('review-pack', ['--report', report.name]),
                ('check-review', ['--review', 'missing-review.json']),
                ('approve', ['--report', report.name, '--review', 'missing-review.json',
                             '--note', 'Synthetic rejection-only unit test'])]:
                with self.subTest(command=command):
                    marker.unlink(missing_ok=True)
                    result = self.call(command, *args)
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn('technical-only' if command=='approve' else 'Untrusted motion-review runtime changed', result.stderr)
                    self.assertFalse(marker.exists())
                    self.assertFalse((self.base / 'approval-16x9.json').exists())

    def test_direct_review_caption_binding_rejects_edited_caption(self):
        review = module('b6_helper_direct_review', self.base / 'motion_review.py')
        context = self.runtime.load(self.base, '16:9')
        with self.edited_helper('caption_renderer.py') as marker:
            with self.assertRaisesRegex(ValueError, 'Untrusted caption runtime changed'):
                review.caption_binding(context, {}, {'start': 0, 'end': 7.5})
            self.assertFalse(marker.exists())

    def test_caption_loader_ignores_matching_poisoned_bytecode_cache(self):
        helper = self.base / 'caption_renderer.py'
        original = self.originals[helper.name]
        stamp = helper.stat()
        marker = Path(self.tmp.name) / 'poisoned-cache.marker'
        malicious = ('from pathlib import Path\nPath(' + repr(str(marker)) + ').touch()\n').encode()
        self.assertLess(len(malicious), len(original))
        helper.write_bytes(malicious + b' ' * (len(original) - len(malicious)))
        os.utime(helper, ns=(stamp.st_atime_ns, stamp.st_mtime_ns))
        # Match CPython's timestamp/size checks while keeping all cache writes local.
        with patch.object(sys, 'pycache_prefix', None):
            cache = importlib.util.cache_from_source(str(helper))
            py_compile.compile(str(helper), cfile=cache, doraise=True)
            helper.write_bytes(original)
            os.utime(helper, ns=(stamp.st_atime_ns, stamp.st_mtime_ns))
            loaded = self.runtime.caption_helper()
        self.assertFalse(marker.exists())
        self.assertTrue(callable(loaded.CaptionRenderer))

    def test_caption_loader_executes_the_same_bytes_it_verified(self):
        helper = self.base / 'caption_renderer.py'
        marker = Path(self.tmp.name) / 'after-read-replacement.marker'
        original_read = Path.read_bytes
        reads = []
        def replace_after_read(path):
            source = original_read(path)
            if path == helper:
                reads.append(path)
                path.write_text('from pathlib import Path\nPath(' + repr(str(marker)) + ').touch()\n')
            return source
        with patch.object(Path, 'read_bytes', replace_after_read):
            loaded = self.runtime.caption_helper()
        self.assertEqual(reads, [helper])
        self.assertFalse(marker.exists())
        self.assertTrue(callable(loaded.CaptionRenderer))

    def test_execution_still_requires_trusted_code(self):
        result = self.call('preview', '--seconds', '0.1')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Inspect authored source, then allow --trusted-code', result.stderr)
        self.assertFalse((self.base / 'outputs/preview-01').exists())

    def test_missing_review_still_fails_without_creating_approval(self):
        result = self.call('check-review', '--review', 'missing-review.json')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Missing/escaped review evidence', result.stderr)
        self.assertFalse((self.base / 'approval-16x9.json').exists())


if __name__ == '__main__':
    unittest.main()
