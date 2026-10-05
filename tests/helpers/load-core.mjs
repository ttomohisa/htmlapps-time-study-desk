import { readFileSync } from 'node:fs';
import vm from 'node:vm';
export function loadCore() {
  const html = readFileSync('src/index.template.html', 'utf8');
  const start = '// TSD:CORE:BEGIN', end = '// TSD:CORE:END';
  if (html.split(start).length !== 2 || html.split(end).length !== 2) throw new Error('Expected one actual CORE block');
  const source = html.split(start)[1].split(end)[0];
  return vm.runInNewContext(`${source}\nTsdCore`, { TextEncoder }, { timeout: 1000 });
}
