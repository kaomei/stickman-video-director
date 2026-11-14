#!/usr/bin/env python3
"""Cheap package diagnostics before authoring/encoding a B6 scene.

This calls the unchanged painted-puppet validator. It does not certify motion,
prop contacts, scene occlusion, drawing style or final encoded picture quality.
"""
from pathlib import Path
import argparse
import importlib.util
import json
import time

import numpy as np


def _local(base, relative):
    path = (base / relative).resolve()
    if not path.is_relative_to(base):
        raise ValueError('Project path escapes its directory: ' + str(relative))
    return path


def _read(path):
    return json.loads(Path(path).read_text())


def _bounds(view, actor):
    points = []
    for asset in (view.body, view.head):
        h, w = asset.image.shape[:2]
        corners = np.array([[0, 0, 1], [w, 0, 1], [0, h, 1], [w, h, 1]])
        points.extend((corners @ asset.image_to_local.T)[:, :2])
    for nodes in actor.arms.values():
        points.extend(nodes)
    for leg in view.legs.values():
        points.extend([leg['hip'], leg['ankle']])
    points = np.asarray(points)
    margin = max([24.] + [a.hand_radius * 2 for a in view.arms.values()])
    lo = np.floor(points.min(axis=0) - margin)
    hi = np.ceil(points.max(axis=0) + margin)
    return lo, hi


def _view_evidence(runtime, character, view_id, actor_id):
    view = character.views[view_id]
    rest = runtime.Puppet(character, view_id, actor_id).pose()
    lo, hi = _bounds(view, rest)
    size = tuple(int(v) for v in hi - lo)
    if max(size) > 4096:
        raise ValueError('Local package canvas exceeds 4096px; check image_to_local fitting')
    placement = [[1, 0, -float(lo[0])], [0, 1, -float(lo[1])], [0, 0, 1]]
    actor = runtime.Puppet(character, view_id, actor_id).pose(placement=placement)
    rendered = runtime.render_scene(size, [actor], frame_index=0)
    qa = runtime.validate_render_result(rendered, expected_actor_ids={actor_id})
    # These endpoint/transition probes use the same fixed bones, cuff exit,
    # pole and action-envelope rules as the real renderer, with no relaxed limits.
    pose_probes = 0
    for action in runtime.ACTIONS:
        puppet = runtime.Puppet(character, view_id, actor_id)
        for phase in (0., .25, .5, .75, 1.):
            puppet.pose(action=action, phase=phase, placement=placement)
            pose_probes += 1
    head_corners = np.array([[0, 0, 1], [view.head.image.shape[1], 0, 1]])
    head_width = float(np.linalg.norm(np.diff((head_corners @ view.head.image_to_local.T)[:, :2], axis=0)))
    return {
        'view': view_id,
        'technical_pass': True,
        'pose_probes': pose_probes,
        'baseline_alpha_render': {
            'size': list(size), 'arm_records': len(qa['arm_records']),
            'leg_records': len(qa['leg_records']),
            'neck_records': len(qa.get('neck_records', [])),
            'beauty_sha256': qa['beauty_sha256'],
        },
        'head_width_local': head_width,
        'relative_arm_ink_width': {side: arm.ink_width / head_width for side, arm in view.arms.items()},
        'relative_leg_ink_width': {side: leg['ink_width'] / head_width for side, leg in view.legs.items()},
        'arm_ink_modes': {side: 'continuous' if arm.ink_path else 'jointed' for side, arm in view.arms.items()},
        'expression_variants': sorted(view.heads),
        'neck_attachment_declared': view.neck_attachment is not None,
    }


