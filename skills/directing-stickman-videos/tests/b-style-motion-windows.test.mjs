import test from 'node:test';
import assert from 'node:assert/strict';
import {ROOT, hashFile, mediaPath} from '../scripts/autopilot-core.mjs';
import {painter} from '../scripts/autopilot-render.mjs';
import {prepareBStyleQuality, checkBStyleMotionPaint} from '../scripts/b-style-quality.mjs';

const motion = {role:'prop',reason:'Synthetic local-motion regression only, not creative acceptance'};
const image = (id='prop',duration=4,delta=200) => ({id,type:'image',path:'@b1/idea-bulb-crayon.png',x:300,y:100,w:180,
  motion,keys:[{t:0,x:300},{t:duration,x:300+delta}]});
function project(style,layer=image(),duration=4) {
  return {style,base:ROOT,width:640,height:360,fps:12,rangeEnd:duration,grid:false,television:{enabled:false},
    shots:[{start:0,end:duration,layers:[layer]}],captions:[]};
}
function prepare(p) {p.motion_intervals=prepareBStyleQuality(p,{root:ROOT,hashFile,mediaPath});return p;}

for (const style of ['B1','B2','B3']) {
  test(`${style} cannot credit a 60s span for a two-pixel endpoint drift`,async()=>{
    const p=prepare(project(style,image('slow',60,2),60));
    assert.equal(p.motion_intervals[0].end,60,'Structural keys alone are insufficient');
    await assert.rejects(checkBStyleMotionPaint(p,await painter(p)),/bounded window 0.00/);
  });
  test(`${style} records bounded-window evidence for visible story-local movement`,async()=>{
    const p=prepare(project(style));
    const evidence=await checkBStyleMotionPaint(p,await painter(p));
    assert.ok(evidence.windows.length>2);
    assert.ok(evidence.windows.every(w=>w.end-w.start<=2.5 && w.changed_pixels>=8));
    assert.equal(evidence.windows.at(-1).end,4);
    assert.equal(evidence.sample_step,.25);
  });
}
test('B3 rejects full-scene wrappers, nested inherited scale and multipart scene groups',()=>{
  const group={id:'scene',type:'group',motion,keys:[{t:0,x:0},{t:4,x:100}],children:[{type:'image',path:'@b1/idea-bulb-crayon.png',w:1280,h:720}]};
  assert.throws(()=>prepare(project('B3',group)),/scene-scale group/);
  const scaled={type:'group',scaleX:4,children:[{...group,children:[{type:'rect',w:300,h:100}]}]};
  assert.throws(()=>prepare(project('B3',scaled)),/scene-scale group/);
  const composite={...group,children:[{type:'rect',w:400,h:100},{type:'rect',x:880,w:400,h:100}]};
  assert.throws(()=>prepare(project('B3',composite)),/scene-scale group/);
});
test('B3 accepts an independent local actor group rather than banning groups',async()=>{
  const p=prepare(project('B3',{id:'actor',type:'group',x:300,y:100,motion,keys:[{t:0,x:300},{t:4,x:500}],
    children:[{type:'ellipse',w:60,h:60,fill:'#eeeeee'},{type:'rect',x:15,y:60,w:30,h:80,fill:'#cccccc'}]}));
  const evidence=await checkBStyleMotionPaint(p,await painter(p));
  assert.ok(evidence.windows.every(w=>w.id==='actor'&&w.changed_pixels>=8));
});
test('B3 camera ancestor cannot supply the declared child motion pixel change',async()=>{
  const child=image('child',60,2),p=prepare(project('B3',{type:'group',keys:[{t:0,x:0},{t:60,x:800}],children:[child]},60));
  const draw=await painter(p),a=Buffer.from(draw(0,{focusIds:['child']}).data()),b=draw(2.25,{focusIds:['child']}).data();
  assert.notDeepEqual(a,b,'The parent actually moves, but cannot rescue the local child');
  await assert.rejects(checkBStyleMotionPaint(p,draw),/bounded window 0.00/);
});
test('B3 title-only group motion cannot rescue a static principal picture',async()=>{
  const p=prepare(project('B3',{id:'title-wrapper',type:'group',motion,keys:[{t:0,x:50},{t:4,x:250}],
    children:[{type:'text',text:'Not principal-picture animation',w:600,size:40,y:150}]}));
  await assert.rejects(checkBStyleMotionPaint(p,await painter(p)),/pixel change/);
});
test('B3 inherited group visibility limits motion coverage',()=>{
  assert.throws(()=>prepare(project('B3',{type:'group',from:3,children:[image()]})),/inactive/);
});

function semanticProject({end=4,role}={}) {
  const layer=image('explained-prop'),p=project('B3',layer);
  p.captions=[{start:0,end:4,text:'Synthetic motion coverage fixture only.'}];
  p.shots[0].b3_semantics={events:[{id:'change',cue_index:0,kind:'action',layer_ids:[layer.id],start:0,end,before:'Synthetic prop starts at its initial position.',after:'Synthetic prop reaches its new position.',purpose:'Synthetic protocol for useful event coverage, not a creative claim.'}],graphics:role?[{id:layer.id,role}]:[]};
  return p;
}
test('B3 counts only meaningful event windows rather than an entire off-event loop',()=>{
  assert.throws(()=>prepare(semanticProject({end:.5})),/inactive/);
  const p=prepare(semanticProject());
  assert.deepEqual(p.motion_intervals.map(({start,end})=>({start,end})),[{start:0,end:4}]);
});
test('B3 decoration and emphasis cannot supply principal motion even with action metadata',()=>{
  for(const role of ['decoration','emphasis'])assert.throws(()=>prepare(semanticProject({role})),/inactive/);
});
