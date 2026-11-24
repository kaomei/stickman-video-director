#!/usr/bin/env python3
"""Portable B8 production workflow; authored illustrated assets, never joint synthesis.
Commands emit reviewable artifacts. Approval records must quote actual user messages;
writing a record cannot create user consent or prove image quality.
"""
import argparse, copy, datetime, hashlib, json, math, os, pathlib, shutil, subprocess, sys
import b8_visual_review as visual
from b8_portable import sha_file as sha
ROOT = pathlib.Path(__file__).resolve().parents[1]
ANCHOR = ('Expressive 2D cartoon in the attached approved B8 drawing family: dark-brown contours, '
          'grouped cel shading with painterly texture, simplified thin limbs, compact rounded cartoon '
          'hands and naturally narrow wrists. Match drawing density, stylization and lighting grammar '
          'across the cast. Hands and face share the same degree of simplification. Preserve the '
          'separately specified identity, skin tone, hair, costume and accessories. No photorealistic '
          'hands, extra limbs, new cuffs or stretched arms.')
REFERENCE = ROOT/'assets/b8/approved-midas-r3-v1'
STAGES = ('proposal', 'keyposes', 'sample')

def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(x): return hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def write(p,x):
    p=pathlib.Path(p);p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def read(p): return json.loads(pathlib.Path(p).read_text())
def local(base,value):
    p=pathlib.Path(value)
    if p.is_absolute() or '..' in p.parts: raise ValueError('Project media must use contained relative paths: '+str(value))
    full=(base/p).resolve()
    if not full.is_relative_to(base.resolve()): raise ValueError('Media path escapes project: '+str(value))
    return full

def project(arg):
    p=pathlib.Path(arg).resolve()
    if p.is_dir(): p=p/'project.json'
    d=read(p)
    if d.get('style')!='B8' or d.get('schema_version')!=1: raise ValueError('Expected B8 schema_version 1 project')
    return p,d

def checkpoint(p,d):
    p=pathlib.Path(p).resolve()
    # Existing projects can name their existing checkpoint rather than get a competing state file.
    cp=local(p.parent,d.get('checkpoint','checkpoint.json'))
    value=read(cp) if cp.exists() else {}
    flow=value.setdefault('b8_pipeline',{'approvals':[],'artifacts':[]})
    return cp,value,flow

def save_state(p,d,stage,artifacts=(),**extra):
    cp,state,flow=checkpoint(p,d)
    flow.update({'stage':stage,'updated_at':now(),**extra})
    flow['artifacts']=list(dict.fromkeys(flow.get('artifacts',[])+[str(pathlib.Path(a).resolve()) for a in artifacts]))
    state['updated_at']=now();write(cp,state)
    return str(cp)

def init(directory,ratio='16:9'):
    target=pathlib.Path(directory).resolve()
    if target.exists(): raise ValueError('Project exists; continue its manifest/checkpoint instead of overwriting')
    if target.is_relative_to(ROOT): raise ValueError('Create the project outside the installed skill')
    if ratio not in ('16:9','9:16'): raise ValueError('ratio must be 16:9 or 9:16')
    target.mkdir(parents=True)
    (target/'assets').mkdir();(target/'audio').mkdir()
    shutil.copytree(REFERENCE,target/'references/b8')
    (target/'assets/fonts').mkdir()
    for filename in ('NotoSans.ttf','OFL-NotoSans.txt'): shutil.copy2(ROOT/'assets/fonts'/filename,target/'assets/fonts'/filename)
    w,h=(1280,720) if ratio=='16:9' else (720,1280)
    d={'schema_version':1,'style':'B8','title':'','width':w,'height':h,'fps':60,'duration':0,
       'checkpoint':'checkpoint.json','drawing_family':{'baseline':'approved-midas-r3-v1','anchor':ANCHOR,
       'references':['references/b8/character-style-board.jpg','references/b8/contact-sequence-board.jpg'] + (['references/b8/portrait-fullbody-board.jpg','references/b8/portrait-arm-direction-board.jpg','references/b8/portrait-opening-contact-board.jpg'] if ratio=='9:16' else [])},
       'script':'','narration':None,'audio_master':None,'captions':[],'caption_style':{'font':'assets/fonts/NotoSans.ttf','font_sha256':sha(ROOT/'assets/fonts/NotoSans.ttf'),'size':round(h*0.043),'color':[255,255,255],'stroke_color':[35,24,15],'stroke_width':1,'y':round(h*0.91),'max_width':round(w*0.9)},'story_rules':[], 'characters':[], 'assets':{}, 'shots':[]}
    write(target/'project.json',d)
    from b8_portable import install_runtime
    runtime=install_runtime(target,ROOT)
    save_state(target/'project.json',d,'director_proposal_required',next='Author complete story/shot/cast/contact plan; generate proposal board before new accurate poses or animation.',paid_calls=0)
    return {'project':str(target/'project.json'),'stage':'director_proposal_required','reference_pack':'references/b8','default_drawing_family':True,'local_runtime':runtime,'note':'Scaffold with a project-local runtime; no invented narration, missing artwork or user approvals.'}

