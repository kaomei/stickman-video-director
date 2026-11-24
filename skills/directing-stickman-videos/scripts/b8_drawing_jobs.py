"""Story-specific drawing task export. Pure local planning; never starts generation.

Optional shot fields:
  drawing_states: [ordered text, ...] or
    {characters: {CHAR_ID: [...]}, props: {PROP_ID_OR_NAME: [...]}, background: [...]}
  props: [{id, description, references?: [relative path], states_to_draw?: [...]}, ...]
  background_prompt: text
Contact records may add character_id / characters and states_to_draw. Explicit
state text wins; otherwise before/after and authored action/reaction are retained.
Existing background/prop layers become reuse candidates, not automatic redraws.
"""
import copy
import json
import pathlib


def _text(value):
    return value if isinstance(value, str) else json.dumps(value, ensure_ascii=False)


def _unique(items):
    return list(dict.fromkeys(items))


def _references(base, values):
    paths = []
    for value in values:
        path = pathlib.Path(value)
        if path.is_absolute() or '..' in path.parts:
            raise ValueError('Drawing references must be contained relative paths: ' + str(value))
        full = (base / path).resolve()
        if not full.is_relative_to(base) or not full.is_file():
            raise ValueError('Missing or escaping drawing reference: ' + str(value))
        paths.append(str(full))
    return _unique(paths)


def _states(value):
    if value is None:
        return None
    if isinstance(value, str):
        value = [value]
    if not isinstance(value, list) or not value or any(not isinstance(v, str) or not v.strip() for v in value):
        raise ValueError('Drawing states must be an ordered nonempty list of explicit text')
    return list(value)


def _shot_states(shot, kind, target):
    value = shot.get('drawing_states')
    if isinstance(value, (list, str)):
        return _states(value)
    if value is None:
        return None
    if not isinstance(value, dict):
        raise ValueError('drawing_states must be a list or per-role mapping')
    if kind == 'background':
        return _states(value.get('background'))
    group = value.get('characters' if kind == 'cel' else 'props', {})
    if not isinstance(group, dict):
        raise ValueError('drawing_states characters/props must map identities to ordered state text')
    # A direct ID mapping is accepted as shorthand for older authored plans.
    return _states(group.get(target, value.get(target)))


def _contacts(shot, character=None, prop=None):
    result = []
    for contact in shot.get('contacts', []):
        owners = contact.get('characters', [])
        if contact.get('character_id'):
            owners = list(owners) + [contact['character_id']]
        if character is not None and owners and character not in owners:
            continue
        if prop is not None and str(contact.get('object', '')).casefold() != str(prop).casefold():
            continue
        result.append(contact)
    return result


def _contact_states(contacts):
    explicit = []
    for contact in contacts:
        value = _states(contact.get('states_to_draw'))
        if value:
            explicit.extend(value)
    if explicit:
        return _unique(explicit)
    result = []
    for contact in contacts:
        label = str(contact.get('object', 'contact'))
        for key in ('before', 'after'):
            if contact.get(key):
                result.append(label + ' — ' + key + ': ' + _text(contact[key]))
    return _unique(result)


def _fallback_states(shot, contacts):
    result = _contact_states(contacts)
    if any(contact.get('states_to_draw') is not None for contact in contacts):
        return result
    if not result and shot.get('action'):
        result.append(_text(shot['action']))
    if shot.get('reaction'):
        result.append(_text(shot['reaction']))
    return _unique(result) or [_text(shot.get('information_change', 'Draw the authored story state'))]


def _layer_assets(shot, assets, kind):
    ids = []
    for layer in shot.get('layers', []):
        ids.append(layer.get('asset'))
        ids.extend(s.get('asset') for s in layer.get('states', []))
        if layer.get('material'):
            ids.append(layer['material'].get('asset'))
    return [aid for aid in _unique(ids) if aid in assets and assets[aid].get('kind') == kind]


def _prop_specs(shot, assets):
    """Explicit prop list, contact objects and existing prop cels; no noun guessing."""
    specs = []
    for prop in shot.get('props', []):
        prop = {'id': prop, 'description': prop} if isinstance(prop, str) else copy.deepcopy(prop)
        if not isinstance(prop, dict) or not (prop.get('id') or prop.get('description')):
            raise ValueError('props need an id or description')
        if 'id' not in prop:
            prop['id'] = prop['description']
        if 'description' not in prop:
            prop['description'] = prop['id']
        specs.append(prop)
    for contact in shot.get('contacts', []):
        if contact.get('object'):
            specs.append({'id': contact['object'], 'description': contact['object']})
    for aid in _layer_assets(shot, assets, 'prop'):
        asset = assets[aid]
        specs.append({'id': aid, 'description': asset.get('description', aid), 'asset': aid})
    result = []
    for prop in specs:
        keys = {str(prop.get('id', '')).casefold(), str(prop.get('description', '')).casefold(), str(prop.get('asset', '')).casefold()} - {''}
        existing = next((p for p in result if keys & p['_keys']), None)
        if existing:
            existing['_keys'].update(keys)
            for key, value in prop.items():
                existing.setdefault(key, value)
        else:
            prop['_keys'] = keys
            result.append(prop)
    return result


