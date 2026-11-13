"""Build evidence from encoded B6 previews; keep creative review separate from QC.

This module never infers aesthetic acceptance from frame counts or motion size.
It binds a reviewer's observations to the actual preview, reference and inputs.
"""
from pathlib import Path
import copy
import hashlib
import html
import json
import importlib.util
import math
import subprocess

TRUSTED_CAPTION_RUNTIME_SHA256 = '5fc03a3f38dce9f55609f2059077125ecc30b7f5fa1d31580f9e007fcf23200b'

CHECKS = (
    'space_depth', 'camera_purpose', 'body_action', 'expression_gaze',
    'rhythm_continuity', 'drawing_anatomy', 'limb_line_weight', 'native_audio_captions',
)
SUBCHECKS = {
    'space_depth': ('world_routes_reveal', 'depth_planes_parallax_occlusion', 'spatial_staging_scale', 'background_independent_activity'),
    'camera_purpose': ('motivated_attention_landings', 'native_composition_safe_coverage', 'actor_similarity_no_warp', 'cut_axis_gaze_continuity'),
    'body_action': ('anticipation_action_recovery', 'shoulder_weight_support', 'contact_ownership_release', 'stance_swing_or_deliberate_hold'),
    'expression_gaze': ('identity_shape_consistency', 'emotional_progression', 'eyeline_target', 'reaction_readable_hold'),
    'rhythm_continuity': ('cause_action_reaction', 'travel_brake_land_hold', 'cut_readability_no_flash', 'focus_background_competition'),
    'drawing_anatomy': ('irregular_ink_pressure', 'unified_head_body_paint', 'single_stroke_fixed_limb_ownership', 'lighting_bloom_material_depth', 'shadows_edges_no_plastic'),
    'limb_line_weight': ('matched_head_width_primary_frames', 'relative_stroke_pressure', 'scale_pose_supporting_cast_consistency'),
    'native_audio_captions': ('caption_placement_typography', 'caption_semantics_timing', 'caption_raster_switch', 'actual_voice_sync_readability', 'original_speed_voice_identity', 'voice_music_foley_hierarchy', 'final_media_identity_av_playback'),
}
CONDITIONAL_SUBCHECKS = {'background_independent_activity', 'contact_ownership_release'}
PRIMARY_REFERENCE = {'id': 'sample-1-eiffel-portrait-v44', 'ratio': '9:16',
                     'sha256': 'b0047f5889a7ca1fd47097d8c8b3db054ef412e2f4a7297d3fe04fc1083e5d79'}
HARD_DEMONSTRATIONS = {
    'space_depth': ('world_regions', 'near_middle_far', 'changed_spatial_relationship',
                    'reveal_or_occlusion', 'reference_comparison'),
    'body_action': ('preparation', 'main_action', 'contact_or_peak', 'release_or_recovery',
                    'body_support', 'gaze_or_emotion', 'reference_comparison'),
}
HISTORY_DIR = '.b6-review-history'


def history(context):
    """Review state is deliberately outside the authored-input fingerprint."""
    path = Path(context.base) / HISTORY_DIR / 'index.json'
    data = read(path) if path.exists() else {'schema_version': 1, 'ratios': {}}
    require(data.get('schema_version') == 1, 'Unknown B6 review history schema')
    return path, data


def active_failure(context):
    _, data = history(context)
    return data['ratios'].get(context.ratio, {}).get('active')


def identity(data):
    return {'fingerprint': data['fingerprint'], 'preview_sha256': data['preview']['sha256'],
            'inputs': data.get('inputs', {})}


def confirmed_requirement(data, row):
    return bool(row.get('confirmed_defect') or row.get('resolution_requirement') == 'implementation_change'
                or data.get('supplemental_audit', {}).get('known_confirmed_defect'))


def remember_failure(context, review_rel, data, reason='Observed review is pending/needs repair'):
    """Freeze known failures independently of the next editable review file."""
    findings = unresolved_findings(data)
    if not findings or data.get('ratio') != context.ratio:
        return active_failure(context)
    require(sha(local(context.base, data['preview']['path'])) == data['preview']['sha256'],
            'Retain the failed preview before recording its review history')
    path, ledger = history(context)
    state = ledger['ratios'].setdefault(context.ratio, {'active': None, 'events': []})
    active = state['active']
    source_sha = sha(local(context.base, review_rel))
    if active and source_sha in (active['sha256'], active.get('source_sha256')):
        return active
    # A failed attempt with its history deleted cannot replace that history.
    if active and data.get('previous_review') != active:
        return active
    snapshot = copy.deepcopy(data)
    origins = {key: row.get('origin', data.get('_history_origins', {}).get(key, identity(data)))
               for key, row in findings}
    requirements = {key: confirmed_requirement(data, row) for key, row in findings}
    if active:
        old = read(local(context.base, active['path']))
        present = {key for key, _ in findings}
        for key, row in unresolved_findings(old):
            origins[key] = old.get('_history_origins', {}).get(key, row.get('origin', identity(old)))
            requirements[key] = requirements.get(key, False) or old.get('_history_requirements', {}).get(key, False) or confirmed_requirement(old, row)
            if key not in present:
                snapshot.setdefault('repair_log', []).append({'issue': key, 'status': 'pending',
                    'previous_observation': row.get('observation') or row.get('previous_observation', '')})
    snapshot['_history_origins'] = origins
    snapshot['_history_requirements'] = requirements
    payload = json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n'
    digest = hashlib.sha256(payload.encode()).hexdigest()
    rel = f'{HISTORY_DIR}/failure-{digest}.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    frozen = Path(context.base) / rel
    if not frozen.exists():
        frozen.write_text(payload)
    binding = {'path': rel, 'sha256': digest, 'fingerprint': data['fingerprint'], 'preview': data['preview'],
               'source_review': review_rel, 'source_sha256': source_sha}
    state['active'] = binding
    state['events'].append({'kind': 'rejected', 'review': binding, 'reason': reason})
    save(path, ledger)
    return binding


