"""Review gates reject stale, missing and plan-only evidence; no visual score."""
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
import copy
import importlib.util
import json
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


def module(name, file):
    spec = importlib.util.spec_from_file_location(name, file)
    out = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(out)
    return out


review = module('b6_review_test_helper', ROOT / 'scripts/b6_motion_review.py')
runtime = module('b6_review_test_runtime', ROOT / 'scripts/b6_production.py')


class MotionReview(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        captions = runtime.caption_helper()
        reference_font = ROOT / 'assets/fonts/ArchivoBlack.ttf'
        cls.tmp = tempfile.TemporaryDirectory(prefix='b6-motion-review-test-')
        cls.base = Path(cls.tmp.name).resolve()
        b = cls.base
        (b / 'scene.py').write_text('# Isolated contract fixture, not a user film.\n')
        shutil.copyfile(ROOT / 'scripts/b6_caption.py', b / 'caption_renderer.py')
        font = b / 'fonts/ArchivoBlack.ttf'
        font.parent.mkdir(parents=True)
        shutil.copyfile(reference_font, font)
        captions = runtime.caption_helper()
        profile = captions.default_profile('16:9', 320, 180, font_variant='archivo-black')
        profile['native_layout_reason'] = 'Synthetic native test frame; no visual approval claimed.'
        cue = {'start': 0, 'end': 1, 'text': 'Fixture.'}
        review.save(b / 'captions.json', [cue])
        from PIL import Image
        picture = Image.new('RGB', (320, 180), '#838890')
        bounds = captions.CaptionRenderer(b, '16:9', 320, 180, profile).draw(picture, cue['text'])
        picture.save(b / 'caption.png')
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-loop', '1', '-framerate', '30', '-i', str(b / 'caption.png'),
                        '-f', 'lavfi', '-i', 'sine=frequency=440:duration=1', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
                        '-c:a', 'aac', '-t', '1', '-shortest', str(b / 'preview.mp4')], check=True)
        cls.original_primary = review.PRIMARY_REFERENCE
        review.PRIMARY_REFERENCE = {'id': 'isolated-contract-fixture', 'ratio': '16:9', 'sha256': review.sha(b / 'preview.mp4')}
        target = {'version': 3, 'reference': {**review.PRIMARY_REFERENCE, 'path': 'preview.mp4',
                               'segments': [{'start': 0, 'end': 1, 'purpose': 'Contract fixture'}]},
                  'required_checks': list(review.CHECKS), 'required_subchecks': {k: list(v) for k, v in review.SUBCHECKS.items()}, 'regressions': ['Wrong elbow direction']}
        review.save(b / 'quality-target.json', target)
        cls.context = SimpleNamespace(purpose='production', base=b, fingerprint='fixture-fingerprint', ratio='16:9',
                                      project={'duration': 1, 'fps': 30, 'quality_target': 'quality-target.json', 'captions': 'captions.json'}, cues=[cue],
                                      plan={'width': 320, 'height': 180, 'caption': profile, 'cast_inventory': [{'id': 'fixture-actor', 'role': 'Contract fixture only', 'shot_ids': ['contact']}], 'shots': [{'id': 'contact', 'start': 0, 'end': 1}]},
                                      inputs={name: review.sha(b / name) for name in ['scene.py', 'caption_renderer.py', 'captions.json']})
        report = {'kind': 'preview', 'technical_fixture': False, 'fingerprint': cls.context.fingerprint, 'ratio': '16:9',
                  'video': 'preview.mp4', 'video_sha256': review.sha(b / 'preview.mp4'), 'checked_frames': 30,
                  'time_range': {'start': 0, 'end': 1}, 'caption_contract': captions.contract(profile, b / 'caption_renderer.py', font, review.sha(b / 'captions.json'), [{**cue, 'raster_bounds': bounds}])}
        review.save(b / 'report.json', report)
        review.build_pack(cls.context, 'report.json', 'review')
        cls.pending = review.read(b / 'review/motion-review.json')

    @classmethod
    def tearDownClass(cls):
        review.PRIMARY_REFERENCE = cls.original_primary
        cls.tmp.cleanup()

    def setUp(self):
        shutil.rmtree(self.base / review.HISTORY_DIR, ignore_errors=True)
        self.context = copy.deepcopy(type(self).context)
        self.data = copy.deepcopy(self.pending)
        approval = self.base / 'approval-16x9.json'
        if approval.exists():
            approval.unlink()

    def write(self):
        review.save(self.base / 'review/motion-review.json', self.data)

    def completed_fixture(self):
        """Synthetic review records only exercise the gate; not a quality verdict."""
        self.data['review'].update(status='pass', reviewer='Isolated unit-test fixture',
                                   method='Synthetic data for contract tests only', reviewed_at='2026-11-13T12:00:00+08:00')
        self.data['remaining_gaps'] = []
        clip = self.data['shots'][0]['evidence'][0]
        ref = self.data['reference_clips'][0]['evidence']
        caption_frames = [r['evidence'] for r in self.data['caption_evidence']['active_cues']]
        caption_frames += [file for row in self.data['caption_evidence']['switches'] for key, file in row.items() if key != 'frame' and file]
        self.data['full_playback'].update(speed=1, reviewer='Synthetic contract test only',
                                         observed_rhythm='Fixture full-range observation.',
                                         observed_audio='Fixture audio observation.', reference_evidence=[ref])
        for row in self.data['checks'].values():
            for subrow in row['subchecks'].values():
                subrow.update(status='pass', observation='Synthetic subcheck fixture, not a visual verdict.', start=0, end=1,
                              evidence=[clip, ref, self.data['shots'][0]['evidence'][1], self.data['reference_clips'][0]['frames'][0], *caption_frames],
                              implementation=[{'path': 'scene.py', 'claim': 'Fingerprint-bound fixture only.'}], remaining_gaps=[])
            row.update(status='pass', observation='Synthetic gate fixture, no aesthetic claim.', evidence=[clip, ref],
                       remaining_gaps=[],
                       implementation=[{'path': 'scene.py', 'claim': 'Fingerprint-bound implementation fixture.'}])
        for key, fields in review.HARD_DEMONSTRATIONS.items():
            self.data['checks'][key]['remaining_gaps'] = []
            self.data['checks'][key]['demonstration'] = dict(
                **{field: 'Synthetic observation for gate test only.' for field in fields},
                start=0, end=1, evidence=[clip, ref])
        self.data['checks']['limb_line_weight'].update(
            comparison_basis='Synthetic matched-scale fixture, not a visual acceptance claim.',
            evidence=[clip, ref, self.data['shots'][0]['evidence'][1], self.data['reference_clips'][0]['frames'][0]])
        self.data['cast_inventory_observation'] = 'Synthetic explicitly declared fixture, not person detection.'
        coverage = self.data['checks']['drawing_anatomy']['subchecks']['single_stroke_fixed_limb_ownership']
        coverage['cast_coverage'] = [{**actor, 'views_poses': 'Synthetic pose fixture.', 'near_far_ownership': 'Fixture hand assignment.',
                                     'hidden_limb_occlusion': 'Synthetic fixture has no actual actor; contract data only.', 'evidence': [clip]}
                                    for actor in self.data['cast_inventory']]
        for shot in self.data['shots']:
            shot.update(cast_ids=[actor['id'] for actor in self.data['cast_inventory'] if shot['id'] in actor['shot_ids']],
                        observed_expression_gaze='Fixture gaze.', observed_limb_occlusion='Fixture limb observation.',
                        observed_space_light='Fixture spatial observation.', observed_caption_audio='Fixture caption observation.')
            shot.update(status='pass', observed_action='Fixture observation.', observed_camera='Fixture camera observation.', remaining_gaps=[])
        for item in self.data['regressions']:
            item.update(status='pass', observation='Fixture regression observation.', evidence=[clip], remaining_gaps=[])
        self.write()

    def validate(self):
        self.write()
        return review._validate_review(self.context, 'review/motion-review.json', 'report.json')

    def test_pack_decodes_actual_frames_and_starts_pending(self):
        self.assertEqual(self.data['review']['status'], 'pending')
        self.assertTrue((self.base / 'review/shot-00-0.png').is_file())
        self.assertTrue((self.base / 'review/reference-00.mp4').is_file())
        with self.assertRaisesRegex(ValueError, 'pending/needs repair'):
            self.validate()

    def test_completed_bound_record_passes_contract_only(self):
        self.completed_fixture()
        self.assertEqual(self.validate()['status'], 'reviewer_passed_not_automatic_aesthetic_judgment')

    def test_caption_contract_uses_the_validated_open_font_identity(self):
        report = review.read(self.base / 'report.json')
        preview = report['time_range']
        bound = review.caption_binding(self.context, report, preview)
        self.assertEqual(bound['font_sha256'], self.context.plan['caption']['font_sha256'])
        report['caption_contract']['font_sha256'] = runtime.caption_helper().FONT_SHA256
        with self.assertRaisesRegex(ValueError, 'font/cue identity'):
            review.caption_binding(self.context, report, preview)

    def test_all_35_subchecks_are_mandatory_even_when_every_parent_passes(self):
        self.completed_fixture()
        self.assertEqual(sum(map(len, review.SUBCHECKS.values())), 35)
        for category, ids in review.SUBCHECKS.items():
            for ident in ids:
                with self.subTest(category=category, subcheck=ident):
                    rows = self.data['checks'][category]['subchecks']
                    item = rows.pop(ident)
                    with self.assertRaisesRegex(ValueError, 'Incomplete mandatory subchecks'):
                        self.validate()
                    rows[ident] = item
                    item['status'] = 'needs_repair'
                    with self.assertRaisesRegex(ValueError, 'Subcheck needs repair'):
                        self.validate()
                    item['status'] = 'pass'
                    item['remaining_gaps'] = ['Visible defect cannot hide under a pass label.']
                    with self.assertRaisesRegex(ValueError, 'Known subcheck gaps'):
                        self.validate()
                    item['remaining_gaps'] = []
        self.assertEqual(self.validate()['status'], 'reviewer_passed_not_automatic_aesthetic_judgment')

    def test_primary_manifest_cannot_be_deleted_or_simplified(self):
        self.completed_fixture()
        path = self.base / 'quality-target.json'
        original = path.read_bytes()
        try:
            for change in ('required_checks', 'required_subchecks', 'reference'):
                target = json.loads(original)
                if change == 'reference':
                    target['reference']['id'] = 'silently-weaker-reference'
                else:
                    target.pop(change)
                review.save(path, target)
                with self.assertRaisesRegex(ValueError, 'strict primary|Complete B6 primary'):
                    self.validate()
        finally:
            path.write_bytes(original)

    def test_conditional_absence_requires_real_evidence_and_cannot_skip_style_or_stance(self):
        self.completed_fixture()
        for category, ident in [('body_action', 'stance_swing_or_deliberate_hold'),
                                ('expression_gaze', 'eyeline_target'),
                                ('native_audio_captions', 'caption_placement_typography')]:
            item = self.data['checks'][category]['subchecks'][ident]
            item.update(status='not_applicable', reason='Attempting to avoid the audit.')
            with self.assertRaisesRegex(ValueError, 'Required subcheck cannot be skipped'):
                self.validate()
            item['status'] = 'pass'
        conditional = self.data['checks']['body_action']['subchecks']['contact_ownership_release']
        conditional.update(status='not_applicable', reason='The fixture contains no prop handoff; inspect the actual range.')
        self.assertEqual(self.validate()['status'], 'reviewer_passed_not_automatic_aesthetic_judgment')
        conditional['evidence'] = []
        with self.assertRaisesRegex(ValueError, 'hashed evidence'):
            self.validate()

    def test_every_declared_supporting_actor_needs_individual_limb_coverage(self):
        self.completed_fixture()
        actor = {'id': 'background-reader', 'role': 'Painted background supporting cast', 'shot_ids': ['contact']}
        self.context.plan['cast_inventory'].append(actor)
        with self.assertRaisesRegex(ValueError, 'omits declared cast'):
            self.validate()
        self.data['cast_inventory'].append(actor)
        self.data['shots'][0]['cast_ids'].append(actor['id'])
        with self.assertRaisesRegex(ValueError, 'every declared/observed cast'):
            self.validate()
        coverage = self.data['checks']['drawing_anatomy']['subchecks']['single_stroke_fixed_limb_ownership']['cast_coverage']
        coverage.append({**actor, 'views_poses': 'Reader seated in rear plane.', 'near_far_ownership': 'Both hands assigned to reader.',
                         'hidden_limb_occlusion': '', 'evidence': self.data['shots'][0]['evidence'][:1]})
        with self.assertRaisesRegex(ValueError, 'credible hidden-limb'):
            self.validate()
        coverage[-1]['hidden_limb_occlusion'] = 'Table edge credibly occludes the lower forearms; actual frame inspected.'
        self.assertEqual(self.validate()['status'], 'reviewer_passed_not_automatic_aesthetic_judgment')

    def test_caption_typography_needs_decoded_active_cue_not_a_generic_thumbnail(self):
        self.completed_fixture()
        item = self.data['checks']['native_audio_captions']['subchecks']['caption_placement_typography']
        item['evidence'] = [self.data['shots'][0]['evidence'][0], self.data['shots'][0]['evidence'][1],
                            self.data['reference_clips'][0]['evidence'], self.data['reference_clips'][0]['frames'][0]]
        with self.assertRaisesRegex(ValueError, 'decoded active-cue'):
            self.validate()

    def test_old_schema2_failed_review_is_inherited_with_confirmed_defect_requirement(self):
        self.completed_fixture()
        old = copy.deepcopy(self.data)
        old['schema_version'] = 2
        for row in old['checks'].values():
            row.pop('subchecks')
        old['checks']['native_audio_captions'].update(status='needs_repair', observation='Known visible wrong caption baseline.')
        old['supplemental_audit'] = {'known_confirmed_defect': True}
        review.save(self.base / 'schema2-rejection.json', old)
        destination = 'schema3-from-schema2-' + self._testMethodName
        review.build_pack(self.context, 'report.json', destination, 'schema2-rejection.json')
        pack = review.read(self.base / destination / 'motion-review.json')
        self.assertEqual(pack['schema_version'], 3)
        self.assertEqual([row['issue'] for row in pack['repair_log']], ['check:native_audio_captions'])
        self.assertEqual(pack['repair_log'][0]['resolution_requirement'], 'implementation_change')
        self.data = pack
        self.completed_fixture()
        item = self.data['repair_log'][0]
        item.update(status='pass', resolution='review_correction', correction_reason='Pretend the visible error was a prior misreport.',
                    change='No source or movie changed.', observation='Synthetic attempt to wash an established defect.',
                    evidence=self.data['shots'][0]['evidence'][:1],
                    implementation=[{'path': 'scene.py', 'claim': 'Unchanged fixture.'}])
        with self.assertRaisesRegex(ValueError, 'Confirmed visible defect requires'):
            self.validate()
        item['resolution_requirement'] = 'observed_resolution'
        with self.assertRaisesRegex(ValueError, 'repair requirement changed'):
            self.validate()

    def test_needs_repair_cannot_be_hidden_under_overall_pass(self):
        self.completed_fixture()
        self.data['checks']['space_depth']['status'] = 'needs_repair'
        with self.assertRaisesRegex(ValueError, 'needs repair'):
            self.validate()

    def test_unwatched_full_preview_and_changed_speed_cannot_pass(self):
        self.completed_fixture()
        self.data['full_playback']['observed_rhythm'] = ''
        with self.assertRaisesRegex(ValueError, 'Full real-time playback'):
            self.validate()
        self.completed_fixture()
        self.data['full_playback']['speed'] = 1.2
        with self.assertRaisesRegex(ValueError, 'intended speed'):
            self.validate()

    def test_animation_and_space_need_observed_phases_not_generic_claims(self):
        for key in review.HARD_DEMONSTRATIONS:
            self.completed_fixture()
            self.data['checks'][key]['demonstration'] = {}
            with self.assertRaisesRegex(ValueError, 'observed animation/space'):
                self.validate()
            self.completed_fixture()
            self.data['checks'][key]['remaining_gaps'] = ['Still less dynamic than the primary movie.']
            with self.assertRaisesRegex(ValueError, 'Known check gaps'):
                self.validate()
        self.completed_fixture()
        self.data['remaining_gaps'] = ['Known same-storefront repetition.']
        with self.assertRaisesRegex(ValueError, 'Known quality gaps remain'):
            self.validate()

    def test_previous_rejection_is_carried_into_repair_log_and_cannot_be_dropped(self):
        self.completed_fixture()
        old = copy.deepcopy(self.data)
        old['review']['status'] = 'needs_repair'
        old['checks']['space_depth'].update(status='needs_repair', observation='One flat plane, no reveal.')
        review.save(self.base / 'rejected-review.json', old)
        fresh = 'linked-' + self._testMethodName
        review.build_pack(self.context, 'report.json', fresh, 'rejected-review.json')
        linked = review.read(self.base / fresh / 'motion-review.json')
        self.assertEqual([r['issue'] for r in linked['repair_log']], ['check:space_depth'])
        # Put a previous-generation repair into a fully observed current fixture.
        self.data['previous_review'] = linked['previous_review']
        self.data['repair_log'] = linked['repair_log']
        with self.assertRaisesRegex(ValueError, 'still needs correction'):
            self.validate()
        self.data['repair_log'] = []
        with self.assertRaisesRegex(ValueError, 'findings were dropped'):
            self.validate()
        self.data['repair_log'] = linked['repair_log']
        repair = self.data['repair_log'][0]
        repair.update(status='pass', change='Added a near occluder and an independently projected broad street.',
                      observation='New street region becomes visible behind the occluder.',
                      evidence=[self.data['shots'][0]['evidence'][0]],
                      implementation=[{'path': 'scene.py', 'claim': 'The actual correction.'}])
        with self.assertRaisesRegex(ValueError, 'changed source and newly rendered pixels'):
            self.validate()
        repair.update(resolution='review_correction',
                      change='Synthetic review fixture corrected, no code change claimed.',
                      correction_reason='Synthetic test only: prior flat-plane finding was a fixture misreport, not a real media verdict.')
        self.assertEqual(self.validate()['status'], 'reviewer_passed_not_automatic_aesthetic_judgment')

    def test_known_gaps_and_unclosed_repairs_survive_multiple_iterations(self):
        self.completed_fixture()
        old = copy.deepcopy(self.data)
        old['checks']['space_depth']['remaining_gaps'] = ['Still repeats the same world patch.']
        old['remaining_gaps'] = ['Action peak remains unreadable.']
        old['repair_log'] = [{'issue': 'shot:earlier', 'status': 'pass',
                              'remaining_gaps': ['Still an open repair despite the pass label.'],
                              'observation': 'Previous unresolved continuity.'}]
        findings = dict(review.unresolved_findings(old))
        self.assertEqual(set(findings), {'check:space_depth', 'gap:global:0', 'shot:earlier'})
        self.assertIn('same world patch', findings['check:space_depth']['observation'])
        review.save(self.base / 'repeated-rejection.json', old)
        fresh = 'linked-' + self._testMethodName
        review.build_pack(self.context, 'report.json', fresh, 'repeated-rejection.json')
        linked = review.read(self.base / fresh / 'motion-review.json')
        self.assertEqual({row['issue'] for row in linked['repair_log']}, set(findings))

    def test_every_check_shot_and_regression_gap_blocks_a_pass(self):
        self.completed_fixture()
        for row in [self.data['checks']['expression_gaze'], self.data['shots'][0], self.data['regressions'][0]]:
            row['remaining_gaps'] = ['Known visible regression, despite pass label.']
            with self.assertRaisesRegex(ValueError, 'Known .* gaps remain'):
                self.validate()
            row['remaining_gaps'] = []
        self.assertEqual(self.validate()['status'], 'reviewer_passed_not_automatic_aesthetic_judgment')

    def test_history_prevents_deleted_link_and_omitted_previous_flag_laundering(self):
        self.completed_fixture()
        old = copy.deepcopy(self.data)
        old['checks']['space_depth'].update(status='needs_repair', observation='Synthetic pending spatial rejection.')
        review.save(self.base / 'ledger-rejection.json', old)
        first = 'history-linked-' + self._testMethodName
        review.build_pack(self.context, 'report.json', first, 'ledger-rejection.json')
        active = review.active_failure(self.context)
        self.assertIsNotNone(active)
        # Removing both editable fields cannot erase the independent failure state.
        self.data.update(previous_review=None, repair_log=[])
        self.write()
        with self.assertRaisesRegex(ValueError, 'Known failed review history'):
            review.validate_review(self.context, 'review/motion-review.json', 'report.json')
        automatic = 'automatic-' + self._testMethodName
        review.build_pack(self.context, 'report.json', automatic)
        pack = review.read(self.base / automatic / 'motion-review.json')
        self.assertEqual(pack['previous_review'], active)
        self.assertEqual([r['issue'] for r in pack['repair_log']], ['check:space_depth'])
        self.assertEqual(review.active_failure(self.context), active)
        self.data.update(previous_review=pack['previous_review'], repair_log=pack['repair_log'])
        repair = self.data['repair_log'][0]
        repair.update(status='pass', resolution='review_correction',
                      correction_reason='Synthetic contract test only: initial rejection was a test misreport.',
                      change='Corrected the synthetic review record, no source edit claimed.',
                      observation='Synthetic re-observation for gate test only.', evidence=self.data['shots'][0]['evidence'][:1],
                      implementation=[{'path': 'scene.py', 'claim': 'Existing fixture reviewed, not changed.'}])
        self.write()
        review.validate_review(self.context, 'review/motion-review.json', 'report.json')
        self.assertIsNone(review.active_failure(self.context))

    def test_check_review_failure_registers_history_without_an_explicit_predecessor(self):
        self.completed_fixture()
        self.data['checks']['expression_gaze'].update(status='needs_repair', observation='Synthetic expression failure.')
        self.write()
        with self.assertRaisesRegex(ValueError, 'needs repair'):
            review.validate_review(self.context, 'review/motion-review.json', 'report.json')
        self.assertIsNotNone(review.active_failure(self.context))
        automatic = 'failed-check-' + self._testMethodName
        review.build_pack(self.context, 'report.json', automatic)
        pack = review.read(self.base / automatic / 'motion-review.json')
        self.assertEqual([r['issue'] for r in pack['repair_log']], ['check:expression_gaze'])

    def test_implementation_repair_requires_the_claimed_source_change_and_new_render(self):
        self.completed_fixture()
        old = copy.deepcopy(self.data)
        old['checks']['space_depth'].update(status='needs_repair', observation='Synthetic spatial failure.')
        review.save(self.base / 'source-change-rejection.json', old)
        review.remember_failure(self.context, 'source-change-rejection.json', old)
        candidate = self.base / 'repaired-preview.mp4'
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(self.base / 'preview.mp4'),
                        '-vf', 'hflip', '-c:v', 'libx264', '-c:a', 'copy', str(candidate)], check=True)
        scene = self.base / 'scene.py'; source = scene.read_text()
        try:
            scene.write_text(source + '# Actual changed implementation in the isolated test.\n')
            self.context.fingerprint = 'changed-fingerprint'
            self.context.inputs['scene.py'] = review.sha(scene)
            report = review.read(self.base / 'report.json')
            report.update(fingerprint=self.context.fingerprint, video='repaired-preview.mp4', video_sha256=review.sha(candidate))
            review.save(self.base / 'repaired-report.json', report)
            fresh = 'source-changed-' + self._testMethodName
            review.build_pack(self.context, 'repaired-report.json', fresh)
            self.data = review.read(self.base / fresh / 'motion-review.json')
            self.completed_fixture()
            repair = self.data['repair_log'][0]
            repair.update(status='pass', change='Synthetic changed code and newly encoded test pixels.',
                          observation='Synthetic gate test only, not a media quality verdict.',
                          evidence=self.data['shots'][0]['evidence'][:1],
                          implementation=[{'path': 'scene.py', 'claim': 'The actual changed fixture file.'}])
            self.write()
            review.validate_review(self.context, 'review/motion-review.json', 'repaired-report.json')
            self.assertIsNone(review.active_failure(self.context))
        finally:
            scene.write_text(source)

    def test_still_or_plan_alone_cannot_certify_motion(self):
        self.completed_fixture()
        self.data['checks']['camera_purpose']['evidence'] = [self.data['shots'][0]['evidence'][1]]
        with self.assertRaisesRegex(ValueError, 'actual shot playback'):
            self.validate()

    def test_reference_comparison_is_required(self):
        self.completed_fixture()
        self.data['checks']['body_action']['evidence'] = [self.data['shots'][0]['evidence'][0]]
        with self.assertRaisesRegex(ValueError, 'actual reference playback'):
            self.validate()

    def test_limb_weight_cannot_pass_without_scale_comparison_and_both_decoded_frames(self):
        self.completed_fixture()
        row = self.data['checks']['limb_line_weight']
        row['comparison_basis'] = ''
        with self.assertRaisesRegex(ValueError, 'matched-head-width'):
            self.validate()
        self.completed_fixture()
        row = self.data['checks']['limb_line_weight']
        row['evidence'] = [self.data['shots'][0]['evidence'][0], self.data['reference_clips'][0]['evidence'],
                           self.data['shots'][0]['evidence'][1]]
        with self.assertRaisesRegex(ValueError, 'decoded candidate and primary-reference'):
            self.validate()
        self.completed_fixture()
        self.data['checks']['limb_line_weight'].update(status='not_applicable', reason='Ignore thinner arms.')
        with self.assertRaisesRegex(ValueError, 'cannot be skipped'):
            self.validate()

    def test_every_shot_and_prior_rejection_need_review(self):
        self.completed_fixture()
        self.data['shots'][0]['status'] = 'pending'
        with self.assertRaisesRegex(ValueError, 'Shot action/camera'):
            self.validate()
        self.completed_fixture()
        self.data['regressions'][0]['status'] = 'needs_repair'
        with self.assertRaisesRegex(ValueError, 'not repaired'):
            self.validate()

    def test_changed_evidence_or_source_invalidates_review(self):
        self.completed_fixture()
        path = self.base / 'review/shot-00-0.png'
        original = path.read_bytes()
        try:
            path.write_bytes(original + b'changed')
            with self.assertRaisesRegex(ValueError, 'evidence missing/changed'):
                self.validate()
        finally:
            path.write_bytes(original)
        self.context.fingerprint = 'changed'
        with self.assertRaisesRegex(ValueError, 'changed inputs/ratio'):
            self.validate()

    def test_required_capability_and_implementation_cannot_be_skipped(self):
        self.completed_fixture()
        self.data['checks']['space_depth'].update(status='not_applicable', reason='Trying to skip.')
        with self.assertRaisesRegex(ValueError, 'cannot be skipped'):
            self.validate()
        self.completed_fixture()
        self.data['checks']['space_depth']['implementation'] = [{'path': 'unread-source.py', 'claim': 'A label only.'}]
        with self.assertRaisesRegex(ValueError, 'fingerprinted input'):
            self.validate()

    def test_new_genuine_decision_archives_previous_ledger(self):
        self.completed_fixture()
        args = SimpleNamespace(command='approve', project=str(self.base), ratio='16:9', report='report.json',
                               note='Synthetic earlier decision', review='review/motion-review.json')
        with patch.object(runtime, 'load', return_value=self.context), patch.object(runtime, 'verified_module', return_value=review):
            runtime.run(args)
            first=(self.base/'approval-16x9.json').read_bytes()
            args.note='Synthetic replacement decision'
            runtime.run(args)
            current=review.read(self.base/'approval-16x9.json')
            self.assertEqual((self.base/current['supersedes']).read_bytes(),first)
            self.assertEqual(current['note'],args.note)
    def test_approve_requires_creative_review_and_render_rechecks_it(self):
        args = SimpleNamespace(command='approve', project=str(self.base), ratio='16:9', report='report.json',
                               note='Synthetic test-only user-decision fixture', review=None)
        with patch.object(runtime, 'load', return_value=self.context), patch.object(runtime, 'verified_module', return_value=review):
            with self.assertRaisesRegex(ValueError, 'Creative motion review required'):
                runtime.run(args)
            self.completed_fixture()
            args.review = 'review/motion-review.json'
            runtime.run(args)
            self.data['checks']['space_depth']['status'] = 'needs_repair'
            self.write()
            args.command = 'render'
            args.trusted_code = True
            args.start = 0
            args.seconds = 1
            with self.assertRaisesRegex(ValueError, 'review missing/changed'):
                runtime.run(args)


if __name__ == '__main__':
    unittest.main()
