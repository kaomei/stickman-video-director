"""Exercise the real new-story entry, not the V90-only reproduction command."""
from pathlib import Path
import hashlib,importlib.util,json,shutil,subprocess,tempfile,unittest
from types import SimpleNamespace
ROOT=Path(__file__).resolve().parents[1]
s=importlib.util.spec_from_file_location('production_runtime',ROOT/'scripts/b6_production.py');runtime=importlib.util.module_from_spec(s);s.loader.exec_module(runtime)

class Production(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp=tempfile.TemporaryDirectory(prefix='b6-production-contract-');cls.base=Path(cls.tmp.name)/'project'
        subprocess.run(['node',str(ROOT/'scripts/autopilot.mjs'),'init',str(cls.base),'--style','B6','--ratio','16:9'],check=True,capture_output=True)
        subprocess.run(['python3',str(ROOT/'scripts/b6_production_example.py'),str(cls.base)],check=True,capture_output=True)
        cls.original=(cls.base/'project.json').read_bytes()
    @classmethod
    def tearDownClass(cls):cls.tmp.cleanup()
    def tearDown(self):(self.base/'project.json').write_bytes(self.original)
    def test_variable_duration_and_actual_narration(self):
        c=runtime.load(self.base,'16:9');self.assertEqual(c.project['duration'],7.5);self.assertEqual(len(c.plan['shots']),3)
    def test_validate_never_imports_authored_scene(self):
        p=self.base/'scene.py';original=p.read_bytes()
        try:
            p.write_text('raise RuntimeError("validation executed scene")\n')
            with self.assertRaisesRegex(ValueError,'Frozen source-reuse scene changed'):
                runtime.load(self.base,'16:9')
        finally:p.write_bytes(original)
    def test_frozen_source_example_cannot_be_promoted_to_a_new_story_export(self):
        p=json.loads(self.original);p.pop('technical_fixture',None);p.pop('purpose',None)
        p['review']={'status':'approved','art':'Reviewed','acting':'Reviewed','sound':'Reviewed'}
        (self.base/'project.json').write_text(json.dumps(p))
        self.assertEqual(runtime.load(self.base,'16:9').purpose,'example-reproduction')
        for command in ('approve','render'):
            args=SimpleNamespace(command=command,project=str(self.base),ratio='16:9')
            with self.assertRaisesRegex(ValueError,'technical-only / example-only'):
                runtime.run(args)
        self.assertFalse((self.base/'approval-16x9.json').exists())
    def test_explicit_frozen_example_still_renders_its_actual_diagnostic_frame(self):
        out=self.base/'outputs/process-scope-example'
        r=subprocess.run(['python3',str(self.base/'run.py'),'frames',str(self.base),
                          '--ratio','16:9','--trusted-code','--seconds',str(1/30),
                          '--output',str(out.relative_to(self.base))],capture_output=True,text=True)
        self.assertEqual(r.returncode,0,r.stderr)
        report=json.loads((out/'report.json').read_text())
        self.assertEqual(report['purpose'],'example-reproduction')
        self.assertTrue(report['technical_fixture']);self.assertFalse(report['delivery_ready'])
        self.assertTrue((out/'frame-0000.png').is_file())
    def test_voice_acceleration_is_rejected(self):
        p=json.loads(self.original);p['voice']['speed']=1.1;(self.base/'project.json').write_text(json.dumps(p))
        with self.assertRaisesRegex(ValueError,'original-speed'):runtime.load(self.base,'16:9')
    def test_tampered_engine_is_rejected_without_execution(self):
        f=self.base/'engine/run.py';original=f.read_bytes()
        try:
            f.write_text('raise RuntimeError("tampered executable imported")\n')
            with self.assertRaisesRegex(ValueError,'Locked engine changed'):runtime.load(self.base,'16:9')
        finally:f.write_bytes(original)
    def test_wrong_native_plan_cannot_relabel_landscape(self):
        f=self.base/'formats/landscape.json';original=f.read_bytes()
        try:
            p=json.loads(original);p['native_design']='9:16';f.write_text(json.dumps(p))
            with self.assertRaisesRegex(ValueError,'Separate native'):runtime.load(self.base,'16:9')
        finally:f.write_bytes(original)
    def test_review_and_space_helpers_are_fingerprinted_even_if_omitted_from_inputs(self):
        p=json.loads(self.original);p['inputs']=[];(self.base/'project.json').write_text(json.dumps(p))
        before=runtime.load(self.base,'16:9');f=self.base/'b6_space.py';original=f.read_bytes()
        try:
            self.assertIn('motion_review.py',before.inputs);self.assertIn('b6_space.py',before.inputs)
            f.write_bytes(original+b'\n# Changed projection implementation\n')
            self.assertNotEqual(runtime.load(self.base,'16:9').fingerprint,before.fingerprint)
        finally:f.write_bytes(original)
    def test_caption_renderer_is_always_fingerprinted_and_changed_helper_invalidates_review(self):
        p=json.loads(self.original);p['inputs']=[];(self.base/'project.json').write_text(json.dumps(p))
        before=runtime.load(self.base,'16:9');f=self.base/'caption_renderer.py';original=f.read_bytes()
        try:
            self.assertIn('caption_renderer.py',before.inputs)
            f.write_bytes(original+b'\n# Caption implementation changed\n')
            # Installed validation uses its own trusted caption helper but still pins the project copy.
            self.assertNotEqual(runtime.load(self.base,'16:9').fingerprint,before.fingerprint)
            spec=importlib.util.spec_from_file_location('b6_edited_caption_project',self.base/'run.py')
            project_runtime=importlib.util.module_from_spec(spec);spec.loader.exec_module(project_runtime)
            with self.assertRaisesRegex(ValueError,'Untrusted caption runtime changed'):
                project_runtime.load(self.base,'16:9')
        finally:f.write_bytes(original)
    def test_selected_public_caption_font_is_pinned_even_if_inputs_omits_it(self):
        p=json.loads(self.original);p['inputs']=[];(self.base/'project.json').write_text(json.dumps(p))
        c=runtime.load(self.base,'16:9')
        self.assertEqual(c.plan['caption']['profile'],'b6-landscape-native-archivo-black-v1')
        self.assertIn('fonts/ArchivoBlack.ttf',c.inputs)
        self.assertEqual(c.inputs['fonts/ArchivoBlack.ttf'],c.plan['caption']['font_sha256'])
    def test_portrait_load_rejects_42px_bottom180_and_legacy_raster_settings(self):
        file=self.base/'formats/landscape.json';original=file.read_bytes();project=json.loads(self.original)
        project['formats']={'9:16':'formats/landscape.json'}
        # This test checks portrait caption data, not permission to relabel the frozen source performance.
        project['character_system']={'schema':'b6-character-system/1','registry':'characters.json'}
        (self.base/'project.json').write_text(json.dumps(project))
        try:
            plan=json.loads(original);plan.update(ratio='9:16',native_design='9:16',width=720,height=1280,cast_inventory=[])
            profile=runtime.caption_helper().default_profile('9:16',720,1280,'archivo-black')
            plan['caption']=profile;file.write_text(json.dumps(plan))
            self.assertEqual(runtime.load(self.base,'9:16').plan['caption']['baseline'],914)
            for key,value in [('font_size',42),('bottom',180),('anchor','mm'),('fill','#fffdf8'),('supersampling',1)]:
                with self.subTest(key=key):
                    plan['caption']={**profile,key:value};file.write_text(json.dumps(plan))
                    with self.assertRaisesRegex(ValueError,'caption|Caption'):runtime.load(self.base,'9:16')
        finally:file.write_bytes(original)
    def test_legacy_source_scene_overlay_is_rejected_even_when_draw_would_run(self):
        file=self.base/'scene.py';original=file.read_bytes()
        try:
            file.write_bytes(original+b'\n# Added overlay after the source draw\n')
            with self.assertRaisesRegex(ValueError,'Frozen source-reuse scene changed'):
                runtime.load(self.base,'16:9')
        finally:file.write_bytes(original)
    def test_legacy_native_plan_must_match_the_installed_fixture(self):
        file=self.base/'formats/landscape.json';original=file.read_bytes()
        try:
            plan=json.loads(original);plan['shots'][0]['composition']='New actor overlay instead of the source performance';file.write_text(json.dumps(plan))
            with self.assertRaisesRegex(ValueError,'Frozen source-reuse native_plan changed'):
                runtime.load(self.base,'16:9')
        finally:file.write_bytes(original)
    def test_legacy_engine_cannot_self_authorize_a_changed_performance(self):
        import hashlib
        helper=self.base/'engine/run.py';manifest=self.base/'engine/manifest.json'
        old_helper=helper.read_bytes();old_manifest=manifest.read_bytes()
        try:
            helper.write_bytes(old_helper+b'\n# New performance code\n')
            data=json.loads(old_manifest);data['files']['run.py']=hashlib.sha256(helper.read_bytes()).hexdigest();manifest.write_text(json.dumps(data))
            with self.assertRaisesRegex(ValueError,'Frozen source-reuse engine_manifest changed'):
                runtime.load(self.base,'16:9')
        finally:helper.write_bytes(old_helper);manifest.write_bytes(old_manifest)
    def test_frozen_source_core_keeps_locally_provisioned_fonts_pinned(self):
        import hashlib
        public=json.loads((ROOT/'assets/b6/hong-kong-v90/manifest.json').read_text())
        manifest=self.base/'engine/manifest.json';old_manifest=manifest.read_bytes()
        installed=json.loads(old_manifest)
        self.assertEqual(len(public['files']),85)
        provenance=json.loads((self.base/'engine/font-provenance.json').read_text())
        license_by_font={'NotoSans.ttf':'source/fonts/OFL-NotoSans.txt','Nunito.ttf':'source/fonts/OFL-Nunito.txt'}
        licenses={license_by_font[row['fallback_font']] for row in provenance['fonts'] if row['kind']=='open-fallback'}
        self.assertEqual(len(installed['files']),89+len(licenses))
        self.assertEqual(set(installed['files'])-set(public['files']),runtime.LOCAL_FONT_MANIFEST_FILES|licenses)
        before=runtime.load(self.base,'16:9')
        self.assertEqual(runtime.frozen_engine_manifest_sha(manifest),runtime.FROZEN_V90_EXAMPLE_SHA256['engine_manifest'])
        font=self.base/'engine/source/fonts/Arial.ttf';old_font=font.read_bytes()
        try:
            font.write_bytes(old_font+b'\nchanged local font\n')
            with self.assertRaisesRegex(ValueError,'Locked engine changed: source/fonts/Arial.ttf'):
                runtime.load(self.base,'16:9')
            installed['files']['source/fonts/Arial.ttf']=hashlib.sha256(font.read_bytes()).hexdigest()
            manifest.write_text(json.dumps(installed))
            # A deliberately re-pinned local font is allowed, but invalidates
            # existing pixel/audio review through the full manifest fingerprint.
            self.assertNotEqual(runtime.load(self.base,'16:9').fingerprint,before.fingerprint)
        finally:font.write_bytes(old_font);manifest.write_bytes(old_manifest)
    def test_missing_local_font_pin_cannot_bypass_frozen_engine_integrity(self):
        manifest=self.base/'engine/manifest.json';original=manifest.read_bytes()
        try:
            data=json.loads(original);data['files'].pop('source/fonts/Arial.ttf')
            manifest.write_text(json.dumps(data))
            with self.assertRaisesRegex(ValueError,'font/provenance entries required'):
                runtime.load(self.base,'16:9')
        finally:manifest.write_bytes(original)
    def test_authoring_must_explicitly_inventory_even_background_cast(self):
        file=self.base/'formats/landscape.json';original=file.read_bytes()
        try:
            plan=json.loads(original);self.assertGreater(len(plan['cast_inventory']),2)
            plan.pop('cast_inventory');file.write_text(json.dumps(plan))
            with self.assertRaisesRegex(ValueError,'Explicit native cast_inventory'):runtime.load(self.base,'16:9')
        finally:file.write_bytes(original)


class FallbackLicenseIntegrity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp=tempfile.TemporaryDirectory(prefix='b6-fallback-license-')
        cls.addClassCleanup(cls.tmp.cleanup)
        cls.base=Path(cls.tmp.name)/'project'
        script='import {initProduction} from '+json.dumps((ROOT/'scripts/b6-production.mjs').as_uri())+'; initProduction(process.argv[1], "16:9", {fontDir:process.argv[2], systemDirs:[]});'
        subprocess.run(['node','--input-type=module','-e',script,str(cls.base),str(Path(cls.tmp.name)/'no-fonts')],check=True,capture_output=True)
        subprocess.run(['python3',str(ROOT/'scripts/b6_production_example.py'),str(cls.base)],check=True,capture_output=True)
    def test_fallback_license_bytes_and_manifest_pins_preserve_frozen_core(self):
        engine=self.base/'engine';manifest=json.loads((engine/'manifest.json').read_text())
        provenance=json.loads((engine/'font-provenance.json').read_text())
        self.assertTrue(all(row['kind']=='open-fallback' for row in provenance['fonts']))
        self.assertEqual(len(manifest['files']),91)
        for name in ['OFL-NotoSans.txt','OFL-Nunito.txt']:
            rel='source/fonts/'+name;expected=(ROOT/'assets/fonts'/name).read_bytes()
            self.assertEqual((engine/rel).read_bytes(),expected)
            self.assertEqual(manifest['files'][rel],hashlib.sha256(expected).hexdigest())
            for row in provenance['fonts']:
                if row['license_path']==rel:self.assertEqual(row['license_sha256'],manifest['files'][rel])
        self.assertEqual(runtime.frozen_engine_manifest_sha(engine/'manifest.json'),runtime.FROZEN_V90_EXAMPLE_SHA256['engine_manifest'])
        self.assertEqual(runtime.load(self.base,'16:9').project['duration'],7.5)
    def test_exported_license_change_missing_file_or_missing_pin_is_rejected(self):
        engine=self.base/'engine';manifest=engine/'manifest.json';old_manifest=manifest.read_bytes()
        rel='source/fonts/OFL-NotoSans.txt';license=engine/rel;original=license.read_bytes()
        for change in ['tamper','delete','unpin']:
            with self.subTest(change=change):
                try:
                    if change=='tamper':license.write_bytes(original+b'\ntampered\n')
                    elif change=='delete':license.unlink()
                    else:
                        data=json.loads(old_manifest);data['files'].pop(rel);manifest.write_text(json.dumps(data))
                    with self.assertRaisesRegex(ValueError,'license|OFL|Locked engine changed|Missing/escaped'):
                        runtime.load(self.base,'16:9')
                finally:license.write_bytes(original);manifest.write_bytes(old_manifest)
    def test_unlisted_font_directory_content_cannot_bypass_the_frozen_core(self):
        engine=self.base/'engine';manifest=engine/'manifest.json';original=manifest.read_bytes()
        rel='source/fonts/unreviewed.py';extra=engine/rel
        try:
            extra.write_text('raise RuntimeError("must not execute")\n')
            data=json.loads(original);data['files'][rel]=hashlib.sha256(extra.read_bytes()).hexdigest();manifest.write_text(json.dumps(data))
            self.assertNotEqual(runtime.frozen_engine_manifest_sha(manifest),runtime.FROZEN_V90_EXAMPLE_SHA256['engine_manifest'])
            with self.assertRaisesRegex(ValueError,'Frozen source-reuse engine_manifest changed'):
                runtime.load(self.base,'16:9')
        finally:extra.unlink();manifest.write_bytes(original)


class CharacterSystemBoundaries(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix='b6-character-boundary-');self.base=Path(self.tmp.name).resolve()
        shutil.copyfile(ROOT/'scripts/b6_puppet.py',self.base/'b6_puppet.py')
        self.registry={'schema':'b6-character-registry/1','actors':[],'rigid_cast':[]}
        self.project={'version':2,'character_system':{'schema':'b6-character-system/1','registry':'characters.json'}}
        self.write_registry()
    def tearDown(self):self.tmp.cleanup()
    def write_registry(self):(self.base/'characters.json').write_text(json.dumps(self.registry))
    def test_modified_character_runtime_never_executes_during_data_validation(self):
        marker=self.base/'untrusted-executed'
        (self.base/'b6_puppet.py').write_text('from pathlib import Path\nPath('+repr(str(marker))+').touch()\nraise RuntimeError("untrusted helper executed")\n')
        with self.assertRaisesRegex(ValueError,'Untrusted character runtime changed'):
            runtime.character_registry(self.base,self.project,[])
        self.assertFalse(marker.exists())
    def test_trusted_runtime_ignores_untrusted_matching_timestamp_bytecode(self):
        import marshal,sys
        source=self.base/'b6_puppet.py';stat=source.stat();old_prefix=sys.pycache_prefix
        try:
            sys.pycache_prefix=str(self.base/'cache')
            cache=Path(importlib.util.cache_from_source(str(source)));cache.parent.mkdir(parents=True,exist_ok=True)
            code=compile('raise RuntimeError("cached project code executed")',str(source),'exec')
            header=(importlib.util.MAGIC_NUMBER+(0).to_bytes(4,'little')
                    +int(stat.st_mtime).to_bytes(4,'little')+stat.st_size.to_bytes(4,'little'))
            cache.write_bytes(header+marshal.dumps(code))
            helper,_,_,_=runtime.character_registry(self.base,self.project,[])
            self.assertTrue(callable(helper.load_character))
        finally:sys.pycache_prefix=old_prefix
    def test_version2_cannot_relabel_a_puppet_as_an_unchecked_rigid_extra(self):
        self.registry['rigid_cast']=[{'id':'lead','reason':'A claimed painted extra','source':'background.png'}];self.write_registry()
        with self.assertRaisesRegex(ValueError,'rigid_cast exceptions are unsupported'):
            runtime.character_registry(self.base,self.project,['lead'])
    def test_genuinely_unpeopled_registry_keeps_strict_render_result_runtime(self):
        helper,characters,registry,files=runtime.character_registry(self.base,self.project,[])
        self.assertIsNotNone(helper);self.assertEqual(characters,{})
        self.assertIn('b6_puppet.py',files);self.assertEqual(registry['actors'],[])
    def test_reason_only_legacy_mode_cannot_authorize_a_new_scene(self):
        self.project['character_system']={'schema':'b6-character-system/1','mode':'locked-v90-performance','reason':'A reason is not a source fingerprint'}
        with self.assertRaisesRegex(ValueError,'installed frozen 7.5s landscape'):
            runtime.character_registry(self.base,self.project,['new-lead'])
    def test_unknown_character_system_mode_is_rejected(self):
        self.project['character_system']['mode']='skip-character-checks'
        with self.assertRaisesRegex(ValueError,'Unknown character-system mode'):
            runtime.character_registry(self.base,self.project,[])
    def register_keeper(self):
        package=self.base/'characters/keeper';shutil.copytree(ROOT/'assets/b6/characters/kiosk_keeper',package)
        self.registry['actors']=[{'id':'keeper','package':'characters/keeper','views':['front']}];self.write_registry()
        return package
    def test_new_projects_require_real_neck_attachment_contract(self):
        self.register_keeper()
        with self.assertRaisesRegex(ValueError,'painted head/neck attachment mounts'):
            runtime.character_registry(self.base,self.project,['keeper'])
    def test_legacy_projects_retain_old_painted_package_compatibility(self):
        self.register_keeper();self.project['version']=1
        _,characters,_,_=runtime.character_registry(self.base,self.project,['keeper'])
        self.assertEqual(characters['keeper'].binding_version,1)
    def test_new_project_accepts_verified_painted_neck_mount(self):
        package=self.register_keeper();path=package/'package.json';doc=json.loads(path.read_text())
        doc['binding_version']=2;doc['views']={'front':doc['views']['front']}
        doc['views']['front']['neck_attachment']={'mount_polygon':[[-8,-255],[8,-255],[8,-252],[-8,-252]],
            'min_overlap_fraction':.70,'min_overlap_thickness':2.}
        path.write_text(json.dumps(doc))
        _,characters,_,_=runtime.character_registry(self.base,self.project,['keeper'])
        self.assertEqual(characters['keeper'].binding_version,2)


class NewSceneContacts(unittest.TestCase):
    def setUp(self):
        self.contract={'coverage':[[]], 'contact_coverage':[['bill-receive']]}
        self.rows=[{'name':'bill-receive','hand':[100,200],'grip':[100,200]}]
        self.scene=SimpleNamespace(contacts=lambda:self.rows)
    def test_new_prop_contact_is_checked(self):
        self.assertEqual(runtime.authored_contacts(self.scene,0,self.contract),[0])
        self.rows[0]['grip'][0]+=2
        with self.assertRaisesRegex(ValueError,'disconnected'):runtime.authored_contacts(self.scene,0,self.contract)
    def test_missing_contact_cannot_pass_v90_inherited_log(self):
        self.rows.clear()
        with self.assertRaisesRegex(ValueError,'Missing'):runtime.authored_contacts(self.scene,0,self.contract)
    def test_duplicated_contact_is_rejected(self):
        self.rows.append(self.rows[0])
        with self.assertRaisesRegex(ValueError,'duplicated'):runtime.authored_contacts(self.scene,0,self.contract)
    def test_mixed_source_draw_does_not_skip_new_prop_contact(self):
        engine=SimpleNamespace(used_source_draw=True,context=SimpleNamespace(project={'bindings':'new-bindings.json'}))
        self.rows[0]['grip'][0]+=2
        with self.assertRaisesRegex(ValueError,'disconnected'):
            runtime.frame_contacts(engine,self.scene,0,self.contract)

class CaptionSidecars(unittest.TestCase):
    def test_partial_preview_clips_times_without_splitting_caption_text(self):
        with tempfile.TemporaryDirectory() as tmp:
            out=Path(tmp)
            cues=[{'start':1,'end':3,'text':'One whole phrase.'},{'start':3.4,'end':4.8,'text':'Next thought.'},{'start':6,'end':7,'text':'Outside.'}]
            runtime.caption_sidecars(out,cues,2,4)
            srt=(out/'captions.srt').read_text();vtt=(out/'captions.vtt').read_text()
            self.assertIn('00:00:00,000 --> 00:00:01,000\nOne whole phrase.',srt)
            self.assertIn('00:00:01,400 --> 00:00:02,000\nNext thought.',srt)
            self.assertNotIn('Outside.',srt)
            self.assertTrue(vtt.startswith('WEBVTT\n'));self.assertIn('00:00:01.400 --> 00:00:02.000',vtt)

if __name__=='__main__':unittest.main()
