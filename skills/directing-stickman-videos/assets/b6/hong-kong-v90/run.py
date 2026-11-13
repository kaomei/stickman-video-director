#!/usr/bin/env python3
"""Portable, local-only V90 renderer. Imports authored code only with --trusted-code."""
from pathlib import Path
import argparse, collections, hashlib, importlib.util, json, math, os, subprocess, sys

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p): return json.loads(Path(p).read_text())
def save(p, v): Path(p).write_text(json.dumps(v, ensure_ascii=False, indent=2)+'\n')
def require(ok, message):
    if not ok: raise ValueError(message)
def inside(base, rel):
    p=(base/rel).resolve()
    require(p.is_relative_to(base.resolve()), 'Project input escaped project directory: '+str(rel))
    require(p.is_file(), 'Missing project input: '+str(rel))
    return p

def validate(base):
    p=read(base/'project.json');manifest=read(base/'manifest.json')
    require(p['style']=='B6' and p['renderer']=='b6-hk-v90-v1', 'Wrong B6 renderer')
    require((p['ratio'],p['width'],p['height'],p['fps'],p['duration'])==('16:9',1280,720,30,20),
            'V90 is an authored native 16:9 performance; design a separate portrait scene plan')
    for rel,digest in manifest['files'].items():
        require(sha(inside(base,rel))==digest,'Changed/missing locked project file: '+rel)
    for key in ['entry','bindings','story','captions','scene_plan']: inside(base,p[key])
    require(p['voice']['speed']==1, 'Original voice must remain at native speed')
    require(sha(inside(base,p['voice']['path']))==p['voice']['sha256'],'Voice master changed')
    captions=read(base/p['captions']);last=0
    for c in captions:
        require(last<=c['start']<c['end']<=20 and c['text'].strip(),'Invalid caption order/timing')
        last=c['end']
    require(' '.join(c['text'] for c in captions)==read(base/p['story'])['narration'],'Caption text differs from narration')
    bindings=read(base/p['bindings'])
    require(len(bindings['coverage'])==600 and len(bindings['profiles'])==8,'Incomplete character coverage')
    return p,bindings,sha(base/'manifest.json')

def check_arms(records, frame, contract):
    import numpy as np
    actual=sorted(f"{r['context']}:{r['actor']}:{r['side']}" for r in records)
    require(actual==contract['coverage'][frame], f'Frame {frame}: missing, duplicate or swapped limb')
    for r in records:
        key=f"{r['context']}:{r['actor']}:{r['side']}";lim=contract['pose_limits'][key]
        a=np.asarray(r['local_chain'],float);world=np.asarray([r['shoulder'],r['elbow'],r['wrist']],float)
        require(a.shape==(3,2) and np.isfinite(a).all() and np.isfinite(world).all(),key+': nonfinite limb')
        v=np.r_[a[1]-a[0],a[2]-a[0]];margin=lim['local_margin']
        require((v>=np.asarray(lim['min'])-margin).all() and (v<=np.asarray(lim['max'])+margin).all(),key+': limb outside approved 2D pose envelope')
        s=1 if r['signed_bend']>1e-5 else -1 if r['signed_bend']<-1e-5 else 0
        require(s in lim['allowed_bend_signs'],key+': elbow bend reversed')
        expected=contract['profiles'][r['actor']]['lengths']
        require(max(abs(x-y) for x,y in zip(expected,r['bone_lengths']))<1e-5,key+': fixed bone length changed')
        require(r['layer_contract']=='upper under sleeve; forearm follows scene occlusion; hand at prop grip',key+': sleeve/occlusion contract missing')
        require(r['grip_error']<1e-5,key+': wrist disconnected')

def check_legs(records, contract, frame=None):
    import numpy as np
    lo,hi=contract['leg_contract']['length_range']
    for r in records:
        hip=np.asarray(r['hip']);ankle=np.asarray(r['ankle']);target=np.asarray(contract['leg_contract']['standing_ankle'][r['side']])
        require(np.isfinite(hip).all() and np.isfinite(ankle).all(),'Nonfinite leg')
        require(lo<=np.linalg.norm(ankle-hip)<=hi,'Straight painted leg length outside reference envelope')
        require(np.linalg.norm(ankle-target)<1e-7,'Planted ankle slid away from painted shoe')
        require(abs(r['anisotropy']-1)<1e-6,'Actor camera transform stretched the limb')
    require(len(records) in [0,2,4],'Missing paired leg')
    if frame is not None:
        require(len(records)==contract['leg_coverage'][frame],'Frame '+str(frame)+': missing or duplicated leg')
        pairs=[(r['actor'],r['side']) for r in records]
        require(len(set(pairs))==len(pairs),'Duplicated anatomical leg')

