// Technical blocking example, not a finished new-topic film or an approved script.
// Own assets may replace painted pixels; keep B6's brush/lighting grammar.
export function frame({ctx,t,plan,images,tools,width,height}) {
  const shot=plan.shots.find(s=>s.start<=t&&t<s.end)??plan.shots.at(-1);
  const camera=tools.keyed(t-shot.start,shot.camera.keys);
  ctx.fillStyle='#ead9bb';ctx.fillRect(0,0,width,height);
  tools.paintedWorld(ctx,images['hotel-panorama'],camera,width,height);
  // All positions are world positions; neither person inherits camera oscillation.
  const hero={...shot.staging.hero,kind:'hero',view:t<1.2?'side':'front',distance:0};
  const buyer={...shot.staging.buyer,kind:'buyer',view:'front',expression:t>=4.2?'greedy':'neutral'};
  // One shared paper/contact coordinate, with approach -> contact -> release.
  // Its two grip points feed both wrists, so it cannot drift away from a hand.
  const contact=3,release=3.6,state=tools.handoffState(t,contact,release);
  const paper={x:tools.mix(hero.x+180,buyer.x-180,tools.ease((t-2.1)/1.5)),y:525,z:hero.z};
  const hand=(actor,point)=>[(point.x-actor.x)/(actor.size??1),-(point.y-actor.y)/(actor.size??1)];
  const hGrip=hand(hero,{...paper,x:paper.x-40}),bGrip=hand(buyer,{...paper,x:paper.x+40});
  const hRest=[195,-370],bRest=[-165,-300];
  const blend=(a,b,u)=>a.map((n,i)=>tools.mix(n,b[i],u));
  // The template's narrower grip movement is deliberately staged within arm reach.
  const approach=tools.ease((t-2.1)/.9),recover=tools.ease((t-release)/.5);
  hero.wrists=[[-100,-330],state==='receiver'?blend(hGrip,hRest,recover):blend(hRest,hGrip,approach)];
  buyer.wrists=[state==='giver'?blend(bRest,bGrip,approach):bGrip,[125,-310]];
  const actors=[hero,buyer].sort((a,b)=>b.z-a.z);
  for(const a of actors)tools.paintedActor(ctx,images,a,camera,width,height);
  tools.billboard(ctx,images.table,{x:shot.tableX??40,y:0,z:hero.z-80},650,camera,width,height,{anchorY:1});
  if(t>=2.1)tools.billboard(ctx,images.letter,paper,135,camera,width,height);
  // Near dressing has its own depth and can occlude the far world during a track.
  tools.billboard(ctx,images['foreground-lamp'],{x:shot.lampX??-950,y:0,z:-500},160,camera,width,height,{anchorY:1});
}
