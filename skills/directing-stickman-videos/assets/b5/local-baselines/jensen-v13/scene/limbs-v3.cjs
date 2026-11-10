/* Acting study: authored extremes, unequal timing and overlapping body parts.
 * Local bones stay fixed. Named whole-body pressure/landing deformations are
 * deliberate; the right-hand presenter never enters this coordinate space. */
const {curve}=require('./limbs-v2.cjs');
const TAKEOFF=26.16,LAND=26.96,GROUND=984;
const rad=a=>a*Math.PI/180,deg=a=>a*180/Math.PI;
const mix=(a,b,u)=>a+(b-a)*u,clamp=u=>Math.max(0,Math.min(1,u));
const smooth=u=>{u=clamp(u);return u*u*(3-2*u)};
const C=(t,ks)=>curve(t,ks);
function local(q,p){const x=p[0]-q.x,y=p[1]-q.y,c=Math.cos(rad(q.r)),s=Math.sin(rad(q.r));return[(x*c+y*s)/q.sx,(-x*s+y*c)/q.sy]}
function ik([x,y],branch){const d=Math.hypot(x,y);if(d>159.99||d<2)throw Error('Unreachable leg '+d);const a=Math.atan2(y,x)+branch*Math.acos(d/160),k=[80*Math.cos(a),80*Math.sin(a)];return[deg(a),deg(Math.atan2(y-k[1],x-k[0]))]}
function spin(u){ // A readable open pose, fast middle, then open for landing.
 return C(u,[[0,0],[.13,18],[.32,103],[.65,303],[.86,348],[1,360]]);
}
function shape(t){
 const sx=C(t,[[24.9,1],[25.54,1],[25.74,1.13],[26.015,1.33],[26.07,1.33],[TAKEOFF,.88],[26.28,1],[26.76,1],[LAND,1],[27.035,1.48],[27.09,1.48],[27.25,.90],[27.43,1.09],[27.64,1],[28.8,1]]);
 const sy=C(t,[[24.9,1],[25.54,1],[25.74,.84],[26.015,.54],[26.07,.54],[TAKEOFF,1.12],[26.28,1],[26.76,1],[LAND,1],[27.035,.52],[27.09,.52],[27.25,1.10],[27.43,.94],[27.64,1],[28.8,1]]);
 return {sx,sy};
}
function pose(t){
 const q={...shape(t),s:1,r:0};
 q.phase=t<25.46?'read_and_double_take':t<TAKEOFF?'pressure_and_coil':t<LAND?'elastic_release':t<27.2?'landing_squash':t<27.7?'rebound_and_catch_balance':'weary_settle';
 q.deformation=Math.abs(q.sx-1)+Math.abs(q.sy-1)>.02?'bounded_pressure_or_landing':'none';
 q.bend=C(t,[[24.9,0],[25.20,17],[25.42,4],[25.58,-16],[25.76,-38],[26.02,-48],[26.07,-48],[TAKEOFF,10],[26.30,34],[26.48,-24],[26.72,-20],[LAND,-12],[27.04,-32],[27.15,-20],[27.29,20],[27.46,-10],[27.69,-12],[28.35,-17],[28.8,-17]]);
 q.h=C(t,[[24.9,118],[25.4,118],[26.02,91],[26.07,91],[TAKEOFF,133],[26.38,103],[26.7,118],[LAND,118],[27.04,99],[27.25,131],[27.5,115],[27.74,118],[28.8,118]]);
 q.head=C(t,[[24.9,-9],[25.2,8],[25.39,8],[25.52,-20],[25.67,-20],[25.82,13],[26.02,22],[26.10,22],[26.26,-18],[26.48,17],[26.70,6],[26.91,-16],[27.06,18],[27.2,18],[27.36,-12],[27.57,6],[27.78,12],[28.8,12]]);
 q.neckLag=C(t,[[24.9,0],[25.5,0],[25.76,17],[26.05,23],[26.24,-25],[26.47,17],[26.75,-12],[LAND,-4],[27.08,22],[27.29,-17],[27.53,7],[27.76,0],[28.8,0]]);
 q.shoulder=[q.bend,-q.h];q.neck=[q.bend*.95,-q.h-19];
 q.headCenter=[q.neck[0]+q.neckLag+57*Math.sin(rad(q.head)),q.neck[1]-57*Math.cos(rad(q.head))];
 const feet0=[[300,GROUND],[405,GROUND]],feet1=[[415,GROUND],[525,GROUND]];
 let feet;
 if(t<TAKEOFF){
  q.x=C(t,[[24.9,350],[25.2,359],[25.43,350],[25.74,335],[26.02,334],[26.07,334],[TAKEOFF,345]]);
  const legH=C(t,[[24.9,144],[25.43,144],[25.8,130],[26.02,118],[26.07,118],[TAKEOFF,143]]);
  q.y=GROUND-legH*q.sy;q.supports=feet0;feet=feet0.map(p=>local(q,p));
 }else if(t<LAND){
  const u=(t-TAKEOFF)/(LAND-TAKEOFF),start={x:345,y:GROUND-143*1.12,r:0,sx:.88,sy:1.12};
  q.r=-spin(u);const cx=mix(345,470,u),cy=mix(start.y-90*start.sy,750,u)-144*4*u*(1-u);
  q.x=cx-90*q.sy*Math.sin(rad(q.r));q.y=cy+90*q.sy*Math.cos(rad(q.r));q.supports=[];
  const begin=feet0.map(p=>local(start,p)),tuck=[[-28,82],[47,88]],end=[[-55,144],[55,144]];
  feet=begin.map((p,i)=>p.map((v,k)=>mix(mix(v,tuck[i][k],smooth((t-TAKEOFF-i*.035)/.19)),end[i][k],smooth((t-26.64-i*.025)/(.32-i*.025)))));
 }else{
  q.r=-360;q.x=C(t,[[LAND,470],[27.08,479],[27.29,466],[27.48,474],[27.74,470],[28.8,470]]);
  const legH=C(t,[[LAND,144],[27.035,117],[27.09,117],[27.25,145],[27.43,136],[27.66,144],[28.8,144]]);
  q.y=GROUND-legH*q.sy;q.supports=feet1;feet=feet1.map(p=>local(q,p));
 }
 [q.ll,q.lk]=ik(feet[0],1);[q.rl,q.rk]=ik(feet[1],-1);
 // Hand-side shoulders lead; wrists and the head catch up later. Avoid two
 // synchronous mirror-image windmills or a single frozen mid-air silhouette.
 q.la=C(t,[[24.9,112],[25.22,105],[25.43,105],[25.70,146],[26.02,167],[26.10,167],[26.24,220],[26.44,202],[26.63,163],[26.88,157],[27.06,183],[27.27,132],[27.48,115],[27.76,104],[28.8,104]]);
 q.lb=C(t,[[24.9,144],[25.26,140],[25.49,140],[25.76,194],[26.065,221],[26.14,221],[26.29,254],[26.49,247],[26.68,210],[26.93,201],[27.10,236],[27.33,177],[27.54,145],[27.84,128],[28.8,128]]);
 q.ra=C(t,[[24.9,8],[25.2,-6],[25.43,0],[25.74,32],[26.02,49],[26.10,49],[26.23,-33],[26.39,-62],[26.64,-22],[26.88,13],[27.08,-12],[27.29,56],[27.5,71],[27.77,75],[28.8,75]]);
 q.rb=C(t,[[24.9,-34],[25.25,-51],[25.48,-45],[25.80,-21],[26.065,-7],[26.14,-7],[26.28,-84],[26.44,-112],[26.69,-64],[26.93,-30],[27.13,-61],[27.35,12],[27.56,35],[27.83,42],[28.8,42]]);
 q.mood=t<25.42?'curious':t<25.69?'shock':t<TAKEOFF?'grit':t<LAND?'shock':t<27.2?'grit':'sad';
 q.localFeet=feet;return q;
}
module.exports={pose,curve,TAKEOFF,LAND,GROUND};
