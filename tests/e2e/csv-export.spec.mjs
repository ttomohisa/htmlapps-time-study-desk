import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {openApp} from '../helpers/app.mjs';
import {makeFixture} from '../helpers/fixtures.mjs';

async function load(page,id='F2'){
  await openApp(page);
  await page.locator('#analysisInput').setInputFiles({name:`${id}.tsd.json`,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(makeFixture(id)))});
  await expect(page.locator('#resultsWorkspace')).toBeVisible();
}
async function downloadText(page,selector){
  const pending=page.waitForEvent('download');await page.locator(selector).click();const d=await pending;
  return {download:d,text:await readFile(await d.path(),'utf8')};
}

test('CSV three views download one file each with edited safe basename and preserved states',async({page})=>{
  await load(page,'F2');await page.locator('#outputFilename').fill('../CON');
  let count=0;page.on('download',()=>count++);
  const table=await downloadText(page,'#exportTimeTableCsvButton');
  expect(table.download.suggestedFilename()).toBe('-CON-time-table.csv');
  expect(table.text.charCodeAt(0)).toBe(0xfeff);expect(table.text).toContain('\r\n');
  expect(table.text).toContain('"工程3 [phase-3] 秒"');expect(table.text).toContain('"実施なし"');
  await page.waitForTimeout(100);expect(count).toBe(1);

  const summary=await downloadText(page,'#exportSummaryCsvButton');
  expect(summary.download.suggestedFilename()).toBe('-CON-summary.csv');
  expect(summary.text).toContain('"phase-3"');expect(summary.text).toContain('"実施なし件数"');

  const detail=await downloadText(page,'#exportIntervalsCsvButton');
  expect(detail.download.suggestedFilename()).toBe('-CON-intervals.csv');
  expect(detail.text).toContain('"row_type","procedure_id","cycle_id"');
  expect(detail.text).toContain('"occurrence-status"');expect(detail.text).toContain('"between-cycles"');
  expect(count).toBe(3);
});

test('English CSV headings follow the selected language and dangerous text remains literal',async({page})=>{
  const p=makeFixture('F1');p.procedures[0].label='=SUM(A1:A2)';
  await openApp(page);await page.locator('#analysisInput').setInputFiles({name:'danger.tsd.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});
  await page.locator('#languageButton').click();
  const table=await downloadText(page,'#exportTimeTableCsvButton');
  expect(table.text).toContain('"Procedure ID"');expect(table.text).toContain('"\'=SUM(A1:A2)"');
  await page.setViewportSize({width:320,height:740});await page.locator('.mobile-tabs [data-page="results"]').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
