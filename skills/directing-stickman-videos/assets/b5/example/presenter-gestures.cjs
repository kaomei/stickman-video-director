// One semantic gesture per important phrase, anchored to the existing recording.
// Both arms otherwise remain lowered; no continuous raised-hand or looped waving.
const words=require('./word-timings.json').words;
const clamp=v=>Math.max(0,Math.min(1,v));
const ease=u=>{u=clamp(u);return u*u*(3-2*u)};
const mix=(a,b,u)=>a+(b-a)*u;
const rest={left:[535,760],right:[780,765],leftStyle:'fist',rightStyle:'fist',leftRotation:-8,rightRotation:8};
const definitions=[
 {word_index:2,meaning:'hate asking for help: brief outward refusal',anticipation:.12,attack:.12,hold:.36,release:.26,
  left:[490,630],leftStyle:'palm',leftRotation:-18},
 {word_index:11,meaning:'physically sick: one hand draws inward to the chest',anticipation:.13,attack:.14,hold:.28,release:.25,
  left:[625,666],leftStyle:'fist',leftRotation:28},
 {word_index:25,meaning:'overwhelmed: brief two-palm reaction, then release',anticipation:.14,attack:.14,hold:.20,release:.28,
  left:[492,640],right:[807,640],leftStyle:'palm',rightStyle:'palm',leftRotation:-24,rightRotation:22},
 {word_index:34,meaning:'not independence: short explanatory sweep toward the left stage',anticipation:.12,attack:.12,hold:.24,release:.26,
  left:[478,654],leftStyle:'palm',leftRotation:-58},
 {word_index:38,meaning:'trauma response: single open palm for a measured explanation',anticipation:.12,attack:.15,hold:.30,release:.27,
  right:[796,658],rightStyle:'palm',rightRotation:32},
 {word_index:52,meaning:'dangerous: one raised index for emphasis',anticipation:.12,attack:.12,hold:.24,release:.25,
  right:[793,646],rightStyle:'point',rightRotation:8},
 {word_index:66,meaning:'you: index turns inward toward own chest',anticipation:.14,attack:.14,hold:.30,release:.36,
  right:[718,670],rightStyle:'point',rightRotation:-64}
];
const events=definitions.map(d=>({...d,word:words[d.word_index].text,anchor:words[d.word_index].start,
 start:words[d.word_index].start-d.anticipation,
 peak:words[d.word_index].start+d.attack,
 hold_end:words[d.word_index].start+d.attack+d.hold,
 end:words[d.word_index].start+d.attack+d.hold+d.release}));
function pose(t){
 const event=events.find(e=>t>=e.start&&t<e.end);
 if(!event)return {...rest,left:[...rest.left],right:[...rest.right],activity:0,event:null};
 // Anticipation belongs to the lead-in, and the stroke lands just after the word.
 const u=t<event.peak?ease((t-event.start)/(event.peak-event.start)):
  t<=event.hold_end?1:1-ease((t-event.hold_end)/(event.end-event.hold_end));
 const p={...rest,left:[...rest.left],right:[...rest.right],activity:u,event:event.word_index};
 for(const side of ['left','right']){
  if(!event[side])continue;
  p[side]=rest[side].map((v,i)=>mix(v,event[side][i],u));
  p[side+'Rotation']=mix(rest[side+'Rotation'],event[side+'Rotation'],u);
  // Open fingers only after the lowered hand has entered the frame; close before exit.
  p[side+'Style']=u>.30?event[side+'Style']:rest[side+'Style'];
 }
 return p;
}
module.exports={rest,events,pose};
