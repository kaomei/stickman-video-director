"""Geometric invariants that a flat, whole-frame zoom cannot satisfy."""
from pathlib import Path
import importlib.util
import math
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('b6_space',ROOT/'scripts/b6_space.py')
space=importlib.util.module_from_spec(spec);sys.modules[spec.name]=space;spec.loader.exec_module(space)


class Space(unittest.TestCase):
    def test_nearer_anchor_moves_faster_during_lateral_camera_travel(self):
        a=space.Camera(x=0);b=space.camera_move(a,1,0,1,x=100)
        travel=lambda depth: abs(b.project((200,0,depth))[0]-a.project((200,0,depth))[0])
        self.assertAlmostEqual(travel(500)/travel(1500),3)

    def test_wall_and_ground_rays_round_trip_to_the_same_world_location(self):
        camera=space.Camera(x=72,z=40)
        for world,axis in [((220,-180,1800),2),((-140,0,630),1)]:
            screen=camera.project(world)[:2]
            recovered=camera.ray_plane(screen,axis,world[axis])
            for actual,expected in zip(recovered,world):self.assertAlmostEqual(actual,expected)

    def test_visible_surface_uses_ground_before_wall_below_their_join(self):
        camera=space.Camera()
        self.assertEqual(camera.wall_ground(camera.project((0,0,600))[:2],1900)['surface'],'ground')
        self.assertEqual(camera.wall_ground(camera.project((0,-400,1900))[:2],1900)['surface'],'wall')

    def test_actor_transform_has_uniform_scale_and_orthogonal_axes(self):
        camera=space.Camera(z=100)
        matrix=camera.billboard_matrix((40,0,900),units_per_pixel=.7,angle=27)
        x=(matrix[0][0],matrix[1][0]);y=(matrix[0][1],matrix[1][1])
        self.assertAlmostEqual(math.hypot(*x),math.hypot(*y))
        self.assertAlmostEqual(sum(a*b for a,b in zip(x,y)),0)
        self.assertEqual((matrix[0][2],matrix[1][2]),camera.project((40,0,900))[:2])

    def test_depth_sort_draws_near_occluder_after_actor(self):
        rows=[('pole',(0,0,400)),('window',(0,-100,1800)),('actor',(0,0,900))]
        self.assertEqual([row[0] for row in space.depth_order(space.Camera(),rows)],['window','actor','pole'])

    def test_camera_starts_and_lands_without_moving_world_anchors(self):
        camera=space.Camera();anchor=(120,0,900)
        before=space.camera_move(camera,-1,0,1,x=200)
        after=space.camera_move(camera,2,0,1,x=200)
        self.assertEqual(before,camera);self.assertEqual(after.x,200)
        epsilon=.00001
        self.assertLess(space.camera_move(camera,epsilon,0,1,x=200).x/epsilon,.01)
        sample=space.trace_sample(2,after,{'actor':anchor})
        self.assertEqual(sample['anchors']['actor']['world'],list(anchor))
        self.assertNotEqual(sample['anchors']['actor']['screen'],list(camera.project(anchor)[:2]))

    def test_behind_camera_and_invalid_motion_are_rejected(self):
        with self.assertRaises(ValueError):space.Camera().project((0,0,0))
        with self.assertRaises(ValueError):space.Camera(focal=-1)
        with self.assertRaises(ValueError):space.smooth(1,1,1)


if __name__=='__main__':unittest.main()