def import_scene(base, p, bindings):
    sys.dont_write_bytecode=True
    spec=importlib.util.spec_from_file_location('b6_v90_project',base/p['entry']);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
    require(set(m.rig.BINDINGS)==set(bindings['profiles']),'Rig profile inventory differs')
    # No raster art is regenerated. New bindings are the single source of dimensions/pins.
    m.rig.BINDINGS={k:m.rig.Binding(v['character'],tuple(map(tuple,v['pins'])),tuple(v['lengths']),v['hand_style']) for k,v in bindings['profiles'].items()}
    feet=m.m.feet
    def recorded_feet(c,M,kind='flower'):
        feet(c,M,kind)
        for side in [0,1]:m.rig.record_leg(kind,side,(-1 if side==0 else 34,-90),(-18 if side==0 else 42,-10.4),M)
    m.m.feet=recorded_feet
    return m

def resource_audit(base):
    reads=set();outside=set();prefixes=tuple(str(Path(p).resolve())+os.sep for p in [sys.prefix,sys.base_prefix,*sys.path] if p and 'site-packages' in p)
    def audit(event,args):
        if event!='open' or not isinstance(args[0],str):return
        path=Path(args[0]).resolve();mode=args[1]
        if isinstance(mode,str) and ('w' in mode or 'a' in mode or '+' in mode):return
        if path.is_relative_to(base):reads.add(str(path.relative_to(base)))
        elif path.suffix.lower() in ['.png','.jpg','.json','.ttf','.mp4','.m4a'] and not str(path).startswith(prefixes):
            outside.add(str(path));raise ValueError('External media dependency: '+str(path))
    sys.addaudithook(audit)
    return reads,outside

def check_contacts(m):
    import numpy as np
    errors=[]
    value=m.m.LOG.get('prop_contact_error')
    if value is not None:errors.append(float(value))
    if m.rig.FRAME is not None and 72<=m.rig.FRAME<198:
        for row in m.v59.CONTACTS:
            for flag,hand,grip in [('hero_holds_bag','hero_wrist','bag_handle'),('hero_holds_paper','hero_wrist','receiver_grip'),('owner_holds_paper','owner_wrist','giver_grip')]:
                if row[flag]:errors.append(float(np.linalg.norm(np.asarray(row[hand])-row[grip])))
    require(all(e<1e-3 for e in errors),'Independent prop grip/contact failed')
    return errors

