import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCore} from '../helpers/load-core.mjs';
import {setupProject, firstCycle} from '../helpers/fixtures.mjs';
const plain = x => JSON.parse(JSON.stringify(x));
test('marks_four_steps_without_creating_fifth', () => {
  const core = loadCore();
  assert.equal(typeof core.createProject, 'function');
  const {project} = firstCycle(core), cycle = project.cycles[0];
  assert.deepEqual(plain(cycle.boundaries.map(b=>b.timeUs)),[0,6000000,18000000,28000000,34000000]);
  assert.equal(cycle.spans.length,4); assert.equal(project.phases.length,4);
  assert.equal(cycle.occurrences.length,4); assert.equal(cycle.status,'complete');
  assert.equal(cycle.cursor,null); assert.equal(project.procedures.length,1);
  assert.deepEqual(plain(project.procedures[0].phaseIds),plain(cycle.occurrences.map(o=>o.phaseId)));
  assert.equal(cycle.procedureId,project.procedures[0].id); assert.equal(core.validateProject(project).ok,true);
});
test('rejects_non_increasing_boundaries without mutating the project', () => {
  const core = loadCore(); assert.equal(typeof core.applyCommand,'function');
  const {project,context,cycleId} = firstCycle(core,false), saved=JSON.stringify(project);
  for (const timeUs of [28000000,27000000,-1,NaN,Infinity,1.2,60000001]) {
    const result=core.applyCommand(project,{type:'markBoundary',cycleId,timeUs},context);
    assert.equal(result.ok,false); assert.equal(JSON.stringify(project),saved);
  }
  assert.equal(core.applyCommand(project,{type:'teleport',cycleId},context).error.code,'UNKNOWN_COMMAND');
});
test('uses_media_time_not_watch_time and keeps integer microseconds', () => {
  const core=loadCore(); assert.equal(typeof core.applyCommand,'function');
  const runs=[];
  for (const rate of [.25,.5,1,2]) {
    const {project,context}=setupProject(core);
    const start=core.applyCommand(project,{type:'startCycle',timeUs:1234568,procedureId:null},context).project;
    const result=core.applyCommand(start,{type:'finishCycle',cycleId:start.cycles[0].id,timeUs:2345679},context);
    assert.equal(result.ok,true); runs.push(JSON.stringify(result.project));
  }
  assert.equal(new Set(runs).size,1);
});
test('start cannot create simultaneous or out-of-range cycles',()=>{
  const core=loadCore(); assert.equal(typeof core.createProject,'function');
  const {project,context}=setupProject(core);
  for (const timeUs of [-1,60000000,60000001]) assert.equal(core.applyCommand(project,{type:'startCycle',timeUs,procedureId:null},context).ok,false);
  const start=core.applyCommand(project,{type:'startCycle',timeUs:0,procedureId:null},context).project;
  assert.equal(core.applyCommand(start,{type:'startCycle',timeUs:1,procedureId:null},context).ok,false);
});
test('video end is incomplete and retains the pending occurrence for explicit resume',()=>{
  const core=loadCore(); assert.equal(typeof core.applyCommand,'function');
  const {project,context,cycleId}=firstCycle(core,false);
  const closed=core.applyCommand(project,{type:'closeIncomplete',cycleId,timeUs:60000000},context);
  assert.equal(closed.ok,true); const c=closed.project.cycles[0];
  assert.equal(c.status,'incomplete'); assert.equal(c.occurrences.at(-1).resolution,'pending');
  assert.equal(c.boundaries.at(-1).timeUs,60000000); assert.notEqual(c.cursor,null);
  assert.equal(core.applyCommand(closed.project,{type:'finishCycle',cycleId,timeUs:60000000},context).ok,false);
  const resumed=core.applyCommand(closed.project,{type:'resumeCycle',cycleId},context);
  assert.equal(resumed.ok,true); assert.equal(resumed.project.cycles[0].status,'open');
  assert.deepEqual(plain(resumed.project.cycles[0].boundaries),plain(c.boundaries));
});
test('phase limit rejects only the additional mark and still allows finishing',()=>{
  const core=loadCore(); assert.equal(typeof core.applyCommand,'function');
  const {project,context}=setupProject(core);
  let p=core.applyCommand(project,{type:'startCycle',timeUs:0,procedureId:null},context).project;
  const cycleId=p.cycles[0].id;
  for(let i=1;i<50;i++) p=core.applyCommand(p,{type:'markBoundary',cycleId,timeUs:i*1000000},context).project;
  assert.equal(p.phases.length,50);
  assert.equal(core.applyCommand(p,{type:'markBoundary',cycleId,timeUs:50000000},context).ok,false);
  assert.equal(core.applyCommand(p,{type:'finishCycle',cycleId,timeUs:50000000},context).ok,true);
});
