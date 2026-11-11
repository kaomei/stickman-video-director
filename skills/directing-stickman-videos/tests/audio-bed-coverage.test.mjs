import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {prepareAudioTracks, appendAudioTracks} from '../scripts/b4-runtime.mjs';

// Metadata-only unit fixtures. A positive gain is not proof that a source file
// or final encoded mix is perceptibly audible; those retain separate review.
const duration = 4;
const bed = (gain, start = 0, end = duration) => ({path: 'bed.wav', start, end, gain});
const cut = (start = 0, end = duration) => ({start, end, reason: 'Story-motivated dropout', return_trigger: 'Scene resumes'});
function prepare(style, input = {}) {
  const assets = new Set();
  const tracks = prepareAudioTracks({style, voice: {}, ...input}, {
    base: '/offline-unit-fixture', duration, rangeEnd: duration, assets,
    mediaPath: (base, source) => path.join(base, source),
    probe: () => ({streams: [{codec_type: 'audio'}], format: {duration: String(duration)}}),
  });
  return {tracks, assets};
}

for (const style of ['B1', 'B2', 'B3', 'B4']) {
  test(`${style}: zero-gain ambience cannot satisfy the continuous bed requirement`, () => {
    assert.throws(() => prepare(style, {ambience: [bed(0)]}), /continuous ambience bed with nonzero gain/);
  });
  test(`${style}: retained muted track does not invalidate an unmuted covering bed`, () => {
    const {tracks, assets} = prepare(style, {ambience: [bed(0), bed(.01)]});
    assert.equal(tracks.ambience.length, 2);
    assert.deepEqual(tracks.ambience.map(item => item.gain), [0, .01]);
    assert.equal(assets.size, 1);
  });
  test(`${style}: motivated cut can cover an interval with a muted bed`, () => {
    const {tracks} = prepare(style, {ambience: [bed(0)], audio_cuts: [cut()]});
    assert.equal(tracks.audio_cuts.length, 1);
    assert.equal(tracks.ambience[0].gain, 0);
  });
  test(`${style}: a muted segment cannot bridge unmuted beds`, () => {
    assert.throws(() => prepare(style, {ambience: [bed(.01, 0, 1), bed(0, 1, 3), bed(.01, 3, 4)]}), /uncovered gap.*gain=0/);
  });
  test(`${style}: a motivated cut bridges a deliberate gap without muting narration`, () => {
    const {tracks} = prepare(style, {
      ambience: [bed(.01, 0, 1), bed(0, 1, 3), bed(.01, 3, 4)], audio_cuts: [cut(1, 3)],
      dialogue: [{path: 'dialogue.wav', time: 1, duration: 2, gain: .3, role: 'caller'}],
    });
    assert.equal(tracks.dialogue[0].gain, .3);
    assert.deepEqual(tracks.audio_cuts.map(({start, end}) => [start, end]), [[1, 3]]);
  });
}

test('bed coverage has no arbitrary positive gain floor or audibility claim', () => {
  const {tracks} = prepare('B1', {ambience: [bed(.000001)]});
  assert.equal(tracks.ambience[0].gain, .000001);
  // This narrow metadata result must not be described as listening, source
  // silence detection, loudness acceptance or final-mix audibility evidence.
});

test('renderer retains zero gain rather than silently unmuting repaired tracks', () => {
  const {tracks} = prepare('B1', {ambience: [bed(0), bed(.01)]});
  const args = [], filters = [], mixes = [], backgrounds = [];
  assert.equal(appendAudioTracks(tracks, args, filters, mixes, backgrounds, 1), 3);
  assert.match(filters[0], /volume=0(?:,|\[)/);
  assert.match(filters[1], /volume=0\.01(?:,|\[)/);
  assert.equal(backgrounds.length, 2);
  assert.deepEqual(mixes, []);
});

test('already-mixed master still rejects duplicate tracks even when they are muted', () => {
  assert.throws(() => prepare('B4', {voice: {contains_sfx: true}, ambience: [bed(0)]}), /Already mixed master/);
  assert.deepEqual(prepare('B4', {voice: {contains_sfx: true}}).tracks.ambience, []);
});
