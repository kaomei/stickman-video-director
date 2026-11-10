/* Full-film V7. Preserve the approved story, presenter, typography and audio.
 * Each gag has its own preparation/contact/consequence/recovery, rather than
 * looping one successful flip. Left performers are anonymous illustrations. */
const R=require('./acting-rig.cjs'),V3=require('./proof-v3.cjs');
const {props:B,events}=require('./stage-semantic.cjs');
const {P,G,C,ink,red,gray,burst}=require('./actor.cjs');
const {track,world,reach,actor,curve}=R;
const paper='#FBFAF8',tan='#BEA98B';
const clamp=x=>Math.max(0,Math.min(1,x)),E=(t,a,b)=>{let u=clamp((t-a)/(b-a));return u*u*(3-2*u)},O=(t,a,b)=>1-(1-clamp((t-a)/(b-a)))**3;
const v=(t,ks)=>curve(t,ks),pulse=(t,a,w)=>Math.exp(-Math.pow((t-a)/w,2)),rad=x=>x*Math.PI/180;
const wrist=(q,i=1)=>world(q,q.arms[i][2]);
let contacts=[];
function held(q,art,{r=0,s=1,i=1,dx=0,dy=0}={}){const p=wrist(q,i);contacts.push({hand_world:p,prop_world:p});return G(...p,s,r,G(dx,dy,1,0,art))}
const ground=()=>B.ground();
function desk(x,y,s=1,r=0){return G(x,y,s,r,B.rect(-150,-32,300,30,tan,7)+P('M-126 0L-138 113M126 0L138 113',ink,9))}
function chip(x,y,s=1){let a=B.rect(-38,-38,76,76,'#99A278',6)+B.rect(-23,-23,46,46,'#6D7957',4);for(let i=-2;i<=2;i++)a+=P(`M${i*13}-48v-12M${i*13} 48v12M-48 ${i*13}h-12M48 ${i*13}h12`,ink,5);return G(x,y,s,0,a)}
function laptop(x,y,s=1,r=0){return G(x,y,s,r,B.rect(-76,-80,145,87,'#B5B4AA',6)+chip(-4,-39,.4)+`<path d="M-76 7L-103 36H96L69 7Z" fill="${tan}" stroke="${ink}" stroke-width="6"/>`)}
function simple(t,x,s,keys,opts={}){const q=track(t,keys,{x,fc:x,s,...opts});return {q,art:actor(t,q,{id:opts.id||'support',female:!!opts.female})}}
function title(tx,txt,size=128,y=318,c=ink){return tx.title(txt,size,117,y,c)}
function paperSheet(b=0){return `<path d="M0-185Q${-b}-30 0 185L455 185Q${455+b} 40 455-185Z" fill="${paper}" stroke="${ink}" stroke-width="7"/>`+B.groupPhoto(228,-15,.92,0)}

