'use strict';
/** B5 portable artwork and relay primitives.
 * Approved phone/cup/hand/eye contours are transcribed without shape changes
 * from examples/b5-mei-event-relay/stage.cjs. Other drawings are new whole cels
 * in that drawing family. This module has no story timeline or presenter.
 * All assets: {svg,bounds:{x,y,width,height},anchors:{name:{x,y}}}.
 * Use fit(asset,rect) for safe uniform placement, place(asset,state) for SVG,
 * anchor(asset,state,name) / attach() for physical contact, and continueAt()
 * to start the next track from the actual preceding evaluated endpoint.
 */
const INK='#1E1C1A',PAPER='#EBE7E1',WHITE='#FBFAF8',RED='#D7372C',COFFEE='#986447',TAN='#C8B69C';
const NORMAL=Object.freeze({headRadius:60,headCenterY:-195,bodyTopY:-130,shoulderY:-115,hipY:0,arm:[86,84],leg:[80,80],bodyStroke:18,headStroke:11,eyeRadius:7,mouthStroke:7});
const n=x=>Math.round(x*10000)/10000;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,u)=>a+(b-a)*u;
const E={linear:x=>x,in:x=>x*x*x,out:x=>1-(1-x)**3,io:x=>x<.5?4*x*x*x:1-(-2*x+2)**3/2,back:x=>1+2.7*(x-1)**3+1.7*(x-1)**2};
const P=(d,w=8,fill='none',stroke=INK)=>`<path d="${d}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="${fill}"/>`;
const C=(x,y,r,fill=INK,w=0,stroke=INK)=>`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill}" stroke="${stroke}" stroke-width="${w}"/>`;
const G=(x,y,s,r,body,opacity=1)=>`<g opacity="${n(opacity)}" transform="translate(${n(x)} ${n(y)}) rotate(${n(r)}) scale(${n(s)})">${body}</g>`;
const L=(ps,w=18,color=INK)=>P(ps.map((p,i)=>`${i?'L':'M'}${n(p.x)} ${n(p.y)}`).join(' '),w,'none',color);
const pt=(x,y)=>({x,y});
function asset(svg,bounds,anchors={}){checkRect(bounds);return {svg,bounds,anchors};}
function checkRect(r){if(!r||!['x','y','width','height'].every(k=>Number.isFinite(r[k]))||r.width<=0||r.height<=0)throw Error('B5 rectangle must have finite x/y and positive width/height');}
function checkState(s={}){const a={x:0,y:0,scale:1,rotation:0,opacity:1,...s};if(!['x','y','scale','rotation','opacity'].every(k=>Number.isFinite(a[k]))||a.scale<=0||a.opacity<0||a.opacity>1)throw Error('B5 placement needs finite values, positive uniform scale and opacity 0..1');if('scaleX'in s||'scaleY'in s)throw Error('Use uniform scale; bounded whole-object squash is separate');return a;}
function point(p,state={}){const s=checkState(state),a=s.rotation*Math.PI/180;return {x:s.x+s.scale*(p.x*Math.cos(a)-p.y*Math.sin(a)),y:s.y+s.scale*(p.x*Math.sin(a)+p.y*Math.cos(a))};}
function boundsAt(d,state={}){const b=d.bounds,ps=[pt(b.x,b.y),pt(b.x+b.width,b.y),pt(b.x+b.width,b.y+b.height),pt(b.x,b.y+b.height)].map(p=>point(p,state));const xs=ps.map(p=>p.x),ys=ps.map(p=>p.y);return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};}
function contain(d,state,rect,padding=0){checkRect(rect);const b=boundsAt(d,state),eps=.00001;return b.x>=rect.x+padding-eps&&b.y>=rect.y+padding-eps&&b.x+b.width<=rect.x+rect.width-padding+eps&&b.y+b.height<=rect.y+rect.height-padding+eps;}
function fit(d,rect,{padding=18,rotation=0}={}){checkRect(rect);if(!Number.isFinite(padding)||padding<0||padding*2>=Math.min(rect.width,rect.height))throw Error('B5 fit padding consumes frame');const b=boundsAt(d,{rotation}),scale=Math.min((rect.width-2*padding)/b.width,(rect.height-2*padding)/b.height);const s={x:rect.x+rect.width/2-scale*(b.x+b.width/2),y:rect.y+rect.height/2-scale*(b.y+b.height/2),scale,rotation,opacity:1};if(!contain(d,s,rect,padding))throw Error('B5 asset does not fit');return s;}
function place(d,state={},safeRect){const s=checkState(state);if(safeRect&&!contain(d,s,safeRect))throw Error('B5 principal artwork would be clipped; re-fit rather than cutting head/contact');return G(s.x,s.y,s.scale,s.rotation,d.svg,s.opacity);}
function anchor(d,state,name){if(!d.anchors[name])throw Error(`Unknown B5 anchor: ${name}`);return point(d.anchors[name],state);}
function attach(d,localAnchor,target,{scale=1,rotation=0,opacity=1}={}){const p=anchor(d,{scale,rotation},localAnchor);return checkState({x:target.x-p.x,y:target.y-p.y,scale,rotation,opacity});}
function tweenState(from,to,u,ease='out'){const a=checkState(from),b=checkState(to);if(!E[ease])throw Error('Unknown B5 ease');const p=E[ease](clamp(u));return checkState(Object.fromEntries(['x','y','scale','rotation','opacity'].map(k=>[k,k==='opacity'?clamp(mix(a[k],b[k],p)):mix(a[k],b[k],p)])));}
function motion(keys){if(!Array.isArray(keys)||!keys.length)throw Error('B5 motion requires keyframes');const ks=keys.map(k=>({t:k.t,state:checkState(k.state),ease:k.ease||'linear'}));ks.forEach((k,i)=>{if(!Number.isFinite(k.t)||(i&&k.t<=ks[i-1].t)||!E[k.ease])throw Error('B5 keyframe times must increase');});return t=>{if(!Number.isFinite(t))throw Error('B5 motion time must be finite');if(t<=ks[0].t)return {...ks[0].state};for(let i=1;i<ks.length;i++)if(t<=ks[i].t)return tweenState(ks[i-1].state,ks[i].state,(t-ks[i-1].t)/(ks[i].t-ks[i-1].t),ks[i].ease);return {...ks.at(-1).state};};}
function continueAt(previous,t,keys){if(typeof previous!=='function'||!Array.isArray(keys)||!keys.length||keys[0].t<=t)throw Error('B5 continuation requires later destination keys');return motion([{t,state:previous(t)},...keys]);}
/** Graphic substitution intentionally carries attention, not physical identity.
 * Both illustrations retain their own proportions. Return independent states;
 * place the outgoing before the incoming. No body/animal joint interpolation. */
