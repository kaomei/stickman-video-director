# B · Bundled music, SFX and sound transitions

Use this library during the [B sound workflow](autopilot-sound-system.md), after spotting the story's actual sound needs. It contains **774 distinct sound effects/transitions, 31 full music tracks and 85 short musical stingers**, available offline with no account or paid call. The 774 comprise 730 SFX and 44 transitions: 14 recorded swish/erase sounds and 30 interface opening/closing/glitch transitions. The short stingers are counted separately, not as full background music or toward the SFX quota. The library contains original audio files, not just download links.

Start at the [bilingual listening index](../assets/b-audio-library/INDEX.md), [machine-readable catalog](../assets/b-audio-library/catalog.json) and [credits](../assets/b-audio-library/CREDITS.md). From the installed skill directory:

```sh
node scripts/audio-library.mjs recommend --style B6 --beat opening --limit 3
node scripts/audio-library.mjs recommend --style B6 --beat paper-handoff --limit 3
node scripts/audio-library.mjs recommend --style B4 --beat rain --limit 3
node scripts/audio-library.mjs search whoosh --limit 8
node scripts/audio-library.mjs list --kind music
node scripts/audio-library.mjs list --category paper-book --limit 6
node scripts/audio-library.mjs show bgm-sneaky-snitch
node scripts/audio-library.mjs export --ids bgm-sneaky-snitch,artisticdude-swishes-swish-1,kenney-rpg-book-place1 --out /path/to/new-film/audio
```

`export` copies only the selected recordings plus their source/license evidence, creates `audio-selection.json` with portable relative paths and hashes, and writes `CREDITS.md`. Use the exact IDs returned by search. A successful export requires neither a network connection nor npm dependencies. Existing different files are not overwritten. `verify` checks the installed library's metadata, fingerprints, evidence and minimum collection size; `verify --probe` additionally requires FFmpeg/ffprobe and decodes the audio. Verification is a library-maintainer/installation diagnostic, **not a new mandatory full-library scan for every film**. An unrelated unused file must not prevent exporting an intact selection.

## Installed selection workflow

1. Spot the visible action, environment, emotion and approved sound treatment. Keep approved voice/music intact.
2. Run `recommend --style B1…B9 --beat NAME`; it returns optional music/SFX candidates with actual matching reasons, license and file path. Start with `opening`, `reaction`, `prop-handoff`, `walk`, `transition`, `tension`, `warm`, `diagram`, `ambience`, `action` or `ending`. Specific shared beats include `paper-handoff`, `drinking`, `street`, `rain`, `forest`, `applause`, `phone`, `money`, `water`, `door`, `animal`, `horse`, `comic-cut` and `indoor-appliance`. Use these only when that action/place belongs in this story and era.
3. Refine within the installed library using `search`, `--category` or `--tag` for the actual material/place. A book close is not automatically a letter handoff; highway traffic is not quiet restaurant room tone. Audition the selected file at the intended level. Numeric takes and `misc` recordings have deliberately broad labels; do not invent a specific action from their number.
4. Export the selected IDs into the new project. Bind them to visible contacts or sustained environments through the chosen renderer's existing sound route below; retain the exported credits and disclose actual edits.

`catalog.selection_profiles` supplies style-specific selectors and optional shared beat selectors. Exact style/beat configuration wins; shared fallback is used only when that beat is absent. A deliberately `null` layer means no new sound is requested. `no_match`/`partial` reveals a genuine missing or unusable candidate; it never inserts a random available sound or blocks valid unrelated exports. Recommendations are candidates, not an automatic mix, artistic certification or an extra approval stage. Do not make the user search outside the installed collection for a common covered sound.

