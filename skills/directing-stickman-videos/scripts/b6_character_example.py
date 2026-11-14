#!/usr/bin/env python3
"""Populate a fresh native landscape B6 project with a silent 6s limb fixture.

This is a structural regression fixture, not a generic film or creative pass.
The asset packages are two code-derived demo roles from the approved local art.
"""
from pathlib import Path
import hashlib,json,shutil,sys,wave
root=Path(__file__).resolve().parents[1];base=Path(sys.argv[1]).resolve()
def read(p):return json.loads(p.read_text())
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
p=read(base/'project.json')
if p['renderer']!='b6-production-v1' or p['stage']!='needs_authoring' or set(p['formats'])!={'16:9'}:
    raise ValueError('Requires a fresh, native 16:9 production project; refuses existing authored work')
source=root/'assets/b6/characters';scene=root/'assets/b6/production/puppet-test-scene.py';skill=root
for character in ('kiosk_keeper','parcel_runner'):
    shutil.copytree(source/character,base/'characters'/character)
shutil.copyfile(scene,base/'scene.py')
(base/'art').mkdir()
for name in ('hotel-panorama.png','table.png','letter.png'):
    shutil.copyfile(skill/'assets/b6/paint'/name,base/'art'/name)
(base/'audio').mkdir(exist_ok=True)
audio=base/'audio/technical-silence.wav'
with wave.open(str(audio),'wb') as f:
    f.setnchannels(1);f.setsampwidth(2);f.setframerate(24000);f.writeframes(b'\0\0'*144000)
p.update(version=1,stage='authored',duration=6,purpose='diagnostic',technical_fixture=True,
 voice={'name':'Silent technical fixture','path':str(audio.relative_to(base)),'sha256':hashlib.sha256(audio.read_bytes()).hexdigest(),'speed':1,'source':'Local silence; no voice generation; no film/story acceptance'},
 review={'status':'pending_user_review','art':'Two code-derived demo roles; not new model artwork','acting':'Six-second turn/pick-up/shared transfer/withdraw test; actual alpha gates plus visual review required','sound':'Intentionally silent structural test'})
p['inputs']+=['art/'+n for n in ('hotel-panorama.png','table.png','letter.png')]
save(base/'project.json',p)
save(base/'characters.json',{'schema':'b6-character-registry/1','actors':[
 {'id':'keeper','package':'characters/kiosk_keeper','views':['front','three_quarter','side']},
 {'id':'runner','package':'characters/parcel_runner','views':['front','three_quarter','side']}],'rigid_cast':[]})
save(base/'story.json',{'narration':'','status':'technical_fixture_only','beats':[
 {'start':0,'end':.85,'action':'Keeper turns toward runner using calibrated painted views.'},
 {'start':.85,'end':2.5,'action':'Keeper reaches, takes and offers one real paper.'},
 {'start':2.5,'end':3.55,'action':'Runner reaches; both hold the same paper during transfer.'},
 {'start':3.55,'end':6,'action':'Keeper releases and withdraws while runner holds the paper.'}]})
plan=read(base/p['formats']['16:9'])
plan['caption']['native_layout_reason']='Silent technical test; native landscape staging gives two complete silhouettes and clear contact space.'
plan['shots']=[{'id':'exchange','start':0,'end':6,'composition':'Wide painted lobby; giver left, receiver right, contact space in the center; planted feet and full arms visible.', 'action':'Turn, reach, pick up paper, offer, share ownership, release and withdraw.', 'camera':'Fixed medium-wide native 1280x720 to reveal limb problems; no camera movement hides defects.', 'transition':'Uninterrupted shot with authored front/three-quarter/side keeper turn.'}]
plan['cast_inventory']=[{'id':'keeper','role':'Kiosk keeper','shot_ids':['exchange']},{'id':'runner','role':'Parcel runner','shot_ids':['exchange']}]
save(base/p['formats']['16:9'],plan)
print(json.dumps({'project':str(base),'duration':6,'technical_fixture':True,'new_paid_calls':0}))
