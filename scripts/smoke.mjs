import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
const live=!!process.env.SMOKE_URL,base=(process.env.SMOKE_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const child=live?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173'],{stdio:'ignore'});
try{
 let up=false;
 for(let i=0;i<40;i++){try{up=(await fetch(base)).ok;if(up)break}catch{}await sleep(250)}
 if(!up)throw Error('Preview unavailable');
 for(const [path,type] of [['/','html'],['/calendar','html'],['/rates','html'],['/settings','html'],['/channels','html'],['/manifest.webmanifest','manifest'],['/sw.js','javascript'],['/pwa-192x192.png','image/png'],['/pwa-512x512.png','image/png']]){
  const r=await fetch(base+path);
  if(r.status!==200||!r.headers.get('content-type')?.includes(type))throw Error(path+': HTTP '+r.status);
  if(type==='html'&&!(await r.text()).includes('lang="cs"'))throw Error('Czech HTML missing');
  if(type==='manifest'){const m=await r.json();if(m.lang!=='cs'||m.theme_color!=='#040C09')throw Error('PWA manifest invalid')}
  if(path==='/'&&live&&r.headers.get('x-content-type-options')!=='nosniff')throw Error('Missing security header');
  console.log('PASS',path);
 }
}catch(e){console.error('FAIL',e.message);process.exitCode=1}finally{child?.kill()}
