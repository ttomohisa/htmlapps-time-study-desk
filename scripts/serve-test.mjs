import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
const root=resolve('dist'),port=4173,host='127.0.0.1';
const types={'.html':'text/html; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,`http://${host}:${port}`).pathname);
  const target=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(target!==root && !target.startsWith(root+sep))throw new Error('outside root');
  const body=await readFile(target);res.writeHead(200,{'content-type':types[extname(target)]||'application/octet-stream','cache-control':'no-store'});res.end(body);
 }catch{res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('Not found');}
}).listen(port,host,()=>process.stdout.write(`TSD test server http://${host}:${port}\n`));
