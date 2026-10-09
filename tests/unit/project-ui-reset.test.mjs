import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {loadCore} from '../helpers/load-core.mjs';
import {setupProject} from '../helpers/fixtures.mjs';
const source=readFileSync('src/index.template.html','utf8'),core=loadCore(),fixture=setupProject(core).project;
function actualFunction(name){const start=source.indexOf(`  function ${name}(`),tail=source.slice(start+3),next=tail.search(/\n  (?:async )?function /);return source.slice(start,start+3+next);}
function resetScenario({enabled=true,available=true,state='conflict',revision=0}={}){
 const nodes=new Map(),calls=[],$=key=>{if(!nodes.has(key))nodes.set(key,{textContent:'old status',hidden:false});return nodes.get(key);};
 const ctx=vm.createContext({TsdCore:core,fixture,$,outputFilename:{value:''},document:{querySelectorAll:()=>[]},media:{dispose(){}},cancelAutosave(){},AppToast:{dismiss(){}},clearError(){},clearSeekTimeError(){},renderProject(){},renderMedia(){},renderRestoreCard(){},setAutosaveStatus:(key,state)=>calls.push({key,state}),enabled,available,state,revision});
 vm.runInContext(`let analysisLoadGeneration=0,attachedSource={},displayedSource={},project=null,projectRevision=0,history=null,selectedBoundaryId=null,selectedSpanId=null,selectedCycleId=null,recordingCycleId=null,resultsProcedureId=null,resultsCycleId=null,selectedEvidence=null,evidencePlaybackToken=0,suspended=false,storageRevision=0,autosaveConflict=true,savedSnapshot=null,autosaveEnabled=enabled,storageAvailable=available,autosaveStatusState=state;\n${actualFunction('resetRuntimeForProject')}\nresetRuntimeForProject(fixture,{revision});`,ctx);
 return {calls,nodes};
}
test('accepted project replacement clears old autosave conflict and CSV status',()=>{
 const {calls,nodes}=resetScenario();assert.deepEqual(calls.at(-1),{key:'autosaveReady',state:'default'});assert.equal(nodes.get('#csvStatus')?.textContent,'');
});
test('project replacement preserves disabled, unavailable and pending storage semantics',()=>{
 for(const [options,expected] of [[{enabled:false},{key:'autosaveDisabled',state:'default'}],[{available:false,state:'unavailable'},{key:'autosaveUnavailable',state:'unavailable'}],[{available:false,state:'checking'},{key:'autosaveChecking',state:'checking'}],[{revision:2},{key:'autosaveSaved',state:'saved'}]])assert.deepEqual(resetScenario(options).calls.at(-1),expected);
});
test('dismissed Undo toast is empty and hidden from focus and accessibility',()=>{
 const classes=new Set(),handlers={},nodes={'#appToast':{hidden:false,classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)},dataset:{}},'#appToastAction':{hidden:true,textContent:'',addEventListener:(key,fn)=>handlers[key]=fn},'#appToastMessage':{textContent:''}};
 const text=source.slice(source.indexOf('  const AppToast ='),source.indexOf('  window.AppToast ='));
 const api=vm.runInNewContext(`${text}\nAppToast`,{$:key=>nodes[key],setTimeout:()=>1,clearTimeout(){}});
 let applied=0;api.show({message:'old boundary',actionLabel:'Undo',onAction:()=>applied++});assert.equal(nodes['#appToast'].hidden,false);
 api.dismiss();assert.equal(nodes['#appToast'].hidden,true);assert.equal(nodes['#appToastMessage'].textContent,'');assert.equal(nodes['#appToastAction'].hidden,true);assert.equal(nodes['#appToastAction'].textContent,'');handlers.click();assert.equal(applied,0);
 api.show({message:'new change'});assert.equal(nodes['#appToast'].hidden,false);assert.equal(nodes['#appToastMessage'].textContent,'new change');
});
