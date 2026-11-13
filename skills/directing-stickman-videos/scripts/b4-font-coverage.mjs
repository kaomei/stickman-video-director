import fs from 'node:fs';

// Inspect the selected font itself: OS font fallback must not silently change a language's treatment.
export function requireB4Glyphs(file, text, label, style = 'B4') {
  const b = fs.readFileSync(file), tables = new Map();
  for (let i = 0; i < b.readUInt16BE(4); i++) {
    const at = 12 + 16 * i;
    tables.set(b.toString('ascii', at, at + 4), b.readUInt32BE(at + 8));
  }
  const cmap = tables.get('cmap');
  if (cmap === undefined) throw new Error(`${style} ${label}: selected font has no cmap`);
  const maps = [];
  for (let i = 0; i < b.readUInt16BE(cmap + 2); i++) {
    const r = cmap + 4 + i * 8, platform = b.readUInt16BE(r), encoding = b.readUInt16BE(r + 2);
    if (platform !== 0 && !(platform === 3 && [1, 10].includes(encoding))) continue;
    const at = cmap + b.readUInt32BE(r + 4), format = b.readUInt16BE(at);
    if (format === 12) maps.push(cp => {
      let lo = 0, hi = b.readUInt32BE(at + 12) - 1;
      while (lo <= hi) { const m = (lo + hi) >> 1, x = at + 16 + m * 12, start = b.readUInt32BE(x), end = b.readUInt32BE(x + 4);
        if (cp < start) hi = m - 1; else if (cp > end) lo = m + 1; else return b.readUInt32BE(x + 8) + cp - start !== 0; }
      return false;
    });
    if (format === 4) maps.push(cp => {
      if (cp > 65535) return false;
      const n = b.readUInt16BE(at + 6) / 2, ends = at + 14, starts = ends + 2 * n + 2, deltas = starts + 2 * n, offsets = deltas + 2 * n;
      for (let j = 0; j < n; j++) if (cp <= b.readUInt16BE(ends + 2 * j)) {
        if (cp < b.readUInt16BE(starts + 2 * j)) return false;
        const d = b.readInt16BE(deltas + 2 * j), offset = b.readUInt16BE(offsets + 2 * j);
        if (!offset) return ((cp + d) & 65535) !== 0;
        const address = offsets + 2 * j + offset + 2 * (cp - b.readUInt16BE(starts + 2 * j));
        const glyph = b.readUInt16BE(address); return glyph !== 0 && ((glyph + d) & 65535) !== 0;
      }
      return false;
    });
  }
  const missing = [...new Set([...text].filter(c => !/\s/u.test(c) && !maps.some(has => has(c.codePointAt(0)))))];
  if (missing.length) throw new Error(`${style} ${label}: selected font lacks glyphs ${missing.slice(0, 8).join(' ')}; choose an explicit story-matched font with full language coverage`);
}