def selected(d,start=0,end=None):
    end=d['duration'] if end is None else end
    if not (0<=start<end<=d['duration']): raise ValueError('Invalid authorized time range')
    return [s for s in d['shots'] if s['start']<end and s['end']>start]

def used_assets(shots):
    ids=set()
    for shot in shots:
        for layer in shot.get('layers',[]):
            ids.add(layer.get('asset'))
            ids.update(x.get('asset') for x in layer.get('states',[]))
            if layer.get('material'): ids.update(layer['material'].get(k) for k in ('asset','mask'))
    return sorted(x for x in ids if x)

def pose_assets(shots):
    """Drawings whose anatomy/style is reviewed, including separate key poses."""
    ids=set(used_assets(shots))
    for shot in shots:
        poses=shot.get('keypose_assets',[])
        if isinstance(poses,list): ids.update(a for a in poses if isinstance(a,str) and a)
    return sorted(ids)

def shot_digest(d,s,stage,base):
    if stage=='proposal':
        # Describes proposed information/actions; accurate art files can be added after this approval.
        excluded={'layers','keypose_assets','pose_review'}
        record={k:v for k,v in s.items() if k not in excluded}
        inputs=[]
    else:
        record=copy.deepcopy(s)
        inputs=pose_assets([s])
    if s.get('proposal_composition_asset'): inputs.append(s['proposal_composition_asset'])
    record['asset_inputs']={a:{**d['assets'][a],'actual_sha256':sha(local(base,d['assets'][a]['path'])) if local(base,d['assets'][a]['path']).is_file() else None} for a in sorted(set(inputs)) if a in d.get('assets',{})}
    return digest(record)

def global_digest(d,stage,base):
    keys=['title','script','width','height','fps','duration','drawing_family','characters','story_rules','narration','audio_master','captions','caption_style']
    value={k:d.get(k) for k in keys}
    # Original reference/voice file mutations invalidate review even if declared hashes weren't updated.
    files=list(d.get('drawing_family',{}).get('references',[]))
    files.extend(f for c in d.get('characters',[]) for f in c.get('references',[]))
    if d.get('narration'): files.append(d['narration']['path'])
    if d.get('audio_master'): files.append(d['audio_master']['path'])
    if d.get('caption_style',{}).get('font'): files.append(d['caption_style']['font'])
    value['actual_inputs']={f:sha(local(base,f)) if local(base,f).is_file() else None for f in files}
    return digest(value)

def valid_range(value,duration):
    return (isinstance(value,(list,tuple)) and len(value)==2 and
            all(isinstance(t,(int,float)) and not isinstance(t,bool) and math.isfinite(t) for t in value) and
            0<=value[0]<value[1]<=duration)

def covers(intervals,start,end):
    cursor=start
    for left,right in sorted(intervals):
        if right<=cursor: continue
        if left>cursor+1e-9: return False
        cursor=max(cursor,right)
        if cursor>=end-1e-9: return True
    return False

def approval_ok(p,d,stage,shots,start=None,end=None):
    _,_,flow=checkpoint(p,d);glob=global_digest(d,stage,p.parent)
    requested={s['id']:(max(s['start'],s['start'] if start is None else start),min(s['end'],s['end'] if end is None else end)) for s in shots}
    requested={sid:span for sid,span in requested.items() if span[0]<span[1]}
    hashes={s['id']:shot_digest(d,s,stage,p.parent) for s in shots}
    intervals={sid:[] for sid in requested}
    for a in flow.get('approvals',[]):
        if a.get('stage')!=stage or a.get('global_digest')!=glob: continue
        if not a.get('user_message','').strip(): continue
        if not valid_range(a.get('range'),d['duration']): continue
        review=a.get('quality_review_manifest')
        if review:
            try:
                manifest=local(p.parent,review['path'])
                if not manifest.is_file() or sha(manifest)!=review['sha256']: continue
            except (OSError,KeyError,ValueError): continue
        files=a.get('artifacts',[])
        if not files or any(not local(p.parent,f['path']).is_file() or sha(local(p.parent,f['path']))!=f['sha256'] for f in files): continue
        for sid in requested:
            if a.get('shot_digests',{}).get(sid)==hashes[sid]: intervals[sid].append(a['range'])
    missing=sorted(sid for sid,(left,right) in requested.items() if not covers(intervals[sid],left,right))
    return not missing,missing

def audio_duration(path):
    """Probe the first audio stream actually selected by the muxer."""
    command=[os.environ.get('FFPROBE','ffprobe'),'-v','error','-select_streams','a:0','-show_entries','stream=duration:format=duration','-of','json',str(path)]
    try:
        probe=json.loads(subprocess.check_output(command,stderr=subprocess.PIPE,timeout=30))
        streams=probe.get('streams',[])
        if not streams: raise ValueError('no audio stream')
        for value in (streams[0].get('duration'),probe.get('format',{}).get('duration')):
            try:duration=float(value)
            except (TypeError,ValueError):continue
            if math.isfinite(duration) and duration>0:return duration
        raise ValueError('invalid audio duration')
    except (OSError,subprocess.SubprocessError,ValueError,TypeError) as exc:
        raise ValueError('Cannot verify complete original audio duration: '+str(path)) from exc

