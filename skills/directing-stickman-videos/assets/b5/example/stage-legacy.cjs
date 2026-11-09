/* V6: silhouette-safe arm bends and brief impact punctuation. All motion is frame-addressable.
   Reference grammar: anticipate -> contact -> squash/stretch -> recovery.
   A plain white-head actor performs; the Spider-Man identity is only the presenter. */
const ink='#1E1C1A',red='#D7372C',gray='#858079';
const E=require('./events.cjs');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,u)=>a+(b-a)*u,rad=a=>a*Math.PI/180;
const out=u=>1-Math.pow(1-clamp(u),3);
const smooth=(t,a,b)=>{const q=clamp((t-a)/(b-a));return q*q*(3-2*q)};
const pulse=(t,c,w)=>Math.exp(-Math.pow((t-c)/w,2));
function val(t,keys){
 if(t<=keys[0][0])return keys[0][1];
 for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){
  const [a,x]=keys[i-1],[b,y,e]=keys[i];let q=clamp((t-a)/(b-a));
  q=e==='out'?out(q):e==='in'?q*q*q:e==='smooth'?q*q*(3-2*q):q;
  return mix(x,y,q);
 }return keys.at(-1)[1];
}
const P=(d,c=ink,w=8,a='')=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${a}/>`;
const C=(x,y,r,c=ink)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const G=(x,y,s,r,art)=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${art}</g>`;
const pose=p=>({x:520,y:978,s:1.15,sx:1,sy:1,r:0,head:0,curl:0,
 left:[-75,-125],right:[85,-125],ll:116,lk:87,rl:63,rk:85,mood:'happy',...p});
