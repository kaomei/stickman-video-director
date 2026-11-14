'use strict';
// Neutral authoring starter. This is NOT the approved example stage.cjs.
// Read that actual source and the scene template, then author this script's
// semantic events. Pick its subjects, context, timing, holds and handoffs from
// the current narration. No default story or event count is supplied here.
// This local copy is independent of the installed Skill after initialization.
// Reuse its drawing/whole-pose components; choose the current script's own
// subjects, semantic substitutions, timing and native layout. See the installed
// references/b5-art-kit.md API guide; this starter supplies no gag.
const art = require('./runtime/b5-art-kit.cjs');
const clamp = (x, low = 0, high = 1) => Math.max(low, Math.min(high, x));
const easing = Object.freeze({linear:u=>u, in:u=>u*u*u, out:u=>1-(1-u)**3});
function tween(t, start, end, from, to, curve = 'linear') {
  if (![t,start,end,from,to].every(Number.isFinite) || end <= start || !Object.hasOwn(easing,curve)) throw Error('Invalid story-specific tween.');
  return from + (to-from) * easing[curve](clamp((t-start)/(end-start)));
}
function compose(...layers) { return layers.flat(Infinity).filter(value=>value!==null&&value!==undefined&&value!==false).join(''); }
function transform(body, {x=0,y=0,scale=1,rotate=0,opacity=1}={}) {
  if (![x,y,scale,rotate,opacity].every(Number.isFinite) || scale<=0 || opacity<0 || opacity>1) throw Error('Invalid story-specific transform.');
  return `<g opacity="${opacity}" transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})">${body}</g>`;
}
function scene(t) {
  if (!Number.isFinite(t) || t < 0) throw Error('Choose a nonnegative story time.');
  // Replace this explicit blocker with this story's visual-event composition.
  // A blank stage or copied sample gag must not masquerade as authored work.
  throw Error('B5 new-story stage has not been authored. Implement the current narration\'s visual events after studying the required real-source example.');
}
// draw keeps compatibility with the historical compositor's stage interface.
module.exports = {scene, draw:scene, compose, transform, tween, easing, art};
