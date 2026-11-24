"""Portable handoff integrity tests; fixture bytes never assert B8 art quality."""
import hashlib
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import b8_portable as portable


def sha(path):
    return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


class PortableTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='b8-portable-test-')
        self.addCleanup(self.temp.cleanup)
        self.root = pathlib.Path(self.temp.name).resolve()
        self.source = self.root / 'skill'
        self.base = self.root / 'story'
        (self.source / 'scripts').mkdir(parents=True)
        (self.base / 'assets/fonts').mkdir(parents=True)
        for name in portable.RUNTIME_MODULES:
            (self.source / 'scripts' / name).write_text('# fixture module\n')
        shutil.copy2(ROOT / 'scripts/b8_portable.py', self.source / 'scripts/b8_portable.py')
        # This lightweight entry-point fixture verifies relocation/import paths,
        # without rendering media or creating imaginary review approvals.
        (self.source / 'scripts/b8_workflow.py').write_text(
            'import json,pathlib,sys\n'
            'ROOT=pathlib.Path("/deliberately-unavailable-installed-skill")\n'
            'REFERENCE=ROOT/"unavailable"\n'
            'def main():\n'
            ' args=sys.argv[1:]\n'
            ' if args==["--help"]: print("portable help");return\n'
            ' assert (ROOT/"scripts/b8_scene.py").is_file()\n'
            ' assert (ROOT/"assets/fonts/NotoSans.ttf").is_file()\n'
            ' assert (REFERENCE/"reference-manifest.json").is_file()\n'
            ' if args[0] not in ("doctor","help"):\n'
            '  target=pathlib.Path(args[1])\n'
            '  assert target.is_file() or (target/"project.json").is_file()\n'
            ' print(json.dumps({"ok":True,"command":args[0],"root":str(ROOT),"reference":str(REFERENCE),"cwd":str(pathlib.Path.cwd())}))\n')
        (self.source / 'scripts/requirements-b8.txt').write_text('Pillow==11.3.0\nnumpy==2.0.2\nscipy==1.13.1\n')
        for name in portable.FONT_FILES:
            (self.base / 'assets/fonts' / name).write_bytes(('fixture ' + name).encode())
        reference = self.base / 'references/b8'
        reference.mkdir(parents=True)
        (reference / 'style-board.txt').write_text('fixture reference, not visual evidence')
        write(reference / 'reference-manifest.json', {'files': [{'path': 'style-board.txt', 'sha256': sha(reference / 'style-board.txt')}]})
        (self.base / 'assets/cel.bin').write_bytes(b'fixture drawn asset bytes')
        self.plan = {'schema_version': 1, 'style': 'B8', 'title': 'Hermes & Persephone',
                     'checkpoint': 'checkpoint.json', 'assets': {'cel': {'path': 'assets/cel.bin', 'sha256': sha(self.base / 'assets/cel.bin')}},
                     'drawing_family': {'references': ['references/b8/style-board.txt']}, 'characters': [],
                     'caption_style': {'font': 'assets/fonts/NotoSans.ttf', 'font_sha256': sha(self.base / 'assets/fonts/NotoSans.ttf')}}
        write(self.base / 'project.json', self.plan)
        write(self.base / 'checkpoint.json', {'b8_pipeline': {'stage': 'proposal_pending_user_review', 'approvals': [], 'artifacts': [str(self.base / 'outputs/old-diagnostic.jpg')]}})

    def install(self):
        return portable.install_runtime(self.base, self.source)

    def test_runtime_exact_closure_no_replay_and_pinned_local_requirements(self):
        result = self.install()
        manifest = json.loads(pathlib.Path(result['manifest']).read_text())
        self.assertEqual(pathlib.Path(result['manifest']).name, 'runtime-manifest.json')
        self.assertEqual(manifest['reference_root'], '../references/b8')
        self.assertEqual(manifest['network_calls'], 0)
        self.assertFalse((self.base / 'b8/assets/b8/midas-replay-v1').exists())
        self.assertEqual((self.base / 'b8/requirements.txt').read_bytes(), (self.source / 'scripts/requirements-b8.txt').read_bytes())
        self.assertEqual({x['path'] for x in manifest['files']},
                         {'scripts/' + n for n in portable.RUNTIME_MODULES} |
                         {'run.py', 'requirements.txt'} | {'assets/fonts/' + n for n in portable.FONT_FILES})
        self.assertTrue(portable.verify_runtime(self.base)['ok'])

    def test_no_overwrite_missing_module_reference_and_changed_runtime(self):
        (self.source / 'scripts/b8_captions.py').unlink()
        with self.assertRaisesRegex(ValueError, 'b8_captions'):
            self.install()
        self.assertFalse((self.base / 'b8').exists())
        (self.source / 'scripts/b8_captions.py').write_text('# local captions module\n')
        (self.base / 'references/b8/style-board.txt').write_text('tampered')
        with self.assertRaisesRegex(ValueError, 'baseline reference'):
            self.install()
        write(self.base / 'references/b8/reference-manifest.json', {'files': [{'path': 'style-board.txt', 'sha256': sha(self.base / 'references/b8/style-board.txt')}]})
        self.install()
        with self.assertRaisesRegex(ValueError, 'exists'):
            self.install()
        (self.base / 'b8/scripts/b8_scene.py').write_text('# changed after install\n')
        self.assertFalse(portable.verify_runtime(self.base)['ok'])

    def test_copied_runner_resolves_locally_without_source_and_from_other_cwd(self):
        self.install()
        relocated = self.root / 'moved story'
        shutil.copytree(self.base, relocated)
        shutil.rmtree(self.base)
        shutil.rmtree(self.source)
        runner = relocated / 'b8/run.py'
        for command in ('doctor', 'proposal', 'keyposes', 'preview', 'render', 'validate'):
            proc = subprocess.run([sys.executable, str(runner), command], cwd=self.root,
                                  capture_output=True, text=True)
            self.assertEqual(proc.returncode, 0, proc.stderr)
            info = json.loads(proc.stdout)
            self.assertEqual(info['root'], str(relocated / 'b8'))
            self.assertEqual(info['reference'], str(relocated / 'references/b8'))
            self.assertEqual(info['cwd'], str(relocated))
        proc = subprocess.run([sys.executable, str(runner), '--help'], cwd=self.root, capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertIn('portable help', proc.stdout)
        proc = subprocess.run([sys.executable, str(runner), 'validate', str(relocated)], cwd=self.root, capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        proc = subprocess.run([sys.executable, str(runner), 'validate', str(relocated / 'project.json')], cwd=self.root, capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        proc = subprocess.run([sys.executable, str(runner), 'doctor', str(relocated.relative_to(self.root))], cwd=self.root, capture_output=True, text=True)
        self.assertEqual(proc.returncode, 0, proc.stderr)
        self.assertEqual(json.loads(proc.stdout)['reference'], str(relocated / 'references/b8'))

    def test_delivery_all_source_bytes_hashes_relative_html_and_pending_are_preserved(self):
        self.install()
        output = self.base / 'outputs'
        output.mkdir()
        # Test container only: never decoded, rendered or claimed as a film.
        (output / 'test fixture.mp4').write_bytes(b'not a movie; file-copy fixture')
        film = output / 'test fixture.mp4'
        report = {'kind': 'b8_encoded_film', 'visual_review': 'pending', 'actual_listening': 'pending', 'user_acceptance': 'pending',
                  'artifacts': [{'path': 'outputs/test fixture.mp4', 'sha256': sha(film)}],
                  'technical': {'output': str(film)}}
        write(output / 'test.report.json', report)
        write(output / 'drawing-prompts.json', {'jobs': [{'reference_paths': [str(self.base / 'references/b8/style-board.txt')]}]})
        before = {str(f.relative_to(self.base)): f.read_bytes() for f in self.base.rglob('*') if f.is_file()}
        result = portable.deliver(self.base, self.root / 'handoff', film='outputs/test fixture.mp4', review=output / 'test.report.json')
        delivered = pathlib.Path(result['project']).parent
        for relative, content in before.items():
            self.assertEqual((delivered / relative).read_bytes(), content)
        manifest = json.loads(pathlib.Path(result['manifest']).read_text())
        for item in manifest['files']:
            self.assertEqual(item['source_sha256'], item['sha256'])
            self.assertEqual(item['sha256'], sha(pathlib.Path(result['folder']) / item['path']))
        self.assertEqual(manifest['external_media_dependencies'], [])
        self.assertEqual(result['review_status'], {'visual_review': 'pending', 'actual_listening': 'pending', 'user_acceptance': 'pending'})
        self.assertTrue(manifest['historical_locations'])
        self.assertTrue(any(x['field'] == 'jobs.0.reference_paths.0' for x in manifest['historical_locations']))
        self.assertTrue(all(not pathlib.Path(x['path']).is_absolute() for x in manifest['input_dependencies']))
        page = pathlib.Path(result['index']).read_text()
        self.assertIn('project/outputs/test%20fixture.mp4', page)
        self.assertIn('href="project/"', page)
        self.assertIn('project/outputs/test.report.json', page)
        self.assertIn('Hermes &amp; Persephone', page)
        self.assertNotIn('file://', page)
        self.assertNotIn(str(self.base), page)
        with self.assertRaisesRegex(ValueError, 'exists'):
            portable.deliver(self.base, self.root / 'handoff')

    def test_delivery_rejects_self_copy_external_inputs_and_asset_hash_changes(self):
        self.install()
        with self.assertRaisesRegex(ValueError, 'source project'):
            portable.deliver(self.base, self.base / 'nested-delivery')
        outside = self.root / 'outside.bin'
        outside.write_bytes(b'external')
        self.plan['assets']['cel']['path'] = str(outside)
        write(self.base / 'project.json', self.plan)
        with self.assertRaisesRegex(ValueError, 'external/parent'):
            portable.deliver(self.base, self.root / 'no-external')
        self.assertFalse((self.root / 'no-external').exists())
        self.plan['assets']['cel']['path'] = 'assets/cel.bin'
        write(self.base / 'project.json', self.plan)
        (self.base / 'assets/cel.bin').write_bytes(b'changed asset')
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            portable.deliver(self.base, self.root / 'no-tampering')

    def test_selected_film_and_report_must_bind_path_and_current_hash_even_when_pending(self):
        self.install()
        output = self.base / 'outputs'
        output.mkdir()
        a = output / 'a.mp4'
        b = output / 'b.mp4'
        a.write_bytes(b'synthetic A; no encoded video')
        b.write_bytes(b'synthetic B; no encoded video')
        report = output / 'b.report.json'
        write(report, {'artifacts': [{'path': 'outputs/b.mp4', 'sha256': sha(b)}],
                       'visual_review': 'pending', 'actual_listening': 'pending', 'user_acceptance': 'pending'})
        with self.assertRaisesRegex(ValueError, 'bind the selected film'):
            portable.deliver(self.base, self.root / 'mismatched-pair', film='outputs/a.mp4', review=report)
        self.assertFalse((self.root / 'mismatched-pair').exists())
        result = portable.deliver(self.base, self.root / 'matched-pending-pair', film='outputs/b.mp4', review=report)
        self.assertTrue(all(value == 'pending' for value in result['review_status'].values()))
        b.write_bytes(b'changed B after the report')
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            portable.deliver(self.base, self.root / 'stale-sha-pair', film='outputs/b.mp4', review=report)
        self.assertFalse((self.root / 'stale-sha-pair').exists())

    def test_symlink_rejection_no_external_report_input_and_no_review_invention(self):
        self.install()
        (self.base / 'assets/linked').symlink_to(self.root)
        with self.assertRaisesRegex(ValueError, 'symlink'):
            portable.deliver(self.base, self.root / 'no-links')
        (self.base / 'assets/linked').unlink()
        with self.assertRaisesRegex(ValueError, 'inside the project'):
            portable.deliver(self.base, self.root / 'no-external-review', review=self.source / 'scripts/b8_workflow.py')
        result = portable.deliver(self.base, self.root / 'draft-handoff')
        self.assertIsNone(result['film'])
        self.assertIsNone(result['review'])
        self.assertTrue(all(x == 'pending' for x in result['review_status'].values()))
        self.assertEqual(json.loads(pathlib.Path(result['project']).read_text())['title'], self.plan['title'])


if __name__ == '__main__':
    unittest.main()
