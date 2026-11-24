#!/usr/bin/env node
// B8-only validation; the existing test entry and other production routes stay intact.
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const python=process.env.B8_PYTHON || 'python3';
const tests=fs.readdirSync(path.join(root,'tests')).filter(f=>/^b8.*\.test\.mjs$/.test(f)).map(f=>`tests/${f}`);
for (const [exe,args] of [[process.execPath,['--test',...tests]],[python,['-m','unittest','discover','-s','tests','-p','b8*_test.py']]]) {
  const result=spawnSync(exe,args,{cwd:root,stdio:'inherit',env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONPATH:[path.join(root,'scripts'),process.env.PYTHONPATH].filter(Boolean).join(path.delimiter)}});
  if(result.error){console.error(result.error.message);process.exit(1);}
  if(result.status!==0)process.exit(result.status || 1);
}
