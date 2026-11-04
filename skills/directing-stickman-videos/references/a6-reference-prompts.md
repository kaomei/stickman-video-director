# A6 · Portable references and complete image prompts

Apply only after selecting [A6](amber-noir.md). This fixes reference delivery and prompt expansion; it does not change A1–A5, B, narration, proposal approval or payment boundaries.

## Read the files, not just their names

1. Resolve the [manifest](../assets/a6/reference-manifest.json) relative to this installed Skill. Run `python3 scripts/a6_reference_check.py`; then actually open the [apartment example](../assets/a6/apartment-style-example.png) and the relevant [face](../assets/a6/cafe-face-and-light.jpg)/[body](../assets/a6/shop-full-body.jpg) detail. Follow the provenance/acceptance limits in [source notes](../assets/a6/SOURCE-NOTES.md).
2. Separate three jobs: **style** (drawing, proportions, light), **identity** (this story's approved role, wardrobe, props), **first frame** (one shot's approved camera, location, incoming pose and contact). Bundled examples supply style; they do not approve a new cast or force the sample hoodie. A neutral environment reference has no cast. A multi-panel identity sheet is never the automatic video opening.
3. After the proposal is approved and image generation authorized, attach the actual readable files using the chosen tool's supported mechanism. A pathname mentioned in prose is not proof of attachment. Record asset/upload IDs when a provider supplies them. For tools without local-file input, use their supported upload step; never invent a hosted URL or ID. Use the approved new cast and shot first frame for subsequent continuity.
4. If capability is missing, name it precisely: image reading, file attachment, browser access, export or generation. Offer the complete prompts and existing files for a user-assisted route. Do not tell the user to recreate style references merely because the Agent cannot generate; do not claim a rendered film or aesthetic pass.

## Expand before delivery or submission

Every image prompt must independently describe **style, visible cast, world, composition and constraints**. Repeat complete approved descriptions when needed. Internal labels may help planning, but the outgoing prompt must not contain `[STYLE LOCK]`, `[CAST LOCK]`, `[WORLD LOCK]`, template variables, `TBD`, “same as above”, “same character” or “use previous prompt” instead of those descriptions. An explicit reference input complements the full text; it does not excuse empty fields.

Describe drawing grammar in plain English: matte-black round head, connected short black neck, small cream-white eye marks/compact mouth, simplified black hands and limbs, restrained cel shading, amber light and deep plum shadows, layered illustrated environment. Avoid glossy toy rendering, photoreal people, extra limbs or disconnected anatomy. Keep the story's own clothes, setting and aspect ratio. Titles/captions are added during finishing, not baked into reference illustrations.

Use a separate **short motion prompt** only after a shot-specific first frame exists: one action/reaction and motivated camera move, non-speaking actor, no narrator script. Do not paste a character-sheet prompt or a long full-film screenplay into Veo's motion field. The provider's actual frame/duration limits and [A6's independent Puck finishing](a6-finishing.md) still apply.

## Offline examples and preflight

Two deliberately different, ungenerated fixture stories demonstrate the contract:

- [Night library](../tests/fixtures/a6-night-library.plan.json): a teal-coated archivist, a library world reference, and a book-reaching first-frame composition.
- [Coastal station](../tests/fixtures/a6-coastal-station.plan.json): a navy-jacketed station keeper at a seaside platform. No cafe, sample hoodie or inherited opening.

These are complete **text fixtures**, not approved new-story designs or provider-tested outputs. Each uses a real bundled style image but no fabricated new identity/first-frame file. Generate and approve the current story's images before listing them as identity or first-frame inputs for video.

From the installed Skill directory:

```bash
python3 scripts/a6_reference_check.py
python3 scripts/a6_reference_check.py --plan tests/fixtures/a6-night-library.plan.json --show-prompts
python3 scripts/a6_reference_check.py --plan tests/fixtures/a6-coastal-station.plan.json
python3 -m unittest discover -s tests -p 'test_a6_references.py'
```

The JSON plan uses `schema: a6-reference-plan-v1` and a non-empty `images` list. Each image has a unique `id`, `purpose` (`character_reference`, `environment_reference` or `shot_first_frame`), five complete `image_prompt` fields and non-empty `reference_inputs`. Each input has a `role` (`style`, `identity`, `first_frame`): bundled inputs use `source: package` plus `asset_id`; current-project inputs use `source: project` plus a safe relative `path`. `--project-root` defaults to the plan's folder. Project image inputs must be real readable PNG/JPEG files. A package sample may be used as identity only when the user explicitly chooses that sample character and the plan records `reuse_sample_identity: true`; a package example is not a new-story first frame.

Before production, replace fixture fiction with the approved current story. Preserve the exact approved wording/cast; passing JSON checks is not creative approval or permission to spend. The checker blocks missing/tampered assets, unreadable image headers, unsafe paths, empty fields, unresolved placeholders and inappropriate package-input roles. It does **not** judge drawing quality, verify actual provider attachments, guarantee anatomy or infer story fidelity. Inspect generated pictures and video separately before delivery.
