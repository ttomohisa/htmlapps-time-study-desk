import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadCore} from '../helpers/load-core.mjs';
import {firstCycle} from '../helpers/fixtures.mjs';

const code=r=>r.error?.code || r.issues?.[0]?.code;
test('round_trip_preserves_schema1_project and accepts the v0.2 fixture',()=>{
 const core=loadCore();
 assert.equal(typeof core.parseProject,'function');
 const {project}=firstCycle(core), text=core.serializeProject(project,'0.5.0');
 const parsed=core.parseProject(text); assert.equal(parsed.ok,true,JSON.stringify(parsed));
 assert.deepEqual(JSON.parse(JSON.stringify(parsed.value)),JSON.parse(text));
 const old=readFileSync('tests/fixtures/v0.2.0-first-cycle.tsd.json','utf8');
 const oldParsed=core.parseProject(old); assert.equal(oldParsed.ok,true,JSON.stringify(oldParsed));
 assert.equal(oldParsed.value.appVersion,'0.2.0');assert.equal(oldParsed.value.schemaVersion,1);
});

test('rejects malformed, future, corrupt and oversized imports without coercion',()=>{
 const core=loadCore();const {project}=firstCycle(core);const good=JSON.parse(core.serializeProject(project,'0.5.0'));
 assert.equal(code(core.parseProject('{bad')),'INVALID_JSON');
 const future=structuredClone(good);future.schemaVersion=2;assert.equal(code(core.parseProject(JSON.stringify(future))),'UNSUPPORTED_SCHEMA');
 const unknown=structuredClone(good);unknown.extra=true;assert.equal(core.parseProject(JSON.stringify(unknown)).ok,false);
 const negative=structuredClone(good);negative.cycles[0].boundaries[0].timeUs=-1;assert.equal(core.parseProject(JSON.stringify(negative)).ok,false);
 const duplicate=structuredClone(good);duplicate.phases[1].id=duplicate.phases[0].id;assert.equal(core.parseProject(JSON.stringify(duplicate)).ok,false);
 const oversized=' '.repeat(10*1024*1024+1);assert.equal(code(core.parseProject(oversized)),'ANALYSIS_FILE_LARGE');
});

test('parse result is a fresh allow-listed object and prototype keys are rejected',()=>{
 const core=loadCore();const {project}=firstCycle(core);const text=core.serializeProject(project,'0.5.0');
 const result=core.parseProject(text);assert.equal(result.ok,true);result.value.title='changed';assert.notEqual(project.title,'changed');
 const polluted=text.replace('{','{"__proto__":{"polluted":true},');
 assert.equal(core.parseProject(polluted).ok,false);assert.equal({}.polluted,undefined);
});
