"""Drawing task completeness and story-specific state ordering; no API calls."""
import copy
import pathlib
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from b8_drawing_jobs import build_jobs


class DrawingJobsTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='b8-drawing-jobs-')
        self.addCleanup(self.temp.cleanup)
        self.base = pathlib.Path(self.temp.name).resolve()
        for name in ('style.png', 'messenger.png', 'queen.png', 'ring.png'):
            (self.base / name).write_bytes(b'local fixture; exporter verifies actual file presence only')
        self.d = {'drawing_family': {'references': ['style.png']}, 'assets': {},
                  'characters': [
                      {'id': 'messenger', 'identity': {'cloak': 'teal'}, 'regions': {'skin': 'olive'}, 'references': ['messenger.png']},
                      {'id': 'queen', 'identity': {'robe': 'plum'}, 'regions': {'skin': 'brown'}, 'references': ['queen.png']}],
                  'shots': [{'id': '01', 'scene': 'underworld gate', 'framing': 'two-shot',
                             'information_change': 'queen cancels closing the gate',
                             'action': 'the already gripping hand releases the ring',
                             'reaction': 'queen looks toward the messenger',
                             'contact_audit': 'ordinary release, no magical transformation',
                             'characters': ['messenger', 'queen'], 'contacts': [], 'layers': []}]}

    def jobs(self):
        return build_jobs(self.d, self.base, 'B8 SHARED FAMILY')['jobs']

    def test_every_role_has_real_common_refs_and_cast_keeps_own_identity(self):
        original = copy.deepcopy(self.d)
        jobs = self.jobs()
        self.assertEqual([j['kind'] for j in jobs], ['cel', 'cel', 'background'])
        self.assertEqual([j['id'] for j in jobs[:2]], ['01-messenger', '01-queen'])
        self.assertNotEqual(jobs[0]['identity'], jobs[1]['identity'])
        for job in jobs:
            self.assertIn(str(self.base / 'style.png'), job['reference_paths'])
            self.assertTrue(all(pathlib.Path(p).is_file() for p in job['reference_paths']))
            self.assertIn('B8 SHARED FAMILY', job['prompt'])
            self.assertFalse(job['tool_call_started'])
        self.assertIn(str(self.base / 'queen.png'), jobs[1]['reference_paths'])
        self.assertEqual(self.d, original)

    def test_characterless_shot_still_has_environment_and_contact_prop(self):
        shot = self.d['shots'][0]
        shot['characters'] = []
        shot['contacts'] = [{'object': 'bronze ring', 'before': 'already held', 'after': 'hangs vertically'}]
        jobs = self.jobs()
        self.assertEqual([j['kind'] for j in jobs], ['background', 'prop'])
        self.assertEqual(jobs[1]['prop_id'], 'bronze ring')
        self.assertTrue(all(str(self.base / 'style.png') in j['reference_paths'] for j in jobs))

    def test_release_fallback_does_not_invent_approach_or_contact(self):
        self.d['shots'][0]['contacts'] = [{'object': 'ring', 'character_id': 'queen',
                                          'before': 'fingers already grip the ring',
                                          'after': 'fingers release; whole forearm retracts'}]
        jobs = self.jobs()
        queen = next(j for j in jobs if j.get('character_id') == 'queen')
        self.assertIn('already grip', queen['states_to_draw'][0])
        self.assertIn('retracts', queen['states_to_draw'][1])
        self.assertNotIn('approach', queen['states_to_draw'])
        self.assertNotIn('contact', queen['states_to_draw'])
        messenger = next(j for j in jobs if j.get('character_id') == 'messenger')
        self.assertEqual(messenger['states_to_draw'][0], self.d['shots'][0]['action'])

    def test_explicit_role_states_and_contact_states_preserve_order(self):
        shot = self.d['shots'][0]
        shot['contacts'] = [{'object': 'ring', 'states_to_draw': ['already gripped', 'open fingers', 'withdraw whole arm']}]
        shot['drawing_states'] = {'characters': {'queen': ['held pose', 'released pose']},
                                  'background': ['door remains at its old angle'],
                                  'props': {'ring': ['ring tilted', 'ring hanging']}}
        jobs = self.jobs()
        self.assertEqual(jobs[0]['states_to_draw'], ['already gripped', 'open fingers', 'withdraw whole arm'])
        self.assertEqual(jobs[1]['states_to_draw'], ['held pose', 'released pose'])
        self.assertEqual(jobs[2]['states_to_draw'], ['door remains at its old angle'])
        self.assertEqual(jobs[3]['states_to_draw'], ['ring tilted', 'ring hanging'])

    def test_prop_sources_deduplicate_and_reuse_existing_local_asset(self):
        shot = self.d['shots'][0]
        self.d['assets']['bronze-ring'] = {'path': 'ring.png', 'kind': 'prop', 'description': 'bronze ring'}
        shot['props'] = [{'id': 'bronze-ring', 'description': 'bronze ring',
                          'states_to_draw': ['tilted', 'vertical']}]
        shot['contacts'] = [{'object': 'bronze ring', 'before': 'tilted', 'after': 'vertical'}]
        shot['layers'] = [{'asset': 'bronze-ring'}]
        props = [j for j in self.jobs() if j['kind'] == 'prop']
        self.assertEqual(len(props), 1)
        self.assertEqual(props[0]['states_to_draw'], ['tilted', 'vertical'])
        self.assertEqual(props[0]['reuse_candidates'], ['bronze-ring'])
        self.assertIn(str(self.base / 'ring.png'), props[0]['reference_paths'])

    def test_missing_or_escaping_reference_and_invalid_states_rejected(self):
        self.d['drawing_family']['references'] = ['missing.png']
        with self.assertRaisesRegex(ValueError, 'Missing'):
            self.jobs()
        self.d['drawing_family']['references'] = ['../style.png']
        with self.assertRaisesRegex(ValueError, 'contained'):
            self.jobs()
        self.d['drawing_family']['references'] = ['style.png']
        self.d['shots'][0]['drawing_states'] = {'characters': {'queen': [3]}}
        with self.assertRaisesRegex(ValueError, 'explicit text'):
            self.jobs()


if __name__ == '__main__':
    unittest.main()
