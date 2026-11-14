#!/usr/bin/env python3
"""Author a 7.5s reusable-action example in an already initialized fresh B6 project.

Local only. Existing original-speed voice excerpts; no generation or approval.
"""
from pathlib import Path
import hashlib,json,shutil,subprocess,sys
root=Path(__file__).resolve().parents[1];base=Path(sys.argv[1]).resolve()
def read(p):return json.loads(p.read_text())
def save(p,x):p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
p=read(base/'project.json')
if p['renderer']!='b6-production-v1' or p['stage']!='needs_authoring' or set(p['formats'])!={'16:9'}:
    raise ValueError('Use a fresh native 16:9 production project; existing work is never replaced')
audio=base/'audio/reused-voice.wav'
if audio.exists():raise ValueError('Example audio already exists')
audio.parent.mkdir(exist_ok=True)
segments=[(9.025,13.865,146/30),(16.535,17.855,40/30),(18.705,19.99,39/30)]
filters=['[0:a]asplit=3[a][b][c]']
for i,(start,end,duration) in enumerate(segments):
    filters.append(f'[{"abc"[i]}]atrim=start={start}:end={end},asetpts=PTS-STARTPTS,apad=whole_dur={duration},atrim=duration={duration}[p{i}]')
filters.append('[p0][p1][p2]concat=n=3:v=0:a=1[out]')
subprocess.run(['ffmpeg','-v','error','-i',str(base/'engine/audio/master.m4a'),'-filter_complex',';'.join(filters),'-map','[out]','-c:a','pcm_s16le',str(audio)],check=True)
for name in ['scene.py','story.json','captions.json']:
    shutil.copyfile(root/'assets/b6/production'/('example-'+name),base/name)
shutil.copyfile(root/'assets/b6/production/example-landscape.json',base/'formats/landscape.json')
p.update(stage='authored',duration=7.5,purpose='example-reproduction',technical_fixture=True,voice={'name':'The Pharaoh 3','path':str(audio.relative_to(base)),'sha256':hashlib.sha256(audio.read_bytes()).hexdigest(),'speed':1,'source':'Existing master excerpts with silence padding; native speech speed; no new synthesis'})
p['character_system']={'schema':'b6-character-system/1','mode':'locked-v90-performance','reason':'This existing-performance example reuses the unmodified, locked V90 cast/actions; it does not exercise a new character or limb action.'}
p['review']={'status':'pending_user_review','art':'Existing V90 art reused','acting':'Existing calibrated actions; new sequence and booth camera; pending visual/user review','sound':'Original-speed voice excerpts; pending listening review'}
save(base/'project.json',p)
print(json.dumps({'project':str(base),'duration':7.5,'status':'authored_example_pending_review','new_paid_calls':0}))
