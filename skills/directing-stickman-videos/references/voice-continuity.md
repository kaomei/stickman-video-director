# Shared voice continuity — all visual styles

This is the common voice contract for Style 1 Light/Dark, Style 2A, Style 2B and Style 3, plus Style 4 Cozy Storytelling and Style 6 History Stickman. Voice identity belongs to the video, not to a visual style or a clip. Different videos may choose different voices; every clip of one video must use the same complete approved voice profile. Do not force every project into the tested male profile.

## Choose once in Phase A

Honor the user's voice choice. If unspecified, propose one suitable voice for approval rather than adding another mandatory setup question. Describe perceived gender/age, accent, timbre, pitch/register, resonance, texture (including breathiness/rasp), delivery/intonation, steady pace, and recording character. Name these in ordinary language, not a list of vague adjectives such as "warm, energetic, same narrator". Summarize the profile in the user's language. Resolve all attributes before producing prompts; no placeholders in production output.

For example, a male choice can become adult, General American, warm clean baritone, medium-low pitch, gentle chest resonance, no rasp/breathiness, calm conversational delivery, restrained pitch variation, steady pace, close dry studio recording. A bright female choice can instead become adult, General American, clear warm mid-high voice, gentle forward resonance, no rasp/breathiness, lively conversational delivery with controlled pitch variation, steady pace, close dry studio recording. Older, youthful or other requested voices need their own internally coherent profile; they do not inherit male/baritone traits. Alternative profiles are design examples, not independently provider-tested voices.

## Freeze once in Phase B

Write one self-contained English voice block from the approved profile and copy it **verbatim** into every standalone clip prompt, including clip 1. Never abbreviate it to "same narrator", "continue the voice from clip 1", an ellipsis or a speaker label alone. Independent prompts must carry their own complete voice instructions.

The following complete male block was accepted by the user after a three-clip Flow listening comparison. Reuse it unchanged when its attributes match the approved choice:

```text
One off-screen adult male narrator throughout. General American accent, warm clean baritone, medium-low pitch, gentle chest resonance, no raspiness or breathiness. Calm conversational delivery, restrained pitch variation, steady speaking pace, and close, dry studio sound. Keep the same vocal timbre, register, accent, pace, and recording quality throughout. Emotional progression belongs to the visuals and music; do not change the narrator's voice or switch to character dialogue.
```

For a different approved voice, compose its own complete block using the same identity/pitch/texture/delivery/recording fields, then freeze that block. Do not append contradictory attributes such as "bright high-pitched youthful voice" to a low baritone or "now shout dramatically" to restrained conversational narration.

## Separate voice, performance and music

- Keep the narrator off-screen and narration audio-only unless the user explicitly approves another arrangement. A change in character gender, age, scene, costume, lighting or visual style does not recast the narrator. No spontaneous lip-synced character dialogue, added speakers or grunts presented as new spoken lines.
- Put escalation, anxiety, triumph, deadpan reaction and cinematic intensity in action, editing, music and SFX. Do not rewrite the narrator's register, timbre, texture, accent, pacing or recording treatment by scene. Natural sentence emphasis and pauses may vary within the frozen delivery, without adopting a new character voice.
- Keep the voice close and dry even in caves or large halls; location reverb belongs to environmental SFX unless another recording treatment was approved. Preserve voice-first mixing. Music/SFX may follow their own approved arc; they do not override this voice contract. Style 3's primitive-percussion or reaction-pause rules change music/timing, not the frozen voice.
- Shorten excessive VO before changing the approved pace to squeeze it into a clip. A global voice change requires a revised Phase A and approval, followed by replacing the block in **all** clip prompts, not just one.
- For explicitly approved multi-speaker dialogue, freeze a separate complete profile for each recurring speaker and keep line-to-speaker assignments explicit. Repeat each appearing speaker's full profile in every relevant clip; identity stays consistent per speaker, rather than forcing all characters to sound alike. Do not add multi-speaker dialogue unrequested. For an explicitly silent video, omit speech instead of inserting a default narrator.

## Check and retest

Before delivery, compare all prompt voice blocks for exact equality (or per-speaker equality for approved dialogue). Check other prompt sentences for conflicting voice directions, confirm exact approved spoken lines, and keep speech-bubble/subtitle bans separate from the voice profile.

When generation is authorized, compare the actual clips by listening: perceived speaker identity, timbre, register, accent, pace, texture and recording sound. Successful generation or screenshots do not prove audio consistency. If clips sound like different people, first inspect missing/abbreviated/contradictory voice wording. Retest a voice-only change with story, visuals, dialogue, music and generation settings held fixed; leave the baseline available for comparison. Do not dismiss a prompt problem as unavoidable model behavior before this check. Further paid retries need the user's authorization.

The Style 2A Hope test on 2026-10-12 used three independent 10-second Omni 1.1 Flash generations. Only this voice block was changed; the user reported that the new clips sounded like one person and requested the shared rule. This is sample-specific user listening acceptance, not a universal guarantee. Other voice profiles and styles have not had separate provider-backed audio comparisons. Apply the shared instruction contract to all styles as requested while keeping that evidence boundary explicit.

Voice/audio references, if available, and one continuous external VO track are optional further controls when prompt-first refinement is insufficient or the user requests exact matching. They are not mandatory for the normal workflow and do not replace checking the frozen voice block. Do not claim that a reference was used when none was supplied.
