"""Exercise real painted alpha/contact output and reject injected limb defects."""
from pathlib import Path
import copy
from dataclasses import replace
import hashlib
import importlib.util
import json
import shutil
import sys
import tempfile
import unittest

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('b6_test_puppet', ROOT/'scripts/b6_puppet.py')
r = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = r
spec.loader.exec_module(r)
PACKAGES = ROOT/'assets/b6/characters'


class PaintedPuppet(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.character = r.load_character(PACKAGES/'kiosk_keeper')

    def actor(self, view='front'):
        return r.Puppet(self.character, view, 'keeper').pose(
            placement=[[1,0,300],[0,1,650],[0,0,1]], frame_index=0)

    def render(self, actor=None, **kwargs):
        return r.render_scene((900,720), [actor or self.actor()], frame_index=0, **kwargs)

    def valid(self, result):
        return r.validate_render_result(result, expected_actor_ids={'keeper'})

    def test_six_real_painted_views_have_readable_limbs(self):
        for name in ('kiosk_keeper','parcel_runner'):
            character = r.load_character(PACKAGES/name)
            for view in ('front','three_quarter','side'):
                with self.subTest(character=name, view=view):
                    actor = r.Puppet(character, view, 'keeper').pose(
                        placement=[[1,0,300],[0,1,650],[0,0,1]], frame_index=0)
                    qa = self.valid(self.render(actor))
                    self.assertEqual(len(qa['arm_records']), 2)
                    self.assertEqual(len(qa['leg_records']), 2)
                    self.assertFalse(qa['errors'])

    def test_nonuniform_actor_scaling_rejected(self):
        with self.assertRaises(r.PuppetError):
            r.Puppet(self.character,'front','keeper').pose(placement=[[1.2,0,300],[0,1,650],[0,0,1]])

    def test_unreachable_contact_rejected(self):
        with self.assertRaises(r.PuppetError):
            r.Puppet(self.character,'front','keeper').pose(wrist_targets={'right':[10000,10000]})

    def test_unannounced_view_change_rejected(self):
        with self.assertRaises(r.PuppetError):
            r.Puppet(self.character,'front','keeper').set_view('side')

    def test_missing_arm_rejected_before_compositing(self):
        actor = self.actor(); del actor.arms['left']
        with self.assertRaises(r.PuppetError): self.render(actor)

    def test_moved_socket_rejected_after_pose(self):
        actor = self.actor(); actor.arms['left'] += [30,0]
        with self.assertRaises(r.PuppetError): self.render(actor)

    def test_stretched_bone_rejected_after_pose(self):
        actor = self.actor(); actor.arms['right'][2] += [35,0]
        with self.assertRaises(r.PuppetError): self.render(actor)

    def test_reflected_elbow_rejected_with_bone_lengths_preserved(self):
        actor = self.actor(); nodes = actor.arms['right']
        direction = nodes[2]-nodes[0]; direction /= np.linalg.norm(direction)
        elbow = nodes[1]-nodes[0]
        nodes[1] = nodes[0] + 2*np.dot(elbow,direction)*direction-elbow
        with self.assertRaises(r.PuppetError): self.render(actor)

    def test_actual_foreground_swallowing_character_is_rejected(self):
        cover = Image.new('RGBA',(900,720),(210,160,100,255))
        with self.assertRaises(r.PuppetError):
            self.valid(self.render(foreground=cover, foreground_occlusion_mask=np.asarray(cover)[:,:,3]))

    def test_missing_foreground_alpha_declaration_rejected(self):
        with self.assertRaises(r.PuppetError): self.render(foreground=Image.new('RGBA',(900,720),(0,0,0,255)))

    def test_composited_beauty_change_invalidates_evidence(self):
        result = self.render(); result.beauty.putpixel((0,0),(1,2,3,255))
        with self.assertRaises(r.PuppetError): self.valid(result)

    def test_visible_limb_mask_change_invalidates_evidence(self):
        result = self.render(); key = next(iter(result.limb_masks)); result.limb_masks[key][:] = 0
        with self.assertRaises(r.PuppetError): self.valid(result)

    def test_part_id_change_invalidates_evidence(self):
        result = self.render(); result.id_image[0,0] += 1
        with self.assertRaises(r.PuppetError): self.valid(result)

    def test_expected_cast_cannot_be_silently_omitted(self):
        result = self.render()
        with self.assertRaises(r.PuppetError): r.validate_render_result(result, expected_actor_ids={'keeper','runner'})

    def test_package_configuration_is_deep_readonly(self):
        arm = self.character.views['front'].arms['left']
        with self.assertRaises((ValueError,TypeError)): arm.socket[0] += 20
        with self.assertRaises((ValueError,TypeError)): self.character.views['front'].arms['left'] = arm

    def test_owner_cannot_switch_without_shared_contact(self):
        with self.assertRaises(r.PuppetError):
            r.ContactTimeline([
                dict(t0=0,t1=1,state='owner',holders=[dict(actor_id='keeper',arm='right',grip=[0,.5])],paper_start=[400,400,0]),
                dict(t0=1,t1=2,state='owner',holders=[dict(actor_id='runner',arm='left',grip=[1,.5])],paper_start=[400,400,0]),
            ])

    def test_paper_transform_cannot_jump_at_transfer(self):
        holder = dict(actor_id='keeper',arm='right',grip=[0,.5])
        with self.assertRaises(r.PuppetError):
            r.ContactTimeline([
                dict(t0=0,t1=1,state='owner',holders=[holder],paper_start=[400,400,0]),
                dict(t0=1,t1=2,state='owner',holders=[holder],paper_start=[410,400,0]),
            ])

    def test_paper_contact_cannot_report_a_different_visible_hand(self):
        paper = r.ContactTimeline([
            dict(t0=0,t1=1,state='owner',holders=[dict(actor_id='keeper',arm='right',grip=[0,.5])],paper_start=[650,400,0]),
        ]).sample(0)
        with self.assertRaises(r.PuppetError): self.valid(self.render(paper=paper))

    def test_actual_art_hash_drift_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            package=Path(temp)/'character'; shutil.copytree(PACKAGES/'kiosk_keeper',package)
            path=package/'front/body.png'; path.write_bytes(path.read_bytes()+b'changed')
            with self.assertRaises(r.PuppetError): r.load_character(package)

    def test_whole_garment_cannot_be_used_as_sleeve_mask(self):
        with tempfile.TemporaryDirectory() as temp:
            package=Path(temp)/'character'; shutil.copytree(PACKAGES/'kiosk_keeper',package)
            path=package/'package.json'; data=json.loads(path.read_text())
            data['views']['front']['arms']['left']['cuff']=copy.deepcopy(data['views']['front']['sprites']['body'])
            path.write_text(json.dumps(data))
            with self.assertRaises(r.PuppetError): r.load_character(package)



    def prop_at_hand(self, actor, prop_id='bill', dx=0., angle=0.):
        wrist=r._point(actor.placement,actor.arms['right'][2]);wrist=wrist+[dx,0]
        a=np.deg2rad(angle);m=np.array([[np.cos(a),-np.sin(a),wrist[0]+15*np.cos(a)],[np.sin(a),np.cos(a),wrist[1]+15*np.sin(a)],[0,0,1.]])
        q=dict(actor_id='keeper',arm='right',grip=[0,.5])
        contact=r.ContactState('owner',m,(30.,20.),[q],{},0)
        return r.PropFrame(prop_id,contact)

    def test_fitted_head_can_nod_without_resetting_arm_continuity(self):
        p=r.Puppet(self.character,'front','keeper')
        a=p.pose(placement=[[1,0,300],[0,1,650],[0,0,1]],head_angle_deg=5.,frame_index=0)
        self.valid(self.render(a))
        b=p.pose(placement=a.placement,head_angle_deg=6.,frame_index=1)
        self.assertTrue(np.allclose(a.arms['left'],b.arms['left']))
        with self.assertRaises(r.PuppetError):p.pose(placement=a.placement,head_angle_deg=-6.,frame_index=2)

    def test_actual_pixel_evidence_is_json_serializable(self):
        q=self.valid(self.render());json.dumps(q)

    def test_head_pivot_escape_and_post_pose_excess_rotation_rejected(self):
        with self.assertRaises(r.PuppetError):
            r.Puppet(self.character,'front','keeper').pose(head_pivot=[10000,10000])
        a=self.actor();a.head_angle_deg=90.
        with self.assertRaises(r.PuppetError):self.render(a)

    def test_unverified_expression_rejected(self):
        with self.assertRaises(r.PuppetError):
            r.Puppet(self.character,'front','keeper').pose(head_variant='unknown-expression')

    def neck_package(self, temp):
        package=Path(temp)/'character';shutil.copytree(PACKAGES/'kiosk_keeper',package)
        path=package/'package.json';doc=json.loads(path.read_text())
        doc['binding_version']=2;doc['views']={'front':doc['views']['front']}
        doc['views']['front']['neck_attachment']={
            'mount_polygon':[[-8,-255],[8,-255],[8,-252],[-8,-252]],
            'min_overlap_fraction':.70,'min_overlap_thickness':2.}
        path.write_text(json.dumps(doc));return package,doc

    def write_neck_head(self, package, doc, edit):
        config=doc['views']['front']['sprites']['head'];path=package/config['path']
        pixels=np.asarray(Image.open(path)).copy();yy,xx=np.indices(pixels.shape[:2])
        matrix=np.array(config['image_to_local']);x=xx*matrix[0,0]+yy*matrix[0,1]+matrix[0,2];y=xx*matrix[1,0]+yy*matrix[1,1]+matrix[1,2]
        edit(pixels,x,y);Image.fromarray(pixels,'RGBA').save(path)
        config['sha256']=hashlib.sha256(path.read_bytes()).hexdigest()
        (package/'package.json').write_text(json.dumps(doc))

    def test_version2_requires_actual_neck_mount(self):
        with tempfile.TemporaryDirectory() as temp:
            package,doc=self.neck_package(temp);del doc['views']['front']['neck_attachment']
            (package/'package.json').write_text(json.dumps(doc))
            with self.assertRaisesRegex(r.PuppetError,'requires neck_attachment'):r.load_character(package)

    def test_painted_neck_overlap_has_native_and_output_proof(self):
        with tempfile.TemporaryDirectory() as temp:
            package,_=self.neck_package(temp);character=r.load_character(package)
            for angle in (-9.,0.,8.):
                actor=r.Puppet(character,'front','keeper').pose(placement=self.actor().placement,head_angle_deg=angle)
                row=self.valid(self.render(actor))['neck_records'][0]
                self.assertGreaterEqual(row['overlap_fraction'],.70)
                self.assertGreaterEqual(row['thickness_qualified_span_fraction'],.5)
                self.assertGreater(row['output_overlap_pixels'],0)
                self.assertTrue(row['actual_main_alpha_connected'])

    def test_transparent_head_neck_gap_rejected_with_bounds_and_anchor_unchanged(self):
        with tempfile.TemporaryDirectory() as temp:
            package,doc=self.neck_package(temp)
            self.write_neck_head(package,doc,lambda pixels,x,y:pixels.__setitem__((y>-260,3),0))
            with self.assertRaisesRegex(r.PuppetError,'painted head/body neck attachment'):r.load_character(package)

    def test_stray_paint_dot_cannot_bridge_missing_main_head(self):
        with tempfile.TemporaryDirectory() as temp:
            package,doc=self.neck_package(temp)
            def edit(pixels,x,y):
                pixels[y>-260,3]=0
                pixels[(abs(x)<1)&(abs(y+253.5)<1)]=[20,20,20,255]
            self.write_neck_head(package,doc,edit)
            with self.assertRaisesRegex(r.PuppetError,'painted head/body neck attachment'):r.load_character(package)

    def test_wrong_neck_band_cannot_use_transparent_body_space(self):
        with tempfile.TemporaryDirectory() as temp:
            package,doc=self.neck_package(temp)
            doc['views']['front']['neck_attachment']['mount_polygon']=[[-8,-280],[8,-280],[8,-277],[-8,-277]]
            (package/'package.json').write_text(json.dumps(doc))
            with self.assertRaisesRegex(r.PuppetError,'actual main body paint'):r.load_character(package)

    def test_neck_overlap_area_cannot_substitute_for_continuous_thickness(self):
        with tempfile.TemporaryDirectory() as temp:
            package,doc=self.neck_package(temp)
            doc['views']['front']['neck_attachment']['min_overlap_thickness']=3.
            def edit(pixels,x,y):pixels[(abs(x)<9)&(y>-254.1)&(y<-253.5),3]=0
            self.write_neck_head(package,doc,edit)
            # Keep the main component connected outside the probe, but split
            # its neck contact into thin strips inside the actual mount.
            legacy=copy.deepcopy(doc);legacy['binding_version']=1
            neck=legacy['views']['front'].pop('neck_attachment')
            (package/'package.json').write_text(json.dumps(legacy))
            view=r.load_character(package).views['front']
            view=replace(view,neck_attachment={**neck,'mount_polygon':np.array(neck['mount_polygon'])})
            evidence=r._neck_local_evidence(view,0,None)
            self.assertGreaterEqual(evidence['overlap_fraction'],.70)
            self.assertLess(evidence['thickness_qualified_span_fraction'],.5)
            (package/'package.json').write_text(json.dumps(doc))
            with self.assertRaisesRegex(r.PuppetError,'painted head/body neck attachment'):r.load_character(package)

    def test_head_nod_rechecks_actual_neck_paint(self):
        with tempfile.TemporaryDirectory() as temp:
            package,doc=self.neck_package(temp)
            def edit(pixels,x,y):pixels[(y>-260)&((abs(x)>7)|(y>-248)),3]=0
            self.write_neck_head(package,doc,edit);character=r.load_character(package)
            actor=r.Puppet(character,'front','keeper').pose(placement=self.actor().placement)
            self.valid(self.render(actor))
            actor.head_angle_deg=20.
            with self.assertRaisesRegex(r.PuppetError,'neck attachment disconnected'):self.render(actor)

    def test_selected_action_upper_envelope_is_rechecked_after_pose(self):
        view=self.character.views['front'];arms=dict(view.arms)
        arms['right']=replace(arms['right'],action_envelopes={'reach':{'upper_angle_range_deg':(80.,95.)}})
        view=replace(view,arms=arms);character=replace(self.character,views={'front':view})
        puppet=r.Puppet(character,'front','keeper')
        with self.assertRaisesRegex(r.PuppetError,'selected action upper-angle'):puppet.pose(action='reach')
        actor=puppet.pose(action='rest',placement=self.actor().placement)
        actor.arm_actions['right']={'action':'reach','phase':1.}
        actor.arms['right']=r.forward_kinematics(arms['right'],(75.,65.))
        with self.assertRaisesRegex(r.PuppetError,'selected action upper-angle'):self.render(actor)

    def test_hanging_hand_rule_is_action_specific_not_global_raise_ban(self):
        arm=self.character.views['front'].arms['right']
        arm=replace(arm,action_envelopes={'offer':{'forbid_elbow_above_root_when_wrist_below_root':True}})
        # A deliberate raised reach remains legal in an unconstrained action.
        raised=np.array([[0.,0.],[20.,-10.],[35.,20.]])
        r._validate_action_envelope(arm,raised,'reach')
        with self.assertRaisesRegex(r.PuppetError,'raised-elbow hanging-hand'):r._validate_action_envelope(arm,raised,'offer')
        r._validate_action_envelope(arm,np.array([[0.,0.],[20.,10.],[35.,-20.]]),'offer')

    def arm_covering_prop(self,actor,prop_id='card',front=()):
        wrist=r._point(actor.placement,actor.arms['right'][2])
        matrix=np.array([[1.,0.,wrist[0]],[0.,1.,wrist[1]-10],[0.,0.,1.]])
        contact=r.ContactState('release',matrix,(60.,50.),[],{},0)
        return r.PropFrame(prop_id,contact,None,front)

    def test_explicit_forearm_depth_renders_real_connected_pixels(self):
        actor=self.actor();key='keeper:arm:right:forearm'
        prop=self.arm_covering_prop(actor)
        behind=self.render(actor,props=[prop])
        with self.assertRaisesRegex(r.PuppetError,'forearm/hand alpha disconnected'):self.valid(behind)
        prop.front_limb_parts=(key,)
        front=self.render(actor,props=[prop]);qa=self.valid(front)
        self.assertGreater(np.count_nonzero(front.part_masks[key]),np.count_nonzero(behind.part_masks[key]))
        self.assertTrue(next(row for row in qa['arms'] if row['side']=='right')['wrist_hand_connected'])
        self.assertNotEqual(qa['beauty_sha256'],behind.qa['beauty_sha256'])
        self.assertEqual(qa['props'][0]['front_limb_parts'],[key])

    def test_prop_depth_keeps_foreground_occlusion_and_raw_visibility_gate(self):
        actor=self.actor();key='keeper:arm:right:forearm'
        prop=self.arm_covering_prop(actor,front=(key,))
        cover=Image.new('RGBA',(900,720),(210,160,100,255))
        with self.assertRaisesRegex(r.PuppetError,'not sufficiently readable'):
            self.valid(self.render(actor,props=[prop],foreground=cover,foreground_occlusion_mask=np.asarray(cover)[:,:,3]))

    def test_prop_depth_preserves_later_actor_body_occlusion(self):
        actor=self.actor();key='keeper:arm:right:forearm'
        # An overlapping second body must not be painted through by a lifted
        # forearm; compare its visible alpha with the ordinary no-prop order.
        other=r.Puppet(self.character,'front','other').pose(placement=[[1,0,370],[0,1,750],[0,0,1]])
        original=r.render_scene((900,720),[actor,other])
        prop=self.arm_covering_prop(actor,front=(key,))
        lifted=r.render_scene((900,720),[actor,other],props=[prop])
        self.assertTrue(np.all(lifted.part_masks[key]<=original.part_masks[key]))
        row=next(row for row in lifted.qa['arms'] if row['limb_id']=='keeper:arm:right')
        self.assertLess(row['visible_fraction']['forearm'],1.)

    def test_prop_depth_group_is_explicit_contiguous_and_validated(self):
        actor=self.actor();key='keeper:arm:right:forearm'
        for names in [('missing:arm:right:forearm',),(key,key),('keeper:arm:right:hand',)]:
            with self.subTest(names=names),self.assertRaises(r.PuppetError):
                self.render(actor,props=[self.arm_covering_prop(actor,front=names)])
        props=[self.arm_covering_prop(actor,'first',(key,)),self.arm_covering_prop(actor,'middle'),self.arm_covering_prop(actor,'last',(key,))]
        with self.assertRaisesRegex(r.PuppetError,'contiguous prop depth group'):self.render(actor,props=props)
        props[1].front_limb_parts=(key,)
        self.valid(self.render(actor,props=props))

    def test_world_planted_stance_records_actual_length(self):
        a=self.actor();target=r._point(a.placement,a.view.legs['left']['ankle'])+[2,0]
        a=r.Puppet(self.character,'front','keeper').pose(placement=a.placement,ankle_targets={'left':target})
        q=self.valid(self.render(a));leg=next(x for x in q['legs'] if x['side']=='left')
        self.assertEqual(leg['planted_space'],'screen_target');self.assertIsNone(leg['fixed_length'])
        self.assertAlmostEqual(leg['actual_length'],np.linalg.norm(r._point(np.linalg.inv(a.placement),target)-a.view.legs['left']['hip']))

    def test_planted_ankle_envelope_and_post_pose_tamper_rejected(self):
        with self.assertRaises(r.PuppetError):
            r.Puppet(self.character,'front','keeper').pose(ankle_targets={'left':[10000,10000]})
        a=self.actor();a.ankle_targets={'left':[10000,10000]}
        with self.assertRaises(r.PuppetError):self.render(a)

    def test_two_props_can_share_one_coincident_physical_grip(self):
        a=self.actor();q=self.valid(self.render(a,props=[self.prop_at_hand(a,'half-a',angle=-8),self.prop_at_hand(a,'half-b',angle=8)]))
        self.assertEqual({p['prop_id'] for p in q['props']},{'half-a','half-b'})
        self.assertEqual(len(q['contact_records']),2)
        self.assertLess(max(q['contact_errors']),1e-8)

    def test_conflicting_two_prop_grips_and_duplicate_ids_rejected(self):
        a=self.actor()
        with self.assertRaises(r.PuppetError):self.render(a,props=[self.prop_at_hand(a,'a'),self.prop_at_hand(a,'b',dx=6)])
        with self.assertRaises(r.PuppetError):self.render(a,props=[self.prop_at_hand(a,'a'),self.prop_at_hand(a,'a')])

    def test_render_rechecks_direct_contactstate_holder_and_geometry(self):
        a=self.actor();p=self.prop_at_hand(a);p.contact.holders[0]['grip']=[2.,.5]
        with self.assertRaises(r.PuppetError):self.render(a,props=[p])
        p=self.prop_at_hand(a);p.contact.paper_matrix[0,0]=2.
        with self.assertRaises(r.PuppetError):self.render(a,props=[p])

    def test_contact_projection_recomputes_targets_and_rejects_stretch(self):
        a=self.actor();p=self.prop_at_hand(a)
        transformed=r.transform_contact(p.contact,[[2,0,3],[0,2,4],[0,0,1]])
        expected=r._point(np.array([[2,0,3],[0,2,4],[0,0,1]]),r._point(p.contact.paper_matrix,[-15.,0.]))
        self.assertTrue(np.allclose(transformed.targets['keeper']['right'],expected))
        with self.assertRaises(r.PuppetError):r.transform_contact(p.contact,[[2,0,3],[0,1,4],[0,0,1]])

    def test_just_offscreen_socket_cannot_demand_invisible_cuff_contact(self):
        socket=self.character.views['front'].arms['left'].socket
        a=r.Puppet(self.character,'front','keeper').pose(placement=[[1,0,902-socket[0]],[0,1,650],[0,0,1]])
        q=self.valid(self.render(a));left=next(x for x in q['arms'] if x['side']=='left')
        self.assertGreater(left['screen_nodes'][0][0],900)
        self.assertFalse(left['root_in_frame']);self.assertFalse(left['elbow_in_frame'])
        self.assertGreater(left['visible_fraction']['forearm'],.35)
        self.assertFalse(left['root_cuff_contact'])

    def test_leg_and_arm_viewport_clipping_is_explicit_and_not_occlusion(self):
        a=r.Puppet(self.character,'front','keeper').pose(placement=[[1,0,-1000],[0,1,650],[0,0,1]])
        q=self.valid(self.render(a))
        self.assertTrue(all(x['viewport_clipped'] for x in q['legs']))
        self.assertTrue(all(all(x['viewport_clipped_parts'].values()) for x in q['arms']))
        cover=Image.new('RGBA',(900,720),(210,160,100,255))
        with self.assertRaises(r.PuppetError):self.valid(self.render(self.actor(),foreground=cover,foreground_occlusion_mask=np.asarray(cover)[:,:,3]))

    def continuous_actor(self,sag=12.):
        view=self.character.views['front']
        view=replace(view,arms={side:replace(arm,ink_path={'mode':'continuous','sag':sag}) for side,arm in view.arms.items()})
        character=replace(self.character,views={'front':view})
        return r.Puppet(character,'front','keeper').pose(placement=self.actor().placement)

    def test_continuous_style_loads_only_bounded_explicit_configuration(self):
        with tempfile.TemporaryDirectory() as temp:
            package=Path(temp)/'character';shutil.copytree(PACKAGES/'kiosk_keeper',package)
            path=package/'package.json';doc=json.loads(path.read_text());arm=doc['views']['front']['arms']['right']
            arm['ink_path']={'mode':'continuous','sag':12.};path.write_text(json.dumps(doc))
            loaded=r.load_character(package).views['front'].arms['right']
            self.assertEqual(loaded.ink_path['sag'],12.)
            with self.assertRaises(TypeError):loaded.ink_path['sag']=20.
            for config in ({'mode':'continuous','sag':-1},{'mode':'continuous','sag':float('nan')},{'mode':'continuous','sag':33},{'mode':'continuous','sag':True},{'mode':'unknown','sag':12},{'mode':'continuous','sag':12,'exempt_visibility':True}):
                with self.subTest(config=config):
                    arm['ink_path']=config;path.write_text(json.dumps(doc))
                    with self.assertRaisesRegex(r.PuppetError,'ink_path|ink sag'):r.load_character(package)

    def test_one_continuous_brush_has_exact_disjoint_semantic_halves(self):
        actor=self.continuous_actor();arm=actor.view.arms['right']
        path,control,length=r._continuous_ink_geometry(arm,actor.arms['right'])
        full,upper,forearm=r._continuous_masks((900,720),path+[300,650],arm.ink_width,'keeper:arm:right')
        self.assertFalse(np.any((upper>0)&(forearm>0)))
        np.testing.assert_array_equal(full,np.maximum(upper,forearm))
        self.assertTrue(np.any(r._dilate(upper,1)&(forearm>32)))
        qa=self.valid(self.render(actor));row=next(row for row in qa['arms'] if row['side']=='right')
        self.assertEqual(row['ink_mode'],'continuous');self.assertEqual(row['nodes_role'],'internal_fixed_reach_controls')
        self.assertIsNone(row['fixed_lengths']);self.assertIsNone(row['actual_planar_lengths']);self.assertIsNone(row['elbow_connected'])
        self.assertTrue(row['ink_halves_connected']);self.assertAlmostEqual(row['ink_arclength_local'],length)
        np.testing.assert_allclose(row['ink_path_screen'][0],row['screen_nodes'][0]);np.testing.assert_allclose(row['ink_path_screen'][-1],row['screen_nodes'][-1])
        self.assertGreater(np.linalg.norm(np.asarray(row['ink_join_screen'])-row['screen_nodes'][1]),5.)
        self.assertNotEqual(qa['beauty_sha256'],self.render().qa['beauty_sha256'])

    def test_zero_sag_is_a_real_single_straight_stroke(self):
        actor=self.continuous_actor(0.);spec=actor.view.arms['right']
        path,_,length=r._continuous_ink_geometry(spec,actor.arms['right'])
        delta=path[-1]-path[0]
        self.assertAlmostEqual(length,np.linalg.norm(delta))
        self.assertLess(np.abs((path[:,0]-path[0,0])*delta[1]-(path[:,1]-path[0,1])*delta[0]).max(),1e-8)
        self.valid(self.render(actor))

    def test_continuous_fold_excess_arclength_and_wrong_cuff_exit_rejected(self):
        arm=self.continuous_actor().view.arms['right']
        with self.assertRaisesRegex(r.PuppetError,'folds back'):
            r._continuous_ink_geometry(arm,np.array([[0.,0.],[20.,20.],[0.,30.]]))
        arm=replace(arm,ink_path={'mode':'continuous','sag':31.},exit_normal=np.array([1.,0.]))
        with self.assertRaisesRegex(r.PuppetError,'arclength'):
            r._continuous_ink_geometry(arm,np.array([[0.,0.],[64.,0.],[126.,0.]]))
        arm=replace(arm,ink_path={'mode':'continuous','sag':0.})
        with self.assertRaisesRegex(r.PuppetError,'actual cuff'):
            r._continuous_ink_geometry(arm,np.array([[0.,0.],[-64.,0.],[-100.,0.]]))

    def test_continuous_forearm_depth_changes_real_pixels_without_waiving_qa(self):
        actor=self.continuous_actor();key='keeper:arm:right:forearm'
        prop=self.arm_covering_prop(actor)
        behind=self.render(actor,props=[prop])
        with self.assertRaisesRegex(r.PuppetError,'forearm/hand alpha disconnected'):self.valid(behind)
        prop.front_limb_parts=(key,);front=self.render(actor,props=[prop]);self.valid(front)
        self.assertGreater(np.count_nonzero(front.part_masks[key]),np.count_nonzero(behind.part_masks[key]))
        self.assertNotEqual(front.qa['beauty_sha256'],behind.qa['beauty_sha256'])
        cover=Image.new('RGBA',(900,720),(210,160,100,255))
        with self.assertRaisesRegex(r.PuppetError,'not sufficiently readable'):
            self.valid(self.render(actor,props=[prop],foreground=cover,foreground_occlusion_mask=np.asarray(cover)[:,:,3]))

    def test_continuous_style_does_not_waive_internal_reach_or_output_hash(self):
        actor=self.continuous_actor();actor.arms['right'][2]+=[35.,0.]
        with self.assertRaisesRegex(r.PuppetError,'fixed planar bone'):self.render(actor)
        result=self.render(self.continuous_actor());result.part_masks['keeper:arm:right:forearm'][:]=0
        with self.assertRaises(r.PuppetError):self.valid(result)


if __name__ == '__main__': unittest.main()
