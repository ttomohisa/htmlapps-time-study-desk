import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {loadCore} from '../helpers/load-core.mjs';
import {setupProject} from '../helpers/fixtures.mjs';

const source=readFileSync('src/index.template.html','utf8');
const core=loadCore();
const fixture=setupProject(core).project;
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
function actualFunction(name){const match=source.match(new RegExp(`^  (?:async )?function ${name}\\(`,'m'));if(!match)return '';const start=match.index;const tail=source.slice(start+3);const next=tail.search(/\n  (?:async )?function /);return source.slice(start,next<0?undefined:start+3+next);}
function setup(initial=null){
 const errors=[],loads=[],commits=[],dialogs=[],nodes=new Map();
 let pendingDialog=null;
 const media={generation:0,source:null,loadCandidate(file){this.cancelCandidate();const pending=deferred();const candidate={generation:++this.generation,source:{...fixture.source,name:file.name}};loads.push({pending,candidate});return pending.promise;},cancelCandidate(){this.generation++;},commitCandidate(candidate){if(candidate.generation!==this.generation)throw {code:'STALE'};this.source=candidate.source;commits.push(candidate);}};
 const confirm={cancel(){pendingDialog?.resolve(false);pendingDialog=null;},ask(){this.cancel();pendingDialog=deferred();dialogs.push(pendingDialog);return pendingDialog.promise;}};
 const context=vm.createContext({initial,media,AppConfirm:confirm,TsdCore:core,commandContext:{makeId:()=> 'new-project',nowIso:()=> '2026-10-09T00:00:00.000Z',language:'en'},translate:key=>key,setError:e=>{if(e.code!=='STALE')errors.push(e.code);},clearError:()=>{errors.length=0;},$:key=>{if(!nodes.has(key))nodes.set(key,{open:false,hidden:true,close(){this.open=false;}});return nodes.get(key);},selectPage(){},renderMedia(){},maxRecordedBoundaryUs:()=>0});
 vm.runInContext(`let project=initial,projectRevision=0,analysisLoadGeneration=0,attachedSource=null,displayedSource=null;
 function resetRuntimeForProject(next){analysisLoadGeneration++;project=next;projectRevision++;media.source=null;}
 ${['beginSourceLoad','openAnalysisFile','reconnectFile','chooseFile'].map(actualFunction).join('\n')}
 globalThis.api={openAnalysisFile,reconnectFile,chooseFile,get project(){return project;},edit(){projectRevision++;}};`,context);
 return {api:context.api,media,errors,loads,commits,dialogs,confirm};
}
function jsonFile(name='analysis.tsd.json',value=fixture){return {name,size:100,text:async()=>JSON.stringify(value)};}
async function tick(){await Promise.resolve();await Promise.resolve();}

test('a stale JSON read rejection cannot overwrite a newer successful import with an error',async()=>{
 const {api,errors}=setup(),old=deferred();
 const first=api.openAnalysisFile({name:'slow.json',size:100,text:()=>old.promise});
 await api.openAnalysisFile(jsonFile());old.reject(new Error('late read error'));await first;
 assert.deepEqual(errors,[]);assert.equal(api.project.projectId,fixture.projectId);
});
test('a newer invalid analysis choice invalidates an earlier pending video candidate',async()=>{
 const {api,loads,commits,errors}=setup();const first=api.chooseFile({name:'old.mp4'});
 await api.openAnalysisFile(jsonFile('bad.json',{}));loads[0].pending.resolve(loads[0].candidate);await first;
 assert.equal(commits.length,0);assert.equal(api.project,null);assert.deepEqual(errors,['INVALID_PROJECT']);
});
test('reconnecting a video supersedes an earlier slow analysis read',async()=>{
 const {api,loads,dialogs}=setup(fixture),old=deferred();
 const first=api.openAnalysisFile({size:100,text:()=>old.promise});
 const reconnect=api.reconnectFile({name:fixture.source.name});old.resolve(JSON.stringify(fixture));await tick();
 assert.equal(dialogs.length,0,'stale import must not request replacement');
 loads[0].pending.resolve(loads[0].candidate);await tick();assert.equal(dialogs.length,1);dialogs[0].resolve(false);await reconnect;
});
test('a newer invalid import cancels the earlier import replacement confirmation',async()=>{
 const {api,dialogs}=setup(fixture);const first=api.openAnalysisFile(jsonFile());await tick();assert.equal(dialogs.length,1);
 await api.openAnalysisFile(jsonFile('bad.json',{}));
 // A canceled dialog promise must settle without a manual click.
 let settled=false;first.then(()=>{settled=true;});await tick();assert.equal(settled,true);
 assert.equal(api.project.projectId,fixture.projectId);
});
test('a superseded video failure does not replace the current JSON validation error',async()=>{
 const {api,loads,errors}=setup();const first=api.chooseFile({name:'old.mp4'});
 await api.openAnalysisFile(jsonFile('bad.json',{}));loads[0].pending.reject({code:'UNSUPPORTED'});await first;
 assert.deepEqual(errors,['INVALID_PROJECT']);
});
test('reconnect confirmation invalidated by an edit releases its pending candidate',async()=>{
 const {api,loads,dialogs,media}=setup(fixture);const reconnect=api.reconnectFile({name:fixture.source.name});
 loads[0].pending.resolve(loads[0].candidate);await tick();const generation=media.generation;
 api.edit();dialogs[0].resolve(true);await reconnect;
 assert.ok(media.generation>generation);assert.equal(media.source,null);
});