def build_jobs(d, base, anchor):
    """Return portable prompts with real attached references; do not mutate the plan."""
    base = pathlib.Path(base).resolve()
    shared = _references(base, d.get('drawing_family', {}).get('references', []))
    if not shared:
        raise ValueError('Actual common B8 drawing-family references are required')
    cast = {c['id']: c for c in d.get('characters', [])}
    assets = d.get('assets', {})
    jobs = []
    for shot in d.get('shots', []):
        sid = str(shot['id'])
        context = ('\nTARGET CANVAS: ' + str(d.get('width')) + 'x' + str(d.get('height')) +
                   '; compose natively for this aspect ratio. Preserve staging space for the intended framing, required contact/result and captions; do not center-crop landscape artwork.' +
                   '\nCAMERA / SPACE: ' + _text(shot.get('camera_motivation', '')) +
                   '; stage shared ground, feet/shadows and supported props coherently; separate local leaf/cloth motion from background camera movement. Stable holds are valid.' +
                   '\nSCENE/VIEW: ' + _text(shot.get('scene', '')) + '; ' + _text(shot.get('framing', '')) +
                   '\nNEW INFORMATION: ' + _text(shot.get('information_change', '')) +
                   '\nACTION/COMPLETE POSE: ' + _text(shot.get('action', '')) +
                   '\nREACTION: ' + _text(shot.get('reaction', '')) +
                   '\nCONTACT AUDIT: ' + _text(shot.get('contact_audit', '')))
        # Preserve the existing character job IDs, identity and regions fields.
        for cid in shot.get('characters', []):
            if cid not in cast:
                raise ValueError('Unknown drawn character: ' + str(cid))
            character = cast[cid]
            states = _shot_states(shot, 'cel', cid)
            if states is None:
                states = _states(character.get('drawing_states'))
            if states is None:
                states = _fallback_states(shot, _contacts(shot, character=cid))
            jobs.append({'id': sid + '-' + cid, 'shot': shot['id'], 'kind': 'cel', 'character_id': cid,
                         'reference_paths': _unique(shared + _references(base, character.get('references', []))),
                         'identity': copy.deepcopy(character['identity']), 'regions': copy.deepcopy(character['regions']),
                         'prompt': anchor + '\nIDENTITY: ' + _text(character['identity']) +
                                   '\nREGIONS: ' + _text(character['regions']) +
                                   '\nARM DIRECTION: Use character-relative left/right; draw palm, wrist and forearm returning naturally to this body, with consistent thumb, sleeve, skin and support. Check against the full character; do not blindly mirror. For an authored full-body view draw the complete head-to-feet pose; a close-up may intentionally continue beyond frame.' + context +
                                   '\nORDERED DRAWN STATES: ' + _text(states),
                         'states_to_draw': states, 'tool_call_started': False})
        background_states = _shot_states(shot, 'background', 'background')
        if background_states is None:
            background_states = [_text(shot.get('background_prompt') or shot.get('scene', '')) +
                                 '; composition: ' + _text(shot.get('framing', ''))]
        jobs.append({'id': sid + '-background', 'shot': shot['id'], 'kind': 'background',
                     'reference_paths': list(shared), 'reuse_candidates': _layer_assets(shot, assets, 'background'),
                     'prompt': anchor + '\nTASK: Background/environment only; do not paint the cast into this layer. '
                               'Preserve the shared B8 contour, cel-shading and texture grammar. '
                               'Compose depth planes and clear staging space for the authored action. '
                               'Reuse valid existing artwork before requesting new generation.' + context +
                               '\nENVIRONMENT BRIEF: ' + _text(shot.get('background_prompt', shot.get('scene', ''))) +
                               '\nORDERED DRAWN STATES: ' + _text(background_states),
                     'states_to_draw': background_states, 'tool_call_started': False})
        for index, prop in enumerate(_prop_specs(shot, assets)):
            pid = str(prop['id'])
            states = _shot_states(shot, 'prop', pid)
            if states is None:
                states = _states(prop.get('states_to_draw'))
            if states is None:
                matching = _contacts(shot, prop=prop['description']) or _contacts(shot, prop=pid)
                states = _fallback_states(shot, matching)
            refs = list(prop.get('references', []))
            candidate = prop.get('asset')
            if candidate in assets and assets[candidate].get('path'):
                refs.append(assets[candidate]['path'])
            jobs.append({'id': sid + '-prop-' + str(index + 1), 'shot': shot['id'], 'kind': 'prop',
                         'prop_id': pid, 'description': prop['description'],
                         'reference_paths': _unique(shared + _references(base, refs)),
                         'reuse_candidates': [candidate] if candidate in assets else [],
                         'prompt': anchor + '\nTASK: Isolated story prop, retaining the shared B8 drawing family. '
                                   'Do not invent a reaching hand or a new magical rule. '
                                   'When held, register the prop to the separately authored whole hand/forearm pose; '
                                   'reuse valid existing artwork before requesting new generation.' +
                                   '\nPROP: ' + _text(prop['description']) + context +
                                   '\nORDERED DRAWN STATES: ' + _text(states),
                         'states_to_draw': states, 'tool_call_started': False})
    return {'drawing_family': copy.deepcopy(d['drawing_family']), 'jobs': jobs,
            'note': 'Planning only. Attach the actual reference_paths to the configured image tool. '
                    'Review the director proposal before accurate artwork. No implicit generation, paid calls, '
                    'or new-story use of Midas identity. Reuse candidates require actual validity review.'}
