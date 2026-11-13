// B6: painted pixels remain the artwork; code owns staging, contacts and camera.
// No generation calls and no implicit idle motion.
export const mix = (a, b, u) => a + (b - a) * u;
export const ease = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
export function keyed(t, keys) {
  if (!keys?.length) throw new Error('Authored keyframes required');
  if (t <= keys[0].t) return {...keys[0]};
  for (let i = 1; i < keys.length; i++) if (t < keys[i].t) {
    const a = keys[i - 1], b = keys[i], u = ease((t - a.t) / (b.t - a.t));
    return Object.fromEntries(Object.keys(b).map(k => [k, typeof b[k] === 'number' ? mix(a[k], b[k], u) : a[k]]));
  }
  return {...keys.at(-1)};
}
export function projectPoint(p, camera, width, height) {
  const yaw = (camera.yaw ?? 0) * Math.PI / 180, pitch = (camera.pitch ?? 0) * Math.PI / 180;
  const dx = p.x - camera.x, dy = p.y - camera.y, dz = p.z - camera.z;
  const x = dx * Math.cos(yaw) - dz * Math.sin(yaw), z0 = dx * Math.sin(yaw) + dz * Math.cos(yaw);
  const y = dy * Math.cos(pitch) - z0 * Math.sin(pitch), z = dy * Math.sin(pitch) + z0 * Math.cos(pitch);
  if (z <= 1) return null;
  const focal = height / (2 * Math.tan(camera.fov * Math.PI / 360)), scale = focal / z;
  return {x: width / 2 + x * scale, y: height / 2 - y * scale, scale, depth: z};
}
export function solveTwoBone(root, target, upper, lower, bend = 1) {
  const point = p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
  if (!point(root) || !point(target) || !Number.isFinite(upper) || !Number.isFinite(lower) || upper <= 0 || lower <= 0)
    throw new Error('Finite limb coordinates and positive fixed lengths required');
  if (bend !== 1 && bend !== -1) throw new Error('Limb bend must be the authored side: +1 or -1');
  const dx = target[0] - root[0], dy = target[1] - root[1], d = Math.hypot(dx, dy);
  if (d > upper + lower + 1e-6 || d < Math.abs(upper - lower) + 1e-6) throw new Error('Unreachable contact: restage instead of stretching a limb');
  const along = (upper * upper - lower * lower + d * d) / (2 * d), h = Math.sqrt(Math.max(0, upper * upper - along * along));
  return [root[0] + dx / d * along - dy / d * h * bend, root[1] + dy / d * along + dx / d * h * bend];
}
export const wheelAngle = (worldDistance, radius) => {
  if (!(radius > 0)) throw new Error('Positive wheel radius required');
  return worldDistance / radius;
};
// Derive phase from distance, not screen speed; a camera move never drives gait.
export function walkFoot(distance, stride = 55, leg = 0, direction = 1) {
  const stance = .65, cycle = 2 * stride / stance;
  const u = ((distance / cycle + leg * .5) % 1 + 1) % 1;
  if (u < stance) return {x: direction * stride * (1 - 2 * u / stance), lift: 0, contact: u < .11 ? 'heel' : u > .51 ? 'toe' : 'flat'};
  const q = (u - stance) / (1 - stance), tangent = -2 * stride * (1 - stance) / stance;
  return {x: direction * (-stride + 2 * stride * ease(q) + tangent * (2 * q ** 3 - 3 * q ** 2 + q)), lift: 18 * Math.sin(q * Math.PI) ** 1.25, contact: 'swing'};
}
export function handoffState(t, contact, release) {
  if (!(contact < release)) throw new Error('Contact must precede release');
  return t < contact ? 'giver' : t <= release ? 'both' : 'receiver';
}
// Bitmap strokes preserve the sampled brush pressure. Never randomize per frame.
export function ink(ctx, texture, a, b, width = 12) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  ctx.save(); ctx.translate(...a); ctx.rotate(Math.atan2(dy, dx) - Math.PI / 2);
  ctx.drawImage(texture, -width / 2, 0, width, Math.hypot(dx, dy) + .6); ctx.restore();
}
export function sprite(ctx, image, x, y, width, {anchorX = .5, anchorY = .5, angle = 0, flip = false} = {}) {
  const height = image.height * width / image.width;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); if (flip) ctx.scale(-1, 1);
  ctx.drawImage(image, -anchorX * width, -anchorY * height, width, height); ctx.restore();
}
function triangle(ctx, image, src, dst) {
  const [a,b,c] = src, [p,q,r] = dst, det = (b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y);
  if (Math.abs(det) < .001) return;
  const A = ((q.x-p.x)*(c.y-a.y)-(r.x-p.x)*(b.y-a.y))/det;
  const C = ((r.x-p.x)*(b.x-a.x)-(q.x-p.x)*(c.x-a.x))/det;
  const B = ((q.y-p.y)*(c.y-a.y)-(r.y-p.y)*(b.y-a.y))/det;
  const D = ((r.y-p.y)*(b.x-a.x)-(q.y-p.y)*(c.x-a.x))/det;
  ctx.save(); ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.lineTo(r.x,r.y); ctx.closePath(); ctx.clip();
  ctx.transform(A,B,C,D,p.x-A*a.x-C*a.y,p.y-B*a.x-D*a.y); ctx.drawImage(image,0,0); ctx.restore();
}
// Project a tessellated physical wall/floor, not a stretched final video.
export function paintedPlane(ctx, image, corners, camera, width, height, uv = [0,0,1,1], columns = 12, rows = 8) {
  const sample = (u,v) => {
    const p = Object.fromEntries(['x','y','z'].map(k => [k,mix(mix(corners[0][k],corners[1][k],u),mix(corners[3][k],corners[2][k],u),v)]));
    return {src:{x:mix(uv[0],uv[2],u)*image.width,y:mix(uv[1],uv[3],v)*image.height},dst:projectPoint(p,camera,width,height)};
  };
  for(let y=0;y<rows;y++) for(let x=0;x<columns;x++) {
    const p=[sample(x/columns,y/rows),sample((x+1)/columns,y/rows),sample((x+1)/columns,(y+1)/rows),sample(x/columns,(y+1)/rows)];
    for(const ids of [[0,1,2],[0,2,3]]) if(ids.every(i=>p[i].dst)) triangle(ctx,image,ids.map(i=>p[i].src),ids.map(i=>p[i].dst));
  }
}
export function paintedWorld(ctx, image, camera, width, height, {halfWidth=6500,wallHeight=3000,back=2400,front=-4000,floorLine=.70}={}) {
  const p=(x,y,z)=>({x,y,z});
  paintedPlane(ctx,image,[p(-halfWidth,wallHeight,back),p(halfWidth,wallHeight,back),p(halfWidth,0,back),p(-halfWidth,0,back)],camera,width,height,[0,0,1,floorLine]);
  paintedPlane(ctx,image,[p(-halfWidth,0,back),p(halfWidth,0,back),p(halfWidth,0,front),p(-halfWidth,0,front)],camera,width,height,[0,floorLine,1,1],16,24);
}
export function billboard(ctx,image,position,worldWidth,camera,width,height,opts={}) {
  const q=projectPoint(position,camera,width,height); if(q) sprite(ctx,image,q.x,q.y,worldWidth*q.scale,opts);
}
// Baseline rig is an example identity, not the identity of every future B6 cast.
// Re-author anchors for a new painted silhouette; do not auto-fit a different body.
export function paintedActor(ctx, images, actor, camera, width, height) {
  const q=projectPoint(actor,camera,width,height); if(!q) return;
  const buyer=actor.kind==='buyer', side=actor.view==='side', back=actor.view==='back', s=actor.size??1;
  const body=buyer?(side?'buyer-side-body':'buyer-body'):(back?'hero-back-body':side?'hero-side-body':'hero-body');
  const head=buyer?(side?'buyer-side-head':actor.expression==='greedy'?'buyer-greedy-head':'buyer-head'):(back?'hero-back-head':side?'hero-side-head':'hero-head');
  const get=name=>images[actor.art?.[name]??name];
  ctx.save();ctx.translate(q.x,q.y);ctx.scale(q.scale*s,q.scale*s);
  const shadow=ctx.createRadialGradient(0,2,0,0,2,90);shadow.addColorStop(0,'#50324845');shadow.addColorStop(1,'#50324800');ctx.fillStyle=shadow;ctx.fillRect(-100,-16,200,36);
  for(let leg=0;leg<2;leg++) {
    const foot=walkFoot(actor.distance??0,actor.stride??42,leg,actor.direction??1), ankle=[foot.x+(leg?7:-7),-foot.lift-12], hip=[leg?9:-9,buyer?-162:-196];
    // User-selected straighter side-view legs. Foot path, not an exaggerated knee pump.
    ink(ctx,get('ink-stroke'),hip,ankle,leg?12:10);
    sprite(ctx,get(leg?'shoe-right':'shoe-left'),ankle[0]+8,ankle[1]+8,65,{flip:leg===0});
  }
  const shoulders=buyer?[[-120,-535],[53,-535]]:side?[[-72,-606],[40,-606]]:[[-37,-598],[133,-623]];
  const wrists=actor.wrists??(buyer?[[-165,-300],[125,-310]]:[[-100,-330],[200,-370]]);
  const drawArm=i=>{const elbow=solveTwoBone(shoulders[i],wrists[i],170,170,i?1:-1);ink(ctx,get('ink-stroke'),shoulders[i],elbow);ink(ctx,get('ink-stroke'),elbow,wrists[i]);sprite(ctx,get('hero-hand'),...wrists[i],38);};
  drawArm(0);
  sprite(ctx,get(body),buyer?0:-5,buyer?-365:-416,buyer?(side?300:355):(side?245:340));
  drawArm(1);
  sprite(ctx,get(head),buyer?0:12,buyer?-745:-815,buyer?475:side?425:back?422:455,{angle:actor.headAngle??0});
  ctx.restore();
}
export function caption(ctx,cue,config,width,height) {
  if(!cue)return;
  ctx.font=`900 ${config.fontSize}px B6 Sans`;ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.lineJoin='round';
  if(/[\r\n]/.test(cue.text)||ctx.measureText(cue.text).width>width-config.side*2)throw new Error('B6 caption exceeds one line: choose a semantic break; do not shrink');
  ctx.shadowColor='#2f193c55';ctx.shadowBlur=3;ctx.shadowOffsetY=2;ctx.strokeStyle='#201a20';ctx.lineWidth=config.stroke;
  ctx.strokeText(cue.text,width/2,height-config.bottom);ctx.fillStyle='#fffefa';ctx.fillText(cue.text,width/2,height-config.bottom);ctx.shadowBlur=0;ctx.shadowOffsetY=0;
}
