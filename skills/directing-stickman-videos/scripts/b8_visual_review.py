"""Recorded B8 visual-review gates; never an automated anatomy or aesthetic test."""
import pathlib

VERSION = 1


def scope(plan, shots):
    assets = set()
    cast = {str(cid) for shot in shots for cid in shot.get('characters', [])}
    for shot in shots:
        assets.update(shot.get('keypose_assets', []))
        for layer in shot.get('layers', []):
            assets.add(layer.get('asset'))
            assets.update(state.get('asset') for state in layer.get('states', []))
            assets.update((layer.get('material') or {}).get(k) for k in ('asset', 'mask'))
    assets.discard(None)
    cast.update(str(plan.get('assets', {}).get(a, {}).get('character_id')) for a in assets
                if plan.get('assets', {}).get(a, {}).get('character_id'))
    return sorted(cast), sorted(a for a in assets if plan.get('assets', {}).get(a, {}).get('character_id'))


def template(plan, shots, stage):
    portrait = plan['height'] > plan['width']
    criteria = {
        'cast_style': 'Compare all visible identities with the shared B8 cast board: contours, head/body proportions, face/hand simplification, skin and costume continuity.',
        'composition': ('Native 9:16 composition; ' if portrait else 'Authored landscape composition; ') + 'honor the intended full-body/detail framing throughout the path. Full-body shots include crown/head to feet; intentional close-ups keep contact/result readable and caption-safe.',
        'arm_direction': 'Check character-relative left/right, natural wrist/elbow return to the body, grip/thumb direction, sleeve/skin and occlusion across contact and cuts; explain when no arm is visible.',
        'spatial_motion': 'Inspect actual encoded motion and stops: common camera/ground registration, feet/shadow/ground props, hand-object support and motivated background/leaf movement. A stable hold is valid.',
    }
    cast, assets = scope(plan, shots)
    rows = [{'check': 'cast_style', 'shot_id': '__cast__', 'character_ids': cast, 'asset_ids': assets}]
    for shot in shots:
        for check in ['composition'] + (['arm_direction'] if stage != 'proposal' else []) + (['spatial_motion'] if stage in ('sample', 'film') else []):
            rows.append({'check': check, 'shot_id': str(shot['id'])})
    for row in rows:
        row.update(status='pending', reviewer='', notes='', evidence=[], criteria=criteria[row['check']])
    return {'version': VERSION, 'stage': stage, 'width': plan['width'], 'height': plan['height'],
            'scope': 'Recorded human/agent visual inspection only; encoding does not fill these checks or grant user acceptance.', 'items': rows}


def errors(review, plan, shots, stage, artifacts):
    """Artifacts are verified by the caller. Evidence must bind to those exact bytes."""
    if not isinstance(review, dict) or review.get('version') != VERSION:
        return ['Missing/current-version quality_review required; export and inspect this stage']
    if (review.get('stage'), review.get('width'), review.get('height')) != (stage, plan['width'], plan['height']):
        return ['quality_review stage or authored dimensions mismatch']
    rows = review.get('items')
    if not isinstance(rows, list) or any(not isinstance(row, dict) for row in rows):
        return ['quality_review.items must contain review records']
    allowed = {(a.get('path'), a.get('sha256')) for a in artifacts if isinstance(a, dict)}
    required = template(plan, shots, stage)['items']
    result = []
    for expected in required:
        key = (expected['check'], expected['shot_id'])
        found = [r for r in rows if (r.get('check'), r.get('shot_id')) == key]
        label = '/'.join(key)
        if len(found) != 1:
            result.append(label + ': missing/duplicate quality review'); continue
        row = found[0]
        if key[0] == 'cast_style':
            for field in ('character_ids', 'asset_ids'):
                if not isinstance(row.get(field), list) or not set(expected[field]).issubset(set(row[field])):
                    result.append(label + ': missing cast/pose coverage: ' + field)
        if row.get('status') == 'not_applicable' and not (key[0] == 'arm_direction' or (key[0] == 'cast_style' and not expected['character_ids'])):
            result.append(label + ': this check must be inspected, not marked N/A')
        if row.get('status') not in ('accepted', 'not_applicable'):
            result.append(label + ': pending or failed visual review')
        for field in ('reviewer', 'notes'):
            if not isinstance(row.get(field), str) or not row[field].strip():
                result.append(label + ': actual ' + field + ' required')
        evidence = row.get('evidence')
        if not isinstance(evidence, list) or not evidence:
            result.append(label + ': bound visual evidence required'); continue
        valid = []
        for item in evidence:
            if not isinstance(item, dict) or (item.get('path'), item.get('sha256')) not in allowed:
                result.append(label + ': evidence absent from current report artifacts'); continue
            if pathlib.Path(item['path']).suffix.lower() not in ('.png', '.jpg', '.jpeg', '.webp', '.mp4', '.mov'):
                result.append(label + ': evidence must show actual pictures'); continue
            valid.append(item)
        if stage in ('sample', 'film') and key[0] != 'cast_style' and not any(pathlib.Path(e['path']).suffix.lower() in ('.mp4', '.mov') for e in valid):
            result.append(label + ': actual encoded video evidence required')
    return result


def known_failures(report):
    """Do not hide explicit failures behind otherwise complete checklist records."""
    failures = {'failed', 'fail', 'rejected', 'blocked'}
    result = []
    for field in ('visual_review', 'actual_listening', 'user_acceptance', 'approval'):
        value = report.get(field)
        if isinstance(value, dict): value = value.get('status')
        if isinstance(value, str) and value.lower() in failures:
            result.append(field + ': explicitly failed/rejected')
    technical = report.get('technical')
    if isinstance(technical, dict):
        if technical.get('ok') is False or str(technical.get('status', '')).lower() in failures or str(technical.get('visual_acceptance', '')).lower() in failures:
            result.append('technical: explicit failed result')
    return result
