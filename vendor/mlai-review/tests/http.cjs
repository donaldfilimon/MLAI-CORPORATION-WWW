const {test}=require('node:test');
const assert=require('node:assert/strict');
const {once}=require('node:events');
const {createPreviewServer}=require('../scripts/serve-preview.cjs');
test('real HTTP review routes, no-write policy, and scoped security headers', async t=>{
 const server=createPreviewServer();server.listen(0,'127.0.0.1');await once(server,'listening');
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base=`http://127.0.0.1:${server.address().port}`;
 for(const route of ['/','/docs/','/docs/getting-started/','/brief/','/trust/']){
  const response=await fetch(base+route);assert.equal(response.status,200,route);
  assert.match(response.headers.get('content-security-policy'),/form-action 'none'/);
  assert.match(response.headers.get('content-security-policy'),/script-src 'self' 'sha256-/);
  assert.equal(response.headers.get('x-frame-options'),'DENY');
  assert.equal(response.headers.get('referrer-policy'),'no-referrer');
  const text=await response.text();assert.ok(text.includes('<h1'),route);
 }
 const head=await fetch(base+'/docs/',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
 for(const method of ['POST','PUT','DELETE']) assert.equal((await fetch(base+'/brief/',{method,body:'private draft'})).status,405);
 for(const route of ['/not-a-page/','/package.json','/.env']) assert.equal((await fetch(base+route)).status,404);
 assert.equal((await fetch(base+'/%2e%2e%2fpackage.json')).status,400);
});
