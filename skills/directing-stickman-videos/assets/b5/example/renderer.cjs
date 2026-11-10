/* B5 approved V13 portable baseline. Sample-specific content; not a new story. */
const fs=require('fs'),path=require('path');
const stage=require('./stage.cjs');
const gestures=require('./presenter-gestures.cjs');
const config=require('./config.json');
const ROOT=__dirname,FPS=config.fps,W=config.width,H=config.height,DURATION=config.duration,N=Math.round(FPS*DURATION);
const ink='#1E1C1A',red='#D7372C',gray='#858079',paper='#EBE7E1';
const words=JSON.parse(fs.readFileSync(path.join(ROOT,'word-timings.json'))).words;
const groups=JSON.parse(fs.readFileSync(path.join(ROOT,'caption-groups.json')));
const atlas=JSON.parse(fs.readFileSync(path.join(ROOT,'font-atlas.json')));
const uri=f=>'data:image/png;base64,'+fs.readFileSync(path.join(ROOT,f)).toString('base64');
for(const a of Object.values(atlas))a.uri=uri(a.file);
const paperURI=uri('assets/paper.png');
const src=fs.readFileSync(path.join(ROOT,config.presenter.rig),'utf8');
const defs=src.match(/<defs>([\s\S]*?)<\/defs>/)[1];
const rawHead=src.slice(src.indexOf('<g id="head"'),src.indexOf('    <!-- Foreground hands')).trim();
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,u)=>a+(b-a)*u;
const smooth=(t,a,b)=>{let u=clamp((t-a)/(b-a));return u*u*(3-2*u)};
const out=u=>1-Math.pow(1-clamp(u),3);
const pulse=(t,c,w)=>Math.exp(-Math.pow((t-c)/w,2));
const P=(d,color=ink,width=7,attrs='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${attrs}/>`;
const C=(x,y,r,color=ink)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const transform=(s,x,y,inside,rot=0)=>`<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${inside}</g>`;
function imageTile(text,family,size,color,x,baseline,tracking=-.5){
 const a=atlas[`${family}|${size}|${tracking}|${color}|${text}`];if(!a)throw Error('No tile '+text);
 return `<image x="${x-a.pad}" y="${baseline-a.baseline}" width="${a.image_width}" height="${a.image_height}" href="${a.uri}"/>`;
}
function title(text,size,x,y,color=ink){return imageTile(text,'Anton-0.ttf',size,color,x,y)}
function drawStroke(d,len,t,start,dur,color=red,width=10){return P(d,color,width,`stroke-dasharray="${len}" stroke-dashoffset="${len*(1-out((t-start)/dur))}"`)}

// For a new story regenerate this envelope from its approved dry voice; not phoneme alignment.
const levels=require('./speech-levels.json');
const blinks=[];let seed=4371;for(let t=2.8;t<DURATION;){blinks.push(t);seed=(1664525*seed+1013904223)>>>0;t+=2.4+seed/4294967296*1.8}
function talking(t){
 let w=words.find(w=>t>=w.start&&t<w.end),phase=w?(t-w.start)/(w.end-w.start):0;
 let amp=levels[Math.min(N-1,Math.max(0,Math.floor(t*FPS)))];
 if(w&&/^[bmp]/i.test(w.text)&&phase<.13)amp*=.1;
 if(!w&&words.every(w=>t<w.start-.035||t>w.end+.07))amp=0;
 return {amp,w,phase};
}
function mouth(a,round=false){
 if(a<.09)return P('M600 477Q638 491 674 476',ink,5.5);
 if(round)return `<ellipse cx="638" cy="484" rx="${14+12*a}" ry="${8+25*a}" fill="#311D22" stroke="${ink}" stroke-width="5.5"/>`;
 const b=489+a*32;
 return `<path d="M592 475Q635 ${465-a*4} 680 474Q672 ${b+5} 637 ${b}Q603 ${b+3} 592 475Z" fill="#311D22" stroke="${ink}" stroke-width="5.5" stroke-linejoin="round"/><path d="M599 476Q636 ${470-a*3} 673 475L666 484Q636 490 606 484Z" fill="#FFF9E9"/>${P(`M617 ${b-6}Q637 ${b-15} 656 ${b-6}`,'#DC776E',6)}`;
}
function hand(x,y,r=0,scale=1,open=false){
 const shape=open==='point'?'M-29 21L-36 3Q-40-6-33-10Q-27-12-22-4L-23-56Q-24-68-14-68Q-5-67-5-55L-3-18Q6-27 14-16Q22-24 29-12Q40-15 42-2L39 13Q32 30 11 30Z':(open===true||open==='palm')?'M-22 20Q-33 5-31-12L-29-43Q-28-54-20-53Q-12-52-12-41L-11-23L-9-58Q-8-69 1-68Q10-66 10-56L11-25L17-52Q20-63 28-60Q36-57 33-47L27-17L38-36Q44-45 51-39Q57-33 50-23L31 13Q25 28 7 30Z':'M-26 3Q-26-13-13-19L9-22Q20-23 23-14L27 4Q26 18 12 22L-11 24Q-24 21-26 3Z';
 return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${scale})" fill="#DE4438" stroke="${ink}" stroke-width="5" stroke-linejoin="round">`+
 `<path d="${shape}"/>${P('M-12-15L-10 4M0-18L2 1M12-17L14-1M-20 8Q-5 13 7 11',ink,2.6)}</g>`;
}
function rig(id,t,{x,y,s=1,tilt=0,amp=0,blink=0,left=[555,720],right=[800,650],open=false,leftStyle=open,rightStyle=open,leftRotation=-16,rightRotation=17,legs=0,sad=0,bodyOnly=false,headOnly=false}={}){
 let head=rawHead.replace('rotate(-7 635 355)',`rotate(${-7+tilt} 635 355)`);
 const ey=(1-.88*blink)*(1-.30*sad);
 head=head.replace('id="eye-left"',`id="eye-left" transform="translate(531 358) scale(1 ${ey}) translate(-531 -358)"`)
 .replace('id="eye-right"',`id="eye-right" transform="translate(741 348) scale(1 ${ey}) translate(-741 -348)"`);
 head=head.replace(/\s*<\/g>\s*$/,`${mouth(amp,amp>.1&&talking(t).w&&/^(you|you're|to|So)/i.test(talking(t).w.text)&&talking(t).phase>.15&&talking(t).phase<.7)}</g>`);
 // Each instance has isolated clip ids; gloves are always after the complete head.
 let body=P('M661 555Q649 661 679 788',ink,14)+P(`M658 620Q${mix(658,left[0],.65)-35} ${mix(620,left[1],.6)} ${left[0]} ${left[1]}`,ink,14)+P(`M658 625Q${mix(658,right[0],.55)+20} ${mix(625,right[1],.5)+30} ${right[0]} ${right[1]}`,ink,14);
 body+=P(`M679 788Q${628-legs*15} 832 ${592-legs*20} 902L${551-legs*20} 920M679 788Q${727+legs*15} 825 ${767+legs*20} 891L${818+legs*20} 910`,ink,14);
 body+=`<g fill="#D94135" stroke="${ink}" stroke-width="6"><path d="M${581-legs*20} 894Q${601-legs*20} 901 ${601-legs*20} 914L${565-legs*20} 938Q${543-legs*20} 949 ${527-legs*20} 935Q${523-legs*20} 922 ${542-legs*20} 916Z"/><path d="M${764+legs*20} 883Q${750+legs*20} 898 ${760+legs*20} 915L${801+legs*20} 933Q${829+legs*20} 944 ${843+legs*20} 929Q${847+legs*20} 916 ${822+legs*20} 909Z"/></g>`;
 let inner=bodyOnly?body:headOnly?head:body+head+hand(...left,leftRotation,1,leftStyle)+hand(...right,rightRotation,1,rightStyle);
 inner=(`<defs>${defs}</defs><g fill="none" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`).replace(/head-silhouette/g,`sil-${id}`).replace(/mask-clip/g,`clip-${id}`);
 return `<g transform="translate(${x} ${y}) scale(${s}) translate(-638 -355)">${inner}</g>`;
}
function presenter(t){
 let speech=talking(t),blink=Math.max(0,...blinks.map(c=>pulse(t,c,.045)));
 let emph=Math.max(...groups.map(g=>pulse(t,words[g.key].start+.10,.20)));
 const react=pulse(t,1.84,.17)+pulse(t,7.52,.17)+pulse(t,16.9,.17);
 const gesture=gestures.pose(t);
 // Face area reduced 42%; reference-sized head plus shoulders, not head-only.
 // Voice-driven mouth, seeded blinks and semantic glove gestures are untouched.
 return rig('narrator',t,{x:config.presenter.x,y:config.presenter.y-6*react-3*emph,s:config.presenter.scale,tilt:1.2*Math.sin(t*1.6)-3*emph-5*react,amp:speech.amp,blink,...gesture,legs:.15,sad:t>10.6?.25:0});
}
function captions(t){
 let gi=groups.findIndex((g,i)=>t>=words[g.lines[0][0]].start&&(i===groups.length-1?t<DURATION:t<words[groups[i+1].lines[0][0]].start-.015));
 if(gi<0)return '';let g=groups[gi],html='',base=g.lines.length===3?230:262;
 for(let li=0;li<g.lines.length;li++){
  let x=1270,baseline=base+li*82.4;
  for(let index of g.lines[li]){
   let w=words[index],a=atlas[`Instrument-Sans-1.ttf|62|-1.8|white|${w.screen}`],key=index===g.key;
   let wwidth=a.width+(key?24:0),dt=t-w.start;
   if(dt>=0){
    let dy=key?0:4*(1-out(dt/.2)),u=clamp(dt/.2),col=key?mixColor('#F6CEC8','#FBFAF8',u):mixColor('#B5AFA7',ink,u);
    let b=clamp(dt/.23)-1,scale=key?.91+.09*(1+2.8*b*b*b+1.8*b*b):1;
    let px=x+(key?12:0)-a.pad,py=baseline-a.baseline+dy;
    let elem=`<defs><mask id="text-${index}" maskUnits="userSpaceOnUse" x="${px}" y="${py}" width="${a.image_width}" height="${a.image_height}"><image x="${px}" y="${py}" width="${a.image_width}" height="${a.image_height}" href="${a.uri}"/></mask></defs><rect x="${px}" y="${py}" width="${a.image_width}" height="${a.image_height}" fill="${col}" mask="url(#text-${index})"/>`;
    if(key)elem=`<rect x="${x}" y="${baseline-60}" width="${wwidth}" height="75" rx="3" fill="${red}"/>`+elem;
    html+=`<g transform="translate(${x+wwidth/2} ${baseline-25}) scale(${scale}) translate(${-x-wwidth/2} ${-baseline+25})">${elem}</g>`;
   }
   x+=wwidth+13.4;
  }
 }
 return html;
}
function mixColor(a,b,u){return '#'+[1,3,5].map(i=>Math.round(mix(parseInt(a.slice(i,i+2),16),parseInt(b.slice(i,i+2),16),u)).toString(16).padStart(2,'0')).join('')}
function frame(t){
 let account=config.account?imageTile(config.account,'Instrument-Sans-1.ttf',25,gray,112,80,0):'';
 return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${paper}"/><image width="${W}" height="${H}" href="${paperURI}" opacity=".48"/>${account}${stage.draw(t,{title,drawStroke})}${presenter(t)}${captions(t)}</svg>`);
}
module.exports={frame,presenter,captions,levels,blinks};