def validate(d,base,production=False):
    errors=[];warnings=[]
    for name in ('title','script'):
        if not isinstance(d.get(name),str) or not d[name].strip(): errors.append(name+' is required')
    if not isinstance(d.get('duration'),(int,float)) or not math.isfinite(d['duration']) or d['duration']<=0: errors.append('positive actual/tentative duration required')
    chars=d.get('characters',[]);ids=[c.get('id') for c in chars]
    if not chars or len(set(ids))!=len(ids) or any(not c for c in ids): errors.append('all cast identities with unique ids required')
    for c in chars:
        if not c.get('identity') or not c.get('regions'): errors.append('identity and body-region contract required: '+str(c.get('id')))
        character_refs=c.get('references',[])
        if not isinstance(character_refs,list) or any(not isinstance(f,str) or not f for f in character_refs):
            errors.append('character references must be relative image paths: '+str(c.get('id')))
        else:
            for f in character_refs:
                try:
                    if not local(base,f).is_file(): errors.append('missing character reference: '+f)
                except (OSError,ValueError) as e: errors.append(str(e))
    refs=d.get('drawing_family',{}).get('references',[])
    if not refs: errors.append('attached approved drawing-family references required')
    for f in refs:
        try:
            if not local(base,f).is_file(): errors.append('missing drawing-family reference: '+f)
        except ValueError as e: errors.append(str(e))
    shots=d.get('shots',[]);cursor=0;seen=set()
    for s in shots:
        sid=s.get('id')
        if not sid or sid in seen: errors.append('unique shot id required')
        seen.add(sid)
        if not isinstance(s.get('start'),(int,float)) or not isinstance(s.get('end'),(int,float)) or s.get('end',0)<=s.get('start',0): errors.append('invalid shot interval: '+str(sid));continue
        if abs(s['start']-cursor)>1e-6: errors.append('gap/overlap at '+str(sid))
        cursor=s['end']
        for k in ('scene','framing','information_change','camera_motivation','action','reaction','contact_audit'):
            if k not in s or s[k] in ('',None): errors.append(str(sid)+': missing '+k)
        if not set(s.get('characters',[])).issubset(set(ids)): errors.append(str(sid)+': unknown cast id')
        drawings=s.get('keypose_assets',[])
        if not isinstance(drawings,list) or any(not isinstance(a,str) or not a for a in drawings):
            errors.append(str(sid)+': keypose_assets must contain asset IDs');drawings=[]
        else: drawings=list(drawings)
        composition=s.get('proposal_composition_asset')
        if composition is not None:
            if not isinstance(composition,str) or not composition:errors.append(str(sid)+': proposal_composition_asset must be an asset ID')
            else:drawings.append(composition)
        for aid in drawings:
            asset=d.get('assets',{}).get(aid)
            if not isinstance(asset,dict): errors.append(str(sid)+': unknown review drawing asset: '+aid);continue
            try:
                if sha(local(base,asset['path']))!=asset.get('sha256'):errors.append(str(sid)+': review drawing SHA-256 mismatch: '+aid)
            except (OSError,KeyError,ValueError) as e:errors.append(str(sid)+': review drawing '+aid+': '+str(e))
        for contact in s.get('contacts',[]):
            for k in ('object','trigger','object_extent','support','before','after','continuity','phase_times'):
                if not contact.get(k): errors.append(str(sid)+': contact needs '+k)
            t=contact.get('phase_times',{})
            sequence=[t.get(k) for k in ('approach','contact','change','result','reaction')]
            if any(not isinstance(x,(int,float)) for x in sequence) or any(a>b for a,b in zip(sequence,sequence[1:])): errors.append(str(sid)+': contact phases must be ordered approach/contact/change/result/reaction')
            elif sequence[0]<s['start'] or sequence[-1]>d['duration']: errors.append(str(sid)+': contact/reaction outside story')
        if production and not s.get('layers'): errors.append(str(sid)+': draw independent layers before animation')
        if production:
            for layer in s.get('layers',[]):
                if layer.get('material'):
                    hits=[c for c in s.get('contacts',[]) if c.get('layer_id')==layer.get('id')]
                    if not hits:errors.append(str(sid)+': material change needs matching contact audit layer_id')
                    elif any(layer['material']['start']+s['start']<c['phase_times']['contact'] for c in hits):errors.append(str(sid)+': material change precedes physical contact')
    if not shots or abs(cursor-d.get('duration',0))>1e-6: errors.append('shot ledger must cover the complete duration')
    signatures=[(s.get('scene'),s.get('framing'),s.get('action')) for s in shots]
    for i in range(2,len(signatures)):
        if signatures[i]==signatures[i-1]==signatures[i-2]: warnings.append('Repeated scene/framing/action at '+str(shots[i]['id'])+'; review information and staging')
    if len(shots)>2 and len({s.get('scene') for s in shots})==1: warnings.append('Single location: assess spatial variety, inserts and consequences; do not force unrelated locations')
    n=d.get('narration')
    if n:
        try:
            f=local(base,n['path'])
            if sha(f)!=n.get('sha256'): errors.append('original narration SHA-256 mismatch')
        except (OSError,KeyError,ValueError) as e:errors.append('narration: '+str(e))
        if n.get('speed',1)!=1: errors.append('approved narration must remain at original speed 1')
    master=d.get('audio_master')
    if master:
        try:
            if sha(local(base,master['path']))!=master.get('sha256'):errors.append('audio master SHA-256 mismatch')
        except (OSError,KeyError,ValueError) as e:errors.append('audio master: '+str(e))
        if master.get('speed',1)!=1:errors.append('audio master must remain at speed 1')
    if d.get('captions'):
        canonical=lambda x:''.join(c.lower() for c in x if c.isalnum())
        if canonical(' '.join(c.get('text','') for c in d['captions']))!=canonical(d.get('script','')):errors.append('caption text must preserve the complete approved script without missing/repeated/reordered words')
    if production:
        if (n or master) and not d.get('captions'):errors.append('Aligned semantic captions required for narrated production, including audio-master-only projects')
        from b8_scene import validate_plan
        errors.extend(validate_plan(d,base))
        for aid in pose_assets(shots):
            a=d.get('assets',{}).get(aid,{})
            if a.get('character_id'):
                if a['character_id'] not in ids: errors.append(aid+': unknown character')
                r=a.get('review',{})
                if r.get('status')!='accepted' or r.get('asset_sha256')!=a.get('sha256') or not r.get('reviewer') or not r.get('notes'): errors.append(aid+': actual style/anatomy review absent or stale')
        for s in shots:
            for cid in s.get('characters',[]):
                if not any(d.get('assets',{}).get(a,{}).get('character_id')==cid for a in used_assets([s])): errors.append(s['id']+': visible cast has no reviewed drawn asset: '+cid)
    return {'ok':not errors,'errors':errors,'warnings':list(dict.fromkeys(warnings)), 'scope':'Schema, input integrity and recorded review only; visual/causal quality still requires actual review.'}

