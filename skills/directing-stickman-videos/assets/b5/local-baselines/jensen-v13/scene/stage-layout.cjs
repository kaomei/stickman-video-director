/* Fixed shot framing, not a per-frame content-following zoom. Only untitled
 * left-stage artwork is transformed; the approved choreography is untouched. */
const base=require('./stage-causal.cjs');
const {props:B}=require('./stage-semantic.cjs');
const assert=require('assert/strict');
const shots=[
 {id:'intro-no-heading',start:0,end:1.38,scale:1.42,tx:-34,ground:916},
 {id:'cart-and-office',start:4,end:7.08,scale:1.40,tx:-460,ground:914},
 {id:'identity-and-office',start:10.9,end:16,scale:1.20,tx:-140,ground:932},
 {id:'apology-receipt',start:30.96,end:34.98,scale:1.30,tx:-100,ground:942},
 {id:'committee',start:36.24,end:41.64,scale:1.18,tx:-150,ground:880},
 // The untitled report already contains an oversized, high-sweeping page;
 // its original framing remains valid. Do not zoom every untitled shot blindly.
 {id:'vault',start:47.98,end:53.04,scale:1.52,tx:-530,ground:948}
].map(s=>({...s,ty:s.ground-989*s.scale}));
function layout(t){return shots.find(s=>t>=s.start&&t<s.end)||null}
function draw(t,tx){
 const original=base.draw(t,tx),shot=layout(t);if(!shot)return original;
 // The only eligible source shots have no editorial heading. Assert this
 // exact outer structure rather than accidentally moving screen-space text.
 const m=original.match(/^<defs><clipPath id="(?:acting|causal)-left"><rect x="70" y="355" width="1140" height="662"\/><\/clipPath><\/defs><g clip-path="url\(#(?:acting|causal)-left\)">([\s\S]*)<\/g>$/);
 assert(m,'Unexpected untitled stage layer at '+t);
 const ground=B.ground();assert(m[1].includes(ground),'Missing ground at '+t);
 const art=m[1].replace(ground,'');
 return `<defs><clipPath id="layout-left"><rect x="70" y="100" width="1140" height="917"/></clipPath></defs><g clip-path="url(#layout-left)"><path d="M90 ${shot.ground}Q640 ${shot.ground+6} 1190 ${shot.ground}" fill="none" stroke="#858079" stroke-width="3" stroke-linecap="round"/><g transform="translate(${shot.tx} ${shot.ty}) scale(${shot.scale})">${art}</g></g>`;
}
module.exports={draw,layout,shots,inspected:base.inspected,contacts:base.contacts};
