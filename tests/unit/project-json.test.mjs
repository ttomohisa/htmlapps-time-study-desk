import test from 'node:test';
import assert from 'node:assert/strict';
import {loadCore} from '../helpers/load-core.mjs';
import {firstCycle,setupProject} from '../helpers/fixtures.mjs';
test('json_keeps_integer_boundaries_and_no_video including unfinished cursor',()=>{
 const core=loadCore(); assert.equal(typeof core.serializeProject,'function');
 for (const finish of [true,false]) {
  const {project}=firstCycle(core,finish), text=core.serializeProject(project,'0.2.0'), parsed=JSON.parse(text);
  assert.equal(parsed.format,'time-study-desk');assert.equal(parsed.schemaVersion,1);assert.equal(parsed.appVersion,'0.2.0');
  assert.equal(core.validateProject(parsed).ok,true); assert.equal(parsed.cycles[0].boundaries.at(-1).timeUs,finish?34000000:28000000);
  assert.equal(parsed.cycles[0].spans.length,finish?4:3);
  assert.doesNotMatch(text,/blob:|"video"|"undo"|"currentTime"|"playbackRate"/);
  assert.equal(parsed.cycles[0].cursor===null,finish);
 }
});
test('schema validates references, states, unknown keys, unique IDs and ordered boundaries',()=>{
 const core=loadCore(); assert.equal(typeof core.validateProject,'function');
 const {project}=firstCycle(core);
 const corruptions=[
  p=>p.schemaVersion=2, p=>p.source.url='blob:private', p=>p.cycles[0].boundaries[1].timeUs=0,
  p=>p.cycles[0].boundaries[1].timeUs=-1,p=>p.cycles[0].spans[0].occurrenceId='missing',
  p=>p.phases[1].id=p.phases[0].id,p=>p.cycles[0].occurrences[0].resolution='pending',
  p=>p.procedures[0].phaseIds.reverse(),p=>p.cycles[0].excluded=true,
  p=>p.cycles[0].spans.pop(),p=>Object.defineProperty(p,'__proto__',{value:{polluted:true},enumerable:true}),
  p=>p.settings.selectedProcedureId='missing',p=>p.phases[0].label='',p=>p.title='a'.repeat(161)
 ];
 for(const corrupt of corruptions) {const p=JSON.parse(JSON.stringify(project));corrupt(p); assert.equal(core.validateProject(p).ok,false,corrupt.toString());}
 assert.equal({}.polluted,undefined);assert.equal(core.validateProject(null).ok,false);
});
test('direct boundary seconds have up to six decimals, never coerce invalid input',()=>{
 const core=loadCore(); assert.equal(typeof core.parseTimeInput,'function');
 assert.equal(core.parseTimeInput('1.234568').value,1234568);
 assert.equal(core.parseTimeInput(' 7 ').value,7000000);
 for(const input of ['', '-1','1e3','1.2345678','NaN','Infinity','1,2']) assert.equal(core.parseTimeInput(input).ok,false);
});
test('the serialized file uses the same 10 MiB byte budget as validation',()=>{
 const core=loadCore();const {project}=firstCycle(core); const template=project.cycles[0];
 project.source.durationUs=86400000000; project.cycles=[];
 for(let i=0;i<1000;i++) {
  const c=JSON.parse(JSON.stringify(template));c.id=`cycle-${i}`;c.note='n'.repeat(1000);
  const ids=new Map();c.occurrences.forEach((o,j)=>{const old=o.id;o.id=`o-${i}-${j}`;ids.set(old,o.id);o.note='n'.repeat(1000);});
  c.boundaries.forEach((b,j)=>{b.id=`b-${i}-${j}`;b.timeUs+=i*60000000;});
  c.spans.forEach((s,j)=>{s.id=`s-${i}-${j}`;s.occurrenceId=ids.get(s.occurrenceId);s.note='n'.repeat(1000);});project.cycles.push(c);
 }
 assert.equal(core.validateProject(project).ok,true);
 assert.ok(new TextEncoder().encode(core.serializeProject(project,'0.2.0')).length<=10*1024*1024,'accepted analysis must remain within the actual exported byte limit');
});
test('source modification time may predate the epoch without becoming a video boundary',()=>{
 const core=loadCore();const {project}=firstCycle(core);project.source.lastModified=-1000;
 assert.equal(core.validateProject(project).ok,true);
 assert.equal(JSON.parse(core.serializeProject(project,'0.2.0')).source.lastModified,-1000);
});