def remember_pass(context, review_rel, data):
    path, ledger = history(context)
    state = ledger['ratios'].get(context.ratio)
    if state and state.get('active'):
        state['events'].append({'kind': 'passed', 'review': review_rel,
                                'sha256': sha(local(context.base, review_rel)), 'resolved': state['active']})
        state['active'] = None
        save(path, ledger)


def require(ok, message):
    if not ok:
        raise ValueError(message)


def read(path):
    return json.loads(Path(path).read_text())


def save(path, data):
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def local(base, rel):
    base = Path(base).resolve()
    require(isinstance(rel, str) and rel and not Path(rel).is_absolute(), 'Project-relative review path required')
    path = (base / rel).resolve()
    require(path.is_relative_to(base) and path.is_file(), 'Missing/escaped review evidence: ' + rel)
    return path


def preview_binding(context, report_rel):
    base = context.base
    report = read(local(base, report_rel))
    require(report.get('kind') in ('preview', 'render') and not report.get('technical_fixture'), 'A real encoded preview or final render is required for motion review')
    require(report.get('fingerprint') == context.fingerprint and report.get('ratio') == context.ratio, 'Review preview/source/ratio changed')
    video = local(base, report['video'])
    require(sha(video) == report['video_sha256'], 'Review preview pixels changed')
    if 'time_range' in report:
        start, end = report['time_range']['start'], report['time_range']['end']
    else:
        require(report['checked_frames'] == round(context.project['duration'] * 30), 'Older partial preview needs an explicit time_range')
        start, end = 0, context.project['duration']
    require(0 <= start < end <= context.project['duration'], 'Invalid reviewed timeline')
    meta = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(video)]))
    v = next(s for s in meta['streams'] if s['codec_type'] == 'video')
    require((v['width'], v['height']) == (context.plan['width'], context.plan['height']), 'Review video native dimensions changed')
    require(abs(float(meta['format']['duration']) - (end - start)) < .15, 'Review clip duration does not match its timeline')
    require(any(s['codec_type'] == 'audio' for s in meta['streams']), 'Review actual audio and rhythm, not a silent substitute')
    return report, {'path': report['video'], 'sha256': sha(video), 'start': start, 'end': end}


def target_binding(context):
    rel = context.project.get('quality_target')
    require(rel, 'B6 motion target missing: lock quality-target.json before authoring/review')
    target = read(local(context.base, rel))
    ref = target['reference']
    require(target.get('version') == 3 and all(ref.get(k) == value for k, value in PRIMARY_REFERENCE.items()),
            'B6 strict primary V44 standard cannot be silently downgraded/replaced')
    require(set(target.get('required_checks', [])) == set(CHECKS)
            and target.get('required_subchecks') == {key: list(value) for key, value in SUBCHECKS.items()},
            'Complete B6 primary check/subcheck manifest required; broad passes cannot downgrade it')
    require(sha(local(context.base, ref['path'])) == ref['sha256'], 'Locked motion reference changed')
    meta = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-of', 'json', str(local(context.base, ref['path']))]))
    duration = float(meta['format']['duration'])
    require(ref.get('segments'), 'Choose relevant reference segments and their purpose')
    for segment in ref['segments']:
        require(0 <= segment['start'] < segment['end'] <= duration and segment.get('purpose', '').strip(), 'Invalid reference range/purpose')
    return target


def shot_ranges(context, preview):
    return [dict(id=s['id'], start=max(s['start'], preview['start']), end=min(s['end'], preview['end']))
            for s in context.plan['shots'] if s['end'] > preview['start'] and s['start'] < preview['end']]


