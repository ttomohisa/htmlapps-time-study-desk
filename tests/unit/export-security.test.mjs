import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCore} from '../helpers/load-core.mjs';
import {makeFixture} from '../helpers/fixtures.mjs';

function firstDataCell(csv,column){
  const lines=csv.slice(1).split('\r\n').filter(Boolean);
  const parse=line=>{const out=[];let i=0;while(i<line.length){assert.equal(line[i++],'"');let s='';while(i<line.length){if(line[i]==='"'){if(line[i+1]==='"'){s+='"';i+=2;}else{i++;break;}}else s+=line[i++];}out.push(s);if(line[i]===',')i++;}return out;};
  const h=parse(lines[0]),r=parse(lines[1]);return r[h.indexOf(column)];
}
test('dangerous_text_is_not_formula for ASCII, leading whitespace and fullwidth operators',()=>{
  const core=loadCore();
  for(const value of ['=1+1','  @SUM(A1:A2)','\t-2','＋1','－1','＠SUM(A1)','−5']){
    const p=makeFixture('F1');p.procedures[0].label=value;
    const cell=firstDataCell(core.buildCsv(p,{type:'time-table',procedureId:'procedure-1',language:'en'}),'Procedure name');
    assert.equal(cell,"'"+value,value);
    assert.equal(p.procedures[0].label,value,'CSV hardening must not mutate JSON data');
  }
});
test('dangerous scan looks through BOM and spaces while preserving the original text',()=>{
  const core=loadCore(),p=makeFixture('F1'),value=' \ufeff@SUM(A1:A2)';
  p.procedures[0].label=value;
  const cell=firstDataCell(core.buildCsv(p,{type:'time-table',procedureId:'procedure-1',language:'en'}),'Procedure name');
  assert.equal(cell,"'"+value);assert.equal(p.procedures[0].label,value);
});
