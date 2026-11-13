# B6 Sample 1 acceptance standard

Use this reference before art/shot authoring and when completing a B6 review. It turns the user-selected **Sample 1 portrait Eiffel V44** into separate acceptance decisions. Read it with [motion review](b6-motion-review.md); the latter owns file/schema/history mechanics. The installed moving authority is `assets/b6/reference/eiffel-portrait-v44.mp4`, SHA-256 `b0047f5889a7ca1fd47097d8c8b3db054ef412e2f4a7297d3fe04fc1083e5d79`. `assets/b6/style-standard.json` is the machine-readable selection and required subcheck manifest.

## Authority and evidence

Separate three kinds of information:

- **Locked primary facts:** exact reference identity; primary relative stroke/paint/performance standard. The user approved Archivo Black as the current caption-font revision; retain the portrait geometry and treatment below. Change these only for an explicit user direction, recording which default it overrides. A new cast or landscape request does not lower the shared drawing/animation standard.
- **Observed examples:** the opening transaction (0–2.8 s), entry/staging/light (5.35–9 s), and independent carriage travel through a broad world (41.08–43.04 s). These are comparison starting points, not a compulsory shot order. Select additional actual ranges from the installed full movie when the relevant property is not visible there.
- **Transferable decisions:** a wide usable world, purposeful acting/camera, attention hierarchy, readable cause/reaction and sound. Protagonist-free environment/ensemble shots are permitted by the user's explicit direction; this is not a claim that an entirely protagonist-free shot was verified in V44. Adapt these to the new story. Do not force the same actor, costume, setting, horse, voice recording, duration, cut count or gesture into every film.

Every subcheck below needs its own verdict and actual observation. Link candidate original-speed shot playback and primary-reference playback with their reviewed ranges, plus the fingerprinted implementation responsible. Inspect full native-size encoded crops, complete chains for every active identity/view/near-far limb, important contacts frame by frame and both sides of each cut. Low-resolution contact sheets locate problems; they cannot supply detail/motion/audio acceptance. Use decoded neighboring frames/crops for contour, contact, text and cut details; they supplement moving/audio evidence. Record what was inspected, not what the plan intended. The gate validates evidence completeness and source identity; it cannot decide that brushwork, performance or light looks right.

`preserved` and `matched` answer different questions. An unchanged subtitle/audio/art hash proves reuse. It does **not** prove that timing, color, acting or sound matches Sample 1, or that captions meet the approved Archivo Black profile. A passing broad category cannot cover an unchecked or failed subcheck. No averaging or score can cancel a visible defect.

## Portrait caption renderer: fixed reference facts

The historical Sample 1 movie uses Arial Black. The user approved **Archivo Black as B6’s current default**; this is an intentional caption revision, not a failed font match. Sample 1 remains the drawing, motion and caption-geometry reference. At **720 × 1280**, the English default profile `eiffel-v44-portrait-archivo-black-v1` uses:

| Property | Approved B6 portrait default | Verification |
|---|---|---|
| Font | Archivo Black (`fonts/ArchivoBlack.ttf`), 47 px, one fixed size throughout this native version | Font asset identity and render settings; actual-size encoded glyph crop |
| Fill / outline | Pure white `#ffffff`; 4 px outline `#171319` | Renderer and decoded text edge/fill; do not treat compression pixels as new palette values |
| Position | Horizontally centered; fixed **baseline y=914**, `ms` anchor; caption layer **y=864…951** | Baseline/profile contract plus actual encoded frame. The visible glyph center is around 70% of height; it is not a bottom-center `mm` anchor at y=1100 |
| Horizontal fit | 44 px side allowance at this resolution | Measure the whole outlined cue; choose a new semantic break if it overflows |
| Raster | Render at **3×**, then Lanczos downsample to native size | Pinned caption renderer/config and decoded edge crop; do not substitute direct low-resolution drawing |
| Switching | Immediate semantic-phrase replacement; **no pop, bounce, auto-shrink, unintended blank-frame flash or extra shadow** | Consecutive encoded frames at cue changes and original-speed playback |

