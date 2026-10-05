import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync('src/index.template.html', 'utf8');
test('foundation has Time Study Desk and a real video picker instead of the text starter', () => {
  assert.match(source, /Time Study Desk/);
  assert.match(source, /id="videoInput"[^>]*type="file"/);
  assert.doesNotMatch(source, /id="textInput"/);
});
test('the real DOM-free time core is present exactly once', () => {
  assert.equal(source.split('// TSD:CORE:BEGIN').length - 1, 1);
  assert.equal(source.split('// TSD:CORE:END').length - 1, 1);
});
