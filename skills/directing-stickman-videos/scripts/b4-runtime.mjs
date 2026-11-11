// Provider-independent B1–B4 native-rate tracks; B4 identity remains style-scoped.
import {verifyB4StyleLock} from './b4-style-lock.mjs';

export const BRIAN = {name: 'Brian', id: 'nPczCjzI2devNBz1zQrb'};
const text = value => typeof value === 'string' && value.trim().length > 0;
function number(value, label, min = 0, max = Infinity) {
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`Invalid audio ${label}`);
  return value;
}
function fields(value, allowed, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !allowed.includes(k))) throw new Error(`Unsupported ${label} fields; native source rate is required`);
}

export function prepareB4(p, context) {
  const {assets} = context;
  const lock = verifyB4StyleLock();
  for (const item of [...lock.references, lock.prompt]) assets.add(item.path);
  if (!((p.voice.name === BRIAN.name && p.voice.id === BRIAN.id) ||
    (text(p.voice.user_override) && text(p.voice.name) && text(p.voice.id)))) throw new Error('B4 requires verified Brian identity or an explicit narrator user_override');
  if ((p.voice.lead ?? 0) > 0.1 && !text(p.opening_audio_override)) throw new Error('B4 has no silent title pad; remove voice lead or record opening_audio_override');
  return prepareAudioTracks(p, context);
}

// Provider-independent local tracks shared by B1–B4. B4 identity/visual gates stay above.
export function prepareAudioTracks(p, {base, duration, rangeEnd, assets, mediaPath, probe}) {
  if (p.voice.contains_sfx !== undefined && typeof p.voice.contains_sfx !== 'boolean') throw new Error(`${p.style} contains_sfx must be boolean`);
  for (const key of ['ambience', 'dialogue', 'audio_cuts']) if (p[key] !== undefined && !Array.isArray(p[key])) throw new Error(`${p.style} ${key} must be an array`);
  const active = (list, time) => (list || []).filter(item => !item || !Number.isFinite(item[time]) || item[time] < rangeEnd);
  const clip = (item, bed = false) => {
    fields(item, bed ? ['path', 'start', 'end', 'gain', 'offset', 'loop', 'fadeIn', 'fadeOut'] :
      ['kind', 'path', 'time', 'gain', 'offset', 'duration', 'fadeIn', 'fadeOut', 'role'], 'audio clip');
    const start = number(bed ? item.start : item.time, 'audio start', 0, duration);
    number(item.gain, 'audio gain', 0, bed ? 0.2 : 1);
    const source = mediaPath(base, item.path), info = probe(source);
    if (!info.streams.some(s => s.codec_type === 'audio')) throw new Error('Audio clip has no audio stream');
    const sourceDuration = number(Number(info.format.duration), 'source duration', 0.001, 86400);
    const offset = number(item.offset ?? 0, 'source offset', 0, sourceDuration - 0.001);
    if (item.loop !== undefined && typeof item.loop !== 'boolean') throw new Error('Ambience loop must be boolean');
    const length = bed ? number(item.end, 'ambience end', start + 0.001, duration) - start :
      number(item.duration ?? sourceDuration - offset, 'clip duration', 0.001, sourceDuration - offset);
    if (bed && item.loop === false && length > sourceDuration - offset + 0.001) throw new Error('Non-looped ambience is shorter than its interval');
    number(item.fadeIn ?? 0, 'fade in', 0, length); number(item.fadeOut ?? 0, 'fade out', 0, length);
    assets.add(source);
    return {...item, ...(bed ? {end: Math.min(item.end, rangeEnd)} : {}),
      source, offset, length: Math.min(length, rangeEnd - start), envelopeLength: length, start};
  };
  const ambience = active(p.ambience, 'start').map(item => clip(item, true));
  const dialogue = active(p.dialogue, 'time').map(item => clip(item));
  const sfx = active(p.sfx, 'time').map(item => item?.kind === 'file' ? clip(item) : item);
  const audio_cuts = active(p.audio_cuts, 'start').map(item => {
    fields(item, ['start', 'end', 'reason', 'return_trigger'], 'audio cut');
    number(item.start, 'cut start', 0, duration); number(item.end, 'cut end', item.start + 0.001, duration);
    if (!text(item.reason) || !text(item.return_trigger)) throw new Error('Audio cut requires reason and return_trigger');
    return {...item, end: Math.min(item.end, rangeEnd)};
  });
  if (p.voice.contains_sfx && (sfx.length || ambience.length || dialogue.length || p.music || audio_cuts.length)) throw new Error('Already mixed master must not receive duplicate audio tracks/cuts');
  if (!p.voice.contains_sfx) {
    // Keep muted tracks editable, but do not count silence as a continuous bed.
    // Nonzero gain establishes structural coverage only: the source and encoded
    // mix still require audibility/listening review, not an arbitrary gain floor.
    const coverage = [...ambience.filter(item => item.gain > 0), ...audio_cuts].sort((a, b) => a.start - b.start);
    let end = 0;
    for (const interval of coverage) {
      if (interval.start > end + 0.002) throw new Error(`${p.style} ambience has an uncovered gap; author an unmuted subtle bed or motivated audio_cut (gain=0 does not cover the bed)`);
      end = Math.max(end, interval.end);
    }
    if (end < rangeEnd - 0.002) throw new Error(`${p.style} requires a subtle continuous ambience bed with nonzero gain, a motivated audio_cut or an already mixed master`);
  }
  return {ambience, dialogue, sfx, audio_cuts};
}

// Each input remains independent for repairs; no time-stretch or automatic ducking.
export function appendB4Audio(p, args, filters, mixes, backgrounds, index) {
  for (const [kind, clips] of [['bed', p.ambience], ['dialogue', p.dialogue], ['effect', p.sfx?.filter(s => s.kind === 'file')]]) {
    for (const clip of clips || []) {
      if (kind === 'bed' && clip.loop !== false) args.push('-stream_loop', '-1');
      args.push('-i', clip.source);
      const name = `b4track${index}`;
      const chain = [`atrim=start=${clip.offset}:duration=${clip.length}`, 'asetpts=PTS-STARTPTS', `volume=${clip.gain}`];
      if (clip.fadeIn) chain.push(`afade=t=in:st=0:d=${clip.fadeIn}`);
      if (clip.fadeOut) chain.push(`afade=t=out:st=${Math.max(0, clip.envelopeLength - clip.fadeOut)}:d=${clip.fadeOut}`);
      chain.push(`adelay=${Math.round(clip.start * 1000)}:all=1`);
      filters.push(`[${index++}:a]${chain.join(',')}[${name}]`);
      (kind === 'dialogue' ? mixes : backgrounds).push(`[${name}]`);
    }
  }
  return index;
}
export const appendAudioTracks = appendB4Audio;
