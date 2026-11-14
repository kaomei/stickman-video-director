#!/usr/bin/env python3
"""Standalone B6 authored-scene runtime, using the complete painted V90 engine."""
from pathlib import Path
from types import SimpleNamespace
import argparse, hashlib, importlib.util, json, math, subprocess, sys
from contextlib import contextmanager

sys.dont_write_bytecode=True
# Validation may parse local package data, but must never execute an edited helper.
TRUSTED_PUPPET_RUNTIME_SHA256='adc4bd4ddcbe2bb184381d080e99ebe1f4bd1beb3b0b6b1a841930ae15d5bed8'
TRUSTED_CAPTION_RUNTIME_SHA256='5fc03a3f38dce9f55609f2059077125ecc30b7f5fa1d31580f9e007fcf23200b'
TRUSTED_ASSET_ROLES_SHA256='ade90e92cad1751bd0b010d508501bba73a41a1ffe6c6018dadd4a368ace9c14'
TRUSTED_MOTION_REVIEW_SHA256='e9873884fd348f4f1461e7b04a5301c6fd8aa2f14397468d248652ea2c25e56b'
FROZEN_V90_EXAMPLE_SHA256={
    'scene':'dffaba09358cfdeafc9a3a04f29483910f4a8667159fbdbd60094b9185239947',
    'native_plan':'c0cdbfa77603936aa69ffdf3f211b28566fd14292172593fd63324a9d749620c',
    'engine_manifest':'5b717ae1309e1a7b29e17dd12c0382dcec5521e10977003915f2fd026b5cc0fd',
    'source_fixture':'0a72e56eaa011f3daa4f5aceac281b7a8ff1d633807a0da475eb2ec562254236',
}
def read(p): return json.loads(Path(p).read_text())
def save(p,v): Path(p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def require(ok,msg):
    if not ok: raise ValueError(msg)
LOCAL_FONT_MANIFEST_FILES=frozenset({
    'source/fonts/Arial.ttf','source/fonts/ArialBlack.ttf',
    'source/fonts/CourierNewBold.ttf','font-provenance.json',
})
FALLBACK_FONT_LICENSE_FILES={
    'NotoSans.ttf':'source/fonts/OFL-NotoSans.txt',
    'Nunito.ttf':'source/fonts/OFL-Nunito.txt',
}
def required_font_license_files(base, manifest):
    require(LOCAL_FONT_MANIFEST_FILES.issubset(manifest['files']),
            'Installed engine font/provenance entries required')
    rows=read(local(base,'font-provenance.json')).get('fonts')
    expected={'source/fonts/Arial.ttf':'NotoSans.ttf',
              'source/fonts/ArialBlack.ttf':'Nunito.ttf',
              'source/fonts/CourierNewBold.ttf':'NotoSans.ttf'}
    require(isinstance(rows,list) and len(rows)==len(expected) and
            {row.get('path') for row in rows}==set(expected),
            'Fallback font license requires complete font provenance')
    licenses=set()
    for row in rows:
        if row.get('kind')=='system-local':continue
        require(row.get('kind')=='open-fallback' and row.get('fallback_font')==expected[row['path']],
                'Fallback font license has unsupported font provenance')
        rel=FALLBACK_FONT_LICENSE_FILES[row['fallback_font']]
        require(row.get('license_path')==rel,'Fallback font license path missing or incorrect: '+rel)
        require(rel in manifest['files'],'Fallback font license missing from manifest: '+rel)
        require(row.get('license_sha256')==manifest['files'][rel],
                'Fallback font license fingerprint mismatch: '+rel)
        require(sha(local(base,rel))==manifest['files'][rel],
                'Locked engine changed: fallback font license '+rel)
        licenses.add(rel)
    return licenses
def frozen_engine_manifest_sha(path):
    # The public source is frozen; fonts are provisioned locally at init, then
    # pinned by the complete project manifest and its review fingerprint.
    manifest=read(path)
    licenses=required_font_license_files(Path(path).parent,manifest)
    core={**manifest,'files':{rel:digest for rel,digest in manifest['files'].items()
                             if rel not in LOCAL_FONT_MANIFEST_FILES | licenses}}
    return hashlib.sha256(json.dumps(core,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def local(base,rel):
    base=Path(base).resolve()
    require(isinstance(rel,str) and rel and not Path(rel).is_absolute(),'Project-relative input required')
    p=(base/rel).resolve(); require(p.is_relative_to(base) and p.is_file(),'Missing/escaped input: '+rel);return p
def module(name,p):
    spec=importlib.util.spec_from_file_location(name,p);m=importlib.util.module_from_spec(spec);sys.modules[name]=m;spec.loader.exec_module(m);return m

def verified_module(name,path,expected_sha,label='character runtime'):
    # Execute exactly the verified source bytes, never a project-local .pyc cache.
    source=Path(path).read_bytes()
    require(hashlib.sha256(source).hexdigest()==expected_sha,
            'Untrusted '+label+' changed; validation refuses to execute the edited project helper')
    spec=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(spec)
    sys.modules[name]=m;exec(compile(source,str(path),'exec'),m.__dict__);return m

def character_registry(base, project, cast_ids):
    """Load actual per-view painted puppets; an arm-length JSON is insufficient.

    Projects created before this contract retain their frozen legacy runtime.
    New initializations install this contract and must return the compositor's
    final RenderResult so its alpha checks concern the delivered frame.
    """
    contract=project.get('character_system')
    if contract is None:
        require(project.get('version',1)<2,'New B6 projects require the executable character-system contract')
        return None,{},None,[]
    require(contract.get('schema')=='b6-character-system/1','Unsupported character system')
    if contract.get('mode')=='locked-v90-performance':
        require(not project.get('bindings'),'A locked V90 performance cannot declare new character bindings')
        require(contract.get('reason'),'A legacy performance reuse needs an explicit scope reason')
        require(set(project.get('formats',{}))=={'16:9'} and project.get('duration')==7.5,
                'Legacy mode permits only the installed frozen 7.5s landscape source-reuse fixture')
        frozen={'scene':project['scene'],'native_plan':project['formats']['16:9'],
                'engine_manifest':'engine/manifest.json','source_fixture':'engine/project.json'}
        for label,rel in frozen.items():
            path=local(base,rel)
            digest=frozen_engine_manifest_sha(path) if label=='engine_manifest' else sha(path)
            require(digest==FROZEN_V90_EXAMPLE_SHA256[label],
                    'Frozen source-reuse '+label+' changed; new scenes require painted character packages')
        return None,{},None,list(frozen.values())
    require(contract.get('mode') in (None,'painted-puppet'),'Unknown character-system mode')
    registry_path=local(base,contract['registry']);registry=read(registry_path)
    require(registry.get('schema')=='b6-character-registry/1','Per-view character registry required')
    actors=registry.get('actors',[]);rigid=registry.get('rigid_cast',[])
    require(project.get('version',1)<2 or not rigid,'Version-2 rigid_cast exceptions are unsupported until actual pixel coverage is implemented')
    ids=[a['id'] for a in actors];rigid_ids=[a['id'] for a in rigid]
    require(len(ids+rigid_ids)==len(set(ids+rigid_ids)) and set(ids+rigid_ids)==set(cast_ids),'Character registry must cover native cast exactly once')
    require(all(a.get('reason') and a.get('source') for a in rigid),'Rigid painted extras require explicit intact-source exceptions')
    runtime_path=local(base,'b6_puppet.py')
    runtime=verified_module('b6_character_runtime',runtime_path,TRUSTED_PUPPET_RUNTIME_SHA256)
    characters={};files=[contract['registry'],'b6_puppet.py']
    for actor in actors:
        package_path=local(base,actor['package'].rstrip('/')+'/package.json')
        require(actor.get('views'),'Declare supported and tested character views')
        character=runtime.load_character(package_path.parent)
        require(set(actor['views']).issubset(character.views),'Unregistered character view')
        if project.get('version',1)>=2:
            require(character.binding_version>=2 and all(character.views[view].neck_attachment is not None for view in actor['views']),
                    'Version-2 projects require painted head/neck attachment mounts in every registered character view')
        characters[actor['id']]=character
        for asset in sorted(package_path.parent.rglob('*')):
            if asset.is_file():files.append(str(asset.relative_to(base)))
    for actor in rigid:files.append(actor['source'])
    return runtime,characters,registry,files

def asset_roles():
    helper=Path(__file__).with_name('b6_asset_roles.py')
    return verified_module('b6_asset_role_runtime',helper,TRUSTED_ASSET_ROLES_SHA256,'asset-role runtime')

def authored_process_scope(purpose):
    """Bound ordinary scene process launches, not hostile/native Python execution.

    Child decoders do not emit the parent's file-open audit events. Production
    media must therefore be prepared as declared local inputs before execution;
    only the trusted runner starts encoders/muxers outside this active scope.
    """
    state={'depth':0}
    if purpose=='production':
        def audit(event,args):
            launch=(event in {'subprocess.Popen','os.system','os.fork','os.forkpty',
                             'os.posix_spawn','os.startfile','os.startfile/2',
                             '_winapi.CreateProcess'} or
                    event.startswith(('os.exec','os.spawn')))
            if state['depth'] and launch:
                raise ValueError('Production authored scenes cannot launch subprocesses ('+event+
                                 '); preprocess media into project-local PNG inputs before rendering')
        sys.addaudithook(audit)
    @contextmanager
    def scope():
        state['depth']+=1
        try:yield
        finally:state['depth']-=1
    return scope

def caption_helper():
    helper=Path(__file__).with_name('caption_renderer.py')
    if not helper.exists():helper=Path(__file__).with_name('b6_caption.py')
    return verified_module('b6_caption_runtime',helper,TRUSTED_CAPTION_RUNTIME_SHA256,'caption runtime')

def load(base,ratio):
    base=Path(base).resolve()
    p=read(base/'project.json')
    require(p['style']=='B6' and p['renderer']=='b6-production-v1','Wrong production renderer')
    require(ratio in p['formats'],'Choose one authored native --ratio')
    require(p['stage']=='authored','Skill agent must author story/art/native scenes/audio; initialization alone is not a video')
    require(isinstance(p['duration'],(int,float)) and math.isfinite(p['duration']) and p['duration']>0 and p['fps']==30,'Actual duration and 30fps required')
    plan=read(local(base,p['formats'][ratio]));w,h=plan['width'],plan['height'];rw,rh=map(int,ratio.split(':'))
    require(plan['native_design']==ratio and plan['ratio']==ratio and w%2==h%2==0 and w>=64 and h>=64 and abs(w/h-rw/rh)<.001,'Separate native layout required')
    caption_helper().validate_profile(plan.get('caption'),ratio,w,h,base)
    end=0
    for shot in plan['shots']:
        require(abs(shot['start']-end)<1e-6 and shot['end']>end,'Shot gaps/overlap')
        require(all(shot.get(k) for k in ['id','composition','action','camera','transition']),'Authored composition, action, camera and transition required')
        require(shot['end']-shot['start']>=.9 or shot.get('short_cut_reason'),'Unexplained flash cut')
        end=shot['end']
    require(abs(end-p['duration'])<1/30,'Native shot plan must cover actual duration')
    require(isinstance(plan.get('cast_inventory'),list),'Explicit native cast_inventory required, including painted background cast; [] only for genuinely unpeopled footage')
    cast_ids=[];shot_ids={shot['id'] for shot in plan['shots']}
    for actor in plan['cast_inventory']:
        ident=actor.get('id')
        require(isinstance(ident,str) and ident.strip() and ident not in cast_ids and actor.get('role','').strip()
                and actor.get('shot_ids') and len(actor['shot_ids'])==len(set(actor['shot_ids']))
                and set(actor['shot_ids']).issubset(shot_ids),'Invalid native cast_inventory actor/shot coverage')
        cast_ids.append(ident)
    cues=read(local(base,p['captions']));last=0
    for c in cues:
        require(last<=c['start']<c['end']<=p['duration']+.001 and c['text'].strip() and '\n' not in c['text'],'Ordered single-line semantic captions required');last=c['end']
    require(' '.join(c['text'] for c in cues)==read(local(base,p['story']))['narration'],'Caption text differs from exact narration')
    require(p['voice'] and p['voice'].get('speed',1)==1,'Actual original-speed mixed audio required')
    audio=local(base,p['voice']['path']);require(sha(audio)==p['voice']['sha256'],'Voice fingerprint changed')
    meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(audio)]))
    require(any(s['codec_type']=='audio' for s in meta['streams']) and abs(float(meta['format']['duration'])-p['duration'])<.12,'Full audio duration differs from project')
    files=['project.json','run.py','caption_renderer.py',p['scene'],p['story'],p['captions'],p['voice']['path'],p['formats'][ratio],plan['caption']['font_file'],*p.get('inputs',[])]
    comparison_reference=None
    if p.get('quality_target'):
        files.extend(['motion_review.py','b6_space.py'])
        files.append(p['quality_target'])
        target=read(local(base,p['quality_target']))
        require(sha(local(base,target['reference']['path']))==target['reference']['sha256'],'Locked motion reference changed')
        comparison_reference=target['reference']['path']
        files.append(comparison_reference)
    if p.get('bindings'):files.append(p['bindings'])
    roles=asset_roles()
    purpose=roles.classify(p,sha(local(base,p['scene'])))
    # Inventory package bytes before importing/validating their runtime. In
    # particular, relabelled demo art cannot hide behind a different filename.
    declared_character_files=[]
    contract=p.get('character_system',{})
    if contract.get('registry'):
        declared=read(local(base,contract['registry']))
        for actor in declared.get('actors',[]):
            package=local(base,actor['package'].rstrip('/')+'/package.json')
            declared_character_files.extend(str(f.relative_to(base)) for f in package.parent.rglob('*') if f.is_file())
    # The locked quality movie is permitted for COMPARISON, never an art input.
    story_inputs=[f for f in files if f!=comparison_reference or f in p.get('inputs',[])]
    protected=roles.audit_inputs(base,[*story_inputs,*declared_character_files],purpose)
    puppet_runtime,character_packages,registry,character_files=character_registry(base,p,cast_ids)
    files.extend(character_files)
    files.append('b6_asset_roles.py')
    # Validation checks data/hashes only. Authored modules are imported after --trusted-code.
    manifest=read(local(base,'engine/manifest.json'))
    required_font_license_files(base/'engine',manifest)
    for rel,digest in manifest['files'].items():
        require(sha(local(base,'engine/'+rel))==digest,'Locked engine changed: '+rel)
    ep=read(local(base,'engine/project.json'));eb=read(local(base,'engine/'+ep['bindings']));ef=sha(base/'engine/manifest.json')
    if p.get('bindings'):
        contract=read(local(base,p['bindings']))
        require(len(contract['coverage'])==round(p['duration']*30) and len(contract['leg_coverage'])==len(contract['coverage']),'New action needs complete per-frame limb inventory')
    digests={f:sha(local(base,f)) for f in sorted(set(files))};digests['engine/manifest.json']=ef
    fingerprint=hashlib.sha256(json.dumps(digests,sort_keys=True).encode()).hexdigest()
    return SimpleNamespace(purpose=purpose,protected_inputs=protected,project=p,plan=plan,cues=cues,audio=audio,fingerprint=fingerprint,inputs=digests,engine_project=ep,engine_bindings=eb,base=base,ratio=ratio,puppet_runtime=puppet_runtime,character_packages=character_packages,character_registry=registry)