def run(args):
    base=Path(args.project).resolve();p,bindings,fingerprint=validate(base)
    if args.command=='validate':return {'valid':True,'renderer':p['renderer'],'files':len(read(base/'manifest.json')['files']),'fingerprint':fingerprint}
    require(args.trusted_code,'Importing local authored Python requires --trusted-code')
    start=round(args.start*30);end=round((args.start+args.seconds)*30)
    require(0<=start<end<=600,'Range must be within the original 20 seconds')
    out=base/args.output;require(out.resolve().is_relative_to(base),'Output escaped project')
    require(not out.exists(),'Output already exists; choose a fresh --output directory');out.mkdir(parents=True)
    if args.command=='render':
        approval=read(base/'approval.json');preview=inside(base,approval['preview'])
        require(approval['fingerprint']==fingerprint and approval['preview_sha256']==sha(preview) and approval['note'].strip(),'Full render requires unchanged user-reviewed preview')
        start,end=0,600
    reads,outside=resource_audit(base);m=import_scene(base,p,bindings)
    from PIL import Image,ImageDraw
    import numpy as np
    encode=args.command in ['preview','render'];encoder=None;framehash=hashlib.sha256();thumbs=[];count=0;arms=0;legs=0;maxcontact=0;shots={};drawhashes={}
    if encode:
        encoder=subprocess.Popen(['ffmpeg','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','1280x720','-r','30','-i','-','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',str(out/'silent.mp4')],stdin=subprocess.PIPE,stderr=open(out/'encode.log','w'))
    walk=range(600) if args.full_qc or args.command=='frames' else range(start,end)
    sample=set(np.linspace(start,end-1,12,dtype=int).tolist())|{72,84,129,198,216,285,324,441,546}
    try:
        with open(out/'limb-frames.jsonl','w') as log:
            for i in walk:
                im=m.draw(i/30).convert('RGB');check_arms(m.rig.RECORDS,i,bindings);check_legs(m.rig.LEGS,bindings,i)
                contacts=check_contacts(m);maxcontact=max([maxcontact,*contacts]);arms+=len(m.rig.RECORDS);legs+=len(m.rig.LEGS)
                shot=m.m.LOG.get('shot','counter');shots.setdefault(shot,{'first_frame':i,'last_frame':i})['last_frame']=i
                log.write(json.dumps({'frame':i,'arms':m.rig.RECORDS,'legs':m.rig.LEGS,'prop_contact_errors':contacts,'shot':shot},separators=(',',':'))+'\n')
                pixels=im.tobytes();drawhashes[str(i)]=hashlib.sha256(pixels).hexdigest()
                if start<=i<end:
                    framehash.update(pixels);count+=1
                    if encoder:encoder.stdin.write(pixels)
                if i in sample:
                    im.save(out/f'frame-{i:04}.png');thumbs.append((i,im.resize((320,180))))
                if i%60==0:print(json.dumps({'checked_frame':i,'preview_frames':count}),flush=True)
        if encoder:
            encoder.stdin.close();require(encoder.wait()==0,'ffmpeg encoding failed; see encode.log')
            subprocess.run(['ffmpeg','-v','error','-i',str(out/'silent.mp4'),'-ss',str(start/30),'-i',str(base/p['voice']['path']),'-map','0:v:0','-map','1:a:0','-t',str((end-start)/30),'-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart',str(out/'preview.mp4')],check=True)
            (out/'silent.mp4').unlink()
    finally:
        if encoder and encoder.poll() is None:encoder.kill();encoder.wait()
    board=Image.new('RGB',(1280,math.ceil(len(thumbs)/4)*204),'#f3e8da');d=ImageDraw.Draw(board)
    for j,(i,im) in enumerate(thumbs):x=j%4*320;y=j//4*204;board.paste(im,(x,y+24));d.text((x+8,y+5),f'V90 code {i/30:.3f}s',fill='#382b28')
    board.save(out/'contact-sheet.jpg',quality=95)
    save(out/'draw-hashes.json',drawhashes)
    save(out/'resource-audit.json',{'project_files_read':sorted(reads),'external_media_reads':sorted(outside),'network_used':False})
    result={'status':'automated_checks_passed_pending_visual_and_user_review','fingerprint':fingerprint,'range':[start/30,end/30],'duration':(end-start)/30,'preview_frames':count,'checked_frames':len(walk),'arm_poses_checked':arms,'straight_leg_poses_checked':legs,'max_independent_prop_contact_error_px':maxcontact,'shots':shots,'raw_rgb_sha256':framehash.hexdigest(),'voice_speed':1,'captions':'Original V90 authored semantic cues, untouched','external_media_reads':len(outside),'limitations':['Pose envelopes are specific to the locked V90 performance, not a new-character fitting engine.','Orthographic bone depth alone does not establish good silhouette; 2D envelope, coverage, contacts and visual review are also required.','Painted clothing masks and offscreen/occluded limbs require visual review; geometry does not prove their appearance.']}
    if encode:result.update(output=str(out/'preview.mp4'),output_sha256=sha(out/'preview.mp4'))
    save(out/'report.json',result);return result

def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('command',choices=['validate','frames','preview','render']);ap.add_argument('project',nargs='?',default=str(Path(__file__).resolve().parent));ap.add_argument('--trusted-code',action='store_true');ap.add_argument('--start',type=float,default=6.6);ap.add_argument('--seconds',type=float,default=298/30);ap.add_argument('--full-qc',action='store_true');ap.add_argument('--output',default='outputs/reproduction')
    args=ap.parse_args();print(json.dumps(run(args),ensure_ascii=False,indent=2))
if __name__=='__main__':main()
