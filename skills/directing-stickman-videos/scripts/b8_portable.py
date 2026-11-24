#!/usr/bin/env python3
"""Bundle the B8 local Python runtime and copy complete, verifiable projects.

These are integrity/portability operations. They neither generate media nor infer
visual quality, listening completion or user approval. Python/FFmpeg remain host
dependencies; no installer or network operation is performed here.
"""
import datetime
import hashlib
import html
import json
import os
import pathlib
import shutil
import tempfile
from urllib.parse import quote

ROOT = pathlib.Path(__file__).resolve().parents[1]
RUNTIME_MODULES = ('b8_workflow.py', 'b8_scene.py', 'b8_drawing_jobs.py',
                   'b8_visual_review.py', 'b8_captions.py', 'b8_portable.py')
FONT_FILES = ('NotoSans.ttf', 'OFL-NotoSans.txt')
RUNTIME_MANIFEST = 'runtime-manifest.json'

RUNNER = '''#!/usr/bin/env python3
"""Project-local B8 entry point. No installed Skill or original project required."""
import os
import pathlib
import sys

runtime = pathlib.Path(__file__).resolve().parent
project = runtime.parent
sys.path.insert(0, str(runtime / 'scripts'))
os.environ['B8_RUNTIME_ROOT'] = str(runtime)
import b8_workflow as workflow
workflow.ROOT = runtime

args = sys.argv[1:]
if args and args[0] not in ('help', 'init', 'demo', '-h', '--help'):
    # Resolve an explicit PROJECT from the caller's directory before setting a
    # predictable project working directory for relative output/review options.
    if len(args) > 1 and not args[1].startswith('-'):
        value = pathlib.Path(args[1]).resolve()
        args[1] = str(value)
        project = value if value.is_dir() else value.parent
    elif args[0] != 'doctor':
        args.insert(1, str(project / 'project.json'))
workflow.REFERENCE = project / 'references' / 'b8'
os.chdir(project)
sys.argv = [str(runtime / 'run.py')] + args
try:
    status = workflow.main()
except (ValueError, OSError, KeyError, TypeError) as exc:
    print(str(exc), file=sys.stderr)
    sys.exit(2)
sys.exit(status or 0)
'''


def _now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def sha_file(path):
    digest = hashlib.sha256()
    with pathlib.Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def _read(path):
    return json.loads(pathlib.Path(path).read_text(encoding='utf-8'))


def _write(path, value):
    pathlib.Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def _project(value):
    value = pathlib.Path(value).resolve()
    filename = value / 'project.json' if value.is_dir() else value
    data = _read(filename)
    if data.get('style') != 'B8' or data.get('schema_version') != 1:
        raise ValueError('Expected a B8 schema_version 1 project')
    return filename, data


def _local(base, value, label='path'):
    if not isinstance(value, str) or not value:
        raise ValueError(label + ': a contained relative path is required')
    path = pathlib.Path(value)
    if path.is_absolute() or '..' in path.parts:
        raise ValueError(label + ': external/parent paths are not portable: ' + value)
    base = pathlib.Path(base).resolve()
    result = base / path
    # Reject even internal symlinks: the deliverable contains real, regular files.
    cursor = base
    for part in path.parts:
        cursor = cursor / part
        if cursor.is_symlink():
            raise ValueError(label + ': symlink is not a bundled file: ' + value)
    if not result.resolve().is_relative_to(base):
        raise ValueError(label + ': path escapes project: ' + value)
    return result


def _regular_files(base):
    base = pathlib.Path(base).resolve()
    files = []
    for current, dirs, names in os.walk(base, followlinks=False):
        folder = pathlib.Path(current)
        for name in sorted(dirs + names):
            item = folder / name
            if item.is_symlink():
                raise ValueError('Project contains a symlink: ' + str(item.relative_to(base)))
            if item.is_file():
                files.append(item)
            elif not item.is_dir():
                raise ValueError('Project contains a non-regular file: ' + str(item.relative_to(base)))
    return sorted(files)


def _verify_references(project):
    """Reference media are already copied by init; do not duplicate the pack."""
    folder = _local(project, 'references/b8', 'reference pack')
    filename = _local(folder, 'reference-manifest.json', 'reference manifest')
    manifest = _read(filename)
    records = manifest.get('files')
    if not isinstance(records, list) or not records:
        raise ValueError('Reference manifest has no hashed baseline files')
    result = []
    for item in records:
        path = _local(folder, item['path'], 'baseline reference')
        if not path.is_file() or sha_file(path) != item.get('sha256'):
            raise ValueError('Missing/changed approved baseline reference: ' + item['path'])
        result.append({'path': str(path.relative_to(project)), 'sha256': item['sha256']})
    result.append({'path': str(filename.relative_to(project)), 'sha256': sha_file(filename)})
    return result


