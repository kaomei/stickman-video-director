/* Two authored tests, not a full-film replacement. The pictured business group
 * is anonymous illustration, never fabricated photographic evidence.
 * Mechanisms: excluding people fails physically; a camera overpowers its user.
 * No force/squash/spring/reset loop. Every grasp uses a solved wrist. */
const R=require('./acting-rig.cjs');
const old=require('./stage-acting.cjs');
const {props:B}=require('./stage-semantic.cjs');
const {P,G,C,ink,red,gray}=require('./actor.cjs');
const paper='#FBFAF8',tan='#BEA98B';
const E=(t,a,b)=>{let u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u)};
const K=(t,ks)=>R.curve(t,ks);
let contacts=[];
function grip(q,i,p,side){R.reach(q,i,p,side);contacts.push({hand_world:R.world(q,q.arms[i][2]),prop_world:p})}
function title(tx){return tx.title('OLD PHOTOS.',118,117,318,ink)}
function rail(x,top,bottom,side){return P(`M${x+side*36} ${top}H${x}V${bottom}H${x+side*36}`,ink,15)+P(`M${x+side*26} ${top+12}H${x+side*12}V${bottom-12}H${x+side*26}`,paper,3)}
function group(t,tx){
 // These rails actually exclude the two outer people. They must push the
 // same physical borders open, rather than receiving an explanatory label.
 const l=K(t,[[16,145],[16.4,145],[17,432],[18.9,432],[19.38,444],[19.65,420],[20.15,146],[20.37,160],[21.8,160]]);
 const r=K(t,[[16,1170],[16.4,1170],[17,908],[18.9,908],[19.38,896],[19.65,921],[20.15,1170],[20.37,1156],[21.8,1156]]);
 const squeeze=E(t,16.4,17),reveal=E(t,19.4,20.15);
 const people=[];
 for(let i=0;i<4;i++){
  const outer=i===0||i===3,side=i===0?-1:1;
  const entry=E(t,18.15,18.9);
  const x=outer?((i===0?295:1040)*(1-entry)+(i===0?l+54:r-54)*entry):[0,571,773,0][i]+(i===1?-1:1)*12*E(t,19.4,20.15);
  const base={x,fc:x,s:.70,head:outer?side*8:0,legH:140,spread:46};
  let q=R.track(t,[
   [16,{head:outer?side*8:0,mood:'flat',la:110,lb:130,ra:70,rb:50}],
   [16.5,{head:outer?side*-12:5,mood:'curious'}],
   [17,{head:outer?side*-18:i===1?14:-10,mood:outer?'grit':'curious',bend:outer?-side*12:0}],
   [17.35,{head:outer?side*-14:i===1?-17:18,bend:outer?-side*12:i===1?-12:12,la:i===1?154:outer?110:110,lb:i===1?210:outer?130:130,ra:i===2?24:70,rb:i===2?-45:50}],
   [17.85,{head:outer?side*-12:i===1?9:-9,bend:outer?-side*12:i===1?13:-13,la:i===1?112:110,lb:i===1?145:130,ra:i===2?83:70,rb:i===2?23:50}],
   [18.35,{head:outer?side*-16:i===1?-17:18,legH:outer?126:140,bend:outer?-side*12:i===1?-16:16,la:110,lb:130,ra:70,rb:50}],
   [18.9,{head:outer?side*5:i===1?18:-18,mood:outer?'grit':'shock',bend:outer?side*22:0}],
   [19.4,{legH:outer?113:140,bend:outer?side*28:0,head:outer?-side*13:i===1?-18:18}],
   [19.65,{legH:outer?116:136,bend:outer?side*20:i===1?10:-10,mood:outer?'grit':'shock'}],
   [20.15,{legH:outer?139:135,bend:outer?-side*17:i===1?-13:13,head:outer?side*15:i===1?17:-17,mood:'shock'}],
   [20.45,{legH:140,bend:outer?-side*8:0,head:outer?side*10:i===1?-10:10,mood:'flat'}],
   [20.9,{head:outer?-side*8:i===1?8:-8,mood:'curious',ra:outer?54:20,rb:outer?22:-45}],
   [21.3,{head:outer?side*10:i===1?-7:7,ra:outer?67:28,rb:outer?38:-22}],
   [21.8,{head:outer?-side*5:i===1?9:-9}]
  ],base);
  if(outer&&t>=18.7){
   // At first the hands are hidden by the crop. The wrists and then heads
   // emerge at its inner edge; both hands stay on the rail during the shove.
   const edge=i===0?l:r;
   const y=R.world(q,q.shoulder)[1];
   grip(q,0,[edge,y-22],i===0?-1:1);
   grip(q,1,[edge,y+49],i===0?-1:1);
  }
  people.push({q,i});
 }
 let a=B.ground();
 // The tall photo is a physical print, not a UI panel. Muted bar lights and
 // counter carry location; no additional dates, captions, hearts or claims.
 a+=`<path d="M${l} 485L${r} 485L${r} 1000L${l} 1000Z" fill="${paper}" stroke="${ink}" stroke-width="7"/>`;
 a+=`<defs><clipPath id="photo-interior"><rect x="${l+9}" y="494" width="${r-l-18}" height="484"/></clipPath></defs><g clip-path="url(#photo-interior)">`;
 a+=B.rect(155,495,1010,483,'#D9CCB8',0);
 for(const x of [300,660,1020])a+=P(`M${x} 495V544`,ink,5)+`<path d="M${x-44} 544L${x+44} 544L${x+70} 585H${x-70}Z" fill="${tan}" stroke="${ink}" stroke-width="5"/>`;
 a+=B.rect(160,882,1000,96,'#BAA78A',0)+P('M160 882H1160',ink,6);
 for(const {q,i} of people)a+=R.actor(t,q,{id:'photo-person-'+i,female:i===1});
 a+='</g>';
 a+=rail(l,485,1000,1)+rail(r,485,1000,-1);
 // Grips sit on top of the rails, not detached from a clipped-out forearm.
 if(t>=18.7)for(const {q,i} of people.filter(p=>p.i===0||p.i===3))for(const arm of q.arms){let p=R.world(q,arm[2]);a+=C(...p,7,ink)}
 // A rejected narrow offcut curls away when the whole group forces its way
 // back into view. This is paper, not a floating abstract mood shape.
 if(t>=20.15){let u=E(t,20.15,21.65);a+=G(1080-260*u,520-115*Math.sin(u*Math.PI)+360*u,1,22+150*u,`<path d="M0 0Q-35 36 0 72L105 72Q72 36 105 0Z" fill="${paper}" stroke="${ink}" stroke-width="4"/>`+P('M19 18H87M18 31H74',gray,3))}
 return a;
}
function running(q,t,strength){
 // A walk/run cycle has a planted sole for the first half of each leg's
 // cycle, followed by a lifted recovery arc. Fixed-length IK bones only.
 const phase=(t-25.65)*2.35;
 const feet=[];
 for(let i=0;i<2;i++){
  const p=((phase+i*.5)%1+1)%1;
  const x=p<.5?62-248*p:-62+124*E(p,.5,1);
  const y=142-(p<.5?0:70*Math.sin((p-.5)*Math.PI*2));
  const original=q.localFeet[i];
  feet.push([original[0]+(x-original[0])*strength,original[1]+(y-original[1])*strength]);
 }
 for(let i=0;i<2;i++){
  const target=R.world(q,feet[i]);
  // reach() uses 86/84 arms; legs are intentionally solved at 80/80.
  const [x,y]=feet[i],d=Math.hypot(x,y),theta=Math.atan2(y,x)+(i?-1:1)*Math.acos(d/160);
  q.legs[i]=[[0,0],[80*Math.cos(theta),80*Math.sin(theta)],[x,y]];
 }
 q.supports=[];q.localFeet=feet;
}
function cameraArt(cx,cy,length,t){
 let a=B.rect(-112,-104,218,178,'#B9B6AA',8,12)+B.rect(-88,-139,96,40,tan,6,3)+B.rect(-127,-64,33,58,ink,5,3);
 a+=P('M-83-83H55M-82 47H-27',paper,5)+C(62,-72,13,ink)+C(62,-72,5,paper);
 a+=P('M-83 74L-98 124M82 74L100 124',ink,10)+P('M-103 124H106',ink,12);
 const spin=(cx-430)*.65;
 for(const x of [-78,80])a+=G(x,131,1,spin,`<circle r="31" fill="${tan}" stroke="${ink}" stroke-width="8"/>`+P('M-22 0H22M0-22V22',ink,4));
 a+=P('M-110-26H-152V22',ink,10);
 // Telescoping barrels overlap like nested metal tubes, never stretch a limb.
 for(let i=0;i<3;i++){let start=78+i*length/3,w=length/3+27,h=134-i*25;a+=B.rect(start,-36-h/2,w,h,i%2?tan:'#D7D2C7',7,3)+P(`M${start+14} ${-36-h/2+12}V${-36+h/2-12}`,paper,3)}
 a+=G(86+length,-36,1,0,`<ellipse rx="23" ry="47" fill="#869997" stroke="${ink}" stroke-width="9"/>`+P('M-7-27Q8-13-7 13',paper,6));
 return G(cx,cy,1,0,a);
}
function camera(t,tx){
 const cx=K(t,[[24.9,444],[25.35,430],[25.65,530],[26.1,692],[26.35,692],[26.85,761],[27.18,780],[27.65,810],[28.1,825],[28.8,850]]);
 const len=K(t,[[24.9,88],[25.35,86],[25.65,238],[26.1,272],[26.35,262],[26.85,232],[27.18,210],[27.65,185],[28.1,190],[28.8,190]]);
 const run=E(t,25.9,26.28)*(1-E(t,27.12,27.55));
 const ride=E(t,27.12,27.55),bob=-3*Math.sin((t-25.65)*25)*E(t,25.65,26.1)*(1-ride);
 const cy=827+bob;
 const q=R.track(t,[
  [24.9,{head:7,bend:8,la:115,lb:145,mood:'curious'}],
  [25.35,{head:12,bend:-14,legH:127,mood:'grit'}],
  [25.65,{head:24,bend:-22,legH:132,la:147,lb:206,mood:'shock'}],
  [26.1,{head:15,bend:-9,legH:139,la:160,lb:225,mood:'grit'}],
  [26.35,{head:-3,bend:10,legH:141,la:101,lb:27,mood:'grit'}],
  [26.85,{head:12,bend:18,legH:138,la:154,lb:219,mood:'shock'}],
  [27.12,{head:7,bend:15,legH:133,la:105,lb:30}],
  [27.55,{head:-12,bend:-17,legH:141,fly:20,la:140,lb:188,mood:'shock'}],
  [28.1,{head:10,bend:-7,fly:20,la:125,lb:151,mood:'flat'}],
  [28.8,{head:-8,bend:0,fly:20,la:107,lb:134,mood:'curious'}]
 ],{x:cx-221,fc:cx-221,s:.84});
 // Lean-back braking turns into a forced run, then a ride on the rear axle.
 q.x+=ride*31;
 running(q,t,run);
 if(ride>0){for(let i=0;i<2;i++){
  const p=R.local(q,[cx-132-i*43,cy+116]);
  const d=Math.hypot(...p);if(d<159.9){const a=Math.atan2(p[1],p[0])+(i?-1:1)*Math.acos(d/160);q.legs[i]=[[0,0],[80*Math.cos(a),80*Math.sin(a)],p]}
 }}
 grip(q,1,[cx-152,cy-26],-1);
 let a=B.ground();
 // The little old photo is chased by an absurdly large camera. It carries
 // four people throughout, never a manufactured romantic couple.
 const px=K(t,[[24.9,1050],[25.35,1050],[25.65,1115],[26.1,1155],[26.85,1175],[27.5,1235],[28.8,1380]]);
 a+=B.groupPhoto(px,718,.38,-8+4*Math.sin(t*8));
 a+=P(`M${px-62} 783L${px-45} 817H${px+48}`,ink,5)+C(px-31,829,13,tan)+C(px+36,829,13,tan);
 if(t>25.55&&t<27.55){for(let i=0;i<3;i++)a+=P(`M${cx-350-i*25} ${906+i*21}h${44+i*11}`,gray,3)}
 // Draw the strap behind the body. It is attached to the camera, not a third arm.
 a+=P(`M${cx-79} ${cy-110}Q${cx-385} ${cy+170} ${cx-83} ${cy+63}`,tan,8);
 a+=R.actor(t,q,{id:'dragged-photographer'});
 a+=cameraArt(cx,cy,len,t);
 // The right wrist is in front of the handle so the grip remains legible.
 a+=C(cx-152,cy-26,8,ink);
 if(t>=26.10&&t<26.48){for(let i=0;i<3;i++)a+=P(`M${cx-260-i*24} 983h36`,ink,3)}
 // After the chase, loose prints trail behind the moving camera. Each follows
 // its own ballistic arc and paper rotation, not generic radiating doodles.
 for(let i=0;i<4;i++){
  const u=E(t,27.03+i*.12,28.05+i*.12);if(u<=0)continue;
  const x=cx-25-265*u-i*43,y=cy-130-230*Math.sin(u*Math.PI*.9)+105*u;
  a+=B.groupPhoto(x,y,.20,(-18+i*13)-120*u);
 }
 return a;
}
function draw(t,tx){
 if(!((t>=16&&t<21.8)||(t>=24.9&&t<28.8)))return old.draw(t,tx);
 R.reset();contacts=[];
 const a=t<22?group(t,tx):camera(t,tx);
 return `<defs><clipPath id="gag-proof-left"><rect x="70" y="355" width="1140" height="662"/></clipPath></defs><g clip-path="url(#gag-proof-left)">${a}</g>${title(tx)}`;
}
module.exports={draw,inspected:()=>R.inspected(),contacts:()=>contacts};