Use the **approved English Archivo Black profile** for new stories; missing Arial Black does not block production. The original profile remains available for historical reproduction. This does not permit arbitrary font/layout overrides. If the language needs missing glyphs, or the user explicitly requests another subtitle design, first implement a separately and explicitly named profile with verified font/glyph coverage and profile-specific runtime validation; then render and repeat native review/tests. Record the user direction and exact deviation, but a reason alone cannot pass the current gate. Do not silently replace the font/layout, edit the primary manifest to lower the standard, or claim that an unimplemented profile matches the default. Until that work is complete, the alternative remains unsupported/pending.

Scale the portrait geometry, type and stroke uniformly with native resolution; preserve the normalized baseline/band and relative size. Do not adjust individual cue size, position or effects. Encoded glyph bounds vary with letters/descenders; compare the same glyphs where possible and distinguish nominal font size, baseline and visible glyph bounds. A whole-line bounding-box height is not a fair size comparison when the texts differ.

A 42 px `mm`-anchored cue at y=1100 in 720 × 1280 is a **failed match**, even if synchronized, single-line, safely visible and unchanged from an earlier version. The previous broad “captions preserved/synced” pass cannot approve it. A confirmed mismatch remains in the failure/repair history until rendered correction and re-observation.

Real speech pauses may have no caption, as in the sample. “No blank flash” forbids an accidental empty frame between cues that should replace one another; it does not forbid intentional subtitle gaps during silence.

The full sample has 73 cues, with 12 cue starts in its first ten seconds and roughly 0.647 s mean displayed cue duration. These are **descriptions of this recording**, not target quotas. Preserve proper names, noun/verb phrases, modifiers, phrasal verbs and numbers/units; choose breaks from meaning and actual speech pauses. Judge briskness, complete wording, reading time and sound alignment together. Do not split mechanically to hit a change frequency, accelerate audio to match a count, or copy Sample 1's pauses into another performance.

**16:9 is separate.** The runtime's `b6-landscape-native-archivo-black-v1` starting layout is a local authoring proposal, not an approved V44 caption geometry. Record its `native_layout_reason`, separately stage action/face/prop/caption relationships, and inspect that native movie. Keep the shared white/ink treatment and fixed-per-version size unless the user's direction changes them. Never apply portrait y=914 to a 720-high image, center-crop a portrait film, or infer approval between ratios.

## Mandatory detailed review

The eight groups below contain **35 independent subchecks**. The IDs match schema v3. For each row, compare actual candidate and primary-reference footage; the stated allowed variation does not waive the listed outcome. `not_applicable` is available only for `background_independent_activity` and `contact_ownership_release`, with a concrete scene-specific reason. A relevant activity/contact cannot be declared absent to hide broken implementation. A deliberate hold is assessed as a hold in the other rows.

### Space and world

Sample 1 demonstrates a broadly authored world, readable relative scale and independent transport, especially 5.35–9 s and 41.08–43.04 s. Grounded gait, world-distance wheel rotation and independent motion paths below are transferable implementation/acceptance principles; they are not claims that every hoof or wheel angle was numerically measured from V44.

| Subcheck | Required result and allowed variation | Inspect / repair when failed |
|---|---|---|
| `world_routes_reveal` | Connected usable regions, dressed destinations and enough width/height for the actual route. The cast/era/layout may change; repeated enlargement of one patch does not establish a broad world. | Show a world layout, extreme frusta and rendered route. Identify the new information revealed. Add the missing region/coverage rather than duplicating facade tiles. |
| `depth_planes_parallax_occlusion` | Coherent near/middle/far responses, crossings and scale/depth relationships for the move being claimed. A deliberate flat reframe can exist, but cannot stand in for the segment's claimed depth demonstration. | Compare actual relative layer motion and changing occlusion with primary playback; inspect projection/planes and near crossings. Repair depth anchors/masks or redesign the promised effect truthfully. |
| `spatial_staging_scale` | Actor, prop, counter/floor and destination share believable scale/contact planes. Environment-led or protagonist-free shots are valid; no giant hero slot is compulsory. | Inspect wide/contextual frames and move extremes, horizon/ground continuity and contact views. Repair staging and camera before attempting unnatural limb reach. |
| `background_independent_activity` | Relevant extras/transport perform staggered purposeful activities independently of camera/lead. Preserve primary attention. A quiet/empty setting can justify N/A; do not add a crowd quota. | Inspect tea/page/cooking/walking/vehicle starts, pauses, depth and occlusion. Walk stance agrees with world travel; wheel angle follows distance/radius, vehicle turns/support remain coherent. Repair frozen baked-in movers, skating, teleport loops or entire-car pivots. |

