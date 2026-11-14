# Case-specific action cards

Landscape 1920×1080, 30fps, ten seconds. Silent extraction: these seconds preserve the V5 case’s authored clock; they are not voice anchors for other stories. `stage.events` is the actual event source. Native camera factors are1.0,1.4 BEFORE,1.3 AFTER.

| Phase | Before → extreme → result; support and ownership | Path, curve, delay, hold |
| --- | --- | --- |
| 0–.76 | Reader owns the open book. Dog stands on rug, then compresses20% with feet supported. | Quiet initial read; cubic-in/out preparation .50–.76. |
| .76–1.64 | Dog springs to lap at1.08. Cushion compresses, chair rocks7°, reader recoils25°, one foot lifts; the book is retained. | Fast .32s arcing flight; .14s cubic-out recoil to1.22; asymmetric recovery. Paper leaves lag at1.15/1.22/1.30; bookmark releases1.18 on its own arc to1.96. Paper crosses the face at the peak. |
| 1.56–3.76 | Eyes, head and body turn toward dog; book lowers aside. One dog paw meets the wrist at2.72, then withdraws; curious pose holds. | Gaze leads at1.56, book lowering1.62–2.04, near hand settles by2.06; paw2.58–3.45. Contact uses the same wrist target. |
| 3.76–5.10 | BEFORE cut shows floor support. Two planted steps end4.02/4.25. Front paws brace the knee by4.84 while rear paws retain rug support. | Native1.4x closeup; short separate support steps, then cubic-out body pitch4.60–4.84. Wrist moves out of approach4.32–4.62. |
| 5.10–5.74 | Front paws support the climb, rear paws push then release5.12–5.30; dog finishes on lap5.50. | Short cubic-out rise rather than another flight; shared knee/front-paw endpoints and finite drawn leg curves. Result is readable until next cut. |
| 5.74–7.22 | AFTER cut: dog tucks and settles, chin arrives on the reading hand at6.78; same hand still owns the open book. | Body relax6.20–6.94; ear lands7.13, tail7.20, after the primary contact. Shared dog-local chin coordinate drives the hand. |
| 7.22–8.45 | Reading hand tries lifting but remains loaded by the chin. It yields by7.90; other hand takes/closes/sets the book8.00–8.45. | An18-local-unit lift reaches its limit7.39, holds to7.62, returns with cubic-in/out. Front paw stretches7.10–8.03. The still-held book follows its owner; handover changes ownership. |
| 8.45–10 | Other hand reaches the back8.45–8.69 and gives one stroke8.69–9.35. Chin stays supported. | One purposeful stroke followed by a quiet settled result through10; no repeated action loop. |

Human arms120+120 and legs155+155 world units are evaluated by two-bone IK. Dog legs are drawn curves, not a fixed-bone anatomical rig; source checks must not be described as dog-anatomy certification. Book grips use `bookPoint`; paws and chin use `dogPoint`. Preserve ordinary contact/support reading and inspect intermediate poses when changing the case.

Whole-reference continuous study and continuous candidate playback were not performed by this packaging task. This is not an acceptance receipt or a replacement for actual new-film review.
