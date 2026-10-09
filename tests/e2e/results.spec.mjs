import {test,expect} from '@playwright/test';
import {openApp} from '../helpers/app.mjs';
import {makeFixture} from '../helpers/fixtures.mjs';

async function loadFixture(page,id,{replace=false}={}){
  await page.locator('#analysisInput').setInputFiles({name:`${id}.tsd.json`,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(makeFixture(id)))});
  if(replace){await expect(page.locator('#appConfirmDialog')).toBeVisible();await page.locator('#appConfirmOk').click();}
  await expect(page.locator('#resultsWorkspace')).toBeVisible();
}
async function openFixture(page,id='F1'){await openApp(page);await loadFixture(page,id);}

test('results_use_same_summary_as_core_fixture and show transparent denominators',async({page})=>{
  await openFixture(page,'F1');
  await expect(page.locator('#resultRecordedCount')).toHaveText('3');
  await expect(page.locator('#resultIncludedCount')).toHaveText('3');
  await expect(page.locator('#resultOverallMean')).toContainText('39.0');
  await expect(page.locator('#resultOverallMedian')).toContainText('34.0');
  const phase3=page.locator('.phase-stat-card[data-phase-id="phase-3"]');
  await expect(phase3.locator('[data-stat="mean"]')).toContainText('10.0');
  await expect(phase3.locator('[data-stat="n"]')).toContainText('n=3');
  await expect(page.locator('#phaseAverageChart .phase-bar')).toHaveCount(4);
  await expect(page.locator('#timeTableRows > [data-cycle-id]')).toHaveCount(3);
});

test('missing, unobserved, incomplete and excluded records keep their meaning',async({page})=>{
  await openFixture(page,'F2');
  await expect(page.locator('#timeTableRows > [data-cycle-id="cycle-4"] [data-phase-id="phase-3"]')).toContainText('実施なし');
  await loadFixture(page,'F3',{replace:true});
  await expect(page.locator('#timeTableRows > [data-cycle-id="cycle-4"] [data-phase-id="phase-3"]')).toContainText('未観測');
  await expect(page.locator('#timeTableRows > [data-cycle-id="cycle-4"] [data-phase-id="phase-3"]')).toContainText('4.0');
  await loadFixture(page,'F4',{replace:true});
  await expect(page.locator('#resultIncompleteCount')).toHaveText('1');
  await expect(page.locator('#resultOverallMean')).toContainText('39.0');
  await loadFixture(page,'F5',{replace:true});
  await expect(page.locator('#resultIncludedCount')).toHaveText('2');
  await expect(page.locator('#resultExcludedCount')).toHaveText('1');
  await expect(page.locator('#resultOverallMean')).toContainText('33.5');
  await expect(page.locator('#timeTableRows > [data-cycle-id="cycle-3"]')).toContainText('条件が異なる');
});

test('cycle exclusion requires a reason and updates the same summary immediately',async({page})=>{
  await openFixture(page,'F1');
  await page.locator('#resultsCycleSelect').selectOption('cycle-3');
  await page.locator('#resultExclusionToggle').check();
  await page.locator('#applyExclusionButton').click();
  await expect(page.locator('#exclusionError')).toBeVisible();
  await page.locator('#resultExclusionReason').fill('条件が異なる');
  await page.locator('#applyExclusionButton').click();
  await expect(page.locator('#resultIncludedCount')).toHaveText('2');
  await expect(page.locator('#resultOverallMean')).toContainText('33.5');
  await expect(page.locator('#timeTableRows > [data-cycle-id="cycle-3"]')).toContainText('条件が異なる');
  await page.locator('#resultExclusionToggle').uncheck();
  await page.locator('#applyExclusionButton').click();
  await expect(page.locator('#resultIncludedCount')).toHaveText('3');
});

test('zero-result and phone layouts remain readable without page overflow',async({page})=>{
  await page.setViewportSize({width:320,height:740});
  const empty=makeFixture('F1');empty.cycles=[];
  await openApp(page);await page.locator('#analysisInput').setInputFiles({name:'empty.tsd.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(empty))});
  await expect(page.locator('body')).toHaveAttribute('data-current-page','results');
  await expect(page.locator('#resultsEmpty')).toBeVisible();
  await expect(page.locator('#resultOverallMean')).toContainText('—');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
