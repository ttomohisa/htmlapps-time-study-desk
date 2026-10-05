import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCore} from '../helpers/load-core.mjs';
import {firstCycle} from '../helpers/fixtures.mjs';
const plain=x=>JSON.parse(JSON.stringify(x));
function expanded(core) {const f=firstCycle(core); f.project.source.durationUs=180000000; return f;}
function run(core,p,ctx,c) {const r=core.applyCommand(p,c,ctx);assert.equal(r.ok,true,JSON.stringify(r));return r.project;}
test('repeats_procedure_without_reentering_names and does_not_auto_start_next_cycle',()=>{
 const core=loadCore();let {project:p,context}=expanded(core);const procedureId=p.procedures[0].id, original=JSON.stringify(p.cycles[0]);
 for (const times of [[39,44,55,65,72],[77,84,96,121,127]]) {
  p=run(core,p,context,{type:'startCycle',procedureId,timeUs:times[0]*1e6});const cycleId=p.cycles.at(-1).id;
  assert.equal(p.phases.length,4);assert.equal(p.cycles.at(-1).occurrences.length,4);
  for(const time of times.slice(1,-1)) p=run(core,p,context,{type:'markBoundary',cycleId,timeUs:time*1e6});
  const before=JSON.stringify(p);assert.equal(core.applyCommand(p,{type:'markBoundary',cycleId,timeUs:times.at(-1)*1e6},context).error.code,'END_REQUIRED');assert.equal(JSON.stringify(p),before);
  p=run(core,p,context,{type:'finishCycle',cycleId,timeUs:times.at(-1)*1e6});
  assert.equal(p.cycles.filter(c=>c.status==='open').length,0);
 }
 assert.equal(p.cycles.length,3);assert.equal(p.procedures.length,1);assert.equal(JSON.stringify(p.cycles[0]),original);
 assert.deepEqual(plain(p.cycles.map(c=>c.occurrences.map(o=>o.phaseId))),[...Array(3)].map(()=>plain(p.procedures[0].phaseIds)));
 assert.equal(new Set(p.cycles.flatMap(c=>c.occurrences.map(o=>o.id))).size,12);
 const rows=core.listCycles(p);assert.deepEqual(plain(rows.map(r=>r.elapsedUs)),[34e6,33e6,50e6]);
 assert.deepEqual(plain(rows.map(r=>r.gapBeforeUs)),[null,5e6,5e6]);
});
test('overlapping starts, edits and growth are rejected atomically',()=>{
 const core=loadCore();let {project:p,context}=expanded(core);const procedureId=p.procedures[0].id;
 for(const timeUs of [0,1,33e6]) {const saved=JSON.stringify(p);assert.equal(core.applyCommand(p,{type:'startCycle',procedureId,timeUs},context).ok,false);assert.equal(JSON.stringify(p),saved);}
 p=run(core,p,context,{type:'startCycle',procedureId,timeUs:39e6});const c=p.cycles.at(-1);
 assert.equal(core.applyCommand(p,{type:'startCycle',procedureId,timeUs:80e6},context).ok,false);
 assert.equal(core.applyCommand(p,{type:'finishCycle',cycleId:c.id,timeUs:40e6},context).ok,false);
 const r=core.applyCommand(p,{type:'moveBoundary',cycleId:p.cycles[0].id,boundaryId:p.cycles[0].boundaries.at(-1).id,timeUs:40e6},context);assert.equal(r.ok,false);
 p=run(core,p,context,{type:'closeIncomplete',cycleId:c.id,timeUs:40e6});
 p=run(core,p,context,{type:'startCycle',procedureId,timeUs:45e6});
 assert.equal(core.applyCommand(p,{type:'resumeCycle',cycleId:c.id},context).ok,false);
});
test('gap_is_not_part_of_either_cycle and adjacent ranges have zero gap',()=>{
 const core=loadCore();let {project:p,context}=expanded(core);p=run(core,p,context,{type:'startCycle',procedureId:p.procedures[0].id,timeUs:34e6});
 const rows=core.listCycles(p);assert.equal(rows[0].elapsedUs,34e6);assert.equal(rows[1].gapBeforeUs,0);assert.equal(rows[1].elapsedUs,0);
});
test('repeated cycle creation and completion round trip through differential Undo',()=>{
 const core=loadCore();const {project,context}=expanded(core),h=core.createHistory();
 const r=core.applyCommand(project,{type:'startCycle',procedureId:project.procedures[0].id,timeUs:39e6},context);assert.equal(r.ok,true);h.push(r.undoPatch);
 const u=h.undo(r.project);assert.equal(u.ok,true);assert.equal(JSON.stringify(u.project),JSON.stringify(project));
 assert.equal(JSON.stringify(h.redo(u.project).project),JSON.stringify(r.project));
});
