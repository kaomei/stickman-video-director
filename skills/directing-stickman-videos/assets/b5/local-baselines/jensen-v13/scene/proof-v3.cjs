const {pose,curve,TAKEOFF}=require('./limbs-v3.cjs');
const ink='#1E1C1A',red='#D7372C',paper='#FBFAF8',gray='#858079',rad=x=>x*Math.PI/180;
const clamp=x=>Math.max(0,Math.min(1,x));
const P=(d,c=ink,w=10)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const G=(x,y,r,s,a)=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${a}</g>`;
const value=(t,k)=>curve(t,k);
function chain(start,a,b,l1=86,l2=84){const e=[start[0]+Math.cos(rad(a))*l1,start[1]+Math.sin(rad(a))*l1];return[start,e,[e[0]+Math.cos(rad(b))*l2,e[1]+Math.sin(rad(b))*l2]]}
function geometry(q){return{q,left:chain(q.shoulder,q.la,q.lb),right:chain(q.shoulder,q.ra,q.rb),legL:chain([0,0],q.ll,q.lk,80,80),legR:chain([0,0],q.rl,q.rk,80,80)}}
function world(q,p){const x=p[0]*q.sx,y=p[1]*q.sy;return[q.x+x*Math.cos(rad(q.r))-y*Math.sin(rad(q.r)),q.y+x*Math.sin(rad(q.r))+y*Math.cos(rad(q.r))]}
const line=p=>P(p.map((v,i)=>(i?'L':'M')+v.join(' ')).join(''),ink,16);
function hero(q){const g=geometry(q);
 let a=line(g.legL)+line(g.legR)+P(`M0 0Q${-q.bend*.18} ${-q.h*.55} ${q.shoulder.join(' ')}L${q.neck.join(' ')}`,ink,17)+line(g.left)+line(g.right);
 let face=`<circle r="60" fill="${paper}" stroke="${ink}" stroke-width="11"/>`;
 if(q.mood==='grit')face+=P('M-30-16l17 7l-17 7M30-16l-17 7l17 7',ink,6)+`<path d="M-23 13H23V33H-23Z" fill="${paper}" stroke="${ink}" stroke-width="5"/>`+P('M-21 23H21',ink,2);
 else{
  face+=`<circle cx="-21" cy="-5" r="7" fill="${ink}"/><circle cx="21" cy="-5" r="7" fill="${ink}"/>`;
  if(q.mood==='curious')face+=P('M-32-28l19-5M13-28l19 5',ink,4);
  if(q.mood==='sad')face+=P('M-31-27l18-5M13-32l18 5',ink,4);
  face+=q.mood==='shock'?`<ellipse cy="26" rx="13" ry="18" fill="${ink}"/>`:P(q.mood==='sad'?'M-22 29Q0 5 22 29':'M-21 26H21',ink,6);
 }
 a+=G(...q.headCenter,q.head,1,face);
 return `<g transform="translate(${q.x} ${q.y}) rotate(${q.r}) scale(${q.sx} ${q.sy})">${a}</g>`;
}
function photo(b){
 let a=`<path d="M0-200Q${-b}-80 0 0Q${b} 100 0 200L400 200Q${400+b} 80 400 0Q${400-b}-100 400-200Z" fill="${paper}" stroke="${ink}" stroke-width="7"/>`;
 a+=P('M20-179Q190-192 380-179',gray,3)+`<path d="M24-149H376V137H24Z" fill="#E1DCD3" stroke="${ink}" stroke-width="4"/>`;
 for(let i=0;i<4;i++){const x=75+i*83;a+=`<circle cx="${x}" cy="-46" r="29" fill="${paper}" stroke="${ink}" stroke-width="5"/>`+P(`M${x}-17V58M${x} 4L${x-25} 29M${x} 4L${x+25} 29`,ink,6)+`<circle cx="${x-9}" cy="-49" r="3" fill="${ink}"/><circle cx="${x+9}" cy="-49" r="3" fill="${ink}"/>`+P(`M${x-9}-34q9 6 18 0`,ink,3)}
 return a+P('M39 56H361M39 61H361',ink,4)+P('M30 168H157',gray,4)+P('M293 168h75',red,6);
}
function camera(t,contact,attached){
 const x=value(t,[[24.9,1435],[25.16,1435],[25.65,1050],[26.10,1050],[26.3,1088],[27.5,1088],[28.60,1450]]);
 const cy=attached?contact[1]:value(t,[[TAKEOFF,contact[1]],[26.42,730],[28.8,730]]);
 // The lens can telescope a bounded distance, then retracts with its camera.
 const retraction=clamp((t-26.18)/.22),target=Math.max(x-340,Math.min(x-116,contact[0]));
 const lens=attached?target:target+(x-116-target)*retraction;
 let a=`<path d="M${x-116} ${cy-125}H${x+105}V${cy+125}H${x-116}Z" fill="${paper}" stroke="${ink}" stroke-width="9"/><path d="M${x-85} ${cy-125}v-43h105v43" fill="${paper}" stroke="${ink}" stroke-width="8"/>`;
 a+=`<path d="M${x-116} ${cy-73}L${lens} ${cy-58}V${cy+58}L${x-116} ${cy+73}Z" fill="#D7D2C8" stroke="${ink}" stroke-width="7"/>`;
 for(let xx=lens+24;xx<x-125;xx+=27)a+=P(`M${xx} ${cy-58}v116`,ink,3);
 a+=`<ellipse cx="${lens}" cy="${cy}" rx="18" ry="59" fill="${ink}"/><circle cx="${x+55}" cy="${cy-71}" r="12" fill="${red}"/>`;
 for(const at of [25.65,26.85]){const dt=t-at;if(dt>=0&&dt<.14)a+=G(x-30,cy-160,0,1+dt*5,`<path d="M0-63L12-15L57-36L28 0L64 19L13 20L0 62L-13 21L-58 32L-27 1L-61-22L-13-14Z" fill="${paper}" stroke="${ink}" stroke-width="4"/>`)}
 return a;
}
const releaseQ=pose(TAKEOFF),releaseGrip=world(releaseQ,geometry(releaseQ).right[2]);
let lastAudit;
function draw(t,tx){
 const q=pose(t),g=geometry(q),grip=world(q,g.right[2]),attached=t<=TAKEOFF;
 let angle=value(t,[[24.9,-5],[25.35,-9],[25.65,3],[26.10,7],[TAKEOFF,12]]),prop=grip;
 if(!attached){prop=[value(t,[[TAKEOFF,releaseGrip[0]],[26.45,640],[26.85,825],[27.30,1010],[28.8,1010]]),value(t,[[TAKEOFF,releaseGrip[1]],[26.48,475],[26.85,600],[27.30,976],[27.48,970],[27.68,980],[28.8,980]])];angle=value(t,[[TAKEOFF,12],[26.48,49],[26.85,105],[27.30,180],[27.48,176],[27.68,180],[28.8,180]])}
 const s=attached?1:value(t,[[TAKEOFF,1],[26.85,.76],[27.30,.66],[28.8,.66]]);
 const bend=value(t,[[24.9,0],[25.65,7],[26.05,76],[26.30,-50],[26.55,36],[26.85,-20],[27.3,0],[28.8,0]]);
 const flat=value(t,[[24.9,1],[27.14,1],[27.30,.075],[27.48,.10],[27.68,.055],[28.8,.055]]);
 const edge=attached?[prop[0]+400*Math.cos(rad(angle)),prop[1]+400*Math.sin(rad(angle))]:[releaseGrip[0]+400*Math.cos(rad(12)),releaseGrip[1]+400*Math.sin(rad(12))];
 let art=camera(t,edge,attached)+G(prop[0],prop[1],angle,s,`<g transform="scale(1 ${flat})">${photo(bend)}</g>`)+hero(q);
 if(t>TAKEOFF&&t<27.65)for(let i=1;i<=2;i++){const u=clamp((t-TAKEOFF-i*.055)/1.08);art+=G(510+(900+i*90)*u,710-(240+i*35)*Math.sin(Math.PI*u)-90*u,-15+i*17+90*u,.28,photo(bend*.7))}
 const hit=Math.max(0,1-(t-25.65)/.20)*(t>=25.65?1:0),land=Math.max(0,1-(t-27.035)/.18)*(t>=27.035?1:0);
 const shake=(Math.sin((t-25.65)*120)*hit+Math.sin((t-27.035)*110)*land)*6;
 art=`<g transform="translate(${shake} ${shake*.35})">${P('M95 989Q610 995 1185 989',gray,3)}${art}</g>`;
 lastAudit={t,q,attached,grip,prop,gripError:attached?Math.hypot(grip[0]-prop[0],grip[1]-prop[1]):null,bones:[g.left,g.right,g.legL,g.legR]};
 return `<defs><clipPath id="proof-stage-v3"><rect x="70" y="350" width="1140" height="666"/></clipPath></defs><g clip-path="url(#proof-stage-v3)">${art}</g>`+tx.title('OLD PHOTOS.',118,117,318);
}
module.exports={draw,hero,photo,pose,geometry,world,inspected:()=>lastAudit};
