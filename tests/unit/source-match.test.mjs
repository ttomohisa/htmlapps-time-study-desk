import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCore} from '../helpers/load-core.mjs';
import {sourceMeta} from '../helpers/fixtures.mjs';

test('source_match_accepts_metadata_with_100ms_duration_tolerance but never claims identity',()=>{
 const core=loadCore();assert.equal(typeof core.matchSource,'function');
 const exact=core.matchSource(sourceMeta,{...sourceMeta});
 assert.deepEqual(JSON.parse(JSON.stringify(exact)),{compatible:true,metadataMatch:true,warnings:[],requiresConfirmation:true});
 const moved=core.matchSource(sourceMeta,{...sourceMeta,name:'copy.mp4',lastModified:999,durationUs:sourceMeta.durationUs-100000});
 assert.equal(moved.compatible,true);assert.equal(moved.metadataMatch,true);assert.equal(moved.requiresConfirmation,true);
 assert.deepEqual([...moved.warnings].sort(),['LAST_MODIFIED_CHANGED','NAME_CHANGED']);
 assert.equal('identical' in moved,false);assert.equal('sameFile' in moved,false);
});

test('source_match_rejects size, dimensions, >100ms duration and a candidate shorter than recorded evidence',()=>{
 const core=loadCore();
 for(const candidate of [
  {...sourceMeta,size:sourceMeta.size+1},
  {...sourceMeta,width:sourceMeta.width+1},
  {...sourceMeta,height:sourceMeta.height+1},
  {...sourceMeta,durationUs:sourceMeta.durationUs-100001}
 ]) assert.equal(core.matchSource(sourceMeta,candidate).compatible,false);
 const short=core.matchSource(sourceMeta,{...sourceMeta,durationUs:sourceMeta.durationUs-100000},sourceMeta.durationUs-50000);
 assert.equal(short.compatible,false);assert.ok(short.warnings.includes('CANDIDATE_TOO_SHORT'));
});
