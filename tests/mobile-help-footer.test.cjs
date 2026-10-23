const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../src/index.template.html'),'utf8');
test('phone informational footer only',()=>assert.ok(html.includes('@media (max-width: 600px) { body > footer { display: none; } }')));
test('metadata is unique and final in Help',()=>{const h=html.match(/<dialog id="helpDialog"[^]*?<\/dialog>/)[0];for(const id of ['buildVersion','builtAt','dependencyCount']){assert.ok(h.includes('id="'+id+'"'));assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1);}assert.match(h,/help-build/);});

test("original metadata visibility and final position are preserved",()=>{const h=html.match(/<dialog id="helpDialog"[^]*?<\/dialog>/)[0];assert.match(h,/<\/details><\/section>\s*<\/div><\/dialog>$/);assert.ok(html.includes('body[data-current-page="measure"] .build-section,body[data-current-page="review"] .build-section { display:none; }'));});
