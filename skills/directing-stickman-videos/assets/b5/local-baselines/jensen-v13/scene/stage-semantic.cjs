/* V3: scene-specific semantic slapstick. No celebrity is used as a left-stage actor.
 * All motion is seekable, deterministic and tied to the recorded voice, not wall time.
 */
const A=require('./actor.cjs');
const {ink,red,gray,clamp,mix,smooth,out,pulse,P,G,C,actor,burst,pose,world}=A;
const paper='#EBE7E1',white='#FBFAF8',tan='#BEA98B';
const E=(t,a,b)=>smooth(t,a,b),O=(t,a,b)=>out((t-a)/(b-a));
const lerp=(a,b,u)=>Array.isArray(a)?a.map((v,i)=>lerp(v,b[i],u)):typeof a==='number'?mix(a,b,u):u<.5?a:b;
function track(t,keys,base={}){let prev=pose(base),at=0;for(const [end,part,ease='smooth'] of keys){const next={...prev,...part};if(t<end){let u=clamp((t-at)/(end-at));u=ease==='out'?out(u):ease==='in'?u*u*u:u*u*(3-2*u);const result=Object.fromEntries(Object.keys(next).map(k=>[k,lerp(prev[k],next[k],u)]));if(result.sx!==1||result.sy!==1)result.deformation=prev.deformation!=='none'?prev.deformation:next.deformation;return result}prev=next;at=end}return prev}
const rect=(x,y,w,h,fill=paper,sw=7,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${ink}" stroke-width="${sw}"/>`;
const line=(d,w=5,c=gray)=>P(d,c,w);
function star(x,y,r=20){let d='';for(let i=0;i<10;i++){let a=(i*36-90)*Math.PI/180,q=i%2?r*.42:r;d+=(i?'L':'M')+(x+Math.cos(a)*q)+' '+(y+Math.sin(a)*q)}return `<path d="${d}Z" fill="${red}"/>`}
function phone(x,y,s=1,r=0){return G(x,y,s,r,rect(-45,-92,90,184,white,6,11)+P('M-11-77h22',ink,4)+P('M-22-35h44M-22-10h32M-22 15h39',gray,5)+C(0,75,4,gray))}
function glove(x,y,s=1,r=0){return G(x,y,s,r,`<path d="M185-48L63-48Q38-61 5-47L-48-22Q-67-14-56-1Q-47 9-30 1L-7-8L-31 17Q-41 31-28 39Q-19 46-7 33L4 23Q-3 46 11 51Q24 57 34 40Q34 58 49 57Q63 56 67 39L85 36L185 48Z" fill="${white}" stroke="${ink}" stroke-width="7"/>${P('M145-47v94M-8-9L31-20M4 23L38 1M34 40L54 18',ink,4)}`)}
function box(x,y,s=1){return G(x,y,s,0,`<path d="M-78-81L-22-112L79-79L20-46Z" fill="#D7C9B4" stroke="${ink}" stroke-width="6"/><path d="M-78-81L20-46V48L-78 10Z" fill="${tan}" stroke="${ink}" stroke-width="6"/><path d="M20-46L79-79V15L20 48Z" fill="#A79378" stroke="${ink}" stroke-width="6"/>${P('M-40-101L54-66V31',white,9)}`)}
function cart(x,y,s=1,r=0){return G(x,y,s,r,box(0,-80,.98)+P('M-120-150h25l17 167h185',ink,9)+P('M-67 18L-58 41H95',ink,7)+C(-48,62,17,ink)+C(80,62,17,ink)+C(-48,62,6,paper)+C(80,62,6,paper))}
function mini(x,y,s=.8,tilt=0){return G(x,y,s,tilt,C(0,-74,24,white)+`<circle cx="0" cy="-74" r="24" fill="${white}" stroke="${ink}" stroke-width="5"/>`+P('M0-49v66M0-28L-36-3M0-28L33-3M0 17L-27 48M0 17L27 48',ink,7)+C(-8,-77,2.5)+C(8,-77,2.5))}
function groupPhoto(x,y,s=1,r=0,second=false){
 let a=rect(-225,-147,450,294,white,7)+rect(-205,-128,410,230,'#D8CDBD',0);
 for(let i=0;i<4;i++){
  // An anonymous business group, explicitly an illustration rather than evidence.
  const hair=i===1?`<path d="M-26-46Q-47-112 0-108Q43-108 30-43L18-45V-75H-18V-44Z" fill="${ink}"/>`:'';
  a+=G(-143+i*94,-8,.8,i%2?3:-3,hair+mini(0,0,1)+ (i===1?P('M-19-85Q-2-75 9-94L23-83',ink,5):''));
 }
 a+=rect(-190,12,380,70,second?'#C3B49B':'#BAA78A',5)+P('M-190 83v32M190 83v32',ink,5);
 for(let i=0;i<4;i++){
  const px=-137+i*92;
  a+=`<ellipse cx="${px}" cy="27" rx="24" ry="7" fill="${paper}" stroke="${ink}" stroke-width="3"/>`;
  a+=second?P(`M${px-21} 13l11-20M${px+22} 13l-7-23`,ink,3):G(px+7,-7,.55,0,`<path d="M-14-24H14L9-2H-9Z" fill="${white}" stroke="${ink}" stroke-width="4"/>`+P('M0-2V19M-10 19H10',ink,3));
 }
 return G(x,y,s,r,a+P('M-170 125h170',gray,3));
}
function lens(x,y,s=1,r=0){return G(x,y,s,r,`<circle r="112" fill="#EBF3EF" fill-opacity=".22" stroke="${ink}" stroke-width="12"/><circle r="96" fill="none" stroke="${gray}" stroke-width="3"/>${P('M77 82L180 190',ink,30)}${P('M-58-62Q-25-92 17-83',white,10)}`)}
function spotlight(x,y,s=1,r=0){return G(x,y,s,r,`<path d="M-65-50L65-50L90 36L-89 36Z" fill="#A99B89" stroke="${ink}" stroke-width="7"/>${rect(-72,34,143,27,white,5)}${P('M-38-52L-38-85H37V-52',ink,8)}`)}
function badge(x,y,s,r,tx){return G(x,y,s,r,rect(-194,-111,388,222,white,6,5)+P('M-38-110L0-159L38-110',ink,6)+`<circle cx="-124" cy="-10" r="35" fill="${paper}" stroke="${ink}" stroke-width="5"/>`+P('M-169 72Q-162 20-124 29Q-86 19-80 72',ink,5)+G(-51,-14,.53,0,tx.imageTile('ALICE HUANG','Instrument-Sans-1.ttf',52,ink,0,0,0))+G(-51,38,.63,0,tx.imageTile('MEGASPEED','Instrument-Sans-1.ttf',34,ink,0,0,0)))}
function heart(s=1){return `<path transform="scale(${s})" d="M0 38C-111-25-74-109 0-54C74-109 111-25 0 38Z" fill="${red}" stroke="${ink}" stroke-width="6"/>`}
function stamp(x,y,s=1,r=0,compression=0){return G(x,y,s,r,rect(-80,-14,160,38,tan,6,9)+P(`M0-14v${-62*(1-compression)}`,ink,23)+`<ellipse cx="0" cy="${-90+compression*55}" rx="54" ry="22" fill="${tan}" stroke="${ink}" stroke-width="6"/>`+G(0,20,.55,0,heart()))}
function chair(x,y,s=1,r=0){return G(x,y,s,r,rect(-73,-115,146,156,'#BAA78A',7,8)+rect(-87,42,174,25,tan,7,5)+P('M-62 67L-76 174M62 67L76 174M-73-65H73',ink,8)+C(-76,179,9)+C(76,179,9))}
function envelope(x,y,s=1,r=0,open=0){return G(x,y,s,r,rect(-155,-91,310,182,white,7,3)+`<path d="M-155-91L0 ${-11-170*open}L155-91" fill="${white}" stroke="${ink}" stroke-width="7"/>`+P('M-155 91L-50 5M155 91L50 5',gray,4))}
function question(x,y,s=1,r=0){return G(x,y,s,r,P('M-56-72C-62-174 107-176 110-82C112-14 32-12 28 51',ink,37)+C(27,107,21,red))}
function briefcase(x,y,s=1,r=0,open=0){return G(x,y,s,r,`<path d="M-62-143v-42h124v42" fill="none" stroke="${ink}" stroke-width="17"/>`+rect(-192,-142,384,253,'#B29D7E',9,13)+G(0,-142,1,-open*48,rect(-192,-10,384,94,'#D1BEA2',8,8))+rect(-22,-74,44,53,white,5,4)+P('M-158 77h316',gray,3))}
function vault(x,y,s=1,handle=0){return G(x,y,s,0,rect(-206,-230,412,422,'#B5B4AA',10,19)+rect(-171,-196,342,350,'#C8C7BD',7,7)+P('M163-147h-18M163 97h-18',ink,12)+G(-80,-28,1,handle,`<circle r="46" fill="${tan}" stroke="${ink}" stroke-width="7"/>`+P('M-67 0H67M0-67V67',ink,11)+C(0,0,12))+C(98,-30,14,ink)+P('M98-28v23',ink,9))}
function clapper(x,y,s=1,r=0,open=0){let top=rect(-113,-87,226,48,ink,5);for(let i=0;i<6;i++)top+=`<path d="M${-110+i*45}-86l-27 47h25l27-47Z" fill="${white}"/>`;return G(x,y,s,r,rect(-113,-38,226,140,white,7,5)+G(-112,-39,1,-open*33,G(112,39,1,0,top))+P('M-85 1H85M-85 35H46M-85 68H74',gray,4))}
let gripAudit=[];
function held(p,local,art){const hand=world(p,local);gripAudit.push({hand_world:hand,prop_world:hand});return G(hand[0],hand[1],1,0,art)}
function localAt(p,point){const q=pose(p),a=-q.r*Math.PI/180,dx=point[0]-q.x,dy=point[1]-q.y+q.lift;return [(dx*Math.cos(a)-dy*Math.sin(a))/(q.s*q.sx),(dx*Math.sin(a)+dy*Math.cos(a))/(q.s*q.sy)]}
function ground(){return P('M95 989Q610 995 1185 989',gray,3)}
function intro(t,tx){
 let p=track(t,[[.70,{left:[-65,-230],right:[100,-260],mood:'happy'}],[1.25,{crouch:.5,left:[-80,-255],right:[106,-260],mood:'grit'}],[1.38,{crouch:.1,mood:'shock'}],[1.72,{x:785,y:927,r:73,lift:90,left:[-112,-270],right:[103,-340],footL:[-68,-18],footR:[53,-32]},'out'],[2.13,{x:735,y:935,r:88,lift:0,left:[-110,-235],right:[96,-270],footL:[-55,0],footR:[50,0]},'in'],[2.38,{x:699,y:976,r:35,crouch:.65,left:[-95,-240],right:[88,-225]},'out'],[2.80,{x:600,y:987,r:0,crouch:0,mood:'flat'}],[3.66,{x:570,head:12,left:[-75,-170],right:[99,-195]}],[4.65,{x:500,head:0,left:[-70,-160],right:[125,-225],mood:'grit'}],[4.95,{x:478,crouch:.45,lean:-20,right:[127,-225]},'out'],[5.38,{x:490,crouch:0,lean:0,mood:'happy'}],[6.18,{right:[128,-260],head:-5}],[7.08,{right:[128,-260],mood:'flat'}]],{x:365,y:987,s:1});
 let art=ground();
 if(t<1.5){let b=1+E(t,.85,1.38)*.38;art+=held(p,p.right,G(104,-118,b,-8,`<path d="M-135-65Q-139-119-67-118H113Q174-110 162-32Q155 25 85 24H-50L-91 69L-83 24Q-140 20-135-65Z" fill="${white}" stroke="${ink}" stroke-width="7"/>`+P(`M-93-46H${-93+200*(1-E(t,.75,1.27))}`,ink,9)+P('M-92-47h200',gray,2)+G(-94+200*E(t,.75,1.27),-46,1,0,rect(-8,-12,17,25,tan,3,3))))}
 if(t>=1.38&&t<2.38){let u=O(t,1.38,1.8);for(let i=0;i<9;i++){let a=(i*43)*Math.PI/180;art+=G(515+Math.cos(a)*(70+u*260),605+Math.sin(a)*(40+u*150),1-u,0,star(0,0,13))}art+=burst(505,618,t,1.38,1.8)}
 if(t>4){const cx=mix(1240,735,O(t,4.02,4.88));art+=cart(cx,925,1,Math.sin(t*23)*2*(1-E(t,4.8,5.4)))}
 art+=actor(t,p)+burst(1070,988,t,2.13,1);
 const head=t>=1.38&&t<4?tx.title('CHEATING.',128,120,327,red):'';
 return {art,head};
}
function handshake(t,tx){
 let p=track(t,[
  [7.10,{}],[7.78,{crouch:.15,right:[122,-249],mood:'happy'}],
  [7.94,{crouch:.32,right:[126,-235],mood:'shock'},'in'],
  [8.12,{y:959,crouch:0,right:[132,-251],left:[-86,-190]},'out'],
  [8.40,{y:987,crouch:.45,right:[128,-235],left:[-80,-170]},'in'],
  [8.65,{y:965,crouch:0,right:[126,-255],left:[-90,-190]},'out'],
  [9.12,{y:987,crouch:.12,right:[132,-246],mood:'sad'},'in'],
  [9.50,{crouch:.85,lean:-10,right:[124,-217],left:[-93,-153],head:10,mood:'grit'},'in'],
  [9.85,{crouch:.85}],
  [10.26,{y:975,crouch:0,lean:0,right:[115,-270],left:[-83,-198],head:-5,mood:'shock'},'out'],
  [10.72,{y:987,crouch:.08,right:[118,-248],left:[-70,-165],head:0,mood:'flat'},'in'],
  [11.35,{crouch:0,right:[128,-250],head:-7}],
  [12.28,{head:-6,mood:'happy'}],
  [12.82,{x:526,right:[135,-250],left:[-92,-175],crouch:.18,head:6,mood:'shock'},'out'],
  [13.40,{x:564,lean:15,crouch:.3,right:[140,-244],left:[-86,-157],footL:[-54,0],footR:[45,0],head:3,mood:'grit'},'in'],
  [14.12,{x:510,lean:-10,crouch:.25,right:[134,-255],head:-8,mood:'shock'},'out'],
  [14.86,{x:520,crouch:0,lean:0,right:[120,-250],footL:[-34,0],footR:[35,0],head:-7,mood:'happy'}],
  [16.02,{left:[-70,-175],head:0}]
 ],{repair:true,x:480,y:987,s:1,sx:1,sy:1,r:0,footL:[-34,0],footR:[35,0],left:[-70,-160],right:[126,-250],mood:'flat'});
 let art=ground();
 if(t<10.72){let h=world(p,p.right);let exit=E(t,9.85,10.7);art+=glove(h[0]+exit*610,h[1]-exit*230,1.63,-4+exit*24);art+=burst(h[0],h[1],t,7.94,1)}
 art+=actor(t,p)+burst(480,970,t,9.5,1.3)+burst(480,915,t,10.26,.7);
 if(t>=10.9){const k=E(t,10.9,11.35),s=.85*k,tilt=18*(1-k)+15*pulse(t,12.82,.3)-16*pulse(t,14.12,.3);art+=held(p,p.right,G(0,0,s,tilt,badge(194,0,1,0,tx)))}
 let head='';if(t>=7.94&&t<10.8)head=tx.title('CUSTOMER',112,117,282)+tx.title('RELATIONS?',126,117,418,red);
 return {art,head};
}
function photos(t,tx){
 let p=track(t,[[16.48,{x:330,right:[128,-260],mood:'happy'}],[16.80,{x:300,crouch:.4,lean:-18,right:[132,-245],mood:'shock'},'in'],[17.25,{x:340,crouch:0,lean:0,head:7},'out'],[18.92,{x:340,head:-8,left:[-85,-200],right:[128,-250]}],[19.65,{x:265,crouch:.4,lean:-20,right:[130,-240],left:[-90,-255],mood:'grit'},'in'],[20.15,{x:320,crouch:0,lean:0,right:[130,-310],mood:'shock'},'out'],[20.75,{x:340,right:[128,-250],head:-7,mood:'happy'}],[21.82,{x:340,head:0}],[22.32,{x:290,crouch:.5,lean:-20,right:[130,-235],mood:'grit'},'in'],[22.72,{x:330,crouch:0,lean:0,right:[128,-290],mood:'shock'},'out'],[23.4,{x:350,right:[128,-250],mood:'flat'}],[24.92,{x:350,head:-8}],[25.65,{x:400,lean:20,r:-9,right:[125,-270],left:[-90,-280],mood:'shock'}],[26.1,{x:440,lean:25,r:-18,right:[130,-260],mood:'grit'}],[26.85,{x:360,lean:-15,r:8,right:[130,-290]},'out'],[27.5,{x:420,lean:20,r:-12,right:[130,-240]},'out'],[28.79,{x:380,lean:0,r:0,left:[-70,-160],right:[120,-250],mood:'flat'}]],{x:350,y:987,s:.96});
 const flip=E(t,22.02,22.5),light=E(t,25.20,26.1),h=world(p,p.right),px=h[0]+220;
 const tilt=-4+15*pulse(t,19.65,.32)-15*pulse(t,20.15,.27)+17*pulse(t,22.32,.23)-11*pulse(t,22.72,.23)+18*Math.sin((t-25.3)*5)*light;
 let art=ground();
 // Left edge and hand share a world coordinate. The frame's inertia moves the whole body.
 let entrance=1-E(t,16.02,16.48),turn=E(t,21.90,22.32),fold=Math.max(.06,Math.abs(Math.cos(turn*Math.PI)));
 if(t>21.82)art+=G(h[0],h[1],1,tilt+17*(1-flip),groupPhoto(240,-48,1.04,0,true));
 art+=held(p,p.right,G(entrance*650,0,1,tilt,`<g transform="scale(${fold} 1)">${groupPhoto(225*1.04,-48,1.04,0,turn>.5)}</g>`));
 // A physical spotlight, not a meaningless emotional halo. Its cone is linked to its lamp.
 if(light>0){const lamp=1070+50*Math.sin((t-25.3)*5)*light;art+=`<path d="M${lamp} 476L${px-255} 928L${px+215} 928Z" fill="#F9E8AC" opacity="${.26*light}"/>`+spotlight(lamp,425,.9,22);art+=P(`M${lamp-11} 350L1042 305`,ink,10)}
 art+=actor(t,p);
 if(t<16.92){let a=pulse(t,16.78,.04);art+=`<rect x="452" y="520" width="595" height="410" fill="white" opacity="${a*.65}"/>`+burst(1040,520,t,16.78,.65)}
 if(t>=24.92&&t<26){for(let i=0;i<7;i++){let u=O(t,24.92,25.7);art+=C(650+i*43+u*45,515+Math.sin(i)*20-u*70,4*(1-u),gray)}}
 return {art,head:tx.title('OLD PHOTOS.',118,117,318)};
}
function correction(t,tx){
 let p=track(t,[[29.02,{x:610,right:[110,-300],left:[-65,-180],mood:'grit'}],[29.34,{x:650,crouch:.4,lean:23,right:[115,-330]},'in'],[29.62,{x:500,y:881,r:-53,lift:25,crouch:0,left:[-110,-290],right:[100,-320],mood:'shock'},'out'],[30.08,{x:490,y:986,r:-70,lift:0,right:[80,-250],left:[-105,-245]},'in'],[30.65,{x:410,r:0,crouch:.6,left:[-75,-180],right:[100,-245]},'out'],[30.96,{crouch:0,mood:'flat'}],[32.25,{right:[120,-260],head:-8}],[33.4,{head:10,left:[-80,-220],mood:'shock'}],[34.98,{head:0,left:[-70,-170],right:[110,-250],mood:'flat'}]],{x:560,y:987,s:1});
 let art=ground()+groupPhoto(865,728,.67,5);
 if(t<=29.34){const c=pulse(t,29.34,.16)*.8;art+=held(p,p.right,G(0,(90-c*55)*1.6,1.6,0,stamp(0,0,1,0,c)))}
 else if(t<30.62){let u=O(t,29.34,29.68);art+=stamp(mix(765,465,u),mix(731,450,u),1.6,-70*u,0)}
 art+=actor(t,p)+burst(800,746,t,29.34,1)+burst(290,985,t,30.08,.7);
 if(t>=30.96){const h=world(p,p.right);art+=phone(h[0]+45,h[1]-10,.88,-6);if(t>33)art+=P(`M${h[0]+20} ${h[1]+31}h48`,gray,4)}
 return {art,head:t<30.96?tx.title('NOT PROOF.',128,117,318,red):''};
}
function inquiry(t,tx,extras={}){
 let p=track(t,[[35.15,{x:430,left:[-105,-250],right:[90,-260],mood:'shock'}],[35.57,{x:950,y:880,r:-56,left:[-100,-300],right:[90,-300],footL:[-65,-25],footR:[70,-25]},'in'],[36.05,{x:365,y:987,r:0,left:[-75,-180],right:[110,-245],footL:[-55,0],footR:[56,0],mood:'flat'},'out'],[37.5,{x:345,crouch:.15,head:12}],[38.7,{head:-8,crouch:0}],[39.5,{x:450,right:[120,-260],mood:'grit'}],[40.1,{x:490,crouch:.4,right:[125,-245]},'in'],[40.42,{x:610,y:958,r:-18,crouch:0,left:[-107,-285],right:[110,-280],mood:'shock'},'out'],[41.1,{x:520,y:987,r:-16,left:[-90,-210],right:[130,-240]},'in'],[42.5,{x:530,r:-8,lean:17,crouch:.35,right:[130,-235],mood:'grit'}],[43.6,{x:580,r:5,lean:-10,crouch:.15,right:[130,-250]}],[44.24,{x:550,r:-7,crouch:.25,mood:'grit'}],[45.18,{x:540,r:0,lean:0,crouch:0,right:[130,-260],mood:'flat'}],[46.1,{x:530,crouch:.15,right:[132,-235],left:[-85,-220],head:-10}],[46.9,{x:490,crouch:.45,right:[130,-195],left:[-90,-240],head:0},'in'],[47.4,{x:520,crouch:0,right:[130,-235],left:[-75,-170]},'out'],[47.98,{head:0,right:[110,-250]}]],{x:430,y:987,s:1});
 let art=ground();
 if(t<36.24){let spin=E(t,35.02,35.65);art+=G(800,680,1,spin*720,`<circle r="137" fill="${tan}" stroke="${ink}" stroke-width="9"/>${P('M-97 0H97M0-97V97',ink,13)}${C(0,0,20,white)}`);art+=P(`M800 811Q${600-spin*180} 835 ${p.x} ${p.y-150}`,ink,9)}
 if(t>=36.24){for(let i=0;i<3;i++){let u=O(t,36.8+i*.29,37.5+i*.29);art+=chair(mix(1360,695+i*169,u),842,.8,Math.sin(t*18+i)*5*(1-u))}}
 if(extras.afterChairs)art+=extras.afterChairs(t);
 if(t>=38.6){let x=mix(1240,700,O(t,38.6,39.35)),opening=E(t,39.55,40.15);art+=envelope(x,861,.92,-5,opening);if(t>40.1){let q=E(t,40.1,40.42),wob=t<45.18?Math.sin((t-40.42)*7)*12*Math.exp(-(t-40.42)*.19):0;art+=held(p,p.right,G(0,0,1.15*q,wob,G(-28,-51,1,0,question(0,0))))}}
 art+=actor(t,p)+burst(740,799,t,40.42,1.3);
 return {art,head:t<36.24?tx.title('PLOT TWIST.',142,117,318,red):''};
}
function investigation(t,tx){
 let p=track(t,[[48.5,{x:720,right:[130,-260],mood:'happy'}],[49.4,{x:725,lean:20,crouch:.2,right:[130,-245],mood:'grit'}],[50.15,{x:715,lean:35,r:-12,right:[130,-250],left:[-90,-265]}],[50.74,{x:724,lean:15,r:0,crouch:.4,right:[130,-245]},'in'],[51.1,{x:550,lean:0,r:-25,crouch:0,right:[115,-280],left:[-90,-280],mood:'shock'},'out'],[51.65,{x:450,r:0,left:[-75,-180],right:[105,-250],mood:'flat'}],[53.04,{x:370,right:[120,-250],head:5}],[53.5,{x:390,right:[125,-260],mood:'shock'}],[54.0,{x:460,y:955,r:18,left:[-110,-270],right:[128,-260],footL:[-50,-10],footR:[53,-20]},'out'],[54.7,{x:540,y:987,r:7,left:[-80,-220],right:[128,-260],footL:[-55,0],footR:[56,0],mood:'grit'}],[55.4,{x:500,r:0,left:[-75,-190],right:[120,-250],mood:'flat'}],[56.36,{x:450,left:[-70,-170],right:[110,-250]}]],{x:450,y:987,s:1});
 let art=ground(),handle=12*E(t,49.05,50.7)*(1-E(t,50.74,51.07));art+=vault(930,788,.93,handle);
 if(t>=48.7&&t<=50.74){p.right=localAt(p,[855.6,761.96]);gripAudit.push({hand_world:world(p,p.right),prop_world:[855.6,761.96]})}
 if(t>53.04){let u=O(t,53.04,53.7),catchU=O(t,53.04,53.5),h=world(p,p.right),glass=G(0,0,.85*catchU,90,G(-180,-190,1,0,lens(0,0)));art+=briefcase(270,921,.55,0,.8*u);art+=t>=53.5?held(p,p.right,glass):G(mix(270,h[0],catchU),mix(865,h[1],catchU),1,0,glass);art+=burst(275,844,t,53.28,.5)}
 art+=actor(t,p)+burst(798,765,t,50.74,.7);
 return {art,head:t>=53.04?tx.title('AN INQUIRY.',128,117,318):''};
}
function finale(t,tx){
 let p=track(t,[[57.0,{right:[115,-260],mood:'happy'}],[58.52,{head:-6,left:[-65,-180]}],[59.2,{head:0,crouch:.25,mood:'shock'}],[59.72,{sx:2.15,sy:.25,crouch:0,r:0,deformation:'legal-briefcase-air-blast',left:[-110,-280],right:[110,-280]},'in'],[59.96,{sx:.73,sy:1.22,deformation:'legal-impact-rebound'},'out'],[60.4,{sx:1,sy:1,deformation:'none',right:[125,-285],left:[-85,-220],mood:'shock'}],[60.9,{right:[118,-270],left:[-95,-260],mood:'happy'}],[61.7,{right:[118,-260],left:[-90,-250],head:10}],[62.2,{head:-6,mood:'flat'}],[63.53,{head:2,right:[118,-260],left:[-90,-250]}]],{x:375,y:987,s:1});
 let art=ground();
 if(t<59.72){let h=world(p,p.right);art+=phone(h[0]+24,h[1]-28,.62,-9)}
 if(t>=59.2){let drop=O(t,59.2,59.72),by=mix(80,894,drop)+Math.sin((t-59.72)*22)*18*Math.exp(-Math.max(0,t-59.72)*5);art+=briefcase(875,by,1.50,0,E(t,60.0,60.4)*.48);art+=burst(875,985,t,59.72,1.7)}
 art+=actor(t,p);
 if(t>=60.15){let u=E(t,60.15,60.65),h=world(p,p.right);let x=mix(866,h[0]+90,u),y=mix(660,h[1]-10,u)-Math.sin(u*Math.PI)*180;art+=clapper(x,y,.78,mix(-35,4,u),1-E(t,61.15,61.34))}
 return {art,head:t<59.2?tx.title('APOLOGY.',148,117,318):tx.title('LAWYERS.',176,117,318,red)};
}
const EVENTS=[
 ['zip',1.12,'paper_snap',.6],['confession-burst',1.38,'air_burst',1],['hook-body-land',2.13,'body_land',.7],['recover',2.69,'spring',.7],['cart-stop',4.88,'cart_stop',.7],
 ['handshake-contact',7.94,'hand_slap',1],['handshake-up',8.12,'grip',.6],['handshake-down',8.4,'grip',.65],['handshake-up-2',8.65,'grip',.65],['awkward-squash',9.5,'squash',1],['awkward-rebound',10.26,'spring',1],['badge-flip',11.35,'card_catch',.6],['badge-pull',12.82,'grip',.45],['badge-brake',14.12,'card_catch',.6],
 ['group-shutter',16.78,'camera',.7],['frame-strain',19.65,'grip',.55],['frame-rebound',20.15,'photo_fan',.6],['second-photo',22.32,'photo_fan',.7],['frame-settle',23.4,'card_catch',.45],['spotlight',25.65,'lens_pull',.7],['spotlight-stop',26.1,'lens_brake',.6],['spotlight-chase',26.85,'grip',.45],
 ['not-proof',28.88,'record_stop',.8],['conclusion-rejected',29.34,'spring',1],['recoil-land',30.08,'body_land',.7],['apology-phone',31.25,'apology',.5],
 ['rewind',35.15,'rewind',1],['chair-1',37.5,'cart_stop',.5],['chair-2',37.79,'cart_stop',.5],['chair-3',38.08,'cart_stop',.5],['envelope',39.95,'letter_flip',.6],['question-release',40.42,'spring',1],['question-wrestle',42.5,'grip',.45],['question-stop',45.18,'handle_stop',.7],['question-lower',46.9,'card_catch',.4],
 ['vault-handle',49.4,'metal_handle',.6],['vault-return',50.74,'metal_handle',.8],['inquiry-open',53.28,'case_click',.5],['lens-launch',53.7,'lens_pull',.8],
 ['tiny-apology',56.85,'apology',.5],['lawyer-slam',59.72,'lawyer_slam',1],['case-latch',60.15,'case_click',.7],['film-catch',60.65,'card_catch',.6],['documentary-clap',61.34,'clapper',.8]
].map(([id,at,kind,power])=>({id,at,frame:Math.round(at*30),kind,power}));
function draw(t,tx,extras={}){A.reset();gripAudit=[];let scene=t<7.08?intro:t<16.02?handshake:t<28.79?photos:t<34.98?correction:t<47.98?inquiry:t<56.36?investigation:finale;let {art,head}=scene(t,tx,extras);let shake=0;for(const e of EVENTS)if(['air_burst','squash','lawyer_slam'].includes(e.kind)&&t>=e.at&&t<e.at+.16)shake+=Math.sin((t-e.at)*150)*5*(1-(t-e.at)/.16);return `<defs><clipPath id="left-stage"><rect x="70" y="355" width="1140" height="662"/></clipPath></defs><g clip-path="url(#left-stage)"><g transform="translate(${shake} ${shake*.35})">${art}</g></g>${head}`}
module.exports={draw,events:()=>EVENTS,inspected:A.inspected,contacts:()=>gripAudit,track,props:{rect,line,star,phone,glove,box,cart,mini,groupPhoto,lens,spotlight,badge,heart,stamp,chair,envelope,question,briefcase,vault,clapper,ground}};