### Camera and native composition

Transfer the primary film's purposeful spatial moves and readable landings, not a preset shake or a repeated zoom.

| Subcheck | Required result and allowed variation | Inspect / repair when failed |
|---|---|---|
| `motivated_attention_landings` | A move follows/reveals a story subject and lands on useful information. Lateral tracking, foreground reveal, depth move, detail/reaction cut and stillness are choices, not a mandatory list. | State the initial/final attention target, actual movement and payoff. A different shot ID or whole-canvas zoom is not a new camera language. Repair staging/path/easing around the beat. |
| `native_composition_safe_coverage` | Requested ratio has its own shot composition, readable face/hand/prop/caption relationships and covered camera extremes. | Inspect native full-size first/middle/last and extreme frames, not an outer gallery poster. Repair overscan/staging/caption band; cropping/stretching another finished format fails. |
| `actor_similarity_no_warp` | Faces, torsos and bound limbs retain uniform actor scale and intended view while the environment gains perspective/stretch through actual projection. | Track body/head aspect and contact attachment through the shot. Repair transforms/pivots; decorative body sway, nonuniform full-frame stretching or squeezed frontal heads cannot imitate camera motion. |
| `cut_axis_gaze_continuity` | Screen direction, eyelines, prop position/ownership and action phase carry across joins or an intentional change is established. | Inspect neighboring decoded frames plus playback across every join. Repair shot staging or insert an earned orienting view; never hide a jump with a rapid zoom. |

### Body, limbs and props

Use the primary transaction and other relevant actual contact ranges. A solver trace is supporting technical evidence, not a natural-performance verdict.

| Subcheck | Required result and allowed variation | Inspect / repair when failed |
|---|---|---|
| `anticipation_action_recovery` | The meaningful action reads as preparation → decisive action/peak → release or recovery, with timing suited to the story. A deliberate still beat remains valid; a wrist-only slow pose does not demonstrate the segment's action capability. | Inspect consecutive action frames and original-speed playback. Repair key timing/paths; do not manufacture movement through repetitive whole-actor rocking. |
| `shoulder_weight_support` | Shoulder/torso/hip contribution supports a reach, turn, rise or impact; planted feet/seat/ground explain the weight. | Compare fixed-camera contact and final native-camera output. Repair blocking or support transfer before chasing wrist targets; both feet drifting with a rising actor fails. |
| `contact_ownership_release` | Every supported prop shares a hand/grip transform through approach, shared hold, transfer, release and recovery, with correct near/far ownership and masks. N/A only when no relevant hand-supported contact exists. | Inspect exact contacts plus frames on either side, independent grip geometry and ownership inventory. Repair the actual handoff/mask; zero numeric error cannot excuse a disappearing arm or floating prop. |
| `stance_swing_or_deliberate_hold` | Standing holds are grounded. For locomotion, stance/swing follows world distance, modest lift and heel/flat/toe support; the approved straighter-leg side gait retains its read. | Inspect soles/hips/legs at fixed-camera and moving-camera extremes; all participating cast count. Repair slipping, backward knees, crouched creep, mismatched phase or dangling unsupported legs. No need to make a planted character walk. |

### Expression and gaze

The primary uses sparse asymmetric meme acting. Preserve that drawing language while allowing new identities/emotional ranges.

| Subcheck | Required result and allowed variation | Inspect / repair when failed |
|---|---|---|
| `identity_shape_consistency` | Expression/view changes preserve head/hair silhouette, face placement and head/body paint. New hair/clothes/personality are permitted; identity changes are not accidental deformation. | Compare whole head and face crops before/after each switch. Repair angle/expression assets or face pins; do not narrow a frontal image to invent profile. |
| `emotional_progression` | Emotion changes because of perceived story events, with brows/lids/pupils/mouth and body supporting the beat. | Compare actual neutral/setup, perception and reaction. Repair frozen smirk, round emoji shock or overstated polished face that loses the scrappy meme read. |
| `eyeline_target` | Eyes/head address a named partner, prop or event; gaze arrival and body action are intentionally offset. | Inspect the target geometry and frames before/after gaze changes, including cuts. Repair pupils/head pose before adding decorative blinks. |
| `reaction_readable_hold` | Reaction arrives at an intelligible moment and has room to register. Quick reactions and restrained responses are both valid in context. | View actual-speed cause and response together. Repair premature face switches, one-frame states, popped head silhouettes or a cut that removes the emotional payoff. |

