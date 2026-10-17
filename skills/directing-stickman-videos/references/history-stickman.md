# Style 6 — History Stickman

## Fixed style, swappable era

Preserve the drawing grammar across every era; change only the era pack. History Stickman is polished 2D cel-shaded cartoon animation: thick clean black outlines, smooth white filled round heads, simple black oval eyes with expressive brows and mouths, no nose, and thin stick limbs under historical costume. Metal, cloth and leather get soft gradient shading and small glossy highlights. Landscapes and architecture are cleaner and more painterly than the figures. No paper texture (that belongs to Style 3), no photorealistic skin, no glossy 3D characters, no modern studio UI. Do not apply Style 1's hollow-head/no-face/no-clothes contract here.

Limbs: thin black stick limbs, with exactly two arms and two legs per figure, one current pose per limb. Costume pieces (greaves, boots, bracers) may cover limbs, but do not alternate between black and white limbs inside one story. Horses and large props may be drawn more naturalistically than the figures; keep their outline weight consistent with the figures.

Camera grammar: wide establishing shots of massed crowds, blurred foreground helmets/heads for depth, low-angle hero shots, over-the-shoulder views and clear collision or crossing shots. Keep screen direction stable.

## Era packs

An era pack supplies wardrobe by role, architecture and setting, palette in ordinary color words, signature props, banner/shield motifs and music direction. The drawing grammar above never changes. Rome is the first complete pack. For any other era (Greece, Egypt, Vikings, medieval Europe, Mongol, samurai, Ottoman, etc.) that has no pack yet, draft a compact era pack in Phase A using the template below and get it approved with the proposal; do not silently borrow Rome's costume or palette.

### Era pack template

- **Era and place:** period, region, and what the story needs from it.
- **Roles and wardrobe:** one line per role (common soldier, officer, leader, civilian, opposing group), silhouette plus the one recognizable accessory.
- **Setting library:** 3–5 locations with landmark details.
- **Palette:** 4–6 ordinary color names and what they signal.
- **Props and symbols:** shields, banners, tools, vehicles. Symbols must be icon-only, with no letters.
- **Music direction:** instrumentation that fits the era without mandatory piano.
- **Accuracy boundary:** what is stylized, and which facts the VO must not distort.

### Pack: Rome

- **Era and place:** Roman Republic/Empire, Mediterranean landscape.
- **Roman soldiers:** bronze-gold helmet with black horsehair crest, grey chainmail, red tunic and pteruges skirt, large red shield with a gold winged emblem and metal boss, short sword. Marching ranks may show blank white faces with a simple mouth line.
- **Officers and centurions:** the same kit with a red crest; commanders add a red cape and a gold cuirass, and may ride a white or brown horse.
- **Civilians (Senate, Forum, markets):** extend the grammar with tunics and togas in cream, deep red and gold trim, one accessory each such as a scroll, wreath, coin pouch or amphora. Treat these as a pack extension to be confirmed by a first generation test.
- **Opposing tribes:** long wavy brown or blond hair, beards or mustaches, plaid trousers, green/blue/yellow tunics, round-oval shields with colorful spiral patterns.
- **Settings:** rolling grass hills with cypress trees and rocks, a river valley, a hill fort with wooden watchtowers, a dusty battle plain, plus Forum, Senate, arena, villa, market and harbor settings as the story requires.
- **Palette:** Roman red, bronze gold, steel grey, grass green, sky blue, earthy tan. Dust, smoke and warm sunlight as atmosphere.
- **Props and symbols:** laurel-wreath banner on a red field, spears and javelins, winged-thunderbolt shield emblem, battle standards.
- **Music direction:** low war drums, brass, strings and choir for epic scenes; lighter plucked strings and woodwinds for civic or comic scenes. Do not inherit mandatory optimistic piano.
- **Accuracy boundary:** stylized costume and heads; individual helmets, armor and banners are simplified. Do not present invented scenes, dialogue or numbers as historical record.

## Cast cards

