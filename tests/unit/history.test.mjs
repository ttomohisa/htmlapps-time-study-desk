import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCore} from '../helpers/load-core.mjs';
import {firstCycle} from '../helpers/fixtures.mjs';
test('boundary_move_is_atomic_and_undoable',()=>{
 const core=loadCore(); assert.equal(typeof core.createHistory,'function');
 const {project,context,cycleId}=firstCycle(core), boundaryId=project.cycles[0].boundaries[1].id;
 const result=core.applyCommand(project,{type:'moveBoundary',cycleId,boundaryId,timeUs:7000000},context);
 assert.equal(result.ok,true); const b=result.project.cycles[0].boundaries;
 assert.equal(b[1].timeUs-b[0].timeUs,7000000); assert.equal(b[2].timeUs-b[1].timeUs,11000000);
 assert.equal(b.at(-1).timeUs-b[0].timeUs,34000000);
 assert.ok(JSON.stringify(result.undoPatch).length<1000,'boundary move must not retain full project snapshots');
 const history=core.createHistory(); history.push(result.undoPatch);
 const undo=history.undo(result.project); assert.equal(undo.ok,true); assert.equal(JSON.stringify(undo.project),JSON.stringify(project));
 const redo=history.redo(undo.project); assert.equal(JSON.stringify(redo.project),JSON.stringify(result.project));
 for (const timeUs of [0,18000000,60000001]) assert.equal(core.applyCommand(project,{type:'moveBoundary',cycleId,boundaryId,timeUs},context).ok,false);
});
test('history retains at most 100 operations, discards redo after a new edit and enforces bytes',()=>{
 const core=loadCore(); assert.equal(typeof core.createHistory,'function');
 let {project,context}=firstCycle(core); const history=core.createHistory();
 for(let i=0;i<110;i++) {const r=core.applyCommand(project,{type:'updateProjectMeta',title:`title-${i}`,note:''},context); assert.equal(r.ok,true); history.push(r.undoPatch); project=r.project;}
 assert.equal(history.undoCount,100); assert.ok(history.bytes<=16*1024*1024);
 project=history.undo(project).project; assert.equal(history.redoCount,1);
 const r=core.applyCommand(project,{type:'updateProjectMeta',title:'new edit',note:''},context); history.push(r.undoPatch); assert.equal(history.redoCount,0);
 const small=core.createHistory({maxBytes:400}); small.push(r.undoPatch); small.push(r.undoPatch); assert.ok(small.bytes<=400);
});
test('rename and metadata/note edits are reversible, codepoint-limited, and blank names keep the label',()=>{
 const core=loadCore(); assert.equal(typeof core.createHistory,'function');
 const {project,context,cycleId}=firstCycle(core), phaseId=project.phases[0].id;
 const blank=core.applyCommand(project,{type:'renamePhase',phaseId,label:'  '},context);
 assert.equal(blank.ok,true); assert.equal(blank.project.phases[0].label,project.phases[0].label);
 const rename=core.applyCommand(project,{type:'renamePhase',phaseId,label:' <img onerror=alert(1)> '},context);
 assert.equal(rename.ok,true); assert.equal(rename.project.phases[0].id,phaseId); assert.equal(rename.project.phases[0].label,'<img onerror=alert(1)>');
 assert.equal(core.applyCommand(project,{type:'renamePhase',phaseId,label:'猫'.repeat(81)},context).ok,false);
 assert.equal(core.applyCommand(project,{type:'renamePhase',phaseId,label:'😀'.repeat(80)},context).ok,true);
 for (const [targetType,targetId] of [['cycle',cycleId],['span',project.cycles[0].spans[0].id],['occurrence',project.cycles[0].occurrences[0].id]]) {
  const r=core.applyCommand(project,{type:'editNote',cycleId,targetType,targetId,note:'Review note'},context); assert.equal(r.ok,true);
  const history=core.createHistory();history.push(r.undoPatch);assert.equal(JSON.stringify(history.undo(r.project).project),JSON.stringify(project));
 }
});
