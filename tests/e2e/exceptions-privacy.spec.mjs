import {test,expect} from '@playwright/test';
import {openApp,selectFixtureVideo,seekVideo} from '../helpers/app.mjs';
for(const variant of ['readable','self-extract'])test(`exception capture, interval editing and export are local: ${variant}`,async({page})=>{
 const requests=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 await openApp(page,variant);
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
 await selectFixtureVideo(page);await page.locator('#startCycleButton').click();await seekVideo(page,.3);
 await page.locator('#exceptionsDetails summary').click();await page.locator('#exceptionNote').fill('<img src=https://example.invalid/should-not-load>');
 await page.locator('#beginInterruptionButton').click();await seekVideo(page,.7);await page.locator('#exceptionReturnButton').click();
 await seekVideo(page,1);await page.locator('#markBoundaryButton').click();await seekVideo(page,1.3);
 await page.locator('#exceptionsDetails summary').click();await page.locator('#beginUnobservedButton').click();await seekVideo(page,1.8);await page.locator('#exceptionReturnButton').click();
 await seekVideo(page,2.2);await page.locator('#finishCycleButton').click();
 await page.locator('#intervalDetails > summary').click();await page.locator('#spanSelect').selectOption({index:0});
 await page.locator('#splitTime').fill('0.1');await page.locator('#splitSpanButton').click();await page.locator('#mergeSpanButton').click();
 await page.locator('#spanKind').selectOption('unobserved');await page.locator('#assignSpanButton').click();await page.locator('#undoButton').click();
 const pending=page.waitForEvent('download');await page.locator('#saveAnalysisButton').click();await pending;
 expect(requests).toEqual([]);expect(errors).toEqual([]);
 expect(await page.evaluate(()=>window.__testCsp)).toEqual([]);expect(await page.evaluate(()=>window.__testNetworkAttempts)).toEqual([]);
});
