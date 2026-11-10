/* Different semantic verbs per scene; V8's two reviewed gags are unchanged.
 * All left performers are anonymous illustrations, not photographic evidence.
 * Presenter/captions/audio are supplied unchanged by the existing renderer. */
const R=require('./acting-rig.cjs');
const proof=require('./stage-gag-proof.cjs');
const old=require('./stage-acting.cjs');
const {props:B}=require('./stage-semantic.cjs');
const {P,G,C,ink,red,gray,burst}=require('./actor.cjs');
const paper='#FBFAF8',tan='#BEA98B',rad=x=>x*Math.PI/180;
const E=(t,a,b)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u)};
const K=(t,keys)=>R.curve(t,keys);
let contacts=[],delegated=null;
function title(tx,s,n=128,c=ink,y=318){return tx.title(s,n,117,y,c)}
function wrist(q,i=1){return R.world(q,q.arms[i][2])}
function grip(q,i,p,side){R.reach(q,i,p,side);contacts.push({hand_world:wrist(q,i),prop_world:p})}
function held(q,art,{i=1,s=1,r=0}={}){const p=wrist(q,i);contacts.push({hand_world:p,prop_world:p});return G(...p,s,r,art)}
function blendGrip(q,i,p,u,side){
 if(u<=0)return;const before=q.arms[i];R.reach(q,i,p,side);const after=q.arms[i];
 if(u>.999){contacts.push({hand_world:wrist(q,i),prop_world:p});return}
 const angles=a=>[Math.atan2(a[1][1]-a[0][1],a[1][0]-a[0][0])*180/Math.PI,Math.atan2(a[2][1]-a[1][1],a[2][0]-a[1][0])*180/Math.PI];
 const a=angles(before),b=angles(after),delta=(x,y)=>((y-x+540)%360)-180;
 q.arms[i]=R.chain(q.shoulder,a[0]+delta(a[0],b[0])*u,a[1]+delta(a[1],b[1])*u);
}
function walk(q,t,u,rate=2.2,dir=1){
 if(u<=0)return;
 for(let i=0;i<2;i++){
  const p=((t*rate+i*.5)%1+1)%1;
  const x=dir*(p<.5?58-232*p:-58+116*E(p,.5,1));
  const y=139-(p<.5?0:53*Math.sin((p-.5)*2*Math.PI));
  const orig=q.localFeet[i],end=[orig[0]+(x-orig[0])*u,orig[1]+(y-orig[1])*u];
  const d=Math.hypot(...end),a=Math.atan2(end[1],end[0])+(i?-1:1)*Math.acos(d/160);
  q.legs[i]=[[0,0],[80*Math.cos(a),80*Math.sin(a)],end];
 }
 q.supports=[];
}
function sheet(x,y,s=1,r=0,{question=false}={}){return G(x,y,s,r,B.rect(-65,-95,130,190,paper,5)+P('M-43-65H42M-43-44H25M-43 53H38M-43 70H23',gray,4)+(question?B.question(-3,2,.29):P('M-43-20H42M-43 0H32M-43 20H42',gray,4)))}
function desk(x,y,s=1){return G(x,y,s,0,B.rect(-150,-30,300,30,tan,7)+P('M-126 0L-138 113M126 0L138 113',ink,9))}
function chip(x,y,s=1){let a=B.rect(-38,-38,76,76,'#99A278',5)+B.rect(-23,-23,46,46,'#6D7957',4);for(let i=-2;i<=2;i++)a+=P(`M${i*13}-48v-12M${i*13} 48v12M-48 ${i*13}h-12M48 ${i*13}h12`,ink,4);return G(x,y,s,0,a)}

