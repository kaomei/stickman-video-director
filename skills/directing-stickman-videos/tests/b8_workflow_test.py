"""Workflow boundary tests. Synthetic markers test plumbing, never drawing quality."""
import copy,importlib.util,json,pathlib,subprocess,sys,tempfile,unittest,wave
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
import b8_workflow as flow
class WorkflowTest(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory(prefix='b8-workflow-');self.addCleanup(self.temp.cleanup)
  self.base=pathlib.Path(self.temp.name)/'new-story';flow.init(self.base)
  self.p=self.base/'project.json';self.d=flow.read(self.p)
  self.d.update(title='Hermes delivers a warning',script='A warning.',duration=2,
    characters=[{'id':'messenger','identity':{'hair':'black','costume':'short blue tunic'},'regions':{'hand':'compact warm brown, narrow wrist'}},{'id':'guardian','identity':{'hair':'grey','costume':'green cloak'},'regions':{'hand':'compact pale, narrow wrist'}}],
    assets={},shots=[])
  for name,color,cid,kind in [('world','tan',None,'background'),('messenger','blue','messenger','cel'),('guardian','green','guardian','cel'),('seal','red',None,'prop'),('seal-glow','gold',None,'prop'),('mask','white',None,'mask')]:
   f=self.base/'assets'/f'{name}.png';size=(128,72) if kind=='background' else (24,24);Image.new('RGBA',size,color).save(f)
   a={'path':str(f.relative_to(self.base)),'sha256':flow.sha(f),'kind':kind}
   if cid:a.update(character_id=cid,whole_pose=True,review={'status':'accepted','asset_sha256':flow.sha(f),'reviewer':'test fixture only','notes':'Synthetic marker; does not assert B8 anatomy/style.'})
   self.d['assets'][name]=a
  for i,(start,end,scene) in enumerate([(0,1,'gate'),(1,2,'courtyard')]):
   self.d['shots'].append({'id':f's{i+1}','start':start,'end':end,'scene':scene,'framing':'two-shot' if i==0 else 'reaction detail','information_change':'warning delivered' if i==0 else 'guardian understands','camera_motivation':'fixed to read action','action':'offer sealed warning','reaction':'receive and look toward gate','contact_audit':'Both hands support seal; no other bare contacts.','characters':['messenger','guardian'],'contacts':[],'proposal_composition_asset':'world', 'layers':[
    {'id':'world','asset':'world','x':64,'y':36,'width':128,'z':0,'depth':0},
    {'id':'messenger','asset':'messenger','x':32,'y':40,'width':24,'z':2,'depth':1,'keyframes':[{'time':0,'x':28},{'time':1,'x':32}]},
    {'id':'guardian','asset':'guardian','x':86,'y':40,'width':24,'z':1,'depth':1}]})
  self.d.update(width=128,height=72,fps=5);self.d['caption_style'].update(size=8,y=65,max_width=120)
  flow.write(self.p,self.d)
 def review_fixture(self,manifest,shot_ids=None):
  # TEST ONLY: plumbing fixture, never a claim of actual visual inspection.
  report=flow.read(manifest)
  evidence=[a for a in report['artifacts'] if pathlib.Path(a['path']).suffix in ('.jpg','.png','.mp4')]
  for item in report['quality_review']['items']:
   if shot_ids is None or item['shot_id']=='__cast__' or item['shot_id'] in shot_ids:
    item.update(status='accepted',reviewer='TEST ONLY synthetic fixture',notes='Synthetic markers exercise record boundaries; no visual/style claim.',evidence=evidence)
  flow.write(manifest,report)
 def approve(self,stage):
  r=flow.make_boards(self.p,self.d,stage)
  review=r.get('review_manifest')
  if not review: review=str(self.base/r['artifacts'][0]['path']);review=str(pathlib.Path(review).parent/'review-manifest.json')
  self.review_fixture(review)
  return flow.approve(self.p,self.d,stage,review,'TEST ONLY simulated explicit message')
 def test_entry_init_is_distinct_portable_and_no_overwrite(self):
  self.assertTrue((self.base/'references/b8/character-style-board.jpg').exists())
  self.assertEqual(flow.read(self.base/'checkpoint.json')['b8_pipeline']['stage'],'director_proposal_required')
  with self.assertRaises(ValueError):flow.init(self.base)
  proc=subprocess.run(['node',str(ROOT/'scripts/autopilot.mjs'),'validate',str(self.base)],capture_output=True,text=True)
  self.assertEqual(proc.returncode,0,proc.stderr);self.assertTrue(json.loads(proc.stdout)['ok'])
 def test_native_portrait_init_attaches_real_portrait_references(self):
  target=pathlib.Path(self.temp.name)/'native-portrait';flow.init(target,'9:16')
  plan=flow.read(target/'project.json');self.assertEqual((plan['width'],plan['height']),(720,1280))
  references=plan['drawing_family']['references']
  self.assertIn('references/b8/portrait-fullbody-board.jpg',references)
  self.assertIn('references/b8/portrait-arm-direction-board.jpg',references)
  self.assertTrue(all((target/p).is_file() for p in references))
  self.assertFalse(flow.read(target/'checkpoint.json')['b8_pipeline']['approvals'])
 def test_prompts_share_attached_family_keep_distinct_identity(self):
  jobs=[job for job in flow.prompts(self.d,self.base)['jobs'] if job.get('character_id')];self.assertEqual(len(jobs),4)
  self.assertEqual(jobs[0]['reference_paths'],jobs[1]['reference_paths'])
  self.assertNotEqual(jobs[0]['identity'],jobs[1]['identity'])
  self.assertIn(flow.ANCHOR,jobs[0]['prompt']);self.assertIn('narrow wrist',jobs[0]['prompt'])
  self.assertFalse(jobs[0]['tool_call_started'])
  all_jobs=flow.prompts(self.d,self.base)['jobs']
  for job in all_jobs:
   self.assertIn('TARGET CANVAS: 128x72',job['prompt'])
   self.assertEqual('ARM DIRECTION:' in job['prompt'],job['kind']=='cel')
   self.assertNotIn('Draw the complete palm-wrist-forearm',job['prompt'])
 def test_missing_stale_review_and_artifact_bindings(self):
  with self.assertRaisesRegex(ValueError,'proposal approval'):flow.render_project(self.p,self.d,self.base/'outputs/fail.mp4',0,1)
  self.approve('proposal')
  with self.assertRaisesRegex(ValueError,'keyposes approval'):flow.render_project(self.p,self.d,self.base/'outputs/fail.mp4',0,1)
  self.approve('keyposes')
  self.assertTrue(flow.approval_ok(self.p,self.d,'keyposes',self.d['shots'])[0])
  self.d['shots'][1]['layers'][1]['x']=31
  self.assertTrue(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][0]])[0])
  self.assertFalse(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][1]])[0])
  (self.base/'assets/messenger.png').write_bytes(b'changed')
  self.assertFalse(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][0]])[0])
 def test_contact_causality_and_semantic_script_preservation(self):
  s=self.d['shots'][0];s['contacts']=[{'object':'seal','trigger':'bare hand','object_extent':'whole detached seal','support':'guardian palm','before':'red','after':'gold','continuity':'remains supported','phase_times':{'approach':0,'contact':.4,'change':.2,'result':.7,'reaction':1.5}}]
  self.assertFalse(flow.validate(self.d,self.base)['ok'])
  s['contacts'][0]['phase_times']['change']=.5
  self.assertTrue(flow.validate(self.d,self.base)['ok'])
  self.d['captions']=[{'start':0,'end':1,'text':'A warning.'}]
  self.assertTrue(flow.validate(self.d,self.base,True)['ok'])
  self.d['captions'][0]['text']='warning'
  self.assertIn('complete approved script',' '.join(flow.validate(self.d,self.base,True)['errors']))
 def test_partial_approval_cannot_unlock_other_times_and_adjacent_ranges_combine(self):
  self.approve('proposal');board=flow.make_boards(self.p,self.d,'keyposes')
  self.review_fixture(board['review_manifest'])
  def accept(start,end):flow.approve(self.p,self.d,'keyposes',board['review_manifest'],'TEST ONLY actual interval approval',start,end)
  accept(0,.2)
  self.assertTrue(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][0]],0,.2)[0])
  self.assertFalse(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][0]],.8,1)[0])
  with self.assertRaisesRegex(ValueError,'keyposes approval'):flow.render_project(self.p,self.d,self.base/'outputs/not-approved.mp4',.8,1)
  accept(.2,.7)
  self.assertFalse(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][0]])[0])
  accept(.7,1)
  self.assertTrue(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][0]])[0])
  self.assertFalse(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][1]])[0])
  encoded=flow.render_project(self.p,self.d,self.base/'outputs/combined-approval.mp4',.8,1)
  self.assertEqual(encoded['range'],[.8,1])
 def test_sample_approval_is_bounded_by_actual_encoded_range(self):
  self.approve('proposal');self.approve('keyposes')
  sample=flow.render_project(self.p,self.d,self.base/'outputs/short.mp4',0,.2)
  with self.assertRaisesRegex(ValueError,'actual encoded sample range'):
   flow.approve(self.p,self.d,'sample',sample['report'],'TEST ONLY wrong interval',.8,1,2)
  with self.assertRaisesRegex(ValueError,'actual encoded sample range'):
   flow.approve(self.p,self.d,'sample',sample['report'],'TEST ONLY default whole story')
  self.review_fixture(sample['report'])
  flow.approve(self.p,self.d,'sample',sample['report'],'TEST ONLY actual sample and full expansion',0,.2,2)
  encoded=flow.render_project(self.p,self.d,self.base/'outputs/full-after-real-sample.mp4',0,2,True)
  self.assertEqual(encoded['range'],[0,2])
 def test_separate_keypose_bytes_invalidate_only_affected_shot_and_require_integrity(self):
  pose=self.base/'assets/contact-pose.png';Image.new('RGBA',(24,24),'orange').save(pose)
  asset=copy.deepcopy(self.d['assets']['messenger']);asset.update(path='assets/contact-pose.png',sha256=flow.sha(pose));asset['review']['asset_sha256']=flow.sha(pose)
  self.d['assets']['contact-pose']=asset;self.d['shots'][0]['keypose_assets']=['contact-pose'];flow.write(self.p,self.d)
  self.approve('proposal');self.approve('keyposes')
  Image.new('RGBA',(24,24),'purple').save(pose)
  self.assertIn('review drawing SHA-256 mismatch',' '.join(flow.validate(self.d,self.base)['errors']))
  asset['sha256']=flow.sha(pose);asset['review']['asset_sha256']=flow.sha(pose)
  self.assertTrue(flow.validate(self.d,self.base,True)['ok'])
  self.assertFalse(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][0]])[0])
  self.assertTrue(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][1]])[0])
  asset['path']='../escaped.png';self.assertFalse(flow.validate(self.d,self.base)['ok'])
  asset['path']='assets/missing.png';self.assertFalse(flow.validate(self.d,self.base)['ok'])
  self.d['shots'][0]['keypose_assets']=['unknown-pose'];self.assertIn('unknown review drawing asset',' '.join(flow.validate(self.d,self.base)['errors']))
 def test_character_reference_bytes_invalidate_reviews_and_get_fresh_boards(self):
  reference=self.base/'assets/approved-character-reference.png';Image.new('RGB',(24,24),'blue').save(reference)
  self.d['characters'][0]['references']=['assets/approved-character-reference.png'];flow.write(self.p,self.d)
  original=flow.make_boards(self.p,self.d,'proposal');self.approve('proposal');self.approve('keyposes')
  Image.new('RGB',(24,24),'red').save(reference)
  self.assertFalse(flow.approval_ok(self.p,self.d,'proposal',self.d['shots'])[0])
  self.assertFalse(flow.approval_ok(self.p,self.d,'keyposes',self.d['shots'])[0])
  refreshed=flow.make_boards(self.p,self.d,'proposal');self.assertNotEqual(original['review_manifest'],refreshed['review_manifest'])
  self.d['characters'][0]['references']=['assets/missing-reference.png'];self.assertIn('missing character reference',' '.join(flow.validate(self.d,self.base)['errors']))
  self.d['characters'][0]['references']=['../escaped.png'];self.assertFalse(flow.validate(self.d,self.base)['ok'])
 def test_proposal_composition_is_bound_without_requiring_character_acceptance(self):
  sketch=self.base/'assets/composition.png';Image.new('RGBA',(128,72),'orange').save(sketch)
  self.d['assets']['composition']={'path':'assets/composition.png','sha256':flow.sha(sketch),'kind':'prop'}
  self.d['shots'][0]['proposal_composition_asset']='composition';flow.write(self.p,self.d)
  self.approve('proposal');self.approve('keyposes')
  Image.new('RGBA',(128,72),'purple').save(sketch)
  self.assertIn('review drawing SHA-256 mismatch',' '.join(flow.validate(self.d,self.base)['errors']))
  self.d['assets']['composition']['sha256']=flow.sha(sketch)
  self.assertTrue(flow.validate(self.d,self.base,True)['ok'])
  for stage in ('proposal','keyposes'):
   self.assertFalse(flow.approval_ok(self.p,self.d,stage,[self.d['shots'][0]])[0])
   self.assertTrue(flow.approval_ok(self.p,self.d,stage,[self.d['shots'][1]])[0])
  self.d['shots'][0]['proposal_composition_asset']='missing';self.assertIn('unknown review drawing asset',' '.join(flow.validate(self.d,self.base)['errors']))
 def test_proposal_can_export_missing_compositions_but_cannot_approve_placeholders(self):
  del self.d['shots'][0]['proposal_composition_asset'];flow.write(self.p,self.d)
  board=flow.make_boards(self.p,self.d,'proposal')
  self.assertTrue(pathlib.Path(board['review_manifest']).is_file())
  with self.assertRaisesRegex(ValueError,'composition drawing required before approval: s1'):
   flow.approve(self.p,self.d,'proposal',board['review_manifest'],'TEST ONLY attempted placeholder approval')
  self.assertFalse(flow.read(self.base/'checkpoint.json')['b8_pipeline']['approvals'])
 def test_full_production_never_truncates_narration_or_master_but_preview_can_clip(self):
  for field in ('narration','audio_master'):
   with self.subTest(field=field):
    fixture=WorkflowTest();fixture.setUp()
    try:
     voice=fixture.base/'audio/original.wav'
     with wave.open(str(voice),'wb') as f:f.setparams((1,2,8000,0,'NONE',''));f.writeframes(b'\x00\x00'*16000+b'\x10\x27'*8000)
     fixture.d[field]={'path':'audio/original.wav','sha256':flow.sha(voice),'speed':1};fixture.d['captions']=[{'start':0,'end':1.8,'text':'A warning.'}];flow.write(fixture.p,fixture.d)
     fixture.approve('proposal');fixture.approve('keyposes')
     sample=flow.render_project(fixture.p,fixture.d,fixture.base/'outputs/preview.mp4',0,1)
     self.assertEqual(sample['range'],[0,1])
     fixture.review_fixture(sample['report'])
     flow.approve(fixture.p,fixture.d,'sample',sample['report'],'TEST ONLY actual sample and full production',0,1,2)
     with self.assertRaisesRegex(ValueError,'truncate complete original '+field):flow.render_project(fixture.p,fixture.d,fixture.base/'outputs/truncated-full.mp4',0,2,True)
     self.assertFalse((fixture.base/'outputs/truncated-full.mp4').exists());self.assertEqual(flow.sha(voice),fixture.d[field]['sha256'])
    finally:fixture.doCleanups()
 def test_real_short_encode_mux_preserves_inputs_and_requires_scope(self):
  voice=self.base/'audio/original.wav'
  with wave.open(str(voice),'wb') as f:f.setparams((1,2,8000,0,'NONE',''));f.writeframes(b'\x00\x00'*16000)
  self.d['narration']={'path':'audio/original.wav','sha256':flow.sha(voice),'speed':1};self.d['captions']=[{'start':0,'end':1.8,'text':'A warning.'}];flow.write(self.p,self.d)
  self.approve('proposal');self.approve('keyposes')
  result=flow.render_project(self.p,self.d,self.base/'outputs/test.mp4',0,1)
  self.assertEqual(result['visual_review'],'pending');self.assertEqual(result['technical']['audio']['speed'],1)
  report=self.base/'outputs/test.report.json'
  self.review_fixture(report)
  flow.approve(self.p,self.d,'sample',report,'TEST ONLY approved sample and full scope',0,1,2)
  rendered=flow.render_project(self.p,self.d,self.base/'outputs/full.mp4',0,2,True)
  self.assertFalse(flow.review_report(self.p,self.d,rendered['report'])['ok'])
  cli=['node',str(ROOT/'scripts/autopilot.mjs'),'validate',str(self.base),'--review',rendered['report']]
  self.assertEqual(subprocess.run(cli,capture_output=True,text=True).returncode,2)
  self.review_fixture(rendered['report'])
  self.assertTrue(flow.review_report(self.p,self.d,rendered['report'])['ok'])
  checked=subprocess.run(cli,capture_output=True,text=True)
  self.assertEqual(checked.returncode,0,checked.stderr)
  self.assertEqual(__import__('json').loads(checked.stdout)['user_acceptance'],'pending')
  self.assertEqual(flow.review_report(self.p,self.d,rendered['report'])['user_acceptance'],'pending')
  good=flow.read(rendered['report'])
  for field,value in [('visual_review','failed'),('actual_listening','failed'),('technical',{'ok':False})]:
   report=copy.deepcopy(good);report[field]=value;flow.write(rendered['report'],report)
   self.assertFalse(flow.review_report(self.p,self.d,rendered['report'])['ok'])
  flow.write(rendered['report'],good)
  self.assertTrue(pathlib.Path(rendered['output']).exists());self.assertEqual(flow.sha(voice),self.d['narration']['sha256'])
  with self.assertRaises(ValueError):flow.render_project(self.p,self.d,self.base/'outputs/full.mp4',0,2,True)
  self.d['narration']['speed']=1.2;self.assertFalse(flow.validate(self.d,self.base,True)['ok'])
 def test_visual_gate_blocks_pending_failed_missing_and_unbound_evidence(self):
  board=flow.make_boards(self.p,self.d,'proposal');manifest=board['review_manifest']
  with self.assertRaisesRegex(ValueError,'Visual review required'):flow.approve(self.p,self.d,'proposal',manifest,'TEST ONLY message cannot replace inspection')
  self.review_fixture(manifest);good=flow.read(manifest)
  for mutation in ('failed','missing','fake_evidence','na_composition','missing_cast'):
   report=copy.deepcopy(good)
   if mutation=='failed':report['quality_review']['items'][1]['status']='failed'
   if mutation=='missing':report['quality_review']['items'].pop()
   if mutation=='fake_evidence':report['quality_review']['items'][1]['evidence']=[{'path':'made-up.jpg','sha256':'wrong'}]
   if mutation=='na_composition':report['quality_review']['items'][1]['status']='not_applicable'
   if mutation=='missing_cast':report['quality_review']['items'][0]['character_ids']=[]
   flow.write(manifest,report)
   with self.subTest(mutation=mutation),self.assertRaisesRegex(ValueError,'Visual review required'):flow.approve(self.p,self.d,'proposal',manifest,'TEST ONLY')
  flow.write(manifest,good);flow.approve(self.p,self.d,'proposal',manifest,'TEST ONLY genuine message fixture')
  self.assertTrue(flow.approval_ok(self.p,self.d,'proposal',self.d['shots'])[0])
  good['quality_review']['items'][1]['notes']='changed after approval';flow.write(manifest,good)
  self.assertTrue(flow.approval_ok(self.p,self.d,'proposal',self.d['shots'])[0])
  approved=flow.read(self.base/'checkpoint.json')['b8_pipeline']['approvals'][-1]['quality_review_manifest']['path']
  (self.base/approved).write_text('{}')
  self.assertFalse(flow.approval_ok(self.p,self.d,'proposal',self.d['shots'])[0])
 def test_partial_visual_scope_and_legacy_approval_remain_valid(self):
  self.approve('proposal');board=flow.make_boards(self.p,self.d,'keyposes')
  self.review_fixture(board['review_manifest'],['s1'])
  flow.approve(self.p,self.d,'keyposes',board['review_manifest'],'TEST ONLY first shot',0,1)
  with self.assertRaisesRegex(ValueError,'Visual review required'):flow.approve(self.p,self.d,'keyposes',board['review_manifest'],'TEST ONLY second shot',1,2)
  self.review_fixture(board['review_manifest'],['s2'])
  self.assertTrue(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][0]])[0])
  flow.approve(self.p,self.d,'keyposes',board['review_manifest'],'TEST ONLY second shot',1,2)
  cp,state,pipe=flow.checkpoint(self.p,self.d)
  for item in pipe['approvals']:
   item.pop('quality_review_manifest',None);item.pop('quality_review',None)
  flow.write(cp,state)
  self.assertTrue(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][0]])[0])
  self.d.update(width=72,height=128)
  self.assertFalse(flow.approval_ok(self.p,self.d,'keyposes',[self.d['shots'][0]])[0])
  portrait=flow.make_boards(self.p,self.d,'proposal');r=flow.read(portrait['review_manifest'])
  self.assertEqual((r['quality_review']['width'],r['quality_review']['height']),(72,128))
  self.assertEqual(r['quality_review']['items'][1]['status'],'pending')
 def test_cast_coverage_includes_state_material_and_separate_poses(self):
  s=self.d['shots'][0]
  s['layers'][1]['states']=[{'time':.5,'asset':'guardian'}]
  s['layers'][1]['material']={'asset':'messenger','mask':'mask'}
  s['keypose_assets']=['guardian']
  review=flow.visual.template(self.d,[s],'sample')
  self.assertEqual(review['items'][0]['asset_ids'],['guardian','messenger'])
  self.assertEqual(review['items'][0]['character_ids'],['guardian','messenger'])
  checks={row['check'] for row in review['items']}
  self.assertEqual(checks,{'cast_style','composition','arm_direction','spatial_motion'})
if __name__=='__main__':unittest.main()