def caption_binding(context, report, preview):
    """Verify the portable renderer/configuration identity, never infer visual quality."""
    helper = Path(__file__).with_name('caption_renderer.py')
    if not helper.exists():
        helper = Path(__file__).with_name('b6_caption.py')
    # Check before execution and compile those exact bytes, ignoring local .pyc files.
    source = helper.read_bytes()
    require(hashlib.sha256(source).hexdigest() == TRUSTED_CAPTION_RUNTIME_SHA256,
            'Untrusted caption runtime changed; review refuses to execute the edited project helper')
    spec = importlib.util.spec_from_file_location('b6_review_caption_contract', helper)
    captions = importlib.util.module_from_spec(spec)
    exec(compile(source, str(helper), 'exec'), captions.__dict__)
    profile = captions.validate_profile(context.plan.get('caption'), context.ratio,
                                        context.plan['width'], context.plan['height'], context.base)
    contract = report.get('caption_contract', {})
    require(contract.get('profile') == profile, 'Encoded report caption profile is missing/stale or differs from the native primary standard')
    require(contract.get('renderer_sha256') == context.inputs.get('caption_renderer.py')
            == sha(local(context.base, 'caption_renderer.py')),
            'Caption rasterizer must be project-local, fingerprinted and bound to the actual report')
    require(contract.get('font_sha256') == profile['font_sha256']
            and contract.get('cues_sha256') == context.inputs.get(context.project['captions']),
            'Caption font/cue identity changed since rendering')
    start, end = math.ceil(preview['start'] * 30), math.ceil(preview['end'] * 30)
    expected = [cue for cue in context.cues
                if max(start, math.ceil(cue['start'] * 30)) < min(end, math.ceil(cue['end'] * 30))]
    observed = contract.get('observed_cues', [])
    require([{k: v for k, v in row.items() if k != 'raster_bounds'} for row in observed] == expected,
            'Actual rendered caption cue inventory differs from the reviewed timeline')
    for row in observed:
        box = row.get('raster_bounds')
        require(isinstance(box, list) and len(box) == 4 and all(isinstance(x, int) for x in box)
                and 0 <= box[0] < box[2] <= context.plan['width']
                and profile['band'][0] - 3 <= box[1] < box[3] <= profile['band'][1] + 3,
                'Measured caption raster is outside its native baseline band')
    return contract


def unresolved_findings(data):
    """Preserve open findings across more than one repair iteration."""
    rows = [('check:' + key, row) for key, row in data.get('checks', {}).items()]
    rows += [('subcheck:' + key + ':' + subkey, subrow)
             for key, row in data.get('checks', {}).items() for subkey, subrow in row.get('subchecks', {}).items()]
    rows += [('shot:' + str(row['id']), row) for row in data.get('shots', [])]
    rows += [('regression:' + row['issue'], row) for row in data.get('regressions', [])]
    findings = {}
    for key, row in rows:
        if row.get('status') not in ('pass', 'not_applicable') or row.get('remaining_gaps') or row.get('confirmed_defect'):
            observation = row.get('observation') or row.get('observed_action', '')
            if row.get('remaining_gaps'):
                observation += ' ' + '; '.join(row['remaining_gaps'])
            findings[key] = {**row, 'observation': observation.strip()}
    for i, gap in enumerate(data.get('remaining_gaps', [])):
        findings['gap:global:' + str(i)] = {'status': 'needs_repair', 'observation': gap,
                                          'confirmed_defect': bool(data.get('supplemental_audit', {}).get('known_confirmed_defect'))}
    for row in data.get('repair_log', []):
        if (row.get('status') != 'pass' or row.get('remaining_gaps')) and row['issue'] not in findings:
            observation = row.get('observation') or row.get('previous_observation', '')
            if row.get('remaining_gaps'):
                observation += ' ' + '; '.join(row['remaining_gaps'])
            findings[row['issue']] = {**row, 'observation': observation.strip()}
    if not findings and data.get('review', {}).get('status') != 'pass':
        findings['review:overall'] = {'status': data.get('review', {}).get('status', 'pending'),
                                      'observation': 'Previous overall review was not completed/passed.'}
    if data.get('supplemental_audit', {}).get('known_confirmed_defect') and not findings:
        findings['review:confirmed_defect'] = {'status': 'needs_repair', 'confirmed_defect': True,
                                              'observation': 'Supplemental actual-media audit records a confirmed visible defect.'}
    return list(findings.items())