def authored_contacts(scene, frame, contract):
    """New scenes provide their own prop endpoints, never inherited V90 logs."""
    import numpy as np
    require(callable(getattr(scene,'contacts',None)), 'New scene must expose independently projected prop contacts')
    require('contact_coverage' in contract and len(contract['contact_coverage'])==len(contract['coverage']), 'New scene needs complete prop-contact coverage')
    rows=scene.contacts()
    require(sorted(r['name'] for r in rows)==contract['contact_coverage'][frame], 'Missing, duplicated or unexpected authored prop contact')
    errors=[]
    for r in rows:
        hand=np.asarray(r['hand'],float);grip=np.asarray(r['grip'],float)
        require(hand.shape==grip.shape==(2,) and np.isfinite(hand).all() and np.isfinite(grip).all(), 'Nonfinite authored prop contact')
        error=float(np.linalg.norm(hand-grip))
        require(error<.5, 'Authored prop grip disconnected: '+r['name'])
        errors.append(error)
    return errors

def frame_contacts(engine, scene, frame, contract):
    # A composite may reuse draw() for its background while adding new props.
    # Its own inventory must cover those contacts, not the old performance log.
    if engine.context.project.get('bindings') or not engine.used_source_draw:
        return authored_contacts(scene,frame,contract)
    return engine.context.engine_runtime.check_contacts(engine.scene)

