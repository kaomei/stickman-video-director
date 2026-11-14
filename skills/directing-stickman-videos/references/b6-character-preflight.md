# B6 early character import check

Run this after painting/fitting new character packages and before spending time
on the full scene encode. It calls the existing trusted puppet validator; it
does not introduce an alternate rig or relax any sleeve, neck, limb or alpha rule.

```bash
python3 scripts/b6_character_preflight.py /absolute/new-project \
  --required-views /absolute/planned-views.json \
  --output /absolute/new-project/character-preflight.json
```

The optional planned-views file describes views actually needed by the shots:

```json
{"buyer": ["three_quarter"], "vendor": ["front", "side"]}
```

The check reports missing actors, missing/undeclared views, absent sprite files,
hash drift, fitted sleeve/cuff errors and painted neck disconnection early. For
each registered view it verifies the real rest-pose alpha composite and probes
the five approved actions at five phases using the same runtime. It reports
head-relative arm/leg stroke widths for subsequent reference comparison. Those
measurements are descriptive: B6 has no invented universal pixel-width cutoff.

Repair the named package/view rather than weakening the validator. A requested
turn needs separately painted and registered views. A continuous single painted
stroke remains supported; the import checker does not force a visible elbow.

For an integrated producer, call:

```python
report = preflight_project(project_dir, runtime_module=context.puppet_runtime,
                           project=context.project,
                           required_views={"buyer": ["three_quarter"]})
```

`technical_pass` covers only package import and these local probes. The rest
render has no scene occluders, prop targets or camera extremes. New handoffs,
motion continuity, final scene coverage, aesthetic style/light matching,
captions and audio still require their existing checks and actual final review.
Do not turn this preliminary diagnostic into an extra universal approval step
or call it final B6 acceptance.