function handshake(t,tx){
 const gx=K(t,[[7.08,610],[7.65,610],[7.94,620],[8.12,749],[8.4,691],[8.65,894],[9.05,874],[9.5,708],[9.89,708],[10.26,1090],[10.9,1350]]);
 const release=E(t,9.89,10.26),x=(gx-130)*(1-release)+588*release;
 const q=R.track(t,[
  [7.08,{head:-7,ra:8,rb:-31,mood:'happy'}],[7.65,{bend:12,legH:136,head:9}],
  [7.94,{bend:-18,head:19,la:153,lb:203,mood:'shock'}],[8.12,{bend:-25,head:-12,la:170,lb:230}],
  [8.4,{bend:20,head:13,la:105,lb:40,mood:'grit'}],[8.65,{bend:-25,head:20,la:155,lb:211,mood:'shock'}],
  [9.05,{bend:-9,head:5,la:100,lb:32}],[9.5,{bend:22,head:-14,legH:122,la:146,lb:206,mood:'grit'}],
  [9.89,{head:15}],[10.26,{bend:-14,head:-16,legH:141,ra:4,rb:-40,la:160,lb:199,mood:'shock'}],
  [10.5,{bend:6,head:7,ra:22,rb:-22}],[10.7,{head:12,ra:-3,rb:-60,mood:'sad'}],[10.9,{head:-7,ra:35,rb:-2,bend:0}]
 ],{x,fc:x,s:.93});
 const gy=K(t,[[7.08,760],[7.94,754],[8.12,742],[8.4,777],[8.65,735],[9.05,754],[9.5,783],[9.89,783],[10.26,650],[10.9,580]]);
 const u=E(t,7.66,7.94)*(1-release);
 // After release, the glove leaves independently; never solve the arm toward
 // an already departing object, even while blending out the previous pose.
 blendGrip(q,1,t>9.89?[708,783]:[gx,gy],u,-1);
 walk(q,t,E(t,7.94,8.12)*(1-E(t,9.05,9.5)),2.8,1);
 let a=B.ground()+R.actor(t,q,{id:'handshake-drag'});
 if(t<10.9)a+=B.glove(gx,gy,1.44,K(t,[[7.08,-4],[8.12,7],[8.4,-8],[8.65,9],[9.5,-4],[10.9,-25]]));
 if(t>7.94&&t<9.5)for(let i=0;i<2;i++)a+=P(`M${q.x-175-i*22} ${930+i*21}h45`,gray,3);
 a+=burst(gx,gy,t,7.94,.8);
 return {a,head:title(tx,'CUSTOMER',112,ink,282)+title(tx,'RELATIONS?',126,red,418)};
}
function identity(t,tx){
 const q=R.track(t,[
  [10.9,{head:-7,ra:24,rb:-25}],[11.35,{head:18,ra:3,rb:-32,mood:'shock'}],
  [11.7,{head:5,ra:16,rb:-18,mood:'curious'}],[12.32,{head:-13,la:136,lb:197}],
  [12.82,{head:20,bend:-18,ra:26,rb:-5,mood:'shock'}],[13.2,{head:8,bend:13,ra:42,rb:8}],
  [13.65,{head:-8,bend:0,ra:55,rb:18,mood:'flat'}],[14.12,{ra:62,rb:25,head:12}],
  [14.6,{head:-6,ra:48,rb:1,la:139,lb:207,mood:'curious'}],[15.15,{head:10,ra:17,rb:-34}],
  [15.65,{head:-8,ra:40,rb:-5}],[16,{head:2,ra:55,rb:15}]
 ],{x:342,fc:342,s:.88});
 const p=wrist(q),settle=E(t,13.2,14.12),s=K(t,[[10.9,.12],[11.35,1.18],[11.6,1.1],[12.82,1.1],[14.12,.97],[16,.97]]);
 const tilt=K(t,[[10.9,-35],[11.35,8],[11.7,-4],[12.32,3],[12.82,-24],[13.2,17],[14.12,0],[16,0]]);
 const bx=(p[0]+194*s*Math.cos(rad(tilt)))*(1-settle)+854*settle,by=(p[1]+194*s*Math.sin(rad(tilt)))*(1-settle)+898*settle;
 let a=B.ground();
 const rise=E(t,12.82,13.65),f=R.track(t,[[10.9,{fly:-220,head:0}],[12.82,{fly:-220}],[13.65,{fly:0,head:-8,ra:15,rb:-40}],[14.3,{head:8,ra:45,rb:-5}],[15,{head:-5,ra:20,rb:-30}],[16,{head:5,ra:55,rb:10}]],{x:949,fc:949,s:.75});
 a+=`<defs><clipPath id="office-reveal"><rect x="640" y="470" width="537" height="517"/></clipPath></defs><g clip-path="url(#office-reveal)">${R.actor(t,f,{female:true,id:'anonymous-executive'})}</g>`;
 if(rise>0)a+=desk(958,908,.95)+chip(1000,854,.78)+G(878,847,.6,0,B.rect(-76,-70,145,87,'#B5B4AA',6)+P('M-76 17L-100 39H95L69 17',ink,6));
 a+=R.actor(t,q,{id:'badge-reporter'});
 a+=B.badge(bx,by,s,tilt,tx);
 // Its left edge is the held edge until the badge becomes a desk placard.
 if(settle===0)contacts.push({hand_world:p,prop_world:[bx-194*s*Math.cos(rad(tilt)),by-194*s*Math.sin(rad(tilt))]});
 return {a,head:''};
}
function dinner(t,tx){
 let a=B.ground();const lid=E(t,21.96,22.32),x=662,y=818-320*lid;
 for(let i=0;i<4;i++){
  const xx=280+i*247,q=R.track(t,[[21.8,{legH:91,head:(i-1)*5,ra:8,rb:-22,la:170,lb:215}],[22.32,{head:i%2?15:-15,ra:-10,rb:-58,mood:'shock'}],[22.8,{head:i%2?-9:9,ra:18,rb:-15,mood:'happy'}],[23.4,{head:i%2?9:-9,ra:6,rb:-40}],[24,{head:i%2?-7:7,ra:30,rb:-5}],[24.9,{head:0,ra:9,rb:-26}]],{x:xx,fc:xx,s:.69});
  a+=R.actor(t,q,{id:'dinner-'+i,female:i===1});
  const h=wrist(q);a+=G(...h,.7,i%2?-15:15,P('M0 0v-45M-9-45v-15M0-45v-15M9-45v-15M-9-45H9',ink,5));
 }
 a+=G(640,890,1,0,B.rect(-531,-20,1062,32,tan,7)+P('M-470 12L-491 98M470 12L491 98',ink,8));
 for(let i=0;i<4;i++)a+=`<ellipse cx="${280+i*247}" cy="858" rx="72" ry="17" fill="${paper}" stroke="${ink}" stroke-width="5"/>`;
 a+=G(x,y,1.1,-7*Math.sin(lid*Math.PI),`<path d="M-187 0Q-173-190 0-190Q173-190 187 0Z" fill="#C4C4B8" stroke="${ink}" stroke-width="8"/>`+P('M-209 0H209M-25-193Q-28-227 0-227Q28-227 25-193',ink,10)+P('M-133-48Q-113-124-56-144',paper,8));
 if(t>22.32){for(let i=0;i<3;i++){const u=E(t,22.32+i*.07,23.4+i*.07);a+=G(610+i*43,831-136*Math.sin(u*Math.PI),.55,-18+i*13+25*Math.sin(u*Math.PI),B.rect(-29,-22,58,44,'#C0A57D',4))}}
 return {a,head:title(tx,'OLD PHOTOS.',118)};
}
function correction(t,tx){
 const q=R.track(t,[[28.8,{ra:10,rb:-35,head:7,mood:'curious'}],[29.15,{ra:-12,rb:-50,bend:-8,head:14}],[29.34,{ra:-32,rb:-69,bend:-15,head:17,mood:'grit'}],[29.66,{ra:-2,rb:-39,bend:12,head:-12,mood:'shock'}],[30.08,{ra:20,rb:-15,head:9,bend:0}],[30.4,{ra:30,rb:-6,head:-7,mood:'curious'}],[30.96,{head:2,ra:40,rb:3}]],{x:400,fc:400,s:.91});
 const tilt=K(t,[[28.8,4],[29.15,0],[29.34,-27],[29.66,8],[30.08,-4],[30.96,0]]),h=wrist(q);
 let a=B.ground()+R.actor(t,q,{id:'rejecting-inference'})+held(q,B.groupPhoto(218,0,.97,0),{r:tilt});
 const stampx=K(t,[[28.8,810],[29.15,795],[29.34,767],[29.66,1000],[30.08,1115],[30.96,1260]]),stampy=K(t,[[28.8,432],[29.15,470],[29.34,520],[29.66,455],[30.08,946],[30.96,1030]]),r=K(t,[[28.8,-6],[29.34,-10],[29.66,69],[30.08,147],[30.96,175]]);
 a+=B.stamp(stampx,stampy,1.17,r)+burst(790,590,t,29.34,.8);
 return {a,head:title(tx,'NOT PROOF.',128,red)};
}
function apology(t,tx){
 const q=R.track(t,[[30.96,{head:7,ra:33,rb:-7,mood:'curious'}],[31.25,{ra:12,rb:-35,head:18}],[31.7,{head:-8,bend:-8,ra:28,rb:-9}],[32.25,{x:368,fc:368,head:8,bend:-15,ra:7,rb:-35}],[32.95,{x:330,fc:330,head:-11,bend:0,ra:25,rb:-5,mood:'sad'}],[33.4,{x:290,fc:290,bend:-18,head:17,ra:0,rb:-37}],[33.7,{head:-9,ra:22,rb:-8,bend:2}],[34.2,{head:10,la:150,lb:217,ra:35,rb:6}],[34.98,{head:-8,bend:0,ra:50,rb:18}]],{x:400,fc:400,s:.9});
 walk(q,t,E(t,31.7,32.0)*(1-E(t,33.25,33.4)),1.8,-1);
 const h=wrist(q),source=[854,865],len=E(t,31.25,33.7);
 let a=B.ground()+B.phone(875,670,2.05,-3);
 a+=G(875,625,1,0,B.heart(.62))+P('M819 692H916M819 720H891',gray,7);
 a+=`<path d="M${source[0]-42} ${source[1]}C${source[0]-20} ${1012+len*45} ${h[0]+110} ${h[1]+90} ${h[0]} ${h[1]+27}L${h[0]} ${h[1]-27}C${h[0]+120} ${h[1]+30} ${source[0]+30} ${946+len*40} ${source[0]+42} ${source[1]}Z" fill="${paper}" stroke="${ink}" stroke-width="5"/>`;
 // Empty name field is a property of this receipt, not another floating label.
 a+=P(`M${h[0]+35} ${h[1]-8}l81 24M${h[0]+42} ${h[1]+10}l75 22`,gray,3);
 for(let i=0;i<3;i++){const u=E(t,32+i*.42,32.6+i*.42);if(u>0)a+=sheet(790-i*71,985-20*Math.sin(u*Math.PI),.55,-10+i*8)}
 a+=R.actor(t,q,{id:'unnamed-apology-reader'});contacts.push({hand_world:h,prop_world:h});
 return {a,head:''};
}
function rewind(t,tx){
 const spin=E(t,35.02,36.24),q=R.track(t,[[34.98,{head:-7,ra:35,rb:-8}],[35.15,{head:20,la:153,lb:215,ra:-25,rb:-65,mood:'shock'}],[35.55,{head:-12,bend:-17,ra:-38,rb:-80}],[35.9,{head:12,bend:10,ra:5,rb:-40}],[36.24,{head:-5,bend:0,ra:48,rb:5,mood:'curious'}]],{x:335,fc:335,s:.88});
 let a=B.ground()+G(852,717,1,-spin*1080,`<circle r="166" fill="${tan}" stroke="${ink}" stroke-width="9"/>`+[-120,-60,0,60,120,180].map(r=>G(0,0,1,r,C(91,0,35,paper))).join('')+C(0,0,22,ink));
 const x=K(t,[[34.98,280],[35.15,325],[35.9,820],[36.24,860]]);
 a+=`<path d="M${x} 851Q${x+180} 990 850 879L850 829Q${x+180} 940 ${x} 801Z" fill="${paper}" stroke="${ink}" stroke-width="6"/>`;
 for(let i=0;i<6;i++){const xx=x+(850-x)*i/6;a+=B.rect(xx,834+(i%2)*15,17,12,ink,0)}
 a+=R.actor(t,q,{id:'rewind-reader'});
 return {a,head:title(tx,'PLOT TWIST.',142,red)};
}
function committee(t,tx){
 const q=R.track(t,[[36.24,{head:-6,ra:47,rb:5}],[37.5,{head:18,ra:20,rb:-32,mood:'shock'}],[37.79,{head:-9}],[38.08,{head:16,la:146,lb:204}],[38.5,{head:-6,mood:'curious'}],[39.3,{head:11,ra:4,rb:-40}],[39.95,{head:19,ra:-14,rb:-54,mood:'shock'}],[40.42,{head:-9,ra:1,rb:-38,la:128,lb:190}],[40.85,{head:12,ra:18,rb:-17,mood:'curious'}],[41.3,{head:-6,ra:28,rb:-7}],[41.64,{head:7}]],{x:330,fc:330,s:.85});
 let a=B.ground();
 for(let i=0;i<3;i++){
  const at=37.5+i*.29,cx=K(t,[[36.8+i*.29,1360],[at,687+i*171],[at+.12,676+i*171],[at+.38,687+i*171],[41.64,687+i*171]]);
  const member=R.track(t,[[36.24,{legH:86,head:0}],[at,{head:17,mood:'shock'}],[at+.2,{head:-11}],[at+.5,{head:0,mood:'flat'}],[39.95,{head:-13,ra:3,rb:-37}],[40.42,{head:11,ra:34,rb:-6}],[41.64,{head:-5,ra:55,rb:12}]],{x:cx,fc:cx,s:.65});
  a+=B.chair(cx,852,.65,0)+R.actor(t,member,{id:'committee-chair-'+i});
 }
 a+=desk(857,911,1.62);
 for(let i=0;i<3;i++)a+=P(`M${689+i*169} 875v-43`,ink,5)+G(689+i*169,829,1,-16,B.rect(-10,-24,20,36,'#A7A69D',4));
 const ex=K(t,[[38.6,1370],[39.35,732],[41.64,732]]);
 if(t>=38.6)a+=B.envelope(ex,887,.94,-4,E(t,39.55,39.95));
 const h=wrist(q);
 for(let i=0;i<3;i++){
  const u=E(t,39.95+i*.10,40.42+i*.15);if(u<=0)continue;
  const target=i===0?[h[0]+65*.72,h[1]-95*.72]:[808+(i-1)*164,727+(i-1)*38];
  const x=ex+(target[0]-ex)*u,y=854+(target[1]-854)*u-160*Math.sin(u*Math.PI);
  a+=sheet(x,y,.72,-21*(1-u)+(i===0?0:(i-1)*10*u),{question:true});
  if(i===0&&u===1)contacts.push({hand_world:h,prop_world:[x-65*.72,y+95*.72]});
 }
 a+=R.actor(t,q,{id:'question-recipient'});
 return {a,head:''};
}
function reports(t,tx){
 const q=R.track(t,[[41.64,{head:7,ra:10,rb:-28,la:108,lb:146,mood:'curious'}],[42.1,{bend:-10,head:16,ra:0,rb:-31}],[42.5,{bend:-17,head:19,ra:-18,rb:-51,mood:'shock'}],[42.9,{bend:12,head:-14,ra:24,rb:-7}],[43.35,{bend:-9,head:12,ra:2,rb:-29}],[43.9,{head:-8,ra:12,rb:-20,mood:'curious'}],[44.24,{head:12,ra:5,rb:-28}],[45.18,{head:-12,ra:30,rb:3,bend:0}],[45.7,{head:13,ra:1,rb:-32,la:150,lb:213}],[46.2,{head:-7,ra:19,rb:-12}],[46.9,{head:11,ra:55,rb:22,mood:'sad'}],[47.4,{head:-8,ra:59,rb:26}],[47.98,{head:0,ra:52,rb:16}]],{x:326,fc:326,s:.9});
 const h=wrist(q),open=E(t,41.64,42.5),flip=E(t,44.5,45.18),rot=K(t,[[41.64,-5],[42.5,-17],[42.9,10],[43.35,-6],[43.9,6],[44.24,-4],[45.18,0],[46.9,14],[47.98,14]]);
 const width=340+270*open,back=flip>.5;
 const art=`<path d="M0-208Q${-28*Math.sin(t*4)*open}-18 0 208L${width} 208Q${width+34*Math.sin(t*4)*open} 12 ${width}-208Z" fill="${paper}" stroke="${ink}" stroke-width="7"/>`+
  P(`M25-169H${width-25}M25-144H${width-25}M${width*.5}-125V174`,gray,4)+
  (back?P(`M35-85H${width*.43}M35-58H${width*.4}M35-31H${width*.43}M${width*.55}-85H${width-35}M${width*.55}-58H${width-35}`,gray,5):B.question(width*.72,-5,.83)+P(`M35-90H${width*.43}M35-64H${width*.4}M35-38H${width*.43}M35 18H${width*.43}M35 44H${width*.4}M35 70H${width*.43}M35 96H${width*.4}`,gray,5));
 let a=B.ground()+R.actor(t,q,{id:'report-reader'});
 const squeeze=Math.max(.08,Math.abs(Math.cos(flip*Math.PI)));
 a+=held(q,`<g transform="scale(${squeeze} 1)">${art}</g>`,{r:rot});
 if(t>45.18){const u=E(t,45.18,45.7);a+=G(925,661,.53*u,0,B.lens(0,0,1))}
 return {a,head:''};
}
function vault(t,tx){
 const q=R.track(t,[[47.98,{head:0,ra:8,rb:-32,la:107,lb:139,mood:'curious'}],[48.5,{head:13,bend:10,ra:1,rb:-35}],[49.08,{head:15,bend:14,legH:139,mood:'grit'}],[49.4,{head:20,bend:20}],[49.78,{head:12,bend:15}],[50.15,{head:25,bend:23,mood:'curious'}],[50.74,{head:15,bend:10}],[51.2,{head:-11,bend:0,ra:35,rb:0,la:120,lb:165}],[51.7,{x:617,fc:617,head:15,la:145,lb:210,ra:16,rb:-35}],[52.32,{x:540,fc:540,head:-8,la:126,lb:177,ra:15,rb:-36}],[53.04,{head:8,ra:45,rb:8}]],{x:715,fc:715,s:.9});
 const handle=K(t,[[47.98,0],[49.08,0],[49.4,14],[49.78,-9],[50.15,12],[50.74,12],[51.2,0],[53.04,0]]),a=rad(handle),cx=855.6,cy=761.96;
 const u=E(t,48.5,49.08)*(1-E(t,50.74,51.2));
 blendGrip(q,0,[cx-28*Math.cos(a),cy-28*Math.sin(a)+10],u,-1);
 blendGrip(q,1,[cx-54*Math.cos(a),cy-54*Math.sin(a)-8],u,1);
 walk(q,t,E(t,51.2,51.45)*(1-E(t,52.12,52.32)),1.7,-1);
 return {a:B.ground()+B.vault(930,788,.93,handle)+R.actor(t,q,{id:'closed-vault-check'}),head:''};
}
function inquiry(t,tx){
 const q=R.track(t,[[53.04,{head:8,ra:40,rb:6}],[53.28,{head:19,ra:5,rb:-18,mood:'shock'}],[53.7,{head:11,ra:20,rb:35,la:155,lb:217}],[54,{head:12,ra:27,rb:44,mood:'curious'}],[54.33,{x:500,fc:500,head:17,ra:15,rb:30}],[54.7,{x:591,fc:591,head:12,ra:24,rb:42}],[55.1,{x:690,fc:690,head:17,ra:15,rb:30}],[55.4,{x:735,fc:735,head:12,ra:20,rb:35}],[56.36,{head:8,ra:21,rb:32}]],{x:370,fc:370,s:.9});
 walk(q,t,E(t,54,54.2)*(1-E(t,55.15,55.4)),1.7,1);
 const h=wrist(q),u=E(t,53.28,53.7),s=.82,angle=140*rad(1),dx=s*(180*Math.cos(angle)-190*Math.sin(angle)),dy=s*(180*Math.sin(angle)+190*Math.cos(angle)),center=[h[0]-dx,h[1]-dy];
 let a=B.ground()+B.briefcase(220,925,.6,0,E(t,53.04,53.28));
 for(let i=0;i<4;i++)a+=sheet(560+i*171,891,.86,-12+i*7,{question:true});
 if(t>=53.28){
  const x=220+(center[0]-220)*u,y=760+(center[1]-760)*u-215*Math.sin(u*Math.PI);
  a+=B.lens(x,y,s,-38*(1-u)+140*u);
  if(u>=1)contacts.push({hand_world:h,prop_world:[x+dx,y+dy]});
 }
 a+=R.actor(t,q,{id:'document-investigator'});
 return {a,head:title(tx,'AN INQUIRY.',128)};
}
function finale(t,tx){
 const q=R.track(t,[[56.36,{head:8,ra:10,rb:-34}],[56.85,{head:-10,ra:1,rb:-43,mood:'sad'}],[57.4,{head:12,ra:16,rb:-20}],[58.1,{head:-10,ra:6,rb:-36}],[58.52,{head:6,ra:21,rb:-15}],[59.2,{head:19,ra:-18,rb:-52,mood:'shock'}],[59.72,{legH:127,bend:-14,head:-12,ra:-32,rb:-70,la:151,lb:209}],[60.03,{legH:140,bend:7,head:15,ra:14,rb:-27}],[60.15,{head:-10,ra:-16,rb:-55}],[60.65,{head:12,ra:-2,rb:-36,la:130,lb:190,mood:'curious'}],[61.15,{head:-8,ra:-8,rb:-47}],[61.34,{head:11,ra:10,rb:-23,mood:'happy'}],[61.9,{head:-6,ra:22,rb:-8}],[62.5,{head:8,ra:10,rb:-26}],[63.54,{head:-5,ra:19,rb:-10}]],{x:365,fc:365,s:.91});
 let a=B.ground();
 if(t<59.72)a+=held(q,B.phone(27,-15,.64,-8));
 else{const u=E(t,59.72,60.15);a+=B.phone(519-70*u,760+196*u,.64,-8+98*u)}
 const cy=K(t,[[59.2,-230],[59.72,865],[59.86,846],[60.03,865],[63.54,865]]);
 if(t>=59.2){
  // Legal figures rise out of the open case, rather than falling from nowhere.
  const open=E(t,60.03,60.15);
  a+=G(895,cy,1.3,0,B.rect(-192,-142,384,253,'#A59072',9,13));
  // The lid opens BEHIND the emerging figures. A diagonal foreground lid
  // would hide their heads and leave a confusing pair of dangling legs.
  a+=G(895,cy,1.3,0,B.rect(-192,-142-147*open,384,Math.max(8,147*open),'#D1BEA2',8,8)+P(`M-62 ${-142-147*open}v-32h124v32`,ink,13));
  if(t>=60.15){for(let i=0;i<2;i++){
   const rise=E(t,60.15+i*.1,60.65+i*.1),xx=801+i*195;
   const lawyer=R.track(t,[[60.15,{fly:-110,head:12,ra:20,rb:-22}],[60.65,{fly:103,head:-9,ra:3,rb:-36}],[61.34,{head:10,ra:27,rb:-7}],[62.04,{head:-8,ra:8,rb:-29}],[63.54,{head:7,ra:31,rb:-1}]],{x:xx,fc:xx,s:.61});
   // Per-figure emergence stagger is geometric, not an opacity pop.
   lawyer.y+=73*(1-rise);
   a+=`<defs><clipPath id="case-lawyer-${i}"><rect x="650" y="430" width="500" height="425"/></clipPath></defs><g clip-path="url(#case-lawyer-${i})">${R.actor(t,lawyer,{id:'anonymous-lawyer-'+i})}${sheet(...wrist(lawyer),.48,i?-9:9)}</g>`;
  }}
  a+=G(895,cy,1.3,0,B.rect(-192,-10,384,121,tan,9,11)+B.rect(-22,6,44,40,paper,5,4));
  a+=burst(895,984,t,59.72,1.1);
 }
 if(t>=60.15)for(let i=0;i<5;i++){const u=E(t,60.15+i*.04,60.65+i*.04);a+=sheet(885+(i-2)*114*u,702-195*Math.sin(u*Math.PI)+150*u,.52,-34+i*17+55*u)}
 const h=wrist(q);
 if(t>=60.15){const u=E(t,60.15,60.65),x=895+(h[0]-895)*u,y=670+(h[1]-670)*u-170*Math.sin(u*Math.PI);a+=G(x,y,1,-30*(1-u),B.clapper(113*.74,0,.74,0,1-E(t,61.15,61.34)));if(u>=1)contacts.push({hand_world:h,prop_world:[x,y]})}
 a+=R.actor(t,q,{id:'documentary-button'});
 return {a,head:t<59.2?title(tx,'APOLOGY.',148):title(tx,'LAWYERS.',176,red)};
}
function draw(t,tx){
 delegated=null;
 if((t>=16&&t<21.8)||(t>=24.9&&t<28.8)){delegated=proof;return proof.draw(t,tx)}
 if(t<7.08){delegated=old;return old.draw(t,tx)}
 R.reset();contacts=[];
 const f=t<10.9?handshake:t<16?identity:t<24.9?dinner:t<30.96?correction:t<34.98?apology:t<36.24?rewind:t<41.64?committee:t<47.98?reports:t<53.04?vault:t<56.36?inquiry:finale;
 const {a,head}=f(t,tx);
 return `<defs><clipPath id="causal-left"><rect x="70" y="355" width="1140" height="662"/></clipPath></defs><g clip-path="url(#causal-left)">${a}</g>${head}`;
}
module.exports={draw,inspected:t=>delegated?delegated.inspected(t):R.inspected(),contacts:()=>delegated?delegated.contacts():contacts};