function point(p,[x,y]){
 p=pose(p);let a=x*p.s*p.sx,b=y*p.s*p.sy,r=rad(p.r);
 return [p.x+a*Math.cos(r)-b*Math.sin(r),p.y+a*Math.sin(r)+b*Math.cos(r)];
}
function local(p,[x,y]){
 p=pose(p);let a=x-p.x,b=y-p.y,r=rad(-p.r);
 return [(a*Math.cos(r)-b*Math.sin(r))/(p.s*p.sx),(a*Math.sin(r)+b*Math.cos(r))/(p.s*p.sy)];
}
function chain(start,a,b,L1=80,L2=80){
 const [x,y]=start,x1=x+Math.cos(rad(a))*L1,y1=y+Math.sin(rad(a))*L1;
 return [[x,y],[x1,y1],[x1+Math.cos(rad(b))*L2,y1+Math.sin(rad(b))*L2]];
}
function ik(start,end,side){
 const dx=end[0]-start[0],dy=end[1]-start[1],d=Math.hypot(dx,dy);
 if(d>169.99)throw Error('Arm reach exceeds fixed bones: '+d.toFixed(2));
 const a=Math.atan2(dy,dx),h=Math.acos(clamp((86*86+d*d-84*84)/(2*86*Math.max(d,.001)),-1,1));
 return [start,[start[0]+86*Math.cos(a+side*h),start[1]+86*Math.sin(a+side*h)],end];
}
function poly(pts,w=15){return P(pts.map((p,i)=>(i?'L':'M')+p.join(' ')).join(''),ink,w)}
function palm(x,y,open=false){return C(x,y,6.5)+(open?P(`M${x} ${y}l-11 -9M${x} ${y}l11 -9`,ink,4):'')}
let inspected=[];
function actor(p,t,{hands=true}={}){
 p=pose(p);const k=p.curl,huddle=p.huddle||0,shoulder=[mix(0,-10,k),mix(-265,-188,k)-18*huddle],hip=[mix(0,-30,k),mix(-150,-45,k)];
 let left=p.left,right=p.right;
 if(k){left=[mix(left[0],-60,k),mix(left[1],-74,k)];right=[mix(right[0],94,k),mix(right[1],-96,k)]}
 // An inward self-protective gesture, with fixed arm bones and separate elbows.
 if(huddle){left=[mix(left[0],-42,.86*huddle),mix(left[1],-138,.86*huddle)];right=[mix(right[0],40,.86*huddle),mix(right[1],-144,.86*huddle)]}
 // Separate shoulder roots and outward elbows: no triangular arm folded through the spine.
 const ls=[shoulder[0]-9,shoulder[1]],rs=[shoulder[0]+9,shoulder[1]];
 const la=ik(ls,left,1),ra=ik(rs,right,-1);
 inspected.push({t,p,la,ra,hip,head:[mix(0,-14,k),mix(-345,-251,k)]});
 // Separate crouched knees on opposite sides; fixed bones and planted feet,
 // never two overlapping shins forming a closed triangular knot.
 const ll=chain(hip,mix(p.ll,200,k),mix(p.lk,60,k));
 const rl=chain(hip,mix(p.rl,-20,k),mix(p.rk,70,k));
 inspected.at(-1).legs=[ll,rl];
 const hy=mix(-345,-251,k),hx=mix(0,-14,k);
 let art=P(`M${hx} ${hy+62}Q${mix(0,-34,k)} ${mix(-215,-125,k)} ${hip.join(' ')}`,ink,15)+poly(ll)+poly(rl)+poly(la)+poly(ra);
 let face=`<circle cx="${hx}" cy="${hy}" r="60" fill="#FBFAF8" stroke="${ink}" stroke-width="10"/>`;
 const bl=pulse(t,4.9,.055)+pulse(t,9.8,.055)+pulse(t,15.1,.055)+pulse(t,21.1,.055);
 const eyeY=hy-6,eh=Math.max(1.2,(p.mood==='shock'?10:6.5)*(1-.91*clamp(bl)));
 if(p.mood==='grit')face+=P(`M${hx-32} ${eyeY-7}l19 8l-18 8M${hx+32} ${eyeY-7}l-19 8l18 8`,ink,6);
 else face+=`<ellipse cx="${hx-21}" cy="${eyeY}" rx="6" ry="${eh}" fill="${ink}"/><ellipse cx="${hx+21}" cy="${eyeY}" rx="6" ry="${eh}" fill="${ink}"/>`;
 if(p.mood==='shock')face+=`<ellipse cx="${hx}" cy="${hy+25}" rx="13" ry="18" fill="${ink}"/>`;
 else if(p.mood==='grit')face+=`<path d="M${hx-24} ${hy+16}h48v19h-48Z" fill="#FBFAF8" stroke="${ink}" stroke-width="5"/>`+P(`M${hx-22} ${hy+25}h44`,ink,2.5);
 else face+=P(`M${hx-23} ${hy+24}Q${hx} ${hy+(p.mood==='sad'?3:p.mood==='flat'?24:49)} ${hx+23} ${hy+24}`,ink,6);
 if(p.mood==='sad')face+=P(`M${hx-32} ${hy-23}l17 -6M${hx+15} ${hy-29}l17 6`,ink,4);
 const facePhysics=p.facePhysics||0;
 art+=`<g transform="translate(${hx} ${hy}) scale(${mix(1,Math.abs(p.sx),facePhysics)/p.sx} ${mix(1,p.sy,facePhysics)/p.sy}) translate(${-hx} ${-hy}) rotate(${p.head} ${hx} ${hy+60})">${face}</g>`;
 if(hands)art+=palm(...left,p.open)+palm(...right,p.open);
 return `<g data-actor="plain-stickman" transform="translate(${p.x} ${p.y}) rotate(${p.r}) scale(${p.s*p.sx} ${p.s*p.sy})">${art}</g>`;
}
function crate(x,y,s=1,r=0){return G(x,y,s,r,
 `<path d="M-100-50L30-89L136-31L8 13Z" fill="#D5BCA2" stroke="${ink}" stroke-width="6"/><path d="M-100-50L8 13L8 148L-100 85Z" fill="#CFB091" stroke="${ink}" stroke-width="6"/><path d="M8 13L136-31L136 101L8 148Z" fill="#E0C6A7" stroke="${ink}" stroke-width="6"/>`+P('M-38-68L70-6L70 122','#AE8F72',20));}
function gift(x,y,s=1,r=0){return G(x,y,s,r,
 `<path d="M-76-40L70-43L74 70L-73 72Z" fill="#DCCBC0" stroke="${ink}" stroke-width="6"/><path d="M-84-58L79-60L81-30L-85-27Z" fill="#EFE5DA" stroke="${ink}" stroke-width="6"/><path d="M-9-56L12-57L14 70L-7 71Z" fill="${red}"/>`+P('M2-61C-60-119-74-56 0-58C62-121 73-60 2-61',red,10));}
