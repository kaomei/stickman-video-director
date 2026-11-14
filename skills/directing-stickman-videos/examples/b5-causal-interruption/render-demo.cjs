#!/usr/bin/env node
'use strict';
// Resolves Sharp from the parent Skill's pinned package.json installation.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawn,spawnSync}=require('node:child_process');
const {once}=require('node:events');
const sharp=require('sharp'),renderer=require('./renderer.cjs');
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--output'){console.error('Usage: node render-demo.cjs --output /path/outside-example/demo.mp4');process.exit(2);}
const output=path.resolve(args[1]),base=fs.realpathSync(__dirname);
fs.mkdirSync(path.dirname(output),{recursive:true});
const realParent=fs.realpathSync(path.dirname(output));
if(realParent===base||realParent.startsWith(base+path.sep))throw Error('Keep generated video outside the source example');
if(fs.existsSync(output))throw Error('Output exists; choose a fresh path');
const child=spawn(process.env.FFMPEG||'ffmpeg',['-hide_banner','-loglevel','error','-f','image2pipe','-vcodec','png','-framerate',String(renderer.fps),'-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart','-n',output],{stdio:['pipe','ignore','pipe']});
let stderr='';child.stderr.on('data',b=>stderr+=b.toString());
const completion=new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',code=>code===0?resolve():reject(Error(`FFmpeg exit ${code}: ${stderr}`)));});
// Prevent an early pipe failure becoming an unhandled error while rasterizing.
child.stdin.on('error',()=>{});
(async()=>{try{
 const total=renderer.fps*renderer.duration;
 for(let i=0;i<total;i++){
  const png=await sharp(renderer.frame(i/renderer.fps)).png().toBuffer();
  if(!child.stdin.write(png))await once(child.stdin,'drain');
  if((i+1)%30===0)process.stderr.write(`Rendered ${i+1}/${total}\n`);
 }
 child.stdin.end();await completion;
 const result=spawnSync(process.env.FFPROBE||'ffprobe',['-v','error','-show_entries','format=duration:stream=codec_type,width,height,r_frame_rate,nb_frames','-of','json',output],{encoding:'utf8'});
 if(result.status!==0)throw Error(result.stderr||'FFprobe failed');
 const probe=JSON.parse(result.stdout),video=probe.streams.find(s=>s.codec_type==='video');
 if(video.width!==1920||video.height!==1080||video.nb_frames!=='300'||probe.streams.some(s=>s.codec_type==='audio'))throw Error('Unexpected demo output');
 const report={output,width:video.width,height:video.height,frames:Number(video.nb_frames),fps:video.r_frame_rate,duration:Number(probe.format.duration),audio_streams:0,sha256:crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex'),scope:'Encoded silent stage demonstration. This technical check is not continuous visual or audiovisual acceptance.'};
 fs.writeFileSync(output+'.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }catch(e){child.kill('SIGTERM');console.error(e.stack||e);process.exitCode=1;}})();
