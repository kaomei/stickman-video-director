# B5 executable artwork and relay kit

Normal `init` copies [the implementation](../scripts/b5-art-kit.cjs) into `scene/runtime/b5-art-kit.cjs`. Import that project-local file from the stage. This is production code, not another approval or review stage. The neutral starter imports it but leaves the current story unauthored.

## Choose recognizable whole drawings

The phone, cup, large eye pair and hand retain the contours in the [approved relay source](../examples/b5-mei-event-relay/stage.cjs). The normal figure uses the same head/trunk/limb proportions. Reusable seated/reading poses, whole cartoon dog states, coupled lap and paw/forearm illustrations cover recurring contact situations. Newly supplied poses are implementation resources; their presence does not claim user approval of a new film.

Use a whole drawing when it communicates the action. A dog may shoot in as a complete silhouette, rotate, compress briefly at landing and recover. A large eye pair or paw can take over as its own graphic event. Cartoon explanation does not require animal joint simulation. Maintain the subject's recognizable silhouette and any relationship the words need. Add a story-specific element if none fits; do not force the library's nouns into every script.

## Compose and hand off evaluated states

Every drawing exposes SVG, local bounds and named anchors. Use uniform fitting once for the shot, including all its extremes; do not recalculate a breathing camera each frame. Whole-person views retain the entire head. A deliberate part-only image uses the dedicated part drawing rather than accidentally clipping a whole person.

Use evaluated anchors to place contact/attached objects. A physical continuation starts from the actual preceding motion endpoint; it does not retype approximate coordinates or crossfade two copies. For a semantic change, use a graphic handoff: the previous main visual yields while the new one takes over. That substitution makes no claim of bodily continuity or force. The narration selects the sequence, timing and holds; the kit includes no dog storyboard, fixed event quota, default recap or soundtrack.

Exact exports and parameter defaults are documented in the module. See its usage section below. Preserve existing presenter/caption/audio contracts and the [single candidate review](b5-first-preview.md#review-the-actual-candidate-once).

## API and a short composition example

```js
const art = require('./runtime/b5-art-kit.cjs');
const cel = art.dog({pose:'air'}); // ready | air | land | rest; whole cels
const safe = {x:90,y:230,width:1050,height:750};
const landing = art.fit(cel, safe, {padding:40}); // choose once for this shot
const approach = art.motion([
  {t:0, state:{...landing,x:landing.x-260}},
  {t:.3, state:landing,ease:'out'}
]);
const depart = art.continueAt(approach,.3,[
  {t:.6,state:{...landing,x:landing.x+100},ease:'in'}
]);
// depart(.3) equals approach(.3), including rotation and scale.
// scene(t): art.place(cel, approach(t)); add this story's result and next lead.
```

Available drawing factories: `drawings.phone(lit)`, `drawings.cup(filled)`, `drawings.hand(short)`, `drawings.eyes(look)`, `book()`, `figure({pose:'stand'|'seat'|'read',look,expression})`, `dog({pose,tail,blink})`, `lapPose({dogPose,look,expression,book,tail})`, `pawContact({book})`. Each returns `{svg,bounds,anchors}`; inspect its anchor names rather than inventing coordinates. `lapPose` draws a coupled complete support pose. `pawContact` draws the whole forearm/palm and paw close-up around one contact.

`fit`, `place`, `boundsAt` and `contain` handle uniform native framing; `place(drawing,state,safeRect)` rejects accidental clipping. `anchor(drawing,state,name)` evaluates the world point; `attach(drawing,anchorName,target,{scale,rotation})` returns the placement matching that point. `motion`, `tweenState` and `continueAt` evaluate deterministic states. `graphicHandoff(fromState,toState,u)` returns separate outgoing/incoming placements. `squash(svg,u,{amount,pivot})` deforms a complete cartoon cel by a bounded pulse and returns to its original proportions at both ends; do not use it to stretch an ordinary figure's bones. Helpers carry no automatic story meaning or audio approval.
