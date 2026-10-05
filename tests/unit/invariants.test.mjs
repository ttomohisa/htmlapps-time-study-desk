import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCore} from '../helpers/load-core.mjs';
import {makeFixture,firstCycle} from '../helpers/fixtures.mjs';

test('complete cycle breakdown is an exact integer partition',()=>{
  const core=loadCore();
  for(const id of ['F1','F2','F3','F5']) for(const cycle of makeFixture(id).cycles) {
    if(cycle.status!=='complete') continue;
    const b=core.cycleBreakdown(cycle);
    assert.equal(b.elapsedUs,b.phaseUs+b.interruptionUs+b.unobservedUs,`${id}/${cycle.id}`);
  }
});

test('setCycleExclusion requires a reason, is reversible and does not delete rows',()=>{
  const core=loadCore(),{project,context,cycleId}=firstCycle(core);
  assert.equal(core.applyCommand(project,{type:'setCycleExclusion',cycleId,excluded:true,reason:'  '},context).ok,false);
  const r=core.applyCommand(project,{type:'setCycleExclusion',cycleId,excluded:true,reason:'条件が異なる'},context);assert.equal(r.ok,true);
  assert.equal(r.project.cycles[0].excluded,true);assert.equal(r.project.cycles[0].exclusionReason,'条件が異なる');
  assert.equal(core.summarize(r.project,r.project.procedures[0].id).cycleRows.length,1);
  const h=core.createHistory();h.push(r.undoPatch);assert.equal(JSON.stringify(h.undo(r.project).project),JSON.stringify(project));
  const include=core.applyCommand(r.project,{type:'setCycleExclusion',cycleId,excluded:false,reason:''},context);assert.equal(include.ok,true);assert.equal(include.project.cycles[0].exclusionReason,'');
});

test('boundary edits preserve the complete-cycle partition and Undo restores the exact project',()=>{
  const core=loadCore(),{project,context,cycleId}=firstCycle(core),boundaryId=project.cycles[0].boundaries[1].id;
  const r=core.applyCommand(project,{type:'moveBoundary',cycleId,boundaryId,timeUs:7000000},context);assert.equal(r.ok,true);
  const b=core.cycleBreakdown(r.project.cycles[0]);assert.equal(b.elapsedUs,34000000);assert.equal(b.elapsedUs,b.phaseUs+b.interruptionUs+b.unobservedUs);
  const h=core.createHistory();h.push(r.undoPatch);assert.equal(JSON.stringify(h.undo(r.project).project),JSON.stringify(project));
});
