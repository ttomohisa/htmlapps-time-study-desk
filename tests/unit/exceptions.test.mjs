import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCore} from '../helpers/load-core.mjs';
import {firstCycle} from '../helpers/fixtures.mjs';
const plain=x=>JSON.parse(JSON.stringify(x));
function run(core,p,context,command) { const r=core.applyCommand(p,command,context); assert.equal(r.ok,true,JSON.stringify(r)); return r.project; }
function setup() { const core=loadCore(),f=firstCycle(core);f.project.source.durationUs=240e6;return {core,...f}; }
function totals(c) {const sums={phase:0,interruption:0,unobserved:0};c.spans.forEach((s,i)=>sums[s.kind]+=c.boundaries[i+1].timeUs-c.boundaries[i].timeUs);return sums;}
test('interruption_splits_one_occurrence_without_losing_time (F1 third cycle)',()=>{
 const {core,context,project}=setup();let p=project;
 p=run(core,p,context,{type:'startCycle',procedureId:p.procedures[0].id,timeUs:77e6});const cId=p.cycles.at(-1).id;
 for(const timeUs of [84e6,96e6])p=run(core,p,context,{type:'markBoundary',cycleId:cId,timeUs});
 const oId=p.cycles.at(-1).cursor.occurrenceId;
 p=run(core,p,context,{type:'beginInterruption',cycleId:cId,timeUs:101e6,note:'材料待ち'});
 assert.equal(p.cycles.at(-1).cursor.kind,'interruption');
 assert.equal(core.applyCommand(p,{type:'beginInterruption',cycleId:cId,timeUs:102e6,note:''},context).ok,false);
 p=run(core,p,context,{type:'endInterruption',cycleId:cId,timeUs:116e6});
 assert.equal(p.cycles.at(-1).cursor.occurrenceId,oId);
 p=run(core,p,context,{type:'markBoundary',cycleId:cId,timeUs:121e6});
 p=run(core,p,context,{type:'finishCycle',cycleId:cId,timeUs:127e6});
 const c=p.cycles.at(-1);
 assert.deepEqual(plain(c.boundaries.map(b=>b.timeUs)),[77,84,96,101,116,121,127].map(n=>n*1e6));
 assert.deepEqual(totals(c),{phase:35e6,interruption:15e6,unobserved:0});
 assert.equal(c.spans[2].occurrenceId,c.spans[4].occurrenceId);assert.equal(c.spans[3].note,'材料待ち');
 assert.equal(c.occurrences.find(o=>o.id===oId).resolution,'measured');assert.equal(c.status,'complete');
});
test('not_performed_is_not_zero and skipping never discards measured evidence',()=>{
 const {core,context,project}=setup();let p=run(core,project,context,{type:'startCycle',procedureId:project.procedures[0].id,timeUs:132e6});const cId=p.cycles.at(-1).id;
 for(const timeUs of [139e6,151e6])p=run(core,p,context,{type:'markBoundary',cycleId:cId,timeUs});
 const o=p.cycles.at(-1).occurrences[2];
 p=run(core,p,context,{type:'skipOccurrence',cycleId:cId,occurrenceId:o.id});
 assert.equal(p.cycles.at(-1).boundaries.at(-1).timeUs,151e6);
 p=run(core,p,context,{type:'finishCycle',cycleId:cId,timeUs:158e6});
 const c=p.cycles.at(-1);assert.equal(c.occurrences[2].resolution,'not-performed');assert.equal(c.spans.length,3);
 assert.equal(c.spans.some(s=>s.occurrenceId===o.id),false);assert.equal(totals(c).phase,26e6);
 assert.equal(core.applyCommand(p,{type:'skipOccurrence',cycleId:cId,occurrenceId:c.occurrences[0].id},context).ok,false);
});
test('unobserved_preserves_known_part and explicit review advances at the shared boundary (F3)',()=>{
 const {core,context,project}=setup();let p=run(core,project,context,{type:'startCycle',procedureId:project.procedures[0].id,timeUs:163e6});const cId=p.cycles.at(-1).id;
 for(const timeUs of [170e6,182e6])p=run(core,p,context,{type:'markBoundary',cycleId:cId,timeUs});
 const occurrenceId=p.cycles.at(-1).cursor.occurrenceId;
 p=run(core,p,context,{type:'beginUnobserved',cycleId:cId,timeUs:186e6,note:'画角外'});
 p=run(core,p,context,{type:'endUnobserved',cycleId:cId,timeUs:191e6});
 p=run(core,p,context,{type:'closeIncomplete',cycleId:cId,timeUs:191e6});
 p=run(core,p,context,{type:'resolveOccurrence',cycleId:cId,occurrenceId,resolution:'unobserved'});
 p=run(core,p,context,{type:'resumeCycle',cycleId:cId});
 p=run(core,p,context,{type:'finishCycle',cycleId:cId,timeUs:198e6});
 const c=p.cycles.at(-1);
 assert.equal(c.occurrences[2].resolution,'unobserved');
 assert.deepEqual(totals(c),{phase:30e6,interruption:0,unobserved:5e6});
 assert.deepEqual(plain(c.boundaries.map(b=>b.timeUs)),[163,170,182,186,191,198].map(n=>n*1e6));
 assert.equal(core.applyCommand(p,{type:'resolveOccurrence',cycleId:cId,occurrenceId,resolution:'measured'},context).ok,false);
});
test('ending during interruption/unobserved remains incomplete and preserves its kind',()=>{
 for(const kind of ['Interruption','Unobserved']) {
  const {core,context,project}=setup();let p=run(core,project,context,{type:'startCycle',procedureId:project.procedures[0].id,timeUs:40e6});const cycleId=p.cycles.at(-1).id;
  p=run(core,p,context,{type:'begin'+kind,cycleId,timeUs:41e6,note:'末尾'});
  p=run(core,p,context,{type:'closeIncomplete',cycleId,timeUs:240e6});
  const c=p.cycles.at(-1);assert.equal(c.status,'incomplete');assert.equal(c.spans.at(-1).kind,kind.toLowerCase());
  assert.equal(c.cursor.kind,kind.toLowerCase());assert.equal(core.validateProject(p).ok,true);
  assert.equal(core.applyCommand(p,{type:'finishCycle',cycleId,timeUs:240e6},context).ok,false);
 }
});
test('video-end pending step must be explicitly resolved before same-time finish',()=>{
 const {core,context,project}=setup();let p=run(core,project,context,{type:'startCycle',procedureId:project.procedures[0].id,timeUs:40e6});const cycleId=p.cycles.at(-1).id;
 for(const timeUs of [41e6,42e6,43e6])p=run(core,p,context,{type:'markBoundary',cycleId,timeUs});
 p=run(core,p,context,{type:'closeIncomplete',cycleId,timeUs:240e6});const o=p.cycles.at(-1).occurrences.at(-1);
 assert.equal(core.applyCommand(p,{type:'finishCycle',cycleId,timeUs:240e6},context).ok,false);
 p=run(core,p,context,{type:'resolveOccurrence',cycleId,occurrenceId:o.id,resolution:'measured'});
 p=run(core,p,context,{type:'finishCycle',cycleId,timeUs:240e6});
 assert.equal(p.cycles.at(-1).spans.length,4);assert.equal(p.cycles.at(-1).status,'complete');
});
test('skipping final step retains explicit finish and no zero-time span',()=>{
 const {core,context,project}=setup();let p=run(core,project,context,{type:'startCycle',procedureId:project.procedures[0].id,timeUs:40e6});const cycleId=p.cycles.at(-1).id;
 for(const timeUs of [41e6,42e6,43e6])p=run(core,p,context,{type:'markBoundary',cycleId,timeUs});
 p=run(core,p,context,{type:'skipOccurrence',cycleId,occurrenceId:p.cycles.at(-1).occurrences.at(-1).id});
 assert.notEqual(p.cycles.at(-1).status,'complete');assert.equal(p.cycles.at(-1).spans.length,3);
 p=run(core,p,context,{type:'finishCycle',cycleId,timeUs:43e6});assert.equal(p.cycles.at(-1).status,'complete');
});
test('exception commands reject wrong targets, zero spans, time reversal and overlong notes atomically',()=>{
 const {core,context,project}=setup();const p=run(core,project,context,{type:'startCycle',procedureId:project.procedures[0].id,timeUs:40e6}),cycleId=p.cycles.at(-1).id;
 const bad=[{type:'beginInterruption',cycleId,timeUs:40e6,note:''},{type:'beginUnobserved',cycleId,timeUs:39e6,note:''},{type:'endInterruption',cycleId,timeUs:41e6},{type:'beginUnobserved',cycleId,timeUs:41e6,note:'x'.repeat(1001)},{type:'skipOccurrence',cycleId,occurrenceId:'missing'},{type:'resolveOccurrence',cycleId,occurrenceId:p.cycles.at(-1).occurrences[0].id,resolution:'measured'}];
 for(const cmd of bad){const before=JSON.stringify(p);assert.equal(core.applyCommand(p,cmd,context).ok,false);assert.equal(JSON.stringify(p),before);}
});
test('exception histories are reversible and preserve original schema1 data',()=>{
 const {core,context,project}=setup();const p=run(core,project,context,{type:'startCycle',procedureId:project.procedures[0].id,timeUs:40e6});
 const result=core.applyCommand(p,{type:'beginUnobserved',cycleId:p.cycles.at(-1).id,timeUs:41e6,note:'?<script>'},context);assert.equal(result.ok,true);
 const h=core.createHistory();h.push(result.undoPatch);const back=h.undo(result.project);
 assert.equal(JSON.stringify(back.project),JSON.stringify(p));assert.equal(JSON.stringify(h.redo(back.project).project),JSON.stringify(result.project));
 const saved=JSON.parse(core.serializeProject(result.project,'0.4.0'));assert.equal(saved.schemaVersion,1);assert.equal(core.validateProject(saved).ok,true);
});
