"""Production timing invariants, using the real fixed-reach runtime and art fits."""
from pathlib import Path
import importlib.util
import math
import sys
import unittest

import numpy as np

ROOT = Path(__file__).resolve().parents[1]


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, ROOT/'scripts'/filename)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


a = load('b6_actions_test_module', 'b6_actions.py')
r = load('b6_actions_test_puppet', 'b6_puppet.py')
s = load('b6_actions_test_space', 'b6_space.py')


class Actions(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.character = r.load_character(ROOT/'assets/b6/characters/kiosk_keeper')

    def arm(self):
        return self.character.views['three_quarter'].arms['right']

    def nodes(self, track, t):
        pose = track.sample(t)
        return r.forward_kinematics(track.arm,
            r.PoseLibrary.sample(track.arm, pose['action'], pose['phase']))

    def test_offering_preserves_fixed_lengths_through_all_phases(self):
        arm = self.arm()
        track = a.offer_track(r, arm, start=0)
        for t in np.linspace(-.1, 1.3, 160):
            nodes = self.nodes(track, float(t))
            np.testing.assert_allclose(np.linalg.norm(np.diff(nodes, axis=0), axis=1), arm.lengths, atol=1e-8)

    def test_offer_and_receive_land_continuously_without_teleport(self):
        for make in [a.offer_track, a.receive_track]:
            track = make(r, self.arm(), start=.1)
            for segment in track.segments[:-1]:
                np.testing.assert_allclose(self.nodes(track, segment.end-1e-8),
                                           self.nodes(track, segment.end+1e-8), atol=1e-5)
            np.testing.assert_allclose(self.nodes(track, -10), self.nodes(track, 100), atol=1e-8)

    def test_per_arm_override_does_not_move_the_other_arm(self):
        actor = r.Puppet(self.character, 'three_quarter', 'giver')
        track = a.offer_track(r, self.arm(), start=0)
        baseline = actor.pose(frame_index=0)
        for i in range(1, 39):
            frame = actor.pose(frame_index=i, arm_actions={'right': track.sample(i/30)})
            np.testing.assert_array_equal(frame.arms['left'], baseline.arms['left'])

    def test_discontinuous_receive_to_offer_retract_is_rejected(self):
        arm = self.arm()
        # This real package has distinct receive and offer poses.
        self.assertFalse(np.allclose(arm.poses['receive'], arm.poses['offer']))
        with self.assertRaisesRegex(ValueError, 'jump'):
            a.ArmTrack(r, arm, [a.ArmSegment('receive', 0, 1, 1, 1),
                               a.ArmSegment('retract', 1, 2)])

    def test_invalid_timing_and_unrecognized_actions_fail_early(self):
        for construct in [lambda: a.offer_track(r, self.arm(), start=0, reach=0),
                          lambda: a.receive_track(r, self.arm(), start=0, withdraw=-1),
                          lambda: a.ArmTrack(r, self.arm(), [a.ArmSegment('walk', 0, 1)]),
                          lambda: a.ArmTrack(r, self.arm(), [a.ArmSegment('rest', 0, 1),
                                                           a.ArmSegment('rest', 2, 3)])]:
            with self.assertRaises(ValueError): construct()
        with self.assertRaises(ValueError): a.ArmSegment('reach', 0, 1, -1, 1)
        with self.assertRaises(ValueError): a.offer_track(r, self.arm(), start=float('nan'))

    def test_runtime_still_rejects_unreachable_contact(self):
        track = a.offer_track(r, self.arm(), start=0)
        with self.assertRaises(r.PuppetError):
            r.Puppet(self.character, 'three_quarter', 'giver').pose(
                arm_actions={'right': track.sample(.5)}, wrist_targets={'right': [10000, 10000]})

    def handoff(self):
        return a.handoff_timeline(r, start=0, shared_start=1, shared_end=1.3, end=2,
            giver={'actor_id': 'giver', 'arm': 'right', 'grip': [0, .5]},
            recipient={'actor_id': 'receiver', 'arm': 'left', 'grip': [1, .5]},
            paper_size=(80, 40), initial_pose=[100, 200, 0],
            shared_pose=[120, 200, 10], final_pose=[150, 210, 15])

    def test_single_prop_changes_owner_through_readable_shared_interval(self):
        timeline = self.handoff()
        for t, ids in [(.2, {'giver'}), (1.1, {'giver', 'receiver'}), (1.8, {'receiver'})]:
            contact = timeline.sample(t)
            self.assertEqual(set(contact.targets), ids)
            for holder in contact.holders:
                uv = np.array(holder['grip'])
                target = contact.paper_matrix @ np.r_[(uv-.5)*contact.paper_size, 1]
                np.testing.assert_allclose(contact.targets[holder['actor_id']][holder['arm']], target[:2])
        for boundary in [1, 1.3]:
            np.testing.assert_allclose(timeline.sample(boundary-1e-8).paper_matrix,
                                       timeline.sample(boundary+1e-8).paper_matrix, atol=1e-5)

    def test_handoff_retains_one_projected_contact_plane(self):
        contact = self.handoff().sample(1.1)
        matrix = np.array(s.Camera().billboard_matrix((0, 0, 900), .8))
        projected = r.transform_contact(contact, matrix)
        for actor, hands in contact.targets.items():
            for side, target in hands.items():
                np.testing.assert_allclose(projected.targets[actor][side],
                    (matrix @ np.r_[target, 1])[:2])

    def test_handoff_rejects_zero_shared_duration_and_bad_grips(self):
        kwargs = dict(start=0, shared_start=1, shared_end=1, end=2,
            giver={'actor_id': 'a', 'arm': 'right', 'grip': [0, .5]},
            recipient={'actor_id': 'b', 'arm': 'left', 'grip': [1, .5]},
            paper_size=(80, 40), initial_pose=[0, 0, 0], shared_pose=[0, 0, 0], final_pose=[0, 0, 0])
        with self.assertRaises(ValueError): a.handoff_timeline(r, **kwargs)
        kwargs['shared_end'] = 1.3
        kwargs['recipient']['grip'] = [1.5, .5]
        with self.assertRaises(r.PuppetError): a.handoff_timeline(r, **kwargs)

    def test_single_reaction_has_no_oscillating_body_and_settles_to_zero(self):
        self.assertEqual(a.reaction_nod(-1, start=0), 0)
        self.assertEqual(a.reaction_nod(.1, start=0), 3)
        self.assertEqual(a.reaction_nod(10, start=0), 0)
        samples = [a.reaction_nod(i/300, start=0) for i in range(100)]
        self.assertTrue(all(0 <= angle <= 3 for angle in samples))
        self.assertLess(max(abs(x-y) for x, y in zip(samples, samples[1:])), .2)
        with self.assertRaises(ValueError): a.reaction_nod(0, start=0, angle=21)


class CameraActions(unittest.TestCase):
    def test_landing_places_explicit_world_subject_at_authored_screen_anchor(self):
        base = s.Camera(width=720, height=1280, focal=1400, y=-400, principal_y=250)
        world = (220, -250, 1400)
        final = a.camera_landing(base, world, (340, 510), z=210, focal=1800)
        np.testing.assert_allclose(final.project(world)[:2], [340, 510], atol=1e-7)
        self.assertEqual(base.z, 0)

    def test_lateral_travel_moves_near_layers_more_than_far_layers(self):
        base = s.Camera()
        move = a.CameraTravel(s, base, start=0, end=.4, destination={'x': 200},
                              purpose='Reveal the offered parcel behind the foreground post')
        final = move.sample(2)
        travel = lambda depth: abs(final.project((0, 0, depth))[0]-base.project((0, 0, depth))[0])
        self.assertAlmostEqual(travel(500)/travel(1500), 3)
        self.assertEqual(move.sample(-1), base)
        self.assertEqual(move.sample(.4), move.sample(10))
        self.assertEqual(move.trace(1, {'subject': (0, 0, 900)})['purpose'], move.purpose)

    def test_push_keeps_billboards_uniformly_scaled(self):
        move = a.CameraTravel(s, s.Camera(), start=0, end=.4, destination={'z': 100},
                              purpose='Land on the receiver reaction')
        for t in np.linspace(0, 1, 30):
            matrix = np.array(move.sample(float(t)).billboard_matrix((0, 0, 900)))
            self.assertAlmostEqual(np.linalg.norm(matrix[:2, 0]), np.linalg.norm(matrix[:2, 1]))
            self.assertAlmostEqual(float(matrix[:2, 0] @ matrix[:2, 1]), 0)

    def test_invalid_camera_or_empty_purpose_fails_before_render(self):
        with self.assertRaises(ValueError):
            a.CameraTravel(s, s.Camera(), start=0, end=1, destination={'focal': -1}, purpose='Reveal')
        with self.assertRaises(ValueError):
            a.CameraTravel(s, s.Camera(), start=0, end=1, destination={'x': 10}, purpose='')
        with self.assertRaises(ValueError): a.camera_landing(s.Camera(), (0, 0, 100), (20, 20), z=101)


if __name__ == '__main__':
    unittest.main()
