"""B6 draft viewport and conservative iteration worklists; never review credit."""
from dataclasses import dataclass, replace
from pathlib import Path
import hashlib
import json
import math


def _need(ok, message):
    if not ok:
        raise ValueError(message)


@dataclass(frozen=True)
class RenderViewport:
    native_size: tuple
    scale: float = 1.0

    def __post_init__(self):
        _need(isinstance(self.native_size, tuple) and len(self.native_size) == 2
              and all(isinstance(v, int) and not isinstance(v, bool) and v >= 64
                      and v % 2 == 0 for v in self.native_size),
              'Native viewport needs positive even integer dimensions of at least 64')
        _need(not isinstance(self.scale, bool) and self.scale in (.5, .75, 1.0),
              'Draft scale must be .5, .75 or 1')
        _need(all(v * self.scale == int(v * self.scale) and int(v * self.scale) % 2 == 0
                  for v in self.native_size),
              'Scaled dimensions must be exact even integers; do not crop or alter ratio')

    @classmethod
    def from_plan(cls, plan, scale=1.0):
        return cls((plan['width'], plan['height']), scale)

    @property
    def size(self):
        return tuple(int(v * self.scale) for v in self.native_size)

    @property
    def width(self):
        return self.size[0]

    @property
    def height(self):
        return self.size[1]

    def pixel(self, value):
        _need(isinstance(value, (int, float)) and not isinstance(value, bool)
              and math.isfinite(value), 'Finite pixel distance required')
        return value * self.scale

    def camera(self, native_camera):
        """Resize the projection, preserving all world coordinates and near plane."""
        _need((native_camera.width, native_camera.height) == self.native_size,
              'Pass the native camera once; already-scaled or unrelated camera refused')
        return replace(native_camera, width=self.width, height=self.height,
                       focal=native_camera.focal * self.scale,
                       principal_y=native_camera.principal_y * self.scale)

    def screen_matrix(self, native_matrix):
        """Scale the screen output of a native 3x3 transform, not its local input."""
        _need(len(native_matrix) == 3 and all(len(row) == 3 for row in native_matrix),
              'Native screen matrix must be 3x3')
        rows = tuple(tuple(float(v) for v in row) for row in native_matrix)
        _need(all(math.isfinite(v) for row in rows for v in row), 'Finite screen matrix required')
        return tuple(tuple(v * (self.scale if i < 2 else 1) for v in row)
                     for i, row in enumerate(rows))


def _sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _digest(value):
    return isinstance(value, str) and len(value) == 64 and all(c in '0123456789abcdef' for c in value)


def _path(base, value, exists=False):
    _need(isinstance(value, str) and value and not Path(value).is_absolute(),
          'Iteration inputs must be project-relative paths')
    path = (base / value).resolve()
    _need(path.is_relative_to(base), 'Iteration path escapes project: ' + value)
    _need(not exists or path.is_file(), 'Missing iteration evidence: ' + value)
    return path


def _inventory(base, value):
    _need(isinstance(value, dict) and all(_digest(d) for d in value.values()),
          'Input inventory needs project-relative SHA256 entries')
    for rel in value:
        _path(base, rel)
    return value


def _fingerprint(inputs):
    return hashlib.sha256(json.dumps(inputs, sort_keys=True).encode()).hexdigest()


def iteration_plan(context, report_path):
    """Recommend repair previews only; changed inputs never inherit acceptance.

    Per-shot ``asset_inputs`` is an optional conservative authoring hint. Only
    raster-only changes scoped by it receive local ranges. Code, timing, sound,
    plan, bindings or unscoped art changes need the whole current timeline.
    """
    base = Path(context.base).resolve()
    path = Path(report_path)
    if path.is_absolute():
        path = path.resolve()
        _need(path.is_relative_to(base) and path.is_file(), 'Report must be an existing project-local file')
    else:
        path = _path(base, str(report_path), exists=True)
    old = json.loads(path.read_text())
    _need(old.get('kind') in ('draft', 'frames', 'preview', 'render'), 'Choose an actual B6 render/draft report')
    _need(old.get('ratio') == context.ratio, 'Iteration baseline ratio differs from current native plan')
    _need(_digest(old.get('fingerprint')), 'Baseline source fingerprint missing or malformed')
    current = _inventory(base, context.inputs)
    _need(context.fingerprint == _fingerprint(current), 'Current context fingerprint does not match its input inventory')
    if old.get('video'):
        video = _path(base, old['video'], exists=True)
        _need(_digest(old.get('video_sha256')) and _sha(video) == old['video_sha256'],
              'Baseline encoded media changed; retain the original report and video')
    duration = context.project['duration']
    _need(isinstance(duration, (int, float)) and not isinstance(duration, bool)
          and math.isfinite(duration) and duration > 0, 'Positive current timeline required')
    full = [{'start': 0.0, 'end': float(duration)}]
    result = {'schema': 'b6-iteration-plan/1', 'kind': 'iteration-plan',
              'baseline_report': path.relative_to(base).as_posix(), 'baseline_report_sha256': _sha(path),
              'baseline_fingerprint': old['fingerprint'], 'current_fingerprint': context.fingerprint,
              'ratio': context.ratio, 'delivery_ready': False, 'inherited_review_credit': False,
              'final_native_preview_required': True, 'final_review_required': 'all_35_subchecks_and_full_original_speed_av',
              'recommended_ranges': full, 'scope': 'full', 'changed_inputs': None,
              'reason': 'Baseline has no input inventory; conservatively recheck the full current timeline.'}
    if 'inputs' not in old:
        return result
    previous = _inventory(base, old['inputs'])
    _need(old['fingerprint'] == _fingerprint(previous), 'Baseline fingerprint does not match its recorded input inventory')
    changed = sorted(k for k in set(previous) | set(current) if previous.get(k) != current.get(k))
    result['changed_inputs'] = changed
    if not changed:
        result.update(scope='unchanged_inputs', recommended_ranges=[],
                      reason='Input bytes unchanged; reuse existing render for observation. No new review or user approval is inferred.')
        return result
    raster = {'.png', '.jpg', '.jpeg', '.webp', '.avif', '.bmp', '.tif', '.tiff'}
    if any(Path(rel).suffix.lower() not in raster for rel in changed):
        result['reason'] = 'Code, audio, caption, binding, plan or other non-raster input changed; preview the full current timeline.'
        return result
    shots = context.plan.get('shots', [])
    scoped, spans = set(), []
    for shot in shots:
        deps = shot.get('asset_inputs', [])
        _need(isinstance(deps, list) and all(isinstance(rel, str) for rel in deps), 'Shot asset_inputs must be relative path lists')
        for rel in deps:
            _path(base, rel)
        affected = set(changed) & set(deps)
        if affected:
            start, end = shot['start'], shot['end']
            _need(0 <= start < end <= duration, 'Invalid current shot range')
            scoped.update(affected)
            # Include both sides of the cut; this is a repair worklist, not proof
            # that shared scenery or implementation cannot affect other shots.
            spans.append((max(0., start - 2 / 30), min(float(duration), end + 2 / 30)))
    if scoped != set(changed):
        result['reason'] = 'Changed artwork has no complete declared per-shot scope; preview the full current timeline.'
        return result
    merged = []
    for start, end in sorted(spans):
        if merged and start <= merged[-1]['end']:
            merged[-1]['end'] = max(merged[-1]['end'], end)
        else:
            merged.append({'start': start, 'end': end})
    result.update(scope='declared_raster_dependencies', recommended_ranges=merged,
                  reason='Preview affected declared art shots and neighboring cut frames first; declarations do not prove other shots unchanged.')
    return result
