import fs from 'node:fs';
import path from 'node:path';

// Populate only synthetic protocol fixtures, never production review records.
export function fillSyntheticB3Review(review,plan) {
  if(!plan.b3_semantics)return;
  for(const item of review.shots) {
    const s=plan.shots.find(s=>s.id===item.id),semantic=plan.b3_semantics.shots.find(s=>s.id===item.id);
    if(!semantic||!item.b3_semantics)continue;
    const detail='Synthetic semantic protocol fixture; actual media meaning and viewing are not asserted.';
    const observation=(time,phase)=>({time,phase,detail,evidence_ids:[s.id+'-continuous']});
    for(const c of item.b3_semantics.events) {
      const e=semantic.events.find(e=>e.id===c.id);
      Object.assign(c,{status:'pass',spoken_meaning:detail,contribution:detail,observations:[observation(e.start,'before'),observation((e.start+e.end)/2,'during'),observation(e.end,'after')]});
    }
    for(const c of item.b3_semantics.graphics) {
      const g=semantic.graphics.find(g=>g.id===c.id);
      Object.assign(c,{status:'pass',use:detail,observations:[{time:Math.max(s.start,g.review_start??s.start,g.geometry?.completed_start??s.start),detail,evidence_ids:[s.id+'-continuous']}],
        ...(g.role==='connector'?{observed_source_id:g.source.layer_id,observed_target_id:g.target.layer_id,observed_relation:detail,observed_direction:g.directed?'source_to_target':'undirected'}:{})});
    }
  }
}

// Synthetic protocol data for offline CLI regressions only. This helper does not
// watch/listen, judge artwork, approve a user's sample or establish style quality.
// Production reviews must be completed independently from actual media playback.
export function writeSyntheticReferenceReview(dir, kind = 'preview') {
  const read = file => JSON.parse(fs.readFileSync(file,'utf8'));
  const evidenceDir = path.join(dir,'output',`${kind}-reference`);
  const evidence = read(path.join(evidenceDir,'evidence.json'));
  const review = read(path.join(evidenceDir,'review-template.json'));
  const project = read(path.join(dir,'project.json'));
  const detail = 'Synthetic engineering protocol only; no actual aesthetic review or viewing claim.';
  const observation = (time,id) => ({time,detail,evidence_ids:[id]});
  const videos = evidence.references.filter(r => r.kind==='video');
  const required = videos.filter(r => r.required_comparison===true);
  if (!videos.length) throw Error('Synthetic review requires a timed reference.');
  const compare = ref => ({reference_id:ref.id,start:0,end:Math.min(.1,ref.duration),detail});
  const first = videos[0], audible = videos.find(r => r.has_audio);
  review.author_id = evidence.plan?.author_id ?? review.author_id;
  review.reviewer = {id:'synthetic-independent-reviewer',kind:'agent',independent:true,method:detail};
  review.full_playback = {status:'pass',viewed_ranges:[{start:0,end:evidence.scope.end}],observations:[observation(0,'source-video')]};
  review.baseline_comparisons = (required.length?required:[first]).map(ref => ({...compare(ref),observations:[observation(.01,ref.id)]}));
  review.shots.forEach((shot,i) => {
    const sourceShot = evidence.plan?.shots?.find(s => s.id===shot.id) ?? project.shots[i];
    for (const [key,check] of Object.entries(shot.checks)) {
      check.status = 'pass';
      check.observations = [observation(sourceShot.start+.01,`${shot.id}-continuous`)];
      check.comparisons = [compare(key==='sound' && audible?audible:first)];
    }
  });
  fillSyntheticB3Review(review,evidence.plan);
  const file = path.join(dir,`${kind}-synthetic-review.json`);
  fs.writeFileSync(file,JSON.stringify(review,null,2)+'\n');
  return file;
}
