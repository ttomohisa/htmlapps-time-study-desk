import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadCore} from '../helpers/load-core.mjs';
import {firstCycle,setupProject} from '../helpers/fixtures.mjs';
const plain=x=>JSON.parse(JSON.stringify(x));
const run=(core,p,ctx,c)=>{const r=core.applyCommand(p,c,ctx);assert.equal(r.ok,true,JSON.stringify(r));return r;};
test('structural_change_preserves_old_cycles and condition snapshots',()=>{
 const core=loadCore();let {project:p,context}=firstCycle(core);const old=JSON.stringify(p.procedures[0]),cycles=JSON.stringify(p.cycles);
 const r=run(core,p,context,{type:'changeProcedure',baseProcedureId:p.procedures[0].id,label:'手順2',phaseIds:[...p.procedures[0].phaseIds].reverse(),startCondition:'箱に触れる',endCondition:'手を離す'});
 p=r.project;assert.equal(JSON.stringify(p.procedures[0]),old);assert.equal(JSON.stringify(p.cycles),cycles);assert.equal(p.procedures.length,2);assert.notEqual(p.procedures[0].id,p.procedures[1].id);
 assert.equal(p.procedures[1].startCondition,'箱に触れる');assert.equal(p.settings.selectedProcedureId,p.procedures[1].id);
 const rename=run(core,p,context,{type:'renameProcedure',procedureId:p.procedures[1].id,label:'条件B'}).project;
 assert.equal(rename.procedures[1].startCondition,'箱に触れる');assert.equal(rename.procedures[1].endCondition,'手を離す');
 const h=core.createHistory();h.push(r.undoPatch);assert.equal(h.undo(p).ok,true);
});
test('rename_preserves_phase_ids and phase creation never rewrites procedures',()=>{
 const core=loadCore();let {project:p,context}=firstCycle(core);const original=JSON.stringify(p.procedures),cycles=JSON.stringify(p.cycles),id=p.phases[0].id;
 p=run(core,p,context,{type:'createPhase',label:'再確認',kind:'planned-wait'}).project;
 assert.equal(p.phases.length,5);assert.equal(JSON.stringify(p.procedures),original);assert.equal(JSON.stringify(p.cycles),cycles);
 p=run(core,p,context,{type:'renamePhase',phaseId:id,label:'準備'}).project;
 p=run(core,p,context,{type:'updatePhaseMeta',phaseId:id,kind:'planned-wait',archived:true}).project;
 assert.equal(p.phases[0].id,id);assert.equal(p.phases[0].label,'準備');assert.equal(JSON.stringify(p.cycles),cycles);
 p=run(core,p,context,{type:'startCycle',procedureId:p.procedures[0].id,timeUs:39e6}).project;
 assert.equal(p.cycles[1].occurrences[0].phaseId,id,'existing procedures retain archived phases');
});
test('invalid procedure edits reject atomically, including empty order and limits',()=>{
 const core=loadCore();const {project:p,context}=firstCycle(core),base={type:'changeProcedure',baseProcedureId:p.procedures[0].id,label:'手順2',phaseIds:p.procedures[0].phaseIds,startCondition:'',endCondition:''};
 for(const bad of [{phaseIds:[]},{phaseIds:['missing']},{label:' '},{startCondition:'x'.repeat(1001)},{phaseIds:Array(51).fill(p.phases[0].id)},{baseProcedureId:null}]) {
  const before=JSON.stringify(p);assert.equal(core.applyCommand(p,{...base,...bad},context).ok,false);assert.equal(JSON.stringify(p),before);
 }
 assert.equal(core.applyCommand(p,{type:'updatePhaseMeta',phaseId:p.phases[0].id,kind:'invalid',archived:false},context).ok,false);
 let current=p;for(let i=1;i<20;i++) current=run(core,current,context,{...base,label:`手順${i+1}`}).project;
 assert.equal(core.applyCommand(current,base,context).error.code,'PROCEDURE_LIMIT');
});
test('repeated phase IDs in a procedure produce distinct occurrences',()=>{
 const core=loadCore();let {project:p,context}=firstCycle(core);const phaseId=p.phases[0].id;
 p=run(core,p,context,{type:'changeProcedure',baseProcedureId:p.procedures[0].id,label:'再確認手順',phaseIds:[phaseId,phaseId],startCondition:'',endCondition:''}).project;
 p=run(core,p,context,{type:'startCycle',procedureId:p.procedures[1].id,timeUs:40e6}).project;
 const c=p.cycles[1];assert.notEqual(c.occurrences[0].id,c.occurrences[1].id);
 p=run(core,p,context,{type:'markBoundary',cycleId:c.id,timeUs:41e6}).project;
 p=run(core,p,context,{type:'finishCycle',cycleId:c.id,timeUs:43e6}).project;
 assert.equal(core.validateProject(p).ok,true);
});
test('display selection changes do not prevent structural Undo or resurrect stale procedure IDs',()=>{
 const core=loadCore();let {project:p,context}=firstCycle(core);const id=p.procedures[0].id;
 const r=run(core,p,context,{type:'changeProcedure',baseProcedureId:id,label:'手順2',phaseIds:p.procedures[0].phaseIds,startCondition:'変更',endCondition:''}),h=core.createHistory();h.push(r.undoPatch);
 r.project.settings.selectedProcedureId=id;r.project.settings.language='en';
 const undo=h.undo(r.project);assert.equal(undo.ok,true);assert.equal(undo.project.settings.selectedProcedureId,id);assert.equal(undo.project.settings.language,'en');
 const redo=h.redo(undo.project);assert.equal(redo.ok,true);assert.equal(redo.project.settings.selectedProcedureId,id);
});
test('predefined multiline names are atomic, duplicate names retain different IDs',()=>{
 const core=loadCore();const {project,context}=setupProject(core);
 assert.equal(typeof core.createNamedProcedure,'function');
 const r=core.createNamedProcedure(project,{labels:['準備','確認','確認'],label:'手順1',startCondition:'手を動かす',endCondition:'手を離す'},context);
 assert.equal(r.ok,true);assert.equal(project.phases.length,0);assert.equal(r.project.phases.length,3);assert.notEqual(r.project.phases[1].id,r.project.phases[2].id);
 const h=core.createHistory();h.push(r.undoPatch);assert.equal(JSON.stringify(h.undo(r.project).project),JSON.stringify(project));
 for(const labels of [[],['x'.repeat(81)],Array(51).fill('工程')]) assert.equal(core.createNamedProcedure(project,{labels,label:'手順1',startCondition:'',endCondition:''},context).ok,false);
});
test('original v0.2.0 schema1 file remains valid and unchanged',()=>{
 const core=loadCore(),p=JSON.parse(readFileSync('tests/fixtures/v0.2.0-first-cycle.tsd.json','utf8'));
 assert.equal(core.validateProject(p).ok,true);assert.deepEqual(plain(core.validateProject(p).value),p);
});
