#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const stage=require('./stage.cjs'),renderer=require('./renderer.cjs');
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manifest=require('./source-manifest.json');
for(const item of manifest.files)assert.equal(sha(path.join(__dirname,item.path)),item.sha256,`Source changed: ${item.path}`);
function finite(v){if(typeof v==='number')assert(Number.isFinite(v));else if(v&&typeof v==='object')for(const x of Object.values(v))finite(x);}
let maxBoneError=0;
for(let i=0;i<1001;i++){
 const t=i/100,q=stage.inspect(t);finite(q);
 for(const [chains,length]of[[q.arms,120],[q.legs,155]])for(const chain of chains)for(let j=1;j<3;j++)maxBoneError=Math.max(maxBoneError,Math.abs(Math.hypot(chain[j].x-chain[j-1].x,chain[j].y-chain[j-1].y)-length));
 const svg=stage.draw(t);assert(!/NaN|Infinity|undefined/.test(svg),`Malformed frame ${t}`);
}
assert(maxBoneError<1e-8);
assert(stage.inspect(2.72).pawWristGap<1e-8,'Front paw must meet wrist');
function bookGrip(b){const x=(76+(10-76)*b.fold)*b.scale,y=38*b.scale,a=b.angle*Math.PI/180;return{x:b.x+x*Math.cos(a)-y*Math.sin(a),y:b.y+x*Math.sin(a)+y*Math.cos(a)};}
for(const t of[5.74,6.78,7.22,7.39,7.62,7.90]){const q=stage.inspect(t),grip=bookGrip(q.book);assert(Math.hypot(grip.x-q.near.x,grip.y-q.near.y)<1e-8,'Reading wrist must still own book');}
for(const t of[6.78,7.22,7.39,7.62,7.90,8.45,9.35]){const q=stage.inspect(t),d=q.dog,x=-112*d.scale*d.sx,y=(-12+24*d.relax+(d.chinLift||0))*d.scale*d.sy,a=d.angle*Math.PI/180;assert(Math.hypot(d.x+x*Math.cos(a)-y*Math.sin(a)-q.near.x,d.y+x*Math.sin(a)+y*Math.cos(a)-q.near.y)<1e-8,'Chin support must share hand target');}
const launchA=stage.inspect(.759999).pawWorld,launchB=stage.inspect(.76).pawWorld;
assert(Math.max(...launchA.map((p,i)=>Math.hypot(p.x-launchB[i].x,p.y-launchB[i].y)))<.1,'No launch support jump');
assert.equal(stage.events.readingAttempt,7.22);assert.equal(stage.events.bookSeat,8.45);assert.equal(stage.events.petEnd,9.35);
for(const t of[0,1.22,2.72,4.84,5.5,6.78,7.39,8.45,9.35])assert(renderer.frame(t).subarray(0,4).equals(Buffer.from('<svg')));
console.log(JSON.stringify({passed:true,dense_samples:1001,max_human_bone_error:maxBoneError,shared_contact_checks:['paw-wrist','reading-hand-book','chin-support-hand','continuous-launch'],source_files:manifest.files.length,limits:'Source/hash/geometry checks only; dog legs are drawn curves, not certified anatomical bones. No continuous film viewing or sound listening is asserted.'},null,2));
