import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCore} from '../helpers/load-core.mjs';
import {makeFixture} from '../helpers/fixtures.mjs';
const plain=value=>JSON.parse(JSON.stringify(value));

function summarize(id) {
  const core=loadCore(),project=makeFixture(id);
  assert.equal(core.validateProject(project).ok,true,`${id} fixture must be valid`);
  assert.equal(typeof core.summarize,'function','summarize must exist');
  return core.summarize(project,'procedure-1');
}

test('f1_means_include_interruption',()=>{
  const s=summarize('F1');
  assert.deepEqual(plain(s.counts),{recorded:3,included:3,excluded:0,incomplete:0});
  assert.deepEqual(plain(s.cycleTotals.elapsed),{n:3,meanUs:39000000,medianUs:34000000,minUs:33000000,maxUs:50000000});
  assert.equal(s.cycleTotals.recordedPhase.meanUs,34000000);
  assert.equal(s.cycleTotals.interruption.meanUs,5000000);
  assert.equal(s.cycleTotals.unobserved.meanUs,0);
  assert.equal(s.phaseStats['phase-1'].meanUs,6000000);
  assert.equal(s.phaseStats['phase-2'].meanUs,35000000/3);
  assert.equal(s.phaseStats['phase-3'].meanUs,10000000);
  assert.equal(s.phaseStats['phase-4'].meanUs,19000000/3);
});

test('f2_missing_step_does_not_enter_denominator',()=>{
  const s=summarize('F2');
  assert.equal(s.cycleTotals.elapsed.meanUs,35750000);
  assert.equal(s.cycleTotals.recordedPhase.meanUs,32000000);
  assert.equal(s.cycleTotals.interruption.meanUs,3750000);
  assert.equal(s.phaseStats['phase-3'].n,3);
  assert.equal(s.phaseStats['phase-3'].meanUs,10000000);
  assert.equal(s.phaseStats['phase-3'].notPerformedCount,1);
});

test('f3_partial_observation_is_not_full_step',()=>{
  const s=summarize('F3');
  assert.equal(s.cycleTotals.elapsed.meanUs,38000000);
  assert.equal(s.cycleTotals.recordedPhase.meanUs,33000000);
  assert.equal(s.cycleTotals.interruption.meanUs,3750000);
  assert.equal(s.cycleTotals.unobserved.meanUs,1250000);
  assert.equal(s.phaseStats['phase-3'].n,3);
  assert.equal(s.phaseStats['phase-3'].meanUs,10000000);
  assert.equal(s.phaseStats['phase-3'].unobservedCount,1);
  const row=s.cycleRows.find(row=>row.cycleId==='cycle-4');
  assert.equal(row.phaseValues['phase-3'].status,'unobserved');
  assert.equal(row.phaseValues['phase-3'].recordedUs,4000000);
  assert.equal(row.phaseValues['phase-3'].unobservedUs,5000000);
});

test('f4_incomplete_cycle_is_excluded',()=>{
  const s=summarize('F4');
  assert.deepEqual(plain(s.counts),{recorded:4,included:3,excluded:0,incomplete:1});
  assert.equal(s.cycleTotals.elapsed.meanUs,39000000);
  assert.equal(s.phaseStats['phase-1'].n,3,'incomplete phase evidence must not enter phase statistics');
  const row=s.cycleRows.find(row=>row.cycleId==='cycle-4');
  assert.equal(row.status,'incomplete');assert.equal(row.elapsedUs,18000000);
});

test('f5_manual_exclusion_keeps_rows',()=>{
  const s=summarize('F5');
  assert.deepEqual(plain(s.counts),{recorded:3,included:2,excluded:1,incomplete:0});
  assert.equal(s.cycleTotals.elapsed.meanUs,33500000);
  assert.equal(s.cycleTotals.interruption.meanUs,0);
  assert.equal(s.cycleRows.length,3);
  const excluded=s.cycleRows.find(row=>row.cycleId==='cycle-3');
  assert.equal(excluded.excluded,true);assert.equal(excluded.exclusionReason,'条件が異なる');
});

test('statistics define zero one even and all-excluded populations without NaN',()=>{
  const core=loadCore(),empty=makeFixture('F1'); empty.cycles=[];
  const zero=core.summarize(empty,'procedure-1');
  assert.deepEqual(plain(zero.cycleTotals.elapsed),{n:0,meanUs:null,medianUs:null,minUs:null,maxUs:null});
  const one=makeFixture('F1');one.cycles=one.cycles.slice(0,1);const s1=core.summarize(one,'procedure-1').cycleTotals.elapsed;
  assert.deepEqual(plain(s1),{n:1,meanUs:34000000,medianUs:34000000,minUs:34000000,maxUs:34000000});
  const even=makeFixture('F1');even.cycles=even.cycles.slice(0,2);assert.equal(core.summarize(even,'procedure-1').cycleTotals.elapsed.medianUs,33500000);
  const none=makeFixture('F1');for(const c of none.cycles){c.excluded=true;c.exclusionReason='test';}
  assert.equal(core.summarize(none,'procedure-1').counts.included,0);assert.equal(core.summarize(none,'procedure-1').cycleTotals.elapsed.meanUs,null);
});

test('different procedures are never mixed into one summary',()=>{
  const core=loadCore(),p=makeFixture('F1');
  const second={...p.procedures[0],id:'procedure-2',label:'別手順',createdAt:'2026-10-05T00:01:00.000Z'};p.procedures.push(second);
  const other=structuredClone(p.cycles[0]);other.id='cycle-other';other.procedureId='procedure-2';other.boundaries=other.boundaries.map((b,i)=>({...b,id:`other-b${i}`,timeUs:b.timeUs+150000000}));other.spans=other.spans.map((s,i)=>({...s,id:`other-s${i}`}));other.occurrences=other.occurrences.map((o,i)=>({...o,id:`other-o${i}`}));
  const map=new Map(p.cycles[0].occurrences.map((o,i)=>[o.id,`other-o${i}`]));other.spans.forEach(s=>{if(s.occurrenceId)s.occurrenceId=map.get(s.occurrenceId);});p.cycles.push(other);
  assert.equal(core.validateProject(p).ok,true);
  assert.equal(core.summarize(p,'procedure-1').counts.recorded,3);assert.equal(core.summarize(p,'procedure-2').counts.recorded,1);
});
