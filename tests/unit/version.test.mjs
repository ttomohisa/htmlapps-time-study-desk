import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadCore} from '../helpers/load-core.mjs';
import {setupProject} from '../helpers/fixtures.mjs';
test('v1.0.1 metadata and new project agree while schema remains one',()=>{
 const read=path=>JSON.parse(readFileSync(path,'utf8'));
 for(const file of ['app.config.json','package.json','package-lock.json'])assert.equal(read(file).version,'1.0.1',file);
 assert.equal(read('package-lock.json').packages[''].version,'1.0.1');
 const {project}=setupProject(loadCore());assert.equal(project.appVersion,'1.0.1');assert.equal(project.schemaVersion,1);
});
