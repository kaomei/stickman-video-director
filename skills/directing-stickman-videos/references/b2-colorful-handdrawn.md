# B2 · Colorful Hand-Drawn / 彩色手绘风

Read after Autopilot and its shared production QA. This is an independent local illustration-and-micro-animation style, not B1 with a color filter, A6 or Flow video generation. A file/terminal-capable agent can author the scenes and render them with the bundled runtime. If a particular job needs an unavailable tool, explain the specific gap rather than substituting a different style.

Inspect the [approved visual board](../assets/b2/approved-style-board.jpg) when authoring a new B2 story; [provenance](../assets/b2/approved-style-board.json) records its accepted source. Use its drawing grammar, palette and caption treatment, not its phone plot or exact compositions as a mandatory template.

## Resolved defaults

- Warm paper, irregular fine ink contours, muted but varied colored props and recognizable hand-drawn environments. Keep spatial depth simple and graphic, with useful negative space. Avoid a sterile dashboard, glossy 3D or a black-and-white B1 grid.
- Ordinary round-headed stickmen, sparse dot eyes and a short line mouth. Let pose, gaze, expression and story context provide identity; do not impose one costume, mascot or exaggerated anatomical recipe. Other simplified illustrated figures and person-free prop/diagram shots are welcome where the meaning needs them. Maintain the approved cast within a film, not across every unrelated story.
- Handwritten scene headings; readable sans-serif captions in dark ink on a compact ivory paper label. Use short semantic phrases, not mechanical word-count slicing. Default caption size is 40 at a 1280-wide design plane. No karaoke, flashing all-caps or keyword coloring unless requested. Keep headings and labels out of the caption safe area.
- English narration and native Google Gemini **Fola**, one continuous generation for a short film, with voice-direction/style fields empty and no speed changes. User choice overrides these defaults. Record the actual available model ID; the development test used `gemini-3.8-flash-tts`, not a promise of universal access. Browser generation is valid; an API key or paid plan is not inherently required. Verify account access/quota rather than promising a service is always free or registration-free.
- Original restrained action SFX below the narration; background music optional. No creator watermark by default. Do not embed a personal handle into the workflow.

## Scene and motion decisions

Plan from the complete voice recording and actual pauses. Favor specific everyday action, amusing visual contradictions, explanatory object diagrams and a concrete payoff. This style suits habits, attention, everyday psychology and relatable explainers; these are examples, not required subject matter. Avoid unsupported psychology labels or medical claims.

Keep the drawing language consistent, not the set. For a new unrelated story, choose its setting, spatial layout, character staging and camera viewpoints from the script rather than defaulting to the approved room/door/clock and a front-facing standing figure. When recent films are available, compare their opening and dominant compositions before authoring: a new topic or different props in the same room is not sufficient visual variety. Story-relevant workplaces, transit, shops, outdoors, object closeups and illustrative diagrams are options, not a location quota. A naturally indoor story may remain indoors, but design its own space and vary meaningful viewpoints. Do not add arbitrary location changes or excessive character motion to disguise a repeated set.

Before drawing a new story, record a short scene map in its shot ledger: narrative purpose, location/layout, viewpoint, character staging (or person-free subject), and the recent composition it deliberately differs from. Compare both the opening and the dominant body/ending composition. If the new story still reads as the same room and standing presenter with substituted props, redesign that staging before rendering. A new heading, recolor, mirrored background or tighter crop of the same presenter is not a new environment. Reusing a setting within one story for a motivated search, return or payoff is valid; preserve its spatial and prop continuity. Include this comparison in sample QA, not just the written plan.

Characters need not walk, wave or articulate constantly. Use stable readable poses with intentional gaze and small reactions; excessive limb movement is not polish. Let meaningful changes in scene, focal prop, information and viewpoint carry rhythm. Meet B's shared 2.5-second principal-picture progression floor without introducing irrelevant fidgeting or merely changing subtitles.

Maintain physical contact and object ownership through every cut. A hand holding a phone/key must actually touch it; do not animate an item through fingers or a tabletop. Avoid isolated thin-line arms as a shortcut for closeups. Choose a person-free object shot or a contextual composition when anatomy adds no information. A changed viewpoint is valid; an object mysteriously teleporting is not.

Author new story-specific layered PNGs from editable drawing code or an available image tool when appropriate. Do not paste the same presenter/phone composition under unrelated speech. Retain source artwork, semantic-event ledger and layer coordinates so local fixes do not force whole-film regeneration. A flat bitmap is not an automatically articulated character.

## Local execution and sample gate

Use `version: 1, style: "B2"` and the shared [runtime manifest](autopilot-runtime.md). Author B2 image layers rather than the B1 pose atlas. Set `font` and `captionFont` when matching an approved font; the bundled Caveat/Noto Sans provide portable fallbacks. Recompose for the chosen aspect ratio; 16:9 is an example, not a forced format.

Keep projects outside the installed skill. Save script, original continuous voice, actual alignment, illustration source, layered assets, project manifest and checkpoint. Run doctor, scoped validation and preview through the bundled runtime. Deliver the requested 20–30-second acceptance sample with picture, narration, semantic captions and action SFX; inspect encoded frames, contact, pacing and voice mix. Record technical checks separately from listening/user acceptance. Do not run `approve`, start the remaining film, change README, publish or upload until authorized. Preserve previously accepted narration and assets by fingerprint when revising locally.
