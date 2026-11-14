'use strict';
// New dependency-free study wrapper; not the approved full-film compositor.
const fs = require('node:fs');
const stage = require('./stage.cjs');
const LAST_TIME = 340 / 30;
function frame(t) {
  if (!Number.isFinite(t) || t < 0 || t > LAST_TIME) throw Error('Choose a source time between 0 and 340/30 seconds.');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="#EBE7E1"/>${stage.scene(t)}</svg>`;
}
if (require.main === module) {
  const t = Number(process.argv[2] ?? '5.2'), svg = frame(t), output = process.argv[3];
  if (output) fs.writeFileSync(output, svg + '\n');
  else process.stdout.write(svg + '\n');
}
module.exports = {frame, LAST_TIME};
