import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadCore} from '../helpers/load-core.mjs';
import {setupProject} from '../helpers/fixtures.mjs';
test('v0.3.0 metadata and new project agree while schema remains one',()=>{
 const read=path=>JSON.parse(readFileSync(path,'utf8'));
 for(const file of ['app.config.json','package.json','package-lock.json'])assert.equal(read(file).version,'0.3.0',file);
 assert.equal(read('package-lock.json').packages[''].version,'0.3.0');
 const {project}=setupProject(loadCore());assert.equal(project.appVersion,'0.3.0');assert.equal(project.schemaVersion,1);
});
