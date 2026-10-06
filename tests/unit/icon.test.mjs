import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

test('uses the approved Time Study Desk SVG as the single favicon and brand icon source',()=>{
  const bytes=readFileSync('assets/favicon.svg');
  assert.equal(createHash('sha256').update(bytes).digest('hex'),'f29a9790b5a9272b065bd13dcf59d9d4da5fc29bf7430c3881670d63e1766f45');
  const svg=bytes.toString('utf8');
  assert.match(svg,/viewBox="0 0 64 64"/);
  assert.match(svg,/<rect width="64" height="64" rx="16" fill="#0c6751"\/>/);
});
