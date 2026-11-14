'use strict';
const assert=require('node:assert/strict');
const a=require('../scripts/b5-art-kit.cjs');
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-8,`${x} != ${y}`);
const d=a.dog(),person=a.figure({pose:'seat'}),lp=a.lapPose();
assert.deepEqual(lp.anchors.lap,lp.anchors.dogSupport);
const rect={x:78,y:211,width:1080,height:800};
for(const art of [d,person,lp,a.pawContact({book:true}),...Object.values(a.drawings).map(f=>f())]){
 for(const rotation of [-25,0,30]){
  const state=a.fit(art,rect,{rotation});
  assert.ok(a.contain(art,state,rect,18));
  const b=a.boundsAt(art,state);assert.ok(b.x>=rect.x&&b.y>=rect.y);
  assert.ok(a.place(art,state,rect).length>100);
 }
 assert.equal(art.svg,a.asset(art.svg,art.bounds,art.anchors).svg);
}
const target={x:582,y:796},ds=a.attach(d,'frontPaw',target,{scale:.82,rotation:17});
const pa=a.anchor(d,ds,'frontPaw');near(pa.x,target.x);near(pa.y,target.y);
const old=a.motion([{t:0,state:{x:1,y:3,scale:.5,rotation:-18}},{t:1,state:{x:50,y:90,scale:.8,rotation:12},ease:'in'}]);
const next=a.continueAt(old,.77,[{t:1.1,state:{x:100,y:120,scale:1.2,rotation:33},ease:'out'}]);
assert.deepEqual(next(.77),old(.77));
const back=a.tweenState({opacity:0},{opacity:1},.8,'back');assert.ok(back.opacity>=0&&back.opacity<=1);
const delta=.0000001;for(const k of ['x','y','scale','rotation'])assert.ok(Math.abs(next(.77+delta)[k]-old(.77)[k])<.001);
const gh0=a.graphicHandoff({x:1,y:2},{x:50,y:70},0),gh1=a.graphicHandoff({x:1,y:2},{x:50,y:70},1);
near(gh0.outgoing.opacity,1);near(gh0.incoming.opacity,0);near(gh1.outgoing.opacity,0);near(gh1.incoming.opacity,1);near(gh1.incoming.x,50);
assert.equal(a.squash('dog',0),a.squash('dog',1));
assert.throws(()=>a.squash('dog',.5,{amount:.5}));
assert.throws(()=>a.place(d,{scaleX:2}));
assert.throws(()=>a.place(lp,{x:0,y:0,scale:3},rect));
assert.throws(()=>a.fit(lp,{x:0,y:0,width:-1,height:2}));
assert.throws(()=>a.continueAt(old,1,[{t:.5,state:{}}]));
// Whole human poses use the original two fixed 86+84 arms and 80+80 legs.
// Their endpoints remain in the whole drawable; the safe-fitting test above
// checks the entire head as well as support, not a hand-selected focal crop.
for(const pose of ['stand','seat','read']){
 const f=a.figure({pose});const b=f.bounds;assert.ok(b.y<=-260);assert.ok(b.y+b.height>f.anchors.foot.y);
}
console.log('B5 art kit: contact attachment, safe fitting, endpoint continuity, graphic substitution and bounded squash passed');
