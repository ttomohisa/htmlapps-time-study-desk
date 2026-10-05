import {test,expect} from '@playwright/test';
import {openApp,selectFixtureVideo,seekVideo} from '../helpers/app.mjs';
for(const variant of ['readable','self-extract']) test(`repeat, procedure editing and JSON save make no network attempt: ${variant}`,async({page})=>{
 const requests=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 await openApp(page,variant);
 // Observe the additional workflow, after the document/loader has completed.
 page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
 await page.evaluate(()=>{
  window.__testCsp=[];window.__testNetworkAttempts=[];
  for(const name of ['fetch','WebSocket','EventSource'])window[name]=new Proxy(window[name],{
   apply(target,receiver,args){window.__testNetworkAttempts.push(name);return Reflect.apply(target,receiver,args);},
   construct(target,args){window.__testNetworkAttempts.push(name);return Reflect.construct(target,args);}
  });
  const open=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(...args){window.__testNetworkAttempts.push('XHR');return open.apply(this,args);};
  const beacon=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=(...args)=>{window.__testNetworkAttempts.push('beacon');return beacon(...args);};
  document.addEventListener('securitypolicyviolation',e=>window.__testCsp.push(e.violatedDirective));
 });
 await selectFixtureVideo(page);await page.locator('#startCycleButton').click();await seekVideo(page,.4);await page.locator('#markBoundaryButton').click();await seekVideo(page,.8);await page.locator('#finishCycleButton').click();
 await page.locator('.workspace-switch [data-page="measure"]').click();await seekVideo(page,1);await page.locator('#startCycleButton').click();await seekVideo(page,1.4);await page.locator('#markBoundaryButton').click();await seekVideo(page,1.8);await page.locator('#markBoundaryButton').click();
 await page.locator('#editProcedureButton').click();await page.locator('#procedureDraftName').fill('<img src=https://example.invalid/pixel>');await page.locator('#startCondition').fill('literal condition');await page.locator('#saveProcedureButton').click();
 const pending=page.waitForEvent('download');await page.locator('#saveAnalysisButton').click();await pending;
 await expect(page.locator('#procedureConditions')).toContainText('literal condition');expect(requests).toEqual([]);expect(errors).toEqual([]);
 expect(await page.evaluate(()=>window.__testCsp)).toEqual([]);expect(await page.evaluate(()=>window.__testNetworkAttempts)).toEqual([]);
});
