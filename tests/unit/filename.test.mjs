import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCore} from '../helpers/load-core.mjs';

test('edited_filename_is_used_with_fixed_safe_suffix',()=>{
  const core=loadCore();
  assert.equal(core.sanitizeFilename('../CON-time-table','.csv'),'-CON-time-table.csv');
  assert.equal(core.sanitizeFilename('', '.csv'),'time-study.csv');
  assert.equal(core.sanitizeFilename('CON','.csv'),'CON-file.csv');
  assert.equal(core.sanitizeFilename('report.csv','.csv'),'report.csv');
  assert.equal(core.sanitizeFilename('a/b:c*?d"e<f>g|h','.csv'),'a-b-c--d-e-f-g-h.csv');
});
