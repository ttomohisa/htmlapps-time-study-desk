import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {loadCore} from '../helpers/load-core.mjs';
const source=readFileSync('src/index.template.html','utf8');
function actualFunction(name){const match=source.match(new RegExp(`^  (?:async )?function ${name}\\(`,'m'));if(!match)return '';const start=match.index,tail=source.slice(start+3),next=tail.search(/\n  (?:async )?function /);return source.slice(start,next<0?undefined:start+3+next);}
function setup(){
 const input={value:'',attributes:{},setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];}},error={hidden:true},calls=[],errors=[];
 const media={state:'ready',pending:null,source:{durationUs:4000000},async seekTo(time){calls.push(time);}};
 const context=vm.createContext({TsdCore:loadCore(),media,$:id=>id==='#seekTime'?input:error,message:(key,values)=>`${key}:${values.duration}`,exactSeconds:time=>String(time/1e6),cancelEvidencePlayback(){},setError:e=>errors.push(e.code)});
 vm.runInContext(`${['clearSeekTimeError','renderSeekTimeError','seekTypedPosition'].map(actualFunction).join('\n')}\n globalThis.go=seekTypedPosition`,context);
 return {go:context.go,media,input,error,calls,errors};
}
test('exact seeking passes safe integer microseconds including both duration endpoints',async()=>{
 const {go,input,error,calls}=setup();for(const value of ['1.234567','0','4',' 2.5 ']){input.value=value;await go();}
 assert.deepEqual(calls,[1234567,0,4000000,2500000]);assert.equal(error.hidden,true);
});
test('invalid and out-of-range times stay editable and never seek',async()=>{
 const {go,input,error,calls}=setup();
 for(const value of ['', '-1','1e2','NaN','Infinity','1:20','4.000001','1.0000001','9007199254740991']){input.value=value;await go();assert.equal(input.value,value);assert.equal(input.attributes['aria-invalid'],'true');assert.equal(error.hidden,false);}
 assert.deepEqual(calls,[]);input.value='3';await go();assert.deepEqual(calls,[3000000]);assert.equal(error.hidden,true);assert.equal(input.attributes['aria-invalid'],undefined);
});
test('exact seeking waits for current source metadata and readiness',async()=>{
 const {go,input,media,calls}=setup();input.value='1';media.state='seeking';await go();media.state='ready';media.pending={};await go();media.pending=null;media.source=null;await go();assert.deepEqual(calls,[]);
});
test('exact seek failures use the existing media error path',async()=>{
 const {go,input,media,errors}=setup();input.value='1';media.seekTo=async()=>{throw {code:'SEEK_FAILED'};};await go();assert.deepEqual(errors,['SEEK_FAILED']);
});

test('playback-only input has no native validity constraint that can block analysis export',()=>{
 const input=source.match(/<input id="seekTime"[^>]*>/)?.[0];assert.ok(input);assert.match(input,/type="text"/);assert.doesNotMatch(input,/\b(?:required|pattern|maxlength|min|max)=/);
});
