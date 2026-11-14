'use strict';
// V5 new drawing and continuous comic premise, authored from v5-director-plan.md.
const INK='#1E1C1A',WHITE='#FBFAF8',PAPER='#EBE7E1',RED='#D7372C',TAN='#C8B69C',GRAY='#A29A90';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,u)=>a+(b-a)*u;
const pt=(x,y)=>({x,y}),pm=(a,b,u)=>pt(mix(a.x,b.x,u),mix(a.y,b.y,u));
const n=x=>Math.round(x*100)/100,xy=p=>`${n(p.x)} ${n(p.y)}`;
const ease={linear:u=>u,in:u=>u*u*u,out:u=>1-(1-u)**3,io:u=>u<.5?4*u*u*u:1-(-2*u+2)**3/2,back:u=>1+3.2*(u-1)**3+2.2*(u-1)**2};
function tr(t,keys){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){let[a,x]=keys[i-1],[b,y,e='linear']=keys[i];if(t<=b)return mix(x,y,ease[e](clamp((t-a)/(b-a))));}return keys.at(-1)[1];}
const ramp=(t,a,b,e='out')=>ease[e](clamp((t-a)/(b-a)));
const path=(d,w=6,fill='none',color=INK)=>`<path d="${d}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="${fill}"/>`;
const circle=(x,y,r,fill=INK,sw=0)=>`<circle cx="${n(x)}" cy="${n(y)}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${sw}"/>`;
const line=(a,w=14,color=INK)=>path(a.map((p,i)=>`${i?'L':'M'} ${xy(p)}`).join(' '),w,'none',color);
function rot(p,o,degrees){let a=degrees*Math.PI/180,c=Math.cos(a),s=Math.sin(a),x=p.x-o.x,y=p.y-o.y;return pt(o.x+c*x-s*y,o.y+s*x+c*y);}
function ik(a,b,L1,L2,side=-1){let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>L1+L2+.01||d<Math.abs(L1-L2)-.01)throw Error(`unreachable ${n(d)} at ${xy(a)} to ${xy(b)}`);let k=(L1*L1-L2*L2+d*d)/(2*d),h=Math.sqrt(Math.max(0,L1*L1-k*k)),u=dx/d,v=dy/d;return[a,pt(a.x+k*u-h*v*side,a.y+k*v+h*u*side),b];}
const body=(q,p)=>rot(pt(q.hip.x+p.x,q.hip.y+p.y),q.hip,q.angle);
function bookPoint(b,p){let q=rot(pt(p.x*b.scale,p.y*b.scale),pt(0,0),b.angle);return pt(b.x+q.x,b.y+q.y);}
function dogPoint(d,p){let q=rot(pt(p.x*d.scale*d.sx,p.y*d.scale*d.sy),pt(0,0),d.angle);return pt(d.x+q.x,d.y+q.y);}
function dogLocal(d,p){let q=rot(pt(p.x-d.x,p.y-d.y),pt(0,0),-d.angle);return pt(q.x/d.scale/d.sx,q.y/d.scale/d.sy);}
function pose(t){
 const before=t>=3.76&&t<5.74,after=t>=5.74;
 let impact=before||after?0:tr(t,[[0,0],[1.08,0],[1.22,1,'out'],[1.39,-.18,'out'],[1.64,0,'io']]);
 let look=before?ramp(t,5.1,5.43):after?1:ramp(t,1.66,2.05,'io');
 let inspect=before||after?0:tr(t,[[0,0],[2.58,0],[2.84,1,'out'],[3.38,1],[3.70,.6,'io']]);
 let relax=after?ramp(t,6.2,6.94,'io'):0,leanback=after?ramp(t,7.4,8.08,'io'):0;
 let q={t,before,after,impact,look,inspect,relax};
 q.hip=pt(485-12*impact,785+13*impact);q.angle=-25*impact+15*look+12*inspect-11*leanback;
 q.shoulder=body(q,pt(0,-142));q.neck=body(q,pt(0,-163));q.head=body(q,pt(-2,-235));q.headAngle=q.angle+(look?15*look:0)+12*inspect;
 q.feet=[pt(665-12*Math.max(0,impact),966-32*Math.max(0,impact)),pt(733-45*Math.max(0,impact),966-110*Math.max(0,impact))];
 q.legs=q.feet.map((p,i)=>ik(q.hip,p,155,155,i?-1:-1));q.knee=q.legs[0][1];
 let b={x:580,y:663,angle:-8,fold:0,scale:1};
 if(!before&&!after){let flip=tr(t,[[0,0],[1.08,0],[1.22,1,'out'],[1.56,1]]),low=ramp(t,1.62,2.04,'io');b.x=mix(mix(580,465,flip),440,low);b.y=mix(mix(663,591,flip),746,low);b.angle=mix(-8+14*flip,-28,low);b.fold=.32*low;}
 if(before){let low=ramp(t,5.1,5.44,'io');b.x=mix(580,440,low);b.y=mix(663,746,low);b.angle=mix(-8,-28,low);b.fold=.32*low;}
 if(after){let put=ramp(t,8.0,8.45,'io');b={x:mix(440,405,put),y:mix(746,809,put),angle:mix(-28,90,put),fold:mix(.32,1,put),scale:1};}
 q.book=b;
 let d={x:950,y:900,scale:1.2,angle:0,sx:1,sy:1,fold:0,relax:0,ear:0,tail:0,head:0};
 if(!before&&!after&&t<.76){let c=ramp(t,.5,.76,'io');d.sy=1-.2*c;d.sx=1+.09*c;d.y+=13.6*c;d.head=-8*ramp(t,.12,.4);}
 else if(!before&&!after&&t<1.08){let u=(t-.76)/.32;d.x=mix(950,655,u);d.y=mix(913.6,740,u)-185*Math.sin(Math.PI*u);d.angle=-22*Math.sin(Math.PI*u);d.fold=Math.sin(Math.PI*u)*.8+.55*u;d.sy=mix(.80,1,ramp(t,.76,.84));d.sx=mix(1.09,1,ramp(t,.76,.84));}
 else if(before){let walk=tr(t,[[3.76,0],[3.84,0],[4.02,1,'io'],[4.08,1],[4.25,2,'io']]);d.x=830-27*walk;d.y=900;let brace=ramp(t,4.60,4.84,'out'),up=ramp(t,5.1,5.5,'out');d.x=mix(d.x-30*brace,655,up);d.y=mix(900-24*brace,740,up);d.angle=mix(43*brace,0,up);d.fold=.55*up;d.brace=brace;d.up=up;d.head=-12*ramp(t,4.1,4.4);}
 else {d.x=655+impact*3;d.y=740-18*impact;d.fold=.55;d.sx=1+impact*.15;d.sy=1-impact*.18;d.head=9*look+8*inspect;if(after){d.relax=relax;d.y=740+17*relax;d.sx=1+.10*relax;d.sy=1-.10*relax;d.head=mix(9,0,relax);}}
 if(!before&&!after)d.ear=tr(t,[[0,0],[1.15,0],[1.28,-35,'out'],[1.43,15,'out'],[1.64,0,'out']]);
 d.tail=after?tr(t,[[5.74,0],[6.85,0],[7.2,1,'io']]):tr(t,[[0,0],[.3,0],[.50,.4,'io'],[.76,0],[1.18,0],[1.34,-.35,'out'],[1.60,0,'out'],[2.70,0],[2.95,.2,'io'],[3.25,0,'io']]);
 if(after)d.ear=20*ramp(t,6.9,7.13);
 let paws=[pt(-49,48.7),pt(-27,48.7),pt(31,48.7),pt(51,48.7)];
 paws=paws.map((p,i)=>pm(p,[pt(-50,40),pt(-27,40),pt(27,42),pt(48,42)][i],d.fold));
 if((!before&&t>=1.08)||after){paws=[pt(590,796-impact*18),pt(615,795-impact*18),pt(676,796-impact*18),pt(704,796-impact*18)].map(p=>dogLocal(d,p));}
 if(before){
  if(t<4.6){let w0=ramp(t,3.84,4.02,'io'),w1=ramp(t,4.08,4.25,'io');let baseX=[-49,-27,31,51];paws=baseX.map((x,i)=>{let u=i===0||i===3?w0:w1;return dogLocal(d,pt(830+x*1.2-54*u,958.4-Math.sin(u*Math.PI)*25));});}
  else {let end=[pt(q.knee.x-15,q.knee.y-8),pt(q.knee.x+12,q.knee.y-8)],up=d.up;for(let i=0;i<2;i++){let p=pm(pt(776+[-49,-27][i]*1.2,958.4),end[i],d.brace);p=pm(p,pt([590,615][i],796),up);paws[i]=dogLocal(d,p);}let release=ramp(t,5.12,5.3,'out');for(let i=2;i<4;i++){let dest=pt([676,704][i-2],796);paws[i]=dogLocal(d,pm(pt(776+[31,51][i-2]*1.2,958.4),dest,release));}}
 }
 let near=bookPoint(b,pt(mix(76,10,b.fold),38)),far=bookPoint(b,pt(-mix(76,8,b.fold),38));
 if(!before&&!after)near=pm(near,pt(562,795+4*inspect),ramp(t,1.64,2.06,'io'));
 if(before)near=pm(near,pt(562,795),ramp(t,4.32,4.62));
 if(after){
  const attempt=tr(t,[[5.74,0],[7.22,0],[7.39,1,'out'],[7.62,1],[7.90,0,'io']]);d.chinLift=-18*attempt;
  const resthand=dogPoint(d,pt(-112,-12+24*relax+d.chinLift));
  near=pm(bookPoint({x:440,y:746,angle:-28,fold:.32,scale:1},pt(mix(76,10,.32),38)),resthand,ramp(t,5.74,6.78,'io'));
  // The reading wrist owns the right book edge until the other hand takes it.
  let held={x:0,y:0,angle:-28+4*attempt,fold:.32,scale:1};let grip=bookPoint(held,pt(mix(76,10,.32),38));held.x=near.x-grip.x;held.y=near.y-grip.y;
  let put=ramp(t,8.0,8.45,'io');b={x:mix(held.x,405,put),y:mix(held.y,809,put),angle:mix(held.angle,90,put),fold:mix(.32,1,put),scale:1};q.book=b;
  far=bookPoint(b,pt(-mix(76,8,b.fold),38));
  let stroke=ramp(t,8.69,9.35,'io'),reach=ramp(t,8.45,8.69,'io');let back=dogPoint(d,pt(mix(-22,40,stroke),-29-2*Math.sin(stroke*Math.PI)));far=pm(far,back,reach);
  let stretch=tr(t,[[5.74,0],[7.1,0],[7.45,1,'out'],[8.03,0,'io']]);paws[0]=pm(paws[0],dogLocal(d,pt(560,822)),relax*.8);paws[1]=pm(paws[1],dogLocal(d,pt(585-25*stretch,821+12*stretch)),relax);
 }
 let tap=!before&&!after?tr(t,[[0,0],[2.58,0],[2.72,1,'out'],[3.1,1],[3.45,0,'io']]):0;
 if(tap)paws[0]=pm(paws[0],dogLocal(d,pt(near.x,near.y-5)),tap);
 q.tap=tap;q.near=near;q.far=far;q.arms=[ik(pt(q.shoulder.x-7,q.shoulder.y+2),far,120,120,after?1:-1),ik(pt(q.shoulder.x+7,q.shoulder.y+2),near,120,120,1)];q.dog=d;q.paws=paws;q.pawWorld=paws.map(p=>dogPoint(d,p));
 q.gaze=before?ramp(t,5.1,5.25):after?1:ramp(t,1.56,1.70);q.mood=impact>.2?'shock':after&&relax>.85&&!(t>=7.2&&t<7.92)?'calm':inspect>.3?'curious':look>.3?'curious':'read';
 q.chairAngle=-7*impact;q.cushion=impact*.8+(before?(d.up||0)*.18:after?.18:t>=1.08?.18:0);
 return q;
}
function environment(t){let s='';
 s+=path('M 105 969 Q 540 949 1118 969 Q 1141 986 1109 1006 Q 567 1027 112 1005 Q 88 989 105 969 Z',2.5,'#D8CFC1',GRAY);
 for(let x=127;x<1090;x+=34)s+=path(`M ${x} 1006 l -7 13`,2,'none',GRAY);
 // Reading lamp and side table establish the interrupted task.
 s+=path('M 153 940 Q 171 926 202 940 L 205 947 L 149 947 Z',5,TAN)+path('M 177 932 L 177 544 Q 178 522 205 519 L 248 519',7);
 s+=path('M 201 502 L 270 502 L 300 588 Q 248 602 184 588 Z',5,'#D9C9AF')+path('M 238 506 L 236 581',2,'none','#B9A68A');
 s+=path('M 110 815 L 290 815 L 303 833 L 106 833 Z',5,TAN)+path('M 123 835 L 111 961 M 280 835 L 296 961',6);
 s+=path('M 133 799 L 241 799 L 244 813 L 132 813 Z',3,'#7C8179')+path('M 143 785 L 249 785 L 250 798 L 144 798 Z',3,WHITE)+path('M 154 769 L 226 769 L 231 784 L 150 784 Z',3,TAN);
 s+=path('M 257 776 L 282 776 L 280 803 Q 267 810 258 802 Z',4,WHITE)+path('M 283 779 Q 301 780 294 792 L 282 795',3);
 return s;
}
function chair(q){let c=q.cushion,angle=q.chairAngle;let s=path('M 338 857 L 318 967 M 766 860 L 792 967',8)+path('M 318 852 L 320 629 Q 320 608 344 606 L 454 612 Q 475 614 477 637 L 481 821 Z',7,TAN)+path('M 344 635 Q 345 696 350 738',3,'none','#A99376');
 s+=path(`M 308 792 Q 470 ${n(774+20*c)} 770 789 L 783 850 Q 542 877 310 852 Z`,7,RED)+path(`M 363 799 Q 498 ${n(787+31*c)} 721 802`,4,'none','#9D2C25');
 s+=path('M 288 745 Q 282 726 305 723 L 353 730 Q 364 737 361 759 L 364 829 Q 348 844 291 830 Z',6,TAN)+path('M 745 751 Q 740 731 759 728 L 793 734 Q 808 741 805 761 L 803 835 Q 790 851 751 837 Z',6,TAN);
 s+=path(`M 522 814 l -16 ${n(8+11*c)} M 563 813 l 19 ${n(9+11*c)}`,3,'none','#A52E26');
 return `<g transform="rotate(${n(angle)} 335 922)">${s}</g>`;
}
function face(q){let g=q.gaze,s='';if(q.mood==='shock')s=circle(-20,-3,6)+circle(19,-3,6)+path('M -27 -26 Q -17 -38 -5 -30 M 7 -30 Q 23 -38 31 -24',4)+`<ellipse cx="0" cy="27" rx="12" ry="15" fill="${INK}"/>`;
 else if(q.mood==='calm')s=path('M 9 8 Q 19 18 29 8 M 32 6 Q 41 14 47 4',4)+path('M 16 34 Q 30 43 41 29',4);
 else{s=circle(mix(15,17,g),mix(5,23,g),5)+circle(mix(38,39,g),mix(2,18,g),5);s+=q.mood==='curious'?path('M 4 1 Q 15 -10 29 -3 M 32 -5 L 48 0',4)+path('M 19 39 Q 30 35 40 38',4):path('M 18 29 Q 29 38 39 26',4);}
 return `<g transform="translate(${xy(q.head)}) rotate(${n(q.headAngle)})">${circle(0,0,62,WHITE,8)}${s}</g>`;
}
function human(q){return q.legs.map(a=>line(a,15)).join('')+q.feet.map(p=>path(`M ${p.x-7} ${p.y} l 32 0`,15)).join('')+line([q.hip,q.shoulder,q.neck],17)+q.arms.map(a=>line(a,14)).join('')+face(q);}
function book(q){let b=q.book,L=mix(95,6,b.fold),R=mix(95,12,b.fold);let s=path(`M 0 -49 L ${-L} -65 L ${-L} 38 L 0 55 L ${R} 38 L ${R} -65 Z`,6,RED)+path(`M 0 -46 Q ${-L*.45} -64 ${-L+6} -58 L ${-L+6} 33 Q ${-L*.4} 34 0 49 Q ${R*.4} 35 ${R-6} 32 L ${R-6} -59 Q ${R*.5} -62 0 -46 Z`,3,WHITE)+path('M 0 -46 L 0 49',3);
 if(b.fold<.7){for(let y of[-29,-8,13])s+=path(`M ${-L+16} ${y-4} L -14 ${y+4} M 14 ${y+4} L ${R-16} ${y-4}`,2.3);}
 if(!q.before&&!q.after){[1.15,1.22,1.30].forEach((at,i)=>{let f=tr(q.t,[[at,0],[at+.12,1,'out'],[1.82+i*.05,0,'io']]);if(f>0)s+=path(`M 0 -46 Q ${-20-90*f-i*9} ${-60-85*f-i*7} ${-25-96*f-i*7} ${-20-15*f} L ${-14-79*f} ${49-15*f} Q ${-12-38*f} 41 0 49 Z`,3,WHITE);});}
 return `<g transform="translate(${n(b.x)} ${n(b.y)}) rotate(${n(b.angle)}) scale(${b.scale})">${s}</g>`;
}
function dog(q){let d=q.dog,r=d.relax,s='';
 let tailAngle=q.after?mix(-24,48,d.tail):d.tail*55;
 s+=`<g transform="translate(65 1) rotate(${n(tailAngle)})">`+path('M 0 0 Q 28 -4 35 -31 Q 37 -48 45 -43 Q 56 -20 34 8 Q 23 23 4 17 Z',5,WHITE)+path('M 41 -42 Q 48 -33 46 -21',4,'none',RED)+`</g>`;
 function leg(i){let a=pt([-46,-28,34,51][i],13),p=q.paws[i];let bend=pt(mix(a.x,p.x,.55)+(i<2?-10:10)*(1-r),mix(a.y,p.y,.55));let paw=path('M -5 -2 Q -17 6 -4 8 L 13 8',5,WHITE);let angle=q.before?d.angle*Math.PI/180:0,c=Math.cos(angle),sn=Math.sin(angle);paw=`<g transform="translate(${xy(p)}) matrix(${c/d.sx} ${-sn/d.sy} ${sn/d.sx} ${c/d.sy} 0 0)">${paw}</g>`;return path(`M ${xy(a)} Q ${xy(bend)} ${xy(p)}`,14,'none',INK)+path(`M ${xy(a)} Q ${xy(bend)} ${xy(p)}`,7,'none',WHITE)+paw;}
 s+=leg(0)+leg(2)+leg(3)+path(`M -58 -26 Q -28 ${-43+7*r} 18 ${-35-1.2*Math.sin(q.t*2)*r} Q 68 -39 78 -6 Q 85 25 59 34 L -36 34 Q -65 30 -66 6 Z`,6,WHITE)+path('M 21 -33 Q 51 -41 63 -20 Q 70 -6 65 9 Q 36 21 19 8 Q 7 -8 21 -33 Z',0,TAN);
 s+=leg(1);
 let hy=-44+24*r+(d.chinLift||0),headA=d.head;
 s+=`<g transform="translate(-56 ${n(hy)}) rotate(${n(headA)})">`+path('M -12 -35 Q -44 -43 -49 -16 L -75 -4 Q -91 4 -81 20 Q -75 31 -53 27 Q -31 42 -8 29 Q 18 18 13 -9 Q 10 -31 -12 -35 Z',6,WHITE)+path('M 1 -29 Q 32 -25 27 5 Q 24 37 10 39 Q -5 34 -7 14 L -4 -10 Q -12 -26 1 -29 Z',5,TAN)+`<g transform="rotate(${n(d.ear)} 9 -23)">`+path('M 1 -29 Q 30 -24 26 5 Q 24 37 10 38 Q -3 32 -6 13 L -4 -10 Q -10 -25 1 -29 Z',4.5,INK)+`</g>`;
 s+=q.after&&q.t>6.9?path('M -38 -7 Q -30 3 -22 -7',4):circle(-31,-8,4.2);
 s+=path('M -82 4 Q -72 -4 -65 4 L -70 14 L -80 13 Z',3,INK)+path('M -73 23 Q -61 31 -49 23',3.5)+`</g>`;
 s+=path(`M -51 ${-20+14*r} Q -48 ${3+13*r} -43 ${19+6*r}`,7,'none',RED)+circle(-49,16+10*r,5,RED,2);
 return `<g transform="translate(${n(d.x)} ${n(d.y)}) rotate(${n(d.angle)}) scale(${n(d.scale*d.sx)} ${n(d.scale*d.sy)})">${s}</g>`;
}
function bookmark(q){if(q.before||q.after||q.t<1.18)return '';let u=clamp((q.t-1.18)/.78),x=mix(451,850,u),y=mix(550,970,u)-190*Math.sin(Math.PI*u),a=mix(-30,195,u);return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(a)})">${path('M -7 -29 L 7 -29 L 7 27 L 0 19 L -7 27 Z',2,RED)}</g>`;}
function accents(q){let s='';if(!q.before&&!q.after&&q.t>=1.08&&q.t<1.32){let u=ramp(q.t,1.08,1.32);s+=`<g opacity="${1-u}">`+path('M 693 813 l 30 16 M 701 790 l 36 1 M 683 835 l 14 18',5,'none',RED)+`</g>`;}if(q.tap>.96&&q.t<2.92)s+=path('M 547 775 l -5 -11 M 569 772 l 4 -12',4,'none',RED);return s;}
function cameraForTime(t){if(t<3.76)return{scale:1,cx:615,cy:765,dx:0,dy:0};if(t<5.74)return{scale:1.4,cx:680,cy:835,dx:-40,dy:-50};return{scale:1.30,cx:603,cy:760,dx:0,dy:-33};}
function draw(t){let q=pose(t),c=cameraForTime(t);let j=0;if(t>=1.08&&t<1.4)j=Math.sin((t-1.08)*100)*7*(1-(t-1.08)/.32)**2;
 let s=environment(t)+chair(q)+human(q)+book(q)+dog(q)+bookmark(q);
 // Foreground wrist tips: hand stays above the book/dog at actual shared targets.
 for(let i=0;i<2;i++){let end=i?q.near:q.far,elbow=q.arms[i][1],d=Math.hypot(elbow.x-end.x,elbow.y-end.y);if(q.look>.6||q.after)s+=line([pm(end,elbow,Math.min(22/d,1)),end],14);s+=circle(end.x,end.y,7);}
 s+=accents(q);return `<g transform="translate(${n(c.cx+c.dx+j)} ${n(c.cy+c.dy)}) scale(${c.scale}) translate(${-c.cx} ${-c.cy})">${s}</g>`;
}
function inspect(t){let q=pose(t);return{t,camera:cameraForTime(t),humanHead:q.head,hip:q.hip,angle:q.angle,arms:q.arms,feet:q.feet,legs:q.legs,book:q.book,dog:q.dog,pawWorld:q.pawWorld,pawWristGap:Math.hypot(q.pawWorld[0].x-q.near.x,q.pawWorld[0].y-q.near.y+5),near:q.near,far:q.far};}
const events={openingCrouch:.5,openingLaunch:.76,openingLand:1.08,chairExtreme:1.22,paper:[1.15,1.22,1.30],bookmark:1.18,bookLower:1.62,pawWrist:2.72,beforeCut:3.76,steps:[4.02,4.25],kneeContact:4.84,climbStart:5.1,climbEnd:5.5,afterCut:5.74,bookSeat:8.45,chinRest:6.78,earRest:7.13,tailRest:7.2,stretchEnd:8.03,petStart:8.69,petEnd:9.35,readingAttempt:7.22,readingYield:7.9};
module.exports={draw,inspect,cameraForTime,events,productionAssets:[]};