function offering(x,y,s=1,r=0){return G(x,y,s,r,
 P('M-190 18L-28 18',gray,13)+`<path d="M-28 30L-18-4Q-13-15-4-12L38 0Q52 7 49 17Q47 25 34 23L15 19L31 31Q36 42 24 44L-4 34Z" fill="#F5EFE7" stroke="${ink}" stroke-width="5" stroke-linejoin="round"/>`);}
function burst(x,y,t,at,s=1){let u=clamp((t-at)/.24);if(t<at||u===1)return '';let a=1-u;
 let d='';for(let i=0;i<8;i++){let r=rad(i*45-100),v=43+out(u)*83;d+=P(`M${Math.cos(r)*v} ${Math.sin(r)*v}l${Math.cos(r)*(36-18*u)} ${Math.sin(r)*(36-18*u)}`,i%3===0?red:ink,i%2?5:8)}
 return `<g opacity="${a}" transform="translate(${x} ${y}) scale(${s})">${d}</g>`;}
function paper(x,y,r,s=1){return G(x,y,s,r,
 `<path d="M-92-23L72-25L95-8L91 12L-90 13Z" fill="#F7F3EC" stroke="${ink}" stroke-width="4"/>`+P('M-70-11L48-13M-73 1L64-1',gray,3));}