def build_pack(context, report_rel, output, previous_review=None):
    base = Path(context.base).resolve()
    report, preview = preview_binding(context, report_rel)
    target = target_binding(context)
    caption_contract = caption_binding(context, report, preview)
    require(isinstance(context.plan.get('cast_inventory'), list), 'Native plan needs explicit cast_inventory before review; [] means genuinely no visible cast')
    previous = active_failure(context)
    if previous_review:
        old = read(local(base, previous_review))
        imported = remember_failure(context, previous_review, old)
        if previous:
            require(sha(local(base, previous_review)) in (previous['sha256'], previous.get('source_sha256'))
                    or old.get('previous_review') == previous,
                    'Known failed review history cannot be replaced by an unrelated predecessor')
        previous = imported
        if previous is None:
            previous = {'path': previous_review, 'sha256': sha(local(base, previous_review)),
                        'fingerprint': old['fingerprint'], 'preview': old['preview']}
    out = (base / output).resolve()
    require(out.is_relative_to(base) and not out.exists(), 'Choose a fresh project-local review directory')
    out.mkdir(parents=True)
    artifacts = {}

    def register(path):
        rel = path.relative_to(base).as_posix()
        artifacts[rel] = sha(path)
        return rel

    def clip(source, start, end, name):
        path = out / name
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-ss', str(start), '-i', str(source), '-t', str(end - start),
                        '-map', '0:v:0', '-map', '0:a:0?', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-c:a', 'aac',
                        '-movflags', '+faststart', str(path)], check=True)
        return register(path)

    def frames(source, start, end, prefix):
        evidence = []
        for j, t in enumerate((start, (start + end) / 2, max(start, end - 1 / 30))):
            path = out / f'{prefix}-{j}.png'
            subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-ss', str(t), '-i', str(source),
                            '-frames:v', '1', str(path)], check=True)
            evidence.append(register(path))
        return evidence

    shots = []
    for i, span in enumerate(shot_ranges(context, preview)):
        start, end = span['start'], span['end']
        evidence = [clip(local(base, preview['path']), start - preview['start'], end - preview['start'], f'shot-{i:02}.mp4')]
        # Decode the actual delivered movie, not another render of the scene code.
        evidence.extend(frames(local(base, preview['path']), start - preview['start'], end - preview['start'], f'shot-{i:02}'))
        shots.append({**span, 'status': 'pending', 'observed_action': '', 'observed_camera': '',
                      'observed_expression_gaze': '', 'observed_limb_occlusion': '', 'observed_space_light': '',
                      'observed_caption_audio': '', 'cast_ids': None, 'hold_reason': '', 'evidence': evidence})

    reference_clips = []
    for i, segment in enumerate(target['reference']['segments']):
        evidence = clip(local(base, target['reference']['path']), segment['start'], segment['end'], f'reference-{i:02}.mp4')
        stills = frames(local(base, target['reference']['path']), segment['start'], segment['end'], f'reference-{i:02}')
        reference_clips.append({**segment, 'evidence': evidence, 'frames': stills})
    # Decode active caption frames and both sides of each actual cue switch.
    # Generic shot thumbnails can land in a caption gap and cannot prove placement.
    first_frame, stop_frame = round(preview['start'] * 30), round(preview['end'] * 30)
    selected, active_cues, switches = set(), [], []
    for cue in context.cues:
        first = max(first_frame, math.ceil(cue['start'] * 30))
        stop = min(stop_frame, math.ceil(cue['end'] * 30))
        if first < stop:
            active = (first + stop - 1) // 2
            selected.add(active)
            active_cues.append({'cue': cue, 'frame': active})
        for boundary in (math.ceil(cue['start'] * 30), math.ceil(cue['end'] * 30)):
            if first_frame < boundary < stop_frame:
                switches.append(boundary)
                selected.update(f for f in (boundary - 1, boundary, boundary + 1) if first_frame <= f < stop_frame)
    decoded = {}
    if selected:
        ordered = sorted(selected)
        selection = '+'.join(f'eq(n,{frame - first_frame})' for frame in ordered)
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', str(local(base, preview['path'])),
                        '-vf', "select='" + selection + "'", '-vsync', 'vfr',
                        str(out / 'caption-%04d.png')], check=True)
        for i, frame in enumerate(ordered, 1):
            decoded[frame] = register(out / f'caption-{i:04}.png')
    caption_evidence = {'active_cues': [{**row, 'evidence': decoded[row['frame']]} for row in active_cues],
                        'switches': [{'frame': frame, 'before': decoded.get(frame - 1), 'at': decoded[frame],
                                      'after': decoded.get(frame + 1)} for frame in sorted(set(switches))]}
    plan_file = out / 'plan-snapshot.json'
    save(plan_file, context.plan)
    register(plan_file)
    regression_source = target.get('regressions', [])
    regressions = [{'issue': x, 'status': 'pending', 'observation': '', 'evidence': []} for x in regression_source]
    checks = {key: {'status': 'pending', 'observation': '', 'evidence': [], 'implementation': []} for key in CHECKS}
    for key, ids in SUBCHECKS.items():
        checks[key]['subchecks'] = {subkey: {'status': 'pending', 'observation': '', 'start': None, 'end': None,
                                           'evidence': [], 'implementation': [], 'remaining_gaps': [],
                                           'confirmed_defect': False}
                                     for subkey in ids}
    checks['drawing_anatomy']['subchecks']['single_stroke_fixed_limb_ownership']['cast_coverage'] = []
    checks['limb_line_weight']['comparison_basis'] = ''
    for key, fields in HARD_DEMONSTRATIONS.items():
        checks[key]['demonstration'] = {field: '' for field in fields}
        checks[key]['demonstration'].update(start=None, end=None, evidence=[])
        checks[key]['remaining_gaps'] = []
    repair_log = []
    if previous:
        previous_path = local(base, previous['path'])
        old = read(previous_path)
        old_preview = old['preview']
        require(sha(local(base, old_preview['path'])) == old_preview['sha256'],
                'Previous rejected preview changed; retain it for comparison')
        for key, row in unresolved_findings(old):
            repair_log.append({'issue': key, 'previous_status': row.get('status', 'pending'),
                               'previous_observation': row.get('observation') or row.get('previous_observation', ''),
                               'origin': old.get('_history_origins', {}).get(key, row.get('origin', identity(old))),
                               'resolution_requirement': 'implementation_change' if old.get('_history_requirements', {}).get(key, False) or confirmed_requirement(old, row) else 'observed_resolution',
                               'status': 'pending', 'resolution': 'implementation_change', 'correction_reason': '',
                               'change': '', 'observation': '', 'evidence': [], 'implementation': []})
    review = {
        'schema_version': 3, 'fingerprint': context.fingerprint, 'inputs': dict(context.inputs), 'ratio': context.ratio,
        'report': report_rel, 'preview': preview, 'reference': target['reference'],
        'target_sha256': sha(local(base, context.project['quality_target'])),
        'report_sha256': sha(local(base, report_rel)), 'caption_contract': caption_contract,
        'caption_evidence': caption_evidence,
        'subcheck_manifest': {key: list(value) for key, value in SUBCHECKS.items()},
        'cast_inventory': [{**item, 'shot_ids': [ident for ident in item['shot_ids']
                                              if ident in {span['id'] for span in shot_ranges(context, preview)}]}
                           for item in context.plan['cast_inventory']
                           if set(item['shot_ids']) & {span['id'] for span in shot_ranges(context, preview)}],
        'cast_inventory_observation': '',
        'review': {'status': 'pending', 'reviewer': '', 'method': '', 'reviewed_at': ''},
        'full_playback': {'preview_sha256': preview['sha256'], 'start': preview['start'], 'end': preview['end'],
                          'speed': 1, 'reviewer': '', 'observed_rhythm': '', 'observed_audio': '', 'reference_evidence': []},
        'previous_review': previous, 'repair_log': repair_log, 'remaining_gaps': [],
        'next_action': 'continue_local_repairs_and_review_until_pass',
        'style_standard': target.get('style_standard', {}), 'checks': checks,
        'shots': shots, 'regressions': regressions, 'reference_clips': reference_clips,
        'limitations': ['Caption identity/raster bounds and cast inventory are mechanical checks, not aesthetic or automatic person detection. Compare decoded full-resolution frames and actual AV; list background people, including painted-in cast.'], 'artifacts': artifacts,
    }
    sections = ['<!doctype html><meta charset="utf-8"><title>B6 motion review</title>',
                '<style>body{font:16px system-ui;background:#211d20;color:#f7eedf;max-width:1400px;margin:30px auto}video{width:min(100%,600px);max-height:650px}section{border-top:1px solid #766;padding:20px 0}p{max-width:900px}</style>',
                '<h1>B6 actual-preview review · PENDING</h1><p>Compare actual playback, source implementation and the reference. Technical checks do not establish creative acceptance. Animation performance and spatial richness must pass. Pending or needs-repair findings require continued local correction, re-rendering and review; they are not a completed delivery. Fill motion-review.json only after review. A held shot can be intentional; explain its purpose rather than adding arbitrary movement.</p>']
    import os
    full_video = os.path.relpath(local(base, preview['path']), out)
    if target.get('style_standard'):
        criteria = ''.join(f'<li><strong>{html.escape(key)}</strong>: {html.escape(value)}</li>' for key, value in target['style_standard'].items())
        sections.append(f'<section><h2>Strict primary standard · {html.escape(target["reference"].get("id", "selected reference"))}</h2><ul>{criteria}</ul><p>Limb-weight review requires actual candidate and primary-reference decoded PNG evidence, plus a recorded matched-head-width comparison basis. This is visual review, not an automatic similarity score.</p></section>')
    sections.append(f'<section><h2>Complete reviewed range · {preview["start"]:.2f}–{preview["end"]:.2f}s · {html.escape(context.ratio)}</h2><video controls preload="metadata" src="{html.escape(full_video)}"></video><p>Watch this continuously with audio to judge pacing and cut continuity; isolated shot clips do not establish those.</p></section>')
    for ref in reference_clips:
        name = Path(ref['evidence']).name
        sections.append(f'<section><h2>Reference {ref["start"]:.2f}–{ref["end"]:.2f}s</h2><p>{html.escape(ref["purpose"])}</p><video controls preload="metadata" src="{html.escape(name)}"></video></section>')
    for shot in shots:
        name = Path(shot['evidence'][0]).name
        sections.append(f'<section><h2>{html.escape(str(shot["id"]))} · {shot["start"]:.2f}–{shot["end"]:.2f}s</h2><video controls preload="metadata" src="{html.escape(name)}"></video><p>Check observed body/action, gaze, layer relationships, camera purpose, settle and cut continuity. Compare with the full preview for rhythm.</p></section>')
    page = out / 'index.html'
    page.write_text('\n'.join(sections))
    register(page)
    save(out / 'motion-review.json', review)
    return {'review': str(out / 'motion-review.json'), 'viewer': str(page), 'status': 'pending_actual_playback_and_source_review', 'shots': len(shots)}