def install_runtime(project_dir, source_root=None):
    """Create PROJECT/b8 once, using only existing local modules/fonts/baseline.

    source_root is the installed/staged Skill root, or a previous project/b8 root.
    Copies source bytes, fixed requirements and font license without installing
    anything. The future b8_captions module is deliberately part of the closure.
    """
    filename, unused = _project(project_dir)
    project = filename.parent
    source = pathlib.Path(source_root).resolve() if source_root is not None else ROOT
    destination = project / 'b8'
    if destination.exists() or destination.is_symlink():
        raise ValueError('B8 runtime exists; preserve it rather than overwriting')
    if source == project or source.is_relative_to(destination):
        raise ValueError('Runtime source cannot be the destination project/runtime')
    references = _verify_references(project)
    inputs = []
    for name in RUNTIME_MODULES:
        path = _local(source, 'scripts/' + name, 'runtime module')
        if not path.is_file():
            raise ValueError('Required B8 runtime module missing: ' + name)
        inputs.append((path, 'scripts/' + name, 'runtime module'))
    requirements = source / 'scripts/requirements-b8.txt'
    if not requirements.is_file():
        requirements = source / 'requirements.txt'
    if not requirements.is_file() or requirements.is_symlink():
        raise ValueError('Fixed B8 requirements file is missing')
    inputs.append((requirements, 'requirements.txt', 'pinned Python dependencies'))
    for name in FONT_FILES:
        path = _local(project, 'assets/fonts/' + name, 'project font')
        if not path.is_file():
            raise ValueError('Required project font/license missing: ' + name)
        inputs.append((path, 'assets/fonts/' + name, 'local board font/license'))
    temp = pathlib.Path(tempfile.mkdtemp(prefix='.b8-runtime-', dir=project))
    try:
        records = []
        for original, relative, role in inputs:
            target = temp / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(original, target)
            digest = sha_file(target)
            if digest != sha_file(original):
                raise ValueError('Runtime copy integrity failure: ' + relative)
            records.append({'path': relative, 'sha256': digest, 'role': role})
        (temp / 'run.py').write_text(RUNNER, encoding='utf-8')
        records.append({'path': 'run.py', 'sha256': sha_file(temp / 'run.py'), 'role': 'project entry point'})
        manifest = {'schema_version': 1, 'kind': 'b8_project_runtime', 'created_at': _now(),
                    'project_root': '..', 'reference_root': '../references/b8',
                    'files': records, 'project_references': references,
                    'host_dependencies': ['Python >=3.9', 'packages pinned in requirements.txt',
                                          'FFmpeg/FFprobe with libx264'],
                    'optional_not_bundled': ['Midas demonstration replay assets'],
                    'network_calls': 0,
                    'scope': 'Local execution closure and byte integrity; not visual/listening/user approval.'}
        _write(temp / RUNTIME_MANIFEST, manifest)
        temp.rename(destination)
    except BaseException:
        shutil.rmtree(temp, ignore_errors=True)
        raise
    return {'runtime': str(destination), 'runner': str(destination / 'run.py'),
            'manifest': str(destination / RUNTIME_MANIFEST), 'files': len(records), 'network_calls': 0}


def verify_runtime(project_dir):
    """Read-only verify local execution/reference bytes, without importing them."""
    errors = []
    try:
        filename, unused = _project(project_dir)
        project = filename.parent
        runtime = _local(project, 'b8', 'runtime')
        manifest_file = _local(runtime, RUNTIME_MANIFEST, 'runtime manifest')
        manifest = _read(manifest_file)
        if manifest.get('kind') != 'b8_project_runtime' or manifest.get('schema_version') != 1:
            errors.append('Invalid B8 runtime manifest')
        records = manifest.get('files', [])
        expected = {'scripts/' + name for name in RUNTIME_MODULES} | {'run.py', 'requirements.txt'} | {'assets/fonts/' + name for name in FONT_FILES}
        actual = {item.get('path') for item in records}
        if not expected.issubset(actual):
            errors.append('Runtime dependency closure incomplete: ' + ', '.join(sorted(expected - actual)))
        for item in records:
            path = _local(runtime, item['path'], 'runtime file')
            if not path.is_file() or sha_file(path) != item.get('sha256'):
                errors.append('Missing/changed runtime file: ' + item['path'])
        if manifest.get('project_root') != '..' or manifest.get('reference_root') != '../references/b8':
            errors.append('Runtime project/reference roots must remain project-local')
        references = _verify_references(project)
        if references != manifest.get('project_references'):
            errors.append('Runtime approved-baseline manifest changed')
    except (OSError, ValueError, KeyError, TypeError) as exc:
        errors.append(str(exc))
    return {'ok': not errors, 'errors': errors,
            'runtime': str(pathlib.Path(project_dir).resolve().parent / 'b8') if pathlib.Path(project_dir).suffix == '.json' else str(pathlib.Path(project_dir).resolve() / 'b8'),
            'manifest': RUNTIME_MANIFEST, 'network_calls': 0,
            'scope': 'Bundled bytes and dependency paths only; no aesthetic or listening judgment.'}


