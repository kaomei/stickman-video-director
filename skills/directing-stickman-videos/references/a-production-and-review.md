# Model Engine production and review

Use this contract with the [unified A workflow](mode-execution-boundaries.md#a-unified-workflow) and the selected style's drawing, reference, voice and acceptance rules. It carries A7's successful production method across A1–A6 without replacing their identities or making A7's character, palette, music or story universal. It applies to both prompt handoff and authorized finished-video production; ordinary chat does not need production tools to deliver a plan and prompts.

For sound planning, source-to-final cue mapping and actual listening, apply the [independent A audio timeline contract](a-audio-timeline-and-review.md). Picture trims are not instructions to cut every audio role at the same point.

## Generation clips and edited shots

A **generation clip** is one returned model asset. An **edited shot** is a continuous view retained in the final timeline. They are not interchangeable: one generation clip can contain several motivated shots or actions, and the edit may retain only its best usable range. Do not force one storyboard row, one model job and one edit shot to have the same boundaries.

Plan the final timeline first, from the story, actions, dialogue and music phrases. Then group it into independently usable generation prompts with an explicit mapping to the planned shots. Choose the number and length of clips from the selected model's actual supported settings. There is **no fixed 8-, 10- or 15-second segment rule and no whole-ten-second or fixed-multiple requirement**. Short clips need not contain a complete three-act arc; a longer clip still needs readable action, consequences, reactions and purposeful framing changes. Do not fill available seconds with idle poses, repetitive camera drift, loops or unrelated decorative motion.

Apply source-local action times inside the actual chosen generated duration in every active style template, including A5; map usable retained ranges to the final edited timeline. Any fixed-duration historical examples describe their own samples only, not new-project requirements. Preserve each style's approved drawing, anatomy and acting rules when retiming beats.

Google's [Omni 1.2 announcement](https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemini-omni-1-2-flash/) describes generation up to 15 seconds, with duration choices from 3 to 15 seconds in one-second increments (November 2026). **15 seconds is a supported maximum, not a target for every clip.** Verify the selected platform/model/mode's live controls before submitting; other models and modes may differ. Preserve an explicit model choice rather than switching models to fit this example. Prompt-only handoffs label any unchecked settings as unverified targets.

Preserve the user's requested final runtime. For example, a **25-second film** could use 15 + 10 seconds of retained footage, or 10 + 8 + 7 seconds, if those lengths suit the action and selected model. These are alternatives, not clip quotas. Another edit could generate three 10-second assets and retain 10 + 8 + 7 seconds from them. Explain generated duration separately from retained duration; 30 seconds generated does not authorize a 30-second final film. Account for overlaps, inserts and end tails in the final timeline; these examples assume straight joins without overlaps. Do not speed up speech or pad the film merely to fit a model duration.

Record this timing ledger before execution and update it against the actual results:

| Final timeline | Edited shot / narrative action | Source generation ID | Requested / actual generated duration | Retained source in–out | Cut / overlap and continuity |
|---|---|---|---|---|---|
| Explicit start–end | One or more readable actions, camera purpose and sound cue | Planned ID, then returned job/asset ID | Verified setting, then measured result | Usable selected range | Join and inherited character/prop state |

Final shot times cover the approved runtime without accidental gaps or double-counted overlaps. Check the encoded file's actual duration, not only the plan or requested model setting. For an exact target, match it to the nearest frame at the delivery frame rate; for an approximate target, record the agreed tolerance rather than silently rounding to a clip multiple.

## Action and camera continuity

Plan the incoming and outgoing state of each edited shot, rather than selecting clips solely for their individual quality or length. In prompt handoffs, describe the intended entry/exit poses, prop states and camera relationship; in finished-video production, select the actual source in/out points against the returned performance. A prompt's intended continuity is not evidence that the generated join works.

Before an insert or replacement, compare both its **entry and return** with the surrounding footage:

| Match at the cut | Inspect and reject |
|---|---|
| Action phase | Match anticipation, contact, release and recovery as appropriate. Preserve the cause, consequence and readable reaction; reject a repeated wind-up, a restarted action, missing contact or a jump from a completed action back to its earlier pose. |
| Actor and scene state | Compare body connections, pose, eyeline, screen direction, position and apparent head size; check prop ownership, grip, location and condition. Reject an unexplained body/prop jump or a near-identical shot with a distracting framing reset. An intentional location/time change must be legible. |
| Camera movement | Compare shot size, direction and momentum. Continue a push-in/pan coherently, or make a deliberate, motivated change of view. Reject an advancing camera that abruptly returns to a neutral wide view and immediately resumes its earlier close framing without a story reason. |
| Rhythm and sound | Let actions and reactions read, and place cuts in relation to the approved dialogue, music phrases and accents. With sound locked, fit picture choices to the existing master and recheck action/Foley sync; do not restart BGM, cut speech or shift a bound dialogue performance merely to accommodate a visual insert. |

Prefer a better source range or a motivated cut on continuing action before adding an effect. Check the lead-in and follow-through around both boundaries: a good-looking insert can still interrupt an action already underway or return to an incompatible pose. A clear shot-size change may work better than almost matching two views. Reframing is a local option only when it preserves the selected style, action, body and delivery size. Do not cover incompatible faces, hands or thin drawn limbs with a dissolve or optical-flow morph that creates ghosted or disconnected anatomy. No transition effect substitutes for compatible action/scene states.

Preserve accepted footage, character/style locks, runtime and independent audio. Adjust only the failing cut/range and its necessary neighboring handles; do not regenerate accepted scenes to fix a timing problem. If the returned source has incompatible drawings or no usable bridging action, record that limit and repair only the affected scope within existing authorization. Do not claim a timing shift repaired a scene-design mismatch. Cut offsets, shot lengths and transition types remain story-specific; one successful frame offset is not a reusable fixed recipe.

Review the **actual encoded joins at normal speed with final sound**, including the approach, insert and return; use frame sequences to diagnose pose, size and camera discontinuities where needed. Sampled frames, a valid timing ledger or equal audio hashes alone do not establish a smooth join or a playback/listening pass. Record unavailable checks honestly under the acceptance contract. Reuse explicit user confirmation for its exact file/scope instead of requesting duplicate review of unchanged accepted media.

Save each changed cut's source in/out and final times, action/camera continuity reason, affected interval, output version/fingerprint, audio-lock fingerprint and actual review/acceptance status alongside the timing ledger. This applies to all A styles; it introduces no default shot quota, compulsory dissolve, new generation or external-analysis step.

## Fixed style, variable story

Freeze the selected style's character identity, drawing/palette grammar and reference-image input roles. Repeat its required anchors in every independently usable generation prompt. Use A7's separation of fixed and variable instructions as a planning method: **fixed character → fixed drawing/style → story-specific scene → timed action/camera**. Keep any additional voice, lighting or negative locks required by the selected A style. Do not rewrite its approved anchor to resemble A7.

Change locations, props, acting, framing and transitions to express the new story while maintaining the same drawing method. A reference may condition identity/style, define a first frame or supply an ending state; record which role the actual tool uses. Do not assume that mentioning an image attaches it or that a kitchen reference requires every story to begin in a kitchen. Follow the selected style's required input procedure; optional character sheets remain optional where that style permits them.

Configure captions, narration, lyrics, music, SFX and ambience from the approved project brief and style defaults. Record enabled and intentionally omitted elements explicitly. A showcase song, lyrics or voice is not automatically required or licensed for the next project. Keep semantic subtitle phrasing, actual speech timing, readable typography and the selected style's text rules in every language.

## Continuous execution and recovery

After the existing storyboard, representative-test and production-setting gates are satisfied, continue all authorized stages without per-clip reminders. Reuse equivalent approvals and accepted assets. Save a checkpoint at each completed batch, material change or blocker, including:

- Approved brief, style/anchor version, ratio, target runtime, sound brief, final resolution, authorized test/production scope and total budget including retries.
- Exact submitted prompts/settings, actual reference files or provider identities and input roles, generation job IDs/status, requested/actual duration and costs, output paths or browser result URLs, and available fingerprints.
- The shot/source timing ledger, independent audio track inventory and master fingerprints, source-to-final speech/SFX cue mapping, selected and rejected takes with reasons, edit versions, accepted ranges/assets, unresolved defects, next action and any running job/process ID.
- Review observations, reviewer/method/date, actual checks completed, user confirmations and any unreviewed limits. Keep technical checks, creative review and user acceptance separate.

After interruption, check the checkpoint, existing files and provider job records before submitting again. A browser-only test with no-download authorization retains its result URL/job ID; do not download merely to obtain a hash. Missing playback/listening capability is a disclosed review limitation, not a pass.

Limit retries by both the remaining authorized budget and the observed failure. Each retry needs a specific defect and a targeted change, with a recorded result. If the same defect survives two targeted revisions, stop repeating that approach and diagnose the prompt conflict, reference role, action complexity or model limitation before another submission. Reuse or trim a good range, simplify only the failing action, or propose a different approach within scope. Do not keep spending on unchanged prompts; stop before the cost cap. A model/provider change, additional costs or a material brief change needs the relevant decision, while unaffected authorized work can continue.

## Actual-output acceptance and local repair

Passing prompt, link, hash or media-format checks does not establish sample-level picture or sound quality. Review the actual assembled output against the selected style's approved appearance and performance, including all retained ranges and joins:

| Gate | Required check |
|---|---|
| Identity and style | Character proportions, connected anatomy, line weight, palette, scene drawing and actual reference use remain consistent across actions, locations and cuts. |
| Acting and story | Actions have visible causes and consequences; weight, feet, grip/release and prop states are readable. Long clips advance the story; camera motion does not substitute for character acting. |
| Camera and edit | Apply [action and camera continuity](#action-and-camera-continuity) at every assembled join, including insert entry/return: action phase, body/prop states, screen direction, apparent size and camera momentum. Framing and rhythm serve the story and approved sound. Reject action restarts, unexplained jumps or camera resets, ghosted anatomy, empty holds and unreadable frantic cuts. |
| Text | Requested captions/lyrics are complete, semantically phrased, correctly timed, readable at delivery size and styled/animated as required. Intentionally absent text is recorded as such. |
| Sound | Actually watch/listen to the complete final encoded mix at normal speed: narration clarity, complete speech, music phrase continuity, native mouth sync, action-mapped SFX, ambience, levels and tails, with no doubled model audio. Follow the independent audio contract and record intentional silence. Technical meters do not establish a listening pass; missing listening capability is `not_checked`. |
| File and runtime | Decode the actual delivered file; verify ratio, resolution, duration, streams, start/end and the timing ledger against the requested final runtime. |

Record each gate as `pass`, `fail`, `not_checked` or `not_applicable`, with evidence or a reason. A required gate marked `fail` or `not_checked` blocks a claim that the finished film passed acceptance. Use `not_applicable` only for a genuinely absent element or an explicitly reused user-confirmed scope, and record that basis; unavailable tools do not make a required check inapplicable.

For a new finished film, inspect the complete final sequence at normal speed with its final sound when playback/listening tools permit it; disclose unperformed checks and provide a concrete review handoff. Suspect anatomy/contact frames may also need close inspection. Record actual results rather than inferring acceptance from silence. A low-resolution trial does not certify a different final-resolution result.

Repair only the affected prompt, source range, shot, cut, caption or sound section. Preserve accepted parts, frozen character/style locks and approved audio; recheck the repair and adjacent joins. Review the changed final assembly before claiming it passed. **An explicitly user-confirmed showcase or test is directly reusable as the accepted baseline; do not reopen it for duplicate analysis, regeneration or external upload.** A new story, ratio or output needs evidence for its new portions, not a copied pass from that baseline. Scope, budget and publication permissions remain those already authorized by the user.

## Apply across A styles

| Style | Retain its own contract while using this workflow |
|---|---|
| A7 | Reuse its validated fixed character/drawing blocks and reference-material route; variable scenes and timed performances remain story-specific. Keep its accepted samples. |
| A1 | Keep the frozen minimalist figure, hollow head, current-pose limb rules and accent restrictions; preserve action/effect density without changing its identity. |
| A8 | Start from text prompts. For continuous action in the same scene, use the last approved frame of the retained range as the next clip's start frame. See the [A8 production guide](a8-production-guide.md) for new scenes and optional character references. Verify face, anatomy, contact, cast continuity and expressive motion in the retained source footage, then check the assembled join. |
| A2 | Keep the selected character, palette and flat/cinematic variant; adapt actions and locations without merging variants or importing A7 anatomy. |
| A3 | Keep its prehistoric character, scene, comedy and voice rules; arrange gags and reactions by the actual story duration. |
| A4 | Keep its character anchor, 2D scenery and intentional location changes; group generation clips independently from edited scenes. |
| A5 | Keep its approved drawing, acting, voice and text constraints from the A1–A5 references; change timing without rewriting its visual identity. |
| A6 | Keep its first-frame-guided lighting/character and separate narration/local-finishing contract. Historical eight-second sample settings remain provenance, not a universal model limit. |

This migration changes A planning, execution and review only. It does not renumber styles, replace samples, change B timing gates or authorize publication of a pending style.