### Rhythm and attention

Sample 1's quality comes from information/action/reaction and movement/settle contrast, not constant maximal motion or a fixed cut frequency.

| Subcheck | Required result and allowed variation | Inspect / repair when failed |
|---|---|---|
| `cause_action_reaction` | Viewer can locate the setup, action/result and reaction/payoff without the plan explaining them. Story length and beat order may differ. | Review the complete authorized range at speed 1 with sound. Repair missing setup, repeated same-information crops or narration describing an absent event. |
| `travel_brake_land_hold` | Travel has a purposeful departure, decisive transit, braking/landing and appropriate reading hold; actor and camera clocks remain independent. | Inspect path/easing and encoded motion, including joins. Repair uniform sluggish drift, abrupt resets and endlessly pulsing zoom. No universal movement-distance/duration threshold. |
| `cut_readability_no_flash` | New text/props/places can be located and understood; short action cuts have a concrete purpose. | Review sub-.9 s cuts and new-information holds; inspect adjacent frames. Remove unmotivated single-frame/subsecond flashes such as the former abrupt SOLD insert; do not impose a universal one-second minimum on all cuts. |
| `focus_background_competition` | One primary attention cue leads; background life supports rather than fights the camera/foreground gesture. | Review opening, busiest shot, transitions and ending. Repair timing/contrast/density; do not freeze all normal traffic as the default fix. |

### Drawing, paint and light

Inspect matched-scale actual output against the primary, not only an approved asset. Different settings may change the motivated palette/exposure while retaining soft painted value relationships.

| Subcheck | Required result and allowed variation | Inspect / repair when failed |
|---|---|---|
| `irregular_ink_pressure` | Selective pressure changes, imperfect contours, logical breaks/repasses; the looseness reads as drawn rather than a uniform vector line or random scratch filter. | Compare head/garment/hand crops and the encoded moving contour. Repair the assets/stroke sampling; global noise and framewise jitter are insufficient. |
| `unified_head_body_paint` | Head, body, props, supporting cast and scenery share a deliberate detail/paint hierarchy; face, clothes and background do not all need equal grain density. Texture is anchored to the artwork. | Compare face/body/scene crops at shot scale and while moving. Repair an over-rendered head, clean SVG torso, excessive tiny decoration or swimming texture at its source. |
| `single_stroke_fixed_limb_ownership` | Sparse single painted limbs, fixed chains, correct sleeve exits, elbows, near/far ordering and deliberate occlusion for every actor/view. “Single stroke” does not mean thinner than the primary. | Check all active/background cast and scene branches, every contact/cut and camera extreme. Repair missing/duplicate/reversed arms or an unjustified hidden chain; numerical lengths alone do not pass it. |
| `lighting_bloom_material_depth` | Soft light, readable midtones and localized restrained spill preserve matte paint and spatial separation. A warm filter/blur does not create the effect. | Compare first frame, representative lit face, shadow region and transition at matched framing/exposure; inspect before/after finish. Repair value design, local light/shadow and highlight masks before adding bloom. |
| `shadows_edges_no_plastic` | Pale colored underside/contact shadows, grounded shoes/props, soft transitions and selective ink remain legible without glossy plastic highlights. | Inspect face underside, sleeve/grip, prop/table and sole/ground; review moving shadow attachment. Repair crushed ink, muddy blacks, clipped windows, washed faces, halos, uniform blur or detached shadows. |

### Relative limb stroke

The primary's visibly heavier pressure-varying stroke is the target. V90's finer wire-like engineering example cannot supersede it.