def _audit_project(filename, data):
    project = filename.parent
    dependencies = []
    def add(value, label, expected=None):
        path = _local(project, value, label)
        if not path.is_file():
            raise ValueError(label + ': missing bundled input: ' + value)
        actual = sha_file(path)
        if expected is not None and actual != expected:
            raise ValueError(label + ': bundled input hash mismatch: ' + value)
        dependencies.append({'path': value, 'sha256': actual, 'role': label})
    for aid, asset in data.get('assets', {}).items():
        if not asset.get('sha256'):
            raise ValueError('Asset SHA256 required: ' + aid)
        add(asset['path'], 'asset ' + aid, asset['sha256'])
    for value in data.get('drawing_family', {}).get('references', []):
        add(value, 'drawing-family reference')
    for character in data.get('characters', []):
        for value in character.get('references', []):
            add(value, 'character reference ' + str(character.get('id')))
    for key in ('narration', 'audio_master'):
        if data.get(key):
            media = data[key]
            if not media.get('sha256'):
                raise ValueError(key + ': SHA256 required')
            add(media['path'], key, media['sha256'])
    caption = data.get('caption_style', {})
    if caption.get('font'):
        if not caption.get('font_sha256'):
            raise ValueError('Caption font SHA256 required')
        add(caption['font'], 'caption font', caption['font_sha256'])
    if data.get('checkpoint'):
        add(data['checkpoint'], 'checkpoint')
    # Preserve all review/approval bytes. Their project-relative artifact paths
    # are real dependencies; old absolute diagnostic outputs are only metadata.
    historical = []
    def inspect(value, trail, origin):
        if isinstance(value, dict):
            if 'path' in value and 'sha256' in value and isinstance(value.get('path'), str):
                add(value['path'], 'recorded artifact in ' + origin, value['sha256'])
            for key, child in value.items():
                inspect(child, trail + [str(key)], origin)
        elif isinstance(value, list):
            for i, child in enumerate(value):
                inspect(child, trail + [str(i)], origin)
        elif isinstance(value, str) and pathlib.Path(value).is_absolute():
            historical.append({'file': origin, 'field': '.'.join(trail), 'value': value,
                               'role': 'historical diagnostic/location text; not read as an input by the project runtime'})
    # Only workflow reports/checkpoint, not baseline provenance with paths rooted
    # in its own reference pack, are project-relative input records.
    checkpoint = data.get('checkpoint', 'checkpoint.json')
    for file in _regular_files(project):
        relative = str(file.relative_to(project))
        if file.suffix == '.json' and (relative == checkpoint or relative.startswith('outputs/')):
            try:
                inspect(_read(file), [], relative)
            except json.JSONDecodeError as exc:
                raise ValueError('Invalid project report JSON: ' + relative) from exc
    return dependencies, historical


def _selection(project, value, label):
    if value is None:
        return None
    path = pathlib.Path(value)
    if path.is_absolute():
        try:
            value = str(path.resolve().relative_to(project))
        except ValueError as exc:
            raise ValueError(label + ' must be inside the project') from exc
    file = _local(project, str(value), label)
    if not file.is_file():
        raise ValueError(label + ' does not exist: ' + str(value))
    return str(file.relative_to(project))


