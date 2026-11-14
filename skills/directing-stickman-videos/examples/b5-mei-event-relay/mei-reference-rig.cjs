'use strict';
// Neutral dimensions transcribed from CrazyMei 16x9 hook.html / mistake-1.html.
// Uniform actor scale belongs to the calling composition; do not resize bones alone.
const NORMAL=Object.freeze({headRadius:60,headCenterY:-195,bodyTopY:-130,shoulderY:-115,hipY:0,arm:[86,84],leg:[80,80],bodyStroke:18,headStroke:11,eyeRadius:7,mouthStroke:7});
const pt=(x,y)=>({x,y});
function rotate(p,o,degrees){const a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a),x=p.x-o.x,y=p.y-o.y;return pt(o.x+c*x-s*y,o.y+s*x+c*y);}
function normalFrame(hip,lean=0,scale=1,headCounter=0){const world=p=>rotate(pt(hip.x+scale*p.x,hip.y+scale*p.y),hip,lean);const headLocal=rotate(pt(0,NORMAL.headCenterY),pt(0,-135),headCounter);return {hip,lean,scale,shoulder:world(pt(0,NORMAL.shoulderY)),neck:world(pt(0,NORMAL.bodyTopY)),head:world(headLocal),headAngle:lean+headCounter,world};}
function ik(a,b,A,B,side=1){let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>A+B+.001||d<Math.abs(A-B)-.001||!d)throw Error(`normal rig target unreachable: ${d}, permitted ${Math.abs(A-B)}..${A+B}`);let q=(A*A-B*B+d*d)/(2*d),h=Math.sqrt(Math.max(0,A*A-q*q)),u=dx/d,v=dy/d;return [a,pt(a.x+q*u-h*v*side,a.y+q*v+h*u*side),b];}
module.exports={NORMAL,normalFrame,ik,rotate};
