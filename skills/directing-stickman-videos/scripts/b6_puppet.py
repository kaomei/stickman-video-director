"""Small, strict B6 painted-puppet runtime. All geometry is planar.

Character packages own fitting, cuff mattes and approved poses. Scene code owns
staging and contact events, not character-specific repairs. Numeric/alpha QA is
necessary evidence, never a replacement for viewing the encoded performance.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Mapping
from types import MappingProxyType
import hashlib
import json
import math
import zlib
import numpy as np
import cv2
from PIL import Image, ImageColor

SCHEMA = 'b6-puppet/1'
ACTIONS = ('rest', 'reach', 'offer', 'receive', 'retract')
SIDES = ('left', 'right')

class PuppetError(ValueError):
    pass

def _need(condition, message):
    if not bool(condition):
        raise PuppetError(message)

def _sha(data):
    return hashlib.sha256(data).hexdigest()

def _readonly(value):
    a=np.array(value,copy=True);a.setflags(write=False);return a

def _array(value, shape, name):
    a = np.asarray(value, dtype=float)
    _need(a.shape == shape and np.isfinite(a).all(), name + ': invalid shape/nonfinite')
    return a

def _matrix(value, name='matrix', similarity=False):
    m = _array(value, (3, 3), name)
    _need(np.allclose(m[2], [0, 0, 1], atol=1e-9), name + ': affine matrix required')
    _need(abs(np.linalg.det(m[:2, :2])) > 1e-9, name + ': singular matrix')
    if similarity:
        s = np.linalg.svd(m[:2, :2], compute_uv=False)
        _need(abs(s[0] - s[1]) < 1e-6 * max(1., s[0]), name + ': nonuniform actor scaling forbidden')
    return m

def _point(m, p):
    return (m @ np.r_[p, 1.])[:2]

def _scale(m):
    return float(np.linalg.norm(m[:2, 0]))

def _unit(v):
    return v / np.linalg.norm(v)

def _angle(v):
    return math.degrees(math.atan2(float(v[1]), float(v[0])))

def _angular_in(angle, limits):
    lo, hi = limits
    return any(lo - 1e-6 <= angle + k * 360 <= hi + 1e-6 for k in (-1, 0, 1))

def _smooth(x):
    x = float(np.clip(x, 0., 1.))
    return x*x*(3.-2.*x)

def _rgba(image, size=None):
    if isinstance(image, Image.Image):
        a = np.asarray(image.convert('RGBA')).copy()
    else:
        a = np.asarray(image)
        if a.dtype != np.uint8:
            a = np.uint8(np.clip(a, 0, 1) * 255) if a.max(initial=0) <= 1 else np.uint8(np.clip(a, 0, 255))
        if a.ndim == 3 and a.shape[2] == 3:
            a = np.dstack((a, np.full(a.shape[:2], 255, np.uint8)))
        _need(a.ndim == 3 and a.shape[2] == 4, 'RGBA or RGB image required')
    if size:
        _need(a.shape[:2] == (size[1], size[0]), 'Canvas image size mismatch')
    return np.ascontiguousarray(a)

@dataclass(frozen=True)
class Asset:
    path: str
    sha256: str
    image_to_local: np.ndarray
    image: np.ndarray

@dataclass(frozen=True)
class ArmSpec:
    side: str
    socket: np.ndarray
    exit_normal: np.ndarray
    lengths: tuple
    pole: int
    upper_range: tuple
    bend_range: tuple
    max_ik_offset: float
    ink_width: float
    hand_radius: float
    cuff: Asset
    poses: Mapping[str, tuple]
    layer: str = 'front'
    visibility_min: Mapping[str, float] = field(default_factory=lambda: {'upper': .20, 'forearm': .35, 'hand': .40})
    min_screen_segment_px: float = 4.
    max_joint_step_ratio: float = .50
    outlet_segment: Any = None
    exit_center: Any = None
    hand_asset: Asset|None = None
    action_envelopes: Mapping[str, Any] = field(default_factory=dict)
    ink_path: Mapping[str, Any]|None = None

@dataclass(frozen=True)
class ViewSpec:
    view_id: str
    body: Asset
    head: Asset
    arms: Mapping[str, ArmSpec]
    legs: Mapping[str, dict]
    ink_color: tuple
    head_anchor: Any = None
    heads: Mapping[str, Asset] = field(default_factory=dict)
    neck_attachment: Any = None

@dataclass(frozen=True)
class Character:
    character_id: str
    package_path: str
    fingerprint: str
    views: Mapping[str, ViewSpec]
    art_hashes: Mapping[str, str]
    binding_version: int = 1

def load_character(package_dir) -> Character:
    """Load package.json (or explicit JSON path); reject missing data and hash drift."""
    path = Path(package_dir).resolve()
    if path.is_dir():
        path = path / ('package.json' if (path/'package.json').exists() else 'character.json')
    _need(path.is_file(), 'Character package JSON missing: ' + str(path))
    raw = path.read_bytes(); doc = json.loads(raw); root = path.parent; hashes = {}
    _need(doc.get('schema') == SCHEMA, 'Unsupported/missing character schema')
    _need(isinstance(doc.get('character_id'), str) and doc['character_id'], 'character_id required')
    _need(isinstance(doc.get('views'), dict) and doc['views'], 'Per-view definitions required')
    binding_version=doc.get('binding_version',1)
    _need(binding_version in (1,2),'Unsupported character binding_version')
    def asset(config, label, matte=False):
        _need(isinstance(config, dict), label + ': asset configuration missing')
        for k in ('path', 'sha256', 'image_to_local'):
            _need(k in config, label + ': missing ' + k)
        f = (root / config['path']).resolve()
        _need(f.is_relative_to(root) and f.is_file(), label + ': missing/escaped local asset')
        data = f.read_bytes(); digest = _sha(data)
        _need(digest == config['sha256'], label + ': art hash mismatch')
        hashes[config['path']] = digest
        im = Image.open(f)
        if matte:
            _need(im.mode in ('L', 'LA', 'RGBA'), label + ': cuff must contain explicit alpha or L matte')
            a = np.asarray(im.getchannel('A') if 'A' in im.getbands() else im.convert('L')).copy()
            _need(np.any(a) and np.any(a < 255), label + ': empty/solid cuff matte')
        else:
            _need(im.mode == 'RGBA', label + ': separate RGBA sprite required')
            a = np.asarray(im).copy()
            _need(np.any(a[:, :, 3]) and np.any(a[:, :, 3] < 255), label + ': sprite must have transparent exterior')
        return Asset(str(f), digest, _readonly(_matrix(config['image_to_local'], label+'.image_to_local')), _readonly(a))
    views = {}
    for vid, v in doc['views'].items():
        _need(isinstance(vid, str) and vid and isinstance(v, dict), 'Invalid view entry')
        sprites = v.get('sprites', {})
        body = asset(sprites.get('body'), vid+'.body'); head = asset(sprites.get('head'), vid+'.head')
        _need(set(v.get('arms', {})) == set(SIDES), vid+': exactly left/right arm definitions required')
        arms = {}
        required = ('socket','exit_normal','lengths','pole','upper_angle_range_deg','elbow_bend_range_deg','max_ik_offset','ink_width','hand_radius','cuff','poses','outlet_segment','exit_center','layer')
        for side in SIDES:
            a = v['arms'][side]; label=vid+'.'+side
            _need(all(k in a for k in required), label+': incomplete fitting/pose configuration')
            socket = _array(a['socket'], (2,), label+'.socket'); normal=_array(a['exit_normal'], (2,), label+'.exit_normal')
            _need(np.linalg.norm(normal) > .1, label+': exit normal is zero')
            lengths = _array(a['lengths'], (2,), label+'.lengths')
            _need(min(lengths) > 0, label+': positive fixed 2D bone lengths required')
            _need(a['pole'] in (-1, 1), label+': fixed signed pole required')
            upper = tuple(_array(a['upper_angle_range_deg'], (2,), label+'.upper_range'))
            bend = tuple(_array(a['elbow_bend_range_deg'], (2,), label+'.bend_range'))
            _need(upper[0] < upper[1] and 0 < bend[0] < bend[1] < 180, label+': invalid joint ranges')
            _need(set(a['poses']) == set(ACTIONS), label+': all five approved pose entries required')
            poses = {}
            for action in ACTIONS:
                angles=tuple(_array(a['poses'][action], (2,), label+'.'+action))
                _need(_angular_in(angles[0], upper) and bend[0] <= angles[1] <= bend[1], label+': pose outside joint range: '+action)
                poses[action]=angles
            for k in ('max_ik_offset','ink_width','hand_radius'):
                _need(np.isfinite(a[k]) and a[k] > 0, label+': invalid '+k)
            _need(a['max_ik_offset'] <= sum(lengths), label+': IK correction may not exceed total arm length')
            vis = a.get('visibility_min', {'upper':.20,'forearm':.35,'hand':.40})
            _need(set(vis) == {'upper','forearm','hand'} and all(.1 <= x <= 1 for x in vis.values()), label+': readable visibility minima required')
            layer=a.get('layer','front');_need(layer in ('front','back'),label+': layer must be front/back')
            outlet=_array(a['outlet_segment'],(2,2),label+'.outlet_segment');exit_center=_array(a['exit_center'],(2,),label+'.exit_center')
            _need(np.linalg.norm(outlet[1]-outlet[0])>1,label+': nonzero true cuff opening required')
            _need(np.linalg.norm(exit_center-outlet.mean(axis=0)) <= np.linalg.norm(outlet[1]-outlet[0])*.5,label+': exit center outside cuff opening')
            cuff=asset(a['cuff'],label+'.cuff',True)
            ys,xs=np.nonzero(cuff.image>32);cm=cuff.image_to_local
            local=np.column_stack((xs*cm[0,0]+ys*cm[0,1]+cm[0,2],xs*cm[1,0]+ys*cm[1,1]+cm[1,2]))
            _need(np.max(np.linalg.norm(local[:,:2]-socket,axis=1))<=lengths[0]*1.1,label+': cuff matte covers garment rather than local sleeve cap')
            coverage=cv2.warpPerspective(cuff.image,np.linalg.inv(body.image_to_local)@cuff.image_to_local,(body.image.shape[1],body.image.shape[0]))>32
            _need(np.any(coverage) and np.mean(body.image[:,:,3][coverage]>32)>=.98,label+': cuff matte must correspond to actual painted body alpha')
            cuff_pin=_point(np.linalg.inv(cuff.image_to_local),socket);cx,cy=np.rint(cuff_pin).astype(int)
            _need(0<=cy<cuff.image.shape[0] and 0<=cx<cuff.image.shape[1] and cuff.image[cy,cx]>32,label+': socket is not in actual cuff paint')
            envelopes={}
            for action,envelope in a.get('action_envelopes',{}).items():
                _need(action in ACTIONS and isinstance(envelope,dict) and envelope,label+': invalid action envelope')
                _need(set(envelope)<={'upper_angle_range_deg','forbid_elbow_above_root_when_wrist_below_root'},label+': unknown action envelope constraint')
                rule={}
                if 'upper_angle_range_deg' in envelope:
                    limits=tuple(_array(envelope['upper_angle_range_deg'],(2,),label+'.'+action+'.upper_angle_range_deg'))
                    _need(upper[0]<=limits[0]<limits[1]<=upper[1],label+': action upper range must fit arm range')
                    rule['upper_angle_range_deg']=limits
                if 'forbid_elbow_above_root_when_wrist_below_root' in envelope:
                    flag=envelope['forbid_elbow_above_root_when_wrist_below_root']
                    _need(isinstance(flag,bool),label+': action elbow rule must be boolean')
                    rule['forbid_elbow_above_root_when_wrist_below_root']=flag
                envelopes[action]=MappingProxyType(rule)
            ink_path=a.get('ink_path')
            if ink_path is not None:
                _need(isinstance(ink_path,dict) and set(ink_path)=={'mode','sag'} and ink_path['mode']=='continuous',label+': ink_path requires continuous mode and sag')
                sag=ink_path['sag']
                _need(isinstance(sag,(int,float)) and not isinstance(sag,bool) and np.isfinite(sag) and 0<=sag<=sum(lengths)*.25,label+': continuous ink sag must be finite and between zero and one quarter of control reach')
                ink_path=MappingProxyType({'mode':'continuous','sag':float(sag)})
            arms[side] = ArmSpec(side,_readonly(socket),_readonly(_unit(normal)),tuple(lengths),a['pole'],upper,bend,float(a['max_ik_offset']),float(a['ink_width']),float(a['hand_radius']),cuff,MappingProxyType(poses),layer,MappingProxyType(dict(vis)),float(a.get('min_screen_segment_px',4.)),float(a.get('max_joint_step_ratio',.50)),_readonly(outlet),_readonly(exit_center),asset(a['hand_asset'],label+'.hand_asset') if a.get('hand_asset') else None,MappingProxyType(envelopes),ink_path)
        _need(set(v.get('legs',{})) == set(SIDES), vid+': planted left/right legs required')
        legs={}
        for side,l in v['legs'].items():
            _need(all(k in l for k in ('hip','ankle','ink_width','foot_size')),vid+': incomplete leg')
            hip=_array(l['hip'],(2,),vid+'.hip'); ankle=_array(l['ankle'],(2,),vid+'.ankle');foot=_array(l['foot_size'],(2,),vid+'.foot')
            _need(np.linalg.norm(ankle-hip)>1 and min(foot)>0 and l['ink_width']>0,vid+': invalid planted leg')
            legs[side]=MappingProxyType({'hip':_readonly(hip),'ankle':_readonly(ankle),'ink_width':float(l['ink_width']),'foot_size':_readonly(foot),'length':float(np.linalg.norm(ankle-hip)),'foot_asset':asset(l['foot_asset'],vid+'.'+side+'.foot_asset') if l.get('foot_asset') else None})
        _need('ink_color' in v,vid+': ink_color required')
        color=ImageColor.getrgb(v['ink_color'])
        anchor=_array(v.get('head_anchor',_point(head.image_to_local,[head.image.shape[1]/2,head.image.shape[0]])),(2,),vid+'.head_anchor')
        inferred=_point(head.image_to_local,[head.image.shape[1]/2,head.image.shape[0]])
        _need(np.linalg.norm(anchor-inferred)<=max(15.,head.image.shape[0]*_scale(head.image_to_local)*.12),vid+': head anchor must stay at fitted neck')
        heads={name:asset(config,vid+'.heads.'+name) for name,config in sprites.get('heads',{}).items()}
        _need(all(isinstance(name,str) and name for name in heads),vid+': invalid expression identity')
        neck=v.get('neck_attachment')
        _need(binding_version<2 or isinstance(neck,dict),vid+': binding version 2 requires neck_attachment')
        if neck is not None:
            _need(isinstance(neck,dict) and set(neck)=={'mount_polygon','min_overlap_fraction','min_overlap_thickness'},vid+': neck_attachment needs mount_polygon, min_overlap_fraction and min_overlap_thickness')
            polygon=np.asarray(neck['mount_polygon'],dtype=float)
            _need(polygon.ndim==2 and polygon.shape[1]==2 and 3<=len(polygon)<=8 and np.isfinite(polygon).all(),vid+': invalid neck mount polygon')
            area=abs(cv2.contourArea(polygon.astype(np.float32)))
            _need(area>=8 and cv2.isContourConvex(polygon.astype(np.float32)),vid+': neck mount must be a nontrivial convex painted attachment')
            fraction=neck['min_overlap_fraction']
            _need(isinstance(fraction,(int,float)) and np.isfinite(fraction) and .5<=fraction<=1,vid+': neck overlap fraction must be 0.5..1')
            thickness=neck['min_overlap_thickness']
            _need(isinstance(thickness,(int,float)) and np.isfinite(thickness) and thickness>=2,vid+': neck overlap thickness must be at least 2 local units')
            neck=MappingProxyType({'mount_polygon':_readonly(polygon),'min_overlap_fraction':float(fraction),'min_overlap_thickness':float(thickness)})
        view=ViewSpec(vid,body,head,MappingProxyType(arms),MappingProxyType(legs),color,_readonly(anchor),MappingProxyType(heads),neck)
        if neck is not None:
            for variant in [None,*heads]:
                evidence=_neck_local_evidence(view,0.,variant)
                _need(evidence['body_mount_fraction']>=.95,vid+': neck mount must lie on actual main body paint')
                _need(_neck_connected(view,evidence),vid+': actual painted head/body neck attachment missing')
        views[vid]=view
    fingerprint=_sha(raw + json.dumps(hashes,sort_keys=True,separators=(',',':')).encode())
    return Character(doc['character_id'],str(path),fingerprint,MappingProxyType(views),MappingProxyType(hashes),binding_version)

class PoseLibrary:
    """Authored planar FK poses; interpolate angles, then optionally solve contact IK."""
    @staticmethod
    def sample(arm: ArmSpec, action='rest', phase=1.):
        _need(action in ACTIONS,'Unknown pose action: '+str(action))
        _need(np.isfinite(phase) and 0 <= phase <= 1,'Action phase must be [0,1]')
        if action=='retract':
            # The authored retract pose is a waypoint, not a permanent bent rest.
            first,second=('offer','retract') if phase<=.5 else ('retract','rest')
            u=phase*2 if phase<=.5 else phase*2-1
            a=np.asarray(arm.poses[first]);b=np.asarray(arm.poses[second])
            return a+(b-a)*_smooth(u)
        starts={'rest':'rest','reach':'rest','offer':'reach','receive':'reach'}
        a=np.asarray(arm.poses[starts[action]]);b=np.asarray(arm.poses[action])
        return a+(b-a)*_smooth(phase)

def forward_kinematics(arm: ArmSpec, angles):
    upper,bend=map(float,angles)
    _need(_angular_in(upper,arm.upper_range) and arm.bend_range[0]-1e-6 <= bend <= arm.bend_range[1]+1e-6, 'FK pose outside permitted ranges')
    a,b=arm.lengths;u=math.radians(upper);f=math.radians(upper-arm.pole*bend)
    sh=arm.socket;el=sh+a*np.array([math.cos(u),math.sin(u)]);wr=el+b*np.array([math.cos(f),math.sin(f)])
    return np.array([sh,el,wr])

def planar_ik(arm: ArmSpec, wrist, nominal=None):
    wr=_array(wrist,(2,),'wrist'); sh=arm.socket;a,b=arm.lengths;d=float(np.linalg.norm(wr-sh))
    _need(abs(a-b)+1e-5 < d < a+b-1e-5,'Unreachable planar IK target; move prop/actor or use another approved pose')
    if nominal is not None:
        _need(np.linalg.norm(wr-nominal) <= arm.max_ik_offset+1e-6,'IK target exceeds finite authored-pose correction range')
    u=(wr-sh)/d;n=np.array([-u[1],u[0]]);along=(a*a-b*b+d*d)/(2*d);height=math.sqrt(max(0.,a*a-along*along))
    el=sh+along*u+arm.pole*height*n
    upper=_angle(el-sh);bend=math.degrees(math.acos(float(np.clip(np.dot(_unit(el-sh),_unit(wr-el)),-1,1))))
    _need(_angular_in(upper,arm.upper_range) and arm.bend_range[0]-1e-6 <= bend <= arm.bend_range[1]+1e-6,'IK solution outside approved joint ranges')
    nodes=np.array([sh,el,wr])
    _need(np.max(np.abs(np.linalg.norm(np.diff(nodes,axis=0),axis=1)-arm.lengths))<1e-6,'Fixed planar bone length violation')
    return nodes

@dataclass
class ActorFrame:
    actor_id: str
    character: Character
    view: ViewSpec
    placement: np.ndarray
    arms: Mapping[str,np.ndarray]
    action: str
    phase: float
    frame_index: int
    allow_cut: bool=False
    arm_actions: Mapping[str,dict]=field(default_factory=dict)
    head_angle_deg: float=0.
    head_pivot: Any=None
    head_variant: str|None=None
    ankle_targets: Mapping[str,Any]=field(default_factory=dict)

class Puppet:
    def __init__(self,character: Character,view_id: str,actor_id: str):
        _need(actor_id and isinstance(actor_id,str),'actor_id required')
        _need(view_id in character.views,'Unknown character view')
        self.character=character;self.view_id=view_id;self.actor_id=actor_id;self._previous=None
    def set_view(self,view_id,allow_cut=False):
        _need(view_id in self.character.views,'Unknown character view')
        if view_id != self.view_id:
            _need(allow_cut,'View changes require an explicit authored cut/turn transition; no single-sprite warp')
            self.view_id=view_id;self._previous=None
    def pose(self,action='rest',phase=1.,placement=None,wrist_targets=None,frame_index=0,allow_cut=False,arm_actions=None,head_angle_deg=0.,head_pivot=None,head_variant=None,ankle_targets=None):
        m=_matrix(np.eye(3) if placement is None else placement,'actor.placement',True)
        _need(isinstance(frame_index,int) and frame_index>=0,'Nonnegative integer frame_index required')
        view=self.character.views[self.view_id];targets=wrist_targets or {};_need(set(targets)<=set(SIDES),'Invalid anatomical wrist side')
        nodes={};inv=np.linalg.inv(m);arm_actions=arm_actions or {};_need(set(arm_actions)<=set(SIDES),'Invalid per-arm action side');selected_actions={}
        for side,arm in view.arms.items():
            override=arm_actions.get(side,{});_need(isinstance(override,dict) and set(override)<={'action','phase'},'Per-arm pose override must contain action/phase only')
            arm_action=override.get('action',action);arm_phase=override.get('phase',phase);selected_actions[side]={'action':arm_action,'phase':float(arm_phase)}
            fk=forward_kinematics(arm,PoseLibrary.sample(arm,arm_action,arm_phase))
            ch=planar_ik(arm,_point(inv,_array(targets[side],(2,),'screen wrist')),fk[2]) if side in targets else fk
            _validate_action_envelope(arm,ch,arm_action)
            if arm.ink_path is not None:_continuous_ink_geometry(arm,ch,_scale(m))
            _need(np.dot(_unit(ch[1]-ch[0]),arm.exit_normal)>.02,self.actor_id+': upper arm points back into cuff')
            screen=np.array([_point(m,p) for p in ch]);lengths=np.linalg.norm(np.diff(screen,axis=0),axis=1)
            _need(min(lengths)>=arm.min_screen_segment_px,self.actor_id+': projected bone too small/readability collapse')
            sv=ch[2]-ch[0];ev=ch[1]-ch[0];signed=float(sv[0]*ev[1]-sv[1]*ev[0]);_need(signed*arm.pole>1e-6,'Elbow pole continuity violation')
            if self._previous and not allow_cut and self._previous.frame_index+1==frame_index and self._previous.view.view_id==view.view_id:
                prev=self._previous.arms[side]
                _need(max(np.linalg.norm(ch[1]-prev[1]),np.linalg.norm(ch[2]-prev[2])) <= max(arm.lengths)*arm.max_joint_step_ratio,'Local limb teleport; use continuous authored transition')
            nodes[side]=ch
        result=ActorFrame(self.actor_id,self.character,view,m,nodes,action,float(phase),frame_index,allow_cut)
        result.arm_actions=selected_actions
        result.head_angle_deg=float(head_angle_deg);result.head_pivot=np.array(view.head_anchor if head_pivot is None else head_pivot,dtype=float)
        result.head_variant=head_variant;result.ankle_targets=dict(ankle_targets or {})
        _validate_head_and_feet(result)
        if self._previous and not allow_cut and self._previous.frame_index+1==frame_index:
            _need(abs(result.head_angle_deg-self._previous.head_angle_deg)<=7.,'Head nod teleports; use a continuous rigid turn')
        self._previous=result;return result

@dataclass
class ContactState:
    state: str
    paper_matrix: np.ndarray
    paper_size: tuple
    holders: list
    targets: Mapping[str,Mapping[str,list]]
    event_index: int
    color: tuple=(206,208,164)

class ContactTimeline:
    """One timeline owns paper motion, holder sets, transfers and all hand targets."""
    def __init__(self,events,paper_size=(80.,36.),color='#ced0a4'):
        _need(isinstance(events,list) and events,'Nonempty contact timeline required')
        self.events=events;self.paper_size=tuple(_array(paper_size,(2,),'paper_size'));self.color=ImageColor.getrgb(color)
        _need(min(self.paper_size)>0,'Positive paper dimensions required')
        last=None
        for i,e in enumerate(events):
            _need(all(k in e for k in ('t0','t1','state','holders','paper_start')),'Incomplete contact event')
            _need(np.isfinite([e['t0'],e['t1']]).all() and e['t0']<e['t1'],'Invalid contact interval')
            _need(e['state'] in ('owner','shared','release'),'Invalid contact state')
            holders=e['holders'];expected={'owner':1,'shared':2,'release':0}[e['state']]
            _need(len(holders)==expected,'Contact state/holder count mismatch')
            ids=[]
            for q in holders:
                _need(set(q)>={'actor_id','arm','grip'} and q['arm'] in SIDES and q['actor_id'],'Invalid contact holder')
                uv=_array(q['grip'],(2,),'grip uv');_need((uv>=0).all() and (uv<=1).all(),'Grip must lie on actual paper UV')
                ids.append((q['actor_id'],q['arm']))
            _need(len(set(ids))==len(ids),'Duplicate contact owner/arm')
            _array(e['paper_start'],(3,),'paper_start');_array(e.get('paper_end',e['paper_start']),(3,),'paper_end')
            if last:
                _need(abs(last['t1']-e['t0'])<1e-7,'Contact timeline must have contiguous intervals')
                previous={(q['actor_id'],q['arm']) for q in last['holders']};current=set(ids)
                _need(not(previous and current) or bool(previous&current),'Ownership must pass through an explicit shared event')
                _need(np.linalg.norm(np.asarray(last.get('paper_end',last['paper_start']))-e['paper_start'])<1e-6,'Paper jumps between contact events')
            last=e
    def sample(self,t):
        _need(np.isfinite(t),'Invalid contact time')
        found=next(((i,e) for i,e in enumerate(self.events) if e['t0']<=t<e['t1']),None)
        if found is None and abs(t-self.events[-1]['t1'])<1e-7: found=(len(self.events)-1,self.events[-1])
        _need(found is not None,'Time outside contact timeline')
        i,e=found;u=_smooth((t-e['t0'])/(e['t1']-e['t0']));p=np.asarray(e['paper_start'])*(1-u)+np.asarray(e.get('paper_end',e['paper_start']))*u
        angle=math.radians(p[2]);m=np.array([[math.cos(angle),-math.sin(angle),p[0]],[math.sin(angle),math.cos(angle),p[1]],[0,0,1.]])
        targets={}
        for q in e['holders']:
            local=(np.asarray(q['grip'])-.5)*self.paper_size
            targets.setdefault(q['actor_id'],{})[q['arm']]=_point(m,local).tolist()
        return ContactState(e['state'],m,self.paper_size,list(e['holders']),targets,i,self.color)

def transform_contact(contact,placement):
    """Project an authored contact plane by one uniform camera similarity."""
    _validate_contact(contact)
    m=_matrix(placement,'contact placement',True)@contact.paper_matrix
    targets={}
    for q in contact.holders:
        targets.setdefault(q['actor_id'],{})[q['arm']]=_point(m,(np.asarray(q['grip'])-.5)*contact.paper_size).tolist()
    return ContactState(contact.state,m,contact.paper_size,list(contact.holders),targets,contact.event_index,contact.color)

@dataclass
class PropFrame:
    prop_id: str
    contact: ContactState
    art: Any=None
    front_limb_parts: tuple=()

@dataclass
class RenderResult:
    beauty: Image.Image
    limb_masks: Mapping[str,np.ndarray]
    part_masks: Mapping[str,np.ndarray]
    id_image: np.ndarray
    qa: dict


def _warp(a,m,size):
    return cv2.warpPerspective(a,m,size,flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)

def _raster_bounds(size, points, margin):
    w,h=size;p=np.asarray(points,dtype=float)
    x0=max(0,int(math.floor(p[:,0].min()-margin)));y0=max(0,int(math.floor(p[:,1].min()-margin)))
    x1=min(w,int(math.ceil(p[:,0].max()+margin))+1);y1=min(h,int(math.ceil(p[:,1].max()+margin))+1)
    return x0,y0,x1,y1

def _line_mask(size,p,q,width,seed='stroke'):
    # Anchored pressure varies edges, never bones or joints. No per-frame noise.
    w,h=size;p=np.asarray(p,dtype=float);q=np.asarray(q,dtype=float);out=np.zeros((h,w),np.uint8)
    x0,y0,x1,y1=_raster_bounds(size,[p,q],width+3)
    if x1<=x0 or y1<=y0:return out
    ss=3;im=np.zeros(((y1-y0)*ss,(x1-x0)*ss),np.uint8);offset=np.array([x0,y0])
    delta=q-p;length=np.linalg.norm(delta)
    if length<1e-7:return out
    normal=np.array([-delta[1],delta[0]])/length
    t=np.linspace(0.,1.,max(12,int(length/4)+1));phase=(zlib.crc32(seed.encode())%997)/997.*2*math.pi
    pressure=width*.5*(1+.095*np.sin(t*2*math.pi+phase)+.035*np.sin(t*8*math.pi+phase*.7))
    centers=p[None,:]+t[:,None]*delta
    poly=np.vstack((centers+normal*pressure[:,None],(centers-normal*pressure[:,None])[::-1]))
    cv2.fillPoly(im,[np.rint((poly-offset)*ss).astype(np.int32)],255,cv2.LINE_AA)
    for pt,r in ((p,pressure[0]),(q,pressure[-1])):cv2.circle(im,tuple(np.rint((pt-offset)*ss).astype(int)),max(1,int(round(r*ss))),255,-1,cv2.LINE_AA)
    # Very mild pigment variation travels with the segment rather than the frame.
    yy,xx=np.indices(im.shape,dtype=np.float32);tx=((xx/ss+x0-p[0])*delta[0]+(yy/ss+y0-p[1])*delta[1])/(length*length)
    pigment=.96+.04*np.sin(tx*13*math.pi+phase)*np.sin(tx*7*math.pi+phase*.5)
    im=np.uint8(im*pigment)
    out[y0:y1,x0:x1]=cv2.resize(im,(x1-x0,y1-y0),interpolation=cv2.INTER_AREA)
    return out

def _continuous_ink_geometry(spec,nodes,scale=1.):
    """A drawn cartoon path; fixed bones remain internal reach controls."""
    config=spec.ink_path
    _need(config is not None and config.get('mode')=='continuous','Unknown arm ink path')
    sag=config.get('sag');reach=sum(spec.lengths)
    _need(isinstance(sag,(int,float)) and not isinstance(sag,bool) and np.isfinite(sag) and 0<=sag<=reach*.25,'Continuous ink sag outside finite control-reach bound')
    root,wrist=np.asarray(nodes,dtype=float)[[0,2]];delta=wrist-root
    control=(root+wrist)/2+np.array([0.,2*sag])
    # Strict monotonic progress along the chord forbids folds and self-loops.
    derivatives=np.array([2*(control-root),2*(wrist-control)])
    _need(np.min(derivatives@delta)>1e-6,'Continuous ink path folds back along its root/wrist chord; reduce sag or re-author the pose')
    _need(np.dot(_unit(derivatives[0]),spec.exit_normal)>.02,'Continuous ink path points back into actual cuff')
    t=np.linspace(0.,1.,65)
    path=(1-t[:,None])**2*root+2*(1-t[:,None])*t[:,None]*control+t[:,None]**2*wrist
    lengths=np.linalg.norm(np.diff(path,axis=0),axis=1);arclength=float(lengths.sum())
    _need(arclength<=reach*1.05+1e-6,'Continuous painted arclength exceeds fixed control reach allowance')
    _need(min(lengths[:32].sum(),lengths[32:].sum())*scale>=spec.min_screen_segment_px,'Continuous painted half too small for readable output')
    return path,control,arclength

def _continuous_masks(size,path,width,seed):
    """Raster one coherent brush, then partition its alpha at the true midpoint.

    The halves are semantic ownership/depth masks, not separately painted bones.
    Their disjoint union exactly equals the single full-stroke raster.
    """
    path=np.asarray(path,dtype=float);root,wrist=path[[0,-1]];delta=wrist-root
    w,h=size;full=np.zeros((h,w),np.uint8)
    x0,y0,x1,y1=_raster_bounds(size,path,width+3)
    if x1<=x0 or y1<=y0:return full,full.copy(),full.copy()
    ss=3;offset=np.array([x0,y0]);im=np.zeros(((y1-y0)*ss,(x1-x0)*ss),np.uint8)
    distance=np.r_[0.,np.cumsum(np.linalg.norm(np.diff(path,axis=0),axis=1))];t=distance/distance[-1]
    tangent=np.gradient(path,axis=0);normal=np.column_stack((-tangent[:,1],tangent[:,0]))/np.linalg.norm(tangent,axis=1)[:,None]
    phase=(zlib.crc32(seed.encode())%997)/997.*2*math.pi
    pressure=width*.5*(1+.095*np.sin(t*2*math.pi+phase)+.035*np.sin(t*8*math.pi+phase*.7))
    poly=np.vstack((path+normal*pressure[:,None],(path-normal*pressure[:,None])[::-1]))
    cv2.fillPoly(im,[np.rint((poly-offset)*ss).astype(np.int32)],255,cv2.LINE_AA)
    for pt,radius in ((root,pressure[0]),(wrist,pressure[-1])):
        cv2.circle(im,tuple(np.rint((pt-offset)*ss).astype(int)),max(1,int(round(radius*ss))),255,-1,cv2.LINE_AA)
    yy,xx=np.indices(im.shape,dtype=np.float32)
    tx=((xx/ss+x0-root[0])*delta[0]+(yy/ss+y0-root[1])*delta[1])/np.dot(delta,delta)
    pigment=.96+.04*np.sin(tx*13*math.pi+phase)*np.sin(tx*7*math.pi+phase*.5)
    patch=cv2.resize(np.uint8(im*pigment),(x1-x0,y1-y0),interpolation=cv2.INTER_AREA)
    full[y0:y1,x0:x1]=patch
    yy,xx=np.indices(patch.shape,dtype=np.float32);midpoint=path[len(path)//2]
    before=(xx+x0-midpoint[0])*delta[0]+(yy+y0-midpoint[1])*delta[1]<=0
    upper=np.zeros_like(full);forearm=np.zeros_like(full)
    upper[y0:y1,x0:x1]=np.where(before,patch,0);forearm[y0:y1,x0:x1]=np.where(before,0,patch)
    return full,upper,forearm

def _ellipse_mask(size,center,radii):
    w,h=size;out=np.zeros((h,w),np.uint8);center=np.asarray(center);radii=np.asarray(radii)
    x0,y0,x1,y1=_raster_bounds(size,[center-radii,center+radii],3)
    if x1<=x0 or y1<=y0:return out
    ss=3;im=np.zeros(((y1-y0)*ss,(x1-x0)*ss),np.uint8)
    cv2.ellipse(im,tuple(np.rint((center-[x0,y0])*ss).astype(int)),tuple(np.maximum(1,np.rint(radii*ss).astype(int))),0,0,360,255,-1,cv2.LINE_AA)
    out[y0:y1,x0:x1]=cv2.resize(im,(x1-x0,y1-y0),interpolation=cv2.INTER_AREA)
    return out

def _dilate(a,r):
    r=max(1,int(math.ceil(r)));return cv2.dilate(np.uint8(a>32),cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*r+1,2*r+1)))>0

def _sum(a):
    return float(np.asarray(a,dtype=float).sum()/255.)



def _validate_contact(contact):
    _need(isinstance(contact,ContactState),'Prop contact must be ContactState')
    _matrix(contact.paper_matrix,'actual contact matrix',True)
    size=_array(contact.paper_size,(2,),'actual prop dimensions');_need(min(size)>0,'Positive prop dimensions required')
    _need(contact.state in ('owner','shared','release'),'Invalid actual contact state')
    _need(len(contact.holders)=={'owner':1,'shared':2,'release':0}[contact.state],'Actual contact holder count mismatch')
    ids=[]
    for q in contact.holders:
        _need(isinstance(q,dict) and set(q)>={'actor_id','arm','grip'} and q['actor_id'] and q['arm'] in SIDES,'Invalid actual prop holder')
        grip=_array(q['grip'],(2,),'actual grip uv');_need((grip>=0).all() and (grip<=1).all(),'Actual grip outside prop UV')
        ids.append((q['actor_id'],q['arm']))
    _need(len(set(ids))==len(ids),'Duplicate actual contact owner/arm')

def _validate_head_and_feet(a):
    _need(np.isfinite(a.head_angle_deg) and abs(a.head_angle_deg)<=20.,'Rigid head nod exceeds fitted ±20 degree limit')
    pivot=_array(a.view.head_anchor if a.head_pivot is None else a.head_pivot,(2,),'actual head pivot')
    _need(np.linalg.norm(pivot-a.view.head_anchor)<1e-6,'Head pivot moved away from fitted neck')
    _need(a.head_variant is None or a.head_variant in a.view.heads,'Unknown/unverified head expression asset')
    if a.view.neck_attachment is not None:
        evidence=_neck_local_evidence(a.view,a.head_angle_deg,a.head_variant)
        _need(evidence['body_mount_fraction']>=.95,'Actual neck mount moved away from painted body')
        _need(_neck_connected(a.view,evidence),'Actual painted head/body neck attachment disconnected')
    _need(isinstance(a.ankle_targets,Mapping) and set(a.ankle_targets)<=set(SIDES),'Invalid planted ankle side')
    for side,target in a.ankle_targets.items():
        local=_point(np.linalg.inv(a.placement),_array(target,(2,),'screen planted ankle'))
        leg=a.view.legs[side];length=float(np.linalg.norm(local-leg['hip']))
        _need(np.linalg.norm(local-leg['ankle'])<=leg['length']*.25,'Planted ankle correction exceeds stance envelope')
        _need(.92<=length/leg['length']<=1.08,'Planted straight-leg length outside 8% stance envelope')
        _need(local[1]>leg['hip'][1]+leg['length']*.5,'Planted ankle direction invalid')

def _head_rotation(anchor,angle_deg):
    x,y=anchor;angle=math.radians(angle_deg);cs=math.cos(angle);sn=math.sin(angle)
    return np.array([[cs,-sn,x-cs*x+sn*y],[sn,cs,y-sn*x-cs*y],[0,0,1.]])

def _head_placement(a):
    anchor=a.view.head_anchor if a.head_pivot is None else a.head_pivot
    return a.placement@_head_rotation(anchor,a.head_angle_deg)

_OPAQUE_COMPONENTS={}

def _main_opaque_alpha(asset):
    """Exclude stray paint dots: attachment must join the actual main sprites."""
    if asset.sha256 not in _OPAQUE_COMPONENTS:
        mask=np.uint8(asset.image[:,:,3]>128)
        count,labels,stats,_=cv2.connectedComponentsWithStats(mask,8)
        _need(count>1,'Sprite has no opaque main component for neck attachment')
        largest=1+int(np.argmax(stats[1:,cv2.CC_STAT_AREA]))
        _OPAQUE_COMPONENTS[asset.sha256]=_readonly(np.uint8(labels==largest)*255)
    return _OPAQUE_COMPONENTS[asset.sha256]

def _neck_local_evidence(view,angle,variant):
    """Test real sprite alpha in the fixed painted mount at 4x local sampling."""
    polygon=view.neck_attachment['mount_polygon']
    edges=np.roll(polygon,-1,axis=0)-polygon
    along=_unit(edges[np.argmax(np.linalg.norm(edges,axis=1))]);across=np.array([-along[1],along[0]])
    basis=np.array([along,across]);aligned=polygon@basis.T
    minimum=aligned.min(axis=0)-2;maximum=aligned.max(axis=0)+2
    scale=4.;size=tuple(np.ceil((maximum-minimum)*scale).astype(int))
    matrix=np.eye(3);matrix[:2,:2]=basis*scale;matrix[:2,2]=-minimum*scale
    probe=np.zeros((size[1],size[0]),np.uint8)
    cv2.fillConvexPoly(probe,np.rint(np.array([_point(matrix,p) for p in polygon])).astype(np.int32),255)
    body=_warp(_main_opaque_alpha(view.body),matrix@view.body.image_to_local,size)>128
    head=view.head if variant is None else view.heads[variant]
    head_mask=_warp(_main_opaque_alpha(head),matrix@_head_rotation(view.head_anchor,angle)@head.image_to_local,size)>128
    mount=probe>128;painted=mount&body;overlap=painted&head_mask
    longest=[]
    for column in overlap.T:
        padded=np.r_[False,column,False].astype(np.int8);changes=np.diff(padded)
        runs=np.flatnonzero(changes==-1)-np.flatnonzero(changes==1)
        longest.append(float(runs.max(initial=0)/scale))
    qualified=np.asarray(longest)>=view.neck_attachment['min_overlap_thickness']
    return {'body_mount_fraction':float(painted.sum()/max(1,mount.sum())),
            'overlap_fraction':float(overlap.sum()/max(1,painted.sum())),
            'overlap_span_fraction':float(np.any(overlap,axis=0).sum()/max(1,np.any(painted,axis=0).sum())),
            'thickness_qualified_span_fraction':float(qualified.sum()/max(1,np.any(painted,axis=0).sum())),
            'required_overlap_thickness':view.neck_attachment['min_overlap_thickness'],
            'local_overlap_area':float(overlap.sum()/scale**2)}

def _neck_connected(view,evidence):
    return (evidence['overlap_fraction']>=view.neck_attachment['min_overlap_fraction']
            and evidence['overlap_span_fraction']>=.5 and evidence['thickness_qualified_span_fraction']>=.5)

def _validate_action_envelope(spec,ch,action):
    rule=spec.action_envelopes.get(action,{})
    if 'upper_angle_range_deg' in rule:
        _need(_angular_in(_angle(ch[1]-ch[0]),rule['upper_angle_range_deg']),'Actual arm outside selected action upper-angle envelope: '+action)
    if rule.get('forbid_elbow_above_root_when_wrist_below_root'):
        _need(not(ch[1,1]<ch[0,1]-1e-6 and ch[2,1]>ch[0,1]+1e-6),'Selected action forms raised-elbow hanging-hand silhouette: '+action)

def _neck_screen_evidence(a,size,body,head):
    evidence=_neck_local_evidence(a.view,a.head_angle_deg,a.head_variant)
    polygon=a.view.neck_attachment['mount_polygon'];projected=np.array([_point(a.placement,p) for p in polygon])
    probe=np.zeros((size[1],size[0]),np.uint8)
    cv2.fillConvexPoly(probe,np.rint(projected).astype(np.int32),255)
    head_asset=a.view.head if a.head_variant is None else a.view.heads[a.head_variant]
    main_body=_warp(_main_opaque_alpha(a.view.body),a.placement@a.view.body.image_to_local,size)>128
    main_head=_warp(_main_opaque_alpha(head_asset),_head_placement(a)@head_asset.image_to_local,size)>128
    overlap=(probe>128)&main_body&main_head&(body[:,:,3]>128)&(head[:,:,3]>128)
    center_in_frame=_inside_canvas(size,projected.mean(axis=0))
    evidence.update(actor_id=a.actor_id,head_variant=a.head_variant,head_angle_deg=a.head_angle_deg,
        mount_polygon_screen=projected.tolist(),mount_center_in_frame=center_in_frame,
        output_overlap_pixels=int(overlap.sum()),actual_main_alpha_connected=bool(overlap.any()),
        viewport_clipped=not center_in_frame,body_alpha_sha256=_sha(body[:,:,3].tobytes()),head_alpha_sha256=_sha(head[:,:,3].tobytes()))
    return evidence

def _inside_canvas(size,p,margin=0.):
    x,y=p;w,h=size
    return bool(-margin<=x<w+margin and -margin<=y<h+margin)

def _validate_actor_frame(a,frame_index):
    """Recheck submitted geometry; a caller may have edited ActorFrame after pose."""
    _need(isinstance(a,ActorFrame),'ActorFrame required')
    _need(isinstance(a.actor_id,str) and a.actor_id,'Invalid actual actor identity')
    _need(a.frame_index==frame_index,'Actor frame index mismatch')
    _need(a.view.view_id in a.character.views and a.character.views[a.view.view_id] is a.view,'Actual view must belong to loaded character package')
    m=_matrix(a.placement,'actual actor placement',True)
    _validate_head_and_feet(a)
    _need(set(a.arms)==set(SIDES),'Actual actor must have exactly two anatomical arms')
    for side,spec in a.view.arms.items():
        label=a.actor_id+':arm:'+side;ch=_array(a.arms[side],(3,2),label+' actual nodes')
        _need(np.linalg.norm(ch[0]-spec.socket)<1e-6,label+': actual root moved away from fitted socket')
        lengths=np.linalg.norm(np.diff(ch,axis=0),axis=1)
        _need(np.max(np.abs(lengths-spec.lengths))<1e-5,label+': actual fixed planar bone length violation')
        uv=_unit(ch[1]-ch[0]);fv=_unit(ch[2]-ch[1]);upper=_angle(uv)
        bend=math.degrees(math.acos(float(np.clip(np.dot(uv,fv),-1,1))))
        _need(_angular_in(upper,spec.upper_range) and spec.bend_range[0]-1e-5<=bend<=spec.bend_range[1]+1e-5,label+': actual joint angles outside package ranges')
        d=ch[2]-ch[0];e=ch[1]-ch[0];signed=d[0]*e[1]-d[1]*e[0]
        _need(signed*spec.pole>1e-6,label+': actual elbow pole changed')
        _need(np.dot(uv,spec.exit_normal)>.02,label+': actual upper arm points back into cuff')
        _need(min(lengths)*_scale(m)>=spec.min_screen_segment_px,label+': actual projected segment collapse')
        override=a.arm_actions.get(side,{});nominal=forward_kinematics(spec,PoseLibrary.sample(spec,override.get('action',a.action),override.get('phase',a.phase)))
        _validate_action_envelope(spec,ch,override.get('action',a.action))
        if spec.ink_path is not None:_continuous_ink_geometry(spec,ch,_scale(m))
        _need(np.linalg.norm(ch[2]-nominal[2])<=spec.max_ik_offset+1e-6,label+': actual wrist exceeds finite authored-pose IK correction')
    return True


def render_scene(size,actors,paper=None,background=None,frame_index=0,foreground=None,foreground_occlusion_mask=None,paper_art=None,props=None) -> RenderResult:
    """Render final beauty and final visible masks together, then audit actual pixels.

    Optional foreground must have a separately declared alpha mask matching its
    own alpha. Visibility minima still apply, so declaring a matte cannot hide
    every malformed limb. Post-render beauty edits invalidate the result hash.
    """
    size=tuple(map(int,size));w,h=size;_need(w>0 and h>0,'Invalid canvas size')
    actors=list(actors)
    for actor in actors:_validate_actor_frame(actor,frame_index)
    ids=[a.actor_id for a in actors];_need(len(set(ids))==len(ids),'Duplicate actor/limb IDs')
    _need(paper is None or props is None,'Use legacy paper or props, not both')
    prop_frames=list(props or []) if paper is None else [PropFrame('paper',paper,paper_art)]
    _need(all(isinstance(p,PropFrame) and isinstance(p.prop_id,str) and p.prop_id and ':' not in p.prop_id for p in prop_frames),'Invalid actual prop identity')
    _need(len({p.prop_id for p in prop_frames})==len(prop_frames),'Duplicate rendered prop identity')
    actual_arm_parts={a.actor_id+':arm:'+side+':'+part for a in actors for side in SIDES for part in ('upper','forearm')}
    front_groups={}
    for index,prop in enumerate(prop_frames):
        parts=prop.front_limb_parts
        _need(isinstance(parts,(list,tuple)) and all(isinstance(part,str) for part in parts),'Prop front_limb_parts must contain named arm parts')
        _need(len(set(parts))==len(parts),'Prop front_limb_parts must contain unique named arm parts')
        _need(all(isinstance(part,str) and part in actual_arm_parts for part in parts),'Prop front_limb_parts names an absent or unsupported arm part')
        for part in parts:front_groups.setdefault(part,[]).append(index)
    for part,indices in front_groups.items():
        _need(indices==list(range(indices[0],indices[-1]+1)),'A foreground arm part requires a contiguous prop depth group')
    requested={}
    for p in prop_frames:
        _validate_contact(p.contact)
        for q in p.contact.holders:
            key=(q['actor_id'],q['arm']);grip=_point(p.contact.paper_matrix,(np.asarray(q['grip'])-.5)*p.contact.paper_size)
            if key in requested:_need(np.linalg.norm(requested[key]-grip)<=.75,'One hand cannot hold incompatible prop grips')
            requested[key]=grip
    _need(all(a.frame_index==frame_index for a in actors),'Actor frame index mismatch')
    canvas=np.zeros((h,w,4),np.float32) if background is None else _rgba(background,size).astype(np.float32)/255.
    # Canvas uses straight RGB and alpha. Compositing updates all visible mattes.
    visible={};raw={};arm_rows=[];leg_rows=[];neck_rows=[];cuff_masks={};cuff_body={};arm_specs={};hand_layers=[]
    pending={};layer_order=0
    def composite(image,key=None,original_order=None,occlusion_key=None):
        nonlocal canvas
        nonlocal layer_order
        im=_rgba(image,size);ys,xs=np.nonzero(im[:,:,3]);alpha_full=im[:,:,3].astype(np.float32)/255.
        order=layer_order if original_order is None else original_order
        if original_order is None:layer_order+=1
        if key in front_groups and original_order is None:
            _need(key not in pending and key not in visible,'Duplicate deferred arm part: '+key)
            pending[key]={'image':im,'alpha':alpha_full.copy(),'order':order}
            raw[key]=alpha_full.copy()
            return
        for part,record in pending.items():
            if record['order']>=order:continue
            skipped={('prop:'+prop_frames[i].prop_id) for i in front_groups[part]}
            if (occlusion_key or key) not in skipped:record['alpha']*=1-alpha_full
        if len(xs):
            roi=np.s_[ys.min():ys.max()+1,xs.min():xs.max()+1];patch=im[roi].astype(np.float32)/255.;alpha=patch[:,:,3]
            for k in visible: visible[k][roi]*=(1-alpha)
            dst=canvas[roi];dst_a=dst[:,:,3];outa=alpha+dst_a*(1-alpha)
            rgb=(patch[:,:,:3]*alpha[:,:,None]+dst[:,:,:3]*dst_a[:,:,None]*(1-alpha[:,:,None]))/np.maximum(outa[:,:,None],1e-8)
            canvas[roi]=np.dstack((rgb,outa))
        if key is not None:
            _need(key not in visible,'Duplicate rendered part ID: '+key)
            visible[key]=alpha_full.copy()
            if key not in raw:raw[key]=alpha_full.copy()
    def colored(mask,color,key=None,occlusion_key=None):
        im=np.empty((h,w,4),np.uint8);im[:,:,:3]=color;im[:,:,3]=mask;composite(im,key,occlusion_key=occlusion_key)
    def sprite(asset,m,key=None): composite(_warp(asset.image,m@asset.image_to_local,size),key)
    for a in actors:
        v=a.view;m=a.placement;scale=_scale(m);color=v.ink_color
        for side,l in v.legs.items():
            hip=_point(m,l['hip']);ankle=np.asarray(a.ankle_targets.get(side,_point(m,l['ankle'])),dtype=float);key=a.actor_id+':leg:'+side
            local_ankle=_point(np.linalg.inv(m),ankle)
            mask=_line_mask(size,hip,ankle,l['ink_width']*scale,key);colored(mask,color,key+':shaft')
            if l.get('foot_asset'):
                foot_matrix=m.copy();foot_matrix[:2,2]=ankle
                sprite(l['foot_asset'],foot_matrix,key+':foot')
            else:
                foot=_ellipse_mask(size,ankle,l['foot_size']*scale/2);colored(foot,color,key+':foot')
            leg_rows.append({'limb_id':key,'actor_id':a.actor_id,'side':side,'hip':hip.tolist(),'ankle':ankle.tolist(),'local_hip':l['hip'].tolist(),'local_ankle':local_ankle.tolist(),'authored_stance_length':l['length'],'fixed_length':l['length'] if side not in a.ankle_targets else None,'actual_length':float(np.linalg.norm(local_ankle-l['hip'])),'planted':True,'planted_space':'screen_target' if side in a.ankle_targets else 'actor_local','gait':'static_straight_stance','actor_uniform_scale':scale})
        def arm(side):
            spec=v.arms[side];ch=a.arms[side];screen=np.array([_point(m,p) for p in ch]);key=a.actor_id+':arm:'+side
            arm_specs[key]=(a,spec,screen)
            ink_record={}
            if spec.ink_path is None:
                upper=_line_mask(size,screen[0],screen[1],spec.ink_width*scale,key+':upper')
                forearm=_line_mask(size,screen[1],screen[2],spec.ink_width*scale,key+':forearm')
            else:
                local_path,control,arclength=_continuous_ink_geometry(spec,ch,scale)
                path=np.array([_point(m,p) for p in local_path]);full,upper,forearm=_continuous_masks(size,path,spec.ink_width*scale,key)
                ink_record={'ink_path_local':local_path.tolist(),'ink_path_screen':path.tolist(),'ink_control_local':control.tolist(),'ink_arclength_local':arclength,'ink_arclength_screen':arclength*scale,'ink_sag_local':spec.ink_path['sag'],'ink_midpoint_screen':path[len(path)//2].tolist(),'unoccluded_full_ink_sha256':_sha(full.tobytes()),'part_interpretation':'semantic halves of one continuous stroke; not painted bone lengths'}
            colored(upper,color,key+':upper');colored(forearm,color,key+':forearm')
            if spec.hand_asset is not None:
                hm=m.copy();hm[:2,2]=screen[2]
                hand_layers.append((key,_warp(spec.hand_asset.image,hm@spec.hand_asset.image_to_local,size),None))
            else:hand_layers.append((key,_ellipse_mask(size,screen[2],[spec.hand_radius*scale]*2),color))
            cuff=_warp(spec.cuff.image,m@spec.cuff.image_to_local,size)
            cuff_masks[key]=cuff
            control_lengths=np.linalg.norm(np.diff(ch,axis=0),axis=1).tolist()
            arm_rows.append({'limb_id':key,'actor_id':a.actor_id,'character_id':a.character.character_id,'package_fingerprint':a.character.fingerprint,'view_id':v.view_id,'side':side,'screen_nodes':screen.tolist(),'local_nodes':ch.tolist(),'nodes_role':'internal_fixed_reach_controls' if spec.ink_path is not None else 'painted_two_bone_path','fixed_lengths':list(spec.lengths) if spec.ink_path is None else None,'actual_planar_lengths':control_lengths if spec.ink_path is None else None,'control_fixed_lengths':list(spec.lengths),'control_actual_planar_lengths':control_lengths,'ink_mode':'continuous' if spec.ink_path is not None else 'two_bone','pole':spec.pole,'action':a.arm_actions.get(side,{}).get('action',a.action),'phase':a.arm_actions.get(side,{}).get('phase',a.phase),'layer':spec.layer,**ink_record})
        for side,spec in v.arms.items():
            if spec.layer=='back': arm(side)
        sprite(v.body,m)
        for side,spec in v.arms.items():
            if spec.layer=='front': arm(side)
        body=_warp(v.body.image,m@v.body.image_to_local,size)
        # Restore the actual painted sleeve cap from the same torso pixels.
        for side in SIDES:
            key=a.actor_id+':arm:'+side;cuff=cuff_masks[key];layer=body.copy();layer[:,:,3]=np.uint8(layer[:,:,3].astype(float)*cuff/255.)
            composite(layer);cuff_body[key]=layer[:,:,3]
        head_asset=v.head if a.head_variant is None else v.heads[a.head_variant]
        head=_warp(head_asset.image,_head_placement(a)@head_asset.image_to_local,size)
        composite(head)
        if v.neck_attachment is not None:neck_rows.append(_neck_screen_evidence(a,size,body,head))
    prop_masks={};prop_art_hashes={};prop_rows=[];grip_rows=[]
    for prop_index,prop in enumerate(prop_frames):
        paper=prop.contact;paper_art=prop.art;prop_key='prop:'+prop.prop_id
        paper_mask=None;paper_art_sha=None
        _need(isinstance(paper,ContactState),'paper must be sampled ContactState')
        pw,ph=paper.paper_size;corners=np.array([[-pw/2,-ph/2],[pw/2,-ph/2],[pw/2,ph/2],[-pw/2,ph/2]])
        xy=np.rint(np.array([_point(paper.paper_matrix,p) for p in corners])).astype(np.int32)
        if paper_art is None:
            paper_mask=np.zeros((h,w),np.uint8);cv2.fillConvexPoly(paper_mask,xy,255,cv2.LINE_AA)
            colored(paper_mask,paper.color,prop_key)
            outline=np.zeros_like(paper_mask);cv2.polylines(outline,[xy],True,255,2,cv2.LINE_AA);colored(outline,(87,76,59),occlusion_key=prop_key)
        else:
            art=_rgba(paper_art);ah,aw=art.shape[:2];fit=min(pw/aw,ph/ah)
            _need(np.any(art[:,:,3]),'Empty painted paper art')
            to_paper=np.array([[fit,0,-aw*fit/2],[0,fit,-ah*fit/2],[0,0,1.]])
            painted=_warp(art,paper.paper_matrix@to_paper,size);paper_mask=painted[:,:,3]
            composite(painted,prop_key);paper_art_sha=_sha(art.tobytes())
        prop_masks[prop.prop_id]=paper_mask;prop_art_hashes[prop.prop_id]=paper_art_sha
        prop_rows.append({'prop_id':prop.prop_id,'state':paper.state,'holders':paper.holders,'matrix':paper.paper_matrix.tolist(),'paper_size':list(paper.paper_size),'art_sha256':paper_art_sha,'front_limb_parts':list(prop.front_limb_parts)})
        # Lift each declared part only once, after its contiguous prop group.
        # Its original later body/head/cuff/actor occlusion remains in alpha;
        # the raw denominator remains the complete original limb stroke.
        ready=[part for part,indices in front_groups.items() if indices[-1]==prop_index]
        for part in sorted(ready,key=lambda name:pending[name]['order']):
            record=pending.pop(part);layer=record['image'].copy()
            layer[:,:,3]=np.uint8(np.clip(record['alpha'],0,1)*255)
            composite(layer,part,original_order=record['order'])
    _need(not pending,'Declared foreground arm part was never composited')
    for key,mask,color in hand_layers:
        if color is None:composite(mask,key+':hand')
        else:colored(mask,color,key+':hand')
    if foreground is not None:
        fg=_rgba(foreground,size);_need(foreground_occlusion_mask is not None,'Foreground requires explicit matching occlusion matte')
        declared=np.asarray(foreground_occlusion_mask)
        if declared.ndim==3: declared=declared[:,:,3] if declared.shape[2]==4 else declared[:,:,0]
        _need(declared.shape==(h,w) and np.max(np.abs(declared.astype(float)-fg[:,:,3]))<=1,'Foreground alpha differs from declared occlusion matte')
        composite(fg)
    beauty=Image.fromarray(np.uint8(np.clip(canvas,0,1)*255),'RGBA')
    parts={k:np.uint8(np.clip(a,0,1)*255) for k,a in visible.items()}
    raw8={k:np.uint8(np.clip(a,0,1)*255) for k,a in raw.items()}
    errors=[];limb_masks={};pixel_rows=[]
    for row in neck_rows:
        if row['mount_center_in_frame'] and not row['actual_main_alpha_connected']:
            errors.append(row['actor_id']+': actual rendered head/body alpha disconnected at neck mount')
    for row in arm_rows:
        key=row['limb_id'];a,spec,ch=arm_specs[key];scale=_scale(a.placement)
        keys=[key+':'+part for part in ('upper','forearm','hand')]
        union=np.maximum.reduce([parts[k] for k in keys]);limb_masks[key]=union
        fractions={p:(_sum(parts[key+':'+p])/_sum(raw8[key+':'+p]) if _sum(raw8[key+':'+p])>1e-8 else None) for p in ('upper','forearm','hand')}
        clipped={p:fractions[p] is None for p in fractions}
        for p,f in fractions.items():
            if f is not None and f<spec.visibility_min[p]: errors.append(key+': '+p+' not sufficiently readable after actual occlusion')
        cuff=cuff_masks[key];band=_dilate(cuff,max(2,spec.ink_width*scale*1.5))
        root_touch=bool(np.any((parts[key+':upper']>32)&band))
        socket_neighborhood=_ellipse_mask(size,ch[0],[max(3,spec.ink_width*scale*2)]*2)>0
        cuff_at_socket=bool(np.any((cuff>32)&socket_neighborhood))
        outlet=np.array([_point(a.placement,p) for p in spec.outlet_segment]);outlet_band=_line_mask(size,outlet[0],outlet[1],max(4.,spec.ink_width*scale*3),'opening')
        outlet_touch=bool(np.any((parts[key+':upper']>32)&(outlet_band>32)))
        wrist_touch=bool(np.any(_dilate(parts[key+':forearm'],max(1,spec.ink_width*scale*.5))&(parts[key+':hand']>32)))
        upper_fore=bool(np.any(_dilate(parts[key+':upper'],max(1,spec.ink_width*scale*.5))&(parts[key+':forearm']>32)))
        root_in_frame=_inside_canvas(size,ch[0])
        ink_join=np.asarray(row.get('ink_midpoint_screen',ch[1]),dtype=float)
        join_in_frame=_inside_canvas(size,ink_join)
        elbow_in_frame=_inside_canvas(size,ch[1]) if spec.ink_path is None else None
        wrist_in_frame=_inside_canvas(size,ch[2])
        if root_in_frame and not(root_touch and cuff_at_socket and outlet_touch): errors.append(key+': visible root does not emerge through actual cuff neighborhood')
        if wrist_in_frame and not wrist_touch: errors.append(key+': actual forearm/hand alpha disconnected')
        if join_in_frame and not upper_fore: errors.append(key+': actual upper/forearm alpha disconnected')
        row.update(visible_fraction=fractions,viewport_clipped_parts=clipped,root_in_frame=root_in_frame,elbow_in_frame=elbow_in_frame,wrist_in_frame=wrist_in_frame,root_cuff_contact=root_touch,cuff_at_socket=cuff_at_socket,actual_outlet_contact=outlet_touch,screen_outlet=outlet.tolist(),wrist_hand_connected=wrist_touch,elbow_connected=upper_fore if spec.ink_path is None else None,ink_join_screen=ink_join.tolist(),ink_join_in_frame=join_in_frame,ink_halves_connected=upper_fore)
        pixel_rows.append({'limb_id':key,'visible_pixels':int(np.count_nonzero(union>32))})
    for row in leg_rows:
        key=row['limb_id'];limb_masks[key]=np.maximum(parts[key+':shaft'],parts[key+':foot'])
        connected=bool(np.any(_dilate(parts[key+':shaft'],2)&(parts[key+':foot']>32)))
        row['ankle_foot_connected']=connected;row['ankle_in_frame']=_inside_canvas(size,row['ankle'])
        row['viewport_clipped']=not bool(np.any(raw8[key+':shaft']) or np.any(raw8[key+':foot']))
        if row['ankle_in_frame'] and not connected: errors.append(key+': planted leg disconnected from foot')
    for prop in prop_frames:
        paper=prop.contact;paper_mask=prop_masks[prop.prop_id]
        for q in paper.holders:
            key=q['actor_id']+':arm:'+q['arm'];_need(key in arm_specs,'Paper owner absent from actual rendered cast: '+key)
            _,spec,ch=arm_specs[key]
            # Independent paper UV projection, not a replay of requested wrist target.
            local=(np.asarray(q['grip'])-.5)*paper.paper_size;grip=_point(paper.paper_matrix,local)
            error=float(np.linalg.norm(ch[2]-grip));hand=parts[key+':hand'];near=_ellipse_mask(size,grip,[max(2,spec.hand_radius)]*2)>0
            touches_paper=bool(np.any((hand>32)&_dilate(paper_mask,2)))
            actual_grip=bool(np.any((hand>32)&near))
            grip_in_frame=_inside_canvas(size,grip)
            grip_rows.append({'prop_id':prop.prop_id,'limb_id':key,'state':paper.state,'grip':grip.tolist(),'wrist':ch[2].tolist(),'error_px':error,'actual_hand_at_grip':actual_grip,'actual_hand_paper_touch':touches_paper,'grip_in_frame':grip_in_frame})
            if error>.75 or (grip_in_frame and (not actual_grip or not touches_paper)): errors.append(key+': independent rendered paper/hand contact failed')
    id_image=np.zeros((h,w),np.uint32);id_codes={}
    for key,mask in parts.items():
        code=(zlib.crc32(key.encode())&0x7fffffff) or 1
        _need(code not in id_codes.values(),'Part ID hash collision')
        id_codes[key]=code;id_image[mask>32]=code
    qa={'schema':'b6-puppet-render/1','frame_index':frame_index,'errors':errors,'actors':[{'actor_id':a.actor_id,'character_id':a.character.character_id,'package_fingerprint':a.character.fingerprint,'view_id':a.view.view_id,'art_hashes':dict(a.character.art_hashes),'head_variant':a.head_variant,'head_angle_deg':a.head_angle_deg,'head_anchor':a.view.head_anchor.tolist()} for a in actors], 'arms':arm_rows,'legs':leg_rows,'neck_records':neck_rows,'contact_errors':[r['error_px'] for r in grip_rows],'arm_records':arm_rows,'leg_records':leg_rows,'contact_records':grip_rows,'limb_ids':sorted(limb_masks),'arm_ids':sorted(r['limb_id'] for r in arm_rows),'leg_ids':sorted(r['limb_id'] for r in leg_rows),'part_id_codes':id_codes,'mask_sha256':{k:_sha(v.tobytes()) for k,v in parts.items()},'limb_mask_sha256':{k:_sha(v.tobytes()) for k,v in limb_masks.items()},'beauty_sha256':_sha(np.asarray(beauty).tobytes()),'id_sha256':_sha(id_image.tobytes()),'prop_art_sha256':prop_art_hashes.get('paper') if paper is not None and len(prop_frames)==1 and prop_frames[0].prop_id=='paper' else None,'props':prop_rows,'prop_art_hashes':prop_art_hashes,'foreground_occlusion_declared':foreground is not None,'visual_review_required':True,'pixel_evidence':pixel_rows}
    return RenderResult(beauty,limb_masks,parts,id_image,qa)

def validate_render_result(result,expected_actor_ids=None):
    """Recheck immutable final pixels/mattes and inventories before encoding."""
    _need(isinstance(result,RenderResult),'Character-system scene must return RenderResult')
    q=result.qa;errors=list(q.get('errors',['QA evidence missing']))
    if _sha(np.asarray(result.beauty).tobytes())!=q.get('beauty_sha256'):errors.append('Final beauty mutated after puppet visibility audit')
    if _sha(result.id_image.tobytes())!=q.get('id_sha256'):errors.append('Final part ID image mutated after audit')
    if set(result.part_masks)!=set(q.get('mask_sha256',{})):errors.append('Final part-mask inventory changed')
    for k,a in result.part_masks.items():
        if _sha(a.tobytes())!=q.get('mask_sha256',{}).get(k):errors.append('Final visible alpha mask changed: '+k)
    if set(result.limb_masks)!=set(q.get('limb_mask_sha256',{})):errors.append('Final limb-mask inventory changed')
    for k,a in result.limb_masks.items():
        if _sha(a.tobytes())!=q.get('limb_mask_sha256',{}).get(k):errors.append('Final limb alpha changed: '+k)
    actor_ids=[a['actor_id'] for a in q.get('actors',[])]
    if len(actor_ids)!=len(set(actor_ids)):errors.append('Duplicate actor identity')
    if expected_actor_ids is not None and set(actor_ids)!=set(expected_actor_ids):errors.append('Expected cast does not match actual rendered actors')
    expected_arms={a+':arm:'+s for a in actor_ids for s in SIDES};expected_legs={a+':leg:'+s for a in actor_ids for s in SIDES}
    if set(q.get('arm_ids',[]))!=expected_arms:errors.append('Missing, duplicate or swapped arm ID')
    if set(q.get('leg_ids',[]))!=expected_legs:errors.append('Missing, duplicate or swapped leg ID')
    if len(q.get('arm_records',[]))!=len(expected_arms) or len(q.get('leg_records',[]))!=len(expected_legs):errors.append('Duplicate/missing limb records')
    _need(not errors,'; '.join(errors))
    return q