def preflight_project(base, runtime_module, project=None, required_views=None):
    """Return cheap diagnostics without rendering the story or changing its files.

    ``runtime_module`` must be the caller's verified B6 puppet module, preserving
    module/class identity. ``required_views`` optionally maps actor IDs to the
    views needed by the planned shots; it never invents a missing turn view.
    """
    started = time.perf_counter()
    base = Path(base).resolve()
    report = {
        'schema': 'b6-character-preflight/1', 'technical_pass': False,
        'errors': [], 'warnings': [], 'actors': [],
        'scope': 'package import, registered views, local rest alpha and approved pose probes',
        'scene_and_final_review_required': True,
        'not_certified': ['aesthetic reference match', 'new target IK/prop contact',
                          'scene occlusion and camera coverage', 'continuous performance',
                          'final encoded audio/video'],
    }
    try:
        project = project if project is not None else _read(base / 'project.json')
        system = project.get('character_system', {})
        if system.get('mode') == 'locked-v90-performance':
            raise ValueError('Character import preflight applies to painted-puppet projects, not unchanged example reproduction')
        registry = _read(_local(base, system.get('registry', 'characters.json')))
        if registry.get('schema') != 'b6-character-registry/1':
            raise ValueError('Per-view b6-character-registry/1 required')
        actors = registry.get('actors', [])
        if not actors:
            raise ValueError('No painted actors registered')
        ids = [a.get('id') for a in actors]
        if any(not isinstance(i, str) or not i for i in ids) or len(ids) != len(set(ids)):
            raise ValueError('Registry needs unique nonempty actor IDs')
        required_views = required_views or {}
        for missing in sorted(set(required_views) - set(ids)):
            report['errors'].append({'actor': missing, 'problem': 'Planned actor is absent from character registry', 'action': 'Register its newly painted package before authoring the shot'})
        for entry in actors:
            actor_id = entry['id']
            row = {'actor': actor_id, 'package': entry.get('package'),
                   'registered_views': list(entry.get('views', [])),
                   'required_views': list(required_views.get(actor_id, [])), 'views': []}
            report['actors'].append(row)
            try:
                package = _local(base, entry['package'])
                character = runtime_module.load_character(package)
                row['package_fingerprint'] = character.fingerprint
                row['available_views'] = sorted(character.views)
                if not row['registered_views']:
                    raise ValueError('Declare the supported views in the registry')
                if len(row['registered_views']) != len(set(row['registered_views'])):
                    raise ValueError('Duplicate registered view')
                missing = set(row['registered_views']) - set(character.views)
                if missing:
                    raise ValueError('Registered view has no painted package definition: ' + ', '.join(sorted(missing)))
                missing = set(row['required_views']) - set(row['registered_views'])
                if missing:
                    raise ValueError('Planned view is not registered: ' + ', '.join(sorted(missing)))
                if project.get('version', 1) >= 2 and character.binding_version < 2:
                    raise ValueError('Version-2 production needs painted neck_attachment mounts (binding_version 2)')
                for view_id in row['registered_views']:
                    try:
                        row['views'].append(_view_evidence(runtime_module, character, view_id, actor_id))
                    except Exception as exc:
                        report['errors'].append({'actor': actor_id, 'view': view_id, 'problem': str(exc),
                                                 'action': 'Repair this view fitting/paint or authored pose; do not relax the puppet validator'})
            except Exception as exc:
                report['errors'].append({'actor': actor_id, 'problem': str(exc),
                                         'action': 'Repair package paths, exact art hashes, sleeve/neck paint or declared views before encoding'})
        report['warnings'].append('Relative stroke measurements are descriptive. Compare the approved primary sample at matched head width; no universal pixel threshold or automatic style pass is inferred.')
        if registry.get('rigid_cast'):
            report['errors'].append({'problem': 'Rigid cast cannot substitute for validated version-2 painted characters', 'action': 'Use the existing production character contract'})
    except Exception as exc:
        report['errors'].append({'problem': str(exc), 'action': 'Repair the project character-system/registry configuration'})
    report['technical_pass'] = not report['errors']
    report['elapsed_seconds'] = round(time.perf_counter() - started, 4)
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('project')
    parser.add_argument('--required-views', help='JSON mapping of actor IDs to planned view IDs')
    parser.add_argument('--output', help='Optional report JSON path')
    args = parser.parse_args()
    # Use the installed producer's pinned runtime check rather than importing
    # arbitrary project code or providing an alternate lax renderer.
    spec = importlib.util.spec_from_file_location('b6_preflight_production', Path(__file__).with_name('b6_production.py'))
    producer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(producer)
    base = Path(args.project).resolve()
    runtime = producer.verified_module('b6_preflight_puppet', base / 'b6_puppet.py', producer.TRUSTED_PUPPET_RUNTIME_SHA256)
    report = preflight_project(base, runtime, required_views=_read(args.required_views) if args.required_views else None)
    rendered = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        Path(args.output).write_text(rendered)
    print(rendered)
    return 0 if report['technical_pass'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
