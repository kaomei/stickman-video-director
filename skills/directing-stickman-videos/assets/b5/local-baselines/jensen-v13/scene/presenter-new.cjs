/* V13 local facial performance. The approved raster likeness is immutable.
 * All-film dejection; crying peaks are animation, not new speech or audio. */
const fs=require('fs'),path=require('path');
const source=__dirname;
const config=require(path.join(source,'config.json'));
const words=require(path.join(source,'word-timings.json')).words;
const levels=require(path.join(source,'speech-levels.json'));
const {P,G,ink,clamp,mix,pulse}=require(path.join(source,'actor.cjs'));
const uri='data:image/png;base64,'+fs.readFileSync(path.join(source,config.presenter.rig)).toString('base64');
const base={bL:-2,bR:0,aL:-2,aR:2,gaze:-4,eyes:.68,frown:1.45,tilt:-1,cry:0,tears:0};
const state=(values={})=>({...base,...values});
// Semantic beats, not a repeated sad-face loop. There is no happy reset.
const keys=[
 [0,state({eyes:.62,frown:1.65,tilt:2,tears:.25})],
 [1.25,state({eyes:.5,frown:1.95,tilt:3,cry:.55,tears:.75})],
 [2.15,state({eyes:.63,frown:1.5,tilt:1,tears:.42})],
 [4.1,state({eyes:.58,frown:1.65,gaze:-9,tilt:-2,tears:.28})],
 [6.3,state({eyes:.72,frown:1.5,tilt:-2,tears:.45})],
 [7.4,state({eyes:.5,frown:1.9,tilt:2,cry:.3,tears:.65})],
 [9.65,state({eyes:.36,frown:2.15,tilt:3,cry:.92,tears:1})],
 [10.7,state({eyes:.57,frown:1.7,tilt:2,cry:.35,tears:.85})],
 [11.85,state({eyes:.7,frown:1.5,gaze:-7,tilt:-1,tears:.55})],
 [14.7,state({eyes:.56,frown:1.75,tilt:-2,cry:.15,tears:.4})],
 [15.65,state({eyes:.4,frown:1.95,tilt:2,cry:.72,tears:.7})],
 [17.1,state({eyes:.62,frown:1.5,gaze:-10,tilt:2,tears:.6})],
 [20.9,state({eyes:.55,frown:1.7,gaze:-7,tilt:-1,tears:.35})],
 [23.75,state({eyes:.48,frown:1.9,tilt:-3,cry:.35,tears:.65})],
 [26.85,state({eyes:.38,frown:2.05,tilt:-2,cry:.85,tears:1})],
 [28.4,state({eyes:.68,frown:1.55,tilt:1,tears:.5})],
 [30.2,state({eyes:.6,frown:1.45,gaze:-8,tilt:2,tears:.3})],
 [33.55,state({eyes:.47,frown:1.95,tilt:3,cry:.65,tears:.85})],
 [35.5,state({eyes:.65,frown:1.65,tilt:-2,tears:.55})],
 [38.1,state({eyes:.7,frown:1.5,gaze:-9,tilt:-2,tears:.4})],
 [42.9,state({eyes:.45,frown:1.85,gaze:-6,tilt:2,cry:.5,tears:.8})],
 [44.9,state({eyes:.4,frown:2.05,tilt:3,cry:.88,tears:1})],
 [46.75,state({eyes:.61,frown:1.5,tilt:1,tears:.5})],
 [49.5,state({eyes:.56,frown:1.7,gaze:-9,tilt:-1,tears:.45})],
 [52.4,state({eyes:.46,frown:1.95,tilt:-2,cry:.55,tears:.85})],
 [54.8,state({eyes:.36,frown:2.15,tilt:-3,cry:1,tears:1})],
 [56.1,state({eyes:.57,frown:1.75,tilt:1,cry:.3,tears:.7})],
 [58.3,state({eyes:.48,frown:1.9,tilt:2,cry:.45,tears:.8})],
 [59.9,state({eyes:.32,frown:2.2,tilt:3,cry:1,tears:1})],
 [61.5,state({eyes:.44,frown:2,tilt:2,cry:.7,tears:1})],
 [63.5334,state({eyes:.35,frown:2.1,tilt:3,cry:.95,tears:1})]
];
function expression(t){
 for(let i=1;i<keys.length;i++)if(t<keys[i][0]){
  let u=clamp((t-keys[i-1][0])/(keys[i][0]-keys[i-1][0]));u=u*u*(3-2*u);
  return Object.fromEntries(Object.keys(base).map(k=>[k,mix(keys[i-1][1][k],keys[i][1][k],u)]));
 }
 return keys.at(-1)[1];
}
const emphasised=['cheating','awkward','Alice','photos','prove','twist','claims','investigation','lawyers','documentary'];
const normal=s=>s.toLowerCase().replace(/[^a-z]/g,'');
function emphasis(t){
 // Preserve the approved body gestures exactly, including the earlier 7–16s pass.
 if(t>=7&&t<16)return pulse(t,9.5,.22)+.4*pulse(t,11.64,.24);
 const cue=words.find(w=>emphasised.includes(normal(w.text))&&t>=w.start-.10&&t<w.end+.42);
 return cue?Math.sin(Math.PI*clamp((t-cue.start+.10)/(cue.end-cue.start+.52))):0;
}
const blinks=[];let seed=4371;for(let t=2.8;t<64;){blinks.push(t);seed=(1664525*seed+1013904223)>>>0;t+=2.4+seed/4294967296*1.8}
function curve(a,b,side){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy),ang=Math.atan2(dy,dx),h=Math.acos(clamp((95*95+d*d-100*100)/(190*d),-1,1));if(d>194.99)throw Error('Presenter reach '+d);const e=[a[0]+95*Math.cos(ang+side*h),a[1]+95*Math.sin(ang+side*h)];return P(`M${a}L${e}L${b}`,ink,14)}
function eye(x,e,blink){
 const left=x<700,outer=365,inner=347,l=left?outer:inner,r=left?inner:outer;
 const sy=mix(e.eyes,1,e.cry)*(1-.96*blink),cy=354;
 const a=mix(l,363,e.cry),b=mix(r,363,e.cry),q=mix(339,333,e.cry);
 const visibility=1-clamp((e.cry-.12)/.55);
 let open=`<path d="M${x-43} ${a}Q${x} ${q} ${x+43} ${b}Q${x+4} 377 ${x-43} ${a}Z" fill="#FFFCF4"/>`;
 open+=`<ellipse cx="${x+e.gaze}" cy="359" rx="13" ry="11" fill="${ink}"/><circle cx="${x+e.gaze+4}" cy="355" r="2.6" fill="white"/>`;
 // One continuous eyelid, not a crossfade that leaves ghost pupils/eyelids.
 return `<g transform="translate(${x} ${cy}) scale(1 ${sy}) translate(${-x} ${-cy})"><g opacity="${visibility}">${open}</g>${P(`M${x-43} ${a}Q${x} ${q} ${x+43} ${b}`,ink,mix(5.5,7,e.cry))}</g>`;
}
function tear(x,t,e,offset){
 const strength=clamp((e.tears-.25)/.55),p=((t+offset)%1.7)/1.7;
 if(strength<.01)return '';
 const y=397+125*p,alpha=strength*Math.min(1,p/.1,(1-p)/.2);
 const trail=P(`M${x} 389Q${x-7} 424 ${x+2} ${y-6}`,'#64BADA',8,`opacity="${alpha*.35}"`);
 const drop=`<path d="M${x} ${y-13}C${x-3} ${y-5} ${x-13} ${y+5} ${x-11} ${y+11}C${x-8} ${y+24} ${x+11} ${y+24} ${x+12} ${y+10}C${x+13} ${y+3} ${x+3} ${y-5} ${x} ${y-13}Z" fill="#76CBE5" stroke="#3187AA" stroke-width="2.5"/><path d="M${x-5} ${y+9}q-1 5 3 7" fill="none" stroke="#EDFCFF" stroke-width="3.5" stroke-linecap="round"/>`;
 return trail+`<g opacity="${alpha}">${drop}</g>`;
}
function presenter(t){
 const e=expression(t),word=words.find(w=>t>=w.start&&t<w.end),phase=word?(t-word.start)/(word.end-word.start):0;
 let amp=levels[Math.max(0,Math.min(levels.length-1,Math.floor(t*30)))]||0;
 if(!word||(/^[bmp]/i.test(word.text)&&phase<.13))amp*=.08;
 const blink=Math.max(0,...blinks.map(c=>pulse(t,c,.045))),emph=emphasis(t);
 const left=[570,820],right=[mix(830,875,emph),mix(820,640,emph)];
 let body=P('M700 632L700 875',ink,15)+curve([684,690],left,1)+curve([716,690],right,-1);
 for(const [x,y] of [left,right])body+=`<ellipse cx="${x}" cy="${y}" rx="22" ry="20" fill="#FFC18C" stroke="${ink}" stroke-width="5"/>`;
 const im=(attrs='')=>`<image width="1466" height="1073" href="${uri}" ${attrs}/>`;
 let face=im('clip-path="url(#sad13-head)"');
 face+=`<g mask="url(#sad13-brow-clean)">${im('y="64"')}</g><g mask="url(#sad13-eye-clean)">${im('y="105"')}</g>`;
 face+=`<g mask="url(#sad13-mouth-feather)"><image y="-1694" width="1466" height="4292" preserveAspectRatio="none" href="${uri}"/></g>`;
 face+=G(610,301,1,e.aL,G(-610,-301+e.bL,1,0,P('M554 315Q610 296 655 278',ink,14)));
 face+=G(783,301,1,e.aR,G(-783,-301+e.bR,1,0,P('M741 278Q783 296 839 315',ink,14)));
 face+=eye(613,e,blink)+eye(782,e,blink);
 face+=P('M493 331Q517 313 552 315Q612 307 657 317Q678 320 678 338M726 337Q726 317 750 315Q807 305 859 321L883 337M678 333Q700 322 727 333',ink,10);
 face+=P('M578 387Q608 399 642 386M753 386Q785 400 816 387','#9F694C',3.3,'opacity=".55"');
 face+=tear(586,t,e,0)+tear(812,t,e,.73);
 const wobble=(1.2+e.cry*1.8)*Math.sin(t*15),corner=522,crest=corner-e.frown*29;
 if(amp>.065){const h=6+25*amp+9*e.cry;
  face+=`<path d="M650 ${corner}Q705 ${crest} 759 ${corner}Q738 ${corner+h} 705 ${corner+h+2+wobble}Q675 ${corner+h} 650 ${corner}Z" fill="#301D1B" stroke="${ink}" stroke-width="5"/>`;
  face+=`<path d="M683 ${corner+h-2}Q705 ${corner+h-10} 729 ${corner+h-2}" fill="none" stroke="#B97670" stroke-width="5" stroke-linecap="round" opacity=".7"/>`;
 }else face+=P(`M651 ${corner+wobble*.35}Q705 ${crest} 760 ${corner-wobble*.35}`,ink,6);
 face+=P('M647 518l-5 11M763 518l5 11',ink,3.5);
 const defs=`<defs>
 <clipPath id="sad13-head"><path d="M401 229Q385 138 532 58Q638-4 748 20Q833 34 815 106Q895 80 934 169Q965 232 929 318L922 351Q950 362 932 422L921 471Q914 503 880 500Q870 560 796 606Q736 648 697 645Q654 638 588 606Q511 577 496 510Q454 524 440 478L421 429Q401 387 424 365L446 350Q419 305 406 267Z"/></clipPath>
 <filter id="sad13-feature-soft"><feGaussianBlur stdDeviation="2.5"/></filter>
 <filter id="sad13-mouth-soft"><feGaussianBlur stdDeviation="6"/></filter>
 <mask id="sad13-brow-clean"><path d="M535 315Q541 276 611 276Q664 276 673 316ZM729 315Q738 276 783 276Q839 276 852 315Z" fill="white" filter="url(#sad13-feature-soft)"/></mask>
 <mask id="sad13-eye-clean"><ellipse cx="613" cy="354" rx="49" ry="22" fill="white" filter="url(#sad13-feature-soft)"/><ellipse cx="782" cy="354" rx="47" ry="22" fill="white" filter="url(#sad13-feature-soft)"/></mask>
 <mask id="sad13-mouth-feather"><ellipse cx="705" cy="512" rx="112" ry="48" fill="white" filter="url(#sad13-mouth-soft)"/></mask>
 </defs>`;
 const tilt=e.tilt+.35*Math.sin(t*1.7)+e.cry*.35*Math.sin(t*11);
 return defs+G(config.presenter.x,config.presenter.y-2*emph,config.presenter.scale,0,G(-700,-355,1,0,body+G(700,640,1,tilt,G(-700,-640,1,0,face))));
}
module.exports={presenter,expression,keys,emphasis};