| Subcheck | Required result and allowed variation | Inspect / repair when failed |
|---|---|---|
| `matched_head_width_primary_frames` | Candidate and primary decoded PNGs use comparable views and **matched head width**, preserving original body proportions. | Record frame paths/times, original head width and normalization. Redo an invalid comparison; a changed camera/body scale cannot hide a stroke mismatch. |
| `relative_stroke_pressure` | Arm/leg weight, local pressure variation and painted edges read like the primary. No unmeasured universal pixel width; do not inflate into flesh-filled anatomical forearms. | Inspect uncluttered arm/leg crops and full figures, preferably more than one pose. Repair sampled ink/asset-scale calibration, not the entire finished screen image. |
| `scale_pose_supporting_cast_consistency` | Relative stroke remains coherent across native scales, rotations/views, posed limbs and the rest of the cast. | Inspect all identities/view branches and movement extremes. Repair per-identity calibration or transform duplication; a single hero close-up does not certify extras. |

### Captions, audio and final identity

Apply the exact portrait contract above. Match the sample's brisk semantic presentation and sound-led rhythm through the actual selected performance, preserving authorized reuse and the accepted supplied track at normal playback rate. This does not claim V44's production history never used a rate adjustment; a historical example setting is not permission to time-stretch new or already accepted narration.

| Subcheck | Required result and allowed variation | Inspect / repair when failed |
|---|---|---|
| `caption_placement_typography` | Approved Archivo Black portrait profile, fixed baseline/size, exact white/ink and native safe fit; landscape has explicit independent layout rationale and review. | Bind renderer/profile/font to source fingerprint, then inspect encoded glyph crops and compare placement/raster with primary evidence, allowing the approved font revision. Fix the renderer/plan; unchanged or merely safe captions cannot pass a different profile. |
| `caption_semantics_timing` | Complete ordered wording, meaning-based breaks, correct speech boundaries, readable holds and no overlaps/leaks. Language/recording may change. | Read cue text against the approved script and listen across every cue boundary; inspect long phrases/proper names and neighboring cue pairs. Re-break at semantic boundaries rather than fixed word counts. |
| `caption_raster_switch` | Supersampled primary text treatment and clean hard phrase replacement; no individual cue shrink/pop/bounce/shadow/blank flash. | Inspect consecutive encoded cue-transition frames and renderer identity. Repair low-resolution edges, stale text, per-cue resizing or an invented animation effect. |
| `actual_voice_sync_readability` | Actual words, accents and pauses agree with visual information and cues; reading remains comfortable at final size. | Listen to original-speed final sound while viewing the encoded native movie. A waveform/cue count or file hash does not establish perceived sync/readability. |
| `original_speed_voice_identity` | Accepted voice/performance, words, timing and authorized reuse are preserved. New authorized voice may differ; a visual revision does not recast or time-stretch it. | Compare voice/mix metadata, duration and decoded audio/hash evidence where reuse is required; listen for artificial rate/pitch changes and clipping. Repair the affected stage only. |
| `voice_music_foley_hierarchy` | Intelligible foreground speech, story-specific ambience/contact/transitions and intentional quiet/payoff; distance and visual contact fit the sound. No compulsory source soundtrack or sound on every cut. | Listen to opening, speech-dense/busy section, contact and ending at a stable level. Repair masking, clipped peaks, doubled SFX or lifeless/mismatched ambience; `contains_sfx` is metadata, not proof of sound design. |
| `final_media_identity_av_playback` | The exact final file, ratio, full authorized range, source/reference hashes and review evidence agree. Final continuous playback includes sound. | Compare delivery/report/review SHA and inspect every actual shot, including later/end sections. A preview, muted frame sheet or code-only review cannot certify unviewed final footage. |

## Failure handling and scope

When any row is pending, visibly fails, lacks relevant actual evidence, or contradicts another row, retain that finding and continue the authorized local repair loop. Trace it to the responsible art/binding/timing/camera/caption/audio dependency, change only the affected material, encode fresh output and review neighboring shots as well as the failure. Reuse accepted unaffected art, performance, voice and semantic text.

Keep the rejected preview/review immutable and carry its unresolved findings into the replacement `repair_log` and regression list. Confirmed defects need changed implementation and changed rendered output; a written `review_correction` is only for a genuine prior misreport or incomplete observation. Do not relabel a real mismatch as corrected review. User approval and internal reference-aware review remain separate decisions. A rules/profile update by itself does not retroactively approve or modify an existing movie.

The repair loop does not authorize extra charges, uploads, publication or a different deliverable. User-requested interim output, explicit stop and evidenced external blockers retain their boundaries. Report limitations truthfully; never invent a human watch, sound playback, independent reviewer or approval.