def validate_review(context, review_rel, report_rel=None):
    data = read(local(context.base, review_rel))
    try:
        result = _validate_review(context, review_rel, report_rel)
    except ValueError as error:
        # Do not let a later pack forget a known failed/pending review.
        remember_failure(context, review_rel, data, str(error))
        raise
    remember_pass(context, review_rel, data)
    return result


def _validate_review(context, review_rel, report_rel=None):
    base = context.base
    data = read(local(base, review_rel))
    active = active_failure(context)
    if active:
        require(data.get('previous_review') == active,
                'Known failed review history is missing/replaced; rebuild the pack to inherit its repairs')
    require(data.get('schema_version') == 3 and data.get('ratio') == context.ratio and data.get('fingerprint') == context.fingerprint, 'Motion review belongs to an old schema or changed inputs/ratio; regenerate the review pack')
    require(data.get('inputs') == dict(context.inputs), 'Motion review source digest inventory changed')
    require(report_rel is None or data['report'] == report_rel, 'Motion review is for another preview report')
    report, preview = preview_binding(context, data['report'])
    require(data['preview'] == preview, 'Motion review preview/range changed')
    target = target_binding(context)
    require(data['reference'] == target['reference'] and data['target_sha256'] == sha(local(base, context.project['quality_target'])), 'Motion review target changed')
    require(data.get('style_standard', {}) == target.get('style_standard', {}), 'Primary style standard changed')
    require(data.get('subcheck_manifest') == {key: list(value) for key, value in SUBCHECKS.items()},
            'Review must include the complete mandatory primary subcheck manifest')
    require(data.get('report_sha256') == sha(local(base, data['report']))
            and data.get('caption_contract') == caption_binding(context, report, preview),
            'Caption render report binding changed; rebuild actual-media review')
    artifacts = data.get('artifacts', {})
    require(artifacts and all(sha(local(base, p)) == digest for p, digest in artifacts.items()), 'Motion review evidence missing/changed')
    actual_clips = {p for p in artifacts if Path(p).suffix == '.mp4' and Path(p).name.startswith('shot-')}
    ref_clips = {p for p in artifacts if Path(p).suffix == '.mp4' and Path(p).name.startswith('reference-')}
    actual_frames = {p for p in artifacts if Path(p).suffix == '.png' and Path(p).name.startswith(('shot-', 'caption-'))}
    ref_frames = {p for p in artifacts if Path(p).suffix == '.png' and Path(p).name.startswith('reference-')}
    require(actual_clips and ref_clips, 'Actual playback and reference excerpts are required')
    caption_evidence = data.get('caption_evidence', {})
    caption_active = caption_evidence.get('active_cues', [])
    expected_cues = data['caption_contract']['observed_cues']
    require([row.get('cue') for row in caption_active] == [{k: v for k, v in cue.items() if k != 'raster_bounds'} for cue in expected_cues],
            'Caption comparison needs an actual decoded active frame for every visible cue')
    caption_active_frames = set()
    for row in caption_active:
        frame, cue, file = row.get('frame'), row['cue'], row.get('evidence')
        require(isinstance(frame, int) and cue['start'] <= frame / 30 < cue['end']
                and preview['start'] <= frame / 30 < preview['end'] and file in actual_frames,
                'Caption evidence must be decoded during its actual active cue, not a blank thumbnail')
        caption_active_frames.add(file)
    expected_switches = {math.ceil(cue[boundary] * 30) for cue in context.cues for boundary in ('start', 'end')
                         if round(preview['start'] * 30) < math.ceil(cue[boundary] * 30) < round(preview['end'] * 30)}
    switches = caption_evidence.get('switches', [])
    require([row.get('frame') for row in switches] == sorted(expected_switches), 'Caption hard-switch evidence inventory changed')
    caption_switch_frames = set()
    for row in switches:
        require(row.get('before') in actual_frames and row.get('at') in actual_frames
                and (row['frame'] + 1 >= round(preview['end'] * 30) or row.get('after') in actual_frames),
                'Caption switch review needs decoded adjacent before/at/after frames')
        caption_switch_frames.update(file for file in (row.get('before'), row.get('at'), row.get('after')) if file)
    review = data.get('review', {})
    require(review.get('status') == 'pass' and all(str(review.get(k, '')).strip() for k in ['reviewer', 'method', 'reviewed_at']), 'Motion review pending/needs repair: continue local repairs, re-render and actual playback review; do not mark the task complete')
    require(data.get('remaining_gaps') == [], 'Known quality gaps remain: continue local repair and review')
    require(not data.get('supplemental_audit', {}).get('known_confirmed_defect'),
            'Confirmed actual-media defect remains; implementation repair and fresh playback are required')
    playback = data.get('full_playback', {})
    require(all(playback.get(k) == preview[v] for k, v in [('preview_sha256', 'sha256'), ('start', 'start'), ('end', 'end')])
            and playback.get('speed') == 1, 'Record full current preview playback at intended speed')
    require(all(isinstance(playback.get(k), str) and playback[k].strip() for k in ['reviewer', 'observed_rhythm', 'observed_audio']),
            'Full real-time playback observations required; a contact sheet cannot pass rhythm/audio')
    require(set(playback.get('reference_evidence', [])) & ref_clips, 'Full review needs actual primary-reference playback')

    def evidence(row, clips=False):
        files = row.get('evidence', [])
        require(files and set(files).issubset(artifacts), 'Review observation needs existing hashed evidence')
        if clips:
            require(set(files) & actual_clips, 'Observe actual shot playback, not only a still or written plan')

    def implementation(row):
        require(row.get('implementation'), 'Link the observed capability to its actual implementation')
        for item in row['implementation']:
            path = item.get('path')
            require(path in context.inputs and item.get('claim', '').strip(), 'Implementation evidence must name a fingerprinted input and its role')
            local(base, path)

    expected = shot_ranges(context, preview)
    expected_ids = {span['id'] for span in expected}
    inventory = data.get('cast_inventory')
    require(isinstance(inventory, list) and isinstance(data.get('cast_inventory_observation'), str)
            and data['cast_inventory_observation'].strip(),
            'List and actually inspect all visible cast, including painted-in background people')
    cast = {}
    for item in inventory:
        ident = item.get('id')
        require(isinstance(ident, str) and ident.strip() and ident not in cast and item.get('role', '').strip()
                and item.get('shot_ids') and len(item['shot_ids']) == len(set(item['shot_ids']))
                and set(item['shot_ids']).issubset(expected_ids), 'Invalid or duplicated actual cast inventory')
        cast[ident] = item
    require(isinstance(context.plan.get('cast_inventory'), list), 'Native plan needs explicit cast_inventory before review')
    declared = {item['id']: item for item in context.plan['cast_inventory'] if set(item['shot_ids']) & expected_ids}
    require(set(declared) == set(cast), 'Actual review omits declared cast or adds an undeclared actor; reconcile the native plan')
    for ident, item in declared.items():
        require(set(cast[ident]['shot_ids']) == set(item['shot_ids']) & expected_ids,
                'Declared cast shot coverage changed: ' + ident)

    require(set(data.get('checks', {})) == set(CHECKS), 'Incomplete motion capability review')
    required = set(target.get('required_checks', CHECKS)) | set(HARD_DEMONSTRATIONS)
    for key, row in data['checks'].items():
        require(not row.get('remaining_gaps'), 'Known check gaps remain: ' + key)
        require(not row.get('confirmed_defect'), 'Confirmed check defect remains: ' + key)
        require(row.get('observation', '').strip(), 'Missing observed result: ' + key)
        if row.get('status') == 'not_applicable':
            require(key not in required and row.get('reason', '').strip(), 'Required capability cannot be skipped: ' + key)
        else:
            require(row.get('status') == 'pass', 'Motion capability needs repair: ' + key)
            evidence(row, clips=True)
            require(set(row['evidence']) & ref_clips, 'Compare capability to actual reference playback: ' + key)
            if key in HARD_DEMONSTRATIONS:
                require(row.get('remaining_gaps') == [], 'Animation/space still below primary standard: ' + key)
                demo = row.get('demonstration', {})
                require(all(isinstance(demo.get(field), str) and demo[field].strip() for field in HARD_DEMONSTRATIONS[key]),
                        'Describe observed animation/space effect, not a plan label: ' + key)
                start, end = demo.get('start'), demo.get('end')
                require(isinstance(start, (int, float)) and isinstance(end, (int, float))
                        and preview['start'] <= start < end <= preview['end'], 'Demonstrated effect needs an actual reviewed range: ' + key)
                evidence(demo, clips=True)
                require(set(demo['evidence']) & ref_clips, 'Demonstrated effect needs its primary-reference comparison: ' + key)
            if key == 'limb_line_weight':
                require(row.get('comparison_basis', '').strip(), 'Limb stroke review needs a matched-head-width comparison basis')
                require(set(row['evidence']) & actual_frames and set(row['evidence']) & ref_frames,
                        'Limb stroke review needs decoded candidate and primary-reference frame evidence')
            implementation(row)
        subchecks = row.get('subchecks', {})
        require(set(subchecks) == set(SUBCHECKS[key]), 'Incomplete mandatory subchecks: ' + key)
        for subkey, subrow in subchecks.items():
            label = key + ':' + subkey
            require(subrow.get('remaining_gaps') == [] and not subrow.get('confirmed_defect'), 'Known subcheck gaps/defect remain: ' + label)
            require(subrow.get('observation', '').strip(), 'Missing observed subcheck result: ' + label)
            start, end = subrow.get('start'), subrow.get('end')
            require(isinstance(start, (int, float)) and isinstance(end, (int, float))
                    and preview['start'] <= start < end <= preview['end'], 'Subcheck needs an actual reviewed range: ' + label)
            evidence(subrow, clips=True)
            require(set(subrow['evidence']) & ref_clips, 'Subcheck needs actual primary-reference comparison: ' + label)
            if subrow.get('status') == 'not_applicable':
                require(subkey in CONDITIONAL_SUBCHECKS and subrow.get('reason', '').strip(),
                        'Required subcheck cannot be skipped without actual conditional absence: ' + label)
            else:
                require(subrow.get('status') == 'pass', 'Subcheck needs repair or actual review: ' + label)
                implementation(subrow)
            if subkey in ('caption_placement_typography', 'caption_raster_switch', 'irregular_ink_pressure',
                          'unified_head_body_paint', 'lighting_bloom_material_depth', 'shadows_edges_no_plastic',
                          'matched_head_width_primary_frames', 'relative_stroke_pressure'):
                require(set(subrow['evidence']) & actual_frames and set(subrow['evidence']) & ref_frames,
                        'Subcheck requires decoded candidate and primary-reference frame evidence: ' + label)
            if subkey == 'caption_placement_typography' and caption_active_frames:
                require(set(subrow['evidence']) & caption_active_frames, 'Caption typography review needs decoded active-cue evidence')
            if subkey == 'caption_raster_switch' and caption_switch_frames:
                require(caption_switch_frames.issubset(subrow['evidence']), 'Review all actual caption switches with adjacent decoded frames')
            if subkey == 'single_stroke_fixed_limb_ownership':
                coverage = subrow.get('cast_coverage', [])
                require(len(coverage) == len(cast) and {item.get('id') for item in coverage} == set(cast),
                        'Limb review must cover every declared/observed cast member, not only the protagonist')
                for item in coverage:
                    require(set(item.get('shot_ids', [])) == set(cast[item['id']]['shot_ids'])
                            and all(isinstance(item.get(k), str) and item[k].strip()
                                    for k in ('views_poses', 'near_far_ownership', 'hidden_limb_occlusion')),
                            'Each cast needs pose/view, near/far ownership and credible hidden-limb occlusion evidence')
                    evidence(item, clips=True)
                    for shotid in item['shot_ids']:
                        index = next(i for i, span in enumerate(expected) if span['id'] == shotid)
                        require(any(Path(p).name == f'shot-{index:02}.mp4' for p in item['evidence']),
                                'Cast limb review lacks its own actual shot evidence: ' + item['id'])
    require(len(data.get('shots', [])) == len(expected), 'Every actual native shot needs review')
    for i, (shot, span) in enumerate(zip(data['shots'], expected)):
        require(not shot.get('remaining_gaps'), 'Known shot gaps remain: ' + str(span['id']))
        require(all(shot.get(k) == v for k, v in span.items()), 'Reviewed shot coverage changed')
        require(shot.get('status') == 'pass' and shot.get('observed_action', '').strip() and shot.get('observed_camera', '').strip(), 'Shot action/camera pending or needs repair: ' + str(span['id']))
        require(all(isinstance(shot.get(k), str) and shot[k].strip() for k in
                    ('observed_expression_gaze', 'observed_limb_occlusion', 'observed_space_light', 'observed_caption_audio')),
                'Each shot needs actual expression, limb, space/light and caption/audio observations')
        require(isinstance(shot.get('cast_ids'), list)
                and len(shot['cast_ids']) == len(set(shot['cast_ids']))
                and set(shot['cast_ids']) == {ident for ident, item in cast.items() if span['id'] in item['shot_ids']},
                'Every shot must list its complete actual cast, or an explicit empty cast list')
        evidence(shot, clips=True)
        require(any(Path(p).name == f'shot-{i:02}.mp4' for p in shot['evidence']), 'Shot needs its own actual playback evidence: ' + str(span['id']))
    require([r.get('issue') for r in data.get('regressions', [])] == target.get('regressions', []), 'Previous rejection regression inventory changed')
    for regression in data.get('regressions', []):
        require(not regression.get('remaining_gaps'), 'Known regression gaps remain: ' + regression.get('issue', 'unknown'))
        require(regression.get('status') == 'pass' and regression.get('observation', '').strip(), 'Previous rejected behavior not repaired')
        evidence(regression, clips=True)
    previous = data.get('previous_review')
    require(previous or not data.get('repair_log'), 'Repair log has no previous review identity')
    if previous:
        old_path = local(base, previous['path'])
        require(sha(old_path) == previous['sha256'], 'Previous review history changed')
        old = read(old_path)
        require(old['fingerprint'] == previous['fingerprint'] and old['preview'] == previous['preview'], 'Previous review identity changed')
        require(sha(local(base, old['preview']['path'])) == old['preview']['sha256'], 'Previous rejected preview changed')
        expected_repairs = [key for key, row in unresolved_findings(old)]
        require([row.get('issue') for row in data.get('repair_log', [])] == expected_repairs, 'Unresolved previous findings were dropped')
        for repair in data.get('repair_log', []):
            key = repair['issue']
            source = dict(unresolved_findings(old))[key]
            origin = old.get('_history_origins', {}).get(key, source.get('origin', identity(old)))
            require(repair.get('origin') == origin, 'Repair origin identity changed: ' + key)
            requirement = 'implementation_change' if old.get('_history_requirements', {}).get(key, False) or confirmed_requirement(old, source) else 'observed_resolution'
            require(repair.get('resolution_requirement') == requirement, 'Confirmed-defect repair requirement changed: ' + key)
    for repair in data.get('repair_log', []):
        require(not repair.get('remaining_gaps'), 'Known repair gaps remain: ' + repair.get('issue', 'unknown'))
        require(repair.get('status') == 'pass' and all(str(repair.get(k, '')).strip() for k in ['change', 'observation']),
                'Previous failure still needs correction and recheck: ' + repair.get('issue', 'unknown'))
        evidence(repair, clips=True)
        require(repair.get('implementation') and all(item.get('path') in context.inputs and item.get('claim', '').strip()
                for item in repair['implementation']), 'Repair needs actual fingerprinted implementation evidence')
        origin = repair.get('origin', {})
        if repair.get('resolution') == 'implementation_change':
            require(origin.get('fingerprint') != context.fingerprint and origin.get('preview_sha256') != preview['sha256'],
                    'Claimed implementation repair needs changed source and newly rendered pixels; use an explicit review_correction for a genuine prior misreport')
            if origin.get('inputs'):
                require(any(context.inputs[item['path']] != origin['inputs'].get(item['path'])
                            for item in repair['implementation']),
                        'Claimed repair implementation has not changed since the failed review')
        else:
            require(repair.get('resolution_requirement') != 'implementation_change',
                    'Confirmed visible defect requires an implementation change and newly rendered pixels; review_correction cannot erase it')
            require(repair.get('resolution') == 'review_correction'
                    and isinstance(repair.get('correction_reason'), str) and repair['correction_reason'].strip(),
                    'Re-review without a code repair requires an explicit truthful prior-misreport explanation')
    return {'review': review_rel, 'sha256': sha(local(base, review_rel)), 'status': 'reviewer_passed_not_automatic_aesthetic_judgment'}
