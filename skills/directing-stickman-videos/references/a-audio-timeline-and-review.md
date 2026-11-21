# Model Engine · Independent audio timeline and final listening

Use with the [A production contract](a-production-and-review.md) and the selected style's sound defaults. This is an A-only finishing contract; it does not change B execution, frozen character/drawing prompts, selected voices, accepted samples or authorization. Prompt-only delivery supplies the sound plan and generation/editing instructions; it must not claim that audio files were made or heard.

## Plan sound on the finished film, not on generation-job boundaries

Confirm speech/no speech, music, Foley/SFX, ambience and requested captions in the approved storyboard. Record intentionally omitted roles. For a finished film, make an independent final audio timeline: picture trims do not automatically trim every audio role. Preserve the requested final runtime and already accepted picture/audio. Reuse the existing sound brief, permissions, tools and assets; a missing audio tool, license or necessary authorization is a specific gap, not permission to substitute a provider or incur new costs.

| Role | Production and editing rule |
|---|---|
| BGM | Use a continuous full-film music master, or deliberately arranged cues with musically coherent transitions. Place it on the final timeline independently of picture cuts; do not concatenate each generated clip's different music. Choose approved entry/exit phrases, tempo and accents, allow intentional pauses, and finish the tail. Millisecond fades prevent clicks but cannot repair incompatible musical phrases, keys or beats. |
| Off-screen narration / VO | For a narrated finished film, default to an independently prepared complete narration master in the approved voice/language. When tool limits require chunks, join at semantic pauses and verify identity, complete wording and natural flow before editing picture against the assembled track. Preserve its fingerprint when wording is unchanged. Do not force complete sentences into the available scraps of a visual take. A no-narration brief stays unvoiced. |
| Character dialogue | Decide whether it is native synchronized speech or explicitly planned external dialogue. Keep exact lines, speaker assignments and complete utterances. Native speech and visible mouth performance remain bound; retain or retake that synchronized range as a unit. An external replacement cannot be declared lip-synced without checking the mouth timing. Off-screen VO must not silently become speaking-character dialogue. |
| Foley / SFX | Place cues at the retained action/contact time on the final timeline. Preserve useful clean source effects and tails; relocate or rebuild effects when source ranges change. Do not move a flattened source mix merely to move one impact. Avoid doubled native and replacement effects. |
| Ambience | Build an independent bed appropriate to each location, with deliberate transitions and handles across picture cuts. Preserve continuity within a location; a location change may justify a new bed. Reject accidental gaps, repeated ambience restarts or cut-off decay. |
| Music video / song-led work | The approved original song or authorized excerpt is the master clock. Record its exact source in/out; map picture actions and edit points to its audible beats, phrases and lyrical events. Never regenerate the song per visual clip or trim/restart it at each picture boundary. Keep the agreed song sequence and film runtime; a structural song edit needs approval when it changes the brief. Lyrics/captions remain project-specific, not a default for a whole style. |

An independent timeline does not require speech, music or sound on every frame. Planned silence and sound-led J/L cuts are valid; document their purpose. Layer selection and mix priority follow the story and style rather than a universal voice/music recipe.

## Track inventory and time mapping

Save an audio inventory beside the shot/source ledger before final assembly. For each used or deliberately omitted role record: cue/track ID, role and speaker where relevant, local path or provider asset ID, available hash, source/license/required credits, whether it is a clean stem or flattened mix, source in/out, final start/end, gain/fades and intentional mute/keep/replace decisions. Keep the approved master script, actual speech timings, music excerpt/phrase choices and action-linked SFX cue times. Do not invent isolated stems or clearance when only a combined file or an unverified source exists.

Map retained ranges explicitly, including transition overlaps and any speed changes:

| Source asset / retained in–out | Final start–end | Audio treatment | Cue / speech / mouth constraint |
|---|---|---|---|
| Actual source ID and measured times | Actual delivered timeline | Keep mapped native range, mute/rebuild, or use independent master | Contact time, complete utterance, song phrase, ambience transition or deliberate silence |

For an unretimed retained source range, `final_event = final_range_start + source_event - source_in`; account explicitly for retiming or overlapping edits. Recalculate the final cue map after picture changes instead of copying old source timestamps. A sound tail may cross a cut, while native visible speech must retain its verified audio/picture offset. Do not shorten words, speed speech, move a lip-bound line or add frozen picture merely to reach a nominal source duration.