| Style | Starting direction |
|---|---|
| B1 · Minimal Line Art | Restrained information music; paper, soft prop contact and sparse diagram feedback. |
| B2 · Colorful Hand-Drawn | Warm daily-life music and material/environment sounds; transitions may remain quiet. |
| B3 · Retro TV | Light/retro context and sparse device switching. Digital UI sounds are stylized options, not authentic CRT recordings. |
| B4 · Survival Thriller | Tension or intentional silence; source-matched doors, weather, phone and environmental depth. No default comic bleeps. |
| B5 · Character Explainer | Light comic bed, visible physical contacts and selective bounce/squeak reactions. |
| B6 · Dynamic Meme | Playful scheming music; brisk prop, money, street and reaction sounds. No whoosh on every camera move. |
| B7 · Pixel Theater | Pixel/game music and device effects only when justified; real-world actions still need the right Foley. |
| B8 · Greek Mythology | Ancient-inspired/plucked or epic music; natural elements, footsteps and props. Not a historical-authenticity claim. |
| B9 · Live Sketch | Optional clean information music; sparse meaningful tap/completion/erase sounds. No continuous scratch on every stroke or scroll. |

## Select by story, then audition in context

| Need | Search/category | Direction |
|---|---|---|
| Playful Meme/comic scheming | music tags `meme`, `comedy`; Monkeys Spinning Monkeys, Sneaky Snitch, Fluffing a Duck | Choose one that fits the actual scene. Familiarity is not a substitute for timing. |
| Mystery, threat or action | Investigations, Classic Horror 1, Darkest Child, Decisions, Volatile Reaction | Preserve B4's quiet continuous bed and causal effects. Comic interface sounds are not default horror impacts. |
| Warm daily life / cafe | Morning, BossaBossa, Easy Lemon, Impact Moderato | Leave voice space; a warm soundtrack does not substitute for location sound. |
| Mythology / epic | Temple of the Manes, Teller of the Tales, Five Armies, Hitman | Match the scale and emotion. These are modern ancient-inspired scores, not period reconstructions. |
| Pixel / arcade | Bit Quest, 8bit Dungeon Boss, Ambler | Use the actual scene's musical need, not random retro bleeps. |
| Information / whiteboard | Cipher, Getting it Done, Easy Lemon | Keep music below voice and key information cues. |
| Loss | Heartbreaking | Do not impose sadness on every shot. |
| Prop contact, letter or money | `paper-book`, `paper-stationery`, `money`, `money-foley`, `cloth-foley` | Place the attack on visible contact. Match material, size and listener position. |
| Walking | `footstep`, `footsteps`, `footsteps-grass` plus material tags | Use actual foot plants, vary takes, avoid rapid repeated identical hits. |
| Fast pass or motivated whip | `whoosh`, `erase` | Use a proportionate short sound. Ordinary zooms/cuts need no automatic whoosh. |
| Diagrams, interface or whiteboard feedback | `ui-feedback`, `ui-transition` | Match the information event; do not put a beep on every word. |
| Kitchen, drinking, keys/locks, phones | `kitchen-foley`, `drinking-foley`, `keys-locks-door`, `phone-foley` | Check the actual object, era and contact; broad numeric takes need auditioning. |
| Comic reaction | `comedy-boing`, `comedy-squeak`, `comedy-whistle`, `comedy-horn`, `comedy-laughter` | One proportionate cue may suffice. Recorded laughter is not a default audience track. |
| Comic stop / punchline | `record-scratch`, `comedy-percussion` | Original licensed record scratch and rimshot/drum-roll cues; choose a motivated beat, not every cut. |
| Weather / nature / water | `weather-rain`, `weather-storm`, `nature-ambience`, `nature-stream`, `water-ambience` | Match space, weather and distance; audition loop seams. |
| Traffic / animal / crowd | `traffic-ambience`, `vehicle-passby`, `vehicle-engine`, `animal-cat`, `animal-dog`, `crowd-applause` | Distinguish beds from one-shot actions. Shouting is not neutral cafe chatter. |
| Horse / carriage scene | `horse-hoof-foley` | Hoof Foley only; match gait/surface and sync contacts. This is not a complete carriage wheel/wood/whinny suite. |
| Interior refrigerator hum | `indoor-appliance-ambience` | Drinks-fridge mechanical beds, not neutral quiet room tone or restaurant walla. |