def caption_sidecars(out, cues, start, end):
    def stamp(seconds, separator):
        ms=round(seconds*1000);hours,ms=divmod(ms,3600000);minutes,ms=divmod(ms,60000);seconds,ms=divmod(ms,1000)
        return f'{hours:02}:{minutes:02}:{seconds:02}{separator}{ms:03}'
    visible=[{**cue,'start':max(start,cue['start'])-start,'end':min(end,cue['end'])-start} for cue in cues if cue['end']>start and cue['start']<end]
    srt=[];vtt=['WEBVTT\n']
    for i,cue in enumerate(visible,1):
        srt.append(f"{i}\n{stamp(cue['start'],',')} --> {stamp(cue['end'],',')}\n{cue['text']}\n")
        vtt.append(f"{stamp(cue['start'],'.')} --> {stamp(cue['end'],'.')}\n{cue['text']}\n")
    (out/'captions.srt').write_text('\n'.join(srt));(out/'captions.vtt').write_text('\n'.join(vtt))

class Engine:
    def __init__(self,c):
        c.engine_runtime=module('b6_locked_runtime',c.base/'engine/run.py')
        self.context=c;self.scene=c.engine_runtime.import_scene(c.base/'engine',c.engine_project,c.engine_bindings)
        self.b=self.scene.b;self.rig=self.scene.rig;self.source_frame=None;self.used_source_draw=False
        if c.project.get('bindings'):
            self.rig.BINDINGS={k:self.rig.Binding(v['character'],tuple(map(tuple,v['pins'])),tuple(v['lengths']),v['hand_style']) for k,v in read(c.base/c.project['bindings'])['profiles'].items()}
        self.original_caption=self.scene.m.caption;self.original_camera=self.scene.m.booth_camera
        self.scene.m.caption=lambda im,t:im
    def draw(self,source_time,camera=None):
        require(getattr(self.context,'purpose','production')=='example-reproduction' and self.context.project.get('character_system',{}).get('mode')=='locked-v90-performance','Frozen V90 source draw is example reproduction only; author a new-story scene with painted puppets')
        require(0<=source_time<20,'Reusable performance outside source range')
        require(self.context.ratio=='16:9','V90 performances need a newly staged portrait scene; no crop/stretch fallback')
        if camera is not None:
            require(6.6<=source_time<9 or 13.7<=source_time<18.7333333333,'Camera override is calibrated for booth world only')
            require(len(camera)==3 and all(math.isfinite(x) for x in camera) and camera[2]>0,'Finite uniform camera required')
            import numpy as np
            self.scene.m.booth_camera=lambda t:('authored-booth-camera',np.array(camera))
        else:self.scene.m.booth_camera=self.original_camera
        self.source_frame=round(source_time*30);self.used_source_draw=True
        return self.scene.draw(source_time)

