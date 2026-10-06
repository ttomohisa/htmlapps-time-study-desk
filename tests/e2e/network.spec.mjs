import { test, expect } from '@playwright/test';
import { openApp, selectFixtureVideo, seekVideo } from '../helpers/app.mjs';

async function installNetworkProbe(page) {
  await page.evaluate(() => {
    window.__networkAttempts=[]; window.__cspViolations=[];
    for (const name of ['fetch','WebSocket','EventSource']) {
      const original=window[name]; if(!original) continue;
      window[name]=new Proxy(original,{
        apply(target,receiver,args){window.__networkAttempts.push(name);return Reflect.apply(target,receiver,args);},
        construct(target,args){window.__networkAttempts.push(name);return Reflect.construct(target,args);}
      });
    }
    const open=XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open=function(...args){window.__networkAttempts.push('XHR');return open.apply(this,args);};
    const beacon=navigator.sendBeacon?.bind(navigator); if(beacon) navigator.sendBeacon=(...args)=>{window.__networkAttempts.push('beacon');return beacon(...args);};
    document.addEventListener('securitypolicyviolation',event=>window.__cspViolations.push(event.violatedDirective));
  });
}

for (const variant of ['readable','self-extract']) {
  test(`full local workflow makes no runtime network attempt: ${variant}`, async ({page}) => {
    const http=[]; page.on('request',r=>{ if(/^https?:/.test(r.url())) http.push(r.url()); });
    await openApp(page,variant); await installNetworkProbe(page);
    await selectFixtureVideo(page); await page.locator('#startCycleButton').click();
    await seekVideo(page,.6); await page.locator('#markBoundaryButton').click();
    await seekVideo(page,1.2); await page.locator('#finishCycleButton').click();
    await page.locator('.workspace-switch [data-page="results"]').click();
    const download=page.waitForEvent('download'); await page.locator('#saveAnalysisButton').click(); await download;
    expect(http).toEqual([]);
    expect(await page.evaluate(()=>window.__networkAttempts)).toEqual([]);
    expect(await page.evaluate(()=>window.__cspViolations)).toEqual([]);
  });
}
