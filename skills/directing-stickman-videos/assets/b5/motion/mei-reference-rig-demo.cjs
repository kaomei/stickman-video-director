'use strict';
// node mei-reference-rig-demo.cjs > comparison.svg
// Ordinary geometry from the bundled CrazyMei hook rig, with hip shifted to (0,0).
// The source-angle pose is exact; the two task poses show how to repose this model.
// They are examples, not mandatory joint angles or a finished scene.
const {NORMAL:N,normalFrame,ik}=require('./mei-reference-rig.cjs');
const ink='#1E1C1A',white='#FBFAF8';
const p=(x,y)=>({x,y});
const add=(a,b)=>p(a.x+b.x,a.y+b.y);
function limb(start,a,b,l1,l2){
  const v=(d,l)=>p(Math.cos(d*Math.PI/180)*l,Math.sin(d*Math.PI/180)*l);
  const j=add(start,v(a,l1));return [start,j,add(j,v(b,l2))];
}
function poses(){
  const f=normalFrame(p(0,0));
  const neutral={...f,
    arms:[limb(f.shoulder,145,95,...N.arm),limb(f.shoulder,35,85,...N.arm)],
    legs:[limb(f.hip,115,95,...N.leg),limb(f.hip,65,85,...N.leg)]};
  const seated={...f,
    arms:[limb(f.shoulder,108,12,...N.arm),limb(f.shoulder,50,-25,...N.arm)],
    legs:[limb(f.hip,150,75,...N.leg),limb(f.hip,25,80,...N.leg)]};
  const g=normalFrame(p(0,0),18,1,-10);
  const reach={...g,
    arms:[ik(g.shoulder,p(-40,4),...N.arm,1),ik(g.shoulder,p(156,-115),...N.arm,1)],
    legs:seated.legs};
  return [neutral,seated,reach];
}
const num=n=>Number(n.toFixed(3));
function draw(q){
  const path=(d,w=N.bodyStroke)=>`<path d="${d}" fill="none" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const poly=ps=>path(ps.map((v,i)=>`${i?'L':'M'}${num(v.x)} ${num(v.y)}`).join(' '));
  const body=[q.hip,q.neck];
  return [...q.legs,...q.arms,body].map(poly).join('')+
    `<g transform="translate(${num(q.head.x)} ${num(q.head.y)}) rotate(${q.headAngle})">
    <circle r="${N.headRadius}" fill="${white}" stroke="${ink}" stroke-width="${N.headStroke}"/>
    <circle cx="-22" cy="-5" r="${N.eyeRadius}" fill="${ink}"/><circle cx="22" cy="-5" r="${N.eyeRadius}" fill="${ink}"/>
    ${path('M-23 19Q0 49 23 19',N.mouthStroke)}</g>`;
}
function svg(){
  const labels=['SOURCE ANGLES','SEATED EXAMPLE','REACH EXAMPLE'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1260" height="590" viewBox="0 0 1260 590">
  <rect width="1260" height="590" fill="#EBE7E1"/>
  <text x="24" y="33" font-family="sans-serif" font-size="20" fill="${ink}">Same head, trunk, limbs and strokes; change pose and staging.</text>
  ${poses().map((q,i)=>`<g transform="translate(${175+420*i} 365)">${draw(q)}</g><text x="${30+420*i}" y="555" font-family="sans-serif" font-size="18" fill="${ink}">${labels[i]}</text>`).join('')}
  </svg>`;
}
if(require.main===module)process.stdout.write(svg());
module.exports={poses,draw,svg};