def deliver(project, output, film=None, review=None):
    """Copy a complete project once and write a relative-link handoff index.

    output must be a new folder outside the source project. All existing files,
    including plans, approval evidence and pending reports, retain their bytes.
    """
    filename, data = _project(project)
    base = filename.parent
    destination = pathlib.Path(output).absolute()
    if destination.is_symlink() or destination.exists():
        raise ValueError('Delivery folder exists; choose a new directory')
    destination = destination.resolve()
    if destination == base or destination.is_relative_to(base) or base.is_relative_to(destination):
        raise ValueError('Delivery cannot contain or be inside the source project')
    files = _regular_files(base)
    runtime_check = verify_runtime(base)
    if not runtime_check['ok']:
        raise ValueError('Project runtime is not self-contained: ' + '; '.join(runtime_check['errors']))
    inputs, historical = _audit_project(filename, data)
    film = _selection(base, film, 'film')
    review = _selection(base, review, 'review report')
    if film is not None and pathlib.Path(film).suffix.lower() != '.mp4':
        raise ValueError('Film link must select an existing project MP4')
    report = _read(base / review) if review is not None else {}
    if film is not None and review is not None:
        current_sha = sha_file(base / film)
        if not any(isinstance(item, dict) and item.get('path') == film and
                   item.get('sha256') == current_sha for item in report.get('artifacts', [])):
            raise ValueError('Selected review report must bind the selected film path and current SHA256')
    review_state = {'visual_review': report.get('visual_review', 'pending'),
                    'actual_listening': report.get('actual_listening', 'pending'),
                    'user_acceptance': report.get('user_acceptance', report.get('approval', 'pending'))}
    destination.parent.mkdir(parents=True, exist_ok=True)
    temp = pathlib.Path(tempfile.mkdtemp(prefix='.' + destination.name + '-building-', dir=destination.parent))
    try:
        copied = temp / 'project'
        copied.mkdir()
        records = []
        for source in files:
            relative = source.relative_to(base)
            target = copied / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            before = sha_file(source)
            shutil.copy2(source, target)
            after = sha_file(target)
            if before != after or before != sha_file(source):
                raise ValueError('Project changed during delivery copy: ' + str(relative))
            records.append({'path': 'project/' + str(relative), 'source_path': str(relative),
                            'source_sha256': before, 'sha256': after, 'bytes': target.stat().st_size})
        copied_check = verify_runtime(copied)
        if not copied_check['ok']:
            raise ValueError('Copied runtime integrity failed: ' + '; '.join(copied_check['errors']))
        _audit_project(copied / filename.name, data)
        manifest = {'schema_version': 1, 'kind': 'b8_portable_delivery', 'created_at': _now(),
                    'title': data.get('title', ''), 'project': 'project/' + filename.name,
                    'runner': 'project/b8/run.py', 'project_folder': 'project/',
                    'film': 'project/' + film if film else None,
                    'review': 'project/' + review if review else None,
                    'review_status': review_state, 'files': records,
                    'input_dependencies': inputs, 'historical_locations': historical,
                    'external_media_dependencies': [], 'network_calls': 0,
                    'relocation_note': 'Historical exported absolute locations are preserved as evidence, never read as runtime inputs. After moving, export fresh drawing prompts from the project-relative plan before attaching references to a drawing tool.',
                    'scope': 'Complete byte-preserving project copy and local dependency verification. Existing review status is reported, not upgraded.',
                    'host_dependencies': ['Python >=3.9', 'packages pinned in project/b8/requirements.txt',
                                          'FFmpeg/FFprobe with libx264']}
        _write(temp / 'delivery-manifest.json', manifest)
        def link(path, label):
            return '<a href="' + quote(path, safe='/') + '">' + html.escape(label) + '</a>'
        links = [link('project/' + filename.name, '工程 project.json'), link('project/', '工程文件夹'),
                 link('project/b8/run.py', '本地运行入口'), link('delivery-manifest.json', '交付清单与 SHA256')]
        if film:
            links.insert(0, link('project/' + film, '影片 MP4'))
        if review:
            links.append(link('project/' + review, '审片报告'))
        video = '<video controls preload="metadata" src="' + quote('project/' + film, safe='/') + '"></video>' if film else '<p>未指定影片；此交付不生成新影片。</p>'
        title = html.escape(data.get('title') or 'B8 工程交付')
        status = html.escape(json.dumps(review_state, ensure_ascii=False))
        (temp / 'index.html').write_text('<!doctype html><html lang="zh"><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + '</title>'
            '<style>body{max-width:1000px;margin:40px auto;padding:0 24px;font:16px/1.7 system-ui;color:#35261c;background:#f7f0e4}'
            'a{color:#75501d}li{margin:9px 0}video{width:100%;max-height:70vh;background:#201b17}code{overflow-wrap:anywhere}</style>'
            '<h1>' + title + '</h1>' + video + '<ul>' + ''.join('<li>' + x + '</li>' for x in links) + '</ul>'
            '<p>审阅记录：<code>' + status + '</code></p><p>复制与哈希验证不代表视觉、听审或用户验收完成。'
            '工程可整体搬移；需要本机 Python、固定依赖与 FFmpeg。此过程没有联网或生成媒体。</p>'
            '<p>运行：<code>python3 project/b8/run.py doctor</code>；'
            '<code>python3 project/b8/run.py validate project</code></p></html>', encoding='utf-8')
        if destination.exists() or destination.is_symlink():
            raise ValueError('Delivery folder appeared during copy; refusing overwrite')
        temp.rename(destination)
    except BaseException:
        shutil.rmtree(temp, ignore_errors=True)
        raise
    return {'folder': str(destination), 'index': str(destination / 'index.html'),
            'manifest': str(destination / 'delivery-manifest.json'),
            'project': str(destination / 'project' / filename.name),
            'runner': str(destination / 'project/b8/run.py'),
            'film': str(destination / 'project' / film) if film else None,
            'review': str(destination / 'project' / review) if review else None,
            'review_status': review_state, 'files': len(records), 'network_calls': 0}
