import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { loadCore } from '../helpers/load-core.mjs';
import { makeFixture } from '../helpers/fixtures.mjs';

const clone=value=>JSON.parse(JSON.stringify(value));

test('1000 cycles and 10000 spans summarize without dropping records',()=>{
  const core=loadCore(); const project=makeFixture('F1');
  project.source.durationUs=30_000_000_000; project.cycles=[];
  const phaseIds=project.phases.map(p=>p.id);
  for(let c=0;c<1000;c++){
    const start=c*20_000_000;
    const occurrences=phaseIds.map((phaseId,i)=>({id:`c${c}-o${i}`,phaseId,planned:true,resolution:'measured',note:''}));
    const boundaries=[]; for(let i=0;i<=10;i++) boundaries.push({id:`c${c}-b${i}`,timeUs:start+i*1_000_000});
    const spans=[]; for(let i=0;i<10;i++) spans.push({id:`c${c}-s${i}`,kind:'phase',occurrenceId:occurrences[i%4].id,note:''});
    project.cycles.push({id:`cycle-${c}`,procedureId:'procedure-1',status:'complete',boundaries,spans,occurrences,cursor:null,excluded:false,exclusionReason:'',note:''});
  }
  const valid=core.validateProject(project); assert.equal(valid.ok,true,JSON.stringify(valid));
  const started=performance.now(); const summary=core.summarize(project,'procedure-1'); const elapsed=performance.now()-started;
  assert.equal(summary.counts.recorded,1000); assert.equal(summary.counts.included,1000);
  assert.equal(project.cycles.reduce((n,c)=>n+c.spans.length,0),10000);
  assert.ok(elapsed<10000,`summary took ${elapsed.toFixed(1)}ms on this test runner`);
});