function intro(t,tx){
 const q=track(t,[
  [0,{ra:-10,rb:-53,mood:'curious'}],[.65,{bend:9,head:9,la:99,lb:139}],
  [1.12,{legH:123,sx:1.09,sy:.89,bend:24,head:15,neckLag:9,ra:8,rb:-27,mood:'grit'}],
  [1.38,{sx:.89,sy:1.13,legH:146,bend:-28,head:19,neckLag:19,la:171,lb:213,ra:-36,rb:-91,mood:'shock'}],
  [1.58,{x:460,fc:460,fly:122,r:24,sx:1,sy:1,legH:108,head:-17,neckLag:-19,la:191,lb:239,ra:-60,rb:-108}],
  [1.86,{x:567,fc:567,fly:74,r:34,legH:130,bend:-18,head:-10,la:160,lb:208,ra:-23,rb:-76}],
  [2.13,{x:600,fc:600,fly:0,r:0,legH:114,sx:1.39,sy:.59,bend:26,head:18,neckLag:19,la:112,lb:167,ra:9,rb:-47,mood:'grit'}],
  [2.22,{sx:1.39,sy:.59}],[2.48,{sx:.92,sy:1.08,legH:144,bend:-17,head:-14,neckLag:-13,la:119,lb:153,ra:58,rb:15,mood:'shock'}],
  [2.69,{sx:1.04,sy:.97,bend:8,head:9,neckLag:5}],[3.04,{sx:1,sy:1,head:-7,bend:0,neckLag:0,mood:'flat'}],
  [3.65,{head:12,bend:12,ra:35,rb:-13}],[4.15,{x:580,fc:580,head:-7,bend:-8,la:124,lb:162}],
  [4.61,{x:560,fc:560,legH:127,bend:28,head:10,ra:15,rb:-30,mood:'grit'}],
  [4.88,{x:543,fc:550,sx:1.22,sy:.77,legH:126,bend:37,head:20,neckLag:17,la:157,lb:203,ra:13,rb:-35,mood:'shock'}],
  [5.10,{sx:.94,sy:1.07,legH:144,bend:-13,head:-14,neckLag:-12}],
  [5.42,{sx:1,sy:1,bend:4,head:5,neckLag:3,la:107,lb:146,ra:45,rb:-2,mood:'flat'}],
  [6.05,{head:-8,bend:-8,ra:24,rb:-24}],[6.45,{head:5,bend:8,ra:36,rb:-7}],[7.08,{bend:0,head:0,ra:49,rb:10}]
 ],{x:365,fc:365});
 let a=ground();
 if(t<1.38){const zip=E(t,.7,1.12);a+=held(q,G(138,-79,1.05,-7,`<path d="M-135-65Q-139-119-67-118H113Q174-110 162-32Q155 25 85 24H-50L-91 69L-83 24Q-140 20-135-65Z" fill="${paper}" stroke="${ink}" stroke-width="7"/>`+P('M-94-46H108',gray,4)+G(-94+zip*202,-46,1,0,B.rect(-8,-12,17,25,tan,3,3))))}
 if(t>=1.38&&t<2.3){let u=O(t,1.38,1.9);for(let i=0;i<7;i++)a+=G(515+Math.cos(i*.9)*u*240,600+Math.sin(i*.9)*u*160,1-u,i*31,B.star(0,0,14));a+=burst(515,600,t,1.38,1.5)}
 if(t>4){let cx=v(t,[[4,1280],[4.88,784],[5.04,774],[5.2,786],[7.08,786]]),cr=v(t,[[4,-4],[4.80,-4],[4.88,9],[5.12,-3],[5.4,0],[7.08,0]]);a+=B.cart(cx,925,1,cr)}
 a+=actor(t,q)+burst(600,982,t,2.13,1);
 if(t>=2.4){const f=simple(t,1030,.65,[[2.4,{fly:-130,head:7}],[3.18,{fly:0,head:-5}],[4.88,{legH:121,sy:.84,sx:1.11,head:18,bend:-14,mood:'shock'}],[5.17,{legH:144,sy:1.05,sx:.96,head:-10}],[5.5,{sy:1,sx:1,head:-5,mood:'flat'}],[6.4,{head:7}],[7.08,{head:-4}]],{female:true,id:'client'});a+=f.art+desk(1030,909,.83)+laptop(1030,851,.61)+chip(1080,922,.55)}
 return {a,head:t>=1.38&&t<4?title(tx,'CHEATING.',128,327,red):''};
}
function handshake(t,tx){
 const q=track(t,[
  [7.08,{ra:8,rb:-31,head:-7}],[7.65,{legH:130,bend:17,ra:2,rb:-35,head:8,mood:'happy'}],
  [7.94,{legH:117,sx:1.14,sy:.85,bend:25,head:19,neckLag:15,ra:8,rb:-28,la:142,lb:180,mood:'shock'}],
  [8.12,{legH:147,fly:46,sx:.91,sy:1.12,bend:-14,head:19,neckLag:15,ra:-28,rb:-66,la:161,lb:205}],
  [8.40,{legH:120,fly:0,sx:1.20,sy:.76,bend:23,head:-14,neckLag:-17,ra:20,rb:-20,la:109,lb:163,mood:'grit'}],
  [8.65,{legH:145,fly:64,sx:.90,sy:1.14,bend:-20,head:17,neckLag:17,ra:-37,rb:-78,la:148,lb:195,mood:'shock'}],
  [8.98,{legH:139,fly:0,sx:1,sy:1,bend:4,head:-9,neckLag:-6,ra:3,rb:-42}],
  [9.27,{legH:121,bend:29,head:11,ra:17,rb:-20,mood:'grit'}],
  [9.5,{legH:111,sx:1.52,sy:.48,bend:38,head:24,neckLag:21,ra:36,rb:-7,la:153,lb:199}],
  [9.88,{legH:111,sx:1.52,sy:.48}],[10.12,{legH:127,sx:1.2,sy:.77,bend:4,head:16}],
  [10.26,{legH:146,sx:.86,sy:1.15,bend:-22,head:-22,neckLag:-20,la:161,lb:205,ra:-30,rb:-74,mood:'shock'}],
  [10.5,{legH:132,sx:1.09,sy:.92,bend:14,head:14,neckLag:9,ra:48,rb:6}],
  [10.9,{legH:144,sx:1,sy:1,bend:0,head:-7,neckLag:0,la:107,lb:144,ra:58,rb:18,mood:'sad'}]
 ],{x:468,fc:468});
 const h=wrist(q);let a=ground();
 if(t<10.6){let exit=E(t,9.89,10.6);a+=B.glove(h[0]+610*exit,h[1]-170*exit,1.63,-4+exit*22)}
 a+=actor(t,q)+burst(...h,t,7.94,1)+burst(468,980,t,9.5,1);
 return {a,head:title(tx,'CUSTOMER',112,282)+title(tx,'RELATIONS?',126,418,red)};
}
function identity(t,tx){
 const q=track(t,[
  [10.9,{ra:14,rb:-31,head:0}],[11.35,{legH:128,bend:19,head:17,neckLag:8,ra:7,rb:-34,mood:'shock'}],
  [11.66,{legH:144,bend:-8,head:-10,neckLag:-6,ra:20,rb:-20,mood:'curious'}],
  [12.32,{head:11,bend:16,la:112,lb:158}],[12.70,{x:330,legH:121,sx:1.09,sy:.91,bend:-33,head:18,neckLag:14,ra:-5,rb:-38,la:140,lb:180,mood:'grit'}],
  [12.82,{x:328,legH:118,sx:1.14,sy:.83,bend:-40,head:23,ra:2,rb:-28}],
  [13.04,{x:368,fly:40,legH:143,sx:.92,sy:1.09,bend:25,head:-20,neckLag:-17,ra:-24,rb:-64,la:170,lb:215,mood:'shock'}],
  [13.35,{x:370,fc:370,fly:0,legH:122,sx:1.19,sy:.8,bend:24,head:16,neckLag:12,ra:14,rb:-30}],
  [13.62,{legH:144,sx:.96,sy:1.04,bend:-11,head:-12,neckLag:-8}],
  [14.12,{legH:124,sx:1.13,sy:.88,bend:19,head:14,neckLag:10,ra:31,rb:-11,mood:'grit'}],
  [14.40,{legH:144,sx:.97,sy:1.03,bend:-9,head:-7,neckLag:-6,ra:40,rb:0,mood:'flat'}],
  [14.9,{sx:1,sy:1,bend:0,head:5,neckLag:0,la:107,lb:145,ra:55,rb:15}],[15.48,{head:-8,bend:-8}],[16.02,{head:0,bend:0}]
 ],{x:350,fc:350,s:.87});
 const h=wrist(q),lid=v(t,[[10.9,0],[11.35,-15],[11.7,-7],[12.7,-3],[12.82,5],[13.05,-19],[13.35,6],[14.12,-10],[14.4,0],[16.02,0]]);
 let a=ground()+B.rect(550,592,560,402,'#C1AE91',7)+B.rect(583,554,310,43,tan,6);
 const f=simple(t,867,.77,[[10.9,{fly:-225,head:0}],[11.35,{fly:-225}],[11.98,{fly:0,head:-7}],[12.82,{legH:116,sx:1.17,sy:.82,bend:-15,head:18,mood:'shock'}],[13.08,{legH:144,sx:.92,sy:1.1,head:-13}],[13.48,{sx:1,sy:1,head:4,mood:'flat'}],[14.12,{head:-11,bend:10}],[14.65,{bend:0,head:6}],[16.02,{head:-4}]],{female:true,id:'executive'});
 a+=`<defs><clipPath id="executive-pocket"><rect x="554" y="596" width="552" height="394"/></clipPath></defs><g clip-path="url(#executive-pocket)">${f.art}${desk(880,917,.95)}${laptop(935,861,.67)}${chip(789,885,.55)}</g>`;
 a+=B.rect(550,887,560,107,tan,7)+G(550,847,1,lid,B.rect(0,0,560,42,tan,7)+P('M30 19H519',gray,4));
 // A visible paper pull-tab, not an extra line pretending to be a forearm.
 a+=G(h[0],h[1],1,-5,`<path d="M0-8L${550-h[0]} ${839-h[1]}L${550-h[0]} ${858-h[1]}L0 8Z" fill="${tan}" stroke="${ink}" stroke-width="4"/>`)+actor(t,q);
 a+=G(579,642,1,0,tx.imageTile('ALICE HUANG','Instrument-Sans-1.ttf',52,ink,0,0,0))+G(579,690,1,0,tx.imageTile('MEGASPEED','Instrument-Sans-1.ttf',34,ink,0,0,0));
 return {a,head:''};
}
function photos(t,tx){
 const q=track(t,[
  [16.02,{ra:5,rb:-34,head:-7}],[16.52,{bend:22,legH:131,ra:6,rb:-31,head:14,mood:'curious'}],
  [16.78,{legH:118,sx:1.18,sy:.82,bend:32,head:20,neckLag:17,ra:24,rb:-14,mood:'shock'}],
  [17.02,{legH:147,sx:.92,sy:1.08,bend:-19,head:-17,neckLag:-13,ra:-17,rb:-60}],
  [17.40,{legH:144,sx:1,sy:1,bend:3,head:7,neckLag:3,ra:7,rb:-35,mood:'curious'}],
  [18.16,{head:-12,bend:-11,la:117,lb:156}],[18.65,{head:12,bend:12}],
  [19.36,{legH:126,bend:-28,head:18,ra:19,rb:-17,la:140,lb:183,mood:'grit'}],
  [19.65,{legH:111,sx:1.31,sy:.68,bend:-41,head:22,neckLag:19,ra:32,rb:-4,la:160,lb:205}],
  [19.86,{legH:111,sx:1.31,sy:.68}],[20.15,{legH:146,sx:.88,sy:1.12,bend:28,head:-22,neckLag:-21,ra:-41,rb:-82,la:195,lb:235,mood:'shock'}],
  [20.43,{legH:132,sx:1.1,sy:.91,bend:-17,head:17,neckLag:12,ra:-1,rb:-40}],
  [20.80,{legH:144,sx:1,sy:1,bend:4,head:-7,neckLag:0,ra:4,rb:-36,la:107,lb:145,mood:'flat'}],
  [21.82,{head:12,bend:13,ra:13,rb:-23,mood:'curious'}],
  [22.16,{legH:124,bend:-26,head:16,ra:35,rb:1,mood:'grit'}],
  [22.32,{legH:114,sx:1.25,sy:.74,bend:-33,head:21,neckLag:15,ra:42,rb:4}],
  [22.55,{legH:145,sx:.90,sy:1.11,bend:24,head:-20,neckLag:-16,ra:-33,rb:-72,la:175,lb:213,mood:'shock'}],
  [22.87,{legH:127,sx:1.10,sy:.91,bend:-15,head:14,neckLag:11,ra:7,rb:-30}],
  [23.4,{legH:144,sx:1,sy:1,bend:3,head:-7,neckLag:0,ra:6,rb:-34,la:106,lb:142,mood:'curious'}],
  [24.1,{head:9,bend:8}],[24.9,{head:-9,bend:0}]
 ],{x:350,fc:350});
 const turn=E(t,22.01,22.55),tilt=v(t,[[16.02,-4],[16.78,8],[17.4,-4],[19.65,14],[20.15,-24],[20.8,-4],[22.32,15],[22.55,-25],[23.4,-4],[24.9,-5]]),bend=v(t,[[16.02,0],[19.3,0],[19.65,44],[20.15,-48],[20.8,0],[22.32,40],[22.55,-39],[23.4,0],[24.9,0]]);
 let photo=paperSheet(bend);if(turn>.5)photo=G(0,0,1,0,B.groupPhoto(228,-15,.92,0,true)+P('M0-185V185H455V-185Z',ink,7));
 let a=ground();if(t>21.82)a+=held(q,G(5,-25,1,tilt+10,B.groupPhoto(228,-15,.92,0,true)));
 a+=held(q,`<g transform="scale(${Math.max(.08,Math.abs(Math.cos(turn*Math.PI)))} 1)">${photo}</g>`,{r:tilt});
 a+=actor(t,q)+burst(1040,520,t,16.78,.6);
 return {a,head:title(tx,'OLD PHOTOS.',118)};
}
function correction(t,tx){
 const q=track(t,[
  [28.8,{ra:-35,rb:-77,la:111,lb:150,head:6,mood:'grit'}],
  [29.16,{legH:122,bend:26,head:18,ra:-25,rb:-64}],
  [29.34,{legH:112,sx:1.22,sy:.78,bend:37,head:23,neckLag:16,ra:-16,rb:-55}],
  [29.52,{x:480,fc:480,legH:123,fly:110,r:-30,sx:.92,sy:1.1,bend:-22,head:19,neckLag:18,la:170,lb:212,ra:-49,rb:-92,mood:'shock'}],
  [29.82,{x:410,fc:410,fly:69,r:-17,sx:1,sy:1,legH:136,head:-13,neckLag:-14,ra:-21,rb:-65}],
  [30.08,{x:400,fc:400,fly:0,r:0,legH:112,sx:1.39,sy:.57,bend:-29,head:23,neckLag:18,ra:19,rb:-20,la:143,lb:183,mood:'grit'}],
  [30.18,{sx:1.39,sy:.57}],[30.42,{legH:146,sx:.91,sy:1.1,bend:16,head:-18,neckLag:-13,ra:50,rb:10,mood:'shock'}],
  [30.96,{legH:144,sx:1,sy:1,bend:0,head:3,neckLag:0,ra:2,rb:-43,la:106,lb:143,mood:'sad'}],
  [31.25,{bend:20,head:14,ra:4,rb:-40}],[31.7,{bend:4,head:-8,ra:7,rb:-35}],
  [32.25,{head:11,bend:14,la:119,lb:164}],[32.95,{head:-10,bend:-12,la:134,lb:174}],
  [33.40,{legH:125,sx:1.08,sy:.91,bend:21,head:18,ra:9,rb:-33,mood:'shock'}],
  [33.70,{legH:145,sx:.97,sy:1.04,bend:-12,head:-11}],[34.2,{legH:144,sx:1,sy:1,bend:0,head:5,la:106,lb:145,mood:'sad'}],[34.98,{head:0,ra:38,rb:-3}]
 ],{x:610,fc:610});
 let a=ground()+B.groupPhoto(865,728,.67,5);
 if(t<=29.34)a+=held(q,B.stamp(0,125,1.35,0,E(t,29.16,29.34)*.7));
 else if(t<30.55)a+=B.stamp(v(t,[[29.34,755],[29.68,950],[30.55,1210]]),v(t,[[29.34,688],[29.68,500],[30.55,1040]]),1.35,v(t,[[29.34,0],[30.55,190]]));
 a+=actor(t,q)+burst(800,746,t,29.34,1)+burst(400,984,t,30.08,.8);
 if(t>=30.96)a+=held(q,B.phone(32,-15,.88,-6));
 return {a,head:t<30.96?title(tx,'NOT PROOF.',128,318,red):''};
}
function rewind(t,tx){
 const q=track(t,[[34.98,{head:-8,ra:2,rb:-43}],[35.15,{legH:121,sx:1.16,sy:.82,bend:30,head:18,neckLag:12,ra:9,rb:-33,mood:'shock'}],[35.35,{x:640,fc:640,legH:107,fly:130,r:49,sx:.9,sy:1.12,bend:-20,head:-21,neckLag:-16,la:169,lb:216,ra:-47,rb:-91}],[35.68,{x:755,fc:755,fly:92,r:63,legH:120,sx:1,sy:1,head:15,ra:-70,rb:-114}],[35.9,{x:475,fc:475,fly:33,r:18,legH:140,head:-17,ra:11,rb:-32}],[36.10,{x:365,fc:365,fly:0,r:0,legH:116,sx:1.28,sy:.7,bend:18,head:17,neckLag:15,la:131,lb:179,ra:28,rb:-12}],[36.24,{legH:135,sx:1.05,sy:.97,bend:0,head:3,neckLag:2,mood:'flat'}]],{x:430,fc:430});
 const h=wrist(q),spin=E(t,35.02,35.85);let a=ground()+G(867,680,1,spin*720,`<circle r="137" fill="${tan}" stroke="${ink}" stroke-width="9"/>${P('M-97 0H97M0-97V97',ink,13)}${C(0,0,20,paper)}`)+P(`M867 811Q${660-spin*100} 880 ${h.join(' ')}`,ink,8)+actor(t,q);
 return {a,head:title(tx,'PLOT TWIST.',142,318,red)};
}
function committee(t,tx){
 const q=track(t,[
  [36.24,{legH:135,sx:1.05,sy:.97,head:3}],[36.55,{legH:144,sx:1,sy:1,head:-7}],
  [37.50,{legH:129,head:16,bend:-14,la:125,lb:165,mood:'shock'}],[37.79,{legH:144,head:-14,bend:10}],
  [38.08,{legH:125,head:19,bend:-15}],[38.45,{legH:144,head:-8,bend:5,mood:'flat'}],
  [39.3,{head:7,bend:12,ra:13,rb:-30}],[39.95,{legH:119,sx:1.17,sy:.83,bend:30,head:21,neckLag:14,ra:21,rb:-14,mood:'grit'}],
  [40.25,{legH:109,sx:1.32,sy:.69,bend:37,head:24,ra:28,rb:-6}],
  [40.42,{x:460,fc:460,fly:100,legH:136,sx:.88,sy:1.15,r:-13,bend:-25,head:20,neckLag:20,la:171,lb:214,ra:-44,rb:-85,mood:'shock'}],
  [40.72,{x:525,fc:525,fly:67,legH:123,sx:1,sy:1,r:-8,bend:-19,head:-15,neckLag:-13,ra:-30,rb:-70}],
  [41.02,{x:520,fc:520,fly:0,r:0,legH:113,sx:1.28,sy:.69,bend:25,head:20,neckLag:17,ra:8,rb:-33,mood:'grit'}],
  [41.25,{legH:145,sx:.94,sy:1.07,bend:-18,head:-16,neckLag:-11}],
  [41.64,{legH:134,sx:1,sy:1,bend:17,head:13,neckLag:2,ra:15,rb:-25}],
  [42.10,{legH:123,bend:-27,head:17,ra:29,rb:-10,la:130,lb:169}],
  [42.5,{legH:110,sx:1.28,sy:.7,bend:-42,head:23,neckLag:20,ra:42,rb:3,la:158,lb:205}],
  [42.72,{legH:146,sx:.9,sy:1.12,bend:29,head:-21,neckLag:-18,ra:-27,rb:-67,la:181,lb:224,mood:'shock'}],
  [43.04,{legH:124,sx:1.1,sy:.9,bend:-21,head:15,neckLag:10,ra:18,rb:-21,mood:'grit'}],
  [43.60,{legH:136,sx:1,sy:1,bend:28,head:-18,neckLag:-9,ra:-12,rb:-54}],
  [44.05,{legH:122,bend:-31,head:21,neckLag:12,ra:29,rb:-9}],
  [44.5,{legH:137,bend:21,head:-16,neckLag:-9,ra:-7,rb:-48}],
  [45.18,{legH:118,sx:1.17,sy:.81,bend:-24,head:19,neckLag:14,ra:21,rb:-17}],
  [45.50,{legH:144,sx:.97,sy:1.03,bend:12,head:-12,neckLag:-8,ra:-1,rb:-41,mood:'flat'}],
  [46.05,{sx:1,sy:1,head:9,bend:-8,ra:29,rb:-11}],
  [46.90,{legH:119,sy:.86,sx:1.12,bend:20,head:16,ra:60,rb:19,la:115,lb:154,mood:'grit'}],
  [47.17,{legH:144,sy:1.05,sx:.96,bend:-14,head:-12,ra:52,rb:9}],
  [47.55,{sx:1,sy:1,bend:0,head:5,ra:60,rb:20,mood:'sad'}],[47.98,{head:0}]
 ],{x:365,fc:365});
 let a=ground();
 for(let i=0;i<3;i++){const at=37.5+i*.29,cx=v(t,[[36.8+i*.29,1380],[at,695+i*169],[at+.12,685+i*169],[at+.36,695+i*169],[47.98,695+i*169]]),j=pulse(t,at+.07,.09);a+=B.chair(cx,842,.8,4*j);const p=simple(t,cx,.65,[[36.24,{}],[at-.1,{head:-12}],[at,{legH:118,sx:1.16,sy:.82,head:19,bend:14,mood:'shock'}],[at+.18,{legH:145,sx:.94,sy:1.07,head:-13}],[at+.45,{legH:144,sx:1,sy:1,head:(i-1)*7,mood:'flat'}],[40.42,{head:-15,bend:-12,mood:'shock'}],[40.72,{head:10,bend:8}],[41.1,{head:(i-1)*7,bend:0,mood:'flat'}],[42.5,{head:-9+i*9}],[43.6,{head:7-i*6}],[45.18,{head:-6+i*5}],[47.98,{head:0}]],{id:'committee-'+i});a+=p.art}
 const dx=v(t,[[36.8,1410],[37.5,866],[47.98,866]]);a+=desk(dx,909,1.12);for(let i=0;i<3;i++)a+=P(`M${dx-160+i*166} 874V842`,ink,5)+G(dx-160+i*166,839,1,-16,B.rect(-11,-24,22,36,'#A7A69D',4));
 if(t>=38.6){const ex=v(t,[[38.6,1290],[39.35,735],[47.98,735]]);a+=B.envelope(ex,874,.92,-5,E(t,39.55,40.15));}
 if(t>=40.1){let s=E(t,40.1,40.42)*1.18,qr=v(t,[[40.1,0],[40.42,-19],[41.02,14],[41.64,-9],[42.5,23],[42.72,-25],[43.6,13],[44.05,-17],[44.5,13],[45.18,0],[46.9,62],[47.98,62]]);a+=held(q,G(-28,-51,s,qr,B.question(0,0)));for(let i=0;i<4;i++){let u=E(t,40.1+i*.12,40.55+i*.13),d=E(t,44.9,45.7);a+=G(950+i*32,928-u*(80+i*22)*(1-d),.58,-8+i*7,B.rect(-65,-99,130,198)+P('M-44-65H44M-44-44H36M-44-23H42',gray,5))}}
 a+=actor(t,q)+burst(740,799,t,40.42,1.2);
 return {a,head:''};
}
function investigation(t,tx){
 const q=track(t,[
  [47.98,{ra:8,rb:-31,head:0}],[48.5,{head:9,bend:10,ra:5,rb:-35,mood:'curious'}],
  [49.08,{legH:126,bend:-6,head:-11,la:50,lb:95,mood:'grit'}],
  [49.4,{legH:115,sx:1.18,sy:.81,bend:-18,head:-17,neckLag:-11}],
  [49.78,{legH:130,sx:.96,sy:1.04,bend:-25,head:-17,neckLag:-11}],
  [50.15,{legH:112,sx:1.27,sy:.73,bend:-37,head:21,neckLag:16}],
  [50.74,{legH:112,sx:1.27,sy:.73,bend:-15,head:-14,neckLag:-12}],
  [50.93,{x:675,fc:675,fly:70,r:-15,legH:129,sx:.9,sy:1.12,bend:-20,head:-20,neckLag:-17,la:23,lb:72,ra:-26,rb:-67,mood:'shock'}],
  [51.24,{x:545,fc:545,fly:0,r:0,legH:116,sx:1.25,sy:.73,bend:-24,head:18,neckLag:13,la:59,lb:102,ra:30,rb:-10,mood:'grit'}],
  [51.5,{legH:144,sx:.94,sy:1.08,bend:13,head:-12,neckLag:-9}],
  [51.86,{sx:1,sy:1,bend:0,head:5,neckLag:0,la:106,lb:142,ra:50,rb:10,mood:'flat'}],
  [52.50,{x:425,fc:425,head:-9,bend:-10,ra:20,rb:-21}],
  [53.04,{head:13,bend:18,legH:127,ra:10,rb:-30,mood:'curious'}],
  [53.28,{legH:114,sx:1.2,sy:.8,bend:27,head:20,ra:22,rb:-16,mood:'grit'}],
  [53.7,{legH:145,fly:74,sx:.89,sy:1.12,r:13,bend:-25,head:-18,neckLag:-16,la:166,lb:210,ra:-41,rb:-82,mood:'shock'}],
  [54.0,{x:520,fc:520,legH:124,fly:62,r:18,sx:1,sy:1,bend:-18,head:14,ra:-26,rb:-69}],
  [54.33,{x:550,fc:550,fly:0,r:0,legH:113,sx:1.3,sy:.65,bend:26,head:22,neckLag:17,ra:25,rb:-14,mood:'grit'}],
  [54.60,{legH:145,sx:.91,sy:1.1,bend:-17,head:-17,neckLag:-12,ra:-5,rb:-46,mood:'shock'}],
  [54.95,{legH:136,sx:1.08,sy:.94,bend:10,head:9,neckLag:6,ra:23,rb:-18}],
  [55.4,{legH:144,sx:1,sy:1,bend:-4,head:-7,neckLag:0,la:107,lb:142,ra:17,rb:-24,mood:'curious'}],[56.36,{bend:0,head:6}]
 ],{x:715,fc:715});
 const handle=v(t,[[47.98,0],[49.08,0],[49.4,14],[49.78,-12],[50.15,18],[50.74,18],[50.94,0],[56.36,0]]),ang=rad(handle),cx=855.6,cy=761.96;
 const grips=[[cx-Math.cos(ang)*28,cy-Math.sin(ang)*28+10],[cx-Math.cos(ang)*54,cy-Math.sin(ang)*54-8]];
 if(t>=48.3&&t<=50.74){for(let i=0;i<2;i++){
  const before=q.arms[i];reach(q,i,grips[i],i?1:-1);
  if(t<48.7){const after=q.arms[i],angles=c=>[Math.atan2(c[1][1]-c[0][1],c[1][0]-c[0][0])*180/Math.PI,Math.atan2(c[2][1]-c[1][1],c[2][0]-c[1][0])*180/Math.PI],a=angles(before),b=angles(after),u=E(t,48.3,48.7);q.arms[i]=R.chain(q.shoulder,a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u)}
  else contacts.push({hand_world:wrist(q,i),prop_world:grips[i]});
 }}
 // At release, interpolate from the last actual IK arm angles, not an
 // unrelated FK pose. Preserve each elbow's bending side through recoil.
 if(t>50.74&&t<50.93){
  const u=E(t,50.74,50.93),qr=track(50.74,[[50.74,{legH:112,sx:1.27,sy:.73,bend:-15,head:-14,neckLag:-12}]],{x:715,fc:715});
  const ar=rad(18),gg=[[cx-Math.cos(ar)*28,cy-Math.sin(ar)*28+10],[cx-Math.cos(ar)*54,cy-Math.sin(ar)*54-8]];
  for(let i=0;i<2;i++){reach(qr,i,gg[i],i?1:-1);const c=qr.arms[i],a=Math.atan2(c[1][1]-c[0][1],c[1][0]-c[0][0])*180/Math.PI,b=Math.atan2(c[2][1]-c[1][1],c[2][0]-c[1][0])*180/Math.PI;const end=i?[-26,-67]:[23,72];q.arms[i]=R.chain(q.shoulder,a+(end[0]-a)*u,b+(end[1]-b)*u)}
 }
 let a=ground()+B.vault(930,788,.93,handle);
 if(t>=53.04){const u=E(t,53.28,53.7);a+=B.briefcase(270,921,.55,0,.8*u);const glass=G(0,0,.70,v(t,[[53.04,75],[53.28,75],[53.7,145],[54.33,75],[56.36,75]]),G(-180,-190,1,0,B.lens(0,0)));a+=t>=53.7?held(q,glass):G(270+(wrist(q)[0]-270)*u,865+(wrist(q)[1]-865)*u-100*Math.sin(u*Math.PI),1,0,glass);}
 a+=actor(t,q)+burst(800,765,t,50.74,.7);
 return {a,head:t>=53.04?title(tx,'AN INQUIRY.',128):''};
}
function finale(t,tx){
 const q=track(t,[
  [56.36,{ra:10,rb:-32,head:5}],[56.85,{bend:14,head:14,ra:0,rb:-42,mood:'curious'}],[57.3,{bend:-8,head:-11,la:117,lb:158}],[58.12,{bend:8,head:10,la:108,lb:143}],[58.66,{head:-8,bend:-10,ra:13,rb:-29}],
  [59.2,{legH:123,bend:24,head:19,ra:21,rb:-20,la:145,lb:187,mood:'shock'}],
  [59.72,{legH:107,sx:1.64,sy:.38,bend:-34,head:24,neckLag:22,la:170,lb:216,ra:-10,rb:-53,mood:'grit'}],
  [59.83,{legH:107,sx:1.64,sy:.38}],[59.98,{legH:146,sx:.84,sy:1.17,bend:22,head:-23,neckLag:-22,la:191,lb:238,ra:-43,rb:-85,mood:'shock'}],
  [60.15,{legH:126,sx:1.14,sy:.87,bend:-21,head:18,neckLag:14,la:131,lb:174,ra:24,rb:-17}],
  [60.40,{legH:144,sx:.97,sy:1.04,bend:12,head:-12,neckLag:-8,ra:-20,rb:-62}],
  [60.65,{legH:119,sx:1.18,sy:.82,bend:27,head:19,neckLag:14,ra:8,rb:-35,la:119,lb:159,mood:'grit'}],
  [60.87,{legH:145,sx:.94,sy:1.08,bend:-17,head:-15,neckLag:-11,ra:-15,rb:-56,mood:'shock'}],
  [61.15,{legH:138,sx:1,sy:1,bend:11,head:13,neckLag:7,ra:3,rb:-38,la:124,lb:163,mood:'curious'}],
  [61.34,{legH:124,sx:1.12,sy:.88,bend:24,head:21,neckLag:14,ra:16,rb:-25,mood:'shock'}],
  [61.56,{legH:145,sx:.96,sy:1.05,bend:-13,head:-14,neckLag:-9,ra:-5,rb:-46}],
  [61.9,{legH:144,sx:1,sy:1,bend:3,head:7,neckLag:0,ra:11,rb:-30,la:114,lb:154,mood:'curious'}],
  [62.28,{head:-13,bend:-10,la:131,lb:173,ra:12,rb:-29}],[62.7,{head:12,bend:10,ra:19,rb:-22}],[63.5334,{head:-6,bend:-5,ra:12,rb:-29,mood:'flat'}]
 ],{x:375,fc:375});
 let a=ground();if(t<59.72)a+=held(q,B.phone(24,-28,.62,-9));
 if(t>=59.2){const y=v(t,[[59.2,-120],[59.72,894],[59.86,866],[60.03,900],[60.15,891],[60.4,894],[63.54,894]]);a+=B.briefcase(875,y,1.50,0,E(t,60,60.4)*.48)+burst(875,985,t,59.72,1.6)}
 a+=actor(t,q);
 if(t>=60.15){const h=wrist(q),u=E(t,60.15,60.65);let x=866+(h[0]-866)*u,y=660+(h[1]-660)*u-180*Math.sin(u*Math.PI);a+=G(x,y,1,v(t,[[60.15,-35],[60.65,4],[61.15,-6],[61.34,10],[61.56,-4],[61.9,4],[63.54,4]]),B.clapper(88,-10,.78,0,1-E(t,61.15,61.34)))}
 if(t>=59.72&&t<61.8){for(let i=0;i<2;i++){const d=i*.13,p=simple(t,650+i*410,.48,[[59.72+d,{fly:-130,legH:120,head:18,mood:'shock'}],[59.94+d,{fly:64,legH:139,head:-15,ra:-5,rb:-47}],[60.15+d,{fly:0,legH:114,sx:1.22,sy:.78,head:20}],[60.4+d,{legH:145,sx:.94,sy:1.08,head:-11}],[60.75+d,{legH:144,sx:1,sy:1,head:5,mood:'flat'}],[61.8,{head:-5}]],{id:'lawyer-'+i});a+=p.art+held(p.q,B.rect(-10,-48,90,114)+P('M5-27H62M5-8H48M5 11H59',gray,4),{s:.55})}for(let i=0;i<5;i++){let u=E(t,59.72+i*.045,60.14+i*.045),d=E(t,60.2,60.9);a+=G(875+(i-2)*92*u,720-170*Math.sin(u*Math.PI)+200*d,.55,-36+i*18+15*d,B.rect(-48,-65,96,130)+P('M-30-39H30M-30-18H23M-30 3H30',gray,4))}}
 return {a,head:t<59.2?title(tx,'APOLOGY.',148):title(tx,'LAWYERS.',176,318,red)};
}
function draw(t,tx){
 R.reset();contacts=[];
 if(t>=24.9&&t<28.8)return V3.draw(t,tx);
 const f=t<7.08?intro:t<10.9?handshake:t<16.02?identity:t<24.9?photos:t<34.98?correction:t<36.24?rewind:t<47.98?committee:t<56.36?investigation:finale;
 const {a,head}=f(t,tx);let shake=0;for(const e of events())if(['air_burst','squash','lawyer_slam'].includes(e.kind)&&t>=e.at&&t<e.at+.16)shake+=Math.sin((t-e.at)*145)*5*(1-(t-e.at)/.16);
 return `<defs><clipPath id="acting-left"><rect x="70" y="355" width="1140" height="662"/></clipPath></defs><g clip-path="url(#acting-left)"><g transform="translate(${shake} ${shake*.35})">${a}</g></g>${head}`;
}
function inspected(t){if(t>=24.9&&t<28.8){const a=V3.inspected(),g=V3.geometry(a.q);return [{id:'approved-v3',t,q:{...a.q,s:1},arms:[g.left,g.right],legs:[g.legL,g.legR],worldHands:[V3.world(a.q,g.left[2]),V3.world(a.q,g.right[2])],worldFeet:[V3.world(a.q,g.legL[2]),V3.world(a.q,g.legR[2])]}]}return R.inspected()}
module.exports={draw,events,inspected,contacts:()=>contacts};