function graphicHandoff(from,to,u,{direction=1,distance=160}={}){const p=clamp(u),a=checkState(from),b=checkState(to);return {outgoing:{...a,x:a.x-direction*distance*E.in(p),opacity:a.opacity*(1-p)},incoming:{...b,x:b.x+direction*distance*(1-E.out(p)),opacity:b.opacity*p}};}
/** Whole cartoon cel squash only: finite pulse, zero deformation at u=0 and 1.
 * Keep pivot at the floor/contact. Do not apply to figure joints. */
function squash(svg,u,{amount=.12,pivot={x:0,y:0}}={}){if(!Number.isFinite(u)||!Number.isFinite(amount)||amount<0||amount>.18)throw Error('B5 squash amount must be 0..0.18');const p=Math.sin(Math.PI*clamp(u)),sx=1+amount*p,sy=1-amount*p;return `<g transform="translate(${n(pivot.x)} ${n(pivot.y)}) scale(${n(sx)} ${n(sy)}) translate(${n(-pivot.x)} ${n(-pivot.y)})">${svg}</g>`;}
// Exact approved silhouette functions (only wrapping metadata is new).
function phoneSVG(lit=true){return P('M-92-174Q-105-174-105-159V159Q-105 174-90 174H90Q105 174 105 158V-158Q105-174 90-174Z',12,INK)+P('M-85-139H85V132H-85Z',0,lit?RED:'#C8C2B8')+P('M-27-157H28',6,'none','#8B857D')+C(0,154,7,PAPER)+(lit?P('M-45-29Q-45-73 0-73Q45-73 45-29V10L62 32H-62L-45 10Z',7,WHITE)+C(0,49,10,WHITE)+P('M-8-87V-103M-64-65L-76-76M64-65L77-77',6,'none',WHITE):'');}
function cupSVG(a=0,filled=true){return G(0,0,1,a,P('M-74-78L-60 47Q-54 71 0 73Q53 72 60 47L74-78Z',9,WHITE)+P('M72-58Q136-73 132-17Q126 27 66 23',11,WHITE)+`<ellipse cx="0" cy="-78" rx="74" ry="21" fill="${filled?COFFEE:WHITE}" stroke="${INK}" stroke-width="8"/>`+(filled?P('M-37-84Q-1-96 39-84',4,'none','#CDA17C'):''));}
function handSVG(short=false){return P(`M${short?-160:-360} 41L-104 41Q-82 45-51 66L-16 82Q12 95 23 78Q30 66 7 51L-13 39L105 39Q128 40 131 24Q132 8 111 7L16 7L139 0Q160-1 159-17Q157-32 136-29L13-21L124-43Q144-47 139-62Q133-76 111-69L-5-47L78-78Q98-85 91-101Q83-114 61-103L-53-56Q-95-39-115-37L${short?-160:-360}-42Z`,8,WHITE);}
function eyesSVG(look=0){return P('M-165 0Q-86-100-12 0Q-84 89-165 0Z',9,WHITE)+P('M10 0Q88-100 167 0Q88 89 10 0Z',9,WHITE)+C(-86+look*24,-3,26)+C(88+look*24,-3,26)+C(-95+look*24,-12,7,WHITE)+C(79+look*24,-12,7,WHITE);}
const drawings={
 phone:(lit=true)=>asset(phoneSVG(lit),{x:-112,y:-181,width:224,height:362},{center:pt(0,0),bottom:pt(0,180)}),
 cup:(filled=true)=>asset(cupSVG(0,filled),{x:-80,y:-104,width:219,height:184},{base:pt(0,77),rim:pt(0,-78),contact:pt(-78,0)}),
 hand:(short=false)=>asset(handSVG(short),{x:short?-165:-365,y:-118,width:short?330:530,height:218},{finger:pt(159,-17),wrist:pt(-110,0)}),
 eyes:(look=0)=>asset(eyesSVG(clamp(look,-1,1)),{x:-171,y:-57,width:344,height:110},{center:pt(0,0),gaze:pt(88+clamp(look,-1,1)*24,-3)})
};
function FK(p,A,B,a,b){a*=Math.PI/180;b*=Math.PI/180;const m=pt(p.x+Math.cos(a)*A,p.y+Math.sin(a)*A);return[p,m,pt(m.x+Math.cos(b)*B,m.y+Math.sin(b)*B)];}
function book(){return asset(P('M-67-45Q-23-59 0-37Q28-58 72-45V43Q29 29 0 50Q-27 30-67 43Z',6,RED)+P('M0-37V50',4,'none',WHITE)+P('M-51-22L-15-24M16-24L54-22M-51-4L-15-6M16-6L54-4',3,'none',WHITE),{x:-72,y:-61,width:150,height:116},{center:pt(0,0)});}
/** Fixed whole poses, never independently stretching torso, head or bones. */
function figure({pose='stand',look=0,expression='smile'}={}){
 if(!['stand','seat','read'].includes(pose))throw Error('Unknown B5 figure pose');
 const seated=pose!=='stand',hip=pt(0,0),sh=pt(0,-115);
 const legs=seated?[FK(hip,80,80,0,90),FK(pt(-8,0),80,80,13,90)]:[FK(hip,80,80,112,88),FK(hip,80,80,68,92)];
 const arms=pose==='read'?[FK(sh,86,84,48,-57),FK(sh,86,84,147,-20)]:seated?[FK(sh,86,84,40,18),FK(sh,86,84,144,46)]:[FK(sh,86,84,135,92),FK(sh,86,84,45,88)];
 let s=legs.map(l=>L(l)).join('')+L([hip,pt(0,-130)])+arms.map(l=>L(l)).join('');
 if(pose==='read')s+=G(94,-95,.75,-7,book().svg);
 const gaze=clamp(look,-1,1)*12;
 s+=C(0,-195,60,WHITE,11)+C(-22+gaze,-200,7)+C(22+gaze,-200,7)+(expression==='surprise'?C(0,-168,10,WHITE,5):P('M-21-175Q0-156 21-175',7));
 return asset(s,{x:-139,y:-262,width:300,height:seated?362:435},{hip,shoulder:sh,head:pt(0,-195),lap:pt(36,-9),wrist:arms[0][2],foot:legs[0][2],otherFoot:legs[1][2]});
}
/** Compact cartoon dog, head/body/feet share one drawn cel.
 * `tail` and `blink` are optional secondary expressions, never limb rigs.
 * Every state retains the brown ear/patch, muzzle, nose and two readable paws. */
