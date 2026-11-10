/* Local limb-continuity repair, not a new film or an identity redraw.
 * Planted world-space feet -> normal fixed-length IK legs.
 * Airborne pelvis is derived from a continuous chest/COG arc, not snapped
 * between independently authored ground and flight roots.
 */
const TAKEOFF=26.16, LAND=26.96, GROUND=984;
const clamp=x=>Math.max(0,Math.min(1,x)),rad=a=>a*Math.PI/180,deg=a=>a*180/Math.PI;
const mix=(a,b,u)=>a+(b-a)*u;
const smoother=u=>{u=clamp(u);return u*u*u*(u*(u*6-15)+10)};
function curve(t,keys){
 if(t<=keys[0][0])return keys[0][1];if(t>=keys.at(-1)[0])return keys.at(-1)[1];
 const n=keys.length,h=[],d=[],m=Array(n).fill(0);
 for(let i=0;i<n-1;i++){h[i]=keys[i+1][0]-keys[i][0];d[i]=(keys[i+1][1]-keys[i][1])/h[i]}
 for(let i=1;i<n-1;i++)if(d[i-1]*d[i]>0){const w1=2*h[i]+h[i-1],w2=h[i]+2*h[i-1];m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i])}
 let i=0;while(t>keys[i+1][0])i++;const u=(t-keys[i][0])/h[i];
 return (2*u**3-3*u*u+1)*keys[i][1]+(u**3-2*u*u+u)*h[i]*m[i]+(-2*u**3+3*u*u)*keys[i+1][1]+(u**3-u*u)*h[i]*m[i+1];
}
function local(q,p){const x=p[0]-q.x,y=p[1]-q.y,c=Math.cos(rad(q.r)),s=Math.sin(rad(q.r));return[(x*c+y*s)/(q.s*q.sx),(-x*s+y*c)/(q.s*q.sy)]}
function ik(target,branch){
 const [x,y]=target,d=Math.hypot(x,y);
 if(d>159.95||d<2)throw Error(`Unreachable leg target ${d}`);
 const a=Math.atan2(y,x)+branch*Math.acos(d/160),k=[80*Math.cos(a),80*Math.sin(a)];
 return[deg(a),deg(Math.atan2(y-k[1],x-k[0]))];
}
function groundRoot(t){return{
 x:curve(t,[[24.9,350],[25.30,350],[25.86,335],[26.0,337],[TAKEOFF,345]]),
 y:curve(t,[[24.9,840],[25.30,840],[25.9,857],[26.02,868],[TAKEOFF,840]]),
 r:curve(t,[[24.9,0],[25.30,0],[25.90,-9],[26.02,-12],[TAKEOFF,-10]])
}}
function spinPhase(u){const a=.12,b=.16,total=1-(a+b)/2;return (u<a?u*u/(2*a):u>1-b?total-(1-u)**2/(2*b):u-a/2)/total}
function pose(t){
 const q={...groundRoot(Math.min(t,TAKEOFF)),s:1,sx:1,sy:1,deformation:'none'};
 const start=groundRoot(TAKEOFF),feet0=[[300,GROUND],[405,GROUND]],feet1=[[415,GROUND],[525,GROUND]];
 let localFeet;
 if(t<TAKEOFF){q.phase='planted_load';q.supports=feet0;localFeet=feet0.map(p=>local(q,p))}
 else if(t<LAND){
  const u=(t-TAKEOFF)/(LAND-TAKEOFF),r=mix(start.r,-360,spinPhase(u));
  const cx0=start.x+90*Math.sin(rad(start.r)),cy0=start.y-90*Math.cos(rad(start.r));
  const center=[mix(cx0,470,u),mix(cy0,750,u)-145*4*u*(1-u)];
  q.x=center[0]-90*Math.sin(rad(r));q.y=center[1]+90*Math.cos(rad(r));q.r=r;q.phase='airborne';q.supports=[];
  const begin=feet0.map(p=>local({...start,s:1,sx:1,sy:1},p)),end=[[-55,144],[55,144]];
  const tucked=[[-30,100],[30,100]];
  localFeet=begin.map((p,i)=>{const a=smoother((t-TAKEOFF-i*.025)/.19),b=smoother((t-26.56-i*.018)/(.40-i*.018));return p.map((v,k)=>mix(mix(v,tucked[i][k],a),end[i][k],b))});
 }else{
  q.x=470;q.y=curve(t,[[LAND,840],[27.055,879],[27.24,836],[27.43,845],[27.66,840],[28.8,840]]);
  q.r=curve(t,[[LAND,-360],[27.07,-363],[27.27,-357],[27.50,-361],[27.74,-360],[28.8,-360]]);
  q.phase=t<27.66?'planted_landing_recovery':'planted_settle';q.supports=feet1;localFeet=feet1.map(p=>local(q,p));
 }
 [q.ll,q.lk]=ik(localFeet[0],1);[q.rl,q.rk]=ik(localFeet[1],-1);
 // Upper and lower segments follow the same action, with a 1–2 frame lag.
 // Elbow side stays positive on the left and negative on the right; neither
 // arm flips through a locked straight elbow during the spin.
 q.la=curve(t,[[24.9,110],[25.3,110],[25.95,140],[TAKEOFF,145],[26.38,205],[26.65,205],[26.93,165],[27.13,157],[27.5,115],[27.8,110],[28.8,110]]);
 q.lb=curve(t,[[24.9,140],[25.34,140],[26.0,175],[TAKEOFF,180],[26.42,245],[26.69,245],[LAND,200],[27.17,195],[27.56,145],[27.86,140],[28.8,140]]);
 q.ra=curve(t,[[24.9,16],[25.3,16],[25.93,24],[TAKEOFF,20],[26.39,-25],[26.64,-25],[26.94,15],[27.11,22],[27.54,70],[27.82,70],[28.8,70]]);
 q.rb=curve(t,[[24.9,-30],[25.34,-30],[25.97,-20],[TAKEOFF,-25],[26.44,-60],[26.69,-60],[LAND,-20],[27.16,-15],[27.61,40],[27.88,40],[28.8,40]]);
 q.mood=t<25.4?'flat':t<TAKEOFF?'grit':t<LAND?'shock':t<27.25?'grit':'sad';
 q.localFeet=localFeet;
 return q;
}
module.exports={pose,curve,TAKEOFF,LAND,GROUND};
