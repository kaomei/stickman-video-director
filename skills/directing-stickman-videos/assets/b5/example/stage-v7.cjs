/* V7: oversized props, actual contact, absurd consequences and recovery.
   Only the left stage before 9.4s changes. The later V6 stage is reused. */
const legacy=require('./stage-legacy.cjs');
const {pose,point,local,actor,crate,gift,offering,burst,paper,P,C,G,val,smooth,pulse,mix,clamp,out,rad,reset,observed}=legacy._geometry;
const ink='#1E1C1A',red='#D7372C',gray='#858079';
const events=[
 {time:.035,event:'opening headline lands'},
 {time:.87,event:'failed first tug: giant crate barely rocks'},
 {time:1.56,event:'heave raises one enormous crate corner'},
 {time:1.84,event:'giant crate slams down; shock wave launches actor'},
 {time:2.10,event:'actor lands and compresses after launch'},
 {time:2.48,event:'oversized gift skids to a stop'},
 {time:3.16,event:'bow uncoils into a long ribbon'},
 {time:3.68,event:'first ribbon loop catches waist'},
 {time:4.28,event:'second loop binds torso; actor recoils'},
 {time:5.08,event:'gift shoots away, taut ribbon drags actor'},
 {time:6.24,event:'paper tower lands beside actor'},
 {time:6.96,event:'tower tips into avalanche'},
 {time:7.52,event:'paper avalanche covers stage; actor springs clear'},
 {time:8.85,event:'door slams against flying paper'},
 {time:9.02,event:'lock clicks'},
 ...legacy.events.filter(e=>e.time>=10.6)
];
function shockRing(x,y,t,at){
 const u=clamp((t-at)/.29);if(t<at||u>=1)return '';
 return `<ellipse cx="${x}" cy="${y}" rx="${60+470*out(u)}" ry="${5+42*out(u)}" fill="none" stroke="${ink}" stroke-width="${9*(1-u)}" opacity="${1-u}"/>`;
}
function camera(t,art){
 let dx=0,dy=0,z=1;
 for(const [at,mag] of [[1.84,19],[2.10,8],[2.48,7],[4.28,6],[5.08,10],[6.24,9],[7.52,16],[8.85,12]]){
  const d=t-at;if(d>=0&&d<.19){const e=(1-d/.19)**2;dx+=Math.sin(d*104)*mag*e;dy+=Math.cos(d*83)*mag*.55*e;}
 }
 z+=.035*pulse(t,1.87,.09)+.045*pulse(t,7.55,.10);
 return `<g transform="translate(${590+dx} ${730+dy}) scale(${z}) translate(-590 -730)">${art}</g>`;
}
function ribbon(p,t,gx,gy,front){
 const unroll=smooth(t,3.16,3.56),wrap1=smooth(t,3.56,3.78),wrap2=smooth(t,4.08,4.28);
 if(unroll<=0)return '';
 const a=point(p,[-53,-211]),b=point(p,[55,-211]),c=point(p,[-55,-163]),d=point(p,[58,-163]);
 const source=[gx-8*2.8,gy-58*2.8],tug=smooth(t,4.98,5.18);
 if(!front){
  const endpoint=[mix(source[0]-15,a[0],unroll),mix(source[1]+40,a[1],unroll)];
  return P(`M${source.join(' ')}C${source[0]-220} ${source[1]-160} ${a[0]-190} ${a[1]+110} ${endpoint.join(' ')}`,red,17)+
   P(`M${a.join(' ')}C${a[0]-120} ${a[1]-70} ${b[0]+105} ${b[1]-70} ${b.join(' ')}`,red,18,`stroke-dasharray="650 650" stroke-dashoffset="${650*(1-wrap1)}"`)+
   P(`M${c.join(' ')}C${c[0]-120} ${c[1]-60} ${d[0]+105} ${d[1]-60} ${d.join(' ')}`,red,18,`stroke-dasharray="650 650" stroke-dashoffset="${650*(1-wrap2)}"`);
 }
 return P(`M${a.join(' ')}Q${p.x} ${a[1]+37-20*tug} ${b.join(' ')}`,red,19,`stroke-dasharray="200 200" stroke-dashoffset="${200*(1-wrap1)}"`)+
  P(`M${c.join(' ')}Q${p.x} ${c[1]+34-17*tug} ${d.join(' ')}`,red,19,`stroke-dasharray="200 200" stroke-dashoffset="${200*(1-wrap2)}"`)+
  (wrap2>.9?P(`M${d.join(' ')}Q${p.x+110} ${d[1]+115} ${p.x+65} ${d[1]+150}`,red,15):'');
}
function doorArt(t){
 const close=smooth(t,8.71,8.85),width=mix(47,365,close),turn=smooth(t,8.91,9.02);
 let art=`<path d="M344 984V344H754V984" fill="#D6CDC1" stroke="${ink}" stroke-width="9"/><path d="M364 984V366H734V984Z" fill="#34312D"/>`;
 if(close<.88)art+=actor({x:635+close*25,y:982,s:1.05,r:12*(1-close),left:[-91,-232],right:[85,-211],mood:'shock'},t);
 for(let i=0;i<7;i++){
  const u=smooth(t,8.32+i*.035,8.87+i*.035);
  const x=mix(1150+i*65,790+(i%2)*50,u),y=mix(510+i*53,960-i*18,u*u);
  art+=paper(x,y,mix(-34+i*12,12-i*8,u),1.3);
 }
 art+=`<path d="M364 366H${364+width}V${mix(856,984,close)}L364 984Z" fill="#D7C6B5" stroke="${ink}" stroke-width="8"/>`;
 const knob=364+width-45;
 art+=C(knob,695,12)+G(knob,695,1,turn*90,P('M0 0L35 0',ink,9));
 art+=P(`M${knob} 745v16`,ink,6)+burst(730,700,t,8.85,1.15);
 if(t>=9.02)art+=P(`M${knob-26} 797h${52*out((t-9.02)/.13)}`,red,7);
 return art;
}
function draw(t,helpers){
 if(t>=9.4)return legacy.draw(t,helpers);
 reset();const {title,drawStroke}=helpers;
 let art='',p;
 if(t<2.16){
  art+=title('ALL BY',110,112,183)+title('YOURSELF?',148,112,335)+drawStroke('M119 363Q460 376 800 356',700,t,.6,.7);
  const lift=val(t,[[0,0],[.77,0],[.87,8,'out'],[1.02,0,'in'],[1.40,0],[1.56,22,'out'],[1.73,22],[1.84,0,'in']]);
  const launch=val(t,[[0,0],[1.84,0],[1.94,1,'out'],[2.10,0,'in'],[2.16,0]]),land=pulse(t,2.10,.037);
  const bx=850,by=638-lift,br=-lift*.055,bs=2.3;
  p=pose({x:500-launch*87,y:978-launch*155,s:.95,r:-launch*52,sx:1+.18*land,sy:1-.26*land,
   head:lift>0?-7:0,left:[-84,-153],right:[100,-170],mood:t>1.84?'shock':t>.75?'grit':'happy',
   ll:125+launch*32,lk:74-launch*54,rl:61-launch*35,rk:84+launch*53});
  const corner=[bx+bs*(-100*Math.cos(rad(br))-85*Math.sin(rad(br))),by+bs*(-100*Math.sin(rad(br))+85*Math.cos(rad(br)))];
  if(t<1.84)p.right=local(p,corner);
  const helpX=val(t,[[0,160],[.15,160],[.28,320,'out'],[.42,320],[.61,105,'in']]);
  art+=offering(helpX,777,1.4,0)+crate(bx,by,bs,br)+actor(p,t)+burst(850,978,t,1.84,2)+shockRing(850,981,t,1.84)+burst(405,973,t,2.10,.85);
  if(launch>.1)art+=P(`M${p.x+65} ${p.y-310}l85 30M${p.x+90} ${p.y-255}l110 20`,gray,5);
 }else if(t<5.9){
  const enter=out((t-2.16)/.32),sick=smooth(t,2.98,3.16),bind=smooth(t,4.08,4.28),tug=smooth(t,4.98,5.18);
  const recoil=pulse(t,4.28,.065),tugJump=Math.sin(tug*Math.PI)*72;
  const gx=mix(1480,880,enter)+tug*260,gy=775-12*pulse(t,2.48,.05)-Math.sin(tug*Math.PI)*32;
  p=pose({x:455+tug*205,y:978-tugJump,s:1.12,r:-7*sick+24*tug-11*recoil,sy:1-.15*bind+.10*pulse(t,5.18,.07),sx:1+.10*recoil,
   head:9*sick,mood:sick>.3?'grit':'happy',left:[mix(-76,-122,bind),mix(-135,-218,bind)],right:[mix(89,135,bind),mix(-145,-210,bind)],
   ll:121+tug*35,lk:79-tug*49,rl:60-tug*33,rk:87+tug*35});
  art+=gift(gx,gy,2.8,6*(1-enter)+12*tug)+ribbon(p,t,gx,gy,false)+actor(p,t)+ribbon(p,t,gx,gy,true);
  art+=burst(gx,960,t,2.48,.9)+burst(p.x,745,t,4.28,.9)+burst(p.x-90,960,t,5.08,1.25);
  if(tug>.1)art+=P(`M${p.x-210} 929h-100M${p.x-160} 952h-130`,gray,5);
  const drop=smooth(t,3.08,3.20)*(1-smooth(t,3.48,3.61));
  if(drop>0)art+=G(330,565+drop*62,1.35,12,`<path d="M0-19Q-19 5-7 14Q14 22 17 3Q15-5 0-19Z" fill="#9AAEB8"/>`);
 }else if(t<8.32){
  const enter=out((t-5.9)/.34),tip=smooth(t,6.70,7.52),run=smooth(t,7.58,8.23);
  const compress=pulse(t,7.52,.06),jump=Math.sin(run*Math.PI)*170;
  p=pose({x:425+run*675,y:978-jump,s:1.10,r:run*17,sx:1+.18*compress,sy:1-.25*compress,
   left:[-128,-232],right:[128,-217],head:-8*tip,mood:tip>.15?'shock':'happy',
   ll:116+Math.sin(run*Math.PI*6)*36,lk:87-Math.sin(run*Math.PI*6)*38,
   rl:63-Math.sin(run*Math.PI*6)*36,rk:85+Math.sin(run*Math.PI*6)*38});
  let tower='';
  for(let i=0;i<10;i++){
   const tilt=-(i%2?3:-2),a=rad(-72*tip),offY=-24-i*53;
   let x=905-offY*Math.sin(a),y=978+offY*Math.cos(a)-440*(1-enter);
   const scatter=smooth(t,7.30+i*.018,7.75+i*.018);
   x+=scatter*((i%3)*100-180);y=mix(y,956-i%3*18,scatter);
   tower+=paper(x,y,mix(tilt-72*tip,(i%3-1)*12,scatter),1.9);
  }
  art+=actor(p,t)+tower+burst(850,976,t,6.24,1.35)+burst(490,940,t,7.52,2)+shockRing(490,978,t,7.52);
  if(run>.1)art+=P(`M${p.x-190} ${p.y-185}h-115M${p.x-165} ${p.y-135}h-155`,gray,6);
 }else art+=doorArt(t);
 const ground=P('M130 985Q610 994 1115 982',gray,3);
 return `<defs><clipPath id="stage-bounds"><rect x="35" y="110" width="1165" height="925"/></clipPath></defs><g clip-path="url(#stage-bounds)">${camera(t,ground+art)}</g>`;
}
module.exports={draw,inspect:t=>{draw(t,{title:()=>'',drawStroke:()=>''});return observed()},events,timing_comparison:[
 {gag:'crate',v6_prop_scale:.8,v7_prop_scale:2.3,consequence:'155px launch, 52-degree recoil and landing'},
 {gag:'gift',v6_prop_scale:1,v7_prop_scale:2.8,consequence:'two ribbon wraps and 165px dragged actor'},
 {gag:'paper',v6_bundles:5,v7_bundles:10,v7_prop_scale:1.9,consequence:'tower tips 72 degrees, avalanche and 675px escape'}
]};