Edit speech at actual semantic pauses: preserve phrases, names, verb/object relationships, numbers and units, with no omitted, repeated or reordered words and no overlapping lines. Recheck the complete approved wording after trims or joins. Align requested subtitles to the actual final speech track, not the unedited script, estimated reading speed or original generation timestamps. Break captions by meaning and real pauses within the chosen style's line count and safe area; verify adjacent cues remain semantically connected. Song lyrics follow the selected original performance if requested.

## Generation prompts and native speech

Separate instructions by audio role before submission. For silent-acting footage intended for external VO/music, request no generated speech or BGM as appropriate; keep only desired native Foley/ambience when the service can follow that request. This request is not proof of silence or stem isolation: inspect the returned audio and record what is actually present. Preserve frozen visual character/style blocks.

[A1–A5 voice continuity](voice-continuity.md) still owns their approved narrator/speaker identity. Repeat the full frozen voice block in each relevant video prompt **only when that clip is actually being asked to generate native speech**. Do not inject narration text or a narrator voice block into every video prompt when using an external VO master. Keep the approved external voice/profile in its own synthesis plan; do not assume an API supports descriptive controls. A6 retains its specific independent-voice contract; A7 gains no compulsory narrator. For A8, follow the approved story’s sound plan. An MV uses its own continuous music master, with effects aligned to the retained visual actions. Story timing may reference an external spoken cue without asking the video model to speak it.

For native dialogue, require the correct speaker, exact complete line, natural pauses and matched mouth motion. Keep that speech with its corresponding performance through trims. If an important line crosses the desired visual cut, retain the complete bound range, use a suitable verified J/L cut where the speaker is off-screen, or repair only that utterance/shot within scope. Do not cut syllables and then claim the original dialogue survived. Recheck subtitles and sync after every affected edit.

## Flattened mixed audio and repair limits

Generated BGM, speech, effects and ambience may arrive as one flattened track. Prompt wording, correlation, filters or source separation cannot guarantee clean, lossless stems. Separation may leave musical bleed, metallic speech, missing effects or altered transients; never present it as guaranteed isolation.

Choose a documented treatment based on the actual source: retain a complete usable synchronized range; mute the unwanted flattened mix and rebuild the required effects/ambience under independent VO/music; or attempt authorized separation, keeping the original and checking audible artifacts. Muting all native sound requires restoring story-critical cues; lowering the whole mix is not selective music removal. If essential dialogue or effects cannot be recovered cleanly, repair the affected scope or disclose the unresolved limit. Do not regenerate accepted picture or change voice/provider/song simply to hide an audio-edit problem.

## Review the actual final encoded file

Technical checks establish decodability, duration, streams, channel layout and useful level/peak diagnostics. They do not establish musical continuity, intelligible speech or a listening pass. A waveform, LUFS/peak meter, correlation score, transcript, screenshot, silent playback or analysis request alone is not evidence that the audio was heard.

For a new or changed finished mix, actually listen to the **complete final encoded delivery file at normal speed**, from its start through its ending tail, with picture for synchronization. Cover every assembled join and retained range. Check:

- Music phrases/beat continuity and intentional transitions; no per-clip music restarts, doubled music or accidental silence.
- Complete intelligible speech, stable speaker identity and natural joins; no missing/repeated words, cut consonants, overlapping lines or unexpected model speech. Check native mouth/audio binding and actual subtitle timing.
- Contacts, Foley, ambience changes, perspective and decay; no lost critical cue, doubled effect, misplaced impact or cut-off tail.
- Story-appropriate balances, unwanted distortion/clicks/clipping, audible artifacts from separation, and clean opening/ending. Use available listening conditions and state meaningful limits instead of promising unheard device coverage.

Record file path/hash or authorized browser asset identity, output version, reviewed interval, normal-speed listening method, reviewer/date, findings and repair result. Keep technical checks, actual listening, picture review and user acceptance as separate evidence. Use `pass`, `fail`, `not_checked` or `not_applicable` for each applicable role/check. A missing continuous-listening capability is `not_checked`, with the exact gap and smallest local review handoff; never relabel it `pass` because meters look good or `not_applicable` because no playback tool exists. An intentionally absent role may be `not_applicable` with its approved reason.

An explicit user confirmation remains valid for that exact accepted scope; do not reopen unchanged accepted samples or require duplicate external uploads/analysis. After an audio-only correction, retain the accepted picture and verify it was preserved, recheck affected cues/joins, and listen to the changed complete encoded mix before claiming a new listening pass. Disclose any required unperformed review. This contract adds no permission for uploads, paid generation, downloads, publication or global installation.
