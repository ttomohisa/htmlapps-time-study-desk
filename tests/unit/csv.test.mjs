import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCore} from '../helpers/load-core.mjs';
import {makeFixture} from '../helpers/fixtures.mjs';

function parseCsv(text) {
  assert.equal(text.charCodeAt(0),0xfeff,'UTF-8 CSV text must begin with BOM');
  const s=text.slice(1),rows=[];let row=[],cell='',i=0;
  while(i<s.length){
    assert.equal(s[i],'"',`cell must start quoted at offset ${i}`);i++;cell='';
    while(i<s.length){
      if(s[i]==='"'){
        if(s[i+1]==='"'){cell+='"';i+=2;continue;}
        i++;break;
      }
      cell+=s[i++];
    }
    row.push(cell);
    if(s[i]===','){i++;continue;}
    if(s.slice(i,i+2)==='\r\n'){rows.push(row);row=[];i+=2;continue;}
    if(i===s.length){rows.push(row);break;}
    assert.fail(`unexpected CSV separator at ${i}: ${JSON.stringify(s.slice(i,i+8))}`);
  }
  return rows;
}
const col=(header,name)=>{const i=header.indexOf(name);assert.notEqual(i,-1,name);return i;};

test('csv_preserves_blank_vs_zero_and_exclusion_reason',()=>{
  const core=loadCore();
  const f2=core.buildCsv(makeFixture('F2'),{type:'time-table',procedureId:'procedure-1',language:'ja'});
  assert.ok(f2.startsWith('\ufeff'));assert.ok(f2.endsWith('\r\n'));
  const rows=parseCsv(f2),h=rows[0],r4=rows.find(r=>r[col(h,'回ID')]==='cycle-4');
  assert.equal(r4[col(h,'工程3 [phase-3] 秒')],'');
  assert.equal(r4[col(h,'工程3 [phase-3] 状態')],'実施なし');
  assert.equal(r4[col(h,'中断秒')],'0');
  const f5=parseCsv(core.buildCsv(makeFixture('F5'),{type:'time-table',procedureId:'procedure-1',language:'ja'}));
  const h5=f5[0],r3=f5.find(r=>r[col(h5,'回ID')]==='cycle-3');
  assert.equal(r3[col(h5,'集計対象')],'対象外');assert.equal(r3[col(h5,'除外理由')],'条件が異なる');
});

test('csv_round_trips_quotes_newlines_and_unicode',()=>{
  const core=loadCore(),p=makeFixture('F1');
  p.procedures[0].label='=1+1, 日本語"引用\n次行';
  p.cycles[0].note='メモ, "quoted"\nline';
  const rows=parseCsv(core.buildCsv(p,{type:'time-table',procedureId:'procedure-1',language:'ja'}));
  const h=rows[0],r=rows[1];
  assert.equal(r[col(h,'手順名')],'\'=1+1, 日本語"引用\n次行');
  assert.equal(rows.length,4);
});

test('csv_detail_includes_status_only_rows_and_between_cycle_gaps',()=>{
  const core=loadCore(),p=makeFixture('F2');
  const rows=parseCsv(core.buildCsv(p,{type:'intervals',procedureId:'procedure-1',scope:'selected-procedure',language:'ja'}));
  const h=rows[0];
  assert.deepEqual(h,['row_type','procedure_id','cycle_id','cycle_number','cycle_status','included_in_cycle_stats','exclusion_reason','span_id','occurrence_id','phase_id','phase_name','span_kind','start_seconds','end_seconds','duration_seconds','occurrence_state','note']);
  const status=rows.find(r=>r[col(h,'row_type')]==='occurrence-status'&&r[col(h,'cycle_id')]==='cycle-4'&&r[col(h,'phase_id')]==='phase-3');
  assert.ok(status);assert.equal(status[col(h,'duration_seconds')],'');assert.equal(status[col(h,'occurrence_state')],'not-performed');
  const gaps=rows.filter(r=>r[col(h,'row_type')]==='between-cycles');
  assert.equal(gaps.length,3);assert.deepEqual(gaps.slice(0,2).map(r=>r[col(h,'duration_seconds')]),['5','5']);
});

test('summary uses the same F2 denominator and numeric values as core summary',()=>{
  const core=loadCore(),rows=parseCsv(core.buildCsv(makeFixture('F2'),{type:'summary',procedureId:'procedure-1',language:'en'})),h=rows[0];
  const phase3=rows.find(r=>r[col(h,'Metric / phase ID')]==='phase-3');
  assert.equal(phase3[col(h,'n')],'3');assert.equal(phase3[col(h,'Mean seconds')],'10');assert.equal(phase3[col(h,'Not performed count')],'1');
  const elapsed=rows.find(r=>r[col(h,'Metric / phase ID')]==='elapsed');
  assert.equal(elapsed[col(h,'Mean seconds')],'35.75');
});

test('analysis-wide interval detail includes cycles from another procedure and duplicate labels remain identifiable',()=>{
  const core=loadCore(),p=makeFixture('F1');
  p.phases[1].label=p.phases[0].label;
  p.procedures.push({id:'procedure-2',label:'手順2',phaseIds:['phase-1'],startCondition:'',endCondition:'',createdAt:'2026-10-05T00:00:00.000Z'});
  p.cycles.push({id:'cycle-other',procedureId:'procedure-2',status:'complete',boundaries:[{id:'ob1',timeUs:130000000},{id:'ob2',timeUs:131000000}],spans:[{id:'os1',kind:'phase',occurrenceId:'oo1',note:''}],occurrences:[{id:'oo1',phaseId:'phase-1',planned:true,resolution:'measured',note:''}],cursor:null,excluded:false,exclusionReason:'',note:''});
  const table=parseCsv(core.buildCsv(p,{type:'time-table',procedureId:'procedure-1',language:'ja'}));
  assert.ok(table[0].includes('工程1 [phase-1] 秒'));assert.ok(table[0].includes('工程1 [phase-2] 秒'));
  const detail=parseCsv(core.buildCsv(p,{type:'intervals',procedureId:'procedure-1',scope:'analysis',language:'ja'}));
  const h=detail[0];assert.ok(detail.some(r=>r[col(h,'cycle_id')]==='cycle-other'&&r[col(h,'procedure_id')]==='procedure-2'));
});
