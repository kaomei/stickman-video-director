#!/usr/bin/env node
// Installed B8 route. It never falls through to the flattened B1–B4 painter.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
export function runB8(command, args = []) {
  const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'b8_workflow.py');
  const pythonFlag=args.indexOf('--python');
  const python=pythonFlag>=0?args[pythonFlag+1]:(process.env.B8_PYTHON || 'python3');
  const clean=pythonFlag>=0?args.filter((_,i)=>i!==pythonFlag && i!==pythonFlag+1):args;
  const result=spawnSync(python,[script,command,...clean],{stdio:'inherit',env:process.env});
  if(result.error) throw result.error;
  return result.status ?? 1;
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try { process.exitCode=runB8(process.argv[2]||'help',process.argv.slice(3)); }
  catch(e) { console.error(e.message);process.exitCode=1; }
}
