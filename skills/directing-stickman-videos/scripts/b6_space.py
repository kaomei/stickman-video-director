#!/usr/bin/env python3
"""Small 2.5D B6 space primitives, independent of any story or source film.

Coordinates are x right, y down, z away. A standing foot may be (x, 0, z),
with the head at negative y. Wall/floor art may use perspective quads; a painted
character uses billboard_matrix so depth never flattens its head or limbs.

Run ``python3 b6_space.py demo OUTPUT`` for a geometric space diagnostic (not
finished B6 art). Core projection has no dependencies; the demo uses Pillow.
"""
from dataclasses import asdict, dataclass, replace
from pathlib import Path
import argparse
import json
import math
import shutil
import subprocess


def _finite(*values):
    if not all(math.isfinite(v) for v in values):
        raise ValueError('Finite coordinates required')


def smooth(a, b, t):
    """Zero-velocity departure/arrival, with a genuine hold outside the span."""
    if not b > a:
        raise ValueError('Motion end must follow start')
    u = min(1., max(0., (t-a)/(b-a)))
    return u*u*(3-2*u)


@dataclass(frozen=True)
class Camera:
    width: int = 960
    height: int = 540
    focal: float = 640.
    x: float = 0.
    y: float = -210.
    z: float = 0.
    principal_y: float = 215.
    near: float = 1.

    def __post_init__(self):
        _finite(self.width, self.height, self.focal, self.x, self.y, self.z,
                self.principal_y, self.near)
        if min(self.width, self.height, self.focal, self.near) <= 0:
            raise ValueError('Positive viewport, focal length and near plane required')

    def project(self, world):
        """Return screen x/y and camera depth; reject behind-camera points."""
        x, y, z = world
        _finite(x, y, z)
        depth = z-self.z
        if depth < self.near:
            raise ValueError('Point intersects or lies behind near plane')
        scale = self.focal/depth
        return (self.width/2+(x-self.x)*scale,
                self.principal_y+(y-self.y)*scale, depth)

    def ray_plane(self, screen, axis, value):
        """Invert a screen ray on ground axis=1 or wall axis=2.

        None means parallel/behind-camera. No reflected or edge-repeated art is
        invented at the horizon; the caller must supply an authored sky/wall.
        """
        if axis not in (0, 1, 2):
            raise ValueError('Plane axis must be 0, 1 or 2')
        sx, sy = screen
        _finite(sx, sy, value)
        origin = (self.x, self.y, self.z)
        direction = ((sx-self.width/2)/self.focal,
                     (sy-self.principal_y)/self.focal, 1.)
        if abs(direction[axis]) < 1e-12:
            return None
        distance = (value-origin[axis])/direction[axis]
        if distance < self.near:
            return None
        return tuple(o+distance*d for o, d in zip(origin, direction))

    def wall_ground(self, screen, wall_z, ground_y=0.):
        """Nearest wall/ground ray intersection for panorama texture sampling."""
        wall = self.ray_plane(screen, 2, wall_z)
        ground = self.ray_plane(screen, 1, ground_y)
        candidates = [('wall', wall), ('ground', ground)]
        candidates = [(name, p) for name, p in candidates if p is not None]
        if not candidates:
            return None
        name, point = min(candidates, key=lambda item: item[1][2]-self.z)
        return {'surface': name, 'world': point}

    def billboard_matrix(self, foot, units_per_pixel=1., angle=0.):
        """Uniform 3x3 sprite transform anchored at its calibrated local foot.

        Multiply local coordinates relative to that foot by this matrix. The
        same matrix must also project all limb/prop-contact coordinates for the
        actor. Do not separately stretch the sprite to a perspective quadrilateral.
        """
        _finite(units_per_pixel, angle)
        if units_per_pixel <= 0:
            raise ValueError('Positive painted-pixel scale required')
        x, y, depth = self.project(foot)
        k = self.focal/depth*units_per_pixel
        r = math.radians(angle)
        a, b = k*math.cos(r), k*math.sin(r)
        return ((a, -b, x), (b, a, y), (0., 0., 1.))


def camera_move(camera, t, start, end, **destination):
    """Interpolate explicit camera coordinates; actor coordinates stay separate."""
    allowed = {'x', 'y', 'z', 'focal', 'principal_y'}
    if not set(destination) <= allowed:
        raise ValueError('Unknown camera coordinate')
    k = smooth(start, end, t)
    return replace(camera, **{name: getattr(camera, name)*(1-k)+value*k
                             for name, value in destination.items()})


def depth_order(camera, objects):
    """Painter order of (identity, world anchor), far first, stable at ties.

    Split an occluding table/door into proper planes. Root depth alone cannot
    resolve intersecting objects or a hand crossing a table edge.
    """
    return sorted(objects, key=lambda item: camera.project(item[1])[2], reverse=True)


