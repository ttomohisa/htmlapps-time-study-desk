export const sourceMeta = {name:'packing.mp4',size:1024,lastModified:123,durationUs:60000000,width:640,height:360};
export function createTestContext(language = 'ja') {
  let id = 0;
  return {makeId: () => `id-${++id}`,nowIso: () => '2026-10-05T00:00:00.000Z',language};
}
export function setupProject(core) {
  const context = createTestContext();
  return {context,project:core.createProject(sourceMeta,context)};
}
export function firstCycle(core, finish = true) {
  const {context,project} = setupProject(core);
  let current = core.applyCommand(project,{type:'startCycle',timeUs:0,procedureId:null},context).project;
  const cycleId = current.cycles[0].id;
  for (const seconds of [6,18,28]) {
    const result = core.applyCommand(current,{type:'markBoundary',cycleId,timeUs:seconds * 1000000},context);
    if (!result.ok) throw new Error(JSON.stringify(result));
    current = result.project;
  }
  if (finish) current = core.applyCommand(current,{type:'finishCycle',cycleId,timeUs:34000000},context).project;
  return {context,project:current,cycleId};
}


const fixtureSource = {name:'fixture.mp4',size:2048,lastModified:456,durationUs:300000000,width:640,height:360};
const us = seconds => Math.round(seconds * 1000000);
const clone = value => JSON.parse(JSON.stringify(value));
function fixtureBase(id='F1') {
  const phases = [1,2,3,4].map(n => ({id:`phase-${n}`,label:`工程${n}`,kind:'operation',archived:false}));
  const procedure = {id:'procedure-1',label:'手順1',phaseIds:phases.map(p=>p.id),startCondition:'開始条件',endCondition:'終了条件',createdAt:'2026-10-05T00:00:00.000Z'};
  return {format:'time-study-desk',schemaVersion:1,appVersion:'0.5.0',projectId:`fixture-${id.toLowerCase()}`,createdAt:'2026-10-05T00:00:00.000Z',updatedAt:'2026-10-05T00:00:00.000Z',title:`Fixture ${id}`,note:'',source:clone(fixtureSource),phases,procedures:[procedure],cycles:[],settings:{language:'ja',selectedProcedureId:'procedure-1',outputBaseName:`fixture-${id.toLowerCase()}`}};
}
function makeCycle(number,start,end,parts,{excluded=false,reason='',status='complete',cursor=null}={}) {
  const occurrences=[1,2,3,4].map(n=>({id:`f${number}-o${n}`,phaseId:`phase-${n}`,planned:true,resolution:'measured',note:''}));
  const boundaries=[start],spans=[];
  for(const [duration,kind,occurrenceNumber,note=''] of parts) {
    const occurrence=occurrenceNumber==null?null:occurrences[occurrenceNumber-1];
    spans.push({id:`f${number}-s${spans.length+1}`,kind,occurrenceId:occurrence?.id??null,note});
    boundaries.push(boundaries.at(-1)+duration);
    if(kind==='unobserved' && occurrence) occurrence.resolution='unobserved';
  }
  const used=new Set(spans.filter(s=>s.occurrenceId && s.kind!=='interruption').map(s=>s.occurrenceId));
  for(const o of occurrences) if(!used.has(o.id)) o.resolution='not-performed';
  return {id:`cycle-${number}`,procedureId:'procedure-1',status,boundaries:boundaries.map((value,index)=>({id:`f${number}-b${index+1}`,timeUs:us(value)})),spans,occurrences,cursor,excluded,exclusionReason:reason,note:''};
}
function f1Project() {
  const project=fixtureBase('F1');
  project.cycles=[
    makeCycle(1,0,34,[[6,'phase',1],[12,'phase',2],[10,'phase',3],[6,'phase',4]]),
    makeCycle(2,39,72,[[5,'phase',1],[11,'phase',2],[10,'phase',3],[7,'phase',4]]),
    makeCycle(3,77,127,[[7,'phase',1],[12,'phase',2],[5,'phase',3],[15,'interruption',3,'材料待ち'],[5,'phase',3],[6,'phase',4]])
  ];
  return project;
}
export function makeFixture(id) {
  if(id==='F1') return f1Project();
  const project=f1Project(); project.projectId=`fixture-${id.toLowerCase()}`; project.title=`Fixture ${id}`; project.settings.outputBaseName=`fixture-${id.toLowerCase()}`;
  if(id==='F2') {
    const c=makeCycle(4,132,158,[[7,'phase',1],[12,'phase',2],[7,'phase',4]]); c.occurrences[2].resolution='not-performed'; project.cycles.push(c); return project;
  }
  if(id==='F3') {
    const c=makeCycle(4,163,198,[[7,'phase',1],[12,'phase',2],[4,'phase',3],[5,'unobserved',3,'画角外'],[7,'phase',4]]); c.occurrences[2].resolution='unobserved'; project.cycles.push(c); return project;
  }
  if(id==='F4') {
    const occurrences=[1,2,3,4].map(n=>({id:`f4-o${n}`,phaseId:`phase-${n}`,planned:true,resolution:n===1?'measured':'pending',note:''}));
    const c={id:'cycle-4',procedureId:'procedure-1',status:'incomplete',boundaries:[{id:'f4-b1',timeUs:us(203)},{id:'f4-b2',timeUs:us(209)},{id:'f4-b3',timeUs:us(221)}],spans:[{id:'f4-s1',kind:'phase',occurrenceId:'f4-o1',note:''},{id:'f4-s2',kind:'phase',occurrenceId:'f4-o2',note:''}],occurrences,cursor:{kind:'phase',occurrenceId:'f4-o2',note:''},excluded:false,exclusionReason:'',note:''};
    project.cycles.push(c); return project;
  }
  if(id==='F5') { project.cycles[2].excluded=true; project.cycles[2].exclusionReason='条件が異なる'; return project; }
  if(id==='F6') { project.cycles[0].boundaries[1].timeUs=1234568; return project; }
  throw new Error(`Unknown fixture: ${id}`);
}
