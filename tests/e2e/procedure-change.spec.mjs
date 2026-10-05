import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {openApp,selectFixtureVideo,seekVideo} from '../helpers/app.mjs';
async function twoSteps(page){await page.locator('#startCycleButton').click();await seekVideo(page,.4);await page.locator('#markBoundaryButton').click();await seekVideo(page,.8);await page.locator('#finishCycleButton').click();}
for(const width of [320,1360]) test(`procedure changes preserve old conditions, names and recording: ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await openApp(page);await selectFixtureVideo(page);await twoSteps(page);
 if(width<600) await page.locator('.mobile-tabs [data-page="results"]').click();
 await page.locator('#editProcedureButton').click();await expect(page.locator('#procedureDialog')).toBeVisible();
 await page.locator('#procedureDraftName').fill('条件B');await page.locator('#startCondition').fill('箱に触れたら開始');await page.locator('#endCondition').fill('手を離したら終了');
 await page.locator('#procedureOrder [data-action="down"]').first().click();await page.locator('#saveProcedureButton').click();
 await expect(page.locator('#procedureSelect option')).toHaveCount(2);
 const pending=page.waitForEvent('download');await page.locator('#saveAnalysisButton').click();const d=await pending;const p=JSON.parse(await readFile(await d.path(),'utf8'));
 expect(p.procedures[0].startCondition).toBe('');expect(p.procedures[1].startCondition).toBe('箱に触れたら開始');expect(p.procedures[1].phaseIds).toEqual([...p.procedures[0].phaseIds].reverse());expect(p.cycles[0].procedureId).toBe(p.procedures[0].id);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('predefined names create one undoable procedure, dialog cancellation changes no records',async({page})=>{
 await openApp(page);await selectFixtureVideo(page);await page.locator('#predefineButton').click();await page.locator('#presetNames').fill('準備\n組立\n確認');await page.locator('#saveProcedureButton').click();
 await expect(page.locator('#procedureSelect option')).toHaveCount(1);await page.locator('#undoButton').click();await expect(page.locator('#procedureSelect option')).toHaveCount(0);await page.locator('#redoButton').click();
 await page.locator('#editProcedureButton').click();await page.locator('#procedureDraftName').fill('破棄する名前');await page.locator('#cancelProcedureButton').click();await expect(page.locator('#procedureSelect')).not.toContainText('破棄する名前');
});
test('successful video replacement closes a stale procedure draft; cancellation preserves it',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await openApp(page);await selectFixtureVideo(page);await twoSteps(page);await page.locator('#editProcedureButton').click();await page.locator('#procedureDraftName').fill('まだ保存しない手順');
 await selectFixtureVideo(page,'portrait.mp4');await page.locator('#appConfirmCancel').click();await expect(page.locator('#procedureDialog')).toBeVisible();await expect(page.locator('#procedureDraftName')).toHaveValue('まだ保存しない手順');
 await selectFixtureVideo(page,'portrait.mp4');await page.locator('#appConfirmOk').click();await expect(page.locator('#sourceName')).toHaveText('portrait.mp4');await expect(page.locator('#procedureDialog')).not.toBeVisible();
 await expect(page.locator('#cycleList .cycle-row')).toHaveCount(0);expect(errors).toEqual([]);
});
