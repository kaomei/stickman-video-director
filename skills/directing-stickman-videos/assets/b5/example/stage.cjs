// Local V10: approved prop designs, stronger stored-force / contact / recovery.
const legacy=require('./stage-legacy.cjs'),gift=require('./stage-v7.cjs');
const source=t=>t>=2.16&&t<5.9?gift:legacy;
const E=require('./events.cjs');
module.exports={
 draw:(t,helpers)=>source(t).draw(t,helpers),
 inspect:t=>source(t).inspect(t),
 events:[...legacy.events.filter(e=>e.time<6||e.time>=8.32&&e.time<10.6||e.time>=14.04&&e.time<18),
 ...E.paperLands.map((time,i)=>({time,event:`paper layer ${i+1} contact; compression wave`})),
 {time:E.paperRelease,event:'staggered paper rebound and release'},
 {time:E.escape,event:'spring free and escape'},
 {time:E.contradiction,event:'fast contradiction stroke and body squash'},
 {time:E.bodyRebound,event:'elastic recovery and defensive settle'},
 {time:E.revelation,event:'protective curl on revelation'},
 {time:E.mirrorTouch,event:'mirror touch; contact compression and recoil'},
 {time:19.6,event:'retreat and inspect reflection'},
 {time:E.mirrorRetouch,event:'renewed glass contact'},
 {time:E.self,event:'hands return to self'},
 {time:E.you,event:'final YOU lands'}].sort((a,b)=>a.time-b.time),
 timing_comparison:[{revision:'V10',titles:'screen-space, outside action camera',paper:'22% height / 215% width impact, tall recoil, 145px escape arc',middle:'19% height impact -> 132% elastic rebound -> settle',gift:'72px drag hop; 205px travel; 24-degree lean',mirror:'touch -> 32px retreat and body lean -> inspect -> retouch -> hands to self',presenter:'same rig, mouth and gestures; scale 1.10 -> .84, shifted lower/right',voice:'unchanged'}]
};