Cast to fit the story. In Phase A provide a compact cast card for each named role: role and age range, head/body proportions, hair, beard or mustache, brows/eyes, costume silhouette, helmet or headwear, and one recognizable accessory. Give recurring characters at least two visible non-color differences. Keep the cast as small as the story needs; for crowds describe the group once ("ranks of identical legionaries") and state which individuals are named. Within one story freeze each card and repeat its FULL description in every standalone prompt where that character appears; never use "the same general" or an ellipsis as an identity lock.

## Story and tone

Choose tone per story: serious epic is the default; comedy, satire, motivational and gentle treatments are allowed when requested. Suitable stories include history explainers, rise-and-fall arcs, daily life, strategy and leadership lessons, and modern analogies in historical dress.

- For factual explainers keep the source's names, dates and claims; do not invent quotations, statistics or battle details.
- For satire or analogy say in Phase A that the scenes are fictional.
- For violence keep it non-graphic: no blood, wounds or gore; show clashes through shields, dust, impact and reaction.
- Use the generic five-stage engine for explainers. For narrative shorts use setup → escalation → turning point; do not force a discussion question onto a dramatic or comic ending unless the user wants one.

## Continuity and generation

Phase A includes the era pack (or confirmation of an existing one), cast cards, location layout, exact English VO with translation, music/SFX and named opening/ending states. Phase B repeats the full drawing-style anchor, the visible cast cards, the era palette and the layout in every prompt. Apply `voice-continuity.md`: repeat the complete approved voice block verbatim in every clip, independently of music or cast. Narration is audio-only; no lip-sync unless approved.

Crowds are the main drift risk. Keep named characters few and in the foreground, describe background ranks as uniform repeated figures, and forbid fused heads, duplicate limbs and morphing shields. Track prop ownership, such as who holds the banner, sword or spear, and avoid spawning or teleporting objects. Reuse approved character images and prior ending frames as references when the interface supports it.

Generation, paid retries and publication require separate user authorization. Start with a small test and stop to report material identity or action failures. History Stickman has not been provider-tested beyond the reference frames the style was derived from; do not claim guaranteed character, crowd or audio matching.

## Prompt assembly

Each prompt includes: duration/ratio → full drawing-style anchor → era palette and setting → full cast cards for visible roles → layout and opening state → timed actions and prop transfers → exact quoted English VO → verbatim voice/music lock and timed SFX → ending state → negatives.

Drawing-style anchor (repeat verbatim):

```text
Polished 2D cel-shaded cartoon animation with thick clean black outlines and soft metallic shading. Stick-figure characters with smooth white filled round heads, simple black oval eyes, expressive brows and mouths, no nose, and thin black stick limbs, in the described costume. Exactly two arms and two legs, each shown only in its current pose. Clean, sunlit, painterly landscapes.
```

Negatives (compact form for prompts): `NO VISIBLE TEXT, LETTERS, NUMBERS, SUBTITLES, LOGOS OR WATERMARKS (blank paper or abstract brush strokes only), NO SPEECH BUBBLES, NO BLOOD OR GORE, NO PHOTOREALISTIC FACES, NO 3D CGI, NO PAPER TEXTURE, NO EXTRA LIMBS, NO FUSED OR DUPLICATE HEADS, NO COSTUME CHANGES, NO EXTRA CHARACTERS.`

Prompt length: keep every standalone prompt under 3,600 characters (including the full anchor, cast cards, voice block, music and negatives). Compress cast cards and beats, not the verbatim anchor, voice block or negatives. Do not forbid the cartoon faces, hair, beards or costume that define this style. Name colors naturally; never use technical color notation.

## Review checklist

- Source meaning retained; fiction is not mislabeled as history.
- The correct era pack is used or an approved new pack is drafted; no leakage from another era.
- Drawing grammar matches: white filled heads, thick outlines, cel shading, black stick limbs, no paper texture.
- Every recurring role has the same complete anchor across clips.
- Crowds are described as uniform ranks; named characters are few.
- Prop ownership and layout remain coherent; no stray text on shields or banners.
- Violence is non-graphic.
- Adjacent shots match or have an explicitly planned time jump.
- The full voice profile is identical across clips and separate from the era score.
- Voice, crowd and reference limitations are disclosed, not advertised as guarantees.
