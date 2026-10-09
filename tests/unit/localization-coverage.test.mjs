import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('src/index.template.html','utf8');
const translations=vm.runInNewContext(source.slice(source.indexOf('  const translations ='),source.indexOf('  const $ ='))+'\ntranslations');
test('every static label and accessibility key is translated in both languages',()=>{
 const keys=new Set([...source.matchAll(/data-i18n(?:-aria-label)?="([^"]+)"/g)].map(match=>match[1]));
 for(const language of ['ja','en'])for(const key of keys)assert.equal(typeof translations[language][key],'string',`${language}.${key}`);
 assert.deepEqual(Object.keys(translations.en).sort(),Object.keys(translations.ja).sort());
});
