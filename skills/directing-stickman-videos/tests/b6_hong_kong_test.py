"""Fault-injection tests of the actual painted V90 rig, not a mock skeleton."""
from pathlib import Path
import copy,importlib.util,json,subprocess,tempfile,unittest,sys
ROOT=Path(__file__).resolve().parents[1];PACK=ROOT/'assets/b6/hong-kong-v90'
spec=importlib.util.spec_from_file_location('portable_hk',ROOT/'scripts/b6_hong_kong.py');runtime=importlib.util.module_from_spec(spec);spec.loader.exec_module(runtime)

class V90BindingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp=tempfile.TemporaryDirectory(prefix='b6-hong-kong-binding-')
        cls.addClassCleanup(cls.tmp.cleanup)
        cls.base=Path(cls.tmp.name)/'project'
        subprocess.run(['node',str(ROOT/'scripts/autopilot.mjs'),'init',str(cls.base),
                        '--style','B6','--ratio','16:9','--example','hong-kong-v90'],
                       check=True,capture_output=True)
        cls.p,cls.contract,_=runtime.validate(cls.base);cls.m=runtime.import_scene(cls.base,cls.p,cls.contract)
        cls.m.draw(7.2);cls.rows=copy.deepcopy(cls.m.rig.RECORDS)
    def test_all_project_inputs_are_pinned(self):
        public=json.loads((PACK/'manifest.json').read_text())['files']
        installed=json.loads((self.base/'manifest.json').read_text())['files']
        self.assertEqual(len(public),85)
        self.assertFalse(any(rel.startswith('source/fonts/') or rel=='font-provenance.json' for rel in public))
        self.assertFalse(any(p.is_file() for p in (PACK/'source/fonts').rglob('*')))
        provenance=json.loads((self.base/'font-provenance.json').read_text())
        license_by_font={'NotoSans.ttf':'source/fonts/OFL-NotoSans.txt','Nunito.ttf':'source/fonts/OFL-Nunito.txt'}
        licenses={license_by_font[row['fallback_font']] for row in provenance['fonts'] if row['kind']=='open-fallback'}
        self.assertEqual(len(installed),89+len(licenses))
        self.assertEqual(set(installed)-set(public),{'source/fonts/Arial.ttf','source/fonts/ArialBlack.ttf',
                                                   'source/fonts/CourierNewBold.ttf','font-provenance.json'}|licenses)
        self.assertEqual({rel:installed[rel] for rel in public},public)
        self.assertEqual(len(self.contract['coverage']),600)
    def test_real_frame_and_independent_prop_grip(self):
        self.m.draw(7.2);runtime.check_arms(self.m.rig.RECORDS,216,self.contract);runtime.check_contacts(self.m)
    def test_missing_and_duplicate_arm_fail(self):
        for rows in [self.rows[:-1],self.rows+[self.rows[0]]]:
            with self.assertRaisesRegex(ValueError,'missing, duplicate or swapped'):runtime.check_arms(rows,216,self.contract)
    def test_wrong_anatomical_side_fails(self):
        rows=copy.deepcopy(self.rows);rows[0]['side']=1-rows[0]['side']
        with self.assertRaises(ValueError):runtime.check_arms(rows,216,self.contract)
    def test_wrong_elbow_direction_fails_even_with_fixed_3d_lengths(self):
        rows=copy.deepcopy(self.rows);rows[0]['local_chain'][1][0]+=100
        with self.assertRaisesRegex(ValueError,'2D pose envelope'):runtime.check_arms(rows,216,self.contract)
    def test_nonfinite_limb_and_invalid_bone_fail_at_solver(self):
        import numpy as np
        for lengths,wrist in [((78,76),(float('nan'),-110)),((-1,76),(-80,-110))]:
            binding=self.m.rig.Binding('bad',((-44,-221),(59,-221)),lengths)
            with self.assertRaises(AssertionError):self.m.rig.solve(binding,0,wrist,np.eye(3))
    def test_foot_slide_and_nonuniform_actor_scale_fail(self):
        self.m.draw(10.8);rows=copy.deepcopy(self.m.rig.LEGS);runtime.check_legs(rows,self.contract)
        self.assertEqual(len(rows),4)
        for mutate in ['slide','stretch']:
            bad=copy.deepcopy(rows)
            if mutate=='slide':bad[0]['ankle'][0]+=4
            else:bad[0]['anisotropy']=1.2
            with self.assertRaises(ValueError):runtime.check_legs(bad,self.contract)
        with self.assertRaisesRegex(ValueError,'missing or duplicated leg'):runtime.check_legs(rows[:2],self.contract,324)

if __name__=='__main__':unittest.main()
