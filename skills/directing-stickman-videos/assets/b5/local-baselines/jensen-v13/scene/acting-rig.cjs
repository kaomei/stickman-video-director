/* Authored acting, not a procedural idle loop. Arms retain 86/84px bones;
 * legs retain 80/80px bones. Named squash/stretch affects the complete body.
 * Feet are solved in world space, and props use the actual rendered wrist. */
const {curve}=require('./limbs-v2.cjs');
const ink='#1E1C1A',paper='#FBFAF8',red='#D7372C',rad=x=>x*Math.PI/180,deg=x=>x*180/Math.PI;
const P=(d,c=ink,w=10)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const G=(x,y,r,s,a)=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${a}</g>`;
const defaults={x:400,fc:400,s:1,sx:1,sy:1,r:0,legH:144,spread:54,bend:0,h:118,head:0,neckLag:0,la:106,lb:142,ra:65,rb:30,fly:0,liftL:0,liftR:0,mood:'flat'};
const numeric=Object.keys(defaults).filter(k=>typeof defaults[k]==='number');
function track(t,keys,base={}){
 const d={...defaults,...base},q={};
 for(const k of numeric){let v=d[k],ks=[];for(const [at,p]of keys){if(k in p)v=p[k];ks.push([at,v])}q[k]=curve(t,ks)}
 q.mood=d.mood;for(const [at,p]of keys)if(t>=at&&p.mood)q.mood=p.mood;
 q.deformation=Math.abs(q.sx-1)+Math.abs(q.sy-1)>.025?'authored_force_or_recovery':'none';
 q.y=984-q.legH*q.s*q.sy-q.fly;
 q.shoulder=[q.bend,-q.h];q.neck=[q.bend*.95,-q.h-19];
 q.headCenter=[q.neck[0]+q.neckLag+57*Math.sin(rad(q.head)),q.neck[1]-57*Math.cos(rad(q.head))];
 q.supports=q.fly===0?[[q.fc-q.spread*q.s,984-q.liftL],[q.fc+q.spread*q.s,984-q.liftR]]:[];
 if(q.supports.length){
  // Near force extremes, lowering the pelvis is physical knee flexion. It is
  // not a limb-length clamp. Keep both world-space sole contacts unchanged.
  for(let n=0;n<100;n++){
   const a=q.supports.map(p=>local(q,p));if(Math.max(...a.map(p=>Math.hypot(...p)))<159.7)break;
   q.y+=q.s*.6;
  }
  q.localFeet=q.supports.map(p=>local(q,p));
 }else{
  // Start/end a hop at the planted sole positions, then tuck in flight.
  // A hard switch to a generic airborne pose would pop both feet at takeoff.
  const u=Math.min(1,Math.abs(q.fly)/38),k=u*u*(3-2*u);
  const tucked=[[-q.spread*.8,Math.min(134,q.legH)-13],[q.spread,Math.min(134,q.legH)-22]];
  q.localFeet=[-1,1].map((side,i)=>{
   const a=local(q,[q.fc+side*q.spread*q.s,984-(i?q.liftR:q.liftL)-q.fly]);
   const p=a.map((v,j)=>v+(tucked[i][j]-v)*k),d=Math.hypot(...p);
   return d>159.9?p.map(v=>v*159.9/d):p;
  });
 }
 q.legs=q.localFeet.map((p,i)=>solve([0,0],p,80,80,i?-1:1));
 q.arms=[chain(q.shoulder,q.la,q.lb),chain(q.shoulder,q.ra,q.rb)];
 return q;
}
function chain(start,a,b,l1=86,l2=84){const e=[start[0]+Math.cos(rad(a))*l1,start[1]+Math.sin(rad(a))*l1];return[start,e,[e[0]+Math.cos(rad(b))*l2,e[1]+Math.sin(rad(b))*l2]]}
function solve(start,end,l1,l2,side){const x=end[0]-start[0],y=end[1]-start[1],d=Math.hypot(x,y);if(d>=l1+l2||d<=Math.abs(l1-l2))throw Error(`Unreachable limb ${d}`);const a=Math.atan2(y,x)+side*Math.acos((l1*l1+d*d-l2*l2)/(2*l1*d));return[start,[start[0]+l1*Math.cos(a),start[1]+l1*Math.sin(a)],end]}
function world(q,p){const x=p[0]*q.s*q.sx,y=p[1]*q.s*q.sy,a=rad(q.r);return[q.x+x*Math.cos(a)-y*Math.sin(a),q.y+x*Math.sin(a)+y*Math.cos(a)]}
function local(q,p){const x=p[0]-q.x,y=p[1]-q.y,a=rad(q.r);return[(x*Math.cos(a)+y*Math.sin(a))/(q.s*q.sx),(-x*Math.sin(a)+y*Math.cos(a))/(q.s*q.sy)]}
function reach(q,i,target,side=i?-1:1){q.arms[i]=solve(q.shoulder,local(q,target),86,84,side)}
let audit=[];
const line=p=>P(p.map((v,i)=>(i?'L':'M')+v.join(' ')).join(''),ink,16);
function actor(t,q,{female=false,id='main'}={}){
 let art=line(q.legs[0])+line(q.legs[1])+P(`M0 0Q${-q.bend*.18} ${-q.h*.55} ${q.shoulder.join(' ')}L${q.neck.join(' ')}`,ink,17)+q.arms.map(line).join('');
 let face=female?`<path d="M-58 45Q-81-47-43-65Q18-96 61-43L70 51L47 43L43-18Q0-38-46-7L-46 43Z" fill="${ink}"/>`:'';
 face+=`<circle r="60" fill="${paper}" stroke="${ink}" stroke-width="11"/>`;
 if(q.mood==='grit')face+=P('M-30-16l17 7l-17 7M30-16l-17 7l17 7',ink,6)+`<path d="M-23 13H23V33H-23Z" fill="${paper}" stroke="${ink}" stroke-width="5"/>`+P('M-21 23H21',ink,2);
 else{const blink=Math.exp(-Math.pow((t%3.4-2.8)/.048,2));face+=`<ellipse cx="-21" cy="-5" rx="7" ry="${7-6*blink}" fill="${ink}"/><ellipse cx="21" cy="-5" rx="7" ry="${7-6*blink}" fill="${ink}"/>`;
  if(q.mood==='curious'||q.mood==='sad')face+=P('M-32-28l19-5M13-33l19 5',ink,4);
  face+=q.mood==='shock'?`<ellipse cy="26" rx="13" ry="18" fill="${ink}"/>`:P(q.mood==='sad'?'M-22 29Q0 5 22 29':q.mood==='happy'?'M-23 19Q0 48 23 19':'M-21 26H21',ink,6);
 }
 if(female)face+=P('M-47-30Q-12-13 18-47L47-22',ink,10);
 art+=G(...q.headCenter,q.head,1,face);
 audit.push({id,t,q,arms:q.arms,legs:q.legs,worldHands:q.arms.map(a=>world(q,a[2])),worldFeet:q.legs.map(a=>world(q,a[2])),worldHead:world(q,q.headCenter)});
 return `<g transform="translate(${q.x} ${q.y}) rotate(${q.r}) scale(${q.s*q.sx} ${q.s*q.sy})">${art}</g>`;
}
function reset(){audit=[]}
module.exports={track,world,local,reach,actor,reset,inspected:()=>audit,curve,P,G,chain};
