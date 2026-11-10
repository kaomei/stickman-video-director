/* Anonymous physical-comedy actor. Identity never comes from the presenter. */
const ink='#1E1C1A',red='#D7372C',gray='#858079';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,u)=>a+(b-a)*u;
const smooth=(t,a,b)=>{let q=clamp((t-a)/(b-a));return q*q*(3-2*q)};
const out=q=>1-(1-clamp(q))**3;
const pulse=(t,c,w)=>Math.exp(-Math.pow((t-c)/w,2));
const P=(d,c=ink,w=8,attrs='')=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${attrs}/>`;
const G=(x,y,s,r,art)=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${art}</g>`;
const C=(x,y,r,c=ink)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
let audit=[];
function bone(start,end,l1,l2,side){
 const [dx,dy]=[end[0]-start[0],end[1]-start[1]],d=Math.hypot(dx,dy);
 if(d>l1+l2-.01||d<Math.abs(l1-l2)+.01)throw Error(`Unreachable limb ${d}: ${JSON.stringify({start,end})}`);
 let a=Math.atan2(dy,dx),b=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));
 return [start,[start[0]+l1*Math.cos(a+side*b),start[1]+l1*Math.sin(a+side*b)],end];
}
const poly=pts=>P(pts.map((p,i)=>(i?'L':'M')+p.join(' ')).join(''),ink,14);
function actor(t,p={}){
 const q=pose(p);
 const hip=[q.lean*.4,(q.repair?-167:-148)+q.crouch*(q.repair?30:36)],shoulder=[q.lean,-260+q.crouch*40],head=[q.lean,-338+q.crouch*44];
 // Handshake elbow hangs below the wrist, never behind the cheek.
 const arms=[bone([shoulder[0]-8,shoulder[1]],q.left,86,84,1),bone([shoulder[0]+8,shoulder[1]],q.right,86,84,q.repair?1:-1)];
 const legs=[bone(hip,q.footL,85,90,1),bone(hip,q.footR,85,90,-1)];
 audit.push({t,arms,legs,x:q.x,y:q.y,s:q.s,r:q.r,sx:q.sx,sy:q.sy,repair:!!q.repair,deformation:q.deformation,worldHands:[world(q,q.left),world(q,q.right)],worldHead:world(q,head),worldFeet:[world(q,q.footL),world(q,q.footR)]});
 let art=poly(legs[0])+poly(legs[1])+P(`M${hip}L${shoulder}L${head[0]} ${head[1]+58}`,ink,15)+poly(arms[0])+poly(arms[1]);
 const [hx,hy]=head,blink=pulse(t%3.3,2.75,.055),ey=7*(1-.88*blink);
 let face=`<circle cx="${hx}" cy="${hy}" r="59" fill="#FBFAF8" stroke="${ink}" stroke-width="10"/>`;
 if(q.mood==='grit')face+=P(`M${hx-31} ${hy-13}l18 8l-18 8M${hx+31} ${hy-13}l-18 8l18 8`,ink,6);
 else face+=`<ellipse cx="${hx-20}" cy="${hy-7}" rx="6" ry="${ey}" fill="${ink}"/><ellipse cx="${hx+20}" cy="${hy-7}" rx="6" ry="${ey}" fill="${ink}"/>`;
 if(q.mood==='shock')face+=`<ellipse cx="${hx}" cy="${hy+24}" rx="13" ry="18" fill="${ink}"/>`;
 else if(q.mood==='grit')face+=`<rect x="${hx-23}" y="${hy+13}" width="46" height="24" fill="#FBFAF8" stroke="${ink}" stroke-width="4"/>`+P(`M${hx-20} ${hy+25}h40`,ink,2);
 else face+=P(`M${hx-23} ${hy+22}Q${hx} ${hy+(q.mood==='flat'?22:q.mood==='sad'?2:46)} ${hx+23} ${hy+22}`,ink,6);
 art+=G(hx,hy,1,q.head,G(-hx,-hy,1,0,face));
 art+=C(...q.left,6.5)+C(...q.right,6.5);
 // Named whole-body comic deformation includes the face and head. No inverse head scale.
 return `<g transform="translate(${q.x} ${q.y-q.lift}) rotate(${q.r}) scale(${q.s*q.sx} ${q.s*q.sy})">${art}</g>`;
}
function pose(p={}){return {x:380,y:982,s:1.02,sx:1,sy:1,r:0,crouch:0,lean:0,head:0,left:[-70,-145],right:[75,-150],footL:[-55,0],footR:[56,0],mood:'happy',lift:0,deformation:'none',...p}}
function world(p,xy){const q=pose(p),a=q.r*Math.PI/180,x=xy[0]*q.s*q.sx,y=xy[1]*q.s*q.sy;return [q.x+x*Math.cos(a)-y*Math.sin(a),q.y-q.lift+x*Math.sin(a)+y*Math.cos(a)]}
function burst(x,y,t,at,s=1){let u=clamp((t-at)/.25);if(t<at||u===1)return '';let art='';for(let i=0;i<7;i++){let a=(i*51-110)*Math.PI/180,r=38+out(u)*75;art+=P(`M${Math.cos(a)*r} ${Math.sin(a)*r}l${Math.cos(a)*30} ${Math.sin(a)*30}`,i%3?ink:red,5)}return `<g opacity="${1-u}">${G(x,y,s,0,art)}</g>`}
function reset(){audit=[]}function inspected(){return audit}
module.exports={ink,red,gray,clamp,mix,smooth,out,pulse,P,G,C,actor,burst,reset,inspected,pose,world};
