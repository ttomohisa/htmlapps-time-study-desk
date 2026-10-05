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
