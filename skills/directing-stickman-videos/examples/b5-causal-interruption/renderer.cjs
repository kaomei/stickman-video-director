"use strict";
// Silent stage-only extraction. No presenter, speech, subtitles or paid audio.
const fs=require('node:fs'),path=require('node:path');
const stage=require('./stage.cjs');
const atlas=require('./title-atlas.json');
const W=1920,H=1080,INK='#1E1C1A',RED='#D7372C',PAPER='#EBE7E1';
const uri=file=>'data:image/png;base64,'+fs.readFileSync(path.join(__dirname,file)).toString('base64');
for(const a of Object.values(atlas))a.uri=uri(a.file);
const paper=uri('assets/paper.png');
const out=u=>1-(1-Math.max(0,Math.min(1,u)))**3;
function tile(text,x,baseline,color,id){const a=atlas[text];return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="${x-a.pad}" y="${baseline-a.baseline}" width="${a.image_width}" height="${a.image_height}"><image x="${x-a.pad}" y="${baseline-a.baseline}" width="${a.image_width}" height="${a.image_height}" href="${a.uri}"/></mask></defs><rect x="${x-a.pad}" y="${baseline-a.baseline}" width="${a.image_width}" height="${a.image_height}" fill="${color}" mask="url(#${id})"/>`;}
function title(t){const start=t<3.76?0:t<5.74?3.76:5.74,a=out((t-start)/.24);let s;
 if(t<3.76)s=`<g transform="translate(120 270) scale(.78) translate(-120 -270)">${tile('WHY YOUR',120,270,INK,'h0')+tile('LAP?',120+atlas['WHY YOUR'].width+26,270,RED,'h1')}</g>`;
 else if(t<5.74)s=tile('BEFORE',120,270,INK,'h0');
 else s=tile('ON YOUR@96',120,270,INK,'h0')+tile('LAP@96',120+atlas['ON YOUR@96'].width+24,270,RED,'h1');
 const u=out((t-(t<3.76?2.98:start+.10))/.19),x=t<3.76?519:t<5.74?120:441,w=t<3.76?175:t<5.74?335:130;
 if(u>0)s+=`<path d="M ${x} 290 Q ${x+w*.45} 283 ${x+w} 289" fill="none" stroke="${RED}" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-u}"/>`;
 return `<g opacity="${a}" transform="translate(0 ${12*(1-a)})">${s}</g>`;}
function render(t,withTitle=true){if(!Number.isFinite(t))throw Error('Time must be finite');t=Math.max(0,Math.min(9.999,t));return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${PAPER}"/><image width="${W}" height="${H}" href="${paper}" opacity=".42"/>${stage.draw(t)}${withTitle?title(t):''}</svg>`);}
module.exports={frame:t=>render(t),qualityFrame:t=>render(t,false),width:W,height:H,fps:30,duration:10};