def trace_sample(t, camera, anchors):
    """JSON-safe observed projections for a review trace, not a quality score."""
    return {'time': t, 'camera': asdict(camera), 'anchors': {
        name: {'world': list(world), 'screen': list(camera.project(world)[:2]),
               'depth': camera.project(world)[2]}
        for name, world in anchors.items()}}


def _demo_frame(camera, t):
    from PIL import Image, ImageDraw
    im = Image.new('RGB', (camera.width, camera.height), '#eee0c9')
    draw = ImageDraw.Draw(im)
    def polygon(points, fill, outline='#67574b'):
        draw.polygon([camera.project(p)[:2] for p in points], fill=fill,
                     outline=outline, width=2)
    # One continuous wide wall and a separately projected ground plane.
    polygon([(-2500,-1100,1900),(2500,-1100,1900),(2500,0,1900),(-2500,0,1900)], '#ceb49a')
    polygon([(-2500,0,1900),(2500,0,1900),(2500,0,310),(-2500,0,310)], '#dcc6a8')
    for x in range(-2400, 2401, 240):
        points = [camera.project(p)[:2] for p in [(x,0,320),(x,0,1900)]]
        draw.line(points, fill='#b0967d', width=1)
    for z in range(350, 1901, 120):
        draw.line([camera.project(p)[:2] for p in [(-2500,0,z),(2500,0,z)]], fill='#b0967d', width=1)
    for x in range(-1800, 1801, 300):
        polygon([(x,-440,1900),(x+160,-440,1900),(x+160,-160,1900),(x,-160,1900)], '#8ca4a1')
    # The actor moves independently; the near pole crosses at its own depth.
    actor_x = -70+110*smooth(.8,2.8,t)
    anchors = {'far-window': (300,-250,1900),
               'actor-foot': (actor_x,0,900), 'near-pole': (-50,0,460)}
    for name, foot in depth_order(camera, [('actor',anchors['actor-foot']),('pole',anchors['near-pole'])]):
        if name == 'pole':
            x,y,z=foot
            polygon([(x-14,-650,z),(x+14,-650,z),(x+14,y,z),(x-14,y,z)], '#665d4e')
        else:
            x,y,depth=camera.project(foot);k=camera.focal/depth
            # The body/head retain their proportions at all camera depths.
            draw.line([(x-13*k,y-100*k),(x-25*k,y)],fill='#574744',width=max(1,round(3*k)))
            draw.line([(x+13*k,y-100*k),(x+27*k,y)],fill='#574744',width=max(1,round(3*k)))
            draw.polygon([(x-32*k,y-185*k),(x+32*k,y-185*k),(x+24*k,y-95*k),(x-24*k,y-95*k)],fill='#aa6651',outline='#574744')
            draw.ellipse((x-46*k,y-277*k,x+46*k,y-185*k),fill='#fff6e9',outline='#574744',width=max(1,round(3*k)))
    draw.text((18,16), 'SPACE DIAGNOSTIC - geometry only, not finished B6 art', fill='#302a24')
    draw.text((18,36), f'{t:.2f}s  camera x={camera.x:.1f} z={camera.z:.1f}', fill='#302a24')
    return im, anchors


def demo(output):
    out = Path(output).resolve()
    if out.exists():
        raise ValueError('Choose a new output directory')
    out.mkdir(parents=True)
    from PIL import Image, ImageDraw
    base = Camera(x=-290.)
    trace=[];frames=[];tiles=[]
    for index in range(120):
        t=index/30
        camera=camera_move(base,t,.3,3.4,x=270.,z=100.)
        im,anchors=_demo_frame(camera,t)
        trace.append(trace_sample(t,camera,anchors));frames.append(im)
        if index in (0,23,47,71,95,119):
            thumb=im.resize((480,270));tiles.append((t,thumb))
    board=Image.new('RGB',(1440,600),'#f3eadc');draw=ImageDraw.Draw(board)
    for i,(t,im) in enumerate(tiles):
        x=i%3*480;y=i//3*300;board.paste(im,(x,y+25));draw.text((x+8,y+7),f'{t:.2f}s',fill='#302a24')
    board.save(out/'contact-sheet.jpg',quality=94)
    frames[0].save(out/'space.gif',save_all=True,append_images=frames[1::2],duration=67,loop=0)
    (out/'motion-trace.json').write_text(json.dumps({'diagnostic_only':True,'fps':30,'samples':trace},indent=2)+'\n')
    if shutil.which('ffmpeg'):
        command=['ffmpeg','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','960x540','-r','30','-i','-',
                 '-an','-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'space.mp4')]
        process=subprocess.Popen(command,stdin=subprocess.PIPE)
        try:
            for frame in frames:process.stdin.write(frame.tobytes())
            process.stdin.close()
            if process.wait():raise RuntimeError('Demo encoder failed')
        finally:
            if process.poll() is None:process.kill();process.wait()
    return {'output':str(out),'diagnostic_only':True,'frames':len(frames),'spatial_reference_trace':'motion-trace.json'}


if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=['demo']);parser.add_argument('output')
    args=parser.parse_args();print(json.dumps(demo(args.output),indent=2))