def run(a):
    base=Path(a.project).resolve();c=load(base,a.ratio);p=c.project
    if a.command in ('approve','render'):
        require(c.purpose=='production','B6 '+c.purpose+' is technical-only / example-only: review text or deleted fixture flags cannot authorize a new-story finished export')
    if a.command=='validate':return {'purpose':c.purpose,'delivery_ready':False,'protected_inputs':c.protected_inputs,'valid':True,'renderer':p['renderer'],'fingerprint':c.fingerprint,'ratio':a.ratio,'duration':p['duration']}
    def motion_review():
        helper=Path(__file__).with_name('motion_review.py')
        if not helper.exists():helper=Path(__file__).with_name('b6_motion_review.py')
        require(helper.exists(),'Install the B6 motion-review helper before creative review')
        return verified_module('b6_motion_review_helper',helper,TRUSTED_MOTION_REVIEW_SHA256,'motion-review runtime')
    if a.command=='review-pack':
        require(a.report,'Choose the actual encoded preview --report')
        return motion_review().build_pack(c,a.report,a.output,a.review)
    if a.command=='check-review':
        require(a.review,'Choose the completed --review motion-review.json')
        return motion_review().validate_review(c,a.review,a.report)
    if a.command=='approve':
        require(a.report and a.note.strip(),'Actual user-reviewed report and genuine approval note required')
        r=read(local(base,a.report));video=local(base,r['video'])
        require(r.get('kind')=='preview' and not r.get('technical_fixture') and r['fingerprint']==c.fingerprint and r['video_sha256']==sha(video) and r['ratio']==a.ratio,'Reviewed preview/source changed or is technical-only')
        require(a.review,'Creative motion review required before recording user approval: --review motion-review.json')
        reviewed=motion_review().validate_review(c,a.review,a.report)
        target=base/f"approval-{a.ratio.replace(':','x')}.json"
        record={'fingerprint':c.fingerprint,'video':r['video'],'video_sha256':sha(video),'motion_review':reviewed,'note':a.note}
        if target.exists():
            history=base/'approvals';history.mkdir(exist_ok=True)
            previous=history/f'{target.stem}-{sha(target)}.json'
            if not previous.exists():previous.write_bytes(target.read_bytes())
            record['supersedes']=str(previous.relative_to(base))
        save(target,record);return {'approval':str(target)}
    require(a.trusted_code,'Inspect authored source, then allow --trusted-code')
    start=round(a.start*30);end=round((a.start+(a.seconds if a.seconds is not None else p['duration']-a.start))*30)
    require(0<=start<end<=round(p['duration']*30),'Invalid authored timeline range')
    if a.command=='render':
        approval=read(base/f"approval-{a.ratio.replace(':','x')}.json")
        require(approval['fingerprint']==c.fingerprint and approval['video_sha256']==sha(local(base,approval['video'])),'User-reviewed preview changed')
        reviewed=approval.get('motion_review',{})
        require(reviewed.get('review') and sha(local(base,reviewed['review']))==reviewed.get('sha256'),'Creative review missing/changed since user approval')
        motion_review().validate_review(c,reviewed['review'])
        start,end=0,round(p['duration']*30)
    require(a.command!='preview' or end-start<=1800,'Preview at most 60 seconds')
    out=(base/a.output).resolve();require(out.is_relative_to(base) and not out.exists(),'Choose a fresh project-local output directory')
    c.engine_runtime=module('b6_locked_runtime',base/'engine/run.py')
    reads,outside=c.engine_runtime.resource_audit(base)
    # New-story frames never receive the old source performance or its art objects.
    # Keep the complete engine on disk for explicit reproduction and implementation reference.
    e=Engine(c) if c.purpose=='example-reproduction' and p.get('character_system',{}).get('mode')=='locked-v90-performance' else None
    if e is not None:c.engine=e
    scene_scope=authored_process_scope(c.purpose)
    roles=asset_roles()
    read_scope=roles.actual_reads_scope(base,reads,c.purpose)
    with scene_scope(),read_scope():
        scene=module('b6_authored_scene',local(base,p['scene']))
    checked_reads=set()
    def check_story_reads():
        fresh=set(reads)-checked_reads
        # Output data is not a production input; compare-only references read by
        # scene code ARE inputs here and cannot become a background/video layer.
        source=[rel for rel in fresh if not rel.startswith(str(out.relative_to(base))+'/')]
        roles.audit_inputs(base,source,c.purpose)
        checked_reads.update(fresh)
    from PIL import Image,ImageDraw
    import numpy as np
    out.mkdir(parents=True);w,h=c.plan['width'],c.plan['height'];thumbs=[];arms=legs=0;maxcontact=0
    captions=caption_helper();caption_raster=captions.CaptionRenderer(base,a.ratio,w,h,c.plan['caption']);caption_observations={}
    encoder=None
    if a.command in ['preview','render']:
        encoder=subprocess.Popen(['ffmpeg','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r','30','-i','-','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',str(out/'silent.mp4')],stdin=subprocess.PIPE,stderr=open(out/'encode.log','w'))
    try:
        with open(out/'limb-frames.jsonl','w') as log:
            for i in range(start,end):
                t=i/30
                if e is not None:e.used_source_draw=False;e.source_frame=None;e.rig.reset(i)
                with scene_scope(),read_scope():
                    rendered=scene.frame(t,c)
                check_story_reads()
                if c.puppet_runtime is not None:
                    require(isinstance(rendered,c.puppet_runtime.RenderResult),'Character-system scenes must return the final painted RenderResult, including all foreground occluders')
                    visible_shots={s['id'] for s in c.plan['shots'] if s['start']<=t<s['end']}
                    active={a['id'] for a in c.plan['cast_inventory'] if visible_shots.intersection(a['shot_ids'])}
                    expected=active.intersection(c.character_packages)
                    c.puppet_runtime.validate_render_result(rendered,expected_actor_ids=expected)
                    require(rendered.qa['frame_index']==i,'Stale character evidence')
                    declared={a['id']:a for a in c.character_registry['actors']}
                    for actor in rendered.qa['actors']:
                        ident=actor['actor_id'];character=c.character_packages[ident]
                        require(actor['package_fingerprint']==character.fingerprint and actor['character_id']==character.character_id,'Rendered actor differs from registered painted package: '+ident)
                        require(actor['view_id'] in declared[ident]['views'],'Rendered unregistered character view: '+ident)
                    im=rendered.beauty.convert('RGB');qa=rendered.qa
                    frame_arms=qa['arms'];frame_legs=qa['legs'];contacts=qa.get('contact_errors',[])
                    require(not qa.get('errors'),'Visible character checks failed')
                    maxcontact=max([maxcontact,*contacts]);arms+=len(frame_arms);legs+=len(frame_legs)
                    log.write(json.dumps({'frame':i,'character_system':'b6-puppet/1',**qa})+'\n')
                else:
                    require(e is not None,'New-story production requires the painted-puppet RenderResult, not old source imagery or numeric-only bindings')
                    im=rendered.convert('RGB')
                    if p.get('character_system',{}).get('mode')=='locked-v90-performance':
                        require(e.used_source_draw,'The legacy exception permits only the locked source performance, not new cast/actions')
                    require(e.used_source_draw or p.get('bindings'),'New action requires a project-local reviewed coverage/binding contract')
                    contract=read(base/p['bindings']) if p.get('bindings') else c.engine_bindings
                    fi=i if p.get('bindings') else e.source_frame
                    c.engine_runtime.check_arms(e.rig.RECORDS,fi,contract);c.engine_runtime.check_legs(e.rig.LEGS,contract,fi)
                    contacts=frame_contacts(e,scene,i,contract)
                    maxcontact=max([maxcontact,*contacts]);arms+=len(e.rig.RECORDS);legs+=len(e.rig.LEGS)
                    log.write(json.dumps({'frame':i,'performance_frame':e.source_frame,'arms':e.rig.RECORDS,'legs':e.rig.LEGS,'contacts':contacts})+'\n')
                require(im.size==(w,h),'Scene must render at native dimensions; no automatic crop/stretch')
                if c.purpose!='production':
                    badge='B6 DIAGNOSTIC - NOT A FINISHED STORY' if c.purpose=='diagnostic' else 'B6 EXAMPLE REPRODUCTION - NOT A NEW STORY'
                    overlay=ImageDraw.Draw(im);overlay.rectangle((0,0,w,28),fill='#392f2f');overlay.text((8,7),badge,fill='#fff0c5')
                cue=next((q for q in c.cues if q['start']<=t<q['end']),None)
                if cue:
                    bounds=caption_raster.draw(im,cue['text'])
                    key=(cue['start'],cue['end'],cue['text'])
                    caption_observations[key]={**cue,'raster_bounds':bounds}
                if encoder:encoder.stdin.write(im.tobytes())
                if i in np.linspace(start,end-1,12,dtype=int):
                    im.save(out/f'frame-{i:04}.png');thumbs.append((t,im.resize((320,round(320*h/w)))))
                if (i-start)%60==0:print(json.dumps({'checked_frame':i,'total':end-start}),flush=True)
        if encoder:
            encoder.stdin.close();require(encoder.wait()==0,'Video encoder failed')
            subprocess.run(['ffmpeg','-v','error','-i',str(out/'silent.mp4'),'-ss',str(start/30),'-i',str(c.audio),'-map','0:v:0','-map','1:a:0','-t',str((end-start)/30),'-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart',str(out/'preview.mp4')],check=True)
            (out/'silent.mp4').unlink()
    finally:
        if encoder and encoder.poll() is None:encoder.kill();encoder.wait()
    tileh=thumbs[0][1].height+24;board=Image.new('RGB',(1280,math.ceil(len(thumbs)/4)*tileh),'#f3e8da');d=ImageDraw.Draw(board)
    for j,(t,im) in enumerate(thumbs):x=j%4*320;y=j//4*tileh;board.paste(im,(x,y+24));d.text((x+6,y+5),f'{t:.2f}s',fill='#382b28')
    board.save(out/'contact-sheet.jpg',quality=95)
    caption_sidecars(out,c.cues,start/30,end/30)
    undeclared=[f for f in reads if not f.startswith('engine/') and not f.startswith(str(out.relative_to(base))+'/') and f not in c.inputs]
    require(not undeclared,'Declare project-local code/art dependencies in inputs: '+str(undeclared))
    result={'status':'automated_checks_passed_pending_visual_and_user_review','kind':a.command,'technical_fixture':c.purpose!='production','purpose':c.purpose,'delivery_ready':False,'protected_inputs':c.protected_inputs,'ratio':a.ratio,'fingerprint':c.fingerprint,'checked_frames':end-start,'arm_poses_checked':arms,'straight_legs_checked':legs,'max_prop_contact_error_px':maxcontact,'external_media_reads':sorted(outside),'voice_speed':1,'new_story_acceptance':'not implied by reusing a tested performance'}
    result.update(time_range={'start':start/30,'end':end/30},technical_status='pass',creative_status='pending_actual_playback_and_source_review',user_acceptance='not_inferred',review_required='review-pack then check-review; numeric QC never certifies motion quality')
    result['caption_sidecars']=[str((out/name).relative_to(base)) for name in ['captions.srt','captions.vtt']]
    result['caption_contract']=captions.contract(c.plan['caption'],base/'caption_renderer.py',base/c.plan['caption']['font_file'],sha(base/p['captions']),list(caption_observations.values()))
    if encoder:result.update(video=str((out/'preview.mp4').relative_to(base)),video_sha256=sha(out/'preview.mp4'))
    save(out/'report.json',result);save(out/'resource-audit.json',{'project_reads':sorted(reads),'external_media_reads':sorted(outside)})
    return result

if __name__=='__main__':
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('command',choices=['validate','frames','preview','review-pack','check-review','approve','render']);ap.add_argument('project');ap.add_argument('--ratio',required=True,choices=['16:9','9:16']);ap.add_argument('--trusted-code',action='store_true');ap.add_argument('--start',type=float,default=0);ap.add_argument('--seconds',type=float);ap.add_argument('--output',default='outputs/preview-01');ap.add_argument('--report');ap.add_argument('--review');ap.add_argument('--note',default='')
    print('\nRESULT '+json.dumps(run(ap.parse_args()),ensure_ascii=False))
