"""Fresh default production projects cannot promote copied tests/reference media.

These are boundary/codec tests, never claims of B6 creative quality. Real new-
brief drawing, motion and 35-item playback acceptance remain separate evidence.
"""
from pathlib import Path
from types import SimpleNamespace
import hashlib, importlib.util, json, shutil, subprocess, sys, tempfile, unittest
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('b6_isolation_runtime',ROOT/'scripts/b6_production.py')
runtime=importlib.util.module_from_spec(spec);spec.loader.exec_module(runtime)

def read(p):return json.loads(p.read_text())
def save(p,x):p.write_text(json.dumps(x))

class AssetRoles(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp=tempfile.TemporaryDirectory(prefix='b6-role-contract-');cls.addClassCleanup(cls.tmp.cleanup)
        cls.seed=Path(cls.tmp.name)/'seed'
        subprocess.run(['node',str(ROOT/'scripts/autopilot.mjs'),'init',str(cls.seed),'--style','B6','--ratio','16:9'],check=True,capture_output=True)
        subprocess.run(['python3',str(ROOT/'scripts/b6_character_example.py'),str(cls.seed)],check=True,capture_output=True)
    def setUp(self):
        self.base=Path(self.tmp.name)/self.id().split('.')[-1]
        shutil.copytree(self.seed,self.base)
    def project(self):return read(self.base/'project.json')
    def save_project(self,p):save(self.base/'project.json',p)
    def new_content(self):
        # Original unit geometry on purpose: no reference/test art, actors or claims
        # of a reviewed B6 film. This exercises only the allowed production path.
        p=self.project();p.pop('technical_fixture',None);p['purpose']='production';p['version']=2
        p['inputs']=[f for f in p['inputs'] if not f.startswith('art/')]
        p['inputs'].append('art/new-unit-world.png');self.save_project(p)
        save(self.base/'characters.json',{'schema':'b6-character-registry/1','actors':[],'rigid_cast':[]})
        plan=read(self.base/p['formats']['16:9']);plan['cast_inventory']=[];save(self.base/p['formats']['16:9'],plan)
        Image.new('RGB',(1280,720),'#d9aa7c').save(self.base/'art/new-unit-world.png')
        (self.base/'scene.py').write_text("from PIL import Image\ndef frame(t,c):\n    return c.puppet_runtime.render_scene((1280,720),actors=[],background=Image.open(c.base/'art/new-unit-world.png').convert('RGBA'),frame_index=round(t*30))\n")
        return p
    def call(self,command,*args):
        return subprocess.run(['python3',str(self.base/'run.py'),command,str(self.base),'--ratio','16:9',*args],capture_output=True,text=True)
    def test_known_fixture_cannot_upgrade_by_deleting_flags_and_supplying_reviews(self):
        p=self.project();p.pop('technical_fixture',None);p.pop('purpose',None);p['review']={'status':'approved','art':'Reviewed','acting':'Reviewed','sound':'Reviewed'};self.save_project(p)
        c=runtime.load(self.base,'16:9');self.assertEqual(c.purpose,'diagnostic')
        # A report may lie about its role, but the renderer derives it from actual source.
        save(self.base/'fake-report.json',{'kind':'preview','technical_fixture':False,'fingerprint':c.fingerprint})
        save(self.base/'fake-review.json',{'status':'approved'})
        for command in ('approve','render'):
            r=self.call(command,'--trusted-code','--report','fake-report.json','--review','fake-review.json','--note','Fabricated fixture review must not authorize export','--output','outputs/must-not-exist')
            self.assertNotEqual(r.returncode,0);self.assertIn('technical-only',r.stderr)
        self.assertFalse((self.base/'approval-16x9.json').exists());self.assertFalse((self.base/'outputs/must-not-exist').exists())
    def test_known_fixture_preview_is_intrinsically_labelled_after_flag_deletion(self):
        p=self.project();p.pop('technical_fixture',None);p.pop('purpose',None);self.save_project(p)
        r=self.call('frames','--trusted-code','--seconds',str(1/30),'--output','outputs/diagnostic')
        self.assertEqual(r.returncode,0,r.stderr)
        report=read(self.base/'outputs/diagnostic/report.json')
        self.assertEqual(report['purpose'],'diagnostic');self.assertTrue(report['technical_fixture']);self.assertFalse(report['delivery_ready'])
        frame=Image.open(self.base/'outputs/diagnostic/frame-0000.png');self.assertEqual(frame.getpixel((0,0)),(57,47,47))
    def test_renamed_reference_bytes_are_rejected_as_story_inputs(self):
        p=self.new_content();dest=self.base/'art/not-a-reference.bin';shutil.copyfile(ROOT/'assets/b6/reference/eiffel-portrait-v44.mp4',dest)
        p['inputs'].append('art/not-a-reference.bin');self.save_project(p)
        with self.assertRaisesRegex(ValueError,'Protected B6.*not-a-reference.bin'):runtime.load(self.base,'16:9')
    def test_changed_fixture_code_and_removed_flags_do_not_release_its_old_paint(self):
        p=self.project();p['version']=2;p.pop('technical_fixture',None);p.pop('purpose',None);self.save_project(p)
        with (self.base/'scene.py').open('a') as f:f.write('\n# Relabelled as a new story\n')
        with self.assertRaisesRegex(ValueError,'Protected B6.*production inputs'):runtime.load(self.base,'16:9')
    def test_copied_demo_character_art_is_checked_even_when_not_declared_in_inputs(self):
        p=self.project();p['version']=2;p.pop('technical_fixture',None);p.pop('purpose',None);p['inputs']=[f for f in p['inputs'] if not f.startswith('art/')];self.save_project(p)
        (self.base/'scene.py').write_text('# A new name or story does not make bundled character test art new production art\n')
        with self.assertRaisesRegex(ValueError,'Protected B6.*characters/'):runtime.load(self.base,'16:9')
    def test_original_story_inputs_and_compare_only_style_reference_still_work(self):
        self.new_content();c=runtime.load(self.base,'16:9')
        self.assertEqual(c.purpose,'production');self.assertEqual(c.protected_inputs,[])
        self.assertIn(read(self.base/'quality-target.json')['reference']['path'],c.inputs)
        for command in ('frames','preview'):
            out='outputs/new-content-'+command
            r=self.call(command,'--trusted-code','--seconds',str(1/30),'--output',out)
            self.assertEqual(r.returncode,0,r.stderr)
            report=read(self.base/out/'report.json');self.assertEqual(report['purpose'],'production');self.assertFalse(report['technical_fixture'])
            self.assertFalse(report['delivery_ready'],'Numeric unit frames are not a creative pass')
            if command=='preview':
                self.assertTrue((self.base/out/'preview.mp4').is_file(),'Trusted runner encoder/muxer must remain available outside scene execution')
    def test_compare_only_reference_cannot_be_loaded_by_the_story_scene(self):
        self.new_content();ref=read(self.base/'quality-target.json')['reference']['path']
        (self.base/'scene.py').write_text("def frame(t,c):\n    (c.base/"+repr(ref)+").read_bytes()\n    return c.puppet_runtime.render_scene((1280,720),actors=[],frame_index=round(t*30))\n")
        r=self.call('frames','--trusted-code','--seconds',str(1/30),'--output','outputs/forbidden')
        self.assertNotEqual(r.returncode,0);self.assertIn('Protected B6 reference/example/test media',r.stderr)
        self.assertFalse((self.base/'outputs/forbidden/frame-0000.png').exists())
    def test_external_reference_and_pillow_media_cannot_hide_behind_extensions(self):
        self.new_content()
        outside=Path(self.tmp.name)/'outside-media';outside.mkdir(exist_ok=True)
        source=ROOT/'assets/b6/paint/paris-panorama.png'
        cases=[]
        for name in ('copied.jpeg','copied.webp','copied-without-extension','copied.asset'):
            target=outside/name;shutil.copyfile(source,target);cases.append(target)
        # Fresh non-reference art exercises Pillow content detection, not a
        # known hash or the usual PNG/JPEG suffix path.
        for fmt,name in (('PPM','fresh-pillow-image.data'),('BMP','fresh-bitmap'),
                         ('TIFF','fresh-image.pyc'),('GIF','fresh-image.asset')):
            fresh=outside/name
            Image.new('RGB',(37,29),'#58a7b3').save(fresh,format=fmt);cases.append(fresh)
        for i,target in enumerate(cases):
            with self.subTest(path=target.name):
                (self.base/'scene.py').write_text("from PIL import Image\ndef frame(t,c):\n    im=Image.open("+repr(str(target))+").convert('RGBA').resize((1280,720))\n    return c.puppet_runtime.render_scene((1280,720),actors=[],background=im,frame_index=round(t*30))\n")
                out='outputs/outside-'+str(i)
                r=self.call('frames','--trusted-code','--seconds',str(1/30),'--output',out)
                self.assertNotEqual(r.returncode,0,r.stdout)
                self.assertIn('External media dependency in production scene',r.stderr)
                self.assertFalse((self.base/out/'frame-0000.png').exists())
                self.assertFalse((self.base/out/'report.json').exists())
    def test_external_renamed_audio_is_rejected_during_scene_import(self):
        import wave
        self.new_content();outside=Path(self.tmp.name)/'outside-audio.data'
        with wave.open(str(outside),'wb') as stream:
            stream.setnchannels(1);stream.setsampwidth(2);stream.setframerate(48000)
            stream.writeframes(b'\0\0'*48)
        (self.base/'scene.py').write_text("from pathlib import Path\nPath("+repr(str(outside))+").read_bytes()\n")
        r=self.call('frames','--trusted-code','--seconds',str(1/30),'--output','outputs/outside-audio')
        self.assertNotEqual(r.returncode,0);self.assertIn('External media dependency in production scene',r.stderr)
        self.assertFalse((self.base/'outputs/outside-audio').exists())
    def test_project_local_readwrite_handle_still_checks_protected_content(self):
        self.new_content()
        shutil.copyfile(ROOT/'assets/b6/paint/paris-panorama.png',self.base/'art/copied.asset')
        (self.base/'scene.py').write_text("from PIL import Image\ndef frame(t,c):\n    with open(c.base/'art/copied.asset','r+b') as stream:\n        im=Image.open(stream).convert('RGBA').resize((1280,720))\n    return c.puppet_runtime.render_scene((1280,720),actors=[],background=im,frame_index=round(t*30))\n")
        r=self.call('frames','--trusted-code','--seconds',str(1/30),'--output','outputs/readwrite')
        self.assertNotEqual(r.returncode,0);self.assertIn('Protected B6 reference/example/test media',r.stderr)
        self.assertFalse((self.base/'outputs/readwrite/frame-0000.png').exists())
    def test_local_extensionless_new_art_and_installed_dependencies_remain_available(self):
        p=self.new_content()
        old='art/new-unit-world.png';new='art/new-unit-world'
        (self.base/old).rename(self.base/new)
        p['inputs']=[new if f==old else f for f in p['inputs']];self.save_project(p)
        (self.base/'scene.py').write_text("from decimal import Decimal\nfrom pathlib import Path\nfrom PIL import Image, BmpImagePlugin\nPath(Image.__file__).read_bytes()\nPath(BmpImagePlugin.__file__).read_bytes()\ndef frame(t,c):\n    assert Decimal('1.25')*4==5\n    im=Image.open(c.base/'art/new-unit-world').convert('RGBA')\n    return c.puppet_runtime.render_scene((1280,720),actors=[],background=im,frame_index=round(t*30))\n")
        r=self.call('preview','--trusted-code','--seconds',str(1/30),'--output','outputs/local-extensionless')
        self.assertEqual(r.returncode,0,r.stderr)
        self.assertTrue((self.base/'outputs/local-extensionless/preview.mp4').exists())
        report=read(self.base/'outputs/local-extensionless/report.json')
        self.assertEqual(report['purpose'],'production');self.assertFalse(report['delivery_ready'])
    def ffmpeg_reference_scene(self,at_import=False):
        self.new_content();ref=read(self.base/'quality-target.json')['reference']['path']
        # This exact child decode previously copied the Eiffel movie into a
        # production RenderResult without entering the parent's open audit.
        source="""from PIL import Image
import subprocess
def decoded(base):
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(base/REF),'-vf','scale=1280:720','-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-'])
    return Image.frombytes('RGB',(1280,720),raw).convert('RGBA')
def frame(t,c):
    return c.puppet_runtime.render_scene((1280,720),actors=[],background=decoded(c.base),frame_index=round(t*30))
""".replace('REF',repr(ref))
        if at_import:
            source+='\nfrom pathlib import Path\ndecoded(Path(__file__).parent)\n'
        (self.base/'scene.py').write_text(source)
    def test_ffmpeg_reference_decode_is_rejected_during_frame_execution(self):
        self.ffmpeg_reference_scene()
        r=self.call('frames','--trusted-code','--seconds',str(1/30),'--output','outputs/child-frame')
        self.assertNotEqual(r.returncode,0);self.assertIn('Production authored scenes cannot launch subprocesses (subprocess.Popen)',r.stderr)
        self.assertFalse((self.base/'outputs/child-frame/frame-0000.png').exists())
        self.assertFalse((self.base/'outputs/child-frame/report.json').exists())
    def test_ffmpeg_reference_decode_is_rejected_during_scene_import(self):
        self.ffmpeg_reference_scene(at_import=True)
        r=self.call('frames','--trusted-code','--seconds',str(1/30),'--output','outputs/child-import')
        self.assertNotEqual(r.returncode,0);self.assertIn('Production authored scenes cannot launch subprocesses (subprocess.Popen)',r.stderr)
        self.assertFalse((self.base/'outputs/child-import').exists())
    def test_os_system_is_rejected_before_the_command_runs(self):
        self.new_content()
        (self.base/'scene.py').write_text("import os\ndef frame(t,c):\n    os.system('echo unsafe-child')\n")
        r=self.call('frames','--trusted-code','--seconds',str(1/30),'--output','outputs/system')
        self.assertNotEqual(r.returncode,0);self.assertIn('Production authored scenes cannot launch subprocesses (os.system)',r.stderr)
        self.assertNotIn('unsafe-child',r.stdout)
    def test_process_scope_covers_launch_events_and_leaves_runner_and_examples_available(self):
        scope=runtime.authored_process_scope('production')
        events=['subprocess.Popen','os.system','os.exec','os.spawn','os.fork','os.forkpty',
                'os.posix_spawn','os.startfile','os.startfile/2','_winapi.CreateProcess']
        with scope():
            for event in events:
                with self.subTest(event=event),self.assertRaisesRegex(ValueError,'cannot launch subprocesses'):
                    sys.audit(event)
        # The same audit hook remains installed, but is inactive for trusted
        # runner work. Explicit reproduction also retains its previous scope.
        subprocess.run([sys.executable,'-c','pass'],check=True)
        with runtime.authored_process_scope('example-reproduction')():
            subprocess.run([sys.executable,'-c','pass'],check=True)
    def test_media_inventory_covers_all_bundled_b6_media(self):
        helper=runtime.asset_roles()
        for file in (ROOT/'assets/b6').rglob('*'):
            if file.is_file() and file.suffix.lower() in {'.png','.jpg','.jpeg','.webp','.gif','.mp4','.m4a','.wav','.mp3'}:
                self.assertIn(hashlib.sha256(file.read_bytes()).hexdigest(),helper.PROTECTED_MEDIA,str(file))
    def test_new_story_cannot_call_the_whole_old_performance(self):
        fake=SimpleNamespace(context=SimpleNamespace(purpose='production',project={}))
        with self.assertRaisesRegex(ValueError,'example reproduction only'):
            runtime.Engine.draw(fake,7)

if __name__=='__main__':unittest.main()
