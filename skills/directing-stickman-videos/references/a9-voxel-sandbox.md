# A9 · 方块沙盒风 / Voxel Sandbox

Use the [shared Model Engine workflow](mode-execution-boundaries.md#a-unified-workflow), [production and review contract](a-production-and-review.md) and the A9 requirements below when A9 is selected. For a Flow text-to-video request, submit a standalone prompt with all approved shots, without attaching a still or a prior clip. Use prior takes to identify failures and retain the approved staging and pacing.

## Fixed character and variable world

Repeat the following character block verbatim in each standalone generation prompt. If the user approves a character with a small smile, substitute that fixed expression in the face description and carry it through the final shot.

> One small stick figure with a matte solid white cube head, two short black hair tufts and only two flat black square eyes on the front face. The face is planar and has no nose or mouth. The torso is one solid thin black square-section rod from neck to hips. Two distinct arms and two legs have the same slim square profile. The head-to-body ratio, silhouette and attachments stay consistent across views and throughout the film, including the ending. Express surprise, effort and relief through head tilt, posture, weight shifts and gestures.

Define the count and look of recurring characters and key props in the prompt, then carry their states through the shot plan. Show the same lead wherever the storyboard calls for them, with no duplicate lead, facial redesign, hollow body or unexpected change of proportions. Specify animals and supporting characters separately so they can vary with the story. Use block-built terrain and objects that give the player a reason to run, jump, build or interact. Let the location, palette and supporting cast vary while the lead and the block-world visual grammar stay recognizable.

## Gameplay pace and camera continuity

Start with purposeful movement and make the objective or obstacle legible in the opening seconds. Use changes of framing to show distinct story beats. A short example can use a wide establishing action, low follow shot, close view of an interaction and a result shot. Use the approved storyboard to set the exact timing and shot count. Retain its brisk pace, framing changes and action beats in revisions. Give the middle and ending visible progress or payoff. Keep the movement readable at the actual delivery size.

At each planned cut, specify what the outgoing frame has reached and what the incoming frame resumes. Map the lead and moving objects to fixed landmarks. Carry forward the same footfall or contact phase, travel and screen direction, prop count and orientation, and the exact position and state reached. A runner reaching a bend continues from that bend with the next phase of the same stride. The same vehicle continues from where it was on the same track. Use a landing or other readable action boundary when it helps the cut. Keep the approved camera variety and movement speed when repairing a jump or restart.

### Two action blocks for a short Flow prompt

For a 15-second standalone Flow prompt with one main mechanism, start with two broad action blocks. Let the action dictate the cut. Reserve fine timing for a user-specified beat and preserve any framing changes needed to keep the scene brisk and readable.

1. **Approach and land.** Open in a run, jump or other purposeful movement. Show the destination and the mechanism's starting state. End the approach at a definite footfall beside a fixed landmark. Give any moving prop a corresponding position and direction at the cut.
2. **Operate and show the outcome.** Resume with the same planted feet, pose and prop state. Frame the hand, control and visible result together. Show contact, the control moving and the result in that order. End on the final state that proves the task was completed.

For a drawbridge, keep both ends visible so the viewer can see the dog wait on the starting dock, the lever move, the deck settle onto the far dock and the same dog reach the far dock. These are action cues within the two blocks. Use the same handoff for a new setting, a different animal or a different mechanism.

## Key mechanisms in one continuous shot

Reserve one unbroken shot for each story-critical mechanism from the readable initial state through physical contact, visible state change and its immediate result. Hold a clear view of the hand, object, contact surface and result. Keep a fixed landmark in view and favor a stable same-side angle when the order of contacts matters. Allow enough screen time to read the whole interaction at normal speed. Cut to the reaction or wider payoff once the causal action is complete.

- **Track repair.** Keep one cart on the approach side of a visible gap. Show the lead seat and release one track panel. In that same shot, keep a distinct fixed mark next to the repaired seam in view while the same cart's near-side front and rear wheels each roll over that exact seam, front first and rear second. After both clear it, the next shot may follow the cart into the tunnel.
- **Bridge crossing.** Show one lead seat and release the bridge piece, then show it stay in place and support the crossing. Keep the lead recognizable and maintain the storyboard's animal count through the payoff.

## Acceptance on the actual film

Watch the complete candidate at normal speed from opening through the last reaction. Inspect all cuts and any suspect frame ranges closely to locate a fault. If the contact or its outcome is only legible when stepping through individual frames, mark the mechanism for repair.

| Required gate | Pass condition |
| --- | --- |
| Character and count | The same face, silhouette and connected limbs hold through turns, cuts and the final reaction. The expected lead, recurring cast and key-prop counts hold through the entire film. |
| Pace and continuity | The approved range of shots and action beats is present at the intended pace. Movement, spatial progress and object state carry across cuts without jumping back, restarting or replaying an action. |
| Key mechanism | The viewer can see the setup, contact, state change and immediate result in one uninterrupted shot at normal speed. Verify the actual endpoint when it matters to the story, such as the same animal reaching the far bank after a bridge settles. For a track repair, both wheels visibly cross the same marked seam in order. A rolling cart with an unidentifiable seam leaves that check unverified. |

Record status and timecoded evidence for each gate. A changed face in the final seconds or a duplicate lead anywhere fails the character gate. A required check marked `fail` or `not_checked` keeps the film in review. Technical checks and matching prompts record setup only. Repair the affected scope through the authorized workflow, keep the approved pacing and shot design, and recheck the final cut and nearby joins. If the agreed output is one complete text-to-video film, return a complete candidate within the authorized generation scope.
