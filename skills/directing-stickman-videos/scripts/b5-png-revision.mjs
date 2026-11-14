// Pure dependency/coverage rules. Files and complete current PNG provenance are
// validated by b5-png-review-gate before these rules are used.
const need = (ok, detail) => { if (!ok) throw Error('B5 PNG revision: ' + detail); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const concrete = value => typeof value === 'string' && value.trim().length > 0 &&
  !/^(pass|fail|unknown|ok|none|pending|通过|未知|无问题)[\s.!。！]*$/iu.test(value.trim());
const unique = ids => [...new Set(ids)];
export function assertB5RevisionInvariants(previous, current) {
  for (const key of ['config', 'config_sha256', 'visual_plan_sha256', 'preview_plan_sha256', 'transcript_sha256', 'plan_checkpoint'])
    need(same(previous[key], current[key]), key + ' changed; perform a new full review');
}
export function buildB5RevisionRequirements({previousImages, images, previousFiles, files, groups}) {
  need(same(previousImages.map(i => [i.id, i.frame_index, i.crop]), images.map(i => [i.id, i.frame_index, i.crop])),
    'selection/crop changed; perform a new full review');
  need(previousFiles.length === files.length, 'frame count changed; perform a new full review');
  const changedFrames = files.flatMap((file, index) => file.sha256 === previousFiles[index].sha256 ? [] : [index]);
  const changedImages = images.filter((image, i) => image.sha256 !== previousImages[i].sha256 || image.neutral_sha256 !== previousImages[i].neutral_sha256).map(i => i.id);
  const neighborIds = ids => unique(ids.flatMap(id => {
    const i = images.findIndex(image => image.id === id);
    return [images[i - 1]?.id, id, images[i + 1]?.id].filter(Boolean);
  }));
  const changedContext = neighborIds(changedImages);
  const uncertainContext = unique(groups.filter(g => g.key.startsWith('first_read/') && g.source.status !== 'pass').flatMap(g => g.dependencies));
  const items = groups.map(group => {
    const changedInRange = changedFrames.some(f => f >= group.start_frame && f <= group.end_frame);
    const affected = group.dependencies.filter(id => changedContext.includes(id));
    const unchanged = !changedInRange && !group.dependencies.some(id => changedImages.includes(id));
    const reused = group.source.status === 'pass' && unchanged;
    let required = [];
    if (!reused) {
      if (group.source.status === 'pass') required = affected.length ? affected : group.dependencies;
      else if (group.key === 'full_composition' && group.source.status === 'unknown' && uncertainContext.length)
        required = unique([...changedContext, ...uncertainContext]);
      else required = group.dependencies;
    }
    return {key: group.key, mode: reused ? 'reused' : 'reviewed', source_status: group.source.status,
      dependencies: group.dependencies.map(id => ({image_id: id, sha256: images.find(i => i.id === id).sha256,
        neutral_sha256: images.find(i => i.id === id).neutral_sha256})),
      required_current_view_ids: required, source_item_id: group.key};
  });
  const ranges = [];
  for (const index of changedFrames) {
    const last = ranges.at(-1);
    if (last && index === last[1] + 1) last[1] = index; else ranges.push([index, index]);
  }
  return {changed_frame_ranges: ranges, changed_image_ids: changedImages,
    required_current_view_ids: unique([...changedContext, ...items.flatMap(i => i.required_current_view_ids)]), items};
}
export function validateB5RevisionObservationCoverage(context, actual, confirmation, author) {
  const reviewer = confirmation.reviewer;
  need(actual.schema === 1 && actual.kind === 'b5-png-delta-context-review' && actual.status === 'pass' && actual.new_blind_read === false,
    'actual current-context delta pass required; do not claim a new blind read');
  need(reviewer && reviewer.id === actual.reviewer?.id && reviewer.id === context.previous_reviewer_id && reviewer.id !== author &&
    ['agent', 'human'].includes(reviewer.kind) && reviewer.independent === true && reviewer.viewed_images === true && concrete(reviewer.method),
  'same actual independent reviewer must confirm identity/viewing');
  const scope = confirmation.scope;
  need(scope?.script_timing_plan_layout_crop_unchanged === true && concrete(scope.detail),
    'actual reviewer must confirm unchanged semantic inputs; changed script/timing/plan/layout/crop needs full review');
  need(scope.prior_blocking_issues_resolved === true, 'prior blocking issues require explicit current-context resolution');
  need(scope.critical_anatomy_support_action_captions_resolved === true,
    'critical anatomy/support/action/caption unknown still blocks; nonblocking details cannot waive it');
  need(Array.isArray(actual.blocking_issues) && actual.blocking_issues.length === 0, 'current blocking/unknown critical issues prevent encode');
  need(same(actual.current_frame_ledger, context.current_frame_ledger), 'actual delta refers to a stale frame ledger');
  for (const ref of [context.previous.first_read, context.previous.review])
    need(actual.previous_reports?.some(prior => prior.path === ref.path && prior.sha256 === ref.sha256), 'actual delta does not reference its actual prior reading/review');
  need(Array.isArray(actual.viewed_images) && Array.isArray(actual.results) && actual.results.length > 0, 'actual viewed PNG SHA records and concrete results required');
  const viewed = new Set();
  for (const image of actual.viewed_images) {
    const current = context.images.find(i => i.id === image.image_id);
    need(current && !viewed.has(current.id) && image.frame_index === current.frame_index && image.full_png_sha256 === current.sha256,
      'viewed image missing/current SHA mismatch: ' + image.image_id);
    viewed.add(current.id);
  }
  const observed = new Set();
  for (const result of actual.results) {
    need((result.status === undefined || result.status === 'pass') && concrete(result.detail) && Array.isArray(result.evidence_ids) && result.evidence_ids.length > 0 &&
      result.evidence_ids.every(id => viewed.has(id)), 'critical unknown/fail or nonconcrete/unviewed current result');
    result.evidence_ids.forEach(id => observed.add(id));
  }
  for (const id of context.requirements.required_current_view_ids)
    need(viewed.has(id) && observed.has(id), 'changed/uncertain PNG or immediate boundary neighbor was not actually reviewed: ' + id);
  for (const finding of actual.non_blocking_items || []) {
    need(scope.non_blocking_details_do_not_change_meaning === true && (finding.status === undefined || finding.status === 'unknown') && concrete(finding.detail) &&
      Array.isArray(finding.evidence_ids) && finding.evidence_ids.length > 0 && finding.evidence_ids.every(id => viewed.has(id)),
    'nonblocking finding must be a concrete observed nonsemantic detail; critical anatomy/support/action/caption uncertainty still blocks');
  }
  return {reviewer, items: context.requirements.items.map(item => ({...item, status: 'pass',
    source_review_sha256: context.previous.review.sha256,
    actual_review_sha256: item.mode === 'reviewed' ? context.actual_review_sha256 : undefined})),
    non_blocking_findings: (actual.non_blocking_items || []).map(item => ({...item, status: 'unknown', blocking: false, semantic_impact: 'none'}))};
}
