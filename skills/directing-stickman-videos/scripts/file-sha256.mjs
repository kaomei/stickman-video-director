import {createHash} from 'node:crypto';
import {closeSync, openSync, readSync} from 'node:fs';

export function hashFile(file) {
  const hash = createHash('sha256');
  const buffer = Buffer.allocUnsafe(256 * 1024);
  const fd = openSync(file, 'r');
  try {
    for (let bytes; (bytes = readSync(fd, buffer)) > 0;) {
      hash.update(buffer.subarray(0, bytes));
    }
    return hash.digest('hex');
  } finally {
    closeSync(fd);
  }
}