Category/tags are retrieval hints based on the source and filename, not proof that an asset fits every listed style. Technical decoding does not certify artistic quality, listening on devices or final mix acceptance. Exact decoded-PCM duplicates, preview compilations, alternate encodings and macOS resource forks were excluded. Numbered takes count as distinct recordings, not distinct narrative concepts. No current popularity ranking was independently measured; do not advertise every file as a viral hit.

## Use with the chosen B renderer

Keep the approved VO untouched, export into the new project's directory, and bind selected IDs to the existing sound script's cue times. The library does **not** add new manifest aliases or runtime fields.

| Production path | Supported handoff |
|---|---|
| Shared B1–B4 renderer | Use the installed version's documented `music.path` and supported file-SFX fields in [runtime configuration](autopilot-runtime.md). Some older installs support file SFX only in B4. If the renderer lacks a needed stem/automation route, prepare a separate mixed master using the established finishing route. |
| B5/B8 prepared-master workflows | Mix selected files with the retained VO/stems into the required audio master; use the style's existing audio/voice timing contract. |
| B6/B7/B9 dedicated projects | Add exported files to the project's existing mixer/cue timeline and renderer. Keep style-specific contact, timing and sound acceptance rules. |

For a prepared master, follow the existing `voice.contains_sfx` handling only where that renderer documents it and omit duplicate added effects/music. Never assume that flag exists in every dedicated renderer. Preserve approved caption times and speech rate. Use music ducking/envelopes rather than speeding speech up or regenerating accepted narration. Start quietly, inspect transients and measure the encoded output; asset source levels are intentionally unnormalized. An original near-full-scale impact is not a safe gain recommendation for a multilayer mix.

The bundled library is a first lookup, not a quota. Use external legally cleared recordings or authorized generation when a story needs a sound that is absent or unsuitable; follow the existing [sourcing rules](music-sourcing-and-license.md). No new payment, upload, publication or voice-generation permission follows from installing this collection. A retains its existing contract.

## Licenses travel with the selected audio

- **Most SFX/transitions and all short stingers: CC0 1.0.** The catalog links each recording to its source page, any original pack license, and the full CC0 text. Attribution is optional; source acknowledgments are retained.
- **Some SFX: CC BY 3.0 or 4.0.** Preserve each item's specified credit/copyright notice, source, license and actual changes. The Blender Foundation bounce and Joe DeShon slide whistle, for example, have required attribution; do not assume all effects are CC0. `show` and exported `CREDITS.md` carry these requirements.
- **Music: CC BY 4.0.** Keep the title/author, source and license link in the finished video's description or accompanying credits, and disclose actual changes such as excerpts, fades, gain/ducking and synchronization with animation. Exported credits include the original attribution wording; finish the actual edit notice before delivery. Repository credits alone do not credit a later user's film.
- The audio keeps these licenses independently of the repository's code license. Commercial use, editing and redistribution are authorized by those licenses; they do not imply author endorsement or a guarantee against automated platform claims.

Each catalog item includes the original-byte SHA-256, duration, format, author, source URL, checked date, license grant, attribution requirement and local evidence paths. `catalog.evidence_files` fingerprints the retained snapshots/legal texts. HTML snapshots are stored as inert `.html.txt`, not executable webpages. Reuse these verified records for the same unchanged files and permitted use; recheck when the source file, license or intended use changes. Do not demand fresh online proof for every exported copy.

For final acceptance, compare the actually mixed files to the selection manifest, ensure required credits/edit notices are in the handoff, check audible sync and speech clarity, and retain the existing style review. A technical library pass never marks a new film approved.