function dog({pose='ready',tail=0,blink=false}={}){
 if(!['ready','air','land','rest'].includes(pose))throw Error('Unknown B5 dog pose');
 const rest=pose==='rest',air=pose==='air';let s='';
 // Back tail is joined under the body silhouette; no floating extremity.
 s+=P(`M-119-64Q${-185-Math.sin(tail)*10} ${-154+Math.cos(tail)*9} -171-121Q-165-80-121-89`,12,WHITE);
 if(rest){
  s+=P('M-133-27Q-145-88-103-110Q-52-137 4-108Q38-103 64-75L134-65Q170-67 174-38Q171-8 133-8H-110Q-134-8-133-27Z',8,WHITE);
  s+=P('M-117-88Q-77-119-41-111L-44-51Q-85-59-121-44Z',0,TAN);
  // Connected lowered head/muzzle rests directly on front paws.
  s+=P('M45-72Q34-129 79-146Q120-159 140-111Q143-94 155-84Q189-81 189-57Q186-32 151-35L106-32Q61-31 45-72Z',8,WHITE);
  s+=P('M54-116Q25-136 33-79Q46-48 67-64L81-116Z',7,TAN)+C(179,-65,11)+P('M108-91Q121-80 136-91',5)+P('M137-48Q151-40 160-48',4);
  s+=P('M49-20Q65-34 93-22L142-22Q164-20 158-8H51Z',7,WHITE)+P('M103-20V-9M120-20V-9M136-20V-9',3);
 }else{
  s+=P('M-134-51Q-153-121-100-147Q-45-169 13-144L54-136Q80-111 73-68L105-32Q111-8 91-8H68Q49-8 48-29L40-53L-42-49L-55-18Q-61-5-86-8H-107Q-125-11-116-29L-98-62Z',8,WHITE);
  s+=P('M-125-126Q-89-154-54-148L-58-87Q-100-97-137-70Z',0,TAN);
  // Full joined head: cheek overlaps closed body at neck, not detached circle.
  s+=P('M34-130Q17-165 47-193Q79-225 119-198Q146-177 143-150L163-140Q194-143 196-117Q197-94 169-89L114-86Q64-88 44-115Z',8,WHITE);
  s+=P('M54-190Q17-213 16-159Q18-116 48-126L78-177Z',7,TAN);
  s+=C(185,-122,11)+(blink?P('M111-163Q123-153 134-164',5):C(123,-166,7)+C(125,-169,2,WHITE))+P('M145-108Q155-97 169-108',5);
  if(air){s+=P('M-91-26L-118-7Q-129 5-104 10L-59 5M64-22L95 4Q113 16 126 5L116-11',8,WHITE);}
  else{s+=P('M-109-12H-72M70-12H97',7)+P('M-99-24V-12M-85-24V-12M79-24V-12M90-24V-12',3);}
 }
 return asset(s,{x:-202,y:rest?-166:-231,width:411,height:rest?169:252},{ground:pt(0,air?10:-8),frontPaw:pt(rest?120:85,rest?-8:-8),backPaw:pt(-85,-8),nose:pt(rest?184:190,rest?-65:-122),chin:pt(rest?140:150,rest?-31:-86)});
}
function lapPose({dogPose='land',look=1,expression='smile',book:withBook=false,tail=0}={}){
 const person=figure({pose:withBook?'read':'seat',look,expression});
 const puppy=dog({pose:dogPose,tail}),support=pt(35,-10),ds=attach(puppy,'ground',support,{scale:.43});
 const s=person.svg+place(puppy,ds);
 return asset(s,{x:-139,y:-262,width:300,height:362},{...person.anchors,lap:support,dogSupport:anchor(puppy,ds,'ground'),dogNose:anchor(puppy,ds,'nose')});
}
/** Independent comic close-up: complete forearm/palm and one connected paw.
 * The point of contact is built once. It is not a disembodied stick elbow. */
function pawContact({book:withBook=false}={}){
 const wrist=pt(46,0),paw=pt(46,0);
 let s=P('M-276-26L-76-26Q-24-35 9-25L60-14L131-30Q155-33 160-20Q164-4 146 0L99 10L151 12Q172 14 168 29Q165 42 144 40L66 36Q17 42-17 30L-276 30Z',8,WHITE);
 if(withBook)s+=G(-165,-83,.75,-8,book().svg);
 s+=P('M9-175Q43-196 79-174L84-58L99-24Q103-9 89-2Q76 9 61 2Q44 13 31 1Q9 11 0-7Q-8-20 3-37L15-67Z',8,WHITE)+P('M10-163Q40-182 73-165L74-106L14-103Z',0,TAN)+P('M25-27L23-7M48-28L47-3M71-27L72-6',4);
 return asset(s,{x:-282,y:-199,width:458,height:248},{wrist,paw,contact:wrist});
}
module.exports={INK,PAPER,WHITE,RED,COFFEE,TAN,NORMAL,drawings,figure,dog,lapPose,pawContact,book,asset,place,fit,contain,boundsAt,point,anchor,attach,tweenState,motion,continueAt,graphicHandoff,squash,P,C,G,L,clamp,mix,E};
