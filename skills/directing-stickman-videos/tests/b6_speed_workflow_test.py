"""Exercise installed B6 fast-iteration commands without a paid/media workflow."""
from pathlib import Path
from types import SimpleNamespace
from unittest import mock
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
import wave

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('b6_speed_integration', ROOT / 'scripts/b6_production.py')
runtime = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runtime)

SCENE = '''
def draw(t, c):
    r=c.puppet_runtime
    m=c.viewport.screen_matrix([[1,0,600],[0,1,650],[0,0,1]])
    a=r.Puppet(c.character_packages['keeper'],'front','keeper').pose(
        placement=m,frame_index=round(t*30))
    return r.render_scene(c.viewport.size,[a],frame_index=round(t*30))
def frame(t,c):
    return draw(t,c)
def draft_frame(t,c):
    return draw(t,c)
'''


class InstalledSpeedWorkflow(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='b6-speed-workflow-')
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name) / 'new project'
        subprocess.run(['node', str(ROOT / 'scripts/autopilot.mjs'), 'init', str(self.base),
                        '--style', 'B6', '--ratio', '16:9'], check=True, capture_output=True)
        shutil.copytree(ROOT / 'assets/b6/characters/kiosk_keeper', self.base / 'characters/keeper')
        self.project = runtime.read(self.base / 'project.json')
        # An explicit local structural fixture can use bundled diagnostic paint;
        # it is not relabelled as a new-story production or a creative pass.
        self.project.update(version=1, purpose='diagnostic', technical_fixture=True)
        self.save('characters.json', {'schema':'b6-character-registry/1', 'actors':[
            {'id':'keeper','package':'characters/keeper','views':['front']}], 'rigid_cast':[]})
        self.save('project.json', self.project)

    def save(self, name, value):
        runtime.save(self.base / name, value)

    def args(self, command, **kwargs):
        result = dict(command=command, project=str(self.base), ratio='16:9', trusted_code=True,
                      start=0, seconds=2/30, output='outputs/'+command, report=None,
                      review=None, note='', draft_scale=.5)
        result.update(kwargs)
        return SimpleNamespace(**result)

    def installed(self, args):
        # Scene execution installs process-wide resource audit hooks. Exercise
        # the real installed CLI in its own process, as an installed user does.
        command = [sys.executable, str(self.base / 'run.py'), args.command, str(self.base)]
        for name in ('ratio', 'start', 'seconds', 'output', 'report', 'review',
                     'note', 'draft_scale', 'required_views'):
            value = getattr(args, name, None)
            if value is not None:
                command += ['--'+name.replace('_','-'), str(value)]
        if args.trusted_code:
            command.append('--trusted-code')
        result = subprocess.run(command, capture_output=True, text=True)
        if result.returncode:
            raise ValueError(result.stderr or result.stdout)
        return json.loads(result.stdout.rsplit('\nRESULT ', 1)[-1])

    def author(self):
        self.project.update(stage='authored', duration=1)
        audio = self.base / 'silence.wav'
        with wave.open(str(audio), 'wb') as f:
            f.setnchannels(1); f.setsampwidth(2); f.setframerate(24000)
            f.writeframes(b'\0\0' * 24000)
        self.project['voice'] = {'name':'structural silence','path':'silence.wav',
                                 'sha256':runtime.sha(audio),'speed':1}
        self.save('project.json', self.project)
        self.save('story.json', {'narration':'','beats':[]})
        self.save('captions.json', [])
        plan = runtime.read(self.base / 'formats/landscape.json')
        plan['caption']['native_layout_reason'] = 'Native landscape limb diagnostic'
        plan['shots'] = [dict(id='rest',start=0,end=1,composition='Full silhouette at center',
                              action='Hold a readable planted pose',camera='Fixed native diagnostic',transition='End')]
        plan['cast_inventory'] = [dict(id='keeper',role='diagnostic keeper',shot_ids=['rest'])]
        self.save('formats/landscape.json', plan)
        (self.base / 'scene.py').write_text(SCENE)

    def test_preflight_runs_before_scene_voice_and_authored_stage(self):
        (self.base / 'scene.py').write_text('raise RuntimeError("Do not execute during preflight")\n')
        self.assertIsNone(self.project['voice'])
        self.assertEqual(self.project['stage'], 'needs_authoring')
        result = runtime.run(self.args('preflight'))
        self.assertTrue(result['technical_pass'], result['errors'])
        self.assertEqual(result['actors'][0]['views'][0]['baseline_alpha_render']['arm_records'], 2)
        self.assertFalse((self.base / 'outputs').exists())

    def test_node_entry_forwards_preflight_to_fresh_installed_project(self):
        result = subprocess.run(['node', str(ROOT / 'scripts/autopilot.mjs'), 'preflight',
                                 str(self.base), '--ratio', '16:9'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('"technical_pass": true', result.stdout)

    def test_true_draft_encodes_scaled_geometry_at_original_fps(self):
        self.author()
        result = self.installed(self.args('draft'))
        self.assertEqual(result['dimensions'], [640,360])
        self.assertEqual(result['native_dimensions'], [1280,720])
        self.assertEqual(result['fps'], 30)
        self.assertEqual(result['checked_frames'], 2)
        self.assertEqual(result['render_profile'], 'draft-viewport-v1')
        self.assertFalse(result['reviewable'])
        self.assertFalse(result['delivery_ready'])
        self.assertNotIn('caption_contract', result)
        probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-of','json',
                                                   str(self.base / result['video'])]))
        video = next(s for s in probe['streams'] if s['codec_type']=='video')
        self.assertEqual((video['width'],video['height']), (640,360))
        self.assertEqual(video['avg_frame_rate'], '30/1')

    def test_draft_never_falls_back_to_native_frame(self):
        self.author()
        (self.base / 'scene.py').write_text('def frame(t,c):\n    raise RuntimeError("Native frame must not run")\n')
        with self.assertRaisesRegex(ValueError, 'True low-resolution draft needs scene.draft_frame'):
            self.installed(self.args('draft'))
        self.assertFalse((self.base / 'outputs/draft').exists())

    def test_scene_cannot_silently_return_native_size_for_draft(self):
        self.author()
        (self.base / 'scene.py').write_text(SCENE.replace(
            'm=c.viewport.screen_matrix([[1,0,600],[0,1,650],[0,0,1]])',
            'm=[[1,0,600],[0,1,650],[0,0,1]]').replace(
            'r.render_scene(c.viewport.size,', 'r.render_scene((1280,720),'))
        with self.assertRaisesRegex(ValueError, 'requested viewport dimensions'):
            self.installed(self.args('draft'))

    def test_native_preview_retains_native_size_and_profile(self):
        self.author()
        result = self.installed(self.args('preview'))
        self.assertEqual(result['dimensions'], [1280,720])
        self.assertEqual(result['render_profile'], 'native')
        self.assertTrue(result['reviewable'])
        self.assertIn('caption_contract', result)
        self.assertFalse(result['delivery_ready'])

    def test_native_ratio_caption_and_original_voice_gates_remain(self):
        self.author()
        self.project['voice']['speed'] = 1.1
        self.save('project.json', self.project)
        with self.assertRaisesRegex(ValueError, 'original-speed'):
            runtime.run(self.args('draft'))
        self.project['voice']['speed'] = 1
        self.save('project.json', self.project)
        plan = runtime.read(self.base / 'formats/landscape.json')
        plan['native_design'] = '9:16'
        self.save('formats/landscape.json', plan)
        with self.assertRaisesRegex(ValueError, 'Separate native layout'):
            runtime.run(self.args('draft'))

    def test_draft_report_cannot_be_used_for_creative_review_or_user_approval(self):
        self.author()
        result = self.installed(self.args('draft'))
        report = 'outputs/draft/report.json'
        c = runtime.load(self.base, '16:9')
        with self.assertRaisesRegex(ValueError, 'real encoded preview'):
            runtime.run(self.args('review-pack', report=report, output='outputs/illegal-review'))
        # Test the actual draft-kind barrier independently of the diagnostic
        # scope barrier; neither a purpose relabel nor a note promotes a draft.
        c.purpose = 'production'
        production_draft = dict(result, technical_fixture=False, purpose='production')
        self.save(report, production_draft)
        with mock.patch.object(runtime, 'load', return_value=c):
            with self.assertRaisesRegex(ValueError, 'Reviewed preview/source changed or is technical-only'):
                runtime.run(self.args('approve', report=report, note='test only'))
        review = {'schema_version':3,'ratio':'16:9','fingerprint':c.fingerprint,
                  'inputs':dict(c.inputs),'report':report}
        self.save('draft-review.json', review)
        with self.assertRaisesRegex(ValueError, 'real encoded preview'):
            runtime.run(self.args('check-review', report=report, review='draft-review.json'))
        self.assertFalse((self.base / 'approval-16x9.json').exists())

    def test_native_production_still_needs_genuine_user_approval(self):
        self.author()
        c = runtime.load(self.base, '16:9')
        # Scope relabeling is limited to this gate test. The real project keeps
        # its diagnostic purpose, and no bundled art is exported as production.
        c.purpose = 'production'
        with mock.patch.object(runtime, 'load', return_value=c):
            with self.assertRaisesRegex(ValueError, 'Missing user approval'):
                runtime.run(self.args('render'))
        self.assertFalse((self.base / 'outputs/render').exists())

    def test_new_helper_trust_checks_precede_import_side_effects(self):
        self.author()
        for helper, command in [('b6_character_preflight.py','preflight'),
                                ('b6_iteration.py','draft'), ('b6_actions.py','draft')]:
            with self.subTest(helper=helper):
                file = self.base / helper
                original = file.read_bytes()
                marker = self.base / ('imported-'+helper+'.txt')
                try:
                    file.write_text('from pathlib import Path\nPath('+repr(str(marker))+').write_text("ran")\n')
                    with self.assertRaisesRegex(ValueError, 'Untrusted '+Path(helper).stem+' changed'):
                        self.installed(self.args(command))
                    self.assertFalse(marker.exists(), 'Untrusted helper executed before its hash check')
                    self.assertFalse((self.base / 'outputs').exists())
                finally:
                    file.write_bytes(original)

    def test_iteration_command_reuses_unchanged_input_bytes_without_review_credit(self):
        self.author()
        self.installed(self.args('draft'))
        args = self.args('plan-iteration', report='outputs/draft/report.json')
        result = runtime.run(args)
        self.assertEqual(result['scope'], 'unchanged_inputs')
        self.assertEqual(result['recommended_ranges'], [])
        self.assertFalse(result['inherited_review_credit'])
        self.assertTrue(result['final_native_preview_required'])
        (self.base / 'scene.py').write_text(SCENE + '\n# real implementation revision\n')
        result = runtime.run(args)
        self.assertEqual(result['scope'], 'full')
        self.assertEqual(result['recommended_ranges'], [{'start':0.0,'end':1.0}])
        self.assertIn('scene.py', result['changed_inputs'])


if __name__ == '__main__':
    unittest.main()