def prompts(d,base):
    from b8_drawing_jobs import build_jobs
    return build_jobs(d,base,ANCHOR)

def make_boards(p,d,stage):
    p=pathlib.Path(p).resolve()
    if stage=='keyposes' and not approval_ok(p,d,'proposal',d['shots'])[0]:raise ValueError('Approve the actual director proposal before accurate-keypose production')
    from PIL import Image,ImageDraw,ImageFont,ImageOps
    result=validate(d,p.parent,production=stage=='keyposes')
    if not result['ok']: raise ValueError('\n'.join(result['errors']))
    out=p.parent/'outputs/b8-review'/digest({'quality_review_version':visual.VERSION,'plan':d,'stage':stage,'global_digest':global_digest(d,stage,p.parent),'shot_digests':{s['id']:shot_digest(d,s,stage,p.parent) for s in d['shots']}})[:16]
    if out.exists():
        manifest=out/'review-manifest.json'
        if manifest.exists(): return {'review_manifest':str(manifest),**read(manifest)}
        raise ValueError('Incomplete review folder exists; preserve and use a new plan version')
    out.mkdir(parents=True)
    font=ImageFont.truetype(str(ROOT/'assets/fonts/NotoSans.ttf'),16)
    small=ImageFont.truetype(str(ROOT/'assets/fonts/NotoSans.ttf'),13)
    # Numeric shot IDs and pictured drawings are legible irrespective of script language.
    # Full semantic text remains in UTF-8 shot-ledger.html rather than rasterizing missing CJK glyphs.
    def grid(items,name,missing="DRAWING REQUIRED"):
        cols=3;cw,ch=400,440;rows=max(1,math.ceil(len(items)/cols))
        im=Image.new('RGB',(cols*cw,rows*ch),(241,231,211));draw=ImageDraw.Draw(im)
        for i,(label,assetids) in enumerate(items):
            x=(i%cols)*cw;y=(i//cols)*ch
            draw.rectangle((x+6,y+6,x+cw-6,y+ch-6),outline=(92,64,42),width=2)
            if not assetids: draw.text((x+20,y+105),missing,font=font,fill=(110,64,52))
            for aid in assetids:
                a={'path':aid[len('@reference:'):]} if aid.startswith('@reference:') else d.get('assets',{}).get(aid,{})
                if not a.get('path'):continue
                f=local(p.parent,a['path'])
                if not f.exists():continue
                pic=Image.open(f).convert('RGBA');pic.thumbnail((cw-24,ch-75))
                pos=(x+(cw-pic.width)//2,y+35)
                im.paste(pic,pos,pic)
            draw.text((x+14,y+ch-31),label[:47],font=small,fill=(60,36,24))
        filename=out/name;im.save(filename,quality=92);return filename
    def pages(label,ids):
        return [(label+' / '+aid,[aid]) for aid in ids] or [(label,[])]
    shots=d['shots']
    director=grid([(str(s['id'])+'  '+str(s['start'])+'-'+str(s['end'])+'s',([s['proposal_composition_asset']] if s.get('proposal_composition_asset') else [])) for s in shots],'director-board.jpg',missing='COMPOSITION REQUIRED')
    cast=grid([('COMMON B8 DRAWING FAMILY',['@reference:'+f]) for f in d['drawing_family']['references'][:1]]+[page for c in d['characters'] for page in pages(c['id'],[aid for aid,a in d.get('assets',{}).items() if a.get('character_id')==c['id']])],'cast-style-board.jpg')
    keyposes=grid([page for s in shots for page in pages(str(s['id'])+'  CONTACT / RESULT',pose_assets([s]))],'keypose-board.jpg')
    write(out/'drawing-prompts.json',prompts(d,p.parent));write(out/'shot-ledger.json',{'title':d['title'],'rules':d['story_rules'],'shots':shots,'cast':d['characters'],'warnings':result['warnings']})
    import html
    text=html.escape(json.dumps({'title':d['title'],'rules':d['story_rules'],'shots':shots,'cast':d['characters'],'warnings':result['warnings']},ensure_ascii=False,indent=2))
    (out/'shot-ledger.html').write_text('<!doctype html><meta charset="utf-8"><title>B8 Director Proposal</title><style>body{max-width:1200px;margin:30px auto;background:#f1e7d3;color:#3c2418;font:16px/1.6 system-ui}img{width:100%}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><h1>B8 · '+html.escape(d['title'])+'</h1><p>Proposal drawings may be rough or missing. Review the full ledger; this export is not approval.</p><img src="director-board.jpg"><img src="cast-style-board.jpg"><img src="keypose-board.jpg"><pre>'+text+'</pre>')
    files=[director,cast,keyposes,out/'drawing-prompts.json',out/'shot-ledger.json',out/'shot-ledger.html']
    report={'schema_version':1,'stage':stage,'created_at':now(),'global_digest':global_digest(d,stage,p.parent),'shot_digests':{s['id']:shot_digest(d,s,stage,p.parent) for s in shots},'artifacts':[{'path':str(f.relative_to(p.parent)),'sha256':sha(f)} for f in files],'approval':'pending','warnings':result['warnings'],'quality_review':visual.template(d,shots,stage)}
    write(out/'review-manifest.json',report)
    save_state(p,d,stage+'_pending_user_review',files+[out/'review-manifest.json'],next='Show actual boards and ledger; record genuine user approval for this version before the next production stage.')
    return {'review_manifest':str(out/'review-manifest.json'),**report}

def approve(p,d,stage,artifact,note,start=0,end=None,authorize_through=None):
    p=pathlib.Path(p).resolve()
    if not note or not note.strip(): raise ValueError('Record the actual explicit user message; CLI invocation is not consent')
    reviewfile=pathlib.Path(artifact).resolve()
    if not reviewfile.is_relative_to(p.parent): raise ValueError('Review manifest must be inside project')
    report=read(reviewfile);shots=selected(d,start,end)
    finish=d['duration'] if end is None else end
    if stage=='proposal':
        for shot in shots:
            aid=shot.get('proposal_composition_asset');asset=d.get('assets',{}).get(aid,{})
            try:
                if not aid or not asset.get('path') or sha(local(p.parent,asset['path']))!=asset.get('sha256'):
                    raise ValueError('missing or changed composition drawing')
            except (OSError,ValueError) as exc:
                raise ValueError('Proposal composition drawing required before approval: '+shot['id']) from exc
    if stage=='sample':
        if report.get('kind')!='b8_encoded_sample': raise ValueError('sample approval requires an actual encoded sample report')
        actual=report.get('range')
        if not valid_range(actual,d['duration']) or actual[0]>start+1e-9 or actual[1]<finish-1e-9:
            raise ValueError('Sample approval range must be covered by the actual encoded sample range')
    elif report.get('stage')!=stage: raise ValueError('Review stage mismatch')
    if report.get('global_digest')!=global_digest(d,stage,p.parent): raise ValueError('Review changed; export/review affected artifacts again')
    for s in shots:
        if report.get('shot_digests',{}).get(s['id'])!=shot_digest(d,s,stage,p.parent): raise ValueError('Stale/missing shot review: '+s['id'])
    for f in report.get('artifacts',[]):
        if sha(local(p.parent,f['path']))!=f['sha256']: raise ValueError('Reviewed artifact changed')
    if not report.get('artifacts'): raise ValueError('No actual reviewed artifacts')
    errors=visual.known_failures(report)+visual.errors(report.get('quality_review'),d,shots,stage,report['artifacts'])
    if errors: raise ValueError('Visual review required:\n'+'\n'.join(errors))
    # Freeze the reviewed version; finishing other shots in the pending report must
    # not revoke an otherwise unchanged earlier partial approval.
    approved=reviewfile.parent/('approved-'+stage+'-'+digest({'report':report,'range':[start,finish]})[:20]+'.json')
    if approved.exists():
        if read(approved)!=report: raise ValueError('Approved review snapshot conflict')
    else:
        with approved.open('x') as stream: stream.write(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    cp,state,flow=checkpoint(p,d)
    record={'stage':stage,'user_message':note,'recorded_at':now(),'global_digest':report['global_digest'],'shot_digests':{s['id']:report['shot_digests'][s['id']] for s in shots},'range':[start,d['duration'] if end is None else end],'artifacts':report['artifacts'],'quality_review_manifest':{'path':str(approved.relative_to(p.parent)),'sha256':sha(approved)},'quality_review':copy.deepcopy(report['quality_review'])}
    flow.setdefault('approvals',[]).append(record)
    if authorize_through is not None:
        if stage!='sample' or not start<authorize_through<=d['duration']: raise ValueError('authorize-through is an explicit production scope on a genuine sample approval')
        scope=selected(d,start,authorize_through)
        flow['production_authorization']={'user_message':note,'range':[start,authorize_through],'global_digest':global_digest(d,'sample',p.parent),'shot_digests':{s['id']:shot_digest(d,s,'sample',p.parent) for s in scope},'recorded_at':now()}
    flow.update(stage=stage+'_approved',updated_at=now());write(cp,state)
    return {'recorded':stage,'checkpoint':str(cp),'scope':record['range'],'note':'Only records supplied genuine approval; does not grant fees, release or expansion.'}

def render_project(p,d,output,start=0,end=None,full=False):
    p=pathlib.Path(p).resolve()
    result=validate(d,p.parent,production=True)
    if not result['ok']: raise ValueError('\n'.join(result['errors']))
    shots=selected(d,start,end)
    finish=d['duration'] if end is None else end
    for stage in ('proposal','keyposes'):
        ok,missing=approval_ok(p,d,stage,shots,start,finish)
        if not ok: raise ValueError(stage+' approval missing/stale for: '+', '.join(missing))
    if full:
        for label in ('narration','audio_master'):
            media=d.get(label)
            if media and audio_duration(local(p.parent,media['path']))>d['duration']+1e-6:
                raise ValueError('Full timeline would truncate complete original '+label+'; extend the story duration without changing the audio')
        _,_,flow=checkpoint(p,d);auth=flow.get('production_authorization',{})
        if not auth.get('user_message') or auth.get('global_digest')!=global_digest(d,'sample',p.parent) or auth.get('range',[1,0])[0]>start or auth.get('range',[1,0])[1]<(d['duration'] if end is None else end) or any(auth.get('shot_digests',{}).get(s['id'])!=shot_digest(d,s,'sample',p.parent) for s in shots):
            raise ValueError('Full production scope missing/stale; record actual sample approval and authorized expansion with --authorize-through')
        reviewed=False
        for a in flow.get('approvals',[]):
            if a.get('stage')!='sample':continue
            sampled=[s for s in d['shots'] if s['id'] in a.get('shot_digests',{})]
            interval=a.get('range')
            if sampled and valid_range(interval,d['duration']) and approval_ok(p,d,'sample',sampled,*interval)[0]:reviewed=True;break
        if not reviewed:raise ValueError('Actual encoded sample approval missing/stale')
    out=pathlib.Path(output).resolve()
    if not out.is_relative_to(p.parent): raise ValueError('Render output must be inside project')
    if out.exists(): raise ValueError('Output exists; keep old renders and choose a new filename')
    from b8_scene import render
    import tempfile
    finish=d['duration'] if end is None else end
    out.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='b8-mux-',dir=out.parent) as temp:
        silent=pathlib.Path(temp)/'scene.mp4'
        report=render(str(p),str(silent),start=start,end=end)
        audio=d.get('audio_master') or d.get('narration')
        if audio:
            source=local(p.parent,audio['path']);pending=pathlib.Path(temp)/'final.mp4'
            cmd=[os.environ.get('FFMPEG','ffmpeg'),'-hide_banner','-loglevel','error','-i',str(silent),'-ss',str(start),'-i',str(source),'-map','0:v:0','-map','1:a:0','-c:v','copy','-af','apad','-c:a','aac','-b:a','192k','-t',str(finish-start),'-movflags','+faststart',str(pending)]
            subprocess.run(cmd,check=True)
            report['audio']={'source':audio['path'],'sha256':sha(source),'speed':1,'policy':'original media at original speed; pad only after the complete source ends'}
        else:pending=silent;report['audio']='silent study; no narration supplied'
        with out.open('xb') as dest,pending.open('rb') as source:shutil.copyfileobj(source,dest)
    report['output']=str(out)
    finish=d['duration'] if end is None else end
    srt=out.with_suffix('.srt')
    def stamp(t):
        ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000);return f'{h:02}:{m:02}:{s:02},{ms:03}'
    cues=[c for c in d.get('captions',[]) if c['start']<finish and c['end']>start]
    srt.write_text(''.join(f"{i+1}\n{stamp(max(0,c['start']-start))} --> {stamp(min(finish,c['end'])-start)}\n{c['text']}\n\n" for i,c in enumerate(cues)))
    result={'kind':'b8_encoded_sample' if not full else 'b8_encoded_film','created_at':now(),'range':[start,finish],'global_digest':global_digest(d,'sample',p.parent),'shot_digests':{s['id']:shot_digest(d,s,'sample',p.parent) for s in shots},'artifacts':[{'path':str(out.relative_to(p.parent)),'sha256':sha(out)},{'path':str(srt.relative_to(p.parent)),'sha256':sha(srt)}],'technical':report,'quality_review':visual.template(d,shots,'film' if full else 'sample'),'visual_review':'pending','actual_listening':'pending','user_acceptance':'pending'}
    reportfile=out.with_suffix('.report.json');write(reportfile,result)
    save_state(p,d,'film_pending_review' if full else 'sample_pending_review',[out,srt,reportfile],next='Review actual encoded motion/contacts, original audio and semantic caption timing. Technical success does not approve the film.')
    return {'output':str(out),'folder':str(out.parent),'report':str(reportfile),**result}

def review_report(p,d,artifact):
    """Read-only integrity/record gate, including final film; never infers visual quality."""
    p=pathlib.Path(p).resolve();reviewfile=pathlib.Path(artifact).resolve()
    if not reviewfile.is_relative_to(p.parent): raise ValueError('Review manifest must be inside project')
    report=read(reviewfile)
    kind=report.get('kind');stage=report.get('stage')
    if kind in ('b8_encoded_sample','b8_encoded_film'):
        stage='film' if kind=='b8_encoded_film' else 'sample'
        if not valid_range(report.get('range'),d['duration']): raise ValueError('Invalid actual encoded review range')
        shots=selected(d,*report['range'])
    elif stage in ('proposal','keyposes'): shots=d['shots']
    else: raise ValueError('Expected actual B8 board/sample/film report')
    digest_stage='sample' if stage=='film' else stage
    errors=visual.known_failures(report)
    if report.get('global_digest')!=global_digest(d,digest_stage,p.parent): errors.append('Stale global review')
    for shot in shots:
        if report.get('shot_digests',{}).get(shot['id'])!=shot_digest(d,shot,digest_stage,p.parent): errors.append('Stale/missing shot review: '+shot['id'])
    artifacts=report.get('artifacts',[])
    if not artifacts: errors.append('No actual reviewed artifacts')
    for item in artifacts:
        try:
            file=local(p.parent,item['path'])
            if not file.is_file() or sha(file)!=item['sha256']: errors.append('Reviewed artifact changed: '+item['path'])
        except (OSError,KeyError,ValueError,TypeError): errors.append('Invalid contained artifact')
    errors.extend(visual.errors(report.get('quality_review'),d,shots,stage,artifacts))
    return {'ok':not errors,'stage':stage,'errors':errors,'review_manifest':str(reviewfile),
            'scope':'Current report, artifacts and recorded visual checks only; no automated aesthetic judgment, listening or user acceptance.',
            'actual_listening':report.get('actual_listening','not recorded'),'user_acceptance':report.get('user_acceptance',report.get('approval','pending'))}


def doctor(project_path=None):
    import importlib
    checks={};details={}
    for name in ('PIL','numpy','scipy'):
        try:
            module=importlib.import_module(name);checks[name]=True;details[name]={'version':getattr(module,'__version__','unknown')}
        except (ImportError,OSError) as e:checks[name]=False;details[name]={'error':str(e)}
    checks['python_3_9']=sys.version_info>=(3,9)
    for name in ('ffmpeg','ffprobe'):
        exe=os.environ.get(name.upper(),name)
        try:r=subprocess.run([exe,'-version'],capture_output=True,timeout=10);checks[name]=r.returncode==0
        except (OSError,subprocess.TimeoutExpired):checks[name]=False
    try:
        enc=subprocess.run([os.environ.get('FFMPEG','ffmpeg'),'-hide_banner','-encoders'],capture_output=True,text=True,timeout=10)
        checks['libx264']=enc.returncode==0 and any(len(line.split())>1 and line.split()[1]=='libx264' for line in enc.stdout.splitlines())
    except (OSError,subprocess.TimeoutExpired):checks['libx264']=False
    try:
        manifest=read(REFERENCE/'reference-manifest.json')
        checks['reference_pack']=manifest.get('style')=='B8' and bool(manifest.get('files')) and all(sha(local(REFERENCE,f['path']))==f['sha256'] for f in manifest['files'])
    except (OSError,KeyError,ValueError,TypeError):checks['reference_pack']=False
    try:
        from PIL import ImageFont
        from b8_captions import assert_font_coverage
        ImageFont.truetype(str(ROOT/'assets/fonts/NotoSans.ttf'),32)
        assert_font_coverage(ROOT/'assets/fonts/NotoSans.ttf','ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?')
        checks['default_caption_font']=True
    except (ImportError,OSError,ValueError):checks['default_caption_font']=False
    portable=(ROOT/'runtime-manifest.json').exists()
    if portable or project_path:
        from b8_portable import verify_runtime
        candidate=pathlib.Path(project_path).resolve() if project_path else ROOT.parent
        if candidate.is_file():candidate=candidate.parent
        details['project_runtime']=verify_runtime(candidate);checks['project_runtime']=details['project_runtime']['ok']
    optional={}
    try:
        pack=ROOT/'assets/b8/midas-replay-v1';manifest=read(pack/'provenance.json')
        sample={'sample_pack':bool(manifest.get('files')) and all(sha(local(pack,f['path']))==f['sha256'] for f in manifest['files']),
                'sample_runtime':bool(manifest.get('runtime_files')) and all(sha(local(ROOT,f['path']))==f['sha256'] for f in manifest['runtime_files'])}
    except (OSError,KeyError,ValueError):sample={'sample_pack':False,'sample_runtime':False}
    if portable:optional={'midas_replay':{'bundled':False,'required_for_project':False}}
    else:checks.update(sample)
    return {'ok':all(checks.values()),'scope':'local_renderer_and_project_runtime','checks':checks,'details':details,'optional':optional,'python':sys.executable,'network_calls':0,
            'drawing_tool':{'status':'requires_agent_capability_check','reference_images_required':True,'generation_called':False},
            'note':'Checks local rendering dependencies, fonts and file integrity. The agent discovers the current reference-capable drawing tool before drawing; this command neither calls generation nor evaluates artwork.'}

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('command',choices=['doctor','init','proposal','keyposes','prompts','validate','approve','preview','render','deliver','demo','help'])
    ap.add_argument('project',nargs='?');ap.add_argument('--style');ap.add_argument('--ratio',default='16:9');ap.add_argument('--output');ap.add_argument('--stage',choices=STAGES);ap.add_argument('--review');ap.add_argument('--note');ap.add_argument('--start',type=float,default=0);ap.add_argument('--end',type=float);ap.add_argument('--seconds',type=float);ap.add_argument('--production',action='store_true');ap.add_argument('--authorize-through',type=float);ap.add_argument('--fps',type=int);ap.add_argument('--width',type=int);ap.add_argument('--height',type=int)
    ap.add_argument('--film')
    a=ap.parse_args()
    if a.command=='help':ap.print_help();return
    if a.command=='doctor':r=doctor(a.project);print(json.dumps(r,indent=2));return 0 if r['ok'] else 2
    if a.command=='init':r=init(a.project,a.ratio)
    elif a.command=='demo':
        if not a.output:raise ValueError('demo requires --output new-file.mp4')
        cmd=[sys.executable,str(ROOT/'scripts/b8_midas_replay.py'),'--output',str(pathlib.Path(a.output).resolve())]
        for flag,value in [('--start',a.start),('--end',a.end),('--width',a.width),('--height',a.height),('--fps',a.fps)]:
            if value is not None:cmd.extend([flag,str(value)])
        return subprocess.run(cmd).returncode
    else:
        if not a.project:raise ValueError('Project path required')
        p,d=project(a.project)
        if a.command=='deliver':
            if not a.output:raise ValueError('deliver requires --output NEW_DIR')
            from b8_portable import deliver
            r=deliver(p,a.output,film=a.film,review=a.review)
        elif a.command=='validate':r=review_report(p,d,a.review) if a.review else validate(d,p.parent,a.production)
        elif a.command in ('proposal','keyposes'):r=make_boards(p,d,a.command)
        elif a.command=='prompts':
            dest=local(p.parent,a.output or 'outputs/drawing-prompts.json')
            if dest.exists():raise ValueError('Prompt output exists; choose a new filename')
            write(dest,prompts(d,p.parent));r={'output':str(dest)}
        elif a.command=='approve':
            if not a.stage or not a.review:raise ValueError('approve requires --stage and --review manifest.json')
            r=approve(p,d,a.stage,a.review,a.note,a.start,a.end,a.authorize_through)
        elif a.command in ('preview','render'):
            end=a.end if a.end is not None else (min(d['duration'],a.start+a.seconds) if a.seconds else None)
            r=render_project(p,d,a.output or str(p.parent/'outputs'/('film.mp4' if a.command=='render' else 'sample.mp4')),a.start,end,a.command=='render')
    print(json.dumps(r,ensure_ascii=False,indent=2));return 0 if r.get('ok',True) else 2
if __name__=='__main__':
    try:sys.exit(main())
    except (ValueError,OSError,KeyError,TypeError) as e:print(str(e),file=sys.stderr);sys.exit(2)
