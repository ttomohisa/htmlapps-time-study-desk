import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCore} from '../helpers/load-core.mjs';
import {firstCycle} from '../helpers/fixtures.mjs';
const plain=x=>JSON.parse(JSON.stringify(x));
function setup(){return {core:loadCore()};}
function run(core,p,context,command){const r=core.applyCommand(p,command,context);assert.equal(r.ok,true,JSON.stringify(r));return r;}
test('split_merge_preserves_total and Undo restores IDs, notes and assignments',()=>{
 const core=loadCore();const {project,context,cycleId}=firstCycle(core),c=project.cycles[0],s=c.spans[2];
 const split=run(core,project,context,{type:'splitSpan',cycleId,spanId:s.id,timeUs:22e6});
 let next=split.project.cycles[0];assert.equal(next.spans.length,5);
 assert.equal(next.boundaries[3].timeUs-next.boundaries[2].timeUs,4e6);assert.equal(next.boundaries[4].timeUs-next.boundaries[3].timeUs,6e6);
 assert.equal(next.spans[2].occurrenceId,next.spans[3].occurrenceId);assert.equal(next.status,'complete');
 const merge=run(core,split.project,context,{type:'mergeSpans',cycleId,leftSpanId:next.spans[2].id,rightSpanId:next.spans[3].id,kind:s.kind,occurrenceId:s.occurrenceId,note:s.note});
 next=merge.project.cycles[0];assert.equal(next.boundaries.at(-1).timeUs-next.boundaries[0].timeUs,34e6);assert.equal(next.spans.length,4);
 const h=core.createHistory();h.push(split.undoPatch);h.push(merge.undoPatch);
 const undoMerge=h.undo(merge.project);assert.equal(JSON.stringify(undoMerge.project),JSON.stringify(split.project));
 assert.equal(JSON.stringify(h.undo(undoMerge.project).project),JSON.stringify(project));
});
test('reassignment preserves time, orphaned measured evidence becomes pending not zero',()=>{
 const core=loadCore();const {project,context,cycleId}=firstCycle(core),c=project.cycles[0];
 const r=run(core,project,context,{type:'assignSpan',cycleId,spanId:c.spans[1].id,kind:'interruption',occurrenceId:null,note:'原因不明'});
 const next=r.project.cycles[0];assert.equal(next.occurrences[1].resolution,'pending');assert.equal(next.status,'incomplete');
 assert.deepEqual(plain(next.boundaries),plain(c.boundaries));assert.equal(next.spans[1].note,'原因不明');assert.equal(core.validateProject(r.project).ok,true);
 const resolved=run(core,r.project,context,{type:'resolveOccurrence',cycleId,occurrenceId:c.occurrences[1].id,resolution:'not-performed'});
 const done=run(core,resolved.project,context,{type:'finishCycle',cycleId,timeUs:34e6});
 assert.equal(done.project.cycles[0].status,'complete');
});
test('unobserved reassignment never erases known duration or implies measured after correction',()=>{
 const core=loadCore();const {project,context,cycleId}=firstCycle(core),c=project.cycles[0];
 const u=run(core,project,context,{type:'assignSpan',cycleId,spanId:c.spans[0].id,kind:'unobserved',occurrenceId:c.occurrences[0].id,note:''});
 assert.equal(u.project.cycles[0].occurrences[0].resolution,'unobserved');
 const back=run(core,u.project,context,{type:'assignSpan',cycleId,spanId:c.spans[0].id,kind:'phase',occurrenceId:c.occurrences[0].id,note:''});
 assert.equal(back.project.cycles[0].occurrences[0].resolution,'pending');assert.equal(back.project.cycles[0].status,'incomplete');
});
test('rework uses distinct additional occurrence and preserves original procedure',()=>{
 const core=loadCore();const {project,context,cycleId}=firstCycle(core),c=project.cycles[0],phaseId=project.phases[0].id;
 const add=run(core,project,context,{type:'insertOccurrence',cycleId,beforeOccurrenceId:null,phaseId});
 let p=add.project;const o=p.cycles[0].occurrences.at(-1);
 assert.equal(o.planned,false);assert.equal(o.phaseId,phaseId);assert.equal(o.resolution,'pending');assert.equal(p.cycles[0].status,'incomplete');
 assert.deepEqual(plain(p.procedures),plain(project.procedures));
 p=run(core,p,context,{type:'splitSpan',cycleId,spanId:c.spans[0].id,timeUs:4e6}).project;
 p=run(core,p,context,{type:'assignSpan',cycleId,spanId:p.cycles[0].spans[1].id,kind:'phase',occurrenceId:o.id,note:'やり直し'}).project;
 p=run(core,p,context,{type:'resolveOccurrence',cycleId,occurrenceId:o.id,resolution:'measured'}).project;
 p=run(core,p,context,{type:'finishCycle',cycleId,timeUs:34e6}).project;
 assert.equal(p.cycles[0].boundaries.at(-1).timeUs,34e6);assert.equal(p.cycles[0].occurrences.length,5);
 const ids=new Set(p.cycles[0].occurrences.filter(x=>x.phaseId===phaseId).map(x=>x.id));
 let total=0;p.cycles[0].spans.forEach((s,i)=>{if(ids.has(s.occurrenceId))total+=p.cycles[0].boundaries[i+1].timeUs-p.cycles[0].boundaries[i].timeUs;});
 assert.equal(total,6e6);
});
test('invalid splitting/merging/assignment is atomic and other cycles do not change',()=>{
 const core=loadCore();const {project:p,context,cycleId}=firstCycle(core),c=p.cycles[0],saved=JSON.stringify(p);
 for(const cmd of [
  {type:'splitSpan',cycleId,spanId:c.spans[0].id,timeUs:0},
  {type:'splitSpan',cycleId,spanId:c.spans[0].id,timeUs:6e6},
  {type:'mergeSpans',cycleId,leftSpanId:c.spans[0].id,rightSpanId:c.spans[2].id,kind:'phase',occurrenceId:c.occurrences[0].id,note:''},
  {type:'assignSpan',cycleId,spanId:c.spans[0].id,kind:'phase',occurrenceId:null,note:''},
  {type:'insertOccurrence',cycleId,phaseId:'missing',beforeOccurrenceId:null},
  {type:'insertOccurrence',cycleId,phaseId:p.phases[0].id,beforeOccurrenceId:'missing'},
  {type:'deleteCycle',cycleId:'missing'},
 ]){assert.equal(core.applyCommand(p,cmd,context).ok,false);assert.equal(JSON.stringify(p),saved);}
});
test('deleteCycle is undoable without deleting phase/procedure definitions',()=>{
 const core=loadCore();const {project,context,cycleId}=firstCycle(core);
 const r=run(core,project,context,{type:'deleteCycle',cycleId});assert.equal(r.project.cycles.length,0);
 assert.deepEqual(plain(r.project.phases),plain(project.phases));assert.deepEqual(plain(r.project.procedures),plain(project.procedures));
 const h=core.createHistory();h.push(r.undoPatch);assert.equal(JSON.stringify(h.undo(r.project).project),JSON.stringify(project));
});
test('merging different occurrences retains one explicit assignment and leaves other pending',()=>{
 const core=loadCore();const {project,context,cycleId}=firstCycle(core),c=project.cycles[0];
 const r=run(core,project,context,{type:'mergeSpans',cycleId,leftSpanId:c.spans[0].id,rightSpanId:c.spans[1].id,kind:'phase',occurrenceId:c.occurrences[0].id,note:'統合後'});
 const n=r.project.cycles[0];assert.equal(n.boundaries[1].timeUs,18e6);assert.equal(n.spans[0].occurrenceId,c.occurrences[0].id);
 assert.equal(n.occurrences[1].resolution,'pending');assert.equal(n.status,'incomplete');assert.equal(n.spans[0].note,'統合後');
});

test('overlong interval notes report the text limit without changing the record',()=>{
 const core=loadCore(),{project,context}=firstCycle(core),cycle=project.cycles[0],before=JSON.stringify(project);
 for(const command of [
  {type:'assignSpan',cycleId:cycle.id,spanId:cycle.spans[0].id},
  {type:'mergeSpans',cycleId:cycle.id,leftSpanId:cycle.spans[0].id,rightSpanId:cycle.spans[1].id}
 ]) {
  const result=core.applyCommand(project,{...command,kind:'phase',occurrenceId:cycle.spans[0].occurrenceId,note:'x'.repeat(1001)},context);
  assert.equal(result.ok,false);assert.equal(result.error.code,'TEXT_LIMIT');assert.equal(JSON.stringify(project),before);
 }
});