function stageCamera(t,art){
 let dx=0,dy=0,rot=0,z=1;
 for(const [at,mag] of [[1.84,11],[E.paperLands[4],16],[8.85,9],[E.contradiction,14],[E.revelation,9],[16.9,10],[E.you,5]]){
  let d=t-at;if(d>=0&&d<.20){let e=(1-d/.20)**2;dx+=Math.sin(d*101)*mag*e;dy+=Math.cos(d*87)*mag*.65*e;rot+=Math.sin(d*97)*mag*.025*e;}
 }
 if(t>=5.9&&t<8.32)z+=.035*smooth(t,6.1,7.7);
 // Small, fast punch-ins at actual contact; no constant camera wobble.
 for(const at of [1.84,E.paperLands[4],E.contradiction,E.revelation,16.9,E.you])z+=(at===E.contradiction?.10:.065)*pulse(t,at+.035,.10);
 return `<g transform="translate(${590+dx} ${730+dy}) rotate(${rot}) scale(${z}) translate(-590 -730)">${art}</g>`;
}
function draw(t,{title,drawStroke}){
 inspected=[];
 let art='',labels='',p;
 const ground=P('M130 985Q610 994 1115 982',gray,3);
 if(t<2.16){
  labels+=title('ALL BY',110,112,183)+title('YOURSELF?',148,112,335);
  labels+=drawStroke('M119 363Q460 376 800 356',700,t,.6,.7);
  const tug=pulse(t,.87,.075),refuse=smooth(t,.28,.42),recoil=pulse(t,.42,.06)-.45*pulse(t,.55,.055);
  let strain=smooth(t,1.27,1.42),lift=val(t,[[0,0],[.76,0],[.87,17,'out'],[1.02,0,'in'],[1.40,0],[1.56,60,'out'],[1.73,60],[1.84,0,'in'],[2.16,0]]);
  const contact=pulse(t,1.84,.055),settle=pulse(t,1.96,.045)-.5*pulse(t,2.07,.04);
  p=pose({x:510+4*strain-9*recoil,y:978,s:1.0,r:-11*strain-5*tug+6*contact+2*settle,
   sx:1+.08*contact,sy:1-.16*contact+.045*settle,facePhysics:.35*contact,
   head:-5*strain+9*recoil,left:[-79,-220],right:[113,-210],mood:strain>.35||tug>.2?'grit':'happy',ll:125,lk:72,rl:61,rk:84});
  const bx=660,by=867-lift,br=-lift*.12;
  // The one lifting hand is pinned to the front-left corner, not a nearby guess.
  const corner=[bx+(-100*Math.cos(rad(br))+50*Math.sin(rad(br)))*.80,by+(-100*Math.sin(rad(br))-50*Math.cos(rad(br)))*.80];
  p.right=local(p,corner);
  p.left=[mix(-122,-75,refuse),mix(-225,-125,refuse)];
  const offerX=val(t,[[0,185],[.12,185],[.25,285,'out'],[.42,285],[.59,110,'in']]);
  art+=offering(offerX,754,.9,0)+actor(p,t)+crate(bx,by,.8,br)+burst(650,973,t,1.84,1.05);
  if(lift>1)art+=P(`M790 ${900-lift}l35 0M797 ${925-lift}l48 0`,gray,4);
 }else if(t<5.9){
  const sick=smooth(t,2.98,3.16),receive=smooth(t,4.08,4.28),push=smooth(t,4.98,5.24);
  const doubleTake=pulse(t,2.40,.065)-.65*pulse(t,2.63,.06),flinch=pulse(t,3.16,.065)-.4*pulse(t,3.29,.055);
  p=pose({x:500-22*sick-13*flinch,y:978,s:1.18,r:-5*sick-6*flinch,sy:1-.12*sick-.06*flinch,head:6*sick+12*doubleTake,
   left:[mix(-75,-48,sick),mix(-125,-176,sick)],right:[mix(85,136,receive),mix(-125,-170,receive)],ll:121,lk:79,rl:60,rk:87,mood:sick>.4?'grit':'happy'});
  const contact=point(p,[136,-170]);
  const gx=mix(1005,contact[0]+74,receive)+push*130,gy=mix(702,contact[1]-70,receive)-Math.sin(push*Math.PI)*60;
  let gr=val(t,[[2.16,13],[4.08,9],[4.28,0,'out'],[4.36,-7],[4.47,3],[4.58,0],[4.98,0],[5.24,18,'out']]);
  if(receive>.97&&push<.25)p.right=local(p,[gx-74*Math.cos(rad(gr))-70*Math.sin(rad(gr)),gy-74*Math.sin(rad(gr))+70*Math.cos(rad(gr))]);
  if(push>.25)p.right=[mix(141,85,push),mix(-176,-125,push)];
  art+=offering(mix(1150,contact[0]+198,receive)+push*130,gy+81,1,180)+actor(p,t)+gift(gx,gy,1,gr)+burst(gx-60,gy+40,t,5.08,.65);
  // The recoil is physical: stomach-clutch, knees soften, gift follows the support hand.
  const drop=smooth(t,3.08,3.20)*(1-smooth(t,3.48,3.61));
  if(drop>0)art+=G(385,570+drop*62,1,12,`<path d="M0-19Q-19 5-7 14Q14 22 17 3Q15-5 0-19Z" fill="#9AAEB8"/>`);
 }else if(t<8.32){
  // Two-frame contact hold, then stored weight releases into a spring.
  const hit=E.paperLands[4];
  const force=val(t,[[5.9,0],[hit-.10,0],[hit,1,'in'],[hit+2/30,1],[hit+.18,-.42,'out'],[hit+.29,.24],[hit+.35,0]]);
  const escape=smooth(t,7.88,8.20),run=escape>0;
  const taps=E.paperLands.slice(0,4).reduce((a,c)=>a+pulse(t,c,.040)-.45*pulse(t,c+.10,.05),0);
  p=pose({x:520+escape*465,y:978-Math.sin(escape*Math.PI)*145,s:1.14,sx:1+1.15*Math.max(0,force)+.24*Math.min(0,force)+.06*taps,sy:1-.78*force-.085*taps,
   r:escape*23,head:run?-8:4*force,facePhysics:.95,mood:run?'shock':force>.3?'grit':'shock',
   left:[mix(-150,-128,escape),mix(-265,-240,escape)],right:[mix(150,124,escape),mix(-265,-195,escape)],
   ll:run?125+Math.sin(t*36)*35:116,lk:run?60-Math.sin(t*36)*35:87,
   rl:run?55-Math.sin(t*36)*35:63,rk:run?110+Math.sin(t*36)*35:85});
  // Each bundle falls onto the head; the stack follows the compressed contact surface.
  const faceScale=mix(1,p.sy,p.facePhysics);
  const top=point(p,[0,-345-60*faceScale/p.sy]);
  const bundles=[];
  for(let i=0;i<5;i++){
   let land=E.paperLands[i],u=clamp((t-(land-.18))/.18);
   if(t<land-.18)continue;
   // Each layer transmits the landing impulse later, not a rigid stack sticker.
   let wave=0,lag=0;
   for(let j=i;j<5;j++){
    let dt=t-E.paperLands[j]-(j-i)*.022;
    if(dt>=0&&dt<.36){const env=Math.exp(-dt*12),strength=j===4?1:.38;
     wave+=Math.sin(dt*29)*env*strength;
     lag+=Math.sin(dt*23)*env*strength;
    }
   }
   const release=Math.max(0,t-E.paperRelease-i*.018);
   const lift=release<.18?Math.sin(release/.18*Math.PI)*(21+i*9):0;
   let px=top[0]+(i%2?13:-12)*(1-u)+wave*(5+i*3),
       py=mix(220-i*17,top[1]-10-i*29,u*u)-lift+lag*(2+i*1.4),
       rot=(i%2?1:-1)*mix(28,2,u)+wave*(5+i*2);
   if(run){px=520-escape*210+(i-2)*escape*38;py=top[1]-10-i*29+escape*480;rot+=escape*(i-2)*95;}
   bundles.push({i,land,x:px,y:Math.min(968-i*8,py),rotation:rot,wave});
   art+=paper(px,Math.min(968-i*8,py),rot,1.12);
  }
  art=actor(p,t)+art+burst(520,top[1]-10,t,hit,1.6);
  inspected.at(-1).paper_bundles=bundles;
  if(run)art+=P(`M${p.x-180} 847l-72 0M${p.x-155} 894l-94 0`,gray,5);
 }else if(t<9.4){
  const close=smooth(t,8.71,8.85),width=mix(47,365,close),turn=smooth(t,8.91,9.02);
  art+=`<path d="M344 984V344H754V984" fill="#D6CDC1" stroke="${ink}" stroke-width="9"/><path d="M364 984V366H734V984Z" fill="#34312D"/>`;
  if(close<.88)art+=actor({x:635+close*25,y:982,s:1.05,r:12*(1-close),left:[-91,-232],right:[85,-211],mood:'shock'},t);
  art+=`<path d="M364 366H${364+width}V${mix(856,984,close)}L364 984Z" fill="#D7C6B5" stroke="${ink}" stroke-width="8"/>`;
  const knob=364+width-45;
  art+=C(knob,695,12)+G(knob,695,1,turn*90,P('M0 0L35 0',ink,9));
  art+=P(`M${knob} 745v16`,ink,6)+burst(730,700,t,8.85,.65);
  if(t>=9.02)art+=P(`M${knob-26} 797h${52*out((t-9.02)/.13)}`,red,7);
 }else if(t<10.6){
  const curl=smooth(t,9.4,9.68),flinch=pulse(t,9.80,.055)-.5*pulse(t,9.92,.05);
  art+=P('M272 365V984H1096',gray,5)+P('M272 365L510 256',gray,4);
  art+=`<path d="M843 402L1038 426V984H843Z" fill="#DED4C7" stroke="${gray}" stroke-width="5"/>`+C(879,729,7,gray);
  art+=actor({x:500,y:978,s:1.16,curl,head:8*curl+4*flinch,r:2*flinch,left:[-79,-180],right:[81,-195],mood:'sad'},t);
  art+=P('M358 971Q412 943 486 962',gray,3,`opacity="${curl*.45}"`);
 }else if(t<12.26){
  const hit=E.contradiction,deflate=smooth(t,hit,hit+.13);
  const force=val(t,[[10.6,0],[hit,0],[hit+.10,1,'in'],[hit+.17,1],[E.bodyRebound,-.40,'out'],[11.38,.45],[11.58,.18],[11.80,.22],[12.26,.22]]);
  const crease=val(t,[[10.6,0],[hit,0],[hit+.10,1,'in'],[11.15,-.25],[11.38,.25],[11.58,0]]);
  labels+=`<g transform="translate(112 300) rotate(${crease*2.7}) translate(-112 -300)">${title('INDEPENDENCE',116,112,300)}</g>`;
  labels+=drawStroke('M118 257L970 325',880,t,hit,.12,red,14);
  art+=actor({x:550+10*deflate,y:978,s:1.12,sy:1-.81*force,sx:1+1.25*Math.max(0,force)+.35*Math.min(0,force),facePhysics:.97,
   r:7*deflate,head:12*deflate,left:[mix(-150,-75,deflate),mix(-265,-125,deflate)],
   right:[mix(150,85,deflate),mix(-265,-125,deflate)],ll:125,lk:80,rl:55,rk:100,mood:force>.55?'shock':deflate>.5?'flat':'happy'},t);
  art+=burst(550,958,t,hit+.10,1.3);
  labels+=burst(970,305,t,hit,.8);
 }else if(t<14.04){
  const hit=out((t-E.revelation)/.16),curl=smooth(t,12.46,12.74);
  const recoil=pulse(t,E.revelation+.06,.075)-.40*pulse(t,E.revelation+.21,.08);
  const huddle=val(t,[[12.26,0],[12.50,0],[12.68,.72,'smooth'],[12.82,1,'smooth'],[13.06,.78,'smooth'],[13.23,1,'smooth'],[13.62,.82,'smooth'],[14.04,.72,'smooth']]);
  labels+=G(112,0,mix(.96,1,hit),0,title('TRAUMA',150,0,270,red)+title('RESPONSE',150,0,426));
  art+=actor({x:620-18*recoil,y:978,s:1.04,curl:curl*.8,huddle,head:6+6*recoil+8*huddle,sy:1-.10*recoil,sx:1+.08*recoil,mood:'sad'},t);
 }else if(t<17.84){
  const walk=smooth(t,16.04,16.36),tryReach=val(t,[[14.04,0],[14.66,0],[14.82,.4,'out'],[15.02,.4],[15.14,.12,'in'],[15.52,.12],[15.68,.5,'out'],[16.04,.5],[16.36,1,'out']]);
  const snap=smooth(t,16.9,17.04),fall=pulse(t,17.12,.065)-.45*pulse(t,17.25,.05);
  p=pose({x:430+walk*95-snap*90,y:978,s:.88,r:-18*snap,head:6*snap,curl:.62*snap,
   left:[-81,-184],right:[mix(90,150,tryReach),mix(-215,-290,tryReach)],mood:snap>.1?'sad':'happy',
   ll:116+Math.sin(walk*Math.PI*4)*18*(1-walk),rl:63-Math.sin(walk*Math.PI*4)*18*(1-walk),
   lk:87,rk:85,sy:1-.08*fall});
  const handX=710+snap*185;
  art+=offering(handX,740,1,180);
  let wrist=point(p,p.right),end=[handX-48,722];
  if(walk>.1&&snap<.02)art+=P(`M${wrist.join(' ')}Q640 695 ${end.join(' ')}`,red,4);
  else if(snap>0&&snap<.9){art+=P(`M${wrist.join(' ')}l${32*(1-snap)} -12M${end.join(' ')}l${-25*(1-snap)} -9`,red,4)}
  art+=actor(p,t)+burst(648,718,t,16.9,.7);
 }else{
  const approach=smooth(t,18.10,18.40),reach=smooth(t,18.94,E.mirrorTouch),self=smooth(t,E.self,E.you);
  const mirror=`<path d="M699 407Q699 385 725 388L1047 407L1034 979L680 975Z" fill="#E2DDD5" stroke="${gray}" stroke-width="6"/>`;
  art+=mirror;
  const retreat=smooth(t,19.40,19.60)*(1-smooth(t,20.03,E.mirrorRetouch));
  const contact=val(t,[[17.84,0],[E.mirrorTouch,0],[19.20,1,'out'],[19.32,-.45],[19.43,0],[E.mirrorRetouch,0],[20.37,.6,'out'],[20.50,-.2],[20.64,0]]);
  const lean=val(t,[[17.84,0],[19.16,0],[19.32,-5],[19.60,8],[19.93,11],[20.16,3],[20.42,-3],[20.76,2],[21.06,0],[E.you,-3]]);
  p=pose({x:mix(430,531,approach)-retreat*32+contact*8,y:978-retreat*12,s:1.12,r:retreat*4,head:lean,
   sy:1-.065*contact,sx:1+.04*contact,
   left:[mix(-75,-56,self),mix(-125,-178,self)],right:[85,-210],mood:self>.4?'happy':retreat>.45?'shock':'sad'});
  // Palm stays on the physical glass during contact; both fixed arm bones remain valid.
  const glass=[699,710];
  const rest=[mix(85,149,reach)-retreat*45,mix(-210,-239,reach)+retreat*20];
  const pinned=local(p,glass),touch=reach*(1-retreat);
  p.right=[mix(rest[0],pinned[0],touch),mix(rest[1],pinned[1],touch)];
  p.right=[mix(p.right[0],56,self),mix(p.right[1],-178,self)];
  const reflection=actor({...p,x:1396-p.x,sx:-1,r:-p.r},t);
  art+=`<defs><clipPath id="mirror-area"><path d="M704 408L1037 424L1024 968L693 967Z"/></clipPath></defs><g opacity=".27" clip-path="url(#mirror-area)">${reflection}</g>`;
  art+=P('M971 465L932 504M978 491L946 523',gray,4,`opacity=".28"`);
  for(const [at,mag] of [[E.mirrorTouch,1],[E.mirrorRetouch,.72]]){
   let u=(t-at)/.38;if(u>=0&&u<1)art+=`<ellipse cx="699" cy="710" rx="${6+u*15}" ry="${10+u*30}" fill="none" stroke="${gray}" stroke-width="3" opacity="${(1-u)*.6*mag}"/>`;
  }
  art+=actor(p,t);
  inspected.at(-1).glass_contact={target:glass,wrist:point(p,p.right),touch,self};
  if(t>=E.you){let size=val(t,[[E.you,.68],[21.55,1.10,'out'],[21.65,.97],[21.78,1]]);labels+=G(125,365,size,0,title('YOU',190,0,0,red));}
 }
 return `<defs><clipPath id="stage-bounds"><rect x="35" y="110" width="1165" height="925"/></clipPath></defs><g clip-path="url(#stage-bounds)">${stageCamera(t,ground+art)}</g><g data-layer="screen-space-titles">${labels}</g>`;
}
module.exports={draw,_geometry:{pose,point,local,actor,crate,gift,offering,burst,paper,P,C,G,val,smooth,pulse,mix,clamp,out,rad,reset:()=>{inspected=[]},observed:()=>inspected},inspect:t=>{draw(t,{title:()=>'',drawStroke:()=>''});return inspected;},events:[
 {time:1.40,event:'fast heave preparation after an earlier failed tug'}, {time:1.56,event:'box lift, one wrist pinned to crate corner'},
 {time:1.84,event:'box contact, compress and rebound'}, {time:3.3,event:'gift anticipation and stomach-clutch recoil'},
 {time:4.28,event:'gift receipt: support hand follows lower corner'}, {time:5.15,event:'gift pushed away on a short arc'},
 {time:7.52,event:'paper stack contact compresses actor'}, {time:7.88,event:'quick spring free into run'},
 {time:8.85,event:'door closes'}, {time:9.02,event:'handle turn and lock'},
 {time:9.68,event:'quick slide into curled isolation, then a small flinch'}, {time:10.9,event:'independence contradiction; pose deflates'},
 {time:12.66,event:'shoulder hunch, inward hands and protective curl; no symbolic enclosure'}, {time:16.36,event:'childhood reach'},
 {time:16.9,event:'connection snaps and actor recoils'}, {time:19.14,event:'mirror approach'},
 {time:21.48,event:'hands return to self and final YOU'}
],timing_comparison:[
 {action:'refuse help',v3_seconds:.54,v4_seconds:.14},
 {action:'gift support reach',v3_seconds:.58,v4_seconds:.20},
 {action:'gift push',v3_seconds:.53,v4_seconds:.26},
 {action:'paper fall',v3_seconds:.36,v4_seconds:.18},
 {action:'escape travel',v3_seconds:.56,v4_seconds:.32},
 {action:'door close',v3_seconds:.53,v4_seconds:.14},
 {action:'protective curl',v3_seconds:.84,v4_seconds:.28},
 {action:'memory walk',v3_seconds:.82,v4_seconds:.32},
 {action:'connection recoil',v3_seconds:.28,v4_seconds:.14},
 {action:'mirror walk',v3_seconds:1.08,v4_seconds:.30},
 {action:'hands return to self',v3_seconds:.62,v4_seconds:.22}
]};
